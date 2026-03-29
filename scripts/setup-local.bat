@echo off
TITLE Prompt Commerce Gateway - Local Setup
SET DIR=%~dp0..\

echo.
echo   Prompt Commerce Gateway - Local Setup (Docker Postgres)
echo   ---------------------------------------------------------
echo.

:: ── .env ─────────────────────────────────────────────────────────────────────
IF NOT EXIST "%DIR%.env" (
    echo Creating .env with local defaults...
    (
        echo DATABASE_URL=postgresql://postgres:postgres@localhost:5433/pc_gateway
        echo DIRECT_DATABASE_URL=postgresql://postgres:postgres@localhost:5433/pc_gateway
        echo GATEWAY_PORT=3002
        echo JWT_SECRET=change-me-to-a-long-random-string
        echo JWT_EXPIRES_IN=1d
        echo ADMIN_USERNAME=admin
        echo ADMIN_PASSWORD=admin123
        echo UPLOAD_DIR=./uploads
    ) > "%DIR%.env"
    echo .env created.
) ELSE (
    echo .env already exists.
)

:: ── npm install ───────────────────────────────────────────────────────────────
IF NOT EXIST "%DIR%node_modules" (
    echo Installing dependencies...
    cd /d "%DIR%" && call npm install
)

:: ── Docker Postgres ───────────────────────────────────────────────────────────
echo Starting Docker Postgres...
docker compose up postgres -d

echo Waiting for Postgres to be ready (10s)...
timeout /t 10 /nobreak >nul

:: ── Prisma generate + migrate dev + seed ─────────────────────────────────────
echo Generating Prisma client...
call npx prisma generate

echo Running migrations (prisma migrate dev)...
call npx prisma migrate dev --name init

echo Seeding database...
call npx ts-node prisma/seed.ts

echo.
echo   =========================================
echo     Local setup complete!
echo     Next step: dev.bat
echo     Gateway:   http://localhost:3002
echo   =========================================
echo.
pause
