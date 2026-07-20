/* Shared legend/configuration access for the overview and every crop page. */
(function () {
  let config = null;
  const base = () => /\/(palm|oil)\//.test(location.pathname) ? '../assets/configs/' : './assets/configs/';
  const fallback = { no_data: { color: '#bdbdbd', label: '暂无数据' }, metrics: {}, risk: [] };
  async function load() {
    if (config) return config;
    try { config = await fetch(`${base()}legend_thresholds.json`, { cache: 'no-store' }).then(r => r.ok ? r.json() : fallback); }
    catch (_) { config = fallback; }
    return config;
  }
  const metric = key => (config?.metrics || {})[key] || null;
  function classifyMetric(key, value) {
    const m = metric(key), noData = config?.no_data || fallback.no_data;
    if (!m || value === null || value === undefined || !Number.isFinite(Number(value))) return { color: noData.color, label: noData.label, missing: true };
    const x = Number(value), bin = m.bins.find(item => item.max === null || x < item.max);
    return { ...bin, value: x, missing: false };
  }
  function getMetricLegend(key) { const m = metric(key); return m ? { ...m, noData: config?.no_data || fallback.no_data } : null; }
  function getRiskLevel(value, cropProfile) {
    const noData = config?.no_data || fallback.no_data;
    if (!Number.isFinite(Number(value))) return { color: noData.color, label: noData.label, missing: true };
    const bin = (config?.risk || []).find(item => Number(value) >= item.min);
    return { ...bin, value: Number(value), crop: cropProfile?.name || null, missing: false };
  }
  function getRiskLegend() { return { bins: config?.risk || [], noData: config?.no_data || fallback.no_data }; }
  window.LegendUtils = { load, classifyMetric, getMetricLegend, getRiskLevel, getRiskLegend };
})();
