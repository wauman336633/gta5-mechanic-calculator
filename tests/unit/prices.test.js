import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

function loadFirebaseConfigModule() {
  const code = fs.readFileSync(path.join(rootDir, 'firebase-config.js'), 'utf-8');
  const context = {
    window: {},
    document: { 
      getElementById: () => null,
      addEventListener: () => {},
      removeEventListener: () => {},
    },
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    },
    console: console,
  };
  vm.createContext(context);
  try {
    vm.runInContext(code + '\n;globalThis.DEFAULT_PRICES = DEFAULT_PRICES;', context);
  } catch (_e) {
    // Firebase初期化以外の部分を評価
  }
  return context.DEFAULT_PRICES || context.window?.DEFAULT_PRICES || context.globalThis?.DEFAULT_PRICES;
}

test('DEFAULT_PRICES structure contains all essential price categories', () => {
  const prices = loadFirebaseConfigModule();
  assert.ok(prices, 'DEFAULT_PRICES must be defined');
  
  // repairs
  assert.equal(typeof prices.repairs.full.shop, 'number');
  assert.equal(typeof prices.repairs.full.onsite, 'number');
  assert.equal(typeof prices.repairs.engine.shop, 'number');
  assert.equal(typeof prices.repairs.body.shop, 'number');
  assert.equal(typeof prices.repairs.degradedPartUnit, 'number');
  assert.equal(typeof prices.repairs.tires, 'number');

  // custom performance
  assert.ok(Array.isArray(prices.custom.performance.engine));
  assert.ok(Array.isArray(prices.custom.performance.brakes));
  assert.ok(Array.isArray(prices.custom.performance.suspension));
  assert.ok(Array.isArray(prices.custom.performance.transmission));

  // buyback materials
  assert.equal(typeof prices.buyback.Steel, 'number');
  assert.equal(typeof prices.buyback.Iron, 'number');
  assert.equal(typeof prices.buyback.Scrap, 'number');
});

test('DEFAULT_CUSTOM_CONFIG and dual-mode bidirectional synchronization', () => {
  const code = fs.readFileSync(path.join(rootDir, 'firebase-config.js'), 'utf-8');
  const context = {
    window: {},
    document: { 
      getElementById: () => null,
      addEventListener: () => {},
      removeEventListener: () => {},
    },
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    },
    crypto: globalThis.crypto,
    TextEncoder: globalThis.TextEncoder,
    console: console,
  };
  vm.createContext(context);
  vm.runInContext(code, context);

  const ShopManager = context.window.ShopManager;
  assert.ok(ShopManager, 'ShopManager must be exported');
  assert.ok(ShopManager.DEFAULT_CUSTOM_CONFIG, 'DEFAULT_CUSTOM_CONFIG must exist');

  // 1. DEFAULT_CUSTOM_CONFIG structure
  assert.ok(Array.isArray(ShopManager.DEFAULT_CUSTOM_CONFIG.repairs.baseRepairs));
  assert.ok(Array.isArray(ShopManager.DEFAULT_CUSTOM_CONFIG.repairs.degradedParts));
  assert.ok(Array.isArray(ShopManager.DEFAULT_CUSTOM_CONFIG.custom.performance));
  assert.ok(Array.isArray(ShopManager.DEFAULT_CUSTOM_CONFIG.buyback));

  // 2. buildCustomConfigFromLegacyPrices -> Custom Config
  const customConfig = ShopManager.buildCustomConfigFromLegacyPrices(ShopManager.DEFAULT_PRICES);
  assert.ok(customConfig.buyback.length > 0);
  assert.equal(customConfig.buyback.find(i => i.id === 'Steel').price, 1500);

  // 3. buildLegacyPricesFromCustomConfig -> Legacy Prices
  const legacyPrices = ShopManager.buildLegacyPricesFromCustomConfig(customConfig);
  assert.equal(legacyPrices.buyback.Steel, 1500);
  assert.equal(legacyPrices.repairs.full.shop, 200000);
  assert.equal(legacyPrices.custom.exterior.base, 50000);

  // 4. normalizeShopConfig non-destructive dual mode
  const docFromOldApp = { name: 'Old Shop', prices: ShopManager.DEFAULT_PRICES };
  const normalized = ShopManager.normalizeShopConfig(docFromOldApp);
  assert.ok(normalized.prices);
  assert.ok(normalized.customConfig);
  assert.equal(normalized.customConfig.buyback.length, 8);
});

test('hashPasscode generates valid 64-character salted SHA-256 hex string', async () => {
  const code = fs.readFileSync(path.join(rootDir, 'firebase-config.js'), 'utf-8');
  const context = {
    window: {},
    document: { getElementById: () => null, addEventListener: () => {} },
    localStorage: { getItem: () => null, setItem: () => {} },
    crypto: globalThis.crypto,
    TextEncoder: globalThis.TextEncoder,
    console: console,
  };
  vm.createContext(context);
  vm.runInContext(code, context);

  const ShopManager = context.window.ShopManager;
  const hashA = await ShopManager.hashPasscode('1234', 'shop-a');
  const hashB = await ShopManager.hashPasscode('1234', 'shop-b');
  const hashA2 = await ShopManager.hashPasscode('1234', 'SHOP-A'); // 大文字小文字同一視

  assert.equal(typeof hashA, 'string');
  assert.equal(hashA.length, 64);
  assert.equal(/^[a-f0-9]{64}$/.test(hashA), true);
  assert.equal(hashA, hashA2, 'Shop ID case difference should produce identical salted hash');
  assert.notEqual(hashA, hashB, 'Different shop IDs must produce different salted hashes');

  // 引数が欠落している場合の安全性
  assert.equal(await ShopManager.hashPasscode('', 'shop-a'), '');
  assert.equal(await ShopManager.hashPasscode('1234', ''), '');

  // sample店舗の検証
  const isSampleValid = await ShopManager.verifyShopPasscode('sample', '1111');
  assert.equal(isSampleValid, true);

  const isSampleInvalid = await ShopManager.verifyShopPasscode('sample', 'wrong');
  assert.equal(isSampleInvalid, false);
});
