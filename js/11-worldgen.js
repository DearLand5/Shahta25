'use strict';
/* ============================================================
   НОВОЕ: эффективный порог появления руды с учётом настройки
   Чем БОЛЬШЕ oreDensity, тем НИЖЕ порог → больше руды.
   При oreDensity=1 порог совпадает с базовым vein.
   ============================================================ */
function getOreThreshold(or){
  const d=settings.oreDensity||1;
  const shift=(1-d)*0.15;
  return clamp(or.vein+shift, 0.35, 0.99);
}

/* ------------ Тематические структуры биомов ------------ */
/* естественный воздух (без структур) — для проверки соседей */
function isNaturalAir(wx,wy){
  if(wx<0||wx>=MW)return false;
  if(wy<0)return true;
  const sz=getSafeZoneTile(wx,wy);
  if(sz!==-1)return sz===T_AIR;
  const s=G.seed,d=wy;
  if(wy<4)return false;
  if(G.dim===1)return hellAir(wx,wy);
  if(G.dim===2)return lilacAir(wx,wy);
  let air=(vnoise(wx/13,wy/13,s+11)>0.612)||(vnoise(wx/6.2,wy/6.2,s+23)>0.742);
  if(d>=7&&d<190&&Math.abs(vnoise(wx/11,wy/11,s+301)-0.5)<0.012)air=true;
  if(d>=1000&&Math.abs(vnoise((wx+wy*0.6)/12,(wy-wx*0.4)/12,s+606)-0.5)<0.017)air=true;
  return air;
}
/* Кристальные гроты: геоды — полые шары с оболочкой из самоцветов */
function geodeAt(wx,wy){
  if(wy<215||wy>480)return 0;
  const CS=38,cx=Math.floor(wx/CS),cy=Math.floor(wy/CS);
  const h=hash2(cx,cy,G.seed+9001);
  if((h%100)>=46)return 0;
  const gx=cx*CS+8+((h>>>8)%(CS-16)), gy=cy*CS+8+((h>>>16)%(CS-16));
  const r=4+((h>>>24)%3);
  const dx=wx-gx,dy=(wy-gy)*1.15,dd=Math.sqrt(dx*dx+dy*dy);
  if(dd<r-1.6)return 1;
  if(dd<r)return 2;
  return 0;
}
function geodeOre(wx,wy,d){
  const cand=[6,8,9,10,11].filter(id=>d>=ORES[id].dmin&&d<=ORES[id].dmax);
  if(!cand.length||rnd2(wx,wy,G.seed+9100)>0.38)return 0;
  return cand[Math.floor(rnd2(wx,wy,G.seed+9101)*cand.length)];
}
/* Каменный пояс: заброшенные штольни с крепью, рельсами и рудным тупиком */
function corrBand(wy){
  if(wy<55||wy>199)return null;
  const BH=30,by=Math.floor(wy/BH);
  const h=hash2(by,7,G.seed+7001);
  if((h%100)>=55)return null;
  const c={row:by*BH+6+((h>>>8)%(BH-14)),x0:2+((h>>>16)%30),len:22+((h>>>24)%34)};
  if(c.row<59||c.row+3>197)return null;          /* штольня целиком (с каркасом) в каменном поясе */
  return c;
}
function corridorInfo(wx,wy){
  const c=corrBand(wy);
  if(!c||wy<c.row||wy>c.row+2||wx<c.x0||wx>c.x0+c.len)return null;
  return c;
}
function pocketOre(wx,wy,d){
  const c=corrBand(wy);
  if(!c||wy<c.row-1||wy>c.row+3||wx<c.x0+c.len+1||wx>c.x0+c.len+5)return 0;
  if(rnd2(wx,wy,G.seed+7200)>0.62)return 0;
  const r=rnd2(wx,wy,G.seed+7201);
  if(d>=140&&r>0.8)return 7;
  if(d>=60&&r>0.45)return 5;
  return 4;
}
/* Бездна: монолиты — зал с обсидиановой колонной и рунами */
function monolithAt(wx,wy){
  if(wy<1030)return 0;
  const CS=44,cx=Math.floor(wx/CS),cy=Math.floor(wy/CS);
  const h=hash2(cx,cy,G.seed+9301);
  if((h%100)>=34)return 0;
  const px=cx*CS+10+((h>>>8)%(CS-20)),py=cy*CS+6+((h>>>16)%(CS-22));
  const dx=wx-px,dy=wy-py;
  if(Math.abs(dx)>6||dy<-3||dy>10)return 0;
  if(dy===10||dy===-3||Math.abs(dx)===6)return 4;    /* каркас зала: пол, свод и стены */
  if(Math.abs(dx)<=1&&dy>=0&&dy<=9){
    if(Math.abs(dx)===1&&dy===3)return 3;
    return 2;
  }
  return 1;
}
/* ------------ Структуры: шаблоны из символов ------------
   . воздух   # порода биома   w доски   b кирпич   o обсидиан   l лава
   i руда (по глубине)   g самоцвет/редкая руда   остальное — воздух с декором:
   L фонарь  C сундук  A наковальня  F горн  T стол  S саркофаг
   P кристальная колонна  c кристаллы  m/M грибы  V портал                   */
const STRUCT_TPL={"ashOutpost": ["bbbbbbbbbbbbbbbbbbbbbbb", "b..!.....I.......!....b", "b.....................b", "b.1..d...a..5..d...C.1b", "bbbbbbbbbbbbbbbbbbbbbbb"], "bloodShrine": ["xxxxxxxxxxxxxxxxxxxxxxx", "x.j...!....0....!...j.x", "x.....................x", "x.....................x", "x.r..7...8.C.8...7..r.x", "xxx~~xxxxxxxxxxxxx~~xxx", "xxxxxxxxxxxxxxxxxxxxxxx"], "sulfurWorks": ["bbbbbbbbbbbbbbbbbbbbbbbbb", "b.4...!.....4.....!...4.b", "b.4.........4.........4.b", "b.4.3..3..U.4.3..C..3.4.b", "bbbbbbbbbbbbbbbbbbbbbbbbb"], "ossuary": ["xxxxxxxxxxxxxxxxxxxxx", "x.I...0.......0...I.x", "x...................x", "x.S.7..r..C..r..7.S.x", "xxxxxxxxx.xxxxxxxxxxx", "xE.................Ex", "x..Y..7....G...C..7.x", "xxxxxxxxxxxxxxxxxxxxx"], "fireTemple": ["ooooooooooooooooooooooooo", "o.Q...I.....0.....I...Q.o", "o.......................o", "o.......................o", "o.D...O..r..u..r..O...D.o", "ooolllooooooooooooolllooo", "ooooooooooooooooooooooooo"], "dugout": ["wwwwwwwwwwwwwwwww", "w.|..!..H..!..|.w", "w.|...........|.w", "w.|N.T.B.5.U.C|.w", "wwwwwwwwwwwwwwwww"], "warren": ["#################", "#Z..#....Z..#...#", "#...#.##....#.i.#", "#.#...#..##...#.#", "#.#.###..#..###.#", "#...#Y...#.C..i.#", "#################"], "mushgrove": ["###################", "#.Z.....L.....Z...#", "#.................#", "#..M....m.M..mC.M.#", "#####~~~###########", "###################"], "forgeRuin": ["bbbbbb###bbbbbbbbbb", "b.W..L.......L..W.b", "b.................b", "b.F.A..6.K.5..N.C.b", "bbbbbbbbbbbbbbbbbbb"], "shaft": ["#########", "#.H...L.#", "#.......#", "#.B.K..E#", "#wwwww..#", "#.......#", "#E......#", "#.X.Y...#", "#wwwwww.#", "#.......#", "#......E#", "#..wwwww#", "#.......#", "#E.R.C.R#", "#########"], "crypt": ["bbbbbbbbbbbbbbbbbbb", "b.W..0...H...0..W.b", "b.................b", "b.S.Y.7G...G7.Y.S.b", "bbbbbbbbb.bbbbbbbbb", "bL...............Lb", "b..U..7.C.7..N....b", "bbbbbbbbbbbbbbbbbbb"], "temple": ["bbbbbbbbbbbbbbbbbbbbb", "b.Q.....0...0.....Q.b", "b...%...........%...b", "b...................b", "b.P..O...bgb...O..P.b", "bbbbbb...bbbbbbbbbbbb", "bE.................Eb", "b.c..C.u...U..c..C..b", "bbbbbbbbbbbbbbbbbbbbb"], "garden": ["###################", "#..J...J.....J..J.#", "#.................#", "#.c.P..m.cCm..P.c.#", "#####~~#####~~#####", "###################"], "dwarfForge": ["ooooooooooooooooooooo", "o.H...0.....0...H...o", "o..%.............%..o", "o.F.A..9.6...U..N.C.o", "oooooooooollloooooooo", "ooooooooooooooooooooo"], "bridge": ["#############################", "#...L.......H.....H.......L.#", "#...........................#", "#..C....Y..........B....C...#", "#ooooooooooooooooooooooooooo#", "#lllllollllllllllllllollllll#", "#lllllollllllllllllllollllll#", "#############################"], "ribs": ["###################", "#.....xxxxxxx.....#", "#...xx.......xx...#", "#..x...........x..#", "#.x.............x.#", "#.x.............x.#", "#.x.c.7..C..Y.c.x.#", "###################"], "voidAltar": ["###############", "#.Q....H....Q.#", "#.............#", "#......V......#", "#.............#", "#..O..ogo..O..#", "#.ooooooooooo.#", "#E.C.......C.E#", "###############"], "minerCamp": ["#######################", "#..!.....!.......!....#", "#.....................#", "#.....................#", "#.d...a..5n..d...C..6.#", "#######################"], "library": ["bbbbbbbbbbbbbbbbbbbbb", "b..0.....0.....0....b", "b...................b", "b.e.e.P.e.C.e.P.e.e.b", "bbbbbbbbb.bbbbbbbbbbb", "b0.................0b", "b.....=......=......b", "b..e..c..u..c..5..e.b", "bbbbbbbbbbbbbbbbbbbbb"], "spiderNest": ["###################", "#v.......v.......v#", "#.................#", "#.2..C...2..Y..2..#", "###################"], "observatory": ["ooooooooooooooooooooo", "o..0.....=.=.....0..o", "o..%.............%..o", "o...................o", "o.O..t....5....t..C.o", "ooooooooooooooooooooo"], "gnomeHall": ["ooooooooooooooooooooooo", "o.0.......0........0..o", "o..%......%.......%...o", "o.....................o", "o.F..9..6..C..6..9..F.o", "ooooooooooooooooooooooo"], "ashTemple": ["bbbbbbbbbbbbbbbbbbbbbbbbb", "b..!.......0.0.......!..b", "b...|..%.........%..|...b", "b...|...............|...b", "b...|...............|...b", "b.D.|.....D.u.D.....|.D.b", "bbbbbbbbbbbbbbbbbbbbbbbbb"], "cursedMine": ["wwwwwwwwwwwwwwwwwwwww", "w.j....!....j....!..w", "w...................w", "w.n..R.R.R.R..n..C..w", "wwwwwwwwwwwwwwwwwwwww"], "meatworks": ["xxxxxxxxxxxxxxxxxxxxxxx", "x.j..j..j...j..j..j...x", "x.....................x", "x.....................x", "x.3..5..5....3..C..5..x", "xxxxxxxxxxxxxxxxxxxxxxx"], "scorpNest": ["#####################", "#v......v.......v...#", "#...................#", "#.2.2..7..2.2..Y..C.#", "#####################"], "kingsCrypt": ["xxxxxxxxxxxxxxxxxxxxxxxxx", "x..0.......!.!.......0..x", "x..%...%.........%...%..x", "x.......................x", "x.O..7..C...y...C..7..O.x", "xxxxxxxxxxxxxxxxxxxxxxxxx"], "demonForge": ["bbbbbbbbbbbbbbbbbbbbbbbbb", "b..!.....0.....0.....!..b", "b..%...........%.....%..b", "b.......................b", "b.F..9..6..C..6..9..F...b", "bbbbbbllbbbbbbbbbbbbbbbbb", "bbbbbbbbbbbbbbbbbbbbbbbbb"], "turretKeep": ["bbbbbbbbbbbbbbbbbbbbbbb", "bq.........0.........qb", "b.....................b", "bq...................qb", "b.....................b", "b..7.....5.k.5.....7..b", "bbbbbbbbbbbbbbbbbbbbbbb"], "bloodHive": ["xxxxxxxxxxxxxxxxxxxxx", "x..j.....j.....j....x", "x...................x", "x...................x", "x.h....h..k..h....h.x", "xxxx~~xxxxxxxxx~~xxxx", "xxxxxxxxxxxxxxxxxxxxx"], "summonPit": ["ooooooooooooooooooooooo", "o..!.......!.......!..o", "o.....................o", "o.....................o", "o.....................o", "o.D.7...k..s..k...7.D.o", "ooooooooooooooooooooooo"], "flameHall": ["bbbbbbbbbbbbbbbbbbbbbbbbbbb", "b....!.....!.....!.....!..b", "b.........................b", "b..f..f..f..f..f..f..f..C.b", "bbbbbbbbbbbbbbbbbbbbbbbbbbb"], "crusherHall": ["xxxxxxxxxxxxxxxxxxxxxxxxxxx", "x..p...p...p...p...p...p..x", "x.........................x", "x.7......................Cx", "xxxxxxxxxxxxxxxxxxxxxxxxxxx"], "riftShrine": ["ooooooooooooooooooooo", "o.0.......0.......0.o", "o...................o", "o.........z.........o", "o...................o", "o.r.7....k.k....7.r.o", "ooooooooooooooooooooo"]};
/* wall — задняя стена внутри структуры */
const STRUCTS=[
  {id:'dugout',    wall:'plank', cw:32,ch:16,prob:40,d0:8,  d1:46},
  {id:'warren',    wall:'dirt',  cw:44,ch:18,prob:30,d0:10, d1:48},
  {id:'mushgrove', wall:'moss',  cw:44,ch:18,prob:28,d0:8,  d1:48},
  {id:'minerCamp', wall:'none',  cw:46,ch:16,prob:22,d0:14, d1:190},
  {id:'forgeRuin', wall:'brick', cw:44,ch:20,prob:28,d0:58, d1:195},
  {id:'shaft',     wall:'plank', cw:36,ch:26,prob:26,d0:60, d1:195},
  {id:'crypt',     wall:'brick', cw:48,ch:20,prob:24,d0:70, d1:195},
  {id:'temple',    wall:'brickc',cw:46,ch:22,prob:26,d0:210,d1:490},
  {id:'garden',    wall:'none',  cw:44,ch:18,prob:26,d0:210,d1:490},
  {id:'library',   wall:'brickc',cw:44,ch:24,prob:20,d0:215,d1:490},
  {id:'spiderNest',wall:'none',  cw:44,ch:18,prob:22,d0:215,d1:490},
  {id:'dwarfForge',wall:'obs',   cw:46,ch:20,prob:28,d0:510,d1:990},
  {id:'bridge',    wall:'none',  cw:60,ch:22,prob:20,d0:520,d1:990},
  {id:'gnomeHall', wall:'obs',   cw:46,ch:20,prob:20,d0:520,d1:990},
  {id:'ribs',      wall:'none',  cw:46,ch:24,prob:28,d0:1010,d1:1490},
  {id:'voidAltar', wall:'obs',   cw:44,ch:24,prob:24,d0:1010,d1:1490},
  {id:'observatory',wall:'obs',  cw:44,ch:22,prob:20,d0:1030,d1:1480},
  /* ---- Ад ---- */
  {id:'turretKeep', dim:1,wall:'basalt',   cw:44,ch:22,prob:14,d0:30, d1:240,danger:1},
  {id:'flameHall',  dim:1,wall:'hellbrick',cw:48,ch:18,prob:14,d0:40, d1:240,danger:1},
  {id:'ashOutpost', dim:1,wall:'hellbrick',cw:40,ch:20,prob:24,d0:14, d1:240},
  {id:'ashTemple',  dim:1,wall:'basalt',   cw:46,ch:22,prob:18,d0:20, d1:240},
  {id:'cursedMine', dim:1,wall:'char',     cw:42,ch:18,prob:20,d0:14, d1:240},
  {id:'bloodHive',  dim:1,wall:'flesh',    cw:42,ch:22,prob:16,d0:270,d1:540,danger:1},
  {id:'crusherHall',dim:1,wall:'flesh',    cw:48,ch:18,prob:12,d0:270,d1:540,danger:1},
  {id:'bloodShrine',dim:1,wall:'flesh',    cw:42,ch:22,prob:22,d0:262,d1:540},
  {id:'meatworks',  dim:1,wall:'flesh',    cw:42,ch:20,prob:20,d0:262,d1:540},
  {id:'summonPit',  dim:1,wall:'obs',      cw:44,ch:22,prob:14,d0:570,d1:840,danger:1},
  {id:'riftShrine', dim:1,wall:'obs',      cw:44,ch:22,prob:12,d0:620,d1:99999,danger:1},
  {id:'sulfurWorks',dim:1,wall:'metal',    cw:44,ch:22,prob:22,d0:562,d1:840},
  {id:'scorpNest',  dim:1,wall:'none',     cw:42,ch:18,prob:20,d0:562,d1:840},
  {id:'turretKeepB',tpl:'turretKeep',dim:1,wall:'bone',cw:44,ch:22,prob:14,d0:870,d1:1188,danger:1},
  {id:'crusherHallB',tpl:'crusherHall',dim:1,wall:'bone',cw:48,ch:18,prob:12,d0:870,d1:1188,danger:1},
  {id:'ossuary',    dim:1,wall:'bone',     cw:44,ch:24,prob:22,d0:862,d1:1188},
  {id:'kingsCrypt', dim:1,wall:'bone',     cw:46,ch:22,prob:16,d0:862,d1:1188},
  {id:'flameHallC', tpl:'flameHall',dim:1,wall:'hellbrick',cw:48,ch:18,prob:14,d0:1212,d1:99999,danger:1},
  {id:'summonPitC', tpl:'summonPit',dim:1,wall:'obs',cw:44,ch:22,prob:12,d0:1220,d1:99999,danger:1},
  {id:'fireTemple', dim:1,wall:'obs',      cw:46,ch:24,prob:20,d0:1212,d1:99999},
  {id:'demonForge', dim:1,wall:'hellbrick',cw:46,ch:22,prob:20,d0:1212,d1:99999}
];
STRUCTS.forEach((st,i)=>{st.idx=i;st.tpl=STRUCT_TPL[st.tpl||st.id];});
const STRUCT_SOLID='#wbogix';
const _spCache=new Map();let _spSeed=null;
function structPlaceRaw(st,cx,cy){
  const h=hash2(cx,cy,G.seed+st.id.length*131+st.cw*7+11);
  if((h%100)>=st.prob)return null;
  const th=st.tpl.length,tw=st.tpl[0].length;
  const px=cx*st.cw+((h>>>8)%Math.max(1,st.cw-tw));
  const py=cy*st.ch+((h>>>16)%Math.max(1,st.ch-th));
  if(py<st.d0||py+th>st.d1||px<1||px+tw>=MW-1)return null;
  if(st.dim===1&&hbRectHit(px,py,px+tw,py+th))return null;   /* святилища Владык свободны от структур */
  return {px,py,tw,th};
}
/* место структуры; если она задевает другую (с меньшим номером) — её нет */
function structPlace(st,cx,cy){
  if(_spSeed!==G.seed+'|'+G.dim){_spCache.clear();_spSeed=G.seed+'|'+G.dim;}
  const key=st.idx*1000003+cx*7919+cy;
  let v=_spCache.get(key);
  if(v!==undefined)return v;
  v=structPlaceRaw(st,cx,cy);
  if(v){
    outer:
    for(let j=0;j<st.idx;j++){
      const o=STRUCTS[j];
      if((o.dim||0)!==(st.dim||0)||o.d1<v.py-2||o.d0>v.py+v.th+2)continue;
      for(let ocy=Math.floor((v.py-2)/o.ch)-1;ocy<=Math.floor((v.py+v.th+2)/o.ch);ocy++){
        for(let ocx=Math.floor((v.px-2)/o.cw)-1;ocx<=Math.floor((v.px+v.tw+2)/o.cw);ocx++){
          const q=structPlace(o,ocx,ocy);
          if(q&&q.px<v.px+v.tw+2&&q.px+q.tw+2>v.px&&q.py<v.py+v.th+2&&q.py+q.th+2>v.py){v=null;break outer;}
        }
      }
    }
  }
  _spCache.set(key,v);
  return v;
}
function structAt(wx,wy){
  for(const st of STRUCTS){
    if((st.dim||0)!==G.dim||wy<st.d0||wy>st.d1)continue;
    const pl=structPlace(st,Math.floor(wx/st.cw),Math.floor(wy/st.ch));
    if(!pl)continue;
    if(wx<pl.px||wx>=pl.px+pl.tw||wy<pl.py||wy>=pl.py+pl.th)continue;
    return {st,pl,ch:st.tpl[wy-pl.py][wx-pl.px]};
  }
  return null;
}
function structCharAt(wx,wy){const r=structAt(wx,wy);return r?r.ch:null;}
/* все структуры, пересекающие окно (для отрисовки, света и сундуков) */
function structList(tx0,tx1,ty0,ty1){
  const out=[];
  for(const st of STRUCTS){
    if((st.dim||0)!==G.dim||ty1<st.d0||ty0>st.d1)continue;
    for(let cy=Math.floor(ty0/st.ch)-1;cy<=Math.floor(ty1/st.ch);cy++){
      for(let cx=Math.floor(tx0/st.cw)-1;cx<=Math.floor(tx1/st.cw);cx++){
        const pl=structPlace(st,cx,cy);
        if(!pl)continue;
        if(pl.px>tx1||pl.px+pl.tw<tx0||pl.py>ty1||pl.py+pl.th<ty0)continue;
        out.push({st,px:pl.px,py:pl.py,tw:pl.tw,th:pl.th});
      }
    }
  }
  return out;
}
/* клетки «внутри» структур в окне — там не рисуем природный декор */
let _intKey='',_intSet=new Set();
function structInterior(tx0,tx1,ty0,ty1){
  const key=tx0+','+tx1+','+ty0+','+ty1+','+G.seed;
  if(key===_intKey)return _intSet;
  _intKey=key;_intSet=new Set();
  for(const q of structList(tx0,tx1,ty0,ty1)){
    for(let r=0;r<q.th;r++)for(let c=0;c<q.tw;c++){
      if(STRUCT_SOLID.indexOf(q.st.tpl[r][c])<0)_intSet.add((q.px+c)+','+(q.py+r));
    }
  }
  return _intSet;
}
function structOre(wx,wy,d,kind){
  let cand;
  if(G.dim>=1){
    cand=ORES.filter(o=>o&&o.dim===G.dim&&d>=o.dmin-(kind==='g'?90:0)&&d<=o.dmax).map(o=>o.id);
    if(kind==='i')cand=cand.slice(0,Math.max(1,Math.ceil(cand.length/2)));else cand=cand.slice(-2);
    if(!cand.length){if(G.dim!==1)return 0;cand=[18];}
    return cand[Math.floor(rnd2(wx,wy,G.seed+9777)*cand.length)];
  }
  if(kind==='g'){
    cand=[8,9,10,11,12,13,14,15,16,17].filter(id=>ORES[id]&&d>=ORES[id].dmin-60&&d<=ORES[id].dmax);
  }else{
    cand=[1,2,3,4,5,6,7].filter(id=>d>=ORES[id].dmin&&d<=ORES[id].dmax);
  }
  if(!cand.length)cand=[1];
  return cand[Math.floor(rnd2(wx,wy,G.seed+9777)*cand.length)];
}
const openedChests=new Set();

/* Озёра, лужи и лавовые озёра: уровень воды задаётся областью, вода есть только там,
   где под ней есть опора (иначе бы она сразу вытекла) */
function liqRegion(wx,wy,cw,ch,salt,prob,dmin,dmax){
  const cx=Math.floor(wx/cw),cy=Math.floor(wy/ch);
  const h=hash2(cx,cy,G.seed+salt);
  if((h%100)>=prob)return null;
  const top=cy*ch;
  if(top+ch<dmin||top>dmax)return null;
  const w=10+((h>>>16)%Math.max(1,cw-12));
  return {L:top+4+((h>>>8)%Math.max(1,ch-12)),x0:cx*cw+((h>>>24)%Math.max(1,cw-w)),w:w,end:top+ch};
}
function liqSupported(wx,wy,end){
  for(let k=1;k<=end-wy;k++){if(!isNaturalAir(wx,wy+k))return true;}
  return false;
}
function waterAmt(){const v=settings.waterAmount;return (typeof v==='number'&&v>=0)?v:1;}
function lavaAmt(){const v=settings.lavaAmount;return (typeof v==='number'&&v>=0)?v:1;}
function liquidAt(wx,wy,d){
  let r;
  const wa=waterAmt(),la=lavaAmt();
  if(wa>0&&d>=14&&d<480){
    r=liqRegion(wx,wy,44,26,5001,Math.min(100,Math.round(30*wa)),14,480);
    if(r&&wx>=r.x0&&wx<=r.x0+r.w&&wy>=r.L&&liqSupported(wx,wy,r.end))return T_WATER;
    r=liqRegion(wx,wy,22,14,5002,Math.min(100,Math.round(52*wa)),6,420);
    if(r&&wx>=r.x0&&wx<=r.x0+r.w&&wy>=r.L&&wy<=r.L+1&&liqSupported(wx,wy,r.end))return T_WATER;
  }
  if(la>0&&d>=530&&d<990){
    r=liqRegion(wx,wy,40,24,5003,Math.min(100,Math.round(45*la)),530,990);
    if(r&&wx>=r.x0&&wx<=r.x0+r.w&&wy>=r.L&&wy<=r.L+10&&liqSupported(wx,wy,r.end))return T_LAVA;
  }
  return 0;
}
