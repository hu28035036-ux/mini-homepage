---
name: bridge-orchestration
description: Codex 양방향 위임용 자리표시자. 본 미니홈피 프로젝트 v1에서는 사용하지 않는다. mcp-bridge 또는 공식 codex-plugin-cc가 실제 설치된 환경에서만 활성화하며, 그 경우에도 Codex 결과는 참고 자료이고 Claude Code가 독립 검토 후 반영 여부를 결정한다.
---

# bridge-orchestration

## 사용 시점

- **v1에서는 사용하지 않음.**
- v2 이후 Codex와 양방향 협업이 필요하다고 판단되면 활성화.

## 활성화 조건

- mcp-bridge가 실제 설치되어 있고 watcher가 동작 중
- 또는 공식 `/codex:rescue`, `/codex:review` 슬래시 명령이 가능한 환경

## 동작 (활성화 시)

1. envelope 발행 — `{project, phase, step}` ralph 좌표 포함
2. Codex 위임 → 결과 수신
3. 결과를 `phases/{n}/step-output.json`에 누적
4. **Claude Code 독립 검토** — 설계/하네스/오류 코드/단위화 기준으로 재검증
5. 반영/미반영 결정 + 사유를 `docs/08_VALIDATION_LOG.md` 또는 `docs/12_DESIGN_CHANGE_REQUESTS.md`에 기록
6. v7.1 §46 게이트 12·13 활성화

## 안전 장치

- 위험 명령 차단 (`.claude/settings.json` deny 목록)
- 개인정보 노출 방지
- Codex 결과 자동 반영 금지

## 본 프로젝트 v1 상태

미사용. 본 SKILL은 자리표시자.
