import { test } from "node:test";
import assert from "node:assert/strict";
import { canEditClubPost, canDeletePost } from "./postPermissions.js";

test("server flags independently grant update and delete permissions without writer IDs", () => {
  for (const canUpdate of [true, false]) {
    for (const canDelete of [true, false]) {
      const post = { canUpdate, canDelete };
      assert.equal(canEditClubPost(post, { userId: 12 }, "token"), canUpdate);
      assert.equal(canDeletePost(post, { userId: 12 }, "token"), canDelete);
    }
  }
});

test("matching IDs do not override missing, false or non-boolean flags", () => {
  for (const value of [undefined, null, false, "true", "false", 1, {}]) {
    const post = { writerId: 12, canUpdate: value, canDelete: value };
    assert.equal(canEditClubPost(post, { userId: 12 }, "token"), false);
    assert.equal(canDeletePost(post, { userId: 12 }, "token"), false);
  }
});

test("authentication is required and comments use their own delete flag", () => {
  for (const check of [canEditClubPost, canDeletePost]) {
    assert.equal(check({ canUpdate: true, canDelete: true }, null, "token"), false);
    assert.equal(check({ canUpdate: true, canDelete: true }, {}, null), false);
    assert.equal(check(null, {}, "token"), false);
  }
  assert.equal(canDeletePost({ commentId: 1, canDelete: true }, {}, "token"), true);
  assert.equal(canDeletePost({ commentId: 2, canDelete: false }, {}, "token"), false);
});
