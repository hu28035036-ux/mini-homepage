'use client';

import { useRouter } from 'next/navigation';
import type { MiniHomepageRow } from '@/types/db';

interface Counts {
  urls: number;
  photos: number;
  albumCategories: number;
  memos: number;
}

export function MobileHome({
  hp,
  counts,
  onOpen,
}: {
  hp: MiniHomepageRow;
  counts: Counts;
  onOpen: (kind: 'urls' | 'albums' | 'memos') => void;
}) {
  const router = useRouter();

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-base" style={{ color: hp.point_color }}>@{hp.slug}</span>
          <span
            className={`text-[11px] px-2 py-0.5 rounded-full ${
              hp.is_public ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            {hp.is_public ? '공개' : '비공개'}
          </span>
        </div>
      </div>

      {/* 데이터 폴더 그룹 */}
      <ul className="bg-white/80 backdrop-blur rounded-2xl border border-black/5 divide-y divide-black/5 overflow-hidden">
        <li>
          <button
            type="button"
            onClick={() => onOpen('urls')}
            className="w-full flex items-center justify-between gap-3 px-4 py-4 text-left hover:bg-black/5"
          >
            <span className="flex items-center gap-3">
              <span className="text-xl" aria-hidden>🔗</span>
              <span className="font-medium">URL 보관함</span>
            </span>
            <span className="flex items-center gap-2 text-sm opacity-60">
              {counts.urls}개
              <span aria-hidden>›</span>
            </span>
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => onOpen('albums')}
            className="w-full flex items-center justify-between gap-3 px-4 py-4 text-left hover:bg-black/5"
          >
            <span className="flex items-center gap-3">
              <span className="text-xl" aria-hidden>🖼</span>
              <span className="font-medium">앨범</span>
            </span>
            <span className="flex items-center gap-2 text-sm opacity-60">
              {counts.photos}장 / {counts.albumCategories}개 카테고리
              <span aria-hidden>›</span>
            </span>
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => onOpen('memos')}
            className="w-full flex items-center justify-between gap-3 px-4 py-4 text-left hover:bg-black/5"
          >
            <span className="flex items-center gap-3">
              <span className="text-xl" aria-hidden>📝</span>
              <span className="font-medium">메모</span>
            </span>
            <span className="flex items-center gap-2 text-sm opacity-60">
              {counts.memos}개
              <span aria-hidden>›</span>
            </span>
          </button>
        </li>
      </ul>

      {/* 설정/도구 그룹 — 꾸미기는 모바일에서 제외 (PC/태블릿 전용) */}
      <ul className="bg-white/80 backdrop-blur rounded-2xl border border-black/5 divide-y divide-black/5 overflow-hidden">
        <li>
          <button
            type="button"
            onClick={() => router.push('/admin/settings')}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-black/5"
          >
            <span className="flex items-center gap-3">
              <span className="text-base" aria-hidden>⚙</span>
              <span className="text-sm">설정</span>
            </span>
            <span aria-hidden className="opacity-50">›</span>
          </button>
        </li>
        <li>
          <a
            href={`/u/${hp.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-black/5"
          >
            <span className="flex items-center gap-3">
              <span className="text-base" aria-hidden>🌐</span>
              <span className="text-sm">공개 페이지</span>
            </span>
            <span aria-hidden className="opacity-50">↗</span>
          </a>
        </li>
      </ul>

      <p className="text-[11px] opacity-50 text-center px-2">
        꾸미기·그림판·사용자 카드는 PC/태블릿(가로 768px 이상)에서 배치할 수 있어요.
      </p>
    </div>
  );
}
