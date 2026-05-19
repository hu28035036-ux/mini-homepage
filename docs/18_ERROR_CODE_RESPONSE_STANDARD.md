---
상태: Approved
버전: v0.1
마지막 수정일: 2026-05-12
문서 목적: 설계 기준 / 오류 코드·응답 표준 (단일 소스)
---

# 오류 코드 / 응답 메시지 표준

본 문서는 본 미니홈피 서비스의 **모든 API 응답 포맷**과 **모든 `error_code`** 를 단일 소스로 정의한다. 다른 문서(특히 `03_API_DESIGN.md`, 하네스 문서)는 본 문서의 코드를 참조만 한다.

## 1. 공통 응답 형식

### 1-1. 성공 응답

```json
{
  "success": true,
  "data": { /* 자원 또는 결과 객체 */ },
  "message": "선택. 사용자에게 안내가 필요할 때만 채움"
}
```

### 1-2. 실패 응답

```json
{
  "success": false,
  "error_code": "VALIDATION_REQUIRED_FIELD",
  "message": "필수 입력값이 누락되었습니다.",
  "details": {
    "field": "email"
  }
}
```

- `error_code`: 본 문서에 정의된 UPPER_SNAKE_CASE 식별자 중 하나.
- `message`: 한국어 사용자용 메시지. 민감 정보(이메일 존재 여부 등)를 노출하지 않는다.
- `details`: 클라이언트가 추가 처리할 수 있는 정보(예: 어느 필드인가, 어떤 값이 충돌하는가). 비밀번호/해시/내부 SQL 메시지 절대 포함 금지.

## 2. 오류 코드 네이밍 규칙

- 형식: `영역_상황_원인`
- 모두 UPPER_SNAKE_CASE.
- 영역은 도메인 또는 카테고리: `AUTH`, `VALIDATION`, `HOMEPAGE`, `URL`, `ALBUM`, `PHOTO`, `MEMO`, `DECORATE`, `LAYOUT`, `STORAGE`, `DB`, `TRASH`, `RATE`, `SERVER`.

## 3. 오류 코드 카탈로그

### 3-1. AUTH

| 코드 | HTTP | 사용자 메시지 | 발생 위치 |
|---|---|---|---|
| `AUTH_REQUIRED` | 401 | 로그인이 필요합니다. | 모든 인증 필요 API의 세션 미존재 |
| `AUTH_INVALID_CREDENTIAL` | 401 | 이메일 또는 비밀번호가 올바르지 않습니다. | `/api/auth/login` |
| `AUTH_EMAIL_DUPLICATE` | 409 | 이미 사용 중인 이메일입니다. | `/api/auth/signup` |
| `AUTH_PERMISSION_DENIED` | 403 | 권한이 없습니다. | 모든 자원 조작에서 소유자 불일치 시 |

### 3-2. VALIDATION

| 코드 | HTTP | 사용자 메시지 | 발생 위치 |
|---|---|---|---|
| `VALIDATION_REQUIRED_FIELD` | 400 | 필수 입력값이 누락되었습니다. | 모든 API |
| `VALIDATION_INVALID_FORMAT` | 400 | 입력 형식이 올바르지 않습니다. | 이메일/URL/색상 등 형식 검증 |

### 3-3. HOMEPAGE

| 코드 | HTTP | 사용자 메시지 | 발생 위치 |
|---|---|---|---|
| `HOMEPAGE_SLUG_DUPLICATE` | 409 | 이미 사용 중인 주소입니다. | `POST /api/homepage`, `PATCH /api/homepage` |
| `HOMEPAGE_ALREADY_EXISTS` | 409 | 이미 미니홈피가 있습니다. | `POST /api/homepage` |
| `HOMEPAGE_PRIVATE_OR_NOT_FOUND` | 404 | 페이지를 찾을 수 없거나 비공개 상태입니다. | `GET /api/public/[slug]` |

### 3-4. URL

| 코드 | HTTP | 사용자 메시지 | 발생 위치 |
|---|---|---|---|
| `URL_INVALID_FORMAT` | 400 | 올바른 URL 형식이 아닙니다. | `/api/urls` POST/PATCH |
| `URL_CATEGORY_DUPLICATE` | 409 | 이미 사용 중인 카테고리 이름입니다. | `/api/urls/categories` (마이그 0009) |

### 3-5. ALBUM / PHOTO

| 코드 | HTTP | 사용자 메시지 | 발생 위치 |
|---|---|---|---|
| `ALBUM_CATEGORY_DUPLICATE` | 409 | 이미 사용 중인 카테고리 이름입니다. | `/api/albums/categories` |
| `PHOTO_INVALID_MIME` | 400 | 지원하지 않는 이미지 형식입니다. | 사진/배경/프로필 업로드 |

### 3-6. MEMO

| 코드 | HTTP | 사용자 메시지 | 발생 위치 |
|---|---|---|---|
| `MEMO_CATEGORY_DUPLICATE` | 409 | 이미 사용 중인 카테고리 이름입니다. | `/api/memos/categories` (마이그 0009) |

### 3-7. DECORATE / LAYOUT

| 코드 | HTTP | 사용자 메시지 | 발생 위치 |
|---|---|---|---|
| `DECORATE_INVALID_VALUE` | 400 | 꾸미기 설정 값이 올바르지 않습니다. | `/api/decorate` (색·카드·폰트 enum 위반) |
| `CARD_CATEGORY_DUPLICATE` | 409 | 이미 사용 중인 카테고리 이름입니다. | `/api/cards/categories` (마이그 0007) |
| `LAYOUT_INVALID_MODE` | 400 | 레이아웃 모드 값이 올바르지 않습니다. | `/api/decorate` (`layout_mode` enum 위반) |
| `LAYOUT_INVALID_SLOT` | 400 | 슬롯 번호가 올바르지 않습니다. | `/api/decorate` (slot 범위/중복) |
| `LAYOUT_WIDGET_UNKNOWN` | 400 | 알 수 없는 위젯입니다. | `/api/decorate` (widget enum 위반) |
| `LAYOUT_WIDGET_DUPLICATED` | 400 | 같은 위젯을 중복 배치할 수 없습니다. | `/api/decorate` (empty 외 위젯 중복) |

### 3-8. STORAGE

| 코드 | HTTP | 사용자 메시지 | 발생 위치 |
|---|---|---|---|
| `STORAGE_UPLOAD_FAILED` | 500 | 파일 업로드에 실패했습니다. | 사진/배경/프로필 업로드 |
| `STORAGE_FILE_TOO_LARGE` | 413 | 파일 크기가 너무 큽니다. (최대 10MB) | 위 동일 |

### 3-9. DB

| 코드 | HTTP | 사용자 메시지 | 발생 위치 |
|---|---|---|---|
| `DB_RECORD_NOT_FOUND` | 404 | 데이터를 찾을 수 없습니다. | 자원 조회/수정/삭제에서 미존재 또는 소유자 불일치 시 |

### 3-9-1. TRASH

| 코드 | HTTP | 사용자 메시지 | 발생 위치 |
|---|---|---|---|
| `TRASH_RESTORE_BLOCKED` | 409 | 이 항목의 카테고리가 삭제 상태입니다. 카테고리를 먼저 복구해 주세요. | `POST /api/trash/restore` (사진 복구 시 소속 카테고리가 삭제 상태) |

### 3-10. SERVER

| 코드 | HTTP | 사용자 메시지 | 발생 위치 |
|---|---|---|---|
| `SERVER_INTERNAL_ERROR` | 500 | 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요. | 예외 fallback |

### 3-11. RATE (예약)

v1 미구현. 추후 도입 시 `RATE_LIMIT_EXCEEDED` (429) 사용.

## 4. 사용자 메시지 vs 개발자 로그

- 응답의 `message`는 사용자에게 보여줘도 안전한 한국어 문장이다.
- 개발자 로그(`console.error` 또는 외부 로깅)에는 자세한 원인을 적되, 다음을 절대 남기지 않는다:
  - 평문 비밀번호
  - 비밀번호 해시 전체
  - 다른 사용자의 식별 정보(`user_id` 외)
  - 외부 API 키, 서비스 롤 키
  - 원본 SQL이 사용자 입력을 그대로 포함하는 형태

## 5. 응답 헬퍼 시그니처 (구현 참조)

```ts
// src/lib/errors/response.ts (Phase 1에서 구현)
export function ok<T>(data: T, message?: string) {
  return Response.json({ success: true, data, message });
}
export function fail(code: ErrorCode, status: number, message: string, details?: Record<string, unknown>) {
  return Response.json({ success: false, error_code: code, message, details }, { status });
}
```

## 6. 오류 응답 전용 하네스

- [ ] 모든 실패 응답이 `success:false` + `error_code` + `message` 3필드를 포함하는가?
- [ ] 모든 `error_code`가 §3 카탈로그에 정의되어 있는가?
- [ ] HTTP 상태 코드가 §3의 매핑과 일치하는가?
- [ ] 사용자 메시지에 민감 정보가 노출되지 않는가?
- [ ] 개발자 로그에 비밀번호/키가 남지 않는가?
- [ ] `HOMEPAGE_PRIVATE_OR_NOT_FOUND`가 비공개와 미존재를 구분하지 않는가?
- [ ] 응답이 `lib/errors/response.ts` 헬퍼를 통해 생성되는가?
