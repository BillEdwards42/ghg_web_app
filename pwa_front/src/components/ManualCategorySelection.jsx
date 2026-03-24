import React, { useState, useEffect } from 'react';
import { useCategories } from '../hooks/useCategories';
import { getIconForCategoryMenu } from '../utils/CategoryIcons';

function ManualCategorySelection({ onBack, onComplete }) {
  const { loading, error, fetchCategories } = useCategories();
  
  // path stores the selected items: [{id, name}, ...]
  const [path, setPath] = useState([]);
  const [currentLevelData, setCurrentLevelData] = useState([]);
  // 'entering' state to trigger animation re-renders
  const [animKey, setAnimKey] = useState(0);

  // Load root categories on mount
  useEffect(() => {
    loadLevel(null);
  }, []); // eslint-disable-line

  const loadLevel = async (parentId) => {
    const data = await fetchCategories(parentId);
    setCurrentLevelData(data);
    setAnimKey(prev => prev + 1);
  };

  const handleSelect = (item) => {
    const newPath = [...path, item];
    setPath(newPath);
    
    // We have 3 layers: root -> level1 -> level2
    // So if newPath.length === 3, we are done
    if (newPath.length === 3) {
      onComplete(newPath);
    } else {
      loadLevel(item.id);
    }
  };

  const handleBreadcrumbClick = (index) => {
    if (index === path.length - 1) return; // Currently here
    
    const newPath = path.slice(0, index + 1);
    setPath(newPath);
    const parentId = newPath.length > 0 ? newPath[newPath.length - 1].id : null;
    loadLevel(parentId);
  };

  const handleBack = () => {
    if (path.length > 0) {
      const newPath = path.slice(0, -1);
      setPath(newPath);
      const parentId = newPath.length > 0 ? newPath[newPath.length - 1].id : null;
      loadLevel(parentId);
    } else {
      onBack();
    }
  };

  return (
    <div id="manual-view" className="full-screen-modal" style={{ display: 'flex' }}>
      <div className="modal-header" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
        <div className="header-left" style={{ width: '100%' }}>
          <button className="btn-back" onClick={handleBack}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <h3 style={{ margin: 0 }}>手動輸入選擇</h3>
        </div>
        
        {/* Dynamic Breadcrumbs */}
        <div style={{ display: 'flex', gap: '6px', fontSize: '0.85rem', color: 'var(--color-primary)', fontWeight: '600', alignItems: 'center', flexWrap: 'wrap' }}>
          <span 
            onClick={() => { if (path.length > 0) { setPath([]); loadLevel(null); } }}
            style={{ cursor: path.length > 0 ? 'pointer' : 'default', opacity: path.length === 0 ? 1 : 0.6 }}
          >
            首頁
          </span>
          {path.map((step, index) => (
            <React.Fragment key={step.id}>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>/</span>
              <span 
                onClick={() => handleBreadcrumbClick(index)}
                style={{ 
                  cursor: index === path.length - 1 ? 'default' : 'pointer',
                  opacity: index === path.length - 1 ? 1 : 0.6
                }}
              >
                {step.name}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>
      
      <div className="modal-body scan-body">
        {error && (
          <div className="scan-status-msg">{error}</div>
        )}
        
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--color-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
              <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
            </svg>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            <span style={{ opacity: 0.8, color: 'var(--color-text-secondary)', fontWeight: '500' }}>載入中...</span>
          </div>
        ) : (
          <div key={animKey} className="category-grid" style={{ animation: 'fadeSlideUp 0.3s ease forwards' }}>
            {currentLevelData.length > 0 ? (
              currentLevelData.map(item => (
                <div 
                  key={item.id}
                  className="category-card"
                  onClick={() => handleSelect(item)}
                  style={{ gap: '16px' }} // Tighten gap slightly
                >
                  <div className="category-icon" style={{ background: 'rgba(73, 118, 203, 0.08)', color: 'var(--color-primary)' }}>
                    {getIconForCategoryMenu(path.length, path.length > 0 ? path[0].name : '')}
                  </div>
                  <span className="category-name" style={{ flex: 1, fontSize: '1.15rem' }}>{item.name}</span>
                  
                  {path.length < 2 && (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                      <polyline points="9 18 15 12 9 6"></polyline>
                    </svg>
                  )}
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', marginTop: '20px' }}>
                此類別目前沒有選項
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ManualCategorySelection;
