'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Card, Button, GhostButton, DangerButton, Input, Label, ErrorText } from '@/components/ui/primitives';
import type { UrlRow } from '@/types/db';

type ApiResult<T = unknown> = { success: boolean; data?: T; error_code?: string; message?: string };

async function api<T>(url: string, init?: RequestInit): Promise<ApiResult<T>> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });
  return res.json();
}

export function UrlsManager() {
  const [items, setItems] = useState<UrlRow[]>([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [err, setErr] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [eTitle, setETitle] = useState('');
  const [eUrl, setEUrl] = useState('');

  async function load() {
    const r = await api<{ items: UrlRow[] }>('/api/urls');
    if (r.success && r.data) setItems(r.data.items);
  }
  useEffect(() => {
    load();
  }, []);

  async function add(e: FormEvent) {
    e.preventDefault();
    setErr('');
    const r = await api<{ item: UrlRow }>('/api/urls', {
      method: 'POST',
      body: JSON.stringify({ title, url }),
    });
    if (!r.success) {
      setErr(r.message ?? '추가 실패');
      return;
    }
    setTitle('');
    setUrl('');
    load();
  }

  function startEdit(u: UrlRow) {
    setEditing(u.id);
    setETitle(u.title);
    setEUrl(u.url);
  }

  async function saveEdit(id: string) {
    const r = await api<{ item: UrlRow }>(`/api/urls/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ title: eTitle, url: eUrl }),
    });
    if (!r.success) {
      alert(r.message ?? '저장 실패');
      return;
    }
    setEditing(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm('정말 삭제할까요?')) return;
    const r = await api(`/api/urls/${id}`, { method: 'DELETE' });
    if (!r.success) alert(r.message ?? '삭제 실패');
    load();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">URL 보관함</h1>

      <Card>
        <form onSubmit={add} className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto] gap-3 items-end">
          <div>
            <Label htmlFor="t">제목</Label>
            <Input id="t" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={100} />
          </div>
          <div>
            <Label htmlFor="u">주소 (https://...)</Label>
            <Input id="u" type="url" value={url} onChange={(e) => setUrl(e.target.value)} required />
          </div>
          <Button type="submit">추가</Button>
        </form>
        {err && <ErrorText>{err}</ErrorText>}
      </Card>

      <Card>
        {items.length === 0 && <p className="text-sm text-gray-400">아직 저장된 URL이 없습니다.</p>}
        <ul className="divide-y divide-gray-100">
          {items.map((u) => (
            <li key={u.id} className="py-3">
              {editing === u.id ? (
                <div className="space-y-2">
                  <Input value={eTitle} onChange={(e) => setETitle(e.target.value)} />
                  <Input value={eUrl} onChange={(e) => setEUrl(e.target.value)} />
                  <div className="flex gap-2">
                    <Button onClick={() => saveEdit(u.id)}>저장</Button>
                    <GhostButton onClick={() => setEditing(null)}>취소</GhostButton>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="font-medium truncate">{u.title}</div>
                    <a href={u.url} target="_blank" rel="noopener noreferrer" className="text-sm text-violet-600 hover:underline truncate block">
                      {u.url}
                    </a>
                    <div className="text-xs text-gray-400 mt-0.5">{new Date(u.created_at).toLocaleDateString('ko-KR')}</div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <GhostButton onClick={() => startEdit(u)}>수정</GhostButton>
                    <DangerButton onClick={() => remove(u.id)}>삭제</DangerButton>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
