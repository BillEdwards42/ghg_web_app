# Legal Entity Selection

The legal entity selection allows users to choose which corporation or legal entity they are currently reporting for.

This function is implemented in [[pwa_front/src/components/Home.jsx]] using a [[SelectionModal]]. The list of available entities is retrieved from `rootLegalEntities` (stored during [[login]]). Selecting an entity clears any previously selected location and triggers a fetch for facilities associated with that specific entity.

### Implementation Details
- **Persistence**: The selected corporation is stored in `localStorage` as `selected_corp`.
- **Cascading Logic**: When a new corporation is selected, the `selectedLoc` state is reset to `null`, and the `facilities` list is cleared to prevent cross-contamination between entities.
- **Modal Component**: Uses [[pwa_front/src/components/SelectionModal.jsx]], a reusable component for searching and selecting items from a list.

### Related Files
- [[pwa_front/src/components/Home.jsx]]: Orchestrates the selection flow.
- [[pwa_front/src/components/SelectionModal.jsx]]: Reusable UI for selection.
- [[wiki/location-selection]]: The subsequent step in the context selection process.
