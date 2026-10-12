---
name: marketing-video
description: Make short marketing videos of a web app. Records real app footage with Playwright, builds clips in Remotion (React → MP4) and syncs scenes to the beat of a licensed music track. Use when the user asks for a marketing video, promo clip, product demo video, social clip, app tour video, or to record the app and set it to music.
argument-hint: "[what the video should show]"
---

# Marketing video

Short social clips (15–30s) built from real footage of the user's app, cut on the beat of a music track.

```
Playwright records app scenes → ffmpeg fits each to N bars → Remotion lays them out with captions → render MP4
                                         ↑
                    music track: tempo + first downbeat → frames per beat
```

## Files in this skill

| Path | Use |
| --- | --- |
| `templates/capture.mjs` | Playwright recorder: sign in, seed, record scenes, fit each to a scene length |
| `templates/remotion/` | Remotion project skeleton: `Root.tsx`, `parts.tsx`, `clips.tsx`, `render.mjs` |
| `templates/audio/music.sh` | Trim to the first downbeat, normalise to -16 LUFS, gapless loops |
| `templates/audio/sfx.sh` | Generates UI sound effects with ffmpeg (no licences needed) |
| `reference/timing.md` | Beat maths, measuring tempo and downbeat |
| `reference/music-licensing.md` | Where to get music and which licences are safe |

Copy templates into the project and adapt them. Don't import from the skill folder.

## Process

Work through these in order. Confirm the plan (step 2) and the track (step 3) with the user before building.

### 0. Check prerequisites

Run this before anything else:

```sh
node --version; pnpm --version; ffmpeg -version | head -1; ffprobe -version | head -1
```

| Tool | Why | Install |
| --- | --- | --- |
| Node 20+ | Remotion and Playwright | nodejs.org |
| pnpm (or npm) | Installs the video project | `npm i -g pnpm` |
| ffmpeg and ffprobe | Fit footage to the beat, process music, generate sound effects | `brew install ffmpeg`, `sudo apt install ffmpeg`, `winget install ffmpeg` |
| Playwright Chromium | Records the app | `npx playwright install --with-deps chromium`, after `pnpm install` in the video project |

- If anything is missing, tell the user the install command and stop until it's there. Don't install system packages yourself unless asked.
- Installed for them, no action needed: Remotion, React and `@playwright/test` come from the video project's `pnpm install`; Remotion downloads its own headless browser and ffmpeg on first render.
- Optional: `aubio` or Python `librosa` measure a track's tempo. Without them, use the BPM from the track's download page and check it with the `Stage` pulse in studio.

Also needed, not software. Raise these early:

- **The app running locally**, with a way to sign in without real email or OAuth (dev magic-link log, seeded test user, test-auth route). If there's none, ask the user before adding one.
- **A music track that allows commercial use.** The user downloads it; you can suggest sources (`reference/music-licensing.md`).
- **A Remotion licence** if the user's company has more than 3 people. Free for individuals and smaller companies; see remotion.dev/license.

### 1. Learn the app

- Read the README, agent guides (`AGENTS.md`, `CLAUDE.md`) and any existing `marketing/` folder. If one exists, extend it rather than starting over.
- Find out how to run the app locally, how to sign in without real email or OAuth (dev magic-link logs, seeded test users, a test-auth route), and how to create demo data (API, CLI, SQL, fixtures).
- Note the app's colours and fonts (global CSS, Tailwind config) so the video matches.
- Never record real user data or secrets. Use a dedicated demo account and made-up data.

### 2. Plan the clips

Propose a short table and get a yes:

| Clip | Story (one line) | Scenes | Length |
| --- | --- | --- | --- |

- One idea per clip. Structure: hook (1 bar) → 3–4 scenes (2 bars each) → end card (1–1.5 bars).
- Each scene shows one action with a 3–6 word caption.
- Formats: Vertical 1080×1920 (Reels, Shorts, TikTok) and Square 1080×1080 (feeds). Landscape 1920×1080 only if asked.

### 3. Pick the music

- Follow `reference/music-licensing.md`. Commercial use is required; avoid NC, ND and SA licences.
- Prefer instrumental, a steady 80–120 BPM, at least the clip's length.
- Put the untouched download in `audio/sources/` and log it in `audio/LICENSES.md` (file, title, author, licence, link, date checked).
- Measure the tempo and first downbeat (`reference/timing.md`), then add a line to `music.sh`.

### 4. Record the footage

- Start the app. Copy `templates/capture.mjs` to `<video>/capture/capture.mjs` (run it with `pnpm capture`; Playwright is a dev dependency of the video project) and fill in the `TODO`s: `signIn`, `seed` and the scenes.
- Set `SCENE_SECONDS` to the scene length in bars: `bars × 4 × 60 / BPM`.
- Seeding: reset the demo user's data first so reruns are repeatable. Add enough data that lists look lived in, and backdate it over the past week if possible.
- Scenes: move the mouse like a person (`click()` helper), type with `pressSequentially` and a delay, and wait on visible results, not fixed sleeps.
- Warm up dev-server routes before recording so no scene shows a compile spinner.
- Keep the feature readable. In the final video a full 1280px page shows at about 900px wide, so small UI gets hard to read. For each scene, decide what the viewer must read, then zoom in on it (see "Zooming in" below).
- Run it and watch every output MP4 (extract a frame with ffmpeg and read it as an image) before moving on.

### 5. Build the clips

- Scaffold from `templates/remotion/` (own `package.json`, separate from the app's workspace). Pin Remotion versions; all `remotion` and `@remotion/*` packages must share one version.
- Set colours, fonts and `BRAND` in `parts.tsx`; put the logo at `public/logo.svg`.
- Run `audio/sfx.sh` to generate `public/sfx/`.
- List clips in `src/clips-list.mjs`; both `Root.tsx` and `render.mjs` read it.
- Write each clip in `clips.tsx` with timings as multiples of `BEAT` and `BAR`, never raw frame numbers.
- Footage goes through `<OffthreadVideo>` from `public/app/`. For vertical, crop the sidebar off so the content reads bigger.
- Add a `focus` to any scene whose feature reads small (see "Zooming in" below).
- Hooks (`useIn`, `useCurrentFrame`) can't be called inside `.map()` callbacks; use `inStyle(frame, fps, at)` there.

### 6. Check and render

- `pnpm studio` and tell the user to scrub through. The `Stage` pulse flashes on each bar: if flashes drift from the music, the tempo or offset is wrong.
- Check text is readable in both formats and nothing is cut off. Look at a still of each scene at full size: if the feature's text is smaller than the clip's captions by more than about 3×, zoom in.
- `pnpm render` writes `out/<Clip>-<Format>.mp4`. Pull frames from the renders to check them yourself.
- Run the project's linter over the new files.

### 7. Hand over

- Add a short `README.md` in the video folder: clips table, how to re-record, how to render, audio layout.
- List any credit the music licence needs in the post caption.
- Commit only if the user asks. Large media: check if the repo uses Git LFS.

## Zooming in

Use when a scene shows a whole page and the feature is small. Pick one, or both:

| Where | How | Best for | Limit |
| --- | --- | --- | --- |
| Capture | `record(..., { zoom: 1.25 })` in `capture.mjs` sets CSS zoom on the page | The whole scene is about one small area; text stays sharp | Narrows the layout to `1280 / zoom` px, which may cross a responsive breakpoint. Check the frame |
| Remotion | `focus: { x, y, scale, at }` on a `TOUR` entry | Showing the full page, then pushing in on one feature on a beat | `scale` up to about 1.5; past that the footage goes soft, so zoom in capture instead |

- `focus.x` and `focus.y` are fractions of the recording (0–1) for the point to zoom toward. It stays put while the rest grows, so pick the feature's centre. Read a frame of the recording to find it.
- Start the push-in on a beat (`at`, in beats), after the viewer has seen the whole page for a moment: `at: 2` to `4` in a 2-bar scene.
- Playwright can't record at 2× pixel density (`deviceScaleFactor` only pads the frame), so CSS zoom is the way to get more detail.
- Vertical already crops off the sidebar (`SIDEBAR` in `clips.tsx`), which helps before any zoom.

## Gotchas

- Playwright records WebM with a slow start; `capture.mjs` trims to the moment the page has loaded, then re-encodes to H.264.
- Next.js and Vite dev overlays show up in recordings; the `POLISH` init script hides the Next.js one. Add selectors for others.
- Headless Chromium has no visible cursor; `POLISH` draws one.
- Use `colorScheme` in the browser context to match the video's theme.
- Speeding up footage more than about 3× looks frantic. If a scene runs long, cut steps rather than speeding up more.
