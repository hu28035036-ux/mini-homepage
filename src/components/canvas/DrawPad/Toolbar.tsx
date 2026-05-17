'use client';

import { useState } from 'react';
import { ColorPicker } from '@/components/decorate/ColorPicker';
import type { Tool } from './types';
import {
  PEN_ORDER, PEN_META, SHAPE_ORDER, SHAPE_META,
  PRESET_COLORS, THICKNESS_MIN, THICKNESS_MAX,
} from './constants';

interface ToolbarProps {
  tool: Tool;
  color: string;
  thickness: number;
  onToolChange: (t: Tool) => void;
  onColorChange: (c: string) => void;
  onThicknessChange: (n: number) => void;
  onUndo: () => void;
  onClear: () => void;
}

const btn = (active: boolean) =>
  `px-2 py-1 rounded text-xs ${active ? 'bg-violet-600 text-white' : 'bg-black/5 hover:bg-black/10'}`;

export function Toolbar({
  tool, color, thickness,
  onToolChange, onColorChange, onThicknessChange, onUndo, onClear,
}: ToolbarProps) {
  const [showPicker, setShowPicker] = useState(false);

  return (
    <div className="flex flex-col gap-2 text-xs">
      {/* 펜 5종 */}
      <div className="flex items-center flex-wrap gap-1">
        <span className="opacity-60 mr-1 w-8">펜</span>
        {PEN_ORDER.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onToolChange({ type: 'pen', pen: p })}
            className={btn(tool.type === 'pen' && tool.pen === p)}
            aria-label={`펜 ${PEN_META[p].label}`}
          >
            {PEN_META[p].label}
          </button>
        ))}
      </div>

      {/* 도형 6종 */}
      <div className="flex items-center flex-wrap gap-1">
        <span className="opacity-60 mr-1 w-8">도형</span>
        {SHAPE_ORDER.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onToolChange({ type: 'shape', shape: s })}
            className={btn(tool.type === 'shape' && tool.shape === s)}
            aria-label={`도형 ${SHAPE_META[s].label}`}
          >
            {SHAPE_META[s].label}
          </button>
        ))}
      </div>

      {/* 지우개 2종 */}
      <div className="flex items-center flex-wrap gap-1">
        <span className="opacity-60 mr-1 w-8">지우개</span>
        <button
          type="button"
          onClick={() => onToolChange({ type: 'eraser', mode: 'pixel' })}
          className={btn(tool.type === 'eraser' && tool.mode === 'pixel')}
          aria-label="픽셀 지우개"
        >
          픽셀
        </button>
        <button
          type="button"
          onClick={() => onToolChange({ type: 'eraser', mode: 'object' })}
          className={btn(tool.type === 'eraser' && tool.mode === 'object')}
          aria-label="객체 지우개"
        >
          객체
        </button>
        <button type="button" onClick={onUndo} className="px-2 py-1 rounded text-xs bg-black/5 hover:bg-black/10 ml-2" aria-label="되돌리기">
          ↶ 되돌리기
        </button>
        <button type="button" onClick={onClear} className="px-2 py-1 rounded text-xs bg-rose-50 text-rose-700 hover:bg-rose-100" aria-label="전체 지우기">
          전체 지우기
        </button>
      </div>

      {/* 굵기 슬라이더 */}
      <div className="flex items-center gap-2">
        <span className="opacity-60 w-8">굵기</span>
        <input
          type="range"
          min={THICKNESS_MIN}
          max={THICKNESS_MAX}
          value={thickness}
          onChange={(e) => onThicknessChange(parseInt(e.target.value, 10))}
          className="flex-1 max-w-[220px]"
          aria-label="굵기"
        />
        <span className="tabular-nums w-8 text-right">{thickness}</span>
      </div>

      {/* 대표색 7 + 커스텀 팔레트 */}
      <div className="flex items-center flex-wrap gap-1">
        <span className="opacity-60 mr-1 w-8">색</span>
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => onColorChange(c)}
            className={`w-7 h-7 rounded-full border-2 ${
              color.slice(0, 7).toLowerCase() === c ? 'border-violet-500 ring-2 ring-violet-200' : 'border-black/15'
            }`}
            style={{ backgroundColor: c }}
            aria-label={`색상 ${c}`}
            title={c}
          />
        ))}
        <button
          type="button"
          onClick={() => setShowPicker((v) => !v)}
          className={btn(showPicker)}
          aria-label="색상 팔레트"
        >
          팔레트
        </button>
        <span
          className="w-7 h-7 rounded border border-black/15 ml-1"
          style={{ backgroundColor: color }}
          aria-label="현재 색상"
        />
      </div>
      {showPicker && (
        <div className="rounded-lg border border-gray-200 p-2">
          <ColorPicker value={color} onChange={onColorChange} solidOnly />
        </div>
      )}
    </div>
  );
}
