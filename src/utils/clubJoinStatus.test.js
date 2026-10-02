import { test } from "node:test";
import assert from "node:assert/strict";
import { getClubJoinState } from "./clubJoinStatus.js";

test("pending and joined block duplicate requests, rejected and withdrawn allow reapplication", () => {
  assert.equal(getClubJoinState("PENDING").pending, true);
  assert.equal(getClubJoinState("PENDING").blocked, true);
  assert.equal(getClubJoinState("JOINED").joined, true);
  assert.equal(getClubJoinState("JOINED").blocked, true);
  for (const status of ["REJECTED", "WITHDRAWN"]) {
    assert.equal(getClubJoinState(status).canReapply, true);
    assert.equal(getClubJoinState(status).blocked, false);
  }
  assert.equal(getClubJoinState(null).blocked, false);
  assert.equal(getClubJoinState("UNRECOGNIZED").blocked, true);
  assert.equal(getClubJoinState("PENDING", true).pending, false);
  assert.equal(getClubJoinState("REJECTED", true).blocked, true);
});
