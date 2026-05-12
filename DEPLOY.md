# Vercel 배포 가이드

이 가이드는 본 미니홈피 v1을 Vercel + 운영용 Supabase 프로젝트로 배포하는 단계입니다.

`.env.local`은 로컬 개발(Supabase Local) 전용이며, **운영에는 별도 Supabase 프로젝트와 별도 SESSION_SECRET이 필요**합니다.

---

## 1단계 — 운영용 Supabase 프로젝트 생성

1. https://supabase.com 에 로그인 → **New project**.
2. 프로젝트 이름: `mini-homepage-prod` (자유), 리전: 사용자와 가까운 곳 (예: Northeast Asia / Seoul).
3. 강력한 DB 비밀번호 생성 후 보관.
4. 프로젝트 생성 완료까지 1~2분 대기.

## 2단계 — 마이그레이션 적용

운영 프로젝트 SQL Editor에서 [`supabase/migrations/0001_initial.sql`](supabase/migrations/0001_initial.sql) 전체를 붙여넣고 **Run**.

성공 메시지: `CREATE EXTENSION` × 2, `CREATE TABLE` × 6, `CREATE INDEX` × 다수, `CREATE FUNCTION`, `DO` 블록.

## 3단계 — Storage 버킷 생성

**Storage** 탭 → **New bucket**:
- Name: `user-uploads`
- Public bucket: **ON**
- File size limit: **10 MB**
- Allowed MIME types: 비워두면 모두 허용 (코드 레벨에서 `image/*`만 검증)

## 4단계 — Supabase API 키 복사

**Project Settings → API**에서 다음 3개를 복사:

| 이름 | 어디 쓰는지 | 노출 안전 여부 |
|---|---|---|
| Project URL | `SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL` | ✅ Public |
| service_role 비밀 키 (legacy JWT) | `SUPABASE_SERVICE_ROLE_KEY` | ❌ **서버 전용 — 절대 NEXT_PUBLIC_ 안 됨** |

> 신규 Supabase 프로젝트는 `sb_secret_*` / `sb_publishable_*` 형식의 새 키와 함께 **Legacy JWT**도 같이 발급합니다. 본 코드는 Storage REST API 호환을 위해 **Legacy JWT service_role 키**를 사용합니다.

## 5단계 — SESSION_SECRET 생성

운영용은 로컬과 달라야 합니다. 32자 이상의 강한 랜덤 문자열:

```powershell
# PowerShell
-join ((1..48) | ForEach-Object { [char](Get-Random -Min 33 -Max 126) })

# 또는 Node
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## 6단계 — Vercel 프로젝트 생성

### 방법 A: GitHub 연동 (권장)

1. `git init` → 첫 커밋 → GitHub 비공개 레포로 push.
2. Vercel Dashboard → **Add New → Project** → GitHub 레포 import.
3. Framework Preset: `Next.js` (자동 감지).
4. Root Directory: 기본값 (레포 루트).

### 방법 B: Vercel CLI 로 직접 업로드

```powershell
npm i -g vercel
vercel login
vercel
# 첫 실행 시 대화형 셋업 — 프로젝트 이름, 팀 선택
vercel --prod  # 운영 배포
```

## 7단계 — Vercel 환경변수 등록

Vercel Project → **Settings → Environment Variables**에서 **Production** 환경으로 추가:

| Name | Value | Environment |
|---|---|---|
| `SUPABASE_URL` | `https://<your-ref>.supabase.co` | Production |
| `SUPABASE_SERVICE_ROLE_KEY` | (4단계 service_role JWT) | Production |
| `SUPABASE_STORAGE_BUCKET` | `user-uploads` | Production |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<your-ref>.supabase.co` | Production |
| `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET` | `user-uploads` | Production |
| `SESSION_SECRET` | (5단계 생성한 랜덤 문자열) | Production |
| `SESSION_COOKIE_NAME` | `mh_session` | Production |

각 항목 추가 시 **Encrypted**가 자동 적용됩니다(`SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET` 특히 중요).

> **금지**: `NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY`나 `NEXT_PUBLIC_SESSION_SECRET` 같은 이름 절대 사용 금지. 클라이언트 번들에 박혀버립니다.

Preview/Development 환경에도 동일 키를 추가하려면 별도 운영 외 Supabase 프로젝트를 권장합니다 (실 데이터 보호).

## 8단계 — 첫 배포 + 검증

- 방법 A: GitHub에 push → Vercel 자동 빌드.
- 방법 B: `vercel --prod`.

빌드 성공 후 운영 URL (예: `mini-homepage.vercel.app`)에서:

1. `/signup` → 새 계정 가입
2. 자동으로 `/login` 이동 → 로그인
3. 미니홈피 자동 생성 + 사이드바에 slug 표시
4. URL/앨범/메모 각 1건 등록
5. 꾸미기 탭에서 색·카드·레이아웃 변경 → 저장
6. 설정 탭 → 공개 ON → 안내 모달 → 저장
7. 시크릿 창으로 `/u/[내 slug]` 접속 → 정상 노출
8. 다시 비공개 → 시크릿 창 새로고침 → 404 "페이지를 볼 수 없어요"

## 9단계 — 도메인 연결 (선택)

Vercel Project → **Settings → Domains** → 도메인 추가 → DNS 안내 따르기.

## 10단계 — 백업 시작

[docs/14_BACKUP_ROLLBACK_PLAN.md](docs/14_BACKUP_ROLLBACK_PLAN.md) §3·§4를 참고해 주 1회 수동 백업 시작.

```powershell
# DB 백업
$env:SUPABASE_DB_URL_PROD = "postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres"
pg_dump $env:SUPABASE_DB_URL_PROD --no-owner --no-privileges -f "backups/db/$(Get-Date -Format yyyyMMdd)_full.sql"
```

---

## 배포 전 회귀 체크 (`docs/15_RELEASE_CHECKLIST.md`)

- [ ] 로컬에서 `npm run build` 성공
- [ ] 로컬에서 `npx tsc --noEmit` 0 에러
- [ ] E2E 25/25 통과 (Supabase Local 기준)
- [ ] `.env.local`이 git에 커밋되지 않음 (`.gitignore` 확인)
- [ ] 빌드 산출물 `.next/static`에 `SUPABASE_SERVICE_ROLE_KEY` 값과 `SESSION_SECRET` 값 미포함 (grep 확인 완료)
- [ ] `mini_homepages.is_public` 기본값 `false` 회귀
- [ ] 운영 Supabase 마이그레이션 1회 적용 완료
- [ ] 운영 SESSION_SECRET이 로컬과 다름

## 운영 후 모니터링

- Vercel Project → **Logs**: 런타임 에러 확인
- Supabase Dashboard → **Logs**: SQL 에러, Storage 실패 확인
- Vercel Analytics 활성화 권장 (선택)

## 롤백

- Vercel은 모든 배포를 보관 → **Deployments** 에서 이전 배포로 즉시 promote 가능 (DB 변경 미수반 시).
- DB 변경 수반 시 [docs/14_BACKUP_ROLLBACK_PLAN.md](docs/14_BACKUP_ROLLBACK_PLAN.md) §5 복원 절차.

---

## 자주 발생하는 문제

| 증상 | 원인 | 해결 |
|---|---|---|
| 로그인 후 `/admin` 진입 시 500 | `SESSION_SECRET` 미설정 또는 32자 미만 | Vercel env 다시 확인 |
| 사진 업로드 시 500 | `SUPABASE_SERVICE_ROLE_KEY` 잘못 설정, 또는 Storage 버킷 미생성 | 4·3단계 재확인 |
| 공개 미니홈피가 모바일에서만 깨짐 | 정상 (모바일 자동 1단 폴백) | 사양 동작 |
| `/u/[slug]`가 항상 404 | `is_public=false` (기본값) | 설정 탭에서 공개로 전환 |
| 빌드 실패 `SUPABASE_URL 환경변수가 설정되지 않았습니다` | Vercel env에 SUPABASE_URL 누락 | 7단계 재확인 |
