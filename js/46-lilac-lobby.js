'use strict';
/* ============================================================
   ЛИЛОВЫЕ НЕБЕСА — лобби «Деревня Вечного Рассвета» (G.dim===2)
   Днём — розовый рассвет, пряничные домики, фонарики, качели.
   Ночью (lilNight в 48-lilac-village) деревня показывает правду:
   луна — огромный глаз, деревья открывают глаза, в окнах — улыбки,
   у лошадок карусели горят красные огоньки, качели качаются сами.
   Здания и ширина лобби — BUILDINGS[2] / LOBBY_WS[2] в 24-lobby-mine-state.
   ============================================================ */
function llbRand(i){const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);}
const LLB={blink:0};
/* смешивание цветов дня и ночи: понимает и '#rrggbb', и 'rgba(...)' */
function llbParse(c){if(c[0]==='#'){const v=parseInt(c.slice(1),16);return [(v>>16)&255,(v>>8)&255,v&255,1];}
  const m=c.match(/[\d.]+/g);return [+m[0],+m[1],+m[2],m.length>3?+m[3]:1];}
function llbMix(a,b,t){if(t<=0)return a;if(t>=1)return b;const A=llbParse(a),B=llbParse(b);
  if(A[3]===1&&B[3]===1)return mixHex(a,b,t);
  return 'rgba('+Math.round(A[0]+(B[0]-A[0])*t)+','+Math.round(A[1]+(B[1]-A[1])*t)+','+Math.round(A[2]+(B[2]-A[2])*t)+','+(A[3]+(B[3]-A[3])*t).toFixed(3)+')';}
function renderLilacLobby(){
  const W=view.W,H=view.H,sc=view.scale,cam=G.cam;
  const t=performance.now()/1000,low=settings.quality==='low',N=lilNight();
  const HZ=H*0.62-cam.y*sc;
  const px=(k)=>-cam.x*sc*k;
  const mx=(a,b)=>llbMix(a,b,N);
  /* 1. небо: розовый рассвет → лиловая ночь */
  const sky=ctx.createLinearGradient(0,0,0,HZ);
  sky.addColorStop(0,mx('#2e2268','#05020c'));sky.addColorStop(0.42,mx('#7a52a8','#1c0820'));sky.addColorStop(0.78,mx('#e294bc','#4a0e26'));sky.addColorStop(1,mx('#ffd2b4','#6a1a2a'));
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  /* звёзды: днём бледные, ночью яркие и мигают */
  if(!low)for(let i=0;i<70;i++){const x=((llbRand(i)*W*1.4+px(0.01))%W+W)%W,y=llbRand(i+50)*HZ*0.6,tw=0.5+0.5*Math.sin(t*(0.6+(i%5)*0.3)+i);
    ctx.fillStyle='rgba(255,240,255,'+((0.12+0.6*N)*tw*(1-y/(HZ*0.65))).toFixed(3)+')';ctx.fillRect(x,y,(i%9===0)?2:1.4,(i%9===0)?2:1.4);}
  /* 2. солнце днём, луна-глаз ночью */
  {const sx=W*0.3+px(0.012),sy=HZ*0.74,R=Math.min(W,H)*0.07;
    if(N<1){ctx.save();ctx.globalAlpha=1-N;ctx.globalCompositeOperation='lighter';softGlow(ctx,sx,sy,R*6,'#ffb0c8',0.5);softGlow(ctx,sx,sy,R*2.4,'#ffe0c0',0.6);ctx.restore();
      ctx.save();ctx.globalAlpha=1-N;const sg=ctx.createRadialGradient(sx-R*0.3,sy-R*0.3,R*0.1,sx,sy,R);sg.addColorStop(0,'#fff8f0');sg.addColorStop(1,'#ffc0b0');
      ctx.fillStyle=sg;ctx.beginPath();ctx.arc(sx,sy,R,0,TAU);ctx.fill();
      ctx.strokeStyle='rgba(255,230,210,.25)';ctx.lineWidth=2;for(let k=0;k<12;k++){const a=k/12*TAU+t*0.03;ctx.beginPath();ctx.moveTo(sx+Math.cos(a)*R*1.25,sy+Math.sin(a)*R*1.25);ctx.lineTo(sx+Math.cos(a)*R*(1.6+0.15*Math.sin(t+k)),sy+Math.sin(a)*R*(1.6+0.15*Math.sin(t+k)));ctx.stroke();}
      ctx.restore();}
    if(N>0){const ex=W*0.72+px(0.015),ey=HZ*0.3,ER=Math.min(W,H)*0.09;
      ctx.save();ctx.globalAlpha=N;ctx.globalCompositeOperation='lighter';softGlow(ctx,ex,ey,ER*4,'#ff4a5a',0.35);ctx.restore();
      ctx.save();ctx.globalAlpha=N;
      /* моргание: веко опускается раз в несколько секунд */
      const bl=((t*0.23)%1)>0.96?Math.sin((((t*0.23)%1)-0.96)/0.04*Math.PI):0;
      ctx.beginPath();ctx.ellipse(ex,ey,ER*1.25,ER*(0.8-0.78*bl),0,0,TAU);ctx.save();ctx.clip();
      const sg2=ctx.createRadialGradient(ex-ER*0.3,ey-ER*0.3,ER*0.1,ex,ey,ER*1.3);sg2.addColorStop(0,'#fff4ec');sg2.addColorStop(0.7,'#f0c8c0');sg2.addColorStop(1,'#a0505a');ctx.fillStyle=sg2;ctx.fillRect(ex-ER*1.4,ey-ER,ER*2.8,ER*2);
      ctx.strokeStyle='rgba(180,20,40,.5)';ctx.lineWidth=1.2;for(let k=0;k<7;k++){const a=k/7*TAU;ctx.beginPath();ctx.moveTo(ex+Math.cos(a)*ER*1.2,ey+Math.sin(a)*ER*0.75);ctx.quadraticCurveTo(ex+Math.cos(a+0.3)*ER*0.8,ey+Math.sin(a+0.3)*ER*0.5,ex+Math.cos(a)*ER*0.55,ey+Math.sin(a)*ER*0.4);ctx.stroke();}
      /* зрачок смотрит на шахтёра */
      const plx=(lobbyPlayer.x-cam.x)*sc+W/2,ply=HZ-40*sc,ang=Math.atan2(ply-ey,plx-ex),ix=ex+Math.cos(ang)*ER*0.35,iy=ey+Math.sin(ang)*ER*0.25;
      const ig=ctx.createRadialGradient(ix,iy,1,ix,iy,ER*0.48);ig.addColorStop(0,'#ffd040');ig.addColorStop(0.5,'#c03040');ig.addColorStop(1,'#4a0a1a');ctx.fillStyle=ig;ctx.beginPath();ctx.arc(ix,iy,ER*0.48,0,TAU);ctx.fill();
      ctx.fillStyle='#0a0006';ctx.beginPath();ctx.ellipse(ix,iy,ER*0.1,ER*0.36,0,0,TAU);ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.7)';ctx.beginPath();ctx.arc(ix-ER*0.18,iy-ER*0.2,ER*0.07,0,TAU);ctx.fill();
      ctx.restore();ctx.strokeStyle='rgba(60,0,20,.8)';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(ex,ey,ER*1.25,ER*(0.8-0.78*bl),0,0,TAU);ctx.stroke();
      ctx.restore();}}
  /* 3. облака */
  for(let L=0;L<2;L++){const per=W+600,spd=6+L*5;
    for(let i=0;i<4;i++){const x=((llbRand(i*7+L)*per+t*spd+px(0.02+L*0.02))%per+per)%per-300,y=HZ*(0.12+L*0.2+llbRand(i+L*9)*0.12),s=(0.8+llbRand(i*3)*0.6)*(1+L*0.3);
      const c1=mx(L?'#ffd8ec':'#f0c0e0','#3a1428'),c2=mx(L?'#d898c8':'#b878b8','#1a0814');
      for(let k=0;k<5;k++){const cx=x+(k-2)*28*s,cy=y-Math.abs(k-2)*-4*s-(k%2)*8*s,r=(26-Math.abs(k-2)*5)*s;
        const gr=ctx.createLinearGradient(0,cy-r,0,cy+r);gr.addColorStop(0,c1);gr.addColorStop(1,c2);ctx.globalAlpha=0.7;ctx.fillStyle=gr;ctx.beginPath();ctx.arc(cx,cy,r,0,TAU);ctx.fill();}
      ctx.globalAlpha=1;}}
  /* 4. холмы с крышами пряничных домиков вдали */
  const hills=(k,base,amp,col,seed,step,houses)=>{const off=px(k);ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(0,H);
    for(let x=-step;x<=W+step;x+=step){const wx=(x-off)/step,i=Math.floor(wx),f=wx-i,a=llbRand(i+seed),b=llbRand(i+1+seed),s=f*f*(3-2*f);ctx.lineTo(x,base-amp*(a+(b-a)*s));}
    ctx.lineTo(W,H);ctx.closePath();ctx.fill();
    if(houses){for(let x=((off%160)+160)%160-160;x<W+160;x+=160){const i=Math.round((x-off)/160);if(llbRand(i+seed*3)<0.45)continue;
      const wx=(x-off)/step,ii=Math.floor(wx),f=wx-ii,a=llbRand(ii+seed),b=llbRand(ii+1+seed),s=f*f*(3-2*f),hy=base-amp*(a+(b-a)*s)+4;
      ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x-12,hy);ctx.lineTo(x-12,hy-14);ctx.lineTo(x,hy-24);ctx.lineTo(x+12,hy-14);ctx.lineTo(x+12,hy);ctx.closePath();ctx.fill();
      const lit=N>0.3?(Math.sin(t*0.7+i)>-0.3):llbRand(i+5)<0.6;if(lit){ctx.fillStyle=N>0.5?'rgba(255,90,70,.85)':'rgba(255,220,150,.75)';ctx.fillRect(x-4,hy-11,4,5);}}}};
  hills(0.05,HZ-H*0.05,H*0.12,mx('#9a72b8','#22102a'),11,90,false);
  {const fg=ctx.createLinearGradient(0,HZ-H*0.2,0,HZ);fg.addColorStop(0,mx('rgba(255,200,230,0)','rgba(80,10,40,0)'));fg.addColorStop(1,mx('rgba(255,200,230,.35)','rgba(80,10,40,.35)'));ctx.fillStyle=fg;ctx.fillRect(0,HZ-H*0.2,W,H*0.2);}
  hills(0.12,HZ,H*0.07,mx('#7a62a0','#180a1e'),23,70,true);
  hills(0.22,HZ+4,H*0.035,mx('#5a7a7a','#120a14'),37,55,false);
  /* ===== мир: луг, дорожка, декор, здания ===== */
  ctx.setTransform(dpr*sc,0,0,dpr*sc,dpr*(W/2-cam.x*sc),dpr*(H*0.62-cam.y*sc));
  const x0w=cam.x-W/(2*sc)-120,x1w=cam.x+W/(2*sc)+120;
  const gnd=ctx.createLinearGradient(0,0,0,420);
  gnd.addColorStop(0,mx('#62a682','#1a2a22'));gnd.addColorStop(0.05,mx('#3e7260','#121a18'));gnd.addColorStop(0.4,mx('#26324c','#0a0a14'));gnd.addColorStop(1,'#0e0818');
  ctx.fillStyle=gnd;ctx.fillRect(x0w,0,x1w-x0w,700);
  ctx.fillStyle=mx('#8ad0aa','#2a3a30');ctx.fillRect(x0w,0,x1w-x0w,2);
  const glowList=[];
  llbUnderground(ctx,x0w,x1w,t,N,glowList,mx);
  llbScenery(ctx,x0w,x1w,t,N,glowList);
  /* дорожка из светлой плитки */
  for(let x=Math.floor(x0w/40)*40;x<x1w;x+=40){const h0=llbRand(x/40);
    ctx.fillStyle=mx(h0<0.5?'#cdbcdc':'#bcaacc','#3a3040');ctx.beginPath();ctx.ellipse(x+20,10,17,4.5,0,0,TAU);ctx.fill();
    ctx.fillStyle=mx('rgba(255,255,255,.28)','rgba(255,255,255,.06)');ctx.beginPath();ctx.ellipse(x+16,8.6,9,1.6,0,0,TAU);ctx.fill();
    ctx.fillStyle='rgba(0,0,0,.18)';ctx.beginPath();ctx.ellipse(x+22,12.4,13,1.4,0,0,Math.PI);ctx.fill();}
  for(const b of buildings)drawLilacBuilding(ctx,b,glowList,t,N);
  /* трава и цветы перед зданиями */
  const fc=N>0.5?['#6a3a4a','#5a4a5a','#4a2a3a','#6a5a3a']:['#ffb0d8','#fff0fa','#e0b0ff','#ffe0a0'];
  for(let x=Math.floor(x0w/14)*14;x<x1w;x+=14){const h0=llbRand(x*0.31+5),sw=Math.sin(t*1.6+x*0.06)*2;
    ctx.strokeStyle=mx('#4a9a6e','#1e3a2a');ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x+sw,-8-h0*6);ctx.stroke();
    if(h0<0.3){ctx.fillStyle=fc[Math.floor(h0*40)%4];ctx.beginPath();ctx.arc(x+sw,-10-h0*6,2.4,0,TAU);ctx.fill();ctx.fillStyle=mx('#ffe070','#4a3020');ctx.beginPath();ctx.arc(x+sw,-10-h0*6,0.9,0,TAU);ctx.fill();}}
  drawLobbyCrates(ctx);
  if(G.scene==='lobby')drawLobbyPlaceGhost(ctx);
  if(!G.cutHide)drawPlayerSprite(ctx,lobbyPlayer.x,lobbyPlayer.y,lobbyPlayer.animState,lobbyPlayer.anim,lobbyPlayer.facing,{tool:null,armor:player.armorLvl,pickLvl:player.pickLvl,torch:player.torchLvl,groundY:0});
  if(!G.cutHide)lgLobbyPet(ctx);
  drawCrateLabels(ctx);
  /* ночью — красные глаза в траве */
  if(N>0.2){for(let x=Math.floor(x0w/170)*170;x<x1w;x+=170){const i=x/170|0;if(llbRand(i+77)<0.4)continue;
    const ph=(t*0.35+llbRand(i)*7)%3;if(ph>2.2)continue;const ex=x+llbRand(i+3)*120,ey=-6-llbRand(i+4)*6,a=N*Math.min(1,ph*3,(2.2-ph)*3);
    ctx.fillStyle='rgba(255,40,50,'+a.toFixed(2)+')';ctx.beginPath();ctx.ellipse(ex,ey,2,1.3,0,0,TAU);ctx.ellipse(ex+7,ey,2,1.3,0,0,TAU);ctx.fill();glowList.push([ex+3,ey,12,'#ff2030']);}}
  /* ночь: затемнение мира поверх, огни светят сквозь */
  if(N>0){ctx.save();ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='rgba(14,2,22,'+(0.45*N).toFixed(3)+')';ctx.fillRect(0,0,W,H);ctx.restore();}
  drawGlowList(ctx,glowList,0.45+0.25*N);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  /* пыльца днём, тёмные лепестки ночью */
  if(!low&&parts.length<partBudget*0.8&&Math.random()<0.12){
    const fx=cam.x+rnd(-W/(2*sc),W/(2*sc));spawnPart(fx,rnd(-140,-10),rnd(-8,8),rnd(-10,4),rnd(3,5),N>0.5?(Math.random()<0.5?'#6a1a3a':'#3a2a4a'):(Math.random()<0.5?'#ffe8a0':'#ffd0f0'),1.6,0);}
  {const vg=ctx.createRadialGradient(W/2,H*0.55,Math.min(W,H)*0.4,W/2,H*0.55,Math.max(W,H)*0.85);vg.addColorStop(0,'rgba(20,0,30,0)');vg.addColorStop(1,'rgba(20,0,30,'+(0.32+0.25*N).toFixed(2)+')');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);}
  drawParticles();drawFloats();
}

/* ---------- декор между зданиями: домики, деревья с глазами, фонари, качели ---------- */
function llbNearB(x,r){for(const b of buildings)if(Math.abs(x-b.x)<r)return true;return false;}
function llbScenery(g,x0,x1,t,N,glowList){
  const mx=(a,b)=>llbMix(a,b,N);
  /* задний ряд: пряничные домики (стоят глубже, мельче) */
  for(let x=Math.floor(x0/230)*230;x<x1;x+=230){const i=x/230|0;if(llbNearB(x,170)||llbRand(i+11)<0.25)continue;
    const w=64+llbRand(i+2)*26,hh=50+llbRand(i+3)*20,hx=x+llbRand(i+4)*40,wall=mx(['#d8a070','#e0b080','#c89060'][(i%3+3)%3],'#3a2420'),roof=mx(['#d05a8a','#8a5ad0','#5aa0b0'][(i%3+3)%3],'#2a1020');
    g.save();g.translate(hx,-2);
    g.fillStyle=shadeHex(wall,-0.3);g.fillRect(-w/2,-hh,w,hh);g.fillStyle=wall;g.fillRect(-w/2,-hh,w-6,hh);
    g.fillStyle=shadeHex(wall,0.18);g.fillRect(-w/2,-hh,4,hh);
    /* глазурь на крыше */
    g.fillStyle=shadeHex(roof,-0.3);g.beginPath();g.moveTo(-w/2-10,-hh+2);g.lineTo(0,-hh-38);g.lineTo(w/2+10,-hh+2);g.closePath();g.fill();
    g.fillStyle=roof;g.beginPath();g.moveTo(-w/2-8,-hh);g.lineTo(0,-hh-36);g.lineTo(w/2+4,-hh-2);g.closePath();g.fill();
    g.fillStyle=mx('#fff8f4','#8a7a80');
    g.beginPath();g.moveTo(-w/2-8,-hh);for(let k=0;k<=8;k++){const xx=-w/2-8+k*(w+12)/8;g.quadraticCurveTo(xx-(w+12)/16,-hh+6,xx,-hh);}g.lineTo(w/2+4,-hh-3);g.lineTo(-w/2-8,-hh-3);g.closePath();g.fill();
    /* окна: днём тёплый свет, ночью — силуэт с широкой улыбкой */
    for(let k=0;k<2;k++){const wx=-w/2+12+k*(w-34),wy=-hh+14;const lit=N>0.4||llbRand(i*3+k)<0.7;
      g.fillStyle='#3a2420';g.fillRect(wx-1,wy-1,14,16);g.fillStyle=lit?(N>0.5?'#ff8a5a':'#ffe0a0'):'#4a3a50';g.fillRect(wx,wy,12,14);
      if(lit)glowList.push([hx+wx+6,-2+wy+7,26,N>0.5?'#ff5a3a':'#ffd080']);
      if(N>0.5&&llbRand(i*5+k)<0.6){g.fillStyle='rgba(20,0,10,.85)';g.beginPath();g.arc(wx+6,wy+6,4,0,TAU);g.fill();g.fillRect(wx+2,wy+9,8,5);
        g.strokeStyle='#ffe0d0';g.lineWidth=0.9;g.beginPath();g.arc(wx+6,wy+6,2.6,0.2,Math.PI-0.2);g.stroke();}
      g.fillStyle=mx('#fff0f4','#6a5a60');g.fillRect(wx+5.5,wy,1,14);g.fillRect(wx,wy+6.5,12,1);}
    g.fillStyle=mx('#7a4a3a','#1a0e0c');g.fillRect(-6,-22,13,22);g.fillStyle=mx('#ffd060','#6a3a20');g.beginPath();g.arc(4,-11,1.3,0,TAU);g.fill();
    g.restore();}
  /* деревья с глазами */
  for(let x=Math.floor(x0/310)*310+120;x<x1;x+=310){const i=x/310|0;if(llbNearB(x,150)||llbRand(i+21)<0.3)continue;
    const R=36+llbRand(i)*14,ty=-70-llbRand(i+1)*20,sw=Math.sin(t*0.6+i)*2,leaf=mx(['#e080b8','#b890e8','#f0a0c0'][(i%3+3)%3],'#2a1020');
    g.strokeStyle=mx('#6a4a3a','#1a0c0a');g.lineWidth=9;g.lineCap='round';g.beginPath();g.moveTo(x,0);g.quadraticCurveTo(x+6,ty*0.5,x+sw,ty+10);g.stroke();
    g.lineWidth=4;g.beginPath();g.moveTo(x+3,ty*0.55);g.lineTo(x-18,ty*0.7);g.stroke();
    const blob=(dx,dy,r,c)=>{g.fillStyle=c;g.beginPath();g.arc(x+sw+dx,ty+dy,r,0,TAU);g.fill();};
    blob(6,6,R*0.85,shadeHex(leaf,-0.3));blob(-R*0.5,4,R*0.6,shadeHex(leaf,-0.15));blob(0,0,R*0.8,leaf);blob(R*0.45,-6,R*0.55,leaf);blob(-R*0.2,-R*0.35,R*0.5,shadeHex(leaf,0.15));
    g.fillStyle=mx('rgba(255,255,255,.35)','rgba(255,255,255,.05)');for(let k=0;k<6;k++){g.beginPath();g.arc(x+sw-R*0.6+llbRand(i*9+k)*R*1.2,ty-R*0.5+llbRand(i*7+k)*R,2,0,TAU);g.fill();}
    /* глаза в кроне: днём — едва заметные щёлки, ночью открыты и следят */
    const open=N>0.4?Math.min(1,(N-0.4)*2.5):(((t*0.11+i*0.37)%1)>0.97?0.6:0);
    for(let k=0;k<2;k++){const ex=x+sw-8+k*16,ey=ty-2;
      g.fillStyle='rgba(30,0,20,.5)';g.beginPath();g.ellipse(ex,ey,5,0.8+3.4*open,0,0,TAU);g.fill();
      if(open>0.05){g.fillStyle='#fff0c0';g.beginPath();g.ellipse(ex,ey,4.2,3*open,0,0,TAU);g.fill();
        const ax=lobbyPlayer.x-ex,al=Math.abs(ax)+1;g.fillStyle=N>0.5?'#c01020':'#2a1a10';g.beginPath();g.arc(ex+ax/al*1.8,ey,1.7*open,0,TAU);g.fill();
        if(N>0.5)glowList.push([ex,ey,12,'#ffe080']);}}
  }
  /* фонари на столбиках */
  for(let x=Math.floor(x0/140)*140+70;x<x1;x+=140){if(llbNearB(x,120))continue;const i=x/140|0;
    g.fillStyle=mx('#5a4a6a','#1a1420');g.fillRect(x-2,-58,4,58);g.fillRect(x-8,-60,16,3);
    const sw=Math.sin(t*1.3+i)*2;g.strokeStyle=mx('#5a4a6a','#1a1420');g.lineWidth=1;g.beginPath();g.moveTo(x+6,-58);g.lineTo(x+6+sw,-50);g.stroke();
    const col=N>0.5?'#ff3a4a':['#ffb0d8','#ffe0a0','#c8b0ff'][(i%3+3)%3];
    const lg=g.createRadialGradient(x+5+sw,-44,1,x+6+sw,-42,8);lg.addColorStop(0,'#fff8f0');lg.addColorStop(0.6,col);lg.addColorStop(1,shadeHex(col,-0.4));g.fillStyle=lg;g.beginPath();g.ellipse(x+6+sw,-42,6,8,0,0,TAU);g.fill();
    g.strokeStyle='rgba(80,30,40,.35)';g.lineWidth=0.6;g.beginPath();g.ellipse(x+6+sw,-42,3,8,0,0,TAU);g.stroke();
    g.fillStyle=mx('#5a4a6a','#1a1420');g.fillRect(x+3+sw,-51,6,2);g.fillRect(x+3+sw,-34.6,6,2);
    glowList.push([x+6+sw,-42,40,col]);}
  /* качели на ветке: ночью раскачиваются сильнее — сами по себе */
  for(let x=Math.floor(x0/1150)*1150+640;x<x1;x+=1150){if(llbNearB(x,140))continue;
    g.strokeStyle=mx('#6a4a3a','#1a0c0a');g.lineWidth=11;g.lineCap='round';g.beginPath();g.moveTo(x-40,0);g.quadraticCurveTo(x-34,-80,x-20,-120);g.stroke();
    g.lineWidth=6;g.beginPath();g.moveTo(x-24,-112);g.quadraticCurveTo(x+20,-130,x+60,-118);g.stroke();
    const leaf=mx('#c890e0','#241020');for(let k=0;k<5;k++){g.fillStyle=k%2?leaf:shadeHex(leaf,-0.2);g.beginPath();g.arc(x-36+k*24,-128-Math.sin(k)*10,26,0,TAU);g.fill();}
    const amp=0.25+0.35*N,a=Math.sin(t*(1.1+0.6*N))*amp,px2=x+28,py=-114,L=86;
    const sx=px2+Math.sin(a)*L,sy=py+Math.cos(a)*L;
    g.strokeStyle=mx('#d8c8b0','#5a5050');g.lineWidth=1.4;g.beginPath();g.moveTo(px2-10,py);g.lineTo(sx-10,sy);g.moveTo(px2+10,py);g.lineTo(sx+10,sy);g.stroke();
    g.save();g.translate(sx,sy);g.rotate(a);g.fillStyle=mx('#c8805a','#3a2018');g.fillRect(-14,-2,28,5);g.fillStyle=mx('#e8a070','#4a2a20');g.fillRect(-14,-2,28,1.6);g.restore();}
}

/* ---------- здания деревни ---------- */
function drawLilacBuilding(g,b,glowList,t,N){
  const x=b.x,mx=(a,c)=>llbMix(a,c,N),gpush=(...arr)=>{for(const q of arr)glowList.push([x+q[0],q[1],q[2],q[3]]);};
  g.save();g.translate(x,0);
  g.fillStyle='rgba(20,0,30,.28)';g.beginPath();g.ellipse(0,4,112,13,0,0,TAU);g.fill();
  let sign=b.name.toUpperCase(),sy=-200;
  if(b.id==='lmine'){
    /* цветущий холм с входом под белой шпалерой, увитой глицинией */
    const hg=g.createLinearGradient(0,-170,0,0);hg.addColorStop(0,mx('#7ac89a','#22382c'));hg.addColorStop(1,mx('#3e7a5e','#101a14'));
    g.fillStyle=hg;g.beginPath();g.moveTo(-122,0);g.quadraticCurveTo(-116,-110,-50,-150);g.quadraticCurveTo(0,-178,52,-150);g.quadraticCurveTo(116,-110,122,0);g.closePath();g.fill();
    g.fillStyle=mx('rgba(255,255,255,.18)','rgba(255,255,255,.04)');g.beginPath();g.moveTo(-100,-60);g.quadraticCurveTo(-90,-120,-40,-146);g.quadraticCurveTo(-80,-110,-86,-50);g.closePath();g.fill();
    for(let k=0;k<16;k++){const fx=-100+llbRand(k)*200,fy=-20-llbRand(k+30)*120;if(Math.abs(fx)<52&&fy>-130)continue;g.fillStyle=(N>0.5?['#5a3a4a','#4a3a5a']:['#ffb0d8','#fff0fa','#ffe08a','#d8a8ff'])[k%(N>0.5?2:4)];g.beginPath();g.arc(fx,fy,2.6,0,TAU);g.fill();}
    const dg=g.createLinearGradient(0,-120,0,0);dg.addColorStop(0,'#0a0412');dg.addColorStop(1,mx('#2a1a3a','#100616'));g.fillStyle=dg;
    g.beginPath();g.moveTo(-40,0);g.lineTo(-40,-88);g.quadraticCurveTo(-40,-126,0,-126);g.quadraticCurveTo(40,-126,40,-88);g.lineTo(40,0);g.closePath();g.fill();
    if(N>0.4){const a=Math.min(1,(N-0.4)*2);g.fillStyle='rgba(255,220,120,'+a+')';g.beginPath();g.ellipse(-8,-60,3,1.6,0,0,TAU);g.ellipse(8,-60,3,1.6,0,0,TAU);g.fill();gpush([0,-60,18,'#ffd060']);}
    else gpush([0,-40,50,'#b080ff']);
    /* шпалера */
    g.strokeStyle=mx('#fff6f0','#8a8090');g.lineWidth=5;g.beginPath();g.moveTo(-50,0);g.lineTo(-50,-92);g.quadraticCurveTo(-50,-140,0,-140);g.quadraticCurveTo(50,-140,50,-92);g.lineTo(50,0);g.stroke();
    g.strokeStyle=mx('rgba(200,180,200,.9)','#4a404a');g.lineWidth=1.5;for(let k=0;k<7;k++){const yy=-12-k*14;g.beginPath();g.moveTo(-55,yy);g.lineTo(-45,yy-8);g.moveTo(45,yy-8);g.lineTo(55,yy);g.stroke();}
    for(let k=0;k<9;k++){const a=Math.PI+k/8*Math.PI,ax=Math.cos(a)*50,ay=-92+Math.sin(a)*48,n=4+(k%3),sw=Math.sin(t*1.2+k)*1.5;
      for(let q=0;q<n;q++){const r=3.2*(1-q/n*0.5);g.fillStyle=N>0.5?(q%2?'#3a2a4a':'#2a1a3a'):(q%2?'#b890e8':'#d8b0ff');g.beginPath();g.arc(ax+sw*q/n,ay+4+q*4.4,r,0,TAU);g.fill();}}
    /* рельсы и вагонетка с цветами */
    g.fillStyle=mx('#7a5a4a','#2a1a14');for(let i=-30;i<130;i+=14)g.fillRect(i,-3,7,5);
    g.fillStyle=mx('#c8c0d0','#4a4450');g.fillRect(-34,-5,170,2);g.fillRect(-34,-1,170,2);
    g.fillStyle=mx('#8a6a8a','#2a1a2a');g.beginPath();g.moveTo(58,-16);g.lineTo(106,-16);g.lineTo(100,-34);g.lineTo(64,-34);g.closePath();g.fill();
    g.fillStyle=mx('#a888a8','#3a2a3a');g.fillRect(58,-22,48,3);
    for(let k=0;k<6;k++){g.fillStyle=N>0.5?'#4a2a3a':['#ff9ac0','#ffe08a','#c8a0ff'][k%3];g.beginPath();g.arc(66+k*7,-36+(k%2)*2,4.4,0,TAU);g.fill();}
    g.fillStyle='#222';g.beginPath();g.arc(70,-8,6,0,TAU);g.arc(94,-8,6,0,TAU);g.fill();g.fillStyle='#888';g.beginPath();g.arc(70,-8,2,0,TAU);g.arc(94,-8,2,0,TAU);g.fill();
    sy=-196;
  }else if(b.id==='lfurnace'){
    /* перегонный куб: кирпичный очаг, медный котёл, лебединая шея, стеклянный змеевик, банка с эссенцией */
    const act=lstill().q.length>0;
    g.fillStyle=mx('#a85a5a','#3a1a1a');g.fillRect(-92,-62,120,62);
    for(let r=0;r<4;r++)for(let k=0;k<5;k++){g.fillStyle=mx(((r+k)%2)?'#c8706a':'#b8605a','#2a1414');g.fillRect(-90+k*24+(r%2?10:0),-60+r*15,21,12);g.fillStyle='rgba(255,220,210,.18)';g.fillRect(-90+k*24+(r%2?10:0),-60+r*15,21,1.4);}
    g.fillStyle='#1a0810';g.beginPath();g.moveTo(-58,0);g.lineTo(-58,-28);g.quadraticCurveTo(-32,-46,-6,-28);g.lineTo(-6,0);g.closePath();g.fill();
    const f=0.75+0.25*Math.sin(t*6);for(let k=0;k<4;k++){const fh=16+Math.sin(t*9+k*2)*5;g.fillStyle=k%2?'rgba(255,220,250,.95)':'rgba(220,90,220,.9)';g.beginPath();g.moveTo(-52+k*12,0);g.quadraticCurveTo(-47+k*12,-fh*1.4,-42+k*12,0);g.closePath();g.fill();}
    gpush([-32,-14,70*f,'#e070ff']);
    /* медный котёл */
    const cu=g.createRadialGradient(-50,-120,6,-32,-100,52);cu.addColorStop(0,mx('#ffd0a0','#8a5a3a'));cu.addColorStop(0.45,mx('#d07a3a','#5a2a14'));cu.addColorStop(1,mx('#6a2a10','#200a04'));
    g.fillStyle=cu;g.beginPath();g.arc(-32,-100,46,0,TAU);g.fill();
    g.strokeStyle=mx('#8a3a14','#2a0a04');g.lineWidth=4;g.beginPath();g.ellipse(-32,-92,44,10,0,0,Math.PI);g.stroke();
    g.fillStyle=mx('#ffe0b0','#6a4a2a');for(let k=0;k<7;k++){const a=Math.PI*(0.1+k*0.13);g.beginPath();g.arc(-32+Math.cos(a)*44,-92+Math.sin(a)*10,1.8,0,TAU);g.fill();}
    g.fillStyle=mx('rgba(255,255,255,.4)','rgba(255,255,255,.08)');g.beginPath();g.ellipse(-50,-122,12,6,-0.6,0,TAU);g.fill();
    /* горлышко и лебединая шея */
    g.fillStyle=mx('#c8703a','#4a2010');g.fillRect(-40,-158,16,14);g.fillStyle=mx('#e09050','#5a2a14');g.fillRect(-44,-162,24,5);
    g.strokeStyle=mx('#c8703a','#4a2010');g.lineWidth=7;g.lineCap='round';g.beginPath();g.moveTo(-32,-160);g.quadraticCurveTo(-20,-200,30,-176);g.quadraticCurveTo(54,-164,58,-120);g.stroke();
    g.strokeStyle=mx('rgba(255,220,170,.6)','rgba(255,220,170,.1)');g.lineWidth=1.6;g.beginPath();g.moveTo(-34,-162);g.quadraticCurveTo(-22,-201,29,-178);g.stroke();
    /* стеклянный цилиндр со змеевиком */
    g.fillStyle=mx('rgba(200,230,255,.28)','rgba(60,80,120,.25)');g.fillRect(42,-122,34,70);
    g.strokeStyle=mx('rgba(230,245,255,.8)','rgba(120,140,170,.5)');g.lineWidth=1.5;g.strokeRect(42,-122,34,70);
    g.strokeStyle=mx('#d88a50','#4a2010');g.lineWidth=3;g.beginPath();for(let k=0;k<=24;k++){const yy=-118+k*2.6,xx=59+Math.sin(k*0.9)*12;k?g.lineTo(xx,yy):g.moveTo(xx,yy);}g.stroke();
    g.fillStyle=mx('rgba(255,255,255,.5)','rgba(255,255,255,.1)');g.fillRect(45,-118,3,62);
    g.fillStyle=mx('#8a6a5a','#2a1a14');g.fillRect(38,-52,42,6);g.fillRect(44,-46,4,46);g.fillRect(70,-46,4,46);
    /* капли в банку */
    const ph=(t*1.4)%1;g.fillStyle=act?'#e8b0ff':'rgba(200,180,220,.5)';if(act){g.beginPath();g.arc(59,-44+ph*20,2,0,TAU);g.fill();}
    const jg=g.createLinearGradient(48,-22,70,0);jg.addColorStop(0,'rgba(240,210,255,.7)');jg.addColorStop(1,'rgba(150,90,220,.7)');
    g.fillStyle=mx('rgba(220,240,255,.35)','rgba(80,90,120,.3)');g.fillRect(48,-24,22,24);g.fillStyle=jg;g.fillRect(49,-14+(act?-4*Math.sin(t):0),20,14+(act?4*Math.sin(t):0));
    g.fillStyle=mx('#c8a080','#3a2a1a');g.fillRect(46,-27,26,4);
    if(act)gpush([59,-10,30,'#d090ff']);
    if(settings.quality!=='low'&&Math.random()<(act?0.3:0.08))spawnPart(x-32+rnd(-6,6),-170,rnd(-6,6),rnd(-40,-20),2.4,N>0.5?'#5a4a6a':'#fff0ff',3.4,-6);
    g.fillStyle=act?'#f0c8ff':mx('#a898b8','#6a5a7a');g.font='800 11px system-ui';g.textAlign='center';g.fillText(act?'перегонка: '+lstill().q.length:'куб свободен',112,-8);
    sy=-238;
  }else if(b.id==='lforge'){
    /* кузница Зари: фахверковый пряничный домик, солнце над входом, золотой горн */
    g.fillStyle=mx('#f0dcc0','#4a3a30');g.fillRect(-104,-120,208,120);
    g.fillStyle=mx('#d8c0a0','#3a2c24');g.fillRect(84,-120,20,120);
    g.strokeStyle=mx('#7a4a2a','#1a0e08');g.lineWidth=6;
    g.beginPath();g.moveTo(-104,-120);g.lineTo(104,-120);g.moveTo(-104,-60);g.lineTo(-60,-60);g.moveTo(60,-60);g.lineTo(104,-60);
    g.moveTo(-104,-120);g.lineTo(-60,-60);g.moveTo(-60,-120);g.lineTo(-104,-60);g.moveTo(104,-120);g.lineTo(60,-60);g.moveTo(60,-120);g.lineTo(104,-60);g.stroke();
    g.fillStyle=mx('#c0507a','#2a0a18');g.beginPath();g.moveTo(-124,-116);g.lineTo(0,-188);g.lineTo(124,-116);g.closePath();g.fill();
    g.fillStyle=mx('#e070a0','#3a1022');g.beginPath();g.moveTo(-118,-118);g.lineTo(0,-184);g.lineTo(0,-118);g.closePath();g.fill();
    g.fillStyle=mx('#fff8f4','#7a6a70');g.beginPath();g.moveTo(-124,-116);for(let k=0;k<=12;k++){const xx=-124+k*248/12;g.quadraticCurveTo(xx-10,-106,xx,-116);}g.lineTo(124,-120);g.lineTo(-124,-120);g.closePath();g.fill();
    g.fillStyle=mx('#8a6a5a','#2a1a14');g.fillRect(56,-210,24,50);g.fillStyle=mx('#a08070','#3a2a20');g.fillRect(52,-214,32,8);
    if(settings.quality!=='low'&&Math.random()<0.2)spawnPart(x+68,-220,rnd(-6,6),rnd(-40,-20),2.6,N>0.5?'#3a2a3a':'#ffe8b0',3.6,-6);
    /* солнце-эмблема */
    {const sx=0,sy2=-148,rr=16;g.save();g.translate(sx,sy2);g.rotate(t*0.2);g.fillStyle=mx('#ffd040','#6a4a1a');for(let k=0;k<12;k++){g.rotate(TAU/12);g.beginPath();g.moveTo(-3,-rr);g.lineTo(0,-rr-9);g.lineTo(3,-rr);g.closePath();g.fill();}g.restore();
      const sg=g.createRadialGradient(sx-5,sy2-5,2,sx,sy2,rr);sg.addColorStop(0,mx('#fff8c0','#8a7a40'));sg.addColorStop(1,mx('#e8a020','#4a2a08'));g.fillStyle=sg;g.beginPath();g.arc(sx,sy2,rr,0,TAU);g.fill();
      if(N>0.5){g.fillStyle='#2a0a0a';g.beginPath();g.arc(sx-5,sy2-2,2,0,TAU);g.arc(sx+5,sy2-2,2,0,TAU);g.fill();g.strokeStyle='#2a0a0a';g.lineWidth=1.4;g.beginPath();g.arc(sx,sy2+3,6,0.2,Math.PI-0.2);g.stroke();}
      gpush([0,-148,40,'#ffd040']);}
    /* открытая мастерская */
    g.fillStyle='#1a0e10';g.fillRect(-60,-96,120,96);
    const hot=0.7+0.3*Math.sin(t*5);const fg=g.createRadialGradient(-30,-20,4,-30,-20,70);fg.addColorStop(0,'rgba(255,220,120,'+(0.7*hot)+')');fg.addColorStop(1,'rgba(255,140,40,0)');g.fillStyle=fg;g.fillRect(-60,-96,120,96);
    g.fillStyle=mx('#8a6a5a','#2a1a14');g.fillRect(-54,-36,46,36);g.fillStyle=mx('#a08070','#3a2a20');g.fillRect(-58,-42,54,7);
    for(let k=0;k<3;k++){const fh=12+Math.sin(t*11+k*2)*4;g.fillStyle=k%2?'rgba(255,240,170,.95)':'rgba(255,170,40,.9)';g.beginPath();g.moveTo(-48+k*14,-42);g.quadraticCurveTo(-42+k*14,-42-fh*1.5,-36+k*14,-42);g.closePath();g.fill();}
    g.fillStyle=mx('#5a5a6a','#1a1a20');g.fillRect(14,-20,24,20);g.beginPath();g.moveTo(2,-34);g.lineTo(52,-34);g.lineTo(58,-28);g.lineTo(50,-24);g.lineTo(10,-24);g.closePath();g.fill();g.fillStyle=mx('#8a8a9a','#2a2a30');g.fillRect(2,-34,50,2.4);
    {const ph=(t*1.5)%1,ang=ph<0.75?-1.3+ph/0.75*0.3:-1.0+((ph-0.75)/0.25)*1.15;
      g.save();g.translate(40,-80);g.rotate(Math.PI-ang);g.strokeStyle=mx('#7a5030','#2a1a10');g.lineWidth=4;g.beginPath();g.moveTo(0,0);g.lineTo(0,40);g.stroke();
      g.fillStyle=mx('#c8a040','#4a3a10');g.fillRect(-10,36,20,12);g.fillStyle=mx('#ffe080','#6a5020');g.fillRect(-10,36,20,2.4);g.restore();
      if(ph>0.95&&settings.quality!=='low')for(let k=0;k<3;k++)spawnPart(x+28,-36,rnd(-120,120),rnd(-160,-60),0.4,Math.random()<0.5?'#fff0a0':'#ffc040',2,500);
      if(ph>0.93)gpush([28,-36,50,'#ffe080']);}
    g.fillStyle='rgba(255,'+(170+Math.floor(70*hot))+',80,1)';g.fillRect(20,-38,20,4);
    gpush([-30,-40,110,'#ffb040']);
    sy=-246;
  }else if(b.id==='lmarket'){
    /* цветочная ярмарка: прилавок под полосатым навесом, вёдра цветов, весы, ящики с камнями */
    g.fillStyle=mx('#a87a5a','#2a1a14');g.fillRect(-104,-56,208,56);
    for(let k=0;k<6;k++){g.fillStyle=mx(k%2?'#c8946a':'#b8845a','#2a1a14');g.fillRect(-102+k*34,-54,32,52);g.fillStyle='rgba(255,230,200,.16)';g.fillRect(-102+k*34,-54,32,2);}
    g.fillStyle=mx('#e8c8a0','#3a2a20');g.fillRect(-110,-62,220,8);
    for(const sx of [-100,100]){g.fillStyle=mx('#8a6a4a','#1a100a');g.fillRect(sx-3,-150,6,96);}
    /* навес */
    for(let k=0;k<10;k++){g.fillStyle=N>0.5?(k%2?'#2a1a24':'#4a1a2a'):(k%2?'#fff4f8':'#ff8ab8');g.beginPath();g.moveTo(-116+k*23.2,-150);g.lineTo(-116+(k+1)*23.2,-150);g.lineTo(-116+(k+1)*23.2,-126);g.quadraticCurveTo(-116+(k+0.5)*23.2,-116,-116+k*23.2,-126);g.closePath();g.fill();}
    g.fillStyle='rgba(0,0,0,.18)';g.fillRect(-116,-132,232,6);
    g.fillStyle=mx('#ffb0d0','#3a1424');g.beginPath();g.moveTo(-122,-150);g.lineTo(0,-176);g.lineTo(122,-150);g.closePath();g.fill();
    /* вёдра с цветами на прилавке */
    for(let k=0;k<5;k++){const bx=-84+k*40,wil=N>0.5;
      g.fillStyle=mx('#8a9ab0','#2a2a34');g.beginPath();g.moveTo(bx-10,-62);g.lineTo(bx+10,-62);g.lineTo(bx+8,-78);g.lineTo(bx-8,-78);g.closePath();g.fill();
      for(let q=0;q<5;q++){const fx=bx-8+q*4,sw=Math.sin(t*1.4+k+q)*1.2,top=-96-((k*7+q*3)%10)+(wil?8:0);
        g.strokeStyle=wil?'#3a3a2a':'#4a9a5a';g.lineWidth=1.2;g.beginPath();g.moveTo(fx,-78);g.quadraticCurveTo(fx+sw+(wil?4:0),(top-78)/2-78+40,fx+sw+(wil?6:0),top);g.stroke();
        g.fillStyle=wil?'#4a3a40':['#ff6a9a','#ffd060','#ffffff','#c890ff','#ff9a5a'][(k+q)%5];g.beginPath();g.arc(fx+sw+(wil?6:0),top,3.4,0,TAU);g.fill();
        if(!wil){g.fillStyle='rgba(255,255,255,.5)';g.fillRect(fx+sw-1.6,top-2,1.2,1);}}}
    /* весы с камнем */
    g.strokeStyle=mx('#e8c070','#4a3a20');g.lineWidth=2;g.beginPath();g.moveTo(96,-62);g.lineTo(96,-96);g.moveTo(80,-94);g.lineTo(112,-90);g.stroke();
    g.fillStyle=mx('#e8c070','#4a3a20');g.beginPath();g.ellipse(80,-84,9,3,0,0,TAU);g.ellipse(112,-80,9,3,0,0,TAU);g.fill();
    g.fillStyle=mx('#ff86c4','#5a2a3a');g.beginPath();g.moveTo(112,-90);g.lineTo(116,-84);g.lineTo(108,-84);g.closePath();g.fill();
    /* ящики с рудой перед прилавком */
    for(let k=0;k<2;k++){const bx=-150+k*300;g.fillStyle=mx('#b8946a','#2a1a14');g.fillRect(bx-18,-26,36,26);g.strokeStyle=mx('#7a5a3a','#1a0e08');g.lineWidth=2;g.strokeRect(bx-18,-26,36,26);
      for(let q=0;q<5;q++){g.fillStyle=['#bfe6ff','#ffcf40','#96d4ff','#ff86c4','#6af0cc'][(q+k*2)%5];g.beginPath();g.arc(bx-12+q*6,-28+(q%2)*2,4,0,TAU);g.fill();}}
    gpush([0,-110,90,N>0.5?'#ff4a6a':'#ffb0d0']);
    sy=-212;
  }else if(b.id==='lcasino'){
    /* карусель удачи: настоящая карусель с лошадками, огоньки по краю купола */
    const rot=t*0.6*(N>0.5?1.4:1),n=CAR_HORSES.length,da=TAU/n,RX=92,RY=16,PY=-14;
    g.fillStyle=mx('#a07890','#2a2024');g.beginPath();g.ellipse(0,PY+8,RX+14,RY+8,0,0,TAU);g.fill();
    g.fillStyle=mx('#e8c8d8','#4a3a3a');g.beginPath();g.ellipse(0,PY,RX+12,RY+6,0,0,TAU);g.fill();
    g.fillStyle=mx('#e8c070','#4a3a20');g.fillRect(-4,-170,8,170);
    const hs=[];for(let i=0;i<n;i++){const a=rot+i*da;hs.push({i,a,s:Math.sin(a)});}hs.sort((p,q)=>p.s-q.s);
    for(const q of hs){const hx=Math.cos(q.a)*RX,hy=PY+q.s*RY,s2=0.5+0.16*(q.s+1)/2,bob=Math.sin(t*3+q.i*1.7)*6*s2;
      g.strokeStyle=mx('#e8c070','#4a3a20');g.lineWidth=2.4;g.beginPath();g.moveTo(hx,-150);g.lineTo(hx,hy);g.stroke();
      drawCarHorse(g,hx,hy-40*s2+bob,s2,CAR_HORSES[q.i],Math.cos(q.a+Math.PI/2)>0?1:-1,N>0.5,1,false);}
    for(let k=0;k<12;k++){g.fillStyle=N>0.5?(k%2?'#3a1a2a':'#5a0a1a'):(k%2?'#fff0f6':'#e05a9a');g.beginPath();g.moveTo(0,-206);g.lineTo(-118+k*236/12,-150);g.lineTo(-118+(k+1)*236/12,-150);g.closePath();g.fill();}
    g.fillStyle='rgba(255,255,255,.18)';g.beginPath();g.moveTo(0,-206);g.lineTo(-118,-150);g.lineTo(-50,-150);g.closePath();g.fill();
    for(let k=0;k<14;k++){const lx=-118+(k+0.5)*236/14;g.fillStyle=mx('#ffe0f0','#4a1020');g.beginPath();g.arc(lx,-150,236/28,0,Math.PI);g.fill();
      const on=N>0.5?((k+Math.floor(t*2))%4===0):((k+Math.floor(t*4))%3!==0);g.fillStyle=on?(N>0.5?'#ff3a3a':'#fff6b0'):'#6a5040';g.beginPath();g.arc(lx,-148,2.6,0,TAU);g.fill();
      if(on)gpush([lx,-148,16,N>0.5?'#ff3030':'#fff0a0']);}
    g.fillStyle=mx('#e8c070','#4a3a20');g.beginPath();g.arc(0,-208,5,0,TAU);g.fill();
    const fl=Math.sin(t*3)*4;g.fillStyle=N>0.5?'#5a0a1a':'#ff6aa0';g.beginPath();g.moveTo(0,-226);g.lineTo(18,-221+fl*0.3);g.lineTo(0,-216);g.closePath();g.fill();g.fillStyle=mx('#e8c070','#4a3a20');g.fillRect(-1,-228,2,22);
    gpush([0,-120,100,N>0.5?'#ff3050':'#ffb0e0']);
    sy=-262;
  }else if(b.id==='lboard'){
    /* доска пропавших: щит под двускатной крышей, плакаты с лицами, свеча */
    g.fillStyle=mx('#7a5a40','#1e140e');g.fillRect(-72,-130,8,130);g.fillRect(64,-130,8,130);
    g.fillStyle=mx('#a87c58','#2a1c12');g.fillRect(-70,-128,140,92);
    for(let k=0;k<6;k++){g.fillStyle=mx(k%2?'#b8886a':'#a07a5a','#241810');g.fillRect(-70,-128+k*15.3,140,14);}
    g.fillStyle=mx('#c0507a','#2a0a18');g.beginPath();g.moveTo(-90,-126);g.lineTo(0,-166);g.lineTo(90,-126);g.closePath();g.fill();
    g.fillStyle=mx('#fff8f4','#7a6a70');g.beginPath();g.moveTo(-90,-126);for(let k=0;k<=8;k++){const xx=-90+k*180/8;g.quadraticCurveTo(xx-11,-118,xx,-126);}g.closePath();g.fill();
    for(let k=0;k<4;k++){const px2=-56+(k%2)*58+(k>1?10:0),py=-120+(k>1?42:0),rot=(llbRand(k+40)-0.5)*0.2;
      g.save();g.translate(px2+20,py+18);g.rotate(rot);g.fillStyle=mx('#efe2c8','#8a7e6a');g.fillRect(-20,-18,40,38);
      g.fillStyle=mx('#8a1a1a','#3a0a0a');g.fillRect(-16,-15,32,4);
      g.fillStyle=mx('#e8c8a8','#6a5a4a');g.beginPath();g.ellipse(0,4,8,10,0,0,TAU);g.fill();
      if(N>0.5){g.fillStyle='#1a0006';g.fillRect(-5,1,3,3);g.fillRect(2,1,3,3);g.strokeStyle='#1a0006';g.lineWidth=1;g.beginPath();g.moveTo(-5,8);g.quadraticCurveTo(0,12,5,8);g.stroke();}
      else{g.fillStyle='#3a2418';g.beginPath();g.arc(-3,2,1,0,TAU);g.arc(3,2,1,0,TAU);g.fill();}
      g.fillStyle=mx('#6a4a3a','#3a2a20');g.beginPath();g.arc(0,-6,8,Math.PI,0);g.fill();
      g.fillStyle=mx('#d0507a','#4a1020');g.beginPath();g.arc(0,-17,2,0,TAU);g.fill();g.restore();}
    g.fillStyle=mx('#f0e8e0','#8a8080');g.fillRect(52,-16,8,16);const fh=6+Math.sin(t*8)*1.6;g.fillStyle=N>0.5?'#ff5040':'#ffd070';g.beginPath();g.moveTo(53,-16);g.quadraticCurveTo(56,-16-fh*2,59,-16);g.closePath();g.fill();
    gpush([56,-22,36,N>0.5?'#ff4030':'#ffd070']);
    sy=-196;
  }else if(b.id==='lhall'){drawLilacHall(g,b,glowList,t,N);sy=-252;
  }else if(b.id==='lgarden'){drawLilacGarden(g,gpush,t,N,mx);sy=-238;
  }else if(b.id==='lbeacon'){drawLilacBeacon(g,gpush,t,N,mx,bkLv());sy=-200;
  }else if(b.id==='lwell'){drawLilacWell(g,gpush,t,N,mx);sy=-222;
  }else if(b.id==='lteah'){drawLilacTeaHouse(g,gpush,t,N,mx);sy=-214;
  }else if(b.id==='lportal'){
    /* лиловые врата: каменная арка, увитая лозой, в проёме кружится рассвет */
    const pulse=0.75+0.25*Math.sin(t*1.8);
    g.save();g.globalCompositeOperation='lighter';softGlow(g,0,-110,120,N>0.5?'#ff4a8a':'#c58bff',0.5*pulse);g.restore();
    const ig=g.createRadialGradient(0,-105,10,0,-105,78);ig.addColorStop(0,'rgba(255,230,255,.95)');ig.addColorStop(0.5,N>0.5?'rgba(220,60,120,.75)':'rgba(200,140,255,.75)');ig.addColorStop(1,'rgba(90,40,160,.6)');
    g.fillStyle=ig;g.beginPath();g.ellipse(0,-105,62,92,0,0,TAU);g.fill();
    g.save();g.beginPath();g.ellipse(0,-105,62,92,0,0,TAU);g.clip();g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=3;
    for(let k=0;k<3;k++){g.beginPath();for(let a=0;a<12;a+=0.2){const rr=a*6;g.lineTo(Math.cos(a+t*0.8+k*2.1)*rr,-105+Math.sin(a+t*0.8+k*2.1)*rr*1.4);}g.stroke();}g.restore();
    const st=mx('#e8e0f0','#5a5060'),stD=mx('#a898c0','#2a2030');
    for(let k=0;k<14;k++){const a=Math.PI*0.5+k/13*Math.PI*2*0.999,ax=Math.cos(a+Math.PI*0.5)*70,ay=-105+Math.sin(a+Math.PI*0.5)*100;
      g.fillStyle=k%2?st:shadeHex(st,-0.1);g.beginPath();g.arc(ax,ay,10,0,TAU);g.fill();g.fillStyle=stD;g.beginPath();g.arc(ax+2,ay+3,8,0,Math.PI);g.fill();}
    g.strokeStyle=N>0.5?'#2a3a1a':'#4a9a5a';g.lineWidth=2.4;g.beginPath();for(let a=0;a<TAU;a+=0.1){const rx=Math.cos(a)*78,ry=-105+Math.sin(a)*106+Math.sin(a*9)*3;a?g.lineTo(rx,ry):g.moveTo(rx,ry);}g.stroke();
    for(let k=0;k<10;k++){const a=k/10*TAU,fx=Math.cos(a)*78,fy=-105+Math.sin(a)*106;if(N>0.5){g.fillStyle='#d8c8a0';g.beginPath();g.moveTo(fx,fy);g.lineTo(fx+4,fy-6);g.lineTo(fx+1,fy+2);g.closePath();g.fill();}
      else{g.fillStyle=['#ffb0d8','#fff0fa','#e0b0ff'][k%3];g.beginPath();g.arc(fx,fy,3.4,0,TAU);g.fill();}}
    gpush([0,-105,90,N>0.5?'#ff4a8a':'#c58bff']);
    sy=-238;
  }
  g.font='800 14px system-ui,sans-serif';
  bSign(g,sign,Math.max(110,g.measureText(sign).width+30),sy,N>0.5?'#ffb0b0':'#f0d8ff',t,true);
  g.restore();
}
/* что открывает каждое здание деревни */
function lilacOpen(b){
  if(b.id==='lmine'){enterMine();return;}
  if(b.id==='lmarket'){UI.market();return;}
  if(b.id==='lfurnace'){UI.lstill();return;}
  if(b.id==='lforge'){UI.lforge();return;}
  if(b.id==='lcasino'){UI.lcasino();return;}
  if(b.id==='lboard'){UI.lboard();return;}
  if(b.id==='lportal'){UI.lportal();return;}
  if(b.id==='lhall'){UI.lhall();return;}
  if(b.id==='lgarden'){UI.lgarden();return;}
  if(b.id==='lbeacon'){UI.lbeacon();return;}
  if(b.id==='lwell'){UI.lwell();return;}
  if(b.id==='lteah'){UI.lteah();return;}
  UI.toast(b.name+' ещё строится');
}
UI.lportal=function(){
  const d=this.build('lportal',`
    <div class="card lilac" style="max-width:440px;width:96vw;text-align:center">
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

/* разрез земли под деревней: пласты, корни, камешки-леденцы, светящиеся кристаллы и спящие косточки */
function llbUnderground(g,x0w,x1w,t,N,glowList,mx){
  /* волнистые пласты */
  const bands=[[34,mx('#3a2e52','#100c1a'),0.55],[96,mx('#2e2644','#0c0914'),0.6],[190,mx('#221c36','#08060e'),0.65]];
  for(const [y0,col,a] of bands){g.fillStyle=hexA(col,a);g.beginPath();g.moveTo(x0w,y0+40);
    for(let x=Math.floor(x0w/30)*30;x<=x1w+30;x+=30)g.lineTo(x,y0+Math.sin(x*0.013+y0)*6+llbRand(x/30+y0)*5);
    g.lineTo(x1w+30,y0+60);g.lineTo(x0w,y0+60);g.closePath();g.fill();
    g.strokeStyle=mx('rgba(200,170,230,.12)','rgba(120,60,90,.1)');g.lineWidth=1;g.beginPath();
    for(let x=Math.floor(x0w/30)*30;x<=x1w+30;x+=30){const yy=y0+Math.sin(x*0.013+y0)*6+llbRand(x/30+y0)*5;x===Math.floor(x0w/30)*30?g.moveTo(x,yy):g.lineTo(x,yy);}g.stroke();}
  /* корни из-под травы */
  g.lineCap='round';
  for(let x=Math.floor(x0w/36)*36;x<x1w;x+=36){const r=llbRand(x*0.17+3);if(r<0.45)continue;
    const len=10+r*22,bx=x+llbRand(x+1)*20;g.strokeStyle=mx('#5a4258','#1e1420');g.lineWidth=2.2;
    g.beginPath();g.moveTo(bx,3);g.quadraticCurveTo(bx+6,len*0.5,bx+2,len);g.stroke();
    g.lineWidth=1.1;g.beginPath();g.moveTo(bx+4,len*0.45);g.quadraticCurveTo(bx+10,len*0.6,bx+12,len*0.8);g.stroke();}
  /* камешки-леденцы: свет сверху-слева, тень снизу */
  const pc=N>0.5?['#3a3044','#2e2a3a','#3a2a34']:['#b8a0d8','#a0c8d0','#e0b0c8','#c8c0e0'];
  for(let x=Math.floor(x0w/22)*22;x<x1w;x+=22){const r=llbRand(x*0.31+9);if(r<0.35)continue;
    const px=x+llbRand(x+2)*18,py=22+llbRand(x+4)*230,s=2+llbRand(x+6)*4,c=pc[Math.floor(r*40)%pc.length];
    g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(px+0.8,py+1.2,s,s*0.7,0,0,TAU);g.fill();
    g.fillStyle=hexA(c,0.55);g.beginPath();g.ellipse(px,py,s,s*0.7,0,0,TAU);g.fill();
    g.fillStyle=hexA('#ffffff',N>0.5?0.06:0.22);g.beginPath();g.ellipse(px-s*0.35,py-s*0.25,s*0.4,s*0.22,-0.4,0,TAU);g.fill();}
  /* светящиеся кристаллы и косточки (ночью кристаллы краснеют) */
  for(let x=Math.floor(x0w/150)*150;x<x1w;x+=150){const i=x/150|0,r=llbRand(i*7+13);
    const cx=x+llbRand(i+21)*110,cy=60+llbRand(i+22)*160;
    if(r<0.5){const col=N>0.5?'#ff5a70':['#d8a8ff','#a8e8ff','#ffb0e0'][((i%3)+3)%3],L=shadeHex(col,0.35),D=shadeHex(col,-0.4),tw=0.7+0.3*Math.sin(t*1.4+i);
      for(let k=0;k<3;k++){const h=8+k*4-(k===2?6:0),a=(k-1)*0.45;g.save();g.translate(cx+(k-1)*4,cy);g.rotate(a);
        g.fillStyle=D;g.beginPath();g.moveTo(0,-h);g.lineTo(3,-h*0.6);g.lineTo(3,0);g.lineTo(-3,0);g.lineTo(-3,-h*0.6);g.closePath();g.fill();
        g.fillStyle=col;g.beginPath();g.moveTo(0,-h);g.lineTo(0,0);g.lineTo(-3,0);g.lineTo(-3,-h*0.6);g.closePath();g.fill();
        g.fillStyle=L;g.fillRect(-2.2,-h*0.6,0.9,h*0.5);g.restore();}
      glowList.push([cx,cy-6,26*tw,col]);}
    else if(r<0.72){/* спящая косточка — напоминание, что под деревней не всё так мило */
      g.fillStyle=mx('#d8ccc0','#5a4a44');g.save();g.translate(cx,cy);g.rotate(llbRand(i+30)*3);
      g.fillRect(-7,-1.2,14,2.4);for(const sx of [-7,7]){g.beginPath();g.arc(sx,-1.4,1.8,0,TAU);g.arc(sx,1.4,1.8,0,TAU);g.fill();}g.restore();}}
}
