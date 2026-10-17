'use strict';
/* ============================================================
   ЛИЛОВЫЕ НЕБЕСА — Деревня Вечного Рассвета: день и ночь,
   Перегонный куб (слитки и эссенции), Доска пропавших (заказы),
   Карусель удачи (казино и игра «Карусель»), Кузница Зари,
   облик окон деревни. Рисунок деревни — 46-lilac-lobby.
   ============================================================ */

/* ---------- день и ночь: сутки 6 минут (4 мин день, сумерки, 1 мин ночь, рассвет) ---------- */
const LIL_DAY=360;
function lilClock(){return (((Date.now()/1000+(G.lilShift||0))%LIL_DAY)+LIL_DAY)%LIL_DAY;}
/* 0 — день, 1 — глубокая ночь; переходы плавные */
function lilNight(){const t=lilClock();if(t<240)return 0;if(t<270)return (t-240)/30;if(t<330)return 1;return 1-(t-330)/30;}
function lilSetNight(on){G.lilShift=(on?295:60)-((Date.now()/1000)%LIL_DAY);}

/* ---------- материалы: слитки и эссенции ---------- */
[[37,'Росяной слиток'],[38,'Пыльцевый слиток'],[39,'Родонитовый слиток'],[40,'Жемчужный слиток'],
 [41,'Хрустальный слиток'],[42,'Берилловый слиток'],[43,'Опалитовый слиток'],[44,'Слиток рассвета'],
 [45,'Цитриновый слиток'],[46,'Топазовый слиток'],[47,'Слиток пчелиного золота'],
 [48,'Фарфоровый слиток'],[49,'Агатовый слиток'],[50,'Латунитовый слиток'],[51,'Слиток стеклянного глаза'],
 [52,'Гранатовый слиток'],[53,'Бутонитовый слиток'],[54,'Слиток розовой крови'],
 [55,'Ртутный слиток'],[56,'Аквамариновый слиток'],[57,'Лунитовый слиток'],
 [58,'Пуховый слиток'],[59,'Сердоликовый слиток'],[60,'Слиток сна'],[61,'Слиток Рассвета']].forEach(([o,n])=>defMat('i'+o,n,'▰',ORES[o].color,'ingot',ORES[o].tier));
const LIL_ESS=[
  ['eDew'   ,'Эссенция росы'      ,'#bfe6ff',10,{i37:2,i38:1},1500000],
  ['eChime' ,'Эссенция звона'     ,'#96d4ff',11,{i41:2,i42:1},3000000],
  ['eHoney' ,'Медовая эссенция'   ,'#ffb030',12,{i45:2,i46:1},5000000],
  ['eToy'   ,'Эссенция игры'      ,'#c466d8',13,{i48:2,i49:1},8000000],
  ['eRose'  ,'Эссенция розы'      ,'#ff6aa2',14,{i52:2,i53:1},12000000],
  ['eMirror','Зеркальная эссенция','#a4ecff',14,{i55:2,i56:1},16000000],
  ['eSleep' ,'Эссенция сна'       ,'#dcccff',15,{i58:2,i59:1},24000000]
];
for(const [id,n,col,tier] of LIL_ESS)defMat(id,n,'💧',col,'ess',tier);
if(!MAT_KINDS.some(k=>k[0]==='ess'))MAT_KINDS.splice(1,0,['ess','💧 Эссенции']);
/* рецепты Перегонного куба лежат в общем SMELT (у них свои вкладки lingot/less) */
for(let o=37;o<=61;o++){const O=ORES[o];SMELT.push({id:'s'+o,out:'i'+o,n:1,o:{[o]:3},c:Math.round(O.price*0.3/500)*500,time:2+O.tier*0.4,tab:'lingot',tier:O.tier});}
for(const [id,n,col,tier,m,c] of LIL_ESS)SMELT.push({id:'s'+id,out:id,n:1,m:m,c:c,time:8+(tier-10)*1.6,tab:'less',tier:tier});
for(const r of SMELT)SMELT_BY[r.id]=r;

/* ---------- Перегонный куб: своя очередь (player.lfurn), работает и пока ты в шахте ---------- */
const LSTILL_UPG=[
  {c:2000000 ,m:{i37:6}},
  {c:8000000 ,m:{i45:6,eDew:1}},
  {c:30000000,m:{i52:6,eHoney:2}}
];
function lstill(){if(!player.lfurn||!Array.isArray(player.lfurn.q))player.lfurn={q:[],lvl:0,ts:Date.now()};return player.lfurn;}
function lstillQueue(rid,n){
  const r=SMELT_BY[rid];if(!r||n<=0)return false;
  const F=lstill();if(F.q.length>=8){UI.toast('Очередь куба полна (8)');return false;}
  const tot={c:(r.c||0)*n,o:{},m:{}};
  for(const k in (r.o||{}))tot.o[k]=r.o[k]*n;for(const k in (r.m||{}))tot.m[k]=r.m[k]*n;
  if(!pay(tot))return false;
  F.q.push({r:rid,n:n,t:0});return true;
}
function lstillCancel(i){
  const F=lstill(),j=F.q[i];if(!j)return;const r=SMELT_BY[j.r];
  player.money+=(r.c||0)*j.n;for(const k in (r.o||{}))player.inv[k]=(player.inv[k]||0)+r.o[k]*j.n;for(const k in (r.m||{}))addMat(k,r.m[k]*j.n);
  F.q.splice(i,1);
}
function updateStill(dt,silent){
  const F=lstill();if(!F.q.length)return;
  const lines=FURN_LINES[F.lvl|0],sp=FURN_SPEED[F.lvl|0];
  const made={};
  for(let i=0;i<Math.min(lines,F.q.length);i++){
    const j=F.q[i],r=SMELT_BY[j.r];if(!r){F.q.splice(i,1);i--;continue;}
    j.t+=dt*sp;
    while(j.t>=r.time&&j.n>0){j.t-=r.time;j.n--;addMat(r.out,r.n);made[r.out]=(made[r.out]||0)+r.n;}
    if(j.n<=0){F.q.splice(i,1);i--;}
  }
  if(!silent)for(const k in made){if(G.scene==='lobby'&&!UI.modal&&G.time-(F.msgT||0)>2){F.msgT=G.time;UI.toast('⚗ Куб: '+MATS[k].n+' +'+made[k]);}}
  if(UI.modal==='lstill'&&Object.keys(made).length)UI._stillDirty=true;
}
UI.lstill=function(tab){
  tab=tab||UI._lsTab||'lingot';UI._lsTab=tab;
  const F=lstill(),lines=FURN_LINES[F.lvl|0],sp=FURN_SPEED[F.lvl|0];
  const tierOK=r=>r.tier<=Math.max(10,player.pickLvl);
  const list=SMELT.filter(r=>r.tab===tab);
  const maxN=r=>{let n=99;const c=r.c||0;if(c>0&&!cheats.infMoney)n=Math.min(n,Math.floor(player.money/c));
    for(const k in (r.o||{}))n=Math.min(n,Math.floor((player.inv[k]||0)/r.o[k]));for(const k in (r.m||{}))n=Math.min(n,Math.floor(matN(k)/r.m[k]));return Math.max(0,n);};
  const row=r=>{const M=MATS[r.out],mx=maxN(r),lock=!tierOK(r);
    return `<div class="item" style="flex-wrap:wrap;${lock?'opacity:.5':''}">
      <div class="ico" style="background:${M.col};display:flex;align-items:center;justify-content:center;font-size:14px">${M.kind==='ingot'?'':M.ic}</div>
      <div class="txt"><div class="nm">${M.n} <span class="tiny">· есть ${matN(r.out)}</span></div>
      <div class="ds">${(r.time/sp).toFixed(1)} с/шт${lock?' · <b style="color:#ff9ac0">нужна '+pickName(r.tier)+'</b>':''}</div>
      <div class="cost" data-fc="${r.id}">${costChips(r,mx>=1?qtyVal('l'+r.id,mx):1)}</div></div>
      ${mx>=1&&!lock?`<div class="qline"><div class="qwrap">${qtyHtml('l'+r.id,mx)}<div class="qsum">в куб <b data-qs="l${r.id}">1</b> шт · ≈<b data-qt="l${r.id}">0</b> с</div></div>
        <button class="btn small" data-qf="${r.id}">⚗ Перегнать</button></div>`:`<button class="btn small" disabled>${lock?'Закрыто':'Не хватает'}</button>`}
    </div>`;};
  const qHtml=F.q.length?F.q.map((j,i)=>{const r=SMELT_BY[j.r],M=MATS[r.out],act=i<lines;
    return `<div class="item" style="padding:6px 8px"><div class="txt"><div class="nm" style="font-size:13px">${M.ic} ${M.n} ×${j.n}</div>
      <div style="height:5px;border-radius:3px;background:rgba(255,255,255,.08);margin-top:4px;overflow:hidden"><div data-qbar="${i}" style="height:100%;width:${act?Math.round(100*j.t/r.time):0}%;background:${act?'#c88aff':'#555'}"></div></div>
      <div class="tiny">${act?'перегоняется':'ждёт'} · осталось ~${Math.ceil((j.n*r.time-j.t)/sp)} с</div></div>
      <button class="btn small alt" data-cancel="${i}" style="padding:6px 9px">✕</button></div>`;}).join(''):'<p class="tiny" style="padding:4px 2px">Очередь пуста. Куб работает и пока ты в шахте.</p>';
  const U=LSTILL_UPG[F.lvl|0];
  const upHtml=U?`<div class="item" style="flex-wrap:wrap"><div class="txt"><div class="nm">Улучшить куб · ур. ${(F.lvl|0)+1}</div>
      <div class="ds">скорость ×${FURN_SPEED[F.lvl|0]} → ×${FURN_SPEED[(F.lvl|0)+1]}, змеевиков ${lines} → ${FURN_LINES[(F.lvl|0)+1]}</div><div class="cost">${costChips(U)}</div></div>
      <button class="btn small" id="lsUp" ${canPay(U)?'':'disabled'}>Улучшить</button></div>`:'<p class="tiny">Куб улучшен до предела.</p>';
  const mats=Object.keys(player.mats||{}).filter(k=>matN(k)>0&&MATS[k]&&(MATS[k].kind==='ess'||(MATS[k].kind==='ingot'&&MATS[k].tier>=10&&+k.slice(1)>=37)));
  const matsHtml=mats.length?mats.map(k=>`<span style="border-left:3px solid ${MATS[k].col}">${MATS[k].kind==='ingot'?'▰':MATS[k].ic} ${MATS[k].n} <b>${matN(k)}</b></span>`).join(''):'<span>пусто</span>';
  const d=this.build('lstill',`
    <div class="card lilac" style="max-width:580px;width:96vw">
      <h3>⚗ Перегонный куб</h3>
      <div class="bal"><span>Змеевиков: ${lines} · скорость ×${sp}</span><b style="color:#ffd98a">${fmt(player.money)} 💰</b></div>
      <div class="sect" style="margin-top:4px">Очередь (${F.q.length}/8)</div>${qHtml}
      <div class="tabs" style="margin-top:8px">
        <button data-tab="lingot" class="${tab==='lingot'?'on':''}">▰ Слитки</button>
        <button data-tab="less" class="${tab==='less'?'on':''}">💧 Эссенции</button>
        <button data-tab="bag" class="${tab==='bag'?'on':''}">📦 Склад</button></div>
      ${tab==='bag'?`<div class="cost" style="gap:6px">${matsHtml}</div><div class="sect">Куб</div>${upHtml}
        <p class="tiny" style="margin-top:8px">Слитки перегоняются из 3 руды. Эссенции — из слитков одного биома; они понадобятся мастерам Кузницы Зари. Слитки и эссенции покупают на Цветочной ярмарке.</p>`
        :list.map(row).join('')}
    </div>
    <button class="btn alt" id="lsBack">Выйти</button>`);
  d.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{SFX.ui();UI.lstill(b.getAttribute('data-tab'));});
  wireQty(d,(key,v)=>{const id=key.slice(1),r=SMELT_BY[id];if(!r)return;const a=d.querySelector(`[data-qs="${key}"]`),t=d.querySelector(`[data-qt="${key}"]`),c=d.querySelector(`[data-fc="${id}"]`);
    if(a)a.textContent=v;if(t)t.textContent=Math.ceil(v*r.time/sp);if(c)c.innerHTML=costChips(r,v);});
  d.querySelectorAll('[data-qf]').forEach(b=>b.onclick=()=>{const id=b.getAttribute('data-qf'),r=SMELT_BY[id],mx=maxN(r),n=Math.min(mx,qtyVal('l'+id,mx));
    if(n>0&&lstillQueue(id,n)){SFX.buy();vib(15);UI.toast('⚗ В куб: '+MATS[r.out].n+' ×'+n);if(UI._qty)delete UI._qty['l'+id];saveGame();UI.lstill();}else{UI.toast('Не хватает');SFX.uiBack();}});
  d.querySelectorAll('[data-cancel]').forEach(b=>b.onclick=()=>{lstillCancel(+b.getAttribute('data-cancel'));SFX.uiBack();saveGame();UI.lstill();});
  if(d.querySelector('#lsUp'))d.querySelector('#lsUp').onclick=()=>{const U2=LSTILL_UPG[lstill().lvl|0];if(!U2||!pay(U2)){SFX.uiBack();return;}lstill().lvl++;SFX.buy();vib(30);UI.toast('⚗ Куб улучшен');saveGame();UI.lstill('bag');};
  d.querySelector('#lsBack').onclick=()=>{SFX.uiBack();clearInterval(UI._lsTimer);UI.close();};
  clearInterval(UI._lsTimer);
  UI._lsTimer=setInterval(()=>{
    if(UI.modal!=='lstill'){clearInterval(UI._lsTimer);return;}
    if(UI._stillDirty&&!UI._qDrag){UI._stillDirty=false;UI.lstill();return;}
    const F2=lstill();d.querySelectorAll('[data-qbar]').forEach(el=>{const j=F2.q[+el.getAttribute('data-qbar')];if(j&&+el.getAttribute('data-qbar')<FURN_LINES[F2.lvl|0])el.style.width=Math.round(100*j.t/SMELT_BY[j.r].time)+'%';});
  },250);
};

/* ---------- Доска пропавших: заказы жителей ---------- */
const LIL_FOLK=[['Лиза Пряникова','её'],['Тимоша Зефиров','его'],['Агата Лунная','её'],['Сеня Медок','его'],['Вера Пуговкина','её'],
  ['Миша Карамелькин','его'],['Нюта Сонина','её'],['Рома Колокольчиков','его'],['Поля Розова','её'],['Гриша Ватрушкин','его'],['Даша Ленточкина','её'],['Федя Леденцов','его']];
function lilFem(c){const f=LIL_FOLK.find(q=>q[0]===c.who);return !!f&&f[1]==='её';}
function lilBiomeOf(d){return BIOMES[10+(d<250?0:d<550?1:d<850?2:d<1150?3:d<1450?4:d<1750?5:6)].n;}
function makeLContract(){
  const deep=Math.max(player.prog.lilacDepth||0,40),r=Math.random(),f=LIL_FOLK[Math.floor(Math.random()*LIL_FOLK.length)];
  const pool=ORES.filter(o=>o&&o.dim===2&&o.tier<=Math.max(10,player.pickLvl)&&o.dmin<=deep+80);
  const o=pool[Math.floor(Math.random()*pool.length)]||ORES[37];
  const face=Math.floor(Math.random()*1e6),where=lilBiomeOf(Math.min(2100,deep+Math.random()*200));
  if(r<0.5){const n=8+Math.floor(Math.random()*14);
    return {type:'ore',target:o.id,need:n,have:0,who:f[0],face,where,title:'Добыть: '+o.name+' ×'+n,ask:'Родные просят руду, что '+f[1]+' успокаивала',rc:Math.round(orePrice(o.id)*n*0.7/1000)*1000,rs:6+Math.floor(n/2)};}
  if(r<0.8){const n=3+Math.floor(Math.random()*6),id='i'+o.id;
    return {type:'give',target:id,need:n,have:0,who:f[0],face,where,title:'Принести: '+MATS[id].n+' ×'+n,ask:'Из слитков отольют колокольчик, чтобы '+f[1]+' позвать',rc:Math.round(matValue(id)*n*1.6/1000)*1000,rs:8+n*2};}
  const marks=[250,550,850,1150,1450,1750,2100];const tgt=marks.find(m=>m>deep)||2190;
  return {type:'depth',target:0,need:tgt,have:Math.floor(player.prog.lilacDepth||0),who:f[0],face,where:lilBiomeOf(tgt-1),title:'Спуститься до '+tgt+' м',ask:'Кто-то должен заглянуть туда, куда '+f[1]+' звали голоса',rc:Math.round(tgt*1400/1000)*1000,rs:Math.round(tgt/10)};
}
function ensureLContracts(){
  if(!player.lcontracts||!Array.isArray(player.lcontracts.list))player.lcontracts={list:[],done:0};
  while(player.lcontracts.list.length<3)player.lcontracts.list.push(makeLContract());
}
function lcontractEvent(type,id,n){
  if(G.dim!==2||!player.lcontracts)return;
  for(const c of player.lcontracts.list){
    if(c.type!==type||c.ready)continue;
    if(type==='depth')c.have=Math.max(c.have,Math.floor(n));else if(c.target===id)c.have+=n;
    if(c.have>=c.need){c.have=c.need;c.ready=true;UI.toast('📜 Заказ выполнен: '+c.title+' — награда на Доске пропавших');SFX.coin();}
  }
}
/* лицо на плакате: простой портрет из хеша (ночью — без глаз) */
function lilFaceSvg(seed,night){
  const h=(k)=>((seed*2654435761+k*40503)>>>0)%1000/1000;
  const skin=['#f2d2b8','#e8c0a0','#f6dcc8'][Math.floor(h(1)*3)],hair=['#6a3a1a','#e8c060','#2a1a10','#c86a3a','#d8a0c0'][Math.floor(h(2)*5)];
  const eyes=night?`<path d="M18 27 l6 2 M30 29 l6 -2" stroke="#3a0a0a" stroke-width="2"/>`:`<circle cx="21" cy="28" r="1.8" fill="#2a1a10"/><circle cx="33" cy="28" r="1.8" fill="#2a1a10"/>`;
  const mouth=night?`<path d="M18 38 q9 7 18 0" stroke="#3a0a0a" stroke-width="1.6" fill="none"/>`:`<path d="M22 37 q5 3 10 0" stroke="#7a3a2a" stroke-width="1.4" fill="none"/>`;
  return `<svg viewBox="0 0 54 62" width="48" height="56"><rect width="54" height="62" fill="#cbb690"/><ellipse cx="27" cy="58" rx="20" ry="10" fill="#8a6a8a"/>
    <ellipse cx="27" cy="30" rx="13" ry="15" fill="${skin}"/><path d="M13 28 q2 -17 14 -17 q12 0 14 17 q-3 -9 -14 -10 q-11 1 -14 10z" fill="${hair}"/>${eyes}${mouth}
    ${h(3)<0.5?`<circle cx="18" cy="33" r="2.4" fill="#ff9ab0" opacity=".45"/><circle cx="36" cy="33" r="2.4" fill="#ff9ab0" opacity=".45"/>`:''}</svg>`;
}
UI.lboard=function(){
  ensureLContracts();
  const L=player.lcontracts.list,night=lilNight()>0.5;
  for(const c of L)if(c.type==='give'){c.have=Math.min(c.need,matN(c.target));c.ready=c.have>=c.need;}
  const d=this.build('lboard',`
    <div class="card lilac" style="max-width:520px;width:96vw">
      <h3>📜 Доска пропавших</h3>
      <p class="tiny" style="margin-bottom:4px">${night?'Ночью кажется, что лица на плакатах смотрят прямо на тебя.':'Жители деревни ищут своих. Помоги им — они щедро платят.'} Выполнено: ${player.lcontracts.done}</p>
      ${L.map((c,i)=>`<div class="poster${night?' night':''}" style="--rot:${(((c.face%7)-3)*0.6).toFixed(1)}deg"><div class="pin"></div>
        <div class="face">${lilFaceSvg(c.face,night)}</div>
        <div class="ttl">${lilFem(c)?(night?'ОНА НЕ ПРОПАЛА. ОНА СПИТ':'ПРОПАЛА'):(night?'ОН НЕ ПРОПАЛ. ОН СПИТ':'ПРОПАЛ')}</div>
        <div class="nm">${c.who}</div>
        <div class="ds">В последний раз видели: ${c.where}. ${c.ask}.</div>
        <div class="ds" style="margin-top:3px"><b>${c.type==='ore'?'⛏':c.type==='give'?'▰':'⬇️'} ${c.title}</b> · ${Math.min(c.have,c.need)} / ${c.need}</div>
        <div style="height:5px;border-radius:3px;background:rgba(60,30,10,.18);margin:4px 0;overflow:hidden"><div style="height:100%;width:${Math.round(100*Math.min(1,c.have/c.need))}%;background:${c.ready?'#3a9a5a':'#b0306a'}"></div></div>
        <div class="row" style="justify-content:space-between;align-items:center;gap:6px"><span class="ds">Награда: <b>${fmt(c.rc)} 💰</b> + <b>${c.rs} 👻</b></span>
        ${c.ready?`<button class="btn small" data-claim="${i}">Отдать</button>`:`<button class="btn small alt" data-swap="${i}" ${(player.souls||0)>=5?'':'disabled'}>↻ 5 👻</button>`}</div>
      </div>`).join('')}
    </div>
    <button class="btn" id="lbBook">📖 Книга деревни</button>
    <button class="btn alt" id="lbBack">Выйти</button>`);
  d.querySelectorAll('[data-claim]').forEach(b=>b.onclick=()=>{
    const i=+b.getAttribute('data-claim'),c=L[i];if(!c||!c.ready)return;
    if(c.type==='give'){if(matN(c.target)<c.need){UI.toast('Не хватает слитков');return;}player.mats[c.target]-=c.need;if(player.mats[c.target]<=0)delete player.mats[c.target];}
    player.money+=c.rc;player.souls=(player.souls||0)+c.rs;player.lcontracts.done++;
    L.splice(i,1);ensureLContracts();SFX.coin();SFX.buy();vib(30);UI.toast('Спасибо! +'+fmt(c.rc)+' 💰, +'+c.rs+' 👻');saveGame();UI.lboard();
  });
  d.querySelectorAll('[data-swap]').forEach(b=>b.onclick=()=>{const i=+b.getAttribute('data-swap');if((player.souls||0)<5)return;player.souls-=5;L[i]=makeLContract();SFX.ui();saveGame();UI.lboard();});
  d.querySelector('#lbBack').onclick=()=>{SFX.uiBack();UI.close();};
  d.querySelector('#lbBook').onclick=()=>{SFX.ui();UI.lbook();};
};

/* ---------- Карусель удачи: рулетка, блэкджек, кости и «Карусель» ---------- */
const CAR_HORSES=[['Розочка','#ffb0cc','#d0507a'],['Ласточка','#a8d8ff','#3a6ab0'],['Зефир','#fff4f0','#d8a0c0'],['Лакрица','#4a2a3a','#c88a5a'],['Пуговка','#ffe08a','#c87a30'],['Сонька','#c8b0f0','#6a4aa0']];
function cgCarousel(body,st,rerender){
  const C=CG.car||(CG.car={pick:0,rot:0,spin:false,res:null,win:-1});
  body.innerHTML=`<div style="text-align:center"><canvas id="carC" width="460" height="400" style="width:min(300px,80vw);height:auto;display:block;margin:2px auto"></canvas>
    <div class="tiny" style="min-height:16px;color:#ffd0f0">${C.res||'Выбери лошадку: та, что остановится под золотым кольцом, выигрывает ×4.6, соседки — ×0.5'}</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-top:8px">${CAR_HORSES.map((h2,i)=>`<button class="btn small ${C.pick===i?'':'alt'}" data-hp="${i}" style="padding:7px 4px"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${h2[1]};border:1px solid ${h2[2]};margin-right:4px"></span>${h2[0]}</button>`).join('')}</div>
    <button class="btn" id="carSpin" style="margin-top:10px;width:100%" ${C.spin||!cgCanBet(st)?'disabled':''}>🎠 Запустить (${cgStakeLabel(st)})</button></div>`;
  const cv=body.querySelector('#carC'),g=cv.getContext('2d');
  const draw=(rot,t)=>{const night=lilNight()>0.5;drawCarousel(g,rot,t,night,C.spin?-1:C.win);};
  let alive=true;const idle=()=>{if(!alive||!document.body.contains(cv)){alive=false;return;}if(!C.spin)draw(C.rot,performance.now()/1000);requestAnimationFrame(idle);};idle();
  body.querySelectorAll('[data-hp]').forEach(b=>b.onclick=()=>{if(C.spin)return;C.pick=+b.getAttribute('data-hp');C.res=null;SFX.ui();rerender();});
  body.querySelector('#carSpin').onclick=()=>{
    if(C.spin||!cgCanBet(st))return;st.take(st.amount);C.spin=true;C.res=null;C.win=-1;
    const n=CAR_HORSES.length,idx=Math.floor(Math.random()*n),da=TAU/n;
    const r0=C.rot;let r1=Math.PI/2-idx*da;while(r1<r0+TAU*3)r1+=TAU;
    const T0=performance.now(),D=4800;let lastTick=0;
    const step=()=>{const k=Math.min(1,(performance.now()-T0)/D),e=1-Math.pow(1-k,3),rot=r0+(r1-r0)*e;
      const tick=Math.floor(rot/(da/2));if(tick!==lastTick){lastTick=tick;if(AU.ok&&AU.ok()&&k<0.97)AU.bell(1568*[1,1.122,1.26,1.5][tick&3],0.25,0.03,0,{ratio:2,index:0.6});}
      if(document.body.contains(cv))drawCarousel(g,rot,performance.now()/1000,lilNight()>0.5,-1);
      if(k<1)requestAnimationFrame(step);else{C.rot=rot%TAU;C.spin=false;C.win=idx;
        const dd=Math.min((idx-C.pick+n)%n,(C.pick-idx+n)%n);const m=dd===0?4.6:dd===1?0.5:0;
        C.res=cgFinish(st,m,'Под кольцом — '+CAR_HORSES[idx][0]+(dd===0?'! Твоя лошадка':''));rerender();}};
    requestAnimationFrame(step);const b2=body.querySelector('#carSpin');if(b2)b2.disabled=true;
  };
}
/* рисунок карусели (вид сбоку): купол в полоску с огоньками, латунные шесты, лошадки качаются */
function drawCarousel(g,rot,t,night,win){
  const W=460,H=400,cx=230;g.clearRect(0,0,W,H);
  const bg=g.createRadialGradient(cx,200,30,cx,200,260);bg.addColorStop(0,night?'#2a1020':'#4a2a4a');bg.addColorStop(1,night?'#0a0408':'#1a0e1c');g.fillStyle=bg;g.fillRect(0,0,W,H);
  const n=CAR_HORSES.length,da=TAU/n,PY=300,RX=170,RY=34;
  /* платформа */
  g.fillStyle='#3a2030';g.beginPath();g.ellipse(cx,PY+16,RX+18,RY+10,0,0,TAU);g.fill();
  g.fillStyle=night?'#4a3a3a':'#c8a0b8';g.beginPath();g.ellipse(cx,PY,RX+16,RY+8,0,0,TAU);g.fill();
  g.fillStyle=night?'#2a2024':'#a07890';g.fillRect(cx-RX-16,PY,2*(RX+16),16);g.beginPath();g.ellipse(cx,PY+16,RX+16,RY+8,0,0,Math.PI);g.fill();
  for(let k=0;k<18;k++){const a=k/18*Math.PI,x=cx-Math.cos(a)*(RX+16);g.fillStyle=k%2?'#e8c070':'#b08040';g.fillRect(x-2,PY+2+Math.sin(a)*(RY+8),4,10);}
  /* лошадки: сначала дальние */
  const hs=[];for(let i=0;i<n;i++){const a=rot+i*da;hs.push({i,a,s:Math.sin(a)});}
  hs.sort((p,q)=>p.s-q.s);
  const top=110;
  for(const q of hs){const x=cx+Math.cos(q.a)*RX,yb=PY-6+q.s*RY,sc=0.72+0.28*(q.s+1)/2,bob=Math.sin(t*3+q.i*1.7+rot*2)*8*sc;
    const shade=0.55+0.45*(q.s+1)/2;
    g.strokeStyle=shadeHex('#e8c070',-0.5*(1-shade));g.lineWidth=4*sc;g.beginPath();g.moveTo(x,top+20+q.s*6);g.lineTo(x,yb);g.stroke();
    g.strokeStyle='rgba(255,250,220,.6)';g.lineWidth=1.2*sc;g.beginPath();g.moveTo(x-1.2*sc,top+20+q.s*6);g.lineTo(x-1.2*sc,yb);g.stroke();
    const dir=Math.cos(q.a+Math.PI/2)>0?1:-1;
    drawCarHorse(g,x,yb-46*sc+bob,sc,CAR_HORSES[q.i],dir,night,shade,win===q.i);}
  /* купол */
  const cg2=g.createLinearGradient(0,30,0,top+20);cg2.addColorStop(0,'#ffd8f0');cg2.addColorStop(1,'#b05a90');
  for(let k=0;k<12;k++){const a0=k/12,a1=(k+1)/12;g.fillStyle=k%2?(night?'#3a1a2a':'#fff0f6'):(night?'#5a0a1a':'#e05a9a');
    g.beginPath();g.moveTo(cx,26);g.lineTo(cx-RX-24+a0*(2*RX+48),top+12);g.lineTo(cx-RX-24+a1*(2*RX+48),top+12);g.closePath();g.fill();}
  g.fillStyle='rgba(255,255,255,.18)';g.beginPath();g.moveTo(cx,26);g.lineTo(cx-RX-24,top+12);g.lineTo(cx-RX*0.4,top+12);g.closePath();g.fill();
  for(let k=0;k<14;k++){const x=cx-RX-24+(k+0.5)/14*(2*RX+48);g.fillStyle=night?'#4a1020':'#ffe0f0';g.beginPath();g.arc(x,top+14,(2*RX+48)/28,0,Math.PI);g.fill();
    const on=night?((k+Math.floor(t*2))%5===0):((k+Math.floor(t*4))%3!==0);g.fillStyle=on?(night?'#ff3a3a':'#fff6b0'):'#6a5040';g.beginPath();g.arc(x,top+16,3.4,0,TAU);g.fill();
    if(on){g.save();g.globalCompositeOperation='lighter';g.fillStyle=night?'rgba(255,40,40,.25)':'rgba(255,240,170,.3)';g.beginPath();g.arc(x,top+16,9,0,TAU);g.fill();g.restore();}}
  g.fillStyle='#e8c070';g.beginPath();g.arc(cx,24,7,0,TAU);g.fill();g.fillStyle='#fff4c0';g.fillRect(cx-1.5,8,3,14);
  /* золотое кольцо над передней лошадкой */
  const ry=top+40+Math.sin(t*2)*3;g.strokeStyle='#ffd040';g.lineWidth=5;g.beginPath();g.arc(cx,ry,13,0,TAU);g.stroke();
  g.strokeStyle='rgba(255,255,220,.8)';g.lineWidth=1.5;g.beginPath();g.arc(cx,ry,13,Math.PI*1.1,Math.PI*1.6);g.stroke();
  g.strokeStyle='#8a6a30';g.lineWidth=1;g.beginPath();g.moveTo(cx,top+20);g.lineTo(cx,ry-13);g.stroke();
}
function drawCarHorse(g,x,y,sc,H,dir,night,shade,lit){
  const body=night?'#9a9090':H[1],mane=night?'#3a3030':H[2],dark=shadeHex(body,-0.35),light=shadeHex(body,0.25);
  g.save();g.translate(x,y);g.scale(sc*dir,sc);
  g.globalAlpha=1;
  if(lit){g.save();g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,230,140,.35)';g.beginPath();g.arc(0,0,48,0,TAU);g.fill();g.restore();}
  /* дальние ноги */
  g.strokeStyle=shadeHex(dark,-0.2);g.lineWidth=5;g.lineCap='round';g.beginPath();g.moveTo(-16,8);g.lineTo(-28,26);g.moveTo(16,8);g.lineTo(26,22);g.stroke();
  /* хвост */
  g.fillStyle=mane;g.beginPath();g.moveTo(-26,-4);g.quadraticCurveTo(-44,0,-40,22);g.quadraticCurveTo(-34,8,-24,2);g.closePath();g.fill();
  /* тело: три тона */
  g.fillStyle=dark;g.beginPath();g.ellipse(0,2,28,14,0,0,TAU);g.fill();
  g.fillStyle=body;g.beginPath();g.ellipse(-1,0,27,12.5,0,0,TAU);g.fill();
  g.fillStyle=light;g.beginPath();g.ellipse(-4,-6,18,5,-0.1,0,TAU);g.fill();
  /* шея и голова */
  g.fillStyle=body;g.beginPath();g.moveTo(14,-6);g.quadraticCurveTo(22,-26,30,-30);g.lineTo(40,-24);g.quadraticCurveTo(44,-18,40,-14);g.lineTo(30,-14);g.quadraticCurveTo(26,-4,20,4);g.closePath();g.fill();
  g.fillStyle=dark;g.beginPath();g.moveTo(40,-14);g.quadraticCurveTo(44,-18,40,-24);g.lineTo(42,-16);g.closePath();g.fill();
  g.fillStyle=mane;g.beginPath();g.moveTo(12,-8);g.quadraticCurveTo(18,-30,30,-32);g.quadraticCurveTo(22,-22,22,-8);g.closePath();g.fill();
  g.fillStyle=light;g.beginPath();g.ellipse(28,-27,4,2,-0.5,0,TAU);g.fill();
  /* глаз: днём добрый, ночью — красный огонёк */
  if(night){g.fillStyle='#ff2a2a';g.beginPath();g.arc(33,-23,2.2,0,TAU);g.fill();g.save();g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,40,40,.4)';g.beginPath();g.arc(33,-23,6,0,TAU);g.fill();g.restore();}
  else{g.fillStyle='#2a1a20';g.beginPath();g.arc(33,-23,1.8,0,TAU);g.fill();g.fillStyle='#fff';g.fillRect(32.6,-24.2,0.9,0.9);}
  /* седло и попона */
  g.fillStyle=night?'#4a1a24':'#d84a7a';g.beginPath();g.ellipse(-2,-10,11,5,0,Math.PI,0);g.fill();g.fillRect(-12,-10,22,10);
  g.fillStyle='#e8c070';g.fillRect(-12,-1,22,2);for(let k=0;k<4;k++){g.beginPath();g.arc(-9+k*6,1.5,1.6,0,TAU);g.fill();}
  /* ближние ноги */
  g.strokeStyle=body;g.lineWidth=5.5;g.beginPath();g.moveTo(-12,8);g.lineTo(-20,24);g.lineTo(-16,30);g.moveTo(14,8);g.lineTo(22,20);g.lineTo(30,18);g.stroke();
  g.strokeStyle=dark;g.lineWidth=2;g.beginPath();g.moveTo(-17,29);g.lineTo(-13,31);g.moveTo(29,17);g.lineTo(32,19);g.stroke();
  /* ночью — проступающие рёбра */
  if(night){g.strokeStyle='rgba(40,20,20,.55)';g.lineWidth=1.2;for(let k=0;k<4;k++){g.beginPath();g.arc(-4+k*6,4,7,Math.PI*0.2,Math.PI*0.8);g.stroke();}}
  g.restore();
}
UI.lcasino=function(game){
  game=game||UI._lcGame||'carousel';UI._lcGame=game;
  const GAMESL=[['carousel','🎠 Карусель'],['roulette','🎡 Рулетка'],['bj','🃏 Блэкджек'],['hilo','🎲 Кости']];
  const pk=cgStakePicker({key:'litem',ores:true,mats:true});
  const busy=()=>CG.rl.spin||CG.hl.rolling||(CG.car&&CG.car.spin)||(CG.bj&&!CG.bj.done);
  const night=lilNight()>0.5;
  const d=this.build('lcasino',`
    <div class="card lilac" style="max-width:520px;width:96vw">
      <h3 style="text-align:center">🎠 Карусель удачи</h3>
      <div class="bal"><span>${night?'Музыка играет, хотя шарманщика не видно.':'Ставки — рудой или слитками.'}</span><b style="color:#ffd98a">${fmt(player.money)} 💰</b></div>
      <div class="tabs">${GAMESL.map(g2=>`<button data-g="${g2[0]}" class="${game===g2[0]?'on':''}">${g2[1]}</button>`).join('')}</div>
      <div id="lcBody"></div>
      ${pk.html}
    </div>
    <button class="btn alt" id="lcBack">Выйти</button>`);
  const rer=(keepAnim)=>{if(keepAnim)return;if(UI.modal==='lcasino')UI.lcasino(game);};
  d.querySelectorAll('[data-g]').forEach(b2=>b2.onclick=()=>{if(busy())return;SFX.ui();UI.lcasino(b2.getAttribute('data-g'));});
  d.querySelector('#lcBack').onclick=()=>{if(busy())return;SFX.uiBack();UI.close();};
  if(pk.bind)pk.bind(d,()=>{if(!busy())UI.lcasino(game);});
  const body=d.querySelector('#lcBody');
  if(!pk.st){body.innerHTML='';return;}
  if(game==='carousel')cgCarousel(body,pk.st,rer);
  else if(game==='roulette')cgRoulette(body,pk.st,rer);
  else if(game==='bj')cgBlackjack(body,pk.st,rer);
  else cgHiLo(body,pk.st,rer);
};

/* ---------- Кузница Зари: пока — прокачки и предметы Кузницы Ада в облике Зари ---------- */
UI.lforge=function(tab){UI.hforge(tab||(UI._hgTab==='gear'||!UI._hgTab?'upg':UI._hgTab));};
/* облик окон в деревне: те же окна, но в лиловых тонах и со своими названиями */
const LIL_SKIN={
  hforge:(h)=>h.replace(/class="card hell/g,'class="card lilac').replace('⚒ Кузница Ада','☀ Кузница Зари')
    .replace(/из сплавов и компонентов Печи/g,'из сплавов и компонентов').replace('</h3>','</h3><p class="tiny" style="margin-bottom:8px;color:#e0c0ff">Мастера Зари ещё куют снаряжение XI–XV для Лиловых небес. Пока здесь можно прокачаться и сделать предметы.</p>'),
  market:(h)=>h.replace(/class="card hell/g,'class="card lilac').replace('👻 Рынок душ','🌸 Цветочная ярмарка').replace(/Скупщики Ада/g,'Торговцы ярмарки').replace(/переплавь руду в Печи/g,'перегони руду в Перегонном кубе').replace(/переплавлять руду в Печи/g,'перегонять руду в Перегонном кубе')
};
function lilacSkinHtml(cls,html){const f=LIL_SKIN[cls];return f?f(html):html;}
