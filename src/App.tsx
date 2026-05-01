import React from 'react';
import { VideoTracker } from './VideoTracker';

export function App() {
  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ marginBottom: 16, fontSize: 20 }}>Video Mouse Tracker</h1>
      <VideoTracker src="/test-video.mp4" />
      <p style={{ marginTop: 12, fontSize: 13, color: '#aaa' }}>
        Click and drag over the video to record pointer events. Open the browser
        console and call{' '}
        <code>window.__videoTrackerTestApi.getRecordedEvents()</code> to inspect
        them.
      </p>
    </div>
  );
}
