const PRANK_SESSION_PREFIX = "laptopscout-prank-login";

function sessionKey(userId: string): string {
  return `${PRANK_SESSION_PREFIX}:${userId}`;
}

export function hasPrankPlayedThisLogin(userId: string): boolean {
  if (typeof window === "undefined") {
    return true;
  }

  return sessionStorage.getItem(sessionKey(userId)) === "1";
}

export function markPrankPlayedThisLogin(userId: string) {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.setItem(sessionKey(userId), "1");
}

export function clearPrankLoginSession(userId: string) {
  if (typeof window === "undefined") {
    return;
  }

  sessionStorage.removeItem(sessionKey(userId));
}

/** Wipe prank flags on logout so the next login can trigger again. */
export function clearAllPrankLoginSessions() {
  if (typeof window === "undefined") {
    return;
  }

  const keysToRemove: string[] = [];

  for (let index = 0; index < sessionStorage.length; index += 1) {
    const key = sessionStorage.key(index);
    if (key?.startsWith(`${PRANK_SESSION_PREFIX}:`)) {
      keysToRemove.push(key);
    }
  }

  for (const key of keysToRemove) {
    sessionStorage.removeItem(key);
  }
}
