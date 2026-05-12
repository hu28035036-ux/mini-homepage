---
상태: Approved
버전: v0.1
마지막 수정일: 2026-05-12
문서 목적: 설계 기준 / 전체 아키텍처 + 폴더 구조
---

# 전체 설계문서 (Architecture)

이 문서는 본 미니홈피 서비스의 전체 구조, 모듈화 원칙, 데이터 흐름, 폴더 구조를 정의한다. Ralph Loop v7.1 §6 표준을 따른다.

## 1. 전체 구조

| 영역 | 구성 |
|---|---|
| 프론트엔드 | Next.js App Router (TypeScript). 서버 컴포넌트 우선 + 필요한 곳만 클라이언트 컴포넌트 (`'use client'`). Tailwind CSS. |
| 백엔드 | Next.js Route Handler (`src/app/api/**`). 비즈니스 로직은 `lib/services/`, DB 호출은 `lib/repositories/`로 분리. |
| DB | Supabase Postgres. 마이그레이션은 `supabase/migrations/` (현재 미생성, Phase 2부터). |
| 이미지 저장 | Supabase Storage. 단일 버킷 `user-uploads`, 경로는 `{user_id}/{kind}/{uuid.ext}`. |
| 인증/세션 | **자체 회원가입 시스템**(이메일 + 비밀번호). bcrypt 해시 + HttpOnly+Secure 쿠키 세션(iron-session 또는 jose JWT, Phase 2에서 확정). **Supabase Auth는 사용하지 않는다**. |
| 권한 | 모든 API에서 세션 사용자 `user_id` 검증 → 자원 소유자 일치 검증 → 비즈니스 검증. Supabase 서비스 롤 키는 서버에서만 사용. |
| 배포 | Vercel + Supabase (개발/운영 프로젝트 분리). 환경변수는 `docs/13_ENVIRONMENT_SETUP.md`에 정의. |

## 2. 모듈화 원칙 (요약, 상세는 `docs/17_MODULEIZATION_GUIDE.md`)

- 한 파일은 하나의 주요 역할만 담당한다.
- UI / API 라우터 / service / repository / validator / schema / util / test를 디렉터리 수준에서 분리한다.
- 비즈니스 로직은 페이지/컴포넌트에 직접 두지 않고 `lib/services/`에 둔다.
- DB 호출은 `lib/repositories/`만 수행하고, `where user_id = $session_user` 와 `deleted_at IS NULL` 을 강제 부착한다.
- 응답(성공/실패)은 `lib/errors/response.ts`만 생성한다(`docs/18_ERROR_CODE_RESPONSE_STANDARD.md` 공통 포맷 단일 적용).

## 3. 데이터 흐름

```text
사용자 입력 (브라우저)
→ 클라이언트 컴포넌트(폼) → 서버 액션 또는 fetch
→ Route Handler (src/app/api/**/route.ts)
→ zod 검증 (lib/validators/)
→ service (lib/services/) — 세션 사용자 확보, 권한/비즈니스 검증
→ repository (lib/repositories/) — Supabase 호출, user_id + deleted_at 자동 부착
→ Supabase Postgres / Storage
→ 결과 정규화 → lib/errors/response.ts → JSON 응답
→ 클라이언트 렌더 (또는 서버 컴포넌트 재렌더)
```

공개 페이지 `/u/[slug]` 흐름은 별도이다.

```text
GET /u/[slug] (외부 익명 요청)
→ services/publicView.loadBySlug(slug)
   ├─ repositories/homepages.findPublicBySlug(slug)
   │     WHERE slug = $1 AND is_public = true AND deleted_at IS NULL
   ├─ 못 찾으면 → notFound() (Next.js 404)
   └─ 찾으면 → 관련 urls/album_categories/photos/memos를 owner의 user_id로 조회
→ 렌더링: 저장된 layout_mode + layout_slots 기준으로 위젯 배치
```

**중요: 공개 페이지 데이터는 `/api/public/[slug]` 또는 서버 컴포넌트에서만 로드한다. 클라이언트가 비공개 상태에서 데이터를 받아 숨기는 방식은 금지.**

## 4. 변경 금지 영역

- `users.id`, `mini_homepages.id`, `mini_homepages.slug` 컬럼 시그니처
- 공개 URL 스킴 `/u/[slug]`
- 응답 포맷(`{ success, data | error_code, message, details }`)
- `is_public` 기본값 `false`
- 모든 주요 테이블의 `user_id` 컬럼 존재
- 소프트 삭제(`deleted_at`) 컬럼 존재 및 조회 시 `deleted_at IS NULL` 필터

변경이 필요하면 코드가 아니라 `docs/12_DESIGN_CHANGE_REQUESTS.md`에 제안만 기록.

## 5. 확장 고려사항

- **이미지 저장소 어댑터**: `lib/storage/`는 Supabase Storage 어댑터로 시작하되, 인터페이스(`upload`, `delete`, `signedUrl`)를 두어 추후 S3/R2 교체 가능.
- **휴지통/복구**: `deleted_at` 인덱스를 유지하여 추후 휴지통 UI 추가 시 재인덱싱 비용 없이 사용.
- **레이아웃 위젯 추가**: 새 위젯(예: `bookmarks`) 추가 시 `mini_homepages.layout_slots`의 widget enum과 `components/public/`의 위젯 컴포넌트만 확장한다. DB 마이그레이션은 enum check 제약만 갱신.
- **AI 도입**: 별도 Phase로 `docs/ai/` 추가. RAG 인덱싱은 별도 테이블·서비스 분리.

## 6. 폴더 구조

```text
홈페이지제작/
├── docs/                              # 본 문서 세트 (Phase 0 산출물)
├── .claude/                           # Claude Code 설정, Skill, 명령
├── phases/                            # 실행형 Phase/Step 하네스
├── public/                            # Next.js 정적 자원
├── supabase/                          # Phase 2부터 생성
│   └── migrations/                    # SQL 마이그레이션
├── src/                               # Phase 1부터 생성
│   ├── app/
│   │   ├── layout.tsx                 # 루트 레이아웃 (Tailwind base)
│   │   ├── page.tsx                   # 랜딩 (로그인 안 한 경우 /login으로)
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── signup/page.tsx
│   │   ├── (admin)/
│   │   │   ├── layout.tsx             # 관리자 공통 메뉴 + 인증 가드
│   │   │   ├── page.tsx               # 관리자 홈
│   │   │   ├── urls/page.tsx
│   │   │   ├── albums/page.tsx
│   │   │   ├── memos/page.tsx
│   │   │   ├── decorate/page.tsx      # 꾸미기 탭
│   │   │   └── settings/page.tsx
│   │   ├── u/
│   │   │   └── [slug]/page.tsx        # 공개 미니홈피
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── signup/route.ts
│   │       │   ├── login/route.ts
│   │       │   └── logout/route.ts
│   │       ├── homepage/route.ts
│   │       ├── urls/route.ts
│   │       ├── urls/[id]/route.ts
│   │       ├── albums/
│   │       │   ├── categories/route.ts
│   │       │   ├── categories/[id]/route.ts
│   │       │   ├── photos/route.ts
│   │       │   └── photos/[id]/route.ts
│   │       ├── memos/route.ts
│   │       ├── memos/[id]/route.ts
│   │       ├── decorate/route.ts
│   │       └── public/[slug]/route.ts
│   ├── components/
│   │   ├── ui/                        # Card, Button, Input, Modal, Spinner
│   │   ├── home/                      # ProfileCard, RecentList
│   │   ├── urls/                      # UrlForm, UrlList, UrlItem
│   │   ├── albums/                    # CategoryList, PhotoGrid, PhotoUploader
│   │   ├── memos/                     # MemoForm, MemoList, MemoItem
│   │   ├── decorate/                  # ColorPicker, ImageUploader,
│   │   │                              # CardStyleSelector, FontSelector,
│   │   │                              # LayoutModeSelector, SlotEditor,
│   │   │                              # PreviewBoard
│   │   └── public/                    # PublicHeader, PublicHome,
│   │                                  # PrivateNotice, WidgetRenderer
│   ├── lib/
│   │   ├── auth/                      # session.ts, password.ts, guards.ts
│   │   ├── db/                        # supabase-server.ts, supabase-public.ts
│   │   ├── storage/                   # uploader.ts, paths.ts (Supabase Storage 어댑터)
│   │   ├── repositories/              # users, homepages, urls,
│   │   │                              # albumCategories, photos, memos
│   │   ├── services/                  # auth, homepage, urls, albums,
│   │   │                              # memos, decorate, publicView
│   │   ├── validators/                # zod 스키마: auth, urls, albums,
│   │   │                              # memos, decorate
│   │   ├── errors/                    # codes.ts (§18 enum), response.ts
│   │   └── utils/                     # slug.ts, date.ts, image.ts
│   ├── styles/
│   │   └── globals.css                # Tailwind base + 디자인 토큰
│   └── types/
│       ├── db.ts                      # supabase-js 생성 또는 수기 정의
│       ├── api.ts                     # 요청/응답 타입
│       └── decorate.ts                # LayoutMode, LayoutSlot 타입
├── tests/                             # Phase 7부터 본격 보강
│   ├── unit/
│   ├── api/
│   └── ui/
├── package.json                       # Phase 1
├── tsconfig.json                      # Phase 1
├── next.config.mjs                    # Phase 1
├── tailwind.config.ts                 # Phase 1
├── postcss.config.mjs                 # Phase 1
└── .env.local.example                 # Phase 1
```

본 작업(Phase 0)에서는 `docs/`, `.claude/`, `phases/`만 생성한다. `src/`, `supabase/`, `tests/`, 설정 파일은 Phase 1부터 생성한다.

## Architecture 전용 하네스

- [ ] 전체 구조가 위 표와 일치하는가?
- [ ] UI / API 라우터 / service / repository / validator / schema / util / test가 디렉터리로 분리되어 있는가?
- [ ] 큰 파일 하나에 기능을 몰아넣지 않았는가?
- [ ] 비즈니스 로직이 페이지/컴포넌트에 직접 박혀 있지 않는가?
- [ ] repository가 `user_id`와 `deleted_at IS NULL`을 자동 부착하는가?
- [ ] 공개 페이지가 서버에서 `is_public AND deleted_at IS NULL`을 검증하고 있는가?
- [ ] 변경 금지 영역(§4)을 임의로 변경하지 않았는가?
- [ ] 새 기능을 적절한 디렉터리에 추가했는가?
