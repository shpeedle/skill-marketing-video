// Records app footage for the marketing clips: signs in a demo user, seeds data,
// then records each scene to ../public/app/<scene>.mp4, sped up to SCENE_SECONDS.
// Needs the app running locally, plus ffmpeg and @playwright/test with Chromium.
//   node <video>/capture/capture.mjs
// Fill in every TODO.
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { chromium } from "@playwright/test";

const BASE = "http://localhost:3000"; // TODO: the app's local URL
const OUT = path.resolve(import.meta.dirname, "../public/app");
const VIEWPORT = { width: 1280, height: 800 };
// Each recording is sped up to this length. Two bars at 100 BPM = 4.8s.
const BPM = 100;
const SCENE_BARS = 2;
const SCENE_SECONDS = (SCENE_BARS * 4 * 60) / BPM;
const work = mkdtempSync(path.join(tmpdir(), "capture-"));
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Hides dev overlays and scrollbars, and draws a cursor that follows Playwright's mouse.
const POLISH = `
addEventListener("DOMContentLoaded", () => {
  const style = document.createElement("style");
  style.textContent = "nextjs-portal,vite-error-overlay{display:none!important} ::-webkit-scrollbar{display:none}";
  document.head.append(style);
  const cursor = document.createElement("div");
  cursor.style.cssText = "position:fixed;z-index:2147483647;pointer-events:none;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;background:rgba(255,255,255,.9);border:2px solid #3355ff;left:-40px;top:-40px;transition:transform .12s";
  document.body.append(cursor);
  addEventListener("mousemove", (e) => { cursor.style.left = e.clientX + "px"; cursor.style.top = e.clientY + "px"; });
  addEventListener("mousedown", () => (cursor.style.transform = "scale(.7)"));
  addEventListener("mouseup", () => (cursor.style.transform = ""));
});
`;

// TODO: sign in a demo user without real email or OAuth, e.g. read a magic link
// from the dev log, or fill a seeded test user's password. Returns a signed-in context.
async function signIn(browser) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${BASE}/sign-in`);
  // ...
  await page.close();
  return context;
}

// TODO: reset the demo user's data, then create enough for lists to look lived in.
// `api` is context.request, so calls carry the signed-in session.
// Returns whatever the scenes need (ids, urls).
async function seed(api) {
  return {};
}

// --- Recording ---------------------------------------------------------------

// Moves the cursor to the element like a person would, then clicks it.
async function click(page, locator) {
  const box = await locator.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
    steps: 25,
  });
  await sleep(200);
  await locator.click();
}

const ffmpeg = (...args) =>
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...args]);

const duration = (file) =>
  Number(
    execFileSync(
      "ffprobe",
      ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file],
      { encoding: "utf8" },
    ),
  );

// `zoom` (CSS zoom, e.g. 1.25) renders the UI bigger and still sharp, for scenes
// where the feature would read small. It narrows the layout width (1280 / zoom),
// so check it doesn't cross a responsive breakpoint.
async function record(browser, state, scene, start, act, { zoom = 1 } = {}) {
  const context = await browser.newContext({
    storageState: state,
    viewport: VIEWPORT,
    colorScheme: "dark", // TODO: match the video's theme
    recordVideo: { dir: work, size: VIEWPORT },
  });
  const opened = Date.now();
  await context.addInitScript(POLISH);
  if (zoom !== 1) {
    await context.addInitScript(
      `addEventListener("DOMContentLoaded", () => { document.documentElement.style.zoom = "${zoom}"; })`,
    );
  }
  const page = await context.newPage();
  await page.mouse.move(VIEWPORT.width / 2, VIEWPORT.height - 120);
  await page.goto(`${BASE}${start}`);
  await page.waitForLoadState("networkidle");
  await sleep(600);
  // Recording starts with the context; skip the blank page load.
  const from = (Date.now() - opened) / 1000;
  await act(page);
  await sleep(1200);
  await context.close();
  const video = await page.video().path();

  const trimmed = path.join(work, `${scene}.mp4`);
  ffmpeg("-ss", String(from), "-i", video, "-an", "-c:v", "libx264", "-crf", "12", trimmed);
  const speed = SCENE_SECONDS / duration(trimmed);
  if (speed < 1 / 3) console.warn(`${scene}: sped up ${(1 / speed).toFixed(1)}×; consider cutting steps`);
  mkdirSync(OUT, { recursive: true });
  ffmpeg(
    "-i", trimmed,
    "-filter:v", `setpts=PTS*${speed},fps=30`,
    "-t", String(SCENE_SECONDS),
    "-c:v", "libx264", "-preset", "slow", "-crf", "18",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart",
    path.join(OUT, `${scene}.mp4`),
  );
  console.log(`Recorded ${scene}`);
}

const browser = await chromium.launch();
const setup = await signIn(browser);
const data = await seed(setup.request);
const state = await setup.storageState();

// Visit every page once so the dev server has compiled them before recording.
const warm = await setup.newPage();
for (const url of ["/"]) {
  // TODO: every page the scenes visit
  await warm.goto(`${BASE}${url}`);
}
await setup.close();

// TODO: one record() per scene. Example:
await record(browser, state, "home", "/", async (page) => {
  await sleep(800);
  // await click(page, page.getByRole("button", { name: "New project" }));
  // await page.getByLabel("Name").pressSequentially("Launch plan", { delay: 70 });
  // await page.getByRole("heading", { name: "Launch plan" }).waitFor();
  await page.mouse.move(600, 400, { steps: 30 });
  await sleep(1000);
});
// A small feature, recorded zoomed in:
// await record(browser, state, "settings", "/settings", async (page) => { ... }, { zoom: 1.4 });

await browser.close();
console.log(`Footage in ${OUT}`);
