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
- **Global Injection:** The `apiClient` instance in `src/utils/api.js` uses `apiClient.defaults.headers.common['X-Auth-Token']` to ensure the token is included in **every request** sent through the `apiClient`.
- **Initialization:** In `App.jsx`, a `useEffect` hook ensures the global header is set whenever the `authToken` state changes (including on app startup from `localStorage`).

### Auth Endpoints
1. **Login (`POST /session`):**
   - Requires `username`, `password` (Base64 encoded), and `systemId`.
   - Returns a `token`.
2. **Context Validation (`GET /checkUserToken`):**
   - **MUST** be called immediately after login with the `X-Auth-Token`.
   - Returns user profile and `rootLegalEntities` (法人).
3. **Logout (`DELETE /session`):**
   - Informs the backend to invalidate the session before clearing local state.

## 3. Data Context Endpoints
Once authenticated, the app relies on specific endpoints to build the operational context:
- **Facilities (`GET /facilitys/all/<entity_id>`):** Fetches the list of sites/locations (據點) for a selected Legal Entity.
  - Query Params: `mode=direct`, `maxResults=999`.

## 4. Manual Entry & Category Selection (In-Transition)
Currently, `useCategories.js` and `useEquipmentForm.js` show an inconsistency:
- **Proxy Usage:** They use a bare `axios` instance instead of `apiClient`.
- **Pathing:** They call `/api/manual/categories` and `/api/manual/fields`, which are proxied to `http://localhost:3000` via Vite's `server.proxy` configuration.
- **Legacy Dependencies:** These hooks still rely heavily on local mock data fallbacks and the legacy `nodejs_back` proxy.
- **Future Endpoint:** `auth.md` identifies `GET /getEquipmentTypesForEmissionSourceData/<id>/<year>` as the production-ready replacement for category fetching.

## 5. OCR Processing
- **Endpoint:** `POST /ocr` (via `apiClient`).
- **Processing:** Images are compressed to a max dimension of 1280px before being sent as `multipart/form-data`.
- **Proxy Requirement:** Currently directed through the `nodejs_back` proxy which handles `Basic Auth` for the external **Commeet** service.

## 6. Summary of Inconsistencies/Risks
- **Header Omission:** Hooks using the bare `axios` (like `useCategories`) **DO NOT** automatically include the `X-Auth-Token` or the correct `Base URL`.
- **Direct vs. Proxy:** The project is split between direct calls to `dev-carbon64.lndata.com` and proxied calls to `localhost:3000`. This will cause failures in production if not consolidated.
