# 南瓜仔紙盤（手機版）

香港馬會足球紙盤分析 — 手機優先靜態站（對齊 Figma「南瓜仔紙盤 Mobile」）。

## 手機直接開

**永久（GitHub Pages）：** https://kwunleung291-afk.github.io/pumpkin-hkjc-web/

首次請喺 [Settings → Pages](https://github.com/kwunleung291-afk/pumpkin-hkjc-web/settings/pages) 將 Source 設為 **GitHub Actions**（只需一次）。之後每次紙盤掃描 push 會自動刷新。

自包含 `index.html`（內嵌 CSS / JS / 最新 data）。**唔好用** jsDelivr / raw GitHub 開 `.html`（會顯示源碼）。

## 畫面

- **今日建議**：每場一張卡，含投注、信心／紙注、**分析總結**（模型＋莊家視角＋關鍵訊號）
- **覆盤**：命中率、紙注損益、逐場結算

## 檔案

| 檔案 | 用途 |
|------|------|
| `index.html` | **手機推薦首頁**（自包含） |
| `index.standalone.html` | 單檔備份 |
| `styles.css` + `app.js` + `data.json` | 模組版資產 |
| `.github/workflows/pages.yml` | GitHub Pages 自動部署 |
| `vercel.json` | 短 cache headers（可選） |

**免責**：紙盤分析，唔係投注建議。估計機率唔保證命中。18歲以下唔准。請理性博彩。
