import { decorateService } from '@/lib/services/decorate';
import { ok, handle } from '@/lib/errors/response';
import { AppError } from '@/lib/errors/codes';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) throw new AppError('VALIDATION_REQUIRED_FIELD', { field: 'file' });
    const buf = Buffer.from(await file.arrayBuffer());
    const result = await decorateService.uploadBackground({
      buffer: buf,
      mime: file.type,
      byteSize: file.size,
      filename: file.name,
    });
    return ok(result, '배경 이미지가 업로드되었습니다.');
  } catch (e) {
    return handle(e);
  }
}
