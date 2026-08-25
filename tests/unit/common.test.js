import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

function loadCommonModule() {
  const code = fs.readFileSync(path.join(rootDir, 'common.js'), 'utf-8');
  const context = {
    window: {},
    document: {
      getElementById: () => null,
      addEventListener: () => {},
      removeEventListener: () => {},
      querySelectorAll: () => [],
    },
    navigator: {},
    setTimeout: setTimeout,
    clearTimeout: clearTimeout,
    console: console,
  };
  vm.createContext(context);
  vm.runInContext(code + '\n;globalThis.AppCommon = AppCommon;', context);
  return context.AppCommon || context.globalThis?.AppCommon;
}

test('AppCommon.formatJPY formats numbers into Japanese Yen currency', () => {
  const AppCommon = loadCommonModule();
  assert.equal(AppCommon.formatJPY(0), '¥0');
  assert.equal(AppCommon.formatJPY(1000), '¥1,000');
  assert.equal(AppCommon.formatJPY(1500000), '¥1,500,000');
  assert.equal(AppCommon.formatJPY(null), '¥0');
  assert.equal(AppCommon.formatJPY(undefined), '¥0');
});

test('AppCommon.formatShortPrice formats large amounts into 万 unit', () => {
  const AppCommon = loadCommonModule();
  assert.equal(AppCommon.formatShortPrice(5000), '¥5,000');
  assert.equal(AppCommon.formatShortPrice(10000), '¥1万');
  assert.equal(AppCommon.formatShortPrice(3000000), '¥300万');
  assert.equal(AppCommon.formatShortPrice(25000000), '¥2500万');
  assert.equal(AppCommon.formatShortPrice(15000), '¥1.5万');
});

test('AppCommon.escapeHtml sanitizes special characters', () => {
  const AppCommon = loadCommonModule();
  assert.equal(AppCommon.escapeHtml('<script>alert("xss")</script>'), '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
  assert.equal(AppCommon.escapeHtml("Tom & Jerry's"), 'Tom &amp; Jerry&#039;s');
  assert.equal(AppCommon.escapeHtml(null), '');
});
