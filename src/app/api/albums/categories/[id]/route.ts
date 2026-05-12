import { albumsService } from '@/lib/services/albums';
import { ok, handle } from '@/lib/errors/response';

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const item = await albumsService.updateCategory(id, body);
    return ok({ item }, '저장되었습니다.');
  } catch (e) {
    return handle(e);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    await albumsService.deleteCategory(id);
    return ok({}, '삭제되었습니다.');
  } catch (e) {
    return handle(e);
  }
}
