'use client';

import { useState, type ReactNode } from 'react';
import { FreeCanvas } from '@/components/canvas/FreeCanvas';
import { PhotoLightbox, type LightboxPhoto } from '@/components/albums/PhotoLightbox';
import { textColorOrGradientStyle } from '@/components/decorate/ColorPicker';
import { patternImage, patternSize, patternPosition } from '@/lib/canvas/patterns';
import { imgSrc } from '@/lib/storage/imageSrc';

function isGradient(v: string): boolean {
  return /^(linear|radial|conic)-gradient\(/.test(v);
}
import type { Block, Layouts, MiniHomepageRow } from '@/types/db';

export interface PublicData {
  homepage: Pick<
    MiniHomepageRow,
    | 'title' | 'intro' | 'profile_image_url' | 'slug'
    | 'background_color' | 'background_image_url' | 'use_background_image'
    | 'background_pattern' | 'background_pattern_color'
    | 'point_color' | 'text_color' | 'card_style' | 'card_background_color' | 'font_style'
    | 'default_card_opacity' | 'default_font_size' | 'card_categories'
  > & { layouts: Layouts };
  profile: { nickname: string; intro: string | null; image_url: string | null };
  urls: Array<{ id: string; title: string; url: string; created_at: string; category_id: string | null }>;
  photos: Array<{ id: string; image_url: string; caption: string | null; category_id: string | null; created_at: string }>;
  memos: Array<{ id: string; title: string; content: string; created_at: string; category_id: string | null }>;
}

export function PublicCanvas({ data }: { data: PublicData }) {
  const { homepage } = data;
  const [lightbox, setLightbox] = useState<{ photos: LightboxPhoto[]; index: number } | null>(null);

  const renderBlock = (b: Block): ReactNode => {
    switch (b.kind) {
      case 'title':
        return (
          <div className="h-full flex items-center">
            <h1 className="text-3xl font-bold leading-tight" style={textColorOrGradientStyle(homepage.text_color)}>
              {homepage.title}
            </h1>
          </div>
        );
      case 'profile':
        return (
          <div className="h-full flex flex-col items-center justify-center text-center">
            {homepage.profile_image_url ? (
              <img src={imgSrc(homepage.profile_image_url)} alt="" className="w-16 h-16 rounded-full object-cover mb-2" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-black/10 mb-2" />
            )}
            <div className="font-bold">{data.profile.nickname}</div>
            {data.profile.intro && <div className="text-sm opacity-70 mt-1 line-clamp-3">{data.profile.intro}</div>}
          </div>
        );
      case 'urls': {
        const shown = b.urlCategoryId ? data.urls.filter((u) => u.category_id === b.urlCategoryId) : data.urls;
        return (
          <div>
            {shown.length === 0 ? (
              <p className="text-xs opacity-50">아직 저장된 링크가 없어요.</p>
            ) : (
              <ul className="space-y-2">
                {shown.slice(0, 8).map((u) => (
                  <li key={u.id} className="text-sm">
                    <a href={u.url} target="_blank" rel="noopener noreferrer" className="block hover:underline">
                      <div className="font-medium truncate">{u.title}</div>
                      <div className="opacity-50 text-xs truncate">{u.url}</div>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      }
      case 'albums': {
        // 표시 카테고리: 미지정 시 최근 업로드 카테고리 (#6)
        const sorted = [...data.photos].sort((a, b2) => b2.created_at.localeCompare(a.created_at));
        const recentCatId = sorted[0]?.category_id ?? null;
        const showCatId = b.albumCategoryId ?? recentCatId;
        const shown = showCatId ? data.photos.filter((p) => p.category_id === showCatId) : data.photos;
        const lb: LightboxPhoto[] = shown.slice(0, 9).map((p) => ({ url: imgSrc(p.image_url), caption: p.caption }));
        return (
          <div>
            {shown.length === 0 ? (
              <p className="text-xs opacity-50">아직 사진이 없어요.</p>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {shown.slice(0, 9).map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setLightbox({ photos: lb, index: idx }); }}
                    className="block"
                    aria-label="사진 크게 보기"
                  >
                    <img src={imgSrc(p.image_url)} alt={p.caption ?? ''} className="aspect-square w-full object-cover rounded cursor-zoom-in" />
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      }
      case 'memos': {
        const shown = b.memoCategoryId ? data.memos.filter((m) => m.category_id === b.memoCategoryId) : data.memos;
        return (
          <div>
            {shown.length === 0 ? (
              <p className="text-xs opacity-50">아직 메모가 없어요.</p>
            ) : (
              <ul className="divide-y divide-black/5">
                {shown.slice(0, 6).map((m) => (
                  <li key={m.id} className="text-sm py-2 first:pt-0 last:pb-0">
                    <div className="font-medium truncate">{m.title}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      }
      case 'custom':
        return (
          <div>
            <div className="text-xs opacity-80 whitespace-pre-wrap">{b.customContent}</div>
          </div>
        );
      case 'drawing':
        return (
          <div className="h-full flex items-center justify-center">
            {b.drawingUrl ? (
              <img
                src={imgSrc(b.drawingUrl)}
                alt="그림"
                className="max-w-full max-h-full object-contain rounded"
              />
            ) : null}
          </div>
        );
    }
  };

  const useImage = homepage.use_background_image && homepage.background_image_url;
  const usePattern = !useImage && homepage.background_pattern && homepage.background_pattern !== 'none';
  const patternImg = usePattern ? patternImage(homepage.background_pattern, homepage.background_pattern_color) : '';
  const bgIsGradient = isGradient(homepage.background_color);
  const computedBgImage = useImage
    ? `url(${imgSrc(homepage.background_image_url)})`
    : (usePattern ? patternImg : (bgIsGradient ? homepage.background_color : undefined));
  const wrapperStyle: React.CSSProperties = {
    backgroundColor: bgIsGradient ? 'transparent' : homepage.background_color,
    color: isGradient(homepage.text_color) ? undefined : homepage.text_color,
    backgroundImage: computedBgImage,
    backgroundSize: useImage
      ? 'cover'
      : (usePattern ? patternSize(homepage.background_pattern) : undefined),
    backgroundPosition: useImage
      ? 'center'
      : (usePattern ? patternPosition(homepage.background_pattern) : undefined),
    backgroundAttachment: useImage ? 'fixed' : undefined,
    ['--scrollbar-track' as string]: bgIsGradient ? '#ffffff' : homepage.background_color,
    ['--scrollbar-thumb' as string]: isGradient(homepage.point_color) ? '#7c3aed' : homepage.point_color,
  };

  return (
    <main className="min-h-screen py-6 px-4" style={wrapperStyle}>
      <FreeCanvas
        layouts={homepage.layouts}
        editMode={false}
        cardStyle={homepage.card_style}
        cardBackgroundColor={homepage.card_background_color}
        fontStyle={homepage.font_style}
        pointColor={homepage.point_color}
        defaultOpacity={homepage.default_card_opacity ?? 1}
        defaultFontSize={homepage.default_font_size ?? 12}
        renderBlock={renderBlock}
        cardCategories={homepage.card_categories}
        publicViewOnly
      />

      <PhotoLightbox
        open={lightbox !== null}
        photos={lightbox?.photos ?? []}
        index={lightbox?.index ?? 0}
        onIndexChange={(next) => setLightbox((cur) => (cur ? { ...cur, index: next } : cur))}
        onClose={() => setLightbox(null)}
      />
    </main>
  );
}
