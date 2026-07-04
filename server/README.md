# Campus Placement Portal — Backend (Phase 2)

MERN backend for the Campus Placement Portal. Built to match the architecture
and coding conventions of the Crime Heatmap reference project (Express +
Mongoose, JWT auth, bcrypt, multer + Cloudinary, `sendSuccess`/`sendError`
response helpers).

## 1. Setup

```bash
cd server
npm install
cp .env.example .env
```

Fill in `.env`:
- `JWT_SECRET` — any long random string
- `MONGODB_URI` (or the `MONGODB_USER` / `MONGODB_PASSWORD` / `MONGODB_CLUSTER` trio) — a MongoDB Atlas connection
- `CLOUDINARY_*` — required only for resume uploads; everything else works without them

## 2. Run

```bash
npm run dev      # nodemon, http://localhost:5000
```

## 3. Seed test data (local dev only)

```bash
npm run seed
```

Creates 1 admin, 2 recruiters, 5 companies, 10 jobs, 4 students, and 7 sample
applications. All seeded accounts share the password `Password@123`:

| Role | Email |
|---|---|
| Admin | admin@campushire.com |
| Recruiter (Google) | recruiter1@campushire.com |
| Recruiter (Amazon) | recruiter2@campushire.com |
| Student | anjali@student.com |

Re-running `npm run seed` wipes and rebuilds all collections — dev/test only,
never run against production data.

## 4. Test every endpoint with Postman

Import `campus-placement-portal.postman_collection.json` into Postman.

1. Run **Auth → Login - Student / Recruiter / Admin**, then copy each
   response's `data.token` into the matching collection variable
   (`studentToken`, `recruiterToken`, `adminToken`).
2. Run **Jobs → List Jobs**, copy a job's `_id` into the `jobId` variable.
3. Run **Companies → List Companies**, copy a company's `_id` into
   `companyId`.
4. From there every request in the collection (profile, resume upload, job
   CRUD, apply, applicant review, status updates, admin user/job management)
   is ready to run against `http://localhost:5000/api`.

All routes are also directly curl-able, e.g.:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"anjali@student.com","password":"Password@123","role":"student"}'
```

## 5. API surface

| Module | Routes |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout` |
| Students | `GET/PUT /api/students/profile`, `POST /api/students/resume` |
| Companies | `GET /api/companies`, `GET /api/companies/:id`, `POST/PUT/DELETE /api/companies/:id` (admin) |
| Jobs | `GET /api/jobs`, `GET /api/jobs/:id`, `GET /api/jobs/my` (recruiter), `POST /api/jobs` (recruiter), `PUT/DELETE /api/jobs/:id` (owner/admin) |
| Applications | `POST /api/applications` (student), `GET /api/applications/my` (student), `GET /api/applications/job/:jobId` (recruiter), `PATCH /api/applications/:id/status` (recruiter) |
| Admin | `GET /api/admin/stats`, `GET/POST /api/admin/users`, `PATCH /api/admin/users/:id/status`, `DELETE /api/admin/users/:id`, `GET /api/admin/jobs`, `DELETE /api/admin/jobs/:id` |

Login is role-aware: the client sends `{ email, password, role }`, and the
frontend's role selector (Student / Recruiter / Admin) determines which
dashboard the returned `user.role` redirects to.

## 6. Production hardening included

- `helmet` for standard security headers
- Scoped rate limiting on `/api/auth/login` and `/api/auth/register` (brute-force protection)
- `morgan` request logging (`dev` format locally, `combined` when `NODE_ENV=production`)
- Startup check: refuses to boot in production if `JWT_SECRET` is missing or left at its insecure default
- `password` field is excluded from all queries by default (`select: false`); only `login` explicitly requests it
- Search/filter query params (`q`, `type`, `status`, `role`) are whitelisted/escaped to prevent NoSQL and regex injection via query-string objects
- Multer upload errors (bad file type, over 5MB) return clean `400` responses instead of falling through to a generic `500`

## 7. What's next (Phase 3)

Frontend integration: rebuilding the existing HTML/CSS/JS pages as React
components (same visual design, Tailwind instead of raw CSS) wired to these
APIs via axios, replacing all `localStorage`/hardcoded-array logic.
