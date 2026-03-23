import express from 'express';
import multer from 'multer';
import asyncHandler from 'express-async-handler';
import axios from 'axios';

const router = express.Router();

// 將檔案暫存於記憶體中 (不落定以保護隱私)
const upload = multer({ storage: multer.memoryStorage() });

// 容易修改：老闆若要新增其他票據類型，只需在這裡加上對應的 Schema 即可。
const UTILITY_SCHEMAS = {
  '電費單': {
    type: 'tw_power_bill',
    title: '電力活動數據',
    errorLabel: '電費單',
    unit: '度',
    fields: { date: 'payment_date', usage: 'regular_degree' }
  },
  '水費單': {
    type: 'tw_water_bill',
    title: '水務活動數據',
    errorLabel: '水費單',
    fields: { date: 'payment_date', co2: 'carbon_emission' }
  },
  '高鐵/台鐵車票': {
    types: ['tw_thsrc', 'tw_railway'],
    title: '交通活動數據',
    errorLabel: '台/高鐵票據',
    fields: { date: 'date', from: 'from_name', to: 'to_name' }
  }
};

// 這是 OCR 的代理端點
// 功能：接收前端圖片與 category，轉發給外部 OCR API，然後在後端進行資料驗證。
router.post('/ocr', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '未提供圖片檔案 (No image file provided)' });
  }

  // 前端會透過 FormData 傳遞 category，需要將其解析出來
  const category = req.body.category;
  if (!category || !UTILITY_SCHEMAS[category]) {
    return res.status(400).json({ error: '缺少或無效的票據類型 (Invalid category)' });
  }

  const { OCR_URL, OCR_USERNAME, OCR_PASSWORD } = process.env;
  if (!OCR_URL || !OCR_USERNAME || !OCR_PASSWORD) {
    return res.status(500).json({ error: '伺服器設定錯誤：缺少憑證' });
  }

  // 處理認證 Header
  const rawUser = OCR_USERNAME.replace(/^['"]|['"]$/g, '');
  const rawPass = OCR_PASSWORD.replace(/^['"]|['"]$/g, '');
  const authHeader = 'Basic ' + Buffer.from(`${rawUser}:${rawPass}`).toString('base64');

  // 將圖片重新封裝發送給外部 OCR API
  const formData = new FormData();
  const blob = new Blob([req.file.buffer], { type: req.file.mimetype });
  formData.append('file', blob, req.file.originalname);

  try {
    const response = await axios.post(OCR_URL, formData, {
      headers: { 'Authorization': authHeader }
    });

    // 解析外部 API 回傳的資料
    const result = response.data;
    const data = Array.isArray(result) ? result[0] : (result.data ? result.data[0] : null);

    if (!data) {
      return res.status(422).json({ error: '無法辨識，請確保拍攝物品正確。' });
    }

    const schema = UTILITY_SCHEMAS[category];
    const isCorrectType = schema.types
      ? schema.types.includes(data.type)
      : data.type === schema.type;

    if (!isCorrectType) {
      return res.status(422).json({ error: `此票據並非${schema.errorLabel}。` });
    }

    // 驗證成功，將乾淨的資料與 schema 回傳給前端
    return res.json({ data, schema });

  } catch (error) {
    console.error('OCR Axios Proxy Error:', error.message);
    const statusCode = error.response ? error.response.status : 500;
    const errorData = error.response ? error.response.data : '向外部 API 發送請求時發生錯誤';
    return res.status(statusCode).json({ error: errorData });
  }
}));

export default router;
