import { test, expect } from '@playwright/test';

const pages = [
  { path: '/', titleExpected: /GTA5|メカニック|計算機/ },
  { path: '/repair.html', titleExpected: /修理|Mechanic/ },
  { path: '/custom.html', titleExpected: /カスタム|Mechanic/ },
  { path: '/buyback.html', titleExpected: /買取|Mechanic/ },
  { path: '/register.html', titleExpected: /レジ|売上|Mechanic/ },
  { path: '/settings.html', titleExpected: /設定|Mechanic/ }
];

test.describe('Page Load and Console Error Check', () => {
  for (const pageInfo of pages) {
    test(`loads ${pageInfo.path} without console errors or 404s`, async ({ page }) => {
      const consoleErrors = [];
      const failedRequests = [];

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          // Firebase接続警告（オフライン時など）は許容する場合もあるが、JSの構文/未定義エラーは検出
          consoleErrors.push(msg.text());
        }
      });

      page.on('requestfailed', (request) => {
        // 外部のFirebase接続失敗等を除き、ローカル静的ファイルの404を捕捉
        if (request.url().includes('127.0.0.1:3000')) {
          failedRequests.push(`${request.url()} - ${request.failure()?.errorText}`);
        }
      });

      const response = await page.goto(pageInfo.path);
      expect(response?.status()).toBe(200);

      // JS実行が完了するのを待機
      await page.waitForLoadState('domcontentloaded');

      // 重大なJSエラーがないこと
      const criticalErrors = consoleErrors.filter(
        (err) => !err.includes('Firebase') && !err.includes('analytics') && !err.includes('quota')
      );
      expect(criticalErrors).toEqual([]);
      expect(failedRequests).toEqual([]);
    });
  }
});

test.describe('Repair Calculator E2E Interaction', () => {
  test('calculates repair costs correctly when selecting parts', async ({ page }) => {
    await page.goto('/repair.html');

    // 初期状態の合計表示を確認
    const totalEl = page.locator('#repairTotalDisplay');
    await expect(totalEl).toBeVisible();

    // フル修理チェックボックスをクリック
    const fullRepairChk = page.locator('#chkFullRepair');
    if (await fullRepairChk.isVisible()) {
      await fullRepairChk.check();
      // 合計が ¥0 より大きくなっていることを確認
      const text = await totalEl.textContent();
      expect(text).not.toBe('¥0');
    }

    // 出張モード切り替え
    const onsiteBtn = page.locator('#btnModeOnsite');
    if (await onsiteBtn.isVisible()) {
      await onsiteBtn.click();
      await expect(onsiteBtn).toHaveClass(/active/);
    }

    // リセットボタン
    const resetBtn = page.locator('#btnResetRepair');
    if (await resetBtn.isVisible()) {
      await resetBtn.click();
      await expect(totalEl).toHaveText('¥0');
    }
  });
});

test.describe('Custom Calculator E2E Interaction', () => {
  test('calculates custom costs when selecting options', async ({ page }) => {
    await page.goto('/custom.html');

    const totalEl = page.locator('#customTotalDisplay, #totalDisplay, .total-amount').first();
    await expect(totalEl).toBeVisible();

    // エンジングレード等の選択ボタンをクリック
    const perfBtn = page.locator('.btn-grid button, .spec-btn').first();
    if (await perfBtn.isVisible()) {
      await perfBtn.click();
      const text = await totalEl.textContent();
      expect(text).toContain('¥');
    }
  });
});

test.describe('Buyback Calculator E2E Interaction', () => {
  test('calculates buyback total when typing quantities', async ({ page }) => {
    await page.goto('/buyback.html');

    const totalEl = page.locator('#buybackTotalDisplay, #totalDisplay, .total-amount').first();
    await expect(totalEl).toBeVisible();

    // 最初の数量入力欄に数値を入力
    const input = page.locator('input[type="number"]').first();
    if (await input.isVisible()) {
      await input.fill('10');
      await input.dispatchEvent('input');
      const text = await totalEl.textContent();
      expect(text).not.toBe('¥0');
    }
  });
});
