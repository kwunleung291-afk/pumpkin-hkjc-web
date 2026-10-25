(function () {
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function statusClass(settlement) {
    if (settlement === "HIT") return "status-hit";
    if (settlement === "MISS") return "status-miss";
    return "status-pending";
  }

  function confClass(c) {
    const k = String(c || "").toLowerCase();
    if (k === "high") return "conf-high";
    if (k === "low") return "conf-low";
    return "conf-medium";
  }

  function pct(n) {
    if (n == null || Number.isNaN(Number(n))) return "—";
    return (Number(n) * 100).toFixed(1) + "%";
  }

  function renderTips(tips) {
    const root = $("#tips-list");
    if (!tips.length) {
      root.innerHTML = '<div class="empty">暫時未有建議</div>';
      return;
    }
    root.innerHTML = tips
      .map((t) => {
        const odds = t.hkjc_odds != null ? `@ ${esc(t.hkjc_odds)}` : "";
        const prob =
          t.est_prob_pct != null ? `估計 ${esc(t.est_prob_pct)}%` : "";
        const lineBits = [t.pick_line, odds, prob].filter(Boolean).join(" · ");
        const cites = ((t.signals && t.signals.cites) || []).map(
          (c) => `<li>${esc(c)}</li>`
        );
        const narrative = (t.narrative_cites || []).map(
          (c) => `<li>${esc(c)}</li>`
        );
        const bk = t.bookmaker_angle || {};
        const live =
          t.live_score != null
            ? `<div class="result">即時比分 ${esc(t.live_score)}</div>`
            : "";
        const ft =
          t.ft_score != null
            ? `<div class="result">完場 ${esc(t.ft_score)}${
                t.corners ? `｜角球 ${esc(t.corners)}` : ""
              }</div>`
            : "";
        return `<article class="card" data-id="${esc(t.front_end_id)}">
  <div class="card-head">
    <div class="kick">${esc(t.kickoff_hkt)} HKT</div>
    <div class="idpill">${esc(t.front_end_id)}</div>
  </div>
  <div class="tour">${esc(t.tournament)}</div>
  <div class="teams">${esc(t.home.ch)} vs ${esc(t.away.ch)}</div>
  <div class="pick">
    <div class="pick-main">${esc(lineBits)}</div>
    <div class="pick-sub">${esc(t.prob_label || "")}</div>
  </div>
  <div class="row">
    <span class="pill ${confClass(t.confidence)}">信心 ${esc(
          t.confidence_zh || t.confidence || "—"
        )}</span>
    <span class="pill">紙注 ${esc(t.stake ?? "—")}</span>
    ${
      t.edge_pp != null
        ? `<span class="pill">邊 ${esc(Number(t.edge_pp).toFixed(1))}pp</span>`
        : ""
    }
    <span class="pill ${statusClass(t.settlement)}">${esc(
          t.status_zh || "待結"
        )}</span>
  </div>
  ${live}${ft}
  <div class="summary">
    <h3>分析總結</h3>
    <p>${esc(t.summary)}</p>
  </div>
  <details class="more">
    <summary>詳細</summary>
    <div class="more-body">
      <dl>
        <dt>理由</dt>
        <dd>${esc(t.why || "—")}</dd>
        <dt>莊家視角</dt>
        <dd>${esc(bk.intent || "—")}${
          bk.brief_zh ? " — " + esc(bk.brief_zh) : ""
        }</dd>
        <dt>訊號</dt>
        <dd>${
          cites.length ? `<ul>${cites.join("")}</ul>` : "—"
        }</dd>
        ${
          narrative.length
            ? `<dt>敘事引用</dt><dd><ul>${narrative.join("")}</ul></dd>`
            : ""
        }
        ${
          t.form
            ? `<dt>近況</dt><dd>主 ${esc(t.form[0] || "—")}／客 ${esc(
                t.form[1] || "—"
              )}</dd>`
            : ""
        }
        ${
          t.h2h_summary
            ? `<dt>對賽</dt><dd>主勝${esc(t.h2h_summary[0])}／和${esc(
                t.h2h_summary[1]
              )}／客勝${esc(t.h2h_summary[2])}</dd>`
            : ""
        }
        ${
          t.review_zh
            ? `<dt>覆盤備註</dt><dd>${esc(t.review_zh)}</dd>`
            : ""
        }
      </dl>
    </div>
  </details>
</article>`;
      })
      .join("");
  }

  function renderReview(data) {
    const s = data.settlement_summary;
    const hero = $("#review-hero");
    const list = $("#review-list");
    const patterns = $("#review-patterns");
    if (!s) {
      hero.innerHTML = "";
      patterns.innerHTML = "";
      list.innerHTML = '<div class="empty">尚未有覆盤資料</div>';
      return;
    }
    hero.innerHTML = `
      <div class="statbox"><div class="n">${esc(pct(s.hit_rate))}</div><div class="l">命中率（已結）</div></div>
      <div class="statbox"><div class="n">${esc(s.n_hit)}/${esc(
      s.n_settled
    )}</div><div class="l">中／已結</div></div>
      <div class="statbox"><div class="n">${esc(s.paper_pnl)}</div><div class="l">紙注損益</div></div>
      <div class="statbox"><div class="n">${esc(s.n_pending)}</div><div class="l">待結</div></div>
    `;
    const bm = s.by_market || {};
    const bmLines = Object.keys(bm)
      .map((k) => {
        const x = bm[k];
        return `<li>${esc(k)}：${esc(x.hit)}/${esc(x.n)}（${esc(
          pct(x.hit_rate)
        )}）</li>`;
      })
      .join("");
    const errs = (s.error_patterns || [])
      .map((e) => `<li>${esc(e)}</li>`)
      .join("");
    patterns.innerHTML = `<div class="patterns">
      <h3>分盤表現</h3>
      <ul>${bmLines || "<li>—</li>"}</ul>
      ${
        errs
          ? `<h3 style="margin-top:10px">誤差模式</h3><ul>${errs}</ul>`
          : ""
      }
      <div style="margin-top:8px;color:var(--muted);font-size:.78rem">覆盤 as_of：${esc(
        s.as_of_hkt || ""
      )}｜對照紙盤 ${esc(s.tips_as_of || "")}</div>
    </div>`;

    const rows = data.review_rows || [];
    if (!rows.length) {
      list.innerHTML = '<div class="empty">無覆盤場次</div>';
      return;
    }
    list.innerHTML = rows
      .map((r) => {
        return `<article class="card rev-card">
  <div class="card-head">
    <div class="kick">${esc(r.kickoff_hkt || "")} HKT</div>
    <div class="idpill">${esc(r.front_end_id)}</div>
  </div>
  <div class="tour">${esc(r.tournament)}</div>
  <div class="teams">${esc(r.home.ch)} vs ${esc(r.away.ch)}</div>
  <div class="pick">
    <div class="pick-main">${esc(r.pick_line)}${
          r.hkjc_odds != null ? " @ " + esc(r.hkjc_odds) : ""
        }</div>
  </div>
  <div class="row">
    <span class="pill ${statusClass(r.settlement)}">${esc(
          r.status_zh || r.settlement || "—"
        )}</span>
    ${
      r.est_prob_pct != null
        ? `<span class="pill">估計 ${esc(r.est_prob_pct)}%</span>`
        : ""
    }
    ${
      r.stake != null ? `<span class="pill">紙注 ${esc(r.stake)}</span>` : ""
    }
  </div>
  <div class="result">${
    r.ft_score != null
      ? `完場 ${esc(r.ft_score)}`
      : esc(r.match_status || "待結")
  }${r.corners ? `｜角球 ${esc(r.corners)}` : ""}${
          r.result_value ? `｜${esc(r.result_value)}` : ""
        }</div>
  ${
    r.review_zh
      ? `<div class="summary"><h3>覆盤</h3><p>${esc(r.review_zh)}</p></div>`
      : ""
  }
</article>`;
      })
      .join("");
  }

  function bindTabs() {
    $$(".tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        $$(".tab").forEach((b) => b.classList.remove("active"));
        $$(".panel").forEach((p) => p.classList.remove("active"));
        btn.classList.add("active");
        const id = btn.getAttribute("data-tab");
        $("#panel-" + id).classList.add("active");
      });
    });
  }

  function fillTop(data) {
    $("#as-of").textContent = data.as_of_hkt || "—";
    const chips = $("#stat-chips");
    const parts = [
      `<span class="chip">建議 ${esc(data.tips_count)}</span>`,
    ];
    if (data.hit_rate != null) {
      const hr = pct(data.hit_rate);
      const cls = data.hit_rate >= 0.5 ? "ok" : "warn";
      parts.push(`<span class="chip ${cls}">覆盤命中 ${esc(hr)}</span>`);
    }
    const s = data.settlement_summary;
    if (s && s.paper_pnl != null) {
      const cls = s.paper_pnl >= 0 ? "ok" : "bad";
      parts.push(
        `<span class="chip ${cls}">紙注 ${esc(s.paper_pnl)}</span>`
      );
    }
    chips.innerHTML = parts.join("");
  }

  async function boot() {
    bindTabs();
    try {
      const res = await fetch("./data.json", { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      window.__PUMPKIN_DATA__ = data;
      fillTop(data);
      renderTips(data.tips || []);
      renderReview(data);
      $("#footer-note").textContent =
        data.disclaimer ||
        "紙盤分析，唔係投注建議。估計機率唔保證命中。18歲以下唔准。";
    } catch (e) {
      $("#tips-list").innerHTML =
        '<div class="empty">載入失敗：' + esc(e.message) + "</div>";
    }
  }

  boot();
})();
