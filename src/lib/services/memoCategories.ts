import { requireUser } from '@/lib/auth/guards';
import { homepagesRepo } from '@/lib/repositories/homepages';
import { AppError } from '@/lib/errors/codes';
import { createMemoCategorySchema, updateMemoCategorySchema } from '@/lib/validators/memos';
import { parseInput } from './_parse';
import type { CardCategory } from '@/types/db';

async function myHp(uid: string) {
  const hp = await homepagesRepo.findByUserActive(uid);
  if (!hp) throw new AppError('DB_RECORD_NOT_FOUND');
  return hp;
}

/**
 * 메모 카테고리 — 별도 테이블 없이 mini_homepages.memo_categories JSONB 배열로 관리.
 * 메모(memos.category_id)가 이 목록의 id를 참조한다. (마이그 0009)
 */
export const memoCategoriesService = {
  async list(): Promise<CardCategory[]> {
    const uid = await requireUser();
    const hp = await myHp(uid);
    return hp.memo_categories ?? [];
  },

  async create(raw: unknown): Promise<CardCategory> {
    const uid = await requireUser();
    const hp = await myHp(uid);
    const input = parseInput(createMemoCategorySchema, raw);
    const name = input.name.trim();
    const list = hp.memo_categories ?? [];
    if (list.some((c) => c.name === name)) {
      throw new AppError('MEMO_CATEGORY_DUPLICATE');
    }
    const item: CardCategory = { id: crypto.randomUUID(), name };
    await homepagesRepo.updateDecorate(uid, { memo_categories: [...list, item] });
    return item;
  },

  async rename(id: string, raw: unknown): Promise<CardCategory> {
    const uid = await requireUser();
    const hp = await myHp(uid);
    const input = parseInput(updateMemoCategorySchema, raw);
    const name = input.name.trim();
    const list = hp.memo_categories ?? [];
    if (!list.some((c) => c.id === id)) throw new AppError('DB_RECORD_NOT_FOUND');
    if (list.some((c) => c.name === name && c.id !== id)) {
      throw new AppError('MEMO_CATEGORY_DUPLICATE');
    }
    const next = list.map((c) => (c.id === id ? { ...c, name } : c));
    await homepagesRepo.updateDecorate(uid, { memo_categories: next });
    return { id, name };
  },

  async remove(id: string): Promise<void> {
    const uid = await requireUser();
    const hp = await myHp(uid);
    const list = hp.memo_categories ?? [];
    await homepagesRepo.updateDecorate(uid, { memo_categories: list.filter((c) => c.id !== id) });
  },
};
