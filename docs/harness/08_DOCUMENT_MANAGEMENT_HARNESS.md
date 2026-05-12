---
상태: Approved
버전: v0.1
마지막 수정일: 2026-05-12
문서 목적: 하네스 / 문서 관리
---

# 문서 관리 하네스

`docs/meta/00_DOCUMENT_MANAGEMENT_RULES.md`의 규칙을 본 프로젝트 문서가 지키는지 확인한다.

## 체크리스트

- [ ] `docs/00_MASTER_INDEX.md`가 모든 생성 문서를 인덱싱하는가?
- [ ] 각 문서 상단에 `상태`, `버전`, `마지막 수정일`, `문서 목적` 4행 헤더가 있는가?
- [ ] 현재 Phase가 `docs/10_CURRENT_STATE.md`에 기록되어 있는가?
- [ ] 이전 세션 내용이 `docs/11_SESSION_HANDOFF.md`에 기록되어 있는가?
- [ ] Draft 또는 Deprecated 문서를 구현 기준으로 사용하지 않았는가?
- [ ] archive와 최신 문서가 구분되어 있는가? (현재 archive 미생성이지만 v1.0 시점에 분리 예정 명시)
- [ ] 설계 변경이 `docs/12_DESIGN_CHANGE_REQUESTS.md`에 기록되었는가?
- [ ] 승인되지 않은 변경을 구현하지 않았는가?
- [ ] 관련 하네스와 테스트가 업데이트되었는가?
- [ ] `VALIDATION_LOG`, `CHANGELOG`, `CURRENT_STATE`, `SESSION_HANDOFF`, `FEATURE_CATALOG`가 Phase 종료 시 업데이트되었는가?
- [ ] 단일 소스(SoT) 원칙이 지켜지는가? (오류 코드는 §18에만, 기능 목록은 §19에만, 레이아웃 데이터 모델은 §02에만)
