import { test, expect, type Page } from '@playwright/test';
import { signupAndLogin } from './helpers';

/**
 * v0.9 Step 4 — 메모·URL 카테고리 관리 UI 사용자 행동 검증.
 * #8 메모 / #10 URL — CategoryBar(추가·이름수정·삭제) + 항목별 카테고리 지정.
 */

/** select의 현재 선택된 옵션 텍스트 */
function selectedText(page: Page, selector: string, nth = 0) {
  return page
    .locator(selector)
    .nth(nth)
    .evaluate((el) => {
      const s = el as HTMLSelectElement;
      return s.options[s.selectedIndex]?.text ?? '';
    });
}

test.describe('v0.9 Step 4 — 메모·URL 카테고리 UI (TC-S4)', () => {
  test('TC-S4-001 메모장에서 새 카테고리 추가 (행동 1)', async ({ page }) => {
    await signupAndLogin(page, 's4-memo-add');
    await page.goto('/admin/memos');

    await page.getByLabel('메모 카테고리 새 카테고리 이름').fill('여행');
    await page.getByRole('button', { name: '+ 추가' }).click();

    await expect(page.locator('[data-category-chip="여행"]')).toBeVisible();
  });

  test('TC-S4-002 메모 항목에 카테고리 드롭다운으로 지정 (행동 2)', async ({ page }) => {
    await signupAndLogin(page, 's4-memo-assign');
    await page.request.post('/api/memos', { data: { title: '분류할 메모', content: '내용' } });
    await page.goto('/admin/memos');

    await page.getByLabel('메모 카테고리 새 카테고리 이름').fill('업무');
    await page.getByRole('button', { name: '+ 추가' }).click();
    await expect(page.locator('[data-category-chip="업무"]')).toBeVisible();

    await page.locator('select[aria-label="메모 카테고리"]').first().selectOption({ label: '업무' });

    // 새로고침 후에도 지정 유지
    await page.goto('/admin/memos');
    expect(await selectedText(page, 'select[aria-label="메모 카테고리"]')).toBe('업무');
  });

  test('TC-S4-003 카테고리 이름 수정 UI 반영 (행동 3)', async ({ page }) => {
    await signupAndLogin(page, 's4-rename');
    await page.goto('/admin/memos');

    await page.getByLabel('메모 카테고리 새 카테고리 이름').fill('구이름');
    await page.getByRole('button', { name: '+ 추가' }).click();
    await expect(page.locator('[data-category-chip="구이름"]')).toBeVisible();

    page.once('dialog', (d) => d.accept('새이름'));
    await page.locator('[data-category-chip="구이름"]').getByRole('button', { name: '구이름', exact: true }).click();

    await expect(page.locator('[data-category-chip="새이름"]')).toBeVisible();
    await expect(page.locator('[data-category-chip="구이름"]')).toHaveCount(0);
  });

  test('TC-S4-004 카테고리 삭제 후 사라짐 (행동 4)', async ({ page }) => {
    await signupAndLogin(page, 's4-delete');
    await page.goto('/admin/memos');

    await page.getByLabel('메모 카테고리 새 카테고리 이름').fill('임시');
    await page.getByRole('button', { name: '+ 추가' }).click();
    await expect(page.locator('[data-category-chip="임시"]')).toBeVisible();

    page.once('dialog', (d) => d.accept());
    await page.getByRole('button', { name: '카테고리 임시 삭제' }).click();

    await expect(page.locator('[data-category-chip="임시"]')).toHaveCount(0);
  });

  test('TC-S4-005 URL 보관함 카테고리 추가·지정·삭제 (행동 5)', async ({ page }) => {
    await signupAndLogin(page, 's4-url');
    await page.goto('/admin/urls');

    // 추가
    await page.getByLabel('URL 카테고리 새 카테고리 이름').fill('자료실');
    await page.getByRole('button', { name: '+ 추가' }).click();
    await expect(page.locator('[data-category-chip="자료실"]')).toBeVisible();

    // 그 카테고리로 URL 추가
    await page.getByLabel('제목').fill('참고 링크');
    await page.getByLabel('주소 (https://...)').fill('https://example.com');
    await page.getByLabel('카테고리', { exact: true }).selectOption({ label: '자료실' });
    await page.getByRole('button', { name: '추가', exact: true }).click();
    await expect(page.getByText('참고 링크')).toBeVisible();
    expect(await selectedText(page, 'select[aria-label="URL 카테고리"]')).toBe('자료실');

    // 카테고리 삭제 → 칩 사라지고 URL은 미분류로
    page.once('dialog', (d) => d.accept());
    await page.getByRole('button', { name: '카테고리 자료실 삭제' }).click();
    await expect(page.locator('[data-category-chip="자료실"]')).toHaveCount(0);
    expect(await selectedText(page, 'select[aria-label="URL 카테고리"]')).toBe('미분류');
  });

  test('TC-S4-006 카테고리 미지정 항목은 "미분류" 표시 (행동 6)', async ({ page }) => {
    await signupAndLogin(page, 's4-uncat');
    await page.request.post('/api/memos', { data: { title: '미분류 메모', content: '내용' } });
    await page.request.post('/api/urls', { data: { title: '미분류 링크', url: 'https://example.com' } });

    await page.goto('/admin/memos');
    expect(await selectedText(page, 'select[aria-label="메모 카테고리"]')).toBe('미분류');

    await page.goto('/admin/urls');
    expect(await selectedText(page, 'select[aria-label="URL 카테고리"]')).toBe('미분류');
  });
});
