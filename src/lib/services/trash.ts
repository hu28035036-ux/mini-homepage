import { requireUser } from '@/lib/auth/guards';
import { trashRepo, type TrashEntity } from '@/lib/repositories/trash';
import { AppError } from '@/lib/errors/codes';
import type { UrlRow, PhotoRow, MemoRow, AlbumCategoryRow } from '@/types/db';

const ENTITIES: TrashEntity[] = ['url', 'photo', 'memo', 'album_category'];

function asEntity(v: unknown): TrashEntity {
  if (typeof v === 'string' && (ENTITIES as string[]).includes(v)) return v as TrashEntity;
  throw new AppError('VALIDATION_INVALID_FORMAT');
}

function asId(v: unknown): string {
  if (typeof v === 'string' && v.length > 0) return v;
  throw new AppError('VALIDATION_REQUIRED_FIELD');
}

export interface TrashList {
  urls: UrlRow[];
  photos: PhotoRow[];
  memos: MemoRow[];
  albumCategories: AlbumCategoryRow[];
}

export const trashService = {
  async list(): Promise<TrashList> {
    const uid = await requireUser();
    const [urls, photos, memos, albumCategories] = await Promise.all([
      trashRepo.listDeleted(uid, 'url'),
      trashRepo.listDeleted(uid, 'photo'),
      trashRepo.listDeleted(uid, 'memo'),
      trashRepo.listDeleted(uid, 'album_category'),
    ]);
    return {
      urls: urls as unknown as UrlRow[],
      photos: photos as unknown as PhotoRow[],
      memos: memos as unknown as MemoRow[],
      albumCategories: albumCategories as unknown as AlbumCategoryRow[],
    };
  },

  async restore(rawEntity: unknown, rawId: unknown): Promise<void> {
    const uid = await requireUser();
    const entity = asEntity(rawEntity);
    const id = asId(rawId);

    // 카테고리 복구 → 함께 삭제됐던 사진까지 cascade 복구
    if (entity === 'album_category') {
      const cat = await trashRepo.findDeleted(uid, 'album_category', id);
      if (!cat) throw new AppError('DB_RECORD_NOT_FOUND');
      const deletedAt = cat.deleted_at as string;
      await trashRepo.restore(uid, 'album_category', id);
      await trashRepo.restorePhotosCascade(uid, id, deletedAt);
      return;
    }

    // 사진 개별 복구 — 카테고리가 삭제 상태면 차단(카테고리 먼저 복구해야 앨범에 보임)
    if (entity === 'photo') {
      const photo = await trashRepo.findDeleted(uid, 'photo', id);
      if (!photo) throw new AppError('DB_RECORD_NOT_FOUND');
      if (await trashRepo.isCategoryDeleted(uid, photo.category_id as string)) {
        throw new AppError('TRASH_RESTORE_BLOCKED');
      }
    }

    await trashRepo.restore(uid, entity, id);
  },

  async purge(rawEntity: unknown, rawId: unknown): Promise<void> {
    const uid = await requireUser();
    const entity = asEntity(rawEntity);
    const id = asId(rawId);

    // 카테고리 영구삭제 → 그 카테고리의 삭제된 사진도 함께 영구삭제(고아 방지)
    if (entity === 'album_category') {
      await trashRepo.hardDeletePhotosByCategory(uid, id);
    }
    await trashRepo.hardDelete(uid, entity, id);
  },
};
