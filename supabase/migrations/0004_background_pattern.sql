-- v0.7.x: 배경 무늬(패턴) + 패턴 색상
-- 정해진 패턴 N종 중 선택. 색상은 사용자가 지정 가능.
-- 업로드 이미지가 있으면 이미지가 우선, 없으면 배경색 위에 패턴 overlay.

alter table public.mini_homepages
  add column if not exists background_pattern text not null default 'none';

alter table public.mini_homepages
  drop constraint if exists mini_homepages_background_pattern_check;
alter table public.mini_homepages
  add constraint mini_homepages_background_pattern_check
  check (background_pattern in (
    'none','dots','grid','diagonal','stripes','checker','crosshatch','waves','triangles'
  ));

alter table public.mini_homepages
  add column if not exists background_pattern_color text not null default '#00000022';
