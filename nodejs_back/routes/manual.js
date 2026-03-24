import express from 'express';
import asyncHandler from 'express-async-handler';

const router = express.Router();

// Mock data without 'icon' keys. Frontend logic determines the icons.
const mockCategoryData = {
  root: [
    { id: 'cat1', name: '類別一 (固定源)' },
    { id: 'cat2', name: '類別二 (移動源)' },
    { id: 'cat3', name: '類別三 (製程)' },
    { id: 'cat4', name: '類別四 (逸散)' },
    { id: 'cat5', name: '類別五 (加盟)' },
    { id: 'cat6', name: '類別六 (其他)' },
  ],
  'cat1': [
    { id: 'sub1_1', name: '固定式燃燒' },
    { id: 'sub1_2', name: '生質能燃燒' },
  ],
  'cat2': [
    { id: 'sub2_1', name: '輸入電力' },
    { id: 'sub2_2', name: '輸入熱能' },
  ],
  'cat3': [
    { id: 'sub3_1', name: '公務車使用' },
    { id: 'sub3_2', name: '員工通勤' },
  ],
  'cat4': [
    { id: 'sub4_1', name: '原料採購' },
    { id: 'sub4_2', name: '產品運輸' },
  ],
  'cat5': [
    { id: 'sub5_1', name: '加盟店電力' },
  ],
  'cat6': [
    { id: 'sub6_1', name: '其他逸散源' },
  ],
  'sub1_1': [
    { id: 'eq1', name: '旋風式鍋爐' },
    { id: 'eq2', name: '散佈式鍋爐' },
  ],
  'sub2_1': [
    { id: 'eq3', name: '冷氣機' },
    { id: 'eq4', name: '照明設備' },
  ],
  'sub3_1': [
    { id: 'eq5', name: '柴油貨車' },
    { id: 'eq6', name: '汽油客車' },
  ]
};

const mockSchemaData = {
  'default': [
    { id: 'date', label: '日期', type: 'date', required: true },
    { id: 'usage', label: '使用量', type: 'number', required: true }
  ]
};

// Delay helper
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

router.get('/manual/categories', asyncHandler(async (req, res) => {
  const { parentId } = req.query;
  
  if (!parentId || parentId === 'root') {
    // Simulated wait, remove in production
    await delay(1000);
  }
  
  const lookupId = parentId || 'root';
  const data = mockCategoryData[lookupId] || [];
  
  res.json(data);
}));

router.get('/manual/fields', asyncHandler(async (req, res) => {
  // const { equipId } = req.query; // For future real implementations
  
  // Simulated wait, remove in production
  await delay(1000);
  
  res.json(mockSchemaData['default']);
}));

export default router;
