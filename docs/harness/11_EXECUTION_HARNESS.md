---
상태: Approved
버전: v0.1
마지막 수정일: 2026-05-12
문서 목적: 하네스 / 실행형 Phase/Step
---

# 실행형 Phase / Step 하네스

`phases/` 디렉터리의 JSON 상태와 Step 문서가 일관되게 유지되는지 확인한다.

## 1. 실행 모드

본 프로젝트 v1은 **수동 실행 모드**다. Python 자동화 스크립트(`scripts/harness_*.py`)는 만들지 않는다. Claude Code 또는 사람이 Step 문서를 읽고 작업한다.

추후 자동화 도입 시 별도 Phase에서 추가한다.

## 2. 구조

```text
phases/
  index.json                 # Phase 0~10 전체 상태
  0-project-setup/
    index.json               # Phase 0 내부 Step 상태
    stepN.md                 # 각 Step 작업 지시
    stepN-output.json        # Step 산출물/검증 결과
  1-env-and-skeleton/
    index.json
    stepN.md
  ...
```

본 작업(Phase 0)에서는 `phases/index.json`과 `phases/0-project-setup/`만 생성한다. 다른 Phase는 진입 시점에 생성한다.

## 3. JSON 스키마 요약

`phases/index.json`:
```json
{
  "current_phase": 0,
  "phases": [
    { "id": 0, "name": "project-setup", "status": "done", "started_at": "...", "completed_at": "..." },
    { "id": 1, "name": "env-and-skeleton", "status": "planned" },
    ...
  ],
  "updated_at": "YYYY-MM-DD"
}
```

`phases/{n}-{name}/index.json`:
```json
{
  "phase_id": 0,
  "name": "project-setup",
  "status": "done",
  "steps": [
    { "id": 0, "title": "문서 세트 작성", "status": "done", "file": "step0.md", "output": "step0-output.json" }
  ]
}
```

상태값: `planned`, `in_progress`, `done`, `blocked`, `skipped`.

## 4. 체크리스트

- [ ] `phases/index.json`이 파싱 가능한가? (JSON valid)
- [ ] `current_phase`가 진행 중 Phase id와 일치하는가?
- [ ] 각 Phase의 `index.json`이 step 파일을 정확히 가리키는가?
- [ ] `stepN.md`가 §35 템플릿(읽어야 할 문서·작업 범위·수정 허용/금지·AC·검증 게이트·금지사항) 8개 섹션을 포함하는가?
- [ ] `stepN-output.json`에 산출물 목록, 실행 명령, 결과, 회귀 결과, 남은 위험이 기록되었는가?
- [ ] 이전 Step이 `done`이 되기 전에 다음 Step을 `in_progress`로 옮기지 않았는가?
- [ ] 한 번에 하나의 Step만 `in_progress`인가?
- [ ] Phase 종료 시 `index.json`의 `status`가 `done`으로 갱신되고 `updated_at`이 최신인가?
