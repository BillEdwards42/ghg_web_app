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

#### Unified Implementation (HSR & Railway)
To ensure consistency with the metadata-driven manual entry system, HSR and Railway OCR results now **delegate rendering to the [[ManualEntryPopup]]**. 
- **Orchestration**: `ConfirmationPopup` calculates the correct 3-tier `pathData` (e.g., Category 3 -> Business Trip -> HSR) and passes the OCR result as `initialData`.
- **Dynamic Matching**: The `ManualEntryPopup` handles the fetching of station lists and emission factors. It automatically matches the OCR-provided strings (e.g., "台北", "高雄") to the correct numeric IDs returned by the API.
- **Validation Parity**: By using the manual entry popup, OCR results automatically benefit from advanced validation logic, such as checking for closed reporting periods and equipment-specific date constraints.

#### Specialized Utility Popups (Electricity & Water)
Currently, Electricity and Water OCR still utilize specialized hardcoded UI blocks within `ConfirmationPopup.jsx`.
- **Electricity Smart Matching**: The system automatically matches the most relevant emission factor by parsing strings like "電力(112)" and comparing them to the `activeYear`.
- **Direct Population**: The `ConfirmationPopup` uses a `useEffect` hook that watches the `paymentDate` to trigger relevant dependency APIs immediately.

### Related Files
- [[pwa_front/src/hooks/useOCR.js]]: Logic for image compression and OCR API calls.
- [[pwa_front/src/components/ScanSelection.jsx]]: UI for category selection and camera triggering.
- [[pwa_front/src/components/ConfirmationPopup.jsx]]: Verification and submission UI for OCR results.
- [[pwa_front/src/utils/api.js]]: Contains the `addImportedElectricityActivity` and `addBusinessTrip` submission endpoints.
