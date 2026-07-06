@echo off
cd /d "C:\Users\admin\training-dashboard"

:: Check remote is configured
git remote get-url origin >nul 2>&1
if errorlevel 1 (
  echo ERROR: No GitHub remote set up yet.
  echo Run setup-github.bat first to connect this folder to GitHub.
  pause
  exit /b 1
)

:: Stage everything
git add .

:: Check if there's anything to commit
git diff --cached --quiet
if errorlevel 1 (
  :: There are changes — commit with timestamp
  for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set dt=%%I
  git commit -m "Dashboard update %dt:~6,2%/%dt:~4,2%/%dt:~0,4% %dt:~8,2%:%dt:~10,2%"
  git push origin main
  echo.
  echo Done! Netlify will be live in ~30 seconds.
  echo https://training-dashboard-philipc.netlify.app
) else (
  echo No changes to deploy.
)

pause
