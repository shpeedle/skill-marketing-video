# Timing to the beat

## Maths

At `fps` frames per second and `bpm` beats per minute:

| Unit | Frames | 30 fps, 100 BPM |
| --- | --- | --- |
| Beat | `fps × 60 / bpm` | 18 |
| Bar (4/4) | `4 × beat` | 72 (2.4s) |
| Scene (2 bars) | `8 × beat` | 144 (4.8s) |

- Pick a tempo where a beat is a whole number of frames at 30 fps: 60, 72, 75, 90, 100, 120 BPM. Otherwise round and keep clips short so drift stays under a frame.
- Clip length = hook + scenes + end card, all in bars. Render 0.5–1 bar of tail so the music fades out.

## Measuring a track

1. **Tempo.** Start with the BPM on the source page or in the filename. Check it:
   - `aubio tempo <file>` if `aubio` is installed, or
   - Python with `librosa.beat.beat_track` (`pip install librosa`), or
   - the `Stage` pulse in Remotion studio: flashes should land on the kick drum for the whole clip.
2. **First downbeat.** Find where the first beat starts:
   - `ffmpeg -i <file> -af silencedetect=n=-40dB:d=0.05 -f null -` prints where the lead-in silence ends, or
   - `librosa.onset.onset_detect` for the first strong onset.
3. **Trim.** In `music.sh`, `-ss <downbeat>` so frame 0 of the clip is beat 1.
4. **Loops.** For a gapless loop, cut exactly N bars by samples: `bars × 4 × 60 / bpm × 44100` and use `atrim=end_sample=...,aloop`.

## Fitting footage

`capture.mjs` speeds each recording to exactly `SCENE_SECONDS` with `setpts=PTS*<target/actual>`. Aim for a raw take of 1–3× the scene length.
