'use strict';
/* ============================================================
   ГЕНЕРАТОР АДА
   5 биомов со своей формой пещер:
   Пепельные пустоши — низкие широкие залы, базальтовые колонны;
   Кровавые копи — круглые камеры с озёрами крови;
   Серные топи — длинные плоские пещеры, кислотные болота, ядовитые гейзеры;
   Костяные катакомбы — сеть коридоров с шахтами, душекамень;
   Огненное ядро — огромные пустоты с лавовыми морями и раскалённым камнем.
   На 2000 м Земли — арена босса (см. arenaTile).
   ============================================================ */
function hellRockAt(d){return d<250?T_ASH:d<550?T_FLESH:d<850?T_SULFUR:d<1200?T_BONEROCK:T_HELLSTONE;}
function catBand(wy){
  const band=Math.floor(wy/14);
  const h=hash2(band,1,G.seed+50051);
  const x0=2+(h%30);
  return {band:band,row:((wy%14)+14)%14,x0:x0,x1:Math.min(MW-3,x0+34+((h>>>8)%40))};
}
function hellAir(wx,wy){
  const s=G.seed+50000,d=wy;
  if(d<250){
    return vnoise(wx/19,wy/8,s+11)>0.6||vnoise(wx/7,wy/7,s+23)>0.765;
  }else if(d<550){
    return vnoise(wx/10,wy/10,s+31)>0.625||Math.abs(vnoise(wx/14,wy/14,s+37)-0.5)<0.016;
  }else if(d<850){
    return vnoise(wx/24,wy/6.5,s+41)>0.6||vnoise(wx/6,wy/6,s+43)>0.775;
  }else if(d<1200){
    const c=catBand(wy);
    if(c.row>=1&&c.row<=3&&wx>=c.x0&&wx<=c.x1)return true;
    /* вертикальные шахты между ярусами */
    const col=Math.floor(wx/12),lx=((wx%12)+12)%12;
    if(lx>=5&&lx<=6&&hash2(col,c.band,s+53)%3===0&&(c.row>=1)){
      const cx=col*12+5;if(cx>=c.x0-2&&cx<=c.x1+2)return true;
    }
    return vnoise(wx/8,wy/8,s+57)>0.73;
  }
  return vnoise(wx/16,wy/11,s+61)>0.565||vnoise(wx/6,wy/6,s+63)>0.785;
}
function hellLiquidAt(wx,wy,d){
  const wa=waterAmt(),la=lavaAmt();let r;
  if(d<250&&la>0){
    r=liqRegion(wx,wy,36,22,6011,Math.round(24*la),20,250);
    if(r&&wx>=r.x0&&wx<=r.x0+r.w&&wy>=r.L+2&&wy<=r.L+4&&liqSupported(wx,wy,r.end))return T_LAVA;
  }else if(d<550&&wa>0){
    r=liqRegion(wx,wy,40,22,6012,Math.min(100,Math.round(60*wa)),250,550);
    if(r&&wx>=r.x0&&wx<=r.x0+r.w&&wy>=r.L&&wy<=r.L+6&&liqSupported(wx,wy,r.end))return T_BLOOD;
  }else if(d<850&&wa>0){
    r=liqRegion(wx,wy,44,20,6013,Math.min(100,Math.round(55*wa)),550,850);
    if(r&&wx>=r.x0&&wx<=r.x0+r.w&&wy>=r.L&&wy<=r.L+4&&liqSupported(wx,wy,r.end))return T_ACID;
  }else if(d<1200){
    if(wa>0){
      /* катакомбы: лужи крови на полу коридоров и озёра в пещерах (раньше их было в ~15 раз меньше, чем других жидкостей) */
      const c=catBand(wy);
      if(c.row===3&&wx>=c.x0&&wx<=c.x1){const seg=Math.floor(wx/9);if(hash2(seg,c.band,6016)%100<Math.min(70,Math.round(26*wa)))return T_BLOOD;}
      r=liqRegion(wx,wy,34,22,6014,Math.min(100,Math.round(50*wa)),850,1200);
      if(r&&wx>=r.x0&&wx<=r.x0+r.w&&wy>=r.L&&wy<=r.L+5&&liqSupported(wx,wy,r.end))return T_BLOOD;}
  }else if(la>0){
    r=liqRegion(wx,wy,48,30,6015,Math.min(100,Math.round(60*la)),1200,99999);
    if(r&&wx>=r.x0&&wx<=r.x0+r.w&&wy>=r.L&&liqSupported(wx,wy,r.end))return T_LAVA;
  }
  return 0;
}
function hellStructTile(sc,wx,wy,d,rock){
  switch(sc){
    case '#':return {t:rock,o:0};
    case 'w':return {t:T_WOOD,o:0};
    case 'b':return {t:T_BASALT,o:0};
    case 'o':return {t:T_OBS,o:0};
    case 'x':return {t:T_BONE,o:0};
    case 'l':return {t:lavaAmt()>0?T_LAVA:T_OBS,o:0};
    case '~':{const lq=d<550?T_BLOOD:d<850?T_ACID:d<1200?T_BLOOD:T_LAVA;
      if(lq===T_LAVA)return {t:lavaAmt()>0?T_LAVA:rock,o:0};
      return {t:waterAmt()>0?lq:rock,o:0};}
    case 'i':return {t:rock,o:structOre(wx,wy,d,'i')};
    case 'g':return {t:rock,o:structOre(wx,wy,d,'g')};
    default:return {t:T_AIR,o:0};
  }
}
function genHellTileAt(wx,wy){
  const s=G.seed+50000,d=wy;
  let rock=hellRockAt(d);
  {
    const sc=wy>=8?structCharAt(wx,wy):null;
    if(sc!==null)return hellStructTile(sc,wx,wy,d,rock);
  }
  const hz=hellHeartZone(wx,wy);
  if(hz)return hz;
  /* катакомбы: кирпичный пол коридоров */
  if(d>=850&&d<1200){
    const c=catBand(wy);
    if((c.row===4||c.row===0)&&wx>=c.x0-1&&wx<=c.x1+1){
      const col=Math.floor(wx/12),lx=((wx%12)+12)%12;
      const shaft=lx>=5&&lx<=6&&hash2(col,c.band,s+53)%3===0;
      if(!shaft||c.row===4&&hash2(col,c.band+1,s+53)%3!==0)return {t:T_BASALT,o:0};
    }
  }
  const air=hellAir(wx,wy);
  if(air){
    /* пепельные пустоши: базальтовые колонны */
    if(d<250&&d>=12){
      const cc=Math.floor(wx/9),h=hash2(cc,Math.floor(wy/40),s+71);
      if(h%3===0&&((wx%9)+9)%9===(h>>>4)%9)return {t:T_BASALT,o:0};
    }
    /* огненное ядро: столбы раскалённого камня */
    if(d>=1200){
      const cc=Math.floor(wx/13),h=hash2(cc,Math.floor(wy/50),s+73);
      if(h%4===0&&((wx%13)+13)%13===(h>>>4)%13)return {t:T_HOT,o:0};
    }
    const lq=hellLiquidAt(wx,wy,d);
    /* ядро: корка над лавовыми озёрами — обваливается под ногами */
    if(lq===T_LAVA&&d>=1200&&!hellLiquidAt(wx,wy-1,d)&&hellAir(wx,wy-1)&&rnd2(wx,wy,s+131)<0.55)return {t:T_CRUST,o:0};
    if(lq)return {t:lq,o:0};
    return {t:T_AIR,o:0};
  }
  /* прожилки */
  if(d<250&&Math.abs(vnoise(wx/11,wy/11,s+81)-0.5)<0.03)rock=T_BASALT;
  else if(d>=250&&d<550&&Math.abs(vnoise(wx/9,wy/9,s+83)-0.5)<0.02)rock=T_BONE;
  else if(d>=850&&d<1200&&vnoise(wx/4,wy/4,s+85)>0.8)rock=T_SOULSTONE;
  else if(d>=1200&&Math.abs(vnoise(wx/12,wy/12,s+87)-0.5)<0.011)rock=T_OBS;
  let o=0;
  for(let oi=ORES.length-1;oi>=18;oi--){
    const or=ORES[oi];
    if(d<or.dmin||d>or.dmax)continue;
    const v=vnoise(wx/3.4+or.id*17.3,wy/3.4+or.id*29.7,s+or.id*997+(G.oreEpoch||0)*7919);
    if(v>getOreThreshold(or)){o=or.id;break;}
  }
  let t=rock;
  if(!o){
    const airUp=hellAir(wx,wy-1);
    /* катакомбы: песок душ на полах и костяные шипы */
    if(d>=860&&d<1200&&airUp&&vnoise(wx/7,wy/5,s+141)>0.6)return {t:T_SOULSAND,o:0};
    if(d>=860&&d<1200&&!airUp&&hellAir(wx,wy-2)===false&&vnoise(wx/7,(wy-1)/5,s+141)>0.6&&rnd2(wx,wy,s+143)<0.7)return {t:T_SOULSAND,o:0};
    if(d>=860&&d<1200&&airUp&&rnd2(wx,wy,s+145)<0.09)return {t:T_BSPIKE,o:0};
    /* пустоши: пепельные гейзеры-трамплины */
    if(d>=20&&d<250&&airUp&&rnd2(wx,wy,s+147)<0.07)return {t:T_ASHVENT,o:0};
    /* копи: пульсирующие наросты плоти у полостей */
    if(d>=250&&d<550&&(airUp||hellAir(wx-1,wy)||hellAir(wx+1,wy))&&rnd2(wx,wy,s+149)<0.07)return {t:T_FLESHPOD,o:0};
    /* топи: нестабильная сера */
    if(d>=560&&d<850&&vnoise(wx/3.6,wy/3.6,s+151)>0.84)return {t:T_SULFBOMB,o:0};
    if(d>=1200&&vnoise(wx/4.2,wy/4.2,s+91)>0.8)t=T_HOT;
    else if(d>=560&&d<850&&rnd2(wx,wy,s+93)<0.06&&hellAir(wx,wy-1))t=T_VENT;
    else if(d<250&&rnd2(wx,wy,s+95)<0.03&&hellAir(wx,wy-1))t=T_VENT;
  }
  return {t:t,o:o};
}
function hellHeartZone(wx,wy){return null;}
/* ---------- особые блоки Ада ---------- */
const crustT=new Map(),hsBreaks=[];let hsT=0,soulSpawnT=8;
function hellSpecialBreak(t,tx,ty){
  const x=tx*TILE+16,y=ty*TILE+16;
  if(t===T_FLESHPOD){
    if(Math.random()<0.6){const h=Math.round(player.maxHp*0.08);player.hp=Math.min(player.maxHp,player.hp+h);floatText(x,y-10,'+'+h+' ❤','#ff8aa0');burst(x,y,16,'#c0142a',160,3);addPatch(x,(ty+1)*TILE,30,4,'blood',0);}
    else{const md=MOBDEFS.find(d=>d.id==='meatling');for(let k=0;k<2;k++){const c=spawnMobAt(md,x+rnd(-8,8),y+8);c.noSouls=true;c.vy=-200;}burst(x,y,20,'#a0101e',200,3.4);floatText(x,y-10,'Из нароста выползли твари!','#ff7a8a');}
    if(Math.random()<0.35)addMat('ichor',1);
  }else if(t===T_SULFBOMB){
    hellFx.push({type:'sbomb',x,y,t:0,warn:0.9});floatText(x,y-12,'Шипит!','#e8e060');
  }else if(t===T_SOULSAND){
    if(Math.random()<0.18){spawnLostSoul(x,y);}
  }
}
function spawnLostSoul(x,y){
  const def=MOBDEFS.find(d=>d.id==='lostsoul');if(!def)return null;
  const m=spawnMobAt(def,x,y+10);m.age=0;m.emerge=1;burst(x,y,14,'#9ad8ff',120,2.6);return m;
}
function updateHellBlocks(dt){
  if(G.dim!==1||G.scene!=='mine'){hsBreaks.length=0;return;}
  while(hsBreaks.length){const [o,tx,ty]=hsBreaks.shift();try{hellSpecialBreak(o,tx,ty);}catch(e){}}
  const ftx=Math.floor(player.x/TILE),fty=Math.floor((player.y+3)/TILE);
  const under=player.onGround?getTile(ftx,fty):-1;
  /* корка ядра: трескается и проваливается в лаву */
  if(under===T_CRUST){const k=ftx+','+fty,v=(crustT.get(k)||0)+dt;crustT.set(k,v);
    if(Math.random()<0.4)spawnPart(player.x+rnd(-10,10),player.y,rnd(-20,20),rnd(-60,-20),0.4,'#ff8a30',2,200);
    if(v>0.75){crustT.delete(k);setTile(ftx,fty,T_AIR);burst(ftx*TILE+16,fty*TILE+8,16,'#5a2a14',160,3);SFX.breakBlock();floatText(player.x,player.y-60,'Корка обвалилась!','#ffa060');}}
  for(const [k,v] of crustT){if(v>0)crustT.set(k,v-dt*0.3);if(v<=0)crustT.delete(k);}
  /* костяные шипы */
  hsT-=dt;
  if(under===T_BSPIKE&&hsT<=0&&!cheats.god){hsT=0.5;hurtPlayer(10,'костяные шипы',{bleed:1});player.vy=Math.min(player.vy,-140);}
  /* пепельные гейзеры-трамплины */
  const tx0=ftx-4,ty0=fty-6;
  for(let tx=tx0;tx<=tx0+8;tx++)for(let ty=ty0;ty<=ty0+8;ty++){
    if(getTile(tx,ty)!==T_ASHVENT)continue;
    const ph=((G.time+hash2(tx,ty,5)%60/10)%5.2);
    if(ph>4.4&&ph<4.4+dt*1.5&&Math.random()<0.8)SFX.geyser();
    if(ph>4.4&&Math.random()<0.8)spawnPart(tx*TILE+16+rnd(-6,6),ty*TILE,rnd(-20,20),rnd(-420,-260),0.7,Math.random()<0.7?'#8a7a70':'#ff8a3a',rnd(2.4,4),200);
    else if(ph>3.6&&ph<=4.4&&Math.random()<0.25)spawnPart(tx*TILE+16+rnd(-6,6),ty*TILE,rnd(-10,10),rnd(-60,-20),0.5,'#8a7a70',2,0);
    if(ph>4.4&&Math.abs(player.x-(tx*TILE+16))<20&&player.y<=ty*TILE+4&&player.y>ty*TILE-5*TILE){player.vy=Math.min(player.vy,-820);player.peakY=player.y-400;if(!player._ashLaunch||G.time-player._ashLaunch>1){player._ashLaunch=G.time;floatText(player.x,player.y-60,'Взлёт!','#ffc080');}}
  }
  /* песок душ: из него выбираются заблудшие души */
  soulSpawnT-=dt;
  if(soulSpawnT<=0){soulSpawnT=rnd(5,9);
    let cnt=0;for(const m of mobs)if(m.def.id==='lostsoul')cnt++;
    if(cnt<4){for(let q=0;q<24;q++){const tx=ftx+Math.floor(rnd(-12,12)),ty=fty+Math.floor(rnd(-6,6));
      if(getTile(tx,ty)===T_SOULSAND&&getTile(tx,ty-1)===T_AIR&&Math.hypot(tx*TILE-player.x,ty*TILE-player.y)>90){spawnLostSoul(tx*TILE+16,ty*TILE-4);break;}}}}
}
function onSoulSand(){const t=getTile(Math.floor(player.x/TILE),Math.floor((player.y+3)/TILE));return player.onGround&&t===T_SOULSAND;}

function genChunk(cx,cy){
  const tiles=new Uint8Array(CHUNK*CHUNK);
  const ores=new Uint8Array(CHUNK*CHUNK);
  const dmg=new Uint8Array(CHUNK*CHUNK);
  for(let ly=0;ly<CHUNK;ly++){
    for(let lx=0;lx<CHUNK;lx++){
      const i=ly*CHUNK+lx;
      const wx=cx*CHUNK+lx, wy=cy*CHUNK+ly;
      const g=genTileAt(wx,wy);
      tiles[i]=g.t;
      ores[i]=g.o;
    }
  }
  applyModsToChunk(cx,cy,tiles,ores,dmg);
  return {tiles,ores,dmg,cx,cy};
}
function getChunk(cx,cy){
  const k=ckey(cx,cy);
  let c=chunks.get(k);
  if(!c){
    c=genChunk(cx,cy);chunks.set(k,c);
    if(chunks.size>420){
      const px=Math.floor(player.x/CHUNK/TILE),py=Math.floor(player.y/CHUNK/TILE);
      let worst=null,wd=-1;
      for(const [kk,cc] of chunks){
        const dd=Math.abs(cc.cx-px)+Math.abs(cc.cy-py);
        if(dd>wd){wd=dd;worst=kk;}
      }
      if(worst&&wd>10)chunks.delete(worst);
    }
  }
  return c;
}
function getTile(tx,ty){
  if(ty<0)return T_AIR;
  if(tx<0||tx>=MW)return T_BEDROCK;
  if(placedLadders.has(tx+','+ty))return T_LADDER;
  const cx=Math.floor(tx/CHUNK),cy=Math.floor(ty/CHUNK);
  const c=getChunk(cx,cy);
  return c.tiles[(ty-cy*CHUNK)*CHUNK+(tx-cx*CHUNK)];
}
function getOre(tx,ty){
  if(ty<0||tx<0||tx>=MW)return 0;
  if(placedLadders.has(tx+','+ty))return 0;
  const cx=Math.floor(tx/CHUNK),cy=Math.floor(ty/CHUNK);
  const c=getChunk(cx,cy);
  return c.ores[(ty-cy*CHUNK)*CHUNK+(tx-cx*CHUNK)];
}
function getDmg(tx,ty){
  if(ty<0||tx<0||tx>=MW)return 0;
  if(placedLadders.has(tx+','+ty))return 0;
  const cx=Math.floor(tx/CHUNK),cy=Math.floor(ty/CHUNK);
  const c=getChunk(cx,cy);
  return c.dmg[(ty-cy*CHUNK)*CHUNK+(tx-cx*CHUNK)];
}
function setDmg(tx,ty,v){
  if(ty<0||tx<0||tx>=MW)return;
  if(placedLadders.has(tx+','+ty))return;
  const cx=Math.floor(tx/CHUNK),cy=Math.floor(ty/CHUNK);
  const c=getChunk(cx,cy);
  c.dmg[(ty-cy*CHUNK)*CHUNK+(tx-cx*CHUNK)]=clamp(v,0,255);
}
function setTile(tx,ty,t){
  if(ty<0||tx<0||tx>=MW)return;
  if(t===T_AIR&&G.dim===1&&G.scene==='mine'){const old=getTile(tx,ty);if(old>=27&&old<=32)hsBreaks.push([old,tx,ty]);}
  ccMarkDirty(tx,ty);
  if(t===T_LADDER){
    placedLadders.add(tx+','+ty);
    dugTiles.delete(tx+','+ty);
    return;
  }
  const k=tx+','+ty;
  if(placedLadders.has(k))placedLadders.delete(k);
  const cx=Math.floor(tx/CHUNK),cy=Math.floor(ty/CHUNK);
  const c=getChunk(cx,cy);
  c.tiles[(ty-cy*CHUNK)*CHUNK+(tx-cx*CHUNK)]=t;
  c.ores[(ty-cy*CHUNK)*CHUNK+(tx-cx*CHUNK)]=0;
  c.dmg[(ty-cy*CHUNK)*CHUNK+(tx-cx*CHUNK)]=0;
  recordTileMod(tx,ty,t);
  if(t===T_AIR){
    if(G.scene==='mine'&&player.stats)player.stats.blocks=(player.stats.blocks||0)+1;
    dugTiles.set(k,G.time);
  }else{
    dugTiles.delete(k);
  }
}
function isLiq(t){return t===T_WATER||t===T_ACID||t===T_BLOOD;}
function isSolid(tx,ty){
  const t=getTile(tx,ty);
  return t!==T_AIR&&t!==T_LAVA&&t!==T_LADDER&&t!==T_WATER&&t!==T_ACID&&t!==T_BLOOD;
}
function solidAtPx(x,y){return isSolid(Math.floor(x/TILE),Math.floor(y/TILE));}

/* --- Восстановление породы --- */
function regenTile(tx,ty){
  ccMarkDirty(tx,ty);
  const key=tx+','+ty;
  if(placedLadders.has(key))return true;
  if(crateAtTile(tx,ty))return true;
  if(tx<0||tx>=MW||ty<0)return true;
  const g=genTileAt(tx,ty);
  if(g.t===T_AIR||g.t===T_LAVA||g.t===T_LADDER||isLiq(g.t))return true;
  unrecordTileMod(tx,ty);
  const cx=Math.floor(tx/CHUNK),cy=Math.floor(ty/CHUNK);
  const c=chunks.get(cx+'_'+cy);
  if(c){
    const lx=tx-cx*CHUNK,ly=ty-cy*CHUNK,i=ly*CHUNK+lx;
    c.tiles[i]=g.t;
    c.ores[i]=g.o;
    c.dmg[i]=0;
  }
  return true;
}
function updateRegen(dt){
  if(!settings.regen)return;
  if(G.scene!=='mine')return;
  const speed=settings.regenSpeed||1;           /* ← новое: множитель скорости */
  regenAcc+=dt;
  if(regenAcc<REGEN.interval/speed)return;      /* интервал проверок делится на скорость */
  regenAcc=0;

  const n=dugTiles.size;
  if(n===0)return;

  if(n>REGEN.maxTiles){
    let drop=n-REGEN.maxTiles;
    for(const k of dugTiles.keys()){
      dugTiles.delete(k);
      if(--drop<=0)break;
    }
  }

  const ptx=player.x/TILE, pty=player.y/TILE;
  const minD2=REGEN.minDist*REGEN.minDist;
  const now=G.time;
  let checked=0, regened=0;
  const defer=[];

  for(const [key,dugAt] of dugTiles){
    if(checked++>=REGEN.checkCap)break;
    const idx=key.indexOf(',');
    const tx=+key.slice(0,idx), ty=+key.slice(idx+1);
    const dx=tx-ptx, dy=ty-pty;
    if(dx*dx+dy*dy < minD2){ defer.push(key); continue; }
    if(placedLadders.has(key)){ dugTiles.delete(key); continue; }
    if(getTile(tx,ty)!==T_AIR){ dugTiles.delete(key); continue; }
    if(now-dugAt < REGEN.delay/speed){ defer.push(key); continue; }  /* задержка делится на скорость */
    if(Math.random()>REGEN.chance){ defer.push(key); continue; }
    regenTile(tx,ty);
    dugTiles.delete(key);
    regenTotal++;
    if(++regened>=REGEN.perPass)break;
  }

  for(const key of defer){
    const v=dugTiles.get(key);
    if(v===undefined)continue;
    dugTiles.delete(key);
    dugTiles.set(key,v);
  }

  if(regened>=REGEN.perPass)SFX.regen();
}
