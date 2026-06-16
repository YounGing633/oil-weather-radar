const DATA_DIR = './data/';
const UI_VERSION = 'v2.1-ui2p4';
const RULE_VERSION = 'risk_label_v4';

const RISK = {
  4: { code: 'severe', cn: '显著压力', color: '#c0392b' },
  3: { code: 'pressure', cn: '重点压力', color: '#e67e22' },
  2: { code: 'watch', cn: '一般关注', color: '#d4a017' },
  1: { code: 'mild', cn: '轻度异常', color: '#f0d264' },
  0: { code: 'normal', cn: '正常监控', color: '#27ae60' }
};

const RISK_CODE_TO_NUM = {
  severe: 4,
  pressure: 3,
  stress: 4,
  attention: 3,
  watch: 2,
  mild: 1,
  normal: 0,
  low: 0
};

const CROP_META = {
  palm: { tab: '棕榈', label: '棕榈', oil: '棕榈', color: '#15803d' },
  soybean: { tab: '大豆', label: '大豆', oil: '大豆', color: '#b45309' },
  rapeseed_canola: { tab: '菜籽', label: '菜籽', oil: '菜籽', color: '#2563eb' },
  sunflower: { tab: '葵花籽', label: '葵花籽', oil: '葵花籽', color: '#7c3aed' },
  coconut: { tab: '椰子', label: '椰子', oil: '椰子', color: '#0891b2' }
};

const RISK_TYPE_CN = {
  drought_water_deficit: '干旱/水分不足',
  heat_drydown: '高温干化',
  wetness_waterlogging: '偏湿/渍涝',
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
  crop: 'all',
  country: 'all',
  risk: 'all',
  anomaly: 'all',
  dataStatus: 'all',
  timeRange: '14d',
  layer: 'country',
  selectedCountry: null,
  selectedCountryCrop: null,
  selectedCountryRecord: null,
  selectedRegionRecord: null
};

let store = {
  countryRecords: [],
  adminRecords: [],
  coverage: [],
  euRecords: [],
  geojson: null,
  adminById: new Map(),
  regionHistory: [],
  regionHistoryIndex: new Map(),
  siteMeta: [],
  loadErrors: []
};

let currentModels = [];
let currentCountryLabelCenters = [];

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

function riskBadge(value, text) {
  const info = riskInfo(value);
  return `<span class="badge" style="background:${info.color}">${esc(text || info.cn)}</span>`;
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

function formatRiskLabel(record) {
  if (!record) return RISK[0].cn;
  return record.risk_label_v4_cn
    || record.dominant_map_badge_cn
    || record.weighted_risk_level_cn
    || record.risk_level_v3_cn
    || riskText(record.weighted_risk_level ?? record.risk_level_v3);
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
  return String(safeValue(value, ''))
    .replace(/national\s*proxy/gi, '国家代表口径')
    .replace(/virtual\s*country/gi, '汇总单元')
    .replace(/admin1\s*polygon/gi, '地区边界')
    .replace(/fallback/gi, '代表点')
    .replace(/low\s*sample/gi, '有限样本')
    .replace(/real_active/gi, '数据充足')
    .replace(/sample/gi, '建设中数据')
    .replace(/proxy/gi, '代表口径');
}

function formatAnomalyType(record) {
  if (!record) return '常规监控';
  if (record.anomaly_label || record.anomaly_type) return record.anomaly_label || riskTypeText(record.anomaly_type);
  if (record.risk_type === 'wetness_waterlogging') return '降雨过多 / 土壤偏湿';
  if (record.risk_type === 'heat_drydown') return '高温水分压力';
  if (record.risk_type === 'drought_water_deficit') return '降雨偏少 / 土壤偏干';
  if (record.dominant_risk_type) return riskTypeText(record.dominant_risk_type);
  if (record.risk_reason_cn || record.dominant_risk_reason_cn) return record.risk_reason_cn || record.dominant_risk_reason_cn;
  return formatRiskLabel(record);
}

function firstDateShort(value) {
  const s = fmtDash(value);
  if (s === '—') return '';
  return s.slice(5, 10);
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
      store.loadErrors.push(`${name}: ${error.message}`);
      return fallback;
    }
    throw error;
  } finally {
    console.timeEnd(timer);
  }
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

  store.coverage = (Array.isArray(raw.coverage) ? raw.coverage : []).map(row => ({ ...row, country_key: canonicalCountry(row.country) }));
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

function matchesRiskFilter(value) {
  const level = riskNum(value);
  if (state.risk === 'gte3') return level >= 3;
  if (state.risk === 'gte4') return level >= 4;
  if (state.risk === 'lte2') return level <= 2;
  return true;
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
    if (!matchesRiskFilter(riskNumFromCountry(top))) return;
    if (state.anomaly !== 'all' && !records.some(row => row.dominant_risk_type === state.anomaly)) return;
    const model = { key, top, records, isEu: false };
    if (!matchesDataStatus(model)) return;
    models.push(model);
  });

  const euAggregates = aggregateEuRecords(state.crop);
  if (euAggregates.length && (state.country === 'all' || state.country === 'European Union')) {
    const top = chooseCountryRecord(euAggregates);
    if (top) {
      const riskOk = matchesRiskFilter(riskNumFromCountry(top));
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
        <b>${esc(cropLabel(row))}</b> ${riskBadge(riskNumFromCountry(row), row.weighted_risk_level_cn)}
        <span style="color:#8b95a3;margin-left:4px;">${esc(fmtProduction(row.total_production_tonnes))}</span>
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
  const name = isRegion && currentZoom >= 5
    ? shortRegionName(record)
    : (record.country_cn || record.country);
  const crop = CROP_META[record.crop_group] ? CROP_META[record.crop_group].tab : cropLabel(record);
  const riskLabel = formatRiskLabel(record);
  const productionShare = firstNumeric(record, ['national_share', 'production_share', 'global_share']);
  let detail = riskLabel;

  if (isRegion && currentZoom >= 6) {
    detail = `${crop}｜${formatAnomalyType(record)}`;
  } else if (isRegion && currentZoom >= 5) {
    detail = isNum(record.national_share) ? `${crop}｜全国占比 ${fmtPct(record.national_share, 0)}` : `${crop}｜${riskLabel}`;
  } else if (!isRegion && currentZoom >= 4 && currentZoom < 6) {
    detail = isNum(productionShare) ? `${crop}｜${fmtPct(productionShare, 0)}产量占比` : `${crop}｜${riskLabel}`;
  } else if (!isRegion && currentZoom >= 6) {
    detail = `${crop}｜${riskLabel}`;
  }

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
      filter: feature => byKey.has(getFeatureCountry(feature)),
      style: feature => {
        const model = byKey.get(getFeatureCountry(feature));
        const color = riskColor(riskNumFromCountry(model.top));
        return {
          color: '#4b5563',
          weight: 1.1,
          opacity: 0.86,
          fillColor: color,
          fillOpacity: 0.52
        };
      },
      onEachFeature: (feature, layer) => {
        const key = getFeatureCountry(feature);
        const model = byKey.get(key);
        polygonCount += 1;
        layer.bindTooltip(createCountryTooltip(model), { sticky: true, direction: 'auto' });
        layer.on({
          click: () => selectCountry(model),
          mouseover: () => layer.setStyle({ weight: 2.2, fillOpacity: 0.68 }),
          mouseout: () => countryGeo.resetStyle(layer)
        });

        const center = layer.getBounds().getCenter();
        currentCountryLabelCenters.push({ center, model, direction: 'center', offset: [0, 0] });
        if (shouldShowCountryLabel(model, map.getZoom())) {
          L.tooltip({
            permanent: true,
            direction: 'center',
            className: 'country-map-label',
            opacity: 1
          })
            .setLatLng(center)
            .setContent(countryLabelHtml(model.top, map.getZoom()))
            .addTo(layers.countryLabels);
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
      weight: 1.5,
      fillColor: riskColor(riskNumFromCountry(model.top)),
      fillOpacity: 0.86
    }).addTo(layers.fallback);
    marker.bindTooltip(createCountryTooltip(model), { sticky: true });
    marker.on('click', () => selectCountry(model));
    currentCountryLabelCenters.push({ center, model, direction: 'top', offset: [0, -8] });
    if (shouldShowCountryLabel(model, map.getZoom())) {
      L.tooltip({
        permanent: true,
        direction: 'top',
        offset: [0, -8],
        className: 'country-map-label',
        opacity: 1
      }).setLatLng(center).setContent(countryLabelHtml(model.top, map.getZoom())).addTo(layers.countryLabels);
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
  const risk = riskNumFromCountry(model.top);
  const production = Number(model.top.total_production_tonnes) || 0;
  if (zoom <= 2) return risk >= 4 || production > 20000000;
  if (zoom <= 3) return risk >= 3 || production > 5000000;
  if (zoom <= 4) return true;
  return true;
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

function moistureState(row) {
  const root = isNum(row && row.rootzone_percentile) ? Number(row.rootzone_percentile) : null;
  const surface = isNum(row && row.surface_percentile) ? Number(row.surface_percentile) : null;
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
  if (moisture.rootDry || moisture.surfaceDry) {
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
  const current = buildCurrentRiskSentences(row);
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
  if (timeRange === '7d') {
    const rain7 = firstNumeric(row, ['rain_7d_sum_mm', 'rain_7d', 'rainfall_7d', 'precip_7d', 'precip_7d_actual']);
    const anom7 = firstNumeric(row, ['rain_7d_anomaly_mm', 'rainfall_anomaly_7d', 'precip_7d_anomaly_mm', 'rainfall_7d_anomaly']);
    return [
      isNum(rain7) ? ['近7天降雨', fmtNum(rain7, 1, ' mm')] : null,
      isNum(anom7) ? ['近7天降雨距平', fmtSigned(anom7, 1, ' mm')] : null,
      isNum(row.heavy_rain_days_7d) ? ['近7天强降雨日数', fmtInt(row.heavy_rain_days_7d, ' 天')] : null,
      isNum(row.rootzone_percentile) ? ['土壤湿度分位', `P${Math.round(Number(row.rootzone_percentile))}`] : null
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
    isNum(row.rootzone_percentile) ? ['土壤湿度分位', `P${Math.round(Number(row.rootzone_percentile))}`] : null
  ].filter(Boolean);
}

function renderWeatherFactsBlock(row, title = '天气事实') {
  const facts = buildWeatherFactItems(row);
  if (!facts.length) return '';
  return `<div class="detail-block"><h3>${esc(title)}</h3><div class="data-grid cols-3">${facts.map(([label, value]) => detailCell(label, value)).join('')}</div></div>`;
}

function growthSensitivityText(record) {
  return '';
}

function renderGrowthStageBlock(record) {
  return '';
}

function isSoilDry(row) {
  const soilText = `${row.soil_status_cn || ''} ${row.soil_status_90d_cn || ''} ${row.soil_condition_summary_cn || ''} ${row.soil_signal_recent || ''}`.toLowerCase();
  return (isNum(row.rootzone_percentile) && Number(row.rootzone_percentile) < 25)
    || (isNum(row.surface_percentile) && Number(row.surface_percentile) < 25)
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

function buildPressureItems(record, evidenceRecord = record) {
  const row = evidenceRecord || record;
  return buildCurrentRiskSentences(row);
}

function renderRainSoilExplanationBlock(row) {
  return '';
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
    ${renderConclusionBlock(options.weatherRecord || record)}
    ${renderImpactScopeBlock(record, options)}
    ${renderWeatherFactsBlock(options.weatherRecord || record, options.weatherTitle || '天气事实')}
    ${renderGrowthStageBlock(stageRecord)}
    ${renderRiskJudgementBlock(record, { isCountry: options.isCountry, evidenceRecord: stageRecord || options.weatherRecord || record })}
    ${options.extraHtml || ''}
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
  const extraHtml = `
    <div class="detail-block">
      <h3>重点地区</h3>
      <div class="region-list">
        ${topRegions.map(row => regionRowButton(row)).join('') || '<p style="color:var(--muted-2);font-size:12px;">该国家当前无可展示地区记录。</p>'}
      </div>
    </div>`;

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
    extraHtml
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
        ${riskBadge(row.risk_level_v3, row.risk_level_v3_cn)}
      </div>
      <div class="subtitle">${esc(cropLabel(row))} ${esc(fmtPct(row.national_share))}</div>
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
            color: '#4b5563',
            weight: 1,
            opacity: 0.82,
            fillColor: riskColor(row.risk_level_v3),
            fillOpacity: 0.6
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
            mouseover: () => layer.setStyle({ weight: 2.2, fillOpacity: 0.72 }),
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
    weight: 1.3,
    fillColor: riskColor(row.risk_level_v3),
    fillOpacity: 0.88
  }).addTo(layers.fallback);
  marker.bindTooltip(regionTooltip(row), { sticky: true });
  marker.on('click', () => showRegionDetail(row));
  return true;
}

function regionTooltip(row) {
  return `
    <div style="min-width:180px;font-size:12px;">
      <b>${esc(shortRegionName(row))}</b> ${riskBadge(row.risk_level_v3, row.risk_level_v3_cn)}
      <div style="margin-top:4px;color:var(--muted);">${esc(cropLabel(row))} ${esc(fmtPct(row.national_share))}</div>
      <div style="margin-top:2px;">${esc(row.risk_reason_cn || riskTypeText(row.risk_type))}</div>
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
      .setContent(buildMapLabel(row, zoom, 'region'))
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
  return '';
}

function regionConclusion(row) {
  const name = shortRegionName(row);
  const label = row.risk_label_v4_cn || row.dominant_map_badge_cn || row.risk_level_v3_cn || '常规监控';
  if (riskNum(row.risk_level_v3) <= 1) return `${name}${cropLabel(row)}当前维持常规监控。`;
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
  if (isNum(row.rootzone_percentile) || isNum(row.surface_percentile) || row.soil_status_cn || row.soil_status_90d_cn) {
    const soilParts = [
      isNum(row.rootzone_percentile) ? `根区 P${Math.round(Number(row.rootzone_percentile))}` : '',
      isNum(row.surface_percentile) ? `表层 P${Math.round(Number(row.surface_percentile))}` : ''
    ].filter(Boolean).join(' · ');
    cards.push(`<div class="evidence-card"><b>土壤湿度</b><strong>${esc(row.soil_status_cn || row.soil_status_90d_cn || soilParts)}</strong>${soilParts && (row.soil_status_cn || row.soil_status_90d_cn) ? `<p>${esc(soilParts)}</p>` : ''}</div>`);
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
  return `<div class="detail-block">
    <h3>核心证据</h3>
    <div class="evidence-grid">${cards.join('')}</div>
  </div>`;
}

function renderRegionStatusBlock(row) {
  return '';
}

function seriesHasValue(series, keys) {
  return Array.isArray(series) && series.some(point => keys.some(key => isNum(point && point[key])));
}

function renderSoilMoistureChartBlock(row) {
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
  const current = countrySelect.value || 'all';
  const countries = new Map();
  store.countryRecords.forEach(row => {
    if (state.crop !== 'all' && row.crop_group !== state.crop) return;
    countries.set(row.country_key, row.country_cn || row.country_key);
  });
  if (state.crop === 'all' || state.crop === 'rapeseed_canola' || state.crop === 'sunflower') {
    countries.set('European Union', '欧盟');
  }
  const options = [...countries.entries()].sort((a, b) => a[1].localeCompare(b[1], 'zh-CN'));
  countrySelect.innerHTML = '<option value="all">全部国家</option>' + options.map(([key, name]) => `<option value="${escAttr(key)}">${esc(name)}</option>`).join('');
  countrySelect.value = options.some(([key]) => key === current) ? current : 'all';
  state.country = countrySelect.value;

  const anomalySelect = document.getElementById('f-label');
  const anomalyValues = new Set();
  store.countryRecords.forEach(row => row.dominant_risk_type && anomalyValues.add(row.dominant_risk_type));
  store.adminRecords.forEach(row => row.risk_type && anomalyValues.add(row.risk_type));
  anomalySelect.innerHTML = '<option value="all">全部异常</option>' + [...anomalyValues].sort().map(value => `<option value="${escAttr(value)}">${esc(riskTypeText(value))}</option>`).join('');
  if (![...anomalySelect.options].some(opt => opt.value === state.anomaly)) state.anomaly = 'all';
  anomalySelect.value = state.anomaly;
}

function bindEvents() {
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
    renderCountryLayer();
  });

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
    renderCountryLayer();
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
    renderCountryLayer();
  });

  document.getElementById('f-label').addEventListener('change', event => {
    state.anomaly = event.target.value;
    renderCountryLayer();
  });

  const dataStatusSelect = document.getElementById('f-data-status');
  if (dataStatusSelect) {
    dataStatusSelect.addEventListener('change', event => {
      state.dataStatus = event.target.value;
      renderCountryLayer();
    });
  }

  document.getElementById('btn-reset').addEventListener('click', () => {
    state = {
      crop: 'all',
      country: 'all',
      risk: 'all',
      anomaly: 'all',
      dataStatus: 'all',
      timeRange: '14d',
      layer: 'country',
      selectedCountry: null,
      selectedCountryCrop: null,
      selectedCountryRecord: null,
      selectedRegionRecord: null
    };
    document.querySelectorAll('.crop-tab').forEach(item => item.classList.toggle('active', item.dataset.crop === 'all'));
    document.querySelectorAll('.risk-tab').forEach(item => item.classList.toggle('active', item.dataset.risk === 'all'));
    if (dataStatusSelect) dataStatusSelect.value = 'all';
    document.getElementById('more-filters').open = false;
    updateTimeRangeUI();
    populateFilters();
    renderCountryLayer();
  });

  document.getElementById('detail-panel').addEventListener('click', event => {
    const row = event.target.closest('[data-region-id]');
    if (!row) return;
    const record = store.adminById.get(row.dataset.regionId);
    if (record) showRegionDetail(record);
  });
}

function setLayerButtons() {
  document.querySelectorAll('.layer-btn').forEach(button => {
    button.classList.toggle('active', button.dataset.layer === state.layer);
  });
  document.getElementById('layer-region').disabled = !state.selectedCountry;
}

function updateOverlay() {
  const title = state.layer === 'country'
    ? '国家层'
    : `${getCountryName(state.selectedCountry)}｜地区层`;
  document.getElementById('overlay-title').textContent = title;
  document.getElementById('ov-main').textContent = mapStats.main;
  document.getElementById('ov-main-label').textContent = state.layer === 'country' ? '国家' : '地区';
  document.getElementById('ov-risk').textContent = mapStats.risk;
  document.getElementById('ov-fallback').textContent = mapStats.fallback;
  const baseStatus = mapStats.fallback
    ? `<div class="map-notice">${esc(mapStats.note)}</div>`
    : esc(mapStats.note);
  const loadWarning = store.loadErrors.length
    ? `<div class="map-notice">部分数据暂不可用：${esc(store.loadErrors.join('；'))}</div>`
    : '';
  document.getElementById('map-status').innerHTML = baseStatus + loadWarning;
}

function bestDataDate() {
  const metaDates = store.siteMeta.map(row => row && (row.generated_at || row.updated_at || row.date)).filter(Boolean);
  const dates = [
    ...metaDates,
    ...store.countryRecords.map(row => row.updated_at),
    ...store.adminRecords.map(row => row.updated_at),
    ...(store.soilTempIndex ? [...store.soilTempIndex.values()].map(row => row.date || row.created_at) : [])
  ].filter(Boolean).sort();
  return dates.length ? String(dates[dates.length - 1]).slice(0, 10) : '-';
}

function updateMetaDate() {
  const date = bestDataDate();
  document.getElementById('meta-date').textContent = date;
  document.getElementById('meta-version').textContent = UI_VERSION;
  document.getElementById('meta-rule').textContent = RULE_VERSION;
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
  const highRisk = eligible.filter(row => riskNumFromCountry(row) >= 3);
  const affectedProduction = highRisk.reduce((sum, row) => sum + (Number(row.total_production_tonnes) || 0), 0);

  const eligibleKeys = new Set(eligible.map(row => `${canonicalCountry(row.country)}::${row.crop_group}`));
  const riskRegions = store.adminRecords.filter(row => eligibleKeys.has(`${row.country_key}::${row.crop_group}`) && riskNum(row.risk_level_v3) >= 3);
  const anomalyWeights = new Map();
  riskRegions.forEach(row => {
    const label = row.anomaly_label || row.anomaly_type || row.risk_reason_cn || formatAnomalyType(row);
    anomalyWeights.set(label, (anomalyWeights.get(label) || 0) + (Number(row.production_tonnes) || 1));
  });
  const anomalyTypes = [...anomalyWeights.entries()].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([label]) => label);

  const forecastRegions = riskRegions.filter(row => row.forecast_signal);
  let reliefWeight = 0;
  let worsenWeight = 0;
  let steadyWeight = 0;
  forecastRegions.forEach(row => {
    const weight = Number(row.production_tonnes) || 1;
    const signal = String(row.forecast_signal || 'unknown');
    if (signal.includes('relief')) reliefWeight += weight;
    else if (signal.includes('worsen') || signal.includes('no_relief')) worsenWeight += weight;
    else steadyWeight += weight;
  });
  let forecastChange = '待接入';
  if (forecastRegions.length) {
    forecastChange = '维持';
    if (reliefWeight > worsenWeight * 1.15) forecastChange = '缓和';
    else if (worsenWeight > reliefWeight * 1.15) forecastChange = '升温';
  }

  return {
    topRisks,
    productionShare: totalProduction > 0 && affectedProduction > 0 ? affectedProduction / totalProduction : null,
    productionNote: totalProduction > 0 && affectedProduction > 0
      ? `重点/显著压力产量 ${fmtProduction(affectedProduction)} / 可量化产量 ${fmtProduction(totalProduction)}`
      : '暂无可量化产量占比',
    anomalyTypes,
    forecastChange,
    forecastNote: forecastRegions.length
      ? `缓和 ${fmtProduction(reliefWeight)} · 升温 ${fmtProduction(worsenWeight)} · 维持 ${fmtProduction(steadyWeight)}`
      : '待接入预报变化'
  };
}

function buildTodayFocus(records) {
  const summary = buildSummaryCards(records);
  return summary.topRisks.map(countryRow => {
    const region = store.adminRecords
      .filter(row => row.country_key === canonicalCountry(countryRow.country) && row.crop_group === countryRow.crop_group)
      .sort((a, b) => riskNum(b.risk_level_v3) - riskNum(a.risk_level_v3) || (Number(b.production_tonnes) || 0) - (Number(a.production_tonnes) || 0))[0];
    const subject = `${countryRow.country_cn || countryRow.country}${CROP_META[countryRow.crop_group] ? CROP_META[countryRow.crop_group].tab : cropLabel(countryRow)}`;
    const regionName = region ? shortRegionName(region) : '';
    const fact = region && (region.current_operation_impact_cn || region.future_yield_impact_cn || region.weather_condition_summary_cn || region.risk_reason_cn);
    return {
      subject,
      text: `${regionName ? `${regionName}：` : ''}${formatPublicText(fact || countryRow.dominant_risk_reason_cn || formatRiskLabel(countryRow))}`
    };
  });
}

function renderTodaySummary() {
  const summary = buildSummaryCards(store.countryRecords);
  const riskList = document.getElementById('summary-risk-list');
  riskList.innerHTML = summary.topRisks.length
    ? summary.topRisks.map(row => `<div class="summary-risk-line"><b>${esc(row.country_cn || row.country)}｜${esc(CROP_META[row.crop_group] ? CROP_META[row.crop_group].tab : cropLabel(row))}</b><span style="color:${riskColor(riskNumFromCountry(row))}">${esc(formatRiskLabel(row))}</span></div>`).join('')
    : '<span style="color:var(--muted);font-weight:500;">暂无显著风险</span>';
  document.getElementById('summary-production-share').textContent = summary.productionShare === null ? '暂无' : fmtPct(summary.productionShare, 1);
  document.getElementById('summary-production-note').textContent = summary.productionNote;
  document.getElementById('summary-anomaly-types').textContent = summary.anomalyTypes.length ? summary.anomalyTypes.join('；') : '暂无显著异常';
  document.getElementById('summary-forecast-change').textContent = summary.forecastChange;
  document.getElementById('summary-forecast-note').textContent = summary.forecastNote;

  const focusItems = buildTodayFocus(store.countryRecords);
  document.getElementById('today-focus-list').innerHTML = focusItems.length
    ? focusItems.map(item => `<div class="today-focus-item"><b>${esc(item.subject)}：</b>${esc(item.text)}</div>`).join('')
    : '<div class="today-focus-item">当前暂无显著产区天气风险，维持常规监控。</div>';
  document.getElementById('sum-date').textContent = `数据 ${bestDataDate()}`;
}

function updateTimeRangeUI() {
  document.querySelectorAll('.time-tab').forEach(button => button.classList.toggle('active', button.dataset.range === state.timeRange));
  const note = document.getElementById('time-range-note');
  if (note) note.textContent = '';
}

async function init() {
  initMap();
  bindEvents();

  const [countryRecords, adminRecords, coverage, euRecords, geojson, cropProgress, soilTemp, regionHistory, siteMeta] = await Promise.all([
    loadJSON('country_crop_risk_latest.json', []),
    loadJSON('admin_region_risk_latest.json', []),
    loadJSON('geo_boundary_coverage.json', []),
    loadJSON('eu_virtual_country_summary.json', []),
    loadJSON('countries.geo.json', { type: 'FeatureCollection', features: [] }),
    loadJSON('crop_progress_latest.json', []),
    loadJSON('soil_temperature_latest.json', []),
    loadJSON('region_history_90d_v1.0d.json', []),
    loadJSON('site_meta.json', [])
  ]);

  prepareData({ countryRecords, adminRecords, coverage, euRecords, geojson, cropProgress, soilTemp, regionHistory, siteMeta });
  updateMetaDate();
  updateTimeRangeUI();
  renderTodaySummary();
  populateFilters();
  renderCountryLayer();
  setTimeout(() => map.invalidateSize(), 500);
}

init().catch(error => {
  console.error('Init failed:', error);
  document.getElementById('map-status').innerHTML = `<span style="color:#b91c1c;">数据加载失败：${esc(error.message)}</span>`;
});
