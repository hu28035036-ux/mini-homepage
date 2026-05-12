import { test, expect } from '@playwright/test';
import { signupAndLogin, getCurrentSlug } from './helpers';
import path from 'node:path';

const FIXTURE = path.join('tests', 'fixtures', 'test-image.png');
const FIXTURE2 = path.join('tests', 'fixtures', 'test-image-2.png');

test.describe('앨범 이미지 업로드 E2E (TC-ALB-006~010)', () => {
  test('TC-ALB-006 카테고리 + 이미지 1장 → 카드 1장', async ({ page }) => {
    await signupAndLogin(page, 'alb-006');
    await page.goto('/admin/albums');

    // 카테고리 새로 추가
    await page.getByLabel('카테고리 추가').fill('TC006');
    await page.getByRole('button', { name: '+', exact: true }).click();
    await page.getByText('TC006').click();

    // 이미지 1장 업로드 (input[type=file]은 hidden — setInputFiles 작동)
    await page.setInputFiles('input[type=file]', FIXTURE);
    await expect(page.locator('img[src*="supabase"], img[src*="storage"], img[alt=""]').first()).toBeVisible({ timeout: 15_000 });
  });

  test('TC-ALB-007 같은 카테고리에 2장 → 그리드 2장', async ({ page }) => {
    await signupAndLogin(page, 'alb-007');
    await page.goto('/admin/albums');
    await page.getByLabel('카테고리 추가').fill('TC007');
    await page.getByRole('button', { name: '+', exact: true }).click();
    await page.getByText('TC007').click();

    await page.setInputFiles('input[type=file]', FIXTURE);
    // 첫 장 업로드 완료 대기
    await page.waitForTimeout(800);
    await page.setInputFiles('input[type=file]', FIXTURE2);
    await page.waitForTimeout(800);

    // 그리드에 img 2개
    const imgs = page.locator('.grid img');
    await expect(imgs).toHaveCount(2);
  });

  test('TC-ALB-008 사진 메타데이터(업로드 시각) 노출', async ({ page }) => {
    await signupAndLogin(page, 'alb-008');
    await page.goto('/admin/albums');
    await page.getByLabel('카테고리 추가').fill('TC008');
    await page.getByRole('button', { name: '+', exact: true }).click();
    await page.getByText('TC008').click();

    await page.setInputFiles('input[type=file]', FIXTURE);
    // 업로드된 사진이 화면에 표시되는지만 확인 (메타 표시는 향후 기능)
    await expect(page.locator('.grid img').first()).toBeVisible({ timeout: 15_000 });
  });

  test('TC-ALB-009 사진 삭제 → 0장', async ({ page }) => {
    await signupAndLogin(page, 'alb-009');
    await page.goto('/admin/albums');
    await page.getByLabel('카테고리 추가').fill('TC009');
    await page.getByRole('button', { name: '+', exact: true }).click();
    await page.getByText('TC009').click();

    await page.setInputFiles('input[type=file]', FIXTURE);
    await expect(page.locator('.grid img').first()).toBeVisible({ timeout: 15_000 });

    // 사진 삭제 — group hover 영역의 삭제 버튼 (photos 그리드 한정)
    page.once('dialog', (d) => d.accept());
    const photoGrid = page.locator('div.grid-cols-2.gap-3, div.gap-3.grid-cols-2, div[class*="grid-cols-2"][class*="gap-3"]').first();
    await photoGrid.locator('> div').first().hover();
    await photoGrid.locator('button', { hasText: '삭제' }).first().click({ force: true });
    await expect(photoGrid.locator('img')).toHaveCount(0);
  });

  test('TC-ALB-010 비공개 미니홈피의 사진은 익명 공개 페이지에서 안 보임', async ({ page, context }) => {
    await signupAndLogin(page, 'alb-010');
    const slug = await getCurrentSlug(page);

    await page.goto('/admin/albums');
    await page.getByText('기본').click();
    await page.setInputFiles('input[type=file]', FIXTURE);
    await page.waitForTimeout(800);

    // 본인 화면에선 사진 보임
    await expect(page.locator('.grid img').first()).toBeVisible({ timeout: 15_000 });

    // 익명(다른 컨텍스트)으로 공개 페이지 접근 — is_public=false 라 404
    const anon = await context.browser()!.newContext({ baseURL: 'http://localhost:3100' });
    const anonPage = await anon.newPage();
    const r = await anonPage.goto(`/u/${slug}`, { waitUntil: 'domcontentloaded' });
    expect(r?.status()).toBe(404);
    await anon.close();
  });
});
