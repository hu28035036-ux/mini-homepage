import { test, expect, type Page, type Locator } from '@playwright/test';
import { signupAndLogin } from './helpers';

/**
 * 그림판(DrawPad) — 사용자 행동 15·16.
 * 버그3 회귀: 지우개는 흰 종이를 복원해야 한다(흰색 source-over).
 * destination-out으로 투명하게 뚫으면 저장 PNG의 투명 영역으로 카드 배경이 비친다.
 */

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

/** 편집 모드 진입 → 그림판 카드 추가 → 편집 종료 → 그림판 카드 클릭으로 DrawPad 오픈 */
async function openDrawPad(page: Page) {
  await page.goto('/admin');
  await page.getByRole('button', { name: '편집', exact: true }).click();
  await expect(page.getByText('편집 모드: 카드를 드래그·리사이즈하세요')).toBeVisible();

  const put = page.waitForResponse(
    (r) => r.request().method() === 'PUT' && r.url().endsWith('/api/decorate'),
    { timeout: 20_000 },
  );
  await page.getByRole('button', { name: '새 그림판 카드 추가' }).click();
  await put;

  await page.getByRole('button', { name: '편집 끝' }).click();
  await page.getByText('클릭해서 그리기').click();
  await expect(page.getByRole('button', { name: '그림 저장' })).toBeVisible();
}

/** 캔버스 내부 좌표(800x600 기준)를 화면 좌표로 변환해 선을 긋는다. */
async function drawLine(page: Page, canvas: Locator, x1: number, y1: number, x2: number, y2: number) {
  const box = await canvas.boundingBox();
  if (!box) throw new Error('canvas boundingBox 없음');
  const toClient = (cx: number, cy: number) => ({
    x: box.x + (cx / 800) * box.width,
    y: box.y + (cy / 600) * box.height,
  });
  const a = toClient(x1, y1);
  const b = toClient(x2, y2);
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  await page.mouse.move(b.x, b.y, { steps: 20 });
  await page.mouse.up();
}

/** 캔버스 내부 좌표의 픽셀 [r,g,b,a] */
async function canvasPixel(canvas: Locator, cx: number, cy: number): Promise<number[]> {
  return canvas.evaluate((el, [x, y]) => {
    const ctx = (el as HTMLCanvasElement).getContext('2d')!;
    const d = ctx.getImageData(x, y, 1, 1).data;
    return [d[0], d[1], d[2], d[3]];
  }, [cx, cy]);
}

test.describe('그림판 DrawPad (TC-DRAWPAD)', () => {
  test('TC-DRAWPAD-001 펜으로 그림 그리고 저장 → 카드에 이미지 반영', async ({ page }) => {
    const alerts = collectAlerts(page);
    await signupAndLogin(page, 'dp-draw');
    await openDrawPad(page);

    const canvas = page.locator('canvas');
    await drawLine(page, canvas, 180, 300, 620, 300);

    // 펜 자국 확인 (어두운 불투명 픽셀)
    const drawn = await canvasPixel(canvas, 300, 300);
    expect(drawn[3]).toBe(255);
    expect(drawn[0]).toBeLessThan(120);

    const drawPost = page.waitForResponse(
      (r) => r.request().method() === 'POST' && r.url().includes('/api/decorate/drawing'),
      { timeout: 20_000 },
    );
    await page.getByRole('button', { name: '그림 저장' }).click();
    expect((await drawPost).ok()).toBeTruthy();

    // 모달 닫히고 그림판 카드에 이미지 표시
    await expect(page.locator('img[alt="그림"]')).toBeVisible();
    expect(alerts).toEqual([]);
  });

  test('TC-DRAWPAD-002 지우개로 지운 영역이 흰색(투명/카드배경 비침 없음)', async ({ page }) => {
    const alerts = collectAlerts(page);
    await signupAndLogin(page, 'dp-erase');
    await openDrawPad(page);

    const canvas = page.locator('canvas');

    // 검은 선
    await drawLine(page, canvas, 150, 300, 650, 300);
    const drawn = await canvasPixel(canvas, 250, 300);
    expect(drawn[3]).toBe(255);
    expect(drawn[0]).toBeLessThan(120);

    // 지우개로 선 일부 지우기
    await page.getByRole('button', { name: '지우개' }).click();
    await drawLine(page, canvas, 350, 300, 450, 300);

    // 지운 픽셀은 흰색 + 완전 불투명 — destination-out이었다면 alpha 0(투명)
    const erased = await canvasPixel(canvas, 400, 300);
    expect(erased).toEqual([255, 255, 255, 255]);

    // 저장도 정상
    const drawPost = page.waitForResponse(
      (r) => r.request().method() === 'POST' && r.url().includes('/api/decorate/drawing'),
      { timeout: 20_000 },
    );
    await page.getByRole('button', { name: '그림 저장' }).click();
    expect((await drawPost).ok()).toBeTruthy();

    expect(alerts).toEqual([]);
  });
});
