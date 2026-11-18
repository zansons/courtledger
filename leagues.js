// CourtLedger: DPM (DARKO) boards for other competitions (EuroCup, Basketball Champions League). Needs window.LGDPM (data/dpm_*.js).
(()=>{
const K=(document.querySelector('[data-league]')||{dataset:{}}).dataset.league,Z=(window.LGDPM||{})[K],$=s=>document.querySelector(s);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const sg=(x,d=1)=>(x>0?'+':x<0?'−':'')+Math.abs(x).toFixed(d), cl=x=>x>0?'p':x<0?'n':'';
const nm=n=>{const [l,f]=String(n).split(', ');const t=s=>s.toLowerCase().replace(/(^|[\s\-'])\S/g,m=>m.toUpperCase());const o=f?t(f)+' '+t(l):t(l);return o.replace(/\b(Ii|Iii|Iv)\b/g,m=>m.toUpperCase())};
const fmtD=d=>{if(!d)return'';const t=new Date(d+'T12:00:00');return t.toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})};
const cs=$('#comp');if(cs)cs.closest('label').style.display='none';
const b=$('#built');if(b&&Z)b.textContent=Z.built;
document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('on',a.dataset.p===document.body.dataset.page));
const el=$('#board');if(!el)return;if(!Z){el.innerHTML='<p class="mut">No data yet.</p>';return}
document.querySelectorAll('[data-fresh=lg]').forEach(e=>e.textContent=`Ratings through ${fmtD(Z.last_date)} · ${Z.games} games of ${Z.name} ${Z.label}`);
document.querySelectorAll('[data-src]').forEach(e=>e.textContent=Z.source);
const bar=(v,mx)=>`<span class="bar"><span style="width:${Math.min(100,Math.abs(v)/mx*100)}%" class="${v>=0?'bp':'bn'}"></span></span>`;
const mg=Math.max(1,...Z.rows.map(r=>r.g)),g0=Math.max(1,Math.ceil(mg*0.4));
const st={sort:{k:'dpm',d:-1},team:'',pos:'',q:'',minG:g0,minMin:g0*10,minCp:0};
const posList=[...new Set(Z.rows.map(r=>r.pos).filter(Boolean))].sort();
el.innerHTML=`<div class="bhead"><h2><i>DPM</i> DPM (DARKO) · ${esc(Z.name)} <span class="sl">${Z.label}</span></h2><span class="fresh" data-fresh="lg"></span></div>
<div class="controls">
 <label class="ctl"><span>Team</span><select id="team"><option value="">All teams</option>${Z.teams.map(t=>`<option>${esc(t)}</option>`).join('')}</select></label>
 <label class="ctl"><span>Position</span><select id="pos"><option value="">All</option>${posList.map(t=>`<option>${esc(t)}</option>`).join('')}</select></label>
 <label class="ctl"><span>Min. games</span><input type="number" id="minG" min="0" value="${st.minG}"></label>
 <label class="ctl"><span>Min. minutes</span><input type="number" id="minMin" min="0" step="10" value="${st.minMin}"></label>
 <label class="ctl"><span>Min. career poss.</span><input type="number" id="minCp" min="0" step="500" value="0"></label>
 <label class="ctl grow"><span>Search</span><input id="q" placeholder="Player name"></label>
</div><div class="meta" id="meta"></div><div class="tw"><table class="tbl rk" id="lb"></table></div><p class="fine" id="fine"></p>`;
document.querySelectorAll('[data-fresh=lg]').forEach(e=>e.textContent=`Ratings through ${fmtD(Z.last_date)} · ${Z.games} games of ${Z.name} ${Z.label}`);
[['team','team'],['pos','pos'],['q','q']].forEach(([id,k])=>$('#'+id).oninput=e=>{st[k]=e.target.value;draw()});
[['minG','minG'],['minMin','minMin'],['minCp','minCp']].forEach(([id,k])=>$('#'+id).oninput=e=>{st[k]=+e.target.value||0;draw()});
const cols=[{h:'#',k:'_',c:'rkn',f:(r,i)=>i+1},{h:'Player',k:'name',l:1,c:'pl',f:r=>esc(nm(r.name))},{h:'Team',k:'team',l:1},{h:'Pos',k:'pos',l:1,c:'hm',f:r=>r.pos?esc(r.pos):''},{h:'Age',k:'age',c:'hm',f:r=>r.age?r.age.toFixed(1):'—'},
 {h:'G',k:'g'},{h:'MPG',k:'mpg',f:r=>r.mpg.toFixed(1)},
 {h:'O-DPM',k:'o',t:'Offensive DPM',f:r=>sg(r.o,2),cls:r=>cl(r.o)},{h:'D-DPM',k:'d',t:'Defensive DPM',f:r=>sg(r.d,2),cls:r=>cl(r.d)},
 {h:'DPM',k:'dpm',c:'key dk'},{h:'Box',k:'box',c:'hm',t:'Box-score component',f:r=>sg(r.box,2)},{h:'RAPM',k:'rapm',c:'hm',t:'Lineup (RAPM) component',f:r=>sg(r.rapm,2)},{h:'Career poss.',k:'cp',c:'hm',f:r=>r.cp.toLocaleString('en')}];
function draw(){const q=st.q.toLowerCase();
 let d=Z.rows.filter(r=>r.g>=st.minG&&r.min>=st.minMin&&r.cp>=st.minCp&&(!st.team||r.team===st.team)&&(!st.pos||r.pos===st.pos)&&(!q||r.name.toLowerCase().includes(q)||nm(r.name).toLowerCase().includes(q))).map(r=>({...r,mpg:r.g?r.min/r.g:0}));
 const s=st.sort;d.sort((x,y)=>{const A=x[s.k],B=y[s.k];return (typeof A==='string'?A.localeCompare(B):A-B)*s.d});
 const mx=Math.max(...d.map(r=>Math.abs(r.dpm)),0.01);cols[9].f=r=>`<b>${sg(r.dpm,2)}</b>${bar(r.dpm,mx)}`;cols[9].cls=r=>cl(r.dpm);
 const t=$('#lb');t.innerHTML='<thead><tr>'+cols.map(c=>`<th class="${c.l?'l ':''}${c.c||''}${s.k===c.k?' sorted':''}" data-k="${c.k}" ${c.t?`title="${c.t}"`:''}>${c.h}${s.k===c.k?(s.d>0?' ▲':' ▼'):''}</th>`).join('')+'</tr></thead><tbody>'+
 (d.length?d.map((r,i)=>'<tr>'+cols.map(c=>`<td class="${c.l?'l ':''}${c.c||''} ${c.cls?c.cls(r):''}">${c.f?c.f(r,i):esc(r[c.k])}</td>`).join('')+'</tr>').join(''):`<tr><td class="l empty" colspan="${cols.length}">No players match these filters.</td></tr>`)+'</tbody>';
 t.querySelectorAll('th').forEach(th=>{if(th.dataset.k==='_')return;th.onclick=()=>{const k=th.dataset.k;st.sort=s.k===k?{k,d:-s.d}:{k,d:typeof d[0]?.[k]==='string'?1:-1};draw()}});
 $('#meta').innerHTML=`<b>${d.length}</b> players · games and minutes from ${Z.games} games of ${esc(Z.name)} ${Z.label}`;
 $('#fine').innerHTML=`DPM is points per 100 possessions above an average ${esc(Z.name)} player. It is a current rating built from ${esc(Z.name)} games only (since ${Z.since}); players new to the competition lean more on their box-score production until lineup data builds up.`;}
draw();
})();
