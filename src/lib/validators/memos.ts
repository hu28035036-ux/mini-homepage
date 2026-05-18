import { z } from 'zod';

export const createMemoSchema = z.object({
  title: z.string().min(1).max(100),
  content: z.string().min(1).max(10000),
  category_id: z.string().min(1).nullable().optional(),
});

// 편집 중에는 빈 문자열도 허용 (자동저장 디바운스 도중 비워질 수 있음)
export const updateMemoSchema = z.object({
  title: z.string().max(100).optional(),
  content: z.string().max(10000).optional(),
  category_id: z.string().min(1).nullable().optional(),
});

// 메모 카테고리 (mini_homepages.memo_categories JSONB 배열, 마이그 0009)
export const createMemoCategorySchema = z.object({
  name: z.string().min(1).max(30),
});
export const updateMemoCategorySchema = z.object({
  name: z.string().min(1).max(30),
});
