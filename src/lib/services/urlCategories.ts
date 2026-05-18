import { requireUser } from '@/lib/auth/guards';
import { homepagesRepo } from '@/lib/repositories/homepages';
import { AppError } from '@/lib/errors/codes';
import { createUrlCategorySchema, updateUrlCategorySchema } from '@/lib/validators/urls';
import { parseInput } from './_parse';
import type { CardCategory } from '@/types/db';

async function myHp(uid: string) {
  const hp = await homepagesRepo.findByUserActive(uid);
  if (!hp) throw new AppError('DB_RECORD_NOT_FOUND');
  return hp;
}

/**
 * URL 카테고리 — 별도 테이블 없이 mini_homepages.url_categories JSONB 배열로 관리.
 * URL(urls.category_id)이 이 목록의 id를 참조한다. (마이그 0009)
 */
export const urlCategoriesService = {
  async list(): Promise<CardCategory[]> {
    const uid = await requireUser();
    const hp = await myHp(uid);
    return hp.url_categories ?? [];
  },

  async create(raw: unknown): Promise<CardCategory> {
    const uid = await requireUser();
    const hp = await myHp(uid);
    const input = parseInput(createUrlCategorySchema, raw);
    const name = input.name.trim();
    const list = hp.url_categories ?? [];
    if (list.some((c) => c.name === name)) {
      throw new AppError('URL_CATEGORY_DUPLICATE');
    }
    const item: CardCategory = { id: crypto.randomUUID(), name };
    await homepagesRepo.updateDecorate(uid, { url_categories: [...list, item] });
    return item;
  },

  async rename(id: string, raw: unknown): Promise<CardCategory> {
    const uid = await requireUser();
    const hp = await myHp(uid);
    const input = parseInput(updateUrlCategorySchema, raw);
    const name = input.name.trim();
    const list = hp.url_categories ?? [];
    if (!list.some((c) => c.id === id)) throw new AppError('DB_RECORD_NOT_FOUND');
    if (list.some((c) => c.name === name && c.id !== id)) {
      throw new AppError('URL_CATEGORY_DUPLICATE');
    }
    const next = list.map((c) => (c.id === id ? { ...c, name } : c));
    await homepagesRepo.updateDecorate(uid, { url_categories: next });
    return { id, name };
  },

  async remove(id: string): Promise<void> {
    const uid = await requireUser();
    const hp = await myHp(uid);
    const list = hp.url_categories ?? [];
    await homepagesRepo.updateDecorate(uid, { url_categories: list.filter((c) => c.id !== id) });
  },
};
