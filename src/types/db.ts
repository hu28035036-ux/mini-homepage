// docs/02_DATABASE_DESIGN.md 기준 행 타입.
// Supabase 자동 생성 타입을 도입하면 이 파일을 교체할 수 있음.

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  nickname: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// v1+v2 + v0.7.x 카드 스타일 합집합
export type CardStyle =
  | 'basic' | 'rounded' | 'shadow' | 'transparent'
  | 'soft' | 'bordered' | 'glass' | 'minimal' | 'elevated' | 'frame'
  | 'sticky' | 'mint' | 'pink' | 'sky'
  | 'notebook' | 'grid-paper'
  | 'dashed' | 'double-border' | 'ringed' | 'bevel';

// v1+v2 폰트 스타일 합집합
export type FontStyle =
  | 'default' | 'rounded' | 'emotional'
  | 'pretendard' | 'notoSans' | 'notoSerif' | 'nanumGothic' | 'gowunDodum' | 'nanumPen' | 'ibmPlex' | 'blackHan' | 'hiMelody';

export type LayoutMode = 'single' | 'double';
export type WidgetKind = 'profile' | 'urls' | 'albums' | 'memos' | 'empty';

// v0.7.x 배경 무늬 (마이그 0004)
export type BackgroundPattern =
  | 'none' | 'dots' | 'grid' | 'diagonal' | 'stripes'
  | 'checker' | 'crosshatch' | 'waves' | 'triangles';

// v1 슬롯 (호환 유지)
export interface LayoutSlot {
  slot: number;
  widget: WidgetKind;
  visible: boolean;
}

// v2 자유 캔버스 블록
export type BlockKind = 'title' | 'profile' | 'urls' | 'albums' | 'memos' | 'custom' | 'drawing';
// v0.9: 글자 크기는 pt 정수 (6~96). 옛 enum(xs~xl)은 마이그 0008 + normalizeBlock으로 변환.
export type FontSize = number;

export interface Block {
  id: string;
  kind: BlockKind;
  x: number;        // 좌측 거리 (px)
  y: number;        // 상단 거리 (px)
  w: number;        // 폭 (px). 최소 160
  h: number;        // 높이 (px). 최소 120
  z: number;        // z-index
  visible: boolean;          // 본인 화면 표시 여부
  visibility: 'public' | 'private'; // 공개 페이지 노출 여부
  opacity?: number;          // 카드별 투명도 오버라이드 (0~1). 미지정 시 전역값
  fontSize?: FontSize;       // 카드별 폰트 크기 오버라이드. 미지정 시 전역값
  customTitle?: string;      // 전 카드 종류 공통 헤더(이름). 빈 값이면 종류별 기본명
  customContent?: string;    // custom 카드 본문
  drawingUrl?: string | null; // drawing 카드의 PNG URL (Step M, v0.7)
  categoryId?: string;       // 카드 카테고리 id (mini_homepages.card_categories 참조)
  // v0.9: 카드별 "표시할 카테고리" 선택 (해당 종류 카드에만 의미)
  albumCategoryId?: string;  // albums 카드가 보여줄 앨범 카테고리. 미지정 시 최근 업로드 카테고리
  memoCategoryId?: string;   // memos 카드가 보여줄 메모 카테고리. 미지정 시 전체
  urlCategoryId?: string;    // urls 카드가 보여줄 URL 카테고리. 미지정 시 전체
}

export interface Layouts {
  desktop: Block[];   // ≥ 1024px
  mobile:  Block[];   // < 1024px (태블릿 포함, 태블릿은 폭만 자동 확대)
}

// 카테고리 — mini_homepages.{card,memo,url}_categories JSONB 배열
// (카드=마이그 0007, 메모·URL=마이그 0009). 모두 동일 {id,name} 형태.
export interface CardCategory {
  id: string;
  name: string;
}

export interface MiniHomepageRow {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  intro: string | null;
  profile_image_url: string | null;
  background_color: string;
  background_image_url: string | null;
  use_background_image: boolean;
  background_pattern: BackgroundPattern;
  background_pattern_color: string;
  point_color: string;
  text_color: string;
  card_style: CardStyle;
  card_background_color: string | null;
  font_style: FontStyle;
  layout_mode: LayoutMode;
  layout_slots: LayoutSlot[];
  layouts: Layouts;
  card_categories: CardCategory[];
  memo_categories: CardCategory[];
  url_categories: CardCategory[];
  default_card_opacity: number;
  default_font_size: FontSize;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface UrlRow {
  id: string;
  user_id: string;
  homepage_id: string;
  title: string;
  url: string;
  category_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AlbumCategoryRow {
  id: string;
  user_id: string;
  homepage_id: string;
  name: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface PhotoRow {
  id: string;
  user_id: string;
  homepage_id: string;
  category_id: string;
  image_url: string;
  caption: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface MemoRow {
  id: string;
  user_id: string;
  homepage_id: string;
  title: string;
  content: string;
  category_id: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
