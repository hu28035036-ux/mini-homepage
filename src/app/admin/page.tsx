import Link from 'next/link';
import { homepageService } from '@/lib/services/homepage';
import { urlsService } from '@/lib/services/urls';
import { memosService } from '@/lib/services/memos';
import { albumsService } from '@/lib/services/albums';
import { Card } from '@/components/ui/primitives';

export default async function AdminHome() {
  // 미니홈피 존재 보장 (layout과의 동시성 안전을 위해 page도 ensureMine 사용).
  const hp = await homepageService.ensureMine();
  const [urls, memos, photos] = await Promise.all([
    urlsService.list(),
    memosService.list(),
    albumsService.listPhotos(),
  ]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">{hp.title || '나의 미니홈피'}</h1>
        {hp.intro && <p className="text-gray-500 mt-1">{hp.intro}</p>}
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-700">최근 저장한 URL</h2>
            <Link href="/admin/urls" className="text-xs text-violet-600">전체 →</Link>
          </div>
          {urls.length === 0 && <p className="text-sm text-gray-400">아직 URL이 없습니다.</p>}
          <ul className="space-y-2">
            {urls.slice(0, 5).map((u) => (
              <li key={u.id} className="text-sm">
                <div className="font-medium truncate">{u.title}</div>
                <div className="text-gray-400 text-xs truncate">{u.url}</div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-700">최근 올린 사진</h2>
            <Link href="/admin/albums" className="text-xs text-violet-600">전체 →</Link>
          </div>
          {photos.length === 0 && <p className="text-sm text-gray-400">아직 사진이 없습니다.</p>}
          <div className="grid grid-cols-3 gap-2">
            {photos.slice(0, 6).map((p) => (
              <img
                key={p.id}
                src={p.image_url}
                alt={p.caption ?? ''}
                className="aspect-square object-cover rounded-lg"
              />
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-700">최근 작성한 메모</h2>
            <Link href="/admin/memos" className="text-xs text-violet-600">전체 →</Link>
          </div>
          {memos.length === 0 && <p className="text-sm text-gray-400">아직 메모가 없습니다.</p>}
          <ul className="space-y-2">
            {memos.slice(0, 3).map((m) => (
              <li key={m.id} className="text-sm">
                <div className="font-medium truncate">{m.title}</div>
                <div className="text-gray-400 text-xs line-clamp-1">{m.content}</div>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-700">바로가기</h2>
          </div>
          <div className="space-y-2 text-sm">
            <Link href="/admin/decorate" className="block px-3 py-2 rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100">꾸미기 하러 가기 →</Link>
            <Link href="/admin/settings" className="block px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100">설정 변경 →</Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
