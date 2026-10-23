import "server-only";

import { FieldValue, type DocumentReference } from "firebase-admin/firestore";

import { getAdminAuth, getAdminFirestore } from "@/lib/firebase/admin";
import {
  ADMIN_COLLECTION,
  SESSION_CONTROL_COLLECTION,
  SESSION_CONTROL_DOCUMENT,
  authTimeCutoffFromServerSeconds,
  forwardAuthTimeCutoff,
  isAdminRole,
  isAuthTimeRevoked,
  isBulkRefreshRevocationEnabled,
  mapPool,
  nextSessionVersion,
  parseSessionControl,
  readAuthTimeSeconds,
  readInteger,
} from "@/lib/session/revocation";

const REFRESH_TOKEN_CONCURRENCY = 5;
const LIST_USERS_PAGE_SIZE = 1000;

export class SessionAlreadyRevokedError extends Error {
  constructor() {
    super("This session has ended. Sign in again.");
    this.name = "SessionAlreadyRevokedError";
  }
}

export class AdminAccessRequiredError extends Error {
  constructor() {
    super("Admin access required.");
    this.name = "AdminAccessRequiredError";
  }
}

export type RefreshTokenReport =
  | { attempted: false }
  | {
      attempted: true;
      revoked: number;
      failed: number;
      completed: boolean;
    };

export type ForceLogoutSuccess = {
  ok: true;
  sessionVersion: number;
  authTimeCutoff: number;
  refreshTokens: RefreshTokenReport;
};

function readTimestampSeconds(value: unknown): number | null {
  if (!value || typeof value !== "object" || !("seconds" in value)) {
    return null;
  }

  return readInteger((value as { seconds: unknown }).seconds);
}

async function readTrustedServerSeconds(
  controlRef: DocumentReference,
): Promise<number> {
  await controlRef.set(
    { timeAnchor: FieldValue.serverTimestamp() },
    { merge: true },
  );

  const anchored = await controlRef.get();
  const serverSeconds = readTimestampSeconds(anchored.get("timeAnchor"));

  if (serverSeconds === null) {
    throw new Error("Trusted server time was not available.");
  }

  return serverSeconds;
}

async function publishCutoff(
  authTime: number,
  proposedCutoff: number,
): Promise<{ sessionVersion: number; authTimeCutoff: number }> {
  const controlRef = getAdminFirestore()
    .collection(SESSION_CONTROL_COLLECTION)
    .doc(SESSION_CONTROL_DOCUMENT);

  return getAdminFirestore().runTransaction(async (transaction) => {
    const snapshot = await transaction.get(controlRef);
    const previous = parseSessionControl(snapshot.data());

    if (isAuthTimeRevoked(authTime, previous.authTimeCutoff)) {
      throw new SessionAlreadyRevokedError();
    }

    const authTimeCutoff = forwardAuthTimeCutoff(
      previous.authTimeCutoff,
      proposedCutoff,
    );
    const sessionVersion = nextSessionVersion(previous.sessionVersion);

    transaction.set(
      controlRef,
      {
        authTimeCutoff,
        sessionVersion,
        updatedAt: FieldValue.serverTimestamp(),
        timeAnchor: FieldValue.delete(),
      },
      { merge: true },
    );

    return { sessionVersion, authTimeCutoff };
  });
}

async function revokeProjectRefreshTokens(): Promise<RefreshTokenReport> {
  const auth = getAdminAuth();
  let revoked = 0;
  let failed = 0;
  let pageToken: string | undefined;
  let completed = true;

  try {
    do {
      const page = await auth.listUsers(LIST_USERS_PAGE_SIZE, pageToken);
      const outcome = await mapPool(page.users, REFRESH_TOKEN_CONCURRENCY, async (user) => {
        await auth.revokeRefreshTokens(user.uid);
      });

      revoked += outcome.succeeded;
      failed += outcome.failed;
      pageToken = page.pageToken;
    } while (pageToken);
  } catch {
    completed = false;
  }

  return {
    attempted: true,
    revoked,
    failed,
    completed,
  };
}

/**
 * Verifies the caller's ID token, confirms admin/{uid}.role === "admin",
 * rejects an already-revoked session, then publishes a new global cutoff.
 * The UID and role always come from the verified token and Admin SDK reads.
 */
export async function forceLogoutAllSessions(
  idToken: string,
): Promise<ForceLogoutSuccess> {
  const decoded = await getAdminAuth().verifyIdToken(idToken, true);

  const authTime = readAuthTimeSeconds(decoded.auth_time);
  if (authTime === null) {
    throw new SessionAlreadyRevokedError();
  }

  const adminSnapshot = await getAdminFirestore()
    .collection(ADMIN_COLLECTION)
    .doc(decoded.uid)
    .get();

  if (!adminSnapshot.exists || !isAdminRole(adminSnapshot.get("role"))) {
    throw new AdminAccessRequiredError();
  }

  const controlRef = getAdminFirestore()
    .collection(SESSION_CONTROL_COLLECTION)
    .doc(SESSION_CONTROL_DOCUMENT);
  const currentControl = parseSessionControl((await controlRef.get()).data());

  if (isAuthTimeRevoked(authTime, currentControl.authTimeCutoff)) {
    throw new SessionAlreadyRevokedError();
  }

  const serverSeconds = await readTrustedServerSeconds(controlRef);
  const proposedCutoff = authTimeCutoffFromServerSeconds(serverSeconds);
  const published = await publishCutoff(authTime, proposedCutoff);

  const refreshTokens = isBulkRefreshRevocationEnabled(
    process.env.FIREBASE_ADMIN_REVOKE_REFRESH_TOKENS,
  )
    ? await revokeProjectRefreshTokens()
    : { attempted: false as const };

  return {
    ok: true,
    sessionVersion: published.sessionVersion,
    authTimeCutoff: published.authTimeCutoff,
    refreshTokens,
  };
}
