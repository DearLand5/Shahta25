'use strict';
/* ============================================================
   КУЗНИЦА ЗАРИ: ПРОКАЧКИ И ЛАВКА (своя прогрессия Лиловых небес)
   Продолжает прокачки Ада выше их предела: скорость копания 21–30, бур 11–15 (тоннель шире),
   баррикады 8–10, слоты рюкзака до 40, стопка до 24, Фонарь Зари 9–12; новые прокачки
   (player.prog.lfu): Эфирная чаша, Привычка к Истине, Долгий сон.
   Лавка: припасы и расходники за материалы Лиловых небес, новые — Сонная бомба и Камертон.
   Окно — вкладки «Прокачки» и «Лавка» в UI.lforge (58-lilac-gear).
   ============================================================ */

/* продолжения таблиц Земли и Ада */
DRILL_POWER.push(60000,95000,150000,230000,350000);
DRILL_RADIUS.push(3,3,3,3,3);
BARR.push({name:'Хрустальная',hp:32000,col:'#bfe6ff'},{name:'Медовая',hp:60000,col:'#f0a820'},{name:'Фарфоровая',hp:110000,col:'#f0e8f0'});

function lfuP(){const p=player.prog;if(!p.lfu||typeof p.lfu!=='object')p.lfu={};return p.lfu;}
function lfuLv(id){return (player.prog&&player.prog.lfu&&player.prog.lfu[id])|0;}
/* Эфир, урон в Истине, длина сна — их читают способности, мобы и Колодец снов */
function abEthMax(){return AB_ETHER+20*lfuLv('eth');}
function lfuTruthMul(){return 1-0.05*lfuLv('truth');}
function lilDreamT(){return DREAM_T+15*lfuLv('dream');}

const LI=(i)=>'i'+i;
const LFU=[
  {id:'dig',ic:'⚡',n:'Скорость копания Зари',min:DIG_SPEED_HMAX,max:DIG_SPEED_LMAX,cur:()=>player.digSpeedLvl||0,
   cost:lv=>{const i=lv-DIG_SPEED_HMAX;return {c:[3,4,6,8,11,15,20,27,36,48][i]*1000000,m:{[LI([37,38,39,41,43,45,48,50,52,55][i])]:3+(i>>1),[LG_ESS[Math.min(4,i>>1)]]:1}};},
   apply:()=>{player.digSpeedLvl++;player.digSpeed=digSpeedMult(player.digSpeedLvl);},
   desc:lv=>'×'+digSpeedMult(lv).toFixed(1)+(lv<DIG_SPEED_LMAX?' → ×'+digSpeedMult(lv+1).toFixed(1):''),lock:'Сначала Адская скорость копания 20/20'},
  {id:'drill',ic:'🛠️',n:'Бур Зари',min:10,max:15,cur:()=>player.drillBought?player.drillLvl:0,
   cost:lv=>{const i=lv-10;return {c:[4,8,15,26,45][i]*1000000,m:{[LI([38,41,46,49,53][i])]:4+i,[LG_ESS[i]]:1}};},
   apply:()=>{player.drillLvl++;},
   desc:lv=>'Мощность '+fmt(DRILL_POWER[clamp(lv-1,0,DRILL_POWER.length-1)])+', тоннель '+(DRILL_RADIUS[clamp(lv-1,0,DRILL_RADIUS.length-1)]*2+1)+(lv<15?' → '+fmt(DRILL_POWER[lv])+', тоннель '+(DRILL_RADIUS[lv]*2+1):''),lock:'Сначала мощность бура 10 в Кузнице Ада'},
  {id:'barr',ic:'🧱',n:'Баррикады Зари',min:7,max:10,cur:()=>player.barricadeBought?player.barricadeLvl:0,
   cost:lv=>{const i=lv-7;return {c:[5,12,26][i]*1000000,m:{[LI([40,47,50][i])]:5,[LG_ESS[i*2]]:2}};},
   apply:()=>{player.barricadeLvl++;},
   desc:lv=>BARR[lv-1].name+' '+fmt(BARR[lv-1].hp)+(lv<10?' → '+BARR[lv].name.toLowerCase()+' '+fmt(BARR[lv].hp):''),lock:'Сначала баррикады 7 в Кузнице Ада'},
  {id:'slots',ic:'🎒',n:'Слоты рюкзака (виды руды)',min:34,max:40,cur:()=>player.slots,
   cost:lv=>{const i=lv-34;return {c:[2,3,5,7,10,14][i]*1000000,m:{[LI([37,39,42,45,49,54][i])]:4+i}};},
   apply:()=>{player.slots++;},desc:lv=>lv+' слотов → '+(lv+1),lock:'Сначала 34 слота в Кузнице Ада'},
  {id:'stack',ic:'📦',n:'Вместимость стопки',min:16,max:24,cur:()=>player.stackLvl||0,
   cost:lv=>{const i=lv-16;return {c:Math.round(2000000*Math.pow(1.45,i)/100000)*100000,m:{[LI([38,40,44,46,48,51,53,56][i])]:3+(i>>1)}};},
   apply:()=>{player.stackLvl=(player.stackLvl||0)+1;},desc:()=>stackCap()+' шт → '+(stackCap()+40),lock:'Сначала стопка 16 в Кузнице Ада'},
  {id:'torch',ic:'🔦',n:'Фонарь Зари',min:8,max:12,cur:()=>player.torchLvl,
   cost:lv=>{const i=lv-8;return {c:[3,7,14,26][i]*1000000,m:{[LI([37,42,46,51][i])]:4,[LG_ESS[i]]:2}};},
   apply:()=>{player.torchLvl++;},desc:lv=>'Свет шахтёра ярче, и Рассудок тает на '+Math.round((0.2+Math.max(0,lv-5)*0.03)*100)+'% медленнее'+(lv<12?' → '+Math.round((0.2+Math.max(0,lv-4)*0.03)*100)+'%':''),lock:'Сначала Адский фонарь 8'},
  {id:'eth',ic:'✨',n:'Эфирная чаша',min:0,max:5,cur:()=>lfuLv('eth'),
   cost:lv=>({c:[2,5,10,18,30][lv]*1000000,m:{[LG_ESS[lv]]:2+lv},d:2+lv*2}),
   apply:()=>{lfuP().eth=lfuLv('eth')+1;},desc:lv=>'Запас Эфира '+(AB_ETHER+lv*20)+(lv<5?' → '+(AB_ETHER+lv*20+20):'')},
  {id:'truth',ic:'👁',n:'Привычка к Истине',min:0,max:5,cur:()=>lfuLv('truth'),
   cost:lv=>({c:[3,6,12,22,36][lv]*1000000,m:{[LI([39,44,49,54,58][lv])]:3,eMirror:lv>2?2:0},d:3+lv*2}),
   apply:()=>{lfuP().truth=lfuLv('truth')+1;},desc:lv=>'В Истине мобы бьют сильнее на '+Math.round((1.2*(1-0.05*lv)-1)*100)+'%'+(lv<5?' → '+Math.round((1.2*(1-0.05*(lv+1))-1)*100)+'%':'')},
  {id:'dream',ic:'💤',n:'Долгий сон',min:0,max:3,cur:()=>lfuLv('dream'),
   cost:lv=>({c:[4,10,20][lv]*1000000,m:{eSleep:1+lv},d:4+lv*3}),
   apply:()=>{lfuP().dream=lfuLv('dream')+1;},desc:lv=>'Сон в Колодце снов длится '+(DREAM_T+lv*15)+' с'+(lv<3?' → '+(DREAM_T+lv*15+15)+' с':'')}
];
for(const u of LFU)if(u.cost){const f=u.cost;u.cost=lv=>{const r=f(lv);if(r&&r.m)for(const k in r.m)if(!r.m[k])delete r.m[k];return r;};}

/* ---------- лавка: припасы и расходники за материалы Лиловых небес ---------- */
const LCONS=[
  {id:'scrolls',ic:'📜',n:'Свиток возврата',pack:1,cost:{m:{eDew:1},c:300000},desc:'«Стрелять»: возврат в лобби с полным рюкзаком'},
  {id:'beacons',ic:'📡',n:'Рудный маяк',pack:1,cost:{m:{i37:1},c:400000},desc:'«Стрелять»: продаёт весь рюкзак по 75% цены прямо из шахты'},
  {id:'totems',ic:'🗿',n:'Тотем воскрешения',pack:1,cost:{m:{i45:2,eHoney:1},c:3000000},desc:'Сам срабатывает при смерти: 50% здоровья, руда не теряется'},
  {id:'hbombs',ic:'💣',n:'Бомба ×5',pack:5,cost:{m:{i38:2},c:600000},desc:'«Ставить»: бросок, взрыв 3 блока, 1200 урона'},
  {id:'icegren',ic:'❄️',n:'Ледяная граната ×5',pack:5,cost:{m:{i41:2},c:500000},desc:'«Ставить»: замораживает мёд и воду вокруг, сковывает мобов'},
  {id:'lsbomb',ic:'💤',n:'Сонная бомба ×5',pack:5,cost:{m:{i43:2,eChime:1},c:1500000},desc:'«Ставить»: взрыв 3 блока, 6000 урона, а уцелевшие мобы рядом засыпают на 5 секунд'},
  {id:'ltuner',ic:'🔔',n:'Камертон ×3',pack:3,cost:{m:{i42:2},c:900000},desc:'«Стрелять»: звон показывает всю руду в 14 клетках на 25 секунд (иллюзии — пунктиром)'}
];
function lfuSupList(){
  return [
    {id:'lad',ic:'🪜',n:'Лестницы ×20',d:'У тебя: '+player.ladders,c:Math.round(hellSupUnit('lad')*20)},
    {id:'med',ic:'🧪',n:'Аптечки ×3',d:'У тебя: '+player.potions,c:Math.round(hellSupUnit('med')*3)},
    player.grappleUnlocked?{id:'gra',ic:'🪝',n:'Снаряды крюка ×20',d:'У тебя: '+player.grappleAmmo,c:Math.round(hellSupUnit('gra')*20)}:null,
    curGun()?{id:'amm',ic:'🔸',n:'Патроны ×'+curGun().pack,d:'У тебя: '+player.gunAmmo,c:Math.round(hellSupUnit('amm')*curGun().pack)}:null,
    player.drillBought?{id:'dri',ic:'🛠️',n:'Буры ×5',d:'У тебя: '+player.drills,c:Math.round(hellSupUnit('dri')*5)}:null,
    player.barricadeBought?{id:'bar',ic:'🧱',n:'Баррикады ×'+BARR_PACK,d:'У тебя: '+player.barricades,c:Math.round(hellSupUnit('bar')*BARR_PACK)}:null
  ].filter(Boolean);
}
const lfuRow=(ic,body,btn)=>`<div class="lgRow"><div class="lbIco">${ic}</div><div class="txt">${body}</div>${btn}</div>`;
function lfuUpgHtml(){
  return LFU.map(u=>{const lv=u.cur(),max=lv>=u.max,low=lv<u.min,r=!max&&!low?u.cost(lv):null;
    return lfuRow(u.ic,`<b>${u.n} · ${lv}/${u.max}</b><div class="tiny">${low?'<span style="color:#ffb0b0">'+(u.lock||'')+'</span>':u.desc(lv)}</div>${r?`<div class="cost">${lgChips(r)}</div>`:''}`,
      max?'<span class="tiny">MAX</span>':low?'':`<button class="btn small" data-lfu="${u.id}" ${lgCanPay(r)?'':'disabled'}>Улучшить</button>`);}).join('')
    +`<p class="tiny muted" style="margin-top:6px">Прокачки Зари продолжают прокачки Ада — сначала доведи их до предела в Кузнице Ада. Перегонный куб улучшается в самом кубе.</p>`;
}
function lfuShopHtml(){
  const sup=lfuSupList();UI._lfuSup=sup;
  return `<div class="sect" style="margin-top:0">Припасы</div>`+sup.map(x=>lfuRow(x.ic,`<b>${x.n}</b><div class="tiny">${x.d}</div>`,`<button class="btn small" data-lsup="${x.id}" ${player.money>=x.c?'':'disabled'}>${fmt(x.c)} 💰</button>`)).join('')
    +`<div class="sect">Расходники Зари</div>`+LCONS.map(c=>lfuRow(c.ic,`<b>${c.n}</b> <span class="tiny">· есть ${(player.hitems&&player.hitems[c.id])||0}</span><div class="tiny">${c.desc}</div><div class="cost">${costChips(c.cost)}</div>`,
      `<button class="btn small" data-lcons="${c.id}" ${canPay(c.cost)?'':'disabled'}>Создать</button>`)).join('');
}
function lfuBind(d,done){
  d.querySelectorAll('[data-lfu]').forEach(b=>b.onclick=()=>{const u=LFU.find(q=>q.id===b.getAttribute('data-lfu')),lv=u.cur();
    if(lv<u.min||lv>=u.max||!lgPay(u.cost(lv)))return;u.apply();done(u.ic+' '+u.n+': '+u.cur());});
  d.querySelectorAll('[data-lsup]').forEach(b=>b.onclick=()=>{const x=(UI._lfuSup||[]).find(q=>q.id===b.getAttribute('data-lsup'));if(!x||!pay({c:x.c}))return;
    if(x.id==='lad')player.ladders+=20;else if(x.id==='med')player.potions+=3;else if(x.id==='gra')player.grappleAmmo+=20;
    else if(x.id==='amm')player.gunAmmo+=curGun().pack;else if(x.id==='dri')player.drills+=5;else if(x.id==='bar')player.barricades+=BARR_PACK;
    SFX.buy();vib(20);validateSelection();saveGame();UI.lforge('shop');});
  d.querySelectorAll('[data-lcons]').forEach(b=>b.onclick=()=>{const c=LCONS.find(q=>q.id===b.getAttribute('data-lcons'));if(!pay(c.cost))return;
    if(!player.hitems)player.hitems={};player.hitems[c.id]=(player.hitems[c.id]||0)+c.pack;SFX.buy();vib(20);UI.toast(c.ic+' '+c.n);validateSelection();saveGame();UI.lforge('shop');});
}

/* ---------- новые расходники в шахте ---------- */
function lfuPlaceItems(a){
  const n=(player.hitems&&player.hitems.lsbomb)|0;
  if(n>0)a.push({id:'lsbomb',icon:'💤',name:'Сонная бомба',count:n,desc:LCONS[5].desc.replace('«Ставить»: ','Тап — направление, «Ставить» — бросок. ')});
}
function lfuShootItems(a){
  const n=(player.hitems&&player.hitems.ltuner)|0;
  if(n>0)a.push({id:'ltuner',icon:'🔔',name:'Камертон',count:n,desc:LCONS[6].desc.replace('«Стрелять»: ','')});
}
function lfuUse(it,hold){
  if(it!=='ltuner')return false;
  if(hold)return true;
  if(!((player.hitems&&player.hitems.ltuner)>0))return true;
  player.hitems.ltuner--;G.lfuTuneT=25;G.lfuTuneX=player.x;G.lfuTuneY=player.y;
  AU.bell(1760,2,0.07,0,{ratio:2.76,index:0.6,rev:0.7});AU.bell(2637,1.6,0.04,0.05,{ratio:2.01,index:0.4,rev:0.7});
  shockRings.push({x:player.x,y:player.y-player.h*0.5,r:8,max:14*TILE,t:0,col:'#e8dcff'});
  floatText(player.x,player.y-70,'🔔 Руда отзывается','#e8dcff');validateSelection();
  return true;
}
function lfuPlace(){
  if(G.placeItem!=='lsbomb')return false;
  if((player.hitems.lsbomb|0)>0){player.hitems.lsbomb--;throwItem('sleep');validateSelection();}
  return true;
}
/* взрыв сонной бомбы */
function lfuSleepBoom(p){
  explode(p.x,p.y,96,0);
  shockRings.push({x:p.x,y:p.y,r:8,max:130,t:0,col:'#d8b0ff'});
  for(let i=0;i<26;i++){const a=Math.random()*TAU,sp=rnd(60,240);spawnPart(p.x,p.y,Math.cos(a)*sp,Math.sin(a)*sp,rnd(0.5,1.1),i%2?'#e6c8ff':'#fff0ff',rnd(2,4),-40);}
  for(const m of mobs){if(!m.alive)continue;const d=Math.hypot(m.x-p.x,m.y-m.h*0.5-p.y);
    if(d<110+m.w*0.4){damageMob(m,Math.round(6000*(d<55?1:0.6)),Math.sign(m.x-p.x)*2,{x:p.x});
      if(m.alive&&!m.def.boss&&!m.def.hb){m.sleepT=5;m.stun=5;m.sleepHit=0;m.tele=0;}}}
  AU.bell(392,1.4,0.08,0,{ratio:2.01,index:0.8,rev:0.7});
  const pd=Math.hypot(player.x-p.x,player.y-player.h*0.5-p.y);if(pd<70)hurtPlayer(60,'своя бомба');
}
/* звон камертона: метки руды вокруг места звона */
function lfuTunerDraw(g,tx0,tx1,ty0,ty1){
  if(!(G.lfuTuneT>0))return;
  const R=14,cx=Math.floor(G.lfuTuneX/TILE),cy=Math.floor((G.lfuTuneY-20)/TILE),a=Math.min(1,G.lfuTuneT/3),t=G.time;
  for(let ty=Math.max(ty0,cy-R);ty<=Math.min(ty1,cy+R);ty++)for(let tx=Math.max(tx0,cx-R);tx<=Math.min(tx1,cx+R);tx++){
    if((tx-cx)*(tx-cx)+(ty-cy)*(ty-cy)>R*R)continue;const o=getOre(tx,ty);if(!o||!ORES[o])continue;
    const x=tx*TILE+16,y=ty*TILE+16,ill=G.dim===2&&ORES[o].dim===2&&lilIllusory(tx,ty);
    g.save();g.globalAlpha=a*(0.55+0.3*Math.sin(t*5+tx+ty));
    if(ill){g.strokeStyle='#ff9ac8';g.setLineDash([3,3]);g.lineWidth=1.6;g.strokeRect(x-12,y-12,24,24);g.setLineDash([]);}
    else{g.globalCompositeOperation='lighter';softGlow(g,x,y,22,ORES[o].glow||'#fff0b0',0.6);g.globalCompositeOperation='source-over';g.strokeStyle=hexA(ORES[o].glow||'#fff0b0',0.9);g.lineWidth=1.6;g.strokeRect(x-12,y-12,24,24);}
    g.restore();}
}
function lfuTick(dt){if(G.lfuTuneT>0)G.lfuTuneT-=dt;}

/* ---------- облик баррикад Зари (8–10): кристалл, соты, фарфор ---------- */
function lfuBarrArt(g,x,y,lv,tx,ty){
  const T=G.time,a=0.5+0.35*Math.sin(T*2.5+tx+ty);
  if(lv===8){
    g.fillStyle='#2a3a5a';g.fillRect(x,y,TILE,TILE);
    const gr=g.createLinearGradient(x,y,x+TILE,y+TILE);gr.addColorStop(0,'#ffffff');gr.addColorStop(0.45,'#bfe6ff');gr.addColorStop(1,'#5a7ab8');
    g.fillStyle=gr;g.beginPath();g.moveTo(x+16,y+1);g.lineTo(x+31,y+12);g.lineTo(x+26,y+31);g.lineTo(x+6,y+31);g.lineTo(x+1,y+12);g.closePath();g.fill();
    g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=1;g.beginPath();g.moveTo(x+16,y+1);g.lineTo(x+16,y+31);g.moveTo(x+1,y+12);g.lineTo(x+16,y+18);g.lineTo(x+31,y+12);g.stroke();
    g.strokeStyle='rgba(190,230,255,'+a+')';g.lineWidth=1.4;g.strokeRect(x+1.5,y+1.5,TILE-3,TILE-3);
  }else if(lv===9){
    g.fillStyle='#5a3008';g.fillRect(x,y,TILE,TILE);
    for(let r=0;r<3;r++)for(let k=0;k<3;k++){const cx=x+6+k*10+(r%2?5:0),cy=y+6+r*10;if(cx>x+30)continue;
      g.fillStyle=(r+k)%2?'#f0a820':'#d88a10';g.beginPath();for(let j=0;j<6;j++){const an=j/6*TAU+Math.PI/6;g.lineTo(cx+Math.cos(an)*5.2,cy+Math.sin(an)*5.2);}g.closePath();g.fill();
      g.fillStyle='rgba(255,240,180,.45)';g.beginPath();g.arc(cx-1.4,cy-1.4,1.6,0,TAU);g.fill();}
    g.strokeStyle='rgba(255,200,80,'+a+')';g.lineWidth=1.4;g.strokeRect(x+1.5,y+1.5,TILE-3,TILE-3);
  }else{
    const gr=g.createLinearGradient(x,y,x+TILE,y+TILE);gr.addColorStop(0,'#ffffff');gr.addColorStop(0.6,'#f0e8f0');gr.addColorStop(1,'#b8a8c0');
    g.fillStyle=gr;g.fillRect(x,y,TILE,TILE);
    g.strokeStyle='#4a6ad0';g.lineWidth=1.2;g.strokeRect(x+3,y+3,TILE-6,TILE-6);
    g.fillStyle='#4a6ad0';for(let k=0;k<5;k++){const an=k/5*TAU;g.beginPath();g.arc(x+16+Math.cos(an)*4,y+16+Math.sin(an)*4,2.2,0,TAU);g.fill();}
    g.fillStyle='#ffd060';g.beginPath();g.arc(x+16,y+16,1.8,0,TAU);g.fill();
    g.strokeStyle='rgba(60,50,70,.5)';g.lineWidth=0.7;g.beginPath();g.moveTo(x+26,y+5);g.lineTo(x+23,y+11);g.lineTo(x+27,y+14);g.stroke();
    g.strokeStyle='rgba(130,160,255,'+a+')';g.lineWidth=1.2;g.strokeRect(x+1,y+1,TILE-2,TILE-2);
  }
}
