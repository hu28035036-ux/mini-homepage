---
name: project-bootstrap
description: 본 미니홈피 프로젝트의 표준 문서 구조를 새 작업 디렉터리에 적용한다. v7.1 §4를 본 프로젝트(`mini-homepage`)에 맞춰 docs/·.claude/·phases/ 트리를 생성하고, 6테이블·9화면·꾸미기+레이아웃 기준을 반영한 초기 문서를 만든다.
---

# project-bootstrap

## 사용 시점

- 새 작업 디렉터리에서 본 표준을 처음 적용할 때
- Phase 0 산출물(문서 세트)을 다시 생성하거나 다른 프로젝트에 복제할 때

## 동작

1. `docs/`, `docs/harness/`, `docs/meta/`, `.claude/`, `phases/` 디렉터리 생성
2. `docs/meta/00_DOCUMENT_MANAGEMENT_RULES.md` → `docs/00_MASTER_INDEX.md` → PRD → ARCHITECTURE 순으로 헤더(상태/버전/마지막 수정일/문서 목적) 포함 작성
3. 본 프로젝트 결정 사항을 모든 문서에 일관 반영:
   - Next.js + Supabase Postgres/Storage
   - 자체 회원가입(Supabase Auth 미사용)
   - 6테이블 + 소프트 삭제 + `user_id` 강제
   - 꾸미기 색·카드·폰트·배경 + 레이아웃 single/double + 슬롯별 위젯
   - 공개/비공개 서버 검증, 기본 비공개
   - AI 기능 v1 미포함
4. `.claude/settings.json` 권한 화이트리스트 + 위험 명령 deny
5. `phases/index.json` Phase 0~10 상태

## 본 표준 대체 금지

본 Skill은 보조 도구다. 표준 문서(`ralph_loop_standard_dev_doc_v7_1_codex_checked.md`)와 본 프로젝트 docs/를 대체하지 않는다.
