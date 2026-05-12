import { memosService } from '@/lib/services/memos';
import { ok, handle } from '@/lib/errors/response';

export async function GET() {
  try {
    const items = await memosService.list();
    return ok({ items });
  } catch (e) {
    return handle(e);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const item = await memosService.create(body);
    return ok({ item }, '작성되었습니다.', 201);
  } catch (e) {
    return handle(e);
  }
}
