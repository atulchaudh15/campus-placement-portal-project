# Campus Placement Portal — Frontend (Phase 3)

React + Vite + Tailwind frontend wired to the Express backend. Same visual
theme (cream/orange/black) as the original static prototype, rebuilt as
real React pages with live data.

## 1. Setup

```bash
cd client
npm install
cp .env.example .env
```

`.env` just needs `VITE_API_URL` pointing at the running backend
(defaults to `http://localhost:5000/api`).

## 2. Run

```bash
npm run dev      # http://localhost:5173
```

Make sure the backend (`server/`) is running and seeded first — see
`server/README.md`.

## 3. Pages

| Route | Page | Notes |
|---|---|---|
| `/` | Home | Static landing, CTAs route to jobs/register/dashboard |
| `/login` | Login | Role selector (Student/Recruiter/Admin), redirects by role |
| `/register` | Student Registration | Students only — recruiters/admins are created by an admin |
| `/jobs` | Job Listing | Live search + type filter, inline Apply for students |
| `/jobs/:id` | Job Details | Full description + Apply |
| `/applications` | Application Status | Student's own applications (protected) |
| `/student/dashboard` | Student Dashboard | Profile view/edit + resume upload (protected) |
| `/recruiter/dashboard` | Recruiter Dashboard | Create/edit/delete jobs (protected) |
| `/recruiter/jobs/:jobId/applicants` | Applicants | Accept/reject applicants (protected) |
| `/admin/dashboard` | Admin Dashboard | Manage users, jobs, companies (protected) |
| `/about`, `/contact` | Static pages | Contact form opens a pre-filled mailto (no backend endpoint was in scope) |

## 4. Auth flow

- `AuthContext` holds the current user, backed by a JWT in `localStorage`.
- `ProtectedRoute` redirects to `/login` if unauthenticated, or to the
  correct dashboard if the role doesn't match the route.
- The axios instance auto-attaches the token and force-logs-out on a 401.

## 5. Build

```bash
npm run build     # outputs to dist/
```
