import React, { useState } from 'react';
import { useOCR } from '../hooks/useOCR';

function ScanSelection({ onBack, onOcrResult, initialCategory, onCategorySelect }) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || null);
  const { loading, error, processImage } = useOCR();

  const handleCategoryClick = (cat) => {
    setSelectedCategory(cat);
    onCategorySelect(cat);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCategory) return;

    const result = await processImage(file, selectedCategory);
    if (result) {
      onOcrResult(result.data, selectedCategory, file);
    }
    // Clear input
    e.target.value = '';
  };

  return (
    <div id="scan-view" className="full-screen-modal" style={{ display: 'flex' }}>
      <div className="modal-header">
        <div className="header-left">
          <button className="btn-back" onClick={onBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <h3>選擇掃描類別</h3>
        </div>
      </div>
      
      <div className="modal-body scan-body">
        <div className="category-grid">
          {['電費單', '水費單', '高鐵/台鐵車票'].map(cat => {
            const icons = {
              '電費單': <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>,
              '水費單': <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>,
              '高鐵/台鐵車票': <path d="M4 15h16M8 11h8M12 3v14M7 21l-2-2M17 21l2-2M9 15v2a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-2"></path>
            };
            const classNames = { '電費單': 'electricity', '水費單': 'water', '高鐵/台鐵車票': 'transport' };
            
            return (
              <div 
                key={cat}
                className={`category-card ${selectedCategory === cat ? 'selected' : ''}`}
                onClick={() => handleCategoryClick(cat)}
              >
                <div className={`category-icon ${classNames[cat]}`}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {icons[cat]}
                  </svg>
                </div>
                <span className="category-name">{cat}</span>
              </div>
            );
          })}
        </div>

        {error && (
          <div className="scan-status-msg">{error}</div>
        )}
      </div>

      <div className="modal-footer">
        <label 
          className={`btn-primary btn-take-photo ${(!selectedCategory || loading) ? 'disabled' : ''}`}
          htmlFor="cameraInput"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
          </svg>
          {loading ? '辨識中...' : '開始拍照'}
        </label>
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          id="cameraInput" 
          className="hidden" 
          onChange={handleFileChange}
          disabled={!selectedCategory || loading}
        />
      </div>
    </div>
  );
}

export default ScanSelection;
