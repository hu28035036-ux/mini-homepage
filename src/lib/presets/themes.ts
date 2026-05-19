import type { BackgroundPattern, CardStyle, FontStyle } from '@/types/db';

/**
 * 테마 프리셋 — 꾸미기 값 묶음을 원클릭으로 적용한다.
 * 적용 후 사용자가 세부 조정하고 저장한다(저장 전 서버 미반영).
 * 배경 이미지·레이아웃은 프리셋 범위에 포함하지 않는다 (자산/배치는 별개).
 */
export interface ThemePresetValues {
  background_color: string;
  background_pattern: BackgroundPattern;
  background_pattern_color: string;
  point_color: string;
  text_color: string;
  card_style: CardStyle;
  /** '' 이면 카드 스타일 기본색 사용 */
  card_background_color: string;
  font_style: FontStyle;
  default_card_opacity: number;
  default_font_size: number;
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  values: ThemePresetValues;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'classic-white',
    name: '클래식 화이트',
    description: '깔끔한 흰 배경',
    values: {
      background_color: '#ffffff',
      background_pattern: 'none',
      background_pattern_color: '#00000022',
      point_color: '#7c3aed',
      text_color: '#1f2937',
      card_style: 'basic',
      card_background_color: '',
      font_style: 'default',
      default_card_opacity: 1,
      default_font_size: 12,
    },
  },
  {
    id: 'cozy-cream',
    name: '포근한 크림',
    description: '따뜻한 크림빛 + 손글씨',
    values: {
      background_color: '#fdf6ec',
      background_pattern: 'dots',
      background_pattern_color: '#00000014',
      point_color: '#d97706',
      text_color: '#4b3a2f',
      card_style: 'soft',
      card_background_color: '',
      font_style: 'gowunDodum',
      default_card_opacity: 1,
      default_font_size: 13,
    },
  },
  {
    id: 'pastel-pink',
    name: '파스텔 핑크',
    description: '달콤한 핑크 메모지',
    values: {
      background_color: '#fff1f5',
      background_pattern: 'none',
      background_pattern_color: '#00000014',
      point_color: '#ec4899',
      text_color: '#6b2a44',
      card_style: 'pink',
      card_background_color: '',
      font_style: 'hiMelody',
      default_card_opacity: 1,
      default_font_size: 13,
    },
  },
  {
    id: 'mint-note',
    name: '민트 노트',
    description: '상쾌한 민트 + 노트 라인',
    values: {
      background_color: '#ecfdf5',
      background_pattern: 'grid',
      background_pattern_color: '#00000010',
      point_color: '#10b981',
      text_color: '#1f3d34',
      card_style: 'notebook',
      card_background_color: '',
      font_style: 'nanumPen',
      default_card_opacity: 1,
      default_font_size: 13,
    },
  },
  {
    id: 'midnight',
    name: '미드나잇',
    description: '어두운 밤 + 유리 카드',
    values: {
      background_color: '#1e1e28',
      background_pattern: 'none',
      background_pattern_color: '#ffffff14',
      point_color: '#a78bfa',
      text_color: '#e5e7eb',
      card_style: 'glass',
      card_background_color: '#2a2a3aee',
      font_style: 'pretendard',
      default_card_opacity: 1,
      default_font_size: 12,
    },
  },
  {
    id: 'retro-grid',
    name: '레트로 그리드',
    description: '노란 그라데이션 + 모눈',
    values: {
      background_color: 'linear-gradient(135deg, #fef9c3, #fde68a)',
      background_pattern: 'checker',
      background_pattern_color: '#00000012',
      point_color: '#f59e0b',
      text_color: '#422006',
      card_style: 'grid-paper',
      card_background_color: '',
      font_style: 'notoSans',
      default_card_opacity: 1,
      default_font_size: 12,
    },
  },
];
