'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Modal, IconButton } from '@/components/ui/primitives';
import { FreeCanvas, defaultBlocks, useTrack } from '@/components/canvas/FreeCanvas';
import { UrlsManager } from '@/components/urls/UrlsManager';
import { AlbumsManager } from '@/components/albums/AlbumsManager';
import { MemosManager } from '@/components/memos/MemosManager';
import type { Block, Layouts, MiniHomepageRow, PhotoRow, UrlRow, MemoRow } from '@/types/db';

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
  const [expanded, setExpanded] = useState<ExpandKind>(null);
  const track = useTrack();

  async function loadAll() {
    const [u, m, p] = await Promise.all([
      fetch('/api/urls').then((r) => r.json()),
      fetch('/api/memos').then((r) => r.json()),
      fetch('/api/albums/photos').then((r) => r.json()),
    ]);
    if (u.success) setUrls(u.data.items);
    if (m.success) setMemos(m.data.items);
    if (p.success) setPhotos(p.data.items);
  }

  useEffect(() => {
    loadAll();
  }, []);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const layoutsRef = useRef<Layouts>(layouts);
  useEffect(() => { layoutsRef.current = layouts; }, [layouts]);

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
    } else {
      alert(r.message ?? '저장 실패');
    }
  }, []);

  function handleLayoutsChange(next: Layouts) {
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

  function renderBlock(b: Block) {
    switch (b.kind) {
      case 'title':
        return (
          <div className="h-full flex items-center">
            <h1 className="text-3xl font-bold leading-tight" style={{ color: hp.text_color }}>
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
            <h3 className="text-sm font-bold mb-2" style={{ color: hp.point_color }}>URL 보관함</h3>
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
            <h3 className="text-sm font-bold mb-2" style={{ color: hp.point_color }}>앨범</h3>
            {photos.length === 0 ? (
              <p className="text-xs opacity-50">아직 사진이 없어요.</p>
            ) : (
              <div className="grid grid-cols-3 gap-1.5">
                {photos.slice(0, 9).map((p) => (
                  <img key={p.id} src={p.image_url} alt={p.caption ?? ''} className="aspect-square object-cover rounded" />
                ))}
              </div>
            )}
          </div>
        );
      case 'memos':
        return (
          <div>
            <h3 className="text-sm font-bold mb-2" style={{ color: hp.point_color }}>메모</h3>
            {memos.length === 0 ? (
              <p className="text-xs opacity-50">아직 메모가 없어요.</p>
            ) : (
              <ul className="space-y-2">
                {memos.slice(0, 4).map((m) => (
                  <li key={m.id} className="text-sm">
                    <div className="font-medium truncate">{m.title}</div>
                    <div className="opacity-60 text-xs line-clamp-2 whitespace-pre-wrap">{m.content}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
    }
  }

  // 숨김 처리된 블록 다시 보이게 하는 헬퍼
  const hiddenBlocks = layouts[track]?.filter((b) => !b.visible) ?? [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="text-xs opacity-60">
          {editMode ? '편집 모드: 카드를 드래그·리사이즈하세요' : '평소 모드'}
          <span className="ml-2 opacity-50">({track === 'desktop' ? '데스크탑' : '모바일/태블릿'} 레이아웃)</span>
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
        fontStyle={hp.font_style}
        pointColor={hp.point_color}
        renderBlock={renderBlock}
        onExpand={(k) => k !== 'title' && k !== 'profile' && setExpanded(k as ExpandKind)}
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
    </div>
  );
}
