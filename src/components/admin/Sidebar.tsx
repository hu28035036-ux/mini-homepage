'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const ITEMS = [
  { href: '/admin', label: '홈' },
  { href: '/admin/urls', label: 'URL 보관함' },
  { href: '/admin/albums', label: '앨범집' },
  { href: '/admin/memos', label: '메모장' },
  { href: '/admin/decorate', label: '꾸미기' },
  { href: '/admin/settings', label: '설정' },
];

export function Sidebar({ slug, isPublic }: { slug: string; isPublic: boolean }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <aside className="w-60 shrink-0 border-r border-gray-100 bg-white h-screen sticky top-0 flex flex-col">
      <div className="p-4 border-b border-gray-100">
        <div className="text-sm text-gray-500">미니홈피</div>
        <div className="text-base font-bold mt-0.5">@{slug}</div>
        <div
          className={`mt-2 inline-flex items-center text-xs px-2 py-0.5 rounded-full ${
            isPublic ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {isPublic ? '공개' : '비공개'}
        </div>
      </div>
      <nav className="flex-1 p-2">
        {ITEMS.map((it) => {
          const active = pathname === it.href || (it.href !== '/admin' && pathname.startsWith(it.href));
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`block px-3 py-2 rounded-lg text-sm mb-1 ${
                active ? 'bg-violet-50 text-violet-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {it.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-gray-100 space-y-2">
        <a
          href={`/u/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center text-sm px-3 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200"
        >
          공개 페이지 열기 ↗
        </a>
        <button
          onClick={logout}
          className="w-full text-sm px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-50"
        >
          로그아웃
        </button>
      </div>
    </aside>
  );
}
