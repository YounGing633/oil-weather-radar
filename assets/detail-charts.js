(() => {
  let serial = 0;
  const n = value => value === null || value === undefined || value === '' ? null : (Number.isFinite(Number(value)) ? Number(value) : null);
  const dateLabel = value => String(value || '').slice(5, 10).replace('-', '/');
  const labels = rows => rows.map(x => dateLabel(x.date || x.target_date));
  const chart = (id, config) => {
    const canvas = document.getElementById(id);
    if (!canvas || typeof Chart === 'undefined') return;
    new Chart(canvas, { type: 'line', data: { labels: config.labels, datasets: config.datasets }, options: {
      responsive: true, maintainAspectRatio: false, animation: false,
      plugins: { legend: { display: true, labels: { boxWidth: 9, font: { size: 10 } } }, tooltip: { mode: 'index', intersect: false } },
      scales: { x: { ticks: { maxTicksLimit: 7, font: { size: 9 } }, grid: { display: false } }, y: { ticks: { font: { size: 9 } } } },
      ...config.options
    }});
  };
  const line = (label, data, color, extra = {}) => ({ label, data, borderColor: color, backgroundColor: color, borderWidth: 1.7, pointRadius: 0, tension: .22, spanGaps: true, ...extra });
  const section = (title, inner) => `<section class="detail-chart-section"><h3>${title}</h3>${inner}</section>`;
  const canvas = (id, title, tall = false) => `<div class="detail-chart-item"><div class="detail-chart-title">${title}</div><div class="detail-chart ${tall ? 'detail-chart-tall' : ''}"><canvas id="${id}"></canvas></div></div>`;
  const forecastPeriods = rows => {
    const total = set => set.reduce((sum, row) => sum + (n(row.precipitation_mm) || 0), 0);
    const normal = set => set.some(row => n(row.precipitation_normal_mm) !== null) ? set.reduce((sum, row) => sum + (n(row.precipitation_normal_mm) || 0), 0) : null;
    return [[1, 7, '1–7天'], [8, 15, '8–15天'], [1, 15, '1–15天']].map(([from, to, label]) => {
      const set = rows.filter(row => n(row.horizon_day) >= from && n(row.horizon_day) <= to);
      const a = total(set), b = normal(set), diff = b === null ? '距平 —' : `距平 ${a - b >= 0 ? '+' : ''}${(a - b).toFixed(1)} mm`;
      return `<div class="forecast-period"><b>${label}</b><span>${a.toFixed(1)} mm</span><small>${diff}</small></div>`;
    }).join('');
  };
  function panel(row, options = {}) {
    const key = `odc-${++serial}`;
    const title = [options.cropName, options.regionName, options.countryName].filter(Boolean).join('｜');
    const forecast = row.forecast_daily_16d_series || [];
    return { key, html: `
      <div class="detail-chart-header"><h2>${title}</h2><div class="detail-chart-badges"><span>${options.riskLabel || row.risk_label_v4_cn || row.risk_level_v3_cn || '持续跟踪'}</span></div></div>
      <p class="detail-note">实况均截至最新观测日；预报从下一日开始。除降雨预报累计外，不展示数字摘要卡。</p>
      ${section('① 30日累计降雨 / 降雨距平 · 90天走势', `${canvas(`${key}-rain30`, '累计实际/常态与距平', true)}<p class="detail-note">折线为30日累计实际值与历史常态（左轴），柱形为降雨距平（右轴）。</p>`)}
      ${section('② 日降雨 · 90天走势', `${canvas(`${key}-daily-rain`, '日降雨与历史常态', true)}<p class="detail-note">虚线为历史同期日降雨常态；棕色柱表示连续无雨日（&lt;1 mm），红色柱表示极端降雨日（≥50 mm）。</p>`)}
      ${section('③ 每日最高 / 最低 / 平均温与正常范围 · 90天走势', `${canvas(`${key}-temp`, '温度与正常范围', true)}<p class="detail-note">阴影为同源历史基准的 P10–P90 正常范围；基准不足时仅显示实况曲线。</p>`)}
      ${section('④ 未来降雨预报 · 逐日', `<div class="forecast-periods">${forecastPeriods(forecast)}</div>${canvas(`${key}-forecast-rain`, '逐日降雨预报', true)}`)}
      ${section('⑤ 未来温度预报 · 逐日', canvas(`${key}-forecast-temp`, '逐日温度预报', true))}
      ${section('⑥ 根区 / 表层土壤水分 · 90天走势', `<div class="detail-chart-grid">${canvas(`${key}-soil`, '实际值')}${canvas(`${key}-soila`, '距平（基准期）')}${canvas(`${key}-soilp`, '百分位')}</div>`)}
    ` };
  }
  function dryDays(rows) {
    const marked = new Set(); let run = [];
    const flush = () => { if (run.length >= 2) run.forEach(i => marked.add(i)); run = []; };
    rows.forEach((row, i) => { if ((n(row.precipitation_mm) || 0) < 1) run.push(i); else flush(); }); flush(); return marked;
  }
  function render(row, history, key) {
    const daily = history || [];
    // The shared history feed has complete coverage for all active regions.
    // Prefer it over the embedded risk snapshot, which can lag baseline refreshes.
    const historyRain30 = daily.map(x => ({
      date: x.date,
      precip_30d_actual: n(x.precipitation_30d_actual_mm ?? x.precip_30d_actual),
      precip_30d_normal: n(x.precipitation_30d_normal_mm ?? x.precip_30d_normal),
      precip_30d_anomaly_mm: n(x.precipitation_30d_anomaly_mm)
    }));
    const rain30 = historyRain30.some(x => x.precip_30d_actual !== null || x.precip_30d_normal !== null)
      ? historyRain30
      : (row.precip_30d_anomaly_90d_series || []);
    const soil = row.soil_rootzone_percentile_90d_series || [];
    const forecast = row.forecast_daily_16d_series || [];
    chart(`${key}-rain30`, { labels: labels(rain30), datasets: [
      line('30日累计实际', rain30.map(x => n(x.precip_30d_actual)), '#2677b8', { yAxisID: 'y', order: 1 }),
      line('30日累计常态', rain30.map(x => n(x.precip_30d_normal)), '#8797a1', { yAxisID: 'y', borderDash: [4, 3], order: 2 }),
      { type: 'bar', label: '30日降雨距平', data: rain30.map(x => n(x.precip_30d_anomaly_mm)), yAxisID: 'yAnomaly', backgroundColor: rain30.map(x => (n(x.precip_30d_anomaly_mm) || 0) >= 0 ? 'rgba(77,155,134,.28)' : 'rgba(200,121,75,.28)'), borderWidth: 0, order: 3 }
    ], options: { scales: { x: { ticks: { maxTicksLimit: 9, font: { size: 9 } }, grid: { display: false } }, y: { position: 'left', beginAtZero: true, title: { display: true, text: '累计降雨（mm）' }, ticks: { font: { size: 9 } } }, yAnomaly: { position: 'right', title: { display: true, text: '距平（mm）' }, grid: { drawOnChartArea: false }, ticks: { font: { size: 9 } } } } } });
    const dry = dryDays(daily);
    chart(`${key}-daily-rain`, { labels: labels(daily), datasets: [
      { type: 'bar', label: '日降雨', data: daily.map(x => n(x.precipitation_mm)), backgroundColor: daily.map((x, i) => (n(x.precipitation_mm) || 0) >= 50 ? '#c23b22' : dry.has(i) ? '#a97948' : '#4c93c6'), borderWidth: 0 },
      line('历史同期常态', daily.map(x => n(x.precipitation_normal_daily_mm)), '#7c8794', { borderDash: [4, 3] })
    ], options: { scales: { x: { ticks: { maxTicksLimit: 9, font: { size: 9 } }, grid: { display: false } }, y: { ticks: { font: { size: 9 } }, beginAtZero: true } } } });
    chart(`${key}-temp`, { labels: labels(daily), datasets: [
      line('最高温P10', daily.map(x => n(x.temp_max_normal_low_c)), 'rgba(225,116,67,0)', { fill: false }),
      line('最高温P90', daily.map(x => n(x.temp_max_normal_high_c)), 'rgba(225,116,67,.16)', { fill: '-1' }),
      line('最低温P10', daily.map(x => n(x.temp_min_normal_low_c)), 'rgba(52,125,188,0)', { fill: false }),
      line('最低温P90', daily.map(x => n(x.temp_min_normal_high_c)), 'rgba(52,125,188,.13)', { fill: '-1' }),
      line('最高温', daily.map(x => n(x.temp_max_c)), '#d9653b'), line('最低温', daily.map(x => n(x.temp_min_c)), '#347dbc'), line('平均温', daily.map(x => n(x.temp_mean_c)), '#5b6971')
    ] });
    chart(`${key}-forecast-rain`, { labels: labels(forecast), datasets: [{ type: 'bar', label: '预报降雨', data: forecast.map(x => n(x.precipitation_mm)), backgroundColor: '#4c93c6', borderWidth: 0 }, line('同期常态', forecast.map(x => n(x.precipitation_normal_mm)), '#8797a1', { borderDash: [4, 3] })], options: { scales: { x: { ticks: { maxTicksLimit: 15, font: { size: 9 } }, grid: { display: false } }, y: { ticks: { font: { size: 9 } }, beginAtZero: true } } } });
    chart(`${key}-forecast-temp`, { labels: labels(forecast), datasets: [line('最高温', forecast.map(x => n(x.temp_max_c)), '#d9653b'), line('最低温', forecast.map(x => n(x.temp_min_c)), '#347dbc'), line('最高温常态', forecast.map(x => n(x.temp_max_normal_c)), '#d9653b', { borderDash: [4, 3] }), line('最低温常态', forecast.map(x => n(x.temp_min_normal_c)), '#347dbc', { borderDash: [4, 3] })], options: { scales: { x: { ticks: { maxTicksLimit: 15, font: { size: 9 } }, grid: { display: false } }, y: { ticks: { font: { size: 9 } } } } } });
    chart(`${key}-soil`, { labels: labels(soil), datasets: [line('根区', soil.map(x => n(x.soil_water_rootzone)), '#8c6a3d'), line('表层', soil.map(x => n(x.soil_water_surface)), '#4c93c6')] });
    chart(`${key}-soila`, { labels: labels(soil), datasets: [line('根区距平', soil.map(x => n(x.rootzone_anomaly)), '#8c6a3d'), line('表层距平', soil.map(x => n(x.surface_anomaly)), '#4c93c6')] });
    chart(`${key}-soilp`, { labels: labels(soil), datasets: [line('根区百分位', soil.map(x => n(x.rootzone_percentile)), '#8c6a3d'), line('表层百分位', soil.map(x => n(x.surface_percentile)), '#4c93c6')], options: { scales: { x: { ticks: { maxTicksLimit: 7, font: { size: 9 } }, grid: { display: false } }, y: { min: 0, max: 100, ticks: { font: { size: 9 } } } } } });
  }
  window.OilDetailCharts = { panel, render };
})();
