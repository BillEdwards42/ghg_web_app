# Employee Commuting

Employee Commuting is a high-volume data entry module that uses a specialized grid UI to record commuting data for multiple transportation modes simultaneously.

Unlike standard [[manual-entry]] forms, Employee Commuting bypasses the Tier 3 selection screen and opens a grid interface directly. This is implemented using the `tableInput` field type in [[pwa_front/src/components/ManualEntryPopup.jsx]].

### Technical Implementation
- **Grid UI**: The `tableInput` renderer fetches a list of commuting modes (MRT, Bus, Scooter, etc.) via `fetchEmployeeCommutingConf` upon mounting. It renders these in a table where users can enter "員工人次" (Number of People) and "平均通勤距離" (Distance) for each row.
- **State Management**: The grid data is stored in a `commutingList` state array. Each change triggers an update to the `formData` object under the `employeeCommutingDataDetails` key.
- **Data Serialization**: The `saveFormatting` function for this category stringifies the array into a JSON string before appending it to the `FormData` payload. Only rows with non-zero values are typically sent to the backend.
- **Bypass Logic**: `ManualCategorySelection.jsx` contains a hardcoded check for the "員工通勤" Tier 2 category to immediately trigger the `onComplete` callback, streamlining the user flow.

### Related Files
- [[pwa_front/src/components/ManualEntryPopup.jsx]]: Implementation of the `tableInput` renderer.
- [[pwa_front/src/utils/formConf.js]]: Defines the schema and custom `saveFormatting` for commuting.
- [[pwa_front/src/components/ManualCategorySelection.jsx]]: Contains the bypass logic for this category.
