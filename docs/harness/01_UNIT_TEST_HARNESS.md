---
상태: Approved
버전: v0.1
마지막 수정일: 2026-05-12
문서 목적: 하네스 / 단위 테스트
---

# 단위 테스트 하네스

순수 함수, validator(zod 스키마), service의 단위 동작을 검증한다.

## 1. 대상

- `src/lib/utils/*` — `slug.ts`, `date.ts`, `image.ts`
- `src/lib/validators/*` — `auth.ts`, `urls.ts`, `albums.ts`, `memos.ts`, `decorate.ts`
- `src/lib/services/*` — `auth.ts`, `homepage.ts`, `urls.ts`, `albums.ts`, `memos.ts`, `decorate.ts`, `publicView.ts`
- `src/lib/auth/password.ts` — bcrypt 해시/검증

## 2. 도구

- Vitest(권장). `npm run test`.
- Supabase는 mock(서비스 단위 테스트). API/DB 통합 테스트는 §02 하네스 참조.

## 3. 필수 케이스

- [ ] `slug.ts`: 영문/숫자/하이픈 3~30자 — pass/fail 각 1건씩
- [ ] `urls.ts` validator: 정상 URL / 빈 문자열 / 잘못된 스킴
- [ ] `decorate.ts` validator: 정상 / `card_style`/`font_style` enum 위반 / `layout_mode` 위반 / 슬롯 수 불일치 / 슬롯 중복 / 위젯 중복(empty 제외) / 알 수 없는 위젯
- [ ] `password.ts`: 해시는 bcrypt 형식, 검증은 정/오답 분리
- [ ] `services/auth.ts`: signup 중복 이메일 → `AUTH_EMAIL_DUPLICATE` throw, login 오답 → `AUTH_INVALID_CREDENTIAL`
- [ ] `services/decorate.ts`: 위 validator 호출 + 비즈니스 검증(예: 본인 미니홈피만 수정)

## 4. 체크리스트

- [ ] 모든 validator에 정상/실패 케이스가 각 1건 이상 있는가?
- [ ] service가 throw하는 모든 `error_code`가 §18에 정의되어 있는가?
- [ ] 외부 의존(Supabase, FS)을 mock으로 격리했는가?
- [ ] 한 케이스가 한 가지만 검증하는가?
- [ ] 실패 메시지가 명확한가(어떤 입력에서 무엇이 틀렸는지)?
