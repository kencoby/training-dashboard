@echo off
cd /d C:\Users\admin\training-dashboard
echo Adding files...
git add functions/ _routes.json index.html
echo Committing...
git commit -m "Add Cloudflare Pages functions + 8 dashboard features (habits, mood, goals, tutoring, wake times, journal prompts, training suggestion, weekly recap)"
echo Pushing...
git push origin main
echo Done!
pause
