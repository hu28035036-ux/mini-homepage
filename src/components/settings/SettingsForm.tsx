'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Input, Textarea, Label, ErrorText } from '@/components/ui/primitives';
import type { MiniHomepageRow } from '@/types/db';

export function SettingsForm({ initial }: { initial: MiniHomepageRow }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial.title);
  const [intro, setIntro] = useState(initial.intro ?? '');
  const [profileUrl, setProfileUrl] = useState<string | null>(initial.profile_image_url);
  const [slug, setSlug] = useState(initial.slug);
  const [isPublic, setIsPublic] = useState(initial.is_public);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [saving, setSaving] = useState(false);

  async function onProfileFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const fd = new FormData();
    fd.append('file', f);
    const r = await (await fetch('/api/decorate/profile-image', { method: 'POST', body: fd })).json();
    if (!r.success) {
      setErr(r.message ?? '업로드 실패');
      return;
    }
    setProfileUrl(r.data.profile_image_url);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    setErr('');
    setMsg('');
    if (isPublic !== initial.is_public && isPublic) {
      if (!confirm('외부에서 /u/' + slug + ' 로 접근할 수 있게 됩니다. 계속하시겠어요?')) return;
    }
    setSaving(true);
    const r = await (await fetch('/api/homepage', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        intro: intro || null,
        profile_image_url: profileUrl,
        slug,
        is_public: isPublic,
      }),
    })).json();
    setSaving(false);
    if (!r.success) {
      setErr(r.message ?? '저장 실패');
      return;
    }
    setMsg('저장되었습니다.');
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">설정</h1>

      <form onSubmit={save} className="space-y-4">
        <Card>
          <h2 className="text-sm font-bold mb-3">프로필</h2>

          <Label htmlFor="title">미니홈피 제목</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={100} className="mb-3" />

          <Label htmlFor="intro">한 줄 소개</Label>
          <Textarea id="intro" value={intro} onChange={(e) => setIntro(e.target.value)} rows={2} className="mb-3" />

          <Label>프로필 이미지</Label>
          <div className="flex items-center gap-3">
            {profileUrl ? (
              <img src={profileUrl} alt="" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200" />
            )}
            <label className="inline-flex items-center justify-center cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium bg-gray-100 hover:bg-gray-200">
              <input type="file" accept="image/*" className="hidden" onChange={onProfileFile} />
              이미지 업로드
            </label>
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-bold mb-3">주소</h2>
          <Label htmlFor="slug">미니홈피 주소 (slug)</Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">/u/</span>
            <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} pattern="[a-zA-Z0-9-]{3,30}" className="flex-1" />
          </div>
          <p className="text-xs text-gray-500 mt-1">영문/숫자/하이픈 3~30자.</p>
        </Card>

        <Card>
          <h2 className="text-sm font-bold mb-3">공개 / 비공개</h2>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="pub" checked={!isPublic} onChange={() => setIsPublic(false)} />
              <span className="text-sm">비공개 (나만 보기)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="pub" checked={isPublic} onChange={() => setIsPublic(true)} />
              <span className="text-sm">공개 (외부에서 /u/{slug}로 볼 수 있음)</span>
            </label>
          </div>
        </Card>

        {err && <ErrorText>{err}</ErrorText>}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={saving}>{saving ? '저장 중...' : '저장'}</Button>
          {msg && <span className="text-sm text-green-700">{msg}</span>}
        </div>
      </form>
    </div>
  );
}
