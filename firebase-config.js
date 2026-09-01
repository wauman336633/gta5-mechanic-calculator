// Firebase Config & Shop Manager Module

// デフォルト設定価格（標準初期価格 - 旧互換スキーマ）
const DEFAULT_PRICES = {
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
  repairItems: {
    ductTape: 50000,
    carWash: 50000,
    neonCtrl: 200000,
    airSusCtrl: 1000000
  },
  custom: {
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
      antiLag: 5000000,
      harness: 1000000
    },
    items: {
      ductTape: 50000,
      carWash: 50000,
      neonCtrl: 200000,
      airSusCtrl: 1000000
    }
  },
  buyback: {
    Steel: 1500,
    Iron: 1500,
    Scrap: 300,
    Plastic: 500,
    Aluminum: 1000,
    Rubber: 500,
    Glass: 500,
    Copper: 500
  }
};

// デフォルト動的設定（新動的スキーマ）
const DEFAULT_CUSTOM_CONFIG = {
  repairs: {
    baseRepairs: [
      { id: 'full', name: 'フル修理 (全損)', type: 'dual_mode', shopPrice: 200000, onsitePrice: 300000, description: '全損・大破時の基本修理' },
      { id: 'engine', name: 'エンジン修理', type: 'dual_mode', shopPrice: 75000, onsitePrice: 125000, description: 'エンジン単体の修理' },
      { id: 'body', name: '外装修理', type: 'dual_mode', shopPrice: 75000, onsitePrice: 125000, description: 'ボディ・外装単体の修理' }
    ],
    degradedParts: [
      { id: 'oilPump', name: 'オイルポンプ', type: 'checkbox', price: 10000 },
      { id: 'battery', name: 'バッテリー', type: 'checkbox', price: 10000 },
      { id: 'fuelTank', name: '燃料タンク', type: 'checkbox', price: 10000 },
      { id: 'driveShaft', name: 'ドライブシャフト', type: 'checkbox', price: 10000 },
      { id: 'cylinder', name: 'シリンダー', type: 'checkbox', price: 10000 }
    ],
    extraServices: [
      { id: 'tires', name: 'タイヤ交換', type: 'stepper', price: 100000, min: 0, max: 4, unit: '本' },
      { id: 'aircraft', name: '航空機修理加算', type: 'checkbox', price: 100000 },
      { id: 'nosRefill', name: 'NOS (充填)', type: 'stepper', price: 400000, min: 0, max: 20, unit: '本' },
      { id: 'nosNew', name: 'NOS (新規取付)', type: 'stepper', price: 500000, min: 0, max: 20, unit: '本' }
    ]
  },
  repairItems: [
    { id: 'ductTape', name: 'ダクトテープ', type: 'stepper', price: 50000, min: 0, max: 99, unit: '個' },
    { id: 'carWash', name: '洗車キット', type: 'stepper', price: 50000, min: 0, max: 99, unit: '個' },
    { id: 'neonCtrl', name: 'ネオンコントローラー', type: 'stepper', price: 200000, min: 0, max: 99, unit: '個' },
    { id: 'airSusCtrl', name: 'エアサスコントローラー', type: 'stepper', price: 1000000, min: 0, max: 99, unit: '個' }
  ],
  custom: {
    exterior: [
      { id: 'base', name: '外装カスタムパーツ', type: 'stepper', price: 50000, min: 0, max: 99, unit: '箇所' },
      { id: 'wheels', name: 'ホイール交換', type: 'checkbox', price: 200000 },
      { id: 'stance', name: 'スタンスキット', type: 'checkbox', price: 100000 }
    ],
    performance: [
      { id: 'engine', name: 'エンジン', type: 'tiered', prices: [0, 3000000, 5000000, 10000000, 15000000, 25000000], labels: ['なし', 'Lv 1', 'Lv 2', 'Lv 3', 'Lv 4', 'Lv 5'] },
      { id: 'brakes', name: 'ブレーキ', type: 'tiered', prices: [0, 3000000, 6000000, 8000000], labels: ['なし', 'Lv 1', 'Lv 2', 'Lv 3'] },
      { id: 'suspension', name: 'サスペンション', type: 'tiered', prices: [0, 3000000, 5000000, 8000000, 10000000, 12000000], labels: ['なし', 'Lv 1', 'Lv 2', 'Lv 3', 'Lv 4', 'Lv 5'] },
      { id: 'transmission', name: 'トランスミッション', type: 'tiered', prices: [0, 3000000, 5000000, 10000000, 12000000], labels: ['なし', 'Lv 1', 'Lv 2', 'Lv 3', 'Lv 4'] },
      { id: 'durability', name: '耐久値 (アーマー)', type: 'tiered', prices: [0, 300000, 500000, 700000], labels: ['なし', 'Lv 1', 'Lv 2', 'Lv 3'] },
      { id: 'turbo', name: 'ターボ', type: 'checkbox', price: 3000000 },
      { id: 'antiLag', name: 'アンチラグ', type: 'checkbox', price: 5000000 },
      { id: 'harness', name: 'ハーネス (4点式)', type: 'checkbox', price: 1000000 }
    ],
    repairs: [
      { id: 'nosRefill', name: 'NOS (充填)', type: 'stepper', price: 400000, min: 0, max: 20, unit: '本' },
      { id: 'nosNew', name: 'NOS (新規取付)', type: 'stepper', price: 500000, min: 0, max: 20, unit: '本' }
    ],
    items: [
      { id: 'ductTape', name: 'ダクトテープ', type: 'stepper', price: 50000, min: 0, max: 99, unit: '個' },
      { id: 'carWash', name: '洗車キット', type: 'stepper', price: 50000, min: 0, max: 99, unit: '個' },
      { id: 'neonCtrl', name: 'ネオンコントローラー', type: 'stepper', price: 200000, min: 0, max: 99, unit: '個' },
      { id: 'airSusCtrl', name: 'エアサスコントローラー', type: 'stepper', price: 1000000, min: 0, max: 99, unit: '個' }
    ]
  },
  buyback: [
    { id: 'Steel', name: 'Steel (鉄)', type: 'stepper', price: 1500, min: 0, max: 99999, unit: '個' },
    { id: 'Iron', name: 'Iron (鉱石)', type: 'stepper', price: 1500, min: 0, max: 99999, unit: '個' },
    { id: 'Scrap', name: 'Scrap (スクラップ)', type: 'stepper', price: 300, min: 0, max: 99999, unit: '個' },
    { id: 'Plastic', name: 'Plastic (プラスチック)', type: 'stepper', price: 500, min: 0, max: 99999, unit: '個' },
    { id: 'Aluminum', name: 'Aluminum (アルミ)', type: 'stepper', price: 1000, min: 0, max: 99999, unit: '個' },
    { id: 'Rubber', name: 'Rubber (ゴム)', type: 'stepper', price: 500, min: 0, max: 99999, unit: '個' },
    { id: 'Glass', name: 'Glass (ガラス)', type: 'stepper', price: 500, min: 0, max: 99999, unit: '個' },
    { id: 'Copper', name: 'Copper (銅)', type: 'stepper', price: 500, min: 0, max: 99999, unit: '個' }
  ]
};

// スキーマ変換ユーティリティ：旧形式 prices から customConfig を構築
function buildCustomConfigFromLegacyPrices(legacyPrices) {
  const config = JSON.parse(JSON.stringify(DEFAULT_CUSTOM_CONFIG));
  if (!legacyPrices) return config;

  // 1. repairs
  if (legacyPrices.repairs) {
    const rep = legacyPrices.repairs;
    if (rep.full) {
      const item = config.repairs.baseRepairs.find(x => x.id === 'full');
      if (item) {
        if (rep.full.shop != null) item.shopPrice = Number(rep.full.shop);
        if (rep.full.onsite != null) item.onsitePrice = Number(rep.full.onsite);
      }
    }
    if (rep.engine) {
      const item = config.repairs.baseRepairs.find(x => x.id === 'engine');
      if (item) {
        if (rep.engine.shop != null) item.shopPrice = Number(rep.engine.shop);
        if (rep.engine.onsite != null) item.onsitePrice = Number(rep.engine.onsite);
      }
    }
    if (rep.body) {
      const item = config.repairs.baseRepairs.find(x => x.id === 'body');
      if (item) {
        if (rep.body.shop != null) item.shopPrice = Number(rep.body.shop);
        if (rep.body.onsite != null) item.onsitePrice = Number(rep.body.onsite);
      }
    }
    if (rep.degradedPartUnit != null) {
      config.repairs.degradedParts.forEach(part => {
        part.price = Number(rep.degradedPartUnit);
      });
    }
    if (rep.tires != null) {
      const item = config.repairs.extraServices.find(x => x.id === 'tires');
      if (item) item.price = Number(rep.tires);
    }
    if (rep.aircraft != null) {
      const item = config.repairs.extraServices.find(x => x.id === 'aircraft');
      if (item) item.price = Number(rep.aircraft);
    }
    if (rep.nosRefill != null) {
      const item = config.repairs.extraServices.find(x => x.id === 'nosRefill');
      if (item) item.price = Number(rep.nosRefill);
    }
    if (rep.nosNew != null) {
      const item = config.repairs.extraServices.find(x => x.id === 'nosNew');
      if (item) item.price = Number(rep.nosNew);
    }
  }

  // 2. repairItems
  if (legacyPrices.repairItems) {
    Object.keys(legacyPrices.repairItems).forEach(key => {
      const item = config.repairItems.find(x => x.id === key);
      if (item && legacyPrices.repairItems[key] != null) {
        item.price = Number(legacyPrices.repairItems[key]);
      }
    });
  }

  // 3. custom
  if (legacyPrices.custom) {
    const cust = legacyPrices.custom;
    if (cust.exterior) {
      Object.keys(cust.exterior).forEach(key => {
        const item = config.custom.exterior.find(x => x.id === key);
        if (item && cust.exterior[key] != null) {
          item.price = Number(cust.exterior[key]);
        }
      });
    }
    if (cust.performance) {
      Object.keys(cust.performance).forEach(key => {
        const item = config.custom.performance.find(x => x.id === key);
        if (item) {
          if (Array.isArray(cust.performance[key])) {
            item.prices = cust.performance[key].map(Number);
          } else if (cust.performance[key] != null) {
            item.price = Number(cust.performance[key]);
          }
        }
      });
    }
    if (cust.repairs) {
      Object.keys(cust.repairs).forEach(key => {
        const item = config.custom.repairs.find(x => x.id === key);
        if (item && cust.repairs[key] != null) item.price = Number(cust.repairs[key]);
      });
    }
    if (cust.items) {
      Object.keys(cust.items).forEach(key => {
        const item = config.custom.items.find(x => x.id === key);
        if (item && cust.items[key] != null) item.price = Number(cust.items[key]);
      });
    }
  }

  // 4. buyback
  if (legacyPrices.buyback) {
    Object.keys(legacyPrices.buyback).forEach(key => {
      const item = config.buyback.find(x => x.id === key);
      if (item && legacyPrices.buyback[key] != null) {
        item.price = Number(legacyPrices.buyback[key]);
      } else if (!item && legacyPrices.buyback[key] != null) {
        // 新規キーの場合も追加
        config.buyback.push({
          id: key,
          name: key,
          type: 'stepper',
          price: Number(legacyPrices.buyback[key]),
          min: 0,
          max: 99999,
          unit: '個'
        });
      }
    });
  }

  return config;
}

// スキーマ変換ユーティリティ：customConfig から旧互換 prices を自動構築
function buildLegacyPricesFromCustomConfig(customConfig) {
  const prices = JSON.parse(JSON.stringify(DEFAULT_PRICES));
  if (!customConfig) return prices;

  // 1. repairs
  if (customConfig.repairs) {
    if (Array.isArray(customConfig.repairs.baseRepairs)) {
      const full = customConfig.repairs.baseRepairs.find(x => x.id === 'full');
      if (full) {
        prices.repairs.full = { shop: Number(full.shopPrice || 0), onsite: Number(full.onsitePrice || 0) };
      }
      const engine = customConfig.repairs.baseRepairs.find(x => x.id === 'engine');
      if (engine) {
        prices.repairs.engine = { shop: Number(engine.shopPrice || 0), onsite: Number(engine.onsitePrice || 0) };
      }
      const body = customConfig.repairs.baseRepairs.find(x => x.id === 'body');
      if (body) {
        prices.repairs.body = { shop: Number(body.shopPrice || 0), onsite: Number(body.onsitePrice || 0) };
      }
    }
    if (Array.isArray(customConfig.repairs.degradedParts) && customConfig.repairs.degradedParts.length > 0) {
      prices.repairs.degradedPartUnit = Number(customConfig.repairs.degradedParts[0].price || 0);
    }
    if (Array.isArray(customConfig.repairs.extraServices)) {
      const tires = customConfig.repairs.extraServices.find(x => x.id === 'tires');
      if (tires) prices.repairs.tires = Number(tires.price || 0);
      const aircraft = customConfig.repairs.extraServices.find(x => x.id === 'aircraft');
      if (aircraft) prices.repairs.aircraft = Number(aircraft.price || 0);
      const nosRefill = customConfig.repairs.extraServices.find(x => x.id === 'nosRefill');
      if (nosRefill) prices.repairs.nosRefill = Number(nosRefill.price || 0);
      const nosNew = customConfig.repairs.extraServices.find(x => x.id === 'nosNew');
      if (nosNew) prices.repairs.nosNew = Number(nosNew.price || 0);
    }
  }

  // 2. repairItems
  if (Array.isArray(customConfig.repairItems)) {
    customConfig.repairItems.forEach(item => {
      prices.repairItems[item.id] = Number(item.price || 0);
    });
  }

  // 3. custom
  if (customConfig.custom) {
    if (Array.isArray(customConfig.custom.exterior)) {
      customConfig.custom.exterior.forEach(item => {
        prices.custom.exterior[item.id] = Number(item.price || 0);
      });
    }
    if (Array.isArray(customConfig.custom.performance)) {
      customConfig.custom.performance.forEach(item => {
        if (item.type === 'tiered') {
          prices.custom.performance[item.id] = Array.isArray(item.prices) ? item.prices.map(Number) : [];
        } else {
          prices.custom.performance[item.id] = Number(item.price || 0);
        }
      });
    }
    if (Array.isArray(customConfig.custom.repairs)) {
      customConfig.custom.repairs.forEach(item => {
        prices.custom.repairs[item.id] = Number(item.price || 0);
      });
    }
    if (Array.isArray(customConfig.custom.items)) {
      customConfig.custom.items.forEach(item => {
        prices.custom.items[item.id] = Number(item.price || 0);
      });
    }
  }

  // 4. buyback
  if (Array.isArray(customConfig.buyback)) {
    customConfig.buyback.forEach(item => {
      prices.buyback[item.id] = Number(item.price || 0);
    });
  }

  return prices;
}

// 店舗設定オブジェクトの正規化
function normalizeShopConfig(docData) {
  let prices = JSON.parse(JSON.stringify(DEFAULT_PRICES));
  let customConfig = JSON.parse(JSON.stringify(DEFAULT_CUSTOM_CONFIG));

  if (!docData) {
    return { prices, customConfig };
  }

  if (docData.customConfig) {
    customConfig = mergeDeep(customConfig, docData.customConfig);
    prices = buildLegacyPricesFromCustomConfig(customConfig);
  } else if (docData.prices) {
    prices = mergeDeep(prices, docData.prices);
    customConfig = buildCustomConfigFromLegacyPrices(prices);
  }

  return { prices, customConfig };
}

// 1. Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAunHB71Y9SlNc2DS6cc3vPnGyQ1RBSbUo",
  authDomain: "mechanic-calculator.firebaseapp.com",
  projectId: "mechanic-calculator",
  storageBucket: "mechanic-calculator.firebasestorage.app",
  messagingSenderId: "728261647308",
  appId: "1:728261647308:web:e4865ff743e195bcce9b69",
  measurementId: "G-MQD7MQCZ4F"
};

let db = null;
let auth = null;
let analytics = null;
let firebaseInitialized = false;

function isLocalOrTestEnv() {
  if (typeof window === 'undefined' || !window.location) return true;
  const hostname = window.location.hostname || '';
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '' || hostname === '0.0.0.0';
}

function initAnalytics() {
  if (analytics) return analytics;
  if (typeof firebase !== 'undefined' && typeof firebase.analytics === 'function' && firebaseConfig.measurementId) {
    if (!isLocalOrTestEnv()) {
      try {
        analytics = firebase.analytics();
      } catch (e) {
        console.warn("Analytics initialization failed", e);
      }
    }
  }
  return analytics;
}

function initFirebase() {
  if (typeof firebase !== 'undefined' && firebaseConfig.apiKey !== "YOUR_API_KEY") {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
    if (firebase.auth) {
      auth = firebase.auth();
    }
    initAnalytics();
    firebaseInitialized = true;
  }
}

function trackEvent(eventName, eventParams = {}) {
  initFirebase();
  if (isLocalOrTestEnv() || !analytics) {
    console.log('[Analytics (Local)]', eventName, eventParams);
    return;
  }
  try {
    analytics.logEvent(eventName, eventParams);
  } catch (e) {
    console.warn('[Analytics Error]', e);
  }
}

if (typeof window !== 'undefined') {
  window.trackEvent = trackEvent;
  // ページロード時に即時・安全に初期化してGA4 page_view を自動送信
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initFirebase());
  } else {
    initFirebase();
  }
}

// 2. 店舗ID管理
const STORAGE_KEY = 'mechanic_shop_id';
const DEFAULT_SHOP_ID = 'sample';

function getShopId() {
  const urlParams = new URLSearchParams(window.location.search);
  let shopId = urlParams.get('shop');
  
  if (shopId) {
    shopId = shopId.toLowerCase().trim();
    localStorage.setItem(STORAGE_KEY, shopId);
    return shopId;
  }
  
  shopId = localStorage.getItem(STORAGE_KEY);
  if (!shopId) {
    shopId = DEFAULT_SHOP_ID;
    localStorage.setItem(STORAGE_KEY, shopId);
  }
  return shopId;
}

function setShopId(shopId) {
  const cleanId = shopId.toLowerCase().trim();
  localStorage.setItem(STORAGE_KEY, cleanId);
  if (typeof trackEvent === 'function') {
    trackEvent('shop_change', { shop_id: cleanId });
  }
  return cleanId;
}

const SAMPLE_SHOP_ID = 'sample';
const SAMPLE_PASSCODE = '1111';
const SAMPLE_RESET_INTERVAL_MS = 60 * 60 * 1000; // 1時間 (ミリ秒)

// パスコードのSHA-256ハッシュ化（Web Crypto API）- shopIdをSaltとして利用
async function hashPasscode(passcode, shopId) {
  if (!passcode || !shopId) return '';
  const cleanShopId = String(shopId).toLowerCase().trim();
  const encoder = new TextEncoder();
  const data = encoder.encode(`${cleanShopId}:${passcode}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 深いマージを行うユーティリティ
function mergeDeep(target, source) {
  const isObject = obj => obj && typeof obj === 'object' && !Array.isArray(obj);
  if (!isObject(target) || !isObject(source)) {
    return source;
  }

  Object.keys(source).forEach(key => {
    const targetValue = target[key];
    const sourceValue = source[key];

    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      target[key] = [...sourceValue];
    } else if (isObject(targetValue) && isObject(sourceValue)) {
      target[key] = mergeDeep(Object.assign({}, targetValue), sourceValue);
    } else {
      target[key] = sourceValue;
    }
  });

  return target;
}

// 3. 店舗データの購読 (リアルタイム更新)
function subscribeShopPrices(shopId, callback) {
  initFirebase();
  const cleanId = (shopId || '').toLowerCase().trim();
  
  // Firebase未設定またはオフライン時のフォールバック
  if (!firebaseInitialized || !db) {
    const localData = localStorage.getItem(`shop_prices_${cleanId}`);
    const localInfo = localStorage.getItem(`shop_info_${cleanId}`);
    let prices = JSON.parse(JSON.stringify(DEFAULT_PRICES));
    let customConfig = JSON.parse(JSON.stringify(DEFAULT_CUSTOM_CONFIG));
    let shopName = cleanId === SAMPLE_SHOP_ID ? 'サンプル店舗' : cleanId.toUpperCase();
    const isNotFound = cleanId !== SAMPLE_SHOP_ID && !localData && !localInfo;

    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        if (cleanId === SAMPLE_SHOP_ID && parsed.updatedAt) {
          const lastUpdated = new Date(parsed.updatedAt).getTime();
          const now = Date.now();
          if (!isNaN(lastUpdated) && (now - lastUpdated > SAMPLE_RESET_INTERVAL_MS)) {
            // 1時間経過しているため初期設定にリセット
            localStorage.setItem(`shop_prices_${cleanId}`, JSON.stringify({
              id: cleanId,
              name: 'サンプル店舗',
              prices: DEFAULT_PRICES,
              customConfig: DEFAULT_CUSTOM_CONFIG,
              updatedAt: new Date().toISOString()
            }));
          } else {
            const normalized = normalizeShopConfig(parsed);
            prices = normalized.prices;
            customConfig = normalized.customConfig;
            if (parsed.name) shopName = parsed.name;
          }
        } else {
          const normalized = normalizeShopConfig(parsed);
          prices = normalized.prices;
          customConfig = normalized.customConfig;
          if (parsed.name) shopName = parsed.name;
        }
      } catch (e) {
        console.error("Local data parse error", e);
      }
    }
    const shopInfo = {
      id: cleanId,
      name: shopName,
      prices,
      customConfig,
      notFound: isNotFound
    };
    callback(shopInfo);
    return () => {};
  }

  // Firestoreからリアルタイム受信
  const unsubscribe = db.collection('shops').doc(cleanId).onSnapshot(async doc => {
    let shopInfo = {
      id: cleanId,
      name: cleanId === SAMPLE_SHOP_ID ? 'サンプル店舗' : cleanId.toUpperCase(),
      prices: JSON.parse(JSON.stringify(DEFAULT_PRICES)),
      customConfig: JSON.parse(JSON.stringify(DEFAULT_CUSTOM_CONFIG)),
      notFound: false
    };

    if (doc.exists) {
      const data = doc.data();
      shopInfo.name = data.name || shopInfo.name;

      // sample店舗の自動リセット判定（1時間経過で初期化）
      if (cleanId === SAMPLE_SHOP_ID && data.updatedAt) {
        const lastUpdated = new Date(data.updatedAt).getTime();
        const now = Date.now();
        if (!isNaN(lastUpdated) && (now - lastUpdated > SAMPLE_RESET_INTERVAL_MS)) {
          try {
            const sampleHashedPasscode = await hashPasscode(SAMPLE_PASSCODE, SAMPLE_SHOP_ID);
            const resetUpdate = {
              prices: DEFAULT_PRICES,
              customConfig: DEFAULT_CUSTOM_CONFIG,
              updatedAt: new Date().toISOString()
            };
            if (data.passcodeHash) {
              resetUpdate.passcodeHash = firebase.firestore.FieldValue.delete();
            }
            if (data.passcode) {
              resetUpdate.passcode = firebase.firestore.FieldValue.delete();
            }
            await db.collection('shops').doc(cleanId).update(resetUpdate);
            await db.collection('shops').doc(cleanId).collection('auth').doc('secret').set({
              passcodeHash: sampleHashedPasscode
            }).catch(() => {});
          } catch (e) {
            console.warn("Sample shop reset error", e);
          }
          shopInfo.prices = JSON.parse(JSON.stringify(DEFAULT_PRICES));
          shopInfo.customConfig = JSON.parse(JSON.stringify(DEFAULT_CUSTOM_CONFIG));
          localStorage.setItem(`shop_prices_${cleanId}`, JSON.stringify(shopInfo));
          callback(shopInfo);
          return;
        }
      }

      const normalized = normalizeShopConfig(data);
      shopInfo.prices = normalized.prices;
      shopInfo.customConfig = normalized.customConfig;
      // キャッシュ保存
      localStorage.setItem(`shop_prices_${cleanId}`, JSON.stringify(shopInfo));
    } else {
      if (cleanId !== SAMPLE_SHOP_ID) {
        shopInfo.notFound = true;
      }
    }
    
    callback(shopInfo);
  }, error => {
    console.warn("Firestore access error, fallback to default", error);
    callback({
      id: cleanId,
      name: cleanId === SAMPLE_SHOP_ID ? 'サンプル店舗' : cleanId.toUpperCase(),
      prices: JSON.parse(JSON.stringify(DEFAULT_PRICES)),
      customConfig: JSON.parse(JSON.stringify(DEFAULT_CUSTOM_CONFIG)),
      notFound: false
    });
  });

  return unsubscribe;
}

// 4. Google Authentication & ユーザー管理
async function signInWithGoogle() {
  initFirebase();
  if (!auth) {
    throw new Error("Firebase Auth が利用できません。");
  }
  const provider = new firebase.auth.GoogleAuthProvider();
  const result = await auth.signInWithPopup(provider);
  return result.user;
}

async function signOutUser() {
  initFirebase();
  if (auth) {
    await auth.signOut();
  }
}

function getCurrentUser() {
  initFirebase();
  return auth ? auth.currentUser : null;
}

function onAuthChange(callback) {
  initFirebase();
  if (auth) {
    return auth.onAuthStateChanged(callback);
  }
  if (typeof callback === 'function') {
    callback(null);
  }
  return () => {};
}

// 5. 店舗メタデータ取得
async function getShopInfo(shopId) {
  initFirebase();
  const cleanId = (shopId || '').toLowerCase().trim();
  if (!cleanId) return null;
  if (cleanId === SAMPLE_SHOP_ID) {
    return { id: SAMPLE_SHOP_ID, name: 'サンプル店舗', ownerUid: null };
  }

  if (firebaseInitialized && db) {
    try {
      const docRef = db.collection('shops').doc(cleanId);
      const doc = await docRef.get();
      if (!doc.exists) {
        return null;
      }
      const data = doc.data();
      return {
        id: cleanId,
        name: data.name || cleanId,
        ownerUid: data.ownerUid || null,
        ownerEmail: data.ownerEmail || null,
        ownerDisplayName: data.ownerDisplayName || null,
        createdAt: data.createdAt || null,
        updatedAt: data.updatedAt || null
      };
    } catch (e) {
      console.warn("Firestore getShopInfo error, fallback to local", e);
      const cached = localStorage.getItem(`shop_info_${cleanId}`) || localStorage.getItem(`shop_prices_${cleanId}`);
      if (cached) {
        return JSON.parse(cached);
      }
      return null;
    }
  } else {
    const cached = localStorage.getItem(`shop_info_${cleanId}`) || localStorage.getItem(`shop_prices_${cleanId}`);
    if (cached) {
      return JSON.parse(cached);
    }
    return null;
  }
}

// 5.1 店舗存在チェック
async function checkShopExists(shopId) {
  const info = await getShopInfo(shopId);
  return info !== null;
}

// 6. 店舗の新規作成
async function createShop(shopId, shopName, passcode) {
  initFirebase();
  const cleanId = (shopId || '').toLowerCase().trim();
  const cleanName = (shopName || '').trim();

  if (!cleanId || !cleanName || !passcode) {
    throw new Error("すべての必須項目を入力してください。");
  }

  const shopIdPattern = /^[a-z0-9_-]{2,30}$/;
  if (!shopIdPattern.test(cleanId)) {
    throw new Error("店舗IDは2〜30文字の半角英数字、ハイフン(-)、アンダースコア(_)のみ使用できます。");
  }

  if (cleanName.length > 50) {
    throw new Error("店舗名は50文字以内で入力してください。");
  }

  const hashed = await hashPasscode(passcode, cleanId);
  const currentUser = getCurrentUser();
  
  const publicData = {
    id: cleanId,
    name: cleanName,
    prices: DEFAULT_PRICES,
    customConfig: DEFAULT_CUSTOM_CONFIG,
    createdAt: new Date().toISOString()
  };

  if (currentUser) {
    publicData.ownerUid = currentUser.uid;
    publicData.ownerEmail = currentUser.email || '';
    publicData.ownerDisplayName = currentUser.displayName || '';
  }

  if (firebaseInitialized && db) {
    const docRef = db.collection('shops').doc(cleanId);
    const doc = await docRef.get();
    if (doc.exists) {
      throw new Error("指定された店舗IDは既に登録されています。別のIDをお試しください。");
    }

    const batch = db.batch();
    batch.set(docRef, publicData);
    const secretRef = docRef.collection('auth').doc('secret');
    batch.set(secretRef, { passcodeHash: hashed });
    await batch.commit();
  } else {
    // ローカルでのシミュレーション保存
    if (localStorage.getItem(`shop_info_${cleanId}`)) {
      throw new Error("指定された店舗IDは既に登録されています。");
    }
    localStorage.setItem(`shop_info_${cleanId}`, JSON.stringify({ ...publicData }));
    localStorage.setItem(`shop_secret_${cleanId}`, JSON.stringify({ passcodeHash: hashed }));
    localStorage.setItem(`shop_prices_${cleanId}`, JSON.stringify({ id: cleanId, name: cleanName, prices: DEFAULT_PRICES, customConfig: DEFAULT_CUSTOM_CONFIG }));
  }

  setShopId(cleanId);
  return cleanId;
}

// 7. 価格設定の更新（非破壊デュアルモード保存）
async function updateShopPrices(shopId, passcode, newPrices, newCustomConfig) {
  initFirebase();
  const cleanId = (shopId || '').toLowerCase().trim();
  const currentUser = getCurrentUser();

  // sample店舗のパスコード検証（1111固定）
  if (cleanId === SAMPLE_SHOP_ID) {
    if (passcode !== SAMPLE_PASSCODE) {
      throw new Error("管理パスコードが一致しません。");
    }
  }

  // newCustomConfig と newPrices の整合性を自動調整
  let finalCustomConfig = newCustomConfig;
  let finalPrices = newPrices;

  if (finalCustomConfig && !finalPrices) {
    finalPrices = buildLegacyPricesFromCustomConfig(finalCustomConfig);
  } else if (finalPrices && !finalCustomConfig) {
    finalCustomConfig = buildCustomConfigFromLegacyPrices(finalPrices);
  } else if (!finalCustomConfig && !finalPrices) {
    finalCustomConfig = DEFAULT_CUSTOM_CONFIG;
    finalPrices = DEFAULT_PRICES;
  }

  if (firebaseInitialized && db) {
    const docRef = db.collection('shops').doc(cleanId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      const sampleHash = await hashPasscode(SAMPLE_PASSCODE, SAMPLE_SHOP_ID);
      const batch = db.batch();
      batch.set(docRef, {
        id: cleanId,
        name: cleanId === SAMPLE_SHOP_ID ? 'サンプル店舗' : cleanId.toUpperCase(),
        prices: finalPrices,
        customConfig: finalCustomConfig,
        updatedAt: new Date().toISOString()
      });
      batch.set(docRef.collection('auth').doc('secret'), {
        passcodeHash: cleanId === SAMPLE_SHOP_ID ? sampleHash : ''
      });
      await batch.commit();
      return true;
    }

    const data = doc.data() || {};
    const isOwner = currentUser && data.ownerUid && data.ownerUid === currentUser.uid;

    if (!isOwner && cleanId !== SAMPLE_SHOP_ID) {
      throw new Error("設定を変更するには、店舗オーナーとしてGoogleログインする必要があります。");
    }

    const updatePayload = {
      id: cleanId,
      prices: finalPrices,
      customConfig: finalCustomConfig,
      updatedAt: new Date().toISOString()
    };

    // レガシー店舗の場合、平文passcodeやpasscodeHashがあれば削除
    if (data.passcode) {
      updatePayload.passcode = firebase.firestore.FieldValue.delete();
    }
    if (data.passcodeHash) {
      updatePayload.passcodeHash = firebase.firestore.FieldValue.delete();
    }

    await docRef.update(updatePayload);
    return true;
  } else {
    // オフライン・ローカル保存
    const cachedInfo = localStorage.getItem(`shop_info_${cleanId}`);
    if (cachedInfo && cleanId !== SAMPLE_SHOP_ID) {
      const parsed = JSON.parse(cachedInfo);
      const isOwner = currentUser && parsed.ownerUid && parsed.ownerUid === currentUser.uid;
      if (!isOwner) {
        const secretData = localStorage.getItem(`shop_secret_${cleanId}`);
        const hashedInput = passcode ? await hashPasscode(passcode, cleanId) : '';
        let isMatch = false;
        if (secretData) {
          const secret = JSON.parse(secretData);
          isMatch = secret.passcodeHash === hashedInput;
        } else if (parsed.passcodeHash) {
          isMatch = (parsed.passcodeHash === hashedInput) || (parsed.passcode && parsed.passcode === passcode);
        }
        if (!isMatch) {
          throw new Error("設定を変更するにはオーナーとしてログインするか、正しいパスコードが必要です。");
        }
      }
    }
    localStorage.setItem(`shop_prices_${cleanId}`, JSON.stringify({
      id: cleanId,
      name: cleanId === SAMPLE_SHOP_ID ? 'サンプル店舗' : cleanId,
      prices: finalPrices,
      customConfig: finalCustomConfig,
      updatedAt: new Date().toISOString()
    }));
    return true;
  }
}

// 8. 店舗検証（パスコードチェック）
async function verifyShopPasscode(shopId, passcode) {
  initFirebase();
  const cleanId = (shopId || '').toLowerCase().trim();

  if (cleanId === SAMPLE_SHOP_ID) {
    return passcode === SAMPLE_PASSCODE;
  }

  if (!passcode) {
    return false;
  }

  const hashedInput = await hashPasscode(passcode, cleanId);

  if (firebaseInitialized && db) {
    const docRef = db.collection('shops').doc(cleanId);
    
    // 店舗の存在確認
    const doc = await docRef.get();
    if (!doc.exists) {
      const notFoundErr = new Error("店舗が存在しません。");
      notFoundErr.code = "not-found";
      throw notFoundErr;
    }

    // /auth/verify への書き込み試行によるルール側照合（平文passcodeは書き込まずpasscodeHashのみ）
    try {
      const verifyRef = docRef.collection('auth').doc('verify');
      await verifyRef.set({
        passcodeHash: hashedInput,
        verifiedAt: new Date().toISOString()
      });
      return true;
    } catch (e) {
      if (e.code === 'permission-denied') {
        return false;
      }
      throw e;
    }
  } else {
    const secretData = localStorage.getItem(`shop_secret_${cleanId}`);
    if (secretData) {
      const secret = JSON.parse(secretData);
      return secret.passcodeHash === hashedInput;
    }
    const cachedInfo = localStorage.getItem(`shop_info_${cleanId}`);
    if (cachedInfo) {
      const parsed = JSON.parse(cachedInfo);
      return (parsed.passcodeHash && parsed.passcodeHash === hashedInput) ||
             (parsed.passcode && parsed.passcode === passcode);
    }
    return false;
  }
}

// 9. パスコードの変更・再設定
async function updateShopPasscode(shopId, newPasscode, currentPasscode = null) {
  initFirebase();
  const cleanId = (shopId || '').toLowerCase().trim();

  if (!newPasscode || newPasscode.length < 4 || newPasscode.length > 32) {
    throw new Error("新しいパスコードは4〜32文字で入力してください。");
  }

  if (cleanId === SAMPLE_SHOP_ID) {
    throw new Error("サンプル店舗のパスコードは変更できません。");
  }

  const newHashed = await hashPasscode(newPasscode, cleanId);
  const currentUser = getCurrentUser();

  if (firebaseInitialized && db) {
    const docRef = db.collection('shops').doc(cleanId);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new Error("店舗が存在しません。");
    }

    const data = doc.data() || {};
    const isOwner = currentUser && data.ownerUid && data.ownerUid === currentUser.uid;

    if (!isOwner) {
      if (!currentPasscode) {
        throw new Error("現在のパスコードを入力するか、オーナーとしてログインしてください。");
      }
      const isValid = await verifyShopPasscode(cleanId, currentPasscode);
      if (!isValid) {
        throw new Error("現在のパスコードが一致しません。");
      }
    }

    // /auth/secret を更新または作成
    const secretRef = docRef.collection('auth').doc('secret');
    await secretRef.set({ passcodeHash: newHashed });

    // レガシー店舗用フィールドがあれば整理
    if (data.passcode || data.passcodeHash) {
      await docRef.update({
        passcode: firebase.firestore.FieldValue.delete(),
        passcodeHash: firebase.firestore.FieldValue.delete()
      }).catch(() => {});
    }

    return true;
  } else {
    if (currentPasscode) {
      const currentHashed = await hashPasscode(currentPasscode, cleanId);
      const secretData = localStorage.getItem(`shop_secret_${cleanId}`);
      let isMatch = false;
      if (secretData) {
        const secret = JSON.parse(secretData);
        isMatch = secret.passcodeHash === currentHashed;
      } else {
        const cachedInfo = localStorage.getItem(`shop_info_${cleanId}`);
        if (cachedInfo) {
          const parsed = JSON.parse(cachedInfo);
          isMatch = (parsed.passcodeHash && parsed.passcodeHash === currentHashed) ||
                    (parsed.passcode && parsed.passcode === currentPasscode);
        }
      }
      if (!isMatch) {
        throw new Error("現在のパスコードが一致しません。");
      }
    }
    localStorage.setItem(`shop_secret_${cleanId}`, JSON.stringify({ passcodeHash: newHashed }));
    const cachedInfo = localStorage.getItem(`shop_info_${cleanId}`);
    if (cachedInfo) {
      const parsed = JSON.parse(cachedInfo);
      delete parsed.passcode;
      delete parsed.passcodeHash;
      localStorage.setItem(`shop_info_${cleanId}`, JSON.stringify(parsed));
    }
    return true;
  }
}

// 10. 既存店舗のオーナー権限引き継ぎ（Google連携）
async function claimShopOwnership(shopId, passcode) {
  initFirebase();
  const cleanId = (shopId || '').toLowerCase().trim();
  const currentUser = getCurrentUser();

  if (!currentUser) {
    throw new Error("Googleアカウントでログインしてください。");
  }

  if (cleanId === SAMPLE_SHOP_ID) {
    throw new Error("サンプル店舗はオーナー登録できません。");
  }

  const isValid = await verifyShopPasscode(cleanId, passcode);
  if (!isValid) {
    throw new Error("パスコードが一致しません。");
  }

  const hashedInput = await hashPasscode(passcode, cleanId);

  if (firebaseInitialized && db) {
    const docRef = db.collection('shops').doc(cleanId);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new Error("店舗が存在しません。");
    }
    const data = doc.data() || {};
    if (data.ownerUid) {
      throw new Error("この店舗には既にオーナーが登録されています。");
    }

    const batch = db.batch();
    const updateData = {
      ownerUid: currentUser.uid,
      ownerEmail: currentUser.email || '',
      ownerDisplayName: currentUser.displayName || ''
    };
    if (data.passcode) {
      updateData.passcode = firebase.firestore.FieldValue.delete();
    }
    if (data.passcodeHash) {
      updateData.passcodeHash = firebase.firestore.FieldValue.delete();
    }
    batch.update(docRef, updateData);

    const secretRef = docRef.collection('auth').doc('secret');
    batch.set(secretRef, { passcodeHash: hashedInput }, { merge: true });
    await batch.commit();
    return true;
  } else {
    const cachedInfo = localStorage.getItem(`shop_info_${cleanId}`);
    if (cachedInfo) {
      const parsed = JSON.parse(cachedInfo);
      parsed.ownerUid = currentUser.uid;
      parsed.ownerEmail = currentUser.email || '';
      delete parsed.passcode;
      delete parsed.passcodeHash;
      localStorage.setItem(`shop_info_${cleanId}`, JSON.stringify(parsed));
    }
    return true;
  }
}

// 7. 店舗アクセス履歴管理
const HISTORY_KEY = 'mechanic_shop_history';

function getShopHistory() {
  const data = localStorage.getItem(HISTORY_KEY);
  if (data) {
    try {
      const history = JSON.parse(data);
      if (Array.isArray(history) && history.length > 0) {
        return history;
      }
    } catch (e) {
      console.error("History parse error", e);
    }
  }
  // デフォルト（初回訪問時）：サンプル店舗
  return [
    { id: 'sample', name: 'サンプル店舗', lastAccessedAt: new Date().toISOString() }
  ];
}

function addShopToHistory(shopId, shopName) {
  if (!shopId) return;
  const cleanId = shopId.toLowerCase().trim();
  const history = getShopHistory();

  // 'sample' は実際の履歴が追加されたら履歴リストから除外可能
  const filtered = history.filter(item => item.id !== cleanId && item.id !== 'sample');
  
  const newItem = {
    id: cleanId,
    name: shopName || cleanId.toUpperCase(),
    lastAccessedAt: new Date().toISOString()
  };

  filtered.unshift(newItem);
  // 最大10件まで保持
  const updatedHistory = filtered.slice(0, 10);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  return updatedHistory;
}

function removeShopFromHistory(shopId) {
  if (!shopId) return;
  const cleanId = shopId.toLowerCase().trim();
  let history = getShopHistory();
  history = history.filter(item => item.id !== cleanId);
  if (history.length === 0) {
    history = [{ id: 'sample', name: 'サンプル店舗', lastAccessedAt: new Date().toISOString() }];
  }
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  return history;
}

const GITHUB_REPO = "wauman336633/gta5-mechanic-calculator";
// Google Apps Script (GAS) 中継エンドポイント（Discord Webhook 隠蔽用プロキシ）
const GAS_FEEDBACK_API_URL = "https://script.google.com/macros/s/AKfycbxkZnUvD_t-g5Ypm3mtdQO3_TePZdq6KiIJOrEbfRnPpRtnuJCaTB0JMLAptYrssuUE/exec";

// フィードバック（不具合・要望）送信処理
async function sendFeedback({ type = 'bug', content = '', page = '', shopId = '', shopName = '' }) {
  if (!content || !content.trim()) {
    throw new Error("内容を入力してください。");
  }

  const cleanContent = content.trim();
  const pageUrl = page || window.location.href;
  const typeMap = {
    bug: { name: '🐛 不具合報告', label: 'bug', prefix: '[Bug]' },
    feature: { name: '💡 機能・要望', label: 'enhancement', prefix: '[Feature]' },
    other: { name: '❓ その他', label: 'feedback', prefix: '[Feedback]' }
  };
  const currentTypeInfo = typeMap[type] || typeMap.other;

  // GitHub Issue作成用URL生成
  const summaryTitle = cleanContent.slice(0, 40).replace(/\r?\n/g, ' ');
  const issueTitle = `${currentTypeInfo.prefix} ${summaryTitle}${cleanContent.length > 40 ? '...' : ''}`;
  const issueBody = `## 報告内容\n${cleanContent}\n\n---\n### 発生環境・コンテキスト\n- **種別**: ${currentTypeInfo.name}\n- **発生ページ**: ${pageUrl}\n- **対象店舗**: ${shopName || '未指定'} (\`${shopId || 'なし'}\`)\n- **User-Agent**: \`${navigator.userAgent}\`\n- **報告日時**: ${new Date().toLocaleString('ja-JP')}`;
  
  const githubIssueUrl = `https://github.com/${GITHUB_REPO}/issues/new?title=${encodeURIComponent(issueTitle)}&body=${encodeURIComponent(issueBody)}&labels=${encodeURIComponent(currentTypeInfo.label)}`;

  // 1. Firestoreへ保存（エラー時も後続のDiscord送信を継続）
  let firestoreSaved = false;
  if (db) {
    try {
      await db.collection('feedbacks').add({
        type,
        typeName: currentTypeInfo.name,
        content: cleanContent,
        page: pageUrl,
        shopId: shopId || 'unknown',
        shopName: shopName || '',
        userAgent: navigator.userAgent,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        githubIssueUrl
      });
      firestoreSaved = true;
    } catch (dbErr) {
      console.warn("Firestore feedback save warning (proceeding to Discord webhook):", dbErr);
    }
  }

  // 2. GASプロキシ経由でDiscordへ通知（設定されている場合）
  let discordNotified = false;
  if (GAS_FEEDBACK_API_URL && GAS_FEEDBACK_API_URL.trim().startsWith('http')) {
    try {
      await fetch(GAS_FEEDBACK_API_URL, {
        method: 'POST',
        mode: 'no-cors', // CORS制約を回避して送信
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          type,
          typeName: currentTypeInfo.name,
          content: cleanContent,
          page: pageUrl,
          shopId: shopId || 'unknown',
          shopName: shopName || '',
          userAgent: navigator.userAgent,
          githubIssueUrl
        })
      });
      discordNotified = true;
    } catch (gasErr) {
      console.warn("GAS notification sending failed:", gasErr);
    }
  }

  // FirestoreとDiscord通知の両方が失敗した場合のみエラーをスロー
  if (!firestoreSaved && !discordNotified && db) {
    throw new Error("送信に失敗しました。時間をおいて再試行してください。");
  }

  return { success: true, githubIssueUrl };
}

// グローバル公開
window.ShopManager = {
  DEFAULT_PRICES,
  DEFAULT_CUSTOM_CONFIG,
  buildCustomConfigFromLegacyPrices,
  buildLegacyPricesFromCustomConfig,
  normalizeShopConfig,
  hashPasscode,
  getShopId,
  setShopId,
  subscribeShopPrices: function(shopId, callback) {
    return subscribeShopPrices(shopId, (shopInfo) => {
      if (shopInfo && shopInfo.id && !shopInfo.notFound) {
        addShopToHistory(shopInfo.id, shopInfo.name);
      }
      callback(shopInfo);
    });
  },
  createShop,
  updateShopPrices,
  verifyShopPasscode,
  updateShopPasscode,
  claimShopOwnership,
  getShopInfo,
  checkShopExists,
  signInWithGoogle,
  signOutUser,
  getCurrentUser,
  onAuthChange,
  getShopHistory,
  addShopToHistory,
  removeShopFromHistory,
  sendFeedback,
  trackEvent
};


