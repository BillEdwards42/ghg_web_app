# PWA Installation

The PWA installation function provides a seamless onboarding experience, encouraging users to install the web application to their home screen for an app-like experience.

This function is managed by [[pwa_front/src/components/InstallPrompt.jsx]] and [[pwa_front/src/components/IosCoachMark.jsx]]. It detects the user's platform and browser environment to provide the most appropriate installation instructions or triggers.

### Technical Implementation
- **Detection State**: `App.jsx` uses `window.matchMedia('(display-mode: standalone)').matches` to determine if the app is already running as a PWA. If not, it displays the `InstallPrompt`.
- **Android/Chrome Support**: Listens for the `beforeinstallprompt` event. If captured, the "Download" button triggers the native browser installation dialog via `deferredPrompt.prompt()`.
- **iOS/Safari Support**: Since iOS does not support the `beforeinstallprompt` event, the app displays a custom [[IosCoachMark]]. This overlay provides visual instructions (using arrows and icons) on how to use the Safari "Share" menu to "Add to Home Screen".
- **Bypass Logic**: Users can skip the installation prompt, which sets a `pwa_prompt_dismissed` flag in `sessionStorage` to prevent the prompt from reappearing during the current session.

### Related Files
- [[pwa_front/src/components/InstallPrompt.jsx]]: Main UI for the installation offer.
- [[pwa_front/src/components/IosCoachMark.jsx]]: Instructional overlay for iOS users.
- [[pwa_front/src/App.jsx]]: Initial check for standalone mode.
- [[pwa_front/main.jsx]]: Global listener for the `beforeinstallprompt` event.
