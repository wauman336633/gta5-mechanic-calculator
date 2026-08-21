// Settings Page Logic
document.addEventListener('DOMContentLoaded', () => {
  const shopId = window.ShopManager.getShopId();
  let currentPrices = null;
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
    currentPrices = shopInfo.prices;
    if (authenticatedPasscode) {
      populateFormValues(currentPrices);
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
        if (currentPrices) {
          populateFormValues(currentPrices);
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

  // フォームに現在の価格を反映
  function populateFormValues(prices) {
    if (!prices) return;

    // 修理価格
    setVal('price_repair_full_shop', prices.repairs?.full?.shop);
    setVal('price_repair_full_onsite', prices.repairs?.full?.onsite);
    setVal('price_repair_engine_shop', prices.repairs?.engine?.shop);
    setVal('price_repair_engine_onsite', prices.repairs?.engine?.onsite);
    setVal('price_repair_body_shop', prices.repairs?.body?.shop);
    setVal('price_repair_body_onsite', prices.repairs?.body?.onsite);
    setVal('price_repair_degraded', prices.repairs?.degradedPartUnit);
    setVal('price_repair_tires', prices.repairs?.tires);
    setVal('price_repair_aircraft', prices.repairs?.aircraft);
    setVal('price_repair_nosRefill', prices.repairs?.nosRefill);
    setVal('price_repair_nosNew', prices.repairs?.nosNew);

    // 販売品価格
    setVal('price_item_ductTape', prices.repairItems?.ductTape);
    setVal('price_item_carWash', prices.repairItems?.carWash);
    setVal('price_item_neonCtrl', prices.repairItems?.neonCtrl);
    setVal('price_item_airSusCtrl', prices.repairItems?.airSusCtrl);

    // カスタムパーツ価格
    const custom = prices.custom || window.ShopManager.DEFAULT_PRICES.custom;
    if (custom) {
      setVal('price_custom_exterior_base', custom.exterior?.base);
      setVal('price_custom_exterior_wheels', custom.exterior?.wheels);
      setVal('price_custom_exterior_stance', custom.exterior?.stance);

      if (custom.performance?.engine) {
        for (let i = 1; i <= 5; i++) {
          setVal(`price_custom_engine_${i}`, custom.performance.engine[i]);
        }
      }
      if (custom.performance?.brakes) {
        for (let i = 1; i <= 3; i++) {
          setVal(`price_custom_brakes_${i}`, custom.performance.brakes[i]);
        }
      }
      if (custom.performance?.suspension) {
        for (let i = 1; i <= 5; i++) {
          setVal(`price_custom_suspension_${i}`, custom.performance.suspension[i]);
        }
      }
      if (custom.performance?.transmission) {
        for (let i = 1; i <= 4; i++) {
          setVal(`price_custom_transmission_${i}`, custom.performance.transmission[i]);
        }
      }
      if (custom.performance?.durability) {
        for (let i = 1; i <= 3; i++) {
          setVal(`price_custom_durability_${i}`, custom.performance.durability[i]);
        }
      }
      setVal('price_custom_turbo', custom.performance?.turbo);
      setVal('price_custom_antiLag', custom.performance?.antiLag);
      setVal('price_custom_harness', custom.performance?.harness);
    }

    // 買取単価
    setVal('price_buyback_Steel', prices.buyback?.Steel);
    setVal('price_buyback_Iron', prices.buyback?.Iron);
    setVal('price_buyback_Scrap', prices.buyback?.Scrap);
    setVal('price_buyback_Plastic', prices.buyback?.Plastic);
    setVal('price_buyback_Aluminum', prices.buyback?.Aluminum);
    setVal('price_buyback_Rubber', prices.buyback?.Rubber);
    setVal('price_buyback_Glass', prices.buyback?.Glass);
    setVal('price_buyback_Copper', prices.buyback?.Copper);
  }

  function setVal(id, value) {
    const el = document.getElementById(id);
    if (el && value !== undefined) {
      el.value = value;
    }
  }

  function getNumVal(id, fallback) {
    const el = document.getElementById(id);
    if (el && el.value !== "") {
      return parseInt(el.value, 10);
    }
    return fallback;
  }

  // 設定更新の送信
  formSettings.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!authenticatedPasscode) return;

    const newPrices = JSON.parse(JSON.stringify(currentPrices || window.ShopManager.DEFAULT_PRICES));
    if (!newPrices.custom) {
      newPrices.custom = JSON.parse(JSON.stringify(window.ShopManager.DEFAULT_PRICES.custom));
    }

    // 修理
    newPrices.repairs.full.shop = getNumVal('price_repair_full_shop', newPrices.repairs.full.shop);
    newPrices.repairs.full.onsite = getNumVal('price_repair_full_onsite', newPrices.repairs.full.onsite);
    newPrices.repairs.engine.shop = getNumVal('price_repair_engine_shop', newPrices.repairs.engine.shop);
    newPrices.repairs.engine.onsite = getNumVal('price_repair_engine_onsite', newPrices.repairs.engine.onsite);
    newPrices.repairs.body.shop = getNumVal('price_repair_body_shop', newPrices.repairs.body.shop);
    newPrices.repairs.body.onsite = getNumVal('price_repair_body_onsite', newPrices.repairs.body.onsite);
    newPrices.repairs.degradedPartUnit = getNumVal('price_repair_degraded', newPrices.repairs.degradedPartUnit);
    newPrices.repairs.tires = getNumVal('price_repair_tires', newPrices.repairs.tires);
    newPrices.repairs.aircraft = getNumVal('price_repair_aircraft', newPrices.repairs.aircraft);
    newPrices.repairs.nosRefill = getNumVal('price_repair_nosRefill', newPrices.repairs.nosRefill);
    newPrices.repairs.nosNew = getNumVal('price_repair_nosNew', newPrices.repairs.nosNew);

    // 販売品
    newPrices.repairItems.ductTape = getNumVal('price_item_ductTape', newPrices.repairItems.ductTape);
    newPrices.repairItems.carWash = getNumVal('price_item_carWash', newPrices.repairItems.carWash);
    newPrices.repairItems.neonCtrl = getNumVal('price_item_neonCtrl', newPrices.repairItems.neonCtrl);
    newPrices.repairItems.airSusCtrl = getNumVal('price_item_airSusCtrl', newPrices.repairItems.airSusCtrl);

    // カスタムパーツ
    newPrices.custom.exterior.base = getNumVal('price_custom_exterior_base', newPrices.custom.exterior.base);
    newPrices.custom.exterior.wheels = getNumVal('price_custom_exterior_wheels', newPrices.custom.exterior.wheels);
    newPrices.custom.exterior.stance = getNumVal('price_custom_exterior_stance', newPrices.custom.exterior.stance);

    for (let i = 1; i <= 5; i++) {
      newPrices.custom.performance.engine[i] = getNumVal(`price_custom_engine_${i}`, newPrices.custom.performance.engine[i]);
    }
    for (let i = 1; i <= 3; i++) {
      newPrices.custom.performance.brakes[i] = getNumVal(`price_custom_brakes_${i}`, newPrices.custom.performance.brakes[i]);
    }
    for (let i = 1; i <= 5; i++) {
      newPrices.custom.performance.suspension[i] = getNumVal(`price_custom_suspension_${i}`, newPrices.custom.performance.suspension[i]);
    }
    for (let i = 1; i <= 4; i++) {
      newPrices.custom.performance.transmission[i] = getNumVal(`price_custom_transmission_${i}`, newPrices.custom.performance.transmission[i]);
    }
    for (let i = 1; i <= 3; i++) {
      newPrices.custom.performance.durability[i] = getNumVal(`price_custom_durability_${i}`, newPrices.custom.performance.durability[i]);
    }
    newPrices.custom.performance.turbo = getNumVal('price_custom_turbo', newPrices.custom.performance.turbo);
    newPrices.custom.performance.antiLag = getNumVal('price_custom_antiLag', newPrices.custom.performance.antiLag);
    newPrices.custom.performance.harness = getNumVal('price_custom_harness', newPrices.custom.performance.harness);

    // 素材買取
    newPrices.buyback.Steel = getNumVal('price_buyback_Steel', newPrices.buyback.Steel);
    newPrices.buyback.Iron = getNumVal('price_buyback_Iron', newPrices.buyback.Iron);
    newPrices.buyback.Scrap = getNumVal('price_buyback_Scrap', newPrices.buyback.Scrap);
    newPrices.buyback.Plastic = getNumVal('price_buyback_Plastic', newPrices.buyback.Plastic);
    newPrices.buyback.Aluminum = getNumVal('price_buyback_Aluminum', newPrices.buyback.Aluminum);
    newPrices.buyback.Rubber = getNumVal('price_buyback_Rubber', newPrices.buyback.Rubber);
    newPrices.buyback.Glass = getNumVal('price_buyback_Glass', newPrices.buyback.Glass);
    newPrices.buyback.Copper = getNumVal('price_buyback_Copper', newPrices.buyback.Copper);

    try {
      await window.ShopManager.updateShopPrices(shopId, authenticatedPasscode, newPrices);
      window.AppCommon.showToast("✅ 価格設定を正常に更新・保存しました！");
    } catch (err) {
      alert("保存失敗: " + (err.message || "エラーが発生しました。"));
    }
  });
});

