'use client';

import { useState } from 'react';
import { Modal, Button } from '@/components/ui/primitives';
import type { CardCategory } from '@/types/db';

interface Props {
  open: boolean;
  onClose: () => void;
  categories: CardCategory[];
  /** 추가/삭제 후 부모가 목록을 다시 불러오도록 */
  onChanged: () => void;
}

/** 카드 카테고리 추가·삭제 모달 */
export function CardCategoryManager({ open, onClose, categories, onChanged }: Props) {
  const [name, setName] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  const add = async () => {
    const n = name.trim();
    if (!n || busy) return;
    setBusy(true);
    setErr('');
    const r = await (
      await fetch('/api/cards/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: n }),
      })
    ).json();
    setBusy(false);
    if (!r.success) { setErr(r.message ?? '추가에 실패했습니다.'); return; }
    setName('');
    onChanged();
  };

  const remove = async (id: string) => {
    if (busy) return;
    setBusy(true);
    setErr('');
    await fetch(`/api/cards/categories/${id}`, { method: 'DELETE' });
    setBusy(false);
    onChanged();
  };

  return (
    <Modal open={open} onClose={onClose} title="카테고리 관리">
      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
            placeholder="새 카테고리 이름"
            maxLength={30}
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-500"
            aria-label="새 카테고리 이름"
          />
          <Button onClick={add} disabled={busy} aria-label="카테고리 추가">추가</Button>
        </div>
        {err && <p className="text-sm text-rose-600">{err}</p>}
        {categories.length === 0 ? (
          <p className="text-sm opacity-50">아직 카테고리가 없어요.</p>
        ) : (
          <ul className="divide-y divide-black/5">
            {categories.map((c) => (
              <li key={c.id} className="flex items-center justify-between py-2" data-category-row={c.name}>
                <span className="text-sm">{c.name}</span>
                <button
                  type="button"
                  onClick={() => remove(c.id)}
                  disabled={busy}
                  className="text-xs px-2 py-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100"
                  aria-label={`카테고리 ${c.name} 삭제`}
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
  );
}
