'use client';

import { useEffect, useState } from 'react';

export interface LightboxPhoto {
  url: string;
  caption?: string | null;
}

export function PhotoLightbox({
  open,
  photos,
  index,
  onIndexChange,
  onClose,
}: {
  open: boolean;
  photos: LightboxPhoto[];
  index: number;
  onIndexChange: (next: number) => void;
  onClose: () => void;
}) {
  const [downloading, setDownloading] = useState(false);

  const total = photos.length;
  const hasPrev = index > 0;
  const hasNext = index < total - 1;
  const current = open && index >= 0 && index < total ? photos[index] : null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft' && index > 0) onIndexChange(index - 1);
      else if (e.key === 'ArrowRight' && index < total - 1) onIndexChange(index + 1);
    };
    window.addEventListener('keydown', onKey);
    document.documentElement.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.documentElement.style.overflow = '';
    };
  }, [open, onClose, index, total, onIndexChange]);

  if (!open || !current) return null;

  const url = current.url;
  const caption = current.caption;

  async function download() {
    setDownloading(true);
    try {
      const r = await fetch(url, { mode: 'cors' });
      const blob = await r.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      const ext = (url.match(/\.([a-zA-Z0-9]{1,5})(?:\?|$)/)?.[1] ?? 'jpg').toLowerCase();
      a.download = `photo-${Date.now()}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    } catch (e) {
      console.error(e);
      window.open(url, '_blank', 'noopener');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="사진 보기"
    >
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/90 text-gray-900 text-xl leading-none flex items-center justify-center hover:bg-white"
      >
        ×
      </button>

      {total > 1 && (
        <div
          className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-white/15 text-white text-xs tabular-nums backdrop-blur"
          aria-label="사진 위치"
        >
          {index + 1} / {total}
        </div>
      )}

      {total > 1 && (
        <button
          type="button"
          aria-label="이전 사진"
          disabled={!hasPrev}
          onClick={(e) => { e.stopPropagation(); if (hasPrev) onIndexChange(index - 1); }}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 text-gray-900 text-2xl leading-none flex items-center justify-center hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ‹
        </button>
      )}

      {total > 1 && (
        <button
          type="button"
          aria-label="다음 사진"
          disabled={!hasNext}
          onClick={(e) => { e.stopPropagation(); if (hasNext) onIndexChange(index + 1); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 text-gray-900 text-2xl leading-none flex items-center justify-center hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ›
        </button>
      )}

      <div className="max-w-[95vw] max-h-[90vh] flex flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
        <img
          src={url}
          alt={caption ?? ''}
          className="max-w-full max-h-[75vh] object-contain rounded shadow-2xl"
        />
        {caption && <div className="text-white/90 text-sm max-w-prose text-center">{caption}</div>}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={download}
            disabled={downloading}
            className="px-4 py-2 rounded-lg bg-white text-gray-900 text-sm font-medium hover:bg-gray-100 disabled:opacity-50"
          >
            {downloading ? '저장 중...' : '⬇ 저장'}
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg bg-white/20 text-white text-sm hover:bg-white/30"
          >
            원본 보기
          </a>
        </div>
      </div>
    </div>
  );
}
