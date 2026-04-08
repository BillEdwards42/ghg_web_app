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

### **⏳ Pending / Unverified: Categories 4 & 5 (Purchased Goods, Waste, Processing)**
- **Metric Initialization:** These rely on `getDefaultUnit` via `initSetup`. Need to verify mapping of `emissionSourceId` from Tier 3 selections.

### **🛑 Technical Debt: OCR Error Handling & Validation**
- **Missing Logic:** Currently, the error handling logic for OCR (Electricity, Water, and HSR/Railway) has not been implemented.
- **Requirements:** The system needs to gracefully handle and display localized error messages for backend failures, such as `422 (Type Mismatch)`, `400 (Missing File)`, and general network errors, within the `ScanSelection` or `ConfirmationPopup` UI.
- **Validation Gap:** The case where `checkActivityClose` returns `false` (indicating a closed period) has not yet been designed or handled for the OCR confirmation flow. Currently, it only blocks manual entry.

### **⚠️ Current Blocker: OCR vs. Manual Implementation Divergence**
There is a significant architectural mismatch between the **OCR Confirmation Flow** and the **Manual Entry Registry Flow**.

#### **The Issue:**
- **Static vs. Dynamic:** `ConfirmationPopup.jsx` currently uses hardcoded UI blocks for HSR and Railway. This creates a "second implementation" of these forms that does not benefit from the dynamic configurations in `formConf.js`.
- **Field Mismatch:** The hardcoded OCR popup cannot accommodate all the fields available in the manual entry registry (e.g., specific remark fields or custom metadata).
- **Redundant Logic:** `ConfirmationPopup` has its own station lists and fetching logic, which duplicates the work done in `ManualEntryPopup`.

#### **Attempted Fixes & Limitations:**
- **Automated Fetching:** I recently attempted to automate the "種類選擇" (Type) fetching in `ConfirmationPopup` using hardcoded IDs (40/41). While this fixed the immediate `ReferenceError` and pre-populated the factors, it still relies on a static UI structure that doesn't match the "Registry Pattern" used elsewhere.
- **Pre-selection Logic:** Implementing pre-selection for stations in the current static popup is fragile because it doesn't utilize the same `formatRes` and normalization logic as the main registry.

#### **Planned Unification Strategy:**
1.  **Abolish Static Popups:** Remove the hardcoded HSR/Railway UI sections from `ConfirmationPopup.jsx`.
2.  **Unify with Manual Entry:** Refactor the OCR flow to trigger the `ManualEntryPopup` component directly after a scan.
3.  **Data Injection:** Pass the OCR result data as "Initial State" to the `ManualEntryPopup`.
4.  **Registry Integration:**
    *   The system must map the OCR `type` (e.g., `tw_thsrc`) to the correct 3-tier `pathData` required by the registry.
    *   The `ManualEntryPopup` must be updated to accept an `initialData` prop.
    *   When `initialData` is present, the popup should trigger its standard API option fetching (for stations and factors) and then **pre-select** the options that match the OCR strings.
    *   This ensures OCR users get the exact same validation, fields, and behavior as manual users, but with the convenience of pre-filled data.
