import { useState } from 'react';

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
      const file = await compressImage(rawFile);
      const formData = new FormData();
      formData.append('file', file);

      const isDev = import.meta.env.DEV;
      let apiUrl = import.meta.env.VITE_OCR_URL || '';
      if (isDev) {
        apiUrl = '/api/ocr/dev/api/lndata/classify_detect';
      } else {
        apiUrl = apiUrl || 'https://apisix.commeet.co/ocr/dev/api/lndata/classify_detect';
      }

      const rawUser = import.meta.env.VITE_OCR_USERNAME || 'lndata';
      const rawPass = import.meta.env.VITE_OCR_PASSWORD || 'cR2*#X6A^VXYtrRYCd4DDp*qr1ikScHO';
      const authHeader = 'Basic ' + btoa(`${rawUser.replace(/^['"]|['"]$/g, '')}:${rawPass.replace(/^['"]|['"]$/g, '')}`);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Authorization': authHeader },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error [${response.status}]: ${errorText.substring(0, 100)}`);
      }

      const result = await response.json();
      const data = Array.isArray(result) ? result[0] : (result.data ? result.data[0] : null);

      if (!data) {
        throw new Error('無法辨識，請確保拍攝物品正確。');
      }

      const schema = UTILITY_SCHEMAS[selectedCategory];
      const isCorrectType = schema.types 
        ? schema.types.includes(data.type) 
        : data.type === schema.type;

      if (!isCorrectType) {
        throw new Error(`此票據並非${schema.errorLabel}。`);
      }

      setLoading(false);
      return { data, schema };

    } catch (err) {
      setLoading(false);
      setError(err.message);
      return null;
    }
  };

  return { loading, error, processImage, UTILITY_SCHEMAS };
};
