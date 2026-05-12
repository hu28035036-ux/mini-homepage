import { redirect } from 'next/navigation';
import { getCurrentUserId } from '@/lib/auth/guards';

export default async function Home() {
  const userId = await getCurrentUserId();
  if (userId) redirect('/admin');
  redirect('/login');
}
