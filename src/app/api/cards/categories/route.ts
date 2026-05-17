import { cardCategoriesService } from '@/lib/services/cardCategories';
import { ok, handle } from '@/lib/errors/response';

export async function GET() {
  try {
    const items = await cardCategoriesService.list();
    return ok({ items });
  } catch (e) {
    return handle(e);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const item = await cardCategoriesService.create(body);
    return ok({ item }, '추가되었습니다.', 201);
  } catch (e) {
    return handle(e);
  }
}
