-- v1.x: 카드 카테고리 — 미니홈피별 카테고리 목록을 JSONB 배열로 보관.
-- 신규 테이블 없이 mini_homepages 컬럼만 확장 (6테이블 화이트리스트 준수).
-- 각 카드(Block)는 layouts JSONB 안의 categoryId 로 이 목록의 id 를 참조.

alter table public.mini_homepages
  add column if not exists card_categories jsonb not null default '[]'::jsonb;

-- 형식 가드: 항상 JSON 배열
alter table public.mini_homepages
  drop constraint if exists mini_homepages_card_categories_check;
alter table public.mini_homepages
  add constraint mini_homepages_card_categories_check
  check (jsonb_typeof(card_categories) = 'array');
