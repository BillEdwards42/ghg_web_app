import express from 'express';
import multer from 'multer';
import asyncHandler from 'express-async-handler';
import axios from 'axios';

const router = express.Router();

// 將檔案暫存於記憶體中 (不存本地，保護隱私)
const upload = multer({ storage: multer.memoryStorage() });

// 使用者可以從這三種裡面選要哪個，他的type是commeet如果掃到使用者選的那個，回傳的json裡的一個值。
// 我用這個schema來判定1. 你掃得是不是你想掃的(點電費掃水費，錯誤) 2. 有沒有掃到東西(Commeet回傳空白，沒type，錯誤)
// 目前測下來你掃複數張都只會回傳圖片裡最左邊那張的數據，暫時沒有做掃複數張的錯誤邏輯。
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

// OCR endpoint，現在是可以運作的。
// 功能：接收前端圖片跟使用者選的類別(SCHEMA的電費/水費等)，轉給Commeet。
router.post('/ocr', upload.single('file'), asyncHandler(async (req, res) => {
  // 沒傳圖片，錯誤，前端有強迫要拍才會觸發api call，應該不會發生。
  if (!req.file) {
    return res.status(400).json({ error: '未提供圖片檔案 (No image file provided)' });
  }

  // 前端沒選票據類別，錯誤，但是我前端有強迫他選所以基本不會發生。
  const category = req.body.category;
  if (!category || !UTILITY_SCHEMAS[category]) {
    return res.status(400).json({ error: '缺少或無效的票據類型 (Invalid category)' });
  }

  // 檢查後端有沒有用 dotenv load 到 Commeet 的 api key 之類的。
  const { OCR_URL, OCR_USERNAME, OCR_PASSWORD } = process.env;
  if (!OCR_URL || !OCR_USERNAME || !OCR_PASSWORD) {
    return res.status(500).json({ error: '伺服器設定錯誤：缺少憑證' });
  }

  // 處理 Auth Header，AI 叫我用 regex 去掉 api key 的引號然後做了一個authHeader。
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

    // 解析 API 回傳的資料
    const result = response.data;
    //Commeet 回傳的格式是[{"type":"...","date":"..."}]，所以我要抓array的第一個元素，沒有就null。
    const data = Array.isArray(result) ? result[0] : null;

    //沒掃到單據就會是 null。
    if (!data) {
      return res.status(422).json({ error: '無法辨識，請確保拍攝物品正確。' });
    }

    // 檢查 Commeet 掃到的單據類別是否與使用者選擇的類別一致。
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
    // Error 你要做啥記得調，我只有log他然後把status code跟error message當res回傳。
    console.error('OCR Axios Proxy Error:', error.message);
    const statusCode = error.response ? error.response.status : 500;
    const errorData = error.response ? error.response.data : '向外部 API 發送請求時發生錯誤';
    return res.status(statusCode).json({ error: errorData });
  }
}));

export default router;
