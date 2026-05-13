'use client';

import { useEffect, useRef, useState } from 'react';
import { Modal, Button, GhostButton } from '@/components/ui/primitives';

const COLORS = ['#111111', '#dc2626', '#2563eb', '#16a34a', '#eab308'] as const;
const WIDTHS = [2, 4, 8] as const;

interface Stroke {
  color: string;
  width: number;
  erase: boolean;
  points: [number, number][];
}

export function DrawPad({
  open,
  initialUrl,
  onClose,
  onSave,
}: {
  open: boolean;
  initialUrl?: string | null;
  onClose: () => void;
  onSave: (url: string) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const drawingRef = useRef<Stroke | null>(null);
  const [color, setColor] = useState<string>(COLORS[0]);
  const [width, setWidth] = useState<number>(WIDTHS[0]);
  const [erase, setErase] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string>('');

  const redraw = () => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, cv.width, cv.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const s of strokesRef.current) {
      ctx.globalCompositeOperation = s.erase ? 'destination-out' : 'source-over';
      ctx.strokeStyle = s.color;
      ctx.lineWidth = s.width;
      if (s.points.length === 0) continue;
      ctx.beginPath();
      ctx.moveTo(s.points[0][0], s.points[0][1]);
      for (let i = 1; i < s.points.length; i++) {
        ctx.lineTo(s.points[i][0], s.points[i][1]);
      }
      ctx.stroke();
    }
    ctx.globalCompositeOperation = 'source-over';
  };

  // 초기 PNG 로드(기존 그림이 있으면)
  useEffect(() => {
    if (!open) return;
    const cv = canvasRef.current;
    if (!cv) return;
    cv.width = 800;
    cv.height = 600;
    strokesRef.current = [];
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, cv.width, cv.height);
    if (initialUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, cv.width, cv.height);
      };
      img.src = initialUrl;
    }
  }, [open, initialUrl]);

  const getPoint = (e: React.PointerEvent): [number, number] => {
    const cv = canvasRef.current!;
    const rect = cv.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * cv.width;
    const y = ((e.clientY - rect.top) / rect.height) * cv.height;
    return [x, y];
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drawingRef.current = {
      color,
      width: erase ? Math.max(width * 4, 12) : width,
      erase,
      points: [getPoint(e)],
    };
    strokesRef.current.push(drawingRef.current);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drawingRef.current) return;
    e.preventDefault();
    drawingRef.current.points.push(getPoint(e));
    redraw();
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!drawingRef.current) return;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    drawingRef.current = null;
  };

  const undo = () => {
    strokesRef.current.pop();
    redraw();
  };
  const clear = () => {
    if (!confirm('전체 지우시겠어요?')) return;
    strokesRef.current = [];
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
      if (!r.success) {
        setErr(r.message ?? '저장 실패');
        setSaving(false);
        return;
      }
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
      <div className="space-y-3" ref={wrapperRef}>
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1">
            <span className="opacity-60 mr-1">색</span>
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => { setColor(c); setErase(false); }}
                className={`w-7 h-7 rounded-full border-2 ${color === c && !erase ? 'border-violet-500 ring-2 ring-violet-200' : 'border-black/10'}`}
                style={{ backgroundColor: c }}
                aria-label={`색상 ${c}`}
                title={c}
              />
            ))}
          </div>
          <div className="flex items-center gap-1">
            <span className="opacity-60 mr-1">굵기</span>
            {WIDTHS.map((w) => (
              <button
                key={w}
                onClick={() => setWidth(w)}
                className={`w-7 h-7 rounded flex items-center justify-center ${width === w ? 'bg-violet-100' : 'bg-black/5 hover:bg-black/10'}`}
                aria-label={`굵기 ${w}px`}
              >
                <span className="rounded-full bg-black" style={{ width: `${w}px`, height: `${w}px` }} />
              </button>
            ))}
          </div>
          <button
            onClick={() => setErase((v) => !v)}
            className={`px-2 py-1 rounded ${erase ? 'bg-violet-600 text-white' : 'bg-black/5 hover:bg-black/10'}`}
            aria-pressed={erase}
            aria-label="지우개"
          >
            지우개
          </button>
          <button
            onClick={undo}
            className="px-2 py-1 rounded bg-black/5 hover:bg-black/10"
            aria-label="되돌리기"
          >
            ↶ 되돌리기
          </button>
          <button
            onClick={clear}
            className="px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100"
            aria-label="전체 지우기"
          >
            전체 지우기
          </button>
        </div>

        <canvas
          ref={canvasRef}
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
