# Short-Term Report: Dynamic Manual Entry Implementation

## 1. Technical Implementation Details (Recent Work)

### **Core Architecture: The "Registry Pattern"**
The manual entry system utilizes a **Metadata-Driven Configuration Engine**. 
- The frontend retrieves a 3-tier category structure from the API.
- `useEquipmentForm.js` extracts normalized string keys (using `toLowerCase().trim()`) from the Tier 2 (`emissionTypeKey`) and Tier 3 (`equipmentTypeKey`) selections to look up the exact form schema in `formConf.js`.
- This architecture allows a single React component (`ManualEntryPopup.jsx`) to dynamically render over 50 distinct data entry workflows without hardcoding individual forms.

### **Employee Commuting (Grid UI Implementation)**
- **Selection Bypass:** Modified `ManualCategorySelection.jsx` to recognize "員工通勤" at Tier 2 and trigger `onComplete` immediately, bypassing the unnecessary Tier 3 equipment screen.
- **Dynamic Grid Rendering:** Implemented a specialized `tableInput` renderer in `ManualEntryPopup.jsx` that fetches commuting modes (高鐵, 捷運, etc.) via `fetchEmployeeCommutingConf` upon mounting.
- **Data Model:** Rows default to `0` for "員工人次" (Number of People) and "平均通勤距離" (Distance). 
- **Payload Serialization:** The `saveFormatting` for this category stringifies a cleaned array `employeeCommutingDataDetails` containing only `{ commutingModeId, emissionSourceId, numberOfPeople, distance, remark }`.

### **Business Trip (Dependent API Orchestration)**
- **Station Fetching:** Independent station APIs (`fetchTrainStations`, `fetchHsrStations`, `fetchAirports`) are called immediately upon category selection to populate "出發站" and "抵達站" dropdowns.
- **Date-Dependent Factors:** The "種類選擇" (Type) dropdown remains disabled until a `useDate` is selected, which then triggers `fetchBisTripType`.
- **Unit Splitting Logic:** Implemented `updateWeightAndDistanceUnit` to parse composite units (e.g., "Pkm") into `unit1` (Passenger) and `unit2` (Km), dynamically toggling the visibility of the "活動數據 2" field.

### **Global UI & Validation Refinement**
- **Success Confirmation Overlay:** Replaced native browser `alert()` with a custom PWA-styled success overlay featuring a green checkmark and a "完成" button to improve user flow.
- **Implicit Required Fields:** Removed red asterisks (`*`) and refactored `validateForm` to treat all visible, interactive, and enabled fields as mandatory by default.
- **Payload Compatibility:** Re-integrated hidden legacy fields (`source`, `custodian`, `file`) into the `FormData` payload to ensure compatibility with backend schema expectations.

---

## 2. Current Migration Status & Technical Gaps

### **✅ Completed: Categories 1, 2 & Primary Category 3**
- **Category 1 (Equipment-Centric):** Stationary/Mobile Combustion, Processes, Fugitive. (Status: Verified)
- **Category 2 (Factor-Centric):** Electricity & Energy. (Status: Verified)
- **Category 3 (Employee Commuting & Train/HSR):** Grid UI and Station logic implemented and verified for payload accuracy.

### **⏳ Pending / Unverified: Category 3 (Other Transportation)**
- **Bus/Taxi/Car/Motorcycle:** Currently use `bisTripConf` with `input` for stations. Need to verify if these require specific "Stations" or if they remain free-text.
- **Upstream/Downstream Transportation (Ship, Land, Air):** Use `transportationMidForm`. Need to verify unit splitting and departure/arrival station logic.
- **Category 3 Sub-Categories:** "客戶與訪客交通之排放" and other sub-categories need verification that they map correctly to the existing `bisTripConf` or `transportationMidForm`.

### **⏳ Pending / Unverified: Categories 4 & 5 (Purchased Goods, Waste, Processing)**
- **Metric Initialization:** These rely on `getDefaultUnit` via `initSetup`. Need to verify that `emissionSourceId` is correctly mapped from the Tier 3 selection and that the `FormData` doesn't contain a redundant `equipmentTypeId` which might crash the backend.
- **Field Localization:** Verify Traditional Chinese labels for specialized fields like "Firm" (廠商) or "Service Provider" (服務提供商).
