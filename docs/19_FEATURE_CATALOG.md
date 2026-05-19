---
상태: Approved
버전: v0.9.4
마지막 수정일: 2026-05-19
문서 목적: 구현 관리 / 기능 목록 (단일 소스)
---

# 기능 목록 (Feature Catalog)

본 미니홈피 서비스의 모든 구현 기능을 한 곳에서 관리한다. 새 기능 추가/수정/폐기 시 본 문서를 즉시 갱신한다. 이력(언제 추가됐는지)은 `docs/09_CHANGELOG.md`에서 관리하며 본 문서는 **현재 기능 지도**다.

상태: `Planned` / `In Progress` / `Active` / `Deprecated`
테스트: `Untested` / `Passing` / `Failing`

## 1. 인증

| 기능 | 설명 | 위치 | API | 테이블 | 권한 | TC | 상태 | 테스트 |
|---|---|---|---|---|---|---|---|---|
| 회원가입 | 이메일+비밀번호+닉네임으로 자체 가입 (Supabase Auth 미사용) | `app/(auth)/signup/page.tsx`, `services/auth.ts` | `POST /api/auth/signup` | users | 공개 | TC-AUTH-001/002 | Active | Passing |
| 로그인 | 자격 검증 후 쿠키 세션 발급 | `app/(auth)/login/page.tsx`, `services/auth.ts` | `POST /api/auth/login` | users | 공개 | TC-AUTH-003/004 | Active | Passing |
| 로그아웃 | 쿠키 만료 | `services/auth.ts` | `POST /api/auth/logout` | — | 로그인 | TC-AUTH-006 | Active | Passing |
| 인증 가드 | `(admin)/**` 진입 시 비로그인 차단 | `app/(admin)/layout.tsx` + `lib/auth/guards.ts` | — | — | 로그인 | TC-AUTH-005 | Active | Passing |

## 2. 미니홈피

| 기능 | 설명 | 위치 | API | 테이블 | 권한 | TC | 상태 | 테스트 |
|---|---|---|---|---|---|---|---|---|
| 미니홈피 생성 | slug 발급, 기본 비공개, 기본 카테고리 자동 생성 (트랜잭션) | `services/homepage.ts` | `POST /api/homepage` | mini_homepages, album_categories | 로그인 | TC-HP-001~003, TC-ALB-001 | Active | Passing |
| 내 미니홈피 조회 | 본인 데이터만 | `services/homepage.ts` | `GET /api/homepage` | mini_homepages | 로그인 | TC-HP-004 | Active | Passing |
| 미니홈피 수정 | 제목/소개/프로필/공개 토글/slug 변경 | `services/homepage.ts` | `PATCH /api/homepage` | mini_homepages | 본인 | TC-PUB-002/004 | Active | Passing |

## 3. URL 보관함

| 기능 | 설명 | 위치 | API | 테이블 | 권한 | TC | 상태 | 테스트 |
|---|---|---|---|---|---|---|---|---|
| URL 추가 | 제목+주소 | `services/urls.ts` | `POST /api/urls` | urls | 본인 | TC-URL-001 | Active | Passing |
| URL 목록 | 최신순 | `services/urls.ts` | `GET /api/urls` | urls | 본인 | TC-URL-002 | Active | Passing |
| URL 수정 | 제목/주소 | `services/urls.ts` | `PATCH /api/urls/[id]` | urls | 본인 | TC-URL-003 | Active | Passing |
| URL 삭제 | 소프트 삭제 | `services/urls.ts` | `DELETE /api/urls/[id]` | urls | 본인 | TC-URL-004 | Active | Passing |

## 4. 앨범 / 사진

| 기능 | 설명 | 위치 | API | 테이블 | 권한 | TC | 상태 | 테스트 |
|---|---|---|---|---|---|---|---|---|
| 기본 카테고리 자동 생성 | 미니홈피 생성 시 함께 | `services/homepage.ts` | (POST homepage 부수효과) | album_categories | 본인 | TC-ALB-001 | Active | Passing |
| 카테고리 추가/수정/삭제 | 중복 차단, 삭제 시 안 사진 함께 소프트 삭제 | `services/albums.ts` | `/api/albums/categories(/[id])` | album_categories, photos | 본인 | TC-ALB-002~005 | Active | Passing |
| 사진 업로드 | MIME/크기 검증, Supabase Storage 저장 | `services/albums.ts`, `lib/storage/uploader.ts` | `POST /api/albums/photos` | photos | 본인 | TC-ALB-006~008 | Active | Passing |
| 사진 목록/삭제 | 카테고리별 조회, 소프트 삭제 | `services/albums.ts` | `GET /api/albums/photos`, `DELETE .../[id]` | photos | 본인 | TC-ALB-009/010 | Active | Passing |

## 5. 메모

| 기능 | 설명 | 위치 | API | 테이블 | 권한 | TC | 상태 | 테스트 |
|---|---|---|---|---|---|---|---|---|
| 메모 작성/목록/상세/수정/삭제 | 제목+내용, 소프트 삭제 | `services/memos.ts` | `/api/memos(/[id])` | memos | 본인 | TC-MEMO-001~005 | Active | Passing |

## 6. 꾸미기 (색·카드·폰트·배경)

| 기능 | 설명 | 위치 | API | 테이블 | 권한 | TC | 상태 | 테스트 |
|---|---|---|---|---|---|---|---|---|
| 배경색/배경 이미지/이미지 ON-OFF | 컬러 피커 + 업로드 + 토글 | `components/decorate/*`, `services/decorate.ts` | `PUT /api/decorate`, `POST /api/decorate/background` | mini_homepages | 본인 | TC-DEC-001~003 | Active | Passing |
| 포인트색/글자색 | 컬러 피커 | `components/decorate/ColorPicker.tsx` | `PUT /api/decorate` | mini_homepages | 본인 | TC-DEC-004/005 | Active | Passing |
| 배경 무늬 8종 | dots/grid/diagonal/stripes/checker/crosshatch/waves/triangles + 색상(alpha) | `lib/canvas/patterns.ts`, `components/decorate/DecorateEditor.tsx` | `PUT /api/decorate` | mini_homepages | 본인 | TC-DEC-001~003 | Active | Passing |
| 그라데이션 / 카드 투명도 | 배경·카드 배경 그라데이션(2색 + 각도), 카드 투명도 슬라이더 | `components/decorate/ColorPicker.tsx` | `PUT /api/decorate` | mini_homepages | 본인 | — | Active | Passing |
| 카드 스타일 20종 | basic·rounded·shadow·transparent + 16종(soft·bordered·glass·minimal·elevated·frame·sticky·mint·pink·sky·notebook·grid-paper·dashed·double-border·ringed·bevel) | `components/decorate/DecorateEditor.tsx` | 위와 동일 | mini_homepages | 본인 | TC-DEC-006 | Active | Passing |
| 폰트 12종 | default·rounded·emotional + pretendard·notoSans·notoSerif·nanumGothic·gowunDodum·nanumPen·ibmPlex·blackHan·hiMelody | `components/decorate/DecorateEditor.tsx` | 위와 동일 | mini_homepages | 본인 | TC-DEC-007 | Active | Passing |
| 미리보기 즉시 반영 | 로컬 state 기반 | `PreviewBoard` | (저장 전 서버 미반영) | — | 본인 | TC-DEC-008 | Active | Passing |
| 테마 프리셋 6종 | 꾸미기 값 묶음(배경색·무늬·색상·카드·폰트·투명도·크기) 원클릭 적용. 적용 후 세부 조정·저장. 배경 이미지·레이아웃은 유지 | `lib/presets/themes.ts`, `components/decorate/DecorateEditor.tsx` | `PUT /api/decorate` | mini_homepages | 본인 | TC-PRESET-001~006 | Active | Passing |

## 7. 레이아웃 / 위젯 배치

| 기능 | 설명 | 위치 | API | 테이블 | 권한 | TC | 상태 | 테스트 |
|---|---|---|---|---|---|---|---|---|
| 레이아웃 모드 | single / double | `LayoutModeSelector` | `PUT /api/decorate` | mini_homepages | 본인 | TC-LAYOUT-001/002 | Active | Passing |
| 슬롯별 위젯 배치 | 슬롯 행마다 위젯 드롭다운(profile/urls/albums/memos/empty) + 표시 ON/OFF | `SlotEditor` | `PUT /api/decorate` | mini_homepages | 본인 | TC-LAYOUT-003~007 | Active | Passing |
| 모바일 1단 폴백 | viewport < md에서 자동 | `WidgetRenderer` | — | — | 공개/본인 | TC-LAYOUT-008 | Active | Passing |
| 미리보기 vs 공개 일치 | 시각 동일성 | `PreviewBoard` + `WidgetRenderer` | — | — | 본인 | TC-LAYOUT-009 | Active | Passing |

## 8. 공개 / 비공개

| 기능 | 설명 | 위치 | API | 테이블 | 권한 | TC | 상태 | 테스트 |
|---|---|---|---|---|---|---|---|---|
| 공개/비공개 토글 | 설정 탭 | `app/(admin)/settings/page.tsx` | `PATCH /api/homepage` | mini_homepages | 본인 | TC-PUB-002~005 | Active | Passing |
| 공개 미니홈피 페이지 | `/u/[slug]` 서버 검증 후 렌더 | `app/u/[slug]/page.tsx`, `services/publicView.ts` | `GET /api/public/[slug]` (내부) | 모든 사용자 데이터 | 공개(서버 검증) | TC-PUB-001/003/006/007 | Active | Passing |
| 비공개=미존재 통일 응답 | 404 + 동일 메시지 | `services/publicView.ts` | `GET /api/public/[slug]` | — | — | TC-PUB-006 | Active | Passing |

## 9. 데이터 보관 / 사용자 분리

| 기능 | 설명 | 위치 | API | 테이블 | 권한 | TC | 상태 | 테스트 |
|---|---|---|---|---|---|---|---|---|
| 소프트 삭제 | `deleted_at` 사용, 일반 조회 제외 | `repositories/*` | 모든 DELETE/GET | 모든 사용자 데이터 | — | TC-RET-001~005 | Active | Passing |
| 사용자별 데이터 분리 | repository 레이어가 `user_id` 강제 부착 | `repositories/*` | 모든 API | 모든 사용자 데이터 | — | TC-ISO-001~006 | Active | Passing |
| 휴지통·복구 | 삭제된 URL·사진·메모·앨범 카테고리 조회/복구/영구삭제. 카테고리 복구 시 사진 cascade 복구, 사진 개별 복구는 카테고리 삭제 상태면 차단. 자동 영구삭제 없음(PRD §5) | `repositories/trash.ts`, `services/trash.ts`, `components/trash/TrashManager.tsx` | `GET /api/trash`, `POST /api/trash/restore`, `POST /api/trash/purge` | urls·photos·memos·album_categories | 본인 | TC-TRASH-001~006 | Active | Passing |
| 이미지 프록시 / private 스토리지 | 업로드 이미지는 private 버킷 + `/api/img` 프록시로만 접근(본인 또는 공개 미니홈피). DB엔 full URL이 아닌 스토리지 경로 저장, `imgSrc()`가 표시용 변환 | `app/api/img/route.ts`, `lib/storage/imageSrc.ts`, `lib/storage/uploader.ts` | `GET /api/img` | (Storage) photos·mini_homepages | 본인/공개 | TC-IMG-001~005 | Active | Passing |

## 10. 현재 제외 기능 (참고용으로 보존)

> 자유 캔버스 드래그앤드롭과 URL·메모·카드 카테고리는 v0.5~v0.9에서 채택되어 §6·§11·§12에 Active로 기재됨. 아래는 현재 범위에서 제외된 기능이다 (PRD §7).

| 기능 | 상태 | 비고 |
|---|---|---|
| 자유형 태그 / 전역 검색 | Excluded | PRD §7. 카테고리 분류(URL·메모·앨범·카드)는 구현됨 — §6·§11·§12 참조 |
| 댓글/좋아요/방명록/방문자 수 | Excluded | PRD §7 |
| 배경음악 | Excluded | PRD §7 |
| 친구/팔로우 | Excluded | PRD §7 |
| AI 요약/RAG/챗봇 | Excluded | PRD §7. 추후 도입 시 `docs/ai/` 신규 |
| URL 썸네일 자동 가져오기 | Excluded | PRD §7 |
| 앨범별·메모별 세부 공개 설정 | Excluded | PRD §7 |
| 알림/결제 | Excluded | PRD §7 |

## 11. 카드 이름 · 카테고리 · 그림판 (v0.8 자유 캔버스)

| 기능 | 설명 | 위치 | API | 테이블 | 권한 | TC | 상태 | 테스트 |
|---|---|---|---|---|---|---|---|---|
| 카드 이름(헤더) 편집 | 편집 모드에서 전 카드 종류의 이름 수정, 빈 값이면 종류별 기본명. 공개 페이지 반영 | `components/canvas/CardHeader.tsx`, `FreeCanvas` | `PUT /api/decorate` (layouts) | mini_homepages | 본인 | TC-CARDNAME-001~006 | Active | Passing |
| 카드 카테고리 | 추가/삭제 관리 모달, 모든 카드에 지정, 헤더 라벨, 편집 필터, 공개 라벨 | `components/canvas/CardCategoryManager.tsx`, `services/cardCategories.ts` | `GET/POST /api/cards/categories`, `DELETE /api/cards/categories/[id]` | mini_homepages (`card_categories` JSONB, 마이그 0007) | 본인 | TC-CARDCAT-001~014 | Active | Passing |
| 그림판 (펜·도형·지우개) | 펜 5종·도형 6종·픽셀/객체 지우개·대표색 7+팔레트·굵기 1~100 슬라이더 | `components/canvas/DrawPad/*` | `POST /api/decorate/drawing` | mini_homepages (`layouts.drawingUrl`) | 본인 | TC-DRAW-010~017 | Active | Passing |

> 위 TC는 단독 e2e 실행 시 전건 통과. 전체 60건 일괄 실행은 dev 서버 콜드 컴파일 부하로 간헐 timeout — 환경 이슈, 회귀 아님.

## 12. v0.9 카드 편집 · 카테고리 개편

| 기능 | 설명 | 위치 | API | 테이블 | 권한 | TC | 상태 | 테스트 |
|---|---|---|---|---|---|---|---|---|
| 캔버스 폭 확대 | desktop 자유 캔버스 1200→1680px (40%) | `components/canvas/FreeCanvas.tsx` | — | — | 본인 | TC-S1-006 | Active | Passing |
| 편집 진입 메뉴화 | 홈 "편집" 버튼 제거, 햄버거 메뉴 "편집"(`/admin?edit=1`) 진입, 메뉴에 현재 레이아웃 표시 | `components/admin/MenuButton.tsx`, `HomeDashboard.tsx` | — | — | 본인 | TC-S1-001~004 | Active | Passing |
| 메모 카드 제목만 | 홈·공개·위젯 메모 카드 본문 미리보기 제거 | `HomeDashboard.tsx`, `PublicCanvas.tsx`, `WidgetRenderer.tsx` | — | — | 공개/본인 | TC-S1-005 | Active | Passing |
| 글자 크기 pt | enum(xs~xl) → pt 정수. 카드별/전역 직접 입력 + 프리셋(9·12·16·20·28pt) | `FreeCanvas.tsx`, `DecorateEditor.tsx`, `styles/globals.css` | `PUT /api/decorate` | mini_homepages (`default_font_size` integer, 마이그 0008) | 본인 | TC-S2-001~006 | Active | Passing |
| 메모 카테고리 | 카테고리 추가/이름수정/삭제 + 메모별 지정 | `components/categories/CategoryBar.tsx`, `MemosManager.tsx`, `services/memoCategories.ts` | `GET/POST /api/memos/categories`, `PATCH/DELETE .../[id]` | mini_homepages (`memo_categories` JSONB), memos (`category_id`, 마이그 0009) | 본인 | TC-S3-001~004, TC-S4-001~004·006 | Active | Passing |
| URL 카테고리 | 카테고리 추가/이름수정/삭제 + URL별 지정 | `CategoryBar.tsx`, `UrlsManager.tsx`, `services/urlCategories.ts` | `GET/POST /api/urls/categories`, `PATCH/DELETE .../[id]` | mini_homepages (`url_categories` JSONB), urls (`category_id`, 마이그 0009) | 본인 | TC-S3-005~006, TC-S4-005~006 | Active | Passing |
| 카드별 표시 카테고리 | 앨범/메모/URL 카드가 표시할 카테고리 선택. 앨범 미지정 시 최근 업로드 카테고리. 공개 페이지 동일 필터 | `FreeCanvas.tsx`, `HomeDashboard.tsx`, `PublicCanvas.tsx` | `PUT /api/decorate` (layouts) | mini_homepages (`layouts`의 `albumCategoryId`·`memoCategoryId`·`urlCategoryId`) | 공개/본인 | TC-S5-001~006 | Active | Passing |

## 13. v0.9.1 자유 캔버스 폭 확장

| 기능 | 설명 | 위치 | API | 테이블 | 권한 | TC | 상태 | 테스트 |
|---|---|---|---|---|---|---|---|---|
| 캔버스 좌측 확장 | desktop 자유 캔버스 폭 1680→1982px. 왼쪽에 302px(약 8cm) 카드 배치 여유 구역 추가 | `components/canvas/FreeCanvas.tsx` | — | — | 본인 | — | Active | Untested |
