---
상태: Draft
버전: v0.7.x
마지막 수정일: 2026-05-13
문서 목적: 운영 / 변경 이력
---

# 변경 이력

본 문서는 시간순 변경 기록을 남긴다. 현재 기능 지도는 `docs/19_FEATURE_CATALOG.md`에 있으며, 본 문서는 "언제, 무엇이 바뀌었는지"만 간단히 적는다.

## v0.7.x — 2026-05-13 (배경 무늬·카드 스타일+10·lightbox·그라데이션·모바일 단순화)

이번 세션 14건. 마이그 0004/0005/0006 신규 + 운영 완전 동기화. E2E 35 → 37 passed.

- 🆕 **배경 무늬 8종 + 색상** (마이그 0004) — dots/grid/diagonal/stripes/checker/crosshatch/waves/triangles, alpha 채널 hex 8자리 허용. 이미지 사용 시 패턴 가려짐. 패턴 카드 안에 종합 미리보기(투명도+카드+폰트크기)
- 🆕 **카드 스타일 10종 추가** (마이그 0005) — sticky(포스트잇 노랑)/mint/pink/sky/notebook(라인)/grid-paper(모눈)/dashed/double-border/ringed/bevel. **사용자 지정 카드 배경색** color picker + alpha. 총 20종
- 🆕 **사진 lightbox + 다운로드** — PhotoLightbox 컴포넌트 신규. fetch blob a.download (cross-origin fallback). AlbumsManager/HomeDashboard/PublicCanvas 모두 적용
- 🆕 **배경/카드 배경 그라데이션** (마이그 0006) — ColorPicker 단색/그라데이션 토글 + 두 색 + 각도 slider. 글자/포인트는 단색만(`solidOnly`). `solidFallback`로 옛 데이터 안전 fallback
- 🐛 **useTrack lazy init** — SSR fallback이 'desktop'이라 모바일이 PC 화면으로 보이던 hydration 회귀
- 🐛 **HomeDashboard mount 체크** — SSR HTML이 desktop으로 그려져 첫 paint에 캔버스 잘림. mount 전 placeholder
- 🐛 **MOBILE_BREAKPOINT 768 → 1024** — 갤럭시 폴드6 펼침(884) / 데스크탑 사이트 모드(980) 흡수
- 🐛 **PC/태블릿 수정 후 화면 즉시 갱신** — `persistLayouts` 끝에 `router.refresh()` + hp 동기화
- 🐛 **무늬 select disabled 제거** — 이미지 사용 토글과 무관하게 클릭 가능. 안내 문구만 표시
- 🐛 **모바일 꾸미기 완전 제외** — 햄버거에서 꾸미기 메뉴 hide, /admin/decorate 모바일 진입 시 안내만. 화면 밖 넘침 해소

## v0.7 — 2026-05-13 (그림판 카드 + 모바일 기록 전용 UI)

- 🆕 **Step N. 분기점 768 + 모바일 기록 전용 UI** — `useTrack` 1024→768, MobileHome 리스트형 폴더(URL/앨범/메모 + 꾸미기/설정/공개 페이지), DecorateEditor 모바일 단순화(미리보기 패널 제거, 1-column)
- 🆕 **Step M. 그림판 카드** — `BlockKind` 'drawing' 확장, `Block.drawingUrl`. DrawPad 모달 (5색 펜 + 3단 굵기 + 지우개 + 되돌리기 + 전체 지우기 + PNG 저장). canvas.toBlob → `/api/decorate/drawing` multipart → Supabase Storage (`<uid>/drawings/<uuid>.png`) → layouts에 URL 반영. FreeCanvas의 `+ 카드 추가`는 `+ 텍스트 카드` / `+ 그림판` 2개. drawing 카드 우상단 ✎ 또는 카드 본문 클릭 → DrawPad 진입. PublicCanvas에도 렌더
- 🧪 **E2E TC-MOBILE-001/002/DEC-001 + TC-DRAW-001 신규** — 35 passed / 3 skipped / 0 failed

## v0.6 — 2026-05-13 (PWA + 카드 관리 + 햄버거 메뉴 + 설정 비밀번호)

12개 Step 일괄. 마이그레이션 0003 신규.

- 🆕 **Step A. PWA** — `public/manifest.webmanifest` + 보라 단색 아이콘 192/512/180/32 + `viewport.themeColor` + iOS `appleWebApp`
- 🆕 **Step B. 카드 z-index 제어** — 편집 모드 핸들에 ▲(앞)/▼(뒤) 버튼 + `bringForward`/`sendBackward`
- 🆕 **Step C. 편집 UX 보강** — 자동저장 디바운스(1500ms) + 카드 클릭 선택(보라 ring) + 화살표 ±1, Shift+화살표 ±10 + Esc로 편집 종료
- 🆕 **Step E. 카드 투명도 / 폰트 크기 (전역+카드별)** — 마이그레이션 0003: `default_card_opacity numeric`, `default_font_size text(check enum)`. Block에 `opacity?`/`fontSize?` 옵셔널. DecorateEditor에 전역 슬라이더+select. 편집 모드에서 선택된 카드에 floating 컨트롤(투명도 slider + fontSize select + 기본값 복귀)
- 🆕 **Step F. 메모 row 단위 카드형 UX** — MemosManager 전면 개편: 상단 폼 제거, `+ 새 메모` 버튼 → 빈 row 즉시 생성 → 인라인 input/textarea, 800ms 디바운스 자동저장, 우상단 `✕` 휴지통. `updateMemoSchema` 빈 문자열 허용. HomeDashboard/PublicCanvas 메모 미리보기 `divide-y` 시각 분리
- 🆕 **Step G. 스크롤바 카드색 통일** — `globals.css`에 `--scrollbar-track`/`--scrollbar-thumb` CSS 변수 + `::-webkit-scrollbar` + `scrollbar-color`. admin/layout/PublicCanvas에서 본인 배경색/포인트색을 inline 주입
- 🆕 **Step H. 햄버거 메뉴** — TopBar 삭제, 우측 상단 fixed `MenuButton`(햄버거) → 드롭다운(@slug+공개토글, 홈, 꾸미기, 설정, 공개 페이지, 로그아웃). safe-area-inset 대응, click-outside + Esc 닫기
- 🆕 **Step I. /admin/settings 비밀번호 변경 추가** — `/api/auth/password` POST + `authService.changePassword` + `usersRepo.updatePassword`. SettingsForm에 계정 카드(이메일 표시 + 현재/새/확인 비밀번호)
- 🆕 **Step J. 카드별 + 버튼** — FreeCanvas DraggableBlock 평소 모드 우상단 `+` 버튼 (urls/albums/memos). 색은 `text_color` inline으로 자동 추종. HomeDashboard.quickAdd: urls/albums → 모달 오픈, memos → 빈 row 즉시 생성 후 모달
- 🆕 **Step K. 카드 본문 클릭 → expand 버그 수정** — FreeCanvas 루트 div에 onClick 부착, urls 링크는 `stopPropagation`로 새 탭 동작 유지
- 🆕 **Step L. custom 카드 추가/삭제** — `BlockKind`에 `'custom'` 확장 + Block에 `customTitle?`/`customContent?`. 편집 모드 우상단 `+ 카드 추가` 버튼 + DraggableBlock 핸들에 'custom' 전용 삭제 버튼. renderBlock 'custom' 분기(편집모드 인풋/textarea + 평소모드 div). PublicCanvas 동일
- 🧪 **Step D. E2E TC-ALB-006~010 신규** — `tests/fixtures/test-image{,-2}.png` + `tests/e2e/albums.spec.ts`. 회귀 갱신: TopBar 제거에 따라 `[data-slug]`/`[data-public]` 셀렉터, TC-MEMO 메모 자동저장에 `waitForResponse` 사용
- 📦 **마이그레이션 0003** — 로컬 + 운영 모두 적용 필요
- ✅ **검증 게이트**: `tsc --noEmit` 0 에러, `next build` 성공, E2E **31 passed / 3 skipped / 0 failed**

## v0.5.x — 2026-05-13 (꾸미기 적용 버그 fix)

- 🐛 **꾸미기 저장 후 적용 안 됨**: DecorateEditor.save() 후 `router.refresh()` 누락 → server component(admin/layout)의 prop이 옛 값 그대로 → wrapper 클래스 갱신 안 됨
  - fix: save() 끝에 `router.refresh()` 추가
- 🛡️ **Tailwind v4 동적 클래스 안전망**: `font-${var}`, `cardClass(...)` 합성 클래스 일부가 PostCSS 빌드에서 누락될 가능성
  - fix: `globals.css` 상단에 `@source inline()` safelist 추가 (폰트 12종 + 카드 유틸 모음)
- 🧪 **E2E 신규 4개**: TC-FONT-001/002, TC-CARD-001/002 — 폰트/카드 드롭다운 적용 + 12종/10종 노출 검증
- ✅ 전수 점검 grep 9개 통과 (시크릿 노출, 자동삭제, 응답 헬퍼, user_id, deleted_at)
- commit `06547fc`

## v0.5 — 2026-05-13 (Phase B + 카드/폰트 다양화)

- DB 마이그레이션 0002: `mini_homepages.layouts jsonb` 추가, font_style·card_style enum 확장
  - 운영(efokjcootdmcrnpnqpce) + 로컬 Supabase 양쪽 적용
- **폰트 12종**: default·rounded·emotional(v1) + pretendard·notoSans·notoSerif·nanumGothic·gowunDodum·nanumPen·ibmPlex·blackHan·hiMelody(v2)
  - Google Fonts + Pretendard CDN을 `globals.css`에서 import
- **카드 스타일 10종**: basic·rounded·shadow·transparent(v1) + soft·bordered·glass·minimal·elevated·frame(v2)
- DecorateEditor: 라디오 → 드롭다운, 폰트 선택지마다 자기 폰트 미리보기 + 본문 샘플
- **자유 캔버스 (FreeCanvas)** 신규 컴포넌트:
  - `@dnd-kit/core` 의 useDraggable + 자체 pointer move 리사이즈
  - 편집 모드 토글, 보라색 헤더(드래그) + 보라 사각형(리사이즈) 핸들
  - 카드별 visibility(공개/비공개), visible(숨김), expand(⛶) 액션
  - PC ↔ 모바일·태블릿 2-track 좌표 (`layouts.desktop` / `layouts.mobile`)
- `HomeDashboard` = FreeCanvas + 모달 expand 통합
- `/u/[slug]` 공개 페이지 = `PublicCanvas`로 같은 캔버스 + visibility=private 필터
- 🐛 fix: defaultBlocks 가 'use client' 파일에 있어서 server page에서 호출 시 500 → FreeCanvas 내부에서만 사용
- 🐛 fix: 카드 내부 콘텐츠가 드래그/리사이즈 핸들을 stacking으로 덮어서 클릭 안 되던 버그 → DOM 순서 재배치 + z-index 명시 + 편집 모드 ON일 때 콘텐츠 pointer-events: none
- commit `de8d49e`, `6cb51b0`

## v0.4 — 2026-05-12 (Phase A: 사용자 주인 정신)

- 🐛 fix: `admin/layout.tsx` 회색 배경 하드코딩 → 본인 background_color·image·font·text_color 동적 적용
- Sidebar 삭제, **TopBar**(sticky 상단 미니 액션 바) 신규
- 홈 = `HomeDashboard` 클라이언트 컴포넌트, 4 카드 + 각 카드 expand 모달 (UrlsManager/AlbumsManager/MemosManager 재사용)
- `Modal`/`IconButton` UI primitives 추가
- DecorateEditor에서 v1 layout 모드/슬롯 편집기 숨김
- "노트" 톤 카피 (DB 컬럼명은 유지)
- E2E: aside → header 셀렉터 갱신, v1 슬롯 의존 3개 skip
- commit `2f65f46`, `b86fcba`

## v0.3.1 — 2026-05-12 (버그 픽스)

- 🐛 **Race condition 수정**: `admin/layout.tsx`(ensureMine)와 `admin/page.tsx`(getMine)가 동시 실행될 때, 페이지가 미니홈피 생성 전에 데이터 조회를 시도하면 `DB_RECORD_NOT_FOUND` 발생하던 문제.
  - `ensureHomepageForUserId(userId)` 함수 분리 + 23505 충돌 시 재조회로 idempotent 보장
  - `admin/page.tsx`, `admin/decorate/page.tsx`, `admin/settings/page.tsx`가 `getMine` 대신 `ensureMine` 사용
- 🐛 **API 직접 호출 시 미니홈피 미존재**: UI 없이 API만 쓰면 layout이 호출 안 돼서 `DB_RECORD_NOT_FOUND` 떴음.
  - `authService.signup`이 가입 직후 `ensureHomepageForUserId(row.id)` 호출 → 가입과 동시에 미니홈피 + 기본 카테고리 보장
- ⚠️ **로그아웃 토큰 도용 trade-off 명시**: iron-session(stateless)은 로그아웃 시 만료 쿠키만 보내고 토큰 자체를 무효화하지 않음. 실제 브라우저 사용은 안전(쿠키 덮어써짐), 토큰 도용 후 재사용 시나리오는 영향 받음. 서버 사이드 세션 store는 v2 도입 검토.
- E2E 22/22 재실행 통과, `DB_RECORD_NOT_FOUND` 로그 0건 확인.

## v0.3 — 2026-05-12 (Phase 10 E2E 검증)

- Playwright 도입 (`@playwright/test`, Chromium)
- Supabase Local (Docker) + 마이그레이션 적용 + `user-uploads` 버킷 생성
- `.env.local` 로컬 개발용 키 세팅
- E2E 테스트 22개 작성 + **22/22 통과**:
  - 인증 5개 (TC-AUTH-001~006): 회원가입/로그인/중복/오답/리다이렉트/로그아웃
  - 미니홈피·CRUD 5개 (TC-HP, TC-ALB-001, TC-URL, TC-MEMO)
  - 꾸미기·레이아웃 6개 (TC-DEC, TC-LAYOUT): 미리보기 즉시 반영·single↔double 슬롯 동기화·클라이언트 중복 차단·서버 `LAYOUT_WIDGET_DUPLICATED`/`LAYOUT_INVALID_SLOT`·저장 후 새로고침 유지
  - 공개/비공개 4개 (TC-PUB): 비공개→공개→비공개 한 사이클·미존재 동일 응답·API 직접 호출 404·본인 비공개 접근
  - 사용자 분리 2개 (TC-ISO-001/002/005): URL/메모 격리·미니홈피 PATCH 격리
- `tests/global-setup.ts` 추가 (Next dev cold-compile 워밍업)

## v0.2 — 2026-05-12 (Phase 1~9 코드 구현)

- Next.js 15 App Router + TypeScript + Tailwind v4 프로젝트 골격
- Supabase 마이그레이션 SQL `supabase/migrations/0001_initial.sql` (6테이블 + 트리거 + 부분 unique 인덱스)
- 자체 회원가입 시스템 — bcryptjs(cost 12) + iron-session 쿠키 + signup/login/logout API + 페이지
- 미니홈피 자동 생성 (기본 비공개 + 기본 카테고리 트랜잭션)
- URL/앨범 카테고리/사진/메모 CRUD — repository + service + API + 관리자 페이지
- Supabase Storage 어댑터 (사진/배경/프로필 업로드, MIME/10MB 검증)
- 꾸미기 탭 — 색·카드(4)·폰트(3)·배경 + 레이아웃(single/double) + 슬롯별 위젯 배치 + 즉시 미리보기
- 위젯 렌더러 — 관리자 미리보기와 공개 페이지 공통 사용
- 설정 탭 — 프로필/slug/공개 토글
- 공개 페이지 `/u/[slug]` — 서버에서 `is_public AND deleted_at IS NULL` 검증, 비공개=미존재 동일 응답
- README 1사이클 시나리오, 환경변수 가이드

## v0.1 — 2026-05-12 (Phase 0)

- 초기 문서 세트 생성 (PRD, 아키텍처, DB, API, UI, 단위화, 오류 코드, 13종 하네스, Phase 계획, 기능 목록, 운영 문서, 로그/상태/인수인계, 메타, `.claude/`, `phases/`)
- 미니홈피 서비스 v1 설계 확정:
  - Next.js + Supabase Postgres/Storage 스택
  - 자체 회원가입 시스템 (Supabase Auth 미사용)
  - 6테이블(users / mini_homepages / urls / album_categories / photos / memos) + 소프트 삭제
  - 꾸미기: 색·카드·폰트·배경 + 레이아웃(single/double) + 슬롯별 위젯 배치 (드래그앤드롭 없음)
  - 공개/비공개: 기본 비공개, 서버에서만 검증, 비공개와 미존재 동일 응답
  - AI 기능 v1 제외
