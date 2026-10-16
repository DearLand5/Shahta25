'use strict';
/* ============================================================
   ОБЩИЕ СИСТЕМЫ МОБОВ АДА: лужи (огонь, кровь, кислота, паутина), волны по земле,
   шипы с предупреждением, притяжение, воскрешение, приманки-двойники
   ============================================================ */
const patches=[],hz=[];
function floorBelowY(x,y){let ty=Math.floor((y-4)/TILE);const tx=Math.floor(x/TILE);for(let k=0;k<8;k++){if(isSolid(tx,ty+1))return (ty+1)*TILE;ty++;}return null;}
function addPatch(x,y,w,dur,type,dps){
  const fy=floorBelowY(x,y);if(fy===null)return;
  if(patches.length>40)patches.shift();
  patches.push({x,y:fy,w,t:dur,max:dur,type,dps:dps||0,hitT:0});
}
function updatePatches(dt){
  for(let i=patches.length-1;i>=0;i--){
    const p=patches[i];p.t-=dt;if(p.t<=0){patches.splice(i,1);continue;}
    if(cheats.god)continue;
    if(Math.abs(player.x-p.x)<p.w*0.5+6&&Math.abs(player.y-p.y)<8){
      if(p.type==='blood'||p.type==='web'){player.fx.slow=Math.max(player.fx.slow||0,0.4);if(p.type==='web')player.fx.poison=Math.max(player.fx.poison||0,1);}
      p.hitT-=dt;
      if(p.hitT<=0&&p.dps>0){p.hitT=0.5;hurtPlayer(p.dps*0.5,p.type==='acid'?'кислота':p.type==='fire'?'огонь':'шипы',p.type==='fire'?{burn:2}:p.type==='acid'?{poison:2}:null);}
    }
  }
}
function drawPatches(g){
  const T=G.time;
  for(const p of patches){
    const a=Math.min(1,p.t/1.2)*Math.min(1,(p.max-p.t)*4);
    if(p.type==='fire'){
      for(let k=0;k<5;k++){const fx=p.x-p.w/2+(k+0.5)*p.w/5,fh=(8+Math.sin(T*12+k*1.9+p.x)*4)*a;
        g.fillStyle=k%2?hexA('#ffd060',0.85*a):hexA('#ff5a1a',0.8*a);g.beginPath();g.moveTo(fx-5,p.y);g.quadraticCurveTo(fx,p.y-fh*1.6,fx+5,p.y);g.closePath();g.fill();}
      g.fillStyle=hexA('#3a1008',0.6*a);g.fillRect(p.x-p.w/2,p.y-2,p.w,2);
    }else{
      const c=p.type==='blood'?'#8a0a1a':p.type==='acid'?'#7ad040':'#e8eef6';
      g.fillStyle=hexA(c,(p.type==='web'?0.35:0.75)*a);g.beginPath();g.ellipse(p.x,p.y-1.5,p.w/2,3,0,0,TAU);g.fill();
      if(p.type==='web'){g.strokeStyle=hexA('#ffffff',0.6*a);g.lineWidth=0.8;for(let k=-2;k<=2;k++){g.beginPath();g.moveTo(p.x+k*p.w/6,p.y-6);g.lineTo(p.x+k*p.w/5,p.y);g.stroke();}}
      if(p.type==='acid'&&Math.random()<0.1)spawnPart(p.x+rnd(-p.w/2,p.w/2),p.y-2,0,-20,0.6,'#b0ff60',2,-10);
    }
  }
}
function groundWave(x,y,vx,dmg,kind,src){
  const fy=floorBelowY(x,y-10);if(fy===null)return;
  projectiles.push({x,y:fy,vx,vy:0,life:2.2,dmg,color:kind==='lava'?'#ff7a2a':kind==='bone'?'#e0d8c4':'#9a8a80',size:8,owner:'mob',ground:kind,src,hitOnce:false});
}
function hzSpike(x,y,w,warn,dmg,col,fx){const fy=floorBelowY(x,y);if(fy===null)return;hz.push({type:'spike',x,y:fy,w,warn,t:0,dmg,col,fx});}
function updateHz(dt){
  for(let i=hz.length-1;i>=0;i--){
    const f=hz[i];f.t+=dt;
    if(f.type==='spike'){
      if(f.t>=f.warn&&!f.hit){f.hit=true;SFX.breakBlock();
        if(Math.abs(player.x-f.x)<f.w*0.5+8&&player.y>f.y-3*TILE&&player.y<=f.y+6&&!cheats.god)hurtPlayer(f.dmg,'шипы',f.fx);
        for(let k=0;k<6;k++)spawnPart(f.x+rnd(-f.w/2,f.w/2),f.y,rnd(-30,30),rnd(-240,-110),0.5,f.col,2.4,600);}
      if(f.t>f.warn+0.55)hz.splice(i,1);
    }else if(f.type==='decoy'){
      if(Math.hypot(player.x-f.x,(player.y-20)-(f.y-20))<26&&!f.hit){f.hit=true;f.t=f.life;burst(f.x,f.y-16,22,'#ff7a2a',200,3.4);if(!cheats.god)hurtPlayer(f.dmg,'двойник');SFX.boom();}
      if(f.t>f.life)hz.splice(i,1);
    }else if(f.type==='mslash'){if(f.t>0.22)hz.splice(i,1);}
  }
}
function drawHz(g){
  for(const f of hz){
    if(f.type==='spike'){
      if(f.t<f.warn){const a=f.t/f.warn;g.fillStyle=hexA(f.col,0.2+0.5*a*(0.6+0.4*Math.sin(f.t*30)));g.fillRect(f.x-f.w/2,f.y-5,f.w,5);
        for(let k=0;k<3;k++)g.fillRect(f.x-f.w/2+6+k*(f.w/3),f.y-4-a*6,3,4+a*6);}
      else{const k=clamp((f.t-f.warn)/0.1,0,1)*(1-clamp((f.t-f.warn-0.3)/0.25,0,1));
        for(let j=0;j<4;j++){const sx=f.x-f.w/2+(j+0.5)*f.w/4,hh=(44+((j*37)%20))*k;
          const gr=g.createLinearGradient(0,f.y,0,f.y-hh);gr.addColorStop(0,shadeHex(f.col,-0.4));gr.addColorStop(1,shadeHex(f.col,0.3));
          g.fillStyle=gr;g.beginPath();g.moveTo(sx-6,f.y);g.lineTo(sx,f.y-hh);g.lineTo(sx+6,f.y);g.closePath();g.fill();}}
    }else if(f.type==='decoy'){
      const a=(1-f.t/f.life)*0.55;g.save();g.globalAlpha=a;g.fillStyle='#ff6a2a';g.beginPath();g.ellipse(f.x,f.y-16,9,14,0,0,TAU);g.fill();
      g.beginPath();g.moveTo(f.x-6,f.y-26);g.lineTo(f.x-9,f.y-36);g.lineTo(f.x-2,f.y-28);g.moveTo(f.x+6,f.y-26);g.lineTo(f.x+9,f.y-36);g.lineTo(f.x+2,f.y-28);g.fill();
      g.fillStyle='#ffe070';g.fillRect(f.x-4,f.y-24,2,2);g.fillRect(f.x+2,f.y-24,2,2);g.restore();
    }else if(f.type==='mslash'){
      const a=1-f.t/0.22;g.save();g.translate(f.x,f.y);g.scale(f.dir,1);g.globalCompositeOperation='lighter';
      g.strokeStyle=hexA('#ff8a2a',0.9*a);g.lineWidth=6*a+2;g.beginPath();g.arc(0,0,34,-1.2,1.1);g.stroke();
      g.strokeStyle='rgba(255,240,200,'+a+')';g.lineWidth=2;g.beginPath();g.arc(0,0,34,-1,0.9);g.stroke();g.restore();
    }
  }
}
/* попадание по мобу: особые реакции */
function mobOnHit(m,src){
  const d=m.def;
  if(d.mech==='ashgolem'&&Math.hypot(player.x-m.x,player.y-m.y)<100&&Math.random()<0.3&&!relicOn('mask')){
    player.blind=Math.max(player.blind||0,1.1);for(let k=0;k<16;k++)spawnPart(m.x+rnd(-20,20),m.y-m.h*rnd(0.2,0.9),rnd(-120,120),rnd(-80,40),1,'#8a807a',4,0);
  }
  if(d.mech==='berserk')m.rageHit=0.3;
}
function popGasNear(m){for(const o of mobs){if(o!==m&&o.alive&&o.def.mech==='gasbag'&&o.state!=='swell'&&Math.hypot(o.x-m.x,o.y-m.y)<110){o.state='swell';o.st=0.8;}}}
function mobBlast(x,y,r,dmg,col){
  for(let i=0;i<18;i++){const a=Math.random()*TAU,sp=rnd(60,220);spawnPart(x,y,Math.cos(a)*sp,Math.sin(a)*sp,rnd(0.3,0.7),col,rnd(2,4),200);}
  shockRings.push({x,y,r:4,max:r,t:0,col});
  if(Math.hypot(player.x-x,player.y-player.h*0.5-y)<r)hurtPlayer(dmg,'взрыв',{burn:2});
}
function soulMult(){return (1+perkLv('harvest')*0.25)*(relicOn('moon')?1.25:1)*(ritOn('hunt')?2:1)*(ashEv&&(ashEv.id==='eclipse'||ashEv.id==='bloodmoon')?2:1);}
function mobBeam(m,ang,len,dmg,color,fx){
  let L=0;const x0=m.x,y0=m.y-m.h*0.5;
  while(L<len){if(solidAtPx(x0+Math.cos(ang)*L,y0+Math.sin(ang)*L))break;L+=8;}
  {const ex=Math.floor((x0+Math.cos(ang)*L)/TILE),ey=Math.floor((y0+Math.sin(ang)*L)/TILE);
   if(dmg>0&&getTile(ex,ey)===T_BARRICADE)damageBarricade(ex,ey,dmg);}
  beams.push({x1:x0,y1:y0,x2:x0+Math.cos(ang)*L,y2:y0+Math.sin(ang)*L,t:0.22,dmg,color,fx,done:false});
  shake(2);SFX.grapple();
}
function updateBeams(dt){
  for(let i=beams.length-1;i>=0;i--){
    const b=beams[i];b.t-=dt;
    if(!b.done){
      /* расстояние от игрока до отрезка луча */
      const px=player.x,py=player.y-player.h*0.5;
      const vx=b.x2-b.x1,vy=b.y2-b.y1,l2=vx*vx+vy*vy||1;
      let u=((px-b.x1)*vx+(py-b.y1)*vy)/l2;u=clamp(u,0,1);
      if(Math.hypot(px-(b.x1+vx*u),py-(b.y1+vy*u))<16){
        b.done=true;
        if(b.boss){if(!(G._bhit>G.time)){G._bhit=G.time+0.35;hurtPlayer(34,'луч Бездны',b.fx);}}
        else if(b.dmg>0)hurtPlayer(b.dmg,'луч',b.fx);else if(b.fx){for(const k in b.fx)player.fx[k]=Math.max(player.fx[k]||0,b.fx[k]);if(b.fx.blind)player.blind=Math.max(player.blind,b.fx.blind);}
      }
    }
    if(b.t<=0)beams.splice(i,1);
  }
}
function mobMelee(m,dmg,fx,kbx,kby){
  m.atkT=0.24;
  if(m.eDmg)dmg*=m.eDmg;if(m.elite&&m.elite.id==='vamp')m.hp=Math.min(m.maxHp,m.hp+dmg*0.8);
  if(m.elite&&m.elite.id==='fire')fx=Object.assign({},fx||m.def.fx||{},{burn:3});
  hurtPlayer(dmg,'mob',fx||m.def.fx);
  if(!cheats.god){const kb=m.x<player.x?1:-1;player.vx+=kb*(kbx||180);if(kby)player.vy=kby;}
}
function mobInWater(m){return isLiq(getTile(Math.floor(m.x/TILE),Math.floor((m.y-m.h*0.5)/TILE)));}

function updateMobs(dt){
  for(let i=mobs.length-1;i>=0;i--){
    const m=mobs[i];
    const def=m.def;
    const px=player.x,py=player.y-player.h*0.5;
    const dx=px-m.x,dy=py-(m.y-m.h*0.5);
    const dist=Math.hypot(dx,dy)||1;
    const nx=dx/dist,ny=dy/dist;
    m.anim+=dt;m.timer-=dt;m.st+=dt;
    if(m.hurt>0)m.hurt-=dt;
    if(m.atkT>0)m.atkT-=dt;
    if(m.age!==undefined&&m.age<5)m.age+=dt;
    if(m.atkCd>0)m.atkCd-=dt;
    if(m.healCd>0)m.healCd-=dt;
    if(m.shootCd>0)m.shootCd-=dt;
    if(m.cd>0)m.cd-=dt;
    if(m.provoked>0)m.provoked-=dt;
    if(m.shield>0)m.shield-=dt;
    if(m.stun>0){m.stun-=dt;}
    if(m.burn>0||m.poison>0){
      m.dotT=(m.dotT||0)-dt;
      if(m.burn>0)m.burn-=dt;if(m.poison>0)m.poison-=dt;
      if(m.dotT<=0){m.dotT=0.5;const dd=Math.round(((m.burn>0?m.burnDps||0:0)+(m.poison>0?m.poisonDps||0:0))*0.5);
        if(dd>0&&!m.invuln){m.hp-=dd;floatText(m.x+rnd(-8,8),m.y-m.h-4,''+dd,m.burn>0?'#ff9a3c':'#9aff40');if(m.hp<=0){killMob(m,false);continue;}}}
      if(Math.random()<0.3)spawnPart(m.x+rnd(-m.w*0.4,m.w*0.4),m.y-m.h*rnd(0.2,0.9),rnd(-10,10),rnd(-50,-20),0.4,m.burn>0?'#ff8a30':'#9aff40',2.2,-40);
    }
    if(m.frozen>0){m.frozen-=dt;}
    if(dist>60*TILE&&!def.boss){if(m.trapKey)trapSpawned.delete(m.trapKey);mobs.splice(i,1);continue;}
    const mtx=Math.floor(m.x/TILE),mty=Math.floor((m.y-2)/TILE);
    const inLava=getTile(mtx,mty)===T_LAVA;
    if(inLava&&!def.fly&&!def.lavaSafe&&def.mech!=='mole'){m.hp-=22*dt*3;if(m.hp<=0){killMob(m,true);continue;}}
    const inWater=mobInWater(m);
    const low0=settings.quality==='low';
    if(inWater&&G.dim===1&&getTile(Math.floor(m.x/TILE),Math.floor((m.y-m.h*0.5)/TILE))===T_BLOOD&&m.hp<m.maxHp){m.hp=Math.min(m.maxHp,m.hp+m.maxHp*0.06*dt);}
    const hostile=def.dmg>0&&(!def.neutral||m.provoked>0);
    const seen=mobLOS(m);
    if(m.mem>0)m.mem-=dt;
    const aggro=hostile&&(m.provoked>0||(def.aggro>0&&dist<def.aggro&&(seen||dist<100||m.mem>0)))&&!cheats.god;
    if(aggro)m.mem=4;            /* помнит цель ещё 4 секунды */
    let mvx=0,mvy=0,noPhys=false;
    const face=(v)=>{if(Math.abs(v)>0.05)m.facing=v>0?1:-1;};
    /* поворот к цели с «мёртвой зоной», чтобы спрайт не мельтешил, когда моб над/под игроком */
    const faceX=(v)=>{if(Math.abs(v)>14)m.facing=v>0?1:-1;};
    const wander=(k)=>{
      if(m.timer<=0){m.timer=rnd(1,2.6);m.hx=Math.random()<0.3?0:rnd(-1,1);}
      mvx=(m.hx||0)*(k||0.5);
      if(Math.abs(mvx)>0.05)face(mvx);
    };
    /* «tele» растёт — это замах (дрожь и вытягивание); если он прыгнул в 1 разом в момент выстрела --
       это уже сам удар: показываем выпад, а затухающий tele больше не трясёт модель */
    {const pt=m._pt||0;if(m.tele>=0.99&&pt<0.6&&!m.teleUp){m.atkT=0.24;}m.teleUp=m.tele>pt+1e-4&&m.tele<0.99?true:(m.tele<pt?false:m.teleUp);}
    m.tele=Math.max(0,m.tele-dt*2);m._pt=m.tele;
    m.lookX=lerp(m.lookX===undefined?nx:m.lookX,nx,Math.min(1,dt*8));
    m.lookY=lerp(m.lookY===undefined?ny:m.lookY,ny,Math.min(1,dt*8));
    if(m.state==='remains'){
      noPhys=true;m.remT-=dt;m.alpha=0.85;
      if(Math.random()<0.15)spawnPart(m.x+rnd(-14,14),m.y-4,rnd(-10,10),rnd(-40,-10),0.6,def.mech==='phoenix'?'#ff8a30':def.c1,2,-10);
      if(m.remT<=0){m.state='idle';m.st=0;m.hp=m.maxHp*0.5;m.alpha=1;burst(m.x,m.y-m.h*0.5,26,def.mech==='phoenix'?'#ffb030':def.c1,200,3.6);floatText(m.x,m.y-m.h-10,'Восстал!','#ff9a5a');SFX.portal();}
    }
    else if(m.stun>0&&def.mech!=='hboss'){m.tele=0;}
    else switch(def.mech){
      case 'skitter':{                                  /* кролик: зигзаг-прыжки; загнанный — лягается */
        if(dist<190){
          mvx=-nx*1.2;face(mvx);
          if(m.onGround&&m.timer<=0){m.vy=-330;m.timer=rnd(0.35,0.8);mvx*=1.4;}
          const wallAhead=isSolid(Math.floor((m.x+m.facing*20)/TILE),Math.floor((m.y-6)/TILE));
          if((wallAhead||dist<44)&&m.atkCd<=0&&dist<48){m.atkCd=1.0;mobMelee(m,def.dmg,null,200,-200);}
        }else wander(0.6);
        break;}
      case 'spitter':{                                  /* червь: плюёт ядом на дистанции */
        if(aggro){
          faceX(dx);
          if(dist<110)mvx=-nx*0.8;else if(dist>200)mvx=nx*0.9;
          if(m.shootCd<=0&&dist<260&&seen){
            m.tele=1;
            if(m.cd<=0){
              m.shootCd=2.4;m.cd=0.5;
              const a=Math.atan2(dy-18,dx);
              mobShoot(m,a,230,def.dmg,'#9be85a',5,{fx:{poison:4},grav:260,life:2});
              SFX.hit();
            }else m.cd=Math.max(m.cd,0.01);
          }
          if(dist<36&&m.atkCd<=0){m.atkCd=1.0;mobMelee(m,def.dmg,{poison:2});}
        }else wander(0.5);
        break;}
      case 'mole':{                                     /* крот: роется под землёй и выскакивает под ногами */
        noPhys=true;
        if(m.state==='under'){
          m.untargetable=true;m.alpha=0.45;
          m.vy=0;
          if(aggro||dist<def.aggro){
            const tgt=Math.sign(dx)*Math.min(def.spd*1.5,Math.abs(dx)*6);
            m.vx=lerp(m.vx,tgt,dt*5);faceX(dx);
            if(Math.abs(dx)<30&&Math.abs(dy)<90){m.state='rise';m.st=0;m.vx=0;}
          }else m.vx*=0.9;
          m.x+=m.vx*dt;m.x=clamp(m.x,TILE,MW*TILE-TILE);
          if(Math.random()<0.2)spawnPart(m.x+rnd(-8,8),m.gy-2,rnd(-20,20),rnd(-50,-20),0.4,'#6a5646',2,200);
        }else if(m.state==='rise'){
          m.tele=1;m.untargetable=true;
          if(m.st>0.55){m.state='up';m.st=0;m.untargetable=false;m.alpha=1;m.vy=-360;
            if(Math.abs(player.x-m.x)<44&&Math.abs(py-m.gy)<70){mobMelee(m,def.dmg,{stun:0.7},60,-380);}
            burst(m.x,m.gy,12,'#6a5646',180,3);shake(4);}
        }else if(m.state==='up'){
          m.alpha=1;m.vy+=1500*dt;m.y+=m.vy*dt;if(m.y>m.gy){m.y=m.gy;m.vy=0;}
          if(m.atkCd<=0&&dist<40){m.atkCd=0.9;mobMelee(m,def.dmg*0.7,null,160,-160);}
          mvx=dist<90?nx:0;faceX(dx);m.x+=mvx*def.spd*0.5*dt;
          if(m.st>2.4){m.state='sink';m.st=0;}
        }else if(m.state==='sink'){
          m.vy=0;m.y=Math.min(m.gy,m.y);
          if(m.st>0.4){m.state='under';m.st=0;m.untargetable=true;burst(m.x,m.gy,8,'#6a5646',120,2.5);}
        }
        break;}
      case 'drifter':{                                  /* светляк: любопытный, освещает округу */
        if(dist<220&&dist>60){mvx=nx*0.35;mvy=ny*0.35;}
        else{if(m.timer<=0){m.timer=rnd(1,2.2);m.hx=rnd(-1,1);m.hy=rnd(-0.7,0.7);}mvx=(m.hx||0)*0.5;mvy=(m.hy||0)*0.5;}
        if(Math.random()<0.06)spawnPart(m.x,m.y-6,rnd(-8,8),rnd(-8,8),0.9,'#d8ff7a',1.6,0);
        break;}
      case 'charger':{                                  /* жук: замах → таран → оглушает себя о стену */
        if(m.state==='stunned'){if(m.st>1.0){m.state='idle';m.st=0;}break;}
        if(m.state==='windup'){
          mvx=0;m.tele=Math.min(1,m.st/0.55);
          if(m.st>0.55){m.state='charge';m.st=0;m.dashT=0.5;}
        }else if(m.state==='charge'){
          mvx=m.facing*3.4;
          const wall=isSolid(Math.floor((m.x+m.facing*(m.w/2+6))/TILE),Math.floor((m.y-8)/TILE));
          if(wall){m.state='stunned';m.st=0;shake(3);burst(m.x+m.facing*16,m.y-10,8,'#8a8a7a',130,2.6);}
          else if(m.st>0.6){m.state='idle';m.st=0;}
        }else if(aggro){
          faceX(dx);mvx=nx*0.8;
          if(dist<190&&m.cd<=0){m.state='windup';m.st=0;m.cd=rnd(1.8,3);}
        }else wander(0.5);
        break;}
      case 'slammer':{                                  /* страж: замах кулаков → ударная волна, оглушение */
        if(m.state==='windup'){
          mvx=0;m.tele=Math.min(1,m.st/0.85);
          if(m.st>0.85){
            m.state='idle';m.st=0;m.cd=rnd(2.2,3.4);
            shake(8);SFX.breakBlock();
            for(let k=0;k<14;k++)spawnPart(m.x+rnd(-70,70),m.y-2,rnd(-40,40),rnd(-160,-50),0.7,'#8a8f98',3,500);
            if(player.onGround&&Math.abs(px-m.x)<110&&Math.abs(py-m.y)<70)mobMelee(m,def.dmg,{stun:0.7},320,-260);
            m.wave=0.45;
          }
        }else if(aggro){
          faceX(dx);mvx=nx*0.85;
          if(dist<100&&m.cd<=0){m.state='windup';m.st=0;}
          else if(dist>130&&dist<300&&m.shootCd<=0&&seen){
            m.shootCd=3.6;mobShoot(m,Math.atan2(dy-30,dx),240,def.dmg*0.8,'#9aa0a8',7,{grav:520,life:2.4});
          }
        }
        if(m.wave>0)m.wave-=dt;
        break;}
      case 'swooper':{                                  /* нетопырь: кружит над игроком, пикирует с укусом */
        if(m.state==='dive'){
          mvx=m.dvx;mvy=m.dvy;m.dashT=1;
          if(m.st>0.55||Math.hypot(px-m.x,py-(m.y-m.h*0.5))<20){m.state='retreat';m.st=0;}
        }else if(m.state==='retreat'){
          mvy=-1;mvx=-Math.sign(dx)*0.6;if(m.st>0.7){m.state='idle';m.st=0;}
        }else if(aggro){
          const tx2=px+Math.sin(m.anim*1.7+m.phase)*120,ty2=py-110;
          mvx=clamp((tx2-m.x)/60,-1,1);mvy=clamp((ty2-(m.y-m.h*0.5))/50,-1,1);
          faceX(dx);
          if(m.cd<=0&&dist<280&&seen&&m.state!=='windup'){
            m.state='windup';m.st=0;
          }
        }else{if(m.timer<=0){m.timer=rnd(1,2);m.hx=rnd(-1,1);m.hy=rnd(-1,1);}mvx=(m.hx||0)*0.7;mvy=(m.hy||0)*0.7;}
        if(m.state==='windup'){
          mvx=0;mvy=-0.3;m.tele=Math.min(1,m.st/0.4);
          if(m.st>0.4){m.state='dive';m.st=0;m.cd=rnd(2,3.2);const l=Math.hypot(dx,dy)||1;m.dvx=dx/l*2.4;m.dvy=dy/l*2.4;}
        }
        break;}
      case 'bomber':{                                   /* гоблин: бросает динамит по дуге */
        if(aggro){
          faceX(dx);
          if(dist<120)mvx=-nx*0.9;else if(dist>230)mvx=nx*0.8;
          if(m.shootCd<=0&&dist<310&&seen){
            m.tele=1;
            if(m.cd<=0){
              m.shootCd=2.8;m.cd=0.45;
              const t=Math.max(0.5,dist/340);
              const vx=dx/t,vy=(dy-0.5*600*t*t)/t;
              projectiles.push({x:m.x,y:m.y-m.h*0.8,vx:vx,vy:vy,life:3,dmg:def.dmg*1.4,color:'#e8a838',size:5,owner:'mob',grav:600,fuse:1.5,bomb:true,blast:60});
              SFX.hit();
            }
          }
        }else wander(0.6);
        break;}
      case 'provoke':{                                  /* краб: мирный, пока не тронешь */
        if(m.provoked>0){
          faceX(dx);mvx=nx*1.0;m.tele=0;
          if(dist<40&&m.atkCd<=0){m.atkCd=1.1;mobMelee(m,def.dmg,{bleed:1});}
        }else wander(0.4);
        break;}
      case 'swimmer':{                                  /* рыба: плавает только в воде */
        noPhys=true;
        if(!inWater){
          m.vy+=1200*dt;m.x+=m.vx*dt*0.4;m.y+=m.vy*dt;
          if(isSolid(Math.floor(m.x/TILE),Math.floor(m.y/TILE))){m.y-=m.vy*dt;m.vy=0;m.hp-=4*dt;if(m.hp<=0){killMob(m,true);continue;}}
          m.vx*=0.98;
        }else{
          if(m.timer<=0){m.timer=rnd(0.8,2.2);m.vx=rnd(-1,1)*def.spd;m.vy=rnd(-0.6,0.6)*def.spd*0.6;
            if(Math.random()<0.1)m.vy=-def.spd*3.2;}      /* иногда выпрыгивает */
          if(dist<150){m.vx=-nx*def.spd*1.2;m.vy=-ny*def.spd*0.8;}
          const nx2=m.x+m.vx*dt,ny2=m.y+m.vy*dt;
          if(getTile(Math.floor(nx2/TILE),Math.floor((m.y-4)/TILE))===T_WATER)m.x=nx2;else m.vx=-m.vx;
          if(getTile(Math.floor(m.x/TILE),Math.floor((ny2-4)/TILE))===T_WATER||m.vy<-def.spd*2)m.y=ny2;else m.vy=-m.vy*0.5;
          m.vy*=0.97;
        }
        face(m.vx);
        break;}
      case 'web':{                                      /* паук: паутина замедляет, затем прыжок с ядом */
        if(m.state==='pounce'){
          if(m.onGround&&m.st>0.2){m.state='idle';m.st=0;}
          if(dist<42&&m.atkCd<=0){m.atkCd=1.0;mobMelee(m,def.dmg,{poison:3});m.state='idle';m.st=0;}
        }else if(aggro){
          faceX(dx);
          if(dist<110)mvx=-nx*0.5;else if(dist>210)mvx=nx*0.9;
          if(m.shootCd<=0&&dist<290&&seen){
            m.shootCd=3.2;m.tele=1;
            mobShoot(m,Math.atan2(dy,dx),260,def.dmg*0.5,'#e8eef7',5,{fx:{slow:2.5},life:1.6});
          }
          if(m.cd<=0&&dist<150&&m.onGround){m.cd=rnd(2.5,3.6);m.state='pounce';m.st=0;m.vy=-420;m.vx=nx*260;}
        }else wander(0.5);
        break;}
      case 'decoy':{                                    /* светляк-обманка: заманивает; убитый даёт свет */
        if(dist<190){mvx=-nx*0.9;mvy=-ny*0.9+Math.sin(m.anim*3)*0.4;}
        else{if(m.timer<=0){m.timer=rnd(1,2.2);m.hx=rnd(-1,1);m.hy=rnd(-0.8,0.8);}mvx=(m.hx||0)*0.6;mvy=(m.hy||0)*0.6;}
        if(Math.random()<0.15)spawnPart(m.x,m.y,rnd(-10,10),rnd(-10,10),0.8,'#9be8ff',2,0);
        break;}
      case 'shielder':{                                 /* целитель: лечит и ставит щит союзникам */
        if(aggro&&dist<240){mvx=-nx*0.6;mvy=-ny*0.3;}
        else{if(m.timer<=0){m.timer=rnd(1,2);m.hx=rnd(-1,1);m.hy=rnd(-1,1);}mvx=(m.hx||0)*0.4;mvy=(m.hy||0)*0.4;}
        if(m.healCd<=0){
          m.healCd=2.8;let n=0;
          for(const o of mobs){
            if(o===m||!o.alive)continue;
            if(Math.hypot(o.x-m.x,o.y-m.y)<190){
              if(o.hp<o.maxHp){o.hp=Math.min(o.maxHp,o.hp+o.maxHp*0.2);n++;}
              if(o.def.mech!=='shielder'){o.shield=3.2;n++;}
              for(let k=0;k<4;k++)spawnPart(o.x,o.y-o.h*0.5,rnd(-40,40),rnd(-70,-10),0.7,'#7dffb0',2.6,-60);
            }
          }
          if(n)SFX.ore();
        }
        break;}
      case 'laser':{                                    /* призма: заряжает луч, видна линия прицела */
        if(m.state==='charge'){
          const want=Math.atan2(dy,dx);
          if(m.st<0.6){let da=want-m.aimA;while(da>Math.PI)da-=TAU;while(da<-Math.PI)da+=TAU;m.aimA+=da*Math.min(1,dt*7);}
          m.tele=Math.min(1,m.st/1.0);
          if(m.st>1.0){mobBeam(m,m.aimA,420,def.dmg,'#d8b8ff');m.state='idle';m.st=0;m.cd=rnd(2.4,3.6);}
        }else if(aggro){
          faceX(dx);
          if(dist<150)mvy=-0.4,mvx=-nx*0.6;else if(dist>260)mvx=nx*0.7,mvy=ny*0.5;
          if(m.cd<=0&&seen&&dist<340){m.state='charge';m.st=0;m.aimA=Math.atan2(dy,dx);}
        }else{if(m.timer<=0){m.timer=rnd(1,2);m.hx=rnd(-1,1);m.hy=rnd(-0.6,0.6);}mvx=(m.hx||0)*0.5;mvy=(m.hy||0)*0.5;}
        break;}
      case 'shell':{                                    /* черепаха: прячется в панцирь, пока рядом игрок */
        const near=dist<130||m.hurt>0;
        if(near&&m.state!=='hide'){m.state='hide';m.st=0;}
        if(m.state==='hide'){m.untargetable=true;m.hidden=true;mvx=0;if(m.st>3&&!near){m.state='idle';m.st=0;m.untargetable=false;m.hidden=false;}}
        else{m.untargetable=false;m.hidden=false;wander(0.5);}
        break;}
      case 'splitter':{                                 /* слизень: прыгает на игрока, при смерти делится */
        if(aggro){
          faceX(dx);mvx=nx*0.6;
          if(m.onGround&&m.cd<=0&&dist<200){m.cd=rnd(1.4,2.2);m.vy=-420;m.vx=nx*def.spd*3.2;m.tele=0.7;}
        }else wander(0.5);
        break;}
      case 'blinker':{                                  /* имп: собирает над головой три огонька и мечет веером; исчезает клубком дыма */
        if(m.throwT>0)m.throwT-=dt;if(m.blinkIn>0)m.blinkIn-=dt;
        if(m.blinkOut>0){mvx=0;m.blinkOut-=dt;m.untargetable=true;
          if(m.blinkOut<=0){m.untargetable=false;const B=m.blinkTo;if(B){burst(m.x,m.y-12,12,'#8a7a70',120,3);m.x=B.x;m.y=B.y;m.vx=m.vy=0;}m.blinkIn=0.24;burst(m.x,m.y-16,14,'#ff6a2a',160,3);}
          break;}
        if(aggro){
          faceX(dx);
          if(m.castT>0){mvx=0;m.castT-=dt;
            if(m.castT<=0){m.throwT=0.3;const a=Math.atan2(dy,dx);
              for(let k=-1;k<=1;k++)mobShoot(m,a+k*0.16,300,def.dmg,'#ff9a3c',6,{fx:{burn:2}});SFX.hit();}}
          else{if(dist<150)mvx=-nx*0.8;else if(dist>240)mvx=nx*0.9;
            if(m.shootCd<=0&&dist<360&&seen){m.shootCd=2.6;m.castT=0.45;}}
          if(m.cd<=0&&!(m.castT>0)&&(dist<85||Math.random()<dt*0.25)){
            m.cd=rnd(4,6);
            const side=Math.random()<0.5?-1:1;
            const nx3=player.x+side*rnd(110,200),ny3=player.y;
            const ttx=Math.floor(nx3/TILE),tty=Math.floor(ny3/TILE);
            if(getTile(ttx,tty)===T_AIR&&isSolid(ttx,tty+1)){m.blinkOut=0.22;m.blinkTo={x:ttx*TILE+16,y:(tty+1)*TILE};}
          }
        }else wander(0.5);
        break;}
      case 'bomb':{                                     /* элементаль: накаляется и взрывается */
        if(m.state==='fuse'){
          mvx=0;m.tele=Math.min(1,m.st/1.0);
          if(m.st>1.0){explode(m.x,m.y-m.h*0.5,86,def.dmg);killMob(m,true);continue;}
        }else if(aggro){
          faceX(dx);mvx=nx;
          if(dist<100){m.state='fuse';m.st=0;}
        }else wander(0.5);
        break;}
      case 'diver':{                                    /* стервятник: кружит высоко, пикирует с огнём */
        if(m.state==='dive'){
          mvx=m.dvx;mvy=m.dvy;m.dashT=1;
          if(Math.random()<0.5)spawnPart(m.x,m.y,rnd(-20,20),rnd(-20,20),0.5,'#ff8a30',3,-20);
          if(m.st>0.8||(dist<26&&m.atkCd<=0)){
            if(dist<30&&m.atkCd<=0){m.atkCd=1;mobMelee(m,def.dmg,{burn:3},200,-120);}
            m.state='climb';m.st=0;}
        }else if(m.state==='climb'){
          mvy=-1.1;mvx=Math.sign(m.dvx||1)*0.4;if(m.st>1.0){m.state='idle';m.st=0;}
        }else if(aggro){
          const tx2=px+Math.sin(m.anim*0.8+m.phase)*200,ty2=py-190;
          mvx=clamp((tx2-m.x)/80,-1,1);mvy=clamp((ty2-(m.y-m.h*0.5))/70,-1,1);faceX(dx);
          if(m.cd<=0&&seen&&dist<380){m.state='windup';m.st=0;}
        }else{if(m.timer<=0){m.timer=rnd(1,2);m.hx=rnd(-1,1);m.hy=rnd(-0.6,0.6);}mvx=(m.hx||0)*0.6;mvy=(m.hy||0)*0.6;}
        if(m.state==='windup'){
          mvx=0;mvy=-0.2;m.tele=Math.min(1,m.st/0.5);
          if(m.st>0.5){m.state='dive';m.st=0;m.cd=rnd(2.6,3.8);const l=Math.hypot(dx,dy)||1;m.dvx=dx/l*3.2;m.dvy=dy/l*3.2;}
        }
        break;}
      case 'lavawalker':{                               /* саламандра: ходит по лаве; обжигает обидчика */
        if(m.timer<=0){m.timer=rnd(1.5,3);m.vx=rnd(-1,1)*def.spd;face(m.vx);}
        if(m.provoked>0){mvx=-nx*0.6;
          if(def.shape==='h_salamander'&&dist<170&&m.cd<=0&&seen){m.cd=rnd(2.2,3);faceX(dx);const a0=Math.atan2(dy,dx);
            for(let k=0;k<6;k++)mobShoot(m,a0+rnd(-0.22,0.22),rnd(260,360),def.dmg*0.35,k%2?'#ffb040':'#ff6a1a',4.4,{life:0.55,fx:{burn:3}});
            floatText(m.x,m.y-m.h-12,'Огненное дыхание!','#ffb070');SFX.hit();}}
        if(inLava&&Math.random()<0.3)spawnPart(m.x+rnd(-10,10),m.y-4,rnd(-10,10),rnd(-50,-20),0.6,'#ffb050',2,-30);
        break;}
      case 'phantom':{                                  /* тень: блинк за спину и удар */
        m.alpha=dist<130?1:clamp(1-(dist-130)/150,0.08,1);
        if(aggro){
          faceX(dx);mvx=nx;mvy=ny*0.8;
          if(m.cd<=0&&dist<260&&dist>70){
            m.cd=rnd(3.2,4.8);
            burst(m.x,m.y-m.h*0.5,12,'#6a4ac8',150,3);
            const bx=player.x-player.facing*46,by=player.y-player.h*0.5;
            if(!solidAtPx(bx,by)){m.x=bx;m.y=by+m.h*0.5;m.facing=player.facing;burst(m.x,m.y-m.h*0.5,12,'#6a4ac8',150,3);m.atkCd=0;}
          }
        }
        break;}
      case 'thief':{                                    /* вор: крадёт руду, дымовая завеса, убегает */
        if(m.fleeT>0){
          m.fleeT-=dt;mvx=-nx*1.5;face(mvx);
        }else if(dist<40&&m.atkCd<=0&&totalOre()>0&&!cheats.god){
          m.atkCd=3.5;m.fleeT=5;
          const keys=Object.keys(player.inv);
          if(keys.length){
            const k=keys[Math.floor(Math.random()*keys.length)];
            const n=Math.min(player.inv[k],1+Math.floor(Math.random()*3));
            player.inv[k]-=n;m.loot.push({id:+k,n});
            if(player.inv[k]<=0)delete player.inv[k];
            floatText(player.x,player.y-56,'Украдено!','#ffcc55');
            player.blind=Math.max(player.blind,1.5);
            burst(m.x,m.y-12,16,'#3a3a3a',140,4);
            SFX.uiBack();
          }
        }else if(aggro){faceX(dx);mvx=nx;}
        else wander(0.6);
        break;}
      case 'colossus':{                                 /* ужас: топот волной, зов теней */
        if(m.state==='windup'){
          mvx=0;m.tele=Math.min(1,m.st/1.0);
          if(m.st>1.0){
            m.state='idle';m.st=0;m.cd=rnd(2.6,3.6);
            shake(12);SFX.breakBlock();
            for(let k=0;k<18;k++)spawnPart(m.x+rnd(-100,100),m.y-2,rnd(-60,60),rnd(-200,-60),0.8,'#6a1a48',3.4,520);
            if(player.onGround&&Math.abs(px-m.x)<150&&Math.abs(py-m.y)<80)mobMelee(m,def.dmg,{stun:0.9},420,-320);
            m.wave=0.5;
            if((m.summons=(m.summons||0)+1)%3===0&&mobs.length<mobCap()+4){
              const sd=MOBDEFS.find(d=>d.id==='shadeling');
              for(let k=0;k<2;k++)spawnMobAt(sd,m.x+rnd(-50,50),m.y-m.h);
              floatText(m.x,m.y-m.h-16,'Зов теней!','#c0a0ff');
            }
          }
        }else if(aggro){
          faceX(dx);mvx=nx*0.9;
          if(dist<130&&m.cd<=0){m.state='windup';m.st=0;}
        }
        if(m.wave>0)m.wave-=dt;
        break;}
      case 'gazer':{                                    /* глаз: взгляд ослепляет и замедляет */
        if(m.state==='gaze'){
          mvx=0;mvy=0;m.tele=Math.min(1,m.st/1.1);m.aimA=Math.atan2(dy,dx);
          if(m.st>1.1){
            m.state='idle';m.st=0;m.cd=rnd(3.5,5);
            if(seen&&dist<300){
              mobBeam(m,m.aimA,320,def.dmg*1.2,'#e8d0ff',{blind:3,slow:2});
              floatText(player.x,player.y-60,'Ослеплён!','#e8d0ff');
            }
          }
        }else if(m.state==='tears'){
          /* веер «слёз Бездны» — три самонаводящиеся капли */
          mvx=0;mvy=0;m.tele=Math.min(1,m.st/0.6);
          if(m.st>0.6){m.state='idle';m.st=0;m.shootCd=rnd(3,4.5);const a0=Math.atan2(dy,dx);
            for(let k=-1;k<=1;k++)mobShoot(m,a0+k*0.32,230,def.dmg*0.6,'#c8a0ff',4.2,{homing:1.6,life:2.6});SFX.hit();}
        }else if(m.state==='lash'){
          /* щупальца хлещут вблизи */
          mvx=nx*0.3;mvy=ny*0.3;m.tele=Math.min(1,m.st/0.35);
          if(m.st>0.35&&!m.lashed){m.lashed=true;if(dist<70)mobMelee(m,def.dmg,{slow:1.5},260,-180);burst(m.x,m.y,10,'#9a6ad0',140,2.4);}
          if(m.st>0.7){m.state='idle';m.st=0;m.lashed=false;m.atkCd=1.4;}
        }else if(aggro){
          faceX(dx);
          if(dist<170)mvx=-nx*0.5,mvy=-ny*0.3;else if(dist>240)mvx=nx*0.6,mvy=ny*0.5;
          if(dist<64&&m.atkCd<=0){m.state='lash';m.st=0;}
          else if(m.cd<=0&&seen&&dist<320){m.state='gaze';m.st=0;}
          else if(m.shootCd<=0&&seen&&dist<380){m.state='tears';m.st=0;}
        }else{if(m.timer<=0){m.timer=rnd(1,2.4);m.hx=rnd(-1,1);m.hy=rnd(-0.6,0.6);}mvx=(m.hx||0)*0.4;mvy=(m.hy||0)*0.4;}
        break;}
      case 'guardian':{                                 /* дух-хранитель: держится рядом с игроком */
        const want=70;
        if(dist>want+40){mvx=nx*0.9;mvy=ny*0.9;}
        else if(dist<want-20){mvx=-nx*0.3;mvy=-ny*0.3;}
        else{mvx=Math.sin(m.anim*1.3)*0.25;mvy=Math.cos(m.anim*1.1)*0.25;}
        break;}
      case 'boss':{noPhys=true;bossUpdate(m,dt,dx,dy,dist);break;}
      case 'hboss':{noPhys=true;hbBossUpdate(m,dt,dx,dy,dist);break;}
      case 'hbecho':{noPhys=true;hbEchoUpdate(m,dt,dx,dy,dist);break;}
      /* ======== АД: уникальные механики ======== */
      case 'hound':{                                    /* гончая: стая, вой ускоряет, прыжок оставляет огонь */
        if(!m.howled&&aggro){m.howled=true;floatText(m.x,m.y-m.h-12,'Ау-у-у!','#ff9a5a');SFX.hit();
          for(const o of mobs)if(o.def.id==='hound'&&Math.hypot(o.x-m.x,o.y-m.y)<320){o.haste=5;o.howled=true;}}
        if(m.haste>0)m.haste-=dt;const hs=m.haste>0?1.35:1;
        if(m.state==='windup'){mvx=0;faceX(dx);m.tele=Math.min(1,m.st/0.3);if(m.st>0.3){m.state='leap';m.st=0;m.vy=-430;m.lx=Math.sign(dx)||m.facing;}}
        else if(m.state==='leap'){mvx=m.lx*3.2*hs;
          if(dist<40&&m.atkCd<=0){m.atkCd=0.8;mobMelee(m,def.dmg,{burn:2},240,-160);}
          if(m.onGround&&m.st>0.18){m.state='idle';m.st=0;m.cd=rnd(1.2,2);addPatch(m.x,m.y,46,3.2,'fire',def.dmg*0.25);shake(2);}}
        else if(aggro){faceX(dx);const off=(m.phase>Math.PI?1:-1)*70,tx=dx+off;mvx=Math.sign(tx)*Math.min(1.15*hs,Math.abs(tx)/40);
          if(dist<40&&m.atkCd<=0){m.atkCd=0.9;mobMelee(m,def.dmg*0.7,null,160,0);}
          if(m.onGround&&m.cd<=0&&dist<210&&dist>46){m.state='windup';m.st=0;}}
        else wander(0.6);
        if(!low0&&Math.random()<0.25)spawnPart(m.x-m.facing*14,m.y-m.h*0.7,rnd(-10,10),rnd(-50,-20),0.4,Math.random()<0.5?'#ff7a2a':'#ffd060',2,-30);
        break;}
      case 'ashgolem':{                                 /* пепельный голем: удар с ударными волнами, пепел слепит */
        if(m.state==='remains'){noPhys=true;break;}
        if(m.state==='windup'){mvx=0;m.tele=Math.min(1,m.st/0.9);
          if(m.st>0.9){m.state='idle';m.st=0;m.cd=rnd(2.6,3.4);shake(8);SFX.breakBlock();
            for(const dir of [-1,1])groundWave(m.x+dir*24,m.y,dir*270,def.dmg*0.8,'ash',m);
            if(dist<90&&player.onGround)mobMelee(m,def.dmg,{stun:0.5},300,-240);m.wave=0.45;}}
        else if(aggro){faceX(dx);mvx=nx*0.8;if(dist<240&&m.cd<=0){m.state='windup';m.st=0;}
          if(dist<60&&m.atkCd<=0){m.atkCd=1.1;mobMelee(m,def.dmg*0.6,null,200,-100);}}
        else wander(0.4);
        if(m.wave>0)m.wave-=dt;
        break;}
      case 'wraithgrab':{                               /* пепельный призрак: невидим в буре, хватает и тянет к себе */
        m.alpha=dist<130?0.95:clamp(0.15+(420-dist)/600,0.15,0.6);if(stormOn>0&&G.dim===1)m.alpha=Math.min(m.alpha,0.12);
        if(m.state==='grab'){mvx=0;mvy=0;m.tele=Math.min(1,m.st/0.8);
          if(m.st>0.8&&!m.grabbed){m.grabbed=true;if(seen&&dist<280&&!cheats.god){player.pull={mob:m,t:1.0,str:430};SFX.grapple();}}
          if(m.st>1.7){m.state='idle';m.st=0;m.cd=rnd(4,6);m.grabbed=false;}}
        else if(aggro){faceX(dx);mvx=nx*0.9;mvy=ny*0.8;if(dist<280&&dist>80&&m.cd<=0&&seen){m.state='grab';m.st=0;}
          if(dist<44&&m.atkCd<=0){m.atkCd=0.9;mobMelee(m,def.dmg,{slow:1.5},140,-60);}}
        else{if(m.timer<=0){m.timer=rnd(1.5,3);m.hx=rnd(-1,1);m.hy=rnd(-0.5,0.5);}mvx=(m.hx||0)*0.4;mvy=(m.hy||0)*0.4;}
        break;}
      case 'fireimp':{                                  /* бес: замах и бросок огнешаров, телепорт через вспышку пламени */
        if(m.throwT>0)m.throwT-=dt;if(m.blinkIn>0)m.blinkIn-=dt;
        m.hopPh=(m.hopPh||0)+dt*(Math.abs(m.vx)>8?11:3.2);
        if(m.blinkOut>0){mvx=0;m.blinkOut-=dt;m.untargetable=true;
          if(Math.random()<0.7)spawnPart(m.x+rnd(-8,8),m.y-rnd(4,30),rnd(-20,20),rnd(-120,-60),0.4,Math.random()<0.5?'#ffb040':'#ff5a10',2.2,-80);
          if(m.blinkOut<=0){m.untargetable=false;const B=m.blinkTo;
            if(B){hz.push({type:'decoy',x:m.x,y:m.y,t:0,life:3.2,dmg:def.dmg*0.7});m.x=B.x;m.y=B.y;m.vx=m.vy=0;}
            m.blinkIn=0.3;burst(m.x,m.y-16,14,'#ff6a2a',160,3);SFX.portal&&SFX.portal();}
          break;}
        if(aggro){faceX(dx);
          if(m.castT>0){mvx=0;m.castT-=dt;
            if(m.castT<=0){m.throwT=0.32;const a=Math.atan2(dy-20,dx);
              for(const k of [-1,1])projectiles.push({x:m.x+m.facing*8,y:m.y-m.h*0.7,vx:Math.cos(a+k*0.14)*310,vy:Math.sin(a+k*0.14)*310,life:3,dmg:def.dmg*0.8,color:'#ff9a3c',size:6,owner:'mob',fx:{burn:2},bounce:2,grav:220});SFX.hit();}}
          else{if(dist<150)mvx=-nx*0.8;else if(dist>250)mvx=nx*0.9;
            if(m.shootCd<=0&&dist<400&&seen){m.shootCd=2.3;m.castT=0.42;}}
          if(m.cd<=0&&!(m.castT>0)&&(dist<80||Math.random()<dt*0.2)){m.cd=rnd(4,6);
            const side=Math.random()<0.5?-1:1,nx3=player.x+side*rnd(120,210),ttx=Math.floor(nx3/TILE),tty=Math.floor(player.y/TILE);
            if(getTile(ttx,tty-1)===T_AIR&&isSolid(ttx,tty)){m.blinkOut=0.28;m.blinkTo={x:ttx*TILE+16,y:tty*TILE};}}
          if(dist<36&&m.atkCd<=0){m.atkCd=1;m.atkT=0.24;mobMelee(m,def.dmg*0.6,{burn:2},160,-100);}}
        else wander(0.5);
        break;}
      case 'lavaworm':{                                 /* червь: плывёт в породе (неуязвим), выныривает с укусом и плевком лавы,
                                                           затем ползёт по поверхности — это окно, чтобы его бить */
        noPhys=true;if(!m.trail)m.trail=[];
        if(m.state==='idle')m.state='under';
        const wormTrail=(depth)=>{m.trail.length=0;for(let q=0;q<14;q++)m.trail.push([m.x-m.facing*q*4.6,m.y-12+Math.sin(G.time*9-q*0.8)*2.2*(q>0?1:0.4)+depth*q/13]);};
        if(m.state==='under'){
          m.untargetable=true;m.alpha=0.3;
          const tx=player.x+Math.sin(G.time+m.phase)*30,ty=player.y+50;
          const ax=tx-m.x,ay=ty-m.y,l=Math.hypot(ax,ay)||1,sp=def.spd*(aggro||dist<def.aggro?1:0.3);
          m.x+=ax/l*sp*dt;m.y+=ay/l*sp*0.8*dt;m.facing=ax>=0?1:-1;
          if(Math.random()<0.25)spawnPart(m.x+rnd(-10,10),m.y-6,rnd(-20,20),rnd(-60,-20),0.5,'#ff7a2a',2,300);
          if(dist<70&&m.cd<=0&&isSolid(Math.floor(m.x/TILE),Math.floor(m.y/TILE))){m.state='rumble';m.st=0;}
          m.trail.unshift([m.x,m.y-m.h*0.5]);if(m.trail.length>14)m.trail.length=14;
        }else if(m.state==='rumble'){m.tele=Math.min(1,m.st/0.6);if(Math.random()<0.6)spawnPart(m.x+rnd(-14,14),m.y-10,rnd(-30,30),rnd(-120,-50),0.4,'#ffb050',2.4,500);
          if(m.st>0.6){m.state='out';m.st=0;m.untargetable=false;m.alpha=1;m.vy=-560;m.vx=Math.sign(dx)*90;shake(4);burst(m.x,m.y-10,16,'#ff6a1a',200,3.4);}
          m.trail.unshift([m.x,m.y-m.h*0.5]);if(m.trail.length>14)m.trail.length=14;}
        else if(m.state==='out'){
          m.vy+=1300*dt;m.x+=m.vx*dt;m.y+=m.vy*dt;faceX(dx);
          if(dist<46&&m.atkCd<=0){m.atkCd=0.8;mobMelee(m,def.dmg,{burn:3},200,-260);}
          if(m.vy>-40&&!m.spat&&seen){m.spat=true;const T2=clamp(Math.abs(dx)/360,0.3,1),vx=dx/T2,vy=dy/T2-0.5*600*T2;
            projectiles.push({x:m.x,y:m.y-m.h*0.6,vx,vy,life:3,dmg:def.dmg*0.6,color:'#ff7a2a',size:7,owner:'mob',grav:600,lava:true,fx:{burn:3}});}
          m.trail.unshift([m.x,m.y-m.h*0.5]);if(m.trail.length>14)m.trail.length=14;
          if(m.vy>0&&solidAtPx(m.x,m.y)){
            const ty2=Math.floor(m.y/TILE),tx2=Math.floor(m.x/TILE);
            if(!isSolid(tx2,ty2-1)){m.y=ty2*TILE;m.state='crawl';m.st=0;m.vy=0;burst(m.x,m.y-4,10,'#ff6a1a',120,2.6);shake(2);}
            else{m.state='under';m.st=0;m.cd=rnd(2.5,4);m.spat=false;burst(m.x,m.y-6,14,'#ff6a1a',160,3);}}
          else if(m.st>2.4){m.state='under';m.st=0;m.cd=rnd(2.5,4);m.spat=false;}
        }else if(m.state==='crawl'){                    /* на поверхности: уязвим, ползёт к игроку и кусает */
          m.untargetable=false;m.alpha=1;faceX(dx);
          const sp=def.spd*0.55,nx2=m.x+m.facing*sp*dt,ftx=Math.floor((nx2+m.facing*14)/TILE),fty=Math.floor(m.y/TILE);
          if(Math.abs(dx)>30&&isSolid(ftx,fty)&&!isSolid(ftx,fty-1)){m.x=nx2;m.vx=m.facing*sp;}else m.vx=m.facing*1;
          m.vy=0;
          if(!isSolid(Math.floor(m.x/TILE),fty))m.y+=Math.min(300*dt,TILE);   /* край — соскальзывает вниз */
          if(dist<48&&m.atkCd<=0){m.atkCd=1;m.atkT=0.24;mobMelee(m,def.dmg*0.8,{burn:2},180,-200);}
          if(Math.random()<0.15)spawnPart(m.x-m.facing*rnd(10,50),m.y-4,rnd(-15,15),rnd(-40,-15),0.4,'#ff8a3a',1.8,200);
          wormTrail(0);
          if(m.st>2.8){m.state='sink';m.st=0;burst(m.x,m.y-6,10,'#ff6a1a',120,2.6);}
        }else if(m.state==='sink'){                     /* зарывается обратно: последние полсекунды ещё можно ударить */
          m.tele=0;m.vx=m.facing*0.5;m.vy=40;
          wormTrail(m.st*90);
          if(m.st>0.5){m.state='under';m.st=0;m.cd=rnd(3,4.5);m.spat=false;m.y+=TILE*0.6;burst(m.x,m.y-6,12,'#ff6a1a',150,3);}
        }
        break;}
      case 'hookgolem':{                                /* мясной голем: крюк-цепь притягивает, удар, сбрасывает клочья */
        if(!m.shed&&m.hp<m.maxHp*0.5){m.shed=true;const md=MOBDEFS.find(d=>d.id==='meatling');
          for(let k=0;k<3;k++){const c=spawnMobAt(md,m.x+rnd(-20,20),m.y);c.noSouls=true;c.vx=rnd(-200,200);c.vy=-300;}
          burst(m.x,m.y-m.h*0.5,26,'#a0101e',220,4);floatText(m.x,m.y-m.h-14,'Клочья мяса!','#ff7a8a');}
        if(m.state==='windup'){mvx=0;m.tele=Math.min(1,m.st/0.8);
          if(m.st>0.8){m.state='idle';m.st=0;m.cd=rnd(2.2,3.2);shake(8);SFX.breakBlock();
            for(let k=0;k<14;k++)spawnPart(m.x+rnd(-70,70),m.y-2,rnd(-40,40),rnd(-160,-50),0.7,'#8a1a2a',3,500);
            if(player.onGround&&Math.abs(px-m.x)<110&&Math.abs(py-m.y)<70)mobMelee(m,def.dmg,{stun:0.6},320,-260);m.wave=0.45;}}
        else if(m.state==='hook'){mvx=0;m.tele=Math.min(1,m.st/0.5);faceX(dx);
          if(m.st>0.5&&!m.hooked){m.hooked=true;const a=Math.atan2(dy,dx);
            projectiles.push({x:m.x+m.facing*14,y:m.y-m.h*0.6,vx:Math.cos(a)*560,vy:Math.sin(a)*560,life:0.8,dmg:def.dmg*0.35,color:'#c8c0b8',size:5,owner:'mob',hook:true,src:m});SFX.grapple();}
          if(m.st>1.3){m.state='idle';m.st=0;m.hooked=false;}}
        else if(aggro){faceX(dx);mvx=nx*0.8;
          if(dist<100&&m.cd<=0){m.state='windup';m.st=0;}
          else if(dist>150&&dist<380&&m.shootCd<=0&&seen){m.state='hook';m.st=0;m.shootCd=5;}
          if(dist<50&&m.atkCd<=0){m.atkCd=1.2;mobMelee(m,def.dmg*0.6,null,220,-120);}}
        else wander(0.4);
        if(m.wave>0)m.wave-=dt;
        break;}
      case 'bloodslime':{                               /* кровяной слизень: прыжки, кровавый след замедляет, делится */
        if(aggro){faceX(dx);mvx=nx*0.6;
          if(m.onGround&&m.cd<=0&&dist<210){m.cd=rnd(1.3,2);m.vy=-430;m.vx=nx*def.spd*3.2;m.tele=0.7;}}
        else wander(0.5);
        if(m.onGround&&Math.abs(m.vx)>10&&Math.random()<dt*1.4)addPatch(m.x,m.y,30,5,'blood',0);
        break;}
      case 'berserk':{                                  /* берсерк: ярость растёт с ранами, вихрь клинков и таран */
        m.rage=Math.min(1,(1-m.hp/m.maxHp)*1.5);const rg=1+m.rage*0.8;
        if(m.state==='spin'){mvx=Math.sign(dx)*0.7*rg;m.spinA=(m.spinA||0)+dt*22;
          if(dist<74&&m.atkCd<=0){m.atkCd=0.32;mobMelee(m,def.dmg*0.42,null,260,-120);}
          if(Math.random()<0.5)spawnPart(m.x+Math.cos(m.spinA)*30,m.y-m.h*0.5+Math.sin(m.spinA)*10,0,0,0.25,'#ff8a5a',3,0);
          if(m.st>1.4){m.state='idle';m.st=0;m.cd=rnd(2,3)/rg;}}
        else if(m.state==='windup'){mvx=0;m.tele=Math.min(1,m.st/0.5);if(m.st>0.5){m.state='charge';m.st=0;m.dashT=0.5;}}
        else if(m.state==='charge'){mvx=m.facing*3.5*rg;
          if(dist<52&&m.atkCd<=0){m.atkCd=0.8;mobMelee(m,def.dmg*1.3,{stun:0.4},400,-220);}
          const wall=isSolid(Math.floor((m.x+m.facing*(m.w/2+6))/TILE),Math.floor((m.y-8)/TILE));
          if(wall||m.st>0.65){m.state='idle';m.st=0;m.cd=rnd(1.5,2.4)/rg;if(wall){shake(3);burst(m.x+m.facing*16,m.y-12,10,'#8a3a2a',140,3);}}}
        else if(aggro){faceX(dx);mvx=nx*0.9*rg;
          if(m.cd<=0){if(dist<90){m.state='spin';m.st=0;}else if(dist<260){m.state='windup';m.st=0;}}
          if(dist<44&&m.atkCd<=0){m.atkCd=1;mobMelee(m,def.dmg*0.6,null,200,-80);}}
        else wander(0.5);
        if(m.rage>0.4&&Math.random()<0.3)spawnPart(m.x+rnd(-10,10),m.y-m.h*0.8,rnd(-10,10),rnd(-60,-20),0.6,'#c02020',2.4,-20);
        break;}
      case 'priest':{                                   /* жрец: кровяная связь лечит союзников, шипы из пола */
        if(aggro){faceX(dx);if(dist<230)mvx=-nx*0.8;else if(dist>330)mvx=nx*0.7;
          m.healT=(m.healT||0)-dt;
          if(m.healT<=0){m.healT=0.5;let best=null;for(const o of mobs){if(o!==m&&o.alive&&o.hp<o.maxHp&&!o.def.trap&&!o.def.boss&&Math.hypot(o.x-m.x,o.y-m.y)<280){if(!best||o.hp/o.maxHp<best.hp/best.maxHp)best=o;}}
            m.link=best;if(best)best.hp=Math.min(best.maxHp,best.hp+best.maxHp*0.035);}
          if(m.shootCd<=0&&seen&&dist<440){m.shootCd=3;m.tele=1;hzSpike(player.x,player.y,62,0.85,def.dmg,'#c0142a',{bleed:3});SFX.hit();}
          if(dist<40&&m.atkCd<=0){m.atkCd=1.2;mobMelee(m,def.dmg*0.5,{bleed:2},180,-100);}}
        else{wander(0.4);m.link=null;}
        break;}
      case 'scorpion':{                                 /* скорпион: кислотные плевки + подкоп и удар жалом снизу */
        if(m.state==='under'){m.untargetable=true;m.alpha=0.3;noPhys=true;
          const tgt=Math.sign(dx)*Math.min(def.spd*2,Math.abs(dx)*6);m.vx=lerp(m.vx,tgt,dt*5);m.x+=m.vx*dt;faceX(dx);
          if(Math.random()<0.3)spawnPart(m.x+rnd(-10,10),m.y-2,rnd(-20,20),rnd(-60,-20),0.4,'#a89a2a',2,300);
          if(Math.abs(dx)<26||m.st>4){m.state='strike';m.st=0;}}
        else if(m.state==='strike'){noPhys=true;m.tele=Math.min(1,m.st/0.45);
          if(m.st>0.45){m.state='idle';m.st=0;m.untargetable=false;m.alpha=1;m.vy=-300;burst(m.x,m.y-6,16,'#c8b84a',180,3);shake(4);
            if(Math.abs(player.x-m.x)<46&&Math.abs(py-m.y)<80)mobMelee(m,def.dmg*1.2,{poison:5},80,-420);}}
        else if(aggro){faceX(dx);if(dist>140)mvx=nx*0.85;else if(dist<56)mvx=-nx*0.4;
          if(m.shootCd<=0&&seen&&dist<400&&dist>70){m.shootCd=rnd(2,2.8);m.tele=1;
            const T2=clamp(Math.abs(dx)/320,0.35,1.3),vx=dx/T2,vy=dy/T2-0.5*520*T2;
            mobShoot(m,Math.atan2(vy,vx),Math.hypot(vx,vy),def.dmg*0.75,'#c8ff40',6,{grav:520,fx:{poison:3},life:3});SFX.hit();}
          if(m.cd<=0&&dist<320&&m.onGround){m.cd=rnd(7,10);m.state='under';m.st=0;burst(m.x,m.y-6,14,'#a89a2a',160,3);}
          if(dist<44&&m.atkCd<=0){m.atkCd=1;mobMelee(m,def.dmg*0.6,{poison:3},160,-80);}}
        else wander(0.4);
        break;}
      case 'acidmother':{                               /* кислотная матка: паутина-плевки, откладывает паучат */
        if(aggro){faceX(dx);if(dist>170)mvx=nx*0.9;else if(dist<90)mvx=-nx*0.6;
          if(m.shootCd<=0&&seen&&dist<380){m.shootCd=2.4;const a=Math.atan2(dy,dx);
            projectiles.push({x:m.x,y:m.y-m.h*0.5,vx:Math.cos(a)*380,vy:Math.sin(a)*380,life:2,dmg:def.dmg*0.45,color:'#d8ff90',size:5,owner:'mob',fx:{slow:2.5,poison:2},web:true});}
          m.kids=(m.kids||[]).filter(o=>o.alive);
          if(m.cd<=0&&m.kids.length<5){m.cd=rnd(6,8);const ad=MOBDEFS.find(d=>d.id==='acidling');
            for(let k=0;k<2;k++){const c=spawnMobAt(ad,m.x-m.facing*14+rnd(-8,8),m.y);c.noSouls=true;c.vy=-200;c.vx=rnd(-120,120);m.kids.push(c);}
            burst(m.x-m.facing*14,m.y-8,14,'#b0ff60',140,3);floatText(m.x,m.y-m.h-12,'Кладка!','#b0ff60');}
          if(m.onGround&&dist<130&&m.atkCd<=0&&Math.random()<dt*2.5){m.vy=-380;m.vx=nx*260;m.atkCd=1.2;}
          if(dist<44&&m.atkCd<=0.6){m.atkCd=1.2;mobMelee(m,def.dmg*0.7,{poison:4},180,-100);}}
        else wander(0.5);
        break;}
      case 'sulfurel':{                                 /* серный элементаль: ядовитая аура, серные бомбы */
        if(dist<96&&!cheats.god){m.auraT=(m.auraT||0)-dt;if(m.auraT<=0){m.auraT=0.6;hurtPlayer(def.dmg*0.15,'ядовитый газ',{poison:2});}}
        if(aggro){faceX(dx);const tx=player.x+(m.x<player.x?-1:1)*190,ty=player.y-140;mvx=clamp((tx-m.x)/80,-1,1);mvy=clamp((ty-m.y)/80,-1,1);
          if(m.shootCd<=0&&seen&&dist<440){m.shootCd=2.7;m.tele=1;const T2=clamp(Math.abs(dx)/300,0.4,1.3),vx=dx/T2,vy=dy/T2-0.5*500*T2;
            projectiles.push({x:m.x,y:m.y-m.h*0.5,vx,vy,life:3.5,dmg:def.dmg*0.8,color:'#e8d84a',size:7,owner:'mob',grav:500,sulfur:true,fx:{poison:2}});SFX.hit();}}
        else{if(m.timer<=0){m.timer=rnd(1.5,3);m.hx=rnd(-1,1);m.hy=rnd(-0.5,0.5);}mvx=(m.hx||0)*0.4;mvy=(m.hy||0)*0.4;}
        if(!low0&&Math.random()<0.3)spawnPart(m.x+rnd(-20,20),m.y-m.h*rnd(0,1),rnd(-10,10),rnd(-30,-10),1,'rgba(200,230,60,.6)',4,-10);
        break;}
      case 'toad':{                                     /* жабень: прыжки по дуге, язык притягивает, кислотный плевок */
        if(m.tongueT>0)m.tongueT-=dt;
        if(m.state==='tongue'){mvx=0;faceX(dx);m.tele=Math.min(1,m.st/0.35);
          if(m.st>0.35&&!m.tongued){m.tongued=true;if(seen&&dist<240&&!cheats.god){player.pull={mob:m,t:0.5,str:620};m.tongueT=0.5;SFX.grapple();}}
          if(m.st>0.9){m.state='idle';m.st=0;m.tongued=false;}}
        else if(aggro){faceX(dx);
          if(!m.onGround)mvx=Math.sign(m.vx||nx)*1.9;
          if(m.onGround&&m.cd<=0){if(dist<240&&seen&&Math.random()<0.5){m.state='tongue';m.st=0;m.cd=rnd(3,4.5);}else{m.vy=-580;m.vx=nx*300;m.cd=rnd(1.4,2.2);}}
          if(m.shootCd<=0&&dist<340&&seen){m.shootCd=3.5;const T2=clamp(Math.abs(dx)/300,0.35,1.1),vx=dx/T2,vy=dy/T2-0.5*560*T2;
            mobShoot(m,Math.atan2(vy,vx),Math.hypot(vx,vy),def.dmg*0.6,'#b0ff60',6,{grav:560,fx:{poison:3},life:3});}
          if(dist<44&&m.atkCd<=0){m.atkCd=1;mobMelee(m,def.dmg*0.8,{poison:2},200,-200);}}
        else wander(0.3);
        break;}
      case 'soulwraith':{                               /* страж душ: бесплотность, высасывание души, сферы */
        m.inT=(m.inT===undefined?rnd(3,6):m.inT)-dt;
        if(m.inT<=0){m.intangible=1.6;m.inT=rnd(5,7);burst(m.x,m.y-m.h*0.5,10,'#9ad8ff',120,2.6);}
        if(m.intangible>0)m.intangible-=dt;
        m.alpha=m.intangible>0?0.35:1;
        if(aggro){faceX(dx);const want=170;mvx=clamp((dist-want)/80,-1,1)*nx;mvy=clamp((dist-want)/80,-1,1)*ny-0.2;
          m.orbs=Math.min(3,(m.orbs===undefined?3:m.orbs)+dt*0.35);
          if(m.shootCd<=0&&seen&&m.orbs>=1){m.shootCd=2.2;m.orbs-=1;const a=Math.atan2(dy,dx);
            projectiles.push({x:m.x,y:m.y-m.h*0.5,vx:Math.cos(a)*200,vy:Math.sin(a)*200,life:3.5,dmg:def.dmg*0.5,color:'#9ad8ff',size:6,owner:'mob',homing:1.4,ghost:true,fx:{slow:1}});}
          if(seen&&dist<250&&m.cd<=0&&m.intangible<=0){m.drain=(m.drain||0)+dt;m.drainT=(m.drainT||0)-dt;
            if(m.drainT<=0){m.drainT=0.4;hurtPlayer(def.dmg*0.16,'высасывание души');m.hp=Math.min(m.maxHp,m.hp+def.dmg*0.3);}
            if(m.drain>2.2){m.drain=0;m.cd=rnd(3,5);}}else m.drain=0;
          if(dist<44&&m.atkCd<=0){m.atkCd=1;mobMelee(m,def.dmg*0.6,{slow:1},140,-60);}}
        else{if(m.timer<=0){m.timer=rnd(1.5,3);m.hx=rnd(-1,1);m.hy=rnd(-0.5,0.5);}mvx=(m.hx||0)*0.4;mvy=(m.hy||0)*0.4;m.drain=0;}
        break;}
      case 'bonecolossus':{                             /* костяной колосс: линия шипов, броски валунов */
        if(m.state==='windup'){mvx=0;m.tele=Math.min(1,m.st/0.9);
          if(m.st>0.9){m.state='idle';m.st=0;m.cd=rnd(3,4);shake(9);SFX.breakBlock();
            for(let k=1;k<=7;k++)hzSpike(m.x+m.facing*k*46,m.y-4,44,0.35+k*0.11,def.dmg*0.8,'#e0d8c4',{stun:0.3});
            if(dist<90&&player.onGround)mobMelee(m,def.dmg,{stun:0.6},320,-260);m.wave=0.45;}}
        else if(aggro){faceX(dx);mvx=nx*0.8;
          if(dist<320&&m.cd<=0&&Math.abs(dy)<90){m.state='windup';m.st=0;}
          else if(dist>140&&dist<420&&m.shootCd<=0&&seen){m.shootCd=3.6;const T2=clamp(Math.abs(dx)/300,0.5,1.3),vx=dx/T2,vy=dy/T2-0.5*600*T2;
            projectiles.push({x:m.x,y:m.y-m.h*0.8,vx,vy,life:3,dmg:def.dmg*0.8,color:'#d8d0bc',size:10,owner:'mob',grav:600,boulder:true});}
          if(dist<56&&m.atkCd<=0){m.atkCd=1.3;mobMelee(m,def.dmg*0.6,null,260,-140);}}
        else wander(0.4);
        if(m.wave>0)m.wave-=dt;
        break;}
      case 'necro':{                                    /* некромант: поднимает мертвецов, щит костей, телепорт */
        m.minions=(m.minions||[]).filter(o=>o.alive);m.shieldOn=m.minions.length>0;
        if(aggro){faceX(dx);if(dist<210)mvx=-nx*0.8;else if(dist>340)mvx=nx*0.7;
          if(m.cd<=0&&m.minions.length<3){m.cd=rnd(6,8);m.tele=1;const sd=MOBDEFS.find(d=>d.id==='skelminion');
            for(let k=0;k<2;k++){const x=m.x+(k?1:-1)*rnd(40,80);const c=spawnMobAt(sd,x,m.y);c.noSouls=true;c.stun=0.8;m.minions.push(c);
              for(let j=0;j<12;j++)spawnPart(x+rnd(-12,12),m.y-rnd(0,30),rnd(-20,20),rnd(-90,-30),0.8,'#7affb0',2.4,-20);}SFX.portal();}
          if(dist<90&&m.shootCd<=0){m.shootCd=4.5;const side=player.x<m.x?1:-1,nx3=m.x+side*220,ttx=Math.floor(nx3/TILE),tty=Math.floor(m.y/TILE);
            if(getTile(ttx,tty-1)===T_AIR&&getTile(ttx,tty-2)===T_AIR&&isSolid(ttx,tty)){burst(m.x,m.y-20,16,'#7affb0',160,3);m.x=ttx*TILE+16;burst(m.x,m.y-20,16,'#7affb0',160,3);}}
          else if(m.shootCd<=0&&seen&&dist<420){m.shootCd=2.3;const a=Math.atan2(dy,dx);
            projectiles.push({x:m.x+m.facing*10,y:m.y-m.h*0.7,vx:Math.cos(a)*260,vy:Math.sin(a)*260,life:3,dmg:def.dmg*0.6,color:'#7affb0',size:6,owner:'mob',homing:0.9,fx:{slow:1.2}});}}
        else wander(0.3);
        break;}
      case 'skullswarm':{                               /* черепокрылы: рой, рывки, проклятие-замедление */
        if(aggro){const j=Math.sin(G.time*6+m.phase*3);faceX(dx);mvx=nx+j*0.5;mvy=ny+Math.cos(G.time*5+m.phase)*0.6;
          if(dist<36&&m.atkCd<=0){m.atkCd=0.9;mobMelee(m,def.dmg,{slow:1.5},120,-60);}
          if(m.cd<=0&&dist<200){m.cd=rnd(2,3);m.dashT=0.35;}}
        else{if(m.timer<=0){m.timer=rnd(1,2);m.hx=rnd(-1,1);m.hy=rnd(-0.6,0.6);}mvx=(m.hx||0)*0.6;mvy=(m.hy||0)*0.6;}
        break;}
      case 'infernal':{                                 /* инфернал: топот с лавовыми волнами, зов метеоров */
        if(m.state==='windup'){mvx=0;m.tele=Math.min(1,m.st/1.0);
          if(m.st>1.0){m.state='idle';m.st=0;m.cd=rnd(2.6,3.6);shake(12);SFX.breakBlock();
            for(const dir of [-1,1])groundWave(m.x+dir*30,m.y,dir*300,def.dmg*0.7,'lava',m);
            if(player.onGround&&Math.abs(px-m.x)<150&&Math.abs(py-m.y)<80)mobMelee(m,def.dmg,{stun:0.8,burn:3},420,-320);m.wave=0.5;}}
        else if(aggro){faceX(dx);mvx=nx*0.85;
          if(dist<150&&m.cd<=0){m.state='windup';m.st=0;}
          if(m.shootCd<=0&&dist<480&&seen){m.shootCd=rnd(8,11);m.tele=1;floatText(m.x,m.y-m.h-16,'Звездопад!','#ffb080');
            for(let k=0;k<4;k++)hellFx.push({type:'meteor',x:clamp(player.x+rnd(-160,160)*(k?1:0),2*TILE,(MW-2)*TILE),y:player.y-13*TILE,vy:200,t:-k*0.25,warn:0.9,dmg:def.dmg*0.6});}
          if(dist<64&&m.atkCd<=0){m.atkCd=1.2;mobMelee(m,def.dmg*0.6,{burn:2},260,-140);}}
        if(m.wave>0)m.wave-=dt;
        break;}
      case 'magmael':{                                  /* ядерный элементаль: стреляет орбитальной лавой, затем взрывается */
        m.rocks=Math.min(3,(m.rocks===undefined?3:m.rocks)+dt*0.3);
        if(m.state==='fuse'){mvx=0;m.tele=Math.min(1,m.st/1.0);if(m.st>1.0){explode(m.x,m.y-m.h*0.5,90,def.dmg);m.noSouls=false;killMob(m,true);continue;}}
        else if(aggro){faceX(dx);mvx=nx*0.7;
          if(m.shootCd<=0&&seen&&dist<380&&m.rocks>=1){m.shootCd=1.4;m.rocks-=1;const T2=clamp(Math.abs(dx)/340,0.35,1.1),vx=dx/T2,vy=dy/T2-0.5*560*T2;
            projectiles.push({x:m.x,y:m.y-m.h*0.7,vx,vy,life:3,dmg:def.dmg*0.35,color:'#ff7a2a',size:6,owner:'mob',grav:560,lava:true,fx:{burn:2}});}
          if(dist<90){m.state='fuse';m.st=0;}}
        else wander(0.5);
        break;}
      case 'phoenix':{                                  /* огнекрыл: пикирует, оставляя огненный след; возрождается из яйца */
        if(m.state==='dive'){mvx=m.dvx;mvy=m.dvy;m.dashT=1;
          if(Math.random()<0.6)spawnPart(m.x,m.y,rnd(-20,20),rnd(-20,20),0.5,'#ff8a30',3.4,-20);
          if(m.st>0.2&&Math.random()<dt*6)addPatch(m.x,m.y+20,34,2.5,'fire',def.dmg*0.2);
          if(dist<34&&m.atkCd<=0){m.atkCd=1;mobMelee(m,def.dmg,{burn:4},220,-140);}
          if(m.st>0.85){m.state='climb';m.st=0;}}
        else if(m.state==='climb'){mvy=-1.1;mvx=Math.sign(m.dvx||1)*0.4;if(m.st>1){m.state='idle';m.st=0;}}
        else if(m.state==='windup'){mvx=0;mvy=-0.2;m.tele=Math.min(1,m.st/0.45);if(m.st>0.45){m.state='dive';m.st=0;m.cd=rnd(2.4,3.4);const l=Math.hypot(dx,dy)||1;m.dvx=dx/l*3.3;m.dvy=dy/l*3.3;}}
        else if(aggro){const tx2=px+Math.sin(m.anim*0.8+m.phase)*200,ty2=py-200;mvx=clamp((tx2-m.x)/80,-1,1);mvy=clamp((ty2-(m.y-m.h*0.5))/70,-1,1);faceX(dx);
          if(m.cd<=0&&seen&&dist<400){m.state='windup';m.st=0;}}
        else{if(m.timer<=0){m.timer=rnd(1,2);m.hx=rnd(-1,1);m.hy=rnd(-0.6,0.6);}mvx=(m.hx||0)*0.6;mvy=(m.hy||0)*0.6;}
        break;}
      case 'blademaster':{                              /* огненный мечник: серия из трёх огненных рассечений */
        if(m.state==='combo'){const k=Math.floor(m.st/0.38);mvx=m.facing*((m.st%0.38)<0.14?3:0.2);
          if(k!==m.lastSlash&&k<3){m.lastSlash=k;hz.push({type:'mslash',x:m.x+m.facing*24,y:m.y-m.h*0.55,dir:m.facing,t:0});SFX.hit();
            if(dist<90&&Math.sign(dx)===m.facing)mobMelee(m,def.dmg*0.55,{burn:2},220,-100);addPatch(m.x+m.facing*30,m.y,40,3,'fire',def.dmg*0.2);}
          if(m.st>1.2){m.state='idle';m.st=0;m.cd=rnd(1.8,2.8);}}
        else if(aggro){faceX(dx);mvx=nx*1.0;if(dist<170&&m.cd<=0&&Math.abs(dy)<80){m.state='combo';m.st=0;m.lastSlash=-1;}}
        else wander(0.5);
        break;}
      case 'magmacrab':{                                /* магмовый краб: плевки магмой, прячется в панцирь */
        if(m.state==='shell'){mvx=0;if(m.st>2.6){m.state='idle';m.st=0;}}
        else if(aggro){faceX(dx);mvx=(dist>220?nx:dist<120?-nx*0.4:0)*0.8;
          if(m.shootCd<=0&&seen&&dist<400){m.shootCd=2.4;m.tele=1;for(const sp of [-0.12,0.12]){const T2=clamp(Math.abs(dx)/320,0.4,1.2),vx=dx/T2,vy=dy/T2-0.5*560*T2;
            projectiles.push({x:m.x+m.facing*16,y:m.y-m.h*0.6,vx:vx*(1+sp),vy,life:3,dmg:def.dmg*0.45,color:'#ff7a2a',size:6,owner:'mob',grav:560,lava:true,fx:{burn:2}});}}
          if(m.hp<m.maxHp*0.5&&!m.shelled){m.shelled=true;m.state='shell';m.st=0;floatText(m.x,m.y-m.h-12,'Спрятался!','#ffb070');}
          if(dist<52&&m.atkCd<=0){m.atkCd=1.1;mobMelee(m,def.dmg*0.7,{burn:2},260,-140);}}
        else wander(0.4);
        break;}
      case 'minion':{
        if(aggro){faceX(dx);mvx=nx*1.0;if(dist<34&&m.atkCd<=0){m.atkCd=0.9;mobMelee(m,def.dmg,def.fx,140,-80);}}else wander(0.5);
        break;}
      case 'lostsoul':{                                 /* заблудшая душа: выползает из песка, тянется сквозь стены, высасывает тепло и души */
        if(m.emerge>0){m.emerge-=dt*1.2;noPhys=true;m.y-=26*dt;m.alpha=1-m.emerge*0.7;break;}
        m.alpha=0.85+0.15*Math.sin(G.time*3+m.phase);
        if(aggro||dist<300){faceX(dx);mvx=nx*0.9+Math.sin(G.time*2+m.phase)*0.3;mvy=ny*0.9+Math.cos(G.time*1.7+m.phase)*0.3;
          if(dist<30&&m.atkCd<=0){m.atkCd=1.1;mobMelee(m,def.dmg,{slow:1.2},120,-80);if((player.souls||0)>0){player.souls=Math.max(0,player.souls-1);floatText(player.x,player.y-70,'−1 👻','#9ad8ff');}}}
        else{mvx=Math.sin(G.time*0.7+m.phase)*0.4;mvy=Math.cos(G.time*0.6+m.phase)*0.3;}
        break;}
      case 'turret':{                                   /* череп-турель: заряжается и бьёт очередью из 3 огнешаров */
        noPhys=true;m.facing=dx>=0?1:-1;
        if(dist<def.aggro&&seen){
          if(m.burstN>0){m.burstT-=dt;if(m.burstT<=0){m.burstT=0.16;m.burstN--;const a=Math.atan2(dy,dx)+rnd(-0.07,0.07);
            mobShoot(m,a,340,def.dmg*(m.sc||1),'#ff7a2a',6,{fx:{burn:2}});SFX.hit();m.jaw=1;}}
          else if(m.cd<=0){m.ch=(m.ch||0)+dt*1.8;if(m.ch>=1){m.ch=0;m.burstN=3;m.burstT=0;m.cd=2.6;}}
        }else m.ch=Math.max(0,(m.ch||0)-dt);
        if(m.jaw>0)m.jaw-=dt*4;
        break;}
      case 'pod':{                                      /* кокон: выводит тварей, пока цел */
        noPhys=true;m.minions=(m.minions||[]).filter(o=>o.alive);
        if(dist<def.aggro&&m.cd<=0&&m.minions.length<3){
          m.cd=5.5;const pool=pickBiomeMobs(m.y/TILE,true);const sd=pool[Math.floor(Math.random()*pool.length)];
          if(sd){const c=spawnMobAt(sd,m.x+rnd(-14,14),m.y-2);c.noSouls=true;m.minions.push(c);m.ch=1;burst(m.x,m.y-m.h*0.6,18,'#a0101e',160,3.4);SFX.hit();}
        }
        if(m.ch>0)m.ch-=dt*1.5;
        break;}
      case 'rift':{                                     /* кристалл разлома: призывает элитных врагов */
        noPhys=true;if(m.gy0===undefined)m.gy0=m.y;m.y=m.gy0+Math.sin(G.time*1.5+m.phase)*6;
        m.minions=(m.minions||[]).filter(o=>o.alive);
        if(dist<def.aggro&&m.cd<=0&&m.minions.length<2){
          m.cd=8;const pool=pickBiomeMobs(m.y/TILE,false);const sd=pool[Math.floor(Math.random()*pool.length)];
          if(sd){const ang=Math.random()*TAU,x=m.x+Math.cos(ang)*60;const c=spawnMobAt(sd,x,sd.fly?m.y-20:m.gy0+40);makeElite(c);m.minions.push(c);
            pBeams.push({pts:zigzag(m.x,m.y-m.h*0.5,c.x,c.y-c.h*0.5),t:0.4,col:'#c8a0ff',w:3});SFX.portal();}
        }
        break;}
      case 'pouncer':{                                  /* гончая: бег, замах, прыжок с огненным укусом */
        if(m.state==='windup'){mvx=0;faceX(dx);m.tele=Math.min(1,m.st/0.35);
          if(m.st>0.35){m.state='leap';m.st=0;m.vy=-400;m.lx=Math.sign(dx)||m.facing;}}
        else if(m.state==='leap'){mvx=m.lx*3.2;m.tele=0.6;if(m.onGround&&m.st>0.18){m.state='idle';m.cd=rnd(1.3,2.1);m.tele=0;}}
        else if(aggro){faceX(dx);mvx=nx*1.1;if(m.onGround&&m.cd<=0&&dist<180&&dist>46){m.state='windup';m.st=0;}}
        else wander(0.6);
        if(!low0&&Math.random()<0.25)spawnPart(m.x-m.facing*8,m.y-m.h*0.75,rnd(-10,10),rnd(-50,-20),0.4,Math.random()<0.5?'#ff7a2a':'#ffd060',2,-30);
        break;}
      case 'leech':{                                    /* пиявка: присасывается, пьёт кровь и лечится */
        if(m.latch>0){
          m.latch-=dt;noPhys=true;
          m.x=player.x-player.facing*7;m.y=player.y-8;m.vx=m.vy=0;m.facing=player.facing;
          m.drainT=(m.drainT||0)-dt;
          if(m.drainT<=0){m.drainT=0.5;hurtPlayer(def.dmg*0.32,'пиявка',{bleed:1});m.hp=Math.min(m.maxHp,m.hp+def.dmg*0.7);
            spawnPart(m.x,m.y-6,rnd(-20,20),rnd(-60,-20),0.5,'#c0142a',2.4,300);}
          if(m.latch<=0||cheats.god){m.latch=0;m.cd=3.5;m.vy=-220;m.vx=-m.facing*160;}
        }else if(aggro){
          faceX(dx);mvx=nx*(inWater?1.7:0.9);
          if(inWater&&ny<-0.3)m.vy=Math.min(m.vy,-170);
          if(dist<28&&m.cd<=0){m.latch=2.4;floatText(player.x,player.y-62,'Пиявка присосалась!','#ff5a6a');SFX.hit();}
        }else wander(0.5);
        break;}
      case 'stinger':{                                  /* скорпион: кислотные плевки по дуге, ядовитое жало вблизи */
        if(aggro){
          faceX(dx);
          if(dist>140)mvx=nx*0.85;else if(dist<56)mvx=-nx*0.4;
          if(m.shootCd<=0&&seen&&dist<400&&dist>70){
            m.shootCd=rnd(2.0,2.8);m.tele=1;
            const T=clamp(Math.abs(dx)/320,0.35,1.3),vx=dx/T,vy=dy/T-0.5*520*T;
            mobShoot(m,Math.atan2(vy,vx),Math.hypot(vx,vy),def.dmg*0.75,'#c8ff40',6,{grav:520,fx:{poison:3},acid:true,life:3});
            SFX.hit();
          }
        }else wander(0.4);
        break;}
      case 'gasbag':{                                   /* газовый пузырь: подлетает, раздувается и лопается ядовитым облаком */
        if(m.state==='swell'){
          mvx=0;mvy=0;m.tele=Math.min(1,m.st/1.1);
          if(m.st>1.1){gasCloud(m.x,m.y-m.h*0.5,96,def.dmg*0.22,7);popGasNear(m);killMob(m,true);continue;}
        }else if(aggro){faceX(dx);mvx=nx*0.85;mvy=ny*0.85;if(dist<74){m.state='swell';m.st=0;SFX.uiBack();}}
        else{if(m.timer<=0){m.timer=rnd(1.5,3);m.hx=rnd(-1,1);m.hy=rnd(-0.5,0.5);}mvx=(m.hx||0)*0.4;mvy=(m.hy||0)*0.4;}
        break;}
      case 'archer':{                                   /* скелет-лучник: держит дистанцию, натягивает лук */
        if(m.state==='draw'){
          mvx=0;faceX(dx);m.tele=Math.min(1,m.st/0.7);
          if(m.st>0.7){
            m.state='idle';m.st=0;m.shootCd=rnd(1.5,2.3);m.tele=0;
            const T=clamp(Math.abs(dx)/560,0.25,1.0),vx=dx/T,vy=dy/T-0.5*240*T;
            m.volley=(m.volley||0)+1;const fire=Math.random()<0.3,n=m.volley%2===0?3:1;
            for(let k=0;k<n;k++){const a=Math.atan2(vy,vx)+(k-(n-1)/2)*0.09;mobShoot(m,a,Math.hypot(vx,vy),def.dmg*(n>1?0.7:1),fire?'#ff9a3c':'#e8dcc0',3.4,{grav:240,arrow:true,life:3,fx:fire?{burn:3}:null});}
            SFX.hit();
          }
        }else if(aggro){
          faceX(dx);
          if(dist<170)mvx=-nx*0.9;else if(dist>320)mvx=nx*0.8;
          if(m.shootCd<=0&&seen&&dist<480){m.state='draw';m.st=0;}
        }else wander(0.4);
        break;}
      default:
        if(aggro)mvx=dx/dist*0.9;
    }
    if(!def.fly&&!noPhys&&aggro&&Math.abs(dx)<14&&Math.abs(mvx)<=1.05)mvx=0;
    if(noPhys){
      /* уже сдвинуты внутри логики */
    }else if(def.fly){
      const arrive=(aggro&&m.dashT<=0)?clamp(dist/50,0.12,1):1;       /* плавно тормозит у цели, без дрожания */
      const sp=def.spd*(m.dashT>0?2.4:1)*(m.stun>0?0:1)*arrive*(m.eSpd||1)*(m.frozen>0?0.4:1);
      m.vx=clamp(lerp(m.vx,mvx*sp,dt*4),-500,500);
      m.vy=clamp(lerp(m.vy,mvy*sp,dt*4),-500,500);
      m.dashT=0;
      m.x+=m.vx*dt;m.y+=m.vy*dt;
      if(!def.ghost&&solidAtPx(m.x,m.y-m.h*0.5)){m.x-=m.vx*dt;m.y-=m.vy*dt;m.vx*=-0.4;m.vy*=-0.4;}
      if(def.trail&&Math.random()<0.4)spawnPart(m.x+rnd(-6,6),m.y-m.h*0.5,rnd(-10,10),rnd(-10,20),0.5,def.trail,2,60);
      if(!aggro&&Math.abs(mvx)>0.25)face(mvx);
    }else{
      const swim=inWater?0.55:1;
      const sp=def.spd*(m.dashT>0?2.6:1)*(m.stun>0?0:1)*swim*(m.eSpd||1)*(m.frozen>0?0.4:1);
      const target=mvx*sp;
      m.vx=lerp(m.vx,target,dt*9);
      m.vy+=(inWater?500:1500)*dt;
      if(inWater&&m.vy>140)m.vy=140;
      if(m.vy>900)m.vy=900;
      m.dashT=0;
      m.onGround=false;
      moveX(m,m.vx*dt);
      moveY(m,m.vy*dt);
      if(Math.abs(m.vx)>8&&m.onGround){
        const fx=Math.floor((m.x+(m.vx>0?m.w/2+4:-m.w/2-4))/TILE);
        const fy=Math.floor((m.y-4)/TILE);
        if(isSolid(fx,fy)&&m.timer<=0&&!(getTile(fx,fy)===T_BARRICADE&&m.provoked+(def.aggro>0?1:0)>0)){m.vy=-360;m.timer=0.4;}
      }
    }
    /* упёрся в баррикаду по пути к игроку — ломает её */
    if(aggro&&def.dmg>0&&m.atkCd<=0&&!m.untargetable&&m.alive){
      let bx=-1,by=-1;
      const pr=Math.max(m.w,m.h)*0.5+10;
      const ptx=Math.floor((m.x+nx*pr)/TILE),pty=Math.floor((m.y-m.h*0.5+ny*pr)/TILE);
      if(getTile(ptx,pty)===T_BARRICADE){bx=ptx;by=pty;}
      else if(!def.fly&&Math.sign(dx)===m.facing){
        const fx2=Math.floor((m.x+m.facing*(m.w/2+6))/TILE);
        for(const yy of [m.y-6,m.y-m.h*0.6]){const fty=Math.floor(yy/TILE);if(getTile(fx2,fty)===T_BARRICADE){bx=fx2;by=fty;break;}}
      }
      if(bx>=0){
        m.atkCd=1.0;m.tele=Math.max(m.tele,0.4);
        damageBarricade(bx,by,def.dmg*((def.mech==='colossus'||def.mech==='slammer'||def.mech==='charger')?2:1));
      }
    }
    /* контактный урон */
    if(def.dmg>0&&hostile&&!['mole','spitter','bomber','laser','gazer','web','blinker','charger','slammer','colossus','diver','swooper','bomb','thief','phantom','provoke','skitter','shielder','leech','gasbag','archer','boss','turret','pod','rift','berserk','hound','lavaworm','toad','priest','necro','soulwraith','blademaster','scorpion','infernal','magmael','acidmother','ashgolem','bonecolossus','hookgolem'].includes(def.mech)){
      const hitDist=Math.hypot(player.x-m.x,(player.y-player.h*0.5)-(m.y-m.h*0.5));
      if(hitDist<(m.w+player.w)/2+8&&m.atkCd<=0){m.atkCd=0.95;mobMelee(m,def.dmg,def.fx);}
    }
    /* контактный урон для «активных» мехов: в фазе атаки */
    if(def.dmg>0&&hostile&&['charger','swooper','phantom','shielder','slammer','colossus','blinker','bomber','web','spitter','laser'].includes(def.mech)){
      const charging=(m.state==='charge')||(m.state==='dive');
      const hitDist=Math.hypot(player.x-m.x,(player.y-player.h*0.5)-(m.y-m.h*0.5));
      const near=hitDist<(m.w+player.w)/2+6;
      if(near&&m.atkCd<=0&&(charging||def.mech==='phantom'||def.mech==='shielder'||def.mech==='slammer'||def.mech==='colossus'||def.mech==='blinker'||def.mech==='bomber'||def.mech==='web'||def.mech==='spitter'||def.mech==='laser')){
        m.atkCd=charging?1.1:1.0;
        mobMelee(m,def.dmg*(charging?1.3:0.7),charging&&def.mech==='swooper'?{bleed:3}:def.fx,charging?260:150,charging?-220:0);
      }
    }
    /* контактный урон: элементаль/диверы — см. выше; провокация краба и слизня */
    if(def.mech==='splitter'&&hostile){
      const hitDist=Math.hypot(player.x-m.x,(player.y-player.h*0.5)-(m.y-m.h*0.5));
      if(hitDist<(m.w+player.w)/2+8&&m.atkCd<=0){m.atkCd=0.95;mobMelee(m,def.dmg,def.fx);}
    }
  }
}
function killMob(m,quiet){
  if(!m.alive)return;
  if(m.def.revive&&!m.revived&&m.state!=='remains'){
    m.revived=true;m.state='remains';m.st=0;m.hp=m.maxHp*0.12;m.remT=3.6;m.vx=0;m.tele=0;m.burn=0;m.poison=0;
    burst(m.x,m.y-m.h*0.4,20,m.def.c1,160,3.4);SFX.mobDie(m.def);floatText(m.x,m.y-m.h-10,m.def.mech==='phoenix'?'Яйцо феникса!':'Добей останки!','#ffd060');return;
  }
  m.alive=false;
  const def=m.def;
  if(!m.noSouls||def.dim===1){if(!player.bestiary)player.bestiary={};player.bestiary[def.id]=(player.bestiary[def.id]||0)+1;statAdd('kills');
    const bn=player.bestiary[def.id];if(bn===TROPHY_N&&!def.boss){floatText(m.x,m.y-m.h-70,'🏆 Трофей: '+def.name+' (+15% урона по ним)','#ffd060');UI.toast('🏆 Охотничий трофей: '+def.name+'! +15% урона по этому виду');}}
  for(const d of def.drops)if(Math.random()<d.ch)addOre(d.ore,1);
  if(m.loot&&m.loot.length){for(const l of m.loot)addOre(l.id,l.n);floatText(m.x,m.y-m.h-22,'Добыча возвращена','#ffcc55');}
  if(def.mech==='decoy'){player.lightBuff=25;floatText(m.x,m.y-m.h-16,'Свет светляка +25с','#9be8ff');}
  if(def.boss)onBossKilled(m);
  if(m.trapKey){if(!G.wf.trd)G.wf.trd=[];if(G.wf.trd.indexOf(m.trapKey)<0)G.wf.trd.push(m.trapKey);
    for(let i=0;i<24;i++){const a=Math.random()*TAU,sp=rnd(60,240);spawnPart(m.x,m.y-m.h*0.5,Math.cos(a)*sp,Math.sin(a)*sp,rnd(0.5,1),def.c1,rnd(2,4),300);}
    floatText(m.x,m.y-m.h-30,'Страж уничтожен','#ffd98a');shake(5);}
  if(m.elite){player.souls=(player.souls||0)+Math.round((def.souls||2)*2*soulMult());floatText(m.x,m.y-m.h-52,'Элита повержена!','#ffd060');}
  {const pl=MOB_PARTS[def.id];if(pl&&!m.noSouls){for(const [id,ch,nn] of pl){if(Math.random()<ch*(1+0.1*perkLv('lucky'))*(m.elite?2:1)){const n=(nn||1)*(m.elite?2:1);addMat(id,n);floatText(m.x-14,m.y-m.h-38,'+'+n+' '+MATS[id].ic,'#ffd0a0');}}}}
  if(relicOn('heart')&&player.hp>0)player.hp=Math.min(player.maxHp,player.hp+player.maxHp*0.02);
  if(def.deathBlast)mobBlast(m.x,m.y-m.h*0.5,56,def.dmg*0.6,'#ff7a2a');
  if(def.mech==='gasbag')popGasNear(m);
  if(m.elite&&m.elite.id==='blast'){explode(m.x,m.y-m.h*0.5,70,def.dmg*0.8);shockRings.push({x:m.x,y:m.y-m.h*0.5,r:6,max:90,t:0,col:'#ffd040'});}
  if(def.mech==='gasbag'&&!quiet)gasCloud(m.x,m.y-m.h*0.5,70,def.dmg*0.15,5);
  if(def.souls&&!m.noSouls){const sl=Math.round(def.souls*soulMult());player.souls=(player.souls||0)+sl;floatText(m.x+18,m.y-m.h-24,'+'+sl+' 👻','#9ad8ff');
    if(typeof contractEvent==='function')contractEvent('kill',def.id,1);}
  const fancyDeath=!def.boss&&!quiet&&settings.quality!=='low'&&m.state!=='under';
  for(let i=0;i<(fancyDeath?3:12);i++){
    const a=Math.random()*TAU,s=rnd(40,180);
    spawnPart(m.x,m.y-m.h*0.5,Math.cos(a)*s,Math.sin(a)*s-60,rnd(0.4,0.9),def.c1,rnd(2,4));
  }
  for(let i=0;i<(fancyDeath?2:6);i++){
    const a=Math.random()*TAU,s=rnd(30,120);
    spawnPart(m.x,m.y-m.h*0.5,Math.cos(a)*s,Math.sin(a)*s-60,rnd(0.4,0.9),def.c2,rnd(2,3));
  }
  if(!quiet)SFX.mobDie(m.def);
  floatText(m.x,m.y-m.h-8,'+'+def.xp+' XP','#9be8ff');
  if(def.split&&(def.mech==='splitter'||def.mech==='bloodslime')){
    for(let i=0;i<2;i++){
      const c=spawnMobAt(def,m.x+rnd(-16,16),m.y);
      c.hp=c.maxHp=Math.floor(def.hp*0.4);
      c.w=def.w*0.7;c.h=def.h*0.7;
      c.def=Object.assign({},def,{split:false,mech:def.mech,dmg:Math.round(def.dmg*0.6),drops:def.drops.map(d=>({ore:d.ore,ch:d.ch*0.4})),hp:Math.floor(def.hp*0.4)});
    }
  }
  const idx=mobs.indexOf(m);
  if(idx>=0)mobs.splice(idx,1);
  if(fancyDeath){if(deadMobs.length>=24)deadMobs.shift();m.deadT=0;m.dstyle=deathStyle(def);m.kbx=Math.sign(m.x-player.x||1)*(def.fly?70:(def.h>48?60:130));m.dvy=def.fly?-90:Math.min(0,m.vy||0);m.landed=false;m.state='dead';m.tele=0;m.atkT=0;m.hurt=0;m.vx=0;m.deathK=0;deathStart(m);deadMobs.push(m);}
}
function explode(x,y,r,dmg){
  shake(10);SFX.boom();vib(40);
  for(let i=0;i<26;i++){
    const a=Math.random()*TAU,s=rnd(60,300);
    spawnPart(x,y,Math.cos(a)*s,Math.sin(a)*s,rnd(0.3,0.8),i%2?'#ff9a3c':'#ffdd66',rnd(2,5));
  }
  const pd=Math.hypot(player.x-x,(player.y-player.h*0.5)-y);
  if(pd<r)hurtPlayer(dmg,'взрыв');
  const tx=Math.floor(x/TILE),ty=Math.floor(y/TILE);
  const rr=Math.ceil(r/TILE);
  for(let dy=-rr;dy<=rr;dy++)for(let dx=-rr;dx<=rr;dx++){
    if(dx*dx+dy*dy>rr*rr)continue;
    const t=getTile(tx+dx,ty+dy);
    if(t===T_BARRICADE){damageBarricade(tx+dx,ty+dy,dmg*1.5);continue;}
    if(t!==T_AIR&&t!==T_BEDROCK&&t!==T_ARENA&&t!==T_LAVA&&t!==T_LADDER&&!isLiq(t))setTile(tx+dx,ty+dy,T_AIR);
  }
}
const projectiles=[];
function updateProjectiles(dt){
  for(let i=projectiles.length-1;i>=0;i--){
    const p=projectiles[i];
    if(p.grav)p.vy+=p.grav*dt;
    if(p.ground){
      p.x+=p.vx*dt;p.life-=dt;
      const fy=floorBelowY(p.x,p.y-8);
      if(fy===null||Math.abs(fy-p.y)>TILE*1.5||solidAtPx(p.x+Math.sign(p.vx)*8,p.y-10)||p.life<=0){projectiles.splice(i,1);continue;}
      p.y=fy;
      if(Math.random()<0.7)spawnPart(p.x,p.y-2,rnd(-20,20),rnd(-140,-60),0.4,p.color,rnd(2,3.6),500);
      if(!p.hitOnce&&Math.abs(player.x-p.x)<18&&player.y>p.y-40&&player.y<=p.y+6&&!cheats.god){p.hitOnce=true;hurtPlayer(p.dmg,'ударная волна',p.ground==='lava'?{burn:3}:{stun:0.3});player.vy=Math.min(player.vy,-300);}
      continue;
    }
    if(p.homeMob){
      let best=null,bd=420;for(const m of mobs){if(!m.alive||m.untargetable)continue;const d=m.def.hb?hbDistToMob(m,p.x,p.y)*0.5:Math.hypot(m.x-p.x,m.y-m.h*0.5-p.y);if(d<bd){bd=d;best=m;}}
      if(best){const sp=Math.hypot(p.vx,p.vy),cur=Math.atan2(p.vy,p.vx);let da=Math.atan2(best.y-best.h*0.5-p.y,best.x-p.x)-cur;
        while(da>Math.PI)da-=TAU;while(da<-Math.PI)da+=TAU;const na=cur+clamp(da,-p.homeMob*dt,p.homeMob*dt);p.vx=Math.cos(na)*sp;p.vy=Math.sin(na)*sp;}
      if(Math.random()<0.7)spawnPart(p.x,p.y,rnd(-20,20),rnd(-20,20),0.35,Math.random()<0.5?'#ff8a30':'#ffd060',3,0);
    }
    if(p.kind==='flame'){p.size+=dt*14;if(Math.random()<0.3)spawnPart(p.x,p.y,rnd(-20,20),rnd(-40,-10),0.3,'#ffb050',2.4,-40);}
    if(p.thrown){
      p.vy+=900*dt;p.fuse-=dt;
      const nx=p.x+p.vx*dt,ny=p.y+p.vy*dt;
      if(solidAtPx(nx,p.y)){p.vx*=-0.4;}
      if(solidAtPx(p.x,ny)){p.vy*=-0.35;p.vx*=0.7;}
      p.x+=p.vx*dt;p.y+=p.vy*dt;p.spin=(p.spin||0)+dt*10;
      let boom=p.fuse<=0;
      if(!boom)for(const m of mobs){if(m.alive&&Math.hypot(m.x-p.x,m.y-m.h*0.5-p.y)<m.w*0.5+8){boom=true;break;}}
      if(boom){thrownBoom(p);projectiles.splice(i,1);}
      continue;
    }
    if(p.homing){
      const sp=Math.hypot(p.vx,p.vy),cur=Math.atan2(p.vy,p.vx);
      let da=Math.atan2(player.y-player.h*0.5-p.y,player.x-p.x)-cur;
      while(da>Math.PI)da-=TAU;while(da<-Math.PI)da+=TAU;
      const na=cur+clamp(da,-p.homing*dt,p.homing*dt);p.vx=Math.cos(na)*sp;p.vy=Math.sin(na)*sp;
      if(Math.random()<0.4)spawnPart(p.x,p.y,0,0,0.35,p.color,p.size*0.6,0);
    }
    p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;
    if(p.fuse!==undefined){
      p.fuse-=dt;
      if(p.fuse<=0||(p.bomb&&solidAtPx(p.x,p.y))){
        explode(p.x,p.y,p.blast||56,p.dmg);projectiles.splice(i,1);continue;
      }
    }
    if(p.owner==='mob'&&!p.bomb&&getTile(Math.floor(p.x/TILE),Math.floor(p.y/TILE))===T_BARRICADE){
      damageBarricade(Math.floor(p.x/TILE),Math.floor(p.y/TILE),p.dmg);
      projectiles.splice(i,1);continue;
    }
    if(p.bounce>0&&solidAtPx(p.x,p.y)){
      p.bounce--;const bx=solidAtPx(p.x-p.vx*dt,p.y),by=solidAtPx(p.x,p.y-p.vy*dt);
      if(!bx)p.vx=-p.vx*0.85;else if(!by)p.vy=-p.vy*0.85;else{p.vx=-p.vx;p.vy=-p.vy;}
      p.x+=p.vx*dt*2;p.y+=p.vy*dt*2;burst(p.x,p.y,4,p.color,90,2);continue;
    }
    if(p.life<=0||(!p.ghost&&solidAtPx(p.x,p.y))){
      if(p.owner==='player'&&(p.kind==='acid'||p.kind==='homing'))playerSplash(p);
      if(p.sulfur){gasCloud(p.x,p.y-10,72,p.dmg*0.25,5);addPatch(p.x,p.y-6,46,4,'fire',p.dmg*0.2);}
      if(p.lava)addPatch(p.x,p.y-6,40,4,'fire',p.dmg*0.25);
      if(p.boulder)mobBlast(p.x,p.y,48,0,'#d8d0bc');
      if(p.onEnd)p.onEnd(p);
      burst(p.x,p.y,5,p.color,90,2.6);
      projectiles.splice(i,1);continue;
    }
    if(p.owner==='mob'){
      const d=Math.hypot(p.x-player.x,p.y-(player.y-player.h*0.5));
      if(d<(p.hr||20)&&!p.bomb){hurtPlayer(p.dmg,p.src||'снаряд',p.fx);burst(p.x,p.y,6,p.color,110,3);if(p.onEnd)p.onEnd(p);
        if(p.hook&&p.src&&p.src.alive&&!cheats.god){player.pull={mob:p.src,t:0.7,str:640};SFX.grapple();}
        if(p.web)addPatch(player.x,player.y-4,44,3,'web',0);
        if(p.sulfur)gasCloud(p.x,p.y,72,p.dmg*0.25,5);
        projectiles.splice(i,1);continue;}
    }else{
      for(const m of mobs){
        if(!m.alive||m.untargetable&&!m.hidden)continue;
        if(p.hit&&p.hit.has(m))continue;
        const d=Math.hypot(p.x-m.x,p.y-(m.y-m.h*0.5));
        if(m.def.hb?hbDistToMob(m,p.x,p.y)<6+(p.kind==='flame'?p.size:0):d<m.w*0.6+6+(p.kind==='flame'?p.size:0)){
          if(p.kind==='acid'||p.kind==='homing'){playerSplash(p);projectiles.splice(i,1);break;}
          hitMobGun(m,p.dmg,Math.sign(p.vx)*(p.kb||1),p);
          burst(p.x,p.y,6,p.color,110,3);
          if(p.pierce&&p.hit&&!m.hidden){p.hit.add(m);}
          else{projectiles.splice(i,1);}
          break;
        }
      }
    }
  }
}
