---
상태: Draft
버전: v0.5
마지막 수정일: 2026-05-13
문서 목적: 운영 / 세션 인수인계
---

# 세션 인수인계 — v0.5 (자유 캔버스 + 폰트/카드 다양화 운영 배포)

다음 세션이 곧장 이어받을 수 있도록 **현재 상태 / 환경 / 다음 작업 후보**를 한 곳에 정리한다.

---

## 1. 현재 진행 상태 한눈에

| 항목 | 값 |
|---|---|
| 운영 URL | https://mini-homepage.vercel.app |
| GitHub repo | https://github.com/hu28035036-ux/mini-homepage (Private) |
| Supabase Project | `mini-homepage-prod` (ref `efokjcootdmcrnpnqpce`, Seoul) |
| Vercel Project | `mini-homepage` (orgId `team_Fej1ZZqXQJPzGwxXB9oGo9AB`, projectId `prj_F0mAKTWVVZ38KBfXYj9qDSlJ46L6`) |
| 최근 commit | `06547fc fix(decorate): 카드/폰트 저장 후 적용 안 되던 버그 + Tailwind v4 safelist` |
| 마지막 운영 배포 | Vercel 자동 (GitHub master push) — 완료 |
| E2E | **26 passed / 3 skipped / 0 failed** |
| TypeScript | 0 에러 |

---

## 2. 적용 완료 사항 (v0.1 → v0.5 누적)

### v0.1 — Phase 0
- 문서 53개 + .claude/ 스킬 + phases/

### v0.2 — Phase 1~9
- Next.js 15 + Supabase Postgres/Storage + 자체 bcrypt 인증
- 6 테이블 + 소프트 삭제 + RLS 활성 + anon 권한 회수
- 회원가입/로그인, URL/앨범/메모 CRUD, 꾸미기, 공개/비공개, `/u/[slug]` 공개 페이지
- E2E 25개

### v0.3 — Phase 10 E2E + 운영 배포
- Playwright 도입, Supabase Local 셋업, 운영 Vercel 배포
- 운영 URL https://mini-homepage.vercel.app 가동

### v0.3.1 — 버그 fix
- race condition: `homepageService.ensureMine` 23505 재조회로 idempotent
- 가입 시 `ensureHomepageForUserId(row.id)` 자동 호출 → API 직접 호출도 즉시 동작

### v0.4 — Phase A (사용자 주인 정신)
- `admin/layout.tsx`의 회색 배경 하드코딩 제거 → 본인 background_color/font_style 동적 적용
- Sidebar 삭제, TopBar 신규 (sticky 상단 미니 액션 바)
- 홈 = HomeDashboard 클라이언트 컴포넌트로 재구성, 4 카드 + 각 카드 expand 모달
- v1 layout_slots/layout_mode 편집기 숨김 (v2 자유 캔버스로 대체)

### v0.5 — Phase B + 카드/폰트 다양화 (현재 운영)
- 마이그레이션 0002: font_style/card_style enum 확장 + `mini_homepages.layouts jsonb` 추가
- **폰트 12종** (default, pretendard, notoSans, notoSerif, nanumGothic, gowunDodum, rounded, nanumPen, emotional, ibmPlex, blackHan, hiMelody)
- **카드 스타일 10종** (basic, rounded, shadow, transparent, soft, bordered, glass, minimal, elevated, frame)
- DecorateEditor: 라디오 → 드롭다운, 폰트 선택 항목마다 자기 폰트 미리보기
- **자유 캔버스 (FreeCanvas)**: 5개 카드(title/profile/urls/albums/memos) 자율 좌표 + @dnd-kit/core 드래그 + 자체 pointer 리사이즈
- **편집 모드 토글** + 드래그 핸들(`⋮⋮ kind`) + 보라 사각형 리사이즈 핸들
- 카드별 visibility(공개/비공개) + visible(숨김) + expand(⛶) 액션
- **PC ↔ 모바일·태블릿 2-track 좌표** (`layouts.desktop` / `layouts.mobile`)
- 공개 페이지 `/u/[slug]`도 같은 FreeCanvas + visibility=private 필터
- 보안 헤더 (HSTS, X-Content-Type-Options, X-Frame-Options, Referrer, Permissions)
- DecorateEditor save() → router.refresh() (저장 즉시 server prop 갱신)
- Tailwind v4 `@source inline()` 안전 리스트

---

## 3. 다음 세션 시작 — 1분 안에 작업 환경 복원

### 3-1. 시작 명령 (PowerShell)

```powershell
cd C:\Users\user\Desktop\개발\홈페이지제작

# 1. git 최신화
git pull

# 2. 의존성 (이미 설치돼 있으면 skip — node_modules 있나만 확인)
test -d node_modules || npm install

# 3. Supabase Local 시작 (Docker 필요. 이미 떠 있으면 skip)
npx supabase status 2>$null
if ($LASTEXITCODE -ne 0) { npx supabase start }

# 4. dev 서버
npm run dev
# 출력: http://localhost:3000 (3000 점유 시 자동 3001)
```

### 3-2. E2E 실행

```powershell
npx playwright test
# 기대: 26 passed / 3 skipped / 0 failed
```

### 3-3. 배포 (코드 변경 후)

```powershell
git add -A
git -c user.name="hu28035036-ux" -c user.email="hu28035036@gmail.com" commit -m "..."
git push
# Vercel이 GitHub master push를 감지해 자동 빌드 + 배포
# 진행 상황: https://vercel.com/hu28035036-2116s-projects/mini-homepage/deployments
```

> ⚠️ 커밋 author는 반드시 `hu28035036-ux` / `hu28035036@gmail.com`. 다른 author면 Vercel이 `COMMIT_AUTHOR_REQUIRED`로 빌드 차단.

---

## 4. 환경/시크릿 위치

| 항목 | 위치 | 비고 |
|---|---|---|
| Supabase Local 키 | `.env.local` (git ignored) | JWT service_role 키, 로컬용. 운영에서 사용 금지 |
| Supabase 운영 키 | Vercel Project Settings → Environment Variables (Production) | 이미 7개 등록 완료 |
| Vercel Personal Token | **사용자가 발급/폐기 관리** | 한 번 쓰고 폐기 권장. 이전 토큰은 만료시켜 OK |
| GitHub 인증 | gh CLI `gh auth status` 로 확인 | `hu28035036-ux` 계정 + repo 권한 |

`.env.local` 분실 시 운영 키로 채우면 안 됨. Supabase Local로 새로 받아야:
```powershell
npx supabase status  # 출력에 anon key 등 표시. legacy JWT는 docker exec ... env 로
```

자세한 셋업 절차는 [DEPLOY.md](../DEPLOY.md) + [docs/13_ENVIRONMENT_SETUP.md](13_ENVIRONMENT_SETUP.md).

---

## 5. 사용자 확인 대기 중인 항목 (가장 우선)

직전 push(`06547fc`) 후 운영에서 다음을 확인 요청한 상태:

1. 꾸미기 탭에서 폰트 `nanumPen` 또는 `blackHan` 선택 + 저장 → 화면 폰트가 실제로 바뀌는지 (router.refresh() 효과)
2. 카드 스타일 `glass` 또는 `bordered` 선택 + 저장 → 카드 모양이 실제로 바뀌는지
3. 새로고침 없이 즉시 반영되는지 (이전엔 router.refresh 누락으로 안 됐음)

피드백 도착하면 그 결과에 따라 분기 (정상 → 다음 Phase 진행 / 비정상 → 추가 디버깅).

---

## 6. 다음 작업 후보 (피드백 받은 후 분기)

피드백이 OK라면 다음 후보 중 사용자가 선택:

- **A. Phase D — PWA (모바일/태블릿에서 앱처럼)**
  - `public/manifest.webmanifest` + 앱 아이콘 192/512 + iOS 메타 태그
  - "홈 화면에 추가" UX, standalone 풀스크린
  - 작업량 ~30분
- **B. 카드 z-index/겹침 제어** — 앞/뒤 보내기 + 정렬 가이드
- **C. 편집 모드 UX 보강** — 자동저장 디바운스, 키보드 화살표 미세 이동, Esc로 종료
- **D. 이미지 업로드 E2E 보강** — TC-ALB-006~010 자동화 (`setInputFiles`)
- **E. 비밀번호 재설정 흐름** — v2.1 신규
- **F. 휴지통 / 복구 UI** — `deleted_at` 활용
- **G. 운영 모니터링** — Vercel Analytics + Logflare 또는 Sentry
- **H. DB 컬럼명 마이그레이션** — `mini_homepages` → `notes` (비용 큼, 마지막에)

---

## 7. 알려진 한계 (v1.x → v2에서 해결 예정)

| 항목 | 영향 | 우회 |
|---|---|---|
| 로그아웃 후 옛 쿠키 토큰 재사용 가능 (iron-session stateless) | 토큰 도용 시나리오만 영향. 정상 브라우저는 만료 쿠키로 덮어써져 안전 | 서버 사이드 세션 store(Redis) 도입 — v2 |
| 비밀번호 재설정 흐름 없음 | 사용자가 비밀번호 잊으면 운영자 수동 처리 | 운영 런북 §2-3 임시 절차. v2 도입 예정 |
| Supabase Storage Public 버킷 | 비공개 미니홈피의 이미지 URL이 유출되면 외부 접근 가능 | v2에서 signed URL 모델로 강화 |
| 모바일 터치 드래그/리사이즈 | 실제 모바일에서 검증 부족 (touchAction: none 적용했지만) | 실 디바이스에서 직접 점검 필요 |

---

## 8. 다음 세션을 위한 §49 형식 진입 지시문 (필요 시 복붙)

```text
이번 작업은 v0.5 운영 검토 후속(또는 Phase D PWA)이다.

반드시 아래 순서로 진행해라.

1. 관련 문서를 먼저 읽어라.
   - docs/00_MASTER_INDEX.md
   - docs/10_CURRENT_STATE.md
   - docs/11_SESSION_HANDOFF.md (본 문서)
   - docs/00_PRD.md (PRD §7 제외 기능 확인)
   - docs/01_ARCHITECTURE.md
   - docs/17_MODULEIZATION_GUIDE.md
   - docs/18_ERROR_CODE_RESPONSE_STANDARD.md
   - docs/harness/05_SECURITY_PRIVACY_HARNESS.md
   - docs/19_FEATURE_CATALOG.md

2. 작업 범위를 사용자에게 확인한다.

3. 코드 작업 전 typecheck + E2E 기준선 확인:
   - npx tsc --noEmit (0 에러여야 함)
   - npx playwright test (26 passed / 3 skipped / 0 failed 기준)

4. 단위화/모듈화 기준 준수:
   - lib/services/*, lib/repositories/*, lib/validators/* 분리 유지
   - 응답은 lib/errors/response.ts 헬퍼만 사용
   - repository는 user_id + deleted_at IS NULL 자동 부착

5. 구현 후 typecheck 0 에러 + E2E 회귀 통과 확인.

6. git commit (author: hu28035036-ux / hu28035036@gmail.com) + push → Vercel 자동 배포.

7. 운영 헬스 체크 → 사용자에게 결과 보고.

금지사항:
- AI/RAG/챗봇 기능 추가 금지 (v1 제외)
- SUPABASE_SERVICE_ROLE_KEY를 NEXT_PUBLIC_*로 노출 금지
- mini_homepages.is_public 기본값 false 변경 금지
- 자동 삭제 작업(setInterval, cron) 추가 금지
- 모든 repository 쿼리에 user_id + deleted_at IS NULL 강제 유지
```

---

## 9. 마지막 업데이트

2026-05-13. 다음 세션은 사용자 피드백(폰트/카드 적용 확인)을 받은 후 Phase D 또는 추가 fix로 분기.
