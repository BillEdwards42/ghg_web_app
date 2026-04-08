# Manual Entry

The manual entry system is a highly flexible, metadata-driven form engine that dynamically generates input fields based on the selected emission category.

This system is implemented in [[pwa_front/src/components/ManualEntryPopup.jsx]] and is powered by the `formConf.js` registry. It resolves a schema based on the 3-tier category path selected by the user and renders a form divided into `topForm`, `middleForm`, and `bottomForm` sections.

### Architecture: The Registry Pattern
- **Metadata Configuration**: [[pwa_front/src/utils/formConf.js]] acts as a central registry. It maps category IDs or English keys (like `MOBILE_COMBUSTION` or `BUSINESS_TRIP`) to specific form schemas.
- **Dynamic Schema Resolution**: The `useEquipmentForm` hook resolves the correct configuration object, including API endpoints for fetching options and submission logic. Priority is given to Tier 3 (Equipment) configurations over Tier 2 (Category) fallbacks via the `useConfFirst` flag.
- **Localization**: All visible field labels are mapped to traditional Chinese (e.g., `labelName: '出發站'`) to ensure a localized user experience across all categories.
- **Field Dependency**: Many fields (especially in Category 2) have a `dependency: 'useDate'`. When the date is selected, a `useEffect` in `ManualEntryPopup` triggers a fetch for relevant emission factors or equipment available on that specific date.

### Technical & Hidden Fields
For system compatibility and backend requirements, several technical fields are managed implicitly:
- **`source` & `custodian`**: These are defined as `type: 'hidden'` in the configuration. They are not visible to the user but are included in the `FormData` payload as empty strings or system-defined values.
- **`file`**: This field is also `type: 'hidden'` during manual entry. It does not provide a file picker in the manual popup. Manual entries are currently designed for data-only recording; file attachments are handled automatically by the [[ocr-scan]] workflow, where the scanned image is attached to the resulting record.

### Category 3 (Transportation) Implementation
Category 3 is fully implemented with specialized logic for different transportation modes:
- **Station-Based (HSR, Train, MRT, Airplane)**: These use searchable dropdowns populated by mode-specific APIs (e.g., `fetchHsrStations`).
- **Free-Text (Bus, Taxi, Car, etc.)**: These use standard text inputs for departure and destination stations.
- **Employee Commuting**: A specialized grid-based UI (`tableInput`) for recording multiple commuting modes in a single entry.

### Technical Details
- **Form Data Serialization**: Most forms use `defFormatSave` from `formConf.js`, which converts the state into a `FormData` object, handling both text fields and file uploads.
- **Numeric Defaults**: 
  - **General Categories (1, 2, 4, 5)**: Numeric fields (`inputNumber`) are initialized as empty strings. They are mandatory; however, any invalid or cleared input defaults to `0` upon interaction in the state.
  - **Employee Commuting**: This is the only category where numeric fields (`员工人次`, `距离`) are explicitly initialized with a default value of `0` in the grid UI upon loading.
- **Date Selection**: 
  - The `date` field type uses the browser's native `<input type="date">`. 
  - **Mobile Behavior**: On Android and iOS, this automatically triggers the **system calendar** on the first tap, providing a platform-native and familiar user experience.
  - **Validation**: Restricted to the current `reportingYear` (e.g., `2024-01-01` to `2024-12-31`).
- **Validation**: Refactored to treat all visible and enabled fields as mandatory. Specialized validation like `checkEquipmentDate` ensures the activity date falls within the equipment's purchase and due dates.
- **Unit Splitting**: For transportation categories, the engine supports `updateWeightAndDistanceUnit`, which can split a composite unit (e.g., Passenger-Km) into two separate activity data inputs.

### Related Files
- [[pwa_front/src/components/ManualEntryPopup.jsx]]: The primary UI component that renders the dynamic forms.
- [[pwa_front/src/utils/formConf.js]]: The source of truth for all form configurations.
- [[pwa_front/src/hooks/useEquipmentForm.js]]: Hook for resolving schemas and managing form state.
- [[wiki/business-trip]]: A specialized implementation within the manual entry system.
- [[wiki/employee-commuting]]: Another specialized entry type using a grid UI.
