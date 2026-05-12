# Phase 0 / Step 0 — 프로젝트 기준 문서 세트 작성

## 1. 읽어야 할 문서

- `C:\Users\user\Desktop\개발\ralph_loop_standard_dev_doc_v7_1_codex_checked.md` (표준 원본 v7.1)
- 사용자 스펙 13개 섹션 (Phase 0 진입 대화에서 받음)

## 2. 이전 Step에서 확인할 파일

- 없음 (이 프로젝트의 첫 Step)

## 3. 작업 범위

본 미니홈피 서비스 v1을 위한 Ralph Loop v7.1 표준 문서 세트 전체를 생성한다. 코드는 작성하지 않는다.

- `docs/` (00~19, harness/00~12, meta/00~01)
- `.claude/` (settings.json + commands 2개 + skills 11개)
- `phases/` (index.json + 0-project-setup/{index.json, step0.md, step0-output.json})

## 4. 수정 허용 파일

- `docs/**/*.md`
- `docs/**/*.json`
- `.claude/**/*.{json,md}`
- `phases/**/*.{json,md}`

## 5. 수정 금지 파일

- `src/**` (아직 없음)
- `package.json`, `next.config.mjs`, `tailwind.config.ts`, `postcss.config.mjs`, `tsconfig.json` (Phase 1에서 생성)
- `supabase/migrations/**` (Phase 2에서 생성)
- 표준 원본 `ralph_loop_standard_dev_doc_v7_1_codex_checked.md` (참조용, 수정 금지)

## 6. 구현 지시

1. `docs/meta/00_DOCUMENT_MANAGEMENT_RULES.md`를 먼저 작성해 헤더 규칙을 확정.
2. `docs/00_MASTER_INDEX.md` 골격 작성(나중에 최종 점검).
3. PRD → Architecture → DB → API → UI 순으로 설계 문서 5종.
4. Modularization Guide + Error Code Standard.
5. Harness Plan + Test Cases + 13개 harness 문서.
6. Phase Plan + Feature Catalog.
7. 운영 문서 4종(ENV / Backup / Release / Operation).
8. 로그/상태 5종(VALIDATION_LOG / CHANGELOG / CURRENT_STATE / SESSION_HANDOFF / DESIGN_CHANGE_REQUESTS).
9. `docs/meta/01_SKILL_USAGE_MAP.md`.
10. `.claude/settings.json`, commands 2개, skills 11개.
11. `phases/index.json` 및 본 디렉터리 3종.
12. MASTER_INDEX 최종 점검.

각 문서는 v7.1의 해당 섹션 템플릿을 본 프로젝트(Next.js + Supabase + 자체 회원가입 + 꾸미기/레이아웃) 맥락으로 채운다. AI 관련 docs/ai/는 만들지 않는다.

## 7. Acceptance Criteria

- [ ] 위 §4의 모든 경로에 파일이 존재한다 (Glob으로 확인).
- [ ] 모든 `docs/**/*.md`에 `상태:`, `버전:`, `마지막 수정일:`, `문서 목적:` 4행 헤더가 있다.
- [ ] `docs/00_MASTER_INDEX.md`가 위 §4의 모든 파일을 인덱싱한다 (Grep으로 누락 없음 확인).
- [ ] `phases/index.json`, `phases/0-project-setup/index.json`, `phases/0-project-setup/step0-output.json`, `.claude/settings.json` 4개 JSON이 파싱 가능하다 (`node -e "JSON.parse(...)"` 또는 PowerShell `ConvertFrom-Json`).
- [ ] 오류 코드 정의(`docs/18`)가 다른 문서에서 재정의되지 않는다(`error_code` 정의 grep 결과 §18 외 0건).
- [ ] `layout_slots` 정의가 `docs/02_DATABASE_DESIGN.md` §4에만 있다.
- [ ] `docs/08_VALIDATION_LOG.md` Phase 0 엔트리가 완료 처리되어 있다.
- [ ] `docs/10_CURRENT_STATE.md`의 현재 Phase가 "0 완료 / 1 대기"로 기록되어 있다.
- [ ] `docs/11_SESSION_HANDOFF.md`에 Phase 1 진입 지시문(§49 템플릿)이 포함되어 있다.

## 8. 검증 게이트 (v7.1 §46)

- Gate 0 (설계문서 준수) — 본 작업은 표준 v7.1 + 사용자 스펙 범위 안에 있다.
- Gate 1 (문서/요구사항) — PRD/Architecture 등 모든 기준 문서가 작성된다.
- Gate 11 (문서 관리) — MASTER_INDEX/CURRENT_STATE/SESSION_HANDOFF/CHANGELOG가 최신.
- Gate 13 (문서화) — 본 Step의 산출 파일 목록이 `step0-output.json`에 기록된다.

다른 게이트(2~10)는 코드 작성 단계가 아니므로 본 Step에서는 비적용.

## 9. 금지사항

- AI 기능 관련 문서/Skill을 만들지 않는다 (PRD §7 제외).
- 표준 v7.1과 충돌하는 변경을 임의로 만들지 않는다 — 충돌 시 v7.1이 우선.
- Phase 1 이후의 코드/마이그레이션을 미리 작성하지 않는다.
- 운영 환경 시크릿/키를 문서에 기재하지 않는다.
