// Renard-Repair Calculator Logic - Custom Page Only
document.addEventListener('DOMContentLoaded', () => {
  // State Management (Custom Page)
  const state = {
    performance: {}, // id -> level (number) or checked (boolean)
    exterior: {},    // id -> qty (number) or checked (boolean)
    repairs: {},     // id -> qty (number) or checked (boolean)
    items: {},       // id -> qty (number)
    discount: {
      preset: 0, // 0 | 30 | 50 | 70 (%)
      customType: 'none',
      customValue: 0
    }
  };

  let currentConfig = JSON.parse(JSON.stringify(window.ShopManager ? window.ShopManager.DEFAULT_CUSTOM_CONFIG.custom : {}));

  // DOM Elements
  const currentShopNameEl = document.getElementById('currentShopName');
  const btnResetCustom = document.getElementById('btnResetCustom');

  const customPerformanceContainer = document.getElementById('customPerformanceContainer');
  const customExteriorContainer = document.getElementById('customExteriorContainer');
  const customRepairsContainer = document.getElementById('customRepairsContainer');
  const customItemsContainer = document.getElementById('customItemsContainer');

  const subtotalDisplay = document.getElementById('subtotalDisplay');
  const discountTagDisplay = document.getElementById('discountTagDisplay');
  const totalDisplay = document.getElementById('totalDisplay');
  const vaultDisplay = document.getElementById('vaultDisplay');

  const btnCopyNumber = document.getElementById('btnCopyNumber');
  const btnCopyVault = document.getElementById('btnCopyVault');
  const btnCopyVaultSummary = document.getElementById('btnCopyVaultSummary');
  const btnCopyOwnCar = document.getElementById('btnCopyOwnCar');

  // 割引関連DOM
  const discountButtons = [
    { btn: document.getElementById('btnDisc3'), val: 30 },
    { btn: document.getElementById('btnDisc5'), val: 50 },
    { btn: document.getElementById('btnDisc7'), val: 70 }
  ];
  const customDiscountType = document.getElementById('customDiscountType');
  const customDiscountVal = document.getElementById('customDiscountVal');

  // Helper Format Currency
  function formatJPY(num) {
    return window.AppCommon ? window.AppCommon.formatJPY(num) : ('¥' + Math.floor(num || 0).toLocaleString('ja-JP'));
  }

  function formatShortPrice(num) {
    return window.AppCommon && window.AppCommon.formatShortPrice ? window.AppCommon.formatShortPrice(num) : formatJPY(num);
  }

  // マルチ店舗データの接続・購読
  const shopId = window.ShopManager ? window.ShopManager.getShopId() : 'sample';

  if (window.ShopManager) {
    window.ShopManager.subscribeShopPrices(shopId, (shopInfo) => {
      if (shopInfo && shopInfo.notFound) {
        if (window.AppCommon && window.AppCommon.redirectToNotFound) {
          window.AppCommon.redirectToNotFound(shopId, 'custom');
        } else {
          window.location.replace(`not-found.html?shop=${encodeURIComponent(shopId)}&from=custom`);
        }
        return;
      }
      if (currentShopNameEl) currentShopNameEl.textContent = shopInfo.name;
      if (shopInfo.customConfig && shopInfo.customConfig.custom) {
        currentConfig = shopInfo.customConfig.custom;
      }
      renderCustomUI();
      calculateTotal();
    });
  }

  // UI動的レンダリング
  function renderCustomUI() {
    renderPerformance();
    renderExterior();
    renderRepairs();
    renderItems();
  }

  // 1. 性能カスタムのレンダリング
  function renderPerformance() {
    if (!customPerformanceContainer) return;
    customPerformanceContainer.innerHTML = '';

    const list = currentConfig.performance || [];
    if (list.length === 0) {
      customPerformanceContainer.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.85rem; padding: 12px;">性能項目がありません。</p>';
      return;
    }

    list.forEach(item => {
      if (item.type === 'tiered') {
        const currentLevel = Number(state.performance[item.id] || 0);
        const prices = Array.isArray(item.prices) ? item.prices : [];
        const currentPrice = prices[currentLevel] || 0;

        const group = document.createElement('div');
        const escape = (str) => (window.AppCommon ? window.AppCommon.escapeHtml(str) : String(str));
        const safeName = escape(item.name);
        const safeId = escape(item.id);

        let buttonsHtml = '';
        for (let lvl = 1; lvl < prices.length; lvl++) {
          const p = prices[lvl];
          const isActive = currentLevel === lvl ? 'active' : '';
          const rawLabel = (item.labels && item.labels[lvl]) ? item.labels[lvl] : `Lv${lvl}`;
          const label = escape(rawLabel);
          buttonsHtml += `<button class="lvl-btn ${isActive}" data-level="${lvl}" data-price="${p}">${label} <small>${formatShortPrice(p)}</small></button>`;
        }

        // eslint-disable-next-line no-unsanitized/property
        group.innerHTML = `
          <div class="level-header">
            <span class="item-name">${safeName}</span>
            <span class="level-selected-price" id="price_perf_${safeId}">${currentLevel > 0 ? formatJPY(currentPrice) : '未選択'}</span>
          </div>
          <div class="level-buttons" id="lvl_${safeId}">
            ${buttonsHtml}
          </div>
        `;
        customPerformanceContainer.appendChild(group);

        const btnContainer = group.querySelector(`#lvl_${item.id}`);
        const display = group.querySelector(`#price_perf_${item.id}`);
        btnContainer.querySelectorAll('.lvl-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const lvl = parseInt(btn.getAttribute('data-level'), 10);
            const isAlreadyActive = btn.classList.contains('active');
            btnContainer.querySelectorAll('.lvl-btn').forEach(b => b.classList.remove('active'));

            if (isAlreadyActive) {
              state.performance[item.id] = 0;
              display.textContent = '未選択';
            } else {
              btn.classList.add('active');
              state.performance[item.id] = lvl;
              display.textContent = formatJPY(prices[lvl]);
            }
            calculateTotal();
          });
        });
      } else if (item.type === 'checkbox') {
        const checked = !!state.performance[item.id];
        const escape = (str) => (window.AppCommon ? window.AppCommon.escapeHtml(str) : String(str));
        const safeName = escape(item.name);
        const safeId = escape(item.id);

        const row = document.createElement('div');
        row.className = 'item-row toggle-item';
        // eslint-disable-next-line no-unsanitized/property
        row.innerHTML = `
          <label class="toggle-card" for="chk_perf_${safeId}">
            <input type="checkbox" id="chk_perf_${safeId}" ${checked ? 'checked' : ''}>
            <div class="toggle-content">
              <span class="item-name">${safeName}</span>
              <span class="item-price">${formatJPY(item.price)}</span>
            </div>
          </label>
        `;
        customPerformanceContainer.appendChild(row);

        const chk = row.querySelector(`#chk_perf_${item.id}`);
        chk.addEventListener('change', (e) => {
          state.performance[item.id] = e.target.checked;
          calculateTotal();
        });
      }
    });
  }

  // 2. 外装カスタムのレンダリング
  function renderExterior() {
    if (!customExteriorContainer) return;
    customExteriorContainer.innerHTML = '';

    const list = currentConfig.exterior || [];
    if (list.length === 0) {
      customExteriorContainer.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.85rem; padding: 12px;">外装項目がありません。</p>';
      return;
    }

    list.forEach(item => {
      if (item.type === 'stepper') {
        const qty = Number(state.exterior[item.id] || 0);
        const escape = (str) => (window.AppCommon ? window.AppCommon.escapeHtml(str) : String(str));
        const safeName = escape(item.name);
        const safeId = escape(item.id);

        const row = document.createElement('div');
        row.className = 'item-row counter-item';
        // eslint-disable-next-line no-unsanitized/property
        row.innerHTML = `
          <div class="counter-info">
            <span class="item-name">${safeName}</span>
            <span class="item-unit-price">${formatJPY(item.price)}</span>
          </div>
          <div class="counter-controls">
            <button class="cnt-btn dec" data-target="cnt_ext_${safeId}">-</button>
            <input type="number" id="cnt_ext_${safeId}" value="${qty}" min="${item.min != null ? item.min : 0}" max="${item.max != null ? item.max : 99}" class="cnt-input">
            <button class="cnt-btn inc" data-target="cnt_ext_${safeId}">+</button>
          </div>
        `;
        customExteriorContainer.appendChild(row);

        const input = row.querySelector(`#cnt_ext_${item.id}`);
        input.addEventListener('focus', () => input.select());
        input.addEventListener('input', () => {
          let v = parseInt(input.value, 10);
          const min = item.min != null ? item.min : 0;
          const max = item.max != null ? item.max : 99;
          if (isNaN(v) || v < min) v = min;
          if (v > max) v = max;
          state.exterior[item.id] = v;
          calculateTotal();
        });

        row.querySelectorAll('.cnt-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const isInc = btn.classList.contains('inc');
            let v = parseInt(input.value, 10) || 0;
            const min = item.min != null ? item.min : 0;
            const max = item.max != null ? item.max : 99;
            if (isInc && v < max) v++;
            if (!isInc && v > min) v--;
            input.value = v;
            state.exterior[item.id] = v;
            calculateTotal();
          });
        });
      } else if (item.type === 'checkbox') {
        const checked = !!state.exterior[item.id];
        const escape = (str) => (window.AppCommon ? window.AppCommon.escapeHtml(str) : String(str));
        const safeName = escape(item.name);
        const safeId = escape(item.id);

        const row = document.createElement('div');
        row.className = 'item-row toggle-item';
        // eslint-disable-next-line no-unsanitized/property
        row.innerHTML = `
          <label class="toggle-card" for="chk_ext_${safeId}">
            <input type="checkbox" id="chk_ext_${safeId}" ${checked ? 'checked' : ''}>
            <div class="toggle-content">
              <span class="item-name">${safeName}</span>
              <span class="item-price">${formatJPY(item.price)}</span>
            </div>
          </label>
        `;
        customExteriorContainer.appendChild(row);

        const chk = row.querySelector(`#chk_ext_${item.id}`);
        chk.addEventListener('change', (e) => {
          state.exterior[item.id] = e.target.checked;
          calculateTotal();
        });
      }
    });
  }

  // 3. NOS / 追加作業のレンダリング
  function renderRepairs() {
    if (!customRepairsContainer) return;
    customRepairsContainer.innerHTML = '';

    const list = currentConfig.repairs || [];
    if (list.length === 0) {
      customRepairsContainer.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.85rem; padding: 12px;">NOS項目がありません。</p>';
      return;
    }

    list.forEach(item => {
      const qty = Number(state.repairs[item.id] || 0);
      const escape = (str) => (window.AppCommon ? window.AppCommon.escapeHtml(str) : String(str));
      const safeName = escape(item.name);
      const safeId = escape(item.id);

      const row = document.createElement('div');
      row.className = 'item-row counter-item';
      // eslint-disable-next-line no-unsanitized/property
      row.innerHTML = `
        <div class="counter-info">
          <span class="item-name">${safeName}</span>
          <span class="item-unit-price">${formatJPY(item.price)}</span>
        </div>
        <div class="counter-controls">
          <button class="cnt-btn dec" data-target="cnt_cust_rep_${safeId}">-</button>
          <input type="number" id="cnt_cust_rep_${safeId}" value="${qty}" min="${item.min != null ? item.min : 0}" max="${item.max != null ? item.max : 99}" class="cnt-input">
          <button class="cnt-btn inc" data-target="cnt_cust_rep_${safeId}">+</button>
        </div>
      `;
      customRepairsContainer.appendChild(row);

      const input = row.querySelector(`#cnt_cust_rep_${item.id}`);
      input.addEventListener('focus', () => input.select());
      input.addEventListener('input', () => {
        let v = parseInt(input.value, 10);
        const min = item.min != null ? item.min : 0;
        const max = item.max != null ? item.max : 99;
        if (isNaN(v) || v < min) v = min;
        if (v > max) v = max;
        state.repairs[item.id] = v;
        calculateTotal();
      });

      row.querySelectorAll('.cnt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const isInc = btn.classList.contains('inc');
          let v = parseInt(input.value, 10) || 0;
          const min = item.min != null ? item.min : 0;
          const max = item.max != null ? item.max : 99;
          if (isInc && v < max) v++;
          if (!isInc && v > min) v--;
          input.value = v;
          state.repairs[item.id] = v;
          calculateTotal();
        });
      });
    });
  }

  // 4. 販売品アイテムのレンダリング
  function renderItems() {
    if (!customItemsContainer) return;
    customItemsContainer.innerHTML = '';

    const list = currentConfig.items || [];
    if (list.length === 0) {
      customItemsContainer.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.85rem; padding: 12px;">販売品アイテムがありません。</p>';
      return;
    }

    list.forEach(item => {
      const qty = Number(state.items[item.id] || 0);
      const escape = (str) => (window.AppCommon ? window.AppCommon.escapeHtml(str) : String(str));
      const safeName = escape(item.name);
      const safeId = escape(item.id);

      const row = document.createElement('div');
      row.className = 'item-row counter-item';
      // eslint-disable-next-line no-unsanitized/property
      row.innerHTML = `
        <div class="counter-info">
          <span class="item-name">${safeName}</span>
          <span class="item-unit-price">${formatJPY(item.price)}</span>
        </div>
        <div class="counter-controls">
          <button class="cnt-btn dec" data-target="cnt_cust_item_${safeId}">-</button>
          <input type="number" id="cnt_cust_item_${safeId}" value="${qty}" min="${item.min != null ? item.min : 0}" max="${item.max != null ? item.max : 99}" class="cnt-input">
          <button class="cnt-btn inc" data-target="cnt_cust_item_${safeId}">+</button>
        </div>
      `;
      customItemsContainer.appendChild(row);

      const input = row.querySelector(`#cnt_cust_item_${item.id}`);
      input.addEventListener('focus', () => input.select());
      input.addEventListener('input', () => {
        let v = parseInt(input.value, 10);
        const min = item.min != null ? item.min : 0;
        const max = item.max != null ? item.max : 99;
        if (isNaN(v) || v < min) v = min;
        if (v > max) v = max;
        state.items[item.id] = v;
        calculateTotal();
      });

      row.querySelectorAll('.cnt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const isInc = btn.classList.contains('inc');
          let v = parseInt(input.value, 10) || 0;
          const min = item.min != null ? item.min : 0;
          const max = item.max != null ? item.max : 99;
          if (isInc && v < max) v++;
          if (!isInc && v > min) v--;
          input.value = v;
          state.items[item.id] = v;
          calculateTotal();
        });
      });
    });
  }

  // 割引ボタン制御
  discountButtons.forEach(({ btn, val }) => {
    if (!btn) return;
    btn.addEventListener('click', () => {
      if (state.discount.preset === val) {
        state.discount.preset = 0;
        btn.classList.remove('active');
      } else {
        state.discount.preset = val;
        discountButtons.forEach(b => b.btn?.classList.remove('active'));
        btn.classList.add('active');
        // 手動割引をリセット
        state.discount.customType = 'none';
        state.discount.customValue = 0;
        if (customDiscountType) customDiscountType.value = 'none';
        if (customDiscountVal) {
          customDiscountVal.value = 0;
          customDiscountVal.disabled = true;
        }
      }
      calculateTotal();
    });
  });

  if (customDiscountType) {
    customDiscountType.addEventListener('change', (e) => {
      const type = e.target.value;
      state.discount.customType = type;
      if (type === 'none') {
        if (customDiscountVal) {
          customDiscountVal.value = 0;
          customDiscountVal.disabled = true;
        }
        state.discount.customValue = 0;
      } else {
        if (customDiscountVal) customDiscountVal.disabled = false;
        // プリセットをオフ
        state.discount.preset = 0;
        discountButtons.forEach(b => b.btn?.classList.remove('active'));
      }
      calculateTotal();
    });
  }

  if (customDiscountVal) {
    customDiscountVal.addEventListener('input', (e) => {
      let val = parseInt(e.target.value, 10) || 0;
      if (val < 0) val = 0;
      state.discount.customValue = val;
      calculateTotal();
    });
  }

  // Calculate Total & Discount & Vault
  function calculateTotal() {
    let subtotal = 0;

    // 1. 性能パーツ
    const perfList = currentConfig.performance || [];
    perfList.forEach(item => {
      if (item.type === 'tiered') {
        const lvl = Number(state.performance[item.id] || 0);
        if (lvl > 0 && Array.isArray(item.prices) && item.prices[lvl] != null) {
          subtotal += Number(item.prices[lvl]);
        }
      } else if (item.type === 'checkbox') {
        if (state.performance[item.id]) {
          subtotal += Number(item.price || 0);
        }
      }
    });

    // 2. 外装
    const extList = currentConfig.exterior || [];
    extList.forEach(item => {
      if (item.type === 'stepper') {
        const qty = Number(state.exterior[item.id] || 0);
        subtotal += qty * Number(item.price || 0);
      } else if (item.type === 'checkbox') {
        if (state.exterior[item.id]) {
          subtotal += Number(item.price || 0);
        }
      }
    });

    // 3. NOS / 追加作業
    const repList = currentConfig.repairs || [];
    repList.forEach(item => {
      const qty = Number(state.repairs[item.id] || 0);
      subtotal += qty * Number(item.price || 0);
    });

    // 4. 販売品
    const itemList = currentConfig.items || [];
    itemList.forEach(item => {
      const qty = Number(state.items[item.id] || 0);
      subtotal += qty * Number(item.price || 0);
    });

    // 割引計算
    let discountAmount = 0;
    let discountTagText = '';

    if (state.discount.preset > 0) {
      discountAmount = Math.floor(subtotal * (state.discount.preset / 100));
      discountTagText = `${state.discount.preset}% OFF 適用中`;
    } else if (state.discount.customType === 'percent') {
      const p = Math.min(100, Math.max(0, state.discount.customValue));
      discountAmount = Math.floor(subtotal * (p / 100));
      discountTagText = `${p}% OFF 適用中`;
    } else if (state.discount.customType === 'fixed') {
      discountAmount = Math.min(subtotal, state.discount.customValue);
      discountTagText = `-${formatJPY(discountAmount)} 適用中`;
    }

    const finalTotal = Math.max(0, subtotal - discountAmount);
    const vaultAmount = Math.floor(finalTotal * 0.3);

    // UI表示更新
    if (subtotalDisplay) subtotalDisplay.textContent = formatJPY(subtotal);
    if (discountTagDisplay) {
      if (discountTagText) {
        discountTagDisplay.textContent = discountTagText;
        discountTagDisplay.classList.remove('hidden');
      } else {
        discountTagDisplay.classList.add('hidden');
      }
    }
    if (totalDisplay) totalDisplay.textContent = formatJPY(finalTotal);
    if (vaultDisplay) vaultDisplay.textContent = formatJPY(vaultAmount);

    return { subtotal, discountAmount, finalTotal, vaultAmount };
  }

  // Generate Summary Text for Clipboard Copy
  function getSummaryText(includeOwnCar = false) {
    const items = [];

    // 性能
    const perfList = currentConfig.performance || [];
    perfList.forEach(item => {
      if (item.type === 'tiered') {
        const lvl = Number(state.performance[item.id] || 0);
        if (lvl > 0) {
          const label = (item.labels && item.labels[lvl]) ? item.labels[lvl] : `Lv${lvl}`;
          items.push(`${item.name} ${label}`);
        }
      } else if (item.type === 'checkbox' && state.performance[item.id]) {
        items.push(item.name);
      }
    });

    // 外装
    const extList = currentConfig.exterior || [];
    extList.forEach(item => {
      if (item.type === 'stepper') {
        const qty = Number(state.exterior[item.id] || 0);
        if (qty > 0) items.push(`${item.name}x${qty}`);
      } else if (item.type === 'checkbox' && state.exterior[item.id]) {
        items.push(item.name);
      }
    });

    // NOS
    const repList = currentConfig.repairs || [];
    repList.forEach(item => {
      const qty = Number(state.repairs[item.id] || 0);
      if (qty > 0) items.push(`${item.name}x${qty}`);
    });

    // 販売品
    const itemList = currentConfig.items || [];
    itemList.forEach(item => {
      const qty = Number(state.items[item.id] || 0);
      if (qty > 0) items.push(`${item.name}x${qty}`);
    });

    const { finalTotal, vaultAmount } = calculateTotal();
    const itemsStr = items.length > 0 ? items.join(', ') : 'カスタム作業なし';

    if (includeOwnCar) {
      return `自車 ${vaultAmount} ${itemsStr}`;
    }
    return `${vaultAmount} ${itemsStr} (請求: ¥${finalTotal.toLocaleString('ja-JP')})`;
  }

  // Copy Actions
  if (btnCopyNumber) {
    btnCopyNumber.addEventListener('click', () => {
      const { finalTotal } = calculateTotal();
      const str = finalTotal.toString();
      if (window.AppCommon) {
        window.AppCommon.copyToClipboard(str, `請求額 「 ${str} 」 をコピーしました！`);
      }
    });
  }

  if (btnCopyVault) {
    btnCopyVault.addEventListener('click', () => {
      const { vaultAmount } = calculateTotal();
      const str = vaultAmount.toString();
      if (window.AppCommon) {
        window.AppCommon.copyToClipboard(str, `金庫額 「 ${str} 」 をコピーしました！`);
      }
    });
  }

  if (btnCopyVaultSummary) {
    btnCopyVaultSummary.addEventListener('click', () => {
      const summary = getSummaryText(false);
      if (window.AppCommon) {
        window.AppCommon.copyToClipboard(summary, `「 ${summary} 」 をコピーしました！`);
      }
    });
  }

  if (btnCopyOwnCar) {
    btnCopyOwnCar.addEventListener('click', () => {
      const summary = getSummaryText(true);
      if (window.AppCommon) {
        window.AppCommon.copyToClipboard(summary, `「 ${summary} 」 をコピーしました！`);
      }
    });
  }

  // Reset Button
  if (btnResetCustom) {
    btnResetCustom.addEventListener('click', () => {
      state.performance = {};
      state.exterior = {};
      state.repairs = {};
      state.items = {};
      state.discount.preset = 0;
      state.discount.customType = 'none';
      state.discount.customValue = 0;

      discountButtons.forEach(b => b.btn?.classList.remove('active'));
      if (customDiscountType) customDiscountType.value = 'none';
      if (customDiscountVal) {
        customDiscountVal.value = 0;
        customDiscountVal.disabled = true;
      }

      renderCustomUI();
      calculateTotal();

      if (window.AppCommon) {
        window.AppCommon.showToast('すべての選択をリセットしました');
      }
    });
  }
});
