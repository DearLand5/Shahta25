'use strict';
/* ============================================================
   LOBBY
   ============================================================ */
const LOBBY_WS=[2800,4760,4880];
let LOBBY_W=LOBBY_WS[0];
const BUILDINGS=[
  [
    {id:'mine',   name:'Шахта',         x:340 ,tip:'Войти в шахту'},
    {id:'market', name:'Рудная биржа',  x:900 ,tip:'Продать руду'},
    {id:'forge',  name:'Кузница',       x:1460,tip:'Купить снаряжение, крюк и лестницы'},
    {id:'casino', name:'Казино',        x:2020,tip:'Рулетка, блэкджек, слоты и др. (ставки рудой)'},
    {id:'portal', name:'Портал в Ад',   x:2560,tip:'Переход в измерение «Ад»'}
  ],
  [
    {id:'hmine',  name:'Адская шахта',  x:360 ,tip:'Спуститься в недра Ада'},
    {id:'furnace',name:'Печь',          x:940 ,tip:'Переплавка руды в слитки, сплавы, компоненты'},
    {id:'hforge', name:'Кузница Ада',   x:1520,tip:'Снаряжение, прокачки, предметы и ящики'},
    {id:'hmarket',name:'Рынок душ',     x:2100,tip:'Продать руду, слитки и сплавы'},
    {id:'hcasino',name:'Казино «Котёл»',x:2680,tip:'Рулетка, блэкджек, кости и игры на души'},
    {id:'altar',  name:'Алтарь душ',    x:3260,tip:'Благословения, ритуалы, реликвии'},
    {id:'board',  name:'Доска контрактов',x:3840,tip:'Задания с наградой'},
    {id:'portal3',name:'Врата Пустоты', x:4420,tip:'Портал обратно на Землю надежды'}
  ],
  [ /* Лиловые небеса — Деревня Вечного Рассвета (46-lilac-lobby) */
    {id:'lmine',   name:'Шахта Рассвета',   x:360 ,tip:'Спуститься под цветущие луга'},
    {id:'lfurnace',name:'Перегонный куб',   x:940 ,tip:'Перегонка руды в слитки и эссенции'},
    {id:'lforge',  name:'Кузница Зари',     x:1520,tip:'Снаряжение и предметы'},
    {id:'lmarket', name:'Цветочная ярмарка',x:2100,tip:'Продать руду'},
    {id:'lcasino', name:'Карусель удачи',   x:2680,tip:'Игры на удачу'},
    {id:'lboard',  name:'Доска пропавших',  x:3260,tip:'Задания жителей'},
    {id:'lhall',   name:'Зал Отражений',    x:3840,tip:'Способности и Эфир'},
    {id:'lportal', name:'Лиловые врата',    x:4420,tip:'Дорога домой'}
  ]
];
let buildings=BUILDINGS[0];
let lobbyPlayer={x:200,y:0,vx:0,vy:0,w:20,h:44,onGround:true,facing:1,anim:0,animState:'idle',stepT:0};

function lobbyUpdate(dt){
  const p=lobbyPlayer;
  let ax=0;
  const j=Input.joy;
  if(j.active)ax=j.dx;
  if(Input.keys['KeyA']||Input.keys['ArrowLeft'])ax-=1;
  if(Input.keys['KeyD']||Input.keys['ArrowRight'])ax+=1;
  ax=clamp(ax,-1,1);
  const speedMult=cheats.superSpeed?3:1;
  const accel=1500*speedMult,maxv=190*speedMult;
  if(ax!==0){
    p.vx+=ax*accel*dt;
    p.vx=clamp(p.vx,-maxv,maxv);
    p.facing=ax>0?1:-1;
    p.animState='run';
  }else{
    p.vx*=Math.pow(0.001,dt);
    if(Math.abs(p.vx)<4)p.vx=0;
    p.animState=Math.abs(p.vx)>10?'run':'idle';
  }
  p.x+=p.vx*dt;
  p.x=clamp(p.x,60,LOBBY_W-60);
  const wantJump=Input.jumpPressed||Input.keys['Space'];
  if(wantJump&&p.onGround){p.vy=cheats.superJump?-700:-460;p.onGround=false;SFX.jump();}
  p.vy+=1500*dt;
  p.y+=p.vy*dt;
  if(p.y>=0){if(!p.onGround&&p.vy>300)SFX.land(0.35);p.y=0;p.vy=0;p.onGround=true;}
  p.anim+=dt;
  if(Math.abs(p.vx)>30){
    p.stepT-=dt*Math.abs(p.vx)/100;
    if(p.stepT<=0){p.stepT=0.32;SFX.step(G.dim===1?'ash':'grass');}
  }
  Input.jumpPressed=false;
}
function nearestBuilding(){
  for(const b of buildings)if(Math.abs(lobbyPlayer.x-b.x)<140)return b;
  return null;
}
function openBuilding(b){
  vib(12);SFX.ui();
  if(G.dim===2){lilacOpen(b);return;}
  if(b.id==='mine')enterMine();
  else if(b.id==='market')UI.market();
  else if(b.id==='forge')UI.forge();
  else if(b.id==='casino')UI.casino();
  else if(b.id==='portal')UI.portal();
  else if(b.id==='hmine')enterMine();
  else if(b.id==='hmarket')UI.market();
  else if(b.id==='furnace')UI.hfurnace();
  else if(b.id==='hforge')UI.hforge();
  else if(b.id==='hcasino')UI.hcasino();
  else if(b.id==='altar')UI.altar?UI.altar():UI.toast('Скоро');
  else if(b.id==='board')UI.board?UI.board():UI.toast('Скоро');
  else if(b.id==='portal3')UI.portal3?UI.portal3():UI.toast('Скоро');
}

/* ============================================================
   MINE ENTER/EXIT
   ============================================================ */
function enterMine(){
  G.resumeMine=null;
  player.sanity=100;player.teaT=0;if(typeof veilT!=='undefined')veilT=0;
  G.oreEpoch=(G.oreEpoch||0)+1;
  chunks.clear();
  SFX.enter();
  resetAllInputs();
  G.scene='mine';G.mineActive=true;
  mobs=[];projectiles.length=0;beams.length=0;grapple=null;drills.length=0;aim.active=false;
  if(typeof clouds!=='undefined')clouds.length=0;bossFx.length=0;patches.length=0;hz.length=0;player.pull=null;G.arenaFight=false;G.bossIntro=0;G.bossCut=null;G.bossDeath=null;G.slowT=0;G.bossFlash=0;trapSpawned.clear();G.circ={};
  player.x=(EXIT_CX-2)*TILE+TILE/2;
  player.y=7*TILE;
  player.vx=0;player.vy=0;
  player.hp=player.maxHp;
  player.peakY=player.y;
  player.digProg=0;player.digTileX=-1;
  player.onLadder=false;player.ladderCd=0;
  Input.digActive=false;Input.digPtr=null;
  G.cam.x=player.x;G.cam.y=player.y;
  G.exitGrace=1.0;
  if(G.dim===0&&getTile(ARENA_GX0,ARENA_Y0)===T_ARENA)arenaSetGate(false);
  hbFixWorld();
  UI.close();saveGame();
  UI.toast(settings.regen?'⛏ Руды обновлены · порода затягивается':'⛏ Рудные жилы обновились');
}
/* возврат в шахту на то же место после выхода в главное меню (и после перезагрузки страницы) */
function canResumeMine(){return !!(G.resumeMine&&G.resumeMine.dim===G.dim&&isFinite(G.resumeMine.x)&&isFinite(G.resumeMine.y));}
function resumeMine(){
  const R=G.resumeMine;G.resumeMine=null;
  resetAllInputs();
  G.scene='mine';G.mineActive=true;G.paused=false;
  if(!R.live){        /* после перезагрузки: мир восстанавливается из сохранения, мобы появятся заново */
    mobs=[];projectiles.length=0;beams.length=0;grapple=null;drills.length=0;aim.active=false;
    hbFixWorld();
    player.x=clamp(R.x,TILE,(MW-1)*TILE);player.y=Math.max(TILE*2,R.y);
    let tx=Math.floor(player.x/TILE),ty=Math.floor((player.y-4)/TILE),guard=0;
    while(guard++<40&&(isSolid(tx,ty)||isSolid(tx,ty-1))){ty--;}
    player.y=(ty+1)*TILE-0.01;
  }
  player.vx=0;player.vy=0;player.peakY=player.y;player.digProg=0;player.digTileX=-1;
  Input.digActive=false;Input.digPtr=null;
  G.cam.x=player.x;G.cam.y=player.y;G.exitGrace=1.0;
  UI.close();
  UI.toast('⛏ Продолжаем: '+Math.floor(player.y/TILE)+' м');
}
function exitMine(){
  hbAbort();
  G.resumeMine=null;
  SFX.enter();
  resetAllInputs();
  G.scene='lobby';G.mineActive=false;
  mobs=[];projectiles.length=0;beams.length=0;grapple=null;drills.length=0;aim.active=false;
  Input.digActive=false;Input.digPtr=null;
  lobbyPlayer.x=buildings[0].x+140;
  lobbyPlayer.y=0;lobbyPlayer.vy=0;
  UI.close();saveGame();
}
function playerInExitRoom(){
  const ptx=player.x/TILE;
  const pty=(player.y-player.h*0.5)/TILE;
  return ptx>ROOM_X0-0.5 && ptx<ROOM_X1+1.5 && pty>ROOM_Y0-1.5 && pty<ROOM_Y1+2;
}

/* ============================================================
   GAME STATE
   ============================================================ */
const G={
  scene:'menu',
  placeItem:'ladder',
  qslots:null,
  shootItem:'grapple',
  seed:Math.floor(Math.random()*100000),
  oreEpoch:0,
  cam:{x:0,y:0},shake:0,
  mineActive:false,nearBuilding:null,paused:false,
  time:0,saveTimer:0,exitGrace:0,
  fpsAcc:0,fpsCount:0,fpsNow:60,renderScale:1,perfAvg:0,
  dim:0,wf:{}
};
