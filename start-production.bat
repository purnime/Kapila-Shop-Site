@echo off
echo Building the project for production...
npm run build
if %ERRORLEVEL% NEQ 0 (
    echo Build failed!
    pause
    exit /b %ERRORLEVEL%
)
echo.
echo Starting the production server...
echo Access your app at http://localhost:3000
echo.
node server/server.js
pause
