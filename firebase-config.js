// Firebase Config & Shop Manager Module

// デフォルト設定価格（標準初期価格）
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
  return cleanId;
}

const SAMPLE_SHOP_ID = 'sample';
const SAMPLE_PASSCODE = '1111';
const SAMPLE_RESET_INTERVAL_MS = 60 * 60 * 1000; // 1時間 (ミリ秒)

// パスコードのSHA-256ハッシュ化（Web Crypto API）
async function hashPasscode(passcode) {
  if (!passcode) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(passcode);
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
    let prices = JSON.parse(JSON.stringify(DEFAULT_PRICES));
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        if (cleanId === SAMPLE_SHOP_ID && parsed.updatedAt) {
          const lastUpdated = new Date(parsed.updatedAt).getTime();
          const now = Date.now();
          if (!isNaN(lastUpdated) && (now - lastUpdated > SAMPLE_RESET_INTERVAL_MS)) {
            // 1時間経過しているため初期設定にリセット
            prices = JSON.parse(JSON.stringify(DEFAULT_PRICES));
            localStorage.setItem(`shop_prices_${cleanId}`, JSON.stringify({
              id: cleanId,
              name: 'サンプル店舗',
              prices: DEFAULT_PRICES,
              updatedAt: new Date().toISOString()
            }));
          } else {
            prices = mergeDeep(prices, parsed.prices || {});
          }
        } else {
          prices = mergeDeep(prices, parsed.prices || {});
        }
      } catch (e) {
        console.error("Local data parse error", e);
      }
    }
    const shopInfo = {
      id: cleanId,
      name: cleanId === SAMPLE_SHOP_ID ? 'サンプル店舗' : cleanId.toUpperCase(),
      prices
    };
    callback(shopInfo);
    return () => {};
  }

  // Firestoreからリアルタイム受信
  const unsubscribe = db.collection('shops').doc(cleanId).onSnapshot(async doc => {
    let shopInfo = {
      id: cleanId,
      name: cleanId === SAMPLE_SHOP_ID ? 'サンプル店舗' : cleanId.toUpperCase(),
      prices: JSON.parse(JSON.stringify(DEFAULT_PRICES))
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
            const sampleHashedPasscode = await hashPasscode(SAMPLE_PASSCODE);
            await db.collection('shops').doc(cleanId).update({
              passcodeHash: sampleHashedPasscode,
              prices: DEFAULT_PRICES,
              updatedAt: new Date().toISOString()
            });
          } catch (e) {
            console.warn("Sample shop reset error", e);
          }
          shopInfo.prices = JSON.parse(JSON.stringify(DEFAULT_PRICES));
          localStorage.setItem(`shop_prices_${cleanId}`, JSON.stringify(shopInfo));
          callback(shopInfo);
          return;
        }
      }

      if (data.prices) {
        shopInfo.prices = mergeDeep(shopInfo.prices, data.prices);
      }
    }
    
    // キャッシュ保存
    localStorage.setItem(`shop_prices_${cleanId}`, JSON.stringify(shopInfo));
    callback(shopInfo);
  }, error => {
    console.warn("Firestore access error, fallback to default", error);
    callback({
      id: cleanId,
      name: cleanId === SAMPLE_SHOP_ID ? 'サンプル店舗' : cleanId.toUpperCase(),
      prices: JSON.parse(JSON.stringify(DEFAULT_PRICES))
    });
  });

  return unsubscribe;
}

// 4. 店舗の新規作成
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

  const hashed = await hashPasscode(passcode);
  
  const publicData = {
    id: cleanId,
    name: cleanName,
    prices: DEFAULT_PRICES,
    createdAt: new Date().toISOString()
  };

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
    localStorage.setItem(`shop_info_${cleanId}`, JSON.stringify({ ...publicData, passcodeHash: hashed }));
    localStorage.setItem(`shop_prices_${cleanId}`, JSON.stringify({ id: cleanId, name: cleanName, prices: DEFAULT_PRICES }));
  }

  setShopId(cleanId);
  return cleanId;
}

// 5. 価格設定の更新
async function updateShopPrices(shopId, passcode, newPrices) {
  initFirebase();
  const cleanId = (shopId || '').toLowerCase().trim();

  // sample店舗のパスコード検証（1111固定）
  if (cleanId === SAMPLE_SHOP_ID) {
    if (passcode !== SAMPLE_PASSCODE) {
      throw new Error("管理パスコードが一致しません。");
    }
  }

  const hashedInput = await hashPasscode(passcode);

  if (firebaseInitialized && db) {
    const docRef = db.collection('shops').doc(cleanId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      const sampleHash = await hashPasscode(SAMPLE_PASSCODE);
      const batch = db.batch();
      batch.set(docRef, {
        id: cleanId,
        name: cleanId === SAMPLE_SHOP_ID ? 'サンプル店舗' : cleanId.toUpperCase(),
        passcodeHash: cleanId === SAMPLE_SHOP_ID ? sampleHash : hashedInput,
        prices: newPrices,
        updatedAt: new Date().toISOString()
      });
      batch.set(docRef.collection('auth').doc('secret'), {
        passcodeHash: cleanId === SAMPLE_SHOP_ID ? sampleHash : hashedInput
      });
      await batch.commit();
      return true;
    }

    // パスコード照合
    const isValid = await verifyShopPasscode(cleanId, passcode);
    if (!isValid) {
      throw new Error("管理パスコードが一致しません。");
    }

    const updatePayload = {
      id: cleanId,
      passcodeHash: hashedInput, // Firestoreルール照合用
      prices: newPrices,
      updatedAt: new Date().toISOString()
    };

    // レガシー店舗の場合、平文passcodeがあれば削除
    const data = doc.data();
    if (data && data.passcode) {
      updatePayload.passcode = firebase.firestore.FieldValue.delete();
    }

    await docRef.update(updatePayload);
    return true;
  } else {
    // オフライン・ローカル保存
    const cachedInfo = localStorage.getItem(`shop_info_${cleanId}`);
    if (cachedInfo && cleanId !== SAMPLE_SHOP_ID) {
      const parsed = JSON.parse(cachedInfo);
      const isMatch = (parsed.passcodeHash && parsed.passcodeHash === hashedInput) ||
                      (parsed.passcode && parsed.passcode === passcode);
      if (!isMatch) {
        throw new Error("管理パスコードが一致しません。");
      }
    }
    localStorage.setItem(`shop_prices_${cleanId}`, JSON.stringify({
      id: cleanId,
      name: cleanId === SAMPLE_SHOP_ID ? 'サンプル店舗' : cleanId,
      prices: newPrices,
      updatedAt: new Date().toISOString()
    }));
    return true;
  }
}

// 6. 店舗検証（パスコードチェック）
async function verifyShopPasscode(shopId, passcode) {
  initFirebase();
  const cleanId = (shopId || '').toLowerCase().trim();

  if (cleanId === SAMPLE_SHOP_ID) {
    return passcode === SAMPLE_PASSCODE;
  }

  const hashedInput = await hashPasscode(passcode);

  if (firebaseInitialized && db) {
    const docRef = db.collection('shops').doc(cleanId);
    
    // 1. 非公開auth/secretドキュメントをチェック（新方式）
    try {
      const secretDoc = await docRef.collection('auth').doc('secret').get();
      if (secretDoc.exists) {
        return secretDoc.data().passcodeHash === hashedInput;
      }
    } catch (e) {
      // 権限エラー等で読めない場合は公開ドキュメントのレガシーチェックへ
    }

    // 2. 公開ドキュメント内のレガシー値チェック
    const doc = await docRef.get();
    if (!doc.exists) {
      return false;
    }
    const data = doc.data();
    return (data.passcodeHash && data.passcodeHash === hashedInput) ||
           (data.passcode && data.passcode === passcode);
  } else {
    const cachedInfo = localStorage.getItem(`shop_info_${cleanId}`);
    if (cachedInfo) {
      const parsed = JSON.parse(cachedInfo);
      return (parsed.passcodeHash && parsed.passcodeHash === hashedInput) ||
             (parsed.passcode && parsed.passcode === passcode);
    }
    return false;
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

  // Firestoreへ保存
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
    } catch (dbErr) {
      console.error("Firestore feedback save error:", dbErr);
      throw new Error("データの保存に失敗しました。時間をおいて再試行してください。");
    }
  }

  return { success: true, githubIssueUrl };
}

// グローバル公開
window.ShopManager = {
  DEFAULT_PRICES,
  hashPasscode,
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
  removeShopFromHistory,
  sendFeedback
};


