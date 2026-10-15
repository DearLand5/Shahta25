'use strict';
/* ============================================================
   БОСС: ПОЖИРАТЕЛЬ БЕЗДНЫ
   Фаза 1: самонаводящиеся сферы, рывок с предупреждением, призыв тенёнышей.
   Фаза 2: + вращающийся луч, шипы из пола.
   Фаза 3 (ярость): + спираль снарядов, метеоры с потолка; всё быстрее.
   ============================================================ */
const bossFx=[];      /* предупреждения и опасности арены */
function bossAlive(){for(const m of mobs)if(m.def.boss&&m.alive)return m;return null;}
function arenaSetGate(closed){
  for(let y=ARENA_Y0;y<=ARENA_Y0+1;y++)for(let x=ARENA_GX0;x<=ARENA_GX1;x++)setTile(x,y,closed?T_ARENA:T_AIR);
}
function startBossFight(){
  G.arenaFight=true;
  /* игрок гарантированно внутри арены: ниже ворот, без крюка, зацепленного за потолок шахты */
  grapple=null;
  {const minY=(ARENA_Y0+2)*TILE+player.h+6;if(player.y<minY){player.y=minY;player.peakY=player.y;}
   if(player.x<5*TILE||player.x>(MW-5)*TILE)player.x=48*TILE;}
  arenaSetGate(true);
  const def=MOBDEFS.find(d=>d.id==='devourer');
  const m=spawnMobAt(def,48*TILE,(ARENA_Y0+9)*TILE);
  m.b={phase:1,atk:'intro',at:0,next:2.2,last:''};m.invuln=3;m.spawnS=0;
  bossFx.length=0;
  const short=!!player.prog.bossSeen;player.prog.bossSeen=true;
  G.bossCut={t:short?2.2:0,dur:6.6,bx:m.x,by:m.y-m.h*0.5,m:m,roared:false};
  for(let i=projectiles.length-1;i>=0;i--)if(projectiles[i].owner==='mob')projectiles.splice(i,1);
  shake(6);SFX.geyser();vib(80);
}
function onBossKilled(m){
  G.arenaFight=false;bossFx.length=0;
  G.wf.bossDead=true;
  const first=!player.prog.key;
  player.prog.key=true;
  const reward=first?300000:60000;
  player.money+=reward;
  addOre(17,6);addOre(16,8);
  onBossDeathStart(m);G.bossDeath.first=first;G.bossDeath.reward=reward;
  G.gateOpenT=4.2;G.bossCut=null;
  saveGame();
}

/* ---------- катсцена появления босса и анимация смерти ---------- */
function updateBossCut(dt){
  const c=G.bossCut;if(!c)return;
  c.t+=dt;const m=c.m;
  Input.digActive=false;player.vx*=0.8;
  if(m&&m.alive){m.spawnS=clamp((c.t-1.2)/2.2,0,1);m.spawnS=1-Math.pow(1-m.spawnS,3);m.invuln=Math.max(m.invuln,1);m.x=c.bx;m.y=c.by+m.h*0.5;}
  if(c.t<3.4&&Math.random()<0.5)shake(1.2);
  if(c.t>0.6&&c.t<3.4&&settings.quality!=='low'){const a=Math.random()*TAU,r=rnd(60,140);spawnPart(c.bx+Math.cos(a)*r,c.by+Math.sin(a)*r*0.6,-Math.cos(a)*r*1.4,-Math.sin(a)*r*0.9,0.7,Math.random()<0.5?'#c8a0ff':'#6a2ac8',rnd(2,4),0);}
  if(c.t>=3.4&&!c.roared){c.roared=true;shake(16);SFX.boom();vib(160);G.bossFlash=1;
    for(let i=0;i<50;i++){const a=Math.random()*TAU,sp=rnd(120,420);spawnPart(c.bx,c.by,Math.cos(a)*sp,Math.sin(a)*sp,rnd(0.5,1.2),i%2?'#c8a0ff':'#ffffff',rnd(2,4),0);}
    if(Math.hypot(player.x-c.bx,player.y-c.by)<220){player.vx+=Math.sign(player.x-c.bx||1)*420;player.vy=-260;}
    UI.toast('⚠ Пожиратель Бездны пробудился!');}
  if(G.bossFlash>0)G.bossFlash-=dt*1.6;
  if(c.t>=c.dur){G.bossCut=null;if(m&&m.alive){m.spawnS=1;m.invuln=0.6;if(m.b){m.b.atk='idle';m.b.at=0;}}}
}
function bossCutCam(){
  const c=G.bossCut;if(!c)return null;
  const k=c.t<1.2?c.t/1.2:c.t<5.0?1:Math.max(0,1-(c.t-5.0)/1.4);
  const e=k*k*(3-2*k);
  return {x:lerp(player.x,c.bx,e),y:lerp(player.y-player.h*0.5-10,c.by+20,e)};
}
function drawBossCutFx(g){
  const c=G.bossCut;if(!c)return;
  const t=c.t,o=clamp((t-0.6)/1.2,0,1)*(t<4.2?1:Math.max(0,1-(t-4.2)/0.8));
  if(o<=0)return;
  g.save();g.translate(c.bx,c.by);
  /* разлом пустоты */
  const rw=150*o,rh=110*o;
  const gr=g.createRadialGradient(0,0,4,0,0,Math.max(10,rw));gr.addColorStop(0,'rgba(0,0,0,.95)');gr.addColorStop(0.6,'rgba(40,0,80,.8)');gr.addColorStop(1,'rgba(120,40,220,0)');
  g.fillStyle=gr;g.beginPath();g.ellipse(0,0,rw,rh,0,0,TAU);g.fill();
  g.strokeStyle='rgba(200,160,255,'+(0.7*o)+')';g.lineWidth=2;
  for(let k=0;k<3;k++){g.beginPath();g.ellipse(0,0,rw*(0.6+k*0.2)+Math.sin(G.time*3+k)*4,rh*(0.6+k*0.2),G.time*(0.5+k*0.3),0,Math.PI*1.4);g.stroke();}
  /* трещины реальности */
  g.strokeStyle='rgba(230,200,255,'+(0.8*o)+')';g.lineWidth=1.6;
  for(let k=0;k<9;k++){const a=k/9*TAU+0.3;g.beginPath();let x=Math.cos(a)*rw*0.8,y=Math.sin(a)*rh*0.8;g.moveTo(x,y);for(let j=0;j<4;j++){x+=Math.cos(a+(hash2(k,j,7)%100-50)/90)*22*o;y+=Math.sin(a+(hash2(k,j,9)%100-50)/90)*16*o;g.lineTo(x,y);}g.stroke();}
  if(c.roared){const k=clamp((t-3.4)/0.9,0,1);g.strokeStyle='rgba(255,255,255,'+(1-k)+')';g.lineWidth=8*(1-k)+1;g.beginPath();g.ellipse(0,0,40+k*520,30+k*300,0,0,TAU);g.stroke();}
  g.restore();
}
function onBossDeathStart(m){
  G.bossDeath={t:0,m:m,x:m.x,y:m.y,flashed:false};G.slowT=2.4;
  m.dieK=0.01;shake(10);SFX.boom();vib(160);
}
function updateBossDeath(rdt){
  const d=G.bossDeath;if(!d)return;
  d.t+=rdt;const m=d.m;m.dieK=clamp(d.t/2.4,0,1);m.hurt=d.t<2.4&&Math.floor(d.t*14)%2?0.05:0;
  if(d.t<2.4){if(Math.random()<rdt*7){const a=Math.random()*TAU,r=rnd(10,60);explodeFx(d.x+Math.cos(a)*r,d.y-m.h*0.5+Math.sin(a)*r);}shake(1.5);}
  if(d.t>=2.4&&!d.flashed){d.flashed=true;G.bossFlash=1;shake(20);SFX.boom();vib(250);
    for(let i=0;i<140;i++){const a=Math.random()*TAU,sp=rnd(80,620);spawnPart(d.x,d.y-m.h*0.5,Math.cos(a)*sp,Math.sin(a)*sp,rnd(0.6,2),i%3===0?'#ffffff':i%3===1?'#c8a0ff':'#7a3aff',rnd(2,6),120);}
    floatText(d.x,d.y-m.h-30,d.first?'🗝 Ключ Бездны получен!':'Пожиратель повержен','#ffd98a');
    floatText(d.x,d.y-m.h-56,'+'+fmt(d.reward||0)+' 💰','#ffd98a');
    G.bossOutro=4.5;SFX.chest&&SFX.chest();}
  if(G.bossFlash>0)G.bossFlash-=rdt*1.8;
  if(d.t>5)G.bossDeath=null;
}
function explodeFx(x,y){burst(x,y,10,Math.random()<0.5?'#ffffff':'#c8a0ff',220,3);if(Math.random()<0.4)SFX.hit&&SFX.hit();}
function drawBossDeath(g){
  const d=G.bossDeath;if(!d)return;const m=d.m;
  if(d.t<2.4){const k=d.t/2.4;const ox=m.x;m.x=d.x+rnd(-1,1)*(2+k*6);m.alpha=1;
    g.save();g.translate(0,-k*6);drawMobSprite(g,m,G.time);g.restore();m.x=ox;
    /* лучи света из трещин */
    g.save();g.globalCompositeOperation='lighter';g.translate(d.x,d.y-m.h*0.5);
    const n=6+Math.floor(k*10);for(let i=0;i<n;i++){const a=i/n*TAU+G.time*0.6+hash2(i,3,1)%10*0.1,L=(80+k*380)*(0.6+(hash2(i,5,2)%40)/100);
      const gr=g.createLinearGradient(0,0,Math.cos(a)*L,Math.sin(a)*L);gr.addColorStop(0,'rgba(255,255,255,'+(0.4+k*0.5)+')');gr.addColorStop(1,'rgba(180,120,255,0)');
      g.fillStyle=gr;g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(a-0.05)*L,Math.sin(a-0.05)*L);g.lineTo(Math.cos(a+0.05)*L,Math.sin(a+0.05)*L);g.closePath();g.fill();}
    const cg=g.createRadialGradient(0,0,2,0,0,30+k*60);cg.addColorStop(0,'rgba(255,255,255,'+(0.5+k*0.5)+')');cg.addColorStop(1,'rgba(160,100,255,0)');g.fillStyle=cg;g.beginPath();g.arc(0,0,30+k*60,0,TAU);g.fill();
    g.restore();}
  else{const k=clamp((d.t-2.4)/1.2,0,1);g.save();g.translate(d.x,d.y-m.h*0.5);
    g.strokeStyle='rgba(255,255,255,'+(1-k)+')';g.lineWidth=14*(1-k)+1;g.beginPath();g.arc(0,0,30+k*600,0,TAU);g.stroke();
    g.strokeStyle='rgba(180,120,255,'+(0.8*(1-k))+')';g.lineWidth=6*(1-k)+1;g.beginPath();g.arc(0,0,20+k*420,0,TAU);g.stroke();
    /* падающий потухший глаз-кристалл */
    const k2=clamp((d.t-2.4)/2.6,0,1),fy=Math.min(k2*k2*700,(ARENA_FLOOR*TILE)-(d.y-m.h*0.5)-8);
    g.globalAlpha=1-Math.max(0,(k2-0.7)/0.3);g.fillStyle='#e8dcff';g.beginPath();g.ellipse(0,fy,8,6,k2*6,0,TAU);g.fill();g.fillStyle='#3a1a6a';g.beginPath();g.arc(0,fy,3,0,TAU);g.fill();
    g.restore();}
}
function updateArena(dt){
  if(G.bossIntro>0)G.bossIntro-=dt;
  if(G.bossOutro>0)G.bossOutro-=dt;
  if(G.dim!==0){bossFx.length=0;return;}
  if(G.gateOpenT>0){G.gateOpenT-=dt;if(G.gateOpenT<=0&&G.scene==='mine')arenaSetGate(false);}
  const pty=player.y/TILE;
  const boss=bossAlive();
  if(!boss&&G.arenaFight){G.arenaFight=false;arenaSetGate(false);bossFx.length=0;}
  if(boss&&G.arenaFight&&G.scene==='mine'&&player.y<(ARENA_Y0+2)*TILE+player.h){grapple=null;player.y=(ARENA_Y0+3)*TILE+player.h;player.x=clamp(player.x,(ARENA_GX0-2)*TILE,(ARENA_GX1+3)*TILE);player.vy=0;player.peakY=player.y;}
  if(!boss&&!G.arenaFight&&!G.wf.bossDead&&pty>ARENA_Y0+4.6&&pty<ARENA_FLOOR+0.5&&player.y-player.h>(ARENA_Y0+2)*TILE+2&&player.hp>0)startBossFight();
  /* опасности */
  for(let i=bossFx.length-1;i>=0;i--){
    const f=bossFx[i];f.t+=dt;
    if(f.type==='spike'){
      if(f.t>=f.warn&&!f.hit){
        f.hit=true;SFX.breakBlock();shake(3);
        const fy=f.y;
        if(Math.abs(player.x-f.x)<f.w*0.5+8&&player.y>fy-3*TILE&&player.y<=fy+6&&!cheats.god)hurtPlayer(f.dmg,'шипы Бездны',{bleed:2});
        for(let k=0;k<8;k++)spawnPart(f.x+rnd(-f.w/2,f.w/2),fy,rnd(-30,30),rnd(-260,-120),0.6,'#c8a0ff',2.6,600);
      }
      if(f.t>f.warn+0.6)bossFx.splice(i,1);
    }else if(f.type==='meteor'){
      if(f.t>=f.warn){
        f.vy=(f.vy||0)+1800*dt;f.y+=f.vy*dt;
        if(Math.random()<0.6)spawnPart(f.x+rnd(-6,6),f.y-10,rnd(-20,20),rnd(-80,-20),0.5,'#ff9a3c',3,0);
        if(solidAtPx(f.x,f.y)||f.y>(ARENA_FLOOR)*TILE){explode(f.x,f.y-8,56,f.dmg);bossFx.splice(i,1);continue;}
        if(Math.hypot(player.x-f.x,player.y-player.h*0.5-f.y)<24&&!cheats.god){hurtPlayer(f.dmg,'метеор',{burn:3});explode(f.x,f.y,40,0);bossFx.splice(i,1);continue;}
      }
    }else if(f.type==='dashline'){if(f.t>f.life)bossFx.splice(i,1);}
    else if(f.type==='tentacle'){
      if(f.t>=f.warn&&!f.hit){f.hit=true;shake(4);SFX.breakBlock();
        if(Math.abs(player.x-f.x)<26&&player.y>f.y-f.h&&player.y<=f.y+6&&!cheats.god){hurtPlayer(f.dmg,'щупальце Бездны',{stun:0.4});player.vy=-420;}}
      if(f.t>f.warn+1.1)bossFx.splice(i,1);}
  }
}
/* ИИ Пожирателя: те же атаки, но выбирает их по ситуации, упреждает движение,
   связывает в комбинации и наказывает за стояние на месте */
function bossPredict(t){const lead=Math.min(1,t);return {x:clamp(player.x+player.vx*lead,5*TILE,(MW-5)*TILE),y:player.y-player.h*0.5+(player.onGround?0:clamp(player.vy*lead*0.5,-120,120))};}
function bossPick(m,B){
  const pool=['orbs','dash','summon','grasp'];
  if(B.phase>=2)pool.push('laser','spikes','nova','voidpull');
  if(B.phase>=3)pool.push('spiral','meteors','clones');
  /* комбо: часть атак сразу продолжается следующей */
  if(B.queue&&B.queue.length){const a=B.queue.shift();B.last2=B.last;B.last=a;B.atk=a;B.at=0;B.sub=0;B.combo=true;return;}
  B.combo=false;
  const dist=Math.hypot(player.x-m.x,player.y-player.h*0.5-(m.y-m.h*0.5)),air=!player.onGround||!!grapple,still=(B.stillT||0)>1.3,fast=Math.abs(player.vx)>150;
  const shades=mobs.filter(o=>o.alive&&o.def.id==='shadeling').length;
  const w={orbs:1,dash:1,summon:shades>=3?0.1:0.8,grasp:1,laser:1,spikes:1,nova:1,voidpull:1,spiral:1,meteors:1,clones:1};
  if(dist>380){w.voidpull+=2.2;w.dash+=1.4;w.laser+=1;w.orbs+=0.8;w.nova-=0.6;}
  if(dist<170){w.nova+=1.8;w.spiral+=1.2;w.grasp+=1;w.dash-=0.5;w.voidpull-=0.8;}
  if(air){w.orbs+=1;w.laser+=1.3;w.clones+=1.4;w.spikes-=0.6;w.grasp-=0.5;}
  else{w.spikes+=1;w.grasp+=1.2;w.meteors+=0.8;}
  if(still){w.spikes+=2.5;w.grasp+=2.2;w.meteors+=1.5;w.dash+=1;}
  if(fast){w.laser+=1;w.clones+=0.8;w.orbs+=0.5;}
  if(player.hp<player.maxHp*0.35){w.dash+=1;w.meteors+=0.8;w.orbs+=0.6;}   /* добивает */
  let tot=0;const opts=pool.filter(a=>a!==B.last&&a!==B.last2).map(a=>{const v=Math.max(0.05,w[a]||1);tot+=v;return [a,v];});
  let r=Math.random()*tot,a=opts.length?opts[0][0]:'orbs';for(const [k,v] of opts){r-=v;if(r<=0){a=k;break;}}
  if(a==='summon'&&mobs.length>mobCap()+6)a='orbs';
  /* связки со 2-й фазы: притянуть и ударить кольцом, загнать щупальцами под звездопад и т.п. */
  if(B.phase>=2&&Math.random()<(B.phase>=3?0.75:0.45)){
    const follow={voidpull:['nova','grasp'],grasp:['spikes','dash','orbs'],laser:['orbs','dash'],spikes:['dash','orbs'],meteors:['dash','grasp'],clones:['orbs','laser'],nova:['dash','spikes'],dash:['orbs','grasp']}[a];
    if(follow){let f=follow[Math.floor(Math.random()*follow.length)];if(!pool.includes(f))f='orbs';B.queue=[f];}}
  B.last2=B.last;B.last=a;B.atk=a;B.at=0;B.sub=0;
}
function bossUpdate(m,dt,dx,dy,dist){
  const def=m.def,B=m.b||(m.b={phase:1,atk:'idle',at:0,next:2,last:''});
  if(G.bossCut){m.vx=m.vy=0;B.atk='intro';B.at=0;m.facing=dx>=0?1:-1;return;}
  const hpF=m.hp/m.maxHp;
  const want=hpF>0.66?1:hpF>0.33?2:3;
  if(want>B.phase&&B.atk!=='transition'){
    B.phase=want;B.atk='transition';B.at=0;m.invuln=2.4;m.tele=0;
    shake(16);SFX.boom();vib(160);bossFx.length=0;
    for(let i=projectiles.length-1;i>=0;i--)if(projectiles[i].owner==='mob')projectiles.splice(i,1);
    floatText(m.x,m.y-m.h-24,want===2?'Фаза 2 · Ярость Бездны':'Фаза 3 · Безумие','#ff8aff');
    G.bossPhaseFlash=1;
  }
  if(m.invuln>0)m.invuln-=dt;
  if(G.bossPhaseFlash>0)G.bossPhaseFlash-=dt*1.5;
  const rage=B.phase===3?1.35:B.phase===2?1.12:1;
  B.at+=dt*rage;
  m.facing=dx>=0?1:-1;
  const minX=6*TILE,maxX=(MW-6)*TILE,minY=(ARENA_Y0+5)*TILE,maxY=(ARENA_FLOOR-4)*TILE;
  {const mv=Math.abs(player.x-(B.px===undefined?player.x:B.px))+Math.abs(player.y-(B.py===undefined?player.y:B.py));B.px=player.x;B.py=player.y;
    B.stillT=mv<1.2*dt*60?(B.stillT||0)+dt:Math.max(0,(B.stillT||0)-dt*2);}
  if(!(B.sideT>0)){B.sideT=rnd(3,5.5)/(B.phase>=3?1.4:1);B.side=Math.random()<0.5?-1:1;}else B.sideT-=dt;
  const hover=(sp)=>{
    const tx=clamp(player.x+B.side*(150+40*Math.sin(G.time*0.9))+player.vx*0.35,minX,maxX),ty=clamp(player.y-200-(B.phase>=3?30:0),minY,maxY);
    m.vx=lerp(m.vx,clamp((tx-m.x)*2,-sp,sp),Math.min(1,dt*3));
    m.vy=lerp(m.vy,clamp((ty-m.y)*2,-sp,sp),Math.min(1,dt*3));
    m.x+=m.vx*dt;m.y+=m.vy*dt;
  };
  const cy=m.y-m.h*0.5;
  switch(B.atk){
    case 'intro':hover(60);if(B.at>2.6){B.atk='idle';B.at=0;}break;
    case 'transition':
      m.vx*=0.9;m.vy*=0.9;m.x=lerp(m.x,48*TILE,dt*1.5);m.y=lerp(m.y,(ARENA_Y0+11)*TILE,dt*1.5);
      if(Math.random()<0.5)spawnPart(m.x+rnd(-60,60),cy+rnd(-60,60),rnd(-40,40),rnd(-40,40),0.6,B.phase===3?'#ff6a6a':'#ff8aff',3,0);
      if(B.at>2.4){B.atk='idle';B.at=0;}
      break;
    case 'idle':
      hover(def.spd*rage);
      if(B.at>(B.queue&&B.queue.length?0.12:Math.max(B.phase>=3?0.38:B.phase>=2?0.5:0.65,B.next-0.45*B.phase)))bossPick(m,B);
      break;
    case 'orbs':
      hover(70);m.tele=Math.min(1,B.at/0.5);
      if(B.at>0.5&&(B.sub<1||(B.phase>=3&&B.sub<2&&B.at>0.95))){
        B.sub++;m.tele=0;SFX.shot&&SFX.hit();
        const P2=bossPredict(dist/230*0.6),base=Math.atan2(P2.y-cy,P2.x-m.x),n=B.phase>=2?5:3;
        for(let k=0;k<n;k++){const a=base+(k-(n-1)/2)*0.45;
          projectiles.push({x:m.x+Math.cos(a)*40,y:cy+Math.sin(a)*40,vx:Math.cos(a)*230,vy:Math.sin(a)*230,life:4.2,dmg:56,color:'#c890ff',size:7,owner:'mob',homing:1.9,ghost:true,fx:{slow:1}});}
      }
      if(B.at>(B.phase>=3?1.5:1.3)){B.atk='idle';B.at=0;}
      break;
    case 'dash':
      if(B.sub===0||(B.sub===1&&B.redash)){const P2=bossPredict(B.redash?0.45:0.6);B.redash=false;B.sub=1;B.tx=P2.x;B.ty=P2.y;bossFx.push({type:'dashline',t:0,life:0.9,x1:m.x,y1:cy,x2:B.tx,y2:B.ty});}
      if(B.at<0.9){m.tele=B.at/0.9;m.vx*=0.9;m.vy*=0.9;
        if(B.at>0.55){const P2=bossPredict(0.35);B.tx=lerp(B.tx,P2.x,dt*2);B.ty=lerp(B.ty,P2.y,dt*2);}}
      else if(B.at<1.6){
        m.tele=0;const ax=B.tx-m.x,ay=B.ty-cy,l=Math.hypot(ax,ay);
        const sp=1000*dt*rage;
        if(l>sp){m.x+=ax/l*sp;m.y+=ay/l*sp;}else B.at=1.6;
        if(Math.random()<0.8)spawnPart(m.x+rnd(-30,30),cy+rnd(-30,30),0,0,0.5,'#8a4aff',5,0);
        if(Math.hypot(player.x-m.x,player.y-player.h*0.5-cy)<m.w*0.45+14&&m.atkCd<=0){m.atkCd=1;mobMelee(m,def.dmg*1.5,{stun:0.4},420,-260);}
      }else if(B.phase>=2&&!B.dash2){B.dash2=true;B.redash=true;B.at=0.35;}
      else{B.dash2=false;m.x=clamp(m.x,minX,maxX);m.y=clamp(m.y,minY+m.h*0.5,maxY+m.h*0.5);B.atk='idle';B.at=0;}
      break;
    case 'summon':
      hover(50);m.tele=Math.min(1,B.at/0.6);
      if(B.at>0.6&&B.sub<1){
        B.sub=1;m.tele=0;const sd=MOBDEFS.find(d=>d.id==='shadeling');
        for(let k=0;k<(B.phase>=2?4:3);k++){const c=spawnMobAt(sd,m.x+rnd(-60,60),cy+rnd(20,60));c.noSouls=true;}
        floatText(m.x,m.y-m.h-16,'Тенёныши!','#c0a0ff');SFX.uiBack();
      }
      if(B.at>1.3){B.atk='idle';B.at=0;}
      break;
    case 'laser':{
      hover(30);
      if(B.sub===0){B.sub=1;B.a0=Math.atan2(dy,dx);const sa=Math.sin(B.a0)>=0?1:-1;B.dir=Math.abs(player.vx)>30?(player.vx>0?-1:1)*sa:(Math.random()<0.5?-1:1);}
      if(B.at<0.9){m.tele=B.at/0.9;m.aimA=B.a0-B.dir*1.1;}
      else if(B.at<3.0){
        m.tele=0;const k=Math.pow((B.at-0.9)/2.1,B.phase>=3?0.8:1);const a=B.a0-B.dir*1.1+B.dir*2.2*k;m.aimA=a;
        B.bt=(B.bt||0)-dt;
        if(B.bt<=0){B.bt=0.05;
          let L=0;while(L<900){if(solidAtPx(m.x+Math.cos(a)*L,cy+Math.sin(a)*L))break;L+=12;}
          beams.push({x1:m.x,y1:cy,x2:m.x+Math.cos(a)*L,y2:cy+Math.sin(a)*L,t:0.08,dmg:B.lhit>0?0:45,color:B.phase===3?'#ff5a5a':'#ff70ff',fx:{burn:1},done:false,boss:true});
        }
        if(B.lhit>0)B.lhit-=dt;
        if(Math.random()<0.3)shake(1.2);
      }else{B.atk='idle';B.at=0;}
      break;}
    case 'spikes':{
      hover(80);
      if(B.sub===0){
        B.sub=1;const n=B.phase>=3?7:5;
        const P2=bossPredict(0.9),xs=[P2.x,clamp(P2.x-90,5*TILE,(MW-5)*TILE),clamp(P2.x+90,5*TILE,(MW-5)*TILE)];for(let k=3;k<n;k++)xs.push(clamp(player.x+rnd(-420,420),5*TILE,(MW-5)*TILE));
        for(const x of xs){
          /* шипы бьют из ближайшего пола под точкой */
          const tx=Math.floor(x/TILE);let ty=Math.floor((player.y-4)/TILE);
          for(let k=0;k<30&&!isSolid(tx,ty+1);k++)ty++;
          bossFx.push({type:'spike',t:0,warn:B.phase>=3?0.8:0.95,x:x,w:56,y:(ty+1)*TILE,dmg:92});
        }
      }
      if(B.at>1.8){B.atk='idle';B.at=0;}
      break;}
    case 'spiral':
      hover(25);
      B.st2=(B.st2||0)-dt;
      if(B.at<2.8&&B.st2<=0){
        B.st2=0.085;B.sa=(B.sa||0)+0.37;
        for(let k=0;k<3;k++){const a=B.sa+k*TAU/3;projectiles.push({x:m.x+Math.cos(a)*30,y:cy+Math.sin(a)*30,vx:Math.cos(a)*220,vy:Math.sin(a)*220,life:3.4,dmg:36,color:'#ff6a8a',size:5,owner:'mob',ghost:true});}
      }
      if(B.at>3.2){B.atk='idle';B.at=0;}
      break;
    case 'grasp':{
      /* щупальца Бездны вырываются из пола под игроком и рядом */
      hover(60);m.tele=Math.min(1,B.at/0.5);
      if(B.sub===0&&B.at>0.4){B.sub=1;const n=2+B.phase;
        for(let k=0;k<n;k++){const x=clamp(k===0?bossPredict(0.85).x:k===1?player.x:player.x+rnd(-300,300),5*TILE,(MW-5)*TILE);
          const tx=Math.floor(x/TILE);let ty=Math.floor((player.y-4)/TILE);for(let q=0;q<30&&!isSolid(tx,ty+1);q++)ty++;
          bossFx.push({type:'tentacle',t:-k*0.15,warn:0.85,x:x,y:(ty+1)*TILE,dmg:65,h:120+rnd(0,50),ph:Math.random()*6});}
        floatText(m.x,m.y-m.h-16,'Щупальца!','#c0a0ff');}
      if(B.at>2.4){B.atk='idle';B.at=0;}
      break;}
    case 'nova':{
      /* кольцо сфер с «окнами» -- проскочи в разрыв */
      hover(20);m.tele=Math.min(1,B.at/0.7);
      if(B.at>0.7&&(B.sub||0)<(B.phase>=3?2:1)&&B.at>0.7+(B.sub||0)*0.7){B.sub=(B.sub||0)+1;m.tele=0;shake(5);SFX.boom();
        const n=26,pa=Math.atan2(player.y-player.h*0.5-cy,player.x-m.x),off=pa+Math.PI+rnd(-0.6,0.6),gap=Math.floor(Math.random()*n);
        for(let k=0;k<n;k++){if(Math.abs(k-gap)<=1||Math.abs(k-gap-n/2)<=1)continue;const a=off+k/n*TAU;
          projectiles.push({x:m.x+Math.cos(a)*36,y:cy+Math.sin(a)*36,vx:Math.cos(a)*(B.phase>=3?215:190),vy:Math.sin(a)*(B.phase>=3?215:190),life:4,dmg:40,color:'#e0a0ff',size:6,owner:'mob',ghost:true});}}
      if(B.at>2.2){B.atk='idle';B.at=0;}
      break;}
    case 'voidpull':{
      /* чёрная дыра: тянет к себе, вокруг вращаются осколки */
      m.vx*=0.9;m.vy*=0.9;m.tele=Math.min(1,B.at/0.6);
      if(B.at>0.6&&B.at<3.4){const ax=m.x-player.x,ay=cy-(player.y-player.h*0.5),l=Math.hypot(ax,ay)||1;
        if(!cheats.god){player.vx+=ax/l*520*dt;player.vy+=ay/l*300*dt;}
        if(l<m.w*0.5+20){B.ph=(B.ph||0)-dt;if(B.ph<=0){B.ph=0.45;hurtPlayer(def.dmg*0.5,'Пустота',{slow:1.5});}}
        if(Math.random()<0.8){const a=Math.random()*TAU,r=rnd(120,260);spawnPart(m.x+Math.cos(a)*r,cy+Math.sin(a)*r,-Math.cos(a)*r*1.6,-Math.sin(a)*r*1.6,0.6,'#8a4aff',3,0);}
        bossFx.vp={x:m.x,y:cy,t:B.at};}
      else bossFx.vp=null;
      if(B.at>3.6){B.atk='idle';B.at=0;bossFx.vp=null;}
      break;}
    case 'clones':{
      /* два отражения пролетают через арену по линиям */
      hover(40);
      if(B.sub===0){B.sub=1;B.lines=[];
        for(const sd of [-1,1]){const y=clamp((sd<0?player.y-player.h*0.5:bossPredict(1).y)+rnd(-24,24),(ARENA_Y0+4)*TILE,(ARENA_FLOOR-1)*TILE);
          const x1=sd<0?5*TILE:(MW-5)*TILE,x2=sd<0?(MW-5)*TILE:5*TILE;bossFx.push({type:'dashline',t:0,life:1.0,x1,y1:y,x2,y2:y});B.lines.push([x1,y,x2,y]);}}
      if(B.at>1.0&&B.sub===1){B.sub=2;for(const [x1,y1,x2,y2] of B.lines){const a=Math.atan2(y2-y1,x2-x1);
        projectiles.push({x:x1,y:y1,vx:Math.cos(a)*900,vy:Math.sin(a)*900,life:3,dmg:def.dmg*1.1,color:'#b080ff',size:22,owner:'mob',ghost:true,clone:true});}SFX.boom();shake(6);}
      if(B.at>2.0){B.atk='idle';B.at=0;}
      break;}
    case 'meteors':
      hover(60);
      if(B.sub===0){
        B.sub=1;
        for(let k=0;k<8;k++){const x=clamp(k===0?player.x:k===1?bossPredict(1.1).x:player.x+rnd(-380,380),5*TILE,(MW-5)*TILE);
          bossFx.push({type:'meteor',t:-k*0.16,warn:1.0,x:x,y:(ARENA_Y0+2.2)*TILE,dmg:80});}
        floatText(m.x,m.y-m.h-16,'Звездопад!','#ffb080');
      }
      if(B.at>2.2){B.atk='idle';B.at=0;}
      break;
  }
  m.x=clamp(m.x,4.5*TILE,(MW-4.5)*TILE);
  m.y=clamp(m.y,(ARENA_Y0+2)*TILE+m.h,(ARENA_FLOOR)*TILE);
  /* касание тела */
  if(B.atk!=='dash'&&Math.hypot(player.x-m.x,player.y-player.h*0.5-cy)<m.w*0.42+12&&m.atkCd<=0){m.atkCd=1.1;mobMelee(m,def.dmg*0.6,null,300,-200);}
}
function drawBossFx(g){
  if(!bossFx.length&&!bossFx.vp)return;
  g.save();
  if(bossFx.vp){const v=bossFx.vp,k=clamp((v.t-0.6)/0.4,0,1)*clamp((3.4-v.t)/0.3,0,1);
    for(let r=0;r<5;r++){const rad=(60+r*45)*(1-((G.time*0.8+r*0.2)%1)*0.5);g.strokeStyle='rgba(150,90,255,'+(0.35*k*(1-r*0.15))+')';g.lineWidth=3;g.beginPath();g.arc(v.x,v.y,rad,G.time*3+r,G.time*3+r+Math.PI*1.2);g.stroke();}
    const gr=g.createRadialGradient(v.x,v.y,4,v.x,v.y,70);gr.addColorStop(0,'rgba(0,0,0,'+(0.9*k)+')');gr.addColorStop(0.6,'rgba(40,0,80,'+(0.5*k)+')');gr.addColorStop(1,'rgba(40,0,80,0)');g.fillStyle=gr;g.beginPath();g.arc(v.x,v.y,70,0,TAU);g.fill();}
  for(const f of bossFx){
    if(f.type==='tentacle'){
      if(f.t<0)continue;
      if(f.t<f.warn){const a=f.t/f.warn;g.fillStyle='rgba(150,90,230,'+(0.25+0.4*a)+')';g.beginPath();g.ellipse(f.x,f.y-2,16+a*6,4,0,0,TAU);g.fill();
        g.strokeStyle='rgba(220,190,255,'+(0.4+0.4*a)+')';g.lineWidth=1.4;for(let k=0;k<5;k++){const aa=k*1.26+f.t*4;g.beginPath();g.moveTo(f.x,f.y-2);g.lineTo(f.x+Math.cos(aa)*14*a,f.y-2+Math.sin(aa)*3);g.stroke();}continue;}
      const k=clamp((f.t-f.warn)/0.15,0,1)*(1-clamp((f.t-f.warn-0.8)/0.3,0,1)),H=f.h*k;
      g.save();g.translate(f.x,f.y);
      const seg=14;g.beginPath();
      for(let j=0;j<=seg;j++){const q=j/seg,w=(1-q)*11+2,sx=Math.sin(q*3+f.t*6+f.ph)*10*q;g.lineTo(sx-w,-q*H);}
      for(let j=seg;j>=0;j--){const q=j/seg,w=(1-q)*11+2,sx=Math.sin(q*3+f.t*6+f.ph)*10*q;g.lineTo(sx+w,-q*H);}
      g.closePath();const gr=g.createLinearGradient(0,0,0,-H);gr.addColorStop(0,'#1a0838');gr.addColorStop(1,'#6a2ac8');g.fillStyle=gr;g.fill();g.strokeStyle='#0a0418';g.lineWidth=2;g.stroke();
      g.fillStyle='#e8d0ff';for(let j=2;j<seg;j+=2){const q=j/seg,sx=Math.sin(q*3+f.t*6+f.ph)*10*q;g.beginPath();g.arc(sx+(1-q)*6,-q*H,1.6+(1-q)*1.4,0,TAU);g.fill();}
      g.restore();continue;}
    if(f.type==='dashline'){
      const a=clamp(f.t/f.life,0,1);
      g.strokeStyle='rgba(200,140,255,'+(0.25+0.5*a)+')';g.lineWidth=4+a*10;g.setLineDash([14,10]);g.lineCap='round';
      g.beginPath();g.moveTo(f.x1,f.y1);g.lineTo(f.x2,f.y2);g.stroke();g.setLineDash([]);
      g.fillStyle='rgba(255,120,255,'+(0.3+0.4*a)+')';g.beginPath();g.arc(f.x2,f.y2,10+a*8,0,TAU);g.fill();
    }else if(f.type==='spike'){
      if(f.t<f.warn){
        const a=f.t/f.warn;
        g.fillStyle='rgba(190,120,255,'+(0.2+0.45*a*(0.6+0.4*Math.sin(f.t*30)))+')';
        g.fillRect(f.x-f.w/2,f.y-6,f.w,6);
        for(let k=0;k<4;k++){g.fillRect(f.x-f.w/2+6+k*13,f.y-4-a*6,3,4+a*6);}
      }else{
        const k=clamp((f.t-f.warn)/0.12,0,1)*(1-clamp((f.t-f.warn-0.35)/0.25,0,1));
        g.fillStyle='#2a1a48';g.strokeStyle='#d8b8ff';g.lineWidth=1.5;
        for(let j=0;j<5;j++){const sx=f.x-f.w/2+j*(f.w/5)+f.w/10,hh=(50+((j*37)%22))*k;
          g.beginPath();g.moveTo(sx-6,f.y);g.lineTo(sx,f.y-hh);g.lineTo(sx+6,f.y);g.closePath();g.fill();g.stroke();}
      }
    }else if(f.type==='meteor'){
      if(f.t<0)continue;
      if(f.t<f.warn){
        /* тень-маркер на полу */
        const a=f.t/f.warn;let ty=Math.floor(f.y/TILE);while(ty<ARENA_FLOOR&&!isSolid(Math.floor(f.x/TILE),ty))ty++;
        g.strokeStyle='rgba(255,140,60,'+(0.3+0.6*a)+')';g.lineWidth=2;
        g.beginPath();g.ellipse(f.x,ty*TILE-2,10+20*(1-a),4+5*(1-a),0,0,TAU);g.stroke();
        g.fillStyle='rgba(255,90,30,'+(0.15+0.25*a)+')';g.beginPath();g.ellipse(f.x,ty*TILE-2,8,3,0,0,TAU);g.fill();
      }else{
        const gr=g.createRadialGradient(f.x,f.y,2,f.x,f.y,22);gr.addColorStop(0,'rgba(255,240,180,1)');gr.addColorStop(0.4,'rgba(255,120,40,.9)');gr.addColorStop(1,'rgba(255,60,10,0)');
        g.fillStyle=gr;g.beginPath();g.arc(f.x,f.y,22,0,TAU);g.fill();
        g.fillStyle='#3a1a10';g.beginPath();g.arc(f.x,f.y,9,0,TAU);g.fill();
      }
    }
  }
  g.restore();
}
/* декор арены: жаровни, руны на полу, решётка ворот */
const ARENA_BRAZ=[[6,2011],[15,2003],[20,2003],[29,2011],[44,1996],[51,1996],[66,2011],[75,2003],[80,2003],[89,2011]];
function drawArenaDecor(g,tx0,tx1,ty0,ty1){
  if(G.dim!==0||ty1<ARENA_Y0-2||ty0>ARENA_Y1)return;
  const t=G.time,boss=G.arenaFight,ph=(bossAlive()||{b:{phase:1}}).b?((bossAlive()||{b:{phase:1}}).b.phase||1):1;
  const fc=G.wf.bossDead?['#5ab8ff','#d8f4ff']:ph===3?['#ff3a3a','#ffd0a0']:['#a060ff','#f0d8ff'];
  g.save();
  for(const [bx,by] of ARENA_BRAZ){
    if(bx<tx0-2||bx>tx1+2||by<ty0-3||by>ty1+2)continue;
    const x=bx*TILE+16,y=(by+1)*TILE;
    g.fillStyle='#1a1424';g.fillRect(x-4,y-30,8,30);g.fillRect(x-9,y-4,18,4);
    g.fillStyle='#2a2238';g.beginPath();g.moveTo(x-13,y-30);g.lineTo(x+13,y-30);g.lineTo(x+8,y-22);g.lineTo(x-8,y-22);g.closePath();g.fill();
    for(let k=0;k<3;k++){const fh=14+Math.sin(t*9+k*2+bx)*5;g.fillStyle=k===1?fc[1]:fc[0];g.beginPath();g.moveTo(x-7+k*5,y-30);g.quadraticCurveTo(x-5+k*5,y-30-fh,x-2+k*5,y-30);g.closePath();g.fill();}
    const gr=g.createRadialGradient(x,y-38,2,x,y-38,70);gr.addColorStop(0,hexA(fc[0],0.35));gr.addColorStop(1,hexA(fc[0],0));
    g.globalCompositeOperation='lighter';g.fillStyle=gr;g.beginPath();g.arc(x,y-38,70,0,TAU);g.fill();g.globalCompositeOperation='source-over';
  }
  /* руны на полу */
  if(ARENA_FLOOR>=ty0&&ARENA_FLOOR<=ty1+1){
    const a=0.25+0.2*Math.sin(t*1.5);
    g.strokeStyle=hexA(fc[0],a);g.lineWidth=2;
    for(let x=6;x<MW-6;x+=4){if(x<tx0-1||x>tx1+1)continue;const px=x*TILE+16,py=ARENA_FLOOR*TILE+14;
      g.beginPath();if(x%8===2){g.arc(px,py,7,0,TAU);g.moveTo(px-7,py);g.lineTo(px+7,py);}else{g.moveTo(px-6,py+6);g.lineTo(px,py-7);g.lineTo(px+6,py+6);g.closePath();}g.stroke();}
  }
  /* ворота */
  if(ARENA_Y0>=ty0-1&&ARENA_Y0<=ty1){
    const x0=ARENA_GX0*TILE,x1=(ARENA_GX1+1)*TILE,y0=ARENA_Y0*TILE;
    if(getTile(ARENA_GX0,ARENA_Y0)===T_ARENA){
      g.fillStyle='rgba(255,90,200,'+(0.25+0.2*Math.sin(t*6))+')';g.fillRect(x0,y0,x1-x0,TILE*2);
      g.strokeStyle='#d8b8ff';g.lineWidth=3;for(let x=x0+8;x<x1;x+=14){g.beginPath();g.moveTo(x,y0);g.lineTo(x,y0+TILE*2);g.stroke();}
    }else{
      g.strokeStyle=hexA(fc[0],0.5);g.lineWidth=3;g.beginPath();g.moveTo(x0-4,y0);g.lineTo(x0-4,y0+TILE*2);g.moveTo(x1+4,y0);g.lineTo(x1+4,y0+TILE*2);g.stroke();
    }
  }
  /* табличка над воронкой */
  if(ARENA_Y0-4>=ty0&&ARENA_Y0-4<=ty1&&!G.wf.bossDead){
    g.fillStyle='rgba(10,6,20,.8)';g.fillRect(48*TILE-90,(ARENA_Y0-5)*TILE,180,22);
    g.fillStyle='#e0c8ff';g.font='700 12px system-ui,sans-serif';g.textAlign='center';g.fillText('АРЕНА ПОЖИРАТЕЛЯ',48*TILE,(ARENA_Y0-5)*TILE+15);
  }
  g.restore();
}
/* святилище Сердца Бездны */
function drawHeartShrine(g,tx0,tx1,ty0,ty1){
  if(G.dim!==0||player.prog.heart||G.wf.heartTaken)return;
  if(_hsSeed!==G.seed){_hsSeed=G.seed;_hs=heartSpot();}
  const hx=_hs.x,hy=_hs.y;
  if(hx<tx0-4||hx>tx1+4||hy<ty0-4||hy>ty1+4)return;
  const x=hx*TILE+16,y=hy*TILE-14+Math.sin(G.time*2)*4,t=G.time;
  g.save();
  g.globalCompositeOperation='lighter';
  const gr=g.createRadialGradient(x,y,2,x,y,120);gr.addColorStop(0,'rgba(220,120,255,.55)');gr.addColorStop(1,'rgba(120,40,220,0)');
  g.fillStyle=gr;g.beginPath();g.arc(x,y,120,0,TAU);g.fill();
  g.globalCompositeOperation='source-over';
  const p=1+0.08*Math.sin(t*5)+0.05*Math.sin(t*9.3);
  g.translate(x,y);g.scale(p,p);
  g.fillStyle='#7a1aa8';g.beginPath();g.moveTo(0,12);g.bezierCurveTo(-18,-2,-12,-16,0,-7);g.bezierCurveTo(12,-16,18,-2,0,12);g.fill();
  g.fillStyle='#d890ff';g.beginPath();g.moveTo(0,8);g.bezierCurveTo(-11,-1,-8,-11,0,-4);g.bezierCurveTo(8,-11,11,-1,0,8);g.fill();
  g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.ellipse(-5,-6,2.5,1.6,-0.5,0,TAU);g.fill();
  g.restore();
  for(let k=0;k<6;k++){const a=t*1.2+k*TAU/6;g.fillStyle='rgba(220,170,255,.8)';g.fillRect(x+Math.cos(a)*30-1.5,y+Math.sin(a)*12-1.5,3,3);}
  if(Math.random()<0.2)spawnPart(x+rnd(-14,14),y+rnd(-14,14),rnd(-10,10),rnd(-40,-10),1,'#d8a0ff',2,-20);
}
function checkHeartPickup(){
  if(G.dim!==0||player.prog.heart||G.wf.heartTaken)return;
  if(_hsSeed!==G.seed){_hsSeed=G.seed;_hs=heartSpot();}
  if(Math.hypot(player.x-(_hs.x*TILE+16),(player.y-player.h*0.5)-(_hs.y*TILE-14))<40){
    player.prog.heart=true;G.wf.heartTaken=true;
    shake(10);SFX.ore();vib(80);burst(player.x,player.y-30,40,'#d890ff',260,4);
    floatText(player.x,player.y-70,'💜 Сердце Бездны!','#e0b0ff');
    UI.toast('Сердце Бездны получено — нужно для портала в Ад');
    saveGame();
  }
}
