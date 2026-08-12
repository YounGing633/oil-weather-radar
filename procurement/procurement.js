(() => {
  const $ = id => document.getElementById(id);
  const OILS = { P: { name: '棕榈油', code: 'P' }, Y: { name: '豆油', code: 'Y' }, OI: { name: '菜油', code: 'OI' } };
  const COLORS = { P1: '#1d5944', P5: '#c4832d' };
  let payload = null;
  let selected = 'P';

  const n = x => Number.isFinite(Number(x)) ? Number(x) : 0;
  const fmt = (x, d = 1) => Number.isFinite(Number(x)) ? Number(x).toFixed(d) : '—';
  const pct = x => `${n(x) >= 0 ? '+' : ''}${fmt(x, 2)}%`;
  const esc = x => String(x ?? '—').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const byVariety = variety => payload.items.filter(x => x.variety === variety);
  const maxRisk = rows => rows.reduce((a, b) => n(b['等待上涨风险']) > n(a['等待上涨风险']) ? b : a);
  const riskClass = x => n(x) >= 65 ? 'high' : '';

  function renderHero() {
    const top = maxRisk(payload.items);
    const oil = OILS[top.variety];
    $('topRisk').textContent = fmt(top['等待上涨风险'], 1);
    $('topRiskName').textContent = `${oil.name} ${top['合约桶']} · ${top['具体合约']}`;
    $('heroTitle').textContent = `今日优先关注：${oil.name}`;
    $('heroCopy').textContent = `${top['建议']}。${top['具体合约']}等待风险为 ${fmt(top['等待上涨风险'])}，买贵风险为 ${fmt(top['买贵风险'])}；当前应更重视等待成本，同时保留分批执行空间。`;
  }

  function renderOverview() {
    $('oilOverview').innerHTML = Object.keys(OILS).map(key => {
      const rows = byVariety(key), lead = maxRisk(rows);
      const avgBuy = rows.reduce((s, x) => s + n(x['买贵风险']), 0) / rows.length;
      return `<article class="oil-card ${selected === key ? 'active' : ''}" data-variety="${key}" tabindex="0">
        <div class="oil-card-head"><h3>${OILS[key].name}</h3><span class="oil-code">${key}</span></div>
        <div class="oil-card-score"><strong>${fmt(lead['等待上涨风险'])}</strong><span>最高等待风险</span></div>
        <div class="oil-card-foot"><span>买贵风险 ${fmt(avgBuy)}</span><span class="action-text">${esc(lead['建议'])}</span></div>
      </article>`;
    }).join('');
    document.querySelectorAll('.oil-card').forEach(card => {
      const choose = () => selectVariety(card.dataset.variety);
      card.onclick = choose;
      card.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') choose(); };
    });
  }

  function renderTabs() {
    $('oilTabs').innerHTML = Object.keys(OILS).map(key => `<button class="${selected === key ? 'active' : ''}" data-variety="${key}">${OILS[key].name}</button>`).join('');
    $('oilTabs').querySelectorAll('button').forEach(b => b.onclick = () => selectVariety(b.dataset.variety));
  }

  function decisionSentence(rows) {
    const preferred = maxRisk(rows);
    const other = rows.find(x => x !== preferred);
    const diff = n(preferred['等待上涨风险']) - n(other['等待上涨风险']);
    if (Math.abs(diff) < 3) return `P1与P5风险接近，可结合实际交货月份同步观察。当前共同建议为“${preferred['建议']}”。`;
    return `${preferred['合约桶']}（${preferred['具体合约']}）等待上涨风险更高，较另一目标合约高 ${fmt(Math.abs(diff))} 分，应优先纳入采购观察。`;
  }

  function renderDecision(rows) {
    const lead = maxRisk(rows);
    $('decisionTitle').textContent = `${OILS[selected].name} · ${lead['建议']}`;
    $('stageBadge').textContent = `${lead['采购档位']}档`;
    $('decisionCopy').textContent = decisionSentence(rows);
    $('riskBars').innerHTML = [
      ['等待上涨风险', lead['等待上涨风险'], 'wait'],
      ['当前买贵风险', lead['买贵风险'], 'buy']
    ].map(([label, value, cls]) => `<div><div class="risk-row-head"><b>${label}</b><span>${fmt(value)}</span></div><div class="risk-track"><div class="risk-fill ${cls}" style="width:${Math.min(100,n(value))}%"></div></div></div>`).join('');
  }

  function renderCompare(rows) {
    const preferred = maxRisk(rows);
    $('contractCompare').innerHTML = rows.sort((a,b) => a['合约桶'].localeCompare(b['合约桶'])).map(r => `<div class="contract-box ${r === preferred ? 'preferred' : ''}">
      <div class="contract-box-head"><div><b>${r['合约桶']}</b><small> ${esc(r['具体合约'])}</small></div>${r === preferred ? '<span class="action-text">优先观察</span>' : ''}</div>
      <strong>${fmt(r['收盘价'],0)}</strong>
      <dl><dt>等待风险</dt><dd>${fmt(r['等待上涨风险'])}</dd><dt>买贵风险</dt><dd>${fmt(r['买贵风险'])}</dd><dt>5日涨跌</dt><dd>${pct(r['5日涨跌幅%'])}</dd><dt>持仓变化</dt><dd>${pct(r['5日持仓变化%'])}</dd></dl>
    </div>`).join('');
  }

  function renderSignals(rows) {
    const lead = maxRisk(rows), spread = n(lead['P1-P5月差']);
    const signals = [
      {label:'短期趋势', value:pct(lead['5日涨跌幅%']), good:n(lead['5日涨跌幅%']) >= 0, note:'5日价格变化'},
      {label:'中期趋势', value:pct(lead['20日涨跌幅%']), good:n(lead['20日涨跌幅%']) >= 0, note:'20日价格变化'},
      {label:'资金与持仓', value:pct(lead['5日持仓变化%']), good:n(lead['5日持仓变化%']) >= 0, note:'5日持仓变化'},
      {label:'价格位置', value:pct(lead['相对20日均线%']), good:n(lead['相对20日均线%']) <= 3, note:'相对20日均线'},
      {label:'期限结构', value:`${spread >= 0 ? '+' : ''}${fmt(spread,0)}`, good:spread >= 0, note:'P1减P5月差'}
    ];
    $('signalList').innerHTML = signals.map(s => `<div class="signal"><span class="signal-dot ${s.good ? '' : 'negative'}"></span><div><b>${s.label}</b><small>${s.note}</small></div><strong>${s.value}</strong></div>`).join('');
  }

  function renderTable() {
    $('marketTable').innerHTML = payload.items.map(r => `<tr><td>${esc(r['品种'])}</td><td><b>${esc(r['具体合约'])}</b> · ${r['合约桶']}</td><td>${fmt(r['收盘价'],0)}</td><td>${pct(r['5日涨跌幅%'])}</td><td>${pct(r['20日涨跌幅%'])}</td><td>${pct(r['5日持仓变化%'])}</td><td>${fmt(r['P1-P5月差'],0)}</td><td><span class="risk-chip ${riskClass(r['等待上涨风险'])}">${fmt(r['等待上涨风险'])}</span></td><td><span class="risk-chip ${riskClass(r['买贵风险'])}">${fmt(r['买贵风险'])}</span></td><td><b>${esc(r['建议'])}</b></td></tr>`).join('');
  }

  function drawChart() {
    const rows = payload.history.filter(x => x.variety === selected).sort((a,b) => String(a.trade_date).localeCompare(String(b.trade_date)));
    const groups = {P1: rows.filter(x => x['合约桶'] === 'P1'), P5: rows.filter(x => x['合约桶'] === 'P5')};
    const canvas = $('priceChart'), box = canvas.parentElement.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(300, box.width) * dpr; canvas.height = Math.max(220, box.height) * dpr;
    const ctx = canvas.getContext('2d'); ctx.scale(dpr,dpr); const w=box.width,h=box.height,p={l:52,r:18,t:14,b:30};
    const all = [...groups.P1,...groups.P5]; $('chartEmpty').hidden = all.length > 3; if(all.length < 4) return;
    const values=all.map(x=>n(x.close)), min=Math.min(...values), max=Math.max(...values), pad=Math.max((max-min)*.12,20), lo=min-pad, hi=max+pad;
    const dates=[...new Set(all.map(x=>String(x.trade_date).slice(0,10)))].sort(); const x=d=>p.l+(dates.indexOf(String(d).slice(0,10))/Math.max(1,dates.length-1))*(w-p.l-p.r); const y=v=>p.t+(hi-v)/(hi-lo)*(h-p.t-p.b);
    ctx.font='11px system-ui'; ctx.fillStyle='#738078'; ctx.strokeStyle='#e4e8e5'; ctx.lineWidth=1;
    for(let i=0;i<5;i++){const yy=p.t+i*(h-p.t-p.b)/4,val=hi-i*(hi-lo)/4;ctx.beginPath();ctx.moveTo(p.l,yy);ctx.lineTo(w-p.r,yy);ctx.stroke();ctx.fillText(Math.round(val),5,yy+4)}
    [0,Math.floor((dates.length-1)/2),dates.length-1].forEach(i=>{ctx.fillText(dates[i].slice(5),x(dates[i])-15,h-8)});
    Object.entries(groups).forEach(([bucket,series])=>{ctx.strokeStyle=COLORS[bucket];ctx.lineWidth=2.3;ctx.beginPath();series.forEach((r,i)=>{const xx=x(r.trade_date),yy=y(n(r.close));i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy)});ctx.stroke()});
    $('chartLegend').innerHTML = Object.keys(groups).map(k=>`<span><i class="legend-dot" style="background:${COLORS[k]}"></i>${k}</span>`).join('');
  }

  function selectVariety(key) {
    selected = key; const rows = byVariety(key);
    renderOverview(); renderTabs(); renderDecision(rows); renderCompare(rows); renderSignals(rows); drawChart();
  }

  function downloadCsv() {
    const headers=['品种','合约桶','具体合约','收盘价','5日涨跌幅%','20日涨跌幅%','5日持仓变化%','P1-P5月差','等待上涨风险','买贵风险','建议'];
    const lines=[headers.join(','),...payload.items.map(r=>headers.map(h=>`"${String(r[h] ?? '').replace(/"/g,'""')}"`).join(','))];
    const blob=new Blob(['\ufeff'+lines.join('\n')],{type:'text/csv;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`采购风险雷达_${payload.meta.trade_date}.csv`;a.click();URL.revokeObjectURL(a.href);
  }

  async function init() {
    try {
      const response = await fetch('../data/futures_procurement_latest.json', {cache:'no-store'});
      if (!response.ok) throw new Error('尚未生成网站数据');
      payload = await response.json();
      if (!payload.items?.length) throw new Error('采购风险数据为空');
      $('asOf').textContent = `数据日 ${payload.meta.trade_date} · 生成 ${String(payload.meta.generated_at).replace('T',' ')}`;
      $('methodText').textContent = payload.meta.method;
      renderHero(); renderTable(); selectVariety(selected); $('downloadBtn').onclick=downloadCsv;
      let timer; window.addEventListener('resize',()=>{clearTimeout(timer);timer=setTimeout(drawChart,120)});
    } catch (e) {
      document.querySelector('main').innerHTML = `<div class="error-state"><h2>看板数据尚未就绪</h2><p>${esc(e.message)}。请先运行每日期货更新脚本，再刷新页面。</p></div>`;
      $('asOf').textContent='数据未就绪';
    }
  }
  init();
})();
