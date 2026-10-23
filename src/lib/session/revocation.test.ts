import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import {
  authTimeCutoffFromServerSeconds,
  forwardAuthTimeCutoff,
  isAdminRole,
  isAuthTimeRevoked,
  isBulkRefreshRevocationEnabled,
  mapPool,
  nextSessionVersion,
  parseSessionControl,
  readBearerToken,
} from "./revocation.ts";

test("missing cutoff leaves an authenticated session valid", () => {
  assert.equal(isAuthTimeRevoked(1_700_000_000, null), false);
  assert.deepEqual(parseSessionControl(undefined), {
    authTimeCutoff: null,
    sessionVersion: null,
  });
});

test("auth_time at or before the cutoff is revoked", () => {
  assert.equal(isAuthTimeRevoked(100, 100), true);
  assert.equal(isAuthTimeRevoked(99, 100), true);
  assert.equal(isAuthTimeRevoked(101, 100), false);
});

test("a cutoff with no auth_time fails closed", () => {
  assert.equal(isAuthTimeRevoked(null, 100), true);
});

test("same-second sign-in is not stuck revoked", () => {
  const serverSeconds = 1_700_000_100;
  const cutoff = authTimeCutoffFromServerSeconds(serverSeconds);

  assert.equal(cutoff, serverSeconds - 1);
  assert.equal(isAuthTimeRevoked(serverSeconds, cutoff), false);
  assert.equal(isAuthTimeRevoked(serverSeconds - 1, cutoff), true);
});

test("server time must be a positive whole second", () => {
  assert.throws(() => authTimeCutoffFromServerSeconds(0));
  assert.throws(() => authTimeCutoffFromServerSeconds(1.5));
});

test("cutoff only moves forward and version only increases", () => {
  assert.equal(forwardAuthTimeCutoff(undefined, 50), 50);
  assert.equal(forwardAuthTimeCutoff(40, 50), 50);
  assert.equal(forwardAuthTimeCutoff(60, 50), 60);
  assert.equal(forwardAuthTimeCutoff(10.2, 50), 50);
  assert.equal(nextSessionVersion(undefined), 1);
  assert.equal(nextSessionVersion(4), 5);
  assert.equal(nextSessionVersion(-1), 1);
});

test("admin role must be exactly admin", () => {
  assert.equal(isAdminRole("admin"), true);
  assert.equal(isAdminRole("Admin"), false);
  assert.equal(isAdminRole("owner"), false);
  assert.equal(isAdminRole(null), false);
});

test("bulk refresh revocation is opt-in", () => {
  assert.equal(isBulkRefreshRevocationEnabled("true"), true);
  assert.equal(isBulkRefreshRevocationEnabled(" TRUE "), true);
  assert.equal(isBulkRefreshRevocationEnabled("false"), false);
  assert.equal(isBulkRefreshRevocationEnabled("1"), false);
  assert.equal(isBulkRefreshRevocationEnabled(undefined), false);
});

test("bearer parser ignores missing and malformed headers", () => {
  assert.equal(readBearerToken(null), null);
  assert.equal(readBearerToken("Bearer"), null);
  assert.equal(readBearerToken("Bearer a b"), null);
  assert.equal(readBearerToken("Basic abc"), null);
  assert.equal(readBearerToken("Bearer token.with.dots"), "token.with.dots");
});

test("session control parsing ignores non-integers and extra fields", () => {
  assert.deepEqual(
    parseSessionControl({
      authTimeCutoff: 80,
      sessionVersion: 3,
      timeAnchor: { seconds: 81 },
    }),
    { authTimeCutoff: 80, sessionVersion: 3 },
  );
  assert.deepEqual(parseSessionControl({ authTimeCutoff: 80.5, sessionVersion: "2" }), {
    authTimeCutoff: null,
    sessionVersion: null,
  });
});

test("mapPool limits concurrency and counts failures", async () => {
  let active = 0;
  let maxActive = 0;

  const outcome = await mapPool([1, 2, 3, 4, 5], 2, async (item) => {
    active += 1;
    maxActive = Math.max(maxActive, active);
    await new Promise((resolve) => setTimeout(resolve, 15));
    active -= 1;

    if (item === 3) {
      throw new Error("fail");
    }
  });

  assert.equal(outcome.succeeded, 4);
  assert.equal(outcome.failed, 1);
  assert.ok(maxActive <= 2);
  assert.equal(active, 0);
});

test("firestore rules enforce the cutoff without client admin writes", () => {
  const rules = readFileSync(new URL("../../../firestore.rules", import.meta.url), "utf8");

  assert.match(rules, /function hasValidSession\(\)/);
  assert.match(rules, /request\.auth\.token\.auth_time > data\.authTimeCutoff/);
  assert.match(rules, /authTimeCutoff is number/);
  assert.match(rules, /match \/laptops\/\{docId\}/);
  assert.match(rules, /match \/system\/sessionControl/);
  assert.match(rules, /match \/admin\/\{uid\}/);
  assert.match(rules, /allow read: if request\.auth != null;/);
  assert.match(rules, /allow write: if false;/);
  assert.match(rules, /allow create, update, delete: if false;/);
  assert.match(rules, /request\.auth\.uid == uid/);
  assert.match(rules, /!exists\(sessionControlPath\(\)\)/);
  assert.doesNotMatch(rules, /@/);
  assert.doesNotMatch(rules, /NEXT_PUBLIC_/);
  assert.doesNotMatch(rules, /allow write: if request\.auth != null/);
});
