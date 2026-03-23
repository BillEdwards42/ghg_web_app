import express from 'express';

const router = express.Router();

// 這是假資料儲存端點 (rick_store)
// 功能：在使用者確認 OCR 擷取的數據無誤並點擊「提交」後，這個端點會接收最終的資料。
// 目前為概念驗證 (POC) 階段，所以它不會真的寫入資料庫，只會回傳成功的假訊號。
// 容易修改：老闆可以將這裡的邏輯替換為真實寫入 MySQL/PostgreSQL 或發送給公司內部其他儲存服務。
router.post('/rick_store', (req, res) => {
  const data = req.body;
  
  // 原本在這裡會有資料驗證跟 DB 寫入邏輯
  console.log('收到準備儲存的資料 (假裝已寫入資料庫):', data);

  // 回傳儲存成功
  return res.json({ 
    success: true, 
    message: '資料假儲存成功 (Fake stored successfully)' 
  });
});

export default router;
