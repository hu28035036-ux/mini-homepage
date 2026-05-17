// 그림판 렌더링 엔진 — DrawElement[] 를 캔버스에 그린다 (순수 함수, React 비의존)

import type { DrawElement, FreehandElement, ShapeElement, StrokePoint } from './types';
import { PEN_META } from './constants';
import { trianglePoints, starPoints, arrowHead, velocityWidthFactor } from './geometry';

type Ctx = CanvasRenderingContext2D;

function segment(ctx: Ctx, a: StrokePoint, b: StrokePoint) {
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}

function dot(ctx: Ctx, p: StrokePoint, w: number) {
  ctx.beginPath();
  ctx.arc(p.x, p.y, Math.max(0.5, w / 2), 0, Math.PI * 2);
  ctx.fill();
}

function strokePolyline(ctx: Ctx, pts: StrokePoint[]) {
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.stroke();
}

function drawFreehand(ctx: Ctx, el: FreehandElement) {
  const pts = el.points;
  if (pts.length === 0) return;
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = el.pen === 'highlighter' ? 'butt' : 'round';

  if (el.erase) {
    // 픽셀 지우개 — destination-out 으로 알파 제거
    ctx.globalCompositeOperation = 'destination-out';
    ctx.strokeStyle = 'rgba(0,0,0,1)';
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.lineWidth = el.width;
    if (pts.length === 1) dot(ctx, pts[0], el.width);
    else strokePolyline(ctx, pts);
    ctx.restore();
    return;
  }

  const meta = PEN_META[el.pen];
  const baseW = Math.max(0.5, el.width * meta.widthMul);
  ctx.globalAlpha = meta.alpha;
  ctx.strokeStyle = el.color;
  ctx.fillStyle = el.color;

  if (el.pen === 'highlighter') {
    ctx.globalCompositeOperation = 'multiply';
    ctx.lineWidth = baseW;
    if (pts.length === 1) dot(ctx, pts[0], baseW);
    else strokePolyline(ctx, pts);
  } else if (el.pen === 'fountain') {
    // 만년필 — 구간 속도에 따라 폭 변화
    if (pts.length === 1) {
      dot(ctx, pts[0], baseW);
    } else {
      for (let i = 1; i < pts.length; i++) {
        ctx.lineWidth = Math.max(0.5, baseW * velocityWidthFactor(pts[i - 1], pts[i]));
        segment(ctx, pts[i - 1], pts[i]);
      }
    }
  } else if (el.pen === 'brush') {
    // 브러쉬 — 획 양끝이 가늘어지는 테이퍼
    const n = pts.length;
    if (n === 1) {
      dot(ctx, pts[0], baseW);
    } else {
      for (let i = 1; i < n; i++) {
        const taper = Math.sin(Math.PI * (i / n)); // 0 → 1 → 0
        ctx.lineWidth = Math.max(0.5, baseW * (0.2 + 0.8 * taper));
        segment(ctx, pts[i - 1], pts[i]);
      }
    }
  } else {
    // 볼펜(alpha 1) · 연필(alpha 0.55) — 일정 폭
    ctx.lineWidth = baseW;
    if (pts.length === 1) dot(ctx, pts[0], baseW);
    else strokePolyline(ctx, pts);
  }
  ctx.restore();
}

function drawShape(ctx: Ctx, el: ShapeElement) {
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.strokeStyle = el.color;
  ctx.lineWidth = Math.max(1, el.width);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const { x1, y1, x2, y2 } = el;
  ctx.beginPath();
  if (el.shape === 'line') {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
  } else if (el.shape === 'rect') {
    ctx.rect(Math.min(x1, x2), Math.min(y1, y2), Math.abs(x2 - x1), Math.abs(y2 - y1));
  } else if (el.shape === 'ellipse') {
    ctx.ellipse(
      (x1 + x2) / 2, (y1 + y2) / 2,
      Math.abs(x2 - x1) / 2, Math.abs(y2 - y1) / 2,
      0, 0, Math.PI * 2,
    );
  } else if (el.shape === 'triangle') {
    const tp = trianglePoints(x1, y1, x2, y2);
    ctx.moveTo(tp[0][0], tp[0][1]);
    ctx.lineTo(tp[1][0], tp[1][1]);
    ctx.lineTo(tp[2][0], tp[2][1]);
    ctx.closePath();
  } else if (el.shape === 'arrow') {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    const head = Math.max(8, el.width * 3);
    const [w1, w2] = arrowHead(x1, y1, x2, y2, head);
    ctx.moveTo(w1[0], w1[1]);
    ctx.lineTo(x2, y2);
    ctx.lineTo(w2[0], w2[1]);
  } else {
    // star
    const sp = starPoints(x1, y1, x2, y2);
    ctx.moveTo(sp[0][0], sp[0][1]);
    for (let i = 1; i < sp.length; i++) ctx.lineTo(sp[i][0], sp[i][1]);
    ctx.closePath();
  }
  ctx.stroke();
  ctx.restore();
}

/** elements 를 순서대로 ctx 에 그린다. 배경(흰색·기존 PNG)은 호출자가 미리 채운다. */
export function renderElements(ctx: Ctx, elements: DrawElement[]) {
  for (const el of elements) {
    if (el.kind === 'freehand') drawFreehand(ctx, el);
    else drawShape(ctx, el);
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
}
