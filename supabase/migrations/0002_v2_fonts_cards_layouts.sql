-- v2: 폰트·카드 스타일 enum 확장 + 자유 캔버스 layouts(jsonb) 컬럼 추가.

-- 1) font_style enum 확장 (기존 default/rounded/emotional 유지 + 9개 추가)
alter table public.mini_homepages drop constraint if exists mini_homepages_font_style_check;
alter table public.mini_homepages add constraint mini_homepages_font_style_check
  check (font_style in (
    'default','rounded','emotional',
    'pretendard','notoSans','notoSerif','nanumGothic','gowunDodum','nanumPen','ibmPlex','blackHan','hiMelody'
  ));

-- 2) card_style enum 확장 (기존 basic/rounded/shadow/transparent + 6개 추가)
alter table public.mini_homepages drop constraint if exists mini_homepages_card_style_check;
alter table public.mini_homepages add constraint mini_homepages_card_style_check
  check (card_style in (
    'basic','rounded','shadow','transparent',
    'soft','bordered','glass','minimal','elevated','frame'
  ));

-- 3) 자유 캔버스 layouts: PC/모바일 2-track 좌표 저장
-- 모바일 키는 태블릿(<1024px)도 공유. 빈 배열이면 클라이언트가 기본 배치 생성.
alter table public.mini_homepages
  add column if not exists layouts jsonb not null
  default '{"desktop":[],"mobile":[]}'::jsonb;
