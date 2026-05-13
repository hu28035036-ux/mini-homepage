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

  test('TC-MOBILE-DEC-001 모바일 꾸미기 페이지는 미리보기 패널 미노출 + 패턴 select 노출', async ({ page }) => {
    await signupAndLogin(page, 'mobile-decorate');
    await page.goto('/admin/decorate');

    await expect(page.getByText('미리보기 (저장 전)')).toHaveCount(0);
    await expect(page.locator('#card-select')).toBeVisible();
    await expect(page.locator('#font-select')).toBeVisible();
    await expect(page.locator('#opacity')).toBeVisible();
    await expect(page.locator('#font-size')).toBeVisible();
    await expect(page.locator('#pattern-select')).toBeVisible();
  });

  test('TC-MOBILE-003 햄버거 메뉴 노출 + 메뉴 항목 클릭 시 페이지 이동', async ({ page }) => {
    await signupAndLogin(page, 'mobile-hamburger');
    await page.goto('/admin');

    await page.getByRole('button', { name: '메뉴 열기' }).click();
    await page.getByRole('menuitem', { name: '꾸미기' }).click();
    await page.waitForURL(/\/admin\/decorate/);
    await expect(page.locator('#card-select')).toBeVisible();
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
