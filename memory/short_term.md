# Short-Term Report: Dynamic Manual Entry Implementation

## 1. Technical Implementation Details (Recent Work)

### **Core Architecture: The "Registry Pattern"**
The manual entry system utilizes a **Metadata-Driven Configuration Engine**. 
- The frontend retrieves a 3-tier category structure from the API.
- `useEquipmentForm.js` extracts normalized string keys (using `toLowerCase().trim()`) from the Tier 2 (`emissionTypeKey`) and Tier 3 (`equipmentTypeKey`) selections to look up the exact form schema in `formConf.js`.
- This architecture allows a single React component (`ManualEntryPopup.jsx`) to dynamically render over 50 distinct data entry workflows without hardcoding individual forms.

### **Production API Integration (`api.js`)**
- Switched the base URL to the dev endpoint for isolated testing.
- Fixed dynamic `facilityId` resolution: The system now correctly extracts the `facilityId` from the user's `selected_loc` in `localStorage` instead of using a hardcoded fallback (`2`).
- **Removed `fetchSrcAndCustodian`:** The legacy logic that fired secondary API calls to fetch "Source" and "Custodian" defaults was completely stripped out, as the PWA design omits these fields.

### **Configuration Registry (`formConf.js`)**
- **Form Standardization:** The `topForm` and `bottomForm` arrays were trimmed to strictly include `useDate` (日期), `usage` (耗用量), and `unit` (單位). Unnecessary legacy fields (`source`, `custodian`, `file`) were removed.
- **Localization:** Injected explicit Traditional Chinese labels (`labelName`) into the configuration (e.g., `equipmentId: '設備名稱'`, `emissionSourceId: '係數名稱'`).
- **Auto-Filling Units:** Refactored `handleFieldChange` to use a functional React state update (`setFormData(prev => ...)`) to safely merge the auto-resolved `emissionFactorUnit` into the payload without race conditions.
- **Equipment Date Validation:** Re-implemented `checkEquipmentDate` to rigidly compare the user's `useDate` string against the equipment's `purchaseDate` and `dueDate` to block invalid saves.

### **Dynamic UI Renderer (`ManualEntryPopup.jsx`)**
- **Date Picker & `checkActivityClose` Gatekeeper:** 
  - Removed the hardcoded January 1st initial date, forcing the user to explicitly select a date to trigger the dependency waterfall.
  - The `useDate` change handler now strictly awaits the `checkActivityClose` API. If the period is locked, the form clears the date and alerts the user.
  - Improved the native date picker UX: Uses a `type="text"` trick for the "請選擇日期" placeholder and explicitly calls `showPicker()` on focus/click to immediately open the native calendar UI.
- **Visual "Disabled" States & Dependency Enforcement:** 
  - Equipment and Emission Factor dropdowns now strictly evaluate `field.dependency === 'useDate'`. If no date is selected, the `<select>` is native `disabled`.
  - Added CSS (`.form-group select:disabled`) to apply a transparent grey overlay to locked fields (like the Unit field and dependent dropdowns).
- **Layout Stability:** Stripped out conditional loading text (`載入選項中...`) that was causing the popup to jitter/shift when the background API fetched dropdown options. Also fixed a bug where `type="hidden"` fields were erroneously rendering visible label text.

---

## 2. Current Migration Status & Technical Gaps

### **✅ Completed: Categories 1 & 2**
- **Category 1 (Equipment-Centric):** Stationary Combustion, Mobile Combustion, Industrial Processes, Fugitive Emissions. 
  - **Status:** Done. The schema resolves correctly, equipment dropdowns wait for the date, units auto-populate, and date bound validations work.
- **Category 2 (Factor-Centric):** Imported Electricity & Energy. 
  - **Status:** Done. Emission factors correctly populate the "係數名稱" field.

### **⏳ Pending / Unverified: Category 3 (Transportation & Commuting)**
- **Status:** Code ported, but workflow and UI UX need strict verification.
- **Technical Gaps:**
  - Relies heavily on complex custom configurations (`transportationMidForm`, `bisTripConf`).
  - Contains dynamic unit-toggling logic (`updateWeightAndDistanceUnit`) that swaps `usage1`/`unit1` with `usage2`/`unit2` (e.g., ton-km vs. passenger-km).
  - Uses conditional UI rendering (`hideUsage2`).
  - Involves highly custom endpoints for station fetching (Train, High-Speed Rail, Airports) that must correctly map IDs to Names in the dropdowns.
  - **Employee Commuting:** Utilizes a completely distinct UI component (`TableInput` grid) which bypasses the standard single-record form. This needs deep testing for mobile-responsiveness and data serialization.

### **⏳ Pending / Unverified: Categories 4 & 5 (Purchased Goods, Waste, Processing)**
- **Status:** Code ported, but workflow needs verification.
- **Technical Gaps:**
  - These workflows are often not driven by equipment/factors but rely on `getDefaultUnit` executed via the `initSetup` lifecycle hook to pre-fetch the correct metric based on the category path.
  - Include specific text input fields like `firm` (service provider / manufacturer) which must correctly render and save to the respective specialized POST endpoints.
  - Needs verification that `initSetup` correctly bypasses the `useDate` dependency waterfall so the form loads smoothly.