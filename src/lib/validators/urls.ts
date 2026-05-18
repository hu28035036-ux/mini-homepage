import { z } from 'zod';

const urlSchema = z
  .string()
  .min(1)
  .refine((v) => /^https?:\/\//i.test(v), { message: 'URL_INVALID_FORMAT' });

export const createUrlSchema = z.object({
  title: z.string().min(1).max(100),
  url: urlSchema,
  category_id: z.string().min(1).nullable().optional(),
});

export const updateUrlSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  url: urlSchema.optional(),
  category_id: z.string().min(1).nullable().optional(),
});

// URL 카테고리 (mini_homepages.url_categories JSONB 배열, 마이그 0009)
export const createUrlCategorySchema = z.object({
  name: z.string().min(1).max(30),
});
export const updateUrlCategorySchema = z.object({
  name: z.string().min(1).max(30),
});
