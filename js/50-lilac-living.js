'use strict';
/* ============================================================
   ЛИЛОВЫЕ НЕБЕСА — ЖИВОЙ МИР
   · Мёд (T_HONEY) — вязкая жидкость сот: липнет и замедляет, в Иллюзии
     лечит, в Истине оказывается кровью и пугает. Воск от взрыва тает в мёд.
   · Розарий: шипастая лоза колет, а прокопанные ходы зарастают лозой.
   · Зеркальные топи: нырнёшь в зеркальную воду — мир перевернётся,
     и 10 секунд ходишь по потолку (player.grav=-1). Снова окунёшься —
     мир встанет на место.
   · Колыбель: стены «дышат» — набухают и опадают, на выдохе толкают.
   · Особая руда: звонкая (звон пугает и тянет Рассудок), живая (убегает
     по жиле, когда начинаешь копать), растущая (прорастает снова через ~20 с).
   · Пыльца: облака у цветов. В Иллюзии лечит, в Истине усыпляет.
   ============================================================ */
const LIV={hurtT:0,growT:0,flipIn:0,pollenT:3,rings:[],pollen:[],grow:new Map(),tame:new Set(),breath:0};
function lilBand2(ty){return clamp(biomeAt(ty)-10,0,6);}
function lilSetOre(tx,ty,id){
  if(ty<0||tx<0||tx>=MW)return;
  const cx=Math.floor(tx/CHUNK),cy=Math.floor(ty/CHUNK),c=getChunk(cx,cy);
  c.ores[(ty-cy*CHUNK)*CHUNK+(tx-cx*CHUNK)]=id;ccMarkDirty(tx,ty);
}
/* вид особой руды: 'ring' звонкая, 'live' живая, 'grow' растущая */
function lilOreKind(tx,ty,id){
  if(G.dim!==2||!ORES[id]||ORES[id].dim!==2)return '';
  const h=hash2(tx,ty,G.seed+91011)%100;
  if(id>=41&&id<=44)return h<35?'ring':'';
  if((id>=52&&id<=54)||(id>=58&&id<=61))return h<30?'live':'';
  if(id>=37&&id<=40)return h<40?'grow':'';
  if(id>=45&&id<=47)return h<20?'grow':'';
  return '';
}
/* копание: живая руда убегает по жиле, когда прогресс переваливает за середину */
function lilDigProgress(tx,ty,oreId,prog){
  if(G.dim!==2||!oreId||prog<0.45)return false;
  const key=tx+','+ty;if(LIV.tame.has(key)||lilOreKind(tx,ty,oreId)!=='live')return false;
  const t0=getTile(tx,ty);const cand=[];
  for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){if(!dx&&!dy)continue;const x=tx+dx,y=ty+dy,t=getTile(x,y);
    if(t===t0&&!getOre(x,y)&&!placedLadders.hasXY(x,y))cand.push([x,y]);}
  if(!cand.length)return false;
  const [nx,ny]=cand[hash2(tx,ty,G.seed+91013)%cand.length];
  lilSetOre(tx,ty,0);lilSetOre(nx,ny,oreId);LIV.tame.add(nx+','+ny);if(LIV.tame.size>500)LIV.tame.clear();
  const ax=tx*TILE+16,ay=ty*TILE+16,bx=nx*TILE+16,by=ny*TILE+16;
  for(let k=0;k<14;k++){const q=k/13;spawnPart(lerp(ax,bx,q)+rnd(-4,4),lerp(ay,by,q)+rnd(-4,4),rnd(-20,20),rnd(-20,20),0.5+q*0.4,ORES[oreId].glow,2.4,0);}
  floatText(ax,ay-18,'Руда убежала!','#ffb0d8');SFX.uiBack();
  player.digProg=0;
  return true;
}
/* добытая руда: звонкая звенит, растущая прорастёт снова */
function lilOreMined(tx,ty,oreId,mx,my){
  const k=lilOreKind(tx,ty,oreId);
  if(k==='ring'){
    LIV.rings.push({x:mx,y:my,t:0});
    if(AU.ok&&AU.ok()){const f0=[1568,1760,2093][hash2(tx,ty,3)%3];for(let i=0;i<4;i++)AU.bell(f0*(1+i*0.5),2.2-i*0.3,0.06-i*0.01,i*0.05,{ratio:1.41,index:1.4,rev:0.8});}
    player.sanity=Math.max(0,(player.sanity==null?100:player.sanity)-8);
    floatText(mx,my-30,'Звон разнёсся по пещерам…','#c8e8ff');shake(3);
  }else if(k==='grow'){
    if(LIV.grow.size<60)LIV.grow.set(tx+','+ty,{tx,ty,t:G.time+20+hash2(tx,ty,9)%8});
  }
}
/* перевёрнутая гравитация */
function lilGrav(){return (G.dim===2&&player.grav===-1)?-1:1;}
function lilFlip(on){
  if(on===(player.grav===-1))return;
  player.grav=on?-1:1;player.gravT=on?10:0;LIV.outW=false;if(!on)LIV.flipCd=G.time+4;player.vy=on?-120:60;player.onGround=false;player.peakY=player.y;player.softFall=!on;
  SFX.portal();vib(40);shake(3);
  for(let k=0;k<20;k++)spawnPart(player.x+rnd(-12,12),player.y-player.h*0.5+rnd(-20,20),rnd(-60,60),on?rnd(-160,-60):rnd(60,160),0.6,'#d8f8ff',2.6,0);
  floatText(player.x,player.y-70,on?'Зеркало перевернуло мир!':'Мир снова встал на место','#c8f0ff');
}
function lilLivingTick(dt){
  if(G.dim!==2||G.scene!=='mine'){if(player.grav===-1){player.grav=1;player.softFall=true;}LIV.pollen.length=0;LIV.rings.length=0;return;}
  const tx=Math.floor(player.x/TILE),ty=Math.floor((player.y-player.h*0.4)/TILE),band=lilBand2(Math.max(0,player.y)/TILE);
  const bodyT=getTile(tx,ty),headT=getTile(tx,Math.floor((player.y-player.h+6)/TILE));
  /* мёд */
  if(bodyT===T_HONEY){
    if(veilT<0.5){if(player.hp<player.maxHp&&player.hp>0){player.hp=Math.min(player.maxHp,player.hp+player.maxHp*0.008*dt);if(Math.random()<dt*1.5)floatText(player.x,player.y-60,'🍯','#ffd060');}}
    else{player.sanity=Math.max(0,(player.sanity||0)-2.5*dt);}
  }
  /* шипы лозы */
  LIV.hurtT-=dt;
  if(LIV.hurtT<=0&&!cheats.god){
    const l=Math.floor((player.x-player.w/2-2)/TILE),r=Math.floor((player.x+player.w/2+2)/TILE),t0=Math.floor((player.y-player.h)/TILE),b=Math.floor((player.y+2)/TILE);
    let hit=false;for(let y=t0;y<=b&&!hit;y++)for(let x=l;x<=r;x++){if(getTile(x,y)===T_LBRIAR){hit=true;break;}}
    if(hit){LIV.hurtT=0.6;hurtPlayer(Math.max(3,player.maxHp*0.012),'шипы');for(let k=0;k<4;k++)spawnPart(player.x+rnd(-8,8),player.y-24,rnd(-40,40),rnd(-60,-10),0.4,'#a01a30',2,300);}
  }
  /* Розарий: прокопанные ходы зарастают лозой */
  LIV.growT-=dt;
  if(LIV.growT<=0){LIV.growT=0.35;
    if(band===4){for(let k=0;k<14;k++){const x=tx+Math.floor(rnd(-11,12)),y=ty+Math.floor(rnd(-8,9));
      if(Math.abs(x-tx)<=2&&Math.abs(y-ty)<=3)continue;
      if(getTile(x,y)!==T_AIR||!dugTiles.has(x+','+y)||placedLadders.hasXY(x,y)||crateAtTile(x,y))continue;
      let nb=0;for(const [ax,ay] of [[1,0],[-1,0],[0,1],[0,-1]]){const t=getTile(x+ax,y+ay);if(t===T_LBRIAR||t===T_LTHORN)nb++;}
      if(nb<2||Math.random()>0.45)continue;
      setTile(x,y,T_LBRIAR);
      for(let q=0;q<6;q++)spawnPart(x*TILE+16+rnd(-10,10),y*TILE+16+rnd(-10,10),rnd(-30,30),rnd(-30,30),0.5,q%2?'#3a5a2a':'#e8d0b0',2,0);break;}}
    /* растущая руда прорастает */
    for(const [key,g] of LIV.grow){if(G.time<g.t)continue;LIV.grow.delete(key);
      if(getTile(g.tx,g.ty)!==T_AIR||placedLadders.hasXY(g.tx,g.ty)||crateAtTile(g.tx,g.ty))continue;
      if(Math.abs(g.tx*TILE+16-player.x)<TILE*1.2&&g.ty*TILE<player.y+4&&g.ty*TILE>player.y-player.h-TILE)continue;
      regenTile(g.tx,g.ty);dugTiles.delete(key);tileEpoch++;
      burst(g.tx*TILE+16,g.ty*TILE+16,10,'#9aff9a',90,2.4);}
  }
  /* зеркальная вода переворачивает мир */
  if(player.grav===-1&&!LIV.house){
    player.gravT-=dt;
    if(!isLiq(bodyT))LIV.outW=true;
    if(player.gravT<=0||band!==5||(isLiq(bodyT)&&LIV.outW))lilFlip(false);
    else if(player.gravT<2&&Math.random()<dt*8)spawnPart(player.x+rnd(-10,10),player.y-player.h*0.5,rnd(-20,20),rnd(-20,20),0.4,'#ffffff',2,0);
  }else if(band===5&&bodyT===T_WATER&&headT===T_WATER&&G.time>(LIV.flipCd||0)){LIV.flipIn+=dt;if(LIV.flipIn>0.5){LIV.flipIn=0;lilFlip(true);}}
  else LIV.flipIn=0;
  /* дыхание Колыбели: на выдохе стенки толкают от себя */
  LIV.breath=Math.sin(G.time*TAU/7);
  if(band===6&&LIV.breath>0.7&&!cheats.noclip){
    const wl=isSolid(Math.floor((player.x-player.w/2-6)/TILE),ty),wr=isSolid(Math.floor((player.x+player.w/2+6)/TILE),ty);
    if(wl&&!wr)player.vx+=260*dt;else if(wr&&!wl)player.vx-=260*dt;
  }
  /* пыльца */
  LIV.pollenT-=dt;
  if(LIV.pollenT<=0){LIV.pollenT=rnd(5,9);
    if((band===0||band===4)&&LIV.pollen.length<4){for(let k=0;k<10;k++){const x=tx+Math.floor(rnd(-14,15)),y=ty+Math.floor(rnd(-7,7));
      if(getTile(x,y)===T_AIR&&isSolid(x,y+1)&&getTile(x,y-1)===T_AIR&&Math.abs(x-tx)>4){LIV.pollen.push({x:x*TILE+16,y:y*TILE,r:58,t:0,life:rnd(12,18),vx:rnd(-6,6)});break;}}}}
  for(let i=LIV.pollen.length-1;i>=0;i--){const p=LIV.pollen[i];p.t+=dt;p.x+=p.vx*dt;p.y-=2*dt;if(p.t>p.life){LIV.pollen.splice(i,1);continue;}
    const d=Math.hypot(player.x-p.x,player.y-player.h*0.5-p.y);
    if(d<p.r*Math.min(1,p.t,(p.life-p.t))){
      if(veilT<0.5){player.hp=Math.min(player.maxHp,player.hp+player.maxHp*0.01*dt);player.sanity=Math.min(100,(player.sanity||0)+1*dt);if(!p.msg){p.msg=1;floatText(player.x,player.y-60,'Пыльца лечит','#ffe08a');}}
      else{player.fx.slow=Math.max(player.fx.slow||0,0.4);player.sanity=Math.max(0,(player.sanity||0)-2*dt);G.lilSleep=Math.min(1,(G.lilSleep||0)+dt*0.8);if(!p.msg){p.msg=1;floatText(player.x,player.y-60,'Клонит в сон…','#b0a0c0');}}
    }}
  if(G.lilSleep>0)G.lilSleep=Math.max(0,G.lilSleep-dt*0.4);
  for(let i=LIV.rings.length-1;i>=0;i--){LIV.rings[i].t+=dt;if(LIV.rings[i].t>1.6)LIV.rings.splice(i,1);}
}
/* рисование в мире (после декора): дыхание Колыбели, ростки, пыльца, звон */
function lilDrawWorld(g,tx0,tx1,ty0,ty1){
  const time=G.time,T=veilT;
  /* дыхание: набухающие складки на стенах Колыбели */
  if(ty1>=1750){const br=(LIV.breath+1)/2,amp=2+br*6;
    for(let ty=Math.max(ty0,1750);ty<=ty1;ty++)for(let tx=tx0;tx<=tx1;tx++){
      if(getTile(tx,ty)!==T_AIR)continue;const h=hash2(tx,ty,77);if(h%3)continue;
      const x=tx*TILE,y=ty*TILE,c=T>0.5?'#7a2a3a':'#c890b0',cd=T>0.5?'#4a1020':'#9a6a8a',cl=T>0.5?'#a04a5a':'#e8c0d8';
      const side=(dx,dy,px,py,rx,ry)=>{if(!isSolid(tx+dx,ty+dy))return;g.fillStyle=cd;g.beginPath();g.ellipse(px,py,rx+1,ry+1,0,0,TAU);g.fill();g.fillStyle=c;g.beginPath();g.ellipse(px,py,rx,ry,0,0,TAU);g.fill();g.fillStyle=cl;g.beginPath();g.ellipse(px-rx*0.3,py-ry*0.35,rx*0.45,ry*0.3,0,0,TAU);g.fill();};
      side(-1,0,x,y+16,amp,10);side(1,0,x+TILE,y+16,amp,10);side(0,-1,x+16,y,11,amp*0.8);side(0,1,x+16,y+TILE,11,amp*0.7);}}
  /* ростки растущей руды */
  for(const g2 of LIV.grow.values()){if(g2.tx<tx0||g2.tx>tx1||g2.ty<ty0||g2.ty>ty1)continue;const left=g2.t-time;if(left>8)continue;
    const k=clamp(1-left/8,0,1),x=g2.tx*TILE+16,y=g2.ty*TILE+TILE;g.strokeStyle='#5aa870';g.lineWidth=1.6;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x-3,y-8*k,x+1,y-14*k);g.stroke();
    g.fillStyle='#7ac890';g.beginPath();g.ellipse(x-3,y-10*k,3*k,1.6*k,-0.6,0,TAU);g.ellipse(x+4,y-12*k,3*k,1.6*k,0.6,0,TAU);g.fill();
    if(k>0.6){g.fillStyle='rgba(255,240,200,'+((k-0.6)*2)+')';g.beginPath();g.arc(x+1,y-15*k,2,0,TAU);g.fill();}}
  /* облака пыльцы */
  for(const p of LIV.pollen){const a=Math.min(1,p.t,(p.life-p.t))*0.9;if(a<=0)continue;
    for(let k=0;k<16;k++){const ang=k*2.4+time*0.3,rr=p.r*(0.25+0.7*((k*37)%10)/10),x=p.x+Math.cos(ang)*rr,y=p.y+Math.sin(ang*1.3)*rr*0.55;
      g.fillStyle=T>0.5?'rgba(150,160,130,'+(0.35*a)+')':'rgba(255,225,120,'+(0.45*a)+')';g.beginPath();g.arc(x,y,1.4+(k%3)*0.6,0,TAU);g.fill();}
    g.save();g.globalCompositeOperation='lighter';g.globalAlpha=0.25*a;g.drawImage(atmSprite(T>0.5?'spore':'pollen',32,T>0.5?'rgba(120,140,110,1)':'rgba(255,220,120,1)','rgba(0,0,0,0)'),p.x-p.r,p.y-p.r*0.6,p.r*2,p.r*1.2);g.restore();}
  /* звон: расходящиеся кольца */
  for(const r of LIV.rings){const k=r.t/1.6;g.strokeStyle='rgba(200,235,255,'+(0.7*(1-k))+')';g.lineWidth=2;for(let q=0;q<3;q++){const rr=20+(k*1.6-q*0.25)*260;if(rr>20){g.beginPath();g.arc(r.x,r.y,rr,0,TAU);g.stroke();}}}
}
/* сонливость от пыльцы в Истине: веки тяжелеют (поверх экрана) */
function lilDrawSleep(W,H){
  const s=G.lilSleep||0;if(s<0.02||G.dim!==2)return;
  const g=ctx;g.save();g.setTransform(dpr,0,0,dpr,0,0);const k=s*(0.6+0.4*Math.sin(G.time*1.4));
  g.fillStyle='rgba(10,4,14,'+(0.85*k).toFixed(3)+')';g.fillRect(0,0,W,H*0.22*k);g.fillRect(0,H-H*0.22*k,W,H*0.22*k);
  g.restore();
}
