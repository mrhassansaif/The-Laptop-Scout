import { SESSION_NOTICE_STORAGE_KEY } from "@/lib/session/revocation";

/**
 * Remembers a short sign-in message after a forced logout.
 * This is display state only. Access control lives in Firestore rules.
 */
export function subscribeToSessionNotice() {
  return () => {};
}

export function getServerSessionNotice(): string | null {
  return null;
}

export function readSessionNotice(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return sessionStorage.getItem(SESSION_NOTICE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function rememberSessionNotice(message: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.setItem(SESSION_NOTICE_STORAGE_KEY, message);
  } catch {
    // Ignore storage failures. The in-memory notice still renders.
  }
}

export function clearSessionNotice() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.removeItem(SESSION_NOTICE_STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
}
