import { getSession } from './session';
import { AppError } from '@/lib/errors/codes';

/** 세션 사용자 id 반환. 미로그인이면 AUTH_REQUIRED 던짐. */
export async function requireUser(): Promise<string> {
  const session = await getSession();
  if (!session.user_id) {
    throw new AppError('AUTH_REQUIRED');
  }
  return session.user_id;
}

/** 세션 사용자 id 또는 null. 미들웨어/리다이렉트 분기용. */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getSession();
  return session.user_id ?? null;
}

/** 자원의 소유자가 현재 세션 사용자인지 확인. 불일치면 DB_RECORD_NOT_FOUND(존재 노출 방지). */
export function assertOwnership(resourceUserId: string, sessionUserId: string): void {
  if (resourceUserId !== sessionUserId) {
    throw new AppError('DB_RECORD_NOT_FOUND');
  }
}
