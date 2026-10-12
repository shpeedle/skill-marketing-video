// Renders every clip in every format to out/.
import { execSync } from "node:child_process";
import { CLIPS, FORMATS } from "./src/clips-list.mjs";

for (const clip of CLIPS) {
  for (const format of FORMATS) {
    const id = `${clip}-${format}`;
    execSync(`npx remotion render src/index.ts ${id} out/${id}.mp4`, {
      stdio: "inherit",
    });
  }
}
