/* Palm-only module states. Missing evidence stays null and is never coerced to normal. */
(function () {
  const n = x => Number.isFinite(Number(x)) ? Number(x) : null;
  const first = (...xs) => xs.map(n).find(x => x !== null) ?? null;
  const labels = ['正常', '轻度异常', '一般关注', '重点跟踪', '显著压力'];
  const relative = (row, depth = 'root') => {
    const actual = first(depth === 'root' ? row.soil_water_rootzone : row.soil_water_surface);
    const normal = first(depth === 'root' ? row.soil_water_rootzone_normal : row.soil_water_surface_normal, depth === 'root' ? row.rootzone_normal : row.surface_normal);
    return actual !== null && normal !== null && normal > 0 ? actual / normal * 100 : null;
  };
  const percentile = (row, depth = 'root') => first(depth === 'root' ? row.rootzone_percentile : row.surface_percentile, depth === 'root' ? row.rootzone_sm_percentile_doy_7d : row.surface_sm_percentile_doy_7d);
  const rainRatio = (r) => first(r.rain_30d_ratio_2017_2025, r.rain_30d_ratio_recent5y);
  function classifyPalmRainState(r, context = {}) {
    const ratio = rainRatio(r, context.basis), amount = first(r.rain_30d_mm), dryDays = first(r.current_dry_spell_days), extreme = first(r.extreme_rain_days_30d), future = first(r.forecast_ratio_1_7d_2017_2025, r.forecast_ratio_1_7d_recent5y);
    if (ratio === null && amount === null && dryDays === null && extreme === null) return { level: null, label: '证据不足', direction: 'mixed', evidence: [], confidence: 'insufficient' };
    let dry = 0, wet = 0, evidence = [];
    if (ratio !== null) { if (ratio < 70) { dry = Math.max(dry, 3); evidence.push('30日降雨显著偏少'); } else if (ratio < 85) { dry = Math.max(dry, 2); evidence.push('30日降雨偏少'); } else if (ratio < 95) dry = Math.max(dry, 1); if (ratio > 150) { wet = Math.max(wet, 3); evidence.push('30日降雨显著偏多'); } else if (ratio > 115) wet = Math.max(wet, 2); else if (ratio > 105) wet = Math.max(wet, 1); }
    if (amount !== null) { if (amount < 50) dry = Math.max(dry, 3); else if (amount < 100) dry = Math.max(dry, 2); else if (amount < 150) dry = Math.max(dry, 1); }
    if (dryDays !== null) { if (dryDays >= 11) dry = Math.max(dry, 3); else if (dryDays >= 7) dry = Math.max(dry, 2); else if (dryDays >= 5) dry = Math.max(dry, 1); }
    if (extreme !== null && extreme > 0) wet = Math.max(wet, 2);
    const direction = dry && wet ? 'mixed' : dry ? 'dry' : wet ? 'wet' : 'normal';
    let level = Math.max(dry, wet); if (level >= 3 && future !== null && future >= 85 && direction === 'dry') level = 2;
    return { level, label: labels[level], direction, evidence, repairSignal: future === null ? 'unknown' : future < 85 ? 'no_relief' : 'repair', confidence: 'available', ratio, amount, dryDays, extreme };
  }
  function classifyPalmWaterState(r, depth = 'root') {
    const p = percentile(r, depth), rel = relative(r, depth);
    if (p === null && rel === null) return { level: null, label: '证据不足', direction: 'mixed', evidence: [], confidence: 'insufficient', percentile: p, relative: rel };
    const pd = p === null ? null : p < 10 ? 3 : p < 20 ? 2 : p < 30 ? 1 : p > 90 ? 3 : p > 80 ? 2 : p > 70 ? 1 : 0;
    const rd = rel === null ? null : rel < 70 ? 3 : rel < 85 ? 2 : rel < 95 ? 1 : rel > 130 ? 3 : rel > 115 ? 2 : rel > 105 ? 1 : 0;
    const pDir = p === null ? null : p < 30 ? 'dry' : p > 70 ? 'wet' : 'normal', rDir = rel === null ? null : rel < 95 ? 'dry' : rel > 105 ? 'wet' : 'normal';
    const direction = pDir && rDir && pDir !== 'normal' && rDir !== 'normal' && pDir !== rDir ? 'mixed' : (pDir !== 'normal' ? pDir : rDir || 'normal');
    let level = Math.max(pd ?? 0, rd ?? 0); if (direction === 'mixed') level = Math.min(level, 1); if (p === null || rel === null) level = Math.min(level, 1);
    const evidence = []; if (p !== null) evidence.push(`历史百分位 P${p.toFixed(0)}`); if (rel !== null) evidence.push(`相对常态 ${rel.toFixed(0)}%`);
    return { level, label: labels[level], direction, evidence, confidence: p === null || rel === null ? 'limited' : 'available', percentile: p, relative: rel };
  }
  function classifyPalmHeatDryState(r, context = {}) {
    const temp = first(r.temp_max_anomaly_c), vpd = first(r.vpd_percentile_30d, r.vpd_percentile_14d), rain = classifyPalmRainState(r, context), water = classifyPalmWaterState(r, 'root'), dryDays = first(r.current_dry_spell_days);
    const drySignals = [rain.ratio !== null && rain.ratio < 85, water.percentile !== null && water.percentile < 30, water.relative !== null && water.relative < 95, vpd !== null && vpd >= 80, dryDays !== null && dryDays >= 7].filter(Boolean).length;
    const severe = [rain.ratio !== null && rain.ratio < 70, water.percentile !== null && water.percentile < 20, water.relative !== null && water.relative < 85, vpd !== null && vpd >= 90, dryDays !== null && dryDays >= 11].filter(Boolean).length;
    if (temp === null) return { level: null, label: '证据不足', evidence: [], confidence: 'insufficient' };
    let level = temp >= 1.5 && drySignals >= 1 ? 1 : 0;
    if ((temp >= 2 && drySignals >= 2) || (vpd !== null && vpd >= 80 && water.direction === 'dry')) level = 2;
    if ((temp >= 3 && vpd !== null && vpd >= 80 && water.percentile !== null && water.percentile < 20) || (temp >= 3 && rain.ratio !== null && rain.ratio < 85 && water.relative !== null && water.relative < 90) || (temp >= 2.5 && severe >= 2)) level = 3;
    if (temp >= 3 && vpd !== null && vpd >= 90 && (water.percentile !== null && water.percentile < 10 || water.relative !== null && water.relative < 80) && (rain.ratio !== null && rain.ratio < 70 || dryDays !== null && dryDays >= 11) && rain.repairSignal === 'no_relief') level = 4;
    return { level, label: ['未触发', '轻度热干信号', '一般热干关注', '重点热干压力', '显著热干压力'][level], evidence: [`最高温距平 ${temp.toFixed(1)}℃`, `${drySignals}项偏干证据`], confidence: vpd === null ? 'limited（VPD未接入）' : 'available', temp, vpd, rain, water };
  }
  function classifyPalmSupplyRisk(r, context = {}) {
    const rain = classifyPalmRainState(r, context), water = classifyPalmWaterState(r, 'root'), heatDry = classifyPalmHeatDryState(r, context);
    const available = [rain, water, heatDry].filter(x => x.level !== null).length;
    if (!available) return { level: null, label: '暂无足够数据', direction: 'mixed', evidence: [], moduleStates: { rain, water, heatDry } };
    let score = (rain.level ?? 0) * .4 + (water.level ?? 0) * .35 + (heatDry.level ?? 0) * .25;
    let level = score < .75 ? 0 : score < 1.5 ? 1 : score < 2.25 ? 2 : score < 3.2 ? 3 : 4, adjustments = [];
    if (rain.direction === 'dry' && water.direction === 'dry' && rain.level >= 2 && water.level >= 2) { level++; adjustments.push('降雨偏少已向根区水分传导'); }
    if (heatDry.level >= 2 && water.direction === 'dry' && water.level >= 2) { level++; adjustments.push('热干信号与根区偏干同步'); }
    if (rain.level >= 2 && water.level >= 2 && heatDry.level >= 2 && rain.direction === 'dry' && water.direction === 'dry') { level++; adjustments.push('降雨、热干和水分三项同向共振'); }
    const high = [rain.level, water.level, heatDry.level].filter(x => x !== null && x >= 2).length; if (high <= 1) level = Math.min(level, 2); if (available === 1) level = Math.min(level, 1);
    return { level: Math.min(4, level), label: labels[Math.min(4, level)], direction: rain.direction === 'dry' && water.direction === 'dry' ? 'dry' : rain.direction === 'wet' && water.direction === 'wet' ? 'wet' : 'mixed', baseScore: score, adjustments, evidence: [...rain.evidence, ...water.evidence, ...heatDry.evidence], moduleStates: { rain, water, heatDry } };
  }
  window.PalmRisk = { first, relative, percentile, classifyPalmRainState, classifyPalmWaterState, classifyPalmHeatDryState, classifyPalmSupplyRisk };
})();
