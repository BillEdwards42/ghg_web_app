# OCR Scan

The OCR scan function enables intelligent data entry by extracting information from physical documents (electricity bills, water bills, and transport tickets) using image recognition.

This function is orchestrated by [[pwa_front/src/components/ScanSelection.jsx]] and uses the [[pwa_front/src/hooks/useOCR.js]] hook for image processing. After a photo is captured, it is compressed and sent to the `/ocr` endpoint. The returned structured data is then passed to the [[ConfirmationPopup]], where the user verifies the results before saving.

### Technical Implementation
- **Image Compression**: `useOCR.js` utilizes a canvas-based compression algorithm (`compressImage`) to resize images to a maximum dimension of 1280px and convert them to JPEG format (0.8 quality). This minimizes bandwidth usage and improves OCR processing speed.
- **Backend Integration**: Sends a `FormData` object containing the `file` and `category` to the `/ocr` endpoint.
- **Data Validation**: The [[ConfirmationPopup]] performs smart matching for electricity factors based on the reporting year and payment date. For example, it matches "電力(112)" if the reporting year is 112.
- **Redirection**: For "高鐵/台鐵車票", the system automatically maps the OCR results to the [[business-trip]] data structure for consistency.

### Related Files
- [[pwa_front/src/hooks/useOCR.js]]: Logic for image compression and OCR API calls.
- [[pwa_front/src/components/ScanSelection.jsx]]: UI for category selection and camera triggering.
- [[pwa_front/src/components/ConfirmationPopup.jsx]]: Verification and submission UI for OCR results.
- [[pwa_front/src/utils/api.js]]: Contains the `addImportedElectricityActivity` and `addBusinessTrip` submission endpoints.
