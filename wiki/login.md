# Login

The login function handles user authentication and initializes the application's core data by fetching legal entities and establishing session tokens.

The login process is implemented in [[pwa_front/src/components/Login.jsx]]. Upon a successful POST request to the `/session` endpoint with user credentials, the backend returns an `authToken` and a list of `rootLegalEntities`. These are persisted in `localStorage` to maintain the session across page reloads. The `authToken` is also used to set global authorization headers for all subsequent API calls via [[pwa_front/src/utils/api.js]]. 

The system now relies entirely on a **Global Interceptor** in [[pwa_front/src/utils/api.js]] to handle session expiration. Redundant background validation checks (e.g., `/checkUserToken` on mount) have been removed to prevent race conditions during component transitions.

### Implementation Details
- **State Management**: Uses `useState` to manage loading and error states during the login process.
- **Persistence**: 
  - `authToken`: Stored in `localStorage` for persistent sessions.
  - `rootLegalEntities`: Stored in `localStorage` as a JSON string to avoid re-fetching on every home screen mount.
- **Security**: The application listens for a custom `unauthorized` event (triggered by an axios interceptor) to force an automatic [[logout]] if any functional API request returns a `401 Unauthorized`.
- **Redirects**: After a successful login, the `onLogin` callback in [[pwa_front/src/App.jsx]] updates the global state, triggering a re-render that takes the user to the [[Home]] screen.

### Related Files
- [[pwa_front/src/components/Login.jsx]]: UI and logic for the login form.
- [[pwa_front/src/App.jsx]]: Main entry point handling the authenticated state.
- [[pwa_front/src/utils/api.js]]: API client configuration and header management.
