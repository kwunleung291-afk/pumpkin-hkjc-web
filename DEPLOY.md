# Deploy notes — 持續更新

## Public phone URL（推薦）

**https://kwunleung291-afk.github.io/pumpkin-hkjc-web/**

來源 repo：https://github.com/kwunleung291-afk/pumpkin-hkjc-web

> 唔好用 jsDelivr / raw.githubusercontent 開 `.html` — 佢哋會用 `text/plain`，手機見到源碼而唔係網頁。

## 刷新流程（紙盤 → 網站）

```bash
cd /workspace/pumpkin-hkjc
# 完整掃描（結尾會 export_web + 嘗試 deploy_web）
PUMPKIN_DEPLOY_WEB=1 python3 -m src.run_screen --hours 6

# 或者只刷新網站資料再部署：
python3 -m src.export_web
PUMPKIN_DEPLOY_WEB=1 python3 -m src.deploy_web
```

- `export_web`：由 `reports/screen-latest.json` + 覆盤 JSON 寫入 `web/data.json`、`index.standalone.html`，並將同一份自包含內容寫入 `index.html`（Pages 首頁）
- `deploy_web`：用 `gh` push 到 `kwunleung291-afk/pumpkin-hkjc-web@main`
  - 若 `gh` 未登入：印出 MCP 清單，由 parent 用 GitHub MCP `push_files` 推送
  - 關閉：`PUMPKIN_DEPLOY_WEB=0`
- Push 後 GitHub Actions workflow `.github/workflows/pages.yml` 會部署 Pages（`configure-pages` 設咗 `enablement: true`）

## GitHub Pages

- 目標：https://kwunleung291-afk.github.io/pumpkin-hkjc-web/
- Source：GitHub Actions（workflow 會嘗試自動 enable）
- 若 Actions 仍然失敗：Repo → Settings → Pages → Source = **GitHub Actions**，再 re-run workflow

## Vercel（可選）

- `cd web && vercel --prod`（需 login）
