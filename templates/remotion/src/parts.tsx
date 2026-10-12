// Shared look and building blocks. TODO: colours and fonts from the app's CSS; BRAND for the end card.
import type { CSSProperties, ReactNode } from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  random,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { loadFont as loadSans } from "@remotion/google-fonts/Geist";
import { loadFont as loadMono } from "@remotion/google-fonts/GeistMono";

const sans = loadSans("normal", { weights: ["400", "600", "700"] }).fontFamily;
const mono = loadMono("normal", { weights: ["400", "600"] }).fontFamily;

export const c = {
  bg: "#0a0a0a",
  surface: "#111111",
  fg: "#ededed",
  muted: "#a1a1a1",
  border: "#262626",
  strong: "#767676",
  brand: "#3355ff",
  ok: "#4ade80",
};
export const font = { sans, mono };

export const BRAND = {
  name: "Product",
  tagline: "One line on what it does",
  url: "product.com",
};

// Fades and slides a child up, starting at `at` frames into the scene.
// `inStyle` is the same without hooks, for use inside loops.
export function inStyle(frame: number, fps: number, at = 0) {
  const p = spring({ frame: frame - at, fps, config: { damping: 200 } });
  return {
    opacity: p,
    transform: `translateY(${interpolate(p, [0, 1], [40, 0])}px)`,
  };
}

export function useIn(at = 0) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return inStyle(frame, fps, at);
}

// `pulse` flashes the grid in the brand colour on each downbeat: every `pulse.every` frames from `pulse.from`.
export function Stage({
  children,
  pulse,
}: {
  children: ReactNode;
  pulse?: { every: number; from?: number };
}) {
  const frame = useCurrentFrame();
  const since = pulse ? frame - (pulse.from ?? 0) : -1;
  const flash = since >= 0 ? Math.exp(-(since % pulse!.every) / 5) : 0;
  const grid = (color: string) =>
    `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`;
  return (
    <AbsoluteFill
      style={{
        background: c.bg,
        backgroundImage: grid(`${c.border}55`),
        backgroundSize: "60px 60px",
        color: c.fg,
        fontFamily: font.sans,
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage: grid(c.brand),
          backgroundSize: "60px 60px",
          opacity: 0.35 * flash,
        }}
      />
      {children}
    </AbsoluteFill>
  );
}

// Centred column used by every scene.
export function Scene({ children }: { children: ReactNode }) {
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        padding: 72,
        gap: 48,
      }}
    >
      {children}
    </AbsoluteFill>
  );
}

// Big opening line, one row at a time.
// `step`: frames between lines.
export function Hook({ lines, step = 12 }: { lines: string[]; step?: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Scene>
      <div style={{ width: "100%" }}>
        {lines.map((line, i) => (
          <div
            key={line}
            style={{
              ...inStyle(frame, fps, i * step),
              fontSize: 104,
              fontWeight: 700,
              letterSpacing: -4,
              lineHeight: 1.05,
              color: i === lines.length - 1 ? c.brand : c.fg,
            }}
          >
            {line}
          </div>
        ))}
      </div>
    </Scene>
  );
}

export function Caption({
  children,
  at = 0,
}: {
  children: ReactNode;
  at?: number;
}) {
  return (
    <div
      style={{
        ...useIn(at),
        width: "100%",
        fontSize: 56,
        fontWeight: 600,
        letterSpacing: -1.5,
      }}
    >
      {children}
    </div>
  );
}

// Boxy window with a title bar.
export function Panel({
  title,
  children,
  style,
}: {
  title: string;
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        width: "100%",
        background: c.surface,
        border: `2px solid ${c.strong}`,
        ...style,
      }}
    >
      <div
        style={{
          borderBottom: `1px solid ${c.border}`,
          padding: "18px 28px",
          fontFamily: font.mono,
          fontSize: 26,
          color: c.muted,
        }}
      >
        {title}
      </div>
      <div
        style={{
          padding: 32,
          fontFamily: font.mono,
          fontSize: 32,
          lineHeight: 1.5,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// Text that types itself out from `at`, with a block cursor while typing.
export function Typed({
  text,
  at,
  cps = 32,
  cursor = true,
}: {
  text: string;
  at: number;
  cps?: number;
  cursor?: boolean;
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shown = Math.max(0, Math.floor(((frame - at) * cps) / fps));
  if (frame < at) return null;
  const typing = shown < text.length;
  return (
    <>
      {text.slice(0, shown)}
      {cursor && typing && <span style={{ background: c.fg }}>&nbsp;</span>}
    </>
  );
}

// One sound effect from public/sfx/ (see sfx.sh), played at frame `at`.
export function Sfx({
  at,
  name,
  volume = 1,
}: {
  at: number;
  name: string;
  volume?: number;
}) {
  return (
    <Sequence from={Math.round(at)} durationInFrames={30} layout="none">
      <Audio src={staticFile(`sfx/${name}.wav`)} volume={volume} />
    </Sequence>
  );
}

// Key clicks matching a <Typed> line: one every other character, with varied volume.
export function TypingSfx({
  text,
  at,
  cps = 32,
}: {
  text: string;
  at: number;
  cps?: number;
}) {
  const { fps } = useVideoConfig();
  return (
    <>
      {Array.from({ length: Math.ceil(text.length / 2) }, (_, i) => (
        <Sfx
          key={i}
          at={at + (i * 2 * fps) / cps}
          name="key"
          volume={0.4 + 0.4 * random(`${text}${i}`)}
        />
      ))}
    </>
  );
}

// Background track from public/music/, faded in and out over the whole clip.
export function Music({ name, volume = 1 }: { name: string; volume?: number }) {
  const { durationInFrames } = useVideoConfig();
  return (
    <Audio
      src={staticFile(`music/${name}`)}
      volume={(f) =>
        interpolate(
          f,
          [0, 15, durationInFrames - 30, durationInFrames],
          [0, volume, volume, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        )
      }
    />
  );
}

// Shows children from frame `at` on.
export function At({ at, children }: { at: number; children: ReactNode }) {
  const frame = useCurrentFrame();
  return frame >= at ? <>{children}</> : null;
}

export function Logo({ size }: { size: number }) {
  return (
    <Img src={staticFile("logo.svg")} style={{ width: size, height: size }} />
  );
}

export function EndCard({ line }: { line: string }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame, fps, config: { damping: 12 } });
  return (
    <Scene>
      <div style={{ transform: `scale(${pop})` }}>
        <Logo size={260} />
      </div>
      <div
        style={{
          ...useIn(8),
          fontSize: 120,
          fontWeight: 700,
          letterSpacing: -5,
        }}
      >
        {BRAND.name}
      </div>
      <div style={{ ...useIn(14), fontSize: 48, color: c.muted }}>
        {BRAND.tagline}
      </div>
      <div
        style={{
          ...useIn(22),
          marginTop: 24,
          border: `3px solid ${c.brand}`,
          padding: "20px 44px",
          fontFamily: font.mono,
          fontSize: 52,
          fontWeight: 600,
        }}
      >
        {BRAND.url}
      </div>
      <div style={{ ...useIn(30), fontSize: 36, color: c.muted }}>{line}</div>
    </Scene>
  );
}
