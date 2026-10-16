'use strict';
/* ============================================================
   ВЛАДЫКИ ПРЕИСПОДНЕЙ: модели боссов.
   Каждая модель рисуется в рамке высотой 100 (ноги в 0, верх в -100),
   смотрит вправо; масштаб и разворот задаёт hbDrawMob.
   HB_PRE / HB_POST — части в мировых координатах (цепи, язык, руки, кисти).
   ============================================================ */
const HB_MODEL={},HB_PRE={},HB_POST={};
function hbPoly(g,pts){g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.closePath();}
function hbLin(g,x0,y0,x1,y1,st){const gr=g.createLinearGradient(x0,y0,x1,y1);for(const [o,c] of st)gr.addColorStop(o,c);return gr;}
/* сужающаяся конечность-четырёхугольник со скруглёнными суставами */
function hbLimb(g,x1,y1,x2,y2,w1,w2,col,line){
  const a=Math.atan2(y2-y1,x2-x1),nx=-Math.sin(a),ny=Math.cos(a);
  g.beginPath();g.moveTo(x1+nx*w1,y1+ny*w1);g.lineTo(x2+nx*w2,y2+ny*w2);g.lineTo(x2-nx*w2,y2-ny*w2);g.lineTo(x1-nx*w1,y1-ny*w1);g.closePath();
  g.fillStyle=col;g.fill();if(line){g.strokeStyle=line;g.lineWidth=0.8;g.stroke();}
  g.beginPath();g.arc(x1,y1,w1,0,TAU);g.arc(x2,y2,w2,0,TAU);g.fill();
}
/* двухзвенная рука/нога: точка сустава по длинам звеньев */
function hbIK(x1,y1,x2,y2,l1,l2,bend){
  const dx=x2-x1,dy=y2-y1,d=Math.min(l1+l2-0.01,Math.max(0.01,Math.hypot(dx,dy))),a=Math.atan2(dy,dx);
  const c=Math.acos(clamp((l1*l1+d*d-l2*l2)/(2*l1*d),-1,1)),ka=a+bend*c;
  return [x1+Math.cos(ka)*l1,y1+Math.sin(ka)*l1,x1+Math.cos(a)*d,y1+Math.sin(a)*d];
}
/* язык пламени */
function hbFlame(g,x,y,w,h,t,seed,c1,c2){
  const f=Math.sin(t*11+seed*3.1)*0.18+Math.sin(t*7.3+seed)*0.12;
  g.fillStyle=c1;g.beginPath();g.moveTo(x-w,y);g.quadraticCurveTo(x-w*0.9,y-h*0.6,x+f*w*2,y-h*(1+f*0.3));g.quadraticCurveTo(x+w*0.9,y-h*0.55,x+w,y);g.closePath();g.fill();
  if(c2){g.fillStyle=c2;g.beginPath();g.moveTo(x-w*0.5,y);g.quadraticCurveTo(x-w*0.4,y-h*0.4,x+f*w,y-h*0.62);g.quadraticCurveTo(x+w*0.45,y-h*0.35,x+w*0.5,y);g.closePath();g.fill();}
}
/* крыло летучей мыши: кость-рука, пальцы веером и перепонка с вырезами между пальцами (ось x — вдоль крыла) */
function hbWing(g,L,col,bone,tat,t,seed,burn){
  const e=[L*0.4,-L*0.17],w=[L*0.72,-L*0.06];
  const fing=[[L*1.04,-L*0.36],[L*1.1,L*0.02],[L*0.94,L*0.36],[L*0.62,L*0.58]],root=[L*0.04,L*0.36];
  g.beginPath();g.moveTo(0,0);g.lineTo(e[0],e[1]);g.lineTo(w[0],w[1]);g.lineTo(fing[0][0],fing[0][1]);
  let prev=fing[0];
  fing.slice(1).concat([root]).forEach((q,i)=>{
    const mx=(prev[0]+q[0])/2,my=(prev[1]+q[1])/2,cx=lerp(mx,w[0],0.42),cy=lerp(my,w[1],0.42);
    if(tat&&i<3){const a=0.45+0.08*Math.sin(seed+i),px=lerp(lerp(prev[0],cx,a),lerp(cx,q[0],a),a),py=lerp(lerp(prev[1],cy,a),lerp(cy,q[1],a),a),fl=Math.sin(t*3+i+seed)*L*0.015;
      g.quadraticCurveTo(lerp(prev[0],cx,0.6),lerp(prev[1],cy,0.6),px,py);g.lineTo(lerp(px,w[0],0.12)+fl,lerp(py,w[1],0.12));g.lineTo(px+(q[0]-prev[0])*0.08,py+(q[1]-prev[1])*0.08);
      g.quadraticCurveTo(lerp(cx,q[0],0.4),lerp(cy,q[1],0.4),q[0],q[1]);}
    else g.quadraticCurveTo(cx,cy,q[0],q[1]);
    prev=q;});
  g.closePath();
  g.fillStyle=hbLin(g,0,0,L,L*0.2,[[0,shadeHex(col,0.18)],[0.6,col],[1,shadeHex(col,-0.25)]]);g.fill();
  g.strokeStyle=shadeHex(col,-0.45);g.lineWidth=L*0.012;g.stroke();
  /* прожилки перепонки */
  g.strokeStyle=hexA(shadeHex(col,0.35),0.45);g.lineWidth=L*0.01;g.beginPath();
  for(let i=0;i<fing.length-1;i++){const a=fing[i],b=fing[i+1],mx=(a[0]+b[0])/2,my=(a[1]+b[1])/2;g.moveTo(w[0],w[1]);g.quadraticCurveTo(lerp(w[0],mx,0.5)+L*0.03,lerp(w[1],my,0.5),lerp(w[0],mx,0.82),lerp(w[1],my,0.82));}
  g.stroke();
  /* кости */
  g.strokeStyle=bone;g.lineCap='round';g.lineJoin='round';
  g.lineWidth=L*0.055;g.beginPath();g.moveTo(0,0);g.lineTo(e[0],e[1]);g.lineTo(w[0],w[1]);g.stroke();
  g.lineWidth=L*0.024;g.beginPath();for(const f of fing){g.moveTo(w[0],w[1]);g.quadraticCurveTo(lerp(w[0],f[0],0.5),lerp(w[1],f[1],0.5)-L*0.03,f[0],f[1]);}g.stroke();
  g.fillStyle=bone;g.beginPath();g.arc(e[0],e[1],L*0.035,0,TAU);g.fill();
  g.beginPath();g.moveTo(w[0]-L*0.03,w[1]);g.quadraticCurveTo(w[0]+L*0.02,w[1]-L*0.16,w[0]+L*0.07,w[1]-L*0.19);g.lineTo(w[0]+L*0.03,w[1]+L*0.01);g.closePath();g.fill();
  for(const f of fing){g.beginPath();g.moveTo(f[0],f[1]);g.lineTo(f[0]+L*0.05,f[1]-L*0.01);g.lineTo(f[0]+L*0.01,f[1]+L*0.025);g.closePath();g.fill();}
  if(burn){for(const f of fing.slice(0,3)){mobGlow(g,f[0],f[1],L*0.2,'#ff7a1a',0.6);hbFlame(g,f[0],f[1]+2,L*0.05,L*0.14,t,seed+f[0],'#ff7a1a','#ffd060');}}
}
/* рог: сужающаяся изогнутая полоса вдоль точек с кольцевыми бороздами */
function hbHorn(g,pts,w0,c1,c2){
  const n=pts.length,L=[],R=[];
  for(let i=0;i<n;i++){const a=pts[Math.min(n-1,i+1)],b=pts[Math.max(0,i-1)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]),w=w0*(1-i/(n-1))*0.95+0.15;
    L.push([pts[i][0]-Math.sin(ang)*w,pts[i][1]+Math.cos(ang)*w]);R.push([pts[i][0]+Math.sin(ang)*w,pts[i][1]-Math.cos(ang)*w]);}
  g.beginPath();g.moveTo(L[0][0],L[0][1]);for(let i=1;i<n;i++)g.lineTo(L[i][0],L[i][1]);for(let i=n-1;i>=0;i--)g.lineTo(R[i][0],R[i][1]);g.closePath();
  g.fillStyle=hbLin(g,pts[0][0],pts[0][1],pts[n-1][0],pts[n-1][1],[[0,c2],[0.55,c1],[1,shadeHex(c1,0.25)]]);g.fill();
  g.strokeStyle=shadeHex(c2,-0.4);g.lineWidth=0.5;g.stroke();
  g.strokeStyle=hexA(shadeHex(c2,-0.3),0.7);g.lineWidth=0.45;g.beginPath();for(let i=1;i<n-2;i++){g.moveTo(L[i][0],L[i][1]);g.lineTo(R[i][0],R[i][1]);}g.stroke();
}
/* глаз с отблеском и слежением */
function hbEye(g,m,x,y,r,iris,glow,o){
  o=o||{};const bl=(Math.sin(m.anim*0.9+x*0.7+m.phase*5)>0.985)?0.1:1;
  const lx=(m.lookX||0)*(m.facing||1),ly=m.lookY||0;
  if(glow)mobGlow(g,x,y,r*2.8,glow,0.5);
  g.fillStyle=o.white||'#f2e6c8';g.beginPath();g.ellipse(x,y,r,r*bl,0,0,TAU);g.fill();
  if(bl>0.5){const ix=x+lx*r*0.35,iy=y+ly*r*0.3;g.fillStyle=iris;g.beginPath();g.arc(ix,iy,r*0.62,0,TAU);g.fill();
    g.fillStyle='#0a0406';if(o.slit==='h'){g.beginPath();g.ellipse(ix,iy,r*0.5,r*0.14,0,0,TAU);g.fill();}else{g.beginPath();g.ellipse(ix,iy,r*0.15,r*0.48,0,0,TAU);g.fill();}
    g.fillStyle='rgba(255,255,255,.85)';g.beginPath();g.arc(ix-r*0.25,iy-r*0.28,r*0.2,0,TAU);g.fill();}
  g.strokeStyle='rgba(20,8,10,.6)';g.lineWidth=Math.max(0.6,r*0.18);g.beginPath();g.ellipse(x,y,r,r*bl,0,Math.PI*1.05,Math.PI*1.95);g.stroke();
}

function hbDrawMob(g,m,t){
  const echo=m.def.mech==='hbecho';
  const id=m.copy||m.def.hb;if(!HB_MODEL[id])return;
  const B=m.b||{phase:1,atk:'idle'};
  const U=m.h/100;
  g.save();
  g.globalAlpha=(m.alpha===undefined?1:m.alpha)*(echo?0.5:1);
  g.translate(m.x,m.y);
  if(m.deathK!==undefined&&echo){const k=clamp((m.deadT||0)/0.5,0,1);g.globalAlpha*=1-k;g.translate(0,-k*20);}
  if(HB_PRE[id])HB_PRE[id](g,m,t,B,U);
  const OR=Math.max(m.w,m.h)*0.8+34;
  OL.shade={h:m.h,top:0.12,bot:id==='warden'?0.1:0.3};
  withOutline(g,0,-m.h*0.5,OR,OR,echo?'rgba(120,200,255,.6)':'rgba(6,2,4,.95)',-1.5,(gg)=>{
    if(OL.active&&gg===OL.g){if(m.hurt>0)OL.tint='rgba(255,246,236,'+(0.22+0.5*clamp(m.hurt/0.24,0,1))+')';else if(echo)OL.tint='rgba(120,200,255,.35)';}
    gg.save();gg.scale(U*(m.facing||1),U);HB_MODEL[id](gg,m,t,B,U);gg.restore();
  });
  if(HB_POST[id])HB_POST[id](g,m,t,B,U);
  if(m.invuln>0&&!G.bossCut&&!echo&&m.alive!==false){g.strokeStyle='rgba(255,255,255,'+(0.25+0.25*Math.sin(t*20))+')';g.lineWidth=2;g.beginPath();g.ellipse(0,-m.h*0.5,m.w*0.62,m.h*0.58,0,0,TAU);g.stroke();}
  if(B.armor>0&&!echo){olLight(g,(g)=>{g.strokeStyle='rgba(200,230,255,'+(0.35+0.2*Math.sin(t*9))+')';g.lineWidth=3;g.setLineDash([10,7]);g.lineDashOffset=-t*60;g.beginPath();g.ellipse(0,-m.h*0.5,m.w*0.7,m.h*0.6,0,0,TAU);g.stroke();g.setLineDash([]);});}
  if(B.weak>0&&!echo){const k=0.5+0.5*Math.sin(t*14);g.fillStyle='rgba(255,220,90,'+(0.5+0.4*k)+')';g.font='900 '+Math.round(14+m.h*0.05)+'px system-ui';g.textAlign='center';g.fillText('✦',0,-m.h-10-k*4);}
  g.restore();
}

/* ======================= ПЕПЕЛЬНЫЙ ВЕСТНИК ======================= */
HB_MODEL.herald=function(g,m,t,B){
  const ph=B.phase||1,sp=m.spawnS===undefined?1:m.spawnS,burn=ph>=3;
  const bob=Math.sin(t*2.2+m.phase)*2.2,dash=!!B.dashing;
  const flap=dash?Math.sin(t*16)*0.12-0.5:Math.sin(t*3.4)*0.32+(G.hbWind&&B.atk==='storm'?0.2:0);
  g.translate(0,bob);
  if(dash){g.rotate(0.28);}
  const robe='#4e4440',robeD='#2a201e',ash='#8a7c74',bone='#d8ccb4';
  /* крылья: дальнее и ближнее */
  for(const s of [0,1]){g.save();g.translate(-6,-70);g.rotate(-2.45+(s?0.5:0)-flap*(s?1:0.8));g.scale(sp*(s?1:0.86),sp*(s?1:0.86));
    hbWing(g,76,s?'#4a3e3a':'#2c2422',s?'#8a7a6c':'#5a4c44',3,t,s*3,burn);g.restore();}
  /* плащ за спиной */
  {const w=Math.sin(t*2.6)*4+(dash?-10:0);g.fillStyle='#2a201e';g.beginPath();g.moveTo(-12,-74);g.quadraticCurveTo(-34+w,-46,-40+w*1.5,-8);
    for(let k=0;k<5;k++)g.lineTo(-40+w*1.5+k*7,-8+(k%2?-7:3));g.quadraticCurveTo(-10,-30,10,-74);g.closePath();g.fill();}
  /* рваный подол */
  for(let k=0;k<7;k++){const x=-22+k*7,w2=Math.sin(t*4+k*1.3)*3,L=10+((k*37)%7);
    g.fillStyle=k%2?robe:robeD;g.beginPath();g.moveTo(x-4,-14);g.quadraticCurveTo(x+w2,-6,x+w2*1.6,-14+L+4);g.lineTo(x+4,-14);g.closePath();g.fill();}
  /* мантия */
  g.fillStyle=hbLin(g,0,-74,0,-10,[[0,'#5e5450'],[0.5,robe],[1,robeD]]);
  g.beginPath();g.moveTo(-13,-72);g.quadraticCurveTo(-24,-44,-26,-12);g.quadraticCurveTo(-2,-8,22,-12);g.quadraticCurveTo(20,-44,14,-72);g.closePath();g.fill();
  g.strokeStyle='rgba(20,12,10,.7)';g.lineWidth=1;for(const x of [-14,-4,8]){g.beginPath();g.moveTo(x*0.6,-66);g.quadraticCurveTo(x,-40,x*1.3,-14);g.stroke();}
  /* тлеющие трещины по ткани */
  olLight(g,(g)=>{g.strokeStyle='rgba(255,120,40,'+(0.45+0.25*Math.sin(t*5))+')';g.lineWidth=1.1;g.beginPath();g.moveTo(-18,-20);g.lineTo(-12,-30);g.lineTo(-15,-38);g.moveTo(10,-18);g.lineTo(6,-28);g.lineTo(12,-36);g.stroke();});
  /* пояс с колокольцами-черепками */
  g.fillStyle='#2a1c18';g.fillRect(-16,-44,32,4);for(let k=0;k<4;k++){g.fillStyle=bone;g.beginPath();g.arc(-11+k*7,-38,2,0,TAU);g.fill();}
  /* дальняя рука (когтистая) */
  {const up=Math.max(m.tele||0,B.atk==='rain'||B.atk==='tornado'?1:0);const hx=-10-6*up,hy=-42-46*up;
    hbLimb(g,-8,-66,hx*0.5-2,(hy-66)*0.5-6,4,3.2,'#3a302c');hbLimb(g,hx*0.5-2,(hy-66)*0.5-6,hx,hy,3.2,2.4,'#3a302c');
    g.strokeStyle=bone;g.lineWidth=1.4;g.lineCap='round';for(let k=-1;k<=1;k++){g.beginPath();g.moveTo(hx,hy);g.lineTo(hx+k*3-2,hy-6);g.stroke();}
    if(up>0.2)mobGlow(g,hx,hy-4,14,'#ff8a3a',0.5*up);}
  /* капюшон и маска */
  g.fillStyle='#2e2522';g.beginPath();g.moveTo(-10,-74);g.quadraticCurveTo(-14,-96,4,-100);g.quadraticCurveTo(20,-96,18,-80);g.quadraticCurveTo(14,-70,-10,-74);g.fill();
  g.fillStyle='#120c0b';g.beginPath();g.ellipse(7,-83,9,11,0.1,0,TAU);g.fill();
  hkMask(g,8,-82,15,17,burn?'#ffd060':'#ff8a3a',{crack:true,col:'#e2d6c0'});
  /* корона из угольков */
  for(let k=0;k<5;k++){const x=-4+k*5,h=7+(k===2?5:k%2?2:3);hbFlame(g,x,-97+Math.abs(k-2)*1.4,2.4,h,t,k,burn?'#ffb030':'#ff7a2a','#ffe080');}
  mobGlow(g,6,-100,16,'#ff8a3a',0.45);
  /* горн: от губ маски вниз-вперёд, при игре поднят к лицу */
  {const hornK=clamp(B.horn||0,0,1),a=lerp(1.0,-0.32,hornK),gx=lerp(18,14,hornK),gy=lerp(-56,-78,hornK);
    hbLimb(g,10,-66,gx-4,gy+8,4,3.2,'#3a302c');
    g.save();g.translate(gx,gy);g.rotate(a);
    g.fillStyle=hbLin(g,0,-4,0,4,[[0,'#e8c890'],[0.5,'#b08850'],[1,'#6a4a28']]);
    g.beginPath();g.moveTo(-4,-1.6);g.quadraticCurveTo(20,-4,40,-9);g.lineTo(44,-14);g.lineTo(46,8);g.lineTo(40,4);g.quadraticCurveTo(20,4,-4,1.6);g.closePath();g.fill();
    g.strokeStyle='#4a3018';g.lineWidth=0.8;g.stroke();
    g.fillStyle='#3a2414';for(const x of [8,18,28])g.fillRect(x,-3.4-x*0.12,2,6.8+x*0.18);
    g.fillStyle='#1a0e08';g.beginPath();g.ellipse(45,-3,2.4,11,0,0,TAU);g.fill();
    if(hornK>0.5){olLight(g,(g)=>{for(let k=0;k<3;k++){const r=8+((t*40+k*14)%42);g.strokeStyle='rgba(255,170,90,'+(0.6*(1-r/50))+')';g.lineWidth=1.6;g.beginPath();g.arc(46,-3,r,-0.7,0.7);g.stroke();}});}
    g.restore();
    g.fillStyle='#2a201c';g.beginPath();g.arc(gx,gy,3.4,0,TAU);g.fill();}
  if(m.tele>0.05)mobGlow(g,4,-60,40,'#ff9a3c',m.tele*0.35);
};

/* ======================= МАТЬ ПЛОТИ ======================= */
HB_MODEL.mother=function(g,m,t,B){
  const ph=B.phase||1,sp=m.spawnS===undefined?1:m.spawnS,free=!!B.free;
  const open=clamp(B.open||0,0,1),pulse=1+Math.sin(t*2.4)*0.03+open*0.03;
  if(sp<1){g.beginPath();g.rect(-200,-400,400,400);g.clip();g.translate(0,(1-sp)*96);}
  const fl1='#a8283a',fl2='#5a0e1c',vein='#3a0610',bone='#eadcc4';
  /* корни-вены по полу */
  if(!free){g.lineCap='round';for(let k=0;k<8;k++){const s=k%2?1:-1,i=k>>1,x0=s*(10+i*7),x1=s*(44+i*9+Math.sin(t*0.8+k)*2);
    g.strokeStyle=k%3?vein:'#6a1020';g.lineWidth=6-i;g.beginPath();g.moveTo(x0,-6);g.quadraticCurveTo((x0+x1)/2,-10-i*2,x1,1);g.stroke();
    olLight(g,(g)=>{g.strokeStyle='rgba(255,60,80,'+(0.25+0.25*Math.sin(t*3-i))+')';g.lineWidth=1;g.beginPath();g.moveTo(x0,-6);g.quadraticCurveTo((x0+x1)/2,-10-i*2,x1,1);g.stroke();});}}
  /* костяные ноги-лапы (3-я фаза) */
  if(free){const run=Math.abs(m.vx)>20,air=!m.onGround;
    for(let k=0;k<4;k++)for(const s of [-1,1]){const ph2=m.anim*9+k*1.7+(s>0?Math.PI:0),bx=s*(12+k*7),by=-30;
      const fx=s*(34+k*10)+(run?Math.sin(ph2)*8:0),fy=air?-6:-Math.max(0,Math.cos(ph2))*(run?7:0);
      const [kx,ky]=hbIK(bx,by,fx,fy,24,26,s>0?-1:1);
      hbLimb(g,bx,by,kx,ky-6,3.6,2.6,k%2?bone:'#cfc0a4');hbLimb(g,kx,ky-6,fx,fy,2.6,1,k%2?bone:'#cfc0a4');}}
  /* свисающие пуповины-щупальца */
  for(const s of [-1,1]){const whip=s>0&&B.whip?B.whip:0;g.strokeStyle='#7a1424';g.lineWidth=5;g.lineCap='round';g.beginPath();
    const x0=s*38,y0=-60;g.moveTo(x0,y0);
    if(whip>=2){g.quadraticCurveTo(70,-70,104,-16);}
    else if(whip>0){g.quadraticCurveTo(50,-90-whip*20,40-whip*20,-104-whip*10);}
    else{const w=Math.sin(t*1.6+s)*6;g.quadraticCurveTo(s*48+w,-36,s*44+w*1.4,-10);}
    g.stroke();g.strokeStyle='rgba(255,120,130,.35)';g.lineWidth=1.4;g.stroke();}
  /* основная масса */
  g.save();g.translate(0,-50);g.scale(pulse,2-pulse);
  g.beginPath();for(let i=0;i<=40;i++){const a=i/40*TAU,r=44+4*Math.sin(3*a+t*1.2)+2.6*Math.sin(5*a-t*1.7)+(Math.sin(a)>0.6?-4:0);const x=Math.cos(a)*r*1.06,y=Math.sin(a)*r*(a>0&&a<Math.PI?0.92:1);i?g.lineTo(x,y):g.moveTo(x,y);}g.closePath();
  g.fillStyle=mobG(g,0,-6,48,fl1);g.fill();g.strokeStyle=vein;g.lineWidth=1.4;g.stroke();
  /* складки и вены */
  g.strokeStyle='rgba(58,6,16,.75)';g.lineWidth=1.6;
  for(const [x0,y0,x1,y1,x2,y2] of [[-38,-10,-26,-24,-14,-36],[-30,18,-20,8,-6,14],[34,-16,26,-30,10,-38],[-10,34,0,26,12,34]]){g.beginPath();g.moveTo(x0,y0);g.quadraticCurveTo(x1,y1,x2,y2);g.stroke();}
  /* рёбра поверх живота */
  g.strokeStyle=bone;g.lineCap='round';for(let k=0;k<4;k++){const y=-22+k*10;g.lineWidth=3.4-k*0.4;g.beginPath();g.moveTo(-6,y-4);g.quadraticCurveTo(18,y-10,30+k*1.5,y+6);g.stroke();}
  g.strokeStyle='#cbb898';g.lineWidth=4;g.beginPath();g.moveTo(-8,-30);g.lineTo(-8,14);g.stroke();
  /* утроба-пасть */
  {const mo=6+open*16+(B.weak>0?10:0),mx=16,my=4;
    g.fillStyle='#2a0208';g.beginPath();g.ellipse(mx,my,7+open*3,mo,0,0,TAU);g.fill();
    if(open>0.1||B.weak>0){const hb2=1+Math.sin(t*(B.weak>0?14:6))*0.12;g.fillStyle=B.weak>0?'#ff4a5a':'#c0142a';g.beginPath();g.ellipse(mx,my,4.6*hb2,Math.min(mo*0.6,9)*hb2,0,0,TAU);g.fill();
      mobGlow(g,mx,my,20+mo,B.weak>0?'#ffd060':'#ff2a3a',0.45+open*0.3);}
    g.fillStyle='#f4e8d0';for(let k=0;k<7;k++){const a=k/7*TAU+0.2,x=mx+Math.cos(a)*(8+open*3),y=my+Math.sin(a)*mo;g.beginPath();g.moveTo(x,y);g.lineTo(mx+Math.cos(a)*(4+open*2),my+Math.sin(a)*mo*0.7);g.lineTo(x+Math.sin(a)*2,y-Math.cos(a)*2);g.fill();}}
  /* глаза */
  for(const [x,y,r] of [[-20,-24,5.4],[2,-34,6.2],[24,-22,4.6],[-30,2,4],[32,10,3.6],[-12,22,3.4],[28,-38,3.2],[-36,-18,3]])hbEye(g,m,x,y,r*(ph>=2?1.1:1),'#c0202a',ph>=2?'#ff3a4a':null,{white:'#f0dcc0'});
  g.restore();
  /* корона из костяных наростов */
  for(let k=0;k<6;k++){const x=-24+k*10,h=12+(k===2||k===3?8:k%2*4);g.fillStyle=k%2?bone:'#cfbc9a';g.beginPath();g.moveTo(x-4,-88);g.quadraticCurveTo(x-1,-88-h*0.7,x+2+Math.sin(t+k)*0.6,-88-h);g.quadraticCurveTo(x+2,-88-h*0.5,x+4,-88);g.closePath();g.fill();}
  if(m.tele>0.05)mobGlow(g,10,-50,60,'#ff4a5a',m.tele*0.35);
};

/* ======================= КОРОЛЬ ТОПЕЙ ======================= */
HB_MODEL.toadking=function(g,m,t,B){
  const ph=B.phase||1,air=!m.onGround&&Math.abs(m.vy)>60,croak=clamp(B.croak||0,0,1);
  const crouch=(B.atk==='hop'||B.atk==='quake')&&!air?(m.tele||0):0;
  const br=Math.sin(t*2+m.phase)*1.4;
  if(B.atk==='dive'&&m.hbB){const R=hbBounds(m);g.beginPath();g.rect(-300,-300,600,300+(R.floor-m.y)/(m.h/100)+1);g.clip();}
  g.translate(0,crouch*7);g.scale(1+crouch*0.08,1-crouch*0.08);
  const sk='#6a7a24',skD='#3a4210',skL='#9aa83a',belly='#d8cc80';
  const leg=(far)=>{const c=far?shadeHex(sk,-0.3):sk;
    if(air&&m.vy<0){hbLimb(g,-36,-30,-62,-10,13,7,c);hbLimb(g,-62,-10,-82,4,7,4,c);g.fillStyle=c;g.beginPath();g.ellipse(-86,6,9,3,0.3,0,TAU);g.fill();}
    else{g.fillStyle=mobG(g,-38,-24,22,c);g.beginPath();g.ellipse(-38,-24,24,17,-0.2,0,TAU);g.fill();g.strokeStyle=skD;g.lineWidth=1;g.stroke();
      g.fillStyle=c;g.beginPath();g.moveTo(-30,-8);g.lineTo(-6,-2);g.lineTo(-4,0);g.lineTo(-36,0);g.closePath();g.fill();
      for(let k=0;k<3;k++){g.beginPath();g.ellipse(-4+k*5,-0.5,4,1.8,0,0,TAU);g.fill();}}};
  leg(true);
  /* тело */
  g.fillStyle=mobG(g,-8,-42,60,sk);g.beginPath();g.ellipse(-6,-40,58,34+br,0,0,TAU);g.fill();g.strokeStyle=skD;g.lineWidth=1.4;g.stroke();
  g.fillStyle=hexA(belly,0.9);g.beginPath();g.ellipse(10,-22,40,18,0.1,0,Math.PI);g.fill();
  g.strokeStyle='rgba(120,100,40,.4)';g.lineWidth=1;for(let k=0;k<4;k++){g.beginPath();g.moveTo(-22+k*12,-14);g.lineTo(-18+k*12,-6);g.stroke();}
  /* бородавки */
  for(let k=0;k<18;k++){const a=(k*2.399)%TAU,r=20+(k*13)%30,x=-6+Math.cos(a)*r*1.5,y=-46+Math.sin(a)*r*0.7;if(y>-20)continue;g.fillStyle=k%3?skL:skD;g.beginPath();g.arc(x,y,1.4+(k%3)*0.7,0,TAU);g.fill();}
  /* серные кристаллы на спине */
  for(const [x,y,h,a] of [[-36,-64,22,-0.5],[-22,-70,28,-0.2],[-8,-72,18,0.1],[-48,-54,16,-0.8],[-30,-60,14,-0.35]]){g.save();g.translate(x,y);g.rotate(a);
    g.fillStyle=hbLin(g,-4,0,4,-h,[[0,'#8a8010'],[0.5,'#e8e04a'],[1,'#fffbb0']]);g.beginPath();g.moveTo(-4,2);g.lineTo(-3,-h*0.8);g.lineTo(0,-h);g.lineTo(3,-h*0.8);g.lineTo(4,2);g.closePath();g.fill();
    g.fillStyle='rgba(255,255,255,.35)';g.fillRect(-1.5,-h*0.75,1.2,h*0.6);g.restore();mobGlow(g,x,y-h*0.5,h*0.9,'#e8e04a',ph>=3?0.55:0.3);}
  /* передняя лапа */
  {const reach=B.atk==='tongue'?0.2:0;g.fillStyle=sk;hbLimb(g,30,-28,38+reach*10,-2,8,5,sk,skD);for(let k=-1;k<=1;k++){g.beginPath();g.ellipse(40+k*6,0,4,2,k*0.4,0,TAU);g.fill();}}
  leg(false);
  /* голова: широкая пасть */
  g.fillStyle=mobG(g,40,-48,30,sk);g.beginPath();g.moveTo(14,-62);g.quadraticCurveTo(52,-74,70,-42);g.quadraticCurveTo(72,-30,60,-26);g.quadraticCurveTo(36,-24,14,-34);g.closePath();g.fill();g.strokeStyle=skD;g.lineWidth=1.2;g.stroke();
  /* горловой мешок */
  if(croak>0.05){const r=8+croak*20;g.fillStyle=hexA('#e8c870',0.75);g.beginPath();g.ellipse(46,-22+r*0.2,r*1.1,r*0.8,0,0,TAU);g.fill();g.strokeStyle='rgba(120,90,30,.6)';g.lineWidth=1;g.stroke();
    g.strokeStyle='rgba(255,255,255,.4)';g.beginPath();g.arc(40,-26,r*0.5,3.6,4.6);g.stroke();}
  /* рот */
  {const op=(B.tongue?6:0)+(B.atk==='spit'||B.atk==='bombs'?(m.tele||0)*5:0);
    g.strokeStyle='#1a1e06';g.lineWidth=2.2;g.lineCap='round';g.beginPath();g.moveTo(22,-38);g.quadraticCurveTo(46,-34-op,70,-40);g.stroke();
    if(op>1){g.fillStyle='#5a1020';g.beginPath();g.moveTo(26,-38);g.quadraticCurveTo(48,-36+op,68,-40);g.quadraticCurveTo(48,-36-op*0.2,26,-38);g.fill();}
    if(Math.sin(t*1.3)>0.4){g.fillStyle='rgba(176,255,96,.8)';const dy=((t*30)%14);g.beginPath();g.ellipse(62,-36+dy,1.6,2.6,0,0,TAU);g.fill();}}
  /* глаза-купола */
  for(const [x,y,r] of [[30,-64,8],[50,-62,9.5]]){g.fillStyle=mobG(g,x,y,r+3,sk);g.beginPath();g.arc(x,y,r+3,Math.PI,TAU);g.lineTo(x+r+3,y+2);g.lineTo(x-r-3,y+2);g.fill();
    hbEye(g,m,x,y,r,'#e8b020',ph>=3?'#ffd040':null,{slit:'h',white:'#f0e090'});}
  /* корона */
  {g.save();g.translate(40,-74);g.rotate(-0.12+Math.sin(t*1.2)*0.03);
    g.fillStyle=hbLin(g,0,-14,0,4,[[0,'#fff0a0'],[0.5,'#e0b030'],[1,'#8a6010']]);
    g.beginPath();g.moveTo(-14,3);g.lineTo(-15,-8);g.lineTo(-9,-3);g.lineTo(-5,-14);g.lineTo(0,-4);g.lineTo(5,-14);g.lineTo(9,-3);g.lineTo(15,-8);g.lineTo(14,3);g.closePath();g.fill();
    g.strokeStyle='#6a4808';g.lineWidth=0.8;g.stroke();
    g.fillStyle='#4aff6a';g.beginPath();g.arc(0,-1,2.6,0,TAU);g.fill();mobGlow(g,0,-1,10,'#7aff8a',0.6);
    if(ph>=3){g.strokeStyle='#2a1a00';g.lineWidth=1.2;g.beginPath();g.moveTo(-6,-10);g.lineTo(-3,-4);g.lineTo(-6,0);g.lineTo(-2,3);g.stroke();}
    g.restore();}
  if(m.tele>0.05)mobGlow(g,40,-40,40,'#c8ff4a',m.tele*0.3);
};
HB_POST.toadking=function(g,m,t,B){
  const T=B.tongue;if(!T||T.l<2)return;
  const x0=T.x-m.x,y0=T.y-m.y,x1=x0+Math.cos(T.a)*T.l,y1=y0+Math.sin(T.a)*T.l,mx=(x0+x1)/2,my=(y0+y1)/2-Math.min(30,T.l*0.08);
  g.lineCap='round';g.strokeStyle='#7a1838';g.lineWidth=11;g.beginPath();g.moveTo(x0,y0);g.quadraticCurveTo(mx,my,x1,y1);g.stroke();
  g.strokeStyle='#e06a90';g.lineWidth=7;g.stroke();g.strokeStyle='rgba(255,200,220,.5)';g.lineWidth=2;g.stroke();
  g.fillStyle='#e06a90';g.beginPath();g.arc(x1,y1,9,0,TAU);g.fill();g.fillStyle='#ff9ab8';g.beginPath();g.arc(x1-2,y1-2,4,0,TAU);g.fill();
};

/* ======================= КОСТЯНОЙ ИМПЕРАТОР ======================= */
HB_MODEL.emperor=function(g,m,t,B){
  const ph=B.phase||1,sp=m.spawnS===undefined?1:m.spawnS;
  const bob=Math.sin(t*1.6+m.phase)*2.4;g.translate(0,bob);
  const bone='#e8e0cc',boneD='#a89e88',robe='#3a2c4a',robeD='#1a1424',gold='#e0b040',soul='#9ad8ff';
  /* сборка из костей в катсцене: части слетаются на место */
  const as=(k)=>{if(sp>=1)return;const a=k*2.3,r=(1-sp)*90;g.translate(Math.cos(a)*r,Math.sin(a)*r-(1-sp)*30);g.rotate((1-sp)*(k%2?2:-2));};
  /* призрачные языки под мантией */
  olLight(g,(g)=>{for(let k=0;k<4;k++){const x=-16+k*10,y=-8+Math.sin(t*3+k)*2;g.fillStyle='rgba(120,200,255,'+(0.25*sp)+')';g.beginPath();g.moveTo(x-5,y-6);g.quadraticCurveTo(x+Math.sin(t*4+k)*4,y+8,x+5,y-6);g.fill();}});
  /* мантия */
  g.save();as(1);
  for(let k=0;k<6;k++){const x=-22+k*8.5,w=Math.sin(t*2.6+k*1.4)*3;g.fillStyle=k%2?robe:robeD;g.beginPath();g.moveTo(x-5,-14);g.quadraticCurveTo(x+w,-4,x+w*1.5,2+((k*5)%6));g.lineTo(x+5,-14);g.closePath();g.fill();}
  g.fillStyle=hbLin(g,0,-80,0,-8,[[0,'#4a3a5e'],[0.6,robe],[1,robeD]]);
  g.beginPath();g.moveTo(-16,-76);g.quadraticCurveTo(-28,-40,-28,-12);g.lineTo(26,-12);g.quadraticCurveTo(26,-40,16,-76);g.closePath();g.fill();
  g.strokeStyle=gold;g.lineWidth=2.2;g.beginPath();g.moveTo(-27,-14);g.lineTo(25,-14);g.stroke();
  g.lineWidth=1.4;g.beginPath();g.moveTo(-10,-74);g.quadraticCurveTo(-14,-40,-12,-14);g.moveTo(10,-74);g.quadraticCurveTo(14,-40,12,-14);g.stroke();
  /* открытая грудь: рёбра и позвоночник */
  g.fillStyle='#120c18';g.beginPath();g.moveTo(-9,-72);g.lineTo(9,-72);g.lineTo(7,-40);g.lineTo(-7,-40);g.closePath();g.fill();
  g.strokeStyle=bone;g.lineCap='round';g.lineWidth=2.4;g.beginPath();g.moveTo(0,-72);g.lineTo(0,-38);g.stroke();
  g.lineWidth=1.6;for(let k=0;k<4;k++){const y=-68+k*7;g.beginPath();g.moveTo(0,y);g.quadraticCurveTo(-9,y+1,-8,y+5);g.moveTo(0,y);g.quadraticCurveTo(9,y+1,8,y+5);g.stroke();}
  {const hb2=0.6+0.4*Math.sin(t*3);mobGlow(g,0,-56,14,soul,0.4+0.3*hb2);g.fillStyle='rgba(170,230,255,'+(0.5+0.4*hb2)+')';g.beginPath();g.arc(0,-56,2.6,0,TAU);g.fill();}
  g.restore();
  /* наплечники-черепа и воротник */
  g.save();as(2);
  for(const s of [-1,1]){g.fillStyle=mobG(g,s*17,-74,9,bone);g.beginPath();g.ellipse(s*17,-74,9,7,s*0.3,0,TAU);g.fill();g.fillStyle='#1a1424';g.beginPath();g.arc(s*17-2,-75,1.6,0,TAU);g.arc(s*17+2,-75,1.6,0,TAU);g.fill();}
  g.fillStyle=boneD;for(let k=0;k<7;k++){const x=-15+k*5,h=8+(k===3?6:(k%2)*3);g.beginPath();g.moveTo(x-2.4,-76);g.lineTo(x,-76-h);g.lineTo(x+2.4,-76);g.fill();}
  g.restore();
  /* череп */
  g.save();as(3);
  {const jaw=(m.tele||0)*4+(B.atk==='curse'||B.atk==='army'?3:0);
    g.fillStyle=mobG(g,3,-90,12,bone);g.beginPath();g.ellipse(3,-90,11,12,0,0,TAU);g.fill();g.strokeStyle=boneD;g.lineWidth=0.8;g.stroke();
    g.fillStyle=bone;g.beginPath();g.moveTo(-4,-82);g.lineTo(11,-82);g.lineTo(10,-77+jaw);g.lineTo(-2,-77+jaw);g.closePath();g.fill();
    g.fillStyle='#120c18';for(const [x,y] of [[0,-90],[8,-90]]){g.beginPath();g.ellipse(x,y,3,3.6,0,0,TAU);g.fill();}
    for(const [x,y] of [[0,-90],[8,-90]]){mobGlow(g,x,y,9,soul,0.8);g.fillStyle='#d8f4ff';g.beginPath();g.arc(x+(m.lookX||0)*0.8,y,1.2,0,TAU);g.fill();}
    g.fillStyle='#120c18';g.beginPath();g.moveTo(4,-86);g.lineTo(5.6,-83);g.lineTo(2.4,-83);g.fill();
    g.fillStyle='#f4ecd8';for(let k=0;k<5;k++){g.fillRect(-1+k*2.6,-82,1.8,2);g.fillRect(-1+k*2.6,-78.8+jaw,1.8,2);}}
  /* корона */
  {const lift=ph>=3?3+Math.sin(t*2)*1.5:0;g.translate(0,-lift);
    g.fillStyle=hbLin(g,0,-118,0,-98,[[0,'#fff0b0'],[0.5,gold],[1,'#7a5a10']]);
    g.beginPath();g.moveTo(-9,-98);g.lineTo(-11,-112);g.lineTo(-5,-104);g.lineTo(-2,-120);g.lineTo(3,-106);g.lineTo(8,-120);g.lineTo(11,-104);g.lineTo(16,-112);g.lineTo(15,-98);g.closePath();g.fill();
    g.strokeStyle='#5a4008';g.lineWidth=0.7;g.stroke();
    for(const [x,y] of [[-2,-102],[3,-101],[8,-102]]){g.fillStyle='#7ad8ff';g.beginPath();g.arc(x,y,1.6,0,TAU);g.fill();mobGlow(g,x,y,6,soul,0.6);}
    if(ph>=3)mobGlow(g,3,-108,26,soul,0.35);}
  g.restore();
  /* кружащие черепа (2-я фаза и дальше) */
  if(ph>=2){for(let k=0;k<3;k++){const a=t*1.4+k*TAU/3,x=Math.cos(a)*38,y=-54+Math.sin(a)*14;if(Math.sin(a)<0&&k)continue;
    g.fillStyle=bone;g.beginPath();g.arc(x,y,4,0,TAU);g.fill();g.fillStyle='#120c18';g.fillRect(x-2,y-1,1.4,1.6);g.fillRect(x+0.6,y-1,1.4,1.6);mobGlow(g,x,y,8,soul,0.4);}}
  if(m.tele>0.05)mobGlow(g,3,-88,36,soul,m.tele*0.4);
};
/* огромные летающие кисти Императора — в мировых координатах */
function hbBoneHand(g,x,y,s,flip,clap,t){
  g.save();g.translate(x,y);g.scale(s*flip,s);
  olLight(g,(g)=>{softGlow(g,-12,2,22,'#7ac8ff',0.55);});
  const bn='#e8e0cc',bd='#9a907c';
  /* кости предплечья, обрубленные призрачным пламенем */
  g.strokeStyle=bd;g.lineCap='round';g.lineWidth=2.6;g.beginPath();g.moveTo(-18,-2);g.lineTo(-9,-1.5);g.moveTo(-18,2.6);g.lineTo(-9,2);g.stroke();
  g.strokeStyle=bn;g.lineWidth=1.6;g.stroke();
  /* запястье: россыпь мелких косточек */
  g.fillStyle=bn;for(const [cx,cy,r] of [[-8,-2.4,2],[-8,1.6,2.1],[-5.4,-0.4,2.2],[-5.6,3.4,1.7],[-5.2,-3.8,1.6]]){g.beginPath();g.arc(cx,cy,r,0,TAU);g.fill();}
  /* пясть и пальцы по три фаланги, сгибаются при хлопке */
  const cur=clap?1.05:0.18+Math.sin(t*2)*0.06;
  for(let k=0;k<4;k++){const y0=-4.6+k*3.1,c=cur+(k-1.5)*0.04;
    g.save();g.translate(-3.6,y0*0.55);g.rotate((k-1.5)*0.12);
    g.strokeStyle=bd;g.lineWidth=2.2;g.beginPath();g.moveTo(0,0);g.lineTo(7,0);g.stroke();g.strokeStyle=bn;g.lineWidth=1.5;g.stroke();
    g.translate(7,0);
    for(let j=0;j<3;j++){const L=[4.6,3.4,2.6][j];g.fillStyle=bn;g.beginPath();g.arc(0,0,1.1,0,TAU);g.fill();g.rotate(c*(j?0.8:0.6));
      g.strokeStyle=bd;g.lineWidth=1.9-j*0.3;g.beginPath();g.moveTo(0,0);g.lineTo(L,0);g.stroke();g.strokeStyle=bn;g.lineWidth=1.3-j*0.2;g.stroke();g.translate(L,0);}
    g.fillStyle=bn;g.beginPath();g.moveTo(0,-0.7);g.lineTo(1.4,0);g.lineTo(0,0.7);g.fill();
    g.restore();}
  /* большой палец */
  g.save();g.translate(-5,-4.4);g.rotate(-0.9+(clap?0.8:0));for(let j=0;j<2;j++){g.strokeStyle=bn;g.lineWidth=1.6;g.beginPath();g.moveTo(0,0);g.lineTo(4,0);g.stroke();g.translate(4,0);g.rotate(0.3);}g.restore();
  /* призрачный огонь у запястья */
  olLight(g,(g)=>{for(let k=0;k<3;k++){const f=(t*2+k*0.33)%1;g.fillStyle='rgba(150,220,255,'+(0.6*(1-f))+')';g.beginPath();g.arc(-18-f*8,(k-1)*2.4+Math.sin(t*6+k)*1.2,1.6*(1-f*0.5),0,TAU);g.fill();}});
  g.restore();
}
HB_POST.emperor=function(g,m,t,B){
  if(!B.hx)return;const s=m.h/100*1.6,sp=m.spawnS===undefined?1:m.spawnS;
  g.globalAlpha*=sp;
  for(let i=0;i<2;i++){const x=B.hx[i]-m.x,y=B.hy[i]-m.y;hbBoneHand(g,x,y,s,i?1:-1,B.clap>0||B.atk==='teleport'&&B.sub===3,t);}
  if(B.clap>0)B.clap-=1/60;
};
HB_POST.hb_echo=null;

/* ======================= ВЛАДЫКА МАГМЫ ======================= */
HB_MODEL.warden=function(g,m,t,B,U){
  const ph=B.phase||1,sy=(m.hbB?(hbBounds(m).floor-m.y)/U:-19)+2,coreOpen=ph>=3,weak=B.weak>0;
  g.beginPath();g.rect(-300,-400,600,400+sy);g.clip();
  const rock='#2e2420',rockL='#4a3a32',rockD='#16100e',mag='#ff7a1a';
  const crack=(pts,w)=>{olLight(g,(g)=>{g.strokeStyle='rgba(255,'+(110+Math.floor(40*Math.sin(t*3)))+',30,'+(0.75)+')';g.lineWidth=w||1.6;g.lineJoin='round';g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.stroke();});
    g.strokeStyle='#ffb040';g.lineWidth=(w||1.6)*0.4;g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.stroke();};
  /* торс из базальтовых плит */
  g.fillStyle=hbLin(g,0,-84,0,-10,[[0,rockL],[0.5,rock],[1,rockD]]);
  g.beginPath();g.moveTo(-34,-14);g.lineTo(-46,-74);g.quadraticCurveTo(0,-90,46,-74);g.lineTo(34,-14);g.closePath();g.fill();
  g.strokeStyle=rockD;g.lineWidth=1.4;
  for(const [x0,y0,x1,y1] of [[-40,-52,40,-52],[-36,-32,36,-32],[0,-84,0,-14],[-20,-74,-18,-52],[22,-74,20,-52],[-16,-52,-14,-32],[18,-52,16,-32]]){g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();}
  crack([[-30,-20],[-24,-30],[-28,-40],[-22,-48]]);crack([[28,-22],[24,-34],[30,-44]]);crack([[-6,-30],[-2,-24],[-8,-16]],1.2);
  /* ядро в груди */
  {const cx=4,cy=-58,r=12,pk=0.5+0.5*Math.sin(t*(coreOpen?7:3));
    if(coreOpen||weak){mobGlow(g,cx,cy,r*3.4,'#ffd040',0.5+0.3*pk);const gr=g.createRadialGradient(cx,cy,1,cx,cy,r);gr.addColorStop(0,'#fffbe0');gr.addColorStop(0.4,'#ffd040');gr.addColorStop(1,'#ff5a1a');g.fillStyle=gr;g.beginPath();g.arc(cx,cy,r*(0.9+pk*0.1),0,TAU);g.fill();}
    else{g.fillStyle='#3a1a0c';g.beginPath();g.arc(cx,cy,r,0,TAU);g.fill();mobGlow(g,cx,cy,r*2,mag,0.25+0.15*pk);}
    /* закрывающие ядро плиты расходятся при уязвимости */
    const op=coreOpen?1:weak?0.6:0;
    g.fillStyle=rockL;for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4;g.save();g.translate(cx+Math.cos(a)*op*8,cy+Math.sin(a)*op*8);g.rotate(a);g.beginPath();g.moveTo(0,0);g.lineTo(r*1.25,-r*0.62);g.lineTo(r*1.25,r*0.62);g.closePath();g.fill();g.strokeStyle=rockD;g.lineWidth=1;g.stroke();g.restore();}}
  /* голова */
  {const hx=6,hy=-92;
    g.fillStyle=rockL;for(const s of [-1,1]){g.beginPath();g.moveTo(hx+s*8,hy-6);g.quadraticCurveTo(hx+s*20,hy-22,hx+s*12-6,hy-34);g.quadraticCurveTo(hx+s*14,hy-18,hx+s*3,hy-8);g.closePath();g.fill();}
    g.fillStyle=mobG(g,hx,hy,14,rock);g.beginPath();g.moveTo(hx-12,hy+8);g.lineTo(hx-13,hy-6);g.lineTo(hx-4,hy-14);g.lineTo(hx+12,hy-12);g.lineTo(hx+14,hy+2);g.lineTo(hx+8,hy+10);g.closePath();g.fill();
    g.fillStyle=rockD;g.fillRect(hx-12,hy-5,26,4);
    const eg=ph>=3?'#ffe080':'#ff9a2a';for(const ex of [hx-4,hx+7]){g.fillStyle=eg;g.fillRect(ex-3,hy-3,6,2);mobGlow(g,ex,hy-2,10,eg,0.8);}
    g.fillStyle='#1a0a04';g.beginPath();g.moveTo(hx-5,hy+4);g.lineTo(hx+10,hy+4);g.lineTo(hx+8,hy+8+(m.tele||0)*3);g.lineTo(hx-3,hy+8+(m.tele||0)*3);g.closePath();g.fill();
    if(Math.sin(t*1.7)>0.3){const d=(t*20)%10;g.fillStyle='#ffb040';g.beginPath();g.ellipse(hx+3,hy+9+d,1.2,2,0,0,TAU);g.fill();}}
  /* плечи-валуны с обрывками цепей */
  for(const s of [-1,1]){const x=s*42,y=-78;g.fillStyle=mobG(g,x,y,16,rockL);g.beginPath();g.ellipse(x,y,17,14,s*0.3,0,TAU);g.fill();g.strokeStyle=rockD;g.lineWidth=1.2;g.stroke();
    crack([[x-6,y-8],[x-1,y-2],[x+5,y-6]],1.1);
    g.fillStyle='#4a4a52';g.fillRect(x-7,y+6,14,5);g.strokeStyle='#7a7a86';g.lineWidth=2;for(let k=0;k<3;k++){g.beginPath();g.ellipse(x+Math.sin(t+k)*1.5,y+16+k*7,2.6,4,0,0,TAU);g.stroke();}}
  /* лава стекает по телу */
  for(let k=0;k<4;k++){const x=-26+k*16,d=((t*14+k*7)%30);g.fillStyle='rgba(255,140,40,.85)';g.beginPath();g.ellipse(x,-40+d,1.4,3,0,0,TAU);g.fill();}
};
/* цепи от плеч к стенам кузни */
HB_PRE.warden=function(g,m,t,B,U){
  if(!m.hbB||m.alive===false&&!m.dieK)return;
  const R=hbBounds(m);const pts=[[R.minX-m.w*0.5-m.x+6,R.top-m.y+50],[R.maxX+m.w*0.5-m.x-6,R.top-m.y+50]];
  for(let i=0;i<2;i++){const s=i?1:-1,sx=s*42*U*(m.facing||1),sy=-78*U,[ax,ay]=pts[i];
    g.strokeStyle='#3a3a44';g.lineWidth=5;g.setLineDash([9,5]);g.beginPath();g.moveTo(ax,ay);g.quadraticCurveTo((ax+sx)/2,Math.max(ay,sy)+60+Math.sin(t+i)*6,sx,sy);g.stroke();
    g.strokeStyle='#6a6a78';g.lineWidth=2;g.stroke();g.setLineDash([]);}
};
/* руки Владыки и лавовое кольцо — в мировых координатах */
HB_POST.warden=function(g,m,t,B,U){
  const R=m.hbB?hbBounds(m):{floor:m.y-m.h*0.19,minX:m.x-300,maxX:m.x+300},f=m.facing||1,surf=R.floor-m.y;
  const rock='#2e2420',rockL='#4a3a32';
  for(let i=0;i<2;i++){const s=i?1:-1,shx=s*44*U*f,shy=-76*U;
    let fx=shx+s*f*14*U+Math.sin(t*1.3+i)*6,fy=surf-8+Math.sin(t*1.7+i*2)*5;
    const act=B.fist&&((B.fist.side>0)===(s*f>0));
    if(act){const tx=B.fist.x-m.x,ty=B.fist.y-m.y-14;
      if(B.fist.k<0){const k=-B.fist.k;fx=lerp(fx,shx+s*f*10,k);fy=lerp(fy,shy-60*U*k,k);}else{fx=lerp(fx,tx,B.fist.k);fy=lerp(fy,ty,B.fist.k);}}
    if(B.raise>0){fx=lerp(fx,shx*0.7,B.raise);fy=lerp(fy,shy-46*U,B.raise);}
    if(B.sweepK&&s*f>0){const k=B.sweepK;const ty=(B.sweepY||m.y)-m.y;if(k<0){fx=lerp(fx,-f*90*U,-k);fy=lerp(fy,ty,-k);}else{fx=lerp(-f*90*U,f*(R.maxX-R.minX)*0.6,k);fy=ty;}}
    const [ex,ey]=hbIK(shx,shy,fx,fy,40*U,40*U,s*f>0?1:-1);
    hbLimb(g,shx,shy,ex,ey,11*U,9*U,rock,'#16100e');hbLimb(g,ex,ey,fx,fy,9*U,8*U,rockL,'#16100e');
    olLight(g,(g)=>{g.strokeStyle='rgba(255,120,30,.7)';g.lineWidth=1.6;g.beginPath();g.moveTo(shx,shy);g.lineTo((shx+ex)/2+3,(shy+ey)/2);g.lineTo(ex,ey);g.lineTo((ex+fx)/2-3,(ey+fy)/2);g.stroke();});
    g.fillStyle=rockL;g.beginPath();g.arc(fx,fy,13*U,0,TAU);g.fill();g.strokeStyle='#16100e';g.lineWidth=1.4;g.stroke();
    g.fillStyle=rock;for(let k=0;k<4;k++){g.beginPath();g.arc(fx+(k-1.5)*6*U,fy-9*U,4*U,0,TAU);g.fill();}
    if(act&&B.fist.k>0.9)mobGlow(g,fx,fy,40*U,'#ff7a1a',0.6);}
  /* лава вокруг пояса */
  olLight(g,(g)=>{softGlow(g,0,surf,m.w*0.8,'#ff6a10',0.55);});
  g.fillStyle='rgba(255,140,40,.85)';g.beginPath();g.ellipse(0,surf,m.w*0.42,6+Math.sin(t*3)*1.5,0,0,TAU);g.fill();
  g.fillStyle='rgba(255,220,120,.7)';for(let k=0;k<5;k++){const x=(k-2)*m.w*0.16+Math.sin(t*2+k)*4;g.beginPath();g.arc(x,surf-1+Math.sin(t*5+k)*1.5,2+((k*7)%3),0,TAU);g.fill();}
};

/* ======================= АРХИДЕМОН ИНФЕРНАЛИС ======================= */
HB_MODEL.archdemon=function(g,m,t,B){
  const ph=B.phase||1,wings=B.wings===undefined?1:B.wings,air=B.flap>0||B.diving;
  const walk=m.onGround&&Math.abs(m.vx)>30,wk=m.anim*7;
  const skin='#6a2226',skinD='#34100f',iron='#2a2228',ironL='#4a3e48',fire='#ff5a1a',bone='#e8dcc4';
  const flap=air?Math.sin(t*(B.diving?14:4.5))*0.42:0.15+Math.sin(t*1.2)*0.04;
  const breathe=Math.sin(t*1.8)*0.8;
  if(B.diving)g.rotate(0.35);
  /* крылья */
  for(const s of [0,1]){g.save();g.translate(-8,-70);g.rotate(-2.35+(s?0.5:0)-flap*(s?1:0.8)+(1-wings)*1.3);g.scale(0.35+0.65*wings,0.35+0.65*wings);
    hbWing(g,92,s?'#5a1416':'#34090b',s?'#2a1a18':'#1a100e',ph>=3?3:0,t,s*4,ph>=4);g.restore();}
  /* хвост */
  {const w=Math.sin(t*1.7)*8;g.strokeStyle=skinD;g.lineWidth=5;g.lineCap='round';g.beginPath();g.moveTo(-12,-38);g.bezierCurveTo(-36,-30+w,-50,-8,-62+w*0.5,-12-w);g.stroke();
    g.fillStyle=iron;g.save();g.translate(-62+w*0.5,-12-w);g.rotate(-0.6);g.beginPath();g.moveTo(0,0);g.lineTo(-8,-6);g.lineTo(-12,0);g.lineTo(-8,6);g.closePath();g.fill();g.restore();}
  /* ноги: козлиные, с копытами */
  const legF=(far)=>{const ph2=wk+(far?Math.PI:0),c=far?skinD:skin;
    const hx=far?-8:6,hy=-40;let fx=far?-6:10,fy=0;
    if(walk){fx+=Math.sin(ph2)*10;fy=-Math.max(0,Math.cos(ph2))*6;}
    if(!m.onGround&&!air){fx+=far?-6:8;fy=-10;}
    if(air){fx=hx-6;fy=-14;}
    const kx=hx+(far?-4:4)+4,ky=hy+12,ax=fx-4,ay=fy-10;
    hbLimb(g,hx,hy,kx,ky,8,6,c);hbLimb(g,kx,ky,ax,ay,6,4,c);hbLimb(g,ax,ay,fx,fy-2,4,3.4,c);
    g.fillStyle='#120608';g.beginPath();g.moveTo(fx-4,fy-3);g.lineTo(fx+5,fy-3);g.lineTo(fx+6,fy);g.lineTo(fx-5,fy);g.closePath();g.fill();
    g.fillStyle=iron;g.beginPath();g.ellipse(kx,ky,5,4,0,0,TAU);g.fill();};
  legF(true);
  /* дальняя рука */
  {const up=clamp(B.raise||0,0,1);const sx=-14,sy=-66,hx=lerp(-18,-10,up),hy=lerp(-38,-100,up);const [ex,ey]=hbIK(sx,sy,hx,hy,15,15,1);
    hbLimb(g,sx,sy,ex,ey,5.4,4.4,skinD);hbLimb(g,ex,ey,hx,hy,4.4,3.4,skinD);g.strokeStyle=bone;g.lineWidth=1.4;for(let k=-1;k<=1;k++){g.beginPath();g.moveTo(hx,hy);g.lineTo(hx+k*3,hy-6);g.stroke();}
    if(up>0.3){mobGlow(g,hx,hy-8,24,'#ff7a1a',0.6*up);hbFlame(g,hx,hy-6,4,12,t,3,'#ff7a1a','#ffd060');}}
  /* торс */
  g.fillStyle=mobG(g,2,-58,26,skin);g.beginPath();g.moveTo(-14,-40);g.quadraticCurveTo(-24,-56,-22,-72+breathe);g.quadraticCurveTo(2,-80,26,-72+breathe);g.quadraticCurveTo(22,-56,14,-40);g.closePath();g.fill();
  g.strokeStyle=skinD;g.lineWidth=1;g.beginPath();g.moveTo(2,-72);g.lineTo(2,-44);for(const y of [-62,-54,-47]){g.moveTo(-8,y);g.quadraticCurveTo(2,y+2,12,y);}g.stroke();
  olLight(g,(g)=>{g.strokeStyle='rgba(255,'+(90+Math.floor(40*Math.sin(t*2.4)))+',30,.55)';g.lineWidth=0.9;g.beginPath();
    g.moveTo(-12,-44);g.lineTo(-8,-52);g.lineTo(-12,-58);g.moveTo(14,-46);g.lineTo(10,-54);g.lineTo(14,-60);g.moveTo(-2,-48);g.lineTo(4,-52);g.stroke();});
  /* нагрудник и наплечники */
  g.fillStyle=hbLin(g,0,-76,0,-56,[[0,ironL],[1,iron]]);g.beginPath();g.moveTo(-18,-72);g.quadraticCurveTo(2,-80,24,-72);g.lineTo(20,-60);g.quadraticCurveTo(2,-56,-14,-60);g.closePath();g.fill();
  olLight(g,(g)=>{g.strokeStyle='rgba(255,100,30,'+(0.5+0.3*Math.sin(t*4))+')';g.lineWidth=1;g.beginPath();g.moveTo(-4,-70);g.lineTo(2,-64);g.lineTo(8,-70);g.moveTo(2,-64);g.lineTo(2,-58);g.stroke();});
  for(const s of [-1,1]){g.fillStyle=ironL;g.beginPath();g.ellipse(2+s*22,-72,10,7,s*0.4,0,TAU);g.fill();g.fillStyle=bone;for(let k=0;k<3;k++){g.beginPath();g.moveTo(2+s*(16+k*5),-77);g.lineTo(2+s*(18+k*5),-86+k);g.lineTo(2+s*(20+k*5),-77);g.fill();}}
  /* пояс с черепом */
  g.fillStyle=iron;g.fillRect(-15,-44,30,6);g.fillStyle=bone;g.beginPath();g.arc(2,-41,4,0,TAU);g.fill();g.fillStyle='#1a0808';g.fillRect(0,-42,1.4,1.6);g.fillRect(2.6,-42,1.4,1.6);
  /* набедренные пластины */
  g.fillStyle=iron;g.beginPath();g.moveTo(-14,-38);g.lineTo(-18,-26);g.lineTo(-4,-28);g.lineTo(-2,-38);g.fill();g.beginPath();g.moveTo(4,-38);g.lineTo(6,-26);g.lineTo(18,-28);g.lineTo(14,-38);g.fill();
  legF(false);
  /* голова: вытянутый демонический череп, бараньи рога, пламенная корона */
  {const hx=9,hy=-83,jaw=(B.breath?6:0)+(m.tele||0)*2.4,ec=ph>=4?'#ffffff':'#ffd040';
    g.save();g.translate(hx,hy);g.scale(1.3,1.3);
    /* дальний рог */
    hbHorn(g,[[-2,-6],[-8,-13],[-15,-14],[-19,-8],[-17,-1],[-12,1],[-9,-3]],3.6,'#8a7a64','#3a2e24');
    /* пламя между рогами */
    for(let k=0;k<4;k++)hbFlame(g,-5+k*3.6,-9,2,7+(k%2)*4,t,k+7,'#ff5a1a','#ffd060');
    mobGlow(g,0,-14,18,'#ff7a1a',0.45);
    /* череп и морда */
    g.fillStyle=mobG(g,1,-2,10,skin);
    g.beginPath();g.moveTo(-7,-8);g.quadraticCurveTo(0,-12,7,-8);g.lineTo(13,-4);g.lineTo(15,0);g.lineTo(12,3);g.lineTo(2,4);g.lineTo(-6,3);g.quadraticCurveTo(-9,-2,-7,-8);g.closePath();g.fill();
    g.strokeStyle=skinD;g.lineWidth=0.6;g.stroke();
    /* надбровье и шипы на скулах */
    g.fillStyle='#1a0608';g.beginPath();g.moveTo(-2,-6);g.lineTo(11,-5);g.lineTo(12,-3);g.lineTo(-1,-3.6);g.closePath();g.fill();
    g.fillStyle=bone;for(const [x,y] of [[-4,1],[-1,3]]){g.beginPath();g.moveTo(x,y);g.lineTo(x-3,y+3);g.lineTo(x+1,y+1);g.fill();}
    /* глаза-щели */
    for(const ex of [4,9]){g.fillStyle=ec;g.beginPath();g.moveTo(ex-2,-3.4);g.lineTo(ex+2,-4);g.lineTo(ex+1.4,-2.6);g.closePath();g.fill();mobGlow(g,ex,-3.2,7,'#ffa020',0.85);}
    /* ноздри */
    g.fillStyle='#120406';g.fillRect(12,-1.4,1.2,1);
    /* нижняя челюсть открывается */
    g.save();g.translate(-2,2.6);g.rotate(jaw*0.05);
    g.fillStyle=skinD;g.beginPath();g.moveTo(0,0);g.lineTo(13,0.4);g.lineTo(11,3.6);g.lineTo(1,3);g.closePath();g.fill();
    g.fillStyle='#f4e8d0';for(let k=0;k<4;k++){g.beginPath();g.moveTo(3+k*2.6,0.2);g.lineTo(4+k*2.6,-2);g.lineTo(5+k*2.6,0.2);g.fill();}
    g.restore();
    g.fillStyle='#f4e8d0';for(let k=0;k<4;k++){g.beginPath();g.moveTo(3+k*2.6,3);g.lineTo(4+k*2.6,5.2+jaw*0.15);g.lineTo(5+k*2.6,3);g.fill();}
    if(jaw>1){g.fillStyle='#ffb040';g.beginPath();g.ellipse(9,4+jaw*0.2,4,jaw*0.3,0,0,TAU);g.fill();mobGlow(g,12,4,14,'#ffa030',0.8);}
    /* ближний рог и прямые рога вверх */
    hbHorn(g,[[1,-8],[-4,-17],[-12,-20],[-19,-16],[-21,-8],[-18,-1],[-13,0]],4.2,'#cbb89a','#4a3a2c');
    hbHorn(g,[[5,-9],[7,-16],[11,-22],[16,-25]],2.4,'#d8c8a8','#4a3a2c');
    g.restore();}
  /* ближняя рука с мечом */
  {const sw=B.swing||0,idle=!sw;
    const sx=20,sy=-68;let hx,hy,ang;
    if(sw<0){const k=-sw;hx=lerp(26,6,k);hy=lerp(-46,-104,k);ang=lerp(0.55,-2.3,k);}
    else if(sw>0){hx=lerp(6,34,sw);hy=lerp(-104,-40,sw);ang=lerp(-2.3,0.8,sw);}
    else{hx=26;hy=-46+Math.sin(t*1.4)*1;ang=air?-0.3:0.55;}
    if(B.atk==='breath'){hx=22;hy=-50;ang=1.1;}
    const [ex,ey]=hbIK(sx,sy,hx,hy,16,16,-1);hbLimb(g,sx,sy,ex,ey,6,5,skin);hbLimb(g,ex,ey,hx,hy,5,4.4,skin);
    g.fillStyle=iron;g.beginPath();g.ellipse(ex,ey,5,4,0,0,TAU);g.fill();
    g.save();g.translate(hx,hy);g.rotate(ang);
    g.fillStyle='#3a2a20';g.fillRect(-10,-2,12,4);g.fillStyle='#c8a050';g.beginPath();g.arc(-11,0,2.6,0,TAU);g.fill();
    g.fillStyle=ironL;g.beginPath();g.moveTo(2,-9);g.lineTo(6,-9);g.lineTo(6,9);g.lineTo(2,9);g.closePath();g.fill();
    g.fillStyle=hbLin(g,0,-5,0,5,[[0,'#5a4a52'],[0.5,'#1a1418'],[1,'#3a2e36']]);g.beginPath();g.moveTo(6,-4.6);g.lineTo(66,-3);g.lineTo(76,0);g.lineTo(66,3);g.lineTo(6,4.6);g.closePath();g.fill();
    olLight(g,(g)=>{g.strokeStyle='rgba(255,'+(120+Math.floor(60*Math.sin(t*9)))+',40,.95)';g.lineWidth=1.6;g.beginPath();g.moveTo(8,-4.2);g.lineTo(66,-2.8);g.lineTo(75,0);g.stroke();
      g.strokeStyle='rgba(255,200,80,.8)';g.lineWidth=0.8;g.beginPath();g.moveTo(10,0);g.lineTo(60,0);g.stroke();});
    for(let k=0;k<6;k++)hbFlame(g,14+k*10,-3,2.6,7+((k*5)%4),t,k+11,hexA('#ff5a1a',0.85),hexA('#ffd060',0.85));
    if(sw>0.2)olLight(g,(g)=>{g.strokeStyle='rgba(255,160,60,'+(0.5*sw)+')';g.lineWidth=10;g.beginPath();g.arc(-6,0,70,-1.2,0.1);g.stroke();});
    g.restore();void idle;}
  if(ph>=4){olLight(g,(g)=>{g.strokeStyle='rgba(255,120,40,.7)';g.lineWidth=1.2;g.beginPath();g.moveTo(-6,-70);g.lineTo(-2,-60);g.lineTo(-8,-50);g.moveTo(10,-66);g.lineTo(6,-54);g.moveTo(-10,-32);g.lineTo(-14,-20);g.stroke();});}
  if(m.tele>0.05)mobGlow(g,6,-60,70,'#ff7a1a',m.tele*0.3);
};
