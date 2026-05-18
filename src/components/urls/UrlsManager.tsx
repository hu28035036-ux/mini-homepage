'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Card, Button, GhostButton, DangerButton, Input, Label, ErrorText } from '@/components/ui/primitives';
import { CategoryBar } from '@/components/categories/CategoryBar';
import type { UrlRow, CardCategory } from '@/types/db';

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
  const [categories, setCategories] = useState<CardCategory[]>([]);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [cat, setCat] = useState('');
  const [err, setErr] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [eTitle, setETitle] = useState('');
  const [eUrl, setEUrl] = useState('');

  async function load() {
    const r = await api<{ items: UrlRow[] }>('/api/urls');
    if (r.success && r.data) setItems(r.data.items);
  }
  async function loadCategories() {
    const r = await api<{ items: CardCategory[] }>('/api/urls/categories');
    if (r.success && r.data) setCategories(r.data.items);
  }
  useEffect(() => {
    load();
    loadCategories();
  }, []);

  async function add(e: FormEvent) {
    e.preventDefault();
    setErr('');
    const r = await api<{ item: UrlRow }>('/api/urls', {
      method: 'POST',
      body: JSON.stringify({ title, url, category_id: cat || null }),
    });
    if (!r.success) {
      setErr(r.message ?? '추가 실패');
      return;
    }
    setTitle('');
    setUrl('');
    setCat('');
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

  async function changeCategory(id: string, categoryId: string) {
    const value = categoryId || null;
    setItems((s) => s.map((u) => (u.id === id ? { ...u, category_id: value } : u)));
    await api(`/api/urls/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ category_id: value }),
    });
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
        <CategoryBar
          label="URL 카테고리"
          apiBase="/api/urls/categories"
          categories={categories}
          onChanged={loadCategories}
        />
      </Card>

      <Card>
        <form onSubmit={add} className="grid grid-cols-1 md:grid-cols-[1fr_2fr_auto_auto] gap-3 items-end">
          <div>
            <Label htmlFor="t">제목</Label>
            <Input id="t" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={100} />
          </div>
          <div>
            <Label htmlFor="u">주소 (https://...)</Label>
            <Input id="u" type="url" value={url} onChange={(e) => setUrl(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="c">카테고리</Label>
            <select
              id="c"
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-500"
            >
              <option value="">미분류</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
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
                  <select
                    aria-label="URL 카테고리"
                    value={u.category_id ?? ''}
                    onChange={(e) => changeCategory(u.id, e.target.value)}
                    className="shrink-0 rounded-lg border border-gray-200 px-2 py-1 text-xs outline-none focus:border-violet-500"
                  >
                    <option value="">미분류</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
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
