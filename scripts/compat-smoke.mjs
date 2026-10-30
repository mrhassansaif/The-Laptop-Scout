/**
 * Load the production app in a real Chromium binary and report parse/runtime errors.
 *
 * Usage:
 *   node scripts/compat-smoke.mjs --chrome <chrome.exe> --url http://localhost:3000/ --label chromium-79
 */
import fs from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const puppeteer = require("puppeteer-core");

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

const chromePath = arg("chrome");
const url = arg("url", "http://localhost:3000/");
const label = arg("label", "chromium");

if (!chromePath || !fs.existsSync(chromePath)) {
  console.error("Missing --chrome path");
  process.exit(2);
}

const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
});

const page = await browser.newPage();
const pageErrors = [];
const consoleErrors = [];
const failedRequests = [];

page.on("pageerror", (err) => {
  pageErrors.push(String(err && err.message ? err.message : err));
});
page.on("console", (msg) => {
  if (msg.type() === "error") consoleErrors.push(msg.text());
});
page.on("requestfailed", (req) => {
  failedRequests.push(`${req.url()} :: ${req.failure()?.errorText || "failed"}`);
});

let navError = null;
try {
  await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
  await new Promise((r) => setTimeout(r, 1500));
} catch (e) {
  navError = String(e && e.message ? e.message : e);
}

const state = await page.evaluate(() => {
  const overlay = document.getElementById("browser-support-message");
  const bodyText = document.body ? document.body.innerText : "";
  return {
    title: document.title,
    supportedAttr: document.documentElement.getAttribute("data-browser-supported"),
    overlayHidden: overlay ? overlay.hidden : null,
    overlayDisplay: overlay ? getComputedStyle(overlay).display : null,
    hasLoadingWorkspace: /Loading workspace/.test(bodyText),
    hasBrowserUpdateNeeded: /Browser update needed/.test(bodyText),
    hasWelcomeBack: /Welcome back/.test(bodyText),
    hasFirebaseMissing: /Firebase environment variables are missing/.test(bodyText),
    userAgent: navigator.userAgent,
  };
});

await browser.close();

const syntaxErrors = pageErrors.filter(
  (m) => /Unexpected token|SyntaxError|Invalid or unexpected token/i.test(m),
);

const result = {
  label,
  chromePath,
  navError,
  syntaxErrors,
  pageErrors,
  consoleErrors: consoleErrors.slice(0, 15),
  failedRequests: failedRequests.slice(0, 10),
  state,
  // Engine can parse/run app JS even if our version gate shows the overlay.
  engineParsesAppJs: syntaxErrors.length === 0 && !navError,
};

console.log(JSON.stringify(result, null, 2));
process.exit(0);
