'use strict';
/* ============================================================
   DIG & ATTACK
   ============================================================ */
function digUpdate(dt){
  player.digSwing+=dt*14;
  if(!Input.digActive||Input.digTX<0||(G.dim===2&&lilShadowOn())){
    player.digProg=0;player.digTileX=-1;player.digTileY=-1;return;
  }
  const enemyNear=mobs.some(m=>m.alive&&!m.untargetable&&!m.hidden&&Math.hypot(m.x-player.x,m.y-player.y)<58);   /* закопанные/спрятанные мобы копать не мешают */
  if(enemyNear && !cheats.god){player.digProg=0;player.digTileX=-1;return;}

  const tx=Input.digTX,ty=Input.digTY;
  const px=player.x,py=player.y-player.h*0.5;
  const mx=tx*TILE+TILE/2,my=ty*TILE+TILE/2;
  const dist=Math.hypot(mx-px,my-py);
  if(dist>3.3*TILE && !cheats.instantDig){player.digProg=0;player.digTileX=-1;return;}

  const t=getTile(tx,ty);
  if(t===T_AIR||t===T_LAVA||t===T_LADDER||isLiq(t)){player.digProg=0;player.digTileX=-1;return;}
  if(t===T_BEDROCK||t===T_ARENA){
    if(!player._bedrockMsg||performance.now()-player._bedrockMsg>1500){
      player._bedrockMsg=performance.now();
      floatText(player.x,player.y-64,'Здесь не пробить','#ff9a3c');
      SFX.uiBack();
    }
    player.digProg=0;player.digTileX=-1;return;
  }
  const oreId=getOre(tx,ty);
  if(oreId&&ORES[oreId].tier>player.pickLvl && !cheats.instantDig){
    player.digProg=0;player.digTileX=-1;
    if(!player._toolMsg||performance.now()-player._toolMsg>1400){
      player._toolMsg=performance.now();
      floatText(player.x,player.y-64,'Нужна '+pickName(ORES[oreId].tier)+' (кузница)','#ff9a3c');
      SFX.uiBack();
    }
    return;
  }
  if(mx>px+3)player.facing=1;
  else if(mx<px-3)player.facing=-1;

  /* ИСПРАВЛЕНИЕ: прогресс копания считаем дробным числом, пока копаем один блок.
     Раньше он каждый кадр округлялся до 1/255 и смешивался с «единицами HP» --
     у твёрдых пород/руд прирост за кадр обнулялся округлением, и они не копались
     вообще (в т.ч. Бездна и Звёздная пыль), сколько бы скорости ни качали. */
  const sameTile=(player.digTileX===tx&&player.digTileY===ty);
  player.digTileX=tx;player.digTileY=ty;
  player.animState='dig';

  const base=ROCK_HP[t]||20;
  const oreHp=oreId?ORES[oreId].hp:0;
  const total=base+oreHp;
  const power=cheats.instantDig?total*100:14*pickSpeed()*(player.digSpeed||1);
  let prog=sameTile?player.digProg:getDmg(tx,ty)/255;
  prog+=power*dt/total;
  player.digProg=clamp(prog,0,1);
  if(G.dim===2&&oreId&&lilDigProgress(tx,ty,oreId,player.digProg))return;   /* живая руда убежала */

  if(player.digProg>=1&&t===T_BARRICADE){
    barricades.delete(tx+','+ty);
    setTile(tx,ty,T_AIR);
    player.barricades++;
    floatText(mx,my-14,'+1 баррикада','#ffd98a');
    SFX.place();player.digProg=0;
    return;
  }
  if(player.digProg>=1){
    const isOre=!!oreId;
    setTile(tx,ty,T_AIR);
    if(isOre&&lilOreDug(tx,ty,oreId,mx,my)){}
    else if(isOre){
      const dbl=(ritOn('harvest')?2:1)*((perkLv('miner')>0&&Math.random()<0.05*perkLv('miner'))?2:1);
      addOre(oreId,dbl);if(dbl>1)floatText(mx,my-30,'×'+dbl,'#ffd060');
      SFX.ore();
      burst(mx,my,10,ORES[oreId].glow,150,3.2);
      floatText(mx,my-14,'+1 '+ORES[oreId].name,RARITY[ORES[oreId].rar].c);
      if(G.dim===2)lilOreMined(tx,ty,oreId,mx,my);
    }else{
      if(G.dim===2)lilRockDug(tx,ty,t,mx,my);
      SFX.breakBlock(t);
      burst(mx,my,8,TILECOL[t]?TILECOL[t][0]:'#888',120,3);
    }
    player.digProg=0;
    shake(1.6);
  }else{
    setDmg(tx,ty,Math.floor(player.digProg*255));
    player.digSndT=(player.digSndT||0)-dt;
    if(player.digSndT<=0){player.digSndT=0.17;SFX.dig(t);}
    if(Math.random()<0.35){
      const c=t===T_LAVA?'#ff8a30':(TILECOL[t]?TILECOL[t][0]:'#999');
      spawnPart(mx,my,rnd(-60,60),rnd(-90,-10),0.4,c,rnd(1.5,3));
    }
  }
}
function autoAttackUpdate(dt){
  if(player.atkCd>0)player.atkCd-=dt;
  if(player.atkAnim>0)player.atkAnim-=dt*3.2;
  if(G.scene!=='mine'||G.bossCut||(G.dim===2&&lilShadowOn()))return;
  let best=null,bestD=1e9;
  for(const m of mobs){
    if(!m.alive||m.untargetable||m.hidden)continue;     /* под землёй / спрятан — меч не машет впустую и не мешает копать */
    const d=m.def.hb?hbDistToMob(m,player.x,player.y-player.h*0.5):Math.hypot(m.x-player.x,(m.y-m.h*0.5)-(player.y-player.h*0.5));
    if(d<(m.def.hb?54:62+(m.def.boss?m.w*0.4:0))&&d<bestD){bestD=d;best=m;}
  }
  if(!best||player.atkCd>0)return;
  player.atkCd=0.5;player.atkAnim=1;player.animState='attack';
  if(best.x>player.x+2)player.facing=1;
  else if(best.x<player.x-2)player.facing=-1;
  SFX.swing();
  const cx=player.x,cy=player.y-player.h*0.5;
  let anyHit=false,vampBest=0;
  for(const m of mobs){
    if(!m.alive||m.untargetable||m.hidden)continue;
    const dx=m.x-cx,dy=(m.y-m.h*0.5)-cy;
    const d=m.def.hb?hbDistToMob(m,cx,cy):Math.hypot(dx,dy);
    if(d<(m.def.hb?54:62+(m.def.boss?m.w*0.4:0))){
      const kb=dx>0?1:-1;
      let dmg=swordDmg()*(ritOn('blood')?1.4:1);let crit=false;
      if(relicOn('fang')&&Math.random()<0.15){dmg*=2;crit=true;}
      damageMob(m,Math.round(dmg),kb);
      if(crit)floatText(m.x,m.y-m.h-22,'КРИТ!','#ffd040');
      if(dmg>vampBest)vampBest=dmg;
      slashFx(m.x,m.y-m.h*0.5,kb);
      anyHit=true;
    }
  }
  /* вампиризм: один раз за взмах, от сильнейшего попадания, с потолком */
  if(vampBest>0&&perkLv('vamp')>0)player.hp=Math.min(player.maxHp,player.hp+Math.min(vampBest*0.005*perkLv('vamp'),player.maxHp*0.006));
  if(anyHit&&relicOn('chain')){player.chainN=(player.chainN||0)+1;
    if(player.chainN%4===0){let from={x:player.x,y:player.y-20},hitS=new Set();
      for(let k=0;k<3;k++){let best=null,bd=180;for(const m of mobs){if(!m.alive||m.untargetable||hitS.has(m))continue;const dd=Math.hypot(m.x-from.x,m.y-m.h*0.5-from.y);if(dd<bd){bd=dd;best=m;}}
        if(!best)break;hitS.add(best);pBeams.push({pts:zigzag(from.x,from.y,best.x,best.y-best.h*0.5),t:0.25,col:'#c8f0ff',w:2.5});damageMob(best,Math.round(swordDmg()*0.5),0);from={x:best.x,y:best.y-best.h*0.5};}
      SFX.grapple();}}
  if(!anyHit)shake(0.6);
}
function slashFx(x,y,dir){
  if(settings.quality==='low')return;
  const c=['#e8eef7','#e8eef7','#e8eef7','#e8eef7','#9ff0ff','#b48aff','#ffb070','#ff3a4a','#9ad8ff','#ffd060'][clamp(player.swordLvl-1,0,9)];
  slashes.push({x,y,dir,t:0.18,c});
}
const slashes=[];
function damageMob(m,dmg,kb,src){
  if(!m.alive)return;
  const def=m.def;
  if(player.bestiary&&(player.bestiary[def.id]||0)>=TROPHY_N&&!def.boss)dmg*=1.15;
  if(m.hidden||m.untargetable){
    floatText(m.x,m.y-m.h-6,'🛡','#cfd8e8');burst(m.x,m.y-m.h*0.5,4,'#cfd8e8',90,2);
    if(def.mech==='shell'&&src&&src.gun){/* панцирь отражает пулю */
      const a=Math.atan2(-src.vy,-src.vx)+rnd(-0.4,0.4);
      projectiles.push({x:m.x,y:m.y-m.h*0.5,vx:Math.cos(a)*400,vy:Math.sin(a)*400,life:1,dmg:src.dmg*0.5,color:'#cfd8e8',size:3,owner:'mob'});
    }
    return;
  }
  if(m.invuln>0){if(!G.bossCut)floatText(m.x,m.y-m.h-6,'неуязвим','#d8c8ff');return;}
  if(m.intangible>0){floatText(m.x,m.y-m.h-6,'сквозь','#9ad8ff');return;}
  if(m.state==='shell'||m.def.mech==='necro'&&m.shieldOn){dmg=Math.max(1,Math.round(dmg*(m.state==='shell'?0.15:0.3)));floatText(m.x,m.y-m.h-18,m.state==='shell'?'панцирь':'щит костей',m.state==='shell'?'#ffb070':'#7affb0');}
  mobOnHit(m,src);
  if(def.armorFront){
    const ax=src?src.x:player.x;
    if((ax-m.x)*m.facing>0){dmg=Math.max(1,Math.round(dmg*(1-def.armorFront)));floatText(m.x,m.y-m.h-18,'блок','#cfd8e8');}
  }
  if(m.shield>0)dmg=Math.max(1,Math.round(dmg*0.4));
  if(def.neutral)m.provoked=Math.max(m.provoked,10);
  if(def.thorns&&!src&&!cheats.god){player.fx.burn=Math.max(player.fx.burn||0,3);hurtPlayer(6,'ожог');floatText(m.x,m.y-m.h-18,'ожог!','#ff9a3c');}
  if((def.boss||def.hp>=1500||def.w>=44)&&player.perks&&player.perks.slayer)dmg=Math.round(dmg*(1+0.1*player.perks.slayer));
  if(m.eShield){m.eShieldT=(m.eShieldT||0);if(G.time>m.eShieldT){dmg=Math.round(dmg*0.35);floatText(m.x,m.y-m.h-16,'щит','#9ad8ff');}}
  if(def.hb)dmg=Math.max(1,Math.round(dmg*hbDmgMul(m)));
  if(G.dim===2)dmg=lilAbMobDmg(m,dmg);
  if(def.lm&&m.dmgMul){dmg=Math.max(1,Math.round(dmg*m.dmgMul));if(m.dmgMul<1)floatText(m.x,m.y-m.h-18,'крепко','#cfd8e8');else if(m.dmgMul>=1.5)floatText(m.x,m.y-m.h-18,'уязвим!','#ffd060');}
  if(def.boss)dmg=Math.max(1,Math.round(dmg*bfDmgMul(m)));     /* окна ×2, вне окон ×0.7 */
  m.hp-=dmg;m.hurt=0.24;SFX.mobHit(def);
  if(def.boss)bfOnBossDamage(m,dmg);
  if(settings.quality!=='low'){const hd=Math.sign(m.x-player.x)||1,hx=m.x-hd*m.w*0.3,hy=m.y-m.h*0.55;
    for(let k=0;k<5;k++){const a=(hd>0?0:Math.PI)+rnd(-0.9,0.9);spawnPart(hx,hy,Math.cos(a)*rnd(220,420),Math.sin(a)*rnd(220,420)-60,rnd(0.12,0.25),k%2?'#fff6d0':'#ffc060',rnd(1.6,2.6),600);}
    if(dmg>=m.maxHp*0.12)shockRings.push({x:hx,y:hy,r:4,max:26,t:0.2,col:'#ffe8b0'});}if(m.eShield&&G.time>(m.eShieldT||0)&&Math.random()<0.15)m.eShieldT=G.time+3;
  if(!def.boss){m.vx+=kb*180;m.vy=Math.min(m.vy,-140);}
  if(m.def.mech==='mole'&&m.state==='up')m.vy=-100;
  shake(1.8);
  if(def.hb)hbOnHit(m,dmg,src);else floatText(m.x,m.y-m.h-6,''+dmg,'#ffe066');
  burst(m.x,m.y-m.h*0.5,6,'#ff6b6b',130,3);
  if(m.hp<=0)killMob(m,false);
}
