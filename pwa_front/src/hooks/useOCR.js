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
  const [matchResult, setMatchResult] = useState(null);

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

      const file = await compressImage(rawFile);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', selectedCategory);

      // The apiClient already has x-esg-system and X-Auth-Token in its defaults
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

  return { loading, error, processImage, UTILITY_SCHEMAS, matchResult };
};
