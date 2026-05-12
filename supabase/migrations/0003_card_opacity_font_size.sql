-- v0.6: 카드 투명도/폰트 크기 전역 기본값
-- 카드별 오버라이드는 layouts jsonb 안의 Block.opacity / Block.fontSize 에 담는다.

alter table public.mini_homepages
  add column if not exists default_card_opacity numeric not null default 1;

alter table public.mini_homepages
  drop constraint if exists mini_homepages_default_card_opacity_check;
alter table public.mini_homepages
  add constraint mini_homepages_default_card_opacity_check
  check (default_card_opacity >= 0 and default_card_opacity <= 1);

alter table public.mini_homepages
  add column if not exists default_font_size text not null default 'base';

alter table public.mini_homepages
  drop constraint if exists mini_homepages_default_font_size_check;
alter table public.mini_homepages
  add constraint mini_homepages_default_font_size_check
  check (default_font_size in ('xs','sm','base','lg','xl'));
