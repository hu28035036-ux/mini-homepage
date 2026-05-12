import { supabaseServer } from '@/lib/db/supabase-server';
import { AppError } from '@/lib/errors/codes';
import type { MemoRow } from '@/types/db';

export const memosRepo = {
  async listByUser(userId: string, homepageId: string): Promise<MemoRow[]> {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('memos')
      .select('*')
      .eq('user_id', userId)
      .eq('homepage_id', homepageId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    if (error) throw new AppError('SERVER_INTERNAL_ERROR');
    return (data as MemoRow[]) ?? [];
  },

  async findOwned(userId: string, id: string): Promise<MemoRow | null> {
    const supabase = supabaseServer();
    const { data } = await supabase
      .from('memos')
      .select('*')
      .eq('user_id', userId)
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();
    return (data as MemoRow | null) ?? null;
  },

  async insert(input: { user_id: string; homepage_id: string; title: string; content: string }): Promise<MemoRow> {
    const supabase = supabaseServer();
    const { data, error } = await supabase.from('memos').insert(input).select('*').single();
    if (error) throw new AppError('SERVER_INTERNAL_ERROR');
    return data as MemoRow;
  },

  async update(userId: string, id: string, patch: { title?: string; content?: string }): Promise<MemoRow> {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('memos')
      .update(patch)
      .eq('user_id', userId)
      .eq('id', id)
      .is('deleted_at', null)
      .select('*')
      .single();
    if (error) throw new AppError('DB_RECORD_NOT_FOUND');
    return data as MemoRow;
  },

  async softDelete(userId: string, id: string): Promise<void> {
    const supabase = supabaseServer();
    const { error, count } = await supabase
      .from('memos')
      .update({ deleted_at: new Date().toISOString() }, { count: 'exact' })
      .eq('user_id', userId)
      .eq('id', id)
      .is('deleted_at', null);
    if (error) throw new AppError('SERVER_INTERNAL_ERROR');
    if (!count) throw new AppError('DB_RECORD_NOT_FOUND');
  },
};
