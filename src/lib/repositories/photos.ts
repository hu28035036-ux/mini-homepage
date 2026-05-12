import { supabaseServer } from '@/lib/db/supabase-server';
import { AppError } from '@/lib/errors/codes';
import type { PhotoRow } from '@/types/db';

export const photosRepo = {
  async listByUser(userId: string, homepageId: string, categoryId?: string): Promise<PhotoRow[]> {
    const supabase = supabaseServer();
    let q = supabase
      .from('photos')
      .select('*')
      .eq('user_id', userId)
      .eq('homepage_id', homepageId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    if (categoryId) q = q.eq('category_id', categoryId);
    const { data, error } = await q;
    if (error) throw new AppError('SERVER_INTERNAL_ERROR');
    return (data as PhotoRow[]) ?? [];
  },

  async insert(input: {
    user_id: string;
    homepage_id: string;
    category_id: string;
    image_url: string;
    caption?: string | null;
  }): Promise<PhotoRow> {
    const supabase = supabaseServer();
    const { data, error } = await supabase.from('photos').insert(input).select('*').single();
    if (error) throw new AppError('SERVER_INTERNAL_ERROR');
    return data as PhotoRow;
  },

  async softDelete(userId: string, id: string): Promise<void> {
    const supabase = supabaseServer();
    const { error, count } = await supabase
      .from('photos')
      .update({ deleted_at: new Date().toISOString() }, { count: 'exact' })
      .eq('user_id', userId)
      .eq('id', id)
      .is('deleted_at', null);
    if (error) throw new AppError('SERVER_INTERNAL_ERROR');
    if (!count) throw new AppError('DB_RECORD_NOT_FOUND');
  },
};
