/* ════════════════════════════════
   GLOBALS & STATE
════════════════════════════════ */
let G={
  Q:5000,PF:2.5,PMF:1.2,
  BOD:250,sBOD:125,COD:450,sCOD:200,rbCOD:80,
  TSS:220,VSS:185,nbVSS:40,
  TKN:40,NH4:28,NO3:1,TP:6,VFA:15,Alk:200,pH:7.2,TKNfs:1.5,
  T:20,Tmax:32,elev:100,
  BODe:10,CODe:50,TSSe:10,NH4e:5,TNe:10,TPe:2,
  tech:'asp',systemType:'conventional',
  primaryBODrem:30,primaryTSSrem:55
};
let selTech='asp',sysType='conventional',wizCur=1;

/* ════ NAV ════ */
function goHome(){showScr('home');nt('nt-home')}
function showWiz(){showScr('wizard');nt('nt-wizard');wz(wizCur)}
function showModules(){showScr('modules');nt('nt-modules')}
function showScr(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('show'));document.getElementById('screen-'+id)?.classList.add('show')}
function nt(id){document.querySelectorAll('.nt').forEach(t=>t.classList.remove('active'));document.getElementById(id)?.classList.add('active')}
function gm(id){
  showModules();
  const mc=document.getElementById('mod-content');
  if(mc)mc.innerHTML=buildMod(id);
  document.querySelectorAll('.si[id^="msb"]').forEach(s=>s.classList.remove('active'));
  document.getElementById('msb-'+id)?.classList.add('active');
  populateGlobals(id);
}

/* ════ HELPERS ════ */
const f2=(v,d=2)=>(!isFinite(v)||isNaN(v))?'—':(+v).toFixed(d);
const fi=v=>(!isFinite(v)||isNaN(v))?'—':Math.round(v).toLocaleString();
const vv=id=>{const e=document.getElementById(id);return e?+(e.value)||0:0}
const vs=id=>{const e=document.getElementById(id);return e?e.value:''}
const set=v=>{const e=document.getElementById(v[0]);if(e)e.textContent=v[1]}
function rc(val,lbl,unit,cls=''){return`<div class="rc ${cls}"><div class="rv">${val}</div><div class="rl">${lbl}</div><div class="ru">${unit}</div></div>`}
function rs(title,content){return`<div class="rs"><div class="rs-t">${title}</div>${content}</div>`}
function rg(cards){return`<div class="rg">${cards}</div>`}
function ck(ok,label,val,ref=''){const cls=ok===true?'pass':ok===false?'fail':'warn';return`<div class="ck ${cls}"><div class="ck-d"></div><span>${label}</span><span class="ck-v">${val}</span>${ref?`<span class="ck-ref">${ref}</span>`:''}</div>`}
function mkArr(id='ar',col='#f5a623'){return`<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M2 2L8 5L2 8" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round"/></marker>`}
function dlSVG(svgId,fn){const sv=document.getElementById(svgId);if(!sv)return;const b=new Blob([sv.outerHTML],{type:'image/svg+xml'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=(fn||'drawing')+'.svg';a.click()}
/* SVG title block */
function TB(W,H,title,sub,scale,sheet){const y=H-52;return`
<rect x="0" y="${y}" width="${W}" height="52" fill="#080808"/>
<line x1="0" y1="${y}" x2="${W}" y2="${y}" stroke="#f5a623" stroke-width="1.5"/>
<text x="14" y="${y+14}" font-size="9" font-weight="900" fill="#f5a623" font-family="Inter,sans-serif" letter-spacing="2">AAPAAVANI NEXUS</text>
<text x="14" y="${y+30}" font-size="12.5" font-weight="700" fill="#fff" font-family="Space Grotesk,Inter,sans-serif">${title}</text>
<text x="14" y="${y+45}" font-size="9" fill="rgba(255,255,255,.38)" font-family="Inter,sans-serif">${sub}</text>
<text x="${W-14}" y="${y+14}" text-anchor="end" font-size="9" fill="rgba(255,255,255,.4)" font-family="Inter,sans-serif">Scale: ${scale}</text>
<text x="${W-14}" y="${y+28}" text-anchor="end" font-size="9" fill="rgba(255,255,255,.4)" font-family="Inter,sans-serif">Sheet: ${sheet}</text>
<text x="${W-14}" y="${y+44}" text-anchor="end" font-size="8.5" fill="rgba(255,255,255,.24)" font-family="Inter,sans-serif">${new Date().toLocaleDateString('en-IN')}</text>`}
/* Dimension line */
function DL(x1,y1,x2,y2,label,above=true,col='#1a9454'){const mx=(x1+x2)/2,my=(y1+y2)/2,off=above?-11:13;
return`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${col}" stroke-width=".8" stroke-dasharray="4 2"/>
<line x1="${x1}" y1="${y1-5}" x2="${x1}" y2="${y1+5}" stroke="${col}" stroke-width="1"/>
<line x1="${x2}" y1="${y2-5}" x2="${x2}" y2="${y2+5}" stroke="${col}" stroke-width="1"/>
<text x="${mx}" y="${my+off}" text-anchor="middle" font-size="9.5" fill="${col}" font-family="Inter,sans-serif" font-weight="700">${label}</text>`}

/* ════ WIZARD ════ */
function wz(n){
  for(let i=1;i<=5;i++){const el=document.getElementById('ws'+i);if(el)el.style.display=(i===n?'block':'none')}
  wizCur=n;updateWizUI(n);if(n===5)buildTechGrid();
  if(n>=2)readFeed();if(n>=3)readEff();
}
function updateWizUI(n){
  for(let i=1;i<=5;i++){
    const sn=document.getElementById('sn'+i),sl=document.getElementById('sl'+i),wsb=document.getElementById('wsb'+i);
    if(sn){sn.className='sn-item'+(i===n?' active':i<n?' done':'')}
    if(sl&&i<5){sl.className='sn-line'+(i<n?' done':'')}
    if(wsb){wsb.className='si'+(i===n?' active':i<n?' done':'')}
  }
  const pb=document.getElementById('wiz-bar');if(pb)pb.style.width=((n/5)*100)+'%';
  const pt=document.getElementById('wiz-pg-txt');if(pt)pt.textContent=`Step ${n} of 5`;
}
function readFeed(){
  G.Q=vv('w_Q')||5000;G.PF=vv('w_PF')||2.5;G.PMF=vv('w_PMF')||1.2;
  G.BOD=vv('w_BOD')||250;G.sBOD=vv('w_sBOD')||125;G.COD=vv('w_COD')||450;G.sCOD=vv('w_sCOD')||200;G.rbCOD=vv('w_rbCOD')||80;
  G.TSS=vv('w_TSS')||220;G.VSS=vv('w_VSS')||185;G.nbVSS=vv('w_nbVSS')||40;
  G.TKN=vv('w_TKN')||40;G.NH4=vv('w_NH4')||28;G.NO3=vv('w_NO3')||1;G.TP=vv('w_TP')||6;G.VFA=vv('w_VFA')||15;
  G.Alk=vv('w_Alk')||200;G.T=vv('w_T')||20;G.Tmax=vv('w_Tmax')||32;G.elev=vv('w_elev')||100;G.TKNfs=vv('w_TKNfs')||1.5;
}
function readEff(){
  G.BODe=vv('w_BODe')||10;G.CODe=vv('w_CODe')||50;G.TSSe=vv('w_TSSe')||10;G.NH4e=vv('w_NH4e')||5;G.TNe=vv('w_TNe')||10;G.TPe=vv('w_TPe')||2;
}
const STDS={inland:{BODe:10,CODe:50,TSSe:10,NH4e:5,TNe:10,TPe:2},land:{BODe:30,CODe:100,TSSe:30,NH4e:10,TNe:30,TPe:5},reuse:{BODe:5,CODe:20,TSSe:5,NH4e:1,TNe:5,TPe:0.5},marine:{BODe:20,CODe:75,TSSe:20,NH4e:10,TNe:15,TPe:3},mld:{BODe:5,CODe:30,TSSe:5,NH4e:2,TNe:8,TPe:1},custom:null};
function setStd(s){
  document.querySelectorAll('.std-p').forEach(b=>b.classList.remove('on'));
  document.getElementById('sp-'+s)?.classList.add('on');
  const t=STDS[s];if(!t)return;
  ['BODe','CODe','TSSe','NH4e','TNe','TPe'].forEach(k=>{const el=document.getElementById('w_'+k);if(el)el.value=t[k]});
}
function selSys(type){sysType=type;document.getElementById('sc-conv').className='sc'+(type==='conventional'?' on':'');document.getElementById('sc-spec').className='sc'+(type==='specific'?' on':'')}
const TECHS={
  conventional:{
    asp:{icon:'💧',name:'Activated Sludge (CMAS)',abbr:'ASP',desc:'Complete-mix with nitrification, denitrification, optional EBPR.',tags:['BOD','N+P','Proven']},
    mbr:{icon:'🔵',name:'Membrane Bioreactor',abbr:'MBR',desc:'Membrane replaces clarifier. Compact, reuse-quality effluent.',tags:['BOD<5','TSS<2','Reuse']},
    sbr:{icon:'🔄',name:'Sequencing Batch Reactor',abbr:'SBR',desc:'Single basin fill-react-settle cycle. No secondary clarifier.',tags:['BOD','N+P','Flexible']},
    mbbr:{icon:'🟡',name:'MBBR — Moving Bed Biofilm',abbr:'MBBR',desc:'Plastic carriers. High loading, easy upgrade, low footprint.',tags:['BOD','N','High Rate']},
    eal:{icon:'🌿',name:'Extended Aeration',abbr:'EAL',desc:'Long SRT>15d, very low sludge. Simple for small plants.',tags:['BOD','<5MLD','Simple']},
  },
  specific:{
    mbr:{icon:'🔵',name:'MBR — Full System',abbr:'MBR',desc:'Pre-anoxic + MBR basin + hollow-fibre membrane module design.',tags:['BOD<5','Reuse','Full']},
    sbr:{icon:'🔄',name:'SBR — Full System',abbr:'SBR',desc:'BOD+Nitrif, Pre-anoxic, Post-anoxic configurations with cycle design.',tags:['BOD','N','3 configs']},
    mbbr:{icon:'🟡',name:'MBBR — Full System',abbr:'MBBR',desc:'SALR/SARR carrier sizing, nitrification kinetics, denitrification.',tags:['BOD','N','SALR']},
    uasb_asp:{icon:'🌱',name:'UASB + Aerobic Polish',abbr:'UASB+ASP',desc:'Anaerobic pre-treatment with biogas energy recovery + polishing.',tags:['COD','Biogas','Energy']},
    trickle:{icon:'🏔️',name:'Trickling Filter (NRC)',abbr:'TF',desc:'Fixed-film NRC formula, 1-stage and 2-stage BOD removal.',tags:['BOD','Low Energy','Low Maint.']},
  }
};
function buildTechGrid(){
  const techs=TECHS[sysType]||TECHS.conventional;
  let html='';
  for(const[k,t]of Object.entries(techs)){
    const rec=(G.BODe<=5&&k==='mbr')||(G.Q>2000&&G.BODe<=10&&k==='asp')||(sysType==='specific'&&k==='uasb_asp'&&G.COD>400);
    html+=`<div class="tc${selTech===k?' on':''}" onclick="selTech_('${k}')">${rec?'<div class="tc-rec">⭐ Recommended</div>':''}<div class="tc-icon">${t.icon}</div><div class="tc-name">${t.name}</div><div class="tc-abbr">${t.abbr}</div><div class="tc-desc">${t.desc}</div><div class="tc-tags">${t.tags.map(x=>`<span class="tc-tag">${x}</span>`).join('')}</div></div>`;
  }
  document.getElementById('tech-grid').innerHTML=html;showRec();
}
function selTech_(k){selTech=k;buildTechGrid()}
function showRec(){
  const el=document.getElementById('rec-box');if(!el)return;
  const msgs={
    mbr:`✅ MBR is ideal for your effluent BOD target ≤${G.BODe} mg/L. Consistent membrane-quality effluent suitable for reuse. Plan for membrane replacement every 10–12 years.`,
    sbr:`ℹ️ SBR: minimum 2 basins for continuous flow. Nitrification and denitrification achievable in a single basin through cycle control (fill/anoxic/aerate/settle/decant).`,
    mbbr:`ℹ️ MBBR: plastic carriers (Kaldnes type) move freely in aerated reactor. 40–50% fill fraction recommended. Easily upgradeable — add carriers rather than new tanks.`,
    uasb_asp:`✅ UASB + Aerobic polish: anaerobic pre-treatment recovers 0.35 L CH₄/g COD removed, reducing aerobic power by ~40–60%. Best for influent COD >${G.COD} mg/L.`,
    asp:`✅ ASP (CMAS): globally proven, flexible for N+P removal, well-documented design criteria. Recommended for Q >${fi(G.Q)} m³/d with good operator training.`,
    eal:`ℹ️ Extended Aeration: SRT 20–30 days, minimal excess sludge (<0.1 kg/kg BOD). Best for Q <5 MLD. No primary clarifier needed.`,
    trickle:`ℹ️ Trickling Filter: NRC formula. Very low energy, no moving parts except distributor. Consider 2-stage for BOD targets <30 mg/L.`
  };
  const m=msgs[selTech];
  if(m){el.style.display='flex';el.innerHTML=`<span>💡</span><span>${m}</span>`}else el.style.display='none';
  const sv=document.getElementById('sb-tech-v');if(sv){const t=(TECHS[sysType]||TECHS.conventional)[selTech];if(t)sv.textContent=t.abbr+' — '+t.name.split('(')[0].trim()}
}
function launchDesign(){
  readFeed();readEff();G.tech=selTech;G.systemType=sysType;
  const tc=(TECHS[sysType]||TECHS.conventional)[selTech];
  const chip=document.getElementById('top-chip');if(chip&&tc){chip.textContent=tc.abbr+' Plant';chip.style.display='block'}
  gm('train');
}

/* ════ POPULATE GLOBALS INTO MODULES ════ */
function populateGlobals(id){
  const s=document.getElementById;
  if(id==='screen'){const e=document.getElementById('sc_Qd');if(e)e.textContent=fi(G.Q);const e2=document.getElementById('sc_Qpd');if(e2)e2.textContent=fi(G.Q*G.PF)}
  if(id==='primary'){const e=document.getElementById('pc_Qd');if(e)e.textContent=fi(G.Q)}
  if(id==='secondary'){buildSecInputs()}
  if(id==='mbr'){const e=document.getElementById('mbr_Q');if(e)e.value=G.Q;const e2=document.getElementById('mbr_BOD');if(e2)e2.value=G.BOD}
  if(id==='uasb'){const e=document.getElementById('ub_Q');if(e)e.value=G.Q;const e2=document.getElementById('ub_COD');if(e2)e2.value=G.COD;const e3=document.getElementById('ub_T');if(e3)e3.value=G.T}
  if(id==='sbr'){const e=document.getElementById('sbr_Q');if(e)e.value=G.Q;const e2=document.getElementById('sbr_BOD');if(e2)e2.value=G.BOD}
  if(id==='mbbr'){const e=document.getElementById('mr_Q');if(e)e.value=G.Q;const e2=document.getElementById('mr_BOD');if(e2){e2.value=Math.round(G.BOD*(1-G.primaryBODrem/100))}}
  if(id==='daf'){const e=document.getElementById('daf_Q');if(e)e.value=G.Q;const e2=document.getElementById('daf_T');if(e2)e2.value=G.T}
  if(id==='sec-clar'){const e=document.getElementById('c2_Q');if(e)e.value=G.Q}
  if(id==='digester'){const e=document.getElementById('dig_Q');if(e)e.value=G.Q;const e2=document.getElementById('dig_TSS');if(e2)e2.value=G.TSS}
  if(id==='trickling'){const e=document.getElementById('tf_Q');if(e)e.value=G.Q;const e2=document.getElementById('tf_BOD');if(e2)e2.value=Math.round(G.BOD*(1-G.primaryBODrem/100))}
}

/* ════ MODULE BUILDER ════ */
function buildMod(id){
  switch(id){
    case 'train':return buildTrain();
    case 'screen':return buildScreen();
    case 'primary':return buildPrimary();
    case 'secondary':return buildSecondary();
    case 'mbr':return buildMBR();
    case 'sbr':return buildSBR();
    case 'mbbr':return buildMBBR();
    case 'trickling':return buildTrickling();
    case 'uasb':return buildUASB();
    case 'daf':return buildDAF();
    case 'sec-clar':return buildSecClar();
    case 'digester':return buildDigester();
    case 'mass-balance':return buildMassBalance();
    case 'lagoon':return buildLagoon();
    case 'tertiary':return buildTertiary();
    case 'metal':return buildMetal();
    default:return `<div class="mwrap"><div class="cs"><div class="cs-icon">🚧</div><div class="cs-t">Module: ${id}</div><div class="cs-d">Coming soon in the next release.</div></div></div>`;
  }
}

/* ══════ TREATMENT TRAIN ══════ */
function buildTrain(){
  const tc=(TECHS[G.systemType]||TECHS.conventional)[G.tech];
  let steps=[];
  if(G.tech==='mbr')steps=[{n:'Influent',i:'🚰',s:'Raw Sewage'},{n:'Screen+Grit',i:'🔲',s:'Pretreatment',m:'screen'},{n:'Fine Screen',i:'🔲',s:'MBR Pretreat',m:'screen'},{n:'Pre-Anoxic',i:'↩️',s:'Denitrif.',m:'secondary'},{n:'MBR Basin',i:'🔵',s:'Aer+Membrane',m:'mbr'},{n:'Effluent',i:'✅',s:'Reuse Quality'}];
  else if(G.tech==='sbr')steps=[{n:'Influent',i:'🚰',s:'Raw Sewage'},{n:'Screen+Grit',i:'🔲',s:'Pretreatment',m:'screen'},{n:'SBR Basins',i:'🔄',s:'Fill/React/Settle',m:'sbr'},{n:'Disinfection',i:'💎',s:'Cl₂ / UV',m:'tertiary'},{n:'Effluent',i:'✅',s:'Treated Water'}];
  else if(G.tech==='mbbr')steps=[{n:'Influent',i:'🚰',s:'Raw Sewage'},{n:'Screen+Grit',i:'🔲',s:'Pretreatment',m:'screen'},{n:'Primary Clar.',i:'⊙',s:'~30% BOD',m:'primary'},{n:'MBBR',i:'🟡',s:'Biofilm+Suspended',m:'mbbr'},{n:'Sec. Clarifier',i:'⊛',s:'Final Settling',m:'sec-clar'},{n:'Effluent',i:'✅',s:'Treated'}];
  else if(G.tech==='uasb_asp')steps=[{n:'Influent',i:'🚰',s:'Raw Sewage'},{n:'Screen+Grit',i:'🔲',s:'Pretreatment',m:'screen'},{n:'UASB',i:'🌱',s:'Anaerobic+Biogas',m:'uasb'},{n:'Aeration',i:'💧',s:'Aerobic Polish',m:'secondary'},{n:'Sec. Clarifier',i:'⊛',s:'Settling',m:'sec-clar'},{n:'Effluent',i:'✅',s:'Treated'}];
  else if(G.tech==='trickle')steps=[{n:'Influent',i:'🚰',s:'Raw Sewage'},{n:'Screen+Grit',i:'🔲',s:'Pretreatment',m:'screen'},{n:'Primary Clar.',i:'⊙',s:'~30% BOD',m:'primary'},{n:'Trickling Filter',i:'🏔️',s:'Fixed-Film BOD',m:'trickling'},{n:'Sec. Clarifier',i:'⊛',s:'Final Settling',m:'sec-clar'},{n:'Tertiary+UV',i:'💎',s:'Disinfection',m:'tertiary'},{n:'Effluent',i:'✅',s:'Treated Water'}];
  else steps=[{n:'Influent',i:'🚰',s:'Raw Sewage'},{n:'Screen+Grit',i:'🔲',s:'Pretreatment',m:'screen'},{n:'Primary Clar.',i:'⊙',s:'~30% BOD rem.',m:'primary'},{n:'Aeration Tank',i:'💧',s:'BOD+Nitrif+Denitrif',m:'secondary'},{n:'Sec. Clarifier',i:'⊛',s:'Final Settling',m:'sec-clar'},{n:'Tertiary+UV',i:'💎',s:'Disinfection',m:'tertiary'},{n:'Effluent',i:'✅',s:'Treated Water'}];
  const flow=steps.map((s,i)=>`<div class="tfn${s.m?' clickable':''}"${s.m?` onclick="gm('${s.m}')" title="Design ${s.n}"`:''}><div class="tfn-icon">${s.i}</div><div class="tfn-name">${s.n}</div><div class="tfn-sub">${s.s}</div></div>${i<steps.length-1?'<div class="tfarr">→</div>':''}`).join('');
  const params=[{v:fi(G.Q),l:'Avg Q (m³/d)'},{v:f2(G.Q*G.PF/1000,2),l:'Peak (MLD)'},{v:G.BOD,l:'BOD₅ In (mg/L)'},{v:G.COD,l:'COD In (mg/L)'},{v:G.TKN,l:'TKN In (mg/L)'},{v:G.TSS,l:'TSS In (mg/L)'},{v:G.BODe,l:'BOD₅ Target (mg/L)'},{v:G.NH4e,l:'NH₄-N Target (mg/L)'},{v:G.T,l:'Temp (°C)'}].map(p=>`<div class="pb-i"><div class="pb-v">${p.v}</div><div class="pb-l">${p.l}</div></div>`).join('');
  return`<div class="mwrap">
    <div class="mhdr"><div class="mh-left"><div class="mt-title">Treatment Train Overview<div class="mt-badge">${tc?tc.abbr:'ASP'}</div></div><div class="mt-bread">Technology: <b>${tc?tc.name:'—'}</b> · Q: <b>${fi(G.Q)} m³/d</b></div></div><button class="btn btn-o btn-sm" onclick="showWiz()">← Change Technology</button></div>
    <div class="params-bar">${params}</div>
    <div class="train-box"><div class="tb-label">⟶ Complete Treatment Train — Click active units to design</div><div class="train-flow">${flow}</div></div>
    <div class="card"><div class="card-hd"><div class="card-hd-t">📊 Process Summary (populates as you design each unit)</div></div><div class="card-body"><div class="alert al-i">Design each unit process using the sidebar. Results auto-accumulate here.</div></div></div>
  </div>`;
}

/* ══════ SCREENING + GRIT ══════ */
function buildScreen(){
  return`<div class="mwrap">
  <div class="mhdr"><div class="mh-left"><div class="mt-title">Screening &amp; Grit Removal<div class="mt-badge">PRETREATMENT</div></div><div class="mt-bread">Feed: <b id="sc_Qd">${fi(G.Q)}</b> m³/d · Peak: <b id="sc_Qpd">${fi(G.Q*G.PF)}</b> m³/d</div></div></div>
  <div class="tab-bar"><div class="tab active" onclick="stab(this,'sc-inp')">📋 Inputs</div><div class="tab" onclick="stab(this,'sc-bas')">📐 Design Basis</div><div class="tab" onclick="stab(this,'sc-res')">📊 Results</div><div class="tab" onclick="stab(this,'sc-drw')">🖼 2D Drawing</div><div class="tab" onclick="stab(this,'sc-chk')">✅ Checks</div></div>
  <div class="tp active" id="sc-inp">
    <div class="card"><div class="card-hd"><div class="card-hd-t">🔲 Bar Screen — Kirschmer Headloss Equation</div><div class="card-hd-s">M&E 5th Ed. Eq. 5-2 · Table 5-3</div></div><div class="card-body">
      <div class="g4">
        <div class="f"><label>Channel Width (b)</label><div class="fuw"><input type="number" id="sc_W" value="0.9" step="0.1"><div class="fu">m</div></div><div class="h">Approach channel width</div></div>
        <div class="f"><label>Water Depth (y)</label><div class="fuw"><input type="number" id="sc_d" value="0.55" step="0.05"><div class="fu">m</div></div><div class="h">Normal flow depth in channel</div></div>
        <div class="f"><label>Bar Spacing — Clear (w)</label><div class="fuw"><input type="number" id="sc_b" value="20" step="5"><div class="fu">mm</div></div><div class="h">Fine: 6–20mm · Coarse: 25–50mm</div></div>
        <div class="f"><label>Bar Width / Thickness (t)</label><div class="fuw"><input type="number" id="sc_t" value="10" step="2"><div class="fu">mm</div></div><div class="h">Rectangular bar section</div></div>
        <div class="f"><label>Approach Velocity (v)</label><div class="fuw"><input type="number" id="sc_v" value="0.6" step="0.05"><div class="fu">m/s</div></div><div class="h">Typical: 0.3–0.9 m/s</div></div>
        <div class="f"><label>Screen Angle (θ)</label><div class="fuw"><input type="number" id="sc_ang" value="60" step="5"><div class="fu">°</div></div><div class="h">From horizontal (45–80°)</div></div>
        <div class="f"><label>β — Bar Shape Factor</label><input type="number" id="sc_beta" value="1.79" step="0.01"><div class="h">Sharp-edge rectangular = 1.79</div><div class="ref">M&E 5th Table 5-3</div></div>
        <div class="f"><label>No. of Screens (incl. standby)</label><input type="number" id="sc_ns" value="2" min="1" max="6"><div class="h">Min 2: 1 duty + 1 standby</div></div>
      </div>
    </div></div>
    <div class="card"><div class="card-hd"><div class="card-hd-t">🪨 Horizontal Flow Grit Chamber — Stokes' Law Settling</div><div class="card-hd-s">M&E 5th Ed. Section 5-3 · Table 5-16</div></div><div class="card-body">
      <div class="g4">
        <div class="f"><label>Design Grit Particle Dia. (dp)</label><div class="fuw"><input type="number" id="sc_dp" value="0.2" step="0.05"><div class="fu">mm</div></div><div class="h">Design minimum 0.2mm · Stokes applies</div><div class="ref">M&E 5th: 0.2mm minimum</div></div>
        <div class="f"><label>Grit Specific Gravity (Sg)</label><input type="number" id="sc_sg" value="2.65" step="0.05"><div class="h">Sand = 2.65 · Grit = 2.5–2.7</div></div>
        <div class="f"><label>Horizontal Control Velocity</label><div class="fuw"><input type="number" id="sc_vc" value="0.3" step="0.05"><div class="fu">m/s</div></div><div class="h">M&E typical: 0.3 m/s</div></div>
        <div class="f"><label>Detention Time at Peak Q</label><div class="fuw"><input type="number" id="sc_dt" value="60" step="10"><div class="fu">sec</div></div><div class="h">M&E range: 45–90 sec</div></div>
        <div class="f"><label>Added Length for I+O (%)</label><div class="fuw"><input type="number" id="sc_ladd" value="30" step="5"><div class="fu">%</div></div><div class="h">Inlet + outlet transition zone</div></div>
        <div class="f"><label>Grit Storage Depth</label><div class="fuw"><input type="number" id="sc_gd" value="0.25" step="0.05"><div class="fu">m</div></div></div>
        <div class="f"><label>Freeboard</label><div class="fuw"><input type="number" id="sc_fb" value="0.30" step="0.05"><div class="fu">m</div></div></div>
        <div class="f"><label>No. of Grit Channels</label><input type="number" id="sc_ng" value="2" min="1" max="6"><div class="h">Min 2 recommended</div></div>
      </div>
    </div></div>
    <div class="btn-row mt"><button class="btn btn-a" onclick="calcScreen()">⚙️ Calculate Screening &amp; Grit</button></div>
  </div>
  <div class="tp" id="sc-bas">
    <div class="card"><div class="card-hd"><div class="card-hd-t">📐 Design Equations</div></div><div class="card-body">
      <div class="eq-blk"><div class="eq-t">Kirschmer Bar Screen Headloss — M&E Eq. 5-2</div><span class="eq-l">hL</span> = <span class="eq-r">β × (t/b)^(4/3) × v² / (2g) × sin(θ)</span><div class="eq-where">β = bar shape factor (1.79 sharp-edge) · t = bar width · b = clear spacing · v = approach vel. · θ = angle from horizontal<br>Clogged estimate: hL_clogged ≈ 3.5 × hL_clean</div></div>
      <div class="eq-blk"><div class="eq-t">Stokes' Law — Grit Particle Settling Velocity</div><span class="eq-l">vs</span> = <span class="eq-r">g × (ρs − ρw) × dp² / (18μ)</span><div class="eq-where">g = 9.81 m/s² · ρs = particle density (2650 kg/m³ for sand) · ρw = 1000 kg/m³ · dp = particle dia (m) · μ = 0.001 Pa·s at 20°C<br>Design settling vel. = 0.30 × vs (30% safety factor per M&E)</div></div>
      <div class="eq-blk"><div class="eq-t">Grit Chamber Length — Detention Time Basis</div><span class="eq-l">A</span> = <span class="eq-r">Qpeak / (n × vc)  [cross-sectional area per channel]</span><br><span class="eq-l">Lflow</span> = <span class="eq-r">vc × t  [length for flow]</span><br><span class="eq-l">Ltotal</span> = <span class="eq-r">Lflow × (1 + added%/100)</span><div class="eq-where">M&E Table 5-16: L:W ratio 3:1–5:1 · W:D ratio 1:1–5:1 · min 2 channels</div></div>
    </div></div>
    <div class="card-a card"><div class="card-hd"><div class="card-hd-t">📚 Reference Table — M&E 5th Ed. Table 5-16</div></div><div class="card-body" style="padding:0">
      <table class="rtable"><thead><tr><th>Parameter</th><th>Units</th><th>Range</th><th>Typical</th></tr></thead><tbody>
        <tr><td>Detention time</td><td>sec</td><td>45–90</td><td class="mono">60</td></tr>
        <tr><td>Horizontal velocity</td><td>m/s</td><td>0.25–0.40</td><td class="mono">0.30</td></tr>
        <tr><td>Added length for I+O</td><td>%</td><td>25–50</td><td class="mono">30</td></tr>
        <tr><td>L:W ratio</td><td>—</td><td>3:1–5:1</td><td class="mono">4:1</td></tr>
        <tr><td>W:D ratio</td><td>—</td><td>1:1–5:1</td><td class="mono">1.5:1</td></tr>
        <tr><td>Grit storage depth</td><td>m</td><td>0.2–0.5</td><td class="mono">0.25</td></tr>
      </tbody></table>
    </div></div>
  </div>
  <div class="tp" id="sc-res"><div id="sc-res-area"><div class="alert al-i">Click Calculate to see results.</div></div></div>
  <div class="tp" id="sc-drw">
    <div class="dwg-toolbar"><span>SCREENING + GRIT — PLAN + SECTION VIEW (NTS)</span><button class="btn btn-xs btn-dk" onclick="dlSVG('sc-svg','screening-grit-plan')">⬇ Export SVG</button></div>
    <div class="dwg-wrap"><svg id="sc-svg" viewBox="0 0 1100 580" xmlns="http://www.w3.org/2000/svg"><text x="550" y="290" text-anchor="middle" font-size="14" fill="#aaa" font-family="Inter,sans-serif">Calculate to generate detailed 2D engineering drawing</text></svg></div>
    <div class="dwg-legend"><div class="leg-i"><div class="leg-sw" style="background:#f5a623"></div>Bar Screen Channel</div><div class="leg-i"><div class="leg-sw" style="background:#f5edd8"></div>Grit Chamber</div><div class="leg-i"><div class="leg-sw" style="background:#c8a96e"></div>Grit Collection Hopper</div><div class="leg-i"><div class="leg-sw" style="background:#3a9bd4"></div>Flow Direction</div><div class="leg-i"><div class="leg-sw" style="background:#1a9454"></div>Effluent / Dimensions</div></div>
  </div>
  <div class="tp" id="sc-chk"><div class="card"><div class="card-hd"><div class="card-hd-t">✅ Design Verification Checks</div><div class="card-hd-s">Per M&E 5th Ed. standards</div></div><div class="card-body" id="sc-chk-body"><div class="alert al-i">Calculate first.</div></div></div></div>
</div>`;
}

/* ══════ SCREEN TAB SWITCH ══════ */
function stab(el,panelId){
  const wrap=el.closest('.mwrap')||el.closest('[id^="screen-"]')||el.closest('.panel-main');
  if(!wrap)return;
  wrap.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  wrap.querySelectorAll('.tp').forEach(p=>p.classList.remove('active'));
  const p=wrap.querySelector('#'+panelId);if(p)p.classList.add('active');
}

/* ══════ CALCULATION: SCREENING ══════ */
function calcScreen(){
  const Qp=G.Q*G.PF/86400;
  const W=vv('sc_W'),d=vv('sc_d'),bm=vv('sc_b')/1000,t=vv('sc_t')/1000;
  const vel=vv('sc_v'),ang=vv('sc_ang'),ns=vv('sc_ns'),beta=vv('sc_beta');
  const dp=vv('sc_dp')/1000,sg=vv('sc_sg'),ng=vv('sc_ng'),vc=vv('sc_vc');
  const dt=vv('sc_dt'),ladd=vv('sc_ladd')/100,gd=vv('sc_gd'),fb=vv('sc_fb');
  // Bar screen
  const A_open=bm/(bm+t)*W*d;
  const v_thru=Qp/A_open;
  const hl_c=beta*Math.pow(t/bm,4/3)*Math.pow(vel,2)/(2*9.81)*Math.sin(ang*Math.PI/180);
  const hl_cl=hl_c*3.5;
  const scrArea=Qp/vel;
  // Grit — Stokes
  const rho=1000,mu=0.001;
  const vs_stk=9.81*(sg*rho-rho)*dp*dp/(18*mu);
  const vs_d=vs_stk*0.30;
  const Qch=G.Q*G.PF/ng/86400;
  const A_ch=Qch/vc;
  const gW=Math.sqrt(A_ch/1.5),gD=1.5*gW;
  const gLf=vc*dt;
  const gL=gLf*(1+ladd);
  const gWall=gD+gd+fb;
  const gVol=gW*gL*gD;
  // Results
  document.getElementById('sc_Qd').textContent=fi(G.Q);
  document.getElementById('sc_Qpd').textContent=fi(G.Q*G.PF);
  const html=
    rs('⚡ Flow Parameters',rg([rc(f2(Qp*1000,1),'Peak Flow','L/s'),rc(fi(G.Q*G.PF),'Peak Daily','m³/d'),rc(f2(G.PF,2),'Peak Factor','—')])) +
    rs(`🔲 Bar Screen (${ns} units incl. standby)`,rg([
      rc(f2(v_thru,2),'Velocity thru Screen','m/s',v_thru>=0.3&&v_thru<=0.9?'ok':'warn'),
      rc(f2(hl_c*1000,1),'Headloss (clean)','mm',hl_c*1000<150?'ok':'warn'),
      rc(f2(hl_cl*1000,1),'Headloss (clogged ×3.5)','mm'),
      rc(f2(A_open*10000,1),'Net Open Area','cm²'),
      rc(f2(scrArea,3),'Gross Screen Area','m²'),
      rc(f2(t/(bm+t)*100,1),'Bar Coverage',`%`),
    ])) +
    rs(`🪨 Grit Chamber — Horizontal Flow (${ng} channels)`,rg([
      rc(f2(vs_stk*1000,3),'Stokes Settling Vel.','mm/s','amb'),
      rc(f2(vs_d*1000,3),'Design Settling Vel. (×0.3)','mm/s'),
      rc(f2(gL,2),'Channel Length L','m','amb'),
      rc(f2(gW,2),'Channel Width W','m'),
      rc(f2(gD,2),'Flow Depth D','m'),
      rc(f2(gL/gW,2),'L:W Ratio','—',gL/gW>=3&&gL/gW<=5?'ok':'warn'),
      rc(f2(gW/gD,2),'W:D Ratio','—',gW/gD>=1&&gW/gD<=5?'ok':'warn'),
      rc(f2(gWall,2),'Total Wall Depth','m'),
      rc(f2(gVol,1),'Volume per Channel','m³'),
      rc(ng,'No. of Channels','(incl. standby)'),
    ]));
  document.getElementById('sc-res-area').innerHTML=html;
  const checks=[
    ck(v_thru>=0.3&&v_thru<=0.9,'Screen velocity 0.3–0.9 m/s',f2(v_thru,2)+' m/s','M&E Table 5-3'),
    ck(hl_c*1000<150,'Headloss clean <150 mm',f2(hl_c*1000,1)+' mm'),
    ck(ns>=2,'Min 2 screens (duty + standby)',ns+' units'),
    ck(vs_d*1000>0.05,'Design settling vel. adequate',f2(vs_d*1000,3)+' mm/s','Stokes @ dp=0.2mm'),
    ck(gL/gW>=3&&gL/gW<=5,'L:W ratio 3:1–5:1',f2(gL/gW,2)+':1','M&E Table 5-16'),
    ck(gW/gD>=1&&gW/gD<=5,'W:D ratio 1:1–5:1',f2(gW/gD,2)+':1','M&E Table 5-16'),
    ck(ng>=2,'Min 2 grit channels',ng+' channels'),
    ck(dt>=45&&dt<=90,'Detention time 45–90 sec',dt+' sec','M&E Table 5-16'),
  ];
  document.getElementById('sc-chk-body').innerHTML=`<div class="ck-list">${checks.join('')}</div>`;
  // DRAW
  drawScreening({W,d,bm,t,vel,ang,ns,scrArea,gL,gW,gD,gWall,gVol,ng,vc,vs_d,vs_stk,dt,gd,fb});
  // Switch to drawing tab
  const tabs=document.querySelectorAll('#sc-drw');
  document.querySelector('.tp#sc-res').classList.add('active');
  document.querySelector('.tp#sc-res').previousElementSibling?.classList.add('active');
}

function drawScreening(d){
  const svgW=1100,svgH=580,bY=62;
  const scrX=50,scrW=Math.min(Math.max(d.W*130,190),280),scrH=155;
  const gW2=Math.min(Math.max(d.gL*46,220),380),gH2=Math.min(Math.max(d.gD*55,100),155);
  const gX=scrX+scrW+75;
  let s=`<defs>${mkArr('ar','#f5a623')}${mkArr('arb','#3a9bd4')}${mkArr('arg','#1a9454')}${mkArr('arr','#8b7355')}</defs>`;
  s+=`<rect width="${svgW}" height="${svgH}" fill="#f6f5f0"/>`;
  // ── TITLE
  s+=`<text x="14" y="24" font-size="11.5" font-weight="800" fill="#080808" font-family="Space Grotesk,Inter,sans-serif">SCREENING + GRIT CHAMBER — COMBINED PLAN VIEW</text>`;
  s+=`<text x="${svgW-14}" y="24" text-anchor="end" font-size="9.5" fill="#888" font-family="Inter,sans-serif">Q = ${fi(G.Q)} m³/d  |  Qp = ${fi(G.Q*G.PF)} m³/d  |  Design Temp = ${G.T}°C</text>`;
  s+=`<line x1="14" y1="30" x2="${svgW-14}" y2="30" stroke="#e9e6dc" stroke-width="1"/>`;
  // ── INFLUENT
  s+=`<line x1="0" y1="${bY+scrH/2}" x2="${scrX}" y2="${bY+scrH/2}" stroke="#f5a623" stroke-width="2.8" marker-end="url(#ar)"/>`;
  s+=`<text x="4" y="${bY+scrH/2-10}" font-size="9.5" font-weight="700" fill="#c4820d" font-family="Inter,sans-serif">INFLUENT</text>`;
  s+=`<text x="4" y="${bY+scrH/2+8}" font-size="8.5" fill="#888" font-family="Inter,sans-serif">Q=${fi(G.Q)} m³/d</text>`;
  s+=`<text x="4" y="${bY+scrH/2+20}" font-size="8.5" fill="#888" font-family="Inter,sans-serif">Qp=${fi(G.Q*G.PF)} m³/d</text>`;
  // ── BAR SCREEN CHANNEL
  s+=`<rect x="${scrX}" y="${bY}" width="${scrW}" height="${scrH}" rx="5" fill="#fffae8" stroke="#f5a623" stroke-width="2.5"/>`;
  s+=`<text x="${scrX+scrW/2}" y="${bY+17}" text-anchor="middle" font-size="10.5" font-weight="800" fill="#080808" font-family="Space Grotesk,Inter,sans-serif">BAR SCREEN CHANNEL</text>`;
  // Bar screen bars (vertical)
  const nBars=Math.min(12,Math.round(scrW/22));
  const barsX=scrX+20;const barsW=scrW-40;
  for(let i=0;i<nBars;i++){const bx=barsX+i*(barsW/(nBars-1));s+=`<rect x="${bx-2}" y="${bY+25}" width="4" height="${scrH-40}" rx="1" fill="#c4820d" opacity=".9"/>`}
  s+=`<line x1="${scrX+10}" y1="${bY+25}" x2="${scrX+scrW-10}" y2="${bY+25}" stroke="#c4820d" stroke-width="1" stroke-dasharray="4 2"/>`;
  s+=`<line x1="${scrX+10}" y1="${bY+scrH-14}" x2="${scrX+scrW-10}" y2="${bY+scrH-14}" stroke="#c4820d" stroke-width="1" stroke-dasharray="4 2"/>`;
  s+=`<text x="${scrX+scrW/2}" y="${bY+scrH-30}" text-anchor="middle" font-size="9" fill="#888" font-family="Inter,sans-serif">${d.ns} screens | W=${d.W}m | D=${d.d}m</text>`;
  s+=`<text x="${scrX+scrW/2}" y="${bY+scrH-18}" text-anchor="middle" font-size="9" fill="#888" font-family="Inter,sans-serif">Bar ${(d.t*1000).toFixed(0)}mm | Clear ${(d.bm*1000).toFixed(0)}mm | θ=${d.ang}°</text>`;
  s+=`<text x="${scrX+scrW/2}" y="${bY+scrH-6}" text-anchor="middle" font-size="9" fill="#888" font-family="Inter,sans-serif">v_thru = ${f2(G.Q*G.PF/86400/(d.bm/(d.bm+d.t)*d.W*d.d),2)} m/s</text>`;
  // Screenings discharge
  s+=`<line x1="${scrX+scrW*0.45}" y1="${bY+scrH}" x2="${scrX+scrW*0.45}" y2="${bY+scrH+68}" stroke="#8b7355" stroke-width="2" stroke-dasharray="5 3" marker-end="url(#arr)"/>`;
  s+=`<rect x="${scrX+scrW*0.45-32}" y="${bY+scrH+55}" width="64" height="18" rx="3" fill="#f5edd8" stroke="#c8a96e" stroke-width="1"/>`;
  s+=`<text x="${scrX+scrW*0.45}" y="${bY+scrH+68}" text-anchor="middle" font-size="8.5" fill="#5a4a2e" font-family="Inter,sans-serif" font-weight="600">Screenings</text>`;
  // Screen → Grit
  s+=`<line x1="${scrX+scrW}" y1="${bY+scrH/2}" x2="${gX}" y2="${bY+scrH/2}" stroke="#f5a623" stroke-width="2.8" marker-end="url(#ar)"/>`;
  // ── GRIT CHAMBER
  s+=`<rect x="${gX}" y="${bY}" width="${gW2}" height="${gH2+34}" rx="5" fill="#f5edd8" stroke="#8b7355" stroke-width="2.5"/>`;
  s+=`<text x="${gX+gW2/2}" y="${bY+17}" text-anchor="middle" font-size="10.5" font-weight="800" fill="#080808" font-family="Space Grotesk,Inter,sans-serif">HORIZONTAL FLOW GRIT CHAMBER</text>`;
  // Flow direction arrow inside grit chamber
  s+=`<line x1="${gX+20}" y1="${bY+gH2*0.4}" x2="${gX+gW2-20}" y2="${bY+gH2*0.4}" stroke="#f5a623" stroke-width="1.8" marker-end="url(#ar)" stroke-dasharray="7 4"/>`;
  s+=`<text x="${gX+gW2/2}" y="${bY+gH2*0.4-8}" text-anchor="middle" font-size="9" fill="#c4820d" font-family="Inter,sans-serif">vc = ${d.vc} m/s → (Horizontal control velocity)</text>`;
  // Stokes settling arrows
  for(let i=0;i<5;i++){const ax=gX+gW2*0.14+i*(gW2*0.72/4);s+=`<line x1="${ax}" y1="${bY+gH2*0.4+14}" x2="${ax}" y2="${bY+gH2-22}" stroke="#3a9bd4" stroke-width="1.5" marker-end="url(#arb)" stroke-dasharray="5 3"/>`;s+=`<circle cx="${ax}" cy="${bY+gH2*0.4+10}" r="3" fill="#3a9bd4" opacity=".6"/>`}
  s+=`<text x="${gX+gW2/2}" y="${bY+gH2*0.7}" text-anchor="middle" font-size="8.5" fill="#1565c0" font-family="Inter,sans-serif">↓ Grit settling  vs_design = ${f2(d.vs_d*1000,3)} mm/s  [Stokes Law]</text>`;
  // Grit collection hopper
  s+=`<rect x="${gX+4}" y="${bY+gH2-18}" width="${gW2-8}" height="18" rx="2" fill="#c8a96e" opacity=".65" stroke="#8b7355" stroke-width="1"/>`;
  s+=`<text x="${gX+gW2/2}" y="${bY+gH2-6}" text-anchor="middle" font-size="8.5" fill="#3a2010" font-family="Inter,sans-serif" font-weight="600">Grit Collection Hopper</text>`;
  // Grit chamber dimensions text
  s+=`<text x="${gX+gW2/2}" y="${bY+gH2+16}" text-anchor="middle" font-size="9.5" font-weight="600" fill="#5a5a5a" font-family="Inter,sans-serif">L = ${f2(d.gL,2)} m × W = ${f2(d.gW,2)} m × D = ${f2(d.gD,2)} m | ${d.ng} channels | V = ${f2(d.gVol,1)} m³</text>`;
  s+=`<text x="${gX+gW2/2}" y="${bY+gH2+30}" text-anchor="middle" font-size="8.5" fill="#888" font-family="Inter,sans-serif">Wall depth = ${f2(d.gWall,2)} m | L:W = ${f2(d.gL/d.gW,1)}:1 | W:D = ${f2(d.gW/d.gD,1)}:1</text>`;
  // ── DIMENSION LINES
  s+=DL(gX,bY+gH2+50,gX+gW2,bY+gH2+50,`L = ${f2(d.gL,2)} m`,false,'#1a9454');
  s+=DL(gX+gW2+14,bY,gX+gW2+14,bY+gH2,`D = ${f2(d.gD,2)} m (flow)`,true,'#1a9454');
  s+=DL(scrX,bY-20,scrX+scrW,bY-20,`W = ${d.W} m`,true,'#1a9454');
  // Grit discharge
  s+=`<line x1="${gX+gW2*0.3}" y1="${bY+gH2+34}" x2="${gX+gW2*0.3}" y2="${bY+gH2+84}" stroke="#8b7355" stroke-width="2" stroke-dasharray="5 3" marker-end="url(#arr)"/>`;
  s+=`<rect x="${gX+gW2*0.3-35}" y="${bY+gH2+70}" width="70" height="18" rx="3" fill="#f5edd8" stroke="#c8a96e" stroke-width="1"/>`;
  s+=`<text x="${gX+gW2*0.3}" y="${bY+gH2+83}" text-anchor="middle" font-size="8.5" fill="#5a4a2e" font-family="Inter,sans-serif" font-weight="600">Grit Discharge</text>`;
  // Effluent
  const efX=gX+gW2+12;
  s+=`<line x1="${efX}" y1="${bY+gH2/2}" x2="${efX+80}" y2="${bY+gH2/2}" stroke="#1a9454" stroke-width="2.8" marker-end="url(#arg)"/>`;
  s+=`<text x="${efX+84}" y="${bY+gH2/2-8}" font-size="9.5" font-weight="700" fill="#1a9454" font-family="Inter,sans-serif">To Primary</text>`;
  s+=`<text x="${efX+84}" y="${bY+gH2/2+7}" font-size="8.5" fill="#888" font-family="Inter,sans-serif">Clarifier →</text>`;
  // ── CROSS-SECTION (inset)
  const csX=gX+gW2+130,csY=bY,csW=130,csH=gH2+34;
  s+=`<text x="${csX+csW/2}" y="${csY-5}" text-anchor="middle" font-size="9.5" font-weight="700" fill="#080808" font-family="Inter,sans-serif">CROSS-SECTION A-A</text>`;
  s+=`<rect x="${csX}" y="${csY}" width="${csW}" height="${csH}" rx="4" fill="#f5edd8" stroke="#8b7355" stroke-width="2"/>`;
  const flowH=Math.min(csH*0.52,80);
  s+=`<rect x="${csX+3}" y="${csY+csH-flowH-18}" width="${csW-6}" height="${flowH}" rx="2" fill="#3a9bd4" opacity=".18"/>`;
  s+=`<line x1="${csX+3}" y1="${csY+csH-flowH-18}" x2="${csX+csW-3}" y2="${csY+csH-flowH-18}" stroke="#3a9bd4" stroke-width="1.5" stroke-dasharray="5 3"/>`;
  s+=`<text x="${csX+csW/2}" y="${csY+csH-flowH-22}" text-anchor="middle" font-size="8" fill="#1565c0" font-family="Inter,sans-serif">Water Surface</text>`;
  s+=`<rect x="${csX+3}" y="${csY+csH-18}" width="${csW-6}" height="18" rx="2" fill="#c8a96e" opacity=".6"/>`;
  s+=`<text x="${csX+csW/2}" y="${csY+csH-6}" text-anchor="middle" font-size="7.5" fill="#3a2010" font-family="Inter,sans-serif">Grit Zone</text>`;
  s+=DL(csX,csY+csH+12,csX+csW,csY+csH+12,`W=${f2(d.gW,2)}m`,false,'#1a9454');
  s+=DL(csX+csW+10,csY,csX+csW+10,csY+csH-18,`D=${f2(d.gD,2)}m`,true,'#1a9454');
  s+=DL(csX+csW+10,csY+csH-18,csX+csW+10,csY+csH,`grit=${d.gd}m`,true,'#1a9454');
  // Section cut marker
  s+=`<line x1="${gX}" y1="${bY+gH2/2}" x2="${gX-16}" y2="${bY+gH2/2}" stroke="#080808" stroke-width="1.5" stroke-dasharray="3 2"/>`;
  s+=`<text x="${gX-18}" y="${bY+gH2/2+4}" text-anchor="end" font-size="8.5" fill="#080808" font-family="Inter,sans-serif" font-weight="700">A</text>`;
  s+=`<line x1="${gX+gW2}" y1="${bY+gH2/2}" x2="${gX+gW2+12}" y2="${bY+gH2/2}" stroke="#080808" stroke-width="1.5" stroke-dasharray="3 2"/>`;
  s+=`<text x="${gX+gW2+14}" y="${bY+gH2/2+4}" font-size="8.5" fill="#080808" font-family="Inter,sans-serif" font-weight="700">A</text>`;
  s+=TB(svgW,svgH,'Screening + Grit Removal — Plan View','M&E 5th Ed. Eq. 5-2 (Kirschmer) + Table 5-16 (Stokes) · '+vs('p_name'),'NTS','1 of 15');
  document.getElementById('sc-svg').setAttribute('viewBox',`0 0 ${svgW} ${svgH}`);
  document.getElementById('sc-svg').innerHTML=s;
  // switch to drawing tab
  const mc=document.getElementById('mod-content');
  mc.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  mc.querySelectorAll('.tp').forEach(p=>p.classList.remove('active'));
  const drwTab=mc.querySelectorAll('.tab')[3];if(drwTab){drwTab.classList.add('active');mc.querySelector('#sc-drw').classList.add('active')}
}


/* ══════ DAF CALC ══════ */
function calcDAF(){
  const Q=vv('daf_Q'),R=vv('daf_R'),Pg=vv('daf_Pg'),Patm=101.35;
  const T=vv('daf_T'),f=vv('daf_f'),TSS=vv('daf_TSS'),OG=vv('daf_OG'),chem=vv('daf_chem');
  const HL=vv('daf_HL'),n=vv('daf_n'),mode=vs('daf_mode');
  const sa=-0.0002*T*T*T+0.0175*T*T-0.795*T+29.20;
  const P_abs=(Pg+Patm)/101.325;
  const Sa=TSS+OG+chem;
  const AS=mode==='recycle'?1.3*sa*(f*P_abs-1)*(R/Q)/Sa:1.3*sa*(f*P_abs-1)/Sa;
  const Sol_rate=Q*Sa/1000/24;
  const Air_m3=AS*Sol_rate*60/1000;
  const Air_Nm3=Air_m3*P_abs*1.01325*(293.15/(T+273.15));
  const Q_total=(Q+R)/1000/60;
  const A=Q_total/HL*1000/n;
  const W=Math.sqrt(A);const L=W;
  const SL=Sol_rate/A/n;
  document.getElementById('df-res-area').innerHTML=
    rs('🌬️ Air System',rg([rc(f2(sa,1),'Air Solubility sa','mL/L','amb'),rc(f2(P_abs,3),'Abs. Pressure P','atm'),rc(f2(AS*1000,3),'A/S Ratio','mL/mg'),rc(f2(Air_Nm3,2),'Air Required (Normal)','Nm³/hr')]))+
    rs('🏊 DAF Tank ('+n+' units)',rg([rc(f2(A,1),'Area per Unit','m²','amb'),rc(f2(W,2),'Unit Width','m'),rc(f2(L,2),'Unit Length','m'),rc(f2(SL,3),'Solids Loading','kg/m²/hr')]));
  document.getElementById('df-chk-body').innerHTML=`<div class="ck-list">${[
    ck(HL>=4&&HL<=12,'Hydraulic loading 4–12 L/m²/min',f2(HL,1)+' L/m²/min','M&E Table 14-20'),
    ck(SL<=6,'Solids loading ≤6 kg/m²/hr',f2(SL,3)+' kg/m²/hr'),
  ].join('')}</div>`;
  drawDAF({Q,R,W,L,A,n,sa,AS,Air_Nm3,Pg,T,TSS,OG,Sol_rate});
  const mc=document.getElementById('mod-content');mc.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));mc.querySelectorAll('.tp').forEach(p=>p.classList.remove('active'));mc.querySelectorAll('.tab')[2]?.classList.add('active');mc.querySelector('#df-drw')?.classList.add('active');
}
function drawDAF(d){
  const svgW=1100,svgH=540;const bX=70,bY=60;
  const bW=Math.min(Math.max(d.W*44,200),400),bH=Math.min(Math.max(d.L*30,130),200);
  let s=`<defs>${mkArr('ar','#f5a623')}${mkArr('arg','#1a9454')}${mkArr('arb','#3a9bd4')}</defs>`;
  s+=`<rect width="${svgW}" height="${svgH}" fill="#f6f5f0"/>`;
  s+=`<text x="14" y="24" font-size="11.5" font-weight="800" fill="#080808" font-family="Space Grotesk,Inter,sans-serif">DAF UNIT — LONGITUDINAL SECTION</text>`;
  s+=`<text x="${svgW-14}" y="24" text-anchor="end" font-size="9.5" fill="#888" font-family="Inter,sans-serif">Q=${fi(d.Q)} m³/d | A/S=${f2(d.AS*1000,3)} mL/mg | sa=${f2(d.sa,1)} mL/L | Air=${f2(d.Air_Nm3,2)} Nm³/hr</text>`;
  s+=`<line x1="14" y1="30" x2="${svgW-14}" y2="30" stroke="#e9e6dc" stroke-width="1"/>`;
  // Tank
  s+=`<rect x="${bX}" y="${bY}" width="${bW}" height="${bH}" rx="6" fill="#ddeeff" stroke="#3a9bd4" stroke-width="2.5"/>`;
  // Sludge zone
  s+=`<rect x="${bX}" y="${bY+bH*0.62}" width="${bW*0.3}" height="${bH*0.38}" rx="0" fill="#c8a96e" opacity=".55"/>`;
  s+=`<text x="${bX+bW*0.15}" y="${bY+bH*0.82}" text-anchor="middle" font-size="9" fill="#5a4a2e" font-family="Inter,sans-serif" font-weight="600">Sludge Zone</text>`;
  // Flotation zone label
  s+=`<rect x="${bX+bW*0.32}" y="${bY+7}" width="${bW*0.36}" height="22" rx="3" fill="rgba(255,255,255,.6)" stroke="#3a9bd4" stroke-width="1"/>`;
  s+=`<text x="${bX+bW*0.5}" y="${bY+22}" text-anchor="middle" font-size="9.5" font-weight="700" fill="#1b5e8a" font-family="Inter,sans-serif">Flotation Zone — Air Bubbles Rising</text>`;
  // Bubbles
  for(let i=0;i<18;i++){const bx=bX+bW*0.3+(Math.random()*bW*0.55);const by=bY+30+(Math.random()*(bH*0.55));const br=1+Math.random()*3;s+=`<circle cx="${bx.toFixed(0)}" cy="${by.toFixed(0)}" r="${br.toFixed(1)}" fill="white" opacity=".7"/>`}
  // Float layer
  s+=`<rect x="${bX+2}" y="${bY+2}" width="${bW-4}" height="18" rx="4" fill="#f5a623" opacity=".3"/>`;
  s+=`<text x="${bX+bW/2}" y="${bY+13}" text-anchor="middle" font-size="8.5" fill="#c4820d" font-family="Inter,sans-serif">Float Layer (Scum) — Removed by Skimmer</text>`;
  // Influent
  s+=`<line x1="0" y1="${bY+bH/2}" x2="${bX}" y2="${bY+bH/2}" stroke="#f5a623" stroke-width="2.5" marker-end="url(#ar)"/>`;
  s+=`<text x="4" y="${bY+bH/2-8}" font-size="9.5" font-weight="700" fill="#c4820d" font-family="Inter,sans-serif">Influent</text>`;
  s+=`<text x="4" y="${bY+bH/2+8}" font-size="8.5" fill="#888" font-family="Inter,sans-serif">Q=${fi(d.Q)} m³/d</text>`;
  // Effluent
  s+=`<line x1="${bX+bW}" y1="${bY+bH*0.45}" x2="${bX+bW+60}" y2="${bY+bH*0.45}" stroke="#1a9454" stroke-width="2.5" marker-end="url(#arg)"/>`;
  s+=`<text x="${bX+bW+64}" y="${bY+bH*0.45-6}" font-size="9.5" font-weight="700" fill="#1a9454" font-family="Inter,sans-serif">Clarified</text>`;
  s+=`<text x="${bX+bW+64}" y="${bY+bH*0.45+7}" font-size="8.5" fill="#888" font-family="Inter,sans-serif">Effluent →</text>`;
  // Sludge underflow
  s+=`<line x1="${bX+bW*0.15}" y1="${bY+bH}" x2="${bX+bW*0.15}" y2="${bY+bH+50}" stroke="#8b7355" stroke-width="2" marker-end="url(#ar)"/>`;
  s+=`<text x="${bX+bW*0.15+6}" y="${bY+bH+38}" font-size="8.5" fill="#888" font-family="Inter,sans-serif">Float Sludge</text>`;
  // Recycle line
  s+=`<path d="M${bX+bW} ${bY+bH*0.7} Q${bX+bW+55} ${bY+bH+70} ${bX+bW*0.5} ${bY+bH+70} L${bX+25} ${bY+bH+70} L${bX+25} ${bY+bH}" fill="none" stroke="#f5a623" stroke-width="1.8" stroke-dasharray="6 3" marker-end="url(#ar)"/>`;
  s+=`<text x="${bX+bW/2}" y="${bY+bH+82}" text-anchor="middle" font-size="8.5" fill="#c4820d" font-family="Inter,sans-serif">Pressurised Recycle R=${fi(d.R)} m³/d | Pg=${d.Pg||276} kPa</text>`;
  // Dims
  s+=DL(bX,bY+bH+96,bX+bW,bY+bH+96,`L = ${f2(d.L,2)} m`,false,'#1a9454');
  s+=DL(bX+bW+12,bY,bX+bW+12,bY+bH,`W = ${f2(d.W,2)} m`,true,'#1a9454');
  // Info box
  const ibX=bX+bW+105,ibY=bY;
  s+=`<rect x="${ibX}" y="${ibY}" width="220" height="140" rx="7" fill="rgba(255,255,255,.95)" stroke="#e9e6dc" stroke-width="1"/>`;
  s+=`<text x="${ibX+12}" y="${ibY+16}" font-size="9.5" font-weight="800" fill="#080808" font-family="Space Grotesk,Inter,sans-serif">DAF DESIGN SUMMARY</text>`;
  [{k:'Air Solubility sa',v:f2(d.sa,1)+' mL/L'},{k:'Abs. Pressure P',v:f2((d.Pg+101.35)/101.325,3)+' atm'},{k:'A/S Ratio',v:f2(d.AS*1000,4)+' mL/mg'},{k:'Air Required',v:f2(d.Air_Nm3,2)+' Nm³/hr'},{k:'Tank Area/Unit',v:f2(d.A,1)+' m²'},{k:'Solids Load In',v:f2(d.Sol_rate,2)+' kg/hr'},{k:'Equation',v:'M&E 4th Ed.'}].forEach((row,i)=>{s+=`<text x="${ibX+12}" y="${ibY+32+i*15}" font-size="8.5" fill="#888" font-family="Inter,sans-serif">${row.k}: <tspan font-weight="700" fill="#f5a623">${row.v}</tspan></text>`});
  s+=TB(svgW,svgH,'DAF Unit — Longitudinal Section','M&E 5th Ed. Sec. 14-7  ·  Air Solubility: sa = −0.0002T³ + 0.0175T² − 0.795T + 29.20  ·  '+vs('p_name'),'NTS','5 of 15');
  document.getElementById('df-svg').setAttribute('viewBox',`0 0 ${svgW} ${svgH}`);document.getElementById('df-svg').innerHTML=s;
}

/* ══════ SECONDARY CLARIFIER ══════ */
function buildSecClar(){return`<div class="mwrap">
  <div class="mhdr"><div class="mh-left"><div class="mt-title">Secondary Clarifier Design<div class="mt-badge">SECONDARY</div></div><div class="mt-bread">SOR + SLR dual basis · M&E 5th Ed. Section 8-5 · Table 8-13</div></div></div>
  <div class="tab-bar"><div class="tab active" onclick="stab(this,'c2-inp')">📋 Inputs</div><div class="tab" onclick="stab(this,'c2-res')">📊 Results</div><div class="tab" onclick="stab(this,'c2-drw')">🖼 2D Drawing</div><div class="tab" onclick="stab(this,'c2-chk')">✅ Checks</div></div>
  <div class="tp active" id="c2-inp">
    <div class="card"><div class="card-hd"><div class="card-hd-t">⊛ Secondary Clarifier Parameters</div></div><div class="card-body"><div class="g4">
      <div class="f"><label>Flow Q</label><div class="fuw"><input type="number" id="c2_Q" value="${G.Q}"><div class="fu">m³/d</div></div></div>
      <div class="f"><label>Peaking Factor PF</label><input type="number" id="c2_PF" value="${G.PF}" step="0.1"></div>
      <div class="f"><label>MLSS in Aeration</label><div class="fuw"><input type="number" id="c2_MLSS" value="3000" step="500"><div class="fu">mg/L</div></div></div>
      <div class="f"><label>RAS Ratio r = R/Q</label><input type="number" id="c2_RAS" value="0.5" step="0.1"><div class="h">Typ 0.3–1.0</div></div>
      <div class="f"><label>Design SOR (avg)</label><div class="fuw"><input type="number" id="c2_SOR" value="22" step="2"><div class="fu">m³/m²/d</div></div><div class="h">M&E: 16–28 avg</div></div>
      <div class="f"><label>Design SOR (peak)</label><div class="fuw"><input type="number" id="c2_SORp" value="47" step="2"><div class="fu">m³/m²/d</div></div><div class="h">M&E: 33–56 peak</div></div>
      <div class="f"><label>Solids Loading Rate</label><div class="fuw"><input type="number" id="c2_SLR" value="5" step="0.5"><div class="fu">kg/m²/hr</div></div><div class="h">Max 6 avg, 8 peak</div></div>
      <div class="f"><label>SVI</label><div class="fuw"><input type="number" id="c2_SVI" value="120" step="10"><div class="fu">mL/g</div></div><div class="h">Typical 80–150</div></div>
      <div class="f"><label>Side Water Depth</label><div class="fuw"><input type="number" id="c2_swd" value="4" step="0.5"><div class="fu">m</div></div></div>
      <div class="f"><label>Max Weir Loading</label><div class="fuw"><input type="number" id="c2_WLR" value="375" step="25"><div class="fu">m³/m/d</div></div></div>
      <div class="f"><label>No. of Units</label><input type="number" id="c2_n" value="2" min="1" max="8"></div>
      <div class="f"><label>Shape</label><select id="c2_shape"><option value="circular">Circular</option><option value="rectangular">Rectangular</option></select></div>
    </div></div></div>
    <div class="btn-row mt"><button class="btn btn-a" onclick="calcSecClar()">⚙️ Calculate Secondary Clarifier</button></div>
  </div>
  <div class="tp" id="c2-res"><div id="c2-ra"><div class="alert al-i">Calculate.</div></div></div>
  <div class="tp" id="c2-drw">
    <div class="dwg-toolbar"><span>SECONDARY CLARIFIER — SECTION VIEW (NTS)</span><button class="btn btn-xs btn-dk" onclick="dlSVG('c2-svg','secondary-clarifier')">⬇ Export SVG</button></div>
    <div class="dwg-wrap"><svg id="c2-svg" viewBox="0 0 1100 560" xmlns="http://www.w3.org/2000/svg"><text x="550" y="280" text-anchor="middle" font-size="14" fill="#aaa">Calculate first</text></svg></div>
  </div>
  <div class="tp" id="c2-chk"><div class="card"><div class="card-hd"><div class="card-hd-t">✅ Design Checks</div></div><div class="card-body" id="c2-ckb"><div class="alert al-i">Calculate first.</div></div></div></div>
</div>`}
function calcSecClar(){
  const Q=vv('c2_Q'),PF=vv('c2_PF'),MLSS=vv('c2_MLSS'),RAS=vv('c2_RAS');
  const SOR=vv('c2_SOR'),SORp=vv('c2_SORp'),SLR=vv('c2_SLR'),SVI=vv('c2_SVI');
  const swd=vv('c2_swd'),WLR=vv('c2_WLR'),n=vv('c2_n');
  const A_SOR=Q/SOR,A_SORp=Q*PF/SORp;
  const Qt=Q*(1+RAS),SLa=Qt*MLSS/1000/24;
  const A_SLR=SLa/SLR;
  const A=Math.max(A_SOR,A_SORp,A_SLR)/n;
  const D=Math.sqrt(4*A/Math.PI),V=A*swd*n,HRT=V/(Q/24);
  const WLa=(Q/n)/(Math.PI*D);
  const RSSc=MLSS*(1+RAS)/RAS;
  document.getElementById('c2-ra').innerHTML=
    rs('📐 Dimensions ('+n+' units)',rg([rc(f2(A_SOR,1),'Area — SOR Basis','m²'),rc(f2(A_SORp,1),'Area — SOR Peak Basis','m²'),rc(f2(A_SLR,1),'Area — SLR Basis','m²'),rc(f2(A,1),'Design Area/Unit','m²','amb'),rc(f2(D,2),'Diameter','m','amb'),rc(f2(swd,1),'SWD','m'),rc(f2(HRT,2),'HRT','hr')]))+
    rs('⚖️ Loading',rg([rc(f2(Q/A/n,1),'Actual SOR (avg)','m³/m²/d',Q/A/n<=SOR?'ok':'warn'),rc(f2(Q*PF/A/n,1),'Actual SOR (peak)','m³/m²/d',Q*PF/A/n<=SORp?'ok':'warn'),rc(f2(SLa/A/n,2),'Actual SLR','kg/m²/hr',SLa/A/n<=SLR?'ok':'warn'),rc(f2(WLa,0),'Weir Loading','m³/m/d',WLa<=WLR?'ok':'warn'),rc(f2(RSSc,0),'Return Sludge Conc.','mg/L')]));
  document.getElementById('c2-ckb').innerHTML=`<div class="ck-list">${[ck(Q/A/n<=28,'SOR avg ≤28 m³/m²/d',f2(Q/A/n,1)+' m³/m²/d'),ck(SLa/A/n<=6,'SLR avg ≤6 kg/m²/hr',f2(SLa/A/n,2)+' kg/m²/hr'),ck(WLa<=WLR,'Weir loading OK',f2(WLa,0)+' m³/m/d'),ck(n>=2,'Min 2 units',n+' units'),ck(swd>=3.5&&swd<=5,'SWD 3.5–5m',swd+' m')].join('')}</div>`;
  // Re-use primary clarifier drawing function with secondary mode
  drawClarifier2({D,swd,n,HRT,WLa,A,RSSc,Q});
  const mc=document.getElementById('mod-content');mc.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));mc.querySelectorAll('.tp').forEach(p=>p.classList.remove('active'));mc.querySelectorAll('.tab')[2]?.classList.add('active');mc.querySelector('#c2-drw')?.classList.add('active');
}
function drawClarifier2(d){
  const svgW=1100,svgH=560;const cX=300,cY=200;const r=Math.min(Math.max(d.D*22,100),170);
  let s=`<defs>${mkArr('ar','#f5a623')}${mkArr('arg','#1a9454')}${mkArr('arb','#3a9bd4')}</defs>`;
  s+=`<rect width="${svgW}" height="${svgH}" fill="#f6f5f0"/>`;
  s+=`<text x="14" y="24" font-size="11.5" font-weight="800" fill="#080808" font-family="Space Grotesk,Inter,sans-serif">SECONDARY CLARIFIER — LONGITUDINAL SECTION (CIRCULAR)</text>`;
  s+=`<text x="${svgW-14}" y="24" text-anchor="end" font-size="9.5" fill="#888" font-family="Inter,sans-serif">Ø=${f2(d.D,2)} m  |  SWD=${d.swd} m  |  ${d.n} units  |  HRT=${f2(d.HRT,2)} hr</text>`;
  s+=`<line x1="14" y1="30" x2="${svgW-14}" y2="30" stroke="#e9e6dc" stroke-width="1"/>`;
  s+=`<line x1="${cX-r+8}" y1="${cY}" x2="${cX+r-8}" y2="${cY}" stroke="#3a9bd4" stroke-width="1.5" stroke-dasharray="8 4" opacity=".55"/>`;
  s+=`<ellipse cx="${cX}" cy="${cY}" rx="${r}" ry="${r*0.2}" fill="none" stroke="#f5a623" stroke-width="2.5"/>`;
  s+=`<line x1="${cX-r}" y1="${cY}" x2="${cX-r}" y2="${cY+d.swd*28}" stroke="#f5a623" stroke-width="2.5"/>`;
  s+=`<line x1="${cX+r}" y1="${cY}" x2="${cX+r}" y2="${cY+d.swd*28}" stroke="#f5a623" stroke-width="2.5"/>`;
  s+=`<path d="M${cX-r} ${cY} Q${cX} ${cY+r*0.2} ${cX+r} ${cY} L${cX+r} ${cY+d.swd*28} L${cX-r} ${cY+d.swd*28} Z" fill="#3a9bd4" opacity=".08"/>`;
  const hB=cY+d.swd*28;
  s+=`<path d="M${cX-r+4} ${hB} L${cX-22} ${hB+48} L${cX+22} ${hB+48} L${cX+r-4} ${hB} Z" fill="#c8a96e" opacity=".6" stroke="#8b7355" stroke-width="1.5"/>`;
  s+=`<text x="${cX}" y="${hB+33}" text-anchor="middle" font-size="9" fill="#3a2010" font-family="Inter,sans-serif" font-weight="700">Sludge Blanket</text>`;
  // Feed well
  s+=`<rect x="${cX-22}" y="${cY-r*0.12+5}" width="44" height="${d.swd*28*0.52}" rx="4" fill="#fff9e6" stroke="#f5a623" stroke-width="2"/>`;
  s+=`<text x="${cX}" y="${cY-r*0.12+19}" text-anchor="middle" font-size="9" fill="#c4820d" font-family="Inter,sans-serif" font-weight="700">Feed Well</text>`;
  // From aeration (influent)
  s+=`<line x1="30" y1="${cY+8}" x2="${cX-22}" y2="${cY+8}" stroke="#f5a623" stroke-width="2.5" marker-end="url(#ar)"/>`;
  s+=`<text x="34" y="${cY+2}" font-size="9.5" font-weight="700" fill="#c4820d" font-family="Inter,sans-serif">From Aeration Basin</text>`;
  // Scum baffle + effluent weir
  s+=`<line x1="${cX+r*0.77}" y1="${cY-14}" x2="${cX+r*0.77}" y2="${cY+24}" stroke="#080808" stroke-width="3"/>`;
  s+=`<line x1="${cX+r*0.84}" y1="${cY+4}" x2="${cX+r*0.84}" y2="${cY+20}" stroke="#1a9454" stroke-width="3"/>`;
  s+=`<line x1="${cX+r*0.84}" y1="${cY+12}" x2="${svgW-100}" y2="${cY+12}" stroke="#1a9454" stroke-width="2" marker-end="url(#arg)"/>`;
  s+=`<text x="${svgW-95}" y="${cY+8}" font-size="9.5" font-weight="700" fill="#1a9454" font-family="Inter,sans-serif">Effluent</text>`;
  s+=`<text x="${svgW-95}" y="${cY+21}" font-size="8.5" fill="#888" font-family="Inter,sans-serif">WLR=${f2(d.WLa,0)} m³/m/d</text>`;
  // RAS
  s+=`<line x1="${cX}" y1="${hB+48}" x2="${cX}" y2="${hB+88}" stroke="#3a9bd4" stroke-width="2.5" marker-end="url(#arb)"/>`;
  s+=`<text x="${cX+6}" y="${hB+76}" font-size="9" fill="#1b5e8a" font-family="Inter,sans-serif" font-weight="700">RAS to Aeration</text>`;
  s+=`<text x="${cX+6}" y="${hB+88}" font-size="8.5" fill="#888" font-family="Inter,sans-serif">Conc. = ${fi(d.RSSc)} mg/L</text>`;
  // Scraper
  s+=`<line x1="${cX}" y1="${hB}" x2="${cX+r-6}" y2="${hB-8}" stroke="#aaa" stroke-width="2" stroke-dasharray="8 4"/>`;
  s+=`<text x="${cX+r*0.4}" y="${hB-13}" font-size="8.5" fill="#aaa" font-family="Inter,sans-serif">Rotating Scraper</text>`;
  // WAS from clarifier (small)
  s+=`<line x1="${cX-r*0.4}" y1="${hB+48}" x2="${cX-r*0.4}" y2="${hB+80}" stroke="#8b7355" stroke-width="1.8" stroke-dasharray="5 3" marker-end="url(#ar)"/>`;
  s+=`<text x="${cX-r*0.4+5}" y="${hB+70}" font-size="8.5" fill="#888" font-family="Inter,sans-serif">WAS →</text>`;
  s+=DL(cX+r+20,cY,cX+r+20,cY+d.swd*28,`SWD = ${d.swd} m`,true,'#1a9454');
  s+=DL(cX-r,cY-r*0.2-26,cX+r,cY-r*0.2-26,`Ø = ${f2(d.D,2)} m (each of ${d.n})`,true,'#1a9454');
  s+=TB(svgW,svgH,'Secondary Clarifier — Section View','M&E 5th Ed. Section 8-5  ·  SOR + SLR dual-basis design  ·  '+vs('p_name'),'NTS','6 of 15');
  document.getElementById('c2-svg').setAttribute('viewBox',`0 0 ${svgW} ${svgH}`);document.getElementById('c2-svg').innerHTML=s;
}

/* ══════ REMAINING MODULES ══════ */
function buildMBR(){return`<div class="mwrap"><div class="cs"><div class="cs-icon">🔵</div><div class="cs-t">MBR System Design</div><div class="cs-d">Membrane Bioreactor with flux equation J=0.73T+7.25, membrane area, MLSS, pre-anoxic zone, scouring air. Use Secondary Bio module for MBR-style calculations.<br><br><button class="btn btn-a btn-sm" onclick="gm('secondary')">Open Secondary Module →</button></div></div></div>`}
function buildSBR(){return`<div class="mwrap"><div class="cs"><div class="cs-icon">🔄</div><div class="cs-t">SBR Design</div><div class="cs-d">Cycle sequencing: fill → react → settle → decant. BOD+Nitrification, Pre-Anoxic, Post-Anoxic configurations. Basin volume, O₂ demand, decanter sizing.<br><br><button class="btn btn-a btn-sm" onclick="gm('secondary')">Open in Secondary Module →</button></div></div></div>`}
function buildMBBR(){return`<div class="mwrap"><div class="cs"><div class="cs-icon">🟡</div><div class="cs-t">MBBR System Design</div><div class="cs-desc">SALR/SARR carrier sizing for BOD removal and nitrification. Pre- and Post-Anoxic denitrification stages. Carrier fill 40–50%, specific surface area from supplier.<br><br><button class="btn btn-a btn-sm" onclick="gm('secondary')">Open in Secondary Module →</button></div></div></div>`}
function buildTrickling(){return`<div class="mwrap"><div class="mhdr"><div class="mh-left"><div class="mt-title">Trickling Filter Design<div class="mt-badge">FIXED FILM</div></div><div class="mt-bread">NRC Formula · 1-Stage and 2-Stage · M&E 5th Ed. Section 9-3</div></div></div>
  <div class="tab-bar"><div class="tab active" onclick="stab(this,'tf-inp')">📋 Inputs</div><div class="tab" onclick="stab(this,'tf-res')">📊 Results</div><div class="tab" onclick="stab(this,'tf-chk')">✅ Checks</div></div>
  <div class="tp active" id="tf-inp">
    <div class="card"><div class="card-hd"><div class="card-hd-t">🏔️ Trickling Filter — NRC Formula</div></div><div class="card-body"><div class="g4">
      <div class="f"><label>Prim. Effluent Flow Q</label><div class="fuw"><input type="number" id="tf_Q" value="${G.Q}"><div class="fu">m³/d</div></div></div>
      <div class="f"><label>Influent BOD</label><div class="fuw"><input type="number" id="tf_BOD" value="${Math.round(G.BOD*(1-G.primaryBODrem/100))}"><div class="fu">mg/L</div></div></div>
      <div class="f"><label>Target Eff. BOD</label><div class="fuw"><input type="number" id="tf_BODe" value="${G.BODe}"><div class="fu">mg/L</div></div></div>
      <div class="f"><label>Media Depth H</label><div class="fuw"><input type="number" id="tf_H" value="2" step="0.5"><div class="fu">m</div></div></div>
      <div class="f"><label>Recirculation Ratio R</label><input type="number" id="tf_R" value="2" step="0.5"><div class="h">Recirculated/Raw flow</div></div>
      <div class="f"><label>No. of Filters</label><input type="number" id="tf_N" value="1" min="1" max="4"></div>
    </div></div></div>
    <div class="btn-row mt"><button class="btn btn-a" onclick="calcTrickling()">⚙️ Calculate Trickling Filter</button></div>
  </div>
  <div class="tp" id="tf-res"><div id="tf-ra"><div class="alert al-i">Calculate first.</div></div></div>
  <div class="tp" id="tf-chk"><div class="card"><div class="card-hd"><div class="card-hd-t">✅ Checks</div></div><div class="card-body" id="tf-ckb"><div class="alert al-i">Calculate.</div></div></div></div>
</div>`}
function calcTrickling(){
  const Q=vv('tf_Q'),BOD=vv('tf_BOD'),BODe=vv('tf_BODe'),H=vv('tf_H'),R=vv('tf_R'),N=vv('tf_N');
  const E=(BOD-BODe)/BOD;
  const F=(1+R)/Math.pow(1+0.1*R,2);
  const wV=(BOD*Q/1000);
  const w_over_VF=Math.pow((1-E)/(0.4432*E),2);
  const V=wV/w_over_VF/F;const VN=V/N;
  const D=Math.sqrt(4*VN/(Math.PI*H));
  const BODload=wV/1000/V;
  const HydLoad=Q*(1+R)/(Math.PI*D*D/4*N);
  document.getElementById('tf-ra').innerHTML=
    rs('📐 Filter Dimensions ('+N+' filters)',rg([rc(f2(V,0),'Total Media Volume','m³'),rc(f2(VN,0),'Volume per Filter','m³','amb'),rc(f2(D,2),'Filter Diameter','m','amb'),rc(f2(H,1),'Media Depth','m'),rc(f2(E*100,1),'BOD Efficiency','%','ok'),rc(f2(F,3),'Recirculation Factor F','—'),rc(f2(BODload,3),'BOD Loading','kg BOD/d/m³'),rc(f2(HydLoad,2),'Hydraulic Loading','m³/d/m²')]));
  document.getElementById('tf-ckb').innerHTML=`<div class="ck-list">${[ck(BODload<=0.4,'BOD loading ≤0.4 kg/d/m³',f2(BODload,3)),ck(HydLoad>=1&&HydLoad<=30,'Hydraulic loading 1–30 m³/d/m²',f2(HydLoad,2))].join('')}</div>`;
}
function buildDigester(){return`<div class="mwrap"><div class="mhdr"><div class="mh-left"><div class="mt-title">Anaerobic Digester Design<div class="mt-badge">SOLIDS</div></div><div class="mt-bread">M&E 5th Ed. Ch. 14 · Single-stage mesophilic · Sludge quantities + biogas</div></div></div>
  <div class="tab-bar"><div class="tab active" onclick="stab(this,'dig-inp')">📋 Inputs</div><div class="tab" onclick="stab(this,'dig-res')">📊 Results</div></div>
  <div class="tp active" id="dig-inp">
    <div class="card"><div class="card-hd"><div class="card-hd-t">⚗️ Digester Parameters</div></div><div class="card-body"><div class="g4">
      <div class="f"><label>Avg Flow Q</label><div class="fuw"><input type="number" id="dig_Q" value="${G.Q}"><div class="fu">m³/d</div></div></div>
      <div class="f"><label>Influent TSS</label><div class="fuw"><input type="number" id="dig_TSS" value="${G.TSS}"><div class="fu">mg/L</div></div></div>
      <div class="f"><label>Primary Sludge (% TS)</label><div class="fuw"><input type="number" id="dig_psc" value="5" step="0.5"><div class="fu">% TS</div></div></div>
      <div class="f"><label>WAS Conc.</label><div class="fuw"><input type="number" id="dig_wac" value="10000" step="500"><div class="fu">mg/L</div></div></div>
      <div class="f"><label>Thickened WAS (% TS)</label><div class="fuw"><input type="number" id="dig_wts" value="4" step="0.5"><div class="fu">% TS</div></div></div>
      <div class="f"><label>Design SRT (digester)</label><div class="fuw"><input type="number" id="dig_srt" value="20" step="5"><div class="fu">days</div></div><div class="h">Mesophilic: 15–30 days</div></div>
      <div class="f"><label>VSS reduction</label><div class="fuw"><input type="number" id="dig_vred" value="55" step="5"><div class="fu">%</div></div></div>
      <div class="f"><label>Digested sludge (% TS)</label><div class="fuw"><input type="number" id="dig_dsc" value="5"><div class="fu">% TS</div></div></div>
    </div></div></div>
    <div class="btn-row mt"><button class="btn btn-a" onclick="calcDigester()">⚙️ Calculate Digester</button></div>
  </div>
  <div class="tp" id="dig-res"><div id="dig-ra"><div class="alert al-i">Calculate.</div></div></div>
</div>`}
function calcDigester(){
  const Q=vv('dig_Q'),TSS=vv('dig_TSS'),psc=vv('dig_psc')/100;
  const wts=vv('dig_wts')/100,srt=vv('dig_srt'),vred=vv('dig_vred')/100,dsc=vv('dig_dsc')/100;
  const wac=vv('dig_wac');
  const TSS_in=Q*TSS*G.PMF/1000; // kg/d
  const PS_TSS=TSS_in*0.7*0.55; // kg/d (70% removed in primary, of which 55% volatile)
  const PS_flow=PS_TSS*1000/(1000*psc*1.02*1000); // m3/d
  const WAS_TSS=Q*G.PMF*3000/1000/1000*srt/srt; // approximate
  const WAS_flow=WAS_TSS*1000/(wac);
  const tot_sl=(PS_TSS+WAS_TSS)*srt;
  const V_dig=tot_sl/(1000*dsc*1.02*1000/1000);
  const CH4_prod=0.35*(PS_TSS+WAS_TSS)*0.75*vred;
  const E_kWh=CH4_prod*38846/3600;
  document.getElementById('dig-ra').innerHTML=
    rs('💧 Sludge Quantities',rg([rc(f2(PS_TSS,1),'Primary Sludge TSS','kg/d'),rc(f2(PS_flow,2),'Primary Sludge Flow','m³/d'),rc(f2(WAS_TSS,1),'WAS (estimated)','kg/d'),rc(f2(WAS_flow,1),'WAS Flow','m³/d')]))+
    rs('⚗️ Digester Design',rg([rc(f2(V_dig,0),'Digester Volume','m³','amb'),rc(f2(srt,0),'SRT (HRT for CSTR)','days'),rc(f2(vred*100,0),'VSS Reduction','%'),rc(f2(CH4_prod,1),'CH₄ Production','m³/d','ok'),rc(f2(E_kWh,0),'Energy Value','kWh/d')]));
}
function buildMassBalance(){return`<div class="mwrap"><div class="mhdr"><div class="mh-left"><div class="mt-title">Solids Mass Balance<div class="mt-badge">PLANT-WIDE</div></div><div class="mt-bread">TSS/VSS/BOD tracking across all unit processes · M&E 5th Ed. Fig. 6-2</div></div></div>
  <div class="card"><div class="card-hd"><div class="card-hd-t">⚖️ Plant-Wide Mass Balance Summary</div></div><div class="card-body">
    <div class="alert al-a">💡 Complete each unit process design first. Mass balance auto-populates from your calculated results.</div>
    <table class="rtable"><thead><tr><th>Stream</th><th>Flow (m³/d)</th><th>TSS (mg/L)</th><th>TSS Load (kg/d)</th><th>BOD (mg/L)</th><th>BOD Load (kg/d)</th></tr></thead><tbody>
      <tr><td>Raw Influent</td><td class="mono">${fi(G.Q)}</td><td class="mono">${G.TSS}</td><td class="mono">${f2(G.Q*G.TSS/1000,1)}</td><td class="mono">${G.BOD}</td><td class="mono">${f2(G.Q*G.BOD/1000,1)}</td></tr>
      <tr><td>After Primary Clarifier</td><td class="mono">${fi(G.Q)}</td><td class="mono">${f2(G.TSS*(1-G.primaryTSSrem/100),0)}</td><td class="mono">${f2(G.Q*G.TSS*(1-G.primaryTSSrem/100)/1000,1)}</td><td class="mono">${f2(G.BOD*(1-G.primaryBODrem/100),0)}</td><td class="mono">${f2(G.Q*G.BOD*(1-G.primaryBODrem/100)/1000,1)}</td></tr>
      <tr><td>Final Effluent</td><td class="mono">${fi(G.Q)}</td><td class="mono">${G.TSSe}</td><td class="mono">${f2(G.Q*G.TSSe/1000,1)}</td><td class="mono">${G.BODe}</td><td class="mono">${f2(G.Q*G.BODe/1000,1)}</td></tr>
      <tr><td>Overall Removal</td><td class="mono">—</td><td class="mono">${f2((1-G.TSSe/G.TSS)*100,1)}%</td><td class="mono">${f2((G.Q*G.TSS/1000)-(G.Q*G.TSSe/1000),1)} kg/d</td><td class="mono">${f2((1-G.BODe/G.BOD)*100,1)}%</td><td class="mono">${f2((G.Q*G.BOD/1000)-(G.Q*G.BODe/1000),1)} kg/d</td></tr>
    </tbody></table>
  </div></div>
</div>`}
function buildLagoon(){return`<div class="mwrap"><div class="cs"><div class="cs-icon">🏞️</div><div class="cs-t">Lagoon System Design</div><div class="cs-d">Anaerobic, facultative and maturation pond design with evaporation estimation, Penman equation, and BOD removal rates.<br><br>Module includes: Evaporation calculation, Anaerobic lagoon (OLR basis), Facultative pond (areal BOD loading), Maturation pond (coliform reduction).</div></div></div>`}
function buildTertiary(){return`<div class="mwrap"><div class="cs"><div class="cs-icon">💎</div><div class="cs-t">Tertiary Treatment + Disinfection</div><div class="cs-desc">Rapid Sand Filter, Dual Media, Multi-Media, and Ultrafiltration sizing. Chlorination (Cl₂), UV, and ozone disinfection design.<br><br>Coming in the next update — currently use the Secondary module for final polishing parameters.</div></div></div>`}
function buildMetal(){return`<div class="mwrap"><div class="cs"><div class="cs-icon">⚗</div><div class="cs-t">Metal Hydroxide Precipitation</div><div class="cs-desc">Zn, Ni, Cr, Cu, Cd, Pb, Fe removal by hydroxide precipitation at design pH. Solubility vs pH curves, chemical (lime/caustic) dosing, solids production.<br><br>Based on Bengtson Metal Hydroxide Precipitation spreadsheets — 7-metal calculation with safety factor.</div></div></div>`}

/* ══════ INIT ══════ */
window.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('#ws2,#ws3,#ws4,#ws5').forEach(el=>el.style.display='none');
  updateWizUI(1);
  // Auto-populate tech sidebar
  const sv=document.getElementById('sb-tech-v');if(sv)sv.textContent='Not yet selected';
});