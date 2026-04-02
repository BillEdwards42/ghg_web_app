# Manual Form Data & Configuration System (formjs)

The `formjs` system is a **Metadata-Driven Configuration Engine**. It avoids hard-coding separate form components for each of the 50+ emission categories by using a centralized "Registry" (`formConf.js`) and a generic "Renderer" (`ActivityForm.js`).

## 1. Core Architecture: The "Registry" Pattern

The system uses a canonical string key (e.g., `'stationary combustion'`, `'purchased electricity'`) to resolve a configuration object. This key is derived from the `emissionTypeKey` or `equipmentTypeKey` returned by the 3-tier category tree API.

### Key Components:
- **`formConf.js` (The Registry):** Maps category keys to field definitions, API handlers, and data formatters.
- **`ActivityForm.js` (The Generic Renderer):** Loops through the field arrays (`topForm`, `middleForm`, `bottomForm`) and renders the appropriate component based on the `type` property.
- **`activity.js` (API Wrapper):** Contains 50+ specialized CRUD endpoints for each emission category (e.g., `/stationaryCombustionDatas`, `/importedElectricityDatas`).
- **`EmissionSrc.js` (Canonical Constants):** Defines the exact string keys used for mapping (e.g., `STATIONARY_COMBUSTION = 'stationary combustion'`).

---

## 2. Field Definition Structure

Each field in the configuration is an object with the following properties:
- `_key`: The JSON key used for the payload (e.g., `useDate`, `usage`, `equipmentId`).
- `type`: The UI component to render (`date`, `input`, `inputNumber`, `select`, `selectWithDesc`, `upload`).
- `labelName`: (Optional) Custom label key for translation.
- `required`: Boolean for validation.
- `dependency`: (Optional) Field to "watch" (e.g., a "Date" selection triggers an "Equipment" list refresh).
- `api`: (Optional) For `select` types, the function in `activity.js` used to fetch options.
- `handleSelectorChange`: (Optional) Logic to execute when a selection is made (e.g., updating units or source/custodian info).

---

## 3. The 5 Emission Categories Logic

### Category 1: Stationary/Mobile/Process
- **Focus:** Equipment-centric.
- **Dynamic Logic:** Selecting a `useDate` filters the available `equipmentId` list (to ensure the equipment wasn't "retired" or "not yet purchased").
- **Fields:** `useDate`, `equipmentId`, `usage`, `unit`, `source`, `custodian`, `file`.

### Category 2: Electricity/Energy
- **Focus:** Factor-centric.
- **Fields:** `useDate`, `emissionSourceId` (Selects the factor), `usage`, `unit`, `source`, `custodian`.

### Category 3: Transportation (Upstream/Downstream/Commuting)
- **Focus:** Weight/Distance.
- **Dynamic Logic:** Conditional visibility of `usage2`/`unit2` (e.g., ton-kilometers).
- **Special Case:** `EMPLOYEE_COMMUTING` uses a nested table (`TableInput`) instead of a simple form.

### Category 4 & 5: Purchased Goods / Waste / Sold Products
- **Focus:** Service Provider / Manufacturer.
- **Fields:** `useDate`, `usage`, `unit`, `serviceProvider`/`firm`, `source`, `custodian`.

---

## 4. Why No "Schema API"?
The backend engineer confirmed that the "Schema" is not returned by the API because **the frontend owns the mapping between Category and Business Logic.**
- Different categories POST to different endpoints.
- Different categories require different pre-processing (formatting dates, stringifying nested objects).
- The "Schema" is effectively hard-coded as a "Registry" in the frontend to ensure the correct API functions are called.

---

## 5. Technical Risks for PWA Migration
- **Ant Design Dependency:** `formjs` is built on `antd`. The PWA uses Vanilla CSS. We must reimplement the "Generic Renderer" using the PWA's existing `ManualEntryPopup.jsx` structure.
- **Missing APIs:** Many functions in `activity.js` rely on a legacy `api.js` wrapper. We must port these to the PWA's `apiClient`.
- **Complex UI:** `TableInput` (Category 3) and `selectWithDesc` (Category 1) require more UI work than the current simple input list.
