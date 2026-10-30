/**
 * Verified client baseline after Browserslist downlevel for this app.
 *
 * Next.js 16 defaults to Edge/Chrome 111+, but production bundles are compiled
 * with the package.json browserslist below. Real Chromium 79 / 93 / 110 engines
 * parsed the emitted chunks without SyntaxError in local smoke tests.
 *
 * Legacy EdgeHTML (`Edge/` UA, not Chromium `Edg/`) remains unsupported.
 */
export const APP_BROWSER_BASELINE = {
  chrome: 79,
  /** Chromium-based Edge (`Edg/…` in the user agent). */
  edge: 79,
  firefox: 78,
  safari: { major: 14, minor: 0 },
} as const;

/** @deprecated Use APP_BROWSER_BASELINE — kept as an alias for older imports. */
export const NEXT16_BROWSER_BASELINE = APP_BROWSER_BASELINE;

export const BROWSER_SUPPORT_MESSAGE_ID = "browser-support-message";
export const BROWSER_SUPPORTED_ATTR = "data-browser-supported";

/** True when the document was flagged unsupported by the pre-React bootstrap. */
export function isBrowserMarkedUnsupported(): boolean {
  if (typeof document === "undefined") {
    return false;
  }

  return document.documentElement.getAttribute(BROWSER_SUPPORTED_ATTR) === "0";
}
