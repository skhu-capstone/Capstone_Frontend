import { test } from "node:test";
import assert from "node:assert/strict";
import { isOwnRecruitment } from "./recruitmentOwnership.js";

test("identifies the writer across numeric and string IDs", () => {
  assert.equal(isOwnRecruitment({ writerId: 12 }, { userId: "12" }), true);
  assert.equal(isOwnRecruitment({ writerId: "12" }, { id: 12 }), true);
  assert.equal(isOwnRecruitment({ writerId: 13, canUpdate: true }, { userId: 12 }), false);
});

test("uses strict author permission flags when writer ID is absent", () => {
  assert.equal(isOwnRecruitment({ canUpdate: true }, { id: 12 }), true);
  assert.equal(isOwnRecruitment({ canDelete: true }, { id: 12 }), true);
  for (const flag of [false, undefined, "true"]) {
    assert.equal(isOwnRecruitment({ canUpdate: flag, canDelete: flag }, { id: 12 }), false);
  }
});

test("does not infer ownership from names or missing user and post data", () => {
  assert.equal(isOwnRecruitment({ writerName: "동명이인" }, { name: "동명이인" }), false);
  assert.equal(isOwnRecruitment({ canUpdate: true }, null), false);
  assert.equal(isOwnRecruitment(null, { id: 12 }), false);
  assert.equal(isOwnRecruitment({}, {}), false);
});
