'use strict';
/* ============================================================
   CONSTANTS
   ============================================================ */
const TILE=32;
const CHUNK=16;
const MW=96;

const T_AIR=0,T_DIRT=1,T_STONE=2,T_CRYSTAL=3,T_MAGMA=4,T_OBS=5,T_BEDROCK=6,T_LAVA=7,T_LADDER=8,T_WATER=9,T_SPRING=10,T_HOT=11,T_VENT=12,T_WOOD=13,T_BRICK=14,T_BONE=15,T_BARRICADE=16,
  T_ASH=17,T_FLESH=18,T_SULFUR=19,T_BONEROCK=20,T_HELLSTONE=21,T_ACID=22,T_BLOOD=23,T_SOULSTONE=24,T_ARENA=25,T_BASALT=26,
  T_SOULSAND=27,T_ASHVENT=28,T_FLESHPOD=29,T_SULFBOMB=30,T_CRUST=31,T_BSPIKE=32;
const TILECOL={
  1:['#6b4a2e','#755132','#5f4129'],
  2:['#575c68','#606573','#4c515d'],
  3:['#43476a','#4c5078','#3a3e5e'],
  4:['#6b2f24','#77352a','#5c281e'],
  5:['#242132','#2a2639','#1d1a28'],
  6:['#141420','#181826','#101018'],
  7:['#ff6a1a','#ff8a30','#e04a10'],
  9:['#2f6fb0','#3a7fc0','#2a5f9a'],
  10:['#575c68','#606573','#4c515d'],
  11:['#7a2a1c','#8a3220','#6a2418'],
  12:['#3a2418','#44281a','#2e1c12'],
  13:['#8a5a30','#946236','#7a4e28'],
  14:['#6a6f7c','#747987','#5e6370'],
  15:['#d8d0bc','#e2dac6','#c6bea8'],
  16:['#7a5632','#7a5632','#7a5632'],
  17:['#4a403c','#544842','#433934'],
  18:['#6a2228','#74282e','#5e1c22'],
  19:['#5c5420','#665c22','#524a1a'],
  20:['#a39a86','#aba28e','#958c78'],
  60:['#3a3842','#3e3c47','#34323c'],
  21:['#4a1410','#561814','#3e100c'],
  22:['#6ad040','#78dc4a','#5cc438'],
  23:['#8a0a1a','#960e20','#7a0614'],
  24:['#2c2e4a','#323454','#282a42'],
  25:['#1a1228','#20162e','#160f22'],
  26:['#2e2a2c','#363234','#282426'],
  27:['#3a3048','#42364f','#342a40'],
  28:['#3a302c','#443834','#322a26'],
  29:['#5a1422','#64182a','#50101c'],
  30:['#6e6214','#786a18','#645810'],
  31:['#2a1410','#321814','#221008'],
  32:['#cfc6b0','#d8cfba','#c4bba4']
};
/* Прочность породы. Подобрана так, чтобы кирка «своего» уровня копала породу
   за 1-2 секунды, а руду — за 2-6 секунд. */
/* Прочность породы. Земля копается почти мгновенно, дальше растёт вместе с
   прогрессом: с киркой «своего» биома порода уходит за ~0.15-0.6 с, руда — за 0.4-2 с. */
const ROCK_HP={1:2,2:6,3:14,4:22,5:36,6:1e9,7:1e9,10:6,11:22,12:22,13:3,14:10,15:30,16:2,17:120,18:180,19:260,20:340,21:480,24:340,25:1e9,26:200,27:60,28:200,29:90,30:150,31:40,32:260};

const RARITY=[
  {n:'Обычная',c:'#b9c0cc'},{n:'Необычная',c:'#5ee06a'},{n:'Редкая',c:'#4aa8ff'},
  {n:'Эпическая',c:'#b45cff'},{n:'Легендарная',c:'#ffab2e'},{n:'Мифическая',c:'#ff4d6d'},{n:'Адская',c:'#ff7a1a'}
];

const ORES=[
 null,
 {id:1 ,name:'Уголь'          ,rar:0,dmin:2   ,dmax:130 ,hp:3 ,price:5    ,tier:1,color:'#2e2e38',glow:'#6a6a78',vein:0.760},
 {id:2 ,name:'Медь'           ,rar:0,dmin:6   ,dmax:170 ,hp:4 ,price:10   ,tier:1,color:'#b06a3b',glow:'#e89a5a',vein:0.775},
 {id:3 ,name:'Олово'          ,rar:0,dmin:20  ,dmax:230 ,hp:5 ,price:16   ,tier:1,color:'#9aa6b0',glow:'#d0dce6',vein:0.785},
 {id:4 ,name:'Железо'         ,rar:1,dmin:24  ,dmax:330 ,hp:8 ,price:36   ,tier:2,color:'#c8a98a',glow:'#f0d0b0',vein:0.800},
 {id:5 ,name:'Серебро'        ,rar:1,dmin:60  ,dmax:430 ,hp:10 ,price:74   ,tier:2,color:'#d8e2ea',glow:'#ffffff',vein:0.812},
 {id:6 ,name:'Кварц'          ,rar:2,dmin:160 ,dmax:640 ,hp:14 ,price:140  ,tier:3,color:'#cbb7e8',glow:'#efe0ff',vein:0.828},
 {id:7 ,name:'Золото'         ,rar:2,dmin:140 ,dmax:540 ,hp:16 ,price:180  ,tier:3,color:'#ffcc33',glow:'#fff2a8',vein:0.832},
 {id:8 ,name:'Аметист'        ,rar:2,dmin:220 ,dmax:720 ,hp:20 ,price:280  ,tier:3,color:'#a05ce0',glow:'#d8a8ff',vein:0.840},
 {id:9 ,name:'Изумруд'        ,rar:3,dmin:320 ,dmax:840 ,hp:26 ,price:560  ,tier:4,color:'#22c46b',glow:'#8dffc0',vein:0.856},
 {id:10,name:'Рубин'          ,rar:3,dmin:400 ,dmax:960 ,hp:30,price:900  ,tier:4,color:'#e0344a',glow:'#ff90a0',vein:0.864},
 {id:11,name:'Сапфир'         ,rar:3,dmin:440 ,dmax:1020,hp:34,price:1180 ,tier:4,color:'#2f6fe0',glow:'#90c0ff',vein:0.868},
 {id:12,name:'Мифрил'         ,rar:4,dmin:580 ,dmax:1180,hp:40,price:2600 ,tier:5,color:'#6fe8d8',glow:'#c0fff6',vein:0.882},
 {id:13,name:'Адамантит'      ,rar:4,dmin:720 ,dmax:1320,hp:46,price:4200 ,tier:5,color:'#b9ffd0',glow:'#e8fff4',vein:0.890},
 {id:14,name:'Звёздная пыль'  ,rar:4,dmin:820 ,dmax:1420,hp:50,price:5200 ,tier:5,color:'#ffe9a8',glow:'#fffbe0',vein:0.894},
 {id:15,name:'Кристалл Бездны',rar:5,dmin:960 ,dmax:1620,hp:60,price:9500 ,tier:6,color:'#9b5cff',glow:'#d8b0ff',vein:0.906},
 {id:16,name:'Плазма'         ,rar:5,dmin:1080,dmax:1820,hp:70,price:15000,tier:6,color:'#ff7a3d',glow:'#ffc890',vein:0.914},
 {id:17,name:'Ядро Пустоты'   ,rar:5,dmin:1280,dmax:99999,hp:80,price:30000,tier:6,color:'#3a2a6a',glow:'#b090ff',vein:0.922},
 /* ---- Ад: продажная цена скромная, главная ценность — слитки в Печи ---- */
 {id:18,dim:1,name:'Пепельный кремень',rar:0,dmin:4   ,dmax:290 ,hp:110,price:600  ,tier:6 ,color:'#77706a',glow:'#e8e0d8',vein:0.805},
 {id:19,dim:1,name:'Вулканит'        ,rar:1,dmin:30  ,dmax:320 ,hp:150,price:1400 ,tier:6 ,color:'#2a1a1a',glow:'#ff6a3a',vein:0.835},
 {id:20,dim:1,name:'Кровавик'        ,rar:2,dmin:250 ,dmax:620 ,hp:220,price:3500 ,tier:7 ,color:'#a01a2a',glow:'#ff5a6a',vein:0.840},
 {id:21,dim:1,name:'Багровое сердце' ,rar:3,dmin:320 ,dmax:620 ,hp:280,price:8000 ,tier:7 ,color:'#e0203a',glow:'#ff9aa8',vein:0.875},
 {id:22,dim:1,name:'Серный кристалл' ,rar:2,dmin:550 ,dmax:900 ,hp:360,price:9000 ,tier:8 ,color:'#e8d84a',glow:'#fff8a0',vein:0.850},
 {id:23,dim:1,name:'Ядовитый изумруд',rar:4,dmin:620 ,dmax:920 ,hp:440,price:18000,tier:8 ,color:'#3aff6a',glow:'#b0ffc0',vein:0.887},
 {id:24,dim:1,name:'Душекамень'      ,rar:3,dmin:850 ,dmax:1250,hp:540,price:22000,tier:9 ,color:'#5ab8ff',glow:'#c8f0ff',vein:0.865},
 {id:25,dim:1,name:'Инфернит'        ,rar:5,dmin:950 ,dmax:1260,hp:650,price:40000,tier:9 ,color:'#ff5a1a',glow:'#ffc080',vein:0.900},
 {id:26,dim:1,name:'Сердце пламени'  ,rar:5,dmin:1200,dmax:99999,hp:800,price:55000,tier:10,color:'#ffd23a',glow:'#ffffff',vein:0.895},
 {id:27,dim:1,name:'Сажевый кварц'   ,rar:0,dmin:10  ,dmax:300 ,hp:120,price:900  ,tier:6 ,color:'#3a3436',glow:'#c8c0c4',vein:0.815},
 {id:28,dim:1,name:'Тлеющий янтарь'  ,rar:2,dmin:90  ,dmax:330 ,hp:170,price:2600 ,tier:6 ,color:'#d87a1a',glow:'#ffd080',vein:0.870},
 {id:29,dim:1,name:'Венозная медь'   ,rar:1,dmin:250 ,dmax:600 ,hp:200,price:2200 ,tier:7 ,color:'#b8503a',glow:'#ff9a7a',vein:0.825},
 {id:30,dim:1,name:'Чёрный гематит'  ,rar:3,dmin:300 ,dmax:620 ,hp:250,price:5000 ,tier:7 ,color:'#2a2228',glow:'#c05a6a',vein:0.860},
 {id:31,dim:1,name:'Кислотный малахит',rar:1,dmin:550,dmax:880 ,hp:320,price:6500 ,tier:8 ,color:'#2a9a5a',glow:'#9affc0',vein:0.830},
 {id:32,dim:1,name:'Гнилостный флюорит',rar:3,dmin:600,dmax:900,hp:400,price:13000,tier:8 ,color:'#8a5ae0',glow:'#d0b0ff',vein:0.870},
 {id:33,dim:1,name:'Костяной опал'   ,rar:2,dmin:850 ,dmax:1220,hp:500,price:16000,tier:9 ,color:'#e8e0f0',glow:'#ffb0e0',vein:0.840},
 {id:34,dim:1,name:'Призрачное серебро',rar:4,dmin:900,dmax:1240,hp:600,price:30000,tier:9 ,color:'#a8c8e8',glow:'#e8f8ff',vein:0.880},
 {id:35,dim:1,name:'Магмовый адамант',rar:4,dmin:1200,dmax:99999,hp:760,price:38000,tier:10,color:'#8a2a0a',glow:'#ff8a3a',vein:0.865},
 {id:36,dim:1,name:'Звезда преисподней',rar:6,dmin:1300,dmax:99999,hp:900,price:90000,tier:10,color:'#fff0a0',glow:'#ffffff',vein:0.925}
];

const DIM_NAMES=['Земля надежды','Ад','Лиловые небеса'];
/* Измерения: первый биом в BIOMES, сколько их, глубина шкалы и её подпись */
const DIMS=[
  {b0:0 ,bn:5,maxD:2016,mark:'2000'},
  {b0:5 ,bn:5,maxD:1600,mark:'1600'},
  {b0:10,bn:7,maxD:2100,mark:'2100'}
];
function dimInfo(d){return DIMS[d==null?((typeof G!=='undefined'&&G.dim)||0):d]||DIMS[0];}
/* 0-4 — Земля надежды, 5-9 — Ад, 10-16 — Лиловые небеса */
const BIOMES=[
  {n:'Рыхлая почва'      ,dim:0,d0:0   ,d1:50  ,bg:'#241a12',bg2:'#100b07',fog:'#1a120b'},
  {n:'Каменный пояс'     ,dim:0,d0:50  ,d1:200 ,bg:'#15181f',bg2:'#080a0e',fog:'#0e1116'},
  {n:'Кристальные гроты' ,dim:0,d0:200 ,d1:500 ,bg:'#171430',bg2:'#0a0818',fog:'#100d24'},
  {n:'Магмовые жилы'     ,dim:0,d0:500 ,d1:1000,bg:'#2a0f08',bg2:'#140604',fog:'#1e0a06'},
  {n:'Бездна'            ,dim:0,d0:1000,d1:1e9 ,bg:'#0d0a1c',bg2:'#040308',fog:'#08061a'},
  {n:'Пепельные пустоши' ,dim:1,d0:0   ,d1:250 ,bg:'#2a1a16',bg2:'#120a08',fog:'#20140f'},
  {n:'Кровавые копи'     ,dim:1,d0:250 ,d1:550 ,bg:'#2c0a12',bg2:'#120406',fog:'#20070c'},
  {n:'Серные топи'       ,dim:1,d0:550 ,d1:850 ,bg:'#26230c',bg2:'#100e04',fog:'#1c1a08'},
  {n:'Костяные катакомбы',dim:1,d0:850 ,d1:1200,bg:'#1c1c26',bg2:'#08080e',fog:'#15151e'},
  {n:'Огненное ядро'     ,dim:1,d0:1200,d1:1e9 ,bg:'#300a04',bg2:'#140302',fog:'#240704'},
  {n:'Цветущие луга'     ,dim:2,d0:0   ,d1:250 ,bg:'#2a1e34',bg2:'#120c18',fog:'#21182a'},
  {n:'Хрустальный сад'   ,dim:2,d0:250 ,d1:550 ,bg:'#1a1e36',bg2:'#0a0c1a',fog:'#151a2e'},
  {n:'Медовые соты'      ,dim:2,d0:550 ,d1:850 ,bg:'#30220e',bg2:'#140e04',fog:'#261a0a'},
  {n:'Кукольный городок' ,dim:2,d0:850 ,d1:1150,bg:'#2c1a28',bg2:'#120a10',fog:'#22141f'},
  {n:'Розарий'           ,dim:2,d0:1150,d1:1450,bg:'#2e0e1e',bg2:'#12040a',fog:'#240a17'},
  {n:'Зеркальные топи'   ,dim:2,d0:1450,d1:1750,bg:'#14262c',bg2:'#060e12',fog:'#0f1e24'},
  {n:'Колыбель'          ,dim:2,d0:1750,d1:1e9 ,bg:'#2a0e22',bg2:'#10040c',fog:'#200a1a'}
];
function oreUnlockText(lv){
  const list=ORES.filter(o=>o&&o.tier===lv&&(lv<=6?!o.dim:true));
  if(!list.length)return '';
  return list.map(o=>o.name).join(', ')+' (с глубины '+Math.min(...list.map(o=>o.dmin))+' м)';
}
function biomeAt(d){const D=dimInfo();for(let i=D.b0+D.bn-1;i>=D.b0;i--)if(d>=BIOMES[i].d0)return i;return D.b0;}

const PICKS=[
  {lv:1,name:'Кирка I'   ,cost:0     ,speed:1.00},
  {lv:2,name:'Кирка II'  ,cost:600   ,speed:1.35},
  {lv:3,name:'Кирка III' ,cost:4500  ,speed:1.80},
  {lv:4,name:'Кирка IV'  ,cost:32000 ,speed:2.40},
  {lv:5,name:'Кирка V'   ,cost:180000,speed:3.20},
  {lv:6,name:'Кирка VI'  ,cost:900000,speed:4.30},
  {lv:7,name:'Кирка VII: Пепельная'  ,cost:0,speed:5.40,hell:1},
  {lv:8,name:'Кирка VIII: Кровавая'  ,cost:0,speed:6.80,hell:1},
  {lv:9,name:'Кирка IX: Серная'      ,cost:0,speed:8.50,hell:1},
  {lv:10,name:'Кирка X: Адская'      ,cost:0,speed:10.6,hell:1}
];
const SWORDS=[
  {lv:1,name:'Кулак'      ,cost:0     ,dmg:8},
  {lv:2,name:'Кинжал'     ,cost:400   ,dmg:16},
  {lv:3,name:'Меч'        ,cost:3000  ,dmg:30},
  {lv:4,name:'Клеймор'    ,cost:18000 ,dmg:52},
  {lv:5,name:'Плазмер'    ,cost:120000,dmg:90},
  {lv:6,name:'Пустотный клинок',cost:700000,dmg:160},
  {lv:7,name:'Пепельный тесак',cost:0,dmg:240,hell:1},
  {lv:8,name:'Кровопийца',cost:0,dmg:350,hell:1},
  {lv:9,name:'Костолом',cost:0,dmg:500,hell:1},
  {lv:10,name:'Клинок Преисподней',cost:0,dmg:720,hell:1}
];
const ARMORS=[
  {lv:1,name:'Рубаха'   ,cost:0    ,hp:100,red:0},
  {lv:2,name:'Кожаный доспех',cost:500 ,hp:150,red:0.08},
  {lv:3,name:'Кольчуга',cost:4000 ,hp:220,red:0.16},
  {lv:4,name:'Латный доспех',cost:25000,hp:210,red:0.24},
  {lv:5,name:'Мифриловая броня',cost:160000,hp:460,red:0.33},
  {lv:6,name:'Броня Бездны',cost:900000,hp:650,red:0.42},
  {lv:7,name:'Пепельные латы',cost:0,hp:820,red:0.48,heat:0.25,hell:1},
  {lv:8,name:'Кровавый панцирь',cost:0,hp:1000,red:0.53,heat:0.45,hell:1},
  {lv:9,name:'Костяная броня',cost:0,hp:1220,red:0.58,heat:0.65,hell:1},
  {lv:10,name:'Доспех Преисподней',cost:0,hp:1500,red:0.63,heat:0.85,hell:1}
];

const GRAPPLE_COST=3100;
const GRAPPLE_RANGE=26;   /* дальность, блоков */
const AMMO_COST=180;
const AMMO_PACK=20;
/* Огнестрельное: покупается в кузнице, выбирается в «Предметах», стреляет кнопкой «Стрелять» с автоприцелом */
/* Огнестрел Ада, урон в секунду по одной цели (после общей правки ×0.85):
   Испепелитель ~710 · Кровавый дробовик ~1020 · Мортира ~1470 (с отравлением) · Рельса душ ~2190 · Длань ~3190.
   Раньше огнемёт давал ~2000 (как Рельса душ), а Длань ~7400 — первый и последний стволы ломали баланс боссов. */
const GUNS=[
  {lv:1,id:'pistol', name:'Пистолет',   icon:'🔫',cost:2500,   pack:30,packCost:150,  dmg:14, rate:0.42,range:340,speed:760, pellets:1,spread:0.02, color:'#ffe9a8',size:3,  kb:0.6,pierce:false,desc:'Точный, дальний'},
  {lv:2,id:'shotgun',name:'Дробовик',   icon:'💥',cost:9000,   pack:12,packCost:260,  dmg:9,  rate:0.95,range:230,speed:640, pellets:6,spread:0.26, color:'#ffc070',size:2.6,kb:1.4,pierce:false,desc:'6 дробин, бьёт вблизи'},
  {lv:3,id:'rifle',  name:'Автомат',    icon:'⚙️',cost:32000,  pack:60,packCost:480,  dmg:13, rate:0.11,range:380,speed:900, pellets:1,spread:0.07, color:'#ffe066',size:2.8,kb:0.3,pierce:false,desc:'Скорострельный (зажми кнопку)'},
  {lv:4,id:'plasma', name:'Плазмомёт',  icon:'⚡',cost:160000, pack:30,packCost:1100, dmg:70, rate:0.5, range:430,speed:640, pellets:1,spread:0.01, color:'#7fe8ff',size:6,  kb:0.9,pierce:true, desc:'Пробивает насквозь'},
  {lv:5,id:'rail',   name:'Рейлган',    icon:'🎯',cost:520000, pack:20,packCost:1800, dmg:190,rate:0.85,range:560,speed:1500,pellets:1,spread:0.004,color:'#ff9aff',size:5,  kb:1.2,pierce:true, desc:'Огромный урон, пробивает всё'},
  {lv:6,id:'void',   name:'Пустотный излучатель',icon:'🌀',cost:1500000,pack:60,packCost:4200,dmg:80,rate:0.13,range:480,speed:1100,pellets:1,spread:0.03,color:'#b080ff',size:5,kb:0.5,pierce:true,desc:'Скорострельный и пробивающий'},
  {lv:7 ,id:'hellfire',name:'Испепелитель',      icon:'🔥',cost:0,hell:1,kind:'flame',pack:120,packCost:12000,dmg:25, rate:0.09,range:230,speed:420, pellets:3,spread:0.22,color:'#ff7a2a',size:6,kb:0.1,pierce:true,desc:'Огнемёт: конус пламени, поджигает (горение 4 с)'},
  {lv:8 ,id:'bloodshot',name:'Кровавый дробовик',icon:'🩸',cost:0,hell:1,kind:'vamp', pack:30, packCost:30000,dmg:120,rate:0.8, range:260,speed:700, pellets:8,spread:0.3, color:'#ff3a4a',size:3,kb:1.4,pierce:false,desc:'8 дробин, каждое попадание лечит тебя'},
  {lv:9 ,id:'acidcan', name:'Кислотная мортира',icon:'☣️',cost:0,hell:1,kind:'acid', pack:20, packCost:70000,dmg:1500,rate:1.0, range:480,speed:560, pellets:1,spread:0.02,color:'#9aff40',size:7,kb:0.8,pierce:false,desc:'Навесной снаряд: взрыв кислоты, травит всех рядом'},
  {lv:10,id:'soulrail',name:'Рельса душ',       icon:'⚡',cost:0,hell:1,kind:'chain',pack:40, packCost:150000,dmg:1800,rate:0.7,range:620,speed:0,  pellets:1,spread:0,   color:'#7ad8ff',size:4,kb:1.2,pierce:true,desc:'Мгновенный луч + молния на 3 соседних врагов'},
  {lv:11,id:'infernus',name:'Длань Преисподней',icon:'☄️',cost:0,hell:1,kind:'homing',pack:60,packCost:300000,dmg:600,rate:0.32,range:600,speed:520,pellets:2,spread:0.5,color:'#ffb030',size:6,kb:0.9,pierce:false,desc:'Самонаводящиеся огненные ракеты со взрывом'}
];
const GUN_BY_ID={};for(const g0 of GUNS)GUN_BY_ID[g0.id]=g0;
function curGun(){return player.gunLvl>0?GUNS[clamp(player.gunLvl-1,0,GUNS.length-1)]:null;}
const TORCH_COSTS=[500,2500,12000,60000,250000];
let POTION_COST=150;
const FALL_COSTS=[400,2000,10000];

const MOBDEFS=[
 /* ---- Рыхлая почва ---- */
 {id:'rabbit',name:'Земляной кролик',shape:'rabbit',d0:0,d1:70,hp:20,dmg:3,spd:62,aggro:0,w:26,h:22,fly:false,neutral:true,
  c1:'#c8a878',c2:'#8a6c44',mech:'skitter',xp:1,drops:[{ore:1,ch:.6},{ore:2,ch:.35}]},
 {id:'worm',name:'Червь-плевун',shape:'worm',d0:0,d1:90,hp:36,dmg:7,spd:34,aggro:230,w:32,h:20,fly:false,
  c1:'#a4557a',c2:'#6b3350',mech:'spitter',xp:2,drops:[{ore:1,ch:.5},{ore:3,ch:.25}]},
 {id:'mole',name:'Крот-подкоп',shape:'mole',d0:4,d1:110,hp:48,dmg:11,spd:70,aggro:260,w:30,h:24,fly:false,
  c1:'#6a5646',c2:'#3e3026',mech:'mole',xp:4,drops:[{ore:2,ch:.4},{ore:3,ch:.3}]},
 {id:'glowbug',name:'Светляк-жук',shape:'glowbug',d0:2,d1:130,hp:14,dmg:0,spd:34,aggro:0,w:20,h:16,fly:true,neutral:true,light:3.6,
  c1:'#d8ff7a',c2:'#6aa020',mech:'drifter',xp:1,drops:[{ore:1,ch:.4}]},
 /* ---- Каменный пояс ---- */
 {id:'beetle',name:'Броне-жук',shape:'bug',d0:50,d1:260,hp:58,dmg:12,spd:48,aggro:230,w:30,h:22,fly:false,armorFront:0.6,
  c1:'#4a5a3a',c2:'#2c3624',mech:'charger',xp:5,drops:[{ore:3,ch:.4},{ore:4,ch:.2}]},
 {id:'guard',name:'Каменный страж',shape:'golem',d0:80,d1:320,hp:130,dmg:20,spd:28,aggro:230,w:40,h:46,fly:false,
  c1:'#6a6f78',c2:'#3d4149',mech:'slammer',xp:10,drops:[{ore:4,ch:.55},{ore:5,ch:.26}]},
 {id:'bat',name:'Сумрачный нетопырь',shape:'bat',d0:50,d1:420,hp:30,dmg:8,spd:84,aggro:260,w:28,h:18,fly:true,group:2,
  c1:'#4a3f5c',c2:'#2a2238',mech:'swooper',xp:4,drops:[{ore:5,ch:.28},{ore:1,ch:.3}]},
 {id:'goblin',name:'Гоблин-подрывник',shape:'goblin',d0:60,d1:300,hp:52,dmg:16,spd:58,aggro:300,w:26,h:30,fly:false,
  c1:'#6a9a4a',c2:'#3c5a28',mech:'bomber',xp:8,drops:[{ore:4,ch:.4},{ore:5,ch:.22}]},
 {id:'crab',name:'Каменный краб',shape:'crab',d0:55,d1:280,hp:84,dmg:13,spd:44,aggro:200,w:32,h:20,fly:false,neutral:true,armorFront:0.7,
  c1:'#b8744a',c2:'#7a4428',mech:'provoke',xp:6,drops:[{ore:4,ch:.4},{ore:5,ch:.25}]},
 {id:'fish',name:'Пещерная рыба',shape:'fish',d0:20,d1:520,hp:18,dmg:0,spd:70,aggro:0,w:24,h:14,fly:false,neutral:true,swim:true,
  c1:'#8ad0e8',c2:'#3a7a98',mech:'swimmer',xp:2,drops:[{ore:3,ch:.5},{ore:5,ch:.2}]},
 /* ---- Кристальные гроты ---- */
 {id:'spider',name:'Кристальный паук',shape:'spider',d0:200,d1:580,hp:80,dmg:16,spd:70,aggro:290,w:34,h:22,fly:false,
  c1:'#7a5cc8',c2:'#4a2f8a',mech:'web',xp:12,drops:[{ore:6,ch:.4},{ore:8,ch:.22}]},
 {id:'wisp',name:'Светляк-обманка',shape:'wisp',d0:200,d1:620,hp:40,dmg:0,spd:64,aggro:0,w:24,h:24,fly:true,neutral:true,light:3.2,
  c1:'#9be8ff',c2:'#3aa0d8',mech:'decoy',xp:6,drops:[{ore:6,ch:.5},{ore:8,ch:.25}]},
 {id:'healer',name:'Гротовый целитель',shape:'orb',d0:250,d1:680,hp:90,dmg:6,spd:44,aggro:200,w:30,h:30,fly:true,
  c1:'#5ce0a0',c2:'#1f7a52',mech:'shielder',xp:14,drops:[{ore:9,ch:.28},{ore:6,ch:.3}]},
 {id:'prism',name:'Призма-страж',shape:'prism',d0:230,d1:640,hp:96,dmg:22,spd:36,aggro:330,w:30,h:36,fly:true,light:2.6,
  c1:'#c8a8ff',c2:'#6a4ac8',mech:'laser',xp:16,drops:[{ore:8,ch:.35},{ore:9,ch:.2}]},
 {id:'turtle',name:'Геодовая черепаха',shape:'turtle',d0:210,d1:560,hp:150,dmg:0,spd:22,aggro:0,w:36,h:22,fly:false,neutral:true,
  c1:'#7a8a6a',c2:'#4a5a3e',mech:'shell',xp:8,drops:[{ore:8,ch:.5},{ore:9,ch:.3}]},
 /* ---- Магмовые жилы ---- */
 {id:'slime',name:'Лавовый слизень',shape:'slime',d0:500,d1:1180,hp:104,dmg:18,spd:40,aggro:240,w:36,h:26,fly:false,split:true,
  c1:'#ff6a2a',c2:'#a32a00',mech:'splitter',xp:16,drops:[{ore:10,ch:.3},{ore:11,ch:.15}],fx:{burn:2}},
 {id:'imp',name:'Огненный имп',shape:'imp',d0:520,d1:1240,hp:76,dmg:15,spd:60,aggro:340,w:28,h:32,fly:false,
  c1:'#e04a2a',c2:'#7a1a08',mech:'blinker',xp:18,drops:[{ore:11,ch:.25},{ore:12,ch:.12}]},
 {id:'elemental',name:'Магмовый элементаль',shape:'elemental',d0:600,d1:1450,hp:140,dmg:34,spd:50,aggro:260,w:38,h:38,fly:false,light:2.8,
  c1:'#ff8a1a',c2:'#c03a00',mech:'bomb',xp:22,drops:[{ore:12,ch:.38},{ore:10,ch:.3}]},
 {id:'vulture',name:'Пепельный стервятник',shape:'vulture',d0:520,d1:1200,hp:96,dmg:20,spd:92,aggro:380,w:40,h:24,fly:true,
  c1:'#5a4a48',c2:'#2a1e1c',mech:'diver',xp:20,drops:[{ore:12,ch:.3},{ore:10,ch:.25}],fx:{burn:3}},
 {id:'salamander',name:'Саламандра',shape:'salamander',d0:510,d1:1100,hp:110,dmg:10,spd:46,aggro:0,w:36,h:18,fly:false,neutral:true,thorns:true,lavaSafe:true,light:2.4,
  c1:'#ff9a3a',c2:'#b03a10',mech:'lavawalker',xp:12,drops:[{ore:12,ch:.4},{ore:11,ch:.25}]},
 /* ---- Бездна ---- */
 {id:'shade',name:'Тень Бездны',shape:'ghost',d0:950,d1:1e9,hp:150,dmg:28,spd:82,aggro:300,w:32,h:42,fly:true,
  c1:'#3a3268',c2:'#0d0a20',mech:'phantom',xp:26,drops:[{ore:15,ch:.3},{ore:16,ch:.12}]},
 {id:'thief',name:'Похититель руды',shape:'thief',d0:900,d1:1e9,hp:124,dmg:12,spd:98,aggro:260,w:28,h:30,fly:false,
  c1:'#8a7a3a',c2:'#4a3f10',mech:'thief',xp:24,drops:[{ore:13,ch:.3},{ore:14,ch:.2}]},
 {id:'horror',name:'Бездонный ужас',shape:'horror',d0:1150,d1:1e9,hp:420,dmg:46,spd:54,aggro:380,w:54,h:62,fly:false,
  c1:'#5a1040',c2:'#2a0518',mech:'colossus',xp:60,drops:[{ore:17,ch:.4},{ore:16,ch:.3}]},
 {id:'eye',name:'Глаз Бездны',shape:'eye',d0:980,d1:1e9,hp:150,dmg:30,spd:30,aggro:340,w:34,h:34,fly:true,light:2.2,
  c1:'#d8b8ff',c2:'#5a2a98',mech:'gazer',xp:22,drops:[{ore:15,ch:.35},{ore:14,ch:.2}]},
 {id:'spirit',name:'Дух-хранитель',shape:'spirit',d0:1000,d1:1e9,hp:90,dmg:0,spd:60,aggro:0,w:26,h:30,fly:true,neutral:true,light:3.2,
  c1:'#a8ffe8',c2:'#3aa890',mech:'guardian',xp:14,drops:[{ore:14,ch:.35},{ore:17,ch:.08}]},
 {id:'shadeling',name:'Тенёныш',shape:'ghost',d0:99999,d1:1e9,hp:34,dmg:14,spd:96,aggro:300,w:20,h:26,fly:true,
  c1:'#4a2a88',c2:'#1a0a38',mech:'phantom',xp:3,drops:[{ore:15,ch:.08}]},
 {id:'devourer',name:'Пожиратель Бездны',shape:'boss',boss:true,d0:99999,d1:1e9,hp:26000,dmg:115,spd:130,aggro:3000,w:110,h:110,fly:true,light:7,
  c1:'#6a2ac8',c2:'#12052a',mech:'boss',xp:2000,drops:[]},
 /* ================= АД ================= */
 /* стражи опасных структур (не появляются сами) */
 {id:'skullturret',dim:1,name:'Череп-турель',shape:'turret',d0:99999,d1:1e9,hp:1500,dmg:55,spd:0,aggro:480,w:30,h:30,fly:true,mech:'turret',trap:1,xp:40,souls:6,
  c1:'#d8ccb0',c2:'#3a2a28',drops:[]},
 {id:'bloodpod',dim:1,name:'Кровяной кокон',shape:'pod',d0:99999,d1:1e9,hp:2400,dmg:0,spd:0,aggro:440,w:34,h:40,fly:true,mech:'pod',trap:1,xp:50,souls:8,
  c1:'#8a1424',c2:'#3a0610',drops:[]},
 {id:'riftcrystal',dim:1,name:'Кристалл разлома',shape:'rift',d0:99999,d1:1e9,hp:6000,dmg:0,spd:0,aggro:520,w:36,h:44,fly:true,mech:'rift',trap:1,xp:120,souls:20,
  c1:'#a070ff',c2:'#2a0a5a',drops:[]},
 /* ---- Пепельные пустоши ---- */
 {id:'hound',dim:1,name:'Адская гончая',shape:'h_hound',d0:10,d1:420,hp:560,dmg:50,spd:100,aggro:360,w:42,h:26,fly:false,group:3,
  c1:'#3a2420',c2:'#1a0e0c',mech:'hound',xp:30,souls:3,fx:{burn:2},drops:[{ore:18,ch:.4},{ore:19,ch:.15}]},
 {id:'ashgolem',dim:1,name:'Пепельный голем',shape:'h_ashgolem',d0:40,d1:300,hp:1400,dmg:70,spd:30,aggro:300,w:44,h:50,fly:false,revive:true,
  c1:'#6a605a',c2:'#2a2420',mech:'ashgolem',xp:60,souls:6,drops:[{ore:19,ch:.5},{ore:28,ch:.25}]},
 {id:'cinderbat',dim:1,name:'Угольная мышь',shape:'h_emberbat',d0:10,d1:500,hp:280,dmg:34,spd:116,aggro:320,w:30,h:20,fly:true,group:3,deathBlast:1,trail:'#ff7a2a',
  c1:'#2a1a16',c2:'#ff6a2a',mech:'swooper',xp:14,souls:1,drops:[{ore:27,ch:.3}]},
 {id:'ashwraith',dim:1,name:'Пепельный призрак',shape:'h_ashwraith',d0:60,d1:280,hp:620,dmg:52,spd:84,aggro:340,w:34,h:44,fly:true,ghost:true,
  c1:'#9a908a',c2:'#2a2420',mech:'wraithgrab',xp:34,souls:3,drops:[{ore:28,ch:.3}]},
 {id:'ashimp',dim:1,name:'Огненный бес',shape:'h_fireimp',d0:20,d1:320,hp:520,dmg:46,spd:66,aggro:380,w:28,h:34,fly:false,
  c1:'#c0401a',c2:'#4a1006',mech:'fireimp',xp:28,souls:2,drops:[{ore:18,ch:.4},{ore:19,ch:.2}]},
 {id:'lavaworm',dim:1,name:'Вулканический червь',shape:'h_worm',d0:80,d1:550,hp:850,dmg:80,spd:110,aggro:400,w:40,h:30,fly:false,
  c1:'#5a1a0a',c2:'#ff6a1a',mech:'lavaworm',xp:70,souls:7,drops:[{ore:28,ch:.5},{ore:19,ch:.4}]},
 /* ---- Кровавые копи ---- */
 {id:'leech',dim:1,name:'Кровавая пиявка',shape:'h_leech',d0:250,d1:620,hp:1100,dmg:70,spd:70,aggro:300,w:36,h:16,fly:false,
  c1:'#7a1020',c2:'#3a0008',mech:'leech',xp:40,souls:4,drops:[{ore:20,ch:.45},{ore:29,ch:.3}]},
 {id:'fleshgolem',dim:1,name:'Мясной голем',shape:'h_fleshgolem',d0:280,d1:560,hp:2600,dmg:110,spd:32,aggro:300,w:46,h:52,fly:false,
  c1:'#9a3a44',c2:'#4a1018',mech:'hookgolem',xp:70,souls:7,drops:[{ore:21,ch:.5},{ore:30,ch:.4}]},
 {id:'bloodslime',dim:1,name:'Кровяной слизень',shape:'h_bloodslime',d0:250,d1:560,hp:1300,dmg:76,spd:46,aggro:260,w:36,h:28,fly:false,split:true,
  c1:'#b0142a',c2:'#5a0010',mech:'bloodslime',xp:36,souls:3,drops:[{ore:20,ch:.4}],fx:{bleed:2}},
 {id:'demon',dim:1,name:'Демон-берсерк',shape:'h_demon',d0:300,d1:900,hp:2100,dmg:118,spd:60,aggro:340,w:36,h:50,fly:false,
  c1:'#a02a1a',c2:'#4a0a06',mech:'berserk',xp:66,souls:6,drops:[{ore:21,ch:.4},{ore:30,ch:.35}]},
 {id:'bloodpriest',dim:1,name:'Кровавый жрец',shape:'h_priest',d0:300,d1:600,hp:1500,dmg:96,spd:52,aggro:440,w:28,h:48,fly:false,
  c1:'#5a0a14',c2:'#e0c8a0',mech:'priest',xp:60,souls:6,drops:[{ore:21,ch:.45},{ore:29,ch:.3}]},
 /* ---- Серные топи ---- */
 {id:'scorpion',dim:1,name:'Серный скорпион',shape:'h_scorpion',d0:550,d1:900,hp:2400,dmg:112,spd:56,aggro:380,w:44,h:28,fly:false,armorFront:0.5,
  c1:'#b8a030',c2:'#4a3e08',mech:'scorpion',xp:80,souls:7,fx:{poison:3},drops:[{ore:22,ch:.5},{ore:31,ch:.3}]},
 {id:'gasbag',dim:1,name:'Газовый пузырь',shape:'h_gasbag',d0:550,d1:1000,hp:900,dmg:150,spd:46,aggro:340,w:36,h:36,fly:true,group:2,
  c1:'#8ab030',c2:'#3a5a10',mech:'gasbag',xp:44,souls:4,drops:[{ore:22,ch:.4}]},
 {id:'acidspider',dim:1,name:'Кислотная матка',shape:'h_acidmother',d0:560,d1:880,hp:2200,dmg:104,spd:72,aggro:340,w:40,h:26,fly:false,
  c1:'#5a7a10',c2:'#1a2a04',mech:'acidmother',xp:76,souls:7,fx:{poison:3},drops:[{ore:23,ch:.35},{ore:32,ch:.3}]},
 {id:'sulfurel',dim:1,name:'Серный элементаль',shape:'h_sulfurel',d0:580,d1:900,hp:2000,dmg:120,spd:56,aggro:440,w:36,h:40,fly:true,light:2.4,
  c1:'#e8d84a',c2:'#7a6a10',mech:'sulfurel',xp:80,souls:7,drops:[{ore:22,ch:.5},{ore:32,ch:.3}]},
 {id:'toad',dim:1,name:'Болотный жабень',shape:'h_toad',d0:560,d1:860,hp:1800,dmg:100,spd:70,aggro:340,w:38,h:28,fly:false,
  c1:'#6a8a2a',c2:'#2a3a0a',mech:'toad',xp:60,souls:5,fx:{poison:2},drops:[{ore:31,ch:.5},{ore:23,ch:.15}]},
 /* ---- Костяные катакомбы ---- */
 {id:'skeleton',dim:1,name:'Скелет-лучник',shape:'h_skeleton',d0:850,d1:1250,hp:2500,dmg:128,spd:52,aggro:480,w:24,h:42,fly:false,revive:true,
  c1:'#e8e0cc',c2:'#6a6458',mech:'archer',xp:90,souls:8,drops:[{ore:24,ch:.45},{ore:33,ch:.3}]},
 {id:'wraith',dim:1,name:'Страж душ',shape:'h_soulwraith',d0:850,d1:1300,hp:3100,dmg:150,spd:86,aggro:360,w:34,h:46,fly:true,ghost:true,light:2.6,
  c1:'#4a8ad8',c2:'#0a1a3a',mech:'soulwraith',xp:100,souls:10,drops:[{ore:34,ch:.4},{ore:24,ch:.3}]},
 {id:'bonegolem',dim:1,name:'Костяной колосс',shape:'h_bonecolossus',d0:900,d1:1250,hp:6800,dmg:210,spd:30,aggro:320,w:50,h:58,fly:false,
  c1:'#d8d0bc',c2:'#5a5448',mech:'bonecolossus',xp:150,souls:14,drops:[{ore:25,ch:.5},{ore:33,ch:.4}]},
 {id:'necro',dim:1,name:'Некромант',shape:'h_necro',d0:880,d1:1250,hp:2600,dmg:140,spd:52,aggro:460,w:28,h:48,fly:false,
  c1:'#2a2a3a',c2:'#7affb0',mech:'necro',xp:110,souls:11,drops:[{ore:34,ch:.4},{ore:25,ch:.2}]},
 {id:'skullbat',dim:1,name:'Черепокрыл',shape:'h_skullbat',d0:850,d1:1300,hp:900,dmg:90,spd:120,aggro:380,w:28,h:22,fly:true,group:4,
  c1:'#e0d8c4',c2:'#3a3448',mech:'skullswarm',xp:30,souls:3,fx:{slow:1.5},drops:[{ore:33,ch:.25}]},
 /* ---- Огненное ядро ---- */
 {id:'infernal',dim:1,name:'Инфернал',shape:'h_infernal',d0:1250,d1:1e9,hp:14000,dmg:260,spd:52,aggro:400,w:58,h:66,fly:false,
  c1:'#a0280a',c2:'#2a0600',mech:'infernal',xp:300,souls:30,drops:[{ore:26,ch:.5},{ore:35,ch:.5}]},
 {id:'magmael',dim:1,name:'Ядерный элементаль',shape:'h_magmael',d0:1200,d1:1e9,hp:5200,dmg:340,spd:56,aggro:340,w:40,h:40,fly:false,light:2.8,
  c1:'#ffb02a',c2:'#ff3a00',mech:'magmael',xp:140,souls:12,drops:[{ore:26,ch:.3},{ore:35,ch:.4}]},
 {id:'firebird',dim:1,name:'Огнекрыл',shape:'h_phoenix',d0:1200,d1:1e9,hp:4200,dmg:200,spd:112,aggro:440,w:44,h:28,fly:true,revive:true,light:2.4,
  c1:'#ff6a1a',c2:'#8a1a00',mech:'phoenix',xp:120,souls:10,fx:{burn:4},drops:[{ore:35,ch:.4}]},
 {id:'firedemon',dim:1,name:'Огненный мечник',shape:'h_blademaster',d0:1200,d1:1e9,hp:6000,dmg:240,spd:70,aggro:380,w:36,h:52,fly:false,armorFront:0.45,
  c1:'#ff5a1a',c2:'#3a0800',mech:'blademaster',xp:160,souls:14,fx:{burn:3},drops:[{ore:26,ch:.25},{ore:36,ch:.06}]},
 {id:'magmacrab',dim:1,name:'Магмовый краб',shape:'h_magmacrab',d0:1200,d1:1e9,hp:5000,dmg:200,spd:48,aggro:380,w:46,h:28,fly:false,armorFront:0.6,lavaSafe:true,
  c1:'#3a1a10',c2:'#ff7a2a',mech:'magmacrab',xp:120,souls:10,drops:[{ore:35,ch:.5},{ore:26,ch:.2}]},
 {id:'hellsal',dim:1,name:'Огненная саламандра',shape:'h_salamander',d0:1200,d1:1e9,hp:3000,dmg:60,spd:50,aggro:0,w:38,h:18,fly:false,neutral:true,thorns:true,lavaSafe:true,light:2.4,
  c1:'#ffd040',c2:'#c03a00',mech:'lavawalker',xp:60,souls:5,drops:[{ore:26,ch:.2},{ore:35,ch:.3}]},
 /* ---- призываемые ---- */
 {id:'meatling',dim:1,name:'Мясной клочок',shape:'h_meatling',d0:99999,d1:1e9,hp:260,dmg:40,spd:96,aggro:400,w:20,h:14,fly:false,
  c1:'#a03040',c2:'#4a0a14',mech:'minion',xp:4,drops:[]},
 {id:'acidling',dim:1,name:'Паучонок',shape:'h_acidling',d0:99999,d1:1e9,hp:320,dmg:46,spd:120,aggro:420,w:20,h:14,fly:false,fx:{poison:2},
  c1:'#7a9a20',c2:'#2a3a06',mech:'minion',xp:5,drops:[]},
 {id:'lostsoul',dim:1,name:'Заблудшая душа',shape:'h_lostsoul',d0:99999,d1:1e9,hp:700,dmg:55,spd:58,aggro:420,w:24,h:30,fly:true,ghost:true,trap:true,souls:3,
  c1:'#9ad8ff',c2:'#2a4a8a',mech:'lostsoul',xp:8,drops:[]},
 {id:'skelminion',dim:1,name:'Поднятый мертвец',shape:'h_skelminion',d0:99999,d1:1e9,hp:900,dmg:90,spd:64,aggro:420,w:22,h:40,fly:false,
  c1:'#d8d0bc',c2:'#5a5448',mech:'minion',xp:10,drops:[]}
];
