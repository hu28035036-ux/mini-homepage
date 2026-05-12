---
description: 본 미니홈피 프로젝트의 변경 사항을 v7.1 게이트 0~11로 리뷰한다.
---

# /review — 변경 사항 리뷰

본 명령은 최근 변경(미커밋 또는 최근 커밋)을 v7.1 자체 검증 게이트로 리뷰한다.

## 절차

1. `git status` + `git diff`로 변경 파일 목록을 파악한다.
2. 변경된 파일이 어느 영역(UI / Service / Repository / Validator / Errors / Auth / Storage / Util / Tests / 문서)에 속하는지 분류한다.
3. 각 영역의 하네스 체크리스트(`docs/harness/*.md`)를 적용한다.
4. 본 프로젝트의 결정적 규칙 8개를 우선 점검한다:
   - SUPABASE_SERVICE_ROLE_KEY가 클라이언트에 노출되지 않는가
   - `is_public` 기본값이 `false`로 유지되는가
   - 모든 repository 쿼리에 `user_id`와 `deleted_at IS NULL`이 부착되는가
   - 비공개와 미존재가 동일 응답으로 통일되는가 (`HOMEPAGE_PRIVATE_OR_NOT_FOUND`)
   - 자동 삭제 작업/스케줄러가 추가되지 않았는가
   - 응답이 `lib/errors/response.ts`로만 생성되는가
   - 단일 소스 원칙(§18 / §19 / §02) 위반이 없는가
   - PRD §7 제외 기능이 추가되지 않았는가
5. 발견 사항을 카테고리별로 요약하고, 즉시 수정 vs 별도 작업 vs 정상 분류한다.
6. 결과를 `docs/08_VALIDATION_LOG.md`에 회차 단위로 기록한다.

## 출력

- 변경 요약 (파일 수, 영역별 분류)
- 발견 사항 (Critical / Major / Minor)
- 즉시 수정 권장 항목
- 게이트 통과 여부
