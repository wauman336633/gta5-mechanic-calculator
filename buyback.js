// Renard-Repair Material Buyback Calculator Logic
document.addEventListener('DOMContentLoaded', () => {
  // State Management
  const state = {};
  let customMaterials = [];

  // DOM Elements
  const buybackGrid = document.getElementById('buybackGrid');
  const buybackTotalDisplay = document.getElementById('buybackTotalDisplay');
  const btnCopyBuybackTotal = document.getElementById('btnCopyBuybackTotal');
  const btnCopyBuybackSummary = document.getElementById('btnCopyBuybackSummary');
  const btnResetBuyback = document.getElementById('btnResetBuyback');
  const currentShopNameEl = document.getElementById('currentShopName');

  // アイコン推測辞書
  const ICON_MAP = {
    Steel: '🔩',
    Iron: '⚙️',
    Scrap: '🗑️',
    Plastic: '🧪',
    Aluminum: '🪨',
    Rubber: '🛞',
    Glass: '🪟',
    Copper: '🥉',
    Gold: '🥇',
    Silver: '🥈',
    Titanium: '🛡️',
    Cloth: '🧵',
    Leather: '👞',
    Carbon: '⬛'
  };

  function getIconForMaterial(item) {
    if (item.icon) return item.icon;
    if (ICON_MAP[item.id]) return ICON_MAP[item.id];
    // 名前に含まれるキーワードから推測
    const n = item.name.toLowerCase();
    if (n.includes('鉄') || n.includes('iron')) return '⚙️';
    if (n.includes('スチール') || n.includes('steel')) return '🔩';
    if (n.includes('スクラップ') || n.includes('scrap')) return '🗑️';
    if (n.includes('プラ') || n.includes('plastic')) return '🧪';
    if (n.includes('アルミ') || n.includes('aluminum')) return '🪨';
    if (n.includes('ゴム') || n.includes('rubber')) return '🛞';
    if (n.includes('ガラス') || n.includes('glass')) return '🪟';
    if (n.includes('銅') || n.includes('copper')) return '🥉';
    if (n.includes('金') || n.includes('gold')) return '🥇';
    if (n.includes('銀') || n.includes('silver')) return '🥈';
    if (n.includes('チタン') || n.includes('titanium')) return '🛡️';
    return '📦';
  }

  // Helper: Format Currency
  function formatJPY(num) {
    return window.AppCommon ? window.AppCommon.formatJPY(num) : ('¥' + Math.floor(num || 0).toLocaleString('ja-JP'));
  }

  // マルチ店舗データの接続・購読
  const shopId = window.ShopManager ? window.ShopManager.getShopId() : 'sample';

  if (window.ShopManager) {
    window.ShopManager.subscribeShopPrices(shopId, (shopInfo) => {
      if (currentShopNameEl) currentShopNameEl.textContent = shopInfo.name;
      
      const config = shopInfo.customConfig || window.ShopManager.DEFAULT_CUSTOM_CONFIG;
      customMaterials = Array.isArray(config.buyback) ? config.buyback : window.ShopManager.DEFAULT_CUSTOM_CONFIG.buyback;

      // 状態のキーを初期化（未設定なら0）
      customMaterials.forEach(item => {
        if (state[item.id] === undefined) {
          state[item.id] = 0;
        }
      });

      renderBuybackGrid();
      calculateTotal();
    });
  }

  // グリッドの動的レンダリング
  function renderBuybackGrid() {
    if (!buybackGrid) return;
    buybackGrid.innerHTML = '';

    if (customMaterials.length === 0) {
      buybackGrid.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1 / -1; text-align: center; padding: 24px;">登録されている素材項目がありません。設定画面から追加してください。</p>';
      return;
    }

    customMaterials.forEach(item => {
      const escape = (str) => (window.AppCommon ? window.AppCommon.escapeHtml(str) : String(str));
      const icon = escape(getIconForMaterial(item));
      const unit = escape(item.unit || '個');
      const safeName = escape(item.name);
      const safeId = escape(item.id);
      const qty = state[item.id] || 0;
      const subtotal = qty * Number(item.price || 0);

      const card = document.createElement('div');
      card.className = 'material-card';
      card.dataset.id = item.id;
      // eslint-disable-next-line no-unsanitized/property
      card.innerHTML = `
        <div class="material-icon">${icon}</div>
        <div class="material-info">
          <span class="material-name">${safeName}</span>
          <span class="material-unit-price">${formatJPY(item.price)} / ${unit}</span>
        </div>
        <div class="counter-controls">
          <button class="cnt-btn dec" data-target="cnt_${safeId}">-</button>
          <input type="number" id="cnt_${safeId}" value="${qty}" min="${item.min != null ? item.min : 0}" max="${item.max != null ? item.max : 99999}" class="cnt-input buyback-input">
          <button class="cnt-btn inc" data-target="cnt_${safeId}">+</button>
        </div>
        <button class="btn-copy-qty" data-target="cnt_${safeId}" data-name="${safeName}" title="${safeName}の個数のみコピー">
          <span class="btn-icon">📋</span>
        </button>
        <div class="material-subtotal" id="subtotal_${safeId}">${formatJPY(subtotal)}</div>
      `;

      buybackGrid.appendChild(card);
    });

    bindEvents();
  }

  // イベントバインド
  function bindEvents() {
    customMaterials.forEach(item => {
      const input = document.getElementById(`cnt_${item.id}`);
      if (input) {
        input.addEventListener('focus', () => input.select());
        
        const handleInputChange = () => {
          let val = parseInt(input.value, 10);
          const min = item.min != null ? item.min : 0;
          const max = item.max != null ? item.max : 99999;

          if (isNaN(val) || val < min) val = min;
          if (val > max) val = max;

          state[item.id] = val;
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
    buybackGrid.querySelectorAll('.cnt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const input = document.getElementById(targetId);
        if (!input) return;

        const itemId = targetId.replace('cnt_', '');
        const item = customMaterials.find(m => m.id === itemId);
        const min = (item && item.min != null) ? item.min : 0;
        const max = (item && item.max != null) ? item.max : 99999;

        const isInc = btn.classList.contains('inc');
        let val = parseInt(input.value, 10) || 0;

        if (isInc && val < max) val++;
        if (!isInc && val > min) val--;

        input.value = val;
        state[itemId] = val;
        calculateTotal();
      });
    });

    // 個数コピー
    buybackGrid.querySelectorAll('.btn-copy-qty').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const name = btn.getAttribute('data-name');
        const input = document.getElementById(targetId);
        const val = input ? (parseInt(input.value, 10) || 0) : 0;

        const str = val.toString();
        if (window.AppCommon) {
          window.AppCommon.copyToClipboard(str, `${name}の個数 「 ${str} 」 をコピーしました！`);
        }
      });
    });
  }

  // Calculate Total Buyback Amount
  function calculateTotal() {
    let total = 0;

    customMaterials.forEach(item => {
      const qty = state[item.id] || 0;
      const subtotal = qty * Number(item.price || 0);
      total += subtotal;

      const subDisplay = document.getElementById(`subtotal_${item.id}`);
      if (subDisplay) {
        subDisplay.textContent = formatJPY(subtotal);
      }
    });

    if (buybackTotalDisplay) {
      buybackTotalDisplay.textContent = formatJPY(total);
    }
    return total;
  }

  // Generate Summary Text for Clipboard Copy
  function getSummaryText() {
    const items = [];
    customMaterials.forEach(item => {
      const qty = state[item.id] || 0;
      const unit = item.unit || '個';
      if (qty > 0) {
        items.push(`${item.name}x${qty}${unit}`);
      }
    });

    const total = calculateTotal();
    if (items.length === 0) {
      return '買取品なし';
    }
    return `【買取明細】 ${items.join(', ')} (合計: ¥${total.toLocaleString('ja-JP')})`;
  }

  // Copy Actions
  if (btnCopyBuybackTotal) {
    btnCopyBuybackTotal.addEventListener('click', () => {
      const total = calculateTotal();
      const str = total.toString();
      if (window.AppCommon) {
        window.AppCommon.copyToClipboard(str, `買取合計額 「 ${str} 」 をコピーしました！`);
      }
    });
  }

  if (btnCopyBuybackSummary) {
    btnCopyBuybackSummary.addEventListener('click', () => {
      const summary = getSummaryText();
      if (window.AppCommon) {
        window.AppCommon.copyToClipboard(summary, `「 ${summary} 」 をコピーしました！`);
      }
    });
  }

  // Reset Button
  if (btnResetBuyback) {
    btnResetBuyback.addEventListener('click', () => {
      customMaterials.forEach(item => {
        state[item.id] = 0;
        const input = document.getElementById(`cnt_${item.id}`);
        if (input) input.value = 0;
      });

      calculateTotal();
      if (window.AppCommon) {
        window.AppCommon.showToast('すべての数量をリセットしました');
      }
    });
  }
});
