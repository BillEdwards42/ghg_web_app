import React, { useState, useEffect } from 'react';

function InstallPrompt({ onSkip }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);

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
    if (!deferredPrompt) {
      // Fallback for browsers (like iOS or desktop) where beforeinstallprompt doesn't fire
      alert('請直接在瀏覽器選單中選擇「加到主畫面」或「安裝」來進行下載。');
      return;
    }
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      onSkip(); // Proceed to login/app after accepting install
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // We've used the prompt, and can't use it again, throw it away
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
    </div>
  );
}

export default InstallPrompt;
