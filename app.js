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
  level: { high:'重点关注', medium:'一般关注', normal:'正常监控', low:'低风险' },
  country: { 'Indonesia':'印度尼西亚', 'Malaysia':'马来西亚', 'Australia':'澳大利亚', 'Canada':'加拿大', 'United States':'美国' }
};

// GeoJSON name -> our country name mapping
const GEOJSON_NAME_MAP = {
  'United States of America': 'United States',
  'USA': 'United States'
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
  
  const high = pts.filter(p => (p.anomaly_level || 'normal') === 'high').length;
  const medium = pts.filter(p => (p.anomaly_level || 'normal') === 'medium').length;
  const normal = pts.filter(p => (p.anomaly_level || 'normal') === 'normal').length;
  
  let html = '<div class="info-block">' +
    '<div class="title-row">' +
    '<span class="name">' + admin1Name + '</span>' +
    '<span class="badge ' + (high > 0 ? 'high' : medium > 0 ? 'medium' : 'normal') + '">' +
    (high > 0 ? '重点关注' : medium > 0 ? '一般关注' : '正常监控') + '</span>' +
    '</div>' +
    '<div class="sub">' + cnCountry(country) + ' · ' + 
    (selectedCrop === 'all' ? '全部品种' : cnCrop(selectedCrop)) + 
    ' · ' + pts.length + ' 个产区</div>' +
    '<div class="data-grid" style="margin-top:10px;">' +
    '<div class="data-cell"><span class="lbl">重点关注</span><span class="val high">' + high + '</span></div>' +
    '<div class="data-cell"><span class="lbl">一般关注</span><span class="val medium">' + medium + '</span></div>' +
    '<div class="data-cell"><span class="lbl">正常监控</span><span class="val normal">' + normal + '</span></div>' +
    '<div class="data-cell"><span class="lbl">产区数</span><span class="val">' + pts.length + '</span></div>' +
    '</div>' +
    '</div>';
  
  // Show individual points as a list in the detail panel
  html += '<div class="info-block"><h3>产区点位</h3>';
  pts.forEach(pt => {
    const lev = pt.anomaly_level || 'normal';
    html += '<div style="padding:6px 0;border-bottom:1px solid #f0f0f0;cursor:pointer;" ' +
      'onclick="showDetail(\'' + pt.weather_region_id + '\')">' +
      '<span class="badge ' + lev + '" style="margin-right:6px;">' + cnLevel(lev) + '</span>' +
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
  if(!allData.geojson) {
    debugInfo.matchedCountries = 0;
    updateMapStatus();
    return;
  }
  
  const dataCountries = [...new Set(allData.latest.map(x=>x.country))];
  let matched = 0;
  
  geoJsonLayer = L.geoJSON(allData.geojson, {
    filter: feature=>{
      const normalized = normalizeGeojsonName(feature.properties.name);
      const ok = dataCountries.includes(normalized);
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
      const popup = `<b>${cnCountry(normalized)}</b><br>产区：${pts.length} 个<br>重点：${high} · 一般：${medium}`;
      layer.bindTooltip(popup, {sticky:true});
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
      radius: lev==='high'?9:lev==='medium'?7:5,
      fillColor:c, color:'#fff', weight:1.5, opacity:1, fillOpacity:0.85
    }).addTo(map);
    m.bindTooltip(`<b>${pt.display_region_name}</b><br>${cnCrop(pt.crop_group)} · ${cnCountry(pt.country)}<br>${cnLabel(pt.anomaly_label)}`);
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
  const high=pts.filter(p=>(p.anomaly_level||'normal')==='high').length;
  const medium=pts.filter(p=>(p.anomaly_level||'normal')==='medium').length;
  const normal=pts.filter(p=>(p.anomaly_level||'normal')==='normal').length;
  
  const cs = (allData.countrySummary||[]).find(c=>c.country===country && (selectedCrop==='all'||c.crop_group===selectedCrop));
  
  let html = `
    <div class="info-block">
      <div class="title-row">
        <span class="name">${cnCountry(country)}</span>
        <span class="badge ${high>0?'high':medium>0?'medium':'normal'}">${high>0?'重点关注':medium>0?'一般关注':'正常监控'}</span>
      </div>
      <div class="sub">${selectedCrop==='all'?'全部品种':cnCrop(selectedCrop)} · ${pts.length} 个产区</div>
      <div class="data-grid" style="margin-top:10px;">
        <div class="data-cell"><span class="lbl">重点关注</span><span class="val high">${high}</span></div>
        <div class="data-cell"><span class="lbl">一般关注</span><span class="val medium">${medium}</span></div>
        <div class="data-cell"><span class="lbl">正常监控</span><span class="val normal">${normal}</span></div>
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
  
  let html = `
    <div class="info-block">
      <div class="title-row">
        <span class="name">${pt.display_region_name}</span>
        <span class="badge ${level}">${cnLevel(level)}</span>
      </div>
      <div class="sub">${cnCrop(pt.crop_group)} · ${cnCountry(pt.country)}${pt.admin1?' · '+pt.admin1:''}</div>
      ${pt.national_share!=null?`<div style="font-size:11px;color:var(--text3);margin-top:4px;">占该国产量 ${fmtNum(pt.national_share,2)}% · ${fmtNum(pt.production_tonnes,0)} 吨</div>`:''}
    </div>
  `;
  
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
    html += `
      <div class="info-block">
        <h3>近90天降雨</h3>
        <div class="chart-box small"><canvas id="chart-rain"></canvas></div>
      </div>
      <div class="info-block">
        <h3>近90天温度</h3>
        <div class="chart-box small"><canvas id="chart-temp"></canvas></div>
      </div>
    `;
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
  
  document.getElementById('detail-panel').innerHTML = html;
  
  if(hist.length>0){
    renderRainChart(hist);
    renderTempChart(hist);
  }
  if(fc.length>0) renderFcChart(fc);
}

function renderRainChart(hist){
  const ctx = document.getElementById('chart-rain');
  if(!ctx) return;
  if(charts.rain) charts.rain.destroy();
  const labels = hist.map(d=>d.date.slice(5));
  charts.rain = new Chart(ctx,{
    type:'bar',
    data:{ labels, datasets:[{
      label:'降雨 mm', data:hist.map(d=>d.precipitation_mm),
      backgroundColor:'rgba(59,130,246,0.4)', barThickness:3
    }] },
    options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}},
      scales:{ x:{display:false}, y:{grid:{color:'#f3f4f6'}, ticks:{font:{size:9}} } }
  });
}

function renderTempChart(hist){
  const ctx = document.getElementById('chart-temp');
  if(!ctx) return;
  if(charts.temp) charts.temp.destroy();
  const labels = hist.map(d=>d.date.slice(5));
  charts.temp = new Chart(ctx,{
    type:'line',
    data:{ labels, datasets:[
      {label:'最高温', data:hist.map(d=>d.temp_max_c), borderColor:'#f59e0b', borderWidth:1.5, pointRadius:0, tension:0.3},
      {label:'最低温', data:hist.map(d=>d.temp_min_c), borderColor:'#3b82f6', borderWidth:1.5, pointRadius:0, tension:0.3}
    ]},
    options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{labels:{boxWidth:8,font:{size:9}}}},
      scales:{ x:{display:false}, y:{grid:{color:'#f3f4f6'}, ticks:{font:{size:9}} } }
  });
}

function renderFcChart(fc){
  const ctx = document.getElementById('chart-fc');
  if(!ctx) return;
  if(charts.fc) charts.fc.destroy();
  const labels = fc.map(d=>d.target_date.slice(5));
  charts.fc = new Chart(ctx,{
    type:'bar',
    data:{ labels, datasets:[
      {type:'line', label:'最高温', data:fc.map(d=>d.temp_max_c), borderColor:'#f59e0b', borderWidth:1.5, pointRadius:1, yAxisID:'y', tension:0.3},
      {type:'line', label:'最低温', data:fc.map(d=>d.temp_min_c), borderColor:'#3b82f6', borderWidth:1.5, pointRadius:1, yAxisID:'y', tension:0.3},
      {type:'bar', label:'降雨', data:fc.map(d=>d.precipitation_mm), backgroundColor:'rgba(59,130,246,0.25)', yAxisID:'y1', barThickness:5}
    ]},
    options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{labels:{boxWidth:8,font:{size:9}}}},
      scales:{ x:{ticks:{font:{size:8},maxTicksLimit:8}}, y:{position:'left',grid:{color:'#f3f4f6'},ticks:{font:{size:9}}}, y1:{position:'right',grid:{display:false},ticks:{font:{size:9}},min:0} }
  });
}

async function init(){
  initMap();
  
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