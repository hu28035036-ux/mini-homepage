import { supabaseServer } from '@/lib/db/supabase-server';
import type { MiniHomepageRow, LayoutSlot, Layouts } from '@/types/db';
import { AppError } from '@/lib/errors/codes';

export const homepagesRepo = {
  async findByUserActive(userId: string): Promise<MiniHomepageRow | null> {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('mini_homepages')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .maybeSingle();
    if (error) {
      console.error('[homepages.findByUserActive]', error);
      throw new AppError('SERVER_INTERNAL_ERROR');
    }
    return (data as MiniHomepageRow | null) ?? null;
  },

  async findPublicBySlug(slug: string): Promise<MiniHomepageRow | null> {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('mini_homepages')
      .select('*')
      .eq('slug', slug)
      .eq('is_public', true)
      .is('deleted_at', null)
      .maybeSingle();
    if (error) {
      console.error('[homepages.findPublicBySlug]', error);
      throw new AppError('SERVER_INTERNAL_ERROR');
    }
    return (data as MiniHomepageRow | null) ?? null;
  },

  async slugExists(slug: string): Promise<boolean> {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('mini_homepages')
      .select('id')
      .eq('slug', slug)
      .is('deleted_at', null)
      .maybeSingle();
    if (error) {
      console.error('[homepages.slugExists]', error);
      throw new AppError('SERVER_INTERNAL_ERROR');
    }
    return !!data;
  },

  async insertWithDefaultCategory(input: { user_id: string; slug: string; title?: string }): Promise<MiniHomepageRow> {
    const supabase = supabaseServer();
    const { data: hp, error: e1 } = await supabase
      .from('mini_homepages')
      .insert({
        user_id: input.user_id,
        slug: input.slug,
        title: input.title ?? '나의 미니홈피',
      })
      .select('*')
      .single();
    if (e1) {
      if ((e1 as { code?: string }).code === '23505') {
        throw new AppError('HOMEPAGE_SLUG_DUPLICATE');
      }
      console.error('[homepages.insert]', e1);
      throw new AppError('SERVER_INTERNAL_ERROR');
    }
    const row = hp as MiniHomepageRow;

    // 기본 카테고리 자동 생성
    const { error: e2 } = await supabase.from('album_categories').insert({
      user_id: input.user_id,
      homepage_id: row.id,
      name: '기본',
      is_default: true,
    });
    if (e2) {
      // 트랜잭션을 모방하기 위해 미니홈피 롤백
      await supabase.from('mini_homepages').delete().eq('id', row.id);
      console.error('[homepages.insertWithDefaultCategory:cat]', e2);
      throw new AppError('SERVER_INTERNAL_ERROR');
    }
    return row;
  },

  async updateProfile(
    userId: string,
    patch: Partial<Pick<MiniHomepageRow, 'title' | 'intro' | 'profile_image_url' | 'is_public' | 'slug'>>
  ): Promise<MiniHomepageRow> {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('mini_homepages')
      .update(patch)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .select('*')
      .single();
    if (error) {
      if ((error as { code?: string }).code === '23505') {
        throw new AppError('HOMEPAGE_SLUG_DUPLICATE');
      }
      console.error('[homepages.updateProfile]', error);
      throw new AppError('SERVER_INTERNAL_ERROR');
    }
    return data as MiniHomepageRow;
  },

  async updateDecorate(
    userId: string,
    patch: Partial<
      Pick<
        MiniHomepageRow,
        | 'background_color'
        | 'background_image_url'
        | 'use_background_image'
        | 'background_pattern'
        | 'background_pattern_color'
        | 'point_color'
        | 'text_color'
        | 'card_style'
        | 'font_style'
        | 'default_card_opacity'
        | 'default_font_size'
        | 'layout_mode'
      >
    > & { layout_slots?: LayoutSlot[]; layouts?: Layouts }
  ): Promise<MiniHomepageRow> {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from('mini_homepages')
      .update(patch)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .select('*')
      .single();
    if (error) {
      console.error('[homepages.updateDecorate]', error);
      throw new AppError('SERVER_INTERNAL_ERROR');
    }
    return data as MiniHomepageRow;
  },
};
