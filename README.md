# 南瓜仔紙盤（手機版）

香港馬會足球紙盤分析 — 手機優先靜態站（對齊 Figma「南瓜仔紙盤 Mobile」）。

## 手機直接開（持續更新）

https://cdn.jsdelivr.net/gh/kwunleung291-afk/pumpkin-hkjc-web@main/index.standalone.html

- 單檔 HTML，內嵌最新 `data.json`
- 每次紙盤掃描後會 export + push 呢個 repo 嘅 `main`，jsDelivr 跟住刷新
- 若 CDN 未更新，可用 commit pin（例）：`https://cdn.jsdelivr.net/gh/kwunleung291-afk/pumpkin-hkjc-web@60b27d3efa31/index.standalone.html`

模組版：https://cdn.jsdelivr.net/gh/kwunleung291-afk/pumpkin-hkjc-web@main/index.html

## 畫面

- **今日建議**：每場一張卡，含投注、信心／紙注、**分析總結**（模型＋莊家視角＋關鍵訊號）
- **覆盤**：命中率、紙注損益、逐場結算

## 檔案

| 檔案 | 用途 |
|------|------|
| `index.standalone.html` | 手機推薦（單檔） |
| `index.html` + `styles.css` + `app.js` + `data.json` | 模組版 |
| `vercel.json` | 短 cache headers |

**免責**：紙盤分析，唔係投注建議。估計機率唔保證命中。18歲以下唔准。請理性博彩。
