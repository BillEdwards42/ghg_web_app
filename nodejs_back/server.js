import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// 引入Routes
import authRoutes from './routes/auth.js';
import ocrRoutes from './routes/ocr.js';
import storeRoutes from './routes/store.js';
import manualRoutes from './routes/manual.js';

dotenv.config();

const app = express();
// 選port
const port = process.env.PORT || 3000;

// 讓 app 可以跨域發送api。
app.use(cors());

// 解析 application/json 以支援 req.body
app.use(express.json());

// 註冊routes
app.use('/api', authRoutes);
app.use('/api', ocrRoutes);
app.use('/api', storeRoutes);
app.use('/api', manualRoutes);

// 當使用 `node server.js` 直接執行時才會啟動伺服器
// 這個寫法有助於使用測試套件 (如 Jest 或 Bun) 直接匯入 app 進行自動化邏輯測試
if (import.meta.main) {
  app.listen(port, () => {
    console.log(`BFF Secure Proxy Backend running on http://localhost:${port}`);
  });
}

export default app;
