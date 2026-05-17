import { test, expect } from '@playwright/test';
import { signupAndLogin, getCurrentSlug } from './helpers';

type Cat = { id: string; name: string };

test.describe('카드 카테고리 API (TC-CARDCAT) — Phase 3', () => {
  test('TC-CARDCAT-001 카테고리 생성·목록 (행동 1)', async ({ page }) => {
    await signupAndLogin(page, 'cardcat-crud');

    const res = await page.request.post('/api/cards/categories', { data: { name: '일상' } });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.item.name).toBe('일상');
    expect(body.data.item.id).toBeTruthy();

    const list = await (await page.request.get('/api/cards/categories')).json();
    expect((list.data.items as Cat[]).some((i) => i.name === '일상')).toBe(true);
  });

  test('TC-CARDCAT-002 중복 이름 거부 (행동 3)', async ({ page }) => {
    await signupAndLogin(page, 'cardcat-dup');

    await page.request.post('/api/cards/categories', { data: { name: '취미' } });
    const dup = await page.request.post('/api/cards/categories', { data: { name: '취미' } });
    expect(dup.status()).toBe(409);
    expect((await dup.json()).error_code).toBe('CARD_CATEGORY_DUPLICATE');
  });

  test('TC-CARDCAT-003 카테고리 삭제 (행동 2)', async ({ page }) => {
    await signupAndLogin(page, 'cardcat-del');

    const created = await (await page.request.post('/api/cards/categories', { data: { name: '삭제대상' } })).json();
    const id = created.data.item.id as string;

    const del = await page.request.delete(`/api/cards/categories/${id}`);
    expect(del.status()).toBe(200);

    const list = await (await page.request.get('/api/cards/categories')).json();
    expect((list.data.items as Cat[]).some((i) => i.id === id)).toBe(false);
  });

  test('TC-CARDCAT-004 블록 categoryId 저장 round-trip (행동 7)', async ({ page }) => {
    await signupAndLogin(page, 'cardcat-block');

    const created = await (await page.request.post('/api/cards/categories', { data: { name: '분류A' } })).json();
    const catId = created.data.item.id as string;

    const put = await page.request.put('/api/decorate', {
      data: {
        layouts: {
          desktop: [
            {
              id: 'b1', kind: 'urls', x: 0, y: 0, w: 200, h: 120, z: 0,
              visible: true, visibility: 'public', categoryId: catId,
            },
          ],
          mobile: [],
        },
      },
    });
    expect(put.status()).toBe(200);

    const hp = await (await page.request.get('/api/homepage')).json();
    expect(hp.data.homepage.layouts.desktop[0].categoryId).toBe(catId);
  });

  test('TC-CARDCAT-010 모달에서 카테고리 추가·삭제 (행동 1·2 UI)', async ({ page }) => {
    await signupAndLogin(page, 'cardcat-ui-mgr');
    await page.goto('/admin');
    await page.getByRole('button', { name: '편집', exact: true }).click();
    await page.getByRole('button', { name: '카테고리 관리' }).click();

    await page.getByLabel('새 카테고리 이름').fill('여행');
    await page.getByRole('button', { name: '카테고리 추가' }).click();
    await expect(page.locator('[data-category-row="여행"]')).toBeVisible();

    await page.getByRole('button', { name: '카테고리 여행 삭제' }).click();
    await expect(page.locator('[data-category-row="여행"]')).toHaveCount(0);
  });

  test('TC-CARDCAT-011 카드에 카테고리 지정 → 헤더 라벨 표시 (행동 4·5)', async ({ page }) => {
    await signupAndLogin(page, 'cardcat-ui-assign');
    await page.goto('/admin');
    await page.getByRole('button', { name: '편집', exact: true }).click();

    await page.getByRole('button', { name: '카테고리 관리' }).click();
    await page.getByLabel('새 카테고리 이름').fill('일상');
    await page.getByRole('button', { name: '카테고리 추가' }).click();
    await expect(page.locator('[data-category-row="일상"]')).toBeVisible();
    await page.getByRole('button', { name: '닫기' }).click();

    await page.locator('[data-block-kind="urls"]').click();
    await page.getByLabel('카드 카테고리').selectOption({ label: '일상' });
    await expect(page.locator('[data-block-kind="urls"]').getByText('일상')).toBeVisible();
  });

  test('TC-CARDCAT-012 편집 필터 — 비일치 카드 흐려짐 (행동 6)', async ({ page }) => {
    await signupAndLogin(page, 'cardcat-ui-filter');
    await page.goto('/admin');
    await page.getByRole('button', { name: '편집', exact: true }).click();

    await page.getByRole('button', { name: '카테고리 관리' }).click();
    await page.getByLabel('새 카테고리 이름').fill('특별');
    await page.getByRole('button', { name: '카테고리 추가' }).click();
    await expect(page.locator('[data-category-row="특별"]')).toBeVisible();
    await page.getByRole('button', { name: '닫기' }).click();

    await page.locator('[data-block-kind="urls"]').click();
    await page.getByLabel('카드 카테고리').selectOption({ label: '특별' });

    await page.getByLabel('카테고리 필터').selectOption({ label: '특별' });
    // 비일치(albums)는 흐려지고, 일치(urls)는 정상
    await expect(page.locator('[data-block-kind="albums"]')).toHaveCSS('opacity', '0.2');
    await expect(page.locator('[data-block-kind="urls"]')).toHaveCSS('opacity', '1');
  });

  test('TC-CARDCAT-013 카테고리 라벨이 공개 페이지에 노출 (행동 8)', async ({ page, browser }) => {
    await signupAndLogin(page, 'cardcat-ui-public');
    const slug = await getCurrentSlug(page);
    await page.goto('/admin');
    await page.getByRole('button', { name: '편집', exact: true }).click();

    await page.getByRole('button', { name: '카테고리 관리' }).click();
    await page.getByLabel('새 카테고리 이름').fill('공개분류');
    await page.getByRole('button', { name: '카테고리 추가' }).click();
    await expect(page.locator('[data-category-row="공개분류"]')).toBeVisible();
    await page.getByRole('button', { name: '닫기' }).click();

    await page.locator('[data-block-kind="urls"]').click();
    await page.getByLabel('카드 카테고리').selectOption({ label: '공개분류' });
    await page.getByRole('button', { name: '레이아웃 저장' }).click();
    await expect(page.getByRole('button', { name: '레이아웃 저장' })).toBeHidden();

    await page.goto('/admin/settings');
    await page.locator('input[name="pub"]').nth(1).check();
    page.once('dialog', (d) => d.accept());
    await page.getByRole('button', { name: '저장' }).click();
    await expect(page.getByText('저장되었습니다.')).toBeVisible();

    const guest = await browser.newContext();
    const guestPage = await guest.newPage();
    await guestPage.goto(`/u/${slug}`, { waitUntil: 'domcontentloaded' });
    await expect(guestPage.locator('[data-block-kind="urls"]').getByText('공개분류')).toBeVisible();
    await guest.close();
  });

  test('TC-CARDCAT-014 카테고리 삭제 시 카드 라벨 사라짐 (행동 9)', async ({ page }) => {
    await signupAndLogin(page, 'cardcat-ui-del');
    await page.goto('/admin');
    await page.getByRole('button', { name: '편집', exact: true }).click();

    await page.getByRole('button', { name: '카테고리 관리' }).click();
    await page.getByLabel('새 카테고리 이름').fill('임시분류');
    await page.getByRole('button', { name: '카테고리 추가' }).click();
    await expect(page.locator('[data-category-row="임시분류"]')).toBeVisible();
    await page.getByRole('button', { name: '닫기' }).click();

    await page.locator('[data-block-kind="urls"]').click();
    await page.getByLabel('카드 카테고리').selectOption({ label: '임시분류' });
    await expect(page.locator('[data-block-kind="urls"]').getByText('임시분류')).toBeVisible();

    // 카테고리 삭제 → 카드 라벨 사라짐 (dangling categoryId 허용)
    await page.getByRole('button', { name: '카테고리 관리' }).click();
    await page.getByRole('button', { name: '카테고리 임시분류 삭제' }).click();
    await expect(page.locator('[data-category-row="임시분류"]')).toHaveCount(0);
    await page.getByRole('button', { name: '닫기' }).click();

    await expect(page.locator('[data-block-kind="urls"]').getByText('임시분류')).toHaveCount(0);
  });
});
