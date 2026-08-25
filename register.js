// Register Shop Logic
document.addEventListener('DOMContentLoaded', () => {
  const formRegister = document.getElementById('formRegister');
  const txtShopName = document.getElementById('shopName');
  const txtShopId = document.getElementById('shopId');
  const txtPasscode = document.getElementById('passcode');
  const txtPasscodeConfirm = document.getElementById('passcodeConfirm');
  const errDisplay = document.getElementById('registerError');
  const btnSubmit = document.getElementById('btnSubmitRegister');

  // Google Owner Auth UI
  const ownerLoggedOut = document.getElementById('ownerLoggedOut');
  const ownerLoggedIn = document.getElementById('ownerLoggedIn');
  const ownerDisplayName = document.getElementById('ownerDisplayName');
  const ownerEmail = document.getElementById('ownerEmail');
  const btnGoogleLogin = document.getElementById('btnGoogleLoginRegister');
  const btnGoogleLogout = document.getElementById('btnGoogleLogoutRegister');

  let currentAuthUser = null;

  if (window.ShopManager && window.ShopManager.onAuthChange) {
    window.ShopManager.onAuthChange((user) => {
      currentAuthUser = user;
      updateAuthUI();
    });
  }

  function updateAuthUI() {
    if (currentAuthUser) {
      if (ownerLoggedOut) ownerLoggedOut.style.display = 'none';
      if (ownerLoggedIn) {
        ownerLoggedIn.style.display = 'flex';
        ownerDisplayName.textContent = currentAuthUser.displayName || 'Googleユーザー';
        ownerEmail.textContent = currentAuthUser.email || '';
      }
    } else {
      if (ownerLoggedOut) ownerLoggedOut.style.display = 'block';
      if (ownerLoggedIn) ownerLoggedIn.style.display = 'none';
    }
  }

  if (btnGoogleLogin) {
    btnGoogleLogin.addEventListener('click', async () => {
      errDisplay.style.display = 'none';
      try {
        await window.ShopManager.signInWithGoogle();
      } catch (err) {
        showError("Googleログインに失敗しました: " + (err.message || err));
      }
    });
  }

  if (btnGoogleLogout) {
    btnGoogleLogout.addEventListener('click', async () => {
      errDisplay.style.display = 'none';
      try {
        await window.ShopManager.signOutUser();
      } catch (err) {
        showError("ログアウトに失敗しました: " + (err.message || err));
      }
    });
  }

  formRegister.addEventListener('submit', async (e) => {
    e.preventDefault();
    errDisplay.style.display = 'none';

    if (!currentAuthUser) {
      showError("店舗を開設するには、Googleアカウントでのログインが必要です。上記の「Googleアカウントでログイン」ボタンを押してください。");
      return;
    }

    const shopName = txtShopName.value.trim();
    const shopId = txtShopId.value.trim().toLowerCase();
    const passcode = txtPasscode.value.trim();
    const passcodeConfirm = txtPasscodeConfirm.value.trim();

    if (!shopName || !shopId || !passcode) {
      showError("すべての必須項目を入力してください。");
      return;
    }

    if (shopName.length > 50) {
      showError("店舗名は50文字以内で入力してください。");
      return;
    }

    const shopIdPattern = /^[a-z0-9_-]{2,30}$/;
    if (!shopIdPattern.test(shopId)) {
      showError("店舗IDは2〜30文字の半角英数字、ハイフン(-)、アンダースコア(_)のみ使用できます。");
      return;
    }

    if (passcode.length < 4 || passcode.length > 32) {
      showError("管理パスコードは4文字以上32文字以内で設定してください。");
      return;
    }

    if (passcode !== passcodeConfirm) {
      showError("確認用パスコードが一致しません。");
      return;
    }

    btnSubmit.disabled = true;
    btnSubmit.textContent = "開設処理中...";

    try {
      await window.ShopManager.createShop(shopId, shopName, passcode);
      alert(`「${shopName}」の計算機を開設しました！\n専用URL: ?shop=${shopId}`);
      window.location.href = `repair.html?shop=${encodeURIComponent(shopId)}`;
    } catch (err) {
      showError(err.message || "店舗の作成に失敗しました。");
      btnSubmit.disabled = false;
      btnSubmit.textContent = "🚀 店舗を開設する";
    }
  });

  function showError(msg) {
    errDisplay.textContent = msg;
    errDisplay.style.display = 'block';
  }
});
