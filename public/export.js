/* Hey Trip export: self-contained PDF (browser print) and PNG (Canvas). */
(() => {
  'use strict';
  const fmt = d => d ? String(d).split('-').reverse().join('/') : '';
  const money = n => Number(n || 0).toLocaleString('vi-VN') + ' ₫';
  const escapeHtml = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeName = s => String(s || 'chuyen-di').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').replace(/[^a-zA-Z0-9_-]+/g,'-').slice(0,60);
  let busy = false;
  const api = async path => { const r = await fetch('/api/' + path, {cache:'no-store'}); if (!r.ok) throw Error('Không tải được dữ liệu: ' + path); return r.json(); };
  async function getData(id) {
    const [trip, itinerary, checklist, transactions] = await Promise.all([
      api('trips/' + id), api('itinerary?trip_id=' + id), api('checklist?trip_id=' + id), api('transactions?trip_id=' + id)
    ]);
    return {trip, itinerary: itinerary.sort((a,b) => (a.activity_date+' '+(a.start_time||'')).localeCompare(b.activity_date+' '+(b.start_time||''))), checklist, transactions};
  }
  function sections(d) {
    const inc=d.transactions.filter(x=>x.type==='income').reduce((s,x)=>s+Number(x.amount),0);
    const out=d.transactions.filter(x=>x.type==='expense').reduce((s,x)=>s+Number(x.amount),0);
    const byDate = new Map();
    d.itinerary.forEach(x => { if(!byDate.has(x.activity_date)) byDate.set(x.activity_date, []); byDate.get(x.activity_date).push(x); });
    const days = [...byDate].map(([date,rows])=>`<section class="day"><h2>📅 ${escapeHtml(fmt(date))}</h2>${rows.map(x=>`<div class="activity"><strong>${escapeHtml(x.start_time||'Cả ngày')} · ${escapeHtml(x.title)}</strong>${x.location_text?`<div>📍 ${escapeHtml(x.location_text)}</div>`:''}${x.notes?`<div class="muted">${escapeHtml(x.notes)}</div>`:''}</div>`).join('')}</section>`).join('') || '<p>Chưa có hoạt động.</p>';
    const checks=d.checklist.map(x=>`<div class="check">${x.is_completed?'☑':'☐'} ${escapeHtml(x.title)}${x.category?` <span class="muted">(${escapeHtml(x.category)})</span>`:''}</div>`).join('') || '<p>Chưa có mục chuẩn bị.</p>';
    const tx=d.transactions.map(x=>`<div class="activity"><strong>${x.type==='income'?'Thu':'Chi'} · ${escapeHtml(x.category)} — ${money(x.amount)}</strong><div class="muted">${escapeHtml(fmt(x.transaction_date))}${x.notes?' · '+escapeHtml(x.notes):''}</div></div>`).join('') || '<p>Chưa có giao dịch.</p>';
    return {days,checks,tx,inc,out};
  }
  function buildHtml(d) {
    const s=sections(d);
    return `<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>${escapeHtml(d.trip.title)} — Hey Trip</title><style>
    @page{size:A4;margin:17mm}*{box-sizing:border-box}body{font-family:Arial,'Segoe UI',sans-serif;color:#273a3b;line-height:1.55;margin:0;background:#fff}header{border-bottom:3px solid #6aaba6;padding-bottom:16px;margin-bottom:18px}.brand{color:#367e79;font-size:13px;letter-spacing:2px;font-weight:bold}h1{font-size:28px;margin:10px 0 5px}h2{font-size:17px;color:#367e79;margin:22px 0 10px}.muted{color:#687c7b;font-size:13px}.meta{font-size:14px}.summary{background:#edf7f4;padding:13px 16px;border-radius:12px;margin:16px 0}.day{break-inside:avoid-page}.activity{padding:10px 0;border-bottom:1px solid #e6eded;break-inside:avoid}.check{padding:5px 0;break-inside:avoid}section{margin-top:16px}footer{margin-top:35px;font-size:11px;color:#789;text-align:center} @media screen{body{max-width:800px;margin:30px auto;padding:20px}} </style></head><body><header><div class="brand">HEY TRIP · TRAVEL JOURNAL</div><h1>${escapeHtml(d.trip.title)}</h1><div class="meta">📍 ${escapeHtml(d.trip.destination)} · 🗓 ${fmt(d.trip.start_date)} – ${fmt(d.trip.end_date)}</div>${d.trip.notes?`<p class="muted">${escapeHtml(d.trip.notes)}</p>`:''}</header><div class="summary"><strong>Ngân sách:</strong> ${d.trip.budget==null?'Chưa đặt':money(d.trip.budget)} &nbsp; | &nbsp; <strong>Thu:</strong> ${money(s.inc)} &nbsp; | &nbsp; <strong>Chi:</strong> ${money(s.out)}<div><strong>Ngân sách còn lại:</strong> ${d.trip.budget==null?'Chưa đặt':money(Number(d.trip.budget)-s.out)}</div></div><section><h2>Lịch trình chi tiết</h2>${s.days}</section><section><h2>Checklist</h2>${s.checks}</section><section><h2>Thu chi</h2>${s.tx}</section><footer>Được tạo từ Hey Trip · Chúc bạn một chuyến đi tuyệt vời!</footer></body></html>`;
  }
  function printPdf(d) {
    const frame=document.createElement('iframe');
    frame.style.cssText='position:fixed;width:0;height:0;border:0;opacity:0;pointer-events:none';
    document.body.appendChild(frame);
    frame.onload=()=>{
      try { frame.contentWindow.focus(); frame.contentWindow.print(); }
      catch(e){alert('Không mở được cửa sổ in. Vui lòng thử lại trên trình duyệt Chrome.');}
      setTimeout(()=>frame.remove(),60000);
    };
    frame.srcdoc=buildHtml(d);
  }
  function pngLines(d) {
    const lines=[]; const add=(text,kind='normal')=>lines.push({text:String(text??''),kind});
    add('HEY TRIP  ·  TRAVEL JOURNAL','eyebrow'); add(d.trip.title,'title');
    add('Điểm đến: '+d.trip.destination); add('Thời gian: '+fmt(d.trip.start_date)+' – '+fmt(d.trip.end_date));
    if(d.trip.notes) add('Ghi chú: '+d.trip.notes);
    const s=sections(d); add('Ngân sách: '+(d.trip.budget==null?'Chưa đặt':money(d.trip.budget)),'sub');
    add('Tổng thu: '+money(s.inc)+'  |  Tổng chi: '+money(s.out));
    add('Ngân sách còn lại: '+(d.trip.budget==null?'Chưa đặt':money(Number(d.trip.budget)-s.out)));
    add('LỊCH TRÌNH','heading');
    let last=''; d.itinerary.forEach(x=>{if(last!==x.activity_date){last=x.activity_date;add(fmt(last),'sub');}add((x.start_time||'Cả ngày')+' · '+x.title,'strong');if(x.location_text)add('Địa điểm: '+x.location_text);if(x.notes)add(x.notes);});
    if(!d.itinerary.length)add('Chưa có hoạt động.');
    add('CHECKLIST','heading'); d.checklist.forEach(x=>add((x.is_completed?'[x] ':'[ ] ')+x.title+(x.category?' ('+x.category+')':'')));if(!d.checklist.length)add('Chưa có mục chuẩn bị.');
    add('THU CHI','heading');d.transactions.forEach(x=>add((x.type==='income'?'Thu: ':'Chi: ')+x.category+' — '+money(x.amount)+' · '+fmt(x.transaction_date)+(x.notes?' · '+x.notes:'')));if(!d.transactions.length)add('Chưa có giao dịch.');
    add('Hey Trip · Chúc bạn một chuyến đi tuyệt vời!','footer'); return lines;
  }
  function wrap(ctx,text,maxWidth) {
    const result=[];
    for(const paragraph of String(text).split('\n')){
      let line='';
      for(const word of paragraph.split(/\s+/)){
        const candidate=line?line+' '+word:word;
        if(ctx.measureText(candidate).width>maxWidth&&line){result.push(line);line=word;}else line=candidate;
      }
      result.push(line);
    }
    return result;
  }
  function downloadPng(d) {
    const width=1080,pad=75,maxText=width-pad*2;
    const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
    const lines=pngLines(d);
    function style(kind){const size=kind==='title'?42:kind==='heading'?30:kind==='sub'?25:kind==='eyebrow'?21:kind==='footer'?19:24;ctx.font=`${['title','heading','sub','strong','eyebrow'].includes(kind)?'bold':'normal'} ${size}px Arial, sans-serif`;return {size,height:Math.round(size*1.45),extra:kind==='heading'?26:kind==='title'?15:kind==='sub'?8:kind==='footer'?30:0};}
    canvas.width=width;ctx.textBaseline='top';
    let height=pad;const layout=[];
    for(const item of lines){const st=style(item.kind);const wrapped=wrap(ctx,item.text,maxText);layout.push({...item,wrapped,...st});height+=st.extra+wrapped.length*st.height+6;}
    height+=pad;
    if(height>30000)throw Error('Lịch trình quá dài để xuất một ảnh PNG. Hãy dùng PDF cho chuyến đi này.');
    canvas.height=Math.ceil(height);ctx.fillStyle='#fffdf8';ctx.fillRect(0,0,width,canvas.height);
    ctx.fillStyle='#e5f2ef';ctx.fillRect(0,0,width,15);
    let y=pad;ctx.textBaseline='top';
    for(const item of layout){y+=item.extra;style(item.kind);ctx.fillStyle=item.kind==='heading'||item.kind==='eyebrow'?'#327f7a':item.kind==='footer'?'#80908f':'#273a3b';for(const line of item.wrapped){ctx.fillText(line,pad,y);y+=item.height;}y+=6;}
    const a=document.createElement('a');a.download='HeyTrip-'+safeName(d.trip.title)+'.png';a.href=canvas.toDataURL('image/png');document.body.appendChild(a);a.click();a.remove();
  }
  async function run(kind,id,button){if(busy)return;busy=true;const original=button.textContent;button.disabled=true;button.textContent='Đang chuẩn bị...';try{const d=await getData(id);if(kind==='pdf')printPdf(d);else downloadPng(d);}catch(e){alert('Không thể xuất lịch trình: '+e.message);}finally{button.disabled=false;button.textContent=original;busy=false;}}
  function mount(){
    const edit=document.querySelector('#edit-trip');
    const existing=document.querySelector('#ht-export-buttons');
    if(!edit){existing?.remove();return;}
    if(existing)return;
    const id=Number(new URLSearchParams(location.search).get('trip_id'));
    // The current Hey Trip UI keeps the selected trip in a private variable. Read its id from the edit handler closure is impossible;
    // instead track trip selection via card clicks, and fallback to the current trip title matched from API.
    const bar=document.createElement('div');bar.id='ht-export-buttons';bar.style.cssText='display:flex;gap:8px;flex-wrap:wrap;margin:12px 0';
    for(const [kind,label] of [['pdf','📄 Xuất PDF'],['png','🖼 Tải ảnh PNG']]){
      const b=document.createElement('button');b.type='button';b.className='secondary small';b.textContent=label;
      b.addEventListener('click',async()=>{
        let selected=window.__heyTripExportSelectedId||id;
        if(!selected){try{const all=await api('trips');const title=document.querySelector('.trip-title')?.textContent?.trim();const matches=all.filter(t=>t.title===title);if(matches.length===1)selected=matches[0].id;}catch(e){}
        }
        if(!selected){alert('Chưa xác định được chuyến đi. Vui lòng quay về danh sách và mở lại chuyến đi.');return;}
        run(kind,selected,b);
      });bar.appendChild(b);
    }
    edit.closest('.stack')?.insertAdjacentElement('afterend',bar);
  }
  document.addEventListener('click',e=>{
    const card=e.target.closest('[data-trip]');
    if(card&&!e.target.closest('[data-edittrip]'))window.__heyTripExportSelectedId=Number(card.dataset.trip);
    if(e.target.closest('#back,#home'))window.__heyTripExportSelectedId=null;
  },true);
  const obs=new MutationObserver(()=>mount());
  const start=()=>{const app=document.querySelector('#app');if(app){obs.observe(app,{childList:true,subtree:false});mount();}};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
