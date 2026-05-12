import { decorateService } from '@/lib/services/decorate';
import { ok, handle } from '@/lib/errors/response';

export async function PUT(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const homepage = await decorateService.save(body);
    return ok({ homepage }, '저장되었습니다.');
  } catch (e) {
    return handle(e);
  }
}
