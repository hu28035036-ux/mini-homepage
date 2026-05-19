import { supabaseServer } from '@/lib/db/supabase-server';
import { AppError } from '@/lib/errors/codes';

/** 휴지통 대상 엔티티 — 실제 테이블 + deleted_at 보유 4종 */
export type TrashEntity = 'url' | 'photo' | 'memo' | 'album_category';

const TABLE: Record<TrashEntity, string> = {
  url: 'urls',
  photo: 'photos',
  memo: 'memos',
  album_category: 'album_categories',
};

type Row = Record<string, unknown>;

export const trashRepo = {
  /** 소프트 삭제된(deleted_at IS NOT NULL) 항목 목록 */
  async listDeleted(userId: string, entity: TrashEntity): Promise<Row[]> {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from(TABLE[entity])
      .select('*')
      .eq('user_id', userId)
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false });
    if (error) throw new AppError('SERVER_INTERNAL_ERROR');
    return (data as Row[]) ?? [];
  },

  /** 삭제된 단일 항목 조회 (복구 전 메타 확인용) */
  async findDeleted(userId: string, entity: TrashEntity, id: string): Promise<Row | null> {
    const supabase = supabaseServer();
    const { data } = await supabase
      .from(TABLE[entity])
      .select('*')
      .eq('user_id', userId)
      .eq('id', id)
      .not('deleted_at', 'is', null)
      .maybeSingle();
    return (data as Row | null) ?? null;
  },

  /** 복구 — deleted_at = null */
  async restore(userId: string, entity: TrashEntity, id: string): Promise<void> {
    const supabase = supabaseServer();
    const { error, count } = await supabase
      .from(TABLE[entity])
      .update({ deleted_at: null }, { count: 'exact' })
      .eq('user_id', userId)
      .eq('id', id)
      .not('deleted_at', 'is', null);
    if (error) {
      // 부분 unique 인덱스(예: 카테고리 이름) 충돌 — 같은 이름이 이미 활성 상태
      if ((error as { code?: string }).code === '23505') throw new AppError('ALBUM_CATEGORY_DUPLICATE');
      throw new AppError('SERVER_INTERNAL_ERROR');
    }
    if (!count) throw new AppError('DB_RECORD_NOT_FOUND');
  },

  /** 영구 삭제 — 행 자체를 제거. 휴지통(삭제 상태)에 있는 항목만 가능 */
  async hardDelete(userId: string, entity: TrashEntity, id: string): Promise<void> {
    const supabase = supabaseServer();
    const { error, count } = await supabase
      .from(TABLE[entity])
      .delete({ count: 'exact' })
      .eq('user_id', userId)
      .eq('id', id)
      .not('deleted_at', 'is', null);
    if (error) throw new AppError('SERVER_INTERNAL_ERROR');
    if (!count) throw new AppError('DB_RECORD_NOT_FOUND');
  },

  /** 카테고리 복구 cascade — 카테고리와 같은 시각에 함께 삭제된 사진을 복구 */
  async restorePhotosCascade(userId: string, categoryId: string, deletedAt: string): Promise<void> {
    const supabase = supabaseServer();
    const { error } = await supabase
      .from('photos')
      .update({ deleted_at: null })
      .eq('user_id', userId)
      .eq('category_id', categoryId)
      .eq('deleted_at', deletedAt);
    if (error) throw new AppError('SERVER_INTERNAL_ERROR');
  },

  /** 카테고리 영구삭제 cascade — 해당 카테고리의 삭제된 사진을 모두 영구삭제 */
  async hardDeletePhotosByCategory(userId: string, categoryId: string): Promise<void> {
    const supabase = supabaseServer();
    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('user_id', userId)
      .eq('category_id', categoryId)
      .not('deleted_at', 'is', null);
    if (error) throw new AppError('SERVER_INTERNAL_ERROR');
  },

  /** 카테고리가 삭제 상태인지 — 사진 개별 복구 차단 판단용. 카테고리 미존재도 true 취급 */
  async isCategoryDeleted(userId: string, categoryId: string): Promise<boolean> {
    const supabase = supabaseServer();
    const { data } = await supabase
      .from('album_categories')
      .select('deleted_at')
      .eq('user_id', userId)
      .eq('id', categoryId)
      .maybeSingle();
    if (!data) return true;
    return (data as { deleted_at: string | null }).deleted_at !== null;
  },
};
