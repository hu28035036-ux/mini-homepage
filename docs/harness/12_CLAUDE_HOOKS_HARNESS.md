---
상태: Approved
버전: v0.1
마지막 수정일: 2026-05-12
문서 목적: 하네스 / Claude Hooks
---

# Claude Hooks 하네스

`.claude/settings.json`의 권한 화이트리스트와 hook 설정이 실제 작업 환경에서 의도대로 작동하는지 확인한다.

## 1. v1 적용 범위

v1에서는 hook 스크립트(Python/Shell) 자체는 구현하지 않는다. `.claude/settings.json`의 `permissions.allow` / `permissions.deny`만 설정해 위험 명령을 차단한다.

추후 hook 스크립트(예: PreToolUse → 위험 명령 차단 + 입력 검증, PostToolUse → `phases/{n}/step-output.json` 자동 누적)는 별도 Phase로 도입.

## 2. 체크리스트 (v1)

- [ ] `.claude/settings.json`이 JSON valid인가?
- [ ] `permissions.allow`에 본 프로젝트에 필요한 명령(`Bash(npm *)`, `Bash(npx supabase *)`, `Read`, `Edit`, `Write`, `Glob`, `Grep`)이 포함되었는가?
- [ ] `permissions.deny`에 위험 명령(`Bash(rm -rf*)`, `Bash(git push --force*)`, `Bash(npx supabase db reset*)`)이 포함되었는가?
- [ ] 운영 DB 리셋 명령이 명시적으로 차단되는가?
- [ ] 평문 시크릿을 출력할 수 있는 명령(예: `Bash(env)`, `Bash(cat .env*)`)이 차단되는가?
- [ ] `.claude/settings.local.json`이 만들어진다면 git ignore에 추가되어 있는가?

## 3. 추후 hook 도입 시 (v2 예정)

- [ ] PreToolUse가 Step 문서의 `수정 금지 파일`을 실제로 차단하는가?
- [ ] PostToolUse가 `step-output.json`을 자동 누적하는가?
- [ ] hook 실패가 작업 중단으로 이어지는가? (silent 실패 금지)
- [ ] hook 로그가 안전한 위치(저장소 외)에 남는가?
