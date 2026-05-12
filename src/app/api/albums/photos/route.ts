import { albumsService } from '@/lib/services/albums';
import { ok, handle } from '@/lib/errors/response';
import { AppError } from '@/lib/errors/codes';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const categoryId = url.searchParams.get('category_id') ?? undefined;
    const items = await albumsService.listPhotos(categoryId);
    return ok({ items });
  } catch (e) {
    return handle(e);
  }
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    const categoryId = String(form.get('category_id') ?? '');
    const caption = form.get('caption');
    if (!(file instanceof File)) throw new AppError('VALIDATION_REQUIRED_FIELD', { field: 'file' });
    if (!categoryId) throw new AppError('VALIDATION_REQUIRED_FIELD', { field: 'category_id' });

    const buf = Buffer.from(await file.arrayBuffer());
    const item = await albumsService.uploadPhoto({
      categoryId,
      caption: typeof caption === 'string' ? caption : null,
      file: { buffer: buf, mime: file.type, byteSize: file.size, filename: file.name },
    });
    return ok({ item }, '업로드되었습니다.', 201);
  } catch (e) {
    return handle(e);
  }
}
