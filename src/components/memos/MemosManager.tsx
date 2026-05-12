'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Button, DangerButton, Input, Textarea } from '@/components/ui/primitives';
import type { MemoRow } from '@/types/db';

type DraftMap = Record<string, { title: string; content: string }>;

export function MemosManager() {
  const [items, setItems] = useState<MemoRow[]>([]);
  const [drafts, setDrafts] = useState<DraftMap>({});
  const [loading, setLoading] = useState(true);
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const savingSet = useRef<Set<string>>(new Set());
  const [savingTick, setSavingTick] = useState(0);

  const load = useCallback(async () => {
    const r = await (await fetch('/api/memos')).json();
    if (r.success) {
      setItems(r.data.items);
      const next: DraftMap = {};
      for (const m of r.data.items as MemoRow[]) {
        next[m.id] = { title: m.title, content: m.content };
      }
      setDrafts(next);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => () => {
    Object.values(timers.current).forEach(clearTimeout);
  }, []);

  async function addNew() {
    const r = await (await fetch('/api/memos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '새 메모', content: ' ' }),
    })).json();
    if (!r.success) {
      alert(r.message ?? '작성 실패');
      return;
    }
    const m = r.data.item as MemoRow;
    setItems((s) => [m, ...s]);
    setDrafts((d) => ({ ...d, [m.id]: { title: m.title, content: '' } }));
  }

  function persist(id: string, patch: { title?: string; content?: string }) {
    savingSet.current.add(id);
    setSavingTick((t) => t + 1);
    fetch(`/api/memos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    })
      .then((r) => r.json())
      .then((r) => {
        if (r.success) {
          setItems((s) => s.map((m) => (m.id === id ? { ...m, ...patch } : m)));
        }
      })
      .finally(() => {
        savingSet.current.delete(id);
        setSavingTick((t) => t + 1);
      });
  }

  function changeField(id: string, patch: { title?: string; content?: string }) {
    setDrafts((d) => ({ ...d, [id]: { ...(d[id] ?? { title: '', content: '' }), ...patch } }));
    if (timers.current[id]) clearTimeout(timers.current[id]);
    timers.current[id] = setTimeout(() => {
      persist(id, patch);
      delete timers.current[id];
    }, 800);
  }

  async function remove(id: string) {
    if (!confirm('이 메모를 삭제할까요?')) return;
    if (timers.current[id]) { clearTimeout(timers.current[id]); delete timers.current[id]; }
    const r = await (await fetch(`/api/memos/${id}`, { method: 'DELETE' })).json();
    if (!r.success) {
      alert(r.message ?? '삭제 실패');
      return;
    }
    setItems((s) => s.filter((m) => m.id !== id));
    setDrafts((d) => { const { [id]: _drop, ...rest } = d; void _drop; return rest; });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">메모장</h1>
        <Button onClick={addNew}>+ 새 메모</Button>
      </div>

      {loading && <p className="text-sm opacity-50">불러오는 중...</p>}

      {!loading && items.length === 0 && (
        <Card>
          <p className="text-sm opacity-60">아직 메모가 없어요. 우측 상단 “+ 새 메모”로 추가하세요.</p>
        </Card>
      )}

      <div className="space-y-3">
        {items.map((m) => {
          const d = drafts[m.id] ?? { title: m.title, content: m.content };
          const saving = savingSet.current.has(m.id);
          return (
            <Card key={m.id} className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <Input
                  aria-label="제목"
                  className="flex-1 font-medium"
                  value={d.title}
                  maxLength={100}
                  placeholder="제목"
                  onChange={(e) => changeField(m.id, { title: e.target.value })}
                />
                <div className="flex items-center gap-2 shrink-0">
                  {saving && <span className="text-[11px] opacity-50">저장 중…</span>}
                  <DangerButton onClick={() => remove(m.id)} aria-label="삭제">✕</DangerButton>
                </div>
              </div>
              <Textarea
                aria-label="내용"
                rows={4}
                maxLength={10000}
                placeholder="내용을 입력하세요"
                value={d.content}
                onChange={(e) => changeField(m.id, { content: e.target.value })}
              />
              <div className="text-[11px] opacity-40">
                {new Date(m.created_at).toLocaleString('ko-KR')}
              </div>
            </Card>
          );
        })}
        {/* savingTick → 렌더 강제 */}
        <span className="hidden">{savingTick}</span>
      </div>
    </div>
  );
}
