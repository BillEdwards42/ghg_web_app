# Logout

The logout function ensures a clean termination of the user session by notifying the backend and clearing all local session data.

Logout is triggered from the [[pwa_front/src/components/Home.jsx]] header and is handled by a memoized `handleLogout` function in [[pwa_front/src/App.jsx]]. It performs an asynchronous DELETE request to `/session` and then clears all relevant keys from `localStorage` and `sessionStorage`. Finally, it resets the global React state and redirects the user back to the [[Login]] screen.

The logout process can be triggered in two ways:
1.  **User-Initiated**: Clicking the "登出" button.
2.  **Automatic (Session Expiry)**: Triggered by the global [[pwa_front/src/utils/api.js]] interceptor when an API call returns a `401 Unauthorized`.

### Implementation Details
- **Global Interceptor**: The interceptor monitors all responses. If a `401` status is detected on any endpoint **except** the session endpoint itself, it dispatches an `unauthorized` event. This specifically ignores 401 errors from `/session` to prevent recursive logout loops.
- **Cleanup Sequence**:
  1. `localStorage.removeItem('authToken')`
  2. `localStorage.removeItem('rootLegalEntities')`
  3. `localStorage.removeItem('selected_corp')`
  4. `localStorage.removeItem('selected_loc')`
  5. `sessionStorage.clear()`
  6. `setAuthHeaders(null)`
  7. `setAuthToken(null)`
- **Safety**: The logout process is wrapped in a `try...finally` block to ensure that local state is cleared even if the backend request fails (e.g., due to network issues).

### Related Files
- [[pwa_front/src/App.jsx]]: Contains the `handleLogout` logic.
- [[pwa_front/src/components/Home.jsx]]: Provides the logout button in the UI.
