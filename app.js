const $=s=>document.querySelector(s),P=document.body.dataset.page;
const key=new URLSearchParams(location.search).get('c')||localStorage.c||NPINDEX.includes(NPDEFAULT)&&NPDEFAULT||NPINDEX[0];
const D=NPDATA[key]; document.querySelectorAll('nav a').forEach(a=>{a.classList.toggle('on',a.dataset.p===P);a.href+='?c='+key});
const lab=k=>{const [c,s]=k.split('_'),n=D.comps[c]||c;return n+' '+s.replace(/^\D(\d{4})$/,(m,y)=>y+'-'+String(+y+1).slice(2))};
$('#comp').innerHTML=NPINDEX.slice().sort().reverse().map(k=>`<option value="${k}" ${k===key?'selected':''}>${lab(k)}</option>`).join('')
  +(Object.keys(D.comps).filter(c=>!NPINDEX.some(k=>k.startsWith(c+'_'))).map(c=>`<option value="" disabled>${D.comps[c]} (soon)</option>`).join(''));
$('#comp').onchange=e=>{localStorage.c=e.target.value;location.search='?c='+e.target.value};$('#built').textContent=D.built;
const f=(x,d=1)=>(x>0?'+':'')+x.toFixed(d),cl=x=>x>0?'p':x<0?'n':'',G=Object.fromEntries(D.games.map(g=>[g.gc,g]));
const PROV='<span class="tag prov">provisional defense</span>';
function table(el,cols,data,sort,onSort){
 el.innerHTML='<thead><tr>'+cols.map(c=>`<th class="${c.l?'l':''} ${sort.k===c.k?'sorted':''}" data-k="${c.k}">${c.h}${sort.k===c.k?(sort.d>0?' ▲':' ▼'):''}</th>`).join('')+'</tr></thead><tbody>'+
 data.map((r,i)=>'<tr>'+cols.map(c=>`<td class="${c.l?'l':''} ${c.cls?c.cls(r):''}">${c.f?c.f(r,i):r[c.k]}</td>`).join('')+'</tr>').join('')+'</tbody>';
 el.querySelectorAll('th').forEach(th=>th.onclick=()=>{const k=th.dataset.k;onSort(sort.k===k?{k,d:-sort.d}:{k,d:-1})});}
function srt(a,s){return a.sort((x,y)=>{let A=x[s.k],B=y[s.k];return (typeof A==='string'?A.localeCompare(B):A-B)*s.d})}
function fill(sel,vals){$(sel).innerHTML+=vals.map(v=>`<option>${v}</option>`).join('')}
if(P==='index'){
 let view='per100',sort={k:'np',d:-1};fill('#team',[...new Set(D.rows.map(r=>r.team))].sort());fill('#pos',[...new Set(D.rows.map(r=>r.pos).filter(Boolean))].sort());
 const nprov=D.games.filter(g=>g.prov).length;
 $('#provnote').innerHTML=`${D.games.length} games · <b>${nprov}</b> with ${PROV}. Until individual defense is loaded for a game, its defense is split by minutes only, so defensive values there barely separate players.`;
 function agg(){const full=$('#fullonly').checked,m={};
  D.rows.filter(r=>!full||!r.prov).forEach(r=>{const a=m[r.pid]||(m[r.pid]={pid:r.pid,name:r.name,team:r.team,pos:r.pos,g:0,min:0,ton:0,off:0,dfn:0,np:0,pg:0});
   a.g++;a.min+=r.min;a.ton+=r.ton;a.off+=r.off;a.dfn+=r.dfn;a.np+=r.np;if(r.prov)a.pg++;a.team=r.team});
  return Object.values(m).map(a=>({...a,o100:a.off/a.ton*100,d100:a.dfn/a.ton*100,n100:a.np/a.ton*100}))}
 function draw(){const t=$('#team').value,p=$('#pos').value,q=$('#q').value.toLowerCase(),mm=+$('#minmin').value;
  let d=agg().filter(r=>r.min>=mm&&(!t||r.team===t)&&(!p||r.pos===p)&&(!q||r.name.toLowerCase().includes(q)));
  const per=view==='per100',[O,Df,N]=per?['o100','d100','n100']:['off','dfn','np'];let s={...sort};if(per&&['off','dfn','np'].includes(s.k))s.k={off:'o100',dfn:'d100',np:'n100'}[s.k];
  srt(d,s);const mx=Math.max(...d.map(r=>Math.abs(r[N])),1);
  table($('#lb'),[{h:'#',k:'_',f:(r,i)=>i+1},{h:'Player',k:'name',l:1,f:r=>`<a href="games.html?c=${key}&p=${r.pid}">${r.name}</a>${r.pg?` <span class="tag prov" title="${r.pg} of ${r.g} games provisional">prov ${r.pg}/${r.g}</span>`:''}`},
   {h:'Team',k:'team',l:1},{h:'Pos',k:'pos',l:1},{h:'G',k:'g'},{h:'Min',k:'min',f:r=>r.min.toFixed(0)},
   {h:per?'Off /100':'Off',k:O,f:r=>f(r[O]),cls:r=>cl(r[O])},{h:per?'Def /100':'Def',k:Df,f:r=>f(r[Df]),cls:r=>cl(r[Df])},
   {h:per?'Net /100':'Net',k:N,f:r=>`<span class="big">${f(r[N])}</span><span class="bar" style="width:${Math.abs(r[N])/mx*60}px;background:var(--${r[N]>=0?'pos':'neg'})"></span>`,cls:r=>cl(r[N])}],d,{k:s.k,d:s.d},ns=>{sort=ns;draw()})}
 $('#view').onclick=e=>{if(!e.target.dataset.v)return;view=e.target.dataset.v;$('#view').querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===e.target));draw()};
 ['#team','#pos','#q','#minmin','#fullonly'].forEach(s=>$(s).oninput=draw);draw();}
if(P==='games'){
 const ps={};D.rows.forEach(r=>ps[r.pid]=r.name+' ('+r.team+')');const sp=new URLSearchParams(location.search);
 $('#player').innerHTML='<option value="">—</option>'+Object.entries(ps).sort((a,b)=>a[1].localeCompare(b[1])).map(([k,v])=>`<option value="${k}">${v}</option>`).join('');
 $('#game').innerHTML+=D.games.map(g=>`<option value="${g.gc}">R${g.round} · ${g.home} ${g.hs}–${g.as_} ${g.away}${g.prov?' · provisional':''}</option>`).join('');
 let sort={k:'gc',d:1};
 function draw(){const pid=$('#player').value,gc=+$('#game').value;let d,cols;
  const base=[{h:'Min',k:'min',f:r=>r.min.toFixed(1)},{h:'Pts',k:'pts'},{h:'Def PPP',k:'ppp',f:r=>r.ppp===''?'<span class="n">—</span>':(+r.ppp).toFixed(2)+` <small>(${r.pposs})</small>`},
   {h:'Off AP',k:'off',f:r=>f(r.off),cls:r=>cl(r.off)},{h:'Def AP',k:'dfn',f:r=>f(r.dfn),cls:r=>cl(r.dfn)},{h:'AP',k:'np',f:r=>`<b>${f(r.np)}</b>`,cls:r=>cl(r.np)},{h:'AP /100',k:'n100',f:r=>f(r.n100),cls:r=>cl(r.n100)},
   {h:'Defense',k:'prov',l:1,f:r=>r.prov?PROV:'<span class="tag ok">Full</span>'}];
  if(gc){const g=G[gc];d=D.rows.filter(r=>r.gc===gc);
   const sums=[g.home,g.away].map(t=>`${t}: Σ AP ${f(d.filter(r=>r.team===t).reduce((a,r)=>a+r.np,0),2)}`).join(' · ');
   $('#gamehead').innerHTML=`<h2>Round ${g.round} · ${g.date} · ${g.home} ${g.hs}–${g.as_} ${g.away} ${g.prov?PROV:'<span class="tag ok">Full defense</span>'}</h2><p>${sums} (equals margin)</p>`+(g.prov?`<div class="note">Provisional defense: missing individual defense for ${g.missing.join(', ')}. Defense split by minutes only.</div>`:'');
   cols=[{h:'Player',k:'name',l:1,f:r=>`<a href="?c=${key}&p=${r.pid}">${r.name}</a>`},{h:'Team',k:'team',l:1},...base];if(sort.k==='gc')sort={k:'np',d:-1}}
  else if(pid){d=D.rows.filter(r=>r.pid===pid);$('#gamehead').innerHTML=`<h2>${ps[pid]}</h2>`;
   cols=[{h:'Rd',k:'gc',f:r=>G[r.gc].round},{h:'Date',k:'gc',l:1,f:r=>G[r.gc].date},{h:'Opp',k:'opp',l:1,f:r=>`<a href="?c=${key}&g=${r.gc}">${r.team===G[r.gc].home?'vs':'@'} ${r.opp}</a>`},...base]}
  else{$('#gamehead').innerHTML='';$('#log').innerHTML='';return}
  d=d.map(r=>({...r,n100:r.np/r.ton*100}));table($('#log'),cols,srt(d,sort),sort,ns=>{sort=ns;draw()})}
 $('#player').onchange=()=>{$('#game').value='';sort={k:'gc',d:1};draw()};$('#game').onchange=()=>{$('#player').value='';sort={k:'np',d:-1};draw()};
 if(sp.get('p'))$('#player').value=sp.get('p');else if(sp.get('g'))$('#game').value=sp.get('g');else $('#player').value=D.rows.slice().sort((a,b)=>b.np-a.np)[0].pid;draw();}
if(P==='dpm'){
 const rows=D.darko.map(r=>({...r,dpm:+r.dpm,o:+r.o,d:+r.d,box:+r.box,rapm:+r.rapm,cp:+r.cp,age:+r.age}));fill('#team',[...new Set(rows.map(r=>r.team))].sort());let sort={k:'dpm',d:-1};
 function draw(){const t=$('#team').value,q=$('#q').value.toLowerCase(),m=+$('#mincp').value;let d=rows.filter(r=>r.cp>=m&&(!t||r.team===t)&&(!q||r.name.toLowerCase().includes(q)));
  table($('#lb'),[{h:'#',k:'_',f:(r,i)=>i+1},{h:'Player',k:'name',l:1},{h:'Team',k:'team',l:1},{h:'Pos',k:'pos',l:1},{h:'Age',k:'age',f:r=>r.age.toFixed(1)},{h:'Career poss',k:'cp',f:r=>r.cp.toFixed(0)},
   {h:'O-DPM',k:'o',f:r=>f(r.o),cls:r=>cl(r.o)},{h:'D-DPM',k:'d',f:r=>f(r.d),cls:r=>cl(r.d)},{h:'DPM',k:'dpm',f:r=>`<b>${f(r.dpm)}</b>`,cls:r=>cl(r.dpm)},{h:'Box',k:'box',f:r=>f(r.box)},{h:'RAPM',k:'rapm',f:r=>f(r.rapm)}],srt(d,sort),sort,ns=>{sort=ns;draw()})}
 ['#team','#q','#mincp'].forEach(s=>$(s).oninput=draw);draw();}
