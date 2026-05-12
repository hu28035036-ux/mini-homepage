---
name: document-management
description: 본 미니홈피 프로젝트의 `docs/00_MASTER_INDEX.md`, `docs/10_CURRENT_STATE.md`, `docs/11_SESSION_HANDOFF.md`, `docs/09_CHANGELOG.md`를 최신 상태로 유지한다. 각 문서 헤더(상태/버전/마지막 수정일/문서 목적) 확인, Draft/Deprecated 사용 금지, 단일 소스(SoT) 원칙 위반 검출.
---

# document-management

## 사용 시점

- Phase 시작/종료 시
- 설계 변경 후
- 세션 종료 직전

## 동작

1. 모든 `docs/**/*.md`에 4행 헤더가 있는지 grep
2. `MASTER_INDEX`가 모든 `docs/`와 `docs/harness/`, `docs/meta/` 파일을 가리키는지 비교
3. `CURRENT_STATE`의 Phase가 실제 `phases/index.json`과 일치하는지 확인
4. `SESSION_HANDOFF`에 다음 세션 지시문(§49 템플릿)이 포함되는지 확인
5. Draft/Deprecated 문서를 구현 기준으로 참조하고 있는 코드/문서가 없는지 grep
6. 단일 소스 위반 검사:
   - 오류 코드가 §18 외 다른 문서에 재정의되어 있지 않은가
   - 기능 목록이 §19 외 다른 문서에 중복되어 있지 않은가
   - `layout_slots` 정의가 §02 외 다른 문서에 재정의되어 있지 않은가
7. 변경이 있으면 `CHANGELOG`에 한 줄 추가

## 출력

- 갱신된 문서 목록
- 불일치/누락 경고
