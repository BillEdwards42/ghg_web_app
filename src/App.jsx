import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import ScanSelection from './components/ScanSelection';
import ConfirmationPopup from './components/ConfirmationPopup';
import InstallPrompt from './components/InstallPrompt';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const navigate = useNavigate();
  
  const [forceSkipInstall, setForceSkipInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e) => setIsStandalone(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const [selectedCategory, setSelectedCategory] = useState(() => {
    return sessionStorage.getItem('nav_category') || null;
  });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [ocrData, setOcrResult] = useState(null);
  const [ocrFile, setOcrFile] = useState(null);

  useEffect(() => {
    if (selectedCategory) {
      sessionStorage.setItem('nav_category', selectedCategory);
    } else {
      sessionStorage.removeItem('nav_category');
    }
  }, [selectedCategory]);

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
    navigate('/');
  };

  const skippedInstall = sessionStorage.getItem('skip_install') === 'true' || forceSkipInstall;

  if (!isStandalone && !skippedInstall) {
    return <InstallPrompt onSkip={() => {
      sessionStorage.setItem('skip_install', 'true');
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
    </div>
  );
}

export default App;
