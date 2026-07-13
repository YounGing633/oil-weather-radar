(() => {
  'use strict';

  const DATA_DIR = '../data/';
  const PAGE_VERSION = 'palm-v1.3.1';
  const RULE_VERSION = 'risk_label_v4';
  const COUNTRIES = ['Indonesia', 'Malaysia'];
  const COUNTRY_CN = { Indonesia: '印度尼西亚', Malaysia: '马来西亚' };
  const COUNTRY_SHORT = { Indonesia: '印尼', Malaysia: '马来西亚' };
  const RISK_META = {
    4: { key: 'severe', label: '显著压力', color: '#c0392b', text: '#ffffff' },
    3: { key: 'pressure', label: '重点跟踪', color: '#e67e22', text: '#ffffff' },
    2: { key: 'watch', label: '一般关注', color: '#d4a017', text: '#25332f' },
    1: { key: 'mild', label: '轻度异常', color: '#f0d264', text: '#25332f' },
    0: { key: 'normal', label: '正常', color: '#27ae60', text: '#ffffff' }
  };
  const RISK_VALUE = { severe: 4, pressure: 3, watch: 2, mild: 1, normal: 0 };
  const REGION_ALIAS = {
    'riau islands': 'kepulauan riau', 'kepulauan riau': 'kepulauan riau',
    'north sumatra': 'sumatera utara', 'sumatera utara': 'sumatera utara',
    'west sumatra': 'sumatera barat', 'sumatera barat': 'sumatera barat',
    'south sumatra': 'sumatera selatan', 'sumatera selatan': 'sumatera selatan',
    'bangka-belitung': 'bangka belitung', 'bangka belitung': 'bangka belitung',
    'bangka belitung islands': 'bangka belitung',
    'west kalimantan': 'kalimantan barat', 'central kalimantan': 'kalimantan tengah',
    'south kalimantan': 'kalimantan selatan', 'east kalimantan': 'kalimantan timur',
    'north kalimantan': 'kalimantan utara', 'west sulawesi': 'sulawesi barat',
    'south sulawesi': 'sulawesi selatan', 'central sulawesi': 'sulawesi tengah',
    'southeast sulawesi': 'sulawesi tenggara', 'north sulawesi': 'sulawesi utara',
    'west papua': 'papua barat', 'north maluku': 'maluku utara',
    'west java': 'jawa barat', 'central java': 'jawa tengah', 'east java': 'jawa timur',
    'east nusa tenggara': 'nusa tenggara timur', 'west nusa tenggara': 'nusa tenggara barat',
    'southwest papua': 'papua barat daya', 'central papua': 'papua tengah',
    'south papua': 'papua selatan', 'highland papua': 'papua pegunungan',
    'jakarta special capital region': 'dki jakarta', 'special region of yogyakarta': 'daerah istimewa yogyakarta',
    'johore': 'johor', 'malacca': 'melaka', 'penang': 'pulau pinang',
    'trengganu': 'terengganu', 'kedah and perlis': 'kedah',
    'federal territory of kuala lumpur': 'kuala lumpur'
  };

  const CLIMATE_ITEMS = [
    ['ENSO', '厄尔尼诺/拉尼娜背景', '暂未接入'],
    ['IOD', '印度洋偶极子', '暂未接入'],
    ['MJO', '热带季节内振荡', '暂未接入'],
    ['季风', '区域季风与降雨带', '暂未接入'],
    ['周边海温', '马六甲、爪哇海及周边海温', '暂未接入']
  ];

  const state = {
    rows: [], countryRows: [], meta: {}, palmMeta: {}, coverage: [], map: null, geoLayers: [], labelLayer: null, selected: null,
    mapLayer: 'risk', tableFilter: 'all', charts: {}, rowIndex: new Map(),
    geoLoaded: false
  };

  const $ = (id) => document.getElementById(id);
  const isFiniteNumber = (value) => value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));
  const num = (value, fallback = null) => isFiniteNumber(value) ? Number(value) : fallback;
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const safeText = (value, fallback = '—') => value === null || value === undefined || value === '' ? fallback : String(value);
  const first = (obj, keys, fallback = null) => {
    for (const key of keys) {
      const value = obj?.[key];
      if (value !== null && value !== undefined && value !== '') return value;
    }
    return fallback;
  };

  function rowsFromPayload(payload) {
    if (Array.isArray(payload)) return payload.filter(item => item && typeof item === 'object');
    if (!payload || typeof payload !== 'object') return [];
    for (const key of ['records', 'data', 'items', 'rows', 'regions']) {
      if (Array.isArray(payload[key])) return payload[key].filter(item => item && typeof item === 'object');
    }
    return [];
  }

  async function fetchJSON(path, fallbackValue) {
    try {
      const response = await fetch(path, { cache: 'no-store' });
      if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
      return await response.json();
    } catch (error) {
      if (arguments.length > 1) return fallbackValue;
      throw new Error(`读取 ${path} 失败：${error.message}`);
    }
  }

  async function fetchPreferred(preferred, fallback) {
    try {
      return await fetchJSON(DATA_DIR + preferred);
    } catch (_) {
      return await fetchJSON(DATA_DIR + fallback, []);
    }
  }

  function normalizeName(value) {
    let text = safeText(value, '').toLowerCase().trim();
    text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    text = text.replace(/\b(province|provinsi|state|region|district|special region of|daerah istimewa|wilayah persekutuan)\b/g, '');
    text = text.replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
    return REGION_ALIAS[text] || text;
  }

  function displayRegion(row) {
    return safeText(first(row, ['region_name_cn', 'region_cn', 'admin1_name_cn', 'region_name', 'admin1', 'region', 'name']), '未命名地区');
  }

  function boundaryRegion(row) {
    return normalizeName(first(row, ['boundary_id', 'admin1_name', 'region_name_en', 'region_name', 'admin1', 'region', 'name'], ''));
  }

  function countryName(row) {
    return first(row, ['country', 'country_key', 'country_name'], '');
  }

  function riskLevel(row) {
    const direct = first(row, ['risk_level_num', 'risk_level_v3', 'dominant_risk_level', 'risk_score_level', 'weighted_risk_level']);
    if (isFiniteNumber(direct)) return clamp(Math.round(Number(direct)), 0, 4);
    const levelText = `${first(row, ['risk_level_v3_cn', 'risk_level_cn', 'weighted_risk_level_cn'], '')}`;
    if (levelText.includes('显著压力')) return 4;
    if (levelText.includes('重点跟踪')) return 3;
    if (levelText.includes('一般关注')) return 2;
    if (levelText.includes('轻度异常')) return 1;
    if (levelText.includes('正常')) return 0;
    const key = String(first(row, ['risk_level_v3_code', 'risk_key', 'risk_level', 'weighted_risk_level'], 'normal')).toLowerCase();
    if (key in RISK_VALUE) return RISK_VALUE[key];
    if (/severe|stress/.test(key)) return 4;
    if (/pressure|high|attention/.test(key)) return 3;
    if (/watch|medium/.test(key)) return 2;
    if (/mild|low/.test(key)) return 1;
    return 0;
  }

  function hasRiskData(row) {
    return first(row, [
      'risk_level_num', 'risk_level_v3', 'dominant_risk_level', 'risk_score_level',
      'weighted_risk_level', 'risk_level_v3_cn', 'risk_level_cn', 'weighted_risk_level_cn',
      'risk_level_v3_code', 'risk_key', 'risk_level'
    ]) !== null;
  }

  function riskLabel(row) {
    return RISK_META[riskLevel(row)].label;
  }

  function riskTag(row) {
    const raw = safeText(first(row, ['risk_label_v4_cn', 'dominant_map_badge_cn', 'water_stress_label_cn', 'risk_type_cn']), riskLabel(row));
    return /^(显著压力|重点压力|重点跟踪|一般关注|轻微异常|轻度异常|正常)$/.test(raw) ? riskLabel(row) : raw;
  }

  function production(row) {
    return num(first(row, ['production_tonnes', 'production_tons', 'production', 'output_tonnes', 'production_weight']), 0) || 0;
  }

  function nationalShare(row) {
    let value = num(first(row, ['national_share', 'country_share', 'production_share', 'share_of_country_production']), null);
    if (value === null) return null;
    if (value > 0 && value <= 1.0001) value *= 100;
    return value;
  }

  function rainRatio(row) {
    return num(first(row, ['precip_30d_ratio_pct', 'rain_30d_pct_of_normal', 'rain_pct_of_normal_30d', 'rain_30d_ratio_pct', 'rain_ratio_30d_pct', 'precip_ratio_30d_pct']), null);
  }

  function rainAnomaly(row) {
    const direct = num(first(row, ['precip_30d_anomaly_pct', 'rain_30d_anomaly_pct']), null);
    if (direct !== null) return direct;
    const ratio = rainRatio(row);
    return ratio === null ? null : ratio - 100;
  }

  function rain30(row) {
    return num(first(row, ['precip_30d_actual', 'rain_30d_sum_mm', 'rain_30d', 'rainfall_30d', 'precip_30d', 'precip_30d_mm', 'rain_30d_mm']), null);
  }

  function rain90(row) {
    return num(first(row, ['precip_90d_actual', 'rain_90d_sum_mm', 'rain_90d', 'precip_90d_mm']), null);
  }

  function rain90Ratio(row) {
    return num(first(row, ['precip_90d_ratio_pct', 'rain_90d_pct_of_normal', 'rain_90d_ratio_pct']), null);
  }

  function soilPercentile(row) {
    return num(first(row, [
      'rootzone_percentile', 'soil_water_rootzone_doy_percentile', 'soil_rootzone_percentile', 'soil_moisture_rootzone_percentile',
      'soil_moisture_percentile', 'soil_water_percentile_30d', 'soil_percentile_30d'
    ]), null);
  }

  function surfacePercentile(row) {
    return num(first(row, ['surface_percentile', 'soil_water_surface_doy_percentile', 'soil_surface_percentile']), null);
  }

  function et0Percentile(row) {
    return num(first(row, ['et0_percentile_30d', 'et0_30d_percentile', 'et0_doy_percentile']), null);
  }

  function et0Value(row) {
    return num(first(row, ['et0_30d_avg_mm', 'et0_30d_mm', 'et0_mean_30d', 'et0']), null);
  }

  function vpdPercentile(row) {
    return num(first(row, ['vpd_percentile_30d', 'vpd_30d_percentile', 'vpd_doy_percentile']), null);
  }

  function vpdValue(row) {
    return num(first(row, ['vpd_30d_avg_kpa', 'vpd_avg_30d_kpa', 'vpd_30d_mean', 'vpd_30d', 'vpd']), null);
  }

  function forecastDaily(row) {
    return parseSeries(
      first(row, ['forecast_daily_16d_series', 'forecast_precip_daily_series', 'forecast_series'], []),
      ['precipitation_mm', 'forecast_precip_mm', 'precip_mm', 'rain_mm', 'value'],
      { dateKeys: ['target_date', 'date', 'day', 'label'] }
    );
  }

  function forecastRain(row, days) {
    if (days === '8_16') {
      const daily = forecastDaily(row);
      if (daily.length) return daily.slice(7, 16).reduce((sum, item) => sum + item.value, 0);
      const f16 = forecastRain(row, 16);
      const f7 = forecastRain(row, 7);
      return f16 !== null && f7 !== null ? Math.max(0, f16 - f7) : null;
    }
    return num(first(row, days === 7
      ? ['forecast_7d_precip', 'rain_7d_sum', 'forecast_precip_7d_mm', 'forecast_rain_7d_mm', 'forecast_rain_7d', 'forecast_rainfall_7d']
      : ['forecast_16d_precip', 'rain_16d_sum', 'forecast_16d', 'forecast_precip_16d_mm', 'forecast_rain_16d_mm', 'forecast_rain_16d', 'rain_forecast_16d']), null);
  }

  function forecastNormal(row, days) {
    if (days === 7) {
      return num(first(row, ['forecast_precip_7d_normal_mm', 'forecast_rain_7d_normal_mm', 'forecast_7d_normal_precip']), null);
    }
    if (days === '8_16') return num(first(row, ['forecast_precip_8_14d_normal_mm', 'forecast_rain_8_14d_normal_mm']), null);
    const direct = num(first(row, ['forecast_precip_16d_normal_mm', 'forecast_rain_16d_normal_mm', 'forecast_16d_normal_precip']), null);
    if (direct !== null) return direct;
    const normal7 = num(first(row, ['forecast_precip_7d_normal_mm', 'forecast_rain_7d_normal_mm']), null);
    const normal814 = num(first(row, ['forecast_precip_8_14d_normal_mm', 'forecast_rain_8_14d_normal_mm']), null);
    if (normal7 !== null && normal814 !== null && first(row, ['forecast_16d_precip', 'forecast_16d']) !== null) return normal7 + normal814;
    return normal814;
  }

  function forecastRatio(row, days) {
    const value = forecastRain(row, days);
    const normal = forecastNormal(row, days);
    if (value === null || normal === null || normal <= 0) return null;
    return value / normal * 100;
  }

  function reasonText(row) {
    return safeText(first(row, ['risk_reason_cn', 'risk_reason', 'reason_cn', 'main_signal_cn']), '现有风险字段未提供详细原因');
  }

  function signalType(row) {
    const text = `${riskTag(row)} ${reasonText(row)} ${safeText(first(row, ['risk_type', 'dominant_risk_type', 'operation_rain_signal', 'dominant_signal', 'weather_signal']), '')}`.toLowerCase();
    const rain = rainRatio(row);
    const soil = soilPercentile(row);
    if (/过湿|洪涝|积水|偏多|wet|flood|excess/.test(text)) return 'wet';
    if (/偏干|干旱|水分压力|少雨|dry|drought|deficit/.test(text)) return 'dry';
    if ((rain !== null && rain < 80) || (soil !== null && soil < 25)) return 'dry';
    if ((rain !== null && rain > 135) || (soil !== null && soil > 85)) return 'wet';
    return 'neutral';
  }

  function futureState(row) {
    const explicit = String(first(row, ['future_change', 'future_trend', 'forecast_risk_trend', 'forecast_direction_cn'], '')).toLowerCase();
    const forecastText = `${explicit} ${first(row, ['forecast_summary_cn', 'rain_trend_label_cn'], '')}`.toLowerCase();
    const hasAny = (words) => words.some(word => forecastText.includes(word));
    if (hasAny(['修复', '缓和', '改善', '恢复性', 'repair', 'ease', 'improv'])) return 'repair';
    if (hasAny(['转差', '恶化', '加剧', 'worsen', 'deterior'])) return 'worsen';
    if (hasAny(['维持', '延续', '稳定', 'steady', 'maintain'])) return 'steady';

    const type = signalType(row);
    const f7 = forecastRain(row, 7);
    const f16 = forecastRain(row, 16);
    const f8to16 = forecastRain(row, '8_16');
    if (f7 === null && f16 === null) return 'unknown';

    if (type === 'dry') {
      if ((f7 !== null && f7 >= 35) || (f16 !== null && f16 >= 70 && (f8to16 === null || f8to16 >= 30))) return 'repair';
      if ((f7 !== null && f7 <= 10) && (f16 === null || f16 <= 35)) return 'worsen';
      return 'steady';
    }
    if (type === 'wet') {
      if ((f7 !== null && f7 <= 20) && (f8to16 === null || f8to16 <= 35)) return 'repair';
      if ((f7 !== null && f7 >= 55) || (f16 !== null && f16 >= 100)) return 'worsen';
      return 'steady';
    }
    if ((f7 !== null && (f7 <= 5 || f7 >= 80)) || (f16 !== null && f16 >= 130)) return 'worsen';
    return 'steady';
  }

  function trendState(row) {
    const explicit = String(first(row, ['risk_change_cn', 'risk_trend_cn', 'risk_change', 'risk_trend'], '')).toLowerCase();
    if (/新增|上升|恶化|转差|increase|worsen|new/.test(explicit)) return 'worsen';
    if (/缓和|下降|改善|relief|ease|decrease/.test(explicit)) return 'repair';
    if (/维持|稳定|steady|same/.test(explicit)) return 'steady';
    const prev = num(first(row, ['previous_risk_level', 'risk_level_prev', 'prior_risk_level']), null);
    if (prev !== null) {
      if (riskLevel(row) > prev) return 'worsen';
      if (riskLevel(row) < prev) return 'repair';
      return 'steady';
    }
    return 'unknown';
  }

  function futureLabel(row) {
    const stateValue = futureState(row);
    const labels = { repair: '修复', worsen: '转差', steady: '维持', unknown: '待确认' };
    return labels[stateValue];
  }

  function trendLabel(row) {
    const value = trendState(row);
    const labels = { repair: '缓和', worsen: '新增/加重', steady: '维持', unknown: '—' };
    return labels[value];
  }

  function pct(value, digits = 1) {
    return value === null || !Number.isFinite(value) ? '—' : `${value.toFixed(digits)}%`;
  }

  function mm(value, digits = 0) {
    return value === null || !Number.isFinite(value) ? '—' : `${value.toFixed(digits)} mm`;
  }

  function percentile(value) {
    return value === null || !Number.isFinite(value) ? '—' : `P${Math.round(value)}`;
  }


  function shortDate(value) {
    if (!value) return '';
    return String(value).replace('T00:00:00', '').replace(/\s+00:00:00$/, '');
  }

  function dataCompleteness(row) {
    const checks = [
      hasRiskData(row),
      production(row) > 0,
      nationalShare(row) !== null,
      rain30(row) !== null || rainRatio(row) !== null,
      rain90(row) !== null || rain90Ratio(row) !== null,
      soilPercentile(row) !== null,
      forecastRain(row, 7) !== null,
      forecastRain(row, 16) !== null,
      Boolean(boundaryRegion(row))
    ];
    return checks.filter(Boolean).length / checks.length;
  }

  function dataCompletenessLabel(row) {
    const score = dataCompleteness(row);
    if (score >= 0.88) return '完整';
    if (score >= 0.66) return '可用';
    if (score >= 0.44) return '部分缺测';
    return '缺测较多';
  }

  function weightedShare(rows, predicate) {
    const valid = rows.filter(row => production(row) > 0 && hasRiskData(row));
    if (valid.length) {
      const total = valid.reduce((sum, row) => sum + production(row), 0);
      const hit = valid.filter(predicate).reduce((sum, row) => sum + production(row), 0);
      return total > 0 ? hit / total * 100 : null;
    }
    return rows.length ? rows.filter(predicate).length / rows.length * 100 : null;
  }

  function weightedRisk(rows) {
    const valid = rows.filter(row => production(row) > 0 && hasRiskData(row));
    if (valid.length) {
      const total = valid.reduce((sum, row) => sum + production(row), 0);
      return total ? valid.reduce((sum, row) => sum + riskLevel(row) * production(row), 0) / total : 0;
    }
    return rows.length ? rows.reduce((sum, row) => sum + riskLevel(row), 0) / rows.length : 0;
  }

  function weightedAverage(rows, getter) {
    const usable = rows.map(row => ({ row, value: getter(row), weight: production(row) }))
      .filter(item => item.value !== null && Number.isFinite(item.value));
    if (!usable.length) return null;
    const withWeight = usable.filter(item => item.weight > 0);
    if (withWeight.length) {
      const total = withWeight.reduce((sum, item) => sum + item.weight, 0);
      return withWeight.reduce((sum, item) => sum + item.value * item.weight, 0) / total;
    }
    return usable.reduce((sum, item) => sum + item.value, 0) / usable.length;
  }

  function classifyWeightedRisk(value) {
    if (value >= 3.2) return 4;
    if (value >= 2.4) return 3;
    if (value >= 1.6) return 2;
    if (value >= 0.7) return 1;
    return 0;
  }

  function riskPill(level, label = RISK_META[level].label) {
    const meta = RISK_META[level];
    return `<span class="risk-pill" style="background:${meta.color}22;color:${level >= 3 ? meta.color : '#5b4c00'};border:1px solid ${meta.color}66">${escapeHTML(label)}</span>`;
  }

  function escapeHTML(value) {
    return safeText(value, '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }

  function getLatestDate(rows) {
    const values = rows.map(row => first(row, ['weather_latest_date', 'observation_end_date', 'obs_end_date', 'latest_date', 'precip_90d_latest_date']))
      .filter(Boolean).map(shortDate).sort();
    return values.at(-1) || first(state.meta, ['observation_end_date', 'latest_observation_date', 'data_date'], '—');
  }

  function getForecastRange(rows) {
    const targets = [];
    rows.forEach(row => {
      const series = Array.isArray(row.forecast_daily_16d_series) ? row.forecast_daily_16d_series : [];
      series.forEach(item => {
        const date = shortDate(first(item, ['target_date', 'date']));
        if (date) targets.push(date);
      });
    });
    if (targets.length) {
      targets.sort();
      return `${targets[0]} 至 ${targets.at(-1)}`;
    }
    const starts = rows.map(row => first(row, ['forecast_start_date', 'forecast_from', 'forecast_date'])).filter(Boolean).map(shortDate).sort();
    return starts.length ? `${starts.at(-1)}起16天` : safeText(first(state.meta, ['forecast_range', 'forecast_period']), '—');
  }

  function updateStatus() {
    $('obsDate').textContent = getLatestDate(state.rows);
    $('forecastRange').textContent = getForecastRange(state.rows);
    $('buildTime').textContent = safeText(first(state.meta, ['generated_at', 'build_time', 'updated_at']), '—');
    $('coverageText').textContent = `${state.rows.length}个`;
    $('missingText').textContent = `${state.rows.filter(row => dataCompleteness(row) < 0.66).length}个`;
    $('pageVersion').textContent = PAGE_VERSION;
    $('ruleVersion').textContent = `${RULE_VERSION} / ${safeText(first(state.meta, ['version'], first(state.palmMeta, ['version'], '?')))}`;
  }

  function buildConclusion() {
    const rows = state.rows;
    const wr = weightedRisk(rows);
    const level = classifyWeightedRisk(wr);
    const riskMeta = RISK_META[level];
    const watchCoverage = weightedShare(rows, row => riskLevel(row) >= 2);
    const highCoverage = weightedShare(rows, row => riskLevel(row) >= 3);
    const dryShare = weightedShare(rows, row => signalType(row) === 'dry' && riskLevel(row) >= 2);
    const wetShare = weightedShare(rows, row => signalType(row) === 'wet' && riskLevel(row) >= 2);
    const focus = [...rows].sort(rankSort).slice(0, 3);
    const topNames = focus.filter(row => riskLevel(row) >= 2).map(displayRegion).slice(0, 2);
    const dominant = (dryShare || 0) >= (wetShare || 0) ? '偏干与水分压力' : '过湿与作业条件';

    let conclusion = `东南亚棕榈主产区整体为“${riskMeta.label}”。`;
    if (watchCoverage !== null) conclusion += `一般关注以上区域覆盖约${watchCoverage.toFixed(1)}%的已覆盖产量。`;
    if (topNames.length) conclusion += `当前重点集中在${topNames.join('、')}。`;
    if (!rows.some(row => riskLevel(row) >= 2)) conclusion = '印尼和马来西亚已覆盖产区暂未出现一般关注以上的广泛气象压力。';
    $('mainConclusion').textContent = conclusion;

    const rain = weightedAverage(rows, rainAnomaly);
    const soil = weightedAverage(rows, soilPercentile);
    const evidenceParts = [];
    if (rain !== null) evidenceParts.push(`30日降雨加权距平${rain >= 0 ? '+' : ''}${rain.toFixed(0)}%`);
    if (soil !== null) evidenceParts.push(`根区墒情约处于P${Math.round(soil)}`);
    evidenceParts.push(`主要风险类型为${dominant}`);
    $('mainEvidence').textContent = evidenceParts.join('；') + '。';

    const futureRepair = weightedShare(rows, row => futureState(row) === 'repair');
    const futureWorsen = weightedShare(rows, row => futureState(row) === 'worsen');
    let futureText = '现有预报字段不足，暂不判断未来修复。';
    if (futureRepair !== null || futureWorsen !== null) {
      if ((futureRepair || 0) > (futureWorsen || 0) + 5) futureText = `未来7—16天以修复为主，预计修复区域覆盖约${futureRepair.toFixed(1)}%的已覆盖产量。`;
      else if ((futureWorsen || 0) > (futureRepair || 0) + 5) futureText = `未来7—16天转差风险占优，预计转差区域覆盖约${futureWorsen.toFixed(1)}%的已覆盖产量。`;
      else futureText = '未来7—16天修复与转差信号并存，整体以维持为主。';
    }
    $('futureConclusion').textContent = futureText;

    const badge = $('overallRiskBadge');
    badge.style.background = `${riskMeta.color}16`;
    badge.style.borderColor = `${riskMeta.color}55`;
    badge.querySelector('strong').textContent = riskMeta.label;
    badge.querySelector('strong').style.color = riskMeta.color;

    $('watchCoverage').textContent = pct(watchCoverage);
    $('highCoverage').textContent = pct(highCoverage);

    const changes = { worsen: 0, repair: 0, steady: 0, unknown: 0 };
    rows.forEach(row => { changes[trendState(row)] += 1; });
    if (changes.unknown === rows.length) {
      $('changeCount').textContent = '暂无可比';
      $('changeNote').textContent = '待接入前一构建风险等级';
    } else {
      $('changeCount').textContent = `+${changes.worsen} / −${changes.repair}`;
      $('changeNote').textContent = `维持 ${changes.steady} 个地区`;
    }

    if (futureRepair !== null && futureWorsen !== null) {
      $('futureMetric').textContent = (futureRepair || 0) > (futureWorsen || 0) ? '偏修复' : (futureWorsen || 0) > (futureRepair || 0) ? '偏转差' : '维持';
      $('futureMetricNote').textContent = `修复${pct(futureRepair)} / 转差${pct(futureWorsen)}`;
    } else {
      $('futureMetric').textContent = '待确认';
    }
  }

  function countrySummary(country) {
    const rows = state.rows.filter(row => countryName(row) === country);
    const level = classifyWeightedRisk(weightedRisk(rows));
    const watch = weightedShare(rows, row => riskLevel(row) >= 2);
    const high = weightedShare(rows, row => riskLevel(row) >= 3);
    const focus = [...rows].sort(rankSort)[0];
    const futureRepair = weightedShare(rows, row => futureState(row) === 'repair');
    const futureWorsen = weightedShare(rows, row => futureState(row) === 'worsen');
    let future = '预报信号不足';
    if (futureRepair !== null && futureWorsen !== null) future = futureRepair > futureWorsen ? '未来7日偏修复' : futureWorsen > futureRepair ? '未来7日偏转差' : '未来7日以维持为主';
    return { country, rows, level, watch, high, focus, future };
  }

  function renderCountryCards() {
    $('countryCards').innerHTML = COUNTRIES.map(country => {
      const summary = countrySummary(country);
      const focusReason = summary.focus ? `${displayRegion(summary.focus)}：${reasonText(summary.focus)}` : '暂无地区数据';
      return `<article class="country-card">
        <div class="country-card-head"><strong>${COUNTRY_CN[country]}</strong>${riskPill(summary.level)}</div>
        <div class="country-stats">
          <div><span>一般关注以上</span><b>${pct(summary.watch)}</b></div>
          <div><span>显著压力/重点跟踪</span><b>${pct(summary.high)}</b></div>
        </div>
        <p><b>主要区域：</b>${escapeHTML(focusReason)}</p>
        <p><b>未来变化：</b>${escapeHTML(summary.future)}</p>
      </article>`;
    }).join('');
  }

  function rankScore(row) {
    const share = nationalShare(row);
    const weight = share !== null ? Math.max(share, 0.5) : Math.log10(Math.max(production(row), 1) + 10);
    const completeness = dataCompleteness(row);
    const futureBoost = futureState(row) === 'worsen' ? 1.25 : futureState(row) === 'repair' ? 0.95 : 1;
    return (riskLevel(row) + 0.35) * weight * clamp(completeness, 0.35, 1.15) * futureBoost;
  }

  function rankSort(a, b) {
    return rankScore(b) - rankScore(a) || riskLevel(b) - riskLevel(a) || production(b) - production(a);
  }

  function renderFocusRegions() {
    const focus = [...state.rows].sort(rankSort).slice(0, 5);
    $('focusRegions').innerHTML = focus.map(row => `<li data-key="${escapeHTML(rowKey(row))}">
      <b>${escapeHTML(displayRegion(row))}</b>
      <span>${escapeHTML(COUNTRY_SHORT[countryName(row)] || countryName(row))} · ${nationalShare(row) === null ? '占比—' : `占比${pct(nationalShare(row))}`}</span>
      ${riskPill(riskLevel(row), riskLabel(row))}
    </li>`).join('');
    $('focusRegions').querySelectorAll('li').forEach(li => li.addEventListener('click', () => selectRow(state.rowIndex.get(li.dataset.key))));
  }

  function rowKey(row) {
    return `${countryName(row)}::${boundaryRegion(row) || normalizeName(displayRegion(row))}`;
  }

  function tableFilterMatch(row) {
    if (state.tableFilter === 'all') return true;
    if (state.tableFilter === 'dry') return signalType(row) === 'dry';
    if (state.tableFilter === 'wet') return signalType(row) === 'wet';
    if (state.tableFilter === 'repair') return futureState(row) === 'repair';
    if (state.tableFilter === 'worsen') return futureState(row) === 'worsen';
    return true;
  }

  function metricClass(value) {
    if (value === null) return 'value-muted';
    return '';
  }


  function et0Display(row) {
    const pctValue = et0Percentile(row);
    const value = et0Value(row);
    if (pctValue !== null) return percentile(pctValue);
    if (value !== null) return `${value.toFixed(2)} mm/d`;
    return '暂未接入';
  }

  function vpdDisplay(row) {
    const pctValue = vpdPercentile(row);
    const value = vpdValue(row);
    if (pctValue !== null) return percentile(pctValue);
    if (value !== null) return `${value.toFixed(2)} kPa`;
    return '暂未接入';
  }

  function renderRanking() {
    const rows = [...state.rows].filter(tableFilterMatch).sort(rankSort);
    $('rankingBody').innerHTML = rows.map(row => {
      const rain = rainAnomaly(row);
      const r90 = rain90Ratio(row);
      const soil = soilPercentile(row);
      const f7 = forecastRain(row, 7);
      const future = futureState(row);
      const trend = trendState(row);
      const complete = dataCompleteness(row) * 100;
      return `<tr data-key="${escapeHTML(rowKey(row))}" class="${state.selected && rowKey(state.selected) === rowKey(row) ? 'selected' : ''}">
        <td class="region-cell"><b>${escapeHTML(displayRegion(row))}</b><small>${escapeHTML(safeText(first(row, ['boundary_id', 'region_name_en', 'admin1_name']), ''))}</small></td>
        <td>${escapeHTML(COUNTRY_SHORT[countryName(row)] || countryName(row))}</td>
        <td>${pct(nationalShare(row))}</td>
        <td>${riskPill(riskLevel(row), riskLabel(row))}<small class="risk-tag">${escapeHTML(riskTag(row))}</small></td>
        <td class="${metricClass(rain)}">${rain === null ? '—' : `${rain >= 0 ? '+' : ''}${rain.toFixed(0)}%`}<small>${mm(rain30(row))}</small></td>
        <td class="${metricClass(r90)}">${r90 === null ? '—' : `${r90.toFixed(0)}%常年`}<small>${mm(rain90(row))}</small></td>
        <td class="${metricClass(soil)}">${percentile(soil)}<small>${escapeHTML(safeText(first(row, ['soil_moisture_status', 'soil_status_cn']), ''))}</small></td>
        <td class="${metricClass(et0Percentile(row) ?? et0Value(row))}">${escapeHTML(et0Display(row))}</td>
        <td class="${metricClass(vpdPercentile(row) ?? vpdValue(row))}">${escapeHTML(vpdDisplay(row))}</td>
        <td class="trend-${future}">${futureLabel(row)}<small>${mm(f7)}</small></td>
        <td class="trend-${trend}">${trendLabel(row)}</td>
        <td><b>${complete.toFixed(0)}%</b><small>${dataCompletenessLabel(row)}</small></td>
      </tr>`;
    }).join('') || `<tr><td colspan="12" class="value-muted">当前筛选没有匹配地区。</td></tr>`;
    $('rankingBody').querySelectorAll('tr[data-key]').forEach(tr => tr.addEventListener('click', () => selectRow(state.rowIndex.get(tr.dataset.key))));
  }

  function layerMetric(row, layer = state.mapLayer) {
    if (layer === 'risk') return hasRiskData(row) ? riskLevel(row) : null;
    if (layer === 'rain') return rainRatio(row);
    if (layer === 'soil') return soilPercentile(row);
    if (layer === 'et0') return et0Percentile(row);
    if (layer === 'vpd') return vpdPercentile(row);
    if (layer === 'forecast7') return forecastRain(row, 7);
    if (layer === 'forecast8_16') return forecastRain(row, '8_16');
    return null;
  }

  function colorFor(layer, value) {
    if (value === null || !Number.isFinite(value)) return '#cbd5d2';
    if (layer === 'risk') return RISK_META[clamp(Math.round(value), 0, 4)].color;
    if (layer === 'rain') {
      if (value < 60) return '#8c2d24';
      if (value < 80) return '#d6604d';
      if (value < 120) return '#f3e7ba';
      if (value < 150) return '#80cdc1';
      return '#018571';
    }
    if (layer === 'forecast7') {
      if (value < 10) return '#8c2d24';
      if (value < 25) return '#d6604d';
      if (value < 50) return '#f3e7ba';
      if (value < 80) return '#80cdc1';
      return '#018571';
    }
    if (layer === 'forecast8_16') {
      if (value < 15) return '#8c2d24';
      if (value < 35) return '#d6604d';
      if (value < 70) return '#f3e7ba';
      if (value < 110) return '#80cdc1';
      return '#018571';
    }
    if (layer === 'soil') {
      if (value < 10) return '#8c2d24';
      if (value < 20) return '#d6604d';
      if (value < 40) return '#f3e7ba';
      if (value < 80) return '#80cdc1';
      return '#018571';
    }
    if (layer === 'et0' || layer === 'vpd') {
      if (value < 40) return '#80cdc1';
      if (value < 60) return '#f3e7ba';
      if (value < 80) return '#f4a582';
      if (value < 90) return '#d6604d';
      return '#8c2d24';
    }
    return '#cbd5d2';
  }

  function layerValueText(row, layer = state.mapLayer) {
    const value = layerMetric(row, layer);
    if (value === null) return '暂未接入可靠字段';
    if (layer === 'risk') return `${riskLabel(row)} · ${riskTag(row)}`;
    if (layer === 'rain') return `${value.toFixed(0)}%常年（距平${value >= 100 ? '+' : ''}${(value - 100).toFixed(0)}%）`;
    if (layer === 'soil') return `根区墒情 P${Math.round(value)}`;
    if (layer === 'et0') return `ET0 P${Math.round(value)}`;
    if (layer === 'vpd') return `VPD P${Math.round(value)}`;
    if (layer === 'forecast7') return `未来7日累计 ${mm(value)}`;
    if (layer === 'forecast8_16') return `未来8至16日累计 ${mm(value)}`;
    return '—';
  }

  function legendConfig() {
    if (state.mapLayer === 'risk') return { title: '综合风险', rows: Object.keys(RISK_META).reverse().map(key => [RISK_META[key].color, RISK_META[key].label]) };
    if (state.mapLayer === 'rain') return { title: '近30日降雨 / 常年同期', rows: [['#8c2d24','≤60%'],['#d6604d','60-80%'],['#f3e7ba','80-120%'],['#80cdc1','120-150%'],['#018571','≥150%']] };
    if (state.mapLayer === 'forecast7') return { title: '未来7日累计降雨', rows: [['#8c2d24','<10mm'],['#d6604d','10-25mm'],['#f3e7ba','25-50mm'],['#80cdc1','50-80mm'],['#018571','≥80mm']] };
    if (state.mapLayer === 'forecast8_16') return { title: '未来8至16日累计降雨', rows: [['#8c2d24','<15mm'],['#d6604d','15-35mm'],['#f3e7ba','35-70mm'],['#80cdc1','70-110mm'],['#018571','≥110mm']] };
    if (state.mapLayer === 'soil') return { title: '根区墒情同期百分位', rows: [['#8c2d24','P0-10'],['#d6604d','P10-20'],['#f3e7ba','P20-40'],['#80cdc1','P40-80'],['#018571','P80-100']] };
    return { title: `${state.mapLayer.toUpperCase()}同期百分位`, rows: [['#80cdc1','P0-40'],['#f3e7ba','P40-60'],['#f4a582','P60-80'],['#d6604d','P80-90'],['#8c2d24','P90-100']] };
  }

  function renderLegend() {
    const config = legendConfig();
    $('mapLegend').innerHTML = `<div class="legend-title">${escapeHTML(config.title)}</div>${config.rows.map(([color, label]) => `<div class="legend-row"><span class="legend-swatch" style="background:${color}"></span><span>${escapeHTML(label)}</span></div>`).join('')}<div class="legend-row"><span class="legend-swatch" style="background:#cbd5d2"></span><span>缺少可靠数据</span></div>`;
  }

  function geoFeatureName(feature) {
    return first(feature?.properties, ['shapeName', 'NAME_1', 'name', 'Name', 'admin1Name'], '');
  }

  function findRowForFeature(country, feature) {
    const key = normalizeName(geoFeatureName(feature));
    const exact = state.rows.find(row => countryName(row) === country && boundaryRegion(row) === key);
    if (exact) return exact;
    return state.rows.find(row => {
      const rowBoundary = boundaryRegion(row);
      return countryName(row) === country && rowBoundary && key && (rowBoundary.includes(key) || key.includes(rowBoundary));
    });
  }

  function shapeStyle(row) {
    const value = row ? layerMetric(row) : null;
    const share = row ? nationalShare(row) : null;
    const selected = row && state.selected && rowKey(row) === rowKey(state.selected);
    const completeness = row ? dataCompleteness(row) : 0;
    return {
      color: selected ? '#17322f' : completeness < 0.66 ? '#5f6b7a' : '#ffffff',
      weight: selected ? 3.2 : share !== null && share > 15 ? 2.4 : share !== null && share > 5 ? 1.6 : 1,
      opacity: 1,
      fillColor: colorFor(state.mapLayer, value),
      fillOpacity: row ? (completeness < 0.66 ? 0.55 : 0.78) : 0.22,
      dashArray: row && completeness >= 0.66 ? null : '4 4'
    };
  }

  function featureTooltip(row, feature, country) {
    const name = row ? displayRegion(row) : geoFeatureName(feature);
    if (!row) return `<b>${escapeHTML(name)}</b><br>${escapeHTML(COUNTRY_CN[country])}<br>未匹配产区数据`;
    return `<b>${escapeHTML(name)}</b><br>${escapeHTML(COUNTRY_CN[country])} · ${escapeHTML(riskLabel(row))}<br>${escapeHTML(layerValueText(row))}<br>国家产量占比：${pct(nationalShare(row))}`;
  }

  async function initMap() {
    if (!window.L) throw new Error('Leaflet未加载，无法初始化地图。');
    state.map = L.map('map', { zoomControl: true, minZoom: 3, maxZoom: 9 }).setView([1.5, 108], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18, attribution: '&copy; OpenStreetMap contributors'
    }).addTo(state.map);
    state.labelLayer = L.layerGroup().addTo(state.map);

    const geoSources = [
      ['Indonesia', 'admin1_geojson/indonesia_admin1.geojson'],
      ['Malaysia', 'admin1_geojson/malaysia_admin1.geojson']
    ];
    const bounds = [];
    for (const [country, file] of geoSources) {
      const geo = await fetchJSON(DATA_DIR + file, null);
      if (!geo) continue;
      const layer = L.geoJSON(geo, {
        style: feature => shapeStyle(findRowForFeature(country, feature)),
        onEachFeature: (feature, leafletLayer) => {
          const row = findRowForFeature(country, feature);
          leafletLayer.bindTooltip(featureTooltip(row, feature, country), { sticky: true, className: 'region-tooltip' });
          leafletLayer.on({
            click: () => row && selectRow(row),
            mouseover: event => event.target.setStyle({ weight: 3, color: '#17322f' }),
            mouseout: event => event.target.setStyle(shapeStyle(row))
          });
          leafletLayer.__palmRow = row;
          leafletLayer.__palmCountry = country;
        }
      }).addTo(state.map);
      state.geoLayers.push(layer);
      if (layer.getBounds().isValid()) bounds.push(layer.getBounds());
    }
    if (bounds.length) {
      const merged = bounds.reduce((acc, item) => acc.extend(item), bounds[0]);
      state.map.fitBounds(merged.pad(0.05));
    }
    state.geoLoaded = true;
    state.map.on('zoomend', refreshMapLabels);
    renderLegend();
    refreshMapLabels();
  }

  function shouldShowLabel(row, zoom) {
    if (!row) return false;
    const share = nationalShare(row) || 0;
    if (state.selected && rowKey(row) === rowKey(state.selected)) return true;
    if (zoom >= 6) return share >= 1 || riskLevel(row) >= 3;
    if (zoom >= 5) return share >= 5 || riskLevel(row) >= 3;
    const top5 = [...state.rows].sort(rankSort).slice(0, 5).some(item => rowKey(item) === rowKey(row));
    return share >= 10 || top5;
  }

  function refreshMapLabels() {
    if (!state.map || !state.labelLayer) return;
    state.labelLayer.clearLayers();
    const zoom = state.map.getZoom();
    state.geoLayers.forEach(group => group.eachLayer(layer => {
      const row = layer.__palmRow;
      if (!row || !shouldShowLabel(row, zoom) || !layer.getBounds().isValid()) return;
      const center = layer.getBounds().getCenter();
      const label = `${displayRegion(row)}${nationalShare(row) !== null ? ` ${pct(nationalShare(row), 0)}` : ''}`;
      L.marker(center, {
        interactive: false,
        icon: L.divIcon({ className: 'map-label-icon', html: `<div class="map-label">${escapeHTML(label)}</div>` })
      }).addTo(state.labelLayer);
    }));
  }

  function refreshMapStyles() {
    state.geoLayers.forEach(group => group.eachLayer(layer => {
      const row = layer.__palmRow;
      layer.setStyle(shapeStyle(row));
      const country = row ? countryName(row) : layer.__palmCountry;
      layer.setTooltipContent(featureTooltip(row, layer.feature, country));
    }));
    renderLegend();
    refreshMapLabels();
  }

  function parseSeries(raw, valueKeys, options = {}) {
    if (!raw) return [];
    let value = raw;
    if (typeof raw === 'string') {
      try { value = JSON.parse(raw); } catch (_) { return []; }
    }
    if (!Array.isArray(value)) return [];
    return value.map((item, index) => {
      if (typeof item === 'number') return { label: String(index + 1), value: item };
      if (!item || typeof item !== 'object') return null;
      let val = null;
      if (typeof options.derive === 'function') val = options.derive(item);
      if (val === null || !Number.isFinite(Number(val))) val = num(first(item, valueKeys), null);
      if (val === null) return null;
      return {
        label: safeText(first(item, options.dateKeys || ['date', 'target_date', 'day', 'label', 'x']), String(index + 1)),
        value: Number(val)
      };
    }).filter(Boolean);
  }

  function rawSeries(row, keys) {
    for (const key of keys) {
      if (row?.[key]) return row[key];
    }
    return [];
  }

  function destroyChart(name) {
    if (state.charts[name]) {
      state.charts[name].destroy();
      state.charts[name] = null;
    }
  }

  function renderLineChart(name, canvasId, emptyId, series, label, reference = null) {
    destroyChart(name);
    const empty = $(emptyId);
    const canvas = $(canvasId);
    if (!window.Chart || series.length < 2) {
      empty.textContent = window.Chart ? '现有数据未提供可用时间序列' : 'Chart.js未加载';
      empty.style.display = 'grid';
      canvas.style.display = 'none';
      return;
    }
    empty.style.display = 'none';
    canvas.style.display = 'block';
    const datasets = [{ label, data: series.map(item => item.value), borderWidth: 2, pointRadius: 0, tension: .18 }];
    if (reference !== null) datasets.push({ label: '参考线', data: series.map(() => reference), borderWidth: 1, pointRadius: 0, borderDash: [5, 5] });
    state.charts[name] = new Chart(canvas.getContext('2d'), {
      type: 'line', data: { labels: series.map(item => item.label), datasets },
      options: { responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, plugins: { legend: { display: false } }, scales: { x: { ticks: { maxTicksLimit: 6, font: { size: 9 } } }, y: { ticks: { font: { size: 9 } } } } }
    });
  }

  function renderBarChart(name, canvasId, emptyId, series, label) {
    destroyChart(name);
    const empty = $(emptyId);
    const canvas = $(canvasId);
    if (!window.Chart || series.length < 2) {
      empty.textContent = window.Chart ? '现有数据未提供可用预报序列' : 'Chart.js未加载';
      empty.style.display = 'grid';
      canvas.style.display = 'none';
      return;
    }
    empty.style.display = 'none';
    canvas.style.display = 'block';
    state.charts[name] = new Chart(canvas.getContext('2d'), {
      type: 'bar', data: { labels: series.map(item => item.label), datasets: [{ label, data: series.map(item => item.value), borderWidth: 0 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { ticks: { maxTicksLimit: 8, font: { size: 9 } } }, y: { beginAtZero: true, ticks: { font: { size: 9 } } } } }
    });
  }

  function detailEvidenceCards(row) {
    const items = [
      ['30日降雨', rain30(row) === null ? '—' : mm(rain30(row)), rainAnomaly(row) === null ? '无距平字段' : `距平${rainAnomaly(row) >= 0 ? '+' : ''}${rainAnomaly(row).toFixed(0)}%`],
      ['90日降雨', rain90(row) === null ? '—' : mm(rain90(row)), rain90Ratio(row) === null ? '由日度历史聚合' : `${rain90Ratio(row).toFixed(0)}%常年`],
      ['根区墒情', percentile(soilPercentile(row)), soilPercentile(row) === null ? '无可靠字段' : '历史同期百分位'],
      ['ET0', et0Display(row), et0Percentile(row) === null && et0Value(row) === null ? 'Open-Meteo字段待积累' : '蒸散需求'],
      ['VPD', vpdDisplay(row), vpdPercentile(row) === null && vpdValue(row) === null ? 'Open-Meteo字段待积累' : '大气干燥度'],
      ['未来7日降雨', mm(forecastRain(row, 7)), `${futureLabel(row)}，16日累计${mm(forecastRain(row, 16))}`]
    ];
    return items.map(([label, value, note]) => `<article class="evidence-card"><span>${escapeHTML(label)}</span><strong>${escapeHTML(value)}</strong><small>${escapeHTML(note)}</small></article>`).join('');
  }

  function renderDetailImpact(row) {
    const current = first(row, ['current_operation_impact_cn', 'operation_rain_signal'], '采收、道路和FFB运输条件跟踪。');
    const five = first(row, ['production_impact_cn'], '关注授粉和早期果串形成窗口。');
    const future = first(row, ['future_yield_impact_cn'], '中长期只作为潜在气象影响窗口，不直接对应确定减产月份。');
    $('detailImpactWindow').innerHTML = `<div class="detail-impact-title">潜在气象影响窗口</div>
      <div class="detail-impact-grid">
        <article><span>当前至1个月</span><b>采收与运输</b><p>${escapeHTML(current)}</p></article>
        <article><span>约5个月后</span><b>授粉与早期果串</b><p>${escapeHTML(five)}</p></article>
        <article><span>约18个月后</span><b>花序败育风险</b><p>${escapeHTML(future)}</p></article>
        <article><span>约24个月后</span><b>雌雄花比例与果串数量</b><p>仅作为长期潜在气象影响窗口，需要后续产量和作业数据验证。</p></article>
      </div>`;
  }

  function renderDetail(row) {
    if (!row) return;
    $('detailTitle').textContent = `${displayRegion(row)}｜${COUNTRY_CN[countryName(row)] || countryName(row)}`;
    $('detailRisk').outerHTML = `<span class="detail-risk" id="detailRisk" style="background:${RISK_META[riskLevel(row)].color}20;color:${RISK_META[riskLevel(row)].color};border:1px solid ${RISK_META[riskLevel(row)].color}66">${escapeHTML(riskLabel(row))}</span>`;
    const rain = rainAnomaly(row);
    const soil = soilPercentile(row);
    const parts = [reasonText(row)];
    if (rain !== null) parts.push(`近30日降雨较常年${rain >= 0 ? '高' : '低'}${Math.abs(rain).toFixed(0)}%`);
    if (soil !== null) parts.push(`根区墒情处于历史同期P${Math.round(soil)}`);
    $('detailConclusion').textContent = `${displayRegion(row)}当前为“${riskLabel(row)}”。${parts.join('；')}。`;
    $('detailEvidence').innerHTML = detailEvidenceCards(row);

    const f7 = forecastRain(row, 7), f7Ratio = forecastRatio(row, 7), f16 = forecastRain(row, 16), f16Ratio = forecastRatio(row, 16);
    $('forecastBox').innerHTML = `<b>未来修复判断：</b>${escapeHTML(futureLabel(row))}。未来7日预计降雨 ${escapeHTML(mm(f7))}${f7Ratio === null ? '' : `，约为常年同期的${pct(f7Ratio, 0)}`}；未来16日 ${escapeHTML(mm(f16))}${f16Ratio === null ? '' : `，约为常年同期的${pct(f16Ratio, 0)}`}。该判断用于识别修复或转差方向，不等同于产量预测。`;

    const rainSeries = parseSeries(
      rawSeries(row, ['precip_30d_anomaly_90d_series', 'rain_30d_anomaly_90d_series', 'precip_anomaly_series']),
      ['precip_30d_anomaly_mm', 'rain_30d_anomaly_mm', 'anomaly', 'value'],
      { derive: item => {
        const actual = num(first(item, ['precip_30d_actual', 'rain_30d_actual']), null);
        const normal = num(first(item, ['precip_30d_normal', 'rain_30d_normal']), null);
        return actual !== null && normal !== null ? actual - normal : null;
      }}
    );
    const soilSeries = parseSeries(
      rawSeries(row, ['soil_rootzone_percentile_90d_series', 'soil_moisture_percentile_90d_series', 'soil_percentile_series']),
      ['rootzone_percentile', 'soil_rootzone_percentile', 'percentile', 'value']
    );
    const forecastSeries = forecastDaily(row);
    renderLineChart('rain', 'rainChart', 'rainChartEmpty', rainSeries, '30日降雨距平', 0);
    renderLineChart('soil', 'soilChart', 'soilChartEmpty', soilSeries, '根区墒情百分位', 50);
    renderBarChart('forecast', 'forecastChart', 'forecastChartEmpty', forecastSeries, '逐日降雨');
  }

  function selectRow(row) {
    if (!row) return;
    state.selected = row;
    renderRanking();
    renderDetail(row);
    refreshMapStyles();
    $('detailSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function bindControls() {
    $('layerTabs').querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
      state.mapLayer = button.dataset.layer;
      $('layerTabs').querySelectorAll('button').forEach(item => item.classList.toggle('active', item === button));
      refreshMapStyles();
    }));
    $('tableFilters').querySelectorAll('button').forEach(button => button.addEventListener('click', () => {
      state.tableFilter = button.dataset.filter;
      $('tableFilters').querySelectorAll('button').forEach(item => item.classList.toggle('active', item === button));
      renderRanking();
    }));
  }


  function updateLayerAvailability() {
    $('layerTabs').querySelectorAll('button').forEach(button => {
      const layer = button.dataset.layer;
      if (layer === 'risk') return;
      const available = state.rows.some(row => layerMetric(row, layer) !== null);
      button.disabled = !available;
      button.title = available ? '' : '现有数据暂未接入该图层的可靠字段';
      if (!available && button.classList.contains('active')) state.mapLayer = 'risk';
    });
    $('layerTabs').querySelectorAll('button').forEach(item => item.classList.toggle('active', item.dataset.layer === state.mapLayer));
  }

  function renderClimateBackground() {
    const target = $('climateGrid');
    if (!target) return;
    target.innerHTML = CLIMATE_ITEMS.map(([key, title, fallback]) => `<article class="climate-card"><span>${escapeHTML(key)}</span><b>${escapeHTML(title)}</b><p>${escapeHTML(fallback)}</p></article>`).join('');
  }

  function toast(message) {
    const el = $('toast');
    el.textContent = message;
    el.classList.add('show');
    window.setTimeout(() => el.classList.remove('show'), 4500);
  }

  function normalizeRows(payload) {
    const filtered = rowsFromPayload(payload).filter(row => {
      const country = countryName(row);
      const crop = String(first(row, ['crop_group', 'commodity', 'crop'], '')).toLowerCase();
      return COUNTRIES.includes(country) && (crop === 'palm' || crop.includes('palm') || crop.includes('棕榈')) && first(row, ['source_valid_for_frontend'], true) !== false;
    });
    const selected = [];
    for (const country of COUNTRIES) {
      const countryRows = filtered.filter(row => countryName(row) === country);
      const admin1Rows = countryRows.filter(row => ['admin1', 'province', 'state'].includes(String(first(row, ['admin_level', 'admin_level_for_map'], '')).toLowerCase()));
      selected.push(...(admin1Rows.length ? admin1Rows : countryRows));
    }
    const deduped = new Map();
    selected.forEach(row => {
      const key = `${countryName(row)}::${boundaryRegion(row) || normalizeName(displayRegion(row))}`;
      const current = deduped.get(key);
      if (!current || production(row) > production(current)) deduped.set(key, { ...row, __riskLevel: riskLevel(row) });
    });
    return [...deduped.values()];
  }

  async function boot() {
    try {
      bindControls();
      const [regionPayload, countryPayload, meta, palmMeta, coverage] = await Promise.all([
        fetchPreferred('palm_region_risk_latest.json', 'admin_region_risk_latest.json'),
        fetchPreferred('palm_country_risk_latest.json', 'country_crop_risk_latest.json'),
        fetchJSON(DATA_DIR + 'site_meta.json', {}),
        fetchJSON(DATA_DIR + 'palm_page_meta.json', {}),
        fetchJSON(DATA_DIR + 'geo_boundary_coverage.json', [])
      ]);
      state.rows = normalizeRows(regionPayload);
      state.countryRows = rowsFromPayload(countryPayload);
      state.meta = Array.isArray(meta) ? (meta[0] || {}) : (meta || {});
      state.palmMeta = palmMeta || {};
      state.coverage = rowsFromPayload(coverage);
      if (!state.rows.length) throw new Error('没有读取到印尼/马来西亚棕榈油地区数据。请确认 crop_group=palm。');
      state.rows.forEach(row => state.rowIndex.set(rowKey(row), row));
      updateLayerAvailability();
      updateStatus();
      buildConclusion();
      renderCountryCards();
      renderFocusRegions();
      renderRanking();
      renderClimateBackground();
      await initMap();
      const firstFocus = [...state.rows].sort(rankSort)[0];
      if (firstFocus) { state.selected = firstFocus; renderDetail(firstFocus); refreshMapStyles(); renderRanking(); }
      $('loadingMask').classList.add('hidden');
    } catch (error) {
      console.error(error);
      $('loadingMask').classList.add('hidden');
      toast(error.message || '页面初始化失败');
      $('mainConclusion').textContent = '页面数据加载失败。';
      $('mainEvidence').textContent = error.message || '请检查数据文件路径。';
    }
  }

  window.addEventListener('DOMContentLoaded', boot);
})();
