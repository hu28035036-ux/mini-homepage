import { trashService } from '@/lib/services/trash';
import { ok, handle } from '@/lib/errors/response';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    await trashService.restore(body.entityType, body.id);
    return ok({}, '복구되었습니다.');
  } catch (e) {
    return handle(e);
  }
}
