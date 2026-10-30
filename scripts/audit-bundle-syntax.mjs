import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const dir = ".next/static/chunks";
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".js"));

const patterns = [
  ["staticBlock", /static\s*\{/g],
  ["logicalOrAssign", /\|\|=/g],
  ["logicalAndAssign", /&&=/g],
  ["nullishAssign", /\?\?=/g],
  ["optionalChain", /\?\./g],
  ["nullishCoalesce", /\?\?(?!=)/g],
  ["privateField", /#[A-Za-z_]/g],
  ["globalThis", /\bglobalThis\b/g],
  ["importMeta", /\bimport\.meta\b/g],
  ["bigintLiteral", /\b\d+n\b/g],
  ["numericSeparator", /\d_\d/g],
];

console.log("=== Pattern scan ===");
for (const file of files) {
  const c = fs.readFileSync(path.join(dir, file), "utf8");
  const hits = [];
  for (const [name, re] of patterns) {
    const m = c.match(re);
    if (m) hits.push(`${name}:${m.length}`);
  }
  if (hits.length) console.log(file, hits.join(", "));
}

let acorn;
try {
  acorn = require(
    path.join(
      process.env.TEMP || process.env.TMP,
      "cursor-sandbox-cache",
      "999ff955b70c38ec361c5d2d02994638",
      "npm",
      "_npx",
      "6d33ea6b84e4298d",
      "node_modules",
      "acorn",
    ),
  );
} catch {
  // fall through to npx-installed check later
}

async function checkWithAcorn(ecmaVersion) {
  if (!acorn) return;
  let fail = 0;
  for (const file of files) {
    const c = fs.readFileSync(path.join(dir, file), "utf8");
    try {
      acorn.parse(c, { ecmaVersion, sourceType: "module", allowHashBang: true });
    } catch (e) {
      fail += 1;
      const idx = Number(String(e.message).match(/:(\d+)\)$/)?.[1] || 0);
      const sample = c.slice(Math.max(0, idx - 40), idx + 60);
      console.log(`FAIL ecma${ecmaVersion}`, file, e.message, JSON.stringify(sample));
      if (fail >= 5) break;
    }
  }
  if (!fail) console.log(`PASS acorn ecma${ecmaVersion} (${files.length} files)`);
}

if (acorn) {
  console.log("=== Acorn checks ===");
  await checkWithAcorn(2020);
  await checkWithAcorn(2021);
  await checkWithAcorn(2022);
}
