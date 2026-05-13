'use client';

import type { ReactNode } from 'react';
import { FreeCanvas } from '@/components/canvas/FreeCanvas';
import type { Block, Layouts, MiniHomepageRow } from '@/types/db';

export interface PublicData {
  homepage: Pick<
    MiniHomepageRow,
    | 'title' | 'intro' | 'profile_image_url' | 'slug'
    | 'background_color' | 'background_image_url' | 'use_background_image'
    | 'point_color' | 'text_color' | 'card_style' | 'font_style'
    | 'default_card_opacity' | 'default_font_size'
  > & { layouts: Layouts };
  profile: { nickname: string; intro: string | null; image_url: string | null };
  urls: Array<{ id: string; title: string; url: string; created_at: string }>;
  albums: Array<{ category: string; photos: Array<{ id: string; image_url: string; caption: string | null }> }>;
  memos: Array<{ id: string; title: string; content: string; created_at: string }>;
}

export function PublicCanvas({ data }: { data: PublicData }) {
  const { homepage } = data;

  const renderBlock = (b: Block): ReactNode => {
    switch (b.kind) {
      case 'title':
        return (
          <div className="h-full flex items-center">
            <h1 className="text-3xl font-bold leading-tight" style={{ color: homepage.text_color }}>
              {homepage.title}
            </h1>
          </div>
        );
      case 'profile':
        return (
          <div className="h-full flex flex-col items-center justify-center text-center">
            {homepage.profile_image_url ? (
              <img src={homepage.profile_image_url} alt="" className="w-16 h-16 rounded-full object-cover mb-2" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-black/10 mb-2" />
            )}
            <div className="font-bold">{data.profile.nickname}</div>
            {data.profile.intro && <div className="text-sm opacity-70 mt-1 line-clamp-3">{data.profile.intro}</div>}
          </div>
        );
      case 'urls':
        return (
          <div>
            <h3 className="text-sm font-bold mb-2" style={{ color: homepage.point_color }}>URL 보관함</h3>
            {data.urls.length === 0 ? (
              <p className="text-xs opacity-50">아직 저장된 링크가 없어요.</p>
            ) : (
              <ul className="space-y-2">
                {data.urls.slice(0, 8).map((u) => (
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
      case 'albums':
        return (
          <div>
            <h3 className="text-sm font-bold mb-2" style={{ color: homepage.point_color }}>앨범</h3>
            {data.albums.length === 0 ? (
              <p className="text-xs opacity-50">아직 사진이 없어요.</p>
            ) : (
              data.albums.map((a) => (
                <div key={a.category} className="mb-3">
                  <div className="text-xs opacity-70 mb-1">{a.category}</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {a.photos.map((p) => (
                      <img key={p.id} src={p.image_url} alt={p.caption ?? ''} className="aspect-square object-cover rounded" />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        );
      case 'memos':
        return (
          <div>
            <h3 className="text-sm font-bold mb-2" style={{ color: homepage.point_color }}>메모</h3>
            {data.memos.length === 0 ? (
              <p className="text-xs opacity-50">아직 메모가 없어요.</p>
            ) : (
              <ul className="divide-y divide-black/5">
                {data.memos.slice(0, 6).map((m) => (
                  <li key={m.id} className="text-sm py-2 first:pt-0 last:pb-0">
                    <div className="font-medium truncate">{m.title}</div>
                    <p className="opacity-60 text-xs line-clamp-3 whitespace-pre-wrap">{m.content}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      case 'custom':
        return (
          <div>
            {b.customTitle && <h3 className="text-sm font-bold mb-1" style={{ color: homepage.point_color }}>{b.customTitle}</h3>}
            <div className="text-xs opacity-80 whitespace-pre-wrap">{b.customContent}</div>
          </div>
        );
      case 'drawing':
        return (
          <div className="h-full flex items-center justify-center">
            {b.drawingUrl ? (
              <img
                src={b.drawingUrl}
                alt="그림"
                className="max-w-full max-h-full object-contain rounded"
              />
            ) : null}
          </div>
        );
    }
  };

  const wrapperStyle: React.CSSProperties = {
    backgroundColor: homepage.background_color,
    color: homepage.text_color,
    backgroundImage:
      homepage.use_background_image && homepage.background_image_url
        ? `url(${homepage.background_image_url})`
        : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    ['--scrollbar-track' as string]: homepage.background_color,
    ['--scrollbar-thumb' as string]: homepage.point_color,
  };

  return (
    <main className="min-h-screen py-6 px-4" style={wrapperStyle}>
      <FreeCanvas
        layouts={homepage.layouts}
        editMode={false}
        cardStyle={homepage.card_style}
        fontStyle={homepage.font_style}
        pointColor={homepage.point_color}
        defaultOpacity={homepage.default_card_opacity ?? 1}
        defaultFontSize={homepage.default_font_size ?? 'base'}
        renderBlock={renderBlock}
        publicViewOnly
      />
    </main>
  );
}
