const DATA_DIR = './data/';

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
  palm: { tab: '棕榈油', label: '棕榈/棕榈油', oil: '棕榈油', color: '#15803d' },
  soybean: { tab: '豆油', label: '大豆/豆油', oil: '豆油', color: '#b45309' },
  rapeseed_canola: { tab: '菜油', label: '菜籽/菜油', oil: '菜油', color: '#2563eb' },
  sunflower: { tab: '葵油', label: '葵籽/葵油', oil: '葵油', color: '#7c3aed' },
  coconut: { tab: '椰子油', label: '椰子/椰子油', oil: '椰子油', color: '#0891b2' }
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
  layer: 'country',
  selectedCountry: null,
  selectedCountryCrop: null,
  selectedCountryRecord: null
};

let store = {
  countryRecords: [],
  adminRecords: [],
  coverage: [],
  euRecords: [],
  geojson: null,
  adminById: new Map()
};

let currentModels = [];
let currentCountryLabelCenters = [];

function isNum(value) {
  return value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value));
}

function fmtDash(value) {
  if (value === null || value === undefined || value === '') return '—';
  return String(value);
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

function countryFromGeoName(name) {
  return GEO_NAME_TO_COUNTRY[name] || name;
}

function cropLabel(record) {
  if (record && record.crop_oil_label_cn) return record.crop_oil_label_cn;
  return CROP_META[record && record.crop_group] ? CROP_META[record.crop_group].label : fmtDash(record && record.crop_group);
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

function firstDateShort(value) {
  const s = fmtDash(value);
  if (s === '—') return '';
  return s.slice(5, 10);
}

async function loadJSON(name) {
  const response = await fetch(DATA_DIR + name);
  if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
  return response.json();
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
  store.countryRecords = raw.countryRecords
    .filter(row => row && row.source_valid_for_frontend !== false)
    .map(row => ({ ...row, country_key: canonicalCountry(row.country) }));

  store.adminRecords = raw.adminRecords
    .filter(row => row && row.source_valid_for_frontend !== false)
    .map(row => ({ ...row, country_key: canonicalCountry(row.country) }));

  store.coverage = raw.coverage.map(row => ({ ...row, country_key: canonicalCountry(row.country) }));
  store.euRecords = raw.euRecords || [];
  store.geojson = raw.geojson;
  store.adminById = new Map(store.adminRecords.map(row => [row.weather_region_id, row]));

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
    if (state.risk !== 'all' && String(riskNumFromCountry(top)) !== state.risk) return;
    if (state.anomaly !== 'all' && !records.some(row => row.dominant_risk_type === state.anomaly)) return;
    models.push({ key, top, records, isEu: false });
  });

  const euAggregates = aggregateEuRecords(state.crop);
  if (euAggregates.length && (state.country === 'all' || state.country === 'European Union')) {
    const top = chooseCountryRecord(euAggregates);
    if (top) {
      const riskOk = state.risk === 'all' || String(riskNumFromCountry(top)) === state.risk;
      const anomalyOk = state.anomaly === 'all' || euAggregates.some(row => row.dominant_risk_type === state.anomaly);
      if (riskOk && anomalyOk) models.push({ key: 'European Union', top, records: euAggregates, isEu: true });
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

function countryLabelHtml(record, zoom) {
  const showDetail = (zoom || 3) >= 4;
  const name = record.country_cn || record.country;
  const sub = showDetail
    ? `<span>${esc(cropLabel(record))} ${esc(fmtProduction(record.total_production_tonnes))}</span>`
    : '';
  return `
    <div class="map-label" style="--oil-color:${cropColor(record.crop_group)}">
      <span class="stripe"></span>
      <div><strong>${esc(name)}</strong>${sub}</div>
    </div>
  `;
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
    note: '国家层按风险着色；圆点仅用于无边界或欧盟虚拟单元。'
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
      .setContent(countryLabelHtml(item.model.top, zoom))
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
    }).setLatLng(center).setContent(countryLabelHtml(model.top, map.getZoom())).addTo(layers.countryLabels);
  }
}

async function selectCountry(model) {
  state.selectedCountry = model.key;
  state.selectedCountryCrop = model.isEu && state.crop === 'all' ? 'all' : (state.crop === 'all' ? model.top.crop_group : state.crop);
  state.selectedCountryRecord = model.top;
  state.country = model.key;
  const select = document.getElementById('f-country');
  if ([...select.options].some(opt => opt.value === model.key)) select.value = model.key;
  state.layer = 'region';
  setLayerButtons();
  showCountryDetail(model.top);
  await renderRegionLayer();
}

function showCountryDetail(record) {
  destroyCharts();
  const countryKey = record.country_key || canonicalCountry(record.country);
  const crop = state.selectedCountryCrop || record.crop_group;
  const regionRecords = countryKey === 'European Union' ? euDisplayRows() : getRegionRecords(countryKey, crop);
  const stackHtml = renderRiskStack(regionRecords);
  const topRegions = regionRecords
    .filter(row => row.weather_region_id)
    .sort((a, b) => riskNum(b.risk_level_v3) - riskNum(a.risk_level_v3) || (Number(b.national_share) || 0) - (Number(a.national_share) || 0))
    .slice(0, 8);

  const conclusionItems = [];
  if (record.current_growth_stage_cn) conclusionItems.push(`生长期：${record.current_growth_stage_cn}`);
  if (record.weather_condition_summary_cn) conclusionItems.push(`天气：${record.weather_condition_summary_cn}`);
  if (record.soil_condition_summary_cn) conclusionItems.push(`土壤：${record.soil_condition_summary_cn}`);
  if (record.production_basis_cn && record.production_impact_cn) conclusionItems.push(`产量影响：${record.production_impact_cn}`);
  if (record.forecast_summary_cn) conclusionItems.push(`展望：${record.forecast_summary_cn}`);

  const disturbed = Number(record.disturbed_production_tonnes) || 0;
  const total = Number(record.total_production_tonnes) || 0;
  const normal = Math.max(0, total - disturbed);
  const disturbedPct = total > 0 ? (disturbed / total * 100).toFixed(1) : '0.0';

  document.getElementById('detail-panel').innerHTML = `
    <div class="detail-header">
      <h2>${esc(record.country_cn || getCountryName(countryKey))}</h2>
      <div class="subtitle">
        ${riskBadge(riskNumFromCountry(record), record.weighted_risk_level_cn)}
        <span class="pill oil-pill" style="--oil-color:${cropColor(record.crop_group)}">${esc(cropLabel(record))}</span>
        <span class="pill">${esc(fmtProduction(record.total_production_tonnes))}</span>
      </div>
    </div>
    <div class="detail-block">
      <h3>产量口径</h3>
      <div class="data-grid cols-3">
        <div class="data-cell"><span class="lbl">地区数</span><span class="val">${esc(fmtInt(record.region_count || regionRecords.length))}</span></div>
        <div class="data-cell"><span class="lbl">口径</span><span class="val">${esc(record.production_basis_cn || '—')}</span></div>
        <div class="data-cell"><span class="lbl">来源</span><span class="val">${esc(record.source_name || '—')}</span></div>
      </div>
    </div>
    <div class="detail-block">
      <h3>风险概览</h3>
      <div class="data-grid">
        <div class="data-cell"><span class="lbl">加权风险</span><span class="val">${esc(fmtNum(record.weighted_risk_score, 2))}</span></div>
        <div class="data-cell"><span class="lbl">主要风险</span><span class="val">${esc(riskTypeText(record.dominant_risk_type))}</span></div>
      </div>
      <div class="disturbed-bar-wrap">
        <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
          <span style="font-size:10px;color:var(--muted-2);letter-spacing:0.2px;">受扰产量</span>
          <span style="font-size:10px;font-weight:600;color:#1e2530;">${esc(fmtProduction(disturbed))} (${disturbedPct}%)</span>
        </div>
        <div class="disturbed-bar">
          <div class="disturbed-bar-fill" style="width:${disturbedPct}%;background:${riskColor(riskNumFromCountry(record))};"></div>
        </div>
        <div class="disturbed-bar-labels">
          <span>受扰 ${esc(fmtProduction(disturbed))}</span>
          <span>正常 ${esc(fmtProduction(normal))}</span>
        </div>
      </div>
      <div style="margin-top:10px;">${stackHtml}</div>
    </div>
    <div class="detail-block">
      <h3>核心结论</h3>
      <ol>${conclusionItems.map(item => `<li>${esc(item)}</li>`).join('') || '<li style="color:var(--muted-2);">暂无结论摘要</li>'}</ol>
    </div>
    <div class="detail-block">
      <h3>主要地区</h3>
      <div class="region-list">
        ${topRegions.map(row => regionRowButton(row)).join('') || '<p style="color:var(--muted-2);font-size:12px;">该国家当前无可展示地区记录。</p>'}
      </div>
    </div>
  `;
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
      if (fallbackCount) notice = `${getCountryName(countryKey)} 有 ${fallbackCount} 个地区未匹配到 admin1 边界，已使用质心 fallback。`;
    }
  }

  if (!matchedCount) {
    records.forEach(row => {
      if (renderRegionFallbackMarker(row)) fallbackCount += 1;
    });
    notice = `${getCountryName(countryKey)} 暂无 admin1 polygon，地区层使用质心 fallback。`;
  }

  refreshRegionLabels(records);
  const bounds = boundsFor(['region', 'fallback']);
  if (bounds.isValid()) map.fitBounds(bounds.pad(0.16));
  else map.setView(countryCentroid(countryKey) || [16, 25], 5);

  mapStats = {
    main: records.length,
    risk: records.filter(row => riskNum(row.risk_level_v3) >= 3).length,
    fallback: fallbackCount,
    note: notice || `${getCountryName(countryKey)} 地区层使用 admin1 polygon。`
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
  const share = row.eu_share !== undefined ? row.eu_share : row.national_share;
  const badge = row.dominant_map_badge_cn || '';
  const badgeHtml = badge
    ? '<span style="font-size:8.5px;padding:0 4px;border-radius:2px;background:rgba(0,0,0,0.06);color:var(--muted);margin-left:3px;">' + esc(badge) + '</span>'
    : '';
  return `
    <div class="map-label" style="--oil-color:${cropColor(row.crop_group)}">
      <span class="stripe"></span>
      <div><strong>${esc(shortRegionName(row))}</strong>${badgeHtml}<span>${esc(cropLabel(row))}</span></div>
    </div>
  `;
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
    note: '欧盟为 virtual country；地区层展示成员国，不生成欧盟整体假边界。'
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
  const records = findCropProgress(row);
  if (!records || records.length === 0) {
    return `<div class="detail-block"><h3>作物进度</h3><p style="color:var(--muted-2);font-size:12px;">当前地区暂无作物进度数据</p></div>`;
  }
  const calendarStage = row.calendar_growth_stage_code || row.growth_stage_code || '—';
  const resolvedStage = row.resolved_growth_stage || calendarStage;
  const progressStage = row.progress_resolved_growth_stage || '—';
  const sourceDateForStage = row.progress_latest_source_date || records[0].source_date || '—';
  const stageEvidence = row.progress_evidence_cn || '';
  const progressUsed = row.progress_used_in_risk_label === true;
  const stageResolutionText = progressUsed
    ? `作物进度已用于生长期修正：作物历阶段 ${calendarStage}，进度修正为 ${resolvedStage}。依据：${stageEvidence || row.progress_stage_basis || '可用真实进度记录'}`
    : `作物进度暂未用于生长期修正：${stageEvidence || '数据为样例/来源未激活/数据过期。'}`;
  const stageResolutionColor = progressUsed ? '#166534' : '#6b7280';
  const stageResolutionBg = progressUsed ? '#ecfdf3' : '#f8fafc';
  const rows = records.map(r => {
    const metricCn = CROP_PROGRESS_METRIC_CN[r.stage_metric] || r.stage_metric || '—';
    const pct = isNum(r.progress_pct) ? Math.round(Number(r.progress_pct)) + '%' : '—';
    const delay = r.delay_level || 'unknown';
    const delayCn = DELAY_LEVEL_CN[delay] || '待确认';
    const delayColor = DELAY_LEVEL_COLOR[delay] || '#94a3b8';
    const yoy = isNum(r.yoy_diff_pp) ? (Number(r.yoy_diff_pp) >= 0 ? '+' : '') + Number(r.yoy_diff_pp).toFixed(1) + 'pp' : '—';
    const avg5y = isNum(r.avg_5y_diff_pp) ? (Number(r.avg_5y_diff_pp) >= 0 ? '+' : '') + Number(r.avg_5y_diff_pp).toFixed(1) + 'pp' : '—';
    const seasonType = r.season_type === 'first_crop' ? '(一季)' : r.season_type === 'second_crop' ? '(二季)' : '';
    const sampleBadge = r.is_sample ? ' <span style="background:#fef3c7;color:#92400e;padding:1px 5px;border-radius:3px;font-size:10px;">样例</span>' : '';
    return `<div class="data-grid cols-4" style="margin-bottom:6px;padding:4px 0;border-bottom:1px solid rgba(0,0,0,0.04);">
      <div class="data-cell"><span class="lbl">${esc(metricCn)}${esc(seasonType)}${sampleBadge}</span><span class="val">${esc(pct)}</span></div>
      <div class="data-cell"><span class="lbl">节奏</span><span class="val" style="color:${delayColor};font-weight:600;">${esc(delayCn)}</span></div>
      <div class="data-cell"><span class="lbl">同比</span><span class="val">${esc(yoy)}</span></div>
      <div class="data-cell"><span class="lbl">vs 5年均值</span><span class="val">${esc(avg5y)}</span></div>
    </div>`;
  }).join('');
  const srcDate = records[0].source_date || '—';
  const srcName = records[0].source_name || '';
  const allSample = records.every(r => r.is_sample);
  const anyReal = records.some(r => !r.is_sample);
  const dataStatus = records[0].data_status || '';
  const notUsable = records.some(r => r.usable_for_stage_resolution === false);
  const sampleNotice = allSample
    ? '<div style="color:#92400e;background:#fef3c7;padding:4px 8px;border-radius:4px;margin-top:4px;font-size:11px">以上为样例数据，未用于风险判断</div>'
    : (anyReal && records.some(r => r.is_sample)
      ? '<div style="color:#92400e;background:#fef3c7;padding:4px 8px;border-radius:4px;margin-top:4px;font-size:11px">部分地区为样例数据</div>'
      : '');
  return `<div class="detail-block">
    <h3>作物进度</h3>
    <div style="color:${stageResolutionColor};background:${stageResolutionBg};padding:6px 8px;border-radius:4px;margin-bottom:8px;font-size:11.5px;line-height:1.45;">
      ${esc(stageResolutionText)}
      <div style="margin-top:3px;color:var(--muted);font-size:10.5px;">原作物历阶段 ${esc(calendarStage)} · 进度阶段 ${esc(progressStage)} · 修正后 ${esc(resolvedStage)} · 数据日期 ${esc(sourceDateForStage)}</div>
    </div>
    ${rows}
    ${sampleNotice}
    ${notUsable && !allSample ? '<div style="color:#6b7280;font-size:11px;margin-top:2px">暂未用于生长期修正</div>' : ''}
    <p style="margin-top:6px;color:var(--muted);font-size:10.5px;">来源：${esc(srcName)} · ${esc(srcDate)}</p>
  </div>`;
}

function renderSoilTemperatureBlock(row) {
  const st = store.soilTempIndex ? store.soilTempIndex.get(row.weather_region_id) : null;
  if (!st) {
    return `<div class="detail-block"><h3>土壤温度</h3><p style="color:var(--muted-2);font-size:12px;">暂无土壤温度数据</p></div>`;
  }

  // e3a_patch2: check data_status / is_synthetic
  const dataStatus = st.data_status || '';
  const isSynthetic = st.is_synthetic === true || dataStatus === 'synthetic_test';
  const isRecentOnly = dataStatus === 'real_recent_only';
  const isRealActive = dataStatus === 'real_active';

  const t0  = isNum(st.soil_temp_0_7cm_mean_c) ? Number(st.soil_temp_0_7cm_mean_c).toFixed(1) + '°C' : '—';
  const t28 = isNum(st.soil_temp_7_28cm_mean_c) ? Number(st.soil_temp_7_28cm_mean_c).toFixed(1) + '°C' : '—';
  const p0  = isNum(st.soil_temp_0_7cm_percentile) ? 'P' + Math.round(Number(st.soil_temp_0_7cm_percentile)) : '—';
  const p28 = isNum(st.soil_temp_7_28cm_percentile) ? 'P' + Math.round(Number(st.soil_temp_7_28cm_percentile)) : '—';
  const anom0  = isNum(st.soil_temp_0_7cm_anomaly_c) ? (Number(st.soil_temp_0_7cm_anomaly_c) >= 0 ? '+' : '') + Number(st.soil_temp_0_7cm_anomaly_c).toFixed(1) + '°C' : '—';
  const coldDays = isNum(st.cold_soil_days_7d) ? Math.round(Number(st.cold_soil_days_7d)) : 0;
  const hotDays  = isNum(st.hot_soil_days_7d)  ? Math.round(Number(st.hot_soil_days_7d))  : 0;
  const signalCn = st.soil_temp_signal_cn || '—';
  const evidence = st.evidence_cn || '';
  const baseline = st.baseline_period || '—';
  const conf     = st.signal_confidence || '—';
  const confColor = conf === 'high' ? '#166534' : conf === 'medium' ? '#92400e' : '#6b7280';
  const signalColor = (() => {
    const s = st.soil_temp_signal || '';
    if (s.includes('extreme_cold')) return '#1e40af';
    if (s.includes('cold'))        return '#2563eb';
    if (s.includes('hot'))         return '#c0392b';
    if (s.includes('warm'))        return '#e67e22';
    return '#374151';
  })();
  const srcDate = st.date || '—';

  // e3a_patch2: status-specific notices
  let statusNotice = '';
  if (isSynthetic) {
    statusNotice = `<div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:4px;padding:6px 8px;margin-bottom:6px;font-size:11px;color:#92400e;">
      ⚠ 合成测试数据，仅用于验证流程，未用于风险判断。</div>`;
  } else if (isRecentOnly) {
    statusNotice = `<div style="background:#eff6ff;border:1px solid #93c5fd;border-radius:4px;padding:6px 8px;margin-bottom:6px;font-size:11px;color:#1e40af;">
      已有近期真实土壤温度，历史同期基线待补，暂不生成正式分位信号。</div>`;
  }

  // Bottom note for real data
  let bottomNote = '';
  if (isRealActive) {
    bottomNote = `<p style="margin-top:4px;color:var(--muted);font-size:10px;font-style:italic;">土壤温度当前仅作为辅助观察，本版未直接参与 risk_label 判断。</p>`;
  } else if (isSynthetic) {
    bottomNote = `<p style="margin-top:4px;color:var(--muted);font-size:10px;font-style:italic;">以上数值为测试数据，不反映实际土壤状况。</p>`;
  }

  return `<div class="detail-block">
    <h3>土壤温度</h3>
    ${statusNotice}
    <div class="data-grid cols-3">
      <div class="data-cell"><span class="lbl">0-7cm</span><span class="val">${esc(t0)}</span></div>
      <div class="data-cell"><span class="lbl">7-28cm</span><span class="val">${esc(t28)}</span></div>
      <div class="data-cell"><span class="lbl">信号</span><span class="val" style="color:${signalColor};font-weight:600;">${esc(signalCn)}</span></div>
    </div>
    <div class="data-grid cols-4" style="margin-top:4px;">
      <div class="data-cell"><span class="lbl">0-7cm分位</span><span class="val">${esc(p0)}</span></div>
      <div class="data-cell"><span class="lbl">7-28cm分位</span><span class="val">${esc(p28)}</span></div>
      <div class="data-cell"><span class="lbl">距平</span><span class="val">${esc(anom0)}</span></div>
      <div class="data-cell"><span class="lbl">偏冷/偏热天</span><span class="val">${coldDays}/${hotDays}</span></div>
    </div>
    <p style="margin-top:6px;color:var(--muted);font-size:11px;line-height:1.4;">${esc(evidence)}</p>
    <div style="margin-top:4px;display:flex;gap:8px;align-items:center;font-size:10.5px;">
      <span style="color:var(--muted);">基线 ${esc(baseline)}</span>
      <span style="color:${confColor};font-weight:600;">置信 ${esc(conf)}</span>
      <span style="color:var(--muted);">数据 ${esc(srcDate)}</span>
    </div>
    ${bottomNote}
  </div>`;
}

function renderRiskTagsBlock(row) {
  const tags = Array.isArray(row.risk_tags) ? row.risk_tags : [];
  const badge = row.dominant_map_badge_cn || '';
  const domLevel = row.dominant_risk_level || 0;
  const domType = row.dominant_impact_type || '';
  const evidence = row.risk_evidence_cn || '';
  const prodImpact = row.production_impact_cn || '';
  const curOpImpact = row.current_operation_impact_cn || '';
  const futYieldImpact = row.future_yield_impact_cn || '';
  const isPerennial = row.crop_group === 'palm' || row.crop_group === 'coconut';

  // Risk level color helper
  function lvlColor(lv) {
    if (lv >= 4) return '#c0392b';
    if (lv >= 3) return '#e67e22';
    if (lv >= 2) return '#d4a017';
    if (lv >= 1) return '#27ae60';
    return 'var(--muted-2)';
  }
  function lvlName(lv) {
    if (lv >= 4) return '极高';
    if (lv >= 3) return '高';
    if (lv >= 2) return '中';
    if (lv >= 1) return '低';
    return '—';
  }
  function dirName(d) {
    if (d === 'supportive') return '利好';
    if (d === 'adverse') return '不利';
    if (d === 'mixed') return '混合';
    return d || '—';
  }

  // Dominant badge header
  let headerHtml = '';
  if (badge) {
    headerHtml = '<div style="margin-bottom:10px;">'
      + '<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:700;color:#fff;background:' + lvlColor(domLevel) + ';margin-right:6px;">' + esc(badge) + '</span>'
      + '<span style="font-size:11px;color:var(--muted);">' + esc(lvlName(domLevel)) + ' · ' + esc(dirName(tags.length ? tags[0].direction : '')) + '</span>'
      + '</div>';
  }

  // Evidence line
  let evidenceHtml = '';
  if (evidence) {
    evidenceHtml = '<p style="font-size:11px;color:var(--muted);margin:0 0 8px 0;">' + esc(evidence) + '</p>';
  }

  // Production impact summary
  let impactHtml = '';
  if (prodImpact && prodImpact !== '暂无明显影响') {
    impactHtml = '<p style="font-size:11.5px;margin:0 0 6px 0;"><span style="color:var(--muted);">生产影响：</span>' + esc(prodImpact) + '</p>';
  }

  // Perennial: separate current operation and future yield
  if (isPerennial) {
    if (curOpImpact) {
      impactHtml += '<p style="font-size:11.5px;margin:0 0 4px 0;"><span style="color:var(--muted);">当前作业：</span>' + esc(curOpImpact) + '</p>';
    }
    if (futYieldImpact) {
      impactHtml += '<p style="font-size:11.5px;margin:0 0 6px 0;"><span style="color:var(--muted);">远期产量：</span>' + esc(futYieldImpact) + '</p>';
    }
  }

  // Tag list (max 6 tags)
  let tagsHtml = '';
  if (tags.length > 0) {
    const shown = tags.slice(0, 6);
    tagsHtml = '<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:4px;">';
    for (const t of shown) {
      const tColor = lvlColor(t.risk_level || 0);
      const tLabel = esc(t.risk_label_cn || '');
      const tStage = esc(t.growth_stage_cn || t.growth_stage_code || '');
      const tConf = esc(t.confidence || '');
      tagsHtml += '<span style="display:inline-flex;align-items:center;gap:3px;padding:2px 7px;border-radius:3px;font-size:10.5px;border:1px solid ' + tColor + '33;background:' + tColor + '0d;">'
        + '<span style="width:6px;height:6px;border-radius:50%;background:' + tColor + ';"></span>'
        + '<span style="font-weight:600;color:' + tColor + ';">' + tLabel + '</span>'
        + '<span style="color:var(--muted-2);font-size:9.5px;">' + tStage + ' · ' + tConf + '</span>'
        + '</span>';
    }
    if (tags.length > 6) {
      tagsHtml += '<span style="font-size:10px;color:var(--muted);padding:2px 4px;">+' + (tags.length - 6) + '</span>';
    }
    tagsHtml += '</div>';
  }

  // E3B: soil temperature auxiliary note
  let soilTempHtml = '';
  if (row.soil_temp_used_in_risk_label && row.soil_temp_evidence_cn) {
    soilTempHtml = '<p style="font-size:11px;color:var(--muted);margin:6px 0 0 0;padding:4px 8px;background:rgba(59,130,246,0.06);border-radius:4px;">'
      + '<span style="font-weight:600;color:#3b82f6;">土壤温度辅助：</span>'
      + esc(row.soil_temp_evidence_cn) + '</p>';
  }

  // Empty state
  if (!badge && tags.length === 0 && !impactHtml) {
    return '<div class="detail-block"><h3>风险标签</h3>'
      + '<p style="color:var(--muted-2);font-size:11.5px;margin:0;">当前无明显风险标签</p>'
      + soilTempHtml + '</div>';
  }

  return '<div class="detail-block"><h3>风险标签</h3>'
    + headerHtml + evidenceHtml + impactHtml + tagsHtml + soilTempHtml + '</div>';
}

function showRegionDetail(row) {
  destroyCharts();
  const conclusion = [
    row.risk_reason_cn ? `核心风险：${row.risk_reason_cn}` : '',
    row.current_growth_stage_cn ? `生长期：${row.current_growth_stage_cn}` : '',
    row.weather_condition_summary_cn ? `天气：${row.weather_condition_summary_cn}` : '',
    row.soil_condition_summary_cn ? `土壤：${row.soil_condition_summary_cn}` : '',
    row.production_impact_cn ? `产量影响：${row.production_impact_cn}` : '',
    row.forecast_summary_cn ? `展望：${row.forecast_summary_cn}` : ''
  ].filter(Boolean);

  const soilStatus = esc(row.soil_status_cn || '—');
  const rzPct = isNum(row.rootzone_percentile) ? Math.round(Number(row.rootzone_percentile)) : null;
  const sfPct = isNum(row.surface_percentile) ? Math.round(Number(row.surface_percentile)) : null;

  document.getElementById('detail-panel').innerHTML = `
    <div class="detail-header">
      <h2>${esc(shortRegionName(row))}</h2>
      <div class="subtitle">
        ${riskBadge(row.risk_level_v3, row.risk_level_v3_cn)}
        <span class="pill oil-pill" style="--oil-color:${cropColor(row.crop_group)}">${esc(cropLabel(row))}</span>
        <span class="pill">全国占比 ${esc(fmtPct(row.national_share))}</span>
      </div>
    </div>
    <div class="detail-block">
      <h3>核心结论</h3>
      <ol>${conclusion.map(item => `<li>${esc(item)}</li>`).join('') || '<li style="color:var(--muted-2);">暂无结论摘要</li>'}</ol>
      <div class="data-grid" style="margin-top:10px;">
        <div class="data-cell"><span class="lbl">产量</span><span class="val">${esc(fmtProduction(row.production_tonnes))}</span></div>
        <div class="data-cell"><span class="lbl">全国占比</span><span class="val">${esc(fmtPct(row.national_share))}</span></div>
      </div>
    </div>
    ${renderRiskTagsBlock(row)}
    ${renderCropProgressBlock(row)}
    <div class="detail-block">
      <h3>土壤情况</h3>
      <div class="data-grid cols-3">
        <div class="data-cell"><span class="lbl">状态</span><span class="val">${soilStatus}</span></div>
        <div class="data-cell"><span class="lbl">根区分位</span><span class="val">${rzPct !== null ? rzPct : '—'}</span></div>
        <div class="data-cell"><span class="lbl">表层分位</span><span class="val">${sfPct !== null ? sfPct : '—'}</span></div>
      </div>
      <div class="chart-box"><canvas id="chart-soil"></canvas></div>
    </div>
    ${renderSoilTemperatureBlock(row)}
    <div class="detail-block">
      <h3>累积降雨</h3>
      <div class="data-grid">
        <div class="data-cell"><span class="lbl">近30天实际</span><span class="val">${esc(fmtNum(row.precip_30d_actual, 0, ' mm'))}</span></div>
        <div class="data-cell"><span class="lbl">近30天常年</span><span class="val">${esc(fmtNum(row.precip_30d_normal, 0, ' mm'))}</span></div>
      </div>
      <div class="chart-box compact"><canvas id="chart-precip-cum"></canvas></div>
    </div>
    <div class="detail-block">
      <h3>降雨距平 + 温度距平</h3>
      <div class="two-charts">
        <div>
          <div class="chart-title">30日降雨距平（近90天）</div>
          <div class="chart-box compact"><canvas id="chart-rain-anomaly"></canvas></div>
        </div>
        <div>
          <div class="chart-title">最高温距平（近90天）</div>
          <div class="chart-box compact"><canvas id="chart-temp-anomaly"></canvas></div>
        </div>
      </div>
    </div>
    <div class="detail-block">
      <h3>未来预报</h3>
      <div class="data-grid">
        <div class="data-cell"><span class="lbl">7天降雨</span><span class="val">${esc(fmtNum(row.forecast_7d_precip, 0, ' mm'))}</span></div>
        <div class="data-cell"><span class="lbl">16天降雨</span><span class="val">${esc(fmtNum(row.forecast_16d_precip, 0, ' mm'))}</span></div>
      </div>
      <p style="margin-top:6px;color:var(--muted);font-size:11.5px;">${esc(forecastReliefText(row))}</p>
      <div class="chart-box"><canvas id="chart-forecast"></canvas></div>
    </div>
  `;

  renderRegionCharts(row);
}

function forecastReliefText(row) {
  if (row.forecast_summary_cn) return row.forecast_summary_cn;
  if (isNum(row.precip_30d_anomaly_mm) && Number(row.precip_30d_anomaly_mm) < -20) {
    if (isNum(row.forecast_16d_precip) && Number(row.forecast_16d_precip) >= 30) return '未来降雨可能缓解前期水分缺口。';
    return '未来补水不足，水分压力可能维持或加重。';
  }
  if (isNum(row.precip_30d_anomaly_mm) && Number(row.precip_30d_anomaly_mm) > 30) return '前期降雨偏多，需关注后续偏湿延续。';
  return '未来天气对当前风险的方向性影响不明确。';
}

function renderRegionCharts(row) {
  renderSoilChart(row.soil_rootzone_percentile_90d_series || []);
  renderPrecipCumChart(row.precip_30d_anomaly_90d_series || []);
  renderRainAnomalyChart(row.precip_30d_anomaly_90d_series || []);
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

function renderRainAnomalyChart(series) {
  const canvas = document.getElementById('chart-rain-anomaly');
  if (!canvas || !series.length) return;
  const values = chartValues(series, 'precip_30d_anomaly_mm');
  charts.rainAnomaly = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: chartLabels(series),
      datasets: [{
        label: '降雨距平',
        data: values,
        backgroundColor: values.map(v => v === null ? 'rgba(148,163,184,0.15)' : v < 0 ? 'rgba(192,57,43,0.45)' : 'rgba(37,99,235,0.4)'),
        borderRadius: 1,
        barThickness: 2.5
      }]
    },
    options: chartBaseOptions({ yTitle: 'mm', showXAxis: true })
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
    grid: { color: 'rgba(0,0,0,0.04)', drawBorder: false },
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

  document.getElementById('f-country').addEventListener('change', event => {
    state.country = event.target.value;
    state.selectedCountry = null;
    state.selectedCountryCrop = null;
    state.selectedCountryRecord = null;
    renderCountryLayer();
  });

  document.getElementById('f-level').addEventListener('change', event => {
    state.risk = event.target.value;
    renderCountryLayer();
  });

  document.getElementById('f-label').addEventListener('change', event => {
    state.anomaly = event.target.value;
    renderCountryLayer();
  });

  document.getElementById('btn-reset').addEventListener('click', () => {
    state = {
      crop: 'all',
      country: 'all',
      risk: 'all',
      anomaly: 'all',
      layer: 'country',
      selectedCountry: null,
      selectedCountryCrop: null,
      selectedCountryRecord: null
    };
    document.querySelectorAll('.crop-tab').forEach(item => item.classList.toggle('active', item.dataset.crop === 'all'));
    document.getElementById('f-level').value = 'all';
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
  document.getElementById('map-status').innerHTML = mapStats.fallback
    ? `<div class="map-notice">${esc(mapStats.note)}</div>`
    : esc(mapStats.note);
}

function updateMetaDate() {
  const dates = [
    ...store.countryRecords.map(row => row.updated_at),
    ...store.adminRecords.map(row => row.updated_at)
  ].filter(Boolean).sort();
  document.getElementById('meta-date').textContent = dates.length ? dates[dates.length - 1].slice(0, 10) : '-';
}

async function init() {
  initMap();
  bindEvents();

  const [countryRecords, adminRecords, coverage, euRecords, geojson, cropProgress, soilTemp] = await Promise.all([
    loadJSON('country_crop_risk_latest.json'),
    loadJSON('admin_region_risk_latest.json'),
    loadJSON('geo_boundary_coverage.json'),
    loadJSON('eu_virtual_country_summary.json'),
    loadJSON('countries.geo.json'),
    loadJSON('crop_progress_latest.json').catch(() => []),
    loadJSON('soil_temperature_latest.json').catch(() => [])
  ]);

  prepareData({ countryRecords, adminRecords, coverage, euRecords, geojson, cropProgress, soilTemp });
  updateMetaDate();
  populateFilters();
  renderCountryLayer();
  setTimeout(() => map.invalidateSize(), 500);
}

init().catch(error => {
  console.error('Init failed:', error);
  document.getElementById('map-status').innerHTML = `<span style="color:#b91c1c;">数据加载失败：${esc(error.message)}</span>`;
});
