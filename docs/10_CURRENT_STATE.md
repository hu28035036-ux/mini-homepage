---
상태: Draft
버전: v0.7.x
마지막 수정일: 2026-05-13
문서 목적: 운영 / 현재 상태
---

# 현재 상태 — v0.7.x (그라데이션 + 무늬 + 카드 스타일 20종 + lightbox)

## 1. Phase

- 모든 Phase 0~10 완료. 그 후 **v2 재설계 사이클** 진행 중.
- 현재 사이클: **v0.7.x 배포 완료** (이번 세션 14건 누적, 마이그 0004~0006 운영 동기화)

## 2. 가동 중인 환경

| 서비스 | 주소 / 식별자 |
|---|---|
| 운영 URL | https://mini-homepage.vercel.app |
| GitHub repo | https://github.com/hu28035036-ux/mini-homepage (Private, master 브랜치) |
| Vercel project | `mini-homepage` (orgId `team_Fej1ZZqXQJPzGwxXB9oGo9AB`, projectId `prj_F0mAKTWVVZ38KBfXYj9qDSlJ46L6`) |
| Supabase prod | ref `efokjcootdmcrnpnqpce`, region `ap-northeast-2` |
| Supabase Local (개발 기본 DB) | 127.0.0.1:54321 / DB 54322 / Studio 54323 — Docker 컨테이너 12개 |

## 3. 최근 완료 작업 (시간 역순)

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
- E2E: **37 passed / 3 skipped / 0 failed** (chromium)
- 마이그레이션: **0001~0006 로컬·운영 완전 동기화 ✅**
- 운영 헬스: `/login` 200, `/u/<missing>` 404, `/api/public/<missing>` `HOMEPAGE_PRIVATE_OR_NOT_FOUND`, 보안 헤더 4종 적용
- 빌드 시크릿 누출: 클라이언트 번들에 `SUPABASE_SERVICE_ROLE_KEY`/`SESSION_SECRET` 없음 (grep 확인)
- DB 보안 advisors: ERROR 0건 (RLS 활성 + anon 권한 회수 완료)

## 5. 사용자 확인 대기 중

직전 push 후 다음을 사용자에게 확인 요청:

1. 꾸미기 탭에서 **폰트 변경 + 저장 → 즉시 화면에 반영**되는지 (router.refresh 효과)
2. **카드 스타일 변경 + 저장 → 카드 모양 실제로 변하는지** (Tailwind safelist 효과)
3. 카드 드래그·리사이즈가 부드럽게 동작하는지 (이전 push에서 fix됨)

## 6. 다음 작업 후보

[docs/11_SESSION_HANDOFF.md](11_SESSION_HANDOFF.md) §6 참조. 우선순위:
A. Phase D — PWA / B. z-index 제어 / C. 편집 UX 보강 / D. 이미지 E2E / E~H. 운영 강화

## 7. 알려진 위험

[docs/11_SESSION_HANDOFF.md](11_SESSION_HANDOFF.md) §7 참조. 핵심:
- iron-session stateless → 토큰 도용 시 로그아웃 무력화 (정상 브라우저는 안전)
- 비밀번호 재설정 흐름 없음 (운영자 수동)
- Supabase Storage Public 버킷 → 비공개 미니홈피 이미지 URL 유출 시 외부 접근
- 모바일 터치 검증 부족

## 8. 마지막 업데이트

2026-05-13.
