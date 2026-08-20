// Firebase Config & Shop Manager Module

// デフォルト設定価格（ソラゴンメカニック初期価格）
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

// 1. Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyAunHB71Y9SlNc2DS6cc3vPnGyQ1RBSbUo",
  authDomain: "mechanic-calculator.firebaseapp.com",
  projectId: "mechanic-calculator",
  storageBucket: "mechanic-calculator.firebasestorage.app",
  messagingSenderId: "728261647308",
  appId: "1:728261647308:web:e4865ff743e195bcce9b69"
};

let db = null;
let firebaseInitialized = false;

function initFirebase() {
  if (typeof firebase !== 'undefined' && firebaseConfig.apiKey !== "YOUR_API_KEY") {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }
    db = firebase.firestore();
    firebaseInitialized = true;
  }
}

// 2. 店舗ID管理
const STORAGE_KEY = 'mechanic_shop_id';
const DEFAULT_SHOP_ID = 'soragon';

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
  return cleanId;
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
  
  // Firebase未設定またはオフライン時のフォールバック
  if (!firebaseInitialized || !db) {
    const localData = localStorage.getItem(`shop_prices_${shopId}`);
    let prices = JSON.parse(JSON.stringify(DEFAULT_PRICES));
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        prices = mergeDeep(prices, parsed.prices || {});
      } catch (e) {
        console.error("Local data parse error", e);
      }
    }
    const shopInfo = { id: shopId, name: shopId === 'soragon' ? 'ソラゴンメカニック' : shopId.toUpperCase(), prices };
    callback(shopInfo);
    return () => {};
  }

  // Firestoreからリアルタイム受信
  const unsubscribe = db.collection('shops').doc(shopId).onSnapshot(doc => {
    let shopInfo = {
      id: shopId,
      name: shopId === 'soragon' ? 'ソラゴンメカニック' : shopId.toUpperCase(),
      prices: JSON.parse(JSON.stringify(DEFAULT_PRICES))
    };

    if (doc.exists) {
      const data = doc.data();
      shopInfo.name = data.name || shopInfo.name;
      if (data.prices) {
        shopInfo.prices = mergeDeep(shopInfo.prices, data.prices);
      }
    }
    
    // キャッシュ保存
    localStorage.setItem(`shop_prices_${shopId}`, JSON.stringify(shopInfo));
    callback(shopInfo);
  }, error => {
    console.warn("Firestore access error, fallback to default", error);
    callback({
      id: shopId,
      name: shopId === 'soragon' ? 'ソラゴンメカニック' : shopId.toUpperCase(),
      prices: JSON.parse(JSON.stringify(DEFAULT_PRICES))
    });
  });

  return unsubscribe;
}

// 4. 店舗の新規作成
async function createShop(shopId, shopName, passcode) {
  initFirebase();
  const cleanId = shopId.toLowerCase().trim();
  
  const initialData = {
    id: cleanId,
    name: shopName,
    passcode: passcode,
    prices: DEFAULT_PRICES,
    createdAt: new Date().toISOString()
  };

  if (firebaseInitialized && db) {
    const docRef = db.collection('shops').doc(cleanId);
    const doc = await docRef.get();
    if (doc.exists) {
      throw new Error("指定された店舗IDは既に登録されています。別のIDをお試しください。");
    }
    await docRef.set(initialData);
  } else {
    // ローカルでのシミュレーション保存
    if (localStorage.getItem(`shop_info_${cleanId}`)) {
      throw new Error("指定された店舗IDは既に登録されています。");
    }
    localStorage.setItem(`shop_info_${cleanId}`, JSON.stringify(initialData));
    localStorage.setItem(`shop_prices_${cleanId}`, JSON.stringify({ id: cleanId, name: shopName, prices: DEFAULT_PRICES }));
  }

  setShopId(cleanId);
  return cleanId;
}

// 5. 価格設定の更新
async function updateShopPrices(shopId, passcode, newPrices) {
  initFirebase();
  const cleanId = shopId.toLowerCase().trim();

  if (firebaseInitialized && db) {
    const docRef = db.collection('shops').doc(cleanId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      await docRef.set({
        id: cleanId,
        name: cleanId.toUpperCase(),
        passcode: passcode,
        prices: newPrices,
        updatedAt: new Date().toISOString()
      });
      return true;
    }

    const data = doc.data();
    if (data.passcode && data.passcode !== passcode) {
      throw new Error("管理パスコードが一致しません。");
    }

    await docRef.update({
      prices: newPrices,
      updatedAt: new Date().toISOString()
    });
    return true;
  } else {
    // オフライン・ローカル保存
    const cachedInfo = localStorage.getItem(`shop_info_${cleanId}`);
    if (cachedInfo) {
      const parsed = JSON.parse(cachedInfo);
      if (parsed.passcode && parsed.passcode !== passcode) {
        throw new Error("管理パスコードが一致しません。");
      }
    }
    localStorage.setItem(`shop_prices_${cleanId}`, JSON.stringify({ id: cleanId, name: cleanId, prices: newPrices }));
    return true;
  }
}

// 6. 店舗検証（パスコードチェック）
async function verifyShopPasscode(shopId, passcode) {
  initFirebase();
  const cleanId = shopId.toLowerCase().trim();

  if (firebaseInitialized && db) {
    const doc = await db.collection('shops').doc(cleanId).get();
    if (!doc.exists) {
      return true;
    }
    return doc.data().passcode === passcode;
  } else {
    const cachedInfo = localStorage.getItem(`shop_info_${cleanId}`);
    if (cachedInfo) {
      return JSON.parse(cachedInfo).passcode === passcode;
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

// グローバル公開
window.ShopManager = {
  DEFAULT_PRICES,
  getShopId,
  setShopId,
  subscribeShopPrices: function(shopId, callback) {
    return subscribeShopPrices(shopId, (shopInfo) => {
      if (shopInfo && shopInfo.id) {
        addShopToHistory(shopInfo.id, shopInfo.name);
      }
      callback(shopInfo);
    });
  },
  createShop,
  updateShopPrices,
  verifyShopPasscode,
  getShopHistory,
  addShopToHistory,
  removeShopFromHistory
};
