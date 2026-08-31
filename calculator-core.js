// ==========================================================================
// Mechanic Calculator - Pure Core Calculation Functions (calculator-core.js)
// Side-effect free, testable pure functions for all calculator domains.
// Universal module supporting Browser Global and Node.js test execution.
// ==========================================================================

(function (_global) {
  /**
   * 1. 修理計算ロジック（純粋関数）
   * @param {Object} state - { mode: 'shop'|'onsite', aircraft: boolean, repairs: Object, items: Object }
   * @param {Object} config - customConfig (baseRepairs, degradedParts, extraServices, repairItems)
   * @returns {number} 合計修理請求額
   */
  function calculateRepairTotal(state, config) {
    const safeState = state || {};
    const safeConfig = config || {};
    let total = 0;
    const isShop = safeState.mode !== 'onsite';
    const repairsConfig = safeConfig.repairs || {};

    // 1. 基本修理
    const baseRepairs = repairsConfig.baseRepairs || [];
    baseRepairs.forEach(item => {
      if (safeState.repairs && safeState.repairs[item.id]) {
        total += isShop ? Number(item.shopPrice || 0) : Number(item.onsitePrice || 0);
      }
    });

    // 2. 劣化パーツ
    const degradedParts = repairsConfig.degradedParts || [];
    degradedParts.forEach(part => {
      if (safeState.repairs && safeState.repairs[part.id]) {
        total += Number(part.price || 0);
      }
    });

    // 3. 追加サービス (航空機・NOS・タイヤ等)
    const extraServices = repairsConfig.extraServices || [];
    extraServices.forEach(item => {
      if (item.id === 'aircraft') {
        if (safeState.aircraft) total += Number(item.price || 0);
      } else if (item.type === 'stepper') {
        const qty = Number((safeState.repairs && safeState.repairs[item.id]) || 0);
        if (qty > 0) total += qty * Number(item.price || 0);
      } else if (item.type === 'checkbox') {
        if (safeState.repairs && safeState.repairs[item.id]) {
          total += Number(item.price || 0);
        }
      }
    });

    // 4. 販売品アイテム
    const repairItems = safeConfig.repairItems || [];
    repairItems.forEach(item => {
      const qty = Number((safeState.items && safeState.items[item.id]) || 0);
      if (qty > 0) total += qty * Number(item.price || 0);
    });

    return Math.max(0, Math.floor(total || 0));
  }

  /**
   * 修理サマリ文字列生成（純粋関数）
   * @param {Object} state
   * @param {Object} config
   * @param {number} [total] - 省略時は calculateRepairTotal を呼び出し
   * @returns {string} サマリテキスト
   */
  function generateRepairSummary(state, config, total = null) {
    const safeState = state || {};
    const safeConfig = config || {};
    const items = [];
    const repairsConfig = safeConfig.repairs || {};

    // 基本修理
    const baseRepairs = repairsConfig.baseRepairs || [];
    baseRepairs.forEach(item => {
      if (safeState.repairs && safeState.repairs[item.id]) {
        items.push(item.name);
      }
    });

    // 劣化パーツ
    const degradedParts = repairsConfig.degradedParts || [];
    degradedParts.forEach(part => {
      if (safeState.repairs && safeState.repairs[part.id]) {
        items.push(part.name);
      }
    });

    // 航空機
    if (safeState.aircraft) {
      items.push('航空機/船加算');
    }

    // 追加サービス
    const extraServices = repairsConfig.extraServices || [];
    extraServices.forEach(item => {
      if (item.id !== 'aircraft') {
        if (item.type === 'stepper') {
          const qty = Number((safeState.repairs && safeState.repairs[item.id]) || 0);
          if (qty > 0) items.push(`${item.name}x${qty}`);
        } else if (item.type === 'checkbox' && safeState.repairs && safeState.repairs[item.id]) {
          items.push(item.name);
        }
      }
    });

    // 販売品
    const repairItems = safeConfig.repairItems || [];
    repairItems.forEach(item => {
      const qty = Number((safeState.items && safeState.items[item.id]) || 0);
      if (qty > 0) items.push(`${item.name}x${qty}`);
    });

    const finalTotal = total != null ? total : calculateRepairTotal(safeState, safeConfig);
    return items.length > 0 ? `${finalTotal} ${items.join(', ')}` : '作業なし';
  }

  /**
   * 2. 割引計算ロジック（純粋関数）
   * @param {number} subtotal - 小計
   * @param {Object} discountState - { preset: number, customType: 'none'|'percent'|'fixed', customValue: number }
   * @returns {{ discountAmount: number, tagText: string }}
   */
  function calculateDiscount(subtotal = 0, discountState = {}) {
    const validSubtotal = Math.max(0, Number(subtotal || 0));
    const safeDiscount = discountState || {};
    let discountAmount = 0;
    let tagText = '';

    const preset = Number(safeDiscount.preset || 0);
    if (preset > 0) {
      const p = Math.min(100, Math.max(0, preset));
      discountAmount = Math.floor(validSubtotal * (p / 100));
      tagText = `${p}% OFF 適用中`;
    } else if (safeDiscount.customType === 'percent') {
      const p = Math.min(100, Math.max(0, Number(safeDiscount.customValue || 0)));
      discountAmount = Math.floor(validSubtotal * (p / 100));
      tagText = `${p}% OFF 適用中`;
    } else if (safeDiscount.customType === 'fixed') {
      const val = Math.max(0, Number(safeDiscount.customValue || 0));
      discountAmount = Math.min(validSubtotal, val);
      tagText = `-${'¥' + discountAmount.toLocaleString('ja-JP')} 適用中`;
    }

    return {
      discountAmount: Math.max(0, discountAmount),
      tagText
    };
  }

  /**
   * 3. 金庫納金計算ロジック（純粋関数）
   * @param {number} amount - 請求金額
   * @param {number} [vaultRate=0.3] - 金庫割合 (0.0 〜 1.0)
   * @returns {number} 金庫納金額（切り捨て）
   */
  function calculateVault(amount = 0, vaultRate = 0.3) {
    const rate = (typeof vaultRate === 'number' && !isNaN(vaultRate)) ? Math.max(0, vaultRate) : 0.3;
    return Math.max(0, Math.floor((Number(amount) || 0) * rate));
  }

  /**
   * 4. カスタム計算ロジック（純粋関数）
   * @param {Object} state - { performance, exterior, repairs, items, discount }
   * @param {Object} config - customConfig.custom (performance, exterior, repairs, items)
   * @param {number} [vaultRate=0.3]
   * @returns {{ subtotal: number, discountAmount: number, discountTagText: string, finalTotal: number, vaultAmount: number }}
   */
  function calculateCustomTotal(state, config, vaultRate = 0.3) {
    const safeState = state || {};
    const safeConfig = config || {};
    let subtotal = 0;

    // 1. 性能パーツ
    const perfList = safeConfig.performance || [];
    perfList.forEach(item => {
      if (item.type === 'tiered') {
        const lvl = Number((safeState.performance && safeState.performance[item.id]) || 0);
        if (lvl > 0 && Array.isArray(item.prices) && item.prices[lvl] != null) {
          subtotal += Number(item.prices[lvl]);
        }
      } else if (item.type === 'checkbox') {
        if (safeState.performance && safeState.performance[item.id]) {
          subtotal += Number(item.price || 0);
        }
      }
    });

    // 2. 外装
    const extList = safeConfig.exterior || [];
    extList.forEach(item => {
      if (item.type === 'stepper') {
        const qty = Number((safeState.exterior && safeState.exterior[item.id]) || 0);
        if (qty > 0) subtotal += qty * Number(item.price || 0);
      } else if (item.type === 'checkbox') {
        if (safeState.exterior && safeState.exterior[item.id]) {
          subtotal += Number(item.price || 0);
        }
      }
    });

    // 3. NOS / 追加作業
    const repList = safeConfig.repairs || [];
    repList.forEach(item => {
      const qty = Number((safeState.repairs && safeState.repairs[item.id]) || 0);
      if (qty > 0) subtotal += qty * Number(item.price || 0);
    });

    // 4. 販売品
    const itemList = safeConfig.items || [];
    itemList.forEach(item => {
      const qty = Number((safeState.items && safeState.items[item.id]) || 0);
      if (qty > 0) subtotal += qty * Number(item.price || 0);
    });

    // 割引
    const { discountAmount, tagText } = calculateDiscount(subtotal, safeState.discount || {});
    const finalTotal = Math.max(0, subtotal - discountAmount);
    const vaultAmount = calculateVault(finalTotal, vaultRate);

    return {
      subtotal,
      discountAmount,
      discountTagText: tagText,
      finalTotal,
      vaultAmount
    };
  }

  /**
   * カスタムサマリ文字列生成（純粋関数）
   * @param {Object} state
   * @param {Object} config
   * @param {Object} [calculationResult] - 省略時は calculateCustomTotal を呼び出し
   * @param {boolean} [includeOwnCar=false] - 自車モード
   * @returns {string} サマリテキスト
   */
  function generateCustomSummary(state, config, calculationResult = null, includeOwnCar = false) {
    const safeState = state || {};
    const safeConfig = config || {};
    const items = [];

    // 性能
    const perfList = safeConfig.performance || [];
    perfList.forEach(item => {
      if (item.type === 'tiered') {
        const lvl = Number((safeState.performance && safeState.performance[item.id]) || 0);
        if (lvl > 0) {
          const label = (item.labels && item.labels[lvl]) ? item.labels[lvl] : `Lv${lvl}`;
          items.push(`${item.name} ${label}`);
        }
      } else if (item.type === 'checkbox' && safeState.performance && safeState.performance[item.id]) {
        items.push(item.name);
      }
    });

    // 外装
    const extList = safeConfig.exterior || [];
    extList.forEach(item => {
      if (item.type === 'stepper') {
        const qty = Number((safeState.exterior && safeState.exterior[item.id]) || 0);
        if (qty > 0) items.push(`${item.name}x${qty}`);
      } else if (item.type === 'checkbox' && safeState.exterior && safeState.exterior[item.id]) {
        items.push(item.name);
      }
    });

    // NOS
    const repList = safeConfig.repairs || [];
    repList.forEach(item => {
      const qty = Number((safeState.repairs && safeState.repairs[item.id]) || 0);
      if (qty > 0) items.push(`${item.name}x${qty}`);
    });

    // 販売品
    const itemList = safeConfig.items || [];
    itemList.forEach(item => {
      const qty = Number((safeState.items && safeState.items[item.id]) || 0);
      if (qty > 0) items.push(`${item.name}x${qty}`);
    });

    const res = calculationResult || calculateCustomTotal(safeState, safeConfig);
    const itemsStr = items.length > 0 ? items.join(', ') : 'カスタム作業なし';

    if (includeOwnCar) {
      return `自車 ${res.vaultAmount} ${itemsStr}`;
    }
    return `${res.vaultAmount} ${itemsStr} (請求: ¥${res.finalTotal.toLocaleString('ja-JP')})`;
  }

  /**
   * 5. 素材買取計算ロジック（純粋関数）
   * @param {Object} state - { [materialId]: number }
   * @param {Array} materialsConfig - [ { id, name, price, unit }, ... ]
   * @returns {{ itemSubtotals: Object, total: number }}
   */
  function calculateBuybackTotal(state, materialsConfig) {
    const safeState = state || {};
    let total = 0;
    const itemSubtotals = {};
    const list = Array.isArray(materialsConfig) ? materialsConfig : [];

    list.forEach(item => {
      const qty = Number(safeState[item.id] || 0);
      const subtotal = qty > 0 ? qty * Number(item.price || 0) : 0;
      itemSubtotals[item.id] = subtotal;
      total += subtotal;
    });

    return {
      itemSubtotals,
      total: Math.max(0, Math.floor(total || 0))
    };
  }

  /**
   * 素材買取サマリ文字列生成（純粋関数）
   * @param {Object} state
   * @param {Array} materialsConfig
   * @param {number} [total] - 省略時は calculateBuybackTotal を呼び出し
   * @returns {string} サマリテキスト
   */
  function generateBuybackSummary(state, materialsConfig, total = null) {
    const safeState = state || {};
    const items = [];
    const list = Array.isArray(materialsConfig) ? materialsConfig : [];

    list.forEach(item => {
      const qty = Number(safeState[item.id] || 0);
      const unit = item.unit || '個';
      if (qty > 0) {
        items.push(`${item.name}x${qty}${unit}`);
      }
    });

    const finalTotal = total != null ? total : calculateBuybackTotal(safeState, list).total;
    if (items.length === 0) {
      return '買取品なし';
    }
    return `【買取明細】 ${items.join(', ')} (合計: ¥${finalTotal.toLocaleString('ja-JP')})`;
  }

  // API エクスポート
  const CalculatorCore = {
    calculateRepairTotal,
    generateRepairSummary,
    calculateDiscount,
    calculateVault,
    calculateCustomTotal,
    generateCustomSummary,
    calculateBuybackTotal,
    generateBuybackSummary
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = CalculatorCore;
  }
  if (typeof window !== 'undefined') {
    window.CalculatorCore = CalculatorCore;
  }
  if (typeof globalThis !== 'undefined') {
    globalThis.CalculatorCore = CalculatorCore;
  }
})(typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : this);
