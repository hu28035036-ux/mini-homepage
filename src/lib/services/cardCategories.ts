import { requireUser } from '@/lib/auth/guards';
import { homepagesRepo } from '@/lib/repositories/homepages';
import { AppError } from '@/lib/errors/codes';
import { createCardCategorySchema } from '@/lib/validators/cards';
import { parseInput } from './_parse';
import type { CardCategory } from '@/types/db';

async function myHp(uid: string) {
  const hp = await homepagesRepo.findByUserActive(uid);
  if (!hp) throw new AppError('DB_RECORD_NOT_FOUND');
  return hp;
}

/**
 * 카드 카테고리 — 별도 테이블 없이 mini_homepages.card_categories JSONB 배열로 관리.
 * 모든 카드(Block)가 categoryId 로 참조한다.
 */
export const cardCategoriesService = {
  async list(): Promise<CardCategory[]> {
    const uid = await requireUser();
    const hp = await myHp(uid);
    return hp.card_categories ?? [];
  },

  async create(raw: unknown): Promise<CardCategory> {
    const uid = await requireUser();
    const hp = await myHp(uid);
    const input = parseInput(createCardCategorySchema, raw);
    const name = input.name.trim();
    const list = hp.card_categories ?? [];
    if (list.some((c) => c.name === name)) {
      throw new AppError('CARD_CATEGORY_DUPLICATE');
    }
    const item: CardCategory = { id: crypto.randomUUID(), name };
    await homepagesRepo.updateDecorate(uid, { card_categories: [...list, item] });
    return item;
  },

  async remove(id: string): Promise<void> {
    const uid = await requireUser();
    const hp = await myHp(uid);
    const list = hp.card_categories ?? [];
    await homepagesRepo.updateDecorate(uid, { card_categories: list.filter((c) => c.id !== id) });
  },
};
