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
    // Actively check the global window object in case the React state missed the initialization slice
    const promptEvent = deferredPrompt || window.deferredPrompt;

    if (!promptEvent) {
      // Check if it's iOS
      const ua = window.navigator.userAgent;
      const isIos = /iPad|iPhone|iPod/.test(ua);
      
      if (isIos) {
        setShowCoachMark(true);
        return;
      }

      // Fallback for browsers (like desktop Safari) where beforeinstallprompt doesn't fire and it isn't a mobile iPhone
      alert('請直接在瀏覽器選單中選擇「加到主畫面」或「安裝」來進行下載。');
      return;
    }
    
    
    // Show the install prompt safely using the actual event instance
    promptEvent.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await promptEvent.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      onSkip(); // Proceed to login/app after accepting install
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // We've used the prompt, and can't use it again, throw it away
    window.deferredPrompt = null;
    setDeferredPrompt(null);
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
