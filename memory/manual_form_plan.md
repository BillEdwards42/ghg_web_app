# Comprehensive Implementation Plan: Dynamic Manual Entry Form

## Goal
Fully migrate the manual entry system to a production-ready, configuration-driven architecture. This system will dynamically resolve form schemas based on the 3-tier category tree and handle complex dependencies (like Date-filtered equipment lists) without relying on the POC backend.

---

## Phase 1: Foundation (Constants & API Discovery)
1.  **Port Canonical Keys:** Create `src/utils/EmissionSrc.js`. 
    - Copy all constants from `formjs/EmissionSrc.js` (e.g., `STATIONARY_COMBUSTION`, `TRANSPORTATION_TYPE`).
    - **Critical:** These keys (e.g., "Stationary Combustion") must exactly match the `emissionTypeKey` and `equipmentTypeKey` returned in the production API JSON.
2.  **Expand Production API Client:** Update `src/utils/api.js`.
    - Port the 50+ specialized CRUD and option-fetching endpoints from `formjs/activity.js`.
    - Adapt them to use the PWA's `apiClient` and `SYSTEM_ID`.
    - **Ongoing Research:** Recognize that many API endpoints for different categories are still being explored and verified. The system must be modular enough to accommodate new endpoints as they are identified.
3.  **Discovery of Option Fetching Parameters:**
    - Many "Select" fields require real-time option fetching that depends on multiple parameters.
    - **Example 1:** `/getStationaryCombustionEquipments/{facilityId}/{equipmentTypeId}/{year}?useDate=YYYY-MM-DD`
    - **Example 2:** `/getImportedElectricityFactors/{facilityId}/{energyTypeId}/{year}?useDate=YYYY-MM-DD`
    - The API client must support passing these dynamic parameters (facilityId, equipmentTypeId, year, and useDate) to the dropdown `api(...)` calls.

---

## Phase 2: Configuration Registry (The Port)
1.  **Create `src/utils/formConf.js`:**
    - Port the `formConf` object from `formjs/formConf.js`.
    - **Simplification:** Remove all `antd`-specific properties (`rules`, `tooltip`, `precision`).
    - **Functional Logic:** Retain `saveFormatting`, `loadFormatting`, `handleSelectorChange`, `apis`, and `fetchKey`.
    - **Category Groups:** Organize by `category1` through `category5` to match the 5 major emission scopes.

---

## Phase 3: Logic Engine (useEquipmentForm.js)
Refactor the hook to act as the "Resolver" for the form.
1.  **Input Resolution:** The hook will now accept the full `pathData` (the 3 selected nodes from `ManualCategorySelection`).
2.  **Resolution Logic (Parity with ActivityForm.js):**
    - Extract `emissionTypeKey` from `pathData[1]`.
    - Extract `equipmentTypeKey` from `pathData[2]`.
    - **Logic:** 
      1. Look up `equipmentConf = formConf[equipmentTypeKey.toLowerCase().trim()]`.
      2. Look up `categoryConf = formConf[emissionTypeKey.toLowerCase().trim()]`.
      3. If `equipmentConf.useConfFirst` is true, prioritize it; otherwise, merge with `categoryConf`.
      4. Fall back to `formConf.default` for missing properties.
3.  **Output:** Return a `resolvedSchema` containing the unified `topForm`, `middleForm`, and `bottomForm` arrays, plus the specialized `apis`.

---

## Phase 4: Dynamic UI Renderer (ManualEntryPopup.jsx)
Rebuild the popup to handle the metadata-driven schema.
1.  **Unified Form State:** Use a single `formData` state object. Initialize with `initFormVal` if provided in the config.
2.  **Dynamic Component Map:**
    - `date`: Custom date picker that enforces `activeYear` constraints.
    - `select`: Searchable dropdown that triggers `api(...)` call on mount or dependency change.
    - **Real-time Param Injection:** Dropdown components must be passed the current `facilityId`, `equipmentTypeId`, `year`, and `useDate` from the form state to perform correct option fetching.
    - `inputNumber`: Numeric input with suffix support (for Units).
    - `upload`: File attachment handler.
3.  **Dependency Tracking:**
    - Implement a "Watcher" system (similar to `Form.useWatch`).
    - If a field has a `dependency` (e.g., `equipmentId` depends on `useDate`), re-fetch the options via the field's `api` whenever the dependency value changes.
4.  **Special Logic: Weight/Distance (Category 3):**
    - Implement the `hideUsage2` logic. If the selected unit doesn't require a second value (like `tkm`), hide the `usage2` and `unit2` fields dynamically.

---

## Phase 5: Specialized Components
1.  **Employee Commuting (`TableInput`):**
    - This is a high-complexity edge case. Reimplement the "Table inside Form" logic for Category 3 - Employee Commuting.
    - It must fetch a specialized config via `fetchEmployeeCommutingConf` and render a list of inputs for different transport modes.

---

## Phase 6: Submission & Lifecycle
1.  **Validation:** Implement basic required-field checking based on the `required: true` metadata.
2.  **Formatting & Submission:**
    - In `handleSubmit`, call the resolved `saveFormatting(formData)`.
    - Inject `facilityId`, `emissionTypeId`, and `year`.
    - Use the resolved `apis.add` function to POST to the correct production endpoint (e.g., `/stationaryCombustionDatas`).
3.  **Cleanup:** Once verified, delete the legacy `pwa_front/formjs` directory and remove the `nodejs_back` proxy routes for manual entry.

---

## Data Flow Verification (TDD)
- **Test Case:** Select "類別一" -> "固定式燃燒" -> "燃油鍋爐".
- **Verification:** 
    - Does `useEquipmentForm` resolve the correct schema?
    - Does the "Equipment" dropdown correctly fetch filtered boilers from the production API using the URL structure: `.../getStationaryCombustionEquipments/{facilityId}/{equipmentTypeId}/{year}?useDate=...`?
    - Does clicking "Save" hit the `/stationaryCombustionDatas` endpoint with the correctly formatted payload?
