'use client';

import { useState, useEffect, useCallback, ReactNode } from 'react';
import { Card } from '@/components/ui/primitives';
import { imgSrc } from '@/lib/storage/imageSrc';
import type { UrlRow, PhotoRow, MemoRow, AlbumCategoryRow } from '@/types/db';

interface TrashData {
  urls: UrlRow[];
  photos: PhotoRow[];
  memos: MemoRow[];
  albumCategories: AlbumCategoryRow[];
}

const EMPTY: TrashData = { urls: [], photos: [], memos: [], albumCategories: [] };

function whenDeleted(at: string | null): string {
  if (!at) return '';
  return new Date(at).toLocaleString('ko-KR');
}

export function TrashManager() {
  const [data, setData] = useState<TrashData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const r = await (await fetch('/api/trash')).json();
    if (r.success) setData(r.data as TrashData);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function restore(entityType: string, id: string) {
    setBusy(id);
    const r = await (await fetch('/api/trash/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entityType, id }),
    })).json();
    setBusy(null);
    if (!r.success) { alert(r.message ?? '복구에 실패했습니다.'); return; }
    await load();
  }

  async function purge(entityType: string, id: string) {
    if (!confirm('영구 삭제하면 되돌릴 수 없어요. 계속할까요?')) return;
    setBusy(id);
    const r = await (await fetch('/api/trash/purge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entityType, id }),
    })).json();
    setBusy(null);
    if (!r.success) { alert(r.message ?? '영구 삭제에 실패했습니다.'); return; }
    await load();
  }

  function Row({
    entity, id, title, sub, thumb, deletedAt,
  }: {
    entity: string; id: string; title: string; sub?: string; thumb?: string | null; deletedAt: string | null;
  }) {
    const disabled = busy === id;
    return (
      <div
        data-trash-id={id}
        data-trash-entity={entity}
        className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0"
      >
        {thumb !== undefined && (
          thumb
            ? <img src={thumb} alt="" className="w-10 h-10 rounded object-cover border border-black/5 shrink-0" />
            : <span className="w-10 h-10 rounded bg-gray-100 shrink-0" />
        )}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium truncate">{title || '(제목 없음)'}</div>
          {sub && <div className="text-[11px] opacity-50 truncate">{sub}</div>}
          <div className="text-[11px] opacity-40">{whenDeleted(deletedAt)} 삭제됨</div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => restore(entity, id)}
            disabled={disabled}
            className="text-xs px-3 py-1.5 rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 disabled:opacity-50 transition"
          >
            복구
          </button>
          <button
            type="button"
            onClick={() => purge(entity, id)}
            disabled={disabled}
            className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 transition"
          >
            영구삭제
          </button>
        </div>
      </div>
    );
  }

  function Section({ title, count, children }: { title: string; count: number; children: ReactNode }) {
    if (count === 0) return null;
    return (
      <Card>
        <h2 className="text-sm font-bold mb-1">{title} <span className="opacity-50">({count})</span></h2>
        <div>{children}</div>
      </Card>
    );
  }

  const total = data.urls.length + data.photos.length + data.memos.length + data.albumCategories.length;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">휴지통</h1>
      <p className="text-sm opacity-60">
        삭제한 항목을 복구하거나 영구 삭제할 수 있어요. 직접 영구 삭제하기 전까지 보관되며 자동으로 지워지지 않습니다.
      </p>

      {loading && <p className="text-sm opacity-50">불러오는 중...</p>}

      {!loading && total === 0 && (
        <Card>
          <p className="text-sm opacity-60">휴지통이 비어 있어요.</p>
        </Card>
      )}

      <Section title="URL" count={data.urls.length}>
        {data.urls.map((u) => (
          <Row key={u.id} entity="url" id={u.id} title={u.title} sub={u.url} deletedAt={u.deleted_at} />
        ))}
      </Section>

      <Section title="사진" count={data.photos.length}>
        {data.photos.map((p) => (
          <Row
            key={p.id}
            entity="photo"
            id={p.id}
            title={p.caption || '(설명 없음)'}
            thumb={imgSrc(p.image_url)}
            deletedAt={p.deleted_at}
          />
        ))}
      </Section>

      <Section title="메모" count={data.memos.length}>
        {data.memos.map((m) => (
          <Row key={m.id} entity="memo" id={m.id} title={m.title} deletedAt={m.deleted_at} />
        ))}
      </Section>

      <Section title="앨범 카테고리" count={data.albumCategories.length}>
        {data.albumCategories.map((c) => (
          <Row
            key={c.id}
            entity="album_category"
            id={c.id}
            title={c.name}
            sub="앨범 카테고리 (복구 시 함께 삭제된 사진도 복구)"
            deletedAt={c.deleted_at}
          />
        ))}
      </Section>
    </div>
  );
}
