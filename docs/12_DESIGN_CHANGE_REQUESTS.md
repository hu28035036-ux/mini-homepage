---
상태: Draft
버전: v0.1
마지막 수정일: 2026-05-12
문서 목적: 운영 / 설계 변경 요청
---

# 설계 변경 요청 (Design Change Requests)

설계문서 범위 밖의 변경이 필요하다고 판단되면, 코드를 먼저 수정하지 말고 본 문서에 제안만 기록한다. 승인되면 관련 설계문서/하네스/테스트를 수정한 뒤 구현으로 진행한다.

## 기록 양식

```md
## DCR-YYYYMMDD-NN [제목]

### 1. 배경
이 변경이 필요한 이유 / 발견 경위.

### 2. 제안 내용
무엇을 어떻게 바꿀지. 영향 받는 문서 목록(PRD/Architecture/DB/API/UI/Error Code/Feature Catalog 등).

### 3. 대안
다른 접근 방식과 트레이드오프.

### 4. 위험
호환성, 보안, 사용자 경험에 미치는 영향.

### 5. 검증 계획
어떤 테스트로 안전성을 확인할지.

### 6. 상태
- [ ] 제안
- [ ] 검토 중
- [ ] 승인
- [ ] 반영 완료
- [ ] 반려

### 7. 결정 사유
승인/반려 시 한 단락.
```

---

## 진행 중 / 보류 항목

(현재 없음)

---

## 종결된 항목

### DCR-20260519-01 글자 크기 enum → pt 단위 전환

- **배경**: 소유자 요청 — 카드 글자 크기를 5단계 enum 대신 pt 직접 입력.
- **제안**: `FontSize`를 number(pt)로, `mini_homepages.default_font_size`를 text+check
  enum → integer(pt 6~96, 기본 12). 마이그 0008에서 기존 enum값 USING 변환.
- **영향 문서**: DB §3-2, Feature Catalog. **위험**: 옛 layouts JSONB 문자열 fontSize는
  `normalizeBlock`/`toPt`가 로드 시 pt로 변환해 호환.
- **검증**: E2E `step2-font-pt.spec.ts` 6건 + 전체 회귀.
- **상태**: [x] 반영 완료 (2026-05-18). 소유자 직접 요청, 비파괴 마이그.

### DCR-20260519-02 메모·URL 카테고리 도입

- **배경**: 소유자 요청 — 앨범처럼 메모·URL도 카테고리 분류 + 카드별 표시 카테고리 선택.
- **제안**: 신규 테이블 없이(6테이블 화이트리스트 유지) `mini_homepages`에
  `memo_categories`·`url_categories` JSONB, `memos`·`urls`에 `category_id text`
  (마이그 0009, 카드 카테고리 0007과 동일 패턴). `/api/memos/categories`·
  `/api/urls/categories` 신규.
- **영향 문서**: DB §3-2·3-3·3-6, API, Error Code §3-4·3-6, Feature Catalog.
- **대안**: 별도 테이블 — 6테이블 화이트리스트 위반이라 기각.
- **위험**: `category_id`는 느슨한 참조(FK 없음) — dangling은 UI에서 "미분류" 표시.
- **검증**: E2E `step3`(API 6)·`step4`(관리 UI 6)·`step5`(카드 표시 6) + 전체 회귀.
- **상태**: [x] 반영 완료 (2026-05-19). 소유자 직접 요청, 기존 패턴으로 확장.
