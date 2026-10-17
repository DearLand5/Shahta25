'use strict';
/* ============================================================
   ЛИЛОВЫЕ НЕБЕСА — СНАРЯЖЕНИЕ ЗАРИ (этап 9)
   кирки XI–XV, клинки и латы 11–15, огнестрел Зари (ур. 12–16) — добавляются в общие
   таблицы PICKS/SWORDS/ARMORS/GUNS с пометкой lil:1; Кузница Зари `UI.lforge`;
   7 предметов (player.prog.lgi), питомцы (player.prog.pets), их работа в шахте.
   Облик — 59-lilac-gear-art.
   ============================================================ */

/* ---------- таблицы ---------- */
const LG_PICK=[['Кирка XI: Росяная',13.2],['Кирка XII: Медовая',16.4],['Кирка XIII: Заводная',20.4],['Кирка XIV: Шипастая',25.4],['Кирка XV: Рассветная',31.6]];
const LG_SWORD=[['Росяная рапира',1000],['Медовое жало',1380],['Фарфоровая сабля',1900],['Шип розы',2600],['Клинок Рассвета',3600]];
/* san — насколько медленнее тает Рассудок в этих латах */
const LG_ARMOR=[['Росяные латы',1800,0.66,0.06],['Медовый панцирь',2150,0.69,0.10],['Фарфоровый доспех',2550,0.72,0.14],['Латы Розария',3000,0.74,0.18],['Доспех Рассвета',3500,0.76,0.24]];
LG_PICK.forEach((q,i)=>PICKS.push({lv:11+i,name:q[0],cost:0,speed:q[1],lil:1}));
LG_SWORD.forEach((q,i)=>SWORDS.push({lv:11+i,name:q[0],cost:0,dmg:q[1],lil:1}));
LG_ARMOR.forEach((q,i)=>ARMORS.push({lv:11+i,name:q[0],cost:0,hp:q[1],red:q[2],heat:0.85,san:q[3],lil:1}));
/* Огнестрел Зари: урон в секунду по одной цели ~4300 → 5800 → 7800 → 10500 → 14000 (продолжает лестницу Ада) */
const LG_GUNS=[
  {lv:12,id:'lpetal', name:'Лепестковый веер',icon:'🌸',kind:'lgpetal', pack:60,packCost:420000, dmg:300, rate:0.35,range:420,speed:520,pellets:5,spread:0.24,color:'#ffb0d8',size:5,kb:0.3,pierce:false,
   desc:'Веер из пяти лепестков. Лепестки кружатся и режут'},
  {lv:13,id:'lbubble',name:'Пузырница',       icon:'🫧',kind:'lgbubble',pack:40,packCost:620000, dmg:2600,rate:0.45,range:400,speed:300,pellets:1,spread:0.02,color:'#bfe8ff',size:11,kb:0.2,pierce:false,
   desc:'Мыльный пузырь ловит моба и держит его в воздухе 1,5 с'},
  {lv:14,id:'lprism', name:'Призма Зари',     icon:'🔆',kind:'lgprism', pack:40,packCost:900000, dmg:2800,rate:0.36,range:560,speed:0,  pellets:1,spread:0,   color:'#fff0b0',size:4,kb:0.8,pierce:true,
   desc:'Луч света, который о первую цель расщепляется на три'},
  {lv:15,id:'lbeegun',name:'Улей-ружьё',      icon:'🐝',kind:'lgbee',   pack:60,packCost:1300000,dmg:1050,rate:0.3, range:520,speed:380,pellets:3,spread:0.5, color:'#ffd040',size:5,kb:0.2,pierce:false,
   desc:'Три пчелы сами находят цель и жалят ядом'},
  {lv:16,id:'lchime', name:'Колокол-гром',    icon:'🔔',kind:'lgchime', pack:40,packCost:1900000,dmg:4200,rate:0.3, range:440,speed:480,pellets:1,spread:0,   color:'#e8dcff',size:10,kb:1.4,pierce:true,
   desc:'Звуковое кольцо растёт на лету и проходит сквозь всех'}
];
for(const g of LG_GUNS){g.cost=0;g.lil=1;GUNS.push(g);GUN_BY_ID[g.id]=g;}
for(let i=0;i<5;i++)ARMOR_LOOK.push(null);   /* облик 11–15 заполняется в 59-lilac-gear-art */

/* цена: c — монеты, m — слитки и эссенции, d — Сны */
const LG_ESS=['eDew','eChime','eHoney','eToy','eRose'];
const LG_ING={
  pick: [{i37:6,i38:4},{i39:6,i40:4},{i43:6,i45:5},{i48:6,i49:5},{i52:6,i55:5}],
  sword:[{i38:6,i37:3},{i41:6,i42:4},{i46:6,i44:3},{i50:6,i51:2},{i53:6,i56:4}],
  armor:[{i37:8,i38:6},{i40:6,i42:6},{i45:8,i47:4},{i48:8,i50:5},{i54:4,i57:6}],
  gun:  [{i38:5,i37:5},{i42:6,i41:4},{i47:5,i44:4},{i51:3,i49:6},{i54:4,i56:6}]
};
/* цены по замеру дохода (lecon.js): комплект уровня ≈ 40 минут копания в биоме, где на него зарабатывают */
const LG_MONEY=[6000000,12000000,23000000,42000000,60000000],LG_KMUL={pick:1,sword:0.9,armor:1.15,gun:1.25},LG_DREAM=[2,4,6,9,12];
function lgCost(kind,i){
  const m=Object.assign({},LG_ING[kind][i]);m[LG_ESS[i]]=(m[LG_ESS[i]]||0)+3+(i>2?1:0);if(i===4)m.eMirror=2;
  return {c:Math.round(LG_MONEY[i]*LG_KMUL[kind]/100000)*100000,m,d:LG_DREAM[i]};
}
function lgCanPay(r){return canPay(r)&&snyN()>=(r.d||0);}
function lgPay(r){if(!lgCanPay(r))return false;pay(r);if(r.d)snySpend(r.d);return true;}
function lgChips(r){return costChips(r)+(r.d?`<span class="${snyN()>=r.d?'':'no'}">🌙 ${r.d}</span>`:'');}
function lgCur(kind){return kind==='pick'?player.pickLvl:kind==='sword'?player.swordLvl:kind==='armor'?player.armorLvl:player.gunLvl;}
/* следующий уровень Зари: кирка/клинок/латы — после X, огнестрел — после Длани Преисподней (ур. 11) */
function lgNext(kind){
  const cur=lgCur(kind),base=kind==='gun'?11:10,i=cur-base;
  if(i<0)return {lock:kind==='gun'?'Сначала Длань Преисподней (огнестрел Ада 11)':'Сначала снаряжение X уровня из Кузницы Ада'};
  if(i>=5)return null;
  return {lv:cur+1,i,r:lgCost(kind,i)};
}
function lgArmorSan(){const a=ARMORS[clamp(player.armorLvl-1,0,ARMORS.length-1)];return a.san||0;}

/* ---------- предметы ---------- */
function lgiP(){const p=player.prog;if(!p.lgi||typeof p.lgi!=='object')p.lgi={};return p.lgi;}
function lgi(id){return (player.prog&&player.prog.lgi&&player.prog.lgi[id])|0;}
const LG_ITEMS=[
  {id:'lamp',  ic:'🏮',n:'Фонарь ясности',max:3,
   cost:lv=>[{c:8000000,m:{i37:6,eDew:2},d:2},{c:20000000,m:{i41:6,eChime:3},d:4},{c:45000000,m:{i45:6,eHoney:4},d:6}][lv],
   desc:lv=>lv?'Свет в Лиловых небесах +'+(lv*20)+'%, в радиусе '+(3+lv*2)+' клеток видно, какая руда — иллюзия'+(lv<3?' → +'+((lv+1)*20)+'%, радиус '+(5+lv*2):''):'Свет в Лиловых небесах +20%, и в радиусе 5 клеток видно, какая руда — иллюзия'},
  {id:'umb',   ic:'☂️',n:'Зонт-планер',max:1,cost:()=>({c:10000000,m:{i38:5,eDew:2},d:3}),
   desc:()=>'Держи прыжок в падении — плавно планируешь и не разбиваешься'},
  {id:'vine',  ic:'🌿',n:'Лоза-перчатка',max:1,cost:()=>({c:25000000,m:{i46:5,eHoney:3,lhthorn:3},d:4}),
   desc:()=>'В прыжке прижмись к стене — лоза держит; джойстик вверх — карабкаешься, прыжок — отталкиваешься'},
  {id:'net',   ic:'🥅',n:'Сачок',max:1,cost:()=>({c:6000000,m:{i39:4},d:2}),
   desc:()=>'«Стрелять»: ловит ослабленного (меньше трети здоровья) или спящего Пушистика, Мотылька, Пчелу или Овечку — они станут питомцами'},
  {id:'shears',ic:'✂️',n:'Ножницы садовника',max:1,cost:()=>({c:40000000,m:{i52:4,eRose:3},d:6}),
   desc:()=>'Растения-мобы получают ×2 урона, шипы и дёрн копаются в 2,5 раза быстрее, сорняк в Оранжерее падает вдвое быстрее, урожай +1'},
  {id:'mbox',  ic:'🎶',n:'Музыкальная шкатулка',max:1,cost:()=>({c:35000000,m:{i50:5,eToy:3},d:5}),
   desc:()=>'«Стрелять»: мелодия усыпляет мобов в 8 клетках на 6 с и даёт +20 Рассудка. Перезарядка 40 с'},
  {id:'mirror',ic:'🪞',n:'Зеркальный щит',max:3,
   cost:lv=>[{c:60000000,m:{i55:5,eMirror:3},d:6},{c:100000000,m:{i57:6,eMirror:4},d:9},{c:160000000,m:{i59:6,eSleep:4},d:12}][lv],
   desc:lv=>'Снаряды мобов отражаются обратно с шансом '+(lv?(10+lv*10)+'%'+(lv<3?' → '+(20+lv*10)+'%':''):'20%')}
];
const LG_ITEM_BY={};for(const it of LG_ITEMS)LG_ITEM_BY[it.id]=it;
IT_CAT_OF.lnet='use';IT_CAT_OF.lmbox='fight';

/* ---------- питомцы ---------- */
const LG_PETS=[
  {id:'bunny',    n:'Пушистик', from:'lbunny',    c:'#e8d8f6',txt:lv=>'Семена находятся в '+(1.5+lv*0.5).toFixed(1).replace('.',',')+' раза чаще, '+(lv*4)+'% шанс найти лишнюю руду'},
  {id:'butterfly',n:'Мотылёк',  from:'lbutterfly',c:'#ffc8e8',txt:lv=>'Раз в '+(26-lv*4)+' с принимает на себя один удар'},
  {id:'bee',      n:'Пчёлка',   from:'lbee',      c:'#ffd040',txt:lv=>'Жалит ближайшего моба: '+Math.round((0.2+lv*0.1)*100)+'% урона меча раз в 1,2 с'},
  {id:'sheep',    n:'Овечка',   from:'lsheep',    c:'#f4eefa',txt:lv=>'Рассудок тает на '+(10+lv*5)+'% медленнее'},
  {id:'firefly',  n:'Светлячок',from:null,        c:'#fff6a0',txt:lv=>'Свет вокруг шахтёра +'+(15+lv*10)+'%'}
];
const LG_PET_BY={};for(const p of LG_PETS)LG_PET_BY[p.id]=p;
function petP(){const p=player.prog;if(!p.pets||typeof p.pets!=='object')p.pets={own:{},act:''};if(!p.pets.own)p.pets.own={};return p.pets;}
function petLv(id){const P=player.prog&&player.prog.pets;return (P&&P.own&&P.own[id])|0;}
/* питомец помогает только в шахте Лиловых небес */
function petAct(id){if(G.dim!==2)return 0;const P=player.prog&&player.prog.pets;return (P&&P.act===id)?petLv(id):0;}
function petGive(id){const P=petP();if(P.own[id])return false;P.own[id]=1;if(!P.act)P.act=id;return true;}
const LG_PET_FEED=[null,{herb:6},{herb:12,moon:1}];
const LG_PET_HERB={bunny:'lhclover',butterfly:'lhpollen',bee:'lhpollen',sheep:'lhmint',firefly:'lhiris'};

/* ---------- множители для других систем ---------- */
function lgLightMul(){if(G.dim!==2)return 1;const f=petAct('firefly');return (1+lgi('lamp')*0.2)*(f?1.15+f*0.1:1);}
function lgSanMul(){const s=petAct('sheep');return (1-lgArmorSan())*(s?0.9-s*0.05:1);}
const LG_PLANT={ldaisy:1,lrosehound:1,lgardener:1,lfairy:1,lmimic:1};
function lgDmgVs(m){return (lgi('shears')&&LG_PLANT[m.def.id])?2:1;}
function lgDigMul(t){return (lgi('shears')&&(t===T_LTHORN||t===T_LSOD))?2.5:1;}

/* ---------- выстрел огнестрелом Зари: особые снаряды ---------- */
/* вызывается из fireGun: true — выстрел обработан здесь целиком */
function lgFire(g,sx,sy,base,tgt,dm){
  if(g.kind!=='lgprism')return false;
  /* луч до первой цели или стены, там расщепляется на три */
  const ray=(x0,y0,a,L,skip)=>{let l=0,hit=null;
    while(l<L){const x=x0+Math.cos(a)*l,y=y0+Math.sin(a)*l;if(solidAtPx(x,y))break;
      for(const m of mobs){if(!m.alive||m.untargetable||skip.has(m))continue;if(m.def.hb?hbDistToMob(m,x,y)<8:Math.hypot(m.x-x,(m.y-m.h*0.5)-y)<m.w*0.5+6){hit=m;break;}}
      if(hit)break;l+=8;}
    return {x:x0+Math.cos(a)*l,y:y0+Math.sin(a)*l,m:hit};};
  const r=ray(sx,sy,base,g.range,new Set());
  pBeams.push({pts:[[sx,sy],[r.x,r.y]],t:0.22,col:'#fff6c8',w:5});
  if(r.m){hitMobGun(r.m,g.dmg*dm,Math.sign(Math.cos(base)),g);
    const sk=new Set([r.m]),cols=['#ffb0d8','#b0e8ff','#d8ffb0'];
    for(let k=-1;k<=1;k++){const a=base+k*0.42,q=ray(r.x,r.y,a,260,sk);pBeams.push({pts:[[r.x,r.y],[q.x,q.y]],t:0.22,col:cols[k+1],w:3});
      if(q.m){sk.add(q.m);hitMobGun(q.m,g.dmg*0.5*dm,Math.sign(Math.cos(a)),g);}}
    for(let i=0;i<10;i++)spawnPart(r.x,r.y,rnd(-140,140),rnd(-140,140),0.4,['#ffb0d8','#b0e8ff','#fff0b0'][i%3],2.4,0);}
  return true;
}
/* дополнительные свойства снаряда при выстреле */
function lgShotSetup(pr,g){
  if(!g.kind||g.kind.charCodeAt(0)!==108)return;
  pr.lgk=g.kind;
  if(g.kind==='lgpetal'){pr.wob=rnd(0,TAU);pr.spin=rnd(-8,8);}
  else if(g.kind==='lgbubble'){pr.size=g.size;}
  else if(g.kind==='lgbee'){pr.homeMob=5;pr.life=2.4;pr.noTrail=1;}
  else if(g.kind==='lgchime'){pr.size=8;}
}
/* каждый кадр полёта */
function lgProjTick(p,dt){
  if(p.lgk==='lgpetal'){p.wob+=dt*12;const s=Math.hypot(p.vx,p.vy),a=Math.atan2(p.vy,p.vx)+Math.sin(p.wob)*dt*2.4;p.vx=Math.cos(a)*s;p.vy=Math.sin(a)*s;}
  else if(p.lgk==='lgbubble'){p.vx*=Math.pow(0.6,dt);p.vy=p.vy*Math.pow(0.6,dt)-30*dt;}
  else if(p.lgk==='lgchime'){p.size=Math.min(30,p.size+dt*42);}
}
/* попадание: эффекты по виду снаряда */
function lgOnHit(m,dmg,k){
  if(k==='lgbubble'&&!m.def.boss&&!m.def.hb){m.lgBub=1.5;m.stun=Math.max(m.stun||0,1.5);}
  else if(k==='lgbee'){m.poison=Math.max(m.poison||0,4);m.poisonDps=Math.max(m.poisonDps||0,dmg*0.18);}
}

/* ---------- такт в шахте: предметы, питомцы ---------- */
const LGS={netT:0,netCd:0,mboxCd:0,mirT:0,cling:0,glide:0,petShT:0,beeT:0,notes:[],pet:null,stings:[]};
function lgTick(dt){
  if(LGS.netT>0)LGS.netT-=dt;if(LGS.netCd>0)LGS.netCd-=dt;if(LGS.mboxCd>0)LGS.mboxCd-=dt;if(LGS.mirT>0)LGS.mirT-=dt;
  if(LGS.glide>0)LGS.glide-=dt;if(LGS.cling>0)LGS.cling-=dt;
  for(let i=LGS.notes.length-1;i>=0;i--){const n=LGS.notes[i];n.t+=dt;n.x+=n.vx*dt;n.y+=n.vy*dt;if(n.t>n.L)LGS.notes.splice(i,1);}
  for(let i=LGS.stings.length-1;i>=0;i--){LGS.stings[i].t-=dt;if(LGS.stings[i].t<=0)LGS.stings.splice(i,1);}
  /* пузырь Пузырницы держит моба в воздухе */
  for(const m of mobs){if(m.lgBub>0){m.lgBub-=dt;m.vy=-40;m.vx*=0.8;}}
  if(G.dim!==2||G.scene!=='mine'){LGS.pet=null;return;}
  /* питомец летит за шахтёром */
  const P=player.prog&&player.prog.pets,act=P&&P.act&&petLv(P.act)?P.act:'';
  if(!act){LGS.pet=null;}
  else{if(!LGS.pet||LGS.pet.id!==act)LGS.pet={id:act,x:player.x-30,y:player.y-60,vx:0,vy:0,t:0,face:1,hop:0};
    const q=LGS.pet;q.t+=dt;
    const tx=player.x-player.facing*30,ty=player.y-(act==='bunny'||act==='sheep'?6:58)+Math.sin(q.t*2.4)*4;
    const k=act==='bunny'||act==='sheep'?6:4;q.vx+=((tx-q.x)*k-q.vx*3)*dt;q.vy+=((ty-q.y)*k-q.vy*3)*dt;
    if(Math.hypot(tx-q.x,ty-q.y)>420){q.x=tx;q.y=ty;q.vx=q.vy=0;}
    q.x+=q.vx*dt;q.y+=q.vy*dt;if(Math.abs(q.vx)>8)q.face=q.vx>0?1:-1;
    if(act==='bunny'||act==='sheep')q.hop=Math.abs(q.vx)>20?Math.abs(Math.sin(q.t*9))*8:0;
  }
  /* пчёлка жалит */
  const bl=petAct('bee');
  if(bl&&LGS.pet){LGS.beeT-=dt;if(LGS.beeT<=0){LGS.beeT=1.2;let best=null,bd=230;
    for(const m of mobs){if(!m.alive||m.untargetable||m.hidden||m.def.neutral)continue;const d=Math.hypot(m.x-LGS.pet.x,m.y-m.h*0.5-LGS.pet.y);if(d<bd){bd=d;best=m;}}
    if(best){damageMob(best,Math.round(swordDmg()*(0.2+bl*0.1)),0,{x:LGS.pet.x});LGS.stings.push({x0:LGS.pet.x,y0:LGS.pet.y,x1:best.x,y1:best.y-best.h*0.5,t:0.18});}}}
  /* мотылёк копит щит */
  const fl=petAct('butterfly');if(fl&&LGS.petShT>0)LGS.petShT-=dt;
}
/* удар по шахтёру в Лиловых небесах: щит мотылька */
function lgHurt(dmg){
  const fl=petAct('butterfly');
  if(fl&&LGS.petShT<=0&&dmg>0){LGS.petShT=26-fl*4;floatText(player.x,player.y-80,'Мотылёк принял удар','#ffc8e8');burst(player.x,player.y-30,16,'#ffc8e8',140,2.4);return 0;}
  return dmg;
}
/* копание: кролик находит лишнюю руду и семена */
function lgDugBonus(oreId,mx,my){
  const b=petAct('bunny');if(!b)return;
  if(oreId&&Math.random()<b*0.04){addOre(oreId,1);floatText(mx,my-46,'Пушистик нашёл ещё +1','#e8d8f6');}
}
function lgSeedMul(){const b=petAct('bunny');return b?1.5+b*0.5:1;}

/* зонт и лоза: вызывается из физики шахтёра до прыжка */
function lgMoveTick(dt,ax,wantJump,stunned,onLadder,grappling,inLiq){
  if(G.dim!==2||stunned||onLadder||grappling||inLiq||player.onGround)return;
  /* лоза: прижался к стене в прыжке */
  if(lgi('vine')&&ax!==0){
    const dir=ax>0?1:-1,tx=Math.floor((player.x+dir*(player.w*0.5+3))/TILE),ty=Math.floor((player.y-player.h*0.5)/TILE);
    if(isSolid(tx,ty)||isSolid(tx,ty-1)){
      const j=Input.joy,up=(j.active&&j.dy<-0.35)||Input.keys['KeyW']||Input.keys['ArrowUp'];
      player.vy=up?-120:Math.min(player.vy,35);player.peakY=player.y;LGS.cling=0.12;LGS.clingDir=dir;
      if(wantJump){player.vy=-470;player.vx=-dir*230;SFX.jump();LGS.cling=0;}
      return;}
  }
  /* зонт: держишь прыжок в падении */
  if(lgi('umb')&&player.vy>0){const hold=Input.jumpPtr!==null||Input.keys['Space'];
    if(hold){player.vy=Math.min(player.vy,95);player.peakY=player.y;LGS.glide=0.12;}}
}

/* ---------- предметы «Стрелять» ---------- */
function lgUse(it,hold){
  if(it==='lnet'){if(!hold)lgNet();return true;}
  if(it==='lmbox'){if(!hold)lgMusic();return true;}
  return false;
}
function lgNet(){
  if(LGS.netCd>0)return;
  LGS.netT=0.35;LGS.netCd=0.8;SFX.swing();
  const fx=player.x+player.facing*40,fy=player.y-player.h*0.5;
  let best=null,bd=70;
  for(const m of mobs){if(!m.alive||!m.def.lm)continue;const d=Math.hypot(m.x-fx,(m.y-m.h*0.5)-fy);if(d<bd+m.w*0.3){bd=d;best=m;}}
  if(!best)return;
  const pet=LG_PETS.find(p=>p.from===best.def.id);
  if(!pet){floatText(best.x,best.y-best.h-20,'Не ловится','#c8b0ff');return;}
  if(!(best.sleepT>0)&&best.hp>best.maxHp*0.34){floatText(best.x,best.y-best.h-20,'Сначала ослабь или усыпи','#ffb0c8');SFX.uiBack();return;}
  best.alive=false;mobs.splice(mobs.indexOf(best),1);
  burst(best.x,best.y-best.h*0.5,24,pet.c,160,2.8);AU.bell(1175,0.6,0.07,0,{ratio:2.01,index:0.7,rev:0.5});vib(30);
  if(petGive(pet.id)){UI.toast('🥅 Пойман новый питомец: '+pet.n+'! Он в Оранжерее');}
  else{const n=snyAdd(1,best.x,best.y-best.h-30);addMat(LG_PET_HERB[pet.id],2);floatText(best.x,best.y-best.h-50,'+2 травы'+(n?'':''),'#c8f0c0');}
  saveGame();
}
function lgMusic(){
  if(LGS.mboxCd>0){floatText(player.x,player.y-64,'Шкатулка заводится: '+Math.ceil(LGS.mboxCd)+' с','#d8c0ff');return;}
  LGS.mboxCd=40;let n=0;
  for(const m of mobs){if(!m.alive||m.def.boss||m.def.hb)continue;if(Math.hypot(m.x-player.x,m.y-player.y)<8*TILE){m.sleepT=6;m.stun=6;m.sleepHit=0;m.tele=0;n++;}}
  player.sanity=Math.min(100,(player.sanity==null?100:player.sanity)+20);
  [659,784,880,988,784,659].forEach((f,i)=>AU.bell(f,0.9,0.05,i*0.16,{ratio:3.01,index:0.4,rev:0.6}));
  for(let i=0;i<10;i++)LGS.notes.push({x:player.x+rnd(-20,20),y:player.y-40,vx:rnd(-60,60),vy:rnd(-80,-40),t:0,L:rnd(1.2,2),c:['#ffd0f0','#d8c0ff','#fff0b0'][i%3]});
  floatText(player.x,player.y-70,'🎶 Колыбельная · '+n,'#e6c8ff');
}
/* зеркальный щит: снаряд моба отражается обратно */
function lgReflect(p){
  const L=lgi('mirror');if(!L||Math.random()>=0.1+L*0.1)return false;
  p.owner='player';p.vx=-p.vx*1.3;p.vy=-p.vy*1.3;p.dmg=Math.round(swordDmg()*1.5);p.onEnd=null;p.gun=true;p.life=Math.max(p.life,1.2);p.x+=p.vx*0.03;p.y+=p.vy*0.03;
  LGS.mirT=0.3;AU.bell(1568,0.35,0.05,0,{ratio:2.01,index:0.5});floatText(player.x,player.y-74,'Отражено!','#c8e8ff');
  return true;
}

/* ---------- списки предметов и быстрые слоты ---------- */
function lgShootItems(a){
  if(lgi('net'))a.push({id:'lnet',icon:'🥅',name:'Сачок',count:1,desc:LG_ITEM_BY.net.desc(1)});
  if(lgi('mbox'))a.push({id:'lmbox',icon:'🎶',name:'Музыкальная шкатулка',count:1,desc:LG_ITEM_BY.mbox.desc(1)});
}
function lgQsMeta(id){
  const b=LB_BY[id];if(b)return {n:matN(id),icon:b.ic,name:b.n};
  if(id==='lnet')return {n:lgi('net'),icon:'🥅',name:'Сачок'};
  if(id==='lmbox')return {n:lgi('mbox'),icon:'🎶',name:'Шкатулка'};
  return null;
}

/* ============================================================
   КУЗНИЦА ЗАРИ
   ============================================================ */
const LG_KIND=[['pick','⛏','Кирка',PICKS],['sword','⚔️','Клинок',SWORDS],['armor','🛡','Латы',ARMORS],['gun','🔫','Огнестрел',GUNS]];
function lgStat(kind,c,n){
  if(kind==='pick')return 'Скорость ×'+(c?c.speed.toFixed(1):'1')+' → ×'+n.speed.toFixed(1)+'<br>Откроет: '+oreUnlockText(n.lv);
  if(kind==='sword')return 'Урон '+(c?c.dmg:0)+' → '+n.dmg;
  if(kind==='armor')return 'HP '+(c?c.hp:0)+' → '+n.hp+' · защита '+Math.round(n.red*100)+'% · Рассудок тает на '+Math.round(n.san*100)+'% медленнее';
  return n.desc+' · урон '+n.dmg+(n.pellets>1?'×'+n.pellets:'');
}
UI.lforge=function(tab){
  tab=tab||UI._lgTab||'gear';UI._lgTab=tab;
  let body='';
  if(tab==='gear'){
    body=LG_KIND.map(([kind,ic,label,arr])=>{
      const cur=lgCur(kind),c=kind==='gun'?curGun():arr[clamp(cur-1,0,arr.length-1)],n=lgNext(kind);
      if(!n)return `<div class="lgRow">${lbCvHtml(56,56,'data-prev="'+kind+':'+cur+'"')}<div class="txt"><b>${label}: ${c?c.name:'—'}</b><div class="tiny">Выковано лучшее снаряжение Зари</div></div><span class="tiny">MAX</span></div>`;
      if(n.lock)return `<div class="lgRow locked">${lbCvHtml(56,56,'data-prev="'+kind+':'+(kind==='gun'?12:11)+'"')}<div class="txt"><b>${label} Зари</b><div class="tiny" style="color:#ffb0b0">${n.lock}</div></div></div>`;
      const nx=arr.find(q=>q.lv===n.lv);
      return `<div class="lgRow">${lbCvHtml(56,56,'data-prev="'+kind+':'+n.lv+'"')}<div class="txt"><b>${nx.name}</b><div class="tiny">${lgStat(kind,c,nx)}</div><div class="cost">${lgChips(n.r)}</div></div>
        <button class="btn small" data-lg="${kind}" ${lgCanPay(n.r)?'':'disabled'}>Ковать</button></div>`;}).join('')
      +`<p class="tiny muted" style="margin-top:6px">Снаряжение Зари куётся из слитков руды Лиловых небес (Перегонный куб), эссенций и Снов. Кирка XI открывает руду 11-го уровня и так далее.</p>`;
  }else if(tab==='items'){
    body=LG_ITEMS.map(it=>{const lv=lgi(it.id),max=lv>=it.max,r=max?null:it.cost(lv);
      return `<div class="lgRow">${lbCvHtml(56,56,'data-iprev="'+it.id+'"')}<div class="txt"><b>${it.n}${it.max>1?' · '+lv+'/'+it.max:''}</b><div class="tiny">${it.desc(lv)}</div>${r?`<div class="cost">${lgChips(r)}</div>`:''}</div>
        ${max?'<span class="pill" style="background:rgba(120,255,160,.15);color:#7dffb0">✓</span>':`<button class="btn small" data-li="${it.id}" ${lgCanPay(r)?'':'disabled'}>${lv?'Улучшить':'Создать'}</button>`}</div>`;}).join('');
  }
  const d=this.build('lforge2',`
    <div class="card lilac" style="max-width:580px;width:96vw">
      <h3>☀ Кузница Зари</h3>
      <div class="bal"><span>Мастера Зари</span><b style="color:#ffd98a">${fmt(player.money)} 💰 · <span style="color:#e6c8ff">${snyN()} 🌙</span></b></div>
      <div class="tabs"><button data-t="gear" class="${tab==='gear'?'on':''}">Снаряжение</button><button data-t="items" class="${tab==='items'?'on':''}">Предметы</button><button data-t="hell">Прокачки и лавка</button></div>
      <div class="scroll" style="max-height:60vh">${body}</div>
    </div>
    <button class="btn alt" id="lgBack">Выйти</button>`);
  d.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{SFX.ui();const t=b.getAttribute('data-t');if(t==='hell')UI.hforge(UI._hgTab==='gear'||!UI._hgTab?'upg':UI._hgTab);else UI.lforge(t);});
  const done=(msg)=>{SFX.buy();SFX.boom();vib(50);AU.bell(1319,1,0.06,0,{ratio:2.01,index:0.8,rev:0.6});UI.toast(msg);recomputeStats();validateSelection();saveGame();UI.lforge();};
  d.querySelectorAll('[data-lg]').forEach(b=>b.onclick=()=>{
    const kind=b.getAttribute('data-lg'),n=lgNext(kind);if(!n||n.lock||!lgPay(n.r)){UI.toast('Не хватает');return;}
    if(kind==='pick')player.pickLvl=n.lv;else if(kind==='sword')player.swordLvl=n.lv;else if(kind==='armor'){player.armorLvl=n.lv;recomputeStats();player.hp=player.maxHp;}
    else{player.gunLvl=n.lv;player.gunAmmo+=GUNS[n.lv-1].pack;}
    done('☀ Выковано: '+(kind==='pick'?PICKS:kind==='sword'?SWORDS:kind==='armor'?ARMORS:GUNS)[n.lv-1].name);});
  d.querySelectorAll('[data-li]').forEach(b=>b.onclick=()=>{const it=LG_ITEM_BY[b.getAttribute('data-li')],lv=lgi(it.id);if(lv>=it.max||!lgPay(it.cost(lv)))return;
    lgiP()[it.id]=lv+1;done(it.ic+' '+it.n+(it.max>1?' ур. '+(lv+1):''));});
  d.querySelector('#lgBack').onclick=()=>{SFX.uiBack();UI.close();};
  d.querySelectorAll('canvas[data-prev]').forEach(cv=>{const [k,l]=cv.getAttribute('data-prev').split(':');lbAnim(cv,(c,t)=>lgPreview(c,56,56,k,+l,t));});
  d.querySelectorAll('canvas[data-iprev]').forEach(cv=>{const id=cv.getAttribute('data-iprev');lbAnim(cv,(c,t)=>lgItemPreview(c,56,56,id,t));});
};

/* ---------- Оранжерея: вкладка «Питомцы» ---------- */
function gdPetsHtml(){
  const P=petP();
  return `<p class="tiny">Питомцы ловятся Сачком в шахте (кроме Светлячка — его продаёт хозяйка Чайного домика). С собой можно взять одного. Корми травами — станет сильнее.</p><div class="lbList">`+LG_PETS.map(p=>{
    const lv=P.own[p.id]|0,herb=LG_PET_HERB[p.id],feed=lv&&lv<3?LG_PET_FEED[lv]:null,hq=GD_SEEDS.find(s=>s.h===herb);
    const can=feed&&matN(herb)>=feed.herb&&(!feed.moon||matN('lhmoon')>=feed.moon);
    return `<div class="lgRow ${lv?'':'locked'}">${lbCvHtml(56,56,'data-pet="'+p.id+'"')}<div class="txt"><b>${p.n}${lv?' · ур. '+lv:''}</b>
      <div class="tiny">${lv?p.txt(lv):(p.from?'Поймай Сачком: '+MOBDEFS.find(m=>m.id===p.from).name:'Продаётся в Чайном домике')}</div>
      ${feed?`<div class="tiny">Корм: ${feed.herb}× ${hq.n}${feed.moon?' + Лунный цветок':''} (есть ${matN(herb)})</div>`:''}</div>
      <div style="display:flex;flex-direction:column;gap:4px">${lv?`<button class="btn small ${P.act===p.id?'cheatOn':'alt'}" data-pact="${p.id}">${P.act===p.id?'С тобой':'Взять'}</button>`:''}
      ${feed?`<button class="btn small" data-pfeed="${p.id}" ${can?'':'disabled'}>Покормить</button>`:''}</div></div>`;}).join('')+`</div>`;
}
function gdPetsBind(d){
  const P=petP();
  d.querySelectorAll('[data-pact]').forEach(b=>b.onclick=()=>{const id=b.getAttribute('data-pact');P.act=P.act===id?'':id;SFX.ui();saveGame();UI.lgarden('pets');});
  d.querySelectorAll('[data-pfeed]').forEach(b=>b.onclick=()=>{const id=b.getAttribute('data-pfeed'),lv=P.own[id]|0,f=LG_PET_FEED[lv],h=LG_PET_HERB[id];
    if(!f||matN(h)<f.herb||(f.moon&&matN('lhmoon')<f.moon))return;
    player.mats[h]-=f.herb;if(player.mats[h]<=0)delete player.mats[h];if(f.moon){player.mats.lhmoon-=f.moon;if(player.mats.lhmoon<=0)delete player.mats.lhmoon;}
    P.own[id]=lv+1;SFX.buy();AU.bell(1047,0.8,0.06,0,{ratio:2.01,index:0.7,rev:0.5});UI.toast(LG_PET_BY[id].n+': уровень '+(lv+1));saveGame();UI.lgarden('pets');});
  d.querySelectorAll('canvas[data-pet]').forEach(cv=>{const id=cv.getAttribute('data-pet');lbAnim(cv,(c,t)=>{c.clearRect(0,0,56,56);const bg=c.createRadialGradient(28,26,4,28,28,30);bg.addColorStop(0,'#3a2a52');bg.addColorStop(1,'#1a1226');c.fillStyle=bg;c.fillRect(0,0,56,56);
    c.save();c.translate(28,34);c.scale(1.5,1.5);lgPetArt(c,id,t,1,0,petLv(id)?1:0.35);c.restore();});});
}

/* ---------- тест-панель ---------- */
function lgCheat(k){
  if(k==='max'){player.pickLvl=15;player.swordLvl=15;player.armorLvl=15;player.gunLvl=GUNS.length;player.gunAmmo+=400;recomputeStats();player.hp=player.maxHp;
    const I=lgiP();for(const it of LG_ITEMS)I[it.id]=it.max;const P=petP();for(const p of LG_PETS)P.own[p.id]=3;if(!P.act)P.act='bee';validateSelection();UI.toast('☀ Всё снаряжение Зари, предметы и питомцы');}
  else if(k==='mats'){for(let o=37;o<=61;o++)addMat('i'+o,30);for(const e of LIL_ESS)addMat(e[0],20);snyAdd(60);UI.toast('▰ Слитки, эссенции и Сны');}
  saveGame();
}
