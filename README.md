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

Node 20+, pnpm, ffmpeg and Playwright Chromium.

## Licences

- This skill: MIT (`LICENSE`).
- Remotion has its own licence: free for individuals and small companies, paid for larger ones. See [remotion.dev/license](https://www.remotion.dev/license).
- Music you add is licensed separately; see `reference/music-licensing.md`.
