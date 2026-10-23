import {
  doc,
  getDocFromServer,
  onSnapshot,
  type FirestoreError,
} from "firebase/firestore";
import type { User } from "firebase/auth";

import { getFirebaseFirestore } from "@/lib/firebase/firestore";
import {
  SESSION_CONTROL_COLLECTION,
  SESSION_CONTROL_DOCUMENT,
  isAuthTimeRevoked,
  parseSessionControl,
  readAuthTimeSeconds,
  type SessionControlSnapshot,
} from "@/lib/session/revocation";

export type SessionCheck =
  | { status: "valid"; authTime: number }
  | { status: "revoked" }
  | { status: "unverified"; reason: "offline" | "unknown" };

const OFFLINE_FIRESTORE_CODES = new Set([
  "unavailable",
  "deadline-exceeded",
  "cancelled",
]);

const OFFLINE_AUTH_CODES = new Set([
  "auth/network-request-failed",
  "auth/internal-error",
]);

export function firebaseErrorCode(error: unknown): string | null {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code: unknown }).code;
    return typeof code === "string" ? code : null;
  }

  return null;
}

export function isPermissionDenied(error: unknown): boolean {
  return firebaseErrorCode(error) === "permission-denied";
}

function isOfflineError(error: unknown): boolean {
  const code = firebaseErrorCode(error);

  if (!code) {
    return false;
  }

  return OFFLINE_FIRESTORE_CODES.has(code) || OFFLINE_AUTH_CODES.has(code);
}

export function sessionControlDocument() {
  return doc(
    getFirebaseFirestore(),
    SESSION_CONTROL_COLLECTION,
    SESSION_CONTROL_DOCUMENT,
  );
}

export async function readSessionControlFromServer(): Promise<SessionControlSnapshot | null> {
  const snapshot = await getDocFromServer(sessionControlDocument());

  if (!snapshot.exists()) {
    return null;
  }

  return parseSessionControl(snapshot.data());
}

export function subscribeSessionControl(
  onChange: (control: SessionControlSnapshot | null) => void,
  onError: (error: FirestoreError) => void,
) {
  return onSnapshot(
    sessionControlDocument(),
    (snapshot) => {
      onChange(snapshot.exists() ? parseSessionControl(snapshot.data()) : null);
    },
    onError,
  );
}

/**
 * Checks the authoritative cutoff once. Callers must not treat a running
 * listener as a substitute for this read.
 */
export async function verifyCurrentSession(user: User): Promise<SessionCheck> {
  let authTime: number | null;

  try {
    const token = await user.getIdTokenResult();
    authTime = readAuthTimeSeconds(token.claims.auth_time);
  } catch (error) {
    if (isOfflineError(error)) {
      return { status: "unverified", reason: "offline" };
    }

    return { status: "revoked" };
  }

  try {
    const control = await readSessionControlFromServer();
    const cutoff = control?.authTimeCutoff ?? null;

    if (authTime === null) {
      return cutoff === null
        ? { status: "unverified", reason: "unknown" }
        : { status: "revoked" };
    }

    if (isAuthTimeRevoked(authTime, cutoff)) {
      return { status: "revoked" };
    }

    return { status: "valid", authTime };
  } catch (error) {
    if (isOfflineError(error)) {
      return { status: "unverified", reason: "offline" };
    }

    // A missing rules publish denies this read even for a healthy login.
    // Don't trap those users in a sign-out loop. Firestore rules still reject
    // laptop reads and writes once the cutoff rules are live.
    if (isPermissionDenied(error) && authTime !== null) {
      return { status: "valid", authTime };
    }

    return { status: "unverified", reason: "unknown" };
  }
}
