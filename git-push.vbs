Set oShell = CreateObject("WScript.Shell")
ret = oShell.Run("cmd /c cd /d C:\Users\admin\training-dashboard && git add -A && git diff --cached --quiet || (git commit -m ""Home mobile: allow vertical scroll in daily section, block horizontal"" && git push origin main) 2>&1", 1, True)
MsgBox "Git push finished (exit code: " & ret & "). Check Cloudflare Pages for deployment.", 64, "Push Done"
