@echo off
cd /d "C:\Users\admin\training-dashboard"
echo Untracking netlify.toml and netlify/functions (Cloudflare Pages only from now on)...
git rm -r --cached netlify.toml netlify >nul 2>&1
git add .gitignore
git commit -m "Stop tracking Netlify config/functions - Cloudflare Pages only"
git push origin main
echo.
echo Done. netlify.toml and netlify/ are still on disk but no longer tracked by git.
echo You can delete them (and the .netlify folder) by hand if you want them gone entirely.
pause
