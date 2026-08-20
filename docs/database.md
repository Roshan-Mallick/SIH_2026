# Database Schema & Migrations

Aegis uses Supabase PostgreSQL.

## Tables

### \`profiles\`
Extended user information. Tied 1-to-1 with \`auth.users\`.
- \`id\`, \`user_id\`, \`display_name\`

### \`plans\`
Available subscription plans.
- \`id\`, \`name\`, \`stripe_product_id\`, \`stripe_price_id\`, \`price\`

### \`subscriptions\`
User subscriptions mapped from Stripe.
- \`id\`, \`user_id\`, \`plan_id\`, \`stripe_subscription_id\`, \`status\`

### \`entitlements\`
Abstract access controls decoupled from Stripe.
- \`id\`, \`user_id\`, \`feature_key\`

### \`licenses\`
Desktop product licenses for Aegis PreFlight.
- \`id\`, \`user_id\`, \`license_key\`, \`status\`, \`activation_count\`

### \`stripe_events\`
Idempotency table for webhooks.

### \`audit_logs\`
Tracking user and system actions securely.

## Row Level Security (RLS)
Every table implements RLS. Users can only SELECT/UPDATE rows where \`user_id = auth.uid()\`. 
Service roles bypass RLS for webhook synchronization.
