-- v0.7.x: 카드 스타일 확장 + 사용자 지정 카드 배경색
-- 스타일은 모양 프리셋(테두리/그림자/패턴), 배경색은 사용자가 자유 지정 가능 (nullable)

alter table public.mini_homepages
  drop constraint if exists mini_homepages_card_style_check;
alter table public.mini_homepages
  add constraint mini_homepages_card_style_check
  check (card_style in (
    'basic','rounded','shadow','transparent',
    'soft','bordered','glass','minimal','elevated','frame',
    'sticky','mint','pink','sky','notebook','grid-paper','dashed','double-border','ringed','bevel'
  ));

alter table public.mini_homepages
  add column if not exists card_background_color text;
