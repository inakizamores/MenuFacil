@echo off
echo MenúFácil - User Creation Script
echo ==============================
echo.

if "%1"=="" (
    echo Choose an option:
    echo 1 - Create standard test users ^(test@example.com, restaurant@example.com, admin@example.com^)
    echo 2 - Create a custom user
    echo.
    set /p option="Enter option (1 or 2): "
) else (
    set option=%1
)

echo.
echo Enter your Supabase service role key:
echo ^(You can find this in your Supabase dashboard under Project Settings ^> API^)
set /p SUPABASE_SERVICE_ROLE_KEY="Supabase Service Role Key: "

if "%option%"=="1" (
    echo.
    echo Creating standard test users...
    node create-test-users-with-env.js
) else if "%option%"=="2" (
    echo.
    echo Creating a custom user...
    node create-user-with-env.js
) else (
    echo.
    echo Invalid option. Please try again.
    exit /b 1
)

echo.
echo Script completed.
pause 