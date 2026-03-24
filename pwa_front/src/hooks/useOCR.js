import { useState } from 'react';
import { apiClient } from '../utils/api';

const UTILITY_SCHEMAS = {
  '電費單': {
    type: 'tw_power_bill',
    title: '電力活動數據',
    errorLabel: '電費單',
    unit: '度',
    fields: {
      date: 'payment_date',
      usage: 'regular_degree'
    }
  },
  '水費單': {
    type: 'tw_water_bill',
    title: '水務活動數據',
    errorLabel: '水費單',
    fields: {
      date: 'payment_date',
      co2: 'carbon_emission'
    }
  },
  '高鐵/台鐵車票': {
    types: ['tw_thsrc', 'tw_railway'],
    title: '交通活動數據',
    errorLabel: '台/高鐵票據',
    fields: {
      date: 'date',
      from: 'from_name',
      to: 'to_name'
    }
  }
};

export const useOCR = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const compressImage = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_DIMENSION = 1280;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_DIMENSION) {
              height *= MAX_DIMENSION / width;
              width = MAX_DIMENSION;
            }
          } else {
            if (height > MAX_DIMENSION) {
              width *= MAX_DIMENSION / height;
              height = MAX_DIMENSION;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve(file);
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            if (!blob) return resolve(file);
            resolve(new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
              type: 'image/jpeg',
              lastModified: Date.now()
            }));
          }, 'image/jpeg', 0.8);
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
  };

  const processImage = async (rawFile, selectedCategory) => {
    setLoading(true);
    setError(null);

    try {
      // GitHub Pages POC Bypass
      if (window.location.hostname.includes('github.io')) {
        alert("⚠️ [POC Demo Mode] 已注入模擬辨識資料！");
        
        const schema = selectedCategory === '電費單' ? { type: 'tw_power_bill', fields: [{key: 'regular_degree', label: '用電度數', type: 'number'}] } 
                     : selectedCategory === '水費單' ? { type: 'tw_water_bill', fields: [{key: 'carbon_emission', label: '碳排放量', type: 'number'}] } 
                     : { type: 'tw_thsrc', fields: [{key: 'date', label: '日期', type: 'text'}, {key: 'from_name', label: '出發站', type: 'text'}] };
        
        const dummyData = selectedCategory === '電費單' ? { type: 'tw_power_bill', regular_degree: 543 } 
                        : selectedCategory === '水費單' ? { type: 'tw_water_bill', carbon_emission: 12.5 } 
                        : { type: 'tw_thsrc', date: '2024-03-24', from_name: '台北' };
        
        setTimeout(() => {
          setMatchResult({ data: dummyData, schema });
          setLoading(false);
        }, 1200);
        return;
      }

      const file = await compressImage(rawFile);
      const formData = new FormData();
      formData.append('file', file);
      // 新增：把選擇的分類傳給後端，由後端統一進行邏輯與 Schema 驗證
      formData.append('category', selectedCategory);

      // We direct the request to the secure Node.js proxy utilizing our centralized Axios client
      const response = await apiClient.post('/ocr', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // 後端現在已經幫我們驗證好資料，並且回傳乾淨的 { data, schema }
      const result = response.data;
      
      setLoading(false);
      return result;

    } catch (err) {
      setLoading(false);
      // Extract specific backend error message from Axios if available
      const backendError = err.response?.data?.error;
      setError(backendError || err.message);
      return null;
    }
  };

  return { loading, error, processImage, UTILITY_SCHEMAS };
};
