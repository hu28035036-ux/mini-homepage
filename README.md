# mini-homepage (싸이월드 스타일 미니홈피 v1 MVP)

나만의 URL 보관함·앨범집·메모장을 가지고 내 취향대로 꾸미는 개인 미니홈피.

- **Next.js 15 App Router + TypeScript + Tailwind v4**
- **Supabase Postgres + Storage** (Auth는 사용하지 않음)
- **자체 회원가입**: bcryptjs + iron-session 쿠키
- v1 범위: 회원가입/로그인, 미니홈피 자동 생성, URL/앨범/메모 CRUD, 꾸미기(색/배경/카드/폰트 + 레이아웃·슬롯), 공개/비공개, `/u/[slug]` 공개 페이지
- v1 제외: AI, 댓글, 좋아요, 방명록, 방문자수, 드래그앤드롭, 태그, 검색

상세 설계는 [docs/00_MASTER_INDEX.md](docs/00_MASTER_INDEX.md) 참조.

---

## 빠른 시작 (5단계)

### 1) Supabase 프로젝트 만들기

1. https://supabase.com 에서 새 프로젝트 생성 (예: `mini-homepage-dev`).
2. **SQL Editor**에서 [`supabase/migrations/0001_initial.sql`](supabase/migrations/0001_initial.sql) 내용을 통째로 복사해서 실행.
3. **Storage**에서 `user-uploads` 버킷 생성:
   - Public bucket: **ON**
   - File size limit: 10 MB (또는 더 크게)
4. **Project Settings → API**에서 다음 값 복사:
   - `Project URL` (https://xxxxx.supabase.co)
   - `service_role` 비밀 키 (절대 클라이언트 노출 금지)

### 2) 환경변수 설정

`.env.local.example`을 `.env.local`로 복사하고 값을 채운다:

```bash
SUPABASE_URL=https://<your-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...                     # service_role 비밀 키
SUPABASE_STORAGE_BUCKET=user-uploads

NEXT_PUBLIC_SUPABASE_URL=https://<your-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET=user-uploads

# 32자 이상의 랜덤 문자열 (PowerShell에서 생성: -join ((1..40)|%{[char](Get-Random -Min 33 -Max 126)}))
SESSION_SECRET=please-replace-with-32+-chars-random-string
SESSION_COOKIE_NAME=mh_session
```

### 3) 의존성 설치

```powershell
npm install
```

### 4) 개발 서버 실행

```powershell
npm run dev
```

→ http://localhost:3000 접속.

### 5) 한 사이클 시나리오 점검

1. `/signup` → 가입
2. `/login` → 로그인 → `/admin` 자동 진입, 미니홈피 자동 생성
3. `/admin/urls` 에서 URL 추가
4. `/admin/albums` 에서 카테고리 추가 + 사진 업로드
5. `/admin/memos` 에서 메모 작성
6. `/admin/decorate` 에서 색/카드/폰트/배경 + 레이아웃·슬롯 변경 → 미리보기 확인 → 저장
7. `/admin/settings` 에서 공개 토글 ON
8. 시크릿 창에서 `/u/[slug]` 접속 → 정상 노출
9. 다시 비공개로 → 시크릿 창 새로고침 → 404 ("페이지를 볼 수 없어요")

---

## 폴더 구조 요약

자세한 내용은 [docs/01_ARCHITECTURE.md](docs/01_ARCHITECTURE.md) 참고.

```
src/
  app/
    (login|signup)/page.tsx           # 인증
    admin/                            # 관리자 페이지
      layout.tsx                      # 인증 가드 + 사이드바
      page.tsx                        # 관리자 홈
      urls/page.tsx
      albums/page.tsx
      memos/page.tsx
      decorate/page.tsx               # 꾸미기 (핵심)
      settings/page.tsx
    u/[slug]/page.tsx                 # 공개 미니홈피
    api/...                           # Route Handler
  components/
    ui/                               # Card, Button, Input...
    auth/, urls/, albums/, memos/,
    decorate/, settings/, admin/, public/
  lib/
    auth/      # password, session, guards
    db/        # supabase-server
    storage/   # uploader, paths
    repositories/   # users, homepages, urls, albumCategories, photos, memos
    services/       # auth, homepage, urls, albums, memos, decorate, publicView
    validators/     # zod 스키마
    errors/         # codes, response
    utils/          # slug
  types/db.ts
  styles/globals.css
supabase/migrations/0001_initial.sql
```

---

## 운영 명령어

```powershell
npm run dev        # 개발 서버 (포트 3000)
npm run build      # 프로덕션 빌드
npm run start      # 빌드 실행
npm run lint       # ESLint
npm run typecheck  # TypeScript 검사 (tsc --noEmit)
```

---

## 보안 핵심 규칙

코드 수정 전에 [docs/harness/05_SECURITY_PRIVACY_HARNESS.md](docs/harness/05_SECURITY_PRIVACY_HARNESS.md) 일독 권장.

- `SUPABASE_SERVICE_ROLE_KEY`는 **절대 클라이언트로 노출 금지** (`NEXT_PUBLIC_*` 접두사 금지).
- `mini_homepages.is_public` 기본값은 항상 `false`.
- 모든 repository 쿼리는 `where user_id = $session_user AND deleted_at IS NULL`을 자동 부착.
- 비공개 미니홈피와 미존재 slug는 동일한 404 응답으로 통일.
- 응답은 `lib/errors/response.ts`의 `ok()` / `fail()` / `handle()`로만 생성.

---

## 다음 단계 (v1.x / v2)

- `tests/` 추가 (Vitest + Playwright)
- 비밀번호 재설정 흐름
- 휴지통 / 복구 UI
- Supabase Storage signed URL 모델로 강화
- RLS 도입 (필요 시)
- AI 기능 도입 (별도 Phase, `docs/ai/`)
