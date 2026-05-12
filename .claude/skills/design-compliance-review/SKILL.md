---
name: design-compliance-review
description: 본 미니홈피 프로젝트의 코드/문서 변경이 설계문서 범위 안에 있는지 검사한다. PRD §7 제외 기능(AI, 드래그앤드롭, 태그, 댓글 등), 화면 9종 화이트리스트, 테이블 6종 화이트리스트, API/위젯/카드/폰트/레이아웃 enum 위반을 차단한다.
---

# design-compliance-review

## 사용 시점

- 새 기능/파일을 추가하기 직전
- PR/커밋 직전
- 사용자가 "이것도 추가하면 어떨까?"라고 제안한 직후

## 동작

1. `docs/00_PRD.md` §3 핵심 기능 + §7 제외 기능 확인
2. `docs/04_UI_FLOW.md` §1 9개 화면 화이트리스트 비교
3. `docs/02_DATABASE_DESIGN.md` 6 테이블/컬럼 enum 비교
4. `docs/03_API_DESIGN.md` 엔드포인트 화이트리스트 비교
5. `docs/harness/06_DESIGN_COMPLIANCE_HARNESS.md` 체크리스트 실행

## 규칙

- 화이트리스트 밖이면 → 코드 작성 금지 → `docs/12_DESIGN_CHANGE_REQUESTS.md`에 제안 작성
- 제외 기능을 우회 구현하려는 시도(예: 댓글을 "메모"로 위장)도 차단
- 기존 API/테이블/컬럼 시그니처 변경은 변경 제안 후에만

## 출력

- Pass/Fail 요약
- Fail이면 어떤 화이트리스트 위반인지 + 어디에 제안서를 작성할지 안내
