import { supabaseServer } from '@/lib/db/supabase-server';
import type { UserRow } from '@/types/db';
import { AppError } from '@/lib/errors/codes';

export const usersRepo = {
  async findByEmailActive(email: string): Promise<UserRow | null> {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .is('deleted_at', null)
      .maybeSingle();
    if (error) {
      console.error('[users.findByEmailActive]', error);
      throw new AppError('SERVER_INTERNAL_ERROR');
    }
    return (data as UserRow | null) ?? null;
  },

  async findByIdActive(id: string): Promise<UserRow | null> {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle();
    if (error) {
      console.error('[users.findByIdActive]', error);
      throw new AppError('SERVER_INTERNAL_ERROR');
    }
    return (data as UserRow | null) ?? null;
  },

  async insert(input: { email: string; password_hash: string; nickname: string }): Promise<UserRow> {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('users')
      .insert({
        email: input.email.toLowerCase(),
        password_hash: input.password_hash,
        nickname: input.nickname,
      })
      .select('*')
      .single();
    if (error) {
      // Postgres unique violation
      if ((error as { code?: string }).code === '23505') {
        throw new AppError('AUTH_EMAIL_DUPLICATE');
      }
      console.error('[users.insert]', error);
      throw new AppError('SERVER_INTERNAL_ERROR');
    }
    return data as UserRow;
  },

  async updatePassword(userId: string, password_hash: string): Promise<void> {
    const supabase = supabaseServer();
    const { error } = await supabase
      .from('users')
      .update({ password_hash })
      .eq('id', userId)
      .is('deleted_at', null);
    if (error) {
      console.error('[users.updatePassword]', error);
      throw new AppError('SERVER_INTERNAL_ERROR');
    }
  },
};
