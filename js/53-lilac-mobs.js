'use strict';
/* ============================================================
   ЛИЛОВЫЕ НЕБЕСА — мобы (G.dim===2): данные, поведение, предупреждения атак.
   У каждого моба два облика: Иллюзия (милый) и Истина (страшный). Облик выбирается
   по доле Истины veilT: в Истине моб бьёт сильнее (×1.2). Около порога облик
   «дрожит» — пелена прорывается. Концепты — concepts/lil-mobs-*.jpg, модели — 54.
   Поведение — LM_AI[id], у атак есть замах с красным предупреждением (lilMobFx).
   ============================================================ */
/* сила по биому: здоровье и урон растут от Лугов к Колыбели */
const LM_HP=[9000,12000,15500,20000,26000,33000,42000],LM_DMG=[280,360,450,560,670,720,860];   /* урон растёт вместе с латами Зари (этап 9): на своём снаряжении каждый биом чуть опаснее прошлого */
const LM_ORE=[[37,38,39,40],[41,42,43,44],[45,46,47],[48,49,50,51],[52,53,54],[55,56,57],[58,59,60,61]];
const LM_B0=[4,250,550,850,1150,1450,1750],LM_B1=[260,560,860,1160,1460,1760,99999];
/* b — биом, k — доля здоровья, kd — доля урона */
function lmDef(b,o){
  const ore=LM_ORE[b];
  return Object.assign({dim:2,lm:true,shape:'l_'+o.id,mech:'l_'+o.id,d0:LM_B0[b]+(o.dd||0),d1:LM_B1[b],
    hp:Math.round(LM_HP[b]*(o.k||1)),dmg:Math.round(LM_DMG[b]*(o.kd||1)),xp:Math.round(80+b*30*(o.k||1)),souls:6+b,
    drops:[{ore:ore[0],ch:0.45},{ore:ore[1],ch:0.25},{ore:ore[ore.length-1],ch:0.06}]},o);
}
const LIL_MOBS=[
  /* ---- Цветущие луга ---- */
  lmDef(0,{id:'lbunny',name:'Пушистик',spd:92,aggro:340,w:30,h:28,fly:false,group:2,k:0.8,c1:'#e8d8f6',c2:'#b48ad8'}),
  lmDef(0,{id:'lbutterfly',name:'Мотылёк-принцесса',spd:86,aggro:380,w:40,h:34,fly:true,k:0.7,c1:'#ffc8e8',c2:'#9ad8ff'}),
  lmDef(0,{id:'ldaisy',name:'Ромашка-глазунья',spd:38,aggro:360,w:30,h:44,fly:false,k:1.1,c1:'#fff6ea',c2:'#ffd040',dd:30}),
  /* ---- Хрустальный сад ---- */
  lmDef(1,{id:'lglassbird',name:'Стеклянный певчий',spd:110,aggro:400,w:36,h:28,fly:true,k:0.7,c1:'#c8ecff',c2:'#9a9aff'}),
  lmDef(1,{id:'lstatue',name:'Хрустальная садовница',spd:34,aggro:320,w:32,h:50,fly:false,k:1.6,kd:1.2,armorFront:0.45,c1:'#d8eeff',c2:'#8aa8d8'}),
  lmDef(1,{id:'lchime',name:'Звонница',spd:44,aggro:400,w:30,h:46,fly:true,k:0.9,c1:'#e8dcff',c2:'#b8a0f0',dd:40}),
  /* ---- Медовые соты ---- */
  lmDef(2,{id:'lbee',name:'Пчела-нянька',spd:104,aggro:380,w:30,h:28,fly:true,group:3,k:0.55,kd:0.8,c1:'#ffd040',c2:'#3a2a10',fx:{poison:3}}),
  lmDef(2,{id:'lslime',name:'Медовый слизень',spd:46,aggro:300,w:38,h:30,fly:false,k:1.0,c1:'#ffb030',c2:'#a85a08',split:true}),
  lmDef(2,{id:'lwaxknight',name:'Восковой страж',spd:48,aggro:330,w:30,h:48,fly:false,k:1.5,kd:1.15,armorFront:0.6,c1:'#f4e2b0',c2:'#c8962a',dd:40}),
  /* ---- Кукольный городок ---- */
  lmDef(3,{id:'ldoll',name:'Фарфоровая кукла',spd:70,aggro:420,w:26,h:42,fly:false,k:0.9,c1:'#f8e8f0',c2:'#e88ab8'}),
  lmDef(3,{id:'lsoldier',name:'Заводной солдатик',spd:46,aggro:460,w:26,h:46,fly:false,k:1.0,kd:0.7,c1:'#3a4a8a',c2:'#e0b050'}),
  lmDef(3,{id:'ljack',name:'Чёрт из табакерки',spd:40,aggro:340,w:34,h:34,fly:false,k:1.3,kd:1.2,c1:'#8a4ab8',c2:'#ffd040',dd:40}),
  /* ---- Розарий ---- */
  lmDef(4,{id:'lrosehound',name:'Розовая гончая',spd:118,aggro:380,w:42,h:30,fly:false,group:2,k:0.8,c1:'#3e7a46',c2:'#c8304e',fx:{bleed:3}}),
  lmDef(4,{id:'lgardener',name:'Безликий садовник',spd:52,aggro:380,w:26,h:46,fly:false,k:1.2,c1:'#5a7a3a',c2:'#d8b060'}),
  lmDef(4,{id:'lfairy',name:'Лепестковая дева',spd:82,aggro:420,w:30,h:42,fly:true,ghost:true,k:0.8,c1:'#ff8ab0',c2:'#ffe0ec',dd:40}),
  /* ---- Зеркальные топи ---- */
  lmDef(5,{id:'lmirror',name:'Отражение',spd:96,aggro:420,w:22,h:44,fly:false,k:0.9,c1:'#c8dce8',c2:'#6a8aa8'}),
  lmDef(5,{id:'lswan',name:'Лебедь-обманщик',spd:80,aggro:400,w:44,h:40,fly:true,k:1.1,c1:'#f4f8fa',c2:'#3a3a40'}),
  lmDef(5,{id:'lfrog',name:'Лягушачий принц',spd:64,aggro:380,w:36,h:30,fly:false,k:1.2,c1:'#8ac8a8',c2:'#e0b050',dd:30}),
  /* ---- Колыбель ---- */
  lmDef(6,{id:'lsheep',name:'Счётная овечка',spd:70,aggro:360,w:36,h:30,fly:false,group:3,k:0.6,kd:0.6,c1:'#f4eefa',c2:'#c8b0d8'}),
  lmDef(6,{id:'lsandman',name:'Дрёма',spd:70,aggro:440,w:30,h:46,fly:true,k:0.9,c1:'#9a8ad8',c2:'#e8d8a0'}),
  lmDef(6,{id:'lnightmare',name:'Кошмар',spd:96,aggro:460,w:52,h:44,fly:true,ghost:true,truthOnly:true,k:1.0,kd:1.3,c1:'#1a1028',c2:'#ffc040',dd:30})
];
for(const d of LIL_MOBS)MOBDEFS.push(d);
/* размер окна обводки (доля от max(w,h)): замерено по самой широкой позе модели в обоих обликах.
   Обводка стоит пропорционально площади окна, у общей формулы запас был лишним */
const LM_OR={lbunny:1.32,lbutterfly:1.1,ldaisy:1.1,lglassbird:1.12,lstatue:1.05,lchime:1.1,lbee:1.32,lslime:1.1,lwaxknight:1.05,ldoll:1.15,lsoldier:1.1,ljack:1.3,
  lrosehound:1.0,lgardener:1.1,lfairy:1.15,lmirror:1.1,lswan:1.05,lfrog:1.16,lsheep:1.16,lsandman:1.1,lnightmare:0.95,lmimic:1.1};
/* описания для бестиария */
Object.assign(MOB_LORE,{
  lbunny:'Прыгает к тебе, перед броском приседает. В Истине — без шкуры, с длинными руками.',
  lbutterfly:'Кружит над головой и сыплет пыльцу: она замедляет и туманит рассудок.',
  ldaisy:'Пускает корни: под ногами вспыхивает зелёная метка — отойди, пока не выросли шипы.',
  lglassbird:'Пикирует сверху, а перед песней раздувается — от звона расходится кольцо.',
  lstatue:'Медленная, щит спереди. Раскрыла ножницы — отходи; после щелчка открыта для ударов.',
  lchime:'Висит под потолком. Звенит — и над тобой появляются осколки. Беги из красных меток.',
  lbee:'Летают втроём. Красная черта — это направление рывка с жалом.',
  lslime:'Плюётся липким мёдом, после смерти делится на двух малышей.',
  lwaxknight:'Щит держит удары спереди. Отводит копьё — сейчас будет выпад. Подтаяв, злеет.',
  ldoll:'Двигается, только когда ты отвернулся. Смотри на неё — и она замрёт.',
  lsoldier:'Стреляет залпом из трёх пуль, потом заводит ключ — в это время беззащитен.',
  ljack:'В коробке почти неуязвим. Играет мелодия — сейчас выстрелит шеей. Бей, пока она снаружи.',
  lrosehound:'Бегают парами, прыгают с укусом, от которого течёт кровь.',
  lgardener:'Режет ножницами вблизи и бросает семена шипов, которые прорастают под ногами.',
  lfairy:'Летает сквозь стены и выпускает кольца лепестков.',
  lmirror:'Повторяет за тобой: прыгнул — прыгнет, ударил — ударит в ответ.',
  lswan:'Отводит шею назад — и бьёт ею на три шага вперёд. Взмахом крыла отталкивает.',
  lfrog:'Раздувает щёки — сейчас язык. Попадёт — подтянет к себе и укусит.',
  lsheep:'Прыгают через тебя и считают. Кто досчитает до конца — того клонит в сон.',
  lsandman:'Бросает сонный песок и исчезает, если подойти близко.',
  lnightmare:'Его видно только в Истине. Пока рассудок цел, он лишь тень рядом с тобой.'
});
Object.assign(MOB_MAT,{l_lbunny:'flesh',l_lbutterfly:'flesh',l_ldaisy:'flesh',l_lglassbird:'crystal',l_lstatue:'crystal',l_lchime:'crystal',l_lbee:'flesh',l_lslime:'slime',
  l_lwaxknight:'stone',l_ldoll:'crystal',l_lsoldier:'metal',l_ljack:'metal',l_lrosehound:'flesh',l_lgardener:'flesh',l_lfairy:'ghost',l_lmirror:'crystal',l_lswan:'flesh',
  l_lfrog:'slime',l_lsheep:'flesh',l_lsandman:'ghost',l_lnightmare:'ghost'});
Object.assign(DEATH_STYLE,{lbunny:'legsup',lbutterfly:'tumble',ldaisy:'fall',lglassbird:'shatter',lstatue:'shatter',lchime:'shatter',lbee:'tumble',lslime:'splat',
  lwaxknight:'melt',ldoll:'shatter',lsoldier:'fall',ljack:'crumble',lrosehound:'legsup',lgardener:'fall',lfairy:'dissolve',lmirror:'shatter',lswan:'tumble',
  lfrog:'legsup',lsheep:'legsup',lsandman:'dissolve',lnightmare:'implode'});
/* иногда из мобов выпадает эссенция их биома */
for(const d of LIL_MOBS){const b=LM_B0.indexOf(d.d0-(d.dd||0));MOB_PARTS[d.id]=[[LIL_ESS[Math.max(0,b)][0],0.035,1]];}

/* ---------- облик и общие помощники ---------- */
/* облик: true — Истина. Около порога пелена дрожит и облик мелькает */
function lmForm(m){
  const v=veilT;
  if(v>0.62)m.tf=true;else if(v<0.38)m.tf=false;
  else if(G.time>(m.tfT||0)){m.tfT=G.time+rnd(0.06,0.3);m.tf=Math.random()<(v-0.38)/0.24;}
  return m.tf;
}
function lmTm(m){return m.tf?1.2*lfuTruthMul():1;}
const LMR=[0,0,false];
function lmMelee(m,k,fx,kbx,kby,san){mobMelee(m,m.def.dmg*k*lmTm(m)*(m.sc||1),fx,kbx,kby);if(san&&!cheats.god)lsSan(-san*(m.tf?1.5:1));}
function lmShoot(m,ang,spd,k,col,size,kind,o){
  o=o||{};mobShoot(m,ang,spd,m.def.dmg*k*lmTm(m),col,size,{grav:o.grav,life:o.life,fx:o.fx,ghost:o.ghost,kind});
  const p=projectiles[projectiles.length-1];p.src=m.def.name;p.hr=o.hr||14;
  if(o.san||o.sleep)p.onEnd=()=>{if(o.san)lsSan(-o.san*(m.tf?1.5:1));if(o.sleep)G.lilSleep=Math.min(1,(G.lilSleep||0)+o.sleep);};
  return p;
}
function lmWander(m,k,fly){if(m.timer<=0){m.timer=rnd(1,2.6);m.hx=Math.random()<0.3?0:rnd(-1,1);m.hy=rnd(-0.6,0.6);}LMR[0]=(m.hx||0)*k;if(fly)LMR[1]=(m.hy||0)*k;if(Math.abs(LMR[0])>0.05)m.facing=LMR[0]>0?1:-1;}
function lmFaceX(m,dx){if(Math.abs(dx)>14)m.facing=dx>0?1:-1;}
/* попал ли шахтёр на отрезок (x0,y0)-(x1,y1) с запасом r */
function lmSeg(x0,y0,x1,y1,r){
  const px=player.x,py=player.y-player.h*0.5,vx=x1-x0,vy=y1-y0,l=vx*vx+vy*vy||1,t=clamp(((px-x0)*vx+(py-y0)*vy)/l,0,1);
  return Math.hypot(px-(x0+vx*t),py-(y0+vy*t))<r;
}
/* замах: копим tele и прицел; true — замах закончен */
function lmWind(m,dur,aimX,aimY){m.tele=Math.min(1,m.st/dur);if(aimX!==undefined){m.ax=aimX;m.ay=aimY;}return m.st>=dur;}
function lmGo(m,s){m.state=s;m.st=0;}

/* ---------- опасности мобов (кольца звона, падающие осколки) ---------- */
const LMH=[];
function lmRing(x,y,r,warn,dmg,col,san){LMH.push({k:'ring',x,y,r,warn,t:0,dmg,col:col||'#ff4a5a',san});}
function lmShard(x,warn,dmg,y0){
  const tx=Math.floor(x/TILE);let ty=Math.floor((y0!==undefined?y0:player.y-40)/TILE);
  let top=ty;for(let k=0;k<7&&!isSolid(tx,top-1);k++)top--;
  const fy=floorBelowY(x,player.y-10);if(fy===null)return;
  LMH.push({k:'shard',x,y:top*TILE+4,fy,warn,t:0,dmg});
}
function lilMobHzTick(dt){
  if(G.dim!==2||G.scene!=='mine'){LMH.length=0;return;}
  for(let i=LMH.length-1;i>=0;i--){const h=LMH[i];h.t+=dt;
    if(h.k==='ring'){
      if(h.t>=h.warn&&!h.hit){h.hit=1;const d=Math.hypot(player.x-h.x,player.y-player.h*0.5-h.y);
        if(d<h.r&&!cheats.god){hurtPlayer(h.dmg,'звон');if(h.san)lsSan(-h.san);}
        for(let k=0;k<18;k++){const a=k/18*TAU;spawnPart(h.x+Math.cos(a)*h.r*0.9,h.y+Math.sin(a)*h.r*0.9,Math.cos(a)*60,Math.sin(a)*60,0.4,'#e8f4ff',2,0);}}
      if(h.t>h.warn+0.35)LMH.splice(i,1);
    }else if(h.k==='shard'){
      if(h.t<h.warn)continue;
      h.vy=(h.vy||0)+1500*dt;h.y+=h.vy*dt;
      if(!h.hit&&Math.abs(player.x-h.x)<15&&h.y>player.y-player.h&&h.y-10<player.y){h.hit=1;if(!cheats.god)hurtPlayer(h.dmg,'осколок');}
      if(h.y>=h.fy){for(let k=0;k<7;k++)spawnPart(h.x,h.fy-4,rnd(-90,90),rnd(-150,-40),0.5,k%2?'#e8f4ff':'#b8a0f0',2.2,900);SFX.hit();LMH.splice(i,1);}
    }
  }
}

/* ---------- поведение ---------- */
const LM_AI={
  lbunny(m,d,dt,dx,dy,dist,nx,ny,ag){
    if(m.state==='crouch'){LMR[0]=0;if(lmWind(m,0.45)){lmGo(m,'leap');m.vy=-380;m.hitDone=false;SFX.jump();}return;}
    if(m.state==='leap'){LMR[0]=m.facing*3.6;
      if(!m.hitDone&&dist<(m.w+player.w)/2+10){m.hitDone=true;lmMelee(m,1,m.tf?{bleed:2}:null,240,-200);}
      if(m.onGround&&m.st>0.15){lmGo(m,'idle');m.cd=rnd(1.6,2.4);}return;}
    if(ag){lmFaceX(m,dx);
      if(m.onGround&&m.timer<=0){m.vy=-300;m.timer=rnd(0.45,0.8);}
      LMR[0]=m.onGround?0:nx*1.2;
      if(dist<150&&dist>50&&m.cd<=0&&m.onGround&&Math.abs(dy)<60){lmGo(m,'crouch');}
      else if(dist<40&&m.atkCd<=0){m.atkCd=1;m.atkT=0.24;lmMelee(m,0.7,null,160,-120);}
    }else{if(m.onGround&&m.timer<=0&&Math.random()<0.4){m.vy=-240;}lmWander(m,0.5);}
  },
  lbutterfly(m,d,dt,dx,dy,dist,nx,ny,ag,seen){
    const px=player.x,py=player.y-player.h*0.5;
    if(m.state==='windup'){LMR[0]=0;LMR[1]=-0.2;if(lmWind(m,0.5,px,py)){lmGo(m,'idle');m.shootCd=rnd(2.6,3.4);
      const a=Math.atan2(py-(m.y-m.h*0.5),px-m.x);for(let k=-1;k<=1;k++)lmShoot(m,a+k*0.22,150,0.55,m.tf?'#a8a0a0':'#ffe0f0',6,'lpollen',{fx:{slow:1.6},san:5,life:2.6});SFX.whisper(0.2);}return;}
    if(m.state==='dive'){LMR[0]=m.dvx;LMR[1]=m.dvy;m.dashT=1;if(!m.hitDone&&dist<26){m.hitDone=true;lmMelee(m,0.8,null,160,-120,3);}if(m.st>0.5){lmGo(m,'idle');}return;}
    if(m.state==='swoopw'){LMR[0]=0;LMR[1]=-0.4;if(lmWind(m,0.45,px,py)){lmGo(m,'dive');m.hitDone=false;const l=dist||1;m.dvx=dx/l*2.6;m.dvy=dy/l*2.6;m.cd=rnd(3,4.5);}return;}
    if(ag){lmFaceX(m,dx);const tx=px+Math.sin(m.anim*1.1+m.phase)*130,ty=py-120+Math.sin(m.anim*2.3)*20;
      LMR[0]=clamp((tx-m.x)/70,-1,1);LMR[1]=clamp((ty-(m.y-m.h*0.5))/60,-1,1);
      if(m.shootCd<=0&&seen&&dist<360)lmGo(m,'windup');else if(m.cd<=0&&seen&&dist<260)lmGo(m,'swoopw');}
    else lmWander(m,0.5,true);
  },
  ldaisy(m,d,dt,dx,dy,dist,nx,ny,ag,seen){
    if(m.state==='root'){LMR[0]=0;if(lmWind(m,0.8)){lmGo(m,'idle');m.cd=rnd(3,3.8);
      hzSpike(player.x,player.y-4,54,0.75,d.dmg*0.9*lmTm(m)*(m.sc||1),m.tf?'#7a2a2a':'#5aa83a',{slow:1});
      if(m.tf){hzSpike(player.x-60,player.y-4,44,0.95,d.dmg*0.7*lmTm(m),'#7a2a2a',null);hzSpike(player.x+60,player.y-4,44,0.95,d.dmg*0.7*lmTm(m),'#7a2a2a',null);}SFX.breakBlock();}return;}
    if(m.state==='seed'){LMR[0]=0;if(lmWind(m,0.45)){lmGo(m,'idle');m.shootCd=rnd(2.2,3);
      for(let k=0;k<3;k++){const T=clamp(Math.abs(dx)/300,0.45,1.2)*(0.9+k*0.12),vx=dx/T,vy=dy/T-0.5*520*T;lmShoot(m,Math.atan2(vy,vx),Math.hypot(vx,vy),0.5,'#c8a040',4,'lseed',{grav:520,life:3});}SFX.hit();}return;}
    if(ag){lmFaceX(m,dx);LMR[0]=dist>200?nx*0.9:dist<90?-nx*0.6:0;
      if(m.cd<=0&&seen&&dist<330&&dist>70)lmGo(m,'root');else if(m.shootCd<=0&&seen&&dist<340)lmGo(m,'seed');
      else if(dist<42&&m.atkCd<=0){m.atkCd=1.1;m.atkT=0.24;lmMelee(m,0.6,null,180,-100);}}
    else lmWander(m,0.3);
  },
  lglassbird(m,d,dt,dx,dy,dist,nx,ny,ag,seen){
    const px=player.x,py=player.y-player.h*0.5;
    if(m.state==='sing'){LMR[0]=0;LMR[1]=0;if(lmWind(m,0.85)){lmGo(m,'idle');m.shootCd=rnd(4.5,6);
      lmRing(m.x,m.y-m.h*0.5,m.tf?150:120,0.01,d.dmg*1.0*lmTm(m)*(m.sc||1),'#9ad8ff',m.tf?6:0);AU.bell(1760,0.8,0.08,0,{ratio:1.41,index:1});}
      else if(!m.ring){m.ring=1;lmRing(m.x,m.y-m.h*0.5,m.tf?150:120,0.85,0,'#ff4a5a');}return;}
    m.ring=0;
    if(m.state==='windup'){LMR[0]=0;LMR[1]=-0.3;if(lmWind(m,0.4,px,py)){lmGo(m,'dive');m.hitDone=false;const l=dist||1;m.dvx=dx/l*2.6;m.dvy=dy/l*2.6;m.cd=rnd(2.2,3.2);}return;}
    if(m.state==='dive'){LMR[0]=m.dvx;LMR[1]=m.dvy;m.dashT=1;if(!m.hitDone&&dist<26){m.hitDone=true;lmMelee(m,1,{bleed:2},160,-120);}if(m.st>0.55)lmGo(m,'retreat');return;}
    if(m.state==='retreat'){LMR[1]=-1;LMR[0]=-Math.sign(dx)*0.6;if(m.st>0.6)lmGo(m,'idle');return;}
    if(ag){lmFaceX(m,dx);const tx=px+Math.sin(m.anim*1.6+m.phase)*120,ty=py-110;LMR[0]=clamp((tx-m.x)/60,-1,1);LMR[1]=clamp((ty-(m.y-m.h*0.5))/50,-1,1);
      if(m.shootCd<=0&&dist<150&&seen)lmGo(m,'sing');else if(m.cd<=0&&dist<280&&seen)lmGo(m,'windup');}
    else lmWander(m,0.6,true);
  },
  lstatue(m,d,dt,dx,dy,dist,nx,ny,ag){
    m.dmgMul=m.state==='recover'?1.5:0;
    if(m.state==='snipw'){LMR[0]=0;if(lmWind(m,0.7)){lmGo(m,'recover');
      if(dist<96&&Math.sign(dx)===m.facing&&Math.abs(dy)<60)lmMelee(m,1.4,{bleed:3},260,-140,m.tf?6:0);SFX.hit();shake(3);}return;}
    if(m.state==='recover'){LMR[0]=0;if(m.st>0.8){lmGo(m,'idle');m.cd=rnd(1.4,2.2);}return;}
    if(ag){lmFaceX(m,dx);LMR[0]=dist>60?nx*0.9:0;if(dist<90&&m.cd<=0&&Math.abs(dy)<60)lmGo(m,'snipw');}
    else lmWander(m,0.3);
  },
  lchime(m,d,dt,dx,dy,dist,nx,ny,ag,seen){
    const px=player.x,py=player.y-player.h*0.5;
    if(m.state==='ring'){LMR[0]=0;LMR[1]=0;if(lmWind(m,0.6)){lmGo(m,'idle');m.shootCd=rnd(3.2,4.2);
      const n=m.tf?5:3;for(let k=0;k<n;k++)lmShard(player.x+(k-(n-1)/2)*42+rnd(-6,6),0.8+k*0.08,d.dmg*0.75*lmTm(m)*(m.sc||1));
      AU.bell(1319,1.2,0.07,0,{ratio:2.76,index:1.2});AU.bell(1976,1,0.05,0.1,{ratio:2.76,index:1});}return;}
    if(ag){lmFaceX(m,dx);const tx=px+Math.sin(m.anim*0.6+m.phase)*90,ty=py-150;LMR[0]=clamp((tx-m.x)/80,-0.8,0.8);LMR[1]=clamp((ty-(m.y-m.h*0.5))/60,-0.8,0.8);
      if(m.shootCd<=0&&seen&&dist<380)lmGo(m,'ring');}
    else lmWander(m,0.3,true);
  },
  lbee(m,d,dt,dx,dy,dist,nx,ny,ag,seen){
    const px=player.x,py=player.y-player.h*0.5;
    if(m.state==='windup'){LMR[0]=0;LMR[1]=0;if(lmWind(m,0.45,px,py)){lmGo(m,'dash');m.hitDone=false;const l=Math.hypot(m.ax-m.x,m.ay-(m.y-m.h*0.5))||1;m.dvx=(m.ax-m.x)/l*3.2;m.dvy=(m.ay-(m.y-m.h*0.5))/l*3.2;}return;}
    if(m.state==='dash'){LMR[0]=m.dvx;LMR[1]=m.dvy;m.dashT=1;if(!m.hitDone&&dist<24){m.hitDone=true;lmMelee(m,1,{poison:3},150,-100,m.tf?4:0);}if(m.st>0.45){lmGo(m,'idle');m.cd=rnd(2,3);}return;}
    if(ag){lmFaceX(m,dx);const a=m.anim*2+m.phase*3,tx=px+Math.cos(a)*90,ty=py-50+Math.sin(a)*40;LMR[0]=clamp((tx-m.x)/50,-1,1);LMR[1]=clamp((ty-(m.y-m.h*0.5))/50,-1,1);
      if(m.cd<=0&&seen&&dist<200)lmGo(m,'windup');}
    else lmWander(m,0.6,true);
  },
  lslime(m,d,dt,dx,dy,dist,nx,ny,ag,seen){
    if(m.state==='spit'){LMR[0]=0;if(lmWind(m,0.5)){lmGo(m,'idle');m.shootCd=rnd(2.4,3.2);
      const T=clamp(Math.abs(dx)/280,0.45,1.1),vx=dx/T,vy=dy/T-0.5*560*T;lmShoot(m,Math.atan2(vy,vx),Math.hypot(vx,vy),0.7,'#ffb030',7,'lhoney',{grav:560,fx:{slow:2},life:3,san:m.tf?4:0});SFX.hit();}return;}
    if(ag){lmFaceX(m,dx);if(m.onGround&&m.timer<=0){m.vy=-250;m.timer=rnd(0.6,1);}LMR[0]=m.onGround?0:nx*1.1;
      if(m.shootCd<=0&&seen&&dist<300&&dist>60)lmGo(m,'spit');
      else if(dist<(m.w+player.w)/2+8&&m.atkCd<=0){m.atkCd=1;m.atkT=0.24;lmMelee(m,0.8,{slow:1},160,-100);}}
    else{if(m.onGround&&m.timer<=0&&Math.random()<0.3)m.vy=-180;lmWander(m,0.3);}
  },
  lwaxknight(m,d,dt,dx,dy,dist,nx,ny,ag){
    if(!m.melt&&m.hp<m.maxHp*0.5){m.melt=true;floatText(m.x,m.y-m.h-12,'Подтаял!','#ffd080');}
    m.dmgMul=m.melt?1.25:0;const sp=m.melt?1.3:1;
    if(m.melt&&Math.random()<dt*6)spawnPart(m.x+rnd(-10,10),m.y-m.h*rnd(0.3,0.9),0,40,0.8,'#f4e2b0',2,300);
    if(m.state==='windup'){LMR[0]=0;if(lmWind(m,0.55/sp)){lmGo(m,'thrust');m.hitDone=false;SFX.swing();}return;}
    if(m.state==='thrust'){LMR[0]=m.facing*3.6;m.dashT=1;
      if(!m.hitDone&&Math.abs(dy)<50&&(player.x-m.x)*m.facing>-6&&(player.x-m.x)*m.facing<46){m.hitDone=true;lmMelee(m,1.3,null,320,-160);}
      if(m.st>0.3){lmGo(m,'idle');m.cd=rnd(1.6,2.4)/sp;}return;}
    if(ag){lmFaceX(m,dx);LMR[0]=dist>70?nx*0.9*sp:0;if(dist<140&&m.cd<=0&&Math.abs(dy)<50)lmGo(m,'windup');}
    else lmWander(m,0.35);
  },
  ldoll(m,d,dt,dx,dy,dist,nx,ny,ag){
    /* смотрит ли шахтёр на куклу */
    const looked=dist<420&&Math.sign(m.x-player.x)===player.facing&&veilT<0.9;
    if(looked&&!m.look){m.look=1;if(dist<300){AU.osc('square',rr(1500,1800),0.03,0.04,0,{to:900});}}
    if(!looked)m.look=0;
    if(m.state==='snipw'){LMR[0]=0;if(lmWind(m,0.32)){lmGo(m,'idle');m.cd=rnd(1,1.6);if(dist<52)lmMelee(m,1,{bleed:2},180,-120,5);SFX.hit();}return;}
    if(ag){lmFaceX(m,dx);
      if(looked&&m.state!=='snipw'){LMR[0]=0;m.frz=1;}
      else{m.frz=0;LMR[0]=nx*(m.tf?2.8:2.2);}
      if(dist<46&&m.cd<=0&&Math.abs(dy)<50)lmGo(m,'snipw');}
    else{m.frz=0;lmWander(m,0.3);}
  },
  lsoldier(m,d,dt,dx,dy,dist,nx,ny,ag,seen){
    if(m.ammo===undefined)m.ammo=3;
    m.dmgMul=m.state==='rewind'?2:0;
    if(m.state==='rewind'){LMR[0]=0;if(Math.random()<dt*4)AU.osc('square',rr(700,900),0.02,0.03,0,{});if(m.st>2.4){lmGo(m,'idle');m.ammo=3;}return;}
    if(m.state==='aim'){LMR[0]=0;lmFaceX(m,dx);if(lmWind(m,m.ammo===3?0.7:0.35,player.x,player.y-player.h*0.5)){
      m.ammo--;const a=Math.atan2(m.ay-(m.y-m.h*0.62),m.ax-m.x);lmShoot(m,a,560,0.9,'#ffd890',3.4,'lshot',{life:1.6});SFX.shot?SFX.shot():SFX.hit();
      for(let k=0;k<5;k++)spawnPart(m.x+m.facing*20,m.y-m.h*0.62,m.facing*rnd(40,120),rnd(-30,30),0.4,'#d8d0c0',2.4,-20);
      lmGo(m,m.ammo>0?'aim':'rewind');if(m.ammo<=0)floatText(m.x,m.y-m.h-12,'Заводится…','#e0b050');}return;}
    if(ag){lmFaceX(m,dx);LMR[0]=dist<180?-nx*0.8:dist>320?nx*0.8:0;if(m.shootCd<=0&&seen&&dist<460){lmGo(m,'aim');m.shootCd=0.1;}}
    else lmWander(m,0.4);
  },
  ljack(m,d,dt,dx,dy,dist,nx,ny,ag,seen){
    m.dmgMul=m.state==='box'||m.state==='tune'||!m.state||m.state==='idle'?0.25:m.state==='pop'||m.state==='out'?1.6:0;
    const hx=m.x,hy=m.y-m.h*0.9;
    if(m.state==='tune'){LMR[0]=0;if(Math.random()<dt*6)LSFX.mbox(Math.floor(m.st*8));
      if(lmWind(m,1.0,player.x,player.y-player.h*0.5)){lmGo(m,'pop');m.hitDone=false;const l=Math.hypot(m.ax-hx,m.ay-hy)||1,L=Math.min(160,l+20);m.nx2=(m.ax-hx)/l*L;m.ny2=(m.ay-hy)/l*L;SFX.boom&&SFX.boom();}return;}
    if(m.state==='pop'){LMR[0]=0;m.ext=Math.min(1,m.st/0.14);
      if(!m.hitDone&&m.ext>=1){m.hitDone=true;if(lmSeg(hx,hy,hx+m.nx2,hy+m.ny2,24))lmMelee(m,1.3,null,300,-200,m.tf?6:0);shake(3);}
      if(m.st>0.3)lmGo(m,'out');return;}
    if(m.state==='out'){LMR[0]=0;m.ext=1-clamp((m.st-1.0)/0.3,0,1);if(m.st>1.3){lmGo(m,'box');m.ext=0;m.cd=rnd(1.6,2.4);}return;}
    m.ext=0;
    if(ag){lmFaceX(m,dx);if(m.onGround&&m.timer<=0){m.vy=-200;m.timer=rnd(0.8,1.2);}LMR[0]=m.onGround?0:nx*0.9;
      if(dist<180&&m.cd<=0&&seen&&m.onGround)lmGo(m,'tune');}
    else lmWander(m,0.2);
  },
  lrosehound(m,d,dt,dx,dy,dist,nx,ny,ag){
    if(m.state==='crouch'){LMR[0]=0;if(lmWind(m,0.35)){lmGo(m,'leap');m.vy=-330;m.hitDone=false;}return;}
    if(m.state==='leap'){LMR[0]=m.facing*3.8;if(!m.hitDone&&dist<(m.w+player.w)/2+8){m.hitDone=true;lmMelee(m,1,{bleed:3},220,-160);}if(m.onGround&&m.st>0.15){lmGo(m,'idle');m.cd=rnd(1.4,2.2);}return;}
    if(ag){lmFaceX(m,dx);LMR[0]=nx*1.1;if(dist<160&&dist>50&&m.cd<=0&&m.onGround&&Math.abs(dy)<50)lmGo(m,'crouch');
      else if(dist<40&&m.atkCd<=0){m.atkCd=0.9;m.atkT=0.24;lmMelee(m,0.7,{bleed:2},160,-100);}}
    else lmWander(m,0.5);
  },
  lgardener(m,d,dt,dx,dy,dist,nx,ny,ag,seen){
    if(m.state==='snipw'){LMR[0]=0;if(lmWind(m,0.45)){lmGo(m,'idle');m.cd=rnd(1.2,1.8);if(dist<74&&Math.sign(dx)===m.facing&&Math.abs(dy)<50)lmMelee(m,1.1,{bleed:2},220,-120,m.tf?4:0);SFX.hit();}return;}
    if(m.state==='throw'){LMR[0]=0;if(lmWind(m,0.5)){lmGo(m,'idle');m.shootCd=rnd(3.2,4);
      const tx=player.x,ty=player.y-6,T=0.8,vx=(tx-m.x)/T,vy=(ty-(m.y-m.h*0.7))/T-0.5*520*T;
      const p=lmShoot(m,Math.atan2(vy,vx),Math.hypot(vx,vy),0,'#8a5a2a',4,'lthorn',{grav:520,life:T+0.05,hr:1});p.y=m.y-m.h*0.7;p.x=m.x;
      hzSpike(tx,ty,58,0.95,d.dmg*0.9*lmTm(m)*(m.sc||1),'#c8304e',{bleed:2});SFX.swing();}return;}
    if(ag){lmFaceX(m,dx);LMR[0]=dist>56?nx*0.9:0;
      if(dist<70&&m.cd<=0&&Math.abs(dy)<50)lmGo(m,'snipw');else if(m.shootCd<=0&&seen&&dist>110&&dist<320)lmGo(m,'throw');}
    else lmWander(m,0.3);
  },
  lfairy(m,d,dt,dx,dy,dist,nx,ny,ag,seen){
    const px=player.x,py=player.y-player.h*0.5;
    if(m.state==='spin'){LMR[0]=0;LMR[1]=0;if(lmWind(m,0.6)){lmGo(m,'idle');m.shootCd=rnd(3,3.8);
      const n=m.tf?10:6,o=Math.random()*TAU;for(let k=0;k<n;k++)lmShoot(m,o+k/n*TAU,190,0.5,m.tf?'#8a1a3a':'#ff9ac0',5,'lpetal',{ghost:true,life:2.4,san:m.tf?3:0});SFX.whisper(0.3);}return;}
    if(ag){lmFaceX(m,dx);const a=m.anim*0.9+m.phase,tx=px+Math.cos(a)*150,ty=py-60+Math.sin(a*1.3)*50;LMR[0]=clamp((tx-m.x)/60,-1,1);LMR[1]=clamp((ty-(m.y-m.h*0.5))/60,-1,1);
      if(m.shootCd<=0&&dist<340)lmGo(m,'spin');
      else if(dist<30&&m.atkCd<=0){m.atkCd=1.2;m.atkT=0.24;lmMelee(m,0.6,null,120,-80,3);}}
    else lmWander(m,0.4,true);
  },
  lmirror(m,d,dt,dx,dy,dist,nx,ny,ag){
    /* повторяет прыжки и удары шахтёра */
    const pj=player.vy<-280&&!m.pj;m.pj=player.vy<-280;
    if(ag&&pj&&m.onGround)m.vy=-480;
    const pa=player.atkAnim>0.9&&!m.pa;m.pa=player.atkAnim>0.9;
    if(m.state==='windup'){LMR[0]=0;if(lmWind(m,0.28)){lmGo(m,'dash');m.hitDone=false;SFX.swing();}return;}
    if(m.state==='dash'){LMR[0]=m.facing*3.6;m.dashT=1;if(!m.hitDone&&dist<34){m.hitDone=true;lmMelee(m,1,null,220,-140,m.tf?5:0);}if(m.st>0.28){lmGo(m,'idle');m.cd=rnd(1.2,2);}return;}
    if(ag){lmFaceX(m,dx);const want=120;LMR[0]=dist>want+30?nx*1.1:dist<want-30?-nx*0.9:0;
      if((pa&&dist<180||m.cd<=0&&dist<150)&&Math.abs(dy)<60)lmGo(m,'windup');}
    else lmWander(m,0.4);
  },
  lswan(m,d,dt,dx,dy,dist,nx,ny,ag,seen){
    const hx=m.x+m.facing*10,hy=m.y-m.h*0.7;
    if(m.state==='neckw'){LMR[0]=0;LMR[1]=0;if(lmWind(m,0.6,player.x,player.y-player.h*0.5)){lmGo(m,'neck');m.hitDone=false;
      const l=Math.hypot(m.ax-hx,m.ay-hy)||1,L=Math.min(m.tf?130:110,l+16);m.nx2=(m.ax-hx)/l*L;m.ny2=(m.ay-hy)/l*L;}return;}
    if(m.state==='neck'){LMR[0]=0;LMR[1]=0;m.ext=Math.min(1,m.st/0.12);if(!m.hitDone&&m.ext>=1){m.hitDone=true;if(lmSeg(hx,hy,hx+m.nx2,hy+m.ny2,22))lmMelee(m,1.2,m.tf?{bleed:3}:null,240,-140);}
      if(m.st>0.45){lmGo(m,'idle');m.ext=0;m.cd=rnd(1.8,2.6);}return;}
    m.ext=0;
    if(m.state==='gustw'){LMR[0]=0;LMR[1]=0;if(lmWind(m,0.5)){lmGo(m,'idle');m.shootCd=rnd(4,5.5);const p=lmShoot(m,Math.atan2(dy,dx),300,0.4,'#e8f8ff',9,'lgust',{life:1.2,hr:26});p.onEnd=()=>{player.vx+=Math.sign(dx)*520;player.vy=-200;};}return;}
    if(ag){lmFaceX(m,dx);const tx=player.x-Math.sign(dx||1)*110,ty=player.y-player.h*0.5-30;LMR[0]=clamp((tx-m.x)/60,-1,1);LMR[1]=clamp((ty-(m.y-m.h*0.5))/60,-1,1);
      if(dist<150&&m.cd<=0&&seen)lmGo(m,'neckw');else if(m.shootCd<=0&&seen&&dist<300)lmGo(m,'gustw');}
    else lmWander(m,0.4,true);
  },
  lfrog(m,d,dt,dx,dy,dist,nx,ny,ag,seen){
    const mx=m.x+m.facing*12,my=m.y-m.h*0.55;
    if(m.state==='puff'){LMR[0]=0;if(lmWind(m,0.5,player.x,player.y-player.h*0.5)){lmGo(m,'tongue');m.hitDone=false;
      const l=Math.hypot(m.ax-mx,m.ay-my)||1,L=Math.min(200,l+12);m.nx2=(m.ax-mx)/l*L;m.ny2=(m.ay-my)/l*L;}return;}
    if(m.state==='tongue'){LMR[0]=0;m.ext=m.st<0.14?m.st/0.14:Math.max(0,1-(m.st-0.3)/0.25);
      if(!m.hitDone&&m.st>=0.14){m.hitDone=true;if(lmSeg(mx+m.nx2*0.7,my+m.ny2*0.7,mx+m.nx2,my+m.ny2,24)&&!cheats.god){lmMelee(m,0.6,null,0,0);player.vx=-Math.sign(m.nx2)*620;player.vy=-160;m.bite=0.6;}}
      if(m.bite>0){m.bite-=dt;if(m.bite<=0.05&&dist<56){lmMelee(m,0.9,null,200,-160,m.tf?5:0);m.bite=0;}}
      if(m.st>0.6){lmGo(m,'idle');m.ext=0;m.cd=rnd(2.2,3);}return;}
    if(ag){lmFaceX(m,dx);if(m.onGround&&m.timer<=0&&dist>90){m.vy=-360;m.timer=rnd(0.8,1.3);}LMR[0]=m.onGround?0:nx*1.4;
      if(dist<220&&dist>60&&m.cd<=0&&seen&&m.onGround)lmGo(m,'puff');
      else if(dist<40&&m.atkCd<=0){m.atkCd=1;m.atkT=0.24;lmMelee(m,0.7,null,160,-100);}}
    else{if(m.onGround&&m.timer<=0&&Math.random()<0.3){m.vy=-260;m.timer=rnd(1,2);}lmWander(m,0.3);}
  },
  lsheep(m,d,dt,dx,dy,dist,nx,ny,ag){
    /* прыгает дугой через шахтёра и считает */
    if(m.side===undefined)m.side=Math.sign(dx)||1;
    const sd=Math.sign(dx)||1;
    if(!m.onGround&&m.side!==sd&&m.y<player.y-player.h){m.side=sd;
      G.lsCount=(G.lsCount||0)+1;const N=['Раз…','Два…','Три…','Четыре…','Пять…'][Math.min(4,(G.lsCount-1)%5)];
      floatText(m.x,m.y-m.h-14,N+' овечка','#e8d8ff');G.lilSleep=Math.min(1,(G.lilSleep||0)+0.14);lsSan(m.tf?-3:-1.5);}
    if(m.onGround&&!m.wasG&&m.st>0.2&&dist<(m.w+player.w)/2+10&&!cheats.god){lmMelee(m,1,null,200,-220);}
    m.wasG=m.onGround;
    if(ag){if(m.onGround&&m.timer<=0){m.vy=-500;m.timer=rnd(0.9,1.4);m.facing=sd;m.jx=sd;m.st=0;}LMR[0]=m.onGround?0:(m.jx||sd)*1.9;}
    else{if(m.onGround&&m.timer<=0&&Math.random()<0.3){m.vy=-320;m.timer=rnd(1.5,3);}lmWander(m,0.3);}
  },
  lsandman(m,d,dt,dx,dy,dist,nx,ny,ag,seen){
    const px=player.x,py=player.y-player.h*0.5;
    if(m.state==='fade'){LMR[0]=0;LMR[1]=0;m.alpha=Math.max(0,1-m.st/0.4);m.untargetable=true;
      if(m.st>0.4){const a=Math.random()*TAU;for(let k=0;k<10;k++){const x=px+Math.cos(a+k)*200,y=py-60+Math.sin(a+k)*60;
        if(!isSolid(Math.floor(x/TILE),Math.floor(y/TILE))&&x>TILE&&x<(MW-1)*TILE){m.x=x;m.y=y+m.h*0.5;break;}}lmGo(m,'appear');}return;}
    if(m.state==='appear'){LMR[0]=0;LMR[1]=0;m.alpha=Math.min(1,m.st/0.4);if(m.st>0.4){m.untargetable=false;m.alpha=1;lmGo(m,'idle');}return;}
    if(m.state==='throw'){LMR[0]=0;LMR[1]=0;if(lmWind(m,0.6)){lmGo(m,'idle');m.shootCd=rnd(2.6,3.4);
      for(let k=-1;k<=1;k++){const T=clamp(Math.abs(dx)/300,0.5,1.1),vx=dx/T,vy=dy/T-0.5*300*T;lmShoot(m,Math.atan2(vy,vx)+k*0.14,Math.hypot(vx,vy),0.5,m.tf?'#a89060':'#f4e6b0',4,'lsand',{grav:300,life:3,fx:{slow:1.2},sleep:0.22,san:2});}SFX.whisper(0.25);}return;}
    if(ag){lmFaceX(m,dx);const tx=px-Math.sign(dx||1)*190,ty=py-90+Math.sin(m.anim)*20;LMR[0]=clamp((tx-m.x)/80,-0.8,0.8);LMR[1]=clamp((ty-(m.y-m.h*0.5))/80,-0.8,0.8);
      if(dist<95&&(m.tpCd||0)<=0){m.tpCd=4;lmGo(m,'fade');SFX.portal();}
      else if(m.shootCd<=0&&seen&&dist<380)lmGo(m,'throw');}
    else lmWander(m,0.3,true);
    if(m.tpCd>0)m.tpCd-=dt;
  },
  lnightmare(m,d,dt,dx,dy,dist,nx,ny,ag,seen){
    const truth=veilT>0.45;
    if(!truth){m.untargetable=true;m.alpha=0.22+0.08*Math.sin(G.time*3+m.phase);if(m.state!=='idle')lmGo(m,'idle');
      m.calm=(m.calm||0)+(veilT<0.2?dt:0);if(m.calm>3){m.dead=1;return;}
      LMR[0]=clamp(dx/200,-0.4,0.4);LMR[1]=clamp((dy-30)/200,-0.4,0.4);return;}
    m.calm=0;m.untargetable=false;m.alpha=1;
    if(m.state==='roar'){LMR[0]=0;LMR[1]=0;if(lmWind(m,0.7,player.x,player.y-player.h*0.5)){lmGo(m,'charge');m.hitDone=false;
      const l=Math.hypot(m.ax-m.x,m.ay-(m.y-m.h*0.5))||1;m.dvx=(m.ax-m.x)/l*3.2;m.dvy=(m.ay-(m.y-m.h*0.5))/l*3.2;shake(4);SFX.whisper(1);}return;}
    if(m.state==='charge'){LMR[0]=m.dvx;LMR[1]=m.dvy;m.dashT=1;if(!m.hitDone&&dist<36){m.hitDone=true;lmMelee(m,1.2,null,300,-200,8);}if(m.st>0.6){lmGo(m,'idle');m.cd=rnd(2.2,3);}return;}
    if(ag){lmFaceX(m,dx);LMR[0]=nx*0.9;LMR[1]=ny*0.9;if(m.cd<=0&&dist<300&&dist>60)lmGo(m,'roar');
      else if(dist<44&&m.atkCd<=0){m.atkCd=1;m.atkT=0.24;lmMelee(m,0.8,null,200,-120,4);}}
    else lmWander(m,0.4,true);
  }
};
/* вызывается из updateMobs (22) вместо обычной логики */
/* нрав в Иллюзии: p — мирный (никогда не нападает, от удара убегает),
   n — нейтральный (нападает, только если его ударить; стая заступается), h — злой всегда.
   В Истине агрессивны все */
const LM_TEMPER={lbunny:'p',lbutterfly:'p',ldaisy:'n',lglassbird:'p',lstatue:'n',lchime:'n',lbee:'n',lslime:'p',lwaxknight:'n',
  ldoll:'n',lsoldier:'n',ljack:'n',lrosehound:'n',lgardener:'n',lfairy:'p',lmirror:'n',lswan:'p',lfrog:'n',lsheep:'p',lsandman:'p',lnightmare:'h'};
function lmTemper(m){return (m.def.lm&&!m.tf&&LM_TEMPER[m.def.id])||'h';}
/* моб сейчас мирный: не нападает и не трогается автоатакой */
function lmCalm(m){const k=lmTemper(m);return k==='p'||(k==='n'&&!(m.provoked>0));}
/* удар по мобу Лиловых небес: нейтральный злится (и зовёт своих), мирный убегает */
function lmOnHit(m){
  const k=lmTemper(m);
  if(k==='n'){if(!(m.provoked>0))floatText(m.x,m.y-m.h-26,'разозлился!','#ff8a8a');
    for(const o of mobs)if(o.alive&&o.def===m.def&&Math.hypot(o.x-m.x,o.y-m.y)<6*TILE)o.provoked=Math.max(o.provoked||0,15);}
  else if(k==='p'){m.fleeT=3.5;}
}
/* мирное поведение: бродит, порхает, убегает от шахтёра после удара */
function lmCalmAI(m,def,dt,dx){
  if(m.state!=='idle'){m.state='idle';m.tele=0;m.ax=undefined;m.ext=0;m.st=0;}
  m.dashT=0;
  if(m.fleeT>0){m.fleeT-=dt;const d=dx>0?-1:1;LMR[0]=d*1.25;m.facing=d;if(def.fly)LMR[1]=-0.4;return;}
  m.wT=(m.wT||0)-dt;
  if(m.wT<=0){m.wT=rnd(1.5,3.5);m.wDir=Math.random()<0.35?0:(Math.random()<0.5?-1:1);m.wY=rnd(-0.3,0.3);}
  if(m.vx!==undefined&&Math.abs(m.vx)<4&&m.wDir&&m.wT<rnd(0,3)&&!def.fly)m.wDir=-m.wDir;
  LMR[0]=(m.wDir||0)*0.3;
  if(def.fly){const hy=m.homeY===undefined?(m.homeY=m.y):m.homeY;LMR[1]=clamp((hy-m.y)/60,-0.5,0.5)+m.wY*0.5+Math.sin(G.time*1.7+m.phase)*0.15;}
  if(m.wDir)m.facing=m.wDir;
}
function lilMobAI(m,def,dt,dx,dy,dist,nx,ny,aggro,seen){
  LMR[0]=0;LMR[1]=0;LMR[2]=false;
  lmForm(m);
  if(m.dmgMul===undefined)m.dmgMul=0;
  if(lmCalm(m)){lmCalmAI(m,def,dt,dx);return LMR;}
  m.homeY=undefined;
  const f=LM_AI[def.id];if(f)f(m,def,dt,dx,dy,dist,nx,ny,aggro,seen);
  if(m.dead){m.dead=0;const i=mobs.indexOf(m);if(i>=0){mobs.splice(i,1);burst(m.x,m.y-m.h*0.5,14,'#4a3a6a',90,3);}}
  return LMR;
}
/* смерть: слизень делится, в Истине — лишняя руда */
function lilMobDeath(m,quiet){
  const d=m.def;
  if(!quiet){lbMobKill(m);lstPageTruth(m);}
  if(m.tf&&!quiet&&Math.random()<0.5){const o=d.drops[1]||d.drops[0];addOre(o.ore,1);floatText(m.x-10,m.y-m.h-36,'Истинная добыча','#ff9ab8');}
  if(d.id==='lslime'&&!m.child&&!quiet){
    for(let i=0;i<2;i++){const c=spawnMobAt(d,m.x+(i?14:-14),m.y);c.child=1;c.w=d.w*0.65;c.h=d.h*0.65;c.hp=c.maxHp=Math.round(m.maxHp*0.35);c.vy=-260;c.vx=(i?1:-1)*120;c.noSouls=true;}
  }
}

/* ---------- предупреждения и «длинные» части (шея, язык) — поверх мобов ---------- */
function lilMobFx(g){
  const time=G.time;
  for(const m of mobs){
    if(!m.def.lm||!m.alive)continue;
    const id=m.def.id,st=m.state,k=m.tele||0;
    /* красная черта прицела у рывков и выстрелов */
    if((st==='windup'&&(id==='lbee'||id==='lbutterfly'||id==='lglassbird'))||st==='aim'||st==='roar'||st==='swoopw'){
      if(m.ax!==undefined){const x0=m.x,y0=m.y-m.h*(id==='lsoldier'?0.62:0.5),a=Math.atan2(m.ay-y0,m.ax-x0),L=id==='lsoldier'?420:id==='lnightmare'?260:180;
        g.save();g.strokeStyle='rgba(255,60,70,'+(0.15+0.55*k)+')';g.lineWidth=2+2*k;g.setLineDash([8,6]);g.lineDashOffset=-time*60;
        g.beginPath();g.moveTo(x0,y0);g.lineTo(x0+Math.cos(a)*L,y0+Math.sin(a)*L);g.stroke();g.restore();}}
    if((st==='windup'&&id==='lwaxknight')||(st==='windup'&&id==='lmirror')||(st==='crouch')){
      const y=m.y-m.h*0.45,L=id==='lwaxknight'?120:id==='lmirror'?110:150;
      g.fillStyle='rgba(255,60,60,'+(0.1+0.25*k)+')';g.fillRect(m.facing>0?m.x:m.x-L,y-14,L,28);}
    if((st==='snipw'&&(id==='lstatue'||id==='lgardener'||id==='ldoll'))){
      const r=id==='lstatue'?96:id==='lgardener'?74:52;g.save();g.translate(m.x,m.y-m.h*0.5);g.scale(m.facing,1);
      g.fillStyle='rgba(255,70,50,'+(0.12+0.3*k)+')';g.beginPath();g.moveTo(0,0);g.arc(0,0,r,-0.7,0.7);g.closePath();g.fill();
      g.strokeStyle='rgba(255,120,90,'+(0.3+0.5*k)+')';g.lineWidth=2;g.beginPath();g.arc(0,0,r*(0.5+0.5*k),-0.7,0.7);g.stroke();g.restore();}
    /* шея табакерки, шея лебедя, язык лягушки */
    if((id==='ljack'||id==='lswan'||id==='lfrog')&&(st==='tune'||st==='neckw'||st==='puff')&&m.ax!==undefined){
      const x0=id==='ljack'?m.x:m.x+m.facing*(id==='lswan'?10:12),y0=id==='ljack'?m.y-m.h*0.9:m.y-m.h*(id==='lswan'?0.7:0.55),a=Math.atan2(m.ay-y0,m.ax-x0),L=id==='lfrog'?200:id==='ljack'?160:120;
      g.save();g.strokeStyle='rgba(255,60,70,'+(0.15+0.55*k)+')';g.lineWidth=3;g.setLineDash([6,6]);g.beginPath();g.moveTo(x0,y0);g.lineTo(x0+Math.cos(a)*L,y0+Math.sin(a)*L);g.stroke();g.restore();}
    if((id==='ljack'||id==='lswan'||id==='lfrog')&&(m.ext||0)>0.01)lilLongPart(g,m,time);
    /* место приземления овечки */
    if(id==='lsheep'&&!m.onGround&&m.vy>0){const fy=floorBelowY(m.x+m.vx*0.18,m.y);if(fy!==null){g.fillStyle='rgba(255,60,70,.32)';g.beginPath();g.ellipse(m.x+m.vx*0.18,fy-2,m.w*0.7,5,0,0,TAU);g.fill();}}
    /* Кошмар в Иллюзии — только дрожащий воздух */
  }
  /* опасности: кольца и осколки */
  for(const h of LMH){
    if(h.k==='ring'){
      if(h.t<h.warn){const a=h.t/h.warn;g.strokeStyle='rgba(255,60,80,'+(0.25+0.5*a)+')';g.lineWidth=3;g.beginPath();g.arc(h.x,h.y,h.r,0,TAU);g.stroke();
        g.fillStyle='rgba(255,60,80,'+(0.06+0.12*a)+')';g.beginPath();g.arc(h.x,h.y,h.r*a,0,TAU);g.fill();}
      else{const a=1-(h.t-h.warn)/0.35;g.strokeStyle=hexA(h.col,Math.max(0,a));g.lineWidth=6*a+1;g.beginPath();g.arc(h.x,h.y,h.r*(1-a*0.2),0,TAU);g.stroke();}
    }else if(h.k==='shard'){
      if(h.t<h.warn){const a=h.t/h.warn;g.strokeStyle='rgba(255,60,60,'+(0.3+0.5*a)+')';g.lineWidth=2;g.beginPath();g.ellipse(h.x,h.fy-2,10+6*(1-a),3,0,0,TAU);g.stroke();
        g.fillStyle='rgba(255,90,60,'+(0.12+0.25*a)+')';g.fillRect(h.x-1.5,h.y,3,h.fy-h.y);}
      g.save();g.translate(h.x+(h.t<h.warn?Math.sin(time*50)*1.2:0),h.y);g.rotate(h.t>h.warn?h.t*8:0);
      g.fillStyle='#e8f4ff';g.beginPath();g.moveTo(-4,-6);g.lineTo(4,-6);g.lineTo(0,9);g.closePath();g.fill();g.fillStyle='#b8a0f0';g.beginPath();g.moveTo(0,-6);g.lineTo(4,-6);g.lineTo(0,9);g.closePath();g.fill();g.restore();
    }
  }
}
/* шея и язык рисуются в мире: они длиннее рамки обводки модели */
function lilLongPart(g,m,time){
  const id=m.def.id;   /* рисунки шеи и языка — в файлах моделей биомов (66, 68) */
  if(id==='lfrog')lmMirrorFrogLong(g,m,time);else if(id==='lswan')lmMirrorSwanLong(g,m,time);else if(id==='ljack')lmToysJackNeck(g,m,time);
}
/* снаряды Лиловых небес */
function lilDrawProj(g,p){
  if(p.lgk)return lgDrawProj(g,p);
  const k=p.kind,t=G.time;
  if(k==='lpollen'){softGlow(g,p.x,p.y,16,p.color,0.6);g.fillStyle=p.color;for(let i=0;i<5;i++){const a=t*4+i*1.26;g.beginPath();g.arc(p.x+Math.cos(a)*4,p.y+Math.sin(a)*4,1.8,0,TAU);g.fill();}return true;}
  if(k==='lseed'||k==='lthorn'){g.save();g.translate(p.x,p.y);g.rotate(t*10);g.fillStyle=k==='lthorn'?'#5a3a1a':'#a87a30';g.beginPath();g.ellipse(0,0,4.6,2.8,0,0,TAU);g.fill();
    g.fillStyle=k==='lthorn'?'#c8304e':'#e8c870';g.beginPath();g.ellipse(-1,-1,1.6,1,0,0,TAU);g.fill();g.restore();return true;}
  if(k==='lhoney'){g.fillStyle='#c87808';g.beginPath();g.ellipse(p.x,p.y,7,6,Math.atan2(p.vy,p.vx),0,TAU);g.fill();g.fillStyle='#ffc040';g.beginPath();g.ellipse(p.x-1,p.y-1,5,4,0,0,TAU);g.fill();
    g.fillStyle='rgba(255,255,230,.8)';g.beginPath();g.arc(p.x-2.4,p.y-2.4,1.4,0,TAU);g.fill();return true;}
  if(k==='lshot'){const a=Math.atan2(p.vy,p.vx);g.save();g.translate(p.x,p.y);g.rotate(a);g.fillStyle='rgba(255,220,150,.45)';g.fillRect(-16,-1.4,16,2.8);g.fillStyle='#d8c8a0';g.beginPath();g.arc(0,0,3,0,TAU);g.fill();g.restore();return true;}
  if(k==='lpetal'){g.save();g.translate(p.x,p.y);g.rotate(t*6+p.x*0.05);g.fillStyle=p.color;g.beginPath();g.ellipse(0,0,6,3,0,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.4)';g.beginPath();g.ellipse(-2,-0.6,2.4,1,0,0,TAU);g.fill();g.restore();return true;}
  if(k==='lgust'){g.save();g.strokeStyle='rgba(232,248,255,.7)';g.lineWidth=2;for(let i=0;i<3;i++){g.beginPath();g.arc(p.x-Math.sign(p.vx)*i*6,p.y,9-i*2,-1,1);g.stroke();}g.restore();return true;}
  if(k==='lsand'){softGlow(g,p.x,p.y,12,'#f4e6b0',0.5);g.fillStyle=p.color;for(let i=0;i<6;i++){g.fillRect(p.x+Math.sin(t*9+i*2)*4-0.8,p.y+Math.cos(t*7+i)*4-0.8,1.6,1.6);}return true;}
  return false;
}
