import { test, expect } from '@playwright/test';
import { signupAndLogin, getCurrentSlug } from './helpers';

test.describe('미니홈피 + URL/메모 CRUD (TC-HP / TC-URL / TC-MEMO)', () => {
  test('TC-HP-001/003 가입 후 첫 진입 시 미니홈피 자동 생성, 기본 비공개', async ({ page }) => {
    await signupAndLogin(page, 'hp-create');
    // /admin 진입 = 미니홈피 자동 생성 완료. v0.6: data-public 속성으로 확인
    await expect(page.locator('[data-public]').first()).toHaveAttribute('data-public', '0');
    const slug = await getCurrentSlug(page);
    expect(slug).toMatch(/^mh-/);
  });

  test('TC-ALB-001 기본 카테고리(기본) 자동 생성', async ({ page }) => {
    await signupAndLogin(page, 'cat-default');
    await page.goto('/admin/albums');
    await expect(page.getByText('기본')).toBeVisible();
  });

  test('TC-URL-001~004 URL 추가/수정/삭제', async ({ page }) => {
    await signupAndLogin(page, 'url-crud');
    await page.goto('/admin/urls');

    // 추가
    await page.getByLabel('제목').fill('테스트 사이트');
    await page.getByLabel('주소 (https://...)').fill('https://example.com/test');
    await page.getByRole('button', { name: '추가', exact: true }).click();
    await expect(page.getByText('테스트 사이트')).toBeVisible();
    await expect(page.locator('a[href="https://example.com/test"]')).toBeVisible();

    // 수정
    await page.getByRole('button', { name: '수정' }).first().click();
    const titleInput = page.locator('input').filter({ hasText: '' }).nth(2); // 행의 첫 input
    // 좀 더 안정적인 방법: 인라인 폼 입력 모두 찾기
    const inputs = page.locator('ul li').first().locator('input');
    await inputs.first().fill('수정된 제목');
    await page.getByRole('button', { name: '저장' }).click();
    await expect(page.getByText('수정된 제목')).toBeVisible();

    // 삭제
    page.once('dialog', (d) => d.accept());
    await page.getByRole('button', { name: '삭제' }).first().click();
    await expect(page.getByText('수정된 제목')).toHaveCount(0);
  });

  test('TC-URL-005 잘못된 URL은 URL_INVALID_FORMAT 거절', async ({ page }) => {
    await signupAndLogin(page, 'url-bad');
    // 브라우저 폼 검증을 우회하기 위해 직접 API 호출
    const res = await page.request.post('/api/urls', {
      data: { title: '잘못', url: 'not-a-url' },
    });
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error_code).toBe('URL_INVALID_FORMAT');
  });

  test('TC-MEMO-001/005 메모 작성/삭제 (v0.6: + 새 메모 + 인라인 + ✕)', async ({ page }) => {
    await signupAndLogin(page, 'memo-crud');
    await page.goto('/admin/memos');

    await page.getByRole('button', { name: '+ 새 메모' }).click();
    // 첫 카드 title input에 입력
    const titleInput = page.getByLabel('제목').first();
    const contentArea = page.getByLabel('내용').first();
    await titleInput.fill('첫 메모');
    await contentArea.fill('내용입니다.');
    // 800ms 디바운스 후 PATCH 발생 → 응답 확인 후 reload
    await page.waitForResponse(
      (r) => r.url().includes('/api/memos/') && r.request().method() === 'PATCH' && r.ok(),
      { timeout: 5_000 }
    );
    await page.waitForTimeout(200);
    await page.reload();
    await expect(page.getByLabel('제목').first()).toHaveValue('첫 메모');

    page.once('dialog', (d) => d.accept());
    await page.getByRole('button', { name: '삭제' }).first().click();
    await expect(page.getByLabel('제목')).toHaveCount(0);
  });
});
