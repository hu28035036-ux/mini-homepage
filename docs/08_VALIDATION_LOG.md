---
상태: Draft
버전: v0.1
마지막 수정일: 2026-05-12
문서 목적: 운영 / Phase 검증 로그
---

# 검증 로그

각 Phase 종료 시 §48 형식으로 기록한다.

---

## Phase 0. 프로젝트 기준 문서 작성

### 1. 작업 범위
- 본 프로젝트의 Phase 0~10 표준 문서 세트 작성
- v1 범위: AI 기능 없음. 코드 구현 없음. 문서·`.claude/`·`phases/` JSON만

### 2. 변경 파일
- `docs/meta/00_DOCUMENT_MANAGEMENT_RULES.md`: 헤더 규칙 확정
- `docs/00_MASTER_INDEX.md`: 전 문서 인덱스
- `docs/00_PRD.md`: 서비스 기획
- `docs/01_ARCHITECTURE.md`: 전체 구조 + 폴더 트리
- `docs/02_DATABASE_DESIGN.md`: 6개 테이블 + `layout_slots` 단일 소스
- `docs/03_API_DESIGN.md`: API 목록 + 코드 매핑
- `docs/04_UI_FLOW.md`: 9개 화면
- `docs/05_HARNESS_PLAN.md`: Phase별 하네스 매핑
- `docs/06_TEST_CASES.md`: TC-AUTH/HP/URL/ALB/MEMO/DEC/LAYOUT/PUB/ISO/RET/RWD
- `docs/07_PHASE_PLAN.md`: Phase 0~10
- `docs/08_VALIDATION_LOG.md`: 본 문서
- `docs/09_CHANGELOG.md`: v0.1 초기
- `docs/10_CURRENT_STATE.md`: 현재 Phase 0 완료
- `docs/11_SESSION_HANDOFF.md`: Phase 1 진입 지시
- `docs/12_DESIGN_CHANGE_REQUESTS.md`: 빈 템플릿
- `docs/13_ENVIRONMENT_SETUP.md`: Supabase + 자체 인증 환경 정의
- `docs/14_BACKUP_ROLLBACK_PLAN.md`: 백업/복원/롤백
- `docs/15_RELEASE_CHECKLIST.md`: 배포 전 체크
- `docs/16_OPERATION_RUNBOOK.md`: 운영 시나리오
- `docs/17_MODULEIZATION_GUIDE.md`: 모듈화 규칙
- `docs/18_ERROR_CODE_RESPONSE_STANDARD.md`: 응답/오류 코드 단일 소스
- `docs/19_FEATURE_CATALOG.md`: 기능 목록 (전부 Planned/Untested 초기)
- `docs/harness/00`~`12_*.md`: 13개 하네스
- `docs/meta/01_SKILL_USAGE_MAP.md`: Skill 매핑
- `.claude/settings.json`: 권한·hook 자리표시
- `.claude/commands/{harness,review}.md`: 명령 정의
- `.claude/skills/*/SKILL.md` (11개): bootstrap·planner·compliance·moduleization·harness·error·feature·doc·release·session·bridge
- `phases/index.json`: Phase 0~10 상태
- `phases/0-project-setup/{index.json, step0.md, step0-output.json}`: Phase 0 산출

### 3. 실행한 명령어
- 본 Phase는 코드 미작성 단계이므로 실행 명령 없음
- 검증은 수동 + 본 컨텍스트 내 Glob/Grep으로 수행

### 4. 테스트 결과
- 통과: 문서 존재 검사 / JSON 유효성 / 헤더 일관성 / 단일 소스 일관성 (Phase 0 마무리 단계에서 수행)
- 실패: 없음
- 미실행: §1~§4 외 하네스(코드 검증 필요한 것)는 Phase 1 이후에 적용
- 수동확인 필요: 없음 (현 단계)

### 5. 실패 및 수정 내역
- (없음)

### 6. 회귀 테스트 결과
- v0.1 초기본이므로 회귀 대상 없음

### 7. 남은 위험 요소
- 임베딩/AI 도입 시점에 새 Phase가 필요 (v2)
- Supabase RLS 미사용 — 모든 보안이 애플리케이션 레이어에 의존. Phase 9 이후 RLS 도입 검토 가능 (요청 시 별도 Phase)
- `.claude/` hook 실제 스크립트 미구현 — v2

### 8. 완료 판단

자체 검증 결과 (2026-05-12, Phase 0 마무리):

- 파일 생성: 53개 모두 존재 (docs 36 + .claude 14 + phases 4 - 인덱스 중복 제외하면 정확히 53)
- 헤더: 36개 docs 모두 `상태/버전/마지막 수정일/문서 목적` 4행 부착
- JSON 유효성: `phases/index.json`, `phases/0-project-setup/index.json`, `phases/0-project-setup/step0-output.json`, `.claude/settings.json` 모두 파싱 OK
- 단일 소스: 오류 코드 21개는 `docs/18`에만 정의. `layout_slots` 정의는 `docs/02` §4에만 (9개 다른 문서는 참조만).
- 공개/비공개 서버 검증 문구: PRD / Architecture / API Design / UI Flow / Security Privacy Harness 5문서에 모두 존재.
- AI 제외 일관성: docs/ai/ 폴더 미생성. PRD §7, Feature Catalog §10, Skill Usage Map §3 세 곳에서 동일하게 "v1 제외 / v2 추가 시점 명시".

- [x] 모든 필수 문서 작성 완료
- [x] 미실행 테스트 없음 (Phase 0 범위 한정)
- [x] 문서 업데이트 완료
- [x] 다음 Phase(1) 진행 가능

---

## Phase 1~9. v1 MVP 코드 구현

### 1. 작업 범위
- Next.js + Supabase 코드 베이스 전체 (Phase 1 환경, Phase 2 인증, Phase 3 미니홈피, Phase 4 URL, Phase 5 앨범, Phase 6 메모, Phase 7 꾸미기+레이아웃, Phase 8 설정, Phase 9 공개 페이지)

### 2. 변경 파일 (주요)
- 설정: `package.json`, `tsconfig.json`, `next.config.mjs`, `postcss.config.mjs`, `.gitignore`, `.env.local.example`, `README.md`
- DB: `supabase/migrations/0001_initial.sql`
- lib: `src/lib/errors/{codes,response}.ts`, `src/lib/auth/{password,session,guards}.ts`, `src/lib/db/supabase-server.ts`, `src/lib/storage/{paths,uploader}.ts`
- repositories: users, homepages, urls, albumCategories, photos, memos
- services: auth, homepage, urls, albums, memos, decorate, publicView, _parse
- validators: auth, urls, albums, memos, decorate
- API routes: `auth/{signup,login,logout}`, `homepage`, `urls(/:id)`, `albums/categories(/:id)`, `albums/photos(/:id)`, `memos(/:id)`, `decorate`, `decorate/background`, `decorate/profile-image`, `public/[slug]`
- 페이지: `/login`, `/signup`, `/admin` 레이아웃 + 6개 메뉴, `/u/[slug]` + not-found
- 컴포넌트: ui primitives, AuthForms, Sidebar, UrlsManager, AlbumsManager, MemosManager, DecorateEditor, SettingsForm, WidgetRenderer
- 타입: `src/types/db.ts`
- 스타일: `src/styles/globals.css` (Tailwind v4 + 폰트 토큰 3종)

### 3. 실행한 명령어
- (현 단계까지는 코드 작성. `npm install` / `npm run dev` 등은 사용자 환경에서 다음 단계로 실행)

### 4. 테스트 결과
- 통과: (없음 — 자동 테스트 미구성)
- 실패: (없음)
- 미실행: TC-AUTH-*, TC-HP-*, TC-URL-*, TC-ALB-*, TC-MEMO-*, TC-DEC-*, TC-LAYOUT-*, TC-PUB-*, TC-ISO-*, TC-RET-*, TC-RWD-* (수동 1사이클 시나리오로 검증 예정)
- 수동확인 필요: README §"5) 한 사이클 시나리오" 전체

### 5. 실패 및 수정 내역
- (해당 없음)

### 6. 회귀 테스트 결과
- v0.1 초기본 → v0.2 코드 구현. 이전에 코드가 없었으므로 회귀 대상 없음.

### 7. 남은 위험 요소
- 자동화 테스트 부재 — Phase 10 후속 작업 (Vitest + Playwright 도입 권장)
- Supabase Storage Public 버킷 — 비공개 미니홈피의 이미지 URL이 유출되면 외부 접근 가능 (v2 signed URL 모델로 강화 예정)
- 비밀번호 재설정 흐름 부재 — 운영 런북 §2-3 임시 절차로 대응
- iron-session 만료 14일 고정 — 슬라이딩 만료/재발급은 v2 검토

### 8. 완료 판단
- [x] PRD §3 핵심 기능 모두 코드 작성 완료
- [x] 설계문서 §02 6테이블 + §03 모든 API + §04 9화면 매핑 일치
- [x] 단위화 가이드 §17 디렉터리 구조 준수
- [x] 오류 코드 §18 카탈로그 단일 소스 (`lib/errors/codes.ts`가 §18을 그대로 미러)
- [x] 보안 §05: `user_id` 강제 부착, `deleted_at IS NULL` 필터, 비공개=미존재 통일, 서비스 롤 키 서버 전용
- [ ] 자동 테스트 — Phase 10에서 추가 예정
- [ ] 실제 Supabase 환경에서 1사이클 통과 — 사용자 환경에서 실행 후 확인

---

## v0.9 Step 1 — UI/배치 개편 (2026-05-18)

### 1. 범위
- #1 캔버스 폭 desktop 1200→1680 / #4 편집 진입 메뉴화(`?edit=1`) / #7 메모 카드 제목만 / #9 평소모드 안내 메뉴 이동.

### 2. 실행 명령
- `npx tsc --noEmit` → 0 에러
- `npm run build` → 성공
- `npx playwright test` (Step 1 영향 범위 + 전체 회귀)

### 3. 테스트 결과
- 통과 71 / 스킵 3 / 실패 0.
- 신규 사용자 행동 E2E: `tests/e2e/step1-ui-layout.spec.ts` TC-S1-001~006 (6건) 전부 통과.
  1. 메뉴 "편집"으로 편집 모드 진입 2. "편집 끝"으로 평소 모드 복귀
  3. 홈에 평소모드 안내 텍스트 없음 4. 메뉴에 현재 레이아웃 표시
  5. 메모 카드 제목만 표시 6. 편집 캔버스 폭 1680px.
- 회귀: canvas-edit/card-categories/decorate-and-layout/drawing/albums/auth/
  fonts-and-cards/homepage-and-crud/mobile/public-page/race-regression/user-isolation 전부 통과.

### 4. 실패 및 수정 내역
- TC-CANVAS-005가 캔버스 폭 변경(1200→1680)으로 1차 실패 — 옛 1200 경계를 하드코딩.
  테스트의 카드 이동량을 새 폭(1680) 기준으로 갱신(±100칸) 후 통과.

### 5. 남은 위험 요소
- 편집 진입이 `?edit=1` 쿼리파라미터 기반 — 모바일 트랙에는 캔버스가 없어 메뉴 "편집" 항목을 `!isMobile`로 숨김.

---

## v0.9 Step 2 — 글자 크기 pt 전환 (2026-05-18)

### 1. 범위
- #2 글자 크기 enum(xs~xl) → pt 정수 전환 / #3 pt 직접 입력 + 프리셋(9·12·16·20·28).
- 마이그레이션 0008: `mini_homepages.default_font_size` text+check → integer(pt), 기존 enum값 USING 변환, default 12, check 6~96.

### 2. 실행 명령
- `npx supabase migration up` → 0008 로컬 적용
- `npx tsc --noEmit` → 0 에러 / `npm run build` → 성공
- `npx playwright test` (Step 2 영향 범위 + 전체 회귀)

### 3. 테스트 결과
- 통과 78 / 스킵 3 / 실패 0.
- 신규 사용자 행동 E2E: `tests/e2e/step2-font-pt.spec.ts` TC-S2-001~006 (6건) 전부 통과.
  1. pt 직접 입력 → 즉시 반영 2. 프리셋 20pt → 카드 20pt 3. "전역" 복귀 → 12pt
  4. 꾸미기 전역 글자크기 변경 → 미리보기 반영 5. 저장 후 새로고침 유지
  6. 신규 홈피 전역 기본 12pt(마이그 default).
- 회귀: 전체 12스펙 통과.

### 4. 실패 및 수정 내역
- TC-CANVAS-006이 글자크기 select 제거로 영향 — 테스트를 pt number input(`fill('40')`)
  기준으로 갱신, `selectCard` 헬퍼 셀렉터를 `[aria-label="카드 글자 크기(pt)"]`로 변경.

### 5. 남은 위험 요소
- 옛 enum 문자열 fontSize가 남은 layouts JSONB는 `normalizeBlock`/`toPt`가 pt로 변환 —
  마이그 0008은 컬럼만 변환하고 JSONB는 로드 시 보정.

