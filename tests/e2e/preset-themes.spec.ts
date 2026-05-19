import { test, expect } from '@playwright/test';
import { signupAndLogin } from './helpers';

/**
 * 테마 프리셋 — 꾸미기 값 묶음 원클릭 적용 사용자 행동 검증 (TC-PRESET).
 * 프리셋은 순수 프론트 상수이며 적용 후 PUT /api/decorate로 저장한다.
 */
test.describe('테마 프리셋 (TC-PRESET)', () => {
  test('TC-PRESET-001 프리셋 6종이 꾸미기 탭에 노출 (행동 1)', async ({ page }) => {
    await signupAndLogin(page, 'preset-list');
    await page.goto('/admin/decorate');

    await expect(page.locator('[data-preset]')).toHaveCount(6);
    await expect(page.locator('[data-preset="midnight"]')).toBeVisible();
  });

  test('TC-PRESET-002 프리셋 적용 → 카드·폰트 값 일괄 변경 + 안내 메시지 (행동 2)', async ({ page }) => {
    await signupAndLogin(page, 'preset-apply');
    await page.goto('/admin/decorate');

    await page.locator('[data-preset="midnight"]').click();

    await expect(page.locator('#card-select')).toHaveValue('glass');
    await expect(page.locator('#font-select')).toHaveValue('pretendard');
    await expect(page.getByText('프리셋 적용', { exact: false })).toBeVisible();
  });

  test('TC-PRESET-003 프리셋 적용 시 배경 이미지 토글이 해제됨 (행동 3)', async ({ page }) => {
    await signupAndLogin(page, 'preset-bgtoggle');
    await page.goto('/admin/decorate');

    const useBg = page.locator('input[type="checkbox"]').first();
    await useBg.check();
    await expect(useBg).toBeChecked();

    await page.locator('[data-preset="cozy-cream"]').click();
    await expect(useBg).not.toBeChecked();
  });

  test('TC-PRESET-004 프리셋 적용 후 세부 조정 가능 (행동 4)', async ({ page }) => {
    await signupAndLogin(page, 'preset-tweak');
    await page.goto('/admin/decorate');

    await page.locator('[data-preset="midnight"]').click();
    await expect(page.locator('#card-select')).toHaveValue('glass');

    // 프리셋 적용 후 사용자가 카드 스타일만 다시 바꿈
    await page.locator('#card-select').selectOption('rounded');
    await expect(page.locator('#card-select')).toHaveValue('rounded');
    // 폰트는 프리셋 값 그대로 유지
    await expect(page.locator('#font-select')).toHaveValue('pretendard');
  });

  test('TC-PRESET-005 프리셋 적용 → 저장 → 새로고침 후 유지 (행동 5)', async ({ page }) => {
    await signupAndLogin(page, 'preset-persist');
    await page.goto('/admin/decorate');

    await page.locator('[data-preset="mint-note"]').click();
    await page.getByRole('button', { name: '저장' }).click();
    await expect(page.getByText('저장되었습니다.')).toBeVisible();

    await page.goto('/admin/decorate');
    await expect(page.locator('#card-select')).toHaveValue('notebook');
    await expect(page.locator('#font-select')).toHaveValue('nanumPen');
  });

  test('TC-PRESET-006 다른 프리셋으로 덮어쓰기 (행동 6)', async ({ page }) => {
    await signupAndLogin(page, 'preset-override');
    await page.goto('/admin/decorate');

    await page.locator('[data-preset="midnight"]').click();
    await expect(page.locator('#card-select')).toHaveValue('glass');

    await page.locator('[data-preset="pastel-pink"]').click();
    await expect(page.locator('#card-select')).toHaveValue('pink');
    await expect(page.locator('#font-select')).toHaveValue('hiMelody');
  });
});
