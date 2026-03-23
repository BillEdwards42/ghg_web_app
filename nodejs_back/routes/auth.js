import express from 'express';

const router = express.Router();

// 假認證api (rick_auth)
// 功能：接收前端傳來的 account 和 password。目前只要兩個欄位都有值，就會回傳成功。
// 後續你要換邏輯成資料庫查詢或是 JWT 驗證都可，加油。
router.post('/rick_auth', (req, res) => {
  const { account, password } = req.body;

  // 檢查是否有帳號及密碼
  if (account && password) {
    // 驗證成功
    return res.json({ success: true, message: '登入成功' });
  }

  // 驗證失敗
  return res.status(401).json({ success: false, error: '帳號或密碼缺失' });
});

export default router;
