-- v0.9: 메모·URL 카테고리. 신규 테이블 없이(6테이블 화이트리스트 준수)
-- mini_homepages JSONB 배열 + 기존 memos/urls 테이블 category_id 컬럼으로 구현.
-- 카드 카테고리(card_categories, 마이그 0007)와 동일 패턴.

alter table public.mini_homepages
  add column if not exists memo_categories jsonb not null default '[]'::jsonb;
alter table public.mini_homepages
  add column if not exists url_categories jsonb not null default '[]'::jsonb;

-- 형식 가드: 항상 JSON 배열
alter table public.mini_homepages
  drop constraint if exists mini_homepages_memo_categories_check;
alter table public.mini_homepages
  add constraint mini_homepages_memo_categories_check
  check (jsonb_typeof(memo_categories) = 'array');
alter table public.mini_homepages
  drop constraint if exists mini_homepages_url_categories_check;
alter table public.mini_homepages
  add constraint mini_homepages_url_categories_check
  check (jsonb_typeof(url_categories) = 'array');

-- 메모·URL 항목별 카테고리 참조 (mini_homepages.*_categories[].id). 느슨한 참조 — FK 없음.
alter table public.memos
  add column if not exists category_id text;
alter table public.urls
  add column if not exists category_id text;
