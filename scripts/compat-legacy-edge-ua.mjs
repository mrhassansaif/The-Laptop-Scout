import { spawn } from "child_process";
import fs from "fs";
import http from "http";
import net from "net";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const WebSocket = require("ws");

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
        res.on("end", () => resolve(JSON.parse(data)));
      })
      .on("error", reject);
  });
}

const port = await getFreePort();
const userDataDir = ".browser-binaries/tmp-legacy-edge-ua";
fs.mkdirSync(userDataDir, { recursive: true });
const chrome =
  ".browser-binaries/chromium/win64-1083080/chrome-win/chrome.exe";

const child = spawn(
  chrome,
  [
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    "--headless",
    "--disable-gpu",
    "about:blank",
  ],
  { stdio: "ignore" },
);

try {
  let version;
  for (let i = 0; i < 40; i++) {
    try {
      version = await fetchJson(`http://127.0.0.1:${port}/json/version`);
      break;
    } catch {
      await new Promise((r) => setTimeout(r, 250));
    }
  }
  const ws = new WebSocket(version.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.once("open", resolve);
    ws.once("error", reject);
  });

  let id = 0;
  const pending = new Map();
  ws.on("message", (raw) => {
    const msg = JSON.parse(String(raw));
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(new Error(JSON.stringify(msg.error)));
      else resolve(msg.result);
    }
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
          reject(new Error(`timeout ${method}`));
        }
      }, 20000);
    });
  }

  const { targetId } = await send("Target.createTarget", { url: "about:blank" });
  const { sessionId } = await send("Target.attachToTarget", {
    targetId,
    flatten: true,
  });
  await send("Runtime.enable", {}, sessionId);
  await send("Page.enable", {}, sessionId);
  await send(
    "Network.setUserAgentOverride",
    {
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 Edge/18.19041",
    },
    sessionId,
  );
  await send("Page.navigate", { url: "http://127.0.0.1:3000/?legacy=1" }, sessionId);
  await new Promise((r) => setTimeout(r, 3000));
  const out = await send(
    "Runtime.evaluate",
    {
      expression: `({
        ua: navigator.userAgent,
        supported: document.documentElement.getAttribute('data-browser-supported'),
        hasUpdate: /Browser update needed/.test(document.body.innerText || ''),
        overlayDisplay: getComputedStyle(document.getElementById('browser-support-message')).display
      })`,
      returnByValue: true,
    },
    sessionId,
  );
  console.log(JSON.stringify(out.result.value, null, 2));
  ws.close();
} finally {
  child.kill();
}
