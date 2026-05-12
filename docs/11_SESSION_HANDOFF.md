---
상태: Draft
버전: v0.6
마지막 수정일: 2026-05-13
문서 목적: 운영 / 세션 인수인계
---

# 세션 인수인계 — v0.6 (PWA + 카드 관리 + 햄버거 메뉴 + 비밀번호 변경)

다음 세션이 곧장 이어받을 수 있도록 **현재 상태 / 환경 / 다음 작업 후보**를 한 곳에 정리한다.

---

## 1. 현재 진행 상태 한눈에

| 항목 | 값 |
|---|---|
| 운영 URL | https://mini-homepage.vercel.app |
| GitHub repo | https://github.com/hu28035036-ux/mini-homepage (Private) |
| Supabase Project | `mini-homepage-prod` (ref `efokjcootdmcrnpnqpce`, Seoul) |
| Vercel Project | `mini-homepage` (orgId `team_Fej1ZZqXQJPzGwxXB9oGo9AB`, projectId `prj_F0mAKTWVVZ38KBfXYj9qDSlJ46L6`) |
| 최근 commit | `27b067d fix(memos): persist 시 draftsRef 사용 — 마지막 입력의 누적 patch 보존` |
| 마지막 운영 배포 | Vercel 자동 (GitHub master push) — 진행/완료 |
| E2E | **31 passed / 3 skipped / 0 failed** (chromium) |
| TypeScript | 0 에러 |
| 마이그레이션 0003 | 로컬 적용 완료 / 운영 SQL Editor 적용 **필요** |

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

### v0.5 — Phase B + 카드/폰트 다양화
- 마이그레이션 0002: font_style/card_style enum 확장 + `mini_homepages.layouts jsonb` 추가
- 폰트 12종, 카드 스타일 10종, DecorateEditor 드롭다운 전환
- 자유 캔버스 5개 카드 자율 좌표 + @dnd-kit, PC/모바일 2-track
- 공개 페이지 `/u/[slug]`도 같은 FreeCanvas + visibility=private 필터
- 보안 헤더, router.refresh, Tailwind v4 safelist

### v0.6 — PWA + 카드 관리 + 햄버거 + 비밀번호 (현재 운영)
- 마이그레이션 **0003**: `default_card_opacity numeric` + `default_font_size text` 추가 (운영 SQL Editor 적용 필수)
- **Step A. PWA** — manifest.webmanifest + 아이콘 192/512/180/32 + iOS 메타 + themeColor
- **Step B. z-index 제어** — 핸들에 ▲/▼ 버튼 + bringForward/sendBackward
- **Step C. 편집 UX** — 자동저장 디바운스(1500ms), 카드 선택, 화살표 미세이동(±1, Shift ±10), Esc로 편집 종료
- **Step E. 투명도/폰트크기 전역+카드별** — Block.opacity/fontSize 옵셔널, DecorateEditor 슬라이더/select, 선택 카드 floating 컨트롤
- **Step F. 메모 row 카드형** — `+ 새 메모` 인라인 + 800ms 디바운스 자동저장 + ✕ 휴지통, divide-y 미리보기
- **Step G. 스크롤바 카드색** — `--scrollbar-track`/`--scrollbar-thumb` + `::-webkit-scrollbar` + `scrollbar-color`
- **Step H. 햄버거 메뉴** — TopBar 제거, 우상단 fixed MenuButton (공개 토글/홈/꾸미기/설정/공개 페이지/로그아웃), safe-area 대응
- **Step I. 설정 비밀번호 변경** — `/api/auth/password` POST + 계정 카드(이메일 표시 + 현재/새/확인)
- **Step J. 카드별 +** — 평소 모드 카드 우상단 + 버튼 (text_color 자동 추종)
- **Step K. 카드 클릭 expand** — 카드 본문 클릭 → expand 모달 자동 오픈 (urls 링크는 stopPropagation으로 새 탭 유지)
- **Step L. custom 카드 추가/삭제** — BlockKind 'custom' + customTitle/Content. 편집 모드 '+ 카드 추가' + 핸들 삭제 버튼
- **Step D. E2E TC-ALB-006~010** — fixture PNG 2개 + albums.spec.ts. 회귀 갱신
- 31 passed / 3 skipped / 0 failed

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
# 기대: 31 passed / 3 skipped / 0 failed (chromium)
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

## 5. 운영 후속 작업 (이번 세션 직후 처리 필요)

1. **마이그레이션 0003을 운영 Supabase에 적용** — Supabase Studio → SQL Editor → `supabase/migrations/0003_card_opacity_font_size.sql` 본문 실행. 컬럼 default 1 / 'base' 이므로 기존 row 무중단 호환.
2. 운영 헬스 체크 — `https://mini-homepage.vercel.app/manifest.webmanifest` 200, `/admin/settings` 200, 햄버거 메뉴 노출, 메모 자동저장.
3. 사용자 검증 — 모바일(크롬/삼성인터넷/사파리)·태블릿·PC에서 실제 동작 점검 후 비정상이면 추가 fix.

---

## 6. 다음 작업 후보 (사용자 검증 후 분기)

- **E. 비밀번호 재설정 흐름** — 이메일 발송 기반 (v0.6에 비밀번호 변경 본인 인증은 추가됨)
- **F. 휴지통 / 복구 UI** — `deleted_at` 활용
- **G. 운영 모니터링** — Vercel Analytics + Logflare/Sentry
- **H. DB 컬럼명 마이그레이션** — `mini_homepages` → `notes` (비용 큼)
- **I. Playwright multi-viewport** — webkit/mobile 추가 프로젝트 (v0.6 plan 명시했으나 시간상 chromium만 적용)
- **J. /admin/decorate 안 미리보기 영역(WidgetRenderer)** — v2 자유캔버스에 맞춰 단계적으로 정리

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
