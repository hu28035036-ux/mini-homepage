import { homepageService } from '@/lib/services/homepage';
import { SettingsForm } from '@/components/settings/SettingsForm';

export default async function Page() {
  const hp = await homepageService.ensureMine();
  return <SettingsForm initial={hp} />;
}
