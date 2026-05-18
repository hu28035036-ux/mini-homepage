'use client';

import { useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { DndContext, useDraggable, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { textColorOrGradientStyle } from '@/components/decorate/ColorPicker';
import { CardHeader } from '@/components/canvas/CardHeader';
import { CardCategoryManager } from '@/components/canvas/CardCategoryManager';
import type { Block, Layouts, CardStyle, FontStyle, FontSize, CardCategory } from '@/types/db';

// v0.9: 옛 enum(xs~xl) 글자 크기 → pt 변환표. 마이그 안 된 layouts JSONB 호환용.
const FONT_PT: Record<string, number> = { xs: 9, sm: 11, base: 12, lg: 14, xl: 16 };

/** Block.fontSize / default_font_size 를 pt 숫자로 보정 (옛 문자열 enum 호환). */
export function toPt(v: number | string | undefined | null, fallback: number): number {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') return FONT_PT[v] ?? fallback;
  return fallback;
}

/** 글자 크기 프리셋 (pt) */
export const FONT_SIZE_PRESETS = [9, 12, 16, 20, 28] as const;

export type Track = 'desktop' | 'mobile';
// desktop 캔버스는 v0.9에서 1200 → 1680 (40% 확대). mobile은 폰 화면 폭 유지.
const CANVAS_WIDTH: Record<Track, number> = { desktop: 1680, mobile: 360 };

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
      base('title',   40, 20,  400, 90),
      base('profile', 40, 130, 300, 240),
      base('urls',    360, 130, 400, 320),
      base('albums',  780, 130, 400, 320),
      base('memos',   40, 470, 720, 240),
    ];
  }
  return [
    base('title',   20, 20,  320, 90),
    base('profile', 20, 130, 320, 200),
    base('urls',    20, 350, 320, 240),
    base('albums',  20, 610, 320, 240),
    base('memos',   20, 870, 320, 240),
  ];
}

/** layouts 로드 시 검증 스키마(blockSchema)가 요구하는 값으로 보정.
 *  위치(x, y)는 손대지 않아 자유 배치를 유지하고, 크기·z·표시 필드만 규칙 안으로 끌어들인다. */
export function normalizeBlock(b: Block): Block {
  // 옛 문자열 fontSize(xs~xl)는 pt 숫자로 변환, 그 외는 그대로
  const rawFs: unknown = b.fontSize;
  const fontSize =
    typeof rawFs === 'string' ? (FONT_PT[rawFs] ?? undefined)
    : typeof rawFs === 'number' ? rawFs
    : undefined;
  return {
    ...b,
    w: Math.min(4000, Math.max(160, b.w)),
    h: Math.min(4000, Math.max(80, b.h)),
    z: Number.isInteger(b.z) ? b.z : 0,
    visible: b.visible ?? true,
    visibility: b.visibility ?? 'public',
    fontSize,
  };
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
    // v0.7.x — 메모지 시리즈 (포스트잇 느낌)
    case 'sticky': return 'bg-yellow-100 rounded-sm shadow-md border-b-2 border-yellow-200';
    case 'mint': return 'bg-emerald-50 rounded-lg shadow-sm border border-emerald-200';
    case 'pink': return 'bg-pink-50 rounded-lg shadow-sm border border-pink-200';
    case 'sky': return 'bg-sky-50 rounded-lg shadow-sm border border-sky-200';
    // 노트/모눈 패턴
    case 'notebook': return 'bg-white rounded-lg border border-gray-200 [background-image:repeating-linear-gradient(0deg,transparent_0,transparent_27px,rgba(59,130,246,0.18)_27px,rgba(59,130,246,0.18)_28px)]';
    case 'grid-paper': return 'bg-white rounded-lg border border-gray-200 [background-image:linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] [background-size:20px_20px]';
    // 테두리 변형
    case 'dashed': return 'bg-white rounded-lg border-2 border-dashed border-gray-400';
    case 'double-border': return 'bg-white rounded-lg border-4 border-double border-gray-400';
    case 'ringed': return 'bg-white rounded-lg ring-2 ring-violet-300 ring-offset-2 ring-offset-white/0';
    case 'bevel': return 'bg-white rounded-md border-t border-l border-white border-b-2 border-r-2 border-b-gray-400 border-r-gray-400 shadow-inner';
    default: return 'bg-white';
  }
}

interface DraggableBlockProps {
  block: Block;
  editMode: boolean;
  cardStyle: CardStyle;
  selected: boolean;
  outOfBounds: boolean;
  effectiveOpacity: number;
  effectiveFontSize: FontSize;
  textColor?: string;
  pointColor: string;
  cardBackgroundColor?: string | null;
  categoryName?: string;
  dimmed?: boolean;
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

function DraggableBlock({ block, editMode, cardStyle, selected, outOfBounds, effectiveOpacity, effectiveFontSize, textColor, pointColor, cardBackgroundColor, categoryName, dimmed, onSelect, onChange, onExpand, onQuickAdd, onBringForward, onSendBackward, onDelete, onDraw, children }: DraggableBlockProps) {
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
      data-block-kind={block.kind}
      onClick={() => {
        if (editMode) {
          onSelect(block.id);
          return;
        }
        if (clickOpensDrawPad) { onDraw!(block); return; }
        if (clickExpands) onExpand!(block.kind);
      }}
      className={`absolute ${cardClass(cardStyle)} ${isDragging ? 'shadow-2xl' : ''} ${editMode ? (outOfBounds ? 'ring-2 ring-rose-500' : selected ? 'ring-2 ring-violet-500' : 'ring-1 ring-violet-300/40') : ''} ${!editMode && (clickExpands || clickOpensDrawPad) ? 'cursor-zoom-in' : ''}`}
      style={{
        left: block.x,
        top: block.y,
        width: block.w,
        height: block.h,
        zIndex: isDragging ? 9999 : block.z,
        opacity: dimmed ? 0.2 : (isDragging ? Math.min(0.8, effectiveOpacity) : effectiveOpacity),
        ...(cardBackgroundColor
          ? /^(linear|radial|conic)-gradient\(/.test(cardBackgroundColor)
            ? { backgroundImage: cardBackgroundColor, backgroundColor: 'transparent' }
            : { backgroundColor: cardBackgroundColor }
          : {}),
        ...transformStyle,
        touchAction: editMode ? 'none' : undefined,
      }}
    >
      {/* 1. 내부 콘텐츠 — 핸들 아래에 깔리도록 먼저 작성 + 편집 모드 OFF는 인터랙티브, ON일 때는 pointer-events: none(드래그 우선) */}
      {/* block-fontsize 래퍼는 본문 div에만 — 편집 핸들/액션 버튼은 카드 폰트크기 cascade에서 제외 */}
      <div
        className={`block-fontsize absolute inset-x-0 bottom-0 ${editMode ? 'top-8' : 'top-0'} overflow-auto p-4`}
        style={{ fontSize: `${effectiveFontSize}pt`, ...(editMode ? { pointerEvents: 'none' as const } : {}) }}
      >
        {block.kind !== 'title' && (
          <CardHeader block={block} editMode={editMode} onChange={onChange} textColor={pointColor} categoryName={categoryName} />
        )}
        {children}
      </div>

      {/* 2. 평소 모드 우상단 액션 — + 새로 추가 (urls/albums/memos), ⛶ 전체보기, ✎ 그리기(drawing) */}
      {!editMode && block.kind !== 'title' && block.kind !== 'profile' && (
        <div className="absolute top-2 right-2 z-20 flex items-center gap-1">
          {onQuickAdd && (block.kind === 'urls' || block.kind === 'albums' || block.kind === 'memos') && (
            <button
              onClick={(e) => { e.stopPropagation(); onQuickAdd(block.kind); }}
              style={textColorOrGradientStyle(textColor)}
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
              style={textColorOrGradientStyle(textColor)}
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
          <span className="font-medium">
            ⋮⋮ {block.kind}
            {outOfBounds && <span className="ml-1 text-rose-600" title="편집 범위를 벗어났습니다">⚠</span>}
          </span>
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
  cardBackgroundColor?: string | null;
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
  /** 카드 카테고리 목록 */
  cardCategories?: CardCategory[];
  /** 카테고리 추가/삭제 후 부모가 목록 재조회 */
  onReloadCategories?: () => void;
}

export function FreeCanvas({
  layouts,
  onLayoutsChange,
  editMode,
  cardStyle,
  cardBackgroundColor,
  fontStyle,
  pointColor,
  textColor,
  defaultOpacity = 1,
  defaultFontSize = 12,
  renderBlock,
  onExpand,
  onQuickAdd,
  onDraw,
  onExitEdit,
  publicViewOnly = false,
  forceTrack,
  cardCategories = [],
  onReloadCategories,
}: FreeCanvasProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showCatManager, setShowCatManager] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
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
          {cardCategories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              aria-label="카테고리 필터"
              className="text-xs rounded-lg border border-violet-200 px-2 py-1.5"
            >
              <option value="">전체 카테고리</option>
              {cardCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
          <button
            onClick={() => setShowCatManager(true)}
            className="text-xs px-3 py-1.5 rounded-lg bg-black/5 hover:bg-black/10"
            aria-label="카테고리 관리"
          >
            카테고리 관리
          </button>
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
          <div className="flex items-center gap-1.5">
            <span className="opacity-60">글자크기</span>
            <input
              type="number"
              min={6}
              max={96}
              value={selectedBlock.fontSize ?? ''}
              placeholder="전역"
              onChange={(e) => {
                const v = e.target.value;
                applyChange(selectedBlock.id, {
                  fontSize: v ? Math.max(6, Math.min(96, Math.round(Number(v)))) : undefined,
                });
              }}
              className="w-12 rounded border border-gray-200 px-1 py-0.5 text-xs"
              aria-label="카드 글자 크기(pt)"
            />
            <span className="opacity-60">pt</span>
            {FONT_SIZE_PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => applyChange(selectedBlock.id, { fontSize: p })}
                className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 hover:bg-gray-200"
                aria-label={`글자 크기 ${p}pt`}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              onClick={() => applyChange(selectedBlock.id, { fontSize: undefined })}
              className="text-[10px] underline opacity-60 hover:opacity-100"
              title="전역값 사용"
            >
              전역
            </button>
          </div>
          {cardCategories.length > 0 && (
            <label className="flex items-center gap-1.5">
              <span className="opacity-60">카테고리</span>
              <select
                value={selectedBlock.categoryId ?? ''}
                onChange={(e) => applyChange(selectedBlock.id, { categoryId: e.target.value || undefined })}
                className="rounded border border-gray-200 px-1 py-0.5 text-xs"
                aria-label="카드 카테고리"
              >
                <option value="">없음</option>
                {cardCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
          )}
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
        className={`relative mx-auto font-${fontStyle} ${editMode ? 'bg-[radial-gradient(circle,rgba(0,0,0,0.04)_1px,transparent_1px)] [background-size:24px_24px] outline-dashed outline-2 outline-violet-300' : ''}`}
        style={{ width: canvasWidth, minHeight, maxWidth: '100%', color: 'inherit' }}
      >
        {visibleBlocks.map((b) => {
          const categoryName = cardCategories.find((c) => c.id === b.categoryId)?.name;
          const dimmed = editMode && !!categoryFilter && b.categoryId !== categoryFilter;
          return (
          <DraggableBlock
            key={b.id}
            block={b}
            editMode={editMode}
            cardStyle={cardStyle}
            selected={selectedId === b.id}
            outOfBounds={b.x < 0 || b.y < 0 || b.x + b.w > canvasWidth}
            effectiveOpacity={b.opacity ?? defaultOpacity}
            effectiveFontSize={toPt(b.fontSize, defaultFontSize)}
            textColor={textColor}
            pointColor={pointColor}
            cardBackgroundColor={cardBackgroundColor}
            categoryName={categoryName}
            dimmed={dimmed}
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
          );
        })}
      </div>
      <CardCategoryManager
        open={showCatManager}
        onClose={() => setShowCatManager(false)}
        categories={cardCategories}
        onChanged={() => onReloadCategories?.()}
      />
    </DndContext>
  );
}
