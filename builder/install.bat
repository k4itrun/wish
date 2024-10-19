@echo off

if exist ".\node_modules\" (
    pause
) else (
    npm run install 
    if %errorlevel% neq 0 (
        exit /b %errorlevel%
    )
)

pause