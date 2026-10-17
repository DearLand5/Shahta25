'use strict';
/* ============================================================
   ЛИЛОВЫЕ НЕБЕСА — третье измерение (G.dim===2)
   Генератор мира. Семь биомов (BIOMES 10–16), у каждого своя форма пещер:
   Цветущие луга    0–250  — широкие светлые поляны, корни, пруды;
   Хрустальный сад  250–550 — рощи стеклянных колонн;
   Медовые соты     550–850 — шестигранные соты: пустые, восковые и с мёдом;
   Кукольный городок 850–1150 — улицы-ярусы и домики с дверями;
   Розарий          1150–1450 — извилистые лозовые ходы в шипах, беседки;
   Зеркальные топи  1450–1750 — длинные плоские пещеры с озёрами, серебряные пласты;
   Колыбель         1750+    — круглые «живые» камеры, трубы-ходы, пух; дно мира на 2200 м.
   Меняешь генератор так, что старые раскопки станут бессмыслицей, —
   увеличь LILAC_GV (02-cheats-save): мир Лиловых небес создастся заново.
   ============================================================ */
const LIL_FLOOR=2200;                     /* дно мира */
const LIL_ROCK=[T_LSOD,T_LGLASS,T_LWAX,T_LPORC,T_LTHORN,T_LMIRROR,T_LCRADLE];
/* биом для генерации: границы чуть «плавают», чтобы стык не был ровной линией */
function lilBand(wx,wy){
  const j=(vnoise(wx/18,wy/40,G.seed+90007)-0.5)*14;
  const d=wy+j;
  return d<250?0:d<550?1:d<850?2:d<1150?3:d<1450?4:d<1750?5:6;
}
function lilacRockAt(d){return LIL_ROCK[d<250?0:d<550?1:d<850?2:d<1150?3:d<1450?4:d<1750?5:6];}

/* ---------- Медовые соты: шестигранная решётка ---------- */
const LH_RI=4.6,LH_RC=LH_RI*2/Math.sqrt(3);          /* вписанный и описанный радиусы ячейки, в клетках */
const LH_N=[[1,0],[0.5,Math.sqrt(3)/2],[-0.5,Math.sqrt(3)/2]];   /* нормали к граням */
function lilHex(wx,wy){
  const px=wx+0.5,py=wy+0.5;
  const sy=1.5*LH_RC,sx=2*LH_RI;
  const j0=Math.floor(py/sy);
  let best=null,bd=1e9,sec=null,sd=1e9;
  for(let j=j0-1;j<=j0+1;j++){
    const off=(j&1)?LH_RI:0,i0=Math.floor((px-off)/sx);
    for(let i=i0-1;i<=i0+1;i++){
      const cx=i*sx+off,cy=j*sy,d=(px-cx)*(px-cx)+(py-cy)*(py-cy);
      if(d<bd){sec=best;sd=bd;best={i,j,cx,cy};bd=d;}
      else if(d<sd){sec={i,j,cx,cy};sd=d;}
    }
  }
  const dx=px-best.cx,dy=py-best.cy;
  let hd=0,k=0;
  for(let q=0;q<3;q++){const v=Math.abs(dx*LH_N[q][0]+dy*LH_N[q][1]);if(v>hd){hd=v;k=q;}}
  const perp=Math.abs(-dx*LH_N[k][1]+dy*LH_N[k][0]);
  return {c:best,n:sec,hd,perp};
}
/* вид ячейки: 0 — пустая, 1 — восковая (сплошная), 2 — запечатанный мёд */
function lilHexKind(c){
  const h=hash2(c.i,c.j,G.seed+90031)%100;
  return h<58?0:h<82?1:2;
}

/* ---------- Кукольный городок: кварталы-ярусы с домиками ----------
   Ярус — 20 рядов: 0–5 порода, 6–16 открытая улица с домиками, 17 мостовая,
   18–19 порода. Ярусы связаны колодцами шириной 2 клетки. */
const LT_BAND=20;
function lilTownB(b){
  const h=hash2(b,7,G.seed+90041);
  const x0=2+(h%20),x1=Math.min(MW-3,x0+46+((h>>>8)%40));
  const sh=hash2(b,3,G.seed+90047),well=x0+4+(sh%Math.max(1,x1-x0-9));
  return {b,x0,x1,well};
}
function lilTownTile(wx,wy){
  if(wy<850||wy>=1150)return -1;
  const b=Math.floor((wy-850)/LT_BAND),r=wy-850-b*LT_BAND,T=lilTownB(b);
  if(r>=17){
    const inWell=wx>=T.well&&wx<=T.well+1&&wy<1146;
    if(inWell)return T_AIR;
    return r===17&&wx>=T.x0-1&&wx<=T.x1+1?T_LTOY:-1;
  }
  if(r<=5){
    if(b>0){const P=lilTownB(b-1);if(wx>=P.well&&wx<=P.well+1)return T_AIR;}
    return -1;
  }
  if(wx<T.x0||wx>T.x1)return -1;
  const seg=Math.floor((wx-T.x0)/12),lx=wx-T.x0-seg*12;
  const hh=hash2(seg,b,G.seed+90043);
  if(hh%4!==0&&lx>=1&&lx<=10&&wx+(11-lx)<=T.x1){
    const top=7+(hh>>>4)%3;                       /* конёк крыши */
    if(r<top)return T_AIR;
    if(r<=top+3)return Math.abs(lx-5.5)<=1.5+(r-top)*1.35?T_WOOD:T_AIR;   /* двускатная крыша из досок */
    if(lx===1||lx===10){                          /* стены; дверь — с одной стороны */
      const door=((hh>>>8)&1)?1:10;
      return lx===door&&r>=14?T_AIR:T_LTOY;
    }
    return T_AIR;
  }
  return T_AIR;
}

/* ---------- форма пещер ---------- */
function lilacAir(wx,wy){
  if(wy>=LIL_FLOOR)return false;
  const s=G.seed+90000;
  switch(lilBand(wx,wy)){
    case 0:return vnoise(wx/22,wy/8.5,s+11)>0.585||vnoise(wx/7,wy/7,s+13)>0.79;
    case 1:return vnoise(wx/14,wy/11,s+21)>0.6||vnoise(wx/6,wy/6,s+23)>0.785;
    case 2:{const H=lilHex(wx,wy);if(lilHexKind(H.c)!==0)return false;
      if(H.hd<LH_RI-1.15)return true;
      return !!(H.n&&lilHexKind(H.n)===0&&H.perp<1.25&&H.hd>LH_RI-1.3);}
    case 3:{const tt=lilTownTile(wx,wy);if(tt!==-1)return tt===T_AIR;
      return vnoise(wx/12,wy/9,s+31)>0.68;}
    case 4:return Math.abs(vnoise(wx/16,wy/16,s+41)-0.5)<0.034||Math.abs(vnoise(wx/11,wy/21,s+43)-0.5)<0.026||vnoise(wx/9,wy/9,s+45)>0.76;
    case 5:return vnoise(wx/26,wy/6,s+51)>0.585||vnoise(wx/7,wy/7,s+53)>0.8;
    default:return vnoise(wx/10,wy/10,s+61)>0.62||Math.abs(vnoise(wx/18,wy/18,s+63)-0.5)<0.022;
  }
}
/* Озёра: вода только в замкнутых чашах — каждый ряд воды упирается в породу с обеих
   сторон и лежит на породе или на воде ниже, не глубже maxD рядов. Такая вода не
   растекается и не грузит симуляцию жидкостей. Мир режется на полосы по 16 рядов,
   каждая полоса считается один раз и запоминается. */
const _lkMemo=new Map();let _lkSeed=null;
function lilLakeSlab(y0,salt,prob,maxD){
  if(_lkSeed!==G.seed){_lkMemo.clear();_lkSeed=G.seed;}
  const key=salt+':'+y0;let set=_lkMemo.get(key);if(set)return set;
  set=new Set();
  if(hash2(y0,salt,G.seed+90061)%100<prob){
    let below=null;
    for(let y=y0+15;y>=y0;y--){
      const row=new Map();let x=0;
      while(x<MW){
        if(!isNaturalAir(x,y)){x++;continue;}
        let x2=x;while(x2+1<MW&&isNaturalAir(x2+1,y))x2++;
        let ok=true,dmax=0;
        for(let q=x;q<=x2;q++){
          if(isNaturalAir(q,y+1)){const bd=below&&below.get(q);if(!bd||bd>=maxD){ok=false;break;}dmax=Math.max(dmax,bd);}
        }
        if(ok)for(let q=x;q<=x2;q++){const bd=below&&below.get(q);row.set(q,bd?bd+1:1);set.add(q+','+y);}
        x=x2+1;
      }
      below=row;
    }
  }
  if(_lkMemo.size>300)_lkMemo.clear();
  _lkMemo.set(key,set);
  return set;
}
function lilacLiquidAt(wx,wy,band){
  const wa=waterAmt();if(wa<=0)return 0;
  const y0=Math.floor(wy/16)*16;
  if(band===0&&wy>=14&&lilLakeSlab(y0,7011,Math.round(55*wa),3).has(wx+','+wy))return T_WATER;
  if(band===5&&lilLakeSlab(y0,7013,Math.round(92*wa),5).has(wx+','+wy))return T_WATER;
  return 0;
}
function genLilacTileAt(wx,wy){
  const s=G.seed+90000,d=wy;
  if(d>=LIL_FLOOR)return {t:T_BEDROCK,o:0};
  const band=lilBand(wx,wy);
  let rock=LIL_ROCK[band];
  {
    const sc=wy>=8?structCharAt(wx,wy):null;
    if(sc!==null){
      if(sc==='#')return {t:rock,o:0};
      if(sc==='i'||sc==='g')return {t:rock,o:structOre(wx,wy,d,sc)};
      return {t:T_AIR,o:0};
    }
  }
  /* городок: кирпич домов и мостовых */
  if(band===3){const tt=lilTownTile(wx,wy);if(tt===T_LTOY||tt===T_WOOD)return {t:tt,o:0};}
  /* соты: восковые стенки и запечатанный мёд */
  if(band===2){
    const H=lilHex(wx,wy),k=lilHexKind(H.c);
    if(k===2&&H.hd<LH_RI-1.15)return {t:T_LCOMB,o:0};
  }
  if(lilacAir(wx,wy)){
    /* соты: в части открытых ячеек на дне стоит мёд */
    if(band===2&&waterAmt()>0){const H=lilHex(wx,wy);if(hash2(H.c.i,H.c.j,G.seed+90071)%3===0&&H.hd<LH_RI-1.15&&(wy+0.5)-H.c.cy>0.6)return {t:T_HONEY,o:0};}
    if(band===1){   /* рощи стеклянных колонн */
      if(vnoise(wx/30,wy/30,s+25)>0.45){
        const cc=Math.floor(wx/7),h=hash2(cc,Math.floor(wy/26),s+27);
        if(h%3!==2&&((wx%7)+7)%7===(h>>>4)%7)return {t:T_LQUARTZ,o:0};
      }
    }
    if(band===6&&wy>=LIL_FLOOR-3)return {t:T_LDOWN,o:0};
    const lq=lilacLiquidAt(wx,wy,band);
    if(lq)return {t:lq,o:0};
    return {t:T_AIR,o:0};
  }
  /* прожилки и особые блоки в толще породы */
  if(band===0&&Math.abs(vnoise(wx/8,wy/15,s+71)-0.5)<0.017)rock=T_LROOT;
  else if(band===1&&vnoise(wx/5,wy/5,s+73)>0.8)rock=T_LQUARTZ;
  else if(band===4){if(Math.abs(vnoise(wx/16,wy/16,s+41)-0.5)<0.058||Math.abs(vnoise(wx/11,wy/21,s+43)-0.5)<0.044)rock=T_LBRIAR;}
  else if(band===5&&Math.abs(vnoise(wx/15,wy/5,s+75)-0.5)<0.022)rock=T_LSILVER;
  else if(band===6&&vnoise(wx/4.5,wy/4.5,s+77)>0.76)rock=T_LDOWN;
  let o=0;
  if(rock===LIL_ROCK[band]){
    for(let oi=ORES.length-1;oi>=37;oi--){
      const or=ORES[oi];
      if(or.dim!==2||d<or.dmin||d>or.dmax)continue;
      const v=vnoise(wx/3.4+or.id*17.3,wy/3.4+or.id*29.7,s+or.id*997+(G.oreEpoch||0)*7919);
      if(v>getOreThreshold(or)){o=or.id;break;}
    }
  }
  return {t:rock,o:o};
}
/* особые блоки при разрушении */
function lilacSpecialBreak(t,tx,ty){
  const x=tx*TILE+16,y=ty*TILE+16;
  if(t===T_LCOMB){
    const h=Math.round(player.maxHp*0.05);player.hp=Math.min(player.maxHp,player.hp+h);
    floatText(x,y-10,'+'+h+' ❤ мёд','#ffd060');burst(x,y,14,'#ffb020',140,3);
  }else if(t===T_LDOWN){burst(x,y,16,'#f4e8ff',90,2.6);}
}
