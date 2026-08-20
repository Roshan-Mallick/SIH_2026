# Aegis PreFlight Architecture

## High-Level Architecture
Aegis PreFlight utilizes a Next.js App Router frontend and backend, acting as a unified monolithic application serving the web presence, user authentication, subscription, and licensing systems.

- **Frontend:** Next.js (React), Tailwind CSS, inheriting the original Aegis glassmorphism UI.
- **Backend:** Next.js API Routes.
- **Database:** PostgreSQL via Supabase.
- **Auth:** Supabase Auth with Row Level Security (RLS).
- **Billing:** Stripe Subscriptions and Webhooks.

## Directory Structure
- \`src/app\`: Next.js App Router pages (Home, About, Pricing, Account, Login).
- \`src/app/api\`: Backend endpoints (Stripe Webhooks, Checkout, Billing Portal).
- \`src/components\`: Reusable UI components.
- \`src/lib\`: Shared utilities (Supabase clients, Stripe init).
- \`public/assets\`: Static images and branding.
- \`scratch/init_schema.sql\`: Supabase PostgreSQL migration schema.

## Security Model
The platform operates on a strict zero-trust model:
1. **Server-side Auth:** The client never authorizes itself; the server always checks \`supabase.auth.getUser()\`.
2. **RLS:** Users can only read/write their own rows in \`profiles\`, \`subscriptions\`, and \`licenses\`.
3. **Idempotent Webhooks:** Stripe webhooks are logged and checked for duplicates before processing.
