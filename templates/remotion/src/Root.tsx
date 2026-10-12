import type { ComponentType } from "react";
import { Composition } from "remotion";
import { CLIPS, FORMATS } from "./clips-list.mjs";
import { Tour, TOUR_FRAMES } from "./clips";

const COMPONENTS: Record<string, { component: ComponentType; frames: number }> = {
  Tour: { component: Tour, frames: TOUR_FRAMES },
};

// 9:16 for Reels, Shorts, TikTok, LinkedIn; 1:1 for feeds.
const SIZES: Record<string, { width: number; height: number }> = {
  Vertical: { width: 1080, height: 1920 },
  Square: { width: 1080, height: 1080 },
  Landscape: { width: 1920, height: 1080 },
};

export function Root() {
  return (
    <>
      {CLIPS.flatMap((clip) =>
        FORMATS.map((format) => (
          <Composition
            key={`${clip}-${format}`}
            id={`${clip}-${format}`}
            component={COMPONENTS[clip].component}
            durationInFrames={COMPONENTS[clip].frames}
            fps={30}
            {...SIZES[format]}
          />
        )),
      )}
    </>
  );
}
