# Synaptech ERP — Authentication Module

Implementation of the Authentication UX spec (Login, Forgot Password, Reset
Password) for the Synaptech ERP frontend.

## Stack
React 19 · TypeScript · Vite · Tailwind CSS · React Router v7 · Zustand ·
TanStack Query · Axios · React Hook Form · Zod · Framer Motion · i18next ·
react-hot-toast · lucide-react

## Getting started
```bash
npm install
npm run dev
```

## Structure
- `components/common/` — generic, presentation-only primitives (Button, TextInput, Card, ...)
- `components/admin/auth/` — auth-specific composites (forms, AuthLayout, SynapseFieldPanel)
- `pages/common/` — route-level pages that compose the above
- `services/api/` — Axios instance + auth endpoints, isolated from components
- `store/` — Zustand stores (auth session, theme)
- `schemas/` — Zod validation schemas, shared by forms
- `theme/` — typed design tokens (mirrors the CSS variables in `styles/globals.css`)
- `locales/` — en/ar translation resources for i18next

## Notes for the next module
- `authApi.verifyResetToken` is stubbed in `ResetPasswordPage` — wire it through
  a `useQuery` once the endpoint exists, replacing the placeholder `isExpired` check.
- `useAuthStore` is intentionally minimal; route guarding (e.g. a `RequireAuth`
  wrapper) belongs in Module 2 once protected routes exist.
- All copy lives in `locales/`, not inline — new screens should follow the same
  pattern rather than hardcoding strings.
"# SynapTech-ERP" 
