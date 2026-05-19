import { redirect } from 'next/navigation';
import { getCurrentUserId } from '@/lib/auth/guards';
import { homepageService } from '@/lib/services/homepage';
import { MenuButton } from '@/components/admin/MenuButton';
import { patternImage, patternSize, patternPosition } from '@/lib/canvas/patterns';
import { imgSrc } from '@/lib/storage/imageSrc';

function isGradient(v: string): boolean {
  return /^(linear|radial|conic)-gradient\(/.test(v);
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const uid = await getCurrentUserId();
  if (!uid) redirect('/login');

  // 미니홈피가 없으면 자동 생성 (idempotent — race 안전)
  const hp = await homepageService.ensureMine();

  // 본인의 노트 스타일을 관리 화면 루트에 적용 (사용자가 주인)
  // 우선순위: 업로드 이미지 > 패턴 무늬 > 단색
  const useImage = hp.use_background_image && hp.background_image_url;
  const usePattern = !useImage && hp.background_pattern && hp.background_pattern !== 'none';
  const patternImg = usePattern ? patternImage(hp.background_pattern, hp.background_pattern_color) : '';
  const bgIsGradient = isGradient(hp.background_color);
  // backgroundImage 우선순위: 업로드 이미지 > 패턴 > 그라데이션
  const computedBgImage = useImage
    ? `url(${imgSrc(hp.background_image_url)})`
    : (usePattern ? patternImg : (bgIsGradient ? hp.background_color : undefined));
  const computedBgColor = bgIsGradient ? 'transparent' : hp.background_color;
  const containerStyle: React.CSSProperties = {
    backgroundColor: computedBgColor,
    color: isGradient(hp.text_color) ? undefined : hp.text_color,
    backgroundImage: computedBgImage,
    backgroundSize: useImage
      ? 'cover'
      : (usePattern ? patternSize(hp.background_pattern) : undefined),
    backgroundPosition: useImage
      ? 'center'
      : (usePattern ? patternPosition(hp.background_pattern) : undefined),
    backgroundAttachment: useImage ? 'fixed' : undefined,
    // 세로 스크롤바 색은 그라데이션이면 의미 없어 단색만 적용(첫 색 추출 또는 fallback)
    ['--scrollbar-track' as string]: bgIsGradient ? '#ffffff' : hp.background_color,
    ['--scrollbar-thumb' as string]: isGradient(hp.point_color) ? '#7c3aed' : hp.point_color,
  };

  return (
    <div
      className={`min-h-screen font-${hp.font_style}`}
      style={containerStyle}
      data-slug={hp.slug}
      data-public={hp.is_public ? '1' : '0'}
    >
      <MenuButton slug={hp.slug} isPublic={hp.is_public} pointColor={hp.point_color} />
      <main className="px-4 sm:px-6 lg:px-8 pt-16 pb-6 max-w-6xl mx-auto">{children}</main>
    </div>
  );
}
