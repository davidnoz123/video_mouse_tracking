import React, { useRef, useEffect, useCallback } from 'react';
import type { PointerEventRecord } from './recordingTypes';
import { mapToVideoCoordinates } from './coordinateMapping';
import type { VideoTrackerTestApi } from './testHooks';

interface VideoTrackerProps {
  src: string;
  containerWidth?: number;
  containerHeight?: number;
}

export function VideoTracker({
  src,
  containerWidth = 640,
  containerHeight = 360,
}: VideoTrackerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const recordedEventsRef = useRef<PointerEventRecord[]>([]);
  const isDraggingRef = useRef(false);

  const recordEvent = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, type: PointerEventRecord['type']) => {
      const video = videoRef.current;
      const overlay = overlayRef.current;
      if (!video || !overlay) return;

      const containerRect = overlay.getBoundingClientRect();
      const result = mapToVideoCoordinates({
        clientX: e.clientX,
        clientY: e.clientY,
        containerRect,
        // Fall back to the container size when metadata hasn't loaded yet
        videoWidth: video.videoWidth || containerWidth,
        videoHeight: video.videoHeight || containerHeight,
      });

      const record: PointerEventRecord = {
        type,
        clientX: e.clientX,
        clientY: e.clientY,
        videoTime: video.currentTime,
        videoX: result.videoX,
        videoY: result.videoY,
        insideVideo: result.insideVideo,
      };

      recordedEventsRef.current.push(record);
    },
    [containerWidth, containerHeight],
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      isDraggingRef.current = true;
      (e.target as Element).setPointerCapture(e.pointerId);
      recordEvent(e, 'pointerdown');
    },
    [recordEvent],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDraggingRef.current) return;
      recordEvent(e, 'pointermove');
    },
    [recordEvent],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      recordEvent(e, 'pointerup');
    },
    [recordEvent],
  );

  // Expose test API on window so Playwright tests can read state
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const api: VideoTrackerTestApi = {
      getRecordedEvents: () => [...recordedEventsRef.current],
      clearRecordedEvents: () => {
        recordedEventsRef.current = [];
      },
      seekTo: (seconds: number) =>
        new Promise<void>((resolve) => {
          if (!video) {
            resolve();
            return;
          }
          video.currentTime = seconds;
          const onSeeked = () => {
            video.removeEventListener('seeked', onSeeked);
            resolve();
          };
          video.addEventListener('seeked', onSeeked);
        }),
      getVideoInfo: () => ({
        videoWidth: video.videoWidth,
        videoHeight: video.videoHeight,
        currentTime: video.currentTime,
        duration: video.duration,
        src: video.src,
      }),
    };

    window.__videoTrackerTestApi = api;

    return () => {
      delete window.__videoTrackerTestApi;
    };
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        width: containerWidth,
        height: containerHeight,
        backgroundColor: '#000',
        overflow: 'hidden',
      }}
    >
      <video
        ref={videoRef}
        src={src}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block',
        }}
        controls
        preload="auto"
      />
      {/* Transparent overlay captures all pointer events above the video */}
      <div
        ref={overlayRef}
        data-testid="video-overlay"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          cursor: 'crosshair',
          zIndex: 10,
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      />
    </div>
  );
}
