// Renard-Repair Calculator Logic - Repair Page
document.addEventListener('DOMContentLoaded', () => {
  // State Management (Repair Page)
  const state = {
    mode: 'shop', // 'shop' | 'onsite'
    aircraft: false,
    repairs: {
      full: false,
      engine: false,
      body: false,
      degradedParts: {
        oilPump: false,
        battery: false,
        fuelTank: false,
        driveShaft: false,
        cylinder: false
      },
      tiresCount: 0,
      nosRefillCount: 0,
      nosNewCount: 0
    },
    items: {
      ductTape: 0,
      carWash: 0,
      neonCtrl: 0,
      airSusCtrl: 0
    }
  };

  // Prices Table (Dynamic Shop Prices)
  let PRICES = {
    repairs: {
      full: { shop: 200000, onsite: 300000 },
      engine: { shop: 75000, onsite: 125000 },
      body: { shop: 75000, onsite: 125000 },
      degradedPartUnit: 10000,
      tires: 100000,
      aircraft: 100000,
      nosRefill: 400000,
      nosNew: 500000
    },
    items: {
      ductTape: 50000,
      carWash: 50000,
      neonCtrl: 200000,
      airSusCtrl: 1000000
    }
  };

  // マルチ店舗データの接続・購読
  const shopId = window.ShopManager ? window.ShopManager.getShopId() : 'soragon';
  const currentShopNameEl = document.getElementById('currentShopName');

  if (window.ShopManager) {
    window.ShopManager.subscribeShopPrices(shopId, (shopInfo) => {
      if (currentShopNameEl) currentShopNameEl.textContent = shopInfo.name;
      if (shopInfo.prices) {
        if (shopInfo.prices.repairs) PRICES.repairs = shopInfo.prices.repairs;
        if (shopInfo.prices.repairItems) PRICES.items = shopInfo.prices.repairItems;
        updateDynamicPriceLabels();
        calculateTotal();
      }
    });
  }

  // DOM Elements
  const btnModeShop = document.getElementById('btnModeShop');
  const btnModeOnsite = document.getElementById('btnModeOnsite');
  const chkAircraft = document.getElementById('chkAircraft');
  const btnResetRepair = document.getElementById('btnResetRepair');
  const modeTag = document.getElementById('modeTag');

  const chkFullRepair = document.getElementById('chkFullRepair');
  const chkEngineRepair = document.getElementById('chkEngineRepair');
  const chkBodyRepair = document.getElementById('chkBodyRepair');
  const priceFullRepair = document.getElementById('priceFullRepair');
  const priceEngineRepair = document.getElementById('priceEngineRepair');
  const priceBodyRepair = document.getElementById('priceBodyRepair');

  const chkOilPump = document.getElementById('chkOilPump');
  const chkBattery = document.getElementById('chkBattery');
  const chkFuelTank = document.getElementById('chkFuelTank');
  const chkDriveShaft = document.getElementById('chkDriveShaft');
  const chkCylinder = document.getElementById('chkCylinder');

  const groupTires = document.getElementById('groupTires');
  const priceTiresDisplay = document.getElementById('priceTiresDisplay');

  const cntNosRefill = document.getElementById('cntNosRefill');
  const cntNosNew = document.getElementById('cntNosNew');

  const cntDuctTape = document.getElementById('cntDuctTape');
  const cntCarWash = document.getElementById('cntCarWash');
  const cntNeonCtrl = document.getElementById('cntNeonCtrl');
  const cntAirSusCtrl = document.getElementById('cntAirSusCtrl');

  const repairTotalDisplay = document.getElementById('repairTotalDisplay');
  const btnCopyRepairTotal = document.getElementById('btnCopyRepairTotal');
  const btnCopyRepairSummary = document.getElementById('btnCopyRepairSummary');

  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');

  // Helper Format Currency
  function formatJPY(num) {
    return window.AppCommon ? window.AppCommon.formatJPY(num) : ('¥' + Math.floor(num).toLocaleString('ja-JP'));
  }

  // Update DOM price labels dynamically
  function updateDynamicPriceLabels() {
    const mode = state.mode;
    if (priceFullRepair) priceFullRepair.textContent = formatJPY(PRICES.repairs.full[mode]);
    if (priceEngineRepair) priceEngineRepair.textContent = formatJPY(PRICES.repairs.engine[mode]);
    if (priceBodyRepair) priceBodyRepair.textContent = formatJPY(PRICES.repairs.body[mode]);
  }

  // Calculate Total Amount
  function calculateTotal() {
    let total = 0;
    const mode = state.mode;

    if (state.repairs.full) total += PRICES.repairs.full[mode];
    if (state.repairs.engine) total += PRICES.repairs.engine[mode];
    if (state.repairs.body) total += PRICES.repairs.body[mode];

    if (state.repairs.degradedParts.oilPump) total += PRICES.repairs.degradedPartUnit;
    if (state.repairs.degradedParts.battery) total += PRICES.repairs.degradedPartUnit;
    if (state.repairs.degradedParts.fuelTank) total += PRICES.repairs.degradedPartUnit;
    if (state.repairs.degradedParts.driveShaft) total += PRICES.repairs.degradedPartUnit;
    if (state.repairs.degradedParts.cylinder) total += PRICES.repairs.degradedPartUnit;

    total += state.repairs.tiresCount * PRICES.repairs.tires;
    if (state.aircraft) total += PRICES.repairs.aircraft;
    total += state.repairs.nosRefillCount * PRICES.repairs.nosRefill;
    total += state.repairs.nosNewCount * PRICES.repairs.nosNew;

    // Items
    total += state.items.ductTape * PRICES.items.ductTape;
    total += state.items.carWash * PRICES.items.carWash;
    total += state.items.neonCtrl * PRICES.items.neonCtrl;
    total += state.items.airSusCtrl * PRICES.items.airSusCtrl;

    repairTotalDisplay.textContent = formatJPY(total);
    return total;
  }

  // Generate Repair Summary
  function getSummaryText() {
    const items = [];
    if (state.repairs.full) items.push('全修理');
    if (state.repairs.engine) items.push('エンジン修理');
    if (state.repairs.body) items.push('ボディ修理');

    if (state.repairs.degradedParts.oilPump) items.push('オイルポンプ');
    if (state.repairs.degradedParts.battery) items.push('バッテリー');
    if (state.repairs.degradedParts.fuelTank) items.push('燃料タンク');
    if (state.repairs.degradedParts.driveShaft) items.push('ドライブシャフト');
    if (state.repairs.degradedParts.cylinder) items.push('シリンダー');

    if (state.repairs.tiresCount > 0) items.push(`タイヤx${state.repairs.tiresCount}`);
    if (state.aircraft) items.push('航空機/船');
    if (state.repairs.nosRefillCount > 0) items.push(`NOS補充x${state.repairs.nosRefillCount}`);
    if (state.repairs.nosNewCount > 0) items.push(`NOS新規x${state.repairs.nosNewCount}`);

    if (state.items.ductTape > 0) items.push(`ダクトテープx${state.items.ductTape}`);
    if (state.items.carWash > 0) items.push(`洗車キットx${state.items.carWash}`);
    if (state.items.neonCtrl > 0) items.push(`ネオンCtrlx${state.items.neonCtrl}`);
    if (state.items.airSusCtrl > 0) items.push(`エアサスCtrlx${state.items.airSusCtrl}`);

    const total = calculateTotal();
    return items.length > 0 ? `${total} ${items.join(', ')}` : '作業なし';
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



  // Mode Update
  function updateModeUI() {
    const isShop = state.mode === 'shop';
    btnModeShop.classList.toggle('active', isShop);
    btnModeOnsite.classList.toggle('active', !isShop);
    modeTag.textContent = isShop ? '店内料金適用中' : '出張料金適用中';

    priceFullRepair.textContent = formatJPY(PRICES.repairs.full[state.mode]);
    priceEngineRepair.textContent = formatJPY(PRICES.repairs.engine[state.mode]);
    priceBodyRepair.textContent = formatJPY(PRICES.repairs.body[state.mode]);

    calculateTotal();
  }

  btnModeShop.addEventListener('click', () => { state.mode = 'shop'; updateModeUI(); });
  btnModeOnsite.addEventListener('click', () => { state.mode = 'onsite'; updateModeUI(); });

  chkAircraft.addEventListener('change', (e) => {
    state.aircraft = e.target.checked;
    calculateTotal();
  });

  chkFullRepair.addEventListener('change', (e) => {
    state.repairs.full = e.target.checked;
    if (e.target.checked) {
      chkEngineRepair.checked = false;
      chkBodyRepair.checked = false;
      state.repairs.engine = false;
      state.repairs.body = false;
    }
    calculateTotal();
  });

  chkEngineRepair.addEventListener('change', (e) => {
    state.repairs.engine = e.target.checked;
    if (e.target.checked && chkFullRepair.checked) {
      chkFullRepair.checked = false;
      state.repairs.full = false;
    }
    calculateTotal();
  });

  chkBodyRepair.addEventListener('change', (e) => {
    state.repairs.body = e.target.checked;
    if (e.target.checked && chkFullRepair.checked) {
      chkFullRepair.checked = false;
      state.repairs.full = false;
    }
    calculateTotal();
  });

  chkOilPump.addEventListener('change', (e) => { state.repairs.degradedParts.oilPump = e.target.checked; calculateTotal(); });
  chkBattery.addEventListener('change', (e) => { state.repairs.degradedParts.battery = e.target.checked; calculateTotal(); });
  chkFuelTank.addEventListener('change', (e) => { state.repairs.degradedParts.fuelTank = e.target.checked; calculateTotal(); });
  chkDriveShaft.addEventListener('change', (e) => { state.repairs.degradedParts.driveShaft = e.target.checked; calculateTotal(); });
  chkCylinder.addEventListener('change', (e) => { state.repairs.degradedParts.cylinder = e.target.checked; calculateTotal(); });

  // Tires
  groupTires.querySelectorAll('.lvl-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const isAlreadyActive = btn.classList.contains('active');
      groupTires.querySelectorAll('.lvl-btn').forEach(b => b.classList.remove('active'));

      if (isAlreadyActive) {
        state.repairs.tiresCount = 0;
        priceTiresDisplay.textContent = '未選択';
      } else {
        btn.classList.add('active');
        const qty = parseInt(btn.getAttribute('data-qty'), 10);
        state.repairs.tiresCount = qty;
        priceTiresDisplay.textContent = formatJPY(qty * PRICES.repairs.tires);
      }
      calculateTotal();
    });
  });

  // Counters (NOS & Items)
  document.querySelectorAll('.cnt-input').forEach(input => {
    input.addEventListener('focus', () => input.select());
    const handleInputChange = () => {
      let val = parseInt(input.value, 10);
      const min = parseInt(input.min, 10) || 0;
      const max = parseInt(input.max, 10) || 99;
      if (isNaN(val) || val < min) val = min;
      if (val > max) val = max;

      const id = input.id;
      if (id === 'cntNosRefill') state.repairs.nosRefillCount = val;
      if (id === 'cntNosNew') state.repairs.nosNewCount = val;
      if (id === 'cntDuctTape') state.items.ductTape = val;
      if (id === 'cntCarWash') state.items.carWash = val;
      if (id === 'cntNeonCtrl') state.items.neonCtrl = val;
      if (id === 'cntAirSusCtrl') state.items.airSusCtrl = val;

      calculateTotal();
    };
    input.addEventListener('input', handleInputChange);
    input.addEventListener('change', () => {
      if (input.value === '') input.value = 0;
      handleInputChange();
    });
  });

  document.querySelectorAll('.cnt-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      if (!input) return;
      const isInc = btn.classList.contains('inc');
      let val = parseInt(input.value, 10) || 0;
      const min = parseInt(input.min, 10) || 0;
      const max = parseInt(input.max, 10) || 99;

      if (isInc && val < max) val++;
      if (!isInc && val > min) val--;

      input.value = val;
      if (targetId === 'cntNosRefill') state.repairs.nosRefillCount = val;
      if (targetId === 'cntNosNew') state.repairs.nosNewCount = val;
      if (targetId === 'cntDuctTape') state.items.ductTape = val;
      if (targetId === 'cntCarWash') state.items.carWash = val;
      if (targetId === 'cntNeonCtrl') state.items.neonCtrl = val;
      if (targetId === 'cntAirSusCtrl') state.items.airSusCtrl = val;

      calculateTotal();
    });
  });

  // Copy Handlers
  btnCopyRepairTotal.addEventListener('click', () => {
    const total = calculateTotal();
    const str = total.toString();
    copyToClipboard(str, `修理請求額 「 ${str} 」 をコピーしました！`);
  });

  btnCopyRepairSummary.addEventListener('click', () => {
    const text = getSummaryText();
    copyToClipboard(text, `「 ${text} 」 をコピーしました！`);
  });

  // Reset
  btnResetRepair.addEventListener('click', () => {
    state.aircraft = false;
    chkAircraft.checked = false;

    chkFullRepair.checked = false;
    chkEngineRepair.checked = false;
    chkBodyRepair.checked = false;
    chkOilPump.checked = false;
    chkBattery.checked = false;
    chkFuelTank.checked = false;
    chkDriveShaft.checked = false;
    chkCylinder.checked = false;

    cntNosRefill.value = 0;
    cntNosNew.value = 0;
    cntDuctTape.value = 0;
    cntCarWash.value = 0;
    cntNeonCtrl.value = 0;
    cntAirSusCtrl.value = 0;

    state.repairs = {
      full: false, engine: false, body: false,
      degradedParts: { oilPump: false, battery: false, fuelTank: false, driveShaft: false, cylinder: false },
      tiresCount: 0, nosRefillCount: 0, nosNewCount: 0
    };
    state.items = { ductTape: 0, carWash: 0, neonCtrl: 0, airSusCtrl: 0 };

    groupTires.querySelectorAll('.lvl-btn').forEach(b => b.classList.remove('active'));
    priceTiresDisplay.textContent = '未選択';

    calculateTotal();
    showToast('すべての選択をリセットしました');
  });

  updateModeUI();
});
