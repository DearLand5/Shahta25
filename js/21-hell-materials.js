'use strict';
/* ============================================================
   МАТЕРИАЛЫ АДА: слитки, сплавы, компоненты, части мобов
   ============================================================ */
const MATS={};
function defMat(id,n,ic,col,kind,tier){MATS[id]={id,n,ic,col,kind,tier:tier||0};}
[[18,'Кремнёвый слиток'],[27,'Сажевый слиток'],[19,'Вулканитовый слиток'],[28,'Янтарный слиток'],
 [29,'Слиток венозной меди'],[20,'Кровавиковый слиток'],[30,'Гематитовый слиток'],[21,'Слиток багрового сердца'],
 [31,'Малахитовый слиток'],[22,'Серный слиток'],[32,'Флюоритовый слиток'],[23,'Изумрудный слиток яда'],
 [33,'Опаловый слиток'],[24,'Слиток души'],[34,'Слиток призрачного серебра'],[25,'Инфернитовый слиток'],
 [35,'Адамантовый слиток'],[26,'Пламенный слиток'],[36,'Звёздный слиток']].forEach(([o,n])=>defMat('i'+o,n,'▰',ORES[o].color,'ingot',ORES[o].tier));
defMat('a7','Пепельная сталь','⬢','#9a8a80','alloy',7);
defMat('a8','Кровавая бронза','⬢','#c0303a','alloy',8);
defMat('a9','Серный сплав','⬢','#d8c840','alloy',9);
defMat('a10','Костяной титан','⬢','#e0dcd0','alloy',10);
defMat('a11','Пламенный адамант','⬢','#ff8a2a','alloy',11);
defMat('mech','Механизм','⚙️','#c8a060','comp',7);
defMat('lens','Линза души','🔍','#9ad8ff','comp',7);
defMat('cloth','Огнеупорная ткань','🧵','#ff6a4a','comp',8);
defMat('powder','Серный порох','💥','#e8d84a','comp',9);
defMat('soulglass','Стекло душ','🔮','#7ab8ff','comp',10);
defMat('fcore','Ядро пламени','🌟','#ffd040','comp',11);
defMat('fang','Клык гончей','🦷','#e8e0d0','part',6);
defMat('ember','Тлеющий уголь','☄️','#ff7a2a','part',6);
defMat('essence','Эссенция души','✨','#a8e0ff','part',6);
defMat('ichor','Кровяной сгусток','🩸','#c0142a','part',7);
defMat('horn','Рог демона','🔱','#e0d0b0','part',7);
defMat('gland','Ядовитая железа','☣️','#9aff40','part',8);
defMat('bone','Древняя кость','🦴','#f0e8d8','part',9);
defMat('magma','Магмовое сердце','🌋','#ff5a1a','part',10);
const MOB_PARTS={
  hound:[['fang',.55]],cinderbat:[['ember',.25]],ashimp:[['ember',.5]],ashwraith:[['essence',.45]],ashgolem:[['ember',.8,2]],lavaworm:[['ember',.6],['fang',.3]],
  leech:[['ichor',.5]],bloodslime:[['ichor',.35]],fleshgolem:[['ichor',1,2]],demon:[['horn',.6]],bloodpriest:[['ichor',.6],['essence',.4]],
  scorpion:[['gland',.6]],gasbag:[['gland',.4]],acidspider:[['gland',.5]],sulfurel:[['gland',.6],['ember',.3]],toad:[['gland',.5]],
  skeleton:[['bone',.6]],wraith:[['essence',.7]],bonegolem:[['bone',1,3]],necro:[['bone',.8],['essence',.6]],skullbat:[['bone',.3]],
  infernal:[['magma',1,2],['horn',.5]],magmael:[['magma',.6]],firebird:[['ember',.8],['magma',.25]],firedemon:[['horn',.7],['magma',.3]],hellsal:[['magma',.4]],magmacrab:[['magma',.5]]
};
function addMat(id,n){if(!MATS[id]||n<=0)return;if(!player.mats)player.mats={};player.mats[id]=(player.mats[id]||0)+n;}
function matN(id){return (player.mats&&player.mats[id])||0;}
/* стоимость: {c:монеты, o:{руда:кол-во}, m:{материал:кол-во}} */
function canPay(r){
  if(!r)return false;
  if((player.money<(r.c||0))&&!cheats.infMoney)return false;
  for(const k in (r.o||{}))if((player.inv[k]||0)<r.o[k])return false;
  for(const k in (r.m||{}))if(matN(k)<r.m[k])return false;
  if(r.s&&(player.souls||0)<r.s)return false;
  return true;
}
function pay(r){
  if(!canPay(r))return false;
  if(!cheats.infMoney)player.money-=(r.c||0);
  for(const k in (r.o||{})){player.inv[k]-=r.o[k];if(player.inv[k]<=0)delete player.inv[k];}
  for(const k in (r.m||{})){player.mats[k]-=r.m[k];if(player.mats[k]<=0)delete player.mats[k];}
  if(r.s)player.souls-=r.s;
  return true;
}
function costChips(r,mul){
  mul=mul||1;let h='';
  for(const k in (r.o||{})){const need=r.o[k]*mul,have=player.inv[k]||0;h+=`<span class="${have>=need?'':'no'}" style="border-left:3px solid ${ORES[k].color}">${ORES[k].name} ${have}/${need}</span>`;}
  for(const k in (r.m||{})){const M=MATS[k],need=r.m[k]*mul,have=matN(k);h+=`<span class="${have>=need?'':'no'}" style="border-left:3px solid ${M.col}">${M.ic} ${M.n} ${have}/${need}</span>`;}
  if(r.s)h+=`<span class="${(player.souls||0)>=r.s*mul?'':'no'}">👻 ${fmt(r.s*mul)}</span>`;
  if(r.c)h+=`<span class="${player.money>=r.c*mul||cheats.infMoney?'':'no'}">💰 ${fmt(r.c*mul)}</span>`;
  return h;
}
/* ---------- Печь: переплавка ---------- */
const SMELT=[];
for(let o=18;o<=36;o++){const O=ORES[o];SMELT.push({id:'s'+o,out:'i'+o,n:1,o:{[o]:3},c:Math.round(O.price*0.8/50)*50,time:2+O.tier*0.4,tab:'ingot',tier:O.tier});}
SMELT.push(
  {id:'sa7' ,out:'a7' ,n:1,m:{i18:2,i19:2,ember:1},c:25000 ,time:6 ,tab:'alloy',tier:6},
  {id:'sa8' ,out:'a8' ,n:1,m:{i29:2,i20:2,ichor:1},c:90000 ,time:8 ,tab:'alloy',tier:7},
  {id:'sa9' ,out:'a9' ,n:1,m:{i31:2,i22:2,gland:1},c:260000,time:10,tab:'alloy',tier:8},
  {id:'sa10',out:'a10',n:1,m:{i33:2,i24:2,bone:1} ,c:700000,time:12,tab:'alloy',tier:9},
  {id:'sa11',out:'a11',n:1,m:{i35:2,i26:2,magma:1},c:1800000,time:15,tab:'alloy',tier:10},
  {id:'smech',out:'mech',n:1,m:{i27:3,i28:1},c:18000,time:6,tab:'comp',tier:6},
  {id:'slens',out:'lens',n:1,m:{i28:2,essence:1},c:30000,time:7,tab:'comp',tier:6},
  {id:'scloth',out:'cloth',n:1,m:{i21:2,ichor:2},c:120000,time:9,tab:'comp',tier:7},
  {id:'spowder',out:'powder',n:1,m:{i32:2,gland:1},c:220000,time:9,tab:'comp',tier:8},
  {id:'sglass',out:'soulglass',n:1,m:{i34:2,essence:2},c:600000,time:12,tab:'comp',tier:9},
  {id:'score',out:'fcore',n:1,m:{i36:1,magma:2},c:2000000,time:16,tab:'comp',tier:10}
);
const SMELT_BY={};for(const r of SMELT)SMELT_BY[r.id]=r;
/* цена слитков и сплавов у скупщика Ада: сырьё + работа печи с небольшой наценкой */
function matValue(id){
  if(/^i\d+$/.test(id)){const o=+id.slice(1);if(!ORES[o])return 0;return Math.round(orePrice(o)*3.9);}
  const r=SMELT.find(q=>q.out===id);if(!r||r.tab!=='alloy')return 0;
  let v=r.c||0;for(const k in (r.m||{}))v+=matValue(k)*r.m[k];return Math.round(v*1.08);
}
function matSatMult(id){const sv=(G.wf&&G.wf.sat&&G.wf.sat['m:'+id])||0;return 1/(1+sv/60);}
function sellMat(id,n){
  const base=matValue(id);if(!base||n<=0)return 0;if(!G.wf.sat)G.wf.sat={};
  let sv=G.wf.sat['m:'+id]||0,sum=0;for(let i=0;i<n;i++){sum+=base/(1+sv/60);sv+=1;}G.wf.sat['m:'+id]=sv;
  player.mats[id]-=n;if(player.mats[id]<=0)delete player.mats[id];return Math.round(sum);
}
const FURN_SPEED=[1,1.6,2.4,3.4],FURN_LINES=[1,2,2,3];
function furn(){if(!player.furn||!Array.isArray(player.furn.q))player.furn={q:[],lvl:0,ts:Date.now()};return player.furn;}
function furnQueue(rid,n){
  const r=SMELT_BY[rid];if(!r||n<=0)return false;
  const F=furn();if(F.q.length>=8){UI.toast('Очередь Печи полна (8)');return false;}
  const tot={c:(r.c||0)*n,o:{},m:{}};
  for(const k in (r.o||{}))tot.o[k]=r.o[k]*n;for(const k in (r.m||{}))tot.m[k]=r.m[k]*n;
  if(!pay(tot))return false;
  F.q.push({r:rid,n:n,t:0});return true;
}
function furnCancel(i){
  const F=furn(),j=F.q[i];if(!j)return;const r=SMELT_BY[j.r];
  player.money+=(r.c||0)*j.n;for(const k in (r.o||{}))player.inv[k]=(player.inv[k]||0)+r.o[k]*j.n;for(const k in (r.m||{}))addMat(k,r.m[k]*j.n);
  F.q.splice(i,1);
}
function updateFurnace(dt,silent){
  const F=furn();if(!F.q.length)return;
  const lines=FURN_LINES[F.lvl|0],sp=FURN_SPEED[F.lvl|0];
  let made={};
  for(let i=0;i<Math.min(lines,F.q.length);i++){
    const j=F.q[i],r=SMELT_BY[j.r];if(!r){F.q.splice(i,1);i--;continue;}
    j.t+=dt*sp;
    while(j.t>=r.time&&j.n>0){j.t-=r.time;j.n--;addMat(r.out,r.n);made[r.out]=(made[r.out]||0)+r.n;}
    if(j.n<=0){F.q.splice(i,1);i--;}
  }
  if(!silent)for(const k in made){if(G.scene==='lobby'&&!UI.modal&&G.time-(F.msgT||0)>2){F.msgT=G.time;UI.toast('🔥 Печь: '+MATS[k].ic+' '+MATS[k].n+' +'+made[k]);}}
  if(UI.modal==='hfurnace'&&Object.keys(made).length)UI._furnDirty=true;
}
/* ---------- Кузница Ада: снаряжение ---------- */
const HELL_GEAR={
  pick :{7:{m:{a7:6,mech:2},c:600000},8:{m:{a8:8,mech:3},c:2500000},9:{m:{a9:10,lens:3},c:7000000},10:{m:{a10:12,soulglass:2},c:20000000}},
  sword:{7:{m:{a7:4,fang:6},c:400000},8:{m:{a8:6,horn:4},c:2000000},9:{m:{a9:8,gland:6},c:6000000},10:{m:{a11:8,fcore:1},c:30000000}},
  armor:{7:{m:{a7:8,ember:6},c:800000},8:{m:{a8:10,cloth:3},c:3000000},9:{m:{a9:12,cloth:4},c:9000000},10:{m:{a11:12,fcore:2},c:40000000}},
  gun  :{7:{m:{a7:5,mech:3},c:1000000},8:{m:{a8:6,mech:4},c:3500000},9:{m:{a9:6,powder:4},c:9000000},10:{m:{a10:8,lens:4,soulglass:2},c:22000000},11:{m:{a11:8,fcore:2},c:50000000}}
};
function gearNext(kind){
  const lv=kind==='pick'?player.pickLvl:kind==='sword'?player.swordLvl:kind==='armor'?player.armorLvl:player.gunLvl;
  const r=HELL_GEAR[kind][lv+1];
  return r?{lv:lv+1,r:r,ready:lv>=6}:null;
}
/* ---------- Кузница Ада: прокачки ---------- */
const HUPG=[
  {id:'dig',ic:'⚡',n:'Адская скорость копания',min:12,max:DIG_SPEED_HMAX,cur:()=>player.digSpeedLvl||0,
   cost:lv=>{const t=lv<14?7:lv<16?8:lv<18?9:10;return {m:{['a'+t]:2+(lv%2)},c:[500000,900000,2500000,4000000,8000000,12000000,20000000,32000000][lv-12]};},
   apply:()=>{player.digSpeedLvl++;player.digSpeed=digSpeedMult(player.digSpeedLvl);},desc:lv=>'×'+digSpeedMult(lv).toFixed(1)+(lv<DIG_SPEED_HMAX?' → ×'+digSpeedMult(lv+1).toFixed(1):'')},
  {id:'drill',ic:'🛠️',n:'Мощность бура',min:6,max:10,cur:()=>player.drillBought?player.drillLvl:0,
   cost:lv=>({m:{mech:2+lv-6,['a'+(lv+1)]:2},c:[0,0,0,0,0,0,700000,3000000,9000000,22000000][lv]}),
   apply:()=>{player.drillLvl++;},desc:lv=>'Мощность '+DRILL_POWER[clamp(lv-1,0,9)]+(lv<10?' → '+DRILL_POWER[lv]:'')},
  {id:'barr',ic:'🧱',n:'Баррикады',min:4,max:7,cur:()=>player.barricadeBought?player.barricadeLvl:0,
   cost:lv=>({m:{['a'+(lv+3)]:3,bone:lv===6?6:0},c:[0,0,0,0,600000,3000000,12000000][lv]}),
   apply:()=>{player.barricadeLvl++;},desc:lv=>BARR[clamp(lv-1,0,6)].name+' '+BARR[clamp(lv-1,0,6)].hp+(lv<7?' → '+BARR[lv].name.toLowerCase()+' '+BARR[lv].hp:'')},
  {id:'slots',ic:'🎒',n:'Слоты рюкзака (виды руды)',min:8,max:34,cur:()=>player.slots,
   cost:lv=>lv<20?{c:Math.floor(600*Math.pow(2.1,lv-8))}:({m:{['i'+[18,27,19,29,20,30,31,22,32,33,24,34,35,26][lv-20]]:4+Math.floor((lv-20)/2)},c:Math.round(250000*Math.pow(1.32,lv-20)/1000)*1000}),
   apply:()=>{player.slots++;},desc:lv=>lv+' слотов → '+(lv+1)},
  {id:'stack',ic:'📦',n:'Вместимость стопки',min:0,max:16,cur:()=>player.stackLvl||0,
   cost:lv=>lv<8?{c:Math.round(900*Math.pow(2.3,lv))}:({m:{['a'+Math.min(11,7+Math.floor((lv-8)/2))]:2,cloth:lv>=11?1:0},c:Math.round(400000*Math.pow(1.45,lv-8)/1000)*1000}),
   apply:()=>{player.stackLvl=(player.stackLvl||0)+1;},desc:()=>stackCap()+' шт → '+(stackCap()+40)},
  {id:'torch',ic:'🔦',n:'Адский фонарь',min:5,max:8,cur:()=>player.torchLvl,
   cost:lv=>({m:{lens:2+(lv-5)*2,['a'+(lv+3)]:1},c:[0,0,0,0,0,800000,4000000,12000000][lv]}),
   apply:()=>{player.torchLvl++;},desc:lv=>'Свет в Аду +'+Math.round(Math.max(0,lv-5)*60)+'% → +'+Math.round((lv-4)*60)+'% и широкий мягкий отсвет вокруг'},
  {id:'furn',ic:'🔥',n:'Мехи и горны Печи',min:0,max:3,cur:()=>furn().lvl|0,
   cost:lv=>({m:{['a'+(7+lv)]:3,mech:2+lv*2},c:[600000,4000000,15000000][lv]}),
   apply:()=>{furn().lvl++;},desc:lv=>'×'+FURN_SPEED[lv]+' скорость, '+FURN_LINES[lv]+' очеред.'+(lv<3?' → ×'+FURN_SPEED[lv+1]+', '+FURN_LINES[lv+1]:'')}
];
/* ---------- уникальные предметы Ада ---------- */
const HITEMS=[
  {id:'cloak',ic:'🧥',n:'Огнеупорный плащ',max:3,cost:lv=>({m:{cloth:2+lv*2,['a'+(8+lv)]:2},c:[1200000,6000000,18000000][lv]}),
   desc:lv=>'Лава жжёт на '+(lv*25)+'% слабее, жаростойкость +'+(lv*12)+'%'+(lv<3?' → '+((lv+1)*25)+'% / +'+((lv+1)*12)+'%':'')},
  {id:'resp',ic:'😷',n:'Респиратор',max:3,cost:lv=>({m:{gland:4+lv*4,['a'+(8+lv)]:2},c:[600000,4000000,15000000][lv]}),
   desc:lv=>'Газ и кислота: −'+(lv*25)+'% урона'+(lv<3?' → −'+((lv+1)*25)+'%':'')},
  {id:'jet',ic:'🚀',n:'Ранец-реактор',max:3,cost:lv=>({m:{mech:4+lv*3,['a'+(7+lv)]:3},c:[1000000,5000000,16000000][lv]}),
   desc:lv=>'Держи прыжок в воздухе — зависание и подъём. Топливо '+[0,0.9,1.5,2.3][lv]+' с'+(lv<3?' → '+[0,0.9,1.5,2.3][lv+1]+' с':'')},
  {id:'compass',ic:'🧭',n:'Компас сокровищ',max:1,cost:()=>({m:{lens:3,a8:2},c:2000000}),
   desc:()=>'Мини-карта показывает сундуки и опасные структуры, стрелка к ближайшему сундуку'}
];
const HCONS=[
  {id:'beacons',ic:'📡',n:'Рудный маяк',pack:1,cost:{m:{mech:1},c:200000},desc:'«Стрелять»: мгновенно продаёт рюкзак по 75% рыночной цены'},
  {id:'scrolls',ic:'📜',n:'Свиток возврата',pack:1,cost:{m:{essence:2},c:150000},desc:'«Стрелять»: возврат в лобби с полным рюкзаком'},
  {id:'totems',ic:'🗿',n:'Тотем воскрешения',pack:1,cost:{m:{soulglass:1,horn:2},c:1500000},desc:'Сам срабатывает при смерти: 50% HP, руда не теряется'},
  {id:'hbombs',ic:'💣',n:'Адская бомба ×5',pack:5,cost:{m:{powder:1},c:300000},desc:'«Ставить»: бросок, взрыв 3 блока, 1200 урона'},
  {id:'icegren',ic:'❄️',n:'Ледяная граната ×5',pack:5,cost:{m:{i31:2,lens:1},c:250000},desc:'«Ставить»: замораживает лаву и жидкости, сковывает врагов'}
];
function itemLv(id){return (player.hitems&&player.hitems[id])||0;}
/* ---------- реликвии и ритуалы ---------- */
const RELICS=[
  {id:'eye'  ,ic:'👁️',n:'Око Бездны'     ,d:'Редкая руда ярко светится сквозь тьму — видно вдвое больше жил',cost:{m:{soulglass:1},s:150}},
  {id:'fang' ,ic:'🦷',n:'Клык вожака'    ,d:'15% шанс крита (×2 урона)',cost:{m:{soulglass:1,fang:10},s:200}},
  {id:'heart',ic:'❤️‍🔥',n:'Кровавое сердце',d:'Каждое убийство лечит 2% HP',cost:{m:{soulglass:1,ichor:10},s:220}},
  {id:'mask' ,ic:'🎭',n:'Пепельная маска',d:'Иммунитет к бурям, слепоте и затмению',cost:{m:{soulglass:1,ember:10},s:180}},
  {id:'coin' ,ic:'🪙',n:'Монета Харона'  ,d:'+12% к цене продажи руды',cost:{m:{soulglass:2},s:300}},
  {id:'ember',ic:'🔥',n:'Вечный уголь'   ,d:'+25% защиты от Жара',cost:{m:{soulglass:1,magma:3},s:250}},
  {id:'wing' ,ic:'🪶',n:'Перо феникса'   ,d:'Раз в 10 минут воскрешает бесплатно',cost:{m:{soulglass:3,ember:20},s:500}},
  {id:'chain',ic:'⛓️',n:'Цепь мертвеца'  ,d:'Каждый 4-й удар мечом бьёт цепной молнией',cost:{m:{soulglass:2,bone:10},s:350}},
  {id:'moon' ,ic:'🌙',n:'Лунный осколок' ,d:'+25% душ',cost:{m:{soulglass:2,essence:10},s:300}}
];
const RITUALS=[
  {id:'harvest',ic:'🌾',n:'Ритуал жатвы' ,d:'Вся добытая руда ×2',dur:180,s:120},
  {id:'frost'  ,ic:'❄️',n:'Ледяной обет' ,d:'Жар не растёт',dur:240,s:80},
  {id:'blood'  ,ic:'🩸',n:'Кровавый пакт',d:'+40% урона, но −25% макс. здоровья',dur:180,s:100},
  {id:'greed'  ,ic:'💰',n:'Золотой дым'  ,d:'+30% к цене продажи',dur:300,s:150},
  {id:'hunt'   ,ic:'🏹',n:'Великая охота',d:'Элитные враги чаще, души ×2',dur:240,s:150},
  {id:'ward'   ,ic:'🛡',n:'Оберег'       ,d:'−22% получаемого урона',dur:180,s:130}
];
const ALTAR_LV=[0,200,600,1500,3500,8000,16000];
function altarLevel(){const x=player.altarXp||0;let l=1;for(let i=1;i<ALTAR_LV.length;i++)if(x>=ALTAR_LV[i])l=i+1;return l;}
function relicSlots(){const l=altarLevel();return l>=6?4:l>=4?3:l>=2?2:1;}
function relicOn(id){return !!(player.relEq&&player.relEq.indexOf(id)>=0);}
function ritOn(id){return !!(player.rit&&player.rit[id]>0);}
function gunDmgMult(){return (ritOn('blood')?1.4:1)*(1+0.08*perkLv('fury')*0.5);}
function spendSouls(n){player.souls-=n;player.altarXp=(player.altarXp||0)+n;}
/* общее попадание оружия по мобу: крит, вампиризм, поджог */
function hitMobGun(m,dmg,kb,src){
  let crit=false;
  if(relicOn('fang')&&Math.random()<0.15){dmg*=2;crit=true;}
  dmg=Math.round(dmg);
  damageMob(m,dmg,kb,src&&src.x!==undefined?src:{x:player.x,gun:true});
  if(crit)floatText(m.x,m.y-m.h-22,'КРИТ!','#ffd040');
  const k=src&&src.kind;
  if(k==='flame'){m.burn=Math.max(m.burn||0,4);m.burnDps=Math.max(m.burnDps||0,dmg*0.5);}
  if(k==='vamp'&&player.hp>0){player.hp=Math.min(player.maxHp,player.hp+dmg*0.05);}
}
function playerSplash(p){
  const r=p.kind==='acid'?84:58;
  for(let i=0;i<(p.kind==='acid'?22:14);i++){const a=Math.random()*TAU,sp=rnd(60,240);spawnPart(p.x,p.y,Math.cos(a)*sp,Math.sin(a)*sp,rnd(0.3,0.7),p.kind==='acid'?(i%2?'#9aff40':'#d8ff90'):(i%2?'#ff8a30':'#ffd060'),rnd(2,4.5),200);}
  shockRings.push({x:p.x,y:p.y,r:6,max:r,t:0,col:p.kind==='acid'?'#9aff40':'#ffb030'});
  for(const m of mobs){if(!m.alive)continue;const d=m.def.hb?hbDistToMob(m,p.x,p.y):Math.hypot(m.x-p.x,m.y-m.h*0.5-p.y);
    if(d<r+(m.def.hb?0:m.w*0.4)){hitMobGun(m,p.dmg*(d<r*0.5?1:0.6),Math.sign(m.x-p.x),{x:p.x,kind:p.kind});if(p.kind==='acid'){m.poison=Math.max(m.poison||0,5);m.poisonDps=Math.max(m.poisonDps||0,p.dmg*0.15);}}}
  SFX.boom();shake(3);
}
function thrownBoom(p){
  if(p.ice){
    const tx=Math.floor(p.x/TILE),ty=Math.floor(p.y/TILE);
    for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){if(dx*dx+dy*dy>10)continue;const t=getTile(tx+dx,ty+dy);if(t===T_LAVA||isLiq(t))setTile(tx+dx,ty+dy,T_OBS);}
    for(const m of mobs){if(m.alive&&Math.hypot(m.x-p.x,m.y-m.h*0.5-p.y)<120){m.frozen=4;m.stun=Math.max(m.stun||0,1.2);damageMob(m,220,0,{x:p.x});}}
    for(let i=0;i<30;i++){const a=Math.random()*TAU,sp=rnd(60,260);spawnPart(p.x,p.y,Math.cos(a)*sp,Math.sin(a)*sp,rnd(0.4,1),i%2?'#bff6ff':'#7ad8ff',rnd(2,4),100);}
    shockRings.push({x:p.x,y:p.y,r:6,max:110,t:0,col:'#9be8ff'});SFX.splash();shake(4);return;
  }
  explode(p.x,p.y,96,0);
  shockRings.push({x:p.x,y:p.y,r:8,max:120,t:0,col:'#ffb030'});
  for(const m of mobs){if(!m.alive)continue;const d=Math.hypot(m.x-p.x,m.y-m.h*0.5-p.y);if(d<110+m.w*0.4)damageMob(m,Math.round(1200*(d<55?1:0.6)),Math.sign(m.x-p.x)*2,{x:p.x});}
  const pd=Math.hypot(player.x-p.x,player.y-player.h*0.5-p.y);if(pd<70)hurtPlayer(60,'своя бомба');
}
function throwItem(kind){
  const sx=player.x+player.facing*10,sy=player.y-player.h*0.7;
  let ax=player.facing,ay=-0.6;
  if(aim.active){ax=aim.x-sx;ay=aim.y-sy;const l=Math.hypot(ax,ay)||1;ax/=l;ay/=l;ay-=0.25;}
  const l=Math.hypot(ax,ay)||1;
  projectiles.push({x:sx,y:sy,vx:ax/l*480,vy:ay/l*480,life:5,dmg:0,color:kind==='ice'?'#9be8ff':'#ff8a30',size:6,owner:'player',thrown:true,fuse:1.4,ice:kind==='ice'});
  SFX.jump();
}
const pBeams=[],shockRings=[];
function zigzag(x1,y1,x2,y2){const pts=[[x1,y1]];const n=6;for(let i=1;i<n;i++){const t=i/n;pts.push([x1+(x2-x1)*t+rnd(-10,10),y1+(y2-y1)*t+rnd(-10,10)]);}pts.push([x2,y2]);return pts;}
function muzzleFlash(x,y,a,g){
  const c=g.color||'#ffe9a8';
  for(let i=0;i<(g.pellets>1?7:4);i++){const aa=a+rnd(-0.35,0.35),sp=rnd(120,320);spawnPart(x,y,Math.cos(aa)*sp,Math.sin(aa)*sp,rnd(0.06,0.16),i%2?'#fff4c0':c,rnd(2,3.6),0);}
  flashes.push({x,y,a,t:0.07,c});
}
const flashes=[];
function updateFxLists(dt){
  for(let i=pBeams.length-1;i>=0;i--){pBeams[i].t-=dt;if(pBeams[i].t<=0)pBeams.splice(i,1);}
  for(let i=shockRings.length-1;i>=0;i--){const r=shockRings[i];r.t+=dt;r.r=r.max*Math.min(1,r.t/0.35);if(r.t>0.5)shockRings.splice(i,1);}
  for(let i=flashes.length-1;i>=0;i--){flashes[i].t-=dt;if(flashes[i].t<=0)flashes.splice(i,1);}
  /* жар рынка остывает: спрос восстанавливается */
  if(G.wf&&G.wf.sat){for(const k in G.wf.sat){G.wf.sat[k]*=Math.exp(-dt/150);if(G.wf.sat[k]<0.5)delete G.wf.sat[k];}}
  if(player.rit){for(const k in player.rit){player.rit[k]-=dt;if(player.rit[k]<=0){delete player.rit[k];if(k==='blood')recomputeStats();UI.toast('Ритуал окончен');}}}
  updateFurnace(dt);
}
function drawFxLists(g){
  for(let i=slashes.length-1;i>=0;i--){const s2=slashes[i];s2.t-=1/60;if(s2.t<=0){slashes.splice(i,1);continue;}
    const a=s2.t/0.18;g.save();g.translate(s2.x,s2.y);g.scale(s2.dir,1);g.globalCompositeOperation='lighter';
    g.strokeStyle=hexA(s2.c,0.85*a);g.lineWidth=5*a+1;g.lineCap='round';g.beginPath();g.arc(-6,0,22,-1.2+(1-a)*0.6,1.0+(1-a)*0.6);g.stroke();
    g.strokeStyle='rgba(255,255,255,'+(0.9*a)+')';g.lineWidth=1.5;g.beginPath();g.arc(-6,0,22,-1.0+(1-a)*0.6,0.8+(1-a)*0.6);g.stroke();g.restore();}
  for(const b of pBeams){
    const a=clamp(b.t/0.25,0,1);
    g.save();g.lineCap='round';g.lineJoin='round';
    for(const [w,al,c] of [[b.w*3.4,0.25,b.col],[b.w,0.9,b.col],[b.w*0.4,1,'#ffffff']]){
      g.strokeStyle=hexA(c,al*a);g.lineWidth=w;g.beginPath();g.moveTo(b.pts[0][0],b.pts[0][1]);for(let i=1;i<b.pts.length;i++)g.lineTo(b.pts[i][0],b.pts[i][1]);g.stroke();}
    g.restore();
  }
  for(const r of shockRings){const a=1-r.t/0.5;g.save();g.globalCompositeOperation='lighter';
    g.strokeStyle=hexA(r.col,0.22*a);g.lineWidth=10*a+2;g.beginPath();g.arc(r.x,r.y,Math.max(0.1,r.r),0,TAU);g.stroke();
    g.strokeStyle=hexA(r.col,0.8*a);g.lineWidth=2*a+0.8;g.beginPath();g.arc(r.x,r.y,Math.max(0.1,r.r),0,TAU);g.stroke();
    g.strokeStyle='rgba(255,255,255,'+(0.5*a)+')';g.lineWidth=0.8;g.beginPath();g.arc(r.x,r.y,Math.max(0.1,r.r-1.5),0,TAU);g.stroke();g.restore();}
  for(const f of flashes){const a=f.t/0.07;g.save();g.translate(f.x,f.y);g.rotate(f.a);g.globalCompositeOperation='lighter';
    g.fillStyle=hexA(f.c,0.8*a);g.beginPath();g.moveTo(0,-5);g.lineTo(22,0);g.lineTo(0,5);g.closePath();g.fill();
    g.fillStyle='rgba(255,255,240,'+(0.9*a)+')';g.beginPath();g.arc(0,0,5,0,TAU);g.fill();g.restore();}
}
function statAdd(k,v){if(!player.stats)player.stats={};player.stats[k]=(player.stats[k]||0)+(v||1);}
function pickBiomeMobs(depth,small){
  return MOBDEFS.filter(d=>(d.dim||0)===G.dim&&!d.neutral&&!d.trap&&!d.boss&&d.d0<90000&&depth>=d.d0-20&&depth<=d.d1&&(!small||d.hp<=1600*(1+depth/600)));
}
const ELITE_AFFIX=[
  {id:'fire' ,n:'Пылающий' ,c:'#ff7a2a'},{id:'stone',n:'Каменный',c:'#c8c0b0'},{id:'swift',n:'Стремительный',c:'#7affe8'},
  {id:'vamp' ,n:'Кровопийца',c:'#ff3a5a'},{id:'blast',n:'Взрывной',c:'#ffd040'},{id:'shield',n:'Щитоносец',c:'#9ad8ff'}
];
function makeElite(m){
  if(!m||m.elite||m.def.boss)return m;
  const a=ELITE_AFFIX[Math.floor(Math.random()*ELITE_AFFIX.length)];
  m.elite=a;m.hp=m.maxHp=Math.round(m.maxHp*(a.id==='stone'?3.4:2.4));m.w*=1.15;m.h*=1.15;
  m.eDmg=a.id==='fire'?1.5:1.35;m.eSpd=a.id==='swift'?1.6:1;
  if(a.id==='shield')m.eShield=1;
  return m;
}
const trapSpawned=new Set();let trapT=0,trapHzT=0;
function trapKeys(q){const out=[];for(let r=0;r<q.th;r++)for(let c=0;c<q.tw;c++){const ch=q.st.tpl[r][c];if(ch==='q'||ch==='h'||ch==='z')out.push((q.px+c)+','+(q.py+r));}return out;}
function lockedChestOpen(q){
  const trd=G.wf.trd||[],key=q.px+','+q.py;
  for(const k of trapKeys(q))if(trd.indexOf(k)<0)return false;
  if(q.st.tpl.some(r=>r.indexOf('s')>=0)&&!(G.wf.done&&G.wf.done.indexOf(key)>=0))return false;
  return true;
}
function updateTraps(dt){
  if(G.dim!==1)return;
  const ptx=Math.floor(player.x/TILE),pty=Math.floor(player.y/TILE);
  trapT-=dt;
  if(trapT<=0){
    trapT=0.4;
    for(const q of structList(ptx-26,ptx+26,pty-18,pty+18)){
      if(!q.st.danger)continue;
      for(let r=0;r<q.th;r++)for(let c=0;c<q.tw;c++){
        const ch=q.st.tpl[r][c];if(ch!=='q'&&ch!=='h'&&ch!=='z')continue;
        const wx=q.px+c,wy=q.py+r,key=wx+','+wy;
        if(trapSpawned.has(key)||(G.wf.trd&&G.wf.trd.indexOf(key)>=0))continue;
        if(Math.abs(wx-ptx)>24||Math.abs(wy-pty)>16)continue;
        const def=MOBDEFS.find(d=>d.id===(ch==='q'?'skullturret':ch==='h'?'bloodpod':'riftcrystal'));
        let x=wx*TILE+16,y=wy*TILE+TILE;
        if(ch==='q'){const left=isSolid(wx-1,wy);x=left?wx*TILE+15:wx*TILE+17;y=wy*TILE+TILE-2;}
        if(ch==='h'){const fr=glyphFloorRow(wx,wy);y=(fr>=0?fr+1:wy+1)*TILE;}
        if(ch==='z')y=wy*TILE+TILE+10;
        const m=spawnMobAt(def,x,y);m.trapKey=key;m.facing=1;
        const sc=1+Math.max(0,wy-30)/380;m.sc=sc;m.hp=m.maxHp=Math.round(def.hp*sc);m.minions=[];m.cd=1.5;
        trapSpawned.add(key);
      }
    }
  }
  updateCircles(dt);
  trapHzT-=dt;if(G.trapHurtT>0)G.trapHurtT-=dt;
  if(trapHzT<=0){
    trapHzT=1/15;
    for(const q of structList(ptx-3,ptx+3,pty-5,pty+5)){
      for(let r=0;r<q.th;r++)for(let c=0;c<q.tw;c++){
        const ch=q.st.tpl[r][c];if(ch!=='f'&&ch!=='p')continue;
        const wx=q.px+c,wy=q.py+r;if(Math.abs(wx-ptx)>2)continue;
        if(G.trapHurtT>0||cheats.god)continue;
        const cx=wx*TILE+16;
        if(ch==='f'){
          const st=flameJetState(wx,wy),fr=glyphFloorRow(wx,wy);if(!st.on||fr<0)continue;
          const base=fr*TILE+22;
          if(Math.abs(player.x-cx)<15&&player.y>base-TILE*2.8*st.k&&player.y-player.h<base){G.trapHurtT=0.45;hurtPlayer(player.maxHp*0.07+40,'огненная струя',{burn:3});player.vy=Math.min(player.vy,-260);}
        }else{
          const cr=glyphCeilRow(wx,wy);if(cr<0)continue;const st=crusherState(wx,wy,cr*TILE);
          if(st.e>0.8&&Math.abs(player.x-cx)<22&&player.y-player.h<st.floorY+20&&player.y>cr*TILE){
            G.trapHurtT=0.8;hurtPlayer(player.maxHp*0.18+60,'давилка',{stun:0.7});player.vx=(player.x<cx?-1:1)*420;shake(10);SFX.boom();}
        }
      }
    }
  }
}
function updateCircles(dt){
  if(!G.circ)G.circ={};
  if(!G.wf.done)G.wf.done=[];
  const ptx=player.x/TILE,pty=player.y/TILE;
  for(const q of structList(Math.floor(ptx)-12,Math.floor(ptx)+12,Math.floor(pty)-8,Math.floor(pty)+8)){
    if(!q.st.danger)continue;
    const key=q.px+','+q.py;
    if(G.wf.done.indexOf(key)>=0||G.circ[key])continue;
    for(let r=0;r<q.th;r++){const c=q.st.tpl[r].indexOf('s');if(c<0)continue;
      const wx=q.px+c,wy=q.py+r;
      if(Math.abs(ptx-(wx+0.5))<3&&Math.abs(pty-(wy+1))<1.5){
        G.circ[key]={wave:0,alive:[],t:1.4,wx,wy};
        UI.toast('🔴 Печать призыва пробудилась! Выстой три волны');shake(8);SFX.boom();
      }}
  }
  for(const key in G.circ){
    const c=G.circ[key];
    c.alive=c.alive.filter(m=>m.alive&&mobs.indexOf(m)>=0);
    if(Math.hypot(ptx-c.wx,pty-c.wy)>40||G.scene!=='mine'){delete G.circ[key];continue;}
    if(c.alive.length)continue;
    c.t-=dt;if(c.t>0)continue;
    if(c.wave>=3){
      G.wf.done.push(key);delete G.circ[key];
      player.souls=(player.souls||0)+30;UI.toast('✨ Печать сломлена! Сундук открыт, +30 👻');SFX.win&&SFX.win();
      for(let i=0;i<40;i++){const a=Math.random()*TAU,sp=rnd(80,260);spawnPart((c.wx+0.5)*TILE,(c.wy+0.5)*TILE,Math.cos(a)*sp,Math.sin(a)*sp,1,'#5ab8ff',3,0);}
      continue;
    }
    c.wave++;c.t=1.6;
    const pool=pickBiomeMobs(c.wy,false),n=2+c.wave;
    for(let i=0;i<n&&pool.length;i++){
      const d=pool[Math.floor(Math.random()*pool.length)],ang=i/n*Math.PI+Math.PI*(i%2);
      const x=clamp((c.wx+0.5)*TILE+Math.cos(ang)*130,(1.5)*TILE,(MW-1.5)*TILE);
      const mm=spawnMobAt(d,x,d.fly?(c.wy-1)*TILE:(c.wy+1)*TILE);
      if(c.wave===3&&i===0)makeElite(mm);
      c.alive.push(mm);burst(mm.x,mm.y-mm.h*0.5,14,'#ff3a6a',160,3);
    }
    floatText((c.wx+0.5)*TILE,(c.wy-1)*TILE,'Волна '+c.wave+'/3','#ff7a9a');SFX.portal();
  }
}
