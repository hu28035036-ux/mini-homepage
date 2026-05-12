'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

const NAV = [
  { href: '/admin', label: '홈' },
  { href: '/admin/decorate', label: '꾸미기' },
  { href: '/admin/settings', label: '설정' },
];

export function TopBar({
  slug,
  isPublic,
  pointColor,
}: {
  slug: string;
  isPublic: boolean;
  pointColor: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 bg-white/70 backdrop-blur border-b border-black/5 px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-3 min-w-0">
        <Link href="/admin" className="font-bold text-base shrink-0" style={{ color: pointColor }}>
          @{slug}
        </Link>
        <span
          className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
            isPublic ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {isPublic ? '공개' : '비공개'}
        </span>
      </div>

      <nav className="hidden sm:flex items-center gap-1">
        {NAV.map((it) => {
          const active = pathname === it.href || (it.href !== '/admin' && pathname.startsWith(it.href));
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`px-3 py-1.5 rounded-lg transition ${
                active ? 'bg-black/5 font-medium' : 'hover:bg-black/5'
              }`}
            >
              {it.label}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2 shrink-0">
        <a
          href={`/u/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex px-3 py-1.5 rounded-lg bg-black/5 hover:bg-black/10 transition text-xs"
        >
          공개 페이지 ↗
        </a>
        <button onClick={logout} className="px-3 py-1.5 rounded-lg hover:bg-black/5 transition text-xs">
          로그아웃
        </button>
      </div>
    </header>
  );
}
