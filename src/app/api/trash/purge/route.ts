import { trashService } from '@/lib/services/trash';
import { ok, handle } from '@/lib/errors/response';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    await trashService.purge(body.entityType, body.id);
    return ok({}, '영구 삭제되었습니다.');
  } catch (e) {
    return handle(e);
  }
}
