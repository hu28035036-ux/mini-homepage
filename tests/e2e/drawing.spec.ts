import { test, expect, type Page } from '@playwright/test';
import { signupAndLogin } from './helpers';
import fs from 'node:fs';
import path from 'node:path';

const PNG = path.join('tests', 'fixtures', 'test-image.png');

test.describe('그림판 카드 업로드 (TC-DRAW)', () => {
  test('TC-DRAW-001 그림판 PNG 업로드 API 성공 + PATCH /api/decorate에 drawingUrl 반영', async ({ page }) => {
    await signupAndLogin(page, 'draw');

    // POST /api/decorate/drawing multipart
    const png = fs.readFileSync(PNG);
    const res = await page.request.post('/api/decorate/drawing', {
      multipart: {
        file: {
          name: 'drawing.png',
          mimeType: 'image/png',
          buffer: png,
        },
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.drawing_url).toMatch(/\/drawings\//);

    // 그 URL을 layouts.desktop의 drawing block에 적용
    const url = body.data.drawing_url;
    const layoutPatch = {
      layouts: {
        desktop: [
          {
            id: 'draw-1',
            kind: 'drawing',
            x: 40, y: 40, w: 320, h: 240, z: 1,
            visible: true, visibility: 'public',
            drawingUrl: url,
          },
        ],
        mobile: [],
      },
    };
    const r2 = await page.request.put('/api/decorate', { data: layoutPatch });
    expect(r2.status()).toBe(200);
    const b2 = await r2.json();
    expect(b2.success).toBe(true);
  });
});

/** 그림판 카드 추가 후 DrawPad 모달 오픈 */
async function openDrawPad(page: Page) {
  await page.goto('/admin?edit=1');
  await page.getByRole('button', { name: '새 그림판 카드 추가' }).click();
  await page.getByRole('button', { name: '편집 끝' }).click();
  await page.locator('[data-block-kind="drawing"]').click();
  await page.locator('[data-drawpad-canvas]').waitFor({ state: 'visible' });
}

/** 캔버스 위에서 (x1,y1)→(x2,y2) 드래그 (캔버스 표시영역 상대 좌표) */
async function dragOnCanvas(page: Page, x1: number, y1: number, x2: number, y2: number) {
  const box = (await page.locator('[data-drawpad-canvas]').boundingBox())!;
  await page.mouse.move(box.x + x1, box.y + y1);
  await page.mouse.down();
  await page.mouse.move(box.x + (x1 + x2) / 2, box.y + (y1 + y2) / 2, { steps: 4 });
  await page.mouse.move(box.x + x2, box.y + y2, { steps: 4 });
  await page.mouse.up();
}

function drawState(page: Page) {
  return page.evaluate(() => window.__drawpad!);
}

test.describe('그림판 도구 (TC-DRAW v2) — Phase 2', () => {
  test('TC-DRAW-010 펜 5종 선택해 그리기 (행동 1)', async ({ page }) => {
    await signupAndLogin(page, 'draw-pens');
    await openDrawPad(page);

    const pens: [string, string][] = [
      ['형광펜', 'highlighter'], ['만년필', 'fountain'], ['연필', 'pencil'],
      ['볼펜', 'ballpoint'], ['브러쉬', 'brush'],
    ];
    for (let i = 0; i < pens.length; i++) {
      await page.getByRole('button', { name: `펜 ${pens[i][0]}` }).click();
      await dragOnCanvas(page, 40 + i * 20, 40, 120 + i * 20, 140);
    }
    const dp = await drawState(page);
    expect(dp.count).toBe(5);
    expect(dp.elements.map((e) => (e as { pen?: string }).pen)).toEqual(pens.map((p) => p[1]));
  });

  test('TC-DRAW-011 굵기 슬라이더 1~100 반영 (행동 2)', async ({ page }) => {
    await signupAndLogin(page, 'draw-thick');
    await openDrawPad(page);

    await page.locator('input[aria-label="굵기"]').fill('80');
    await dragOnCanvas(page, 40, 40, 200, 200);
    await page.locator('input[aria-label="굵기"]').fill('3');
    await dragOnCanvas(page, 40, 250, 200, 400);

    const dp = await drawState(page);
    expect(dp.count).toBe(2);
    expect((dp.elements[0] as { width: number }).width).toBe(80);
    expect((dp.elements[1] as { width: number }).width).toBe(3);
  });

  test('TC-DRAW-012 대표색 7 + 커스텀 팔레트 (행동 3·4)', async ({ page }) => {
    await signupAndLogin(page, 'draw-color');
    await openDrawPad(page);

    // 대표색 선택
    await page.getByRole('button', { name: '색상 #e11d48' }).click();
    await dragOnCanvas(page, 40, 40, 200, 200);
    expect((await drawState(page)).elements[0]).toMatchObject({ color: '#e11d48' });

    // 커스텀 팔레트
    await page.getByRole('button', { name: '색상 팔레트' }).click();
    const hexInput = page.locator('input[type="text"]').last();
    await hexInput.fill('#0ea5e9');
    await dragOnCanvas(page, 40, 250, 200, 400);
    expect((await drawState(page)).elements[1]).toMatchObject({ color: '#0ea5e9' });
  });

  test('TC-DRAW-013 도형 6종 드래그로 그리기 (행동 5)', async ({ page }) => {
    await signupAndLogin(page, 'draw-shapes');
    await openDrawPad(page);

    const shapes: [string, string][] = [
      ['직선', 'line'], ['사각형', 'rect'], ['원·타원', 'ellipse'],
      ['삼각형', 'triangle'], ['화살표', 'arrow'], ['별', 'star'],
    ];
    for (let i = 0; i < shapes.length; i++) {
      await page.getByRole('button', { name: `도형 ${shapes[i][0]}` }).click();
      await dragOnCanvas(page, 30 + i * 10, 30, 130 + i * 10, 130);
    }
    const dp = await drawState(page);
    expect(dp.count).toBe(6);
    expect(dp.elements.map((e) => (e as { shape?: string }).shape)).toEqual(shapes.map((s) => s[1]));
  });

  test('TC-DRAW-014 픽셀 지우개 — erase 획 추가 (행동 6)', async ({ page }) => {
    await signupAndLogin(page, 'draw-erase-px');
    await openDrawPad(page);

    await dragOnCanvas(page, 40, 40, 300, 300);
    await page.getByRole('button', { name: '픽셀 지우개' }).click();
    await dragOnCanvas(page, 60, 60, 280, 280);

    const dp = await drawState(page);
    expect(dp.count).toBe(2);
    expect((dp.elements[1] as { erase: boolean }).erase).toBe(true);
  });

  test('TC-DRAW-015 객체 지우개 — 탭으로 요소 삭제 (행동 7)', async ({ page }) => {
    await signupAndLogin(page, 'draw-erase-obj');
    await openDrawPad(page);

    // 사각형 하나 그리기
    await page.getByRole('button', { name: '도형 사각형' }).click();
    await dragOnCanvas(page, 60, 60, 260, 260);
    expect((await drawState(page)).count).toBe(1);

    // 객체 지우개로 사각형 내부 탭
    await page.getByRole('button', { name: '객체 지우개' }).click();
    await dragOnCanvas(page, 160, 160, 160, 160);
    expect((await drawState(page)).count).toBe(0);
  });

  test('TC-DRAW-016 되돌리기·전체 지우기 (행동 8·9)', async ({ page }) => {
    await signupAndLogin(page, 'draw-undo');
    await openDrawPad(page);

    await dragOnCanvas(page, 40, 40, 200, 200);
    await dragOnCanvas(page, 40, 250, 200, 400);
    expect((await drawState(page)).count).toBe(2);

    await page.getByRole('button', { name: '되돌리기' }).click();
    expect((await drawState(page)).count).toBe(1);

    page.once('dialog', (d) => d.accept());
    await page.getByRole('button', { name: '전체 지우기' }).click();
    expect((await drawState(page)).count).toBe(0);
  });

  test('TC-DRAW-017 저장 → PNG 업로드 → 카드 반영 + 재오픈 (행동 10·11)', async ({ page }) => {
    await signupAndLogin(page, 'draw-save');
    await openDrawPad(page);

    await dragOnCanvas(page, 40, 40, 400, 300);
    await page.getByRole('button', { name: '그림 저장' }).click();

    // 모달 닫힘 + 카드에 그림 img 반영
    await page.locator('[data-drawpad-canvas]').waitFor({ state: 'hidden' });
    const img = page.locator('[data-block-kind="drawing"] img');
    await expect(img).toBeVisible();
    await expect(img).toHaveAttribute('src', /\/api\/img\?path=/);

    // 재오픈 → 캔버스 다시 표시 (기존 PNG 배경 로드)
    await page.locator('[data-block-kind="drawing"]').click();
    await expect(page.locator('[data-drawpad-canvas]')).toBeVisible();
  });
});
