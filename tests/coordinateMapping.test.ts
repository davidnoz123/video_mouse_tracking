import { describe, it, expect } from 'vitest';
import { mapToVideoCoordinates } from '../src/coordinateMapping';

const VIDEO_W = 320;
const VIDEO_H = 180;

describe('mapToVideoCoordinates', () => {
  it('maps center correctly when aspect ratios match (no letterboxing)', () => {
    // Container 640×360 and video 320×180 are both 16:9 — no bars
    const rect = { left: 0, top: 0, width: 640, height: 360 };

    const result = mapToVideoCoordinates({
      clientX: 320, // horizontal center of container
      clientY: 180, // vertical center
      containerRect: rect,
      videoWidth: VIDEO_W,
      videoHeight: VIDEO_H,
    });

    expect(result.insideVideo).toBe(true);
    expect(result.videoX).toBeCloseTo(160, 0); // center of 320px video
    expect(result.videoY).toBeCloseTo(90, 0);  // center of 180px video
    // Full container is used — no bars
    expect(result.displayedVideoWidth).toBeCloseTo(640, 0);
    expect(result.displayedVideoHeight).toBeCloseTo(360, 0);
    expect(result.displayedVideoLeft).toBeCloseTo(0, 0);
    expect(result.displayedVideoTop).toBeCloseTo(0, 0);
  });

  it('handles pillarboxing (container wider than video aspect ratio)', () => {
    // Container 800×360, video 16:9 → displayed as 640×360 centred with 80px bars each side
    const rect = { left: 0, top: 0, width: 800, height: 360 };

    const result = mapToVideoCoordinates({
      clientX: 80 + 320, // center of displayed video (bar=80, half of 640)
      clientY: 180,
      containerRect: rect,
      videoWidth: VIDEO_W,
      videoHeight: VIDEO_H,
    });

    expect(result.insideVideo).toBe(true);
    expect(result.videoX).toBeCloseTo(160, 0);
    expect(result.videoY).toBeCloseTo(90, 0);
    expect(result.displayedVideoWidth).toBeCloseTo(640, 0);
    expect(result.displayedVideoLeft).toBeCloseTo(80, 0);
  });

  it('handles letterboxing (container taller than video aspect ratio)', () => {
    // Container 640×480, video 16:9 → displayed as 640×360 centred with 60px bars top/bottom
    const rect = { left: 0, top: 0, width: 640, height: 480 };

    const result = mapToVideoCoordinates({
      clientX: 320,
      clientY: 60 + 180, // center of displayed video (bar=60, half of 360)
      containerRect: rect,
      videoWidth: VIDEO_W,
      videoHeight: VIDEO_H,
    });

    expect(result.insideVideo).toBe(true);
    expect(result.videoX).toBeCloseTo(160, 0);
    expect(result.videoY).toBeCloseTo(90, 0);
    expect(result.displayedVideoHeight).toBeCloseTo(360, 0);
    expect(result.displayedVideoTop).toBeCloseTo(60, 0);
  });

  it('returns insideVideo=false for a click in the left pillarbox bar', () => {
    // Container 800×360, bars at x < 80 and x > 720
    const rect = { left: 0, top: 0, width: 800, height: 360 };

    const result = mapToVideoCoordinates({
      clientX: 30, // inside left pillarbox bar
      clientY: 180,
      containerRect: rect,
      videoWidth: VIDEO_W,
      videoHeight: VIDEO_H,
    });

    expect(result.insideVideo).toBe(false);
  });

  it('returns insideVideo=false for a click in the top letterbox bar', () => {
    // Container 640×480, bars at y < 60 and y > 420
    const rect = { left: 0, top: 0, width: 640, height: 480 };

    const result = mapToVideoCoordinates({
      clientX: 320,
      clientY: 20, // inside top letterbox bar
      containerRect: rect,
      videoWidth: VIDEO_W,
      videoHeight: VIDEO_H,
    });

    expect(result.insideVideo).toBe(false);
  });

  it('maps top-left corner of video correctly', () => {
    const rect = { left: 100, top: 50, width: 640, height: 360 };

    const result = mapToVideoCoordinates({
      clientX: 100, // left edge
      clientY: 50,  // top edge
      containerRect: rect,
      videoWidth: VIDEO_W,
      videoHeight: VIDEO_H,
    });

    expect(result.insideVideo).toBe(true);
    expect(result.videoX).toBeCloseTo(0, 0);
    expect(result.videoY).toBeCloseTo(0, 0);
  });

  it('maps bottom-right corner of video correctly', () => {
    const rect = { left: 0, top: 0, width: 640, height: 360 };

    const result = mapToVideoCoordinates({
      clientX: 640, // right edge
      clientY: 360, // bottom edge
      containerRect: rect,
      videoWidth: VIDEO_W,
      videoHeight: VIDEO_H,
    });

    expect(result.insideVideo).toBe(true);
    expect(result.videoX).toBeCloseTo(320, 0);
    expect(result.videoY).toBeCloseTo(180, 0);
  });
});
