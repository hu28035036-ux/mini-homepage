import { requireUser } from '@/lib/auth/guards';
import { homepagesRepo } from '@/lib/repositories/homepages';
import { isValidSlug, defaultSlugFromUserId } from '@/lib/utils/slug';
import { AppError } from '@/lib/errors/codes';
import type { MiniHomepageRow } from '@/types/db';

/**
 * 세션과 무관하게 특정 user_id의 미니홈피를 보장.
 * 가입 직후 호출처럼 세션이 없을 때도 사용 가능.
 * 동시 호출 안전: 23505 충돌 시 재조회.
 */
export async function ensureHomepageForUserId(userId: string): Promise<MiniHomepageRow> {
  let existing = await homepagesRepo.findByUserActive(userId);
  if (existing) return existing;

  const base = defaultSlugFromUserId(userId);
  for (let i = 0; i < 5; i++) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;
    try {
      return await homepagesRepo.insertWithDefaultCategory({ user_id: userId, slug: candidate });
    } catch (e) {
      if (e instanceof AppError && e.code === 'HOMEPAGE_SLUG_DUPLICATE') {
        existing = await homepagesRepo.findByUserActive(userId);
        if (existing) return existing;
        continue;
      }
      throw e;
    }
  }
  throw new AppError('HOMEPAGE_SLUG_DUPLICATE', undefined, '기본 주소 생성에 실패했습니다.');
}

export const homepageService = {
  /** 본인 미니홈피. 없으면 null. */
  async getMine(): Promise<MiniHomepageRow | null> {
    const uid = await requireUser();
    return homepagesRepo.findByUserActive(uid);
  },

  /** 본인 미니홈피. 없으면 기본 slug로 자동 생성. */
  async ensureMine(): Promise<MiniHomepageRow> {
    const uid = await requireUser();
    return ensureHomepageForUserId(uid);
  },

  async updateProfile(patch: {
    title?: string;
    intro?: string | null;
    profile_image_url?: string | null;
    is_public?: boolean;
    slug?: string;
  }): Promise<MiniHomepageRow> {
    const uid = await requireUser();
    if (patch.slug !== undefined && !isValidSlug(patch.slug)) {
      throw new AppError('VALIDATION_INVALID_FORMAT', { field: 'slug' });
    }
    return homepagesRepo.updateProfile(uid, patch);
  },
};
