import { z } from 'zod';

export const createMemoSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(10000),
});

export const updateMemoSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  content: z.string().min(1).max(10000).optional(),
});
