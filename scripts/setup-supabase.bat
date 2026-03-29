@echo off
TITLE Prompt Commerce Gateway - Supabase Setup
SET DIR=%~dp0..\

echo.
echo   Prompt Commerce Gateway - Supabase Setup
echo   ------------------------------------------
echo.
echo   You need two connection strings from your Supabase dashboard:
echo   Dashboard - Settings - Database - Connection string
echo.
echo   DATABASE_URL      = Transaction pooler (port 6543) - runtime
echo   DIRECT_DATABASE_URL = Direct connection (port 5432) - migrations
echo.

:: ── Collect URLs ─────────────────────────────────────────────────────────────
SET /P DB_URL="Paste DATABASE_URL (pooler, port 6543): "
IF "%DB_URL%"=="" (
    echo DATABASE_URL is required.
    pause & exit /b 1
)

SET /P DIRECT_URL="Paste DIRECT_DATABASE_URL (direct, port 5432): "
IF "%DIRECT_URL%"=="" (
    echo DIRECT_DATABASE_URL is required.
    pause & exit /b 1
)

:: ── Write .env ────────────────────────────────────────────────────────────────
IF NOT EXIST "%DIR%.env" (
    echo Creating .env from supabase template...
    (
        echo DATABASE_URL=%DB_URL%
        echo DIRECT_DATABASE_URL=%DIRECT_URL%
        echo GATEWAY_PORT=3002
        echo JWT_SECRET=REPLACE_WITH_LONG_RANDOM_STRING
        echo JWT_EXPIRES_IN=7d
        echo ADMIN_USERNAME=admin
        echo ADMIN_PASSWORD=REPLACE_WITH_STRONG_PASSWORD
        echo UPLOAD_DIR=./uploads
    ) > "%DIR%.env"
) ELSE (
    echo Updating DATABASE_URL and DIRECT_DATABASE_URL in existing .env...
    :: Use PowerShell to safely update the .env file
    powershell -Command "(Get-Content '%DIR%.env') | ForEach-Object { $_ -replace '^DATABASE_URL=.*', 'DATABASE_URL=%DB_URL%' -replace '^DIRECT_DATABASE_URL=.*', 'DIRECT_DATABASE_URL=%DIRECT_URL%' } | Set-Content '%DIR%.env'"
)

echo .env updated.
echo.
echo IMPORTANT: Open .env and set a strong JWT_SECRET and ADMIN_PASSWORD before going live!
echo.

:: ── npm install ───────────────────────────────────────────────────────────────
IF NOT EXIST "%DIR%node_modules" (
    echo Installing dependencies...
    cd /d "%DIR%" && call npm install
)

:: ── Prisma generate + migrate deploy + seed ───────────────────────────────────
echo Generating Prisma client...
call npx prisma generate

echo Deploying migrations to Supabase...
call npx prisma migrate deploy

echo Seeding database...
call npx ts-node prisma/seed.ts

echo.
echo   =========================================
echo     Supabase setup complete!
echo     Next step: npm start  (or pm2)
echo   =========================================
echo.
pause
