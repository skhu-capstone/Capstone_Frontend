import { test } from "node:test";
import assert from "node:assert/strict";
import { mutateRecruitment } from "./recruitmentService.js";

test("both recruitment types send authenticated PATCH and DELETE requests and preserve failures", async () => {
  const oldFetch = globalThis.fetch;
  const oldStorage = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
  Object.defineProperty(globalThis, "localStorage", { configurable: true, value: { getItem: () => "test-token" } });
  try {
    for (const [type, resource] of [["club", "club-collaborations"], ["project", "project-recruitments"]]) {
      for (const method of ["PATCH", "DELETE"]) {
        const payload = { title: "Updated", content: "Text", imageUrl: "", deadline: "2026-10-02" };
        globalThis.fetch = async (url, options) => {
          assert.equal(url, `/api/${resource}/7`);
          assert.equal(options.method, method);
          assert.equal(options.headers.Authorization, "Bearer test-token");
          assert.equal(options.body, method === "PATCH" ? JSON.stringify(payload) : undefined);
          return { ok: true, status: 200, json: async () => ({ success: true, data: { title: "Updated" } }) };
        };
        assert.deepEqual(await mutateRecruitment(type, 7, method, payload), { title: "Updated" });
      }
    }
    for (const [status, message] of [[401, /로그인/], [403, /작성자/], [500, /요청에 실패/]]) {
      globalThis.fetch = async () => ({ ok: false, status, json: async () => { throw new Error("not JSON"); } });
      await assert.rejects(mutateRecruitment("club", 7, "DELETE"), message);
    }
    globalThis.fetch = async () => ({ ok: true, status: 200, json: async () => ({ success: false, message: "Rejected" }) });
    await assert.rejects(mutateRecruitment("project", 7, "PATCH", {}), /Rejected/);
  } finally {
    globalThis.fetch = oldFetch;
    if (oldStorage) Object.defineProperty(globalThis, "localStorage", oldStorage);
    else delete globalThis.localStorage;
  }
});
