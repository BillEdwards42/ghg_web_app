# Long Term Vision

This web application serves as a sleek, user‑friendly front‑end for capturing photos of utility bills (or similar documents) and extracting meaningful carbon‑emission data via an OCR service.

**Core Purpose**
- The user takes a picture, the app forwards the image to a **Node.js backend** (or proxy).
- The backend talks to the external OCR API, receives structured information (e.g., total energy usage, emission factors).
- The frontend displays this information in a clear, polished UI, allowing the user to confirm or adjust the data.
- Once the user confirms the results, the app sends the finalized data back to our own backend for persistent storage and further analytics.

**Design Goals**
- **Modern React Architecture** – Built using React 19 and Vite for a highly responsive, component-based structure that follows declarative UI principles (similar to Flutter/Dart).
- **Consistent styling** – High-end mobile-first design using custom CSS variables and smooth transitions to simulate a native app feel.
- **Seamless user experience** – Minimal loading states, PWA support for "installation" on home screens, and robust state persistence using LocalStorage.
- **Scalable architecture** – Modular component design allows for easy addition of new utility types (Water, Gas, etc.) and complex data visualization as the app grows.

*This document focuses on the product’s purpose and user journey, utilizing React to ensure long-term maintainability.*
