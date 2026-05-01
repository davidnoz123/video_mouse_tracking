import { test, expect } from '@playwright/test';
import type { VideoTrackerTestApi } from '../src/testHooks';

// Augment the Playwright window type
declare global {
  interface Window {
    __videoTrackerTestApi?: VideoTrackerTestApi;
  }
}

test.describe('Pointer tracking', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Wait until the video element has loaded at least its metadata
    await page.waitForFunction(
      () => {
        const video = document.querySelector('video');
        return video !== null && video.readyState >= 1; // HAVE_METADATA
      },
      { timeout: 15_000 },
    );
  });

  test('records pointerdown, pointermove and pointerup during a drag', async ({
    page,
  }) => {
    const overlay = page.getByTestId('video-overlay');
    await expect(overlay).toBeVisible();

    await page.evaluate(() => window.__videoTrackerTestApi?.clearRecordedEvents());

    const box = await overlay.boundingBox();
    expect(box).not.toBeNull();

    // Drag from left quarter to right quarter across the vertical centre
    const y = box!.y + box!.height * 0.5;
    await page.mouse.move(box!.x + box!.width * 0.2, y);
    await page.mouse.down();
    await page.mouse.move(box!.x + box!.width * 0.5, y, { steps: 5 });
    await page.mouse.move(box!.x + box!.width * 0.8, y, { steps: 5 });
    await page.mouse.up();

    const events = await page.evaluate(
      () => window.__videoTrackerTestApi?.getRecordedEvents() ?? [],
    );

    expect(events.length).toBeGreaterThan(0);
    expect(events.some((e) => e.type === 'pointerdown')).toBe(true);
    expect(events.some((e) => e.type === 'pointermove')).toBe(true);
    expect(events.some((e) => e.type === 'pointerup')).toBe(true);
  });

  test('recorded events include plausible video coordinates', async ({ page }) => {
    const overlay = page.getByTestId('video-overlay');
    const box = await overlay.boundingBox();
    expect(box).not.toBeNull();

    await page.evaluate(() => window.__videoTrackerTestApi?.clearRecordedEvents());

    const y = box!.y + box!.height * 0.5;
    await page.mouse.move(box!.x + 10, y);
    await page.mouse.down();
    await page.mouse.move(box!.x + box!.width - 10, y, { steps: 10 });
    await page.mouse.up();

    const events = await page.evaluate(
      () => window.__videoTrackerTestApi?.getRecordedEvents() ?? [],
    );
    const videoInfo = await page.evaluate(
      () => window.__videoTrackerTestApi?.getVideoInfo(),
    );

    expect(videoInfo).toBeDefined();

    const insideEvents = events.filter((e) => e.insideVideo);
    expect(insideEvents.length).toBeGreaterThan(0);

    for (const event of insideEvents) {
      expect(event.videoX).toBeGreaterThanOrEqual(0);
      expect(event.videoX).toBeLessThanOrEqual(videoInfo!.videoWidth);
      expect(event.videoY).toBeGreaterThanOrEqual(0);
      expect(event.videoY).toBeLessThanOrEqual(videoInfo!.videoHeight);
    }
  });

  test('videoX increases monotonically during a left-to-right drag', async ({
    page,
  }) => {
    const overlay = page.getByTestId('video-overlay');
    const box = await overlay.boundingBox();
    expect(box).not.toBeNull();

    await page.evaluate(() => window.__videoTrackerTestApi?.clearRecordedEvents());

    const y = box!.y + box!.height * 0.5;
    await page.mouse.move(box!.x + box!.width * 0.1, y);
    await page.mouse.down();
    // Move steadily right in 10 equal steps
    for (let i = 1; i <= 10; i++) {
      await page.mouse.move(box!.x + box!.width * (0.1 + i * 0.08), y);
    }
    await page.mouse.up();

    const events = await page.evaluate(
      () => window.__videoTrackerTestApi?.getRecordedEvents() ?? [],
    );
    const moveEvents = events.filter(
      (e) => e.type === 'pointermove' && e.insideVideo,
    );

    expect(moveEvents.length).toBeGreaterThan(3);

    // Each recorded videoX should be >= the previous one (allow 1px tolerance)
    for (let i = 1; i < moveEvents.length; i++) {
      expect(moveEvents[i].videoX).toBeGreaterThanOrEqual(
        moveEvents[i - 1].videoX - 1,
      );
    }
  });

  test('seekTo moves the video to the requested time', async ({ page }) => {
    await page.evaluate(() => window.__videoTrackerTestApi?.seekTo(1.0));

    const time = await page.evaluate(
      () => window.__videoTrackerTestApi?.getVideoInfo().currentTime,
    );
    expect(time).toBeGreaterThanOrEqual(0.9);
    expect(time).toBeLessThanOrEqual(1.1);
  });

  test('clearRecordedEvents empties the event list', async ({ page }) => {
    const overlay = page.getByTestId('video-overlay');
    const box = await overlay.boundingBox();
    expect(box).not.toBeNull();

    // Record some events first
    const y = box!.y + box!.height * 0.5;
    await page.mouse.move(box!.x + 50, y);
    await page.mouse.down();
    await page.mouse.move(box!.x + 100, y);
    await page.mouse.up();

    await page.evaluate(() => window.__videoTrackerTestApi?.clearRecordedEvents());

    const events = await page.evaluate(
      () => window.__videoTrackerTestApi?.getRecordedEvents() ?? [],
    );
    expect(events.length).toBe(0);
  });
});
