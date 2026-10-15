'use strict';
/* ============================================================
   ЛОББИ АДА
   ============================================================ */
/* ================== ЛОББИ АДА: многослойный фон с параллаксом ================== */
const HLB={key:'',clouds:null,ridges:null};
function hlbRand(i){const x=Math.sin(i*127.13+311.7)*43758.5453;return x-Math.floor(x);}
function hlbCloudSprite(seed,dark){
  const c=document.createElement('canvas');c.width=520;c.height=170;const g=c.getContext('2d');
  for(let k=0;k<26;k++){const x=40+hlbRand(seed+k)*440,y=60+hlbRand(seed+k+50)*60-Math.sin((x-40)/440*Math.PI)*40,r=26+hlbRand(seed+k+90)*44;
    const gr=g.createRadialGradient(x,y-r*0.2,r*0.1,x,y,r);gr.addColorStop(0,dark?'rgba(46,16,16,.95)':'rgba(70,24,20,.9)');gr.addColorStop(0.7,dark?'rgba(30,10,12,.75)':'rgba(52,16,16,.7)');gr.addColorStop(1,'rgba(30,8,10,0)');
    g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();}
  /* подсветка снизу отблеском лавы */
  g.globalCompositeOperation='source-atop';const lg=g.createLinearGradient(0,60,0,170);lg.addColorStop(0,'rgba(255,90,30,0)');lg.addColorStop(1,dark?'rgba(255,90,30,.35)':'rgba(255,120,50,.5)');g.fillStyle=lg;g.fillRect(0,0,520,170);
  return c;
}
function hlbRidge(seed,n,amp,base,rough){
  const pts=[];for(let i=0;i<=n;i++){let y=0,f=1,a=1;for(let o=0;o<4;o++){y+=Math.sin(i*0.35*f+seed*(o+1)+hlbRand(seed+o)*6)*a;f*=2.1;a*=rough;}pts.push(base-Math.abs(y)*amp-hlbRand(seed+i*3)*amp*0.15);}
  return pts;
}
function hlbInit(W,H){
  const key=W+'x'+H;if(HLB.key===key)return;HLB.key=key;
  HLB.clouds=[hlbCloudSprite(11,true),hlbCloudSprite(37,false),hlbCloudSprite(71,false)];
  HLB.ridges=[hlbRidge(1.3,80,0.09,1,0.5),hlbRidge(2.7,60,0.13,1,0.55),hlbRidge(4.1,48,0.07,1,0.62)];
  HLB.fliers=[];for(let i=0;i<7;i++)HLB.fliers.push({k:i%3,sp:16+hlbRand(i+5)*26,off:hlbRand(i+9)*3000,y:0.12+hlbRand(i+13)*0.3,s:0.5+hlbRand(i+17)*0.8,ph:hlbRand(i+21)*6,dir:hlbRand(i+25)<0.5?-1:1,depth:hlbRand(i+29)});
}
/* силуэт летающего чудовища: дракон, крылатый демон или стая нетопырей */
function hlbFlier(g,x,y,s,t,k,dir,al){
  g.save();g.translate(x,y);g.scale(s*dir,s);g.globalAlpha=al;g.fillStyle='#0c0306';
  const fl=Math.sin(t*(k===2?9:3.2));
  if(k===0){/* дракон */
    g.beginPath();g.ellipse(0,0,26,7,0,0,TAU);g.fill();
    g.beginPath();g.moveTo(22,-2);g.quadraticCurveTo(36,-12,46,-10);g.lineTo(52,-8);g.lineTo(46,-5);g.quadraticCurveTo(36,-6,24,3);g.fill();
    g.beginPath();g.moveTo(-24,0);g.quadraticCurveTo(-48,6+fl*3,-70,-2);g.lineTo(-74,2);g.quadraticCurveTo(-48,12,-22,4);g.fill();
    for(const sd of [1,-0.6]){g.beginPath();g.moveTo(-6,-3);g.quadraticCurveTo(-10,-30*fl*sd-8,-34,-46*fl*sd-6);g.lineTo(-20,-24*fl*sd-4);g.lineTo(-28,-20*fl*sd-2);g.lineTo(-10,-12*fl*sd);g.lineTo(-14,-6*fl*sd+2);g.lineTo(10,-3);g.closePath();g.fill();}
    g.beginPath();g.moveTo(44,-11);g.lineTo(42,-18);g.lineTo(47,-11);g.fill();
    g.fillStyle='rgba(255,90,30,'+(0.8*al)+')';g.fillRect(46,-9.5,2.4,1.4);
  }else if(k===1){/* крылатый демон */
    g.beginPath();g.ellipse(0,0,6,12,0,0,TAU);g.fill();g.beginPath();g.arc(0,-15,5,0,TAU);g.fill();
    g.beginPath();g.moveTo(-3,-18);g.lineTo(-7,-26);g.lineTo(-1,-19);g.moveTo(3,-18);g.lineTo(7,-26);g.lineTo(1,-19);g.fill();
    for(const sd of [-1,1]){g.beginPath();g.moveTo(sd*3,-6);g.quadraticCurveTo(sd*18,-24-fl*10,sd*36,-14-fl*14);g.lineTo(sd*28,-6-fl*6);g.lineTo(sd*32,0-fl*4);g.lineTo(sd*20,-2);g.lineTo(sd*22,6);g.closePath();g.fill();}
    g.beginPath();g.moveTo(0,10);g.quadraticCurveTo(4,22,-2,30);g.lineTo(0,24);g.fill();
  }else{/* стая нетопырей */
    for(let i=0;i<7;i++){const bx=Math.sin(i*2.1+t*0.6)*28+i*6-18,by=Math.cos(i*1.7+t*0.8)*12,f2=Math.sin(t*12+i*1.3);
      g.beginPath();g.moveTo(bx,by);g.quadraticCurveTo(bx-4,by-5*f2-2,bx-8,by-1-3*f2);g.lineTo(bx-4,by+1);g.lineTo(bx,by+2);g.lineTo(bx+4,by+1);g.lineTo(bx+8,by-1-3*f2);g.quadraticCurveTo(bx+4,by-5*f2-2,bx,by);g.fill();}
  }
  g.restore();
}
function renderHellLobby(){
  const W=view.W,H=view.H,sc=view.scale,cam=G.cam;
  const t=performance.now()/1000,low=settings.quality==='low';
  hlbInit(W,H);
  const HZ=H*0.62-cam.y*sc;/* линия горизонта = уровень земли на экране */
  const px=(k)=>-cam.x*sc*k;
  /* 1. небо */
  const sky=ctx.createLinearGradient(0,0,0,HZ);
  sky.addColorStop(0,'#06020a');sky.addColorStop(0.35,'#1c050c');sky.addColorStop(0.7,'#4a0e0a');sky.addColorStop(0.92,'#8a2a0c');sky.addColorStop(1,'#c4501a');
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  /* искры-«звёзды» пепла */
  if(!low){for(let i=0;i<60;i++){const x=((hlbRand(i)*W*1.5+px(0.01))%W+W)%W,y=hlbRand(i+100)*HZ*0.7,tw=0.4+0.6*Math.abs(Math.sin(t*0.8+i));ctx.fillStyle='rgba(255,'+(150+Math.floor(hlbRand(i+7)*80))+',110,'+(0.25*tw)+')';ctx.fillRect(x,y,1.2,1.2);}}
  /* 3. облака дальнего слоя */
  const cloudLayer=(spr,k,y,speed,alpha,scl)=>{const w=spr.width*scl,period=w*1.35;let x0=((px(k)-t*speed)%period+period)%period-period;
    ctx.globalAlpha=alpha;for(let x=x0;x<W+w;x+=period){ctx.drawImage(spr,x,y,w,spr.height*scl);ctx.drawImage(spr,x+period*0.5,y+18*scl,w*0.8,spr.height*scl*0.8);}ctx.globalAlpha=1;};
  cloudLayer(HLB.clouds[0],0.02,HZ*0.02,4,0.7,1.1);
  /* 2. кровавая луна с короной */
  {const mx=W*0.72+px(0.015),my=HZ*0.32,R=Math.min(W,H)*0.085,pulse=1+0.015*Math.sin(t*0.9);
    ctx.save();ctx.globalCompositeOperation='lighter';softGlow(ctx,mx,my,R*5.2,'#ff3a14',0.55);softGlow(ctx,mx,my,R*2.2,'#ff7a40',0.6);ctx.restore();
    const mg=ctx.createRadialGradient(mx-R*0.35,my-R*0.35,R*0.1,mx,my,R*pulse);mg.addColorStop(0,'#ffb27a');mg.addColorStop(0.55,'#e8481c');mg.addColorStop(1,'#7a1406');
    ctx.fillStyle=mg;ctx.beginPath();ctx.arc(mx,my,R*pulse,0,TAU);ctx.fill();
    ctx.fillStyle='rgba(110,16,6,.35)';for(const [cx2,cy2,cr] of [[0.3,-0.2,0.22],[-0.35,0.25,0.16],[0.05,0.45,0.12],[-0.2,-0.42,0.1]]){ctx.beginPath();ctx.arc(mx+cx2*R,my+cy2*R,cr*R,0,TAU);ctx.fill();}
    const sh=ctx.createLinearGradient(mx-R,my,mx+R,my);sh.addColorStop(0,'rgba(20,0,0,0)');sh.addColorStop(1,'rgba(20,0,0,.45)');ctx.fillStyle=sh;ctx.beginPath();ctx.arc(mx,my,R*pulse,0,TAU);ctx.fill();}
  /* 4. тени летающих чудовищ между облаками */
  for(const f of HLB.fliers){if(f.depth>0.55)continue;const per=W+900,x=((f.off+t*f.sp*f.dir+px(0.03))%per+per)%per-450,y=HZ*f.y+Math.sin(t*0.6+f.ph)*12;
    hlbFlier(ctx,x,y,f.s*(0.6+f.depth*0.5)*Math.min(1.4,H/700),t+f.ph,f.k,f.dir,0.55+f.depth*0.3);}
  cloudLayer(HLB.clouds[1],0.04,HZ*0.2,7,0.75,0.95);
  /* 5. дальний горный хребет с дымкой */
  const ridge=(pts,k,base,height,col,rim,spacing)=>{const off=((px(k))%(spacing*pts.length)+spacing*pts.length)%(spacing*pts.length)-spacing*pts.length;
    ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(off,H);
    for(let rep=0;rep<3;rep++)for(let i=0;i<pts.length;i++){const x=off+(rep*pts.length+i)*spacing;if(x>W+spacing*2)break;ctx.lineTo(x,base-(1-pts[i])*height*10);}
    ctx.lineTo(W+50,H);ctx.closePath();ctx.fill();
    if(rim){ctx.strokeStyle=rim;ctx.lineWidth=1.5;ctx.beginPath();for(let rep=0;rep<3;rep++)for(let i=0;i<pts.length;i++){const x=off+(rep*pts.length+i)*spacing;if(x>W+spacing*2)break;const y=base-(1-pts[i])*height*10;if(rep===0&&i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();}};
  ridge(HLB.ridges[0],0.06,HZ-H*0.08,H*0.09,'#2a0a10','rgba(255,110,60,.18)',26);
  {const hz2=ctx.createLinearGradient(0,HZ-H*0.3,0,HZ);hz2.addColorStop(0,'rgba(140,30,10,0)');hz2.addColorStop(1,'rgba(160,40,12,.35)');ctx.fillStyle=hz2;ctx.fillRect(0,HZ-H*0.3,W,H*0.3);}
  /* 6. вулканы среднего плана с лавой и дымом */
  {const period=1100,k=0.1,off=((px(k))%period+period)%period-period;
    for(let x0=off;x0<W+period;x0+=period){
      for(const [vx,vh,vw] of [[x0+260,H*0.26,260],[x0+760,H*0.18,200]]){const top=HZ-vh;
        ctx.fillStyle='#1c0608';ctx.beginPath();ctx.moveTo(vx-vw,HZ+4);ctx.quadraticCurveTo(vx-vw*0.25,HZ-vh*0.55,vx-vw*0.12,top);ctx.lineTo(vx+vw*0.12,top);ctx.quadraticCurveTo(vx+vw*0.25,HZ-vh*0.55,vx+vw,HZ+4);ctx.closePath();ctx.fill();
        ctx.strokeStyle='rgba(255,120,50,.15)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(vx-vw*0.12,top);ctx.quadraticCurveTo(vx-vw*0.25,HZ-vh*0.55,vx-vw,HZ+4);ctx.stroke();
        ctx.save();ctx.globalCompositeOperation='lighter';softGlow(ctx,vx,top,vw*0.55,'#ff6a1a',0.55+0.15*Math.sin(t*1.7+vx));ctx.restore();
        ctx.fillStyle='#ffb040';ctx.beginPath();ctx.ellipse(vx,top+1,vw*0.11,3,0,0,TAU);ctx.fill();
        /* лавовые ручьи */
        ctx.lineCap='round';
        for(const [dx1,dx2,dx3] of [[-0.05,-0.18,-0.42],[0.06,0.2,0.5]]){const gr=ctx.createLinearGradient(0,top,0,HZ);gr.addColorStop(0,'rgba(255,200,90,.95)');gr.addColorStop(1,'rgba(200,40,10,.2)');
          ctx.strokeStyle=gr;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(vx+dx1*vw,top+2);ctx.quadraticCurveTo(vx+dx2*vw,HZ-vh*0.5,vx+dx3*vw,HZ);ctx.stroke();}
        /* дым */
        if(!low)for(let q=0;q<6;q++){const ph=((t*0.07+q/6+vx*0.001)%1+1)%1,sx=vx+Math.sin(ph*5+q)*20*ph+ph*60,sy=top-ph*H*0.3,r=12+ph*50;
          const sg=ctx.createRadialGradient(sx,sy,0,sx,sy,r);sg.addColorStop(0,'rgba(40,14,14,'+(0.45*(1-ph))+')');sg.addColorStop(1,'rgba(40,14,14,0)');ctx.fillStyle=sg;ctx.beginPath();ctx.arc(sx,sy,r,0,TAU);ctx.fill();}
      }}}
  /* ближние тени чудовищ */
  for(const f of HLB.fliers){if(f.depth<=0.55)continue;const per=W+900,x=((f.off+t*f.sp*1.3*f.dir+px(0.12))%per+per)%per-450,y=HZ*(f.y+0.15)+Math.sin(t*0.7+f.ph)*14;
    hlbFlier(ctx,x,y,f.s*1.3*Math.min(1.4,H/700),t+f.ph,f.k,f.dir,0.8);}
  cloudLayer(HLB.clouds[2],0.14,HZ-H*0.2,12,0.55,0.8);
  /* 7. скальные шпили и арки ближнего плана */
  {const period=760,k=0.22,off=((px(k))%period+period)%period-period;
    for(let x0=off;x0<W+period;x0+=period){
      ctx.fillStyle='#12040a';
      for(const [sx,sh2,sw] of [[x0+60,H*0.2,34],[x0+150,H*0.12,22],[x0+430,H*0.26,40],[x0+520,H*0.15,26],[x0+640,H*0.09,18]]){
        ctx.beginPath();ctx.moveTo(sx-sw,HZ+6);ctx.lineTo(sx-sw*0.35,HZ-sh2*0.6);ctx.lineTo(sx-sw*0.1,HZ-sh2);ctx.lineTo(sx+sw*0.15,HZ-sh2*0.82);ctx.lineTo(sx+sw*0.4,HZ-sh2*0.45);ctx.lineTo(sx+sw,HZ+6);ctx.closePath();ctx.fill();
        ctx.strokeStyle='rgba(255,'+(90+Math.floor(40*Math.sin(t*1.3+sx)))+',30,.5)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(sx-sw*0.2,HZ-sh2*0.7);ctx.lineTo(sx,HZ-sh2*0.4);ctx.lineTo(sx-sw*0.15,HZ-sh2*0.15);ctx.stroke();}
      /* каменная арка */
      const ax=x0+300,ah=H*0.14;ctx.beginPath();ctx.moveTo(ax-60,HZ+6);ctx.lineTo(ax-52,HZ-ah);ctx.quadraticCurveTo(ax,HZ-ah*1.5,ax+52,HZ-ah);ctx.lineTo(ax+60,HZ+6);ctx.lineTo(ax+36,HZ+6);ctx.lineTo(ax+34,HZ-ah*0.7);ctx.quadraticCurveTo(ax,HZ-ah*1.05,ax-34,HZ-ah*0.7);ctx.lineTo(ax-36,HZ+6);ctx.closePath();ctx.fill();}}
  /* марево у горизонта */
  {const hz3=ctx.createLinearGradient(0,HZ-60,0,HZ+10);hz3.addColorStop(0,'rgba(255,80,20,0)');hz3.addColorStop(1,'rgba(255,90,30,.28)');ctx.fillStyle=hz3;ctx.fillRect(0,HZ-60,W,70);}
  /* ===== мир: земля, дорога, лавовый канал ===== */
  ctx.setTransform(dpr*sc,0,0,dpr*sc, dpr*(W/2-cam.x*sc), dpr*(H*0.62-cam.y*sc));
  const x0w=cam.x-W/(2*sc)-80,x1w=cam.x+W/(2*sc)+80;
  const gnd=ctx.createLinearGradient(0,0,0,420);
  gnd.addColorStop(0,'#2e1e1c');gnd.addColorStop(0.08,'#1e100e');gnd.addColorStop(0.4,'#120807');gnd.addColorStop(1,'#060202');
  ctx.fillStyle=gnd;ctx.fillRect(x0w,0,x1w-x0w,700);
  /* обсидиановая брусчатка */
  for(let x=Math.floor(x0w/48)*48;x<x1w;x+=48){const h0=hlbRand(x/48);
    const sg=ctx.createLinearGradient(0,-6,0,14);sg.addColorStop(0,'#3a2a34');sg.addColorStop(0.3,'#241820');sg.addColorStop(1,'#140c12');
    ctx.fillStyle=sg;ctx.beginPath();ctx.moveTo(x+2,-5);ctx.lineTo(x+46,-5);ctx.lineTo(x+47,12);ctx.lineTo(x+1,12);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(255,170,120,.14)';ctx.fillRect(x+3,-5,42,1.2);
    ctx.fillStyle='rgba(180,140,255,.07)';ctx.fillRect(x+6+h0*20,-2,10,1);
    if(h0<0.25){const gw=0.5+0.4*Math.sin(t*2+x);ctx.strokeStyle='rgba(255,'+(110+Math.floor(gw*60))+',40,'+(0.6*gw)+')';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+10,-5);ctx.lineTo(x+16,3);ctx.lineTo(x+13,12);ctx.stroke();}}
  /* трещины в пепельной земле */
  for(let x=Math.floor(x0w/90)*90;x<x1w;x+=90){const h0=hlbRand(x*0.37+3),gy=28+h0*150;if(h0>0.6)continue;const a=0.35+0.35*Math.sin(t*1.4+x);
    ctx.strokeStyle='rgba(255,'+(90+Math.floor(h0*60))+',30,'+a.toFixed(2)+')';ctx.lineWidth=1.8;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x,gy);ctx.lineTo(x+12,gy+5);ctx.lineTo(x+22,gy+1);ctx.lineTo(x+34,gy+8);ctx.stroke();}
  const glowList=[];
  /* лавовый канал: течёт, с коркой и бликами */
  {ctx.fillStyle='#1a0a06';ctx.fillRect(x0w,38,x1w-x0w,28);
    const lg=ctx.createLinearGradient(0,42,0,62);lg.addColorStop(0,'#ffe08a');lg.addColorStop(0.3,'#ff8a24');lg.addColorStop(0.75,'#d0300a');lg.addColorStop(1,'#5a0e04');
    ctx.fillStyle=lg;ctx.fillRect(x0w,42,x1w-x0w,20);
    for(let x=Math.floor(x0w/36)*36-36;x<x1w;x+=36){const fx=x+((t*22)%36),h0=hlbRand(x/36+7);
      ctx.fillStyle='rgba(255,250,200,.55)';ctx.beginPath();ctx.ellipse(fx+10,46+h0*4,8+h0*6,1.2,0,0,TAU);ctx.fill();
      if(h0<0.45){ctx.fillStyle='rgba(40,14,8,.85)';ctx.beginPath();ctx.ellipse(fx+20,52+h0*6,6+h0*8,2.2,0,0,TAU);ctx.fill();}}
    ctx.fillStyle='#2a1610';ctx.fillRect(x0w,36,x1w-x0w,4);ctx.fillRect(x0w,62,x1w-x0w,4);
    for(let x=Math.floor(x0w/120)*120;x<x1w;x+=120)glowList.push([x+60,52,70,'#ff6a1a']);
    for(const b of buildings){/* каменные мостики */
      ctx.fillStyle='#2a1c18';ctx.fillRect(b.x-30,36,60,30);ctx.fillStyle='#3a2a24';for(let k=0;k<5;k++){ctx.fillRect(b.x-28+k*11.5,38,10,26);}
      ctx.fillStyle='rgba(255,150,80,.18)';ctx.fillRect(b.x-30,36,60,1.5);}}
  drawHellScenery(ctx,cam,t,W,sc,glowList);
  for(const b of buildings){hlbPlinth(ctx,b,glowList,t);drawHellBuilding(ctx,b,glowList,t);}
  drawLobbyCrates(ctx);drawLobbyBot(ctx);
  if(G.scene==='lobby')drawLobbyPlaceGhost(ctx);
  if(!G.cutHide)drawPlayerSprite(ctx,lobbyPlayer.x,lobbyPlayer.y,lobbyPlayer.animState,lobbyPlayer.anim,lobbyPlayer.facing,{tool:null,armor:player.armorLvl,pickLvl:player.pickLvl,torch:player.torchLvl,groundY:0});
  drawCrateLabels(ctx);
  drawGlowList(ctx,glowList,0.5);
  /* передний план: тёмные камни и кости, быстрее параллакс */
  ctx.setTransform(dpr,0,0,dpr,0,0);
  {const period=520,k=1.35,off=((px(k))%period+period)%period-period,gy=H*0.62-cam.y*sc+120*sc;
    ctx.fillStyle='#050102';
    for(let x0=off;x0<W+period;x0+=period){for(const [rx,rw,rh] of [[x0+40,90,30],[x0+300,60,22]]){ctx.beginPath();ctx.moveTo(rx-rw,H+10);ctx.quadraticCurveTo(rx-rw*0.6,gy+60-rh,rx,gy+60-rh*1.4);ctx.quadraticCurveTo(rx+rw*0.6,gy+60-rh,rx+rw,H+10);ctx.closePath();ctx.fill();}}}
  /* искры и пепел */
  if(!low&&parts.length<partBudget*0.8){
    if(Math.random()<0.25){const fx=cam.x+rnd(-W/(2*sc),W/(2*sc));spawnPart(fx,rnd(-10,40),rnd(-12,12),rnd(-70,-25),rnd(2,4),Math.random()<0.6?'#ff8a3a':'#ffd060',1.6,-10);}
    if(Math.random()<0.18){const fx=cam.x+rnd(-W/(2*sc),W/(2*sc));spawnPart(fx,-320,rnd(10,30),rnd(20,40),rnd(4,7),'#5a4a46',1.5,0);}
  }
  const hz=ctx.createLinearGradient(0,H*0.72,0,H);hz.addColorStop(0,'rgba(255,80,20,0)');hz.addColorStop(1,'rgba(255,70,20,.1)');
  ctx.fillStyle=hz;ctx.fillRect(0,H*0.72,W,H*0.28);
  /* виньетка */
  {const vg=ctx.createRadialGradient(W/2,H*0.55,Math.min(W,H)*0.35,W/2,H*0.55,Math.max(W,H)*0.8);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.45)');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);}
  drawParticles();drawFloats();
}
/* постамент под зданием: ступени, жаровни, знамёна */
function hlbPlinth(g,b,glowList,t){
  const x=b.x,w=(b.id==='portal3'||b.id==='portal')?150:128;
  g.save();g.translate(x,0);
  g.fillStyle='#1a1214';g.beginPath();g.moveTo(-w,4);g.lineTo(-w+8,-6);g.lineTo(w-8,-6);g.lineTo(w,4);g.closePath();g.fill();
  g.fillStyle='#2a1e20';g.fillRect(-w+8,-6,w*2-16,3);g.fillStyle='rgba(255,170,120,.18)';g.fillRect(-w+8,-6,w*2-16,1);
  g.fillStyle='rgba(0,0,0,.35)';for(let k=-w+20;k<w-16;k+=24)g.fillRect(k,-3,1,7);
  for(const sd of [-1,1]){const bx=sd*(w+12);
    /* жаровня на треноге */
    g.strokeStyle='#2a2024';g.lineWidth=2.4;g.beginPath();g.moveTo(bx-7,4);g.lineTo(bx,-20);g.lineTo(bx+7,4);g.moveTo(bx,4);g.lineTo(bx,-20);g.stroke();
    g.fillStyle='#3a2a26';g.beginPath();g.moveTo(bx-10,-22);g.lineTo(bx+10,-22);g.lineTo(bx+7,-16);g.lineTo(bx-7,-16);g.closePath();g.fill();
    olLight(g,(g)=>{for(let q=0;q<4;q++){const fh=9+Math.sin(t*10+q*1.9+sd)*3.5;g.fillStyle=q%2?'rgba(255,220,120,.9)':'rgba(255,90,20,.85)';g.beginPath();g.moveTo(bx-8+q*5,-22);g.quadraticCurveTo(bx-6+q*5,-22-fh*1.7,bx-3+q*5,-22);g.fill();}});
    glowList.push([x+bx,-30,46,'#ff7a2a']);
    /* знамя */
    const bxx=sd*(w-20);g.fillStyle='#1a1214';g.fillRect(bxx-1.5,-120,3,116);g.fillStyle='#caa24a';g.beginPath();g.arc(bxx,-122,3,0,TAU);g.fill();
    const wv=Math.sin(t*2+sd)*3;g.fillStyle='#5a0a14';g.beginPath();g.moveTo(bxx,-114);g.lineTo(bxx+sd*-22,-114);g.lineTo(bxx+sd*-22+wv,-66);g.lineTo(bxx+sd*-11,-74+wv*0.5);g.lineTo(bxx,-66);g.closePath();g.fill();
    g.strokeStyle='#caa24a';g.lineWidth=1;g.stroke();
    g.fillStyle='#ffb070';g.beginPath();const sx=bxx+sd*-11,sy=-96;g.moveTo(sx,sy-7);g.lineTo(sx+5,sy+4);g.lineTo(sx-5,sy+4);g.closePath();g.fill();g.fillStyle='#5a0a14';g.beginPath();g.arc(sx,sy+1,2,0,TAU);g.fill();}
  g.restore();
}
function drawHellScenery(g,cam,t,W,sc,glowList){
  const x0=cam.x-W/(2*sc)-120,x1=cam.x+W/(2*sc)+120;
  /* дальние каменные шипы */
  for(let x=Math.floor(x0/80)*80;x<x1;x+=80){
    const h=hash2(x/80|0,1,611);if(h%3===0)continue;
    const hh=40+(h%60);g.fillStyle='#1c0806';
    g.beginPath();g.moveTo(x-14,-3);g.lineTo(x-3+(h%7),-3-hh);g.lineTo(x+14,-3);g.closePath();g.fill();
  }
  for(let x=Math.floor(x0/64)*64;x<x1;x+=64){
    const i=x/64|0,h=hash2(i,5,777);
    let nearB=false;for(const b of buildings)if(Math.abs(x-b.x)<130)nearB=true;
    if(nearB)continue;
    const k=h%7;
    if(k===0){
      /* фонарь-череп на цепи */
      g.fillStyle='#1a1214';g.fillRect(x-2,-70,4,70);g.fillRect(x-2,-70,18,3);
      const sw=Math.sin(t*1.4+i)*2;
      g.strokeStyle='#3a3a40';g.lineWidth=1.5;g.beginPath();g.moveTo(x+14,-67);g.lineTo(x+14+sw,-56);g.stroke();
      g.fillStyle='#d8d0bc';g.beginPath();g.arc(x+14+sw,-50,6,0,TAU);g.fill();g.fillRect(x+10+sw,-47,8,5);
      g.fillStyle='#ff7a2a';g.fillRect(x+11+sw,-52,3,3);g.fillRect(x+15+sw,-52,3,3);
      glowList.push([x+14+sw,-50,46,'#ff6a20']);
    }else if(k===1){
      /* лавовый ручей-трещина */
      const a=0.6+0.3*Math.sin(t*2+i);
      g.strokeStyle='rgba(255,'+(100+Math.floor(50*a))+',30,'+a.toFixed(2)+')';g.lineWidth=2;g.lineCap='round';g.beginPath();g.moveTo(x-24,1);g.lineTo(x-10,-1);g.lineTo(x+2,2);g.lineTo(x+22,0);g.stroke();
      glowList.push([x,0,40,'#ff5a1a']);
    }else if(k===2){
      /* обугленное дерево */
      g.strokeStyle='#120806';g.lineWidth=6;g.lineCap='round';
      g.beginPath();g.moveTo(x,-2);g.lineTo(x+2,-60);g.moveTo(x+1,-40);g.lineTo(x-18,-62);g.moveTo(x+2,-52);g.lineTo(x+20,-76);g.moveTo(x+12,-64);g.lineTo(x+26,-66);g.stroke();
      g.strokeStyle='rgba(255,90,30,.5)';g.lineWidth=1;g.beginPath();g.moveTo(x-1,-10);g.lineTo(x+1,-36);g.stroke();
    }else if(k===3){
      /* кости и рёбра */
      g.strokeStyle='#cfc6b0';g.lineWidth=3;
      for(let r=0;r<4;r++){g.beginPath();g.arc(x+r*8-12,-2,14-r,Math.PI*1.05,Math.PI*1.75);g.stroke();}
      g.fillStyle='#d8d0bc';g.beginPath();g.arc(x+22,-6,6,0,TAU);g.fill();g.fillStyle='#1a1410';g.fillRect(x+19,-8,2,2);g.fillRect(x+23,-8,2,2);
    }else if(k===4){
      /* шипастая ограда */
      g.fillStyle='#24141a';
      for(let q=0;q<4;q++){const fx=x-24+q*16;g.fillRect(fx-1.5,-30,3,30);g.beginPath();g.moveTo(fx-4,-30);g.lineTo(fx,-40);g.lineTo(fx+4,-30);g.closePath();g.fill();}
      g.fillRect(x-28,-22,64,3);g.fillRect(x-28,-10,64,3);
    }else if(k===5){
      /* огненная чаша */
      g.fillStyle='#2a1a1a';g.beginPath();g.moveTo(x-12,-16);g.lineTo(x+12,-16);g.lineTo(x+6,-4);g.lineTo(x-6,-4);g.closePath();g.fill();g.fillRect(x-3,-4,6,4);
      for(let q=0;q<3;q++){const fh=10+Math.sin(t*9+q*2+i)*4;g.fillStyle=q===1?'#ffd060':'#ff5a1a';g.beginPath();g.moveTo(x-7+q*5,-16);g.quadraticCurveTo(x-5+q*5,-16-fh,x-2+q*5,-16);g.closePath();g.fill();}
      glowList.push([x,-22,50,'#ff6a1a']);
    }
  }
}
function drawHellBuilding(g,b,glowList,t){
  const x=b.x;
  const gpush=(...arr)=>{for(const q of arr)glowList.push([x+q[0],q[1],q[2],q[3]]);};
  g.save();g.translate(x,0);
  g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(0,4,112,14,0,0,TAU);g.fill();
  if(b.id==='hmine'){
    /* врата в недра: рогатая арка из базальта */
    g.fillStyle='#1c1416';
    g.beginPath();g.moveTo(-110,0);g.lineTo(-96,-120);g.quadraticCurveTo(0,-200,96,-120);g.lineTo(110,0);g.closePath();g.fill();
    g.fillStyle='#2a1e20';for(let k=0;k<6;k++){g.fillRect(-100+k*34,-110+Math.abs(k-2.5)*-8,26,6);}
    const dg=g.createLinearGradient(0,-130,0,0);dg.addColorStop(0,'#000');dg.addColorStop(1,'#3a0a04');
    g.fillStyle=dg;g.beginPath();g.moveTo(-46,0);g.lineTo(-46,-90);g.quadraticCurveTo(0,-140,46,-90);g.lineTo(46,0);g.closePath();g.fill();
    const gl=0.5+0.3*Math.sin(t*2);
    const hg=g.createRadialGradient(0,-10,4,0,-10,70);hg.addColorStop(0,'rgba(255,120,30,'+gl+')');hg.addColorStop(1,'rgba(255,60,10,0)');
    g.fillStyle=hg;g.fillRect(-46,-90,92,90);
    /* рога */
    g.fillStyle='#d8ccb0';
    g.beginPath();g.moveTo(-80,-140);g.quadraticCurveTo(-140,-170,-120,-230);g.quadraticCurveTo(-118,-180,-66,-152);g.closePath();g.fill();
    g.beginPath();g.moveTo(80,-140);g.quadraticCurveTo(140,-170,120,-230);g.quadraticCurveTo(118,-180,66,-152);g.closePath();g.fill();
    /* цепи и череп-замок */
    g.strokeStyle='#4a4a52';g.lineWidth=3;for(const sx of [-38,38]){for(let k=0;k<6;k++){g.beginPath();g.ellipse(sx,-120+k*10,2.5,4,0,0,TAU);g.stroke();}}
    g.fillStyle='#e0d8c4';g.beginPath();g.arc(0,-150,14,0,TAU);g.fill();g.fillRect(-9,-142,18,10);
    g.fillStyle='#ff6a1a';g.beginPath();g.arc(-5,-152,3.4,0,TAU);g.arc(5,-152,3.4,0,TAU);g.fill();
    gpush([0,-150,40,'#ff5a1a'],[0,-30,90,'#ff6a1a']);
    g.save();g.translate(0,-215);bSign(g,'АДСКАЯ ШАХТА',150,-16,'#ffb070',t,false);g.restore();
  }else if(b.id==='furnace'){
    /* огромная каменная печь с трубой */
    g.fillStyle='#2a1c1a';g.beginPath();g.moveTo(-100,0);g.lineTo(-90,-130);g.lineTo(90,-130);g.lineTo(100,0);g.closePath();g.fill();
    g.fillStyle='#3a2824';for(let r=0;r<6;r++)for(let k=0;k<6;k++)g.fillRect(-92+k*31+(r%2?12:0),-124+r*20,26,16);
    g.fillStyle='#22161a';g.fillRect(40,-230,36,110);g.fillStyle='#3a2824';g.fillRect(36,-236,44,12);
    /* пламя из трубы */
    for(let k=0;k<4;k++){const fh=30+Math.sin(t*7+k*1.7)*12;g.fillStyle=k%2?'rgba(255,210,90,.9)':'rgba(255,90,20,.85)';g.beginPath();g.moveTo(44+k*8,-236);g.quadraticCurveTo(46+k*8,-236-fh,52+k*8,-236);g.closePath();g.fill();}
    if(Math.random()<0.3&&settings.quality!=='low')spawnPart(x+58,-270,rnd(-10,10),rnd(-60,-30),2.4,'#3a2a26',4,-6);
    /* жерло */
    g.fillStyle='#0a0302';g.beginPath();g.moveTo(-50,0);g.lineTo(-50,-60);g.quadraticCurveTo(0,-100,50,-60);g.lineTo(50,0);g.closePath();g.fill();
    const f=0.75+0.25*Math.sin(t*6);
    const fg=g.createRadialGradient(0,-20,4,0,-20,60);fg.addColorStop(0,'rgba(255,240,170,'+f+')');fg.addColorStop(0.5,'rgba(255,120,30,.85)');fg.addColorStop(1,'rgba(160,20,0,0)');
    g.fillStyle=fg;g.beginPath();g.moveTo(-46,0);g.lineTo(-46,-58);g.quadraticCurveTo(0,-94,46,-58);g.lineTo(46,0);g.closePath();g.fill();
    for(let k=0;k<5;k++){const fh=24+Math.sin(t*9+k*2)*8;g.fillStyle=k%2?'rgba(255,230,140,.95)':'rgba(255,100,20,.9)';g.beginPath();g.moveTo(-36+k*16,0);g.quadraticCurveTo(-30+k*16,-fh*1.6,-24+k*16,0);g.closePath();g.fill();}
    /* наковальня рядом */
    g.fillStyle='#1a1a20';g.fillRect(-150,-22,30,22);g.beginPath();g.moveTo(-160,-36);g.lineTo(-108,-36);g.lineTo(-100,-30);g.lineTo(-108,-24);g.lineTo(-150,-24);g.closePath();g.fill();
    gpush([0,-30,130,'#ff6a1a'],[58,-250,60,'#ff8a2a']);
    /* литейные формы: когда в Печи идёт плавка — течёт металл, готовые слитки сияют */
    {const F=(typeof furn==='function')?furn():{q:[]},act=F.q.length>0;
      g.fillStyle='#1a1214';g.fillRect(104,-18,96,18);g.fillStyle='#2a2024';g.fillRect(100,-22,104,5);
      for(let k=0;k<4;k++){const mx=110+k*23;g.fillStyle='#0a0606';g.fillRect(mx,-20,16,5);
        const fill=act?((t*0.5+k*0.25)%1):0;if(fill>0){g.fillStyle='rgba(255,'+(160+Math.floor(80*fill))+',60,1)';g.fillRect(mx+1,-19,14*fill,3);}}
      if(act){g.strokeStyle='rgba(255,170,60,.95)';g.lineWidth=3;const k=Math.floor(t*0.5*4)%4,mx=118+k*23;g.beginPath();g.moveTo(96,-60);g.quadraticCurveTo(mx,-60,mx,-22);g.stroke();
        g.fillStyle='#3a2a26';g.save();g.translate(90,-62);g.rotate(0.5);g.fillRect(-10,-8,20,14);g.restore();gpush([mx,-24,40,'#ffa040']);
        g.fillStyle='#ffd070';g.font='800 11px system-ui';g.textAlign='center';g.fillText('плавка: '+F.q.length,150,-30);}
      else{g.fillStyle='#8a8478';g.font='700 10px system-ui';g.textAlign='center';g.fillText('печь свободна',150,-30);}}
    g.save();g.translate(0,-150);bSign(g,'ПЕЧЬ',90,-16,'#ffb070',t,false);g.restore();
  }else if(b.id==='hforge'){
    /* адская кузница: рогатая кровля, гигантская наковальня, молоты-автоматы, меха */
    g.fillStyle='#1a1214';g.beginPath();g.moveTo(-118,0);g.lineTo(-110,-118);g.lineTo(110,-118);g.lineTo(118,0);g.closePath();g.fill();
    g.fillStyle='#24181a';for(let r=0;r<5;r++)for(let k=0;k<7;k++)g.fillRect(-108+k*31+(r%2?14:0),-112+r*22,27,18);
    /* крыша с рогами */
    g.fillStyle='#120a0c';g.beginPath();g.moveTo(-134,-112);g.lineTo(0,-176);g.lineTo(134,-112);g.closePath();g.fill();
    g.fillStyle='#3a2a26';for(let k=-4;k<=4;k++){g.beginPath();g.moveTo(k*30-12,-112+Math.abs(k)*1);g.lineTo(k*30,-100);g.lineTo(k*30+12,-112+Math.abs(k)*1);g.closePath();g.fill();}
    g.fillStyle='#d8ccb0';for(const sd of [-1,1]){g.beginPath();g.moveTo(sd*120,-118);g.quadraticCurveTo(sd*160,-150,sd*150,-196);g.quadraticCurveTo(sd*142,-158,sd*104,-126);g.closePath();g.fill();}
    /* открытая мастерская */
    g.fillStyle='#0a0405';g.fillRect(-92,-92,184,92);
    const hot=0.7+0.3*Math.sin(t*5);
    const fg=g.createRadialGradient(-50,-20,4,-50,-20,70);fg.addColorStop(0,'rgba(255,200,90,'+(0.7*hot)+')');fg.addColorStop(1,'rgba(255,60,10,0)');g.fillStyle=fg;g.fillRect(-92,-92,184,92);
    /* горн */
    g.fillStyle='#2a1c1a';g.fillRect(-84,-40,64,40);g.fillStyle='#3a2824';g.fillRect(-88,-46,72,8);
    for(let k=0;k<4;k++){const fh=14+Math.sin(t*11+k*2)*5;g.fillStyle=k%2?'rgba(255,230,140,.95)':'rgba(255,100,20,.9)';g.beginPath();g.moveTo(-78+k*14,-46);g.quadraticCurveTo(-72+k*14,-46-fh*1.5,-66+k*14,-46);g.closePath();g.fill();}
    /* меха */
    {const pu=0.5+0.5*Math.sin(t*2.4);g.fillStyle='#4a2a1a';g.beginPath();g.moveTo(-14,-30);g.lineTo(-2,-30-10*pu);g.lineTo(-2,-14+4*pu);g.lineTo(-14,-18);g.closePath();g.fill();
      g.strokeStyle='#2a1608';g.lineWidth=1;for(let k=1;k<4;k++){g.beginPath();g.moveTo(-14+k*3,-30+(-10*pu)*k/4);g.lineTo(-14+k*3,-18+(4*pu)*k/4);g.stroke();}}
    /* наковальня и молот-автомат */
    g.fillStyle='#2a2a32';g.fillRect(28,-22,30,22);g.beginPath();g.moveTo(14,-38);g.lineTo(72,-38);g.lineTo(82,-32);g.lineTo(72,-26);g.lineTo(22,-26);g.closePath();g.fill();
    g.fillStyle='#4a4a56';g.fillRect(14,-38,58,3);
    {const ph=(t*1.6)%1,ang=ph<0.75?-1.3+ph/0.75*0.3:-1.0+((ph-0.75)/0.25)*1.15;
      g.fillStyle='#1a1214';g.fillRect(84,-90,8,90);
      g.save();g.translate(88,-86);g.rotate(Math.PI-ang);g.strokeStyle='#3a2a20';g.lineWidth=5;g.beginPath();g.moveTo(0,0);g.lineTo(0,46);g.stroke();
      g.fillStyle='#3a3a44';g.fillRect(-12,42,24,14);g.fillStyle='#5a5a66';g.fillRect(-12,42,24,3);g.restore();
      if(ph>0.95&&settings.quality!=='low')for(let k=0;k<3;k++)spawnPart(x+46,-40,rnd(-120,120),rnd(-160,-60),0.4,Math.random()<0.5?'#ffd060':'#ff8a30',2,500);
      if(ph>0.93)gpush([46,-40,60,'#ffd060']);}
    /* раскалённая заготовка */
    g.fillStyle='rgba(255,'+(140+Math.floor(80*hot))+',60,1)';g.fillRect(36,-42,24,4);
    /* стойка оружия */
    for(let k=0;k<4;k++){const wx=-6+k*0;}
    g.strokeStyle='#5a3a20';g.lineWidth=3;g.beginPath();g.moveTo(98,-6);g.lineTo(98,-70);g.moveTo(118,-6);g.lineTo(118,-70);g.stroke();
    const wc=['#ff6a3a','#7ad8ff','#c8ff40','#ff2a5a'];
    for(let k=0;k<4;k++){g.save();g.translate(100+k*5,-66+k*2);g.rotate(0.12);g.fillStyle='#c8ccd8';g.fillRect(0,0,2.4,46);g.fillStyle=wc[k];g.fillRect(-1,-2,4.4,4);g.restore();gpush([102+k*5,-62,14,wc[k]]);}
    /* цепи и вывеска */
    g.strokeStyle='#3a3a40';g.lineWidth=2;for(const sx of [-70,70]){g.beginPath();g.moveTo(sx,-118);g.lineTo(sx,-96);g.stroke();}
    gpush([-50,-40,120,'#ff6a1a'],[0,-60,140,'#ff4a10']);
    if(Math.random()<0.25&&settings.quality!=='low')spawnPart(x-50,-60,rnd(-14,14),rnd(-70,-30),1.2,'#ffb050',2,-20);
    g.save();g.translate(0,-212);bSign(g,'КУЗНИЦА',110,-16,'#ffb070',t,false);g.restore();
  }else if(b.id==='hcasino'){
    /* казино «Семь кругов»: башня с огненным колесом, мигающие огни */
    g.fillStyle='#1a0a12';g.fillRect(-100,-150,200,150);
    g.fillStyle='#260e1a';for(let k=0;k<5;k++)g.fillRect(-100+k*42,-150,6,150);
    g.fillStyle='#120610';g.beginPath();g.moveTo(-116,-150);g.lineTo(-100,-176);g.lineTo(100,-176);g.lineTo(116,-150);g.closePath();g.fill();
    for(let k=0;k<7;k++){g.fillStyle='#120610';g.beginPath();g.moveTo(-96+k*32,-176);g.lineTo(-86+k*32,-196-(k%2)*10);g.lineTo(-76+k*32,-176);g.closePath();g.fill();}
    /* огни по контуру */
    const nL=22;for(let k=0;k<nL;k++){const on=((Math.floor(t*6)+k)%3)===0;const lx=-100+(k/(nL-1))*200,ly=-150;
      g.fillStyle=on?(k%2?'#ffd040':'#ff3a5a'):'#3a1a20';g.beginPath();g.arc(lx,ly,3,0,TAU);g.fill();if(on)gpush([lx,ly,10,k%2?'#ffd040':'#ff3a5a']);}
    for(let k=0;k<8;k++){const on=((Math.floor(t*6)+k)%2)===0;for(const sx of [-100,100]){const ly=-140+k*18;g.fillStyle=on?'#ffd040':'#3a1a20';g.beginPath();g.arc(sx,ly,2.6,0,TAU);g.fill();}}
    /* колесо */
    g.save();g.translate(0,-108);
    const wr=40,sp=t*1.2;
    g.fillStyle='#2a1018';g.beginPath();g.arc(0,0,wr+6,0,TAU);g.fill();
    const SC=['#a0101e','#1a1a1a','#d8a020','#1a1a1a','#a0101e','#1a1a1a','#5a2aa0','#1a1a1a'];
    for(let k=0;k<8;k++){g.fillStyle=SC[k];g.beginPath();g.moveTo(0,0);g.arc(0,0,wr,sp+k*TAU/8,sp+(k+1)*TAU/8);g.closePath();g.fill();}
    g.strokeStyle='#d8a020';g.lineWidth=2;g.beginPath();g.arc(0,0,wr,0,TAU);g.stroke();
    g.fillStyle='#d8a020';g.beginPath();g.arc(0,0,7,0,TAU);g.fill();g.fillStyle='#3a1a00';g.font='900 9px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText('7',0,1);g.textBaseline='alphabetic';
    g.fillStyle='#ffd040';g.beginPath();g.moveTo(0,-wr-10);g.lineTo(-6,-wr-2);g.lineTo(6,-wr-2);g.closePath();g.fill();
    g.restore();gpush([0,-108,80,'#ff3a5a']);
    /* вход-пасть */
    g.fillStyle='#050102';g.beginPath();g.moveTo(-34,0);g.lineTo(-34,-46);g.quadraticCurveTo(0,-72,34,-46);g.lineTo(34,0);g.closePath();g.fill();
    g.fillStyle='#e8dcc0';for(let k=0;k<6;k++){g.beginPath();g.moveTo(-30+k*12,-50+Math.abs(k-2.5)*-3.6);g.lineTo(-24+k*12,-36+Math.abs(k-2.5)*-3.6);g.lineTo(-18+k*12,-50+Math.abs(k-2.5)*-3.6);g.closePath();g.fill();}
    const ig=g.createLinearGradient(0,-46,0,0);ig.addColorStop(0,'rgba(255,40,80,.15)');ig.addColorStop(1,'rgba(255,40,80,.5)');g.fillStyle=ig;g.fillRect(-30,-36,60,36);
    /* кости-скульптуры */
    for(const [dx,rot,pip] of [[-70,0.2,5],[70,-0.25,6]]){g.save();g.translate(dx,-12);g.rotate(rot+Math.sin(t*1.4+dx)*0.05);g.fillStyle='#e8dcc0';g.fillRect(-11,-11,22,22);g.strokeStyle='#8a7a60';g.lineWidth=1;g.strokeRect(-11,-11,22,22);
      g.fillStyle='#a0101e';const P={5:[[-5,-5],[5,-5],[0,0],[-5,5],[5,5]],6:[[-5,-6],[5,-6],[-5,0],[5,0],[-5,6],[5,6]]}[pip];for(const [a,bq] of P){g.beginPath();g.arc(a,bq,2,0,TAU);g.fill();}g.restore();}
    gpush([0,-20,70,'#ff3a5a']);
    g.save();g.translate(0,-230);bSign(g,'КАЗИНО «КОТЁЛ»',160,-16,'#ff9ab0',t,true);g.restore();
  }else if(b.id==='hmarket'){
    /* лавка торговца душами: шатёр из кожи, фонари душ */
    g.fillStyle='#2a1616';g.fillRect(-90,-80,180,80);
    g.fillStyle='#5a1414';g.beginPath();g.moveTo(-110,-80);g.lineTo(0,-170);g.lineTo(110,-80);g.closePath();g.fill();
    g.fillStyle='#7a2020';for(let k=-3;k<=3;k++){g.beginPath();g.moveTo(k*30,-80);g.lineTo(0,-170);g.lineTo(k*30+14,-80);g.closePath();g.fill();}
    g.fillStyle='#3a1010';for(let k=0;k<9;k++){g.beginPath();g.moveTo(-110+k*24.4,-80);g.lineTo(-98+k*24.4,-66);g.lineTo(-86+k*24.4,-80);g.closePath();g.fill();}
    g.fillStyle='#120606';g.fillRect(-60,-60,120,60);
    g.fillStyle='#3a2a20';g.fillRect(-80,-36,160,8);
    /* товары: кристаллы руды Ада */
    const oc=['#ff5a6a','#e8d84a','#5ab8ff','#ffd23a','#3aff6a'];
    for(let k=0;k<5;k++){g.fillStyle=oc[k];g.beginPath();g.moveTo(-60+k*28,-36);g.lineTo(-54+k*28,-52-(k%2)*6);g.lineTo(-48+k*28,-36);g.closePath();g.fill();gpush([-54+k*28,-44,20,oc[k]]);}
    for(const sx of [-100,100]){const sw=Math.sin(t*1.3+sx)*3;
      g.strokeStyle='#3a3a40';g.lineWidth=1.5;g.beginPath();g.moveTo(sx,-84);g.lineTo(sx+sw,-64);g.stroke();
      const a=0.6+0.3*Math.sin(t*3+sx);g.fillStyle='rgba(120,220,255,'+a+')';g.beginPath();g.ellipse(sx+sw,-56,6,9,0,0,TAU);g.fill();
      gpush([sx+sw,-56,40,'#5ab8ff']);}
    g.save();g.translate(0,-190);bSign(g,'РЫНОК ДУШ',130,-16,'#9ad8ff',t,true);g.restore();
  }else if(b.id==='altar'){
    /* круг колонн и парящие кристаллы душ */
    g.fillStyle='#14121c';g.beginPath();g.ellipse(0,-6,110,18,0,0,TAU);g.fill();
    g.fillStyle='#1e1a2a';g.fillRect(-40,-34,80,30);g.fillStyle='#2a2438';g.fillRect(-48,-40,96,8);
    for(const cx of [-100,-60,60,100]){
      g.fillStyle='#1a1624';g.fillRect(cx-9,-150+Math.abs(cx)*0.3,18,150-Math.abs(cx)*0.3);
      g.fillStyle='#2a2438';g.fillRect(cx-12,-156+Math.abs(cx)*0.3,24,8);
      const a=0.5+0.4*Math.sin(t*2+cx);g.fillStyle='rgba(120,210,255,'+a+')';for(let k=0;k<3;k++)g.fillRect(cx-2,-130+Math.abs(cx)*0.3+k*26,4,10);
    }
    for(let k=0;k<5;k++){const a=t*0.8+k*TAU/5,rx=Math.cos(a)*60,ry=-110+Math.sin(a)*14;
      g.fillStyle='rgba(150,230,255,.9)';g.beginPath();g.moveTo(rx,ry-12);g.lineTo(rx+6,ry);g.lineTo(rx,ry+12);g.lineTo(rx-6,ry);g.closePath();g.fill();
      gpush([rx,ry,30,'#5ab8ff']);}
    const p=1+0.1*Math.sin(t*3);
    const sg=g.createRadialGradient(0,-70,2,0,-70,40*p);sg.addColorStop(0,'rgba(220,250,255,.95)');sg.addColorStop(0.4,'rgba(90,184,255,.6)');sg.addColorStop(1,'rgba(40,80,200,0)');
    g.fillStyle=sg;g.beginPath();g.arc(0,-70,40*p,0,TAU);g.fill();
    gpush([0,-70,110,'#5ab8ff']);
    if(Math.random()<0.2&&settings.quality!=='low')spawnPart(x+rnd(-30,30),-40,rnd(-8,8),rnd(-50,-20),1.4,'#9ad8ff',2,-20);
    g.save();g.translate(0,-200);bSign(g,'АЛТАРЬ ДУШ',130,-16,'#9ad8ff',t,false);g.restore();
  }else if(b.id==='board'){
    /* доска с приколотыми кинжалами свитками */
    g.fillStyle='#2a1a10';g.fillRect(-70,-120,10,120);g.fillRect(60,-120,10,120);
    g.fillStyle='#4a2c18';g.fillRect(-84,-130,168,90);
    g.strokeStyle='#2a1608';g.lineWidth=2;for(let k=1;k<6;k++){g.beginPath();g.moveTo(-84,-130+k*15);g.lineTo(84,-130+k*15);g.stroke();}
    g.fillStyle='#3a2010';g.beginPath();g.moveTo(-96,-130);g.lineTo(0,-160);g.lineTo(96,-130);g.closePath();g.fill();
    const L=(player.contracts&&player.contracts.list)||[];
    for(let k=0;k<3;k++){
      const px=-64+k*46,py=-122+(k%2)*8,ready=L[k]&&L[k].ready;
      g.fillStyle=ready?'#e8f0c8':'#d8c8a0';g.fillRect(px,py,36,46);
      g.fillStyle='rgba(60,30,10,.6)';for(let q=0;q<5;q++)g.fillRect(px+5,py+8+q*7,26-(q%2)*8,2);
      g.fillStyle='#8a0a0a';g.beginPath();g.arc(px+18,py+38,4,0,TAU);g.fill();
      g.fillStyle='#b8bcc8';g.beginPath();g.moveTo(px+16,py-6);g.lineTo(px+20,py-6);g.lineTo(px+18,py+8);g.closePath();g.fill();g.fillStyle='#3a2a1a';g.fillRect(px+15,py-12,6,6);
      if(ready)gpush([px+18,py+22,30,'#7dffb0']);
    }
    for(const sx of [-110,110]){g.fillStyle='#1a1214';g.fillRect(sx-2,-60,4,60);
      for(let q=0;q<3;q++){const fh=10+Math.sin(t*10+q+sx)*3;g.fillStyle=q===1?'#ffd060':'#ff5a1a';g.beginPath();g.moveTo(sx-5+q*4,-60);g.quadraticCurveTo(sx-3+q*4,-60-fh,sx-1+q*4,-60);g.closePath();g.fill();}
      gpush([sx,-66,40,'#ff6a1a']);}
    g.save();g.translate(0,-180);bSign(g,'КОНТРАКТЫ',130,-16,'#ffd98a',t,false);g.restore();
  }else if(b.id==='portal3'){
    /* Врата Пустоты: огромное кольцо с запечатанными рунами */
    g.fillStyle='#120e18';g.fillRect(-120,-20,240,20);g.fillStyle='#1c1624';g.fillRect(-100,-34,200,14);
    g.save();g.translate(0,-130);
    g.fillStyle='#1a1424';g.beginPath();g.arc(0,0,104,0,TAU);g.arc(0,0,80,0,TAU,true);g.fill();
    for(let k=0;k<12;k++){const a=k/12*TAU+t*0.05;g.save();g.rotate(a);g.fillStyle='#2a2238';g.fillRect(-7,-108,14,30);
      const lit=0.25+0.15*Math.sin(t*2+k);g.fillStyle='rgba(180,150,255,'+lit+')';g.fillRect(-2,-100,4,14);g.restore();}
    const vg=g.createRadialGradient(0,0,4,0,0,80);vg.addColorStop(0,'rgba(0,0,0,1)');vg.addColorStop(0.7,'rgba(30,10,60,.9)');vg.addColorStop(1,'rgba(90,40,160,.6)');
    g.fillStyle=vg;g.beginPath();g.arc(0,0,80,0,TAU);g.fill();
    g.strokeStyle='rgba(160,120,255,.35)';g.lineWidth=2;
    for(let k=0;k<3;k++){g.beginPath();g.arc(0,0,20+k*18+Math.sin(t*1.5+k)*4,t*(0.4+k*0.2),t*(0.4+k*0.2)+Math.PI*1.3);g.stroke();}
    /* печать-замок */
    g.strokeStyle='rgba(255,90,60,.7)';g.lineWidth=4;g.beginPath();g.moveTo(-60,-50);g.lineTo(60,50);g.moveTo(60,-50);g.lineTo(-60,50);g.stroke();
    g.fillStyle='#3a1a14';g.beginPath();g.arc(0,0,14,0,TAU);g.fill();g.fillStyle='#ff6a3a';g.font='900 16px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText('III',0,1);g.textBaseline='alphabetic';
    g.restore();
    /* малый портал домой */
    {const px=150,py=-40,p=1+0.06*Math.sin(t*3);
      const pg=g.createRadialGradient(px,py,2,px,py,30*p);pg.addColorStop(0,'rgba(220,255,250,.95)');pg.addColorStop(0.5,'rgba(90,224,255,.7)');pg.addColorStop(1,'rgba(40,120,200,0)');
      g.fillStyle=pg;g.beginPath();g.ellipse(px,py,22*p,34*p,0,0,TAU);g.fill();
      g.strokeStyle='#2a3a4a';g.lineWidth=5;g.beginPath();g.ellipse(px,py,24,36,0,0,TAU);g.stroke();
      gpush([px,py,60,'#5ae0ff']);}
    gpush([0,-130,120,'#7a4aff']);
    g.save();g.translate(0,-262);bSign(g,'ВРАТА ПУСТОТЫ',150,-16,'#c8b0ff',t,false);g.restore();
  }
  g.restore();
}
/* --------- здания --------- */
function bSign(g,text,w,y,colTxt,t,chain){
  g.fillStyle='#1c1410';g.fillRect(-w/2,y,w,26);
  g.strokeStyle='#caa24a';g.lineWidth=2;g.strokeRect(-w/2+1,y+1,w-2,24);
  if(chain){g.strokeStyle='#3a3a40';g.lineWidth=2;g.beginPath();g.moveTo(-w/2+8,y);g.lineTo(-w/2+8,y-14);g.moveTo(w/2-8,y);g.lineTo(w/2-8,y-14);g.stroke();}
  g.fillStyle=colTxt||'#ffd98a';g.font='800 14px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';
  g.fillText(text,0,y+14);g.textBaseline='alphabetic';
}
function bWindow(g,x,y,w,h,lit,glowList,gx){
  g.fillStyle='#2a1c10';g.fillRect(x-2,y-2,w+4,h+4);
  g.fillStyle=lit?'#ffcf70':'#202838';g.fillRect(x,y,w,h);
  if(lit){g.fillStyle='rgba(255,255,255,.35)';g.fillRect(x+2,y+2,w*0.4,h-4);glowList.push([gx+x+w/2,y+h/2,46,'#ffc060']);}
  g.strokeStyle='#2a1c10';g.lineWidth=2;g.beginPath();g.moveTo(x+w/2,y);g.lineTo(x+w/2,y+h);g.moveTo(x,y+h/2);g.lineTo(x+w,y+h/2);g.stroke();
}
function drawBuilding(g,b,glowList){
  glowList=glowList||[];
  const x=b.x,t=performance.now()/1000;
  g.save();
  g.translate(x,0);
  g.fillStyle='rgba(0,0,0,.28)';
  g.beginPath();g.ellipse(0,4,108,14,0,0,TAU);g.fill();
  if(b.id==='mine'){
    /* каменный холм с входом */
    const hg=g.createLinearGradient(0,-180,0,0);hg.addColorStop(0,'#5a5a64');hg.addColorStop(1,'#3a3a44');
    g.fillStyle=hg;
    g.beginPath();g.moveTo(-118,0);g.quadraticCurveTo(-112,-120,-50,-160);g.quadraticCurveTo(0,-190,52,-160);g.quadraticCurveTo(112,-120,118,0);g.closePath();g.fill();
    g.fillStyle='rgba(0,0,0,.18)';
    for(let i=0;i<7;i++){g.beginPath();g.ellipse(-90+i*30+((i*13)%9),-30-((i*29)%90),10+(i%3)*4,6+(i%2)*3,0.4,0,TAU);g.fill();}
    g.fillStyle='#4a7a36';g.beginPath();g.moveTo(-60,-158);g.quadraticCurveTo(0,-192,56,-158);g.lineTo(46,-150);g.quadraticCurveTo(0,-180,-50,-150);g.closePath();g.fill();
    /* проём */
    const dg=g.createLinearGradient(0,-130,0,0);dg.addColorStop(0,'#020204');dg.addColorStop(1,'#0e0e16');
    g.fillStyle=dg;
    g.beginPath();g.moveTo(-42,0);g.lineTo(-42,-92);g.quadraticCurveTo(-42,-134,0,-134);g.quadraticCurveTo(42,-134,42,-92);g.lineTo(42,0);g.closePath();g.fill();
    /* крепь */
    g.fillStyle='#6b4a2a';g.fillRect(-52,-98,12,100);g.fillRect(40,-98,12,100);
    g.fillStyle='#8a6238';g.fillRect(-52,-98,3,100);g.fillRect(40,-98,3,100);
    g.fillStyle='#7a5632';g.fillRect(-58,-108,116,12);g.fillStyle='#9a7040';g.fillRect(-58,-108,116,3);
    g.strokeStyle='#6b4a2a';g.lineWidth=7;g.beginPath();g.moveTo(-48,-92);g.lineTo(-30,-108);g.moveTo(48,-92);g.lineTo(30,-108);g.stroke();
    /* рельсы и вагонетка */
    g.fillStyle='#4a3a2a';for(let i=-30;i<130;i+=14)g.fillRect(i,-3,7,5);
    g.fillStyle='#9aa0aa';g.fillRect(-34,-5,170,2);g.fillRect(-34,-1,170,2);
    g.fillStyle='#5a4a3c';g.beginPath();g.moveTo(54,-16);g.lineTo(104,-16);g.lineTo(98,-34);g.lineTo(60,-34);g.closePath();g.fill();
    g.fillStyle='#7a6a58';g.fillRect(54,-22,50,3);
    g.fillStyle='#b06a3b';for(let i=0;i<6;i++){g.beginPath();g.arc(62+i*7,-35+(i%2)*2,5,0,TAU);g.fill();}
    g.fillStyle='#8fe0ff';g.beginPath();g.arc(80,-38,3.4,0,TAU);g.fill();
    g.fillStyle='#222';g.beginPath();g.arc(66,-8,6,0,TAU);g.arc(92,-8,6,0,TAU);g.fill();
    g.fillStyle='#777';g.beginPath();g.arc(66,-8,2,0,TAU);g.arc(92,-8,2,0,TAU);g.fill();
    /* фонарь, мерцающий */
    const fl=0.8+0.2*Math.sin(t*10);
    g.strokeStyle='#3a3a40';g.lineWidth=1.5;g.beginPath();g.moveTo(-52,-98);g.lineTo(-52,-84);g.stroke();
    g.fillStyle='#caa24a';g.fillRect(-57,-84,10,13);g.fillStyle='#ffe3a0';g.fillRect(-55,-82,6,9);
    glowList.push([x-52,-78,80*fl,'#ffd98a']);
    /* кристаллы у входа */
    g.fillStyle='#8fe0ff';g.beginPath();g.moveTo(-86,0);g.lineTo(-82,-18);g.lineTo(-78,0);g.closePath();g.fill();
    g.beginPath();g.moveTo(-80,0);g.lineTo(-74,-12);g.lineTo(-70,0);g.closePath();g.fill();
    glowList.push([x-80,-10,30,'#8fe0ff']);
    /* крест-накрест кирки и вывеска */
    g.save();g.translate(0,-175);
    bSign(g,'ШАХТА',92,-16,'#ffd98a',t,true);
    g.strokeStyle='#9aa0aa';g.lineWidth=3;g.beginPath();g.moveTo(-14,-52);g.lineTo(14,-28);g.moveTo(14,-52);g.lineTo(-14,-28);g.stroke();
    g.restore();
  } else if(b.id==='market'){
    /* каменный низ и деревянный верх */
    g.fillStyle='#6a6f7c';g.fillRect(-82,-58,164,58);
    g.fillStyle='rgba(0,0,0,.2)';for(let r=0;r<4;r++)for(let c=0;c<9;c++)g.fillRect(-82+c*18+(r%2?9:0),-58+r*14,17,1.4);
    g.fillStyle='#8a5a30';g.fillRect(-80,-120,160,64);
    g.strokeStyle='#4a2c14';g.lineWidth=3;
    g.beginPath();g.moveTo(-80,-120);g.lineTo(-40,-56);g.moveTo(80,-120);g.lineTo(40,-56);g.moveTo(-20,-120);g.lineTo(-20,-56);g.moveTo(20,-120);g.lineTo(20,-56);g.stroke();
    /* крыша */
    g.fillStyle='#8a2a24';
    g.beginPath();g.moveTo(-96,-118);g.lineTo(0,-168);g.lineTo(96,-118);g.lineTo(88,-110);g.lineTo(0,-156);g.lineTo(-88,-110);g.closePath();g.fill();
    g.fillStyle='rgba(255,255,255,.1)';for(let i=-4;i<4;i++){g.fillRect(i*20,-160+Math.abs(i)*7,14,3);}
    /* окна верхнего этажа */
    bWindow(g,-68,-104,24,26,true,glowList,x);bWindow(g,44,-104,24,26,true,glowList,x);
    /* табло с котировками */
    g.fillStyle='#0a1210';g.fillRect(-32,-112,64,30);g.strokeStyle='#caa24a';g.lineWidth=2;g.strokeRect(-32,-112,64,30);
    for(let r=0;r<3;r++){
      const up=Math.sin(t*1.3+r*2)>0;
      g.fillStyle=up?'#5ee06a':'#ff6a6a';g.font='700 8px monospace';g.textAlign='left';
      const v=(100+Math.floor((Math.sin(t*0.9+r)*40)+r*37));
      g.fillText((['Fe','Au','Ag'][r])+' '+v+(up?'▲':'▼'),-28,-102+r*9);
    }
    /* навес прилавка */
    for(let i=0;i<8;i++){g.fillStyle=i%2?'#c94a2a':'#e8e0d0';g.beginPath();g.moveTo(-84+i*21,-58);g.lineTo(-63+i*21,-58);g.lineTo(-63+i*21,-46+Math.sin(t*2+i)*1);g.quadraticCurveTo(-73+i*21,-40,-84+i*21,-46);g.closePath();g.fill();}
    /* прилавок с рудой и весами */
    g.fillStyle='#7a5632';g.fillRect(-66,-30,132,8);g.fillStyle='#8a6a3a';g.fillRect(-66,-22,132,22);
    g.fillStyle='rgba(0,0,0,.18)';for(let i=0;i<6;i++)g.fillRect(-66+i*22,-22,1.4,22);
    const cols=['#b06a3b','#c8a98a','#ffcc33','#22c46b','#e0344a','#8fe0ff'];
    for(let i=0;i<6;i++){
      g.fillStyle=cols[i];g.beginPath();g.arc(-52+i*21,-36,6.5,0,TAU);g.fill();
      g.fillStyle='rgba(255,255,255,.45)';g.beginPath();g.arc(-54+i*21,-38,2,0,TAU);g.fill();
    }
    g.strokeStyle='#3a3a40';g.lineWidth=2;g.beginPath();g.moveTo(0,-62);g.lineTo(0,-46);g.moveTo(-16,-46);g.lineTo(16,-46);g.stroke();
    const tilt=Math.sin(t*1.2)*2;
    g.beginPath();g.moveTo(-16,-46);g.lineTo(-16,-40+tilt);g.moveTo(16,-46);g.lineTo(16,-40-tilt);g.stroke();
    g.fillStyle='#caa24a';g.fillRect(-22,-40+tilt,12,3);g.fillRect(10,-40-tilt,12,3);
    /* ящики, бочка */
    g.fillStyle='#7a5632';g.fillRect(-100,-18,22,18);g.fillRect(-96,-34,18,16);
    g.strokeStyle='#4a2c14';g.lineWidth=1.4;g.strokeRect(-99.5,-17.5,21,17);g.strokeRect(-95.5,-33.5,17,15);
    g.fillStyle='#6a4018';g.beginPath();g.ellipse(94,-10,9,10,0,0,TAU);g.fill();g.strokeStyle='#caa24a';g.beginPath();g.ellipse(94,-10,9,3,0,0,TAU);g.stroke();
    /* флаг */
    g.strokeStyle='#4a2c14';g.lineWidth=3;g.beginPath();g.moveTo(0,-168);g.lineTo(0,-200);g.stroke();
    g.fillStyle='#ffd24a';g.beginPath();g.moveTo(0,-200);
    for(let k=0;k<=6;k++)g.lineTo(k*5,-200+Math.sin(t*5+k*0.8)*2);
    for(let k=6;k>=0;k--)g.lineTo(k*5,-188+Math.sin(t*5+k*0.8)*2);
    g.closePath();g.fill();
    g.save();g.translate(0,-170);bSign(g,'БИРЖА',80,-14,'#ffd98a',t,false);g.restore();
  } else if(b.id==='forge'){
    g.fillStyle='#4a4a54';g.fillRect(-84,-112,168,112);
    g.fillStyle='rgba(0,0,0,.22)';for(let r=0;r<8;r++)for(let c=0;c<10;c++)g.fillRect(-84+c*17+(r%2?8:0),-112+r*14,16,1.4);
    g.fillStyle='rgba(255,255,255,.06)';g.fillRect(-84,-112,168,4);
    /* крыша */
    g.fillStyle='#2a2a34';g.beginPath();g.moveTo(-96,-110);g.lineTo(-60,-146);g.lineTo(60,-146);g.lineTo(96,-110);g.closePath();g.fill();
    g.fillStyle='rgba(255,255,255,.07)';for(let i=0;i<8;i++)g.fillRect(-56+i*14,-142+(i%2)*2,12,3);
    /* труба и дым */
    g.fillStyle='#5a5a66';g.fillRect(34,-198,30,60);g.fillStyle='#3a3a44';g.fillRect(30,-202,38,8);
    for(let i=0;i<6;i++){
      const pp=((t*0.35+i/6)%1);
      g.fillStyle='rgba(150,150,170,'+(0.3*(1-pp))+')';
      g.beginPath();g.arc(49+Math.sin(t*0.9+i)*10+pp*18,-206-pp*80,7+pp*20,0,TAU);g.fill();
    }
    /* горн */
    const fire=0.5+0.5*Math.sin(t*8);
    g.fillStyle='#1a1214';g.beginPath();g.moveTo(-70,0);g.lineTo(-70,-58);g.quadraticCurveTo(-48,-84,-26,-58);g.lineTo(-26,0);g.closePath();g.fill();
    for(let i=0;i<5;i++){
      const fx=-60+i*8,fh=26+Math.sin(t*9+i*1.7)*8+fire*6;
      const fg=g.createLinearGradient(0,-fh,0,0);fg.addColorStop(0,'rgba(255,230,120,.95)');fg.addColorStop(1,'rgba(255,90,20,.9)');
      g.fillStyle=fg;g.beginPath();g.moveTo(fx-5,-4);g.quadraticCurveTo(fx,-fh,fx+5,-4);g.closePath();g.fill();
    }
    glowList.push([x-48,-36,120+fire*20,'#ff7a2a']);
    if(Math.random()<0.2)spawnPart(x-48+rnd(-12,12),-40,rnd(-30,30),rnd(-90,-40),0.8,'#ffb050',2,300);
    /* окно и стойка с инструментами */
    bWindow(g,8,-90,24,22,true,glowList,x);
    g.fillStyle='#3a2a1a';g.fillRect(40,-78,38,5);
    g.strokeStyle='#9aa0aa';g.lineWidth=2;
    g.beginPath();g.moveTo(46,-74);g.lineTo(46,-52);g.moveTo(40,-60);g.lineTo(52,-60);g.moveTo(60,-74);g.lineTo(60,-50);g.moveTo(72,-74);g.lineTo(72,-56);g.stroke();
    g.fillStyle='#caa24a';g.fillRect(58,-52,4,4);
    /* наковальня на пне, молот, бочка */
    g.fillStyle='#5a3f22';g.fillRect(36,-22,26,22);g.fillStyle='#6a4a2a';g.beginPath();g.ellipse(49,-22,13,4,0,0,TAU);g.fill();
    g.fillStyle='#2a2d34';g.fillRect(36,-34,26,6);g.fillRect(42,-28,14,6);
    g.beginPath();g.moveTo(32,-34);g.lineTo(66,-34);g.lineTo(72,-30);g.lineTo(36,-28);g.closePath();g.fill();
    g.strokeStyle='#6a4a2a';g.lineWidth=3;g.beginPath();g.moveTo(74,-3);g.lineTo(88,-22);g.stroke();g.fillStyle='#3a3a40';g.fillRect(82,-28,14,8);
    g.fillStyle='#3a5a8a';g.beginPath();g.ellipse(-92,-12,10,12,0,0,TAU);g.fill();g.strokeStyle='#caa24a';g.beginPath();g.ellipse(-92,-12,10,3,0,0,TAU);g.stroke();
    g.fillStyle='#7ac0ff';g.beginPath();g.ellipse(-92,-23,8,2.4,0,0,TAU);g.fill();
    /* подкова над входом */
    g.strokeStyle='#caa24a';g.lineWidth=3;g.beginPath();g.arc(0,-70,8,Math.PI*0.2,Math.PI*0.8,true);g.stroke();
    g.save();g.translate(0,-142);bSign(g,'КУЗНИЦА',92,-16,'#ffd98a',t,true);g.restore();
  } else if(b.id==='casino'){
    const bg=g.createLinearGradient(0,-130,0,0);bg.addColorStop(0,'#3a1a58');bg.addColorStop(1,'#220e38');
    g.fillStyle=bg;g.fillRect(-88,-130,176,130);
    g.fillStyle='#caa24a';g.fillRect(-92,-136,184,8);g.fillRect(-92,-6,184,6);
    /* колонны */
    for(const cx of [-78,78]){g.fillStyle='#e8d8a0';g.fillRect(cx-6,-130,12,128);g.fillStyle='rgba(0,0,0,.18)';g.fillRect(cx+2,-130,4,128);g.fillStyle='#caa24a';g.fillRect(cx-9,-136,18,6);g.fillRect(cx-9,-8,18,6);}
    /* неоновая рамка вывески: бегущие огни */
    const cols=['#ff4d9d','#4dffd0','#ffd94d','#8d4dff'];
    g.fillStyle='#120820';g.fillRect(-70,-198,140,52);
    g.strokeStyle='#caa24a';g.lineWidth=2;g.strokeRect(-70,-198,140,52);
    for(let i=0;i<22;i++){
      const px=-66+i*6.2,on=((Math.floor(t*6)+i)%4===0);
      g.fillStyle=on?'#fff8c0':hexA(cols[i%4],0.5);
      g.beginPath();g.arc(px,-195,2.2,0,TAU);g.arc(px,-149,2.2,0,TAU);g.fill();
      if(on)glowList.push([x+px,-195,18,'#ffe080']);
    }
    for(let i=0;i<7;i++){const py=-190+i*7;const on=((Math.floor(t*6)+i)%3===0);g.fillStyle=on?'#fff8c0':hexA(cols[(i+1)%4],0.5);g.beginPath();g.arc(-66,py,2.2,0,TAU);g.arc(66,py,2.2,0,TAU);g.fill();}
    g.fillStyle='#ffd98a';g.font='800 20px system-ui,sans-serif';g.textAlign='center';
    const pulse=0.75+0.25*Math.sin(t*4);
    g.shadowColor='#ff4d9d';g.shadowBlur=10*pulse;g.fillText('КАЗИНО',0,-166);g.shadowBlur=0;
    /* вращающаяся звезда-рулетка */
    g.save();g.translate(0,-214);g.rotate(t*1.2);
    g.fillStyle='#ffd94d';
    for(let k=0;k<8;k++){g.rotate(TAU/8);g.beginPath();g.moveTo(0,0);g.lineTo(4,-16);g.lineTo(-4,-16);g.closePath();g.fill();}
    g.fillStyle='#ff4d9d';g.beginPath();g.arc(0,0,6,0,TAU);g.fill();g.restore();
    glowList.push([x,-214,50,'#ffd94d']);
    /* окна с игровыми автоматами */
    for(const wx of [-62,34]){
      g.fillStyle='#0a0510';g.fillRect(wx,-100,28,40);g.strokeStyle='#caa24a';g.lineWidth=2;g.strokeRect(wx,-100,28,40);
      for(let r=0;r<3;r++){
        const sym=['🍒','7','💎','⭐'][(Math.floor(t*(2+r*0.7))+r)%4];
        g.fillStyle='#f4efe0';g.fillRect(wx+3+r*8,-92,7,20);
        g.fillStyle='#d03a3a';g.font='700 9px system-ui,sans-serif';g.textAlign='center';g.fillText(sym,wx+6.5+r*8,-78);
      }
      glowList.push([x+wx+14,-80,40,'#ff4d9d']);
    }
    /* двери с позолотой и красная дорожка */
    g.fillStyle='#4a0a14';g.fillRect(-24,-72,48,72);g.fillStyle='#6a1220';g.fillRect(-22,-70,20,70);g.fillRect(2,-70,20,70);
    g.fillStyle='#ffd98a';g.beginPath();g.arc(-6,-34,2.6,0,TAU);g.arc(6,-34,2.6,0,TAU);g.fill();
    g.strokeStyle='#caa24a';g.lineWidth=2;g.beginPath();g.arc(0,-72,24,Math.PI,0);g.stroke();
    g.fillStyle='#b02438';g.beginPath();g.moveTo(-20,0);g.lineTo(-30,12);g.lineTo(30,12);g.lineTo(20,0);g.closePath();g.fill();
    g.fillStyle='#ffd98a';g.fillRect(-30,10,60,2);
    /* прожекторы */
    g.save();g.globalCompositeOperation='lighter';
    for(let k=0;k<2;k++){
      const a=Math.sin(t*0.8+k*3)*0.5+(k?0.3:-0.3);
      g.fillStyle='rgba(255,230,160,.08)';
      g.beginPath();g.moveTo(-60+k*120,-140);g.lineTo(-60+k*120+Math.sin(a)*160-26,-300);g.lineTo(-60+k*120+Math.sin(a)*160+26,-300);g.closePath();g.fill();
    }
    g.restore();
  } else if(b.id==='portal'){
    /* портал в Ад: кольцо той же формы, что Врата Пустоты, но в камне и рунах Земли надежды */
    const pu=0.5+0.5*Math.sin(t*2),open=player.prog&&player.prog.hellUnlocked;
    /* постамент со ступенями */
    g.fillStyle='#2e2e3c';g.fillRect(-120,-20,240,20);g.fillStyle='#3a3a4a';g.fillRect(-100,-34,200,14);
    g.fillStyle='rgba(255,255,255,.07)';g.fillRect(-120,-20,240,2);g.fillRect(-100,-34,200,2);
    g.strokeStyle='rgba(20,20,30,.5)';g.lineWidth=1;for(let k=-100;k<=100;k+=25){g.beginPath();g.moveTo(k,-34);g.lineTo(k,-20);g.stroke();}
    for(const sx of [-1,1]){g.fillStyle='#2a2a3a';g.fillRect(sx*100-(sx<0?14:0),-52,14,32);g.fillStyle='#4a4a5c';g.fillRect(sx*100-(sx<0?16:-2)-2,-56,18,6);}
    g.save();g.translate(0,-130);
    /* сам портал внутри кольца: фиолетовые вихревые слои */
    const ig=g.createRadialGradient(0,0,4,0,0,80);ig.addColorStop(0,'rgba(40,16,70,.95)');ig.addColorStop(0.7,'rgba(30,14,60,.85)');ig.addColorStop(1,'rgba(90,50,170,.6)');
    g.fillStyle=ig;g.beginPath();g.arc(0,0,80,0,TAU);g.fill();
    for(let i=0;i<5;i++){const r=74-i*12,a=t*(0.6+i*0.25);
      const grd=g.createRadialGradient(0,0,2,0,0,r);grd.addColorStop(0,'rgba(230,190,255,'+(0.5-i*0.07)+')');grd.addColorStop(0.6,'rgba(140,60,255,'+(0.35-i*0.05)+')');grd.addColorStop(1,'rgba(60,10,120,0)');
      g.fillStyle=grd;g.save();g.rotate(a);g.beginPath();g.ellipse(0,0,r,r*0.62,0,0,TAU);g.fill();g.restore();}
    g.strokeStyle='rgba(200,160,255,.3)';g.lineWidth=2;
    for(let k=0;k<3;k++){g.beginPath();g.arc(0,0,22+k*18+Math.sin(t*1.5+k)*4,t*(0.5+k*0.2),t*(0.5+k*0.2)+Math.PI*1.2);g.stroke();}
    /* каменное кольцо: тот же профиль, что у Врат Пустоты, но серый камень Земли */
    const rg=g.createLinearGradient(0,-104,0,104);rg.addColorStop(0,'#55556c');rg.addColorStop(0.5,'#4a4a60');rg.addColorStop(1,'#2a2a3a');
    g.fillStyle=rg;g.beginPath();g.arc(0,0,104,0,TAU);g.arc(0,0,80,0,TAU,true);g.fill();
    g.strokeStyle='rgba(255,255,255,.08)';g.lineWidth=2;g.beginPath();g.arc(0,0,102,Math.PI*1.1,Math.PI*1.75);g.stroke();
    g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=2;g.beginPath();g.arc(0,0,81,0,TAU);g.stroke();
    /* 12 каменных блоков с пульсирующими рунами */
    for(let k=0;k<12;k++){const a=k/12*TAU+t*0.05;g.save();g.rotate(a);
      g.fillStyle='#5e5e76';g.fillRect(-8,-109,16,32);g.fillStyle='rgba(255,255,255,.08)';g.fillRect(-8,-109,16,2);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(-8,-79,16,2);
      g.strokeStyle='rgba(190,140,255,'+(0.4+0.5*(0.5+0.5*Math.sin(t*2+k*0.6)))+')';g.lineWidth=2;g.lineCap='round';g.save();g.translate(0,-93);g.beginPath();
      if(k%3===0){g.moveTo(-4,-5);g.lineTo(4,0);g.lineTo(-4,5);}else if(k%3===1){g.moveTo(0,-6);g.lineTo(0,6);g.moveTo(-4,-2);g.lineTo(4,-2);}else{g.arc(0,0,4,0,TAU);}
      g.stroke();g.restore();g.restore();}
    g.restore();
    glowList.push([x,-130,130,'#b070ff']);
    /* парящие камни вокруг кольца */
    for(let k=0;k<5;k++){
      const a=t*0.5+k*TAU/5,rx=Math.cos(a)*128,ry=-130+Math.sin(a)*118*0.35+Math.sin(t*1.3+k)*6;
      g.fillStyle='#3a3a4a';g.beginPath();g.moveTo(rx-7,ry);g.lineTo(rx-2,ry-8);g.lineTo(rx+7,ry-2);g.lineTo(rx+3,ry+7);g.closePath();g.fill();
      g.fillStyle='rgba(190,140,255,'+(0.4+0.4*pu)+')';g.fillRect(rx-1,ry-2,3,3);
    }
    /* жаровни с фиолетовым огнём */
    for(const bx of [-140,140]){
      g.fillStyle='#2a2a34';g.fillRect(bx-3,-34,6,34);g.beginPath();g.moveTo(bx-12,-34);g.lineTo(bx+12,-34);g.lineTo(bx+7,-24);g.lineTo(bx-7,-24);g.closePath();g.fill();
      for(let k=0;k<3;k++){const fh=14+Math.sin(t*8+k*2+bx)*5;g.fillStyle=k===1?'rgba(230,200,255,.9)':'rgba(150,80,255,.85)';g.beginPath();g.moveTo(bx-6+k*5,-34);g.quadraticCurveTo(bx-4+k*5,-34-fh,bx-1+k*5,-34);g.closePath();g.fill();}
      glowList.push([x+bx,-44,50,'#9a60ff']);
    }
    if(Math.random()<0.25&&settings.quality!=='low')spawnPart(x+rnd(-50,50),-130+rnd(-50,50),rnd(-10,10),rnd(-50,-20),1.2,'#c8a0ff',2,-30);
    if(open){g.save();g.globalCompositeOperation='lighter';const hg=g.createRadialGradient(0,-130,4,0,-130,120);hg.addColorStop(0,'rgba(255,120,40,.4)');hg.addColorStop(1,'rgba(255,60,10,0)');g.fillStyle=hg;g.beginPath();g.arc(0,-130,120,0,TAU);g.fill();g.restore();}
    g.save();g.translate(0,-262);bSign(g,'В АД',92,-16,open?'#ffb070':'#d8a0ff',t,true);g.restore();
  }
  g.restore();
}

const menuParts=[];
for(let i=0;i<70;i++)menuParts.push({x:Math.random(),y:Math.random(),s:rnd(0.5,2.2),v:rnd(0.02,0.06),p:Math.random()*TAU});
function renderMenu(dt){
  const W=view.W,H=view.H,t=performance.now()/1000;
  const gy=H*0.3;                          /* линия поверхности */
  const hell=!!(player.prog&&player.prog.hellUnlocked);
  /* небо */
  const sk=ctx.createLinearGradient(0,0,0,gy);
  sk.addColorStop(0,'#070b1c');sk.addColorStop(0.7,'#1c2a52');sk.addColorStop(1,'#5a4a6a');
  ctx.fillStyle=sk;ctx.fillRect(0,0,W,gy);
  for(let i=0;i<60;i++){const hx=hash2(i,4,55),hy=hash2(i,6,56);
    ctx.globalAlpha=0.3+0.6*Math.abs(Math.sin(t*(0.4+(i%5)*0.2)+i));ctx.fillStyle='#fff';
    ctx.fillRect((hx%1000)/1000*W,(hy%1000)/1000*gy*0.85,(i%9===0)?2:1.2,(i%9===0)?2:1.2);}
  ctx.globalAlpha=1;
  {const mx=W*0.82,my=gy*0.32;const mg=ctx.createRadialGradient(mx,my,6,mx,my,70);mg.addColorStop(0,'rgba(255,240,210,.35)');mg.addColorStop(1,'rgba(255,240,210,0)');
    ctx.fillStyle=mg;ctx.beginPath();ctx.arc(mx,my,70,0,TAU);ctx.fill();ctx.fillStyle='#f2e8d0';ctx.beginPath();ctx.arc(mx,my,18,0,TAU);ctx.fill();}
  /* горы */
  ctx.fillStyle='#1a2040';ctx.beginPath();ctx.moveTo(0,gy);
  for(let i=0;i<=12;i++){const x=i/12*W;ctx.lineTo(x,gy-20-Math.abs(Math.sin(i*1.7))*gy*0.28);}ctx.lineTo(W,gy);ctx.closePath();ctx.fill();
  /* разрез недр: пласты биомов, медленно «едут» вверх — как будто спускаемся */
  const layers=[['#3a2818','#2a1c10'],['#2a2e38','#1c2028'],['#262250','#16123a'],['#4a1a10','#2a0c08'],['#140e2a','#08060f']];
  if(hell)layers.push(['#3a0a08','#1a0302']);
  const LH=(H-gy)/(layers.length-0.6);
  for(let k=0;k<layers.length;k++){
    const y0=gy+k*LH,y1=y0+LH+2;
    const lg=ctx.createLinearGradient(0,y0,0,y1);lg.addColorStop(0,layers[k][0]);lg.addColorStop(1,layers[k][1]);
    ctx.fillStyle=lg;ctx.beginPath();ctx.moveTo(0,y0+Math.sin(t*0.3+k)*4);
    for(let i=0;i<=16;i++){const x=i/16*W;ctx.lineTo(x,y0+Math.sin(i*0.9+k*2+t*0.25)*6);}
    ctx.lineTo(W,y1);ctx.lineTo(0,y1);ctx.closePath();ctx.fill();
    /* блики руды */
    const oc=[['#b06a3b','#d0dce6'],['#c8a98a','#ffffff'],['#a05ce0','#7fe0ff'],['#ff7a3d','#ffcc33'],['#9b5cff','#b090ff'],['#ffd23a','#ff5a1a']][k];
    for(let q=0;q<10;q++){const h=hash2(q,k,91);const x=(h%1000)/1000*W,y=y0+10+((h>>>10)%1000)/1000*(LH-20);
      const a=0.35+0.55*Math.abs(Math.sin(t*1.6+q+k));ctx.fillStyle=hexA(oc[q%2],a);
      ctx.beginPath();ctx.moveTo(x,y-4);ctx.lineTo(x+3,y);ctx.lineTo(x,y+4);ctx.lineTo(x-3,y);ctx.closePath();ctx.fill();}
  }
  /* свечение самого дна */
  {const bg=ctx.createLinearGradient(0,H*0.75,0,H);bg.addColorStop(0,'rgba(0,0,0,0)');bg.addColorStop(1,hell?'rgba(255,70,20,'+(0.35+0.1*Math.sin(t*1.5))+')':'rgba(140,80,255,.22)');
    ctx.fillStyle=bg;ctx.fillRect(0,H*0.75,W,H*0.25);}
  /* шахта с канатом и шахтёром */
  const sx=W*0.16;
  ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(sx-14,gy,28,H-gy);
  ctx.fillStyle='#5a3f22';ctx.fillRect(sx-24,gy-46,6,48);ctx.fillRect(sx+18,gy-46,6,48);ctx.fillRect(sx-28,gy-50,56,7);
  const depthK=0.5+0.45*Math.sin(t*0.35);
  const my=gy+20+depthK*(H-gy-90);
  ctx.strokeStyle='#c8b080';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(sx,gy-44);ctx.lineTo(sx,my-46);ctx.stroke();
  {const lg=ctx.createRadialGradient(sx+10,my-30,4,sx+10,my-30,110);lg.addColorStop(0,'rgba(255,230,160,.35)');lg.addColorStop(1,'rgba(255,230,160,0)');
    ctx.fillStyle=lg;ctx.beginPath();ctx.arc(sx+10,my-30,110,0,TAU);ctx.fill();}
  drawPlayerSprite(ctx,sx,my,'idle',t,1,{tool:null,armor:player.armorLvl||1,pickLvl:player.pickLvl||1,torch:Math.max(2,player.torchLvl||0),hang:true});
  /* частицы */
  for(const p of menuParts){
    p.y-=p.v*dt;
    if(p.y<0.3)p.y=1.05;
    const x=p.x*W+Math.sin(t*0.7+p.p)*14,y=p.y*H;
    const a=0.25+0.5*Math.abs(Math.sin(t*1.4+p.p));
    ctx.fillStyle=(hell&&p.y>0.7?'rgba(255,120,50,':'rgba(255,200,120,')+(a*0.6).toFixed(2)+')';
    ctx.beginPath();ctx.arc(x,y,p.s,0,TAU);ctx.fill();
  }
  const vg=ctx.createRadialGradient(W/2,H/2,H*0.3,W/2,H/2,H*0.85);
  vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.6)');
  ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
}
