import { test, expect, type Page } from '@playwright/test';
import { signupAndLogin } from './helpers';
import fs from 'node:fs';
import path from 'node:path';

/**
 * 이미지 프록시 / private 스토리지 사용자 행동 검증 (TC-IMG).
 * 버킷은 private이며 이미지 접근은 /api/img 프록시가 통제한다.
 */

const PNG = path.join('tests', 'fixtures', 'test-image.png');
const BASE = 'http://localhost:3100';

/** 기본 카테고리에 사진 1장 업로드하고 저장된 경로(image_url)를 반환 */
async function uploadPhoto(page: Page): Promise<string> {
  const cats = await (await page.request.get('/api/albums/categories')).json();
  const catId = cats.data.items[0].id as string;
  const res = await page.request.post('/api/albums/photos', {
    multipart: {
      file: { name: 'p.png', mimeType: 'image/png', buffer: fs.readFileSync(PNG) },
      category_id: catId,
    },
  });
  return (await res.json()).data.item.image_url as string;
}

test.describe('이미지 프록시 / private 스토리지 (TC-IMG)', () => {
  test('TC-IMG-001 본인 사진은 프록시로 접근 가능, 저장값은 경로 (행동 1)', async ({ page }) => {
    await signupAndLogin(page, 'img-own');
    const storedPath = await uploadPhoto(page);

    // DB에 저장된 값은 full URL이 아니라 스토리지 경로
    expect(storedPath).not.toMatch(/^https?:\/\//);
    expect(storedPath).toMatch(/\/photos\//);

    const r = await page.request.get(`/api/img?path=${encodeURIComponent(storedPath)}`);
    expect(r.status()).toBe(200);
    expect(r.headers()['content-type']).toContain('image');
  });

  test('TC-IMG-002 비공개 미니홈피의 사진은 익명 접근 차단 (행동 2)', async ({ page, browser }) => {
    await signupAndLogin(page, 'img-private');
    const storedPath = await uploadPhoto(page);

    const anon = await browser.newContext({ baseURL: BASE });
    const r = await anon.request.get(`/api/img?path=${encodeURIComponent(storedPath)}`);
    expect(r.status()).toBe(404);
    await anon.close();
  });

  test('TC-IMG-003 공개 전환 후 익명 접근 허용 (행동 3)', async ({ page, browser }) => {
    await signupAndLogin(page, 'img-public');
    const storedPath = await uploadPhoto(page);
    const patch = await page.request.patch('/api/homepage', { data: { is_public: true } });
    expect(patch.ok()).toBeTruthy();

    const anon = await browser.newContext({ baseURL: BASE });
    const r = await anon.request.get(`/api/img?path=${encodeURIComponent(storedPath)}`);
    expect(r.status()).toBe(200);
    await anon.close();
  });

  test('TC-IMG-004 잘못된 경로 형식은 차단 (행동 4)', async ({ page }) => {
    await signupAndLogin(page, 'img-badpath');
    for (const bad of ['', 'foo', '../secret', 'abc/photos/../../x', 'x/secret/y.png']) {
      const r = await page.request.get(`/api/img?path=${encodeURIComponent(bad)}`);
      expect(r.status()).toBe(404);
    }
  });

  test('TC-IMG-005 앨범 사진 카드 이미지 src가 /api/img 프록시 (행동 5)', async ({ page }) => {
    await signupAndLogin(page, 'img-src');
    await uploadPhoto(page);

    await page.goto('/admin/albums');
    await page.getByText('기본', { exact: false }).first().click();
    const img = page.locator('.grid img').first();
    await expect(img).toBeVisible({ timeout: 15_000 });
    await expect(img).toHaveAttribute('src', /\/api\/img\?path=/);
  });
});
