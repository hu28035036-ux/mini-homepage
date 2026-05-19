import { supabaseServer } from '@/lib/db/supabase-server';
import { AppError } from '@/lib/errors/codes';

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? 'user-uploads';
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_BYTES = 10 * 1024 * 1024;

// 업로드 후 스토리지 경로를 반환한다. 버킷은 private이며 표시는 /api/img 프록시가 담당한다.
export async function uploadImage(buffer: Buffer, mime: string, byteSize: number, path: string): Promise<string> {
  if (!ALLOWED_MIME.has(mime)) {
    throw new AppError('PHOTO_INVALID_MIME', { mime });
  }
  if (byteSize > MAX_BYTES) {
    throw new AppError('STORAGE_FILE_TOO_LARGE', { byteSize, max: MAX_BYTES });
  }

  const supabase = supabaseServer();
  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: mime,
    upsert: false,
  });
  if (error) {
    console.error('[storage:upload]', error);
    throw new AppError('STORAGE_UPLOAD_FAILED', { reason: error.message });
  }
  return path;
}

/** 레거시 full Storage URL이면 경로를 추출, 이미 경로면 그대로 반환. */
export function toStoragePath(value: string): string {
  const m = value.match(/\/storage\/v1\/object\/(?:public|sign|authenticated)\/[^/]+\/(.+)$/);
  return m ? decodeURIComponent(m[1].split('?')[0]) : value;
}

/** private 버킷에서 객체를 다운로드. /api/img 프록시 전용. 없으면 null. */
export async function downloadImage(path: string): Promise<Blob | null> {
  const supabase = supabaseServer();
  const { data, error } = await supabase.storage.from(BUCKET).download(path);
  if (error || !data) return null;
  return data;
}
