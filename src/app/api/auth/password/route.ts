import { authService } from '@/lib/services/auth';
import { ok, handle } from '@/lib/errors/response';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    await authService.changePassword(body);
    return ok({}, '비밀번호가 변경되었습니다.');
  } catch (e) {
    return handle(e);
  }
}
