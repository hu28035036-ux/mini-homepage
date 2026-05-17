// 기하 헬퍼 — 거리·다각형 판정·별/화살표 꼭짓점·속도 계산

import type { StrokePoint } from './types';

/** 점(px,py)에서 선분 (ax,ay)-(bx,by)까지 최단 거리 */
export function distToSegment(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return Math.hypot(px - ax, py - ay);
  let t = ((px - ax) * dx + (py - ay) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/** 점이 다각형(꼭짓점 배열) 내부인지 — ray casting */
export function pointInPolygon(px: number, py: number, poly: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    const intersect =
      yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/** 삼각형 꼭짓점 — 바운딩박스 (x1,y1)-(x2,y2) 기준 (위 꼭짓점 + 아래 두 점) */
export function trianglePoints(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): [number, number][] {
  return [
    [(x1 + x2) / 2, y1],
    [x2, y2],
    [x1, y2],
  ];
}

/** 5각 별 꼭짓점 10개 — 바운딩박스 중심/반경 기준 */
export function starPoints(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): [number, number][] {
  const cx = (x1 + x2) / 2;
  const cy = (y1 + y2) / 2;
  const rOut = Math.min(Math.abs(x2 - x1), Math.abs(y2 - y1)) / 2;
  const rIn = rOut * 0.4;
  const pts: [number, number][] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? rOut : rIn;
    const ang = (Math.PI / 5) * i - Math.PI / 2;
    pts.push([cx + r * Math.cos(ang), cy + r * Math.sin(ang)]);
  }
  return pts;
}

/** 화살표 머리 두 날개 끝점 — (x2,y2)가 화살촉 */
export function arrowHead(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  size: number,
): [[number, number], [number, number]] {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const a1 = ang + Math.PI - Math.PI / 7;
  const a2 = ang + Math.PI + Math.PI / 7;
  return [
    [x2 + size * Math.cos(a1), y2 + size * Math.sin(a1)],
    [x2 + size * Math.cos(a2), y2 + size * Math.sin(a2)],
  ];
}

/**
 * 구간 속도 → 폭 배수 (만년필). 느릴수록 굵게(최대 1), 빠를수록 가늘게(최소 0.3).
 */
export function velocityWidthFactor(a: StrokePoint, b: StrokePoint): number {
  const dist = Math.hypot(b.x - a.x, b.y - a.y);
  const dt = Math.max(b.t - a.t, 1);
  const speed = dist / dt; // px/ms
  const f = 1 - Math.min(speed / 1.5, 1) * 0.7;
  return Math.max(0.3, Math.min(1, f));
}
