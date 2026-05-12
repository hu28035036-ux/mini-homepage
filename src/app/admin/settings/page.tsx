import { homepageService } from '@/lib/services/homepage';
import { SettingsForm } from '@/components/settings/SettingsForm';
import { requireUser } from '@/lib/auth/guards';
import { usersRepo } from '@/lib/repositories/users';

export default async function Page() {
  const uid = await requireUser();
  const [hp, user] = await Promise.all([
    homepageService.ensureMine(),
    usersRepo.findByIdActive(uid),
  ]);
  return <SettingsForm initial={hp} ownerEmail={user?.email ?? ''} />;
}
