import React, { useState, useEffect, useMemo } from 'react';
import { useOCR } from '../hooks/useOCR';
import { apiClient, fetchImportedElectricityFactors, fetchBisTripType, addImportedElectricityActivity, addBusinessTrip } from '../utils/api';
import { EMISSION_SOURCE, TRANSPORTATION_TYPE } from '../utils/EmissionSrc';

const { TRAIN, HIGH_SPEED_RAIL } = TRANSPORTATION_TYPE;
const { BUSINESS_TRIP, IMPORTED_ELECTRICITY } = EMISSION_SOURCE;

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
  const [showSuccess, setShowSuccess] = useState(false);

  // Common
  const [paymentDate, setPaymentDate] = useState('');
  const [dateError, setDateError] = useState('');
  
  // Dynamic Option State (Factors/Types)
  const [factorOptions, setFactorOptions] = useState([]);
  const [selectedFactorId, setSelectedFactorId] = useState('');
  const [unit, setUnit] = useState('');
  const [loadingFactors, setLoadingFactors] = useState(false);

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

  const facilityId = useMemo(() => {
    const loc = JSON.parse(localStorage.getItem('selected_loc') || '{}');
    return loc.id;
  }, []);

  const isTransport = category === '高鐵/台鐵車票';
  const isWater = category === '水費單';
  const isElectricity = category === '電費單';

  // Initialize from OCR Data
  useEffect(() => {
    if (data && schema) {
      if (isTransport) {
        const isRailway = data.type === 'tw_railway';
        setTransportType(isRailway ? '台鐵' : '高鐵');
        const rawDate = data.date || '';
        setPaymentDate(rawDate.replace(/[\/\.]/g, '-'));
        const stationList = isRailway ? TAIWAN_RAILWAY_STATIONS : HIGH_SPEED_RAIL_STATIONS;
        setFromName(stationList.includes(data.from_name) ? data.from_name : stationList[0]);
        setToName(stationList.includes(data.to_name) ? data.to_name : stationList[1] || stationList[0]);
        setPassengerCount('1');
        setPassengerError('');
      } else if (isWater) {
        const rawDate = data[schema.fields.date] || '';
        setPaymentDate(rawDate.replace(/[\/\.]/g, '-'));
        setCo2(data[schema.fields.co2] || '0');
        setCo2Error('');
      } else if (isElectricity) {
        const rawDate = data[schema.fields.date] || '';
        setPaymentDate(rawDate.replace(/[\/\.]/g, '-'));
        setUsage(data[schema.fields.usage] || '0');
        setUsageError('');
        setUnit(schema.unit || '度');
      }
    }
  }, [data, schema, isTransport, isWater, isElectricity]);

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

  // Factor Fetching & Smart Matching (Electricity & Transport)
  useEffect(() => {
    if (paymentDate && !dateError && facilityId) {
      setLoadingFactors(true);
      
      if (isElectricity) {
        fetchImportedElectricityFactors(facilityId, 39, activeYear, paymentDate)
          .then(res => {
            const factors = res.data || [];
            setFactorOptions(factors);

            const targetYearNum = parseInt(activeYear);
            const electricityFactors = factors
              .map(f => {
                const name = f.emissionFactorName || '';
                const match = name.match(/電力\((\d+)\)/);
                return match ? { ...f, matchYear: parseInt(match[1]) } : null;
              })
              .filter(f => f && f.matchYear <= targetYearNum)
              .sort((a, b) => b.matchYear - a.matchYear);

            if (electricityFactors.length > 0) {
              setSelectedFactorId(electricityFactors[0].emissionSourceId);
              setUnit(electricityFactors[0].emissionFactorUnit || '度');
            } else {
              setSelectedFactorId('');
            }
          })
          .catch(err => console.error('Failed to fetch electricity factors', err))
          .finally(() => setLoadingFactors(false));
      } else if (isTransport) {
        // Map transport type to equipmentTypeId for API
        // HSR = 40, Train = 41 based on system mapping
        const equipmentTypeId = transportType === '台鐵' ? 41 : 40;
        fetchBisTripType(facilityId, equipmentTypeId, activeYear, paymentDate)
          .then(res => {
            const factors = res.data || [];
            setFactorOptions(factors);
            if (factors.length > 0) {
              setSelectedFactorId(factors[0].emissionSourceId);
              setUnit(factors[0].emissionFactorUnit || '人次');
            } else {
              setSelectedFactorId('');
            }
          })
          .catch(err => console.error('Failed to fetch transport factors', err))
          .finally(() => setLoadingFactors(false));
      }
    }
  }, [category, paymentDate, dateError, facilityId, activeYear, isElectricity, isTransport, transportType]);

  if (!data || !schema) return null;

  const handleConfirm = async (e) => {
    if (e) e.preventDefault();
    if (dateError) return;
    
    let entryData = {};

    if (isTransport) {
      const isPositiveInt = /^\d+$/.test(passengerCount) && parseInt(passengerCount) > 0;
      if (!isPositiveInt) {
        setPassengerError('請輸入整數');
        return;
      }
      if (!selectedFactorId) {
        alert('請選擇種類');
        return;
      }
      
      // Map to Production Keys for Registry resolution (if needed) or direct API submission
      const equipmentTypeKey = transportType === '台鐵' ? TRAIN : HIGH_SPEED_RAIL;
      
      entryData = {
        useDate: paymentDate,
        departure: fromName,
        destination: toName,
        usage1: Number(passengerCount),
        facilityId: facilityId,
        year: activeYear,
        source: '',
        custodian: '',
        equipmentTypeKey: equipmentTypeKey,
        emissionSourceId: selectedFactorId
      };
    } else if (isWater) {
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
    } else if (isElectricity) {
      const usageNum = parseFloat(usage);
      if (isNaN(usageNum) || usageNum <= 0) {
        setUsageError('請輸入正確的耗用量');
        return;
      }
      if (!selectedFactorId) {
        alert('請選擇係數名稱');
        return;
      }
      entryData = {
        useDate: paymentDate,
        emissionSourceId: selectedFactorId,
        usage: usageNum,
        facilityId: facilityId,
        year: activeYear,
        source: '',
        custodian: ''
      };
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }

      if (isElectricity) {
        Object.entries(entryData).forEach(([key, val]) => {
          formData.append(key, val);
        });
        await addImportedElectricityActivity(formData);
        setShowSuccess(true);
      } else if (isTransport) {
        Object.entries(entryData).forEach(([key, val]) => {
          formData.append(key, val);
        });
        // Use production business trip API
        await addBusinessTrip(formData);
        setShowSuccess(true);
      } else {
        formData.append('data', JSON.stringify(entryData));
        formData.append('category', category);
        
        if (window.location.hostname.includes('github.io')) {
          setShowSuccess(true);
          setIsSubmitting(false);
          return;
        }

        const response = await apiClient.post('/rick_store', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setShowSuccess(true);
      }
    } catch (err) {
      console.error('Submission error:', err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || '儲存失敗';
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStationList = transportType === '台鐵' ? TAIWAN_RAILWAY_STATIONS : HIGH_SPEED_RAIL_STATIONS;

  return (
    <div className="popup-backdrop" style={{ display: 'flex' }}>
      <div className="popup-card manual-popup" style={{ maxHeight: '90vh', overflowY: 'auto', position: 'relative' }}>
        {showSuccess ? (
          <div className="success-overlay" style={{ padding: '40px 20px', textAlign: 'center', animation: 'fadeSlideUp 0.4s ease' }}>
            <div className="success-icon-wrap" style={{ 
              width: '80px', height: '80px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', 
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' 
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2 style={{ margin: '0 0 8px', color: 'var(--color-text)' }}>儲存成功</h2>
            <p style={{ margin: '0 0 32px', color: 'var(--color-text-secondary)', fontSize: '1rem' }}>資料已成功紀錄至系統</p>
            <button 
              className="btn-primary" 
              onClick={() => {
                setShowSuccess(false);
                onSave();
              }}
              style={{ width: '100%', padding: '14px' }}
            >
              完成
            </button>
          </div>
        ) : (
          <>
            <div className="popup-header">
              <h3 style={{ margin: 0 }}>{schema.title}</h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                報告年度：<span style={{ color: 'var(--color-primary)' }}>{activeYear}</span>
              </p>
            </div>

            <form className="popup-form" onSubmit={handleConfirm} style={{ marginTop: '16px' }}>
              <div className="form-section">
                {isTransport && (
                  <>
                    <div className="form-group">
                      <label>車種</label>
                      <select 
                        value={transportType} 
                        onChange={(e) => {
                          const newType = e.target.value;
                          setTransportType(newType);
                          const newList = newType === '台鐵' ? TAIWAN_RAILWAY_STATIONS : HIGH_SPEED_RAIL_STATIONS;
                          setFromName(newList[0]);
                          setToName(newList[1] || newList[0]);
                        }}
                      >
                        <option value="台鐵">台鐵</option>
                        <option value="高鐵">高鐵</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>日期</label>
                      <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
                      {dateError && <div className="field-error-msg" style={{ color: 'var(--color-error)', fontSize: '0.75rem' }}>{dateError}</div>}
                    </div>
                    <div className="form-group">
                      <label>起點</label>
                      <select value={fromName} onChange={(e) => setFromName(e.target.value)}>
                        {currentStationList.map(station => (
                          <option key={station} value={station}>{station}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>終點</label>
                      <select value={toName} onChange={(e) => setToName(e.target.value)}>
                        {currentStationList.map(station => (
                          <option key={station} value={station}>{station}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>人次</label>
                      <input type="text" value={passengerCount} onChange={(e) => setPassengerCount(e.target.value)} />
                      {passengerError && <div className="field-error-msg" style={{ color: 'var(--color-error)', fontSize: '0.75rem' }}>{passengerError}</div>}
                    </div>
                  </>
                )}

                {isWater && (
                  <>
                    <div className="form-group">
                      <label>日期</label>
                      <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
                      {dateError && <div className="field-error-msg" style={{ color: 'var(--color-error)', fontSize: '0.75rem' }}>{dateError}</div>}
                    </div>
                    <div className="form-group">
                      <label>CO2</label>
                      <div className="input-with-unit">
                        <input type="text" value={co2} onChange={(e) => setCo2(e.target.value)} />
                        <span className="input-unit">kg</span>
                      </div>
                      {co2Error && <div className="field-error-msg" style={{ color: 'var(--color-error)', fontSize: '0.75rem' }}>{co2Error}</div>}
                    </div>
                  </>
                )}

                {isElectricity && (
                  <>
                    <div className="form-group">
                      <label>日期</label>
                      <input type="date" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} />
                      {dateError && <div className="field-error-msg" style={{ color: 'var(--color-error)', fontSize: '0.75rem' }}>{dateError}</div>}
                    </div>
                    
                    <div className="form-group">
                      <label>係數名稱</label>
                      <select
                        value={selectedFactorId}
                        onChange={(e) => {
                          setSelectedFactorId(e.target.value);
                          const selected = factorOptions.find(f => String(f.emissionSourceId) === String(e.target.value));
                          if (selected) setUnit(selected.emissionFactorUnit || '度');
                        }}
                        disabled={loadingFactors || !paymentDate || !!dateError}
                      >
                        <option value="" disabled>{loadingFactors ? '載入中...' : '請選擇'}</option>
                        {factorOptions.map(f => (
                          <option key={f.emissionSourceId} value={f.emissionSourceId}>
                            {f.emissionFactorName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>耗用量</label>
                      <input type="number" step="any" value={usage} onChange={(e) => setUsage(e.target.value)} />
                      {usageError && <div className="field-error-msg" style={{ color: 'var(--color-error)', fontSize: '0.75rem' }}>{usageError}</div>}
                    </div>

                    <div className="form-group">
                      <label>單位</label>
                      <input type="text" value={unit} disabled />
                    </div>
                  </>
                )}
              </div>

              <div className="popup-actions" style={{ marginTop: '24px', position: 'sticky', bottom: 0, background: 'white', paddingTop: '12px' }}>
                <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting} style={{ flex: 1 }}>
                  取消
                </button>
                <button type="submit" className="btn-primary" disabled={isSubmitting || !!dateError || (isElectricity && (!selectedFactorId || !usage))} style={{ flex: 1 }}>
                  {isSubmitting ? '儲存中...' : '確認儲存'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ConfirmationPopup;
