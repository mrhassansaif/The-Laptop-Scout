/**
 * Classic ES5 bootstrap for Next.js 16's Edge 111+ / Chrome 111+ baseline.
 * Keep this file free of modern syntax so unsupported browsers can still run it.
 */
(function () {
  var d = document.documentElement;
  var id = "browser-support-message";
  var edgeMin = 111;
  var chromeMin = 111;
  var firefoxMin = 111;
  var safariMajor = 16;
  var safariMinor = 4;

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

  function featureOk() {
    try {
      Function('"use strict";class A{static{}}');
      Function('"use strict";class B{x=1;static y=2}');
      Function('"use strict";var a=0;a||=1');
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
