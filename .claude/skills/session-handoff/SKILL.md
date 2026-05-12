---
name: session-handoff
description: 본 미니홈피 프로젝트의 세션 종료 시 `docs/11_SESSION_HANDOFF.md`를 다음 세션이 그대로 이어받을 수 있도록 갱신한다. 이전 세션 요약, 다음 Phase 진입 지시문(§49 템플릿), 주의사항 8개, 미해결 결정 항목을 포함.
---

# session-handoff

## 사용 시점

- 작업 세션 종료 직전
- 다른 사람/세션에 작업을 넘길 때

## 동작

1. 현재 Phase와 완료 Step을 `phases/index.json`에서 확인
2. `docs/10_CURRENT_STATE.md` 갱신:
   - 현재 Phase / 다음 Phase
   - 최근 완료 작업
   - 다음 작업
   - 알려진 위험
3. `docs/11_SESSION_HANDOFF.md` 갱신:
   - 이전 세션 요약(작업 기간, 산출물, 결정 사항)
   - 다음 세션 시작 시 진행 절차(문서 확인 순서)
   - Phase N 진입 지시문 템플릿(§49 형식, 본 프로젝트 결정적 제약 8개 포함)
   - 주의사항(서비스 롤 키, is_public 기본, user_id+deleted_at, 비공개=미존재 통일, 자동 삭제 금지, 응답 헬퍼 사용, 단일 소스, 제외 기능)
   - 미해결 결정 항목
4. `docs/09_CHANGELOG.md`에 세션 변경 요약 1줄 추가

## 출력

- 갱신 완료 보고
- 다음 세션 시작 명령 예시
