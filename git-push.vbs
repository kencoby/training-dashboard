Set oShell = CreateObject("WScript.Shell")
ret = oShell.Run("cmd /c cd /d C:\Users\admin\training-dashboard && git add -A && git diff --cached --quiet || (git commit -m ""Home: fix 2-col grid overflow on mobile, equal-fraction columns"" && git push origin main) 2>&1", 1, True)
MsgBox "Git push finished (exit code: " & ret & "). Check Cloudflare Pages for deployment.", 64, "Push Done"
