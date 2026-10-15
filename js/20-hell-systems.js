'use strict';
/* ============================================================
   АД: ЖАР, ПЕПЕЛЬНЫЕ БУРИ, МЕТЕОРЫ, ГАЗ, РЕГЕНЕРАЦИЯ
   ============================================================ */
const HEAT_RATE=[0.55,0.95,1.35,1.75,2.6];
function heatResist(){
  const a=ARMORS[clamp(player.armorLvl-1,0,ARMORS.length-1)];
  return clamp((a.heat||0)+0.07*perkLv('frost')+0.12*itemLv('cloak')+(relicOn('ember')?0.25:0),0,0.95);
}
function useIcePotion(){
  if(player.icePotions<=0){UI.toast('Нет ледяных зелий');return;}
  player.icePotions--;player.heat=Math.max(0,(player.heat||0)-70);player.iceT=25;
  SFX.splash();burst(player.x,player.y-30,22,'#9be8ff',160,3);floatText(player.x,player.y-64,'🧊 Прохлада','#9be8ff');
  validateSelection();
}
const hellFx=[];
let stormT=40,stormOn=0,meteorT=12,gasT=0;
/* ---------- события Пепельных пустошей ---------- */
const ASH_EVENTS={
  storm  :{ic:'🌪',n:'Пепельная буря'    ,d:'Порывы ветра и пепельные молнии',dur:18,col:'#c8a890'},
  ember  :{ic:'🌠',n:'Угольный звездопад',d:'Метеориты оставляют осколки руды',dur:14,col:'#ffb060'},
  eclipse:{ic:'🌑',n:'Пепельное затмение',d:'Мрак: мобы злее, души ×2',dur:26,col:'#b08aff'},
  tornado:{ic:'🔥',n:'Огненный смерч'    ,d:'Смерч затягивает и жжёт всё живое',dur:22,col:'#ff8a30'},
  quake  :{ic:'🪨',n:'Пеплотрясение'     ,d:'С потолка сыплются глыбы',dur:11,col:'#a89888'},
  /* Кровавые копи */
  bloodrain:{b:1,ic:'🩸',n:'Кровавый дождь' ,d:'Кровь жжёт и гасит регенерацию, мобы лечатся. Укройся в низком тоннеле',dur:20,col:'#ff4a5a'},
  bloodmoon:{b:1,ic:'🔴',n:'Кровавая луна'  ,d:'Мобы в бешенстве и бьют сильнее, но души ×2',dur:24,col:'#ff3040'},
  heartbeat:{b:1,ic:'💓',n:'Пульс недр'     ,d:'С каждым ударом сердца из плоти бьют шипы',dur:16,col:'#ff7a8a'},
  /* Серные топи */
  acidrain :{b:2,ic:'☔',n:'Кислотный дождь',d:'Кислота отравляет и гасит регенерацию. Укройся в низком тоннеле',dur:18,col:'#b8ff50'},
  toxfog   :{b:2,ic:'☁',n:'Ядовитый туман' ,d:'Туман травит без респиратора и скрывает обзор',dur:20,col:'#c8e860'},
  geysers  :{b:2,ic:'♨',n:'Извержение гейзеров',d:'Из-под земли бьют струи ядовитого газа',dur:16,col:'#e8d84a'},
  /* Костяные катакомбы */
  souls    :{b:3,ic:'👻',n:'Ночь душ'       ,d:'Блуждающие души — лови их ради 👻',dur:22,col:'#9ad8ff'},
  coldwind :{b:3,ic:'❄',n:'Ветер мёртвых'  ,d:'Ледяной ветер гасит Жар, но сносит и замедляет',dur:18,col:'#bfe8ff'},
  bonehail :{b:3,ic:'🦴',n:'Костяной град'  ,d:'С потолка сыплются осколки костей',dur:12,col:'#e8dcc0'},
  /* Огненное ядро */
  firerain :{b:4,ic:'☄',n:'Огненный дождь' ,d:'Метеоры с потолка',dur:16,col:'#ff8a30'},
  flare    :{b:4,ic:'☀',n:'Вспышка ядра'   ,d:'Жар растёт втрое, лава плюётся огнём',dur:14,col:'#ffd040'},
  magmaquake:{b:4,ic:'🌋',n:'Магматрясение' ,d:'С потолка капает расплавленная порода',dur:12,col:'#ff6a20'}
};
for(const k of ['storm','ember','eclipse','tornado','quake'])ASH_EVENTS[k].b=0;
function evHeat(){if(!ashEv)return 0;return ashEv.id==='flare'?2.4:ashEv.id==='coldwind'?-2.2:0;}
let ashEv=null,ashEvT=35,ashEvBi=-1;
const TROPHY_N=50;
const MOB_LORE={
  hound:'Охотится стаями. Прыгает с разбега, оставляя огненный след.',
  ashgolem:'Медленный, бьёт по площади. Рассыпается в пепел — добей останки, иначе восстанет.',
  cinderbat:'Пикирует сверху. При смерти взрывается углями.',
  ashwraith:'Проходит сквозь стены и хватает пепельной рукой, подтягивая к себе.',
  ashimp:'Держит дистанцию и швыряет огненные шары.',
  lavaworm:'Плывёт в породе, выныривает с укусом и плевком лавы, затем пару секунд ползает по поверхности — бей его в этот момент. Под землёй неуязвим, и меч его не трогает.',
  leech:'Присасывается и пьёт кровь, леча себя. Отскочи или убей быстро.',
  fleshgolem:'Цепной крюк притягивает. Раненый сбрасывает клочья мяса.',
  bloodslime:'Делится при смерти. Лечится в кровавых озёрах.',
  demon:'Берсерк: вращение клинками, ярость растёт с потерей здоровья.',
  bloodpriest:'Лечит союзников кровавой нитью. Убивай первым!',
  scorpion:'Зарывается в песок и бьёт ядовитым жалом снизу.',
  gasbag:'Раздувается и лопается ядовитым облаком. Стреляй издалека.',
  acidspider:'Плюёт кислотой, порождает кислотных паучат.',
  sulfurel:'Ядовитая аура и навесные серные бомбы.',
  toad:'Прыгает дугой, язык притягивает, плюётся кислотой.',
  skeleton:'Держит дистанцию, стреляет залпами (иногда огненными стрелами). Восстаёт из костей.',
  wraith:'Сферы душ и луч, высасывающий здоровье.',
  bonegolem:'Колосс: удары с ударной волной по земле.',
  necro:'Поднимает скелетов. Пока они живы — щит костей режет урон.',
  skullbat:'Рой: рывки, проклятие замедления.',
  infernal:'Топот с лавовыми волнами и «Звездопад» метеоров.',
  magmael:'Швыряет камни по орбите, перегревается и взрывается.',
  firebird:'Пикирует, оставляя огонь. Возрождается из яйца — разбей его.',
  firedemon:'Серия из трёх огненных рассечений.',
  magmacrab:'Прячется в панцирь (почти неуязвим), отвечает клешнёй.',
  hellsal:'Мирная, пока не тронешь. Разозлённая — дышит огнём.',
  lostsoul:'Выползает из песка душ в Катакомбах. Проходит сквозь стены и крадёт души.',
  skullturret:'Охраняет сокровищницы. Сломай все — откроется запечатанный сундук.',
  bloodpod:'Кокон в улье. Выпускает мясных тварей.',
  riftcrystal:'Кристалл разлома: призывает волны из пустоты.',
  devourer:'Страж Ключа Бездны. Три фазы: сферы, луч, шипы, спираль, метеоры.'
};

/* точка под потолком пещеры над уровнем игрока; null — если там сплошная порода или низкий тоннель */
function skyAbove(x){const y0=player.y-player.h;if(solidAtPx(x,y0))return null;const cy=ceilAbove(x,y0);if(player.y-cy<3.2*TILE)return null;return cy+6;}
function findTornadoSpot(){
  const ptx=Math.floor(player.x/TILE),pty=Math.floor((player.y-4)/TILE);
  for(const off of [9,-9,11,-11,7,-7,13,-13,5,-5]){
    const tx=ptx+off;if(tx<3||tx>MW-4)continue;
    for(let dy=-3;dy<=3;dy++){const ty=pty+dy;
      if(!isSolid(tx,ty)&&!isSolid(tx,ty-1)&&!isSolid(tx,ty-2)&&isSolid(tx,ty+1)){
        const x=tx*TILE+16,y=(ty+1)*TILE;if(lineClear(x,y-30,player.x,player.y-player.h*0.5))return {x,y};}}}
  return null;
}
function spawnTornado(dur){const p=findTornadoSpot()||{x:clamp(player.x+(Math.random()<0.5?-1:1)*300,3*TILE,(MW-3)*TILE),y:player.y};
  hellFx.push({type:'tornado',x:p.x,y:p.y,t:0,warn:0,life:dur,dir:p.x<player.x?1:-1,hitT:0,born:0});}
/* пол пещеры у точки x примерно на уровне игрока (null — там сплошная порода) */
function floorNear(x){const tx=Math.floor(x/TILE);let ty=Math.floor((player.y-16)/TILE);
  if(isSolid(tx,ty)){let k=0;while(k++<4&&isSolid(tx,ty))ty--;if(isSolid(tx,ty))return null;}
  let k=0;while(k++<8&&!isSolid(tx,ty+1))ty++;if(!isSolid(tx,ty+1))return null;return (ty+1)*TILE;}
function groundBelow(x,y0){let ty=Math.floor(y0/TILE);const tx=Math.floor(x/TILE);for(let k=0;k<24&&!isSolid(tx,ty+1);k++)ty++;return (ty+1)*TILE;}
function ceilAbove(x,y0){let ty=Math.floor(y0/TILE);const tx=Math.floor(x/TILE);for(let k=0;k<14&&!isSolid(tx,ty-1);k++)ty--;return ty*TILE;}
/* небольшое оповещение о начале/конце события: слева сверху под шкалой Жара,
   не перекрывает ни игрока, ни мини-карту, ни кнопки */
function evNotice(ic,n,sub,col,end){G.evNote={ic:ic,n:n,sub:sub||'',col:col||'#ffd98a',end:!!end,t:0,dur:end?3:4.6};}
function drawEvNotice(W,H){
  const N=G.evNote;if(!N)return;
  if(N.t>=N.dur){G.evNote=null;return;}
  const a=Math.min(1,N.t/0.22,(N.dur-N.t)/0.5),slide=(1-Math.min(1,N.t/0.22));
  const maxW=Math.min(250,W*0.56);
  const title=(N.end?'':'')+N.ic+' '+N.n+(N.end?' — закончилось':'');
  ctx.save();ctx.globalAlpha=a;ctx.textAlign='left';
  ctx.font='800 11px system-ui,sans-serif';
  let tw=ctx.measureText(title).width;
  /* подзаголовок — до двух строк мелким шрифтом */
  const lines=[];
  if(!N.end&&N.sub){ctx.font='600 9.5px system-ui,sans-serif';const words=N.sub.split(' ');let cur='';
    for(const w of words){const t2=cur?cur+' '+w:w;if(ctx.measureText(t2).width>maxW-22&&cur){lines.push(cur);cur=w;if(lines.length===2)break;}else cur=t2;}
    if(lines.length<2&&cur)lines.push(cur);
    for(const l of lines)tw=Math.max(tw,ctx.measureText(l).width);}
  const bw=Math.min(maxW,tw+22),bh=18+lines.length*11.5+(lines.length?3:0);
  const by=ashEv&&G.scene==='mine'&&G.dim===1?69:46,bx=(G.scene==='mine'&&by+bh>H*0.22-3?24:10)-slide*30;   /* не налезает на шкалу глубины */
  ctx.fillStyle='rgba(10,7,12,.74)';roundRect(ctx,bx,by,bw,bh,8);ctx.fill();
  ctx.fillStyle=N.col;ctx.globalAlpha=a*(N.end?0.45:0.9);roundRect(ctx,bx,by+3,2.5,bh-6,1.25);ctx.fill();ctx.globalAlpha=a;
  ctx.font='800 11px system-ui,sans-serif';ctx.fillStyle=N.end?'#c8bcb4':N.col;ctx.fillText(title,bx+9,by+13);
  ctx.font='600 9.5px system-ui,sans-serif';ctx.fillStyle='rgba(235,225,215,.78)';
  lines.forEach((l,i)=>ctx.fillText(l,bx+9,by+26+i*11.5));
  ctx.restore();
}
function startAshEvent(id,forced){
  const E=ASH_EVENTS[id];if(!E)return;
  ashEv={id:id,t:0,dur:E.dur,k:0,mobs:[],forced:!!forced};
  evNotice(E.ic,E.n,E.d,E.col,false);
  if(id==='storm'){stormOn=E.dur;SFX.geyser();}
  else if(id==='bloodmoon'||id==='souls'){SFX.portal&&SFX.portal();}
  else if(id==='heartbeat'||id==='magmaquake'){shake(8);SFX.boom&&SFX.boom();}
  else if(id==='flare'){G.evFlash=0.8;SFX.boom&&SFX.boom();}
  else if(id==='coldwind'){ashEv.dir=Math.random()<0.5?-1:1;SFX.geyser();}
  else if(id==='toxfog'||id==='acidrain'||id==='bloodrain'||id==='geysers'||id==='bonehail'||id==='firerain'){SFX.geyser();}
  else if(id==='tornado'){spawnTornado(E.dur);SFX.geyser();}
  else if(id==='quake'){shake(10);SFX.breakBlock&&SFX.breakBlock();}
  else if(id==='eclipse'){SFX.portal&&SFX.portal();}
  else if(id==='ember'){SFX.hit&&SFX.hit();}
}
function rainDrop(kind,spd){
  const hw=view.W/(2*view.scale),hh=view.H/(2*view.scale);
  const aimed=kind!=='cold'&&Math.random()<0.35;
  const x=aimed?player.x+rnd(-60,60):G.cam.x+rnd(-hw,hw);let y=G.cam.y-hh-10;
  if(kind!=='cold'){if(solidAtPx(x,player.y-player.h))return;const cy=ceilAbove(x,player.y-player.h);
    if(player.y-cy<3.5*TILE)return;               /* в низких тоннелях дождь не достаёт — там можно укрыться */
    if(cy>y)y=cy+2;}
  hellFx.push({type:'drop',kind:kind,x:x,y:y,vy:spd||rnd(520,700),vx:kind==='cold'?(ashEv&&ashEv.dir||1)*rnd(220,320):rnd(-20,20),t:0,warn:0});
}
function updateAshEvent(dt,bi){
  if(ashEv&&!ashEv.forced&&ASH_EVENTS[ashEv.id].b!==bi){endAshEvent(true);}
  if(!ashEv){if(ashEvBi!==bi){ashEvBi=bi;ashEvT=Math.max(ashEvT,rnd(18,30));}
    ashEvT-=dt;if(ashEvT<=0){const ids=Object.keys(ASH_EVENTS).filter(k=>ASH_EVENTS[k].b===bi);startAshEvent(ids[Math.floor(Math.random()*ids.length)]);}return;}
  const e=ashEv;e.t+=dt;e.k-=dt;const low=settings.quality==='low';
  const hw=view.W/(2*view.scale);
  switch(e.id){
  case 'storm':
    if(e.k<=0){e.k=rnd(3,4.5);e.gust={t:0,dir:Math.random()<0.5?-1:1};floatText(player.x,player.y-70,e.gust.dir>0?'Порыв ➜':'⬅ Порыв','#e8d8c8');}
    if(e.gust){e.gust.t+=dt;if(e.gust.t>0.7&&e.gust.t<1.4&&!cheats.god&&!relicOn('mask'))player.vx+=e.gust.dir*900*dt;if(e.gust.t>1.4)e.gust=null;}
    if(Math.random()<dt*0.6){const x=clamp(player.x+rnd(-260,260),3*TILE,(MW-3)*TILE),gy=floorNear(x);if(gy!==null)hellFx.push({type:'bolt',x:x,y:gy,t:0,warn:1.0,dmg:70});}
    break;
  case 'ember':
    if(e.k<=0){e.k=rnd(0.5,0.9);const x=clamp(player.x+rnd(-300,300),2*TILE,(MW-2)*TILE),cy=skyAbove(x);if(cy!==null)hellFx.push({type:'meteor',x:x,y:cy,vy:160,t:0,warn:0.9,dmg:55,shard:true});}
    break;
  case 'eclipse':case 'bloodmoon':
    for(const m of mobs){if(m.alive&&!m.def.neutral&&!m.def.boss){m.haste=Math.max(m.haste||0,0.3);if(e.id==='bloodmoon')m.frenzy=0.3;}}
    break;
  case 'quake':case 'magmaquake':case 'bonehail':{
    if(Math.random()<dt*(e.id==='bonehail'?0.4:1.2))shake(2);
    if(e.k<=0){e.k=e.id==='bonehail'?rnd(0.2,0.35):rnd(0.35,0.7);const x=clamp(player.x+rnd(-240,240),3*TILE,(MW-3)*TILE),cy=ceilAbove(x,player.y-player.h);
      if(player.y-cy>40)hellFx.push({type:'rock',x:x,y:cy+6,vy:0,t:0,warn:e.id==='bonehail'?0.45:0.8,dmg:e.id==='bonehail'?22:e.id==='magmaquake'?70:60,kind:e.id==='bonehail'?'bone':e.id==='magmaquake'?'magma':'rock'});}
    break;}
  case 'bloodrain':case 'acidrain':
    if(!low||Math.random()<0.5){const n=Math.random()<dt*40?1:0;for(let q=0;q<n+(Math.random()<dt*20?1:0);q++)rainDrop(e.id==='bloodrain'?'blood':'acid');}
    if(e.id==='bloodrain')for(const m of mobs){if(m.alive&&!m.def.boss&&!solidAtPx(m.x,m.y-m.h-40)&&m.hp<m.maxHp)m.hp=Math.min(m.maxHp,m.hp+m.maxHp*0.012*dt);}
    break;
  case 'heartbeat':
    if(e.k<=0){e.k=1.6;G.evFlash=0.35;shake(4);SFX.boom&&SFX.boom();
      for(let q=0;q<3;q++){const x=clamp(player.x+rnd(-180,180)+(q===0?player.vx*0.4:0),3*TILE,(MW-3)*TILE);hzSpike(x,player.y-40,40,0.7,55,'#c0142a',{bleed:2});}}
    break;
  case 'toxfog':{
    const rl=Math.max(itemLv('resp'),player.gasMask?1:0);
    e.dmgT=(e.dmgT||0)-dt;if(e.dmgT<=0){e.dmgT=1.2;if(rl<2&&!cheats.god)hurtPlayer(rl?6:14,'ядовитый газ',{poison:rl?1:2});}
    break;}
  case 'geysers':
    if(e.k<=0){e.k=rnd(1.2,2);const x=clamp(player.x+rnd(-260,260),3*TILE,(MW-3)*TILE),gy=floorNear(x);if(gy!==null)hellFx.push({type:'geyser',x:x,y:gy,t:0,warn:1.1,dmg:40});}
    break;
  case 'souls':
    if(e.k<=0){e.k=rnd(0.7,1.3);hellFx.push({type:'wisp',x:player.x+rnd(-hw*0.9,hw*0.9),y:player.y-rnd(30,260),t:0,warn:0,ph:Math.random()*TAU,life:rnd(8,12)});}
    break;
  case 'coldwind':
    if(!cheats.god){player.vx+=e.dir*260*dt;}
    if(!low&&Math.random()<dt*30)rainDrop('cold',rnd(60,160));
    break;
  case 'firerain':
    if(e.k<=0){e.k=rnd(0.6,1.1);const x=clamp(player.x+rnd(-320,320),2*TILE,(MW-2)*TILE),cy=skyAbove(x);if(cy!==null)hellFx.push({type:'meteor',x:x,y:cy,vy:200,t:0,warn:0.9,dmg:110});}
    break;
  case 'flare':
    if(e.k<=0){e.k=rnd(0.5,0.9);
      const tx0=Math.floor(player.x/TILE),ty0=Math.floor(player.y/TILE);
      for(let q=0;q<14;q++){const tx=tx0+Math.floor(rnd(-12,12)),ty=ty0+Math.floor(rnd(-8,8));
        if(getTile(tx,ty)===T_LAVA&&getTile(tx,ty-1)===T_AIR){projectiles.push({x:tx*TILE+16,y:ty*TILE,vx:rnd(-120,120),vy:rnd(-620,-420),life:3,dmg:45,color:'#ffb040',size:6,owner:'mob',grav:900,lava:true,fx:{burn:3}});burst(tx*TILE+16,ty*TILE,8,'#ffb040',120,2.4);break;}}}
    if(Math.random()<dt*0.5)G.evFlash=0.25;
    break;
  }
  if(G.evFlash>0)G.evFlash-=dt*1.5;
  if(e.t>=e.dur)endAshEvent(false);
}
function endAshEvent(silent){
  const e=ashEv;if(!e)return;
  if(!silent){const E0=ASH_EVENTS[e.id];evNotice(E0.ic,E0.n,'закончилось',E0.col,true);statAdd('events');}
  if(e.id==='storm')stormOn=0;
  for(let i=hellFx.length-1;i>=0;i--){const ty=hellFx[i].type;if(ty==='drop'||ty==='tornado'||ty==='geyser')hellFx.splice(i,1);}
  ashEv=null;ashEvT=rnd(40,75);
}
function updAshFx(f,dt){ /* true -> удалить */
  f.t+=dt;
  if(f.type==='sbomb'){if(f.t>=f.warn){explode(f.x,f.y,58,140);gasCloud(f.x,f.y,60,40,4);
      for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){const tx=Math.floor(f.x/TILE)+dx,ty=Math.floor(f.y/TILE)+dy,tt=getTile(tx,ty);if(tt!==T_AIR&&tt!==T_BEDROCK&&tt!==T_ARENA&&!isLiq(tt)&&tt!==T_LAVA&&(Math.abs(dx)+Math.abs(dy)<2||tt===T_SULFBOMB)){const o=getOre(tx,ty);setTile(tx,ty,T_AIR);if(o&&ORES[o].tier<=player.pickLvl)addOre(o,1);}}
      if(Math.hypot(player.x-f.x,player.y-player.h*0.5-f.y)<70&&!cheats.god)hurtPlayer(70,'взрыв серы',{poison:3});return true;}
    if(Math.random()<0.5)spawnPart(f.x+rnd(-8,8),f.y+rnd(-8,8),rnd(-40,40),rnd(-60,-20),0.4,'#e8e060',2.4,0);return false;}
  if(f.type==='drop'){
    f.x+=f.vx*dt;f.y+=f.vy*dt;
    if(Math.abs(player.x-f.x)<12&&f.y>player.y-player.h&&f.y<player.y&&!cheats.god){
      if((f.kind==='blood'||f.kind==='acid')&&G.time-(player.dropHitT||-9)>0.4){player.dropHitT=G.time;player.noRegenT=1.6;
        if(f.kind==='blood'){hurtPlayer(Math.round(6+player.maxHp*0.022),'кровавый дождь',{bleed:1});spawnPart(player.x,player.y-player.h*0.8,rnd(-30,30),rnd(-60,-20),0.35,'#c0142a',2,500);}
        else hurtPlayer(Math.round(6+player.maxHp*0.019),'кислотный дождь',{poison:2});}
      return true;}
    if(solidAtPx(f.x,f.y)||isLiq(getTile(Math.floor(f.x/TILE),Math.floor(f.y/TILE)))){if(f.kind!=='cold'&&Math.random()<0.5)spawnPart(f.x,f.y-2,rnd(-40,40),rnd(-80,-30),0.3,f.kind==='blood'?'#c0142a':'#9aff40',1.6,600);return true;}
    return f.t>3;}
  if(f.type==='wisp'){
    f.x+=Math.sin(f.t*1.3+f.ph)*30*dt;f.y+=Math.cos(f.t*0.9+f.ph)*18*dt-6*dt;
    if(Math.hypot(player.x-f.x,player.y-player.h*0.5-f.y)<34){const sl=1+Math.floor(Math.random()*3);player.souls=(player.souls||0)+sl;floatText(f.x,f.y-14,'+'+sl+' 👻','#9ad8ff');burst(f.x,f.y,12,'#9ad8ff',120,2.4);SFX.coin&&SFX.coin();return true;}
    return f.t>f.life;}
  if(f.type==='geyser'){
    if(f.t>=f.warn&&!f.hit){f.hit=true;shake(3);SFX.geyser();gasCloud(f.x,f.y-50,60,60,4);
      if(Math.abs(player.x-f.x)<30&&player.y>f.y-150&&player.y<=f.y+6&&!cheats.god){hurtPlayer(f.dmg,'гейзер',{poison:2});player.vy=-560;}}
    return f.t>f.warn+1.1;}
  if(f.type==='shard'){
    if(Math.hypot(player.x-f.x,player.y-10-f.y)<30){const ids=[18,18,27,19,28],id=ids[Math.floor(Math.random()*ids.length)],n=2+Math.floor(Math.random()*3);
      addOre(id,n);floatText(f.x,f.y-24,'+'+n+' '+ORES[id].name,'#ffd080');burst(f.x,f.y,10,'#ffb060',120,2.4);SFX.coin&&SFX.coin();return true;}
    return f.t>16;}
  if(f.type==='bolt'){
    if(f.t>=f.warn&&!f.hit){f.hit=true;shake(5);SFX.breakBlock&&SFX.breakBlock();burst(f.x,f.y-4,18,'#e8e0ff',260,3);
      if(Math.abs(player.x-f.x)<40&&Math.abs(player.y-f.y)<60&&!cheats.god)hurtPlayer(f.dmg,'пепельная молния',{stun:0.4,burn:2});
      for(const m of mobs)if(m.alive&&Math.abs(m.x-f.x)<40&&Math.abs(m.y-f.y)<60)damageMob(m,f.dmg*2,0);}
    return f.t>f.warn+0.35;}
  if(f.type==='rock'){
    if(f.t<f.warn){if(Math.random()<0.3)spawnPart(f.x+rnd(-8,8),f.y,rnd(-10,10),rnd(10,40),0.5,'#8a7a70',2,600);return false;}
    f.vy+=1500*dt;f.y+=f.vy*dt;
    const rc=f.kind==='bone'?'#e8dcc0':f.kind==='magma'?'#ff8a30':'#8a7a70';
    if(Math.abs(player.x-f.x)<20&&Math.abs(player.y-player.h*0.5-f.y)<26&&!cheats.god){hurtPlayer(f.dmg,f.kind==='bone'?'костяной град':'глыба',f.kind==='magma'?{burn:3}:f.kind==='bone'?{bleed:1}:{stun:0.5});burst(f.x,f.y,14,rc,200,3);return true;}
    if(solidAtPx(f.x,f.y+10)||f.t>5){burst(f.x,f.y,14,rc,180,3);if(f.kind==='magma')addPatch(f.x,f.y+10,30,3,'fire',12);shake(1.5);for(const m of mobs)if(m.alive&&Math.hypot(m.x-f.x,m.y-m.h*0.5-f.y)<30)damageMob(m,f.dmg,0);return true;}
    return false;}
  if(f.type==='tornado'){
    /* смерч идёт по полу пещеры, упирается в стены, не действует сквозь породу,
       а поймав игрока — подбрасывает и выкидывает в сторону, а не держит на месте */
    const sp=62,dxp=player.x-f.x,sameLvl=Math.abs(player.y-f.y)<4*TILE;
    if(sameLvl&&Math.abs(dxp)>40)f.dir=Math.sign(dxp);
    else if(Math.random()<dt*0.3)f.dir=-f.dir;
    const nx=f.x+f.dir*sp*dt+Math.sin(f.t*1.7)*18*dt;
    if(solidAtPx(nx+f.dir*18,f.y-20)||solidAtPx(nx+f.dir*18,f.y-48))f.dir=-f.dir;
    else f.x=clamp(nx,3*TILE,(MW-3)*TILE);
    {let ty=Math.floor((f.y-6)/TILE);const tx=Math.floor(f.x/TILE);let k=0;
      while(k++<6&&isSolid(tx,ty))ty--;                       /* въехал в ступеньку — поднимается */
      k=0;while(k++<10&&!isSolid(tx,ty+1))ty++;                 /* обрыв — спускается на пол */
      const gy=(ty+1)*TILE;f.y+= (gy-f.y)*Math.min(1,dt*8);}
    const dx=player.x-f.x,dy=f.y-player.y,see=Math.abs(dy)<5*TILE&&lineClear(f.x,f.y-30,player.x,player.y-player.h*0.5);
    if(f.throwT>0)f.throwT-=dt;
    if(see&&Math.abs(dx)<150&&dy>-40&&dy<240&&!cheats.god&&!(f.throwT>0)){
      player.vx-=Math.sign(dx)*(150-Math.abs(dx))*2.4*dt;
      if(Math.abs(dx)<36){f.holdT=(f.holdT||0)+dt;player.vy=Math.min(player.vy,-90);
        f.hitT-=dt;if(f.hitT<=0){f.hitT=0.5;hurtPlayer(Math.round(20+player.maxHp*0.02),'огненный смерч',{burn:2});}
        if(f.holdT>1.1){f.holdT=0;f.throwT=2.2;const s2=Math.sign(dx)||1;player.vx=s2*460;player.vy=-420;burst(player.x,player.y-20,14,'#ff8a30',200,3);shake(4);}}
      else f.holdT=Math.max(0,(f.holdT||0)-dt);}
    for(const m of mobs){if(!m.alive||m.def.boss)continue;const mx=m.x-f.x;if(Math.abs(mx)<44&&Math.abs(m.y-f.y)<120){m.vx-=Math.sign(mx)*260*dt;m.tdT=(m.tdT||0)-dt;if(m.tdT<=0){m.tdT=0.5;damageMob(m,40,0);m.burn=Math.max(m.burn||0,2);}}}
    if(settings.quality!=='low'&&Math.random()<0.6)spawnPart(f.x+rnd(-24,24),f.y-rnd(0,170),rnd(-70,70),rnd(-140,-40),0.7,Math.random()<0.5?'#ff8a30':'#ffd060',2.4,-60);
    if(settings.quality!=='low'&&Math.random()<0.4)spawnPart(f.x+rnd(-16,16),f.y-2,rnd(-90,90),rnd(-60,-10),0.5,'#5a4a44',2.4,200);
    /* ушёл далеко — рассеивается и возникает рядом снова */
    if(Math.abs(player.y-f.y)>9*TILE||Math.abs(dx)>900){f.gone=(f.gone||0)+dt;if(f.gone>3){const left=f.life-f.t;if(left>4){const nf=findTornadoSpot();if(nf){f.x=nf.x;f.y=nf.y;f.gone=0;f.born=f.t;}}}}
    else f.gone=0;
    return f.t>f.life;}
  return true;
}
function drawAshFx(g,f){
  const T=G.time;
  if(f.type==='sbomb'){const k=f.t/f.warn,fl=Math.floor(T*(8+k*20))%2;g.save();g.globalCompositeOperation='lighter';softGlow(g,f.x,f.y,30+k*30,fl?'#ffff80':'#e8c020',0.5+k*0.4);g.restore();
    g.strokeStyle='rgba(255,255,120,'+(0.4+0.5*k)+')';g.lineWidth=2;g.beginPath();g.arc(f.x,f.y,58*(1-k)+6,0,TAU);g.stroke();return;}
  if(f.type==='drop'){
    if(f.kind==='cold'){g.fillStyle='rgba(220,240,255,.75)';g.fillRect(f.x,f.y,1.6,1.6);g.strokeStyle='rgba(200,230,255,.3)';g.lineWidth=1;g.beginPath();g.moveTo(f.x,f.y);g.lineTo(f.x-f.vx*0.05,f.y-f.vy*0.05);g.stroke();return;}
    g.strokeStyle=f.kind==='blood'?'rgba(190,10,30,.8)':'rgba(170,255,70,.75)';g.lineWidth=1.8;g.beginPath();g.moveTo(f.x,f.y);g.lineTo(f.x-f.vx*0.02,f.y-14);g.stroke();return;}
  if(f.type==='wisp'){const a=Math.min(1,f.t,(f.life-f.t))*(0.7+0.3*Math.sin(T*6+f.ph));g.save();g.globalCompositeOperation='lighter';
    const gr=g.createRadialGradient(f.x,f.y,0,f.x,f.y,16);gr.addColorStop(0,'rgba(200,240,255,'+a+')');gr.addColorStop(1,'rgba(80,150,255,0)');g.fillStyle=gr;g.beginPath();g.arc(f.x,f.y,16,0,TAU);g.fill();
    g.fillStyle='rgba(150,210,255,'+(a*0.5)+')';g.beginPath();g.moveTo(f.x-4,f.y);g.quadraticCurveTo(f.x+Math.sin(T*5)*5,f.y+14,f.x,f.y+22);g.quadraticCurveTo(f.x+3,f.y+10,f.x+4,f.y);g.fill();g.restore();
    g.fillStyle='#0a1830';g.fillRect(f.x-3,f.y-2,1.6,2);g.fillRect(f.x+1.4,f.y-2,1.6,2);return;}
  if(f.type==='geyser'){
    if(f.t<f.warn){const a=f.t/f.warn;g.fillStyle='rgba(220,230,80,'+(0.2+0.4*a)+')';g.beginPath();g.ellipse(f.x,f.y-2,16,4,0,0,TAU);g.fill();
      if(Math.random()<0.4)spawnPart(f.x+rnd(-10,10),f.y-4,rnd(-10,10),rnd(-80,-30),0.4,'#d8e84a',2,0);}
    else{const k=(f.t-f.warn)/1.1,h=170*Math.sin(Math.min(1,k*3)*Math.PI/2)*(1-k*0.5);g.save();g.globalAlpha=1-k;
      const gr=g.createLinearGradient(0,f.y-h,0,f.y);gr.addColorStop(0,'rgba(220,240,100,0)');gr.addColorStop(1,'rgba(220,240,100,.8)');g.fillStyle=gr;
      g.beginPath();g.moveTo(f.x-10,f.y);g.quadraticCurveTo(f.x-18,f.y-h*0.6,f.x-6+Math.sin(T*20)*3,f.y-h);g.lineTo(f.x+6,f.y-h);g.quadraticCurveTo(f.x+18,f.y-h*0.6,f.x+10,f.y);g.fill();g.restore();}
    return;}
  if(f.type==='shard'){const p=0.6+0.4*Math.sin(T*6+f.x);g.save();g.translate(f.x,f.y);
    const gr=g.createRadialGradient(0,-4,1,0,-4,18);gr.addColorStop(0,'rgba(255,220,120,'+(0.6*p)+')');gr.addColorStop(1,'rgba(255,120,30,0)');g.fillStyle=gr;g.beginPath();g.arc(0,-4,18,0,TAU);g.fill();
    g.fillStyle='#3a2a26';g.beginPath();g.moveTo(-8,0);g.lineTo(-5,-9);g.lineTo(2,-12);g.lineTo(8,-4);g.lineTo(6,0);g.closePath();g.fill();
    g.fillStyle='#ffb060';g.beginPath();g.moveTo(-3,-3);g.lineTo(0,-10);g.lineTo(3,-3);g.closePath();g.fill();g.fillStyle='#ffe8a0';g.fillRect(-0.6,-8,1.2,4);
    if(f.t>12&&Math.floor(T*8)%2)g.globalAlpha=0.4;g.restore();return;}
  if(f.type==='bolt'){
    if(f.t<f.warn){const a=f.t/f.warn;g.strokeStyle='rgba(220,210,255,'+(0.3+0.6*a)+')';g.lineWidth=2;g.beginPath();g.ellipse(f.x,f.y-2,30*(1-a)+10,5,0,0,TAU);g.stroke();
      g.fillStyle='rgba(200,190,255,'+(0.15*a)+')';g.fillRect(f.x-6,f.y-420,12,420);}
    else{const k=1-(f.t-f.warn)/0.35;if(k<=0.001)return;g.save();g.globalCompositeOperation='lighter';
      for(const [lw,al] of [[9,0.3],[3,0.95]]){g.strokeStyle='rgba(230,220,255,'+(al*k)+')';g.lineWidth=lw;g.beginPath();g.moveTo(f.x+rnd(-20,20),f.y-460);let yy=f.y-460;while(yy<f.y){yy+=40;g.lineTo(f.x+rnd(-18,18),Math.min(yy,f.y));}g.stroke();}
      g.fillStyle='rgba(255,255,255,'+(0.6*k)+')';g.beginPath();g.ellipse(f.x,f.y-3,40*k,8*k,0,0,TAU);g.fill();g.restore();}
    return;}
  if(f.type==='rock'){g.save();g.translate(f.x,f.y);
    if(f.t<f.warn){const gy=groundBelow(f.x,f.y);g.strokeStyle='rgba(220,200,170,'+(0.3+0.5*f.t/f.warn)+')';g.lineWidth=2;g.beginPath();g.ellipse(0,gy-f.y-2,14,4,0,0,TAU);g.stroke();g.translate(Math.sin(T*40)*1.5,0);}
    if(f.kind==='bone'){g.rotate(f.t*8);g.fillStyle='#e8dcc0';g.fillRect(-6,-1.4,12,2.8);g.beginPath();g.arc(-6,0,2.2,0,TAU);g.arc(6,0,2.2,0,TAU);g.fill();g.restore();return;}
    if(f.kind==='magma'){const gr=g.createRadialGradient(0,0,1,0,0,10);gr.addColorStop(0,'#fff0a0');gr.addColorStop(0.5,'#ff8a20');gr.addColorStop(1,'rgba(255,60,0,0)');g.fillStyle=gr;g.beginPath();g.arc(0,0,10,0,TAU);g.fill();g.fillStyle='#3a1206';g.beginPath();g.arc(0,0,4,0,TAU);g.fill();g.restore();return;}
    g.fillStyle='#5a4e48';g.beginPath();g.moveTo(-10,-6);g.lineTo(-2,-11);g.lineTo(9,-7);g.lineTo(11,4);g.lineTo(2,10);g.lineTo(-9,6);g.closePath();g.fill();
    g.fillStyle='#7a6e66';g.beginPath();g.moveTo(-6,-6);g.lineTo(0,-9);g.lineTo(5,-6);g.lineTo(0,-2);g.closePath();g.fill();g.restore();return;}
  if(f.type==='tornado'){
    const H2=190,fade=Math.min(1,(f.t-(f.born||0))/1.2,(f.life-f.t)/1.2);if(fade<=0)return;
    g.save();g.globalAlpha=fade;
    /* тело воронки: мягкая заливка от раскалённого низа к дымной верхушке */
    const sway=(q)=>Math.sin(T*2.2+q*3.4)*14*q;
    g.beginPath();
    for(let k=0;k<=20;k++){const q=k/20,yy=f.y-q*H2,rad=10+q*q*58;g.lineTo(f.x+sway(q)-rad,yy);}
    for(let k=20;k>=0;k--){const q=k/20,yy=f.y-q*H2,rad=10+q*q*58;g.lineTo(f.x+sway(q)+rad,yy);}
    g.closePath();
    const gr=g.createLinearGradient(0,f.y,0,f.y-H2);gr.addColorStop(0,'rgba(255,170,60,.72)');gr.addColorStop(0.35,'rgba(200,70,20,.58)');gr.addColorStop(1,'rgba(50,30,26,.42)');
    g.fillStyle=gr;g.fill();
    /* закрученные полосы: видна только передняя половина витка */
    g.lineCap='round';
    for(let k=0;k<16;k++){const q=(k+0.5)/16,yy=f.y-q*H2,rad=10+q*q*58,ph=T*6.5+k*0.9;
      const a0=(ph%TAU),cx=f.x+sway(q);
      g.strokeStyle=k%3===0?'rgba(255,230,150,.7)':k%3===1?'rgba(255,120,40,.6)':'rgba(70,40,30,.5)';g.lineWidth=1.6+q*2.2;
      g.beginPath();g.ellipse(cx,yy,rad*0.96,3+q*5,0,0.15*Math.PI+Math.sin(a0)*0.3,0.85*Math.PI+Math.sin(a0)*0.3);g.stroke();}
    /* обломки и угли на орбите */
    for(let k=0;k<10;k++){const q=((k*0.37+T*0.35)%1),yy=f.y-q*H2,rad=10+q*q*58,a=T*(4+k%3)+k*2.1,cx=f.x+sway(q)+Math.cos(a)*rad;
      if(Math.sin(a)<0)continue;g.fillStyle=k%2?'rgba(255,200,90,.9)':'rgba(60,40,34,.9)';g.fillRect(cx-1.5,yy-1.5,3,3);}
    /* пылевое кольцо у основания и свечение */
    g.fillStyle='rgba(60,40,34,.35)';g.beginPath();g.ellipse(f.x,f.y-3,34+Math.sin(T*8)*3,6,0,0,TAU);g.fill();
    g.globalCompositeOperation='lighter';softGlow(g,f.x,f.y-24,70,'#ff7a2a',0.35);
    g.restore();return;}
}
function updateHell(dt){
  if(player.noRegenT>0)player.noRegenT-=dt;
  if(perkLv('regen')>0&&player.hp>0&&player.hp<player.maxHp&&!(player.noRegenT>0)&&G.time-(player.lastHurtT||-99)>4)player.hp=Math.min(player.maxHp,player.hp+player.maxHp*0.0012*perkLv('regen')*dt);
  if(G.dim!==1||G.scene!=='mine'){player.heat=0;stormOn=0;hellFx.length=0;ashEv=null;return;}
  const d=Math.max(0,player.y)/TILE,bi=biomeAt(d)-5;
  if(d>(player.prog.hellDepth||0)){player.prog.hellDepth=Math.floor(d);if(player.contracts)contractEvent('depth',0,d);}
  /* жар */
  if(player.iceT>0)player.iceT-=dt;
  let rate=d<14?0:HEAT_RATE[clamp(bi,0,4)];
  {const tx=Math.floor(player.x/TILE),ty=Math.floor((player.y-20)/TILE);let hot=0;
    for(let yy=-2;yy<=2;yy++)for(let xx=-2;xx<=2;xx++){const t=getTile(tx+xx,ty+yy);if(t===T_LAVA||t===T_HOT)hot++;}
    rate+=Math.min(3,hot*0.35);}
  if(stormOn>0)rate+=0.8;
  rate+=evHeat();
  rate*=1-heatResist();
  if(player.iceT>0||ritOn('frost'))rate=Math.min(rate,player.iceT>0?-4:0);
  if(cheats.god)rate=-10;
  player.heat=clamp((player.heat||0)+rate*dt,0,100);
  if(player.heat>=100){
    player.heatDmgT=(player.heatDmgT||0)-dt;
    if(player.heatDmgT<=0){player.heatDmgT=0.6;hurtPlayer(Math.max(4,player.maxHp*0.025),'перегрев',{burn:1});floatText(player.x,player.y-70,'🔥 Перегрев!','#ff7a2a');}
  }
  /* пепельная буря в пустошах */
  if(d>=14&&!(player.hp<=0)){
    updateAshEvent(dt,clamp(bi,0,4));
    if(stormOn>0){stormOn-=dt;if(!relicOn('mask'))player.vx+=Math.sin(G.time*0.5)*120*dt;
      if(settings.quality!=='low'&&Math.random()<0.9){const hw=view.W/(2*view.scale),hh=view.H/(2*view.scale);spawnPart(G.cam.x-hw-10,G.cam.y+rnd(-hh,hh),rnd(260,420),rnd(-20,40),rnd(1.5,2.6),Math.random()<0.8?'#9a8a80':'#ff8a4a',rnd(1.4,2.6),0);}}
  }else{stormOn=0;if(ashEv)endAshEvent(true);ashEvT=Math.max(ashEvT,20);}
  for(let i=hellFx.length-1;i>=0;i--){
    const f=hellFx[i];
    if(f.type!=='meteor'){if(updAshFx(f,dt))hellFx.splice(i,1);continue;}
    f.t+=dt;
    if(f.t<f.warn)continue;
    f.vy+=1400*dt;f.y+=f.vy*dt;
    if(Math.random()<0.6)spawnPart(f.x+rnd(-5,5),f.y-8,rnd(-20,20),rnd(-80,-20),0.5,'#ff9a3c',3,0);
    if(Math.hypot(player.x-f.x,player.y-player.h*0.5-f.y)<22&&!cheats.god){hurtPlayer(f.dmg,'огненный дождь',{burn:3});explode(f.x,f.y,40,0);hellFx.splice(i,1);continue;}
    if(solidAtPx(f.x,f.y)||f.t>6){explode(f.x,f.y-6,44,f.dmg*0.6);if(f.shard)hellFx.push({type:'shard',x:f.x,y:Math.floor(f.y/TILE)*TILE,t:0});hellFx.splice(i,1);}
  }
  /* ядовитые выбросы гейзеров в серных топях */
  if(bi===2){gasT-=dt;if(gasT<=0){gasT=rnd(6,11);
    const tx0=Math.floor(player.x/TILE)-10,ty0=Math.floor(player.y/TILE)-8;
    for(let k=0;k<30;k++){const tx=tx0+Math.floor(Math.random()*20),ty=ty0+Math.floor(Math.random()*16);
      if(getTile(tx,ty)===T_VENT&&getTile(tx,ty-1)===T_AIR){gasCloud(tx*TILE+16,(ty-1)*TILE,80,90,6);break;}}}}
}
function drawHellFx(g){
  for(const f of hellFx){
    if(f.type!=='meteor'){drawAshFx(g,f);continue;}
    if(f.t<0)continue;
    if(f.t<f.warn){
      let ty=Math.floor((player.y)/TILE)-4;const tx=Math.floor(f.x/TILE);
      for(let k=0;k<20&&!isSolid(tx,ty+1);k++)ty++;
      const a=f.t/f.warn;g.strokeStyle='rgba(255,140,60,'+(0.3+0.6*a)+')';g.lineWidth=2;
      g.beginPath();g.ellipse(f.x,(ty+1)*TILE-2,8+16*(1-a),3+4*(1-a),0,0,TAU);g.stroke();
    }else{
      const gr=g.createRadialGradient(f.x,f.y,2,f.x,f.y,20);gr.addColorStop(0,'rgba(255,240,180,1)');gr.addColorStop(0.4,'rgba(255,120,40,.9)');gr.addColorStop(1,'rgba(255,60,10,0)');
      g.fillStyle=gr;g.beginPath();g.arc(f.x,f.y,20,0,TAU);g.fill();g.fillStyle='#3a1a10';g.beginPath();g.arc(f.x,f.y,7,0,TAU);g.fill();
    }
  }
}
/* ---------- Алтарь душ: вечные благословения ---------- */
const PERKS=[
  {id:'vigor'  ,ic:'❤️',n:'Живучесть'      ,d:'+6% к максимальному здоровью'     ,max:5,base:40},
  {id:'fury'   ,ic:'⚔️',n:'Ярость'         ,d:'+8% к урону оружием'             ,max:5,base:40},
  {id:'frost'  ,ic:'❄️',n:'Хладнокровие'   ,d:'+7% защиты от Жара'              ,max:5,base:50},
  {id:'harvest',ic:'👻',n:'Жатва душ'      ,d:'+25% душ с врагов'               ,max:4,base:60},
  {id:'greed'  ,ic:'💰',n:'Алчность'       ,d:'+6% к цене руды на рынках'       ,max:5,base:70},
  {id:'regen'  ,ic:'✨',n:'Регенерация'    ,d:'+0.12% здоровья в секунду, если 4 с не получал урона',max:3,base:140},
  {id:'slayer' ,ic:'☠️',n:'Убийца гигантов',d:'+10% урона по крупным врагам (големы, колоссы, инферналы) и боссам',max:3,base:120},
  {id:'miner'  ,ic:'⛏',n:'Чутьё рудокопа' ,d:'+5% шанс двойной руды'            ,max:5,base:90 ,lv:2},
  {id:'tough'  ,ic:'🪨',n:'Каменная кожа'  ,d:'−3% получаемого урона (общая защита не выше 68%)',max:5,base:90 ,lv:2},
  {id:'lucky'  ,ic:'🍀',n:'Удача охотника' ,d:'+10% шанс материалов с врагов'     ,max:5,base:110,lv:3},
  {id:'vamp'   ,ic:'🦇',n:'Вампиризм'      ,d:'0.5% урона удара мечом возвращается здоровьем (не больше 0.6% HP за взмах)',max:5,base:140,lv:4},
  {id:'swift'  ,ic:'💨',n:'Проворство'     ,d:'+5% скорость бега'                ,max:4,base:120,lv:3}
];
function perkCost(pk){return Math.round(pk.base*Math.pow(perkLv(pk.id)+1,1.7));}
/* ---------- Доска контрактов ---------- */
function makeContract(){
  const r=Math.random(),deep=Math.max(player.prog.hellDepth||0,40);
  if(r<0.45){
    const pool=MOBDEFS.filter(d=>d.dim===1&&!d.neutral&&d.d0<=deep+60);
    const def=pool[Math.floor(Math.random()*pool.length)]||MOBDEFS.find(d=>d.id==='hound');
    const n=4+Math.floor(Math.random()*8);
    return {type:'kill',target:def.id,need:n,have:0,title:'Убить: '+def.name+' ×'+n,rc:Math.round(def.hp*n*25/1000)*1000,rs:Math.round(def.souls*n*1.5)};
  }else if(r<0.85){
    const pool=ORES.filter(o=>o&&o.dim===1&&o.tier<=player.pickLvl&&o.dmin<=deep+80);
    const o=pool[Math.floor(Math.random()*pool.length)]||ORES[18];
    const n=8+Math.floor(Math.random()*16);
    return {type:'ore',target:o.id,need:n,have:0,title:'Добыть: '+o.name+' ×'+n,rc:Math.round(o.price*n*0.7/1000)*1000,rs:6+Math.floor(n/2)};
  }
  const marks=[250,550,850,1200,1500];let tgt=marks.find(m=>m>deep)||1600;
  return {type:'depth',target:0,need:tgt,have:Math.floor(player.prog.hellDepth||0),title:'Спуститься в Аду до '+tgt+' м',rc:Math.round(tgt*900/1000)*1000,rs:Math.round(tgt/12)};
}
function ensureContracts(){
  if(!player.contracts||!Array.isArray(player.contracts.list))player.contracts={list:[],done:0};
  while(player.contracts.list.length<3)player.contracts.list.push(makeContract());
}
function contractEvent(type,id,n){
  if(G.dim!==1||!player.contracts)return;
  for(const c of player.contracts.list){
    if(c.type!==type||c.ready)continue;
    if(type==='depth'){c.have=Math.max(c.have,Math.floor(n));}
    else if(c.target===id)c.have+=n;
    if(c.have>=c.need){c.have=c.need;c.ready=true;UI.toast('📜 Контракт выполнен: '+c.title+' — награда на Доске');SFX.coin();}
  }
}
/* ---------- Портал в Ад: условия ---------- */
const PORTAL_COST=2000000;
function portalReqs(){
  const P=player;
  return [
    {ok:P.pickLvl>=6,t:'⛏ Кирка VI',v:'ур. '+Math.min(P.pickLvl,6)+'/6'},
    {ok:P.swordLvl>=6,t:'⚔️ Пустотный клинок',v:'ур. '+Math.min(P.swordLvl,6)+'/6'},
    {ok:P.armorLvl>=6,t:'🛡 Броня Бездны',v:'ур. '+Math.min(P.armorLvl,6)+'/6'},
    {ok:P.gunLvl>=6,t:'🌀 Огнестрел VI',v:'ур. '+Math.min(P.gunLvl,6)+'/6'},
    {ok:(P.digSpeedLvl||0)>=DIG_SPEED_MAX,t:'⚡ Скорость копания',v:(P.digSpeedLvl||0)+'/'+DIG_SPEED_MAX},
    {ok:P.torchLvl>=5,t:'🔦 Факел',v:P.torchLvl+'/5',opt:1},
    {ok:P.drillBought&&P.drillLvl>=6,t:'🛠️ Бур',v:(P.drillBought?P.drillLvl:0)+'/6'},
    {ok:P.barricadeBought&&P.barricadeLvl>=4,t:'🧱 Баррикады',v:(P.barricadeBought?P.barricadeLvl:0)+'/4',opt:1},
    {ok:P.fallProtLvl>=3,t:'🥾 Амортизаторы',v:P.fallProtLvl+'/3',opt:1},
    {ok:!!P.grappleUnlocked,t:'🪝 Пушка-крюк',v:P.grappleUnlocked?'есть':'нет'},
    {ok:!!P.prog.heart,t:'💜 Сердце Бездны',v:P.prog.heart?'есть':'святилище в Бездне, 1150–1450 м',key:1},
    {ok:!!P.prog.key,t:'🗝 Ключ Бездны',v:P.prog.key?'есть':'босс на 2000 м',key:1},
    {ok:P.money>=PORTAL_COST||cheats.infMoney,t:'💰 2 000 000 монет',v:fmt(P.money)+' / '+fmt(PORTAL_COST),key:1}
  ];
}
/* ---------- Катсцена перехода ---------- */
function startCutscene(to){
  UI.clear();resetAllInputs();
  G.cut={t:0,to:to,dur:10.2,from:G.dim,seed:Math.random()*1000};
  G.scene='cutscene';
  AU.capture=[];try{cutsceneSound(to,1);}catch(e){}G.cut.nodes=AU.capture;AU.capture=null;vib(60);
}
/* звуковая партитура перехода: всё расписано по времени заранее */
function cutsceneSound(to,sp){
  if(!AU.ok||!AU.ok())return;
  const hell=to===1,T=(x)=>x/sp;
  /* нарастающий гул и ветер */
  AU.osc('sine',38,T(3.3),0.32,0,{to:96,a:T(2.6),sus:0.1});
  AU.osc('sawtooth',55,T(3.2),0.08,0,{to:160,a:T(2.4),lp:700,sus:0.1});
  AU.noise(T(3.2),300,0.16,0,{type:'bandpass',to:2600,q:1.4,a:T(2.6)});
  /* руны вспыхивают по одной */
  const sc=hell?[0,1,3,5,7,8,10,12,13,15,17,19]:[0,2,4,7,9,12,14,16,19,21,24,26];
  for(let k=0;k<12;k++)AU.bell(220*Math.pow(2,sc[k]/12)*(hell?1:1.5),0.9,0.07,T(1.2+k*0.13),{ratio:hell?1.41:2,index:1.1,rev:0.5,pan:Math.cos(k/12*TAU)*0.6});
  /* разряды */
  for(const z of [1.7,2.1,2.45,2.75])AU.osc('sawtooth',rr(1800,2600),0.18,0.09,T(z),{to:160,lp:4000,rev:0.3,pan:rr(-0.7,0.7)}),AU.noise(0.12,5000,0.1,T(z),{type:'highpass'});
  /* втягивание: свист вверх */
  AU.osc('sine',300,T(0.5),0.2,T(2.75),{to:2400,a:T(0.4)});
  /* удар-вспышка */
  AU.noise(1.6,1800,0.5,T(3.1),{type:'lowpass',to:70,rev:0.6});AU.osc('sine',95,1.6,0.55,T(3.1),{to:26});AU.osc('triangle',190,0.8,0.18,T(3.1),{to:50,rev:0.5});
  /* тоннель: шум потока и сердце */
  AU.noise(T(2.6),400,0.18,T(3.35),{type:'bandpass',to:3200,q:0.9,a:0.5});
  for(const z of [3.7,4.5,5.3])AU.osc('sine',62,0.35,0.4,T(z),{to:36}),AU.osc('sine',58,0.3,0.28,T(z+0.22),{to:34});
  if(hell){
    /* рёв огня и мрачный хор */
    AU.noise(2.6,900,0.32,T(5.6),{type:'lowpass',to:300,a:0.25,rev:0.4});
    for(const f of [110,116.5,164.8,220])AU.osc('sawtooth',f,3,0.05,T(5.8),{lp:1100,a:0.6,sus:1.4,rev:0.6});
    AU.osc('sine',55,2.4,0.4,T(5.8),{to:40,a:0.05,rev:0.4});
  }else{
    for(const [f,d] of [[523,0],[659,0.08],[784,0.16],[1047,0.24],[1319,0.36]])AU.bell(f,2.6,0.1,T(5.6)+d,{ratio:2,index:0.8,rev:0.7});
    AU.osc('sine',262,2.8,0.12,T(5.6),{a:0.6,sus:1.2,rev:0.6});AU.noise(1.8,6000,0.05,T(5.6),{type:'highpass',a:0.4,rev:0.6});
  }
  /* выброс из портала и приземление */
  AU.osc('sine',900,0.35,0.12,T(6.0),{to:240,rev:0.4});AU.noise(0.4,2400,0.12,T(6.0),{type:'bandpass',to:600,q:1});
  AU.osc('sine',90,0.4,0.42,T(6.62),{to:38});AU.noise(0.35,700,0.25,T(6.62),{type:'lowpass',to:120});
  /* портал за спиной схлопывается */
  AU.osc('sine',600,0.8,0.1,T(8.0),{to:90,rev:0.6});AU.bell(hell?330:660,1.6,0.06,T(8.4),{ratio:hell?1.41:2,index:1,rev:0.7});
}
function finishCutscene(){
  const c=G.cut;if(!c)return;
  G.cut=null;
  if(c.nodes&&c.t<c.dur-0.2){for(const n of c.nodes){try{n.stop();}catch(e){}}}
  G.cutHide=false;
  if(!c.switched){switchDimension(c.to);const pb=buildings.find(b=>b.id==='portal3'||b.id==='portal');lobbyPlayer.x=pb?pb.x+(c.to===1?-150:130):300;}
  G.scene='lobby';G.cam.x=lobbyPlayer.x;G.cam.y=0;lobbyPlayer.animState='idle';lobbyPlayer.vy=0;lobbyPlayer.y=0;
  UI.toast(c.to===1?'🔥 Добро пожаловать в Ад':'🌄 Ты снова на Земле надежды');
  G.fadeIn=0.9;
  saveGame();
}
function renderCutscene(dt){
  const c=G.cut;if(!c)return;
  /* ~10 с: 0–3.35 активация портала · 3.35–5.35 тоннель · 5.35–9.6 прибытие и титр · 9.6–10.2 затемнение */
  const W=view.W,H=view.H,t=c.t,T=t,hell=c.to===1,cx=W/2,M=Math.max(W,H),R=Math.min(W,H)*0.19;
  const fromHell=c.from===1;
  const SRC=fromHell?{s0:'#0a0204',s1:'#6a1a08',s2:'#c8401a',m1:'#2a0c08',m2:'#160604',gnd:'#1a0a08',edge:'#4a1a10',ring:'#2a1a20'}
                    :{s0:'#0a1428',s1:'#3a3a6a',s2:'#d08850',m1:'#2a2a3e',m2:'#181826',gnd:'#1e1812',edge:'#3a5a2a',ring:'#4a4a5a'};
  const pal=hell?{a:'#6a2ad0',b:'#ff4a1a',c:'#ffd080',d:'#2a0606'}:{a:'#2a6ad0',b:'#5ae0ff',c:'#e0fff8',d:'#06121a'};
  const rnd2=(k)=>{const x=Math.sin(k*127.1+c.seed)*43758.5;return x-Math.floor(x);};
  const ss=(a,b,x)=>{const q=clamp((x-a)/(b-a),0,1);return q*q*(3-2*q);};
  /* каменное кольцо портала на постаменте: (x,y) — центр кольца, r — радиус, ig — сила вихря */
  const portalRing=(x,y,r,ig,col,lit,spin)=>{
    const gy=y+r*1.32;
    /* постамент со ступенями */
    ctx.fillStyle=shadeHex(col,-0.25);ctx.beginPath();ctx.moveTo(x-r*0.62,gy);ctx.lineTo(x-r*0.42,y+r*0.82);ctx.lineTo(x+r*0.42,y+r*0.82);ctx.lineTo(x+r*0.62,gy);ctx.closePath();ctx.fill();
    ctx.fillStyle=shadeHex(col,-0.1);ctx.fillRect(x-r*0.86,gy-r*0.13,r*1.72,r*0.13);ctx.fillRect(x-r*1.02,gy-r*0.05,r*2.04,r*0.05+2);
    ctx.fillStyle='rgba(255,255,255,.07)';ctx.fillRect(x-r*0.86,gy-r*0.13,r*1.72,2);
    /* вихрь */
    if(ig>0){ctx.save();ctx.translate(x,y);
      const vg=ctx.createRadialGradient(0,0,2,0,0,r*0.95);vg.addColorStop(0,hexA(pal.c,0.95*ig));vg.addColorStop(0.35,hexA(pal.b,0.75*ig));vg.addColorStop(0.8,hexA(pal.a,0.6*ig));vg.addColorStop(1,hexA(pal.d,0));
      ctx.fillStyle=vg;ctx.beginPath();ctx.arc(0,0,r*0.9,0,TAU);ctx.fill();
      ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
      for(let k=0;k<7;k++){ctx.rotate(TAU/7);ctx.strokeStyle=hexA(k%2?pal.b:pal.c,0.35*ig);ctx.lineWidth=Math.max(1.5,r*0.025);ctx.beginPath();
        for(let j=0;j<=24;j++){const q=j/24,a=q*5+spin*2,rr2=q*r*0.88;const px=Math.cos(a)*rr2,py=Math.sin(a)*rr2;if(j)ctx.lineTo(px,py);else ctx.moveTo(px,py);}ctx.stroke();}
      ctx.globalCompositeOperation='source-over';ctx.restore();}
    /* кольцо из каменных блоков с рунами */
    ctx.save();ctx.translate(x,y);
    ctx.strokeStyle=col;ctx.lineWidth=r*0.17;ctx.beginPath();ctx.arc(0,0,r,0,TAU);ctx.stroke();
    ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1.5;for(let k=0;k<16;k++){const a=k/16*TAU;ctx.beginPath();ctx.moveTo(Math.cos(a)*r*0.92,Math.sin(a)*r*0.92);ctx.lineTo(Math.cos(a)*r*1.08,Math.sin(a)*r*1.08);ctx.stroke();}
    ctx.strokeStyle='rgba(255,255,255,.1)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r*0.94,Math.PI*1.1,Math.PI*1.7);ctx.stroke();
    const runes='ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃ';ctx.font='700 '+Math.max(8,Math.round(r*0.12))+'px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';
    for(let k=0;k<12;k++){const a=k/12*TAU-Math.PI/2,l=clamp(lit*12-k,0,1);const rx=Math.cos(a)*r,ry=Math.sin(a)*r;
      ctx.fillStyle=l>0?hexA(pal.c,0.4+0.6*l):'rgba(160,160,180,.28)';ctx.fillText(runes[k],rx,ry);
      if(l>0){ctx.globalCompositeOperation='lighter';softGlow(ctx,rx,ry,r*0.17,pal.b,0.55*l);ctx.globalCompositeOperation='source-over';}}
    ctx.textBaseline='alphabetic';ctx.restore();
    return gy;
  };
  const sky=(s0,s1,s2,gy)=>{const g=ctx.createLinearGradient(0,0,0,gy);g.addColorStop(0,s0);g.addColorStop(0.6,s1);g.addColorStop(1,s2);ctx.fillStyle=g;ctx.fillRect(-W,-H,W*3,gy+H);};
  const ridge=(gy,hh,col,seed,n)=>{ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(-W,gy+2);for(let k=0;k<=n;k++){const x=-W+k*W*3/n;ctx.lineTo(x,gy-hh*(0.35+0.65*rnd2(k*3+seed)));}ctx.lineTo(W*2,gy+2);ctx.closePath();ctx.fill();};
  ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
  const shk=(T>1.6&&T<3.1)?(T-1.6)*2.2:(T>3.1&&T<3.7)?(3.7-T)*16:(T>6.6&&T<6.9)?(6.9-T)*18:0;
  ctx.save();ctx.translate(rnd(-shk,shk),rnd(-shk,shk));
  /* окно портала в настоящем лобби: центр, форма проёма, где приземляться */
  const portalGeo=()=>{const b=buildings.find(q=>q.id==='portal3'||q.id==='portal');if(!b)return null;
    return G.dim===1?{b,x:b.x,y:-130,rx:80,ry:80,ring:true,land:b.x-118,stand:b.x-215}:{b,x:b.x,y:-130,rx:80,ry:80,ring:true,land:b.x+150,stand:b.x-230};};
  /* кадр лобби с приближением к порталу: настоящая отрисовка лобби, только масштаб и камера свои */
  const lobbyShot=(geo,z,hidePl,camX)=>{const sc0=view.scale,cx0=G.cam.x,cy0=G.cam.y,Y0=geo.y*sc0+H*0.62;
    view.scale=sc0*z;G.cam.x=camX!==undefined?camX:geo.x;G.cam.y=geo.y-(Y0-H*0.62)/view.scale;G.cutHide=hidePl;
    try{renderLobby();}catch(e){G.cutErr=String(e&&e.stack||e);}
    const st={sc:view.scale,cx:G.cam.x,cy:G.cam.y};view.scale=sc0;G.cam.x=cx0;G.cam.y=cy0;G.cutHide=false;return st;};
  const toWorld=(st)=>ctx.setTransform(dpr*st.sc,0,0,dpr*st.sc,dpr*(W/2-st.cx*st.sc),dpr*(H*0.62-st.cy*st.sc));
  const clipOpening=(geo)=>{ctx.beginPath();if(geo.ring)ctx.arc(geo.x,geo.y,geo.rx,0,TAU);
    else{const x=geo.x;ctx.moveTo(x-46,-16);ctx.lineTo(x-46,-104);ctx.quadraticCurveTo(x-46,-138,x,-138);ctx.quadraticCurveTo(x+46,-138,x+46,-104);ctx.lineTo(x+46,-16);ctx.closePath();}ctx.clip();};
  const vortexAt=(geo,ig,spin,palV)=>{if(ig<=0)return;ctx.save();clipOpening(geo);ctx.translate(geo.x,geo.y);ctx.scale(1,geo.ry/geo.rx);const r=geo.rx*1.15;
    const vg=ctx.createRadialGradient(0,0,2,0,0,r);vg.addColorStop(0,hexA(palV.c,0.95*ig));vg.addColorStop(0.35,hexA(palV.b,0.8*ig));vg.addColorStop(0.8,hexA(palV.a,0.7*ig));vg.addColorStop(1,hexA(palV.d,0.5*ig));
    ctx.fillStyle=vg;ctx.fillRect(-r,-r,r*2,r*2);ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
    for(let k=0;k<7;k++){ctx.rotate(TAU/7);ctx.strokeStyle=hexA(k%2?palV.b:palV.c,0.4*ig);ctx.lineWidth=2.4;ctx.beginPath();
      for(let j=0;j<=24;j++){const q=j/24,a=q*5+spin*2,rr2=q*r*0.95;const px=Math.cos(a)*rr2,py=Math.sin(a)*rr2;if(j)ctx.lineTo(px,py);else ctx.moveTo(px,py);}ctx.stroke();}
    ctx.restore();ctx.save();ctx.globalCompositeOperation='lighter';softGlow(ctx,geo.x,geo.y,geo.rx*2.6,palV.b,0.4*ig);ctx.restore();};
  const palFrom=fromHell?{a:'#2a6ad0',b:'#5ae0ff',c:'#e0fff8',d:'#06121a'}:{a:'#6a2ad0',b:'#ff4a1a',c:'#ffd080',d:'#2a0606'};
  if(T<3.35){
    /* ===== 1. активация настоящего портала в лобби ===== */
    const geo=portalGeo();
    if(geo){
      const z=1+ss(1.3,3.3,T)*1.5,walk=clamp(T/1.6,0,1),lift=ss(1.9,3.1,T);
      lobbyPlayer.x=lerp(geo.stand,geo.x-(geo.ring?30:10),walk);lobbyPlayer.y=0;lobbyPlayer.facing=1;lobbyPlayer.animState=walk<1?'run':'idle';lobbyPlayer.anim=T*1.6;
      const st=lobbyShot(geo,z,lift>0);
      toWorld(st);
      const ig=ss(1.2,2.6,T),spin=T*(1+ig*5);
      /* светящиеся трещины от портала по земле */
      ctx.strokeStyle=hexA(palFrom.b,0.25+0.6*ig);ctx.lineWidth=2;ctx.lineCap='round';
      for(let k=0;k<7;k++){ctx.beginPath();let x=geo.x+(k-3)*14,y=1;ctx.moveTo(x,y);for(let j=0;j<5;j++){x+=(k-3)*22*ig+(rnd2(k*7+j)-0.5)*20;y+=6+rnd2(k+j*3)*7;ctx.lineTo(x,y);}ctx.stroke();}
      vortexAt(geo,ig,spin,palFrom);
      /* разряды по краю проёма */
      if(T>1.6&&Math.random()<0.4){ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=hexA(palFrom.c,0.9);ctx.lineWidth=2;ctx.beginPath();
        let a=Math.random()*TAU,x=geo.x+Math.cos(a)*geo.rx*1.05,y=geo.y+Math.sin(a)*geo.ry*1.05;ctx.moveTo(x,y);for(let k=0;k<6;k++){x+=(geo.x-x)/6+rnd(-8,8);y+=(geo.y-y)/6+rnd(-8,8);ctx.lineTo(x,y);}ctx.stroke();ctx.restore();}
      /* искры и пыль затягивает в портал */
      ctx.save();ctx.globalCompositeOperation='lighter';
      for(let k=0;k<70;k++){const a=rnd2(k)*TAU+T*(0.5+ig),d=((rnd2(k+99)+T*(0.25+ig*0.6))%1),r=360*(1-d);
        ctx.fillStyle=hexA(k%3?palFrom.b:palFrom.c,0.8*ig*d);ctx.beginPath();ctx.arc(geo.x+Math.cos(a)*r,geo.y+Math.sin(a)*r*0.7,1+d*1.6,0,TAU);ctx.fill();}
      ctx.restore();
      /* героя отрывает от земли и втягивает в проём */
      if(lift>0&&T<3.15){const sx=lobbyPlayer.x,px=lerp(sx,geo.x,Math.pow(lift,1.2))+Math.sin(T*30)*1.6*lift,py=lerp(0,geo.y+20,Math.pow(lift,1.3));
        ctx.save();ctx.translate(px,py);ctx.scale(1-lift*0.65,1+lift*0.5-lift*lift*0.9);ctx.rotate(lift*lift*4);ctx.globalAlpha=1-lift*0.5;
        drawPlayerSprite(ctx,0,0,'jump',T*1.6,1,{armor:player.armorLvl,pickLvl:player.pickLvl,torch:player.torchLvl,tool:null,groundY:-py});ctx.restore();ctx.globalAlpha=1;
        ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=hexA(palFrom.c,0.45*lift);ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(px,py-18);ctx.lineTo(geo.x,geo.y);ctx.stroke();ctx.restore();}
      ctx.setTransform(dpr,0,0,dpr,0,0);
    }
    if(T>2.95){const f=clamp(1-Math.abs(T-3.2)/0.3,0,1);ctx.fillStyle='rgba(255,255,255,'+f+')';ctx.fillRect(-20,-20,W+40,H+40);}
  }else if(T<5.6){
    /* ===== 2. тоннель между мирами ===== */
    if(!c.switched&&T>4.3){c.switched=true;try{switchDimension(c.to);}catch(e){}G.scene='cutscene';}
    const k=T-3.35,mix=clamp((k-0.6)/2,0,1),cy=H*0.46;
    const bgc=ctx.createRadialGradient(cx,cy,10,cx,cy,M*0.8);bgc.addColorStop(0,hexA(mix>0.5?pal.b:pal.a,0.25));bgc.addColorStop(1,'rgba(0,0,0,1)');ctx.fillStyle=bgc;ctx.fillRect(0,0,W,H);
    ctx.globalCompositeOperation='lighter';
    for(let i=0;i<26;i++){const z=((i/26)+k*0.6)%1,r=Math.pow(z,2.2)*M*1.2;
      ctx.strokeStyle=hexA(i%2?pal.b:(mix>0.5?pal.b:pal.a),0.1+z*0.5);ctx.lineWidth=2+z*12;
      ctx.beginPath();ctx.ellipse(cx+Math.sin(k*2+i)*16*z,cy+Math.cos(k*1.7+i)*12*z,r,r*0.75,k*0.4+i*0.25,0,TAU);ctx.stroke();}
    for(let i=0;i<90;i++){const a=i*0.9+k*0.25,z=((i*0.137)+k*1.1)%1,r=Math.pow(z,2)*M;
      ctx.strokeStyle=hexA(i%4?pal.c:pal.b,z*0.85);ctx.lineWidth=1+z*2.4;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*r*0.75,cy+Math.sin(a)*r*0.75);ctx.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);ctx.stroke();}
    ctx.globalCompositeOperation='source-over';
    for(let i=0;i<14;i++){const z=((rnd2(i+300)+k*0.5)%1),a=rnd2(i+500)*TAU,r=Math.pow(z,2.4)*M*0.9,sz=4+z*z*40;
      ctx.save();ctx.translate(cx+Math.cos(a)*r,cy+Math.sin(a)*r*0.8);ctx.rotate(k*2+i);ctx.globalAlpha=Math.min(1,z*2);
      ctx.fillStyle=hell?(i%3?'#2a1410':'#5a1a10'):(i%3?'#3a3a48':'#5a4a30');ctx.beginPath();ctx.moveTo(-sz,-sz*0.4);ctx.lineTo(-sz*0.2,-sz*0.8);ctx.lineTo(sz*0.9,-sz*0.3);ctx.lineTo(sz*0.6,sz*0.7);ctx.lineTo(-sz*0.7,sz*0.5);ctx.closePath();ctx.fill();
      ctx.fillStyle=hexA(i%2?pal.b:pal.c,0.9);ctx.fillRect(-sz*0.15,-sz*0.15,sz*0.3,sz*0.3);ctx.restore();}
    ctx.globalAlpha=1;
    /* сам герой кувыркается в потоке — видно, что это его путь */
    {const sc2=Math.min(1.3,H/520)*(0.7+0.3*Math.sin(k*2)),px=cx+Math.sin(k*1.6)*W*0.06,py=cy+Math.cos(k*1.3)*H*0.04;
      ctx.globalCompositeOperation='lighter';softGlow(ctx,px,py-12*sc2,40*sc2,pal.c,0.35);ctx.globalCompositeOperation='source-over';
      ctx.save();ctx.translate(px,py);ctx.rotate(k*2.6);ctx.scale(sc2,sc2);ctx.translate(0,22);drawPlayerSprite(ctx,0,0,'jump',k*2,1,{armor:player.armorLvl,pickLvl:player.pickLvl,torch:player.torchLvl,tool:null,swim:true});ctx.restore();}
    if(hell&&k>0.8){for(let i=0;i<5;i++){const z=((rnd2(i+800)+k*0.35)%1),a=rnd2(i+900)*TAU,r=Math.pow(z,2)*M*0.8;if(z<0.35)continue;
      ctx.save();ctx.translate(cx+Math.cos(a)*r,cy+Math.sin(a)*r*0.8);ctx.scale(z*2,z*2);ctx.globalAlpha=0.3*Math.sin(z*Math.PI);
      ctx.fillStyle='#d8ccb0';ctx.beginPath();ctx.arc(0,-2,9,Math.PI*0.9,Math.PI*2.1);ctx.quadraticCurveTo(9,6,5,8);ctx.lineTo(-5,8);ctx.quadraticCurveTo(-9,6,-9,-1);ctx.fill();
      ctx.fillStyle='#000';ctx.beginPath();ctx.ellipse(-3.5,-1,2.4,2.8,0,0,TAU);ctx.ellipse(3.5,-1,2.4,2.8,0,0,TAU);ctx.fill();ctx.restore();}ctx.globalAlpha=1;}
    const fl=clamp(1-Math.abs(T-5.45)/0.2,0,1);if(fl>0){ctx.fillStyle='rgba(255,255,255,'+fl+')';ctx.fillRect(-20,-20,W+40,H+40);}
  }else{
    /* ===== 3. прибытие: настоящий портал лобби выбрасывает героя ===== */
    if(!c.switched){c.switched=true;try{switchDimension(c.to);}catch(e){}G.scene='cutscene';}
    const a0=T-5.6,geo=portalGeo();
    if(geo){
      const z=1.35-0.35*ss(0,3.2,a0),ig=1-ss(2.0,3.2,a0),landed=a0>=1.02;
      const w=ss(1.6,3.0,a0),dirW=geo.ring?-1:1;
      lobbyPlayer.x=geo.land+dirW*w*70;lobbyPlayer.y=0;lobbyPlayer.facing=dirW;lobbyPlayer.anim=T*1.6;lobbyPlayer.animState=(w>0&&w<1)?'run':'idle';
      const st=lobbyShot(geo,z,!landed||a0<1.45,geo.x+(geo.land-geo.x)*0.45);
      toWorld(st);
      vortexAt(geo,ig,T*3,pal);
      if(a0>=0.4&&a0<1.45){let px,py,rot=0,sq=0;
        if(a0<1.02){const q=(a0-0.4)/0.62;px=lerp(geo.x,geo.land,q);py=lerp(geo.y+10,0,q)-Math.sin(q*Math.PI)*70;rot=(1-q)*-5.5*dirW;}
        else{px=geo.land;py=0;sq=Math.sin(clamp((a0-1.02)/0.43,0,1)*Math.PI)*0.9;}
        if(a0>=1.02&&a0<1.4){const d=(a0-1.02)/0.38;ctx.fillStyle=hell?'rgba(90,60,50,'+(0.5*(1-d))+')':'rgba(150,130,100,'+(0.5*(1-d))+')';
          for(const s2 of [-1,1]){ctx.beginPath();ctx.ellipse(px+s2*(10+d*34),-4-d*6,8+d*10,4+d*4,0,0,TAU);ctx.fill();}}
        ctx.save();ctx.translate(px,py);if(rot){ctx.translate(0,-22);ctx.rotate(rot);ctx.translate(0,22);}
        drawPlayerSprite(ctx,0,0,a0<1.02?'jump':'idle',T*1.6,dirW,{armor:player.armorLvl,pickLvl:player.pickLvl,torch:player.torchLvl,tool:null,sq:sq,vy:a0<1.02?-200:0,groundY:-py});ctx.restore();}
      if(a0<1.0){ctx.save();ctx.globalCompositeOperation='lighter';for(let k=0;k<30;k++){const d=((rnd2(k+700)+a0*1.4)%1),a=rnd2(k+710)*TAU,r=20+d*160;
        ctx.fillStyle=hexA(k%2?pal.b:pal.c,0.8*(1-d));ctx.beginPath();ctx.arc(geo.x+Math.cos(a)*r,geo.y+Math.sin(a)*r*0.7,1.4,0,TAU);ctx.fill();}ctx.restore();}
      ctx.setTransform(dpr,0,0,dpr,0,0);
    }
    /* вспышка прибытия */
    const fl=clamp(1-a0/0.5,0,1);if(fl>0){ctx.fillStyle='rgba(255,255,255,'+fl+')';ctx.fillRect(-20,-20,W+40,H+40);}
    /* титр сверху — не перекрывает сцену */
    const tf=ss(1.4,2.2,a0)*(1-ss(3.6,4.1,a0));
    if(tf>0){
      const ty=H*0.84,ls=Math.max(0,1-(a0-1.4)/1.2);ctx.globalAlpha=tf;ctx.textAlign='center';
      ctx.font='900 '+Math.min(74,W*0.17)+'px system-ui,sans-serif';if(ctx.letterSpacing!==undefined)ctx.letterSpacing=(4+ls*26)+'px';
      const tg=ctx.createLinearGradient(0,ty-50,0,ty+10);tg.addColorStop(0,pal.c);tg.addColorStop(1,pal.b);
      ctx.shadowColor=hell?'#ff3a00':'#5ae0ff';ctx.shadowBlur=26;ctx.fillStyle=tg;ctx.fillText(hell?'АД':'ЗЕМЛЯ',cx,ty);ctx.shadowBlur=0;
      if(ctx.letterSpacing!==undefined)ctx.letterSpacing='1px';
      ctx.font='700 '+Math.min(17,W*0.042)+'px system-ui,sans-serif';ctx.fillStyle='#fff';ctx.fillText(hell?'Измерение II · Преисподняя':'Измерение I · Земля надежды',cx,ty+30);
      ctx.strokeStyle=hexA(pal.c,0.8);ctx.lineWidth=1.5;const lw=Math.min(W*0.35,200)*ss(1.6,2.4,a0);ctx.beginPath();ctx.moveTo(cx-lw,ty+42);ctx.lineTo(cx+lw,ty+42);ctx.stroke();
      if(ctx.letterSpacing!==undefined)ctx.letterSpacing='0px';ctx.globalAlpha=1;
    }
  }
  ctx.restore();
  /* кинематографичные полосы: в конце смыкаются */
  const lb=Math.min(1,t/0.4)*H*0.07+ss(9.3,10.2,T)*H*0.43;ctx.fillStyle='#000';ctx.fillRect(0,0,W,lb);ctx.fillRect(0,H-lb,W,lb);
  const fo=ss(9.6,10.15,T);if(fo>0){ctx.fillStyle='rgba(0,0,0,'+fo+')';ctx.fillRect(0,0,W,H);}
  if(t>1&&T<9.3){ctx.fillStyle='rgba(255,255,255,.5)';ctx.font='600 12px system-ui,sans-serif';ctx.textAlign='center';ctx.fillText('нажми, чтобы пропустить',W/2,H-lb-10);}
}
let anchorNear=-1;
function anchorTargets(a){
  const L=anchorList(),off=G.dim===1?5:0,b=a.bi-off;
  const pick=(bb)=>{const c=L.filter(q=>q.bi===off+bb);if(!c.length)return null;let best=c[0];for(const q of c)if(Math.abs(q.x-a.x)<Math.abs(best.x-a.x))best=q;return best;};
  const up=b>0?pick(b-1):{exit:true};
  let down=b<4?pick(b+1):null;
  if(b===4&&G.dim===0)down={arena:true};
  return {up,down};
}
function anchorTravel(dst){
  UI.close();
  let tx,ty;
  if(dst.exit){tx=(EXIT_CX-2)*TILE+TILE/2;ty=7*TILE;}
  else if(dst.arena){tx=10*TILE+16;ty=ARENA_FLOOR*TILE;}
  else{
    tx=(dst.x-2)*TILE+16;ty=(dst.y+1)*TILE;
    for(let dy=-4;dy<=0;dy++)for(let dx=-3;dx<=3;dx++){const t=getTile(dst.x+dx,dst.y+dy);if(t===T_LAVA||isLiq(t))setTile(dst.x+dx,dst.y+dy,T_AIR);}
    anchorNear=dst.id;
  }
  for(let k=0;k<26;k++){const a=Math.random()*TAU,sp=rnd(60,260);spawnPart(player.x,player.y-20,Math.cos(a)*sp,Math.sin(a)*sp,0.7,'#7affe8',3,0);}
  player.x=tx;player.y=ty;player.vx=player.vy=0;player.peakY=player.y;
  if(grapple)grapple=null;
  G.cam.x=player.x;G.cam.y=player.y;
  for(let k=0;k<26;k++){const a=Math.random()*TAU,sp=rnd(60,260);spawnPart(player.x,player.y-20,Math.cos(a)*sp,Math.sin(a)*sp,0.7,'#7affe8',3,0);}
  SFX.portal();shake(6);vib(40);
  mobs=mobs.filter(m=>m.def.boss);
  floatText(player.x,player.y-70,'⚓ '+BIOMES[biomeAt(player.y/TILE)].n,'#7affe8');
}
function updateAnchors(){
  if(G.scene!=='mine'||UI.modal)return;
  const ptx=player.x/TILE,pty=player.y/TILE;
  let near=null;
  for(const a of anchorList()){if(Math.abs(ptx-(a.x+0.5))<1.6&&pty>a.y-2&&pty<a.y+1.5){near=a;break;}}
  if(!near){if(anchorNear>=0){const a=anchorList().find(q=>q.id===anchorNear);if(!a||Math.hypot(ptx-a.x,pty-a.y)>3.5)anchorNear=-1;}return;}
  if(anchorNear===near.id)return;
  anchorNear=near.id;
  UI.anchor(near);
}
function drawAnchors(g,tx0,tx1,ty0,ty1){
  const t=G.time;
  for(const a of anchorList()){
    if(a.x<tx0-4||a.x>tx1+4||a.y<ty0-6||a.y>ty1+3)continue;
    const x=a.x*TILE+16,y=a.y*TILE+TILE;          /* пол */
    const hell=G.dim===1,c1=hell?'#ff9a5a':'#7affe8',c2=hell?'#ff4a1a':'#2ab8a0';
    g.save();
    /* постамент */
    g.fillStyle='#1c1a24';g.fillRect(x-22,y-8,44,8);g.fillStyle='#2a2836';g.fillRect(x-16,y-14,32,6);
    /* парящий якорь */
    const fy=y-58+Math.sin(t*2+a.id)*4;
    g.globalCompositeOperation='lighter';
    const gr=g.createRadialGradient(x,fy,2,x,fy,64);gr.addColorStop(0,hexA(c1,0.45));gr.addColorStop(1,hexA(c2,0));
    g.fillStyle=gr;g.beginPath();g.arc(x,fy,64,0,TAU);g.fill();
    g.globalCompositeOperation='source-over';
    g.strokeStyle=c1;g.lineWidth=4;g.lineCap='round';
    g.beginPath();g.moveTo(x,fy-20);g.lineTo(x,fy+14);g.stroke();
    g.beginPath();g.arc(x,fy-24,5,0,TAU);g.stroke();
    g.beginPath();g.moveTo(x-12,fy-12);g.lineTo(x+12,fy-12);g.stroke();
    g.beginPath();g.arc(x,fy+2,16,0.15*Math.PI,0.85*Math.PI);g.stroke();
    g.fillStyle=c1;
    g.beginPath();g.moveTo(x-16,fy+6);g.lineTo(x-22,fy+2);g.lineTo(x-15,fy-1);g.fill();
    g.beginPath();g.moveTo(x+16,fy+6);g.lineTo(x+22,fy+2);g.lineTo(x+15,fy-1);g.fill();
    /* кольца */
    g.strokeStyle=hexA(c1,0.5);g.lineWidth=1.5;
    for(let k=0;k<2;k++){g.beginPath();g.ellipse(x,fy-2,26+k*8,7+k*2,0,t*(1+k)%TAU,t*(1+k)%TAU+Math.PI*1.4);g.stroke();}
    /* луч к постаменту */
    g.fillStyle=hexA(c1,0.18+0.08*Math.sin(t*4));g.beginPath();g.moveTo(x-6,fy+14);g.lineTo(x+6,fy+14);g.lineTo(x+14,y-14);g.lineTo(x-14,y-14);g.closePath();g.fill();
    if(Math.random()<0.15&&settings.quality!=='low')spawnPart(x+rnd(-14,14),y-14,rnd(-6,6),rnd(-60,-30),0.9,c1,1.8,-20);
    g.restore();
  }
}
/* ---------- мини-карта ---------- */
const MM={c:null,t:0,key:'',big:false};
function minimapRect(){
  const W=view.W,H=view.H;
  if(MM.big){const s=Math.min(W*0.86,H*0.7);return {x:(W-s)/2,y:(H-s)/2,s:s,n:120};}
  const base=[78,100,124][settings.minimapSize|0]||100;
  const s=Math.round(Math.min(base,W*0.3,H*0.26));
  return {x:W-10-s,y:Math.max(56,HUDL.rb+4),s:s,n:56};
}
const MM_SOLID={};
function mmColor(t,o,bi){
  if(o)return ORES[o]?ORES[o].color:'#fff';
  switch(t){
    case T_AIR:return null;
    case T_LADDER:return '#ffd98a';
    case T_LAVA:return '#ff6a1a';
    case T_WATER:return '#3a7fd0';
    case T_ACID:return '#6ad040';
    case T_BLOOD:return '#a0101e';
    case T_BARRICADE:return '#c89060';
    case T_ARENA:return '#5a3a8a';
    case T_HOT:return '#c04020';
  }
  const c=MM_SOLID[t]||(MM_SOLID[t]=shadeHex((TILECOL[t]||['#555'])[0],-0.25));
  return c;
}
function minimapBuild(r){
  const n=r.n,px=Math.floor(player.x/TILE),py=Math.floor(player.y/TILE);
  if(!MM.c){MM.c=document.createElement('canvas');}
  if(MM.c.width!==n){MM.c.width=MM.c.height=n;}
  const g=MM.c.getContext('2d');
  const img=g.createImageData(n,n),D=img.data;
  const x0=px-(n>>1),y0=py-(n>>1);
  const toRGB=(h)=>{const v=parseInt(h.slice(1),16);return [(v>>16)&255,(v>>8)&255,v&255];};
  const cache={};
  for(let y=0;y<n;y++){
    const wy=y0+y;
    for(let x=0;x<n;x++){
      const wx=x0+x,i=(y*n+x)*4;
      if(wx<0||wx>=MW||wy<0){D[i]=8;D[i+1]=8;D[i+2]=12;D[i+3]=wy<0?60:230;continue;}
      const t=getTile(wx,wy),o=t!==T_AIR?getOre(wx,wy):0;
      const c=mmColor(t,o,0);
      if(!c){D[i]=14;D[i+1]=16;D[i+2]=24;D[i+3]=150;continue;}
      const rgb=cache[c]||(cache[c]=toRGB(c));
      D[i]=rgb[0];D[i+1]=rgb[1];D[i+2]=rgb[2];D[i+3]=255;
    }
  }
  g.putImageData(img,0,0);
  MM.x0=x0;MM.y0=y0;MM.n=n;
}
function drawMinimap(){
  if(!settings.minimap||G.scene!=='mine')return;
  const r=minimapRect();
  MM.t-=1/60;
  if(MM.t<=0||MM.n!==r.n||Math.abs(Math.floor(player.x/TILE)-(MM.x0+(r.n>>1)))>3||Math.abs(Math.floor(player.y/TILE)-(MM.y0+(r.n>>1)))>3){MM.t=0.45;minimapBuild(r);}
  const g=ctx,k=r.s/r.n;
  g.save();
  g.fillStyle='rgba(6,8,14,.82)';roundRect(g,r.x-3,r.y-3,r.s+6,r.s+6,10);g.fill();
  g.save();roundRect(g,r.x,r.y,r.s,r.s,8);g.clip();
  g.imageSmoothingEnabled=false;
  g.drawImage(MM.c,r.x,r.y,r.s,r.s);
  g.imageSmoothingEnabled=true;
  const toS=(wx,wy)=>[r.x+(wx-MM.x0)*k,r.y+(wy-MM.y0)*k];const r0=r;
  /* мобы */
  for(const m of mobs){if(!m.alive)continue;const [sx,sy]=toS(m.x/TILE,(m.y-m.h*0.5)/TILE);
    g.fillStyle=m.def.boss?'#ff5aff':(m.def.neutral?'#7ad07a':'#ff4d4d');g.fillRect(sx-(m.def.boss?3:1.5),sy-(m.def.boss?3:1.5),m.def.boss?6:3,m.def.boss?6:3);}
  /* сердце бездны */
  if(G.dim===0&&!player.prog.heart&&_hs&&_hsSeed===G.seed){const [sx,sy]=toS(_hs.x+0.5,_hs.y-0.5);
    if(sx>r.x&&sx<r.x+r.s&&sy>r.y&&sy<r.y+r.s){g.fillStyle='#e090ff';g.font='bold '+Math.max(9,k*4)+'px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText('💜',sx,sy);}}
  g.restore();
  /* компас сокровищ: сундуки и опасные структуры */
  let tNear=null,tnd=1e9;
  if(itemLv('compass')>0&&G.dim===1){
    const pxT=Math.floor(player.x/TILE),pyT=Math.floor(player.y/TILE);
    for(const q of structList(pxT-60,pxT+60,pyT-60,pyT+60)){
      for(let r=0;r<q.th;r++)for(let c=0;c<q.tw;c++){const ch=q.st.tpl[r][c];if(ch!=='C'&&ch!=='k')continue;const wx=q.px+c,wy=q.py+r;if(openedChests.has(wx+','+wy))continue;
        const [sx,sy]=toS(wx+0.5,wy+0.5);
        if(sx>=r0.x&&sx<=r0.x+r0.s&&sy>=r0.y&&sy<=r0.y+r0.s){g.fillStyle=ch==='k'?'#ff9a3a':'#ffd060';g.fillRect(sx-2.5,sy-2.5,5,5);g.strokeStyle='#000';g.lineWidth=1;g.strokeRect(sx-2.5,sy-2.5,5,5);}
        const d=Math.hypot(wx-player.x/TILE,wy-player.y/TILE);if(d<tnd){tnd=d;tNear={x:wx,y:wy};}}
      if(q.st.danger){const [sx,sy]=toS(q.px+q.tw/2,q.py+q.th/2);if(sx>=r0.x&&sx<=r0.x+r0.s&&sy>=r0.y&&sy<=r0.y+r0.s){g.font='bold 10px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText('☠',sx,sy);}}
    }
    if(tNear){const cx=r0.x+r0.s/2,cy=r0.y+r0.s/2,ang=Math.atan2(tNear.y-player.y/TILE,tNear.x-player.x/TILE);
      const ex=cx+Math.cos(ang)*(r0.s/2-14),ey=cy+Math.sin(ang)*(r0.s/2-14);
      g.save();g.translate(ex,ey);g.rotate(ang);g.fillStyle='#ffd060';g.beginPath();g.moveTo(6,0);g.lineTo(-4,-4);g.lineTo(-4,4);g.closePath();g.fill();g.restore();}
  }
  /* якоря: внутри — значок, за краем — стрелка к ближайшему */
  let nearest=null,nd=1e9;
  const ptx=player.x/TILE,pty=player.y/TILE;
  g.textAlign='center';g.textBaseline='middle';
  for(const a of anchorList()){
    const [sx,sy]=toS(a.x+0.5,a.y-1);
    if(sx>=r.x&&sx<=r.x+r.s&&sy>=r.y&&sy<=r.y+r.s){
      g.fillStyle='rgba(0,0,0,.6)';g.beginPath();g.arc(sx,sy,6,0,TAU);g.fill();
      g.fillStyle=G.dim===1?'#ffb070':'#7affe8';g.font='bold 10px system-ui';g.fillText('⚓',sx,sy+0.5);
    }else{const d=Math.hypot(a.x-ptx,a.y-pty);if(d<nd){nd=d;nearest=a;}}
  }
  if(nearest&&!MM.big){
    const cx=r.x+r.s/2,cy=r.y+r.s/2,ang=Math.atan2(nearest.y-pty,nearest.x-ptx);
    const ex=cx+Math.cos(ang)*(r.s/2-7),ey=cy+Math.sin(ang)*(r.s/2-7);
    g.save();g.translate(ex,ey);g.rotate(ang);g.fillStyle=G.dim===1?'#ffb070':'#7affe8';
    g.beginPath();g.moveTo(6,0);g.lineTo(-4,-4);g.lineTo(-4,4);g.closePath();g.fill();g.restore();
    g.fillStyle='rgba(200,240,255,.85)';g.font='700 9px system-ui';g.fillText('⚓'+Math.round(nd)+'м',Math.min(r.x+r.s-16,Math.max(r.x+16,ex-Math.cos(ang)*14)),Math.min(r.y+r.s-6,Math.max(r.y+6,ey-Math.sin(ang)*12)));
  }
  /* мои ящики */
  {let cn=null,cd=1e9;
   for(const c of worldCrates()){if(c.where!=='mine')continue;const [sx,sy]=toS(c.x+0.5,c.y+0.5);
     if(sx>=r.x&&sx<=r.x+r.s&&sy>=r.y&&sy<=r.y+r.s){const z=MM.big?4.5:3.2;g.fillStyle='#000';g.fillRect(sx-z-1,sy-z-1,z*2+2,z*2+2);g.fillStyle='#c8904a';g.fillRect(sx-z,sy-z,z*2,z*2);g.fillStyle='#ffe0a0';g.fillRect(sx-z,sy-0.6,z*2,1.2);
       if(MM.big){g.font='700 9px system-ui';g.textAlign='center';g.fillStyle='rgba(255,224,160,.95)';g.fillText(c.name,sx,sy-z-6);}}
     else{const d=Math.hypot(c.x-ptx,c.y-pty);if(d<cd){cd=d;cn=c;}}}
   if(cn&&MM.big===false&&!worldCrates().some(c=>{if(c.where!=='mine')return false;const [sx,sy]=toS(c.x+0.5,c.y+0.5);return sx>=r.x&&sx<=r.x+r.s&&sy>=r.y&&sy<=r.y+r.s;})){
     const cx=r.x+r.s/2,cy=r.y+r.s/2,ang=Math.atan2(cn.y-pty,cn.x-ptx),ex=cx+Math.cos(ang)*(r.s/2-6),ey=cy+Math.sin(ang)*(r.s/2-6);
     g.fillStyle='#c8904a';g.fillRect(ex-2.5,ey-2.5,5,5);g.strokeStyle='#000';g.lineWidth=1;g.strokeRect(ex-2.5,ey-2.5,5,5);}
  }
  /* игрок */
  {const [sx,sy]=toS(ptx,pty-0.7);const p=0.6+0.4*Math.sin(G.time*6);
    g.fillStyle='rgba(255,255,255,'+p+')';g.beginPath();g.arc(sx,sy,MM.big?4:3,0,TAU);g.fill();g.strokeStyle='#000';g.lineWidth=1;g.stroke();}
  g.strokeStyle=G.dim===1?'rgba(255,140,80,.45)':'rgba(140,200,255,.35)';g.lineWidth=1.5;roundRect(g,r.x,r.y,r.s,r.s,8);g.stroke();
  {const bn=BIOMES[biomeAt(Math.max(0,pty))].n;let fs=MM.big?11:9;g.font='700 '+fs+'px system-ui';
    while(g.measureText(bn).width>r.s-12&&fs>6.5){fs-=0.5;g.font='700 '+fs+'px system-ui';}
    const bw=g.measureText(bn).width+8;g.fillStyle='rgba(6,8,14,.72)';roundRect(g,r.x+3,r.y+r.s-fs-7,bw,fs+5,4);g.fill();
    g.fillStyle='rgba(220,235,255,.9)';g.textAlign='left';g.textBaseline='alphabetic';g.fillText(bn,r.x+7,r.y+r.s-5);}
  if(MM.big){g.textAlign='center';g.fillStyle='rgba(255,255,255,.7)';g.font='600 12px system-ui';g.fillText('нажми на карту, чтобы закрыть',r.x+r.s/2,r.y+r.s+18);}
  g.restore();
}
function minimapHit(x,y){
  if(!settings.minimap||G.scene!=='mine')return false;
  const r=minimapRect();
  if(x>=r.x-4&&x<=r.x+r.s+4&&y>=r.y-4&&y<=r.y+r.s+4){MM.big=!MM.big;MM.t=0;SFX.ui();return true;}
  if(MM.big){MM.big=false;return true;}
  return false;
}
