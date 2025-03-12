# Supabase Edge Functions

This directory contains Edge Functions for the MenúFácil application. Edge Functions are serverless functions that run on Supabase's edge network.

## Functions

### stripe-webhook

Handles Stripe webhook events for subscription management.

**Deployment**:

```bash
supabase functions deploy stripe-webhook --project-ref your-project-ref
```

**Environment Variables**:

The following environment variables need to be set for this function to work properly:

```bash
supabase secrets set --env production STRIPE_SECRET_KEY=sk_...
supabase secrets set --env production STRIPE_WEBHOOK_SECRET=whsec_...
```

## Local Development

1. Install the Supabase CLI:

```bash
npm install -g supabase
```

2. Start the local Supabase stack:

```bash
supabase start
```

3. Run a function locally:

```bash
supabase functions serve stripe-webhook
```

4. Test the function with curl or Postman:

```bash
curl -X POST http://localhost:54321/functions/v1/stripe-webhook -H "Content-Type: application/json" -d '{}'
```

## Notes about Edge Functions

- Edge Functions in Supabase use Deno, not Node.js
- Imports are URL-based (e.g., `import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'`)
- No need for package.json or node_modules
- TypeScript is supported out of the box
- Functions can access Supabase services directly using environment variables

For more information, see the [Supabase Edge Functions documentation](https://supabase.com/docs/guides/functions). 