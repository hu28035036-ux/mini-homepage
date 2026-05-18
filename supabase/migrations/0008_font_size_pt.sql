-- v0.9: 카드 글자 크기를 enum(xs/sm/base/lg/xl) → pt 정수로 전환.
-- 기존 enum 값은 대응 pt로 변환(USING). 6테이블 화이트리스트 — mini_homepages 컬럼 타입만 변경.

alter table public.mini_homepages
  drop constraint if exists mini_homepages_default_font_size_check;

alter table public.mini_homepages
  alter column default_font_size drop default;

alter table public.mini_homepages
  alter column default_font_size type integer
  using (case default_font_size
    when 'xs' then 9
    when 'sm' then 11
    when 'base' then 12
    when 'lg' then 14
    when 'xl' then 16
    else 12 end);

alter table public.mini_homepages
  alter column default_font_size set default 12;

-- 형식 가드: 6~96pt
alter table public.mini_homepages
  add constraint mini_homepages_default_font_size_check
  check (default_font_size between 6 and 96);
