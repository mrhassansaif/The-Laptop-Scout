/**
 * Minimal CDP smoke test for older Chromiums that modern puppeteer cannot launch.
 * Starts Chrome with --remote-debugging-port, connects via raw WebSocket CDP.
 */
import { spawn } from "child_process";
import fs from "fs";
import http from "http";
import net from "net";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

const chromePath = arg("chrome");
const url = arg("url", "http://127.0.0.1:3000/");
const label = arg("label", "chromium");

if (!chromePath || !fs.existsSync(chromePath)) {
  console.error("Missing --chrome");
  process.exit(2);
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.listen(0, "127.0.0.1", () => {
      const { port } = s.address();
      s.close(() => resolve(port));
    });
    s.on("error", reject);
  });
}

function fetchJson(target) {
  return new Promise((resolve, reject) => {
    http
      .get(target, (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

async function waitForJson(target, attempts = 40) {
  let last;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fetchJson(target);
    } catch (e) {
      last = e;
      await new Promise((r) => setTimeout(r, 250));
    }
  }
  throw last || new Error("timeout waiting for " + target);
}

const port = await getFreePort();
const userDataDir = path.join(
  process.cwd(),
  ".browser-binaries",
  `tmp-profile-${label}-${port}`,
);
fs.mkdirSync(userDataDir, { recursive: true });

const child = spawn(
  chromePath,
  [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "--headless",
    "--disable-software-rasterizer",
    "about:blank",
  ],
  { stdio: ["ignore", "pipe", "pipe"] },
);

let stderr = "";
child.stderr.on("data", (d) => {
  stderr += String(d);
});

try {
  const version = await waitForJson(`http://127.0.0.1:${port}/json/version`);
  const wsUrl = version.webSocketDebuggerUrl;
  // Prefer ws package if present via puppeteer-core dependency
  const WebSocket = require("ws");

  const ws = new WebSocket(wsUrl);
  await new Promise((resolve, reject) => {
    ws.once("open", resolve);
    ws.once("error", reject);
  });

  let id = 0;
  const pending = new Map();
  const events = [];
  ws.on("message", (raw) => {
    const msg = JSON.parse(String(raw));
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(JSON.stringify(msg.error)));
      else resolve(msg.result);
      return;
    }
    if (msg.method) events.push(msg);
  });

  function send(method, params = {}, sessionId) {
    const messageId = ++id;
    const payload = { id: messageId, method, params };
    if (sessionId) payload.sessionId = sessionId;
    ws.send(JSON.stringify(payload));
    return new Promise((resolve, reject) => {
      pending.set(messageId, { resolve, reject });
      setTimeout(() => {
        if (pending.has(messageId)) {
          pending.delete(messageId);
          reject(new Error(`CDP timeout: ${method}`));
        }
      }, 30000);
    });
  }

  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", {
    targetId,
    flatten: true,
  });

  await send("Runtime.enable", {}, sessionId);
  await send("Page.enable", {}, sessionId);

  const exceptionTexts = [];
  const consoleTexts = [];
  ws.on("message", (raw) => {
    const msg = JSON.parse(String(raw));
    if (msg.sessionId !== sessionId) return;
    if (msg.method === "Runtime.exceptionThrown") {
      const desc =
        msg.params?.exceptionDetails?.exception?.description ||
        msg.params?.exceptionDetails?.text ||
        "exception";
      exceptionTexts.push(desc);
    }
    if (msg.method === "Runtime.consoleAPICalled" && msg.params?.type === "error") {
      consoleTexts.push(
        (msg.params.args || []).map((a) => a.value || a.description || "").join(" "),
      );
    }
  });

  await send("Page.navigate", { url }, sessionId);
  await new Promise((r) => setTimeout(r, 4000));

  const evalResult = await send(
    "Runtime.evaluate",
    {
      expression: `({
        supported: document.documentElement.getAttribute('data-browser-supported'),
        overlayHidden: !!(document.getElementById('browser-support-message')||{}).hidden,
        overlayDisplay: (document.getElementById('browser-support-message') ? getComputedStyle(document.getElementById('browser-support-message')).display : null),
        hasUpdate: /Browser update needed/.test(document.body && document.body.innerText || ''),
        hasWelcome: /Welcome back/.test(document.body && document.body.innerText || ''),
        hasLoading: /Loading workspace/.test(document.body && document.body.innerText || ''),
        hasFirebaseMissing: /Firebase environment variables are missing/.test(document.body && document.body.innerText || ''),
        title: document.title,
        ua: navigator.userAgent
      })`,
      returnByValue: true,
      awaitPromise: true,
    },
    sessionId,
  );

  const syntaxErrors = exceptionTexts.filter((t) =>
    /Unexpected token|SyntaxError|Invalid or unexpected token/i.test(t),
  );

  const result = {
    label,
    browser: version.Browser || version["User-Agent"],
    state: evalResult.result?.value || evalResult,
    syntaxErrors,
    exceptionTexts: exceptionTexts.slice(0, 20),
    consoleTexts: consoleTexts.slice(0, 20),
    engineParsesAppJs: syntaxErrors.length === 0,
  };
  console.log(JSON.stringify(result, null, 2));
  ws.close();
} catch (e) {
  console.log(
    JSON.stringify(
      {
        label,
        error: String(e && e.message ? e.message : e),
        stderr: stderr.slice(-2000),
      },
      null,
      2,
    ),
  );
  process.exitCode = 1;
} finally {
  child.kill();
}
