import { trashService } from '@/lib/services/trash';
import { ok, handle } from '@/lib/errors/response';

export async function GET() {
  try {
    const data = await trashService.list();
    return ok(data);
  } catch (e) {
    return handle(e);
  }
}
