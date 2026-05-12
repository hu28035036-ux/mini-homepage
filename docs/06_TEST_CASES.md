---
상태: Approved
버전: v0.1
마지막 수정일: 2026-05-12
문서 목적: 하네스 / 테스트 케이스 카탈로그
---

# 테스트 케이스 카탈로그

본 문서는 사용자 스펙 §11 체크리스트를 TC-ID 부여 형식으로 정리한다. 모든 항목은 Phase 진행 중 채우며, 초기 상태는 `Status=Untested`.

표 컬럼: **TC-ID / 영역 / 사전조건 / 입력 / 기대 결과 / 실패 조건 / 우선순위 / 상태**

## 1. 인증 (TC-AUTH-*)

| TC-ID | 영역 | 사전조건 | 입력 | 기대 결과 | 실패 조건 | 우선 | 상태 |
|---|---|---|---|---|---|---|---|
| TC-AUTH-001 | 회원가입 | 없음 | 이메일/비밀번호/닉네임 정상 입력 | 201, `user_id` 반환 | 4xx | P1 | Untested |
| TC-AUTH-002 | 회원가입 중복 | 동일 이메일 가입 이력 | 동일 이메일 재입력 | 409 `AUTH_EMAIL_DUPLICATE` | 다른 코드 | P1 | Untested |
| TC-AUTH-003 | 로그인 정상 | 가입 완료 | 일치 자격 | 200 + Set-Cookie | 4xx | P1 | Untested |
| TC-AUTH-004 | 로그인 실패 | 가입 완료 | 비밀번호 오기 | 401 `AUTH_INVALID_CREDENTIAL`. 메시지에 이메일 존재 여부 노출 안 됨 | 200/누설 메시지 | P1 | Untested |
| TC-AUTH-005 | 비로그인 접근 | 미로그인 | `/(admin)` GET | `/login`으로 리다이렉트 | 200 진입 | P1 | Untested |
| TC-AUTH-006 | 로그아웃 | 로그인 | `POST /api/auth/logout` | 200 + 쿠키 만료 | 쿠키 유지 | P1 | Untested |

## 2. 미니홈피 (TC-HP-*)

| TC-ID | 영역 | 사전조건 | 입력 | 기대 결과 | 실패 조건 | 우선 | 상태 |
|---|---|---|---|---|---|---|---|
| TC-HP-001 | 생성 | 로그인 | slug 정상 | 201, `is_public=false`, 기본 카테고리 자동 생성 | `is_public=true` 또는 카테고리 미생성 | P1 | Untested |
| TC-HP-002 | slug 중복 | 다른 사용자 slug 존재 | 동일 slug | 409 `HOMEPAGE_SLUG_DUPLICATE` | 201 | P1 | Untested |
| TC-HP-003 | 기본 비공개 | 신규 생성 직후 | — | DB에서 `is_public=false` 확인 | true | P1 | Untested |
| TC-HP-004 | 본인 GET | 로그인 | `GET /api/homepage` | 200 + 본인 미니홈피 | 다른 사람 데이터 노출 | P1 | Untested |

## 3. URL (TC-URL-*)

| TC-ID | 영역 | 사전조건 | 입력 | 기대 결과 | 실패 조건 | 우선 | 상태 |
|---|---|---|---|---|---|---|---|
| TC-URL-001 | 추가 | 로그인 | 제목+주소 | 201, 저장날짜 자동 기록 | 4xx/날짜 누락 | P1 | Untested |
| TC-URL-002 | 목록 | URL 3건 등록 | `GET /api/urls` | 최신순 3건 | 0건/순서 오류 | P1 | Untested |
| TC-URL-003 | 수정 | URL 1건 존재 | PATCH | 200, 수정 반영 | 4xx | P1 | Untested |
| TC-URL-004 | 삭제 | URL 1건 존재 | DELETE | 200, 목록에서 사라짐, `deleted_at` 기록 | 화면에 보임/`deleted_at` 미기록 | P1 | Untested |
| TC-URL-005 | 잘못된 URL | 로그인 | 형식 위반 입력 | 400 `URL_INVALID_FORMAT` | 201 | P2 | Untested |

## 4. 앨범/사진 (TC-ALB-*)

| TC-ID | 영역 | 사전조건 | 입력 | 기대 결과 | 실패 조건 | 우선 | 상태 |
|---|---|---|---|---|---|---|---|
| TC-ALB-001 | 기본 카테고리 | 미니홈피 생성 직후 | `GET /api/albums/categories` | 1개 (`name='기본', is_default=true`) | 0개 | P1 | Untested |
| TC-ALB-002 | 카테고리 추가 | 로그인 | `POST` name="여행" | 201 | 4xx | P1 | Untested |
| TC-ALB-003 | 카테고리 이름 중복 | "여행" 존재 | "여행" 재추가 | 409 `ALBUM_CATEGORY_DUPLICATE` | 201 | P1 | Untested |
| TC-ALB-004 | 카테고리 이름 수정 | "여행" 존재 | PATCH name="여행2024" | 200 | 4xx | P2 | Untested |
| TC-ALB-005 | 카테고리 삭제 | 안에 사진 있음 | DELETE | 200, 카테고리+사진 모두 소프트 삭제 | 카테고리만 삭제됨 | P2 | Untested |
| TC-ALB-006 | 사진 업로드 | 카테고리 존재 | jpg 1MB 업로드 | 201, Storage 경로 저장 | 4xx | P1 | Untested |
| TC-ALB-007 | 잘못된 MIME | 로그인 | exe 업로드 | 400 `PHOTO_INVALID_MIME` | 201 | P1 | Untested |
| TC-ALB-008 | 큰 파일 | 로그인 | 15MB 업로드 | 413 `STORAGE_FILE_TOO_LARGE` | 201 | P2 | Untested |
| TC-ALB-009 | 사진 목록 | 카테고리 A에 사진 3장 | `GET /api/albums/photos?category_id=A` | 3장 반환 | 다른 카테고리 사진 포함 | P1 | Untested |
| TC-ALB-010 | 사진 삭제 | 사진 1장 존재 | DELETE | 200, 목록에서 사라짐 | 화면에 보임 | P1 | Untested |

## 5. 메모 (TC-MEMO-*)

| TC-ID | 영역 | 사전조건 | 입력 | 기대 결과 | 실패 조건 | 우선 | 상태 |
|---|---|---|---|---|---|---|---|
| TC-MEMO-001 | 작성 | 로그인 | 제목+내용 | 201, 작성날짜 자동 | 4xx | P1 | Untested |
| TC-MEMO-002 | 목록 | 메모 3건 | `GET /api/memos` | 최신순 3건 | 순서 오류 | P1 | Untested |
| TC-MEMO-003 | 상세 | 메모 존재 | `GET /api/memos/[id]` | 200 + 전체 내용 | 4xx | P2 | Untested |
| TC-MEMO-004 | 수정 | 메모 존재 | PATCH | 200, `updated_at` 갱신 | `updated_at` 미갱신 | P2 | Untested |
| TC-MEMO-005 | 삭제 | 메모 존재 | DELETE | 200, 목록에서 사라짐 | 화면에 보임 | P1 | Untested |

## 6. 꾸미기 (색·카드·폰트·배경) (TC-DEC-*)

| TC-ID | 영역 | 사전조건 | 입력 | 기대 결과 | 실패 조건 | 우선 | 상태 |
|---|---|---|---|---|---|---|---|
| TC-DEC-001 | 배경색 변경 | 로그인 | `background_color="#000"` | 200, DB 반영 | 미반영 | P1 | Untested |
| TC-DEC-002 | 배경 이미지 업로드 | 로그인 | jpg 업로드 | 200, `background_image_url` 채워짐 | 4xx | P1 | Untested |
| TC-DEC-003 | 배경 이미지 ON/OFF | 로그인 | `use_background_image` 토글 | 200, 공개 페이지에 반영 | 미반영 | P1 | Untested |
| TC-DEC-004 | 포인트 색상 | 로그인 | `point_color="#7c3aed"` | 200, 미리보기·공개 반영 | 미반영 | P1 | Untested |
| TC-DEC-005 | 글자 색상 | 로그인 | `text_color="#111"` | 200 | 미반영 | P1 | Untested |
| TC-DEC-006 | 카드 스타일 | 로그인 | 4종 각각 선택 | 미리보기·공개 모두 시각 변화 | 변화 없음 | P1 | Untested |
| TC-DEC-007 | 폰트 변경 | 로그인 | 3종 각각 선택 | 미리보기·공개 모두 시각 변화 | 변화 없음 | P1 | Untested |
| TC-DEC-008 | 미리보기 즉시 반영 | 꾸미기 탭 진입 | 좌측에서 값 변경 | 우측 미리보기 즉시 반영(저장 전) | 저장 후에만 반영 | P1 | Untested |
| TC-DEC-009 | 잘못된 enum | 로그인 | `card_style="weird"` | 400 `DECORATE_INVALID_VALUE` | 200 | P2 | Untested |

## 7. 레이아웃·슬롯 배치 (TC-LAYOUT-*)

| TC-ID | 영역 | 사전조건 | 입력 | 기대 결과 | 실패 조건 | 우선 | 상태 |
|---|---|---|---|---|---|---|---|
| TC-LAYOUT-001 | single→double 전환 | 기본 single | `layout_mode='double'`+ 6슬롯 | 200, 슬롯 수 6 동기화 | 슬롯 4 유지/에러 | P1 | Untested |
| TC-LAYOUT-002 | double→single 전환 | double 적용 | `layout_mode='single'` + 4슬롯 | 200, 슬롯 수 4 동기화 | 슬롯 6 유지 | P1 | Untested |
| TC-LAYOUT-003 | 위젯 중복 | 로그인 | urls를 슬롯1·슬롯3에 동시 | 400 `LAYOUT_WIDGET_DUPLICATED` | 200 | P1 | Untested |
| TC-LAYOUT-004 | 알 수 없는 위젯 | 로그인 | widget="foo" | 400 `LAYOUT_WIDGET_UNKNOWN` | 200 | P1 | Untested |
| TC-LAYOUT-005 | 슬롯 번호 범위 밖 | single 모드 | slot=5 | 400 `LAYOUT_INVALID_SLOT` | 200 | P1 | Untested |
| TC-LAYOUT-006 | visible=false | 슬롯 중 1개 visible=false | 공개 페이지 접속 | 해당 슬롯 렌더링 안 됨 | 렌더링됨 | P1 | Untested |
| TC-LAYOUT-007 | empty 위젯 | 슬롯 중 1개 widget="empty" | 공개 페이지 접속 | 해당 슬롯 렌더링 안 됨 | 렌더링됨 | P1 | Untested |
| TC-LAYOUT-008 | 모바일 폴백 | double 적용 | iPhone viewport로 `/u/[slug]` 접속 | 1단으로 폴백 렌더 | 2단 그대로 | P1 | Untested |
| TC-LAYOUT-009 | 미리보기 일치 | 모든 설정 저장 | 미리보기 vs 공개 페이지 비교 | 시각 동일 | 차이 발생 | P1 | Untested |

## 8. 공개/비공개 (TC-PUB-*)

| TC-ID | 영역 | 사전조건 | 입력 | 기대 결과 | 실패 조건 | 우선 | 상태 |
|---|---|---|---|---|---|---|---|
| TC-PUB-001 | 기본 비공개 | 미니홈피 신규 생성 | 시크릿 창으로 `/u/[slug]` | 404 `HOMEPAGE_PRIVATE_OR_NOT_FOUND` | 200 | P1 | Untested |
| TC-PUB-002 | 공개 전환 | 본인 로그인 | `PATCH /api/homepage` `is_public=true` | 200 | 4xx | P1 | Untested |
| TC-PUB-003 | 공개 후 외부 접속 | TC-PUB-002 통과 | 시크릿 창 `/u/[slug]` | 200, 사용자 꾸미기·레이아웃 반영 | 4xx | P1 | Untested |
| TC-PUB-004 | 비공개 재전환 | TC-PUB-002 통과 | `is_public=false` | 200, 즉시 외부 차단 | 200 후에도 외부 노출 | P1 | Untested |
| TC-PUB-005 | 본인은 비공개에서도 접근 | 비공개 상태 | 본인 로그인으로 `/(admin)` | 모든 데이터 정상 노출 | 4xx | P1 | Untested |
| TC-PUB-006 | 비공개와 미존재 동일 응답 | 비공개 또는 없는 slug | `/u/[slug]` | 둘 다 404 + 동일 메시지 | 메시지 분리됨 | P1 | Untested |
| TC-PUB-007 | 서버 검증 | 비공개 상태 | API: `GET /api/public/[slug]` 직접 호출 | 404 + 데이터 미반환 | 200 + 데이터 노출 | P1 | Untested |

## 9. 사용자 데이터 분리 (TC-ISO-*)

| TC-ID | 영역 | 사전조건 | 입력 | 기대 결과 | 실패 조건 | 우선 | 상태 |
|---|---|---|---|---|---|---|---|
| TC-ISO-001 | URL 격리 | A·B 두 사용자 | A 로그인 후 `GET /api/urls/[B의 url id]` | 404 `DB_RECORD_NOT_FOUND` 또는 403 | 200 + B 데이터 노출 | P1 | Untested |
| TC-ISO-002 | 메모 격리 | 동일 | `PATCH /api/memos/[B의 memo id]` | 404/403 | 200 변경됨 | P1 | Untested |
| TC-ISO-003 | 사진 격리 | 동일 | `DELETE /api/albums/photos/[B의 photo id]` | 404/403 | 200 삭제됨 | P1 | Untested |
| TC-ISO-004 | 카테고리 격리 | 동일 | `PATCH /api/albums/categories/[B의 cat id]` | 404/403 | 200 변경됨 | P1 | Untested |
| TC-ISO-005 | 미니홈피 격리 | 동일 | A가 B의 미니홈피 설정 PATCH 시도 | A 자신의 미니홈피만 영향 | B 데이터 변경됨 | P1 | Untested |
| TC-ISO-006 | 공개 페이지 격리 | A 공개/B 비공개 | A `/u/[a-slug]` vs B `/u/[b-slug]` | A 200 / B 404 | B 200 | P1 | Untested |

## 10. 데이터 보관 (소프트 삭제) (TC-RET-*)

| TC-ID | 영역 | 사전조건 | 입력 | 기대 결과 | 실패 조건 | 우선 | 상태 |
|---|---|---|---|---|---|---|---|
| TC-RET-001 | URL 보관 | URL 1건 | 1시간 후 재조회 | 그대로 존재 | 사라짐 | P1 | Untested |
| TC-RET-002 | 삭제 시 소프트 삭제 | URL 삭제 | DB 직접 조회 | `deleted_at` 기록, 행 유지 | 행 사라짐 | P1 | Untested |
| TC-RET-003 | 삭제 조회 제외 | URL 삭제됨 | `GET /api/urls` | 목록에 미포함 | 포함됨 | P1 | Untested |
| TC-RET-004 | 사진 파일 보관 | 사진 행 소프트 삭제 | Supabase Storage 확인 | 파일은 그대로 존재 | 파일 함께 삭제 | P2 | Untested |
| TC-RET-005 | 자동 정리 미존재 | — | 코드 grep | 자동 삭제 작업/스케줄러 없음 | 자동 삭제 존재 | P1 | Untested |

## 11. 반응형 (TC-RWD-*)

| TC-ID | 영역 | 사전조건 | 입력 | 기대 결과 | 실패 조건 | 우선 | 상태 |
|---|---|---|---|---|---|---|---|
| TC-RWD-001 | 모바일 URL 화면 | mobile viewport | `/(admin)/urls` | 1단, 폼/목록 가독 OK | 깨짐 | P2 | Untested |
| TC-RWD-002 | 모바일 앨범 | mobile | `/(admin)/albums` | 그리드 2~3열 폴백 | 깨짐 | P2 | Untested |
| TC-RWD-003 | 모바일 메모 | mobile | `/(admin)/memos` | 카드/입력 정상 | 깨짐 | P2 | Untested |
| TC-RWD-004 | 모바일 꾸미기 미리보기 | mobile | `/(admin)/decorate` | 미리보기 1단 폴백, 편집 패널 스크롤 | 깨짐 | P2 | Untested |
| TC-RWD-005 | 모바일 공개 페이지 | mobile, 공개 | `/u/[slug]` | 1단 폴백, 가독성 | 깨짐 | P2 | Untested |
