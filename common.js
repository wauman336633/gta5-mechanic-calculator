// ==========================================================================
// Mechanic Calculator - Common UI & Utility Controller (common.js)
// ==========================================================================

const AppCommon = {
  // 0. HTMLエスケープ (XSS対策)
  escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  // 1. 金額フォーマット (¥1,000,000)
  formatJPY(num) {
    return '¥' + Math.floor(num || 0).toLocaleString('ja-JP');
  },

  // 1-2. 短縮金額フォーマット (¥300万 / ¥5,000)
  formatShortPrice(num) {
    const val = Math.floor(num || 0);
    if (val >= 10000) {
      const man = val / 10000;
      return `¥${Number.isInteger(man) ? man : man.toFixed(2).replace(/\.?0+$/, '')}万`;
    }
    return '¥' + val.toLocaleString('ja-JP');
  },

  // 2. トースト通知表示
  toastTimer: null,
  showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMsg');
    if (!toast) return;

    if (toastMsg) toastMsg.textContent = message;
    toast.classList.remove('hidden');
    
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.add('hidden');
    }, 2500);
  },

  // 3. クリップボードコピー
  copyToClipboard(text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        this.showToast(successMsg);
      }).catch(() => {
        this.fallbackCopy(text, successMsg);
      });
    } else {
      this.fallbackCopy(text, successMsg);
    }
  },

  fallbackCopy(text, successMsg) {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.showToast(successMsg);
    } catch (_e) {
      alert("コピーに失敗しました: " + text);
    }
  },

  // 4. 店舗パラメータ必須判定 & ポータルへのリダイレクト
  validateAndRedirectShopParam() {
    const path = window.location.pathname.toLowerCase();
    const isRequiredPage = path.endsWith('repair.html') ||
                           path.endsWith('custom.html') ||
                           path.endsWith('buyback.html') ||
                           path.endsWith('settings.html');

    if (isRequiredPage) {
      const currentParams = new URLSearchParams(window.location.search);
      const shopParam = currentParams.get('shop');
      if (!shopParam || !shopParam.trim()) {
        window.location.replace('index.html');
        return false;
      }
    }
    return true;
  },

  // 4-1. 安全な復帰先ページの取得（オープンリダイレクト防止）
  getSafeFromPage(defaultPage = 'repair', queryString = null) {
    const search = queryString != null ? queryString : (typeof window !== 'undefined' && window.location ? window.location.search : '');
    const params = typeof URLSearchParams !== 'undefined' ? new URLSearchParams(search) : new Map();
    const from = (params.get ? (params.get('from') || '') : '').toLowerCase().trim();
    const allowedPages = ['repair', 'custom', 'buyback', 'settings'];
    return allowedPages.includes(from) ? from : defaultPage;
  },

  // 4-2. 店舗未検出専用ページへのリダイレクト
  redirectToNotFound(shopId, fromPage) {
    const targetShop = encodeURIComponent((shopId || '').toLowerCase().trim());
    const safeFrom = encodeURIComponent(fromPage || this.getCurrentPageType());
    window.location.replace(`not-found.html?shop=${targetShop}&from=${safeFrom}`);
  },

  // 現在のページ種別を取得 (repair | custom | buyback | settings | index)
  getCurrentPageType() {
    const path = window.location.pathname.toLowerCase();
    if (path.endsWith('repair.html')) return 'repair';
    if (path.endsWith('custom.html')) return 'custom';
    if (path.endsWith('buyback.html')) return 'buyback';
    if (path.endsWith('settings.html')) return 'settings';
    return 'repair';
  },

  // 4-3. URLパラメータの維持・リンク自動同期
  syncNavigationShopParams(shopId) {
    const path = window.location.pathname.toLowerCase();
    const isPortal = path === '/' ||
                     path.endsWith('/index.html') ||
                     path.endsWith('index.html');

    // ポータル画面の場合：URLにshopパラメータを追加せず、付与されている場合は削除してクリーンなURLに統一
    if (isPortal) {
      const currentParams = new URLSearchParams(window.location.search);
      if (currentParams.has('shop') && window.history && window.history.replaceState) {
        currentParams.delete('shop');
        const remainingQuery = currentParams.toString();
        const newUrl = remainingQuery ? `${window.location.pathname}?${remainingQuery}` : window.location.pathname;
        window.history.replaceState(null, '', newUrl);
      }
      return;
    }

    if (!shopId) return;
    const links = document.querySelectorAll('a[href]');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && (href.endsWith('.html') || href.includes('.html?')) && !href.startsWith('http') && !href.startsWith('#')) {
        const url = new URL(href, window.location.origin);
        if (url.pathname.endsWith('repair.html') || url.pathname.endsWith('custom.html') || url.pathname.endsWith('buyback.html') || url.pathname.endsWith('settings.html')) {
          url.searchParams.set('shop', shopId);
          link.setAttribute('href', url.pathname.split('/').pop() + url.search);
        }
      }
    });
  },

  // 5. 店舗共有URLのコピー機能
  initShopShareAction(shopId) {
    const shopBadge = document.querySelector('.brand-shop-badge');
    if (shopBadge && !shopBadge.dataset.bound) {
      shopBadge.dataset.bound = 'true';
      shopBadge.classList.add('clickable-badge');
      shopBadge.setAttribute('title', 'クリックで店舗URLをコピー');
      shopBadge.setAttribute('role', 'button');
      shopBadge.setAttribute('tabindex', '0');

      const copyShopUrl = () => {
        const url = new URL(window.location.href);
        url.searchParams.set('shop', shopId || (window.ShopManager ? window.ShopManager.getShopId() : 'sample'));
        this.copyToClipboard(url.href, `🔗 店舗URLをコピーしました！`);
      };

      shopBadge.addEventListener('click', copyShopUrl);
      shopBadge.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          copyShopUrl();
        }
      });
    }

    const menuShareItem = document.getElementById('menuCopyShopUrl');
    if (menuShareItem && !menuShareItem.dataset.bound) {
      menuShareItem.dataset.bound = 'true';
      menuShareItem.addEventListener('click', (e) => {
        e.preventDefault();
        const url = new URL(window.location.href);
        url.searchParams.set('shop', shopId || (window.ShopManager ? window.ShopManager.getShopId() : 'sample'));
        this.copyToClipboard(url.href, `🔗 店舗URLをコピーしました！`);
      });
    }
  },

  // 6. ハンバーガーメニュー制御
  initHamburgerMenu() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const navMenu = document.getElementById('navMenuDropdown');

    if (!hamburgerBtn || !navMenu || hamburgerBtn.dataset.bound) return;
    hamburgerBtn.dataset.bound = 'true';

    hamburgerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = hamburgerBtn.getAttribute('aria-expanded') === 'true';
      hamburgerBtn.setAttribute('aria-expanded', !isExpanded);
      navMenu.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('active');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('active');
        hamburgerBtn.focus();
      }
    });
  },

  // 7. フィードバック（不具合・要望）モーダル制御
  initFeedbackModal() {
    // 既存モーダルがなければ動的に生成してbodyに追加
    let modal = document.getElementById('modalFeedback');
    if (!modal) {
      const modalHtml = `
        <div id="modalFeedback" class="feedback-modal-overlay hidden" role="dialog" aria-modal="true" aria-labelledby="feedbackModalTitle">
          <div class="feedback-modal-card">
            <div class="feedback-modal-header">
              <h3 id="feedbackModalTitle" class="feedback-modal-title">💬 不具合報告・ご要望</h3>
              <button type="button" id="feedbackModalCloseBtn" class="feedback-modal-close" aria-label="閉じる">&times;</button>
            </div>
            <form id="formFeedback" class="feedback-form">
              <div class="feedback-form-group">
                <label class="feedback-label">種別 <span class="required-badge">必須</span></label>
                <div class="feedback-type-selector">
                  <label class="feedback-type-option">
                    <input type="radio" name="feedbackType" value="bug" checked>
                    <span class="type-badge bug">🐛 不具合報告</span>
                  </label>
                  <label class="feedback-type-option">
                    <input type="radio" name="feedbackType" value="feature">
                    <span class="type-badge feature">💡 機能・要望</span>
                  </label>
                  <label class="feedback-type-option">
                    <input type="radio" name="feedbackType" value="other">
                    <span class="type-badge other">❓ その他</span>
                  </label>
                </div>
              </div>

              <div class="feedback-form-group">
                <label for="txtFeedbackContent" class="feedback-label">内容 <span class="required-badge">必須</span></label>
                <textarea id="txtFeedbackContent" class="feedback-textarea" rows="4" placeholder="不具合の状況（何をしていてどうなったか）や、追加してほしい機能・改善点をご記入ください。" required></textarea>
              </div>

              <div id="feedbackContextInfo" class="feedback-context-info">
                <span>📍 画面: <strong id="feedbackCurrentPage"></strong></span>
                <span>🏢 店舗: <strong id="feedbackCurrentShop"></strong></span>
              </div>

              <div id="feedbackErrorMsg" class="feedback-error hidden"></div>

              <div class="feedback-modal-actions">
                <button type="button" id="feedbackCancelBtn" class="btn-secondary">キャンセル</button>
                <button type="submit" id="feedbackSubmitBtn" class="btn-primary">
                  <span id="feedbackSubmitText">送信する</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      `;
      // 静的テンプレートHTMLの挿入
      // eslint-disable-next-line no-unsanitized/method
      document.body.insertAdjacentHTML('beforeend', modalHtml);
      modal = document.getElementById('modalFeedback');
    }

    const openBtns = [document.getElementById('menuFeedback'), document.getElementById('btnOpenFeedback')].filter(Boolean);
    const closeBtn = document.getElementById('feedbackModalCloseBtn');
    const cancelBtn = document.getElementById('feedbackCancelBtn');
    const form = document.getElementById('formFeedback');
    const txtContent = document.getElementById('txtFeedbackContent');
    const errorMsg = document.getElementById('feedbackErrorMsg');
    const submitBtn = document.getElementById('feedbackSubmitBtn');
    const submitText = document.getElementById('feedbackSubmitText');
    const pageDisplay = document.getElementById('feedbackCurrentPage');
    const shopDisplay = document.getElementById('feedbackCurrentShop');

    const openModal = () => {
      const shopId = window.ShopManager ? window.ShopManager.getShopId() : 'sample';
      const shopNameEl = document.getElementById('currentShopName');
      const shopName = shopNameEl ? shopNameEl.textContent : shopId;

      if (pageDisplay) pageDisplay.textContent = document.title.split('|')[0].trim() || window.location.pathname.split('/').pop();
      if (shopDisplay) shopDisplay.textContent = `${shopName} (${shopId})`;
      if (errorMsg) errorMsg.classList.add('hidden');
      if (txtContent) txtContent.value = '';

      modal.classList.remove('hidden');
      if (txtContent) txtContent.focus();

      // ハンバーガーメニューが開いていれば閉じる
      const hamburgerBtn = document.getElementById('hamburgerBtn');
      const navMenu = document.getElementById('navMenuDropdown');
      if (hamburgerBtn && navMenu) {
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('active');
      }
    };

    const closeModal = () => {
      modal.classList.add('hidden');
    };

    openBtns.forEach(btn => {
      if (!btn.dataset.bound) {
        btn.dataset.bound = 'true';
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          openModal();
        });
      }
    });

    if (closeBtn && !closeBtn.dataset.bound) {
      closeBtn.dataset.bound = 'true';
      closeBtn.addEventListener('click', closeModal);
    }

    if (cancelBtn && !cancelBtn.dataset.bound) {
      cancelBtn.dataset.bound = 'true';
      cancelBtn.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
        closeModal();
      }
    });

    // フォーム送信処理
    if (form && !form.dataset.bound) {
      form.dataset.bound = 'true';
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = txtContent.value.trim();
        if (!content) {
          errorMsg.textContent = "内容を入力してください。";
          errorMsg.classList.remove('hidden');
          return;
        }

        const selectedType = (form.elements['feedbackType'] && form.elements['feedbackType'].value) || 'bug';
        const shopId = window.ShopManager ? window.ShopManager.getShopId() : 'sample';
        const shopNameEl = document.getElementById('currentShopName');
        const shopName = shopNameEl ? shopNameEl.textContent : shopId;

        // 送信中UI
        submitBtn.disabled = true;
        submitText.textContent = "送信中...";
        errorMsg.classList.add('hidden');

        try {
          if (window.ShopManager && window.ShopManager.sendFeedback) {
            await window.ShopManager.sendFeedback({
              type: selectedType,
              content,
              page: window.location.href,
              shopId,
              shopName
            });
          }
          closeModal();
          AppCommon.showToast("📨 ご報告ありがとうございます！受け付けました。");
        } catch (err) {
          console.error("Feedback submit error:", err);
          errorMsg.textContent = err.message || "送信に失敗しました。時間をおいて再試行してください。";
          errorMsg.classList.remove('hidden');
        } finally {
          submitBtn.disabled = false;
          submitText.textContent = "送信する";
        }
      });
    }
  },

  // 8. 共通UI初期化
  initCommonUI() {
    if (!this.validateAndRedirectShopParam()) {
      return;
    }

    this.initHamburgerMenu();
    this.initFeedbackModal();

    const shopId = window.ShopManager ? window.ShopManager.getShopId() : '';
    this.syncNavigationShopParams(shopId);
    this.initShopShareAction(shopId);

    document.querySelectorAll('.cnt-input').forEach(input => {
      if (!input.dataset.boundFocus) {
        input.dataset.boundFocus = 'true';
        input.addEventListener('focus', () => input.select());
      }
    });
  }
};

window.AppCommon = AppCommon;

document.addEventListener('DOMContentLoaded', () => {
  AppCommon.initCommonUI();
});

