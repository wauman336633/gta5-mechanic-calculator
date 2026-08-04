// Renard-Repair Calculator Logic - Custom Page Only
document.addEventListener('DOMContentLoaded', () => {
  // State Management (Custom Page)
  const state = {
    repairs: {
      nosRefillCount: 0,
      nosNewCount: 0
    },
    exterior: {
      base: 0,
      wheels: 0,
      stance: 0
    },
    performance: {
      engine: 0,
      brakes: 0,
      suspension: 0,
      transmission: 0,
      durabilityParts: {
        oilPump: 0,
        battery: 0,
        fuelTank: 0,
        driveShaft: 0,
        cylinder: 0
      },
      turbo: false,
      antiLag: false,
      harness: false
    },
    items: {
      ductTape: 0,
      carWash: 0,
      neonCtrl: 0,
      airSusCtrl: 0
    },
    discount: {
      preset: 0, // 0 | 30 | 50 | 70 (%)
      customType: 'none',
      customValue: 0
    }
  };

  // Prices Table
  const PRICES = {
    repairs: {
      nosRefill: 400000,
      nosNew: 500000
    },
    exterior: {
      base: 50000,
      wheels: 200000,
      stance: 100000
    },
    performance: {
      engine: [0, 3000000, 5000000, 10000000, 15000000, 25000000],
      brakes: [0, 3000000, 6000000, 8000000],
      suspension: [0, 3000000, 5000000, 8000000, 10000000, 12000000],
      transmission: [0, 3000000, 5000000, 10000000, 12000000],
      durability: [0, 300000, 500000, 700000],
      turbo: 3000000,
      antiLag: 10000000,
      harness: 500000
    },
    items: {
      ductTape: 50000,
      carWash: 50000,
      neonCtrl: 200000,
      airSusCtrl: 1000000
    }
  };

  // DOM Elements
  const btnResetCustom = document.getElementById('btnResetCustom');

  const cntNosRefill = document.getElementById('cntNosRefill');
  const cntNosNew = document.getElementById('cntNosNew');

  const cntExteriorBase = document.getElementById('cntExteriorBase');
  const cntWheels = document.getElementById('cntWheels');
  const cntStance = document.getElementById('cntStance');

  const chkTurbo = document.getElementById('chkTurbo');
  const chkAntiLag = document.getElementById('chkAntiLag');
  const chkHarness = document.getElementById('chkHarness');

  const cntDuctTape = document.getElementById('cntDuctTape');
  const cntCarWash = document.getElementById('cntCarWash');
  const cntNeonCtrl = document.getElementById('cntNeonCtrl');
  const cntAirSusCtrl = document.getElementById('cntAirSusCtrl');

  const btnDisc3 = document.getElementById('btnDisc3');
  const btnDisc5 = document.getElementById('btnDisc5');
  const btnDisc7 = document.getElementById('btnDisc7');
  const customDiscountType = document.getElementById('customDiscountType');
  const customDiscountVal = document.getElementById('customDiscountVal');

  const subtotalDisplay = document.getElementById('subtotalDisplay');
  const totalDisplay = document.getElementById('totalDisplay');
  const vaultDisplay = document.getElementById('vaultDisplay');
  const discountTagDisplay = document.getElementById('discountTagDisplay');

  const btnCopyNumber = document.getElementById('btnCopyNumber');
  const btnCopyVault = document.getElementById('btnCopyVault');
  const btnCopyVaultSummary = document.getElementById('btnCopyVaultSummary');
  const btnCopyOwnCar = document.getElementById('btnCopyOwnCar');

  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');

  // Helper Format Currency
  function formatJPY(num) {
    return '¥' + Math.floor(num).toLocaleString('ja-JP');
  }

  // Calculate Total & Vault Amount (30%)
  function calculateTotal() {
    let subtotal = 0;

    // NOS
    subtotal += state.repairs.nosRefillCount * PRICES.repairs.nosRefill;
    subtotal += state.repairs.nosNewCount * PRICES.repairs.nosNew;

    // Exterior
    subtotal += state.exterior.base * PRICES.exterior.base;
    subtotal += state.exterior.wheels * PRICES.exterior.wheels;
    subtotal += state.exterior.stance * PRICES.exterior.stance;

    // Performance
    subtotal += PRICES.performance.engine[state.performance.engine];
    subtotal += PRICES.performance.brakes[state.performance.brakes];
    subtotal += PRICES.performance.suspension[state.performance.suspension];
    subtotal += PRICES.performance.transmission[state.performance.transmission];

    // Durability Parts
    subtotal += PRICES.performance.durability[state.performance.durabilityParts.oilPump];
    subtotal += PRICES.performance.durability[state.performance.durabilityParts.battery];
    subtotal += PRICES.performance.durability[state.performance.durabilityParts.fuelTank];
    subtotal += PRICES.performance.durability[state.performance.durabilityParts.driveShaft];
    subtotal += PRICES.performance.durability[state.performance.durabilityParts.cylinder];

    if (state.performance.turbo) subtotal += PRICES.performance.turbo;
    if (state.performance.antiLag) subtotal += PRICES.performance.antiLag;
    if (state.performance.harness) subtotal += PRICES.performance.harness;

    // Items
    subtotal += state.items.ductTape * PRICES.items.ductTape;
    subtotal += state.items.carWash * PRICES.items.carWash;
    subtotal += state.items.neonCtrl * PRICES.items.neonCtrl;
    subtotal += state.items.airSusCtrl * PRICES.items.airSusCtrl;

    // Discounts
    let finalTotal = subtotal;
    let hasDiscount = false;

    if (state.discount.preset > 0) {
      finalTotal *= (1 - state.discount.preset / 100);
      hasDiscount = true;
    }

    if (state.discount.customType === 'percent' && state.discount.customValue > 0) {
      const pct = Math.min(100, Math.max(0, state.discount.customValue));
      finalTotal *= (1 - pct / 100);
      hasDiscount = true;
    } else if (state.discount.customType === 'fixed' && state.discount.customValue > 0) {
      finalTotal = Math.max(0, finalTotal - state.discount.customValue);
      hasDiscount = true;
    }

    finalTotal = Math.round(finalTotal);
    const vaultAmount = Math.round(finalTotal * 0.3);

    subtotalDisplay.textContent = formatJPY(subtotal);
    totalDisplay.textContent = formatJPY(finalTotal);
    vaultDisplay.textContent = formatJPY(vaultAmount);

    if (hasDiscount) {
      discountTagDisplay.classList.remove('hidden');
      if (state.discount.preset > 0) {
        discountTagDisplay.textContent = `${state.discount.preset / 10}割OFF適用中`;
      } else {
        discountTagDisplay.textContent = '割引適用中';
      }
    } else {
      discountTagDisplay.classList.add('hidden');
    }

    return { subtotal, finalTotal, vaultAmount };
  }

  // Generate Summary Text
  function getSummaryText() {
    const items = [];
    if (state.repairs.nosRefillCount > 0) items.push(`NOS補充x${state.repairs.nosRefillCount}`);
    if (state.repairs.nosNewCount > 0) items.push(`NOS新規x${state.repairs.nosNewCount}`);

    if (state.exterior.base > 0) items.push(`基本外装x${state.exterior.base}`);
    if (state.exterior.wheels > 0) items.push(`ホイールx${state.exterior.wheels}`);
    if (state.exterior.stance > 0) items.push(`スタンスx${state.exterior.stance}`);

    if (state.performance.engine > 0) items.push(`エンジンLv${state.performance.engine}`);
    if (state.performance.brakes > 0) items.push(`ブレーキLv${state.performance.brakes}`);
    if (state.performance.suspension > 0) items.push(`サスLv${state.performance.suspension}`);
    if (state.performance.transmission > 0) items.push(`ミッションLv${state.performance.transmission}`);

    if (state.performance.durabilityParts.oilPump > 0) items.push(`オイルポンプ抑制Lv${state.performance.durabilityParts.oilPump}`);
    if (state.performance.durabilityParts.battery > 0) items.push(`バッテリー抑制Lv${state.performance.durabilityParts.battery}`);
    if (state.performance.durabilityParts.fuelTank > 0) items.push(`燃料タンク抑制Lv${state.performance.durabilityParts.fuelTank}`);
    if (state.performance.durabilityParts.driveShaft > 0) items.push(`ドライブシャフト抑制Lv${state.performance.durabilityParts.driveShaft}`);
    if (state.performance.durabilityParts.cylinder > 0) items.push(`シリンダー抑制Lv${state.performance.durabilityParts.cylinder}`);

    if (state.performance.turbo) items.push('ターボ');
    if (state.performance.antiLag) items.push('アンチラグ');
    if (state.performance.harness) items.push('ハーネス');

    if (state.items.ductTape > 0) items.push(`ダクトテープx${state.items.ductTape}`);
    if (state.items.carWash > 0) items.push(`洗車キットx${state.items.carWash}`);
    if (state.items.neonCtrl > 0) items.push(`ネオンCtrlx${state.items.neonCtrl}`);
    if (state.items.airSusCtrl > 0) items.push(`エアサスCtrlx${state.items.airSusCtrl}`);

    return items.length > 0 ? items.join(', ') : 'カスタムなし';
  }

  // Toast Function
  let toastTimer = null;
  function showToast(message) {
    toastMsg.textContent = message;
    toast.classList.remove('hidden');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.add('hidden');
    }, 2500);
  }

  // Clipboard Helper
  function copyToClipboard(text, successMsg) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMsg);
    }).catch(() => {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showToast(successMsg);
    });
  }

  // Performance Checkboxes
  chkTurbo.addEventListener('change', (e) => { state.performance.turbo = e.target.checked; calculateTotal(); });
  chkAntiLag.addEventListener('change', (e) => { state.performance.antiLag = e.target.checked; calculateTotal(); });
  chkHarness.addEventListener('change', (e) => { state.performance.harness = e.target.checked; calculateTotal(); });

  // Input Counters Listener
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
      if (id === 'cntExteriorBase') state.exterior.base = val;
      if (id === 'cntWheels') state.exterior.wheels = val;
      if (id === 'cntStance') state.exterior.stance = val;
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
      if (targetId === 'cntExteriorBase') state.exterior.base = val;
      if (targetId === 'cntWheels') state.exterior.wheels = val;
      if (targetId === 'cntStance') state.exterior.stance = val;
      if (targetId === 'cntDuctTape') state.items.ductTape = val;
      if (targetId === 'cntCarWash') state.items.carWash = val;
      if (targetId === 'cntNeonCtrl') state.items.neonCtrl = val;
      if (targetId === 'cntAirSusCtrl') state.items.airSusCtrl = val;

      calculateTotal();
    });
  });

  // Level Selection Buttons
  const levelGroups = [
    { elementId: 'lvlEngine', displayId: 'priceEngineCustom', getValue: () => state.performance.engine, setValue: (v) => state.performance.engine = v, getPriceList: () => PRICES.performance.engine },
    { elementId: 'lvlBrakes', displayId: 'priceBrakes', getValue: () => state.performance.brakes, setValue: (v) => state.performance.brakes = v, getPriceList: () => PRICES.performance.brakes },
    { elementId: 'lvlSuspension', displayId: 'priceSuspension', getValue: () => state.performance.suspension, setValue: (v) => state.performance.suspension = v, getPriceList: () => PRICES.performance.suspension },
    { elementId: 'lvlTransmission', displayId: 'priceTransmission', getValue: () => state.performance.transmission, setValue: (v) => state.performance.transmission = v, getPriceList: () => PRICES.performance.transmission },
    { elementId: 'lvlDurabilityOilPump', displayId: 'priceDurabilityOilPump', getValue: () => state.performance.durabilityParts.oilPump, setValue: (v) => state.performance.durabilityParts.oilPump = v, getPriceList: () => PRICES.performance.durability },
    { elementId: 'lvlDurabilityBattery', displayId: 'priceDurabilityBattery', getValue: () => state.performance.durabilityParts.battery, setValue: (v) => state.performance.durabilityParts.battery = v, getPriceList: () => PRICES.performance.durability },
    { elementId: 'lvlDurabilityFuelTank', displayId: 'priceDurabilityFuelTank', getValue: () => state.performance.durabilityParts.fuelTank, setValue: (v) => state.performance.durabilityParts.fuelTank = v, getPriceList: () => PRICES.performance.durability },
    { elementId: 'lvlDurabilityDriveShaft', displayId: 'priceDurabilityDriveShaft', getValue: () => state.performance.durabilityParts.driveShaft, setValue: (v) => state.performance.durabilityParts.driveShaft = v, getPriceList: () => PRICES.performance.durability },
    { elementId: 'lvlDurabilityCylinder', displayId: 'priceDurabilityCylinder', getValue: () => state.performance.durabilityParts.cylinder, setValue: (v) => state.performance.durabilityParts.cylinder = v, getPriceList: () => PRICES.performance.durability }
  ];

  levelGroups.forEach(group => {
    const container = document.getElementById(group.elementId);
    const display = document.getElementById(group.displayId);

    if (container && display) {
      container.querySelectorAll('.lvl-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const isAlreadyActive = btn.classList.contains('active');
          container.querySelectorAll('.lvl-btn').forEach(b => b.classList.remove('active'));

          if (isAlreadyActive) {
            group.setValue(0);
            display.textContent = '未選択';
          } else {
            btn.classList.add('active');
            const level = parseInt(btn.getAttribute('data-level'), 10);
            group.setValue(level);
            const price = group.getPriceList()[level];
            display.textContent = formatJPY(price);
          }
          calculateTotal();
        });
      });
    }
  });

  // Discounts
  const discountBtns = [
    { btn: btnDisc3, pct: 30 },
    { btn: btnDisc5, pct: 50 },
    { btn: btnDisc7, pct: 70 }
  ];

  discountBtns.forEach(item => {
    if (item.btn) {
      item.btn.addEventListener('click', () => {
        const isAlreadyActive = item.btn.classList.contains('active');
        discountBtns.forEach(b => b.btn.classList.remove('active'));

        if (isAlreadyActive) {
          state.discount.preset = 0;
        } else {
          item.btn.classList.add('active');
          state.discount.preset = item.pct;
        }
        calculateTotal();
      });
    }
  });

  customDiscountType.addEventListener('change', (e) => {
    state.discount.customType = e.target.value;
    const isNone = e.target.value === 'none';
    customDiscountVal.disabled = isNone;
    if (isNone) {
      customDiscountVal.value = 0;
      state.discount.customValue = 0;
    }
    calculateTotal();
  });

  customDiscountVal.addEventListener('input', (e) => {
    state.discount.customValue = parseFloat(e.target.value) || 0;
    calculateTotal();
  });

  // Copy Actions
  btnCopyNumber.addEventListener('click', () => {
    const { finalTotal } = calculateTotal();
    const str = finalTotal.toString();
    copyToClipboard(str, `請求額 「 ${str} 」 をコピーしました！`);
  });

  btnCopyVault.addEventListener('click', () => {
    const { vaultAmount } = calculateTotal();
    const str = vaultAmount.toString();
    copyToClipboard(str, `金庫額(3割) 「 ${str} 」 をコピーしました！`);
  });

  btnCopyVaultSummary.addEventListener('click', () => {
    const { vaultAmount } = calculateTotal();
    const summary = getSummaryText();
    const text = `${vaultAmount} ${summary}`;
    copyToClipboard(text, `「 ${text} 」 をコピーしました！`);
  });

  btnCopyOwnCar.addEventListener('click', () => {
    const { vaultAmount } = calculateTotal();
    const summary = getSummaryText();
    const text = `自車 ${vaultAmount} ${summary}`;
    copyToClipboard(text, `「 ${text} 」 をコピーしました！`);
  });

  // Reset
  btnResetCustom.addEventListener('click', () => {
    cntNosRefill.value = 0;
    cntNosNew.value = 0;
    cntExteriorBase.value = 0;
    cntWheels.value = 0;
    cntStance.value = 0;
    cntDuctTape.value = 0;
    cntCarWash.value = 0;
    cntNeonCtrl.value = 0;
    cntAirSusCtrl.value = 0;

    state.repairs = { nosRefillCount: 0, nosNewCount: 0 };
    state.exterior = { base: 0, wheels: 0, stance: 0 };
    state.items = { ductTape: 0, carWash: 0, neonCtrl: 0, airSusCtrl: 0 };

    levelGroups.forEach(group => {
      const container = document.getElementById(group.elementId);
      const display = document.getElementById(group.displayId);
      if (container && display) {
        container.querySelectorAll('.lvl-btn').forEach(b => b.classList.remove('active'));
        display.textContent = '未選択';
      }
      group.setValue(0);
    });

    chkTurbo.checked = false;
    chkAntiLag.checked = false;
    chkHarness.checked = false;
    state.performance.turbo = false;
    state.performance.antiLag = false;
    state.performance.harness = false;

    state.discount = { preset: 0, customType: 'none', customValue: 0 };
    discountBtns.forEach(b => b.btn.classList.remove('active'));
    customDiscountType.value = 'none';
    customDiscountVal.value = 0;
    customDiscountVal.disabled = true;

    calculateTotal();
    showToast('すべての選択をリセットしました');
  });

  calculateTotal();
});
