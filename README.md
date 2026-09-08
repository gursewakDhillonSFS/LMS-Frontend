# LMS Frontend

Next.js App Router UI for the Learning Management System.

## Source of truth

**[docs/FRONTEND.md](./docs/FRONTEND.md)** — routes, middleware, Redux, services, checkout/Stripe FE contract, env vars.

Monorepo index: [../DOCS.md](../DOCS.md)

## Quick start

```bash
cp .env.example .env.local
# fill NEXT_PUBLIC_* values (see docs/FRONTEND.md)
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build
```

Backend URL must match `NEXT_PUBLIC_BACKEND_API_URL` (often `http://localhost:3288`).
