# API Conditions Summary - pwa_front

## 1. Global API Configuration
The application uses a centralized Axios instance located in `src/utils/api.js`.

- **Base URL:** `https://dev-carbon64.lndata.com/frontend_api`
- **Default Headers:**
  - `Content-Type: application/json`
  - `x-esg-system: 1` (Hardcoded `SYSTEM_ID`)

## 2. Authentication & Authorization
### Token Management
- **Token Header:** `X-Auth-Token`
- **Persistence:** The token is stored in `localStorage` as `authToken`.
- **Global Injection:** The `apiClient` instance in `src/utils/api.js` handles token persistence and injection.
- **Initialization:** In `App.jsx`, `useEffect` hooks ensure the global header is synchronized with the `authToken` state.

### Auth Endpoints
1. **Login (`POST /session`):**
   - Requires `username`, `password` (Base64 encoded), and `systemId`.
   - Returns a session `token`.
2. **Context Validation (`GET /checkUserToken`):**
   - **ONLY** called immediately after login.
   - Validates the token and returns the `rootLegalEntities` (法人) list.
3. **Logout (`DELETE /session`):**
   - Invalidates the session on the backend before clearing local state.

## 3. Data Context Endpoints
- **Facilities (`GET /facilitys/all/<entity_id>`):** Fetches sites/locations (據點) for a selected Legal Entity.
  - Query Params: `mode=direct`, `maxResults=999`.

## 4. Manual Entry & Category Selection (Migrated)
The manual selection flow has been fully migrated to the production API:
- **Endpoint:** `GET /getEquipmentTypesForEmissionSourceData/2/<year>`
- **Response Structure:** Returns a 3-tier nested JSON tree:
  - **Tier 1 (Category):** Top-level array objects (`category`).
  - **Tier 2 (Emission Type):** Nested array (`emissionType` -> `emissionTypeName`).
  - **Tier 3 (Equipment):** Leaf nodes (`equipmentType` -> `equipmentTypeName`, `equipmentTypeId`).
- **Implementation:** `useCategories.js` fetches the entire tree once the year is selected. Navigation is handled locally through the nested object structure to ensure performance and data integrity. **Mock data has been entirely removed from this flow.**

## 5. OCR Processing
- **Endpoint:** `POST /ocr` (via `apiClient`).
- **Processing:** Images are compressed (max 1280px) and sent as `multipart/form-data`.
- **Match Result:** Returns `{ data, schema }` after backend validation.

## 6. Remaining Risks
- **Proxy Consistency:** Some hooks (like `useEquipmentForm.js`) may still rely on legacy `nodejs_back` proxy paths (`/api/manual/fields`). These should be consolidated into the `apiClient` Base URL flow.
