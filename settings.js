// Settings Page Logic - Dynamic Item Configuration Editor
document.addEventListener('DOMContentLoaded', () => {
  const shopId = window.ShopManager.getShopId();
  let currentConfig = JSON.parse(JSON.stringify(window.ShopManager.DEFAULT_CUSTOM_CONFIG));
  let authenticatedPasscode = null;

  // DOM Elements
  const modalPasscode = document.getElementById('modalPasscode');
  const formPasscode = document.getElementById('formPasscode');
  const txtPasscode = document.getElementById('txtPasscode');
  const samplePasscodeNotice = document.getElementById('samplePasscodeNotice');
  const passcodeError = document.getElementById('passcodeError');
  const settingsContent = document.getElementById('settingsContent');
  const formSettings = document.getElementById('formSettings');
  const currentShopName = document.getElementById('currentShopName');

  // モーダル関連
  const modalAddItem = document.getElementById('modalAddItem');
  const formAddItem = document.getElementById('formAddItem');
  const addSectionKey = document.getElementById('addSectionKey');
  const addInputType = document.getElementById('addInputType');
  const addItemName = document.getElementById('addItemName');
  const addItemPrice = document.getElementById('addItemPrice');
  const addItemShopPrice = document.getElementById('addItemShopPrice');
  const addItemOnsitePrice = document.getElementById('addItemOnsitePrice');
  const addItemTier1 = document.getElementById('addItemTier1');
  const addItemTier2 = document.getElementById('addItemTier2');
  const addItemTier3 = document.getElementById('addItemTier3');
  const addItemTier4 = document.getElementById('addItemTier4');
  const addItemTier5 = document.getElementById('addItemTier5');
  const addItemUnit = document.getElementById('addItemUnit');
  const addPriceGroupSingle = document.getElementById('addPriceGroupSingle');
  const addPriceGroupDual = document.getElementById('addPriceGroupDual');
  const addPriceGroupTiered = document.getElementById('addPriceGroupTiered');
  const addUnitGroup = document.getElementById('addUnitGroup');
  const btnAddItemCancel = document.getElementById('btnAddItemCancel');

  // サンプル店舗の場合は案内を表示＆初期値に1111をセット
  if (shopId === 'sample') {
    if (samplePasscodeNotice) {
      samplePasscodeNotice.style.display = 'flex';
    }
    if (txtPasscode) {
      txtPasscode.value = '1111';
      txtPasscode.placeholder = '1111';
    }
  }

  // タブ切り替え制御
  const tabBtns = document.querySelectorAll('.settings-tab-btn');
  const tabPanes = document.querySelectorAll('.settings-tab-pane');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(targetTab);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // 店舗データの購読
  window.ShopManager.subscribeShopPrices(shopId, (shopInfo) => {
    currentShopName.textContent = shopInfo.name;
    if (shopInfo.customConfig) {
      currentConfig = JSON.parse(JSON.stringify(shopInfo.customConfig));
    } else {
      currentConfig = JSON.parse(JSON.stringify(window.ShopManager.DEFAULT_CUSTOM_CONFIG));
    }
    if (authenticatedPasscode) {
      renderAllSections();
    }
  });

  // パスコード認証処理
  formPasscode.addEventListener('submit', async (e) => {
    e.preventDefault();
    passcodeError.style.display = 'none';
    const inputCode = txtPasscode.value.trim();

    try {
      const isValid = await window.ShopManager.verifyShopPasscode(shopId, inputCode);
      if (isValid) {
        authenticatedPasscode = inputCode;
        modalPasscode.classList.add('hidden');
        settingsContent.style.opacity = '1';
        settingsContent.style.pointerEvents = 'auto';
        if (currentConfig) {
          renderAllSections();
        }
      } else {
        showPasscodeError("パスコードが正しくありません。");
      }
    } catch (err) {
      showPasscodeError("認証エラーが発生しました。");
    }
  });

  function showPasscodeError(msg) {
    passcodeError.textContent = msg;
    passcodeError.style.display = 'block';
  }

  // Helper: セクションの配列を取得 / 設定
  function getSectionArray(sectionPath) {
    if (!currentConfig) return [];
    const parts = sectionPath.split('.');
    let curr = currentConfig;
    for (let i = 0; i < parts.length; i++) {
      if (!curr[parts[i]]) curr[parts[i]] = [];
      curr = curr[parts[i]];
    }
    return curr;
  }

  function getDefaultSectionArray(sectionPath) {
    const defaults = window.ShopManager.DEFAULT_CUSTOM_CONFIG;
    const parts = sectionPath.split('.');
    let curr = defaults;
    for (let i = 0; i < parts.length; i++) {
      if (!curr[parts[i]]) return [];
      curr = curr[parts[i]];
    }
    return JSON.parse(JSON.stringify(curr));
  }

  // 全セクションのレンダリング
  function renderAllSections() {
    renderSectionList('repairs.baseRepairs', 'list_repairs_baseRepairs');
    renderSectionList('repairs.degradedParts', 'list_repairs_degradedParts');
    renderSectionList('repairs.extraServices', 'list_repairs_extraServices');
    renderSectionList('repairItems', 'list_repairItems');

    renderSectionList('custom.performance', 'list_custom_performance');
    renderSectionList('custom.exterior', 'list_custom_exterior');
    renderSectionList('custom.repairs', 'list_custom_repairs');
    renderSectionList('custom.items', 'list_custom_items');

    renderSectionList('buyback', 'list_buyback');
  }

  // 個別セクションのレンダリング
  function renderSectionList(sectionPath, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = '';

    const list = getSectionArray(sectionPath);
    if (list.length === 0) {
      container.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.85rem; padding: 12px;">項目が登録されていません。「➕ 項目追加」から追加できます。</p>';
      return;
    }

    list.forEach((item, index) => {
      const row = document.createElement('div');
      row.className = 'settings-item-row';
      row.style.cssText = 'display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; margin-bottom: 8px; flex-wrap: wrap;';

      // 左側: 並び替えボタン ＋ 名称入力
      let leftHtml = `
        <div style="display: flex; align-items: center; gap: 8px; flex: 1; min-width: 220px;">
          <div style="display: flex; flex-direction: column; gap: 2px;">
            <button type="button" class="btn-move-up" data-section="${sectionPath}" data-index="${index}" style="background: none; border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-secondary); cursor: pointer; padding: 2px 6px; font-size: 0.75rem;" ${index === 0 ? 'disabled style="opacity: 0.3;"' : ''}>▲</button>
            <button type="button" class="btn-move-down" data-section="${sectionPath}" data-index="${index}" style="background: none; border: 1px solid var(--border-color); border-radius: 4px; color: var(--text-secondary); cursor: pointer; padding: 2px 6px; font-size: 0.75rem;" ${index === list.length - 1 ? 'disabled style="opacity: 0.3;"' : ''}>▼</button>
          </div>
          <div style="flex: 1;">
            <input type="text" class="form-input item-name-input" data-section="${sectionPath}" data-index="${index}" value="${window.AppCommon ? window.AppCommon.escapeHtml(item.name) : item.name}" placeholder="項目名" style="width: 100%; font-weight: 600; padding: 8px 10px; background: var(--bg-input); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 6px;">
            <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">
              タイプ: <strong>${getTypeLabel(item.type)}</strong>${item.unit ? ` (${item.unit})` : ''}
            </div>
          </div>
        </div>
      `;

      // 中央: 価格入力欄
      let priceHtml = '';
      if (item.type === 'dual_mode') {
        priceHtml = `
          <div style="display: flex; gap: 8px; align-items: center;">
            <div>
              <span style="font-size: 0.75rem; color: var(--text-secondary); display: block;">店内 (円)</span>
              <input type="number" class="form-input item-shop-price-input" data-section="${sectionPath}" data-index="${index}" value="${item.shopPrice != null ? item.shopPrice : 0}" style="width: 110px; padding: 8px; background: var(--bg-input); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 6px;" min="0">
            </div>
            <div>
              <span style="font-size: 0.75rem; color: var(--text-secondary); display: block;">出張 (円)</span>
              <input type="number" class="form-input item-onsite-price-input" data-section="${sectionPath}" data-index="${index}" value="${item.onsitePrice != null ? item.onsitePrice : 0}" style="width: 110px; padding: 8px; background: var(--bg-input); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 6px;" min="0">
            </div>
          </div>
        `;
      } else if (item.type === 'tiered') {
        const prices = Array.isArray(item.prices) ? item.prices : [];
        let tierInputs = '';
        for (let lvl = 1; lvl < prices.length; lvl++) {
          tierInputs += `
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 0.7rem; color: var(--text-secondary);">Lv${lvl}</span>
              <input type="number" class="form-input item-tier-price-input" data-section="${sectionPath}" data-index="${index}" data-level="${lvl}" value="${prices[lvl]}" style="width: 90px; padding: 6px; font-size: 0.85rem; background: var(--bg-input); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 4px;" min="0">
            </div>
          `;
        }
        priceHtml = `<div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">${tierInputs}</div>`;
      } else {
        // stepper または checkbox
        priceHtml = `
          <div>
            <span style="font-size: 0.75rem; color: var(--text-secondary); display: block;">単価 (円)</span>
            <input type="number" class="form-input item-single-price-input" data-section="${sectionPath}" data-index="${index}" value="${item.price != null ? item.price : 0}" style="width: 120px; padding: 8px; background: var(--bg-input); color: var(--text-primary); border: 1px solid var(--border-color); border-radius: 6px;" min="0">
          </div>
        `;
      }

      // 右側: 削除ボタン
      const rightHtml = `
        <div style="display: flex; align-items: center;">
          <button type="button" class="btn-delete-item" data-section="${sectionPath}" data-index="${index}" title="この項目を削除" style="background: rgba(239, 68, 68, 0.15); border: 1px solid var(--accent-red); color: var(--accent-red); border-radius: 6px; padding: 8px 12px; cursor: pointer; font-size: 0.9rem;">🗑️</button>
        </div>
      `;

      row.innerHTML = leftHtml + priceHtml + rightHtml;
      container.appendChild(row);
    });

    // イベントバインド
    bindSectionEvents(container, sectionPath);
  }

  function getTypeLabel(type) {
    switch (type) {
      case 'stepper': return '数量型';
      case 'checkbox': return 'チェック型';
      case 'dual_mode': return '店舗/出張 2価格型';
      case 'tiered': return '段階レベル型';
      default: return type;
    }
  }

  // イベントバインド（名称・価格・並び替え・削除）
  function bindSectionEvents(container, sectionPath) {
    const list = getSectionArray(sectionPath);

    // 名称変更
    container.querySelectorAll('.item-name-input').forEach(input => {
      input.addEventListener('change', () => {
        const idx = parseInt(input.getAttribute('data-index'), 10);
        if (list[idx]) list[idx].name = input.value.trim();
      });
    });

    // 単一価格変更
    container.querySelectorAll('.item-single-price-input').forEach(input => {
      input.addEventListener('change', () => {
        const idx = parseInt(input.getAttribute('data-index'), 10);
        if (list[idx]) list[idx].price = parseInt(input.value, 10) || 0;
      });
    });

    // 店舗/出張価格変更
    container.querySelectorAll('.item-shop-price-input').forEach(input => {
      input.addEventListener('change', () => {
        const idx = parseInt(input.getAttribute('data-index'), 10);
        if (list[idx]) list[idx].shopPrice = parseInt(input.value, 10) || 0;
      });
    });
    container.querySelectorAll('.item-onsite-price-input').forEach(input => {
      input.addEventListener('change', () => {
        const idx = parseInt(input.getAttribute('data-index'), 10);
        if (list[idx]) list[idx].onsitePrice = parseInt(input.value, 10) || 0;
      });
    });

    // 段階価格変更
    container.querySelectorAll('.item-tier-price-input').forEach(input => {
      input.addEventListener('change', () => {
        const idx = parseInt(input.getAttribute('data-index'), 10);
        const lvl = parseInt(input.getAttribute('data-level'), 10);
        if (list[idx] && Array.isArray(list[idx].prices)) {
          list[idx].prices[lvl] = parseInt(input.value, 10) || 0;
        }
      });
    });

    // 並び替え（上へ）
    container.querySelectorAll('.btn-move-up').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        if (idx > 0) {
          const temp = list[idx];
          list[idx] = list[idx - 1];
          list[idx - 1] = temp;
          renderAllSections();
        }
      });
    });

    // 並び替え（下へ）
    container.querySelectorAll('.btn-move-down').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        if (idx < list.length - 1) {
          const temp = list[idx];
          list[idx] = list[idx + 1];
          list[idx + 1] = temp;
          renderAllSections();
        }
      });
    });

    // 削除
    container.querySelectorAll('.btn-delete-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        const item = list[idx];
        if (confirm(`「${item.name}」を削除してもよろしいですか？`)) {
          list.splice(idx, 1);
          renderAllSections();
        }
      });
    });
  }

  // 項目追加ボタン
  document.querySelectorAll('.btn-add-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.getAttribute('data-section');
      addSectionKey.value = section;
      addItemName.value = '';
      addItemPrice.value = '';
      addItemShopPrice.value = '';
      addItemOnsitePrice.value = '';
      addItemTier1.value = '3000000';
      addItemTier2.value = '5000000';
      addItemTier3.value = '10000000';
      addItemTier4.value = '15000000';
      addItemTier5.value = '25000000';
      addItemUnit.value = '個';

      // デフォルトのタイプ選択
      if (section === 'repairs.baseRepairs') {
        addInputType.value = 'dual_mode';
      } else if (section === 'repairs.degradedParts') {
        addInputType.value = 'checkbox';
      } else if (section === 'custom.performance') {
        addInputType.value = 'tiered';
      } else {
        addInputType.value = 'stepper';
      }
      updateModalTypeUI();
      modalAddItem.classList.remove('hidden');
    });
  });

  // モーダル内タイプ変更時のUI連動
  if (addInputType) {
    addInputType.addEventListener('change', updateModalTypeUI);
  }

  function updateModalTypeUI() {
    const type = addInputType.value;
    addPriceGroupSingle.style.display = (type === 'stepper' || type === 'checkbox') ? 'block' : 'none';
    addPriceGroupDual.style.display = (type === 'dual_mode') ? 'block' : 'none';
    addPriceGroupTiered.style.display = (type === 'tiered') ? 'block' : 'none';
    addUnitGroup.style.display = (type === 'stepper') ? 'block' : 'none';
  }

  if (btnAddItemCancel) {
    btnAddItemCancel.addEventListener('click', () => {
      modalAddItem.classList.add('hidden');
    });
  }

  // モーダルから項目を追加
  if (formAddItem) {
    formAddItem.addEventListener('submit', (e) => {
      e.preventDefault();
      const section = addSectionKey.value;
      const type = addInputType.value;
      const name = addItemName.value.trim();
      if (!name) return;

      const list = getSectionArray(section);
      const newId = 'custom_' + Date.now();

      let newItem = {
        id: newId,
        name: name,
        type: type
      };

      if (type === 'stepper') {
        newItem.price = parseInt(addItemPrice.value, 10) || 0;
        newItem.unit = addItemUnit.value.trim() || '個';
        newItem.min = 0;
        newItem.max = 99;
      } else if (type === 'checkbox') {
        newItem.price = parseInt(addItemPrice.value, 10) || 0;
      } else if (type === 'dual_mode') {
        newItem.shopPrice = parseInt(addItemShopPrice.value, 10) || 0;
        newItem.onsitePrice = parseInt(addItemOnsitePrice.value, 10) || 0;
      } else if (type === 'tiered') {
        newItem.prices = [
          0,
          parseInt(addItemTier1.value, 10) || 0,
          parseInt(addItemTier2.value, 10) || 0,
          parseInt(addItemTier3.value, 10) || 0,
          parseInt(addItemTier4.value, 10) || 0,
          parseInt(addItemTier5.value, 10) || 0
        ];
        newItem.labels = ['Lv0', 'Lv1', 'Lv2', 'Lv3', 'Lv4', 'Lv5'];
      }

      list.push(newItem);
      modalAddItem.classList.add('hidden');
      renderAllSections();
      if (window.AppCommon) window.AppCommon.showToast(`「${name}」を追加しました`);
    });
  }

  // デフォルトに戻すボタン
  document.querySelectorAll('.btn-reset-section').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.getAttribute('data-section');
      if (confirm('このセクションの項目を初期状態（デフォルト）に戻しますか？')) {
        const defaults = getDefaultSectionArray(section);
        const parts = section.split('.');
        if (parts.length === 1) {
          currentConfig[parts[0]] = defaults;
        } else if (parts.length === 2) {
          currentConfig[parts[0]][parts[1]] = defaults;
        }
        renderAllSections();
        if (window.AppCommon) window.AppCommon.showToast('セクションを初期値に戻しました');
      }
    });
  });

  // 設定更新の送信
  formSettings.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!authenticatedPasscode) return;

    try {
      // 非破壊デュアルモードで customConfig と prices を同時更新
      await window.ShopManager.updateShopPrices(shopId, authenticatedPasscode, null, currentConfig);
      if (window.AppCommon) {
        window.AppCommon.showToast("✅ 設定を正常に更新・保存しました！");
      }
    } catch (err) {
      alert("保存失敗: " + (err.message || "エラーが発生しました。"));
    }
  });
});

