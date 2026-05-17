'use client';

import { useEffect, useReducer, useRef, useState } from 'react';
import { Modal, Button, GhostButton } from '@/components/ui/primitives';
import { Toolbar } from './Toolbar';
import { renderElements } from './engine';
import { pickElement } from './hitTest';
import { CANVAS_W, CANVAS_H, THICKNESS_DEFAULT, PIXEL_ERASER_MAX } from './constants';
import type { DrawElement, StrokePoint, Tool } from './types';

interface DrawPadProps {
  open: boolean;
  initialUrl?: string | null;
  onClose: () => void;
  onSave: (url: string) => void;
}

declare global {
  interface Window {
    __drawpad?: { count: number; elements: DrawElement[]; tool: Tool; color: string; thickness: number };
  }
}

export function DrawPad({ open, initialUrl, onClose, onSave }: DrawPadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgImgRef = useRef<HTMLImageElement | null>(null);
  const elementsRef = useRef<DrawElement[]>([]);
  const draftRef = useRef<DrawElement | null>(null);
  const [, forceRender] = useReducer((x: number) => x + 1, 0);

  const [tool, setTool] = useState<Tool>({ type: 'pen', pen: 'ballpoint' });
  const [color, setColor] = useState('#000000');
  const [thickness, setThickness] = useState(THICKNESS_DEFAULT);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  // e2e용 — 읽기 전용 상태 노출
  useEffect(() => {
    window.__drawpad = { count: elementsRef.current.length, elements: elementsRef.current, tool, color, thickness };
  });

  const redraw = () => {
    const cv = canvasRef.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx) return;
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, cv.width, cv.height);
    if (bgImgRef.current) ctx.drawImage(bgImgRef.current, 0, 0, cv.width, cv.height);
    const list = draftRef.current ? [...elementsRef.current, draftRef.current] : elementsRef.current;
    renderElements(ctx, list);
  };

  // 초기화 + 기존 PNG 로드
  useEffect(() => {
    if (!open) return;
    const cv = canvasRef.current;
    if (!cv) return;
    cv.width = CANVAS_W;
    cv.height = CANVAS_H;
    elementsRef.current = [];
    draftRef.current = null;
    bgImgRef.current = null;
    forceRender();
    if (initialUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => { bgImgRef.current = img; redraw(); };
      img.src = initialUrl;
    }
    redraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialUrl]);

  const getPoint = (e: React.PointerEvent): StrokePoint => {
    const cv = canvasRef.current!;
    const rect = cv.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * cv.width,
      y: ((e.clientY - rect.top) / rect.height) * cv.height,
      t: performance.now(),
    };
  };

  const commit = (el: DrawElement) => {
    elementsRef.current = [...elementsRef.current, el];
    forceRender();
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const p = getPoint(e);

    if (tool.type === 'eraser' && tool.mode === 'object') {
      const idx = pickElement(elementsRef.current, p.x, p.y);
      if (idx >= 0) {
        elementsRef.current = elementsRef.current.filter((_, i) => i !== idx);
        forceRender();
        redraw();
      }
      return;
    }

    if (tool.type === 'shape') {
      draftRef.current = {
        kind: 'shape', shape: tool.shape, color, width: thickness,
        x1: p.x, y1: p.y, x2: p.x, y2: p.y,
      };
      return;
    }

    // pen 또는 픽셀 지우개 → 자유선
    const erase = tool.type === 'eraser';
    draftRef.current = {
      kind: 'freehand',
      pen: tool.type === 'pen' ? tool.pen : 'ballpoint',
      erase,
      color,
      width: erase ? Math.min(Math.max(thickness * 2, 14), PIXEL_ERASER_MAX) : thickness,
      points: [p],
    };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const draft = draftRef.current;
    if (!draft) return;
    e.preventDefault();
    const p = getPoint(e);
    if (draft.kind === 'freehand') draft.points.push(p);
    else { draft.x2 = p.x; draft.y2 = p.y; }
    redraw();
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const draft = draftRef.current;
    if (!draft) return;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    draftRef.current = null;
    commit(draft);
    redraw();
  };

  const undo = () => {
    elementsRef.current = elementsRef.current.slice(0, -1);
    forceRender();
    redraw();
  };
  const clear = () => {
    if (elementsRef.current.length > 0 && !confirm('전체 지우시겠어요?')) return;
    elementsRef.current = [];
    forceRender();
    redraw();
  };

  const save = async () => {
    const cv = canvasRef.current;
    if (!cv) return;
    setSaving(true);
    setErr('');
    try {
      const blob: Blob | null = await new Promise((resolve) => cv.toBlob(resolve, 'image/png'));
      if (!blob) { setErr('이미지 변환 실패'); setSaving(false); return; }
      const fd = new FormData();
      fd.append('file', new File([blob], 'drawing.png', { type: 'image/png' }));
      const r = await (await fetch('/api/decorate/drawing', { method: 'POST', body: fd })).json();
      if (!r.success) { setErr(r.message ?? '저장 실패'); setSaving(false); return; }
      onSave(r.data.drawing_url);
      setSaving(false);
      onClose();
    } catch (e) {
      console.error(e);
      setErr('네트워크 오류');
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="그림판" size="xl">
      <div className="space-y-3">
        <Toolbar
          tool={tool}
          color={color}
          thickness={thickness}
          onToolChange={setTool}
          onColorChange={setColor}
          onThicknessChange={setThickness}
          onUndo={undo}
          onClear={clear}
        />

        <canvas
          ref={canvasRef}
          data-drawpad-canvas
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="w-full aspect-[4/3] bg-white border border-black/10 rounded-lg touch-none"
          style={{ touchAction: 'none' }}
        />

        {err && <p className="text-sm text-rose-600">{err}</p>}

        <div className="flex items-center justify-end gap-2">
          <GhostButton onClick={onClose}>취소</GhostButton>
          <Button onClick={save} disabled={saving} aria-label="그림 저장">
            {saving ? '저장 중...' : '저장'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
