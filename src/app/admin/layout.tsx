import { redirect } from 'next/navigation';
import { getCurrentUserId } from '@/lib/auth/guards';
import { homepageService } from '@/lib/services/homepage';
import { TopBar } from '@/components/admin/TopBar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const uid = await getCurrentUserId();
  if (!uid) redirect('/login');

  // 미니홈피가 없으면 자동 생성 (idempotent — race 안전)
  const hp = await homepageService.ensureMine();

  // 본인의 노트 스타일을 관리 화면 루트에 적용 (사용자가 주인)
  const containerStyle: React.CSSProperties = {
    backgroundColor: hp.background_color,
    color: hp.text_color,
    backgroundImage:
      hp.use_background_image && hp.background_image_url ? `url(${hp.background_image_url})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    // 세로 스크롤바 색을 카드/포인트 색과 통일 (모든 카드 동일)
    ['--scrollbar-track' as string]: hp.background_color,
    ['--scrollbar-thumb' as string]: hp.point_color,
  };

  return (
    <div className={`min-h-screen font-${hp.font_style}`} style={containerStyle}>
      <TopBar slug={hp.slug} isPublic={hp.is_public} pointColor={hp.point_color} />
      <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto">{children}</main>
    </div>
  );
}
