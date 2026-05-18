# mini-homepage (싸이월드 감성 미니홈피)

나만의 URL 보관함·앨범집·메모장을 자유 캔버스 위에서 내 취향대로 꾸미는 개인 미니홈피.

- **Next.js 15 App Router + TypeScript + Tailwind v4**
- **Supabase Postgres + Storage** (Auth는 사용하지 않음)
- **자체 회원가입**: bcryptjs + iron-session 쿠키
- 배포: Vercel — https://mini-homepage.vercel.app

## 주요 기능 (v0.9.1)

- **인증·미니홈피** — 이메일 회원가입/로그인, 미니홈피 자동 생성, 기본 비공개
- **기록** — URL 보관함 · 앨범집(카테고리·사진 업로드) · 메모장 CRUD
- **자유 캔버스 편집** — 카드를 드래그·리사이즈·z-index로 자유 배치(PC/태블릿).
  PC/모바일 레이아웃 분리, 캔버스 폭 1982px(왼쪽 카드 배치 여유 구역 포함).
  편집 진입은 햄버거 메뉴 → "편집"
- **카드 종류** — 프로필·URL·앨범·메모 + 텍스트 카드 + 그림판 카드. 카드 이름 편집
- **그림판 카드** — 펜 5종·도형 6종·지우개 2종·팔레트·굵기 슬라이더, PNG 저장
- **카테고리** — 카드/메모/URL/앨범 각각 카테고리로 분류. 카드별로 표시할 카테고리 선택
  (앨범 카드는 미지정 시 최근 업로드 카테고리)
- **꾸미기** — 배경색·이미지·무늬 8종, 카드 스타일 20종, 폰트 12종, 포인트/글자색
  (그라데이션 지원), 카드 투명도, 글자 크기(pt 직접 입력 + 프리셋)
- **공개 페이지** `/u/[slug]` — 공개 상태일 때만 외부 노출, 꾸미기·레이아웃 그대로 적용
- **PWA** — 홈 화면 추가, 앱 아이콘
- 제외(여전히): AI/챗봇, 댓글·좋아요·방명록·방문자수, 친구·팔로우, 태그·검색, 알림·결제

상세 설계는 [docs/00_MASTER_INDEX.md](docs/00_MASTER_INDEX.md), 기능 목록은
[docs/19_FEATURE_CATALOG.md](docs/19_FEATURE_CATALOG.md), 변경 이력은
[docs/09_CHANGELOG.md](docs/09_CHANGELOG.md) 참조.

---

## 빠른 시작 (5단계)

### 1) Supabase 프로젝트 만들기

1. https://supabase.com 에서 새 프로젝트 생성 (예: `mini-homepage-dev`).
2. **SQL Editor**에서 [`supabase/migrations/`](supabase/migrations/)의 `0001`~`0009`를 번호 순서대로 실행 (또는 Supabase CLI `supabase db push`).
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
3. `/admin/urls` 에서 URL 추가 (카테고리 분류 가능)
4. `/admin/albums` 에서 카테고리 추가 + 사진 업로드
5. `/admin/memos` 에서 메모 작성 (카테고리 분류 가능)
6. `/admin/decorate` 에서 배경·색·카드 스타일·폰트·글자크기(pt) 변경 → 미리보기 → 저장
7. `/admin` 홈에서 햄버거 메뉴 → "편집" → 자유 캔버스에서 카드 드래그·리사이즈·
   카테고리·표시 분류 설정 → "편집 끝"
8. `/admin/settings` 에서 공개 토글 ON
9. 시크릿 창에서 `/u/[slug]` 접속 → 정상 노출
10. 다시 비공개로 → 시크릿 창 새로고침 → 404 ("페이지를 볼 수 없어요")

---

## 폴더 구조 요약

자세한 내용은 [docs/01_ARCHITECTURE.md](docs/01_ARCHITECTURE.md) 참고.

```
src/
  app/
    login/page.tsx, signup/page.tsx   # 인증
    admin/                            # 관리자 페이지
      layout.tsx                      # 인증 가드 + 햄버거 메뉴
      page.tsx                        # 관리자 홈 (자유 캔버스 / 모바일 리스트)
      urls/page.tsx
      albums/page.tsx
      memos/page.tsx
      decorate/page.tsx               # 꾸미기 (색·카드·폰트·배경)
      settings/page.tsx
    u/[slug]/page.tsx                 # 공개 미니홈피
    api/...                           # Route Handler (cards/memos/urls categories 포함)
  components/
    ui/                               # Card, Button, Input...
    auth/, urls/, albums/, memos/, categories/,
    canvas/                           # FreeCanvas, CardHeader, DrawPad...
    decorate/, settings/, admin/, public/
  lib/
    auth/      # password, session, guards
    db/        # supabase-server
    storage/   # uploader, paths
    canvas/    # patterns
    repositories/   # users, homepages, urls, albumCategories, photos, memos
    services/       # auth, homepage, urls, albums, memos, decorate, publicView,
                    # cardCategories, memoCategories, urlCategories
    validators/     # zod 스키마
    errors/         # codes, response
    utils/          # slug
  types/db.ts
  styles/globals.css
supabase/migrations/0001~0009_*.sql
```

---

## 운영 명령어

```powershell
npm run dev        # 개발 서버 (포트 3000)
npm run build      # 프로덕션 빌드
npm run start      # 빌드 실행
npm run lint       # ESLint
npm run typecheck  # TypeScript 검사 (tsc --noEmit)
npx playwright test  # E2E (tests/e2e/ — Supabase 로컬 + Docker 필요)
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

- 비밀번호 재설정 흐름
- 휴지통 / 복구 UI (`deleted_at` 활용)
- Supabase Storage signed URL 모델로 강화
- 서버 사이드 세션 store(Redis)
- AI 기능 도입 (별도 Phase, `docs/ai/`)
