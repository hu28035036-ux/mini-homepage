---
상태: Draft
버전: v0.8
마지막 수정일: 2026-05-18
문서 목적: 운영 / 세션 인수인계
---

# 세션 인수인계 — v0.8 (카드 이름·카테고리·그림판 개편)

다음 세션이 곧장 이어받을 수 있도록 **현재 상태 / 환경 / 다음 작업 후보**를 한 곳에 정리한다.

---

## 0. ⚠️ 다음 세션 최우선 작업 — production 마이그레이션 0007 적용

**유일한 미완료 작업.** v0.8 코드는 master 머지·Vercel 배포 완료됐고, 보고된 버그
2건(편집 버튼 사라짐 / 카드 위치 롤백)도 배포 서버에서 수정 확인됨. **그러나
production Supabase에 마이그레이션 0007이 적용되지 않아 카드 카테고리 기능이
동작하지 않는다** (`POST /api/cards/categories` → 500).

- 증상: 배포 서버에서 카테고리 추가 시 500 (`card_categories` 컬럼 없음).
- 영향 범위: 카드 카테고리 기능만. 편집 버튼·레이아웃 저장은 정상(컬럼 불필요).
- 로컬 Supabase에는 이미 적용됨. **production(`mini-homepage-prod`, ref
  `efokjcootdmcrnpnqpce`)에만 미적용.**

**적용 방법 (둘 중 하나):**

1. Supabase 대시보드 → SQL Editor에서 실행:
   ```sql
   alter table public.mini_homepages
     add column if not exists card_categories jsonb not null default '[]'::jsonb;
   alter table public.mini_homepages
     drop constraint if exists mini_homepages_card_categories_check;
   alter table public.mini_homepages
     add constraint mini_homepages_card_categories_check
     check (jsonb_typeof(card_categories) = 'array');
   ```
2. 또는 CLI: `supabase link --project-ref efokjcootdmcrnpnqpce` 후 `supabase db push`
   (production DB 비밀번호 필요).

**적용 후 검증:** 배포 서버에서 로그인 → `POST /api/cards/categories {"name":"테스트"}`
가 201을 반환하는지 확인. 마이그 파일 원본: `supabase/migrations/0007_card_categories.sql`.

> 정리 필요(선택): 검증 중 production에 테스트 계정 `deploy-verify-1779091730@example.test`
> 1개가 생성됨. 삭제 UI가 없어 남아 있음.

---

## 1. 현재 진행 상태 한눈에

| 항목 | 값 |
|---|---|
| 운영 URL | https://mini-homepage.vercel.app |
| GitHub repo | https://github.com/hu28035036-ux/mini-homepage (Private) |
| Supabase Project | `mini-homepage-prod` (ref `efokjcootdmcrnpnqpce`, Seoul) |
| Vercel Project | `mini-homepage` (orgId `team_Fej1ZZqXQJPzGwxXB9oGo9AB`, projectId `prj_F0mAKTWVVZ38KBfXYj9qDSlJ46L6`) |
| 최근 commit | `b169857 Merge pull request #1` (v0.8 — 카드 이름·카테고리·그림판) |
| 마지막 운영 배포 | Vercel 자동 — v0.8 배포 완료, `/login` 200, `/admin` 200 |
| E2E | 신규 24건(카드이름6·그림판9·카테고리9) 단독 통과. 전체 60건 일괄은 부하로 간헐 timeout(환경) |
| TypeScript | 0 에러, build OK |
| 마이그레이션 | 0001~0006 로컬·운영 동기화 ✅ / **0007 로컬만 적용, 운영 미적용** ⚠️ (§0 참고) |

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

### v0.7 — 그림판 + 모바일 리스트 (commit ~`9c611c6`)
- **Step M. 그림판 카드** — `BlockKind` 'drawing' + DrawPad 모달(5색 펜·3단 굵기·지우개·되돌리기·전체지우기) + `canvas.toBlob → /api/decorate/drawing` Supabase Storage + DraggableBlock ✎ 버튼
- **Step N. 모바일 기록 전용 UI** — `useTrack` 분기점 도입, MobileHome 리스트형 폴더, DecorateEditor 모바일 단순화

### v0.7.x — 추가 보강 (이번 세션 분, commit `3a8aae4`~`51c1a18`)

| commit | 내용 |
|---|---|
| `3a8aae4` | **배경 무늬 8종** (dots/grid/diagonal/stripes/checker/crosshatch/waves/triangles) + 무늬 색상 (마이그 **0004**) |
| `623c8cb` | `useTrack` lazy init — 모바일이 PC로 보이던 회귀 fix |
| `d4919cf` | PC/태블릿 수정 후 화면 즉시 갱신 — `router.refresh()` + hp prop 동기화 |
| `cdf2c01` | 무늬 select disabled 제거 + 이미지 사용 시 안내 |
| `314ebdf` | 미리보기에 투명도+무늬+카드+폰트크기 종합 반영 |
| `2f3f0dd` | 모바일에서 꾸미기 메뉴 제외 + DecorateEditor 모바일 진입 시 안내만 |
| `4ec02c6` | `MOBILE_BREAKPOINT` 768 → **1024** (갤럭시 폴드6 펼침/안드로이드 데스크탑 모드 흡수) |
| `25cbd51` | HomeDashboard mount 체크 — SSR HTML이 desktop으로 그려져 캔버스가 잘리던 첫 paint 깜빡임 해소 |
| `0fdc9ab` | **카드 스타일 10종 추가** (sticky/mint/pink/sky/notebook/grid-paper/dashed/double-border/ringed/bevel) + 카드 배경색 사용자 지정 (마이그 **0005**) |
| `c25fd3a` | **사진 lightbox** + ⬇ 저장 버튼 (PhotoLightbox 신규) — AlbumsManager/HomeDashboard/PublicCanvas 모두 |
| `f1ac3f9` | **배경/카드 배경에 그라데이션** 지원 (ColorPicker 신규, 마이그 **0006**) |
| `62264ea` | solidFallback — 그라데이션 색을 invalid `color`에 박을 때 첫 hex로 fallback |
| `51c1a18` | 글자/포인트 색상은 단색만 (그라데이션 토글 hide) |

**E2E**: 35 → **37 passed** / 3 skipped / 0 failed

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
# 기대: 37 passed / 3 skipped / 0 failed (chromium)
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

## 5. 운영 후속 작업

- ✅ **마이그레이션 0001~0006 모두 운영 적용 완료** (이전 세션 토큰 `sbp_66a115c7b8eb82788602efb3287efd57a5291876`로 push 진행). 새 세션에서 마이그 추가 시 토큰 재발급 또는 같은 토큰 사용. 사용 후 폐기 권장.
- 운영 헬스 — `/login` 200, `/manifest.webmanifest` 200.
- 사용자 실 디바이스 점검 — 안드로이드 크롬·iOS Safari·갤럭시 폴드6 펼침 viewport에서 모바일 리스트 정상 진입(1024 미만)·꾸미기 안내 화면·사진 lightbox·다운로드 작동 여부.

---

## 6. 다음 세션 작업 후보 — 우선순위

### A. 사용자 보고 이슈/검증 우선 (시급)
- 운영에서 **그라데이션 배경·카드 배경**이 실제 의도대로 표시되는지 확인 (Safari/Firefox/Edge 다양한 브라우저)
- 사진 lightbox **다운로드 버튼**이 모바일/PC에서 실제 파일 저장되는지 (cross-origin fetch 실패 시 새 탭 fallback 동작 확인)
- 새 카드 스타일 20종 중 **`notebook`(가로 라인)·`grid-paper`(모눈)** 등 Tailwind v4 dynamic class가 제대로 빌드에 포함되었는지 운영에서 시각 확인
- 모바일 햄버거 메뉴의 `data-public` 속성으로 분기되는 동작 정상 여부

### B. 보강/마무리 작업
1. **그라데이션 글자 효과 (선택)** — 사용자가 v0.7.x에서 글자/포인트 단색으로 제한했지만, 추후 원하면 `background-clip: text` 트릭으로 그라데이션 글자 가능. 현재는 solidFallback으로 첫 hex만 적용
2. **DrawPad Storage 고아 파일 정리** — drawing 카드 삭제 시 Supabase Storage의 PNG 자동 cleanup (현재는 누적)
3. **모바일에서 그림판/custom 카드 보기** — 현재 모바일은 5개 기본 카드만 표시. drawing/custom은 desktop 전용
4. **사진 lightbox 슬라이드** — 좌우 ← → 키로 이전/다음 사진. 현재는 1장씩 닫고 다시 열기
5. **알파(투명도) 슬라이더 UI** — 현재 무늬 색·카드 배경에서 alpha는 8자리 hex(`#RRGGBBAA`) 직접 입력만. picker 슬라이더 추가
6. **패턴 크기/회전** — 현재 8종 고정 크기. 사용자가 셀 크기·회전 각도 조절 가능

### C. 데이터/기능 확장
7. **비밀번호 재설정 흐름** — 이메일 발송 기반 (현재는 본인 인증 변경만)
8. **휴지통/복구 UI** — `deleted_at` 활용
9. **운영 모니터링** — Vercel Analytics / Sentry
10. **DB 컬럼명 마이그레이션** — `mini_homepages` → `notes` (비용 큼, 마지막에)
11. **Playwright multi-viewport** — webkit-mobile / webkit-tablet 프로젝트 추가 (현재는 chromium만)

### D. 알려진 한계 — v2에서 해결
12. iron-session stateless → Redis 서버 사이드 세션 store
13. Supabase Storage public 버킷 → signed URL 모델
14. 모바일 터치 드래그·리사이즈 실 디바이스 검증
15. v1 layout slots 편집기 잔재 (`/admin/decorate` 안 hidden) — 완전 제거 시기 결정

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
이번 작업은 v0.7.x 운영 검증 후속이다. 직전 세션에서 그라데이션 배경/카드 + 사진 lightbox + 카드 스타일 20종 + 모바일 단순화를 완료했다.

반드시 아래 순서로 진행해라.

1. 관련 문서를 먼저 읽어라.
   - docs/11_SESSION_HANDOFF.md (본 문서, 특히 §2 v0.7.x 변경 표, §6 다음 작업 후보)
   - docs/10_CURRENT_STATE.md
   - docs/09_CHANGELOG.md
   - docs/00_PRD.md (PRD §7 제외 기능 확인)
   - docs/17_MODULEIZATION_GUIDE.md
   - docs/18_ERROR_CODE_RESPONSE_STANDARD.md
   - docs/19_FEATURE_CATALOG.md

2. 작업 범위를 사용자에게 확인한다.
   - §6 후보 A(검증)·B(보강)·C(확장) 중 어느 쪽인지
   - 운영 실 디바이스에서 발견된 회귀가 있는지

3. 코드 작업 전 기준선 확인:
   - npx tsc --noEmit (0 에러)
   - npx playwright test (37 passed / 3 skipped / 0 failed)
   - npm run build (성공)
   - 마이그레이션 0001~0006 운영 동기화 확인 — `SUPABASE_ACCESS_TOKEN=... npx supabase migration list`

4. 단위화/모듈화 기준 준수:
   - lib/services/*, lib/repositories/*, lib/validators/* 분리 유지
   - 응답은 lib/errors/response.ts 헬퍼만 사용
   - repository는 user_id + deleted_at IS NULL 자동 부착
   - 색상 인라인은 그라데이션 가능성 있음 — backgroundColor/Image 분기 또는 solidFallback 사용 (`src/components/decorate/ColorPicker.tsx`)

5. 새 마이그가 필요하면:
   - `supabase/migrations/000N_*.sql` 추가 → `npx supabase migration up` 로컬 적용 → `SUPABASE_ACCESS_TOKEN=... npx supabase db push` 운영 적용
   - 토큰 사용 후 폐기 권장 (https://supabase.com/dashboard/account/tokens)

6. 구현 후 typecheck 0 에러 + E2E 회귀 통과 확인.

7. git commit (author: hu28035036-ux / hu28035036@gmail.com) + push → Vercel 자동 배포 + `/login` 200 헬스 체크.

8. 사용자에게 결과 보고 (완료/위험/보류).

금지사항:
- AI/RAG/챗봇 기능 추가 금지 (PRD §7)
- SUPABASE_SERVICE_ROLE_KEY를 NEXT_PUBLIC_*로 노출 금지
- mini_homepages.is_public 기본값 false 변경 금지
- 자동 삭제 작업(setInterval, cron) 추가 금지
- 모든 repository 쿼리에 user_id + deleted_at IS NULL 강제 유지
- 글자/포인트 색상은 단색만 (v0.7.x 사용자 결정). 그라데이션 토글 다시 노출 X
```

---

## 9. 마지막 업데이트

2026-05-13. 다음 세션은 사용자 피드백(폰트/카드 적용 확인)을 받은 후 Phase D 또는 추가 fix로 분기.
