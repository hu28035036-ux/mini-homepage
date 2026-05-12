'use client';

import { useState, useEffect } from 'react';
import { Card, Modal, IconButton } from '@/components/ui/primitives';
import { UrlsManager } from '@/components/urls/UrlsManager';
import { AlbumsManager } from '@/components/albums/AlbumsManager';
import { MemosManager } from '@/components/memos/MemosManager';
import type { UrlRow, MemoRow, PhotoRow, MiniHomepageRow } from '@/types/db';

const Expand = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M3 6V3h3M13 6V3h-3M3 10v3h3M13 10v3h-3" />
  </svg>
);

type WidgetKind = 'urls' | 'albums' | 'memos' | null;

export function HomeDashboard({ hp }: { hp: MiniHomepageRow }) {
  const [urls, setUrls] = useState<UrlRow[]>([]);
  const [memos, setMemos] = useState<MemoRow[]>([]);
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [expanded, setExpanded] = useState<WidgetKind>(null);

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

  // 모달 닫힐 때 데이터 새로고침 (모달 안에서 추가/수정/삭제 반영)
  function closeExpanded() {
    setExpanded(null);
    loadAll();
  }

  const cardBg = 'bg-white/80 backdrop-blur';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{hp.title || '나의 노트'}</h1>
        {hp.intro && <p className="opacity-70 mt-1">{hp.intro}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* URL */}
        <Card className={cardBg}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold">URL 보관함</h2>
            <IconButton onClick={() => setExpanded('urls')} title="전체보기">
              <Expand />
            </IconButton>
          </div>
          {urls.length === 0 && <p className="text-sm opacity-50">아직 저장된 링크가 없어요.</p>}
          <ul className="space-y-2">
            {urls.slice(0, 5).map((u) => (
              <li key={u.id} className="text-sm">
                <a href={u.url} target="_blank" rel="noopener noreferrer" className="block hover:underline">
                  <div className="font-medium truncate">{u.title}</div>
                  <div className="opacity-50 text-xs truncate">{u.url}</div>
                </a>
              </li>
            ))}
          </ul>
        </Card>

        {/* 사진 */}
        <Card className={cardBg}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold">앨범</h2>
            <IconButton onClick={() => setExpanded('albums')} title="전체보기">
              <Expand />
            </IconButton>
          </div>
          {photos.length === 0 && <p className="text-sm opacity-50">아직 사진이 없어요.</p>}
          <div className="grid grid-cols-3 gap-2">
            {photos.slice(0, 6).map((p) => (
              <img
                key={p.id}
                src={p.image_url}
                alt={p.caption ?? ''}
                className="aspect-square object-cover rounded-lg"
              />
            ))}
          </div>
        </Card>

        {/* 메모 */}
        <Card className={cardBg}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold">메모</h2>
            <IconButton onClick={() => setExpanded('memos')} title="전체보기">
              <Expand />
            </IconButton>
          </div>
          {memos.length === 0 && <p className="text-sm opacity-50">아직 메모가 없어요.</p>}
          <ul className="space-y-3">
            {memos.slice(0, 3).map((m) => (
              <li key={m.id} className="text-sm">
                <div className="font-medium truncate">{m.title}</div>
                <div className="opacity-60 text-xs line-clamp-2 whitespace-pre-wrap">{m.content}</div>
              </li>
            ))}
          </ul>
        </Card>

        {/* 프로필 / 바로가기 */}
        <Card className={cardBg}>
          <div className="flex items-center gap-3 mb-3">
            {hp.profile_image_url ? (
              <img src={hp.profile_image_url} alt="" className="w-14 h-14 rounded-full object-cover" />
            ) : (
              <div className="w-14 h-14 rounded-full bg-black/10" />
            )}
            <div className="min-w-0">
              <div className="font-bold">@{hp.slug}</div>
              <div className="text-xs opacity-60">{hp.is_public ? '공개 상태' : '비공개 상태'}</div>
            </div>
          </div>
          <div className="text-xs opacity-70 leading-relaxed">
            이 노트는 본인 취향대로 꾸미는 개인 기록 공간이에요. 꾸미기 탭에서 색·배경·폰트를 바꿔보세요.
          </div>
        </Card>
      </div>

      {/* 카드별 전체보기 모달 */}
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
