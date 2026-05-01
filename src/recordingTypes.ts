export type PointerEventType = 'pointerdown' | 'pointermove' | 'pointerup';

export interface PointerEventRecord {
  type: PointerEventType;
  clientX: number;
  clientY: number;
  videoTime: number;
  videoX: number;
  videoY: number;
  insideVideo: boolean;
}
