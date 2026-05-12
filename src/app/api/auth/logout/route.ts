import { authService } from '@/lib/services/auth';
import { ok, handle } from '@/lib/errors/response';

export async function POST() {
  try {
    await authService.logout();
    return ok({}, '로그아웃되었습니다.');
  } catch (e) {
    return handle(e);
  }
}
