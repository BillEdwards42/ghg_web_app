# Logout

The logout function ensures a clean termination of the user session by notifying the backend and clearing all local session data.

Logout is triggered from the [[pwa_front/src/components/Home.jsx]] header and is handled by the `handleLogout` function in [[pwa_front/src/App.jsx]]. It performs an asynchronous DELETE request to `/session` and then clears all relevant keys from `localStorage` and `sessionStorage`. Finally, it resets the global React state to redirect the user back to the [[Login]] screen.

### Implementation Details
- **Cleanup Sequence**:
  1. `localStorage.removeItem('authToken')`
  2. `localStorage.removeItem('rootLegalEntities')`
  3. `localStorage.removeItem('selected_corp')`
  4. `localStorage.removeItem('selected_loc')`
  5. `sessionStorage.clear()`
  6. `setAuthHeaders(null)`
- **Safety**: The logout process is wrapped in a `try...finally` block to ensure that local state is cleared even if the backend request fails (e.g., due to network issues).
- **Global Event**: A manual "unauthorized" event listener is also in place to trigger this logout logic if the API returns a 401 status.

### Related Files
- [[pwa_front/src/App.jsx]]: Contains the `handleLogout` logic.
- [[pwa_front/src/components/Home.jsx]]: Provides the logout button in the UI.
