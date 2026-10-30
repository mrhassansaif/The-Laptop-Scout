import fs from "fs";
import test from "node:test";
import assert from "node:assert/strict";

const code = fs.readFileSync("public/browser-support.js", "utf8");

function runWithUa(ua) {
  let supported = null;
  const document = {
    documentElement: {
      setAttribute(key, value) {
        if (key === "data-browser-supported") supported = value;
      },
      getAttribute(key) {
        return key === "data-browser-supported" ? supported : null;
      },
    },
    readyState: "complete",
    getElementById() {
      return {
        hidden: true,
        setAttribute() {},
      };
    },
    addEventListener() {},
  };
  const window = { addEventListener() {} };
  const navigator = { userAgent: ua };
  const fn = new Function("document", "window", "navigator", `${code}\nreturn document.documentElement.getAttribute("data-browser-supported");`);
  return fn(document, window, navigator);
}

test("legacy EdgeHTML is blocked", () => {
  assert.equal(
    runWithUa(
      "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 Edge/18.19041",
    ),
    "0",
  );
});

test("Chromium Edge 79 is allowed", () => {
  assert.equal(
    runWithUa(
      "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.0 Safari/537.36 Edg/79.0.309.0",
    ),
    "1",
  );
});

test("Chrome 78 is blocked", () => {
  assert.equal(
    runWithUa(
      "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36",
    ),
    "0",
  );
});

test("Chrome 79 is allowed", () => {
  assert.equal(
    runWithUa(
      "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.0 Safari/537.36",
    ),
    "1",
  );
});

test("IE11 is blocked", () => {
  assert.equal(
    runWithUa("Mozilla/5.0 (Windows NT 10.0; Trident/7.0; rv:11.0) like Gecko"),
    "0",
  );
});
