import { supabaseServer } from '@/lib/db/supabase-server';
import { AppError } from '@/lib/errors/codes';
import type { UrlRow } from '@/types/db';

export const urlsRepo = {
  async listByUser(userId: string, homepageId: string): Promise<UrlRow[]> {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('urls')
      .select('*')
      .eq('user_id', userId)
      .eq('homepage_id', homepageId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    if (error) throw new AppError('SERVER_INTERNAL_ERROR');
    return (data as UrlRow[]) ?? [];
  },

  async findOwned(userId: string, id: string): Promise<UrlRow | null> {
    const supabase = supabaseServer();
    const { data } = await supabase
      .from('urls')
      .select('*')
      .eq('user_id', userId)
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();
    return (data as UrlRow | null) ?? null;
  },

  async insert(input: { user_id: string; homepage_id: string; title: string; url: string; category_id?: string | null }): Promise<UrlRow> {
    const supabase = supabaseServer();
    const { data, error } = await supabase.from('urls').insert(input).select('*').single();
    if (error) throw new AppError('SERVER_INTERNAL_ERROR');
    return data as UrlRow;
  },

  async update(userId: string, id: string, patch: { title?: string; url?: string; category_id?: string | null }): Promise<UrlRow> {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('urls')
      .update(patch)
      .eq('user_id', userId)
      .eq('id', id)
      .is('deleted_at', null)
      .select('*')
      .single();
    if (error) throw new AppError('DB_RECORD_NOT_FOUND');
    return data as UrlRow;
  },

  async softDelete(userId: string, id: string): Promise<void> {
    const supabase = supabaseServer();
    const { error, count } = await supabase
      .from('urls')
      .update({ deleted_at: new Date().toISOString() }, { count: 'exact' })
      .eq('user_id', userId)
      .eq('id', id)
      .is('deleted_at', null);
    if (error) throw new AppError('SERVER_INTERNAL_ERROR');
    if (!count) throw new AppError('DB_RECORD_NOT_FOUND');
  },
};
