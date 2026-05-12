import { expect, type Page } from '@playwright/test';

let counter = 0;

/** 매 테스트마다 고유 이메일/닉네임/슬러그 생성 */
export function uniqueUser(prefix: string) {
  const t = Date.now().toString(36);
  counter++;
  const tag = `${prefix}-${t}-${counter}`;
  return {
    email: `${tag}@example.test`,
    password: 'testpw1234',
    nickname: `tester-${counter}`,
    tag,
  };
}

export async function signup(page: Page, u: { email: string; password: string; nickname: string }) {
  await page.goto('/signup');
  await page.getByLabel('이메일').fill(u.email);
  await page.getByLabel('비밀번호 (8자 이상)').fill(u.password);
  await page.getByLabel('비밀번호 확인').fill(u.password);
  await page.getByLabel('닉네임').fill(u.nickname);
  await page.getByRole('button', { name: '가입하기' }).click();
  await page.waitForURL(/\/login/, { timeout: 45_000 });
}

export async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByLabel('이메일').fill(email);
  await page.getByLabel('비밀번호').fill(password);
  await page.getByRole('button', { name: '로그인' }).click();
  await page.waitForURL(/\/admin/, { timeout: 45_000 });
}

export async function signupAndLogin(page: Page, prefix = 'u') {
  const u = uniqueUser(prefix);
  await signup(page, u);
  await login(page, u.email, u.password);
  return u;
}

export async function apiPost(page: Page, url: string, body: unknown) {
  return page.request.post(url, { data: body });
}

export async function getCurrentSlug(page: Page): Promise<string> {
  // 사이드바에 @{slug} 가 표시됨
  const slugText = await page.locator('aside').locator('text=/^@/').first().textContent();
  expect(slugText).toBeTruthy();
  return slugText!.replace(/^@/, '').trim();
}
