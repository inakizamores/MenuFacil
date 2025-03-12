#!/bin/bash

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Start Supabase locally
echo "Starting Supabase locally..."
supabase start

# Wait for Supabase to be ready
echo "Waiting for Supabase to be ready..."
sleep 10

# Apply migrations
echo "Applying migrations..."
supabase db reset

# Generate types (optional)
echo "Generating TypeScript types for database schema..."
supabase gen types typescript --local > ./frontend/src/types/supabase.ts

# Display local URLs and keys
echo ""
echo "Supabase Local Development Setup Complete!"
echo ""
echo "Local Supabase URL: http://localhost:54321"
echo "Local Supabase API Key: $(supabase status | grep anon_key | awk '{print $2}')"
echo "Local Supabase JWT Secret: $(supabase status | grep jwt_secret | awk '{print $2}')"
echo ""
echo "Studio URL: http://localhost:54323"
echo ""
echo "To stop Supabase, run: supabase stop"
echo ""
echo "See the docs at: https://supabase.com/docs"
echo "" 