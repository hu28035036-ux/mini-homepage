-- 0010_private_bucket.sql
-- user-uploads 버킷을 private으로 전환한다.
-- 이미지 접근은 /api/img 프록시가 통제한다(본인 또는 공개 미니홈피 소유자).
-- 버킷이 아직 없는 환경에서는 0건 갱신 — 무해.
update storage.buckets set public = false where id = 'user-uploads';
