# Reporting Year Selection

The reporting year selection establishes a global context for data entry, ensuring that all recorded activities are associated with the correct fiscal or calendar year.

The reporting year is managed as a shared state in [[pwa_front/src/App.jsx]] and is passed down to both [[manual-entry]] and [[ocr-scan]] modules. It is persisted in `sessionStorage` to ensure it survives page refreshes during a session but is cleared upon [[logout]]. The selection is typically made within the [[ScanSelection]] or [[ManualCategorySelection]] screens before entering the specific data entry forms.

### Implementation Details
- **State Persistence**: Uses `sessionStorage.getItem('reporting_year')` for initialization and a `useEffect` hook in `App.jsx` to sync changes back to `sessionStorage`.
- **Validation**: Form fields like date pickers use this year to set `min` and `max` attributes (e.g., `${year}-01-01` to `${year}-12-31`), preventing users from entering data for the wrong year.
- **API Integration**: The `reportingYear` is included as a mandatory parameter in most data submission payloads (e.g., `payload.append('year', year)` in `ManualEntryPopup.jsx`).

### Related Files
- [[pwa_front/src/App.jsx]]: Manages the global `reportingYear` state.
- [[pwa_front/src/components/ScanSelection.jsx]]: UI for selecting the year during OCR flow.
- [[pwa_front/src/components/ManualCategorySelection.jsx]]: UI for selecting the year during manual flow.
- [[pwa_front/src/components/ManualEntryPopup.jsx]]: Uses the year for form validation and submission.
