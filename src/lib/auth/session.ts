import { cookies } from 'next/headers';
import { getIronSession, type IronSession, type SessionOptions } from 'iron-session';

export interface SessionData {
  user_id?: string;
}

function getSessionOptions(): SessionOptions {
  const password = process.env.SESSION_SECRET;
  if (!password || password.length < 32) {
    throw new Error(
      '[session] SESSION_SECRET이 비어있거나 32자 미만입니다. .env.local에 32자 이상의 랜덤 문자열을 설정하세요.'
    );
  }
  return {
    password,
    cookieName: process.env.SESSION_COOKIE_NAME ?? 'mh_session',
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      // 14일
      maxAge: 60 * 60 * 24 * 14,
    },
  };
}

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, getSessionOptions());
}
