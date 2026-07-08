/**
 * Dev-only check: confirms Next.js loaded Firebase env vars at build/start time.
 * Run: node scripts/verify-firebase-env.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const ENV_LOCAL = resolve(ROOT, ".env.local");

const REQUIRED = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
  "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
  "NEXT_PUBLIC_FIREBASE_APP_ID",
];

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }

  const lines = readFileSync(filePath, "utf8").split(/\r?\n/);
  const values = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    values[key] = value;
  }

  return values;
}

console.log("Firebase env verification\n");

if (!existsSync(ENV_LOCAL)) {
  console.error("✗ .env.local not found at:", ENV_LOCAL);
  process.exit(1);
}

console.log("✓ .env.local exists");

const env = parseEnvFile(ENV_LOCAL);
const missing = REQUIRED.filter((key) => !env[key]?.trim());

if (missing.length > 0) {
  console.error("\n✗ Missing or empty variables in .env.local:");
  for (const key of missing) {
    console.error("  -", key);
  }
  process.exit(1);
}

console.log("\n✓ All required variables present in .env.local:");
for (const key of REQUIRED) {
  const value = env[key];
  const preview =
    key.includes("API_KEY") || key.includes("APP_ID")
      ? `${value.slice(0, 8)}…`
      : value;
  console.log(`  ${key}=${preview}`);
}

console.log(
  "\nNote: restart `npm run dev` after changing .env.local so Next.js reloads env vars.",
);
