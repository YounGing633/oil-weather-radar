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
    const normal1725 = num(point.precipitation_30d_normal_mm_2017_2025 ?? point.precipitation_30d_normal_mm ?? point.precip_30d_normal);
    const ratio1725 = num(point.precipitation_30d_ratio_pct_2017_2025 ?? point.precipitation_30d_ratio_pct) ?? (normal1725 && actual !== null ? actual / normal1725 * 100 : null);
    return actual === null && ratio1725 === null ? row : { ...row, rain_30d_mm: actual, rain_30d_ratio_2017_2025: ratio1725 ?? row.rain_30d_ratio_2017_2025 ?? row.rain_30d_ratio_recent5y, rain_30d_ratio_recent5y: ratio1725 ?? row.rain_30d_ratio_recent5y, weather_snapshot_date: point.date };
    });
  };
  const mm = x => num(x) === null ? '缺测' : `${num(x).toFixed(1)} mm`;
  const pc = x => num(x) === null ? '缺测' : `${num(x).toFixed(1)}%`;
  const esc = x => String(x ?? '—').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const norm = x => String(x || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const getJSON = async file => { const r = await fetch(`${DATA}${file}`, { cache: 'no-store' }); if (!r.ok) throw new Error(file); return r.json(); };
  const state = { section: 'rain', metric: 'rain30', basis: 'base1725', horizon: 'f7', unit: 'absolute', depth: 'root', scope: 'seasia', label: 'production', rows: [], history: {}, dailyHistory: new Map(), map: null, geo: [], labels: [], events: [], selected: null, selectedLayer: null };
  const sectionNames = { risk: '综合风险', rain: '降雨', heat: '热干和极端天气', water: '水分' };
  const metricSets = {
    risk: [['risk', '综合供应风险'], ['production', '产量'], ['share', '产量占比']],
    rain: [['rain30', '近30日降雨（有源日）'], ['temp30', '近30日均温（有源日）'], ['rainForecast', '未来预报']],
    heat: [['hotDry', '热干综合状态'], ['vpd', '大气干燥度（VPD）']],
    water: [['soilSurface', '表层土壤水分'], ['waterPercentile', '根区历史百分位'], ['waterAnomaly', '根区相对常态'], ['surfacePercentile', '表层历史百分位'], ['surfaceAnomaly', '表层相对常态']]
  };
  const featureName = f => f.properties.shapeName || f.properties.NAME_1 || f.properties.name || f.properties.Name || '';
  const future = (r, horizon) => {
    const days = horizon === 'f7' ? 7 : horizon === 'f8' ? 8 : 15;
    const list = r.forecast_daily || r._forecast || [];
    const selected = list.filter(x => horizon === 'f7' ? x.horizon_day <= 7 : horizon === 'f8' ? x.horizon_day >= 8 && x.horizon_day <= 15 : x.horizon_day <= 15);
    return { days, rain: selected.length ? selected.reduce((s, x) => s + (num(x.precipitation_mm) || 0), 0) : null, temp: selected.length ? selected.reduce((s, x) => s + (num(x.temp_max_c) || 0), 0) / selected.length : null };
  };
  const historyRows = r => state.dailyHistory.get(r.weather_region_id) || [];
  const recentRows = r => {
    const rows = [...historyRows(r)].sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));
    if (!rows.length) return [];
    const end = String(r.date_end || rows[rows.length - 1].date || '');
    const endMs = Date.parse(`${end}T00:00:00Z`);
    return Number.isFinite(endMs) ? rows.filter(x => {
      const t = Date.parse(`${String(x.date || '')}T00:00:00Z`);
      return Number.isFinite(t) && t >= endMs - 29 * 86400000 && t <= endMs;
    }) : rows.slice(-30);
  };
  const rain30Value = r => {
    const declared = num(r.rain_30d_mm);
    if (declared !== null) return { value: declared, days: 30 };
    const values = recentRows(r).map(x => num(x.precipitation_mm)).filter(x => x !== null);
    return { value: values.length ? values.reduce((s, x) => s + x, 0) : null, days: values.length };
  };
  const temp30Value = r => {
    const declared = num(r.temp_mean_30d_c);
    if (declared !== null) return { value: declared, days: 30 };
    const values = recentRows(r).map(x => num(x.temperature_mean_c ?? x.temp_mean_c)).filter(x => x !== null);
    return { value: values.length ? values.reduce((s, x) => s + x, 0) / values.length : null, days: values.length };
  };
  const soilSurfaceValue = r => {
    const declared = num(r.soil_water_surface);
    if (declared !== null) return declared;
    const rows = recentRows(r).map(x => ({ date: String(x.date || ''), value: num(x.soil_moisture_layer1) })).filter(x => x.value !== null);
    return rows.length ? rows[rows.length - 1].value : null;
  };
  const rainRatio = (r, horizon, basis) => {
    if (horizon === 'f7') return num(r.forecast_ratio_1_7d_2017_2025 ?? r.forecast_ratio_1_7d_recent5y);
    if (horizon === 'f8') return num(r.forecast_ratio_8_15d_2017_2025 ?? r.forecast_ratio_8_15d_recent5y);
    const a = rainRatio(r, 'f7', basis), b = rainRatio(r, 'f8', basis); return a === null || b === null ? null : (a * 7 + b * 8) / 15;
  };
  const heatScore = r => {
    const heat = num(r.temp_max_anomaly_c), soil = num(r.rootzone_percentile), rain = num(r.rain_30d_ratio_2017_2025);
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
    if (state.metric === 'temp30') return 'temp_tropical_absolute';
    if (state.metric === 'rainAnomaly' || (state.metric === 'rainForecast' && state.unit === 'anomaly')) return 'palm_rain_ratio';
    if (state.metric === 'waterPercentile' || state.metric === 'surfacePercentile') return 'soil_percentile';
    if (state.metric === 'waterAnomaly' || state.metric === 'surfaceAnomaly') return 'palm_soil_relative';
    if (state.metric === 'hotDry') return 'palm_hot_dry';
    if (state.metric === 'vpd') return 'vpd_percentile';
    return null;
  };
  const dryScore = (r, depth) => {
    const soil = num(depth === 'root' ? r.rootzone_percentile : r.surface_percentile), rain = num(r.rain_30d_ratio_2017_2025);
    if (soil === null || soil >= 30) return 0;
    if (soil < 10 && rain !== null && rain < 70) return 3;
    if (soil < 20 && rain !== null && rain < 85) return 2;
    return 1;
  };
  const valueFor = (r, metric = state.metric) => {
    const f = future(r, state.horizon);
    if (metric === 'risk') return r.region_risk_publish_allowed === false ? null : window.PalmRisk?.classifyPalmSupplyRisk(r, { basis: state.basis }).level;
    if (metric === 'production') return num(r.production_tonnes);
    if (metric === 'share') return state.scope === 'seasia' ? num(r.production_share_se_asia) : num(r.production_share_country);
    if (metric === 'rain30') return rain30Value(r).value;
    if (metric === 'temp30') return temp30Value(r).value;
    if (metric === 'rainAnomaly') return num(r.rain_30d_ratio_2017_2025 ?? r.rain_30d_ratio_recent5y);
    if (metric === 'rainForecast') { const x = state.unit === 'absolute' ? (f.rain === null ? null : f.rain / f.days * 30) : rainRatio(r, state.horizon, state.basis); return num(x); }
    if (metric === 'hotDry') return window.PalmRisk?.classifyPalmHeatDryState(r, { basis: state.basis }).level;
    if (metric === 'vpd') return num(r.vpd_percentile_30d ?? r.vpd_percentile_14d);
    if (metric === 'soilSurface') return soilSurfaceValue(r);
    if (metric === 'waterPercentile') return window.PalmRisk?.percentile(r, 'root');
    if (metric === 'surfacePercentile') return window.PalmRisk?.percentile(r, 'surface');
    if (metric === 'waterAnomaly') return window.PalmRisk?.relative(r, 'root');
    if (metric === 'surfaceAnomaly') return window.PalmRisk?.relative(r, 'surface');
    return null;
  };
  const value = r => valueFor(r);
  const colour = r => {
    const x = value(r); if (x === null) return '#cbd5d2';
    if (['production', 'share'].includes(state.metric)) { const max = Math.max(...state.rows.map(q => value(q) || 0), 1), p = x / max; return p < .2 ? '#f1f5f3' : p < .4 ? '#c9e3d5' : p < .6 ? '#85c7ac' : p < .8 ? '#3b9a7b' : '#126451'; }
    if (state.metric === 'soilSurface') { const p = Math.max(0, Math.min(1, (x - .05) / .45)); return p < .2 ? '#f6d9b5' : p < .4 ? '#e6c77a' : p < .6 ? '#b9c96f' : p < .8 ? '#6eaa74' : '#2d795d'; }
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
    const rows = scoped(), total = rows.reduce((s, r) => s + (num(r.production_tonnes) || 0), 0), share = (fn, available = () => true) => {
      const eligible = rows.filter(available);
      return total && eligible.length ? eligible.reduce((s, r) => s + (fn(r) ? num(r.production_tonnes) || 0 : 0), 0) / total * 100 : null;
    };
    let cards;
    if (state.section === 'rain') cards = [['近30日低降雨（<100mm）', share(r => rain30Value(r).value < 100, r => rain30Value(r).value !== null)], ['低于2017–2025同期（<85%）', share(r => num(r.rain_30d_ratio_2017_2025) < 85, r => num(r.rain_30d_ratio_2017_2025) !== null)], ['极端降雨事件', share(r => num(r.extreme_rain_days_30d) > 0, r => num(r.extreme_rain_days_30d) !== null)], ['连续无雨≥11天', share(r => num(r.current_dry_spell_days) >= 11, r => num(r.current_dry_spell_days) !== null)]];
    else if (state.section === 'heat') { const hs = r => window.PalmRisk.classifyPalmHeatDryState(r, { basis: state.basis }), hasVpd = rows.some(r => num(r.vpd_percentile_30d ?? r.vpd_percentile_14d) !== null); cards = [[hasVpd ? 'VPD≥P80' : 'VPD数据暂未接入', hasVpd ? share(r => num(r.vpd_percentile_30d ?? r.vpd_percentile_14d) >= 80, r => num(r.vpd_percentile_30d ?? r.vpd_percentile_14d) !== null) : null], ['热干状态≥1级', share(r => hs(r).level >= 1, r => hs(r).level !== null)], ['热干状态≥2级', share(r => hs(r).level >= 2, r => hs(r).level !== null)], ['热干状态≥3级', share(r => hs(r).level >= 3, r => hs(r).level !== null)]]; }
    else if (state.section === 'water') {
      const ws = (r, d) => window.PalmRisk.classifyPalmWaterState(r, d);
      const rootPercentileBelow30 = r => { const p = ws(r, 'root').percentile; return p !== null && p < 30; };
      const rootRelativeBelow95 = r => { const p = ws(r, 'root').relative; return p !== null && p < 95; };
      cards = [['根区百分位<P30', share(rootPercentileBelow30, r => ws(r, 'root').percentile !== null)], ['根区相对常态<95%', share(rootRelativeBelow95, r => ws(r, 'root').relative !== null)], ['水分状态≥2级', share(r => ws(r, 'root').level >= 2, r => ws(r, 'root').level !== null)], ['水分状态≥3级', share(r => ws(r, 'root').level >= 3, r => ws(r, 'root').level !== null)]];
    }
    else { const rs = r => window.PalmRisk.classifyPalmSupplyRisk(r, { basis: state.basis }), rain = r => rs(r).moduleStates.rain, heat = r => rs(r).moduleStates.heatDry, water = r => rs(r).moduleStates.water; cards = [['综合风险≥2级', share(r => rs(r).level >= 2, r => rs(r).level !== null)], ['综合风险≥3级', share(r => rs(r).level >= 3, r => rs(r).level !== null)], ['降雨—水分干旱共振', share(r => rain(r).direction === 'dry' && water(r).direction === 'dry' && rain(r).level >= 2 && water(r).level >= 2, r => rain(r).level !== null && water(r).level !== null)], ['热干—水分共振', share(r => heat(r).level >= 2 && water(r).direction === 'dry' && water(r).level >= 2, r => heat(r).level !== null && water(r).level !== null)]]; }
    $('summaryTitle').textContent = `${sectionNames[state.section]}暴露概览`; $('metrics').innerHTML = cards.map(c => `<article class="card"><span>${c[0]}</span><strong>${pc(c[1])}</strong><small>占${state.scope === 'seasia' ? '东南亚' : '本国'}产量</small></article>`).join('');
  }
  function legend() {
    if (state.metric === 'risk' && window.LegendUtils) {
      const r = window.LegendUtils.getRiskLegend();
      $('legend').innerHTML = `<b>综合供应风险</b><br>${r.bins.map(x => `<i style="background:${x.color}"></i>${x.label}`).join('<br>')}<br><i style="background:${r.noData.color}"></i>${r.noData.label}`;
      return;
    }
    if (state.metric === 'soilSurface') {
      $('legend').innerHTML = '<b>表层土壤水分（swvl1）</b><br><i style="background:#f6d9b5"></i>偏低　<i style="background:#b9c96f"></i>中等　<i style="background:#2d795d"></i>偏高<br><small>显示最近有源日的 0–7 cm 表层土壤水分；缺失不填充。</small>';
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
    const rain30 = rain30Value(r), temp30 = temp30Value(r);
    if (r.region_risk_publish_allowed === false) {
      return `<b>${esc(r.region)}</b><br>近30日有源日累计降雨：${rain30.value === null ? '缺测' : `${mm(rain30.value)}（有源${rain30.days}/30日）`}<br>近30日有源日均温：${temp30.value === null ? '缺测' : `${temp30.value.toFixed(1)}℃（有源${temp30.days}/30日）`}<br><small>综合供应风险尚未重算；缺失日不填充。</small>`;
    }
    if (r.region_risk_publish_allowed === false) {
      return `<b>${esc(r.region)}</b><br>行政区多点聚合近30日降雨：${mm(r.rain_30d_mm)}<br>样点范围：P10 ${mm(r.rain_30d_p10_mm)} / P50 ${mm(r.rain_30d_p50_mm)} / P90 ${mm(r.rain_30d_p90_mm)}<br><small>综合供应风险待土壤、温度与预报完成区域聚合后再发布。</small>`;
    }
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
      const label = state.label === 'production' ? (num(r.production_tonnes) === null ? '—' : Math.round(r.production_tonnes / 10000))
        : state.label === 'share' ? `${Math.round(sh * 100)}%`
        : x === null ? '—' : ['risk', 'hotDry'].includes(state.metric) ? `${Math.round(x)}级` : ['waterPercentile', 'surfacePercentile', 'vpd'].includes(state.metric) ? `P${Math.round(x)}` : state.metric === 'rain30' ? `${Math.round(x)}mm${rain30Value(r).days < 30 ? '*' : ''}` : state.metric === 'temp30' ? `${Math.round(x)}℃${temp30Value(r).days < 30 ? '*' : ''}` : state.metric === 'soilSurface' ? `${x.toFixed(2)}` : `${Math.round(x)}%`;
      state.labels.push(L.marker(l.getBounds().getCenter(), { interactive: false, icon: L.divIcon({ className: 'metric-label', html: label, iconSize: [50, 20], iconAnchor: [25, 10] }) }).addTo(state.map));
    }));
    renderEvents(); legend();
  }
  function controlButton(text, key, val, active, disabled = false) { return `<button ${active ? 'class="active"' : ''} ${disabled ? 'disabled title="当前数据未提供该口径"' : ''} data-control="${key}" data-value="${val}">${text}</button>`; }
  function controls() {
    $('layerGroups').innerHTML = Object.entries(sectionNames).map(([k, v]) => `<button class="${state.section === k ? 'active' : ''}" data-section="${k}">${v}</button>`).join('');
    $('layerMetrics').innerHTML = metricSets[state.section].map(([k, v]) => {
      const available = state.rows.some(r => valueFor(r, k) !== null);
      const disabled = !available && !['production', 'share'].includes(k);
      const title = k === 'vpd' ? '当前数据未接入VPD' : k === 'risk' ? '综合风险尚未重算' : k.includes('Percentile') || k.includes('Anomaly') ? '当前没有可验证的常态/百分位基准' : '当前没有可用源数据';
      return `<button ${disabled ? `disabled title="${title}"` : ''} class="${state.metric === k ? 'active' : ''}" data-metric="${k}">${v}</button>`;
    }).join('');
    document.querySelectorAll('[data-label]').forEach(x => x.classList.toggle('active', x.dataset.label === state.label));
    document.querySelectorAll('[data-section]').forEach(b => b.onclick = () => { state.section = b.dataset.section; state.metric = metricSets[state.section][0][0]; state.label = ['water', 'risk'].includes(state.section) ? 'metric' : 'production'; state.basis = 'base1725'; state.unit = 'absolute'; updateControlRow(); controls(); updateSummary(); refreshMap(); });
    document.querySelectorAll('[data-metric]').forEach(b => b.onclick = () => { state.metric = b.dataset.metric; if (state.section === 'water') state.label = 'metric'; updateControlRow(); controls(); refreshMap(); });
    document.querySelectorAll('[data-scope]').forEach(b => b.onclick = () => { state.scope = b.dataset.scope; document.querySelectorAll('[data-scope]').forEach(x => x.classList.toggle('active', x === b)); updateSummary(); refreshMap(); });
    document.querySelectorAll('[data-label]').forEach(b => b.onclick = () => { state.label = b.dataset.label; document.querySelectorAll('[data-label]').forEach(x => x.classList.toggle('active', x === b)); refreshMap(); });
  }
  function updateControlRow() {
    let html = '';
    if (state.metric === 'rainAnomaly' || state.metric === 'rainForecast') html += `<b>比较基准</b><span class="control-hint">2017–2025（同源历史基准）</span>`;
    if (state.metric === 'rainForecast' || state.metric === 'tempForecast') html += `<b>期限</b>${controlButton('1–7日', 'horizon', 'f7', state.horizon === 'f7')}${controlButton('8–15日', 'horizon', 'f8', state.horizon === 'f8')}${controlButton('1–15日', 'horizon', 'f15', state.horizon === 'f15')}`;
    if (state.metric === 'rainForecast') html += `<b>显示</b>${controlButton('绝对值（30日等效）', 'unit', 'absolute', state.unit === 'absolute')}${controlButton('距平', 'unit', 'anomaly', state.unit === 'anomaly')}`;
    const hints = { hotDry: '仅当“高温距平≥2℃”且“根区偏干或降雨偏少”同时出现时才标记。', waterAnomaly: '相对常态 = 实际土壤水分 ÷ 2017–2025同期均值 × 100%；100%为常态。' };
    if (hints[state.metric]) html += `<span class="control-hint">${hints[state.metric]}</span>`;
    $('controlRow').innerHTML = html;
    document.querySelectorAll('[data-control]').forEach(b => b.onclick = () => { if (b.disabled) return; state[b.dataset.control] = b.dataset.value; updateControlRow(); refreshMap(); updateSummary(); });
  }
  function regionDetail(r) {
    state.selected = r; refreshMap();
    if (r.region_risk_publish_allowed === false) {
      $('detail').innerHTML = `<h2>${esc(r.region)}</h2><p class="detail-note">${esc(r.spatial_note_cn || '行政区多点聚合区域估计。')}</p><h3>行政区多点聚合天气</h3><div class="forecast-brief">近30日区域平均降雨：${mm(r.rain_30d_mm)}；近30日最高温平均：${num(r.temp_max_30d_c) === null ? '缺测' : `${num(r.temp_max_30d_c).toFixed(1)}℃`}。<br>区域内部样点累计降雨：P10 ${mm(r.rain_30d_p10_mm)}；P50 ${mm(r.rain_30d_p50_mm)}；P90 ${mm(r.rain_30d_p90_mm)}。<br>未来7日区域平均预报降雨：${mm(r.forecast_rain_1_7d_mm)}；未来15日：${mm(r.forecast_rain_1_15d_mm)}。<br>有效覆盖率：${pc(r.observation_coverage)}；参与格点：${num(r.grid_point_count) ?? '缺测'}。<br><small>土壤、温度距平和综合供应风险尚未完成同口径区域聚合，当前不展示。</small></div>`;
      const rain30 = rain30Value(r), temp30 = temp30Value(r);
      const sourceDays = recentRows(r).filter(day => [day.precipitation_mm, day.temperature_mean_c ?? day.temp_mean_c, day.soil_moisture_layer1].some(x => num(x) !== null)).length;
      const oldSummary = `近30日区域平均降雨：${mm(r.rain_30d_mm)}；近30日最高温平均：${num(r.temp_max_30d_c) === null ? '缺测' : `${num(r.temp_max_30d_c).toFixed(1)}℃`}。`;
      const newSummary = `近30日有源日累计降雨：${rain30.value === null ? '缺测' : `${mm(rain30.value)}（有源${rain30.days}/30日）`}；近30日有源日均温：${temp30.value === null ? '缺测' : `${temp30.value.toFixed(1)}℃（有源${temp30.days}/30日）`}。`;
      const oldQuantiles = `区域内部样点累计降雨：P10 ${mm(r.rain_30d_p10_mm)}；P50 ${mm(r.rain_30d_p50_mm)}；P90 ${mm(r.rain_30d_p90_mm)}。`;
      const oldCoverage = `有效覆盖率：${pc(r.observation_coverage)}；参与格点：${num(r.grid_point_count) ?? '缺测'}。`;
      $('detail').innerHTML = $('detail').innerHTML
        .replace(oldSummary, newSummary)
        .replace(oldQuantiles, '区域内部 P10/P50/P90：当前没有完整 30 日同口径样点序列，保留为缺测。')
        .replace(oldCoverage, `有效有源日：${sourceDays}/30；参与格点：${num(r.grid_point_count) ?? '缺测'}。`);
      const chartPanel = window.OilDetailCharts?.panel(r, {
        cropName: '棕榈油', regionName: r.region, countryName: COUNTRY[r.country] || r.country,
        riskLabel: '天气明细'
      });
      if (chartPanel) {
        $('detail').innerHTML = $('detail').innerHTML.replace(
          '土壤、温度距平和综合供应风险尚未完成同口径区域聚合，当前不展示。',
          '综合供应风险尚未重算；以下仅展示已验证的降雨、日均温与土壤水分明细，不把 IFS 初步值标为 ERA5-Land。'
        ) + chartPanel.html;
        requestAnimationFrame(() => window.OilDetailCharts.render(r, state.dailyHistory.get(r.weather_region_id) || [], chartPanel.key));
      }
      return;
    }
    const supply = window.PalmRisk.classifyPalmSupplyRisk(r, { basis: state.basis }), rainState = supply.moduleStates.rain, heatState = supply.moduleStates.heatDry, waterState = supply.moduleStates.water;
    const spatialText = r.spatial_note_cn || '当前天气值为空间代表值；作物种植区加权聚合完成前，不代表全行政区平均状况。';
    const conclusion = `<section class="detail-chart-section"><h3>代表点监测提示（非区域风险）</h3><div class="forecast-brief"><b>代表点综合信号：${supply.level === null ? '暂无足够数据' : `${supply.level}级 ${supply.label}`}</b><br>降雨：${rainState.level === null ? '证据不足' : `${rainState.level}级 ${rainState.direction}`}；热干：${heatState.level === null ? '证据不足' : `${heatState.level}级 ${heatState.label}`}；水分：${waterState.level === null ? '证据不足' : `${waterState.level}级 ${waterState.direction}`}。<br>${esc(supply.adjustments.join('；') || supply.evidence.slice(0, 2).join('；') || '当前未发现明确共振信号。')}<br><small>未来修复可能：${rainState.repairSignal === 'repair' ? '未来降雨存在一定修复信号。' : rainState.repairSignal === 'no_relief' ? '未来降雨仍偏少，短期修复有限。' : '预报或常态基准不足，暂不判断。'}</small></div></section>`;
    const chartPanel = window.OilDetailCharts?.panel(r, {
      cropName: '棕榈油', regionName: r.region, countryName: COUNTRY[r.country] || r.country,
      riskLabel: r.risk_label_v4_cn || r.risk_level_v3_cn || '持续跟踪'
    });
    if (chartPanel) {
      $('detail').innerHTML = conclusion + `<p class="detail-note">${esc(spatialText)}</p>` + chartPanel.html;
      requestAnimationFrame(() => window.OilDetailCharts.render(r, state.dailyHistory.get(r.weather_region_id) || [], chartPanel.key));
      return;
    }
    state.selected = r; refreshMap(); const root = num(r.rootzone_percentile), surf = num(r.surface_percentile), heat = heatScore(r), dry = dryScore(r, 'root');
    const rainEvents = `极端降雨日 ${num(r.extreme_rain_days_30d) ?? '—'}；连续无雨 ${num(r.current_dry_spell_days) ?? '—'} 天`;
    const heatText = heat ? ['','轻度热干：高温与一项偏干信号并存','重点热干：高温、根区偏干及降雨偏少并存','严重热干：高温≥3℃、根区P<20且降雨偏少'][heat] : '未触发热干：需要高温（距平≥2℃）与偏干条件同时成立。';
    const waterText = `根区：${num(r.soil_water_rootzone) === null ? '缺测' : `${num(r.soil_water_rootzone).toFixed(3)} m³/m³`}（相对常态 ${pc(waterRelative(r, 'root'))}）；表层：${num(r.soil_water_surface) === null ? '缺测' : `${num(r.soil_water_surface).toFixed(3)} m³/m³`}（相对常态 ${pc(waterRelative(r, 'surface'))}）。`;
      $('detail').innerHTML = `<h2>${esc(r.region)}</h2><p class="detail-note">${COUNTRY[r.country]} · 点击地图图层可切换指标；雨/旱/热圆点是事件提示，不是另一套底图。</p><h3>当前风险</h3><div class="forecast-brief">${esc(r.risk_reason_cn || '暂无风险说明')}<br>近30日降雨：${mm(r.rain_30d_mm)}；降雨距平：${mm(r.rain_30d_anomaly_mm_2017_2025)}（同期基准 ${mm(r.rain_30d_baseline_2017_2025_mm)}，相对常态 ${pc(r.rain_30d_ratio_2017_2025)}）<br>${rainEvents}</div><h3>热干和极端天气</h3><div class="forecast-brief">最高温：${num(r._weather?.temp_max_c) === null ? '缺测' : `${num(r._weather.temp_max_c).toFixed(1)}℃`}；最高温距平：${num(r.temp_max_anomaly_c) === null ? '缺测' : `${num(r.temp_max_anomaly_c).toFixed(1)}℃`}。<br>${heatText}</div><h3>水分</h3><div class="forecast-brief">${waterText}<br>相对常态 = 实际土壤水分 ÷ 2017–2025同期均值 × 100%；100%为常态。</div><h3>数据口径</h3><div class="forecast-brief">历史降雨优先使用 CDS ERA5-Land，CDS 尚未发布的最新日期由 Open‑Meteo ECMWF IFS 补齐；近30日严格取截止日及此前29个日历日，历史同期基准为2017–2025。覆盖率不足的区域会标记为部分样点参考。</div>`;
  }
  async function buildMap() {
    state.map = L.map('map', { minZoom: 3, maxZoom: 9 }).setView([1.5, 108], 4); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(state.map);
    for (const [country, file] of [['Indonesia','indonesia_admin1.geojson'], ['Malaysia','malaysia_admin1.geojson']]) { const json = await getJSON(`admin1_geojson/${file}`); const group = L.geoJSON(json, { style: f => style(rowFor(country, f), country), onEachFeature: (f, l) => { l._row = rowFor(country, f); l._country = country; l.bindTooltip(l._row ? buildPalmTooltip(l._row) : `${esc(featureName(f))}<br>${COUNTRY[country]}`, { sticky: true }); l.on('click', () => l._row && regionDetail(l._row)); } }).addTo(state.map); state.geo.push(group); }
    state.map.fitBounds(L.featureGroup(state.geo).getBounds().pad(.04));
  }
  async function init() {
    try {
      await window.LegendUtils?.load();
      const [rain, risk, history, meta] = await Promise.all(['palm_rain_region_latest.json','palm_region_risk_latest.json','palm_rain_history_90d.json','palm_rain_meta.json'].map(getJSON));
      const weather = [], anomaly = [], forecast = [];
      const extra = new Map(risk.map(r => [r.weather_region_id, r])), weatherBy = new Map(weather.map(r => [r.weather_region_id, r])), anomalyBy = new Map(anomaly.map(r => [r.weather_region_id, r])), forecastBy = new Map();
      forecast.forEach(x => { if (!forecastBy.has(x.weather_region_id)) forecastBy.set(x.weather_region_id, []); forecastBy.get(x.weather_region_id).push(x); });
      state.history = history; state.dailyHistory = new Map(Object.entries(history));
      const mergedRows = rain.map(r => {
        const merged = { ...(extra.get(r.weather_region_id) || {}) };
        Object.entries(r).forEach(([key, value]) => { if (value !== null && value !== undefined) merged[key] = value; });
        return { ...merged, _weather: weatherBy.get(r.weather_region_id), _anomaly: anomalyBy.get(r.weather_region_id), _forecast: forecastBy.get(r.weather_region_id) || [] };
      });
      const observedCountryTotals = new Map();
      mergedRows.forEach(r => { const p = num(r.production_tonnes); if (p !== null) observedCountryTotals.set(r.country, (observedCountryTotals.get(r.country) || 0) + p); });
      const observedTotal = [...observedCountryTotals.values()].reduce((s, x) => s + x, 0);
      state.rows = mergedRows.map(r => {
        const production = num(r.production_tonnes), countryTotal = observedCountryTotals.get(r.country) || 0;
        return {
          ...r,
          production_share_country: num(r.production_share_country) ?? (production !== null && countryTotal ? production / countryTotal : null),
          production_share_se_asia: num(r.production_share_se_asia) ?? (production !== null && observedTotal ? production / observedTotal : null),
        };
      });
      $('status').textContent = `最新行政区多点聚合降雨：${state.rows[0]?.date_end || '缺测'} ｜ 数据更新时间：${meta.generated_at || '缺测'} ｜ 当前地图：近30日区域平均降雨`;
      $('method').textContent = '历史天气使用 EDH/ERA5-Land；最新尾段明确标记为 IFS PRELIMINARY，不冒充 ERA5-Land。所有值在行政区边界内按多点等面积聚合。由于目前没有经核验的区内油棕面积分布，不使用推测性作物权重。近30日指标显示截止日此前有源日的实际累计/均值，缺失日不填充；覆盖率不足的区域标记为部分样点参考。';
      updateControlRow(); controls(); updateSummary(); await buildMap(); regionDetail([...state.rows].sort((a,b) => (b.production_tonnes || 0) - (a.production_tonnes || 0))[0]);
    } catch (e) { console.error(e); $('status').textContent = `数据加载失败：${e?.message || '未知错误'}。`; }
  }
  init();
})();
