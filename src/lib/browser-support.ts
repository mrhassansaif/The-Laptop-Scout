/**
 * Next.js 16's documented client baseline (also the default Browserslist target).
 * @see https://nextjs.org/docs/architecture/supported-browsers
 */
export const NEXT16_BROWSER_BASELINE = {
  chrome: 111,
  edge: 111,
  firefox: 111,
  safari: { major: 16, minor: 4 },
} as const;

export const BROWSER_SUPPORT_MESSAGE_ID = "browser-support-message";
export const BROWSER_SUPPORTED_ATTR = "data-browser-supported";

/** True when the document was flagged unsupported by the pre-React bootstrap. */
export function isBrowserMarkedUnsupported(): boolean {
  if (typeof document === "undefined") {
    return false;
  }

  return document.documentElement.getAttribute(BROWSER_SUPPORTED_ATTR) === "0";
}
