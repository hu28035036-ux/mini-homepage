import { supabaseServer } from '@/lib/db/supabase-server';
import { AppError } from '@/lib/errors/codes';

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET ?? 'user-uploads';
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const MAX_BYTES = 10 * 1024 * 1024;

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
  return publicUrl(path);
}

export function publicUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  if (!base) {
    throw new Error('[storage] NEXT_PUBLIC_SUPABASE_URL 또는 SUPABASE_URL 환경변수가 필요합니다.');
  }
  return `${base}/storage/v1/object/public/${BUCKET}/${path}`;
}
