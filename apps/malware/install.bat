@echo off

if exist ".\node_modules\" (
    pause
) else (
    pnpm install
    if %errorlevel% neq 0 (
        exit /b %errorlevel%
    )
)

pause