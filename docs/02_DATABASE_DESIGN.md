---
상태: Approved
버전: v0.1
마지막 수정일: 2026-05-12
문서 목적: 설계 기준 / DB 구조 (단일 소스)
---

# DB 설계문서

본 문서는 Supabase Postgres 기준 본 미니홈피 서비스의 테이블/컬럼/관계/인덱스/제약/RLS 정책을 정의한다. **테이블 정의의 단일 소스(SoT)** 이므로 다른 문서는 본 문서를 참조만 한다.

## 1. 테이블 목록

| 테이블 | 역할 |
|---|---|
| `users` | 자체 회원가입 사용자 계정 (이메일/비밀번호 해시/닉네임) |
| `mini_homepages` | 사용자별 미니홈피(고유 slug, 공개여부, 꾸미기 설정, 레이아웃) |
| `urls` | URL 보관함 항목 |
| `album_categories` | 앨범 카테고리 |
| `photos` | 카테고리에 속한 사진 |
| `memos` | 메모 |

모든 테이블에는 `id`, `created_at`, `updated_at`, `deleted_at`이 있다. 사용자 데이터 테이블에는 추가로 `user_id`가 있다.

## 2. 공통 컬럼 규칙

- `id uuid primary key default gen_random_uuid()`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()` — 업데이트 트리거로 자동 갱신
- `deleted_at timestamptz null` — 소프트 삭제. 일반 조회에서는 항상 `deleted_at IS NULL` 부착.
- `user_id uuid not null references users(id)` — 사용자 데이터 테이블에 강제

## 3. 테이블별 정의

### 3-1. `users`

| 컬럼 | 타입 | 제약 | 비고 |
|---|---|---|---|
| `id` | uuid | pk default gen_random_uuid() | |
| `email` | citext | not null, unique(부분: where deleted_at is null) | 대소문자 무시 |
| `password_hash` | text | not null | bcrypt 결과(cost 12 권장). 평문 저장 금지 |
| `nickname` | text | not null | 길이 1~30 |
| `created_at`, `updated_at`, `deleted_at` | timestamptz | | |

인덱스:
- `create unique index idx_users_email_active on users(email) where deleted_at is null;`

소프트 삭제 후 동일 이메일 재가입: v1에서는 허용하지 않는다. 탈퇴는 v1에 없음(추후 별도 Phase).

### 3-2. `mini_homepages`

한 사용자당 1개. 미니홈피 생성 시 같은 트랜잭션에서 기본 앨범 카테고리도 생성된다.

| 컬럼 | 타입 | 제약 | 기본값/비고 |
|---|---|---|---|
| `id` | uuid | pk | |
| `user_id` | uuid | not null, fk users(id) | |
| `slug` | citext | not null, unique(부분: where deleted_at is null) | 영문/숫자/하이픈, 길이 3~30 |
| `title` | text | not null | 기본값 "나의 미니홈피" |
| `intro` | text | nullable | 한 줄 소개 |
| `profile_image_url` | text | nullable | Supabase Storage 경로 또는 외부 URL |
| `background_color` | text | not null default '#fafafa' | HEX |
| `background_image_url` | text | nullable | Supabase Storage 경로 |
| `use_background_image` | bool | not null default false | |
| `point_color` | text | not null default '#7c3aed' | HEX |
| `text_color` | text | not null default '#111827' | HEX |
| `card_style` | text | check in ('basic','rounded','shadow','transparent') default 'basic' | |
| `font_style` | text | check in ('default','rounded','emotional') default 'default' | |
| `layout_mode` | text | check in ('single','double') default 'single' | 모바일에서는 항상 single로 폴백(렌더 시 처리) |
| `layout_slots` | jsonb | not null default `[{slot:1,widget:profile,visible:true},{slot:2,widget:urls,visible:true},{slot:3,widget:albums,visible:true},{slot:4,widget:memos,visible:true}]` | 아래 §4 검증 규칙 |
| `is_public` | bool | not null default false | **변경 금지: 기본값 false** |
| `created_at`, `updated_at`, `deleted_at` | timestamptz | | |

인덱스:
- `create unique index idx_homepage_slug_public on mini_homepages(slug) where deleted_at is null;`
- `create unique index idx_homepage_user on mini_homepages(user_id) where deleted_at is null;`

### 3-3. `urls`

| 컬럼 | 타입 | 제약 | 비고 |
|---|---|---|---|
| `id` | uuid | pk | |
| `user_id` | uuid | not null, fk users(id) | |
| `homepage_id` | uuid | not null, fk mini_homepages(id) | |
| `title` | text | not null | 길이 1~100 |
| `url` | text | not null | http(s):// 형식 검증은 service에서 |
| `created_at`, `updated_at`, `deleted_at` | timestamptz | | |

인덱스:
- `create index idx_urls_user_homepage_created on urls(user_id, homepage_id, created_at desc) where deleted_at is null;`

### 3-4. `album_categories`

| 컬럼 | 타입 | 제약 | 비고 |
|---|---|---|---|
| `id` | uuid | pk | |
| `user_id` | uuid | not null, fk users(id) | |
| `homepage_id` | uuid | not null, fk mini_homepages(id) | |
| `name` | text | not null | 길이 1~30 |
| `is_default` | bool | not null default false | 기본 카테고리 여부(자동 생성 시 true) |
| `created_at`, `updated_at`, `deleted_at` | timestamptz | | |

인덱스:
- `create unique index idx_album_category_unique_name on album_categories(homepage_id, name) where deleted_at is null;`

기본 카테고리 자동 생성: 미니홈피 생성 트랜잭션에서 `name='기본', is_default=true`로 1행 insert.

### 3-5. `photos`

| 컬럼 | 타입 | 제약 | 비고 |
|---|---|---|---|
| `id` | uuid | pk | |
| `user_id` | uuid | not null, fk users(id) | |
| `homepage_id` | uuid | not null, fk mini_homepages(id) | |
| `category_id` | uuid | not null, fk album_categories(id) | |
| `image_url` | text | not null | Supabase Storage 경로 |
| `caption` | text | nullable | 사진 설명(선택) |
| `created_at`, `updated_at`, `deleted_at` | timestamptz | | |

인덱스:
- `create index idx_photos_user_category_created on photos(user_id, category_id, created_at desc) where deleted_at is null;`

### 3-6. `memos`

| 컬럼 | 타입 | 제약 | 비고 |
|---|---|---|---|
| `id` | uuid | pk | |
| `user_id` | uuid | not null, fk users(id) | |
| `homepage_id` | uuid | not null, fk mini_homepages(id) | |
| `title` | text | not null | 길이 1~100 |
| `content` | text | not null | 길이 1~10000 |
| `created_at`, `updated_at`, `deleted_at` | timestamptz | | |

인덱스:
- `create index idx_memos_user_homepage_created on memos(user_id, homepage_id, created_at desc) where deleted_at is null;`

## 4. `mini_homepages.layout_slots` 검증 규칙 (단일 소스)

레이아웃 데이터 모델은 본 절에만 정의한다. 다른 문서는 본 절을 참조한다.

```ts
type LayoutMode = 'single' | 'double';
type WidgetKind = 'profile' | 'urls' | 'albums' | 'memos' | 'empty';

interface LayoutSlot {
  slot: number;            // 1~4 (single) or 1~6 (double)
  widget: WidgetKind;
  visible: boolean;
}
```

서버 검증(`lib/validators/decorate.ts` 및 `services/decorate.ts`):

1. `layout_mode`는 `'single'` 또는 `'double'` 중 하나.
2. `layout_slots` 길이는 mode에 따라 정확히 4 또는 6.
3. `slot` 값은 1부터 mode별 슬롯 수까지의 정수, 중복 금지.
4. `widget`은 enum 5개 중 하나.
5. `empty`를 제외한 위젯은 슬롯 전체에서 **2회 이상 등장 금지**.
6. `visible`은 boolean.
7. 위 어느 규칙 위반 시 각각 `LAYOUT_INVALID_MODE`, `LAYOUT_INVALID_SLOT`, `LAYOUT_WIDGET_UNKNOWN`, `LAYOUT_WIDGET_DUPLICATED` 반환.

기본값(미니홈피 생성 시 자동 적용):

```json
[
  {"slot":1,"widget":"profile","visible":true},
  {"slot":2,"widget":"urls","visible":true},
  {"slot":3,"widget":"albums","visible":true},
  {"slot":4,"widget":"memos","visible":true}
]
```

공개 페이지 렌더링 규칙:
- `visible=false` 또는 `widget='empty'`인 슬롯은 출력하지 않는다.
- 모바일(viewport < md)에서는 `layout_mode` 무시하고 single 1단으로 폴백.

## 5. 마이그레이션 원칙

- 기존 데이터 손상 금지. 컬럼 삭제 전 반드시 백업.
- 새 컬럼 추가 시 nullable 또는 기본값 지정.
- 운영 DB와 개발 DB 스키마 차이를 PR마다 확인.
- 마이그레이션 파일 위치: `supabase/migrations/{yyyymmddHHMMSS}_{name}.sql` (Phase 2부터 생성).

## 6. RLS 정책

본 프로젝트는 Supabase Auth를 사용하지 않고 자체 인증을 쓰므로, 서버는 **서비스 롤 키**로 Supabase에 접속하며 RLS는 v1 기본 비활성화한다. **모든 접근 제어는 애플리케이션 레이어(repository)에서 강제한다**.

추후 RLS 도입 시 다음 정책을 적용한다(설계 메모):
- 모든 사용자 데이터 테이블에 `user_id = auth.uid()` SELECT/INSERT/UPDATE/DELETE 정책.
- `mini_homepages`에 `visibility='public'` SELECT 익명 허용 정책(별도 시그니처). v1 구조와 충돌 없도록 변경 영역은 `is_public` 그대로 활용.

**보안 핵심: Supabase 서비스 롤 키는 서버 환경변수에만 두고 클라이언트로 절대 노출 금지.** `next.config.mjs`의 `NEXT_PUBLIC_*` 접두사 사용을 금지한다.

## 7. DB 검증 기준

- [ ] 모든 테이블에 `user_id`(users 제외)와 `deleted_at`이 있는가?
- [ ] 모든 인덱스가 `where deleted_at is null` 부분 인덱스로 작성되었는가?
- [ ] `mini_homepages.is_public` 기본값이 `false`인가?
- [ ] `mini_homepages.slug` 부분 unique 인덱스가 `deleted_at is null` 조건을 포함하는가?
- [ ] `layout_slots` 기본값이 §4의 4슬롯 기본 배치를 반환하는가?
- [ ] repository 레이어가 모든 쿼리에 `user_id`와 `deleted_at is null` 조건을 부착하는가?
- [ ] 미니홈피 생성 트랜잭션이 기본 앨범 카테고리(name='기본', is_default=true) 자동 생성을 수행하는가?
- [ ] 비밀번호가 bcrypt 해시로 저장되는가? 평문 저장이 없는가?
- [ ] 외부 키 onDelete가 명시되어 있는가(기본: `on delete restrict`)?
