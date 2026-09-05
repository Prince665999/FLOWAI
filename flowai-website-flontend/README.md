# FLOWAI Storefront

Customer-facing Next.js application for the FLOWAI commerce backend.

## Local development

Copy `.env.example` to `.env.local`, set `NEXT_PUBLIC_API_BASE_URL` to the FastAPI URL, then run `npm install` and `npm run dev`.

Run `npm run typecheck`, `npm test`, and `npm run build` before deployment. All catalog, cart, checkout, order, and payment values are server-authoritative and are fetched from the FastAPI API.
