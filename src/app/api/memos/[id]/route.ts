import { memosService } from '@/lib/services/memos';
import { ok, handle } from '@/lib/errors/response';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const item = await memosService.findOwned(id);
    return ok({ item });
  } catch (e) {
    return handle(e);
  }
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const item = await memosService.update(id, body);
    return ok({ item }, '저장되었습니다.');
  } catch (e) {
    return handle(e);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    await memosService.remove(id);
    return ok({}, '삭제되었습니다.');
  } catch (e) {
    return handle(e);
  }
}
