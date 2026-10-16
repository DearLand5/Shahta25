'use strict';
/* ============================================================
   ЛИЛОВЫЕ НЕБЕСА — третье измерение (G.dim===2)
   Генератор мира. Семь биомов (BIOMES 10–16):
   Цветущие луга · Хрустальный сад · Медовые соты · Кукольный городок ·
   Розарий · Зеркальные топи · Колыбель.
   Этап 0: заготовка — простые пещеры, чтобы движок умел строить
   третий мир. Свои породы, руда и форма пещер — этап 1.
   Меняешь генератор так, что старые раскопки станут бессмыслицей, —
   увеличь LILAC_GV (02-cheats-save): мир Лиловых небес создастся заново.
   ============================================================ */
function lilacRockAt(d){return d<550?T_STONE:d<1150?T_CRYSTAL:T_OBS;}
function lilacAir(wx,wy){
  const s=G.seed+90000;
  return vnoise(wx/15,wy/10,s+11)>0.6||vnoise(wx/6.5,wy/6.5,s+23)>0.765;
}
function genLilacTileAt(wx,wy){
  const s=G.seed+90000,d=wy;
  const rock=lilacRockAt(d);
  {
    const sc=wy>=8?structCharAt(wx,wy):null;
    if(sc!==null){
      if(sc==='#')return {t:rock,o:0};
      if(sc==='i'||sc==='g')return {t:rock,o:structOre(wx,wy,d,sc)};
      return {t:T_AIR,o:0};
    }
  }
  if(lilacAir(wx,wy))return {t:T_AIR,o:0};
  let o=0;
  for(let oi=ORES.length-1;oi>=1;oi--){
    const or=ORES[oi];
    if(!or||or.dim!==2||d<or.dmin||d>or.dmax)continue;
    const v=vnoise(wx/3.4+or.id*17.3,wy/3.4+or.id*29.7,s+or.id*997+(G.oreEpoch||0)*7919);
    if(v>getOreThreshold(or)){o=or.id;break;}
  }
  return {t:rock,o:o};
}
