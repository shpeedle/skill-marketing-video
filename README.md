# marketing-video

A [Claude Code](https://claude.com/claude-code) skill that makes short marketing videos of your web app:

1. Records real footage of the app with Playwright, using seeded demo data.
2. Fits each recording to an exact number of musical bars with ffmpeg.
3. Builds Vertical (9:16) and Square (1:1) clips in [Remotion](https://www.remotion.dev), cut on the beat.

## Install

```sh
git clone <this repo> ~/.claude/skills/marketing-video
```

Then ask Claude for "a marketing video of the app", or run `/marketing-video`.

## Needs

| Tool | Why | Install |
| --- | --- | --- |
| Claude Code | Runs the skill | claude.com/claude-code |
| Node 20+ and pnpm | Remotion and Playwright | nodejs.org, `npm i -g pnpm` |
| ffmpeg (with ffprobe) | Fits footage to the beat, processes music | `brew install ffmpeg`, `sudo apt install ffmpeg`, `winget install ffmpeg` |
| Playwright Chromium | Records the app | `npx playwright install --with-deps chromium` |
| Your app, running locally | The thing being filmed | Your project's own setup |

Installed for you by `pnpm install` in the video project: Remotion, React and Playwright. Remotion downloads its own headless browser and ffmpeg on first render.

Optional: `aubio` or Python `librosa` to measure a track's tempo. Without them, use the BPM from the track's download page.

Also needed:

- **A way to sign in locally without real email or OAuth**, such as a magic link printed to the dev log or a seeded test user. Claude finds it; if the app has none, someone has to add one.
- **A music track that allows commercial use.** You download it; `reference/music-licensing.md` lists sources.
- **A Remotion licence** for companies of more than 3 people. Free for individuals and smaller companies.

## Licences

- This skill: MIT (`LICENSE`).
- Remotion has its own licence: free for individuals and small companies, paid for larger ones. See [remotion.dev/license](https://www.remotion.dev/license).
- Music you add is licensed separately; see `reference/music-licensing.md`.
