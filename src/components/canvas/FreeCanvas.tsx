'use client';

import { useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { DndContext, useDraggable, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import type { Block, Layouts, CardStyle, FontStyle, FontSize } from '@/types/db';

export function fontSizeClass(s: FontSize): string {
  switch (s) {
    case 'xs': return 'text-xs';
    case 'sm': return 'text-sm';
    case 'base': return 'text-base';
    case 'lg': return 'text-lg';
    case 'xl': return 'text-xl';
  }
}

export type Track = 'desktop' | 'mobile';
const CANVAS_WIDTH: Record<Track, number> = { desktop: 1200, mobile: 360 };

/** v0.7.1: 분기점 1024px — iPad 가로(1024) 이상은 desktop 자유 캔버스.
 *  그 미만(폰·갤럭시 폴드 펼침·iPad 세로·안드로이드 데스크탑 사이트 모드 980)은 mobile 리스트.
 *  사용자 의도: "갤럭시 폴드6 펼친 상태까지를 모바일". */
export const MOBILE_BREAKPOINT = 1024;

export function useTrack(): Track {
  // SSR fallback은 desktop. 클라이언트 첫 렌더에서는 lazy init으로 즉시 정확한 값.
  // (lazy init이라 SSR 직후 hydration 시점에 클라이언트가 mobile로 식별되면 바로 mobile 분기로 렌더됨)
  const [track, setTrack] = useState<Track>(() => {
    if (typeof window === 'undefined') return 'desktop';
    return window.innerWidth >= MOBILE_BREAKPOINT ? 'desktop' : 'mobile';
  });
  useEffect(() => {
    const update = () => setTrack(window.innerWidth >= MOBILE_BREAKPOINT ? 'desktop' : 'mobile');
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
  selected: boolean;
  effectiveOpacity: number;
  effectiveFontSize: FontSize;
  textColor?: string;
  onSelect: (id: string) => void;
  onChange: (id: string, patch: Partial<Block>) => void;
  onExpand?: (kind: Block['kind']) => void;
  onQuickAdd?: (kind: Block['kind']) => void;
  onBringForward: (id: string) => void;
  onSendBackward: (id: string) => void;
  onDelete?: (id: string) => void;
  onDraw?: (block: Block) => void;
  children: ReactNode;
}

function DraggableBlock({ block, editMode, cardStyle, selected, effectiveOpacity, effectiveFontSize, textColor, onSelect, onChange, onExpand, onQuickAdd, onBringForward, onSendBackward, onDelete, onDraw, children }: DraggableBlockProps) {
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

  // URL 카드는 본문 클릭으로 확대 모달 진입 X (개별 링크 클릭 우선).
  // drawing 카드는 본문 클릭 시 DrawPad 모달 (별도 흐름).
  const expandable = block.kind !== 'title' && block.kind !== 'profile' && !!onExpand;
  const clickExpands = expandable && block.kind !== 'urls' && block.kind !== 'drawing';
  const clickOpensDrawPad = block.kind === 'drawing' && !!onDraw;
  return (
    <div
      ref={setNodeRef}
      data-block-fontsize={effectiveFontSize}
      onClick={() => {
        if (editMode) {
          onSelect(block.id);
          return;
        }
        if (clickOpensDrawPad) { onDraw!(block); return; }
        if (clickExpands) onExpand!(block.kind);
      }}
      className={`absolute ${cardClass(cardStyle)} ${isDragging ? 'shadow-2xl' : ''} ${editMode ? (selected ? 'ring-2 ring-violet-500' : 'ring-1 ring-violet-300/40') : ''} ${!editMode && (clickExpands || clickOpensDrawPad) ? 'cursor-zoom-in' : ''}`}
      style={{
        left: block.x,
        top: block.y,
        width: block.w,
        height: block.h,
        zIndex: isDragging ? 9999 : block.z,
        opacity: isDragging ? Math.min(0.8, effectiveOpacity) : effectiveOpacity,
        ...transformStyle,
        touchAction: editMode ? 'none' : undefined,
      }}
    >
      {/* 1. 내부 콘텐츠 — 핸들 아래에 깔리도록 먼저 작성 + 편집 모드 OFF는 인터랙티브, ON일 때는 pointer-events: none(드래그 우선) */}
      <div
        className={`absolute inset-x-0 bottom-0 ${editMode ? 'top-8' : 'top-0'} overflow-auto p-4`}
        style={editMode ? { pointerEvents: 'none' } : undefined}
      >
        {children}
      </div>

      {/* 2. 평소 모드 우상단 액션 — + 새로 추가 (urls/albums/memos), ⛶ 전체보기, ✎ 그리기(drawing) */}
      {!editMode && block.kind !== 'title' && block.kind !== 'profile' && (
        <div className="absolute top-2 right-2 z-20 flex items-center gap-1">
          {onQuickAdd && (block.kind === 'urls' || block.kind === 'albums' || block.kind === 'memos') && (
            <button
              onClick={(e) => { e.stopPropagation(); onQuickAdd(block.kind); }}
              style={{ color: textColor }}
              className="text-base leading-none opacity-70 hover:opacity-100 w-7 h-7 rounded hover:bg-black/5 flex items-center justify-center"
              title="새로 추가"
              aria-label="새로 추가"
            >
              +
            </button>
          )}
          {block.kind === 'drawing' && onDraw && (
            <button
              onClick={(e) => { e.stopPropagation(); onDraw(block); }}
              style={{ color: textColor }}
              className="text-sm opacity-70 hover:opacity-100 w-7 h-7 rounded hover:bg-black/5 flex items-center justify-center"
              title="그리기"
              aria-label="그림 편집"
            >
              ✎
            </button>
          )}
          {onExpand && block.kind !== 'urls' && block.kind !== 'drawing' && (
            <button
              onClick={(e) => { e.stopPropagation(); onExpand(block.kind); }}
              className="text-xs opacity-50 hover:opacity-100 w-7 h-7 rounded hover:bg-black/5 flex items-center justify-center"
              title="전체보기"
              aria-label="전체보기"
            >
              ⛶
            </button>
          )}
        </div>
      )}

      {/* 3. 편집 모드 드래그 핸들 — 콘텐츠 위에 오게 z-30 + DOM 마지막에 작성 */}
      {editMode && (
        <div
          {...listeners}
          {...attributes}
          className="absolute inset-x-0 top-0 h-8 z-30 cursor-grab active:cursor-grabbing select-none flex items-center justify-between px-3 text-[10px] text-gray-700 bg-violet-50 border-b border-violet-200 rounded-t"
          aria-label="드래그 핸들"
        >
          <span className="font-medium">⋮⋮ {block.kind}</span>
          <div className="flex items-center gap-1.5">
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onChange(block.id, { visibility: block.visibility === 'public' ? 'private' : 'public' });
              }}
              className="text-[10px] px-1.5 py-0.5 rounded bg-white/70 hover:bg-white"
              title={block.visibility === 'public' ? '공개 페이지에 보임' : '공개 페이지에 안 보임'}
            >
              {block.visibility === 'public' ? '공개' : '비공개'}
            </button>
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onBringForward(block.id);
              }}
              className="text-[10px] px-1.5 py-0.5 rounded bg-white/70 hover:bg-white"
              title="앞으로 보내기"
              aria-label="앞으로 보내기"
            >
              ▲
            </button>
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onSendBackward(block.id);
              }}
              className="text-[10px] px-1.5 py-0.5 rounded bg-white/70 hover:bg-white"
              title="뒤로 보내기"
              aria-label="뒤로 보내기"
            >
              ▼
            </button>
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onChange(block.id, { visible: false });
              }}
              className="text-[10px] px-1.5 py-0.5 rounded bg-white/70 hover:bg-white"
              title="이 화면에서 숨김"
            >
              숨김
            </button>
            {(block.kind === 'custom' || block.kind === 'drawing') && onDelete && (
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('이 카드를 삭제할까요?')) onDelete(block.id);
                }}
                className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 hover:bg-rose-100"
                title="카드 삭제"
                aria-label="카드 삭제"
              >
                삭제
              </button>
            )}
            {onExpand && block.kind !== 'title' && block.kind !== 'profile' && (
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onExpand(block.kind);
                }}
                className="text-[10px] px-1.5 py-0.5 rounded bg-white/70 hover:bg-white"
                title="전체보기"
              >
                ⛶
              </button>
            )}
          </div>
        </div>
      )}

      {/* 4. 리사이즈 핸들 — 더 크고 눈에 띄게, 가장 높은 z */}
      {editMode && (
        <div
          onPointerDown={onResizeStart}
          onPointerMove={onResizeMove}
          onPointerUp={onResizeEnd}
          onPointerCancel={onResizeEnd}
          className="absolute -bottom-1 -right-1 w-6 h-6 z-40 cursor-nwse-resize select-none flex items-end justify-end p-0.5"
          style={{ touchAction: 'none' }}
          aria-label="리사이즈 핸들"
        >
          <div className="w-5 h-5 rounded-br-lg bg-violet-500 hover:bg-violet-600 shadow-md flex items-end justify-end p-0.5">
            <svg viewBox="0 0 16 16" className="w-3 h-3 text-white">
              <path d="M14 14L8 14M14 14L14 8M14 14L4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
            </svg>
          </div>
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
  textColor?: string;
  defaultOpacity?: number;
  defaultFontSize?: FontSize;
  renderBlock: (block: Block) => ReactNode;
  onExpand?: (kind: Block['kind']) => void;
  onQuickAdd?: (kind: Block['kind']) => void;
  onDraw?: (block: Block) => void;
  onExitEdit?: () => void;
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
  textColor,
  defaultOpacity = 1,
  defaultFontSize = 'base',
  renderBlock,
  onExpand,
  onQuickAdd,
  onDraw,
  onExitEdit,
  publicViewOnly = false,
  forceTrack,
}: FreeCanvasProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
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

  function bringForward(id: string) {
    const maxZ = blocks.reduce((m, b) => Math.max(m, b.z ?? 0), 0);
    applyChange(id, { z: maxZ + 1 });
  }
  function sendBackward(id: string) {
    const minZ = blocks.reduce((m, b) => Math.min(m, b.z ?? 0), 0);
    applyChange(id, { z: minZ - 1 });
  }

  function newId(prefix: string): string {
    return (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
      ? crypto.randomUUID()
      : `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
  function addCustomBlock() {
    if (!onLayoutsChange) return;
    const maxZ = blocks.reduce((m, b) => Math.max(m, b.z ?? 0), 0);
    const newBlock: Block = {
      id: newId('custom'),
      kind: 'custom',
      x: 40, y: 40, w: 280, h: 180, z: maxZ + 1,
      visible: true, visibility: 'public',
      customTitle: '새 카드',
      customContent: '내용을 입력하세요',
    };
    onLayoutsChange({ ...layouts, [track]: [...blocks, newBlock] });
  }

  function addDrawingBlock() {
    if (!onLayoutsChange) return;
    const maxZ = blocks.reduce((m, b) => Math.max(m, b.z ?? 0), 0);
    const newBlock: Block = {
      id: newId('drawing'),
      kind: 'drawing',
      x: 60, y: 60, w: 320, h: 240, z: maxZ + 1,
      visible: true, visibility: 'public',
      drawingUrl: null,
    };
    onLayoutsChange({ ...layouts, [track]: [...blocks, newBlock] });
  }

  function deleteBlock(id: string) {
    if (!onLayoutsChange) return;
    if (selectedId === id) setSelectedId(null);
    onLayoutsChange({ ...layouts, [track]: blocks.filter((b) => b.id !== id) });
  }

  // 편집 모드 키보드 단축키
  useEffect(() => {
    if (!editMode) return;
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        setSelectedId(null);
        onExitEdit?.();
        return;
      }
      if (!selectedId) return;
      const step = e.shiftKey ? 10 : 1;
      const b = blocks.find((x) => x.id === selectedId);
      if (!b) return;
      let patch: Partial<Block> | null = null;
      switch (e.key) {
        case 'ArrowLeft': patch = { x: b.x - step }; break;
        case 'ArrowRight': patch = { x: b.x + step }; break;
        case 'ArrowUp': patch = { y: b.y - step }; break;
        case 'ArrowDown': patch = { y: b.y + step }; break;
      }
      if (patch) {
        e.preventDefault();
        applyChange(selectedId, patch);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editMode, selectedId, blocks, onExitEdit]);

  // 평소 모드로 전환 시 선택 해제
  useEffect(() => { if (!editMode) setSelectedId(null); }, [editMode]);

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

  // 마우스·터치 모두 지원. 5px 이동 후 드래그 시작(클릭과 구분)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const selectedBlock = selectedId ? blocks.find((b) => b.id === selectedId) ?? null : null;

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      {editMode && (
        <div className="sticky top-2 z-50 mx-auto mb-2 flex justify-end gap-2" style={{ maxWidth: canvasWidth }}>
          <button
            onClick={addCustomBlock}
            className="text-xs px-3 py-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-700 shadow"
            aria-label="새 텍스트 카드 추가"
          >
            + 텍스트 카드
          </button>
          <button
            onClick={addDrawingBlock}
            className="text-xs px-3 py-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-700 shadow"
            aria-label="새 그림판 카드 추가"
          >
            + 그림판
          </button>
        </div>
      )}
      {editMode && selectedBlock && (
        <div className="sticky top-2 z-50 mx-auto mb-2 flex flex-wrap items-center gap-3 rounded-xl border border-violet-200 bg-white/90 backdrop-blur px-3 py-2 text-xs shadow-md" style={{ width: 'fit-content', maxWidth: '95%' }}>
          <span className="font-semibold text-violet-700">⋮ {selectedBlock.kind}</span>
          <label className="flex items-center gap-1.5">
            <span className="opacity-60">투명도</span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={selectedBlock.opacity ?? defaultOpacity}
              onChange={(e) => applyChange(selectedBlock.id, { opacity: parseFloat(e.target.value) })}
              className="w-24"
            />
            <span className="w-8 text-right tabular-nums">{Math.round(((selectedBlock.opacity ?? defaultOpacity)) * 100)}%</span>
            <button
              onClick={() => applyChange(selectedBlock.id, { opacity: undefined })}
              className="text-[10px] underline opacity-60 hover:opacity-100"
              title="전역값 사용"
            >
              기본
            </button>
          </label>
          <label className="flex items-center gap-1.5">
            <span className="opacity-60">글자크기</span>
            <select
              value={selectedBlock.fontSize ?? ''}
              onChange={(e) => {
                const v = e.target.value;
                applyChange(selectedBlock.id, { fontSize: v ? (v as FontSize) : undefined });
              }}
              className="rounded border border-gray-200 px-1 py-0.5 text-xs"
            >
              <option value="">전역</option>
              <option value="xs">XS</option>
              <option value="sm">SM</option>
              <option value="base">기본</option>
              <option value="lg">LG</option>
              <option value="xl">XL</option>
            </select>
          </label>
          <button
            onClick={() => setSelectedId(null)}
            className="text-[11px] px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200"
            aria-label="선택 해제"
          >
            ✕
          </button>
        </div>
      )}
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
            selected={selectedId === b.id}
            effectiveOpacity={b.opacity ?? defaultOpacity}
            effectiveFontSize={b.fontSize ?? defaultFontSize}
            textColor={textColor}
            onSelect={setSelectedId}
            onChange={applyChange}
            onExpand={onExpand}
            onQuickAdd={onQuickAdd}
            onBringForward={bringForward}
            onSendBackward={sendBackward}
            onDelete={deleteBlock}
            onDraw={onDraw}
          >
            <div style={{ '--point': pointColor } as React.CSSProperties}>{renderBlock(b)}</div>
          </DraggableBlock>
        ))}
      </div>
    </DndContext>
  );
}
