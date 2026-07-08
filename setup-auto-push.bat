@echo off
echo Setting up auto-push scheduled task...
schtasks /create /tn "TrainingDashboardAutoPush" /tr "C:\Users\admin\training-dashboard\auto-push.bat" /sc minute /mo 3 /ru "%USERNAME%" /f
if errorlevel 1 (
    echo Failed to create task. Try running as Administrator.
) else (
    echo Done! Dashboard will auto-push to GitHub every 3 minutes when there are changes.
)
pause
