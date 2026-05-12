---
상태: Draft
버전: v0.1
마지막 수정일: 2026-05-12
문서 목적: 운영 / 운영 런북
---

# 운영 런북

운영 중 발생하는 일반적인 상황의 대응 절차를 정리한다.

## 1. 모니터링 (v1 최소)

- Vercel: 함수 실행 시간/에러 알람
- Supabase: DB 사용량, Storage 사용량, 오류 로그
- 로컬 로그: 본 v1에는 별도 외부 로깅 없음. 추후 Logflare/Sentry 도입 검토.

## 2. 일반 시나리오

### 2-1. 사용자가 "내 공개 미니홈피가 안 보여요"

1. 사용자의 `mini_homepages.is_public` 확인 — `false`이면 본인이 켜야 함을 안내.
2. `deleted_at` 확인 — null이 아니면 미니홈피 자체가 소프트 삭제됨.
3. slug 오타 여부 확인.
4. 위 모두 정상인데 안 보이면 서버 로그에서 `HOMEPAGE_PRIVATE_OR_NOT_FOUND` 코드 발생 여부 확인.

### 2-2. 사용자가 "데이터가 사라졌어요"

1. v1은 자동 삭제가 없으므로 사용자 본인 또는 다른 세션이 삭제한 케이스.
2. DB에서 `deleted_at` 행을 확인 — 존재하면 휴지통 같은 UI는 없으나 수동 복구 가능: `update ... set deleted_at = null where id = ?`.
3. 운영자가 직접 SQL을 실행하기 전 사용자 본인 인증 + 작업 기록을 `docs/08_VALIDATION_LOG.md` 또는 별도 운영 로그에 남긴다.

### 2-3. 사용자가 "비밀번호를 잊었어요"

- v1 비밀번호 재설정 기능 없음. 다음 중 하나로 대응:
  - 사용자 본인 확인 후 운영자가 임시 비밀번호 생성 → 사용자가 로그인 후 변경 (v2에 비번 변경 기능 도입 예정).
  - 또는 새 계정 생성 권장 (데이터 인계는 불가).
- 비밀번호 재설정 흐름은 v2 별도 Phase로 도입.

### 2-4. 이미지 업로드 실패

1. 응답 코드 확인:
   - `PHOTO_INVALID_MIME` → 사용자에게 jpg/png/webp/gif만 가능 안내.
   - `STORAGE_FILE_TOO_LARGE` → 10MB 이하로 안내.
   - `STORAGE_UPLOAD_FAILED` → Supabase Storage 상태 확인 (할당량, 버킷 권한).

### 2-5. slug 변경 요청

- `PATCH /api/homepage` `slug` 필드로 가능. 중복은 `HOMEPAGE_SLUG_DUPLICATE`.
- 변경 시 외부에서 이전 slug로 접근하면 404. 사용자에게 사전 안내 권장.

## 3. 비상 시나리오

### 3-1. 키 유출 (`SUPABASE_SERVICE_ROLE_KEY` 또는 `SESSION_SECRET`)

1. Supabase 대시보드에서 즉시 서비스 롤 키 회전.
2. `SESSION_SECRET` 회전 → 모든 사용자 로그아웃됨.
3. Vercel 환경변수 업데이트 → 재배포.
4. 유출 경로 파악 (코드 grep, 로그 grep).
5. `docs/12_DESIGN_CHANGE_REQUESTS.md`에 사건 기록 + 재발 방지 액션.

### 3-2. DB 데이터 손상

`docs/14_BACKUP_ROLLBACK_PLAN.md` §5 복원 절차 수행.

### 3-3. 외부 공격 / 비정상 트래픽

- Vercel 측 차단 기능 활성화.
- Supabase 측 RLS 미사용이므로 모든 보호는 애플리케이션 레이어에 의존 — 보안 하네스 회귀 즉시 수행.

## 4. 정기 작업

- 주 1회: 백업 수행 (`docs/14`)
- 월 1회: 의존성 보안 업데이트 (`npm audit`, Supabase CLI 최신화)
- 분기 1회: 보안 하네스(`docs/harness/05`) 전수 재점검
