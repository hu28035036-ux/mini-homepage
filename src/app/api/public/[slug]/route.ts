import { loadPublicHomepage } from '@/lib/services/publicView';
import { ok, handle } from '@/lib/errors/response';

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await ctx.params;
    const data = await loadPublicHomepage(slug);
    return ok(data);
  } catch (e) {
    return handle(e);
  }
}
