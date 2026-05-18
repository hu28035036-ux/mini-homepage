'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTrack } from '@/components/canvas/FreeCanvas';
import { solidFallback } from '@/components/decorate/ColorPicker';

export function MenuButton({
  slug,
  isPublic: initialIsPublic,
  pointColor,
}: {
  slug: string;
  isPublic: boolean;
  pointColor: string;
}) {
  const router = useRouter();
  const track = useTrack();
  const isMobile = track === 'mobile';
  const [open, setOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [toggling, setToggling] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('mousedown', onDocClick);
      document.addEventListener('keydown', onKey);
    }
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  async function togglePublic() {
    if (toggling) return;
    setToggling(true);
    const next = !isPublic;
    setIsPublic(next);
    const r = await (await fetch('/api/homepage', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_public: next }),
    })).json();
    setToggling(false);
    if (!r.success) {
      setIsPublic(!next);
      alert(r.message ?? '공개 설정 변경 실패');
      return;
    }
    router.refresh();
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setOpen(false);
    router.push('/login');
    router.refresh();
  }

  return (
    <div
      ref={ref}
      className="fixed z-50"
      style={{
        top: 'calc(env(safe-area-inset-top, 0px) + 12px)',
        right: 'calc(env(safe-area-inset-right, 0px) + 12px)',
      }}
    >
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="메뉴 열기"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center w-11 h-11 rounded-xl bg-white/85 backdrop-blur border border-black/5 shadow-sm hover:bg-white transition"
        style={{ color: solidFallback(pointColor) }}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 min-w-[220px] rounded-2xl border border-black/5 bg-white shadow-xl overflow-hidden text-sm"
        >
          <button
            role="menuitem"
            onClick={togglePublic}
            disabled={toggling}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-black/5 disabled:opacity-50 text-left"
          >
            <span className="flex flex-col items-start">
              <span className="font-medium">@{slug}</span>
              <span className={`text-[11px] ${isPublic ? 'text-green-700' : 'text-gray-500'}`}>
                {isPublic ? '공개 페이지 ON' : '비공개 (나만 보기)'}
              </span>
            </span>
            <span
              className={`inline-flex w-9 h-5 items-center rounded-full transition ${isPublic ? 'bg-green-500' : 'bg-gray-300'}`}
              aria-hidden
            >
              <span className={`inline-block w-4 h-4 bg-white rounded-full transition transform ${isPublic ? 'translate-x-4' : 'translate-x-0.5'}`} />
            </span>
          </button>

          <div className="h-px bg-black/5" />

          <div role="none" className="px-4 py-2 text-[11px] text-gray-400">
            현재 레이아웃: {isMobile ? '모바일' : '태블릿/PC'}
          </div>

          <Link
            role="menuitem"
            href="/admin"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 hover:bg-black/5"
          >
            홈
          </Link>
          {!isMobile && (
            <Link
              role="menuitem"
              href="/admin?edit=1"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 hover:bg-black/5"
            >
              편집
            </Link>
          )}
          {!isMobile && (
            <Link
              role="menuitem"
              href="/admin/decorate"
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 hover:bg-black/5"
            >
              꾸미기
            </Link>
          )}
          <Link
            role="menuitem"
            href="/admin/settings"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 hover:bg-black/5"
          >
            설정
          </Link>

          <div className="h-px bg-black/5" />

          <a
            role="menuitem"
            href={`/u/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 hover:bg-black/5"
          >
            공개 페이지 ↗
          </a>

          <div className="h-px bg-black/5" />

          <button
            role="menuitem"
            onClick={logout}
            className="w-full text-left px-4 py-2.5 hover:bg-black/5 text-rose-600"
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}
