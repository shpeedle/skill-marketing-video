// Clips, timed in beats and bars of their music track. See reference/timing.md.
import {
  interpolate,
  OffthreadVideo,
  Series,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  BRAND,
  c,
  Caption,
  EndCard,
  font,
  Hook,
  Music,
  Scene,
  Sfx,
  Stage,
  useIn,
} from "./parts";

// A tour of the app, from footage in public/app/ (capture/capture.mjs).
// TODO: track and tempo. At 30 fps and 100 BPM a beat is 18 frames and a bar 72.
const TRACK = "track.mp3";
const TOUR_BEAT = 18;
const TOUR_BAR = TOUR_BEAT * 4;
const TOUR_SCENE = TOUR_BAR * 2; // must match SCENE_BARS in capture.mjs

type TourShot = {
  file: string;
  title: string;
  sub: string;
  // Optional push-in on a feature: the point (x, y) to zoom toward, as fractions
  // of the recording (it stays put while the rest grows around it),
  // `scale` up to about 1.5 (footage is ~1:1, so more goes soft; zoom in
  // capture.mjs instead), starting `at` beats into the scene.
  focus?: { x: number; y: number; scale: number; at?: number };
};

// TODO: one entry per recorded scene.
const TOUR: TourShot[] = [
  {
    file: "home",
    title: "Caption in a few words.",
    sub: "Payoff.",
    focus: { x: 0.5, y: 0.4, scale: 1.4, at: 2 },
  },
];

export const TOUR_FRAMES = TOUR_BAR + TOUR_SCENE * TOUR.length + TOUR_BAR * 1.5;

// Fraction of the recording's width taken by a sidebar. Vertical crops it off,
// so the page reads bigger. 0 for no sidebar.
const SIDEBAR = 240 / 1280;

function TourScene({ file, title, sub, focus }: TourShot) {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const crop = height > width ? SIDEBAR : 0;
  // Without a focus, a slow 5% push-in keeps the screen moving.
  const at = (focus?.at ?? 0) * TOUR_BEAT;
  const scale = focus
    ? interpolate(
        spring({ frame: frame - at, fps, config: { damping: 200 } }),
        [0, 1],
        [1, focus.scale],
      )
    : interpolate(frame, [0, TOUR_SCENE], [1, 1.05]);
  // The focus point in the visible (cropped) area.
  const origin = focus
    ? `${((focus.x - crop) / (1 - crop)) * 100}% ${focus.y * 100}%`
    : "30% 40%";
  return (
    <Scene>
      <Caption>
        {title} <span style={{ color: c.muted }}>{sub}</span>
      </Caption>
      <div
        style={{
          ...useIn(6),
          width: "100%",
          border: `2px solid ${c.strong}`,
          background: c.surface,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            borderBottom: `1px solid ${c.border}`,
            padding: "14px 24px",
            fontFamily: font.mono,
            fontSize: 24,
            color: c.muted,
          }}
        >
          {BRAND.url}
        </div>
        <div style={{ overflow: "hidden" }}>
          <div
            style={{ transform: `scale(${scale})`, transformOrigin: origin }}
          >
            <OffthreadVideo
              src={staticFile(`app/${file}.mp4`)}
              muted
              style={{
                width: `${100 / (1 - crop)}%`,
                marginLeft: `${(-100 * crop) / (1 - crop)}%`,
                display: "block",
              }}
            />
          </div>
        </div>
      </div>
    </Scene>
  );
}

export function Tour() {
  return (
    <Stage pulse={{ every: TOUR_BAR }}>
      <Music name={TRACK} />
      <Sfx at={TOUR_BAR + TOUR_SCENE * TOUR.length} name="thump" />
      <Series>
        <Series.Sequence durationInFrames={TOUR_BAR}>
          <Hook
            lines={["A hook that names the pain,", "and the fix."]}
            step={TOUR_BEAT}
          />
        </Series.Sequence>
        {TOUR.map((scene) => (
          <Series.Sequence key={scene.file} durationInFrames={TOUR_SCENE}>
            <TourScene {...scene} />
          </Series.Sequence>
        ))}
        <Series.Sequence durationInFrames={TOUR_BAR * 1.5}>
          <EndCard line="Try it free" />
        </Series.Sequence>
      </Series>
    </Stage>
  );
}
