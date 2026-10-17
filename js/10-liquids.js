'use strict';
/* ============================================================
   ВОССТАНОВЛЕНИЕ ПОРОДЫ (REGEN)
   ============================================================ */
const REGEN={
  delay:35,
  interval:1.2,
  chance:0.08,
  minDist:12,
  perPass:60,
  checkCap:1500,
  maxTiles:25000
};
const dugTiles=new Map();
/* ============================================================
   ЖИДКОСТИ: вода и лава (клеточный автомат)
   Жидкость падает вниз, скатывается по диагонали и растекается в сторону
   к ближайшему обрыву; вода + лава = обсидиан; родники подпитывают воду.
   ============================================================ */
let liqAcc=0,liqTick=0,liqCount=0;
const springT=new Map();
function rawGet(tx,ty){
  if(ty<0)return T_AIR;
  if(tx<0||tx>=MW)return T_BEDROCK;
  const c=chunks.get((tx>>4)+'_'+(ty>>4));
  if(!c)return T_BEDROCK;
  return c.tiles[((ty&15)<<4)|(tx&15)];
}
function rawSet(tx,ty,t){
  ccMarkDirty(tx,ty);
  if(ty<0||tx<0||tx>=MW)return;
  const c=chunks.get((tx>>4)+'_'+(ty>>4));
  if(!c)return;
  c.tiles[((ty&15)<<4)|(tx&15)]=t;
}
function liqFree(tx,ty){return rawGet(tx,ty)===T_AIR&&!placedLadders.hasXY(tx,ty);}
function liqSteam(x,y){
  for(let k=0;k<5;k++)spawnPart(x*TILE+16+rnd(-8,8),y*TILE+16,rnd(-14,14),rnd(-60,-20),0.9,'#cfd8e6',3,-20);
}
/* реакции жидкостей с лавой: вода -> обсидиан, кислота -> сера, кровь -> запёкшаяся плоть */
function liqReact(x,y,tt){
  const nb=[[0,1],[-1,0],[1,0],[0,-1]];
  for(const [ax,ay] of nb){
    const o=rawGet(x+ax,y+ay);
    let liq=-1,lx=0,ly=0,lavaX=0,lavaY=0;
    if(tt===T_LAVA&&isLiq(o)){liq=o;lx=x+ax;ly=y+ay;lavaX=x;lavaY=y;}
    else if(isLiq(tt)&&o===T_LAVA){liq=tt;lx=x;ly=y;lavaX=x+ax;lavaY=y+ay;}
    if(liq<0)continue;
    const res=liq===T_WATER?T_OBS:liq===T_ACID?T_SULFUR:liq===T_HONEY?T_LWAX:T_FLESH;
    if(liq===T_WATER){rawSet(lavaX,lavaY,res);rawSet(lx,ly,T_AIR);}
    else{rawSet(lavaX,lavaY,res);rawSet(lx,ly,T_AIR);}
    liqSteam(x,y);SFX.hit();
    return true;
  }
  return false;
}
/* плотность (тяжёлая жидкость тонет в лёгкой), скорость падения за такт (вязкость) */
const LIQ_DENS={9:1,23:2,22:3,54:4},LIQ_FALL={9:3,22:3,23:2,7:1,54:1};
/* направление недавнего течения в клетке — течения и водопады сносят игрока */
const liqFlow=new Map();
function liqFlowMark(x,y,dx,dy){if(liqFlow.size>4000)liqFlow.clear();liqFlow.set(x+y*MW,{dx,dy,t:G.time});}
function liqFlowAt(x,y){const f=liqFlow.get(x+y*MW);return f&&G.time-f.t<0.4?f:null;}
function liqMove(x,y,nx,ny,tt){rawSet(nx,ny,tt);rawSet(x,y,T_AIR);liqFlowMark(nx,ny,Math.sign(nx-x),Math.sign(ny-y));}
function liqSplash(x,y,tt){
  if(settings.quality==='low'||Math.random()>0.35||Math.abs(x*TILE-G.cam.x)>view.W||Math.abs(y*TILE-G.cam.y)>view.H)return;
  const c=tt===T_WATER?'#cfe8ff':tt===T_ACID?'#b8ff7a':tt===T_BLOOD?'#d01830':tt===T_HONEY?'#ffc040':'#ffb040';
  for(let k=0;k<3;k++)spawnPart(x*TILE+16+rnd(-10,10),y*TILE+4,rnd(-70,70),rnd(-170,-70),0.5,c,rnd(1.6,2.6),600);
}
/* напор: есть ли за спиной (по ряду, против направления) столб той же жидкости выше этого ряда */
function liqHead(x,y,dx,tt){
  for(let i=0;i<20;i++){const cx=x-dx*i;if(rawGet(cx,y)!==tt)return false;if(rawGet(cx,y-1)===tt)return true;}
  return false;
}
function liqStep(x,y,tt,reach){
  if(liqReact(x,y,tt))return;
  /* свободное падение: несколько клеток за такт (вязкие — медленнее) */
  if(liqFree(x,y+1)){let ny=y+1;const f=LIQ_FALL[tt]||1;for(let k=1;k<f&&liqFree(x,ny+1);k++)ny++;
    liqMove(x,y,x,ny,tt);const u=rawGet(x,ny+1);if(isLiq(u)||u===T_LAVA)liqSplash(x,ny,tt);return;}
  /* расслоение: тяжёлая жидкость опускается сквозь лёгкую */
  if(tt!==T_LAVA){const b=rawGet(x,y+1);if(isLiq(b)&&b!==tt&&(LIQ_DENS[tt]||0)>(LIQ_DENS[b]||0)&&Math.random()<0.5){rawSet(x,y+1,tt);rawSet(x,y,b);liqFlowMark(x,y+1,0,1);return;}}
  const sg=Math.random()<0.5?1:-1;
  for(let q=0;q<2;q++){
    const dx=q?-sg:sg;
    if(liqFree(x+dx,y)&&liqFree(x+dx,y+1)){liqMove(x,y,x+dx,y+1,tt);return;}
  }
  for(let q=0;q<2;q++){
    const dx=q?-sg:sg;
    for(let i=1;i<=reach;i++){
      if(!liqFree(x+dx*i,y))break;
      if(liqFree(x+dx*i,y+1)){liqMove(x,y,x+dx,y,tt);return;}
    }
  }
  /* сообщающиеся сосуды: под напором жидкость уходит вбок в прокопанный туннель, пока уровни не сравняются */
  if(tt!==T_LAVA||(liqTick%2===0)){
    for(let q=0;q<2;q++){
      const dx=q?-sg:sg;
      if(liqFree(x+dx,y)&&!liqFree(x+dx,y+1)&&liqHead(x,y,dx,tt)){liqMove(x,y,x+dx,y,tt);return;}
    }
  }
}
function simLiquids(dt){
  liqAcc+=dt;
  if(liqAcc<0.1)return;
  liqAcc=0;liqTick++;
  const lavaTick=(liqTick%3===0);
  const pcy=Math.floor(player.y/TILE/16);
  const dir=(liqTick&1)?1:-1;
  let count=0;
  const cols=Math.ceil(MW/16);
  for(let cy=pcy+3;cy>=pcy-3;cy--){
    if(cy<0)continue;
    for(let cx=0;cx<cols;cx++){
      const c=chunks.get(cx+'_'+cy);
      if(!c)continue;
      const tiles=c.tiles;
      for(let ly=15;ly>=0;ly--){
        for(let k=0;k<16;k++){
          const lx=dir>0?k:15-k;
          const t=tiles[(ly<<4)|lx];
          if(t===T_WATER){count++;liqStep(cx*16+lx,cy*16+ly,T_WATER,8);}
          else if(t===T_ACID){count++;liqStep(cx*16+lx,cy*16+ly,T_ACID,7);}
          else if(t===T_BLOOD){if(lavaTick||(liqTick&1)){count++;liqStep(cx*16+lx,cy*16+ly,T_BLOOD,4);}}
          else if(t===T_LAVA){if(lavaTick)liqStep(cx*16+lx,cy*16+ly,T_LAVA,3);}
          else if(t===T_HONEY){if(lavaTick){count++;liqStep(cx*16+lx,cy*16+ly,T_HONEY,3);}}
          else if(t===T_SPRING){
            const wx=cx*16+lx,wy=cy*16+ly,key=wx+','+wy;
            if(liqCount<700&&liqFree(wx,wy+1)&&(springT.get(key)||0)<G.time){
              rawSet(wx,wy+1,T_WATER);springT.set(key,G.time+1.1);
            }
          }
        }
      }
    }
  }
  liqCount=count;
}
/* Гейзеры в магмовых пещерах: предупреждение -> столб огня */
const VENT_CYCLE=6;
function ventPhase(x,y){return (G.time+((x*7+y*13)%VENT_CYCLE))%VENT_CYCLE;}
function ventErupting(x,y){const p=ventPhase(x,y);return p>=4.4&&p<5.6;}
function ventWarning(x,y){const p=ventPhase(x,y);return p>=3.6&&p<4.4;}
let ventT=0,hotT=0;
function openChest(wx,wy,rich){
  openedChests.add(wx+','+wy);
  const d=wy,bi=biomeAt(d);
  const money=(rich?3:1)*(G.dim===1?Math.round((3000+d*45)*rnd(0.7,1.3)):1)*(G.dim===1?1:0)+(G.dim===1?0:Math.round((120+d*1.6)*rnd(0.8,1.4)*(1+bi*0.8)));
  player.money+=money;
  if(rich){const t=clamp(bi-5,0,4);addMat(['mech','cloth','powder','soulglass','fcore'][t],1);addMat(['a7','a8','a9','a10','a11'][t],2);player.souls=(player.souls||0)+15;statAdd('bigChests');}
  statAdd('chests');
  const cand=ORES.filter(o=>o&&(o.dim||0)===G.dim&&d>=o.dmin-20&&d<=o.dmax&&o.tier<=Math.max(2,player.pickLvl+1));
  if(G.dim===1){const sl=3+Math.floor(Math.random()*6);player.souls=(player.souls||0)+sl;
    const t=clamp(biomeAt(d)-5,0,4),ores=[[18,27,19,28],[29,20,30,21],[31,22,32,23],[33,24,34,25],[35,26,36]][t];
    const o=ores[Math.floor(Math.random()*ores.length)];addMat('i'+o,1+Math.floor(Math.random()*3));
    const parts=[['fang','ember','essence'],['ichor','horn'],['gland'],['bone','essence'],['magma','ember']][t];addMat(parts[Math.floor(Math.random()*parts.length)],1+Math.floor(Math.random()*2));}
  let txt='+'+fmt(money)+' 💰';
  for(let k=0;k<2&&cand.length;k++){
    const o=cand[Math.floor(Math.random()*cand.length)];
    const n=1+Math.floor(Math.random()*3);
    addOre(o.id,n);txt+=' · '+n+'× '+o.name;
  }
  if(Math.random()<0.4){player.potions++;txt+=' · 🧪';}
  if(Math.random()<0.5){player.ladders+=5;txt+=' · 🪜×5';}
  if(player.drillBought&&Math.random()<0.3){player.drills++;txt+=' · 🛠️';}
  if(player.gunLvl>0&&Math.random()<0.45){const g=curGun();player.gunAmmo+=g.pack;txt+=' · 🔸×'+g.pack;}
  floatText(wx*TILE+16,wy*TILE-24,'Сундук!','#ffd98a');
  floatText(wx*TILE+16,wy*TILE-44,txt,'#9be8ff');
  burst(wx*TILE+16,wy*TILE+10,16,'#ffd98a',170,3);
  SFX.chest();vib(30);saveGame();
}
function glyphFloorRow(wx,wy){
  for(let k=0;k<=6;k++){if(isSolid(wx,wy+k+1))return wy+k;}
  return -1;
}
function glyphCeilRow(wx,wy){
  for(let k=0;k<=7;k++){if(isSolid(wx,wy-k-1))return wy-k;}
  return -1;
}
function checkChests(){
  const ptx=Math.floor(player.x/TILE),pty=Math.floor(player.y/TILE);
  const lst=structList(ptx-3,ptx+3,pty-10,pty+3);
  for(const q of lst){
    for(let r=0;r<q.th;r++){
      const row=q.st.tpl[r];
      for(let c=0;c<q.tw;c++){
        if(row[c]!=='C'&&row[c]!=='k')continue;
        const wx=q.px+c,wy=q.py+r;
        if(openedChests.has(wx+','+wy))continue;
        if(getTile(wx,wy)!==T_AIR)continue;
        const fy=glyphFloorRow(wx,wy);
        if(fy<0)continue;
        if(Math.abs(player.x-(wx*TILE+16))<30&&player.y>fy*TILE-6&&player.y-player.h<(fy+1)*TILE){
          if(row[c]==='k'){if(!lockedChestOpen(q)){if(G.time-(G.lockMsgT||0)>2.5){G.lockMsgT=G.time;floatText(player.x,player.y-70,'🔒 Заперто: уничтожь стражей структуры','#ff9a8a');}continue;}openChest(wx,wy,true);}
          else openChest(wx,wy);
        }
      }
    }
  }
}
function updateVentsAndHot(dt){
  checkChests();
  ventT-=dt;hotT-=dt;
  /* раскалённые блоки: небольшой урон при касании */
  const l=Math.floor((player.x-player.w/2-3)/TILE),r=Math.floor((player.x+player.w/2+3)/TILE);
  const b=Math.floor((player.y+2)/TILE),t0=Math.floor((player.y-player.h-3)/TILE),mid=Math.floor((player.y-player.h*0.5)/TILE);
  const touching=getTile(l,mid)===T_HOT||getTile(r,mid)===T_HOT||getTile(Math.floor(player.x/TILE),b)===T_HOT||getTile(Math.floor(player.x/TILE),t0)===T_HOT;
  if(touching&&!cheats.god&&hotT<=0){hotT=0.55;hurtPlayer(3,'раскалённый камень',{burn:0.8});spawnPart(player.x,player.y-20,rnd(-30,30),rnd(-60,-20),0.5,'#ff8a30',2.6,-10);}
  /* гейзеры */
  const _pd=player.y/TILE;
  if(G.dim===0&&(_pd<500||_pd>1060))return;
  if(G.dim===1&&!(_pd<260||(_pd>540&&_pd<860)))return;
  if(G.dim===2)return;
  const tx0=Math.floor(player.x/TILE)-3,ty0=Math.floor(player.y/TILE)-8;
  for(let tx=tx0;tx<=tx0+6;tx++){
    for(let ty=ty0;ty<=ty0+9;ty++){
      if(getTile(tx,ty)!==T_VENT)continue;
      if(ventErupting(tx,ty)){
        const vx=tx*TILE+16,vy=ty*TILE;
        SFX.geyser();
        if(Math.abs(player.x-vx)<18&&player.y>vy-6*TILE&&player.y<vy+8&&!cheats.god){
          if(G.dim===1&&ty>=550){hurtPlayer(16,'ядовитый гейзер',{poison:4});player.vy=Math.min(player.vy,-300);}
          else{hurtPlayer(G.dim===1?24:12,'гейзер',{burn:2});player.vy=Math.min(player.vy,-380);}
        }
      }
    }
  }
}

let regenAcc=0;
let regenTotal=0;

function recordTileMod(tx,ty,t){
  const key=tx+','+ty;
  tileMods.set(key,t);
  const cx=Math.floor(tx/CHUNK),cy=Math.floor(ty/CHUNK);
  const ck=cx+'_'+cy;
  let m=tileModsByChunk.get(ck);
  if(!m){m=new Map();tileModsByChunk.set(ck,m);}
  m.set(key,t);
}
function unrecordTileMod(tx,ty){
  const key=tx+','+ty;
  if(!tileMods.has(key))return;
  tileMods.delete(key);
  const cx=Math.floor(tx/CHUNK),cy=Math.floor(ty/CHUNK);
  const ck=cx+'_'+cy;
  const m=tileModsByChunk.get(ck);
  if(m){
    m.delete(key);
    if(m.size===0)tileModsByChunk.delete(ck);
  }
}
function applyModsToChunk(cx,cy,tiles,ores,dmg){
  const ck=cx+'_'+cy;
  const m=tileModsByChunk.get(ck);
  if(!m)return;
  for(const [key,t] of m){
    const idx=key.indexOf(',');
    const tx=+key.slice(0,idx);
    const ty=+key.slice(idx+1);
    const lx=tx-cx*CHUNK,ly=ty-cy*CHUNK;
    if(lx<0||lx>=CHUNK||ly<0||ly>=CHUNK)continue;
    const i=ly*CHUNK+lx;
    tiles[i]=t;
    ores[i]=0;
    dmg[i]=0;
  }
}

function ckey(cx,cy){return cx+'_'+cy;}
