/**
 * Generates a synthetic test video using ffmpeg.
 *
 * The video is 320×180 (16:9) and 2 seconds long. It contains three broad
 * vertical colour blocks:
 *
 *   x  0 – 106  → red
 *   x 107 – 213 → green
 *   x 214 – 319 → blue
 *
 * These blocks let tests verify that a click in the left, middle, or right
 * third of the video produces the expected approximate videoX value.
 *
 * --- Future improvement ---
 * For sub-pixel accuracy, encode coordinates directly into pixel colour:
 *   red   = Math.round(x) % 256
 *   green = Math.round(y) % 256
 *   blue  = frame index % 256
 * This requires a lossless container (e.g. ffv1 in mkv) or a canvas-based
 * frame sampler that corrects for YUV chroma subsampling before comparing.
 */

import { execSync } from 'child_process';
import { mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, '..', 'public');
const outputPath = path.join(outputDir, 'test-video.mp4');

mkdirSync(outputDir, { recursive: true });

// Three solid-colour sources hstacked into a 320×180 frame.
// -crf 0 requests lossless H.264, which preserves solid colour blocks
// perfectly while remaining widely decodable.
const cmd = [
  'ffmpeg', '-y',
  '-f', 'lavfi', '-i', 'color=c=red:s=107x180:d=2:r=25',
  '-f', 'lavfi', '-i', 'color=c=green:s=106x180:d=2:r=25',
  '-f', 'lavfi', '-i', 'color=c=blue:s=107x180:d=2:r=25',
  '-filter_complex', '[0][1][2]hstack=inputs=3',
  '-c:v', 'libx264', '-crf', '0', '-pix_fmt', 'yuv420p',
  '-t', '2',
  `"${outputPath}"`,
].join(' ');

console.log('Generating synthetic test video…');
console.log(cmd);

try {
  execSync(cmd, { stdio: 'inherit' });
  console.log(`✓ Video written to ${outputPath}`);
} catch {
  console.error('Failed. Make sure ffmpeg is installed and available on PATH.');
  process.exit(1);
}
