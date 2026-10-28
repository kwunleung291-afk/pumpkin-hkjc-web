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

  function riskClass(tier) {
    const k = String(tier || "").toLowerCase();
    if (k === "low") return "risk-low";
    if (k === "high") return "risk-high";
    return "risk-medium";
  }

  function pct(n) {
    if (n == null || Number.isNaN(Number(n))) return "—";
    return (Number(n) * 100).toFixed(1) + "%";
  }

  function renderOption(o) {
    const odds = o.hkjc_odds != null ? `@ ${esc(o.hkjc_odds)}` : "";
    const calTag = o.calibrated ? "校準" : "估計";
    let prob =
      o.est_prob_pct != null ? `${calTag} ${esc(o.est_prob_pct)}%` : "";
    if (
      o.calibrated &&
      o.est_prob_raw_pct != null &&
      Math.abs(Number(o.est_prob_raw_pct) - Number(o.est_prob_pct)) >= 1
    ) {
      prob += `（原 ${esc(o.est_prob_raw_pct)}%）`;
    }
    const ge60 =
      o.est_prob_pct != null && Number(o.est_prob_pct) >= 60
        ? '<span class="pill ge60">≥60%</span>'
        : "";
    const isStar =
      o.star === true ||
      (o.est_prob_pct != null && Number(o.est_prob_pct) >= 70);
    const starPill = isStar
      ? '<span class="pill star70" title="校準／估計機率≥70%">⭐ ≥70%</span>'
      : "";
    const calPill = o.calibrated
      ? '<span class="pill cal">已校準</span>'
      : "";
    const starMark = isStar ? '<span class="star-mark">⭐</span>' : "";
    return `<div class="option ${riskClass(o.risk_tier)}${isStar ? " has-star" : ""}" data-star="${isStar ? "1" : "0"}">
  <div class="option-head">
    <span class="risk-badge ${riskClass(o.risk_tier)}">${esc(
      o.risk_zh || o.risk_tier || "—"
    )}</span>
    ${starPill}${ge60}${calPill}
    <span class="pill ${confClass(o.confidence)}">信心 ${esc(
      o.confidence_zh || o.confidence || "—"
    )}</span>
    <span class="pill">紙注 ${esc(o.stake ?? "—")}</span>
  </div>
  <div class="option-pick">${esc(o.pick_line || "")} ${odds}${starMark}</div>
  <div class="option-prob">${prob}${
      o.prob_label ? ` · ${esc(o.prob_label)}` : ""
    }</div>
  <p class="option-sum">${esc(o.summary || "")}</p>
</div>`;
  }

  let starFilterOn = false;

  function renderTips(tips, data) {
    const root = $("#tips-list");
    if (!tips.length) {
      const hm = (data && data.history_meta) || {};
      const n = hm.review_rows_n != null ? hm.review_rows_n : ((data && data.review_rows) || []).length;
      root.innerHTML =
        '<div class="empty">呢個時段（未來窗）暫時未有建議。<br/>歷史覆盤同命中率冇消失——撳上面「覆盤」睇' +
        (n ? n + ' 場記錄' : '紀錄') +
        '。</div>';
      return;
    }
    const filtered = starFilterOn
      ? tips.filter((t) => {
          const opts =
            t.options && t.options.length
              ? t.options
              : [{ star: t.star, est_prob_pct: t.est_prob_pct }];
          return opts.some(
            (o) =>
              o.star === true ||
              (o.est_prob_pct != null && Number(o.est_prob_pct) >= 70)
          );
        })
      : tips;
    const filterBar = `<div class="filter-bar">
      <button type="button" id="filter-star" class="${starFilterOn ? "active" : ""}">⭐ 只睇≥70%</button>
      <button type="button" id="filter-all" class="${!starFilterOn ? "active" : ""}">全部</button>
    </div>`;
    if (!filtered.length && starFilterOn) {
      root.innerHTML =
        filterBar +
        '<div class="empty">而家冇 ≥70% 星級選項。<br/>撳「全部」睇返所有紙盤。</div>';
      bindStarFilter(tips, data);
      return;
    }
    root.innerHTML =
      filterBar +
      filtered
      .map((t) => {
        const options =
          t.options && t.options.length
            ? t.options
            : [
                {
                  risk_tier: t.risk_tier || "low",
                  risk_zh: t.risk_zh || "低風險",
                  pick_line: t.pick_line,
                  hkjc_odds: t.hkjc_odds,
                  est_prob_pct: t.est_prob_pct,
                  star: t.star,
                  star_zh: t.star_zh,
                  prob_label: t.prob_label,
                  confidence: t.confidence,
                  confidence_zh: t.confidence_zh,
                  stake: t.stake,
                  summary: t.summary,
                },
              ];
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
  <div class="options">
    ${options.map(renderOption).join("")}
  </div>
  <div class="row">
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
        <dt>莊家視角</dt>
        <dd>${esc(bk.intent || "—")}${
          bk.action ? "／" + esc(bk.action) : ""
        }${
          bk.toxicity_score != null ? "／毒性" + esc(bk.toxicity_score) : ""
        }${
          bk.brief_zh ? " — " + esc(bk.brief_zh) : ""
        }</dd>
        ${
          (t.odds_compare && t.odds_compare.brief_zh)
            ? `<dt>跨站對比</dt><dd>${esc(t.odds_compare.brief_zh)}</dd>`
            : ""
        }
        <dt>訊號</dt>
        <dd>${cites.length ? `<ul>${cites.join("")}</ul>` : "—"}</dd>
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
    bindStarFilter(tips, data);
  }

  function bindStarFilter(tips, data) {
    const starBtn = $("#filter-star");
    const allBtn = $("#filter-all");
    if (starBtn) {
      starBtn.onclick = () => {
        starFilterOn = true;
        renderTips(tips, data);
      };
    }
    if (allBtn) {
      allBtn.onclick = () => {
        starFilterOn = false;
        renderTips(tips, data);
      };
    }
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
    const cal = data.calibration || {};
    const r7 = data.rolling_7d || (cal.rolling && cal.rolling["7d"]) || {};
    hero.innerHTML = `
      <div class="statbox"><div class="n">${esc(pct(s.hit_rate))}</div><div class="l">命中率（已結）</div></div>
      <div class="statbox"><div class="n">${esc(s.n_hit)}/${esc(
      s.n_settled
    )}</div><div class="l">中／已結</div></div>
      <div class="statbox"><div class="n">${esc(
        s.brier != null ? Number(s.brier).toFixed(3) : "—"
      )}</div><div class="l">Brier</div></div>
      <div class="statbox"><div class="n">${esc(
        r7.hit_rate != null ? pct(r7.hit_rate) : "—"
      )}</div><div class="l">近7日命中</div></div>
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
      )}｜對照紙盤 ${esc(s.tips_as_of || "")}${
        s.source ? `｜來源 ${esc(s.source)}` : ""
      }</div>
      ${
        data.history_meta && data.history_meta.note_zh
          ? `<div style="margin-top:6px;color:var(--muted);font-size:.75rem">${esc(
              data.history_meta.note_zh
            )}（ledger ${esc(data.history_meta.ledger_n)}｜實注 ${esc(
              data.history_meta.user_bets_n
            )}｜賽後分析 ${esc(data.history_meta.postmatch_n || 0)}）</div>`
          : ""
      }
      ${
        data.postmatch_adapt
          ? `<h3 style="margin-top:10px">賽後自動適應</h3>
      <ul>${(data.postmatch_adapt.changelog_zh || [])
        .slice(0, 6)
        .map((e) => `<li>${esc(e)}</li>`)
        .join("") || "<li>暫無權重變更</li>"}</ul>
      <div style="color:var(--muted);font-size:.72rem">adapt as_of：${esc(
        data.postmatch_adapt.as_of_hkt || ""
      )}｜罰分桶 ${esc(data.postmatch_adapt.n_penalties)}｜加分 ${esc(
        data.postmatch_adapt.n_bonuses
      )}｜硬閘 ${esc(data.postmatch_adapt.n_gates)}</div>`
          : ""
      }
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
    r.postmatch
      ? `<div class="summary postmatch">
    <h3>${r.settlement === "HIT" ? "✅ 賽後分析（贏）" : r.settlement === "MISS" ? "❌ 賽後分析（輸）" : "賽後分析"}</h3>
    <p>${esc((r.postmatch.analysis_zh || r.review_zh || "").slice(0, 500))}</p>
    ${
      (r.postmatch.causes || []).length
        ? `<ul class="pm-causes">${r.postmatch.causes
            .map(
              (c) =>
                `<li><strong>${esc(c.direction || "")}</strong> ${esc(c.zh || "")}</li>`
            )
            .join("")}</ul>`
        : ""
    }
    ${
      (r.postmatch.external || []).length
        ? `<div class="pm-ext"><h4>外網對照</h4><ul>${r.postmatch.external
            .map((e) => {
              const label = esc(e.summary_zh || e.source || "");
              return e.url
                ? `<li><a href="${esc(e.url)}" target="_blank" rel="noopener">${esc(
                    e.source || "外網"
                  )}</a>：${label}</li>`
                : `<li>${esc(e.source || "外網")}：${label}</li>`;
            })
            .join("")}</ul></div>`
        : ""
    }
    ${
      r.postmatch.next_change_zh || r.next_change_zh
        ? `<p class="pm-next"><strong>下次應改：</strong>${esc(
            r.postmatch.next_change_zh || r.next_change_zh
          )}</p>`
        : ""
    }
  </div>`
      : r.review_zh
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

  function rollChip(label, roll) {
    if (!roll || roll.n == null || roll.n === 0) {
      return `<span class="chip">${esc(label)} n=0</span>`;
    }
    const hr = roll.hit_rate != null ? pct(roll.hit_rate) : "—";
    const br = roll.brier != null ? Number(roll.brier).toFixed(3) : "—";
    const cls = roll.hit_rate != null && roll.hit_rate >= 0.5 ? "ok" : "warn";
    return `<span class="chip ${cls}">${esc(label)} ${esc(hr)}｜Brier ${esc(br)}（n=${esc(roll.n)}）</span>`;
  }

  function fillTop(data) {
    $("#as-of").textContent = data.as_of_hkt || "—";
    const chips = $("#stat-chips");
    const parts = [
      `<span class="chip">場次 ${esc(data.matches_count || data.tips_count)}</span>`,
    ];
    if (data.options_total != null) {
      parts.push(`<span class="chip">選項 ${esc(data.options_total)}</span>`);
    }
    if (data.low_risk_ge60 != null) {
      parts.push(
        `<span class="chip ok">低風險≥60% ${esc(data.low_risk_ge60)}</span>`
      );
    }
    if (data.star_ge70 != null) {
      parts.push(
        `<span class="chip ok">⭐≥70% ${esc(data.star_ge70)}</span>`
      );
    }
    if (data.odds_compare_coverage) {
      parts.push(
        `<span class="chip">跨站 ${esc(String(data.odds_compare_coverage).slice(0, 48))}</span>`
      );
    }
    parts.push(rollChip("7日", data.rolling_7d));
    parts.push(rollChip("30日", data.rolling_30d));
    const cal = data.calibration || {};
    if (cal.honesty_zh) {
      parts.push(
        `<span class="chip cal">${esc(
          cal.identity ? "校準：樣本少" : "校準：已套用"
        )}</span>`
      );
    }
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

    // Calibration honesty strip under chips
    let strip = $("#cal-strip");
    if (!strip) {
      strip = document.createElement("div");
      strip.id = "cal-strip";
      strip.className = "cal-strip";
      chips.parentElement.appendChild(strip);
    }
    const r7 = data.rolling_7d || {};
    const r30 = data.rolling_30d || {};
    strip.innerHTML = `<div>${esc(cal.honesty_zh || "機率校準狀態未載入")}</div>
      <div class="cal-metrics">近7日命中 ${esc(
        r7.hit_rate != null ? pct(r7.hit_rate) : "—"
      )}｜Brier ${esc(r7.brier != null ? Number(r7.brier).toFixed(3) : "—")}（n=${esc(
      r7.n || 0
    )}） · 近30日命中 ${esc(
      r30.hit_rate != null ? pct(r30.hit_rate) : "—"
    )}｜Brier ${esc(
      r30.brier != null ? Number(r30.brier).toFixed(3) : "—"
    )}（n=${esc(r30.n || 0)}）</div>`;
  }

  async function boot() {
    bindTabs();
    try {
      const res = await fetch("./data.json", { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const data = await res.json();
      window.__PUMPKIN_DATA__ = data;
      fillTop(data);
      renderTips(data.tips || [], data);
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
