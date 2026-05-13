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

// v1+v2 카드 스타일 합집합 (v1 호환 유지)
export type CardStyle =
  | 'basic' | 'rounded' | 'shadow' | 'transparent'
  | 'soft' | 'bordered' | 'glass' | 'minimal' | 'elevated' | 'frame';

// v1+v2 폰트 스타일 합집합
export type FontStyle =
  | 'default' | 'rounded' | 'emotional'
  | 'pretendard' | 'notoSans' | 'notoSerif' | 'nanumGothic' | 'gowunDodum' | 'nanumPen' | 'ibmPlex' | 'blackHan' | 'hiMelody';

export type LayoutMode = 'single' | 'double';
export type WidgetKind = 'profile' | 'urls' | 'albums' | 'memos' | 'empty';

// v1 슬롯 (호환 유지)
export interface LayoutSlot {
  slot: number;
  widget: WidgetKind;
  visible: boolean;
}

// v2 자유 캔버스 블록
export type BlockKind = 'title' | 'profile' | 'urls' | 'albums' | 'memos' | 'custom' | 'drawing';
export type FontSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl';

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
  customTitle?: string;      // custom 카드 제목 (Step L)
  customContent?: string;    // custom 카드 본문
  drawingUrl?: string | null; // drawing 카드의 PNG URL (Step M, v0.7)
}

export interface Layouts {
  desktop: Block[];   // ≥ 1024px
  mobile:  Block[];   // < 1024px (태블릿 포함, 태블릿은 폭만 자동 확대)
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
  point_color: string;
  text_color: string;
  card_style: CardStyle;
  font_style: FontStyle;
  layout_mode: LayoutMode;
  layout_slots: LayoutSlot[];
  layouts: Layouts;
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
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
