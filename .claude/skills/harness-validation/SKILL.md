---
name: harness-validation
description: 본 미니홈피 프로젝트의 현재 Phase에 필요한 하네스(단위/통합/UI 흐름/회귀/보안/설계 준수/단위화/문서 관리/오류 응답/기능 목록/실행/Hooks)를 순차 실행하고, 결과를 `docs/08_VALIDATION_LOG.md`에 누적한다.
---

# harness-validation

## 사용 시점

- 각 Step/Phase 종료 직전
- 배포 전(`/release-check`와 함께)

## 동작

1. `docs/10_CURRENT_STATE.md`에서 현재 Phase 확인
2. `docs/05_HARNESS_PLAN.md` §2에서 필수 하네스 목록 가져오기
3. 각 하네스 문서(`docs/harness/*.md`) 체크리스트 실행
4. 보안/개인정보 하네스(`docs/harness/05`)는 모든 Phase에서 강제 적용
5. TC-AUTH/HP/URL/ALB/MEMO/DEC/LAYOUT/PUB/ISO/RET/RWD 중 해당 Phase에 매핑된 것 실행
6. 결과를 §48 양식으로 `docs/08_VALIDATION_LOG.md`에 회차 단위로 추가

## 출력

- 통과 / 실패 / 미실행 / 수동확인필요 카운트
- 실패 항목 상세
- 다음 단계 권장 (수정-재검증 or 다음 Phase 진입)
