# Testing Strategy

## Goal

Prove that automated browser tests can simulate mouse interaction over a video and validate the app's calculated video coordinates.

## Recommended approach

Use Playwright rather than OS-level mouse automation.

Reason:

- Works reliably in headless Linux.
- Works inside Docker.
- Avoids needing a real desktop session, X11 forwarding, or VNC.
- Can precisely target DOM elements and bounding boxes.

## Coordinate validation levels

### Level 1: Pure unit tests

Test the coordinate mapping function directly.

Inputs:

- clientX/clientY
- container rect
- video intrinsic width/height

Outputs:

- insideVideo
- videoX/videoY
- displayed video rect

This catches most mathematical/layout bugs.

### Level 2: DOM/Playwright tests

Use Playwright to:

- load the app
- find the overlay
- get its bounding box
- simulate mouse drag
- read recorded events from a test API
- verify calculated coordinates

This catches event handling and integration bugs.

### Level 3: Synthetic-video colour verification

Use a deterministic synthetic video.

Options:

1. Region-based colours:
   - easiest and robust under compression
   - verifies broad coordinate correctness

2. Per-pixel encoded colours:
   - stronger verifier
   - may require lossless video format or careful ffmpeg settings

For the initial implementation, region-based colours are fine. Add notes for future per-pixel improvement.

## Suggested Playwright assertions

- At least one `pointerdown`, several `pointermove`, and one `pointerup` event are recorded.
- All drag samples inside the visible video area have numeric video coordinates.
- Coordinates are within video bounds.
- Coordinates move monotonically when the mouse drag is monotonic.
- In known colour regions, recorded coordinates correspond to the expected region.

## Docker notes

Use Playwright's browser install command inside the Dockerfile.

Typical command:

```bash
npx playwright install --with-deps chromium
```

The final Docker run should execute:

```bash
npm test
```

