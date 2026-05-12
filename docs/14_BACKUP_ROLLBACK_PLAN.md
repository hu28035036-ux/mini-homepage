---
상태: Draft
버전: v0.1
마지막 수정일: 2026-05-12
문서 목적: 운영 / 백업·롤백
---

# 백업 / 롤백 계획

사용자가 직접 삭제하지 않은 데이터는 계속 보관한다(스펙 §3). 따라서 DB와 Storage 둘 다 정기 백업 가능하도록 설계한다.

## 1. 백업 대상

- **DB**: `users`, `mini_homepages`, `urls`, `album_categories`, `photos`, `memos` (모든 컬럼 + `deleted_at` 포함). `pg_dump`로 전체 dump.
- **Storage**: `user-uploads` 버킷 전체. 프로필 이미지, 배경 이미지, 사진.

## 2. 빈도 (권장)

- v1 초기: **수동 주 1회**.
- v1 안정화 후: 일일 자동 백업 + 주간 별도 보관.
- 자동화는 v2에서 도입.

## 3. DB 백업 절차 (수동)

```bash
# 환경변수에 운영 DB URL 설정 후
pg_dump "$SUPABASE_DB_URL_PROD" \
  --no-owner --no-privileges \
  -f backups/db/$(date +%Y%m%d)_full.sql

# 압축
gzip backups/db/$(date +%Y%m%d)_full.sql
```

보관 위치: 별도 외부 저장소(예: 로컬 NAS 또는 S3 버킷). 운영 Supabase 자체에 백업을 두지 않는다.

## 4. Storage 백업 절차 (수동)

```bash
# Supabase CLI로 버킷 전체 다운로드
npx supabase storage cp \
  --recursive \
  ss:///user-uploads ./backups/storage/$(date +%Y%m%d)/
```

## 5. 복원 절차

### 5-1. DB 복원

1. 운영 DB 전체 백업(롤백 직전 상태)을 한 번 더 수행.
2. 새 Supabase 프로젝트(스테이징)로 먼저 복원하여 검증.
3. 운영 DB에 적용:
   ```bash
   psql "$SUPABASE_DB_URL_PROD" -f backups/db/<date>_full.sql
   ```
4. 핵심 TC를 1사이클 수동 점검.

### 5-2. Storage 복원

```bash
npx supabase storage cp --recursive ./backups/storage/<date>/ ss:///user-uploads/
```

## 6. 롤백 시나리오

| 시나리오 | 액션 |
|---|---|
| 배포 후 핵심 기능 회귀 발견 | Vercel에서 이전 배포로 즉시 롤백 (DB 변경 미수반 시) |
| 마이그레이션 후 데이터 손상 | DB 전체 복원 (5-1) |
| 사용자 실수 삭제 | v1에는 휴지통 없음. `deleted_at`로 행은 유지되므로 DB에서 직접 `update set deleted_at = null` (관리자 수동 절차) |
| 보안 사고 (키 유출) | 즉시 Supabase 서비스 롤 키 회전 + 세션 secret 회전 → 전 사용자 로그아웃 |

## 7. 자동 삭제 금지

- v1에서는 어떤 자동 정리/만료/휴면 삭제도 만들지 않는다.
- 백업본도 사용자 동의 없이 정기 삭제하지 않는다(법적 요건이 생기면 별도 정책).

## 8. 체크리스트

- [ ] DB/Storage 백업이 운영 환경 밖에 보관되는가
- [ ] 키 유출 대비 회전 절차가 문서화되어 있는가
- [ ] 복원 절차가 스테이징에서 검증된 적이 있는가 (v1.0 배포 전 최소 1회)
- [ ] 자동 삭제 작업/스케줄러가 존재하지 않는가 (코드 grep으로 재확인)
