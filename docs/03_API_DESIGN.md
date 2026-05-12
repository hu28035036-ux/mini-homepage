---
상태: Approved
버전: v0.1
마지막 수정일: 2026-05-12
문서 목적: 설계 기준 / API 목록·요청/응답·실패 코드
---

# API 설계문서

본 문서는 본 미니홈피 서비스가 노출하는 Next.js Route Handler를 정의한다. 응답 포맷·오류 코드의 정의 자체는 [`docs/18_ERROR_CODE_RESPONSE_STANDARD.md`](18_ERROR_CODE_RESPONSE_STANDARD.md)에 있으며, 본 문서는 어떤 코드가 어떤 API에서 사용되는지를 매핑한다.

## 1. 공통 원칙

1. 모든 API는 응답을 `lib/errors/response.ts`로 생성한다(공통 포맷 보장).
2. 모든 인증 필요 API는 service 진입 시 `requireUser()`로 세션 사용자 확보.
3. 모든 자원 조작 API는 `where user_id = $session_user` 강제(repository 레이어).
4. 모든 조회는 `deleted_at IS NULL` 부착.
5. 입력 검증은 zod(`lib/validators/`)로 service 진입 직전 1회 수행.
6. 다른 사용자의 자원 id를 직접 요청하면 `AUTH_PERMISSION_DENIED`(403) 또는 `DB_RECORD_NOT_FOUND`(404).
7. **공개 미니홈피 API**(`/api/public/[slug]`)는 서버에서 `is_public AND deleted_at IS NULL`을 검증한 후에만 데이터 반환. 프론트엔드만의 차단은 금지.

## 2. 공통 응답 포맷

상세는 §18. 요약:

```json
// 성공
{ "success": true, "data": <any>, "message": "선택" }

// 실패
{ "success": false, "error_code": "<UPPER_SNAKE_CASE>", "message": "사용자용 메시지", "details": {} }
```

HTTP 상태 코드 가이드:
- 200: 성공
- 201: 자원 생성 성공
- 400: 검증 실패 (`VALIDATION_*`, `LAYOUT_INVALID_*`, `DECORATE_INVALID_VALUE`)
- 401: 인증 필요 (`AUTH_REQUIRED`, `AUTH_INVALID_CREDENTIAL`)
- 403: 권한 없음 (`AUTH_PERMISSION_DENIED`)
- 404: 미존재 (`DB_RECORD_NOT_FOUND`, `HOMEPAGE_PRIVATE_OR_NOT_FOUND`)
- 409: 충돌 (`AUTH_EMAIL_DUPLICATE`, `HOMEPAGE_SLUG_DUPLICATE`, `ALBUM_CATEGORY_DUPLICATE`)
- 413: 파일 크기 초과 (`STORAGE_FILE_TOO_LARGE`)
- 500: 서버 오류 (`SERVER_INTERNAL_ERROR`)

## 3. API 목록

### 3-1. 인증

| Method | Path | 인증 | 요청 본문 | 응답 데이터 | 주요 실패 코드 |
|---|---|---|---|---|---|
| POST | `/api/auth/signup` | 불필요 | `{ email, password, nickname }` | `{ user_id }` | `VALIDATION_REQUIRED_FIELD`, `VALIDATION_INVALID_FORMAT`, `AUTH_EMAIL_DUPLICATE` |
| POST | `/api/auth/login` | 불필요 | `{ email, password }` | `{ user_id }` (+ Set-Cookie) | `VALIDATION_REQUIRED_FIELD`, `AUTH_INVALID_CREDENTIAL` |
| POST | `/api/auth/logout` | 필요 | `{}` | `{}` | `AUTH_REQUIRED` |

### 3-2. 미니홈피

| Method | Path | 인증 | 요청 본문 | 응답 데이터 | 주요 실패 코드 |
|---|---|---|---|---|---|
| POST | `/api/homepage` | 필요 | `{ slug, title? }` | `{ homepage_id, slug, is_public:false }` | `HOMEPAGE_SLUG_DUPLICATE`, `HOMEPAGE_ALREADY_EXISTS`, `VALIDATION_INVALID_FORMAT` |
| GET | `/api/homepage` | 필요 | — | 본인 미니홈피 전체(꾸미기·레이아웃 포함) | `DB_RECORD_NOT_FOUND` |
| PATCH | `/api/homepage` | 필요 | `{ title?, intro?, profile_image_url?, is_public?, slug? }` | 갱신된 미니홈피 | `HOMEPAGE_SLUG_DUPLICATE`, `VALIDATION_INVALID_FORMAT` |

### 3-3. URL 보관함

| Method | Path | 인증 | 요청 본문 | 응답 데이터 | 주요 실패 코드 |
|---|---|---|---|---|---|
| GET | `/api/urls` | 필요 | — | `{ items: Url[] }` 최신순 | |
| POST | `/api/urls` | 필요 | `{ title, url }` | `Url` | `VALIDATION_REQUIRED_FIELD`, `URL_INVALID_FORMAT` |
| GET | `/api/urls/[id]` | 필요 | — | `Url` | `DB_RECORD_NOT_FOUND`, `AUTH_PERMISSION_DENIED` |
| PATCH | `/api/urls/[id]` | 필요 | `{ title?, url? }` | `Url` | 위 + `URL_INVALID_FORMAT` |
| DELETE | `/api/urls/[id]` | 필요 | — | `{}` (소프트 삭제) | `DB_RECORD_NOT_FOUND`, `AUTH_PERMISSION_DENIED` |

### 3-4. 앨범 카테고리

| Method | Path | 인증 | 요청 본문 | 응답 데이터 | 주요 실패 코드 |
|---|---|---|---|---|---|
| GET | `/api/albums/categories` | 필요 | — | `{ items: Category[] }` | |
| POST | `/api/albums/categories` | 필요 | `{ name }` | `Category` | `VALIDATION_REQUIRED_FIELD`, `ALBUM_CATEGORY_DUPLICATE` |
| PATCH | `/api/albums/categories/[id]` | 필요 | `{ name }` | `Category` | `ALBUM_CATEGORY_DUPLICATE`, `DB_RECORD_NOT_FOUND`, `AUTH_PERMISSION_DENIED` |
| DELETE | `/api/albums/categories/[id]` | 필요 | — | `{}` (소프트 삭제, 안에 사진 있으면 함께 소프트 삭제) | `DB_RECORD_NOT_FOUND`, `AUTH_PERMISSION_DENIED` |

### 3-5. 사진

| Method | Path | 인증 | 요청 | 응답 데이터 | 주요 실패 코드 |
|---|---|---|---|---|---|
| GET | `/api/albums/photos?category_id=...` | 필요 | 쿼리: `category_id?` | `{ items: Photo[] }` | `DB_RECORD_NOT_FOUND`(category 검증 시) |
| POST | `/api/albums/photos` | 필요 | multipart/form-data: `file`, `category_id`, `caption?` | `Photo` | `VALIDATION_REQUIRED_FIELD`, `PHOTO_INVALID_MIME`, `STORAGE_FILE_TOO_LARGE`, `STORAGE_UPLOAD_FAILED` |
| DELETE | `/api/albums/photos/[id]` | 필요 | — | `{}` (소프트 삭제, 실제 Storage 파일은 보관) | `DB_RECORD_NOT_FOUND`, `AUTH_PERMISSION_DENIED` |

업로드 정책: 허용 MIME = `image/jpeg`, `image/png`, `image/webp`, `image/gif`. 최대 크기 = 10MB. 저장 경로 = `{user_id}/photos/{uuid.ext}`.

### 3-6. 메모

| Method | Path | 인증 | 요청 본문 | 응답 데이터 | 주요 실패 코드 |
|---|---|---|---|---|---|
| GET | `/api/memos` | 필요 | — | `{ items: Memo[] }` | |
| POST | `/api/memos` | 필요 | `{ title, content }` | `Memo` | `VALIDATION_REQUIRED_FIELD` |
| GET | `/api/memos/[id]` | 필요 | — | `Memo` | `DB_RECORD_NOT_FOUND`, `AUTH_PERMISSION_DENIED` |
| PATCH | `/api/memos/[id]` | 필요 | `{ title?, content? }` | `Memo` | 위 + `VALIDATION_REQUIRED_FIELD` |
| DELETE | `/api/memos/[id]` | 필요 | — | `{}` | 위 동일 |

### 3-7. 꾸미기 (색·카드·폰트·배경 + 레이아웃)

| Method | Path | 인증 | 요청 본문 | 응답 데이터 | 주요 실패 코드 |
|---|---|---|---|---|---|
| PUT | `/api/decorate` | 필요 | `{ background_color, background_image_url?, use_background_image, point_color, text_color, card_style, font_style, layout_mode, layout_slots }` | 갱신된 꾸미기 설정 | `DECORATE_INVALID_VALUE`, `LAYOUT_INVALID_MODE`, `LAYOUT_INVALID_SLOT`, `LAYOUT_WIDGET_UNKNOWN`, `LAYOUT_WIDGET_DUPLICATED` |

배경 이미지 업로드는 별도(아래) — `/api/decorate`는 URL만 받는다.

| Method | Path | 인증 | 요청 | 응답 데이터 | 주요 실패 코드 |
|---|---|---|---|---|---|
| POST | `/api/decorate/background` | 필요 | multipart: `file` | `{ background_image_url }` (storage 경로 + 공개 signed URL) | `PHOTO_INVALID_MIME`, `STORAGE_FILE_TOO_LARGE`, `STORAGE_UPLOAD_FAILED` |
| POST | `/api/decorate/profile-image` | 필요 | multipart: `file` | `{ profile_image_url }` | 위와 동일 |

### 3-8. 공개 미니홈피

| Method | Path | 인증 | 요청 | 응답 데이터 | 주요 실패 코드 |
|---|---|---|---|---|---|
| GET | `/api/public/[slug]` | **불필요** | — | `{ homepage, urls, categories, photos, memos }` — `is_public AND deleted_at IS NULL` 인 경우에만 | `HOMEPAGE_PRIVATE_OR_NOT_FOUND` (404로 응답) |

서버 검증 순서(반드시):
1. `slug`로 `mini_homepages` 조회. `is_public = true AND deleted_at IS NULL` 조건 포함.
2. 못 찾으면 즉시 404 + `HOMEPAGE_PRIVATE_OR_NOT_FOUND` 반환. **존재 여부를 외부에 노출하지 않기 위해 "비공개"와 "없음"을 동일 코드로 통일한다.**
3. 찾으면 해당 homepage의 `user_id` 기준으로 urls/album_categories/photos/memos를 `deleted_at IS NULL`로 조회.
4. 반환 시 비밀번호 해시, 이메일, audit 데이터 등 민감 컬럼은 절대 포함하지 않는다.

## 4. 보안 검증 시나리오 (모든 API 공통)

| 시나리오 | 기대 동작 |
|---|---|
| 비로그인 사용자가 인증 필요 API 호출 | 401 `AUTH_REQUIRED` |
| A 사용자가 B 사용자의 자원 id를 직접 호출 | 404 `DB_RECORD_NOT_FOUND` (자원 존재 노출 방지) 또는 403 `AUTH_PERMISSION_DENIED` |
| 인증된 사용자가 `is_public=false`인 자기 미니홈피의 공개 페이지 접근 | `/api/public/[slug]`는 무조건 404. 본인 화면은 `/(admin)`에서 봐야 함 |
| 비공개 미니홈피 slug 직접 brute-force | 모두 404 동일 응답 |
| 다른 사용자의 사진 image_url을 알아냄 | Storage 버킷은 공개 접근 차단(시그니처/짧은 signed URL). v1에서는 공개 미니홈피의 이미지에 한해 영구 공개 URL 허용, 나머지는 signed URL |

## API 검증 기준 (하네스)

- [ ] 모든 API가 §2 공통 응답 포맷을 따르는가?
- [ ] 모든 인증 필요 API가 `requireUser()`로 세션을 검증하는가?
- [ ] 모든 자원 조작이 `user_id` 검증을 거치는가?
- [ ] 모든 조회에 `deleted_at IS NULL` 조건이 부착되는가?
- [ ] `/api/public/[slug]`가 `is_public=false` 미니홈피에 대해 404를 반환하는가?
- [ ] `/api/decorate`가 `layout_slots`를 §02 §4 규칙으로 서버 검증하는가?
- [ ] 사진 업로드가 MIME/크기 검증을 통과하는가?
- [ ] 다른 사용자의 자원 id 직접 요청이 403/404로 차단되는가?
- [ ] 응답에 비밀번호 해시, 이메일 등 민감 컬럼이 포함되지 않는가?
- [ ] 오류 응답 코드가 `docs/18_ERROR_CODE_RESPONSE_STANDARD.md`에 모두 정의되어 있는가?
