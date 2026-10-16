'use strict';
/* ============================================================
   UPDATE
   ============================================================ */
function update(dt){
  if(G.bossDeath)updateBossDeath(dt);
  if(G.slowT>0){G.slowT-=dt;dt*=0.3;}
  qsTick(dt);if(G.wheel)dt*=0.3;                 /* пока открыто колесо предметов — замедление */
  if(G.hbStop>0){G.hbStop-=dt;dt*=0.1;}           /* короткая пауза при сильном ударе по Владыке */
  if(G.bossCut&&G.scene==='mine')updateBossCut(dt);else if(G.bossCut&&G.scene!=='mine')G.bossCut=null;
  G.time+=dt;
  Music.update();
  if(G.shake>0)G.shake=Math.max(0,G.shake-dt*40);
  if(G.exitGrace>0)G.exitGrace-=dt;

  sanityCheckInput(dt);

  if(cheats.infMoney)player.money=1e12;

  for(let i=parts.length-1;i>=0;i--){
    const p=parts[i];
    p.life-=dt;
    if(p.life<=0){parts.splice(i,1);continue;}
    p.vy+=p.grav*dt;
    p.x+=p.vx*dt;p.y+=p.vy*dt;
  }
  for(let i=floats.length-1;i>=0;i--){
    const f=floats[i];
    f.life-=dt*0.9;
    f.y+=f.vy*dt;
    if(f.life<=0)floats.splice(i,1);
  }

  if(grapple && grapple.state==='flying') updateGrapple(dt);

  updateFxLists(dt);
  try{sorterTick(dt);}catch(e){}
  if(G.scene==='cutscene'){
    if(G.cut){G.cut.t+=dt;if(G.cut.t>=G.cut.dur)finishCutscene();}else G.scene='lobby';
    return;
  }
  if(G.scene==='lobby'){
    lobbyUpdate(dt);
    G.nearBuilding=nearestBuilding();
    const targetX=lobbyPlayer.x;
    G.cam.x=lerp(G.cam.x,targetX,1-Math.pow(0.001,dt));
    G.cam.x=clamp(G.cam.x,view.W/(2*view.scale)-100,LOBBY_W-view.W/(2*view.scale)+100);
    G.cam.y=0;
    Input.jumpPressed=false;
    return;
  }
  if(G.scene!=='mine')return;

  const pd=player.y/TILE;
  if(pd>player.maxDepth)player.maxDepth=Math.floor(pd);
  const bodyT=getTile(Math.floor(player.x/TILE),Math.floor((player.y-player.h*0.4)/TILE));
  const headT=getTile(Math.floor(player.x/TILE),Math.floor((player.y-player.h+6)/TILE));
  const inWaterP=isLiq(bodyT);
  const inAcidP=(bodyT===T_ACID),inBloodP=(bodyT===T_BLOOD);
  const inLavaP=(bodyT===T_LAVA);
  if(inWaterP)player.fx.burn=0;
  /* дыхание под водой */
  if(inAcidP&&!cheats.god){player.acidT=(player.acidT||0)-dt;if(player.acidT<=0){player.acidT=0.5;hurtPlayer(6,'кислота',{poison:2});for(let k=0;k<5;k++)spawnPart(player.x+rnd(-8,8),player.y-20,rnd(-30,30),rnd(-80,-30),0.6,'#9be85a',2.4,-40);}}
  if(isLiq(headT)){
    player.air=Math.max(0,player.air-dt/14);
    if(player.air<=0&&!cheats.god){
      player.drownT=(player.drownT||0)-dt;
      if(player.drownT<=0){player.drownT=0.8;player.hp-=6;floatText(player.x,player.y-60,'-6','#6ab0ff');spawnPart(player.x,player.y-44,rnd(-10,10),rnd(-40,-10),0.7,'#bfe0ff',2.4,-60);if(player.hp<=0){player.hp=0;if(!tryRevive())playerDie();}}
    }
  }else player.air=Math.min(1,player.air+dt*1.6);
  if(inWaterP&&!player.wasInWater){SFX.splash();for(let k=0;k<10;k++)spawnPart(player.x+rnd(-8,8),player.y-player.h*0.5,rnd(-90,90),rnd(-200,-60),0.6,'#bfe0ff',2.6,500);}
  player.wasInWater=inWaterP;
  if(inWaterP&&Math.random()<0.05)spawnPart(player.x+rnd(-6,6),player.y-player.h*0.8,rnd(-6,6),rnd(-30,-15),0.8,'#cfe8ff',2,-40);

  if(player.potionCd>0)player.potionCd-=dt;
  if(player.gunCd>0)player.gunCd-=dt;
  if(player.gunAnim>0)player.gunAnim-=dt*5;
  /* зажатая кнопка «Стрелять»: автоогонь у огнестрела */
  if(Input.shootPtr!==null&&G.shootItem==='gun'&&player.gunLvl>0)fireGun(curGun(),true);

  let ax=0;
  const j=Input.joy;
  if(j.active&&Math.abs(j.dx)>0.08)ax=j.dx;
  if(Input.keys['KeyA']||Input.keys['ArrowLeft'])ax-=1;
  if(Input.keys['KeyD']||Input.keys['ArrowRight'])ax+=1;
  ax=clamp(ax,-1,1);

  updatePlayerFx(dt);
  const stunned=player.fx.stun>0||!!G.bossCut;
  if(stunned)ax=0;
  const speedK=(1+0.05*perkLv('swift'))*(cheats.superSpeed?3:1)*(player.fx.slow>0?0.5:1)*(inWaterP?(inBloodP?0.4:0.62):1)*(inLavaP?0.4:1)*(G.dim===1&&onSoulSand()?0.55:1);
  const maxV=175*speedK;
  if(ax!==0){
    player.vx+=ax*1800*speedK*dt;
    player.vx=clamp(player.vx,-maxV,maxV);
    player.facing=ax>0?1:-1;
  }else{
    player.vx*=Math.pow(0.0005,dt);
    if(Math.abs(player.vx)<4)player.vx=0;
  }

  const wantJump=(Input.jumpPressed||Input.keys['Space'])&&!stunned;
  if(player.ladderCd>0)player.ladderCd-=dt;
  const onLadder = player.ladderCd<=0 && playerOnLadder();
  player.onLadder = onLadder;
  const grappling = grapple && grapple.state==='anchored';

  if(cheats.flyMode && !grappling){
    if(j.active)player.vy = j.dy * 220 * speedK;
    else player.vy = 0;
    player.peakY = player.y;
  } else if(onLadder && !wantJump && !grappling){
    const climbInput = j.active ? j.dy : 0;
    if(Math.abs(climbInput)>0.15)player.vy = climbInput * 140;
    else player.vy = 0;
    player.peakY = player.y;
  } else if((inWaterP||inLavaP)&&!grappling){
    /* плавание: плавучесть, гребок прыжком, вверх/вниз джойстиком */
    /* плавучесть: в воде медленно тонешь, в густой крови почти держишься на плаву, в лаве вязнешь */
    player.vy+=(inLavaP?900:inBloodP?160:260)*dt;
    const cap=inLavaP?70:inBloodP?55:95;
    if(player.vy>cap)player.vy=lerp(player.vy,cap,Math.min(1,dt*6));
    /* течения и водопады сносят */
    {const fl=liqFlowAt(Math.floor(player.x/TILE),Math.floor((player.y-player.h*0.4)/TILE))||liqFlowAt(Math.floor(player.x/TILE),Math.floor((player.y-player.h*0.4)/TILE)-1);
      if(fl){player.vx+=fl.dx*320*dt;player.vy+=fl.dy*520*dt;}}
    if(j.active&&Math.abs(j.dy)>0.2)player.vy=lerp(player.vy,j.dy*(inLavaP?90:175),dt*5);
    player.peakY=player.y;
  } else if(!grappling){
    player.vy += 1500*dt;
    if(player.vy>950)player.vy=950;
    /* ранец-реактор: удерживай прыжок в воздухе */
    const jl=itemLv('jet');
    if(jl>0){
      const maxF=[0,0.9,1.5,2.3][jl];
      if(player.jetF===undefined)player.jetF=maxF;
      const hold=(Input.jumpPtr!==null||Input.keys['Space'])&&!stunned;
      if(!player.onGround&&hold&&player.jetF>0&&player.vy>-240&&!(Input.jumpPressed)){
        player.vy-=2700*dt;player.jetF-=dt;player.jetOn=0.08;
        if(Math.random()<0.8)spawnPart(player.x-player.facing*6,player.y-18,rnd(-20,20),rnd(120,220),0.25,Math.random()<0.5?'#ffd060':'#ff6a1a',rnd(2,3.5),0);
        player.peakY=player.y;
      }
    }
  }
  if(player.onGround&&itemLv('jet')>0)player.jetF=Math.min([0,0.9,1.5,2.3][itemLv('jet')],(player.jetF||0)+dt*1.5);
  if(player.jetOn>0)player.jetOn-=dt;

  if(wantJump){
    if(grappling){
      player.vy = -430;grapple = null;SFX.jump();
    } else if(player.onGround || cheats.flyMode){
      player.vy = cheats.superJump ? -900 : -520;
      player.onGround = false;
      SFX.jump();
    } else if(inWaterP||inLavaP){
      player.vy = inLavaP?(bfOn()?-360:-200):-290;SFX.jump();   /* в святилище кладку не прокопать — из лавы надо уметь выпрыгнуть */
    } else if(onLadder){
      player.vy = -340;player.ladderCd = 0.35;SFX.jump();
    }
  }
  Input.jumpPressed=false;

  if(grappling&&grapple){
    const g=grapple;
    player.vy+=1500*dt*0.22;
    const jsw=Input.joy;
    if(jsw.active&&jsw.mag>0.15)player.vx+=jsw.dx*700*dt;
    if(g.reeling){
      g.ropeLen-=640*dt;
      if(g.ropeLen<=g.pullTo){g.ropeLen=g.pullTo;g.reeling=false;}
    }else if(jsw.active&&jsw.mag>0.25){
      /* джойстик вверх/вниз: укорачиваем/удлиняем верёвку (не длиннее, чем при выстреле) */
      if(jsw.dy<-0.3)g.ropeLen=Math.max(g.minRope,g.ropeLen+jsw.dy*200*dt);
      else if(jsw.dy>0.3)g.ropeLen=Math.min(g.maxRope,g.ropeLen+jsw.dy*200*dt);
    }
    if(player.vy>700)player.vy=700;
    if(Math.abs(player.vx)>420)player.vx=Math.sign(player.vx)*420;
  }

  if(player.pull){
    const pm=player.pull.mob;
    if(!pm||!pm.alive||player.pull.t<=0||cheats.god)player.pull=null;
    else{player.pull.t-=dt;const ax=pm.x-player.x,ay=(pm.y-pm.h*0.5)-(player.y-player.h*0.5),l=Math.hypot(ax,ay)||1;
      if(l>pm.w*0.5+18){player.vx=ax/l*player.pull.str;player.vy=ay/l*player.pull.str*0.85;}else player.pull=null;
      player.peakY=player.y;}
  }
  bfDashMove(dt);                                   /* рывок с неуязвимостью */
  const wasGround=player.wasGround,vyPre=player.vy;
  player.onGround=false;
  moveX(player,player.vx*dt);
  moveY(player,player.vy*dt);
  trackFall(player);
  if(player.onGround&&!wasGround&&vyPre>240){player.landSq=Math.min(1,vyPre/700);
    const c=landDustCol();for(let k=0;k<Math.round(4+vyPre/90);k++)spawnPart(player.x+rnd(-10,10),player.y-2,rnd(-90,90),rnd(-70,-15),rnd(0.3,0.6),c,rnd(1.6,3),260);}
  player.wasGround=player.onGround;
  if(player.landSq>0)player.landSq=Math.max(0,player.landSq-dt*5);

  if(grapple && grapple.state==='anchored'){
    const g=grapple;
    const ppx=player.x, ppy=player.y-player.h*0.5;
    const rdx=ppx-g.anchorX, rdy=ppy-g.anchorY;
    const rd=Math.hypot(rdx,rdy)||1;
    if(rd>g.ropeLen){
      const rnx=rdx/rd, rny=rdy/rd, corr=g.ropeLen-rd;
      moveX(player,rnx*corr);
      moveY(player,rny*corr);
      const vDot=player.vx*rnx+player.vy*rny;
      if(vDot>0){player.vx-=vDot*rnx;player.vy-=vDot*rny;}
      player.onGround=false;
    }
  }

  if(player.onGround&&Math.abs(player.vx)>25){
    player.stepT-=dt*Math.abs(player.vx)/110;
    if(player.stepT<=0){player.stepT=0.3;SFX.step(footMat());if(settings.quality!=='low'){const c=landDustCol();for(let k=0;k<2;k++)spawnPart(player.x-player.facing*6+rnd(-3,3),player.y-1,-player.facing*rnd(10,40),rnd(-40,-10),0.35,c,rnd(1.4,2.2),200);}}
  }
  player.anim+=dt;
  if(player.onLadder&&Math.abs(player.vy)>30){player.ladT=(player.ladT||0)-dt*Math.abs(player.vy)/120;if(player.ladT<=0){player.ladT=0.36;SFX.ladder();}}
  /* стук сердца, когда здоровья меньше четверти */
  if(player.hp>0&&player.hp<player.maxHp*0.25&&!G.paused){player.heartT=(player.heartT||0)-dt;if(player.heartT<=0){player.heartT=0.55+0.9*(player.hp/(player.maxHp*0.25));SFX.heart();}}
  if(player.onLadder&&Math.abs(player.vy)>10)player.animState='run';
  else if(!player.onGround)player.animState='jump';
  else if(Math.abs(player.vx)>25)player.animState='run';
  else player.animState='idle';
  if(player.hurtCd>0)player.hurtCd-=dt;

  const ftx=Math.floor(player.x/TILE),fty=Math.floor((player.y-4)/TILE);
  if(getTile(ftx,fty)===T_LAVA && !cheats.god){
    player.lavaT-=dt;
    if(player.lavaT<=0){player.lavaT=0.55;hurtPlayer(9,'лава',{burn:3});
      for(let i=0;i<6;i++)spawnPart(player.x,player.y-10,rnd(-60,60),rnd(-160,-40),0.6,'#ff8a30',3);}
  }else player.lavaT=0;

  autoAttackUpdate(dt);
  digUpdate(dt);
  updateRegen(dt);

  spawnTimer-=dt;
  if(spawnTimer<=0){spawnTimer=rnd(0.45,0.9)/Math.max(0.2,mobRate());trySpawnMob();if(mobRate()>1.5&&Math.random()<0.5)trySpawnMob();}
  updateDrills(dt);
  simLiquids(dt);
  updateVentsAndHot(dt);
  updateMobs(dt);
  updateDeadMobs(dt);updateCrates(dt);
  updateProjectiles(dt);
  updateBeams(dt);
  updateClouds(dt);
  updateArena(dt);
  hbUpdate(dt);hbCombatTick(dt);bfTick(dt);
  checkHeartPickup();
  updateHell(dt);
  updateHellBlocks(dt);
  updateAnchors();
  updateTraps(dt);
  updatePatches(dt);
  updateHz(dt);
  ambientParticles(dt);

  let camTX=player.x+player.facing*10;
  let camTY=player.y-player.h*0.5-10;
  {const f=hbCamBias(camTX,camTY);if(f){camTX=f.x;camTY=f.y;}}
  const dx=camTX-G.cam.x, dy=camTY-G.cam.y;
  const dead=6;
  if(Math.abs(dx)>dead)G.cam.x+=dx*Math.min(1,dt*5.5);
  if(Math.abs(dy)>dead)G.cam.y+=dy*Math.min(1,dt*4.5);
  {const bc=bossCutCam();if(bc){G.cam.x=bc.x;G.cam.y=bc.y;}}
  const hw=view.W/(2*view.scale);
  G.cam.x=clamp(G.cam.x,hw,MW*TILE-hw);
}
