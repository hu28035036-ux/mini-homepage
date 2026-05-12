---
상태: Approved
버전: v0.1
마지막 수정일: 2026-05-12
문서 목적: 하네스 / 오류 응답
---

# 오류 응답 하네스

`docs/18_ERROR_CODE_RESPONSE_STANDARD.md`의 응답 포맷과 오류 코드 카탈로그를 코드가 지키는지 확인한다.

## 체크리스트

- [ ] 모든 성공 응답이 `{ success:true, data, message? }` 포맷인가?
- [ ] 모든 실패 응답이 `{ success:false, error_code, message, details? }` 포맷인가?
- [ ] 모든 `error_code`가 §18 §3 카탈로그에 정의되어 있는가?
- [ ] HTTP 상태 코드가 §18 §3의 매핑과 일치하는가?
- [ ] 응답 생성이 `lib/errors/response.ts`의 헬퍼만 사용하는가? (`Response.json` 직접 호출 금지)
- [ ] 사용자 메시지에 비밀번호 해시, 내부 SQL, 다른 사용자 식별자 등 민감 정보가 노출되지 않는가?
- [ ] `HOMEPAGE_PRIVATE_OR_NOT_FOUND`가 비공개와 미존재를 분리해서 다른 메시지로 응답하지 않는가?
- [ ] `AUTH_INVALID_CREDENTIAL`이 이메일 존재 여부를 노출하지 않는가? (메시지 통일)
- [ ] 예외(throw) 발생 시 fallback이 `SERVER_INTERNAL_ERROR`(500)으로 통일되는가?
- [ ] 응답 코드 변경 시 §18을 먼저 갱신했는가?
