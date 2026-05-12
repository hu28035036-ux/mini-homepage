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

export type CardStyle = 'basic' | 'rounded' | 'shadow' | 'transparent';
export type FontStyle = 'default' | 'rounded' | 'emotional';
export type LayoutMode = 'single' | 'double';
export type WidgetKind = 'profile' | 'urls' | 'albums' | 'memos' | 'empty';

export interface LayoutSlot {
  slot: number;
  widget: WidgetKind;
  visible: boolean;
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
