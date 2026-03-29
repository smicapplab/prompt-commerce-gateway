@echo off
TITLE Prompt Commerce Gateway - Dev Launcher
SET DIR=%~dp0..\

echo.
echo   Prompt Commerce Gateway - Dev Launcher
echo   ----------------------------------------
echo   First time? Run setup-local.bat (Docker) or setup-supabase.bat first.
echo.

:: ── .env check ───────────────────────────────────────────────────────────────
IF NOT EXIST "%DIR%.env" (
    echo [error] .env not found.
    echo Run setup-local.bat or setup-supabase.bat first.
    pause
    exit /b 1
)

:: ── npm install ───────────────────────────────────────────────────────────────
IF NOT EXIST "%DIR%node_modules" (
    echo Installing gateway dependencies...
    cd /d "%DIR%" && call npm install
)

:: ── Docker Postgres ───────────────────────────────────────────────────────────
echo Starting gateway Postgres (Docker)...
docker compose up postgres -d

echo Waiting for Postgres to be ready...
timeout /t 5 /nobreak >nul

:: ── Prisma generate + migrate ─────────────────────────────────────────────────
echo Generating Prisma client...
call npx prisma generate

echo Applying pending migrations...
call npx prisma migrate deploy

:: ── Start server ──────────────────────────────────────────────────────────────
echo Starting Gateway Server (port 3002)...
npm run dev

echo.
echo   Gateway API   - http://localhost:3002
echo   MCP SSE Hub   - http://localhost:3002/sse
echo.
