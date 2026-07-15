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
  const …36754 tokens truncated…ner('click', event => {
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
    ...store.adminRecords.map(row => row.data_valid_date || row.weather_baseline_ref_date)
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
  document.getElementById('sum-date').textContent = `最新观测日期 ${bestDataDate()}`;
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

