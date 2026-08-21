// Renard-Repair Material Buyback Calculator Logic
document.addEventListener('DOMContentLoaded', () => {
  // Material Price Definitions (Dynamic Shop Prices)
  let PRICES = JSON.parse(JSON.stringify(window.ShopManager ? window.ShopManager.DEFAULT_PRICES.buyback : {
    Steel: 1500, Iron: 1500, Scrap: 300, Plastic: 500, Aluminum: 1000, Rubber: 500, Glass: 500, Copper: 500
  }));

  // State Management
  const state = {
    Steel: 0, Iron: 0, Scrap: 0, Plastic: 0, Aluminum: 0, Rubber: 0, Glass: 0, Copper: 0
  };

  // DOM Mapping
  const materials = [
    { key: 'Steel', inputId: 'cntSteel', subtotalId: 'subtotalSteel', name: 'スチール' },
    { key: 'Iron', inputId: 'cntIron', subtotalId: 'subtotalIron', name: '鉄' },
    { key: 'Scrap', inputId: 'cntScrap', subtotalId: 'subtotalScrap', name: '金属スクラップ' },
    { key: 'Plastic', inputId: 'cntPlastic', subtotalId: 'subtotalPlastic', name: 'プラスチック' },
    { key: 'Aluminum', inputId: 'cntAluminum', subtotalId: 'subtotalAluminum', name: 'アルミニウム' },
    { key: 'Rubber', inputId: 'cntRubber', subtotalId: 'subtotalRubber', name: 'ゴム' },
    { key: 'Glass', inputId: 'cntGlass', subtotalId: 'subtotalGlass', name: 'ガラス' },
    { key: 'Copper', inputId: 'cntCopper', subtotalId: 'subtotalCopper', name: '銅' }
  ];

  // マルチ店舗データの接続・購読
  const shopId = window.ShopManager ? window.ShopManager.getShopId() : 'sample';
  const currentShopNameEl = document.getElementById('currentShopName');

  if (window.ShopManager) {
    window.ShopManager.subscribeShopPrices(shopId, (shopInfo) => {
      if (currentShopNameEl) currentShopNameEl.textContent = shopInfo.name;
      if (shopInfo.prices && shopInfo.prices.buyback) {
        PRICES = shopInfo.prices.buyback;
        updateUnitPriceLabels();
        calculateTotal();
      }
    });
  }

  function updateUnitPriceLabels() {
    const cards = document.querySelectorAll('.material-card');
    cards.forEach(card => {
      const nameEl = card.querySelector('.material-name');
      const unitEl = card.querySelector('.material-unit-price');
      if (nameEl && unitEl) {
        const item = materials.find(m => m.name === nameEl.textContent.trim());
        if (item && PRICES[item.key] !== undefined) {
          unitEl.textContent = `¥${PRICES[item.key].toLocaleString('ja-JP')} / 個`;
        }
      }
    });
  }

  const buybackTotalDisplay = document.getElementById('buybackTotalDisplay');
  const btnCopyBuybackTotal = document.getElementById('btnCopyBuybackTotal');
  const btnCopyBuybackSummary = document.getElementById('btnCopyBuybackSummary');
  const btnResetBuyback = document.getElementById('btnResetBuyback');
  
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');

  // Helper: Format Currency
  function formatJPY(num) {
    return window.AppCommon ? window.AppCommon.formatJPY(num) : ('¥' + Math.floor(num).toLocaleString('ja-JP'));
  }

  // Calculate Total Buyback Amount
  function calculateTotal() {
    let total = 0;

    materials.forEach(item => {
      const qty = state[item.key] || 0;
      const subtotal = qty * PRICES[item.key];
      total += subtotal;

      const subDisplay = document.getElementById(item.subtotalId);
      if (subDisplay) {
        subDisplay.textContent = formatJPY(subtotal);
      }
    });

    buybackTotalDisplay.textContent = formatJPY(total);
    return total;
  }

  // Generate Summary Text for Clipboard Copy
  function getSummaryText() {
    const items = [];
    materials.forEach(item => {
      const qty = state[item.key] || 0;
      if (qty > 0) {
        items.push(`${item.name}x${qty}`);
      }
    });

    const total = calculateTotal();
    if (items.length === 0) {
      return '買取品なし';
    }
    return `【買取明細】 ${items.join(', ')} (合計: ¥${total.toLocaleString('ja-JP')})`;
  }

  // Toast Function
  function showToast(message) {
    if (window.AppCommon) window.AppCommon.showToast(message);
  }

  // Clipboard Helper
  function copyToClipboard(text, successMsg) {
    if (window.AppCommon) {
      window.AppCommon.copyToClipboard(text, successMsg);
    }
  }


  // Input & Counter Event Registrations
  materials.forEach(item => {
    const input = document.getElementById(item.inputId);
    if (input) {
      // Auto select all on focus for fast keying
      input.addEventListener('focus', () => input.select());

      const handleInputChange = () => {
        let val = parseInt(input.value, 10);
        const min = parseInt(input.min, 10) || 0;
        const max = parseInt(input.max, 10) || 9999;

        if (isNaN(val) || val < min) val = min;
        if (val > max) val = max;

        state[item.key] = val;
        calculateTotal();
      };

      input.addEventListener('input', handleInputChange);
      input.addEventListener('change', () => {
        if (input.value === '') input.value = 0;
        handleInputChange();
      });
    }
  });

  // Inc / Dec Buttons
  document.querySelectorAll('.cnt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;

      const isInc = btn.classList.contains('inc');
      let val = parseInt(input.value, 10) || 0;
      const min = parseInt(input.min, 10) || 0;
      const max = parseInt(input.max, 10) || 9999;

      if (isInc && val < max) val++;
      if (!isInc && val > min) val--;

      input.value = val;

      // Find matching material key
      const mat = materials.find(m => m.inputId === targetId);
      if (mat) {
        state[mat.key] = val;
        calculateTotal();
      }
    });
  });

  // Per-item Quantity Copy Action Listener
  document.querySelectorAll('.btn-copy-qty').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const name = btn.getAttribute('data-name');
      const input = document.getElementById(targetId);
      const val = input ? (parseInt(input.value, 10) || 0) : 0;

      const str = val.toString();
      copyToClipboard(str, `${name}の個数 「 ${str} 」 をコピーしました！`);
    });
  });

  // Copy Actions
  btnCopyBuybackTotal.addEventListener('click', () => {
    const total = calculateTotal();
    const str = total.toString();
    copyToClipboard(str, `買取合計額 「 ${str} 」 をコピーしました！`);
  });

  btnCopyBuybackSummary.addEventListener('click', () => {
    const summary = getSummaryText();
    copyToClipboard(summary, `「 ${summary} 」 をコピーしました！`);
  });

  // Reset Button
  btnResetBuyback.addEventListener('click', () => {
    materials.forEach(item => {
      state[item.key] = 0;
      const input = document.getElementById(item.inputId);
      if (input) input.value = 0;
    });

    calculateTotal();
    showToast('すべての数量をリセットしました');
  });

  // Initial Calculation & Labels
  updateUnitPriceLabels();
  calculateTotal();
});
