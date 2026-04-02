# Future Issues & Technical Debts

## 1. 3-Tier Category Selection Logic (Filtering & Retrieval)
- **Status:** Critical (Fix in next session)
- **Description:** The Manual Category Selection menu currently shows all 5 categories and their underlying sub-categories/equipment identically across all facilities. The legacy system correctly filters this based on the selected site (e.g., if a site has no "Mobile Combustion" equipment, that category should not appear).
- **The Three-Layer Architecture:**
    1.  **Tier 1 (Root Category):** (e.g., `類別一`, `類別二`).
    2.  **Tier 2 (Emission Type):** (e.g., `固定式燃燒`, `移動式燃燒`).
    3.  **Tier 3 (Equipment Type):** (e.g., `燃油鍋爐`, `小客車`).
- **Technical Problem:**
    - **Endpoint:** `GET /getEquipmentTypesForEmissionSourceData/{facilityId}/{year}`.
    - **Current Implementation:** In `pwa_front/src/hooks/useCategories.js`, the `facilityId` is currently hardcoded as `2`.
    - **Correction Needed:** The hook must dynamically retrieve the `facilityId` from the current selection state (stored in `localStorage` as `selected_loc`). This will ensure the API returns only the equipment types relevant to the user's active context.

## 2. Localization: Manual Form Labels (Traditional Chinese)
- **Status:** Medium
- **Description:** The dynamically rendered labels in `ManualEntryPopup.jsx` currently default to the raw JSON keys (e.g., `usage`, `source`, `custodian`).
- **Action:** Update `formConf.js` to provide explicit Chinese `labelName` values for all fields in the `topForm`, `middleForm`, and `bottomForm` of every category. Ensure the UI renders these correctly to maintain alignment with the rest of the PWA's Traditional Chinese interface.

## 3. Environment Context: Dev API Base URL
- **Status:** High
- **Description:** `pwa_front/src/utils/api.js` is currently pointing to the production URL (`https://carbon64.lndata.com/frontend_api`).
- **Action:** Switch the `API_BASE_URL` to the development endpoint (`https://dev-carbon64.lndata.com/frontend_api`) for final testing of the new manual entry flow to avoid polluting production data.
