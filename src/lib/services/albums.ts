import { requireUser } from '@/lib/auth/guards';
import { albumCategoriesRepo } from '@/lib/repositories/albumCategories';
import { photosRepo } from '@/lib/repositories/photos';
import { homepagesRepo } from '@/lib/repositories/homepages';
import { AppError } from '@/lib/errors/codes';
import { createCategorySchema, updateCategorySchema } from '@/lib/validators/albums';
import { parseInput } from './_parse';
import { uploadImage } from '@/lib/storage/uploader';
import { photoPath } from '@/lib/storage/paths';

async function myHp(uid: string) {
  const hp = await homepagesRepo.findByUserActive(uid);
  if (!hp) throw new AppError('DB_RECORD_NOT_FOUND');
  return hp;
}

export const albumsService = {
  // Categories
  async listCategories() {
    const uid = await requireUser();
    const hp = await myHp(uid);
    return albumCategoriesRepo.listByUser(uid, hp.id);
  },
  async createCategory(raw: unknown) {
    const uid = await requireUser();
    const hp = await myHp(uid);
    const input = parseInput(createCategorySchema, raw);
    return albumCategoriesRepo.insert({ user_id: uid, homepage_id: hp.id, name: input.name });
  },
  async updateCategory(id: string, raw: unknown) {
    const uid = await requireUser();
    const input = parseInput(updateCategorySchema, raw);
    return albumCategoriesRepo.update(uid, id, input);
  },
  async deleteCategory(id: string) {
    const uid = await requireUser();
    await albumCategoriesRepo.softDelete(uid, id);
  },

  // Photos
  async listPhotos(categoryId?: string) {
    const uid = await requireUser();
    const hp = await myHp(uid);
    return photosRepo.listByUser(uid, hp.id, categoryId);
  },
  async uploadPhoto(input: {
    categoryId: string;
    caption?: string | null;
    file: { buffer: Buffer; mime: string; byteSize: number; filename: string };
  }) {
    const uid = await requireUser();
    const hp = await myHp(uid);

    // 카테고리 소유 확인
    const cat = await albumCategoriesRepo.findOwned(uid, input.categoryId);
    if (!cat) throw new AppError('DB_RECORD_NOT_FOUND');

    const path = photoPath(uid, input.file.filename);
    const image_url = await uploadImage(input.file.buffer, input.file.mime, input.file.byteSize, path);

    return photosRepo.insert({
      user_id: uid,
      homepage_id: hp.id,
      category_id: input.categoryId,
      image_url,
      caption: input.caption ?? null,
    });
  },
  async deletePhoto(id: string) {
    const uid = await requireUser();
    await photosRepo.softDelete(uid, id);
  },
};
