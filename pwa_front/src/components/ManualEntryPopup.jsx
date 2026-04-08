import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useEquipmentForm } from '../hooks/useEquipmentForm';
import { fetchEmployeeCommutingConf, checkActivityClose } from '../utils/api';

function ManualEntryPopup({ pathData, year, onClose, onSave, initialData }) {
  const { loading: schemaLoading, error: schemaError, resolveSchema } = useEquipmentForm();

  const [schema, setSchema] = useState(null);
  const [formData, setFormData] = useState(() => {
    const initialState = {
      useDate: initialData?.date ? initialData.date.replace(/[\/\.]/g, '-') : '',
      file: initialData?.file || '',
      source: '',
      custodian: ''
    };
    // For transportation OCR tickets
    if (initialData) {
      initialState.usage1 = initialData.usage1 || initialData.passengerCount || ''; 
      initialState.departure = ''; // Placeholder for ID matching
      initialState.destination = ''; // Placeholder for ID matching
    }
    return initialState;
  });
  const [options, setOptions] = useState({});
  const [loadingFields, setLoadingFields] = useState({});
  const [errors, setErrors] = useState({});
  const [hideUsage2, setHideUsage2] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const hasInitialized = useRef(false);

  const facilityId = useMemo(() => {
    const loc = JSON.parse(localStorage.getItem('selected_loc') || '{}');
    return loc.id;
  }, []);

  // 1. Initialize Schema and One-time Form Setup
  useEffect(() => {
    const resolved = resolveSchema(pathData);
    if (resolved) {
      setSchema(resolved);

      if (!hasInitialized.current) {
        if (resolved.initSetup) {
          resolved.initSetup({
            equipmentTypeId: pathData[2].id,
            setFormData
          });
        }
        hasInitialized.current = true;
      }
    }
  }, [pathData, resolveSchema]);

  // 2. Dependency Watcher
  const useDate = formData.useDate;
  useEffect(() => {
    if (!schema || !useDate || !facilityId) return;

    schema.middleForm.forEach(async (field) => {
      if (field.dependency === 'useDate' && field.api) {
        setLoadingFields(prev => ({ ...prev, [field._key]: true }));
        try {
          const params = [facilityId, pathData[2].id, year, useDate];
          const res = await field.api(params);
          const data = res.data || [];
          setOptions(prev => ({ ...prev, [field._key]: data }));

          // OCR Pre-selection for emissionSourceId (e.g. 種類選擇)
          if (initialData && field._key === 'emissionSourceId' && data.length > 0) {
            const targetId = formData.emissionSourceId || data[0].id;
            const selectedItem = data.find(opt => String(opt.id) === String(targetId));

            if (selectedItem) {
              setFormData(prev => ({ ...prev, emissionSourceId: selectedItem.id }));
              if (field.handleSelectorChange) {
                field.handleSelectorChange({
                  item: selectedItem,
                  formData: { ...formData, emissionSourceId: selectedItem.id },
                  setFormData,
                  setErrors,
                  facilityId,
                  emissionTypeId: pathData[1].id,
                  setHideUsage2
                });
              }
            }
          }

          // Trigger checkerFunc if it depends on useDate (e.g. equipment date check)
          if (field.checkerFunc && formData[field._key]) {
            const selectedItem = data.find(opt => String(opt.id) === String(formData[field._key]));
            if (selectedItem) {
              field.checkerFunc({ item: selectedItem, formData, setErrors });
            }
          }
        } catch (err) {
          console.error(`Failed to refresh options for ${field._key}:`, err);
        } finally {
          setLoadingFields(prev => ({ ...prev, [field._key]: false }));
        }
      }
    });
  }, [useDate, schema, facilityId, pathData, year]);

  // 3. Independent Option Fetcher (e.g., Stations)
  useEffect(() => {
    if (!schema) return;

    schema.middleForm.forEach(async (field) => {
      if (field.type === 'select' || field.type === 'selectWithDesc') {
        if (!field.dependency && field.api) {
          setLoadingFields(prev => ({ ...prev, [field._key]: true }));
          try {
            const res = await field.api();
            const data = res.data || [];
            setOptions(prev => ({ ...prev, [field._key]: data }));

            // OCR Pre-selection for stations
            if (initialData) {
              if (field._key === 'departure' && initialData.from_name) {
                const match = data.find(opt => opt.name === initialData.from_name);
                if (match) setFormData(prev => ({ ...prev, departure: match.id }));
              }
              if (field._key === 'destination' && initialData.to_name) {
                const match = data.find(opt => opt.name === initialData.to_name);
                if (match) setFormData(prev => ({ ...prev, destination: match.id }));
              }
            }
          } catch (err) {
            console.error(`Failed to fetch options for ${field._key}:`, err);
          } finally {
            setLoadingFields(prev => ({ ...prev, [field._key]: false }));
          }
        }
      }
    });
  }, [schema, initialData]);

  const handleFieldChange = async (field, value) => {
    let newValue = value;
    let fieldError = null;

    // Numeric Validation (Legacy Alignment)
    if (field.type === 'inputNumber') {
      if (value === '') {
        newValue = '';
      } else {
        const num = parseFloat(value);
        if (num < 0) {
          newValue = value;
          fieldError = '數值不能為負';
        } else {
          newValue = value; // Preserve exact string so decimals ("1.") aren't swallowed
        }
      }
    }

    // Required Field Check - All visible, enabled fields are required
    if (!field.disabled && field.type !== 'hidden' && !newValue && newValue !== 0) {
      fieldError = '此欄位為必填';
    }

    setErrors(prev => ({ ...prev, [field._key]: fieldError }));

    const newFormData = { ...formData, [field._key]: newValue };
    setFormData(prev => ({ ...prev, [field._key]: newValue }));

    if ((field.type === 'select' || field.type === 'selectWithDesc') && field.handleSelectorChange) {
      const selectedItem = (options[field._key] || []).find(opt => String(opt.id) === String(newValue));
      field.handleSelectorChange({
        item: selectedItem,
        formData: newFormData,
        setFormData,
        setErrors,
        facilityId,
        emissionTypeId: pathData[1].id,
        setHideUsage2
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    [...schema.topForm, ...schema.middleForm, ...schema.bottomForm].forEach(field => {
      // Hide logic from renderField
      if (field.hideKey && hideUsage2) return;
      if (field.type === 'hidden' || field.disabled) return;

      if (!formData[field._key] && formData[field._key] !== 0) {
        if (field.type !== 'tableInput') { // tableInput validated separately
          newErrors[field._key] = '此欄位為必填';
          isValid = false;
        }
      }
    });

    // Validate table inputs (Employee Commuting grid)
    if (schema.middleForm.some(f => f.type === 'tableInput')) {
      commutingList.forEach((row, idx) => {
        if (row.numberOfPeople === '' || row.numberOfPeople === null || row.numberOfPeople === undefined) {
          newErrors[`${idx}-numberOfPeople`] = '必填';
          isValid = false;
        }
        if (row.distance === '' || row.distance === null || row.distance === undefined) {
          newErrors[`${idx}-distance`] = '必填';
          isValid = false;
        }
      });
    }

    // Check for existing errors (like date validation or negative values)
    Object.values(errors).forEach(err => {
      if (err) isValid = false;
    });

    setErrors(prev => ({ ...prev, ...newErrors }));
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      // 1. Double check Closed Period before final submission
      if (formData.useDate) {
        const checkRes = await checkActivityClose(formData.useDate, facilityId);
        if (checkRes.data?.result === false) {
          alert('此期間已關帳，無法新增或編輯資料');
          setIsSubmitting(false);
          return;
        }
      }

      const payload = schema.saveFormatting(formData, pathData[2].id);

      if (payload instanceof FormData) {
        if (!payload.has('facilityId')) payload.append('facilityId', facilityId);
        if (!payload.has('year')) payload.append('year', year);
        // Only append the fetchKey (equipmentTypeId/categoryItemId) if defined in schema
        if (schema.fetchKey && !payload.has(schema.fetchKey)) {
          payload.append(schema.fetchKey, pathData[2].id);
        }
      }

      await schema.apis.add(payload);
      setShowSuccess(true);
    } catch (err) {
      console.error('Save failed:', err);
      alert('儲存失敗：' + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Specialized Component: TableInput (Employee Commuting) ---
  const [commutingList, setCommutingList] = useState([]);
  useEffect(() => {
    if (schema?.middleForm?.[0]?.type === 'tableInput' && facilityId) {
      fetchEmployeeCommutingConf({}, facilityId, year).then(res => {
        setCommutingList(res.data?.map(i => ({
          ...i,
          numberOfPeople: 0,
          distance: 0,
          remark: ''
        })) || []);
      });
    }
  }, [schema, facilityId, year]);

  const handleTableChange = (index, key, val) => {
    const newList = [...commutingList];
    // Ensure numerical values for calculation fields
    newList[index][key] = (key === 'numberOfPeople' || key === 'distance') ? Number(val) : val;
    setCommutingList(newList);
    setFormData(prev => ({ ...prev, employeeCommutingDataDetails: newList }));

    // Clear grid error on change
    if (errors[`${index}-${key}`]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[`${index}-${key}`];
        return next;
      });
    }
  };

  const renderField = (field) => {
    if (field.hideKey && hideUsage2) return null;

    const value = formData[field._key] ?? '';

    if (field.type === 'hidden') {
      return <input type="hidden" key={field._key} value={value} />;
    }

    const label = field.labelName || field._key;
    const error = errors[field._key];

    // Description Block for selectWithDesc
    let descriptionBlock = null;
    if (field.type === 'selectWithDesc' && value) {
      const selectedItem = (options[field._key] || []).find(opt => opt.id === value);
      if (selectedItem) {
        const descConfig = field.descDependency ? field.desc[pathData[1].id] : field.desc;
        if (descConfig) {
          descriptionBlock = (
            <div className="desc-card" style={{ marginTop: '8px', padding: '12px', background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-sm)', fontSize: '0.85rem' }}>
              {descConfig.map(d => (
                <div key={d.key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{d.label}</span>
                  <span style={{ fontWeight: '600' }}>{d.render ? d.render(selectedItem[d.key]) : selectedItem[d.key]}</span>
                </div>
              ))}
            </div>
          );
        }
      }
    }

    return (
      <div className={`form-group ${error ? 'has-error' : ''}`} key={field._key}>
        <label>
          {label}
        </label>

        {field.type === 'tableInput' ? (
          <div className="table-input-container" style={{ overflowX: 'auto', border: '1px solid var(--color-divider)', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead style={{ background: 'var(--color-bg-secondary)' }}>
                <tr style={{ borderBottom: '1px solid var(--color-divider)' }}>
                  <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>排放源</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>員工人次</th>
                  <th style={{ textAlign: 'center', padding: '12px 16px', fontWeight: '600', color: 'var(--color-text-secondary)' }}>平均通勤距離 (公里)</th>
                </tr>
              </thead>
              <tbody>
                {commutingList.map((row, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--color-divider)', transition: 'background-color 0.2s ease' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '12px 16px', fontWeight: '500' }}>{row.commutingModeName}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={row.numberOfPeople === 0 ? '' : row.numberOfPeople}
                        onChange={e => handleTableChange(idx, 'numberOfPeople', e.target.value)}
                        placeholder="0"
                        style={{ width: '80px', padding: '6px 8px', textAlign: 'center', border: '1px solid var(--color-divider)', borderRadius: '4px', borderColor: errors[`${idx}-numberOfPeople`] ? 'var(--color-error)' : 'var(--color-divider)' }}
                      />
                      {errors[`${idx}-numberOfPeople`] && <div style={{ color: 'var(--color-error)', fontSize: '0.65rem', marginTop: '2px', textAlign: 'center' }}>{errors[`${idx}-numberOfPeople`]}</div>}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={row.distance === 0 ? '' : row.distance}
                        onChange={e => handleTableChange(idx, 'distance', e.target.value)}
                        placeholder="0"
                        style={{ width: '90px', padding: '6px 8px', textAlign: 'center', border: '1px solid var(--color-divider)', borderRadius: '4px', borderColor: errors[`${idx}-distance`] ? 'var(--color-error)' : 'var(--color-divider)' }}
                      />
                      {errors[`${idx}-distance`] && <div style={{ color: 'var(--color-error)', fontSize: '0.65rem', marginTop: '2px', textAlign: 'center' }}>{errors[`${idx}-distance`]}</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="input-with-unit">
            {field.type.startsWith('select') ? (
              <select
                value={value}
                onChange={(e) => handleFieldChange(field, e.target.value)}
                disabled={field.disabled || (field.dependency === 'useDate' && !formData.useDate) || loadingFields[field._key]}
                style={{ borderColor: error ? 'var(--color-error)' : '' }}
              >
                <option value="" disabled hidden>
                  {loadingFields[field._key] ? '載入中...' : '請選擇'}
                </option>
                {(options[field._key] || []).map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.name}</option>
                ))}
              </select>
            ) : field.type === 'date' ? (
              <input
                type="date"
                placeholder="請選擇日期"
                value={value}
                onChange={(e) => handleFieldChange(field, e.target.value)}
                min={`${year}-01-01`}
                max={`${year}-12-31`}
                style={{ borderColor: error ? 'var(--color-error)' : '' }}
              />
            ) : field.type === 'upload' ? (
              <input
                type="file"
                onChange={(e) => handleFieldChange(field, e.target.files[0])}
                accept="image/*,application/pdf"
              />
            ) : (
              <input
                type={field.type === 'inputNumber' ? 'number' : 'text'}
                value={value}
                onChange={(e) => handleFieldChange(field, e.target.value)}
                disabled={field.disabled}
                style={{ borderColor: error ? 'var(--color-error)' : '' }}
                step="any"
              />
            )}

            {field.unit && <span className="input-unit">{field.unit}</span>}
          </div>
        )}

        {error && <div className="field-error-msg" style={{ color: 'var(--color-error)', fontSize: '0.75rem', marginTop: '4px' }}>{error}</div>}
        {descriptionBlock}
      </div>
    );
  };

  if (schemaError) return <div className="field-error">{schemaError}</div>;

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
                onSave(formData);
              }}
              style={{ width: '100%', padding: '14px' }}
            >
              完成
            </button>
          </div>
        ) : (
          <>
            <div className="popup-header">
              <h3 style={{ margin: 0 }}>{pathData[2]?.name}</h3>
              <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: '600' }}>
                報告年度：<span style={{ color: 'var(--color-primary)' }}>{year}</span>
              </p>
            </div>

            {schemaLoading || !schema ? (
              <div className="loading-state" style={{ padding: '40px', textAlign: 'center' }}>
                <div className="spinner"></div>
                <p>載入表單配置...</p>
              </div>
            ) : (
              <form className="popup-form" onSubmit={handleSubmit} style={{ marginTop: '16px' }}>
                <div className="form-section">
                  {schema.topForm.map(renderField)}
                  {schema.middleForm.map(renderField)}
                  {schema.bottomForm.map(renderField)}
                </div>

                <div className="popup-actions" style={{ marginTop: '24px', position: 'sticky', bottom: 0, background: 'white', paddingTop: '12px' }}>
                  <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting} style={{ flex: 1 }}>
                    取消
                  </button>
                  <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ flex: 1 }}>
                    {isSubmitting ? '儲存中...' : '確認儲存'}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ManualEntryPopup;
