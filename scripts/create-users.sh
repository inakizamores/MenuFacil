#!/bin/bash

echo "MenúFácil - User Creation Script"
echo "=============================="
echo

if [ -z "$1" ]; then
    echo "Choose an option:"
    echo "1 - Create standard test users (test@example.com, restaurant@example.com, admin@example.com)"
    echo "2 - Create a custom user"
    echo
    read -p "Enter option (1 or 2): " option
else
    option=$1
fi

echo
echo "Enter your Supabase service role key:"
echo "(You can find this in your Supabase dashboard under Project Settings > API)"
read -p "Supabase Service Role Key: " SUPABASE_SERVICE_ROLE_KEY
export SUPABASE_SERVICE_ROLE_KEY

if [ "$option" = "1" ]; then
    echo
    echo "Creating standard test users..."
    node create-test-users-with-env.js
elif [ "$option" = "2" ]; then
    echo
    echo "Creating a custom user..."
    node create-user-with-env.js
else
    echo
    echo "Invalid option. Please try again."
    exit 1
fi

echo
echo "Script completed."
read -p "Press Enter to continue..." 