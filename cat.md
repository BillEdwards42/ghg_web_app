# Mobile Activity Dynamic-UI Notes for Bill (Dev)

Official dev backend base URL:

- `https://dev-carbon64.lndata.com/frontend_api`

Goal of this doc:

- Focus on API contracts needed to dynamically render available activity choices for a user.
- This is about selection UI and dynamic options first (not full data-save coverage yet).

---

## 1) Prerequisite Auth (minimal)

You need a valid token before fetching activity options.

### Login

- `POST /session`
- Body:

```json
{
  "username": "user@example.com",
  "password": "<base64-encoded-password>",
  "systemId": 1
}
```

Save `token` from response.

### Check user context

- `GET /checkUserToken`
- Headers:

```text
X-Auth-Token: <token>
x-esg-system: 1
```

Use `rootLegalEntities` from response to drive legal-entity selection.

---

## 2) Dynamic Selection Flow (what to call, in order)

1. User logs in
2. User selects legal entity (`legalEntityId`)
3. Fetch facilities under legal entity
4. User selects facility (`facilityId`) and year
5. Fetch activity category tree for that facility/year
6. Render category/emission/equipment options dynamically from response

---

## 3) Endpoints for Dynamic Selection

### A) Facilities under selected legal entity

- Method: `GET`
- URL:
  - `https://dev-carbon64.lndata.com/frontend_api/facilitys/all/<legalEntityId>?mode=direct&maxResults=999`
- Headers:

```text
X-Auth-Token: <token>
```

### B) Activity category tree for selected facility/year

- Method: `GET`
- URL:
  - `https://dev-carbon64.lndata.com/frontend_api/getEquipmentTypesForEmissionSourceData/:facilityId/:year?maxResults=999`
- Headers:

```text
X-Auth-Token: <token>
Accept-Language: zh-TW
```

Example:

- `https://dev-carbon64.lndata.com/frontend_api/getEquipmentTypesForEmissionSourceData/130/2026?maxResults=999`

---

## 4) Response shape you should render from

The tree is effectively:

- Level 1: `category`
- Level 2: `emissionType[]`
  - `emissionTypeName`
  - `emissionTypeKey`
- Level 3: `equipmentType[]`
  - `equipmentTypeId`
  - `equipmentTypeName`
  - `equipmentTypeKey`
  - `canCreate` (`yes` / `no`)

Render behavior recommendation:

- Use level 1-3 as dynamic picker source.
- Disable selection when `canCreate === 'no'`.
- Keep these keys in selected state because downstream form/endpoint mapping depends on them:
  - `emissionTypeId`, `emissionTypeKey`, `emissionTypeName`
  - `equipmentTypeId`, `equipmentTypeKey`, `equipmentTypeName`

---

## 5) Important constraint (very important)

`/getEquipmentTypesForEmissionSourceData/:facilityId/:year` gives available branches/options,
but it does **not** return full field-schema definitions for every form.

Meaning:

- Backend tells you "what branches are available".
- Frontend still decides "what form fields to show for this branch" via mapping/config.

So for mobile v1:

- Start by dynamically rendering the category picker from this endpoint.
- Then support a limited branch subset with fixed form schemas.

---

## 6) Wrapper recommendation

Not mandatory, but strongly recommended to avoid repetitive bugs.

A tiny API client/wrapper should centralize:

- base URL
- `X-Auth-Token` injection
- `Accept-Language` default
- handling `401`/`403`

---

## 7) Scope note for current mobile app

- Current mobile OCR 3 scan buttons are simplified and not a strict 1:1 mirror of all activity branches.
- This doc is intentionally focused on dynamic option rendering (category/facility/year context), not full parity with web activity engine.
