---
상태: Approved
버전: v0.1
마지막 수정일: 2026-05-12
문서 목적: 운영 / Skill 사용 매핑
---

# Skill Usage Map

본 미니홈피 프로젝트에서 사용 가능한 Claude Code Skill과 사용 시점을 정의한다. v7.1 §4-1 표를 본 프로젝트에 맞게 좁힌다. AI 관련 Skill 2종(`rag-first-ai-design`, `ai-agent-decision`)은 v1에 사용하지 않으며, AI 도입 시 추가한다.

## 1. 적용 Skill

| 작업 상황 | Skill | 목적 |
|---|---|---|
| 새 프로젝트 시작/초기 문서 세트 | `project-bootstrap` | 표준 문서 구조를 본 프로젝트에 적용 |
| 큰 작업을 Phase/Step으로 분해 | `phase-step-planner` | 실행형 Step·수정 허용/금지 파일·AC 작성 |
| 설계문서 범위 준수 검토 | `design-compliance-review` | 설계문서 밖 기능 차단 |
| 코드 단위화/모듈화 검토 | `modularization-review` | UI/Service/Repository/Validator/Schema/Test 분리 점검 |
| 구현 후 하네스 검증 | `harness-validation` | 하네스/테스트/검증 로그/문서 갱신 확인 |
| 오류 응답 표준 적용 | `error-response-standard` | `error_code`·사용자 메시지·개발자 로그 표준화 |
| 기능 목록 업데이트 | `feature-catalog-update` | `FEATURE_CATALOG.md` 갱신 |
| 문서 상태/버전 관리 | `document-management` | `MASTER_INDEX`/`CURRENT_STATE`/`SESSION_HANDOFF`/`CHANGELOG` 최신화 |
| 배포 전 점검 | `release-check` | lint/build/test/DB 백업/롤백/운영 문서 확인 |
| 세션 종료/인수인계 | `session-handoff` | 다음 세션이 이어받을 정보 정리 |
| Codex 양방향 위임 | `bridge-orchestration` | **v1 미사용**. mcp-bridge가 실제 설치된 경우만 사용. v1에서는 자리표시자로 보관 |

## 2. Phase별 사용 Skill

### Phase 0 (완료)
- `project-bootstrap`, `document-management`

### Phase 1 (개발 환경)
- `phase-step-planner`, `design-compliance-review`, `modularization-review`, `document-management`

### Phase 2~6 (인증 + URL/앨범/메모)
- `design-compliance-review`, `modularization-review`, `harness-validation`, `error-response-standard`, `feature-catalog-update`

### Phase 7 (꾸미기 + 레이아웃)
- 위 + `harness-validation`(레이아웃 테스트 강화)

### Phase 8 (설정)
- 위와 동일

### Phase 9 (공개 페이지)
- 위 + 보안 하네스 강화 점검

### Phase 10 (회귀/마감)
- `release-check`, `document-management`, `session-handoff`

## 3. AI 도입 시 (v2 예정)

`docs/ai/` 폴더 신규 + `rag-first-ai-design`, `ai-agent-decision` Skill 추가. 본 매핑에 행 추가.

## 4. Skill 사용 하네스

- [ ] 이번 작업 유형에 맞는 Skill을 확인했는가?
- [ ] Skill이 설치되어 있으면 우선 사용했는가?
- [ ] Skill 결과가 표준 문서 기준과 충돌하지 않는가?
- [ ] Skill 실행 후 관련 문서/하네스가 업데이트되었는가?
- [ ] Skill이 표준 문서를 대체하지 않고 반복 절차 보조 도구로만 사용되었는가?
