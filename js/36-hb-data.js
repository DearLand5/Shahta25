'use strict';
/* ============================================================
   ВЛАДЫКИ ПРЕИСПОДНЕЙ: пять мини-боссов Ада и Архидемон Инферналис.
   Этот файл — данные: боссы, печати и трофеи, рецепты алтаря,
   расположение святилищ и арены и генерация их блоков.
   Каждый мини-босс живёт в своём святилище (по одному на биом Ада),
   призывается печатью с алтаря душ, с него падает трофей.
   Пять трофеев → Печать Преисподней → Архидемон на дне Ада →
   Ключ Лиловых небес (нужен для портала в третье измерение).
   ============================================================ */
const HB_MINIS=[
  {id:'herald', name:'Пепельный Вестник',title:'Глашатай пепельной бури',place:'Пепельная цитадель',bi:5,y0:150,
   seal:'sealAsh',trophy:'trAsh',col:'#ffb070',souls:400,coins:2000000,loot:{a7:6,ember:10,essence:4}},
  {id:'mother', name:'Мать Плоти',fem:true,title:'Утроба Кровавых копей',place:'Утроба',bi:6,y0:420,
   seal:'sealFlesh',trophy:'trFlesh',col:'#ff5a6a',souls:550,coins:5000000,loot:{a8:6,ichor:10,horn:3}},
  {id:'toadking',name:'Король Топей',title:'Владыка серных купален',place:'Серные купальни',bi:7,y0:720,
   seal:'sealSulfur',trophy:'trSulfur',col:'#d8e04a',souls:700,coins:9000000,loot:{a9:6,gland:10,powder:2}},
  {id:'emperor',name:'Костяной Император',title:'Властелин Катакомб',place:'Склеп Императора',bi:8,y0:1040,
   seal:'sealBone',trophy:'trBone',col:'#bfe8ff',souls:850,coins:14000000,loot:{a10:6,bone:10,soulglass:1}},
  {id:'warden', name:'Владыка Магмы',title:'Страж Огненного ядра',place:'Кузня Ядра',bi:9,y0:1330,
   seal:'sealMagma',trophy:'trMagma',col:'#ff8a2a',souls:1000,coins:20000000,loot:{a11:6,magma:8,fcore:1}}
];
const HB_FINAL={id:'archdemon',name:'Архидемон Инферналис',title:'Владыка Преисподней',place:'Трон Преисподней',bi:9,y0:1470,
  seal:'sealHell',trophy:null,col:'#ff4a2a',souls:2000,coins:15000000,loot:{a11:12,fcore:3,magma:12,soulglass:3}};
const HB_ALL=HB_MINIS.concat([HB_FINAL]);
/* геометрия: мини-святилище 56×24 блока в центре мира, арена — во всю ширину */
HB_MINIS.forEach(b=>{b.x0=20;b.W=56;b.H=24;b.FY=b.H-3;});
HB_FINAL.x0=0;HB_FINAL.W=MW;HB_FINAL.H=52;HB_FINAL.FY=HB_FINAL.H-4;
/* окончания по роду: «пробудился / пробудилась» */
function hbG(b,m,f){return b&&b.fem?f:m;}
function hbById(id){return HB_ALL.find(b=>b.id===id)||null;}

/* ---------- боссы как мобы (бой ведёт свой ИИ, mech:'hboss') ---------- */
/* hp и урон потом умножаются правкой баланса (×1.15 и ×1.3, как у всех боссов) */
const HB_DEFS={
  herald:  {name:'Пепельный Вестник',  hp:48000,  dmg:110, spd:150,w:64, h:88, fly:true, light:4,c1:'#7a6a64',c2:'#2a1e1c',phases:3},
  mother:  {name:'Мать Плоти',         hp:96000,  dmg:120,spd:60, w:120,h:120,fly:true, light:3,c1:'#a8283a',c2:'#4a0a14',phases:3},
  toadking:{name:'Король Топей',       hp:148000, dmg:160,spd:90, w:132,h:96, fly:true, light:3,c1:'#7a8a2a',c2:'#3a4210',phases:3},
  emperor: {name:'Костяной Император', hp:243000, dmg:170,spd:120,w:72, h:112,fly:true, light:4,c1:'#e8e0cc',c2:'#3a3048',phases:3},
  warden:  {name:'Владыка Магмы',      hp:390000, dmg:170,spd:70, w:150,h:170,fly:true, light:6,c1:'#3a2620',c2:'#ff7a1a',phases:3},
  archdemon:{name:'Архидемон Инферналис',hp:900000,dmg:200,spd:140,w:220,h:220,fly:true,light:8,c1:'#3a1418',c2:'#ff5a1a',phases:4}
};
for(const id in HB_DEFS){const D=HB_DEFS[id];
  MOBDEFS.push({id:'hb_'+id,dim:1,name:D.name,shape:'hb_'+id,boss:true,hb:id,d0:99999,d1:1e9,hp:D.hp,dmg:D.dmg,spd:D.spd,aggro:3000,
    w:D.w,h:D.h,fly:D.fly,light:D.light,c1:D.c1,c2:D.c2,mech:'hboss',xp:id==='archdemon'?6000:1500,drops:[],souls:0,hbPhases:D.phases});}
/* призывные тени (иллюзии Императора, эхо мини-боссов у Архидемона) */
MOBDEFS.push({id:'hb_echo',dim:1,name:'Призрачная копия',shape:'hb_echo',d0:99999,d1:1e9,hp:1,dmg:120,spd:120,aggro:3000,w:60,h:100,fly:true,light:2,
  c1:'#9ad8ff',c2:'#2a3a5a',mech:'hbecho',xp:0,drops:[],souls:0});

/* ---------- печати, трофеи, ключ ---------- */
defMat('sealAsh',   'Печать Пепла',     '🔥','#ffb070','boss',7);
defMat('sealFlesh', 'Печать Плоти',     '🩸','#ff5a6a','boss',8);
defMat('sealSulfur','Печать Серы',      '🧪','#d8e04a','boss',9);
defMat('sealBone',  'Печать Костей',    '💀','#bfe8ff','boss',10);
defMat('sealMagma', 'Печать Магмы',     '🌋','#ff8a2a','boss',11);
defMat('sealHell',  'Печать Преисподней','🔱','#ff4a2a','boss',12);
defMat('trAsh',     'Корона Пепла',     '👑','#ffcf80','boss',7);
defMat('trFlesh',   'Сердце Матери',    '🫀','#ff4a5a','boss',8);
defMat('trSulfur',  'Жабий камень',     '💚','#c8ff4a','boss',9);
defMat('trBone',    'Череп Императора', '☠️','#e8f4ff','boss',10);
defMat('trMagma',   'Ядро Владыки',     '🔶','#ffa030','boss',11);
if(typeof MAT_KINDS!=='undefined'&&!MAT_KINDS.some(k=>k[0]==='boss'))MAT_KINDS.push(['boss','🔱 Печати и трофеи']);

/* рецепты вкладки «Призыв» алтаря душ: c — монеты, m — материалы, s — души */
const HB_RECIPES=[
  {id:'sealAsh',   boss:'herald',  c:1200000, m:{ember:20,a7:6,essence:6},   s:150},
  {id:'sealFlesh', boss:'mother',  c:3000000, m:{ichor:20,a8:6,horn:5},      s:250},
  {id:'sealSulfur',boss:'toadking',c:6000000, m:{gland:20,a9:6,powder:3},    s:350},
  {id:'sealBone',  boss:'emperor', c:10000000,m:{bone:20,a10:6,soulglass:2}, s:450},
  {id:'sealMagma', boss:'warden',  c:15000000,m:{magma:16,a11:6,fcore:2},    s:600},
  {id:'sealHell',  boss:'archdemon',c:20000000,m:{trAsh:1,trFlesh:1,trSulfur:1,trBone:1,trMagma:1},s:1000}
];
/* прогресс: player.prog.hb = {kills:{id:n}, key:true} */
function hbProg(){if(!player.prog)player.prog={};if(!player.prog.hb||typeof player.prog.hb!=='object')player.prog.hb={kills:{}};if(!player.prog.hb.kills)player.prog.hb.kills={};return player.prog.hb;}
function hbKills(id){return hbProg().kills[id]|0;}

/* ---------- геометрия ---------- */
/* локальные координаты: lx — от левого края святилища, ly — от верха; FY — верхний ряд пола */
function hbRect(b){return {x0:b.x0,y0:b.y0,x1:b.x0+b.W-1,y1:b.y0+b.H-1};}
function hbFloorY(b){return b.y0+b.FY;}
function hbInside(b,px,py){const r=hbRect(b);return px>(r.x0+2)*TILE&&px<(r.x1-1)*TILE&&py>(r.y0+2)*TILE&&py<=(b.y0+b.FY)*TILE+2;}
function hbAt(px,py){if(G.dim!==1)return null;for(const b of HB_ALL)if(hbInside(b,px,py))return b;return null;}
/* пересекает ли прямоугольник блоков святилище (не ставим туда структуры и якоря) */
function hbRectHit(x0,y0,x1,y1){
  for(const b of HB_ALL){const r=hbRect(b);const mx=b===HB_FINAL?0:12;
    if(x1>=r.x0-mx&&x0<=r.x1+mx&&y1>=r.y0-14&&y0<=r.y1+3)return true;}
  return false;
}
/* постамент призыва: блок, на котором он стоит */
function hbPedestal(b){
  if(b.id==='archdemon')return {tx:b.x0+48,ty:b.y0+b.FY-2};
  if(b.id==='emperor')return {tx:b.x0+28,ty:b.y0+b.FY-2};
  if(b.id==='warden')return {tx:b.x0+5,ty:b.y0+b.FY};
  return {tx:b.x0+28,ty:b.y0+b.FY};
}
/* ворота: клетки, которые закрываются на время боя */
function hbGateCells(b){
  const out=[];
  if(b.id==='archdemon'){for(let y=b.y0;y<=b.y0+1;y++)for(let x=46;x<=49;x++)out.push([x,y]);return out;}
  for(let y=b.y0+b.FY-3;y<=b.y0+b.FY-1;y++){out.push([b.x0+1,y]);out.push([b.x0+b.W-2,y]);}
  return out;
}

/* ---------- блоки святилищ ---------- */
const T_HBWALL=T_ARENA;     /* непробиваемая кладка (в Аду — своя текстура) */
const HB_LADDER_X=47;       /* лестница в центральной шахте Трона Преисподней */
function hbFeat(id,lx,ly,FY){
  const P=(y,a,b)=>ly===y&&lx>=a&&lx<=b;
  switch(id){
    case 'herald':   /* Пепельная цитадель: ярусы-уступы и обломки базальтовых колонн */
      if(P(FY-2,8,14)||P(FY-2,41,47)||P(FY-4,15,20)||P(FY-4,35,40)||P(FY-7,24,31))return T_HBWALL;
      if((lx===20||lx===35)&&ly>=FY-2&&ly<=FY-1)return T_BASALT;
      return T_AIR;
    case 'mother':   /* Утроба: кровяные озерца в полу, мясистые уступы */
      if(P(FY-2,4,9)||P(FY-2,46,51)||P(FY-4,10,14)||P(FY-4,41,45))return T_HBWALL;
      return T_AIR;
    case 'toadking': /* Серные купальни: уступы над кислотой */
      if(P(FY-2,6,11)||P(FY-2,44,49)||P(FY-4,12,16)||P(FY-4,39,43))return T_HBWALL;
      return T_AIR;
    case 'emperor':  /* Склеп: тронный помост и галереи */
      if(ly>=FY-2&&ly<=FY-1&&lx>=24&&lx<=31)return T_HBWALL;
      if(P(FY-1,22,23)||P(FY-1,32,33))return T_HBWALL;
      if(P(FY-2,6,11)||P(FY-2,44,49)||P(FY-4,13,18)||P(FY-4,37,42))return T_HBWALL;
      return T_AIR;
    case 'warden':   /* Кузня Ядра: платформы на цепях над лавовым озером */
      if(P(FY-1,10,14)||P(FY-1,17,21)||P(FY-1,34,38)||P(FY-1,41,45))return T_HBWALL;
      if(P(FY-2,25,30)||P(FY-4,13,18)||P(FY-4,37,42))return T_HBWALL;
      return T_AIR;
    case 'archdemon':{ /* Трон Преисподней */
      if(ly>=FY-2&&ly<=FY-1&&lx>=40&&lx<=55)return T_HBWALL;          /* тронный помост */
      if(P(FY-1,37,39)||P(FY-1,56,58))return T_HBWALL;                 /* ступени */
      for(const [y,a,b2] of [[FY-2,6,13],[FY-4,14,20],[FY-6,6,12],[FY-8,13,19],[FY-11,4,10],[FY-14,12,18]]){
        if(P(y,a,b2)||P(y,MW-1-b2,MW-1-a))return T_HBWALL;}
      if(P(FY-10,40,55))return T_HBWALL;                              /* балкон над троном */
      return T_AIR;}
  }
  return T_AIR;
}
/* жидкости в полу святилищ */
function hbFloorLiquid(id,lx,ly,FY){
  if(ly<FY||ly>FY+1)return 0;
  if(id==='mother'&&((lx>=13&&lx<=19)||(lx>=36&&lx<=42)))return T_BLOOD;
  if(id==='toadking'&&((lx>=17&&lx<=24)||(lx>=31&&lx<=38)))return T_ACID;
  if(id==='warden'&&lx>=8&&lx<=47)return T_LAVA;
  return 0;
}
function hbTile(wx,wy){
  if(G.dim!==1)return null;
  for(const b of HB_ALL){
    if(wy<b.y0-12||wy>b.y0+b.H)continue;
    const lx=wx-b.x0,ly=wy-b.y0,FY=b.FY,W=b.W,H=b.H;
    if(b===HB_FINAL){
      if(ly<0){                                     /* воронка к воротам в потолке */
        const k=-ly;
        if(k<=10&&wx>=45-Math.floor(k/3)&&wx<=50+Math.floor(k/3))return {t:wx===HB_LADDER_X?T_LADDER:T_AIR,o:0};
        continue;
      }
      if(ly<=1)return {t:(lx>=46&&lx<=49)?(wx===HB_LADDER_X?T_LADDER:T_AIR):T_HBWALL,o:0};
      if(lx<2||lx>=W-2||ly>=FY)return {t:T_HBWALL,o:0};
      const f=hbFeat(b.id,lx,ly,FY);
      if(wx===HB_LADDER_X&&ly<=FY-3&&(f===T_AIR||ly===FY-10))return {t:T_LADDER,o:0};
      return {t:f,o:0};
    }
    if(ly<0)continue;
    /* подходы к дверям снаружи: тоннель с полом */
    if((lx<0&&lx>=-10)||(lx>=W&&lx<W+10)){
      if(ly>=FY-3&&ly<=FY-1)return {t:T_AIR,o:0};
      if(ly===FY)return {t:T_HBWALL,o:0};
      continue;
    }
    if(lx<0||lx>=W)continue;
    if((lx<=1||lx>=W-2)&&ly>=FY-3&&ly<=FY-1)return {t:T_AIR,o:0};     /* двери */
    const lq=hbFloorLiquid(b.id,lx,ly,FY);
    if(lq)return {t:lq,o:0};
    if(lx<2||lx>=W-2||ly<2||ly>=FY)return {t:T_HBWALL,o:0};
    return {t:hbFeat(b.id,lx,ly,FY),o:0};
  }
  return null;
}
