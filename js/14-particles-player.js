'use strict';
/* ============================================================
   PARTICLES
   ============================================================ */
const parts=[];
const floats=[];
let partBudget=260;
function spawnPart(x,y,vx,vy,life,color,size,grav){
  if(parts.length>partBudget)return;
  parts.push({x,y,vx,vy,life,max:life,color,size,grav:grav===undefined?380:grav});
}
function burst(x,y,n,color,spd,size){
  const q=settings.quality==='low'?Math.ceil(n/2):n;
  for(let i=0;i<q;i++){
    const a=Math.random()*TAU,s=rnd(spd*0.3,spd);
    spawnPart(x,y,Math.cos(a)*s,Math.sin(a)*s,rnd(0.3,0.75),color,rnd(1.5,size||3.4));
  }
}
function floatText(x,y,text,color){
  if(floats.length>40)floats.shift();
  floats.push({x,y,text,color:color||'#fff',life:1.0,vy:-42});
}
function shake(v){G.shake=Math.min(16,G.shake+v);}

/* ============================================================
   PLAYER
   ============================================================ */
const player={
  x:0,y:0,vx:0,vy:0,w:20,h:44,
  onGround:false,facing:1,
  hp:100,maxHp:100,
  money:0,inv:{},slots:8,
  pickLvl:1,digSpeed:1,digSpeedLvl:0,digRadius:0,
  swordLvl:1,armorLvl:1,
  ladders:20,
  drills:0,
  drillLvl:1,
  drillBought:false,
  barricades:0,
  barricadeLvl:1,
  barricadeBought:false,
  prog:{},souls:0,perks:{},icePotions:0,gasMask:false,contracts:null,heat:0,stackLvl:0,mats:{},furn:{q:[],lvl:0,ts:0},hitems:{},relics:{},relEq:[],rit:{},altarXp:0,soulBuy:0,wingT:0,stats:{},bestiary:{},
  gunLvl:0,
  gunAmmo:0,
  grappleUnlocked:false,
  grappleAmmo:0,
  torchLvl:0,
  potions:0,
  potionCd:0,
  fallProtLvl:0,
  anim:0,animState:'idle',
  atkCd:0,atkAnim:0,hurtCd:0,
  digProg:0,digTileX:-1,digTileY:-1,digSwing:0,
  fx:{poison:0,burn:0,slow:0,stun:0},blind:0,lightBuff:0,gunCd:0,gunAnim:0,air:1,
  stepT:0,lavaT:0,peakY:0,
  onLadder:false,ladderCd:0,
  maxDepth:0
};
const PLAYER_DEFAULTS=JSON.parse(JSON.stringify(player));
function invCount(){let n=0;for(const k in player.inv)if(player.inv[k]>0)n++;return n;}
function invValue(){let v=0;for(const k in player.inv)v+=player.inv[k]*orePrice(k);return v;}
/* Рюкзак: слоты — сколько видов руды, стопка — сколько штук одного вида.
   Лишнее не теряется, но уходит скупщику за полцены — поэтому вместимость важна. */
function stackCap(){const l=player.stackLvl||0;return 40+20*Math.min(8,l)+40*Math.max(0,l-8);}
let _fullMsgT=0;
function addOre(id,n){
  n=n||1;
  if(player.stats)player.stats.ore=(player.stats.ore||0)+n;
  if(G.dim===1&&ORES[id]&&ORES[id].dim===1&&typeof contractEvent==='function')contractEvent('ore',id,n);
  if(G.dim===2&&ORES[id]&&ORES[id].dim===2&&typeof lcontractEvent==='function')lcontractEvent('ore',id,n);
  if(cheats.god){player.inv[id]=(player.inv[id]||0)+n;return true;}
  const half=(k,q)=>Math.floor(q*ORES[k].price*0.5);
  if(!player.inv[id]&&invCount()>=player.slots){
    let cheapest=null;
    for(const k in player.inv){if(player.inv[k]>0&&(cheapest===null||ORES[k].price<ORES[cheapest].price))cheapest=k;}
    if(cheapest!==null&&ORES[id].price>ORES[cheapest].price){
      const q=player.inv[cheapest],gain=half(cheapest,q);
      player.money+=gain;delete player.inv[cheapest];
      floatText(player.x,player.y-60,'Рюкзак полон: '+ORES[cheapest].name+' ×'+q+' за ½ цены (+'+fmt(gain)+')','#ffb070');
    }else{
      const gain=half(id,n);player.money+=gain;
      if(G.time-_fullMsgT>1.2){_fullMsgT=G.time;floatText(player.x,player.y-60,'Рюкзак полон · ½ цены +'+fmt(gain)+' 💰','#ffb070');}
      return true;
    }
  }
  const cap=stackCap(),have=player.inv[id]||0,put=Math.max(0,Math.min(cap-have,n));
  if(put>0)player.inv[id]=have+put;
  const over=n-put;
  if(over>0){const gain=half(id,over);player.money+=gain;
    if(G.time-_fullMsgT>1.2){_fullMsgT=G.time;floatText(player.x,player.y-60,'Стопка полна ('+cap+') · ½ цены +'+fmt(gain)+' 💰','#ffb070');}}
  return true;
}
function totalOre(){let n=0;for(const k in player.inv)n+=player.inv[k];return n;}
function recomputeStats(){
  const a=ARMORS[clamp(player.armorLvl-1,0,ARMORS.length-1)];
  player.maxHp=Math.round(a.hp*(1+0.06*perkLv('vigor'))*(ritOn('blood')?0.75:1));
  player.hp=Math.min(player.hp,player.maxHp);
}
function dmgReduction(){return ARMORS[clamp(player.armorLvl-1,0,ARMORS.length-1)].red;}
function swordDmg(){return Math.round(SWORDS[clamp(player.swordLvl-1,0,SWORDS.length-1)].dmg*(1+0.08*perkLv('fury')));}
function perkLv(id){return (player.perks&&player.perks[id])||0;}
function orePrice(k){return Math.round(ORES[k].price*(1+0.06*perkLv('greed'))*(relicOn('coin')?1.12:1)*(ritOn('greed')?1.3:1));}
function satMult(k){if(!ORES[k]||!ORES[k].dim)return 1;const sv=(G.wf&&G.wf.sat&&G.wf.sat[k])||0;return 1/(1+sv/SAT_ORE);}
function pickSpeed(){return PICKS[clamp(player.pickLvl-1,0,PICKS.length-1)].speed;}

function moveX(e,dx){
  if(e===player && cheats.noclip){ e.x+=dx; return false; }
  e.x+=dx;
  const l=Math.floor((e.x-e.w/2)/TILE),r=Math.floor((e.x+e.w/2-0.01)/TILE);
  const t=Math.floor((e.y-e.h+0.01)/TILE),b=Math.floor((e.y-0.01)/TILE);
  for(let ty=t;ty<=b;ty++)for(let tx=l;tx<=r;tx++){
    if(isSolid(tx,ty)){
      if(dx>0)e.x=tx*TILE-e.w/2-0.01;
      else if(dx<0)e.x=(tx+1)*TILE+e.w/2+0.01;
      e.vx=0;return true;
    }
  }
  return false;
}
function moveY(e,dy){
  if(e===player && cheats.noclip){ e.y+=dy; return false; }
  e.y+=dy;
  const l=Math.floor((e.x-e.w/2+0.01)/TILE),r=Math.floor((e.x+e.w/2-0.01)/TILE);
  const t=Math.floor((e.y-e.h+0.01)/TILE),b=Math.floor((e.y-0.01)/TILE);
  for(let ty=t;ty<=b;ty++)for(let tx=l;tx<=r;tx++){
    if(isSolid(tx,ty)){
      if(dy>0){
        e.y=ty*TILE-0.01;
        const wasAir=!e.onGround;
        e.onGround=true;
        if(e===player&&wasAir&&e.peakY!==undefined){const fd=e.y-e.peakY;if(fd>2.2*TILE)SFX.land(clamp(fd/(8*TILE),0.25,1));}
        if(e===player && !cheats.noFall && !cheats.god){
          const fallDist=e.y-e.peakY;
          const freePx=5*TILE;
          if(fallDist>freePx){
            const extraTiles=(fallDist-freePx)/TILE;
            const reduction=[1,0.8,0.6,0.4][clamp(player.fallProtLvl,0,3)];
            hurtPlayer(Math.max(1,Math.floor(extraTiles*4*reduction)),'падение');
          }
        }
      }else if(dy<0){e.y=(ty+1)*TILE+e.h+0.01;}
      e.vy=0;return true;
    }
  }
  return false;
}
function trackFall(e){
  if(e.onGround)e.peakY=e.y;
  else if(e.y<e.peakY)e.peakY=e.y;
}
function playerOnLadder(){
  const x0=Math.floor((player.x-player.w/2+2)/TILE);
  const x1=Math.floor((player.x+player.w/2-2)/TILE);
  const y0=Math.floor((player.y-player.h+4)/TILE);
  const y1=Math.floor((player.y-2)/TILE);
  for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){
    if(getTile(tx,ty)===T_LADDER)return true;
  }
  return false;
}
/* Опасности среды бьют долей от максимума HP (иначе с прокачкой лава и дожди не ощущаются),
   а броня от них защищает лишь наполовину. В Аду урон всех врагов растёт с глубиной биома. */
const HAZ_PCT={'лава':0.03,'кислота':0.022,'огонь':0.02,'ядовитый газ':0.012,'раскалённый камень':0.008,'гейзер':0.05,'ядовитый гейзер':0.04,'костяные шипы':0.03,
  'взрыв серы':0.07,'пепельная молния':0.06,'огненный дождь':0.055,'метеор':0.055,'ожог':0.01,'шипы':0.02};
const ENV_SRC=new Set(Object.keys(HAZ_PCT).concat(['кровавый дождь','кислотный дождь','огненный смерч','перегрев']));
const HELL_THREAT=[1,1,1,1,1,1,1.12,1.25,1.5,1.5];
function hellThreat(){if(G.dim!==1)return 1;return HELL_THREAT[clamp(biomeAt(Math.max(0,player.y)/TILE),0,9)]||1;}
function hurtPlayer(dmg,src,fx){
  if(cheats.god||G.bossCut)return;
  const env=ENV_SRC.has(src);
  if(HAZ_PCT[src]&&!(src==='метеор'&&G.dim!==1))dmg+=player.maxHp*HAZ_PCT[src]*(G.dim===1?1:0.6);
  if(!env&&src!=='падение'&&src!=='своя бомба'&&src!=='чит')dmg*=hellThreat();
  if(ashEv&&ashEv.id==='bloodmoon'&&G.dim===1)dmg*=1.25;
  if(player.dashI>0&&!env){if(!player._dodgeT||G.time-player._dodgeT>0.4){player._dodgeT=G.time;floatText(player.x,player.y-player.h-30,'Уклон!','#cfe8ff');}return;}
  if(G.bf&&G.bf.enr&&!env)dmg*=1.3;                 /* босс в ярости */
  if(player.hurtCd>0)return;
  /* дух-хранитель поглощает один удар раз в 25 секунд */
  for(const o of mobs){
    if(o.alive&&o.def.mech==='guardian'&&(o.cd||0)<=0&&Math.hypot(o.x-player.x,o.y-player.y)<190){
      o.cd=25;player.hurtCd=0.5;
      floatText(player.x,player.y-60,'Дух поглотил удар!','#a8ffe8');
      burst(player.x,player.y-24,14,'#a8ffe8',150,3);SFX.ore();return;
    }
  }
  if(src==='ядовитый газ'||src==='кислота'){const rl=Math.max(itemLv('resp'),player.gasMask?1:0);dmg*=1-0.25*rl;}
  if(src==='лава')dmg*=1-0.25*itemLv('cloak');
  /* броня, «Каменная кожа» и ритуал складываются, но суммарная защита не выше 68% */
  const keep=Math.max(0.32,(1-dmgReduction()*(env?0.5:1))*(1-0.03*perkLv('tough'))*(ritOn('ward')?0.78:1));
  const d=Math.max(1,Math.round(dmg*keep));
  if(window.__dmgLog)window.__dmgLog[src]=(window.__dmgLog[src]||0)+d;
  player.hp-=d;
  bfOnHurt(d,env);
  player.hurtCd=G.dim===1?[0.7,0.7,0.7,0.7,0.7,0.65,0.6,0.55,0.5,0.5][clamp(biomeAt(Math.max(0,player.y)/TILE),0,9)]:0.7;player.lastHurtT=G.time;
  if(fx){for(const k in fx)player.fx[k]=Math.max(player.fx[k]||0,fx[k]);}
  shake(4);SFX.hurt();vib(28);
  floatText(player.x,player.y-52,'-'+d,'#ff6b6b');
  burst(player.x,player.y-24,6,'#ff4d4d',140,3);
  if(player.hp<=0){player.hp=0;if(!tryRevive())playerDie();}
}
function tryRevive(){
  const now=Date.now();
  let how=null;
  if(relicOn('wing')&&now-(player.wingT||0)>600000){player.wingT=now;how='🪶 Перо феникса';}
  else if((player.hitems&&player.hitems.totems)>0){player.hitems.totems--;how='🗿 Тотем воскрешения';}
  if(!how)return false;
  player.hp=Math.round(player.maxHp*0.5);player.hurtCd=2;for(const k in player.fx)player.fx[k]=0;
  for(let i=0;i<40;i++){const a=Math.random()*TAU,sp=rnd(80,300);spawnPart(player.x,player.y-24,Math.cos(a)*sp,Math.sin(a)*sp,rnd(0.5,1.2),i%2?'#ffd060':'#ffffff',rnd(2,4),-50);}
  shockRings.push({x:player.x,y:player.y-24,r:6,max:140,t:0,col:'#ffd060'});
  floatText(player.x,player.y-80,how+'!','#ffd060');SFX.portal();vib(120);
  for(const m of mobs){if(m.alive&&!m.def.boss&&Math.hypot(m.x-player.x,m.y-player.y)<160){m.vx+=Math.sign(m.x-player.x)*400;m.stun=1.2;}}
  return true;
}
function dotDmg(){const v=Math.round(2+player.maxHp*(G.dim===1?0.003:0.002));if(window.__dmgLog)window.__dmgLog.dot=(window.__dmgLog.dot||0)+v;return v;}
function updatePlayerFx(dt){
  const f=player.fx;
  if(player.blind>0)player.blind-=dt;if(relicOn('mask'))player.blind=0;
  if(player.lightBuff>0)player.lightBuff-=dt;
  for(const k in f){if(f[k]>0)f[k]-=dt;}
  if(f.burn>0){
    f.burnT=(f.burnT||0)-dt;
    if(f.burnT<=0){f.burnT=0.7;if(!cheats.god){const dd=dotDmg();player.hp-=dd;floatText(player.x,player.y-60,'-'+dd,'#ff9a3c');spawnPart(player.x,player.y-30,rnd(-20,20),rnd(-90,-40),0.5,'#ff8a30',3,-30);if(player.hp<=0){player.hp=0;playerDie();}}}
  }
  if(f.poison>0){
    f.poiT=(f.poiT||0)-dt;
    if(f.poiT<=0){f.poiT=1.0;if(!cheats.god){const dd=dotDmg();player.hp-=dd;floatText(player.x,player.y-60,'-'+dd,'#9be85a');spawnPart(player.x,player.y-30,rnd(-14,14),rnd(-40,-10),0.6,'#7ad03a',2.6,-20);if(player.hp<=0){player.hp=0;playerDie();}}}
  }
}
function playerDie(){
  hbAbort();
  statAdd('deaths');
  let lost=0;
  const keys=Object.keys(player.inv);
  for(const k of keys){
    const c=player.inv[k];
    const l=Math.floor(c*0.3);
    if(l>0){player.inv[k]-=l;lost+=l;}
    if(player.inv[k]<=0)delete player.inv[k];
  }
  grapple=null;
  SFX.death();
  showDeath(lost);
}
/* ---- предметы: что куплено, то и показываем ---- */
function getPlaceItems(){
  const a=[{id:'ladder',icon:'🪜',name:'Лестница',count:player.ladders,desc:'Ставится в туннель. Кнопка «Ставить».'}];
  if(player.barricadeBought)a.push({id:'barricade',icon:'🧱',name:'Баррикада ('+BARR[player.barricadeLvl-1].name.toLowerCase()+')',count:player.barricades,
    desc:'Ставится перед тобой или туда, куда тапнул. Прочность '+BARR[player.barricadeLvl-1].hp+'. Мобы её ломают. Выкопай — вернётся в запас.'});
  if((player.hitems&&player.hitems.hbombs)>0)a.push({id:'hbomb',icon:'💣',name:'Адская бомба',count:player.hitems.hbombs,desc:'Тап — направление, «Ставить» — бросок. Взрыв 3 блока, 1200 урона.'});
  if((player.hitems&&player.hitems.icegren)>0)a.push({id:'icegren',icon:'❄️',name:'Ледяная граната',count:player.hitems.icegren,desc:'Замораживает лаву и жидкости вокруг, сковывает врагов.'});
  {const un=botUnits().filter(u=>!u.placed);if(un.length)a.push({id:'sorter',icon:'🤖',name:'Робот-кладовщик «'+un[0].name+'»',count:un.length,desc:'Ставится в лобби Ада: зажми палец и веди — выбери место, «Ставить» — поставить. Разносит ресурсы из ящика-приёмника по ящикам.'});}
  if(packedCrates().length>0)a.push({id:'crate',icon:'📦',name:'Ящик для хранения',count:packedCrates().length,
    desc:'Ставится на пол в шахте или в лобби. Тапни по ящику рядом — откроется хранилище.'});
  if(player.drillBought)a.push({id:'drill',icon:'🛠️',name:'Бур ур. '+player.drillLvl,count:player.drills,
    desc:'Тап по экрану — направление, «Ставить» — запуск. Тоннель шириной '+drillWidth()+'. Одноразовый.'});
  return a;
}
function getShootItems(){
  const a=[];
  if(player.grappleUnlocked)a.push({id:'grapple',icon:'🪝',name:'Пушка-крюк',count:player.grappleAmmo,
    desc:'Тап — направление, «Стрелять» — выстрел. Джойстик: качаться, вверх/вниз по верёвке. Прыжок — слезть.'});
  if(player.potions>0)a.push({id:'medkit',icon:'🧪',name:'Аптечка',count:medkitAvail(),
    desc:'Каждое нажатие «Стрелять» восстанавливает 30% здоровья.'});
  if((player.hitems&&player.hitems.beacons)>0)a.push({id:'beacon',icon:'📡',name:'Рудный маяк',count:player.hitems.beacons,desc:'Продаёт весь рюкзак прямо из шахты по 75% рыночной цены.'});
  if((player.hitems&&player.hitems.scrolls)>0)a.push({id:'scroll',icon:'📜',name:'Свиток возврата',count:player.hitems.scrolls,desc:'Мгновенный возврат в лобби, рюкзак сохраняется.'});
  if(matN('ltea')>0)a.push({id:'ltea',icon:'🍵',name:'Настой ясности',count:matN('ltea'),
    desc:'+50 Рассудка, и 30 секунд Пелена не сгущается. Перегоняется в Перегонном кубе.'});
  if(player.icePotions>0)a.push({id:'ice',icon:'🧊',name:'Ледяное зелье',count:player.icePotions,
    desc:'Сбрасывает Жар на 70 и 25 секунд не даёт ему расти. Делается в Печи.'});
  {const g=curGun();if(g)a.push({id:'gun',icon:g.icon,name:g.name,count:player.gunAmmo,desc:g.desc+' · урон '+g.dmg+(g.pellets>1?'×'+g.pellets:'')+' · автоприцел'});}
  return a;
}
function validateSelection(){
  const pl=getPlaceItems(),sh=getShootItems();
  if(!pl.some(x=>x.id===G.placeItem))G.placeItem=pl[0].id;
  if(!sh.some(x=>x.id===G.shootItem))G.shootItem=sh.length?sh[0].id:'';
}
function lineClear(x0,y0,x1,y1){
  const n=Math.ceil(Math.hypot(x1-x0,y1-y0)/10);
  for(let i=1;i<n;i++){const t=i/n;if(solidAtPx(x0+(x1-x0)*t,y0+(y1-y0)*t))return false;}
  return true;
}
/* автоприцел: ближайшая видимая цель (опасные мобы в приоритете) */
function findAutoTarget(range){
  {const h=hbAutoTarget(range);if(h)return h;}
  const px=player.x,py=player.y-player.h*0.5;
  let best=null,bd=1e9;
  for(let pass=0;pass<2&&!best;pass++){
    for(const m of mobs){
      if(!m.alive||m.untargetable)continue;
      const hostile=m.def.dmg>0||m.provoked>0;
      if(pass===0&&!hostile)continue;
      const mx=m.x,my=m.y-m.h*0.5,d=Math.hypot(mx-px,my-py);
      if(d>range||d>=bd)continue;
      if(!lineClear(px,py,mx,my))continue;
      best=m;bd=d;
    }
  }
  return best;
}
function fireGun(g,holdRepeat){
  if(G.scene!=='mine'||G.bossCut)return;
  if(!g)return;
  if((player.gunCd||0)>0)return;
  if(player.gunAmmo<=0){
    if(!holdRepeat){floatText(player.x,player.y-64,'Нет патронов','#ff8a8a');SFX.uiBack();}
    return;
  }
  const tgt=findAutoTarget(g.range);
  if(!tgt){
    if(!holdRepeat){floatText(player.x,player.y-64,'Нет целей в зоне видимости','#9be8ff');SFX.uiBack();}
    return;
  }
  player.gunAmmo--;
  player.gunCd=g.rate;
  const sx=player.x+player.facing*14,sy=player.y-player.h*0.62;
  const ap=hbAimPoint(tgt),tx=ap.x,ty=ap.y;
  const base=Math.atan2(ty-sy,tx-sx);
  if(tx>player.x+2)player.facing=1;else if(tx<player.x-2)player.facing=-1;
  const dm=gunDmgMult();
  if(g.kind==='chain'){
    /* мгновенный луч + цепная молния */
    let L=0;while(L<g.range){if(solidAtPx(sx+Math.cos(base)*L,sy+Math.sin(base)*L))break;L+=10;}
    const ex=sx+Math.cos(base)*L,ey=sy+Math.sin(base)*L;
    pBeams.push({pts:[[sx,sy],[ex,ey]],t:0.25,col:g.color,w:5});
    const hit=[];
    for(const m of mobs){if(!m.alive||m.untargetable&&!m.hidden)continue;
      const vx=ex-sx,vy=ey-sy,l2=vx*vx+vy*vy||1;let u=((m.x-sx)*vx+((m.y-m.h*0.5)-sy)*vy)/l2;u=clamp(u,0,1);
      if(m.def.hb?hbDistToMob(m,sx+vx*u,sy+vy*u)<10:Math.hypot(m.x-(sx+vx*u),(m.y-m.h*0.5)-(sy+vy*u))<m.w*0.5+8){hit.push(m);}}
    for(const m of hit)hitMobGun(m,g.dmg*dm,Math.sign(Math.cos(base)),g);
    let from=hit.length?hit[hit.length-1]:tgt,chained=new Set(hit);
    for(let k=0;k<3&&from;k++){
      let best=null,bd=170;for(const m of mobs){if(!m.alive||chained.has(m))continue;const d=Math.hypot(m.x-from.x,m.y-from.y);if(d<bd){bd=d;best=m;}}
      if(!best)break;chained.add(best);
      pBeams.push({pts:zigzag(from.x,from.y-from.h*0.5,best.x,best.y-best.h*0.5),t:0.25,col:'#c8f0ff',w:2.5});
      hitMobGun(best,g.dmg*0.6*dm,0,g);from=best;
    }
  }else for(let i=0;i<g.pellets;i++){
    const a=base+(Math.random()-0.5)*2*g.spread;
    const sp=g.speed*(g.kind==='flame'?rnd(0.8,1.15):1);
    const pr={x:sx+Math.cos(a)*10,y:sy+Math.sin(a)*10,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,
      life:g.range/g.speed,dmg:g.dmg*dm,color:g.color,size:g.size,owner:'player',pierce:g.pierce,kb:g.kb,gun:true,hit:g.pierce?new Set():null,kind:g.kind};
    if(g.kind==='acid'){const d=Math.hypot(tx-sx,ty-sy),T=clamp(d/520,0.3,1.1);pr.vx=(tx-sx)/T;pr.vy=(ty-sy)/T-0.5*600*T;pr.grav=600;pr.life=3;}
    if(g.kind==='homing'){pr.homeMob=3.2;pr.life=2.6;}
    if(g.kind==='flame'){pr.life=g.range/g.speed*rnd(0.7,1.1);pr.grow=1;}
    projectiles.push(pr);
  }
  player.gunAnim=1;player.gunId=g.id;
  muzzleFlash(sx+Math.cos(base)*14,sy+Math.sin(base)*14,base,g);
  shake(g.pellets>1?3:1.2);SFX.shot(g.id);vib(10);
}
function useMedkit(){
  if(player.potions<=0){floatText(player.x,player.y-64,'Нет аптечек','#ff8a8a');SFX.uiBack();return;}
  if(bfOn()){bfMedkit();return;}                   /* бой с боссом: пояс, лечение за 2 с, перерыв 6 с */
  if(player.hp>=player.maxHp-0.5){floatText(player.x,player.y-64,'Здоровье полное','#9be8ff');SFX.uiBack();return;}
  if((player.potionCd||0)>0)return;
  player.potions--;
  const h=Math.round(player.maxHp*0.30);
  player.hp=Math.min(player.maxHp,player.hp+h);
  player.potionCd=0.9;
  floatText(player.x,player.y-70,'+'+h+' HP','#5ee06a');
  burst(player.x,player.y-24,12,'#5ee06a',130,3);
  SFX.heal();vib(15);
  if(player.potions<=0)validateSelection();
}
function useShoot(holdRepeat){
  if(G.scene!=='mine')return;
  validateSelection();
  const it=G.shootItem;
  if(!it){
    if(!holdRepeat){UI.toast('Для «Стрелять» нет предметов — загляни в кузницу');SFX.uiBack();}
    return;
  }
  if(it==='medkit'){if(!holdRepeat)useMedkit();return;}
  if(it==='ice'){if(!holdRepeat)useIcePotion();return;}
  if(it==='ltea'){if(!holdRepeat)useLTea();return;}
  if(it==='beacon'){if(!holdRepeat)useBeacon();return;}
  if(it==='scroll'){if(!holdRepeat){player.hitems.scrolls--;validateSelection();for(let i=0;i<30;i++)spawnPart(player.x,player.y-24,rnd(-120,120),rnd(-200,40),0.8,'#c8a0ff',3,-60);SFX.portal();UI.toast('📜 Возврат в лобби');exitMine();}return;}
  if(it==='gun'){fireGun(curGun(),holdRepeat);return;}
  if(!holdRepeat)fireGrapple();
}
function useBeacon(){
  if(!totalOre()){floatText(player.x,player.y-64,'Рюкзак пуст','#9be8ff');return;}
  player.hitems.beacons--;
  let gain=0,n=0;
  for(const k in player.inv){const r=sellOre(k,player.inv[k],0.75);gain+=r;n+=player.inv[k];}
  player.inv={};player.money+=gain;validateSelection();
  for(let i=0;i<24;i++)spawnPart(player.x,player.y-30,rnd(-60,60),rnd(-260,-120),1,'#ffd98a',3,200);
  SFX.sell();SFX.coin();floatText(player.x,player.y-70,'📡 Продано '+n+' шт: +'+fmt(gain)+' 💰','#ffd98a');saveGame();
}
/* продажа с учётом насыщения рынка Ада: каждая следующая штука дешевле */
function sellOre(k,n,mul){
  if(!n||!ORES[k])return 0;
  const base=orePrice(k)*(mul||1);
  if(!ORES[k].dim)return Math.round(base*n);
  if(!G.wf.sat)G.wf.sat={};
  let sv=G.wf.sat[k]||0,sum=0;
  for(let i=0;i<n;i++){sum+=base/(1+sv/SAT_ORE);sv+=1;}
  G.wf.sat[k]=sv;
  return Math.round(sum);
}
function usePlace(){
  if(G.scene==='lobby'){validateSelection();if(G.placeItem==='crate')placeCrate();else if(G.placeItem==='sorter')placeBot();return;}
  if(G.scene!=='mine')return;
  validateSelection();
  if(G.placeItem==='crate'){placeCrate();return;}
  if(G.placeItem==='sorter'){UI.toast('Робота можно поставить только в лобби Ада');return;}
  if(G.placeItem==='hbomb'){if(player.hitems.hbombs>0){player.hitems.hbombs--;throwItem('bomb');validateSelection();}return;}
  if(G.placeItem==='icegren'){if(player.hitems.icegren>0){player.hitems.icegren--;throwItem('ice');validateSelection();}return;}
  if(G.placeItem==='drill'){launchDrill();return;}
  if(G.placeItem==='barricade'){placeBarricade();return;}
  if(player.ladders<=0){
    floatText(player.x,player.y-64,'Нет лестниц','#ff8a8a');
    SFX.uiBack();return;
  }
  const tx=Math.floor(player.x/TILE);
  const ty=Math.floor((player.y-player.h*0.5)/TILE);
  const t=getTile(tx,ty);
  if((t===T_AIR||isLiq(t)) && !getOre(tx,ty)){
    setTile(tx,ty,T_LADDER);
    player.ladders--;
    SFX.place();
    floatText(player.x,player.y-70,'Лестница','#9be8ff');
  }else if(t===T_LADDER){
    const ty2=ty-1;
    if(getTile(tx,ty2)===T_AIR && !getOre(tx,ty2)){
      setTile(tx,ty2,T_LADDER);
      player.ladders--;
      SFX.place();
      floatText(player.x,player.y-70,'Лестница','#9be8ff');
    }else{
      floatText(player.x,player.y-64,'Заблокировано','#ff8a8a');
      SFX.uiBack();
    }
  }else{
    floatText(player.x,player.y-64,'Здесь нельзя','#ff8a8a');
    SFX.uiBack();
  }
}
