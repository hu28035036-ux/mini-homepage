import { test, expect } from '@playwright/test';
import { signupAndLogin } from './helpers';

/**
 * v0.9 Step 1 — UI/배치 개편 사용자 행동 검증.
 * #1 캔버스 폭 1680 / #4 편집 진입 메뉴화 / #7 메모 카드 제목만 / #9 평소모드 안내 메뉴 이동.
 */
test.describe('v0.9 Step 1 — UI/배치 개편 (TC-S1)', () => {
  test('TC-S1-001 메뉴 "편집"으로 편집 모드 진입 (행동 1)', async ({ page }) => {
    await signupAndLogin(page, 's1-enter');
    await page.goto('/admin');

    // 홈 화면에는 "편집" 버튼이 없다
    await expect(page.getByRole('button', { name: '편집', exact: true })).toHaveCount(0);

    await page.getByRole('button', { name: '메뉴 열기' }).click();
    await page.getByRole('menuitem', { name: '편집', exact: true }).click();

    await expect(page.getByText('편집 모드: 카드를 드래그·리사이즈하세요')).toBeVisible();
  });

  test('TC-S1-002 "편집 끝"으로 평소 모드 복귀 (행동 2)', async ({ page }) => {
    await signupAndLogin(page, 's1-exit');
    await page.goto('/admin?edit=1');
    await expect(page.getByText('편집 모드: 카드를 드래그·리사이즈하세요')).toBeVisible();

    await page.getByRole('button', { name: '편집 끝' }).click();

    await expect(page.getByText('편집 모드: 카드를 드래그·리사이즈하세요')).toHaveCount(0);
    await expect(page).toHaveURL(/\/admin$/);
  });

  test('TC-S1-003 홈 화면에 평소모드 안내 텍스트 없음 (행동 3)', async ({ page }) => {
    await signupAndLogin(page, 's1-notext');
    await page.goto('/admin');

    await expect(page.getByText('태블릿/PC 레이아웃')).toHaveCount(0);
    await expect(page.getByText('평소 모드', { exact: false })).toHaveCount(0);
  });

  test('TC-S1-004 메뉴에 현재 레이아웃 표시 항목 (행동 4)', async ({ page }) => {
    await signupAndLogin(page, 's1-layout');
    await page.goto('/admin');

    await page.getByRole('button', { name: '메뉴 열기' }).click();
    await expect(page.getByText('현재 레이아웃: 태블릿/PC')).toBeVisible();
  });

  test('TC-S1-005 메모 카드는 제목만 표시, 본문 미리보기 없음 (행동 5)', async ({ page }) => {
    await signupAndLogin(page, 's1-memo');
    const created = await page.request.post('/api/memos', {
      data: { title: '메모제목HELLO', content: '메모본문SECRET내용' },
    });
    expect(created.status()).toBe(201);

    await page.goto('/admin');
    await expect(page.locator('[data-block-kind="memos"]').getByText('메모제목HELLO')).toBeVisible();
    await expect(page.getByText('메모본문SECRET내용')).toHaveCount(0);
  });

  test('TC-S1-006 편집 캔버스 폭이 1680px로 확대 (행동 6)', async ({ page }) => {
    await signupAndLogin(page, 's1-canvas');
    await page.goto('/admin?edit=1');
    await expect(page.getByText('편집 모드: 카드를 드래그·리사이즈하세요')).toBeVisible();

    // 카드 루트의 부모 = 자유 캔버스 div. 인라인 style width = 1680px.
    const canvas = page.locator('[data-block-kind="urls"]').locator('xpath=..');
    const width = await canvas.evaluate((el) => (el as HTMLElement).style.width);
    expect(width).toBe('1680px');
  });
});
