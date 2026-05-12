---
상태: Approved
버전: v0.1
마지막 수정일: 2026-05-12
문서 목적: 하네스 / 계획
---

# 하네스 계획

본 문서는 어떤 하네스를 언제 실행할지 매핑한다. 하네스 개별 내용은 `docs/harness/*.md`에, 테스트 케이스는 `docs/06_TEST_CASES.md`에 둔다.

## 1. 적용 하네스 (13종)

| # | 하네스 | 위치 | Phase 적용 |
|---|---|---|---|
| 0 | 개요 | `docs/harness/00_HARNESS_OVERVIEW.md` | 전 Phase |
| 1 | 단위 테스트 | `docs/harness/01_UNIT_TEST_HARNESS.md` | Phase 2~10 |
| 2 | API/DB 통합 | `docs/harness/02_API_DB_HARNESS.md` | Phase 2~10 |
| 3 | UI 흐름 | `docs/harness/03_UI_FLOW_HARNESS.md` | Phase 4~10 |
| 4 | 회귀 | `docs/harness/04_REGRESSION_HARNESS.md` | Phase 7~10 |
| 5 | 보안/개인정보 | `docs/harness/05_SECURITY_PRIVACY_HARNESS.md` | Phase 2~10 (모든 Phase) |
| 6 | 설계 준수 | `docs/harness/06_DESIGN_COMPLIANCE_HARNESS.md` | Phase 1~10 |
| 7 | 단위화 | `docs/harness/07_MODULEIZATION_HARNESS.md` | Phase 1~10 |
| 8 | 문서 관리 | `docs/harness/08_DOCUMENT_MANAGEMENT_HARNESS.md` | Phase 0~10 |
| 9 | 오류 응답 | `docs/harness/09_ERROR_RESPONSE_HARNESS.md` | Phase 2~10 |
| 10 | 기능 목록 | `docs/harness/10_FEATURE_CATALOG_HARNESS.md` | Phase 0~10 |
| 11 | 실행형 Phase/Step | `docs/harness/11_EXECUTION_HARNESS.md` | Phase 0~10 |
| 12 | Claude Hooks | `docs/harness/12_CLAUDE_HOOKS_HARNESS.md` | Phase 0~10 |

## 2. Phase별 필수 하네스

| Phase | 필수 하네스 | 핵심 게이트 (§46) |
|---|---|---|
| Phase 0 (문서 작성) | 6, 8, 10, 11 | 0, 1, 11, 13 |
| Phase 1 (환경 세팅) | 6, 7, 8 | 0, 1, 2, 11 |
| Phase 2 (인증) | 1, 2, 5, 6, 7, 8, 9 | 0~9 |
| Phase 3 (미니홈피 생성) | 1, 2, 5, 6, 7, 8, 9 | 0~9 |
| Phase 4 (URL) | 1, 2, 3, 5, 6, 7, 8, 9, 10 | 0~10 |
| Phase 5 (앨범/사진) | 1, 2, 3, 5, 6, 7, 8, 9, 10 | 0~10 |
| Phase 6 (메모) | 1, 2, 3, 5, 6, 7, 8, 9, 10 | 0~10 |
| Phase 7 (꾸미기+레이아웃) | 1, 2, 3, 5, 6, 7, 8, 9, 10 | 0~10 |
| Phase 8 (설정) | 1, 2, 3, 5, 6, 7, 8, 9, 10 | 0~10 |
| Phase 9 (공개 페이지) | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 | 0~11 |
| Phase 10 (회귀/마감) | 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 | 0~11, 13 |

게이트 12·13은 Codex 위임 도입 시 활성화(v1 미사용).

## 3. 완료 조건

- 필수 하네스가 모두 통과해야 해당 Phase를 완료로 판단한다.
- 실패한 항목은 §47 반복 횟수 기준에 따라 수정-재검증을 반복한다.
- 미실행 테스트를 "통과"로 표시하지 않는다.
- Phase 종료 시 `docs/08_VALIDATION_LOG.md`에 결과 기록.
