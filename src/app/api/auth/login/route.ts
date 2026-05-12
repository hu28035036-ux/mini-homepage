import { authService } from '@/lib/services/auth';
import { ok, handle } from '@/lib/errors/response';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const result = await authService.login(body);
    return ok(result, '로그인되었습니다.');
  } catch (e) {
    return handle(e);
  }
}
