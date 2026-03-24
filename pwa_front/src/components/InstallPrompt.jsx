import React, { useState, useEffect } from 'react';
import IosCoachMark from './IosCoachMark';

function InstallPrompt({ onSkip }) {
  // Check if the global listener in main.jsx already safely caught the prompt
  const [deferredPrompt, setDeferredPrompt] = useState(window.deferredPrompt || null);
  const [showCoachMark, setShowCoachMark] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    // 判斷是否為 iOS 裝置
    const ua = window.navigator.userAgent;
    const isIos = /iPad|iPhone|iPod/.test(ua);

    if (isIos) {
      // 依據您的要求，iOS 永遠只顯示全螢幕變暗的 Coach Mark 動畫
      setShowCoachMark(true);
      return;
    }

    // 依據您的要求，Android 或其他系統永遠只觸發系統原生的安裝彈出視窗，且絕不顯示任何警告或 fallback Alert
    const promptEvent = deferredPrompt || window.deferredPrompt;
    
    if (promptEvent) {
      try {
        await promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        
        if (outcome === 'accepted') {
          console.log('User accepted the native install prompt');
          onSkip(); // Proceed to login/app after successfully accepting install
        } else {
          console.log('User dismissed the native install prompt');
        }
        
        // We've used the prompt, throw it away natively
        window.deferredPrompt = null;
        setDeferredPrompt(null);
      } catch (err) {
        console.error('System prompt error:', err);
      }
    } else {
      // 如果瀏覽器安全策略或快取導致系統彈窗事件被隱藏 (例如安裝過了)，提供一個 fallback 提示
      console.warn("System native install prompt was completely swallowed or blocked by Chrome.");
      alert('無法啟動系統安裝程式。如果想安裝此 App，請點擊瀏覽器右上角的選單 (⋮)，然後選擇「加到主畫面」或「安裝應用程式」。');
    }
  };

  const logoUrl = `${import.meta.env.BASE_URL}assets/lndata_logo_en.png`;

  return (
    <div id="login-screen">
      <div className="login-card" style={{ textAlign: 'center', backgroundColor: '#FFFFFF' }}>
        <img className="logo" src={logoUrl} alt="GHG Logo" style={{ marginBottom: '20px' }} />
        <h2 style={{ marginBottom: '30px', color: '#1B1B1F', fontSize: '1.25rem' }}>請下載以獲得最佳體驗</h2>
        
        <button 
          onClick={handleInstallClick}
          className="btn-primary"
          style={{ marginBottom: '15px' }}
        >
          下載
        </button>
        
        <button 
          onClick={onSkip}
          className="btn-primary"
          style={{ background: '#F0F0F5', color: '#1B1B1F', border: 'none' }}
        >
          取消
        </button>
      </div>

      {showCoachMark && <IosCoachMark onClose={() => setShowCoachMark(false)} />}
    </div>
  );
}

export default InstallPrompt;
