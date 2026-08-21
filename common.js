// ==========================================================================
// Mechanic Calculator - Common UI & Utility Controller (common.js)
// ==========================================================================

const AppCommon = {
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
    } catch (e) {
      alert("コピーに失敗しました: " + text);
    }
  },

  // 4. URLパラメータの維持・リンク自動同期
  syncNavigationShopParams(shopId) {
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

    const currentParams = new URLSearchParams(window.location.search);
    if (!currentParams.get('shop') && shopId && window.history && window.history.replaceState) {
      currentParams.set('shop', shopId);
      const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
      window.history.replaceState(null, '', newUrl);
    }
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
        url.searchParams.set('shop', shopId || (window.ShopManager ? window.ShopManager.getShopId() : 'soragon'));
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
        url.searchParams.set('shop', shopId || (window.ShopManager ? window.ShopManager.getShopId() : 'soragon'));
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

  // 7. 共通UI初期化
  initCommonUI() {
    this.initHamburgerMenu();

    const shopId = window.ShopManager ? window.ShopManager.getShopId() : 'soragon';
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

