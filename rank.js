// CourtLedger rankings (AP + DPM). Needs window.RANK (data/rank.js) and NPINDEX (data/index.js).
(()=>{
const R=window.RANK,P=document.body.dataset.page,$=s=>document.querySelector(s),C=R.comp;
const SEAS=Object.keys(R.seasons).sort();
const qs=new URLSearchParams(location.search);
let key=qs.get('c')||localStorage.c||(C+'_'+R.default);if(!R.seasons[key.split('_')[1]])key=C+'_'+R.default;
let S=key.split('_')[1];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const sg=(x,d=1)=>(x>0?'+':x<0?'−':'')+Math.abs(x).toFixed(d), cl=x=>x>0?'p':x<0?'n':'';
const nm=n=>{const [l,f]=String(n).split(', ');const t=s=>s.toLowerCase().replace(/(^|[\s\-'])\S/g,m=>m.toUpperCase());const o=f?t(f)+' '+t(l):t(l);return o.replace(/\b(Ii|Iii|Iv)\b/g,m=>m.toUpperCase())};
const rng=r=>r.map(x=>Array.isArray(x)?x[0]+'–'+x[1]:x).join(', ');
const fmtD=d=>{if(!d)return'';const t=new Date(d+'T12:00:00');return t.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})};
$('#built').textContent=R.built;
function setNav(){document.querySelectorAll('header a[href*=".html"], footer a[href*=".html"], .duo a, a.keep').forEach(a=>{const u=a.getAttribute('href').split('?')[0];a.setAttribute('href',u+'?c='+key)});
 document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('on',a.dataset.p===P));}
const cs=$('#comp');if(cs){cs.innerHTML=SEAS.slice().reverse().map(s=>`<option value="${C}_${s}" ${s===S?'selected':''}>EuroLeague ${R.seasons[s].label}</option>`).join('');cs.onchange=e=>setSeason(e.target.value.split('_')[1])}
function setSeason(s){S=s;key=C+'_'+s;localStorage.c=key;const u=new URL(location);u.searchParams.set('c',key);history.replaceState(null,'',u);if(cs)cs.value=key;setNav();fresh();if(board)board.reset();leaders()}
function fresh(){const z=R.seasons[S],a=z.ap,d=R.dpm_asof;
 document.querySelectorAll('[data-fresh=ap]').forEach(e=>e.innerHTML=a.n?`${R.seasons[S].label}: ${a.n} games (game ${rng(a.ranges)}), through ${fmtD(a.last_date)}`:'No games yet');
 document.querySelectorAll('[data-fresh=dpm]').forEach(e=>e.innerHTML=`Ratings through ${d.season.slice(1)}-${String(+d.season.slice(1)+1).slice(2)} game ${d.game} (${fmtD(d.date)})`);}
// ---------- generic sortable table
function table(el,cols,data,sort,onSort){
 el.innerHTML='<thead><tr>'+cols.map(c=>`<th class="${c.l?'l ':''}${c.c||''}${sort.k===c.k?' sorted':''}" data-k="${c.k}" ${c.t?`title="${c.t}"`:''}>${c.h}${sort.k===c.k?(sort.d>0?' ▲':' ▼'):''}</th>`).join('')+'</tr></thead><tbody>'+
 (data.length?data.map((r,i)=>'<tr>'+cols.map(c=>`<td class="${c.l?'l ':''}${c.c||''} ${c.cls?c.cls(r):''}">${c.f?c.f(r,i):r[c.k]}</td>`).join('')+'</tr>').join(''):`<tr><td class="l empty" colspan="${cols.length}">No players match these filters.</td></tr>`)+'</tbody>';
 el.querySelectorAll('th').forEach(th=>{if(th.dataset.k==='_')return;th.onclick=()=>{const k=th.dataset.k;onSort(sort.k===k?{k,d:-sort.d}:{k,d:typeof data[0]?.[k]==='string'?1:-1})}});}
const srt=(a,s)=>a.sort((x,y)=>{const A=x[s.k],B=y[s.k];return (typeof A==='string'?A.localeCompare(B):A-B)*s.d});
const bar=(v,mx,neg)=>`<span class="bar"><span style="width:${Math.min(100,Math.abs(v)/mx*100)}%" class="${v>=0?'bp':'bn'}"></span></span>`;
// ---------- boards
const VIEWS={tot:['Totals',''],pg:['Per game','/G'],p40:['Per 40','/40'],p100:['Per 100','/100']};
function apRows(){const a=R.seasons[S].ap;return a.rows.map(r=>{const v={tot:1,pg:1/r.g,p40:r.min?40/r.min:0,p100:r.ton?100/r.ton:0};return {...r,v,mpg:r.min/r.g}})}
const posList=rows=>[...new Set(rows.map(r=>r.pos).filter(Boolean))].sort();
function mkBoard(kind){
 const el=$('#board');let st;
 const apPID=()=>new Set(R.seasons[S].ap.rows.map(r=>r.pid));
 function defaults(){const rows=kind==='ap'?R.seasons[S].ap.rows:R.seasons[S].dpm.rows;const mg=Math.max(1,...rows.map(r=>r.g));const g=Math.max(1,Math.ceil(mg*0.4));
  return {view:(st&&st.view)||'pg',sort:kind==='ap'?{k:'np',d:-1}:{k:'dpm',d:-1},team:'',pos:'',q:'',minG:g,minMin:g*10,minCp:0,full:false}}
 function controls(){const z=R.seasons[S],rows=kind==='ap'?z.ap.rows:z.dpm.rows,prov=kind==='ap'&&z.ap.prov>0;
  el.innerHTML=`<div class="bhead"><h2>${kind==='ap'?'<i>01</i> AP (Added Points)':'<i>02</i> DPM'} <span class="sl">${z.label}</span></h2><span class="fresh" data-fresh="${kind}"></span></div>
  <div class="controls">
   <div class="ctl"><span>Season</span><div class="seg" id="seas">${SEAS.slice().reverse().map(s=>`<button data-s="${s}" class="${s===S?'on':''}">${R.seasons[s].label}</button>`).join('')}</div></div>
   ${kind==='ap'?`<div class="ctl"><span>Values</span><div class="seg" id="view">${Object.entries(VIEWS).map(([k,[l]])=>`<button data-v="${k}" class="${st.view===k?'on':''}">${l}</button>`).join('')}</div></div>`:''}
   <label class="ctl"><span>Team</span><select id="team"><option value="">All teams</option>${z.teams.map(t=>`<option ${t===st.team?'selected':''}>${t}</option>`).join('')}</select></label>
   <label class="ctl"><span>Position</span><select id="pos"><option value="">All</option>${posList(rows).map(t=>`<option ${t===st.pos?'selected':''}>${t}</option>`).join('')}</select></label>
   <label class="ctl"><span>Min. games</span><input type="number" id="minG" min="0" value="${st.minG}"></label>
   <label class="ctl"><span>Min. minutes</span><input type="number" id="minMin" min="0" step="10" value="${st.minMin}"></label>
   ${kind==='dpm'?`<label class="ctl"><span>Min. career poss.</span><input type="number" id="minCp" min="0" step="500" value="${st.minCp}"></label>`:''}
   <label class="ctl grow"><span>Search</span><input id="q" placeholder="Player name" value="${esc(st.q)}"></label>
   ${prov?`<label class="ctl chk"><input type="checkbox" id="full"> Full-defense games only</label>`:''}
  </div><div class="meta" id="meta"></div><div class="tw"><table class="tbl rk" id="lb"></table></div><p class="fine" id="fine"></p>`;
  el.querySelectorAll('#seas button').forEach(b=>b.onclick=()=>setSeason(b.dataset.s));
  if(kind==='ap')el.querySelectorAll('#view button').forEach(b=>b.onclick=()=>{st.view=b.dataset.v;el.querySelectorAll('#view button').forEach(x=>x.classList.toggle('on',x===b));draw()});
  [['team','team'],['pos','pos'],['q','q']].forEach(([id,k])=>$('#'+id).oninput=e=>{st[k]=e.target.value;draw()});
  [['minG','minG'],['minMin','minMin'],['minCp','minCp']].forEach(([id,k])=>{const i=$('#'+id);if(i)i.oninput=e=>{st[k]=+e.target.value||0;draw()}});
  const fu=$('#full');if(fu)fu.onchange=e=>{st.full=e.target.checked;draw()};
  fresh();draw()}
 function draw(){const q=st.q.toLowerCase(),flt=r=>r.g>=st.minG&&r.min>=st.minMin&&(!st.team||r.team===st.team)&&(!st.pos||r.pos===st.pos)&&(!q||r.name.toLowerCase().includes(q)||nm(r.name).toLowerCase().includes(q));
  const AP=apPID();
  const who=r=>{const n=nm(r.name),t=r.teams?` <small class="mut" title="Teams this season">${r.teams.join('/')}</small>`:'';return (kind==='dpm'&&!AP.has(r.pid)?esc(n):`<a href="player.html?c=${key}&p=${r.pid}">${esc(n)}</a>`)+t};
  if(kind==='ap'){
   const sfx=VIEWS[st.view][1];let d=apRows().filter(flt).map(r=>{const m=r.v[st.view];return {...r,O:r.off*m,Df:r.dfn*m,N:r.np*m}});
   const sk={np:'N',off:'O',dfn:'Df'}[st.sort.k]||st.sort.k;const s={k:sk,d:st.sort.d};srt(d,s);const mx=Math.max(...d.map(r=>Math.abs(r.N)),0.01);
   const dec=st.view==='tot'?1:2;
   table($('#lb'),[{h:'#',k:'_',c:'rkn',f:(r,i)=>i+1},{h:'Player',k:'name',l:1,c:'pl',f:who},{h:'Team',k:'team',l:1},{h:'Pos',k:'pos',l:1,c:'hm',f:r=>r.pos?r.pos[0]:''},
    {h:'G',k:'g'},{h:st.view==='pg'?'MPG':'MIN',k:st.view==='pg'?'mpg':'min',f:r=>st.view==='pg'?r.mpg.toFixed(1):r.min.toFixed(0)},
    {h:'O-AP'+sfx,k:'O',t:'Offensive Added Points',f:r=>sg(r.O,dec),cls:r=>cl(r.O)},{h:'D-AP'+sfx,k:'Df',t:'Defensive Added Points',f:r=>sg(r.Df,dec),cls:r=>cl(r.Df)},
    {h:'AP'+sfx,k:'N',c:'key',t:'Added Points',f:r=>`<b>${sg(r.N,dec)}</b>${bar(r.N,mx)}`,cls:r=>cl(r.N)}],d,s,ns=>{st.sort={k:{N:'np',O:'off',Df:'dfn'}[ns.k]||ns.k,d:ns.d};draw()});
   const a=R.seasons[S].ap;$('#meta').innerHTML=`<b>${d.length}</b> players · ${VIEWS[st.view][0].toLowerCase()} · ${a.n} games${a.prov?` · ${a.prov} with provisional defense`:''}`;
   $('#fine').innerHTML='Per 100 = per 100 team possessions while the player was on court. Per 40 = per 40 minutes played. In every game, the AP of all players on a team adds up to that team\'s final margin.';
  }else{
   let d=R.seasons[S].dpm.rows.filter(r=>flt(r)&&r.cp>=st.minCp).map(r=>({...r,mpg:r.g?r.min/r.g:0}));srt(d,st.sort);const mx=Math.max(...d.map(r=>Math.abs(r.dpm)),0.01);
   table($('#lb'),[{h:'#',k:'_',c:'rkn',f:(r,i)=>i+1},{h:'Player',k:'name',l:1,c:'pl',f:who},{h:'Team',k:'team',l:1},{h:'Pos',k:'pos',l:1,c:'hm',f:r=>r.pos?r.pos[0]:''},{h:'Age',k:'age',c:'hm',f:r=>r.age?r.age.toFixed(1):'—'},
    {h:'G',k:'g'},{h:'MPG',k:'mpg',f:r=>r.mpg.toFixed(1)},
    {h:'O-DPM',k:'o',t:'Offensive DPM',f:r=>sg(r.o,2),cls:r=>cl(r.o)},{h:'D-DPM',k:'d',t:'Defensive DPM',f:r=>sg(r.d,2),cls:r=>cl(r.d)},
    {h:'DPM',k:'dpm',c:'key dk',f:r=>`<b>${sg(r.dpm,2)}</b>${bar(r.dpm,mx)}`,cls:r=>cl(r.dpm)},
    {h:'Box',k:'box',c:'hm',t:'Box-score component',f:r=>sg(r.box,2)},{h:'RAPM',k:'rapm',c:'hm',t:'Lineup (RAPM) component',f:r=>sg(r.rapm,2)},{h:'Career poss.',k:'cp',c:'hm',f:r=>r.cp.toLocaleString('en')}],d,st.sort,ns=>{st.sort=ns;draw()});
   const z=R.seasons[S].dpm;$('#meta').innerHTML=`<b>${d.length}</b> players · games and minutes from ${z.n} games of ${R.seasons[S].label}`;
   $('#fine').innerHTML=`DPM is already a rate: points per 100 possessions above an average EuroLeague player. It is a current rating, so the season switch changes the player pool and the games/minutes, not the rating itself.`;
  }}
 st=defaults();
 return {reset(){const v=st.view;st=defaults();st.view=v;controls()},init(){controls()}}
}
// ---------- leaders strip (home)
function leaders(){const el=$('#leaders');if(!el)return;const z=R.seasons[S];
 const mg=Math.max(1,...z.ap.rows.map(r=>r.g)),gq=Math.max(1,Math.ceil(mg*0.4));
 const ap=z.ap.rows.filter(r=>r.g>=gq&&r.min>=gq*10).map(r=>({...r,x:r.np/r.g})).sort((a,b)=>b.x-a.x).slice(0,5);
 const dg=Math.max(1,...z.dpm.rows.map(r=>r.g)),dq=Math.max(1,Math.ceil(dg*0.4));
 const dp=z.dpm.rows.filter(r=>r.g>=dq&&r.min>=dq*10).sort((a,b)=>b.dpm-a.dpm).slice(0,5);
 const li=(r,v,i)=>`<li><span class="ix">${i+1}</span><span class="nm">${esc(nm(r.name))}<small>${r.team}</small></span><span class="v ${cl(v)}">${sg(v,2)}</span></li>`;
 el.innerHTML=`<div class="lcard ap"><h3>AP (Added Points) leaders <small>per game · ${z.label} · ${gq}+ games</small></h3><ol>${ap.map((r,i)=>li(r,r.x,i)).join('')||'<li class="mut">No games yet</li>'}</ol><a class="more-link" href="#board">Full AP (Added Points) ranking ↓</a></div>
 <div class="lcard dpm"><h3>DPM leaders <small>${z.label} players · ${dq}+ games</small></h3><ol>${dp.map((r,i)=>li(r,r.dpm,i)).join('')}</ol><a class="more-link keep" href="dpm.html">Full DPM ranking →</a></div>`;setNav()}
let board=null;
if(P==='index'||P==='dpm'){document.body.classList.add('rkpage');board=mkBoard(P==='index'?'ap':'dpm');board.init();leaders()}
if(P==='method'){const fe=$('#freshtbl');if(fe)fe.innerHTML='<tr><th class="l">Season</th><th class="l">AP (Added Points)</th><th class="l">DPM games in data</th></tr>'+SEAS.slice().reverse().map(s=>{const z=R.seasons[s];return `<tr><td class="l" style="white-space:nowrap">${z.label}</td><td class="l">${z.ap.n} games${z.ap.n?` (game ${rng(z.ap.ranges)}, to ${fmtD(z.ap.last_date)})`:''}</td><td class="l">${z.dpm.n} games${z.dpm.n?` (game ${rng(z.dpm.ranges)}, to ${fmtD(z.dpm.last_date)})`:''}</td></tr>`}).join('')}
setNav();fresh();
})();
