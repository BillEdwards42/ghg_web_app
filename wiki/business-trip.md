# Business Trip

The Business Trip module is a specialized implementation within the [[manual-entry]] system designed to handle the complexities of business travel reporting. It utilizes a registry-based configuration to dynamically orchestrate station selections, unit conversions, and mode-specific fields.

### Orchestration Architecture
The module is powered by the `bisTripConf` helper in [[pwa_front/src/utils/formConf.js]]. This helper standardizes the form structure into three distinct sections:
1.  **Top Section**: Standard date selection (`useDate`).
2.  **Middle Section**: Dynamic fields based on the transportation mode.
3.  **Bottom Section**: Legacy hidden fields for system compatibility (`source`, `custodian`, `file`).

---

### Transportation Mode Breakdown

Each mode is identified by an `equipmentTypeKey` and maps to a specific configuration. The system differentiates between "Selectable Stations" (dropdowns) and "Free-Text Stations" (input fields).

#### 1. High-Speed Rail (HSR)
*   **Key**: `HIGH_SPEED_RAIL` (or aliases: `hsr`, `高鐵`)
*   **Station API**: `fetchHsrStations` (`GET /hsrStations?maxResults=1000`)
*   **Data Structure**: Returns an array of objects: `[{ "id": 1, "name": "南港", ... }, ...]`
*   **Implementation**: The `ManualEntryPopup` resolves the `api` property in the schema and populates the `departure` and `destination` fields as searchable dropdowns. The `id` is used as the value, and `name` is the label.

#### 2. Train (Railway)
*   **Key**: `TRAIN` (or aliases: `railway`, `train`, `火車`)
*   **Station API**: `fetchTrainStations` (`GET /trainStations?maxResults=1000`)
*   **Data Structure**: Returns an array of objects: `[{ "id": "0900", "name": "基隆", ... }, ...]`
*   **Implementation**: Similar to HSR, it uses the `formatRes` helper to normalize the `id` and `name` keys for the dropdown component.

#### 3. MRT (Mass Rapid Transit)
*   **Key**: `MRT` (or alias: `捷運`)
*   **Station API**: `fetchMrtStations` (`GET /mrtStations?maxResults=1000`)
*   **Data Structure**: Returns an array of objects: `[{ "id": "A1", "name": "捷運台北車站", ... }, ...]`
*   **Implementation**: Populates `departure` and `destination` dropdowns. Note that MRT IDs are often alphanumeric (e.g., "R10").

#### 4. Airplane (Flight)
*   **Key**: `AIRPLANE` (or aliases: `airplane`, `飛機`)
*   **Station API**: `fetchAirports` (`GET /airports?maxResults=10000`)
*   **Data Structure**: Returns objects with a `code` key: `[{ "code": "TPE", ... }, ...]`
*   **Implementation**: 
    *   Uses `{ idKey: 'code', nameKey: 'code' }` in the configuration to map the airport code to both the value and label.
    *   **Specialized Field**: Adds an extra `airline` text input field unique to this mode.

#### 5. Other Transportation (Bus, Taxi, Car, etc.)
*   **Modes**: `BUS`, `LONG_DISTANCE_BUS`, `TAXI`, `CAR`, `MOTORCYCLE`
*   **Station Implementation**: These modes do **not** have a station API defined in `formConf.js`. 
*   **Behavior**: The `bisTripConf` helper defaults to rendering `departure` and `destination` as standard **text input fields** (`type: 'input'`).

---

### Technical Implementation Details

#### Dynamic Unit Splitting
Most business trip factors use composite units like **Passenger-Kilometers (Pkm)**.
*   **Function**: `updateWeightAndDistanceUnit` in `formConf.js`.
*   **Logic**: When a "種類選擇" (Factor Type) is selected, this function parses the `emissionFactorUnit`.
*   **Result**: If the unit matches a dual-entry pattern (defined in `WEIGHT_AND_DISTANCE_UNIT` within `EmissionSrc.js`), the form toggles visibility for `usage2`.
    *   `usage1`: Maps to "活動數據 1" (typically Number of Passengers).
    *   `usage2`: Maps to "活動數據 2" (typically Distance in Km), shown only if `hideUsage2` is false.

#### API Aliasing & Robustness
Because the production API might return different variations of a category name, the registry uses a multi-key approach:
```javascript
// Example from formConf.js
'airplane': bisTripConf(...),
'飛機': bisTripConf(...),
[AIRPLANE]: bisTripConf(...)
```
This ensures that the `resolveSchema` logic in `useEquipmentForm.js` can successfully match the category regardless of whether it receives an English key, a localized name, or a constant ID.

#### Data Submission
Submissions are sent via `POST /businessTripDatas` as `multipart/form-data`.
*   **Key Parameters**:
    *   `useDate`: The activity date.
    *   `departure`/`destination`: Station names or IDs.
    *   `usage1`/`usage2`: The numeric activity data.
    *   `equipmentTypeKey`: The string identifier for the mode (e.g., "TRAIN").
    *   `emissionSourceId`: The ID of the specific emission factor selected in the "種類選擇" dropdown.

### Related Files
- [[pwa_front/src/utils/formConf.js]]: Central registry and mode configuration logic.
- [[pwa_front/src/components/ManualEntryPopup.jsx]]: Form rendering and dropdown population logic.
- [[pwa_front/src/utils/api.js]]: Station and submission API definitions.
- [[pwa_front/src/utils/EmissionSrc.js]]: Constant definitions and unit mapping tables.
