# Finance Data Processing and Access Control Backend

I built this project as a backend for a finance dashboard system. Since the assignment allows an in-memory approach, I chose to keep the data layer simple and focus more on API design, access control, validation, and clean structure.

The idea was to keep the project easy to run while still covering the important backend concerns the assignment is looking for.

## What is included

- user creation and management
- role-based access control
- active and inactive user status handling
- financial record CRUD
- filtering by type, category, date range, and search term
- pagination for record listing
- dashboard summary APIs
- validation and structured error responses
- API documentation at `/docs`
- a small verification script

## Roles

- `viewer`: can read records and dashboard summary
- `analyst`: can read records and dashboard summary
- `admin`: can manage users and fully manage records

## Tech choices

- Node.js built-in HTTP server
- ES modules
- in-memory storage using JavaScript `Map`
- API documentation through Swagger UI

No database is used in this version.

## Project structure

```text
backend-assessment/
|-- package.json
|-- src/
|   |-- app.js
|   |-- server.js
|   |-- core/
|   |   |-- errors/
|   |   |-- http/
|   |   `-- validation/
|   |-- data/
|   `-- modules/
|       |-- auth/
|       |-- dashboard/
|       |-- docs/
|       |-- records/
|       `-- users/
`-- tests/
```

## Running the project

### Requirement

- Node.js 20 or newer

### Start the server

```bash
npm start
```

For watch mode:

```bash
npm run dev
```

Server:

```text
http://localhost:3000
```

Docs:

```text
http://localhost:3000/docs
```

API spec:

```text
http://localhost:3000/openapi.json
```

### Vercel deployment

This project can also be deployed on Vercel.

- `api/index.js` is the serverless entry point
- `vercel.json` rewrites all routes to that handler
- after deployment, `/docs`, `/health`, `/api/...`, and `/openapi.json` should all work on the deployed domain

## Demo accounts

These accounts are already available for testing:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@fintrack.local` | `Admin@123` |
| Analyst | `analyst@fintrack.local` | `Analyst@123` |
| Viewer | `viewer@fintrack.local` | `Viewer@123` |
| Inactive Viewer | `inactive@fintrack.local` | `Inactive@123` |

## Main endpoints

### Auth

- `GET /api/auth/demo-accounts`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Users

- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
- `PATCH /api/users/:id`

These routes are restricted to `admin`.

### Records

- `GET /api/records`
- `GET /api/records/:id`
- `POST /api/records`
- `PATCH /api/records/:id`
- `DELETE /api/records/:id`

Read access is available to `viewer`, `analyst`, and `admin`.

Write access is available to `admin`.

### Dashboard

- `GET /api/dashboard/summary`

This route is available to `viewer`, `analyst`, and `admin`.

## Example requests

Login:

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@fintrack.local\",\"password\":\"Admin@123\"}"
```

Get dashboard summary:

```bash
curl http://localhost:3000/api/dashboard/summary \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Record filters:

```text
GET /api/records?page=1&pageSize=10&type=expense
GET /api/records?category=Software
GET /api/records?from=2026-01-01&to=2026-03-31
GET /api/records?search=license
```

## Response format

Successful response:

```json
{
  "data": {},
  "meta": {
    "requestId": "uuid",
    "timestamp": "2026-04-05T18:30:00.000Z"
  }
}
```

Error response:

```json
{
  "error": "You do not have permission to perform this action",
  "details": null,
  "meta": {
    "requestId": "uuid",
    "timestamp": "2026-04-05T18:30:00.000Z"
  }
}
```

## Validation and rules

- email format is validated
- password must be at least 8 characters
- amount must be a positive number
- dates must follow `YYYY-MM-DD`
- role must be `viewer`, `analyst`, or `admin`
- status must be `active` or `inactive`
- inactive users cannot log in
- only admins can create, update, or delete records
- only admins can manage users

## Notes

- data is stored in memory and resets when the server restarts
- authentication is handled with simple bearer tokens
- passwords are plain text because this is only an in-memory demo setup
- the docs page loads Swagger UI from a CDN

## Verification

Run:

```bash
npm test
```

If PowerShell blocks `npm.ps1`, use:

```bash
node tests/smoke.test.js
```

The check covers login, dashboard access, record creation, and access control.
