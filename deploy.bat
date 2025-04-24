@echo off
REM Deployment script for Benz Scribe Creative Craft on Windows

echo ========================================================
echo         Benz Scribe Creative Craft Deployment           
echo ========================================================
echo.

REM Check if Docker is installed
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker is not installed. Please install Docker first.
    goto :EOF
)

REM Check if Docker Compose is installed
where docker-compose >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Docker Compose is not installed. Some deployment options may not work.
)

REM Menu for deployment options
echo Select a deployment option:
echo 1) Build and run locally with Docker
echo 2) Build for production (creates dist folder)
echo 3) Docker Compose (app + mock proxy)
echo 4) Start mock proxy only
echo 5) Exit

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    echo [INFO] Building and running the application with Docker...
    docker build -t benz-scribe-app .
    if %ERRORLEVEL% EQU 0 (
        echo [SUCCESS] Docker image built successfully!
        echo [INFO] Starting the container...
        docker run -p 8080:80 benz-scribe-app
    ) else (
        echo [ERROR] Docker build failed!
    )
) else if "%choice%"=="2" (
    echo [INFO] Building for production...
    call npm run build
    if %ERRORLEVEL% EQU 0 (
        echo [SUCCESS] Build successful! Files are in the 'dist' folder.
        echo [INFO] You can deploy these files to any static web server.
    ) else (
        echo [ERROR] Build failed!
    )
) else if "%choice%"=="3" (
    echo [INFO] Starting the application with Docker Compose...
    docker-compose up --build
) else if "%choice%"=="4" (
    echo [INFO] Starting the mock proxy server...
    node src/services/simple-proxy.cjs
) else if "%choice%"=="5" (
    echo [INFO] Exiting...
    goto :EOF
) else (
    echo [ERROR] Invalid choice!
    goto :EOF
)

echo [SUCCESS] Deployment script completed! 