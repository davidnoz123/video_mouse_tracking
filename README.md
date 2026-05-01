# Video Mouse Tracker

A browser-based tool that records pointer interactions over a video and converts browser coordinates into video pixel coordinates.

## What it does

- Displays a video inside a fixed-size viewport.
- Renders a transparent overlay on top of the video.
- Records `pointerdown`, `pointermove` (while dragging), and `pointerup` events from the overlay.
- For each event stores: event type, browser coordinates, video playback time, and calculated video pixel coordinates.
- Exposes all recorded events through `window.__videoTrackerTestApi` for automated testing.

## How mouse tracking works

Every pointer event captured by the overlay contains `clientX` / `clientY` — coordinates in the browser viewport. To map these to video pixel coordinates the app:

1. Reads the overlay's bounding rect via `getBoundingClientRect()`.
2. Adjusts for `object-fit: contain` letterboxing/pillarboxing (see below).
3. Scales the relative position by the video's intrinsic width and height.

## How coordinate conversion works

`src/coordinateMapping.ts` contains a pure `mapToVideoCoordinates()` function.

Because the video is displayed with `object-fit: contain`, it is scaled uniformly to fit the container while preserving its aspect ratio:

- If the container is **wider** than the video aspect ratio, black pillarbox bars appear on the left and right.
- If the container is **taller**, black letterbox bars appear on the top and bottom.

The function calculates the exact rect of the displayed video image inside the container, then maps the pointer offset within that rect to a position in video pixel space.

## Running locally

```bash
# Install dependencies
npm install

# Generate the synthetic test video (requires ffmpeg on PATH)
npm run generate:video

# Start the dev server
npm run dev
# → http://localhost:5173
```

Open the app, click and drag over the video. In the browser console:

```js
window.__videoTrackerTestApi.getRecordedEvents()
```

## Running tests

```bash
# Unit tests only (no browser required)
npm run test:unit

# Playwright E2E tests (starts dev server automatically)
npm run test:e2e

# Both
npm test
```

## Running in Docker

```bash
docker build -t video-tracker-test .
docker run --rm video-tracker-test
```

The Docker image installs ffmpeg, generates the synthetic video, builds the app, and runs all tests.

## Project structure

```
src/
  recordingTypes.ts     — shared TypeScript types for recorded events
  coordinateMapping.ts  — pure coordinate mapping function (unit-tested)
  testHooks.ts          — window.__videoTrackerTestApi type declarations
  VideoTracker.tsx      — video + overlay React component
  App.tsx               — top-level React app
  main.tsx              — React entry point
scripts/
  generateSyntheticVideo.ts — generates public/test-video.mp4 via ffmpeg
tests/
  coordinateMapping.test.ts — Vitest unit tests for coordinate mapping
  pointerTracking.spec.ts   — Playwright E2E tests
```

## Synthetic test video

`scripts/generateSyntheticVideo.ts` uses ffmpeg to produce a 320×180, 2-second video with three vertical colour blocks:

| Region | x range | Colour |
|--------|---------|--------|
| Left third | 0–106 | Red |
| Middle third | 107–213 | Green |
| Right third | 214–319 | Blue |

This makes it easy to verify that a click in a known screen region maps to the expected approximate `videoX` value.

> **Future improvement**: encode coordinates directly into pixel colour (`red = x % 256`, `green = y % 256`) using a lossless container (e.g. ffv1/mkv) so tests can validate exact sub-pixel accuracy.

## Known limitations

- The transparent overlay blocks native video control interactions. Use the `seekTo` test API or remove the overlay to interact with controls.
- `videoX` / `videoY` at the time of `pointermove` reflect `video.currentTime` at the moment the event fires. During fast playback there may be a small timing skew between the recorded position and the actual displayed frame.
- Device pixel ratio (DPR) is not explicitly handled. On high-DPI displays `getBoundingClientRect()` returns CSS pixels which is correct for `clientX`/`clientY`, but canvas-based pixel sampling would need DPR adjustment.


