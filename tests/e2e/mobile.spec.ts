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

  test('TC-MOBILE-DEC-001 모바일 꾸미기 페이지는 안내만 노출 (폼 미노출)', async ({ page }) => {
    await signupAndLogin(page, 'mobile-decorate');
    await page.goto('/admin/decorate');

    // 모바일은 안내 화면. 폼 컨트롤 미노출.
    await expect(page.locator('#card-select')).toHaveCount(0);
    await expect(page.locator('#pattern-select')).toHaveCount(0);
    await expect(page.getByText('PC/태블릿')).toBeVisible();
    await expect(page.getByRole('button', { name: '홈으로 돌아가기' })).toBeVisible();
  });

  test('TC-MOBILE-003 햄버거 메뉴 노출 + 모바일에서 꾸미기 항목 hide', async ({ page }) => {
    await signupAndLogin(page, 'mobile-hamburger');
    await page.goto('/admin');

    await page.getByRole('button', { name: '메뉴 열기' }).click();
    // 모바일에서는 꾸미기 메뉴가 hide
    await expect(page.getByRole('menuitem', { name: '꾸미기' })).toHaveCount(0);
    // 설정은 노출
    await page.getByRole('menuitem', { name: '설정' }).click();
    await page.waitForURL(/\/admin\/settings/);
  });

  test('TC-MOBILE-004 설정 페이지 모바일 진입 정상', async ({ page }) => {
    await signupAndLogin(page, 'mobile-settings');
    await page.goto('/admin/settings');
    // 헤더 노출 + 핵심 폼 요소 노출
    await expect(page.getByRole('heading', { name: '설정' })).toBeVisible();
    await expect(page.getByLabel('미니홈피 제목')).toBeVisible();
    await expect(page.getByLabel('미니홈피 주소 (slug)')).toBeVisible();
    await expect(page.getByLabel('현재 비밀번호')).toBeVisible();
  });
});
