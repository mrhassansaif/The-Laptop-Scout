/**
 * Classic ES5 bootstrap for TheLaptopScout's verified Chromium Edge 79+ baseline.
 * Keep this file free of modern syntax so unsupported browsers can still run it.
 *
 * Distinguishes:
 * - Chromium Edge (`Edg/`)
 * - Legacy EdgeHTML (`Edge/` without `Edg/`) — unsupported
 * - IE / ancient browsers — unsupported
 */
(function () {
  var d = document.documentElement;
  var id = "browser-support-message";
  var edgeMin = 79;
  var chromeMin = 79;
  var firefoxMin = 78;
  var safariMajor = 14;
  var safariMinor = 0;

  function reveal() {
    var el = document.getElementById(id);
    if (!el) return;
    el.hidden = false;
    el.setAttribute("aria-hidden", "false");
  }

  function show() {
    d.setAttribute("data-browser-supported", "0");
    // Script runs from <head> before the message node exists.
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", reveal);
    } else {
      reveal();
    }
  }

  function major(ua, name) {
    var m = ua.match(new RegExp(name + "/(\\d+)"));
    return m ? +m[1] : null;
  }

  function safariVersion(ua) {
    var m = ua.match(new RegExp("Version/(\\d+)\\.(\\d+)"));
    return m ? [+m[1], +m[2]] : null;
  }

  function isLegacyEdge(ua) {
    // EdgeHTML: "Edge/18" etc. Chromium Edge uses "Edg/79"+.
    return ua.indexOf("Edge/") !== -1 && ua.indexOf("Edg/") === -1;
  }

  function isInternetExplorer(ua) {
    return ua.indexOf("MSIE ") !== -1 || ua.indexOf("Trident/") !== -1;
  }

  /**
   * Light capability check aligned with the downleveled production target
   * (approx ES2019 / Chromium 79). Do NOT require ES2022 static blocks or
   * logical assignment — Browserslist already removes those from app chunks.
   */
  function featureOk() {
    try {
      if (typeof Promise === "undefined") return false;
      if (typeof globalThis === "undefined") return false;
      Function(
        '"use strict";class C{constructor(x){this.x=x}}async function f(){return await 1}',
      );
      return true;
    } catch (e) {
      if (
        e &&
        (e.name === "EvalError" ||
          String(e.message || "").indexOf("eval") !== -1)
      ) {
        return true;
      }
      return false;
    }
  }

  function versionOk() {
    var ua = navigator.userAgent || "";
    if (isInternetExplorer(ua) || isLegacyEdge(ua)) return false;

    var edge = major(ua, "Edg");
    if (edge !== null) return edge >= edgeMin;

    var chrome = major(ua, "Chrome");
    if (ua.indexOf("Firefox/") !== -1) {
      var ff = major(ua, "Firefox");
      return ff !== null && ff >= firefoxMin;
    }
    if (ua.indexOf("Safari/") !== -1 && chrome === null) {
      var sv = safariVersion(ua);
      if (!sv) return true;
      return (
        sv[0] > safariMajor ||
        (sv[0] === safariMajor && sv[1] >= safariMinor)
      );
    }
    if (chrome !== null) return chrome >= chromeMin;
    // Unknown UA: allow through and rely on featureOk + SyntaxError listener.
    return true;
  }

  if (!featureOk() || !versionOk()) {
    show();
  } else {
    d.setAttribute("data-browser-supported", "1");
  }

  window.addEventListener(
    "error",
    function (ev) {
      var msg = (ev && ev.message) || "";
      var file = (ev && ev.filename) || "";
      if (file.indexOf("/_next/static/chunks/") === -1) return;
      if (
        msg.indexOf("Unexpected token") !== -1 ||
        msg.indexOf("SyntaxError") !== -1 ||
        (ev && ev.error && ev.error.name === "SyntaxError")
      ) {
        show();
      }
    },
    true,
  );
})();
