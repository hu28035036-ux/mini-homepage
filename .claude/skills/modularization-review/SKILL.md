---
name: modularization-review
description: 본 미니홈피 프로젝트의 코드가 `docs/17_MODULEIZATION_GUIDE.md`의 UI/Page/Service/Repository/Validator/Errors/Auth/Storage/Util/Types/Tests 분리와 의존성 방향(Page→Service→Repository)을 지키는지 검토한다. 한 파일 200줄 초과, 페이지에 박힌 DB 호출, response 직접 생성 등을 잡아낸다.
---

# modularization-review

## 사용 시점

- 새 파일 추가 후
- 큰 변경(여러 파일 영향) 후
- Phase 종료 직전

## 동작

1. 변경 파일의 줄 수 확인 — 200줄 초과는 분해 검토
2. 디렉터리 위치가 17번 가이드와 일치하는지 확인
3. 의존성 방향 위반 검사:
   - Page/Component에서 직접 Supabase 호출 → ✗
   - Component에서 Repository 직접 import → ✗
   - Service ↔ Service 순환 의존 → ✗
4. 응답 생성이 `lib/errors/response.ts`만 사용하는지 grep
5. Repository 쿼리에 `user_id`와 `deleted_at IS NULL`이 부착되는지 grep
6. zod 스키마가 도메인별 파일로 분리되어 있는지 확인

## 출력

- 위반 목록(파일·줄·원인)
- 분해/이동 권장
