'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Card, Button, GhostButton, DangerButton, Input, Textarea, Label } from '@/components/ui/primitives';
import type { MemoRow } from '@/types/db';

export function MemosManager() {
  const [items, setItems] = useState<MemoRow[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [eTitle, setETitle] = useState('');
  const [eContent, setEContent] = useState('');

  async function load() {
    const r = await (await fetch('/api/memos')).json();
    if (r.success) setItems(r.data.items);
  }
  useEffect(() => {
    load();
  }, []);

  async function add(e: FormEvent) {
    e.preventDefault();
    const r = await (await fetch('/api/memos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content }),
    })).json();
    if (!r.success) {
      alert(r.message ?? '작성 실패');
      return;
    }
    setTitle('');
    setContent('');
    load();
  }

  function startEdit(m: MemoRow) {
    setEditing(m.id);
    setETitle(m.title);
    setEContent(m.content);
  }

  async function save(id: string) {
    const r = await (await fetch(`/api/memos/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: eTitle, content: eContent }),
    })).json();
    if (!r.success) {
      alert(r.message ?? '저장 실패');
      return;
    }
    setEditing(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm('정말 삭제할까요?')) return;
    await fetch(`/api/memos/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">메모장</h1>

      <Card>
        <form onSubmit={add} className="space-y-3">
          <div>
            <Label htmlFor="mt">제목</Label>
            <Input id="mt" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={100} />
          </div>
          <div>
            <Label htmlFor="mc">내용</Label>
            <Textarea id="mc" value={content} onChange={(e) => setContent(e.target.value)} required rows={4} maxLength={10000} />
          </div>
          <Button type="submit">작성</Button>
        </form>
      </Card>

      <div className="space-y-3">
        {items.length === 0 && <Card><p className="text-sm text-gray-400">아직 메모가 없습니다.</p></Card>}
        {items.map((m) => (
          <Card key={m.id}>
            {editing === m.id ? (
              <div className="space-y-3">
                <Input value={eTitle} onChange={(e) => setETitle(e.target.value)} />
                <Textarea value={eContent} onChange={(e) => setEContent(e.target.value)} rows={4} />
                <div className="flex gap-2">
                  <Button onClick={() => save(m.id)}>저장</Button>
                  <GhostButton onClick={() => setEditing(null)}>취소</GhostButton>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium">{m.title}</h3>
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{m.content}</p>
                    <div className="text-xs text-gray-400 mt-2">{new Date(m.created_at).toLocaleDateString('ko-KR')}</div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <GhostButton onClick={() => startEdit(m)}>수정</GhostButton>
                    <DangerButton onClick={() => remove(m.id)}>삭제</DangerButton>
                  </div>
                </div>
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
