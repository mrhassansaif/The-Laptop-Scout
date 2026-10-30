import { BROWSER_SUPPORT_MESSAGE_ID } from "@/lib/browser-support";

/**
 * Loads the classic ES5 bootstrap from /public before React can recover from
 * unsupported-browser chunk parse failures. A blocking src script is used
 * instead of next/script beforeInteractive because inline beforeInteractive
 * content was serialized into the RSC payload rather than emitted as an early
 * classic script in the document head.
 */
export function BrowserSupportBootstrap() {
  return (
    // Blocking classic script (no async/defer): must stay ES5 in public/.
    // eslint-disable-next-line @next/next/no-sync-scripts -- intentional: unsupported browsers must run this before/around failing module chunks
    <script src="/browser-support.js" />
  );
}

export function BrowserSupportMessage() {
  return (
    <div
      id={BROWSER_SUPPORT_MESSAGE_ID}
      hidden
      aria-hidden="true"
      role="alert"
      className="fixed inset-0 z-[9999] flex min-h-dvh items-center justify-center bg-background px-4"
    >
      <div className="w-full max-w-md rounded-2xl border border-border/70 bg-card px-5 py-5 text-sm shadow-sm">
        <div className="space-y-2">
          <p className="font-medium text-foreground">Browser update needed</p>
          <p className="leading-6 text-muted-foreground">
            LaptopScout needs a current browser to load. Next.js 16 requires
            Microsoft Edge 111+, Chrome 111+, Firefox 111+, or Safari 16.4+.
            Update Edge (or switch to an up-to-date Chrome), then reload this
            page.
          </p>
          <p className="leading-6 text-muted-foreground">
            If this browser is already up to date, do a hard refresh or clear
            cached site data for this site and try again.
          </p>
        </div>
      </div>
    </div>
  );
}
