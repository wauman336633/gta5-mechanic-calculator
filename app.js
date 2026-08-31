// Renard-Repair Calculator Logic - Repair Page
document.addEventListener('DOMContentLoaded', () => {
  // State Management (Repair Page)
  const state = {
    mode: 'shop', // 'shop' | 'onsite'
    aircraft: false,
    repairs: {}, // id -> boolean or number
    items: {}    // id -> number
  };

  let currentConfig = JSON.parse(JSON.stringify(window.ShopManager ? window.ShopManager.DEFAULT_CUSTOM_CONFIG : {}));

  // DOM Elements
  const btnModeShop = document.getElementById('btnModeShop');
  const btnModeOnsite = document.getElementById('btnModeOnsite');
  const chkAircraft = document.getElementById('chkAircraft');
  const priceAircraft = document.getElementById('priceAircraft');
  const btnResetRepair = document.getElementById('btnResetRepair');
  const modeTag = document.getElementById('modeTag');
  const currentShopNameEl = document.getElementById('currentShopName');

  const repairBaseContainer = document.getElementById('repairBaseContainer');
  const repairExtraContainer = document.getElementById('repairExtraContainer');
  const repairItemsContainer = document.getElementById('repairItemsContainer');

  const repairTotalDisplay = document.getElementById('repairTotalDisplay');
  const btnCopyRepairTotal = document.getElementById('btnCopyRepairTotal');
  const btnCopyRepairSummary = document.getElementById('btnCopyRepairSummary');

  // Helper Format Currency
  function formatJPY(num) {
    return window.AppCommon ? window.AppCommon.formatJPY(num) : ('¥' + Math.floor(num || 0).toLocaleString('ja-JP'));
  }

  // マルチ店舗データの接続・購読
  const shopId = window.ShopManager ? window.ShopManager.getShopId() : 'sample';

  if (window.ShopManager) {
    window.ShopManager.subscribeShopPrices(shopId, (shopInfo) => {
      if (shopInfo && shopInfo.notFound) {
        if (window.AppCommon && window.AppCommon.redirectToNotFound) {
          window.AppCommon.redirectToNotFound(shopId, 'repair');
        } else {
          window.location.replace(`not-found.html?shop=${encodeURIComponent(shopId)}&from=repair`);
        }
        return;
      }
      if (currentShopNameEl) currentShopNameEl.textContent = shopInfo.name;
      if (shopInfo.customConfig) {
        currentConfig = shopInfo.customConfig;
      }
      renderRepairUI();
      calculateTotal();
    });
  }

  // UI動的レンダリング
  function renderRepairUI() {
    renderBaseRepairs();
    renderExtraServices();
    renderRepairItems();
    updateModeTag();
  }

  // 1. 基本修理 ＆ 劣化パーツのレンダリング
  function renderBaseRepairs() {
    if (!repairBaseContainer) return;
    repairBaseContainer.innerHTML = '';

    const baseRepairs = currentConfig.repairs?.baseRepairs || [];
    const degradedParts = currentConfig.repairs?.degradedParts || [];

    // 基本修理（店舗 / 出張 2価格型）
    if (baseRepairs.length > 0) {
      baseRepairs.forEach(item => {
        const checked = !!state.repairs[item.id];
        const price = state.mode === 'onsite' ? Number(item.onsitePrice || 0) : Number(item.shopPrice || 0);
        const escape = (str) => (window.AppCommon ? window.AppCommon.escapeHtml(str) : String(str));
        const safeName = escape(item.name);
        const safeId = escape(item.id);

        const row = document.createElement('div');
        row.className = 'item-row toggle-item';
        // eslint-disable-next-line no-unsanitized/property
        row.innerHTML = `
          <label class="toggle-card" for="chk_${safeId}">
            <input type="checkbox" id="chk_${safeId}" ${checked ? 'checked' : ''}>
            <div class="toggle-content">
              <span class="item-name">${safeName}</span>
              <span class="item-price" id="price_${safeId}">${formatJPY(price)}</span>
            </div>
          </label>
        `;
        repairBaseContainer.appendChild(row);

        const chk = row.querySelector(`#chk_${item.id}`);
        chk.addEventListener('change', (e) => {
          state.repairs[item.id] = e.target.checked;
          // フル修理と部位別修理（engine, body）の排他制御
          if (item.id === 'full' && e.target.checked) {
            ['engine', 'body'].forEach(subId => {
              state.repairs[subId] = false;
              const subChk = document.getElementById(`chk_${subId}`);
              if (subChk) subChk.checked = false;
            });
          } else if ((item.id === 'engine' || item.id === 'body') && e.target.checked) {
            state.repairs['full'] = false;
            const fullChk = document.getElementById('chk_full');
            if (fullChk) fullChk.checked = false;
          }
          calculateTotal();
        });
      });
    }

    // 劣化パーツ交換
    if (degradedParts.length > 0) {
      const divider = document.createElement('div');
      divider.className = 'row-divider';
      divider.textContent = '劣化パーツ交換';
      repairBaseContainer.appendChild(divider);

      degradedParts.forEach(part => {
        const checked = !!state.repairs[part.id];
        const escape = (str) => (window.AppCommon ? window.AppCommon.escapeHtml(str) : String(str));
        const safeName = escape(part.name);
        const safeId = escape(part.id);

        const row = document.createElement('div');
        row.className = 'item-row toggle-item';
        // eslint-disable-next-line no-unsanitized/property
        row.innerHTML = `
          <label class="toggle-card" for="chk_${safeId}">
            <input type="checkbox" id="chk_${safeId}" ${checked ? 'checked' : ''}>
            <div class="toggle-content">
              <span class="item-name">${safeName}</span>
              <span class="item-price price-degraded-part">${formatJPY(part.price)}</span>
            </div>
          </label>
        `;
        repairBaseContainer.appendChild(row);

        const chk = row.querySelector(`#chk_${part.id}`);
        chk.addEventListener('change', (e) => {
          state.repairs[part.id] = e.target.checked;
          calculateTotal();
        });
      });
    }
  }

  // 2. 追加サービス（NOS・タイヤ等）のレンダリング
  function renderExtraServices() {
    if (!repairExtraContainer) return;
    repairExtraContainer.innerHTML = '';

    const extraServices = currentConfig.repairs?.extraServices || [];
    if (extraServices.length === 0) {
      repairExtraContainer.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.85rem; padding: 12px;">追加サービス項目がありません。</p>';
      return;
    }

    extraServices.forEach(item => {
      if (item.id === 'aircraft') {
        // 航空機は上部コントロールバーのchkAircraftに価格を同期
        if (priceAircraft) {
          priceAircraft.textContent = `(+${formatJPY(item.price)})`;
        }
        return;
      }

      if (item.type === 'stepper') {
        const qty = state.repairs[item.id] || 0;
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
            <button class="cnt-btn dec" data-target="cnt_rep_${safeId}">-</button>
            <input type="number" id="cnt_rep_${safeId}" value="${qty}" min="${item.min != null ? item.min : 0}" max="${item.max != null ? item.max : 99}" class="cnt-input">
            <button class="cnt-btn inc" data-target="cnt_rep_${safeId}">+</button>
          </div>
        `;
        repairExtraContainer.appendChild(row);

        const input = row.querySelector(`#cnt_rep_${item.id}`);
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
      } else if (item.type === 'checkbox') {
        const checked = !!state.repairs[item.id];
        const escape = (str) => (window.AppCommon ? window.AppCommon.escapeHtml(str) : String(str));
        const safeName = escape(item.name);
        const safeId = escape(item.id);

        const row = document.createElement('div');
        row.className = 'item-row toggle-item';
        // eslint-disable-next-line no-unsanitized/property
        row.innerHTML = `
          <label class="toggle-card" for="chk_rep_${safeId}">
            <input type="checkbox" id="chk_rep_${safeId}" ${checked ? 'checked' : ''}>
            <div class="toggle-content">
              <span class="item-name">${safeName}</span>
              <span class="item-price">${formatJPY(item.price)}</span>
            </div>
          </label>
        `;
        repairExtraContainer.appendChild(row);

        const chk = row.querySelector(`#chk_rep_${item.id}`);
        chk.addEventListener('change', (e) => {
          state.repairs[item.id] = e.target.checked;
          calculateTotal();
        });
      }
    });
  }

  // 3. 販売品・アクセサリーのレンダリング
  function renderRepairItems() {
    if (!repairItemsContainer) return;
    repairItemsContainer.innerHTML = '';

    const items = currentConfig.repairItems || [];
    if (items.length === 0) {
      repairItemsContainer.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.85rem; padding: 12px;">販売品アイテムがありません。</p>';
      return;
    }

    items.forEach(item => {
      const qty = state.items[item.id] || 0;
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
          <button class="cnt-btn dec" data-target="cnt_item_${safeId}">-</button>
          <input type="number" id="cnt_item_${safeId}" value="${qty}" min="${item.min != null ? item.min : 0}" max="${item.max != null ? item.max : 99}" class="cnt-input">
          <button class="cnt-btn inc" data-target="cnt_item_${safeId}">+</button>
        </div>
      `;
      repairItemsContainer.appendChild(row);

      const input = row.querySelector(`#cnt_item_${item.id}`);
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

  // モード表示の更新
  function updateModeTag() {
    const isShop = state.mode === 'shop';
    if (btnModeShop) btnModeShop.classList.toggle('active', isShop);
    if (btnModeOnsite) btnModeOnsite.classList.toggle('active', !isShop);
    if (modeTag) modeTag.textContent = isShop ? '店内料金適用中' : '出張料金適用中';

    // 基本修理の表示価格を更新
    const baseRepairs = currentConfig.repairs?.baseRepairs || [];
    baseRepairs.forEach(item => {
      const priceEl = document.getElementById(`price_${item.id}`);
      if (priceEl) {
        const price = isShop ? Number(item.shopPrice || 0) : Number(item.onsitePrice || 0);
        priceEl.textContent = formatJPY(price);
      }
    });
  }

  // Calculate Total Amount
  function calculateTotal() {
    const total = window.CalculatorCore
      ? window.CalculatorCore.calculateRepairTotal(state, currentConfig)
      : 0;

    if (repairTotalDisplay) {
      repairTotalDisplay.textContent = formatJPY(total);
    }
    return total;
  }

  // Generate Repair Summary for Clipboard Copy
  function getSummaryText() {
    const total = calculateTotal();
    return window.CalculatorCore
      ? window.CalculatorCore.generateRepairSummary(state, currentConfig, total)
      : '作業なし';
  }

  // Mode Switch Events
  if (btnModeShop) {
    btnModeShop.addEventListener('click', () => {
      state.mode = 'shop';
      updateModeTag();
      calculateTotal();
    });
  }

  if (btnModeOnsite) {
    btnModeOnsite.addEventListener('click', () => {
      state.mode = 'onsite';
      updateModeTag();
      calculateTotal();
    });
  }

  if (chkAircraft) {
    chkAircraft.addEventListener('change', (e) => {
      state.aircraft = e.target.checked;
      calculateTotal();
    });
  }

  // Copy Actions
  if (btnCopyRepairTotal) {
    btnCopyRepairTotal.addEventListener('click', () => {
      const total = calculateTotal();
      const str = total.toString();
      if (window.AppCommon) {
        window.AppCommon.copyToClipboard(str, `修理合計額 「 ${str} 」 をコピーしました！`);
      }
    });
  }

  if (btnCopyRepairSummary) {
    btnCopyRepairSummary.addEventListener('click', () => {
      const summary = getSummaryText();
      if (window.AppCommon) {
        window.AppCommon.copyToClipboard(summary, `「 ${summary} 」 をコピーしました！`);
      }
    });
  }

  // Reset Button
  if (btnResetRepair) {
    btnResetRepair.addEventListener('click', () => {
      state.aircraft = false;
      if (chkAircraft) chkAircraft.checked = false;

      state.repairs = {};
      state.items = {};

      renderRepairUI();
      calculateTotal();

      if (window.AppCommon) {
        window.AppCommon.showToast('すべての選択をリセットしました');
      }
    });
  }
});
