import type { LayoutMode, LayoutSlot, WidgetKind, CardStyle, FontStyle } from '@/types/db';
import { imgSrc } from '@/lib/storage/imageSrc';

export interface PreviewData {
  profile: { nickname: string; intro: string | null; image_url: string | null };
  urls: Array<{ id: string; title: string; url: string; created_at: string }>;
  albums: Array<{ category: string; photos: Array<{ id: string; image_url: string; caption: string | null }> }>;
  memos: Array<{ id: string; title: string; content: string; created_at: string }>;
}

export interface DecorateStyle {
  background_color: string;
  background_image_url: string | null;
  use_background_image: boolean;
  point_color: string;
  text_color: string;
  card_style: CardStyle;
  font_style: FontStyle;
  layout_mode: LayoutMode;
  layout_slots: LayoutSlot[];
}

export function cardClass(style: CardStyle): string {
  switch (style) {
    case 'basic':
      return 'bg-white border border-gray-200 rounded-lg';
    case 'rounded':
      return 'bg-white rounded-3xl border border-gray-200';
    case 'shadow':
      return 'bg-white rounded-xl shadow-xl border border-transparent';
    case 'transparent':
      return 'bg-white/70 backdrop-blur rounded-2xl border border-white/40';
    case 'soft':
      return 'bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 shadow-sm';
    case 'bordered':
      return 'bg-white rounded-lg border-2 border-gray-900';
    case 'glass':
      return 'bg-white/40 backdrop-blur-xl rounded-3xl border border-white/60 shadow-lg';
    case 'minimal':
      return 'bg-transparent border-b border-gray-300 rounded-none';
    case 'elevated':
      return 'bg-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] border border-transparent';
    case 'frame':
      return 'bg-white rounded-xl border-2 border-gray-200 ring-1 ring-inset ring-gray-100';
    // v0.7.x 메모지 시리즈
    case 'sticky':
      return 'bg-yellow-100 rounded-sm shadow-md border-b-2 border-yellow-200';
    case 'mint':
      return 'bg-emerald-50 rounded-lg shadow-sm border border-emerald-200';
    case 'pink':
      return 'bg-pink-50 rounded-lg shadow-sm border border-pink-200';
    case 'sky':
      return 'bg-sky-50 rounded-lg shadow-sm border border-sky-200';
    case 'notebook':
      return 'bg-white rounded-lg border border-gray-200 [background-image:repeating-linear-gradient(0deg,transparent_0,transparent_27px,rgba(59,130,246,0.18)_27px,rgba(59,130,246,0.18)_28px)]';
    case 'grid-paper':
      return 'bg-white rounded-lg border border-gray-200 [background-image:linear-gradient(rgba(0,0,0,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.05)_1px,transparent_1px)] [background-size:20px_20px]';
    case 'dashed':
      return 'bg-white rounded-lg border-2 border-dashed border-gray-400';
    case 'double-border':
      return 'bg-white rounded-lg border-4 border-double border-gray-400';
    case 'ringed':
      return 'bg-white rounded-lg ring-2 ring-violet-300 ring-offset-2 ring-offset-white/0';
    case 'bevel':
      return 'bg-white rounded-md border-t border-l border-white border-b-2 border-r-2 border-b-gray-400 border-r-gray-400 shadow-inner';
    default:
      return 'bg-white';
  }
}

function fontClass(style: FontStyle): string {
  return `font-${style}`;
}

function ProfileWidget({ data }: { data: PreviewData['profile'] }) {
  return (
    <div className="text-center py-4">
      {data.image_url ? (
        <img src={imgSrc(data.image_url)} alt="" className="w-20 h-20 rounded-full object-cover mx-auto mb-3" />
      ) : (
        <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto mb-3" />
      )}
      <div className="font-bold">{data.nickname}</div>
      {data.intro && <div className="text-sm opacity-70 mt-1">{data.intro}</div>}
    </div>
  );
}

function UrlsWidget({ data, point }: { data: PreviewData['urls']; point: string }) {
  return (
    <div>
      <h3 className="text-sm font-bold mb-3" style={{ color: point }}>URL 보관함</h3>
      <ul className="space-y-2">
        {data.length === 0 && <li className="text-sm opacity-60">아직 저장된 URL이 없어요.</li>}
        {data.map((u) => (
          <li key={u.id}>
            <a href={u.url} target="_blank" rel="noopener noreferrer" className="block group">
              <div className="text-sm font-medium group-hover:underline">{u.title}</div>
              <div className="text-xs opacity-60 truncate">{u.url}</div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AlbumsWidget({ data, point }: { data: PreviewData['albums']; point: string }) {
  return (
    <div>
      <h3 className="text-sm font-bold mb-3" style={{ color: point }}>앨범</h3>
      {data.length === 0 && <p className="text-sm opacity-60">아직 사진이 없어요.</p>}
      {data.map((a) => (
        <div key={a.category} className="mb-4">
          <div className="text-xs opacity-70 mb-1.5">{a.category}</div>
          <div className="grid grid-cols-3 gap-1.5">
            {a.photos.map((p) => (
              <img key={p.id} src={imgSrc(p.image_url)} alt={p.caption ?? ''} className="aspect-square object-cover rounded" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MemosWidget({ data, point }: { data: PreviewData['memos']; point: string }) {
  return (
    <div>
      <h3 className="text-sm font-bold mb-3" style={{ color: point }}>메모</h3>
      <ul className="space-y-3">
        {data.length === 0 && <li className="text-sm opacity-60">아직 메모가 없어요.</li>}
        {data.map((m) => (
          <li key={m.id}>
            <div className="text-sm font-medium">{m.title}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function renderWidget(kind: WidgetKind, data: PreviewData, point: string) {
  switch (kind) {
    case 'profile':
      return <ProfileWidget data={data.profile} />;
    case 'urls':
      return <UrlsWidget data={data.urls} point={point} />;
    case 'albums':
      return <AlbumsWidget data={data.albums} point={point} />;
    case 'memos':
      return <MemosWidget data={data.memos} point={point} />;
    case 'empty':
      return null;
  }
}

export function WidgetBoard({ style, data }: { style: DecorateStyle; data: PreviewData }) {
  const visibleSlots = style.layout_slots
    .filter((s) => s.visible && s.widget !== 'empty')
    .sort((a, b) => a.slot - b.slot);

  const containerStyle: React.CSSProperties = {
    backgroundColor: style.background_color,
    color: style.text_color,
    backgroundImage:
      style.use_background_image && style.background_image_url ? `url(${imgSrc(style.background_image_url)})` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  const cardCls = cardClass(style.card_style);
  const fontCls = fontClass(style.font_style);
  // 모바일에서는 항상 1단으로 폴백. md 이상에서만 2단.
  const gridCls = style.layout_mode === 'double' ? 'md:grid-cols-2' : 'md:grid-cols-1';

  return (
    <div className={`min-h-full w-full p-6 ${fontCls}`} style={containerStyle}>
      <div className={`grid grid-cols-1 ${gridCls} gap-4 max-w-3xl mx-auto`}>
        {visibleSlots.map((s) => (
          <div key={s.slot} className={`${cardCls} p-5`}>
            {renderWidget(s.widget, data, style.point_color)}
          </div>
        ))}
      </div>
    </div>
  );
}
