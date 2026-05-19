import { test, expect, type Page } from '@playwright/test';
import { signupAndLogin } from './helpers';

/**
 * 휴지통·복구 사용자 행동 검증 (TC-TRASH).
 * 항목 생성/삭제는 API로 준비하고, 휴지통 UI(복구·영구삭제)를 검증한다.
 * 영구 삭제 외 자동 삭제는 없다(PRD §5).
 */

async function createUrl(page: Page, title: string): Promise<string> {
  const r = await page.request.post('/api/urls', { data: { title, url: 'https://example.com' } });
  return (await r.json()).data.item.id as string;
}
async function createMemo(page: Page, title: string): Promise<string> {
  const r = await page.request.post('/api/memos', { data: { title, content: '메모 본문' } });
  return (await r.json()).data.item.id as string;
}
async function createCategory(page: Page, name: string): Promise<string> {
  const r = await page.request.post('/api/albums/categories', { data: { name } });
  return (await r.json()).data.item.id as string;
}

test.describe('휴지통·복구 (TC-TRASH)', () => {
  test('TC-TRASH-001 신규 계정 휴지통은 비어 있음 (행동 1)', async ({ page }) => {
    await signupAndLogin(page, 'trash-empty');
    await page.goto('/admin/trash');
    await expect(page.getByText('휴지통이 비어 있어요.')).toBeVisible();
  });

  test('TC-TRASH-002 URL 삭제 → 휴지통에 노출 (행동 2)', async ({ page }) => {
    await signupAndLogin(page, 'trash-url-show');
    const id = await createUrl(page, '삭제된 링크');
    await page.request.delete(`/api/urls/${id}`);

    await page.goto('/admin/trash');
    const row = page.locator(`[data-trash-id="${id}"]`);
    await expect(row).toBeVisible();
    await expect(row).toContainText('삭제된 링크');
  });

  test('TC-TRASH-003 휴지통에서 URL 복구 → 목록 복귀 (행동 3)', async ({ page }) => {
    await signupAndLogin(page, 'trash-url-restore');
    const id = await createUrl(page, '복구할 링크');
    await page.request.delete(`/api/urls/${id}`);

    await page.goto('/admin/trash');
    await page.locator(`[data-trash-id="${id}"]`).getByRole('button', { name: '복구' }).click();
    await expect(page.locator(`[data-trash-id="${id}"]`)).toHaveCount(0);

    // 활성 URL 목록에 복귀
    const list = await (await page.request.get('/api/urls')).json();
    expect(list.data.items.some((u: { id: string }) => u.id === id)).toBeTruthy();
  });

  test('TC-TRASH-004 휴지통에서 URL 영구삭제 → 완전 제거 (행동 4)', async ({ page }) => {
    await signupAndLogin(page, 'trash-url-purge');
    const id = await createUrl(page, '영구삭제할 링크');
    await page.request.delete(`/api/urls/${id}`);

    await page.goto('/admin/trash');
    page.once('dialog', (d) => d.accept());
    await page.locator(`[data-trash-id="${id}"]`).getByRole('button', { name: '영구삭제' }).click();
    await expect(page.locator(`[data-trash-id="${id}"]`)).toHaveCount(0);

    // 휴지통에서도 사라짐
    const trash = await (await page.request.get('/api/trash')).json();
    expect(trash.data.urls.some((u: { id: string }) => u.id === id)).toBeFalsy();
  });

  test('TC-TRASH-005 메모 삭제 → 휴지통 노출 → 복구 (행동 5)', async ({ page }) => {
    await signupAndLogin(page, 'trash-memo');
    const id = await createMemo(page, '삭제된 메모');
    await page.request.delete(`/api/memos/${id}`);

    await page.goto('/admin/trash');
    const row = page.locator(`[data-trash-id="${id}"]`);
    await expect(row).toContainText('삭제된 메모');

    await row.getByRole('button', { name: '복구' }).click();
    await expect(page.locator(`[data-trash-id="${id}"]`)).toHaveCount(0);

    const list = await (await page.request.get('/api/memos')).json();
    expect(list.data.items.some((m: { id: string }) => m.id === id)).toBeTruthy();
  });

  test('TC-TRASH-006 앨범 카테고리 삭제 → 휴지통 노출 (행동 6)', async ({ page }) => {
    await signupAndLogin(page, 'trash-category');
    const id = await createCategory(page, '여행사진');
    await page.request.delete(`/api/albums/categories/${id}`);

    await page.goto('/admin/trash');
    const row = page.locator(`[data-trash-id="${id}"]`);
    await expect(row).toBeVisible();
    await expect(row).toContainText('여행사진');
  });
});
