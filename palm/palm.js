(() => {
  'use strict';
  const DATA = '../data/';
  const COUNTRY = { Indonesia: '印度尼西亚', Malaysia: '马来西亚' };
  const $ = id => document.getElementById(id);
  const num = x => Number.isFinite(Number(x)) ? Number(x) : null;
  const hydrateLatestRain = (rows, daily) => {
    const latest = new Map();
    daily.forEach(point => {
      const id = point?.weather_region_id, date = String(point?.date || '');
      if (!id || !date || (latest.get(id)?.date || '') > date) return;
      latest.set(id, point);
    });
    return rows.map(row => {
      const point = latest.get(row.weather_region_id);
      if (!point) return row;
      const actual = num(point.precipitation_30d_actual_mm ?? point.precip_30d_actual);
      const normal9120 = num(point.precipitation_30d_normal_mm_1991_2020);
      const normal1725 = num(point.precipitation_30d_normal_mm_2017_2025 ?? point.precipitation_30d_normal_mm ?? point.precip_30d_normal);
      const ratio9120 = normal9120 && actual !== null ? actual / normal9120 * 100 : null;
      const ratio1725 = num(point.precipitation_30d_ratio_pct_2017_2025 ?? point.precipitation_30d_ratio_pct) ?? (normal1725 && actual !== null ? actual / normal1725 * 100 : null);
      return actual === null && ratio9120 === null && ratio1725 === null ? row : { ...row, rain_30d_mm: actual, rain_30d_ratio_1991_2020: ratio9120 ?? row.rain_30d_ratio_1991_2020, rain_30d_ratio_2017_2025: ratio1725 ?? row.rain_30d_ratio_2017_2025 ?? row.rain_30d_ratio_recent5y, rain_30d_ratio_recent5y: ratio1725 ?? row.rain_30d_ratio_recent5y, weather_snapshot_date: point.date };
    });
  };
  const mm = x => num(x) === null ? '缺测' : `${num(x).toFixed(1)} mm`;
  const pc = x => num(x) === null ? '缺测' : `${num(x).toFixed(1)}%`;
  const esc = x => String(x ?? '—').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const norm = x => String(x || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const getJSON = async file => { const r = await fetch(`${DATA}${file}`, { cache: 'no-store' }); if (!r.ok) throw new Error(file); return r.json(); };
  const state = { section: 'risk', metric: 'risk', basis: 'base1725', horizon: 'f7', unit: 'absolute', depth: 'root', scope: 'seasia', label: 'production', rows: [], history: {}, dailyHistory: new Map(), map: null, geo: [], labels: [], events: [], selected: null, selectedLayer: null };
  const sectionNames = { risk: '综合风险', rain: '降雨', heat: '热干和极端天气', water: '水分' };
  const metricSets = {
    risk: [['risk', '综合供应风险'], ['production', '产量'], ['share', '产量占比']],
    rain: [['rain30', '近30日降雨'], ['rainAnomaly', '降雨距平'], ['rainForecast', '未来预报']],
    heat: [['hotDry', '热干综合状态'], ['vpd', '大气干燥度（VPD）']],
    water: [['waterPercentile', '根区历史百分位'], ['waterAnomaly', '根区相对常态'], ['surfacePercentile', '表层历史百分位'], ['surfaceAnomaly', '表层相对常态']]
  };
  const featureName = f => f.properties.shapeName || f.properties.NAME_1 || f.properties.name || f.properties.Name || '';
  const future = (r, horizon) => {
    const days = horizon === 'f7' ? 7 : horizon === 'f8' ? 8 : 15;
    const list = r.forecast_daily || r._forecast || [];
    const selected = list.filter(x => horizon === 'f7' ? x.horizon_day <= 7 : horizon === 'f8' ? x.horizon_day >= 8 && x.horizon_day <= 15 : x.horizon_day <= 15);
    return { days, rain: selected.reduce((s, x) => s + (num(x.precipitation_mm) || 0), 0), temp: selected.length ? selected.reduce((s, x) => s + (num(x.temp_max_c) || 0), 0) / selected.length : null };
  };
  const rainRatio = (r, horizon, basis) => {
    if (horizon === 'f7') return basis === 'base9120' ? num(r.forecast_ratio_1_7d_1991_2020) : num(r.forecast_ratio_1_7d_2017_2025 ?? r.forecast_ratio_1_7d_recent5y);
    if (horizon === 'f8') return basis === 'base9120' ? num(r.forecast_ratio_8_15d_1991_2020) : num(r.forecast_ratio_8_15d_2017_2025 ?? r.forecast_ratio_8_15d_recent5y);
    const a = rainRatio(r, 'f7', basis), b = rainRatio(r, 'f8', basis); return a === null || b === null ? null : (a * 7 + b * 8) / 15;
  };
  const heatScore = r => {
    const heat = num(r.temp_max_anomaly_c), soil = num(r.rootzone_percentile), rain = num(r.rain_30d_ratio_1991_2020);
    if (heat === null || heat < 2 || (soil === null && rain === null)) return 0;
    const drySoil = soil !== null && soil < 30, dryRain = rain !== null && rain < 85;
    if (!drySoil && !dryRain) return 0;
    if (heat >= 3 && soil !== null && soil < 20 && dryRain) return 3;
    if (drySoil && dryRain) return 2;
    return 1;
  };
  const waterRelative = (r, depth) => {
    const actual = num(depth === 'root' ? r.soil_water_rootzone : r.soil_water_surface);
    // Latest snapshots use the long field names; the 90-day history uses the
    // short names.  Accept both so a valid GEE observation never renders blank.
    const normal = num(depth === 'root'
      ? (r.soil_water_rootzone_normal ?? r.rootzone_normal)
      : (r.soil_water_surface_normal ?? r.surface_normal));
    return actual !== null && normal !== null && normal > 0 ? actual / normal * 100 : null;
  };
  const legendKey = () => {
    if (state.metric === 'risk') return 'risk';
    if (state.metric === 'rain30' || (state.metric === 'rainForecast' && state.unit === 'absolute')) return 'rain30_tropical';
    if (state.metric === 'rainAnomaly' || (state.metric === 'rainForecast' && state.unit === 'anomaly')) return 'palm_rain_ratio';
    if (state.metric === 'waterPercentile' || state.metric === 'surfacePercentile') return 'soil_percentile';
    if (state.metric === 'waterAnomaly' || state.metric === 'surfaceAnomaly') return 'palm_soil_relative';
    if (state.metric === 'hotDry') return 'palm_hot_dry';
    if (state.metric === 'vpd') return 'vpd_percentile';
    return null;
  };
  const dryScore = (r, depth) => {
    const soil = num(depth === 'root' ? r.rootzone_percentile : r.surface_percentile), rain = num(r.rain_30d_ratio_1991_2020);
    if (soil === null || soil >= 30) return 0;
    if (soil < 10 && rain !== null && rain < 70) return 3;
    if (soil < 20 && rain !== null && rain < 85) return 2;
    return 1;
  };
  const value = r => {
    const f = future(r, state.horizon);
    if (state.metric === 'risk') return window.PalmRisk?.classifyPalmSupplyRisk(r, { basis: state.basis }).level;
    if (state.metric === 'production') return num(r.production_tonnes);
    if (state.metric === 'share') return state.scope === 'seasia' ? num(r.production_share_se_asia) : num(r.production_share_country);
    if (state.metric === 'rain30') return num(r.rain_30d_mm);
    if (state.metric === 'rainAnomaly') return state.basis === 'base9120' ? num(r.rain_30d_ratio_1991_2020) : num(r.rain_30d_ratio_2017_2025 ?? r.rain_30d_ratio_recent5y);
    if (state.metric === 'rainForecast') { const x = state.unit === 'absolute' ? f.rain / f.days * 30 : rainRatio(r, state.horizon, state.basis); return num(x); }
    if (state.metric === 'hotDry') return window.PalmRisk?.classifyPalmHeatDryState(r, { basis: state.basis }).level;
    if (state.metric === 'vpd') return num(r.vpd_percentile_30d ?? r.vpd_percentile_14d);
    if (state.metric === 'waterPercentile') return window.PalmRisk?.percentile(r, 'root');
    if (state.metric === 'surfacePercentile') return window.PalmRisk?.percentile(r, 'surface');
    if (state.metric === 'waterAnomaly') return window.PalmRisk?.relative(r, 'root');
    if (state.metric === 'surfaceAnomaly') return window.PalmRisk?.relative(r, 'surface');
    return null;
  };
  const colour = r => {
    const x = value(r); if (x === null) return '#cbd5d2';
    if (['production', 'share'].includes(state.metric)) { const max = Math.max(...state.rows.map(q => value(q) || 0), 1), p = x / max; return p < .2 ? '#f1f5f3' : p < .4 ? '#c9e3d5' : p < .6 ? '#85c7ac' : p < .8 ? '#3b9a7b' : '#126451'; }
    if (state.metric === 'risk' && window.LegendUtils) return window.LegendUtils.getRiskLevel(x).color;
    const key = legendKey();
    if (key && window.LegendUtils) return window.LegendUtils.classifyMetric(key, x).color;
    return x === 0 ? '#eaf1e8' : x === 1 ? '#f3c786' : x === 2 ? '#d6604d' : '#8c2d24';
  };
  const style = (r, country) => ({ color: country === 'Indonesia' ? '#0b655c' : '#455c78', weight: country === 'Indonesia' ? 2.8 : 2.6, dashArray: country === 'Malaysia' ? '7 3' : null, fillColor: r ? colour(r) : '#dce7e5', fillOpacity: r ? .72 : .18 });
  const rowFor = (country, f) => { const name = norm(featureName(f)); return state.rows.find(r => r.country === country && (norm(r.weather_region_id).includes(name) || name.includes(norm(r.weather_region_id)) || norm(r.region).includes(name) || name.includes(norm(r.region)))); };
  const scoped = () => state.scope === 'seasia' ? state.rows : state.rows.filter(r => r.country === state.scope);
  function title() { return metricSets[state.section].find(x => x[0] === state.metric)?.[1] || ''; }
  function updateSummary() {
    const rows = scoped(), total = rows.reduce((s, r) => s + (num(r.production_tonnes) || 0), 0), share = fn => total ? rows.reduce((s, r) => s + (fn(r) ? num(r.production_tonnes) || 0 : 0), 0) / total * 100 : null;
    let cards;
    if (state.section === 'rain') cards = [['近30日低降雨（<100mm）', share(r => num(r.rain_30d_mm) < 100)], ['低于常年（<85%）', share(r => num(r.rain_30d_ratio_1991_2020) < 85)], ['极端降雨事件', share(r => num(r.extreme_rain_days_30d) > 0)], ['连续无雨≥11天', share(r => num(r.current_dry_spell_days) >= 11)]];
    else if (state.section === 'heat') { const hs = r => window.PalmRisk.classifyPalmHeatDryState(r, { basis: state.basis }), hasVpd = rows.some(r => num(r.vpd_percentile_30d ?? r.vpd_percentile_14d) !== null); cards = [[hasVpd ? 'VPD≥P80' : 'VPD数据暂未接入', hasVpd ? share(r => num(r.vpd_percentile_30d ?? r.vpd_percentile_14d) >= 80) : null], ['热干状态≥1级', share(r => hs(r).level >= 1)], ['热干状态≥2级', share(r => hs(r).level >= 2)], ['热干状态≥3级', share(r => hs(r).level >= 3)]]; }
    else if (state.section === 'water') { const ws = (r, d) => window.PalmRisk.classifyPalmWaterState(r, d); cards = [['根区百分位<P30', share(r => ws(r, 'root').percentile < 30)], ['根区相对常态<95%', share(r => ws(r, 'root').relative < 95)], ['水分状态≥2级', share(r => ws(r, 'root').level >= 2)], ['水分状态≥3级', share(r => ws(r, 'root').level >= 3)]]; }
    else { const rs = r => window.PalmRisk.classifyPalmSupplyRisk(r, { basis: state.basis }), rain = r => rs(r).moduleStates.rain, heat = r => rs(r).moduleStates.heatDry, water = r => rs(r).moduleStates.water; cards = [['综合风险≥2级', share(r => rs(r).level >= 2)], ['综合风险≥3级', share(r => rs(r).level >= 3)], ['降雨—水分干旱共振', share(r => rain(r).direction === 'dry' && water(r).direction === 'dry' && rain(r).level >= 2 && water(r).level >= 2)], ['热干—水分共振', share(r => heat(r).level >= 2 && water(r).direction === 'dry' && water(r).level >= 2)]]; }
    $('summaryTitle').textContent = `${sectionNames[state.section]}暴露概览`; $('metrics').innerHTML = cards.map(c => `<article class="card"><span>${c[0]}</span><strong>${pc(c[1])}</strong><small>占${state.scope === 'seasia' ? '东南亚' : '本国'}产量</small></article>`).join('');
  }
  function legend() {
    if (state.metric === 'risk' && window.LegendUtils) {
      const r = window.LegendUtils.getRiskLegend();
      $('legend').innerHTML = `<b>综合供应风险</b><br>${r.bins.map(x => `<i style="background:${x.color}"></i>${x.label}`).join('<br>')}<br><i style="background:${r.noData.color}"></i>${r.noData.label}`;
      return;
    }
    const cfg = window.LegendUtils?.getMetricLegend(legendKey());
    if (!cfg) return;
    $('legend').innerHTML = `<b>${cfg.title}${cfg.baseline ? `（${cfg.baseline}）` : ''}</b><br>${cfg.bins.map(x => `<i style="background:${x.color}"></i>${x.label}`).join('<br>')}<br><i style="background:${cfg.noData.color}"></i>${cfg.noData.label}${cfg.note ? `<br><small>${cfg.note}</small>` : ''}`;
  }
  function renderEvents() {
    state.events.forEach(m => state.map.removeLayer(m)); state.events = [];
    if (!['rain','heat'].includes(state.section)) return;
    state.geo.forEach(g => g.eachLayer(l => { const r = l._row; if (!r) return; let badge = null, cls = '';
      if (state.section === 'rain') { const e = num(r.extreme_rain_days_30d), d = num(r.current_dry_spell_days); if (e > 0) badge = `雨${e}`; else if (d >= 11) badge = `旱${d}`; }
      if (state.section === 'heat') { const heat = window.PalmRisk.classifyPalmHeatDryState(r, { basis: state.basis }); if (heat.level !== null && heat.level > 0) { badge = `热${heat.level}`; cls = 'hot'; } }
      if (badge) state.events.push(L.marker(l.getBounds().getCenter(), { interactive: false, icon: L.divIcon({ className: `event-badge ${cls}`, html: badge, iconSize: [26, 22], iconAnchor: [13, 11] }) }).addTo(state.map));
    }));
  }
  function buildPalmTooltip(r) {
    const supply = window.PalmRisk.classifyPalmSupplyRisk(r, { basis: state.basis }), rain = supply.moduleStates.rain, heat = supply.moduleStates.heatDry, water = supply.moduleStates.water;
    return `<b>${esc(r.region)}</b><br>综合供应风险：${supply.level === null ? '暂无足够数据' : `${supply.level}级 ${supply.label}`}<br>降雨状态：${rain.level === null ? '证据不足' : `${rain.level}级 ${rain.direction === 'dry' ? '偏少' : rain.direction === 'wet' ? '偏多' : '正常'}`}<br>热干状态：${heat.level === null ? '证据不足' : `${heat.level}级 ${heat.label}`}<br>水分状态：${water.level === null ? '证据不足' : `${water.level}级 ${water.direction === 'dry' ? '根区偏干' : water.direction === 'wet' ? '根区偏湿' : '正常'}`}<br><small>${esc(supply.adjustments[0] || supply.evidence[0] || '暂无额外共振信号')}</small>`;
  }
  function refreshMap() {
    state.geo.forEach(g => g.eachLayer(l => l.setStyle(style(l._row, l._country))));
    if (state.selectedLayer) state.map.removeLayer(state.selectedLayer);
    if (state.selected) { const layer = state.geo.flatMap(g => g.getLayers()).find(l => l._row?.weather_region_id === state.selected.weather_region_id); if (layer) state.selectedLayer = L.geoJSON(layer.feature, { style: { color: '#142b3b', weight: 6, fillOpacity: 0 }, interactive: false }).addTo(state.map); }
    state.labels.forEach(m => state.map.removeLayer(m)); state.labels = [];
    if (state.label !== 'off') state.geo.forEach(g => g.eachLayer(l => {
      const r = l._row, sh = state.scope === 'seasia' ? r?.production_share_se_asia : r?.production_share_country;
      if (!r || sh < .01) return;
      const x = value(r);
      const label = state.label === 'production' ? Math.round((r.production_tonnes || 0) / 10000)
        : state.label === 'share' ? `${Math.round(sh * 100)}%`
        : x === null ? '—' : ['risk', 'hotDry'].includes(state.metric) ? `${Math.round(x)}级` : ['waterPercentile', 'surfacePercentile', 'vpd'].includes(state.metric) ? `P${Math.round(x)}` : state.metric === 'rain30' ? `${Math.round(x)}mm` : `${Math.round(x)}%`;
      state.labels.push(L.marker(l.getBounds().getCenter(), { interactive: false, icon: L.divIcon({ className: 'metric-label', html: label, iconSize: [50, 20], iconAnchor: [25, 10] }) }).addTo(state.map));
    }));
    renderEvents(); legend();
  }
  function controlButton(text, key, val, active, disabled = false) { return `<button ${active ? 'class="active"' : ''} ${disabled ? 'disabled title="当前数据未提供该口径"' : ''} data-control="${key}" data-value="${val}">${text}</button>`; }
  function controls() {
    $('layerGroups').innerHTML = Object.entries(sectionNames).map(([k, v]) => `<button class="${state.section === k ? 'active' : ''}" data-section="${k}">${v}</button>`).join('');
    $('layerMetrics').innerHTML = metricSets[state.section].map(([k, v]) => { const disabled = k === 'vpd' && state.rows.length && !state.rows.some(r => num(r.vpd_percentile_30d ?? r.vpd_percentile_14d) !== null); return `<button ${disabled ? 'disabled title="当前数据未接入VPD"' : ''} class="${state.metric === k ? 'active' : ''}" data-metric="${k}">${v}</button>`; }).join('');
    document.querySelectorAll('[data-label]').forEach(x => x.classList.toggle('active', x.dataset.label === state.label));
    document.querySelectorAll('[data-section]').forEach(b => b.onclick = () => { state.section = b.dataset.section; state.metric = metricSets[state.section][0][0]; state.label = state.section === 'water' ? 'metric' : 'production'; state.basis = 'base1725'; state.unit = 'absolute'; updateControlRow(); controls(); updateSummary(); refreshMap(); });
    document.querySelectorAll('[data-metric]').forEach(b => b.onclick = () => { state.metric = b.dataset.metric; if (state.section === 'water') state.label = 'metric'; updateControlRow(); controls(); refreshMap(); });
    document.querySelectorAll('[data-scope]').forEach(b => b.onclick = () => { state.scope = b.dataset.scope; document.querySelectorAll('[data-scope]').forEach(x => x.classList.toggle('active', x === b)); updateSummary(); refreshMap(); });
    document.querySelectorAll('[data-label]').forEach(b => b.onclick = () => { state.label = b.dataset.label; document.querySelectorAll('[data-label]').forEach(x => x.classList.toggle('active', x === b)); refreshMap(); });
  }
  function updateControlRow() {
    let html = '';
    if (state.metric === 'rainAnomaly' || state.metric === 'rainForecast') html += `<b>比较基准</b>${controlButton('1991–2020', 'basis', 'base9120', state.basis === 'base9120')}${controlButton('2017–2025', 'basis', 'base1725', state.basis === 'base1725')}`;
    if (state.metric === 'rainForecast' || state.metric === 'tempForecast') html += `<b>期限</b>${controlButton('1–7日', 'horizon', 'f7', state.horizon === 'f7')}${controlButton('8–15日', 'horizon', 'f8', state.horizon === 'f8')}${controlButton('1–15日', 'horizon', 'f15', state.horizon === 'f15')}`;
    if (state.metric === 'rainForecast') html += `<b>显示</b>${controlButton('绝对值（30日等效）', 'unit', 'absolute', state.unit === 'absolute')}${controlButton('距平', 'unit', 'anomaly', state.unit === 'anomaly')}`;
    const hints = { hotDry: '仅当“高温距平≥2℃”且“根区偏干或降雨偏少”同时出现时才标记。', waterAnomaly: '相对常态 = 实际土壤水分 ÷ 2017–2025同期均值 × 100%；100%为常态。' };
    if (hints[state.metric]) html += `<span class="control-hint">${hints[state.metric]}</span>`;
    $('controlRow').innerHTML = html;
    document.querySelectorAll('[data-control]').forEach(b => b.onclick = () => { if (b.disabled) return; state[b.dataset.control] = b.dataset.value; updateControlRow(); refreshMap(); updateSummary(); });
  }
  function regionDetail(r) {
    state.selected = r; refreshMap();
    const supply = window.PalmRisk.classifyPalmSupplyRisk(r, { basis: state.basis }), rainState = supply.moduleStates.rain, heatState = supply.moduleStates.heatDry, waterState = supply.moduleStates.water;
    const conclusion = `<section class="detail-chart-section"><h3>当前供应风险</h3><div class="forecast-brief"><b>综合供应风险：${supply.level === null ? '暂无足够数据' : `${supply.level}级 ${supply.label}`}</b><br>降雨：${rainState.level === null ? '证据不足' : `${rainState.level}级 ${rainState.direction}`}；热干：${heatState.level === null ? '证据不足' : `${heatState.level}级 ${heatState.label}`}；水分：${waterState.level === null ? '证据不足' : `${waterState.level}级 ${waterState.direction}`}。<br>${esc(supply.adjustments.join('；') || supply.evidence.slice(0, 2).join('；') || '当前未发现明确共振信号。')}<br><small>未来修复可能：${rainState.repairSignal === 'repair' ? '未来降雨存在一定修复信号。' : rainState.repairSignal === 'no_relief' ? '未来降雨仍偏少，短期修复有限。' : '预报或常态基准不足，暂不判断。'}</small></div></section>`;
    const chartPanel = window.OilDetailCharts?.panel(r, {
      cropName: '棕榈油', regionName: r.region, countryName: COUNTRY[r.country] || r.country,
      riskLabel: r.risk_label_v4_cn || r.risk_level_v3_cn || '持续跟踪'
    });
    if (chartPanel) {
      $('detail').innerHTML = conclusion + chartPanel.html;
      requestAnimationFrame(() => window.OilDetailCharts.render(r, state.dailyHistory.get(r.weather_region_id) || [], chartPanel.key));
      return;
    }
    state.selected = r; refreshMap(); const root = num(r.rootzone_percentile), surf = num(r.surface_percentile), heat = heatScore(r), dry = dryScore(r, 'root');
    const rainEvents = `极端降雨日 ${num(r.extreme_rain_days_30d) ?? '—'}；连续无雨 ${num(r.current_dry_spell_days) ?? '—'} 天`;
    const heatText = heat ? ['','轻度热干：高温与一项偏干信号并存','重点热干：高温、根区偏干及降雨偏少并存','严重热干：高温≥3℃、根区P<20且降雨偏少'][heat] : '未触发热干：需要高温（距平≥2℃）与偏干条件同时成立。';
    const waterText = `根区：${num(r.soil_water_rootzone) === null ? '缺测' : `${num(r.soil_water_rootzone).toFixed(3)} m³/m³`}（相对常态 ${pc(waterRelative(r, 'root'))}）；表层：${num(r.soil_water_surface) === null ? '缺测' : `${num(r.soil_water_surface).toFixed(3)} m³/m³`}（相对常态 ${pc(waterRelative(r, 'surface'))}）。`;
    $('detail').innerHTML = `<h2>${esc(r.region)}</h2><p class="detail-note">${COUNTRY[r.country]} · 点击地图图层可切换指标；雨/旱/热圆点是事件提示，不是另一套底图。</p><h3>当前风险</h3><div class="forecast-brief">${esc(r.risk_reason_cn || '暂无风险说明')}<br>近30日降雨：${mm(r.rain_30d_mm)}（2017–2025同源同期 ${pc(r.rain_30d_ratio_1991_2020)}；近五年 ${pc(r.rain_30d_ratio_recent5y)}）<br>${rainEvents}</div><h3>热干和极端天气</h3><div class="forecast-brief">最高温：${num(r._weather?.temp_max_c) === null ? '缺测' : `${num(r._weather.temp_max_c).toFixed(1)}℃`}；最高温距平：${num(r.temp_max_anomaly_c) === null ? '缺测' : `${num(r.temp_max_anomaly_c).toFixed(1)}℃`}。<br>${heatText}</div><h3>水分</h3><div class="forecast-brief">${waterText}<br>相对常态 = 实际土壤水分 ÷ 2017–2025同期均值 × 100%；100%为常态。</div><h3>数据口径</h3><div class="forecast-brief">降雨、温度、近30日窗口、历史基准和预报统一使用 Open‑Meteo ECMWF IFS。近30日严格取截止日及此前29个日历日；历史同期基准为2017–2025。</div>`;
  }
  async function buildMap() {
    state.map = L.map('map', { minZoom: 3, maxZoom: 9 }).setView([1.5, 108], 4); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(state.map);
    for (const [country, file] of [['Indonesia','indonesia_admin1.geojson'], ['Malaysia','malaysia_admin1.geojson']]) { const json = await getJSON(`admin1_geojson/${file}`); const group = L.geoJSON(json, { style: f => style(rowFor(country, f), country), onEachFeature: (f, l) => { l._row = rowFor(country, f); l._country = country; l.bindTooltip(l._row ? buildPalmTooltip(l._row) : `${esc(featureName(f))}<br>${COUNTRY[country]}`, { sticky: true }); l.on('click', () => l._row && regionDetail(l._row)); } }).addTo(state.map); state.geo.push(group); }
    state.map.fitBounds(L.featureGroup(state.geo).getBounds().pad(.04));
  }
  async function init() {
    try {
      await window.LegendUtils?.load();
      const [rain, risk, history, meta, weather, anomaly, forecast, daily] = await Promise.all(['palm_rain_region_latest.json','palm_region_risk_latest.json','palm_rain_history_90d.json','palm_rain_meta.json','weather_latest.json','weather_anomaly.json','weather_forecast.json','region_history_90d_v1.0d.json'].map(getJSON));
      const extra = new Map(risk.map(r => [r.weather_region_id, r])), weatherBy = new Map(weather.map(r => [r.weather_region_id, r])), anomalyBy = new Map(anomaly.map(r => [r.weather_region_id, r])), forecastBy = new Map();
      forecast.forEach(x => { if (!forecastBy.has(x.weather_region_id)) forecastBy.set(x.weather_region_id, []); forecastBy.get(x.weather_region_id).push(x); });
      state.rows = hydrateLatestRain(rain.map(r => ({ ...r, ...(extra.get(r.weather_region_id) || {}), _weather: weatherBy.get(r.weather_region_id), _anomaly: anomalyBy.get(r.weather_region_id), _forecast: forecastBy.get(r.weather_region_id) || [] })), daily); state.history = history; state.dailyHistory = new Map(); daily.forEach(row => { if (!state.dailyHistory.has(row.weather_region_id)) state.dailyHistory.set(row.weather_region_id, []); state.dailyHistory.get(row.weather_region_id).push(row); });
      $('status').textContent = `最新实况（ECMWF IFS）：${state.rows[0]?.date_end || '缺测'} ｜ 数据更新时间：${meta.generated_at || '缺测'} ｜ 当前地图：绝对值、距平和事件提示可分别切换`;
      $('method').textContent = '降雨和温度统一采用 Open-Meteo ECMWF IFS。近30日严格取截止日及此前29个日历日；仅在2017–2025同源历史完整时显示历史基准，缺失时不再用第二来源补齐。未来降雨绝对值转为30日等效累计，便于与近30日图层比较。';
      updateControlRow(); controls(); updateSummary(); await buildMap(); regionDetail([...state.rows].sort((a,b) => (b.production_tonnes || 0) - (a.production_tonnes || 0))[0]);
    } catch (e) { console.error(e); $('status').textContent = `数据加载失败：${e?.message || '未知错误'}。`; }
  }
  init();
})();
