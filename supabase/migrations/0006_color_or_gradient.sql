-- v0.7.x: 모든 색상 컬럼이 단색(#hex) 또는 그라데이션(linear-gradient/radial-gradient 문자열)을 허용하도록 hex 제약 풀기.
-- (기존 hex 제약은 0001에 없거나 client zod만 검사했으므로 컬럼 자체엔 변경 없음.
--  단 사용 가능한 길이 제한을 위해 length check만 명시.)

alter table public.mini_homepages
  drop constraint if exists mini_homepages_background_color_check;
alter table public.mini_homepages
  add constraint mini_homepages_background_color_check
  check (length(background_color) between 1 and 500);

alter table public.mini_homepages
  drop constraint if exists mini_homepages_point_color_check;
alter table public.mini_homepages
  add constraint mini_homepages_point_color_check
  check (length(point_color) between 1 and 500);

alter table public.mini_homepages
  drop constraint if exists mini_homepages_text_color_check;
alter table public.mini_homepages
  add constraint mini_homepages_text_color_check
  check (length(text_color) between 1 and 500);

alter table public.mini_homepages
  drop constraint if exists mini_homepages_background_pattern_color_check;
alter table public.mini_homepages
  add constraint mini_homepages_background_pattern_color_check
  check (length(background_pattern_color) between 1 and 500);
