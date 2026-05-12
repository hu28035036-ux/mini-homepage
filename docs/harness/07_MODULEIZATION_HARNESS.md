---
상태: Approved
버전: v0.1
마지막 수정일: 2026-05-12
문서 목적: 하네스 / 단위화
---

# 단위화 / 모듈화 하네스

`docs/17_MODULEIZATION_GUIDE.md` 의 규칙을 코드가 지키는지 확인한다.

## 체크리스트

- [ ] 한 파일이 200줄을 넘지 않는가? (필요 시 분해)
- [ ] `src/` 트리가 17번 가이드의 폴더 구조와 일치하는가?
- [ ] 비즈니스 로직이 페이지/컴포넌트에 직접 박혀 있지 않고 `lib/services/`에 있는가?
- [ ] DB 호출이 Route Handler/Component가 아니라 `lib/repositories/`에서만 수행되는가?
- [ ] Repository가 모든 쿼리에 `user_id`와 `deleted_at IS NULL`을 자동 부착하는가?
- [ ] 응답이 `lib/errors/response.ts`로만 생성되는가?
- [ ] zod 스키마가 도메인별 파일로 분리되어 있는가?
- [ ] 컴포넌트 파일명이 PascalCase, 일반 TS 파일이 camelCase인가?
- [ ] 의존성 방향 규칙(Page→Service→Repository)을 따르는가?
- [ ] 중복 로직이 발견되면 공통 모듈로 분리되었는가?
- [ ] 신규 기능이 적절한 디렉터리에 추가되었는가? (기존 큰 파일에 덧붙이지 않음)
- [ ] 클라이언트 컴포넌트(`'use client'`)가 가능한 좁은 영역에만 적용되어 있는가?
