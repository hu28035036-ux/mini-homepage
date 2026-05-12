import { z } from 'zod';

const urlSchema = z
  .string()
  .min(1)
  .refine((v) => /^https?:\/\//i.test(v), { message: 'URL_INVALID_FORMAT' });

export const createUrlSchema = z.object({
  title: z.string().min(1).max(100),
  url: urlSchema,
});

export const updateUrlSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  url: urlSchema.optional(),
});
