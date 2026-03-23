import React from 'react';

function IosCoachMark({ onClose }) {
  // Determine if it's iOS and the specific browser using regex on userAgent
  const ua = window.navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua);
  
  // Note: Chrome on iOS contains 'CriOS'. Firefox contains 'FxiOS'.
  const isChrome = isIos && /CriOS/i.test(ua);
  const isFirefox = isIos && /FxiOS/i.test(ua);
  
  // Safari contains WebKit & Safari but NO CriOS/FxiOS
  const isSafari = isIos && /WebKit/i.test(ua) && !isChrome && !isFirefox;

  // Initial variables for rendering different layouts dynamically
  let layoutClass = 'generic-layout';
  let instructionText = '請使用 Safari 開啟此網頁即可將 App 加到主畫面。';
  let showArrow = false;
  let ShareIcon = null;

  if (isSafari) {
    layoutClass = 'safari-layout';
    showArrow = true;
    ShareIcon = () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', margin: '0 4px', color: '#4976CB' }}>
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
        <polyline points="16 6 12 2 8 6"/>
        <line x1="12" y1="2" x2="12" y2="15"/>
      </svg>
    );
  } else if (isChrome) {
    layoutClass = 'chrome-layout';
    showArrow = true;
    ShareIcon = () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', margin: '0 4px', color: '#4976CB' }}>
        <circle cx="18" cy="5" r="3"/>
        <circle cx="6" cy="12" r="3"/>
        <circle cx="18" cy="19" r="3"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
      </svg>
    );
  }

  return (
    <div className="ios-coach-mark-overlay" onClick={onClose}>
      <div className={`coach-mark-container ${layoutClass}`} onClick={(e) => e.stopPropagation()}>
        <div className="coach-mark-content">
          <p>
            {isSafari || isChrome ? (
              <>
                點擊{isSafari ? '下方' : '右上角'} <ShareIcon /> 分享按鈕<br/>
                選擇<strong>「加到主畫面」</strong>
              </>
            ) : (
              instructionText
            )}
          </p>
          <button className="btn-coach-mark-close" onClick={onClose}>我知道了</button>
        </div>
        
        {showArrow && (
          <div className="coach-mark-arrow">
            <svg width="60" height="120" viewBox="0 0 60 120" fill="none">
              <path d="M30 15 L30 105 M15 90 L30 105 L45 90" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

export default IosCoachMark;
