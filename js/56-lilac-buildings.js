'use strict';
/* ============================================================
   ЛИЛОВЫЕ НЕБЕСА — ЗДАНИЯ ДЕРЕВНИ (этап 8)
   Оранжерея (грядки, травы, отвары), Маяк ясности (защита Рассудка, фонари-якоря, карта),
   Колодец желаний (модификатор следующего спуска), Чайный домик (лавка за Сны, истории, «не та чашка»)
   и валюта «Сны».
   Прогресс — в player.prog: sny (Сны), gd (грядки), bk (маяк), wish/cup (на следующий спуск),
   mact (что действует в текущем спуске), tales (рассказанные истории), lmaxd (самая большая глубина).
   Фонари в мире — G.wf.lan ([x,y] клетки, где стоит фонарь). Облик зданий и окон — 57-lilac-bld-art.
   ============================================================ */

/* ---------- Сны ---------- */
function snyN(){return (player.prog&&player.prog.sny)|0;}
function snyAdd(n,x,y){
  if(!(n>0))return 0;
  n=Math.round(n*lbMod('dreams'));
  if(!player.prog)player.prog={};
  player.prog.sny=snyN()+n;
  if(x!=null)floatText(x,y,'+'+n+' 🌙 '+(n===1?'Сон':n<5?'Сна':'Снов'),'#e6c8ff');
  return n;
}
function snySpend(n){if(snyN()<n)return false;player.prog.sny=snyN()-n;return true;}
function snyWord(n){n=Math.abs(n)%100;const k=n%10;return (n>10&&n<20)?'Снов':k===1?'Сон':(k>=2&&k<=4)?'Сна':'Снов';}

/* ---------- семена, травы, отвары ---------- */
/* b — биомы (10–16), где семя попадается при копании */
const GD_SEEDS=[
  {s:'lsclover',h:'lhclover',n:'Медовый клевер', c:'#ffd27a',c2:'#d8902a',b:[10,12]},
  {s:'lspollen',h:'lhpollen',n:'Пыльцевик',      c:'#fff08a',c2:'#d8b830',b:[10,11,12]},
  {s:'lsthorn', h:'lhthorn', n:'Шиповник',       c:'#ff6a8a',c2:'#b02848',b:[13,14]},
  {s:'lsmint',  h:'lhmint',  n:'Сонная мята',    c:'#9ae8d0',c2:'#3a9a84',b:[15,16]},
  {s:'lsiris',  h:'lhiris',  n:'Зеркальный ирис',c:'#a8c8ff',c2:'#4a6ad0',b:[11,15]},
  {s:'lsmoon',  h:'lhmoon',  n:'Лунный цветок',  c:'#f4f0ff',c2:'#a898ff',b:[],moon:1}
];
const GD_BY={};for(const q of GD_SEEDS){GD_BY[q.s]=q;
  defMat(q.s,'Семена: '+q.n.toLowerCase(),'🌰',q.c,'seed',10);
  defMat(q.h,q.n,q.moon?'🌼':'🌿',q.c,'herb',10);}
if(!MAT_KINDS.some(k=>k[0]==='seed'))MAT_KINDS.push(['seed','🌰 Семена']);
if(!MAT_KINDS.some(k=>k[0]==='herb'))MAT_KINDS.push(['herb','🌿 Травы']);

const LB_BREWS=[
  {id:'lbheal',n:'Медовый отвар',     ic:'🍯',c:'#ffd27a',r:{lhclover:3},           out:2,txt:'Сразу лечит 40% здоровья.'},
  {id:'lbdig', n:'Пыльцевый эликсир', ic:'🌼',c:'#fff08a',r:{lhpollen:2,lhclover:1},out:1,txt:'Копаешь на 35% быстрее 90 секунд.',buf:'dig',t:90},
  {id:'lbstr', n:'Шиповый эликсир',   ic:'🌹',c:'#ff6a8a',r:{lhthorn:2,lhpollen:1}, out:1,txt:'Урон по мобам +25% на 90 секунд.',buf:'str',t:90},
  {id:'lbeth', n:'Сонный эликсир',    ic:'💤',c:'#9ae8d0',r:{lhmint:2,lhiris:1},    out:1,txt:'Эфир сразу полон и 60 секунд копится вдвое быстрее.',buf:'eth',t:60},
  {id:'lbsan', n:'Ирисовый настой',   ic:'💠',c:'#a8c8ff',r:{lhiris:2,lhmint:1},    out:1,txt:'120 секунд Рассудок тает вдвое медленнее.',buf:'san',t:120},
  {id:'lbmoon',n:'Лунный эликсир',    ic:'🌕',c:'#f4f0ff',r:{lhmoon:1,lhclover:2},  out:1,txt:'Лечит полностью и на 60 секунд даёт всё сразу: копание, урон, Эфир и Рассудок.',buf:'all',t:60}
];
const LB_BY={};for(const b of LB_BREWS){LB_BY[b.id]=b;defMat(b.id,b.n,b.ic,b.c,'brew',10);IT_CAT_OF[b.id]='use';}
IT_CAT_OF.llan='build';
const LB_BUFS=[['dig','🌼','#fff08a','Копание +35%'],['str','🌹','#ff6a8a','Урон +25%'],['eth','💤','#9ae8d0','Эфир ×2'],['san','💠','#a8c8ff','Рассудок тает медленнее']];

function lbBuf(k){return (G.lbuf&&G.lbuf[k]>0)?G.lbuf[k]:0;}
function lbDigMul(){return lbBuf('dig')>0?1.35:1;}
function lbDmgMul(){return lbBuf('str')>0?1.25:1;}
function lbEthMul(){return (lbBuf('eth')>0?2:1)*lbMod('eth');}
function lbDrink(id){
  const b=LB_BY[id];if(!b||matN(id)<=0)return;
  const heal=id==='lbheal'||id==='lbmoon';
  if(heal&&typeof bfCtx==='function'&&bfCtx()){UI.toast('В бою с боссом лечат только аптечки');return;}
  if(!heal&&G.dim!==2){UI.toast('Отвары Оранжереи действуют только в Лиловых небесах');return;}
  player.mats[id]--;if(player.mats[id]<=0)delete player.mats[id];
  if(!G.lbuf)G.lbuf={};
  if(heal){const h=Math.round(player.maxHp*(id==='lbmoon'?1:0.4));player.hp=Math.min(player.maxHp,player.hp+h);floatText(player.x,player.y-84,'+'+h+' HP','#5ee06a');SFX.heal();}
  if(b.buf==='all'){for(const q of LB_BUFS)G.lbuf[q[0]]=Math.max(lbBuf(q[0]),b.t);}
  else if(b.buf)G.lbuf[b.buf]=Math.max(lbBuf(b.buf),b.t);
  if((b.buf==='eth'||b.buf==='all')&&typeof LAB!=='undefined')LAB.eth=AB_ETHER;
  SFX.splash();burst(player.x,player.y-30,22,b.c,150,3);floatText(player.x,player.y-64,b.ic+' '+b.n,b.c);vib(15);
  validateSelection();
}

/* ---------- модификаторы спуска: желание колодца и чашка чая ---------- */
const LB_MODS={
  greed:  {n:'Жадность',         c:'#ffd060',good:'руда ×2',bad:'мобы бьют на 30% больнее',ore:2,hurt:1.3},
  hush:   {n:'Тишина',           c:'#b8d8ff',good:'мобов вдвое меньше',bad:'фонарь светит на 30% слабее',spawn:0.5,light:0.7},
  clear:  {n:'Ясный ум',         c:'#c8f0d8',good:'Рассудок тает вдвое медленнее',bad:'мобы крепче на 40%',san:0.5,mobhp:1.4},
  dream:  {n:'Сонливость',       c:'#e6c8ff',good:'Сны ×2',bad:'Рассудок тает в 1,5 раза быстрее',dreams:2,san:1.5},
  wind:   {n:'Попутный ветер',   c:'#a8f0ff',good:'бег +20%, Эфир копится в 1,5 раза быстрее',bad:'мобы бьют на 15% больнее',speed:1.2,eth:1.5,hurt:1.15},
  luck:   {n:'Удача',            c:'#ffb0d8',good:'сундуки вдвое щедрее',bad:'мобы бьют на 20% больнее',chest:2,hurt:1.2},
  bless:  {n:'Благословение',    c:'#fff4b0',good:'руда ×2 и Сны ×2',bad:'',ore:2,dreams:2},
  curse:  {n:'Проклятие колодца',c:'#8ad0a0',good:'',bad:'спуск начнётся с Рассудком 50',san0:50},
  cupgift:{n:'Сладкий чай',      c:'#ffd0e8',good:'90 секунд Рассудок не тает, Эфир полон',bad:'',calm:90},
  cupbite:{n:'Горький чай',      c:'#7ab070',good:'',bad:'мобы бьют на 25% больнее',hurt:1.25},
  cupsleep:{n:'Сонный чай',      c:'#a090c0',good:'',bad:'Рассудок тает на 30% быстрее',san:1.3}
};
function lbActive(){return (G.dim===2&&G.scene==='mine'&&player.prog&&Array.isArray(player.prog.mact))?player.prog.mact:null;}
function lbMod(k){const a=lbActive();if(!a)return 1;let v=1;for(const id of a){const q=LB_MODS[id];if(q&&q[k])v*=q[k];}return v;}
function lbModTxt(id){const q=LB_MODS[id];if(!q)return '';return (q.good?'＋ '+q.good:'')+(q.good&&q.bad?' · ':'')+(q.bad?'－ '+q.bad:'');}
/* вход в шахту Лиловых небес: загаданное в колодце и выпитое в чайной начинает действовать */
function lbEnterMine(){
  const P=player.prog;if(!P)return;
  G.lbuf={};G.lbCalm=0;
  P.mact=[];
  if(P.wish&&LB_MODS[P.wish])P.mact.push(P.wish);
  if(P.cup&&LB_MODS[P.cup])P.mact.push(P.cup);
  delete P.wish;delete P.cup;
  let san0=100;
  for(const id of P.mact){const q=LB_MODS[id];if(q.san0)san0=Math.min(san0,q.san0);if(q.calm)G.lbCalm=Math.max(G.lbCalm,q.calm);}
  player.sanity=san0;
  if(G.lbCalm>0&&typeof LAB!=='undefined')LAB.eth=AB_ETHER;
  G.lbModToast=P.mact.length?1.4:0;
}
function lbExitMine(){if(player.prog)player.prog.mact=[];G.lbuf={};G.lbCalm=0;}

/* Рассудок: маяк, отвар, желания; фонарь-якорь держит Рассудок как якорь */
function lbSanRate(rate,tx,ty){
  if(rate<0){
    if(G.lbCalm>0)return 0;
    rate*=(1-0.08*bkLv())*(lbBuf('san')>0?0.5:1)*lbMod('san')*lgSanMul();
  }
  return rate;
}

/* ---------- Маяк ясности ---------- */
function bkP(){const p=player.prog;if(!p.bk||typeof p.bk!=='object')p.bk={lv:0,own:0};return p.bk;}
function bkLv(){return clamp((player.prog&&player.prog.bk&&player.prog.bk.lv)|0,0,5);}
function bkCap(){return bkLv()?2+bkLv():0;}
const BK_UP=[   /* цена улучшения до уровня 1..5: деньги, Сны, эссенция */
  {m:1500000, s:2, e:'eDew',  en:2},
  {m:4000000, s:4, e:'eChime',en:3},
  {m:10000000,s:7, e:'eHoney',en:3},
  {m:24000000,s:10,e:'eToy',  en:4},
  {m:55000000,s:15,e:'eMirror',en:4}
];
const BK_TXT=['','Рассудок тает на 8% медленнее · 3 фонаря-якоря','Рассудок −16% · 4 фонаря · карта биомов','Рассудок −24% · 5 фонарей · постройки на мини-карте',
  'Рассудок −32% · 6 фонарей · фонари лечат рядом','Рассудок −40% · 7 фонарей · на карте все постройки, стрелка к сундукам'];
const LAN_PRICE={m:400000,s:1};
function lanList(){if(!G.wf.lan||!Array.isArray(G.wf.lan))G.wf.lan=[];return G.wf.lan;}
function lanFree(){return Math.max(0,(bkP().own|0)-lanList().length);}
function lbLanNear(tx,ty,rx,ry){
  if(G.dim!==2||!G.wf.lan)return false;
  for(const a of G.wf.lan){if(Math.abs(a[0]-tx)<=rx&&Math.abs(a[1]-ty)<=ry)return true;}
  return false;
}
function lbPlaceLantern(){
  const P=bkP();
  if(G.dim!==2){UI.toast('Фонари-якоря ставятся в шахте Лиловых небес');return;}
  if(!(P.own>0)){UI.toast('Купи фонарь-якорь в Маяке ясности');return;}
  const tx=Math.floor(player.x/TILE),ty=Math.floor((player.y-4)/TILE);
  if(G.dream||ty>=LIL_FLOOR){floatText(player.x,player.y-64,'Во сне фонарь не горит','#d8b0ff');SFX.uiBack();return;}
  if(ty<14){floatText(player.x,player.y-64,'Здесь и так светло','#d8b0ff');SFX.uiBack();return;}
  if(getTile(tx,ty)!==T_AIR||!isSolid(tx,ty+1)){floatText(player.x,player.y-64,'Фонарю нужен твёрдый пол','#ff9a9a');SFX.uiBack();return;}
  const L=lanList();
  if(L.some(a=>Math.abs(a[0]-tx)<=3&&Math.abs(a[1]-ty)<=3)){floatText(player.x,player.y-64,'Рядом уже горит фонарь','#ff9a9a');SFX.uiBack();return;}
  let msg='🏮 Фонарь-якорь зажжён';
  if(lanFree()<=0){L.shift();msg='🏮 Самый старый фонарь перенесён сюда';}
  L.push([tx,ty]);tileEpoch++;
  SFX.place();AU.bell(880,0.9,0.07,0,{ratio:2.01,index:0.7,rev:0.5});
  burst(tx*TILE+16,ty*TILE+4,20,'#fff0c0',140,2.6);floatText(tx*TILE+16,ty*TILE-30,msg,'#fff0c0');
  validateSelection();saveGame();
}
/* фонари гаснут, если их клетку заняла порода (Розарий зарастает) */
function lanCheck(){
  const L=G.wf.lan;if(!L||!L.length)return;
  for(let i=L.length-1;i>=0;i--){const a=L[i];if(getTile(a[0],a[1])!==T_AIR&&getTile(a[0],a[1])!==T_LADDER){L.splice(i,1);tileEpoch++;
    if(Math.hypot(a[0]-player.x/TILE,a[1]-player.y/TILE)<20)UI.toast('🏮 Фонарь-якорь засыпало — он вернулся в запас');}}
}
/* источники света для кэша освещения (32-chunk-cache) */
function lbLanLights(L,tx0,tx1,ty0,ty1){
  if(!G.wf.lan)return;const r=5.5+bkLv()*0.35;
  for(const a of G.wf.lan)if(a[0]>=tx0-6&&a[0]<=tx1+6&&a[1]>=ty0-6&&a[1]<=ty1+6)L.push(a[0]*TILE+16,(a[1]-0.4)*TILE,r,0.85);
}

/* ---------- копание, мобы, сундуки: Сны и семена ---------- */
function lbSeedFor(bi){
  if(bi>=14&&Math.random()<0.06)return 'lsmoon';
  const c=GD_SEEDS.filter(q=>q.b.indexOf(bi)>=0);
  return c.length?c[Math.floor(Math.random()*c.length)].s:'lsclover';
}
function lbDug(tx,ty,t,oreId,mx,my){
  if(G.dim!==2)return;
  const g=gdP();g.dig=(g.dig|0)+1;
  if(ty<12||ty>=LIL_FLOOR)return;
  lgDugBonus(oreId,mx,my);
  if(Math.random()<(oreId?0.035:0.009)*lgSeedMul()){const s=lbSeedFor(biomeAt(ty));addMat(s,1);floatText(mx,my-34,'+1 🌰 '+GD_BY[s].n,GD_BY[s].c);}
}
function lbMobKill(m){
  if(G.dim!==2||!m.def.lm)return;
  const x=m.x,y=m.y-m.h-52;
  if(m.def.id==='lnightmare')snyAdd(2,x,y);
  else if(m.tf&&Math.random()<0.22)snyAdd(1,x,y);
  else if(Math.random()<0.03)snyAdd(1,x,y);
  if(Math.random()<0.06){const s=lbSeedFor(biomeAt(Math.floor(m.y/TILE)));addMat(s,1);floatText(x,y-20,'+1 🌰 '+GD_BY[s].n,GD_BY[s].c);}
}
function lbChestSny(wy,rich){
  let n=0;
  if(wy>=LIL_FLOOR)n=3+Math.floor(Math.random()*3);
  else if(rich)n=2+Math.floor(Math.random()*2);
  else if(Math.random()<0.3)n=1;
  return snyAdd(n);
}
function lbMobSpawn(m){const k=lbMod('mobhp');if(k!==1){m.hp=m.maxHp=Math.round(m.hp*k);}}
function lbSpawnOK(tx,ty){
  if(lbLanNear(tx,ty,8,6))return false;
  const s=lbMod('spawn');return s>=1||Math.random()<s;
}

/* ---------- такт в шахте ---------- */
function lbTick(dt){
  if(G.dim!==2||G.scene!=='mine')return;
  if(G.lbuf)for(const k in G.lbuf)if(G.lbuf[k]>0)G.lbuf[k]-=dt;
  if(G.lbCalm>0)G.lbCalm-=dt;
  const d=Math.floor(Math.max(0,player.y)/TILE);
  if(d<LIL_FLOOR&&d>((player.prog.lmaxd)|0))player.prog.lmaxd=d;
  /* фонари рядом: на 4 уровне маяка лечат */
  if(bkLv()>=4&&player.hp>0&&player.hp<player.maxHp){const tx=Math.floor(player.x/TILE),ty=Math.floor((player.y-20)/TILE);
    if(lbLanNear(tx,ty,5,4)&&!(typeof bfCtx==='function'&&bfCtx()))player.hp=Math.min(player.maxHp,player.hp+player.maxHp*0.015*dt);}
  G.lbLanT=(G.lbLanT||0)-dt;if(G.lbLanT<=0){G.lbLanT=1;lanCheck();}
  if(G.lbModToast>0){G.lbModToast-=dt;if(G.lbModToast<=0){const a=player.prog.mact||[];
    UI.toast(a.map(id=>(id.indexOf('cup')===0?'🍵 ':'🪙 ')+LB_MODS[id].n).join(' · ')+' — действует в этом спуске');}}
}

/* ---------- значки эффектов в углу (под Рассудком) ---------- */
function lbHud(x,y){
  if(hudHidden())return;
  let k=0;const r=10;
  const pill=(col,ic,f,lbl)=>{
    const cx=x+r+k*(2*r+5),cy=y+r;
    ctx.fillStyle='rgba(16,8,24,.78)';ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.fill();
    ctx.strokeStyle=hexA(col,0.35);ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy,r-1,0,TAU);ctx.stroke();
    if(f>0){ctx.strokeStyle=col;ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,cy,r-1,-Math.PI/2,-Math.PI/2+TAU*Math.min(1,f));ctx.stroke();}
    ctx.font='11px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff';ctx.fillText(ic,cx,cy+0.5);ctx.textBaseline='alphabetic';
    k++;};
  for(const q of LB_BUFS){const t=lbBuf(q[0]);if(t>0)pill(q[2],q[1],t/(q[0]==='san'?120:q[0]==='eth'?60:90));}
  if(G.lbCalm>0)pill('#ffd0e8','🍵',G.lbCalm/90);
  const a=lbActive();if(a)for(const id of a){if(id==='cupgift')continue;pill(LB_MODS[id].c,id.indexOf('cup')===0?'🍵':'🪙',0);}
}

/* ---------- мини-карта: фонари; постройки и стрелка к сундукам с прокачкой маяка ---------- */
function lbMinimap(g,toS,r){
  const L=G.wf.lan,lv=bkLv();
  if(lv>=3){
    const tx=player.x/TILE,ty=player.y/TILE;
    for(const q of structList(tx-60,tx+60,ty-60,ty+60)){if(!q.st.ls&&!(q.st.dim===2))continue;
      const [sx,sy]=toS(q.px+q.tw/2,q.py+q.th/2);if(sx<r.x||sx>r.x+r.s||sy<r.y||sy>r.y+r.s)continue;
      const dn=lsDone(q);g.fillStyle=dn?'rgba(200,170,255,.45)':'#e6b8ff';g.strokeStyle='rgba(20,0,30,.9)';g.lineWidth=1;
      g.beginPath();g.moveTo(sx,sy-4);g.lineTo(sx+4,sy);g.lineTo(sx,sy+4);g.lineTo(sx-4,sy);g.closePath();g.fill();g.stroke();}
  }
  if(L)for(const a of L){const [sx,sy]=toS(a[0]+0.5,a[1]);if(sx<r.x||sx>r.x+r.s||sy<r.y||sy>r.y+r.s)continue;
    g.fillStyle='rgba(255,240,190,.35)';g.beginPath();g.arc(sx,sy,5,0,TAU);g.fill();g.fillStyle='#fff6d0';g.beginPath();g.arc(sx,sy,2.2,0,TAU);g.fill();}
  if(lv>=5){   /* стрелка к ближайшему неоткрытому сундуку */
    const px=player.x/TILE,py=player.y/TILE;let best=null,bd=1e9;
    for(const q of structList(px-70,px+70,py-70,py+70)){
      for(const ch of ['C','k']){const cs=q.st.cells&&q.st.cells[ch];if(!cs)continue;
        for(const c of cs){const wx=q.px+c[0],wy=q.py+c[1];if(openedChests.has(wx+','+wy))continue;const d=Math.hypot(wx-px,wy-py);if(d<bd){bd=d;best=[wx,wy];}}}}
    if(best&&bd>3){const cx=r.x+r.s/2,cy=r.y+r.s/2,ang=Math.atan2(best[1]-py,best[0]-px),[sx,sy]=toS(best[0]+0.5,best[1]+0.5);
      if(sx>=r.x&&sx<=r.x+r.s&&sy>=r.y&&sy<=r.y+r.s){g.fillStyle='#ffd060';g.fillRect(sx-2.5,sy-2.5,5,5);g.strokeStyle='#000';g.strokeRect(sx-2.5,sy-2.5,5,5);}
      else{const ex=cx+Math.cos(ang)*(r.s/2-12),ey=cy+Math.sin(ang)*(r.s/2-12);
        g.save();g.translate(ex,ey);g.rotate(ang);g.fillStyle='#ffd060';g.beginPath();g.moveTo(6,0);g.lineTo(-4,-4);g.lineTo(-4,4);g.closePath();g.fill();g.restore();}}
  }
}

/* ============================================================
   ОРАНЖЕРЕЯ
   ============================================================ */
const GD_DIG=160;          /* столько блоков накопать в Лиловых небесах — и растение созреет */
const GD_TIME=50*60;       /* или столько секунд настоящего времени (рост идёт и вне игры) */
const GD_BEDS=[null,null,null,{m:3000000,s:3},{m:8000000,s:6},{m:20000000,s:10}];
function gdP(){
  const p=player.prog;if(!p.gd||typeof p.gd!=='object')p.gd={n:3,beds:[],dig:0};
  const g=p.gd;if(!Array.isArray(g.beds))g.beds=[];g.n=clamp((g.n|0)||3,3,6);g.dig=g.dig|0;
  while(g.beds.length<g.n)g.beds.push(null);
  return g;
}
function gdRaw(b){return (gdP().dig-b.d0)/GD_DIG+Math.max(0,Date.now()-b.t0)/1000/GD_TIME;}
function gdGrowth(b){if(!b)return 0;let v=clamp(gdRaw(b)-(b.loss||0),0,1);if(b.m===2&&!b.w)v=Math.min(v,0.5);return v;}
function gdWeedy(b){return !!(b&&b.m===2&&!b.w&&gdGrowth(b)>=0.5);}
function gdPlant(i,s){
  const g=gdP();if(g.beds[i]||matN(s)<=0)return;
  player.mats[s]--;if(player.mats[s]<=0)delete player.mats[s];
  const r=Math.random(),q=GD_BY[s];
  g.beds[i]={s,d0:g.dig,t0:Date.now(),m:q.moon?1:r<0.08?1:r<0.24?2:0,w:0,loss:0};
  SFX.place();AU.bell(660,0.5,0.05,0,{ratio:2,index:0.6});saveGame();
}
function gdHarvest(i){
  const g=gdP(),b=g.beds[i];if(!b||gdGrowth(b)<1)return '';
  const q=GD_BY[b.s];let txt='';
  if(q.moon){addMat('lhmoon',2);txt='2× Лунный цветок';}
  else{let n=3+(Math.random()<0.5?1:0)+(lgi('shears')?1:0);if(b.m===1)n*=2;addMat(q.h,n);txt=n+'× '+q.n;
    if(b.m===1){addMat('lhmoon',1);txt+=' · 1× Лунный цветок';}}
  if(Math.random()<0.35){addMat(b.s,1);txt+=' · семечко';}
  g.beds[i]=null;SFX.buy();AU.bell(1047,0.8,0.07,0,{ratio:2.01,index:0.8,rev:0.6});saveGame();
  return txt;
}
function gdStatus(b){
  if(!b)return 'Пустая грядка';
  const v=gdGrowth(b),q=GD_BY[b.s];
  if(gdWeedy(b))return 'Сорняк душит '+q.n.toLowerCase()+'! Прополи его мечом';
  if(v>=1)return q.n+(b.m===1?' · редкий цветок!':'')+' — пора собирать';
  const left=Math.max(1,Math.ceil((1-v)*GD_DIG));
  return q.n+' · '+Math.floor(v*100)+'%'+(b.m===1&&v>=0.5?' · светится!':'')+' · ещё ~'+left+' блоков';
}
function lbCvHtml(w,h,attr){return `<canvas ${attr||''} width="${w*2}" height="${h*2}" style="width:${w}px;height:${h}px;max-width:100%;display:block;margin:0 auto"></canvas>`;}
/* живые картинки в окнах: перерисовываются, пока окно открыто */
function lbAnim(cv,draw){
  if(!cv)return;const g=cv.getContext('2d'),t0=performance.now();
  const f=(now)=>{if(!cv.isConnected)return;g.setTransform(2,0,0,2,0,0);draw(g,(now-t0)/1000);requestAnimationFrame(f);};
  requestAnimationFrame(f);
}
function lbHerbsLine(){
  return GD_SEEDS.map(q=>`<span class="lbChip" style="border-color:${hexA(q.c,0.5)}">${q.moon?'🌼':'🌿'} ${q.n}: <b>${matN(q.h)}</b></span>`).join('');
}
UI.lgarden=function(tab){
  tab=tab||UI._gdTab||'beds';UI._gdTab=tab.indexOf('weed')===0?'beds':tab;
  const g=gdP();
  let body='';
  if(tab==='beds'){
    const seeds=GD_SEEDS.filter(q=>matN(q.s)>0);
    body=`<div class="gdGrid">`+g.beds.map((b,i)=>{
      let act='';
      if(!b)act=seeds.length?`<div class="tiny" style="margin:2px 0">Посадить:</div><div class="gdSeeds">`+seeds.map(q=>`<button class="btn small alt" data-pl="${i}:${q.s}">🌰 ${q.n} ×${matN(q.s)}</button>`).join('')+`</div>`
        :`<div class="tiny muted">Нет семян — их находят в шахте Лиловых небес</div>`;
      else if(gdWeedy(b))act=`<button class="btn small" data-wd="${i}">⚔ Прополоть</button>`;
      else if(gdGrowth(b)>=1)act=`<button class="btn small" data-hv="${i}">Собрать урожай</button>`;
      return `<div class="gdBed">${lbCvHtml(150,104,'data-bed="'+i+'"')}<div class="tiny gdSt">${gdStatus(b)}</div>${act}</div>`;}).join('');
    if(g.n<6){const pr=GD_BEDS[g.n],can=player.money>=pr.m&&snyN()>=pr.s;
      body+=`<div class="gdBed locked"><div class="gdLock">+</div><div class="tiny">Новая грядка</div><div class="tiny">${fmt(pr.m)} 💰 · ${pr.s} 🌙</div><button class="btn small" id="gdBuy" ${can?'':'disabled'}>Вскопать</button></div>`;}
    body+=`</div><p class="tiny muted" style="margin-top:6px">Растения растут, пока ты копаешь в Лиловых небесах (и понемногу сами). Иногда вырастает редкий цветок — или кусачий сорняк.</p>`;
  }else if(tab==='brew'){
    body=`<div class="lbChips">${lbHerbsLine()}</div><div class="lbList">`+LB_BREWS.map(b=>{
      const ok=Object.keys(b.r).every(h=>matN(h)>=b.r[h]);
      const rec=Object.keys(b.r).map(h=>{const q=GD_SEEDS.find(z=>z.h===h);return `<span style="color:${matN(h)>=b.r[h]?'#c8f0c0':'#ff9a9a'}">${b.r[h]}× ${q.n}</span>`;}).join(' + ');
      return `<div class="lbRow"><div class="lbIco" style="background:${hexA(b.c,0.18)};border-color:${hexA(b.c,0.5)}">${b.ic}</div><div style="flex:1;min-width:0"><b>${b.n}</b> <span class="tiny">(есть: ${matN(b.id)})</span>
        <div class="tiny">${b.txt}</div><div class="tiny">${rec}${b.out>1?' → '+b.out+' шт.':''}</div></div><button class="btn small" data-br="${b.id}" ${ok?'':'disabled'}>Сварить</button></div>`;}).join('')+`</div>
      <p class="tiny muted" style="margin-top:6px">Отвары берутся в шахту как предметы: кнопка «Стрелять» или быстрый слот. Действуют в Лиловых небесах (лечебные — везде, кроме боя с боссом).</p>`;
  }else if(tab==='pets'){body=gdPetsHtml();
  }else if(tab.indexOf('weed:')===0){
    const i=+tab.slice(5);
    body=`<p class="tiny" style="text-align:center">Тапай по сорняку — бей мечом. Когда пасть раскрыта и горит красным — <b>не трогай</b>, укусит!</p>
      ${lbCvHtml(300,250,'id="gdWeed" style="touch-action:none"')}
      <div class="row" style="justify-content:center;margin-top:6px"><button class="btn small alt" id="gdFlee">Отступить</button></div>`;
    setTimeout(()=>gdWeedGame(i),0);
  }
  const d=this.build('lgarden',`
    <div class="card lilac" style="max-width:560px;width:96vw">
      <h3>🌱 Оранжерея</h3>
      <div class="tabs"><button data-t="beds" class="${tab==='beds'||tab.indexOf('weed')===0?'on':''}">Грядки</button><button data-t="brew" class="${tab==='brew'?'on':''}">Отвары</button><button data-t="pets" class="${tab==='pets'?'on':''}">Питомцы</button></div>
      <div class="scroll" style="max-height:62vh">${body}</div>
    </div>
    <button class="btn alt" id="gdBack">Выйти</button>`);
  d.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{SFX.ui();UI.lgarden(b.getAttribute('data-t'));});
  d.querySelectorAll('[data-pl]').forEach(b=>b.onclick=()=>{const [i,s]=b.getAttribute('data-pl').split(':');gdPlant(+i,s);UI.toast('🌱 Посажено: '+GD_BY[s].n);UI.lgarden('beds');});
  d.querySelectorAll('[data-hv]').forEach(b=>b.onclick=()=>{const t=gdHarvest(+b.getAttribute('data-hv'));if(t)UI.toast('🧺 Урожай: '+t);UI.lgarden('beds');});
  d.querySelectorAll('[data-wd]').forEach(b=>b.onclick=()=>{SFX.ui();UI.lgarden('weed:'+b.getAttribute('data-wd'));});
  d.querySelectorAll('[data-br]').forEach(b=>b.onclick=()=>{const q=LB_BY[b.getAttribute('data-br')];if(!Object.keys(q.r).every(h=>matN(h)>=q.r[h]))return;
    for(const h in q.r){player.mats[h]-=q.r[h];if(player.mats[h]<=0)delete player.mats[h];}
    addMat(q.id,q.out);SFX.splash();AU.bell(784,0.7,0.06,0,{ratio:2.01,index:0.7,rev:0.5});UI.toast(q.ic+' Сварено: '+q.n+(q.out>1?' ×'+q.out:''));saveGame();UI.lgarden('brew');});
  {const bb=d.querySelector('#gdBuy');if(bb)bb.onclick=()=>{const pr=GD_BEDS[g.n];if(player.money<pr.m||snyN()<pr.s)return;player.money-=pr.m;snySpend(pr.s);g.n++;g.beds.push(null);SFX.buy();UI.toast('🌱 Новая грядка вскопана');saveGame();UI.lgarden('beds');};}
  {const f=d.querySelector('#gdFlee');if(f)f.onclick=()=>{SFX.uiBack();UI.lgarden('beds');};}
  d.querySelector('#gdBack').onclick=()=>{SFX.uiBack();UI.close();};
  if(tab==='pets')gdPetsBind(d);
  d.querySelectorAll('canvas[data-bed]').forEach(cv=>{const i=+cv.getAttribute('data-bed');lbAnim(cv,(c,t)=>gdDrawBed(c,150,104,g.beds[i],t));});
};
/* мини-игра «прополка»: сорняк раскачивается, раскрывает пасть (красный — не трогай) и щёлкает */
function gdWeedGame(i){
  const cv=document.getElementById('gdWeed');if(!cv)return;
  const g=gdP(),b=g.beds[i];if(!gdWeedy(b)){UI.lgarden('beds');return;}
  const hits=clamp(Math.ceil(3600/Math.max(1,swordDmg())/(lgi('shears')?2:1)),2,10);
  const W={hp:hits,max:hits,ph:'idle',t:0,next:rnd(1.2,2),hit:0,bite:0,parts:[],x:0,dead:0,swing:0};
  let last=performance.now();
  const step=()=>{const now=performance.now(),dt=Math.min(0.05,(now-last)/1000);last=now;W.t+=dt;
    if(W.hit>0)W.hit-=dt;if(W.bite>0)W.bite-=dt;if(W.swing>0)W.swing-=dt*3;
    if(W.ph==='idle'){W.next-=dt;if(W.next<=0){W.ph='warn';W.pt=0;}}
    else if(W.ph==='warn'){W.pt+=dt;if(W.pt>0.75){W.ph='snap';W.pt=0;AU.bell(220,0.15,0.08,0,{ratio:1.41,index:2});}}
    else if(W.ph==='snap'){W.pt+=dt;if(W.pt>0.3){W.ph='idle';W.next=rnd(0.9,1.9)*(W.hp<W.max/2?0.75:1);}}
    else if(W.ph==='dead'){W.dead+=dt;}
    for(const p of W.parts){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=300*dt;p.l-=dt;}W.parts=W.parts.filter(p=>p.l>0);
    W.x=Math.sin(W.t*1.7)*26+Math.sin(W.t*0.7)*14;};
  const onTap=(e)=>{e.preventDefault();if(W.ph==='dead')return;
    const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*300,y=(e.clientY-r.top)/r.height*250;
    const hx=150+W.x,hy=96;
    if(Math.hypot(x-hx,y-hy)>58)return;
    W.swing=1;SFX.swing();
    if(W.ph==='warn'||W.ph==='snap'){
      W.bite=0.5;W.ph='snap';W.pt=0;SFX.hurt();vib(40);
      b.bite=(b.bite||0)+0.06;UI.toast('Сорняк укусил — растение подвяло');
      return;}
    W.hp--;W.hit=0.25;W.ph='idle';W.next=Math.max(W.next,0.5);SFX.mobHit();vib(12);
    for(let k=0;k<10;k++)W.parts.push({x:hx+rnd(-20,20),y:hy+rnd(-20,20),vx:rnd(-160,160),vy:rnd(-220,-40),l:rnd(0.5,1),c:Math.random()<0.6?'#5aa04a':'#c8e870'});
    if(W.hp<=0){W.ph='dead';W.dead=0;SFX.mobDie();
      const v=gdRaw(b)-(b.loss||0);if(v>0.5)b.loss=(b.loss||0)+(v-0.5);b.loss+=b.bite||0;b.bite=0;
      b.w=1;addMat('lhthorn',1);saveGame();
      setTimeout(()=>{if(UI.modal==='lgarden'){UI.toast('⚔ Сорняк выполот · +1 шиповник');UI.lgarden('beds');}},1300);}
  };
  cv.addEventListener('pointerdown',onTap);
  lbAnim(cv,(c,t)=>{step();gdDrawWeedGame(c,300,250,W,b,t);});
}

/* ============================================================
   МАЯК ЯСНОСТИ
   ============================================================ */
UI.lbeacon=function(){
  const P=bkP(),L=P.lv|0,up=L<5?BK_UP[L]:null;
  const essName=(id)=>{const e=LIL_ESS.find(q=>q[0]===id);return e?e[1]:id;};
  const pips=[1,2,3,4,5].map(k=>`<span class="abPip ${k<=L?'on':''}"></span>`).join('');
  let upHtml='';
  if(up){const can=player.money>=up.m&&snyN()>=up.s&&matN(up.e)>=up.en;
    upHtml=`<div class="tiny" style="margin:6px 0 4px">Уровень ${L+1}: <b>${BK_TXT[L+1]}</b></div>
      <div class="tiny">Цена: <b>${fmt(up.m)} 💰</b> · ${up.s} 🌙 (есть ${snyN()}) · ${up.en}× ${essName(up.e)} (${matN(up.e)})</div>
      <button class="btn small" id="bkUp" ${can?'':'disabled'}>${L?'Улучшить маяк':'Зажечь маяк'}</button>`;}
  else upHtml=`<div class="tiny" style="margin:6px 0">Маяк горит в полную силу.</div>`;
  const placed=lanList().length,canLan=L>0&&(P.own|0)<bkCap()&&player.money>=LAN_PRICE.m&&snyN()>=LAN_PRICE.s;
  const lanHtml=L?`<div class="lbRow"><div class="lbIco">🏮</div><div style="flex:1"><b>Фонари-якоря: ${P.own|0} из ${bkCap()}</b> <span class="tiny">(в шахте горят: ${placed})</span>
      <div class="tiny">Ставятся в шахте кнопкой «Ставить». Рядом с фонарём светло, Рассудок не тает и мобы не появляются. Если все фонари уже горят — самый старый переносится на новое место.</div></div></div>
      <div class="row" style="gap:6px;flex-wrap:wrap"><button class="btn small" id="bkLan" ${canLan?'':'disabled'}>Купить фонарь · ${fmt(LAN_PRICE.m)} 💰 · ${LAN_PRICE.s} 🌙</button>${placed?'<button class="btn small alt" id="bkOff">Погасить все</button>':''}</div>`
    :`<p class="tiny muted">Зажги маяк, чтобы получить фонари-якоря.</p>`;
  const d=this.build('lbeacon',`
    <div class="card lilac" style="max-width:560px;width:96vw">
      <h3>🗼 Маяк ясности</h3>
      <p class="tiny">Смотритель держит свет, который не даёт Пелене сгуститься. Чем ярче маяк, тем дольше держится твой Рассудок.</p>
      <div class="abPips" style="margin:4px 0">${pips}</div>
      <div class="tiny" style="color:#e0c8ff">${L?'Сейчас: '+BK_TXT[L]:'Маяк погашен'}</div>
      ${upHtml}
      <div class="scroll" style="max-height:52vh;margin-top:8px">
        ${lanHtml}
        ${L>=2?`<div class="sect" style="margin-top:8px">Карта Лиловых небес</div>${lbCvHtml(300,420,'id="bkMap"')}<p class="tiny muted">Ромбы — постройки (тусклые — пройденные), огоньки — твои фонари, черта — твоя самая большая глубина.</p>`:'<p class="tiny muted" style="margin-top:8px">На 2 уровне маяк откроет карту биомов.</p>'}
      </div>
    </div>
    <button class="btn alt" id="bkBack">Выйти</button>`);
  {const b=d.querySelector('#bkUp');if(b)b.onclick=()=>{if(player.money<up.m||snyN()<up.s||matN(up.e)<up.en)return;
    player.money-=up.m;snySpend(up.s);player.mats[up.e]-=up.en;if(player.mats[up.e]<=0)delete player.mats[up.e];
    P.lv=L+1;if(L===0)P.own=Math.max(P.own|0,1);
    SFX.buy();AU.bell(1319,1.2,0.07,0,{ratio:2.01,index:0.9,rev:0.7});UI.toast('🗼 Маяк ясности: уровень '+P.lv+(L===0?' · первый фонарь-якорь в подарок':''));saveGame();UI.lbeacon();};}
  {const b=d.querySelector('#bkLan');if(b)b.onclick=()=>{if(player.money<LAN_PRICE.m||!snySpend(LAN_PRICE.s))return;player.money-=LAN_PRICE.m;P.own=(P.own|0)+1;SFX.buy();UI.toast('🏮 Фонарь-якорь куплен');validateSelection();saveGame();UI.lbeacon();};}
  {const b=d.querySelector('#bkOff');if(b)b.onclick=()=>{G.wf.lan=[];tileEpoch++;SFX.uiBack();UI.toast('Фонари погашены и вернулись в запас');saveGame();UI.lbeacon();};}
  d.querySelector('#bkBack').onclick=()=>{SFX.uiBack();UI.close();};
  const mc=d.querySelector('#bkMap');
  if(mc){const data=bkMapData();lbAnim(mc,(c,t)=>bkDrawMap(c,300,420,data,t));}
};
/* постройки для карты: пройденные — всегда, на 5 уровне — все */
function bkMapData(){
  const out=[],all=bkLv()>=5;
  for(const q of structList(0,MW-1,0,LIL_FLOOR-1)){if(q.st.dim!==2)continue;
    const dn=lsDone(q),seen=!!lsPeek(q);if(!all&&!seen&&!dn)continue;
    out.push({x:q.px+q.tw/2,y:q.py+q.th/2,n:LS_NAMES[q.st.id]||q.st.id,dn});}
  return {st:out,lan:lanList().slice(),maxd:(player.prog.lmaxd|0)};
}

/* ============================================================
   КОЛОДЕЦ ЖЕЛАНИЙ
   ============================================================ */
const WL_MIX=['greed','hush','clear','dream','wind','luck'];
const WL_THROWS=[
  {id:'coin',n:'Монетка',    m:500000,  odds:[30,15,55,0,0], txt:'Скромное желание. Колодец может и промолчать.'},
  {id:'hand',n:'Горсть монет',m:5000000,odds:[14,10,64,12,0],txt:'Щедрое желание — колодец слышит лучше.'},
  {id:'ore', n:'Три камня руды',m:0,    odds:[5,5,58,20,12], txt:'Самая ценная руда Лиловых небес из рюкзака. Колодец любит камни.'}
];
function wlBestOre(){let best=null;for(const k in player.inv){const o=ORES[k];if(o&&o.dim===2&&player.inv[k]>=3&&(!best||o.price>ORES[best].price))best=k;}return best;}
function wlRoll(th){
  const o=th.odds,s=o.reduce((a,b)=>a+b,0);let r=Math.random()*s,k=0;
  for(;k<o.length;k++){r-=o[k];if(r<=0)break;}
  if(k===0)return {kind:'none'};
  if(k===1)return {kind:'mod',id:'curse'};
  if(k===2)return {kind:'mod',id:WL_MIX[Math.floor(Math.random()*WL_MIX.length)]};
  if(k===3)return {kind:'mod',id:'bless'};
  return {kind:'sny',n:5+Math.floor(Math.random()*4)};
}
UI.lwell=function(res){
  const P=player.prog,cur=P.wish&&LB_MODS[P.wish];
  const ore=wlBestOre();
  const btns=WL_THROWS.map(th=>{const can=th.id==='ore'?!!ore:player.money>=th.m;
    const price=th.id==='ore'?(ore?'3× '+ORES[ore].name:'нужно 3 руды Лиловых небес'):fmt(th.m)+' 💰';
    return `<div class="lbRow"><div class="lbIco">${th.id==='ore'?'💎':th.id==='hand'?'💰':'🪙'}</div><div style="flex:1;min-width:0"><b>${th.n}</b><div class="tiny">${th.txt}</div><div class="tiny">Цена: ${price}</div></div>
      <button class="btn small" data-th="${th.id}" ${can?'':'disabled'}>Бросить</button></div>`;}).join('');
  const d=this.build('lwell',`
    <div class="card lilac" style="max-width:520px;width:96vw">
      <h3>🪙 Колодец желаний</h3>
      <p class="tiny">Брось что-нибудь и загадай. Колодец исполнит желание на <b>следующий спуск</b> в шахту Лиловых небес — но у каждого подарка есть цена.</p>
      ${lbCvHtml(300,170,'id="wlCv"')}
      <div class="tiny" id="wlRes" style="text-align:center;min-height:2.6em;margin:4px 0">${cur?'Загадано: <b style="color:'+cur.c+'">'+cur.n+'</b><br>'+lbModTxt(P.wish):'Сейчас ничего не загадано.'}</div>
      <div class="scroll" style="max-height:40vh">${btns}</div>
      <p class="tiny muted">Новое желание заменяет прежнее.</p>
    </div>
    <button class="btn alt" id="wlBack">Выйти</button>`);
  const A={drop:-1,res:null,col:'#b8a0ff'};
  const cv=d.querySelector('#wlCv');lbAnim(cv,(c,t)=>{wlDrawWell(c,300,170,A,t);});
  d.querySelectorAll('[data-th]').forEach(b=>b.onclick=()=>{
    if(A.drop>=0)return;
    const th=WL_THROWS.find(q=>q.id===b.getAttribute('data-th'));
    if(th.id==='ore'){const k=wlBestOre();if(!k)return;player.inv[k]-=3;if(player.inv[k]<=0)delete player.inv[k];A.gem=ORES[k].color;}
    else{if(player.money<th.m)return;player.money-=th.m;A.gem=null;}
    const r=wlRoll(th);A.res=r;A.drop=0;A.kind=th.id;
    d.querySelectorAll('[data-th]').forEach(x=>x.disabled=true);
    SFX.coin();
    setTimeout(()=>{
      if(!d.isConnected)return;
      let txt='';
      if(r.kind==='none'){txt='Монетка утонула. Колодец промолчал.';A.col='#6a6a90';SFX.uiBack();}
      else if(r.kind==='sny'){snyAdd(r.n);txt='Колодец вернул тебе сны: <b>+'+r.n+' 🌙</b>';A.col='#e6c8ff';SFX.win();}
      else{P.wish=r.id;const q=LB_MODS[r.id];A.col=q.c;txt='Загадано: <b style="color:'+q.c+'">'+q.n+'</b><br>'+lbModTxt(r.id);
        if(r.id==='curse')AU.bell(196,1.4,0.08,0,{ratio:1.41,index:2.2});else SFX.win();}
      const el=d.querySelector('#wlRes');if(el)el.innerHTML=txt;
      saveGame();
      setTimeout(()=>{if(UI.modal==='lwell'&&d.isConnected){A.drop=-1;const ore2=wlBestOre();d.querySelectorAll('[data-th]').forEach(x=>{const t2=x.getAttribute('data-th');x.disabled=t2==='ore'?!ore2:player.money<WL_THROWS.find(q=>q.id===t2).m;});}},900);
    },1500);
  });
  d.querySelector('#wlBack').onclick=()=>{SFX.uiBack();UI.close();};
};

/* ============================================================
   ЧАЙНЫЙ ДОМИК: хозяйка-кукла, лавка за Сны, истории, «не та чашка»
   ============================================================ */
const TH_SHOP=[
  {id:'seeds', n:'Пакетик семян',      ic:'🌰',s:2,txt:'Три случайных семени для Оранжереи.'},
  {id:'moon',  n:'Лунное семечко',     ic:'🌙',s:6,txt:'Из него всегда вырастает Лунный цветок.'},
  {id:'tea',   n:'Настой ясности ×2',  ic:'🍵',s:2,txt:'+50 Рассудка, и Пелена 30 секунд не сгущается.'},
  {id:'heal',  n:'Медовый отвар ×2',   ic:'🍯',s:2,txt:'Лечит 40% здоровья.'},
  {id:'eth',   n:'Сонный эликсир',     ic:'💤',s:3,txt:'Полный Эфир и двойное накопление.'},
  {id:'ess',   n:'Флакон эссенции',    ic:'💧',s:4,txt:'Случайная эссенция одного из открытых биомов.'},
  {id:'lan',   n:'Фонарь-якорь',       ic:'🏮',s:5,txt:'Ещё один фонарь, если маяк позволяет (до предела маяка).'},
  {id:'firefly',n:'Светлячок-питомец', ic:'✨',s:8,txt:'Летит рядом в шахте и светит. Живёт в Оранжерее.'}
];
const TH_TALES=[
  'Когда-то в деревне жили люди. Потом они уснули, а сны остались. Я завариваю их в чай — так они не плачут.',
  'Шахтёр до тебя спускался всё глубже, пока Колыбель не запела ему. Его каска до сих пор висит на крючке у двери.',
  'Не смотри долго в Зеркальные топи. Отражение может решить, что настоящий — оно.',
  'Пчёлы Медовых сот служат Королеве, которую никто не видел. Говорят, у неё лицо моей сестры.',
  'В Кукольном городке у каждого дома есть хозяин. Если они улыбаются — значит, ты им понравился. Это плохо.',
  'Розы Розария растут из того, что в них упало. Поэтому они такие красные.',
  'Лунный цветок распускается только от заботы. Это единственное, что здесь растёт от заботы.',
  'Солнце в деревне не заходит. Это луна приходит и закрывает его. Ей нравится на нас смотреть.',
  'Мои чашки все разные. Одна из них помнит, как была человеком. Не бойся, она добрая. Почти всегда.',
  'Сны — это то, что от нас остаётся. Береги свои. Или продай мне — я дам хорошую цену.'
];
const TH_HELLO=['Проходи, садись. Чай как раз заварился.','Ты пахнешь шахтой. И чуть-чуть страхом. Чаю?','Мне приснилось, что ты придёшь. Мне всё снится.'];
const TH_NIGHT=['Тссс. Ночью чашки слушают.','Не оборачивайся. Пей чай.','Ты принёс сны? Дай. Дай. Пожалуйста.'];
UI.lteah=function(tab,say){
  tab=tab||UI._thTab||'shop';UI._thTab=tab;
  const P=player.prog,night=lilNight()>0.5;
  if(!say)say=(night?TH_NIGHT:TH_HELLO)[Math.floor(Math.random()*3)];
  let body='';
  if(tab==='shop'){
    body=`<div class="lbList">`+TH_SHOP.map(q=>{
      if(q.id==='firefly'&&petLv('firefly'))return '';
      const lanBlock=q.id==='lan'&&(!bkLv()||(bkP().own|0)>=bkCap());
      const can=snyN()>=q.s&&!lanBlock;
      return `<div class="lbRow"><div class="lbIco">${q.ic}</div><div style="flex:1;min-width:0"><b>${q.n}</b><div class="tiny">${q.txt}${lanBlock?' <span style="color:#ff9a9a">'+(bkLv()?'Предел маяка.':'Сначала зажги маяк.')+'</span>':''}</div></div>
        <button class="btn small" data-buy="${q.id}" ${can?'':'disabled'}>${q.s} 🌙</button></div>`;}).join('')+`</div>`;
  }else if(tab==='tales'){
    const told=(P.tales|0);
    body=`<p class="tiny">Хозяйка помнит много историй. За каждую новую она дарит тебе <b>1 🌙</b> — «чтобы не забыл».</p>
      <div class="tiny muted">Рассказано: ${Math.min(told,TH_TALES.length)} из ${TH_TALES.length}</div>
      <button class="btn small" id="thTale">${told<TH_TALES.length?'Попросить новую историю':'Послушать ещё раз'}</button>`;
  }else{
    body=`<p class="tiny">Хозяйка ставит три чашки и путает их. Выбери одну. В одних — подарок, в других — проклятие на следующий спуск. Иногда это просто чай.</p>
      ${lbCvHtml(300,150,'id="thCups" style="touch-action:none"')}
      <div class="row" style="justify-content:center;gap:6px;margin-top:6px"><button class="btn small" id="thPour" ${snyN()>=2?'':'disabled'}>Налить · 2 🌙</button></div>
      ${P.cup&&LB_MODS[P.cup]?`<p class="tiny" style="text-align:center">Выпито: <b style="color:${LB_MODS[P.cup].c}">${LB_MODS[P.cup].n}</b> — ${lbModTxt(P.cup)}</p>`:''}`;
  }
  const d=this.build('lteah',`
    <div class="card lilac" style="max-width:540px;width:96vw">
      <h3>🫖 Чайный домик</h3>
      <div class="thTop">${lbCvHtml(130,130,'id="thDoll"')}<div class="thSay" id="thSay">${say}</div></div>
      <div class="tiny" style="text-align:center;margin:4px 0">У тебя: <b style="color:#e6c8ff">${snyN()} 🌙 ${snyWord(snyN())}</b></div>
      <div class="tabs"><button data-t="shop" class="${tab==='shop'?'on':''}">Лавка</button><button data-t="tales" class="${tab==='tales'?'on':''}">Истории</button><button data-t="cups" class="${tab==='cups'?'on':''}">Не та чашка</button></div>
      <div class="scroll" style="max-height:46vh">${body}</div>
    </div>
    <button class="btn alt" id="thBack">Выйти</button>`);
  const D={talk:1.2,tilt:0,mood:0};
  lbAnim(d.querySelector('#thDoll'),(c,t)=>{if(D.talk>0)D.talk-=1/60;thDrawDoll(c,130,130,D,t,night);});
  const sayIt=(txt,mood)=>{const el=d.querySelector('#thSay');if(el)el.textContent=txt;D.talk=Math.min(3.5,0.6+txt.length*0.03);D.mood=mood||0;};
  d.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{SFX.ui();UI.lteah(b.getAttribute('data-t'),' ');});
  d.querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>{
    const q=TH_SHOP.find(z=>z.id===b.getAttribute('data-buy'));if(!q||snyN()<q.s)return;
    if(q.id==='lan'&&(!bkLv()||(bkP().own|0)>=bkCap()))return;
    snySpend(q.s);let got=q.n;
    if(q.id==='seeds'){const s=[];for(let k=0;k<3;k++){const z=GD_SEEDS[Math.floor(Math.random()*5)];addMat(z.s,1);s.push(z.n);}got='семена: '+s.join(', ');}
    else if(q.id==='moon')addMat('lsmoon',1);
    else if(q.id==='tea')addMat('ltea',2);
    else if(q.id==='heal')addMat('lbheal',2);
    else if(q.id==='eth')addMat('lbeth',1);
    else if(q.id==='ess'){const top=clamp(biomeAt(player.prog.lmaxd|0)-10,0,6),e=LIL_ESS[Math.floor(Math.random()*(top+1))];addMat(e[0],1);got=e[1];}
    else if(q.id==='lan')bkP().own=(bkP().own|0)+1;
    else if(q.id==='firefly'){if(!petGive('firefly'))return;}
    SFX.buy();validateSelection();saveGame();UI.lteah('shop','Держи: '+got.toLowerCase()+'. Приходи ещё.');});
  {const b=d.querySelector('#thTale');if(b)b.onclick=()=>{const told=P.tales|0;let i,txt;
    if(told<TH_TALES.length){i=told;P.tales=told+1;snyAdd(1);txt=TH_TALES[i];saveGame();SFX.coin();}
    else{i=Math.floor(Math.random()*TH_TALES.length);txt=TH_TALES[i];}
    UI.lteah('tales',txt);};}
  if(tab==='cups')thCupGame(d,sayIt);
  d.querySelector('#thBack').onclick=()=>{SFX.uiBack();UI.close();};
};
/* «не та чашка»: налить → чашки путаются → выбрать → пар показывает, что внутри */
function thCupGame(d,sayIt){
  const cv=d.querySelector('#thCups'),pour=d.querySelector('#thPour');if(!cv)return;
  const C={ph:'idle',t:0,pos:[0,1,2],from:[0,1,2],sw:0,pick:-1,res:null,swaps:0};
  lbAnim(cv,(c,t)=>{C.t+=1/60;
    if(C.ph==='shuffle'){C.sw+=1/60*3.2;if(C.sw>=1){C.sw=0;C.swaps++;C.from=C.pos.slice();
        if(C.swaps>=7){C.ph='choose';sayIt('Выбирай. Не торопись.',0);}
        else{const a=Math.floor(Math.random()*3),b=(a+1+Math.floor(Math.random()*2))%3;const tmp=C.pos[a];C.pos[a]=C.pos[b];C.pos[b]=tmp;AU.bell(1400+Math.random()*300,0.08,0.03,0,{ratio:2,index:0.3});}}}
    thDrawCups(c,300,150,C,t);});
  if(pour)pour.onclick=()=>{if(C.ph==='shuffle'||C.ph==='choose'||!snySpend(2))return;
    pour.disabled=true;C.ph='shuffle';C.swaps=0;C.sw=0;C.pick=-1;C.res=null;C.from=C.pos.slice();SFX.splash();sayIt('Смотри внимательно...',0);
    const el=d.querySelector('.tiny b[style*="e6c8ff"]');if(el)el.textContent=snyN()+' 🌙 '+snyWord(snyN());};
  cv.addEventListener('pointerdown',(e)=>{if(C.ph!=='choose')return;e.preventDefault();
    const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*300;
    const slot=clamp(Math.floor(x/100),0,2);
    C.pick=C.pos.indexOf(slot);if(C.pick<0)C.pick=slot;C.ph='reveal';C.rt=0;
    const P=player.prog,rr=Math.random();let txt,mood;
    if(rr<0.5){const g=Math.floor(Math.random()*4);C.res='gift';mood=1;
      if(g===0){snyAdd(6);txt='Сладкая чашка! Держи шесть снов.';}
      else if(g===1){addMat('lsmoon',1);txt='На дне — лунное семечко. Посади его.';}
      else if(g===2){P.cup='cupgift';txt='Сладкий чай. Следующий спуск Рассудок 90 секунд не тает.';}
      else{const b=LB_BREWS[1+Math.floor(Math.random()*4)];addMat(b.id,2);txt='В чашке '+b.n.toLowerCase()+', две порции. Бери.';}}
    else if(rr<0.85){C.res='curse';mood=-1;
      if(Math.random()<0.5){P.cup='cupbite';txt='Горько. Ой. Следующий спуск мобы будут злее.';}
      else{P.cup='cupsleep';txt='Сонный чай... Рассудок в следующем спуске будет таять быстрее.';}
      AU.bell(185,1.2,0.07,0,{ratio:1.41,index:2});}
    else{C.res='plain';mood=0;txt='Просто чай. Вкусный, правда?';}
    if(C.res==='gift')SFX.win();else if(C.res==='plain')SFX.splash();
    saveGame();sayIt(txt,mood);
    setTimeout(()=>{if(UI.modal==='lteah'&&d.isConnected){C.ph='idle';if(pour)pour.disabled=snyN()<2;}},1600);});
}

/* ---------- тест-панель ---------- */
function lbCheat(k){
  if(k==='sny'){snyAdd(30);UI.toast('🌙 +30 Снов');}
  else if(k==='grow'){const g=gdP();for(const b of g.beds)if(b){b.d0-=GD_DIG*2;if(b.m===2)b.w=0;}UI.toast('🌱 Грядки созрели (сорняки — тоже)');}
  else if(k==='herbs'){for(const q of GD_SEEDS){addMat(q.h,10);addMat(q.s,3);}for(const b of LB_BREWS)addMat(b.id,3);validateSelection();UI.toast('🌿 Травы, семена и отвары');}
  else if(k==='bk5'){const P=bkP();P.lv=5;P.own=bkCap();validateSelection();UI.toast('🗼 Маяк 5 уровня и все фонари');}
  saveGame();
}
