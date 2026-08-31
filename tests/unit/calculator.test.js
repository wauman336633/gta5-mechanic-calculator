import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import '../../calculator-core.js';

const {
  calculateRepairTotal,
  generateRepairSummary,
  calculateDiscount,
  calculateVault,
  calculateCustomTotal,
  generateCustomSummary,
  calculateBuybackTotal,
  generateBuybackSummary
} = globalThis.CalculatorCore;

// テスト用標準モックデータ
const mockRepairConfig = {
  repairs: {
    baseRepairs: [
      { id: 'full', name: 'フル修理', shopPrice: 200000, onsitePrice: 250000 },
      { id: 'engine', name: 'エンジン修理', shopPrice: 120000, onsitePrice: 150000 },
      { id: 'body', name: '外装修理', shopPrice: 80000, onsitePrice: 100000 }
    ],
    degradedParts: [
      { id: 'deg_engine', name: 'エンジン劣化', price: 50000 },
      { id: 'deg_body', name: 'ボディ劣化', price: 40000 }
    ],
    extraServices: [
      { id: 'aircraft', name: '航空機/船加算', price: 100000, type: 'checkbox' },
      { id: 'nos_refill', name: 'NOS補充', price: 30000, type: 'stepper', min: 0, max: 10 },
      { id: 'wash', name: '洗車', price: 5000, type: 'checkbox' }
    ]
  },
  repairItems: [
    { id: 'kit', name: '修理キット', price: 15000, min: 0, max: 99 },
    { id: 'spray', name: 'スプレー缶', price: 3000, min: 0, max: 99 }
  ]
};

const mockCustomConfig = {
  performance: [
    { id: 'engine', name: 'エンジン', type: 'tiered', prices: [0, 50000, 100000, 150000, 200000], labels: ['未装着', 'Lv1', 'Lv2', 'Lv3', 'Lv4'] },
    { id: 'turbo', name: 'ターボ', type: 'checkbox', price: 120000 }
  ],
  exterior: [
    { id: 'front_bumper', name: 'フロントバンパー', type: 'stepper', price: 20000, min: 0, max: 5 },
    { id: 'neon', name: 'ネオン管', type: 'checkbox', price: 40000 }
  ],
  repairs: [
    { id: 'nos_install', name: 'NOS取付', price: 50000, min: 0, max: 5 }
  ],
  items: [
    { id: 'drink', name: 'エナジードリンク', price: 1000, min: 0, max: 20 }
  ]
};

const mockBuybackConfig = [
  { id: 'Steel', name: 'スチール', price: 1500, unit: '個' },
  { id: 'Iron', name: '鉄', price: 1500, unit: '個' },
  { id: 'Scrap', name: 'スクラップ', price: 300, unit: '個' },
  { id: 'Gold', name: '金', price: 10000, unit: '個' }
];

describe('Pure Core Calculation Logic - Unit Tests', () => {

  // ========================================================================
  // 1. Repair Calculations
  // ========================================================================
  describe('Repair Calculations (calculateRepairTotal & generateRepairSummary)', () => {
    it('calculates full shop repair correctly', () => {
      const state = {
        mode: 'shop',
        aircraft: false,
        repairs: { full: true },
        items: {}
      };
      const total = calculateRepairTotal(state, mockRepairConfig);
      assert.equal(total, 200000);
      assert.equal(generateRepairSummary(state, mockRepairConfig, total), '200000 フル修理');
    });

    it('calculates onsite repair with higher price tier', () => {
      const state = {
        mode: 'onsite',
        aircraft: false,
        repairs: { full: true },
        items: {}
      };
      const total = calculateRepairTotal(state, mockRepairConfig);
      assert.equal(total, 250000, '出張修理は店舗修理(200,000)より高額(250,000)であること');
      assert.equal(generateRepairSummary(state, mockRepairConfig, total), '250000 フル修理');
    });

    it('calculates combinations of degraded parts, extra services, aircraft, and items', () => {
      const state = {
        mode: 'shop',
        aircraft: true, // +100,000
        repairs: {
          engine: true, // +120,000
          deg_engine: true, // +50,000
          nos_refill: 2, // 2 * 30,000 = +60,000
          wash: true // +5,000
        },
        items: {
          kit: 3 // 3 * 15,000 = +45,000
        }
      };
      // Total: 120,000 + 50,000 + 100,000 + 60,000 + 5,000 + 45,000 = 380,000
      const total = calculateRepairTotal(state, mockRepairConfig);
      assert.equal(total, 380000);

      const summary = generateRepairSummary(state, mockRepairConfig, total);
      assert.ok(summary.startsWith('380000 '));
      assert.ok(summary.includes('エンジン修理'));
      assert.ok(summary.includes('エンジン劣化'));
      assert.ok(summary.includes('航空機/船加算'));
      assert.ok(summary.includes('NOS補充x2'));
      assert.ok(summary.includes('洗車'));
      assert.ok(summary.includes('修理キットx3'));
    });

    it('returns 0 and "作業なし" when nothing is selected', () => {
      const state = { mode: 'shop', aircraft: false, repairs: {}, items: {} };
      const total = calculateRepairTotal(state, mockRepairConfig);
      assert.equal(total, 0);
      assert.equal(generateRepairSummary(state, mockRepairConfig, total), '作業なし');
    });
  });

  // ========================================================================
  // 2. Discount & Vault Calculations
  // ========================================================================
  describe('Discount Calculations (calculateDiscount)', () => {
    it('applies preset percentage discounts (30%, 50%, 70%)', () => {
      const subtotal = 100000;
      assert.deepEqual(calculateDiscount(subtotal, { preset: 30 }), {
        discountAmount: 30000,
        tagText: '30% OFF 適用中'
      });
      assert.deepEqual(calculateDiscount(subtotal, { preset: 50 }), {
        discountAmount: 50000,
        tagText: '50% OFF 適用中'
      });
      assert.deepEqual(calculateDiscount(subtotal, { preset: 70 }), {
        discountAmount: 70000,
        tagText: '70% OFF 適用中'
      });
    });

    it('applies custom percentage discounts and clamps out-of-range values', () => {
      const subtotal = 200000;
      assert.deepEqual(calculateDiscount(subtotal, { customType: 'percent', customValue: 25 }), {
        discountAmount: 50000,
        tagText: '25% OFF 適用中'
      });
      // 120% は 100% にクランプ
      assert.deepEqual(calculateDiscount(subtotal, { customType: 'percent', customValue: 120 }), {
        discountAmount: 200000,
        tagText: '100% OFF 適用中'
      });
      // 負数は 0% にクランプ
      assert.deepEqual(calculateDiscount(subtotal, { customType: 'percent', customValue: -10 }), {
        discountAmount: 0,
        tagText: '0% OFF 適用中'
      });
    });

    it('applies custom fixed amount discounts and clamps to subtotal', () => {
      const subtotal = 150000;
      assert.deepEqual(calculateDiscount(subtotal, { customType: 'fixed', customValue: 50000 }), {
        discountAmount: 50000,
        tagText: '-¥50,000 適用中'
      });
      // 小計を超える定額割引は小計までに制限（請求額がマイナスにならない）
      assert.deepEqual(calculateDiscount(subtotal, { customType: 'fixed', customValue: 300000 }), {
        discountAmount: 150000,
        tagText: '-¥150,000 適用中'
      });
    });

    it('calculates fraction discounts with Math.floor', () => {
      const subtotal = 999;
      const { discountAmount } = calculateDiscount(subtotal, { preset: 30 });
      assert.equal(discountAmount, 299); // 999 * 0.3 = 299.7 -> 299
    });
  });

  describe('Vault Calculations (calculateVault)', () => {
    it('calculates default 30% vault deposit with floor rounding', () => {
      assert.equal(calculateVault(100000), 30000);
      assert.equal(calculateVault(12345), 3703); // 12345 * 0.3 = 3703.5 -> 3703
      assert.equal(calculateVault(0), 0);
    });

    it('supports custom vault rate', () => {
      assert.equal(calculateVault(100000, 0.5), 50000);
      assert.equal(calculateVault(100000, 0), 0);
    });
  });

  // ========================================================================
  // 3. Custom Calculations
  // ========================================================================
  describe('Custom Calculations (calculateCustomTotal & generateCustomSummary)', () => {
    it('calculates tiered performance items and discounts', () => {
      const state = {
        performance: {
          engine: 4, // Lv4 -> 200,000
          turbo: true // +120,000
        },
        exterior: {
          front_bumper: 2, // 2 * 20,000 = +40,000
          neon: true // +40,000
        },
        repairs: {
          nos_install: 1 // +50,000
        },
        items: {
          drink: 5 // 5 * 1000 = +5,000
        },
        discount: { preset: 30 }
      };
      // Subtotal: 200k + 120k + 40k + 40k + 50k + 5k = 455,000
      // Discount (30%): Math.floor(455000 * 0.3) = 136,500
      // Final: 455,000 - 136,500 = 318,500
      // Vault (30%): Math.floor(318,500 * 0.3) = 95,550
      const result = calculateCustomTotal(state, mockCustomConfig, 0.3);
      assert.equal(result.subtotal, 455000);
      assert.equal(result.discountAmount, 136500);
      assert.equal(result.finalTotal, 318500);
      assert.equal(result.vaultAmount, 95550);

      // 通常サマリ
      const summary = generateCustomSummary(state, mockCustomConfig, result, false);
      assert.equal(summary, '95550 エンジン Lv4, ターボ, フロントバンパーx2, ネオン管, NOS取付x1, エナジードリンクx5 (請求: ¥318,500)');

      // 自車モードサマリ
      const ownCarSummary = generateCustomSummary(state, mockCustomConfig, result, true);
      assert.equal(ownCarSummary, '自車 95550 エンジン Lv4, ターボ, フロントバンパーx2, ネオン管, NOS取付x1, エナジードリンクx5');
    });

    it('handles empty state and returns 0 / default string', () => {
      const state = { performance: {}, exterior: {}, repairs: {}, items: {}, discount: {} };
      const result = calculateCustomTotal(state, mockCustomConfig);
      assert.equal(result.subtotal, 0);
      assert.equal(result.finalTotal, 0);
      assert.equal(result.vaultAmount, 0);

      const summary = generateCustomSummary(state, mockCustomConfig, result, false);
      assert.equal(summary, '0 カスタム作業なし (請求: ¥0)');
    });
  });

  // ========================================================================
  // 4. Material Buyback Calculations
  // ========================================================================
  describe('Buyback Calculations (calculateBuybackTotal & generateBuybackSummary)', () => {
    it('calculates material quantities and item subtotals correctly', () => {
      const state = {
        Steel: 100, // 100 * 1500 = 150,000
        Iron: 50,   // 50 * 1500 = 75,000
        Scrap: 200, // 200 * 300 = 60,000
        Gold: 0     // 0
      };
      const { itemSubtotals, total } = calculateBuybackTotal(state, mockBuybackConfig);
      assert.equal(itemSubtotals.Steel, 150000);
      assert.equal(itemSubtotals.Iron, 75000);
      assert.equal(itemSubtotals.Scrap, 60000);
      assert.equal(itemSubtotals.Gold, 0);
      assert.equal(total, 285000);

      const summary = generateBuybackSummary(state, mockBuybackConfig, total);
      assert.equal(summary, '【買取明細】 スチールx100個, 鉄x50個, スクラップx200個 (合計: ¥285,000)');
    });

    it('handles 0 count materials with "買取品なし"', () => {
      const state = { Steel: 0, Iron: 0 };
      const { total } = calculateBuybackTotal(state, mockBuybackConfig);
      assert.equal(total, 0);
      assert.equal(generateBuybackSummary(state, mockBuybackConfig, total), '買取品なし');
    });
  });

  // ========================================================================
  // 5. Boundary & Edge Cases Robustness
  // ========================================================================
  describe('Boundary & Edge Cases Robustness', () => {
    it('survives undefined, null, and empty objects without throwing NaN or crashing', () => {
      assert.equal(calculateRepairTotal(null, null), 0);
      assert.equal(calculateRepairTotal({}, {}), 0);
      assert.equal(generateRepairSummary(null, null), '作業なし');

      const customRes = calculateCustomTotal(undefined, undefined);
      assert.equal(customRes.subtotal, 0);
      assert.equal(customRes.finalTotal, 0);
      assert.equal(customRes.vaultAmount, 0);

      const buybackRes = calculateBuybackTotal(null, null);
      assert.equal(buybackRes.total, 0);
      assert.equal(generateBuybackSummary(null, null), '買取品なし');
    });

    it('handles negative or invalid number inputs gracefully', () => {
      assert.equal(calculateVault(-5000), 0);
      assert.equal(calculateVault('invalid'), 0);

      const disc = calculateDiscount(-1000, { preset: -20 });
      assert.equal(disc.discountAmount, 0);
    });
  });
});
