# Deploy notes — 持續更新

## Public phone URL（推薦）

**https://cdn.jsdelivr.net/gh/kwunleung291-afk/pumpkin-hkjc-web@main/index.standalone.html**

來源 repo：https://github.com/kwunleung291-afk/pumpkin-hkjc-web

## 刷新流程（紙盤 → 網站）

```bash
cd /workspace/pumpkin-hkjc
# 完整掃描（結尾會 export_web + 嘗試 deploy_web）
PUMPKIN_DEPLOY_WEB=1 python3 -m src.run_screen --hours 6

# 或者只刷新網站資料再部署：
python3 -m src.export_web
PUMPKIN_DEPLOY_WEB=1 python3 -m src.deploy_web
```

- `export_web`：由 `reports/screen-latest.json` + 覆盤 JSON 寫入 `web/data.json` 同 `index.standalone.html`
- `deploy_web`：用 `gh` push 到 `kwunleung291-afk/pumpkin-hkjc-web@main`
  - 若 `gh` 未登入：印出 MCP 清單，由 parent 用 GitHub MCP `push_files` 推送
  - 關閉：`PUMPKIN_DEPLOY_WEB=0`

## jsDelivr 注意

- `@main` 通常幾分鐘內刷新；急用可 pin commit SHA
- 強制刷新：`https://cdn.jsdelivr.net/gh/kwunleung291-afk/pumpkin-hkjc-web@main/index.standalone.html?v=<timestamp>`

## Vercel / GitHub Pages（可選）

- Vercel：`cd web && vercel --prod`（需 login）
- Pages：repo 已有 `.github/workflows/pages.yml`；Settings → Pages → Source = Actions
