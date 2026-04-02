import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import ScanSelection from './components/ScanSelection';
import ConfirmationPopup from './components/ConfirmationPopup';
import InstallPrompt from './components/InstallPrompt';
import ManualCategorySelection from './components/ManualCategorySelection';
import ManualEntryPopup from './components/ManualEntryPopup';
import { setAuthHeaders, apiClient } from './utils/api';

function App() {
  // Initial value?
  const [authToken, setAuthToken] = useState(() => {
    const savedToken = localStorage.getItem('authToken');
    if (savedToken) {
      setAuthHeaders(savedToken); // Is this needed? Need to test.
    }
    return savedToken;
  });

  // Global context for reporting year, shared between Manual and OCR
  const [reportingYear, setReportingYear] = useState(() => sessionStorage.getItem('reporting_year') || null);

  useEffect(() => {
    if (reportingYear) {
      sessionStorage.setItem('reporting_year', reportingYear);
    } else {
      sessionStorage.removeItem('reporting_year');
    }
  }, [reportingYear]);

  const isLoggedIn = !!authToken;
  const navigate = useNavigate();

  // Initialize Auth Headers when token changes (though handled in Login/Startup, this is safer)
  useEffect(() => {
    setAuthHeaders(authToken);
  }, [authToken]);

  //Immediately interigates the browser: "Is this running full screen from home screen?"
  const [forceSkipInstall, setForceSkipInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
  );//Left is for android right is for ios.

  //useEffect is a React tool that says "Run this code in bg one time when the app boots up". Use it to constantly listen for native appinstalled event.
  //This one checks on whether the user switched to app from web and if so, set setIsStandalone to true.
  useEffect(() => {
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    //Think of media query as a question, "Is the app running in standalone mode?". The answer is true or false. When the answer changes, e.matches, which is the value of the new answer, will be passed in setIsStandalone.
    const handleChange = (e) => setIsStandalone(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  //This one listens for the native appinstalled event and if so, set forceSkipInstall to true.
  useEffect(() => {
    //A function defined to set skip install prompt parametors to true
    const handleAppInstalled = () => {
      sessionStorage.setItem('pwa_prompt_dismissed', 'true');
      setForceSkipInstall(true);
      console.log('PWA was installed natively');
    };
    //Makes the window listen for an app install event, and if that happens, run the above defined function then.
    window.addEventListener('appinstalled', handleAppInstalled);
    //Dismounts when app closed
    return () => window.removeEventListener('appinstalled', handleAppInstalled);
  }, []);

  //For remembering where the user is when navigating between categories. 
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return sessionStorage.getItem('nav_category') || null;
  });

  // When OCR is done, this is set to true, so the confirmation popup appears.
  const [showConfirmation, setShowConfirmation] = useState(false);
  // Holds the data that the backend spits back after OCR.
  const [ocrData, setOcrResult] = useState(null);
  // Stores the actual photo taken by the user.
  const [ocrFile, setOcrFile] = useState(null);

  // Similar to showConfirmation, but for manual entry.
  const [showManualEntry, setShowManualEntry] = useState(false);
  // Stores the full path data [Tier1, Tier2, Tier3] from manual selection
  const [manualPath, setManualPath] = useState(null);
  const [manualYear, setManualYear] = useState(null);

  // Saves the current choosen category to session storage, so that it survives a page refresh. This is for OCR cats only.
  useEffect(() => {
    if (selectedCategory) {
      sessionStorage.setItem('nav_category', selectedCategory);
    } else {
      sessionStorage.removeItem('nav_category');
    }
  }, [selectedCategory]);

  // This is called by login.jsx after successful verifies user credentials with POST /session.
  const handleLogin = (token, rootEntities) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('rootLegalEntities', JSON.stringify(rootEntities));
    setAuthToken(token);
  };

  //
  const handleLogout = async () => {
    try {
      // Optional: Inform backend about logout
      await apiClient.delete('/session');
    } catch (err) {
      console.warn('Backend logout failed', err);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('rootLegalEntities');
      localStorage.removeItem('selected_corp');
      localStorage.removeItem('selected_loc');
      sessionStorage.clear();
      setAuthHeaders(null);
      setAuthToken(null);
      setReportingYear(null);
    }
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
    setManualPath(null);
    setSelectedCategory(null);
    navigate('/');
  };

  // Used both because that session storage survives a refresh, and a state is used so that react knows when to re-render.
  const skippedInstall = sessionStorage.getItem('pwa_prompt_dismissed') === 'true' || forceSkipInstall;

  if (!isStandalone && !skippedInstall) {
    return <InstallPrompt onSkip={() => {
      sessionStorage.setItem('pwa_prompt_dismissed', 'true');
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
            activeYear={reportingYear}
            setYear={setReportingYear}
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
            activeYear={reportingYear}
            setYear={setReportingYear}
            onBack={() => navigate('/')}
            onComplete={(pathData, year) => {
              setManualPath(pathData);
              setManualYear(year);
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
          activeYear={reportingYear}
          onClose={clearOcrState}
          onSave={() => {
            clearOcrState();
          }}
        />
      )}

      {showManualEntry && (
        <ManualEntryPopup
          pathData={manualPath}
          year={manualYear}
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
