import { test, expect } from '@playwright/test';
import { signupAndLogin } from './helpers';

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
});
