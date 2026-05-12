---
상태: Approved
버전: v0.1
마지막 수정일: 2026-05-12
문서 목적: 설계 기준 / 단위화·모듈화 기준
---

# 단위화 / 모듈화 가이드

본 문서는 Next.js + Supabase 스택 위에서 본 미니홈피 서비스 코드를 어떻게 역할별로 나눌지를 정의한다. Ralph Loop v7.1 §13 표준을 본 프로젝트에 맞춰 적용한다.

## 1. 기본 원칙

- 한 파일은 하나의 주요 역할만 담당한다.
- 한 함수는 하나의 책임만 가진다.
- UI / API 라우터 / service / repository / validator / schema / util / test를 분리한다.
- 같은 로직을 여러 곳에 복사하지 않는다. 공통 로직은 service/validator/repository/util 중 적절한 위치로 분리한다.
- 새 기능은 가능한 한 독립 모듈(서브 디렉터리)로 작성한다.
- 리팩토링은 기능 변경과 분리해서 진행한다.

## 2. 역할별 분리 기준

### 2-1. UI / Component

`src/components/<도메인>/<컴포넌트>.tsx`

- 도메인별 폴더(`urls/`, `albums/`, `memos/`, `decorate/`, `public/`, `home/`, `ui/`).
- 한 컴포넌트는 단일 책임. 200줄을 넘기면 분해 검토.
- 비즈니스 로직 금지(API 호출 + 상태 관리 + 렌더링까지). 비즈니스 결정은 service 또는 서버 컴포넌트.
- 클라이언트 컴포넌트는 `'use client'` 선언 + 가능한 좁은 영역(예: 폼 자체만).

### 2-2. Page / Route

`src/app/.../page.tsx` 또는 `route.ts`

- 페이지는 데이터 로드(service 호출) + 컴포넌트 조립만.
- Route Handler는 zod 검증 → service 호출 → response 변환만.
- 라우트 안에 DB 호출 직접 작성 금지. 반드시 service → repository.

### 2-3. Service (`src/lib/services/`)

- 비즈니스 규칙의 단일 진입점.
- 책임:
  - 세션 사용자 확보(`requireUser()`)
  - 자원 소유자 검증(`assertOwnership()`)
  - 입력 zod 스키마 호출
  - repository 호출 결과 가공
  - 비즈니스 에러를 `error_code`로 변환 후 throw

도메인별 파일: `auth.ts`, `homepage.ts`, `urls.ts`, `albums.ts`, `memos.ts`, `decorate.ts`, `publicView.ts`.

### 2-4. Repository (`src/lib/repositories/`)

- DB 호출의 단일 진입점.
- 책임:
  - Supabase 클라이언트로 SELECT/INSERT/UPDATE/DELETE 수행
  - **모든 쿼리에 `where user_id = $session_user` 와 `deleted_at IS NULL` 자동 부착**
  - 행 → 도메인 타입 변환
- 비즈니스 규칙 금지. 그건 service의 책임.
- 도메인별 파일: `users.ts`, `homepages.ts`, `urls.ts`, `albumCategories.ts`, `photos.ts`, `memos.ts`.

`publicView`는 별도의 read-only repository(또는 service 내부)에서 `is_public=true AND deleted_at IS NULL` 조건으로 동작.

### 2-5. Validator / Schema (`src/lib/validators/`)

- zod 스키마. 도메인별 파일.
- 단일 책임: 입력 형식 검증. 비즈니스 검증은 service.
- 예시: `urls.ts` → `createUrlSchema`, `updateUrlSchema`.
- 검증 실패는 `VALIDATION_*` 코드로 표준화.

### 2-6. Errors (`src/lib/errors/`)

- `codes.ts`: §18에 정의된 모든 코드의 TypeScript enum/리터럴 유니언.
- `response.ts`: `ok(data)`, `fail(code, message?, details?)` 헬퍼. 모든 응답은 이 헬퍼로 생성.

### 2-7. Auth (`src/lib/auth/`)

- `password.ts`: bcrypt 해시/검증.
- `session.ts`: 쿠키 발급/검증(iron-session 또는 jose).
- `guards.ts`: `requireUser()`, `assertOwnership(resource, userId)` 등.

### 2-8. Storage (`src/lib/storage/`)

- `paths.ts`: `photoPath(userId, ext)`, `backgroundPath(userId, ext)`, `profilePath(userId, ext)`.
- `uploader.ts`: `upload(buffer, mime, path)`, `delete(path)`, `signedUrl(path, ttl)`.
- 추상 인터페이스로 분리(추후 S3/R2 교체 대비).

### 2-9. Util (`src/lib/utils/`)

- 순수 함수만. 외부 의존 금지.
- `slug.ts`: slug 형식 검증/생성.
- `date.ts`: 표시용 포맷.
- `image.ts`: 클라이언트 MIME/확장자 검사.

### 2-10. Types (`src/types/`)

- `db.ts`: Supabase에서 생성한 또는 수기 정의한 row 타입.
- `api.ts`: 요청/응답 타입.
- `decorate.ts`: `LayoutMode`, `WidgetKind`, `LayoutSlot` 타입 (§02 §4 정의에 1:1 매칭).

### 2-11. Tests (`tests/`)

- `unit/`: 순수 함수 + service + validator 단위 테스트.
- `api/`: route handler 통합 테스트(Supabase mock 또는 별도 test DB).
- `ui/`: 컴포넌트 렌더 + 사용자 흐름.

Phase 7부터 본격 보강. Phase 2~6에서는 핵심 경로만 단위 테스트.

## 3. 파일/디렉터리 명명 규칙

- TypeScript 파일은 camelCase 또는 kebab-case 중 한 쪽 일관 사용 — 본 프로젝트는 **camelCase**로 통일.
- 컴포넌트 파일은 **PascalCase**(예: `UrlForm.tsx`).
- 라우트는 Next.js 규칙(`route.ts`, `page.tsx`, `[id]`).
- 환경변수는 UPPER_SNAKE_CASE.

## 4. 의존성 방향 규칙

```text
Page/Route → Service → Repository → Supabase
                ↘ Validator (zod)
                ↘ Errors (codes/response)
                ↘ Storage (Supabase Storage 어댑터)
Component → 직접 API 호출 (fetch) 또는 서버 컴포넌트 props
```

- Repository는 Service만 import한다. Component/Page는 Repository를 직접 호출하지 않는다.
- Util/Errors/Types는 어디서나 import 가능.
- Service는 다른 Service를 호출할 수 있지만 순환 의존을 만들지 않는다.

## 5. 단위화/모듈화 전용 하네스

- [ ] 한 파일이 200줄을 넘지 않는가? (예외 시 분해 검토)
- [ ] UI / Page / Service / Repository / Validator / Errors / Auth / Storage / Util / Types / Tests 디렉터리가 분리되어 있는가?
- [ ] 페이지/컴포넌트에 DB 호출이 직접 있지 않는가?
- [ ] Route Handler가 검증 → service 호출 → response 변환만 수행하는가?
- [ ] Repository가 모든 쿼리에 `user_id`와 `deleted_at IS NULL`을 부착하는가?
- [ ] zod 스키마가 service 진입 직전에 1회 호출되는가?
- [ ] 응답이 `lib/errors/response.ts`로만 생성되는가?
- [ ] 새 기능이 적절한 디렉터리에 추가되었는가?
- [ ] 의존성 방향이 §4를 따르는가?
- [ ] 중복 로직이 발견되면 공통 모듈로 분리되었는가?
