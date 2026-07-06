@echo off
cd /d "C:\Users\admin\training-dashboard"
echo =====================================================
echo  One-time GitHub setup for Philip's Training Dashboard
echo =====================================================
echo.
echo Step 1: Go to https://github.com/new and create a
echo         NEW PRIVATE repository called: training-dashboard
echo         (leave it completely empty - no README, no .gitignore)
echo.
echo Step 2: Copy the repository URL (looks like:
echo         https://github.com/YOUR-USERNAME/training-dashboard.git)
echo.
echo Step 3: Paste it below and press Enter.
echo.
set /p REPO_URL=GitHub repo URL:

if "%REPO_URL%"=="" (
  echo No URL entered. Exiting.
  pause
  exit /b 1
)

git remote add origin %REPO_URL%
git branch -M main
git add .
git commit -m "Initial deploy"
git push -u origin main

echo.
echo =====================================================
echo  All done! From now on just double-click deploy.bat
echo =====================================================
echo.
echo Now go to Netlify ^> your site ^> Site configuration
echo ^> Build ^& deploy ^> Link to Git repository
echo and connect it to the GitHub repo you just created.
echo.
pause
