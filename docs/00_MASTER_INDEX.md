---
상태: Approved
버전: v0.1
마지막 수정일: 2026-05-12
문서 목적: 운영 / 문서 인덱스
---

# 문서 인덱스 (Master Index)

본 미니홈피 프로젝트의 모든 문서 입구이다. Claude Code는 모든 작업 시작 전 이 문서를 먼저 읽는다.

## 기준 문서 (Approved)

- [docs/00_PRD.md](00_PRD.md) — 서비스 기획
- [docs/01_ARCHITECTURE.md](01_ARCHITECTURE.md) — 전체 아키텍처 + 폴더 구조
- [docs/02_DATABASE_DESIGN.md](02_DATABASE_DESIGN.md) — DB 구조 (테이블·컬럼·인덱스·소프트 삭제·layout_slots)
- [docs/03_API_DESIGN.md](03_API_DESIGN.md) — API 목록·요청/응답·실패 코드
- [docs/04_UI_FLOW.md](04_UI_FLOW.md) — 9개 화면 구성
- [docs/17_MODULEIZATION_GUIDE.md](17_MODULEIZATION_GUIDE.md) — 단위화/모듈화 기준
- [docs/18_ERROR_CODE_RESPONSE_STANDARD.md](18_ERROR_CODE_RESPONSE_STANDARD.md) — 오류 코드/응답 표준

## 구현 관리 문서

- [docs/07_PHASE_PLAN.md](07_PHASE_PLAN.md) — Phase 0~10 개발 순서
- [docs/10_CURRENT_STATE.md](10_CURRENT_STATE.md) — 현재 진행 상황
- [docs/11_SESSION_HANDOFF.md](11_SESSION_HANDOFF.md) — 세션 인수인계
- [docs/19_FEATURE_CATALOG.md](19_FEATURE_CATALOG.md) — 구현 기능 목록
- [phases/index.json](../phases/index.json) — Phase 실행 상태 JSON

## 하네스 문서

- [docs/05_HARNESS_PLAN.md](05_HARNESS_PLAN.md) — 하네스 계획
- [docs/06_TEST_CASES.md](06_TEST_CASES.md) — 테스트 케이스 카탈로그
- [docs/harness/00_HARNESS_OVERVIEW.md](harness/00_HARNESS_OVERVIEW.md)
- [docs/harness/01_UNIT_TEST_HARNESS.md](harness/01_UNIT_TEST_HARNESS.md)
- [docs/harness/02_API_DB_HARNESS.md](harness/02_API_DB_HARNESS.md)
- [docs/harness/03_UI_FLOW_HARNESS.md](harness/03_UI_FLOW_HARNESS.md)
- [docs/harness/04_REGRESSION_HARNESS.md](harness/04_REGRESSION_HARNESS.md)
- [docs/harness/05_SECURITY_PRIVACY_HARNESS.md](harness/05_SECURITY_PRIVACY_HARNESS.md) — 사용자 데이터 분리 + 공개/비공개 핵심
- [docs/harness/06_DESIGN_COMPLIANCE_HARNESS.md](harness/06_DESIGN_COMPLIANCE_HARNESS.md)
- [docs/harness/07_MODULEIZATION_HARNESS.md](harness/07_MODULEIZATION_HARNESS.md)
- [docs/harness/08_DOCUMENT_MANAGEMENT_HARNESS.md](harness/08_DOCUMENT_MANAGEMENT_HARNESS.md)
- [docs/harness/09_ERROR_RESPONSE_HARNESS.md](harness/09_ERROR_RESPONSE_HARNESS.md)
- [docs/harness/10_FEATURE_CATALOG_HARNESS.md](harness/10_FEATURE_CATALOG_HARNESS.md)
- [docs/harness/11_EXECUTION_HARNESS.md](harness/11_EXECUTION_HARNESS.md)
- [docs/harness/12_CLAUDE_HOOKS_HARNESS.md](harness/12_CLAUDE_HOOKS_HARNESS.md)

## 운영 문서 (Draft — 실제 운영 환경 확정 시 Approved)

- [docs/13_ENVIRONMENT_SETUP.md](13_ENVIRONMENT_SETUP.md)
- [docs/14_BACKUP_ROLLBACK_PLAN.md](14_BACKUP_ROLLBACK_PLAN.md)
- [docs/15_RELEASE_CHECKLIST.md](15_RELEASE_CHECKLIST.md)
- [docs/16_OPERATION_RUNBOOK.md](16_OPERATION_RUNBOOK.md)

## 로그/기록 문서 (Draft — 상시 갱신)

- [docs/08_VALIDATION_LOG.md](08_VALIDATION_LOG.md)
- [docs/09_CHANGELOG.md](09_CHANGELOG.md)
- [docs/12_DESIGN_CHANGE_REQUESTS.md](12_DESIGN_CHANGE_REQUESTS.md)

## 메타 문서

- [docs/meta/00_DOCUMENT_MANAGEMENT_RULES.md](meta/00_DOCUMENT_MANAGEMENT_RULES.md)
- [docs/meta/01_SKILL_USAGE_MAP.md](meta/01_SKILL_USAGE_MAP.md)

## Claude Code 운영 자원

- [.claude/settings.json](../.claude/settings.json)
- [.claude/commands/harness.md](../.claude/commands/harness.md)
- [.claude/commands/review.md](../.claude/commands/review.md)
- `.claude/skills/{project-bootstrap,phase-step-planner,design-compliance-review,modularization-review,harness-validation,error-response-standard,feature-catalog-update,document-management,release-check,session-handoff,bridge-orchestration}/SKILL.md`

## AI/RAG 문서

v1 범위에 없음. 추후 도입 시 `docs/ai/` 폴더를 신규 생성한다.

## 최신 상태

- 현재 Phase: **Phase 0 완료 / Phase 1 진입 대기**
- 최신 문서 버전: v0.1
- 마지막 업데이트: 2026-05-12
