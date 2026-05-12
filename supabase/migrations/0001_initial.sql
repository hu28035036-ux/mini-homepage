-- 미니홈피 v1 초기 스키마.
-- docs/02_DATABASE_DESIGN.md 기준.
-- Supabase Dashboard → SQL Editor에 통째로 붙여넣거나, `npx supabase db push`로 적용.

-- 확장
create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
create table if not exists public.users (
  id              uuid primary key default gen_random_uuid(),
  email           citext not null,
  password_hash   text not null,
  nickname        text not null check (char_length(nickname) between 1 and 30),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);
create unique index if not exists idx_users_email_active
  on public.users(email) where deleted_at is null;

-- ---------------------------------------------------------------------------
-- mini_homepages
-- ---------------------------------------------------------------------------
create table if not exists public.mini_homepages (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references public.users(id) on delete restrict,
  slug                    citext not null check (slug ~ '^[a-zA-Z0-9-]{3,30}$'),
  title                   text not null default '나의 미니홈피',
  intro                   text,
  profile_image_url       text,
  background_color        text not null default '#fafafa',
  background_image_url    text,
  use_background_image    boolean not null default false,
  point_color             text not null default '#7c3aed',
  text_color              text not null default '#111827',
  card_style              text not null default 'basic'
    check (card_style in ('basic','rounded','shadow','transparent')),
  font_style              text not null default 'default'
    check (font_style in ('default','rounded','emotional')),
  layout_mode             text not null default 'single'
    check (layout_mode in ('single','double')),
  layout_slots            jsonb not null default '[
    {"slot":1,"widget":"profile","visible":true},
    {"slot":2,"widget":"urls","visible":true},
    {"slot":3,"widget":"albums","visible":true},
    {"slot":4,"widget":"memos","visible":true}
  ]'::jsonb,
  is_public               boolean not null default false,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now(),
  deleted_at              timestamptz
);
create unique index if not exists idx_homepage_slug_unique_active
  on public.mini_homepages(slug) where deleted_at is null;
create unique index if not exists idx_homepage_user_unique_active
  on public.mini_homepages(user_id) where deleted_at is null;

-- ---------------------------------------------------------------------------
-- urls
-- ---------------------------------------------------------------------------
create table if not exists public.urls (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete restrict,
  homepage_id     uuid not null references public.mini_homepages(id) on delete restrict,
  title           text not null check (char_length(title) between 1 and 100),
  url             text not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);
create index if not exists idx_urls_user_homepage_created
  on public.urls(user_id, homepage_id, created_at desc) where deleted_at is null;

-- ---------------------------------------------------------------------------
-- album_categories
-- ---------------------------------------------------------------------------
create table if not exists public.album_categories (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete restrict,
  homepage_id     uuid not null references public.mini_homepages(id) on delete restrict,
  name            text not null check (char_length(name) between 1 and 30),
  is_default      boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);
create unique index if not exists idx_album_category_unique_name
  on public.album_categories(homepage_id, name) where deleted_at is null;

-- ---------------------------------------------------------------------------
-- photos
-- ---------------------------------------------------------------------------
create table if not exists public.photos (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete restrict,
  homepage_id     uuid not null references public.mini_homepages(id) on delete restrict,
  category_id     uuid not null references public.album_categories(id) on delete restrict,
  image_url       text not null,
  caption         text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);
create index if not exists idx_photos_user_category_created
  on public.photos(user_id, category_id, created_at desc) where deleted_at is null;

-- ---------------------------------------------------------------------------
-- memos
-- ---------------------------------------------------------------------------
create table if not exists public.memos (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.users(id) on delete restrict,
  homepage_id     uuid not null references public.mini_homepages(id) on delete restrict,
  title           text not null check (char_length(title) between 1 and 100),
  content         text not null check (char_length(content) between 1 and 10000),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);
create index if not exists idx_memos_user_homepage_created
  on public.memos(user_id, homepage_id, created_at desc) where deleted_at is null;

-- ---------------------------------------------------------------------------
-- updated_at 자동 갱신 트리거
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare
  t text;
begin
  for t in select unnest(array['users','mini_homepages','urls','album_categories','photos','memos'])
  loop
    execute format('drop trigger if exists trg_%s_touch on public.%s;', t, t);
    execute format('create trigger trg_%s_touch before update on public.%s for each row execute function public.touch_updated_at();', t, t);
  end loop;
end$$;

-- ---------------------------------------------------------------------------
-- RLS
-- 본 프로젝트는 Supabase Auth를 사용하지 않고 서비스 롤 키로 접근한다.
-- RLS를 켜면 서비스 롤도 정책을 통과하지만, 추후 안전을 위해 켜두는 게 좋다.
-- 다만 v1은 비활성 상태로 둔다(애플리케이션 레이어가 모든 검증을 수행).
-- alter table public.users enable row level security;
-- ...
