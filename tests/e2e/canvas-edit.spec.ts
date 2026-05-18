import { test, expect, type Page, type Locator } from '@playwright/test';
import { signupAndLogin } from './helpers';

/**
 * 자유 캔버스 편집 모드 — 사용자 행동 검증 (버그1·버그2·편집범위 시각화).
 * 그림판(행동 15·16)은 drawpad.spec.ts.
 *
 * 핵심 회귀: 편집 동작은 모두 자동저장(PUT /api/decorate)을 거치므로,
 * 어떤 동작에서도 "필수 입력값이 누락되었습니다" alert가 떠선 안 된다.
 *
 * NOTE 카드 "이동"은 dnd-kit 마우스 드래그 대신 화살표 키 이동으로 검증한다.
 * Playwright의 합성 포인터 이벤트가 dnd-kit PointerSensor의 활성 거리 판정을
 * 통과하지 못해(클릭으로 인식됨), 동일한 자동저장 경로를 타는 키보드 이동
 * (앱이 지원하는 기능: 화살표 ±1, Shift+화살표 ±10)으로 대체한다.
 */

/** alert만 수집하고 confirm(카드 삭제 등)은 진행시킨다. */
function collectAlerts(page: Page): string[] {
  const alerts: string[] = [];
  page.on('dialog', (d) => {
    if (d.type() === 'alert') {
      alerts.push(d.message());
      d.dismiss().catch(() => {});
    } else {
      d.accept().catch(() => {});
    }
  });
  return alerts;
}

async function gotoAdminCanvas(page: Page) {
  await page.goto('/admin');
  await expect(page.getByRole('button', { name: '메뉴 열기' })).toBeVisible();
}

async function enterEditMode(page: Page) {
  // v0.9: 편집 진입은 메뉴의 "편집"(/admin?edit=1)을 통해서만
  await page.goto('/admin?edit=1');
  await expect(page.getByText('편집 모드: 카드를 드래그·리사이즈하세요')).toBeVisible();
}

function waitDecoratePut(page: Page) {
  return page.waitForResponse(
    (r) => r.request().method() === 'PUT' && r.url().endsWith('/api/decorate'),
    { timeout: 20_000 },
  );
}

function handle(page: Page, kind: string): Locator {
  return page.locator('[aria-label="드래그 핸들"]', { hasText: kind });
}

/** 카드 핸들 div의 부모 = 카드 루트 div */
function cardRoot(page: Page, kind: string): Locator {
  return handle(page, kind).locator('xpath=..');
}

/** 카드를 클릭해 선택(편집 모드에서 카드 클릭 → onSelect) */
async function selectCard(page: Page, kind: string) {
  await page.getByText(`⋮⋮ ${kind}`, { exact: false }).click();
  await expect(page.locator('label:has-text("글자크기") select')).toBeVisible();
}

/** 선택된 카드를 화살표 키로 이동 (Shift = ±10px). 키 입력 사이 텀으로 상태 반영 보장. */
async function pressArrow(page: Page, key: string, times: number) {
  for (let i = 0; i < times; i++) {
    await page.keyboard.press(key);
    await page.waitForTimeout(15);
  }
}

/** 리사이즈 핸들을 마우스로 끌어 크기 변경 (네이티브 pointer 이벤트). */
async function dragResize(page: Page, kind: string, dx: number, dy: number) {
  const rh = cardRoot(page, kind).locator('[aria-label="리사이즈 핸들"]');
  const box = await rh.boundingBox();
  if (!box) throw new Error('리사이즈 핸들 boundingBox 없음');
  const sx = box.x + box.width / 2;
  const sy = box.y + box.height / 2;
  await page.mouse.move(sx, sy);
  await page.mouse.down();
  await page.mouse.move(sx + 6, sy + 6);
  const steps = 12;
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(sx + (dx * i) / steps, sy + (dy * i) / steps);
    await page.waitForTimeout(10);
  }
  await page.mouse.move(sx + dx, sy + dy);
  await page.mouse.up();
}

test.describe('자유 캔버스 편집 (TC-CANVAS)', () => {
  test('TC-CANVAS-001 클릭 편집 동작 6종(공개토글·z-index·숨김복원·카드추가·삭제·저장) 자동저장 알림 없음', async ({ page }) => {
    const alerts = collectAlerts(page);
    await signupAndLogin(page, 'cv-click');
    await gotoAdminCanvas(page);
    await enterEditMode(page);

    // #3 공개/비공개 토글
    let put = waitDecoratePut(page);
    await page.getByRole('button', { name: '공개', exact: true }).first().click();
    expect((await put).ok()).toBeTruthy();
    await expect(page.getByRole('button', { name: '비공개', exact: true }).first()).toBeVisible();
    await page.waitForTimeout(400);

    // #4 z-index ▲ / ▼
    put = waitDecoratePut(page);
    await page.getByRole('button', { name: '앞으로 보내기' }).first().click();
    expect((await put).ok()).toBeTruthy();
    await page.waitForTimeout(400);
    put = waitDecoratePut(page);
    await page.getByRole('button', { name: '뒤로 보내기' }).first().click();
    expect((await put).ok()).toBeTruthy();
    await page.waitForTimeout(400);

    // #5 숨김 → 숨김 카드 목록에서 복원
    put = waitDecoratePut(page);
    await handle(page, 'memos').getByRole('button', { name: '숨김', exact: true }).click();
    expect((await put).ok()).toBeTruthy();
    await expect(handle(page, 'memos')).toHaveCount(0);
    await page.waitForTimeout(400);
    put = waitDecoratePut(page);
    await page.getByRole('button', { name: '+ memos' }).click();
    expect((await put).ok()).toBeTruthy();
    await expect(handle(page, 'memos')).toBeVisible();
    await page.waitForTimeout(400);

    // #6 + 텍스트 카드 추가
    put = waitDecoratePut(page);
    await page.getByRole('button', { name: '새 텍스트 카드 추가' }).click();
    expect((await put).ok()).toBeTruthy();
    await expect(handle(page, 'custom')).toBeVisible();
    await page.waitForTimeout(400);

    // #7 custom 카드 삭제 (confirm 자동 수락)
    put = waitDecoratePut(page);
    await handle(page, 'custom').getByRole('button', { name: '카드 삭제' }).click();
    expect((await put).ok()).toBeTruthy();
    await expect(handle(page, 'custom')).toHaveCount(0);
    await page.waitForTimeout(400);

    // #8 레이아웃 저장 버튼
    await page.getByRole('button', { name: '공개', exact: true }).first().click();
    put = waitDecoratePut(page);
    await page.getByRole('button', { name: '레이아웃 저장' }).click();
    expect((await put).ok()).toBeTruthy();

    expect(alerts).toEqual([]);
  });

  test('TC-CANVAS-002 카드 이동(화살표 키) 자동저장 알림 없음', async ({ page }) => {
    const alerts = collectAlerts(page);
    await signupAndLogin(page, 'cv-move');
    await gotoAdminCanvas(page);
    await enterEditMode(page);

    // #1 카드 선택 후 화살표 키로 이동 → 자동저장
    await selectCard(page, 'profile');
    const put = waitDecoratePut(page);
    await pressArrow(page, 'Shift+ArrowRight', 12);
    await pressArrow(page, 'Shift+ArrowDown', 8);
    expect((await put).ok()).toBeTruthy();

    expect(alerts).toEqual([]);
  });

  test('TC-CANVAS-003 카드 리사이즈 자동저장 알림 없음', async ({ page }) => {
    const alerts = collectAlerts(page);
    await signupAndLogin(page, 'cv-resize');
    await gotoAdminCanvas(page);
    await enterEditMode(page);

    // #2 리사이즈 핸들로 축소
    let put = waitDecoratePut(page);
    await dragResize(page, 'profile', -60, -30);
    expect((await put).ok()).toBeTruthy();
    await page.waitForTimeout(400);

    // 다시 확대
    put = waitDecoratePut(page);
    await dragResize(page, 'profile', 100, 70);
    expect((await put).ok()).toBeTruthy();

    expect(alerts).toEqual([]);
  });

  test('TC-CANVAS-004 카드를 빈 위치/겹치게 배치 + z-index 앞으로', async ({ page }) => {
    const alerts = collectAlerts(page);
    await signupAndLogin(page, 'cv-overlap');
    await gotoAdminCanvas(page);
    await enterEditMode(page);

    // #9 카드를 빈 위치로 이동 → 위치 변경 확인
    const before = await cardRoot(page, 'profile').boundingBox();
    await selectCard(page, 'profile');
    let put = waitDecoratePut(page);
    await pressArrow(page, 'Shift+ArrowRight', 18);
    expect((await put).ok()).toBeTruthy();
    await page.waitForTimeout(500);
    const after = await cardRoot(page, 'profile').boundingBox();
    expect(Math.abs(after!.x - before!.x)).toBeGreaterThan(100);

    // #10 urls 카드를 albums 카드 쪽으로 이동시켜 겹치기 — 두 카드 모두 유지되는지
    await selectCard(page, 'urls');
    put = waitDecoratePut(page);
    await pressArrow(page, 'Shift+ArrowRight', 40); // x 360 → 760, albums(780)와 겹침
    expect((await put).ok()).toBeTruthy();
    await page.waitForTimeout(500);
    await expect(handle(page, 'urls')).toBeVisible();
    await expect(handle(page, 'albums')).toBeVisible();

    // #11 z-index ▲(앞으로) → z-index 증가 (가려지지 않은 memos 카드로 검증)
    const z1 = await cardRoot(page, 'memos').evaluate((el) => Number(getComputedStyle(el).zIndex) || 0);
    put = waitDecoratePut(page);
    await handle(page, 'memos').getByRole('button', { name: '앞으로 보내기' }).click();
    expect((await put).ok()).toBeTruthy();
    await page.waitForTimeout(500);
    const z2 = await cardRoot(page, 'memos').evaluate((el) => Number(getComputedStyle(el).zIndex) || 0);
    expect(z2).toBeGreaterThan(z1);

    expect(alerts).toEqual([]);
  });

  test('TC-CANVAS-005 카드가 편집 범위를 벗어나면 경고 표시, 안으로 넣으면 해제', async ({ page }) => {
    const alerts = collectAlerts(page);
    await signupAndLogin(page, 'cv-bounds');
    await gotoAdminCanvas(page);
    await enterEditMode(page);

    const urlsRoot = cardRoot(page, 'urls');

    // #12 urls 카드(x=360,w=400)를 오른쪽으로 이동 → x+w>1680(v0.9 캔버스 폭) → 경고 ring + ⚠
    await selectCard(page, 'urls');
    let put = waitDecoratePut(page);
    await pressArrow(page, 'Shift+ArrowRight', 100); // x 360 → 1360, x+w=1760 > 1680
    expect((await put).ok()).toBeTruthy();
    await page.waitForTimeout(500);
    await expect(urlsRoot).toHaveClass(/ring-rose-500/);
    await expect(handle(page, 'urls').getByText('⚠')).toBeVisible();

    // #13 다시 캔버스 안으로 → 경고 해제
    put = waitDecoratePut(page);
    await pressArrow(page, 'Shift+ArrowLeft', 100);
    expect((await put).ok()).toBeTruthy();
    await page.waitForTimeout(500);
    await expect(urlsRoot).not.toHaveClass(/ring-rose-500/);

    expect(alerts).toEqual([]);
  });

  test('TC-CANVAS-006 카드 글자크기 XL 시 편집 핸들 버튼 크기 유지(본문 cascade 분리)', async ({ page }) => {
    const alerts = collectAlerts(page);
    await signupAndLogin(page, 'cv-font');
    await gotoAdminCanvas(page);
    await enterEditMode(page);

    // #14 urls 카드 선택 → 글자크기 XL
    await selectCard(page, 'urls');
    await page.locator('label:has-text("글자크기") select').selectOption('xl');
    await page.waitForTimeout(500);

    // 카드 본문 글자는 XL로 커지지만, 편집 핸들 버튼은 cascade에서 제외되어 text-[10px] 유지
    const pubBtn = handle(page, 'urls').getByRole('button', { name: '공개', exact: true });
    const btnFont = await pubBtn.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(btnFont).toBeLessThanOrEqual(12);

    // 핸들 바 높이는 32px(h-8) 고정
    const handleHeight = await handle(page, 'urls').evaluate((el) => el.getBoundingClientRect().height);
    expect(Math.round(handleHeight)).toBe(32);

    expect(alerts).toEqual([]);
  });
});
