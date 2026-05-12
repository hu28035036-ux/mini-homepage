---
상태: Approved
버전: v0.1
마지막 수정일: 2026-05-12
문서 목적: 하네스 / 기능 목록
---

# 기능 목록 (FEATURE_CATALOG) 하네스

`docs/19_FEATURE_CATALOG.md`가 현재 구현 상태를 정확히 반영하는지 확인한다.

## 체크리스트

- [ ] PRD §3의 모든 핵심 기능이 FEATURE_CATALOG에 행으로 존재하는가?
- [ ] 각 기능에 `Status`(Planned/In Progress/Active/Deprecated)가 기록되어 있는가?
- [ ] 각 기능에 `Tested`(Untested/Passing/Failing)가 기록되어 있는가?
- [ ] 새 기능을 추가/수정한 Phase가 종료될 때 카탈로그가 함께 갱신되었는가?
- [ ] 테스트하지 않은 기능을 `Tested=Passing` 또는 `Status=Active`로 표시하지 않았는가?
- [ ] 폐기/삭제 기능을 문서에서 지우지 않고 `Status=Deprecated`로 관리하는가?
- [ ] 각 기능의 위치(API 경로, 테이블, 컴포넌트)가 정확한가?
- [ ] 각 기능에 연결된 테스트 케이스 ID가 명시되어 있는가?
