import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import ScanSelection from './components/ScanSelection';
import ConfirmationPopup from './components/ConfirmationPopup';
import InstallPrompt from './components/InstallPrompt';
import ManualCategorySelection from './components/ManualCategorySelection';
import ManualEntryPopup from './components/ManualEntryPopup';

function App() {
  //Reaches into localStorage to see if the user is logged in.
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const navigate = useNavigate();

  //Immediately interigates the browser: "Is this running full screen from home screen?"
  const [forceSkipInstall, setForceSkipInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
  );

  //useEffect is a React tool that says "Run this code in bg one time when the app boots up". Use it to constantly listen for native appinstalled event.
  //This one checks on whether the user switched to app from web and if so, set setIsStandalone to true.
  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e) => setIsStandalone(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  //This one listens for the native appinstalled event and if so, set forceSkipInstall to true.
  useEffect(() => {
    const handleAppInstalled = () => {
      localStorage.setItem('pwa_prompt_dismissed', 'true');
      setForceSkipInstall(true);
      console.log('PWA was installed natively');
    };
    window.addEventListener('appinstalled', handleAppInstalled);
    return () => window.removeEventListener('appinstalled', handleAppInstalled);
  }, []);

  const [selectedCategory, setSelectedCategory] = useState(() => {
    return sessionStorage.getItem('nav_category') || null;
  });

  // The following are initializations of holders, in this order:
  // 1. The trigger of data popup window
  // 2. OCR json
  // 3. OCR image
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [ocrData, setOcrResult] = useState(null);
  const [ocrFile, setOcrFile] = useState(null);
  
  // Manual Entry State
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualEquipment, setManualEquipment] = useState(null);

  useEffect(() => {
    if (selectedCategory) {
      sessionStorage.setItem('nav_category', selectedCategory);
    } else {
      sessionStorage.removeItem('nav_category');
    }
  }, [selectedCategory]);
  //Watch this specific variable, every time the user clicks a category, instantly run this code. Empty [] means it only runs on startup.

  const handleLogin = () => {
    localStorage.setItem('isLoggedIn', 'true');
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    sessionStorage.clear();
    setIsLoggedIn(false);
  };

  const clearOcrState = () => {
    setOcrResult(null);
    setOcrFile(null);
    setSelectedCategory(null);
    setShowConfirmation(false);
    navigate('/scan');
  };

  const clearManualState = () => {
    setShowManualEntry(false);
    setManualEquipment(null);
    setSelectedCategory(null);
    navigate('/');
  };

  const skippedInstall = localStorage.getItem('pwa_prompt_dismissed') === 'true' || forceSkipInstall;

  if (!isStandalone && !skippedInstall) {
    return <InstallPrompt onSkip={() => {
      localStorage.setItem('pwa_prompt_dismissed', 'true');
      setForceSkipInstall(true);
    }} />;
  }

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-wrapper">
      <Routes>
        <Route path="/" element={
          <Home
            onOpenScan={() => navigate('/scan')}
            onOpenManual={() => navigate('/manual')}
            onLogout={handleLogout}
          />
        } />

        <Route path="/scan" element={
          <ScanSelection
            initialCategory={selectedCategory}
            onBack={() => {
              setSelectedCategory(null);
              navigate('/');
            }}
            onCategorySelect={(cat) => setSelectedCategory(cat)}
            onOcrResult={(data, category, file) => {
              setOcrResult(data);
              setOcrFile(file);
              setSelectedCategory(category);
              setShowConfirmation(true);
            }}
          />
        } />

        <Route path="/manual" element={
          <ManualCategorySelection
            onBack={() => navigate('/')}
            onComplete={(pathData) => {
              const equipment = pathData[2]; // object with id and name
              setManualEquipment(equipment);
              setShowManualEntry(true);
            }}
          />
        } />
      </Routes>

      {showConfirmation && (
        <ConfirmationPopup
          data={ocrData}
          file={ocrFile}
          category={selectedCategory}
          onClose={clearOcrState}
          onSave={() => {
            clearOcrState();
          }}
        />
      )}

      {showManualEntry && (
        <ManualEntryPopup
          equipment={manualEquipment}
          onClose={clearManualState}
          onSave={(data) => {
            console.log("Saving manual data:", data);
            clearManualState();
          }}
        />
      )}
    </div>
  );
}

export default App;
