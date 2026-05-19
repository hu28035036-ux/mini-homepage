'use client';

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { Card, Button, GhostButton, DangerButton, Input, Label, ErrorText } from '@/components/ui/primitives';
import { PhotoLightbox, type LightboxPhoto } from '@/components/albums/PhotoLightbox';
import { imgSrc } from '@/lib/storage/imageSrc';
import type { AlbumCategoryRow, PhotoRow } from '@/types/db';

async function getJson<T>(url: string): Promise<{ success: boolean; data?: T; message?: string }> {
  const res = await fetch(url);
  return res.json();
}

export function AlbumsManager() {
  const [categories, setCategories] = useState<AlbumCategoryRow[]>([]);
  const [photos, setPhotos] = useState<PhotoRow[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const lightboxPhotos: LightboxPhoto[] = photos.map((p) => ({ url: imgSrc(p.image_url), caption: p.caption }));
  const [newCat, setNewCat] = useState('');
  const [err, setErr] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  async function loadCategories() {
    const r = await getJson<{ items: AlbumCategoryRow[] }>('/api/albums/categories');
    if (r.success && r.data) {
      setCategories(r.data.items);
      if (!selected && r.data.items.length > 0) setSelected(r.data.items[0].id);
    }
  }
  async function loadPhotos(catId: string) {
    const r = await getJson<{ items: PhotoRow[] }>(`/api/albums/photos?category_id=${catId}`);
    if (r.success && r.data) setPhotos(r.data.items);
  }

  useEffect(() => {
    loadCategories();
  }, []);
  useEffect(() => {
    if (selected) loadPhotos(selected);
  }, [selected]);

  async function addCategory() {
    setErr('');
    if (!newCat.trim()) return;
    const res = await fetch('/api/albums/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCat.trim() }),
    });
    const r = await res.json();
    if (!r.success) {
      setErr(r.message ?? '추가 실패');
      return;
    }
    setNewCat('');
    loadCategories();
  }

  async function renameCategory(cat: AlbumCategoryRow) {
    const next = prompt('새 카테고리 이름', cat.name);
    if (!next || next === cat.name) return;
    const res = await fetch(`/api/albums/categories/${cat.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: next.trim() }),
    });
    const r = await res.json();
    if (!r.success) {
      alert(r.message ?? '수정 실패');
      return;
    }
    loadCategories();
  }

  async function deleteCategory(cat: AlbumCategoryRow) {
    if (!confirm(`"${cat.name}" 카테고리와 안의 사진을 모두 삭제할까요?`)) return;
    const res = await fetch(`/api/albums/categories/${cat.id}`, { method: 'DELETE' });
    const r = await res.json();
    if (!r.success) {
      alert(r.message ?? '삭제 실패');
      return;
    }
    setSelected(null);
    loadCategories();
  }

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f || !selected) return;
    const fd = new FormData();
    fd.append('file', f);
    fd.append('category_id', selected);
    const res = await fetch('/api/albums/photos', { method: 'POST', body: fd });
    const r = await res.json();
    if (!r.success) {
      alert(r.message ?? '업로드 실패');
      return;
    }
    if (fileRef.current) fileRef.current.value = '';
    loadPhotos(selected);
  }

  async function deletePhoto(id: string) {
    if (!confirm('정말 삭제할까요?')) return;
    const res = await fetch(`/api/albums/photos/${id}`, { method: 'DELETE' });
    const r = await res.json();
    if (!r.success) alert(r.message ?? '삭제 실패');
    if (selected) loadPhotos(selected);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">앨범집</h1>

      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-4">
        <Card>
          <h2 className="text-sm font-bold text-gray-700 mb-3">카테고리</h2>
          <ul className="space-y-1 mb-4">
            {categories.map((c) => (
              <li
                key={c.id}
                className={`group flex items-center justify-between px-2 py-1.5 rounded-lg text-sm cursor-pointer ${
                  selected === c.id ? 'bg-violet-50 text-violet-700 font-medium' : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelected(c.id)}
              >
                <span className="truncate">{c.name}{c.is_default && <span className="text-xs text-gray-400 ml-1">(기본)</span>}</span>
                {!c.is_default && (
                  <span className="opacity-0 group-hover:opacity-100 flex gap-1 transition">
                    <button onClick={(e) => { e.stopPropagation(); renameCategory(c); }} className="text-xs text-gray-500 hover:text-gray-700">이름</button>
                    <button onClick={(e) => { e.stopPropagation(); deleteCategory(c); }} className="text-xs text-red-500 hover:text-red-700">삭제</button>
                  </span>
                )}
              </li>
            ))}
          </ul>
          <div className="space-y-2">
            <Label htmlFor="newcat">카테고리 추가</Label>
            <div className="flex gap-2">
              <Input id="newcat" value={newCat} onChange={(e) => setNewCat(e.target.value)} maxLength={30} placeholder="예: 여행" />
              <Button onClick={addCategory}>+</Button>
            </div>
            {err && <ErrorText>{err}</ErrorText>}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-gray-700">사진</h2>
            {selected && (
              <label className="cursor-pointer inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium bg-violet-600 text-white hover:bg-violet-700">
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={onFile} />
                사진 업로드
              </label>
            )}
          </div>
          {!selected && <p className="text-sm text-gray-400">카테고리를 선택하세요.</p>}
          {selected && photos.length === 0 && <p className="text-sm text-gray-400">아직 사진이 없습니다.</p>}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {photos.map((p, idx) => (
              <div key={p.id} className="relative group">
                <button
                  type="button"
                  onClick={() => setLightboxIndex(idx)}
                  className="block w-full"
                  aria-label="사진 크게 보기"
                >
                  <img src={imgSrc(p.image_url)} alt={p.caption ?? ''} className="aspect-square w-full object-cover rounded-lg cursor-zoom-in" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deletePhoto(p.id); }}
                  className="absolute top-2 right-2 text-xs bg-white/90 text-red-600 rounded px-2 py-0.5 opacity-0 group-hover:opacity-100 transition"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <PhotoLightbox
        open={lightboxIndex !== null}
        photos={lightboxPhotos}
        index={lightboxIndex ?? 0}
        onIndexChange={setLightboxIndex}
        onClose={() => setLightboxIndex(null)}
      />
    </div>
  );
}
