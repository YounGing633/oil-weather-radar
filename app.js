const DATA_DIR = './data/';
const CONFIG_DIR = './assets/configs/';
const UI_VERSION = 'v2.10-prodweather9';
const RULE_VERSION = 'risk_label_v4';

const RISK = {
  4: { code: 'severe', cn: '显著压力', color: '#d73027' },
  3: { code: 'pressure', cn: '重点跟踪', color: '#fc8d59' },
  2: { code: 'watch', cn: '一般关注', color: '#fee08b' },
  1: { code: 'mild', cn: '轻度异常', color: '#d9ef8b' },
  0: { code: 'normal', cn: '正常', color: '#1a9850' }
};

const RISK_CODE_TO_NUM = {
  severe: 4,
  pressure: 3,
  stress: 4,
  attention: 3,
  watch: 2,
  mild: 1,
  normal: 0,
  low: 0,
  normal_monitor: 0,
  regular_monitor: 0,
  insufficient_data: 0
};

const TRADE_VIEW_LABELS = {
  all: '全部',
  drought_pressure: '干旱压力',
  wet_pressure: '湿涝压力',
  hot_dry: '高温干燥',
  cold_frost: '低温/霜冻',
  recovery_rain: '恢复性降雨',
  future_worsen: '未来转差',
  future_repair: '未来修复'
};

const RISK_CHANGE_LABELS = {
  up: '风险上升↑',
  down: '风险下降↓',
  steady: '维持→',
  future_repair: '未来修复',
  future_worsen: '未来转差',
  new: '风险上升↑'
};

const CROP_META = {
  palm: { tab: '棕榈', label: '棕榈', oil: '棕榈', color: '#15803d' },
  soybean: { tab: '大豆', label: '大豆', oil: '大豆', color: '#b45309' },
  rapeseed_canola: { tab: '菜籽', label: '菜籽', oil: '菜籽', color: '#2563eb' },
  sunflower: { tab: '葵花籽', label: '葵花籽', oil: '葵花籽', color: '#7c3aed' },
  coconut: { tab: '椰子', label: '椰子', oil: '椰子', color: '#0891b2' }
};

const WEATHER_PALETTE = {
  dryHot: '#d7191c',
  dry: '#fdae61',
  neutral: '#ffffbf',
  wet: '#66c2a5',
  wetCold: '#2c7bb6',
  veryWetCold: '#313695',
  noData: '#bdbdbd'
};

const WEATHER_COLOR_STOPS = [
  { pos: 0, color: WEATHER_PALETTE.dryHot },
  { pos: 0.2, color: WEATHER_PALETTE.dry },
  { pos: 0.42, color: WEATHER_PALETTE.neutral },
  { pos: 0.6, color: WEATHER_PALETTE.wet },
  { pos: 0.8, color: WEATHER_PALETTE.wetCold },
  { pos: 1, color: WEATHER_PALETTE.veryWetCold }
];

const WEATHER_METRICS = {
  rain: {
    title: '降雨',
    note: '颜色按近30天降雨相对常年百分比，兼顾油籽缺雨和过湿作业风险。',
    gradient: {
      from: WEATHER_PALETTE.dryHot,
      to: WEATHER_PALETTE.wetCold,
      lowLabel: '缺雨',
      highLabel: '过湿'
    }
  },
  temp: {
    title: '温度',
    note: '颜色按近30天最高温距平，突出低温生长迟滞和高温干化压力。',
    gradient: {
      from: WEATHER_PALETTE.wetCold,
      to: WEATHER_PALETTE.dryHot,
      reverse: true,
      lowLabel: '偏冷',
      highLabel: '偏热'
    }
  },
  soil: {
    title: '根区墒情',
    note: '颜色按根区土壤湿度百分位，干端参考干旱监测常用百分位口径，湿端用于识别过湿/田间作业压力。',
    gradient: {
      from: WEATHER_PALETTE.dryHot,
      to: WEATHER_PALETTE.wetCold,
      lowLabel: '偏干',
      highLabel: '偏湿'
    }
  },
  forecast: {
    title: '7天',
    note: '颜色按未来7天降雨距平（vs常年同期），偏干偏湿一目了然。',
    gradient: {
      from: WEATHER_PALETTE.dryHot,
      to: WEATHER_PALETTE.wetCold,
      lowLabel: '偏干',
      highLabel: '偏湿'
    }
  },
  forecast14: {
    title: '14天',
    note: '颜色按未来16天降雨距平（vs常年同期），中期趋势判断。',
    gradient: {
      from: WEATHER_PALETTE.dryHot,
      to: WEATHER_PALETTE.wetCold,
      lowLabel: '偏干',
      highLabel: '偏湿'
    }
  },
  et0: {
    title: '蒸散需求',
    note: '颜色按ET0距平百分位，高蒸散表示水分消耗加速。',
    gradient: {
      from: WEATHER_PALETTE.wetCold,
      to: WEATHER_PALETTE.dryHot,
      reverse: true,
      lowLabel: '蒸散偏低',
      highLabel: '蒸散偏高'
    }
  },
  vpd: {
    title: '大气干燥度',
    note: '颜色按VPD距平百分位，高VPD表示大气蒸散压力上升。',
    gradient: {
      from: WEATHER_PALETTE.wetCold,
      to: WEATHER_PALETTE.dryHot,
      reverse: true,
      lowLabel: '湿润',
      highLabel: '干燥'
    }
  },
  recent30: {
    title: '30天',
    note: '颜色按近30天降雨相对常年百分比，用于判断近期水分压力背景。',
    gradient: {
      from: WEATHER_PALETTE.dryHot,
      to: WEATHER_PALETTE.wetCold,
      lowLabel: '偏干',
      highLabel: '偏湿'
    }
  }
};

const RISK_LEGEND_HTML = `
  <div class="legend-title">risk_label_v4</div>
  <div class="legend-item"><span class="legend-swatch" style="background:var(--risk-severe)"></span>显著压力</div>
  <div class="legend-item"><span class="legend-swatch" style="background:var(--risk-pressure)"></span>重点跟踪</div>
  <div class="legend-item"><span class="legend-swatch" style="background:var(--risk-watch)"></span>一般关注</div>
  <div class="legend-item"><span class="legend-swatch" style="background:var(--risk-mild)"></span>轻度异常</div>
  <div class="legend-item"><span class="legend-swatch" style="background:var(--risk-normal)"></span>正常</div>
`;

const RISK_TYPE_CN = {
  drought_water_deficit: '干旱/水分不足',
  heat_drydown: '高温干化',
  wetness_waterlogging: '偏湿/渍涝',
  harvest_rain: '收获/采收降雨',
  low_temperature: '低温压力',
  heavy_rain_disruption: '强降雨作业受扰',
  mixed_signal_monitor: '信号分化/观察',
  no_clear_pressure: '无明确压力'
};

const GEO_NAME_TO_COUNTRY = {
  'United States of America': 'United States',
  USA: 'United States',
  Turkey: 'Türkiye',
  'Czech Republic': 'Czechia',
  Moldova: 'Republic of Moldova',
  'Ivory Coast': "Cote d'Ivoire",
  'Côte d’Ivoire': "Cote d'Ivoire",
  'Democratic Republic of the Congo': 'DR Congo'
};

const COUNTRY_ALIAS = {
  'United States of America': 'United States',
  USA: 'United States',
  Turkey: 'Türkiye'
};

const ADMIN1_NAME_MAP = {
  'Riau Islands': 'Kepulauan Riau',
  'South Kalimantan': 'Kalimantan Selatan',
  'North Sumatra': 'Sumatera Utara',
  'South Sumatra': 'Sumatera Selatan',
  'West Sumatra': 'Sumatera Barat',
  'West Kalimantan': 'Kalimantan Barat',
  'Central Kalimantan': 'Kalimantan Tengah',
  'East Kalimantan': 'Kalimantan Timur',
  'North Kalimantan': 'Kalimantan Utara',
  'South Sulawesi': 'Sulawesi Selatan',
  'Central Sulawesi': 'Sulawesi Tengah',
  'Southeast Sulawesi': 'Sulawesi Tenggara',
  'West Sulawesi': 'Sulawesi Barat',
  'North Sulawesi': 'Sulawesi Utara',
  'West Java': 'Jawa Barat',
  'North Maluku': 'Maluku Utara',
  'East Nusa Tenggara': 'Nusa Tenggara Timur',
  'West Nusa Tenggara': 'Nusa Tenggara Barat',
  'West Papua': 'Papua Barat',
  'Central Java': 'Jawa Tengah',
  'East Java': 'Jawa Timur',
  'Southwest Papua': 'Papua Barat Daya',
  'Central Papua': 'Papua Tengah',
  'South Papua': 'Papua Selatan',
  'Highland Papua': 'Papua Pegunungan',
  'Bangka-Belitung Islands': 'Bangka Belitung',
  'Jakarta Special Capital Region': 'DKI Jakarta',
  'Special Region of Yogyakarta': 'Daerah Istimewa Yogyakarta',
  Penang: 'Pulau Pinang',
  Johore: 'Johor',
  Malacca: 'Melaka'
};

const ADMIN1_REGION_NAME_MAP = {
  Russia: {
    'Republic of Tatarstan': 'Tatarstan',
    'Republic of Bashkortostan': 'Bashkortostan',
    'Chechen Republic': 'Chechnya',
    'Republic of Adygea': 'Adygea',
    'Republic of Khakassia': 'Khakassia',
    'Republic of North Ossetia-Alania': 'North Ossetia-Alania',
    'Chuvash Republic': 'Chuvashia',
    'Udmurt Republic': 'Udmurtia',
    'Kabardino-Balkarian Republic': 'Kabardino-Balkaria',
    'Mari El Republic': 'Mari El',
    'Republic of Ingushetia': 'Ingushetia',
    'Republic of Buryatia': 'Buryatia',
    'Republic of Kalmykia': 'Kalmykia',
    'Tuva Republic': 'Tuva',
    'Karachay-Cherkess Republic': 'Karachay-Cherkessia',
    'Republic of Dagestan': 'Dagestan',
    'Kemerovo Oblast - Kuzbass': 'Kemerovo Oblast',
    'Kaliningrad Oblast': 'Kaliningrad'
  },
  Philippines: {
    'REGION XI (DAVAO REGION)': 'Davao Region',
    'REGION IX (ZAMBOANGA PENINSULA)': 'Zamboanga Peninsula',
    'REGION X (NORTHERN MINDANAO)': 'Northern Mindanao',
    'REGION XII (SOCCSKSARGEN)': 'Soccsksargen',
    'REGION IV-A (CALABARZON)': 'Calabarzon',
    'BANGSAMORO AUTONOMOUS REGION IN MUSLIM MINDANAO (BARMM)': 'ARMM',
    'REGION VIII (EASTERN VISAYAS)': 'Eastern Visayas',
    'REGION V (BICOL REGION)': 'Bicol Region',
    'REGION XIII (CARAGA)': 'Caraga',
    'MIMAROPA REGION': 'Mimaropa',
    'REGION VI (WESTERN VISAYAS)': 'Western Visayas',
    'REGION VII (CENTRAL VISAYAS)': 'Central Visayas',
    'REGION II (CAGAYAN VALLEY)': 'Cagayan Valley',
    'REGION I (ILOCOS REGION)': 'Ilocos Region',
    'REGION III (CENTRAL LUZON)': 'Central Luzon',
    'CORDILLERA ADMINISTRATIVE REGION (CAR)': 'CAR'
  }
};

let map;
let layers = {};
let charts = {};
let adminGeoCache = {};
let mapStats = { main: 0, risk: 0, fallback: 0, note: '' };

let state = {
  viewMode: 'risk',
  crop: 'all',
  country: 'all',
  risk: 'all',
  anomaly: 'all',
  dataStatus: 'all',
  timeRange: '14d',
  layer: 'country',
  weatherMetric: 'rain',
  mapValue: 'production',
  selectedCountry: null,
  selectedCountryCrop: null,
  selectedCountryRecord: null,
  selectedRegionRecord: null
};

function applyNavigationParams() {
  try {
    const params = new URLSearchParams(window.location.search || '');
    const view = params.get('view');
    if (view === 'climate' || view === 'weather') state.viewMode = 'weather';
    const crop = params.get('crop');
    if (crop && CROP_META[crop]) state.crop = crop;
  } catch (error) {
    console.warn('Navigation params ignored:', error);
  }
}

let viewMemory = {
  risk: null,
  weather: null
};

function snapshotViewState() {
  return {
    crop: state.crop,
    country: state.country,
    risk: state.risk,
    anomaly: state.anomaly,
    dataStatus: state.dataStatus,
    timeRange: state.timeRange,
    layer: state.layer,
    weatherMetric: state.weatherMetric,
    mapValue: state.mapValue,
    selectedCountry: state.selectedCountry,
    selectedCountryCrop: state.selectedCountryCrop,
    selectedCountryRecord: state.selectedCountryRecord,
    selectedRegionRecord: state.selectedRegionRecord
  };
}

function defaultViewState(viewMode) {
  return {
    crop: state.crop || 'all',
    country: 'all',
    risk: 'all',
    anomaly: 'all',
    dataStatus: 'all',
    timeRange: '14d',
    layer: viewMode === 'weather' ? 'weather' : 'country',
    weatherMetric: 'rain',
    mapValue: 'production',
    selectedCountry: null,
    selectedCountryCrop: null,
    selectedCountryRecord: null,
    selectedRegionRecord: null
  };
}

function rememberCurrentViewState() {
  viewMemory[state.viewMode] = snapshotViewState();
}

function restoreViewState(viewMode) {
  const saved = viewMemory[viewMode] || defaultViewState(viewMode);
  Object.assign(state, saved, { viewMode });
}

function resetViewMemory() {
  viewMemory = {
    risk: null,
    weather: null
  };
}

let store = {
  countryRecords: [],
  adminRecords: [],
  coverage: [],
  admin1Manifest: [],
  euRecords: [],
  geojson: null,
  adminById: new Map(),
  regionHistory: [],
  regionHistoryIndex: new Map(),
  siteMeta: [],
  weatherConfig: null,
  riskRules: null,
  loadErrors: []
};

let currentModels = [];
let currentCountryLabelCenters = [];
let currentProductionWeatherRows = [];

function isNum(value) {
  return value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));
}

function safeValue(value, fallback = '—') {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'number' && !Number.isFinite(value)) return fallback;
  return value;
}

function fmtDash(value) {
  return String(safeValue(value));
}

function fmtNum(value, digits = 1, suffix = '') {
  if (!isNum(value)) return '—';
  return Number(value).toLocaleString('zh-CN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }) + suffix;
}

function fmtInt(value, suffix = '') {
  if (!isNum(value)) return '—';
  return Number(value).toLocaleString('zh-CN', {
    maximumFractionDigits: 0
  }) + suffix;
}

function fmtPct(value, digits = 1, fraction = true) {
  if (!isNum(value)) return '—';
  let n = Number(value);
  if (fraction) n *= 100;
  return n.toLocaleString('zh-CN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }) + '%';
}

function fmtSigned(value, digits = 1, suffix = '') {
  if (!isNum(value)) return '—';
  const n = Number(value);
  const sign = n > 0 ? '+' : '';
  return sign + n.toLocaleString('zh-CN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }) + suffix;
}

function fmtProduction(value) {
  if (!isNum(value)) return '产量待接入';
  const n = Number(value);
  if (Math.abs(n) >= 100000000) return (n / 100000000).toLocaleString('zh-CN', { maximumFractionDigits: 2 }) + '亿吨';
  if (Math.abs(n) >= 10000) return (n / 10000).toLocaleString('zh-CN', { maximumFractionDigits: 1 }) + '万吨';
  return n.toLocaleString('zh-CN', { maximumFractionDigits: 0 }) + '吨';
}

function esc(value) {
  return fmtDash(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escAttr(value) {
  return esc(value).replaceAll('`', '&#96;');
}

function canonicalCountry(country) {
  return COUNTRY_ALIAS[country] || country;
}

function normalizeFrontendKey(value) {
  return String(value || '').trim().toLowerCase();
}

function isExcludedFrontendRecord(row) {
  const country = normalizeFrontendKey(row && (row.country_name_en || row.country || row.country_key));
  const crop = normalizeFrontendKey(row && row.crop_group);
  return country === 'brazil' && crop === 'palm';
}

function countryFromGeoName(name) {
  return GEO_NAME_TO_COUNTRY[name] || name;
}

function cropLabel(record) {
  return CROP_META[record && record.crop_group] ? CROP_META[record.crop_group].label : fmtDash(record && record.crop_group);
}

function productionCommodityLabel(record) {
  const basis = [
    record && record.production_basis_cn,
    record && record.production_basis,
    record && record.data_scope,
    record && record.commodity_display,
    record && record.product_type,
    record && record.crop_type,
    record && record.commodity_name,
    record && record.commodity_code,
    record && record.oil_name
  ].filter(Boolean).join(' ').toLowerCase();
  const crop = record && record.crop_group;
  if (crop === 'soybean') return '大豆';
  if (crop === 'rapeseed_canola') return '菜籽';
  if (crop === 'sunflower') return '葵花籽';
  if (crop === 'palm') {
    if (/ffb|fresh fruit|oil palm|area|油棕/.test(basis)) return '油棕';
    if (/cpo|palm oil|棕榈油/.test(basis)) return '棕榈油';
    return '棕榈';
  }
  if (crop === 'coconut') {
    if (/coconut oil|椰子油/.test(basis)) return '椰子油';
    if (/copra|椰干/.test(basis)) return '椰干';
    return '椰子';
  }
  return cropLabel(record);
}

function productionLabel(record, suffix = '产量') {
  return `${productionCommodityLabel(record)}${suffix}`;
}

function cropColor(crop) {
  return CROP_META[crop] ? CROP_META[crop].color : '#64748b';
}

function riskNum(value) {
  if (isNum(value)) return Math.max(0, Math.min(4, Math.round(Number(value))));
  if (!value) return 0;
  return RISK_CODE_TO_NUM[String(value)] ?? 0;
}

function riskNumFromCountry(record) {
  return riskNum(record && record.weighted_risk_level);
}

function riskInfo(value) {
  const n = riskNum(value);
  return RISK[n] || RISK[0];
}

function normalizeRiskText(value) {
  return String(safeValue(value, ''))
    .replace(/重点压力/g, '重点跟踪')
    .replace(/正常监控/g, '正常')
    .replace(/正常监测/g, '正常')
    .replace(/常规监测/g, '正常');
}

function riskBadge(value, text) {
  const info = riskInfo(value);
  return `<span class="badge" style="background:${info.color}">${esc(normalizeRiskText(text || info.cn))}</span>`;
}

function riskColor(value) {
  return riskInfo(value).color;
}

function riskText(value) {
  return riskInfo(value).cn;
}

function riskTypeText(value) {
  return RISK_TYPE_CN[value] || fmtDash(value);
}

function getEntryParam() {
  try {
    const params = new URLSearchParams(window.location.search || '');
    return params.get('v') || params.get('version') || '';
  } catch (error) {
    return '';
  }
}

function formatMetaDate(value) {
  const text = fmtDash(value);
  if (text === '—') return '—';
  return text.includes('T') ? text.slice(0, 10) : text.slice(0, 10);
}

function formatMetaDateTime(value) {
  const text = fmtDash(value);
  if (text === '—') return '—';
  return text.replace('T', ' ').replace(/Z$/, ' UTC').slice(0, 19);
}

function levelTextFromNum(value) {
  return riskText(riskNum(value));
}

function riskLevelForRecord(record, options = {}) {
  if (!record) return 0;
  if (options.isCountry || record.weighted_risk_level !== undefined || record.weighted_risk_score !== undefined) {
    return riskNumFromCountry(record);
  }
  return riskNum(record.risk_level_v3 ?? record.dominant_risk_level ?? record.risk_level);
}

function historyRiskNum(point) {
  if (!point) return null;
  const direct = point.risk_level_v3 ?? point.risk_level ?? point.weighted_risk_level ?? point.anomaly_level;
  if (direct !== undefined && direct !== null && direct !== '') return riskNum(direct);
  const label = String(point.anomaly_label || '').toLowerCase();
  if (/severe|extreme|显著|严重/.test(label)) return 4;
  if (/pressure|stress|重点/.test(label)) return 3;
  if (/watch|mild|dry|wet|hot|cold|关注|异常/.test(label)) return 2;
  return null;
}

function previousRiskLevel(record) {
  if (!record) return null;
  const directKeys = [
    'previous_risk_level',
    'previous_risk_level_v3',
    'prev_risk_level',
    'prev_risk_level_v3',
    'last_risk_level',
    'yesterday_risk_level'
  ];
  for (const key of directKeys) {
    if (record[key] !== undefined && record[key] !== null && record[key] !== '') return riskNum(record[key]);
  }
  if (record.weather_region_id && store.regionHistoryIndex) {
    const series = store.regionHistoryIndex.get(String(record.weather_region_id)) || [];
    for (let i = series.length - 2; i >= 0; i -= 1) {
      const level = historyRiskNum(series[i]);
      if (level !== null) return level;
    }
  }
  return null;
}

function isDryRisk(record) {
  const text = [
    record && record.risk_type,
    record && record.dominant_risk_type,
    record && record.risk_label_v4_cn,
    record && record.dominant_map_badge_cn,
    record && record.risk_reason_cn,
    record && record.dominant_risk_reason_cn
  ].filter(Boolean).join(' ').toLowerCase();
  return /drought|dry|deficit|heat_dry|rain_deficit|少雨|偏少|缺雨|干旱|偏干|高温干/.test(text);
}

function isWetRisk(record) {
  const text = [
    record && record.risk_type,
    record && record.dominant_risk_type,
    record && record.risk_label_v4_cn,
    record && record.dominant_map_badge_cn,
    record && record.risk_reason_cn,
    record && record.dominant_risk_reason_cn
  ].filter(Boolean).join(' ').toLowerCase();
  return /wet|waterlog|excess|heavy_rain|rain_disruption|偏湿|湿涝|偏多|强降雨|渍涝|作业/.test(text);
}

function forecastDirection(record) {
  if (!record) return '';
  const explicit = [
    record.forecast_recovery_signal,
    record.forecast_signal,
    record.risk_change,
    record.risk_change_cn,
    record.forecast_summary_cn
  ].filter(Boolean).join(' ').toLowerCase();
  if (/repair|relief|easing|recovery|修复|缓和|改善/.test(explicit)) return 'future_repair';
  if (/worsen|deterior|no_relief|turn_bad|转差|恶化|加重/.test(explicit)) return 'future_worsen';
  const forecast7 = firstNumeric(record, ['forecast_7d_precip', 'forecast_rainfall_7d', 'forecast_7d', 'rain_forecast_7d']);
  const normal7 = firstNumeric(record, ['forecast_precip_7d_normal_mm']);
  if (!isNum(forecast7) || !isNum(normal7) || Number(normal7) <= 0.5) return '';
  const ratio = Number(forecast7) / Number(normal7);
  if (isDryRisk(record)) {
    if (ratio >= 0.8) return 'future_repair';
    if (ratio < 0.4) return 'future_worsen';
  }
  if (isWetRisk(record)) {
    if (ratio < 0.7) return 'future_repair';
    if (ratio > 1.5) return 'future_worsen';
  }
  return '';
}

function riskChangeInfo(record, options = {}) {
  const current = riskLevelForRecord(record, options);
  const explicit = String(record && (record.risk_change || record.risk_change_cn || record.risk_change_code || record.change_direction || '') || '').toLowerCase();
  let code = '';
  if (/future.*repair|repair|relief|recovery|修复|缓和/.test(explicit)) code = 'future_repair';
  else if (/future.*worsen|worsen|up|increase|rise|转差|上升|恶化/.test(explicit)) code = explicit.includes('future') || /转差|恶化/.test(explicit) ? 'future_worsen' : 'up';
  else if (/down|decrease|fall|下降/.test(explicit)) code = 'down';
  else if (/steady|maintain|flat|维持/.test(explicit)) code = 'steady';

  const previous = previousRiskLevel(record);
  if (!code && previous !== null) {
    if (current > previous) code = previous <= 1 && current >= 2 ? 'new' : 'up';
    else if (current < previous) code = 'down';
    else code = 'steady';
  }
  if (!code) code = forecastDirection(record) || 'steady';
  return {
    code,
    label: RISK_CHANGE_LABELS[code] || RISK_CHANGE_LABELS.steady,
    previous,
    current,
    previousText: previous === null ? '上期缺少可比等级' : levelTextFromNum(previous),
    currentText: levelTextFromNum(current)
  };
}

function riskChangeBadge(record, options = {}) {
  const info = riskChangeInfo(record, options);
  return `<span class="change-badge change-${escAttr(info.code)}">${esc(info.label)}</span>`;
}

function tradeImplication(record, options = {}) {
  const level = riskLevelForRecord(record, options);
  const change = riskChangeInfo(record, options).code;
  if (change === 'future_repair' || change === 'down') return '短期修复';
  if (level >= 4) return '预期扰动 / 需跟踪产量数据验证';
  if (level >= 3) return '需跟踪产量数据验证';
  if (change === 'future_worsen' || change === 'up' || change === 'new') return '预期扰动';
  return '暂无明显供应影响';
}

function tagRiskNum(tag) {
  return riskNum(tag && tag.risk_level);
}

function isSupportiveTag(tag) {
  const text = `${tag && tag.direction || ''} ${tag && tag.impact_type || ''} ${tag && tag.impact_direction || ''}`.toLowerCase();
  return text.includes('support');
}

function isAdverseTag(tag) {
  if (!tag) return false;
  if (isSupportiveTag(tag)) return false;
  const text = `${tag.direction || ''} ${tag.impact_type || ''} ${tag.impact_direction || ''}`.toLowerCase();
  return text.includes('adverse')
    || text.includes('operation')
    || text.includes('yield')
    || tagRiskNum(tag) >= 2;
}

function sortedRiskTags(record, predicate = () => true) {
  return (Array.isArray(record && record.risk_tags) ? record.risk_tags : [])
    .filter(tag => tag && predicate(tag))
    .slice()
    .sort((a, b) => tagRiskNum(b) - tagRiskNum(a)
      || (Number(b.display_priority) || 0) - (Number(a.display_priority) || 0));
}

function primaryAdverseTag(record) {
  const level = riskNum(record && record.risk_level_v3);
  return sortedRiskTags(record, tag => isAdverseTag(tag) && tagRiskNum(tag) >= Math.min(2, Math.max(1, level - 1)))[0]
    || sortedRiskTags(record, isAdverseTag)[0]
    || null;
}

function formatRiskLabel(record) {
  if (!record) return RISK[0].cn;
  const levelNum = riskNum(record.risk_level_v3);
  const levelText = normalizeRiskText(record.weighted_risk_level_cn
    || record.risk_level_v3_cn
    || riskText(record.weighted_risk_level ?? record.risk_level_v3));
  const adverseTag = primaryAdverseTag(record);
  if (adverseTag && levelNum >= 2 && (adverseTag.risk_label_cn || adverseTag.label_cn)) return normalizeRiskText(adverseTag.risk_label_cn || adverseTag.label_cn);
  if (levelNum >= 2 && (record.risk_label_v4_cn || record.dominant_map_badge_cn)) {
    return normalizeRiskText(record.risk_label_v4_cn || record.dominant_map_badge_cn);
  }
  const type = levelNum >= 2 ? (record.dominant_risk_type || record.risk_type) : record.risk_type;
  if (type && type !== 'no_clear_pressure') return `${levelText}｜${riskTypeText(type)}`;
  return normalizeRiskText(record.dominant_country_badge_cn
    || record.weighted_risk_level_cn
    || record.risk_level_v3_cn
    || levelText);
}

function formatDataStatus(dataStatus, record = null) {
  const status = String(dataStatus || '').toLowerCase();
  if (record && (isSummaryProxyRecord(record) || isCountryProxy(record))) return '数据有限';
  if (/real_active|official|formal/.test(status)) return '数据充足';
  if (/sample|demo|building|mock|synthetic|test|pending/.test(status)) return '建设中';
  if (/proxy|fallback|low.?sample|limited|estimate/.test(status)) return '数据有限';
  return '数据有限';
}

function formatPublicText(value) {
  return normalizeRiskText(String(safeValue(value, ''))
    .replace(/national\s*proxy/gi, '国家代表口径')
    .replace(/virtual\s*country/gi, '汇总单元')
    .replace(/admin1\s*polygon/gi, '地区边界')
    .replace(/fallback/gi, '代表点')
    .replace(/low\s*sample/gi, '有限样本')
    .replace(/real_active/gi, '数据充足')
    .replace(/sample/gi, '建设中数据')
    .replace(/proxy/gi, '代表口径'));
}

function formatAnomalyType(record) {
  if (!record) return '正常';
  if (record.anomaly_label || record.anomaly_type) return record.anomaly_label || riskTypeText(record.anomaly_type);
  const moisture = moistureState(record);
  if (record.risk_type === 'mixed_signal_monitor') return '降雨/土壤/预报信号分化';
  if (record.risk_type === 'wetness_waterlogging') return '降雨过多 / 土壤偏湿';
  if (record.risk_type === 'heat_drydown') return '高温水分压力';
  if (record.risk_type === 'drought_water_deficit') {
    if (moisture.rootWet || moisture.surfaceWet) return '降雨偏少 / 土壤未同步偏干';
    return '降雨偏少 / 土壤偏干';
  }
  if (riskNum(record.risk_level_v3) >= 2 && record.dominant_risk_type) return riskTypeText(record.dominant_risk_type);
  if (record.risk_reason_cn || record.dominant_risk_reason_cn) return record.risk_reason_cn || record.dominant_risk_reason_cn;
  return formatRiskLabel(record);
}

function firstDateShort(value) {
  const s = fmtDash(value);
  if (s === '—') return '';
  return s.slice(5, 10);
}

async function loadConfig(name, fallback = null) {
  const timer = `config:${name}`;
  console.time(timer);
  try {
    const response = await fetch(CONFIG_DIR + name);
    if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.warn(`Config load fallback: ${name}`, error.message);
    return fallback;
  } finally {
    console.timeEnd(timer);
  }
}

async function loadJSON(name, fallback = null) {
  const timer = `load:${name}`;
  console.time(timer);
  try {
    const response = await fetch(DATA_DIR + name);
    if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Data load failed: ${name}`, error);
    if (fallback !== null) {
      store.loadErrors.push(`${name} 未读取成功`);
      return fallback;
    }
    throw error;
  } finally {
    console.timeEnd(timer);
  }
}

function loadErrorMessage() {
  if (!store.loadErrors.length) return '';
  return `数据加载失败：${store.loadErrors.join('；')}｜点击重试｜查看控制台`;
}

function loadErrorCardHtml() {
  const message = loadErrorMessage();
  if (!message) return '';
  return `<button type="button" class="data-error-card" data-retry-load="1">${esc(message)}</button>`;
}

function renderLoadErrorState() {
  const html = loadErrorCardHtml();
  if (!html) return false;
  const riskList = document.getElementById('summary-risk-list');
  const focusList = document.getElementById('today-focus-list');
  const productionShare = document.getElementById('summary-production-share');
  const productionNote = document.getElementById('summary-production-note');
  const anomalyTypes = document.getElementById('summary-anomaly-types');
  const forecastChange = document.getElementById('summary-forecast-change');
  const forecastNote = document.getElementById('summary-forecast-note');
  if (riskList) riskList.innerHTML = html;
  if (focusList) focusList.innerHTML = `<div class="today-focus-item">${html}</div>`;
  if (productionShare) productionShare.textContent = '暂无';
  if (productionNote) productionNote.textContent = '数据加载失败';
  if (anomalyTypes) anomalyTypes.textContent = '暂无显著风险';
  if (forecastChange) forecastChange.textContent = '暂无预报信号';
  if (forecastNote) forecastNote.textContent = '数据加载失败';
  return true;
}

function initMap() {
  map = L.map('map', { zoomControl: false, worldCopyJump: true }).setView([16, 25], 3);
  L.control.zoom({ position: 'topright' }).addTo(map);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 18
  }).addTo(map);

  layers = {
    country: L.layerGroup().addTo(map),
    countryLabels: L.layerGroup().addTo(map),
    region: L.layerGroup().addTo(map),
    regionLabels: L.layerGroup().addTo(map),
    fallback: L.layerGroup().addTo(map),
    virtual: L.layerGroup().addTo(map)
  };

  map.on('zoomend', () => {
    if (state.viewMode === 'weather') {
      refreshProductionWeatherLabels();
      return;
    }
    if (state.layer === 'region') refreshRegionLabels();
    if (state.layer === 'country') refreshCountryLabels();
  });

  requestAnimationFrame(() => map.invalidateSize());
  setTimeout(() => map.invalidateSize(), 300);
}

function clearMap() {
  Object.values(layers).forEach(layer => layer.clearLayers());
  destroyCharts();
}

function boundsFor(layerNames) {
  const group = L.featureGroup();
  layerNames.forEach(name => {
    const layerGroup = layers[name];
    if (!layerGroup || !layerGroup.eachLayer) return;
    layerGroup.eachLayer(layer => group.addLayer(layer));
  });
  return group.getBounds();
}

function destroyCharts() {
  Object.values(charts).forEach(chart => {
    if (chart && typeof chart.destroy === 'function') chart.destroy();
  });
  charts = {};
}

function prepareData(raw) {
  store.countryRecords = (Array.isArray(raw.countryRecords) ? raw.countryRecords : [])
    .filter(row => row && row.source_valid_for_frontend !== false)
    .filter(row => !isExcludedFrontendRecord(row))
    .map(row => ({ ...row, country_key: canonicalCountry(row.country) }));

  store.adminRecords = (Array.isArray(raw.adminRecords) ? raw.adminRecords : [])
    .filter(row => row && row.source_valid_for_frontend !== false)
    .filter(row => !isExcludedFrontendRecord(row))
    .map(row => ({ ...row, country_key: canonicalCountry(row.country) }));

  store.admin1Manifest = Array.isArray(raw.admin1Manifest) ? raw.admin1Manifest : [];
  store.coverage = enhanceBoundaryCoverage(raw.coverage, store.admin1Manifest);
  store.euRecords = Array.isArray(raw.euRecords) ? raw.euRecords : [];
  store.geojson = raw.geojson && Array.isArray(raw.geojson.features) ? raw.geojson : { type: 'FeatureCollection', features: [] };
  store.siteMeta = Array.isArray(raw.siteMeta) ? raw.siteMeta : (raw.siteMeta ? [raw.siteMeta] : []);
  store.adminById = new Map(store.adminRecords.map(row => [row.weather_region_id, row]));
  store.regionHistory = Array.isArray(raw.regionHistory) ? raw.regionHistory : [];
  store.regionHistoryIndex = new Map();
  for (const point of store.regionHistory) {
    if (!point || !point.weather_region_id) continue;
    const key = String(point.weather_region_id);
    if (!store.regionHistoryIndex.has(key)) store.regionHistoryIndex.set(key, []);
    store.regionHistoryIndex.get(key).push(point);
  }
  for (const series of store.regionHistoryIndex.values()) {
    series.sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));
  }

  // Crop progress index: keyed by (country_lower + '::' + crop_group + '::' + admin1_lower)
  store.cropProgress = raw.cropProgress || [];
  store.cropProgressIndex = new Map();
  for (const cp of store.cropProgress) {
    const key = (cp.country || '').toLowerCase() + '::' + (cp.crop_group || '') + '::' + (cp.admin1 || '').toLowerCase();
    if (!store.cropProgressIndex.has(key)) store.cropProgressIndex.set(key, []);
    store.cropProgressIndex.get(key).push(cp);
  }

  // Soil temperature index: keyed by weather_region_id
  store.soilTempIndex = new Map();
  for (const st of (raw.soilTemp || [])) {
    if (st && st.weather_region_id) {
      store.soilTempIndex.set(st.weather_region_id, st);
    }
  }
}

function getCountryName(key) {
  if (key === 'European Union') return '欧盟';
  const rec = store.countryRecords.find(row => row.country_key === key) || store.adminRecords.find(row => row.country_key === key);
  return rec ? (rec.country_cn || rec.country || key) : key;
}

function getCoverage(countryKey) {
  return store.coverage.find(row => row.country_key === countryKey) || null;
}

function enhanceBoundaryCoverage(coverageRows, manifestRows) {
  const byCountry = new Map();
  (Array.isArray(coverageRows) ? coverageRows : []).forEach(row => {
    const key = canonicalCountry(row.country);
    byCountry.set(key, { ...row, country_key: key });
  });

  (Array.isArray(manifestRows) ? manifestRows : []).forEach(row => {
    if (!row || !row.country || !row.geojson_file) return;
    const key = canonicalCountry(row.country);
    const current = byCountry.get(key) || {
      country: row.country,
      country_cn: row.country_cn,
      country_key: key,
      has_country_boundary: true,
      country_boundary_file: 'countries.geo.json'
    };
    byCountry.set(key, {
      ...current,
      country: current.country || row.country,
      country_cn: current.country_cn || row.country_cn,
      country_key: key,
      has_country_boundary: current.has_country_boundary !== false,
      has_admin1_boundary: true,
      boundary_file: row.geojson_file,
      admin1_boundary_file: row.geojson_file,
      admin1_manifest_status: row.status || 'ok',
      admin1_manifest_note: row.note || current.missing_reason || null,
      missing_reason: row.status === 'partial' ? (row.note || current.missing_reason || null) : null
    });
  });

  return [...byCountry.values()];
}

function tradeFilterText(record) {
  return [
    record && record.risk_type,
    record && record.dominant_risk_type,
    record && record.risk_label_v4_cn,
    record && record.dominant_map_badge_cn,
    record && record.risk_reason_cn,
    record && record.dominant_risk_reason_cn,
    record && record.weather_condition_summary_cn,
    record && record.forecast_summary_cn,
    formatAnomalyType(record)
  ].filter(Boolean).join(' ').toLowerCase();
}

function matchesTradeViewRecord(record) {
  if (!record || state.risk === 'all') return true;
  const text = tradeFilterText(record);
  const change = riskChangeInfo(record).code;
  if (state.risk === 'drought_pressure') return isDryRisk(record) || /干旱|缺雨|少雨|偏干|水分压力|rain_deficit|drought|dry/.test(text);
  if (state.risk === 'wet_pressure') return isWetRisk(record) || /湿涝|偏湿|偏多|强降雨|渍涝|wet|waterlog|heavy_rain/.test(text);
  if (state.risk === 'hot_dry') return /高温|干热|干化|heat|hot|drydown|vpd|et0/.test(text)
    || (isNum(record.temp_max_anomaly_c) && Number(record.temp_max_anomaly_c) >= 2);
  if (state.risk === 'cold_frost') return /低温|霜冻|偏冷|cold|frost/.test(text)
    || (isNum(record.temp_max_anomaly_c) && Number(record.temp_max_anomaly_c) <= -2);
  if (state.risk === 'recovery_rain') return change === 'future_repair' || /恢复性降雨|补水|修复|缓和|relief|recovery|easing/.test(text);
  if (state.risk === 'future_worsen') return change === 'future_worsen';
  if (state.risk === 'future_repair') return change === 'future_repair';
  return true;
}

function matchesRiskFilter(record, records = null) {
  if (['gte3', 'gte4', 'lte2'].includes(state.risk)) {
    const level = riskNum(record);
    if (state.risk === 'gte3') return level >= 3;
    if (state.risk === 'gte4') return level >= 4;
    if (state.risk === 'lte2') return level <= 2;
  }
  const rows = Array.isArray(records) && records.length ? records : [record];
  return rows.some(matchesTradeViewRecord);
}

function countryHasSampleProgress(countryKey, crop) {
  return (store.cropProgress || []).some(row => {
    if (!row || row.is_sample !== true) return false;
    if (canonicalCountry(row.country) !== countryKey) return false;
    return crop === 'all' || row.crop_group === crop;
  });
}

function isCountryProxy(record) {
  return !!(record && (record.low_sample_proxy === true || record.aggregation_confidence === 'low' || record.region_sample_count === 1));
}

function isSummaryProxyRecord(record) {
  if (!record) return false;
  if (record.low_sample_proxy === true) return true;
  if (isNum(record.region_sample_count) && Number(record.region_sample_count) <= 1) return true;

  const productionBasis = [
    record.production_basis,
    record.production_basis_cn,
    record.production_basis_note_cn
  ].filter(Boolean).join(' ').toLowerCase();
  const proxyNotes = [record.source_note, record.proxy_warning_cn]
    .filter(Boolean).join(' ').toLowerCase();

  return /national\s*proxy|国家代理|代理点/.test(productionBasis)
    || /proxy|代理|低样本/.test(proxyNotes);
}

function matchesDataStatus(model) {
  if (state.dataStatus === 'all') return true;
  const proxy = model.records.some(isCountryProxy);
  const sample = countryHasSampleProgress(model.key, state.crop);
  if (state.dataStatus === 'proxy') return proxy;
  if (state.dataStatus === 'sample') return sample;
  if (state.dataStatus === 'standard') return !proxy;
  return true;
}

function countryRecordsFor(key, crop = state.crop) {
  return store.countryRecords.filter(row => {
    if (row.country_key !== key) return false;
    return crop === 'all' || row.crop_group === crop;
  });
}

function recordConfidenceRank(record) {
  const rank = { high: 3, medium: 2, low: 1 };
  return rank[record.aggregation_confidence] || 0;
}

function chooseCountryRecord(records) {
  return [...records].sort((a, b) => {
    const riskDiff = riskNumFromCountry(b) - riskNumFromCountry(a);
    if (riskDiff) return riskDiff;
    const confDiff = recordConfidenceRank(b) - recordConfidenceRank(a);
    if (confDiff) return confDiff;
    const regionDiff = (Number(b.region_count) || 0) - (Number(a.region_count) || 0);
    if (regionDiff) return regionDiff;
    return (Number(b.total_production_tonnes) || 0) - (Number(a.total_production_tonnes) || 0);
  })[0] || null;
}

function aggregateEuRecords(crop = state.crop) {
  if (!(crop === 'all' || crop === 'rapeseed_canola' || crop === 'sunflower')) return [];
  const filtered = store.euRecords.filter(row => crop === 'all' || row.crop_group === crop);
  const groups = new Map();
  filtered.forEach(row => {
    const key = crop === 'all' ? row.crop_group : crop;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  });
  return [...groups.entries()].map(([cropGroup, rows]) => {
    const total = rows.reduce((sum, row) => sum + (Number(row.production_tonnes) || 0), 0);
    const weighted = total
      ? rows.reduce((sum, row) => sum + (Number(row.risk_score_v3) || 0) * (Number(row.production_tonnes) || 0), 0) / total
      : 0;
    const top = [...rows].sort((a, b) => riskNum(b.risk_level_v3) - riskNum(a.risk_level_v3) || (Number(b.production_tonnes) || 0) - (Number(a.production_tonnes) || 0))[0];
    const level = Math.max(riskNum(top && top.risk_level_v3), Math.round(weighted));
    return {
      is_eu: true,
      country: 'European Union',
      country_key: 'European Union',
      country_cn: '欧盟',
      crop_group: cropGroup,
      oil_group: top ? top.oil_group : '',
      crop_oil_label_cn: top ? top.crop_oil_label_cn : (CROP_META[cropGroup] ? CROP_META[cropGroup].label : cropGroup),
      production_basis_cn: '成员国产量聚合',
      production_basis_note_cn: '欧盟作为虚拟国家单元，成员国在地区层展示；未生成欧盟整体假边界。',
      total_production_tonnes: total,
      weighted_risk_level: RISK[level].code,
      weighted_risk_level_cn: RISK[level].cn,
      weighted_risk_score: weighted,
      dominant_risk_type: top ? top.risk_level_v3_code : 'no_clear_pressure',
      dominant_risk_reason_cn: top ? `${top.region_cn || top.region} 为主要风险贡献成员` : '',
      weather_condition_summary_cn: '成员国风险按产量权重聚合。',
      soil_condition_summary_cn: '成员国土壤和天气详情见地区层。',
      production_impact_cn: '',
      forecast_summary_cn: '成员国预报见地区详情。',
      region_count: rows.length,
      source_name: 'eurostat',
      aggregation_confidence: 'medium',
      aggregation_note_cn: 'virtual country，用成员国记录聚合。',
      updated_at: top ? top.updated_at : ''
    };
  });
}

function getCountryModels() {
  const byCountry = new Map();
  store.countryRecords.forEach(row => {
    if (state.crop !== 'all' && row.crop_group !== state.crop) return;
    if (state.country !== 'all' && row.country_key !== state.country) return;
    if (!byCountry.has(row.country_key)) byCountry.set(row.country_key, []);
    byCountry.get(row.country_key).push(row);
  });

  const models = [];
  byCountry.forEach((records, key) => {
    const top = chooseCountryRecord(records);
    if (!top) return;
    if (!matchesRiskFilter(top, records)) return;
    if (state.anomaly !== 'all' && !records.some(row => row.dominant_risk_type === state.anomaly)) return;
    const model = { key, top, records, isEu: false };
    if (!matchesDataStatus(model)) return;
    models.push(model);
  });

  const euAggregates = aggregateEuRecords(state.crop);
  if (euAggregates.length && (state.country === 'all' || state.country === 'European Union')) {
    const top = chooseCountryRecord(euAggregates);
    if (top) {
      const riskOk = matchesRiskFilter(top, euAggregates);
      const anomalyOk = state.anomaly === 'all' || euAggregates.some(row => row.dominant_risk_type === state.anomaly);
      const model = { key: 'European Union', top, records: euAggregates, isEu: true };
      if (riskOk && anomalyOk && matchesDataStatus(model)) models.push(model);
    }
  }

  return models.sort((a, b) => {
    const riskDiff = riskNumFromCountry(b.top) - riskNumFromCountry(a.top);
    if (riskDiff) return riskDiff;
    return (Number(b.top.total_production_tonnes) || 0) - (Number(a.top.total_production_tonnes) || 0);
  });
}

function getFeatureCountry(feature) {
  return countryFromGeoName(feature.properties && feature.properties.name);
}

function createCountryTooltip(model) {
  const rows = model.records
    .sort((a, b) => riskNumFromCountry(b) - riskNumFromCountry(a))
    .map(row => `
      <div style="margin:3px 0;">
        <b>${esc(cropLabel(row))}</b> ${riskBadge(riskNumFromCountry(row), formatRiskLabel(row))} ${riskChangeBadge(row, { isCountry: true })}
        <span style="color:#8b95a3;margin-left:4px;">${esc(fmtProduction(row.total_production_tonnes))}</span>
        <div style="color:#8b95a3;">上期 ${esc(riskChangeInfo(row, { isCountry: true }).previousText)} → 当前 ${esc(riskChangeInfo(row, { isCountry: true }).currentText)}</div>
      </div>
    `).join('');
  return `
    <div style="min-width:210px;font-size:12px;">
      <b style="font-size:13px;">${esc(model.top.country_cn || getCountryName(model.key))}</b>
      ${rows}
    </div>
  `;
}

function buildMapLabel(record, zoom, layerType = 'country') {
  const currentZoom = Number(zoom) || 3;
  const isRegion = layerType === 'region';
  const name = isRegion ? shortRegionName(record) : (record.country_cn || record.country);
  const crop = CROP_META[record.crop_group] ? CROP_META[record.crop_group].tab : cropLabel(record);
  const riskLabel = normalizeRiskText(formatRiskLabel(record));
  const detail = isRegion
    ? `${isNum(record.national_share) ? `国内占比 ${fmtPct(record.national_share, currentZoom >= 6 ? 1 : 0)}` : crop}｜${formatAnomalyType(record)}`
    : `${crop}｜全球占比 ${fmtPct(globalProductionShare(record), currentZoom >= 5 ? 1 : 0)}｜${riskLabel}`;

  return `
    <div class="map-label" style="--oil-color:${cropColor(record.crop_group)}">
      <span class="stripe"></span>
      <div><strong>${esc(name)}</strong><span>${esc(detail)}</span></div>
    </div>
  `;
}

function countryLabelHtml(record, zoom) {
  return buildMapLabel(record, zoom, 'country');
}

function renderCountryLayer() {
  state.layer = 'country';
  clearMap();
  setLayerButtons();
  const models = getCountryModels();
  currentModels = models;
  currentCountryLabelCenters = [];
  const byKey = new Map(models.map(model => [model.key, model]));
  let polygonCount = 0;
  let fallbackCount = 0;

  if (store.geojson) {
    const countryGeo = L.geoJSON(store.geojson, {
      style: feature => {
        const key = getFeatureCountry(feature);
        const model = byKey.get(key);
        if (model) {
          const color = riskColor(riskNumFromCountry(model.top));
          return {
            color: '#ffffff',
            weight: 1.6,
            opacity: 0.95,
            fillColor: color,
            fillOpacity: 0.64
          };
        }
        return {
          color: '#b0b8c4',
          weight: 0.6,
          opacity: 0.5,
          fillColor: 'transparent',
          fillOpacity: 0
        };
      },
      onEachFeature: (feature, layer) => {
        const key = getFeatureCountry(feature);
        const model = byKey.get(key);
        if (model) {
          polygonCount += 1;
          layer.bindTooltip(createCountryTooltip(model), { sticky: true, direction: 'auto' });
          layer.on({
            click: () => selectCountry(model),
            mouseover: () => layer.setStyle({ weight: 2.35, fillOpacity: 0.78 }),
            mouseout: () => countryGeo.resetStyle(layer)
          });

          const center = layer.getBounds().getCenter();
          currentCountryLabelCenters.push({ center, model, direction: 'center', offset: [0, 0] });
          if (shouldShowCountryLabel(model, map.getZoom())) {
            L.tooltip({
              permanent: true,
              direction: 'center',
              className: 'production-map-label',
              opacity: 1
            })
              .setLatLng(center)
              .setContent(countryProductionLabelHtml(model))
              .addTo(layers.countryLabels);
          }
        }
      }
    }).addTo(layers.country);
  }

  models.forEach(model => {
    if (model.isEu) {
      renderEuCountryMarker(model);
      fallbackCount += 1;
      return;
    }
    if (polygonCount && hasRenderedCountryPolygon(model.key)) return;
    const center = countryCentroid(model.key);
    if (!center) return;
    fallbackCount += 1;
    const marker = L.circleMarker(center, {
      radius: 8,
      color: '#ffffff',
      weight: 1.7,
      fillColor: riskColor(riskNumFromCountry(model.top)),
      fillOpacity: 0.9
    }).addTo(layers.fallback);
    marker.bindTooltip(createCountryTooltip(model), { sticky: true });
    marker.on('click', () => selectCountry(model));
    currentCountryLabelCenters.push({ center, model, direction: 'top', offset: [0, -8] });
    if (shouldShowCountryLabel(model, map.getZoom())) {
      L.tooltip({
        permanent: true,
        direction: 'top',
        offset: [0, -8],
        className: 'production-map-label',
        opacity: 1
      }).setLatLng(center).setContent(countryProductionLabelHtml(model)).addTo(layers.countryLabels);
    }
  });

  const bounds = boundsFor(['country', 'fallback', 'virtual']);
  if (bounds.isValid()) map.fitBounds(bounds.pad(0.14));
  else map.setView([16, 25], 3);

  const highCount = models.filter(model => riskNumFromCountry(model.top) >= 3).length;
  mapStats = {
    main: models.length,
    risk: highCount,
    fallback: fallbackCount,
    note: '国家层按风险着色；部分市场在缺少区域边界时以代表点展示。'
  };
  updateOverlay();
  document.getElementById('detail-panel').innerHTML = '<div class="empty">点击地图上的国家边界查看详情。</div>';
}

function hasRenderedCountryPolygon(countryKey) {
  let rendered = false;
  layers.country.eachLayer(layer => {
    if (layer.eachLayer) {
      layer.eachLayer(child => {
        const feature = child.feature;
        if (feature && getFeatureCountry(feature) === countryKey) rendered = true;
      });
    }
  });
  return rendered;
}

function countryCentroid(countryKey) {
  const rows = store.adminRecords.filter(row => row.country_key === countryKey && isNum(row.lat) && isNum(row.lon));
  if (!rows.length) return null;
  const lat = rows.reduce((sum, row) => sum + Number(row.lat), 0) / rows.length;
  const lon = rows.reduce((sum, row) => sum + Number(row.lon), 0) / rows.length;
  return [lat, lon];
}

function shouldShowCountryLabel(model, zoom) {
  const production = Number(model.top.total_production_tonnes) || 0;
  const share = globalProductionShare(model.top);
  if (zoom <= 2) return share >= 0.08 || production > 10000000;
  if (zoom <= 3) return share >= 0.035 || production > 3000000;
  if (zoom <= 4) return share >= 0.015 || production > 1200000;
  if (zoom <= 5) return share >= 0.006 || production > 500000;
  return share >= 0.003 || production > 250000;
}

function refreshCountryLabels() {
  layers.countryLabels.clearLayers();
  if (state.layer !== 'country') return;
  const zoom = map.getZoom();
  currentCountryLabelCenters.forEach(item => {
    if (!shouldShowCountryLabel(item.model, zoom)) return;
    L.tooltip({
      permanent: true,
      direction: item.direction || 'center',
      offset: item.offset || [0, 0],
      className: 'country-map-label',
      opacity: 1
    })
      .setLatLng(item.center)
      .setContent(buildMapLabel(item.model.top, zoom, 'country'))
      .addTo(layers.countryLabels);
  });
}

function renderEuCountryMarker(model) {
  const center = [50.3, 10.5];
  const marker = L.circleMarker(center, {
    radius: 10,
    color: '#ffffff',
    weight: 2,
    fillColor: riskColor(riskNumFromCountry(model.top)),
    fillOpacity: 0.9,
    dashArray: '3,3'
  }).addTo(layers.virtual);
  marker.bindTooltip(createCountryTooltip(model), { sticky: true });
  marker.on('click', () => selectCountry(model));
  currentCountryLabelCenters.push({ center, model, direction: 'top', offset: [0, -10] });
  if (shouldShowCountryLabel(model, map.getZoom())) {
    L.tooltip({
      permanent: true,
      direction: 'top',
      offset: [0, -10],
      className: 'country-map-label',
      opacity: 1
    }).setLatLng(center).setContent(buildMapLabel(model.top, map.getZoom(), 'country')).addTo(layers.countryLabels);
  }
}

async function selectCountry(model) {
  state.selectedCountry = model.key;
  state.selectedCountryCrop = model.isEu && state.crop === 'all' ? 'all' : (state.crop === 'all' ? model.top.crop_group : state.crop);
  state.selectedCountryRecord = model.top;
  state.selectedRegionRecord = null;
  state.country = model.key;
  const select = document.getElementById('f-country');
  if ([...select.options].some(opt => opt.value === model.key)) select.value = model.key;
  state.layer = 'region';
  setLayerButtons();
  showCountryDetail(model.top);
  await renderRegionLayer();
}

function soilTempSignal(row) {
  return getValidSoilTemp(row);
}

function soilPercentileAvailable(row) {
  if (!row || row.soil_percentile_confidence === 'unavailable') return false;
  return isNum(row.rootzone_sm_percentile_doy_7d)
    || isNum(row.surface_sm_percentile_doy_7d)
    || isNum(row.rootzone_percentile)
    || isNum(row.surface_percentile);
}

function soilRootPercentile(row) {
  if (!soilPercentileAvailable(row)) return null;
  return firstNumeric(row, ['rootzone_sm_percentile_doy_7d', 'rootzone_percentile']);
}

function soilSurfacePercentile(row) {
  if (!soilPercentileAvailable(row)) return null;
  return firstNumeric(row, ['surface_sm_percentile_doy_7d', 'surface_percentile']);
}

function moistureState(row) {
  const root = soilRootPercentile(row);
  const surface = soilSurfacePercentile(row);
  return {
    root,
    surface,
    rootDry: isNum(root) && root < 30,
    surfaceDry: isNum(surface) && surface < 30,
    rootWet: isNum(root) && root > 70,
    surfaceWet: isNum(surface) && surface > 70,
    hasWater: isNum(root) || isNum(surface)
  };
}

function isPerennialCrop(row) {
  return ['palm', 'coconut'].includes(String(row && row.crop_group || '').toLowerCase());
}

function perennialCropName(row) {
  return String(row && row.crop_group || '').toLowerCase() === 'coconut' ? '椰子' : '油棕';
}

function firstStageValue(row) {
  const keys = [
    'crop_stage_cn',
    'stage_label_cn',
    'current_growth_stage_cn',
    'crop_stage',
    'stage_label',
    'phenology_stage',
    'current_stage',
    'crop_progress_stage',
    'growth_stage',
    'season_stage',
    'progress_resolved_growth_stage',
    'resolved_growth_stage',
    'growth_stage_code',
    'calendar_growth_stage_code'
  ];
  for (const key of keys) {
    const value = row && row[key];
    if (value !== null && value !== undefined && String(value).trim() !== '') return String(value).trim();
  }
  return '';
}

function stageLabelFromValue(value, row) {
  const text = String(value || '').trim();
  if (!text) return null;
  const lower = text.toLowerCase();
  const upper = text.toUpperCase();
  const perennial = isPerennialCrop(row);

  if (/全年|常年|perennial|^OS$/.test(text) || lower === 'perennial' || upper === 'OS') {
    return perennial ? { label: '常年采收作物', phase: 'perennial', perennial: true } : null;
  }
  if (/播种|出苗|sowing|planting|emergence/.test(lower) || upper === 'PE/V') {
    return { label: '播种/出苗期', phase: 'sowing', perennial: false };
  }
  if (/营养/.test(text) || lower.includes('vegetative') || upper === 'V') {
    return { label: '营养生长期', phase: 'vegetative', perennial: false };
  }
  if (/花蕾|开花/.test(text) || lower.includes('flower') || upper === 'V/FP') {
    return { label: text.includes('结荚') ? '开花/结荚期' : '开花期', phase: 'flowering', perennial: false };
  }
  if (/结荚|坐果|pod|fruit_set|fruit setting/.test(lower) || upper === 'PF') {
    return { label: '结荚/坐果期', phase: 'pod_setting', perennial: false };
  }
  if (/灌浆|充实|grain_filling|seed_filling|filling/.test(lower) || upper === 'PF/MH') {
    return { label: '灌浆期', phase: 'filling', perennial: false };
  }
  if (/成熟|maturation|maturity/.test(lower) || upper === 'MH') {
    return { label: '成熟/收获期', phase: 'harvest', perennial: false };
  }
  if (/收获|采收|harvest/.test(lower)) {
    return { label: '收获期', phase: 'harvest', perennial: false };
  }
  return null;
}

function cropStageInfo(row) {
  if (!row) return null;
  const raw = firstStageValue(row);
  const mapped = stageLabelFromValue(raw, row);
  if (mapped) {
    if (isPerennialCrop(row)) return { ...mapped, perennial: true };
    return mapped;
  }
  if (isPerennialCrop(row)) {
    return { label: '常年采收作物', phase: 'perennial', perennial: true };
  }
  return null;
}

function stageIntro(row, stage) {
  if (!stage) return '';
  if (stage.perennial) {
    if (stage.phase === 'perennial') return `${perennialCropName(row)}为常年采收作物，`;
    return `${perennialCropName(row)}当前处于${stage.label}，`;
  }
  return `当前处于${stage.label}，`;
}

function dryStageImpact(row, stage) {
  if (!stage) return '';
  if (stage.perennial) {
    return String(row && row.crop_group || '').toLowerCase() === 'coconut'
      ? '可能影响后续椰果发育和恢复'
      : '后续恢复存在滞后性';
  }
  if (stage.phase === 'sowing') return '偏干可能影响出苗和苗情建立';
  if (stage.phase === 'vegetative') return '可能限制营养生长和根系恢复';
  if (stage.phase === 'flowering') return '水分压力对开花和结实较敏感';
  if (stage.phase === 'pod_setting') return '可能影响结荚/坐果和后续单产形成';
  if (stage.phase === 'filling') return '可能影响籽粒充实和单产形成';
  return '';
}

function wetStageImpact(row, stage) {
  if (stage && stage.perennial) {
    return String(row && row.crop_group || '').toLowerCase() === 'coconut'
      ? '采收、晾晒和物流效率可能受影响'
      : '采收和运输效率可能受影响';
  }
  if (stage && stage.phase === 'sowing') return '播种、出苗和田间作业可能受影响';
  if (stage && stage.phase === 'harvest') return '收获和田间作业效率可能受影响';
  return '田间作业条件偏差，病害压力可能上升';
}

function wetReliefTarget(row, stage) {
  if (stage && stage.perennial) {
    return String(row && row.crop_group || '').toLowerCase() === 'coconut'
      ? '采收和晾晒压力'
      : '采收和运输压力';
  }
  if (stage && stage.phase === 'harvest') return '收获和田间作业压力';
  return '田间作业压力';
}

function hotDryStageImpact(stage) {
  if (!stage) return '高土温叠加偏干，水分消耗压力较大。';
  if (stage.phase === 'flowering') return '高土温叠加偏干，授粉/结实压力加大。';
  if (stage.phase === 'filling') return '高土温叠加偏干，灌浆压力加大。';
  return '高土温叠加偏干，水分消耗压力较大。';
}

function buildCurrentRiskSentences(row) {
  if (!row) return [];
  const items = [];
  const moisture = moistureState(row);
  const temp = soilTempSignal(row);
  const rain = rainState(row);
  const stage = cropStageInfo(row);
  const intro = stageIntro(row, stage);
  const dryBoth = moisture.rootDry && moisture.surfaceDry;
  const anyDry = moisture.rootDry || moisture.surfaceDry;
  const anyWet = moisture.rootWet || moisture.surfaceWet;

  if (dryBoth) {
    const impact = dryStageImpact(row, stage);
    if (rain.status === 'dry') items.push(`${intro}${rain.label}，表层和根区水分偏低，水分压力较明显${impact ? `，${impact}` : ''}。`);
    else if (rain.status === 'near') items.push(`${intro}${rain.label}，但表层和根区水分偏低，当前主要风险来自土壤水分压力${impact ? `，${impact}` : ''}。`);
    else items.push(`${intro}表层和根区同步偏干，水分压力较明显${impact ? `，${impact}` : ''}。`);
  } else if (moisture.rootDry) {
    const impact = dryStageImpact(row, stage);
    if (rain.status === 'dry') items.push(`${intro}${rain.label}，根区水分偏低，存在持续水分压力${impact ? `，${impact}` : ''}。`);
    else if (rain.status === 'near') items.push(`${intro}${rain.label}，但根区水分偏低，当前主要风险来自土壤水分压力${impact ? `，${impact}` : ''}。`);
    else items.push(`${intro}根区水分偏低，存在持续水分压力${impact ? `，${impact}` : ''}。`);
  } else if (moisture.surfaceDry) {
    const impact = dryStageImpact(row, stage);
    if (rain.status === 'dry') items.push(`${intro}${rain.label}，表层偏干，短期墒情不足${impact ? `，${impact}` : ''}。`);
    else if (rain.status === 'near') items.push(`${intro}${rain.label}，但表层偏干，短期墒情不足${impact ? `，${impact}` : ''}。`);
    else items.push(`${intro}表层偏干，短期墒情不足${impact ? `，${impact}` : ''}。`);
  } else if (rain.status === 'near' && moisture.hasWater) {
    items.push(`${intro}${rain.label}，土壤水分未见明显压力。`);
  }

  if (rain.status === 'wet' && moisture.surfaceWet) {
    items.push(`${intro}${rain.label}且表层土壤偏湿，${wetStageImpact(row, stage)}。`);
  } else if (rain.status === 'wet' && anyWet) {
    items.push(`${intro}${rain.label}，土壤水分偏高，田间恢复可能偏慢。`);
  } else if (rain.status === 'wet') {
    items.push(`${intro}${rain.label}。`);
  }

  if (temp.hot && anyDry) {
    items.push(hotDryStageImpact(stage));
  } else if (temp.hot && moisture.hasWater && !moisture.rootDry && !moisture.surfaceDry) {
    items.push('土壤温度偏高，但水分条件尚可，短期压力有限。');
  } else if (temp.cold && (anyWet || rain.status === 'wet')) {
    items.push('低土温叠加偏湿，田间恢复和作业条件可能偏慢。');
  }

  return [...new Set(items)];
}

function buildRecoverySentences(row) {
  if (!row) return [];
  const items = [];
  const moisture = moistureState(row);
  const stage = cropStageInfo(row);
  const rainHigh = hasOperationRainEvidence(row);
  const forecast7 = firstNumeric(row, ['forecast_rainfall', 'forecast_7d', 'rain_forecast_7d', 'forecast_7d_precip', 'forecast_rainfall_7d']);
  const forecast16 = firstNumeric(row, ['forecast_16d_precip', 'forecast_16d', 'rain_forecast_16d']);
  const hasForecast = isNum(forecast7) || isNum(forecast16) || row.forecast_signal;
  if (!hasForecast) return items;

  const futureRain = isNum(forecast16) ? forecast16 : forecast7;
  if (row.risk_type === 'mixed_signal_monitor' || (row.risk_type === 'drought_water_deficit' && (moisture.rootWet || moisture.surfaceWet) && isNum(futureRain) && futureRain >= 30)) {
    items.push('土壤水分和预报降雨对前期降雨缺口有缓冲，后续重点看偏湿是否消退，而不是简单延续干旱判断。');
  } else if (moisture.rootDry || moisture.surfaceDry) {
    if (isNum(futureRain) && futureRain >= 30) {
      if (stage && stage.perennial) {
        items.push('若后续降雨持续改善，表层水分可能先修复；根区水分修复仍需连续降雨配合。');
      } else {
        items.push('如果未来7-14天出现连续有效降雨，表层水分可能先修复；根区水分修复仍需要更多降雨配合。');
      }
    } else if (isNum(futureRain)) {
      items.push(stage && !stage.perennial
        ? `若未来7-14天降雨仍不足，${stage.label}水分压力可能延续。`
        : '未来7-14天补水偏少，水分压力可能延续。');
    } else if (String(row.forecast_signal || '').includes('relief')) {
      items.push('预报降雨存在恢复信号，表层水分可能先改善。');
    } else if (String(row.forecast_signal || '').includes('no_relief')) {
      items.push('预报尚未显示有效补水，水分压力可能延续。');
    }
  } else if (rainHigh || moisture.rootWet || moisture.surfaceWet) {
    if (isNum(futureRain) && futureRain < 20) {
      items.push(`如果后续降雨减弱，表层湿度回落后，${wetReliefTarget(row, stage)}可能缓解。`);
    } else if (isNum(futureRain)) {
      items.push('后续仍有降雨，田间湿度回落可能偏慢。');
    } else if (String(row.forecast_signal || '').includes('relief')) {
      items.push('预报显示后续压力有缓和可能。');
    }
  }
  return [...new Set(items)];
}

function renderConclusionBlock(row) {
  const current = buildPressureItems(row).slice(0, 2);
  const recovery = buildRecoverySentences(row);
  if (!current.length && !recovery.length) return '';
  const currentHtml = current.length ? `<p><b>目前风险：</b>${esc(current.join(''))}</p>` : '';
  const recoveryHtml = recovery.length ? `<p><b>未来修复可能：</b>${esc(recovery.join(''))}</p>` : '';
  return `<div class="detail-block"><h3>结论</h3><div class="conclusion-line">${currentHtml}${recoveryHtml}</div></div>`;
}

function countryConclusion(record, topRegions) {
  return '';
}

function formatConfidence(value) {
  const confidence = String(value || '').toLowerCase();
  if (confidence.includes('high')) return '高';
  if (confidence.includes('low')) return '有限';
  return '中';
}

function detailCell(label, value) {
  const safe = safeValue(value, '');
  if (safe === '') return '';
  return `<div class="data-cell"><span class="lbl">${esc(label)}</span><span class="val">${esc(safe)}</span></div>`;
}

function renderImpactScopeBlock(record, options = {}) {
  return '';
}

function firstNumeric(row, keys) {
  for (const key of keys) {
    if (isNum(row && row[key])) return Number(row[key]);
  }
  return null;
}

function validSoilTempValue(value) {
  if (!isNum(value)) return null;
  const n = Number(value);
  if (n === -999 || n === -9999 || n < -30 || n > 60) return null;
  return n;
}

function getValidSoilTemp(row) {
  const st = store.soilTempIndex && row ? store.soilTempIndex.get(row.weather_region_id) : null;
  if (!st) return { record: null, hasValid: false, hot: false, cold: false, values: {} };
  const t0 = validSoilTempValue(st.soil_temp_0_7cm_mean_c);
  const t28 = validSoilTempValue(st.soil_temp_7_28cm_mean_c);
  const hasValid = t0 !== null || t28 !== null;
  if (!hasValid) return { record: st, hasValid: false, hot: false, cold: false, values: {} };
  const text = `${st.soil_temp_signal_cn || ''} ${st.soil_temp_signal || ''}`.toLowerCase();
  return {
    record: st,
    hasValid: true,
    hot: /偏热|偏暖|高温|hot|warm/.test(text) || (t0 !== null && t0 > 30) || (t28 !== null && t28 > 30),
    cold: /偏冷|低温|cold/.test(text) || (t0 !== null && t0 < 5) || (t28 !== null && t28 < 5),
    text: st.soil_temp_signal_cn || '',
    values: { t0, t28 }
  };
}

function rainState(row, timeRange = state.timeRange) {
  if (!row) return { status: 'unknown', label: '', window: '近30天', hasData: false };
  const ranges = timeRange === '7d'
    ? [{
        window: '近7天',
        actual: firstNumeric(row, ['rain_7d_sum_mm', 'rain_7d', 'rainfall_7d', 'precip_7d', 'precip_7d_actual']),
        normal: firstNumeric(row, ['rain_7d_normal', 'rainfall_7d_normal', 'precip_7d_normal']),
        anomaly: firstNumeric(row, ['rain_7d_anomaly_mm', 'rainfall_anomaly_7d', 'precip_7d_anomaly_mm', 'rainfall_7d_anomaly']),
        pct: firstNumeric(row, ['rain_7d_pct_of_normal', 'rain_pct_of_normal_7d', 'precip_7d_ratio_pct']),
        percentile: firstNumeric(row, ['rain_7d_percentile', 'rain_percentile_7d'])
      }]
    : timeRange === '14d'
      ? [{
          window: '近14天',
          actual: firstNumeric(row, ['rain_14d_sum_mm', 'rain_14d', 'rainfall_14d', 'precip_14d', 'precip_14d_actual']),
          normal: firstNumeric(row, ['rain_14d_normal', 'rainfall_14d_normal', 'precip_14d_normal']),
          anomaly: firstNumeric(row, ['rain_14d_anomaly_mm', 'rainfall_anomaly_14d', 'precip_14d_anomaly_mm', 'rainfall_14d_anomaly']),
          pct: firstNumeric(row, ['rain_14d_pct_of_normal', 'rain_pct_of_normal_14d', 'precip_14d_ratio_pct']),
          percentile: firstNumeric(row, ['rain_14d_percentile', 'rain_percentile_14d'])
        }]
      : [];
  ranges.push({
    window: '近30天',
    actual: firstNumeric(row, ['rain_30d_sum_mm', 'rain_30d', 'rainfall_30d', 'precip_30d', 'precip_30d_actual']),
    normal: firstNumeric(row, ['rain_30d_normal', 'rainfall_30d_normal', 'precip_30d_normal']),
    anomaly: firstNumeric(row, ['rain_30d_anomaly_mm', 'rainfall_anomaly_30d', 'precip_30d_anomaly_mm', 'rainfall_30d_anomaly']),
    pct: firstNumeric(row, ['rain_30d_pct_of_normal', 'rain_pct_of_normal_30d', 'precip_30d_ratio_pct']),
    percentile: firstNumeric(row, ['rain_30d_percentile', 'rain_percentile_30d'])
  });
  const metrics = ranges.find(item => [item.actual, item.normal, item.anomaly, item.pct, item.percentile].some(isNum));
  if (!metrics) return { status: 'unknown', label: '', window: '近30天', hasData: false };
  const anomalyNear = isNum(metrics.anomaly) && metrics.anomaly >= -20 && metrics.anomaly <= 20;
  const pctNear = isNum(metrics.pct) && metrics.pct >= 80 && metrics.pct <= 120;
  if (anomalyNear || pctNear) return { ...metrics, status: 'near', label: `${metrics.window}降雨接近常年`, hasData: true };
  if ((isNum(metrics.pct) && metrics.pct <= 80) || (isNum(metrics.anomaly) && metrics.anomaly <= -20) || (isNum(metrics.percentile) && metrics.percentile <= 30)) {
    return { ...metrics, status: 'dry', label: `${metrics.window}降雨偏少`, hasData: true };
  }
  if ((isNum(metrics.pct) && metrics.pct >= 120) || (isNum(metrics.anomaly) && metrics.anomaly >= 20) || (isNum(metrics.percentile) && metrics.percentile >= 70)) {
    return { ...metrics, status: 'wet', label: `${metrics.window}降雨偏多`, hasData: true };
  }
  return { ...metrics, status: 'unknown', label: '', hasData: true };
}

function buildWeatherFactItems(row, timeRange = state.timeRange) {
  if (!row) return [];
  const rootPct = soilRootPercentile(row);
  if (timeRange === '7d') {
    const rain7 = firstNumeric(row, ['rain_7d_sum_mm', 'rain_7d', 'rainfall_7d', 'precip_7d', 'precip_7d_actual']);
    const anom7 = firstNumeric(row, ['rain_7d_anomaly_mm', 'rainfall_anomaly_7d', 'precip_7d_anomaly_mm', 'rainfall_7d_anomaly']);
    return [
      isNum(rain7) ? ['近7天降雨', fmtNum(rain7, 1, ' mm')] : null,
      isNum(anom7) ? ['近7天降雨距平', fmtSigned(anom7, 1, ' mm')] : null,
      isNum(row.heavy_rain_days_7d) ? ['近7天强降雨日数', fmtInt(row.heavy_rain_days_7d, ' 天')] : null,
      isNum(rootPct) ? ['土壤湿度分位', `P${Math.round(Number(rootPct))}`] : null
    ].filter(Boolean);
  }
  if (timeRange === '14d') {
    const actual14d = firstNumeric(row, ['rain_14d_sum_mm', 'rain_14d', 'rainfall_14d', 'precip_14d', 'precip_14d_actual']);
    const anomaly14d = firstNumeric(row, ['rain_14d_anomaly_mm', 'rainfall_anomaly_14d', 'precip_14d_anomaly_mm', 'rainfall_14d_anomaly']);
    return [
      isNum(actual14d) ? ['近14天降雨', fmtNum(actual14d, 1, ' mm')] : null,
      isNum(anomaly14d) ? ['近14天降雨距平', fmtSigned(anomaly14d, 1, ' mm')] : null
    ].filter(Boolean);
  }
  if (timeRange === 'future7d') {
    const forecast7 = firstNumeric(row, ['forecast_rainfall', 'forecast_7d', 'rain_forecast_7d', 'forecast_7d_precip', 'forecast_rainfall_7d']);
    const forecastDirection = forecastReliefText(row);
    return [
      isNum(forecast7) ? ['未来7天降雨', fmtNum(forecast7, 1, ' mm')] : null,
      forecastDirection ? ['预报方向', forecastDirection] : null
    ].filter(Boolean);
  }
  const rain30 = firstNumeric(row, ['rain_30d_sum_mm', 'rain_30d', 'rainfall_30d', 'precip_30d', 'precip_30d_actual']);
  const normal30 = firstNumeric(row, ['precip_30d_normal', 'rain_30d_normal', 'rainfall_30d_normal']);
  const anom30 = firstNumeric(row, ['precip_30d_anomaly_mm', 'rainfall_anomaly_30d', 'rain_30d_anomaly_mm', 'rainfall_30d_anomaly']);
  return [
    isNum(rain30) ? ['近30天降雨', fmtNum(rain30, 1, ' mm')] : null,
    isNum(normal30) ? ['近30天常年', fmtNum(normal30, 1, ' mm')] : null,
    isNum(anom30) ? ['近30天降雨距平', fmtSigned(anom30, 1, ' mm')] : null,
    isNum(rootPct) ? ['土壤湿度分位', `P${Math.round(Number(rootPct))}`] : null
  ].filter(Boolean);
}

function renderWeatherFactsBlock(row, title = '天气事实') {
  const facts = buildWeatherFactItems(row);
  if (!facts.length) return '';
  const tags = renderWeatherTagStrip(row);
  return `<div class="detail-block"><h3>${esc(title)}</h3>${tags}<div class="data-grid cols-3">${facts.map(([label, value]) => detailCell(label, value)).join('')}</div></div>`;
}

function recent5RainTag(metric) {
  if (!metric || metric.status !== 'available' || Number(metric.years) < 2 || !isNum(metric.diff) || !isNum(metric.mean)) return null;
  const diff = Number(metric.diff);
  const mean = Number(metric.mean);
  const rel = mean > 1 ? diff / mean : null;
  if (rel !== null) {
    if (rel <= -0.3) return { label: '较近5年偏少', detail: fmtSigned(diff, 1, ' mm') };
    if (rel >= 0.3) return { label: '较近5年偏多', detail: fmtSigned(diff, 1, ' mm') };
    return { label: '接近近5年', detail: fmtSigned(diff, 1, ' mm') };
  }
  if (diff <= -10) return { label: '较近5年偏少', detail: fmtSigned(diff, 1, ' mm') };
  if (diff >= 10) return { label: '较近5年偏多', detail: fmtSigned(diff, 1, ' mm') };
  return { label: '接近近5年', detail: fmtSigned(diff, 1, ' mm') };
}

function recent5TempTag(metric) {
  if (!metric || metric.status !== 'available' || Number(metric.years) < 2 || !isNum(metric.diff)) return null;
  const diff = Number(metric.diff);
  if (diff <= -2) return { label: '较近5年偏冷', detail: fmtSigned(diff, 1, '°C') };
  if (diff <= -1) return { label: '较近5年略冷', detail: fmtSigned(diff, 1, '°C') };
  if (diff >= 2) return { label: '较近5年偏热', detail: fmtSigned(diff, 1, '°C') };
  if (diff >= 1) return { label: '较近5年略热', detail: fmtSigned(diff, 1, '°C') };
  return { label: '接近近5年', detail: fmtSigned(diff, 1, '°C') };
}

function weatherRecent5Tag(row, metric = state.weatherMetric) {
  if (!row) return null;
  const window = recent5DisplayWindow();
  if (metric === 'rain') {
    const tag = recent5RainTag(recent5Metric(row, 'precip', window, 'mm', `precip_${window}d_actual`));
    return tag ? { ...tag, kind: 'recent5' } : null;
  }
  if (metric === 'temp') {
    const tag = recent5TempTag(recent5Metric(row, 'tmax', window, 'c', `tmax_${window}d_c`));
    return tag ? { ...tag, kind: 'recent5' } : null;
  }
  return null;
}

function weatherTagItems(row, metric = state.weatherMetric) {
  if (!row) return [];
  const tags = [];
  const metricValue = weatherMetricValue(row, metric);
  const category = weatherMetricCategoryLabel(row, metric);
  if (isNum(metricValue.value)) tags.push({ label: category, kind: 'primary' });
  const recent = weatherRecent5Tag(row, metric);
  if (recent) tags.push(recent);
  return tags;
}

function renderWeatherTagStrip(row, metric = state.weatherMetric) {
  const tags = weatherTagItems(row, metric);
  if (!tags.length) return '';
  return `<div class="weather-tag-strip">${tags.map(tag => `<span class="weather-tag ${escAttr(tag.kind || '')}" title="${escAttr(tag.detail || '')}">${esc(tag.label)}</span>`).join('')}</div>`;
}

function productionWeatherMiniTag(row) {
  const recent = weatherRecent5Tag(row);
  if (recent) return recent.label;
  const metricValue = weatherMetricValue(row);
  return isNum(metricValue.value) ? weatherMetricCategoryLabel(row) : '';
}

function growthSensitivityText(record) {
  return '';
}

function renderGrowthStageBlock(record) {
  return '';
}

function isSoilDry(row) {
  if (!soilPercentileAvailable(row)) return false;
  const soilText = `${row.soil_status_cn || ''} ${row.soil_status_90d_cn || ''} ${row.soil_condition_summary_cn || ''} ${row.soil_signal_recent || ''}`.toLowerCase();
  const rootPct = soilRootPercentile(row);
  const surfacePct = soilSurfacePercentile(row);
  return (isNum(rootPct) && Number(rootPct) < 25)
    || (isNum(surfacePct) && Number(surfacePct) < 25)
    || /dry|偏干|水分压力|缺水/.test(soilText);
}

function isRainfallHigh(row) {
  return rainState(row).status === 'wet';
}

function hasOperationRainEvidence(row) {
  const moisture = moistureState(row);
  return isRainfallHigh(row) && moisture.surfaceWet;
}

function cropDisplayName(record) {
  return productionCommodityLabel(record);
}

function buildDetailHeaderTitle(record, options = {}) {
  const crop = cropDisplayName(record);
  const place = options.isCountry
    ? (options.countryName || record.country_cn || record.country)
    : (options.regionName || shortRegionName(record));
  const production = options.production ?? record.production_tonnes ?? record.total_production_tonnes;
  const parts = [
    crop,
    place,
    isNum(production) ? `${productionLabel(record)} ${fmtProduction(production)}` : '',
    !options.isCountry && isNum(record.national_share) ? `${productionCommodityLabel(record)}全国占比 ${fmtPct(record.national_share)}` : '',
    options.isCountry && isNum(record.global_share) ? `${productionCommodityLabel(record)}全球占比 ${fmtPct(record.global_share)}` : ''
  ].filter(Boolean);
  return parts.join('｜');
}

function signalText(value) {
  const map = {
    dry_day: '1日偏干',
    normal_day: '1日正常',
    wet_day: '1日有雨',
    heavy_rain_day: '1日强降雨',
    very_heavy_rain_day: '1日特强降雨',
    dry_3d: '3日偏干',
    normal_3d: '3日正常',
    wet_3d: '3日偏湿',
    heavy_3d: '3日强降雨',
    very_heavy_3d: '3日特强降雨',
    dry_7d: '7日偏干',
    normal_7d: '7日正常',
    wet_7d: '7日偏湿',
    heavy_7d: '7日强降雨',
    very_heavy_7d: '7日特强降雨',
    heavy_rain_disruption: '强降雨扰动作业',
    operation_disruption_wet: '偏湿扰动作业',
    operation_friendly_dry_window: '偏干利于作业窗口',
    normal_operation: '作业条件正常'
  };
  return map[value] || value || '';
}

function impactChannelText(tag) {
  const channel = String(tag && (tag.impact_channel || tag.impact_type || '')).toLowerCase();
  if (channel.includes('harvest')) return '收获/采收';
  if (channel.includes('transport')) return '运输';
  if (channel.includes('sowing') || channel.includes('establishment')) return '播种/出苗';
  if (channel.includes('yield')) return '产量形成';
  if (channel.includes('operation')) return '田间作业';
  return '';
}

function tagRiskSentence(tag) {
  const label = tag.risk_label_cn || tag.label_cn || '风险标签';
  const channel = impactChannelText(tag);
  const impact = tag.impact_text_cn || tag.evidence_cn || '';
  const level = tagRiskNum(tag);
  const prefix = channel ? `${label}（${channel}）` : label;
  return `${prefix}：${impact || `标签等级 ${level}`}。`;
}

function evidenceSnapshot(row) {
  const parts = [];
  if (isNum(row.precip_30d_ratio_pct)) parts.push(`30日降雨为常年${fmtPct(row.precip_30d_ratio_pct, 0, false)}`);
  else if (isNum(row.precip_30d_anomaly_mm)) parts.push(`30日降雨距平${fmtSigned(row.precip_30d_anomaly_mm, 1, ' mm')}`);
  const shortSignals = [row.rain_signal_1d, row.rain_signal_3d, row.rain_signal_7d, row.operation_rain_signal]
    .map(signalText)
    .filter(Boolean);
  if (shortSignals.length) parts.push(shortSignals.join('、'));
  const soil = [];
  const rootPct = soilRootPercentile(row);
  const surfacePct = soilSurfacePercentile(row);
  if (isNum(rootPct)) soil.push(`根区P${Math.round(Number(rootPct))}`);
  if (isNum(surfacePct)) soil.push(`表层P${Math.round(Number(surfacePct))}`);
  if (soil.length) parts.push(`土壤${soil.join('、')}`);
  if (isNum(row.forecast_7d_precip) || isNum(row.forecast_16d_precip)) {
    const fc = [
      isNum(row.forecast_7d_precip) ? `7天${fmtNum(row.forecast_7d_precip, 1, ' mm')}` : '',
      isNum(row.forecast_16d_precip) ? `16天${fmtNum(row.forecast_16d_precip, 1, ' mm')}` : ''
    ].filter(Boolean).join('、');
    parts.push(`预报${fc}`);
  }
  return parts.join('；');
}

function buildRiskTagSentences(row) {
  if (riskNum(row && row.risk_level_v3) < 2) return [];
  const adverse = sortedRiskTags(row, tag => isAdverseTag(tag) && tagRiskNum(tag) >= 2).slice(0, 3);
  return adverse.map(tagRiskSentence);
}

function buildSignalConsistencySentences(row) {
  const items = [];
  const riskType = row && row.risk_type;
  const moisture = moistureState(row);
  const rain = rainState(row);
  const stage = cropStageInfo(row);
  const forecast7 = firstNumeric(row, ['forecast_7d_precip', 'forecast_rainfall', 'forecast_7d', 'rain_forecast_7d']);
  const forecast16 = firstNumeric(row, ['forecast_16d_precip', 'forecast_16d', 'rain_forecast_16d']);
  const rain30Pct = firstNumeric(row, ['precip_30d_ratio_pct', 'rain_30d_pct_of_normal']);
  const rain30Wet = isNum(rain30Pct) && rain30Pct >= 120;
  const rain30Dry = isNum(rain30Pct) && rain30Pct <= 80;
  const hasWetShortSignal = /wet|heavy/.test(`${row && row.rain_signal_3d || ''} ${row && row.rain_signal_7d || ''} ${row && row.operation_rain_signal || ''}`);
  const soilDry = moisture.rootDry || moisture.surfaceDry;
  const soilWet = moisture.rootWet || moisture.surfaceWet;
  const forecastRelief = (isNum(forecast7) && forecast7 >= 30) || (isNum(forecast16) && forecast16 >= 60);
  const forecastDry = (isNum(forecast7) && forecast7 < 15) || (isNum(forecast16) && forecast16 < 30);

  if (riskType === 'mixed_signal_monitor') {
    items.push('信号分化：近30日降雨偏少，但土壤水分或未来降雨并未支持持续干旱，当前更适合观察而非判定明确水分压力。');
  } else if (riskType === 'drought_water_deficit' && rain30Dry && (soilWet || forecastRelief) && !soilDry) {
    items.push('信号分化：近30日降雨偏少，但土壤仍偏湿或未来补水充足，短期干旱压力证据不足。');
  } else if (riskType === 'drought_water_deficit' && rain30Wet && soilDry) {
    items.push('信号分化：30日累计降雨偏多，但土壤分位偏低，当前水分压力主要来自根区/表层墒情和后续补水不足。');
  } else if (riskType === 'drought_water_deficit' && rain.status === 'dry' && soilDry && !forecastRelief) {
    items.push(`降雨偏少、土壤偏干${forecastDry ? '且预报补水不足' : ''}，水分压力判断方向较一致。`);
  } else if (riskType === 'drought_water_deficit' && rain.status === 'dry') {
    items.push('降雨偏少是主要异常，但土壤或预报未完全同向，需按分化信号跟踪。');
  } else if (riskType === 'drought_water_deficit' && forecastRelief) {
    items.push('当前水分压力仍需关注，但未来预报有补水，后续可能缓和。');
  }

  if (riskType === 'wetness_waterlogging' && row && row.rain_signal_1d === 'dry_day' && hasWetShortSignal) {
    items.push('单日已转干，但3日/7日累计或作业信号仍偏湿，风险主要指向田间作业窗口而不是当天降雨。');
  } else if (riskType === 'wetness_waterlogging' && (moisture.surfaceWet || moisture.rootWet || hasWetShortSignal)) {
    items.push(`${stage && stage.phase === 'harvest' ? '收获阶段' : '当前阶段'}偏湿信号仍在，重点关注作业效率、含水率和运输窗口。`);
  }

  if (riskType === 'heat_drydown' && soilDry && forecastRelief) {
    items.push('高温/土温信号与偏干墒情叠加，但未来预报有补水，干热压力需继续跟踪而非直接外推。');
  } else if (riskType === 'heat_drydown' && soilDry) {
    items.push('高温/土温信号与偏干墒情叠加，水分消耗压力高于单一降雨指标。');
  }
  if (riskType === 'low_temperature') {
    items.push('低温风险来自土温/气温信号，需结合当前作物阶段判断恢复速度。');
  }
  if (!items.length && row && row.risk_reason_cn && riskNum(row.risk_level_v3) >= 3) {
    items.push(row.risk_reason_cn);
  }
  return items;
}

function buildPressureItems(record, evidenceRecord = record) {
  const row = evidenceRecord || record;
  if (riskNum(row && row.risk_level_v3) <= 0 && (!row || row.risk_type === 'no_clear_pressure')) return [];
  const items = [
    ...buildRiskTagSentences(row),
    ...buildSignalConsistencySentences(row),
    ...buildCurrentRiskSentences(row)
  ].filter(Boolean);
  return [...new Set(items)].slice(0, 5);
}

function renderRainSoilExplanationBlock(row) {
  const snapshot = evidenceSnapshot(row);
  if (!snapshot) return '';
  return `<div class="detail-block"><h3>风险证据链</h3><p>${esc(snapshot)}</p></div>`;
}

function renderSignalContradictionBlock(row) {
  const contradictions = row._signal_contradictions || [];
  const baselineConflict = row._soil_baseline_conflict || false;
  const seasonalCat = row._soil_seasonal_cat || '';
  const recentCat = row._soil_recent_cat || '';

  if (!contradictions.length && !baselineConflict) return '';

  let html = '<div class="detail-block" style="border-left: 3px solid #f39c12; background: #fef9e7;">';
  html += '<h3 style="color: #d68910;">&#9888; 信号一致性警告</h3>';
  html += '<p style="font-size: 0.9em; color: #7d6608; margin-bottom: 8px;">以下信号之间存在矛盾，风险评估的不确定性较高：</p>';
  html += '<ul style="font-size: 0.9em; color: #7d6608; margin: 0; padding-left: 20px;">';

  const contradictionLabels = {
    'rain_deficit_but_soil_wet': '降雨不足但土壤偏湿 — 可能原因：灌溉、数据时效差异',
    'rain_excess_but_soil_dry': '降雨过多但土壤偏干 — 可能原因：排水良好、数据时效差异',
    'heat_stress_but_soil_wet_no_rain_excess': '高温但土壤湿润（无降雨解释）— 可能原因：高湿度、近期降雨',
    'cold_stress_with_dry_soil_non_winter': '非冬季冷胁迫+干旱 — 可能原因：异常天气事件',
  };

  for (const c of contradictions) {
    const label = contradictionLabels[c] || c;
    html += `<li>${esc(label)}</li>`;
  }

  if (baselineConflict) {
    html += `<li>土壤基线冲突：季节性基线显示"${esc(seasonalCat)}"，90天滚动基线显示"${esc(recentCat)}" — 已采用季节性基线，置信度降低</li>`;
  }

  html += '</ul></div>';
  return html;
}

function renderRiskJudgementBlock(record, options = {}) {
  const riskValue = options.isCountry ? riskNumFromCountry(record) : record.risk_level_v3;
  const evidenceRecord = options.evidenceRecord || record;
  const pressureItems = buildPressureItems(record, evidenceRecord);
  if (!pressureItems.length && riskNum(riskValue) <= 1) return '';
  const cells = [
    detailCell('风险等级', formatRiskLabel(record)),
    detailCell('异常类型', formatAnomalyType(record))
  ].filter(Boolean);
  const pressureHtml = pressureItems.length
    ? `<div class="pressure-list"><b>主要风险：</b><ol>${pressureItems.map(item => `<li>${esc(item)}</li>`).join('')}</ol></div>`
    : '';
  return `<div class="detail-block"><h3>风险判断：${esc(formatRiskLabel(record))}</h3><div style="margin-bottom:8px;">${riskBadge(riskValue, formatRiskLabel(record))}</div><div class="data-grid cols-3">${cells.join('')}</div>${pressureHtml}</div>`;
}

function detailHtmlCell(label, html) {
  if (!html) return '';
  return `<div class="data-cell"><span class="lbl">${esc(label)}</span><span class="val">${html}</span></div>`;
}

function detailPlaceName(record, options = {}) {
  return options.isCountry
    ? (options.countryName || record.country_cn || record.country)
    : (options.regionName || shortRegionName(record));
}

function currentConclusionText(record, options = {}) {
  const place = detailPlaceName(record, options);
  const crop = cropDisplayName(record);
  const label = formatRiskLabel(record);
  const level = riskLevelForRecord(record, options);
  const change = riskChangeInfo(record, options);
  if (options.conclusion) return options.conclusion;
  if (level >= 4) return `${place}${crop}处于${label}，属于显著压力暴露；结论仅指向预期扰动，仍需跟踪产量数据验证。`;
  if (level >= 3) return `${place}${crop}处于${label}，建议重点跟踪水分、温度和作业窗口变化。`;
  if (change.code === 'future_repair') return `${place}${crop}当前压力有短期修复信号，仍需观察后续降雨是否兑现。`;
  if (level >= 2) return `${place}${crop}处于一般关注，暂不外推为明确供应影响。`;
  return `${place}${crop}当前为正常状态，暂无明显供应影响。`;
}

function renderCurrentConclusionSection(record, options = {}) {
  const level = riskLevelForRecord(record, options);
  return `<div class="detail-block">
    <h3>当前结论</h3>
    <div class="conclusion-line">
      <p>${esc(currentConclusionText(record, options))}</p>
      <div class="status-badges">${riskBadge(level, formatRiskLabel(record))}${riskChangeBadge(record, options)}</div>
    </div>
  </div>`;
}

function renderEvidenceSection(record, options = {}) {
  const row = options.weatherRecord || record;
  const facts = [
    isNum(row && row.precip_30d_actual) ? detailCell('30天降雨', isNum(row.precip_30d_normal) ? `${fmtNum(row.precip_30d_actual, 0, ' mm')} / 常年 ${fmtNum(row.precip_30d_normal, 0, ' mm')}` : fmtNum(row.precip_30d_actual, 0, ' mm')) : '',
    isNum(row && row.precip_30d_anomaly_mm) ? detailCell('降雨距平', fmtSigned(row.precip_30d_anomaly_mm, 0, ' mm')) : '',
    isNum(row && row.temp_max_anomaly_c) ? detailCell('最高温距平', fmtSigned(row.temp_max_anomaly_c, 1, '℃')) : '',
    soilRootPercentile(row) !== null ? detailCell('根区墒情', `P${Math.round(soilRootPercentile(row))}`) : '',
    row && row.soil_condition_summary_cn ? detailCell('土壤说明', formatPublicText(row.soil_condition_summary_cn)) : '',
    detailCell('异常类型', formatAnomalyType(record))
  ].filter(Boolean);
  const pressure = buildPressureItems(record, row).slice(0, 2);
  const evidenceText = row && (row.risk_evidence_cn || row.risk_reason_cn || row.weather_condition_summary_cn || evidenceSnapshot(row));
  const regionList = options.topRegions && options.topRegions.length
    ? `<div class="region-list compact">${options.topRegions.slice(0, 6).map(regionRowButton).join('')}</div>`
    : '';
  return `<div class="detail-block">
    <h3>证据</h3>
    ${facts.length ? `<div class="data-grid cols-3">${facts.join('')}</div>` : '<p>暂无可展示证据。</p>'}
    ${pressure.length ? `<div class="pressure-list"><b>关键判断：</b><ol>${pressure.map(item => `<li>${esc(item)}</li>`).join('')}</ol></div>` : ''}
    ${evidenceText ? `<p>${esc(formatPublicText(evidenceText))}</p>` : ''}
    ${regionList}
    ${row ? renderRecent5BottomBar(row) : ''}
  </div>`;
}

function renderProductionWeightSection(record, options = {}) {
  const isCountry = !!options.isCountry;
  const production = options.production ?? record.production_tonnes ?? record.total_production_tonnes;
  const cells = [
    isNum(production) ? detailCell(isCountry ? '产量权重口径' : '地区产量', fmtProduction(production)) : '',
    isCountry ? detailCell('全球产量占比', fmtPct(globalProductionShare(record), 1)) : '',
    !isCountry && isNum(record.national_share) ? detailCell('国内产量占比', fmtPct(record.national_share, 1)) : '',
    isNum(record.region_count) ? detailCell('覆盖地区数', `${Math.round(Number(record.region_count))}`) : '',
    detailCell('产量口径', formatPublicText(options.productionBasis || record.production_basis_cn || record.production_basis_note_cn || '当前口径未说明')),
    detailCell('数据置信度', formatConfidence(record.aggregation_confidence || record.confidence_summary || record.rule_confidence))
  ].filter(Boolean);
  return `<div class="detail-block">
    <h3>产量权重</h3>
    <div class="data-grid cols-3">${cells.join('')}</div>
  </div>`;
}

function renderFuture7dSection(record, options = {}) {
  const row = options.weatherRecord || record;
  const change = riskChangeInfo(record, options);
  const forecast7 = firstNumeric(row, ['forecast_7d_precip', 'forecast_rainfall_7d', 'forecast_7d', 'rain_forecast_7d']);
  const normal7 = firstNumeric(row, ['forecast_precip_7d_normal_mm']);
  const anomaly = isNum(forecast7) && isNum(normal7) ? Number(forecast7) - Number(normal7) : null;
  const cells = [
    detailHtmlCell('变化方向', riskChangeBadge(record, options)),
    detailCell('上期/当前', `${change.previousText} → ${change.currentText}`),
    isNum(forecast7) ? detailCell('未来7天降雨', fmtNum(forecast7, 0, ' mm')) : '',
    isNum(normal7) ? detailCell('常年同期', fmtNum(normal7, 0, ' mm')) : '',
    isNum(anomaly) ? detailCell('7天偏离', fmtSigned(anomaly, 0, ' mm')) : ''
  ].filter(Boolean);
  return `<div class="detail-block">
    <h3>未来7天变化</h3>
    ${cells.length ? `<div class="data-grid cols-3">${cells.join('')}</div>` : '<p>暂无预报信号。</p>'}
    ${row && row.forecast_summary_cn ? `<p>${esc(formatPublicText(row.forecast_summary_cn))}</p>` : ''}
  </div>`;
}

function renderTradeImplicationSection(record, options = {}) {
  return `<div class="detail-block">
    <h3>交易含义</h3>
    <p>${esc(tradeImplication(record, options))}。</p>
    <p style="color:var(--muted);">该表述仅用于预期扰动跟踪，不等同于产量损失确认。</p>
  </div>`;
}

function buildDetailPanel(record, options = {}) {
  const stageRecord = options.stageRecord
    ? { ...options.stageRecord, crop_group: options.stageRecord.crop_group || record.crop_group }
    : record;
  return `
    <div class="detail-header">
      <h2>${esc(buildDetailHeaderTitle(record, options))}</h2>
      <div class="subtitle">
        ${riskBadge(options.isCountry ? riskNumFromCountry(record) : record.risk_level_v3, formatRiskLabel(record))}
        <span class="pill oil-pill" style="--oil-color:${cropColor(record.crop_group)}">${esc(cropDisplayName(record))}</span>
      </div>
    </div>
    ${renderCurrentConclusionSection(record, options)}
    ${renderEvidenceSection(stageRecord || record, options)}
    ${renderProductionWeightSection(record, options)}
    ${renderFuture7dSection(record, options)}
    ${renderTradeImplicationSection(record, options)}
  `;
}

function renderCountryStatus(record, countryKey) {
  return '';
}

function showCountryDetail(record) {
  destroyCharts();
  state.selectedRegionRecord = null;
  const countryKey = record.country_key || canonicalCountry(record.country);
  const crop = state.selectedCountryCrop || record.crop_group;
  const regionRecords = countryKey === 'European Union' ? euDisplayRows() : getRegionRecords(countryKey, crop);
  const topRegions = regionRecords
    .filter(row => row.weather_region_id)
    .sort((a, b) => riskNum(b.risk_level_v3) - riskNum(a.risk_level_v3) || (Number(b.national_share) || 0) - (Number(a.national_share) || 0))
    .slice(0, 8);
  const conclusion = countryConclusion(record, topRegions);
  const representative = topRegions[0] || null;

  document.getElementById('detail-panel').innerHTML = buildDetailPanel(record, {
    isCountry: true,
    title: record.country_cn || getCountryName(countryKey),
    conclusion,
    countryName: record.country_cn || getCountryName(countryKey),
    production: record.total_production_tonnes,
    productionBasis: record.production_basis_cn,
    weatherRecord: representative,
    weatherTitle: representative ? `天气事实 · ${shortRegionName(representative)}` : '天气事实',
    stageRecord: representative || record,
    topRegions
  });
}

function renderRiskStack(records) {
  const totals = new Map([[4, 0], [3, 0], [2, 0], [1, 0], [0, 0]]);
  const total = records.reduce((sum, row) => sum + (Number(row.production_tonnes) || 0), 0);
  records.forEach(row => {
    const level = riskNum(row.risk_level_v3);
    totals.set(level, totals.get(level) + (Number(row.production_tonnes) || 0));
  });
  if (!total) return '';
  const segments = [4, 3, 2, 1, 0].map(level => {
    const share = totals.get(level) / total * 100;
    if (share <= 0) return '';
    return `<div class="risk-stack-seg" title="${RISK[level].cn} ${share.toFixed(1)}%" style="width:${share}%;background:${RISK[level].color}"></div>`;
  }).join('');
  const labels = [4, 3, 2, 1, 0].filter(level => totals.get(level) > 0).map(level => {
    const share = totals.get(level) / total * 100;
    return `<span><span class="legend-swatch" style="display:inline-block;width:8px;height:8px;background:${RISK[level].color};border-radius:2px;vertical-align:-1px;margin-right:3px;"></span>${RISK[level].cn} ${share.toFixed(0)}%</span>`;
  }).join('');
  return `<div class="risk-stack">${segments}</div><div class="risk-stack-labels">${labels}</div>`;
}

function regionRowButton(row) {
  return `
    <button type="button" class="region-row" data-region-id="${escAttr(row.weather_region_id)}">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
        <b style="font-size:12.5px;">${esc(shortRegionName(row))}</b>
        ${riskBadge(row.risk_level_v3, formatRiskLabel(row))}
      </div>
      <div class="subtitle">${esc(cropLabel(row))} ${esc(fmtPct(row.national_share))} ${riskChangeBadge(row)}</div>
    </button>
  `;
}

function shortRegionName(row) {
  const name = row.region_name_cn || row.region_name || row.boundary_id || row.country_cn || row.country;
  return String(name).split(' / ')[0].split(', ')[0];
}

function getRegionRecords(countryKey, crop) {
  let rows = store.adminRecords.filter(row => row.country_key === countryKey && (crop === 'all' || row.crop_group === crop));
  const admin1Rows = rows.filter(row => row.admin_level === 'admin1' || row.admin_level_for_map === 'admin1');
  if (admin1Rows.length) rows = admin1Rows;
  rows = rows.filter(row => matchesRiskFilter(row));
  return rows.sort((a, b) => (Number(b.national_share) || 0) - (Number(a.national_share) || 0));
}

async function renderRegionLayer() {
  Object.values(layers).forEach(layer => layer.clearLayers());
  destroyCharts();
  setLayerButtons();

  if (!state.selectedCountry) {
    renderCountryLayer();
    return;
  }

  if (state.selectedCountry === 'European Union') {
    renderEuRegionLayer();
    return;
  }

  const countryKey = state.selectedCountry;
  const crop = state.selectedCountryCrop || state.crop;
  const records = getRegionRecords(countryKey, crop);
  const coverage = getCoverage(countryKey);
  let fallbackCount = 0;
  let matchedCount = 0;
  let notice = '';

  if (coverage && coverage.has_admin1_boundary && coverage.admin1_boundary_file) {
    const geojson = await loadAdminGeo(coverage.admin1_boundary_file);
    if (geojson) {
      const recordByBoundary = new Map(records.map(row => [regionBoundaryKey(row), row]));
      const matchedIds = new Set();
      const regionGeo = L.geoJSON(geojson, {
        filter: feature => {
          const key = normalizeAdminShapeName(feature.properties && feature.properties.shapeName, countryKey);
          return recordByBoundary.has(key);
        },
        style: feature => {
          const key = normalizeAdminShapeName(feature.properties && feature.properties.shapeName, countryKey);
          const row = recordByBoundary.get(key);
          return {
            color: '#223043',
            weight: 1.12,
            opacity: 0.92,
            fillColor: riskColor(row.risk_level_v3),
            fillOpacity: 0.72
          };
        },
        onEachFeature: (feature, layer) => {
          const key = normalizeAdminShapeName(feature.properties && feature.properties.shapeName, countryKey);
          const row = recordByBoundary.get(key);
          if (!row) return;
          matchedIds.add(row.weather_region_id);
          matchedCount += 1;
          layer.bindTooltip(regionTooltip(row), { sticky: true });
          layer.on({
            click: () => showRegionDetail(row),
            mouseover: () => layer.setStyle({ weight: 2.35, fillOpacity: 0.82 }),
            mouseout: () => regionGeo.resetStyle(layer)
          });
        }
      }).addTo(layers.region);

      records.filter(row => !matchedIds.has(row.weather_region_id)).forEach(row => {
        if (renderRegionFallbackMarker(row)) fallbackCount += 1;
      });
      if (fallbackCount) notice = `${getCountryName(countryKey)} 有 ${fallbackCount} 个地区暂以代表点展示。`;
    }
  }

  if (!matchedCount) {
    records.forEach(row => {
      if (renderRegionFallbackMarker(row)) fallbackCount += 1;
    });
    notice = `${getCountryName(countryKey)} 地区层暂以代表点展示。`;
  }

  refreshRegionLabels(records);
  const bounds = boundsFor(['region', 'fallback']);
  if (bounds.isValid()) map.fitBounds(bounds.pad(0.16));
  else map.setView(countryCentroid(countryKey) || [16, 25], 5);

  mapStats = {
    main: records.length,
    risk: records.filter(row => riskNum(row.risk_level_v3) >= 3).length,
    fallback: fallbackCount,
    note: notice || `${getCountryName(countryKey)} 地区层使用区域边界展示。`
  };
  updateOverlay();
}

async function loadAdminGeo(file) {
  if (adminGeoCache[file]) return adminGeoCache[file];
  try {
    const geo = await loadJSON(file);
    adminGeoCache[file] = geo;
    return geo;
  } catch (err) {
    console.warn('admin1 boundary load failed', file, err);
    return null;
  }
}

function regionBoundaryKey(row) {
  const key = normalizeRegionRecordName(row.boundary_id || shortRegionName(row), row.country_key);
  if (row.country_key === 'United States') return String(key).toUpperCase();
  return key;
}

function normalizeRegionRecordName(name, countryKey) {
  let key = String(name || '').trim();
  if (countryKey === 'Russia') key = key.replace(/^Russia\s*-\s*/, '');
  if (countryKey === 'Philippines') key = key.replace(/^Philippines\s*-\s*/, '');
  const countryMap = ADMIN1_REGION_NAME_MAP[countryKey];
  return (countryMap && countryMap[key]) || key;
}

function normalizeAdminShapeName(name, countryKey) {
  if (!name) return '';
  if (ADMIN1_NAME_MAP[name]) return ADMIN1_NAME_MAP[name];
  if (countryKey === 'United States') return String(name).toUpperCase();
  return name;
}

function renderRegionFallbackMarker(row) {
  if (!isNum(row.lat) || !isNum(row.lon)) return false;
  const radius = Math.max(5, Math.min(15, 5 + Math.sqrt((Number(row.national_share) || 0) * 100) * 1.4));
  const marker = L.circleMarker([Number(row.lat), Number(row.lon)], {
    radius,
    color: '#ffffff',
    weight: 1.6,
    fillColor: riskColor(row.risk_level_v3),
    fillOpacity: 0.92
  }).addTo(layers.fallback);
  marker.bindTooltip(regionTooltip(row), { sticky: true });
  marker.on('click', () => showRegionDetail(row));
  return true;
}

function regionTooltip(row) {
  const reason = buildPressureItems(row)[0] || row.risk_reason_cn || riskTypeText(row.risk_type);
  const change = riskChangeInfo(row);
  const facts = [
    isNum(row.precip_30d_ratio_pct) ? `30天降雨 ${fmtPct(row.precip_30d_ratio_pct, 0, false)}常年` : '',
    isNum(soilRootPercentile(row)) ? `根区P${Math.round(soilRootPercentile(row))}` : '',
    isNum(row.forecast_7d_precip) ? `未来7天 ${fmtNum(row.forecast_7d_precip, 0, ' mm')}` : ''
  ].filter(Boolean).join('｜');
  return `
    <div style="min-width:220px;font-size:12px;line-height:1.45;">
      <b>${esc(shortRegionName(row))}</b> ${riskBadge(row.risk_level_v3, formatRiskLabel(row))} ${riskChangeBadge(row)}
      <div style="margin-top:4px;color:var(--muted);">${esc(cropLabel(row))} ${esc(fmtPct(row.national_share))}</div>
      <div style="color:var(--muted);">上期 ${esc(change.previousText)} → 当前 ${esc(change.currentText)}</div>
      ${facts ? `<div style="color:var(--muted);">${esc(facts)}</div>` : ''}
      <div style="margin-top:2px;">${esc(reason)}</div>
    </div>
  `;
}

function refreshRegionLabels(recordsArg) {
  layers.regionLabels.clearLayers();
  if (state.layer !== 'region') return;
  const records = recordsArg || currentRegionRecords();
  const zoom = map.getZoom();
  records.forEach(row => {
    if (!isNum(row.lat) || !isNum(row.lon)) return;
    if (!shouldShowRegionLabel(row, zoom)) return;
    L.tooltip({
      permanent: true,
      direction: 'top',
      offset: [0, -6],
      className: 'region-map-label',
      opacity: 1
    })
      .setLatLng([Number(row.lat), Number(row.lon)])
      .setContent(regionLabelHtml(row))
      .addTo(layers.regionLabels);
  });
}

function currentRegionRecords() {
  if (!state.selectedCountry) return [];
  if (state.selectedCountry === 'European Union') return euDisplayRows();
  return getRegionRecords(state.selectedCountry, state.selectedCountryCrop || state.crop);
}

function shouldShowRegionLabel(row, zoom) {
  const share = Number(row.national_share ?? row.eu_share ?? 0);
  if (zoom >= 7) return true;
  if (zoom >= 6) return share >= 0.03;
  if (zoom >= 5) return share >= 0.08;
  if (zoom >= 4) return share >= 0.15;
  return share >= 0.25;
}

function regionLabelHtml(row) {
  return buildMapLabel(row, map ? map.getZoom() : 6, 'region');
}

function weatherMetricMeta() {
  return WEATHER_METRICS[state.weatherMetric] || WEATHER_METRICS.rain;
}

function weatherMetricValue(row, metric = state.weatherMetric) {
  if (metric === 'rain' || metric === 'recent30') {
    const ratio = firstNumeric(row, ['precip_30d_ratio_pct', 'rain_30d_ratio_pct']);
    return {
      value: ratio,
      label: isNum(ratio) ? `近30天降雨 ${fmtPct(ratio, 0, false)} 常年` : '降雨待接入'
    };
  }
  if (metric === 'temp') {
    const anomaly = firstNumeric(row, ['temp_max_anomaly_c', 'tmax_anomaly_c']);
    return {
      value: anomaly,
      label: isNum(anomaly) ? `最高温距平 ${fmtSigned(anomaly, 1, '℃')}` : '温度待接入'
    };
  }
  if (metric === 'forecast') {
    const rain = firstNumeric(row, ['forecast_7d_precip', 'forecast_rainfall_7d', 'forecast_7d', 'rain_forecast_7d']);
    const normal7 = firstNumeric(row, ['forecast_precip_7d_normal_mm']);
    if (isNum(rain) && normal7 > 0.5) {
      const anomaly = ((Number(rain) - normal7) / normal7) * 100;
      return {
        value: anomaly,
        label: `7天预报 ${anomaly >= 0 ? '+' : ''}${Math.round(anomaly)}%（${fmtNum(rain, 0, 'mm')} / 常年${fmtNum(normal7, 0, 'mm')}）`
      };
    }
    return {
      value: isNum(rain) ? Number(rain) : null,
      label: isNum(rain) ? `未来7天降雨 ${fmtNum(rain, 0, 'mm')}（无常年基准）` : '7天降雨待接入'
    };
  }
  if (metric === 'forecast14') {
    const rain = firstNumeric(row, ['forecast_8_14d_precip', 'forecast_16d_precip', 'forecast_16d', 'rain_forecast_16d']);
    const normal14 = firstNumeric(row, ['forecast_precip_8_14d_normal_mm']);
    if (isNum(rain) && normal14 > 0.5) {
      const anomaly = ((Number(rain) - normal14) / normal14) * 100;
      return {
        value: anomaly,
        label: `14天预报 ${anomaly >= 0 ? '+' : ''}${Math.round(anomaly)}%（${fmtNum(rain, 0, 'mm')} / 常年${fmtNum(normal14, 0, 'mm')}）`
      };
    }
    return {
      value: isNum(rain) ? Number(rain) : null,
      label: isNum(rain) ? `未来16天降雨 ${fmtNum(rain, 0, 'mm')}（无常年基准）` : '14天降雨待接入'
    };
  }
  if (metric === 'et0') {
    const pct = firstNumeric(row, ['et0_percentile_30d', 'et0_percentile_14d']);
    const val = firstNumeric(row, ['et0_30d_avg_mm', 'et0_7d_avg_mm']);
    return {
      value: pct,
      label: isNum(pct) ? `ET0 P${Math.round(Number(pct))}${isNum(val) ? ' (' + fmtNum(val, 1, 'mm/d') + ')' : ''}` : '蒸散待接入'
    };
  }
  if (metric === 'vpd') {
    const pct = firstNumeric(row, ['vpd_percentile_30d', 'vpd_percentile_14d']);
    const val = firstNumeric(row, ['vpd_30d_avg_kpa', 'vpd_14d_avg_kpa', 'vpd_7d_avg_kpa', 'vpd_30d_mean', 'vpd_14d_mean', 'vpd_7d_mean']);
    return {
      value: pct,
      label: isNum(pct) ? `VPD P${Math.round(Number(pct))}${isNum(val) ? ' (' + fmtNum(val, 1, 'kPa') + ')' : ''}` : 'VPD待接入'
    };
  }
  const root = soilRootPercentile(row);
  const surface = soilSurfacePercentile(row);
  const parts = [];
  if (isNum(root)) parts.push(`根区P${Math.round(Number(root))}`);
  if (isNum(surface)) parts.push(`表层P${Math.round(Number(surface))}`);
  return {
    value: root,
    label: parts.length ? parts.join(' / ') : '墒情仅实际值'
  };
}

function clamp01(value) {
  if (!isNum(value)) return 0;
  return Math.max(0, Math.min(1, Number(value)));
}

function hexToRgb(hex) {
  const clean = String(hex || '').replace('#', '');
  if (clean.length !== 6) return { r: 148, g: 163, b: 184 };
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16)
  };
}

function rgbToHex({ r, g, b }) {
  return '#' + [r, g, b]
    .map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'))
    .join('');
}

function mixHex(from, to, t) {
  const a = hexToRgb(from);
  const b = hexToRgb(to);
  const x = clamp01(t);
  return rgbToHex({
    r: a.r + (b.r - a.r) * x,
    g: a.g + (b.g - a.g) * x,
    b: a.b + (b.b - a.b) * x
  });
}

function interpolateColorStops(stops, t) {
  const x = clamp01(t);
  const palette = Array.isArray(stops) && stops.length ? stops : WEATHER_COLOR_STOPS;
  if (x <= palette[0].pos) return palette[0].color;
  for (let i = 1; i < palette.length; i += 1) {
    const prev = palette[i - 1];
    const next = palette[i];
    if (x <= next.pos) {
      const span = Math.max(0.0001, next.pos - prev.pos);
      return mixHex(prev.color, next.color, (x - prev.pos) / span);
    }
  }
  return palette[palette.length - 1].color;
}

function weatherColorStops(metric = state.weatherMetric) {
  const meta = WEATHER_METRICS[metric] || WEATHER_METRICS.rain;
  const stops = meta.gradient && meta.gradient.reverse
    ? [...WEATHER_COLOR_STOPS].reverse().map((item, index, arr) => ({
      pos: index / Math.max(1, arr.length - 1),
      color: item.color
    }))
    : WEATHER_COLOR_STOPS;
  return stops;
}

function weatherGradientCss(metric = state.weatherMetric) {
  return weatherColorStops(metric)
    .map(item => `${item.color} ${(item.pos * 100).toFixed(0)}%`)
    .join(', ');
}

function weatherMetricPosition(row, metric = state.weatherMetric) {
  const value = weatherMetricValue(row, metric).value;
  if (!isNum(value)) return null;
  const n = Number(value);
  const cfg = store.weatherConfig && store.weatherConfig.metrics && store.weatherConfig.metrics[metric];
  if (cfg && cfg.position && cfg.position.method === 'linear') {
    return clamp01((n - cfg.position.min) / (cfg.position.max - cfg.position.min));
  }
  if (metric === 'rain' || metric === 'recent30') return clamp01((n - 40) / 160);
  if (metric === 'temp') return clamp01((n + 5) / 10);
  if (metric === 'forecast' || metric === 'forecast14') return clamp01((n + 100) / 200);
  if (metric === 'et0' || metric === 'vpd') return clamp01(n / 100);
  return clamp01(n / 100);
}

function weatherMetricColor(row, metric = state.weatherMetric) {
  const value = weatherMetricValue(row, metric).value;
  if (!isNum(value)) return WEATHER_PALETTE.noData;
  return interpolateColorStops(weatherColorStops(metric), weatherMetricPosition(row, metric));
}

function weatherMetricCategoryLabel(row, metric = state.weatherMetric) {
  const value = weatherMetricValue(row, metric).value;
  if (!isNum(value)) return '待接入';
  const n = Number(value);
  const cfg = store.weatherConfig && store.weatherConfig.metrics && store.weatherConfig.metrics[metric];
  if (cfg && cfg.categories) {
    for (const cat of cfg.categories) {
      if (cat.max === null || n < cat.max) return cat.label;
    }
    return cfg.categories[cfg.categories.length - 1].label;
  }
  if (metric === 'rain' || metric === 'recent30') {
    if (n < 50) return '严重缺雨';
    if (n < 75) return '偏干';
    if (n <= 125) return '接近常年';
    if (n <= 175) return '偏湿';
    return '过湿/作业扰动';
  }
  if (metric === 'temp') {
    if (n <= -4) return '明显偏冷';
    if (n <= -1.5) return '偏冷';
    if (n < 1.5) return '接近常年';
    if (n < 4) return '偏热';
    return '高温干化';
  }
  if (metric === 'forecast' || metric === 'forecast14') {
    if (n < -60) return '严重缺雨';
    if (n < -30) return '偏干';
    if (n <= 30) return '接近常年';
    if (n <= 80) return '偏湿';
    return '过湿/作业扰动';
  }
  if (metric === 'et0' || metric === 'vpd') {
    if (n < 20) return metric === 'et0' ? '蒸散偏低' : '大气湿润';
    if (n < 40) return metric === 'et0' ? '蒸散正常偏低' : '正常偏湿';
    if (n < 60) return '正常';
    if (n < 80) return metric === 'et0' ? '蒸散偏高' : '偏干';
    return metric === 'et0' ? '蒸散显著偏高' : '显著干燥';
  }
  if (n < 5) return '极端偏干';
  if (n < 10) return '严重偏干';
  if (n < 20) return '明显偏干';
  if (n < 30) return '略偏干';
  if (n <= 70) return '正常';
  if (n <= 80) return '略偏湿';
  if (n <= 90) return '明显偏湿';
  if (n <= 95) return '严重偏湿';
  return '极端偏湿';
}

function productionWeatherRowKey(row) {
  return [
    row.country_key || canonicalCountry(row.country),
    row.boundary_id || shortRegionName(row),
    isNum(row.lat) ? Number(row.lat).toFixed(3) : '',
    isNum(row.lon) ? Number(row.lon).toFixed(3) : ''
  ].join('::');
}

function dedupeProductionWeatherRows(rows) {
  if (state.crop !== 'all') return rows;
  const byRegion = new Map();
  rows.forEach(row => {
    const key = productionWeatherRowKey(row);
    const current = byRegion.get(key);
    if (!current || (Number(row.production_tonnes) || 0) > (Number(current.production_tonnes) || 0)) {
      byRegion.set(key, row);
    }
  });
  return [...byRegion.values()];
}

function preferDetailedProductionWeatherRows(rows) {
  const groups = new Map();
  rows.forEach(row => {
    const country = row.country_key || canonicalCountry(row.country);
    const crop = row.crop_group || 'all';
    const key = `${country}::${crop}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  });
  return [...groups.values()].flatMap(groupRows => {
    const admin1Rows = groupRows.filter(row => row.admin_level === 'admin1' || row.admin_level_for_map === 'admin1');
    return admin1Rows.length ? admin1Rows : groupRows;
  });
}

function productionWeatherCandidates() {
  let rows = [];
  if (state.country === 'European Union') {
    rows = euWeatherRows(state.crop);
  } else {
    const euRows = state.country === 'all' ? euWeatherRows(state.crop) : [];
    const euKeys = new Set(euRows.map(row => `${row.country_key}::${row.crop_group}`));
    rows = store.adminRecords.filter(row => {
      if (!row || !isNum(row.lat) || !isNum(row.lon)) return false;
      if (state.crop !== 'all' && row.crop_group !== state.crop) return false;
      if (state.country !== 'all' && row.country_key !== state.country) return false;
      if (state.country === 'all' && euKeys.has(`${row.country_key}::${row.crop_group}`)) return false;
      return true;
    });
    if (euRows.length) rows = rows.concat(euRows);
  }

  rows = preferDetailedProductionWeatherRows(rows);
  return dedupeProductionWeatherRows(rows)
    .filter(row => isNum(row.lat) && isNum(row.lon))
    .sort((a, b) => {
      const shareDiff = (Number(productionShareValue(b)) || 0) - (Number(productionShareValue(a)) || 0);
      if (shareDiff) return shareDiff;
      return (Number(b.production_tonnes) || 0) - (Number(a.production_tonnes) || 0);
    });
}

function productionWeatherRows() {
  return productionWeatherCandidates();
}

function productionShareValue(row) {
  if (row && row.production_weather_context === 'eu') return row.eu_share ?? row.national_share;
  return row ? (row.national_share ?? row.eu_share) : null;
}

function productionMarkerRadius(row) {
  const share = Number(productionShareValue(row) ?? 0);
  if (share > 0) return Math.max(5, Math.min(18, 5 + Math.sqrt(share * 100) * 1.45));
  const production = Number(row.production_tonnes) || 0;
  return Math.max(5, Math.min(14, 4 + Math.log10(production + 1)));
}

function productionWeatherValue(row) {
  if (state.mapValue === 'share') return fmtPct(productionShareValue(row), 1);
  return fmtProduction(row.production_tonnes);
}

function globalProductionShare(row) {
  if (!row) return null;
  const direct = firstNumeric(row, ['global_share', 'production_share_global']);
  if (isNum(direct)) return direct;
  const crop = row.crop_group;
  const rows = summaryEligibleRecords(store.countryRecords).filter(item => !crop || item.crop_group === crop);
  const total = rows.reduce((sum, item) => sum + (Number(item.total_production_tonnes) || 0), 0);
  const value = Number(row.total_production_tonnes ?? row.production_tonnes ?? 0);
  return total > 0 && value > 0 ? value / total : null;
}

function productionWeatherLabelHtml(row) {
  const value = productionWeatherValue(row);
  const tag = productionWeatherMiniTag(row);
  return `
    <div class="production-label">
      <span class="value">${esc(value)}</span>
      ${tag ? `<span class="weather-mini-tag">${esc(tag)}</span>` : ''}
    </div>
  `;
}

function countryProductionLabelHtml(model) {
  return buildMapLabel(model.top, map ? map.getZoom() : 4, 'country');
}

function productionWeatherTooltip(row) {
  const metric = weatherMetricValue(row);
  const category = weatherMetricCategoryLabel(row);
  const country = row.country_cn || row.country || getCountryName(row.country_key);
  const share = fmtPct(productionShareValue(row), 1);
  const production = fmtProduction(row.production_tonnes);
  const weatherSummary = row.weather_condition_summary_cn || '';
  const soilSummary = row.soil_condition_summary_cn || row.soil_status_cn || '';
  const tags = renderWeatherTagStrip(row);
  return `
    <div style="min-width:230px;font-size:12px;line-height:1.45;">
      <b>${esc(country)}｜${esc(shortRegionName(row))}</b>
      <div style="margin-top:4px;color:var(--muted);">品种：${esc(cropLabel(row))}</div>
      <div>产量：${esc(production)}｜产量占比：${esc(share)}</div>
      <div>${esc(weatherMetricMeta().title)}：<b>${esc(category)}</b>（${esc(metric.label)}）</div>
      ${tags}
      ${weatherSummary ? `<div style="margin-top:3px;color:var(--muted);">${esc(weatherSummary)}</div>` : ''}
      ${soilSummary && state.weatherMetric !== 'soil' ? `<div style="color:var(--muted);">${esc(soilSummary)}</div>` : ''}
    </div>
  `;
}

function shouldShowProductionWeatherLabel(row, zoom) {
  const share = Number(productionShareValue(row) ?? 0);
  const production = Number(row.production_tonnes) || 0;
  if (zoom <= 2) return share >= 0.12 || production >= 10000000;
  if (zoom <= 3) return share >= 0.06 || production >= 3000000;
  if (zoom <= 4) return share >= 0.02 || production >= 800000;
  if (zoom <= 5) return share >= 0.006 || production >= 150000;
  return share >= 0.001 || production >= 50000;
}

function refreshProductionWeatherLabels(rowsArg) {
  layers.regionLabels.clearLayers();
  if (state.viewMode !== 'weather') return;
  const rows = rowsArg || currentProductionWeatherRows || [];
  const zoom = map.getZoom();
  const countryLabelLimit = state.country === 'all'
    ? (zoom <= 2 ? 2 : (zoom <= 3 ? 3 : (zoom <= 4 ? 6 : (zoom <= 5 ? 10 : Infinity))))
    : Infinity;
  const labelsByCountry = new Map();
  [...rows]
    .sort((a, b) => (Number(b.production_tonnes) || 0) - (Number(a.production_tonnes) || 0))
    .forEach(row => {
    if (!isNum(row.lat) || !isNum(row.lon)) return;
    if (!shouldShowProductionWeatherLabel(row, zoom)) return;
    const countryKey = row.country_key || canonicalCountry(row.country);
    const shown = labelsByCountry.get(countryKey) || 0;
    if (shown >= countryLabelLimit) return;
    labelsByCountry.set(countryKey, shown + 1);
    L.tooltip({
      permanent: true,
      direction: 'top',
      offset: [0, -7],
      className: 'production-map-label',
      opacity: 1
    })
      .setLatLng([Number(row.lat), Number(row.lon)])
      .setContent(productionWeatherLabelHtml(row))
      .addTo(layers.regionLabels);
  });
}

function renderProductionWeatherFallbackMarker(row) {
  if (!isNum(row.lat) || !isNum(row.lon)) return false;
  const color = weatherMetricColor(row);
  const marker = L.circleMarker([Number(row.lat), Number(row.lon)], {
    radius: productionMarkerRadius(row),
    color: '#ffffff',
    weight: 1.6,
    fillColor: color,
    fillOpacity: 0.9
  }).addTo(layers.fallback);
  marker.bindTooltip(productionWeatherTooltip(row), { sticky: true, direction: 'auto' });
  return true;
}

function renderProductionCountryBoundary(countryKey, rows) {
  if (!store.geojson || !Array.isArray(store.geojson.features) || !rows.length) return false;
  const topRow = [...rows].sort((a, b) => (Number(b.production_tonnes) || 0) - (Number(a.production_tonnes) || 0))[0];
  let rendered = false;
  const countryGeo = L.geoJSON(store.geojson, {
    filter: feature => getFeatureCountry(feature) === countryKey,
    style: {
      color: '#223043',
      weight: 1.15,
      opacity: 0.9,
      fillColor: weatherMetricColor(topRow),
      fillOpacity: 0.68
    },
    onEachFeature: (feature, layer) => {
      rendered = true;
      layer.bindTooltip(productionWeatherTooltip(topRow), { sticky: true, direction: 'auto' });
      layer.on({
        mouseover: () => layer.setStyle({ weight: 2.25, fillOpacity: 0.8 }),
        mouseout: () => countryGeo.resetStyle(layer)
      });
    }
  }).addTo(layers.region);
  if (!rendered) {
    layers.region.removeLayer(countryGeo);
    return false;
  }
  return true;
}

async function renderProductionWeatherCountryGroup(countryKey, rows) {
  const coverage = getCoverage(countryKey);
  let matchedCount = 0;
  let fallbackCount = 0;

  if (coverage && coverage.has_admin1_boundary && coverage.admin1_boundary_file) {
    const geojson = await loadAdminGeo(coverage.admin1_boundary_file);
    if (geojson) {
      const recordByBoundary = new Map(rows.map(row => [regionBoundaryKey(row), row]));
      const matchedIds = new Set();
      const regionGeo = L.geoJSON(geojson, {
        filter: feature => {
          const key = normalizeAdminShapeName(feature.properties && feature.properties.shapeName, countryKey);
          return recordByBoundary.has(key);
        },
        style: feature => {
          const key = normalizeAdminShapeName(feature.properties && feature.properties.shapeName, countryKey);
          const row = recordByBoundary.get(key);
          return {
            color: '#223043',
            weight: 1.05,
            opacity: 0.9,
            fillColor: weatherMetricColor(row),
            fillOpacity: 0.72
          };
        },
        onEachFeature: (feature, layer) => {
          const key = normalizeAdminShapeName(feature.properties && feature.properties.shapeName, countryKey);
          const row = recordByBoundary.get(key);
          if (!row) return;
          matchedIds.add(row.weather_region_id);
          matchedCount += 1;
          layer.bindTooltip(productionWeatherTooltip(row), { sticky: true, direction: 'auto' });
          layer.on({
            mouseover: () => layer.setStyle({ weight: 2.05, fillOpacity: 0.82 }),
            mouseout: () => regionGeo.resetStyle(layer)
          });
        }
      }).addTo(layers.region);

      rows.filter(row => !matchedIds.has(row.weather_region_id)).forEach(row => {
        if (renderProductionWeatherFallbackMarker(row)) fallbackCount += 1;
      });
      return { matchedCount, fallbackCount, hasBoundary: matchedCount > 0 };
    }
  }

  if (renderProductionCountryBoundary(countryKey, rows)) {
    return { matchedCount: rows.length, fallbackCount: 0, hasBoundary: true, hasCountryBoundary: true };
  }

  rows.forEach(row => {
    if (renderProductionWeatherFallbackMarker(row)) fallbackCount += 1;
  });
  return { matchedCount, fallbackCount, hasBoundary: false };
}

function groupProductionWeatherRowsByCountry(rows) {
  const groups = new Map();
  rows.forEach(row => {
    const key = row.country_key || canonicalCountry(row.country);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  });
  return groups;
}

function weatherCountryTitle(countryKey = state.country) {
  return countryKey === 'all' ? '全部国家' : getCountryName(countryKey);
}

function productionCountryTotals(rows) {
  const totals = new Map();
  rows.forEach(row => {
    const key = row.country_key || canonicalCountry(row.country);
    totals.set(key, (totals.get(key) || 0) + (Number(row.production_tonnes) || 0));
  });
  return totals;
}

function shouldShowProductionCountryLabel(countryKey, totals, zoom) {
  if (state.country !== 'all') return true;
  const total = totals.get(countryKey) || 0;
  if (zoom <= 2) return total >= 15000000;
  if (zoom <= 3) return total >= 5000000;
  return total >= 1000000;
}

function renderProductionCountryOutlines(rows) {
  if (!store.geojson || !Array.isArray(store.geojson.features)) return;
  const countryKeys = new Set(rows.map(row => row.country_key || canonicalCountry(row.country)));
  if (!countryKeys.size) return;
  const totals = productionCountryTotals(rows);
  const labelCenters = [];

  L.geoJSON(store.geojson, {
    interactive: false,
    filter: feature => countryKeys.has(getFeatureCountry(feature)),
    style: {
      color: '#0f172a',
      weight: state.country === 'all' ? 2.15 : 2.45,
      opacity: state.country === 'all' ? 0.88 : 0.94,
      fillOpacity: 0
    },
    onEachFeature: (feature, layer) => {
      const key = getFeatureCountry(feature);
      labelCenters.push({ key, center: layer.getBounds().getCenter() });
    }
  }).addTo(layers.country);

  const zoom = map ? map.getZoom() : 3;
  labelCenters.forEach(item => {
    if (!shouldShowProductionCountryLabel(item.key, totals, zoom)) return;
    L.tooltip({
      permanent: true,
      direction: 'center',
      className: 'production-country-label',
      opacity: 1
    })
      .setLatLng(item.center)
      .setContent(`<span class="country-map-text">${esc(getCountryName(item.key))}</span>`)
      .addTo(layers.countryLabels);
  });

  const euRows = rows.filter(row => row.production_weather_context === 'eu' && isNum(row.lat) && isNum(row.lon));
  if (state.country === 'all' && euRows.length) {
    const total = euRows.reduce((sum, row) => sum + (Number(row.production_tonnes) || 0), 0);
    const weightSum = total || euRows.length;
    const lat = euRows.reduce((sum, row) => sum + Number(row.lat) * (total ? (Number(row.production_tonnes) || 0) : 1), 0) / weightSum;
    const lon = euRows.reduce((sum, row) => sum + Number(row.lon) * (total ? (Number(row.production_tonnes) || 0) : 1), 0) / weightSum;
    L.tooltip({
      permanent: true,
      direction: 'center',
      className: 'production-country-label eu-country-label',
      opacity: 1
    })
      .setLatLng([lat, lon])
      .setContent('<span class="country-map-text eu-map-text">欧盟</span>')
      .addTo(layers.countryLabels);
  }
}

async function renderProductionWeatherLayer() {
  state.layer = 'weather';
  clearMap();
  setLayerButtons();
  updateModeChrome();
  ensureWeatherCountry();

  const candidates = productionWeatherCandidates();
  const rows = productionWeatherRows();
  currentProductionWeatherRows = rows;
  const countryKey = state.country;
  let fallbackCount = 0;
  let boundaryCountryCount = 0;
  let fallbackCountryCount = 0;

  const groups = groupProductionWeatherRowsByCountry(rows);
  for (const [groupCountryKey, groupRows] of groups.entries()) {
    const result = await renderProductionWeatherCountryGroup(groupCountryKey, groupRows);
    fallbackCount += result.fallbackCount;
    if (result.hasBoundary) boundaryCountryCount += 1;
    else fallbackCountryCount += 1;
  }

  const bounds = boundsFor(['region', 'fallback', 'regionLabels']);
  if (bounds.isValid()) map.fitBounds(bounds.pad(0.18));
  else map.setView([16, 25], 3);
  renderProductionCountryOutlines(rows);
  refreshProductionWeatherLabels(rows);

  const hiddenCount = Math.max(0, candidates.length - rows.length);
  const majorCount = rows.filter(row => Number(row.national_share ?? row.eu_share ?? 0) >= 0.1).length;
  const cropText = state.crop === 'all' ? '全部油种' : (CROP_META[state.crop] ? CROP_META[state.crop].tab : state.crop);
  const countryText = weatherCountryTitle(countryKey);
  const fallbackNote = fallbackCountryCount
    ? ` ${fallbackCountryCount} 个国家/市场暂以代表点展示；${boundaryCountryCount} 个国家使用地区边界。`
    : (fallbackCount ? ` ${fallbackCount} 个地区暂以代表点补充。` : '');
  mapStats = {
    main: rows.length,
    risk: majorCount,
    fallback: hiddenCount,
    note: `${countryText}｜${cropText}｜${weatherMetricMeta().title}。地区按指标着色；地图标签仅显示${state.mapValue === 'share' ? '产量占比' : '产量'}。${fallbackNote}`
  };
  updateOverlay();
}

function euDisplayRows() {
  const crop = state.selectedCountryCrop || state.crop;
  const rows = store.euRecords.filter(row => crop === 'all' || row.crop_group === crop);
  return rows.map(row => {
    const admin = findEuAdminRecord(row);
    return {
      ...row,
      weather_region_id: admin ? admin.weather_region_id : `eu::${row.region}::${row.crop_group}`,
      country_key: row.region,
      country_cn: row.region_cn,
      region_name: row.region,
      region_name_cn: row.region_cn,
      national_share: row.eu_share,
      lat: admin ? admin.lat : null,
      lon: admin ? admin.lon : null,
      risk_type: admin ? admin.risk_type : row.risk_level_v3_code,
      risk_reason_cn: admin ? admin.risk_reason_cn : row.risk_level_v3_cn
    };
  });
}

function renderEuRegionLayer() {
  const rows = euDisplayRows();
  const byCountry = new Map();
  rows.forEach(row => {
    const key = canonicalCountry(row.region);
    if (!byCountry.has(key)) byCountry.set(key, []);
    byCountry.get(key).push(row);
  });
  let polygonCount = 0;
  let fallbackCount = 0;

  if (store.geojson) {
    L.geoJSON(store.geojson, {
      filter: feature => byCountry.has(getFeatureCountry(feature)),
      style: feature => {
        const rowsForCountry = byCountry.get(getFeatureCountry(feature));
        const top = chooseEuRow(rowsForCountry);
        return {
          color: '#4b5563',
          weight: 1,
          opacity: 0.82,
          fillColor: riskColor(top.risk_level_v3),
          fillOpacity: 0.58
        };
      },
      onEachFeature: (feature, layer) => {
        const rowsForCountry = byCountry.get(getFeatureCountry(feature));
        const top = chooseEuRow(rowsForCountry);
        polygonCount += 1;
        layer.bindTooltip(regionTooltip(top), { sticky: true });
        layer.on('click', () => showEuRegionDetail(top));
      }
    }).addTo(layers.region);
  }

  rows.forEach(row => {
    if (hasRenderedEuPolygon(row.region)) return;
    const admin = findEuAdminRecord(row);
    if (admin && renderRegionFallbackMarker({ ...admin, national_share: row.eu_share })) fallbackCount += 1;
  });

  refreshRegionLabels(rows);
  const bounds = boundsFor(['region', 'fallback']);
  if (bounds.isValid()) map.fitBounds(bounds.pad(0.16));
  else map.setView([50.3, 10.5], 4);

  mapStats = {
    main: rows.length,
    risk: rows.filter(row => riskNum(row.risk_level_v3) >= 3).length,
    fallback: fallbackCount + 1,
    note: '欧盟按成员国汇总；地区层展示成员国边界。'
  };
  updateOverlay();
}

function chooseEuRow(rows) {
  return [...rows].sort((a, b) => riskNum(b.risk_level_v3) - riskNum(a.risk_level_v3) || (Number(b.production_tonnes) || 0) - (Number(a.production_tonnes) || 0))[0];
}

function hasRenderedEuPolygon(region) {
  const key = canonicalCountry(region);
  let rendered = false;
  layers.region.eachLayer(layer => {
    if (layer.eachLayer) {
      layer.eachLayer(child => {
        const feature = child.feature;
        if (feature && getFeatureCountry(feature) === key) rendered = true;
      });
    }
  });
  return rendered;
}

function findEuAdminRecord(euRow) {
  return store.adminRecords.find(row => canonicalCountry(row.country) === canonicalCountry(euRow.region) && row.crop_group === euRow.crop_group) || null;
}

function showEuRegionDetail(euRow) {
  const admin = findEuAdminRecord(euRow);
  if (admin) {
    showRegionDetail(admin);
    return;
  }
  destroyCharts();
  document.getElementById('detail-panel').innerHTML = `
    <div class="detail-header">
      <h2>${esc(euRow.region_cn || euRow.region)}</h2>
      <div class="subtitle">
        ${riskBadge(euRow.risk_level_v3, euRow.risk_level_v3_cn)}
        <span class="pill oil-pill" style="--oil-color:${cropColor(euRow.crop_group)}">${esc(cropLabel(euRow))}</span>
        <span class="pill">欧盟成员国</span>
      </div>
    </div>
    <div class="detail-block">
      <h3>核心结论</h3>
      <div class="data-grid">
        <div class="data-cell"><span class="lbl">产量</span><span class="val">${esc(fmtProduction(euRow.production_tonnes))}</span></div>
        <div class="data-cell"><span class="lbl">欧盟占比</span><span class="val">${esc(fmtPct(euRow.eu_share))}</span></div>
      </div>
      <p style="margin-top:8px;color:var(--muted);font-size:11.5px;">该成员国暂无完整地区序列，当前显示欧盟聚合记录。</p>
    </div>
  `;
}

const CROP_PROGRESS_METRIC_CN = {
  planted: '播种进度', emerged: '出苗进度', blooming: '开花进度',
  flowering: '开花进度', setting_pods: '结荚进度', pod_filling: '灌浆进度',
  mature: '成熟进度', harvested: '收割进度',
  condition_good_excellent: '良好-优秀', condition_poor_very_poor: '差-极差',
};

const DELAY_LEVEL_CN = {
  very_late: '明显偏慢', late: '偏慢', normal: '正常',
  fast: '偏快', very_fast: '明显偏快', unknown: '待确认',
};

const DELAY_LEVEL_COLOR = {
  very_late: '#c0392b', late: '#e67e22', normal: '#27ae60',
  fast: '#2563eb', very_fast: '#7c3aed', unknown: '#94a3b8',
};

function findCropProgress(row) {
  if (!store.cropProgressIndex) return [];
  const country = (row.country || '').toLowerCase();
  const crop = row.crop_group || '';
  // Extract admin1 from region_name
  let rn = row.region_name || '';
  if (rn.includes(',')) rn = rn.split(',')[0].trim();
  if (rn.includes(' / ')) rn = rn.rsplit ? rn.split(' / ')[0].trim() : rn.split(' / ').slice(0, -1).join(' / ').trim();
  if (rn.includes(' - ')) rn = rn.split(' - ').slice(1).join(' - ').trim();
  const key = country + '::' + crop + '::' + rn.toLowerCase();
  const exact = store.cropProgressIndex.get(key);
  if (exact && exact.length) return exact;
  // Fallback: try without admin1 suffix stripping
  for (const [k, v] of store.cropProgressIndex) {
    if (k.startsWith(country + '::' + crop + '::') && rn.toLowerCase().includes(k.split('::')[2])) return v;
  }
  return [];
}

function renderCropProgressBlock(row) {
  return '';
}

function renderSoilTemperatureBlock(row) {
  const temp = getValidSoilTemp(row);
  const st = temp.record;
  if (!st || !temp.hasValid) return '';
  const cells = [
    temp.values.t0 !== null ? detailCell('0-7cm土温', temp.values.t0.toFixed(1) + '°C') : '',
    temp.values.t28 !== null ? detailCell('7-28cm土温', temp.values.t28.toFixed(1) + '°C') : '',
    isNum(st.soil_temp_0_7cm_anomaly_c) ? detailCell('土温距平', (Number(st.soil_temp_0_7cm_anomaly_c) >= 0 ? '+' : '') + Number(st.soil_temp_0_7cm_anomaly_c).toFixed(1) + '°C') : '',
    isNum(st.hot_soil_days_7d) ? detailCell('偏热天数', `${Math.round(Number(st.hot_soil_days_7d))}天`) : '',
    isNum(st.cold_soil_days_7d) ? detailCell('偏冷天数', `${Math.round(Number(st.cold_soil_days_7d))}天`) : '',
    temp.text ? detailCell('土温信号', temp.text) : ''
  ].filter(Boolean);
  if (!cells.length) return '';
  const signalColor = (() => {
    const s = st.soil_temp_signal || '';
    if (s.includes('extreme_cold')) return '#1e40af';
    if (s.includes('cold'))        return '#2563eb';
    if (s.includes('hot'))         return '#c0392b';
    if (s.includes('warm'))        return '#e67e22';
    return '#374151';
  })();

  return `<div class="detail-block">
    <h3>土壤温度</h3>
    <div class="data-grid cols-3" style="--soil-temp-color:${signalColor}">${cells.join('')}</div>
  </div>`;
}

function renderRiskTagsBlock(row) {
  const tags = sortedRiskTags(row, () => true).slice(0, 6);
  if (!tags.length) return '';
  const cards = tags.map(tag => {
    const supportive = isSupportiveTag(tag);
    const color = supportive ? '#27ae60' : riskColor(tagRiskNum(tag));
    const label = tag.risk_label_cn || tag.label_cn || '风险标签';
    const flags = [
      supportive ? '支持性' : '不利',
      tag.impact_type || '',
      tag.growth_stage_cn || tag.growth_stage_code || '',
      tag.confidence ? `置信度${formatConfidence(tag.confidence)}` : ''
    ].filter(Boolean);
    const evidence = tag.impact_text_cn || tag.evidence_cn || tag.risk_reason_cn || '';
    return `<div class="risk-tag-card" style="--tag-color:${color}">
      <div class="risk-tag-head"><b>${esc(label)}</b>${riskBadge(tagRiskNum(tag), supportive ? '支持性' : riskText(tagRiskNum(tag)))}</div>
      ${evidence ? `<div class="risk-tag-evidence">${esc(evidence)}</div>` : ''}
      ${flags.length ? `<div class="risk-tag-flags">${flags.map(flag => `<span>${esc(flag)}</span>`).join('')}</div>` : ''}
    </div>`;
  }).join('');
  return `<div class="detail-block"><h3>风险触发标签</h3>${cards}</div>`;
}

function regionConclusion(row) {
  const name = shortRegionName(row);
  const label = formatRiskLabel(row);
  if (riskNum(row.risk_level_v3) <= 1) return `${name}${cropLabel(row)}当前为正常，暂无明显供应影响。`;
  const stage = row.resolved_growth_stage || row.current_growth_stage_cn || row.growth_stage_code;
  const stageText = ['palm', 'coconut'].includes(String(row.crop_group || '').toLowerCase())
    ? ''
    : (stage ? `，作物阶段为${stage}` : '');
  const impact = row.current_operation_impact_cn || row.future_yield_impact_cn || row.production_impact_cn || row.risk_reason_cn;
  return `${name}${cropLabel(row)}当前标签为${label}${stageText}${impact ? `；${impact}` : ''}。`;
}

function renderImpactChannelsBlock(row) {
  const supportiveTags = (Array.isArray(row.risk_tags) ? row.risk_tags : [])
    .filter(tag => tag && (tag.direction === 'supportive' || String(tag.impact_type || '').includes('support')))
    .map(tag => tag.risk_label_cn || tag.label_cn)
    .filter(Boolean);
  const supportText = supportiveTags.length
    ? supportiveTags.join('、')
    : (row.forecast_signal === 'forecast_relief' ? '预报显示存在缓解信号' : '当前无明确支持性标签');
  return `<div class="detail-block">
    <h3>影响渠道</h3>
    <div class="data-grid cols-3">
      <div class="data-cell"><span class="lbl">当前作业影响</span><span class="val">${esc(row.current_operation_impact_cn || '暂无明确作业影响')}</span></div>
      <div class="data-cell"><span class="lbl">远期产量影响</span><span class="val">${esc(row.future_yield_impact_cn || row.production_impact_cn || '暂无明确产量影响')}</span></div>
      <div class="data-cell"><span class="lbl">支持性信号</span><span class="val">${esc(supportText)}</span></div>
    </div>
  </div>`;
}

function recent5DisplayWindow() {
  if (state.timeRange === '7d') return 7;
  if (state.timeRange === '14d') return 14;
  return 30;
}

function recent5Metric(row, prefix, window, unitKey, actualKey) {
  return {
    actual: row[actualKey],
    mean: row[`${prefix}_${window}d_recent5_mean_${unitKey}`],
    min: row[`${prefix}_${window}d_recent5_min_${unitKey}`],
    max: row[`${prefix}_${window}d_recent5_max_${unitKey}`],
    diff: row[`${prefix}_${window}d_vs_recent5_mean_${unitKey}`],
    years: row[`${prefix}_${window}d_recent5_sample_years`],
    status: row[`${prefix}_${window}d_recent5_status`]
  };
}

function renderRecent5Chip(label, metric, unit, digits) {
  if (!metric || metric.status !== 'available' || Number(metric.years) < 2) return '';
  if (![metric.actual, metric.mean, metric.min, metric.max].every(isNum)) return '';
  const diff = isNum(metric.diff) ? metric.diff : Number(metric.actual) - Number(metric.mean);
  return `<div class="recent5-chip">
    <b>${esc(label)}</b>
    <strong>${esc(fmtNum(metric.actual, digits, unit))} / 近5年均 ${esc(fmtNum(metric.mean, digits, unit))}</strong>
    <span>5年低-高 ${esc(fmtNum(metric.min, digits, unit))} - ${esc(fmtNum(metric.max, digits, unit))}；较均值 ${esc(fmtSigned(diff, digits, unit))}；样本 ${esc(metric.years)}年</span>
  </div>`;
}

function renderRecent5BottomBar(row) {
  if (!row) return '';
  const window = recent5DisplayWindow();
  const period = row.weather_recent5_period || '2021-2025';
  const chips = [
    renderRecent5Chip(`${window}天降雨`, recent5Metric(row, 'precip', window, 'mm', `precip_${window}d_actual`), ' mm', 1),
    renderRecent5Chip(`${window}天均温`, recent5Metric(row, 'tmean', window, 'c', `tmean_${window}d_c`), '°C', 1),
    renderRecent5Chip(`${window}天最高温`, recent5Metric(row, 'tmax', window, 'c', `tmax_${window}d_c`), '°C', 1)
  ].filter(Boolean);
  if (!chips.length) return '';
  return `<div class="recent5-strip">
    <span class="recent5-strip-title">${esc(period)}近5年可用同期参考 · ${window}天窗口 · 不参与正式风险</span>
    <div class="recent5-strip-row">${chips.join('')}</div>
  </div>`;
}

function renderEvidenceBlock(row) {
  const temp = getValidSoilTemp(row);
  const st = temp.record;
  const cards = [];
  if (isNum(row.precip_30d_actual) || isNum(row.precip_30d_anomaly_mm)) {
    const rainValue = isNum(row.precip_30d_actual) && isNum(row.precip_30d_normal)
      ? `${fmtNum(row.precip_30d_actual, 0, ' mm')} / 常年 ${fmtNum(row.precip_30d_normal, 0, ' mm')}`
      : fmtSigned(row.precip_30d_anomaly_mm, 0, ' mm');
    cards.push(`<div class="evidence-card"><b>降雨</b><strong>${esc(rainValue)}</strong>${row.weather_condition_summary_cn ? `<p>${esc(row.weather_condition_summary_cn)}</p>` : ''}</div>`);
  }
  const rootPct = soilRootPercentile(row);
  const surfacePct = soilSurfacePercentile(row);
  if (soilPercentileAvailable(row) && (isNum(rootPct) || isNum(surfacePct) || row.soil_status_cn || row.soil_status_90d_cn)) {
    const soilParts = [
      isNum(rootPct) ? `根区 P${Math.round(Number(rootPct))}` : '',
      isNum(surfacePct) ? `表层 P${Math.round(Number(surfacePct))}` : ''
    ].filter(Boolean).join(' · ');
    cards.push(`<div class="evidence-card"><b>土壤湿度</b><strong>${esc(row.soil_status_cn || row.soil_status_90d_cn || soilParts)}</strong>${soilParts && (row.soil_status_cn || row.soil_status_90d_cn) ? `<p>${esc(soilParts)}</p>` : ''}</div>`);
  } else if (isNum(row.soil_water_rootzone) || isNum(row.soil_water_surface)) {
    const soilParts = [
      isNum(row.soil_water_rootzone) ? `根区 ${fmtNum(row.soil_water_rootzone, 3, '')}` : '',
      isNum(row.soil_water_surface) ? `表层 ${fmtNum(row.soil_water_surface, 3, '')}` : ''
    ].filter(Boolean).join(' · ');
    const recentParts = [
      isNum(row.soil_water_rootzone_7d_avg) ? `根区7日均值 ${fmtNum(row.soil_water_rootzone_7d_avg, 3, '')}` : '',
      isNum(row.soil_water_surface_7d_avg) ? `表层7日均值 ${fmtNum(row.soil_water_surface_7d_avg, 3, '')}` : '',
      isNum(row.soil_water_rootzone_change_7d) ? `根区较前7日 ${fmtSigned(row.soil_water_rootzone_change_7d, 3, '')}` : '',
      isNum(row.soil_water_rootzone_change_30d) ? `根区较前30日 ${fmtSigned(row.soil_water_rootzone_change_30d, 3, '')}` : ''
    ].filter(Boolean);
    const period = row.soil_recent_year_comparison_period || '2021-2025';
    const years = Array.isArray(row.soil_recent_year_comparison_years)
      ? row.soil_recent_year_comparison_years.join('/')
      : '';
    let comparisonText = `正式DOY百分位未启用；${period}近年同期对比暂无本地数据`;
    if (row.soil_recent_year_comparison_status === 'available') {
      const comparisonParts = [
        isNum(row.soil_water_rootzone_recent_year_mean) ? `根区近年均值 ${fmtNum(row.soil_water_rootzone_recent_year_mean, 3, '')}` : '',
        isNum(row.soil_water_surface_recent_year_mean) ? `表层近年均值 ${fmtNum(row.soil_water_surface_recent_year_mean, 3, '')}` : '',
        isNum(row.soil_water_rootzone_vs_recent_year_mean) ? `根区差值 ${fmtSigned(row.soil_water_rootzone_vs_recent_year_mean, 3, '')}` : '',
        isNum(row.soil_water_surface_vs_recent_year_mean) ? `表层差值 ${fmtSigned(row.soil_water_surface_vs_recent_year_mean, 3, '')}` : ''
      ].filter(Boolean);
      comparisonText = `${period}近年同期${years ? `（${years}）` : ''}：${comparisonParts.join(' · ') || '样本有限'}`;
    }
    cards.push(`<div class="evidence-card"><b>土壤墒情</b><strong>${esc(soilParts)}</strong><p>${esc([...recentParts, comparisonText].join('；'))}</p></div>`);
  }
  if (st && temp.hasValid) {
    const soilTempValue = temp.values.t0 !== null
      ? `${temp.values.t0.toFixed(1)}°C`
      : `${temp.values.t28.toFixed(1)}°C`;
    cards.push(`<div class="evidence-card"><b>土壤温度</b><strong>${esc(soilTempValue)}</strong>${temp.text && soilTempValue !== temp.text ? `<p>${esc(temp.text)}</p>` : ''}</div>`);
  }
  if (isNum(row.forecast_7d_precip) || isNum(row.forecast_16d_precip)) {
    const forecastParts = [
      isNum(row.forecast_7d_precip) ? `7天 ${fmtNum(row.forecast_7d_precip, 0, ' mm')}` : '',
      isNum(row.forecast_16d_precip) ? `16天 ${fmtNum(row.forecast_16d_precip, 0, ' mm')}` : ''
    ].filter(Boolean).join(' · ');
    cards.push(`<div class="evidence-card"><b>未来降雨</b><strong>${esc(forecastParts)}</strong></div>`);
  }
  if (!cards.length) return '';
  const recent5Bar = renderRecent5BottomBar(row);
  return `<div class="detail-block">
    <h3>核心证据</h3>
    <div class="evidence-grid">${cards.join('')}</div>
    ${recent5Bar}
  </div>`;
}

function renderRegionStatusBlock(row) {
  return '';
}

function seriesHasValue(series, keys) {
  return Array.isArray(series) && series.some(point => keys.some(key => isNum(point && point[key])));
}

function renderSoilMoistureChartBlock(row) {
  if (!soilPercentileAvailable(row)) return '';
  const series = row.soil_rootzone_percentile_90d_series || [];
  if (!seriesHasValue(series, ['rootzone_percentile', 'surface_percentile'])) return '';
  return `<div class="detail-block">
    <h3>土壤湿度</h3>
    <div class="chart-box"><canvas id="chart-soil"></canvas></div>
  </div>`;
}

function renderPrecipSummaryBlock(row) {
  const series = row.precip_30d_anomaly_90d_series || [];
  if (!seriesHasValue(series, ['precip_30d_actual', 'precip_30d_normal'])) return '';
  return `<div class="detail-block">
    <h3>近30天降雨</h3>
    <div class="chart-box compact"><canvas id="chart-precip-cum"></canvas></div>
  </div>`;
}

function renderRainAnomalyChartBlock(row) {
  if (!dailyRainAnomalySeries(row).length) return '';
  return `<div class="detail-block">
    <h3>每日降雨距平</h3>
    <div class="chart-box compact"><canvas id="chart-rain-anomaly"></canvas></div>
  </div>`;
}

function renderTempAnomalyChartBlock(row) {
  if (!seriesHasValue(row.precip_30d_anomaly_90d_series || [], ['temp_max_anomaly_c', 'temperature_anomaly_c'])) return '';
  return `<div class="detail-block">
    <h3>气温距平</h3>
    <div class="chart-box compact"><canvas id="chart-temp-anomaly"></canvas></div>
  </div>`;
}

function renderForecastDetailBlock(row) {
  const cells = [
    isNum(row.forecast_7d_precip) ? detailCell('未来7天降雨', fmtNum(row.forecast_7d_precip, 0, ' mm')) : '',
    isNum(row.forecast_16d_precip) ? detailCell('未来16天降雨', fmtNum(row.forecast_16d_precip, 0, ' mm')) : ''
  ].filter(Boolean);
  const series = row.forecast_daily_16d_series || [];
  if (!cells.length && !seriesHasValue(series, ['precip_mm', 'temp_max_c', 'temperature_c'])) return '';
  return `<div class="detail-block">
    <h3>未来降雨与温度</h3>
    ${cells.length ? `<div class="data-grid">${cells.join('')}</div>` : ''}
    ${series.length ? '<div class="chart-box"><canvas id="chart-forecast"></canvas></div>' : ''}
  </div>`;
}

function showRegionDetail(row) {
  destroyCharts();
  state.selectedRegionRecord = row;
  const conclusion = regionConclusion(row);
  const extraHtml = `
    ${renderRiskTagsBlock(row)}
    ${renderSignalContradictionBlock(row)}
    ${renderCropProgressBlock(row)}
    ${renderRainSoilExplanationBlock(row)}
    ${renderSoilTemperatureBlock(row)}
    ${renderSoilMoistureChartBlock(row)}
    ${renderPrecipSummaryBlock(row)}
    ${renderRainAnomalyChartBlock(row)}
    ${renderTempAnomalyChartBlock(row)}
    ${renderForecastDetailBlock(row)}
    ${renderRegionStatusBlock(row)}
  `;

  document.getElementById('detail-panel').innerHTML = buildDetailPanel(row, {
    title: shortRegionName(row),
    conclusion,
    countryName: row.country_cn || row.country,
    regionName: shortRegionName(row),
    production: row.production_tonnes,
    weatherRecord: row,
    stageRecord: row,
    extraHtml
  });

  requestAnimationFrame(() => renderRegionCharts(row));
}

function forecastReliefText(row) {
  return buildRecoverySentences(row)[0] || '';
}

function renderRegionCharts(row) {
  renderSoilChart(row.soil_rootzone_percentile_90d_series || []);
  renderPrecipCumChart(row.precip_30d_anomaly_90d_series || []);
  renderRainAnomalyChart(row);
  renderTempAnomalyChart(row.precip_30d_anomaly_90d_series || []);
  renderForecastChart(row.forecast_daily_16d_series || []);
}

const soilBandPlugin = {
  id: 'soilBands',
  beforeDraw(chart) {
    const y = chart.scales.y;
    const area = chart.chartArea;
    if (!y || !area) return;
    const bands = [
      [0, 10, 'rgba(192,57,43,0.08)'],
      [10, 30, 'rgba(230,126,34,0.06)'],
      [30, 70, 'rgba(39,174,96,0.06)'],
      [70, 90, 'rgba(37,99,235,0.06)'],
      [90, 100, 'rgba(124,58,237,0.06)']
    ];
    const ctx = chart.ctx;
    ctx.save();
    bands.forEach(([from, to, color]) => {
      const y1 = y.getPixelForValue(to);
      const y2 = y.getPixelForValue(from);
      ctx.fillStyle = color;
      ctx.fillRect(area.left, y1, area.right - area.left, y2 - y1);
    });
    ctx.restore();
  }
};

function chartLabels(series, dateKey = 'date') {
  return series.map(row => firstDateShort(row[dateKey]));
}

function chartValues(series, key) {
  return series.map(row => isNum(row[key]) ? Number(row[key]) : null);
}

function getRegionHistory(row) {
  if (!row || !row.weather_region_id || !store.regionHistoryIndex) return [];
  return store.regionHistoryIndex.get(String(row.weather_region_id)) || [];
}

function arrayField(row, keys) {
  for (const key of keys) {
    if (Array.isArray(row && row[key])) return row[key];
  }
  return [];
}

function pairedDailySeries(row) {
  const actualSeries = arrayField(row, ['daily_rain_mm', 'daily_precip_mm', 'rain_series', 'precip_series', 'daily_rain_series', 'daily_precip_series']);
  const normalSeries = arrayField(row, ['daily_rain_normal_mm', 'daily_precip_normal_mm', 'normal_series', 'climatology_series', 'daily_normal_series']);
  if (!actualSeries.length || !normalSeries.length || actualSeries.length !== normalSeries.length) return [];
  return actualSeries.map((actualPoint, index) => {
    const normalPoint = normalSeries[index];
    const date = (actualPoint && actualPoint.date) || (normalPoint && normalPoint.date) || (actualPoint && actualPoint.target_date) || (normalPoint && normalPoint.target_date);
    const actual = typeof actualPoint === 'number'
      ? actualPoint
      : firstNumeric(actualPoint, ['daily_rain_mm', 'daily_precip_mm', 'rain_mm', 'precip_mm', 'precipitation_mm', 'value']);
    const normal = typeof normalPoint === 'number'
      ? normalPoint
      : firstNumeric(normalPoint, ['daily_rain_normal_mm', 'daily_precip_normal_mm', 'rain_normal_mm', 'precip_normal_mm', 'precipitation_normal_daily_mm', 'value']);
    return { date, actual, normal };
  });
}

function dailyRainSourceSeries(row) {
  const embedded = arrayField(row, ['daily_weather_series', 'daily_precipitation_series', 'precipitation_daily_series']);
  if (embedded.length) return embedded;
  const paired = pairedDailySeries(row);
  if (paired.length) return paired;
  return getRegionHistory(row);
}

function dailyRainAnomalySeries(row) {
  return dailyRainSourceSeries(row)
    .map(point => {
      const date = point && (point.date || point.target_date || point.forecast_date);
      const actual = firstNumeric(point, ['actual', 'daily_rain_mm', 'daily_precip_mm', 'rain_mm', 'precip_mm', 'precipitation_mm']);
      const normal = firstNumeric(point, ['normal', 'daily_rain_normal_mm', 'daily_precip_normal_mm', 'rain_normal_mm', 'precip_normal_mm', 'precipitation_normal_daily_mm']);
      if (!date || !isNum(actual) || !isNum(normal)) return null;
      return { date, daily_anomaly_mm: actual - normal };
    })
    .filter(Boolean);
}

function renderSoilChart(series) {
  const canvas = document.getElementById('chart-soil');
  if (!canvas || !series.length) return;
  charts.soil = new Chart(canvas, {
    type: 'line',
    data: {
      labels: chartLabels(series),
      datasets: [
        { label: '根区分位', data: chartValues(series, 'rootzone_percentile'), borderColor: '#1e293b', borderWidth: 1.8, pointRadius: 0, tension: 0.3, fill: false },
        { label: '表层分位', data: chartValues(series, 'surface_percentile'), borderColor: '#3b82f6', borderWidth: 1.2, pointRadius: 0, tension: 0.3, borderDash: [3, 2], fill: false }
      ]
    },
    options: chartBaseOptions({ yMin: 0, yMax: 100, yTitle: 'percentile', showXAxis: true }),
    plugins: [soilBandPlugin]
  });
}

function renderPrecipCumChart(series) {
  const canvas = document.getElementById('chart-precip-cum');
  if (!canvas || !series.length) return;
  charts.precipCum = new Chart(canvas, {
    type: 'line',
    data: {
      labels: chartLabels(series),
      datasets: [
        { label: '实际', data: chartValues(series, 'precip_30d_actual'), borderColor: '#2563eb', borderWidth: 1.6, pointRadius: 0, tension: 0.3, fill: { target: 'origin', above: 'rgba(37,99,235,0.06)' } },
        { label: '常年', data: chartValues(series, 'precip_30d_normal'), borderColor: '#94a3b8', borderWidth: 1, pointRadius: 0, borderDash: [4, 3], tension: 0.3 }
      ]
    },
    options: chartBaseOptions({ yMin: 0, yTitle: 'mm', showXAxis: true })
  });
}

function renderRainAnomalyChart(row) {
  const canvas = document.getElementById('chart-rain-anomaly');
  const series = dailyRainAnomalySeries(row);
  if (!canvas || !series.length) return;
  const values = chartValues(series, 'daily_anomaly_mm');
  charts.rainAnomaly = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: chartLabels(series),
      datasets: [{
        label: '每日降雨距平',
        data: values,
        backgroundColor: values.map(v => v === null ? 'rgba(148,163,184,0.15)' : v < 0 ? 'rgba(192,57,43,0.45)' : 'rgba(37,99,235,0.4)'),
        borderRadius: 1,
        barThickness: 2.5
      }]
    },
    options: chartBaseOptions({ yTitle: 'mm', showXAxis: true, yZeroLine: true })
  });
}

function renderTempAnomalyChart(series) {
  const canvas = document.getElementById('chart-temp-anomaly');
  if (!canvas || !series.length) return;
  const values = chartValues(series, 'temp_max_anomaly_c');
  charts.tempAnomaly = new Chart(canvas, {
    type: 'line',
    data: {
      labels: chartLabels(series),
      datasets: [{
        label: '最高温距平',
        data: values,
        borderColor: '#b45309',
        backgroundColor: 'rgba(180,83,9,0.08)',
        borderWidth: 1.5,
        pointRadius: 0,
        tension: 0.3,
        fill: true
      }]
    },
    options: chartBaseOptions({ yTitle: '°C', showXAxis: true })
  });
}

function renderForecastChart(series) {
  const canvas = document.getElementById('chart-forecast');
  if (!canvas || !series.length) return;
  charts.forecast = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: chartLabels(series, 'target_date'),
      datasets: [
        { type: 'bar', label: '降雨', data: chartValues(series, 'precipitation_mm'), backgroundColor: 'rgba(37,99,235,0.28)', borderColor: 'rgba(37,99,235,0.5)', borderWidth: 0.5, yAxisID: 'y1', barThickness: 6, borderRadius: 2 },
        { type: 'line', label: '最高温', data: chartValues(series, 'temp_max_c'), borderColor: '#b45309', borderWidth: 1.5, pointRadius: 1.5, pointBackgroundColor: '#b45309', yAxisID: 'y', tension: 0.3 },
        { type: 'line', label: '最低温', data: chartValues(series, 'temp_min_c'), borderColor: '#3b82f6', borderWidth: 1.5, pointRadius: 1.5, pointBackgroundColor: '#3b82f6', yAxisID: 'y', tension: 0.3 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: { labels: { boxWidth: 8, boxHeight: 8, font: { size: 9 }, padding: 8, usePointStyle: true } },
        tooltip: { titleFont: { size: 10 }, bodyFont: { size: 10 }, padding: 6 }
      },
      scales: {
        x: { ticks: { font: { size: 8 }, maxTicksLimit: 8, maxRotation: 0 }, grid: { display: false } },
        y: { position: 'left', ticks: { font: { size: 8 }, maxTicksLimit: 5 }, grid: { color: 'rgba(0,0,0,0.04)' }, title: { display: true, text: '°C', font: { size: 8 }, color: '#8b95a3' } },
        y1: { position: 'right', min: 0, ticks: { font: { size: 8 }, maxTicksLimit: 4 }, grid: { display: false }, title: { display: true, text: 'mm', font: { size: 8 }, color: '#8b95a3' } }
      }
    }
  });
}

function chartBaseOptions(opts = {}) {
  const yScale = {
    grid: { color: opts.yZeroLine ? (ctx => Number(ctx.tick.value) === 0 ? 'rgba(17,24,39,0.34)' : 'rgba(0,0,0,0.04)') : 'rgba(0,0,0,0.04)', drawBorder: false },
    ticks: { font: { size: 9 }, maxTicksLimit: 5, color: '#8b95a3' }
  };
  if (opts.yTitle) yScale.title = { display: true, text: opts.yTitle, font: { size: 8 }, color: '#8b95a3' };
  const xScale = {
    display: !!opts.showXAxis,
    grid: { display: false },
    ticks: { font: { size: 8 }, maxTicksLimit: 6, maxRotation: 0, color: '#8b95a3' }
  };
  const scales = { x: xScale, y: yScale };
  if (opts.yMin !== undefined) scales.y.min = opts.yMin;
  if (opts.yMax !== undefined) scales.y.max = opts.yMax;
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { intersect: false, mode: 'index' },
    plugins: {
      legend: { labels: { boxWidth: 8, boxHeight: 8, font: { size: 9 }, padding: 8, usePointStyle: true } },
      tooltip: { titleFont: { size: 10 }, bodyFont: { size: 10 }, padding: 6, backgroundColor: 'rgba(23,27,34,0.92)', cornerRadius: 4 }
    },
    scales
  };
}

function populateFilters() {
  const countrySelect = document.getElementById('f-country');
  const current = state.country || countrySelect.value || 'all';
  const countries = new Map();
  store.countryRecords.forEach(row => {
    if (state.crop !== 'all' && row.crop_group !== state.crop) return;
    countries.set(row.country_key, row.country_cn || row.country_key);
  });
  store.adminRecords.forEach(row => {
    if (state.crop !== 'all' && row.crop_group !== state.crop) return;
    countries.set(row.country_key, row.country_cn || row.country_key);
  });
  if (state.crop === 'all' || state.crop === 'rapeseed_canola' || state.crop === 'sunflower') {
    countries.set('European Union', '欧盟');
  }
  const options = [...countries.entries()].sort((a, b) => {
    if (a[0] === 'European Union') return -1;
    if (b[0] === 'European Union') return 1;
    return a[1].localeCompare(b[1], 'zh-CN');
  });
  countrySelect.innerHTML = '<option value="all">全部国家</option>' + options.map(([key, name]) => `<option value="${escAttr(key)}">${esc(name)}</option>`).join('');
  countrySelect.value = options.some(([key]) => key === current) ? current : 'all';
  if (state.viewMode !== 'weather') state.country = countrySelect.value;

  const anomalySelect = document.getElementById('f-label');
  const anomalyValues = new Set();
  store.countryRecords.forEach(row => row.dominant_risk_type && anomalyValues.add(row.dominant_risk_type));
  store.adminRecords.forEach(row => row.risk_type && anomalyValues.add(row.risk_type));
  anomalySelect.innerHTML = '<option value="all">全部异常</option>' + [...anomalyValues].sort().map(value => `<option value="${escAttr(value)}">${esc(riskTypeText(value))}</option>`).join('');
  if (![...anomalySelect.options].some(opt => opt.value === state.anomaly)) state.anomaly = 'all';
  anomalySelect.value = state.anomaly;

  populateWeatherCountryFilter(options);
}

function weatherCountryOptions() {
  const countries = new Map();
  store.adminRecords.forEach(row => {
    if (!row || !isNum(row.lat) || !isNum(row.lon)) return;
    if (state.crop !== 'all' && row.crop_group !== state.crop) return;
    countries.set(row.country_key, row.country_cn || row.country_key);
  });
  if (euWeatherRows(state.crop).length) countries.set('European Union', '欧盟');
  return [...countries.entries()].sort((a, b) => {
    if (a[0] === 'European Union') return -1;
    if (b[0] === 'European Union') return 1;
    const prodDiff = weatherCountryProduction(b[0]) - weatherCountryProduction(a[0]);
    if (prodDiff) return prodDiff;
    return a[1].localeCompare(b[1], 'zh-CN');
  });
}

function weatherCountryProduction(countryKey) {
  if (countryKey === 'European Union') {
    return store.euRecords.reduce((sum, row) => {
      if (!row || row.source_valid_for_frontend === false) return sum;
      if (state.crop !== 'all' && row.crop_group !== state.crop) return sum;
      return sum + (Number(row.production_tonnes) || 0);
    }, 0);
  }
  return store.adminRecords.reduce((sum, row) => {
    if (!row || row.country_key !== countryKey) return sum;
    if (state.crop !== 'all' && row.crop_group !== state.crop) return sum;
    return sum + (Number(row.production_tonnes) || 0);
  }, 0);
}

function euWeatherRows(crop = state.crop) {
  const euRows = (store.euRecords || []).filter(row => {
    if (!row || row.source_valid_for_frontend === false) return false;
    if (crop !== 'all' && row.crop_group !== crop) return false;
    return row.region;
  });
  if (!euRows.length) return [];

  const shareByCountryCrop = new Map();
  euRows.forEach(row => {
    shareByCountryCrop.set(`${canonicalCountry(row.region)}::${row.crop_group}`, row);
  });
  const memberKeys = new Set(euRows.map(row => canonicalCountry(row.region)));

  return store.adminRecords
    .filter(row => {
      if (!row || !isNum(row.lat) || !isNum(row.lon)) return false;
      if (!memberKeys.has(row.country_key)) return false;
      if (crop !== 'all' && row.crop_group !== crop) return false;
      return shareByCountryCrop.has(`${row.country_key}::${row.crop_group}`);
    })
    .map(row => {
      const euRow = shareByCountryCrop.get(`${row.country_key}::${row.crop_group}`);
      return {
        ...row,
        eu_share: euRow ? euRow.eu_share : row.eu_share,
        production_weather_context: 'eu',
        production_weather_context_cn: '欧盟'
      };
    });
}

function defaultWeatherCountry() {
  const options = weatherCountryOptions();
  return options.length ? options[0][0] : 'all';
}

function populateWeatherCountryFilter() {
  const select = document.getElementById('f-weather-country');
  if (!select) return;
  const options = weatherCountryOptions();
  const current = state.country === 'all'
    ? 'all'
    : state.country !== 'all' && options.some(([key]) => key === state.country)
    ? state.country
    : 'all';
  select.innerHTML = options.length
    ? '<option value="all">全部国家</option>' + options.map(([key, name]) => `<option value="${escAttr(key)}">${esc(name)}</option>`).join('')
    : '<option value="all">暂无国家</option>';
  select.value = current;
  if (state.viewMode === 'weather') state.country = current;
}

function syncCountrySelects() {
  const advanced = document.getElementById('f-country');
  if (advanced && [...advanced.options].some(opt => opt.value === state.country)) advanced.value = state.country;
  const weather = document.getElementById('f-weather-country');
  if (weather && [...weather.options].some(opt => opt.value === state.country)) weather.value = state.country;
}

function ensureWeatherCountry() {
  if (state.viewMode !== 'weather') return;
  const options = weatherCountryOptions();
  if (!options.length) {
    state.country = 'all';
    syncCountrySelects();
    return;
  }
  if (state.country !== 'all' && !options.some(([key]) => key === state.country)) {
    state.country = 'all';
  }
  syncCountrySelects();
}

function updateMapLegend() {
  const legend = document.getElementById('map-legend');
  if (!legend) return;
  if (state.viewMode !== 'weather') {
    legend.innerHTML = RISK_LEGEND_HTML;
    return;
  }
  const metric = weatherMetricMeta();
  const gradient = metric.gradient || { from: WEATHER_PALETTE.dryHot, to: WEATHER_PALETTE.wetCold, lowLabel: '低', highLabel: '高' };
  legend.innerHTML = `
    <div class="legend-title">${esc(metric.title)}</div>
    <div class="gradient-legend" style="--grad-from:${escAttr(gradient.from)};--grad-to:${escAttr(gradient.to)};--grad-stops:${escAttr(weatherGradientCss())}">
      <div class="gradient-bar"></div>
      <div class="gradient-labels"><span>${esc(gradient.lowLabel)}</span><span>${esc(gradient.highLabel)}</span></div>
    </div>
  `;
}

function updateModeChrome() {
  const app = document.getElementById('app');
  if (app) app.classList.toggle('weather-mode', state.viewMode === 'weather');
  document.querySelectorAll('.view-tab').forEach(item => item.classList.toggle('active', item.dataset.view === state.viewMode));
  document.querySelectorAll('.crop-tab').forEach(item => item.classList.toggle('active', item.dataset.crop === state.crop));
  document.querySelectorAll('.risk-tab').forEach(item => item.classList.toggle('active', item.dataset.risk === state.risk));
  document.querySelectorAll('.metric-tab').forEach(item => item.classList.toggle('active', item.dataset.metric === state.weatherMetric));
  document.querySelectorAll('.value-tab').forEach(item => item.classList.toggle('active', item.dataset.value === state.mapValue));
  document.querySelectorAll('[data-main-nav]').forEach(item => {
    const active = item.dataset.mainNav === 'climate' ? state.viewMode === 'weather' : state.viewMode !== 'weather';
    item.classList.toggle('active', active);
  });
  const dataStatusSelect = document.getElementById('f-data-status');
  if (dataStatusSelect) dataStatusSelect.value = state.dataStatus;
  const anomalySelect = document.getElementById('f-label');
  if (anomalySelect && [...anomalySelect.options].some(opt => opt.value === state.anomaly)) anomalySelect.value = state.anomaly;
  syncCountrySelects();
  updateMapLegend();
  requestAnimationFrame(() => map && map.invalidateSize());
}

async function renderActiveView() {
  updateModeChrome();
  if (state.viewMode === 'weather') {
    ensureWeatherCountry();
    await renderProductionWeatherLayer();
    return;
  }
  if (state.layer === 'region' && state.selectedCountry) {
    await renderRegionLayer();
    return;
  }
  renderCountryLayer();
}

function bindEvents() {
  document.getElementById('view-tabs').addEventListener('click', event => {
    const tab = event.target.closest('.view-tab');
    if (!tab) return;
    if (tab.dataset.view === state.viewMode) return;
    rememberCurrentViewState();
    restoreViewState(tab.dataset.view);
    populateFilters();
    updateTimeRangeUI();
    renderActiveView();
  });

  document.getElementById('crop-tabs').addEventListener('click', event => {
    const tab = event.target.closest('.crop-tab');
    if (!tab) return;
    state.crop = tab.dataset.crop;
    state.selectedCountry = null;
    state.selectedCountryCrop = null;
    state.selectedCountryRecord = null;
    state.selectedRegionRecord = null;
    document.querySelectorAll('.crop-tab').forEach(item => item.classList.toggle('active', item.dataset.crop === state.crop));
    populateFilters();
    renderActiveView();
  });

  document.getElementById('weather-metric-tabs').addEventListener('click', event => {
    const tab = event.target.closest('.metric-tab');
    if (!tab) return;
    state.weatherMetric = tab.dataset.metric;
    renderActiveView();
  });

  document.getElementById('map-value-tabs').addEventListener('click', event => {
    const tab = event.target.closest('.value-tab');
    if (!tab) return;
    state.mapValue = tab.dataset.value;
    renderActiveView();
  });

  const weatherCountrySelect = document.getElementById('f-weather-country');
  if (weatherCountrySelect) {
    weatherCountrySelect.addEventListener('change', event => {
      state.country = event.target.value;
      state.selectedCountry = null;
      state.selectedCountryCrop = null;
      state.selectedCountryRecord = null;
      state.selectedRegionRecord = null;
      syncCountrySelects();
      renderActiveView();
    });
  }

  document.querySelectorAll('.layer-btn').forEach(button => {
    button.addEventListener('click', async () => {
      const target = button.dataset.layer;
      if (target === 'region' && !state.selectedCountry) return;
      if (target === 'country') {
        state.layer = 'country';
        renderCountryLayer();
      } else {
        state.layer = 'region';
        await renderRegionLayer();
        if (state.selectedCountryRecord) showCountryDetail(state.selectedCountryRecord);
      }
    });
  });

  document.getElementById('risk-tabs').addEventListener('click', event => {
    const tab = event.target.closest('.risk-tab');
    if (!tab) return;
    state.risk = tab.dataset.risk;
    document.querySelectorAll('.risk-tab').forEach(item => item.classList.toggle('active', item.dataset.risk === state.risk));
    renderActiveView();
  });

  document.getElementById('time-tabs').addEventListener('click', event => {
    const tab = event.target.closest('.time-tab');
    if (!tab) return;
    state.timeRange = tab.dataset.range;
    updateTimeRangeUI();
    if (state.selectedRegionRecord) showRegionDetail(state.selectedRegionRecord);
    else if (state.selectedCountryRecord) showCountryDetail(state.selectedCountryRecord);
  });

  document.getElementById('f-country').addEventListener('change', event => {
    state.country = event.target.value;
    state.selectedCountry = null;
    state.selectedCountryCrop = null;
    state.selectedCountryRecord = null;
    state.selectedRegionRecord = null;
    if (state.viewMode === 'weather') ensureWeatherCountry();
    syncCountrySelects();
    renderActiveView();
  });

  document.getElementById('f-label').addEventListener('change', event => {
    state.anomaly = event.target.value;
    renderActiveView();
  });

  const dataStatusSelect = document.getElementById('f-data-status');
  if (dataStatusSelect) {
    dataStatusSelect.addEventListener('change', event => {
      state.dataStatus = event.target.value;
      renderActiveView();
    });
  }

  document.getElementById('btn-reset').addEventListener('click', () => {
    state = {
      viewMode: 'risk',
      crop: 'all',
      country: 'all',
      risk: 'all',
      anomaly: 'all',
      dataStatus: 'all',
      timeRange: '14d',
      layer: 'country',
      weatherMetric: 'rain',
      mapValue: 'production',
      selectedCountry: null,
      selectedCountryCrop: null,
      selectedCountryRecord: null,
      selectedRegionRecord: null
    };
    resetViewMemory();
    document.querySelectorAll('.crop-tab').forEach(item => item.classList.toggle('active', item.dataset.crop === 'all'));
    document.querySelectorAll('.risk-tab').forEach(item => item.classList.toggle('active', item.dataset.risk === 'all'));
    if (dataStatusSelect) dataStatusSelect.value = 'all';
    updateModeChrome();
    updateTimeRangeUI();
    populateFilters();
    renderActiveView();
  });

  document.getElementById('detail-panel').addEventListener('click', event => {
    const row = event.target.closest('[data-region-id]');
    if (!row) return;
    const record = store.adminById.get(row.dataset.regionId);
    if (record) showRegionDetail(record);
  });

  document.addEventListener('click', event => {
    const retry = event.target.closest('[data-retry-load]');
    if (!retry) return;
    window.location.reload();
  });
}

function setLayerButtons() {
  document.querySelectorAll('.layer-btn').forEach(button => {
    button.classList.toggle('active', state.viewMode !== 'weather' && button.dataset.layer === state.layer);
  });
  document.getElementById('layer-region').disabled = !state.selectedCountry;
}

function updateOverlay() {
  const weatherMode = state.viewMode === 'weather';
  const cropText = state.crop === 'all' ? '全部油种' : (CROP_META[state.crop] ? CROP_META[state.crop].tab : state.crop);
  const title = weatherMode
    ? `${weatherCountryTitle()}｜${cropText}｜${weatherMetricMeta().title}`
    : (state.layer === 'country'
      ? '国家层'
      : `${getCountryName(state.selectedCountry)}｜地区层`);
  document.getElementById('overlay-title').textContent = title;
  document.getElementById('ov-main').textContent = mapStats.main;
  document.getElementById('ov-main-label').textContent = weatherMode ? '地区' : (state.layer === 'country' ? '国家' : '地区');
  document.getElementById('ov-risk').textContent = mapStats.risk;
  document.getElementById('ov-fallback').textContent = mapStats.fallback;
  const riskLabel = document.getElementById('ov-risk-label');
  const fallbackLabel = document.getElementById('ov-fallback-label');
  if (riskLabel) riskLabel.textContent = weatherMode ? '≥10%主产区' : '显著/重点跟踪';
  if (fallbackLabel) fallbackLabel.textContent = weatherMode ? '隐藏小区' : '代表点展示';
  const baseStatus = mapStats.fallback
    ? `<div class="map-notice">${esc(mapStats.note)}</div>`
    : esc(mapStats.note);
  const loadWarning = store.loadErrors.length
    ? `<div class="map-notice error">${loadErrorCardHtml()}</div>`
    : '';
  document.getElementById('map-status').innerHTML = baseStatus + loadWarning;
}

function bestDataDate() {
  return latestObservationDate();
}

function primarySiteMeta() {
  return store.siteMeta && store.siteMeta.length ? store.siteMeta[0] : {};
}

function latestObservationDate() {
  const metaDates = store.siteMeta.map(row => row && (row.data_valid_date || row.weather_baseline_ref_date || row.observation_date || row.latest_observation_date)).filter(Boolean);
  const dates = [
    ...metaDates,
    ...store.countryRecords.map(row => row.data_valid_date || row.weather_baseline_ref_date),
    ...store.adminRecords.map(row => row.data_valid_date || row.weather_baseline_ref_date),
    ...store.regionHistory.map(row => row && row.date)
  ].filter(Boolean).sort();
  return dates.length ? String(dates[dates.length - 1]).slice(0, 10) : '-';
}

function buildUpdatedAt() {
  const meta = primarySiteMeta();
  const dates = [
    meta.generated_at,
    meta.updated_at,
    ...store.countryRecords.map(row => row.generated_at || row.updated_at),
    ...store.adminRecords.map(row => row.generated_at || row.updated_at)
  ].filter(Boolean).sort();
  return dates.length ? formatMetaDateTime(dates[dates.length - 1]) : '—';
}

function forecastDateRange() {
  const dates = [];
  store.adminRecords.forEach(row => {
    (Array.isArray(row.forecast_daily_16d_series) ? row.forecast_daily_16d_series : []).forEach(point => {
      const date = point && (point.target_date || point.date || point.forecast_date);
      if (date) dates.push(String(date).slice(0, 10));
    });
    if (row.forecast_date) dates.push(String(row.forecast_date).slice(0, 10));
  });
  const sorted = [...new Set(dates)].filter(Boolean).sort();
  if (!sorted.length) return '—';
  return sorted.length === 1 ? sorted[0] : `${sorted[0]} 至 ${sorted[sorted.length - 1]}`;
}

function dataCoverageText() {
  const meta = primarySiteMeta();
  const active = Number(meta.active_points);
  const excluded = Number(meta.excluded_faostat_points);
  if (Number.isFinite(active) && Number.isFinite(excluded)) {
    return {
      coverage: `${active.toLocaleString('zh-CN')} / ${(active + excluded).toLocaleString('zh-CN')}`,
      missing: excluded.toLocaleString('zh-CN')
    };
  }
  const total = store.adminRecords.length;
  const covered = store.adminRecords.filter(row => isNum(row.lat) && isNum(row.lon) && (isNum(row.precip_30d_actual) || isNum(row.precip_30d_mm))).length;
  const missing = Math.max(0, total - covered);
  return {
    coverage: total ? `${covered.toLocaleString('zh-CN')} / ${total.toLocaleString('zh-CN')}` : '—',
    missing: total ? missing.toLocaleString('zh-CN') : '—'
  };
}

function updateMetaDate() {
  const date = bestDataDate();
  const coverage = dataCoverageText();
  const entryParam = getEntryParam();
  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };
  setText('meta-version', UI_VERSION);
  setText('meta-entry', entryParam || '—');
  setText('meta-rule', RULE_VERSION);
  setText('meta-observation-date', formatMetaDate(date));
  setText('meta-forecast-range', forecastDateRange());
  setText('meta-build-time', buildUpdatedAt());
  setText('meta-coverage', coverage.coverage);
  setText('meta-missing', coverage.missing);
  const entryWrap = document.getElementById('meta-entry-wrap');
  if (entryWrap) entryWrap.style.display = entryParam ? 'inline' : 'none';
  const summaryVersion = document.getElementById('sum-version');
  if (summaryVersion) summaryVersion.textContent = `${RULE_VERSION} · ${UI_VERSION}`;
}

function summaryEligibleRecords(records) {
  return (Array.isArray(records) ? records : []).filter(row => row && row.source_valid_for_frontend !== false && !isSummaryProxyRecord(row));
}

function buildSummaryCards(records) {
  const eligible = summaryEligibleRecords(records);
  const topRisks = eligible.filter(row => riskNumFromCountry(row) >= 3).slice().sort((a, b) => {
    const score = (Number(b.weighted_risk_score) || 0) - (Number(a.weighted_risk_score) || 0);
    if (score) return score;
    const disturbedShare = (Number(b.disturbed_share) || 0) - (Number(a.disturbed_share) || 0);
    if (disturbedShare) return disturbedShare;
    return (Number(b.total_production_tonnes) || 0) - (Number(a.total_production_tonnes) || 0);
  }).slice(0, 3);

  const totalProduction = eligible.reduce((sum, row) => sum + (Number(row.total_production_tonnes) || 0), 0);
  const highRisk = eligible.filter(row => riskNumFromCountry(row) >= 4);
  const affectedProduction = highRisk.reduce((sum, row) => sum + (Number(row.total_production_tonnes) || 0), 0);

  const eligibleKeys = new Set(eligible.map(row => `${canonicalCountry(row.country)}::${row.crop_group}`));
  const riskRegions = store.adminRecords.filter(row => eligibleKeys.has(`${row.country_key}::${row.crop_group}`) && riskNum(row.risk_level_v3) >= 3);
  const anomalyWeights = new Map();
  riskRegions.forEach(row => {
    const label = row.anomaly_label || row.anomaly_type || row.risk_reason_cn || formatAnomalyType(row);
    anomalyWeights.set(label, (anomalyWeights.get(label) || 0) + (Number(row.production_tonnes) || 1));
  });
  const anomalyTypes = [...anomalyWeights.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([label]) => label);

  const forecastRegions = riskRegions.filter(row => isNum(row.forecast_7d_precip) || isNum(row.forecast_16d_precip));
  let reliefWeight = 0;
  let worsenWeight = 0;
  let steadyWeight = 0;
  forecastRegions.forEach(row => {
    const weight = Number(row.production_tonnes) || 1;
    const forecast7 = Number(row.forecast_7d_precip) || 0;
    const forecast16 = Number(row.forecast_16d_precip) || 0;
    const normal7 = Number(row.forecast_precip_7d_normal_mm) || 0;
    const deficit = Number(row.precip_30d_anomaly_mm) || 0;
    const dryRisk = row.risk_type === 'drought_water_deficit' || row.risk_type === 'heat_drydown';
    const wetRisk = row.risk_type === 'excess_rain_waterlogging' || row.risk_type === 'wet_harvest_disruption';
    if (dryRisk && deficit < -10 && forecast7 >= normal7 * 0.8) {
      reliefWeight += weight;
    } else if (wetRisk && forecast7 > normal7 * 1.5) {
      worsenWeight += weight;
    } else if (dryRisk && deficit < -10 && forecast7 < normal7 * 0.4) {
      worsenWeight += weight;
    } else {
      steadyWeight += weight;
    }
  });
  let forecastChange = '暂无预报信号';
  if (forecastRegions.length) {
    forecastChange = '维持';
    if (reliefWeight > worsenWeight * 1.15) forecastChange = '未来修复';
    else if (worsenWeight > reliefWeight * 1.15) forecastChange = '未来转差';
  }
  const changeRows = eligible.filter(row => riskNumFromCountry(row) >= 2 || riskChangeInfo(row, { isCountry: true }).code !== 'steady');
  const changeCounts = changeRows.reduce((acc, row) => {
    const change = riskChangeInfo(row, { isCountry: true }).code;
    if (change === 'new' || change === 'up' || (riskNumFromCountry(row) >= 2 && previousRiskLevel(row) !== null && previousRiskLevel(row) <= 1)) acc.new += 1;
    else if (change === 'down' || change === 'future_repair') acc.relief += 1;
    else acc.steady += 1;
    return acc;
  }, { new: 0, relief: 0, steady: 0 });

  return {
    topRisks,
    productionShare: totalProduction > 0 && affectedProduction > 0 ? affectedProduction / totalProduction : null,
    productionNote: totalProduction > 0 && affectedProduction > 0
      ? `显著压力覆盖 ${fmtProduction(affectedProduction)} / 可量化产量 ${fmtProduction(totalProduction)}`
      : '暂无显著风险',
    anomalyTypes,
    changeCounts,
    forecastChange,
    forecastNote: forecastRegions.length
      ? `修复 ${fmtProduction(reliefWeight)} · 转差 ${fmtProduction(worsenWeight)} · 维持 ${fmtProduction(steadyWeight)}`
      : '暂无预报信号'
  };
}

function summarySubject(row) {
  return `${row.country_cn || row.country}${CROP_META[row.crop_group] ? CROP_META[row.crop_group].tab : cropLabel(row)}`;
}

function buildSummaryHeadline(summary) {
  if (!summary.topRisks.length) return '今日重点：主产区暂无显著风险，维持常规跟踪。';
  const parts = summary.topRisks.slice(0, 3).map(row => `${summarySubject(row)}${formatRiskLabel(row).replace(/.*｜/, '')}`);
  return `今日重点：${parts.join('；')}。`;
}

function changeCountsText(counts) {
  return `新增 ${counts.new}｜缓和 ${counts.relief}｜维持 ${counts.steady}`;
}

function buildTodayFocus(records) {
  const summary = buildSummaryCards(records);
  return summary.topRisks.map(countryRow => {
    const region = store.adminRecords
      .filter(row => row.country_key === canonicalCountry(countryRow.country) && row.crop_group === countryRow.crop_group)
      .sort((a, b) => riskNum(b.risk_level_v3) - riskNum(a.risk_level_v3) || (Number(b.production_tonnes) || 0) - (Number(a.production_tonnes) || 0))[0];
    const subject = `${countryRow.country_cn || countryRow.country}${CROP_META[countryRow.crop_group] ? CROP_META[countryRow.crop_group].tab : cropLabel(countryRow)}`;
    const regionName = region ? shortRegionName(region) : '';
    const fact = region && (buildPressureItems(region)[0] || region.current_operation_impact_cn || region.future_yield_impact_cn || region.weather_condition_summary_cn || region.risk_reason_cn);
    const implication = tradeImplication(region || countryRow);
    return {
      subject,
      text: `${regionName ? `${regionName}：` : ''}${formatPublicText(fact || countryRow.dominant_risk_reason_cn || formatRiskLabel(countryRow))} 投研含义：${implication}。`
    };
  });
}

function renderTodaySummary() {
  const summary = buildSummaryCards(store.countryRecords);
  if (renderLoadErrorState()) return;
  const riskList = document.getElementById('summary-risk-list');
  riskList.innerHTML = summary.topRisks.length
    ? `<div class="summary-headline">${esc(buildSummaryHeadline(summary))}</div>`
      + summary.topRisks.map(row => `<div class="summary-risk-line"><b>${esc(row.country_cn || row.country)}｜${esc(CROP_META[row.crop_group] ? CROP_META[row.crop_group].tab : cropLabel(row))}</b><span style="color:${riskColor(riskNumFromCountry(row))}">${esc(formatRiskLabel(row))}</span>${riskChangeBadge(row, { isCountry: true })}</div>`).join('')
    : '<span style="color:var(--muted);font-weight:500;">暂无显著风险</span>';
  document.getElementById('summary-production-share').textContent = summary.productionShare === null ? '暂无' : fmtPct(summary.productionShare, 1);
  document.getElementById('summary-production-note').textContent = summary.productionNote;
  document.getElementById('summary-anomaly-types').textContent = changeCountsText(summary.changeCounts);
  const changeNote = document.getElementById('summary-change-note');
  if (changeNote) changeNote.textContent = summary.anomalyTypes.length ? `主要异常：${summary.anomalyTypes.join('；')}` : '主要异常：暂无显著风险';
  document.getElementById('summary-forecast-change').textContent = summary.forecastChange;
  document.getElementById('summary-forecast-note').textContent = summary.forecastNote;

  const focusItems = buildTodayFocus(store.countryRecords);
  document.getElementById('today-focus-list').innerHTML = focusItems.length
    ? focusItems.map(item => `<div class="today-focus-item"><b>${esc(item.subject)}：</b>${esc(item.text)}</div>`).join('')
    : '<div class="today-focus-item">当前暂无显著产区天气风险，维持常规监控。</div>';
  document.getElementById('sum-date').textContent = `最新实况日期 ${bestDataDate()}（ECMWF IFS）`;
}

function updateTimeRangeUI() {
  document.querySelectorAll('.time-tab').forEach(button => button.classList.toggle('active', button.dataset.range === state.timeRange));
  const note = document.getElementById('time-range-note');
  if (note) note.textContent = '';
}

async function init() {
  initMap();
  bindEvents();
  applyNavigationParams();

  const [weatherConfig, riskRules] = await Promise.all([
    loadConfig('weather_thresholds.json', null),
    loadConfig('risk_rules.json', null)
  ]);
  store.weatherConfig = weatherConfig;
  store.riskRules = riskRules;

  const [countryRecords, adminRecords, coverage, admin1Manifest, euRecords, geojson, cropProgress, soilTemp, regionHistory, siteMeta] = await Promise.all([
    loadJSON('country_crop_risk_latest.json', []),
    loadJSON('admin_region_risk_latest.json', []),
    loadJSON('geo_boundary_coverage.json', []),
    loadJSON('admin1_geojson_manifest_v1.0f2.json', []),
    loadJSON('eu_virtual_country_summary.json', []),
    loadJSON('countries.geo.json', { type: 'FeatureCollection', features: [] }),
    loadJSON('crop_progress_latest.json', []),
    loadJSON('soil_temperature_latest.json', []),
    loadJSON('region_history_90d_v1.0d.json', []),
    loadJSON('site_meta.json', [])
  ]);

  prepareData({ countryRecords, adminRecords, coverage, admin1Manifest, euRecords, geojson, cropProgress, soilTemp, regionHistory, siteMeta });
  updateMetaDate();
  updateTimeRangeUI();
  renderTodaySummary();
  populateFilters();
  updateModeChrome();
  renderCountryLayer();
  setTimeout(() => map.invalidateSize(), 500);
}

init().catch(error => {
  console.error('Init failed:', error);
  const message = String(error && error.message || '初始化失败');
  if (!store.loadErrors.length) store.loadErrors.push(message.includes('.json') ? `${message} 未读取成功` : `初始化失败：${message}`);
  renderLoadErrorState();
  document.getElementById('map-status').innerHTML = loadErrorCardHtml() || `<span style="color:#b91c1c;">${esc(message)}</span>`;
});
