import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1).max(30),
});

export const updateCategorySchema = z.object({
  name: z.string().min(1).max(30),
});

export const createPhotoMetaSchema = z.object({
  category_id: z.string().uuid(),
  caption: z.string().max(200).optional().nullable(),
});
