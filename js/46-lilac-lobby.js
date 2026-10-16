'use strict';
/* ============================================================
   ЛИЛОВЫЕ НЕБЕСА — лобби «Деревня Вечного Рассвета» (G.dim===2)
   Этап 0: заготовка — рассветное небо, луг и строительные леса на
   местах будущих зданий. Здания в своём облике — этап 2.
   Здания и ширина лобби — BUILDINGS[2] / LOBBY_WS[2] в 24-lobby-mine-state.
   ============================================================ */
function llbRand(i){const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);}
function renderLilacLobby(){
  const W=view.W,H=view.H,sc=view.scale,cam=G.cam;
  const t=performance.now()/1000,low=settings.quality==='low';
  const HZ=H*0.62-cam.y*sc;
  const px=(k)=>-cam.x*sc*k;
  /* небо вечного рассвета */
  const sky=ctx.createLinearGradient(0,0,0,HZ);
  sky.addColorStop(0,'#2a1e54');sky.addColorStop(0.4,'#6a4a9a');sky.addColorStop(0.75,'#d08ab8');sky.addColorStop(1,'#ffcfb0');
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  /* бледные звёзды в вышине */
  if(!low)for(let i=0;i<40;i++){const x=((llbRand(i)*W*1.4+px(0.01))%W+W)%W,y=llbRand(i+50)*HZ*0.45;
    ctx.fillStyle='rgba(255,240,255,'+(0.15+0.25*Math.abs(Math.sin(t*0.6+i)))*(1-y/(HZ*0.5))+')';ctx.fillRect(x,y,1.5,1.5);}
  /* низкое солнце в дымке */
  {const sx=W*0.3+px(0.012),sy=HZ*0.78,R=Math.min(W,H)*0.07;
    ctx.save();ctx.globalCompositeOperation='lighter';softGlow(ctx,sx,sy,R*6,'#ffb0c8',0.5);softGlow(ctx,sx,sy,R*2.4,'#ffe0c0',0.6);ctx.restore();
    const sg=ctx.createRadialGradient(sx-R*0.3,sy-R*0.3,R*0.1,sx,sy,R);sg.addColorStop(0,'#fff8f0');sg.addColorStop(1,'#ffc0b0');
    ctx.fillStyle=sg;ctx.beginPath();ctx.arc(sx,sy,R,0,TAU);ctx.fill();}
  /* холмы трёх планов в лиловом тумане */
  const hills=(k,base,amp,col,seed,step)=>{const off=px(k);ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(0,H);
    for(let x=-step;x<=W+step;x+=step){const wx=(x-off)/step,i=Math.floor(wx),f=wx-i,a=llbRand(i+seed),b=llbRand(i+1+seed),s=f*f*(3-2*f);
      ctx.lineTo(x,base-amp*(a+(b-a)*s));}
    ctx.lineTo(W,H);ctx.closePath();ctx.fill();};
  hills(0.05,HZ-H*0.05,H*0.12,'#8a6aa8',11,90);
  {const fg=ctx.createLinearGradient(0,HZ-H*0.2,0,HZ);fg.addColorStop(0,'rgba(240,190,230,0)');fg.addColorStop(1,'rgba(240,190,230,.35)');ctx.fillStyle=fg;ctx.fillRect(0,HZ-H*0.2,W,H*0.2);}
  hills(0.12,HZ,H*0.07,'#6a5a90',23,70);
  hills(0.22,HZ+4,H*0.04,'#4e5a7a',37,55);
  /* мир: луг */
  ctx.setTransform(dpr*sc,0,0,dpr*sc,dpr*(W/2-cam.x*sc),dpr*(H*0.62-cam.y*sc));
  const x0w=cam.x-W/(2*sc)-80,x1w=cam.x+W/(2*sc)+80;
  const gnd=ctx.createLinearGradient(0,0,0,420);
  gnd.addColorStop(0,'#5a9a7a');gnd.addColorStop(0.05,'#3a6a5a');gnd.addColorStop(0.4,'#24304a');gnd.addColorStop(1,'#120c22');
  ctx.fillStyle=gnd;ctx.fillRect(x0w,0,x1w-x0w,700);
  ctx.fillStyle='#7ac0a0';ctx.fillRect(x0w,0,x1w-x0w,2);
  /* дорожка из светлой плитки */
  for(let x=Math.floor(x0w/40)*40;x<x1w;x+=40){const h0=llbRand(x/40);
    ctx.fillStyle=h0<0.5?'#c8b8d8':'#b8a8cc';ctx.beginPath();ctx.ellipse(x+20,10,17,4.5,0,0,TAU);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.25)';ctx.beginPath();ctx.ellipse(x+17,9,9,1.6,0,0,TAU);ctx.fill();}
  /* трава и цветы */
  const fc=['#ffb0d8','#fff0f8','#d8a8ff','#ffe8a0'];
  for(let x=Math.floor(x0w/14)*14;x<x1w;x+=14){const h0=llbRand(x*0.31+5),sw=Math.sin(t*1.6+x*0.06)*2;
    ctx.strokeStyle='#4a8a6a';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+sw,-8-h0*6);ctx.stroke();
    if(h0<0.35){ctx.fillStyle=fc[Math.floor(h0*40)%4];ctx.beginPath();ctx.arc(x+sw,-10-h0*6,2.4,0,TAU);ctx.fill();}}
  const glowList=[];
  for(const b of buildings)drawLilacBuildingStub(ctx,b,glowList,t);
  drawLobbyCrates(ctx);
  if(G.scene==='lobby')drawLobbyPlaceGhost(ctx);
  if(!G.cutHide)drawPlayerSprite(ctx,lobbyPlayer.x,lobbyPlayer.y,lobbyPlayer.animState,lobbyPlayer.anim,lobbyPlayer.facing,{tool:null,armor:player.armorLvl,pickLvl:player.pickLvl,torch:player.torchLvl,groundY:0});
  drawCrateLabels(ctx);
  drawGlowList(ctx,glowList,0.45);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  /* пыльца в воздухе */
  if(!low&&parts.length<partBudget*0.8&&Math.random()<0.12){
    const fx=cam.x+rnd(-W/(2*sc),W/(2*sc));spawnPart(fx,rnd(-120,-10),rnd(-8,8),rnd(-10,4),rnd(3,5),Math.random()<0.5?'#ffe8a0':'#ffd0f0',1.6,0);}
  {const vg=ctx.createRadialGradient(W/2,H*0.55,Math.min(W,H)*0.4,W/2,H*0.55,Math.max(W,H)*0.85);vg.addColorStop(0,'rgba(20,0,30,0)');vg.addColorStop(1,'rgba(20,0,30,.35)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);}
  drawParticles();drawFloats();
}
/* место будущего здания: строительные леса и табличка (портал — светящаяся арка) */
function drawLilacBuildingStub(g,b,glowList,t){
  g.save();g.translate(b.x,0);
  g.fillStyle='rgba(20,0,30,.25)';g.beginPath();g.ellipse(0,4,100,12,0,0,TAU);g.fill();
  if(b.id==='lportal'){
    /* арка из белого камня с лиловым свечением */
    const pulse=0.75+0.25*Math.sin(t*1.8);
    g.save();g.globalCompositeOperation='lighter';softGlow(g,0,-110,120,'#c58bff',0.5*pulse);g.restore();
    const ig=g.createRadialGradient(0,-105,10,0,-105,78);ig.addColorStop(0,'rgba(255,230,255,.95)');ig.addColorStop(0.5,'rgba(200,140,255,.75)');ig.addColorStop(1,'rgba(90,40,160,.6)');
    g.fillStyle=ig;g.beginPath();g.ellipse(0,-105,62,92,0,0,TAU);g.fill();
    g.strokeStyle='#e8e0f0';g.lineWidth=14;g.beginPath();g.ellipse(0,-105,70,100,0,0,TAU);g.stroke();
    g.strokeStyle='#a898c0';g.lineWidth=3;g.beginPath();g.ellipse(0,-105,77,107,0,0.2,Math.PI-0.2);g.stroke();
    g.strokeStyle='#fff';g.lineWidth=2;g.beginPath();g.ellipse(0,-105,64,94,0,Math.PI+0.4,Math.PI*1.6);g.stroke();
    glowList.push([b.x,-105,90,'#c58bff']);
  }else{
    /* леса: стойки, перекладины, доски */
    g.strokeStyle='#8a6a4a';g.lineWidth=5;g.lineCap='round';
    for(const sx of [-70,-20,30,70]){g.beginPath();g.moveTo(sx,0);g.lineTo(sx,-130);g.stroke();}
    g.lineWidth=4;for(const sy of [-40,-85,-128]){g.beginPath();g.moveTo(-76,sy);g.lineTo(76,sy);g.stroke();}
    g.strokeStyle='#6a4a32';g.lineWidth=3;g.beginPath();g.moveTo(-70,-40);g.lineTo(-20,-85);g.moveTo(30,-40);g.lineTo(70,-85);g.stroke();
    g.fillStyle='#b8946a';g.fillRect(-78,-44,156,5);g.fillRect(-78,-89,156,5);
    g.fillStyle='rgba(255,240,220,.35)';g.fillRect(-78,-44,156,1.2);g.fillRect(-78,-89,156,1.2);
    /* фонарик на стойке */
    const fl=0.85+0.15*Math.sin(t*3+b.x);g.fillStyle='#ffd8f0';g.beginPath();g.arc(-70,-136,5,0,TAU);g.fill();glowList.push([b.x-70,-136,40*fl,'#ffb8e8']);
  }
  g.font='800 14px system-ui,sans-serif';
  bSign(g,b.name.toUpperCase(),Math.max(110,g.measureText(b.name.toUpperCase()).width+30),b.id==='lportal'?-238:-172,'#f0d8ff',t,true);
  g.restore();
}
/* что открывает каждое здание деревни */
function lilacOpen(b){
  if(b.id==='lmine'){enterMine();return;}
  if(b.id==='lmarket'){UI.market();return;}
  if(b.id==='lportal'){UI.lportal();return;}
  UI.toast(b.name+' ещё строится — откроется в следующих этапах обновления');
}
UI.lportal=function(){
  const d=this.build('lportal',`
    <div class="card" style="max-width:440px;width:96vw;text-align:center;border-color:#a070d0">
      <h3 style="text-align:center">Лиловые врата</h3>
      <div class="lilacGate keyed open"></div>
      <p class="muted">Врата помнят дорогу домой. Куда вернуться?</p>
    </div>
    <button class="btn" id="lpEarth">🌄 На Землю надежды</button>
    <button class="btn" id="lpHell">🔥 В Ад</button>
    <button class="btn alt" id="lpBack">Закрыть</button>`);
  SFX.portal();
  d.querySelector('#lpEarth').onclick=()=>startCutscene(0);
  d.querySelector('#lpHell').onclick=()=>startCutscene(1);
  d.querySelector('#lpBack').onclick=()=>{SFX.uiBack();UI.close();};
};
/* Переход в Лиловые небеса и из них — пока без катсцены: вспышка и затемнение.
   Своя катсцена прибытия — этап 10. */
function lilacJump(to){
  UI.clear();resetAllInputs();
  SFX.portal();vib(60);
  switchDimension(to);
  const pb=buildings.find(b=>b.id==='lportal'||b.id==='portal3'||b.id==='portal');
  lobbyPlayer.x=pb?pb.x+(to===1?-150:-160):300;
  G.scene='lobby';G.cam.x=lobbyPlayer.x;G.cam.y=0;lobbyPlayer.animState='idle';lobbyPlayer.vy=0;lobbyPlayer.y=0;
  UI.toast(to===2?'🌸 Лиловые небеса':to===1?'🔥 Добро пожаловать в Ад':'🌄 Ты снова на Земле надежды');
  G.fadeIn=0.9;
  saveGame();
}
