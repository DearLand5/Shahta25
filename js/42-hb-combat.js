'use strict';
/* ============================================================
   ВЛАДЫКИ ПРЕИСПОДНЕЙ: честная боёвка.
   - попадания и дальность считаются до края тела босса, а не до центра;
   - автоприцел и самонаводящиеся ракеты выбирают босса, а не мелких тварей;
   - шкала оглушения: если быстро нанести много урона, босс шатается и открывается;
   - ощущение удара: короткая пауза при сильном попадании, вздрагивание,
     урон по боссу показывается одной суммой, а не россыпью цифр.
   ============================================================ */
/* тело босса — прямоугольник чуть уже рамки модели */
function hbBody(m){const w=m.w*0.42,h=m.h*0.46;return {cx:m.x,cy:m.y-m.h*0.5,hw:w,hh:h};}
function hbDistToMob(m,px,py){const b=hbBody(m);return Math.hypot(Math.max(0,Math.abs(px-b.cx)-b.hw),Math.max(0,Math.abs(py-b.cy)-b.hh));}
/* видимая точка тела: сначала ближайшая к игроку, потом центр, верх, низ, бока */
function hbVisiblePoint(m,px,py){
  const b=hbBody(m),cx=clamp(px,b.cx-b.hw*0.8,b.cx+b.hw*0.8),cy=clamp(py,b.cy-b.hh*0.8,b.cy+b.hh*0.8);
  const pts=[[cx,cy],[b.cx,b.cy],[b.cx,b.cy-b.hh*0.7],[b.cx,b.cy+b.hh*0.7],[b.cx-b.hw*0.7,b.cy],[b.cx+b.hw*0.7,b.cy]];
  for(const [x,y] of pts)if(lineClear(px,py,x,y))return {x,y};
  return null;
}
/* цель автоприцела в бою с Владыкой: сам Владыка, если он в досягаемости и виден.
   Пока у Императора есть копии — обычный выбор ближайшей цели (угадай настоящего). */
function hbAutoTarget(range){
  const H=hbFight();if(!H||G.bossCut)return null;const m=H.m;
  if(m.untargetable||m.hidden)return null;
  if(mobs.some(o=>o.alive&&o.def.mech==='hbecho'))return null;
  const px=player.x,py=player.y-player.h*0.5;
  if(hbDistToMob(m,px,py)>range)return null;
  const v=hbVisiblePoint(m,px,py);if(!v)return null;
  m._aimX=v.x;m._aimY=v.y;m._aimT=G.time;return m;
}
function hbAimPoint(t){return t&&t.def&&t.def.hb&&t._aimT===G.time?{x:t._aimX,y:t._aimY}:{x:t.x,y:t.y-t.h*0.5};}

/* ---------- попадание по боссу ---------- */
function hbOnHit(m,dmg,src){
  const B=m.b;if(!B)return;
  /* сумма урона одной цифрой */
  if(!(m._dnT>0)){m._dn=0;m._dnX=src&&src.x!==undefined?src.x:player.x;}
  m._dn+=dmg;m._dnT=0.5;m._dnPop=1;
  /* вздрагивание модели */
  m.flinch=Math.min(1,(m.flinch||0)+0.5+dmg/(m.maxHp*0.01));
  m.flinchDir=Math.sign(m.x-(src&&src.x!==undefined?src.x:player.x))||1;
  if(dmg>=m.maxHp*0.012)G.hbStop=Math.max(G.hbStop||0,0.05);
  /* шкала оглушения (не в переходе фаз и не во время оглушения) */
  if(B.atk==='trans'||B.stagT>0||G.bossCut)return;
  const th=m.maxHp*(m.def.hb==='archdemon'?0.05:0.075);
  B.stag=(B.stag||0)+dmg;
  if(B.stag>=th){B.stag=0;hbStagger(m,B);}
}
function hbStagger(m,B){
  B.stagT=m.def.hb==='archdemon'?2.2:1.9;B.weak=B.stagT;B.queue=[];B.atk='stagger';B.at=0;B.sub=0;m.tele=0;
  B.tongue=null;B.fist=null;B.sweepK=0;B.swing=0;B.breath=0;B.dashing=0;B.diving=0;m.untargetable=false;m.alpha=1;
  G.hbStop=Math.max(G.hbStop||0,0.09);shake(9);SFX.boom();vib(90);
  floatText(m.x,m.y-m.h-26,'ОГЛУШЁН!','#ffe070');
  for(let i=0;i<24;i++){const a=Math.random()*TAU,sp=rnd(80,260);spawnPart(m.x,m.y-m.h*0.6,Math.cos(a)*sp,Math.sin(a)*sp,rnd(0.4,0.8),i%2?'#ffe070':'#ffffff',rnd(2,4),200);}
}
/* поведение во время оглушения и отдыха после тяжёлой атаки: опускается к игроку и стоит открытым */
function hbStaggerTick(m,B,dt,R){
  if(B.stagT>0)B.stagT-=dt;else B.restT-=dt;
  const flyer=m.def.hb==='herald'||m.def.hb==='emperor'||(m.def.hb==='archdemon'&&B.fly);
  if(flyer){const ty=Math.min(R.floor-TILE*0.2,player.y+m.h*0.35);m.vx*=Math.pow(0.05,dt);m.vy=lerp(m.vy,clamp((ty-m.y)*2,-260,260),Math.min(1,dt*3));m.x+=m.vx*dt;m.y+=m.vy*dt;}
  else if(m.def.hb!=='warden'&&m.def.hb!=='mother'||m.def.hb==='mother'&&B.free){m.vx*=Math.pow(0.02,dt);hbGround(m,dt,R);}
  else m.vx=0;
  if(Math.random()<0.25)spawnPart(m.x+rnd(-m.w*0.3,m.w*0.3),m.y-m.h*rnd(0.8,1.05),rnd(-20,20),rnd(-40,-10),0.6,'#ffe070',2,0);
  if(!(B.stagT>0)&&!(B.restT>0)){B.atk='idle';B.at=0;B.sub=0;}
}
/* короткий «отдых» после тяжёлой атаки — окно для ответного удара */
function hbRest(m,B,t){B.atk='rest';B.at=0;B.sub=0;B.restT=t;B.weak=Math.max(B.weak||0,t*0.9);m.tele=0;}
/* отложенные действия боссов по игровому времени (раньше — setTimeout:
   срабатывали даже на паузе и в замедлении) */
const hbLaterQ=[];
function hbLater(sec,fn){hbLaterQ.push({t:G.time+sec,fn});}
function hbCombatTick(dt){
  if(hbLaterQ.length){const now=G.time,due=[];
    for(let i=0;i<hbLaterQ.length;)if(now>=hbLaterQ[i].t)due.push(hbLaterQ.splice(i,1)[0]);else i++;
    for(const q of due){try{q.fn();}catch(e){}}}
  const H=hbFight();if(!H){hbLaterQ.length=0;return;}const m=H.m;
  if(m._dnT>0){m._dnT-=dt;if(m._dnT<=0&&m._dn>0){floatText(m.x+rnd(-10,10),m.y-m.h-10,fmt(Math.round(m._dn)),m.b&&m.b.weak>0?'#ffd040':'#ffe8c0');m._dn=0;}}
  if(m._dnPop>0)m._dnPop-=dt*4;
  if(m.flinch>0)m.flinch=Math.max(0,m.flinch-dt*5);
  const B=m.b;if(B&&B.stag>0&&!(B.stagT>0))B.stag=Math.max(0,B.stag-m.maxHp*0.012*dt);
}
