---
상태: Draft
버전: v0.1
마지막 수정일: 2026-05-12
문서 목적: 운영 / 세션 인수인계
---

# 세션 인수인계

다음 Claude Code 세션이 이어받을 수 있도록 현재까지의 작업, 다음 작업, 주의사항을 정리한다.

## 1. 이전 세션 요약

- 작업 기간: 2026-05-12
- 산출물: Phase 0 표준 문서 세트 전체 (`docs/**`, `.claude/**`, `phases/**`)
- 참조 표준: `C:\Users\user\Desktop\개발\ralph_loop_standard_dev_doc_v7_1_codex_checked.md` (Ralph Loop v7.1)
- 본 프로젝트 v1 핵심 결정:
  - 스택: Next.js + Tailwind + Supabase Postgres/Storage
  - 인증: **자체 회원가입 시스템 (Supabase Auth 미사용)**
  - AI: **v1 미포함** (`docs/ai/` 미생성)
  - 꾸미기: 색·카드·폰트·배경 + 레이아웃 single/double + 슬롯별 위젯 배치 (드래그앤드롭 없음)
  - 공개/비공개: 서버에서 검증, 비공개=미존재 동일 응답

## 2. 다음 세션 시작 시 진행 절차

### 2-1. 문서 확인 순서 (필수)

```text
1. docs/00_MASTER_INDEX.md
2. docs/10_CURRENT_STATE.md (현재 Phase 확인)
3. docs/11_SESSION_HANDOFF.md (본 문서)
4. docs/00_PRD.md
5. docs/01_ARCHITECTURE.md
6. docs/07_PHASE_PLAN.md (Phase 1 세부 step)
7. docs/06_TEST_CASES.md (Phase 1 관련 케이스 미리 확인)
8. docs/13_ENVIRONMENT_SETUP.md (실제 셋업 시작용)
9. docs/harness/05_SECURITY_PRIVACY_HARNESS.md (모든 Phase에서 적용)
```

### 2-2. Phase 1 진입 지시문 템플릿 (v7.1 §49 형식)

다음 메시지를 사용자가 다음 세션에 그대로 전달해도 작동하도록 구성.

```text
이번 작업은 Phase 1 — 개발 환경 및 기본 구조 세팅이다.

반드시 아래 순서로 진행해라.

1. 관련 문서를 먼저 읽어라.
   - docs/00_MASTER_INDEX.md
   - docs/10_CURRENT_STATE.md
   - docs/11_SESSION_HANDOFF.md
   - docs/00_PRD.md
   - docs/01_ARCHITECTURE.md
   - docs/13_ENVIRONMENT_SETUP.md
   - docs/17_MODULEIZATION_GUIDE.md
   - docs/18_ERROR_CODE_RESPONSE_STANDARD.md
   - docs/07_PHASE_PLAN.md (Phase 1 섹션)

2. Phase 1 작업 범위를 정리해라.
   - Next.js + TypeScript + Tailwind 프로젝트 생성
   - src/ 폴더 골격 (UI/Service/Repository/Validator/Errors/Auth/Storage/Util/Types/Tests)
   - Supabase 클라이언트 + Storage 버킷 안내
   - .env.local.example 커밋, .env.local 비커밋
   - lib/errors/{codes,response}.ts 스텁

3. 구현 전 성공 기준과 금지사항을 체크리스트로 작성해라.

4. 설계문서 준수 하네스(docs/harness/06)와 단위화 하네스(docs/harness/07)를 먼저 확인해라.
   - 설계문서 밖 기능 추가 금지
   - 한 파일 200줄 초과 시 분해

5. AI/Supabase Auth는 사용하지 않는다. 자체 회원가입 시스템을 Phase 2에서 만들 예정이다.

6. 구현 후 자체 검증 게이트 0/1/2/6/7/8/11/13을 수행해라.

7. 미실행 테스트는 통과로 표시하지 마라.

8. 완료 전 아래 문서를 업데이트해라.
   - docs/08_VALIDATION_LOG.md
   - docs/09_CHANGELOG.md
   - docs/10_CURRENT_STATE.md
   - docs/11_SESSION_HANDOFF.md
   - phases/index.json + phases/1-env-and-skeleton/

9. 다음 Phase로 넘어가기 전 모든 필수 항목이 통과해야 한다.
```

## 3. 주의사항 (인계 시 강조)

1. **`SUPABASE_SERVICE_ROLE_KEY`는 절대 `NEXT_PUBLIC_*`로 노출하지 말 것.**
2. **`mini_homepages.is_public` 기본값은 항상 `false`. 변경 금지.**
3. **모든 repository 쿼리에 `user_id`와 `deleted_at IS NULL`을 자동 부착.**
4. **비공개와 미존재(`HOMEPAGE_PRIVATE_OR_NOT_FOUND`)를 동일 응답으로 통일.**
5. **자동 삭제 작업/스케줄러 추가 금지.**
6. **응답은 `lib/errors/response.ts`로만 생성. `Response.json` 직접 호출 금지.**
7. **단일 소스 원칙 — 오류 코드는 §18에만, 기능 목록은 §19에만, 레이아웃 데이터 모델은 §02에만 정의.**
8. **AI/RAG/챗봇 등 PRD §7 제외 기능을 임의로 추가하지 말 것.**

## 4. 미해결 결정 사항 (Phase 1~2에서 결정)

- 세션 라이브러리: `iron-session` vs `jose`. Phase 2 진입 시 결정 후 `docs/13_ENVIRONMENT_SETUP.md`에 기록.
- 테스트 프레임워크: Vitest 권장. Phase 1 종료 전 도입.
- 폼 검증: zod + react-hook-form 조합 권장.

## 5. 마지막 업데이트

2026-05-12. 다음 세션은 Phase 1로 진입.
