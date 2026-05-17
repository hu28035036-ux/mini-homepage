// 객체 지우개용 히트 테스트 — 좌표 아래 최상위 요소를 찾는다

import type { DrawElement, FreehandElement, ShapeElement } from './types';
import { distToSegment, pointInPolygon, trianglePoints, starPoints } from './geometry';

function freehandHit(el: FreehandElement, x: number, y: number, tol: number): boolean {
  const r = el.width / 2 + tol;
  const pts = el.points;
  if (pts.length === 0) return false;
  if (pts.length === 1) return Math.hypot(x - pts[0].x, y - pts[0].y) <= r;
  for (let i = 1; i < pts.length; i++) {
    if (distToSegment(x, y, pts[i - 1].x, pts[i - 1].y, pts[i].x, pts[i].y) <= r) return true;
  }
  return false;
}

function shapeHit(el: ShapeElement, x: number, y: number, tol: number): boolean {
  const { x1, y1, x2, y2 } = el;
  const r = el.width / 2 + tol;
  if (el.shape === 'line' || el.shape === 'arrow') {
    return distToSegment(x, y, x1, y1, x2, y2) <= r;
  }
  if (el.shape === 'rect') {
    return (
      x >= Math.min(x1, x2) - tol && x <= Math.max(x1, x2) + tol &&
      y >= Math.min(y1, y2) - tol && y <= Math.max(y1, y2) + tol
    );
  }
  if (el.shape === 'ellipse') {
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;
    const rx = Math.abs(x2 - x1) / 2 + tol;
    const ry = Math.abs(y2 - y1) / 2 + tol;
    if (rx <= 0 || ry <= 0) return false;
    const dx = (x - cx) / rx;
    const dy = (y - cy) / ry;
    return dx * dx + dy * dy <= 1;
  }
  if (el.shape === 'triangle') {
    return pointInPolygon(x, y, trianglePoints(x1, y1, x2, y2));
  }
  return pointInPolygon(x, y, starPoints(x1, y1, x2, y2));
}

/** (x,y) 아래의 최상위(가장 나중에 그린) 요소 인덱스. 없으면 -1. */
export function pickElement(elements: DrawElement[], x: number, y: number, tol = 6): number {
  for (let i = elements.length - 1; i >= 0; i--) {
    const el = elements[i];
    const hit = el.kind === 'freehand'
      ? freehandHit(el, x, y, tol)
      : shapeHit(el, x, y, tol);
    if (hit) return i;
  }
  return -1;
}
