# DataAnnotation-Style Task Ideas

These are possible agentic coding challenges that could be created after the initial implementation exists.

## Task idea 1: Fix letterboxed video coordinate mapping

### Problem statement

The video tracker records incorrect video-pixel coordinates when the displayed video is letterboxed or pillarboxed due to `object-fit: contain`. Fix the coordinate conversion so that pointer positions are mapped to true video pixel coordinates.

### Expected behaviour

- Pointer events inside the visible video area should produce accurate `videoX` and `videoY` values.
- Pointer events in the letterboxed/pillarboxed area should be marked as outside the video.
- Existing tests should pass.
- Add tests for both letterboxing and pillarboxing.

### Verifier

- Unit tests for coordinate mapping.
- Playwright drag test in a viewport with deliberate aspect-ratio mismatch.
- Assert accuracy within ±2 pixels.

## Task idea 2: Improve synthetic video colour verifier

### Problem statement

The current E2E test only checks that recorded coordinates are plausible. Improve the verifier so it samples the synthetic video frame and confirms that the recorded coordinates match the colour-coded expected position.

### Expected behaviour

- Generate or use a deterministic synthetic video.
- Decode expected position/region from sampled pixel colour.
- Compare decoded expected coordinate/region to recorded coordinate.

### Verifier

- Playwright test must fail if X/Y mapping is swapped, offset, or scaled incorrectly.

## Task idea 3: Fix stale video time recording

### Problem statement

Pointer drag events are recorded with stale or incorrect video timestamps. Fix the recorder so every pointer sample stores the current video time at the moment of the pointer event.

### Expected behaviour

- During playback, later drag samples should have non-decreasing video times.
- When paused and seeked, samples should reflect the seeked time.

### Verifier

- Playwright test starts playback, performs drag, and checks monotonic timestamps.
- Another test seeks to a known time and checks recorded event time within tolerance.

## Task idea 4: Export schema validation

### Problem statement

The app exports loosely structured JSON. Add a strict schema for recorded pointer tracks and validate exported data.

### Expected behaviour

- Recorded events have stable field names and numeric values.
- Exported JSON validates against the schema.
- Invalid entries are rejected or not exported.

### Verifier

- Unit test schema validation.
- E2E test records a drag, exports JSON, validates it.

