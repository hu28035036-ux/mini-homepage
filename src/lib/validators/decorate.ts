import { z } from 'zod';

// 단색(#hex) 또는 그라데이션(linear/radial/conic-gradient(...)) 문자열 허용 — 배경/카드배경/글자색/포인트색 공통
const colorOrGradient = z.string().regex(
  /^(#[0-9a-fA-F]{3,8}|(linear|radial|conic)-gradient\([^)]+(\)|\)\s*))$/,
  'DECORATE_INVALID_VALUE',
).max(500);

const slotSchema = z.object({
  slot: z.number().int().positive(),
  widget: z.enum(['profile', 'urls', 'albums', 'memos', 'empty']),
  visible: z.boolean(),
});

const CARD_STYLES = [
  'basic', 'rounded', 'shadow', 'transparent',
  'soft', 'bordered', 'glass', 'minimal', 'elevated', 'frame',
  'sticky', 'mint', 'pink', 'sky',
  'notebook', 'grid-paper',
  'dashed', 'double-border', 'ringed', 'bevel',
] as const;

const FONT_STYLES = [
  'default', 'rounded', 'emotional',
  'pretendard', 'notoSans', 'notoSerif', 'nanumGothic', 'gowunDodum', 'nanumPen', 'ibmPlex', 'blackHan', 'hiMelody',
] as const;

// v0.9: 글자 크기는 pt 정수 (6~96)
const fontSizePt = z.number().int().min(6).max(96);

const blockSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(['title', 'profile', 'urls', 'albums', 'memos', 'custom', 'drawing']),
  x: z.number().finite(),
  y: z.number().finite(),
  w: z.number().min(160).max(4000),
  h: z.number().min(80).max(4000),
  z: z.number().int().min(-9999).max(9999),
  visible: z.boolean(),
  visibility: z.enum(['public', 'private']),
  opacity: z.number().min(0).max(1).optional(),
  fontSize: fontSizePt.optional(),
  customTitle: z.string().max(200).optional(),
  customContent: z.string().max(5000).optional(),
  drawingUrl: z.string().url().nullable().optional(),
  categoryId: z.string().optional(),
  albumCategoryId: z.string().optional(),
  memoCategoryId: z.string().optional(),
  urlCategoryId: z.string().optional(),
});

const layoutsSchema = z.object({
  desktop: z.array(blockSchema).max(50),
  mobile: z.array(blockSchema).max(50),
});

const BACKGROUND_PATTERNS = [
  'none', 'dots', 'grid', 'diagonal', 'stripes',
  'checker', 'crosshatch', 'waves', 'triangles',
] as const;

// 패턴 색 / 카드 배경색은 단색(#hex+alpha) 또는 그라데이션 둘 다 허용
const hexAlpha = colorOrGradient;

// 카드 카테고리 목록 (마이그 0007)
const cardCategoriesSchema = z.array(
  z.object({ id: z.string().min(1), name: z.string().min(1).max(30) }),
).max(50);

export const updateDecorateSchema = z.object({
  background_color: colorOrGradient.optional(),
  background_image_url: z.string().url().nullable().optional(),
  use_background_image: z.boolean().optional(),
  background_pattern: z.enum(BACKGROUND_PATTERNS).optional(),
  background_pattern_color: hexAlpha.optional(),
  point_color: colorOrGradient.optional(),
  text_color: colorOrGradient.optional(),
  card_style: z.enum(CARD_STYLES).optional(),
  card_background_color: hexAlpha.nullable().optional(),
  font_style: z.enum(FONT_STYLES).optional(),
  default_card_opacity: z.number().min(0).max(1).optional(),
  default_font_size: fontSizePt.optional(),
  layout_mode: z.enum(['single', 'double']).optional(),
  layout_slots: z.array(slotSchema).optional(),
  layouts: layoutsSchema.optional(),
  card_categories: cardCategoriesSchema.optional(),
});

export type UpdateDecorateInput = z.infer<typeof updateDecorateSchema>;
