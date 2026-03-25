# Mobile Auth Endpoint Notes (Dev)

Official dev backend base URL:

- `https://dev-carbon64.lndata.com/frontend_api`

For auth-only integration (with hardcoded `systemId`), use these 3 endpoints.

## 1) Login

- Method: `POST`
- URL: `https://dev-carbon64.lndata.com/frontend_api/session`
- Body (JSON):

```json
// example request
{
  "username": "benedictestefan.dev@gmail.com",
  "password": "<base64-encoded-password>", // "QmVudG9sb2wxMjM=" (MUST BE base64 encoded)
  "systemId": 1 // hardcoded
}
```

```json
// example response
{
    "id": 213,
    "email": "benedictestefan.dev@gmail.com":,
    "name":	"Benedict",
    "role":	"admin",
    "language":	"zh-tw",
    "createdBy": "lndata",
    "token": "2GvWx6GR1wXDdAU2u8vRIU155HcsJMTvdiwMcAh4A4tTpcQFbi", // need this token for future requests
}

```

Notes:
- `password` must be base64 encoded (same behavior as official web app).
- Save returned `token` from response.

## 2) Check User Token (Required)

- Method: `GET`
- URL: `https://dev-carbon64.lndata.com/frontend_api/checkUserToken`
- Headers:

```text
X-Auth-Token: <token from login> // from login above
x-esg-system: <hardcoded systemId> // 1
```

Notes:
- Use this immediately after login.
- This validates token and returns full user/profile context.

example response:

```json
// this shows the core context off the system
{
    "id": 213,
    "email": "benedictestefan.dev@gmail.com",
    "name": "Benedict",
    "role": "admin",
    "language": "zh-tw",
    "createdBy": "lndata",
    "systems": {...},
    "rootLegalEntities": {...}, // THIS IS USED TO show the available legal entities to choose from
    "functions": {...},
}
```
---

## 3) Logout

- Method: `DELETE`
- URL: `https://dev-carbon64.lndata.com/frontend_api/session`
- Headers:

```text
X-Auth-Token: <token>
```

Notes:
- Call on logout, then clear client-side auth state.


# Activity Data Endpoints

## 1.  To get the list of facilities of each Legal Entities 

`https://dev-carbon64.lndata.com/frontend_api/facilitys/all/<id of Legal Entity>`

query params:

mode:
	direct
maxResults:
	999

e.g. Usage :
    `https://dev-carbon64.lndata.com/frontend_api/facilitys/all/129?mode=direct&maxResults=999`


## 2.  To get the list of options to choose from 

GET
    `https://dev-carbon64.lndata.com/frontend_api/getEquipmentTypesForEmissionSourceData/130/2026?maxResults=999`
