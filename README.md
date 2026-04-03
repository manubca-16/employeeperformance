# PerfTrack

PerfTrack is an employee performance and task management system with role-based access for:

- `SUPERADMIN`
- `ADMIN`
- `HR`
- `EMPLOYEE`

It includes:

- employee performance dashboards
- employee and bonus management
- task assignment and editing
- Excel/CSV task upload for Super Admin
- bonus and escalation tracking

## Tech Stack

Frontend:

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- Recharts

Backend:

- Node.js
- Express
- MongoDB
- Mongoose
- JWT auth
- Multer
- SheetJS (`xlsx`)

## Project Structure

```text
employeeperformance-main/
├─ backend/                 # Express + MongoDB API
├─ public/                  # Static frontend assets
├─ src/                     # React frontend
├─ package.json             # Frontend scripts
└─ README.md
```

## Roles

### Super Admin

- full access across the app
- can upload task sheets
- can create, edit, export, and delete tasks
- can bulk delete tasks
- can access the dedicated task upload route

### Admin / HR

- high-authority access
- can view all tasks, employees, bonuses, and escalations
- can edit task details
- cannot use the protected task upload route

### Employee

- can view only their own tasks and dashboard data
- can see bonus eligibility and escalation notices on their tasks

## Task Upload Feature

Super Admin can upload `.xlsx` or `.csv` files from the task upload page:

- route: `/dashboard/tasks/upload`
- protected by role guard in the frontend
- protected by JWT + role middleware in the backend

Supported upload behavior:

- drag and drop upload
- file preview before submission
- row validation
- employee matching by name or employee ID
- summary of inserted and skipped rows
- downloadable sample template

## Setup

## 1. Frontend

From the project root:

```bash
npm install
```

Run the frontend:

```bash
npm run dev
```

Frontend usually runs on:

```text
http://localhost:5173
```

## 2. Backend

Go to the backend folder:

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=4000
CORS_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/employeeperformance
JWT_SECRET=change_this_to_a_strong_secret
```

Run the backend:

```bash
npm run dev
```

Backend runs on:

```text
http://localhost:4000
```

## 3. Seed Data

To seed sample backend data:

```bash
cd backend
npm run seed
```

## Scripts

Frontend:

```bash
npm run dev
npm run build
npm run lint
npm run test
```

Backend:

```bash
npm run dev
npm run start
npm run seed
```

## Important Routes

Frontend:

- `/signin`
- `/dashboard`
- `/dashboard/employees`
- `/dashboard/tasks`
- `/dashboard/tasks/upload`
- `/dashboard/performance`
- `/dashboard/bonuses`
- `/dashboard/announcements`
- `/dashboard/reports`
- `/dashboard/settings`

Backend API:

- `POST /api/auth/login`
- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/:taskId`
- `DELETE /api/tasks/:taskId`
- `DELETE /api/tasks/bulk-delete`
- `GET /api/tasks/template`
- `POST /api/upload-tasks`

## Notes

- The frontend now stores both the logged-in user and JWT token in local storage.
- Task and upload APIs require authentication.
- The upload flow uses lazy-loaded `xlsx` on the frontend to reduce the initial bundle size.
- Some optional features from the product spec are still not implemented, such as comments, reminders, audit logs, and email notifications.

## Current Status

Working:

- lint passes
- frontend build passes
- protected task upload route exists
- role-based task management works
- bonus and escalation visibility is integrated into dashboards

Still worth improving:

- add backend automated tests
- test the upload flow with more real spreadsheets
- optimize chart bundle size further
- add more robust role/permission coverage across all routes
