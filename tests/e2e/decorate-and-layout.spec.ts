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

test.describe('카드 이름 수정 (TC-CARDNAME) — Phase 1 Step 1.1', () => {
  test('TC-CARDNAME-001 편집 모드에서 기본 카드(URL) 헤더 input 노출 + 이름 변경 (행동 1·2)', async ({ page }) => {
    await signupAndLogin(page, 'cardname-basic');
    await page.goto('/admin');

    await page.getByRole('button', { name: '편집', exact: true }).click();

    const urlsHeader = page.locator('[data-block-kind="urls"] input[aria-label="카드 이름"]');
    await expect(urlsHeader).toBeVisible();
    await expect(urlsHeader).toHaveAttribute('placeholder', 'URL 보관함');

    await urlsHeader.fill('내 링크 모음');
    await expect(urlsHeader).toHaveValue('내 링크 모음');
  });

  test('TC-CARDNAME-002 커스텀 카드 추가 후 이름 변경 (행동 3)', async ({ page }) => {
    await signupAndLogin(page, 'cardname-custom');
    await page.goto('/admin');

    await page.getByRole('button', { name: '편집', exact: true }).click();
    await page.getByRole('button', { name: '새 텍스트 카드 추가' }).click();

    const customHeader = page.locator('[data-block-kind="custom"] input[aria-label="카드 이름"]');
    await expect(customHeader).toBeVisible();
    await expect(customHeader).toHaveValue('새 카드');

    await customHeader.fill('나의 일기장');
    await expect(customHeader).toHaveValue('나의 일기장');
  });

  test('TC-CARDNAME-003 이름을 비우면 기본명으로 표시 (행동 4)', async ({ page }) => {
    await signupAndLogin(page, 'cardname-fallback');
    await page.goto('/admin');

    await page.getByRole('button', { name: '편집', exact: true }).click();
    const urlsHeader = page.locator('[data-block-kind="urls"] input[aria-label="카드 이름"]');
    await urlsHeader.fill('임시 이름');
    await urlsHeader.fill('');

    await page.getByRole('button', { name: '편집 끝' }).click();

    // view 모드: 빈 customTitle → 기본명 'URL 보관함' 헤딩 표시
    await expect(
      page.locator('[data-block-kind="urls"]').getByRole('heading', { name: 'URL 보관함' }),
    ).toBeVisible();
  });
});
