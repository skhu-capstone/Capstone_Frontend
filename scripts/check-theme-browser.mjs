/* global process, Buffer */
// Optional smoke check: npm run build && node scripts/check-theme-browser.mjs
// Uses Node 22's WebSocket and an installed Chrome/Edge; no test packages required.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";

const root = fileURLToPath(new URL("../", import.meta.url));
const dist = path.join(root, "dist");
const executable = process.env.THEME_TEST_BROWSER || [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome", "/usr/bin/chromium",
].find(existsSync);
assert.ok(executable, "Set THEME_TEST_BROWSER to an installed Chromium browser.");
assert.ok(existsSync(path.join(dist, "index.html")), "Run npm run build first.");

const profileDirectory = mkdtempSync(path.join(tmpdir(), "capstone-theme-browser-"));
const server = createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const requestedFile = path.resolve(dist, `.${pathname}`);
  const allowed = requestedFile.startsWith(`${dist}${path.sep}`);
  const file = allowed && existsSync(requestedFile) && path.extname(requestedFile)
    ? requestedFile : path.join(dist, "index.html");
  const mime = { ".html": "text/html", ".js": "application/javascript", ".css": "text/css", ".png": "image/png", ".svg": "image/svg+xml" };
  response.writeHead(200, { "Content-Type": mime[path.extname(file)] || "application/octet-stream" });
  response.end(readFileSync(file));
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = spawn(executable, [
  "--headless=new", "--remote-debugging-port=0", `--user-data-dir=${profileDirectory}`,
  "--no-first-run", "--no-default-browser-check", "--disable-background-networking",
  "--disable-component-update", "--disable-extensions", "--disable-sync", "about:blank",
], { windowsHide: true, stdio: "ignore" });

let socket;
try {
  const portFile = path.join(profileDirectory, "DevToolsActivePort");
  let port;
  for (let attempt = 0; !port && attempt < 100; attempt++) {
    try { port = readFileSync(portFile, "utf8").split("\n")[0]; } catch { /* Chrome may still be writing. */ }
    if (!port) await delay(100);
  }
  assert.ok(port, "Browser did not start its debugging endpoint.");
  const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  socket = new WebSocket(targets.find((target) => target.type === "page").webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener("open", resolve); socket.addEventListener("error", reject); });
  let nextId = 0;
  const pending = new Map();
  const runtimeErrors = [];
  let apiMode = "normal";
  let avatarProfileRequests = 0;
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });

  const user = { userId: 1, name: "테마 테스트", email: "theme@example.test", isVerified: true };
  const club = { clubId: 1, clubName: "개발 동아리", category: "IT", shortDescription: "함께 프로젝트를 만드는 동아리", detailDescription: "다크모드 테스트 동아리", memberCount: 2, role: "PRESIDENT" };
  const coffeeChatProfile = { headline: "프론트엔드 개발에 관심 있어요", interestTopics: "React, UI 디자인", introduction: "함께 이야기해요", isPublic: true };
  const avatarImage = `data:image/svg+xml;base64,${Buffer.from(readFileSync(path.join(root, "src/assets/default-profile.svg"))).toString("base64")}`;
  const post = { postId: 1, clubId: 1, clubName: club.clubName, title: "테마 테스트 게시글", content: "다크모드에서도 편하게 읽을 수 있는 내용입니다.", writerId: 1, writerName: user.name, createdAt: "2026-10-09T09:00:00", imageUrls: [], comments: [], likeCount: 2, canUpdate: true, canDelete: true };
  const paged = (content) => ({ content, totalPages: 20, totalElements: content.length, number: 0 });
  const profiles = [2, 3, 4].map((id) => ({ userId: id, coffeeChatProfileId: id, name: `학생 ${id}`, headline: coffeeChatProfile.headline, interestTopics: coffeeChatProfile.interestTopics, clubs: [club.clubName] }));
  function fixture(url) {
    const pathname = new URL(url).pathname;
    if (pathname.endsWith("/api/main")) return { recommendedCoffeeChats: profiles, clubFeeds: [post], clubCollaborations: [], projectRecruitments: [] };
    if (pathname.endsWith("/api/mypage")) return { ...user, schoolEmail: "theme@office.skhu.ac.kr", clubs: [club.clubName], coffeeChatProfile };
    if (pathname.endsWith("/api/coffeechat/profiles")) return paged(apiMode === "empty" ? [] : profiles);
    if (/\/api\/coffeechat\/profiles\/\d+$/.test(pathname)) return {
      ...profiles[0],
      coffeeChatProfile: {
        ...coffeeChatProfile,
        profileImageUrl: apiMode === "room-photo" ? null : apiMode === "broken-photo" ? "data:image/png;base64,broken" : avatarImage,
      },
    };
    if (pathname.endsWith("/api/users/me/clubs")) return [club];
    if (pathname.endsWith("/api/users/me/club/join")) return [];
    if (/\/api\/clubs\/\d+\/members$/.test(pathname)) return [{ ...user, role: "PRESIDENT" }, { userId: 2, name: "학생 2", role: "MEMBER" }];
    if (/\/api\/clubs\/\d+\/(join|events)$/.test(pathname)) return [];
    if (/\/api\/clubs\/\d+\/posts$/.test(pathname)) return paged([post]);
    if (/\/api\/clubs\/\d+$/.test(pathname)) return club;
    if (pathname.endsWith("/api/clubs")) return paged([club, { ...club, clubId: 2, clubName: "디자인 동아리" }]);
    if (pathname.endsWith("/api/posts")) return paged([post]);
    if (/\/api\/posts\/\d+$/.test(pathname)) return post;
    if (/\/api\/(project-recruitments|club-collaborations)\/\d+$/.test(pathname)) return { ...post, projectRecruitmentId: 1, collabId: 1, deadline: "2026-12-01", requiredSkills: "React", topic: "개발" };
    if (/\/api\/(project-recruitments|club-collaborations)$/.test(pathname)) return paged([]);
    if (pathname.endsWith("/api/chat/rooms")) return [{ chatRoomId: 1, targetUserId: 2, targetUserName: "학생 2", lastMessage: "안녕하세요", unreadCount: 1, ...(apiMode === "room-photo" ? { targetProfileImageUrl: avatarImage } : {}) }];
    if (pathname.endsWith("/messages")) return paged([
      { chatMessageId: 1, senderId: 2, senderName: "학생 2", content: "안녕하세요", createdAt: "2026-10-09T09:00:00", isRead: true },
      { chatMessageId: 2, senderId: 1, senderName: user.name, content: "반갑습니다", createdAt: "2026-10-09T09:01:00", isRead: true },
    ]);
    return [];
  }
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const request = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) request?.reject(new Error(message.error.message));
      else request?.resolve(message.result);
    } else if (message.method === "Runtime.exceptionThrown") {
      runtimeErrors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text);
    } else if (message.method === "Fetch.requestPaused") {
      const { requestId, request } = message.params;
      const url = new URL(request.url);
      if (url.pathname.includes("/api/")) {
        const failed = apiMode === "error" && url.pathname.endsWith("/coffeechat/profiles");
        const profileDenied = apiMode === "private-profile" && /\/coffeechat\/profiles\/\d+$/.test(url.pathname);
        if (request.method === "GET" && /\/coffeechat\/profiles\/2$/.test(url.pathname)) avatarProfileRequests++;
        send("Fetch.fulfillRequest", {
          requestId, responseCode: profileDenied ? 403 : failed ? 500 : 200,
          responseHeaders: [{ name: "Content-Type", value: "application/json" }, { name: "Cache-Control", value: "no-store" }, { name: "Access-Control-Allow-Origin", value: "*" }, { name: "Access-Control-Allow-Headers", value: "*" }, { name: "Access-Control-Allow-Methods", value: "GET, POST, PATCH, PUT, DELETE, OPTIONS" }],
          body: Buffer.from(JSON.stringify({ success: !failed && !profileDenied, data: fixture(request.url), message: failed || profileDenied ? "테스트 오류" : "" })).toString("base64"),
        }).catch((error) => runtimeErrors.push(error.message));
      } else if (url.origin === origin) send("Fetch.continueRequest", { requestId }).catch(() => {});
      else send("Fetch.failRequest", { requestId, errorReason: "BlockedByClient" }).catch(() => {});
    }
  });
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Network.enable");
  await send("Network.setCacheDisabled", { cacheDisabled: true });
  await send("Fetch.enable", { patterns: [{ urlPattern: "*" }] });
  const evaluate = async (expression) => {
    const response = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (response.exceptionDetails) throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text);
    return response.result.value;
  };
  async function waitFor(expression) {
    for (let attempt = 0; attempt < 120; attempt++) {
      if (await evaluate(expression)) return;
      await delay(100);
    }
    throw new Error(`Timed out: ${expression}\n${await evaluate("document.body.innerText.slice(0, 600)")}`);
  }
  async function visit(route) {
    await send("Page.navigate", { url: `${origin}${route}` });
    await waitFor("!!document.querySelector('header button[aria-label^=\"테마 변경\"]')");
    await delay(200);
  }
  async function selectTheme(theme) {
    const current = await evaluate("document.documentElement.dataset.theme");
    if (current !== theme) {
      await evaluate("document.querySelector('header button[role=switch]').focus(); document.querySelector('header button[role=switch]').click()");
    }
    await delay(400);
    assert.equal(await evaluate("localStorage.getItem('capstone-theme')"), theme);
    assert.equal(await evaluate("document.querySelector('header button[role=switch]').getAttribute('aria-checked')"), String(theme === "dark"));
    assert.equal(await evaluate("document.querySelectorAll('header fieldset').length"), 0);
  }
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "light" }] });
  await visit("/");
  assert.equal(await evaluate("localStorage.getItem('capstone-theme')"), null);
  assert.equal(await evaluate("document.documentElement.dataset.theme"), "light");
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "dark" }] });
  await waitFor("document.documentElement.dataset.theme === 'dark'");
  await send("Page.reload");
  await waitFor("!!document.querySelector('header button[role=switch]')");
  assert.equal(await evaluate("document.documentElement.dataset.theme"), "dark");
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "light" }] });
  await waitFor("document.documentElement.dataset.theme === 'light'");
  await evaluate(`localStorage.setItem('user', ${JSON.stringify(JSON.stringify(user))}); localStorage.setItem('accessToken', 'theme-test-token');`);
  await visit("/coffee-chat/user-list");
  await waitFor("document.body.innerText.includes('학생 2')");
  await selectTheme("dark");
  assert.equal(await evaluate("document.documentElement.dataset.theme"), "dark");
  await evaluate("[...document.querySelectorAll('header button')].find(e => e.textContent.trim() === '협업/모집').click()");
  await waitFor("location.pathname === '/cooperation'");
  assert.equal(await evaluate("document.documentElement.dataset.theme"), "dark");
  await visit("/coffee-chat/user-list");
  await send("Page.reload");
  await waitFor("!!document.querySelector('header')");
  assert.equal(await evaluate("document.documentElement.dataset.theme"), "dark");
  await selectTheme("light");
  assert.equal(await evaluate("getComputedStyle(document.querySelector('main')).backgroundColor"), "rgb(248, 250, 252)");
  assert.equal(await evaluate("getComputedStyle(document.querySelector('header')).backgroundColor"), "rgb(107, 141, 214)");
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "dark" }] });
  await delay(100);
  assert.equal(await evaluate("document.documentElement.dataset.theme"), "light");
  await evaluate("localStorage.removeItem('capstone-theme')");
  await visit("/coffee-chat/user-list");
  assert.equal(await evaluate("document.documentElement.dataset.theme"), "dark");
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "light" }] });
  await waitFor("document.documentElement.dataset.theme === 'light'");
  await selectTheme("dark");
  await evaluate("localStorage.setItem('capstone-theme', 'light'); window.dispatchEvent(new StorageEvent('storage', { key: 'capstone-theme', newValue: 'light' }))");
  await waitFor("document.documentElement.dataset.theme === 'light'");
  await selectTheme("dark");
  const duration = await evaluate("getComputedStyle(document.querySelector('.theme-toggle-thumb')).transitionDuration");
  assert.equal(duration, "0.28s");
  await evaluate("document.querySelector('header button[role=switch]').focus()");
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: " ", code: "Space" });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key: " ", code: "Space" });
  await waitFor("document.documentElement.dataset.theme === 'light'");
  await delay(400);
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.theme-toggle-thumb')).transform"), "matrix(1, 0, 0, 1, 0, 0)");
  await selectTheme("dark");
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.theme-toggle-thumb')).transform"), "matrix(1, 0, 0, 1, 24, 0)");
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.theme-toggle-thumb')).transitionDuration"), "0s");
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-color-scheme", value: "light" }] });
  console.log("PASS: initial OS theme, Light/Dark toggle, saved preference, SPA/reload, keyboard, slide animation, reduced motion");

  for (const width of [320, 768, 1024]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width < 768 });
    await visit("/coffee-chat/user-list");
    assert.ok(await evaluate("[...document.querySelectorAll('header button')].filter(e => e.getBoundingClientRect().width > 0).every(e => { const r = e.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; })"), `Header buttons overflow at ${width}px`);
  }
  console.log("PASS: header controls fit at 320/768/1024px");

  const routes = ["/", "/cooperation", "/cooperation/club/1", "/cooperation/project/1", "/coffee-chat", "/coffee-chat/profile/2", "/coffee-chat/user-list", "/club/main/1", "/club/main/1?tab=calendar", "/club/apply", "/club/apply/2", "/club/create", "/club/post", "/club/president/1", "/clubs/1/posts/create", "/clubs/1/posts/1", "/club/posts/1", "/my-page"];
  const existingMobileOverflow = [];
  for (const width of [375, 1440]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width < 768 });
    for (const route of routes) {
      await visit(route);
      const result = await evaluate(`({ theme: document.documentElement.dataset.theme, content: document.querySelector('#root').innerText.length, headerRight: document.querySelector('header').getBoundingClientRect().right, viewport: innerWidth, whitePanels: [...document.querySelectorAll('[class]')].filter(e => e.classList.contains('bg-white') && e.getBoundingClientRect().width > 200 && getComputedStyle(e).backgroundColor === 'rgb(255, 255, 255)').length })`);
      assert.equal(result.theme, "dark", route);
      assert.ok(result.content > 100, `${route}: missing rendered content`);
      assert.equal(result.whitePanels, 0, `${route}: light panel remained`);
      if (width === 375 && await evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")) existingMobileOverflow.push(route);
      if (route === "/coffee-chat/user-list") {
        assert.ok(await evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth"), "User list horizontal overflow");
        const shot = await send("Page.captureScreenshot", { format: "png" });
        writeFileSync(path.join(profileDirectory, `user-list-${width}.png`), Buffer.from(shot.data, "base64"));
      }
    }
    console.log(`PASS: ${routes.length} routes/views at ${width}px (fixture data, no live API writes)`);
  }
  if (existingMobileOverflow.length) console.log(`Existing fixed-layout mobile overflow (outside theme changes): ${existingMobileOverflow.join(', ')}`);
  await visit("/cooperation");
  await evaluate("[...document.querySelectorAll('button')].find(e => e.textContent.trim() === '새 협업 모집하기').click()");
  await waitFor("!!document.querySelector('.fixed.inset-0 input')");
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.fixed.inset-0 input')).backgroundColor"), "rgb(24, 34, 52)");
  await evaluate("document.querySelector('.fixed.inset-0 input').focus()");
  assert.equal(await evaluate("getComputedStyle(document.activeElement).color"), "rgb(241, 245, 249)");
  await visit("/club/main/1?tab=calendar");
  await waitFor("!!document.querySelector('.fc-daygrid-day')");
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.fc-daygrid-day:not(.fc-day-today):not(.fc-day-other)')).backgroundColor"), "rgb(24, 34, 52)");
  await evaluate("[...document.querySelectorAll('button')].find(e => e.textContent.trim() === '일정 추가').click()");
  await waitFor("!!document.querySelector('.fixed input')");
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.fixed input')).color"), "rgb(241, 245, 249)");
  console.log("PASS: recruitment modal/input/focus and calendar/modal");
  const previousAvatarRequests = avatarProfileRequests;
  await visit("/coffee-chat");
  await waitFor("[...document.querySelectorAll('button')].some(e => e.textContent.includes('학생 2'))");
  await evaluate("[...document.querySelectorAll('button')].find(e => e.textContent.includes('학생 2')).click()");
  await waitFor("!!document.querySelector('.rounded-bl-sm') && !!document.querySelector('.rounded-br-sm')");
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.rounded-bl-sm')).backgroundColor"), "rgb(28, 41, 61)");
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.rounded-br-sm')).backgroundColor"), "rgb(37, 99, 235)");
  assert.equal(await evaluate("getComputedStyle(document.querySelector('textarea')).color"), "rgb(241, 245, 249)");
  console.log("PASS: incoming/outgoing chat bubbles and composer (fixture history)");
  await waitFor("[...document.querySelectorAll('img[alt=\"학생 2 프로필 사진\"]')].filter(e => e.complete && e.naturalWidth > 0).length === 3");
  assert.equal(avatarProfileRequests - previousAvatarRequests, 1, "List/header/messages must share one profile request");
  for (const mode of ["room-photo", "broken-photo", "private-profile"]) {
    apiMode = mode;
    await visit("/coffee-chat");
    await waitFor("[...document.querySelectorAll('button')].some(e => e.textContent.includes('학생 2'))");
    await evaluate("[...document.querySelectorAll('button')].find(e => e.textContent.includes('학생 2')).click()");
    await waitFor("!!document.querySelector('.rounded-bl-sm')");
    if (mode === "room-photo") {
      await waitFor("[...document.querySelectorAll('img[alt=\"학생 2 프로필 사진\"]')].filter(e => e.complete && e.naturalWidth > 0).length === 3");
    } else {
      await waitFor("document.querySelectorAll('img[alt=\"학생 2 프로필 사진\"]').length === 0");
      assert.ok(await evaluate("[...document.querySelectorAll('button')].find(e => e.textContent.includes('학생 2')).textContent.includes('학')"));
    }
  }
  apiMode = "normal";
  console.log("PASS: coffee-chat photo in list/header/messages, shared request, room URL alias, broken/private profile fallback");
  // Forms without authentication and the email verification screen.
  await evaluate("localStorage.removeItem('user'); localStorage.removeItem('accessToken')");
  await visit("/login");
  assert.equal(await evaluate("getComputedStyle(document.querySelector('main .theme-logo')).backgroundColor"), "rgb(255, 255, 255)");
  assert.ok(await evaluate("getComputedStyle(document.querySelector('header .theme-logo')).backgroundColor === getComputedStyle(document.querySelector('header')).backgroundColor"));
  await evaluate(`localStorage.setItem('user', ${JSON.stringify(JSON.stringify({ ...user, isVerified: false }))}); localStorage.setItem('accessToken', 'theme-test-token');`);
  await visit("/email-verify");
  assert.equal(await evaluate("document.querySelector('input').disabled"), false);
  assert.equal(await evaluate("getComputedStyle(document.querySelector('input')).color"), "rgb(241, 245, 249)");
  await evaluate(`localStorage.setItem('user', ${JSON.stringify(JSON.stringify(user))})`);
  apiMode = "empty";
  await visit("/coffee-chat/user-list");
  await waitFor("document.body.innerText.includes('검색 결과가 없습니다.')");
  apiMode = "error";
  await visit("/coffee-chat/user-list");
  await waitFor("document.body.innerText.includes('목록을 불러오지 못했습니다.')");
  console.log("PASS: login/logo, verification input, list empty/error states");
  assert.deepEqual(runtimeErrors, [], "Uncaught browser errors");
  console.log("PASS: no uncaught JavaScript errors");
  console.log(`Screenshots: ${profileDirectory}`);
} finally {
  socket?.close();
  browser.kill();
  await new Promise((resolve) => server.close(resolve));
  // Screenshots are kept in an isolated temporary directory for visual review.
}
