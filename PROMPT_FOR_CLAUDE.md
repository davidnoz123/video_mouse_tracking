# Prompt for Claude in VS Code

You are helping me create an initial implementation of a browser-based video editing/tracking tool. This codebase is intended to become the starting point for an agentic coding evaluation task, so please keep the implementation understandable, testable, Dockerized, and not over-engineered.

## Product goal

Create a web app that displays a video with a transparent interaction overlay. The user can click and drag over the video. The app records pointer events against the current video time and converts browser mouse coordinates into video pixel coordinates.

The first version should focus on mouse tracking accuracy, not full video editing.

## Technical stack

Use:

- TypeScript
- Vite
- React
- Playwright for browser automation tests
- Node-based tooling
- Docker for reproducible testing

Avoid unnecessary libraries.

## Required repo structure

Create something close to this:

```text
.
├── package.json
├── package-lock.json
├── Dockerfile
├── README.md
├── index.html
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── VideoTracker.tsx
│   ├── coordinateMapping.ts
│   ├── recordingTypes.ts
│   └── testHooks.ts
├── scripts/
│   └── generateSyntheticVideo.ts
├── tests/
│   ├── coordinateMapping.test.ts
│   └── pointerTracking.spec.ts
├── playwright.config.ts
├── tsconfig.json
└── vite.config.ts
```

## Functional requirements

The app should:

1. Display a video element in a fixed-size viewport.
2. Put a transparent overlay above the video.
3. Record pointer events from the overlay:
   - `pointerdown`
   - `pointermove` while dragging
   - `pointerup`
4. For each recorded event, store:
   - event type
   - browser/client coordinates
   - video current time
   - calculated video pixel X/Y
   - whether the event was inside the visible video image area
5. Expose recorded events to tests through a safe test hook, for example:

```ts
window.__videoTrackerTestApi = {
  getRecordedEvents: () => recordedEvents,
  clearRecordedEvents: () => void,
  seekTo: async (seconds: number) => void,
  getVideoInfo: () => ...
};
```

6. Support a synthetic video file used by tests.

## Coordinate mapping requirements

Create a pure function in `src/coordinateMapping.ts` that converts pointer coordinates to video pixel coordinates.

It should account for:

- the overlay bounding rectangle
- the intrinsic video dimensions: `video.videoWidth`, `video.videoHeight`
- the displayed viewport dimensions
- `object-fit: contain`
- letterboxing / pillarboxing

The function should return something like:

```ts
export interface VideoCoordinateMappingInput {
  clientX: number;
  clientY: number;
  containerRect: DOMRectLike;
  videoWidth: number;
  videoHeight: number;
}

export interface VideoCoordinateMappingResult {
  insideVideo: boolean;
  videoX: number;
  videoY: number;
  displayedVideoLeft: number;
  displayedVideoTop: number;
  displayedVideoWidth: number;
  displayedVideoHeight: number;
}
```

Do not hide this logic inside React. It must be easy to unit test.

## Synthetic video

Create a script that generates a deterministic synthetic test video.

Preferred approach:

- Generate frames using Node canvas if easy, or use ffmpeg filters if simpler.
- The synthetic video should make it possible to identify expected video coordinates from pixel colour.
- Keep the video small, e.g. 320x180 or 256x144.
- Keep duration short, e.g. 2 seconds.

A simple encoding is acceptable:

```text
red   = x mod 256
green = y mod 256
blue  = frame index or constant
```

If exact colour preservation through video compression is hard, use a lossless or near-lossless format, or use broad colour blocks instead of per-pixel encoding.

For the first implementation, broad colour blocks are acceptable, for example:

```text
left third   = red
middle third = green
right third  = blue
horizontal bands vary by y position
```

But add comments explaining the intended future improvement: pixel-level coordinate decoding.

## Tests

Create two test layers.

### 1. Unit tests

Test `coordinateMapping.ts` directly.

Include cases for:

- no letterboxing: container aspect ratio matches video aspect ratio
- pillarboxing: container wider than video aspect ratio
- letterboxing: container taller than video aspect ratio
- pointer outside visible video area

### 2. Playwright tests

Create an end-to-end test that:

1. Starts the Vite app.
2. Loads the synthetic video.
3. Waits for metadata to load.
4. Simulates mouse drag across the overlay using Playwright.
5. Reads recorded events from `window.__videoTrackerTestApi`.
6. Verifies that events were recorded.
7. Verifies that calculated video coordinates are plausible.
8. If possible, sample the video frame using a canvas and compare the expected colour region with the recorded coordinate.

The first Playwright verifier does not need to be perfect, but it must be real and automated.

## Docker requirements

Create a Dockerfile that can run the tests reproducibly.

It should:

- use a pinned Node image version
- install dependencies
- install Playwright browsers/dependencies
- build the app
- run unit tests and Playwright tests

Example commands should work:

```bash
docker build -t video-tracker-test .
docker run --rm video-tracker-test
```

## Scripts

`package.json` should include scripts like:

```json
{
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "vite build",
    "test": "vitest run && playwright test",
    "test:unit": "vitest run",
    "test:e2e": "playwright test",
    "generate:video": "tsx scripts/generateSyntheticVideo.ts"
  }
}
```

Use Vitest for unit tests if convenient.

## README

Write a README explaining:

- what the project does
- how mouse tracking works
- how coordinate conversion works
- how to run locally
- how to run tests
- how to run in Docker
- known limitations

## Important design guidance

Keep this first implementation simple. It is acceptable if there are some limitations, because I may use this as the starting point for an agentic coding challenge where the agent has to fix a bug or improve the verifier.

However, do not intentionally sabotage the code. Make a sincere first implementation with clear tests.

Likely future DataAnnotation-style challenge ideas:

- fix coordinate mapping when CSS object-fit creates letterboxing
- improve synthetic video verifier to detect exact coordinates from colour
- fix a bug where recorded times are stale during drag
- make tests fail on incorrect device-pixel-ratio handling
- make exported JSON schema stricter

Please implement the initial codebase now.
