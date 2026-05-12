import { redirect } from 'next/navigation';
import { getCurrentUserId } from '@/lib/auth/guards';
import { homepageService } from '@/lib/services/homepage';
import { Sidebar } from '@/components/admin/Sidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const uid = await getCurrentUserId();
  if (!uid) redirect('/login');

  // 미니홈피가 없으면 자동 생성
  const hp = await homepageService.ensureMine();

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar slug={hp.slug} isPublic={hp.is_public} />
      <main className="flex-1 p-8 max-w-5xl">{children}</main>
    </div>
  );
}
