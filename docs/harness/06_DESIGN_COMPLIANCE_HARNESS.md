---
상태: Approved
버전: v0.1
마지막 수정일: 2026-05-12
문서 목적: 하네스 / 설계문서 준수
---

# 설계문서 준수 하네스

이번 변경이 설계문서 범위 안에 있는지, 설계문서 밖 기능을 임의로 추가하지 않았는지 확인한다.

## 1. 허용 범위 화이트리스트

### 1-1. 허용 테이블 (정확히 6종)

`users`, `mini_homepages`, `urls`, `album_categories`, `photos`, `memos`.

이외 테이블 추가는 **`docs/12_DESIGN_CHANGE_REQUESTS.md`에 제안 후 승인**되어야 한다.

### 1-2. 허용 화면 (정확히 9종)

`docs/04_UI_FLOW.md` §1의 9개 경로. 추가 화면은 위와 동일 절차.

### 1-3. 허용 API 화이트리스트

`docs/03_API_DESIGN.md` §3 표의 엔드포인트만 허용. 신규 엔드포인트는 설계 변경 요청 후 추가.

### 1-4. 허용 위젯 enum

`profile`, `urls`, `albums`, `memos`, `empty`. 추가 위젯은 §02 §4와 본 문서를 함께 갱신.

### 1-5. 허용 카드 스타일 / 폰트 / 레이아웃 모드

- `card_style`: `basic`, `rounded`, `shadow`, `transparent`
- `font_style`: `default`, `rounded`, `emotional`
- `layout_mode`: `single`, `double`

추가는 §02 §3-2 enum 갱신 + 본 문서 갱신.

## 2. 체크리스트

- [ ] 이번 변경이 위 §1 화이트리스트 안에 있는가?
- [ ] PRD §7 제외 기능을 구현하지 않았는가? (드래그앤드롭, 태그, 댓글, 좋아요, 방명록, AI 등)
- [ ] 설계문서에 없는 새 DB 컬럼/테이블을 임의로 추가하지 않았는가?
- [ ] 기존 화면/메뉴명·API 경로·URL 스킴을 임의로 바꾸지 않았는가?
- [ ] 범위 밖 리팩토링이 이번 변경에 섞이지 않았는가?
- [ ] 설계 변경이 필요하면 코드가 아니라 `docs/12_DESIGN_CHANGE_REQUESTS.md`에 먼저 제안했는가?
