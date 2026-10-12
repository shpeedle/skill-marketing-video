#!/usr/bin/env bash
# Builds ../public/music/ from the untouched downloads in sources/. Licences: LICENSES.md.
# One ffmpeg line per track. Measure tempo and first downbeat first (reference/timing.md).
set -euo pipefail
cd "$(dirname "$0")"
out=../public/music
mkdir -p "$out"

norm="loudnorm=I=-16:TP=-1.5:LRA=11"
enc=(-ar 44100 -c:a libmp3lame -b:a 192k)

# Example: 100 BPM, first downbeat at 0.07s, keep 26s for a 25s clip.
# ffmpeg -hide_banner -loglevel error -y -ss 0.07 -i sources/TRACK.mp3 -t 26 \
#   -af "$norm" "${enc[@]}" "$out/track.mp3"

# Example: a loop of exactly 4 bars at 100 BPM (9.6s = 423360 samples), played 4 times.
# ffmpeg -hide_banner -loglevel error -y -i sources/LOOP.mp3 \
#   -af "atrim=end_sample=423360,asetpts=N/SR/TB,aloop=loop=3:size=423360,$norm" \
#   "${enc[@]}" "$out/loop.mp3"
