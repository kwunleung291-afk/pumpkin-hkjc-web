# Deploy notes

## Public URLs
- **Primary (CDN, permanent):** https://cdn.jsdelivr.net/gh/kwunleung291-afk/pumpkin-hkjc-web@main/index.standalone.html
- Repo: https://github.com/kwunleung291-afk/pumpkin-hkjc-web
- Vercel anonymous temp expires ~60m; claim via claim URL after `vercel deploy --temporary`
- Vercel login required for lasting `*.vercel.app` — run `vercel login` then `cd web && vercel --prod`

## Refresh after screen
```bash
cd /workspace/pumpkin-hkjc
python3 -m src.run_screen          # also refreshes web/data.json
# or just:
python3 -m src.export_web
# rebuild standalone + push to GitHub
python3 - <<'PY'
from pathlib import Path
# (or re-run the standalone builder in export / scripts)
PY
```
