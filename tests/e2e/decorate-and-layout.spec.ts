import { test, expect } from '@playwright/test';
import { signupAndLogin } from './helpers';

test.describe('꾸미기 + 레이아웃 (TC-DEC / TC-LAYOUT)', () => {
  test('TC-DEC-008 미리보기 즉시 반영 (저장 전)', async ({ page }) => {
    await signupAndLogin(page, 'dec-preview');
    await page.goto('/admin/decorate');

    // 배경색 변경
    const bgInput = page.locator('input#bg + input');
    await bgInput.fill('#ff0000');
    // 미리보기 우측 패널에 #ff0000 배경 적용 확인 (style 속성)
    const preview = page.locator('text=미리보기 (저장 전)').locator('..').locator('div').nth(1);
    await expect(preview.locator('[style*="rgb(255, 0, 0)"]').first()).toBeVisible();
  });

  test.skip('TC-LAYOUT-001 single → double 전환 시 슬롯 6개로 동기화 (v2 자유 캔버스로 대체 예정)', async ({ page }) => {
    await signupAndLogin(page, 'layout-mode');
    await page.goto('/admin/decorate');

    // 초기: single 4슬롯
    await expect(page.getByText(/^슬롯 \d+$/)).toHaveCount(4);

    // double 전환 — sr-only input은 force로
    await page.locator('input[name="mode"][value="double"]').check({ force: true });
    await expect(page.getByText(/^슬롯 \d+$/)).toHaveCount(6);
  });

  test.skip('TC-LAYOUT-003 클라이언트 중복 경고 (v2 자유 캔버스로 대체 예정)', async ({ page }) => {
    await signupAndLogin(page, 'layout-dup');
    await page.goto('/admin/decorate');

    // 슬롯 2(기본 urls)에 슬롯 3과 동일한 albums 강제 선택
    const selects = page.locator('select');
    // 슬롯 순서: 1=profile, 2=urls, 3=albums, 4=memos
    await selects.nth(1).selectOption('albums'); // 슬롯 2을 albums로 → 슬롯 3과 중복
    await expect(page.getByText(/같은 위젯.*albums.*두 슬롯에 배치할 수 없습니다/)).toBeVisible();
    await expect(page.getByRole('button', { name: '저장' })).toBeDisabled();
  });

  test('TC-LAYOUT-003 서버도 LAYOUT_WIDGET_DUPLICATED로 거절', async ({ page }) => {
    await signupAndLogin(page, 'layout-server');
    const res = await page.request.put('/api/decorate', {
      data: {
        layout_mode: 'single',
        layout_slots: [
          { slot: 1, widget: 'urls', visible: true },
          { slot: 2, widget: 'urls', visible: true }, // 중복
          { slot: 3, widget: 'albums', visible: true },
          { slot: 4, widget: 'memos', visible: true },
        ],
      },
    });
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error_code).toBe('LAYOUT_WIDGET_DUPLICATED');
  });

  test('TC-LAYOUT-005 슬롯 번호 범위 밖 → LAYOUT_INVALID_SLOT', async ({ page }) => {
    await signupAndLogin(page, 'layout-slot');
    const res = await page.request.put('/api/decorate', {
      data: {
        layout_mode: 'single',
        layout_slots: [
          { slot: 1, widget: 'profile', visible: true },
          { slot: 2, widget: 'urls', visible: true },
          { slot: 3, widget: 'albums', visible: true },
          { slot: 99, widget: 'memos', visible: true }, // 범위 밖
        ],
      },
    });
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error_code).toBe('LAYOUT_INVALID_SLOT');
  });

  test.skip('TC-DEC-001/004 카드/폰트/레이아웃 라디오 저장 (v2 자유 캔버스로 대체 예정)', async ({ page }) => {
    await signupAndLogin(page, 'dec-save');
    await page.goto('/admin/decorate');

    // 카드 스타일 변경 — sr-only input
    await page.locator('input[name="card"][value="shadow"]').check({ force: true });
    // 폰트
    await page.locator('input[name="font"][value="emotional"]').check({ force: true });
    // double 모드
    await page.locator('input[name="mode"][value="double"]').check({ force: true });

    await page.getByRole('button', { name: '저장' }).click();
    await expect(page.getByText('저장되었습니다.')).toBeVisible();

    // 새로고침해도 유지
    await page.reload();
    await expect(page.locator('input[name="card"][value="shadow"]')).toBeChecked();
    await expect(page.locator('input[name="font"][value="emotional"]')).toBeChecked();
    await expect(page.locator('input[name="mode"][value="double"]')).toBeChecked();
  });
});
