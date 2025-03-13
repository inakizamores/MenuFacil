# Script to set up Vercel environment variables automatically
# This avoids the interactive prompts

# Supabase Configuration
$env:NEXT_PUBLIC_SUPABASE_URL = "https://aejxheybvxbwvjuyfhfh.supabase.co"
$env:NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlanhoZXlidnhid3ZqdXlmaGZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MjQ3OTYsImV4cCI6MjA1NzMwMDc5Nn0.I91NGJDR-xzait4viwqOPPNF_CTdllc54dTTsd7Ll_k"
$env:SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlanhoZXlidnhid3ZqdXlmaGZoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTcyNDc5NiwiZXhwIjoyMDU3MzAwNzk2fQ.H0lvIWA2a6s8NCqgs59qRGuY9l3NzehWmRD0di3pVs4"

# Application Configuration
$env:NEXT_PUBLIC_APP_URL = "https://menufacil.vercel.app"
$env:NEXT_PUBLIC_SUBSCRIPTION_PRICE = "9.99"

# Empty Stripe configuration (to be filled later)
$env:STRIPE_SECRET_KEY = ""
$env:STRIPE_WEBHOOK_SECRET = ""
$env:NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = ""

# Create a temporary .env file
@"
NEXT_PUBLIC_SUPABASE_URL=$env:NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$env:NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$env:SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_APP_URL=$env:NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_SUBSCRIPTION_PRICE=$env:NEXT_PUBLIC_SUBSCRIPTION_PRICE
STRIPE_SECRET_KEY=$env:STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=$env:STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$env:NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
"@ | Set-Content .vercel-env-temp

Write-Host "Setting up Vercel environment variables..."

# Import environment variables all at once
vercel env import .vercel-env-temp

# Remove temporary file
Remove-Item .vercel-env-temp

Write-Host "Environment variables added to Vercel project!"

# Set up GitHub integration
Write-Host "Setting up GitHub integration for automatic deployments..."

# Run vercel git connect command
vercel git connect

Write-Host "Deploying project to Vercel..."
vercel deploy --prod

Write-Host "Deployment complete! Your project should now be live and set up for automatic deployments from GitHub." 