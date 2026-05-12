import { supabaseServer } from '@/lib/db/supabase-server';
import { AppError } from '@/lib/errors/codes';
import type { AlbumCategoryRow } from '@/types/db';

export const albumCategoriesRepo = {
  async listByUser(userId: string, homepageId: string): Promise<AlbumCategoryRow[]> {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('album_categories')
      .select('*')
      .eq('user_id', userId)
      .eq('homepage_id', homepageId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });
    if (error) throw new AppError('SERVER_INTERNAL_ERROR');
    return (data as AlbumCategoryRow[]) ?? [];
  },

  async findOwned(userId: string, id: string): Promise<AlbumCategoryRow | null> {
    const supabase = supabaseServer();
    const { data } = await supabase
      .from('album_categories')
      .select('*')
      .eq('user_id', userId)
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();
    return (data as AlbumCategoryRow | null) ?? null;
  },

  async insert(input: { user_id: string; homepage_id: string; name: string }): Promise<AlbumCategoryRow> {
    const supabase = supabaseServer();
    const { data, error } = await supabase.from('album_categories').insert(input).select('*').single();
    if (error) {
      if ((error as { code?: string }).code === '23505') throw new AppError('ALBUM_CATEGORY_DUPLICATE');
      throw new AppError('SERVER_INTERNAL_ERROR');
    }
    return data as AlbumCategoryRow;
  },

  async update(userId: string, id: string, patch: { name: string }): Promise<AlbumCategoryRow> {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('album_categories')
      .update(patch)
      .eq('user_id', userId)
      .eq('id', id)
      .is('deleted_at', null)
      .select('*')
      .single();
    if (error) {
      if ((error as { code?: string }).code === '23505') throw new AppError('ALBUM_CATEGORY_DUPLICATE');
      throw new AppError('DB_RECORD_NOT_FOUND');
    }
    return data as AlbumCategoryRow;
  },

  async softDelete(userId: string, id: string): Promise<void> {
    const supabase = supabaseServer();
    const now = new Date().toISOString();
    // 카테고리 + 안의 사진까지 함께 소프트 삭제
    const { error: e1, count } = await supabase
      .from('album_categories')
      .update({ deleted_at: now }, { count: 'exact' })
      .eq('user_id', userId)
      .eq('id', id)
      .is('deleted_at', null);
    if (e1) throw new AppError('SERVER_INTERNAL_ERROR');
    if (!count) throw new AppError('DB_RECORD_NOT_FOUND');

    const { error: e2 } = await supabase
      .from('photos')
      .update({ deleted_at: now })
      .eq('user_id', userId)
      .eq('category_id', id)
      .is('deleted_at', null);
    if (e2) throw new AppError('SERVER_INTERNAL_ERROR');
  },
};
