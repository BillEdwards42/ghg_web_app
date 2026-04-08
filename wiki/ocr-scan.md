# OCR Scan

The OCR scan function enables intelligent data entry by extracting information from physical documents (electricity bills, water bills, and transport tickets) using image recognition.

This function is orchestrated by [[pwa_front/src/components/ScanSelection.jsx]] and uses the [[pwa_front/src/hooks/useOCR.js]] hook for image processing. After a photo is captured, it is compressed and sent to the `/ocr` endpoint. The returned structured data is then passed to the [[ConfirmationPopup]], where the user verifies the results before saving.

---

### OCR API Technical Specification

#### Endpoint Overview
- **Method**: `POST`
- **URL**: `{{base_url}}/ocr` (e.g., `https://dev-carbon64.lndata.com/frontend_api/ocr`)
- **Headers**:
  - `X-Auth-Token`: Current user session token.
  - `x-esg-system`: `1` (Standard Ln{Carbon} system ID).

#### Request Body (`multipart/form-data`)
- **`category`** (Text): The localized category string. Supported values:
  - `電費單`
  - `水費單`
  - `高鐵/台鐵車票`
- **`file`** (File): The compressed image file (JPEG/PNG).

#### Supported Type Mapping
The backend classifies the document from the image and validates it against the requested category:
- `電費單` maps to `tw_power_bill`.
- `水費單` maps to `tw_water_bill`.
- `高鐵/台鐵車票` maps to `tw_thsrc` or `tw_railway`.

#### Response Patterns
- **Success (200)**: Returns a `data` object with extracted fields and a `schema` object defining how to map them to the UI.
- **Missing File (400)**: `error.ocrMissingFile`
- **Invalid Category (400)**: `error.ocrInvalidCategory`
- **Type Mismatch (422)**: `error.ocrTypeMismatch` (Occurs when the image content does not match the selected category).

---

### Data Validation & Population
The [[ConfirmationPopup]] acts as a bridge between the raw OCR response and the structured manual entry system. 

#### Direct Data Population (Bypassing Manual Steps)
Unlike manual entry where a user must select a date before emission factors or stations are fetched, the OCR workflow populates the date and result metrics (e.g., usage, stations) simultaneously.
- **Trigger Logic**: The `ConfirmationPopup` uses a `useEffect` hook that watches the `paymentDate`. As soon as the OCR data provides a date, the component immediately triggers the relevant dependency APIs (e.g., `fetchImportedElectricityFactors` or `fetchBisTripType`).
- **Smart Matching**: For electricity, the system automatically matches the most relevant emission factor by parsing strings like "電力(112)" and comparing them to the `activeYear`.

#### High-Speed Rail & Railway Specifics
- **Mapping**: `tw_thsrc` maps to `HIGH_SPEED_RAIL` and `tw_railway` maps to `TRAIN`.
- **Station Validation**: The system validates the extracted `from_name` and `to_name` against a hardcoded list of valid HSR and Railway stations. If a match is not found, it defaults to the first available station in the list.
- **Orchestration**: Upon mounting with a valid date, the popup triggers the "種類選擇" (Type) API to ensure the dropdown is populated before the user interacts with the form.

### Related Files
- [[pwa_front/src/hooks/useOCR.js]]: Logic for image compression and OCR API calls.
- [[pwa_front/src/components/ScanSelection.jsx]]: UI for category selection and camera triggering.
- [[pwa_front/src/components/ConfirmationPopup.jsx]]: Verification and submission UI for OCR results.
- [[pwa_front/src/utils/api.js]]: Contains the `addImportedElectricityActivity` and `addBusinessTrip` submission endpoints.
