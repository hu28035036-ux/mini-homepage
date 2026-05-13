import { test, expect } from '@playwright/test';
import { signupAndLogin } from './helpers';

test.use({ viewport: { width: 393, height: 851 } }); // Pixel 5 viewport

test.describe('모바일 기록 전용 UI (TC-MOBILE)', () => {
  test('TC-MOBILE-001 모바일 진입 시 리스트형 폴더 노출 + 자유 캔버스 미노출', async ({ page }) => {
    await signupAndLogin(page, 'mobile-home');
    await page.goto('/admin');

    // MobileHome 폴더 행 노출
    await expect(page.getByRole('button', { name: /URL 보관함/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /앨범/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /메모/ })).toBeVisible();

    // 자유 캔버스의 편집 버튼 미노출
    await expect(page.getByRole('button', { name: /^편집$/ })).toHaveCount(0);
  });

  test('TC-MOBILE-002 폴더 클릭 시 expand 모달 오픈', async ({ page }) => {
    await signupAndLogin(page, 'mobile-modal');
    await page.goto('/admin');

    await page.getByRole('button', { name: /메모/ }).click();
    await expect(page.getByRole('button', { name: '+ 새 메모' })).toBeVisible();
  });

  test('TC-MOBILE-DEC-001 모바일 꾸미기 페이지는 미리보기 패널 미노출', async ({ page }) => {
    await signupAndLogin(page, 'mobile-decorate');
    await page.goto('/admin/decorate');

    await expect(page.getByText('미리보기 (저장 전)')).toHaveCount(0);
    await expect(page.locator('#card-select')).toBeVisible();
    await expect(page.locator('#font-select')).toBeVisible();
    await expect(page.locator('#opacity')).toBeVisible();
    await expect(page.locator('#font-size')).toBeVisible();
  });
});
