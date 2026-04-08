import React, { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

function ReloadPrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered');
    },
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
  });

  const [newVersion, setNewVersion] = useState('...');

  useEffect(() => {
    if (needRefresh) {
      // Try to fetch the latest version from the server
      fetch('/ghg_web_app/package.json', { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
          if (data.version) setNewVersion(data.version);
        })
        .catch(() => setNewVersion('Newer'));
    }
  }, [needRefresh]);

  const close = () => {
    setNeedRefresh(false);
  };

  if (!needRefresh) return null;

  return (
    <div className="popup-backdrop pwa-update-backdrop">
      <div className="popup-card pwa-update-card">
        <div className="pwa-update-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 12c0-4.4 3.6-8 8-8 3.3 0 6.2 2 7.4 4.9M22 12c0 4.4-3.6 8-8 8-3.3 0-6.2-2-7.4-4.9" />
          </svg>
        </div>
        <h3>更新可用</h3>
        <p className="pwa-update-text">
          發現新版本！更新以獲得最新的功能和修復。
        </p>
        <div className="version-info">
          <div className="version-tag">
            <span>當前版本</span>
            <strong>v{__APP_VERSION__}</strong>
          </div>
          <div className="version-arrow">→</div>
          <div className="version-tag highlight">
            <span>最新版本</span>
            <strong>v{newVersion}</strong>
          </div>
        </div>
        <div className="popup-actions">
          <button className="btn-secondary" onClick={close}>
            稍後
          </button>
          <button className="btn-primary" onClick={() => updateServiceWorker(true)}>
            立即更新
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReloadPrompt;
