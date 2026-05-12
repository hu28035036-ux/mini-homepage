import { albumsService } from '@/lib/services/albums';
import { ok, handle } from '@/lib/errors/response';

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    await albumsService.deletePhoto(id);
    return ok({}, '삭제되었습니다.');
  } catch (e) {
    return handle(e);
  }
}
