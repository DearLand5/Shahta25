'use strict';
/* ============================================================
   ВЛАДЫКИ ПРЕИСПОДНЕЙ: искусственный интеллект.
   Общая часть: фазы по здоровью, выбор атаки по ситуации (дальность,
   игрок в воздухе/стоит на месте, мало здоровья), связки атак.
   У каждого босса: intro (поведение в катсцене), pool (атаки по фазам),
   w (веса под ситуацию), tick (сами атаки).
   ============================================================ */
const HB_PHASE_NAMES={
  herald:['','Пепельная буря','Пламя Вестника'],
  mother:['','Голод Утробы','Мать вырвалась из корней!'],
  toadking:['','Гнев Топей','Корона треснула!'],
  emperor:['','Проклятие Катакомб','Отражения Императора'],
  warden:['','Расплавленный гнев','Ядро раскрыто!'],
  archdemon:['','Крылья Преисподней','Эхо Владык','Конец света']
};
function hbBounds(m){const b=m.hbB;return {minX:(b.x0+2)*TILE+m.w*0.5,maxX:(b.x0+b.W-2)*TILE-m.w*0.5,top:(b.y0+2)*TILE,floor:(b.y0+b.FY)*TILE,cx:(b.x0+b.W/2)*TILE};}
function hbPredict(t){const lead=Math.min(1.2,t);return {x:player.x+player.vx*lead,y:player.y-player.h*0.5+(player.onGround?0:clamp(player.vy*lead*0.4,-120,120))};}
/* полёт к точке без рывков */
function hbHover(m,tx,ty,sp,dt,k){
  m.vx=lerp(m.vx,clamp((tx-m.x)*2,-sp,sp),Math.min(1,dt*(k||3)));
  m.vy=lerp(m.vy,clamp((ty-m.y)*2,-sp,sp),Math.min(1,dt*(k||3)));
  m.x+=m.vx*dt;m.y+=m.vy*dt;
}
/* шаг по земле с гравитацией; пол — главный пол святилища или помост */
function hbGround(m,dt,R){
  m.vy+=1900*dt;if(m.vy>1100)m.vy=1100;
  m.x+=m.vx*dt;m.y+=m.vy*dt;
  const fl=Math.min(R.floor,hbFloorAt(m.x,m.y-m.h*0.4));
  m.onGround=false;
  if(m.y>=fl&&m.vy>=0){m.y=fl;m.vy=0;m.onGround=true;}
}
function hbIdleTime(B,base){return Math.max(0.28,base-(B.phase-1)*0.18)*(B.queue&&B.queue.length?0.25:1)*(B.enr?0.6:1);}
function hbPick(m,B,A){
  if(B.queue&&B.queue.length){const a=B.queue.shift();B.last2=B.last;B.last=a;B.atk=a;B.at=0;B.sub=0;return;}
  const pool=A.pool(B);
  const dist=Math.hypot(player.x-m.x,player.y-player.h*0.5-(m.y-m.h*0.5));
  const S={dist,air:!player.onGround||!!grapple,still:(B.stillT||0)>1.3,low:player.hp<player.maxHp*0.35,
    minions:mobs.filter(o=>o.alive&&o.hbMinion).length};
  const w=A.w?A.w(m,B,S):{};
  let tot=0;const opts=pool.filter(a=>a!==B.last&&(pool.length<4||a!==B.last2)).map(a=>{const v=Math.max(0.05,w[a]===undefined?1:w[a]);tot+=v;return [a,v];});
  let r=Math.random()*tot,a=opts.length?opts[0][0]:pool[0];for(const [k,v] of opts){r-=v;if(r<=0){a=k;break;}}
  if(A.follow&&B.phase>=2&&Math.random()<(B.phase>=3?0.6:0.35)){const f=A.follow[a];if(f){const n=f[Math.floor(Math.random()*f.length)];if(pool.includes(n))B.queue=[n];}}
  B.last2=B.last;B.last=a;B.atk=a;B.at=0;B.sub=0;
}
function hbDone(B){B.atk='idle';B.at=0;B.sub=0;}
/* щупальце разорвало лестницы, поставленные игроком, в столбе шириной 3 клетки (без возврата в запас) */
function hbRipLadders(x,yTop,yBot){
  const cx=Math.floor(x/TILE);let n=0;
  for(let tx=cx-1;tx<=cx+1;tx++)for(let ty=Math.floor(yTop/TILE);ty<=Math.floor(yBot/TILE);ty++){
    if(!placedLadders.hasXY(tx,ty))continue;
    placedLadders.delete(tx+','+ty);ccMarkDirty(tx,ty);n++;
    for(let k=0;k<3;k++)spawnPart(tx*TILE+16,ty*TILE+16,rnd(-120,120),rnd(-160,40),rnd(0.4,0.8),k?'#8a5a30':'#c0142a',rnd(2,4),600);
  }
  if(n)SFX.breakBlock();
}
function hbBossUpdate(m,dt,dx,dy,dist){
  const id=m.def.hb,A=HB_AI[id],B=m.b;if(!A||!B)return;
  m.stun=0;m.frozen=0;
  const R=hbBounds(m);
  if(G.bossCut){A.intro(m,B,G.bossCut,dt,R);return;}
  if(m.invuln>0)m.invuln-=dt;
  /* фазы */
  const n=m.def.hbPhases||3,f=m.hp/m.maxHp;
  const want=clamp(1+Math.floor((1-f)*n+1e-9),1,n);
  if(want>B.phase&&B.atk!=='trans'){
    B.phase=want;B.atk='trans';B.at=0;B.sub=0;B.queue=[];m.invuln=2.6;m.tele=0;
    hbFx.length=0;beams.length=0;
    for(let i=projectiles.length-1;i>=0;i--)if(projectiles[i].owner==='mob')projectiles.splice(i,1);
    shake(16);SFX.boom();vib(160);
    const H=hbById(id);G.hbFlash={t:1,col:H.col};
    floatText(m.x,m.y-m.h-30,'Фаза '+want+' · '+HB_PHASE_NAMES[id][want-1],H.col);
    UI.toast(m.def.name+': '+HB_PHASE_NAMES[id][want-1]);
    if(A.onPhase)A.onPhase(m,B,want,R);
  }
  B.rage=1+(B.phase-1)*0.14;
  B.at+=dt*B.rage;
  if(B.weak>0)B.weak-=dt;if(B.armor>0)B.armor-=dt;
  {const mv=Math.abs(player.x-(B.px===undefined?player.x:B.px))+Math.abs(player.y-(B.py===undefined?player.y:B.py));B.px=player.x;B.py=player.y;
    B.stillT=mv<1.2*dt*60?(B.stillT||0)+dt:Math.max(0,(B.stillT||0)-dt*2);}
  if(!(B.sideT>0)){B.sideT=rnd(3,5.5)/B.rage;B.side=Math.random()<0.5?-1:1;}else B.sideT-=dt;
  if(B.atk==='ult')bfBossUlt(m,B,dt,R);             /* коронный удар (44-bossfight) */
  else if(B.stagT>0||B.atk==='rest'||B.atk==='stagger')hbStaggerTick(m,B,dt,R);
  else A.tick(m,B,dt,R,dx,dy,dist);
  m.x=clamp(m.x,R.minX,R.maxX);
  if(m.y-m.h<R.top){m.y=R.top+m.h;if(m.vy<0)m.vy=0;}
  /* касание тела */
  const cy=m.y-m.h*0.5;
  if(!A.noTouch&&m.atkCd<=0&&Math.abs(player.x-m.x)<m.w*0.42+10&&Math.abs(player.y-player.h*0.5-cy)<m.h*0.45+10){m.atkCd=1.1;mobMelee(m,m.def.dmg*(B.touch||0.5),null,360,-240);}
}

const HB_AI={};
/* ================= ПЕПЕЛЬНЫЙ ВЕСТНИК =================
   Глашатай в пепельном плаще с огромным горном. Летает, трубит в горн,
   поднимает бури и смерчи; в 3-й фазе крылья горят и он рвётся в рывки сериями. */
HB_AI.herald={
  intro(m,B,c,dt,R){const k=eOut((c.t-0.6)/(c.roarT-0.9));m.x=m.home.x+Math.sin(c.t*1.3)*30*(1-k);m.y=m.home.y-300*(1-k);m.alpha=clamp(k*1.3,0,1);m.facing=player.x<m.x?-1:1;B.horn=c.t>c.roarT-0.6&&c.t<c.roarT+1.4?1:0;},
  pool(B){const p=['fan','dash','bats','rain'];if(B.phase>=2)p.push('storm','tornado');if(B.phase>=3)p.push('nova');return p;},
  w(m,B,S){return {fan:S.dist>220?1.6:0.8,dash:S.still?2.4:S.dist>300?1.5:0.9,bats:S.minions>=4?0.05:0.8,rain:S.still?2:1,storm:1.2,tornado:S.air?0.6:1.4,nova:S.dist<240?2:0.9};},
  follow:{storm:['fan','rain'],tornado:['dash','fan'],nova:['dash'],dash:['fan','nova'],rain:['dash']},
  tick(m,B,dt,R,dx){
    const D=m.def.dmg,cy=m.y-m.h*0.5;m.facing=dx>=0?1:-1;B.horn=0;
    const hov=(sp)=>hbHover(m,clamp(player.x+B.side*(210+40*Math.sin(G.time*0.9)),R.minX,R.maxX),clamp(player.y-95,R.top+m.h,R.floor-1.5*TILE),sp,dt);
    switch(B.atk){
      case 'trans':m.vx*=0.9;m.vy*=0.9;hbHover(m,R.cx,R.top+m.h+3*TILE,120,dt);B.horn=1;
        if(Math.random()<0.6)spawnPart(m.x+rnd(-80,80),cy+rnd(-80,80),rnd(-60,60),rnd(-60,60),0.7,B.phase>=3?'#ff7a2a':'#9a8a80',3,0);
        if(B.at>2.4)hbDone(B);break;
      case 'idle':hov(m.def.spd*B.rage);if(B.at>hbIdleTime(B,1.05))hbPick(m,B,this);break;
      case 'fan':{hov(60);m.tele=Math.min(1,B.at/0.55);B.horn=m.tele;
        const n=B.phase>=2?7:5,vol=B.phase>=2?2:1;
        if(B.sub<vol&&B.at>0.55+B.sub*0.45){B.sub++;m.tele=0;SFX.hit();
          const P=hbPredict(Math.hypot(dx,player.y-cy)/300*0.7),hx=m.x+m.facing*m.w*0.55,hy=cy-10,base=Math.atan2(P.y-hy,P.x-hx)+(B.sub===2?0.11:0);
          for(let k=0;k<n;k++)hbShot(hx,hy,base+(k-(n-1)/2)*0.2,290,D*0.55,'ember',{size:7,fx:{burn:2},ghost:false});}
        if(B.at>0.6+vol*0.45+0.3)hbDone(B);break;}
      case 'dash':{
        if(B.sub===0){const P=hbPredict(0.55);const a=Math.atan2(P.y-cy,P.x-m.x);B.tx=clamp(P.x+Math.cos(a)*140,R.minX,R.maxX);B.ty=clamp(P.y+Math.sin(a)*140,R.top+m.h*0.5,R.floor-m.h*0.5);
          B.sub=1;B.chain=(B.chain===undefined||B.chain<=0)?(B.phase>=3?3:B.phase>=2?2:1):B.chain;hbLine(m.x,cy,B.tx,B.ty,0.75,'#ffb070',4);}
        if(B.at<0.75){m.tele=B.at/0.75;m.vx*=0.88;m.vy*=0.88;m.x+=m.vx*dt;m.y+=m.vy*dt;}
        else{m.tele=0;const ax=B.tx-m.x,ay=B.ty-cy,l=Math.hypot(ax,ay),sp=980*dt*B.rage;B.dashing=1;
          if(l>sp){m.x+=ax/l*sp;m.y+=ay/l*sp;m.vx=ax/l*300;m.vy=ay/l*300;}
          else{B.dashing=0;B.chain--;if(B.chain>0){B.sub=0;B.at=0.25;}else hbRest(m,B,1.3);}
          if(Math.random()<0.9)spawnPart(m.x+rnd(-20,20),cy+rnd(-30,30),0,0,0.5,Math.random()<0.5?'#ff7a2a':'#9a8a80',5,0);
          if(Math.abs(player.x-m.x)<m.w*0.5+14&&Math.abs(player.y-player.h*0.5-cy)<m.h*0.5&&m.atkCd<=0){m.atkCd=0.9;mobMelee(m,D*0.9,{burn:3},460,-280);}}
        break;}
      case 'bats':{hov(50);m.tele=Math.min(1,B.at/0.7);B.horn=1;
        if(B.at>0.7&&B.sub<1){B.sub=1;m.tele=0;SFX.uiBack();floatText(m.x,m.y-m.h-20,'Стая!','#ffb070');
          for(let k=0;k<(B.phase>=2?4:3);k++){const c=hbMinion('cinderbat',m.x+rnd(-70,70),cy+rnd(-30,30));if(c){c.vx=rnd(-200,200);c.vy=rnd(-160,40);}}}
        if(B.at>1.4)hbDone(B);break;}
      case 'rain':{hov(70);m.tele=Math.min(1,B.at/0.5);
        if(B.sub===0&&B.at>0.4){B.sub=1;const n=B.phase>=3?10:7;
          for(let k=0;k<n;k++){const x=clamp(k===0?player.x:k===1?hbPredict(1.2).x:player.x+rnd(-420,420),R.minX-20,R.maxX+20);
            hbMeteor(x,R.top+8,{warn:0.7+k*0.14,dmg:D*0.6,r:14,blast:52,col:'#ff8a3a',patch:{w:44,dur:3,type:'fire',dps:D*0.12},src:'угольный дождь'});}
          floatText(m.x,m.y-m.h-20,'Угольный дождь!','#ffb070');}
        if(B.at>2.2)hbDone(B);break;}
      case 'storm':{
        hbHover(m,clamp(R.cx-B.side*500,R.minX,R.maxX),R.top+m.h+TILE,140,dt);B.horn=B.at<0.8?1:0;
        if(B.sub===0){B.sub=1;B.wind=Math.sign(player.x-m.x)||1;floatText(m.x,m.y-m.h-20,'Пепельная буря!','#c8b8a8');}
        if(B.at>0.8&&B.at<4.6){
          if(!cheats.god)player.vx+=B.wind*300*dt;
          B.wt=(B.wt||0)-dt;if(B.wt<=0){B.wt=B.phase>=3?0.28:0.38;
            const sx=B.wind>0?R.minX-m.w*0.5+10:R.maxX+m.w*0.5-10,sy=clamp(player.y-player.h*0.5+rnd(-90,90),R.top+20,R.floor-12);
            hbShot(sx,sy,B.wind>0?0:Math.PI,360,D*0.4,'ember',{size:6,fx:{burn:1},ghost:true,life:4});}
          G.hbWind=B.wind;}
        else G.hbWind=0;
        if(B.at>4.9){G.hbWind=0;hbDone(B);}break;}
      case 'tornado':{hov(60);m.tele=Math.min(1,B.at/0.6);B.horn=m.tele;
        if(B.sub===0&&B.at>0.6){B.sub=1;m.tele=0;SFX.boom();
          for(const s of (B.phase>=3?[-1,1,0]:[-1,1])){const x=clamp(m.x+s*120,R.minX,R.maxX);
            hbFx.push({type:'tornado',t:0,x,y:R.floor,vx:(s||B.side)*150,sp:220,homing:s===0?120:0,h:4.4*TILE,life:7,dmg:D*0.5,col:'#a89888',minX:R.minX-m.w*0.4,maxX:R.maxX+m.w*0.4,src:'пепельный смерч'});}}
        if(B.at>1.3)hbDone(B);break;}
      case 'nova':{hov(20);m.tele=Math.min(1,B.at/0.7);
        const vol=B.phase>=3?2:1;
        if(B.sub<vol&&B.at>0.7+B.sub*0.6){B.sub++;m.tele=0;shake(6);SFX.boom();
          const n=24,gap=Math.floor(Math.random()*n),off=Math.random()*TAU;
          for(let k=0;k<n;k++){if(Math.abs(k-gap)<=1||Math.abs(k-((gap+n/2)%n))<=1)continue;const a=off+k/n*TAU;hbShot(m.x+Math.cos(a)*40,cy+Math.sin(a)*40,a,210,D*0.45,'ember',{size:6,life:4});}}
        if(B.at>2.2)hbDone(B);break;}
    }
  }
};
/* ================= МАТЬ ПЛОТИ =================
   Огромная утроба, вросшая в пол корнями-венами. Бьёт щупальцами из пола,
   швыряет сгустки, рожает мясных клочков. В 3-й фазе вырывает корни и прыгает. */
HB_AI.mother={
  intro(m,B,c,dt,R){m.x=m.home.x;m.y=R.floor;m.facing=player.x<m.x?-1:1;B.open=c.t>c.roarT-0.5&&c.t<c.roarT+1.2?1:0;},
  pool(B){const p=['tentacles','clots','birth','slam'];if(B.phase>=2)p.push('bloodrain','wave','flood','lash','leeches','leap');if(B.phase>=3)p.push('leap','crawl','flood');
    if((B.camp||0)>2.2)p.push('grab');return p;},
  w(m,B,S){const up=player.y<(m.hbB.y0+m.hbB.FY-1.5)*TILE;
    return {tentacles:S.still?2.6:1.2,clots:S.dist>300?1.6:0.9,birth:S.minions>=5?0.05:0.8,slam:S.dist<190?3:0.05,bloodrain:1.2,wave:S.air?0.4:1.4,
      flood:up?0.3:1.6,lash:up?2.6:0.8,leeches:S.dist>240?1.6:0.9,leap:up||S.dist>260?2.2:1,crawl:S.dist>200?1.2:0.4,grab:10};},
  follow:{wave:['tentacles','clots'],leap:['wave','lash'],bloodrain:['tentacles','leeches'],slam:['wave'],flood:['clots','leeches'],lash:['leap']},
  onPhase(m,B,p){if(p===2){B.free=true;}if(p===2||p===3){B.free=true;shake(20);for(let i=0;i<40;i++)spawnPart(m.x+rnd(-60,60),m.y-rnd(0,20),rnd(-200,200),rnd(-400,-100),rnd(0.6,1.2),i%2?'#8a0a1a':'#ff5a6a',rnd(2,5),700);}},
  tick(m,B,dt,R,dx){
    const D=m.def.dmg,cy=m.y-m.h*0.5;B.open=Math.max(0,(B.open||0)-dt*2);
    /* «застроился» лестницами под потолок и стреляет сверху — Мать это чувствует */
    {const high=player.y<R.floor-3.2*TILE,lad=player.onLadder||getTile(Math.floor(player.x/TILE),Math.floor((player.y-4)/TILE))===T_LADDER;
      B.camp=high&&(lad||!player.onGround)?(B.camp||0)+dt:Math.max(0,(B.camp||0)-dt*0.7);}
    if(!B.free){m.vx=0;m.vy=0;m.y=R.floor;m.facing=dx>=0?1:-1;}
    else if(B.atk!=='leap'){m.vx=lerp(m.vx,0,dt*4);hbGround(m,dt,R);if(B.atk!=='crawl')m.facing=dx>=0?1:-1;}
    switch(B.atk){
      case 'trans':m.tele=Math.min(1,B.at/2);B.open=1;if(Math.random()<0.5)spawnPart(m.x+rnd(-60,60),cy+rnd(-50,50),rnd(-80,80),rnd(-120,0),0.7,'#c0142a',3,300);if(B.at>2.4)hbDone(B);break;
      case 'idle':if(B.at>hbIdleTime(B,1.15))hbPick(m,B,this);break;
      case 'tentacles':{m.tele=Math.min(1,B.at/0.5);
        if(B.sub===0&&B.at>0.4){B.sub=1;m.tele=0;const n=B.phase>=2?5:3;
          for(let k=0;k<n;k++){const x=clamp(k===0?hbPredict(0.85).x:k===1?player.x:player.x+rnd(-320,320),R.minX-m.w*0.4,R.maxX+m.w*0.4);
            hbPillar(x,player.y-8,{t:-k*0.12,warn:0.85,w:40,h:3.6*TILE,dmg:D*0.8,col:'#c0142a',style:'tentacle',fx:{bleed:2},src:'щупальце Матери',lift:380});}
          floatText(m.x,m.y-m.h-20,'Щупальца!','#ff8a9a');}
        if(B.at>2.1)hbDone(B);break;}
      case 'clots':{m.tele=Math.min(1,B.at/0.6);B.open=m.tele;
        const n=B.phase>=2?6:4;
        if(B.sub===0&&B.at>0.6){B.sub=1;m.tele=0;SFX.hit();
          for(let k=0;k<n;k++){const tx=clamp((k===0?hbPredict(1.1).x:player.x+rnd(-300,300)),R.minX-m.w*0.4,R.maxX+m.w*0.4),T=rnd(0.95,1.35),sx=m.x,sy=cy-20,ty=R.floor-10;
            hbShot(sx,sy,0,0,D*0.6,'clot',{vx:(tx-sx)/T,vy:(ty-sy-0.5*900*T*T)/T,grav:900,size:10,ghost:false,life:4,fx:{slow:1.5},onEnd:(p)=>addPatch(p.x,p.y-8,60,5,'blood',D*0.08)});}}
        if(B.at>1.3)hbDone(B);break;}
      case 'birth':{m.tele=Math.min(1,B.at/0.8);B.open=1;
        if(B.sub===0&&B.at>0.8){B.sub=1;m.tele=0;SFX.mobDie&&SFX.mobDie(m.def);floatText(m.x,m.y-m.h-20,'Утроба рожает!','#ff8a9a');
          for(let k=0;k<(B.phase>=2?3:2);k++){const c=hbMinion('meatling',m.x+rnd(-30,30),cy+20);if(c){c.vx=rnd(-280,280);c.vy=-rnd(250,420);}}
          burst(m.x,cy,24,'#a0101e',220,3.4);}
        if(B.at>1.6)hbDone(B);break;}
      case 'slam':{m.tele=Math.min(1,B.at/0.5);B.whip=m.tele;
        if(B.sub===0&&B.at>0.5){B.sub=1;m.tele=0;B.whip=2;shake(8);SFX.boom();
          const fx=m.x+m.facing*(m.w*0.5+70);hbBoom(fx,R.floor-10,90,'#c0142a');
          if(Math.abs(player.x-fx)<120&&player.y>R.floor-4*TILE)mobMelee(m,D*1.0,{bleed:2},520,-320);}
        if(B.at>1.1){B.whip=0;hbDone(B);}break;}
      case 'bloodrain':{m.tele=Math.min(1,B.at/0.6);B.open=1;
        if(B.sub===0){B.sub=1;B.gap=clamp(player.x+rnd(-200,200),R.minX,R.maxX);floatText(m.x,m.y-m.h-20,'Кровавый дождь!','#ff5a6a');}
        if(B.at>0.6&&B.at<3.6){B.rt=(B.rt||0)-dt;if(B.rt<=0){B.rt=0.06;
          let x=rnd(R.minX-m.w*0.4,R.maxX+m.w*0.4);if(Math.abs(x-B.gap)<90)x+=Math.sign(x-B.gap||1)*180;
          hbShot(x,R.top+6,Math.PI/2,260,D*0.35,'drop',{size:4,grav:500,life:3,ghost:true,fx:{slow:1}});}
          B.gapShow=B.gap;}
        else B.gapShow=null;
        if(B.at>3.9)hbDone(B);break;}
      case 'wave':{m.tele=Math.min(1,B.at/0.7);
        if(B.sub===0&&B.at>0.7){B.sub=1;m.tele=0;shake(10);SFX.boom();
          for(const s of [-1,1])hbWall(m.x+s*(m.w*0.5),R.floor,s*320,{h:52,dmg:D*0.7,col:'#c0142a',style:'blood',life:4,fx:{bleed:2},src:'кровавая волна'});
          if(B.phase>=3)hbLater(0.7,()=>{if(hbFight())for(const s of [-1,1])hbWall(m.x+s*(m.w*0.5),R.floor,s*300,{h:52,dmg:D*0.7,col:'#c0142a',style:'blood',life:4,src:'кровавая волна'});});}
        if(B.at>1.4)hbDone(B);break;}
      case 'flood':{m.tele=Math.min(1,B.at/0.8);B.open=1;
        /* кровь заливает пол — спасайся на верхних выступах */
        if(B.sub===0&&B.at>0.8){B.sub=1;m.tele=0;shake(8);SFX.boom();floatText(m.x,m.y-m.h-20,'Прилив крови!','#ff5a6a');
          hbFx.push({type:'flood',t:0,rise:1.1,hold:B.phase>=3?3.2:2.6,fall:1,y:R.floor,h:(B.phase>=3?3.1:2.6)*TILE,x0:(m.hbB.x0+2)*TILE,x1:(m.hbB.x0+m.hbB.W-2)*TILE,dps:D*0.55,col:'#a0101e',src:'прилив крови'});}
        if(B.at>2.2)hbDone(B);break;}
      case 'lash':{m.tele=Math.min(1,B.at/0.5);B.whip=m.tele;
        /* щупальца хлещут поперёк выступов: сначала верхний ярус, потом нижний */
        if(B.sub===0&&B.at>0.4){B.sub=1;const ys=[R.floor-4.6*TILE,R.floor-1.4*TILE];if(player.y>R.floor-2.5*TILE)ys.reverse();
          if(player.y<R.floor-6*TILE)ys.unshift(player.y-player.h*0.5);           /* выше выступов — хлещет и там */
          ys.forEach((y,i)=>hbFx.push({type:'sweep',t:-i*0.75,warn:0.85,x:R.cx,y,w:2000,h:62,dmg:D*0.85,col:'#ff3a4a',fx:{bleed:2},src:'хлёст щупалец',style:'flesh'}));
          floatText(m.x,m.y-m.h-20,'Хлёст!','#ff8a9a');}
        if(B.at>2.4){B.whip=0;hbDone(B);}break;}
      case 'grab':{m.tele=Math.min(1,B.at/0.5);B.open=1;
        /* хватка плоти: щупальца вырастают до самого шахтёра и рвут поставленные лестницы */
        if(B.sub===0){B.sub=1;B.camp=0;SFX.hit();floatText(player.x,player.y-player.h-30,'Плоть рвёт лестницы!','#ff5a6a');
          const n=B.phase>=2?3:2;
          for(let k=0;k<n;k++){const x=clamp(k===0?player.x:hbPredict(0.9).x+(k===1?-1:1)*rnd(50,100),R.minX,R.maxX);
            const fy=hbFloorAt(x,player.y-8),h=Math.max(4*TILE,fy-player.y+2.5*TILE);
            hbPillar(x,player.y-8,{t:-k*0.2,warn:0.9,w:54,h,dmg:D*1.35,col:'#c0142a',style:'tentacle',big:true,fx:{bleed:3,stun:0.4},src:'хватка Матери'});
            if(k===0)hbFx.push({type:'mark',t:0,life:0.9,x,y:player.y,r:46,col:'#ff3a4a'});      /* красная метка у ног — успей уйти */
            hbLater(0.9+k*0.2,()=>{if(hbFight())hbRipLadders(x,fy-h,fy);});}}
        if(B.at>2.0)hbDone(B);break;}
      case 'leeches':{m.tele=Math.min(1,B.at/0.6);B.open=m.tele;
        if(B.sub===0&&B.at>0.6){B.sub=1;m.tele=0;SFX.hit();
          for(let k=0;k<(B.phase>=3?6:4);k++){const a=-Math.PI/2+(k-1.5)*0.6;hbShot(m.x,cy-10,a,180,D*0.45,'leech',{homing:1.25,size:7,life:5.5,ghost:true,fx:{bleed:2}});}
          floatText(m.x,m.y-m.h-20,'Пиявки!','#ff8a9a');}
        if(B.at>1.3)hbDone(B);break;}
      case 'leap':{
        if(B.sub===0){B.sub=1;B.tx=clamp(hbPredict(1).x,R.minX,R.maxX);B.ty=Math.min(R.floor,hbFloorAt(B.tx,player.y-10));hbLine(m.x,m.y-20,B.tx,B.ty-20,0.6,'#ff5a6a',3);}
        if(B.at<0.6){m.tele=B.at/0.6;m.vx=0;hbGround(m,dt,R);}
        else if(B.sub===1){B.sub=2;m.tele=0;const T=1.0;m.vx=(B.tx-m.x)/T;m.vy=(B.ty-m.y-0.5*1900*T*T)/T;m.onGround=false;}
        else{hbGround(m,dt,R);
          if(m.onGround&&B.sub===2){B.sub=3;m.vx=0;shake(18);SFX.boom();vib(120);B.weak=1.6;
            hbBoom(m.x,m.y-10,140,'#c0142a');for(const s of [-1,1])hbWall(m.x+s*m.w*0.5,R.floor,s*340,{h:46,dmg:D*0.7,col:'#c0142a',style:'blood',life:3,src:'кровавая волна'});
            if(Math.abs(player.x-m.x)<m.w*0.6&&player.y>m.y-m.h)mobMelee(m,D*1.2,{stun:0.5},520,-300);
            floatText(m.x,m.y-m.h-20,'Сердце открыто!','#ffd060');}
          if(B.sub===3&&B.at>2.6)hbDone(B);}
        break;}
      case 'crawl':{B.touch=0.7;m.facing=Math.sign(dx)||m.facing;m.vx=m.facing*150*B.rage;
        if(B.at>1.8){B.touch=0.5;hbDone(B);}break;}
    }
  }
};
/* ================= КОРОЛЬ ТОПЕЙ =================
   Гигантская жаба в короне из серы. Язык притягивает, прыжки дают волны,
   ныряет в кислоту и выскакивает под игроком, кидает серные бомбы. */
HB_AI.toadking={
  intro(m,B,c,dt,R){const k=clamp((c.t-1.0)/(c.roarT-1.6),0,1);m.x=m.home.x;m.y=lerp(R.top+m.h,R.floor,k*k);m.facing=player.x<m.x?-1:1;
    if(k>=1&&!B.landed){B.landed=1;shake(20);SFX.boom();hbBoom(m.x,R.floor-6,200,'#d8e04a');for(let i=0;i<40;i++)spawnPart(m.x+rnd(-80,80),R.floor-4,rnd(-260,260),rnd(-520,-160),rnd(0.6,1.1),i%2?'#c8ff4a':'#7a8a2a',rnd(2,5),900);}
    B.croak=c.t>c.roarT-0.3&&c.t<c.roarT+1.2?1:0;},
  pool(B){const p=['tongue','spit','hop','croak'];if(B.phase>=2)p.push('dive','bombs');if(B.phase>=3)p.push('quake');return p;},
  w(m,B,S){return {tongue:S.dist>200&&S.dist<560?2:0.6,spit:S.dist>260?1.4:0.9,hop:S.dist>320?1.6:0.8,croak:S.dist<220?2.6:0.4,dive:S.still?2.2:1,bombs:1.1,quake:S.air?0.5:1.6};},
  follow:{croak:['tongue','spit'],tongue:['hop','bombs'],dive:['spit'],hop:['croak','spit']},
  tick(m,B,dt,R,dx){
    const D=m.def.dmg,cy=m.y-m.h*0.5;B.croak=Math.max(0,(B.croak||0)-dt*2);
    const ground=()=>{hbGround(m,dt,R);};
    if(B.atk!=='hop'&&B.atk!=='quake'&&B.atk!=='dive'){m.vx=lerp(m.vx,0,dt*6);ground();}
    switch(B.atk){
      case 'trans':m.tele=Math.min(1,B.at/2);B.croak=1;if(B.at>2.4)hbDone(B);break;
      case 'idle':{m.facing=dx>=0?1:-1;
        B.ht=(B.ht||0)-dt;if(m.onGround&&B.ht<=0){B.ht=rnd(0.9,1.4)/B.rage;const want=Math.abs(dx)>320?Math.sign(dx):Math.abs(dx)<180?-Math.sign(dx):0;if(want){m.vx=want*220;m.vy=-420;}}
        if(B.at>hbIdleTime(B,1.1)&&m.onGround)hbPick(m,B,this);break;}
      case 'tongue':{m.facing=dx>=0?1:-1;
        const mx=m.x+m.facing*m.w*0.42,my=m.y-m.h*0.55;
        if(B.sub===0){B.sub=1;const P=hbPredict(0.5),a=Math.atan2(P.y-my,P.x-mx);B.ta=a;B.tl=Math.min(560,Math.hypot(P.x-mx,P.y-my)+80);hbLine(mx,my,mx+Math.cos(a)*B.tl,my+Math.sin(a)*B.tl,0.6,'#ff7aa0',3);}
        if(B.at<0.6){m.tele=B.at/0.6;B.tongue={x:mx,y:my,a:B.ta,l:0};}
        else if(B.at<0.85){m.tele=0;const k=(B.at-0.6)/0.25;B.tongue={x:mx,y:my,a:B.ta,l:B.tl*k};
          const tx=mx+Math.cos(B.ta)*B.tongue.l,ty=my+Math.sin(B.ta)*B.tongue.l;
          if(!B.caught&&Math.hypot(player.x-tx,player.y-player.h*0.5-ty)<34){B.caught=true;hbHit(D*0.5,'язык Короля',{slow:1});}}
        else if(B.at<1.5){const k=1-(B.at-0.85)/0.65;B.tongue={x:mx,y:my,a:B.ta,l:B.tl*Math.max(0,k)};
          if(B.caught&&!cheats.god){const tx=mx+Math.cos(B.ta)*B.tongue.l,ty=my+Math.sin(B.ta)*B.tongue.l;player.x=lerp(player.x,tx,Math.min(1,dt*14));player.y=lerp(player.y,ty+player.h*0.5,Math.min(1,dt*14));player.vx=0;player.vy=0;}}
        else{B.tongue=null;if(B.caught&&Math.abs(player.x-m.x)<m.w*0.8){mobMelee(m,D*0.9,{poison:3},520,-360);floatText(m.x,m.y-m.h-20,'Хрум!','#c8ff4a');}B.caught=false;hbDone(B);}
        break;}
      case 'spit':{m.facing=dx>=0?1:-1;m.tele=Math.min(1,B.at/0.5);B.croak=m.tele;
        const n=B.phase>=3?5:3;
        if(B.sub===0&&B.at>0.5){B.sub=1;m.tele=0;SFX.hit();
          for(let k=0;k<n;k++){const tx=clamp(k===0?hbPredict(1).x:player.x+(k-(n-1)/2)*110,R.minX-m.w*0.4,R.maxX+m.w*0.4),T=rnd(0.9,1.2),sx=m.x+m.facing*m.w*0.4,sy=m.y-m.h*0.55,ty=R.floor-10;
            hbShot(sx,sy,0,0,D*0.55,'acid',{vx:(tx-sx)/T,vy:(ty-sy-0.5*900*T*T)/T,grav:900,size:9,ghost:false,life:4,fx:{poison:3},onEnd:(p)=>addPatch(p.x,p.y-8,56,5,'acid',D*0.14)});}}
        if(B.at>1.2)hbDone(B);break;}
      case 'hop':{
        if(B.sub===0){B.sub=1;B.tx=clamp(hbPredict(0.9).x,R.minX,R.maxX);hbLine(m.x,m.y-20,B.tx,R.floor-20,0.55,'#d8e04a',3);}
        if(B.at<0.55){m.tele=B.at/0.55;m.vx=0;ground();}
        else if(B.sub===1){B.sub=2;m.tele=0;const T=0.95;m.vx=(B.tx-m.x)/T;m.vy=-0.5*1900*T;m.onGround=false;}
        else{ground();if(m.onGround&&B.sub===2){B.sub=3;m.vx=0;this.land(m,B,R,D);}if(B.sub===3&&B.at>1.9)hbDone(B);}
        break;}
      case 'quake':{
        if(B.sub===0){B.sub=1;B.hops=3;}
        if(B.sub===1){m.tele=Math.min(1,B.at/0.35);ground();if(B.at>0.35&&m.onGround){B.sub=2;m.tele=0;const tx=clamp(hbPredict(0.7).x,R.minX,R.maxX),T=0.75;m.vx=(tx-m.x)/T;m.vy=-0.5*1900*T;m.onGround=false;}}
        else if(B.sub===2){ground();if(m.onGround){m.vx=0;this.land(m,B,R,D);B.hops--;if(B.hops>0){B.sub=1;B.at=0;}else B.sub=3;}}
        else if(B.at>1.0){hbRest(m,B,1.0);}
        break;}
      case 'croak':{m.tele=Math.min(1,B.at/0.8);B.croak=m.tele;
        if(B.sub===0&&B.at>0.8){B.sub=1;m.tele=0;shake(12);SFX.boom();
          shockRings.push({x:m.x,y:m.y-m.h*0.6,r:10,max:320,t:0,col:'#d8e04a'});
          const d2=Math.hypot(player.x-m.x,player.y-player.h*0.5-(m.y-m.h*0.6));
          if(d2<300){hbHit(D*0.45,'кваканье',{stun:0.3});if(!cheats.god){player.vx+=Math.sign(player.x-m.x||1)*720;player.vy=-320;}}
          if(B.phase>=2&&mobs.filter(o=>o.alive&&o.hbMinion).length<3)for(const s of [-1,1]){const c=hbMinion('toad',m.x+s*70,m.y-20);if(c){c.vx=s*200;c.vy=-300;}}
          floatText(m.x,m.y-m.h-20,'КВА-А-А!','#d8e04a');}
        if(B.at>1.5)hbDone(B);break;}
      case 'dive':{
        /* ныряет в ближайшее кислотное озеро, плывёт под игрока и выскакивает */
        const b=m.hbB,pools=[(b.x0+20.5)*TILE,(b.x0+34.5)*TILE];
        if(B.sub===0){B.sub=1;B.pool=Math.abs(pools[0]-m.x)<Math.abs(pools[1]-m.x)?pools[0]:pools[1];const T=0.8;m.vx=(B.pool-m.x)/T;m.vy=-0.5*1900*T;m.onGround=false;}
        if(B.sub===1){ground();if(m.onGround){B.sub=2;B.at=0;m.vx=0;m.untargetable=true;shake(8);burst(m.x,R.floor,30,'#b0ff60',240,3.4);}}
        else if(B.sub===2){m.alpha=Math.max(0.12,1-B.at*2);m.y=R.floor+m.h*0.6*Math.min(1,B.at*2);
          if(B.at>1.0){B.sub=3;B.at=0;B.tx=clamp(player.x,R.minX,R.maxX);hbPillar(B.tx,player.y-8,{warn:0.75,w:m.w*0.8,h:5*TILE,dmg:D*1.0,col:'#b0ff60',style:'acid',fx:{poison:3},src:'Король Топей',lift:520,big:true});}}
        else if(B.sub===3){if(B.at>0.75){B.sub=4;B.at=0;m.x=B.tx;m.y=R.floor;m.alpha=1;m.untargetable=false;m.vy=-700;m.onGround=false;B.weak=1.2;}}
        else{ground();if(m.onGround&&B.at>0.3){this.land(m,B,R,D,true);hbDone(B);}}
        break;}
      case 'bombs':{m.facing=dx>=0?1:-1;m.tele=Math.min(1,B.at/0.6);B.croak=m.tele;
        if(B.sub===0&&B.at>0.6){B.sub=1;m.tele=0;
          for(let k=0;k<(B.phase>=3?5:4);k++){const tx=clamp(player.x+rnd(-280,280),R.minX-m.w*0.4,R.maxX+m.w*0.4),T=rnd(1,1.4),sx=m.x,sy=m.y-m.h*0.7,ty=R.floor-12;
            hbShot(sx,sy,0,0,D*0.4,'bomb',{vx:(tx-sx)/T,vy:(ty-sy-0.5*900*T*T)/T,grav:900,size:10,ghost:false,life:5,
              onEnd:(p)=>{hbBoom(p.x,p.y-10,80,'#e8d84a');if(Math.hypot(player.x-p.x,player.y-player.h*0.5-p.y)<80)hbHit(D*0.7,'серная бомба',{burn:2});hbZone(p.x,p.y-20,70,{warn:0.3,dur:4,dps:D*0.25,col:'#c8d040',fx:{poison:2},src:'серный газ',gas:true});}});}}
        if(B.at>1.4)hbDone(B);break;}
    }
    if(B.atk!=='dive'){m.alpha=1;m.untargetable=false;}
  },
  land(m,B,R,D,big){shake(big?16:12);SFX.boom();vib(90);hbBoom(m.x,m.y-6,big?170:130,'#d8e04a');
    for(const s of [-1,1])hbWall(m.x+s*m.w*0.45,R.floor,s*(big?360:320),{h:40,dmg:D*0.6,col:'#b0ff60',style:'acid',life:3,fx:{poison:2},src:'кислотная волна'});
    if(Math.abs(player.x-m.x)<m.w*0.55&&player.y>m.y-m.h)mobMelee(m,D*1.1,{stun:0.4},520,-320);}
};
/* ================= КОСТЯНОЙ ИМПЕРАТОР =================
   Парящий скелет-император в истлевшей мантии, с двумя огромными
   летающими кистями. Лучи душ, костяные стены, черепа, проклятые круги,
   телепорт; в 3-й фазе — отражения, настоящий лишь один. */
HB_AI.emperor={
  intro(m,B,c,dt,R){m.x=m.home.x;m.y=m.home.y-Math.sin(c.t*1.4)*4;m.facing=player.x<m.x?-1:1;this.hands(m,B,dt,null);},
  pool(B){const p=['beams','bonewall','skulls','army'];if(B.phase>=2)p.push('curse','teleport');if(B.phase>=3)p.push('echo');return p;},
  w(m,B,S){const echoes=mobs.filter(o=>o.alive&&o.def.mech==='hbecho').length;
    return {beams:S.air?1.6:1,bonewall:S.air?0.3:1.6,skulls:S.dist>300?1.5:1,army:S.minions>=4?0.05:0.8,curse:S.still?2.6:1,teleport:S.dist>380?2.2:0.7,echo:echoes?0.05:2.2};},
  follow:{teleport:['curse','beams'],bonewall:['skulls','beams'],curse:['bonewall'],echo:['skulls']},
  /* кисти: плавно идут к целям, по умолчанию — у плеч */
  hands(m,B,dt,tg){
    const cy=m.y-m.h*0.62;
    if(!B.hx)B.hx=[m.x-70,m.x+70],B.hy=[cy,cy];
    for(let i=0;i<2;i++){const s=i?1:-1;const t=tg&&tg[i]?tg[i]:{x:m.x+s*(72+Math.sin(G.time*1.7+i)*6),y:cy+12+Math.cos(G.time*2+i*2)*8};
      B.hx[i]=lerp(B.hx[i],t.x,Math.min(1,dt*(tg?7:4)));B.hy[i]=lerp(B.hy[i],t.y,Math.min(1,dt*(tg?7:4)));}
  },
  tick(m,B,dt,R,dx){
    const D=m.def.dmg,cy=m.y-m.h*0.5;m.facing=dx>=0?1:-1;
    const hov=(sp)=>hbHover(m,clamp(player.x+B.side*(220+30*Math.sin(G.time*0.7)),R.minX,R.maxX),clamp(player.y-100,R.top+m.h,R.floor-1.5*TILE),sp,dt,2);
    let hand=null;
    switch(B.atk){
      case 'trans':m.vx*=0.9;m.vy*=0.9;hbHover(m,R.cx,R.floor-5*TILE,100,dt);B.armor=0.5;
        if(Math.random()<0.6)spawnPart(m.x+rnd(-60,60),cy+rnd(-60,60),0,rnd(-60,-20),0.8,'#9ad8ff',3,-40);
        if(B.at>2.4)hbDone(B);break;
      case 'idle':hov(m.def.spd*B.rage);if(B.at>hbIdleTime(B,1.0))hbPick(m,B,this);break;
      case 'beams':{hov(30);
        const n=B.phase>=2?3:2;
        if(B.sub===0){B.sub=1;B.ba=[];const P=hbPredict(0.75);for(let k=0;k<n;k++){const hx=m.x+(k-(n-1)/2)*80,hy=cy-20;const a=Math.atan2(P.y-hy,P.x-hx)+(k-(n-1)/2)*0.14;B.ba.push([hx,hy,a]);hbLine(hx,hy,hx+Math.cos(a)*900,hy+Math.sin(a)*900,0.8,'#9ad8ff',2);}}
        hand=[{x:m.x-60,y:cy-40},{x:m.x+60,y:cy-40}];m.tele=Math.min(1,B.at/0.8);
        if(B.sub===1&&B.at>0.8){B.sub=2;m.tele=0;SFX.grapple&&SFX.grapple();shake(4);
          for(const [hx,hy,a] of B.ba){let L=0;while(L<1000){if(L>40&&solidAtPx(hx+Math.cos(a)*L,hy+Math.sin(a)*L))break;L+=12;}
            beams.push({x1:hx,y1:hy,x2:hx+Math.cos(a)*L,y2:hy+Math.sin(a)*L,t:0.35,dmg:D*0.7,color:'#9ad8ff',fx:{slow:1.5},done:false});}}
        if(B.at>1.5)hbDone(B);break;}
      case 'bonewall':{hov(40);m.tele=Math.min(1,B.at/0.6);hand=[{x:m.x-50,y:R.floor-30},{x:m.x+50,y:R.floor-30}];
        const vol=B.phase>=2?2:1;
        if(B.sub<vol&&B.at>0.6+B.sub*0.9){B.sub++;m.tele=0;shake(7);SFX.breakBlock();
          for(const s of [-1,1])hbWall(m.x+s*30,R.floor,s*(260+B.sub*30),{h:58,dmg:D*0.75,col:'#e8e0cc',style:'bone',life:4.5,fx:{bleed:2},src:'костяная стена'});}
        if(B.at>0.9+vol*0.9)hbDone(B);break;}
      case 'skulls':{hov(50);m.tele=Math.min(1,B.at/0.5);
        const n=B.phase>=2?5:3;
        if(B.sub<n&&B.at>0.5+B.sub*0.18){const i=B.sub%2,hx=B.hx?B.hx[i]:m.x,hy=B.hy?B.hy[i]:cy;B.sub++;m.tele=0;
          const a=Math.atan2(player.y-player.h*0.5-hy,player.x-hx)+rnd(-0.6,0.6);hbShot(hx,hy,a,200,D*0.5,'skull',{homing:1.7,size:9,life:5,fx:{slow:1}});SFX.hit();}
        if(B.at>0.6+n*0.18+0.4)hbDone(B);break;}
      case 'army':{hov(30);m.tele=Math.min(1,B.at/0.8);B.armor=0.4;hand=[{x:m.x-90,y:cy-70},{x:m.x+90,y:cy-70}];
        if(B.sub===0&&B.at>0.8){B.sub=1;m.tele=0;floatText(m.x,m.y-m.h-20,'Восстаньте!','#bfe8ff');
          for(const s of [-1,1]){const x=clamp(player.x+s*rnd(150,260),R.minX-m.w*0.4,R.maxX+m.w*0.4);hbPillar(x,R.floor-8,{warn:0.5,w:40,h:2.5*TILE,dmg:0,col:'#e8e0cc',style:'bone'});
            hbLater(0.5,()=>{if(hbFight()){const c=hbMinion('skelminion',x,hbFloorAt(x,R.floor-3*TILE));if(c)c.vy=-200;}});}}
        if(B.at>1.6)hbDone(B);break;}
      case 'curse':{hov(40);m.tele=Math.min(1,B.at/0.6);hand=[{x:m.x-40,y:cy+20},{x:m.x+40,y:cy+20}];
        if(B.sub===0&&B.at>0.6){B.sub=1;m.tele=0;
          const n=B.phase>=3?4:3;for(let k=0;k<n;k++){const P=k===0?{x:player.x,y:player.y-player.h*0.5}:k===1?hbPredict(1.2):{x:player.x+rnd(-260,260),y:player.y-player.h*0.5+rnd(-80,40)};
            hbZone(clamp(P.x,R.minX-m.w*0.4,R.maxX+m.w*0.4),P.y,72,{t:-k*0.25,warn:1.0,dur:3.6,dps:D*0.55,col:'#9ad8ff',fx:{slow:1.5},src:'проклятый круг'});}
          floatText(m.x,m.y-m.h-20,'Проклятие!','#bfe8ff');}
        if(B.at>1.4)hbDone(B);break;}
      case 'teleport':{
        if(B.sub===0){B.sub=1;m.untargetable=true;burst(m.x,cy,26,'#9ad8ff',200,3);SFX.portal();}
        if(B.sub===1){m.alpha=Math.max(0,1-B.at*2.5);if(B.at>0.5){B.sub=2;B.at=0;const s=player.facing||1;m.x=clamp(player.x-s*150,R.minX,R.maxX);m.y=clamp(player.y-60+m.h*0.5,R.top+m.h,R.floor-TILE);m.vx=m.vy=0;burst(m.x,m.y-m.h*0.5,26,'#9ad8ff',200,3);}}
        else if(B.sub===2){m.alpha=Math.min(1,B.at*3);m.untargetable=B.at<0.3;m.tele=Math.min(1,B.at/0.55);
          const c2=m.y-m.h*0.5;hand=[{x:player.x-60,y:player.y-player.h*0.5},{x:player.x+60,y:player.y-player.h*0.5}];
          if(B.at>0.55){B.sub=3;m.tele=0;shake(8);SFX.boom();hbBoom(player.x,player.y-player.h*0.5,70,'#bfe8ff');
            if(B.hx&&Math.hypot(player.x-(B.hx[0]+B.hx[1])/2,player.y-player.h*0.5-(B.hy[0]+B.hy[1])/2)<110)hbHit(D*1.0,'ладони Императора',{stun:0.4});B.clap=0.3;void c2;}}
        else{if(B.at>1.0){m.untargetable=false;m.alpha=1;hbRest(m,B,1.2);}}
        if(B.sub>=2)hand=hand||[{x:player.x-30,y:player.y-player.h*0.5},{x:player.x+30,y:player.y-player.h*0.5}];
        break;}
      case 'echo':{hbHover(m,R.cx,R.floor-6*TILE,140,dt,2);m.tele=Math.min(1,B.at/0.9);B.armor=0.6;
        if(B.sub===0&&B.at>0.9){B.sub=1;m.tele=0;SFX.portal();floatText(m.x,m.y-m.h-20,'Кто из нас настоящий?','#bfe8ff');
          const D2=MOBDEFS.find(d=>d.id==='hb_echo');const spots=[R.minX+120,R.maxX-120];
          /* сам император тоже перескакивает на случайное место среди копий */
          const all=[R.cx,spots[0],spots[1]].sort(()=>Math.random()-0.5);
          m.x=all[0];
          for(let k=1;k<3;k++){const e=spawnMobAt(D2,all[k],R.floor-6*TILE+m.h*0.5);e.noSouls=true;e.src=m;e.copy='emperor';e.w=m.w;e.h=m.h;e.life=16;e.b={phase:B.phase,atk:'idle',at:rnd(0,1),hx:null};e.alpha=1;}
          for(let k=0;k<3;k++)burst(k?all[k]:m.x,R.floor-6*TILE,20,'#9ad8ff',200,3);}
        if(B.at>1.6)hbDone(B);break;}
    }
    if(B.atk!=='teleport'){m.untargetable=false;if(B.atk!=='echo')m.alpha=1;}
    this.hands(m,B,dt,hand);
  }
};
/* копии Императора и тени Владык: исчезают с одного удара, мешают и стреляют */
function hbEchoUpdate(m,dt,dx,dy,dist){
  const B=m.b||(m.b={atk:'idle',at:0});m.life=(m.life||12)-dt;B.at+=dt;
  if(m.life<=0||!(m.src&&m.src.alive)){m.alive=false;burst(m.x,m.y-m.h*0.5,16,m.def.c1,160,3);const i=mobs.indexOf(m);if(i>=0)mobs.splice(i,1);return;}
  const R=hbBounds(m.src);m.facing=dx>=0?1:-1;
  const ang=G.time*0.5+(m.x>R.cx?Math.PI:0);
  hbHover(m,clamp(player.x+Math.cos(ang)*240,R.minX,R.maxX),clamp(player.y-160+Math.sin(ang*2)*30,R.top+m.h,R.floor-2*TILE),110,dt,2);
  if(B.at>2.2){B.at=0;m.tele=0;const a=Math.atan2(dy,dx);hbShot(m.x,m.y-m.h*0.6,a,190,m.src.def.dmg*0.4,'skull',{homing:1.4,size:8,life:4});}
  else m.tele=Math.min(1,B.at/2.2);
  if(m.copy==='emperor')HB_AI.emperor.hands(m,B,dt,null);
}
/* ================= ВЛАДЫКА МАГМЫ =================
   Расплавленный великан по пояс в лавовом озере, скованный цепями.
   Бьёт кулаком по платформам, вызывает столбы магмы, метеоры, горизонтальные
   взмахи; в 3-й фазе раскрывает ядро в груди. */
HB_AI.warden={
  noTouch:true,
  intro(m,B,c,dt,R){const k=eOut((c.t-0.8)/(c.roarT-1.2));m.x=m.home.x;m.y=R.floor+TILE+m.h*(1-k)*0.9;m.facing=player.x<m.x?-1:1;},
  pool(B){const p=['fist','pillars','meteors'];if(B.phase>=2)p.push('sweep','fist');if(B.phase>=3)p.push('geysers','rain');return p;},
  w(m,B,S){return {fist:S.still?2.4:1.4,pillars:S.air?0.6:1.4,meteors:1,sweep:1.3,geysers:1.4,rain:S.still?2:1};},
  follow:{fist:['pillars','sweep'],sweep:['meteors','fist'],geysers:['sweep'],rain:['fist']},
  onPhase(m,B,p){if(p===3){B.core=1;for(let i=0;i<50;i++){const a=Math.random()*TAU,sp=rnd(100,420);spawnPart(m.x,m.y-m.h*0.62,Math.cos(a)*sp,Math.sin(a)*sp,rnd(0.6,1.2),i%2?'#ffd040':'#ff5a1a',rnd(2,5),300);}}},
  tick(m,B,dt,R,dx){
    const D=m.def.dmg,b=m.hbB,lx0=(b.x0+11)*TILE,lx1=(b.x0+45)*TILE,sy=R.floor+TILE;
    m.y=lerp(m.y,sy+Math.sin(G.time*1.1)*4,Math.min(1,dt*3));
    const wade=(tx,sp)=>{m.vx=lerp(m.vx,clamp(tx-m.x,-sp,sp),Math.min(1,dt*2));m.x=clamp(m.x+m.vx*dt,lx0,lx1);
      if(Math.abs(m.vx)>20&&Math.random()<0.3)spawnPart(m.x+rnd(-60,60),R.floor+4,rnd(-60,60),rnd(-200,-80),0.6,'#ff7a1a',3,600);};
    m.facing=dx>=0?1:-1;
    switch(B.atk){
      case 'trans':m.tele=Math.min(1,B.at/2);if(Math.random()<0.6)spawnPart(m.x+rnd(-70,70),m.y-rnd(0,m.h),rnd(-60,60),rnd(-160,-40),0.8,'#ff7a1a',3,200);if(B.at>2.4)hbDone(B);break;
      case 'idle':wade(clamp(player.x-Math.sign(dx||1)*170,lx0,lx1),m.def.spd*B.rage);if(B.at>hbIdleTime(B,1.2))hbPick(m,B,this);break;
      case 'fist':{wade(m.x,10);
        if(B.sub===0){B.sub=1;B.side=Math.sign(dx)||1;B.fx2=clamp(hbPredict(0.95).x,R.minX-m.w*0.4,R.maxX+m.w*0.4);B.fy2=hbFloorAt(B.fx2,player.y-10);
          hbFx.push({type:'mark',t:0,life:0.95,x:B.fx2,y:B.fy2,r:80,col:'#ff5a1a'});}
        if(B.at<0.95){m.tele=B.at/0.95;B.fist={side:B.side,k:-m.tele,x:B.fx2,y:B.fy2};}
        else if(B.sub===1){B.sub=2;m.tele=0;shake(18);SFX.boom();vib(140);B.fist={side:B.side,k:1,x:B.fx2,y:B.fy2};
          hbBoom(B.fx2,B.fy2-10,120,'#ff7a1a');
          if(Math.abs(player.x-B.fx2)<80&&player.y>B.fy2-110&&player.y<=B.fy2+10)hbHit(D*1.1,'кулак Владыки',{stun:0.5,burn:3});
          for(let k=1;k<=(B.phase>=2?5:4);k++)for(const s of [-1,1])hbPillar(B.fx2+s*k*72,B.fy2-30,{warn:0.15+k*0.16,w:46,h:2.6*TILE,dmg:D*0.6,col:'#ff7a1a',style:'magma',fx:{burn:3},src:'лавовый всплеск'});
          B.weak=1.8;floatText(m.x,m.y-m.h-10,'Ядро открыто!','#ffd060');}
        else{B.fist={side:B.side,k:Math.max(0,1-(B.at-1.6)*1.5),x:B.fx2,y:B.fy2};}
        if(B.at>2.4){B.fist=null;hbDone(B);}break;}
      case 'pillars':{wade(m.x,20);m.tele=Math.min(1,B.at/0.5);
        if(B.sub===0&&B.at>0.5){B.sub=1;m.tele=0;const n=B.phase>=2?6:4;
          for(let k=0;k<n;k++){const x=clamp(k===0?player.x:k===1?hbPredict(1).x:player.x+rnd(-360,360),R.minX-m.w*0.4,R.maxX+m.w*0.4);
            hbPillar(x,player.y-10,{t:-k*0.28,warn:0.9,w:56,h:6*TILE,dmg:D*0.85,col:'#ff7a1a',style:'magma',fx:{burn:3},src:'столб магмы',big:true,lift:300});}}
        if(B.at>2.6)hbDone(B);break;}
      case 'meteors':{wade(m.x,20);m.tele=Math.min(1,B.at/0.6);B.raise=m.tele;
        if(B.sub===0&&B.at>0.6){B.sub=1;m.tele=0;const n=B.phase>=2?9:6;
          for(let k=0;k<n;k++){const x=clamp(k===0?player.x:player.x+rnd(-440,440),R.minX-m.w*0.4,R.maxX+m.w*0.4);
            hbMeteor(x,R.top+8,{warn:0.8+k*0.13,dmg:D*0.75,r:20,blast:70,col:'#ff6a1a',patch:{w:50,dur:3,type:'fire',dps:D*0.15},src:'магмовый метеор'});}
          floatText(m.x,m.y-m.h-10,'Магмопад!','#ffb060');}
        if(B.at>2.0){B.raise=0;hbDone(B);}break;}
      case 'sweep':{wade(m.x,10);
        if(B.sub===0){B.sub=1;B.sy=player.y-player.h*0.5;B.side=Math.sign(dx)||1;hbFx.push({type:'sweep',t:0,warn:1.0,x:R.cx,y:B.sy,w:2000,h:70,dmg:D*0.95,col:'#ff7a1a',fx:{burn:3},src:'взмах Владыки'});}
        m.tele=Math.min(1,B.at/1.0);B.sweepK=B.at<1.0?-m.tele:Math.min(1,(B.at-1.0)/0.3);B.sweepY=B.sy;
        if(B.at>1.0&&!B.sw2){B.sw2=1;shake(10);}
        if(B.at>1.7){B.sweepK=0;B.sw2=0;hbDone(B);}break;}
      case 'geysers':{wade(R.cx,40);m.tele=Math.min(1,B.at/0.6);
        if(B.sub===0&&B.at>0.6){B.sub=1;m.tele=0;floatText(m.x,m.y-m.h-10,'Гейзеры!','#ffb060');
          for(let wv=0;wv<2;wv++){const g0=rnd(R.minX,R.maxX);for(let x=R.minX-m.w*0.4+30;x<R.maxX+m.w*0.4;x+=96){if(Math.abs(x-g0)<110)continue;
            hbPillar(x+(wv?48:0),player.y-10,{t:-wv*1.3,warn:1.1,w:48,h:5*TILE,dmg:D*0.8,col:'#ffa02a',style:'magma',fx:{burn:3},src:'гейзер магмы',lift:300});}}}
        if(B.at>3.4)hbDone(B);break;}
      case 'rain':{wade(m.x,20);m.tele=Math.min(1,B.at/0.5);B.raise=m.tele;
        if(B.at>0.5&&B.at<3.5){B.rt=(B.rt||0)-dt;if(B.rt<=0){B.rt=0.16;hbMeteor(clamp(player.x+rnd(-360,360),R.minX,R.maxX),R.top+8,{warn:0.5,dmg:D*0.5,r:12,blast:44,col:'#ff8a2a',src:'огненный дождь'});}}
        if(B.at>3.8){B.raise=0;hbDone(B);}break;}
    }
  }
};
/* ================= АРХИДЕМОН ИНФЕРНАЛИС =================
   Владыка Преисподней: огромный крылатый демон с пылающим клинком.
   1: бой на земле — удар клинком с огненной волной, дыхание, прыжок-удар.
   2: взлетает — пике, метеоры, цепи из стен.
   3: призывает тени поверженных Владык.
   4: пол арены рушится в лаву, всё быстрее. */
HB_AI.archdemon={
  /* оживает статуя: до раскола боса не видно (на троне стоит каменная статуя), потом он в той же позе
     расправляет крылья и поднимает клинок к рёву; после катсцены спрыгивает с трона на помост */
  intro(m,B,c,dt,R){const sh=c.shatterT||0;m.x=m.home.x;m.y=m.home.y;m.vx=m.vy=0;B.fly=false;m.onGround=true;B.flap=0;B.raise=0;
    m.alpha=c.t<sh?0:1;m.facing=c.t<sh+1.0?1:(player.x<m.x?-1:1);
    const k=clamp((c.t-sh-0.4)/Math.max(0.5,c.roarT-sh-0.8),0,1);B.wings=lerp(0.55,1,eOut(k));
    B.swing=c.t>c.roarT-1.0&&c.t<c.roarT+0.6?-clamp((c.t-(c.roarT-1.0))/0.6,0,1):0;B.breath=c.t>c.roarT&&c.t<c.roarT+1.2?1:0;},
  pool(B){
    if(B.phase===1)return ['cleave','breath','stomp','cleave'];
    if(B.phase===2)return ['dive','meteors','chains','breath'];
    if(B.phase===3)return ['shade','dive','chains','cleave','shade','meteors'];
    return ['cleave','stomp','dive','meteors','chains','shade','breath'];
  },
  w(m,B,S){return {cleave:S.dist<320?2.4:0.6,breath:S.dist<460?1.5:0.6,stomp:S.dist>260?1.8:0.8,dive:S.dist>300?1.8:1,meteors:S.still?2:1,chains:S.air?1.6:1,shade:1.6};},
  follow:{stomp:['cleave','breath'],dive:['chains','meteors'],chains:['dive'],cleave:['breath','stomp'],shade:['chains','cleave']},
  onPhase(m,B,p,R){
    if(p===2){B.fly=true;}
    if(p===3){B.fly=true;}
    if(p===4){B.fly=false;hbCollapseFloor(true);shake(30);floatText(R.cx,R.floor-4*TILE,'Пол рушится в лаву!','#ff5a1a');
      for(let i=0;i<80;i++)spawnPart(rnd(R.minX,R.maxX),R.floor-4,rnd(-60,60),rnd(-500,-150),rnd(0.6,1.4),i%2?'#ff7a1a':'#2a1a14',rnd(2,6),900);}
  },
  tick(m,B,dt,R,dx){
    const D=m.def.dmg,cy=m.y-m.h*0.5;B.wings=1;B.sword=1;
    const flyHov=(sp)=>hbHover(m,clamp(player.x+B.side*(280+40*Math.sin(G.time*0.6)),R.minX,R.maxX),clamp(player.y-260,R.top+m.h,R.floor-4*TILE),sp,dt,1.6);
    const groundFollow=(sp)=>{const want=Math.abs(dx)>230?Math.sign(dx):0;m.vx=lerp(m.vx,want*sp,Math.min(1,dt*3));hbGround(m,dt,R);};
    const air=B.fly&&B.atk!=='stomp';
    if(B.atk!=='dive'&&B.atk!=='stomp'&&B.atk!=='trans')m.facing=dx>=0?1:-1;
    B.flap=air?1:0;
    switch(B.atk){
      case 'trans':m.vx*=0.9;m.vy*=0.9;
        if(B.fly)hbHover(m,R.cx,R.floor-9*TILE,160,dt,2);else hbGround(m,dt,R);
        if(Math.random()<0.7)spawnPart(m.x+rnd(-100,100),cy+rnd(-100,100),rnd(-60,60),rnd(-120,0),0.8,'#ff5a1a',3,0);
        if(B.at>2.6)hbDone(B);break;
      case 'idle':
        if(B.fly)flyHov(m.def.spd*B.rage);else groundFollow(m.def.spd*B.rage*(B.phase>=4?1.3:1));
        if(B.at>hbIdleTime(B,1.15))hbPick(m,B,this);break;
      case 'cleave':{
        if(B.fly){hbHover(m,clamp(player.x-Math.sign(dx||1)*170,R.minX,R.maxX),player.y-60,520,dt,4);}else groundFollow(40);
        if(B.sub===0){B.sub=1;B.cs=Math.sign(dx)||1;}
        m.facing=B.cs;
        if(B.at<0.85){m.tele=B.at/0.85;B.swing=-m.tele;}
        else if(B.sub===1){B.sub=2;m.tele=0;shake(16);SFX.boom();vib(120);
          const fx=m.x+B.cs*m.w*0.55;hbBoom(fx,m.y-m.h*0.4,150,'#ff5a1a');
          if((player.x-m.x)*B.cs>-40&&Math.abs(player.x-m.x)<m.w*0.5+260&&Math.abs(player.y-player.h*0.5-(m.y-m.h*0.4))<190)hbHit(D*1.15,'клинок Архидемона',{burn:4});
          const fl=Math.min(R.floor,hbFloorAt(fx,m.y-40));
          hbWall(fx,fl,B.cs*420,{h:64,dmg:D*0.75,col:'#ff5a1a',style:'fire',life:3.4,fx:{burn:3},src:'огненная волна'});
          if(B.phase>=4)hbWall(m.x-B.cs*m.w*0.4,fl,-B.cs*380,{h:64,dmg:D*0.7,col:'#ff5a1a',style:'fire',life:3,fx:{burn:3},src:'огненная волна'});}
        B.swing=B.at<0.85?B.swing:Math.min(1,(B.at-0.85)/0.2);
        if(B.at>1.6){B.swing=0;hbRest(m,B,0.7);}break;}
      case 'breath':{
        if(B.fly)flyHov(60);else groundFollow(20);
        m.tele=Math.min(1,B.at/0.7);B.breath=B.at>0.7&&B.at<2.4?1:0;
        if(B.breath){B.bt=(B.bt||0)-dt;if(B.bt<=0){B.bt=0.045;const hx=m.x+m.facing*m.w*0.34,hy=m.y-m.h*0.78,a=Math.atan2(player.y-player.h*0.5-hy,player.x-hx)+Math.sin(B.at*5)*0.25+rnd(-0.06,0.06);
          projectiles.push({x:hx,y:hy,vx:Math.cos(a)*460,vy:Math.sin(a)*460,life:1.1,dmg:D*0.22,color:'#ff8a2a',size:6,owner:'mob',kind:'flame',ghost:true,fx:{burn:2}});}}
        if(B.at>2.6){B.breath=0;hbDone(B);}break;}
      case 'stomp':{
        if(B.sub===0){B.sub=1;B.tx=clamp(hbPredict(1.1).x,R.minX,R.maxX);hbFx.push({type:'mark',t:0,life:1.6,x:B.tx,y:hbFloorAt(B.tx,player.y-10),r:150,col:'#ff3a1a'});}
        if(B.sub===1){m.tele=Math.min(1,B.at/0.6);if(B.fly){hbHover(m,m.x,m.y-40,200,dt);}else{m.vx=0;hbGround(m,dt,R);}
          if(B.at>0.6){B.sub=2;m.tele=0;const T=1.0;const fl=Math.min(R.floor,hbFloorAt(B.tx,m.y-m.h));m.vx=(B.tx-m.x)/T;m.vy=(fl-m.y-0.5*1900*T*T)/T;m.onGround=false;}}
        else if(B.sub===2){hbGround(m,dt,R);if(m.onGround){B.sub=3;m.vx=0;shake(26);SFX.boom();vib(200);hbBoom(m.x,m.y-10,240,'#ff5a1a');
          if(Math.abs(player.x-m.x)<m.w*0.6&&player.y>m.y-m.h*0.7)hbHit(D*1.3,'Архидемон',{stun:0.6,burn:3});
          for(let k=1;k<=4;k++)for(const s of [-1,1])hbPillar(m.x+s*(m.w*0.4+k*90),m.y-30,{warn:0.1+k*0.14,w:50,h:3.4*TILE,dmg:D*0.65,col:'#ff5a1a',style:'magma',fx:{burn:3},src:'огненный разлом'});
          B.weak=1.3;}}
        else if(B.at>1.6){hbDone(B);}
        break;}
      case 'dive':{
        if(B.sub===0){if(!B.fly&&m.onGround){m.vy=-900;m.onGround=false;}B.sub=1;const P=hbPredict(0.8);const a=Math.atan2(P.y-cy,P.x-m.x);
          B.tx=clamp(P.x+Math.cos(a)*220,R.minX,R.maxX);B.ty=clamp(P.y+Math.sin(a)*220,R.top+m.h*0.5,R.floor-m.h*0.5);hbLine(m.x,cy,B.tx,B.ty,0.85,'#ff5a1a',8);}
        if(B.at<0.85){m.tele=B.at/0.85;m.vx*=0.9;m.vy*=0.9;m.x+=m.vx*dt;m.y+=m.vy*dt;if(!B.fly&&m.y<R.floor)m.vy+=400*dt;}
        else{m.tele=0;const ax=B.tx-m.x,ay=B.ty-(m.y-m.h*0.5),l=Math.hypot(ax,ay),sp=1250*dt*B.rage;B.diving=1;m.facing=ax>=0?1:-1;
          if(l>sp){m.x+=ax/l*sp;m.y+=ay/l*sp;}else{B.diving=0;shake(10);if(!B.fly){m.vy=0;}hbRest(m,B,1.2);}
          if(Math.random()<0.9)spawnPart(m.x+rnd(-60,60),m.y-m.h*0.5+rnd(-60,60),0,0,0.5,'#ff5a1a',6,0);
          if(Math.abs(player.x-m.x)<m.w*0.45+12&&Math.abs(player.y-player.h*0.5-(m.y-m.h*0.5))<m.h*0.45&&m.atkCd<=0){m.atkCd=1;mobMelee(m,D*1.2,{burn:3},560,-320);}}
        break;}
      case 'meteors':{
        if(B.fly)flyHov(60);else groundFollow(30);
        m.tele=Math.min(1,B.at/0.6);B.raise=m.tele;
        if(B.sub===0&&B.at>0.6){B.sub=1;m.tele=0;const n=B.phase>=4?14:10;floatText(m.x,m.y-m.h-10,'Огонь небес!','#ffb060');
          for(let k=0;k<n;k++){const x=clamp(k===0?player.x:k===1?hbPredict(1.2).x:player.x+rnd(-560,560),R.minX-m.w*0.4,R.maxX+m.w*0.4);
            hbMeteor(x,R.top+8,{warn:0.8+k*0.11,dmg:D*0.75,r:24,blast:80,col:'#ff4a1a',patch:{w:60,dur:3,type:'fire',dps:D*0.15},src:'огонь небес'});}}
        if(B.at>2.2){B.raise=0;hbDone(B);}break;}
      case 'chains':{
        if(B.fly)flyHov(50);else groundFollow(20);
        m.tele=Math.min(1,B.at/0.5);
        if(B.sub===0&&B.at>0.5){B.sub=1;m.tele=0;const n=B.phase>=3?6:4;floatText(m.x,m.y-m.h-10,'Цепи Преисподней!','#ffb060');
          for(let k=0;k<n;k++){const s=k%2?1:-1,sx=s<0?(m.hbB.x0+2)*TILE:(m.hbB.x0+m.hbB.W-2)*TILE,sy=rnd(R.top+3*TILE,R.floor-TILE);
            const P=k<2?hbPredict(0.9):{x:player.x+rnd(-160,160),y:player.y-player.h*0.5+rnd(-100,60)};
            hbFx.push({type:'chain',t:-k*0.22,warn:0.95,x:sx,y:sy,tx:P.x,ty:P.y,len:3200,dmg:D*0.7,col:'#ff7a2a',src:'цепь Преисподней'});}}
        if(B.at>2.4)hbDone(B);break;}
      case 'shade':{
        /* тень одного из поверженных Владык повторяет его коронную атаку */
        if(B.fly)flyHov(40);else groundFollow(20);
        m.tele=Math.min(1,B.at/0.7);
        if(B.sub===0&&B.at>0.7){B.sub=1;m.tele=0;const ids=['herald','mother','toadking','emperor','warden'];const id=ids[Math.floor(Math.random()*ids.length)];
          const sx=clamp(player.x+(Math.random()<0.5?-1:1)*rnd(220,320),R.minX,R.maxX),sy=id==='herald'||id==='emperor'?player.y-170:R.floor;
          hbFx.push({type:'shade',t:0,life:2.6,id,x:sx,y:sy,f:player.x<sx?-1:1});
          floatText(sx,sy-120,'Тень: '+hbById(id).name,hbById(id).col);SFX.portal();
          hbLater(0.9,()=>{if(!hbFight())return;HB_SHADE_ATK[id](sx,sy,D);});}
        if(B.at>2.0)hbDone(B);break;}
    }
    if(B.fly&&B.atk!=='dive'&&B.atk!=='trans')m.y=Math.min(m.y,R.floor-TILE);
  }
};
/* коронные атаки теней мини-боссов (фаза 3 Архидемона) */
const HB_SHADE_ATK={
  herald(x,y,D){const a0=Math.atan2(player.y-player.h*0.5-y,player.x-x);for(let k=0;k<7;k++)hbShot(x,y,a0+(k-3)*0.2,300,D*0.5,'ember',{size:7,fx:{burn:2}});},
  mother(x,y,D){for(let k=0;k<4;k++)hbPillar(k===0?player.x:player.x+rnd(-260,260),player.y-8,{t:-k*0.1,warn:0.8,w:40,h:3.6*TILE,dmg:D*0.7,col:'#c0142a',style:'tentacle',fx:{bleed:2},src:'тень Матери'});},
  toadking(x,y,D){for(let k=0;k<4;k++){const tx=player.x+(k-1.5)*110,T=1.05,sy=y-60;hbShot(x,sy,0,0,D*0.5,'acid',{vx:(tx-x)/T,vy:(player.y-10-sy-0.5*900*T*T)/T,grav:900,size:9,ghost:false,life:4,onEnd:(p)=>addPatch(p.x,p.y-8,56,5,'acid',D*0.12)});}},
  emperor(x,y,D){for(let k=0;k<4;k++)hbShot(x,y,Math.atan2(player.y-y,player.x-x)+rnd(-0.8,0.8),200,D*0.45,'skull',{homing:1.6,size:9,life:5});},
  warden(x,y,D){for(let k=0;k<5;k++)hbPillar(player.x+(k-2)*90,player.y-10,{t:-Math.abs(k-2)*0.2,warn:0.9,w:52,h:5*TILE,dmg:D*0.7,col:'#ff7a1a',style:'magma',fx:{burn:3},src:'тень Владыки Магмы'});}
};
