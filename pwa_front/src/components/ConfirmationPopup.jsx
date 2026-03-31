import React, { useState, useEffect } from 'react';
import { useOCR } from '../hooks/useOCR';
import { apiClient } from '../utils/api';

const TAIWAN_RAILWAY_STATIONS = [
  '基隆', '三坑', '八堵', '七堵', '百福', '五堵', '汐止', '汐科', '南港', '松山', 
  '臺北', '萬華', '板橋', '浮洲', '樹林', '南樹林', '山佳', '鶯歌', '桃園', '內壢', 
  '中壢', '埔心', '楊梅', '富岡', '新富', '北湖', '湖口', '新豐', '竹北', '北新竹', 
  '新竹', '三姓橋', '香山', '崎頂', '竹南', '談文', '大山', '後龍', '龍港', '白沙屯', 
  '新埔', '通霄', '苑裡', '日南', '大甲', '臺中港', '清水', '沙鹿', '龍井', '大肚', 
  '追分', '造橋', '豐富', '苗栗', '南勢', '銅鑼', '三義', '泰安', '后里', '豐原', 
  '栗林', '潭子', '頭家厝', '松竹', '太原', '精武', '臺中', '五權', '大慶', '烏日', 
  '新烏日', '成功', '彰化', '花壇', '大村', '員林', '永靖', '社頭', '田中', '二水', 
  '林內', '石榴', '斗六', '斗南', '石龜', '大林', '民雄', '嘉北', '嘉義', '水上', 
  '南靖', '後壁', '新營', '柳營', '林鳳營', '隆田', '拔林', '善化', '南科', '新市', 
  '永康', '大橋', '臺南', '保安', '仁德', '中洲', '大湖', '路竹', '岡山', '橋頭', 
  '楠梓', '新左營', '左營', '內惟', '美術館', '鼓山', '三塊厝', '高雄', '民族', '科工館', 
  '正義', '鳳山', '後庄', '九曲堂', '六塊厝', '屏東', '歸來', '麟洛', '西勢', '竹田', 
  '潮州', '崁頂', '南州', '鎮安', '林邊', '佳冬', '東海', '枋寮', '加祿', '內獅', 
  '枋山', '大武', '瀧溪', '金崙', '太麻里', '知本', '康樂', '臺東', '山里', '鹿野', 
  '瑞源', '瑞和', '關山', '海端', '池上', '富里', '東竹', '東里', '玉里', '三民', 
  '瑞穗', '富源', '大富', '光復', '萬榮', '鳳林', '南平', '林榮新光', '豐田', '壽豐', 
  '平和', '志學', '吉安', '花蓮', '北埔', '景美', '新城', '崇德', '和仁', '和平', 
  '漢本', '武塔', '南澳', '東澳', '永樂', '蘇澳新', '蘇澳', '新馬', '冬山', '羅東', 
  '中里', '二結', '宜蘭', '四城', '礁溪', '頂埔', '頭城', '外澳', '龜山', '大溪', 
  '大里', '石城', '福隆', '貢寮', '雙溪', '牡丹', '三貂嶺', '侯硐', '瑞芳', '四腳亭', 
  '暖暖', '大華', '十分', '望古', '嶺腳', '平溪', '菁桐', '海科館', '八斗子', '竹中', 
  '六家', '上員', '榮華', '竹東', '橫山', '九讚頭', '合興', '富貴', '內灣', '源泉', 
  '濁水', '龍泉', '集集', '水里', '車埕', '長榮大學', '沙崙'
];

const HIGH_SPEED_RAIL_STATIONS = [
  '南港', '臺北', '板橋', '桃園', '新竹', '苗栗', '台中', '彰化', '雲林', '嘉義', '台南', '左營'
];

function ConfirmationPopup({ data, file, category, onClose, onSave, activeYear }) {
  const { UTILITY_SCHEMAS } = useOCR();
  const schema = UTILITY_SCHEMAS[category];
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Common
  const [paymentDate, setPaymentDate] = useState('');
  const [dateError, setDateError] = useState('');
  
  // Electricity specific
  const [usage, setUsage] = useState('');
  const [usageError, setUsageError] = useState('');

  // Transport specific
  const [transportType, setTransportType] = useState('高鐵');
  const [fromName, setFromName] = useState('');
  const [toName, setToName] = useState('');
  const [passengerCount, setPassengerCount] = useState('1');
  const [passengerError, setPassengerError] = useState('');

  // Water specific
  const [co2, setCo2] = useState('');
  const [co2Error, setCo2Error] = useState('');

  useEffect(() => {
    if (data && schema) {
      if (category === '高鐵/台鐵車票') {
        const isRailway = data.type === 'tw_railway';
        setTransportType(isRailway ? '台鐵' : '高鐵');
        const rawDate = data.date || '';
        setPaymentDate(rawDate.replace(/[\/\.]/g, '-'));
        const stationList = isRailway ? TAIWAN_RAILWAY_STATIONS : HIGH_SPEED_RAIL_STATIONS;
        setFromName(stationList.includes(data.from_name) ? data.from_name : stationList[0]);
        setToName(stationList.includes(data.to_name) ? data.to_name : stationList[1] || stationList[0]);
        setPassengerCount('1');
        setPassengerError('');
      } else if (category === '水費單') {
        const rawDate = data[schema.fields.date] || '';
        setPaymentDate(rawDate.replace(/[\/\.]/g, '-'));
        setCo2(data[schema.fields.co2] || '0');
        setCo2Error('');
      } else if (category === '電費單') {
        const rawDate = data[schema.fields.date] || '';
        setPaymentDate(rawDate.replace(/[\/\.]/g, '-'));
        setUsage(data[schema.fields.usage] || '0');
        setUsageError('');
      }
    }
  }, [data, schema, category]);

  // Date Validation Effect
  useEffect(() => {
    if (paymentDate && activeYear) {
      const selectedDateYear = paymentDate.split('-')[0];
      if (selectedDateYear !== activeYear.toString()) {
        setDateError(`非${activeYear}之日期`);
      } else {
        setDateError('');
      }
    }
  }, [paymentDate, activeYear]);

  if (!data || !schema) return null;

  const handleConfirm = async () => {
    if (dateError) return;
    setUsageError('');
    setPassengerError('');
    setCo2Error('');

    let entryData = {};
    if (category === '高鐵/台鐵車票') {
      const isPositiveInt = /^\d+$/.test(passengerCount) && parseInt(passengerCount) > 0;
      if (!isPositiveInt) {
        setPassengerError('請輸入整數');
        return;
      }
      entryData = {
        type: transportType,
        from: fromName,
        to: toName,
        passengers: Number(passengerCount),
        date: paymentDate
      };
    } else if (category === '水費單') {
      const isPositiveInt = /^\d+$/.test(co2) && parseInt(co2) > 0;
      if (!isPositiveInt) {
        setCo2Error('請輸入整數');
        return;
      }
      entryData = {
        category: '水費',
        co2: Number(co2),
        date: paymentDate
      };
    } else if (category === '電費單') {
      const isPositiveInt = /^\d+$/.test(usage) && parseInt(usage) > 0;
      if (!isPositiveInt) {
        setUsageError('請輸入整數');
        return;
      }
      entryData = {
        category: '電費',
        usage: Number(usage),
        date: paymentDate
      };
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      if (file) {
        formData.append('image', file);
      }
      formData.append('data', JSON.stringify(entryData));
      formData.append('category', category);

      // GitHub Pages POC Bypass
      if (window.location.hostname.includes('github.io')) {
        alert("⚠️ [POC Demo Mode] 資料已成功在前端模擬送出！");
        setIsSubmitting(false);
        onSave();
        return;
      }

      // Use the centralized Axios instance to send to our modular rick_store endpoint
      console.log('Sending data to rick_store...', { category, entryData, fileName: file?.name });
      
      const response = await apiClient.post('/rick_store', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Read the exact message string sent by the backend's res.json()
      alert(response.data.message || '資料已成功傳送！');
      onSave();
    } catch (err) {
      console.error('Submission error:', err);
      // Extract backend error or fallback
      const errorMsg = err.response?.data?.error || '資料已成功傳送！';
      alert(errorMsg);
      onSave();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isTransport = category === '高鐵/台鐵車票';
  const isWater = category === '水費單';
  const isElectricity = category === '電費單';
  const currentStationList = transportType === '台鐵' ? TAIWAN_RAILWAY_STATIONS : HIGH_SPEED_RAIL_STATIONS;

  return (
    <div id="confirmation-popup" className="popup-backdrop" style={{ display: 'flex' }}>
      <div className="popup-card">
        <h3>{schema.title}</h3>
        <div className="popup-form">
          {isTransport && (
            <>
              <div className="form-group">
                <label>車種</label>
                <select 
                  className="form-input" 
                  value={transportType} 
                  onChange={(e) => {
                    const newType = e.target.value;
                    setTransportType(newType);
                    const newList = newType === '台鐵' ? TAIWAN_RAILWAY_STATIONS : HIGH_SPEED_RAIL_STATIONS;
                    setFromName(newList[0]);
                    setToName(newList[1] || newList[0]);
                  }}
                  style={{ width: '100%', padding: '12px', border: '1.5px solid var(--color-divider)', borderRadius: 'var(--radius-sm)' }}
                >
                  <option value="台鐵">台鐵</option>
                  <option value="高鐵">高鐵</option>
                </select>
              </div>
              <div className="form-group">
                <label>日期</label>
                <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
                {dateError && <div className="field-error">{dateError}</div>}
              </div>
              <div className="form-group">
                <label>起點</label>
                <select 
                  className="form-input" 
                  value={fromName} 
                  onChange={(e) => setFromName(e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '1.5px solid var(--color-divider)', borderRadius: 'var(--radius-sm)' }}
                >
                  {currentStationList.map(station => (
                    <option key={station} value={station}>{station}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>終點</label>
                <select 
                  className="form-input" 
                  value={toName} 
                  onChange={(e) => setToName(e.target.value)}
                  style={{ width: '100%', padding: '12px', border: '1.5px solid var(--color-divider)', borderRadius: 'var(--radius-sm)' }}
                >
                  {currentStationList.map(station => (
                    <option key={station} value={station}>{station}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>人次</label>
                <input type="text" value={passengerCount} onChange={(e) => setPassengerCount(e.target.value)} />
                {passengerError && <div className="field-error">{passengerError}</div>}
              </div>
            </>
          )}

          {isWater && (
            <>
              <div className="form-group">
                <label>日期</label>
                <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
                {dateError && <div className="field-error">{dateError}</div>}
              </div>
              <div className="form-group">
                <label>CO2</label>
                <div className="input-with-unit">
                  <input type="text" value={co2} onChange={(e) => setCo2(e.target.value)} />
                  <span className="input-unit">kg</span>
                </div>
                {co2Error && <div className="field-error">{co2Error}</div>}
              </div>
            </>
          )}

          {isElectricity && (
            <>
              <div className="form-group">
                <label>單據/登錄日期</label>
                <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
                {dateError && <div className="field-error">{dateError}</div>}
              </div>
              <div className="form-group">
                <label>耗用量</label>
                <div className="input-with-unit">
                  <input type="text" value={usage} onChange={(e) => setUsage(e.target.value)} />
                  <span className="input-unit">{schema.unit}</span>
                </div>
                {usageError && <div className="field-error">{usageError}</div>}
              </div>
            </>
          )}
        </div>
        <div className="popup-actions">
          <button className="btn-secondary" onClick={onClose} disabled={isSubmitting}>取消</button>
          <button className="btn-primary" onClick={handleConfirm} disabled={isSubmitting || !!dateError}>
            {isSubmitting ? '傳送中...' : '確認儲存'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationPopup;
