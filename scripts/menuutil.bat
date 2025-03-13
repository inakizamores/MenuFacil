@echo off
setlocal enabledelayedexpansion

:: MenuFacil Utility Script for Windows
:: This script provides utilities for MenuFacil development

:menu
cls
echo ======================================
echo   MenuFacil Developer Utilities
echo ======================================
echo.
echo 1. Create test users
echo 2. Create custom user
echo 3. Setup GitHub secrets
echo 4. Sync Vercel environment variables
echo 5. Exit
echo.
set /p choice=Enter your choice (1-5): 

if "%choice%"=="1" goto create_test_users
if "%choice%"=="2" goto create_custom_user
if "%choice%"=="3" goto setup_github
if "%choice%"=="4" goto sync_vercel
if "%choice%"=="5" goto end
goto menu

:create_test_users
cls
echo ======================================
echo   Create Standard Test Users
echo ======================================
echo.
set /p servicekey=Enter Supabase Service Role Key (or press Enter to use env var): 

if not "%servicekey%"=="" (
    set SUPABASE_SERVICE_ROLE_KEY=%servicekey%
)

echo.
echo Running create-test-users-with-env.js...
node create-test-users-with-env.js
echo.
pause
goto menu

:create_custom_user
cls
echo ======================================
echo   Create Custom User
echo ======================================
echo.
set /p servicekey=Enter Supabase Service Role Key (or press Enter to use env var): 

if not "%servicekey%"=="" (
    set SUPABASE_SERVICE_ROLE_KEY=%servicekey%
)

echo.
echo Running create-user-with-env.js...
node create-user-with-env.js
echo.
pause
goto menu

:setup_github
cls
echo ======================================
echo   Setup GitHub Secrets
echo ======================================
echo.
echo This utility will guide you through setting up GitHub secrets
echo for your MenuFacil repository.
echo.
echo Running setup-github-secrets.js...
node setup-github-secrets.js
echo.
pause
goto menu

:sync_vercel
cls
echo ======================================
echo   Sync Vercel Environment Variables
echo ======================================
echo.
echo This utility will help you sync environment variables to Vercel.
echo.
echo Running sync-vercel-env.js...
node sync-vercel-env.js
echo.
pause
goto menu

:end
echo Exiting MenuFacil Utilities...
endlocal
exit /b 0 