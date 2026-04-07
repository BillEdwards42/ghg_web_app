# Location Selection

The location selection (also known as "據點" or "Facility") identifies the specific site where the carbon-emitting activity occurred.

Located in [[pwa_front/src/components/Home.jsx]], this function becomes active only after a [[legal-entity-selection]] has been made. It fetches a list of facilities from the backend API based on the selected corporation's ID. The selection is required before any [[ocr-scan]] or [[manual-entry]] actions can be performed.

### Implementation Details
- **API Integration**: Fetches data from `/facilitys/all/<entityId>?mode=direct&maxResults=999`.
- **Caching**: Facilities for a specific corporation are cached in `localStorage` with a key format of `facilities_<entityId>` to improve performance on subsequent visits.
- **Loading State**: A `loadingFacilities` state prevents user interaction while data is being fetched.
- **Persistence**: The selected location is stored in `localStorage` as `selected_loc`.

### Related Files
- [[pwa_front/src/components/Home.jsx]]: Main logic for fetching and managing facility state.
- [[pwa_front/src/utils/api.js]]: Handles the underlying network requests.
- [[wiki/legal-entity-selection]]: Prerequisite selection.
