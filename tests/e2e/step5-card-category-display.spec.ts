import { test, expect, type Page } from '@playwright/test';
import { signupAndLogin, getCurrentSlug } from './helpers';
import fs from 'node:fs';
import path from 'node:path';

/**
 * v0.9 Step 5 — 카드별 표시 카테고리 사용자 행동 검증.
 * #5 앨범 카드 표시 카테고리 / #6 미지정 시 최근 업로드 / 메모·URL 카드 카테고리 필터.
 */

const FIXTURE = path.join('tests', 'fixtures', 'test-image.png');

async function createAlbumCategory(page: Page, name: string): Promise<string> {
  const r = await (await page.request.post('/api/albums/categories', { data: { name } })).json();
  return r.data.item.id as string;
}
async function uploadPhoto(page: Page, categoryId: string) {
  await page.request.post('/api/albums/photos', {
    multipart: {
      category_id: categoryId,
      file: { name: 'p.png', mimeType: 'image/png', buffer: fs.readFileSync(FIXTURE) },
    },
  });
}
async function createMemoCategory(page: Page, name: string): Promise<string> {
  const r = await (await page.request.post('/api/memos/categories', { data: { name } })).json();
  return r.data.item.id as string;
}
async function createUrlCategory(page: Page, name: string): Promise<string> {
  const r = await (await page.request.post('/api/urls/categories', { data: { name } })).json();
  return r.data.item.id as string;
}

async function selectCard(page: Page, kind: string) {
  await page.getByText(`⋮⋮ ${kind}`, { exact: false }).click();
  await expect(page.locator('[aria-label="카드 글자 크기(pt)"]')).toBeVisible();
}

test.describe('v0.9 Step 5 — 카드별 카테고리 표시 (TC-S5)', () => {
  test('TC-S5-001 앨범 카드에 표시 카테고리 선택 → 그 카테고리 사진만 (행동 1)', async ({ page }) => {
    await signupAndLogin(page, 's5-album-pick');
    const catA = await createAlbumCategory(page, '여행');
    const catB = await createAlbumCategory(page, '음식');
    await uploadPhoto(page, catA);
    await uploadPhoto(page, catA);
    await uploadPhoto(page, catB);

    await page.goto('/admin?edit=1');
    await expect(page.getByText('편집 모드: 카드를 드래그·리사이즈하세요')).toBeVisible();
    await selectCard(page, 'albums');

    await page.locator('[aria-label="앨범 카드 표시 카테고리"]').selectOption({ label: '여행' });
    await page.waitForTimeout(500);
    await expect(page.locator('[data-block-kind="albums"] img')).toHaveCount(2);

    await page.locator('[aria-label="앨범 카드 표시 카테고리"]').selectOption({ label: '음식' });
    await page.waitForTimeout(500);
    await expect(page.locator('[data-block-kind="albums"] img')).toHaveCount(1);
  });

  test('TC-S5-002 앨범 카드 미선택 시 최근 업로드 카테고리 표시 (행동 2)', async ({ page }) => {
    await signupAndLogin(page, 's5-album-recent');
    const catA = await createAlbumCategory(page, '예전');
    const catB = await createAlbumCategory(page, '최근');
    await uploadPhoto(page, catA);
    await uploadPhoto(page, catA);
    await uploadPhoto(page, catB); // 마지막 업로드 → 최근 카테고리 = '최근'(catB, 1장)

    await page.goto('/admin');
    // 표시 카테고리 미지정 → 최근 업로드 카테고리(catB, 1장)만 노출
    await expect(page.locator('[data-block-kind="albums"] img')).toHaveCount(1);
  });

  test('TC-S5-003 메모 카드 표시 카테고리 선택 → 그 카테고리 메모만 (행동 3)', async ({ page }) => {
    await signupAndLogin(page, 's5-memo');
    const cat = await createMemoCategory(page, '업무');
    await page.request.post('/api/memos', { data: { title: '업무메모AAA', content: 'x', category_id: cat } });
    await page.request.post('/api/memos', { data: { title: '개인메모BBB', content: 'y' } });

    await page.goto('/admin?edit=1');
    await selectCard(page, 'memos');
    await page.locator('[aria-label="메모 카드 표시 카테고리"]').selectOption({ label: '업무' });
    await page.waitForTimeout(500);

    await expect(page.locator('[data-block-kind="memos"]').getByText('업무메모AAA')).toBeVisible();
    await expect(page.locator('[data-block-kind="memos"]').getByText('개인메모BBB')).toHaveCount(0);
  });

  test('TC-S5-004 URL 카드 표시 카테고리 선택 → 그 카테고리 URL만 (행동 4)', async ({ page }) => {
    await signupAndLogin(page, 's5-url');
    const cat = await createUrlCategory(page, '자료');
    await page.request.post('/api/urls', { data: { title: '자료링크AAA', url: 'https://a.example.com', category_id: cat } });
    await page.request.post('/api/urls', { data: { title: '잡담링크BBB', url: 'https://b.example.com' } });

    await page.goto('/admin?edit=1');
    await selectCard(page, 'urls');
    await page.locator('[aria-label="URL 카드 표시 카테고리"]').selectOption({ label: '자료' });
    await page.waitForTimeout(500);

    await expect(page.locator('[data-block-kind="urls"]').getByText('자료링크AAA')).toBeVisible();
    await expect(page.locator('[data-block-kind="urls"]').getByText('잡담링크BBB')).toHaveCount(0);
  });

  test('TC-S5-005 공개 페이지에서 카드별 카테고리 필터 동일 적용 (행동 5)', async ({ page, browser }) => {
    await signupAndLogin(page, 's5-public');
    const slug = await getCurrentSlug(page);
    const cat = await createMemoCategory(page, '공개분류');
    await page.request.post('/api/memos', { data: { title: '공개메모AAA', content: 'x', category_id: cat } });
    await page.request.post('/api/memos', { data: { title: '숨김메모BBB', content: 'y' } });

    await page.goto('/admin?edit=1');
    await selectCard(page, 'memos');
    await page.locator('[aria-label="메모 카드 표시 카테고리"]').selectOption({ label: '공개분류' });
    await page.getByRole('button', { name: '레이아웃 저장' }).click();
    await expect(page.getByRole('button', { name: '레이아웃 저장' })).toBeHidden();

    // 공개 전환
    await page.goto('/admin/settings');
    await page.locator('input[name="pub"]').nth(1).check();
    page.once('dialog', (d) => d.accept());
    await page.getByRole('button', { name: '저장' }).click();
    await expect(page.getByText('저장되었습니다.')).toBeVisible();

    // 게스트로 공개 페이지 — 메모 카드는 '공개분류' 메모만
    const guest = await browser.newContext();
    const gp = await guest.newPage();
    await gp.goto(`/u/${slug}`, { waitUntil: 'domcontentloaded' });
    await expect(gp.locator('[data-block-kind="memos"]').getByText('공개메모AAA')).toBeVisible();
    await expect(gp.locator('[data-block-kind="memos"]').getByText('숨김메모BBB')).toHaveCount(0);
    await guest.close();
  });

  test('TC-S5-006 표시 카테고리를 "전체"로 두면 모든 항목 표시 (행동 6)', async ({ page }) => {
    await signupAndLogin(page, 's5-all');
    const cat = await createMemoCategory(page, '분류C');
    await page.request.post('/api/memos', { data: { title: '메모하나AAA', content: 'x', category_id: cat } });
    await page.request.post('/api/memos', { data: { title: '메모둘BBB', content: 'y' } });

    await page.goto('/admin?edit=1');
    await selectCard(page, 'memos');

    // 특정 카테고리 선택 → 1건만
    await page.locator('[aria-label="메모 카드 표시 카테고리"]').selectOption({ label: '분류C' });
    await page.waitForTimeout(400);
    await expect(page.locator('[data-block-kind="memos"]').getByText('메모둘BBB')).toHaveCount(0);

    // "전체"로 되돌리면 둘 다 표시
    await page.locator('[aria-label="메모 카드 표시 카테고리"]').selectOption({ label: '전체' });
    await page.waitForTimeout(400);
    await expect(page.locator('[data-block-kind="memos"]').getByText('메모하나AAA')).toBeVisible();
    await expect(page.locator('[data-block-kind="memos"]').getByText('메모둘BBB')).toBeVisible();
  });
});
