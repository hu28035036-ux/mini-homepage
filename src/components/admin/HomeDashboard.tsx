'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Modal, IconButton } from '@/components/ui/primitives';
import { FreeCanvas, defaultBlocks, useTrack } from '@/components/canvas/FreeCanvas';
import { DrawPad } from '@/components/canvas/DrawPad';
import { UrlsManager } from '@/components/urls/UrlsManager';
import { AlbumsManager } from '@/components/albums/AlbumsManager';
import { MemosManager } from '@/components/memos/MemosManager';
import { MobileHome } from '@/components/admin/MobileHome';
import { PhotoLightbox, type LightboxPhoto } from '@/components/albums/PhotoLightbox';
import { textColorOrGradientStyle } from '@/components/decorate/ColorPicker';
import type { Block, Layouts, MiniHomepageRow, PhotoRow, UrlRow, MemoRow, AlbumCategoryRow } from '@/types/db';

const Expand = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M3 6V3h3M13 6V3h-3M3 10v3h3M13 10v3h-3" />
  </svg>
);

type ExpandKind = 'urls' | 'albums' | 'memos' | null;

function ensureLayouts(hp: MiniHomepageRow): Layouts {
  const layouts = hp.layouts ?? { desktop: [], mobile: [] };
  return {
    desktop: layouts.desktop && layouts.desktop.length > 0 ? layouts.desktop : defaultBlocks('desktop'),
    mobile: layouts.mobile && layouts.mobile.length > 0 ? layouts.mobile : defaultBlocks('mobile'),
  };
}

export function HomeDashboard({ hp }: { hp: MiniHomepageRow }) {
  const [layouts, setLayouts] = useState<Layouts>(() => ensureLayouts(hp));
  const [editMode, setEditMode] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [urls, setUrls] = useState<UrlRow[]>([]);
  const [memos, setMemos] = useState<MemoRow[]>([]);
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [albumCategories, setAlbumCategories] = useState<AlbumCategoryRow[]>([]);
  const [expanded, setExpanded] = useState<ExpandKind>(null);
  const [drawingTarget, setDrawingTarget] = useState<Block | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const track = useTrack();
  const router = useRouter();
  // SSR과 client 첫 렌더가 다른 분기로 가는 hydration mismatch 방지.
  // mount 전엔 분기 없이 빈 placeholder만 그림 → mount 후 실제 viewport로 분기.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  async function loadAll() {
    const [u, m, p, c] = await Promise.all([
      fetch('/api/urls').then((r) => r.json()),
      fetch('/api/memos').then((r) => r.json()),
      fetch('/api/albums/photos').then((r) => r.json()),
      fetch('/api/albums/categories').then((r) => r.json()),
    ]);
    if (u.success) setUrls(u.data.items);
    if (m.success) setMemos(m.data.items);
    if (p.success) setPhotos(p.data.items);
    if (c.success) setAlbumCategories(c.data.items);
  }

  useEffect(() => {
    loadAll();
  }, []);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const layoutsRef = useRef<Layouts>(layouts);
  useEffect(() => { layoutsRef.current = layouts; }, [layouts]);

  // 외부 갱신(router.refresh 후 새 hp.layouts) 동기화 — 미저장 변경 중에는 덮어쓰지 않음
  useEffect(() => {
    if (dirty) return;
    const next = ensureLayouts(hp);
    setLayouts((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hp]);

  const persistLayouts = useCallback(async (next: Layouts) => {
    setSaving(true);
    const r = await (
      await fetch('/api/decorate', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layouts: next }),
      })
    ).json();
    setSaving(false);
    if (r.success) {
      setDirty(false);
      // server component(admin/layout, admin/page)가 새 hp.layouts로 다시 렌더되도록
      router.refresh();
    } else {
      alert(r.message ?? '저장 실패');
    }
  }, [router]);

  function handleLayoutsChange(next: Layouts) {
    // ref 동기 갱신 — 편집 직후 '레이아웃 저장' 클릭이 useEffect 갱신보다 빨라도 최신값 저장
    layoutsRef.current = next;
    setLayouts(next);
    setDirty(true);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { persistLayouts(next); }, 1500);
  }

  async function saveLayouts() {
    if (saveTimer.current) { clearTimeout(saveTimer.current); saveTimer.current = null; }
    await persistLayouts(layoutsRef.current);
  }

  useEffect(() => () => { if (saveTimer.current) clearTimeout(saveTimer.current); }, []);

  const closeExpanded = useCallback(() => {
    setExpanded(null);
    loadAll();
  }, []);

  async function quickAdd(kind: Block['kind']) {
    if (kind === 'urls' || kind === 'albums') {
      setExpanded(kind);
      return;
    }
    if (kind === 'memos') {
      // 빈 메모 즉시 생성 후 메모 모달 오픈
      const r = await (await fetch('/api/memos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: '새 메모', content: ' ' }),
      })).json();
      if (r.success) {
        setMemos((s) => [r.data.item as MemoRow, ...s]);
      }
      setExpanded('memos');
    }
  }

  function renderBlock(b: Block) {
    switch (b.kind) {
      case 'title':
        return (
          <div className="h-full flex items-center">
            <h1 className="text-3xl font-bold leading-tight" style={textColorOrGradientStyle(hp.text_color)}>
              {hp.title || '나의 노트'}
            </h1>
          </div>
        );
      case 'profile':
        return (
          <div className="h-full flex flex-col items-center justify-center text-center">
            {hp.profile_image_url ? (
              <img src={hp.profile_image_url} alt="" className="w-16 h-16 rounded-full object-cover mb-2" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-black/10 mb-2" />
            )}
            <div className="font-bold">@{hp.slug}</div>
            {hp.intro && <div className="text-sm opacity-70 mt-1 line-clamp-3">{hp.intro}</div>}
          </div>
        );
      case 'urls':
        return (
          <div>
            {urls.length === 0 ? (
              <p className="text-xs opacity-50">아직 저장된 링크가 없어요.</p>
            ) : (
              <ul className="space-y-2">
                {urls.slice(0, 6).map((u) => (
                  <li key={u.id} className="text-sm">
                    <a
                      href={u.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="block hover:underline"
                    >
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
            {photos.length === 0 ? (
              <p className="text-xs opacity-50">아직 사진이 없어요.</p>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {photos.slice(0, 9).map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(idx); }}
                    className="block"
                    aria-label="사진 크게 보기"
                  >
                    <img src={p.image_url} alt={p.caption ?? ''} className="aspect-square w-full object-cover rounded cursor-zoom-in" />
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      case 'memos':
        return (
          <div>
            {memos.length === 0 ? (
              <p className="text-xs opacity-50">아직 메모가 없어요.</p>
            ) : (
              <ul className="divide-y divide-black/5">
                {memos.slice(0, 4).map((m) => (
                  <li key={m.id} className="text-sm py-1.5 first:pt-0 last:pb-0">
                    <div className="font-medium truncate">{m.title}</div>
                    <div className="opacity-60 text-xs line-clamp-2 whitespace-pre-wrap">{m.content}</div>
                  </li>
                ))}
              </ul>
            )}
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
            ) : (
              <div className="text-center opacity-50">
                <div className="text-2xl mb-1">🎨</div>
                <div className="text-xs">{editMode ? '카드를 클릭해 그리기' : '클릭해서 그리기'}</div>
              </div>
            )}
          </div>
        );
      case 'custom':
        if (editMode) {
          return (
            <div style={{ pointerEvents: 'auto' }} onPointerDown={(e) => e.stopPropagation()}>
              <textarea
                value={b.customContent ?? ''}
                onChange={(e) => {
                  const next = layouts[track].map((x) => (x.id === b.id ? { ...x, customContent: e.target.value } : x));
                  handleLayoutsChange({ ...layouts, [track]: next });
                }}
                placeholder="내용을 입력하세요"
                maxLength={5000}
                className="w-full bg-transparent outline-none text-xs h-full resize-none mt-1"
                rows={4}
              />
            </div>
          );
        }
        return (
          <div>
            <div className="text-xs opacity-80 whitespace-pre-wrap">{b.customContent}</div>
          </div>
        );
    }
  }

  // 숨김 처리된 블록 다시 보이게 하는 헬퍼
  const hiddenBlocks = layouts[track]?.filter((b) => !b.visible) ?? [];

  // SSR/hydration 단계에선 빈 placeholder (분기 깜빡임 방지)
  if (!mounted) {
    return <div className="min-h-[60vh]" aria-hidden />;
  }

  // 모바일 (<1024px): 리스트형 폴더 구조 (기록 전용)
  if (track === 'mobile') {
    return (
      <div className="space-y-3">
        <MobileHome
          hp={hp}
          counts={{
            urls: urls.length,
            photos: photos.length,
            albumCategories: albumCategories.length,
            memos: memos.length,
          }}
          onOpen={(k) => setExpanded(k)}
        />

        <Modal open={expanded === 'urls'} onClose={closeExpanded} title="URL 보관함" size="xl">
          <UrlsManager />
        </Modal>
        <Modal open={expanded === 'albums'} onClose={closeExpanded} title="앨범" size="xl">
          <AlbumsManager />
        </Modal>
        <Modal open={expanded === 'memos'} onClose={closeExpanded} title="메모" size="xl">
          <MemosManager />
        </Modal>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="text-xs opacity-60">
          {editMode ? '편집 모드: 카드를 드래그·리사이즈하세요' : '평소 모드'}
          <span className="ml-2 opacity-50">(태블릿/PC 레이아웃)</span>
        </div>
        <div className="flex items-center gap-2">
          {editMode && dirty && (
            <button
              onClick={saveLayouts}
              disabled={saving}
              className="text-xs px-3 py-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {saving ? '저장 중...' : '레이아웃 저장'}
            </button>
          )}
          <button
            onClick={() => setEditMode((v) => !v)}
            className={`text-xs px-3 py-1.5 rounded-lg transition ${
              editMode ? 'bg-violet-600 text-white' : 'bg-black/5 hover:bg-black/10'
            }`}
          >
            {editMode ? '편집 끝' : '편집'}
          </button>
        </div>
      </div>

      {editMode && hiddenBlocks.length > 0 && (
        <div className="px-1 text-xs opacity-70 flex items-center gap-2 flex-wrap">
          <span>숨김 카드:</span>
          {hiddenBlocks.map((b) => (
            <button
              key={b.id}
              onClick={() => {
                const next = layouts[track].map((x) => (x.id === b.id ? { ...x, visible: true } : x));
                handleLayoutsChange({ ...layouts, [track]: next });
              }}
              className="px-2 py-0.5 rounded bg-black/5 hover:bg-black/10"
            >
              + {b.kind}
            </button>
          ))}
        </div>
      )}

      <FreeCanvas
        layouts={layouts}
        onLayoutsChange={handleLayoutsChange}
        editMode={editMode}
        cardStyle={hp.card_style}
        cardBackgroundColor={hp.card_background_color}
        fontStyle={hp.font_style}
        pointColor={hp.point_color}
        textColor={hp.text_color}
        defaultOpacity={hp.default_card_opacity ?? 1}
        defaultFontSize={hp.default_font_size ?? 'base'}
        renderBlock={renderBlock}
        onExpand={(k) => k !== 'title' && k !== 'profile' && setExpanded(k as ExpandKind)}
        onQuickAdd={quickAdd}
        onDraw={(block) => setDrawingTarget(block)}
        onExitEdit={() => setEditMode(false)}
      />

      <Modal open={expanded === 'urls'} onClose={closeExpanded} title="URL 보관함" size="xl">
        <UrlsManager />
      </Modal>
      <Modal open={expanded === 'albums'} onClose={closeExpanded} title="앨범" size="xl">
        <AlbumsManager />
      </Modal>
      <Modal open={expanded === 'memos'} onClose={closeExpanded} title="메모" size="xl">
        <MemosManager />
      </Modal>

      <DrawPad
        open={drawingTarget !== null}
        initialUrl={drawingTarget?.drawingUrl ?? null}
        onClose={() => setDrawingTarget(null)}
        onSave={(url) => {
          if (!drawingTarget) return;
          const next = layouts[track].map((x) =>
            x.id === drawingTarget.id ? { ...x, drawingUrl: url } : x
          );
          handleLayoutsChange({ ...layouts, [track]: next });
          setDrawingTarget(null);
        }}
      />

      <PhotoLightbox
        open={lightboxIndex !== null}
        photos={photos.slice(0, 9).map<LightboxPhoto>((p) => ({ url: p.image_url, caption: p.caption }))}
        index={lightboxIndex ?? 0}
        onIndexChange={setLightboxIndex}
        onClose={() => setLightboxIndex(null)}
      />
    </div>
  );
}
