'use strict';
/* ============================================================
   GRAPPLE
   ============================================================ */
let grapple=null;

const aim={active:false,x:0,y:0};

/* ============================================================
   БУР
   ============================================================ */
const drills=[];
const DRILL_LVL_COST=[0,800,3000,12000,45000,150000];
const DRILL_BUY_COST=1200;                              /* сам бур покупается один раз */
const DRILL_PACK_COST=[300,800,2200,5500,13000,30000];  /* пачка ×5 одноразовых буров */
const DRILL_POWER=[90,200,700,1500,2600,5000,9000,15000,24000,38000];
const DRILL_RADIUS=[0,0,1,1,1,2,2,2,2,2];                       /* ширина туннеля = 2r+1 */
function drillPackCost(){return DRILL_PACK_COST[clamp(player.drillLvl-1,0,5)];}
/* Расходники: цена за штуку в Аду. После открытия портала Земля продаёт их по тем же ценам,
   чтобы нельзя было закупаться дёшево на Земле и тратить в Аду. */
function hellSupUnit(id){
  if(id==='lad')return 3500/20;
  if(id==='med')return 1200/3;
  if(id==='gra')return 4400/20;
  if(id==='amm'){const g=curGun();return g?Math.round(g.packCost*(g.hell?1:3)*0.88)/g.pack:0;}
  if(id==='dri')return Math.round((drillPackCost()*1.5+(player.drillLvl>6?(player.drillLvl-6)*15000:0))*0.88/100)*100/5;
  if(id==='bar')return Math.round((BARR_PACK_COST[Math.min(3,Math.max(0,player.barricadeLvl-1))]*4+(player.barricadeLvl>4?(player.barricadeLvl-4)*150000:0))*0.88/100)*100/BARR_PACK;
  return 0;
}
function hellPricesOn(){return !!(player.prog&&player.prog.hellUnlocked);}
function earthSupCost(id,base,n){return hellPricesOn()?Math.max(base,Math.round(hellSupUnit(id)*n)):base;}
function drillPower(){return DRILL_POWER[clamp(player.drillLvl-1,0,9)];}
function drillWidth(){return DRILL_RADIUS[clamp(player.drillLvl-1,0,9)]*2+1;}
function launchDrill(){
  if(G.scene!=='mine')return;
  if(!player.drillBought){floatText(player.x,player.y-64,'Бур продаётся в кузнице','#ff9a3c');SFX.uiBack();return;}
  if(player.drills<=0){
    floatText(player.x,player.y-64,'Нет буров — купи в кузнице','#ff8a8a');
    SFX.uiBack();return;
  }
  let ax,ay;
  if(aim.active){
    ax=aim.x-player.x;
    ay=aim.y-(player.y-player.h*0.5);
    const l=Math.hypot(ax,ay);
    if(l<2){ax=player.facing;ay=0;}else{ax/=l;ay/=l;}
  }else{
    floatText(player.x,player.y-64,'Сначала коснитесь экрана — укажите направление','#9be8ff');
    SFX.uiBack();return;
  }
  if(Math.abs(ax)>0.2)player.facing=ax>0?1:-1;
  player.drills--;
  drills.push({
    x:player.x+ax*20, y:player.y-player.h*0.5+ay*20,
    vx:ax*420, vy:ay*420,
    power:drillPower(), spin:0, r:DRILL_RADIUS[clamp(player.drillLvl-1,0,9)], lvl:player.drillLvl
  });
  SFX.grapple();vib(18);shake(2);
  floatText(player.x,player.y-70,'Бур пошёл!','#ffd98a');
}
function updateDrills(dt){
  for(let i=drills.length-1;i>=0;i--){
    const dr=drills[i];
    dr.spin+=dt*22;
    let dead=false;
    const steps=6;
    const sp=Math.hypot(dr.vx,dr.vy)||1;
    const nx=dr.vx/sp,ny=dr.vy/sp,px=-ny,py=nx;
    for(let s=0;s<steps&&!dead;s++){
      dr.x+=dr.vx*dt/steps;
      dr.y+=dr.vy*dt/steps;
      for(let o=-dr.r;o<=dr.r&&!dead;o++){
        const tx=Math.floor((dr.x+px*o*TILE)/TILE),ty=Math.floor((dr.y+py*o*TILE)/TILE);
        const center=(o===0);
        if(ty<0||tx<1||tx>=MW-1){if(center)dead=true;continue;}
        const t=getTile(tx,ty);
        if(t===T_BEDROCK||t===T_ARENA){if(center)dead=true;continue;}
        if(t===T_AIR||t===T_LADDER||t===T_LAVA||isLiq(t)||t===T_BARRICADE)continue;
        const ore=getOre(tx,ty);
        if(ore&&ORES[ore].tier>player.pickLvl){
          if(center){dead=true;floatText(tx*TILE+16,ty*TILE,'Нужна '+pickName(ORES[ore].tier),'#ff9a3c');}
          continue;
        }
        const cost=((ROCK_HP[t]||20)*0.5+(ore?ORES[ore].hp*0.3:0))*4;   /* прочность стала ниже — цену блока для бура пересчитали */
        if(dr.power<cost){if(center)dead=true;continue;}
        dr.power-=cost;
        setTile(tx,ty,T_AIR);
        if(ore){
          addOre(ore,1);
          floatText(tx*TILE+16,ty*TILE,'+1 '+ORES[ore].name,RARITY[ORES[ore].rar].c);
          SFX.ore();
        }
        if(settings.quality!=='low'||Math.random()<0.4)burst(tx*TILE+16,ty*TILE+16,ore?7:4,ore?ORES[ore].glow:(TILECOL[t]?TILECOL[t][0]:'#999'),130,3);
        SFX.breakBlock(t);
      }
      for(const m of mobs){
        if(!m.alive||dr.hit&&dr.hit.has(m))continue;
        if(Math.hypot(m.x-dr.x,(m.y-m.h*0.5)-dr.y)<TILE*(0.8+dr.r)){
          (dr.hit||(dr.hit=new Set())).add(m);
          damageMob(m,20+dr.lvl*30,Math.sign(dr.vx)||1);
        }
      }
    }
    if(settings.quality!=='low'&&Math.random()<0.6){
      spawnPart(dr.x,dr.y,rnd(-40,40)-nx*70,rnd(-40,40)-ny*70,0.35,'#ffb060',2,0);
    }
    if(dead||dr.power<=0){
      burst(dr.x,dr.y,14,'#ffd98a',180,3);
      drills.splice(i,1);
    }
  }
}

function fireGrapple(){
  if(G.scene!=='mine')return;
  if(!player.grappleUnlocked){
    floatText(player.x,player.y-64,'Купите пушку-крюк в кузнице','#ff9a3c');
    SFX.uiBack();return;
  }
  if(player.grappleAmmo<=0){
    floatText(player.x,player.y-64,'Нет снарядов','#ff8a8a');
    SFX.uiBack();return;
  }
  if(grapple)return;

  let ax,ay;
  if(aim.active){
    ax=aim.x-player.x;
    ay=aim.y-(player.y-player.h*0.5);
    const l=Math.hypot(ax,ay)||1;
    ax/=l;ay/=l;
  }else{
    const j=Input.joy;
    if(j.active && j.mag>0.3){
      ax=j.dx/Math.max(0.001,j.mag);
      ay=j.dy/Math.max(0.001,j.mag);
    }else{
      ax=player.facing*0.7071;
      ay=-0.7071;
    }
  }

  player.grappleAmmo--;
  if(ax>0.2)player.facing=1;
  else if(ax<-0.2)player.facing=-1;

  const sx=player.x + ax*14;
  const sy=player.y - player.h*0.5 + ay*14;

  grapple={
    x:sx, y:sy,
    vx:ax*1500, vy:ay*1500,
    state:'flying',life:0.8,dist:0,
    maxLen:GRAPPLE_RANGE*TILE,pullTime:0,ropeLen:0,maxRope:0,minRope:44,reeling:false,pullTo:0,
    anchorX:0, anchorY:0
  };

  SFX.grapple();vib(15);
}

function updateGrapple(dt){
  if(!grapple)return;
  const g=grapple;
  if(g.state==='flying'){
    const stepx=g.vx*dt, stepy=g.vy*dt;
    g.x+=stepx; g.y+=stepy;
    g.dist+=Math.hypot(stepx,stepy);
    g.life-=dt;
    if(settings.quality!=='low' && Math.random()<0.6){
      spawnPart(g.x,g.y,rnd(-20,20),rnd(-20,20),0.25,'#c8a878',2,0);
    }
    const tx=Math.floor(g.x/TILE);
    const ty=Math.floor(g.y/TILE);
    if(isSolid(tx,ty)){
      if(Math.abs(g.vx)>Math.abs(g.vy)){
        g.anchorX = g.vx>0 ? tx*TILE-2 : (tx+1)*TILE+2;
        g.anchorY = g.y;
      }else{
        g.anchorX = g.x;
        g.anchorY = g.vy>0 ? ty*TILE-2 : (ty+1)*TILE+2;
      }
      g.ropeLen=Math.min(g.dist+12,g.maxLen);
      g.maxRope=g.ropeLen;
      /* при зацепе верёвка сама подтягивает игрока на небольшое расстояние */
      g.pullTo=Math.max(g.minRope,g.ropeLen-Math.min(g.ropeLen*0.38,7*TILE));
      g.reeling=g.ropeLen>g.pullTo+4;
      g.state='anchored';
      SFX.hit();vib(20);
      burst(g.anchorX,g.anchorY,6,'#c8a878',120,2.5);
    }else if(g.dist>g.maxLen || g.life<=0 || g.x<0 || g.x>MW*TILE){
      grapple=null;return;
    }
  }else if(g.state==='anchored'){
    /* висим неограниченно: отцепление — прыжок */
  }
}
