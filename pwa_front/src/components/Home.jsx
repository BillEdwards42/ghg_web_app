import React, { useState, useEffect } from 'react';
import SelectionModal from './SelectionModal';
import { apiClient } from '../utils/api';

function Home({ onOpenScan, onOpenManual, onLogout }) {
  // 1. Initial State from LocalStorage
  const [entities] = useState(() => JSON.parse(localStorage.getItem('rootLegalEntities') || '[]'));
  const [selectedCorp, setSelectedCorp] = useState(() => JSON.parse(localStorage.getItem('selected_corp') || 'null'));
  const [selectedLoc, setSelectedLoc] = useState(() => JSON.parse(localStorage.getItem('selected_loc') || 'null'));
  
  // 2. Dynamic Data State
  const [facilities, setFacilities] = useState(() => {
    // Try to load cached facilities for the currently selected corp
    const cached = localStorage.getItem(`facilities_${selectedCorp?.id}`);
    return cached ? JSON.parse(cached) : [];
  });
  const [loadingFacilities, setLoadingFacilities] = useState(false);

  const [isCorpModalOpen, setIsCorpModalOpen] = useState(false);
  const [isLocModalOpen, setIsLocModalOpen] = useState(false);

  // 3. Persistence Effects
  useEffect(() => {
    localStorage.setItem('selected_corp', JSON.stringify(selectedCorp));
  }, [selectedCorp]);

  useEffect(() => {
    localStorage.setItem('selected_loc', JSON.stringify(selectedLoc));
  }, [selectedLoc]);

  // 4. Facility Fetching Logic
  const fetchFacilities = async (entityId) => {
    setLoadingFacilities(true);
    try {
      // Endpoint from auth.md: /facilitys/all/<id>?mode=direct&maxResults=999
      const response = await apiClient.get(`/facilitys/all/${entityId}`, {
        params: { mode: 'direct', maxResults: 999 }
      });
      const data = response.data || [];
      setFacilities(data);
      localStorage.setItem(`facilities_${entityId}`, JSON.stringify(data));
    } catch (err) {
      console.error('Failed to fetch facilities:', err);
      setFacilities([]);
    } finally {
      setLoadingFacilities(false);
    }
  };

  const handleCorpSelect = (corp) => {
    setSelectedCorp(corp);
    setSelectedLoc(null); // Reset location when corp changes
    setFacilities([]); // Clear old list
    fetchFacilities(corp.id); // Fetch new list for this entity
  };

  const isActionEnabled = selectedCorp && selectedLoc;
  const logoUrl = `${import.meta.env.BASE_URL}assets/lndata_logo_en.png`;

  return (
    <div id="home-screen" className="app-container" style={{ display: 'block' }}>
      <header className="app-header">
        <img src={logoUrl} alt="LN Data Logo" className="header-logo-img" />
        <div className="header-logo">{"Ln{Carbon}"}</div>
        <button onClick={onLogout} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#8E8EA0', fontWeight: '600' }}>登出</button>
      </header>

      <div className="context-pills-container">
        <button className="context-pill" onClick={() => setIsCorpModalOpen(true)}>
          <span className="pill-label">法人</span>
          <div className="pill-value-group">
            <span className="pill-value">{selectedCorp?.name || '請選擇'}</span>
            <svg className="pill-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>
        </button>
        <button className="context-pill" onClick={() => setIsLocModalOpen(true)} disabled={!selectedCorp || loadingFacilities}>
          <span className="pill-label">據點</span>
          <div className="pill-value-group">
            <span className="pill-value">
              {loadingFacilities ? '載入中...' : (selectedLoc?.name || '請選擇')}
            </span>
            {!loadingFacilities && (
              <svg className="pill-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            )}
          </div>
        </button>
      </div>

      <main className="app-content">
        {!isActionEnabled ? (
          <div id="action-placeholder" className="empty-state">
            <div className="placeholder-dropzone">
              <div className="empty-icon-wrap">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
              </div>
              <p>請先選擇法人和據點，<br />選擇後可以通過拍照或是手動輸入來記錄貴單位的排碳活動。</p>
            </div>
          </div>
        ) : (
          <>
            <div id="action-buttons" className="action-grid-dock">
              <div className="action-box primary" onClick={onOpenScan}>
                <div className="box-content stack">
                  <div className="box-icon-wrap">
                    <svg className="box-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </div>
                  <div className="box-text">
                    <h3>拍照掃描</h3>
                    <p>智慧自動填入</p>
                  </div>
                </div>
              </div>

              <button className="action-box secondary" id="btn-manual" onClick={onOpenManual}>
                <div className="box-content stack">
                  <div className="box-icon-wrap">
                    <svg className="box-icon" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 20h9" />
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                  </div>
                  <div className="box-text">
                    <h3>手動輸入</h3>
                    <p>自訂表單欄位</p>
                  </div>
                </div>
              </button>
            </div>
          </>
        )}
      </main>

      <SelectionModal 
        title="選擇法人"
        items={entities}
        isOpen={isCorpModalOpen}
        onClose={() => setIsCorpModalOpen(false)}
        onSelect={handleCorpSelect}
        selectedItem={selectedCorp}
        isLoc={false}
      />

      <SelectionModal 
        title="選擇據點"
        items={facilities}
        isOpen={isLocModalOpen}
        onClose={() => setIsLocModalOpen(false)}
        onSelect={setSelectedLoc}
        selectedItem={selectedLoc}
        isLoc={true}
      />
    </div>
  );
}

export default Home;
