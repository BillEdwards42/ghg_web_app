import express from 'express';

const router = express.Router();

// 假資料儲存api (rick_store)
// 功能：在使用者確認 OCR 回傳的數據無誤並點擊「提交」後，這個端點會接收最終的資料，你要存到後端系統。
// 現在只會回傳假的成功信息，數據到這裡就被丟掉了。
// 加油。
router.post('/rick_store', (req, res) => {
  const data = req.body;

  // 原本在這裡會有資料驗證跟 DB 寫入邏輯
  console.log('收到準備儲存的資料 (我沒寫資料庫哈哈):', data);

  // 回傳儲存成功
  return res.json({
    success: true,
    message: '資料假儲存成功'
  });
});

export default router;
