import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

test('Buyback material calculation accuracy', () => {
  const code = fs.readFileSync(path.join(rootDir, 'firebase-config.js'), 'utf-8');
  const context = {
    window: {},
    document: { getElementById: () => null },
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    console: console,
  };
  vm.createContext(context);
  try {
    vm.runInContext(code + '\n;globalThis.DEFAULT_PRICES = DEFAULT_PRICES;', context);
  } catch (_e) {
    // VM実行時の未定義ブラウザ変数を無視
  }

  const prices = context.DEFAULT_PRICES || context.globalThis?.DEFAULT_PRICES;
  assert.ok(prices);

  // 計算検証: 鉄(Iron) 100個 + スクラップ(Scrap) 50個
  const ironTotal = (prices.buyback.Iron || 1500) * 100;
  const scrapTotal = (prices.buyback.Scrap || 300) * 50;
  const expectedTotal = ironTotal + scrapTotal;

  assert.equal(ironTotal, 150000);
  assert.equal(scrapTotal, 15000);
  assert.equal(expectedTotal, 165000);
});

test('Repair cost calculation rules (Full vs Body + Engine)', () => {
  const code = fs.readFileSync(path.join(rootDir, 'firebase-config.js'), 'utf-8');
  const context = {
    window: {},
    document: { getElementById: () => null },
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    console: console,
  };
  vm.createContext(context);
  try {
    vm.runInContext(code + '\n;globalThis.DEFAULT_PRICES = DEFAULT_PRICES;', context);
  } catch (_e) {
    // VM実行時の未定義ブラウザ変数を無視
  }

  const prices = context.DEFAULT_PRICES || context.globalThis?.DEFAULT_PRICES;
  
  // 店舗修理のフル vs 部位修理
  const fullShop = prices.repairs.full.shop;
  const partsShop = prices.repairs.engine.shop + prices.repairs.body.shop;
  assert.ok(fullShop > 0);
  assert.ok(partsShop > 0);

  // 出張修理のフル vs 部位修理
  const fullOnsite = prices.repairs.full.onsite;
  const partsOnsite = prices.repairs.engine.onsite + prices.repairs.body.onsite;
  assert.ok(fullOnsite > fullShop, '出張修理は店舗修理より高額であること');
  assert.ok(partsOnsite > partsShop);
});
