# Past Issues & Resolutions

## 1. GitHub Pages "Blank Screen" Issue
- **Problem**: The app deployed to `https://billedwards42.github.io/ghg_web_app/` rendered a completely blank screen because the repository was improperly serving the raw `.jsx` source from the `main` branch. Furthermore, the PWA was resetting layout structures due to lacking History API state management.
- **Solution**: 
  - Refactored the frontend to use `react-router-dom` with a `<HashRouter>` to natively support PWA history on GitHub's static files.
  - Guided the user to switch the GitHub Pages repo setting to "Source: GitHub Actions". This forced the `deploy.yml` pipeline to correctly build and serve the compiled `/dist` directory.

## 2. OCR Integration & Data Mapping
- **Problem**: The UI did not display result metrics after the "辨識中..." (Recognizing...) OCR loader completed.
- **Solution**: Updated `ConfirmationPopup.jsx` to hook specifically into the unique API schemas dynamically (Electricity: `regular_degree`, Water: `carbon_emission`, Transport: `from_name`, `to_name`, `date`).

## 3. Storage & Privacy Constraints
- **Problem**: Project constraints explicitly forbade permanent browser storage (like `localStorage`) to protect user privacy.
- **Solution**: Replaced layout routing with `sessionStorage` (which strictly clears on tab close) and moved image buffer handling to pure RAM memory variables that deliberately self-destruct after submitting the API payload to `rick_api`.
