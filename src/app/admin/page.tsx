import { homepageService } from '@/lib/services/homepage';
import { HomeDashboard } from '@/components/admin/HomeDashboard';

export default async function AdminHome() {
  const hp = await homepageService.ensureMine();
  return <HomeDashboard hp={hp} />;
}
