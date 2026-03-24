import React, { useState, useEffect } from 'react';
import { useEquipmentForm } from '../hooks/useEquipmentForm';

function ManualEntryPopup({ equipment, onClose, onSave }) {
  const { loading, error, fetchSchema } = useEquipmentForm();
  const [schema, setSchema] = useState([]);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    // When popup opens, instantly fetch the fields required for this specific equipment
    const loadSchema = async () => {
      if (equipment?.id) {
        const fields = await fetchSchema(equipment.id);
        setSchema(fields);
      }
    };
    loadSchema();
  }, [equipment, fetchSchema]);

  const handleChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="popup-backdrop">
      <div className="popup-card">
        <h3>新增 {equipment?.name || '手動紀錄'}</h3>
        
        {loading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--color-primary)' }}>
            <svg className="spinner" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
            </svg>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            <p style={{ marginTop: '12px', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>載入表單欄位...</p>
          </div>
        ) : error ? (
          <div className="field-error" style={{ textAlign: 'center', margin: '20px 0' }}>{error}</div>
        ) : (
          <form className="popup-form" onSubmit={handleSubmit} style={{ animation: 'fadeIn 0.3s ease' }}>
            {schema.map((field) => (
              <div className="form-group" key={field.id}>
                <label>
                  {field.label} {field.required && <span style={{ color: 'var(--color-error)' }}>*</span>}
                </label>
                <div className="input-with-unit">
                  <input
                    type={field.type}
                    value={formData[field.id] || ''}
                    onChange={(e) => handleChange(field.id, e.target.value)}
                    required={field.required}
                  />
                  {field.unit && <span className="input-unit">{field.unit}</span>}
                </div>
              </div>
            ))}
            
            <div className="popup-actions" style={{ marginTop: '16px' }}>
              <button type="button" className="btn-secondary" onClick={onClose} style={{ flex: 1 }}>
                取消
              </button>
              <button type="submit" className="btn-primary" style={{ flex: 1 }}>
                儲存
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ManualEntryPopup;
