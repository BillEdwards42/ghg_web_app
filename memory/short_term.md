# Short Term Issues

**Current Problem**
- After capturing a photo and sending it to the OCR API, the UI does not display any result. The user sees the "辨識中..." (or "壓縮及辨識中...") loading state, but once the request completes, nothing is rendered.
- The underlying cause appears to be that the OCR response is parsed (`const result = await response.json();`) but the data is never injected into the UI. The `addEntry` and `renderHistory` calls are present, yet they rely on the `payload` object which only contains a generic `usage` field derived from `result.amount || result.total || result.data?.amount || 1`. If the API returns a different shape, the `usage` may be undefined, and the entry may not be added correctly.
- Additionally, the `cameraInput.value = ''` reset runs before any UI update in some error paths, potentially clearing the input before the result is displayed.

**What Needs to be Fixed**
1. **Map the OCR response correctly** – Identify the exact fields returned by the OCR service (e.g., `total`, `amount`, `data`) and construct a payload that includes all relevant information for the user to review.
2. **Ensure UI update** – After building the payload, call `addEntry(payload, imageRef)` and `renderHistory()` *only after* confirming the response contains the expected data.
3. **Handle empty or unexpected responses** – Add a guard that alerts the user when the API returns an empty body or an unexpected schema, so they know why nothing appears.
4. **Maintain loading state** – Reset the button label and input field *after* the UI has been refreshed, not before.

**Next Steps**
- Update `src/camera.ts` to extract the required fields from `result` and pass a fully populated `payload` to `addEntry`.
- Add defensive checks and user‑friendly alerts for missing data.
- Verify that the history list renders the new entry correctly on both desktop and mobile.

*These short‑term actions will make the OCR integration functional and provide a clear path toward the longer‑term backend‑driven workflow.*
