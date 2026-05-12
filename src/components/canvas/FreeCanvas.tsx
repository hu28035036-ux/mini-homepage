'use client';

import { useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { DndContext, useDraggable, type DragEndEvent } from '@dnd-kit/core';
import type { Block, Layouts, CardStyle, FontStyle } from '@/types/db';

export type Track = 'desktop' | 'mobile';
const CANVAS_WIDTH: Record<Track, number> = { desktop: 1200, mobile: 360 };

export function useTrack(): Track {
  // SSR-safe — 첫 렌더는 desktop, 마운트 후 실제 viewport 기준 갱신
  const [track, setTrack] = useState<Track>('desktop');
  useEffect(() => {
    const update = () => setTrack(window.innerWidth >= 1024 ? 'desktop' : 'mobile');
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return track;
}

/** 신규 사용자/빈 layout일 때만 사용되는 안전한 기본 배치 */
export function defaultBlocks(track: Track): Block[] {
  const base = (k: Block['kind'], x: number, y: number, w: number, h: number, z = k === 'title' ? 1 : 0): Block => ({
    id: `${k}-default`,
    kind: k, x, y, w, h, z,
    visible: true,
    visibility: 'public',
  });
  if (track === 'desktop') {
    return [
      base('title',   40, 20,  400, 70),
      base('profile', 40, 110, 300, 240),
      base('urls',    360, 110, 400, 320),
      base('albums',  780, 110, 400, 320),
      base('memos',   40, 450, 720, 240),
    ];
  }
  return [
    base('title',   20, 20,  320, 60),
    base('profile', 20, 90,  320, 200),
    base('urls',    20, 300, 320, 240),
    base('albums',  20, 550, 320, 240),
    base('memos',   20, 800, 320, 240),
  ];
}

function clampBlock(b: Block, canvasWidth: number): Block {
  return {
    ...b,
    x: Math.max(0, Math.min(canvasWidth - 80, b.x)),
    y: Math.max(0, b.y),
    w: Math.max(160, Math.min(canvasWidth, b.w)),
    h: Math.max(80, b.h),
  };
}

function cardClass(style: CardStyle): string {
  switch (style) {
    case 'basic': return 'bg-white border border-gray-200 rounded-lg';
    case 'rounded': return 'bg-white rounded-3xl border border-gray-200';
    case 'shadow': return 'bg-white rounded-xl shadow-xl';
    case 'transparent': return 'bg-white/70 backdrop-blur rounded-2xl border border-white/40';
    case 'soft': return 'bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-sm';
    case 'bordered': return 'bg-white rounded-lg border-2 border-gray-900';
    case 'glass': return 'bg-white/40 backdrop-blur-xl rounded-3xl border border-white/60 shadow-lg';
    case 'minimal': return 'bg-transparent border-b border-gray-300';
    case 'elevated': return 'bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)]';
    case 'frame': return 'bg-white rounded-xl border-2 border-gray-200 ring-1 ring-inset ring-gray-100';
    default: return 'bg-white';
  }
}

interface DraggableBlockProps {
  block: Block;
  editMode: boolean;
  cardStyle: CardStyle;
  onChange: (id: string, patch: Partial<Block>) => void;
  onExpand?: (kind: Block['kind']) => void;
  children: ReactNode;
}

function DraggableBlock({ block, editMode, cardStyle, onChange, onExpand, children }: DraggableBlockProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: block.id,
    disabled: !editMode,
  });

  const transformStyle = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : {};

  // 리사이즈 핸들 — 자체 pointermove
  const resizing = useRef<{ startX: number; startY: number; startW: number; startH: number } | null>(null);
  const onResizeStart = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    resizing.current = { startX: e.clientX, startY: e.clientY, startW: block.w, startH: block.h };
  };
  const onResizeMove = (e: React.PointerEvent) => {
    if (!resizing.current) return;
    e.preventDefault();
    const dx = e.clientX - resizing.current.startX;
    const dy = e.clientY - resizing.current.startY;
    onChange(block.id, {
      w: Math.max(160, resizing.current.startW + dx),
      h: Math.max(80, resizing.current.startH + dy),
    });
  };
  const onResizeEnd = (e: React.PointerEvent) => {
    if (!resizing.current) return;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    resizing.current = null;
  };

  return (
    <div
      ref={setNodeRef}
      className={`absolute ${cardClass(cardStyle)} ${isDragging ? 'opacity-80 cursor-grabbing shadow-2xl z-50' : ''} ${editMode ? 'ring-1 ring-violet-300/40' : ''}`}
      style={{
        left: block.x,
        top: block.y,
        width: block.w,
        height: block.h,
        zIndex: block.z,
        ...transformStyle,
      }}
    >
      {editMode && (
        <div
          {...listeners}
          {...attributes}
          className="absolute inset-x-0 top-0 h-8 cursor-grab active:cursor-grabbing select-none flex items-center justify-between px-3 text-[10px] text-gray-500 bg-black/[0.02] rounded-t"
          aria-label="드래그 핸들"
        >
          <span>⋮⋮ {block.kind}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onChange(block.id, { visibility: block.visibility === 'public' ? 'private' : 'public' })}
              className="text-[10px] px-1.5 py-0.5 rounded hover:bg-black/5"
              title={block.visibility === 'public' ? '공개 페이지에 보임' : '공개 페이지에 안 보임'}
            >
              {block.visibility === 'public' ? '공개' : '비공개'}
            </button>
            <button
              onClick={() => onChange(block.id, { visible: false })}
              className="text-[10px] px-1.5 py-0.5 rounded hover:bg-black/5"
              title="이 화면에서 숨김"
            >
              숨김
            </button>
            {onExpand && block.kind !== 'title' && block.kind !== 'profile' && (
              <button
                onClick={() => onExpand(block.kind)}
                className="text-[10px] px-1.5 py-0.5 rounded hover:bg-black/5"
                title="전체보기"
              >
                ⛶
              </button>
            )}
          </div>
        </div>
      )}

      {!editMode && onExpand && block.kind !== 'title' && block.kind !== 'profile' && (
        <button
          onClick={() => onExpand(block.kind)}
          className="absolute top-2 right-2 z-10 text-xs opacity-50 hover:opacity-100 px-1.5 py-0.5 rounded hover:bg-black/5"
          title="전체보기"
        >
          ⛶
        </button>
      )}

      <div className={`absolute inset-0 ${editMode ? 'pt-8' : ''} overflow-auto p-4`}>{children}</div>

      {editMode && (
        <div
          onPointerDown={onResizeStart}
          onPointerMove={onResizeMove}
          onPointerUp={onResizeEnd}
          onPointerCancel={onResizeEnd}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize select-none"
          aria-label="리사이즈 핸들"
        >
          <svg viewBox="0 0 16 16" className="w-full h-full text-gray-400">
            <path d="M14 14L8 14M14 14L14 8M14 14L4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
        </div>
      )}
    </div>
  );
}

export interface FreeCanvasProps {
  layouts: Layouts;
  onLayoutsChange?: (next: Layouts) => void;
  editMode: boolean;
  cardStyle: CardStyle;
  fontStyle: FontStyle;
  pointColor: string;
  renderBlock: (block: Block) => ReactNode;
  onExpand?: (kind: Block['kind']) => void;
  /** 공개 페이지 등 visibility=private 필터링 모드 */
  publicViewOnly?: boolean;
  /** 강제 트랙(공개 페이지의 클라이언트 hydration용) */
  forceTrack?: Track;
}

export function FreeCanvas({
  layouts,
  onLayoutsChange,
  editMode,
  cardStyle,
  fontStyle,
  pointColor,
  renderBlock,
  onExpand,
  publicViewOnly = false,
  forceTrack,
}: FreeCanvasProps) {
  const detectedTrack = useTrack();
  const track = forceTrack ?? detectedTrack;
  const canvasWidth = CANVAS_WIDTH[track];

  const blocks = (layouts[track] && layouts[track].length > 0) ? layouts[track] : defaultBlocks(track);
  const visibleBlocks = blocks.filter((b) => b.visible && (publicViewOnly ? b.visibility === 'public' : true));
  // 캔버스 최소 높이 = 모든 블록의 (y+h) 최댓값 + 여유
  const minHeight = visibleBlocks.reduce((m, b) => Math.max(m, b.y + b.h), 0) + 80;

  function applyChange(id: string, patch: Partial<Block>) {
    if (!onLayoutsChange) return;
    const next = blocks.map((b) => (b.id === id ? clampBlock({ ...b, ...patch }, canvasWidth) : b));
    onLayoutsChange({ ...layouts, [track]: next });
  }

  const onDragEnd = useCallback(
    (e: DragEndEvent) => {
      if (!onLayoutsChange) return;
      const id = e.active.id as string;
      const block = blocks.find((b) => b.id === id);
      if (!block) return;
      applyChange(id, { x: block.x + e.delta.x, y: block.y + e.delta.y });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [blocks, layouts, onLayoutsChange, track]
  );

  return (
    <DndContext onDragEnd={onDragEnd}>
      <div
        className={`relative mx-auto font-${fontStyle} ${editMode ? 'bg-[radial-gradient(circle,rgba(0,0,0,0.04)_1px,transparent_1px)] [background-size:24px_24px]' : ''}`}
        style={{ width: canvasWidth, minHeight, maxWidth: '100%', color: 'inherit' }}
      >
        {visibleBlocks.map((b) => (
          <DraggableBlock
            key={b.id}
            block={b}
            editMode={editMode}
            cardStyle={cardStyle}
            onChange={applyChange}
            onExpand={onExpand}
          >
            <div style={{ '--point': pointColor } as React.CSSProperties}>{renderBlock(b)}</div>
          </DraggableBlock>
        ))}
      </div>
    </DndContext>
  );
}
