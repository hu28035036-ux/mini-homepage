import { test, expect } from '@playwright/test';
import { signupAndLogin } from './helpers';

test.describe('폰트 + 카드 스타일 동적 적용 (v2 신규)', () => {
  test('TC-FONT-001 폰트 드롭다운으로 nanumPen 선택 → 저장 → admin wrapper에 font-nanumPen 적용', async ({ page }) => {
    await signupAndLogin(page, 'font-apply');
    await page.goto('/admin/decorate');

    // 폰트 드롭다운에서 nanumPen 선택
    await page.locator('#font-select').selectOption('nanumPen');

    // 미리보기에 바로 적용 (드롭다운 자체에 font-nanumPen 클래스 추가됨)
    await expect(page.locator('#font-select')).toHaveClass(/font-nanumPen/);

    // 저장
    await page.getByRole('button', { name: '저장' }).click();
    await expect(page.getByText('저장되었습니다.')).toBeVisible();

    // server component가 router.refresh로 재렌더 후 admin wrapper에 font-nanumPen 적용
    // 안정성: 새로고침 후 확인
    await page.goto('/admin');
    // admin/layout.tsx의 outer div가 font-nanumPen 가져야
    const wrapper = page.locator('html > body > div.min-h-screen').first();
    await expect(wrapper).toHaveClass(/font-nanumPen/);
  });

  test('TC-CARD-001 카드 드롭다운으로 glass 선택 → 저장 → 홈 카드에 backdrop-blur-xl 적용', async ({ page }) => {
    await signupAndLogin(page, 'card-apply');
    await page.goto('/admin/decorate');

    await page.locator('#card-select').selectOption('glass');
    await page.getByRole('button', { name: '저장' }).click();
    await expect(page.getByText('저장되었습니다.')).toBeVisible();

    await page.goto('/admin');
    // FreeCanvas 안의 각 블록 div에 cardClass(glass) = bg-white/40 backdrop-blur-xl rounded-3xl ...
    // 한 블록이라도 backdrop-blur-xl 클래스를 가진지 확인
    const glassBlock = page.locator('[class*="backdrop-blur-xl"]').first();
    await expect(glassBlock).toBeVisible();
  });

  test('TC-FONT-002 12종 폰트 모두 드롭다운에 노출', async ({ page }) => {
    await signupAndLogin(page, 'font-list');
    await page.goto('/admin/decorate');

    const expected = [
      'default', 'pretendard', 'notoSans', 'notoSerif', 'ibmPlex',
      'nanumGothic', 'gowunDodum', 'rounded', 'nanumPen', 'emotional', 'hiMelody', 'blackHan',
    ];
    const options = await page.locator('#font-select option').evaluateAll((els) =>
      els.map((el) => (el as HTMLOptionElement).value)
    );
    for (const v of expected) {
      expect(options).toContain(v);
    }
  });

  test('TC-CARD-002 10종 카드 스타일 모두 드롭다운에 노출', async ({ page }) => {
    await signupAndLogin(page, 'card-list');
    await page.goto('/admin/decorate');

    const expected = [
      'basic', 'rounded', 'shadow', 'transparent',
      'soft', 'bordered', 'glass', 'minimal', 'elevated', 'frame',
    ];
    const options = await page.locator('#card-select option').evaluateAll((els) =>
      els.map((el) => (el as HTMLOptionElement).value)
    );
    for (const v of expected) {
      expect(options).toContain(v);
    }
  });
});
