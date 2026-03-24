---
name: Frontend Architecture Guide
description: A comprehensive, code-driven walkthrough of the React Single Page Application frontend.
---

# Frontend Architecture Walkthrough

This document serves as a detailed technical guide to the frontend (`pwa_front`) of the Greenhouse Gas (GHG) progressive web application. Built with React and Vite, the frontend operates entirely as a Single Page Application (SPA).

---

## 1. The Entry Point: `index.html` & `main.jsx`

Before React even boots up, the browser loads `index.html`. This file serves two critical purposes:
1. It defines the `<div id="root"></div>` where the entire React DOM will be injected.
2. It natively captures the PWA installation event synchronously, completely circumventing typical React component race conditions.

```html
<!-- index.html snippet -->
<head>
  <!-- Capture PWA install prompt synchronously before React loads -->
  <script>
    window.deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      window.deferredPrompt = e; // Caught instantly!
    });
  </script>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
```

Once `main.jsx` executes, it wraps your application inside the `HashRouter`. 
**Why HashRouter?** Native browser routers try to send paths (like `/scan`) back to the backend. Because GitHub Pages acts only as a static file server, it would throw a 404 error. The `HashRouter` forces URLs into `/#/scan`, ensuring all navigation stays strictly local in the RAM.

```javascript
// src/main.jsx
import { HashRouter } from 'react-router-dom';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
```

---

## 2. The Traffic Cop: `App.jsx`

`App.jsx` acts as the security bouncer and router for the entire project. It strictly controls exactly what the user is allowed to see.

### Gate A: The PWA Installation check
The app intercepts the user to encourage downloading the app for the optimal experience. It uses `localStorage` strictly to ensure the user is not annoyed repeatedly. If they have already installed the app natively, it triggers `appinstalled` allowing instantaneous bypass.

```javascript
// App.jsx Snippet
const [isStandalone] = useState(
  window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone
);
const skippedInstall = localStorage.getItem('pwa_prompt_dismissed') === 'true';

// Gate A: Block them if they are in standard browser mode and haven't opted out.
if (!isStandalone && !skippedInstall) {
  return <InstallPrompt onSkip={() => {
    localStorage.setItem('pwa_prompt_dismissed', 'true');
    setForceSkipInstall(true);
  }} />;
}
```

### Gate B: Authentication
Once past the install screen, the app validates their login state.

```javascript
// Gate B
if (!isLoggedIn) {
  return <Login onLogin={handleLogin} />;
}
```

### The Router
Finally, it routes approved users. Notice how components drill props down deeply for specific callbacks.
```javascript
return (
  <Routes>
    <Route path="/" element={<Home onOpenScan={() => navigate('/scan')} />} />
    <Route path="/scan" element={<ScanSelection />} />
  </Routes>
);
```

---

## 3. The Dashboard Memory: `Home.jsx`

The Home screen provides dropdowns for the user to configure their organizational "法人" (corp) and "據點" (location) context. To provide premium UX, these selections are dynamically wired straight into `localStorage`. 

Notice that instead of basic `useState(null)`, it invokes a function to parse the local memory instantly on mount.

```javascript
// Home.jsx 
function Home() {
  // Pull previous memory instantly
  const [selectedCorp, setSelectedCorp] = useState(() => JSON.parse(localStorage.getItem('selected_corp') || 'null'));
  
  // Reactively save state any time the user interacts with the UI drop down
  useEffect(() => {
    localStorage.setItem('selected_corp', JSON.stringify(selectedCorp));
  }, [selectedCorp]);

  // Main Action buttons are violently blocked until configuration is complete
  const isActionEnabled = selectedCorp && selectedLoc;

  return ( ... );
}
```

---

## 4. The OCR Engine: `useOCR.js` & `ScanSelection.jsx`

This feature acts as the bridge separating the frontend from the Node.js backend. 
When a user uploads a high-resolution 12-Megapixel image from a modern smartphone, uploading it directly over 4G can be devastatingly slow and crash the backend Node Buffer.

To prevent this, `useOCR.js` creates a native, invisible HTML5 `<canvas>` that shrinks the dimensional fidelity locally on the phone's CPU prior to touching the network tab.

```javascript
// useOCR.js
const compressImage = async (file) => {
  return new Promise((resolve) => {
    // Reads image bytes into RAM
    const img = new Image();
    img.src = event.target.result;
    
    img.onload = () => {
      // Paints it to an invisible 1280px canvas
      const canvas = document.createElement('canvas');
      canvas.width = 1280; 
      canvas.getContext('2d').drawImage(img, 0, 0, 1280, height);

      // Exports exactly as an ultra-compressed, tiny JPG Blob network transport!
      canvas.toBlob((blob) => resolve(new File([blob], "compressed.jpg")), 'image/jpeg', 0.8);
    };
  });
};

const processImage = async (rawFile, selectedCategory) => {
  const file = await compressImage(rawFile);
  
  // Package mathematically lightweight file safely to Node.js /api/ocr
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', selectedCategory);

  const response = await apiClient.post('/ocr', formData, ...);
};
```
Once this Promise resolves, `App.jsx` pulls that data into the RAM and displays `<ConfirmationPopup data={ocrData} />` completely offline and safely separated from persistent browser memory limits.
