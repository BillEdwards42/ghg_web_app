# Implementation Plan: Official API Integration & Data Context

This document outlines the strategy for migrating the `pwa_front` from mock data to the official `frontend_api`, focusing on authentication and the hierarchical selection of Legal Entities and Facilities.

## 1. Architectural Strategy

- **Direct API Integration:** The frontend will communicate directly with `https://dev-carbon64.lndata.com/frontend_api`.
- **Base URL:** Centralized in `utils/api.js`.
- **Authentication:** Token-based (X-Auth-Token).

## 2. Step-by-Step Implementation

### Phase 1: API Configuration & Security (`pwa_front`)
1.  **Update `utils/api.js`:**
    - Change `API_BASE_URL` to `https://dev-carbon64.lndata.com/frontend_api`.
    - Implement a Base64 encoding utility for the password.
    - **Axios Interceptor (Request):** Automatically attach the `X-Auth-Token` and `x-esg-system: 1` headers to every request if a token exists in `localStorage`.
    - **Axios Interceptor (Response):** Detect `401 Unauthorized` errors to trigger a global logout and redirect to the Login page.

### Phase 2: Authentication Flow
1.  **Login Component (`Login.jsx`):**
    - Capture username/password.
    - Base64 encode the password.
    - `POST /session` with `{ username, password, systemId: 1 }`.
    - **On Success:** Store only the `token` in `localStorage`. (Do NOT store the password).
    - Immediately call `GET /checkUserToken` to fetch the user profile and `rootLegalEntities`.
    - Store the `rootLegalEntities` list in state/storage for immediate use in the selection flow.

### Phase 3: Selection Context Logic (`Home.jsx`)
1.  **Legal Entity (法人) Selection:**
    - Use the `rootLegalEntities` array returned from `checkUserToken`.
    - When the user selects a Legal Entity:
        - Trigger `GET /facilitys/all/<entityId>?mode=direct&maxResults=999`.
        - Populate the "据點" (Location/Facility) list with the response.
2.  **Facility (據點) Selection:**
    - Allow the user to select from the newly fetched facility list.
3.  **Persistence:**
    - Store the `selectedEntityId` and `selectedFacilityId` in `localStorage` to maintain context across refreshes.

### Phase 4: UI Refinement
1.  **Loading States:** Add spinners to the "據點" pill while the facility list is being fetched.
2.  **Error Handling:** Show toast/alerts if the facility fetch fails or if the token is invalid.

## 3. Data Flow Summary

1.  **Auth:** `UI -> POST /session (pwd hashed) -> API (returns Token)`
2.  **Context Init:** `UI -> GET /checkUserToken (with Token) -> API (returns Legal Entities)`
3.  **Data Fetch:** `User selects Entity -> GET /facilitys/all/:id -> API (returns Facilities)`
4.  **Ready:** Enable "Scan" and "Manual" buttons once both Entity and Facility are selected.

## 4. Security & Best Practices
- [x] **No Local Password Storage:** Only the session token is persisted.
- [x] **Secure Transit:** Use HTTPS and Base64 encoding as required by the backend.
- [x] **Token Rotation Support:** Handled via Axios interceptors catching `401` errors.
- [x] **Hardcoded systemId:** Managed within the frontend's API utility layer.
