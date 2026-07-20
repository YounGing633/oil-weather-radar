/* Palm-only soil detail charts: separate root-zone and surface charts. */
(function () {
  const base = () => window.OilDetailCharts;
  let wrapped = false;
  function install() {
    if (wrapped || !base()) return; wrapped = true;
    const original = base(), panel = original.panel, render = original.render;
    original.panel = function (row, options) {
      const out = panel(row, options);
      out.html += `<section class="detail-chart-section"><h3>⑦ 根区土壤水分 · 90天走势</h3><p class="detail-note">实线为实际值，虚线为2017–2025同期常态；右轴为相对常态，100%为常态。</p><div class="detail-chart-item"><div class="detail-chart-title">根区实际 / 同期常态 / 相对常态</div><div class="detail-chart detail-chart-tall"><canvas id="${out.key}-palm-root"></canvas></div></div></section><section class="detail-chart-section"><h3>⑧ 表层土壤水分 · 90天走势</h3><p class="detail-note">表层（约0–7 cm）与根区分开显示，避免不同土层混在同一图中。</p><div class="detail-chart-item"><div class="detail-chart-title">表层实际 / 同期常态 / 相对常态</div><div class="detail-chart detail-chart-tall"><canvas id="${out.key}-palm-surface"></canvas></div></div></section>`;
      return out;
    };
    original.render = function (row, daily, key) {
      render(row, daily, key);
      document.getElementById(`${key}-soil`)?.closest('.detail-chart-section')?.remove();
      const rows = row.soil_rootzone_percentile_90d_series || [];
      const draw = (id, actual, normal, name, color) => {
        const canvas = document.getElementById(id); if (!canvas || !window.Chart) return;
        const rel = x => Number.isFinite(+x[actual]) && Number.isFinite(+x[normal]) && +x[normal] > 0 ? +x[actual] / +x[normal] * 100 : null;
        new Chart(canvas, { type: 'line', data: { labels: rows.map(x => String(x.date || '').slice(5, 10).replace('-', '/')), datasets: [
          { label: `${name}实际`, data: rows.map(x => +x[actual]), borderColor: color, borderWidth: 1.8, pointRadius: 0, tension: .22, yAxisID: 'y' },
          { label: `${name}常态（2017–2025）`, data: rows.map(x => +x[normal]), borderColor: '#7c8794', borderDash: [4, 3], borderWidth: 1.5, pointRadius: 0, tension: .22, yAxisID: 'y' },
          { label: `${name}相对常态`, data: rows.map(rel), borderColor: color, borderDash: [2, 2], borderWidth: 1.3, pointRadius: 0, tension: .22, yAxisID: 'yRelative' }
        ] }, options: { responsive: true, maintainAspectRatio: false, animation: false, plugins: { legend: { labels: { boxWidth: 9, font: { size: 10 } } } }, scales: { x: { ticks: { maxTicksLimit: 9, font: { size: 9 } }, grid: { display: false } }, y: { position: 'left', title: { display: true, text: '土壤水分（m³/m³）' } }, yRelative: { position: 'right', title: { display: true, text: '相对常态（%）' }, grid: { drawOnChartArea: false } } } } });
      };
      draw(`${key}-palm-root`, 'soil_water_rootzone', 'rootzone_normal', '根区', '#8c6a3d');
      draw(`${key}-palm-surface`, 'soil_water_surface', 'surface_normal', '表层', '#4c93c6');
    };
  }
  install();
})();
