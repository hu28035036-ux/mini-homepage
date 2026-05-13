'use client';

import { useMemo } from 'react';

/**
 * 단색 또는 그라데이션 값을 입력받는 picker.
 * value 형식:
 *  - 단색: #RRGGBB 또는 #RRGGBBAA
 *  - 그라데이션: 'linear-gradient(135deg, #ff0000, #0000ff)' 등 CSS 문자열
 */

function isGradient(v: string): boolean {
  return /^(linear|radial|conic)-gradient\(/.test(v);
}

function parseGradient(v: string): { angle: number; c1: string; c2: string } | null {
  // 단순 형태만 지원: linear-gradient(<angle>deg, <c1>, <c2>)
  const m = v.match(/^linear-gradient\(\s*(-?\d+)deg\s*,\s*(#[0-9a-fA-F]{3,8})\s*,\s*(#[0-9a-fA-F]{3,8})\s*\)$/);
  if (!m) return null;
  return { angle: parseInt(m[1], 10), c1: m[2], c2: m[3] };
}

function buildGradient(angle: number, c1: string, c2: string): string {
  return `linear-gradient(${angle}deg, ${c1}, ${c2})`;
}

export function ColorPicker({
  id,
  value,
  onChange,
  className = '',
  placeholder,
}: {
  id?: string;
  value: string;
  onChange: (next: string) => void;
  className?: string;
  placeholder?: string;
}) {
  const gradient = useMemo(() => parseGradient(value), [value]);
  const mode: 'solid' | 'gradient' = gradient ? 'gradient' : 'solid';

  function switchToSolid() {
    if (gradient) onChange(gradient.c1);
    else if (!value) onChange('#ffffff');
  }
  function switchToGradient() {
    if (gradient) return;
    const base = /^#[0-9a-fA-F]{3,8}$/.test(value) ? value : '#ffffff';
    onChange(buildGradient(135, base, '#7c3aed'));
  }

  return (
    <div className={className}>
      <div className="flex gap-1 mb-2 text-[11px]">
        <button
          type="button"
          onClick={switchToSolid}
          className={`px-2 py-1 rounded ${mode === 'solid' ? 'bg-violet-600 text-white' : 'bg-black/5 hover:bg-black/10'}`}
        >
          단색
        </button>
        <button
          type="button"
          onClick={switchToGradient}
          className={`px-2 py-1 rounded ${mode === 'gradient' ? 'bg-violet-600 text-white' : 'bg-black/5 hover:bg-black/10'}`}
        >
          그라데이션
        </button>
      </div>

      {mode === 'solid' ? (
        <div className="flex items-center gap-2">
          <input
            id={id}
            type="color"
            value={(value || '#ffffff').slice(0, 7)}
            onChange={(e) => onChange(e.target.value + (value.length === 9 ? value.slice(7) : ''))}
            className="w-10 h-10 rounded border"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder ?? '#ffffff'}
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
          />
        </div>
      ) : gradient ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={gradient.c1.slice(0, 7)}
              onChange={(e) => onChange(buildGradient(gradient.angle, e.target.value, gradient.c2))}
              className="w-10 h-10 rounded border"
              aria-label="시작 색"
            />
            <input
              type="color"
              value={gradient.c2.slice(0, 7)}
              onChange={(e) => onChange(buildGradient(gradient.angle, gradient.c1, e.target.value))}
              className="w-10 h-10 rounded border"
              aria-label="끝 색"
            />
            <div className="flex-1 flex items-center gap-2 text-xs">
              <label className="flex items-center gap-1">
                각도
                <input
                  type="number"
                  min={0}
                  max={360}
                  value={gradient.angle}
                  onChange={(e) => onChange(buildGradient(parseInt(e.target.value, 10) || 0, gradient.c1, gradient.c2))}
                  className="w-14 rounded border border-gray-200 px-1 py-0.5"
                />°
              </label>
              <input
                type="range"
                min={0}
                max={360}
                value={gradient.angle}
                onChange={(e) => onChange(buildGradient(parseInt(e.target.value, 10), gradient.c1, gradient.c2))}
                className="flex-1"
                aria-label="각도 슬라이더"
              />
            </div>
          </div>
          <div
            className="h-8 rounded border border-gray-200"
            style={{ backgroundImage: value }}
            aria-label="그라데이션 미리보기"
          />
        </div>
      ) : (
        <p className="text-xs text-rose-600">그라데이션 형식이 올바르지 않습니다. 단색으로 전환합니다.</p>
      )}
    </div>
  );
}

/** 값을 CSS 속성으로 변환:
 *  - 단색이면 { backgroundColor }
 *  - 그라데이션이면 { backgroundImage } */
export function colorOrGradientStyle(value: string | null | undefined): React.CSSProperties {
  if (!value) return {};
  if (isGradient(value)) return { backgroundImage: value };
  return { backgroundColor: value };
}

/** 텍스트 색상으로 변환:
 *  - 단색이면 { color }
 *  - 그라데이션이면 background-clip: text 트릭 */
export function textColorOrGradientStyle(value: string | null | undefined): React.CSSProperties {
  if (!value) return {};
  if (isGradient(value)) {
    return {
      backgroundImage: value,
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      color: 'transparent',
    };
  }
  return { color: value };
}
