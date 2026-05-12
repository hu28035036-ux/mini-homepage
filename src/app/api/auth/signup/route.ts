import { authService } from '@/lib/services/auth';
import { ok, handle } from '@/lib/errors/response';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const result = await authService.signup(body);
    return ok(result, '가입이 완료되었습니다.', 201);
  } catch (e) {
    return handle(e);
  }
}
