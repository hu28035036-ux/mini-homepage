---
상태: Draft
버전: v0.1
마지막 수정일: 2026-05-12
문서 목적: 운영 / 변경 이력
---

# 변경 이력

본 문서는 시간순 변경 기록을 남긴다. 현재 기능 지도는 `docs/19_FEATURE_CATALOG.md`에 있으며, 본 문서는 "언제, 무엇이 바뀌었는지"만 간단히 적는다.

## v0.3.1 — 2026-05-12 (버그 픽스)

- 🐛 **Race condition 수정**: `admin/layout.tsx`(ensureMine)와 `admin/page.tsx`(getMine)가 동시 실행될 때, 페이지가 미니홈피 생성 전에 데이터 조회를 시도하면 `DB_RECORD_NOT_FOUND` 발생하던 문제.
  - `ensureHomepageForUserId(userId)` 함수 분리 + 23505 충돌 시 재조회로 idempotent 보장
  - `admin/page.tsx`, `admin/decorate/page.tsx`, `admin/settings/page.tsx`가 `getMine` 대신 `ensureMine` 사용
- 🐛 **API 직접 호출 시 미니홈피 미존재**: UI 없이 API만 쓰면 layout이 호출 안 돼서 `DB_RECORD_NOT_FOUND` 떴음.
  - `authService.signup`이 가입 직후 `ensureHomepageForUserId(row.id)` 호출 → 가입과 동시에 미니홈피 + 기본 카테고리 보장
- ⚠️ **로그아웃 토큰 도용 trade-off 명시**: iron-session(stateless)은 로그아웃 시 만료 쿠키만 보내고 토큰 자체를 무효화하지 않음. 실제 브라우저 사용은 안전(쿠키 덮어써짐), 토큰 도용 후 재사용 시나리오는 영향 받음. 서버 사이드 세션 store는 v2 도입 검토.
- E2E 22/22 재실행 통과, `DB_RECORD_NOT_FOUND` 로그 0건 확인.

## v0.3 — 2026-05-12 (Phase 10 E2E 검증)

- Playwright 도입 (`@playwright/test`, Chromium)
- Supabase Local (Docker) + 마이그레이션 적용 + `user-uploads` 버킷 생성
- `.env.local` 로컬 개발용 키 세팅
- E2E 테스트 22개 작성 + **22/22 통과**:
  - 인증 5개 (TC-AUTH-001~006): 회원가입/로그인/중복/오답/리다이렉트/로그아웃
  - 미니홈피·CRUD 5개 (TC-HP, TC-ALB-001, TC-URL, TC-MEMO)
  - 꾸미기·레이아웃 6개 (TC-DEC, TC-LAYOUT): 미리보기 즉시 반영·single↔double 슬롯 동기화·클라이언트 중복 차단·서버 `LAYOUT_WIDGET_DUPLICATED`/`LAYOUT_INVALID_SLOT`·저장 후 새로고침 유지
  - 공개/비공개 4개 (TC-PUB): 비공개→공개→비공개 한 사이클·미존재 동일 응답·API 직접 호출 404·본인 비공개 접근
  - 사용자 분리 2개 (TC-ISO-001/002/005): URL/메모 격리·미니홈피 PATCH 격리
- `tests/global-setup.ts` 추가 (Next dev cold-compile 워밍업)

## v0.2 — 2026-05-12 (Phase 1~9 코드 구현)

- Next.js 15 App Router + TypeScript + Tailwind v4 프로젝트 골격
- Supabase 마이그레이션 SQL `supabase/migrations/0001_initial.sql` (6테이블 + 트리거 + 부분 unique 인덱스)
- 자체 회원가입 시스템 — bcryptjs(cost 12) + iron-session 쿠키 + signup/login/logout API + 페이지
- 미니홈피 자동 생성 (기본 비공개 + 기본 카테고리 트랜잭션)
- URL/앨범 카테고리/사진/메모 CRUD — repository + service + API + 관리자 페이지
- Supabase Storage 어댑터 (사진/배경/프로필 업로드, MIME/10MB 검증)
- 꾸미기 탭 — 색·카드(4)·폰트(3)·배경 + 레이아웃(single/double) + 슬롯별 위젯 배치 + 즉시 미리보기
- 위젯 렌더러 — 관리자 미리보기와 공개 페이지 공통 사용
- 설정 탭 — 프로필/slug/공개 토글
- 공개 페이지 `/u/[slug]` — 서버에서 `is_public AND deleted_at IS NULL` 검증, 비공개=미존재 동일 응답
- README 1사이클 시나리오, 환경변수 가이드

## v0.1 — 2026-05-12 (Phase 0)

- 초기 문서 세트 생성 (PRD, 아키텍처, DB, API, UI, 단위화, 오류 코드, 13종 하네스, Phase 계획, 기능 목록, 운영 문서, 로그/상태/인수인계, 메타, `.claude/`, `phases/`)
- 미니홈피 서비스 v1 설계 확정:
  - Next.js + Supabase Postgres/Storage 스택
  - 자체 회원가입 시스템 (Supabase Auth 미사용)
  - 6테이블(users / mini_homepages / urls / album_categories / photos / memos) + 소프트 삭제
  - 꾸미기: 색·카드·폰트·배경 + 레이아웃(single/double) + 슬롯별 위젯 배치 (드래그앤드롭 없음)
  - 공개/비공개: 기본 비공개, 서버에서만 검증, 비공개와 미존재 동일 응답
  - AI 기능 v1 제외
