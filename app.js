const DATA_DIR = './data/';
let allData = {};
let geoJsonLayer = null;
let markerLayer = [];
let admin1Layer = null;
let map;
let charts = {};
let currentView = 'global';
let selectedCountry = null;
let selectedCrop = 'all';
let debugInfo = {
  latestCount: 0,
  geojsonFeatures: 0,
  matchedCountries: 0,
  renderedMarkers: 0,
  geojsonError: null,
  admin1Loaded: false,
  admin1FeatureCount: 0,
  admin1MatchedCount: 0,
  admin1FallbackNames: [],
  currentLevel: 'country'
};

const CN = {
  crop: { palm:'棕榈油', soybean:'豆油', rapeseed_canola:'菜油', sunflower:'葵油', coconut:'椰子油' },
  label: {
    rainfall_deficit:'降雨显著偏少', rainfall_low:'降雨偏少', excessive_rain:'降雨偏多/过湿',
    high_temperature:'高温异常', normal:'正常',
    'rainfall_deficit|high_temperature':'降雨偏少+高温',
    'rainfall_low|high_temperature':'降雨偏少+高温',
    'excessive_rain|high_temperature':'降雨偏多+高温',
    insufficient_data:'数据积累中'
  },
  level: { 
    high:'重点关注', medium:'一般关注', normal:'正常监控', low:'低风险',
    stress:'显著压力', attention:'重点关注', watch:'一般关注'
  },
  country: {
    'Indonesia':'印度尼西亚', 'Malaysia':'马来西亚', 'Australia':'澳大利亚',
    'Canada':'加拿大', 'United States':'美国', 'United States of America':'美国',
    'Brazil':'巴西', 'Argentina':'阿根廷', 'Ukraine':'乌克兰', 'Russia':'俄罗斯',
    'France':'法国', 'Germany':'德国', 'Poland':'波兰', 'Romania':'罗马尼亚',
    'Kazakhstan':'哈萨克斯坦', 'China':'中国', 'India':'印度', 'Thailand':'泰国',
    'Nigeria':'尼日利亚', 'Colombia':'哥伦比亚', 'Guatemala':'危地马拉',
    'Turkey':'土耳其', 'Türkiye':'土耳其', 'Hungary':'匈牙利', 'Bulgaria':'保加利亚',
    'Italy':'意大利', 'United Kingdom':'英国', 'Belarus':'白俄罗斯', 'Czechia':'捷克',
    'Spain':'西班牙', 'Denmark':'丹麦', 'Bangladesh':'孟加拉国', 'South Africa':'南非',
    'Serbia':'塞尔维亚', 'Paraguay':'巴拉圭', 'Peru':'秘鲁', 'Mexico':'墨西哥',
    'Ecuador':'厄瓜多尔', 'Honduras':'洪都拉斯', 'Costa Rica':'哥斯达黎加',
    'Philippines':'菲律宾', 'Venezuela':'委内瑞拉', 'Tanzania':'坦桑尼亚',
    'Papua New Guinea':'巴布亚新几内亚', 'Cameroon':'喀麦隆', 'Ghana':'加纳',
    'Cote d\'Ivoire':'科特迪瓦', 'DR Congo':'刚果(金)', 'Guinea':'几内亚',
    'Benin':'贝宁', 'Gabon':'加蓬', 'Republic of Moldova':'摩尔多瓦',
    'Lithuania':'立陶宛'
  }
};

// GeoJSON name -> our country name mapping
const GEOJSON_NAME_MAP = {
  'United States of America': 'United States',
  'USA': 'United States',
  'Türkiye': 'Turkey',
  'Côte d\'Ivoire': 'Cote d\'Ivoire',
  'Ivory Coast': 'Cote d\'Ivoire',
  'Democratic Republic of the Congo': 'DR Congo',
  'Moldova': 'Republic of Moldova'
};

// admin1 GeoJSON shapeName -> our data admin1 name mapping
const ADMIN1_NAME_MAP = {
  // Indonesia: English -> Indonesian native names used in data
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
  // Malaysia
  'Penang': 'Pulau Pinang',
  'Johore': 'Johor',
  'Malacca': 'Melaka'
};

// Reverse lookup: our data admin1 -> GeoJSON shapeName
const ADMIN1_NAME_RMAP = {};
for (const [k, v] of Object.entries(ADMIN1_NAME_MAP)) {
  ADMIN1_NAME_RMAP[v] = k;
}

// Admin1 GeoJSON file mapping
const ADMIN1_FILES = {
  'Indonesia': 'admin1_geojson/indonesia_admin1.geojson',
  'Malaysia': 'admin1_geojson/malaysia_admin1.geojson',
  'United States': 'admin1_geojson/united_states_admin1.geojson',
  'Canada': 'admin1_geojson/canada_admin1.geojson',
  'Australia': 'admin1_geojson/australia_admin1.geojson'
};

function fmt(v) { return (v===null||v===undefined||v===''||v==='nan')?'—':v; }
function fmtNum(v,d=1){ return (v===null||v===undefined||isNaN(v))?'—':Number(v).toFixed(d); }
function fmtProduction(v){
  if(v===null||v===undefined||isNaN(v)) return '产量权重待接入';
  if(v >= 100000000) return (v/100000000).toFixed(2) + '亿吨';
  if(v >= 10000) return (v/10000).toFixed(2) + '万吨';
  return v.toFixed(0) + '吨';
}
function fmtShare(v){
  if(v===null||v===undefined||isNaN(v)) return '产量权重待接入';
  return (v*100).toFixed(1) + '%';
}
function cnCrop(c){ return CN.crop[c]||c||'—'; }
function cnLabel(l){ return CN.label[l]||l||'—'; }
function cnLevel(l){ return CN.level[l]||l||'—'; }
function cnCountry(c){ return CN.country[c]||c||'—'; }
function colorByLevel(level){
  if(level==='high') return '#dc2626';
  if(level==='medium') return '#ea580c';
  if(level==='normal') return '#16a34a';
  return '#64748b';
}

async function loadJSON(name){
  const r = await fetch(DATA_DIR+name);
  if(!r.ok) throw new Error(`${name}: HTTP ${r.status}`);
  return r.json();
}

function safeLoadJSON(name){
  return loadJSON(name).catch(e=>{
    console.warn('Failed to load', name, e.message);
    return null;
  });
}

function initMap(){
  const container = document.getElementById('map');
  container.style.width = '100%';
  container.style.height = '100%';
  map = L.map('map',{zoomControl:false}).setView([15,100],3);
  L.control.zoom({position:'topright'}).addTo(map);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{
    attribution:'&copy; OpenStreetMap &copy; CARTO', subdomains:'abcd', maxZoom:19
  }).addTo(map);
  // Fix for flex layout: invalidate size after container is properly sized
  requestAnimationFrame(()=>{ map.invalidateSize(); });
  setTimeout(()=>{ map.invalidateSize(); }, 300);
  setTimeout(()=>{ map.invalidateSize(); }, 800);
}

function getFilteredPoints(){
  const country = document.getElementById('f-country').value;
  const level = document.getElementById('f-level').value;
  const label = document.getElementById('f-label').value;
  return allData.latest.filter(pt=>{
    const lev = pt.anomaly_level||'normal';
    if(selectedCrop!=='all' && pt.crop_group!==selectedCrop) return false;
    if(country!=='all' && pt.country!==country) return false;
    if(level!=='all' && lev!==level) return false;
    if(label!=='all' && pt.anomaly_label!==label) return false;
    return true;
  });
}

function getCountryRiskLevel(country, crop){
  const pts = allData.latest.filter(pt=>pt.country===country && (crop==='all'||pt.crop_group===crop));
  if(!pts.length) return 'normal';
  const high = pts.filter(p=>(p.anomaly_level||'normal')==='high').length;
  const medium = pts.filter(p=>(p.anomaly_level||'normal')==='medium').length;
  if(high>0) return 'high';
  if(medium>0) return 'medium';
  return 'normal';
}

function normalizeGeojsonName(name){
  return GEOJSON_NAME_MAP[name] || name;
}

// Normalize admin1 name: GeoJSON shapeName -> our data admin1 name
function normalizeAdmin1Name(name, country){
  if(ADMIN1_NAME_MAP[name]) return ADMIN1_NAME_MAP[name];
  // US: our data uses ALL CAPS, GeoJSON uses Title Case
  if(country === 'United States') return name.toUpperCase();
  return name;
}

// Reverse: our data admin1 -> GeoJSON shapeName
function reverseAdmin1Name(name, country){
  if(ADMIN1_NAME_RMAP[name]) return ADMIN1_NAME_RMAP[name];
  // US: our data uses ALL CAPS
  if(country === 'United States') {
    const titleCase = name.split(' ').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ');
    return titleCase;
  }
  return name;
}

// Get admin1 risk level for coloring
function getAdmin1RiskLevel(country, admin1Name, crop){
  const pts = allData.latest.filter(pt => 
    pt.country === country && pt.admin1 === admin1Name && (crop === 'all' || pt.crop_group === crop)
  );
  if(!pts.length) return null;
  const high = pts.filter(p => (p.anomaly_level || 'normal') === 'high').length;
  const medium = pts.filter(p => (p.anomaly_level || 'normal') === 'medium').length;
  if(high > 0) return 'high';
  if(medium > 0) return 'medium';
  return 'normal';
}

// Load and render admin1 GeoJSON for a country
async function loadAndRenderAdmin1(country){
  // Clean up previous admin1 layer
  if(admin1Layer){ map.removeLayer(admin1Layer); admin1Layer = null; }
  
  const filePath = ADMIN1_FILES[country];
  if(!filePath){
    console.log('[DEBUG] No admin1 GeoJSON file for:', country);
    debugInfo.admin1Loaded = false;
    return false;
  }
  
  try {
    const resp = await fetch(DATA_DIR + filePath);
    if(!resp.ok) throw new Error('HTTP ' + resp.status);
    const geojson = await resp.json();
    
    const features = geojson.features || [];
    debugInfo.admin1FeatureCount = features.length;
    console.log('[DEBUG] loaded admin1 geojson:', filePath, 'features:', features.length);
    
    // Get data admin1 names for this country
    const dataAdmin1 = [...new Set(
      allData.latest.filter(pt => pt.country === country).map(pt => pt.admin1)
    )];
    
    let matched = 0;
    const unmatchedGeo = [];
    
    admin1Layer = L.geoJSON(geojson, {
      filter: feature => {
        const geoName = feature.properties.shapeName || '';
        const normalized = normalizeAdmin1Name(geoName, country);
        const isInData = dataAdmin1.includes(normalized);
        if(isInData) matched++;
        return isInData;
      },
      style: feature => {
        const geoName = feature.properties.shapeName || '';
        const normalized = normalizeAdmin1Name(geoName, country);
        const level = getAdmin1RiskLevel(country, normalized, selectedCrop);
        const c = level ? colorByLevel(level) : '#ccc';
        return {
          fillColor: c, weight: 1.5, opacity: 0.8, color: '#555',
          fillOpacity: level === 'high' ? 0.5 : level === 'medium' ? 0.4 : 0.3
        };
      },
      onEachFeature: (feature, layer) => {
        const geoName = feature.properties.shapeName || '';
        const normalized = normalizeAdmin1Name(geoName, country);
        const pts = allData.latest.filter(pt => 
          pt.country === country && pt.admin1 === normalized && 
          (selectedCrop === 'all' || pt.crop_group === selectedCrop)
        );
        const high = pts.filter(p => (p.anomaly_level || 'normal') === 'high').length;
        const medium = pts.filter(p => (p.anomaly_level || 'normal') === 'medium').length;
        const level = getAdmin1RiskLevel(country, normalized, selectedCrop);
        
        const tooltip = '<b>' + normalized + '</b><br>' +
          '产区：' + pts.length + ' 个<br>' +
          '重点：' + high + ' · 一般：' + medium + '<br>' +
          '风险：' + (level === 'high' ? '重点关注' : level === 'medium' ? '一般关注' : '正常监控');
        layer.bindTooltip(tooltip, {sticky: true});
        
        layer.on('click', () => {
          showAdmin1Detail(country, normalized);
        });
      }
    }).addTo(map);
    
    debugInfo.admin1MatchedCount = matched;
    debugInfo.admin1Loaded = matched > 0;
    
    // Collect unmatched GeoJSON names for logging
    features.forEach(f => {
      const geoName = f.properties.shapeName || '';
      const normalized = normalizeAdmin1Name(geoName, country);
      if(!dataAdmin1.includes(normalized)) unmatchedGeo.push(geoName);
    });
    debugInfo.admin1UnmatchedGeoNames = unmatchedGeo;
    
    console.log('[DEBUG] admin1 matched:', matched, '/', dataAdmin1.length);
    console.log('[DEBUG] unmatched geo names:', unmatchedGeo);
    
    // Fit to admin1 layer bounds
    if(admin1Layer.getBounds().isValid()){
      map.fitBounds(admin1Layer.getBounds().pad(0.15));
    }
    
    updateMapStatus();
    return matched > 0;
    
  } catch(e) {
    console.warn('[DEBUG] admin1 GeoJSON failed:', e.message);
    debugInfo.admin1Loaded = false;
    debugInfo.admin1Error = e.message;
    return false;
  }
}

// Show detail for a specific admin1 region
function showAdmin1Detail(country, admin1Name){
  const pts = allData.latest.filter(pt => 
    pt.country === country && pt.admin1 === admin1Name && 
    (selectedCrop === 'all' || pt.crop_group === selectedCrop)
  );
  if(!pts.length) return;
  
  // Aggregate using risk_level_v2 from water stress where available
  const RISK_V2_CN = {normal:'正常监控', watch:'一般关注', attention:'重点关注', stress:'显著压力'};
  const RISK_V2_COLOR = {normal:'#16a34a', watch:'#ca8a04', attention:'#ea580c', stress:'#dc2626'};
  var v2Counts = {stress:0, attention:0, watch:0, normal:0};
  pts.forEach(function(p){
    var wsEntry = allData.waterStress ? allData.waterStress.find(function(w){ return w.weather_region_id===p.weather_region_id; }) : null;
    var rv2 = wsEntry ? (wsEntry.risk_level_v2 || p.anomaly_level || 'normal') : (p.anomaly_level || 'normal');
    if(rv2==='stress') v2Counts.stress++;
    else if(rv2==='attention') v2Counts.attention++;
    else if(rv2==='watch') v2Counts.watch++;
    else v2Counts.normal++;
  });
  var topRisk = v2Counts.stress>0?'stress':v2Counts.attention>0?'attention':v2Counts.watch>0?'watch':'normal';
  
  let html = '<div class="info-block">' +
    '<div class="title-row">' +
    '<span class="name">' + admin1Name + '</span>' +
    '<span class="badge" style="background:' + (RISK_V2_COLOR[topRisk]||'#64748b') + ';color:#fff;">' +
    (RISK_V2_CN[topRisk]||'正常监控') + '</span>' +
    '</div>' +
    '<div class="sub">' + cnCountry(country) + ' · ' + 
    (selectedCrop === 'all' ? '全部品种' : cnCrop(selectedCrop)) + 
    ' · ' + pts.length + ' 个产区</div>' +
    '<div class="data-grid" style="margin-top:10px;">' +
    '<div class="data-cell"><span class="lbl">显著压力</span><span class="val high">' + v2Counts.stress + '</span></div>' +
    '<div class="data-cell"><span class="lbl">重点关注</span><span class="val" style="color:#ea580c;">' + v2Counts.attention + '</span></div>' +
    '<div class="data-cell"><span class="lbl">一般关注</span><span class="val" style="color:#ca8a04;">' + v2Counts.watch + '</span></div>' +
    '<div class="data-cell"><span class="lbl">正常监控</span><span class="val normal">' + v2Counts.normal + '</span></div>' +
    '<div class="data-cell"><span class="lbl">产区数</span><span class="val">' + pts.length + '</span></div>' +
    '</div>' +
    '</div>';
  
  // Show individual points as a list in the detail panel
  html += '<div class="info-block"><h3>产区点位</h3>';
  pts.forEach(pt => {
    var wsPt = allData.waterStress ? allData.waterStress.find(function(w){ return w.weather_region_id===pt.weather_region_id; }) : null;
    var rv2Pt = wsPt ? (wsPt.risk_level_v2 || pt.anomaly_level || 'normal') : (pt.anomaly_level || 'normal');
    html += '<div style="padding:6px 0;border-bottom:1px solid #f0f0f0;cursor:pointer;" ' +
      'onclick="showDetail(\'' + pt.weather_region_id + '\')">' +
      '<span class="badge" style="background:' + (RISK_V2_COLOR[rv2Pt]||'#64748b') + ';color:#fff;margin-right:6px;">' + (RISK_V2_CN[rv2Pt]||'正常监控') + '</span>' +
      '<b>' + pt.display_region_name + '</b>' +
      '<div style="font-size:11px;color:var(--text3);margin-top:2px;">' +
      cnCrop(pt.crop_group) + ' · ' + cnLabel(pt.anomaly_label) + '</div>' +
      '</div>';
  });
  html += '</div>';
  
  document.getElementById('detail-panel').innerHTML = html;
}

function renderGeoJSON(){
  if(geoJsonLayer){ map.removeLayer(geoJsonLayer); geoJsonLayer=null; }
  // Clean up old country labels
  if(window._countryLabels) {
    window._countryLabels.forEach(function(lm){ map.removeLayer(lm); });
    window._countryLabels = [];
  }
  if(!allData.geojson) {
    debugInfo.matchedCountries = 0;
    updateMapStatus();
    return;
  }
  
  // Build set of countries with coverage for the selected crop
  var cropCountries = new Set();
  if(allData.countrySummary && selectedCrop !== 'all') {
    allData.countrySummary.forEach(function(cs){
      if(cs.crop_group === selectedCrop && cs.region_count > 0) {
        cropCountries.add(cs.country);
      }
    });
  } else {
    // "all" crop: show all countries that have any data
    allData.latest.forEach(function(x){ cropCountries.add(x.country); });
  }
  
  var matched = 0;
  
  geoJsonLayer = L.geoJSON(allData.geojson, {
    filter: feature=>{
      var normalized = normalizeGeojsonName(feature.properties.name);
      var ok = cropCountries.has(normalized);
      if(ok) matched++;
      return ok;
    },
    style: feature=>{
      const normalized = normalizeGeojsonName(feature.properties.name);
      const level = getCountryRiskLevel(normalized, selectedCrop);
      const c = colorByLevel(level);
      return { fillColor:c, weight:1.2, opacity:0.8, color:'#666', dashArray:'', fillOpacity:0.45 };
    },
    onEachFeature: (feature, layer)=>{
      const normalized = normalizeGeojsonName(feature.properties.name);
      const pts = allData.latest.filter(pt=>pt.country===normalized && (selectedCrop==='all'||pt.crop_group===selectedCrop));
      const high = pts.filter(p=>(p.anomaly_level||'normal')==='high').length;
      const medium = pts.filter(p=>(p.anomaly_level||'normal')==='medium').length;
      // Find country crop summary for production
      var csEntry = null;
      if(allData.countrySummary) {
        csEntry = allData.countrySummary.find(function(c){ return c.country===normalized && (selectedCrop==='all'||c.crop_group===selectedCrop); });
      }
      var prodText = csEntry && csEntry.total_production_tonnes ? fmtProduction(csEntry.total_production_tonnes) : '';
      var popup = '<b>' + cnCountry(normalized) + '</b><br>产区：' + pts.length + ' 个<br>重点：' + high + ' · 一般：' + medium;
      if(prodText) popup += '<br>产量：' + prodText;
      layer.bindTooltip(popup, {sticky:true});
      // Add permanent country label with production
      var csEntry2 = null;
      if(allData.countrySummary) {
        csEntry2 = allData.countrySummary.find(function(c){ return c.country===normalized && (selectedCrop==='all'||c.crop_group===selectedCrop); });
      }
      var labelText = cnCountry(normalized);
      if(csEntry2) {
        var cropCn = csEntry2.crop_group_cn || cnCrop(csEntry2.crop_group);
        labelText += '\n' + cropCn;
        if(csEntry2.total_production_tonnes) {
          labelText += '｜' + fmtProduction(csEntry2.total_production_tonnes);
        }
      }
      var center = layer.getBounds().getCenter();
      var oilColor = (csEntry2 && csEntry2.oil_type_color) ? csEntry2.oil_type_color : '#64748b';
      var labelMarker = L.tooltip({
        permanent: true,
        direction: 'center',
        className: 'country-label',
        opacity: 0.85
      }).setContent('<span style="border-left: 3px solid ' + oilColor + '; padding-left: 4px;">' + labelText + '</span>').setLatLng(center);
      labelMarker.addTo(map);
      // Store reference for cleanup
      if(!window._countryLabels) window._countryLabels = [];
      window._countryLabels.push(labelMarker);
      layer.on('click', ()=>enterCountry(normalized));
    }
  }).addTo(map);
  
  debugInfo.matchedCountries = matched;
  updateMapStatus();
  
  // Fit to country layer if in global view
  if(currentView==='global' && geoJsonLayer.getBounds().isValid()){
    map.fitBounds(geoJsonLayer.getBounds().pad(0.15));
  }
}

function renderMarkers(){
  markerLayer.forEach(m=>map.removeLayer(m));
  markerLayer = [];
  const pts = getFilteredPoints();
  pts.forEach(pt=>{
    const lev = pt.anomaly_level||'normal';
    const c = colorByLevel(lev);
    const m = L.circleMarker([pt.latitude, pt.longitude], {
      radius: Math.max(6, Math.min(32, Math.sqrt((pt.production_tonnes||1000)/500) * 2.5)),
      fillColor:c, color:'#fff', weight:1.5, opacity:1, fillOpacity:0.85
    }).addTo(map);
    var shareText = '—';
    if(pt.production_tonnes && allData.countrySummary) {
      var csMatch = allData.countrySummary.find(function(c){ return c.country===pt.country && c.crop_group===pt.crop_group; });
      if(csMatch && csMatch.total_production_tonnes > 0) {
        shareText = (pt.production_tonnes / csMatch.total_production_tonnes * 100).toFixed(1) + '%';
      }
    }
    m.bindTooltip('<b>' + pt.display_region_name + '（' + shareText + '）</b><br>' + cnCrop(pt.crop_group) + ' · ' + cnCountry(pt.country) + '<br>' + cnLabel(pt.anomaly_label) + '<br>' + fmtProduction(pt.production_tonnes) + ' · 占比 ' + shareText);
    m.on('click', ()=>showDetail(pt.weather_region_id));
    markerLayer.push(m);
  });
  debugInfo.renderedMarkers = markerLayer.length;
  updateMapStatus();
}

function updateMapStatus(){
  const el = document.getElementById('map-status');
  const geoStatus = allData.geojson 
    ? `<span class="ok">国家边界：已加载 (${debugInfo.matchedCountries} 个匹配)</span>`
    : `<span class="err">国家边界：加载失败${debugInfo.geojsonError?' ('+debugInfo.geojsonError+')':''}</span>`;
  const markerStatus = debugInfo.renderedMarkers > 0
    ? `<span class="ok">产区点位：${debugInfo.renderedMarkers} 个</span>`
    : `<span class="err">产区点位：未显示</span>`;
  
  let admin1Status = '';
  if(currentView === 'country' && selectedCountry){
    const levelLabel = debugInfo.currentLevel === 'admin1' ? '省州' : '点位';
    const admin1Info = debugInfo.admin1Loaded
      ? `<span class="ok">省州边界：已加载 (${debugInfo.admin1MatchedCount}/${debugInfo.admin1FeatureCount})</span>`
      : `<span class="err">省州边界：未加载</span>`;
    admin1Status = `<br>当前层级：${levelLabel} · ${cnCountry(selectedCountry)}<br>${admin1Info}`;
  }
  
  el.innerHTML = `${geoStatus}<br>${markerStatus}${admin1Status}<br>数据点：${debugInfo.latestCount} · 地图状态：已渲染`;
}

function enterCountry(country){
  currentView = 'country';
  selectedCountry = country;
  debugInfo.currentLevel = 'admin1';
  document.getElementById('back-btn').classList.add('show');
  document.getElementById('f-country').value = country;
  document.getElementById('overlay-title').textContent = cnCountry(country);
  
  // Try to load admin1 GeoJSON; if fails, fall back to markers only
  loadAndRenderAdmin1(country).then(ok => {
    if(!ok){
      // Admin1 failed or not available - fall back to points
      console.log('[DEBUG] admin1 fallback to markers for', country);
      debugInfo.currentLevel = 'points';
      renderMarkers();
      const pts = getFilteredPoints();
      if(pts.length > 0){
        const lats = pts.map(p => p.latitude), lons = pts.map(p => p.longitude);
        map.fitBounds([[Math.min(...lats)-1, Math.min(...lons)-1], [Math.max(...lats)+1, Math.max(...lons)+1]]);
      }
    } else {
      // Admin1 loaded successfully - also render markers on top
      renderMarkers();
    }
    showCountrySummary(country);
  });
}

function backToGlobal(){
  currentView='global'; selectedCountry=null;
  debugInfo.currentLevel = 'country';
  document.getElementById('back-btn').classList.remove('show');
  document.getElementById('f-country').value='all';
  document.getElementById('overlay-title').textContent='全球概览';
  // Clean up admin1 layer
  if(admin1Layer){ map.removeLayer(admin1Layer); admin1Layer = null; }
  debugInfo.admin1Loaded = false;
  renderGeoJSON(); renderMarkers(); updateOverview();
  document.getElementById('detail-panel').innerHTML='<div class="empty">点击地图上的国家或产区点位查看详情</div>';
  if(allData.geojson && geoJsonLayer && geoJsonLayer.getBounds().isValid()){
    map.fitBounds(geoJsonLayer.getBounds().pad(0.15));
  } else {
    fitToPointsOrDefault();
  }
}

function fitToPointsOrDefault(){
  const pts = allData.latest;
  if(pts && pts.length>0){
    const lats=pts.map(p=>p.latitude), lons=pts.map(p=>p.longitude);
    const bounds = [[Math.min(...lats)-2,Math.min(...lons)-2],[Math.max(...lats)+2,Math.max(...lons)+2]];
    map.fitBounds(bounds);
  } else {
    map.setView([15,100],3);
  }
}

function selectCrop(crop){
  selectedCrop = crop;
  document.querySelectorAll('.crop-tab').forEach(t=>t.classList.toggle('active', t.dataset.crop===crop));
  if(currentView==='country' && selectedCountry){
    // Re-render admin1 if loaded, otherwise just markers
    if(admin1Layer){
      loadAndRenderAdmin1(selectedCountry).then(ok => {
        renderMarkers();
        const pts = getFilteredPoints().filter(p=>p.country===selectedCountry);
        if(pts.length===0) backToGlobal();
        else showCountrySummary(selectedCountry);
      });
    } else {
      renderMarkers();
      const pts = getFilteredPoints().filter(p=>p.country===selectedCountry);
      if(pts.length===0) backToGlobal();
      else showCountrySummary(selectedCountry);
    }
  } else {
    renderGeoJSON(); renderMarkers(); updateOverview();
  }
}

function onFilterChange(){
  renderMarkers(); updateOverview();
  if(currentView==='global') renderGeoJSON();
}

function resetFilters(){
  selectedCrop='all';
  document.querySelectorAll('.crop-tab').forEach(t=>t.classList.toggle('active', t.dataset.crop==='all'));
  document.getElementById('f-country').value='all';
  document.getElementById('f-level').value='all';
  document.getElementById('f-label').value='all';
  backToGlobal();
}

function updateOverview(){
  const pts = getFilteredPoints();
  document.getElementById('ov-points').textContent = pts.length;
  document.getElementById('ov-high').textContent = pts.filter(p=>(p.anomaly_level||'normal')==='high').length;
  document.getElementById('ov-medium').textContent = pts.filter(p=>(p.anomaly_level||'normal')==='medium').length;
  document.getElementById('meta-date').textContent = allData.meta?.generated_at?.split(' ')[0]||'—';
}

function populateFilters(){
  const countries = [...new Set(allData.latest.map(x=>x.country))].sort();
  const labels = [...new Set(allData.latest.map(x=>x.anomaly_label).filter(Boolean))].sort();
  const selCountry = document.getElementById('f-country');
  selCountry.innerHTML='<option value="all">全部国家</option>';
  countries.forEach(c=>{ const o=document.createElement('option'); o.value=c; o.textContent=cnCountry(c); selCountry.appendChild(o); });
  const selLabel = document.getElementById('f-label');
  selLabel.innerHTML='<option value="all">全部异常</option>';
  labels.forEach(l=>{ const o=document.createElement('option'); o.value=l; o.textContent=cnLabel(l); selLabel.appendChild(o); });
}

function showCountrySummary(country){
  const pts = allData.latest.filter(pt=>pt.country===country && (selectedCrop==='all'||pt.crop_group===selectedCrop));
  if(!pts.length) return;
  // Aggregate using risk_level_v2 from water stress where available
  const RISK_V2_CN = {normal:'正常监控', watch:'一般关注', attention:'重点关注', stress:'显著压力'};
  const RISK_V2_COLOR = {normal:'#16a34a', watch:'#ca8a04', attention:'#ea580c', stress:'#dc2626'};
  var v2Counts = {stress:0, attention:0, watch:0, normal:0};
  pts.forEach(function(p){
    var wsEntry = allData.waterStress ? allData.waterStress.find(function(w){ return w.weather_region_id===p.weather_region_id; }) : null;
    var rv2 = wsEntry ? (wsEntry.risk_level_v2 || p.anomaly_level || 'normal') : (p.anomaly_level || 'normal');
    if(rv2==='stress') v2Counts.stress++;
    else if(rv2==='attention') v2Counts.attention++;
    else if(rv2==='watch') v2Counts.watch++;
    else v2Counts.normal++;
  });
  var topRisk = v2Counts.stress>0?'stress':v2Counts.attention>0?'attention':v2Counts.watch>0?'watch':'normal';
  
  const cs = (allData.countrySummary||[]).find(c=>c.country===country && (selectedCrop==='all'||c.crop_group===selectedCrop));
  
  let html = `
    <div class="info-block">
      <div class="title-row">
        <span class="name">${cnCountry(country)}</span>
        <span class="badge" style="background:${RISK_V2_COLOR[topRisk]||'#64748b'};color:#fff;">${RISK_V2_CN[topRisk]||'正常监控'}</span>
      </div>
      <div class="sub">${selectedCrop==='all'?'全部品种':cnCrop(selectedCrop)} · ${pts.length} 个产区</div>
      <div class="data-grid" style="margin-top:10px;">
        <div class="data-cell"><span class="lbl">显著压力</span><span class="val high">${v2Counts.stress}</span></div>
        <div class="data-cell"><span class="lbl">重点关注</span><span class="val" style="color:#ea580c;">${v2Counts.attention}</span></div>
        <div class="data-cell"><span class="lbl">一般关注</span><span class="val" style="color:#ca8a04;">${v2Counts.watch}</span></div>
        <div class="data-cell"><span class="lbl">正常监控</span><span class="val normal">${v2Counts.normal}</span></div>
        <div class="data-cell"><span class="lbl">产量(吨)</span><span class="val">${cs&&cs.total_production_tonnes?fmtNum(cs.total_production_tonnes,0):'—'}</span></div>
      </div>
    </div>
    <div class="info-block">
      <h3>天气摘要</h3>
      <div class="trend-text">${cs?cs.overall_status_cn:'暂无该国汇总数据'}</div>
    </div>
  `;
  document.getElementById('detail-panel').innerHTML = html;
}

function showDetail(rid){
  const pt = allData.latest.find(x=>x.weather_region_id===rid);
  const st = allData.stage.find(x=>x.weather_region_id===rid);
  const ws = allData.waterStress?allData.waterStress.find(x=>x.weather_region_id===rid):null;
  const fc = allData.forecast.filter(x=>x.weather_region_id===rid).sort((a,b)=>a.horizon_day-b.horizon_day);
  const fcSum = allData.forecastSummary?allData.forecastSummary.find(x=>x.weather_region_id===rid):null;
  const hist = allData.history?allData.history.filter(x=>x.weather_region_id===rid).sort((a,b)=>a.date.localeCompare(b.date)):[];
  
  if(!pt) return;
  const level = pt.anomaly_level||'normal';
  const riskV2 = ws ? (ws.risk_level_v2 || level) : level;
  const RISK_V2_CN = {normal:'正常监控', watch:'一般关注', attention:'重点关注', stress:'显著压力'};
  const RISK_V2_COLOR = {normal:'#16a34a', watch:'#ca8a04', attention:'#ea580c', stress:'#dc2626'};
  
  let html = `
    <div class="info-block">
      <div class="title-row">
        <span class="name">${pt.display_region_name}</span>
        <span class="badge" style="background:${RISK_V2_COLOR[riskV2]||'#64748b'};color:#fff;">${RISK_V2_CN[riskV2]||'正常监控'}</span>
      </div>
      <div class="sub">${cnCrop(pt.crop_group)} · ${cnCountry(pt.country)}${pt.admin1?' · '+pt.admin1:''}</div>
      <div style="font-size:11px;color:var(--text3);margin-top:4px;">${(function(){
  var shareVal = '—';
  if(pt.production_tonnes && allData.countrySummary) {
    var cs = allData.countrySummary.find(function(c){ return c.country===pt.country && c.crop_group===pt.crop_group; });
    if(cs && cs.total_production_tonnes > 0) {
      shareVal = (pt.production_tonnes / cs.total_production_tonnes * 100).toFixed(1) + '%';
    }
  }
  return '地区产量：' + fmtProduction(pt.production_tonnes) + ' · 占该国产量：' + shareVal;
})()}</div>    </div>
  `;
  
  // Core conclusion section (结论先行)
  var conclusionHtml = '<div class="info-block" style="background:#f8fafc;border-left:3px solid #2563eb;">';
  conclusionHtml += '<h3 style="font-size:16px;margin-bottom:8px;">核心结论</h3>';
  if(st && st.matched_growth_stage) {
    conclusionHtml += '<div style="font-size:14px;margin-bottom:6px;"><strong>当前生长周期：</strong>' + st.matched_growth_stage + '</div>';
  }
  var riskText = ws ? (ws.risk_reason_cn || ws.water_stress_explanation_cn || '暂无明显天气压力') : '暂无水分压力数据';
  conclusionHtml += '<div style="font-size:14px;margin-bottom:6px;"><strong>目前天气风险：</strong>' + riskText + '</div>';
  var soilRiskText = '当前根据降雨和蒸散指标综合判断。';
  if(ws) {
    if(ws.et0_30d_avg_mm && ws.et0_30d_avg_mm > 4.5 && ws.precipitation_30d_status && ws.precipitation_30d_status.includes('偏少')) {
      soilRiskText = '大气失水需求偏强，叠加降雨偏少，存在失墒风险。';
    } else if(ws.vpd_30d_avg_kpa && ws.vpd_30d_avg_kpa > 1.8) {
      soilRiskText = '大气干燥度偏高，蒸散压力较大。';
    } else if(ws.precipitation_30d_status && ws.precipitation_30d_status.includes('偏多')) {
      soilRiskText = '降雨偏多，土壤含水量可能偏高。';
    }
  }
  conclusionHtml += '<div style="font-size:14px;margin-bottom:6px;"><strong>土壤墑情风险：</strong>' + soilRiskText + '</div>';
  if(fcSum) {
    conclusionHtml += '<div style="font-size:14px;"><strong>未来预报：</strong>' + fcSum.forecast_summary_cn + '</div>';
  }
  conclusionHtml += '</div>';
  html += conclusionHtml;
  
  if(ws){
    html += `
      <div class="info-block">
        <h3>水分压力</h3>
        <div class="stress-box ${ws.water_stress_level}">
          <div class="stress-title">${ws.water_stress_label_cn}</div>
          <div>${ws.water_stress_explanation_cn}</div>
          <div class="stress-note">${ws.data_completeness_note}</div>
        </div>
        <div class="data-grid">
          <div class="data-cell"><span class="lbl">30日降雨状态</span><span class="val">${ws.precipitation_30d_status}</span></div>
          <div class="data-cell"><span class="lbl">7日温度状态</span><span class="val">${ws.temp_7d_status}</span></div>
          <div class="data-cell"><span class="lbl">土壤墒情</span><span class="val" style="font-size:12px;">${ws.soil_moisture_status||'待接入'}</span></div>
          <div class="data-cell"><span class="lbl">大气失水需求</span><span class="val" style="font-size:12px;">${ws.et0_status && ws.vpd_status ? ws.et0_status + '，' + ws.vpd_status : '数据待积累'}</span></div>
        </div>
      </div>
    `;
  }
  
  html += `
    <div class="info-block">
      <h3>最新天气 · ${fmt(pt.latest_raw_weather_date)}</h3>
      <div class="data-grid">
        <div class="data-cell"><span class="lbl">最高气温</span><span class="val">${fmtNum(pt.temp_max_c)} °C</span></div>
        <div class="data-cell"><span class="lbl">最低气温</span><span class="val">${fmtNum(pt.temp_min_c)} °C</span></div>
        <div class="data-cell"><span class="lbl">平均气温</span><span class="val">${fmtNum(pt.temp_mean_c)} °C</span></div>
        <div class="data-cell"><span class="lbl">降水量</span><span class="val">${fmtNum(pt.precipitation_mm)} mm</span></div>
      </div>
    </div>
  `;
  
  if(fcSum){
    html += `
      <div class="info-block">
        <h3>未来趋势</h3>
        <div class="data-grid">
          <div class="data-cell"><span class="lbl">7天累计降雨</span><span class="val">${fmtNum(fcSum.rain_7d_sum)} mm</span></div>
          <div class="data-cell"><span class="lbl">16天累计降雨</span><span class="val">${fmtNum(fcSum.rain_16d_sum)} mm</span></div>
          <div class="data-cell"><span class="lbl">7天平均最高温</span><span class="val">${fmtNum(fcSum.temp_max_7d_avg)} °C</span></div>
          <div class="data-cell"><span class="lbl">16天平均最高温</span><span class="val">${fmtNum(fcSum.temp_max_16d_avg)} °C</span></div>
        </div>
        <div class="trend-text"><strong>趋势判断：</strong>${fcSum.forecast_summary_cn}</div>
      </div>
    `;
  }
  
  if(hist.length>0){
    // Get latest record with cumulative data
    var latestCum = null;
    for(var hi = hist.length - 1; hi >= 0; hi--) {
      if(hist[hi].precipitation_30d_actual_mm !== null && hist[hi].precipitation_30d_actual_mm !== undefined) {
        latestCum = hist[hi];
        break;
      }
    }
    
    if(latestCum) {
      var actual30 = latestCum.precipitation_30d_actual_mm;
      var normal30 = latestCum.precipitation_30d_normal_mm;
      var anom30 = latestCum.precipitation_30d_anomaly_mm;
      var ratio30 = latestCum.precipitation_30d_ratio_pct;
      var fcRain7 = fcSum ? fcSum.rain_7d_sum : null;
      var fcRain16 = fcSum ? fcSum.rain_16d_sum : null;
      
      // Build cumulative assessment text
      var cumText = '';
      if(anom30 !== null && normal30 !== null) {
        if(anom30 < -20) {
          cumText = '近30天累计降雨较常年偏少' + Math.abs(anom30).toFixed(1) + 'mm';
          if(fcRain16 && fcRain16 > Math.abs(anom30) * 0.5) {
            cumText += '，未来16天降雨有望部分补充前期缺口，但需继续观察是否兑现。';
          } else if(fcRain16) {
            cumText += '，未来16天预报降雨' + fcRain16.toFixed(1) + 'mm，补充力度有限。';
          }
        } else if(anom30 > 30) {
          cumText = '近30天累计降雨较常年偏多' + anom30.toFixed(1) + 'mm（实际' + ratio30.toFixed(0) + '%），土壤含水量可能偏高。';
        } else {
          cumText = '近30天累计降雨接近常年水平（实际/常年 ' + ratio30.toFixed(0) + '%）。';
        }
      }
      
      html += '<div class="info-block">' +
        '<h3>累积降雨情况</h3>' +
        '<div class="data-grid">' +
        '<div class="data-cell"><span class="lbl">近30天实际降雨</span><span class="val">' + (actual30 !== null ? actual30.toFixed(1) + ' mm' : '—') + '</span></div>' +
        '<div class="data-cell"><span class="lbl">近30天常年降雨</span><span class="val">' + (normal30 !== null ? normal30.toFixed(1) + ' mm' : '—') + '</span></div>' +
        '<div class="data-cell"><span class="lbl">近30天降雨距平</span><span class="val' + (anom30 !== null && anom30 < -20 ? ' high' : anom30 !== null && anom30 > 30 ? ' medium' : '') + '">' + (anom30 !== null ? (anom30 > 0 ? '+' : '') + anom30.toFixed(1) + ' mm' : '—') + '</span></div>' +
        '<div class="data-cell"><span class="lbl">实际/常年</span><span class="val">' + (ratio30 !== null ? ratio30.toFixed(0) + '%' : '—') + '</span></div>' +
        '<div class="data-cell"><span class="lbl">未来7天预报降雨</span><span class="val">' + (fcRain7 !== null ? fcRain7.toFixed(1) + ' mm' : '—') + '</span></div>' +
        '<div class="data-cell"><span class="lbl">未来16天预报降雨</span><span class="val">' + (fcRain16 !== null ? fcRain16.toFixed(1) + ' mm' : '—') + '</span></div>' +
        '</div>' +
        (cumText ? '<div class="trend-text">' + cumText + '</div>' : '') +
        '</div>';
    }
    
    html += '<div class="info-block">' +
      '<h3>近90天降雨距平</h3>' +
      '<div class="chart-box small"><canvas id="chart-rain"></canvas></div>' +
      '</div>' +
      '<div class="info-block">' +
      '<h3>近90天温度距平</h3>' +
      '<div class="chart-box small"><canvas id="chart-temp"></canvas></div>' +
      '</div>';
  }
  
  if(st){
    html += `
      <div class="info-block">
        <h3>生长期影响 · ${fmt(st.current_month)}月</h3>
        <div style="font-size:12px;line-height:1.7;">${fmt(st.web_message_cn)}</div>
        ${st.matched_growth_stage?`<div style="font-size:11px;color:var(--text3);margin-top:6px;">匹配阶段：${fmt(st.matched_growth_stage)}</div>`:''}
        ${st.impact_cn?`<div style="font-size:11px;color:var(--text3);margin-top:4px;">影响说明：${fmt(st.impact_cn)}</div>`:''}
      </div>
    `;
  }
  
  if(fc.length>0){
    html += `
      <div class="info-block">
        <h3>未来16天预报</h3>
        <div class="chart-box small"><canvas id="chart-fc"></canvas></div>
      </div>
    `;
  }
  
  // Water stress / anomaly level history from region_history_90d
  if(hist.length>0){
    html += '<div class="info-block">' +
      '<h3>近90天异常等级</h3>' +
      '<div class="chart-box small"><canvas id="chart-stress"></canvas></div>' +
      '</div>';
  }
  
  document.getElementById('detail-panel').innerHTML = html;
  
  if(hist.length>0){
    renderRainChart(hist);
    renderTempChart(hist);
    renderStressChart(hist);
  }
  if(fc.length>0) renderFcChart(fc);
}

function renderRainChart(hist){
  try {
    var ctx = document.getElementById('chart-rain');
    if(!ctx) return;
    if(charts.rain) { charts.rain.destroy(); charts.rain = null; }

    var labels = hist.map(function(d){ return d.date ? d.date.slice(5) : ''; });
    
    // Primary: 30-day cumulative rainfall anomaly (mm)
    var anomalyData = hist.map(function(d){ return d.precipitation_30d_anomaly_mm; });
    var anomalyColors = anomalyData.map(function(v){
      if(v === null || v === undefined) return 'rgba(148,163,184,0.3)';
      if(v < -30) return 'rgba(220,38,38,0.6)';     // red = very dry
      if(v < 0) return 'rgba(251,146,60,0.5)';       // orange = dry
      if(v > 50) return 'rgba(37,99,235,0.6)';       // blue = very wet
      return 'rgba(59,130,246,0.4)';                  // light blue = normal/wet
    });

    var anomalyDataset = {
      type: 'bar',
      label: '30日降雨距平 mm',
      data: anomalyData,
      backgroundColor: anomalyColors,
      barThickness: 3
    };

    // Secondary: daily rainfall (reference)
    var rawLine = {
      type: 'line',
      label: '日降雨 mm',
      data: hist.map(function(d){ return d.precipitation_mm; }),
      borderColor: 'rgba(100,116,139,0.5)',
      borderWidth: 1,
      pointRadius: 0,
      yAxisID: 'y1',
      tension: 0.3
    };

    var chartConfig = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [anomalyDataset, rawLine]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { boxWidth: 8, font: { size: 9 } } }
        },
        scales: {
          x: { display: false },
          y: {
            position: 'left',
            title: { display: true, text: '距平 mm', font: { size: 9 } },
            grid: { color: '#f3f4f6' },
            ticks: { font: { size: 9 } }
          },
          y1: {
            position: 'right',
            title: { display: true, text: '日降雨 mm', font: { size: 9 } },
            grid: { display: false },
            ticks: { font: { size: 9 } },
            min: 0
          }
        }
      }
    };

    charts.rain = new Chart(ctx, chartConfig);
  } catch(e) {
    console.warn('[CHART] renderRainChart failed:', e.message);
  }
}

function renderTempChart(hist){
  try {
    var ctx = document.getElementById('chart-temp');
    if(!ctx) return;
    if(charts.temp) { charts.temp.destroy(); charts.temp = null; }

    var labels = hist.map(function(d){ return d.date ? d.date.slice(5) : ''; });
    
    // Primary: daily max temp anomaly (°C)
    var anomalyData = hist.map(function(d){ return d.temp_max_anomaly_c; });

    var anomalyDataset = {
      label: '最高温距平 °C',
      data: anomalyData,
      borderColor: '#f59e0b',
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.3,
      yAxisID: 'y',
      segment: {
        borderColor: function(ctx2){
          var v = ctx2.p1.parsed.y;
          if(v === null || v === undefined) return 'rgba(148,163,184,0.5)';
          if(v > 3) return 'rgba(220,38,38,0.8)';    // red = very hot anomaly
          if(v > 1.5) return 'rgba(234,88,12,0.7)';   // orange = warm anomaly
          if(v < -1.5) return 'rgba(59,130,246,0.6)';  // blue = cool anomaly
          return 'rgba(100,116,139,0.5)';               // gray = normal
        }
      }
    };

    // Secondary: raw temp_max_c as dashed reference
    var rawDataset = {
      label: '最高温 °C',
      data: hist.map(function(d){ return d.temp_max_c; }),
      borderColor: 'rgba(245,158,11,0.3)',
      borderWidth: 1,
      pointRadius: 0,
      tension: 0.3,
      yAxisID: 'y1',
      borderDash: [3, 3]
    };

    var chartConfig = {
      type: 'line',
      data: {
        labels: labels,
        datasets: [anomalyDataset, rawDataset]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { labels: { boxWidth: 8, font: { size: 9 } } }
        },
        scales: {
          x: { display: false },
          y: {
            position: 'left',
            title: { display: true, text: '距平 °C', font: { size: 9 } },
            grid: { color: '#f3f4f6' },
            ticks: { font: { size: 9 } }
          },
          y1: {
            position: 'right',
            title: { display: true, text: '°C', font: { size: 9 } },
            grid: { display: false },
            ticks: { font: { size: 9 } }
          }
        }
      }
    };

    charts.temp = new Chart(ctx, chartConfig);
  } catch(e) {
    console.warn('[CHART] renderTempChart failed:', e.message);
  }
}

function renderStressChart(hist){
  try {
    var ctx = document.getElementById('chart-stress');
    if(!ctx) return;
    if(charts.stress) { charts.stress.destroy(); charts.stress = null; }

    var labels = hist.map(function(d){ return d.date.slice(5); });

    // Map anomaly_level to numeric: high=3, medium=2, normal=1, low=0
    var levelMap = { high:3, medium:2, normal:1, low:0 };
    var levelLabels = ['低风险','正常','一般关注','重点关注'];
    var levelColors = ['#94a3b8','#16a34a','#ea580c','#dc2626'];

    var barData = hist.map(function(d){
      var lev = d.anomaly_level || 'normal';
      return levelMap[lev] !== undefined ? levelMap[lev] : 1;
    });

    var barColors = hist.map(function(d){
      var lev = d.anomaly_level || 'normal';
      var idx = levelMap[lev] !== undefined ? levelMap[lev] : 1;
      return levelColors[idx];
    });

    var stressDataset = {
      label: '异常等级',
      data: barData,
      backgroundColor: barColors,
      barThickness: 3
    };

    var chartConfig = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [stressDataset]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(tipCtx){
                var v = tipCtx.parsed.y;
                return levelLabels[v] || '未知';
              }
            }
          }
        },
        scales: {
          x: { display: false },
          y: {
            min: -0.5,
            max: 3.5,
            ticks: {
              stepSize: 1,
              callback: function(value){
                return levelLabels[value] || '';
              },
              font: { size: 9 }
            },
            grid: { color: '#f3f4f6' }
          }
        }
      }
    };

    charts.stress = new Chart(ctx, chartConfig);
  } catch(e) {
    console.warn('[CHART] renderStressChart failed:', e.message);
  }
}

function renderFcChart(fc){
  try {
    var ctx = document.getElementById('chart-fc');
    if(!ctx) return;
    if(charts.fc) { charts.fc.destroy(); charts.fc = null; }

    var labels = fc.map(function(d){ return d.target_date.slice(5); });
    var maxData = fc.map(function(d){ return d.temp_max_c; });
    var minData = fc.map(function(d){ return d.temp_min_c; });
    var rainData = fc.map(function(d){ return d.precipitation_mm; });

    var maxDataset = {
      type: 'line',
      label: '最高温',
      data: maxData,
      borderColor: '#f59e0b',
      borderWidth: 1.5,
      pointRadius: 1,
      yAxisID: 'y',
      tension: 0.3
    };

    var minDataset = {
      type: 'line',
      label: '最低温',
      data: minData,
      borderColor: '#3b82f6',
      borderWidth: 1.5,
      pointRadius: 1,
      yAxisID: 'y',
      tension: 0.3
    };

    var rainDataset = {
      type: 'bar',
      label: '降雨',
      data: rainData,
      backgroundColor: 'rgba(59,130,246,0.25)',
      yAxisID: 'y1',
      barThickness: 5
    };

    var chartConfig = {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [maxDataset, minDataset, rainDataset]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { boxWidth: 8, font: { size: 9 } }
          }
        },
        scales: {
          x: {
            ticks: { font: { size: 8 }, maxTicksLimit: 8 }
          },
          y: {
            position: 'left',
            grid: { color: '#f3f4f6' },
            ticks: { font: { size: 9 } }
          },
          y1: {
            position: 'right',
            grid: { display: false },
            ticks: { font: { size: 9 } },
            min: 0
          }
        }
      }
    };

    charts.fc = new Chart(ctx, chartConfig);
  } catch(e) {
    console.warn('[CHART] renderFcChart failed:', e.message);
  }
}

function bindEvents(){
  // Back button
  document.getElementById('back-btn').addEventListener('click', backToGlobal);

  // Crop tabs (event delegation on container)
  document.getElementById('crop-tabs').addEventListener('click', function(e){
    const tab = e.target.closest('.crop-tab');
    if(tab && tab.dataset.crop) selectCrop(tab.dataset.crop);
  });

  // Filter selects
  document.getElementById('f-country').addEventListener('change', onFilterChange);
  document.getElementById('f-level').addEventListener('change', onFilterChange);
  document.getElementById('f-label').addEventListener('change', onFilterChange);

  // Reset button
  document.getElementById('btn-reset').addEventListener('click', resetFilters);

  // Expose showDetail globally for dynamically generated HTML onclick
  window.showDetail = showDetail;
}

async function init(){
  initMap();
  bindEvents();
  
  // Load core data first (must not fail)
  const [meta, latest, forecast, anomaly, stage, alerts] = await Promise.all([
    loadJSON('site_meta_v0.8.1.json'),
    loadJSON('weather_latest_v0.8.1.json'),
    loadJSON('weather_forecast_v0.8.1.json'),
    loadJSON('weather_anomaly_v0.8.1.json'),
    loadJSON('stage_impact_latest_v0.8.1.json'),
    loadJSON('alerts_v0.8.1.json')
  ]);
  
  allData = { meta, latest, forecast, anomaly, stage, alerts };
  debugInfo.latestCount = latest.length;
  console.log('[DEBUG] loaded weather_latest count:', latest.length);
  
  // Load optional data (can fail without blocking)
  const [history, forecastSummary, countrySummary, waterStress, geojson] = await Promise.all([
    safeLoadJSON('region_history_90d_v1.0d.json'),
    safeLoadJSON('region_forecast_summary_v1.0d.json'),
    safeLoadJSON('country_crop_summary_v1.0d.json'),
    safeLoadJSON('water_stress_latest_v1.0e.json'),
    safeLoadJSON('countries.geo.json')
  ]);
  
  if(history) allData.history = history;
  if(forecastSummary) allData.forecastSummary = forecastSummary;
  if(countrySummary) allData.countrySummary = countrySummary;
  if(waterStress) allData.waterStress = waterStress;
  if(geojson) {
    allData.geojson = geojson;
    debugInfo.geojsonFeatures = geojson.features ? geojson.features.length : 0;
    console.log('[DEBUG] loaded countries.geo.json feature count:', debugInfo.geojsonFeatures);
  } else {
    debugInfo.geojsonError = '无法加载国家边界数据';
    console.warn('[DEBUG] countries.geo.json failed to load');
  }
  
  console.log('[DEBUG] matched country count will be shown after render');
  console.log('[DEBUG] rendered point marker count will be shown after render');
  
  populateFilters();
  updateOverview();
  renderGeoJSON();
  renderMarkers();
  
  // If no geojson, fit to points
  if(!allData.geojson) {
    fitToPointsOrDefault();
  }
  
  // Final invalidateSize after everything is rendered
  setTimeout(()=>{ map.invalidateSize(); }, 500);
}

init().catch(e=>{
  console.error('Init failed:', e);
  document.getElementById('map-status').innerHTML = '<span class="err">地图初始化失败: '+e.message+'</span>';
});