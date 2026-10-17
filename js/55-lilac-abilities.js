'use strict';
/* ============================================================
   ЛИЛОВЫЕ НЕБЕСА — Зал Отражений и способности (работают только в шахте Лиловых небес).
   Энергия — Эфир (100, копится сама). Две ячейки на экране (клавиши Q и E).
   Шесть способностей, у каждой 5 уровней; на 5-м — выбор одной из двух мутаций.
   Прогресс — player.prog.ab {lv:{id:1..5}, mut:{id:'a'|'b'}, slot:[id,id]}
   (prog сохраняется целиком; в старых сейвах поля нет — создаётся пустым).
   ============================================================ */
const AB_DEFS=[
  {id:'shadow',name:'Душа тени',ess:'eMirror',m0:3000000,s0:40,
    txt:'Тело застывает статуей, а ты управляешь теневым клоном: он летает, бьёт когтями тени и просачивается сквозь тонкие стены.',
    cost:[60,60,60,60,60],cd:[24,22,20,18,16],
    lvTxt:['8 с, когти 60% меча, стены в 1 клетку','10 с, когти 75%','11,5 с, когти 90%, стены в 2 клетки','13 с, когти 105%, клон отмечает руду','15 с, когти 120%, стены в 3 клетки'],
    mut:[['Взрыв тени','В конце клон взрывается и ранит всех вокруг'],['Обмен','В конце ты меняешься с клоном местами']]},
  {id:'blink',name:'Шаг сквозь пелену',ess:'eDew',m0:1500000,s0:20,
    txt:'Мгновенный шаг в сторону прицела — сквозь стены и врагов.',
    cost:[25,22,20,18,15],cd:[3,2.6,2.2,1.8,1.5],
    lvTxt:['3 клетки','3,5 клетки','4 клетки','5 клеток','6 клеток'],
    mut:[['Разлом','За тобой остаётся режущий разлом'],['Миг вне мира','После шага 1 секунду тебя не ранить']]},
  {id:'dome',name:'Лиловый купол',ess:'eHoney',m0:2000000,s0:25,
    txt:'Пузырь вокруг шахтёра: поглощает урон и отражает снаряды обратно.',
    cost:[40,40,40,40,40],cd:[20,19,18,17,16],
    lvTxt:['4 с, держит 25% здоровья','5 с, 32%','6 с, 40%','7 с, 48%','8 с, 56%'],
    mut:[['Отталкивание','Купол выталкивает врагов наружу'],['Целебный купол','Внутри лечит 3% здоровья в секунду']]},
  {id:'lullaby',name:'Колыбельная',ess:'eToy',m0:2500000,s0:30,
    txt:'Усыпляет существ вокруг. Боссов только замедляет. Удар будит спящего.',
    cost:[45,45,45,45,45],cd:[18,17,16,15,14],
    lvTxt:['радиус 5 клеток, сон 3 с','5,5 клетки, 3,5 с','6 клеток, 4 с','7 клеток, 5 с','8 клеток, 6 с'],
    mut:[['Глубокий сон','Спящие получают двойной урон от первого удара'],['Сон-кошмар','Спящие теряют 4% здоровья в секунду']]},
  {id:'eye',name:'Око истины',ess:'eChime',m0:1500000,s0:20,
    txt:'Показывает Истину без потери Рассудка: истинную руду, мимиков, настоящий облик мобов.',
    cost:[50,50,50,50,50],cd:[30,28,26,24,22],
    lvTxt:['6 с','7 с','8 с','9 с','10 с'],
    mut:[['Долгий взгляд','Око держится в полтора раза дольше'],['Уязвимые места','Пока открыто Око, урон по врагам ×1,5']]},
  {id:'thread',name:'Нить судьбы',ess:'eDew',m0:1000000,s0:15,
    txt:'Первое нажатие ставит метку, следующие возвращают к ней из любой точки шахты. Удержание — переставить метку.',
    cost:[40,35,30,25,20],cd:[10,8.5,7,5.5,4],
    lvTxt:['возврат за 40 Эфира','35 Эфира','30 Эфира','25 Эфира','20 Эфира'],
    mut:[['Две метки','Можно держать две метки, возврат — по очереди'],['Нить домой','Стоя у метки, нить поднимает в деревню вместе с рюкзаком']]}
];
const AB_BY={};for(const a of AB_DEFS)AB_BY[a.id]=a;
const AB_ETHER=100,AB_REGEN=6;
function abP(){if(!player.prog)player.prog={};const p=player.prog.ab||(player.prog.ab={lv:{},mut:{},slot:[null,null]});if(!p.lv)p.lv={};if(!p.mut)p.mut={};if(!Array.isArray(p.slot))p.slot=[null,null];return p;}
function abLv(id){return abP().lv[id]|0;}
function abMut(id){return abP().mut[id]||null;}
/* цена: уровень 1 — открыть, дальше — улучшения */
function abPrice(id){const d=AB_BY[id],L=abLv(id);if(L>=5)return null;const k=Math.pow(1.9,L);return {money:Math.round(d.m0*k),ess:d.ess,essN:2+L,souls:Math.round(d.s0*(1+L*0.6))};}
/* состояние в шахте */
const LAB={eth:AB_ETHER,cd:{},sh:null,dome:null,eyeT:0,eyeMax:0,phase:0,rifts:[],marks:[],markI:0,press:{},flash:0};
function abOn(){return G.dim===2&&G.scene==='mine'&&!G.bossCut;}
function lilShadowOn(){return !!LAB.sh;}
function abBoss(){return (typeof hbFight==='function'&&hbFight())||mobs.some(m=>m.def.boss&&m.alive);}

/* ---------- урон по шахтёру: статуя, купол, миг вне мира ---------- */
function lilAbHurt(dmg,src){
  if(LAB.phase>0)return 0;
  if(LAB.sh&&!abBoss())return 0;
  if(LAB.dome&&LAB.dome.hp>0){const a=Math.min(LAB.dome.hp,dmg);LAB.dome.hp-=a;LAB.dome.hit=0.25;dmg-=a;
    if(LAB.dome.hp<=0){LAB.dome.t=Math.min(LAB.dome.t,0.25);floatText(player.x,player.y-70,'Купол лопнул','#d8b0ff');AU.bell(660,0.6,0.08,0,{ratio:1.41,index:1});}}
  return lgHurt(dmg*lbMod('hurt'));
}
/* урон по мобам: Око с мутацией «Уязвимые места», глубокий сон */
function lilAbMobDmg(m,dmg){
  if(LAB.eyeT>0&&abMut('eye')==='b')dmg*=1.5;
  if(m.sleepT>0){if(abMut('lullaby')==='a'&&!m.sleepHit){dmg*=2;floatText(m.x,m.y-m.h-20,'×2 во сне','#c8b0ff');}m.sleepHit=1;m.sleepT=0;m.stun=0;}
  return dmg*lbDmgMul()*lgDmgVs(m);
}

/* ---------- нажатия ---------- */
function abUse(slot,long){
  if(!abOn())return;
  const id=abP().slot[slot];
  if(!id||!abLv(id)){UI.toast('Ячейка пуста — выбери способность в Зале Отражений');return;}
  const L=abLv(id)-1,d=AB_BY[id];
  if(id==='shadow'&&LAB.sh){abShadowEnd(false);return;}
  if((LAB.cd[id]||0)>0){floatText(player.x,player.y-70,'Ещё '+Math.ceil(LAB.cd[id])+' с','#c8b0ff');return;}
  let cost=d.cost[L];
  if(id==='thread'){const M=abMut('thread');
    if(long||!LAB.marks.length){cost=15;if(LAB.eth<cost){abNoEther();return;}LAB.eth-=cost;abPlaceMark();return;}
    if(M==='b'&&LAB.marks.some(k=>Math.hypot(k.x-player.x,k.y-player.y)<TILE*2.2)){if(LAB.eth<cost){abNoEther();return;}LAB.eth-=cost;LAB.cd[id]=d.cd[L];abThreadHome();return;}}
  if(LAB.eth<cost){abNoEther();return;}
  LAB.eth-=cost;LAB.cd[id]=d.cd[L];
  ABF[id](L);
}
function abNoEther(){floatText(player.x,player.y-70,'Не хватает Эфира','#c8b0ff');SFX.uiBack();}
const ABF={
  shadow(L){
    const dur=[8,10,11.5,13,15][L];
    LAB.sh={x:player.x,y:player.y-player.h*0.6,vx:0,vy:0,t:dur,dur,atk:0,inW:0,lx:player.x,ly:player.y-player.h*0.6,trail:[]};
    for(let k=0;k<26;k++)spawnPart(player.x+rnd(-12,12),player.y-rnd(0,44),rnd(-40,40),rnd(-60,0),0.8,k%2?'#2a1a3a':'#8a60c8',2.6,-20);
    AU.bell(220,1.4,0.1,0,{ratio:1.5,index:2,rev:0.8});SFX.whisper(0.6);
    UI.toast('🌑 Душа тени: веди клона джойстиком, нажми ещё раз — вернуться');
  },
  blink(L){
    let ax=Input.joy.active?Input.joy.dx:0,ay=Input.joy.active?Input.joy.dy:0;
    if(Input.keys.KeyA||Input.keys.ArrowLeft)ax-=1;if(Input.keys.KeyD||Input.keys.ArrowRight)ax+=1;if(Input.keys.KeyW||Input.keys.ArrowUp)ay-=1;if(Input.keys.KeyS||Input.keys.ArrowDown)ay+=1;
    if(Math.hypot(ax,ay)<0.2){ax=player.facing;ay=0;}
    const l=Math.hypot(ax,ay);ax/=l;ay/=l;
    const D=[3,3.5,4,5,6][L]*TILE,x0=player.x,y0=player.y;
    /* ищем самое дальнее свободное место вдоль линии */
    let best=null;
    for(let s=D;s>=TILE*0.8;s-=6){const x=clamp(x0+ax*s,TILE*1.2,(MW-1.2)*TILE),y=y0+ay*s;if(abFree(x,y)){best=[x,y];break;}}
    if(!best){floatText(player.x,player.y-70,'Некуда шагнуть','#c8b0ff');LAB.eth+=AB_BY.blink.cost[L];LAB.cd.blink=0;return;}
    for(let k=0;k<14;k++){const f=k/13;spawnPart(x0+(best[0]-x0)*f,y0-22+(best[1]-y0)*f,rnd(-20,20),rnd(-20,20),0.5,k%2?'#d8b0ff':'#7a4ab8',2.4,0);}
    if(abMut('blink')==='a')LAB.rifts.push({x0,y0:y0-22,x1:best[0],y1:best[1]-22,t:2.2,hitT:0});
    if(abMut('blink')==='b')LAB.phase=1;
    player.x=best[0];player.y=best[1];player.vx*=0.3;player.vy=Math.min(0,player.vy);player.peakY=player.y;
    AU.osc('sine',880,0.18,0.08,0,{to:1760});AU.noise(0.15,4000,0.05,0,{type:'bandpass',q:2});
  },
  dome(L){
    LAB.dome={t:[4,5,6,7,8][L],max:[4,5,6,7,8][L],hp:player.maxHp*[0.25,0.32,0.4,0.48,0.56][L],hp0:player.maxHp*[0.25,0.32,0.4,0.48,0.56][L],hit:0};
    AU.bell(523,1.2,0.08,0,{ratio:2.01,index:0.8,rev:0.6});AU.bell(784,1,0.06,0.08,{ratio:2.01,index:0.6});
  },
  lullaby(L){
    const R=[5,5.5,6,7,8][L]*TILE,dur=[3,3.5,4,5,6][L];let n=0;
    for(const m of mobs){if(!m.alive||m.def.neutral)continue;const d=Math.hypot(m.x-player.x,(m.y-m.h*0.5)-(player.y-player.h*0.5));if(d>R)continue;
      if(m.def.boss||m.def.hb){m.frozen=Math.max(m.frozen||0,dur*0.5);continue;}
      m.stun=dur;m.sleepT=dur;m.sleepHit=0;m.tele=0;n++;}
    LAB.ring={r:0,R,t:0};
    [523,659,784,659,523].forEach((f,i)=>AU.bell(f,0.9,0.05,i*0.16,{ratio:4.01,index:0.4,rev:0.7}));
    floatText(player.x,player.y-70,n?'Уснули: '+n:'Рядом никого','#c8b0ff');
  },
  eye(L){
    LAB.eyeMax=LAB.eyeT=[6,7,8,9,10][L]*(abMut('eye')==='a'?1.5:1);
    AU.bell(330,2,0.1,0,{ratio:1.41,index:2.2,rev:0.8});SFX.whisper(0.8);UI.toast('👁 Око истины открыто');
  },
  thread(L){
    /* возврат к метке */
    const M=abMut('thread'),k=M==='a'&&LAB.marks.length>1?LAB.marks[LAB.markI++%LAB.marks.length]:LAB.marks[LAB.marks.length-1];
    if(!k)return;
    LAB.pull={x0:player.x,y0:player.y,x1:k.x,y1:k.y,t:0.35};
    player.x=k.x;player.y=k.y;player.vx=0;player.vy=0;player.peakY=player.y;G.cam.x=player.x;G.cam.y=player.y-player.h*0.5;
    AU.osc('sine',660,0.3,0.07,0,{to:330});SFX.portal();
  }
};
function abFree(x,y){
  const l=Math.floor((x-player.w/2+2)/TILE),r=Math.floor((x+player.w/2-2)/TILE),t=Math.floor((y-player.h+2)/TILE),b=Math.floor((y-2)/TILE);
  for(let ty=t;ty<=b;ty++)for(let tx=l;tx<=r;tx++){if(isSolid(tx,ty))return false;}
  return true;
}
function abPlaceMark(){
  const M=abMut('thread'),k={x:player.x,y:player.y,t:0};
  if(M==='a'){LAB.marks.push(k);if(LAB.marks.length>2)LAB.marks.shift();}else LAB.marks=[k];
  floatText(player.x,player.y-70,'Метка нити','#ffd0f0');AU.bell(988,0.6,0.06,0,{ratio:3,index:0.5});
}
function abThreadHome(){floatText(player.x,player.y-70,'Нить тянет домой…','#ffd0f0');SFX.portal();LAB.marks=[];exitMine();}
function abShadowEnd(timeUp){
  const s=LAB.sh;if(!s)return;LAB.sh=null;
  const M=abMut('shadow');
  if(M==='a'){const L=abLv('shadow')-1,dmg=swordDmg()*(2+L*0.4);for(const m of mobs){if(m.alive&&Math.hypot(m.x-s.x,m.y-m.h*0.5-s.y)<110)damageMob(m,Math.round(dmg),Math.sign(m.x-s.x)||1);}
    for(let k=0;k<30;k++){const a=Math.random()*TAU,sp=rnd(80,260);spawnPart(s.x,s.y,Math.cos(a)*sp,Math.sin(a)*sp,0.7,k%2?'#2a1a3a':'#a070ff',3,0);}shake(6);SFX.boom&&SFX.boom();}
  if(M==='b'&&abFree(s.x,s.y+player.h*0.6)){player.x=s.x;player.y=s.y+player.h*0.6;player.vx=player.vy=0;player.peakY=player.y;floatText(player.x,player.y-70,'Обмен!','#c8b0ff');}
  for(let k=0;k<16;k++)spawnPart(player.x+rnd(-12,12),player.y-rnd(0,44),rnd(-30,30),rnd(-50,0),0.6,'#8a8090',2.4,200);
  AU.noise(0.3,900,0.06,0,{type:'bandpass',q:2});
}

/* ---------- такт ---------- */
function lilAbTick(dt){
  if(!abOn()){if(LAB.sh)LAB.sh=null;LAB.dome=null;LAB.eyeT=0;LAB.rifts.length=0;LAB.phase=0;if(G.scene!=='mine'){LAB.marks=[];LAB.eth=AB_ETHER;}return;}
  if(player.hp<=0){LAB.sh=null;LAB.dome=null;}
  LAB.eth=Math.min(AB_ETHER,LAB.eth+AB_REGEN*dt*(LAB.sh?0:1)*lbEthMul());
  for(const k in LAB.cd)if(LAB.cd[k]>0)LAB.cd[k]-=dt;
  if(LAB.phase>0)LAB.phase-=dt;
  if(LAB.eyeT>0){LAB.eyeT-=dt;if(LAB.eyeT<=0)UI.toast('Око закрылось');}
  if(LAB.pull){LAB.pull.t-=dt;if(LAB.pull.t<=0)LAB.pull=null;}
  /* долгое нажатие клавиши/кнопки для нити */
  for(const s in LAB.press){const p=LAB.press[s];if(!p.done&&performance.now()-p.t>600){p.done=1;abUse(+s,true);}}
  /* клон */
  const s=LAB.sh;
  if(s){
    s.t-=dt;
    let ax=0,ay=0;const j=Input.joy;
    if(j.active){ax=j.dx;ay=j.dy;}
    if(Input.keys.KeyA||Input.keys.ArrowLeft)ax-=1;if(Input.keys.KeyD||Input.keys.ArrowRight)ax+=1;
    if(Input.keys.KeyW||Input.keys.ArrowUp||Input.keys.Space||Input.jumpPtr!==null)ay-=1;if(Input.keys.KeyS||Input.keys.ArrowDown)ay+=1;
    const l=Math.hypot(ax,ay);if(l>1){ax/=l;ay/=l;}
    s.vx=lerp(s.vx,ax*230,Math.min(1,dt*8));s.vy=lerp(s.vy,ay*230,Math.min(1,dt*8));
    const nx=clamp(s.x+s.vx*dt,TILE*1.2,(MW-1.2)*TILE),ny=Math.max(TILE*6,s.y+s.vy*dt);
    s.x=nx;s.y=ny;
    /* стены: внутри породы клон держится недолго — тонкую стену пройдёт, толстую нет */
    const L=abLv('shadow')-1,thick=[1,1,2,2,3][L];
    if(isSolid(Math.floor(s.x/TILE),Math.floor(s.y/TILE))){s.inW+=dt;if(s.inW>thick*0.17+0.05){s.x=s.lx;s.y=s.ly;s.vx*=-0.3;s.vy*=-0.3;s.inW=0;}}
    else{s.inW=0;s.lx=s.x;s.ly=s.y;}
    if(Math.abs(s.vx)>4)s.f=s.vx>0?1:-1;
    s.trail.push([s.x,s.y]);if(s.trail.length>10)s.trail.shift();
    /* когти тени */
    s.atk-=dt;
    if(s.atk<=0){let hit=false;for(const m of mobs){if(!m.alive||m.untargetable)continue;if(Math.hypot(m.x-s.x,(m.y-m.h*0.5)-s.y)<48){damageMob(m,Math.round(swordDmg()*[0.6,0.75,0.9,1.05,1.2][L]),Math.sign(m.x-s.x)||1);hit=true;}}
      if(hit){s.atk=0.45;s.claw=0.2;SFX.swing();}}
    if(s.claw>0)s.claw-=dt;
    /* отметка руды */
    if(L>=3){if(!LAB.ore)LAB.ore=new Map();const tx=Math.floor(s.x/TILE),ty=Math.floor(s.y/TILE);
      for(let yy=-3;yy<=3;yy++)for(let xx=-3;xx<=3;xx++){const o=getOre(tx+xx,ty+yy);if(o)LAB.ore.set((tx+xx)+','+(ty+yy),G.time+30);}}
    if(Math.random()<dt*20)spawnPart(s.x+rnd(-8,8),s.y+rnd(-10,10),rnd(-10,10),rnd(-20,0),0.6,'#3a2a4a',2.6,-20);
    if(s.t<=0)abShadowEnd(true);
  }
  if(LAB.ore){for(const [k,t] of LAB.ore)if(G.time>t)LAB.ore.delete(k);}
  /* купол */
  const D=LAB.dome;
  if(D){D.t-=dt;if(D.hit>0)D.hit-=dt;
    const cx=player.x,cy=player.y-player.h*0.5,R=62;
    for(const p of projectiles){if(p.owner!=='mob'||p.bomb)continue;const d=Math.hypot(p.x-cx,p.y-cy);
      if(d<R+6){p.owner='player';p.vx*=-1.1;p.vy*=-1.1;p.grav=0;p.hit=new Set();p.life=Math.max(p.life,1);D.hit=0.2;spawnPart(p.x,p.y,0,0,0.3,'#e0c8ff',3,0);}}
    if(abMut('dome')==='a')for(const m of mobs){if(!m.alive||m.def.boss)continue;const dx=m.x-cx,dy=(m.y-m.h*0.5)-cy,d=Math.hypot(dx,dy);if(d<R+m.w*0.4&&d>1){m.vx+=dx/d*900*dt;if(m.def.fly)m.vy+=dy/d*900*dt;}}
    if(abMut('dome')==='b'&&player.hp>0)player.hp=Math.min(player.maxHp,player.hp+player.maxHp*0.03*dt);
    if(D.t<=0)LAB.dome=null;}
  /* разломы */
  for(let i=LAB.rifts.length-1;i>=0;i--){const r=LAB.rifts[i];r.t-=dt;r.hitT-=dt;
    if(r.hitT<=0){r.hitT=0.5;for(const m of mobs){if(!m.alive||m.untargetable)continue;
      const vx=r.x1-r.x0,vy=r.y1-r.y0,ll=vx*vx+vy*vy||1,tt=clamp(((m.x-r.x0)*vx+((m.y-m.h*0.5)-r.y0)*vy)/ll,0,1);
      if(Math.hypot(m.x-(r.x0+vx*tt),(m.y-m.h*0.5)-(r.y0+vy*tt))<26)damageMob(m,Math.round(swordDmg()*0.75),0);}}
    if(r.t<=0)LAB.rifts.splice(i,1);}
  /* сон: кошмар и пробуждение */
  for(const m of mobs){if(m.sleepT>0){m.sleepT-=dt;m.stun=Math.max(m.stun||0,0.05);
      if(abMut('lullaby')==='b'){m.nmT=(m.nmT||0)-dt;if(m.nmT<=0){m.nmT=0.5;m.hp-=m.maxHp*0.02;floatText(m.x,m.y-m.h-6,''+Math.round(m.maxHp*0.02),'#c8b0ff');if(m.hp<=0)killMob(m,false);}}
      if(m.sleepT<=0){m.stun=0;}}}
  if(LAB.ring){LAB.ring.t+=dt;LAB.ring.r=LAB.ring.R*Math.min(1,LAB.ring.t/0.5);if(LAB.ring.t>0.9)LAB.ring=null;}
}

/* ---------- кнопки на экране ---------- */
function abBtns(){
  const j=getBtnRect('joy'),r=Math.round(24*Math.min(1.3,Math.max(0.85,view.scale||1)));
  const land=view.W>view.H*1.15,y=j.y-j.r*1.45-r-8;
  return [{x:j.x-r-4,y,r},{x:j.x+r+4,y,r}];
}
function lilAbHit(x,y){if(!abOn())return -1;const B=abBtns();for(let i=0;i<2;i++){if(Math.hypot(x-B[i].x,y-B[i].y)<B[i].r+6)return i;}return -1;}
function lilAbPress(i){LAB.press[i]={t:performance.now(),done:0};const id=abP().slot[i];if(id!=='thread')abUse(i,false);}
function lilAbRelease(i){const p=LAB.press[i];delete LAB.press[i];const id=abP().slot[i];if(id==='thread'&&p&&!p.done)abUse(i,false);}
function lilAbDraw(){
  if(!abOn()||hudHidden())return;
  const B=abBtns(),P=abP();
  if(!P.slot[0]&&!P.slot[1])return;
  /* полоска Эфира над кнопками */
  const x0=B[0].x-B[0].r,w=B[1].x+B[1].r-x0,yb=B[0].y-B[0].r-12;
  ctx.globalAlpha=0.95;hudPlate(x0-4,yb-5,w+8,10);
  ctx.fillStyle='rgba(0,0,0,.45)';roundRect(ctx,x0,yb-2,w,4,2);ctx.fill();
  const eg=ctx.createLinearGradient(x0,0,x0+w,0);eg.addColorStop(0,'#7a4ab8');eg.addColorStop(1,'#e0c8ff');ctx.fillStyle=eg;roundRect(ctx,x0,yb-2,Math.max(4,w*LAB.eth/AB_ETHER),4,2);ctx.fill();
  for(let i=0;i<2;i++){
    const b=B[i],id=P.slot[i],pr=!!LAB.press[i];
    ctx.globalAlpha=0.92;
    ctrlDisc(b.x,b.y+(pr?2:0),b.r,pr,'iron',id==='shadow'&&LAB.sh?'red':null);
    if(!id){ctx.fillStyle='rgba(243,230,207,.5)';ctx.font='700 '+Math.round(b.r*0.7)+'px '+HUDF;ctx.textAlign='center';ctx.fillText('+',b.x,b.y+b.r*0.25);continue;}
    const d=AB_BY[id],L=Math.max(0,abLv(id)-1),cost=id==='thread'&&!LAB.marks.length?15:d.cost[L],cd=LAB.cd[id]||0,ok=LAB.eth>=cost&&cd<=0;
    ctx.globalAlpha=ok?1:0.5;
    ctx.save();ctx.translate(b.x,b.y+(pr?2:0));abIcon(ctx,id,b.r*0.62);ctx.restore();
    ctx.globalAlpha=1;
    if(cd>0){const f=cd/d.cd[L];ctx.fillStyle='rgba(10,4,16,.55)';ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.arc(b.x,b.y,b.r-3,-Math.PI/2,-Math.PI/2+TAU*f);ctx.closePath();ctx.fill();
      ctx.fillStyle='#f0e0ff';ctx.font='800 '+Math.round(b.r*0.5)+'px '+HUDF;ctx.textAlign='center';ctx.fillText(Math.ceil(cd),b.x,b.y+b.r*0.18);}
    /* активная способность — светящееся кольцо */
    const act=(id==='shadow'&&LAB.sh)?LAB.sh.t/LAB.sh.dur:(id==='dome'&&LAB.dome)?LAB.dome.t/LAB.dome.max:(id==='eye'&&LAB.eyeT>0)?LAB.eyeT/LAB.eyeMax:0;
    if(act>0){ctx.strokeStyle='#e0c8ff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(b.x,b.y,b.r+2,-Math.PI/2,-Math.PI/2+TAU*act);ctx.stroke();}
    ctx.fillStyle='rgba(243,230,207,.75)';ctx.font='700 9px '+HUDF;ctx.textAlign='center';ctx.fillText(i===0?'Q':'E',b.x+b.r*0.72,b.y+b.r*0.95);
  }
  ctx.globalAlpha=1;ctx.textAlign='left';
}
/* значки способностей (рисуются в круге радиуса s) */
function abIcon(g,id,s){
  g.lineCap='round';g.lineJoin='round';
  switch(id){
    case 'shadow':{g.fillStyle='#2a1a3a';g.beginPath();g.ellipse(s*0.2,0,s*0.42,s*0.62,0,0,TAU);g.fill();g.fillStyle='#b890f0';g.beginPath();g.ellipse(-s*0.25,-s*0.05,s*0.38,s*0.58,0,0,TAU);g.fill();
      g.fillStyle='#2a1a3a';g.beginPath();g.arc(-s*0.32,-s*0.12,s*0.07,0,TAU);g.arc(-s*0.12,-s*0.12,s*0.07,0,TAU);g.fill();
      g.fillStyle='#ffd0ff';g.beginPath();g.arc(s*0.12,-s*0.12,s*0.07,0,TAU);g.arc(s*0.32,-s*0.12,s*0.07,0,TAU);g.fill();break;}
    case 'blink':{g.strokeStyle='#d8b0ff';g.lineWidth=s*0.16;g.beginPath();g.moveTo(-s*0.7,s*0.3);g.lineTo(s*0.35,s*0.3);g.stroke();g.setLineDash([s*0.12,s*0.12]);g.strokeStyle='rgba(216,176,255,.6)';g.beginPath();g.moveTo(-s*0.7,-s*0.15);g.lineTo(s*0.2,-s*0.15);g.stroke();g.setLineDash([]);
      g.fillStyle='#fff0ff';g.beginPath();g.moveTo(s*0.75,s*0.08);g.lineTo(s*0.25,-s*0.35);g.lineTo(s*0.25,s*0.5);g.closePath();g.fill();break;}
    case 'dome':{const gr=g.createRadialGradient(-s*0.25,-s*0.25,s*0.1,0,0,s*0.75);gr.addColorStop(0,'rgba(255,240,255,.95)');gr.addColorStop(0.6,'rgba(200,160,255,.55)');gr.addColorStop(1,'rgba(140,90,220,.9)');
      g.fillStyle=gr;g.beginPath();g.arc(0,0,s*0.72,0,TAU);g.fill();g.strokeStyle='#f4e8ff';g.lineWidth=s*0.08;g.stroke();g.fillStyle='rgba(255,255,255,.8)';g.beginPath();g.ellipse(-s*0.28,-s*0.32,s*0.18,s*0.09,-0.6,0,TAU);g.fill();break;}
    case 'lullaby':{g.fillStyle='#e0c8ff';g.beginPath();g.arc(-s*0.1,0,s*0.55,0,TAU);g.fill();g.fillStyle='#2a1a3a';g.beginPath();g.arc(s*0.12,-s*0.12,s*0.5,0,TAU);g.fill();
      g.fillStyle='#fff0b0';g.font='800 '+Math.round(s*0.55)+'px '+HUDF;g.textAlign='center';g.fillText('z',s*0.38,-s*0.1);g.font='800 '+Math.round(s*0.38)+'px '+HUDF;g.fillText('z',s*0.66,-s*0.42);break;}
    case 'eye':{g.fillStyle='#f4ecff';g.beginPath();g.moveTo(-s*0.8,0);g.quadraticCurveTo(0,-s*0.75,s*0.8,0);g.quadraticCurveTo(0,s*0.75,-s*0.8,0);g.fill();
      g.fillStyle='#b01a4a';g.beginPath();g.arc(0,0,s*0.34,0,TAU);g.fill();g.fillStyle='#120818';g.beginPath();g.ellipse(0,0,s*0.1,s*0.28,0,0,TAU);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(-s*0.12,-s*0.12,s*0.08,0,TAU);g.fill();break;}
    case 'thread':{g.strokeStyle='#ffb0e0';g.lineWidth=s*0.1;g.beginPath();g.moveTo(-s*0.6,s*0.55);g.bezierCurveTo(-s*0.9,-s*0.2,s*0.2,s*0.3,0,-s*0.3);g.stroke();
      g.fillStyle='#ffd0f0';g.beginPath();g.moveTo(0,-s*0.75);g.lineTo(s*0.32,-s*0.3);g.lineTo(0,s*0.1);g.lineTo(-s*0.32,-s*0.3);g.closePath();g.fill();g.fillStyle='#c060a0';g.beginPath();g.arc(0,-s*0.32,s*0.12,0,TAU);g.fill();break;}
  }
}
/* значок для окна Зала (картинка) */
const _abImg={};
function abIconURL(id){if(_abImg[id])return _abImg[id];const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');
  const gr=g.createRadialGradient(26,24,4,32,32,32);gr.addColorStop(0,'#4a3466');gr.addColorStop(1,'#1c1028');g.fillStyle=gr;g.beginPath();g.arc(32,32,30,0,TAU);g.fill();
  g.strokeStyle='#c8a050';g.lineWidth=2.5;g.stroke();g.translate(32,32);abIcon(g,id,24);return _abImg[id]=c.toDataURL();}

/* ---------- рисунок в мире ---------- */
function lilAbWorld(g){
  if(!abOn())return;
  const time=G.time;
  /* статуя: шахтёр под каменной коркой */
  if(LAB.sh){const x=player.x,y=player.y;g.save();g.globalAlpha=0.78;
    const gr=g.createLinearGradient(x-12,y-46,x+12,y);gr.addColorStop(0,'#6a6078');gr.addColorStop(1,'#2a2236');g.fillStyle=gr;
    g.beginPath();g.ellipse(x,y-38,9,9,0,0,TAU);g.fill();roundRect(g,x-11,y-30,22,30,5);g.fill();
    g.globalAlpha=1;g.strokeStyle='rgba(200,180,230,.5)';g.lineWidth=0.8;g.beginPath();g.moveTo(x-4,y-44);g.lineTo(x-1,y-36);g.lineTo(x-5,y-24);g.moveTo(x+6,y-20);g.lineTo(x+2,y-10);g.stroke();
    g.fillStyle='rgba(180,140,255,.6)';g.beginPath();g.arc(x-3,y-39,1.2,0,TAU);g.arc(x+3,y-39,1.2,0,TAU);g.fill();g.restore();
    /* тень-клон: силуэт шахтёра из дыма */
    const s=LAB.sh,f=s.f||player.facing;
    for(let i=0;i<s.trail.length;i++){const [tx,ty]=s.trail[i];g.fillStyle='rgba(60,30,90,'+(0.05+i*0.03)+')';g.beginPath();g.ellipse(tx,ty,9,14,0,0,TAU);g.fill();}
    g.save();g.translate(s.x,s.y);g.scale(f,1);
    softGlow(g,0,0,30,'#7a4ab8',0.5);
    g.fillStyle='#1a1028';g.beginPath();g.ellipse(0,-12,7,7,0,0,TAU);g.fill();
    g.beginPath();g.moveTo(-8,-6);g.quadraticCurveTo(-11,6,-6,16+Math.sin(time*8)*2);g.lineTo(-2,10);g.lineTo(2,18+Math.sin(time*7)*2);g.lineTo(5,10);g.quadraticCurveTo(10,4,8,-6);g.closePath();g.fill();
    g.fillStyle='#2a1a3a';g.beginPath();g.ellipse(0,-17,9,4,0,Math.PI,TAU);g.fill();
    g.fillStyle='#e0b0ff';g.beginPath();g.ellipse(2,-12,1.6,1,0,0,TAU);g.ellipse(6,-12,1.4,1,0,0,TAU);g.fill();
    if(s.claw>0){g.strokeStyle='rgba(200,150,255,'+(s.claw/0.2)+')';g.lineWidth=2;for(let k=0;k<3;k++){g.beginPath();g.arc(10,0,18+k*4,-1.1,0.9);g.stroke();}}
    g.restore();
    const tl=Math.max(0,s.t);g.fillStyle='rgba(30,14,40,.7)';roundRect(g,s.x-16,s.y-34,32,6,3);g.fill();g.fillStyle='#c8a0ff';roundRect(g,s.x-15,s.y-33,30*tl/s.dur,4,2);g.fill();}
  /* отмеченная руда */
  if(LAB.ore&&LAB.ore.size){g.save();g.globalCompositeOperation='lighter';for(const k of LAB.ore.keys()){const [tx,ty]=k.split(',').map(Number);if(getTile(tx,ty)===T_AIR)continue;
    const o=getOre(tx,ty);if(!o)continue;const cx=tx*TILE+16,cy=ty*TILE+16,p=0.6+0.4*Math.sin(time*4+tx+ty);softGlow(g,cx,cy,14*p,ORES[o].glow||'#ffffff',0.45);
    g.fillStyle=hexA(ORES[o].glow||'#ffffff',0.7*p);g.beginPath();g.moveTo(cx,cy-5);g.lineTo(cx+4,cy);g.lineTo(cx,cy+5);g.lineTo(cx-4,cy);g.closePath();g.fill();}g.restore();}
  /* купол */
  const D=LAB.dome;
  if(D){const cx=player.x,cy=player.y-player.h*0.5,R=62,k=Math.min(1,(D.max-D.t)/0.2,D.t/0.25),hp=D.hp/D.hp0;
    g.save();const gr=g.createRadialGradient(cx-R*0.3,cy-R*0.35,R*0.1,cx,cy,R);gr.addColorStop(0,'rgba(255,240,255,'+(0.12*k)+')');gr.addColorStop(0.75,'rgba(190,140,255,'+(0.16*k)+')');gr.addColorStop(1,'rgba(150,90,230,'+(0.45*k)+')');
    g.fillStyle=gr;g.beginPath();g.arc(cx,cy,R*k,0,TAU);g.fill();
    g.strokeStyle='rgba(230,210,255,'+(0.5+0.4*(D.hit>0?1:0))*k+')';g.lineWidth=2+(D.hit>0?2:0);g.stroke();
    g.strokeStyle='rgba(255,255,255,'+(0.5*k)+')';g.lineWidth=1.4;g.beginPath();g.arc(cx,cy,R*k*0.86,Math.PI*1.1,Math.PI*1.45);g.stroke();
    if(hp<0.5){g.strokeStyle='rgba(255,255,255,.4)';g.lineWidth=0.8;g.beginPath();g.moveTo(cx+R*0.3,cy-R*0.8);g.lineTo(cx+R*0.1,cy-R*0.4);g.lineTo(cx+R*0.35,cy-R*0.2);g.stroke();}
    if(abMut('dome')==='b'&&Math.random()<0.3)spawnPart(cx+rnd(-R*0.6,R*0.6),cy+R*0.5,0,-40,0.8,'#a8ffc0',2,-20);
    g.restore();}
  /* разломы */
  for(const r of LAB.rifts){const a=Math.min(1,r.t/0.4);g.save();g.globalCompositeOperation='lighter';g.strokeStyle='rgba(200,140,255,'+(0.6*a)+')';g.lineWidth=6;g.beginPath();g.moveTo(r.x0,r.y0);
    for(let k=1;k<=8;k++){const f=k/8;g.lineTo(r.x0+(r.x1-r.x0)*f+Math.sin(time*30+k)*3,r.y0+(r.y1-r.y0)*f+Math.cos(time*27+k)*3);}g.stroke();g.strokeStyle='rgba(255,240,255,'+a+')';g.lineWidth=1.6;g.stroke();g.restore();}
  /* метки нити */
  for(const k of LAB.marks){const p=0.5+0.5*Math.sin(time*3);g.save();g.translate(k.x,k.y-6);
    softGlow(g,0,-14,20+p*6,'#ff9ad8',0.5);g.fillStyle='#ffd0f0';g.beginPath();g.moveTo(0,-30);g.lineTo(7,-18);g.lineTo(0,-6);g.lineTo(-7,-18);g.closePath();g.fill();
    g.fillStyle='#c060a0';g.beginPath();g.arc(0,-18,2.6,0,TAU);g.fill();g.strokeStyle='rgba(255,176,224,.6)';g.lineWidth=1.2;g.beginPath();g.moveTo(0,-6);g.quadraticCurveTo(4,0,0,6);g.stroke();g.restore();}
  if(LAB.pull){const p=LAB.pull,a=p.t/0.35;g.strokeStyle='rgba(255,176,224,'+a+')';g.lineWidth=2;g.beginPath();g.moveTo(p.x0,p.y0-24);g.quadraticCurveTo((p.x0+p.x1)/2,Math.min(p.y0,p.y1)-80,p.x1,p.y1-24);g.stroke();}
  /* волна колыбельной и спящие */
  if(LAB.ring){const r=LAB.ring;g.strokeStyle='rgba(220,200,255,'+(1-r.t/0.9)+')';g.lineWidth=3;g.beginPath();g.arc(player.x,player.y-player.h*0.5,r.r,0,TAU);g.stroke();}
  for(const m of mobs){if(m.sleepT>0&&m.alive){g.fillStyle='rgba(230,215,255,.9)';g.font='800 12px '+HUDF;g.textAlign='center';
    for(let k=0;k<3;k++){const ph=((time*0.8+k*0.33)%1);g.globalAlpha=1-ph;g.fillText('z',m.x+8+ph*10+k*2,m.y-m.h-6-ph*22);}g.globalAlpha=1;}}
  /* миг вне мира */
  if(LAB.phase>0){g.save();g.globalAlpha=Math.min(1,LAB.phase)*0.5;g.strokeStyle='#e0c8ff';g.lineWidth=2;g.setLineDash([4,4]);g.beginPath();g.ellipse(player.x,player.y-22,16,26,0,0,TAU);g.stroke();g.restore();}
}
/* экран: лёгкая лиловая рамка, пока открыто Око */
function lilAbScreen(W,H){
  if(!abOn()||LAB.eyeT<=0)return;
  const g=ctx;g.save();g.setTransform(dpr,0,0,dpr,0,0);const a=Math.min(1,LAB.eyeT/0.6,(LAB.eyeMax-LAB.eyeT)/0.4+0.2);
  const vg=g.createRadialGradient(W/2,H/2,Math.min(W,H)*0.35,W/2,H/2,Math.max(W,H)*0.7);vg.addColorStop(0,'rgba(180,40,90,0)');vg.addColorStop(1,'rgba(180,40,90,'+(0.3*a)+')');
  g.fillStyle=vg;g.fillRect(0,0,W,H);g.restore();
}

/* ---------- Зал Отражений: окно ---------- */
UI.lhall=function(){
  const P=abP(),hasEss=(id,n)=>matN(id)>=n;
  const essName=(id)=>{const e=LIL_ESS.find(q=>q[0]===id);return e?e[1]:id;};
  const slotHtml=[0,1].map(i=>{const id=P.slot[i];return `<div class="abSlot"><div class="abKey">${i?'E':'Q'}</div>${id?`<img src="${abIconURL(id)}"><b>${AB_BY[id].name}</b>`:'<span class="tiny">пусто</span>'}</div>`;}).join('');
  const cards=AB_DEFS.map(d=>{const L=abLv(d.id),pr=abPrice(d.id),M=abMut(d.id);
    const pips=[1,2,3,4,5].map(k=>`<span class="abPip ${k<=L?'on':''}"></span>`).join('');
    let act='';
    if(pr){const can=player.money>=pr.money&&hasEss(pr.ess,pr.essN)&&(player.souls||0)>=pr.souls;
      act=`<div class="tiny" style="margin:4px 0">${L?'Улучшить':'Открыть'}: <b>${fmt(pr.money)} 💰</b> · ${pr.essN}× ${essName(pr.ess)} (${matN(pr.ess)}) · ${pr.souls} 👻</div>
        <button class="btn small" data-up="${d.id}" ${can?'':'disabled'}>${L?'Улучшить до '+(L+1):'Открыть'}</button>`;}
    else if(!M){act=`<div class="tiny" style="margin:4px 0">Выбери мутацию:</div>`+d.mut.map((q,i)=>`<button class="btn small alt" data-mut="${d.id}:${i?'b':'a'}" title="${q[1]}">${q[0]}</button><div class="tiny">${q[1]}</div>`).join('');}
    else{const q=d.mut[M==='a'?0:1];act=`<div class="tiny" style="margin:4px 0">Мутация: <b>${q[0]}</b> — ${q[1]}</div>`;}
    const eq=L?`<div class="row" style="gap:6px;margin-top:6px"><button class="btn small ${P.slot[0]===d.id?'cheatOn':''}" data-eq="${d.id}:0">В ячейку Q</button><button class="btn small ${P.slot[1]===d.id?'cheatOn':''}" data-eq="${d.id}:1">В ячейку E</button></div>`:'';
    return `<div class="abCard ${L?'':'locked'}"><div class="row" style="gap:10px;align-items:center"><img src="${abIconURL(d.id)}" class="abIco"><div style="flex:1;min-width:0"><b>${d.name}</b><div class="abPips">${pips}</div></div></div>
      <p class="tiny" style="margin:6px 0 2px">${d.txt}</p>
      <p class="tiny" style="margin:2px 0;color:#d8c0ff">${L?'Сейчас: '+d.lvTxt[L-1]+' · '+d.cost[L-1]+' Эфира':'Уровень 1: '+d.lvTxt[0]}${L&&L<5?'<br>Дальше: '+d.lvTxt[L]:''}</p>${act}${eq}</div>`;}).join('');
  const d=this.build('lhall',`
    <div class="card lilac" style="max-width:560px;width:96vw">
      <h3>🪞 Зал Отражений</h3>
      <p class="tiny">Зеркала учат тебя тому, что умеют твои отражения. Способности работают в шахте Лиловых небес и тратят Эфир — он копится сам.</p>
      <div class="abSlots">${slotHtml}</div>
      <div class="abGrid scroll">${cards}</div>
    </div>
    <button class="btn alt" id="lhBack">Выйти</button>`);
  d.querySelectorAll('[data-up]').forEach(b=>b.onclick=()=>{const id=b.getAttribute('data-up'),pr=abPrice(id);if(!pr)return;
    if(player.money<pr.money||matN(pr.ess)<pr.essN||(player.souls||0)<pr.souls){UI.toast('Не хватает');return;}
    player.money-=pr.money;player.mats[pr.ess]-=pr.essN;if(player.mats[pr.ess]<=0)delete player.mats[pr.ess];player.souls-=pr.souls;
    const P=abP();P.lv[id]=(P.lv[id]|0)+1;if(P.lv[id]===1){if(!P.slot[0])P.slot[0]=id;else if(!P.slot[1])P.slot[1]=id;}
    SFX.buy();AU.bell(1047,1,0.08,0,{ratio:2.01,index:0.8,rev:0.6});UI.toast(AB_BY[id].name+': уровень '+P.lv[id]);saveGame();UI.lhall();});
  d.querySelectorAll('[data-mut]').forEach(b=>b.onclick=()=>{const [id,m]=b.getAttribute('data-mut').split(':');abP().mut[id]=m;SFX.buy();UI.toast('Мутация выбрана: '+AB_BY[id].mut[m==='a'?0:1][0]);saveGame();UI.lhall();});
  d.querySelectorAll('[data-eq]').forEach(b=>b.onclick=()=>{const [id,i]=b.getAttribute('data-eq').split(':');const P=abP(),k=+i;if(P.slot[1-k]===id)P.slot[1-k]=P.slot[k];P.slot[k]=id;SFX.ui();saveGame();UI.lhall();});
  d.querySelector('#lhBack').onclick=()=>{SFX.uiBack();UI.close();};
};

/* ---------- здание в деревне ---------- */
function drawLilacHall(g,b,glowList,t,N){
  const mx=(a,c)=>llbMix(a,c,N);
  /* ступени и колонны, купол из стекла, большое зеркало в раме */
  g.fillStyle=mx('#b8a8d0','#3a3048');g.fillRect(-104,-14,208,14);g.fillStyle=mx('#d8c8f0','#4a3a5a');g.fillRect(-96,-24,192,10);
  const wall=g.createLinearGradient(0,-170,0,-24);wall.addColorStop(0,mx('#e8dcf8','#3a2e4a'));wall.addColorStop(1,mx('#b8a4d8','#2a2036'));g.fillStyle=wall;g.fillRect(-90,-160,180,136);
  for(const x of [-82,-54,54,82]){const cg=g.createLinearGradient(x-8,0,x+8,0);cg.addColorStop(0,mx('#fff8ff','#5a4a6a'));cg.addColorStop(0.5,mx('#e0d4f0','#4a3a5a'));cg.addColorStop(1,mx('#a898c0','#2a2036'));
    g.fillStyle=cg;g.fillRect(x-7,-158,14,134);g.fillStyle=mx('#fff','#6a5a7a');g.fillRect(x-10,-162,20,6);g.fillRect(x-10,-30,20,6);}
  /* купол */
  const dg=g.createRadialGradient(-20,-200,8,0,-170,96);dg.addColorStop(0,mx('rgba(255,255,255,.95)','rgba(120,100,160,.6)'));dg.addColorStop(1,mx('rgba(180,150,240,.85)','rgba(40,30,70,.8)'));
  g.fillStyle=dg;g.beginPath();g.ellipse(0,-160,96,52,0,Math.PI,TAU);g.fill();g.strokeStyle=mx('#fff8ff','#6a5a8a');g.lineWidth=2;g.stroke();
  g.strokeStyle=mx('rgba(255,255,255,.6)','rgba(150,120,200,.4)');g.lineWidth=1;for(let k=-3;k<=3;k++){g.beginPath();g.moveTo(k*28,-160);g.quadraticCurveTo(k*14,-200,0,-212);g.stroke();}
  g.fillStyle=mx('#e0b050','#8a6a30');g.beginPath();g.moveTo(-4,-212);g.lineTo(0,-232);g.lineTo(4,-212);g.closePath();g.fill();g.beginPath();g.arc(0,-234,4,0,TAU);g.fill();
  /* зеркало */
  g.fillStyle=mx('#c8a050','#6a5028');g.beginPath();g.ellipse(0,-92,36,58,0,0,TAU);g.fill();
  g.fillStyle=mx('#f0d080','#8a6a38');g.beginPath();g.ellipse(-2,-94,33,55,0,0,TAU);g.fill();
  const mg=g.createLinearGradient(-30,-150,30,-36);mg.addColorStop(0,mx('#f4fbff','#7a90b0'));mg.addColorStop(0.5,mx('#a8c4e8','#2a3a5a'));mg.addColorStop(1,mx('#6a7ab8','#141a30'));
  g.fillStyle=mg;g.beginPath();g.ellipse(0,-92,29,51,0,0,TAU);g.fill();
  /* отражение шахтёра в зеркале: ночью оно улыбается */
  const rx=clamp((lobbyPlayer.x-b.x)*-0.06,-10,10);
  g.save();g.beginPath();g.ellipse(0,-92,29,51,0,0,TAU);g.clip();
  g.fillStyle=mx('rgba(60,60,100,.55)','rgba(20,10,30,.8)');g.beginPath();g.ellipse(rx,-82,7,7,0,0,TAU);g.fill();g.fillRect(rx-8,-74,16,24);g.fillRect(rx-7,-50,5,12);g.fillRect(rx+2,-50,5,12);
  g.fillStyle=mx('rgba(255,210,90,.6)','rgba(255,210,90,.4)');g.fillRect(rx-8,-92,16,4);
  if(N>0.5){g.fillStyle='#fff';g.beginPath();g.arc(rx,-80,4,0.2,Math.PI-0.2);g.fill();g.fillStyle='#ff2a4a';g.fillRect(rx-4,-85,2,2);g.fillRect(rx+2,-85,2,2);}
  g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.moveTo(-26,-110);g.lineTo(-14,-140);g.lineTo(-6,-140);g.lineTo(-20,-100);g.closePath();g.fill();g.restore();
  g.fillStyle=mx('#e0b050','#8a6a30');g.beginPath();g.arc(0,-152,6,0,TAU);g.fill();
  /* свечи в нишах */
  for(const x of [-68,68]){g.fillStyle=mx('#f4ead6','#8a8070');g.fillRect(x-2,-60,4,12);const f=1+Math.sin(t*9+x)*0.15;g.fillStyle='rgba(255,190,80,.95)';g.beginPath();g.ellipse(x,-64,2,4*f,0,0,TAU);g.fill();glowList.push([b.x+x,-64,26,'#ffb860']);}
  glowList.push([b.x,-92,70,N>0.5?'#ff6a9a':'#c8a0ff']);
}
