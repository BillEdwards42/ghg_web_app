import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Home from './components/Home';
import ScanSelection from './components/ScanSelection';
import ConfirmationPopup from './components/ConfirmationPopup';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  
  // Restore navigation state from sessionStorage on startup
  const [currentView, setCurrentView] = useState(() => {
    return sessionStorage.getItem('nav_view') || 'home';
  });
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return sessionStorage.getItem('nav_category') || null;
  });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [ocrData, setOcrResult] = useState(null);
  const [ocrFile, setOcrFile] = useState(null);

  // Sync navigation state to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('nav_view', currentView);
  }, [currentView]);

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
    // When we clear the OCR state, we also reset to home view
    setCurrentView('home');
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-wrapper">
      {currentView === 'home' && (
        <Home 
          onOpenScan={() => setCurrentView('scan')} 
          onLogout={handleLogout}
        />
      )}
      
      {currentView === 'scan' && (
        <ScanSelection 
          initialCategory={selectedCategory}
          onBack={() => {
            setSelectedCategory(null);
            setCurrentView('home');
          }}
          onCategorySelect={(cat) => setSelectedCategory(cat)}
          onOcrResult={(data, category, file) => {
            setOcrResult(data);
            setOcrFile(file);
            setSelectedCategory(category);
            setShowConfirmation(true);
          }}
        />
      )}

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
