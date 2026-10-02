import { test } from "node:test";
import assert from "node:assert/strict";
import { hasPendingClubJoin, recordClubJoin, parseJoinHistory } from "./clubJoinHistory.js";

test("successful applications persist per account and cancellation clears only that club", () => {
  const data = new Map();
  const previousStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  const previousWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
  } });
  Object.defineProperty(globalThis, "window", { configurable: true, value: new EventTarget() });
  try {
    assert.equal(hasPendingClubJoin(1, 10), false);
    recordClubJoin(1, 10, true);
    recordClubJoin(1, 20, true);
    assert.equal(hasPendingClubJoin(1, "10"), true);
    assert.equal(hasPendingClubJoin(2, 10), false);
    assert.equal(hasPendingClubJoin(null, 10), false);
    recordClubJoin(1, 10, false);
    assert.equal(hasPendingClubJoin(1, 10), false);
    assert.equal(hasPendingClubJoin(1, 20), true);
    assert.deepEqual(parseJoinHistory("invalid"), []);
    assert.deepEqual(parseJoinHistory("{}"), []);
  } finally {
    if (previousStorage) Object.defineProperty(globalThis, "localStorage", previousStorage);
    else delete globalThis.localStorage;
    if (previousWindow) Object.defineProperty(globalThis, "window", previousWindow);
    else delete globalThis.window;
  }
});
