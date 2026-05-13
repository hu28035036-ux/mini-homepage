import { test, expect } from '@playwright/test';
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
    expect(body.data.drawing_url).toMatch(/^https?:\/\//);

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
