---
name: error-response-standard
description: 본 미니홈피 프로젝트의 API 응답이 `docs/18_ERROR_CODE_RESPONSE_STANDARD.md`의 공통 포맷과 코드 카탈로그를 따르는지 확인하고 정정한다. 새 오류 발생 위치를 §18 카탈로그에 추가하고, 응답 헬퍼(`lib/errors/response.ts`) 외 직접 응답 생성을 차단한다.
---

# error-response-standard

## 사용 시점

- 새 API/예외 핸들러 추가 시
- 응답 포맷이 일관되지 않다고 느낄 때

## 동작

1. 변경된 Route Handler/Service에서 `Response.json` 직접 호출 grep — 발견 시 `ok()`/`fail()` 사용으로 교체 권장
2. throw되는 `error_code` 식별자를 §18 §3 카탈로그와 비교 — 미정의 코드는 §18에 먼저 추가
3. 사용자 메시지가 민감 정보(이메일 존재 여부, 내부 SQL, 비밀번호) 노출하지 않는지 검사
4. HTTP 상태 코드 매핑 일치 검사
5. `HOMEPAGE_PRIVATE_OR_NOT_FOUND`가 비공개와 미존재를 동일 응답으로 처리하는지 확인
6. `AUTH_INVALID_CREDENTIAL`이 이메일 존재 여부를 노출하지 않는지 확인

## 출력

- 위반 목록과 자동 정정 제안
- §18 카탈로그 추가 항목 안내
