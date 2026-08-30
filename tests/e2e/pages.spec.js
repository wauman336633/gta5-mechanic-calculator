import { test, expect } from '@playwright/test';

const pages = [
  { path: '/', titleExpected: /GTA5|メカニック|計算機/ },
  { path: '/repair.html?shop=sample', titleExpected: /修理|Mechanic/ },
  { path: '/custom.html?shop=sample', titleExpected: /カスタム|Mechanic/ },
  { path: '/buyback.html?shop=sample', titleExpected: /買取|Mechanic/ },
  { path: '/register.html', titleExpected: /レジ|売上|Mechanic/ },
  { path: '/settings.html?shop=sample', titleExpected: /設定|Mechanic/ },
  { path: '/not-found.html?shop=sample', titleExpected: /店舗が見つかりません|Mechanic/ }
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

test.describe('Shop Parameter and Not Found Guardrails', () => {
  test('redirects to index.html when ?shop= parameter is missing on calculator page', async ({ page }) => {
    await page.goto('/repair.html');
    await page.waitForURL((url) => url.pathname.endsWith('index.html') || url.pathname === '/');
    expect(page.url()).toMatch(/(index\.html|\/)$/);
  });

  test('redirects to not-found.html when an invalid shop id is specified in URL', async ({ page }) => {
    await page.goto('/repair.html?shop=invalid_shop_9999');
    await page.waitForURL((url) => url.pathname.includes('not-found.html'));
    expect(page.url()).toContain('not-found.html?shop=invalid_shop_9999');
    expect(page.url()).toContain('from=repair');
    await expect(page.locator('#targetShopIdBadge')).toHaveText('invalid_shop_9999');
  });

  test('allows retrying shop ID on not-found.html and redirects to target page', async ({ page }) => {
    await page.goto('/not-found.html?shop=wrong_id&from=custom');
    const input = page.locator('#retryShopId');
    await input.fill('sample');
    const submitBtn = page.locator('#btnRetrySubmit');
    await submitBtn.click();
    await page.waitForURL((url) => url.pathname.includes('custom.html') && url.searchParams.get('shop') === 'sample');
    expect(page.url()).toContain('custom.html?shop=sample');
  });

  test('portal direct ID input checks and redirects non-existent shop to not-found.html', async ({ page }) => {
    await page.goto('/');
    const input = page.locator('#directShopId');
    await input.fill('non_existent_shop_123');
    const form = page.locator('#formDirectAccess');
    await form.locator('button[type="submit"]').click();
    await page.waitForURL((url) => url.pathname.includes('not-found.html'));
    expect(page.url()).toContain('not-found.html?shop=non_existent_shop_123');
  });
});

test.describe('Repair Calculator E2E Interaction', () => {
  test('calculates repair costs correctly when selecting parts', async ({ page }) => {
    await page.goto('/repair.html?shop=sample');

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
    await page.goto('/custom.html?shop=sample');

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
    await page.goto('/buyback.html?shop=sample');

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

test.describe('Settings Dynamic Configuration E2E Interaction', () => {
  test('authenticates and displays dynamic item editor', async ({ page }) => {
    await page.goto('/settings.html?shop=sample');

    // パスコードモーダル
    const modal = page.locator('#modalPasscode');
    await expect(modal).toBeVisible();

    // パスコード送信 (sample店舗は1111)
    const submitBtn = modal.locator('button[type="submit"]');
    await submitBtn.click();

    // モーダルが非表示になり、エディタが有効化される
    await expect(modal).toHaveClass(/hidden/);

    // タブ切り替え
    const customTabBtn = page.locator('button.settings-tab-btn[data-tab="tabCustom"]');
    await customTabBtn.click();
    await expect(page.locator('#tabCustom')).toHaveClass(/active/);

    const buybackTabBtn = page.locator('button.settings-tab-btn[data-tab="tabBuyback"]');
    await buybackTabBtn.click();
    await expect(page.locator('#tabBuyback')).toHaveClass(/active/);

    // 買取素材リストのアイテムが表示されていること
    const buybackItems = page.locator('#list_buyback .settings-item-row');
    await expect(buybackItems.first()).toBeVisible();

    // オーナー・セキュリティタブへの切り替え
    const securityTabBtn = page.locator('button.settings-tab-btn[data-tab="tabSecurity"]');
    await securityTabBtn.click();
    await expect(page.locator('#tabSecurity')).toHaveClass(/active/);
    await expect(page.locator('#changePasscodeForm')).toBeVisible();
  });
});
