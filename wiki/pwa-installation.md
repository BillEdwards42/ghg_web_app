# PWA Installation

The PWA installation function provides a seamless onboarding experience, encouraging users to install the web application to their home screen for an app-like experience.

This function is managed by [[pwa_front/src/components/InstallPrompt.jsx]] and [[pwa_front/src/components/IosCoachMark.jsx]]. It detects the user's platform and browser environment to provide the most appropriate installation instructions or triggers.

### Technical Implementation
- **Detection State**: `App.jsx` uses `window.matchMedia('(display-mode: standalone)').matches` to determine if the app is already running as a PWA. If not, it displays the `InstallPrompt`.
- **Android/Chrome Support**: Listens for the `beforeinstallprompt` event. If captured, the "Download" button triggers the native browser installation dialog via `deferredPrompt.prompt()`.
- **iOS/Safari Support**: Since iOS does not support the `beforeinstallprompt` event, the app displays a custom [[IosCoachMark]]. This overlay provides visual instructions (using arrows and icons) on how to use the Safari "Share" menu to "Add to Home Screen".
- **Bypass Logic**: Users can skip the installation prompt, which sets a `pwa_prompt_dismissed` flag in `sessionStorage` to prevent the prompt from reappearing during the current session.

### Update Mechanism
The application uses a **Service Worker** with a `promptForUpdate` strategy to manage updates.
- **Detection**: When a new version is deployed (detected via `sw.js` hash changes), the [[pwa_front/src/components/ReloadPrompt.jsx]] component triggers a high-visibility modal.
- **Version Display**: The modal displays the `__APP_VERSION__` (defined in `vite.config.js`) and attempts to fetch the latest version from the server for user comparison.
- **Cache Management**: `cleanupOutdatedCaches: true` is enabled in `vite.config.js` to ensure old asset revisions are purged from the user's device upon activation, preventing storage growth.
- **Workbox Window**: The registration hooks (`virtual:pwa-register/react`) natively rely on the `workbox-window` module to securely interact with the service worker lifecycle from within the React component context.

### Development Versioning Policy
To ensure the [[pwa_front/src/components/ReloadPrompt.jsx]] correctly detects and notifies users of new changes during development, the following versioning rules apply:
1.  **Manual Increment**: Every functional change or bug fix must be accompanied by a version bump in `pwa_front/package.json`.
2.  **Development Format**: Use the `-dev.X` suffix (e.g., `1.0.0-dev.1`, `1.0.0-dev.2`). 
3.  **Triggering Updates**: The Service Worker detects the change in the hashed assets, but the UI specifically uses this version string to show the user what they are upgrading to.

### Related Files
- [[pwa_front/src/components/InstallPrompt.jsx]]: Main UI for the installation offer.
- [[pwa_front/src/components/IosCoachMark.jsx]]: Instructional overlay for iOS users.
- [[pwa_front/src/components/ReloadPrompt.jsx]]: Modal for handling software updates.
- [[pwa_front/vite.config.js]]: Service Worker and build-time version configuration.
- [[pwa_front/src/App.jsx]]: Initial check for standalone mode.
- [[pwa_front/main.jsx]]: Global listener for the `beforeinstallprompt` event.
