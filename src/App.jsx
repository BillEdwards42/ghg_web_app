import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import ScanSelection from './components/ScanSelection';
import ConfirmationPopup from './components/ConfirmationPopup';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem('isLoggedIn') === 'true');
  const navigate = useNavigate();
  
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
