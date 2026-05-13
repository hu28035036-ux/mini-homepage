import type { BackgroundPattern } from '@/types/db';

/**
 * 배경 무늬 CSS — background-image 속성 값.
 * 색상은 패턴 색(c), 바탕은 별도 background-color로.
 * 'none'은 빈 문자열 반환 → 호출 측에서 미적용.
 */
export function patternImage(name: BackgroundPattern, c: string): string {
  switch (name) {
    case 'none':
      return '';
    case 'dots':
      return `radial-gradient(${c} 1.5px, transparent 1.6px)`;
    case 'grid':
      return `linear-gradient(${c} 1px, transparent 1px), linear-gradient(90deg, ${c} 1px, transparent 1px)`;
    case 'diagonal':
      return `repeating-linear-gradient(45deg, ${c} 0 1px, transparent 1px 12px)`;
    case 'stripes':
      return `repeating-linear-gradient(0deg, ${c} 0 1px, transparent 1px 14px)`;
    case 'checker':
      return `linear-gradient(45deg, ${c} 25%, transparent 25%, transparent 75%, ${c} 75%), linear-gradient(45deg, ${c} 25%, transparent 25%, transparent 75%, ${c} 75%)`;
    case 'crosshatch':
      return `repeating-linear-gradient(45deg, ${c} 0 1px, transparent 1px 10px), repeating-linear-gradient(-45deg, ${c} 0 1px, transparent 1px 10px)`;
    case 'waves':
      return `radial-gradient(circle at 50% 100%, transparent 11px, ${c} 11.5px, ${c} 12px, transparent 12.5px), radial-gradient(circle at 50% 0, transparent 11px, ${c} 11.5px, ${c} 12px, transparent 12.5px)`;
    case 'triangles':
      return `linear-gradient(60deg, ${c} 25%, transparent 25.5%, transparent 75%, ${c} 75%), linear-gradient(120deg, ${c} 25%, transparent 25.5%, transparent 75%, ${c} 75%)`;
  }
}

/** background-size — 패턴별 셀 크기 */
export function patternSize(name: BackgroundPattern): string | undefined {
  switch (name) {
    case 'none':
      return undefined;
    case 'dots':
      return '18px 18px';
    case 'grid':
      return '24px 24px, 24px 24px';
    case 'diagonal':
    case 'stripes':
      return undefined; // repeating gradient 자체에 크기 내장
    case 'checker':
      return '24px 24px, 24px 24px';
    case 'crosshatch':
      return undefined;
    case 'waves':
      return '24px 24px';
    case 'triangles':
      return '40px 24px';
  }
}

/** background-position — 일부 패턴은 두 레이어를 어긋나게 (체커보드 효과) */
export function patternPosition(name: BackgroundPattern): string | undefined {
  switch (name) {
    case 'checker':
      return '0 0, 12px 12px';
    case 'grid':
      return '0 0, 0 0';
    case 'waves':
      return '0 0';
    case 'triangles':
      return '0 0, 20px 12px';
    default:
      return undefined;
  }
}

export const PATTERN_LIST: { value: BackgroundPattern; label: string }[] = [
  { value: 'none', label: '없음' },
  { value: 'dots', label: '점' },
  { value: 'grid', label: '격자' },
  { value: 'diagonal', label: '대각선' },
  { value: 'stripes', label: '가로 줄' },
  { value: 'checker', label: '체크' },
  { value: 'crosshatch', label: '교차선' },
  { value: 'waves', label: '물결' },
  { value: 'triangles', label: '삼각' },
];
