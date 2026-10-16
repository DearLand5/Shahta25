'use strict';
/* ============================================================
   ВЛАДЫКИ ПРЕИСПОДНЕЙ: призыв у постамента, ход боя, ворота,
   катсцены появления и смерти, награды, опасности (hbFx).
   ИИ боссов — 38-hb-ai.js, модели и рисование — 39-hb-models.js.
   Состояние боя: G.hb = {id, b, m, t, first}.
   ============================================================ */
const hbFx=[];
function hbFight(){return G.hb&&G.hb.m&&G.hb.m.alive?G.hb:null;}
function hbRecipe(id){return HB_RECIPES.find(r=>r.boss===id)||null;}
function hbDef(id){return MOBDEFS.find(d=>d.id==='hb_'+id);}
/* ворота: при открытии в центральной шахте арены возвращается лестница */
function hbGateOpenTile(b,x){return b===HB_FINAL&&x===HB_LADDER_X?T_LADDER:T_AIR;}
function hbSetGates(b,closed){for(const [x,y] of hbGateCells(b))setTile(x,y,closed?T_HBWALL:hbGateOpenTile(b,x));}
/* обрушение пола арены в 4-й фазе и его восстановление */
function hbCollapseFloor(on){
  const b=HB_FINAL,fy=b.y0+b.FY;
  for(let lx=3;lx<b.W-3;lx++){
    if(lx>=36&&lx<=59)continue;                       /* под троном пол держится */
    const seg=Math.floor((lx-3)/5);if(seg%2)continue; /* обрушиваются полосы через одну */
    const x=b.x0+lx;
    if(on){if(getTile(x,fy)===T_HBWALL)setTile(x,fy,T_LAVA);}
    else if(getTile(x,fy)===T_LAVA)setTile(x,fy,T_HBWALL);
  }
  hbProg().fl=on?1:0;
}
/* при входе в шахту и после загрузки: ворота открыты, прерванный призыв возвращает печать */
function hbFixWorld(){
  const P=hbProg();
  G.hb=null;hbFx.length=0;G.hbAsk=null;G.hbGateT=0;G.hbOutro=0;
  if(P.pending){const r=hbRecipe(P.pending);if(r)addMat(r.id,1);P.pending=null;setTimeout(()=>UI.toast('Бой с Владыкой прерван — печать возвращена'),900);}
  if(G.dim!==1)return;
  for(const b of HB_ALL)for(const [x,y] of hbGateCells(b))if(getTile(x,y)===T_HBWALL)setTile(x,y,hbGateOpenTile(b,x));
  if(P.fl)hbCollapseFloor(false);
}
/* бой прерван: смерть игрока или выход из шахты */
function hbAbort(){
  if(G.bossDeath&&G.bossDeath.hb&&!G.bossDeath.given)hbGiveLoot(G.bossDeath);
  const H=G.hb;if(!H)return;
  const P=hbProg();
  if(H.m&&H.m.alive){
    const r=hbRecipe(H.id);if(r&&P.pending)addMat(r.id,1);
    H.m.alive=false;const i=mobs.indexOf(H.m);if(i>=0)mobs.splice(i,1);
    UI.toast(H.b.name+hbG(H.b,' вернулся',' вернулась')+' в сон · печать возвращена');
  }
  P.pending=null;
  for(let i=mobs.length-1;i>=0;i--)if(mobs[i].hbMinion)mobs.splice(i,1);
  if(G.dim===1){hbSetGates(H.b,false);if(P.fl)hbCollapseFloor(false);}
  G.hb=null;hbFx.length=0;G.hbGateT=0;
  if(G.bossCut&&G.bossCut.hb)G.bossCut=null;
}

/* ---------- окно призыва у постамента ---------- */
UI.hbSummon=function(b){
  const r=hbRecipe(b.id),M=MATS[r.id],have=matN(r.id),k=hbKills(b.id);
  const trophy=b.trophy?MATS[b.trophy]:null;
  const d=this.build('hbsum',`
    <div class="card hell" style="max-width:470px;width:96vw;text-align:center">
      <h3 style="text-align:center">${b.place}</h3>
      <div class="hbSeal" style="--c:${b.col}"><span>${M.ic}</span></div>
      <p class="muted">Здесь спит <b style="color:${b.col}">${b.name}</b>. ${b.title}.</p>
      ${have?`<p>Положить <b>${M.n}</b> на постамент и разбудить ${hbG(b,'его','её')}? Ворота закроются, пока бой не закончится.</p>`
            :`<p class="muted">Нужна <b>${M.n}</b>. Её можно создать в Алтаре душ во вкладке «Призыв».</p>`}
      <div class="chk ${have?'':'no'}">${M.ic} ${M.n}<b>${have} шт.</b></div>
      <div class="chk">${trophy?trophy.ic+' Трофей: '+trophy.n:'🗝 Ключ Лиловых небес'}<b>${k?'побед: '+k:'ещё не побеждён'}</b></div>
      ${hbRecHtml(b)}${bfRulesHtml()}
      <p class="tiny" style="margin:8px 0 2px">${k?'Повторная победа даёт меньше душ и монет, но трофей выпадает всегда.':'Если погибнешь или уйдёшь из шахты, печать вернётся.'}</p>
    </div>
    ${have?'<button class="btn" id="hbGo">Пробудить</button>':''}
    <button class="btn alt" id="hbNo">Отойти</button>`);
  const go=d.querySelector('#hbGo');if(go)go.onclick=()=>{UI.clear();hbStart(b);};
  d.querySelector('#hbNo').onclick=()=>{SFX.uiBack();UI.close();};
};

/* рекомендуемое снаряжение и предупреждение, если оно слабее */
function hbRecHtml(b){
  const r=HB_REC[b.id],P=player,gl=Math.min(P.swordLvl,P.armorLvl),ok=gl>=r.g&&P.gunLvl>=r.gun;
  const fin=b===HB_FINAL;
  return `<div class="chk ${ok?'ok':'no'}">${ok?'✔':'⚠'} Снаряжение: меч и броня ${fin?'максимум':'ур. '+r.g}, огнестрел ${r.gun}<b>у тебя ${gl} / ${P.gunLvl}</b></div>`+
    (ok?'':`<p class="tiny" style="color:#ff9a8a;margin:4px 0 0">${fin?'Архидемона почти невозможно победить без полностью прокачанного снаряжения.':'Со слабым снаряжением бой будет очень тяжёлым.'}</p>`);
}
function hbPedPx(b){const p=hbPedestal(b);return {x:(p.tx+0.5)*TILE,y:p.ty*TILE};}
function hbCheckPedestal(){
  if(G.dim!==1||G.scene!=='mine'||G.hb||G.bossCut||G.bossDeath||UI.modal)return;
  const b=hbAt(player.x,player.y-4);
  if(!b){G.hbAsk=null;G.hbNear=null;return;}
  const p=hbPedPx(b),dx=Math.abs(player.x-p.x),dy=Math.abs(player.y-p.y);
  const near=dx<2.4*TILE&&dy<1.6*TILE;
  G.hbNear=near?b:null;
  if(near&&G.hbAsk!==b.id){
    G.hbAsk=b.id;
    const r=hbRecipe(b.id);
    if(matN(r.id)>0||b===HB_FINAL&&matN('sealHell')>0)UI.hbSummon(b);
    else{UI.toast('Нужна '+MATS[r.id].n+' — создай её в Алтаре душ');floatText(p.x,p.y-60,'Нужна '+MATS[r.id].n,'#ffd0a0');}
  }
  if(!near&&(dx>5*TILE||dy>3*TILE))G.hbAsk=null;
}

/* ---------- начало боя ---------- */
function hbSpawnPos(b){
  const fy=(b.y0+b.FY)*TILE,cx=(b.x0+b.W/2)*TILE,D=hbDef(b.id);
  switch(b.id){
    case 'herald':return {x:cx,y:fy-7*TILE};
    case 'mother':return {x:cx,y:fy};
    case 'toadking':return {x:cx,y:fy};
    case 'emperor':return {x:cx,y:fy-2*TILE-10};
    case 'warden':return {x:cx,y:fy+1*TILE};
    case 'archdemon':return {x:(b.x0+48)*TILE,y:fy-2*TILE-60};   /* там, где стоит статуя на троне */
  }
  return {x:cx,y:fy-D.h};
}
function hbStart(b){
  const r=hbRecipe(b.id);
  if(G.hb||!r||matN(r.id)<1)return;
  pay({m:{[r.id]:1}});
  const P=hbProg();P.pending=b.id;
  for(let i=mobs.length-1;i>=0;i--){const o=mobs[i];if(!o.def.boss&&(hbInside(b,o.x,o.y-4)||Math.hypot(o.x-player.x,o.y-player.y)<14*TILE)){o.alive=false;mobs.splice(i,1);}}
  for(let i=projectiles.length-1;i>=0;i--)if(projectiles[i].owner==='mob')projectiles.splice(i,1);
  hz.length=0;beams.length=0;grapple=null;player.pull=null;
  hbSetGates(b,true);
  const D=hbDef(b.id),sp=hbSpawnPos(b);
  const m=spawnMobAt(D,sp.x,sp.y);
  m.facing=player.x<m.x?-1:1;m.alpha=1;
  m.b={phase:1,atk:'intro',at:0,last:'',last2:'',queue:[],sub:0};m.invuln=99;m.spawnS=0;m.hbB=b;m.home={x:sp.x,y:sp.y};
  G.hb={id:b.id,b,m,t:0,first:!hbKills(b.id)};
  hbFx.length=0;
  const seen=P.seen||(P.seen={});const short=!!seen[b.id];seen[b.id]=1;
  const fin=b===HB_FINAL;
  G.bossCut={hb:b.id,t:short?(fin?2.8:1.8):0,dur:fin?10.8:7.6,roarT:fin?7.0:4.6,shatterT:fin?4.8:0,bx:sp.x,by:sp.y-D.h*0.5,m,roared:false,debris:[]};
  player.vx=0;player.facing=sp.x>player.x?1:-1;
  SFX.portal();shake(5);vib(80);
  saveGame();
}

/* ---------- катсцена появления ---------- */
function hbCutUpdate(dt){
  const c=G.bossCut;c.t+=dt;const m=c.m,H=hbById(c.hb);
  Input.digActive=false;player.vx*=0.8;
  if(m&&m.alive){m.spawnS=eOut((c.t-1.0)/Math.max(0.5,c.roarT-1.5));m.invuln=Math.max(m.invuln,1);c.bx=m.x;c.by=m.y-m.h*0.5;}
  if(typeof hbCutFxTick==='function')hbCutFxTick(c,dt);
  if(c.t<c.roarT&&c.t>1&&Math.random()<0.4)shake(1+c.t/c.roarT*2);
  if(c.t>=c.roarT&&!c.roared){
    c.roared=true;shake(c.hb==='archdemon'?26:18);SFX.boom();vib(200);G.hbFlash={t:1,col:H.col};
    if(SFX.mobDie)SFX.mobDie(m.def);
    for(let i=0;i<70;i++){const a=Math.random()*TAU,sp=rnd(140,520);spawnPart(c.bx,c.by,Math.cos(a)*sp,Math.sin(a)*sp,rnd(0.5,1.3),i%2?H.col:'#ffffff',rnd(2,5),0);}
    shockRings.push({x:c.bx,y:c.by,r:10,max:c.hb==='archdemon'?900:520,t:0,col:H.col});
    if(Math.hypot(player.x-c.bx,player.y-c.by)<300){player.vx+=Math.sign(player.x-c.bx||1)*460;player.vy=-280;}
  }
  if(c.t>=c.dur){
    G.bossCut=null;
    if(m&&m.alive){m.spawnS=1;m.invuln=0.6;if(m.b){m.b.atk='idle';m.b.at=0;m.b.sub=0;}}
    UI.toast('⚔ '+H.name+hbG(H,' пробудился!',' пробудилась!'));
  }
}
function hbCutCam(){
  const c=G.bossCut;
  const k=c.t<1.1?c.t/1.1:c.t<c.dur-1.3?1:Math.max(0,(c.dur-c.t)/1.3);
  const e=k*k*(3-2*k);
  const ty=c.hb==='archdemon'?c.by+40:c.by+20;
  return {x:lerp(player.x,c.bx,e),y:lerp(player.y-player.h*0.5-10,ty,e)};
}

/* ---------- победа ---------- */
function hbOnKilled(m){
  const id=m.def.hb,b=hbById(id),P=hbProg();
  const first=!hbKills(id);
  P.kills[id]=(P.kills[id]|0)+1;P.pending=null;
  if(P.fl)setTimeout(()=>{if(G.dim===1&&!G.hb)hbCollapseFloor(false);},4500);
  const souls=first?b.souls:Math.round(b.souls/3),coins=first?b.coins:Math.round(b.coins/4);
  const loot={};for(const k in b.loot)loot[k]=first?b.loot[k]:Math.ceil(b.loot[k]/2);
  /* добыча выдаётся, когда отгремит анимация смерти */
  G.bossDeath={hb:id,t:0,m,x:m.x,y:m.y,first,souls,coins,loot,given:false,flashed:false};
  G.slowT=2.2;m.dieK=0.01;m.alive=false;
  shake(12);SFX.boom();vib(180);
  for(let i=mobs.length-1;i>=0;i--){const o=mobs[i];if(o.hbMinion||o.def.mech==='hbecho'){burst(o.x,o.y-o.h*0.5,10,o.def.c1,160,3);o.alive=false;mobs.splice(i,1);}}
  for(let i=projectiles.length-1;i>=0;i--)if(projectiles[i].owner==='mob')projectiles.splice(i,1);
  hbFx.length=0;beams.length=0;
  G.hbGateT=b===HB_FINAL?7:5.5;
  G.bossCut=null;
}
function hbGiveLoot(d){
  if(d.given)return;d.given=true;
  const b=hbById(d.hb);
  player.souls=(player.souls||0)+d.souls;player.money+=d.coins;
  for(const k in d.loot)addMat(k,d.loot[k]);
  if(b.trophy)addMat(b.trophy,1);
  else{player.prog.lilacKey=true;}
  statAdd('kills');
  G.hbOutro={t:5.5,b,first:d.first,souls:d.souls,coins:d.coins};
  saveGame();
}

/* ---------- кадр: ворота, удержание в святилище, опасности ---------- */
function hbUpdate(dt){
  if(G.scene!=='mine'||G.dim!==1){if(G.hb&&G.scene!=='mine')hbAbort();return;}
  if(G.hbFlash&&G.hbFlash.t>0)G.hbFlash.t-=dt*1.4;
  if(G.hbOutro&&G.hbOutro.t>0)G.hbOutro.t-=dt;
  if(G.hbGateT>0){G.hbGateT-=dt;if(G.hbGateT<=0&&G.hb){hbSetGates(G.hb.b,false);UI.toast('Ворота открыты');G.hb=null;}}
  hbCheckPedestal();
  const H=hbFight();
  if(H){
    H.t+=dt;
    /* игрок не может покинуть святилище, пока идёт бой (сквозь стены — только читом) */
    const r=hbRect(H.b);
    if(player.x<(r.x0-1)*TILE||player.x>(r.x1+2)*TILE||player.y<(r.y0-2)*TILE||player.y>(r.y1+3)*TILE)hbAbort();
  }
  updateHbFx(dt);
}
function hbBoom(x,y,r,col){
  for(let i=0;i<16;i++){const a=Math.random()*TAU,sp=rnd(60,240);spawnPart(x,y,Math.cos(a)*sp,Math.sin(a)*sp,rnd(0.3,0.7),i%3?col:'#ffffff',rnd(2,4),200);}
  shockRings.push({x,y,r:4,max:r,t:0,col});
}
function hbHit(dmg,src,fx){if(!cheats.god)hurtPlayer(dmg,src,fx);}
function updateHbFx(dt){
  const pcx=player.x,pcy=player.y-player.h*0.5;
  for(let i=hbFx.length-1;i>=0;i--){
    const f=hbFx[i];f.t+=dt;
    switch(f.type){
      case 'pillar':{   /* столб из пола: предупреждение, затем удар */
        if(f.t>=f.warn&&!f.fired){f.fired=true;shake(f.big?7:3);SFX.breakBlock();
          for(let k=0;k<(f.big?14:7);k++)spawnPart(f.x+rnd(-f.w/2,f.w/2),f.y,rnd(-40,40),rnd(-420,-160),rnd(0.4,0.8),f.col,rnd(2,4),500);}
        if(f.fired&&!f.hit&&f.t<f.warn+(f.dur||0.35)&&Math.abs(pcx-f.x)<f.w*0.5+8&&player.y>f.y-f.h&&player.y<=f.y+8){f.hit=true;hbHit(f.dmg,f.src||'столб',f.fx);if(f.lift)player.vy=Math.min(player.vy,-f.lift);}
        if(f.t>f.warn+(f.dur||0.35)+0.4)hbFx.splice(i,1);
        break;}
      case 'meteor':{
        if(f.t<f.warn)break;
        f.vy=(f.vy||200)+1500*dt;f.y+=f.vy*dt;f.x+=(f.vx||0)*dt;
        if(Math.random()<0.7)spawnPart(f.x+rnd(-6,6),f.y-10,rnd(-20,20),rnd(-90,-20),0.5,f.col||'#ff9a3c',rnd(2,4),0);
        const hitP=Math.hypot(pcx-f.x,pcy-f.y)<(f.r||22)*0.6+12;
        if(hitP||solidAtPx(f.x,f.y+4)||f.y>f.maxY){
          hbBoom(f.x,f.y,f.blast||64,f.col||'#ff7a2a');
          if(hitP||Math.hypot(pcx-f.x,pcy-f.y)<(f.blast||64))hbHit(f.dmg,f.src||'метеор Владыки',f.fx||{burn:2});
          if(f.patch)addPatch(f.x,f.y-6,f.patch.w,f.patch.dur,f.patch.type,f.patch.dps);
          shake(5);hbFx.splice(i,1);}
        break;}
      case 'zone':{     /* круг на полу: проклятие, газ, жар */
        if(f.t>=f.warn&&f.t<f.warn+f.dur){f.tick=(f.tick||0)-dt;
          if(Math.hypot(pcx-f.x,pcy-f.y)<f.r&&f.tick<=0){f.tick=0.45;hbHit(f.dps*0.45,f.src||'проклятие',f.fx);}}
        if(f.t>f.warn+f.dur)hbFx.splice(i,1);
        break;}
      case 'tornado':{  /* смерч ползёт по полу и затягивает */
        f.x+=f.vx*dt;
        if(solidAtPx(f.x+Math.sign(f.vx)*24,f.y-20)||f.x<f.minX||f.x>f.maxX)f.vx=-f.vx;
        if(f.homing)f.vx+=Math.sign(pcx-f.x)*f.homing*dt;
        f.vx=clamp(f.vx,-f.sp,f.sp);
        const inX=Math.abs(pcx-f.x),inY=player.y>f.y-f.h&&player.y<=f.y+8;
        if(inX<90&&inY&&!cheats.god){player.vx+=Math.sign(f.x-pcx)*600*dt*(1-inX/90);}
        if(inX<26&&inY){f.tick=(f.tick||0)-dt;if(f.tick<=0){f.tick=0.5;hbHit(f.dmg,f.src||'смерч',f.fx);if(!cheats.god)player.vy=Math.min(player.vy,-380);}}
        if(Math.random()<0.8)spawnPart(f.x+rnd(-18,18),f.y-rnd(0,f.h),Math.cos(G.time*9)*80,rnd(-120,-40),0.5,f.col,rnd(2,3.5),-30);
        if(f.t>f.life)hbFx.splice(i,1);
        break;}
      case 'wall':{     /* бегущая по полу стена (кости, лава, кровь) — перепрыгни */
        if(f.t<(f.warn||0))break;
        f.x+=f.vx*dt;
        const fy=floorBelowY(f.x,f.y-8);if(fy!==null&&Math.abs(fy-f.y)<TILE*1.6)f.y=fy;
        if(fy===null||solidAtPx(f.x+Math.sign(f.vx)*10,f.y-12)||f.t>(f.warn||0)+f.life){hbFx.splice(i,1);break;}
        if(!f.hit&&Math.abs(pcx-f.x)<16&&player.y>f.y-f.h&&player.y<=f.y+8){f.hit=true;hbHit(f.dmg,f.src||'волна',f.fx);if(!cheats.god){player.vy=-360;player.vx+=Math.sign(f.vx)*300;}}
        if(Math.random()<0.6)spawnPart(f.x,f.y-rnd(0,f.h),rnd(-30,30),rnd(-200,-60),0.4,f.col,rnd(2,3.5),500);
        break;}
      case 'line':if(f.t>f.life)hbFx.splice(i,1);break;
      case 'flood':{   /* поднимающаяся кровь: стоять на полу нельзя */
        const tot=f.rise+f.hold+f.fall,k=f.t<f.rise?eOut(f.t/f.rise):f.t<f.rise+f.hold?1:Math.max(0,1-(f.t-f.rise-f.hold)/f.fall);
        f.lvl=f.y-f.h*k;
        if(k>0.3&&player.y>f.lvl+6&&player.x>f.x0&&player.x<f.x1){player.fx.slow=Math.max(player.fx.slow||0,0.4);f.tick=(f.tick||0)-dt;if(f.tick<=0){f.tick=0.4;hbHit(f.dps*0.4,f.src,{bleed:1});}}
        if(f.t>tot)hbFx.splice(i,1);
        break;}
      case 'chain':{    /* цепь из стены: прицел, затем хлёсткий удар-луч */
        if(f.t>=f.warn&&!f.fired){f.fired=true;
          const a=Math.atan2(f.ty-f.y,f.tx-f.x);let L=0;while(L<f.len){L+=12;if(L>60&&solidAtPx(f.x+Math.cos(a)*L,f.y+Math.sin(a)*L))break;}
          f.x2=f.x+Math.cos(a)*L;f.y2=f.y+Math.sin(a)*L;
          const vx=f.x2-f.x,vy=f.y2-f.y,l2=vx*vx+vy*vy||1;let u=clamp(((pcx-f.x)*vx+(pcy-f.y)*vy)/l2,0,1);
          if(Math.hypot(pcx-(f.x+vx*u),pcy-(f.y+vy*u))<20){hbHit(f.dmg,f.src||'цепь',{stun:0.4,burn:2});}
          shake(3);SFX.grapple&&SFX.grapple();}
        if(f.t>f.warn+0.45)hbFx.splice(i,1);
        break;}
      case 'sweep':{    /* горизонтальный взмах: полоса по высоте, прыгни или пригнись под ней */
        if(f.t>=f.warn&&!f.fired){f.fired=true;shake(8);SFX.boom();
          if(player.y-player.h<f.y+f.h*0.5&&player.y>f.y-f.h*0.5&&Math.abs(pcx-f.x)<f.w)hbHit(f.dmg,f.src||'взмах',f.fx);}
        if(f.t>f.warn+0.5)hbFx.splice(i,1);
        break;}
      default:if(f.t>(f.life||2))hbFx.splice(i,1);
    }
  }
}
/* камера в бою: смещается к боссу, чтобы он и игрок были в кадре */
function hbCamBias(x,y){
  const H=hbFight();if(!H||G.bossCut)return null;const m=H.m,by=m.y-m.h*0.5;
  const vh=view.H/view.scale,k=clamp((Math.abs(by-y)-vh*0.18)/(vh*0.5),0,0.45);
  const kx=clamp((Math.abs(m.x-x)-view.W/view.scale*0.25)/(view.W/view.scale*0.6),0,0.3);
  /* игрок не должен уходить под экранные кнопки: смещение ограничено */
  const vw=view.W/view.scale,maxY=vh*(view.W<view.H?0.1:0.2),maxX=vw*0.2;
  return {x:x+clamp(lerp(0,m.x-x,kx),-maxX,maxX),y:y+clamp(lerp(0,by-y,k),-maxY,maxY)};
}
/* помощники для ИИ */
function hbFloorAt(x,yFrom){let ty=Math.floor(yFrom/TILE);const tx=Math.floor(x/TILE);for(let k=0;k<60;k++){if(isSolid(tx,ty+1)||getTile(tx,ty+1)===T_LAVA||isLiq(getTile(tx,ty+1)))return (ty+1)*TILE;ty++;}return yFrom;}
function hbPillar(x,yFrom,o){const fy=hbFloorAt(x,yFrom);hbFx.push(Object.assign({type:'pillar',t:0,x,y:fy,w:44,h:3*TILE,warn:0.8,dur:0.35,dmg:100,col:'#ff7a2a'},o||{}));}
function hbMeteor(x,y,o){hbFx.push(Object.assign({type:'meteor',t:0,x,y,warn:0.9,dmg:100,r:22,blast:64,maxY:y+60*TILE,col:'#ff7a2a'},o||{}));}
function hbZone(x,y,r,o){hbFx.push(Object.assign({type:'zone',t:0,x,y,r,warn:0.9,dur:4,dps:60,col:'#bfe8ff'},o||{}));}
function hbLine(x1,y1,x2,y2,life,col,w){hbFx.push({type:'line',t:0,x1,y1,x2,y2,life,col:col||'#ff5a3a',w:w||3});}
function hbWall(x,y,vx,o){hbFx.push(Object.assign({type:'wall',t:0,x,y,vx,h:50,life:4,dmg:100,col:'#e8e0cc',style:'bone'},o||{}));}
/* снаряд Владыки (рисуется особым образом по p.hbk) */
function hbShot(x,y,a,sp,dmg,hbk,o){
  const p=Object.assign({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:4,dmg,color:'#ff9a3c',size:6,owner:'mob',hbk,ghost:true},o||{});
  projectiles.push(p);return p;
}
/* миньоны: с них не падают души и добыча */
function hbMinion(id,x,y){const d=MOBDEFS.find(q=>q.id===id);if(!d||mobs.length>mobCap()+10)return null;const c=spawnMobAt(d,x,y);c.noSouls=true;c.hbMinion=true;c.provoked=30;return c;}
/* множитель урона по боссу: уязвимые моменты, броня */
function hbDmgMul(m){
  const B=m.b||{};let k=1;
  if(B.armor>0)k*=0.35;
  if(m.def.hb==='warden'&&B.phase>=3)k*=1.25;
  return k;
}
