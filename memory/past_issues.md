# Past Issues & Resolutions

## 1. GitHub Pages "Blank Screen" Issue
- **Problem**: The app deployed to `https://billedwards42.github.io/ghg_web_app/` rendered a completely blank screen because the repository was improperly serving the raw `.jsx` source from the `main` branch. Furthermore, the PWA was resetting layout structures due to lacking History API state management.
- **Solution**: 
  - Refactored the frontend to use `react-router-dom` with a `<HashRouter>` to natively support PWA history on GitHub's static files.
  - Guided the user to switch the GitHub Pages repo setting to "Source: GitHub Actions". This forced the `deploy.yml` pipeline to correctly build and serve the compiled `/dist` directory.

## 2. OCR Integration & Data Mapping
- **Problem**: The UI did not display result metrics after the "辨識中..." (Recognizing...) OCR loader completed.
- **Solution**: Updated `ConfirmationPopup.jsx` to hook specifically into the unique API schemas dynamically (Electricity: `regular_degree`, Water: `carbon_emission`, Transport: `from_name`, `to_name`, `date`).

## 3. Install Prompt Race Condition (React State Desync)
- **Problem**: The PWA "下載" (Download) button defaulted to the fallback alert message (`請直接在瀏覽器選單...`) on Android natively because the `beforeinstallprompt` event fired precisely between React's initial state hydration and the `useEffect` hook mounting. The local `deferredPrompt` state was captured as `null`, bypassing the native installation flow.
- **Solution**: Updated `handleInstallClick` to actively circumvent React state and directly access `window.deferredPrompt` at the precise moment the button is clicked, ensuring the native PWA pipeline executes flawlessly without race conditions.

## 4. API Requests Failing on GitHub Pages (Static Hosting)
- **Problem**: The login endpoint automatically failed and returned "登入失敗，請稍後再試" when the frontend was deployed to GitHub Pages, despite working locally.
- **Solution**: Diagnosed that GitHub Pages is strictly a static file host (HTML/CSS/JS) and cannot run the Node.js Express backend. The Axios relative URL (`/api/rick_auth`) encountered a fatal `404 Not Found` against the GitHub server. The backend must be explicitly hosted on a PaaS provider (like Render, Heroku, or AWS) and the `API_BASE_URL` switched to that absolute cloud URL for production deployment.
