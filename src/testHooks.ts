import type { PointerEventRecord } from './recordingTypes';

export interface VideoInfo {
  videoWidth: number;
  videoHeight: number;
  currentTime: number;
  duration: number;
  src: string;
}

export interface VideoTrackerTestApi {
  getRecordedEvents: () => PointerEventRecord[];
  clearRecordedEvents: () => void;
  seekTo: (seconds: number) => Promise<void>;
  getVideoInfo: () => VideoInfo;
}

declare global {
  interface Window {
    __videoTrackerTestApi?: VideoTrackerTestApi;
  }
}

// This empty export makes TypeScript treat this file as a module so the
// global augmentation above is scoped correctly.
export {};
