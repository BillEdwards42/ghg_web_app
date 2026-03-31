# Short Term Active Objectives - Report (March 2026)

## 1. Unified Year Selection & Data Integrity (Completed)
### Overview
The application enforces a "Year-First" data entry policy. All GHG activity data (Manual and OCR) is anchored to a specific reporting period selected at the start of the flow.

### Key Implementation Details
- **Global Context**: Centralized `reportingYear` state in `App.jsx`, persisted in `sessionStorage`.
- **Validation**: 
    - **Manual**: Date inputs in `ManualEntryPopup.jsx` are constrained to the active year using `min`/`max` attributes.
    - **OCR**: `ConfirmationPopup.jsx` performs real-time matching. Error "非${year}之日期" blocks submission if years mismatch.

## 2. Blank Screen Incident & Resolution (Completed)
### The Problem
The application rendered a blank screen locally following refactoring. Initial investigations by previous engineers incorrectly focused on `...` placeholders and missing `useEffect` imports.

### Root Cause Analysis (Actual)
- **Cause 1 (Resource Pathing)**: `index.html` used absolute paths (e.g., `/src/main.jsx`). Since `vite.config.js` has a `base: '/ghg_web_app/'` path, the browser failed to load resources from the domain root.
- **Cause 2 (Missing Export)**: `ManualCategorySelection.jsx` was missing its `export default` statement, causing a fatal syntax error in `App.jsx`.
- **Cause 3 (ReferenceError)**: `useOCR.js` attempted to call `setMatchResult` which was not defined in the hook's state.

### Final Resolution
- Corrected all absolute paths in `index.html` to relative paths.
- Added the missing default export to `ManualCategorySelection.jsx`.
- Initialized `matchResult` state in `useOCR.js`.
- Updated deprecated meta tags for better PWA support.

## 3. Dynamic Manual Category Tree (Completed)
### Overview
Migrated the manual entry category selection from hardcoded mock levels to a production API that fetches the entire 3-tier tree based on the selected year.

### Implementation
- **API Endpoint**: `GET /getEquipmentTypesForEmissionSourceData/2/<year>` (via `apiClient`).
- **Hook Refinement**: `useCategories.js` now fetches the full nested tree once after the year is chosen. **All mock data and fallbacks have been removed.**
- **Local Navigation**: `ManualCategorySelection.jsx` parses the tree locally (Category -> Emission Type -> Equipment Type) to provide instantaneous transitions.
- **Data Integrity**: Uses `emissionTypeKey` and `equipmentTypeId` to ensure consistency with backend data requirements.

## 4. Next Steps
- **Consolidation**: Refactor `useEquipmentForm.js` to remove remaining `nodejs_back` proxy dependencies.
- **OCR Validation**: Ensure the production OCR backend is fully aligned with the frontend's expected `{ data, schema }` format.
