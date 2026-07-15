(() => {
  'use strict';

  const DATA = '../data/';
  const COUNTRY_CN = { Indonesia: '印度尼西亚', Malaysia: '马来西亚' };
  const GROUPS = {
    risk: ['production', 'share'],
    rain: ['rain', 'anom', 'extreme', 'dry', 'f7', 'f8'],
    heat: ['tempAnomaly', 'forecastTemp', 'hotDry'],
    water: ['rootSoil', 'surfaceSoil', 'waterStress']
  };
  const LABELS = {
    production: '产量', share: '产量占比', rain: '近30日降雨', anom: '降雨相对常年',
    extreme: '极端降雨日数', dry: '连续无雨天数', f7: '未来1—7日降雨', f8: '未来8—15日降雨',
    tempAnomaly: '最高温距平', forecastTemp: '未来16日最高温', hotDry: '热干风险',
    rootSoil: '根区土壤水分百分位', surfaceSoil: '表层土壤水分百分位', waterStress: '水分压力'
  };
  const state = { group: 'rain', layer: 'rain', scope: 'seasia', label: 'production', rows: [], countries: [], history: {}, meta: {}, map: null, geo: [], labels: [], selected: null, selectedLayer: null };
  const $ = id => document.getElementById(id);
  const fetchJSON = async path => { const r = await fetch(DATA + path, { cache: 'no-store' }); if (!r.ok) throw new Error(path); return r.json(); };
  const n = value => Number.isFinite(Number(value)) ? Number(value) : null;
  const pct = value => n(value) === null ? '缺测' : `${n(value).toFixed(1)}%`;
  const mm = value => n(value) === null ? '缺测' : `${n(value).toFixed(1)} mm`;
  const esc = value => String(value ?? '—').replace(/[&<>]/g, x => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[x]));
  const norm = value => String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const field = (r, key) => ({
    production: r.production_tonnes, share: state.scope === 'seasia' ? r.production_share_se_asia : r.production_share_country,
    rain: r.rain_30d_mm, anom: r.rain_30d_ratio_1991_2020, extreme: r.extreme_rain_days_30d,
    dry: r.current_dry_spell_days, f7: r.forecast_rain_1_7d_mm, f8: r.forecast_rain_8_15d_mm,
    tempAnomaly: r.temp_max_anomaly_c, forecastTemp: r.forecast_16d_temp_max,
    hotDry: hotDryScore(r), rootSoil: r.rootzone_percentile, surfaceSoil: r.surface_percentile, waterStress: waterScore(r)
  }[key]);
  const hotDryScore = r => {
    const t = n(r.temp_max_anomaly_c), soil = n(r.rootzone_percentile), rain = n(r.rain_30d_ratio_1991_2020);
    if (t === null) return null;
    return Math.max(0, Math.min(100, (t >= 3 ? 70 : t >= 2 ? 45 : t >= 1 ? 20 : 0) + (soil !== null && soil < 30 ? 30 : 0) + (rain !== null && rain < 85 ? 20 : 0)));
  };
  const waterScore = r => {
    const root = n(r.rootzone_percentile), surface = n(r.surface_percentile);
    if (root === null && surface === null) return null;
    const v = Math.min(...[root, surface].filter(x => x !== null));
    return v < 10 ? 3 : v < 30 ? 2 : v > 90 ? 2 : v > 70 ? 1 : 0;
  };
  const colour = r => {
    const x = field(r, state.layer); if (x === null) return '#cbd5d2';
    if (['production', 'share'].includes(state.layer)) { const max = Math.max(...state.rows.map(q => field(q, state.layer) || 0), 1); const p = x / max; return p < .2 ? '#f1f5f3' : p < .4 ? '#c9e3d5' : p < .6 ? '#85c7ac' : p < .8 ? '#3b9a7b' : '#126451'; }
    if (state.layer === 'rain') return x <= 50 ? '#843500' : x <= 100 ? '#e66a00' : x <= 200 ? '#f9ba14' : x <= 300 ? '#a7d88a' : '#0e6a26';
    if (state.layer === 'anom') return x < 50 ? '#843500' : x < 85 ? '#f3bd0f' : x <= 115 ? '#fff200' : x <= 150 ? '#98cd18' : '#075722';
    if (['extreme', 'dry', 'hotDry', 'waterStress'].includes(state.layer)) return x === 0 ? '#edf2df' : x <= 1 ? '#f3c786' : x <= 2 ? '#d6604d' : '#8c2d24';
    if (state.layer === 'tempAnomaly') return x < 1 ? '#edf2df' : x < 2 ? '#f3c786' : x < 3 ? '#d6604d' : '#8c2d24';
    if (state.layer === 'forecastTemp') return x < 30 ? '#edf2df' : x < 33 ? '#f3c786' : x < 35 ? '#d6604d' : '#8c2d24';
    return x < 10 ? '#8c2d24' : x < 30 ? '#d6604d' : x < 70 ? '#f3c786' : x <= 90 ? '#a7d88a' : '#075722';
  };
  const featureName = f => f.properties.shapeName || f.properties.NAME_1 || f.properties.name || f.properties.Name || '';
  const rowFor = (country, feature) => { const name = norm(featureName(feature)); return state.rows.find(r => r.country === country && (norm(r.weather_region_id).includes(name) || name.includes(norm(r.weather_region_id)) || norm(r.region).includes(name) || name.includes(norm(r.region)))); };
  const style = (r, country) => ({ color: country === 'Indonesia' ? '#0b655c' : '#455c78', weight: country === 'Indonesia' ? 2.8 : 2.6, dashArray: country === 'Malaysia' ? '7 3' : null, fillColor: r ? colour(r) : '#dce7e5', fillOpacity: r ? .7 : .18 });
  const scoped = () => state.scope === 'seasia' ? state.rows : state.rows.filter(r => r.country === state.scope);

  function renderMetrics() {
    const rows = scoped(), total = rows.reduce((a, r) => a + (n(r.production_tonnes) || 0), 0);
    const share = test => total ? rows.reduce((a, r) => a + (test(r) ? n(r.production_tonnes) || 0 : 0), 0) / total * 100 : null;
    let cards;
    if (state.group === 'heat') cards = [['高温距平≥2℃', share(r => n(r.temp_max_anomaly_c) >= 2)], ['热干风险', share(r => hotDryScore(r) >= 2)], ['未来最高温≥35℃', share(r => n(r.forecast_16d_temp_max) >= 35)]];
    else if (state.group === 'water') cards = [['根区偏干（P<30）', share(r => n(r.rootzone_percentile) < 30)], ['表层偏干（P<30）', share(r => n(r.surface_percentile) < 30)], ['水分压力重点', share(r => waterScore(r) >= 2)]];
    else cards = [['低降雨', share(r => n(r.rain_30d_mm) <= 100)], ['低于常年', share(r => n(r.rain_30d_ratio_1991_2020) <= 84)], ['连续无雨偏长', share(r => n(r.current_dry_spell_days) >= 11)], ['极端降雨', share(r => n(r.extreme_rain_days_30d) > 0)]];
    $('metrics').innerHTML = cards.map(c => `<article class="card"><span>${c[0]}</span><strong>${pct(c[1])}</strong><small>占${state.scope === 'seasia' ? '东南亚' : '本国'}产量</small></article>`).join('');
  }
  function legend() {
    const unit = state.layer.includes('Soil') ? '（百分位）' : state.layer === 'tempAnomaly' ? '（℃）' : state.layer === 'forecastTemp' ? '（℃）' : state.layer === 'waterStress' || state.layer === 'hotDry' ? '（等级）' : '';
    $('legend').innerHTML = `<b>${LABELS[state.layer]}${unit}</b><br><i style="background:#8c2d24"></i>压力高 / 偏干<br><i style="background:#d6604d"></i>重点关注<br><i style="background:#f3c786"></i>轻度异常<br><i style="background:#a7d88a"></i>正常或偏湿<br><small>灰色：缺测</small>`;
  }
  function refreshMap() {
    state.geo.forEach(g => g.eachLayer(l => l.setStyle(style(l._row, l._country))));
    if (state.selectedLayer) state.map.removeLayer(state.selectedLayer);
    if (state.selected) { const layer = state.geo.flatMap(g => g.getLayers()).find(l => l._row?.weather_region_id === state.selected.weather_region_id); if (layer) state.selectedLayer = L.geoJSON(layer.feature, { style: { color: '#142b3b', weight: 6, fillOpacity: 0 }, interactive: false }).addTo(state.map); }
    state.labels.forEach(l => state.map.removeLayer(l)); state.labels = [];
    if (state.label !== 'off') state.geo.forEach(g => g.eachLayer(l => { const r = l._row, share = state.scope === 'seasia' ? r?.production_share_se_asia : r?.production_share_country; if (r && share >= .01) state.labels.push(L.marker(l.getBounds().getCenter(), { interactive: false, icon: L.divIcon({ className: 'metric-label', html: state.label === 'production' ? Math.round((r.production_tonnes || 0) / 10000) : `${Math.round(share * 100)}%`, iconSize: [50, 20], iconAnchor: [25, 10] }) }).addTo(state.map)); }));
    legend();
  }
  function updateControls() {
    $('layerMetrics').innerHTML = GROUPS[state.group].map((key, i) => `<button class="${i === 0 ? 'active' : ''}" data-layer="${key}">${LABELS[key]}</button>`).join('');
    document.querySelectorAll('[data-layer]').forEach(b => b.onclick = () => { state.layer = b.dataset.layer; document.querySelectorAll('[data-layer]').forEach(x => x.classList.toggle('active', x === b)); refreshMap(); });
  }
  function controls() {
    const names = { risk: '综合风险', rain: '降雨', heat: '热干和极端天气', water: '水分' };
    $('layerGroups').innerHTML = Object.keys(GROUPS).map(key => `<button class="${key === state.group ? 'active' : ''}" data-group="${key}">${names[key]}</button>`).join(''); updateControls();
    document.querySelectorAll('[data-group]').forEach(b => b.onclick = () => { state.group = b.dataset.group; state.layer = GROUPS[state.group][0]; document.querySelectorAll('[data-group]').forEach(x => x.classList.toggle('active', x === b)); updateControls(); renderMetrics(); refreshMap(); });
    document.querySelectorAll('[data-scope]').forEach(b => b.onclick = () => { state.scope = b.dataset.scope; document.querySelectorAll('[data-scope]').forEach(x => x.classList.toggle('active', x === b)); renderMetrics(); refreshMap(); });
    document.querySelectorAll('[data-label]').forEach(b => b.onclick = () => { state.label = b.dataset.label; document.querySelectorAll('[data-label]').forEach(x => x.classList.toggle('active', x === b)); refreshMap(); });
  }
  function regionDetail(r) {
    state.selected = r; refreshMap(); const h = state.history[r.weather_region_id] || [];
    const heat = `最高温距平 ${n(r.temp_max_anomaly_c) === null ? '缺测' : `${n(r.temp_max_anomaly_c).toFixed(1)}℃`}；未来16日最高温 ${n(r.forecast_16d_temp_max) === null ? '缺测' : `${n(r.forecast_16d_temp_max).toFixed(1)}℃`}；热干风险 ${hotDryScore(r) === null ? '缺测' : ['低', '轻度', '重点', '高'][Math.min(3, Math.round(hotDryScore(r) / 35))]}`;
    const water = `根区 P${n(r.rootzone_percentile) === null ? '—' : n(r.rootzone_percentile).toFixed(1)}；表层 P${n(r.surface_percentile) === null ? '—' : n(r.surface_percentile).toFixed(1)}；${esc(r.water_stress_label_cn || r.soil_status_cn || '暂无综合标签')}`;
    $('detail').innerHTML = `<h2>${esc(r.region)}</h2><p class="detail-note">${COUNTRY_CN[r.country]} · 所有百分位均相对同地区历史同期；P<30 表示偏干，P>70 表示偏湿。</p><h3>当前风险</h3><div class="forecast-brief">${esc(r.risk_reason_cn || '暂无风险说明')}<br>近30日降雨：${mm(r.rain_30d_mm)}（常年${pct(r.rain_30d_ratio_1991_2020)}）</div><h3>热干和极端天气</h3><div class="forecast-brief">${heat}<br>近30日极端降雨日数 ${n(r.extreme_rain_days_30d) ?? '缺测'}；连续无雨 ${n(r.current_dry_spell_days) ?? '缺测'} 天。</div><h3>水分</h3><div class="forecast-brief">${water}<br>${esc(r.water_stress_explanation_cn || r.soil_condition_summary_cn || '土壤水分数据暂未提供说明。')}</div><h3>近90日降雨变化</h3><div class="detail-chart"><canvas id="historyChart"></canvas></div>`;
    if (globalThis.Chart && h.length) new Chart($('historyChart'), { type: 'line', data: { labels: h.map(x => x.date?.slice(5)), datasets: [{ label: '30日累计降雨', data: h.map(x => x.rain_30d_mm), borderColor: '#0e6a26', pointRadius: 0 }, { label: '历史同期', data: h.map(x => x.rain_30d_baseline_1991_2020), borderColor: '#bd6b00', borderDash: [5, 3], pointRadius: 0 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { x: { ticks: { maxTicksLimit: 5 } } } } });
  }
  async function buildMap() {
    state.map = L.map('map', { minZoom: 3, maxZoom: 9 }).setView([1.5, 108], 4); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(state.map);
    for (const [country, file] of [['Indonesia', 'indonesia_admin1.geojson'], ['Malaysia', 'malaysia_admin1.geojson']]) { const geo = await fetchJSON(`admin1_geojson/${file}`); const group = L.geoJSON(geo, { style: f => style(rowFor(country, f), country), onEachFeature: (f, l) => { l._row = rowFor(country, f); l._country = country; l.bindTooltip(`${esc(l._row?.region || featureName(f))}<br>${COUNTRY_CN[country]}`, { sticky: true }); l.on('click', () => l._row && regionDetail(l._row)); } }).addTo(state.map); state.geo.push(group); }
    state.map.fitBounds(L.featureGroup(state.geo).getBounds().pad(.04));
  }
  async function init() {
    try {
      const [rainRows, countries, history, meta, palmRows] = await Promise.all(['palm_rain_region_latest.json', 'palm_rain_country_latest.json', 'palm_rain_history_90d.json', 'palm_rain_meta.json', 'palm_region_risk_latest.json'].map(fetchJSON));
      const extras = new Map(palmRows.map(r => [r.weather_region_id, r])); state.rows = rainRows.map(r => ({ ...r, ...(extras.get(r.weather_region_id) || {}) })); Object.assign(state, { countries, history, meta });
      $('status').textContent = `观测截止：${state.rows[0]?.date_end || '缺测'} ｜ 构建：${meta.generated_at || '缺测'} ｜ 热干、极端天气与土壤水分均已接入`;
      $('method').textContent = `降雨与预报：${meta.daily_source || '详见数据元信息'}。热干使用最高温距平、未来最高温，并结合降雨和根区墒情；水分使用 ERA5-Land 根区与表层土壤水分历史百分位。缺测保持为空，不以零替代。`;
      controls(); renderMetrics(); await buildMap(); regionDetail([...state.rows].sort((a, b) => (b.production_tonnes || 0) - (a.production_tonnes || 0))[0]);
    } catch (error) {
      console.error(error);
      $('status').textContent = `数据加载失败：${error?.message || '未知错误'}。`;
    }
  }
  init();
})();
