---
상태: Draft
버전: v0.9.4
마지막 수정일: 2026-05-19
문서 목적: 운영 / 현재 상태
---

# 현재 상태 — v0.9.4 (테마 프리셋 + 휴지통 + private 스토리지)

## 1. Phase

- 모든 Phase 0~10 완료. 그 후 **v2 재설계 사이클** 진행 중.
- 현재 사이클: **v0.9.4** (마이그 0001~0010 로컬 적용 — 운영은 0010 미적용 시 배포와 함께 적용)

## 2. 가동 중인 환경

| 서비스 | 주소 / 식별자 |
|---|---|
| 운영 URL | https://mini-homepage.vercel.app |
| GitHub repo | https://github.com/hu28035036-ux/mini-homepage (Private, master 브랜치) |
| Vercel project | `mini-homepage` (orgId `team_Fej1ZZqXQJPzGwxXB9oGo9AB`, projectId `prj_F0mAKTWVVZ38KBfXYj9qDSlJ46L6`) |
| Supabase prod | ref `efokjcootdmcrnpnqpce`, region `ap-northeast-2` |
| Supabase Local (개발 기본 DB) | 127.0.0.1:54321 / DB 54322 / Studio 54323 — Docker 컨테이너 12개 |

## 3. 최근 완료 작업 (시간 역순)

- **v0.9.4** — private 스토리지 + 이미지 프록시(`/api/img`). 버킷 private 전환(마이그 0010), DB는 스토리지 경로 저장
- **v0.9.3** — 휴지통·복구 UI(`/admin/trash`). URL·사진·메모·앨범 카테고리 복구/영구삭제
- **v0.9.2** — 테마 프리셋 6종(꾸미기 값 묶음 원클릭 적용)
- **v0.9.1** — 자유 캔버스 폭 1680→1982px (왼쪽 302px/8cm 여유 구역 확장)
- **v0.9** — 카드 편집·카테고리 개편 10건: 캔버스 폭 1200→1680px, 편집 진입 메뉴화, 메모 카드 제목만 표시, 글자 크기 pt 전환(마이그 0008), 메모·URL 카테고리(마이그 0009), 카드별 표시 카테고리
- **v0.8** — 모든 카드 이름(헤더) 편집(CardHeader), 카드 카테고리(마이그 0007), 그림판 DrawPad/ 모듈 개편(펜 5종·도형 6종·지우개 2종)
- **v0.7.x** — 배경 무늬 8종(마이그 0004) + 카드 스타일 +10종/배경색(마이그 0005) + 사진 lightbox + 배경/카드 그라데이션(마이그 0006) + useTrack lazy init·MOBILE_BREAKPOINT 1024·HomeDashboard mount 체크·router.refresh·모바일 꾸미기 제외. 14 commit
- **v0.7** — 그림판 카드(DrawPad 모달 + Supabase Storage PNG) + 모바일 리스트 UI(MobileHome) + DecorateEditor 모바일 단순화
- **v0.6** — PWA + z-index ▲▼ + 자동저장 디바운스/화살표/Esc + 투명도/폰트크기 (마이그 0003) + 메모 row 카드형 + 스크롤바 카드색 + 햄버거 메뉴(TopBar 제거) + 비밀번호 변경 + 카드별 + 버튼 + custom 카드 추가/삭제 + TC-ALB-006~010 E2E. 12 step + 마이그 0003
- **v0.5.x fix** — DecorateEditor save 후 `router.refresh()` + Tailwind v4 `@source inline` safelist (commit `06547fc`)
- **v0.5 Phase B** — 자유 캔버스, 폰트 12종, 카드 10종, 드롭다운, 2-track layouts, PublicCanvas (commit `de8d49e`)
- **v0.4 Phase A** — 사이드바 제거, TopBar, 카드 expand 모달, 본인 스타일 동적 적용
- **v0.3 운영 배포** — Vercel + Supabase prod

## 4. 검증 현황

- TypeScript: **0 에러**
- 빌드: **next build 성공**
- E2E: **114 passed / 3 skipped / 0 failed** (chromium)
- 마이그레이션: 로컬 **0001~0010** 적용 ✅ / 운영은 0001~0009 적용, **0010(버킷 private)은 다음 배포 시 적용 필요**
- 운영 헬스: `/login` 200, `/u/<missing>` 404, `/api/public/<missing>` `HOMEPAGE_PRIVATE_OR_NOT_FOUND`, 보안 헤더 4종 적용
- 빌드 시크릿 누출: 클라이언트 번들에 `SUPABASE_SERVICE_ROLE_KEY`/`SESSION_SECRET` 없음 (grep 확인)
- DB 보안 advisors: ERROR 0건 (RLS 활성 + anon 권한 회수 완료)

## 5. 사용자 확인 대기 중

v0.9 미해결 작업 없음 — 구현·검증·배포 완료. v0.9.1은 캔버스 폭 확장 + 문서 변경.

## 6. 다음 작업 후보

[docs/11_SESSION_HANDOFF.md](11_SESSION_HANDOFF.md) §6 참조. 핵심 후보:
그라데이션·lightbox 운영 검증 / DrawPad Storage 고아 파일 정리 / 비밀번호 재설정 흐름 / 휴지통·복구 UI / Supabase Storage signed URL 모델.

## 7. 알려진 위험

[docs/11_SESSION_HANDOFF.md](11_SESSION_HANDOFF.md) §7 참조. 핵심:
- iron-session stateless → 토큰 도용 시 로그아웃 무력화 (정상 브라우저는 안전)
- 비밀번호 재설정 흐름 없음 (운영자 수동)
- ~~Supabase Storage Public 버킷~~ → v0.9.4에서 private 버킷 + `/api/img` 프록시로 해소
- 사진 영구삭제 시 Storage 원본 파일 미정리 (고아 파일 누적 — 별도 작업)
- 모바일 터치 검증 부족

## 8. 마지막 업데이트

2026-05-19.
