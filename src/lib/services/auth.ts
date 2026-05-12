import { signupSchema, loginSchema, type SignupInput, type LoginInput } from '@/lib/validators/auth';
import { usersRepo } from '@/lib/repositories/users';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { getSession } from '@/lib/auth/session';
import { ensureHomepageForUserId } from './homepage';
import { AppError } from '@/lib/errors/codes';
import { requireUser } from '@/lib/auth/guards';

export const authService = {
  async signup(raw: unknown): Promise<{ user_id: string }> {
    const parsed = parse(signupSchema, raw);
    const existing = await usersRepo.findByEmailActive(parsed.email);
    if (existing) {
      throw new AppError('AUTH_EMAIL_DUPLICATE');
    }
    const password_hash = await hashPassword(parsed.password);
    const row = await usersRepo.insert({
      email: parsed.email,
      password_hash,
      nickname: parsed.nickname,
    });
    // 가입 직후 미니홈피 + 기본 카테고리 자동 생성 (API 직접 사용자도 즉시 사용 가능)
    await ensureHomepageForUserId(row.id);
    return { user_id: row.id };
  },

  async login(raw: unknown): Promise<{ user_id: string }> {
    const parsed = parse(loginSchema, raw);
    const user = await usersRepo.findByEmailActive(parsed.email);
    if (!user) throw new AppError('AUTH_INVALID_CREDENTIAL');
    const ok = await verifyPassword(parsed.password, user.password_hash);
    if (!ok) throw new AppError('AUTH_INVALID_CREDENTIAL');

    const session = await getSession();
    session.user_id = user.id;
    await session.save();
    return { user_id: user.id };
  },

  async logout(): Promise<void> {
    const session = await getSession();
    session.destroy();
  },

  async changePassword(raw: unknown): Promise<void> {
    const uid = await requireUser();
    const body = (raw ?? {}) as { current?: unknown; next?: unknown };
    const current = typeof body.current === 'string' ? body.current : '';
    const next = typeof body.next === 'string' ? body.next : '';
    if (next.length < 8) throw new AppError('AUTH_PASSWORD_WEAK');
    const user = await usersRepo.findByIdActive(uid);
    if (!user) throw new AppError('AUTH_REQUIRED');
    const ok = await verifyPassword(current, user.password_hash);
    if (!ok) throw new AppError('AUTH_PASSWORD_MISMATCH');
    const password_hash = await hashPassword(next);
    await usersRepo.updatePassword(uid, password_hash);
  },
};

function parse<T>(schema: { safeParse: (raw: unknown) => { success: boolean; data?: T; error?: { issues: { path: (string | number)[]; message: string }[] } } }, raw: unknown): T {
  const r = schema.safeParse(raw);
  if (!r.success || !r.data) {
    const issue = r.error?.issues?.[0];
    const field = issue?.path?.[0]?.toString();
    if (!issue?.message || issue.message.includes('Required') || issue.message.includes('필수')) {
      throw new AppError('VALIDATION_REQUIRED_FIELD', { field });
    }
    throw new AppError('VALIDATION_INVALID_FORMAT', { field, hint: issue?.message });
  }
  return r.data;
}
