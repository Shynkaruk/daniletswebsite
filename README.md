# Danilets Website

Customer-facing booking and marketing site for **Danilets** — a professional auto detailing and cleaning service.

## Features

- Multi-step booking flows for auto detailing (personal & business) and cleaning (residential & commercial)
- Google OAuth sign-in
- Stripe payment integration
- Email notifications via Resend
- SEO-friendly pages with `react-helmet-async`

## Tech Stack

- **Frontend**: React 19, React Router 7, Tailwind CSS 4, Vite 6
- **Backend**: Node.js (Express), MongoDB / Mongoose
- **Payments**: Stripe
- **Auth**: Google OAuth (`@react-oauth/google`)

## Getting Started

```bash
npm install
npm run dev       # start Vite dev server
npm run start     # start Express API server
npm run build     # production build
npm run lint      # ESLint
```

Requires Node 20.x.
