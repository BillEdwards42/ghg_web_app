# Short-Term Report: Dynamic Manual Entry Implementation

## 1. Technical Implementation Details (Recent Work)

### **Core Architecture: The "Registry Pattern"**
The manual entry system utilizes a **Metadata-Driven Configuration Engine**. 
- The frontend retrieves a 3-tier category structure from the API.
- `useEquipmentForm.js` now prioritizes English string keys (e.g., `equipmentTypeKey`) over numeric IDs to look up schemas in `formConf.js`.
- **English Key Bridge:** Updated `ManualCategorySelection.jsx` to preserve English keys from the production API response, ensuring specialized forms (like Business Trip) are correctly identified.

### **Employee Commuting (Grid UI Implementation)**
- **Selection Bypass:** Modified `ManualCategorySelection.jsx` to recognize "員工通勤" at Tier 2 and trigger `onComplete` immediately, bypassing the unnecessary Tier 3 equipment screen.
- **Dynamic Grid Rendering:** Implemented a specialized `tableInput` renderer in `ManualEntryPopup.jsx` that fetches commuting modes (高鐵, 捷運, etc.) via `fetchEmployeeCommutingConf` upon mounting.
- **Data Model:** Rows default to `0` for "員工人次" (Number of People) and "平均通勤距離" (Distance). 
- **Payload Serialization:** The `saveFormatting` for this category stringifies a cleaned array `employeeCommutingDataDetails` containing only `{ commutingModeId, emissionSourceId, numberOfPeople, distance, remark }`.

### **Business Trip (Station & Type Orchestration)**
- **Spelling Harmonization:** Removed extra 'S' from `BUSSINESS_TRIP` constants; now standardized as `BUSINESS_TRIP` across `EmissionSrc.js`, `formConf.js`, and components.
- **Robust Mapping:** Added API aliases (e.g., `'hsr'`, `'railway'`) and Chinese fallbacks to `formConf.js` to ensure the correct schema is resolved even when the API returns localized names or inconsistent keys.
- **Date-Dependent Factors:** The "種類選擇" (Type) dropdown remains disabled until a `useDate` is selected, which then triggers `fetchBisTripType`.
- **Unit Splitting Logic:** Implemented `updateWeightAndDistanceUnit` to parse composite units (e.g., "Pkm") into `unit1` (Passenger) and `unit2` (Km), dynamically toggling the visibility of the "活動數據 2" field.

### **Global UI & Validation Refinement**
- **Success Confirmation Overlay:** Replaced native browser `alert()` with a custom PWA-styled success overlay featuring a green checkmark and a "完成" button to improve user flow.
- **Implicit Required Fields:** Removed red asterisks (`*`) and refactored `validateForm` to treat all visible, interactive, and enabled fields as mandatory by default.
- **Payload Compatibility:** Re-integrated hidden legacy fields (`source`, `custodian`, `file`) into the `FormData` payload to ensure compatibility with backend schema expectations.

---

## 2. Current Migration Status & Technical Gaps

### **✅ Fixed: Transportation Dropdown Failure**
Resolved the issue where "出發站" and "抵達站" rendered as text inputs instead of dropdowns for specialized transportation (HSR, Train, MRT, Air).
- **Merge Logic Correction:** Added `useConfFirst: true` to `bisTripConf` and `upstreamNdownstreamConf` in `formConf.js`. This ensures that specialized Tier 3 configurations are prioritized over generic Tier 2 fallbacks in `useEquipmentForm.js`.
- **Key Normalization:** Updated `useEquipmentForm.js` to replace underscores with spaces during key normalization (e.g., `HIGH_SPEED_RAIL` -> `high speed rail`), ensuring reliable configuration lookups.
- **Immediate Population:** Verified that station APIs are correctly triggered upon popup mount via the "Independent Option Fetcher" in `ManualEntryPopup.jsx`.

---

## 2. Current Migration Status & Technical Gaps

### **⏳ Pending / Unverified: Category 3 (Other Transportation)**
- **Bus/Taxi/Car/Motorcycle:** Currently use `bisTripConf` with `input` for stations. Need to verify if these remain free-text or require specific lists.
- **Upstream/Downstream Transportation (Ship, Land, Air):** Use `transportationMidForm`. Need to verify unit splitting and departure/arrival station logic.

### **✅ Fixed: Categories 4 & 5 Form Resolution & Payload Purification**
- **Shadowing Bug Fix:** Fixed an issue in `useEquipmentForm.js` where a fallback empty object `{}` from `categoryConf` would truthily shadow a valid `equipmentConf` schema. Restored strict `middleForm` truthiness checking matching legacy logic.
- **Alias Integration:** Added exact Chinese strings (e.g. `'營運產生之廢棄物': category4[WASTE_DISPOSAL_SERVICE]`) directly to the `formConf` export registry to guarantee dynamic mapping.
- **Hidden Dependencies:** Restored `source`, `custodian`, and `file` strictly as `type: 'hidden'` within `bottomForm`. This satisfies the core architectural requirement where manual forms generate clean serialized data dropping empty strings naturally, whilst not burdening the visual UI.
- **Payload Purification:** Scrubbed out arbitrary `year` injections and Category 1 specific `fetchKey` overrides (`equipmentTypeId`) that were polluting the `defFormatSave` FormData uploads, as `useDate` provides sole canonical backend truth.

### **🛑 Technical Debt: OCR Error Handling & Validation**
- **Missing Logic:** Currently, the error handling logic for OCR (Electricity, Water, and HSR/Railway) has not been implemented.
- **Requirements:** The system needs to gracefully handle and display localized error messages for backend failures, such as `422 (Type Mismatch)`, `400 (Missing File)`, and general network errors, within the `ScanSelection` or `ConfirmationPopup` UI.
- **Validation Gap:** The case where `checkActivityClose` returns `false` (indicating a closed period) has not yet been designed or handled for the OCR confirmation flow. Currently, it only blocks manual entry.

### **✅ Fixed: OCR vs. Manual Implementation Divergence (HSR/Train)**
Resolved the architectural mismatch between the OCR confirmation flow and the manual entry registry for transportation tickets.
- **Unified Workflow:** Abolished the hardcoded HSR/Railway UI in `ConfirmationPopup.jsx`. The OCR flow now directly triggers `ManualEntryPopup.jsx`.
- **Data Injection:** Implemented an `initialData` prop in `ManualEntryPopup` that accepts OCR results (date, stations, file).
- **Smart Pre-population:** The popup now automatically resolves string-based station names (e.g., "台北") to their respective numeric IDs once the station API returns. It also pre-selects the first available emission factor and sets a default usage of `1`.
- **Registry Consistency:** OCR users now benefit from the exact same validation logic (e.g., date checks, closed period blocks) and metadata fields (hidden legacy fields) as manual entry users.

### **⏳ Pending / Unverified: OCR Unification (Electricity/Water)**
- **Next Step:** Evaluate if Electricity and Water OCR should also be migrated to the `ManualEntryPopup` flow. Currently, they still use the legacy hardcoded sections in `ConfirmationPopup.jsx`.
