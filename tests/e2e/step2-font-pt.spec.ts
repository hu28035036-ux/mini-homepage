import { test, expect, type Page } from '@playwright/test';
import { signupAndLogin } from './helpers';

/**
 * v0.9 Step 2 — 글자 크기 pt 전환 사용자 행동 검증.
 * #2 pt 단위 / #3 직접 입력 + 프리셋.
 */

/** 편집 모드 진입 후 urls 카드 선택 */
async function selectUrlsCard(page: Page) {
  await page.goto('/admin?edit=1');
  await expect(page.getByText('편집 모드: 카드를 드래그·리사이즈하세요')).toBeVisible();
  await page.getByText('⋮⋮ urls', { exact: false }).click();
  await expect(page.locator('[aria-label="카드 글자 크기(pt)"]')).toBeVisible();
}

function urlsBodyFontSize(page: Page) {
  return page
    .locator('[data-block-kind="urls"] .block-fontsize')
    .evaluate((el) => (el as HTMLElement).style.fontSize);
}

test.describe('v0.9 Step 2 — 글자 크기 pt (TC-S2)', () => {
  test('TC-S2-001 카드 글자크기 pt 직접 입력 → 즉시 반영 (행동 1)', async ({ page }) => {
    await signupAndLogin(page, 's2-input');
    await selectUrlsCard(page);

    await page.locator('[aria-label="카드 글자 크기(pt)"]').fill('24');
    await page.waitForTimeout(300);
    expect(await urlsBodyFontSize(page)).toBe('24pt');
  });

  test('TC-S2-002 프리셋 20pt 버튼 → 카드 20pt (행동 2)', async ({ page }) => {
    await signupAndLogin(page, 's2-preset');
    await selectUrlsCard(page);

    await page.getByRole('button', { name: '글자 크기 20pt' }).click();
    await page.waitForTimeout(300);
    expect(await urlsBodyFontSize(page)).toBe('20pt');
    await expect(page.locator('[aria-label="카드 글자 크기(pt)"]')).toHaveValue('20');
  });

  test('TC-S2-003 "전역" 복귀 → 카드가 전역 기본값(12pt) 사용 (행동 3)', async ({ page }) => {
    await signupAndLogin(page, 's2-global');
    await selectUrlsCard(page);

    await page.locator('[aria-label="카드 글자 크기(pt)"]').fill('40');
    await page.waitForTimeout(300);
    expect(await urlsBodyFontSize(page)).toBe('40pt');

    await page.getByRole('button', { name: '전역', exact: true }).click();
    await page.waitForTimeout(300);
    // 카드 오버라이드 해제 → 전역 기본값 12pt
    expect(await urlsBodyFontSize(page)).toBe('12pt');
    await expect(page.locator('[aria-label="카드 글자 크기(pt)"]')).toHaveValue('');
  });

  test('TC-S2-004 꾸미기 탭 전역 글자크기 pt 변경 → 미리보기 반영 (행동 4)', async ({ page }) => {
    await signupAndLogin(page, 's2-decorate');
    await page.goto('/admin/decorate');

    await page.locator('#font-size').fill('28');
    await page.waitForTimeout(200);
    const sampleFont = await page
      .getByText('샘플 카드', { exact: true })
      .evaluate((el) => (el as HTMLElement).style.fontSize);
    expect(sampleFont).toBe('28pt');
  });

  test('TC-S2-005 카드 pt 저장 후 새로고침 시 유지 (행동 5)', async ({ page }) => {
    await signupAndLogin(page, 's2-persist');
    await selectUrlsCard(page);

    const put = page.waitForResponse(
      (r) => r.request().method() === 'PUT' && r.url().endsWith('/api/decorate'),
      { timeout: 20_000 },
    );
    await page.locator('[aria-label="카드 글자 크기(pt)"]').fill('30');
    expect((await put).ok()).toBeTruthy();

    // 평소 모드로 새로고침 → 카드 본문 30pt 유지
    await page.goto('/admin');
    expect(await urlsBodyFontSize(page)).toBe('30pt');
  });

  test('TC-S2-006 신규 홈피 전역 글자크기 기본 12pt (마이그 0008 default) (행동 6)', async ({ page }) => {
    await signupAndLogin(page, 's2-default');

    // 꾸미기 전역 글자크기 입력 초기값 = 12
    await page.goto('/admin/decorate');
    await expect(page.locator('#font-size')).toHaveValue('12');

    // 카드별 오버라이드 없는 카드는 전역 기본 12pt로 렌더
    await selectUrlsCard(page);
    expect(await urlsBodyFontSize(page)).toBe('12pt');
  });
});
