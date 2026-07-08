@echo off
cd /d C:\Users\admin\training-dashboard
git add functions/ _routes.json index.html TASKS.md
git diff --cached --quiet
if errorlevel 1 (
    for /f "tokens=1-3 delims=/ " %%a in ("%date%") do set d=%%c-%%b-%%a
    for /f "tokens=1-2 delims=: " %%a in ("%time%") do set t=%%a:%%b
    git commit -m "Auto-deploy %d% %t%"
    git push origin main
) else (
    echo No changes.
)
