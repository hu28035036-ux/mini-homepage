import { cardCategoriesService } from '@/lib/services/cardCategories';
import { ok, handle } from '@/lib/errors/response';

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    await cardCategoriesService.remove(id);
    return ok({}, '삭제되었습니다.');
  } catch (e) {
    return handle(e);
  }
}
