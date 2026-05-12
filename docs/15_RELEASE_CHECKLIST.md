---
상태: Draft
버전: v0.1
마지막 수정일: 2026-05-12
문서 목적: 운영 / 릴리즈 체크리스트
---

# 릴리즈 체크리스트

배포 전(특히 운영 환경 배포 전) 반드시 통과해야 하는 항목.

## 1. 코드 / 빌드

- [ ] `npm run lint` 0 에러
- [ ] `npm run typecheck` 0 에러
- [ ] `npm run test` 전부 통과 (`Untested`/`Failing` 없음)
- [ ] `npm run build` 성공
- [ ] 빌드 산출물(`.next/`)에 `SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET` 등 비밀 미포함 확인 (grep)

## 2. 데이터베이스 / 스토리지

- [ ] 마이그레이션이 운영 DB에 적용됨
- [ ] 운영 DB 전체 백업 1건 보관 (롤백용)
- [ ] Storage 버킷 `user-uploads` 존재 및 권한 점검
- [ ] 기본값 회귀: `mini_homepages.is_public` 기본 `false` (TC-PUB-001 회귀)
- [ ] 기본값 회귀: `layout_slots` 기본 4슬롯 (TC-LAYOUT-001 회귀)

## 3. 환경변수

- [ ] 운영용 환경변수 분리 (개발 키와 다름)
- [ ] Vercel(또는 호스팅)에 환경변수 등록
- [ ] `NEXT_PUBLIC_*`에 비밀 키가 들어가 있지 않음

## 4. 보안 회귀

- [ ] TC-AUTH-005 (비로그인 보호)
- [ ] TC-ISO-001~006 (사용자 분리)
- [ ] TC-PUB-001/004/006/007 (공개/비공개 서버 검증)
- [ ] 보안 헤더(HSTS, X-Content-Type-Options 등) 적용 (가능한 한)

## 5. UX 회귀

- [ ] PRD §4 1사이클 수동 통과 (회원가입→공개→비공개)
- [ ] 모바일 1단 폴백 (TC-LAYOUT-008, TC-RWD-005)
- [ ] 꾸미기 미리보기 vs 공개 페이지 일치 (TC-LAYOUT-009)

## 6. 문서

- [ ] `docs/00_MASTER_INDEX.md` 최신
- [ ] `docs/09_CHANGELOG.md`에 이번 릴리즈 엔트리 추가
- [ ] `docs/10_CURRENT_STATE.md` 현재 Phase=완료/배포
- [ ] `docs/19_FEATURE_CATALOG.md`의 Status/Tested가 실제와 일치
- [ ] `docs/14_BACKUP_ROLLBACK_PLAN.md` 절차가 최신

## 7. 배포 후

- [ ] 운영 URL 접속 확인
- [ ] 새 계정 1개로 PRD §4 1사이클 실행
- [ ] `/u/[slug]` 공개 페이지 외부에서 확인
- [ ] 비공개 전환 후 외부 차단 확인
- [ ] 로그(Vercel 함수 로그/Supabase 로그)에 평문 비밀번호·키 없음 확인
