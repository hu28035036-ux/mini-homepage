import { notFound } from 'next/navigation';
import { loadPublicHomepage } from '@/lib/services/publicView';
import { PublicCanvas } from '@/components/public/PublicCanvas';
import { AppError } from '@/lib/errors/codes';

export default async function PublicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let data;
  try {
    data = await loadPublicHomepage(slug);
  } catch (e) {
    if (e instanceof AppError && e.code === 'HOMEPAGE_PRIVATE_OR_NOT_FOUND') notFound();
    throw e;
  }
  return <PublicCanvas data={data} />;
}
