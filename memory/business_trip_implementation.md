# Business Trip (商務旅行) & Submission Confirmation Plan

## Objective
Implement the "Business Trip" (商務旅行) data entry workflows (Train, HSR, Airport, etc.) and replace the standard `alert()` on save success with a custom, beautifully designed PWA confirmation overlay.

## Key Constraints & Findings
1.  **Station Data (Independent API):** When a user selects a transportation type (e.g., 火車), an API (e.g., `fetchTrainStations`) is called *immediately* to populate the "出發站" (Departure) and "抵達站" (Destination) dropdowns. These dropdowns use the station `id` as their value and `name` as their label.
2.  **Type/Emission Data (Dependent API):** The "種類選擇" (Type) dropdown is initially disabled. It only populates when the user selects a `useDate`. Upon date selection, `fetchBisTripType` is called.
3.  **Unit Resolution (`WEIGHT_AND_DISTANCE_UNIT`):** The legacy system (and our ported `updateWeightAndDistanceUnit` helper) maps the `emissionFactorUnit` returned by `fetchBisTripType` (e.g., "Pkm") to split units: `unit1` (e.g., "Passenger") and `unit2` (e.g., "Km"). This determines if `usage2` (距離) is shown.
4.  **Payload Formatting:** The POST payload to `/businessTripDatas` requires `emissionSourceId` (from the Type dropdown), `departure` (Station ID), `destination` (Station ID), `usage1`, `usage2`, `useDate`, and implicit fields (`source`, `custodian`, `file`, etc.).
5.  **Success Confirmation:** Instead of a browser `alert()`, a custom modal/overlay should appear showing a success checkmark and a button to close/reset the form.

## Implementation Steps

### 1. `src/utils/formConf.js` Updates (Business Trip Schema)
-   **Review `bisTripConf` helper:**
    -   Ensure the mapping of `departure` and `destination` fields correctly uses the `stationApi` passed to it.
    -   Ensure `handleSelectorChange` for the `emissionSourceId` (Type) field triggers `updateWeightAndDistanceUnit` correctly so `unit1` and `unit2` are populated.
    -   Add custom traditional Chinese labels (e.g., `labelName: '種類選擇'`, `labelName: '出發站'`, `labelName: '抵達站'`, `labelName: '活動數據 1'`, `labelName: '活動數據 2'`).
-   **Verify Categories:** Ensure `TRAIN`, `HIGH_SPEED_RAIL`, `AIRPLANE`, etc., are correctly wired to `bisTripConf`.
-   **`saveFormatting`:** Ensure the default save formatter appends the hidden fields (`source`, `custodian`, `file`) as empty strings, similar to the Employee Commuting fix.

### 2. `src/components/ManualEntryPopup.jsx` Updates (Component Logic & UI)
-   **Field Rendering Adjustments:**
    -   Verify that inputs for `usage1` and `usage2` render correctly with their dynamically populated `unit1` and `unit2` fields (which are disabled).
    -   Ensure the `hideUsage2` state correctly hides the second usage/unit row if the unit isn't split (e.g., if it's just "Km" instead of "Pkm").
-   **Success Confirmation State:**
    -   Add a new state `[showSuccess, setShowSuccess] = useState(false)`.
    -   Update `handleSubmit`: On successful save, call `setShowSuccess(true)` instead of `alert('資料已成功儲存')` and `onSave(formData)`.

### 3. Build the Success Overlay UI
-   Create a nested rendering block inside `ManualEntryPopup` for `showSuccess`.
-   **Design:** A clean, centered card with a large green checkmark icon (SVG), a success message ("資料已成功儲存"), and a primary button ("完成") that triggers `onClose` and `onSave`.

## Verification
-   Select 手動輸入 -> 類別三 -> 商務旅行 -> 火車.
-   Verify "出發站" and "抵達站" are immediately populated.
-   Select a Date. Verify "種類選擇" populates.
-   Select a Type. Verify "活動數據 1" (and 2) units populate (e.g., Passenger and Km).
-   Submit form. Verify the custom success overlay appears.