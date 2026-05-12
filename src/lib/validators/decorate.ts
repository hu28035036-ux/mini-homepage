import { z } from 'zod';

const hex = z.string().regex(/^#[0-9a-fA-F]{3,8}$/, 'DECORATE_INVALID_VALUE');

const slotSchema = z.object({
  slot: z.number().int().positive(),
  widget: z.enum(['profile', 'urls', 'albums', 'memos', 'empty']),
  visible: z.boolean(),
});

export const updateDecorateSchema = z.object({
  background_color: hex.optional(),
  background_image_url: z.string().url().nullable().optional(),
  use_background_image: z.boolean().optional(),
  point_color: hex.optional(),
  text_color: hex.optional(),
  card_style: z.enum(['basic', 'rounded', 'shadow', 'transparent']).optional(),
  font_style: z.enum(['default', 'rounded', 'emotional']).optional(),
  layout_mode: z.enum(['single', 'double']).optional(),
  layout_slots: z.array(slotSchema).optional(),
});

export type UpdateDecorateInput = z.infer<typeof updateDecorateSchema>;
