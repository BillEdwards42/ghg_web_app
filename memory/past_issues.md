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
- Diagnosed that GitHub Pages is strictly a static file host (HTML/CSS/JS) and cannot run the Node.js Express backend. The Axios relative URL (`/api/rick_auth`) encountered a fatal `404 Not Found` against the GitHub server. The backend must be explicitly hosted on a PaaS provider (like Render, Heroku, or AWS) and the `API_BASE_URL` switched to that absolute cloud URL for production deployment.

## 5. Persistent "Blank Screen" & Syntax Errors (Unified Year Flow)
- **Problem**: Following the implementation of the "Unified Year" flow, the application rendered a completely blank screen locally. The browser console showed 404 errors for main modules and a fatal `SyntaxError` regarding missing exports.
- **Root Cause Analysis (Corrected)**:
  - **Incorrect Investigation**: A previous engineer incorrectly identified `...` placeholders in `ConfirmationPopup.jsx` and missing `useEffect` imports as the primary causes. While these were minor issues, fixing them did not restore the app.
  - **Actual Cause 1 (Resource Path Mismatch)**: In `index.html`, the entry point and assets were using absolute paths (e.g., `/src/main.jsx`). Because `vite.config.js` used `base: '/ghg_web_app/'`, the browser looked at the domain root instead of the subfolder, causing a total loading failure.
  - **Actual Cause 2 (Missing Default Export)**: `ManualCategorySelection.jsx` was missing the `export default` statement at the end of the file, causing `App.jsx` to fail during the import phase with `Uncaught SyntaxError: The requested module ... does not provide an export named 'default'`.
  - **Actual Cause 3 (ReferenceError)**: `useOCR.js` contained a reference to `setMatchResult` which was not defined in the hook's state, causing a crash in POC/bypass modes.
- **Solution**:
  - Updated `index.html` to use relative paths for all resources.
  - Added `export default ManualCategorySelection;` to the component file.
  - Properly initialized `matchResult` state in the `useOCR` hook.
  - Updated `index.html` with the modern `<meta name="mobile-web-app-capable" content="yes">` tag to resolve deprecation warnings.
- **Outcome**: The application now loads successfully locally and in subfolder environments with the Unified Year logic fully functional.

## 6. Login Redirect Loop on Mobile
- **Problem**: After logging in on a mobile device, the Home page would show briefly and then redirect back to Login.
- **Root Cause**: A race condition in `App.jsx`. The startup `useEffect` called `/checkUserToken` immediately after `handleLogin` updated the `authToken` state, sometimes before headers were synchronized or due to sensitive session handling on the backend.
- **Solution**: Implemented a `window._appInitialized` flag to ensure `/checkUserToken` only runs on the very first app mount (cold start) and is skipped during the transition from the Login component to the Home component.

## 7. Transportation Dropdown Failure (Registry Blocker)
- **Problem**: "出發站" and "抵達站" fields for specialized Category 3 methods (HSR, Train, MRT, Air) remained as text inputs instead of dropdowns.
- **Root Cause**: 
    1.  **Merge Priority**: The `useEquipmentForm.js` logic prioritized the Tier 2 fallback (`BUSINESS_TRIP`) because `useConfFirst: true` was missing from the specialized Tier 3 helpers.
    2.  **Key Normalization**: Mismatch between API keys (e.g., `HIGH_SPEED_RAIL`) and registry keys (e.g., `high speed rail`) due to underscores.
- **Solution**: 
    1.  Added `useConfFirst: true` to `bisTripConf` and `upstreamNdownstreamConf` in `formConf.js`.
    2.  Updated normalization in `useEquipmentForm.js` to replace underscores with spaces.

