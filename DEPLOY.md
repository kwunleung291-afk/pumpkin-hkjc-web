# Deploy notes — 持續更新

## Public phone URL（真正網站，唔係源碼）

### 推薦（即開即用）
**https://raw.githack.com/kwunleung291-afk/pumpkin-hkjc-web/main/index.html**

- `Content-Type: text/html`（已驗證）
- 跟 `pumpkin-hkjc-web@main` 刷新；CDN 約 1 分鐘內更新

### 永久用戶站（GitHub user Pages）
**https://kwunleung291-afk.github.io/**

- repo：`kwunleung291-afk/kwunleung291-afk.github.io`（根目錄 `index.html`）
- 每次掃盤部署會同步推呢度

### 專案 Pages（可選）
https://kwunleung291-afk.github.io/pumpkin-hkjc-web/  
（要喺該 repo Settings → Pages 揀 GitHub Actions 先會活；唔使開都得，上面兩條已可用）

> **唔好用** jsDelivr / raw.githubusercontent 開 `.html` — `Content-Type: text/plain`，手機會見到源碼。

來源 repo：https://github.com/kwunleung291-afk/pumpkin-hkjc-web

## 刷新流程（紙盤 → 網站）

```bash
cd /workspace/pumpkin-hkjc
PUMPKIN_DEPLOY_WEB=1 python3 -m src.run_screen --hours 6

# 或者只刷新網站資料再部署：
python3 -m src.export_web
PUMPKIN_DEPLOY_WEB=1 python3 -m src.deploy_web
```

- `export_web`：寫 `web/data.json`，並把自包含 HTML 寫入 `index.standalone.html` **同** `index.html`
- `deploy_web`：push 到 `pumpkin-hkjc-web@main`，並同步 standalone `index.html` 到 `kwunleung291-afk.github.io@main`；未登入 `gh` 則印 MCP `push_files` 清單
- 關閉：`PUMPKIN_DEPLOY_WEB=0`

## 驗證

```bash
curl -sI https://raw.githack.com/kwunleung291-afk/pumpkin-hkjc-web/main/index.html | grep -i content-type
# 期望: content-type: text/html

curl -sI https://kwunleung291-afk.github.io/ | grep -i content-type
# 期望: content-type: text/html
```
