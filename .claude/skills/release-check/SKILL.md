---
name: release-check
description: 본 미니홈피 프로젝트의 배포 전 점검을 자동화한다. `docs/15_RELEASE_CHECKLIST.md`의 모든 항목 — lint/typecheck/build/test 통과, `SUPABASE_SERVICE_ROLE_KEY` 클라이언트 미노출, `is_public` 기본 false 회귀, 백업 보관 확인 등 — 을 순차 실행한다.
---

# release-check

## 사용 시점

- Phase 10 마감 + 운영 배포 직전
- 큰 변경 후 스테이징 검증 직후

## 동작

1. `docs/15_RELEASE_CHECKLIST.md` §1~§7 항목 순차 수행
2. `npm run lint && npm run typecheck && npm run test && npm run build`
3. 빌드 산출물(`.next/`)에서 `SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET` grep — 발견되면 즉시 차단
4. 운영 DB 백업 1건 보관 확인 (`docs/14_BACKUP_ROLLBACK_PLAN.md`)
5. 보안 회귀: TC-AUTH-005 / TC-ISO-* / TC-PUB-001,004,006,007 통과 확인
6. 결과를 `docs/08_VALIDATION_LOG.md` Phase 10 엔트리에 회차 기록

## 차단 조건

- 클라이언트 번들에 서비스 롤 키 노출 → 차단
- 기본값 회귀 실패(`is_public` 기본 true 발견 등) → 차단
- 테스트 미통과/미실행 → 차단

## 출력

- 통과/실패 항목, 차단 사유, 다음 액션
