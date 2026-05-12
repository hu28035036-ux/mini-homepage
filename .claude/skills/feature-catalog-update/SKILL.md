---
name: feature-catalog-update
description: 본 미니홈피 프로젝트의 `docs/19_FEATURE_CATALOG.md`를 코드 변경에 맞춰 갱신한다. 새 기능 행 추가/기존 기능 Status·Tested 갱신/폐기 기능 Deprecated 처리. 테스트하지 않은 기능을 Passing으로 표기하지 못하게 차단.
---

# feature-catalog-update

## 사용 시점

- 새 기능 구현 후
- 기능을 폐기/비활성화한 직후
- Phase 종료 직전

## 동작

1. 변경된 코드/API/테이블/컴포넌트를 식별
2. `docs/19_FEATURE_CATALOG.md`에서 해당 기능을 찾거나 새 행 추가
3. 컬럼 갱신:
   - `위치`(파일 경로), `API`, `테이블`, `권한`, `TC`(테스트 케이스 ID), `상태`, `테스트`
4. 실제 테스트가 통과한 경우에만 `Passing`으로 표시
5. 폐기 기능은 행 삭제 금지, `Status=Deprecated`로 유지
6. PRD §3 핵심 기능이 모두 행으로 존재하는지 회귀 확인

## 출력

- 갱신된 행 목록
- 누락/불일치 경고
