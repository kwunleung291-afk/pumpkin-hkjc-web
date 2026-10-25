# Deploy notes — 持續更新

## Public phone URL

### 目標（永久）
**https://kwunleung291-afk.github.io/pumpkin-hkjc-web/**

首次要用 GitHub Pages 前，喺 repo 開一次（Actions token **唔可以**自己 create Pages site）：

1. 開 https://github.com/kwunleung291-afk/pumpkin-hkjc-web/settings/pages  
2. **Build and deployment → Source** 選 **GitHub Actions**  
3. 之後每次 push `main` 會自動部署（`.github/workflows/pages.yml`，`enablement: true`）

### 臨時（已驗證 `text/html`）
匿名 Vercel prebuilt（約 60 分鐘到期，除非 claim）：

- Site: https://prompt-pearl-5lywvd9.tmp.now/
- Claim: https://vercel.com/claim-deployment?code=b21fdf47-9816-4cd1-ad2a-c030c5c84d8d

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

- `export_web`：寫 `web/data.json`，並把自包含 HTML 寫入 `index.standalone.html` **同** `index.html`（Pages 首頁）
- `deploy_web`：`gh` push 到 `kwunleung291-afk/pumpkin-hkjc-web@main`；未登入則印 MCP `push_files` 清單
- 關閉：`PUMPKIN_DEPLOY_WEB=0`

## 驗證

```bash
curl -sI https://kwunleung291-afk.github.io/pumpkin-hkjc-web/ | grep -i content-type
# 期望: content-type: text/html
```
