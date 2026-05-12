import { homepageService } from '@/lib/services/homepage';
import { DecorateEditor } from '@/components/decorate/DecorateEditor';

export default async function Page() {
  const hp = await homepageService.ensureMine();
  return <DecorateEditor initial={hp} />;
}
