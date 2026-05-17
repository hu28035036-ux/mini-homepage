// 그림판 상수 — 대표색·펜 메타·굵기 범위

import type { PenType, ShapeKind } from './types';

/** 캔버스 고정 해상도 */
export const CANVAS_W = 800;
export const CANVAS_H = 600;

/** 굵기 슬라이더 범위 */
export const THICKNESS_MIN = 1;
export const THICKNESS_MAX = 100;
export const THICKNESS_DEFAULT = 6;

/** 픽셀 지우개 폭 상한 캡 */
export const PIXEL_ERASER_MAX = 60;

/** 대표색 7가지 (검정/흰색/빨강/주황/초록/파랑/보라) */
export const PRESET_COLORS = [
  '#000000',
  '#ffffff',
  '#e11d48',
  '#f59e0b',
  '#22c55e',
  '#3b82f6',
  '#a855f7',
] as const;

/** 펜별 메타 — 라벨/투명도/폭 배수 */
export interface PenMeta {
  label: string;
  /** 기본 alpha (0~1) */
  alpha: number;
  /** thickness에 곱하는 폭 배수 */
  widthMul: number;
}

export const PEN_META: Record<PenType, PenMeta> = {
  highlighter: { label: '형광펜', alpha: 0.35, widthMul: 2.4 },
  fountain: { label: '만년필', alpha: 1, widthMul: 1 },
  pencil: { label: '연필', alpha: 0.55, widthMul: 0.9 },
  ballpoint: { label: '볼펜', alpha: 1, widthMul: 0.8 },
  brush: { label: '브러쉬', alpha: 1, widthMul: 1.6 },
};

export const PEN_ORDER: PenType[] = ['highlighter', 'fountain', 'pencil', 'ballpoint', 'brush'];

/** 도형별 라벨 */
export const SHAPE_META: Record<ShapeKind, { label: string }> = {
  line: { label: '직선' },
  rect: { label: '사각형' },
  ellipse: { label: '원·타원' },
  triangle: { label: '삼각형' },
  arrow: { label: '화살표' },
  star: { label: '별' },
};

export const SHAPE_ORDER: ShapeKind[] = ['line', 'rect', 'ellipse', 'triangle', 'arrow', 'star'];
