#!/bin/bash

# MenuFacil Utility Script for Linux/macOS
# This script provides utilities for MenuFacil development

# Make sure script is executable
if [ ! -x "$0" ]; then
  chmod +x "$0"
fi

# Function to display menu
show_menu() {
  clear
  echo "======================================"
  echo "  MenuFacil Developer Utilities"
  echo "======================================"
  echo ""
  echo "1. Create test users"
  echo "2. Create custom user"
  echo "3. Setup GitHub secrets"
  echo "4. Sync Vercel environment variables"
  echo "5. Exit"
  echo ""
  echo -n "Enter your choice (1-5): "
}

# Function to create test users
create_test_users() {
  clear
  echo "======================================"
  echo "  Create Standard Test Users"
  echo "======================================"
  echo ""
  
  read -p "Enter Supabase Service Role Key (or press Enter to use env var): " servicekey
  
  if [ -n "$servicekey" ]; then
    export SUPABASE_SERVICE_ROLE_KEY="$servicekey"
  fi
  
  echo ""
  echo "Running create-test-users-with-env.js..."
  node create-test-users-with-env.js
  
  echo ""
  read -p "Press Enter to continue..."
}

# Function to create custom user
create_custom_user() {
  clear
  echo "======================================"
  echo "  Create Custom User"
  echo "======================================"
  echo ""
  
  read -p "Enter Supabase Service Role Key (or press Enter to use env var): " servicekey
  
  if [ -n "$servicekey" ]; then
    export SUPABASE_SERVICE_ROLE_KEY="$servicekey"
  fi
  
  echo ""
  echo "Running create-user-with-env.js..."
  node create-user-with-env.js
  
  echo ""
  read -p "Press Enter to continue..."
}

# Function to setup GitHub
setup_github() {
  clear
  echo "======================================"
  echo "  Setup GitHub Secrets"
  echo "======================================"
  echo ""
  echo "This utility will guide you through setting up GitHub secrets"
  echo "for your MenuFacil repository."
  echo ""
  echo "Running setup-github-secrets.js..."
  node setup-github-secrets.js
  
  echo ""
  read -p "Press Enter to continue..."
}

# Function to sync Vercel env vars
sync_vercel() {
  clear
  echo "======================================"
  echo "  Sync Vercel Environment Variables"
  echo "======================================"
  echo ""
  echo "This utility will help you sync environment variables to Vercel."
  echo ""
  echo "Running sync-vercel-env.js..."
  node sync-vercel-env.js
  
  echo ""
  read -p "Press Enter to continue..."
}

# Main menu loop
while true; do
  show_menu
  read choice
  
  case $choice in
    1) create_test_users ;;
    2) create_custom_user ;;
    3) setup_github ;;
    4) sync_vercel ;;
    5) 
      echo "Exiting MenuFacil Utilities..."
      exit 0
      ;;
    *) 
      echo "Invalid option. Press Enter to continue..."
      read
      ;;
  esac
done 