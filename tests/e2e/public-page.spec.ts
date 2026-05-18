import { test, expect } from '@playwright/test';
import { signupAndLogin, getCurrentSlug } from './helpers';

test.describe('공개/비공개 (TC-PUB)', () => {
  test('TC-PUB-001/003/004 비공개 → 공개 → 비공개 흐름', async ({ page, browser }) => {
    await signupAndLogin(page, 'pub-flow');
    const slug = await getCurrentSlug(page);

    // 1) 비공개 상태에서 외부(쿠키 없음)에서 접근 → 404
    const guest = await browser.newContext();
    const guestPage = await guest.newPage();
    const res1 = await guestPage.goto(`/u/${slug}`, { waitUntil: 'domcontentloaded' });
    expect(res1?.status()).toBe(404);
    await expect(guestPage.getByText('페이지를 볼 수 없어요')).toBeVisible();

    // 2) 공개로 전환
    await page.goto('/admin/settings');
    await page.locator('input[name="pub"]').nth(1).check();
    page.once('dialog', (d) => d.accept());
    await page.getByRole('button', { name: '저장' }).click();
    await expect(page.getByText('저장되었습니다.')).toBeVisible();

    // 3) 외부 접근 → 200
    const res2 = await guestPage.goto(`/u/${slug}`, { waitUntil: 'domcontentloaded' });
    expect(res2?.status()).toBe(200);

    // 4) 다시 비공개 → 404
    await page.goto('/admin/settings');
    await page.locator('input[name="pub"]').first().check();
    await page.getByRole('button', { name: '저장' }).click();
    await expect(page.getByText('저장되었습니다.')).toBeVisible();

    const res3 = await guestPage.goto(`/u/${slug}`, { waitUntil: 'domcontentloaded' });
    expect(res3?.status()).toBe(404);

    await guest.close();
  });

  test('TC-PUB-006 비공개와 미존재 slug 동일 응답', async ({ browser }) => {
    const guest = await browser.newContext();
    const guestPage = await guest.newPage();

    // 존재하지 않는 slug
    const res1 = await guestPage.goto('/u/nonexistent-slug-xyz-123', { waitUntil: 'domcontentloaded' });
    expect(res1?.status()).toBe(404);
    await expect(guestPage.getByText('페이지를 볼 수 없어요')).toBeVisible();

    await guest.close();
  });

  test('TC-PUB-007 비공개 API 직접 호출도 404 + HOMEPAGE_PRIVATE_OR_NOT_FOUND', async ({ page, request }) => {
    await signupAndLogin(page, 'pub-api');
    const slug = await getCurrentSlug(page);

    // 인증 없는 request로 직접 호출
    const res = await request.get(`/api/public/${slug}`);
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.error_code).toBe('HOMEPAGE_PRIVATE_OR_NOT_FOUND');
  });

  test('TC-PUB-005 본인은 비공개에서도 관리자 화면에서 데이터 봄', async ({ page }) => {
    await signupAndLogin(page, 'pub-self');
    await page.goto('/admin/urls');
    await page.getByLabel('제목').fill('비공개 메모');
    await page.getByLabel('주소 (https://...)').fill('https://example.com/private');
    await page.getByRole('button', { name: '추가', exact: true }).click();
    await expect(page.getByText('비공개 메모')).toBeVisible();

    // 비공개 상태에서도 본인은 봄. v0.6: data-public 속성으로 확인
    await page.goto('/admin');
    await expect(page.locator('[data-public]').first()).toHaveAttribute('data-public', '0');
    await expect(page.getByText('비공개 메모')).toBeVisible();
  });
});
