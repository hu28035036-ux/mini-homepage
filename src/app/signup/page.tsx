import { redirect } from 'next/navigation';
import { getCurrentUserId } from '@/lib/auth/guards';
import { SignupForm } from '@/components/auth/AuthForms';

export default async function SignupPage() {
  if (await getCurrentUserId()) redirect('/admin');
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <SignupForm />
    </main>
  );
}
