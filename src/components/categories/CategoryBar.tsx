'use client';

import { useState } from 'react';
import { Input, Button } from '@/components/ui/primitives';
import type { CardCategory } from '@/types/db';

/**
 * 메모·URL 카테고리 관리 바 — 추가/이름수정/삭제.
 * 자체적으로 apiBase에 CRUD를 호출하고, 변경 시 onChanged로 부모가 목록을 재조회한다.
 */
export function CategoryBar({
  label,
  apiBase,
  categories,
  onChanged,
}: {
  label: string;
  apiBase: string; // 예: '/api/memos/categories'
  categories: CardCategory[];
  onChanged: () => void;
}) {
  const [name, setName] = useState('');
  const [err, setErr] = useState('');

  async function add() {
    const n = name.trim();
    if (!n) return;
    setErr('');
    const r = await (await fetch(apiBase, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: n }),
    })).json();
    if (!r.success) {
      setErr(r.message ?? '추가 실패');
      return;
    }
    setName('');
    onChanged();
  }

  async function rename(c: CardCategory) {
    const next = prompt('새 카테고리 이름', c.name);
    if (!next || next.trim() === c.name || !next.trim()) return;
    const r = await (await fetch(`${apiBase}/${c.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: next.trim() }),
    })).json();
    if (!r.success) {
      alert(r.message ?? '수정 실패');
      return;
    }
    onChanged();
  }

  async function remove(c: CardCategory) {
    if (!confirm(`"${c.name}" 카테고리를 삭제할까요? (항목은 미분류로 남습니다)`)) return;
    const r = await (await fetch(`${apiBase}/${c.id}`, { method: 'DELETE' })).json();
    if (!r.success) {
      alert(r.message ?? '삭제 실패');
      return;
    }
    onChanged();
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-bold text-gray-700">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {categories.length === 0 && (
          <span className="text-xs text-gray-400">아직 카테고리가 없어요.</span>
        )}
        {categories.map((c) => (
          <span
            key={c.id}
            data-category-chip={c.name}
            className="inline-flex items-center gap-1 rounded-full bg-violet-50 text-violet-700 pl-2.5 pr-1 py-0.5 text-xs"
          >
            <button type="button" onClick={() => rename(c)} className="hover:underline" title="이름 수정">
              {c.name}
            </button>
            <button
              type="button"
              onClick={() => remove(c)}
              aria-label={`카테고리 ${c.name} 삭제`}
              className="w-4 h-4 rounded-full hover:bg-violet-200 leading-none"
            >
              ✕
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={30}
          placeholder="새 카테고리"
          aria-label={`${label} 새 카테고리 이름`}
        />
        <Button onClick={add}>+ 추가</Button>
      </div>
      {err && <p className="text-xs text-rose-600">{err}</p>}
    </div>
  );
}
