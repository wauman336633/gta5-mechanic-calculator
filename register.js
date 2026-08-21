// Register Shop Logic
document.addEventListener('DOMContentLoaded', () => {
  const formRegister = document.getElementById('formRegister');
  const txtShopName = document.getElementById('shopName');
  const txtShopId = document.getElementById('shopId');
  const txtPasscode = document.getElementById('passcode');
  const txtPasscodeConfirm = document.getElementById('passcodeConfirm');
  const errDisplay = document.getElementById('registerError');
  const btnSubmit = document.getElementById('btnSubmitRegister');

  formRegister.addEventListener('submit', async (e) => {
    e.preventDefault();
    errDisplay.style.display = 'none';

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
