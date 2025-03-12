@echo off
setlocal enabledelayedexpansion

REM Check if supabase CLI is installed
where supabase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Supabase CLI is not installed. Please install it first:
    echo npm install -g supabase
    exit /b 1
)

REM Start Supabase locally
echo Starting Supabase locally...
supabase start

REM Wait for Supabase to be ready
echo Waiting for Supabase to be ready...
timeout /t 10 /nobreak > nul

REM Apply migrations
echo Applying migrations...
supabase db reset

REM Generate types (optional)
echo Generating TypeScript types for database schema...
if not exist "frontend\src\types" mkdir "frontend\src\types"
supabase gen types typescript --local > frontend\src\types\supabase.ts

REM Display local URLs and keys
echo.
echo Supabase Local Development Setup Complete!
echo.
echo Local Supabase URL: http://localhost:54321
echo Local Supabase API Key: 
for /f "tokens=2" %%a in ('supabase status ^| findstr "anon_key"') do echo %%a
echo.
echo Studio URL: http://localhost:54323
echo.
echo To stop Supabase, run: supabase stop
echo.
echo See the docs at: https://supabase.com/docs
echo. 