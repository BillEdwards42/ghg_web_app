import React, { useState, useEffect, useMemo } from 'react';
import { useOCR } from '../hooks/useOCR';
import { apiClient, fetchImportedElectricityFactors, addImportedElectricityActivity, checkActivityClose } from '../utils/api';
import { EMISSION_SOURCE, TRANSPORTATION_TYPE } from '../utils/EmissionSrc';
import ManualEntryPopup from './ManualEntryPopup';

const { IMPORTED_ELECTRICITY } = EMISSION_SOURCE;

function ConfirmationPopup({ data, file, category, onClose, onSave, activeYear }) {
  const { UTILITY_SCHEMAS } = useOCR();
  const schema = UTILITY_SCHEMAS[category];
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [noEquipmentWarning, setNoEquipmentWarning] = useState(false);
  const [activityClosedWarning, setActivityClosedWarning] = useState(false);

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

  // Water specific
  const [co2, setCo2] = useState('');
  const [co2Error, setCo2Error] = useState('');

  const isTransport = category === '高鐵/台鐵車票';
  const isWater = category === '水費單';
  const isElectricity = category === '電費單';

  // Delegate HSR/Train to ManualEntryPopup
  if (isTransport && data) {
    const isRailway = data.type === 'tw_railway';
    const pathData = [
      { name: '類別 3: 運輸' },
      { id: 'business travel', name: '商務旅行', emissionTypeKey: 'business travel' },
      { 
        id: isRailway ? 2 : 1, 
        name: isRailway ? '台鐵' : '高鐵', 
        equipmentTypeKey: isRailway ? 'train' : 'high speed rail' 
      }
    ];
    return (
      <ManualEntryPopup 
        pathData={pathData} 
        year={activeYear} 
        onClose={onClose} 
        onSave={onSave} 
        initialData={{ ...data, file }} 
      />
    );
  }

  const facilityId = useMemo(() => {
    const loc = JSON.parse(localStorage.getItem('selected_loc') || '{}');
    return loc.id;
  }, []);

  // Initialize from OCR Data (Water & Electricity)
  useEffect(() => {
    if (data && schema) {
      if (isWater) {
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
  }, [data, schema, isWater, isElectricity]);

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

  // Factor Fetching & Smart Matching (Electricity Only - Water is generic for now)
  useEffect(() => {
    if (paymentDate && !dateError && facilityId && isElectricity) {
      setLoadingFactors(true);
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
            setNoEquipmentWarning(false);

            // Activity Close Check (Electricity OCR)
            checkActivityClose(paymentDate, facilityId).then(checkRes => {
              if (checkRes.data?.result === false) {
                setActivityClosedWarning(true);
              } else {
                setActivityClosedWarning(false);
              }
            });
          } else {
            setSelectedFactorId('');
            setNoEquipmentWarning(true);
          }
        })
        .catch(err => console.error('Failed to fetch electricity factors', err))
        .finally(() => setLoadingFactors(false));
    }
  }, [paymentDate, dateError, facilityId, activeYear, isElectricity]);

  if (!data || !schema) return null;

  // Activity Close Check (Water OCR)
  useEffect(() => {
    if (isWater && paymentDate && !dateError && facilityId) {
      checkActivityClose(paymentDate, facilityId).then(checkRes => {
        if (checkRes.data?.result === false) {
          setActivityClosedWarning(true);
        } else {
          setActivityClosedWarning(false);
        }
      });
    }
  }, [paymentDate, dateError, facilityId, isWater]);

  const handleConfirm = async (e) => {
    if (e) e.preventDefault();
    if (dateError) return;
    
    let entryData = {};

    if (isWater) {
      const isPositiveInt = /^\d+$/.test(co2) && parseInt(co2, 10) >= 0;
      if (!isPositiveInt) {
        setCo2Error('請輸入正整數');
        return;
      }
      entryData = {
        category: '水費',
        co2: Number(co2),
        date: paymentDate
      };
    } else if (isElectricity) {
      const isPositiveInt = /^\d+$/.test(usage) && parseInt(usage, 10) >= 0;
      if (!isPositiveInt) {
        setUsageError('請輸入非負整數耗用量');
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
      } else {
        formData.append('data', JSON.stringify(entryData));
        formData.append('category', category);

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
        ) : noEquipmentWarning ? (
          <div className="warning-overlay" style={{ padding: '40px 20px', textAlign: 'center', animation: 'fadeSlideUp 0.4s ease' }}>
            <div className="warning-icon-wrap" style={{ 
              width: '80px', height: '80px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', 
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' 
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h2 style={{ margin: '0 0 8px', color: 'var(--color-text)' }}>您沒有建立相關設備</h2>
            <p style={{ margin: '0 0 32px', color: 'var(--color-text-secondary)', fontSize: '1rem' }}>查無對應之設備或係數，請確認後再嘗試</p>
            <button 
              type="button"
              className="btn-secondary" 
              onClick={onClose}
              style={{ width: '100%', padding: '14px', borderColor: '#ef4444', color: '#ef4444', backgroundColor: 'transparent' }}
            >
              關閉
            </button>
          </div>
        ) : activityClosedWarning ? (
          <div className="warning-overlay" style={{ padding: '40px 20px', textAlign: 'center', animation: 'fadeSlideUp 0.4s ease' }}>
            <div className="warning-icon-wrap" style={{ 
              width: '80px', height: '80px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', 
              borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' 
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <h2 style={{ margin: '0 0 8px', color: 'var(--color-text)' }}>該年度尚未建立設備</h2>
            <p style={{ margin: '0 0 32px', color: 'var(--color-text-secondary)', fontSize: '1rem' }}>此期間的活動數據尚未開放或已關帳</p>
            <button 
              type="button"
              className="btn-secondary" 
              onClick={onClose}
              style={{ width: '100%', padding: '14px', borderColor: '#ef4444', color: '#ef4444', backgroundColor: 'transparent' }}
            >
              關閉
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
                        <input type="number" min="0" step="1" value={co2} onChange={(e) => setCo2(e.target.value)} onKeyDown={(e) => { if(['.','e','E','-','+'].includes(e.key)) e.preventDefault(); }} />
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
                      <input type="number" min="0" step="1" value={usage} onChange={(e) => setUsage(e.target.value)} onKeyDown={(e) => { if(['.','e','E','-','+'].includes(e.key)) e.preventDefault(); }} />
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
