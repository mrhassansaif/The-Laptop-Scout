/**
 * Shared session-revocation decisions.
 *
 * Firebase ID tokens carry `auth_time` as whole Unix seconds. The server stores
 * `authTimeCutoff` in the same unit. A session is revoked when
 * `auth_time <= authTimeCutoff`. The cutoff is written as
 * (trusted server second - 1) so someone who signs in during the revocation
 * second is not stuck behind that one-second resolution.
 */

export const SESSION_CONTROL_COLLECTION = "system";
export const SESSION_CONTROL_DOCUMENT = "sessionControl";
export const ADMIN_COLLECTION = "admin";
export const ADMIN_ROLE = "admin";

export const SESSION_REVOKED_NOTICE =
  "Your session ended. Sign in again to continue.";

export const FORCE_LOGOUT_SUCCESS_NOTICE =
  "All sessions were ended. Sign in again to continue.";

export const FORCE_LOGOUT_PARTIAL_NOTICE =
  "All sessions were ended in this app, but some Firebase refresh tokens could not be revoked. Sign in again to continue.";

export const SESSION_NOTICE_STORAGE_KEY = "laptopscout-session-notice";

export type SessionControlSnapshot = {
  authTimeCutoff: number | null;
  sessionVersion: number | null;
};

export function readInteger(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isInteger(value)) {
    return null;
  }

  return value;
}

export function readAuthTimeSeconds(value: unknown): number | null {
  return readInteger(value);
}

export function parseSessionControl(data: unknown): SessionControlSnapshot {
  if (!data || typeof data !== "object") {
    return { authTimeCutoff: null, sessionVersion: null };
  }

  const record = data as Record<string, unknown>;

  return {
    authTimeCutoff: readInteger(record.authTimeCutoff),
    sessionVersion: readInteger(record.sessionVersion),
  };
}

/**
 * Missing cutoff means revocation has never been published.
 * Missing auth_time while a cutoff exists fails closed.
 */
export function isAuthTimeRevoked(
  authTime: number | null,
  authTimeCutoff: number | null,
): boolean {
  if (authTimeCutoff === null) {
    return false;
  }

  if (authTime === null) {
    return true;
  }

  return authTime <= authTimeCutoff;
}

export function authTimeCutoffFromServerSeconds(serverSeconds: number): number {
  if (!Number.isInteger(serverSeconds) || serverSeconds < 1) {
    throw new Error("Trusted server time was not available.");
  }

  return serverSeconds - 1;
}

export function forwardAuthTimeCutoff(existing: unknown, nextCutoff: number): number {
  const current = readInteger(existing);

  if (current === null) {
    return nextCutoff;
  }

  return Math.max(current, nextCutoff);
}

export function nextSessionVersion(current: unknown): number {
  const version = readInteger(current);

  if (version === null || version < 0) {
    return 1;
  }

  return version + 1;
}

export function isAdminRole(role: unknown): boolean {
  return role === ADMIN_ROLE;
}

/**
 * Bulk refresh-token revocation signs people out of every app in this Firebase
 * project. It stays off unless the operator explicitly opts in.
 */
export function isBulkRefreshRevocationEnabled(value: string | undefined): boolean {
  return value?.trim().toLowerCase() === "true";
}

export function readBearerToken(header: string | null): string | null {
  if (!header) {
    return null;
  }

  const match = /^Bearer\s+(\S+)$/i.exec(header.trim());
  return match?.[1] ?? null;
}

export async function mapPool<T>(
  items: readonly T[],
  concurrency: number,
  worker: (item: T) => Promise<void>,
): Promise<{ succeeded: number; failed: number }> {
  if (items.length === 0) {
    return { succeeded: 0, failed: 0 };
  }

  const requested = Number.isFinite(concurrency) ? Math.floor(concurrency) : 1;
  const limit = Math.max(1, Math.min(requested, items.length));
  let cursor = 0;
  let succeeded = 0;
  let failed = 0;

  async function run(): Promise<void> {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      const item = items[index];

      if (item === undefined) {
        continue;
      }

      try {
        await worker(item);
        succeeded += 1;
      } catch {
        failed += 1;
      }
    }
  }

  await Promise.all(Array.from({ length: limit }, () => run()));

  return { succeeded, failed };
}
