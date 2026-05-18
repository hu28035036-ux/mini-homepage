import { test, expect } from '@playwright/test';
import { signupAndLogin } from './helpers';

type Cat = { id: string; name: string };

/**
 * v0.9 Step 3 — 메모·URL 카테고리 백엔드 사용자 행동 검증 (API 레벨).
 * #8 메모 카테고리 / #10 URL 카테고리. 마이그 0009.
 */
test.describe('v0.9 Step 3 — 메모·URL 카테고리 API (TC-S3)', () => {
  test('TC-S3-001 메모 카테고리 생성·목록 (행동 1)', async ({ page }) => {
    await signupAndLogin(page, 's3-memo-create');

    const res = await page.request.post('/api/memos/categories', { data: { name: '일기' } });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.item.name).toBe('일기');
    expect(body.data.item.id).toBeTruthy();

    const list = await (await page.request.get('/api/memos/categories')).json();
    expect((list.data.items as Cat[]).some((i) => i.name === '일기')).toBe(true);
  });

  test('TC-S3-002 메모 카테고리 중복 이름 거부 (행동 2)', async ({ page }) => {
    await signupAndLogin(page, 's3-memo-dup');

    await page.request.post('/api/memos/categories', { data: { name: '회고' } });
    const dup = await page.request.post('/api/memos/categories', { data: { name: '회고' } });
    expect(dup.status()).toBe(409);
    expect((await dup.json()).error_code).toBe('MEMO_CATEGORY_DUPLICATE');
  });

  test('TC-S3-003 메모 카테고리 이름 수정 (행동 3)', async ({ page }) => {
    await signupAndLogin(page, 's3-memo-rename');

    const created = await (await page.request.post('/api/memos/categories', { data: { name: '구이름' } })).json();
    const id = created.data.item.id as string;

    const patch = await page.request.patch(`/api/memos/categories/${id}`, { data: { name: '새이름' } });
    expect(patch.status()).toBe(200);

    const list = await (await page.request.get('/api/memos/categories')).json();
    expect((list.data.items as Cat[]).find((i) => i.id === id)?.name).toBe('새이름');
  });

  test('TC-S3-004 메모 카테고리 삭제 (행동 4)', async ({ page }) => {
    await signupAndLogin(page, 's3-memo-del');

    const created = await (await page.request.post('/api/memos/categories', { data: { name: '삭제대상' } })).json();
    const id = created.data.item.id as string;

    const del = await page.request.delete(`/api/memos/categories/${id}`);
    expect(del.status()).toBe(200);

    const list = await (await page.request.get('/api/memos/categories')).json();
    expect((list.data.items as Cat[]).some((i) => i.id === id)).toBe(false);
  });

  test('TC-S3-005 URL 카테고리 생성·수정·삭제 (행동 5)', async ({ page }) => {
    await signupAndLogin(page, 's3-url-crud');

    // 생성
    const created = await (await page.request.post('/api/urls/categories', { data: { name: '참고' } })).json();
    expect(created.success).toBe(true);
    const id = created.data.item.id as string;

    // 중복 거부
    const dup = await page.request.post('/api/urls/categories', { data: { name: '참고' } });
    expect(dup.status()).toBe(409);
    expect((await dup.json()).error_code).toBe('URL_CATEGORY_DUPLICATE');

    // 수정
    const patch = await page.request.patch(`/api/urls/categories/${id}`, { data: { name: '자료' } });
    expect(patch.status()).toBe(200);
    let list = await (await page.request.get('/api/urls/categories')).json();
    expect((list.data.items as Cat[]).find((i) => i.id === id)?.name).toBe('자료');

    // 삭제
    expect((await page.request.delete(`/api/urls/categories/${id}`)).status()).toBe(200);
    list = await (await page.request.get('/api/urls/categories')).json();
    expect((list.data.items as Cat[]).some((i) => i.id === id)).toBe(false);
  });

  test('TC-S3-006 메모·URL 항목에 category_id 지정 저장 round-trip (행동 6)', async ({ page }) => {
    await signupAndLogin(page, 's3-assign');

    // 메모 카테고리 생성 → 메모를 그 카테고리로 생성
    const mc = await (await page.request.post('/api/memos/categories', { data: { name: '분류M' } })).json();
    const memoCatId = mc.data.item.id as string;
    const memo = await (await page.request.post('/api/memos', {
      data: { title: '분류된 메모', content: '내용', category_id: memoCatId },
    })).json();
    expect(memo.success).toBe(true);
    expect(memo.data.item.category_id).toBe(memoCatId);

    const memos = await (await page.request.get('/api/memos')).json();
    expect(memos.data.items.find((m: { id: string }) => m.id === memo.data.item.id).category_id).toBe(memoCatId);

    // URL 카테고리 생성 → URL을 그 카테고리로 생성
    const uc = await (await page.request.post('/api/urls/categories', { data: { name: '분류U' } })).json();
    const urlCatId = uc.data.item.id as string;
    const url = await (await page.request.post('/api/urls', {
      data: { title: '분류된 링크', url: 'https://example.com', category_id: urlCatId },
    })).json();
    expect(url.success).toBe(true);
    expect(url.data.item.category_id).toBe(urlCatId);

    // category_id를 null로 수정 → 미분류로
    const cleared = await (await page.request.patch(`/api/urls/${url.data.item.id}`, {
      data: { category_id: null },
    })).json();
    expect(cleared.success).toBe(true);
    expect(cleared.data.item.category_id).toBeNull();
  });
});
