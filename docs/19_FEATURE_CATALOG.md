---
상태: Approved
버전: v0.1
마지막 수정일: 2026-05-12
문서 목적: 구현 관리 / 기능 목록 (단일 소스)
---

# 기능 목록 (Feature Catalog)

본 미니홈피 서비스의 모든 구현 기능을 한 곳에서 관리한다. 새 기능 추가/수정/폐기 시 본 문서를 즉시 갱신한다. 이력(언제 추가됐는지)은 `docs/09_CHANGELOG.md`에서 관리하며 본 문서는 **현재 기능 지도**다.

상태: `Planned` / `In Progress` / `Active` / `Deprecated`
테스트: `Untested` / `Passing` / `Failing`

## 1. 인증

| 기능 | 설명 | 위치 | API | 테이블 | 권한 | TC | 상태 | 테스트 |
|---|---|---|---|---|---|---|---|---|
| 회원가입 | 이메일+비밀번호+닉네임으로 자체 가입 (Supabase Auth 미사용) | `app/(auth)/signup/page.tsx`, `services/auth.ts` | `POST /api/auth/signup` | users | 공개 | TC-AUTH-001/002 | Active | Passing |
| 로그인 | 자격 검증 후 쿠키 세션 발급 | `app/(auth)/login/page.tsx`, `services/auth.ts` | `POST /api/auth/login` | users | 공개 | TC-AUTH-003/004 | Active | Passing |
| 로그아웃 | 쿠키 만료 | `services/auth.ts` | `POST /api/auth/logout` | — | 로그인 | TC-AUTH-006 | Active | Passing |
| 인증 가드 | `(admin)/**` 진입 시 비로그인 차단 | `app/(admin)/layout.tsx` + `lib/auth/guards.ts` | — | — | 로그인 | TC-AUTH-005 | Active | Passing |

## 2. 미니홈피

| 기능 | 설명 | 위치 | API | 테이블 | 권한 | TC | 상태 | 테스트 |
|---|---|---|---|---|---|---|---|---|
| 미니홈피 생성 | slug 발급, 기본 비공개, 기본 카테고리 자동 생성 (트랜잭션) | `services/homepage.ts` | `POST /api/homepage` | mini_homepages, album_categories | 로그인 | TC-HP-001~003, TC-ALB-001 | Active | Passing |
| 내 미니홈피 조회 | 본인 데이터만 | `services/homepage.ts` | `GET /api/homepage` | mini_homepages | 로그인 | TC-HP-004 | Active | Passing |
| 미니홈피 수정 | 제목/소개/프로필/공개 토글/slug 변경 | `services/homepage.ts` | `PATCH /api/homepage` | mini_homepages | 본인 | TC-PUB-002/004 | Active | Passing |

## 3. URL 보관함

| 기능 | 설명 | 위치 | API | 테이블 | 권한 | TC | 상태 | 테스트 |
|---|---|---|---|---|---|---|---|---|
| URL 추가 | 제목+주소 | `services/urls.ts` | `POST /api/urls` | urls | 본인 | TC-URL-001 | Active | Passing |
| URL 목록 | 최신순 | `services/urls.ts` | `GET /api/urls` | urls | 본인 | TC-URL-002 | Active | Passing |
| URL 수정 | 제목/주소 | `services/urls.ts` | `PATCH /api/urls/[id]` | urls | 본인 | TC-URL-003 | Active | Passing |
| URL 삭제 | 소프트 삭제 | `services/urls.ts` | `DELETE /api/urls/[id]` | urls | 본인 | TC-URL-004 | Active | Passing |

## 4. 앨범 / 사진

| 기능 | 설명 | 위치 | API | 테이블 | 권한 | TC | 상태 | 테스트 |
|---|---|---|---|---|---|---|---|---|
| 기본 카테고리 자동 생성 | 미니홈피 생성 시 함께 | `services/homepage.ts` | (POST homepage 부수효과) | album_categories | 본인 | TC-ALB-001 | Active | Passing |
| 카테고리 추가/수정/삭제 | 중복 차단, 삭제 시 안 사진 함께 소프트 삭제 | `services/albums.ts` | `/api/albums/categories(/[id])` | album_categories, photos | 본인 | TC-ALB-002~005 | Active | Passing |
| 사진 업로드 | MIME/크기 검증, Supabase Storage 저장 | `services/albums.ts`, `lib/storage/uploader.ts` | `POST /api/albums/photos` | photos | 본인 | TC-ALB-006~008 | Active | Passing |
| 사진 목록/삭제 | 카테고리별 조회, 소프트 삭제 | `services/albums.ts` | `GET /api/albums/photos`, `DELETE .../[id]` | photos | 본인 | TC-ALB-009/010 | Active | Passing |

## 5. 메모

| 기능 | 설명 | 위치 | API | 테이블 | 권한 | TC | 상태 | 테스트 |
|---|---|---|---|---|---|---|---|---|
| 메모 작성/목록/상세/수정/삭제 | 제목+내용, 소프트 삭제 | `services/memos.ts` | `/api/memos(/[id])` | memos | 본인 | TC-MEMO-001~005 | Active | Passing |

## 6. 꾸미기 (색·카드·폰트·배경)

| 기능 | 설명 | 위치 | API | 테이블 | 권한 | TC | 상태 | 테스트 |
|---|---|---|---|---|---|---|---|---|
| 배경색/배경 이미지/이미지 ON-OFF | 컬러 피커 + 업로드 + 토글 | `components/decorate/*`, `services/decorate.ts` | `PUT /api/decorate`, `POST /api/decorate/background` | mini_homepages | 본인 | TC-DEC-001~003 | Active | Passing |
| 포인트색/글자색 | 컬러 피커 | `components/decorate/ColorPicker.tsx` | `PUT /api/decorate` | mini_homepages | 본인 | TC-DEC-004/005 | Active | Passing |
| 카드 스타일 4종 | basic/rounded/shadow/transparent | `CardStyleSelector` | 위와 동일 | mini_homepages | 본인 | TC-DEC-006 | Active | Passing |
| 폰트 3종 | default/rounded/emotional | `FontSelector` | 위와 동일 | mini_homepages | 본인 | TC-DEC-007 | Active | Passing |
| 미리보기 즉시 반영 | 로컬 state 기반 | `PreviewBoard` | (저장 전 서버 미반영) | — | 본인 | TC-DEC-008 | Active | Passing |

## 7. 레이아웃 / 위젯 배치

| 기능 | 설명 | 위치 | API | 테이블 | 권한 | TC | 상태 | 테스트 |
|---|---|---|---|---|---|---|---|---|
| 레이아웃 모드 | single / double | `LayoutModeSelector` | `PUT /api/decorate` | mini_homepages | 본인 | TC-LAYOUT-001/002 | Active | Passing |
| 슬롯별 위젯 배치 | 슬롯 행마다 위젯 드롭다운(profile/urls/albums/memos/empty) + 표시 ON/OFF | `SlotEditor` | `PUT /api/decorate` | mini_homepages | 본인 | TC-LAYOUT-003~007 | Active | Passing |
| 모바일 1단 폴백 | viewport < md에서 자동 | `WidgetRenderer` | — | — | 공개/본인 | TC-LAYOUT-008 | Active | Passing |
| 미리보기 vs 공개 일치 | 시각 동일성 | `PreviewBoard` + `WidgetRenderer` | — | — | 본인 | TC-LAYOUT-009 | Active | Passing |

## 8. 공개 / 비공개

| 기능 | 설명 | 위치 | API | 테이블 | 권한 | TC | 상태 | 테스트 |
|---|---|---|---|---|---|---|---|---|
| 공개/비공개 토글 | 설정 탭 | `app/(admin)/settings/page.tsx` | `PATCH /api/homepage` | mini_homepages | 본인 | TC-PUB-002~005 | Active | Passing |
| 공개 미니홈피 페이지 | `/u/[slug]` 서버 검증 후 렌더 | `app/u/[slug]/page.tsx`, `services/publicView.ts` | `GET /api/public/[slug]` (내부) | 모든 사용자 데이터 | 공개(서버 검증) | TC-PUB-001/003/006/007 | Active | Passing |
| 비공개=미존재 통일 응답 | 404 + 동일 메시지 | `services/publicView.ts` | `GET /api/public/[slug]` | — | — | TC-PUB-006 | Active | Passing |

## 9. 데이터 보관 / 사용자 분리

| 기능 | 설명 | 위치 | API | 테이블 | 권한 | TC | 상태 | 테스트 |
|---|---|---|---|---|---|---|---|---|
| 소프트 삭제 | `deleted_at` 사용, 일반 조회 제외 | `repositories/*` | 모든 DELETE/GET | 모든 사용자 데이터 | — | TC-RET-001~005 | Active | Passing |
| 사용자별 데이터 분리 | repository 레이어가 `user_id` 강제 부착 | `repositories/*` | 모든 API | 모든 사용자 데이터 | — | TC-ISO-001~006 | Active | Passing |

## 10. v1 제외 (참고용으로 보존)

| 기능 | 상태 | 비고 |
|---|---|---|
| 드래그앤드롭 꾸미기 | Deprecated/Excluded | PRD §7 |
| 태그/검색/카테고리(URL) | Deprecated/Excluded | PRD §7 |
| 댓글/좋아요/방명록/방문자 수 | Deprecated/Excluded | PRD §7 |
| 배경음악 | Deprecated/Excluded | PRD §7 |
| 친구/팔로우 | Deprecated/Excluded | PRD §7 |
| AI 요약/RAG/챗봇 | Deprecated/Excluded | PRD §7. 추후 도입 시 `docs/ai/` 신규 |
| URL 썸네일 자동 가져오기 | Deprecated/Excluded | PRD §7 |
| 알림/결제 | Deprecated/Excluded | PRD §7 |
