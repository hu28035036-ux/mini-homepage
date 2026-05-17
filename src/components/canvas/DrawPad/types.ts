// 그림판 도구·요소 타입 정의 (세션 한정 벡터 모델)

/** 펜 5종 */
export type PenType = 'highlighter' | 'fountain' | 'pencil' | 'ballpoint' | 'brush';

/** 도형 6종 */
export type ShapeKind = 'line' | 'rect' | 'ellipse' | 'triangle' | 'arrow' | 'star';

/** 지우개 2종 */
export type EraserMode = 'pixel' | 'object';

/** 현재 활성 도구 */
export type Tool =
  | { type: 'pen'; pen: PenType }
  | { type: 'shape'; shape: ShapeKind }
  | { type: 'eraser'; mode: EraserMode };

/** 자유선 한 점 — t는 pointer 이벤트 timestamp(ms), 만년필 속도 계산용 */
export interface StrokePoint {
  x: number;
  y: number;
  t: number;
}

/** 자유선 요소 (펜·픽셀지우개 공용) */
export interface FreehandElement {
  kind: 'freehand';
  pen: PenType;
  /** true면 픽셀 지우개 획 (destination-out) */
  erase: boolean;
  color: string;
  width: number;
  points: StrokePoint[];
}

/** 도형 요소 — (x1,y1)→(x2,y2) 드래그 */
export interface ShapeElement {
  kind: 'shape';
  shape: ShapeKind;
  color: string;
  width: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** 캔버스에 쌓이는 한 요소 */
export type DrawElement = FreehandElement | ShapeElement;
