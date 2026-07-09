/**
 * Login emails that trigger the dashboard prank on every visit after sign-in.
 * Add or remove addresses here — no other users are affected.
 */
export const PRANK_WHITELIST_EMAILS = [
  "bilal@gaylord.com",
  "m.bilalgpt1@gmail.com",
  "m.bilalsami157@gmail.com",
  "budget.judge@laptopscout.local",
] as const;

export function isPrankWhitelistEmail(
  email: string | null | undefined,
): email is string {
  if (!email?.trim()) {
    return false;
  }

  const normalized = email.trim().toLowerCase();
  return PRANK_WHITELIST_EMAILS.some(
    (entry) => entry.toLowerCase() === normalized,
  );
}
