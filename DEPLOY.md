# Deploy notes

## Public phone URL（推薦）

**https://cdn.jsdelivr.net/gh/kwunleung291-afk/pumpkin-hkjc-web@main/index.standalone.html**

- 單檔 HTML，手機瀏覽器直接開
- 來源 repo：https://github.com/kwunleung291-afk/pumpkin-hkjc-web
- 模組版（同 CDN）：https://cdn.jsdelivr.net/gh/kwunleung291-afk/pumpkin-hkjc-web@main/index.html

## Vercel

- 匿名 `vercel deploy --temporary`：約 60 分鐘過期，要 claim 先至保留
- 長久 `*.vercel.app` 需要 `vercel login` 之後 `cd web && vercel --prod`

## GitHub Pages

Workflow 已加（`.github/workflows/pages.yml`）。若 Actions 因 Pages 未啟用而失敗，到 repo Settings → Pages → Source = GitHub Actions 開一次即可，之後 URL：

`https://kwunleung291-afk.github.io/pumpkin-hkjc-web/`

## Refresh after screen

```bash
cd /workspace/pumpkin-hkjc
python3 -m src.run_screen     # 結尾會 refresh web/data.json + standalone
# 或只刷新網站資料：
python3 -m src.export_web
# 再 push web/ 到 GitHub（MCP push_files 或 git）
```
