import { z } from 'zod';

/** 카드 카테고리 생성 입력 */
export const createCardCategorySchema = z.object({
  name: z.string().min(1).max(30),
});
