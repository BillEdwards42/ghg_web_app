import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useCategories } from '../hooks/useCategories';
import { getIconForCategoryMenu } from '../utils/CategoryIcons';

function ManualCategorySelection({ onBack, onComplete, activeYear, setYear }) {
  const { loading, error, fetchManualTree } = useCategories();
  
  // Step management: 'year' or 'category'
  const [step, setStep] = useState(() => {
    const savedStep = sessionStorage.getItem('manual_step');
    if (savedStep) return savedStep;
    return activeYear ? 'category' : 'year';
  });
  
  // path stores the selected items: [{id, name}, ...]
  const [path, setPath] = useState(() => {
    const savedPath = sessionStorage.getItem('manual_path');
    return savedPath ? JSON.parse(savedPath) : [];
  });
  
  const [fullTree, setFullTree] = useState([]);
  const [animKey, setAnimKey] = useState(0);

  // 1. Persistence Effects
  useEffect(() => {
    sessionStorage.setItem('manual_step', step);
    sessionStorage.setItem('manual_path', JSON.stringify(path));
  }, [step, path]);

  // 2. Data Fetching
  const loadTree = useCallback(async (year) => {
    try {
      const data = await fetchManualTree(year);
      setFullTree(data || []);
      setAnimKey(prev => prev + 1);
    } catch (err) {
      console.error('Failed to load manual tree:', err);
    }
  }, [fetchManualTree]);

  // Fetch when entering category step or if year is already set
  useEffect(() => {
    if (step === 'category' && activeYear) {
      loadTree(activeYear);
    }
  }, [step, activeYear, loadTree]);

  // 3. Dynamic Filtering Logic (Parsing the 3-tier tree)
  const currentLevelData = useMemo(() => {
    if (!fullTree.length) return [];

    // Layer 1: Root Categories
    if (path.length === 0) {
      return fullTree.map(item => ({
        id: item.category, // Use name as ID since Tier 1 has no ID
        name: item.category
      }));
    }

    // Layer 2: Emission Types (Sub-categories)
    if (path.length === 1) {
      const selectedCategory = fullTree.find(c => c.category === path[0].name);
      return (selectedCategory?.emissionType || []).map(et => ({
        id: et.emissionTypeKey, // Using Key as ID
        name: et.emissionTypeName
      }));
    }

    // Layer 3: Equipment Types
    if (path.length === 2) {
      const selectedCategory = fullTree.find(c => c.category === path[0].name);
      const selectedEmissionType = selectedCategory?.emissionType.find(et => et.emissionTypeName === path[1].name);
      return (selectedEmissionType?.equipmentType || []).map(eq => ({
        id: eq.equipmentTypeId,
        name: eq.equipmentTypeName,
        // Carry over other useful props for ManualEntryPopup if needed
        canCreate: eq.canCreate,
        layers: eq.layers
      }));
    }

    return [];
  }, [fullTree, path]);

  const handleYearSelect = (year) => {
    setYear(year.toString());
    setStep('category');
    // loadTree will be triggered by useEffect
  };

  const handleSelect = (item) => {
    const newPath = [...path, item];
    
    if (newPath.length === 3) {
      // Flow complete
      sessionStorage.removeItem('manual_step');
      sessionStorage.removeItem('manual_path');
      onComplete(newPath, activeYear);
    } else {
      setPath(newPath);
      setAnimKey(prev => prev + 1);
    }
  };

  const handleBreadcrumbClick = (type, index) => {
    if (type === 'year') {
      setStep('year');
      setPath([]);
      return;
    }
    
    if (index === path.length - 1) return;
    const newPath = path.slice(0, index + 1);
    setPath(newPath);
    setAnimKey(prev => prev + 1);
  };

  const handleBack = () => {
    if (path.length > 0) {
      const newPath = path.slice(0, -1);
      setPath(newPath);
      setAnimKey(prev => prev + 1);
    } else if (step === 'category') {
      setStep('year');
    } else {
      sessionStorage.removeItem('manual_step');
      sessionStorage.removeItem('manual_path');
      onBack();
    }
  };

  const years = [2026, 2025, 2024, 2023];

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
            onClick={() => { if (step !== 'year' || path.length > 0) { setStep('year'); setPath([]); } }}
            style={{ cursor: step !== 'year' ? 'pointer' : 'default', opacity: step === 'year' && path.length === 0 ? 1 : 0.6 }}
          >
            年度
          </span>
          {activeYear && (
            <>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>/</span>
              <span 
                onClick={() => handleBreadcrumbClick('year')}
                style={{ cursor: path.length > 0 ? 'pointer' : 'default', opacity: step === 'category' && path.length === 0 ? 1 : 0.6 }}
              >
                {activeYear}
              </span>
            </>
          )}
          {path.map((stepItem, index) => (
            <React.Fragment key={stepItem.id}>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>/</span>
              <span 
                onClick={() => handleBreadcrumbClick('path', index)}
                style={{ 
                  cursor: index === path.length - 1 ? 'default' : 'pointer',
                  opacity: index === path.length - 1 ? 1 : 0.6
                }}
              >
                {stepItem.name}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>
      
      <div className="modal-body scan-body">
        {step === 'year' ? (
          <div key="year-selector" className="category-grid" style={{ animation: 'fadeSlideUp 0.3s ease forwards', marginTop: '20px' }}>
            <p style={{ 
              gridColumn: '1/-1', 
              color: 'var(--color-text-secondary)', 
              fontSize: '1rem', 
              marginBottom: '16px', 
              fontWeight: '700',
              textAlign: 'center',
              letterSpacing: '0.5px'
            }}>
              請選擇年度
            </p>
            {years.map(year => (
              <div 
                key={year}
                className={`category-card ${activeYear === year.toString() ? 'active' : ''}`}
                onClick={() => handleYearSelect(year)}
                style={{ justifyContent: 'center' }}
              >
                <span style={{ 
                  fontSize: '1.6rem', 
                  fontWeight: '800', 
                  color: activeYear === year.toString() ? 'var(--color-primary)' : 'var(--color-text)',
                  letterSpacing: '1px'
                }}>
                  {year}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <>
            {error && (
              <div className="scan-status-msg" style={{ margin: '20px 0', textAlign: 'center', color: 'var(--color-error)' }}>
                {error}
                <button 
                  onClick={() => loadTree(activeYear)} 
                  style={{ display: 'block', margin: '12px auto', padding: '8px 16px', borderRadius: '4px', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', background: 'none' }}
                >
                  重試
                </button>
              </div>
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
                      style={{ gap: '16px' }}
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
                  !error && (
                    <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)', marginTop: '20px' }}>
                      此類別目前沒有選項
                    </div>
                  )
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default ManualCategorySelection;
