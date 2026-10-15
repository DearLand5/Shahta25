'use strict';
/* ============================================================
   АРЕНА БОССА (Земля, 2000 м) и СВЯТИЛИЩЕ СЕРДЦА БЕЗДНЫ
   ============================================================ */
const ARENA_Y0=1984,ARENA_FLOOR=2012,ARENA_Y1=2016,ARENA_GX0=46,ARENA_GX1=49;
const HEART_D0=1150,HEART_D1=1450;
function arenaTile(wx,wy){
  if(wy>ARENA_Y1)return T_BEDROCK;
  if(wy<ARENA_Y0){
    /* воронка к воротам */
    const k=ARENA_Y0-wy;
    if(k<=10&&wx>=ARENA_GX0-1-Math.floor(k/3)&&wx<=ARENA_GX1+1+Math.floor(k/3))return k<=1?T_AIR:(k===10?-1:T_AIR);
    return -1;
  }
  if(wy<=ARENA_Y0+1){
    if(wx>=ARENA_GX0&&wx<=ARENA_GX1)return T_AIR;
    return T_ARENA;
  }
  if(wx<=3||wx>=MW-4)return T_ARENA;
  if(wy>=ARENA_FLOOR)return T_ARENA;
  if(wy===2004&&((wx>=11&&wx<=22)||(wx>=73&&wx<=84)))return T_ARENA;
  if(wy===1997&&wx>=40&&wx<=55)return T_ARENA;
  return T_AIR;
}
function heartSpot(){
  const h=hash2(G.seed,77,4242);
  return {x:10+(h%76),y:HEART_D0+20+((h>>>8)%(HEART_D1-HEART_D0-40))};
}
let _hsSeed=null,_hs=null;
function heartTile(wx,wy){
  if(G.dim!==0)return -1;
  if(_hsSeed!==G.seed){_hsSeed=G.seed;_hs=heartSpot();}
  const dx=wx-_hs.x,dy=wy-_hs.y;
  if(Math.abs(dx)>6||dy<-6||dy>2)return -1;
  if(Math.abs(dx)===6||dy===-6||dy>=1)return T_OBS;
  if(dy===0&&Math.abs(dx)<=1)return T_OBS;          /* пьедестал */
  return T_AIR;
}
/* ============================================================
   ЯКОРЯ: по 3 в каждом биоме обоих измерений. Якорь переносит
   в соседний биом (вверх или вниз) — к якорю того биома.
   ============================================================ */
let _anKey='',_anList=[];
function anchorList(){
  const key=G.seed+':'+G.dim;
  if(key===_anKey)return _anList;
  _anKey=key;_anList=[];
  const off=G.dim===1?5:0;
  for(let b=0;b<5;b++){
    const B=BIOMES[off+b];
    const y0=B.d0+14,y1=(b===4?(G.dim===0?1940:1800):B.d1-12);
    for(let k=0;k<3;k++){
      const h=hash2(b*7+k,G.dim*13+3,G.seed+8181);
      const span=Math.max(10,(y1-y0)/3);
      let y=Math.floor(y0+k*span+((h>>>4)%Math.max(1,Math.floor(span-8))));
      let x=8+(h%(MW-16));
      /* не ставим якорь внутрь структуры или святилища */
      for(let tr=0;tr<6;tr++){
        let bad=false;
        for(const [dx,dy] of [[-4,-5],[4,-5],[-4,1],[4,1],[0,-2],[-4,-2],[4,-2],[0,1],[0,-5]]){if(structAt(x+dx,y+dy)){bad=true;break;}}
        if(G.dim===0){const hs=heartSpot();if(Math.abs(y-hs.y)<12&&Math.abs(x-hs.x)<14)bad=true;}
        if(!bad)break;
        x=8+((x-8+29)%(MW-16));if(tr===3)y=Math.min(y1,y+9);
      }
      _anList.push({id:b*3+k,bi:off+b,x:x,y:y});
    }
  }
  return _anList;
}
function anchorTile(wx,wy){
  if(wy<12)return -1;
  for(const a of anchorList()){
    const dx=wx-a.x,dy=wy-a.y;
    if(Math.abs(dx)>4||dy<-5||dy>1)continue;
    if(dy===1)return T_OBS;
    if(dy===-5&&Math.abs(dx)<=3)return T_OBS;
    if(Math.abs(dx)===4&&dy<=-3)return T_OBS;
    return T_AIR;
  }
  return -1;
}
function genTileAt(wx,wy){
  if(wx<0||wx>=MW)return {t:T_BEDROCK,o:0};
  if(wy<0)return {t:T_AIR,o:0};
  const sz=getSafeZoneTile(wx,wy);
  if(sz!==-1)return {t:sz,o:0};
  {const at=anchorTile(wx,wy);if(at!==-1)return {t:at,o:0};}
  if(G.dim===1)return genHellTileAt(wx,wy);
  if(wy>=ARENA_Y0-12){const at=arenaTile(wx,wy);if(at!==-1)return {t:at,o:0};}
  if(wy>=HEART_D0-8&&wy<=HEART_D1+8){const hz=heartTile(wx,wy);if(hz!==-1)return {t:hz,o:0};}
  const s=G.seed;
  const d=wy;
  let rock;
  if(d<50)rock=T_DIRT;
  else if(d<200)rock=T_STONE;
  else if(d<500)rock=T_CRYSTAL;
  else if(d<1000)rock=T_MAGMA;
  else rock=T_OBS;
  {
    const sc=wy>=8?structCharAt(wx,wy):null;      /* структуры биомов: у них приоритет */
    if(sc!==null){
      switch(sc){
        case '#':return {t:rock,o:0};
        case 'w':return {t:T_WOOD,o:0};
        case 'b':return {t:T_BRICK,o:0};
        case 'o':return {t:T_OBS,o:0};
        case 'x':return {t:T_BONE,o:0};
        case 'l':return {t:lavaAmt()>0?T_LAVA:T_OBS,o:0};        /* лава выключена — застывший обсидиан */
        case '~':return {t:waterAmt()>0?T_WATER:rock,o:0};      /* вода выключена — пруд засыпан */
        case 'i':return {t:rock,o:structOre(wx,wy,d,'i')};
        case 'g':return {t:rock,o:structOre(wx,wy,d,'g')};
        default:return {t:T_AIR,o:0};
      }
    }
  }
  if(wy>=58){
    const gk=geodeAt(wx,wy);
    if(gk===1)return {t:T_AIR,o:0};
    if(gk===2)return {t:T_CRYSTAL,o:geodeOre(wx,wy,d)};
    const cr=corridorInfo(wx,wy);
    if(cr){
      if(wy===cr.row+2&&rnd2(wx,wy,s+7100)<0.05)return {t:T_STONE,o:0};
      return {t:T_AIR,o:0};
    }
    const pk=pocketOre(wx,wy,d);
    if(pk)return {t:T_STONE,o:pk};
    /* каркас штольни: сплошной пол, потолок и торцы — рельсы и крепь стоят на камне */
    const cb=corrBand(wy);
    if(cb){
      const x0=cb.x0,x1=cb.x0+cb.len;
      if(wx>=x0-1&&wx<=x1+1&&(wy===cb.row-1||wy===cb.row+3))return {t:rock,o:0};
      if((wx===x0-1||wx===x1+1)&&wy>=cb.row&&wy<=cb.row+2)return {t:rock,o:0};
    }
    const mk=monolithAt(wx,wy);
    if(mk===1)return {t:T_AIR,o:0};
    if(mk===2)return {t:T_OBS,o:0};
    if(mk===3)return {t:T_OBS,o:15};
    if(mk===4)return {t:T_OBS,o:0};
  }
  const air=isNaturalAir(wx,wy);
  if(air){
    if(d>520&&vnoise(wx/9,wy/9,s+77)>0.60&&rnd2(wx,wy,s+88)>1-0.55*lavaAmt()&&!isNaturalAir(wx,wy+1))return {t:T_LAVA,o:0};
    const lq=liquidAt(wx,wy,d);
    if(lq)return {t:lq,o:0};
    return {t:T_AIR,o:0};
  }
  /* обсидиановые жилы в магме */
  if(d>=520&&d<1000&&Math.abs(vnoise(wx/13,wy/13,s+505)-0.5)<0.02)rock=T_OBS;
  let o=0;
  for(let oi=ORES.length-1;oi>=1;oi--){
    const or=ORES[oi];
    if((or.dim||0)!==G.dim||d<or.dmin||d>or.dmax)continue;
    const v=vnoise(wx/3.4+or.id*17.3, wy/3.4+or.id*29.7, s+or.id*997+(G.oreEpoch||0)*7919);
    if(v>getOreThreshold(or)){o=or.id;break;}
  }
  let t=rock;
  if(!o){
    /* родники в стенах пещер, раскалённые блоки и гейзеры в магме */
    if(d>=10&&d<460&&rnd2(wx,wy,s+8700)<0.04*waterAmt()&&isNaturalAir(wx,wy+1))t=T_SPRING;
    else if(rock===T_MAGMA&&vnoise(wx/4.2,wy/4.2,s+8801)>0.80)t=T_HOT;
    else if(d>=520&&d<1000&&rnd2(wx,wy,s+8710)<0.05&&isNaturalAir(wx,wy-1))t=T_VENT;
  }
  return {t:t,o:o};
}
