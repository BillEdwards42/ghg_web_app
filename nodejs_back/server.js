import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// 引入我們模組化的路由 (Modular Routes)
import authRoutes from './routes/auth.js';
import ocrRoutes from './routes/ocr.js';
import storeRoutes from './routes/store.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// 啟用 CORS 允許前端應用程式 (例如 React 運行在 port 5173) 請求我們這個後端伺服器
app.use(cors());

// 解析 application/json 以支援 req.body
app.use(express.json());

// 註冊所有模組化端點 (如果老闆想要加上前綴，可以直接在這裡加)
// 比如 /api/rick_auth, /api/ocr, /api/rick_store
app.use('/api', authRoutes);
app.use('/api', ocrRoutes);
app.use('/api', storeRoutes);

// 當使用 `node server.js` 直接執行時才會啟動伺服器
// 這個寫法有助於使用測試套件 (如 Jest 或 Bun) 直接匯入 app 進行自動化邏輯測試
if (import.meta.main) {
  app.listen(port, () => {
    console.log(`BFF Secure Proxy Backend running on http://localhost:${port}`);
  });
}

export default app;
