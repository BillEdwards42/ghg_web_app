# OCR API

## Quick Use

- Method: `POST`
- URL: `{{base_url}}/ocr`
- Example base URL: `http://dev.esg-lndata.lndata.com/frontend_api`

## Required Headers

- `X-Auth-Token: <token>`
- `x-esg-system: 1`

## Body

Use `form-data`.

- `category` as `Text`
- `file` as `File`

Allowed `category` values:

- `電費單`
- `水費單`
- `高鐵/台鐵車票`

## Postman Setup

1. Set request method to `POST`
2. Set request URL to `{{base_url}}/ocr`
3. Add headers:
   - `X-Auth-Token`
   - `x-esg-system`
4. Go to `Body`
5. Choose `form-data`
6. Add:
   - `category` -> `Text`
   - `file` -> `File`

Do not manually set `Content-Type` for the request. Let Postman generate the multipart boundary automatically.

## Success Response

Status: `200`

Example:

```json
{
  "data": {
    "type": "tw_power_bill",
    "payment_date": "2026/02/01",
    "regular_degree": 220
  },
  "schema": {
    "type": "tw_power_bill",
    "title": "電力活動數據",
    "errorLabel": "電費單",
    "unit": "度",
    "fields": {
      "date": "payment_date",
      "usage": "regular_degree"
    }
  }
}
```

## Common Error Responses

### Missing file

Status: `400`

```json
{
  "code": "error.ocrMissingFile",
  "message": "未提供圖片檔案 (No image file provided)",
  "error": "未提供圖片檔案 (No image file provided)"
}
```

### Invalid category

Status: `400`

```json
{
  "code": "error.ocrInvalidCategory",
  "message": "缺少或無效的票據類型 (Invalid category)",
  "error": "缺少或無效的票據類型 (Invalid category)"
}
```

### OCR mismatch

Status: `422`

Example:

```json
{
  "code": "error.ocrTypeMismatch",
  "message": "此票據並非電費單。",
  "error": "此票據並非電費單。"
}
```

This usually means the uploaded image does not match the selected `category`.

## Notes For Users

- If you upload a water bill, set `category` to `水費單`
- If you upload an HSR or railway ticket, set `category` to `高鐵/台鐵車票`
- A `422` does not automatically mean backend failure; it often means the selected category does not match the OCR result

## Technical Notes

- Backend route: `POST /ocr`
- Proxied route: `POST /frontend_api/ocr`
- Auth is required through the normal `carbon64-api` token flow
- The backend sends the uploaded file to the external OCR provider and validates the returned OCR `type` against the selected `category`
- The backend does not send the selected `category` to the OCR provider; the provider classifies the document from the uploaded image itself

## Supported OCR Type Mapping

- `電費單` -> `tw_power_bill`
- `水費單` -> `tw_water_bill`
- `高鐵/台鐵車票` -> `tw_thsrc` or `tw_railway`
