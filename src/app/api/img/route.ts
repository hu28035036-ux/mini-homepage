import { getCurrentUserId } from '@/lib/auth/guards';
import { downloadImage } from '@/lib/storage/uploader';
import { homepagesRepo } from '@/lib/repositories/homepages';

// 이미지 프록시 — private 버킷 객체를 접근 통제 후 스트리밍.
// 허용: 본인 이미지 / 또는 경로 소유자의 미니홈피가 공개 상태일 때.
// 경로 형식: {userId}/{photos|background|profile|drawings}/{filename}
const PATH_RE = /^[0-9a-fA-F-]{32,40}\/(?:photos|background|profile|drawings)\/[A-Za-z0-9._-]+$/;

function notFound(): Response {
  return new Response('Not found', { status: 404 });
}

export async function GET(req: Request) {
  const path = new URL(req.url).searchParams.get('path') ?? '';
  if (!PATH_RE.test(path)) return notFound();

  const ownerId = path.split('/')[0];

  // 접근 권한
  const viewerId = await getCurrentUserId();
  const allowed = viewerId === ownerId || (await homepagesRepo.isPublicByUserId(ownerId));
  if (!allowed) return notFound();

  const blob = await downloadImage(path);
  if (!blob) return notFound();

  return new Response(blob, {
    status: 200,
    headers: {
      'Content-Type': blob.type || 'application/octet-stream',
      'Cache-Control': 'private, max-age=300',
    },
  });
}
