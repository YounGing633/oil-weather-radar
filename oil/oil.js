(() => {
  const $ = id => document.getElementById(id);
  const CONFIG = {
    soybean: { name: '豆油', crop: 'soybean', color: '#a16207', en: 'Soybean Oil Weather & Supply Risk Monitor', focus: '重点关注播种、开花、结荚与鼓粒阶段的干旱、高温和作业延误。', layers: ['risk', 'production', 'rain', 'heat', 'moisture', 'operation', 'forecast'], special: '以大豆产量作为豆油天气暴露代理，并优先展示美国、巴西、阿根廷等产区的生育进度证据。' },
    rapeseed_canola: { name: '菜油', crop: 'rapeseed_canola', color: '#2563eb', en: 'Rapeseed Oil Weather & Supply Risk Monitor', focus: '区分冬菜籽与春菜籽，重点关注越冬返青、开花结荚及收获期的水分和作业风险。', layers: ['risk', 'production', 'rain', 'heat', 'moisture', 'operation', 'forecast'], special: '以菜籽/油菜籽产量作为菜油天气暴露代理；同一国家存在多套口径时，优先采用有省州明细的官方数据。' },
    sunflower: { name: '葵油', crop: 'sunflower', color: '#7c3aed', en: 'Sunflower Oil Weather & Supply Risk Monitor', focus: '重点关注现蕾、开花、授粉和灌浆阶段的高温与根区水分压力。', layers: ['risk', 'production', 'rain', 'heat', 'moisture', 'operation', 'forecast'], special: '以葵花籽产量作为葵油天气暴露代理，俄罗斯等主产区按可用地区数据聚合。' },
    coconut: { name: '椰子油', crop: 'coconut', color: '#0891b2', en: 'Coconut Oil Weather & Supply Risk Monitor', focus: '多年生作物不使用年度播种进度，重点关注持续少雨、根区水分和未来补水。', layers: ['risk', 'production', 'rain', 'heat', 'moisture', 'operation', 'forecast'], special: '按印尼、菲律宾可用椰子产区数据汇总，强调连续水分条件而非单一生育周。' }
  };
  const LAYERS = {
    risk: ['综合风险', '颜色表示产量加权后的综合天气风险。'], production: ['产量权重', '颜色深浅表示当前数据覆盖的产量规模。'],
    moisture: ['土壤水分', '相对常态 = 实际土壤水分 ÷ 2017–2025同期均值 × 100%；100%为常态。'], rain: ['近30日降雨', '相对1991—2020同期的降雨比例。'],
    heat: ['热干风险', '高温距平与降雨偏少或根区偏干同时出现时，才判为热干风险。'], operation: ['作业风险', '强降雨、收获或田间作业受影响的产量占比。'], forecast: ['未来7日降雨', '未来7日累计降雨，辅助判断水分压力能否缓解。']
  };
  const METRIC_GROUPS = {
    risk: [['risk', '综合风险'], ['production', '产量权重']],
    production: [['production', '产量权重']],
    moisture: [['moisture', '根区相对常态'], ['moistureSurface', '表层相对常态'], ['moistureActual', '根区绝对值'], ['moistureSurfaceActual', '表层绝对值']],
    rain: [['rain', '30日相对常年'], ['rainActual', '30日累计'], ['forecast', '未来7日'], ['forecast16', '未来16日']],
    heat: [['heatDry', '热干风险等级'], ['heat', '最高温距平']],
    operation: [['operation', '作业影响']],
    forecast: [['forecast', '未来7日'], ['forecast16', '未来16日']]
  };
  const FILES = { Argentina: 'argentina_admin1.geojson', Australia: 'australia_admin1.geojson', Brazil: 'brazil_admin1.geojson', Canada: 'canada_admin1.geojson', Indonesia: 'indonesia_admin1.geojson', Philippines: 'philippines_admin1.geojson', Russia: 'russia_admin1.geojson', 'United States': 'united_states_admin1.geojson' };
  const ALIAS = { 'United States of America': 'United States', USA: 'United States', Turkey: 'Türkiye', 'Russian Federation': 'Russia' };
  const key = new URLSearchParams(location.search).get('crop') || 'soybean';
  const crop = CONFIG[key] || CONFIG.soybean;
  let countries = [], regions = [], worldGeo, map, mapLayers = [], labels = [], selectedLayer, historyById = new Map();
  let scope = 'all', section = 'risk', metric = 'risk', labelMode = 'production';
  const geoCache = new Map();
  const num = x => Number.isFinite(Number(x)) ? Number(x) : null;
  const n = x => num(x) ?? 0;
  const fmt = x => n(x) >= 1e6 ? `${(n(x) / 1e6).toFixed(1)} Mt` : `${Math.round(n(x) / 1e3)} kt`;
  const pc = x => num(x) === null ? '—' : `${Math.round(num(x) * 100)}%`;
  const val = (x, d = 1, suffix = '') => num(x) === null ? '—' : `${num(x).toFixed(d)}${suffix}`;
  const latestObservationDate = rows => {
    const dates = rows.map(r => r?.latest_raw_weather_date).filter(Boolean).sort();
    return dates.length ? String(dates[dates.length - 1]).slice(0, 10) : '暂缺';
  };
  const esc = x => String(x ?? '—').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const canonical = x => ALIAS[x] || x;
  const norm = x => String(x || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/russia|oblast|krai|republic|autonomous|province|region|state|district|of|the/g, '').replace(/[^a-z0-9]/g, '');
  const riskCode = r => r.weighted_risk_level || r.risk_level_v3_code || ({ 4: 'severe', 3: 'pressure', 2: 'watch', 1: 'mild', 0: 'normal' }[r.risk_level_v3] || 'none');
  const riskNumber = r => num(r.risk_level_v3 ?? r.weighted_risk_level) ?? ({ severe: 4, pressure: 3, watch: 2, mild: 1, normal: 0 }[riskCode(r)] ?? null);
  const riskColor = r => window.LegendUtils?.getRiskLevel(riskNumber(r), crop.riskProfile).color || '#bdbdbd';
  const riskText = r => r.weighted_risk_level_cn || r.risk_level_v3_cn || '暂缺';
  const currentRegions = () => scope === 'all' ? regions : regions.filter(r => canonical(r.country) === scope);

  // The map must use the same latest observation as the detail charts.  The
  // risk snapshot is produced by a separate pipeline and can otherwise be
  // older (or have an empty weather field) while the chart is current.
  function applyLatestWeatherSnapshot(rows, history) {
    const latest = new Map();
    history.forEach(point => {
      const id = point?.weather_region_id, date = String(point?.date || '');
      if (!id || !date || (latest.get(id)?.date || '') > date) return;
      latest.set(id, point);
    });
    return rows.map(row => {
      const point = latest.get(row.weather_region_id);
      if (!point) return row;
      const actual = num(point.precipitation_30d_actual_mm ?? point.precip_30d_actual);
      const normal = num(point.precipitation_30d_normal_mm_2017_2025 ?? point.precipitation_30d_normal_mm ?? point.precip_30d_normal);
      const ratio = num(point.precipitation_30d_ratio_pct_2017_2025 ?? point.precipitation_30d_ratio_pct);
      const anomaly = actual !== null && normal !== null ? actual - normal : num(point.precipitation_30d_anomaly_mm_2017_2025 ?? point.precipitation_30d_anomaly_mm);
      return actual === null && normal === null && ratio === null && anomaly === null ? row : {
        ...row,
        precip_30d_actual: actual,
        precip_30d_normal: normal,
        precip_30d_anomaly_mm: anomaly,
        precip_30d_ratio_pct: ratio ?? (actual !== null && normal > 0 ? actual / normal * 100 : null),
        weather_snapshot_date: point.date
      };
    });
  }

  function dedupe(rows) {
    const chosen = new Map();
    rows.forEach(r => {
      const id = r.country_iso3 || canonical(r.country), old = chosen.get(id);
      const score = x => (x.source_name === 'faostat' ? 0 : 10000) + n(x.region_count);
      if (!old || score(r) > score(old)) chosen.set(id, { ...r, country: canonical(r.country) });
    });
    return [...chosen.values()].sort((a, b) => n(b.total_production_tonnes) - n(a.total_production_tonnes));
  }

  function setTitle() {
    document.documentElement.style.setProperty('--accent', crop.color);
    $('pageTitle').textContent = `${crop.name}产区气象与供应风险`; $('pageSubtitle').textContent = crop.en; document.title = `${crop.name}产区气象与供应风险`;
    document.querySelector(`[data-crop-link="${key}"]`)?.classList.add('active');
  }

  function weightedShare(rows, test) {
    const total = rows.reduce((s, r) => s + n(r.production_tonnes), 0);
    return total ? rows.reduce((s, r) => s + (test(r) ? n(r.production_tonnes) : 0), 0) / total : null;
  }

  // A heat-only anomaly is not automatically a heat-dry event.  The score is
  // deliberately based on the same rainfall and root-zone moisture fields
  // shown elsewhere in this page, so the map and the supporting evidence agree.
  function heatDryScore(r) {
    const heat = num(r.temp_max_anomaly_c), root = num(r.rootzone_percentile), rain = num(r.precip_30d_ratio_pct);
    if (heat === null) return null;
    const dryRoot = root !== null && root < 30, dryRain = rain !== null && rain < 85;
    if (heat < 2 || (!dryRoot && !dryRain)) return 0;
    if (heat >= 3 && dryRoot && (root < 20 || (dryRain && rain < 70))) return 3;
    return dryRoot && dryRain ? 2 : 1;
  }

  function summary() {
    const cr = scope === 'all' ? countries : countries.filter(r => r.country === scope), rr = currentRegions();
    const total = cr.reduce((s, r) => s + n(r.total_production_tonnes), 0), disturbed = cr.reduce((s, r) => s + n(r.disturbed_production_tonnes), 0);
    let a, b;
    if (key === 'coconut') { a = ['降雨偏少暴露', pc(weightedShare(rr, r => n(r.precip_30d_ratio_pct) < 85)), '近30日降雨低于常年85%']; b = ['根区偏干暴露', pc(weightedShare(rr, r => n(r.rootzone_percentile) < 30)), '根区历史同期P<30']; }
    else if (key === 'sunflower') { a = ['高温暴露', pc(weightedShare(rr, r => n(r.temp_max_anomaly_c) >= 2)), '最高温距平≥2℃']; b = ['根区偏干暴露', pc(weightedShare(rr, r => n(r.rootzone_percentile) < 30)), '开花灌浆期重点关注']; }
    else if (key === 'rapeseed_canola') { a = ['根区近期偏干暴露', pc(weightedShare(rr, r => n(r.rootzone_percentile) < 30)), '根区最近90日百分位 P<30；春菜籽及开花结荚阶段']; b = ['田间作业风险', pc(weightedShare(rr, r => n(r.operation_affected_share) > 0)), '降雨/收获作业信号']; }
    else { a = ['敏感期水分压力', pc(weightedShare(rr, r => n(r.rootzone_percentile) < 30 && /花|荚|粒/.test(r.current_growth_stage_cn || ''))), '开花—结荚—鼓粒']; b = ['进度证据覆盖', pc(weightedShare(rr, r => r.resolved_stage_source === 'crop_progress')), '采用作物进度修正生育期']; }
    $('summaryTitle').textContent = `${crop.name}供应风险概览`;
    $('summaryNote').textContent = `${scope === 'all' ? `覆盖 ${cr.length} 个国家 / 地区` : `聚焦 ${cr[0]?.country_cn || scope} 的 ${rr.length} 个产区`} · 按产量权重统计`;
    const cards = [['覆盖产量', fmt(total), cr[0]?.production_basis_cn || '油料作物天气暴露代理'], ['重点暴露产量', fmt(disturbed), `占覆盖产量 ${pc(total ? disturbed / total : null)}`], a, b];
    $('metrics').innerHTML = cards.map(x => `<article class="card"><span>${x[0]}</span><strong>${x[1]}</strong><small>${x[2]}</small></article>`).join('');
  }

  function scopeButtons() {
    $('scopeSwitch').innerHTML = `<button class="${scope === 'all' ? 'active' : ''}" data-scope="all">全球</button>` + countries.map(r => `<button class="${scope === r.country ? 'active' : ''}" data-scope="${esc(r.country)}">${esc(r.country_cn || r.country)}</button>`).join('');
    document.querySelectorAll('[data-scope]').forEach(b => b.onclick = async () => { scope = b.dataset.scope; scopeButtons(); summary(); await renderMap(true); selectDefault(); });
  }

  function metricButtons() {
    if (!crop.layers.includes(section)) section = crop.layers[0];
    const variants = METRIC_GROUPS[section] || [[section, LAYERS[section][0]]];
    if (!variants.some(([id]) => id === metric)) metric = variants[0][0];
    $('layerGroups').innerHTML = crop.layers.map(k => `<button class="${section === k ? 'active' : ''}" data-section="${k}">${LAYERS[k][0]}</button>`).join('');
    $('layerMetrics').innerHTML = `<b>指标</b>${variants.map(([id, label]) => `<button class="${metric === id ? 'active' : ''}" data-metric="${id}">${label}</button>`).join('')}`;
    $('viewHint').textContent = `${crop.focus} ${LAYERS[section][1]}`;
    document.querySelectorAll('[data-section]').forEach(b => b.onclick = async () => { section = b.dataset.section; metric = (METRIC_GROUPS[section] || [[section]])[0][0]; metricButtons(); await renderMap(false); });
    document.querySelectorAll('[data-metric]').forEach(b => b.onclick = async () => { metric = b.dataset.metric; metricButtons(); await renderMap(false); });
  }

  function metricValue(r) {
    if (metric === 'production') return n(r.total_production_tonnes ?? r.production_tonnes);
    if (metric === 'heatDry') return heatDryScore(r);
    if (metric === 'operation' && num(r.operation_affected_share) !== null) return num(r.operation_affected_share);
    if (metric === 'moisture' || metric === 'moistureSurface') {
      const root = metric === 'moisture';
      const actual = num(root ? r.soil_water_rootzone : r.soil_water_surface);
      const normal = num(root ? (r.soil_water_rootzone_normal ?? r.rootzone_normal) : (r.soil_water_surface_normal ?? r.surface_normal));
      if (actual !== null && normal !== null && normal > 0) return actual / normal * 100;
      // Country cards are production-weighted summaries and do not persist
      // raw soil fields.  Derive the same ratio from their constituent regions.
      if (r.total_production_tonnes !== undefined) {
        const rr = regions.filter(x => canonical(x.country) === canonical(r.country));
        const valid = rr.filter(x => {
          const a = num(root ? x.soil_water_rootzone : x.soil_water_surface);
          const b = num(root ? (x.soil_water_rootzone_normal ?? x.rootzone_normal) : (x.soil_water_surface_normal ?? x.surface_normal));
          return a !== null && b !== null && b > 0;
        });
        const weight = valid.reduce((s, x) => s + n(x.production_tonnes), 0);
        if (weight) {
          const weightedActual = valid.reduce((s, x) => s + num(root ? x.soil_water_rootzone : x.soil_water_surface) * n(x.production_tonnes), 0) / weight;
          const weightedNormal = valid.reduce((s, x) => s + num(root ? (x.soil_water_rootzone_normal ?? x.rootzone_normal) : (x.soil_water_surface_normal ?? x.surface_normal)) * n(x.production_tonnes), 0) / weight;
          return weightedNormal > 0 ? weightedActual / weightedNormal * 100 : null;
        }
      }
      return null;
    }
    const field = { moistureActual: 'soil_water_rootzone', moistureSurfaceActual: 'soil_water_surface', rain: 'precip_30d_ratio_pct', rainActual: 'precip_30d_actual', heat: 'temp_max_anomaly_c', operation: 'operation_affected_share', forecast: 'forecast_7d_precip', forecast16: 'forecast_16d_precip' }[metric];
    if (!field) return null;
    if (num(r[field]) !== null) return num(r[field]);
    if (r.total_production_tonnes !== undefined) {
      const rr = regions.filter(x => canonical(x.country) === canonical(r.country) && num(x[field]) !== null);
      const weight = rr.reduce((s, x) => s + n(x.production_tonnes), 0);
      return weight ? rr.reduce((s, x) => s + num(x[field]) * n(x.production_tonnes), 0) / weight : null;
    }
    return null;
  }

  function metricColor(r, rows) {
    if (metric === 'risk') return riskColor(r); const x = metricValue(r); if (x === null) return '#cbd3d6';
    if (metric === 'production') { const max = Math.max(...rows.map(q => metricValue(q) || 0), 1), p = x / max; return p < .15 ? '#e8eef0' : p < .4 ? '#aacbd0' : p < .7 ? crop.color + 'aa' : crop.color; }
    const sharedKey = metric === 'moisture' || metric === 'moistureSurface' ? 'soil_relative' : metric === 'moistureActual' || metric === 'moistureSurfaceActual' ? 'soil_absolute' : metric === 'rain' ? 'rain_ratio' : metric === 'rainActual' ? (crop.crop === 'coconut' ? 'rain30_tropical' : 'rain30_oilseed') : metric === 'heat' ? 'temp_anomaly' : metric === 'heatDry' ? 'hot_dry' : metric === 'operation' ? 'operation_share' : metric === 'forecast' ? 'forecast_7d_absolute' : metric === 'forecast16' ? 'forecast_16d_absolute' : null;
    if (sharedKey && window.LegendUtils) return window.LegendUtils.classifyMetric(sharedKey, x).color;
    if (metric === 'heatDry') return x < .5 ? '#e8eef0' : x < 1.5 ? '#e8d98b' : x < 2.5 ? '#e28a25' : '#c23b22';
    if (metric === 'heat') return x < 0 ? '#8ec6d8' : x < 1 ? '#e8d98b' : x < 2 ? '#e9a35b' : x < 3 ? '#d6604d' : '#8c2d24';
    if (metric === 'operation') return x <= 0 ? '#e8eef0' : x < .15 ? '#e8d98b' : x < .4 ? '#e28a25' : '#c23b22';
    return x < 10 ? '#8c2d24' : x < 25 ? '#e28a25' : x < 50 ? '#e8d98b' : x < 100 ? '#78a85b' : '#2474a6';
  }

  function legend() {
    const sharedKey = metric === 'risk' ? 'risk' : metric === 'moisture' || metric === 'moistureSurface' ? 'soil_relative' : metric === 'moistureActual' || metric === 'moistureSurfaceActual' ? 'soil_absolute' : metric === 'rain' ? 'rain_ratio' : metric === 'rainActual' ? (crop.crop === 'coconut' ? 'rain30_tropical' : 'rain30_oilseed') : metric === 'heat' ? 'temp_anomaly' : metric === 'heatDry' ? 'hot_dry' : metric === 'operation' ? 'operation_share' : metric === 'forecast' ? 'forecast_7d_absolute' : metric === 'forecast16' ? 'forecast_16d_absolute' : null;
    if (sharedKey === 'risk' && window.LegendUtils) { const r = window.LegendUtils.getRiskLegend(); $('legend').innerHTML = `<b>综合供应风险</b><br>${r.bins.map(x => `<i style="background:${x.color}"></i>${x.label}`).join('<br>')}<br><i style="background:${r.noData.color}"></i>${r.noData.label}`; return; }
    const shared = window.LegendUtils?.getMetricLegend(sharedKey);
    if (shared) { $('legend').innerHTML = `<b>${shared.title}${shared.baseline ? `（${shared.baseline}）` : ''}</b><br>${shared.bins.map(x => `<i style="background:${x.color}"></i>${x.label}`).join('<br>')}<br><i style="background:${shared.noData.color}"></i>${shared.noData.label}${shared.note ? `<br><small>${shared.note}</small>` : ''}`; return; }
    const sets = {
      risk: [['#c23b22', '显著压力'], ['#e28a25', '重点压力'], ['#eabf36', '关注'], ['#2f8a62', '正常/偏支持']], production: [['#e8eef0', '较低'], [crop.color + 'aa', '中等'], [crop.color, '较高']],
      moisture: [['#8c2d24', '<70% 严重偏干'], ['#d6604d', '70—84% 明显偏干'], ['#f3d36a', '85—99% 略偏干'], ['#78b878', '100—115% 正常'], ['#55b5a9', '116—130% 偏湿'], ['#2166ac', '>130% 显著偏湿']], moistureSurface: [['#8c2d24', '<70% 严重偏干'], ['#d6604d', '70—84% 明显偏干'], ['#f3d36a', '85—99% 略偏干'], ['#78b878', '100—115% 正常'], ['#55b5a9', '116—130% 偏湿'], ['#2166ac', '>130% 显著偏湿']], moistureActual: [['#8c2d24', '<0.12'], ['#d6604d', '0.12—0.20'], ['#e8d98b', '0.20—0.30'], ['#2474a6', '>0.40']], moistureSurfaceActual: [['#8c2d24', '<0.12'], ['#d6604d', '0.12—0.20'], ['#e8d98b', '0.20—0.30'], ['#2474a6', '>0.40']], rain: [['#5b1803', '<50% 严重偏少'], ['#b84a22', '50—69% 明显偏少'], ['#e58b25', '70—84% 偏少'], ['#f3d36a', '85—99% 略偏少'], ['#78b878', '100—115% 正常至略偏多'], ['#55b5a9', '116—150% 偏多'], ['#2166ac', '>150% 显著偏多']], rainActual: [['#8c2d24', '<10mm'], ['#e28a25', '10—25mm'], ['#e8d98b', '25—50mm'], ['#2474a6', '>100mm']], forecast16: [['#8c2d24', '<10mm'], ['#e28a25', '10—25mm'], ['#e8d98b', '25—50mm'], ['#2474a6', '>100mm']],
      heatDry: [['#e8eef0', '未触发'], ['#e8d98b', '轻度：高温+一项偏干'], ['#e28a25', '重点：高温+双偏干'], ['#c23b22', '严重：高温≥3℃且显著偏干']], heat: [['#8ec6d8', '<0℃'], ['#e8d98b', '0—1℃'], ['#e9a35b', '1—2℃'], ['#8c2d24', '≥3℃']], operation: [['#e8eef0', '无信号'], ['#e8d98b', '<15%'], ['#e28a25', '15—40%'], ['#c23b22', '>40%']], forecast: [['#8c2d24', '<10mm'], ['#e28a25', '10—25mm'], ['#e8d98b', '25—50mm'], ['#2474a6', '>100mm']]
    };
    const label = (METRIC_GROUPS[section] || []).find(([id]) => id === metric)?.[1] || LAYERS[section][0];
    $('legend').innerHTML = `<b>${label}</b><br>${sets[metric].map(x => `<i style="background:${x[0]}"></i>${x[1]}`).join('<br>')}<br><small>灰色：暂无该口径数据</small>`;
  }

  const featureCountry = f => countries.find(r => canonical(r.country) === canonical(f.properties?.name));
  function featureRegion(f, rows) {
    const p = f.properties || {}, names = [p.shapeName, p.source_shapeName, p.NAME_1, p.PROVINSI, p.VARNAME_1].filter(Boolean).map(norm);
    return rows.find(r => { const rn = norm(r.region_name), bid = norm(r.boundary_id); return names.some(x => x && (x === rn || rn.includes(x) || x.includes(rn) || (bid && x === bid))); });
  }
  async function loadAdminGeo(country) {
    const file = FILES[country]; if (!file) return null;
    if (!geoCache.has(file)) geoCache.set(file, fetch(`../data/admin1_geojson/${file}`).then(r => r.ok ? r.json() : null).catch(() => null));
    return geoCache.get(file);
  }
  function clearMap() { mapLayers.forEach(x => map.removeLayer(x)); labels.forEach(x => map.removeLayer(x)); if (selectedLayer) map.removeLayer(selectedLayer); mapLayers = []; labels = []; selectedLayer = null; }
  function labelText(r, total) { const x = n(r.total_production_tonnes ?? r.production_tonnes); return labelMode === 'share' ? pc(x / Math.max(total, 1)) : fmt(x); }

  async function renderMap(fit) {
    clearMap();
    if (scope === 'all') {
      const rows = countries, total = rows.reduce((s, r) => s + n(r.total_production_tonnes), 0);
      const group = L.geoJSON(worldGeo, { style: f => { const r = featureCountry(f); return { color: r ? '#52636b' : '#c9d1d2', weight: r ? 1.4 : .5, fillColor: r ? metricColor(r, rows) : '#edf1f1', fillOpacity: r ? .66 : .12 }; }, onEachFeature: (f, l) => { const r = featureCountry(f); if (!r) return; l._row = r; l.bindTooltip(`${esc(r.country_cn || r.country)}<br>${riskText(r)} · ${fmt(r.total_production_tonnes)}`, { sticky: true }); l.on('click', () => detailCountry(r)); } }).addTo(map);
      mapLayers.push(group); if (labelMode !== 'off') group.eachLayer(l => { if (!l._row) return; labels.push(L.marker(l.getBounds().getCenter(), { interactive: false, icon: L.divIcon({ className: 'metric-label', html: labelText(l._row, total), iconSize: [66, 20], iconAnchor: [33, 10] }) }).addTo(map)); });
      if (fit) map.setView([23, 15], 2);
    } else {
      const rows = currentRegions(), total = rows.reduce((s, r) => s + n(r.production_tonnes), 0), geo = await loadAdminGeo(scope);
      if (geo) {
        const group = L.geoJSON(geo, { style: f => { const r = featureRegion(f, rows); return { color: r ? '#52636b' : '#c9d1d2', weight: r ? 1.4 : .6, fillColor: r ? metricColor(r, rows) : '#edf1f1', fillOpacity: r ? .7 : .12 }; }, onEachFeature: (f, l) => { const r = featureRegion(f, rows); if (!r) return; l._row = r; l.bindTooltip(`${esc(r.region_name_cn || r.region_name)}<br>${riskText(r)} · ${fmt(r.production_tonnes)}`, { sticky: true }); l.on('click', () => detailRegion(r)); } }).addTo(map);
        mapLayers.push(group); if (labelMode !== 'off') group.eachLayer(l => { if (!l._row) return; labels.push(L.marker(l.getBounds().getCenter(), { interactive: false, icon: L.divIcon({ className: 'metric-label', html: labelText(l._row, total), iconSize: [66, 20], iconAnchor: [33, 10] }) }).addTo(map)); }); if (fit) map.fitBounds(group.getBounds().pad(.08));
      } else {
        const group = L.featureGroup().addTo(map), max = Math.max(...rows.map(x => n(x.production_tonnes)), 1); mapLayers.push(group);
        rows.forEach(r => { if (num(r.lat) === null || num(r.lon) === null) return; const m = L.circleMarker([r.lat, r.lon], { radius: 6 + 13 * Math.sqrt(n(r.production_tonnes) / max), color: '#fff', weight: 1.5, fillColor: metricColor(r, rows), fillOpacity: .86 }).addTo(group); m.bindTooltip(`${esc(r.region_name_cn || r.region_name)}<br>${riskText(r)} · ${fmt(r.production_tonnes)}`); m.on('click', () => detailRegion(r)); }); if (fit && group.getLayers().length) map.fitBounds(group.getBounds().pad(.15));
      }
    }
    legend();
  }

  function badges(r) {
    const parts = [riskText(r), r.current_growth_stage_cn, r.resolved_stage_source === 'crop_progress' ? '进度已校正' : null, r.aggregation_confidence ? `可信度 ${r.aggregation_confidence}` : null].filter(Boolean);
    return `<div class="status-badges">${parts.map((x, i) => `<span class="status-badge ${i === 0 ? riskCode(r) : ''}">${esc(x)}</span>`).join('')}</div>`;
  }
  function detailCountry(r) {
    const top = regions.filter(x => canonical(x.country) === r.country).sort((a, b) => n(b.production_tonnes) - n(a.production_tonnes)).slice(0, 6);
    $('detail').innerHTML = `<h2>${esc(r.country_cn || r.country)}</h2><p class="detail-note">${crop.name}国家级天气与供应风险摘要</p>${badges(r)}<h3>当前判断</h3><div class="forecast-brief">${esc(r.dominant_risk_reason_cn || '暂无风险说明')}<br>${esc(r.production_impact_cn || '')}</div><h3>核心证据</h3><div class="data-grid"><div class="data-cell"><small>覆盖产量</small><b>${fmt(r.total_production_tonnes)}</b></div><div class="data-cell"><small>受扰产量占比</small><b>${pc(r.disturbed_share)}</b></div><div class="data-cell"><small>产量风险影响</small><b>${pc(r.yield_risk_affected_share)}</b></div><div class="data-cell"><small>作业风险影响</small><b>${pc(r.operation_affected_share)}</b></div></div><h3>天气与土壤</h3><div class="forecast-brief">${esc(r.weather_condition_summary_cn || '暂无天气摘要')}<br>${esc(r.soil_condition_summary_cn || '暂无土壤摘要')}</div><h3>未来变化</h3><div class="forecast-brief">${esc(r.forecast_summary_cn || '暂无预报摘要')}</div><h3>重点产区</h3><div class="region-list">${top.map(x => `<button class="region-row" data-region="${esc(x.weather_region_id)}"><b>${esc(x.region_name_cn || x.region_name)}</b><span>${riskText(x)} · ${fmt(x.production_tonnes)} · ${esc(x.current_growth_stage_cn || '阶段暂缺')}</span></button>`).join('') || '<p class="detail-note">暂无产区明细</p>'}</div><h3>品种口径</h3><p class="detail-note">${esc(crop.special)}</p>`;
    document.querySelectorAll('[data-region]').forEach(b => b.onclick = () => { const x = regions.find(q => q.weather_region_id === b.dataset.region); if (x) detailRegion(x); });
  }
  function riskTags(r) {
    const tags = Array.isArray(r.risk_tags) ? r.risk_tags : []; if (!tags.length) return '';
    return `<h3>风险标签</h3><div class="risk-tags">${tags.slice(0, 5).map(t => `<div class="risk-tag"><b>${esc(t.risk_label_cn || t.label_cn || t.risk_type || '风险信号')}</b><span>${esc(t.evidence_cn || t.risk_evidence_cn || '')}</span></div>`).join('')}</div>`;
  }
  function detailRegion(r) {
    const chartPanel = window.OilDetailCharts?.panel(r, {
      cropName: crop.name,
      regionName: r.region_name_cn || r.region_name,
      countryName: r.country_cn || r.country,
      riskLabel: r.risk_label_v4_cn || riskText(r)
    });
    if (chartPanel) {
      $('detail').innerHTML = `<button class="detail-back" id="detailBack">← 返回国家摘要</button>${chartPanel.html}`;
      $('detailBack').onclick = () => { const c = countries.find(x => x.country === canonical(r.country)); if (c) detailCountry(c); };
      requestAnimationFrame(() => window.OilDetailCharts.render(r, historyById.get(r.weather_region_id) || [], chartPanel.key));
      return;
    }
    const progress = r.progress_evidence_cn || (r.resolved_stage_source === 'crop_progress' ? '已使用作物进度数据校正当前生育期。' : '当前生育期主要依据作物历。');
    $('detail').innerHTML = `<button class="detail-back" id="detailBack">← 返回国家摘要</button><h2>${esc(r.region_name_cn || r.region_name)}</h2><p class="detail-note">${esc(r.country_cn || r.country)} · ${crop.name}产区证据</p>${badges(r)}<h3>当前判断</h3><div class="forecast-brief"><b>${esc(r.risk_label_v4_cn || riskText(r))}</b><br>${esc(r.risk_reason_cn || r.risk_evidence_cn || '暂无风险说明')}<br>${esc(r.production_impact_cn || r.current_operation_impact_cn || '')}</div><h3>关键数值</h3><div class="data-grid"><div class="data-cell"><small>产量 / 全国占比</small><b>${fmt(r.production_tonnes)} / ${pc(r.national_share)}</b></div><div class="data-cell"><small>根区 / 表层百分位</small><b>P${val(r.rootzone_percentile)} / P${val(r.surface_percentile)}</b></div><div class="data-cell"><small>近30日降雨</small><b>${val(r.precip_30d_actual, 1, 'mm')} / ${val(r.precip_30d_ratio_pct, 0, '%')}</b></div><div class="data-cell"><small>最高温距平</small><b>${val(r.temp_max_anomaly_c, 1, '℃')}</b></div><div class="data-cell"><small>未来7日降雨</small><b>${val(r.forecast_7d_precip, 1, 'mm')}</b></div><div class="data-cell"><small>未来16日降雨</small><b>${val(r.forecast_16d_precip, 1, 'mm')}</b></div></div><h3>生育期与进度</h3><div class="forecast-brief">${esc(r.current_growth_stage_cn || r.resolved_growth_stage || '生育期暂缺')}<br>${esc(progress)}</div>${riskTags(r)}<h3>未来变化</h3><div class="forecast-brief">${esc(r.forecast_summary_cn || '暂无预报摘要')}<br>${esc(r.future_yield_impact_cn || '')}</div><h3>数据口径</h3><p class="detail-note">来源：${esc(r.source_name)} ${esc(r.source_year || '')} · 聚合可信度：${esc(r.aggregation_confidence || r.rule_confidence || '暂缺')}</p>`;
    $('detailBack').onclick = () => { const c = countries.find(x => x.country === canonical(r.country)); if (c) detailCountry(c); };
  }
  function selectDefault() { const c = scope === 'all' ? countries[0] : countries.find(r => r.country === scope); if (c) detailCountry(c); }

  async function init() {
    await window.LegendUtils?.load(); setTitle(); metricButtons();
    try {
      const [cd, rd, world, weather, history, profileConfig] = await Promise.all(['../data/country_crop_risk_latest.json', '../data/admin_region_risk_latest.json', '../data/countries.geo.json', '../data/weather_latest.json', '../data/region_history_90d_v1.0d.json', '../assets/configs/crop_risk_profiles.json'].map(x => fetch(x).then(r => { if (!r.ok) throw Error(`无法读取 ${x}`); return r.json(); })));
      crop.riskProfile = profileConfig?.profiles?.[crop.crop] || null;
      countries = dedupe(cd.filter(r => r.crop_group === crop.crop && r.source_valid_for_frontend)); const allowed = new Set(countries.map(r => r.country));
      const candidates = applyLatestWeatherSnapshot(
        rd.filter(r => r.crop_group === crop.crop && r.source_valid_for_frontend && allowed.has(canonical(r.country))).map(r => ({ ...r, country: canonical(r.country) })),
        history
      );
      const countriesWithAdmin1 = new Set(candidates.filter(r => r.admin_level === 'admin1').map(r => r.country));
      regions = candidates.filter(r => !(r.admin_level === 'national' && countriesWithAdmin1.has(r.country)));
      historyById = new Map(); history.forEach(row => { if (!historyById.has(row.weather_region_id)) historyById.set(row.weather_region_id, []); historyById.get(row.weather_region_id).push(row); });
      worldGeo = world;
      map = L.map('map', { minZoom: 2, maxZoom: 8 }).setView([23, 15], 2); L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);
      scopeButtons(); summary(); await renderMap(true); selectDefault();
      $('status').textContent = `数据更新时间：${countries[0]?.updated_at || '暂缺'} · 最新实况（ECMWF IFS）：${latestObservationDate(weather)} · ${countries.length} 个国家 / 地区 · ${regions.length} 个产区 · 已启用品种专属口径`;
      $('method').innerHTML = `${esc(crop.special)}<br>${esc(crop.focus)}<br>综合风险按${esc(crop.riskProfile?.name || crop.name)}专属风险配置解读；产量仅影响暴露规模和排序，不直接提高地区风险等级。灰色区域表示当前口径无可用数据。`;
    } catch (e) { console.error(e); $('status').textContent = `数据加载失败：${e.message}`; }
  }
  document.querySelectorAll('[data-label]').forEach(b => b.onclick = async () => { labelMode = b.dataset.label; document.querySelectorAll('[data-label]').forEach(x => x.classList.toggle('active', x === b)); await renderMap(false); });
  init();
})();
