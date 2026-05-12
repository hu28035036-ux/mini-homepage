---
상태: Approved
버전: v0.1
마지막 수정일: 2026-05-12
문서 목적: 구현 관리 / Phase·개발 순서
---

# Phase 계획 / 개발 순서

본 문서는 사용자 스펙 §10의 10단계 개발 순서를 Ralph Loop v7.1 Phase 구조에 맞춰 정리한다. 세부 Step과 수정 허용/금지 파일·AC는 각 Phase 진입 시점에 `phases/{n}-{name}/` 디렉터리에 작성한다.

## 전체 Phase

```text
Phase 0. 프로젝트 기준 문서 작성    ← 이번 작업 (완료)
Phase 1. 개발 환경 및 기본 구조 세팅
Phase 2. 인증(자체 회원가입/로그인/세션)
Phase 3. 미니홈피 생성·기본 비공개·기본 카테고리
Phase 4. URL 보관함 CRUD
Phase 5. 앨범 카테고리 + 사진 업로드/삭제
Phase 6. 메모 CRUD
Phase 7. 꾸미기 탭(색·카드·폰트·배경 + 레이아웃·슬롯 배치) + 미리보기
Phase 8. 설정 탭(프로필/slug/공개·비공개)
Phase 9. 공개 미니홈피 페이지 /u/[slug]
Phase 10. 전체 테스트·보안·데이터 분리·반응형 회귀
```

## Phase 0. 프로젝트 기준 문서 작성 (완료)

- 0-1. 문서 관리 규칙 + MASTER_INDEX 골격
- 0-2. PRD / ARCHITECTURE
- 0-3. DB / API / UI 설계
- 0-4. 단위화 + 오류 코드 표준
- 0-5. 하네스 계획·테스트 케이스·13종 하네스
- 0-6. Phase 계획·Feature Catalog·운영 문서·로그/상태·Skill Usage Map
- 0-7. `.claude/` + `phases/` + MASTER_INDEX 최종 점검

## Phase 1. 개발 환경 및 기본 구조 세팅

- 1-1. Next.js + TypeScript + Tailwind 프로젝트 생성
- 1-2. `src/` 폴더 구조 생성(빈 스텁 + 디렉터리)
- 1-3. Supabase 프로젝트(개발) 생성 + 환경변수 `.env.local.example`
- 1-4. `lib/db/supabase-server.ts` 클라이언트 + Storage 버킷 `user-uploads` 생성
- 1-5. 루트 레이아웃 + Tailwind base + 디자인 토큰
- 1-6. `lib/errors/{codes,response}.ts` 스텁
- 1-7. `npm run dev` 기본 화면 확인

## Phase 2. 인증

- 2-1. `users` 마이그레이션
- 2-2. `lib/auth/password.ts` (bcrypt)
- 2-3. `lib/auth/session.ts` (쿠키 발급/검증)
- 2-4. `lib/auth/guards.ts` (`requireUser`, `assertOwnership`)
- 2-5. `validators/auth.ts` + `services/auth.ts` + `repositories/users.ts`
- 2-6. Route Handler: `/api/auth/signup`, `/login`, `/logout`
- 2-7. `/signup`, `/login` 페이지 + `(admin)` 가드
- 2-8. TC-AUTH-* 통과

## Phase 3. 미니홈피 생성

- 3-1. `mini_homepages`, `album_categories` 마이그레이션 (기본값·인덱스·제약 포함, `layout_slots` 기본값 포함)
- 3-2. `services/homepage.ts`: 트랜잭션으로 미니홈피 + 기본 카테고리 동시 생성
- 3-3. `/api/homepage` POST/GET/PATCH
- 3-4. `(admin)` 홈에서 미니홈피가 없으면 생성 안내 → 자동 생성 또는 `/(admin)/settings`에서 slug 확정
- 3-5. TC-HP-* 통과 (특히 `is_public=false` 기본값)

## Phase 4. URL 보관함

- 4-1. `urls` 마이그레이션
- 4-2. `validators/urls.ts`, `repositories/urls.ts`, `services/urls.ts`
- 4-3. `/api/urls` GET/POST, `/api/urls/[id]` PATCH/DELETE
- 4-4. `/(admin)/urls` 페이지 + 폼/목록 컴포넌트
- 4-5. TC-URL-* + TC-ISO-001 통과
- 4-6. 단위/통합/보안 하네스 점검

## Phase 5. 앨범 + 사진

- 5-1. `album_categories`(추가 카테고리) + `photos` 마이그레이션
- 5-2. Storage 어댑터 `lib/storage/*`
- 5-3. categories CRUD service/repo/route + photos upload/list/delete
- 5-4. `/(admin)/albums` 페이지 + 카테고리 좌측 / 사진 그리드 우측
- 5-5. TC-ALB-001~010 + TC-ISO-003/004 통과
- 5-6. 카테고리 삭제 시 안의 사진도 함께 소프트 삭제 (트랜잭션)

## Phase 6. 메모

- 6-1. `memos` 마이그레이션
- 6-2. validator/service/repo/route
- 6-3. `/(admin)/memos` 페이지
- 6-4. TC-MEMO-* + TC-ISO-002 통과

## Phase 7. 꾸미기 탭 (핵심)

- 7-1. `validators/decorate.ts` — 색·카드·폰트·배경 + `layout_mode` + `layout_slots` 전수 검증
- 7-2. `services/decorate.ts` + `repositories/homepages.ts.updateDecorate(...)`
- 7-3. `/api/decorate` PUT + `/api/decorate/background` POST + `/api/decorate/profile-image` POST
- 7-4. 꾸미기 페이지 컴포넌트:
  - `ColorPicker`, `ImageUploader`, `CardStyleSelector`, `FontSelector`
  - `LayoutModeSelector`, `SlotEditor`
  - `PreviewBoard` — 더미 데이터로 좌측 편집값 즉시 반영
- 7-5. 클라이언트 검증: 같은 위젯 중복 즉시 경고, 저장 비활성화
- 7-6. TC-DEC-* + TC-LAYOUT-* 전체 통과 (특히 모바일 폴백)

## Phase 8. 설정 탭

- 8-1. `/(admin)/settings` 페이지 + 프로필/slug/공개 토글 폼
- 8-2. `/api/homepage` PATCH로 통합
- 8-3. slug 변경 시 중복 처리 UX (`HOMEPAGE_SLUG_DUPLICATE`)
- 8-4. 공개 전환 시 안내 모달

## Phase 9. 공개 미니홈피 페이지 `/u/[slug]`

- 9-1. `services/publicView.ts` — `is_public AND deleted_at IS NULL` 강제, 비공개/미존재 동일 응답 처리
- 9-2. `/api/public/[slug]` GET (또는 서버 컴포넌트 직접 호출)
- 9-3. `app/u/[slug]/page.tsx` 서버 컴포넌트
- 9-4. `components/public/WidgetRenderer` — `layout_mode` + `layout_slots` 기반 위젯 렌더링
- 9-5. 모바일 1단 폴백
- 9-6. TC-PUB-001~007 + TC-LAYOUT-006~009 통과
- 9-7. 보안 하네스 전수 점검

## Phase 10. 전체 회귀 / 마감

- 10-1. PRD §4 1사이클 수동 통과 (회원가입→공개→비공개)
- 10-2. TC-ISO-001~006 통과 (두 사용자 환경)
- 10-3. TC-RET-001~005 통과
- 10-4. TC-RWD-001~005 통과
- 10-5. 회귀: Phase 2~9 핵심 테스트 재실행
- 10-6. `docs/15_RELEASE_CHECKLIST.md` 통과
- 10-7. `docs/09_CHANGELOG.md` / `docs/10_CURRENT_STATE.md` / `docs/11_SESSION_HANDOFF.md` 마감 업데이트

## Phase 계획 전용 하네스

- [ ] Phase 순서가 본 문서대로인가?
- [ ] 각 Phase의 목표가 명확한가?
- [ ] 각 Phase의 작업 범위가 위 세부 Step으로 분해되었는가?
- [ ] Phase 간 의존성이 위에서 아래로 단방향인가?
- [ ] 이전 Phase가 통과되기 전 다음 Phase를 시작하지 않는가?
- [ ] Phase 종료 시 CURRENT_STATE, SESSION_HANDOFF, VALIDATION_LOG, FEATURE_CATALOG가 갱신되는가?
