'use client';

import { textColorOrGradientStyle } from '@/components/decorate/ColorPicker';
import type { Block } from '@/types/db';

/** 카드 종류별 기본 헤더 이름 — customTitle 미지정 시 fallback */
const DEFAULT_TITLES: Record<Block['kind'], string> = {
  title: '',
  profile: '프로필',
  urls: 'URL 보관함',
  albums: '앨범',
  memos: '메모',
  custom: '새 카드',
  drawing: '그림',
};

export function defaultCardTitle(kind: Block['kind']): string {
  return DEFAULT_TITLES[kind];
}

interface CardHeaderProps {
  block: Block;
  editMode: boolean;
  onChange: (id: string, patch: Partial<Block>) => void;
  textColor?: string;
  /** Phase 3: 지정된 카테고리 이름. 미지정/미발견 시 라벨 미표시 */
  categoryName?: string;
}

/**
 * 전 카드 종류 공통 헤더.
 * - view 모드: 제목 텍스트(+ 카테고리 라벨)
 * - 편집 모드: 제목 input. 빈 값이면 저장 시 기본명으로 fallback.
 */
export function CardHeader({ block, editMode, onChange, textColor, categoryName }: CardHeaderProps) {
  const fallback = defaultCardTitle(block.kind);
  const display = block.customTitle?.trim() ? block.customTitle : fallback;

  if (editMode) {
    return (
      <div style={{ pointerEvents: 'auto' }} onPointerDown={(e) => e.stopPropagation()}>
        <input
          value={block.customTitle ?? ''}
          onChange={(e) => onChange(block.id, { customTitle: e.target.value })}
          placeholder={fallback || '제목'}
          maxLength={200}
          className="w-full bg-transparent outline-none text-sm font-bold mb-1 border-b border-black/10 focus:border-violet-400"
          style={textColorOrGradientStyle(textColor)}
          aria-label="카드 이름"
        />
        {categoryName && (
          <div className="text-[10px] opacity-50 mb-1">{categoryName}</div>
        )}
      </div>
    );
  }

  if (!display) return null;
  return (
    <div className="mb-2">
      <h3 className="text-sm font-bold" style={textColorOrGradientStyle(textColor)}>
        {display}
      </h3>
      {categoryName && (
        <div className="text-[10px] opacity-50 mt-0.5">{categoryName}</div>
      )}
    </div>
  );
}
