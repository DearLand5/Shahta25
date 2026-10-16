'use strict';
/* ============================================================
   НАПРЯЖЁННЫЕ БОИ С БОССАМИ (Владыки Преисподней и Пожиратель Бездны)
   1) пояс: 8 аптечек на бой, лечение за 2 с (срывается от удара), перерыв 6 с;
   2) рана: часть урона нельзя вылечить аптечкой — только ударами по боссу;
   3) коронные удары: 60–80% здоровья при любой броне, спасает только уворот;
   4) рывок с неуязвимостью: двойной толчок джойстика (Shift / двойное A-D);
   5) окна: вне окон босс получает ×0.7, в окна (отдых, оглушение, после коронного) ×2;
   6) ярость: после 2,5 минуты босс быстрее и злее.
   Состояние боя — G.bf (не сохраняется), рана — player.wound.
   ============================================================ */
const BF={BELT:8,HEAL:0.3,HEAL_T:2,HEAL_CD:6,WOUND_K:0.4,WOUND_MAX:0.45,RALLY_K:3,RALLY_RATE:0.08,ENRAGE_T:150,
  WIN_MUL:2,OFF_MUL:0.7,DASH_V:640,DASH_T:0.17,DASH_I:0.32,DASH_CD:1.0};
/* коронные удары каждого босса: [вид, название]; i-й — для i-й фазы, дальше по кругу */
const BF_ULTS={
  herald:[['gap','Пепельная буря'],['nova','Взрыв пепла'],['beam','Луч пепла']],
  mother:[['quake','Удар утробы'],['gap','Кровавый ливень'],['beam','Хлыст плоти']],
  toadking:[['quake','Прыжок Короля'],['beam','Язык-хлыст'],['gap','Кислотный потоп']],
  emperor:[['beam','Коса смерти'],['gap','Костяной дождь'],['nova','Проклятая звезда']],
  warden:[['gap','Извержение'],['quake','Сотрясение'],['nova','Сердце вулкана']],
  archdemon:[['beam','Клинок Преисподней'],['nova','Адская звезда'],['gap','Огонь небес'],['quake','Падение трона']],
  devourer:[['nova','Поглощение'],['beam','Взгляд Бездны'],['gap','Звездопад']]
};
const BF_HINT={gap:'Беги в зелёную зону!',quake:'Прыгай или уходи наверх!',beam:'Смени высоту или сделай рывок!',nova:'Беги от босса или рывок!'};
const BF_WARN={gap:2.3,quake:1.8,beam:1.8,nova:1.9};

/* ---------- кто сейчас бьётся ---------- */
function bfEarthR(){return {floor:ARENA_FLOOR*TILE,minX:5*TILE,maxX:(MW-5)*TILE,top:(ARENA_Y0+2)*TILE,cx:48*TILE};}
function bfCtx(){
  if(G.scene!=='mine'||G.bossCut)return null;
  const H=hbFight();
  if(H&&H.m&&H.m.b)return {m:H.m,B:H.m.b,id:H.m.def.hb,R:hbBounds(H.m),hb:true};
  if(G.arenaFight){const m=bossAlive();if(m&&!m.def.hb&&m.b)return {m,B:m.b,id:'devourer',R:bfEarthR(),hb:false};}
  return null;
}
function bfOn(){return !!(G.bf&&bfCtx());}
/* сколько аптечек можно выпить прямо сейчас */
function medkitAvail(){return bfOn()?Math.min(player.potions,G.bf.pots):player.potions;}

/* ---------- кадр ---------- */
function bfTick(dt){
  /* рывок работает везде в шахте */
  if(player.dashCd>0)player.dashCd-=dt;
  if(player.dashI>0)player.dashI-=dt;
  if(player.dashT>0&&Math.random()<0.9)spawnPart(player.x-player.dashDir*10+rnd(-4,4),player.y-player.h*rnd(0.2,0.8),-player.dashDir*rnd(40,120),rnd(-20,20),0.3,Math.random()<0.5?'#cfe8ff':'#ffffff',rnd(1.5,3),0);
  if(G.bfTrail)for(let i=G.bfTrail.length-1;i>=0;i--){G.bfTrail[i].t-=dt*3;if(G.bfTrail[i].t<=0)G.bfTrail.splice(i,1);}
  bfDashInput();
  const c=bfCtx();
  if(!c){if(G.bf&&!G.bossCut)bfEnd();return;}
  if(!G.bf||G.bf.m!==c.m)bfStart(c);
  const F=G.bf;F.t+=dt;
  if(F.winT>0)F.winT-=dt;
  if(F.rallyT>0)F.rallyT-=dt;else{F.rallyT=1;F.rallyAcc=0;}
  if(F.rallyShow>0.5&&!(F.rallyShowT>0)){floatText(player.x,player.y-player.h-26,'+'+Math.round(F.rallyShow),'#7dffa0');F.rallyShow=0;F.rallyShowT=0.45;}
  if(F.rallyShowT>0)F.rallyShowT-=dt;
  /* лечение аптечкой — постепенно, не выше границы раны */
  const cap=player.maxHp-(player.wound||0);
  if(player.healLeft>0){const x=Math.min(player.healLeft,player.healRate*dt);player.healLeft-=x;player.hp=Math.min(cap,player.hp+x);if(player.hp>=cap-0.01)player.healLeft=0;
    if(Math.random()<0.3)spawnPart(player.x+rnd(-10,10),player.y-rnd(4,40),rnd(-10,10),rnd(-70,-30),0.6,'#7dffa0',2.4,-40);}
  if(player.hp>cap)player.hp=cap;
  /* ярость */
  if(!F.enr&&F.t>BF.ENRAGE_T){F.enr=true;c.B.enr=true;shake(14);SFX.boom();vib(140);
    UI.toast(c.m.def.name+' в ярости!');floatText(c.m.x,c.m.y-c.m.h-30,'ЯРОСТЬ!','#ff4a2a');}
  /* коронный удар: ждём, пока босс свободен */
  if(!F.u){F.ultT-=dt;
    if(F.ultT<=0&&c.B.atk==='idle'&&!(c.m.invuln>0))bfUltStart(c);}
}
function bfStart(c){
  G.bf={m:c.m,t:0,pots:BF.BELT,ultT:11,winT:0,u:null,enr:false,rallyT:1,rallyAcc:0,rallyShow:0,phaseSeen:0};
  player.wound=0;player.healLeft=0;
  if(!player.prog.bfHelp){player.prog.bfHelp=1;
    UI.toast('Рывок: дважды быстро толкни джойстик в сторону — миг неуязвимости. В бою 8 аптечек.');}
}
function bfEnd(){G.bf=null;player.wound=0;player.healLeft=0;}

/* ---------- аптечка в бою ---------- */
function bfMedkit(){
  const F=G.bf;
  if(F.pots<=0){floatText(player.x,player.y-64,'Пояс пуст: 8 аптечек на бой','#ff8a8a');SFX.uiBack();return;}
  if((player.potionCd||0)>0){if(sfxGate('bfcd',500)){floatText(player.x,player.y-64,'Аптечка через '+Math.ceil(player.potionCd)+' с','#ffd98a');SFX.uiBack();}return;}
  const cap=player.maxHp-(player.wound||0);
  if(player.hp>=cap-0.5){floatText(player.x,player.y-64,player.wound>1?'Рану лечат только удары по боссу':'Здоровье полное','#9be8ff');SFX.uiBack();return;}
  player.potions--;F.pots--;
  player.healLeft=(player.healLeft||0)+Math.round(player.maxHp*BF.HEAL);player.healRate=player.healLeft/BF.HEAL_T;
  player.potionCd=BF.HEAL_CD;
  floatText(player.x,player.y-70,'Лечение… (осталось '+F.pots+')','#7dffa0');
  burst(player.x,player.y-24,10,'#7dffa0',110,3);SFX.heal();vib(15);
  if(player.potions<=0)validateSelection();
}

/* ---------- урон по шахтёру: рана и срыв лечения ---------- */
function bfOnHurt(d,env){
  if(!bfOn()||d<=0)return;
  if(player.healLeft>0){player.healLeft=0;floatText(player.x,player.y-player.h-40,'Лечение сорвано!','#ff9a8a');}
  if(!env)player.wound=Math.min(player.maxHp*BF.WOUND_MAX,(player.wound||0)+d*BF.WOUND_K);
}
/* удар по боссу возвращает часть раны */
function bfOnBossDamage(m,dmg){
  const F=G.bf;if(!F||F.m!==m||!(player.wound>0)||player.hp<=0)return;
  let a=dmg/m.maxHp*BF.RALLY_K*player.maxHp;
  a=Math.min(a,player.wound,Math.max(0,player.maxHp*BF.RALLY_RATE-F.rallyAcc));
  if(a<=0)return;
  F.rallyAcc+=a;player.wound-=a;player.hp=Math.min(player.maxHp,player.hp+a);F.rallyShow+=a;
}
/* множитель урона по боссу: окна ×2, остальное время ×0.7 */
function bfDmgMul(m){
  if(!G.bf||G.bf.m!==m)return 1;
  const B=m.b||{};
  const win=G.bf.winT>0||B.weak>0||B.stagT>0||B.restT>0;
  return win?BF.WIN_MUL:BF.OFF_MUL;
}
function bfWindow(){const c=bfCtx();if(!c||!G.bf)return false;const B=c.B;return G.bf.winT>0||B.weak>0||B.stagT>0||B.restT>0;}

/* ---------- коронный удар ---------- */
function bfUltStart(c){
  const F=G.bf,B=c.B,m=c.m,L=BF_ULTS[c.id]||BF_ULTS.devourer;
  const ph=B.phase||1,pick=ph<=L.length?L[ph-1]:L[Math.floor(Math.random()*L.length)];
  const R=c.R,type=pick[0],ax0=R.minX-m.w*0.5+TILE,ax1=R.maxX+m.w*0.5-TILE;
  const u={type,name:pick[1],t:0,warn:BF_WARN[type],fired:false,frac:ph>=3?0.8:ph>=2?0.7:0.6,ax0,ax1,floor:R.floor,top:R.top};
  if(type==='gap'){
    /* ближнее укрытие — на виду, с той стороны, где камере видно больше; второе всегда дальше */
    /* укрытие только над твёрдым полом: не над лавой и не над кислотой */
    const w=3.4*TILE,dry=(x)=>{for(const o of [-1,0,1]){const xx=x+o*TILE,fy=hbFloorAt(xx,player.y-8),t=getTile(Math.floor(xx/TILE),Math.floor(fy/TILE));if(t===T_LAVA||isLiq(t))return false;}return true;};
    const side=Math.sign(G.cam.x-player.x)||(Math.random()<0.5?-1:1);
    let g1=null;
    for(let k=0;k<24&&g1===null;k++){const s2=k<12?side:-side,x=clamp(player.x+s2*rnd(3,4.5+k*0.4)*TILE,ax0+w,ax1-w);if(Math.abs(x-player.x)>=2.5*TILE&&dry(x))g1=x;}
    if(g1===null)g1=dry(player.x)?clamp(player.x+side*3*TILE,ax0+w,ax1-w):clamp(player.x,ax0+w,ax1-w);
    const d1=Math.abs(g1-player.x);let g2=rnd(ax0+w,ax1-w);
    for(let k=0;k<30&&(Math.abs(g2-g1)<9*TILE||Math.abs(g2-player.x)<d1+3*TILE||!dry(g2));k++)g2=rnd(ax0+w,ax1-w);
    u.gaps=[[g1-w/2,g1+w/2],[g2-w/2,g2+w/2]];
  }
  if(type==='beam')u.y=player.y-player.h*0.5;
  if(type==='nova'){u.x=m.x;u.y=m.y-m.h*0.5;u.r=7.5*TILE;}
  F.u=u;B.atk='ult';B.at=0;B.sub=0;B.queue=[];
  SFX.boom();shake(6);vib(60);
}
/* ход босса во время коронного удара (вызывается вместо его обычных атак) */
function bfBossUlt(m,B,dt,R){
  const F=G.bf,u=F&&F.u;
  if(!u){B.atk='idle';B.at=0;return;}
  m.vx*=Math.pow(0.05,dt);m.vy*=Math.pow(0.05,dt);m.x+=m.vx*dt;m.y+=m.vy*dt;
  if(m.def.hb&&(m.def.hb==='mother'||m.def.hb==='warden'||m.def.hb==='toadking'))hbGround(m,dt,R);
  m.facing=player.x>=m.x?1:-1;
  u.t+=dt;m.tele=Math.min(1,u.t/u.warn);B.open=1;
  if(u.type==='beam'&&u.t<0.55)u.y=lerp(u.y,player.y-player.h*0.5,Math.min(1,dt*10));   /* сначала следит, потом замирает */
  if(u.type==='nova'){u.x=m.x;u.y=m.y-m.h*0.5;}
  if(!u.fired&&u.t>=u.warn){u.fired=true;m.tele=0;bfUltFire(u);}
  if(u.fired&&u.t>=u.warn+0.5){F.u=null;F.ultT=bfUltInterval(B);
    /* после коронного — окно для ответа */
    if(m.def.hb)hbRest(m,B,2.4);else{B.atk='idle';B.at=0;}
    F.winT=2.4;floatText(m.x,m.y-m.h-26,'ОКНО! Урон ×2','#ffe070');}
}
function bfUltInterval(B){const ph=B.phase||1;return (ph>=3?15:ph>=2?19:24)*(G.bf&&G.bf.enr?0.7:1);}
function bfInUlt(u){
  const pcx=player.x,pcy=player.y-player.h*0.5;
  if(u.type==='gap')return !u.gaps.some(([a,b])=>pcx>=a&&pcx<=b);
  if(u.type==='quake')return (player.onGround||player.onLadder)&&player.y>u.floor-2.5*TILE;
  if(u.type==='beam')return Math.abs(pcy-u.y)<1.15*TILE+10;
  if(u.type==='nova')return Math.hypot(pcx-u.x,pcy-u.y)<u.r;
  return false;
}
function bfUltFire(u){
  shake(18);SFX.boom();vib(160);G.hbStop=Math.max(G.hbStop||0,0.06);
  /* частицы по всей опасной зоне */
  const N=40;for(let i=0;i<N;i++){let x,y;
    if(u.type==='nova'){const a=Math.random()*TAU,r=Math.sqrt(Math.random())*u.r;x=u.x+Math.cos(a)*r;y=u.y+Math.sin(a)*r;}
    else if(u.type==='beam'){x=rnd(u.ax0,u.ax1);y=u.y+rnd(-TILE,TILE);}
    else{x=rnd(u.ax0,u.ax1);if(u.gaps&&u.gaps.some(([a,b])=>x>=a&&x<=b))continue;y=u.type==='quake'?u.floor-rnd(0,40):rnd(u.top,u.floor);}
    spawnPart(x,y,rnd(-80,80),rnd(-260,-40),rnd(0.4,0.9),i%3?'#ff5a2a':'#ffe0a0',rnd(2,4.5),300);}
  if(!bfInUlt(u))return;
  if(cheats.god)return;
  if(player.dashI>0){floatText(player.x,player.y-player.h-30,'Уклон!','#cfe8ff');return;}
  /* при любой броне: часть от полного здоровья */
  const d=Math.round(player.maxHp*u.frac);
  player.hp-=d;player.hurtCd=0.8;player.lastHurtT=G.time;
  if(player.healLeft>0)player.healLeft=0;
  floatText(player.x,player.y-60,'-'+d+' · '+u.name,'#ff4a2a');shake(10);SFX.hurt();vib(200);
  burst(player.x,player.y-24,16,'#ff4d4d',200,3.4);
  if(player.hp<=0){player.hp=0;if(!tryRevive())playerDie();}
}

/* ---------- рывок ---------- */
const BFI={st:0,sgn:0,lastPushT:-9,lastSgn:0,relT:-9,keyT:{},keySgn:0};
function bfDash(dir){
  if(G.scene!=='mine'||G.bossCut||player.hp<=0)return;
  if((player.dashCd||0)>0||(grapple&&grapple.state==='anchored'))return;
  if(player.fx&&player.fx.stun>0)return;
  dir=dir||player.facing||1;
  player.dashDir=dir;player.facing=dir;player.dashT=BF.DASH_T;player.dashI=BF.DASH_I;player.dashCd=BF.DASH_CD;
  if(!G.bfTrail)G.bfTrail=[];
  AU.noise(0.2,900,0.16,0,{type:'bandpass',to:2800,q:0.8});vib(12);
}
/* двойной быстрый толчок джойстика в одну сторону */
function bfDashInput(){
  const j=Input.joy,now=performance.now();
  const x=j.active?j.dx:0,sg=x>0.8?1:x<-0.8?-1:0;
  if(BFI.st===0&&sg!==0){
    if(sg===BFI.lastSgn&&now-BFI.lastPushT<330&&now-BFI.relT<200)bfDash(sg);
    BFI.st=sg;BFI.lastPushT=now;BFI.lastSgn=sg;
  }else if(BFI.st!==0&&Math.abs(x)<0.35){BFI.st=0;BFI.relT=now;}
}
/* клавиатура: Shift — рывок, двойное нажатие A/D — тоже */
window.addEventListener('keydown',e=>{
  if(e.repeat||e.target&&(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'))return;
  if(e.code==='ShiftLeft'||e.code==='ShiftRight'){const d=(Input.keys.KeyA||Input.keys.ArrowLeft)?-1:(Input.keys.KeyD||Input.keys.ArrowRight)?1:player.facing;bfDash(d);return;}
  const sg=(e.code==='KeyA'||e.code==='ArrowLeft')?-1:(e.code==='KeyD'||e.code==='ArrowRight')?1:0;if(!sg)return;
  const now=performance.now();if(BFI.keySgn===sg&&now-(BFI.keyT[sg]||0)<260)bfDash(sg);BFI.keySgn=sg;BFI.keyT[sg]=now;
});
/* шаг физики рывка: вызывается перед перемещением шахтёра */
function bfDashMove(dt){
  if(!(player.dashT>0))return;
  player.dashT-=dt;player.vx=player.dashDir*BF.DASH_V;player.vy=Math.min(player.vy,60);
  if(G.bfTrail&&(!G.bfTrail.length||Math.abs(G.bfTrail[G.bfTrail.length-1].x-player.x)>14))G.bfTrail.push({x:player.x,y:player.y,f:player.dashDir,t:1});
}

/* ---------- отрисовка в мире ---------- */
function bfDrawWorld(g){
  /* след рывка: полупрозрачные силуэты */
  if(G.bfTrail&&G.bfTrail.length){g.save();
    for(const s of G.bfTrail){const a=0.35*s.t;g.fillStyle='rgba(190,225,255,'+a+')';
      g.beginPath();g.ellipse(s.x,s.y-player.h*0.42,9,player.h*0.42,0,0,TAU);g.fill();
      g.beginPath();g.arc(s.x+s.f*2,s.y-player.h*0.92,7,0,TAU);g.fill();}
    g.restore();}
  const F=G.bf;if(!F||!F.m)return;
  const t=G.time;
  /* ярость: красное дыхание вокруг босса */
  if(F.enr&&F.m.alive){const m=F.m;g.save();g.globalCompositeOperation='lighter';softGlow(g,m.x,m.y-m.h*0.5,Math.max(m.w,m.h)*0.9,'#ff3a1a',0.18+0.1*Math.sin(t*6));g.restore();}
  const u=F.u;if(!u)return;
  const k=clamp(u.t/u.warn,0,1),pulse=0.5+0.5*Math.sin(t*(10+k*14));
  g.save();
  const zoneA=u.fired?0.55*clamp(1-(u.t-u.warn)/0.5,0,1):0.10+0.22*k+0.08*pulse;
  const red='rgba(255,58,32,';
  if(u.type==='gap'||u.type==='quake'){
    const y0=u.type==='quake'?u.floor-2.5*TILE:u.top,y1=u.floor;
    const segs=[];if(u.type==='gap'){const gs=u.gaps.slice().sort((a,b)=>a[0]-b[0]);let x=u.ax0;for(const [a,b] of gs){if(a>x)segs.push([x,a]);x=Math.max(x,b);}if(x<u.ax1)segs.push([x,u.ax1]);}else segs.push([u.ax0,u.ax1]);
    for(const [a,b] of segs){g.fillStyle=red+zoneA+')';g.fillRect(a,y0,b-a,y1-y0);
      if(!u.fired){g.strokeStyle=red+(0.5+0.4*pulse)+')';g.lineWidth=2;g.setLineDash([10,8]);g.lineDashOffset=-t*40;g.strokeRect(a+1,y0+1,b-a-2,y1-y0-2);g.setLineDash([]);
        /* полоса отсчёта по низу */
        g.fillStyle=red+'.85)';g.fillRect(a,y1-5,(b-a)*k,5);}}
    if(u.type==='gap'&&!u.fired)for(const [a,b] of u.gaps){
      g.fillStyle='rgba(110,255,150,'+(0.16+0.12*pulse)+')';g.fillRect(a,u.top,b-a,u.floor-u.top);
      g.strokeStyle='rgba(140,255,170,.85)';g.lineWidth=2.5;g.strokeRect(a+1,u.top+1,b-a-2,u.floor-u.top-2);
      const cx=(a+b)/2,ay=u.floor-60-Math.sin(t*6)*8;g.fillStyle='#9dffb8';
      g.beginPath();g.moveTo(cx,ay+18);g.lineTo(cx-12,ay);g.lineTo(cx-5,ay);g.lineTo(cx-5,ay-16);g.lineTo(cx+5,ay-16);g.lineTo(cx+5,ay);g.lineTo(cx+12,ay);g.closePath();g.fill();}
    /* стрелка от шахтёра к ближайшему укрытию */
    if(u.type==='gap'&&!u.fired&&bfInUlt(u)){let best=null,bd=1e9;for(const [a,b] of u.gaps){const cx=(a+b)/2,d=Math.abs(cx-player.x);if(d<bd){bd=d;best=cx;}}
      const s=Math.sign(best-player.x)||1,ax=player.x+s*(30+6*Math.sin(t*10)),ay=player.y-player.h-18;
      g.fillStyle='#9dffb8';g.beginPath();g.moveTo(ax+s*16,ay);g.lineTo(ax,ay-10);g.lineTo(ax,ay-4);g.lineTo(ax-s*12,ay-4);g.lineTo(ax-s*12,ay+4);g.lineTo(ax,ay+4);g.lineTo(ax,ay+10);g.closePath();g.fill();}
  }else if(u.type==='beam'){
    const h=1.15*TILE+10;g.fillStyle=red+zoneA+')';g.fillRect(u.ax0,u.y-h,u.ax1-u.ax0,h*2);
    if(!u.fired){g.strokeStyle=red+(0.5+0.4*pulse)+')';g.lineWidth=2;g.setLineDash([12,8]);g.lineDashOffset=-t*60;
      g.beginPath();g.moveTo(u.ax0,u.y-h);g.lineTo(u.ax1,u.y-h);g.moveTo(u.ax0,u.y+h);g.lineTo(u.ax1,u.y+h);g.stroke();g.setLineDash([]);
      g.fillStyle=red+'.9)';g.fillRect(u.ax0,u.y-1.5,(u.ax1-u.ax0)*k,3);}
    else{g.fillStyle='rgba(255,240,200,'+zoneA+')';g.fillRect(u.ax0,u.y-h*0.35,u.ax1-u.ax0,h*0.7);}
  }else if(u.type==='nova'){
    g.fillStyle=red+zoneA+')';g.beginPath();g.arc(u.x,u.y,u.r,0,TAU);g.fill();
    if(!u.fired){g.strokeStyle=red+(0.55+0.4*pulse)+')';g.lineWidth=3;g.setLineDash([14,9]);g.lineDashOffset=-t*50;g.beginPath();g.arc(u.x,u.y,u.r,0,TAU);g.stroke();g.setLineDash([]);
      g.strokeStyle=red+'.9)';g.lineWidth=4;g.beginPath();g.arc(u.x,u.y,u.r*k,0,TAU);g.stroke();}
  }
  g.restore();
}
/* ---------- отрисовка поверх экрана: табличка коронного удара, края экрана, ярость ---------- */
function bfDrawHud(){
  const F=G.bf;if(!F||!bfCtx())return;
  const W=view.W,H=view.H,u=F.u;
  ctx.save();
  if(u&&!u.fired){
    const k=clamp(u.t/u.warn,0,1),p=0.5+0.5*Math.sin(G.time*12);
    /* красные края экрана */
    const vg=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*0.35,W/2,H/2,Math.max(W,H)*0.75);
    vg.addColorStop(0,'rgba(255,40,20,0)');vg.addColorStop(1,'rgba(255,40,20,'+(0.16+0.16*p)+')');
    ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
    const y=(W<600?HUDL.rb+6:38)+40,bw=Math.min(W-24,340),bx=W/2-bw/2;
    ctx.fillStyle='rgba(24,8,6,.92)';roundRect(ctx,bx,y,bw,46,10);ctx.fill();
    ctx.strokeStyle='rgba(255,80,50,'+(0.6+0.4*p)+')';ctx.lineWidth=2;roundRect(ctx,bx,y,bw,46,10);ctx.stroke();
    ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.fillStyle='#ff7a5a';ctx.font='400 12px "Russo One",'+HUDF;ctx.fillText('КОРОННЫЙ УДАР · '+u.name.toUpperCase(),W/2,y+13);
    ctx.fillStyle='#ffe8d0';ctx.font='700 13px '+HUDF;ctx.fillText(BF_HINT[u.type],W/2,y+30);
    ctx.fillStyle='rgba(255,80,50,.85)';ctx.fillRect(bx+8,y+41,(bw-16)*(1-k),2.5);
  }else if(F.winT>0||bfWindow()){
    const y=(W<600?HUDL.rb+6:38)+40,txt='ОКНО: урон ×2',a=Math.min(1,(F.winT>0?F.winT:1)*2);
    ctx.globalAlpha=a;ctx.font='700 12px '+HUDF;const tw=ctx.measureText(txt).width+22;
    ctx.fillStyle='rgba(30,22,6,.85)';roundRect(ctx,W/2-tw/2,y,tw,22,11);ctx.fill();
    ctx.strokeStyle='rgba(255,220,100,.8)';ctx.lineWidth=1.2;roundRect(ctx,W/2-tw/2,y,tw,22,11);ctx.stroke();
    ctx.fillStyle='#ffe070';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(txt,W/2,y+11.5);
  }
  if(F.enr&&!(u&&!u.fired)){ctx.globalAlpha=0.5+0.3*Math.sin(G.time*5);ctx.fillStyle='#ff5a3a';ctx.font='700 11px '+HUDF;ctx.textAlign='right';ctx.textBaseline='top';
    ctx.fillText('ЯРОСТЬ',W-14,(W<600?HUDL.rb+6:38)+24);}
  ctx.restore();
}
/* часть полоски здоровья: рана (тёмная, штриховка) и лечение в пути (светло-зелёное) */
function bfDrawHpExtra(bx,by,bw,bh){
  if(!G.bf)return;
  const hp=clamp(player.hp/player.maxHp,0,1),w=clamp((player.wound||0)/player.maxHp,0,1),hl=clamp((player.healLeft||0)/player.maxHp,0,1-hp-w);
  ctx.save();
  if(hl>0.002){ctx.fillStyle='rgba(125,255,160,'+(0.35+0.2*Math.sin(G.time*10))+')';ctx.fillRect(bx+bw*hp,by,bw*hl,bh);}
  if(w>0.002){const x=bx+bw*(1-w);ctx.fillStyle='rgba(70,10,14,.9)';ctx.fillRect(x,by,bw*w,bh);
    ctx.save();ctx.beginPath();ctx.rect(x,by,bw*w,bh);ctx.clip();ctx.strokeStyle='rgba(255,90,90,.45)';ctx.lineWidth=1.2;
    for(let q=x-bh;q<x+bw*w+bh;q+=5){ctx.beginPath();ctx.moveTo(q,by+bh);ctx.lineTo(q+bh,by);ctx.stroke();}ctx.restore();}
  ctx.restore();
}

/* правила боя — в окне призыва */
function bfRulesHtml(){
  return `<p class="tiny" style="line-height:1.5;margin:6px 0 0;text-align:left">⚔ <b>Правила боя:</b> с собой <b>8 аптечек</b>, лечат 30% за 2 с (удар срывает лечение), перерыв 6 с.
  Часть урона — <b>рана</b> (тёмная часть полоски): её возвращают только удары по боссу.
  <b>Коронные удары</b> снимают почти всё здоровье — смотри на красную зону и табличку, уворачивайся.
  <b>Рывок</b> — дважды быстро толкни джойстик в сторону (Shift на клавиатуре): миг неуязвимости.
  В <b>окна</b> (после коронного удара, при оглушении, «Сердце открыто») урон ×2. После 2,5 минуты босс впадает в <b>ярость</b>.</p>`;
}
/* перерыв аптечки на кнопке: тёмный сектор и секунды */
function bfCdPie(x,y,r){
  if(!bfOn()||!((player.potionCd||0)>0))return;
  const k=clamp(player.potionCd/BF.HEAL_CD,0,1);
  ctx.save();ctx.fillStyle='rgba(8,6,4,.62)';ctx.beginPath();ctx.moveTo(x,y);ctx.arc(x,y,r*0.88,-Math.PI/2,-Math.PI/2+TAU*k);ctx.closePath();ctx.fill();
  ctx.fillStyle='#ffe2a6';ctx.font='700 '+Math.max(11,Math.round(r*0.42))+'px '+HUDF;ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(Math.ceil(player.potionCd),x,y-r*0.05);ctx.restore();
}
