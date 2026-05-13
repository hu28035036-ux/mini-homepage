import { z } from 'zod';

const hex = z.string().regex(/^#[0-9a-fA-F]{3,8}$/, 'DECORATE_INVALID_VALUE');

const slotSchema = z.object({
  slot: z.number().int().positive(),
  widget: z.enum(['profile', 'urls', 'albums', 'memos', 'empty']),
  visible: z.boolean(),
});

const CARD_STYLES = [
  'basic', 'rounded', 'shadow', 'transparent',
  'soft', 'bordered', 'glass', 'minimal', 'elevated', 'frame',
] as const;

const FONT_STYLES = [
  'default', 'rounded', 'emotional',
  'pretendard', 'notoSans', 'notoSerif', 'nanumGothic', 'gowunDodum', 'nanumPen', 'ibmPlex', 'blackHan', 'hiMelody',
] as const;

const FONT_SIZES = ['xs', 'sm', 'base', 'lg', 'xl'] as const;

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
  fontSize: z.enum(FONT_SIZES).optional(),
  customTitle: z.string().max(200).optional(),
  customContent: z.string().max(5000).optional(),
  drawingUrl: z.string().url().nullable().optional(),
});

const layoutsSchema = z.object({
  desktop: z.array(blockSchema).max(50),
  mobile: z.array(blockSchema).max(50),
});

export const updateDecorateSchema = z.object({
  background_color: hex.optional(),
  background_image_url: z.string().url().nullable().optional(),
  use_background_image: z.boolean().optional(),
  point_color: hex.optional(),
  text_color: hex.optional(),
  card_style: z.enum(CARD_STYLES).optional(),
  font_style: z.enum(FONT_STYLES).optional(),
  default_card_opacity: z.number().min(0).max(1).optional(),
  default_font_size: z.enum(FONT_SIZES).optional(),
  layout_mode: z.enum(['single', 'double']).optional(),
  layout_slots: z.array(slotSchema).optional(),
  layouts: layoutsSchema.optional(),
});

export type UpdateDecorateInput = z.infer<typeof updateDecorateSchema>;
