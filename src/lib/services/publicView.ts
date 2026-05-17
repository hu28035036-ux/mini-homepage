import { homepagesRepo } from '@/lib/repositories/homepages';
import { urlsRepo } from '@/lib/repositories/urls';
import { albumCategoriesRepo } from '@/lib/repositories/albumCategories';
import { photosRepo } from '@/lib/repositories/photos';
import { memosRepo } from '@/lib/repositories/memos';
import { usersRepo } from '@/lib/repositories/users';
import { AppError } from '@/lib/errors/codes';
import type { MiniHomepageRow, PhotoRow } from '@/types/db';

/**
 * 공개 미니홈피 조회.
 * - is_public AND deleted_at IS NULL인 경우에만 데이터 반환.
 * - 비공개와 미존재를 동일하게 HOMEPAGE_PRIVATE_OR_NOT_FOUND로 응답하여 slug 존재 여부 누설 방지.
 * - 비밀번호 해시, 이메일 등 민감 정보는 절대 반환하지 않음.
 */
export async function loadPublicHomepage(slug: string) {
  const hp = await homepagesRepo.findPublicBySlug(slug);
  if (!hp) throw new AppError('HOMEPAGE_PRIVATE_OR_NOT_FOUND');

  const [owner, urls, categories, photos, memos] = await Promise.all([
    usersRepo.findByIdActive(hp.user_id),
    urlsRepo.listByUser(hp.user_id, hp.id),
    albumCategoriesRepo.listByUser(hp.user_id, hp.id),
    photosRepo.listByUser(hp.user_id, hp.id),
    memosRepo.listByUser(hp.user_id, hp.id),
  ]);
  if (!owner) throw new AppError('HOMEPAGE_PRIVATE_OR_NOT_FOUND');

  // 카테고리별 사진 그룹
  const albums = categories.map((c) => ({
    category: c.name,
    photos: photos
      .filter((p: PhotoRow) => p.category_id === c.id)
      .slice(0, 6)
      .map((p) => ({ id: p.id, image_url: p.image_url, caption: p.caption })),
  }));

  return {
    homepage: stripHomepage(hp),
    profile: { nickname: owner.nickname, intro: hp.intro, image_url: hp.profile_image_url },
    urls: urls.slice(0, 12).map((u) => ({ id: u.id, title: u.title, url: u.url, created_at: u.created_at })),
    albums,
    memos: memos.slice(0, 6).map((m) => ({ id: m.id, title: m.title, content: m.content, created_at: m.created_at })),
  };
}

// 응답에 노출되어도 안전한 필드만 추림
function stripHomepage(hp: MiniHomepageRow) {
  return {
    slug: hp.slug,
    title: hp.title,
    intro: hp.intro,
    profile_image_url: hp.profile_image_url,
    background_color: hp.background_color,
    background_image_url: hp.background_image_url,
    use_background_image: hp.use_background_image,
    background_pattern: hp.background_pattern,
    background_pattern_color: hp.background_pattern_color,
    point_color: hp.point_color,
    text_color: hp.text_color,
    card_style: hp.card_style,
    card_background_color: hp.card_background_color,
    font_style: hp.font_style,
    default_card_opacity: hp.default_card_opacity,
    default_font_size: hp.default_font_size,
    layout_mode: hp.layout_mode,
    layout_slots: hp.layout_slots,
    layouts: hp.layouts,
    card_categories: hp.card_categories,
  };
}
