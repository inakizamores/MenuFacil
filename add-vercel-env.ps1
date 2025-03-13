# Script to set up Vercel environment variables one by one

# This function adds an environment variable to all environments (development, preview, production)
function Add-VercelEnv {
    param (
        [string]$Name,
        [string]$Value
    )
    
    if ([string]::IsNullOrEmpty($Value)) {
        Write-Host "Skipping empty variable: $Name"
        return
    }
    
    Write-Host "Adding $Name to all environments..."
    
    # Add to development
    echo "$Value" | vercel env add $Name development
    
    # Add to preview
    echo "$Value" | vercel env add $Name preview
    
    # Add to production
    echo "$Value" | vercel env add $Name production
}

# Supabase Configuration
Add-VercelEnv -Name "NEXT_PUBLIC_SUPABASE_URL" -Value "https://aejxheybvxbwvjuyfhfh.supabase.co"
Add-VercelEnv -Name "NEXT_PUBLIC_SUPABASE_ANON_KEY" -Value "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlanhoZXlidnhid3ZqdXlmaGZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3MjQ3OTYsImV4cCI6MjA1NzMwMDc5Nn0.I91NGJDR-xzait4viwqOPPNF_CTdllc54dTTsd7Ll_k"
Add-VercelEnv -Name "SUPABASE_SERVICE_ROLE_KEY" -Value "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlanhoZXlidnhid3ZqdXlmaGZoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MTcyNDc5NiwiZXhwIjoyMDU3MzAwNzk2fQ.H0lvIWA2a6s8NCqgs59qRGuY9l3NzehWmRD0di3pVs4"

# Application Configuration
Add-VercelEnv -Name "NEXT_PUBLIC_APP_URL" -Value "https://menufacil.vercel.app"
Add-VercelEnv -Name "NEXT_PUBLIC_SUBSCRIPTION_PRICE" -Value "9.99"

Write-Host "Environment variables added to Vercel project!"

# Clean up
Remove-Item .vercel-env-temp -ErrorAction SilentlyContinue

# Set up GitHub integration
Write-Host "Setting up GitHub integration for automatic deployments..."
vercel git connect https://github.com/inakizamores/MenuFacil.git

# Deploy
Write-Host "Deploying project to Vercel..."
vercel --prod 