---
상태: Approved
버전: v0.1
마지막 수정일: 2026-05-12
문서 목적: 운영 / 문서 관리 기준
---

# 문서 관리 규칙

이 문서는 본 미니홈피 프로젝트의 모든 문서가 따라야 하는 헤더, 상태, 버전, 업데이트 타이밍, Claude Code 읽기 순서를 정의한다. Ralph Loop v7.1 §29의 표준을 본 프로젝트에 맞춰 적용한다.

## 1. 문서 원본과 보관본

- 문서 원본은 Markdown(`.md`)로 관리한다.
- DOCX/PDF는 공유/보관용 출력본이며, 기준 문서가 아니다.
- Claude Code가 읽는 기준 문서는 Markdown이다.

## 2. 모든 문서 공통 헤더

모든 `docs/**/*.md`는 첫 줄에 아래 형식의 frontmatter형 헤더를 부착한다.

```md
---
상태: Approved
버전: v0.1
마지막 수정일: 2026-05-12
문서 목적: 설계 기준 / 하네스 / 운영 / 기능 목록 등
---
```

## 3. 문서 상태값

| 상태 | 의미 |
|---|---|
| Draft | 작성 중. 구현 기준으로 사용 금지. |
| Approved | 기준 문서로 사용 가능. |
| Updating | 수정 중. 변경 범위 확인 후 사용. |
| Deprecated | 폐기/참고용. 구현 기준으로 사용 금지. |

본 프로젝트 v0.1 초기 상태:
- 설계 기준 문서(PRD/ARCHITECTURE/DB/API/UI/MODULEIZATION/ERROR_CODE) → `Approved`
- 하네스/테스트/Skill Usage Map → `Approved`
- 운영 문서(ENV/BACKUP/RELEASE/OPERATION) → `Draft` (실제 운영 환경 확정 시 `Approved`로 전환)
- 로그류(VALIDATION_LOG/CHANGELOG/CURRENT_STATE/SESSION_HANDOFF/DESIGN_CHANGE_REQUESTS) → `Draft`(상시 갱신)

## 4. 문서 버전 규칙

```text
v0.1 = Phase 0 초기 기준본
v0.x = Phase 진행에 따른 추가 보강
v1.0 = 첫 배포(Phase 12 완료) 시점 기준본
v1.x = 운영 중 작은 변경
v2.0 = 구조 큰 변경
```

이전 버전은 `docs/archive/`(현재는 미생성)에 보관한다. v1.0 발표 시점에 archive 폴더를 만든다.

## 5. Claude Code 문서 읽기 순서

Claude Code는 작업 시작 전 아래 순서로 문서를 확인한다.

```text
1. docs/00_MASTER_INDEX.md
2. docs/10_CURRENT_STATE.md
3. docs/11_SESSION_HANDOFF.md
4. docs/00_PRD.md
5. docs/01_ARCHITECTURE.md
6. 이번 작업과 관련된 DB/API/UI 문서
7. 관련 하네스 문서
8. docs/06_TEST_CASES.md
9. docs/19_FEATURE_CATALOG.md
10. docs/08_VALIDATION_LOG.md
```

## 6. 문서 업데이트 타이밍

- **프로젝트 시작 전**: PRD, ARCHITECTURE, DB/API/UI 설계, HARNESS_PLAN, DOCUMENT_MANAGEMENT_RULES.
- **각 Phase 시작 전**: PHASE_PLAN, TEST_CASES, FEATURE_CATALOG에서 기존 기능 확인.
- **각 Phase 종료 후**: CURRENT_STATE, VALIDATION_LOG, CHANGELOG, SESSION_HANDOFF, FEATURE_CATALOG.
- **설계 변경 시**: DESIGN_CHANGE_REQUESTS 작성 → 승인 후 관련 설계/하네스/테스트 수정.
- **배포 전**: RELEASE_CHECKLIST 갱신, BACKUP_ROLLBACK_PLAN 확인, OPERATION_RUNBOOK 갱신.

## 7. 단일 소스(SoT) 원칙

| 정보 | 단일 소스 |
|---|---|
| 화면 목록 | `docs/04_UI_FLOW.md` |
| 테이블/컬럼 정의 | `docs/02_DATABASE_DESIGN.md` |
| 위젯 레이아웃 데이터 모델 | `docs/02_DATABASE_DESIGN.md` (`mini_homepages.layout_slots`) |
| API 목록·실패 코드 매핑 | `docs/03_API_DESIGN.md` (실패 코드 정의는 §18) |
| 오류 코드 정의 | `docs/18_ERROR_CODE_RESPONSE_STANDARD.md` |
| 기능 목록 | `docs/19_FEATURE_CATALOG.md` |
| Phase/Step 실행 상태 | `phases/index.json` 및 `phases/{phase}/index.json` |

다른 문서는 위 소스를 참조만 하고, 동일 정의를 재선언하지 않는다.

## 문서 관리 전용 하네스

- [ ] `docs/00_MASTER_INDEX.md`가 최신인가?
- [ ] 현재 Phase가 `docs/10_CURRENT_STATE.md`에 기록되어 있는가?
- [ ] 이전 작업 내용이 `docs/11_SESSION_HANDOFF.md`에 기록되어 있는가?
- [ ] 모든 문서에 상태값/버전/마지막 수정일이 있는가?
- [ ] Draft/Deprecated 문서를 기준으로 구현하지 않았는가?
- [ ] 설계 변경이 `docs/12_DESIGN_CHANGE_REQUESTS.md`에 기록되었는가?
- [ ] 관련 하네스/테스트가 업데이트되었는가?
- [ ] `docs/08_VALIDATION_LOG.md`, `docs/09_CHANGELOG.md`, `docs/10_CURRENT_STATE.md`, `docs/11_SESSION_HANDOFF.md`가 최신 상태인가?
