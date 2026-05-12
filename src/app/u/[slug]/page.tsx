import { notFound } from 'next/navigation';
import { loadPublicHomepage } from '@/lib/services/publicView';
import { WidgetBoard, type PreviewData, type DecorateStyle } from '@/components/public/WidgetRenderer';
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

  const style: DecorateStyle = {
    background_color: data.homepage.background_color,
    background_image_url: data.homepage.background_image_url,
    use_background_image: data.homepage.use_background_image,
    point_color: data.homepage.point_color,
    text_color: data.homepage.text_color,
    card_style: data.homepage.card_style,
    font_style: data.homepage.font_style,
    layout_mode: data.homepage.layout_mode,
    layout_slots: data.homepage.layout_slots,
  };

  const preview: PreviewData = {
    profile: data.profile,
    urls: data.urls,
    albums: data.albums,
    memos: data.memos,
  };

  return (
    <main className="min-h-screen">
      <WidgetBoard style={style} data={preview} />
    </main>
  );
}
