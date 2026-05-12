import { request, type FullConfig } from '@playwright/test';

/**
 * Next dev mode 첫 cold-compile이 매우 느려 테스트가 timeout.
 * 핵심 API/페이지를 미리 한 번씩 hit해 워밍업한다.
 */
export default async function globalSetup(_config: FullConfig) {
  const base = 'http://localhost:3100';
  const ctx = await request.newContext({ baseURL: base });

  const paths = [
    '/login',
    '/signup',
    // POST signup으로 라우트 + service + repo + supabase client + bcrypt 컴파일 워밍
    { method: 'post' as const, url: '/api/auth/signup', data: { email: 'warm@x.test', password: 'warm1234', nickname: 'w' } },
    { method: 'post' as const, url: '/api/auth/login', data: { email: 'warm@x.test', password: 'warm1234' } },
    '/admin',
    '/admin/urls',
    '/admin/albums',
    '/admin/memos',
    '/admin/decorate',
    '/admin/settings',
    '/api/homepage',
    '/api/urls',
    '/api/memos',
    '/api/albums/categories',
    '/api/decorate',
    '/u/nonexistent-warmup',
    '/api/public/nonexistent-warmup',
    '/api/auth/logout',
  ];

  for (const p of paths) {
    try {
      if (typeof p === 'string') {
        await ctx.get(p);
      } else {
        await ctx[p.method](p.url, { data: p.data });
      }
    } catch {
      // 워밍업이므로 실패 무시
    }
  }

  await ctx.dispose();
}
