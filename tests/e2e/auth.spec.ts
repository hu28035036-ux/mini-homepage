import { test, expect } from '@playwright/test';
import { uniqueUser, signup, login } from './helpers';

test.describe('인증 (TC-AUTH)', () => {
  test('TC-AUTH-001/003 회원가입 → 로그인 한 사이클', async ({ page }) => {
    const u = uniqueUser('auth-happy');
    await signup(page, u);
    expect(page.url()).toMatch(/\/login/);

    await login(page, u.email, u.password);
    expect(page.url()).toMatch(/\/admin/);
    await expect(page.locator('[data-slug]').first()).toHaveAttribute('data-slug', /.+/);
  });

  test('TC-AUTH-002 이메일 중복은 409 + AUTH_EMAIL_DUPLICATE', async ({ page }) => {
    const u = uniqueUser('auth-dup');
    await signup(page, u);

    // 다시 같은 이메일로 가입 시도
    await page.goto('/signup');
    await page.getByLabel('이메일').fill(u.email);
    await page.getByLabel('비밀번호 (8자 이상)').fill(u.password);
    await page.getByLabel('비밀번호 확인').fill(u.password);
    await page.getByLabel('닉네임').fill(u.nickname);
    await page.getByRole('button', { name: '가입하기' }).click();
    await expect(page.getByText('이미 사용 중인 이메일입니다.')).toBeVisible();
  });

  test('TC-AUTH-004 비밀번호 오기 → AUTH_INVALID_CREDENTIAL (이메일 존재 누설 없음)', async ({ page }) => {
    const u = uniqueUser('auth-wrong');
    await signup(page, u);

    await page.goto('/login');
    await page.getByLabel('이메일').fill(u.email);
    await page.getByLabel('비밀번호').fill('wrongpass1234');
    await page.getByRole('button', { name: '로그인' }).click();
    await expect(page.getByText('이메일 또는 비밀번호가 올바르지 않습니다.')).toBeVisible();

    // 존재하지 않는 이메일도 동일 메시지
    await page.getByLabel('이메일').fill(`nope-${Date.now()}@example.test`);
    await page.getByLabel('비밀번호').fill('whatever1234');
    await page.getByRole('button', { name: '로그인' }).click();
    await expect(page.getByText('이메일 또는 비밀번호가 올바르지 않습니다.')).toBeVisible();
  });

  test('TC-AUTH-005 비로그인 사용자가 /admin 접근 시 /login으로 리다이렉트', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/admin');
    await page.waitForURL(/\/login/);
    expect(page.url()).toMatch(/\/login/);
  });

  test('TC-AUTH-006 로그아웃 후 /admin 접근 시 리다이렉트', async ({ page }) => {
    const u = uniqueUser('auth-out');
    await signup(page, u);
    await login(page, u.email, u.password);

    // v0.6: 햄버거 메뉴를 열고 '로그아웃' 클릭
    await page.getByRole('button', { name: '메뉴 열기' }).click();
    await page.getByRole('menuitem', { name: '로그아웃' }).click();
    await page.waitForURL(/\/login/);

    await page.goto('/admin');
    await page.waitForURL(/\/login/);
  });
});
