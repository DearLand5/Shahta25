'use strict';
/* ============================================================
   ЛИЛОВЫЕ НЕБЕСА — постройки (G.dim===2)
   Шаблоны из символов, как у Земли и Ада (STRUCTS из 11-worldgen), но со своими
   значениями символов. Блоки: # x w b o — материал из st.m (по умолчанию порода биома,
   w — доски); i/g — руда; ~ мёд; = вода. Остальные символы — воздух с предметами,
   их рисует 52-lilac-struct-art, а оживляет lilStructTick ниже.
   Состояние каждой постройки — G.wf.ls[ключ] (мир сохраняется вместе с ним).
   ============================================================ */
const LS_TPL={
  /* Цветущие луга */
  teaArbor:[
    "......##########......",
    "...####........####...",
    "..##..L...vv...L..##..",
    "..|................|..",
    "..|................|..",
    "..|..h..h.T..h..h..|..",
    "######################"],
  picnic:[
    "......................",
    "...L......L.......L...",
    "......................",
    ".e..PPKPPPKPPPKP..C.e.",
    "######################"],
  noteStash:[
    "#######",
    "#.....#",
    "#.c.n.#",
    "#######"],
  /* Хрустальный сад */
  greenhouse:[
    "........##########........",
    ".....####........####.....",
    "...###..v........v..###...",
    "..##....................##",
    "..........................",
    "..f..M..f..M.C.f..M..f..M.",
    "##########################"],
  silentChapel:[
    "........######........",
    "......###....###......",
    "....###....B...###....",
    "...##............##...",
    "..##..W....W....W.##..",
    "......................",
    "....p.p....A...p.p....",
    "######################"],
  /* Медовые соты */
  queenHive:[
    ".......############.......",
    ".....###xxxxxxxxxx###.....",
    "....##..............##....",
    "...##..v..v....v..v..##...",
    "..##..................##..",
    "..#.....xx......xx.....#..",
    "..........................",
    "..#~~~~~....C......~~~~#..",
    "..######################.."],
  candleWorks:[
    "########################",
    "#......................#",
    "#......................#",
    "#......................#",
    "#......j........j......#",
    ".....wwwww....wwwww.....",
    "...j........j.......j.k.",
    "########################"],
  /* Кукольный городок */
  dollHouse:[
    "..........##..........",
    ".......########.......",
    "....##############....",
    "######################",
    "#......#......#......#",
    "#......#......#......#",
    "......................",
    "......................",
    "#xxxxx..xxxxxxxx..xxx#",
    "#......#......#......#",
    "#......#......#......#",
    "......................",
    "......................",
    "######################"],
  carousel:[
    "......##############......",
    "....###............###....",
    "..###..................###",
    ".##......................#",
    "#........................#",
    "#........................#",
    "..........................",
    "...Y.........R........k...",
    "##########################"],
  puppetTheater:[
    "##########################",
    "#........................#",
    "#...L.......L.......L....#",
    "#........................#",
    "#........................#",
    "#........................#",
    "#...............S........#",
    "...........xxxxxxxxxxxxx.#",
    "...h.h.h.h.xxxxxxxxxxxx.k#",
    "##########################"],
  /* Розарий */
  roseAltar:[
    "....############....",
    "..###..........###..",
    ".##....R....R....##.",
    "##................##",
    "....................",
    "....r....A.....r....",
    "####################"],
  hedgeMaze:[
    "#.#########################",
    "..........................#",
    ".......x.......x..........#",
    "####################......#",
    "#.........................#",
    "#.....x........x.......x..#",
    "#......####################",
    "#.........................#",
    "#........r...C...r........#",
    "###########################"],
  /* Зеркальные топи */
  mirrorMaze:[
    "###########################",
    "#...L...xx...L...xx...L...#",
    "#.......xx.......xx.......#",
    "#.......xx.......xx.......#",
    "#.......xx.......xx.......#",
    "........xx.......xx.......#",
    "...1....xx.5.3.2.xx..4..C.#",
    "###########################"],
  upsideHouse:[
    "xxxxxxxxxxxxxxxxxxxxxx",
    "x..T..h..L....h..U...x",
    "x....................x",
    "......................",
    "......................",
    "xx..................xx",
    ".xxx..............xxx.",
    "...xxxxx......xxxxx...",
    ".......xxxxxxxx......."],
  /* Колыбель */
  dreamWell:[
    "....########....",
    "..###......###..",
    ".##....Z.....##.",
    "##............##",
    "................",
    ".......O........",
    "################"],
  nursery:[
    "########################",
    "#......................#",
    "#...*.....*.......*....#",
    "#......................#",
    "#......................#",
    "........................",
    "....X.........m.....k..#",
    "########################"]
};
/* m — материалы блоков; wall — задняя стена; lock — подпись запертого сундука */
const LS_DEFS=[
  {id:'teaArbor',    wall:'llattice',cw:44,ch:30,prob:38,d0:12,  d1:236, m:{'#':T_LPORC}},
  {id:'picnic',      wall:'none',    cw:42,ch:28,prob:36,d0:12,  d1:236, m:{'#':T_LSOD}},
  {id:'greenhouse',  wall:'lglass',  cw:46,ch:30,prob:38,d0:262, d1:538, m:{'#':T_LGLASS}},
  {id:'silentChapel',wall:'lchapel', cw:44,ch:32,prob:32,d0:262, d1:538, m:{'#':T_LPORC}},
  {id:'queenHive',   wall:'lwax',    cw:46,ch:30,prob:36,d0:562, d1:838, m:{'#':T_LWAX,'x':T_LCOMB}},
  {id:'candleWorks', wall:'lshop',   cw:44,ch:30,prob:34,d0:562, d1:838, m:{'#':T_LWAX,'w':T_WOOD},lock:'Заперто: зажги все свечи разом'},
  {id:'dollHouse',   wall:'lpaper',  cw:44,ch:34,prob:36,d0:862, d1:1138,m:{'#':T_LTOY,'x':T_WOOD}},
  {id:'carousel',    wall:'lcircus', cw:46,ch:32,prob:32,d0:862, d1:1138,m:{'#':T_LTOY},lock:'Заперто: пройди испытание карусели'},
  {id:'puppetTheater',wall:'lcurtain',cw:46,ch:32,prob:32,d0:862,d1:1138,m:{'#':T_LTOY,'x':T_WOOD},lock:'Заперто: досмотри представление'},
  {id:'roseAltar',   wall:'lrose',   cw:42,ch:30,prob:36,d0:1162,d1:1438,m:{'#':T_LTHORN}},
  {id:'hedgeMaze',   wall:'lhedge',  cw:46,ch:32,prob:34,d0:1162,d1:1438,m:{'#':T_LTHORN,'x':T_LBRIAR}},
  {id:'mirrorMaze',  wall:'lmirror', cw:46,ch:30,prob:36,d0:1462,d1:1738,m:{'#':T_LSILVER,'x':T_LMIRROR}},
  {id:'upsideHouse', wall:'lold',    cw:44,ch:30,prob:34,d0:1462,d1:1738,m:{'x':T_WOOD}},
  {id:'dreamWell',   wall:'lquilt',  cw:40,ch:30,prob:38,d0:1762,d1:2150,m:{'#':T_LCRADLE}},
  {id:'nursery',     wall:'lstars',  cw:44,ch:32,prob:34,d0:1762,d1:2150,m:{'#':T_LCRADLE},lock:'Заперто: останови шкатулку'},
  {id:'noteStash',   wall:'lplank',  cw:38,ch:44,prob:16,d0:20,  d1:2150,m:{'#':T_WOOD}}
];
const LS_NAMES={teaArbor:'Чайная беседка',picnic:'Брошенный пикник',noteStash:'Тайник жителя',greenhouse:'Оранжерея',silentChapel:'Часовня тишины',
  queenHive:'Улей Королевы',candleWorks:'Свечная мастерская',dollHouse:'Кукольный домик',carousel:'Заброшенная карусель',puppetTheater:'Кукольный театр',
  roseAltar:'Алтарь шипов',hedgeMaze:'Живой лабиринт',mirrorMaze:'Зеркальный лабиринт',upsideHouse:'Перевёрнутый дом',dreamWell:'Колодец снов',nursery:'Детская'};
for(const d of LS_DEFS){
  const tpl=LS_TPL[d.id];
  if(tpl.some(r=>r.length!==tpl[0].length))console.error('Шаблон '+d.id+': строки разной длины');
  const st=Object.assign({dim:2},d);st.tpl=tpl;st.idx=STRUCTS.length;
  st.cells={};tpl.forEach((row,r)=>{for(let c=0;c<row.length;c++){const ch=row[c];if(ch==='.'||ch==='#')continue;(st.cells[ch]=st.cells[ch]||[]).push([c,r]);}});
  STRUCTS.push(st);
}
/* клетка постройки при генерации */
function lilStructTile(r,rock,d,wx,wy){
  const sc=r.ch,m=r.st.m||{};
  if(sc==='#'||sc==='x'||sc==='w'||sc==='b'||sc==='o')return {t:m[sc]!==undefined?m[sc]:(sc==='w'?T_WOOD:rock),o:0};
  if(sc==='i'||sc==='g')return {t:m['#']!==undefined?m['#']:rock,o:structOre(wx,wy,d,sc)};
  if(sc==='~')return {t:waterAmt()>0?T_HONEY:T_AIR,o:0};
  if(sc==='=')return {t:waterAmt()>0?T_WATER:T_AIR,o:0};
  return {t:T_AIR,o:0};
}
/* свет от предметов построек */
const LS_LIGHT={L:3.6,c:2.2,n:1.6,T:2.6,W:2.6,B:1.8,A:3,Q:3,j:1.6,R:3.4,S:3.6,O:3.6,Z:2.4,m:2.4,X:3.6,'*':1.6,'1':2.4,'2':2.4,'3':2.4,'4':2.4,'5':2.4,U:2,k:2,C:2.2,e:1.4,K:1.2,r:1.4,f:1.2,Y:1.6,v:1.4};

/* ---------- состояние ---------- */
function lsKey(q){return q.st.id+'@'+q.px+','+q.py;}
function lsState(q){if(!G.wf.ls)G.wf.ls={};const k=lsKey(q);return G.wf.ls[k]||(G.wf.ls[k]={});}
function lsPeek(q){return (G.wf.ls&&G.wf.ls[lsKey(q)])||null;}
function lsDone(q){const s=lsPeek(q);return !!(s&&s.done);}
/* мировые координаты клеток символа */
function lsCells(q,ch){return (q.st.cells[ch]||[]).map(([c,r])=>[q.px+c,q.py+r]);}
function lsInside(q,pad){pad=pad||0;const tx=player.x/TILE,ty=(player.y-player.h*0.5)/TILE;
  return tx>=q.px+pad&&tx<q.px+q.tw-pad&&ty>=q.py+pad&&ty<q.py+q.th-pad;}
/* шахтёр стоит у предмета (на том же полу) */
function lsNear(wx,wy,rx,ry){
  const fr=glyphFloorRow(wx,wy),fy=((fr>=0?fr:wy)+1)*TILE;
  return Math.abs(player.x-(wx*TILE+16))<(rx||26)&&Math.abs(player.y-fy)<(ry||TILE*1.2);
}
/* подсказка над предметом (рисуется в 52-lilac-struct-art) */
const LS_HINTS=[];
function lsHint(wx,wy,txt,col){if(LS_HINTS.length>=6)return;const fr=glyphFloorRow(wx,wy);LS_HINTS.push({x:wx*TILE+16,y:((fr>=0?fr:wy)+1)*TILE-62,txt,col:col||'#ffe6ff'});}
function lsSan(v){player.sanity=clamp((player.sanity==null?100:player.sanity)+v,0,100);}
function lsHeal(f){player.hp=Math.min(player.maxHp,player.hp+player.maxHp*f);}

/* ---------- звуки построек ---------- */
const LSFX={
  bell(){if(!sfxGate('lsbell',600))return;AU.bell(392,2.4,0.16,0,{ratio:2.76,index:1.4,rev:0.7});AU.bell(196,3,0.1,0.02,{ratio:2.01,index:0.8,rev:0.8});},
  tea(){AU.bell(1568,0.4,0.05,0,{ratio:3,index:0.6});AU.noise(0.5,1400,0.025,0.05,{type:'bandpass',q:2});},
  mbox(i){const N=[1047,1319,1568,1319,1175,1047,988,1047,1319,1175,988,784];const f=N[i%N.length];AU.bell(f,0.9,0.05,0,{ratio:4.01,index:0.45,rev:0.6});},
  giggle(){if(!sfxGate('lsgig',2500))return;for(let i=0;i<4;i++)AU.osc('triangle',rr(900,1150),0.08,0.05,i*0.11,{to:rr(700,850)});},
  creak(){if(!sfxGate('lscrk',700))return;AU.noise(0.6,rr(260,420),0.05,0,{type:'bandpass',q:9,to:rr(180,300)});},
  shatter(){AU.noise(0.25,5200,0.08,0,{type:'highpass'});AU.bell(rr(2200,2800),0.3,0.05,0.02,{ratio:1.41,index:0.6});},
  candle(){AU.noise(0.18,2600,0.04,0,{type:'bandpass',q:3});AU.bell(880,0.3,0.03,0.02,{ratio:2,index:0.4});},
  buzz(){if(!sfxGate('lsbz',260))return;AU.osc('sawtooth',rr(180,240),0.25,0.025,0,{to:rr(160,220)});}
};

/* ---------- записки жителей ---------- */
const LIL_NOTES=[
  ['Анна, пекарша','Если найдёте это — передайте мужу, что я не сержусь. Я просто спустилась за мёдом для пирога. Туман тут тёплый, как печка. Я посижу немножко и вернусь.'],
  ['Пётр, фонарщик','Фонари в шахте горят сами. Я их не зажигал. Я считал: вчера их было сорок, сегодня сорок один. Новый стоит прямо у нашего дома. Внизу.'],
  ['Маша, 7 лет','Кукла сказала, что в домике под землёй у каждой комнаты есть ножки. Если отвернуться, комнаты убегают. Я не отворачивалась. Я просто моргнула.'],
  ['Без подписи','Не пей чай в беседке, если чашек на одну больше, чем гостей. Лишняя чашка — для тебя. Её наливают заранее.'],
  ['Ольга, швея','Сегодня в оранжерее один горшок повернулся ко мне. Цветы так не умеют. Я шила всю ночь, чтобы не думать о том, что у него были зубы.'],
  ['Звонарь','В часовне надо молчать. Колокол не любит шума. Однажды я уронил ключи, и он звонил, пока я не забыл своё имя. Теперь я молчу и вам советую.'],
  ['Пасечник Гаврила','Королева не злая. Она просто хочет, чтобы все были сладкими. Все-все. Если пчёлы погонятся — ныряй в мёд. Мёд их обманывает. И тебя тоже.'],
  ['Свечник','Свечи из сотового воска тают быстро. Зажгёшь одну — беги к следующей. Когда горят все пять, дверь кладовой сама открывается. Только не смотри, что за ней шевелится.'],
  ['Без подписи','Карусель снова играла ночью. Никто её не заводил. Лошадки утром стояли не там, где вечером, и у одной в зубах был мой шарф.'],
  ['Кукольник','Я сделал куклу каждого жителя. Это подарок. Когда они уснут, куклы займут их места, и в деревне всегда будет праздник. Никто не заметит. Даже они.'],
  ['Садовник','Розы просят немного крови. Капельку. Взамен они дарят то, что спрятали корни. Только не давайте больше трёх раз — розы привыкают.'],
  ['Без подписи','В зеркальном лабиринте верь только отражению, которое повторяет за тобой. Если оно улыбается, когда ты не улыбаешься, — это уже не ты.'],
  ['Мельник','Мой дом перевернулся. Я хожу по потолку, и мне хорошо. Внизу — небо. Если упасть в него, наверное, проснёшься.'],
  ['Бабушка Ульяна','Колодец снов показывает самый сладкий сон. Шестьдесят ударов сердца, не больше. Я осталась дольше. Не знаю, проснулась ли я.'],
  ['Без подписи','Колыбельная в детской поёт сама. Кто её дослушает, тот уснёт. Остановишь шкатулку — проснётся тот, кого она укачивала. Выбирай.'],
  ['Староста','Всем жителям: в шахту по одному не ходить. Рассудок беречь. Фонари-якоря не трогать. Если вам кажется, что деревня наверху — нарисованная, не говорите об этом вслух.']
];
function lsReadNote(q,wx,wy){
  const S=lsState(q);if(S.read)return;
  S.read=1;
  if(!player.prog.lnotes)player.prog.lnotes=[];
  const L=player.prog.lnotes;let id=-1;
  for(let i=0;i<LIL_NOTES.length;i++)if(L.indexOf(i)<0){id=i;break;}
  const money=Math.round((40000+wy*300)*rnd(0.8,1.2));player.money+=money;
  if(id<0)id=Math.floor(Math.random()*LIL_NOTES.length);else L.push(id);
  floatText(wx*TILE+16,wy*TILE-20,'Записка · +'+fmt(money)+' 💰','#ffe6a0');SFX.chest();saveGame();
  UI.lnote(id);
}
UI.lnote=function(id){
  const n=LIL_NOTES[id]||LIL_NOTES[0],got=(player.prog.lnotes||[]).length;
  const d=this.build('lnote',`
    <div class="card lilac" style="max-width:440px;width:94vw">
      <h3>Записка</h3>
      <div class="lnote"><div class="lnt">${n[1]}</div><div class="lns">— ${n[0]}</div></div>
      <p class="tiny" style="text-align:center;margin-top:6px">Найдено записок: ${got} из ${LIL_NOTES.length}</p>
    </div>
    <button class="btn" id="lnBack">Сложить записку</button>`);
  d.querySelector('#lnBack').onclick=()=>{SFX.uiBack();UI.close();};
};

/* ---------- сундуки Лиловых небес ---------- */
function lilOpenChest(wx,wy,rich){
  const d=wy,b=clamp(lilBand2(d),0,6);
  let money=Math.round((90000+d*850)*rnd(0.8,1.3)*(rich?3:1)*lbMod('chest'));
  player.money+=money;statAdd('chests');if(rich)statAdd('bigChests');
  let txt='+'+fmt(money)+' 💰';
  const cand=ORES.filter(o=>o&&o.dim===2&&d>=o.dmin-20&&d<=o.dmax&&o.tier<=Math.max(10,player.pickLvl+1));
  for(let k=0;k<(rich?3:2)&&cand.length;k++){const o=cand[Math.floor(Math.random()*cand.length)],n=1+Math.floor(Math.random()*(rich?4:3));addOre(o.id,n);txt+=' · '+n+'× '+o.name;}
  if(cand.length&&Math.random()<(rich?0.9:0.45)){const o=cand[Math.floor(Math.random()*cand.length)];addMat('i'+o.id,1+Math.floor(Math.random()*2));txt+=' · слиток';}
  if(rich||Math.random()<0.3){const e=LIL_ESS[b];addMat(e[0],1);txt+=' · '+e[1];}
  const sl=3+Math.floor(Math.random()*6)+(rich?10:0);player.souls=(player.souls||0)+sl;txt+=' · +'+sl+' 👻';
  {const sn=lbChestSny(wy,rich);if(sn)txt+=' · +'+sn+' 🌙';}
  if(Math.random()<0.4){player.potions++;txt+=' · 🧪';}
  if(Math.random()<0.5){player.ladders+=5;txt+=' · 🪜×5';}
  if(player.gunLvl>0&&Math.random()<0.45){const g=curGun();player.gunAmmo+=g.pack;txt+=' · 🔸×'+g.pack;}
  floatText(wx*TILE+16,wy*TILE-24,rich?'Богатый сундук!':'Сундук!','#ffd98a');
  floatText(wx*TILE+16,wy*TILE-44,txt,'#e8d0ff');
  burst(wx*TILE+16,wy*TILE+10,18,'#ffd0f0',170,3);
  SFX.chest();vib(30);
  const r=structAt(wx,wy);if(r&&r.st.id==='queenHive')lsSwarmStart();
  saveGame();
}
/* запертые сундуки построек открываются, когда механика пройдена */
function lilLockedOpen(q){return lsDone(q);}

/* ---------- рой пчёл (Улей Королевы) ---------- */
const LSW={t:0,bees:[],hurtT:0};
function lsSwarmStart(){
  LSW.t=16;LSW.bees.length=0;
  for(let i=0;i<26;i++)LSW.bees.push({x:player.x+rnd(-140,140),y:player.y-rnd(40,160),vx:0,vy:0,ph:Math.random()*TAU});
  UI.toast('🐝 Рой Королевы! Ныряй в мёд или беги');shake(5);LSFX.buzz();
}
function lsSwarmTick(dt){
  if(LSW.t<=0)return;
  LSW.t-=dt;
  const inHoney=getTile(Math.floor(player.x/TILE),Math.floor((player.y-player.h*0.5)/TILE))===T_HONEY;
  if(inHoney&&LSW.t>1.2){LSW.t=1.2;floatText(player.x,player.y-70,'Рой потерял тебя в мёде','#ffd060');}
  const tx=player.x,ty=player.y-player.h*0.6;
  for(const b of LSW.bees){
    const leave=LSW.t<1.2;
    const ax=(leave?(b.x-tx)*2:(tx+Math.cos(G.time*3+b.ph)*34-b.x))*3.2,ay=(leave?-260:(ty+Math.sin(G.time*4+b.ph*2)*26-b.y))*3.2;
    b.vx+=ax*dt;b.vy+=ay*dt;b.vx*=1-3*dt;b.vy*=1-3*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;
  }
  if(Math.random()<dt*5)LSFX.buzz();
  LSW.hurtT-=dt;
  if(LSW.t>1.2&&LSW.hurtT<=0&&!cheats.god){LSW.hurtT=0.5;hurtPlayer(player.maxHp*0.022,'пчёлы');}
  if(LSW.t<=0)LSW.bees.length=0;
}

/* ---------- сонный карман (Колодец снов) ---------- */
const DREAM_Y0=LIL_FLOOR+40,DREAM_Y1=DREAM_Y0+44,DREAM_T=60;
function lilDreamTile(wx,wy){
  if(wy===DREAM_Y0||wy>=DREAM_Y1-1||wx<=1||wx>=MW-2)return {t:wy>=DREAM_Y1-2?T_LDOWN:T_BEDROCK,o:0};
  if(wy<DREAM_Y0)return {t:T_BEDROCK,o:0};
  const n=(G.wf&&G.wf.dreamN)||0,s=G.seed+93001+n*101;
  /* площадка прибытия */
  if(wy===DREAM_Y0+12&&Math.abs(wx-MW/2)<=4)return {t:T_LDOWN,o:0};
  if(wy<DREAM_Y0+12&&Math.abs(wx-MW/2)<=5)return {t:T_AIR,o:0};
  if(wy>=DREAM_Y1-3)return {t:T_LDOWN,o:0};
  /* облачные острова: плоский верх, капля вниз */
  const ix=Math.floor(wx/13),iy=Math.floor((wy-DREAM_Y0)/9),h=hash2(ix,iy,s);
  if(h%100<62){
    const cx=ix*13+3+(h>>>8)%7,cy=DREAM_Y0+iy*9+3+(h>>>12)%3,rw=3+(h>>>16)%3,rh=2+(h>>>20)%2;
    const dx=(wx-cx)/rw,dy=(wy-cy)/rh;
    if(dy>=0&&dx*dx+dy*dy<1){
      let o=0;const r=rnd2(wx,wy,s+7);
      if(dy>0.25&&r<0.42){const pool=[58,59,59,60,60,61,57,54,51,47];o=pool[Math.floor(rnd2(wx,wy,s+9)*pool.length)];}
      return {t:dy<0.3?T_LDOWN:T_LCRADLE,o};
    }
  }
  return {t:T_AIR,o:0};
}
function lilDreamRebuild(){
  for(let ty=DREAM_Y0-1;ty<=DREAM_Y1;ty++)for(let tx=0;tx<MW;tx++){
    const g=genTileAt(tx,ty),cx=Math.floor(tx/CHUNK),cy=Math.floor(ty/CHUNK),c=getChunk(cx,cy),i=(ty-cy*CHUNK)*CHUNK+(tx-cx*CHUNK);
    c.tiles[i]=g.t;c.ores[i]=g.o;c.dmg[i]=0;unrecordTileMod(tx,ty);dugTiles.delete(tx+','+ty);placedLadders.delete(tx+','+ty);ccMarkDirty(tx,ty);
  }
  tileEpoch++;
}
function lilDreamEnter(q,wx,wy){
  G.wf.dreamN=((G.wf.dreamN||0)+1)%1000;
  G.wf.dreamRet={x:wx*TILE+16,y:(glyphFloorRow(wx,wy)+1)*TILE-1};
  lilDreamRebuild();
  G.dream={t:DREAM_T,ret:G.wf.dreamRet,san:player.sanity};
  for(const m of mobs)if(m.trapKey)trapSpawned.delete(m.trapKey);
  mobs.length=0;
  player.x=(MW/2)*TILE+16;player.y=(DREAM_Y0+12)*TILE-1;player.vx=0;player.vy=0;player.grav=1;
  G.cam.x=player.x;G.cam.y=player.y-player.h*0.5;G.fadeIn=1.2;
  SFX.portal();vib(60);UI.toast('🌙 Ты спишь. Сон продлится '+DREAM_T+' секунд');
}
function lilDreamExit(msg){
  const r=G.dream&&G.dream.ret||G.wf.dreamRet;G.dream=null;
  if(r){player.x=r.x;player.y=r.y;}else{player.x=MW/2*TILE;player.y=40*TILE;}
  player.vx=0;player.vy=0;G.cam.x=player.x;G.cam.y=player.y-player.h*0.5;G.fadeIn=1.2;
  SFX.portal();UI.toast(msg||'🌅 Ты проснулся у колодца');saveGame();
}
function lilDreamTick(dt){
  if(!G.dream){
    /* сон оборвался (перезагрузка) — просыпаемся у колодца */
    if(player.y/TILE>LIL_FLOOR+2&&G.wf.dreamRet)lilDreamExit('🌅 Сон оборвался. Ты у колодца');
    return;
  }
  G.dream.t-=dt;
  player.sanity=G.dream.san;
  if(G.dream.t<=0)lilDreamExit();
}

/* ---------- механики построек ---------- */
const LS_MOVE={};    /* что-то вроде «памяти» между кадрами: где был шахтёр */
const LSH={
  teaArbor(q,S){
    if(S.done)return;
    for(const [wx,wy] of lsCells(q,'T')){
      if(!lsNear(wx,wy,44)){if(Math.abs(player.x-wx*TILE)<200&&lsInside(q))lsHint(wx,wy,'Чаепитие');continue;}
      S.done=1;lsSan(55);lsHeal(0.3);LSFX.tea();
      floatText(wx*TILE+16,wy*TILE-30,'Тёплый чай · +55 рассудка','#ffe0f0');
      UI.toast(veilT>0.5?'В чашке не чай. Но тебе стало легче':'Кто-то налил чай заранее. На одну чашку больше, чем гостей');
      for(let k=0;k<14;k++)spawnPart(wx*TILE+16+rnd(-8,8),wy*TILE+4,rnd(-10,10),rnd(-50,-20),1.2,'#fff0ff',2.4,-20);
      saveGame();
    }
  },
  picnic(q,S){
    if(!S.eat)S.eat=[];
    for(const [wx,wy] of lsCells(q,'K')){
      const k=wx+','+wy;if(S.eat.indexOf(k)>=0)continue;
      if(!lsNear(wx,wy,20))continue;
      S.eat.push(k);
      if(veilT>0.5){lsHeal(0.2);lsSan(-22);floatText(wx*TILE+16,wy*TILE-26,'Пирожное шевелится… −22 рассудка','#ff9ab0');}
      else{lsHeal(0.4);lsSan(-12);floatText(wx*TILE+16,wy*TILE-26,'Слишком сладко… +40% здоровья, −12 рассудка','#ffd0e8');}
      SFX.heal&&SFX.heal();burst(wx*TILE+16,wy*TILE+24,10,'#ffb0d8',90,2.4);saveGame();
    }
  },
  noteStash(q,S){
    if(S.read)return;
    for(const [wx,wy] of lsCells(q,'n')){if(lsNear(wx,wy,22))lsReadNote(q,wx,wy);}
  },
  greenhouse(q,S){
    if(!S.pick)S.pick=[];
    for(const [wx,wy] of lsCells(q,'f')){
      const k=wx+','+wy;if(S.pick.indexOf(k)>=0)continue;
      if(!lsNear(wx,wy,22))continue;
      S.pick.push(k);const e=LIL_ESS[1];addMat(e[0],1);
      floatText(wx*TILE+16,wy*TILE-26,'Настоящий цветок · '+e[1],'#c8f0ff');SFX.ore();burst(wx*TILE+16,wy*TILE+10,12,'#bfe6ff',100,2.4);saveGame();
    }
  },
  silentChapel(q,S,dt){
    if(!lsInside(q,1))return;
    if(player.sanity<100)lsSan(4*dt);
    const noisy=(player.digTileX>=0&&player.digProg>0)||player.atkAnim>0.92||((player.gunCd||0)>0&&!(LS_MOVE.gun>0));
    LS_MOVE.gun=player.gunCd||0;
    if(noisy&&G.time>(S.bellT||0)){
      S.bellT=G.time+4;lsSan(-25);LSFX.bell();shake(4);vib(40);S.ring=G.time;
      floatText(player.x,player.y-74,'Тише! Колокол не любит шума · −25 рассудка','#ffb0c0');
    }
    if(!S.done)for(const [wx,wy] of lsCells(q,'A')){
      if(!lsNear(wx,wy,30)){lsHint(wx,wy,'Помолчи у алтаря');S.pray=0;continue;}
      S.pray=(S.pray||0)+dt;
      if(S.pray>3){S.done=1;player.sanity=100;addMat('ltea',1);LSFX.bell();
        floatText(wx*TILE+16,wy*TILE-30,'Тишина вернула ясность · Настой ясности','#e0f0ff');saveGame();}
    }
  },
  queenHive(){},
  candleWorks(q,S,dt){
    if(S.done)return;
    if(!S.lit)S.lit={};
    const cs=lsCells(q,'j');let all=true;
    for(const [wx,wy] of cs){
      const k=wx+','+wy;
      if(S.lit[k]&&G.time>S.lit[k]){delete S.lit[k];floatText(wx*TILE+16,wy*TILE-14,'Догорела','#c8a080');}
      if(!S.lit[k]&&lsNear(wx,wy,20,TILE*1.4)){S.lit[k]=G.time+12;LSFX.candle();burst(wx*TILE+16,wy*TILE+8,8,'#ffd080',60,2);}
      if(!S.lit[k])all=false;
    }
    if(all&&cs.length){S.done=1;S.lit={};SFX.win&&SFX.win();UI.toast('🕯 Все свечи горят — кладовая открылась!');shake(3);saveGame();}
    else if(lsInside(q)&&!Object.keys(S.lit).length)lsHint(cs[0][0],cs[0][1],'Зажги все свечи');
  },
  dollHouse(q,S){
    /* комнаты: 3 в ряд на двух этажах, по 6×4 клеток */
    const room=lsDollRoom(q);
    if(!S.perm)S.perm=[0,1,2,3,4,5];
    if(S.room===undefined)S.room=room;
    if(room>=0&&S.room>=0&&room!==S.room&&!S.done){
      /* перешёл в другую комнату — дом переставляет комнаты, пока ты моргаешь */
      S.n=(S.n||0)+1;
      const p=S.perm;for(let i=p.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[p[i],p[j]]=[p[j],p[i]];}
      const tr=p.indexOf(5);
      if(Math.random()<0.2+0.25*S.n){[p[tr],p[room]]=[p[room],p[tr]];}
      else if(p[room]===5){const o=(room+1+Math.floor(Math.random()*5))%6;[p[room],p[o]]=[p[o],p[room]];}
      G.lsBlink=0.35;LSFX.creak();if(Math.random()<0.5)LSFX.giggle();
    }
    if(room>=0)S.room=room;
    if(!S.done&&room>=0&&S.perm[room]===5){
      const [cx,cy]=lsDollChest(q,room);
      if(Math.abs(player.x-(cx*TILE+16))<34&&Math.abs(player.y-(cy+1)*TILE)<TILE){S.done=1;openedChests.add(cx+','+cy);lilOpenChest(cx,cy,true);UI.toast('🎁 Детская нашлась и больше не убегает');}
    }
  },
  carousel(q,S,dt){lsCarouselTick(q,S,dt);},
  puppetTheater(q,S,dt){
    if(S.done)return;
    const sx=q.px+16,seat=player.x/TILE>q.px+1&&player.x/TILE<q.px+11&&lsInside(q);
    if(!S.act){if(seat){S.sit=(S.sit||0)+dt;if(S.sit>1.2){S.act=1;S.at=0;LSFX.bell();UI.toast('🎭 Представление начинается');}}else{S.sit=0;if(lsInside(q))lsHint(q.px+6,q.py+7,'Сядь в зал');}return;}
    if(!seat){S.pause=1;lsHint(q.px+6,q.py+7,'Представление ждёт зрителя');return;}
    S.pause=0;S.at+=dt;
    if(S.at>7){S.at=0;S.act++;if(S.act<=4)LSFX.bell();
      if(S.act>4){S.done=1;S.act=0;lsSan(-10);UI.toast('🎭 Куклы поклонились… и посмотрели прямо на тебя');LSFX.giggle();saveGame();}}
  },
  roseAltar(q,S,dt){
    for(const [wx,wy] of lsCells(q,'A')){
      if((S.n||0)>=3){continue;}
      if(!lsNear(wx,wy,30)){S.hold=0;if(Math.abs(player.x-wx*TILE)<220&&lsInside(q))lsHint(wx,wy,'Подношение: 30% здоровья');continue;}
      if(player.hp<=player.maxHp*0.36){if(G.time>(S.msgT||0)){S.msgT=G.time+2;floatText(player.x,player.y-70,'Розам нужно больше крови, чем у тебя есть','#ff9ab0');}continue;}
      S.hold=(S.hold||0)+dt;if(S.hold<1)continue;
      S.hold=-2;S.n=(S.n||0)+1;
      player.hp-=player.maxHp*0.3;player.hurtT=0.3;shake(4);vib(50);
      const money=Math.round((300000+wy*1200)*S.n);player.money+=money;
      const rs=[52,53,54].filter(id=>wy>=ORES[id].dmin-40);const o=rs[Math.min(rs.length-1,S.n-1)]||52;addOre(o,1+S.n);addMat('i'+o,S.n);
      if(S.n===3)addMat(LIL_ESS[4][0],2);
      floatText(wx*TILE+16,wy*TILE-30,'Розы приняли дар · +'+fmt(money)+' 💰 · '+(1+S.n)+'× '+ORES[o].name,'#ff9ab0');
      for(let k=0;k<24;k++)spawnPart(player.x+rnd(-10,10),player.y-24,rnd(-80,80),rnd(-120,-20),0.8,k%2?'#c41e3c':'#ff6aa2',2.6,300);
      if(S.n>=3)UI.toast('🌹 Алтарь насытился');
      SFX.chest();saveGame();
    }
  },
  hedgeMaze(q,S,dt){
    /* лабиринт зарастает быстро: прорубленные шипы отрастают через 4 секунды */
    if(!S.cut)S.cut={};
    for(const [wx,wy] of lsCells(q,'x')){const k=wx+','+wy,t=getTile(wx,wy);
      if(t===T_AIR&&!placedLadders.hasXY(wx,wy)){if(!S.cut[k])S.cut[k]=G.time+4;
        else if(G.time>S.cut[k]){const pin=Math.abs(player.x-(wx*TILE+16))<20&&player.y>wy*TILE&&player.y-player.h<(wy+1)*TILE;
          if(!pin){setTile(wx,wy,T_LBRIAR);delete S.cut[k];burst(wx*TILE+16,wy*TILE+16,8,'#3a5a2a',70,2.2);}}}
      else delete S.cut[k];}
  },
  mirrorMaze(q,S,dt){
    const P={'1':'2','2':'1','3':'4','4':'3','5':'1'};
    if(LS_MOVE.mirT>0)LS_MOVE.mirT-=dt;
    for(const ch in P){for(const [wx,wy] of lsCells(q,ch)){
      const fy=(glyphFloorRow(wx,wy)+1)*TILE,on=Math.abs(player.x-(wx*TILE+16))<10&&Math.abs(player.y-fy)<10;
      if(!on){continue;}
      if(LS_MOVE.mirT>0||LS_MOVE.mirOn===wx+','+wy)continue;
      const [tx,ty]=lsCells(q,P[ch])[0];
      const tfy=(glyphFloorRow(tx,ty)+1)*TILE;
      for(let k=0;k<16;k++)spawnPart(player.x+rnd(-10,10),player.y-rnd(0,44),rnd(-40,40),rnd(-40,40),0.5,'#d8f8ff',2.4,0);
      player.x=tx*TILE+16;player.y=tfy-1;player.vx=0;player.vy=0;LS_MOVE.mirT=0.8;LS_MOVE.mirOn=tx+','+ty;
      G.cam.x=player.x;G.lsBlink=0.25;SFX.portal();
      if(ch==='5'){lsSan(-10);floatText(player.x,player.y-70,'Отражение солгало · −10 рассудка','#c8b0ff');LSFX.giggle();}
      else floatText(player.x,player.y-70,'Сквозь зеркало','#d8f8ff');
      return;
    }}
    if(LS_MOVE.mirOn){const [a,b]=LS_MOVE.mirOn.split(',').map(Number);if(Math.abs(player.x-(a*TILE+16))>18)LS_MOVE.mirOn=null;}
  },
  upsideHouse(q,S){
    const ins=lsInside(q,1);
    if(ins&&player.grav!==-1){player.grav=-1;player.gravT=9999;player.onGround=false;player.vy=-60;player.softFall=false;LIV.house=true;SFX.portal();
      floatText(player.x,player.y-70,'Дом перевернул тебя','#c8f0ff');}
    else if(ins)LIV.house=true;
    if(ins)for(const [wx,wy] of lsCells(q,'U')){
      if(S.done)break;
      if(Math.abs(player.x-(wx*TILE+16))<30&&player.y-player.h<(wy+1)*TILE+4){S.done=1;openedChests.add(wx+','+wy);lilOpenChest(wx,wy,true);}
    }
  },
  dreamWell(q,S,dt){
    if(S.done||G.dream)return;
    for(const [wx,wy] of lsCells(q,'O')){
      if(!lsNear(wx,wy,24)){S.hold=0;if(lsInside(q))lsHint(wx,wy,'Загляни в колодец');continue;}
      S.hold=(S.hold||0)+dt;
      if(S.hold>1.2){S.done=1;lilDreamEnter(q,wx,wy);return;}
    }
  },
  nursery(q,S,dt){
    if(S.done){if(S.wake>0)S.wake-=dt;return;}
    if(!lsInside(q))return;
    /* колыбельная клонит в сон */
    S.note=(S.note||0)-dt;if(S.note<=0){S.note=0.42;S.ni=(S.ni||0)+1;LSFX.mbox(S.ni);}
    G.lilSleep=Math.min(1,(G.lilSleep||0)+dt*0.62);
    player.fx.slow=Math.max(player.fx.slow||0,0.3);
    if(G.lilSleep>=1&&!cheats.god){
      G.lilSleep=0.3;lsSan(-20);
      player.x=(q.px+1)*TILE+16;player.y=(q.py+7)*TILE-1;player.vx=0;player.vy=0;G.lsBlink=0.6;
      floatText(player.x,player.y-70,'Ты уснул… и проснулся у входа · −20 рассудка','#c8b0ff');
    }
    for(const [wx,wy] of lsCells(q,'m')){
      if(!lsNear(wx,wy,26)){lsHint(wx,wy,'Останови шкатулку');continue;}
      S.done=1;S.wake=12;lsSan(-30);SFX.whisper(1);shake(8);vib(80);G.lilSleep=0;
      UI.toast('🎵 Шкатулка замолчала. В колыбели кто-то проснулся…');saveGame();
    }
  }
};
function lsDollRoom(q){
  const tx=Math.floor(player.x/TILE)-q.px,ty=Math.floor((player.y-player.h*0.5)/TILE)-q.py;
  if(tx<1||tx>20)return -1;
  const col=Math.floor((tx-1)/7),fl=ty>=4&&ty<=7?0:ty>=9&&ty<=12?1:-1;
  if(fl<0||col>2)return -1;
  return fl*3+col;
}
function lsDollChest(q,room){const col=room%3,fl=Math.floor(room/3);return [q.px+1+col*7+4,q.py+(fl?12:7)];}

/* ---------- Заброшенная карусель: испытание тремя волнами ---------- */
const LCR={hz:[]};
function lsCarouselTick(q,S,dt){
  if(S.done)return;
  const ins=lsInside(q);
  if(!S.run){
    for(const [wx,wy] of lsCells(q,'Y')){
      if(!lsNear(wx,wy,24)){if(ins)lsHint(wx,wy,'Дёрни рычаг');continue;}
      S.run=1;S.wave=0;S.wt=1.5;S.phase='rest';LCR.hz.length=0;LCR.q=q;LSFX.creak();UI.toast('🎠 Карусель ожила! Продержись три мелодии');shake(4);
    }
    return;
  }
  if(!ins&&Math.hypot(player.x/TILE-(q.px+q.tw/2),player.y/TILE-(q.py+q.th/2))>q.tw){S.run=0;LCR.hz.length=0;UI.toast('🎠 Карусель остановилась. Испытание сорвано');return;}
  S.note=(S.note||0)-dt;if(S.note<=0){S.note=0.3-S.wave*0.03;S.ni=(S.ni||0)+1;LSFX.mbox(S.ni+S.wave*3);}
  S.wt-=dt;
  const x0=(q.px+1)*TILE,x1=(q.px+q.tw-1)*TILE,floorY=(q.py+q.th-1)*TILE,ceilY=(q.py+3)*TILE;
  if(S.phase==='rest'&&S.wt<=0){
    if(S.wave>=3){S.done=1;S.run=0;LCR.hz.length=0;SFX.win&&SFX.win();UI.toast('🎠 Мелодия кончилась. Приз твой!');saveGame();return;}
    S.wave++;S.phase='play';S.wt=10;S.sp=0;floatText(player.x,player.y-80,'Мелодия '+S.wave+'/3','#ffb0e0');
    /* когда в Лиловых небесах появятся мобы — к волнам присоединятся они */
    const pool=pickBiomeMobs(q.py+q.th,true);
    for(let i=0;i<S.wave&&pool.length;i++){const d=pool[Math.floor(Math.random()*pool.length)];const m=spawnMobAt(d,rnd(x0+40,x1-40),d.fly?ceilY:floorY);m.noSouls=true;}
  }
  if(S.phase==='play'){
    S.sp-=dt;
    if(S.sp<=0){
      S.sp=Math.max(0.35,1.1-S.wave*0.25);
      /* фарфоровый осколок падает в отмеченное место, чаще — туда, где стоит шахтёр */
      const tx=Math.random()<0.5?player.x+rnd(-40,40):rnd(x0+16,x1-16);
      LCR.hz.push({k:'shard',x:clamp(tx,x0+12,x1-12),y:ceilY,fy:floorY,t:0,warn:0.9});
      if(S.wave>=2&&Math.random()<0.32){const dir=Math.random()<0.5?1:-1;LCR.hz.push({k:'horse',dir,x:dir>0?x0-20:x1+20,y:floorY,t:0,warn:1.1,sp:420+S.wave*60});}
    }
    if(S.wt<=0){S.phase='rest';S.wt=2.2;floatText(player.x,player.y-80,S.wave<3?'Передышка':'Последние ноты…','#ffe6ff');}
  }
  for(let i=LCR.hz.length-1;i>=0;i--){
    const h=LCR.hz[i];h.t+=dt;
    if(h.k==='shard'){
      if(h.t<h.warn)continue;
      h.vy=(h.vy||0)+1400*dt;h.y+=h.vy*dt;
      if(!h.hit&&Math.abs(player.x-h.x)<16&&h.y>player.y-player.h&&h.y-10<player.y){h.hit=1;if(!cheats.god)hurtPlayer(player.maxHp*0.09,'фарфоровый осколок');}
      if(h.y>=h.fy){LSFX.shatter();for(let k=0;k<8;k++)spawnPart(h.x,h.fy-4,rnd(-90,90),rnd(-160,-40),0.6,k%2?'#f4eefa':'#c8a0e0',2.4,900);LCR.hz.splice(i,1);}
    }else{
      if(h.t<h.warn)continue;
      h.x+=h.dir*h.sp*dt;
      if(!h.hit&&Math.abs(player.x-h.x)<26&&player.y>h.y-30){h.hit=1;if(!cheats.god){hurtPlayer(player.maxHp*0.11,'призрачная лошадка');player.vx=h.dir*360;player.vy=-200;}}
      if(h.x<x0-60||h.x>x1+60)LCR.hz.splice(i,1);
    }
  }
}

/* ---------- мимики оранжереи (стражи, как турели в Аду) ---------- */
MOBDEFS.push({id:'lmimic',dim:2,name:'Горшок-мимик',shape:'lmimic',d0:99999,d1:1e9,hp:3600,dmg:190,spd:0,aggro:220,w:28,h:44,fly:false,mech:'lmimic',trap:1,xp:70,souls:6,
  c1:'#e8c8f0',c2:'#3a6a3a',drops:[{ore:42,ch:.5},{ore:43,ch:.22}]});
DEATH_STYLE.lmimic='shatter';
function lilMimicAI(m,dt,dist,dx,dy){
  m.facing=dx>=0?1:-1;
  const near=dist<74&&Math.abs(dy)<60;
  if(m.state==='idle'){m.untargetable=true;m.open=Math.max(0,(m.open||0)-dt*2);
    if(near&&!cheats.god){m.state='warn';m.st=0;m.untargetable=false;LSFX.creak();}}
  else if(m.state==='warn'){m.tele=Math.min(1,m.st/0.7);m.teleUp=true;m.open=m.st/0.7*0.35;
    if(m.st>0.7){m.state='bite';m.st=0;m.tele=0;m.atkT=0.24;
      if(dist<92&&Math.abs(dy)<64&&!cheats.god){mobMelee(m,m.def.dmg*(m.sc||1),{bleed:2},300,-160);shake(4);}
      SFX.hit();}}
  else if(m.state==='bite'){m.open=m.st<0.15?1:Math.max(0.3,1-(m.st-0.15)*1.5);
    if(m.st>1.3){m.state=dist<120?'warn':'awake';m.st=0;}}
  else{m.open=Math.max(0.25,(m.open||0)-dt);
    if(near&&m.st>0.6){m.state='warn';m.st=0;}
    if(dist>220&&m.st>4){m.state='idle';m.st=0;}}
}
function lsMimicTick(){
  if(G.time<(LS_MOVE.mimT||0))return;LS_MOVE.mimT=G.time+0.4;
  const ptx=Math.floor(player.x/TILE),pty=Math.floor(player.y/TILE);
  /* спящий мимик далеко от шахтёра — снова просто горшок (дешевле рисовать) */
  for(let i=mobs.length-1;i>=0;i--){const m=mobs[i];if(m.def.id!=='lmimic'||m.state!=='idle')continue;
    if(Math.abs(m.x/TILE-ptx)>11||Math.abs(m.y/TILE-pty)>7){trapSpawned.delete(m.trapKey);mobs.splice(i,1);}}
  for(const q of structList(ptx-10,ptx+10,pty-6,pty+6)){
    if(q.st.id!=='greenhouse')continue;
    for(const [wx,wy] of lsCells(q,'M')){
      const key=wx+','+wy;
      if(trapSpawned.has(key)||(G.wf.trd&&G.wf.trd.indexOf(key)>=0))continue;
      if(Math.abs(wx-ptx)>7||Math.abs(wy-pty)>4||getTile(wx,wy)!==T_AIR)continue;
      const fr=glyphFloorRow(wx,wy);if(fr<0)continue;
      const def=MOBDEFS.find(d=>d.id==='lmimic');
      const m=spawnMobAt(def,wx*TILE+16,(fr+1)*TILE);m.trapKey=key;m.facing=1;m.state='idle';m.untargetable=true;m.age=5;
      const sc=1+Math.max(0,wy-250)/600;m.sc=sc;m.hp=m.maxHp=Math.round(def.hp*sc);
      trapSpawned.add(key);
    }
  }
}

/* ---------- главный такт построек ---------- */
function lilStructTick(dt){
  LS_HINTS.length=0;
  if(G.lsBlink>0)G.lsBlink-=dt;
  if(G.dim!==2||G.scene!=='mine'){G.dream=null;LSW.t=0;LSW.bees.length=0;LCR.hz.length=0;LIV.house=false;return;}
  lilDreamTick(dt);
  if(!G.wf)G.wf={};
  const wasHouse=LIV.house;LIV.house=false;
  const ptx=Math.floor(player.x/TILE),pty=Math.floor(player.y/TILE);
  for(const q of structList(ptx-30,ptx+30,pty-20,pty+20)){
    const fn=LSH[q.st.id];if(!fn)continue;
    fn(q,lsState(q),dt);
  }
  /* вышел из перевёрнутого дома — мир встаёт на место */
  if(wasHouse&&!LIV.house&&player.grav===-1){player.grav=1;player.gravT=0;player.vy=40;player.onGround=false;player.peakY=player.y;player.softFall=true;SFX.portal();}
  if(!G.dream)lsMimicTick();
  lsSwarmTick(dt);
  /* не дать сломать запертое испытание карусели, если шахтёр погиб */
  if(player.hp<=0){for(const k in (G.wf.ls||{})){const s=G.wf.ls[k];if(s.run)s.run=0;}LCR.hz.length=0;LSW.t=0;}
}
