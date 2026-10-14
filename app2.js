// Phase-2 pages. Uses globals from app.js: $, P, D, key, f, cl, G, PROV, table, srt, fill
const A=D.adv, PL=Object.fromEntries(A.players.map(p=>[p.pid,p])), NM=id=>(PL[id]||{}).name||id;
const short=n=>{const [l,fn]=n.split(', ');return (fn?fn[0]+'. ':'')+l.charAt(0)+l.slice(1).toLowerCase()};
const pc=v=>v==null?'transparent':`hsla(${210-(v/100)*185},80%,50%,${0.18+0.5*Math.abs(v-50)/50})`;
const LBL={ppg:'PTS',rpg:'REB',apg:'AST',spg:'STL',bpg:'BLK',tpg:'TOV',pir:'PIR',mpg:'MPG',fg:'FG%',fg3:'3P%',ft:'FT%',ts:'TS%',efg:'eFG%',usg:'USG%',astp:'AST%',orbp:'ORB%',drbp:'DRB%',rebp:'REB%',tovp:'TOV%',
 p100:'PTS/100',r100:'REB/100',a100:'AST/100',s100:'STL/100',b100:'BLK/100',np100:'AP/100',onp100:'O-AP/100',dnp100:'D-AP/100',np:'AP tot',dpm:'DPM',odpm:'O-DPM',ddpm:'D-DPM',onoff:'On-Off',pm:'+/-',min:'MIN',g:'G'};
const GR={box:['g','mpg','ppg','rpg','apg','spg','bpg','tpg','pir','fg','fg3','ft'],adv:['g','min','ts','efg','usg','astp','orbp','drbp','rebp','tovp'],p100:['g','min','p100','r100','a100','s100','b100'],imp:['g','min','np','np100','onp100','dnp100','onoff','dpm','odpm','ddpm']};
const NUMK=Object.keys(LBL);const fmt=(k,v)=>v==null?'—':(['np100','onp100','dnp100','dpm','odpm','ddpm','onoff','np','pm'].includes(k)?f(+v):(+v).toFixed(['g','min'].includes(k)?0:1));
const provG=D.games.filter(g=>g.prov).length;const provNote=provG?`<div class="note">${provG} of ${D.games.length} games have ${PROV}; Added Points defense in those games is minutes-only.</div>`:'';
function scatter(el,pts,xk,yk,hi){ // pts:[{x,y,label,id,c}]
 const W=1100,H=420,m=40;pts=pts.filter(p=>p.x!=null&&p.y!=null);if(!pts.length){el.innerHTML='';return}
 const xs=pts.map(p=>p.x),ys=pts.map(p=>p.y),x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
 const X=v=>m+(v-x0)/((x1-x0)||1)*(W-2*m),Y=v=>H-m-(v-y0)/((y1-y0)||1)*(H-2*m);
 const mx=xs.reduce((a,b)=>a+b)/xs.length,my=ys.reduce((a,b)=>a+b)/ys.length;
 el.innerHTML=`<div class="card"><svg viewBox="0 0 ${W} ${H}" width="100%"><line x1="${X(mx)}" x2="${X(mx)}" y1="${m}" y2="${H-m}" stroke="#263047" stroke-dasharray="4"/><line y1="${Y(my)}" y2="${Y(my)}" x1="${m}" x2="${W-m}" stroke="#263047" stroke-dasharray="4"/>
 <text x="${W/2}" y="${H-8}" text-anchor="middle">${xk} →</text><text x="12" y="${H/2}" transform="rotate(-90 12 ${H/2})" text-anchor="middle">${yk} →</text>
 <text x="${m}" y="${H-m+14}">${x0.toFixed(1)}</text><text x="${W-m}" y="${H-m+14}" text-anchor="end">${x1.toFixed(1)}</text><text x="${m-4}" y="${Y(y1)+4}" text-anchor="end">${y1.toFixed(1)}</text><text x="${m-4}" y="${Y(y0)}" text-anchor="end">${y0.toFixed(1)}</text>
 ${pts.map(p=>`<a href="player.html?c=${key}&p=${p.id}"><circle class="dot" cx="${X(p.x)}" cy="${Y(p.y)}" r="${hi&&hi.includes(p.id)?7:4.5}" fill="${p.c||'var(--acc)'}"><title>${p.label}: ${p.x}, ${p.y}</title></circle></a>`).join('')}
 ${pts.slice().sort((a,b)=>(b.x-mx)**2/((x1-x0)||1)**2+(b.y-my)**2/((y1-y0)||1)**2-((a.x-mx)**2/((x1-x0)||1)**2+(a.y-my)**2/((y1-y0)||1)**2)).slice(0,14).map(p=>`<text x="${X(p.x)+6}" y="${Y(p.y)-6}" style="fill:#e8ecf4">${p.raw?p.label:short(p.label)}</text>`).join('')}</svg></div>`}
function lineChart(el,series,yl){ // series:[{name,c,pts:[{x,y,t}]}]
 const W=1100,H=260,m=40,all=series.flatMap(s=>s.pts);if(!all.length){el.innerHTML='';return}
 const xs=[...new Set(all.map(p=>p.x))].sort((a,b)=>a-b),ys=all.map(p=>p.y),y0=Math.min(0,...ys),y1=Math.max(0,...ys);
 const X=v=>m+xs.indexOf(v)/Math.max(1,xs.length-1)*(W-2*m),Y=v=>H-m-(v-y0)/((y1-y0)||1)*(H-2*m);
 el.innerHTML=`<svg viewBox="0 0 ${W} ${H}" width="100%"><line x1="${m}" x2="${W-m}" y1="${Y(0)}" y2="${Y(0)}" stroke="#4a5570"/><text x="4" y="${m-8}">${yl}</text>
 ${xs.map(x=>`<text x="${X(x)}" y="${H-m+16}" text-anchor="middle">R${x}</text>`).join('')}
 ${series.map(s=>`<polyline fill="none" stroke="${s.c}" stroke-width="2" points="${s.pts.map(p=>X(p.x)+','+Y(p.y)).join(' ')}"/>`+s.pts.map(p=>`<rect x="${X(p.x)-9}" y="${Math.min(Y(0),Y(p.y))}" width="18" height="${Math.abs(Y(p.y)-Y(0))}" fill="${s.c}" opacity="${series.length>1?0:.35}"/><circle cx="${X(p.x)}" cy="${Y(p.y)}" r="5" fill="${p.prov?'#0b0f18':s.c}" stroke="${s.c}" stroke-width="2"><title>${p.t}</title></circle><text x="${X(p.x)}" y="${Y(p.y)-9}" text-anchor="middle" style="fill:${s.c}">${f(p.y)}</text>`).join('')).join('')}
 </svg><div style="font-size:11px;color:var(--mut)">${series.map(s=>`<span style="color:${s.c}">● ${s.name}</span>`).join(' · ')} · hollow dot = provisional defense game</div>`}
function pbars(p,keys,c){return keys.map(k=>{const v=p.pct[k];return `<div class="pbar"><span>${LBL[k]}</span><div class="tr"><div class="fl" style="width:${v??0}%;background:${c||pc(v)}"></div></div><b>${fmt(k,p[k])}</b><span style="color:var(--mut)">${v??'—'}</span></div>`}).join('')}
function popts(sel,def){$(sel).innerHTML=A.players.slice().sort((a,b)=>a.name.localeCompare(b.name)).map(p=>`<option value="${p.pid}" ${p.pid===def?'selected':''}>${p.name} (${p.team})</option>`).join('')}
const topNP=()=>A.players.filter(p=>p.min>=60).sort((a,b)=>b.np100-a.np100);
if(P==='stats'){
 fill('#team',[...new Set(A.players.map(p=>p.team))].sort());const opts=NUMK.map(k=>`<option value="${k}">${LBL[k]}</option>`).join('');
 $('#sx').innerHTML='<option value="">—</option>'+opts;$('#sy').innerHTML='<option value="">—</option>'+opts;$('#sx').value='usg';$('#sy').value='ts';
 let sort={k:'np100',d:-1},pick=[];
 function draw(){const g=$('#grp').value,t=$('#team').value,q=$('#q').value.toLowerCase(),mm=+$('#minmin').value;
  let d=A.players.filter(p=>p.min>=mm&&(!t||p.team===t)&&(!q||p.name.toLowerCase().includes(q)));if(!GR[g].includes(sort.k)&&sort.k!=='name')sort={k:GR[g].includes('np100')?'np100':GR[g][2],d:-1};
  d=d.slice().sort((a,b)=>sort.k==='name'?a.name.localeCompare(b.name)*sort.d:((a[sort.k]??-1e9)-(b[sort.k]??-1e9))*sort.d);
  const cols=[{h:'#',k:'_',f:(r,i)=>i+1},{h:'Player',k:'name',l:1,f:r=>`<a href="player.html?c=${key}&p=${r.pid}">${r.name}</a>`},{h:'Team',k:'team',l:1}].concat(GR[g].map(k=>({h:LBL[k]+(['g','min','mpg'].includes(k)?'':`<span class="sc ${$('#sx').value===k||$('#sy').value===k?'on':''}" data-s="${k}">◎</span>`),k,f:r=>{const v=r.pct&&r.pct[k];return `<span style="display:block;margin:-6px -8px;padding:6px 8px;background:${pc(v)}">${fmt(k,r[k])}</span>`}})));
  table($('#lb'),cols,d,sort,ns=>{sort=ns;draw()});
  $('#lb').querySelectorAll('.sc').forEach(s=>s.onclick=e=>{e.stopPropagation();pick.push(s.dataset.s);if(pick.length===2){$('#sx').value=pick[0];$('#sy').value=pick[1];pick=[]}else{$('#sx').value=s.dataset.s;$('#sy').value=''}draw()});
  const xk=$('#sx').value,yk=$('#sy').value;
  if(xk&&yk)scatter($('#scatter'),d.map(p=>({x:p[xk],y:p[yk],label:p.name,id:p.pid,c:pc(p.pct.np100)})),LBL[xk],LBL[yk]);else $('#scatter').innerHTML=xk?`<div class="note">Now pick a Y stat (click another ◎).</div>`:''}
 ['#grp','#team','#q','#minmin','#sx','#sy'].forEach(s=>$(s).oninput=draw);$('#clr').onclick=()=>{$('#sx').value='';$('#sy').value='';pick=[];draw()};draw()}
if(P==='player'){
 const sp=new URLSearchParams(location.search);popts('#player',sp.get('p')||topNP()[0].pid);
 function draw(){const p=PL[$('#player').value],rows=D.rows.filter(r=>r.pid===p.pid).sort((a,b)=>a.gc-b.gc),oo=A.onoff[p.pid],dk=D.darko.find(x=>x.pid===p.pid);
  const pv=rows.filter(r=>r.prov).length;
  $('#dash').innerHTML=`<div class="card"><h1 style="margin:0">${p.name} <small style="color:var(--mut)">#${p.dorsal||''} · ${p.team} · ${(D.rows.find(r=>r.pid===p.pid)||{}).pos||''}${dk?' · age '+(+dk.age).toFixed(1):''}</small></h1>
   <div style="margin-top:12px">${[['AP/100',f(p.np100),cl(p.np100)],['AP total',f(p.np),cl(p.np)],['DPM',p.dpm==null?'—':f(p.dpm),cl(p.dpm)],['On-Off',p.onoff==null?'—':f(p.onoff),cl(p.onoff)],['PTS',p.ppg],['REB',p.rpg],['AST',p.apg],['TS%',p.ts],['MPG',p.mpg],['G',p.g]].map(([l,v,c])=>`<div class="kpi"><b class="${c||''}">${v}</b><span>${l}</span></div>`).join('')}</div>
   ${pv?`<div class="note">${pv} of ${rows.length} games with ${PROV}.</div>`:''}</div>
   <div class="card"><h3 style="margin-top:0">Added Points by game</h3><div id="ch"></div></div>
   <div class="grid"><div class="card"><h3 style="margin-top:0">Scoring &amp; playmaking <small style="color:var(--mut)">percentile (60+ min)</small></h3>${pbars(p,['ppg','p100','ts','efg','fg3','ft','usg','astp','a100','tovp'])}</div>
   <div class="card"><h3 style="margin-top:0">Rebounding &amp; defense</h3>${pbars(p,['rebp','orbp','drbp','s100','b100'])}<h3>Impact</h3>${pbars(p,['np100','onp100','dnp100','dpm','odpm','ddpm'])}</div>
   <div class="card"><h3 style="margin-top:0">On / Off</h3>${oo?`<table class="tbl"><tr><th class="l"></th><th>ORtg</th><th>DRtg</th><th>Net</th><th>Poss</th></tr>${[['On court',oo.on],['Off court',oo.off]].map(([l,v])=>`<tr><td class="l">${l}</td><td>${v.ortg}</td><td>${v.drtg}</td><td class="${cl(v.net)}">${f(v.net)}</td><td>${v.poss.toFixed(0)}</td></tr>`).join('')}<tr><td class="l"><b>Difference</b></td><td></td><td></td><td class="${cl(oo.diff)}"><b>${f(oo.diff)}</b></td><td></td></tr></table><p style="font-size:12px"><a href="lineups.html?c=${key}&m=wowy&p=${p.pid}">With/without teammates →</a></p>`:'No stint data.'}
   ${dk?`<h3>DPM detail</h3><div class="pbar"><span>Box prior</span><span></span><b>${f(+dk.box)}</b><span></span></div><div class="pbar"><span>RAPM</span><span></span><b>${f(+dk.rapm)}</b><span></span></div><div class="pbar"><span>Career poss</span><span></span><b>${(+dk.cp).toFixed(0)}</b><span></span></div>`:''}</div></div>`;
  lineChart($('#ch'),[{name:'AP',c:'#ff7a1a',pts:rows.map(r=>({x:G[r.gc].round,y:r.np,prov:r.prov,t:`R${G[r.gc].round} vs ${r.opp}: ${f(r.np)} (${r.min.toFixed(0)} min)`}))}],'Added Points')}
 $('#player').onchange=draw;draw()}
if(P==='lineups'){
 const sp=new URLSearchParams(location.search),teams=[...new Set(A.players.map(p=>p.team))].sort();let mode=sp.get('m')||'onoff',sort={k:'net',d:-1};
 $('#team').innerHTML=teams.map(t=>`<option>${t}</option>`).join('');if(sp.get('p'))$('#team').value=PL[sp.get('p')].team;
 const setP=()=>{$('#p1').innerHTML=A.players.filter(p=>p.team===$('#team').value).sort((a,b)=>b.min-a.min).map(p=>`<option value="${p.pid}">${p.name}</option>`).join('');if(sp.get('p')&&PL[sp.get('p')].team===$('#team').value)$('#p1').value=sp.get('p')};setP();
 const R=(v,pre)=>[{h:pre+'ORtg',k:pre+'o',f:r=>r[pre+'o']},{h:pre+'DRtg',k:pre+'d',f:r=>r[pre+'d']},{h:pre+'Net',k:pre+'net',f:r=>`<b>${f(r[pre+'net'])}</b>`,cls:r=>cl(r[pre+'net'])},{h:pre+'Poss',k:pre+'poss',f:r=>r[pre+'poss'].toFixed(0)}];
 function draw(){$('#mode').querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.v===mode));$('#nlab').style.display=mode==='combo'?'':'none';$('#plab').style.display=mode==='wowy'?'':'none';
  const t=$('#team').value,mp=+$('#minp').value,o=$('#out');o.innerHTML='<table class="tbl" id="tb"></table>';let d,cols;
  if(mode==='onoff'){d=Object.entries(A.onoff).filter(([p,v])=>v.team===t&&v.on.poss>=mp).map(([p,v])=>({name:NM(p),pid:p,ono:v.on.ortg,ond:v.on.drtg,onnet:v.on.net,onposs:v.on.poss,offnet:v.off.net,offposs:v.off.poss,diff:v.diff,net:v.diff}));
   cols=[{h:'Player',k:'name',l:1,f:r=>`<a href="player.html?c=${key}&p=${r.pid}">${r.name}</a>`},{h:'On ORtg',k:'ono'},{h:'On DRtg',k:'ond'},{h:'On Net',k:'onnet',f:r=>f(r.onnet),cls:r=>cl(r.onnet)},{h:'On poss',k:'onposs',f:r=>r.onposs.toFixed(0)},{h:'Off Net',k:'offnet',f:r=>f(r.offnet),cls:r=>cl(r.offnet)},{h:'Off poss',k:'offposs',f:r=>r.offposs.toFixed(0)},{h:'On−Off',k:'net',f:r=>`<b>${f(r.diff)}</b>`,cls:r=>cl(r.diff)}]}
  else if(mode==='combo'){const n=+$('#n').value;d=A.lineups.filter(l=>l.team===t&&l.n===n&&l.poss>=mp).map(l=>({...l,name:l.ids.map(i=>short(NM(i))).join(' · ')}));
   cols=[{h:'Lineup',k:'name',l:1},{h:'Min',k:'min',f:r=>r.min.toFixed(0)},{h:'Poss',k:'poss',f:r=>r.poss.toFixed(0)},{h:'ORtg',k:'ortg'},{h:'DRtg',k:'drtg'},{h:'Net',k:'net',f:r=>`<b>${f(r.net)}</b>`,cls:r=>cl(r.net)}]}
  else{const me=$('#p1').value;d=Object.entries(A.pairs).filter(([k])=>k.split('|').includes(me)).map(([k,v])=>{const [a,b]=k.split('|'),mine=a===me,mate=mine?b:a,w=v.both,me_wo=mine?v.a_wo:v.b_wo,mate_wo=mine?v.b_wo:v.a_wo;
    return {name:NM(mate),pid:mate,wnet:w.net,wposs:w.poss,mwnet:me_wo.net,mwposs:me_wo.poss,tnet:mate_wo.net,tposs:mate_wo.poss,nnet:v.neither.net,nposs:v.neither.poss,net:w.net}}).filter(r=>r.wposs>=mp);
   const c=(k,h)=>({h,k,f:r=>`${f(r[k])} <small style="color:var(--mut)">${r[k.replace('net','poss')].toFixed(0)}</small>`,cls:r=>cl(r[k])});
   cols=[{h:'Teammate',k:'name',l:1,f:r=>`<a href="player.html?c=${key}&p=${r.pid}">${r.name}</a>`},c('wnet','Together'),c('mwnet',short(NM(me))+' without'),c('tnet','Teammate without'),c('nnet','Neither')];
   o.insertAdjacentHTML('afterbegin',`<p style="color:var(--mut)">Net rating (small = possessions). <b>${NM(me)}</b> with and without each teammate.</p>`)}
  if(!d.length){o.innerHTML+='<p>No rows above the possession threshold.</p>';return}
  table($('#tb'),cols,srt(d,sort),sort,ns=>{sort=ns;draw()})}
 $('#mode').onclick=e=>{if(e.target.dataset.v){mode=e.target.dataset.v;sort={k:'net',d:-1};draw()}};$('#team').onchange=()=>{setP();draw()};['#n','#p1','#minp'].forEach(s=>$(s).oninput=draw);draw()}
if(P==='pvp'){
 const sp=new URLSearchParams(location.search),t=topNP();popts('#pa',sp.get('a')||t[0].pid);popts('#pb',sp.get('b')||t[1].pid);
 function draw(){const a=PL[$('#pa').value],b=PL[$('#pb').value],CA='#ff7a1a',CB='#3fa9f5';
  const keys=['ppg','rpg','apg','ts','usg','astp','rebp','tovp','p100','s100','b100','np100','onp100','dnp100','dpm','onoff','mpg'];
  const row=k=>{const va=a[k],vb=b[k],low=k==='tovp',w=va==null||vb==null?0:(low?(va<vb?1:va>vb?2:0):(va>vb?1:va<vb?2:0));return `<tr><td style="color:${w===1?CA:'inherit'}">${w===1?'◀ ':''}<b>${fmt(k,va)}</b> <small>${a.pct[k]??''}</small></td><td class="l" style="text-align:center;color:var(--mut)">${LBL[k]}</td><td class="l" style="color:${w===2?CB:'inherit'}"><small>${b.pct[k]??''}</small> <b>${fmt(k,vb)}</b>${w===2?' ▶':''}</td></tr>`};
  const ra=D.rows.filter(r=>r.pid===a.pid).sort((x,y)=>x.gc-y.gc),rb=D.rows.filter(r=>r.pid===b.pid).sort((x,y)=>x.gc-y.gc);
  $('#out').innerHTML=`<div class="grid"><div class="card" style="border-top:3px solid ${CA}"><h2 style="margin:0">${a.name}</h2><span style="color:var(--mut)">${a.team} · ${a.g} G · ${a.min.toFixed(0)} min</span>${pbars(a,['np100','dpm','ts','usg','astp','rebp'],CA)}</div>
  <div class="card" style="border-top:3px solid ${CB}"><h2 style="margin:0">${b.name}</h2><span style="color:var(--mut)">${b.team} · ${b.g} G · ${b.min.toFixed(0)} min</span>${pbars(b,['np100','dpm','ts','usg','astp','rebp'],CB)}</div></div>
  <div class="card"><table class="tbl" style="max-width:640px;margin:auto"><tr><th>${short(a.name)}</th><th style="text-align:center">stat (value · pct)</th><th class="l">${short(b.name)}</th></tr>${keys.map(row).join('')}</table></div>
  <div class="card"><h3 style="margin-top:0">Added Points by game</h3><div id="ch"></div></div>`;
  const s=(rs,n,c)=>({name:n,c,pts:rs.map(r=>({x:G[r.gc].round,y:r.np,prov:r.prov,t:`${n} R${G[r.gc].round}: ${f(r.np)}`}))});lineChart($('#ch'),[s(ra,short(a.name),CA),s(rb,short(b.name),CB)],'Added Points')}
 ['#pa','#pb'].forEach(s=>$(s).onchange=draw);draw()}
if(P==='trends'){
 fill('#team',[...new Set(A.players.map(p=>p.team))].sort());const rounds=[...new Set(D.games.map(g=>g.round))].sort((a,b)=>a-b);let sort={k:'delta',d:-1};
 function draw(){const X=+$('#x').value,mm=+$('#minmin').value,t=$('#team').value,by={};D.rows.forEach(r=>(by[r.pid]=by[r.pid]||[]).push(r));
  let d=Object.entries(by).map(([pid,rs])=>{rs.sort((a,b)=>a.gc-b.gc);const l=rs.slice(-X),S=x=>x.reduce((a,r)=>a+r.np,0)/x.reduce((a,r)=>a+r.ton,0)*100,p=PL[pid];
   return {pid,name:p.name,team:p.team,g:l.length,min:l.reduce((a,r)=>a+r.min,0),last:S(l),season:S(rs),delta:S(l)-S(rs),pts:l.reduce((a,r)=>a+r.pts,0)/l.length,spark:l.map(r=>r.np),prov:l.some(r=>r.prov)}})
   .filter(r=>r.g===X&&r.min>=mm&&(!t||r.team===t));
  const sk=v=>{const mx=Math.max(1,...v.map(Math.abs));return `<svg width="${v.length*14}" height="22">${v.map((y,i)=>`<rect x="${i*14}" y="${y>=0?11-y/mx*11:11}" width="10" height="${Math.abs(y)/mx*11}" fill="${y>=0?'#2fbf71':'#e5484d'}"/>`).join('')}</svg>`};
  table($('#lb'),[{h:'#',k:'_',f:(r,i)=>i+1},{h:'Player',k:'name',l:1,f:r=>`<a href="player.html?c=${key}&p=${r.pid}">${r.name}</a>${r.prov?' <span class="tag prov">prov</span>':''}`},{h:'Team',k:'team',l:1},{h:'Min',k:'min',f:r=>r.min.toFixed(0)},{h:'PTS/g',k:'pts',f:r=>r.pts.toFixed(1)},
   {h:'AP by game',k:'_s',f:r=>sk(r.spark)},{h:`Last ${X} AP/100`,k:'last',f:r=>`<b>${f(r.last)}</b>`,cls:r=>cl(r.last)},{h:'Season AP/100',k:'season',f:r=>f(r.season),cls:r=>cl(r.season)},{h:'Δ',k:'delta',f:r=>`<b>${f(r.delta)}</b>`,cls:r=>cl(r.delta)}],srt(d,sort),sort,ns=>{sort=ns;draw()})}
 ['#x','#minmin','#team'].forEach(s=>$(s).oninput=draw);draw()}
if(P==='teams'){
 let sort={k:'net',d:-1};const T=A.teams;
 scatter($('#sc'),T.map(t=>({x:t.ortg,y:-t.drtg,label:t.team,raw:1,id:'',c:t.net>=0?'#2fbf71':'#e5484d'})),'ORtg (better →)','−DRtg (better ↑)');
 $('#sc').querySelectorAll('a').forEach(a=>a.removeAttribute('href'));
 function draw(){table($('#lb'),[{h:'#',k:'_',f:(r,i)=>i+1},{h:'Team',k:'team',l:1,f:r=>`<a href="#" data-t="${r.team}">${r.team}</a>`},{h:'W',k:'w'},{h:'L',k:'l'},{h:'Pace',k:'pace'},{h:'ORtg',k:'ortg'},{h:'DRtg',k:'drtg'},{h:'Net',k:'net',f:r=>`<b>${f(r.net)}</b>`,cls:r=>cl(r.net)},
  {h:'FG%',k:'fgp'},{h:'TOV%',k:'tovp'},{h:'ORB%',k:'orbp'},{h:'FTr',k:'ftr'},{h:'Opp FG%',k:'ofgp'},{h:'Opp TOV%',k:'otovp'},{h:'DRB%',k:'drbp'},{h:'AST rate',k:'astr'}],srt(T.slice(),sort),sort,ns=>{sort=ns;draw()});
  $('#lb').querySelectorAll('[data-t]').forEach(a=>a.onclick=e=>{e.preventDefault();det(a.dataset.t)})}
 function det(tc){const t=T.find(x=>x.team===tc),ps=A.players.filter(p=>p.team===tc).sort((a,b)=>b.np-a.np);
  $('#det').innerHTML=`<div class="grid"><div class="card"><h3 style="margin-top:0">${tc} games</h3><table class="tbl">${t.games.map(g=>`<tr><td class="l">R${G[g.gc].round}</td><td class="l"><a href="games.html?c=${key}&g=${g.gc}">vs ${g.opp}</a></td><td class="${cl(g.pts-g.opp_pts)}">${g.pts}–${g.opp_pts}</td><td>${g.poss} poss</td><td>${G[g.gc].prov?PROV:''}</td></tr>`).join('')}</table></div>
  <div class="card"><h3 style="margin-top:0">${tc} Added Points (total)</h3><table class="tbl">${ps.map(p=>`<tr><td class="l"><a href="player.html?c=${key}&p=${p.pid}">${p.name}</a></td><td>${p.min.toFixed(0)} min</td><td class="${cl(p.np)}"><b>${f(p.np)}</b></td><td class="${cl(p.np100)}">${f(p.np100)}/100</td><td class="${cl(p.onoff)}">${p.onoff==null?'':'on-off '+f(p.onoff)}</td></tr>`).join('')}</table></div></div>`}
 draw();det(T.slice().sort((a,b)=>b.net-a.net)[0].team)}
if(['stats','player','trends','teams'].includes(P))document.querySelector('main').insertAdjacentHTML('afterbegin',provNote);
