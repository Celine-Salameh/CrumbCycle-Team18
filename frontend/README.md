# CrumbCycle React Frontend

Epic 1 frontend foundation built with React and Vite. It includes a responsive public landing page, public authentication routes, protected application routes, a reusable UI component layer, a configured API client, and Recharts dashboard visualization.

## Setup

```powershell
cd frontend
npm install
Copy-Item .env.example .env
npm run dev
```

The frontend opens at `http://localhost:5173` and expects the backend at `http://localhost:8000/api` by default.

## Production build

```powershell
npm run build
npm run preview
```

## Routes

- `/` — public CrumbCycle landing page
- `/login` — public login page
- `/signup` — public account creation page
- `/dashboard` — protected application shell and dashboard

## Epic 1 coverage

- 1.1 React + Vite project, global CSS tokens, and organized source folders.
- 1.2 React Router with public-only and protected route guards.
- 1.3 Application layout with responsive sidebar, top header, user information, and content area.
- 1.4 Shared button, input, card, modal, spinner, and toast components.
- 1.5 Fetch-based API client with base URL configuration, JSON errors, and bearer authentication.
- 1.6 Recharts charting library used in the protected dashboard.
