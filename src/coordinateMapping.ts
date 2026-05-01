/**
 * A plain object version of DOMRect so the function can be called from
 * unit tests without a real DOM.
 */
export interface DOMRectLike {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface VideoCoordinateMappingInput {
  clientX: number;
  clientY: number;
  containerRect: DOMRectLike;
  videoWidth: number;
  videoHeight: number;
}

export interface VideoCoordinateMappingResult {
  insideVideo: boolean;
  /** X position in video pixel space (may be outside [0, videoWidth] if insideVideo is false) */
  videoX: number;
  /** Y position in video pixel space (may be outside [0, videoHeight] if insideVideo is false) */
  videoY: number;
  displayedVideoLeft: number;
  displayedVideoTop: number;
  displayedVideoWidth: number;
  displayedVideoHeight: number;
}

/**
 * Maps a browser client coordinate to a video pixel coordinate.
 *
 * Accounts for object-fit: contain letterboxing/pillarboxing: the video is
 * scaled to fit the container while preserving its aspect ratio, centred
 * both horizontally and vertically. Any remaining space is black bars.
 */
export function mapToVideoCoordinates(
  input: VideoCoordinateMappingInput,
): VideoCoordinateMappingResult {
  const { clientX, clientY, containerRect, videoWidth, videoHeight } = input;

  const containerAspect = containerRect.width / containerRect.height;
  const videoAspect = videoWidth / videoHeight;

  let displayedWidth: number;
  let displayedHeight: number;

  if (videoAspect > containerAspect) {
    // Letterboxing: video is wider than container — black bars on top/bottom
    displayedWidth = containerRect.width;
    displayedHeight = containerRect.width / videoAspect;
  } else {
    // Pillarboxing: video is taller than container — black bars on left/right
    displayedHeight = containerRect.height;
    displayedWidth = containerRect.height * videoAspect;
  }

  const displayedLeft = containerRect.left + (containerRect.width - displayedWidth) / 2;
  const displayedTop = containerRect.top + (containerRect.height - displayedHeight) / 2;

  const relX = clientX - displayedLeft;
  const relY = clientY - displayedTop;

  const insideVideo =
    relX >= 0 && relX <= displayedWidth && relY >= 0 && relY <= displayedHeight;

  const videoX = (relX / displayedWidth) * videoWidth;
  const videoY = (relY / displayedHeight) * videoHeight;

  return {
    insideVideo,
    videoX,
    videoY,
    displayedVideoLeft: displayedLeft,
    displayedVideoTop: displayedTop,
    displayedVideoWidth: displayedWidth,
    displayedVideoHeight: displayedHeight,
  };
}
