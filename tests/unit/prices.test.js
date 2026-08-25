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
  } catch (e) {
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
