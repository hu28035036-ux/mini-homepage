import { test, expect } from '@playwright/test';
import { uniqueUser } from './helpers';

// Race 회귀 방지: 가입 직후 /admin·/api/urls 동시 호출에서 DB_RECORD_NOT_FOUND가 절대 나오지 않아야.
test.describe('Race regression (BUG-001/002)', () => {
  test('가입 직후 /admin 6회 동시 진입도 모두 200', async ({ request }) => {
    const u = uniqueUser('race-admin');
    const signupRes = await request.post('/api/auth/signup', {
      data: { email: u.email, password: u.password, nickname: u.nickname },
    });
    expect(signupRes.status()).toBe(201);

    const loginRes = await request.post('/api/auth/login', {
      data: { email: u.email, password: u.password },
    });
    expect(loginRes.status()).toBe(200);

    // 6개 동시 진입 — race가 살아있다면 일부가 500 또는 DB_RECORD_NOT_FOUND
    const reqs = Array.from({ length: 6 }, () => request.get('/admin'));
    const results = await Promise.all(reqs);
    for (const r of results) {
      expect(r.status()).toBe(200);
    }
  });

  test('가입 직후 곧장 /api/urls 호출 → 미니홈피 자동 생성됨', async ({ request }) => {
    const u = uniqueUser('race-api');
    await request.post('/api/auth/signup', {
      data: { email: u.email, password: u.password, nickname: u.nickname },
    });
    await request.post('/api/auth/login', { data: { email: u.email, password: u.password } });

    // UI 거치지 않고 곧장 API 호출
    const r = await request.get('/api/urls');
    expect(r.status()).toBe(200);
    const body = await r.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data.items)).toBe(true);
  });

  test('가입 직후 곧장 /api/decorate PUT → 미니홈피 자동 생성됨', async ({ request }) => {
    const u = uniqueUser('race-dec');
    await request.post('/api/auth/signup', {
      data: { email: u.email, password: u.password, nickname: u.nickname },
    });
    await request.post('/api/auth/login', { data: { email: u.email, password: u.password } });

    const r = await request.put('/api/decorate', {
      data: { background_color: '#abcdef' },
    });
    expect(r.status()).toBe(200);
    const body = await r.json();
    expect(body.success).toBe(true);
  });
});
