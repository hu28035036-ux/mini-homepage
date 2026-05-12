---
name: phase-step-planner
description: 본 미니홈피 프로젝트의 Phase를 5~8개 실행형 Step으로 분해한다. 각 Step에 읽어야 할 문서·작업 범위·수정 허용/금지 파일·실행 가능한 AC·검증 게이트·금지사항을 포함하고 `phases/{n}-{name}/` 디렉터리에 stepN.md + index.json + stepN-output.json 골격을 만든다.
---

# phase-step-planner

## 사용 시점

- 새 Phase 진입 직전(예: Phase 1 환경 세팅, Phase 7 꾸미기+레이아웃)
- 기존 Phase를 더 작은 Step으로 재분해할 때

## 동작

1. `docs/07_PHASE_PLAN.md` 해당 Phase 섹션을 읽고 세부 작업 5~8개로 분해
2. 각 Step에 다음 8개 섹션을 채움(v7.1 §35 형식):
   - 읽어야 할 문서
   - 이전 Step에서 확인할 파일
   - 작업 범위
   - 수정 허용 파일
   - 수정 금지 파일
   - 구현 지시
   - Acceptance Criteria(실행 가능한 형태: `npm run X 결과 …`, `TC-... 통과`)
   - 검증 게이트(v7.1 §46 중 적용 게이트)
3. `phases/{n}-{name}/index.json`에 Step 목록 + 상태(`planned`)
4. 각 stepN.md 생성

## 본 프로젝트 결정적 제약 (Step 작성 시 반드시 포함)

- DB 변경 시: 마이그레이션 파일을 함께 추가, `user_id` + `deleted_at` 컬럼 강제
- API 추가 시: `lib/services/`와 `lib/repositories/` 분리, `requireUser()` 호출
- 응답: `lib/errors/response.ts` 사용 + 오류 코드는 §18에서 가져오기
- 공개 페이지 관련 작업: 비공개=미존재 동일 응답 보장
- AI/RAG 관련 작업 금지(v1 제외)
