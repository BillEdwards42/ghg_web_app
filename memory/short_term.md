# Short Term Issues - Deployment & UI

## 1. GitHub Pages "Blank Screen" Issue
**Current Status**: Persistent failure on `https://billedwards42.github.io/ghg_web_app/`. The page loads but renders nothing (blank).

### Troubleshooting History & Attempts:
1. **Attempt 1: Manual Subpath Config**
   - **Action**: Set `base: '/ghg_web_app/'` in `vite.config.js` and used leading slashes (`/assets/...`) in `index.html`.
   - **Failure**: Leading slashes forced the browser to look at the root domain (`billedwards42.github.io/assets`) instead of the project folder.

2. **Attempt 2: GitHub Actions Deployment**
   - **Action**: Switched from local `gh-pages` push to automated GitHub Actions.
   - **Failure**: Initial failure due to `package-lock.json` missing (project uses Bun). Fixed by switching the workflow to use Bun.

3. **Attempt 3: Relative Pathing & .nojekyll**
   - **Action**: Changed `base` to `./` and restored `./` relative paths in `index.html`. Added `.nojekyll` to prevent GitHub from mangling the `assets/` folder.
   - **Failure**: Still blank. Logo broke locally because the dev server handles `./` differently than production builds.

4. **Attempt 4: import.meta.env.BASE_URL**
   - **Action**: Restored `base: '/ghg_web_app/'`. Used `import.meta.env.BASE_URL` in React components to dynamically resolve the logo path.
   - **Result**: **Logo fixed locally**, but the remote deployment remains **blank**.

### Potential Root Causes:
- **MIME Type Errors**: GitHub Pages might be serving the bundled `.js` files with the wrong MIME type if the path is slightly off.
- **Vite Build Entry Point**: The `index.html` in the `main` branch might not be correctly transformed by the build process if the `<script src="...">` path is not exactly what Vite expects.
- **Trailing Slash**: Navigating to `/ghg_web_app` (without the slash) vs `/ghg_web_app/` can cause relative paths to break.

---

## 2. OCR Integration & Data Mapping (In Progress)
- **Problem**: UI does not display results after "辨識中..." completes.
- **Cause**: Response data from the OCR API is not being correctly mapped to the UI state.
- **Solution Applied**: Updated `ConfirmationPopup.jsx` to handle specific schemas for Electricity (regular_degree), Water (carbon_emission), and Transport (from_name, to_name, date).

## 3. Storage & Privacy
- **Requirement**: No permanent browser storage. 
- **Solution**: Replaced `localStorage` with `sessionStorage` for navigation (cleared on tab close) and moved image handling to RAM only (cleared after submission to `rick_api`).

## Next Steps:
- Inspect the browser console on the live GitHub page to identify the specific 404 or JS error.
- Verify if `dist/index.html` contains the correctly bundled script tag.
- Test a "Clean Build" deployment where the `dist` folder is manually verified before pushing.
