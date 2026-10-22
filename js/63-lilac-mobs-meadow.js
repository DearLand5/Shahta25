'use strict';
/* Модели мобов Цветущих лугов (Лиловые небеса): Мотылёк-принцесса, Ромашка-глазунья. Оба облика в одной функции, T — Истина; Пушистик и общие помощники — в 54 */

const lmMeadowWS=0.82;
/* мягкая заливка с тонким тёплым контуром */
function lmMeadowSoft(g,c,cx,cy,r,sh){
  const gr=g.createRadialGradient(cx-r*0.4,cy-r*0.5,r*0.05,cx-r*0.1,cy-r*0.1,r*1.3);
  gr.addColorStop(0,shadeHex(c,0.5));gr.addColorStop(0.35,shadeHex(c,0.12));gr.addColorStop(0.62,c);gr.addColorStop(1,mixHex(c,sh||'#a04a98',0.55));
  g.fillStyle=gr;g.fill();g.strokeStyle=mixHex(c,sh||'#7a2a78',0.55);g.lineWidth=0.7;g.lineJoin='round';g.stroke();
}
/* плавный замкнутый контур через середины отрезков: рваный, но живой край */
function lmMeadowSmooth(g,pts,ox,oy,sx,sy){ox=ox||0;oy=oy||0;sx=sx||1;sy=sy||sx;const n=pts.length,P=i=>pts[(i+n)%n];
  g.moveTo(ox+(P(0)[0]+P(-1)[0])/2*sx,oy+(P(0)[1]+P(-1)[1])/2*sy);
  for(let i=0;i<n;i++){const a=P(i),b=P(i+1);g.quadraticCurveTo(ox+a[0]*sx,oy+a[1]*sy,ox+(a[0]+b[0])/2*sx,oy+(a[1]+b[1])/2*sy);}g.closePath();}
/* четырёхлучевая звёздочка */
function lmMeadowStar(g,x,y,r,col,a){g.save();g.globalAlpha*=(a==null?1:a);g.fillStyle=col;g.beginPath();for(let i=0;i<8;i++){const rr=i%2?r*0.3:r,an=i/8*TAU-Math.PI/2;g.lineTo(x+Math.cos(an)*rr,y+Math.sin(an)*rr);}g.closePath();g.fill();g.restore();}
/* ломаный контур по точкам: рваный край */
function lmMeadowPoly(g,pts,ox,oy,sx,sy){ox=ox||0;oy=oy||0;sx=sx||1;sy=sy||sx;g.moveTo(ox+pts[0][0]*sx,oy+pts[0][1]*sy);for(let i=1;i<pts.length;i++)g.lineTo(ox+pts[i][0]*sx,oy+pts[i][1]*sy);g.closePath();}
/* глаз-миндаль на крыле Истины: белок с жилками, радужка, щель зрачка, тяжёлое веко; lid — открытость (0..1) */
function lmMeadowAlmond(g,m,x,y,rx,ry,lid,glow,tilt){
  const bl=(Math.sin(m.anim*1.1+m.phase*7+x)>0.988)?0.1:1,op=Math.min(lid,1)*bl;
  g.save();g.translate(x,y);g.rotate(tilt||0);
  if(glow>0)mobGlow(g,0,0,rx*2.6,'#ff2a3a',glow);
  /* тёмная впадина-мешок вокруг */
  g.fillStyle='rgba(20,10,16,.75)';g.beginPath();g.ellipse(0,0.3,rx*1.18,ry*1.4,0,0,TAU);g.fill();
  g.beginPath();g.moveTo(-rx,0);g.quadraticCurveTo(0,-ry*1.7*op-0.2,rx,0);g.quadraticCurveTo(0,ry*1.5*op+0.2,-rx,0);g.closePath();
  const eg=g.createRadialGradient(-rx*0.3,-ry*0.4,0.2,0,0,rx*1.1);eg.addColorStop(0,'#f4ece6');eg.addColorStop(0.7,'#d8c8c4');eg.addColorStop(1,'#a08488');
  g.fillStyle=eg;g.fill();
  g.save();g.clip();
  if(op>0.3){
    const lx=(m.lookX||0)*m.facing*rx*0.34,ly=(m.lookY||0)*ry*0.3;
    g.strokeStyle='rgba(190,30,44,.75)';g.lineWidth=0.3;for(let i=0;i<7;i++){const a=i/7*TAU+0.4;g.beginPath();g.moveTo(Math.cos(a)*rx*1.05,Math.sin(a)*ry*1.1);g.quadraticCurveTo(Math.cos(a+0.25)*rx*0.7,Math.sin(a+0.25)*ry*0.7,lx+Math.cos(a)*ry*0.8,ly+Math.sin(a)*ry*0.8);g.stroke();}
    const ig=g.createRadialGradient(lx,ly,0.1,lx,ly,ry*1.05);ig.addColorStop(0,'#ff6a5a');ig.addColorStop(0.5,'#a81e30');ig.addColorStop(1,'#3a0812');
    g.fillStyle=ig;g.beginPath();g.arc(lx,ly,ry*0.95,0,TAU);g.fill();
    g.fillStyle='#08020a';g.beginPath();g.ellipse(lx,ly,ry*0.17,ry*0.68,0,0,TAU);g.fill();
    g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.arc(lx-ry*0.3,ly-ry*0.38,ry*0.2,0,TAU);g.fill();
  }
  g.restore();
  /* верхнее веко: тяжёлое, серое, с кромкой */
  const lidY=-ry*(1.75*op)+ry*0.15;
  g.fillStyle='#55525c';g.beginPath();g.moveTo(-rx*1.08,0.3);g.quadraticCurveTo(0,-ry*1.9*op-0.3,rx*1.08,0.3);g.quadraticCurveTo(0,lidY-ry*(1-op)*0.2+ry*0.2,-rx*1.08,0.3);g.closePath();g.fill();
  g.strokeStyle='#1c1218';g.lineWidth=0.5;g.beginPath();g.moveTo(-rx,0);g.quadraticCurveTo(0,-ry*1.7*op-0.2,rx,0);g.quadraticCurveTo(0,ry*1.5*op+0.2,-rx,0);g.stroke();
  g.strokeStyle='rgba(30,20,26,.8)';g.lineWidth=0.4;g.beginPath();g.moveTo(-rx*0.9,ry*0.9);g.quadraticCurveTo(0,ry*1.9*op+0.6,rx*0.9,ry*0.9);g.stroke();
  g.restore();
}

/* рука-палочка: тонкая конечность с изгибом, объёмом и ладошкой */
function lmMeadowArm(g,x0,y0,x1,y1,w0,w1,col,bend){
  const mx=(x0+x1)/2,my=(y0+y1)/2+bend,an=Math.atan2(y1-y0,x1-x0),nx=-Math.sin(an),ny=Math.cos(an);
  g.beginPath();g.moveTo(x0+nx*w0/2,y0+ny*w0/2);g.quadraticCurveTo(mx+nx*(w0+w1)/4,my+ny*(w0+w1)/4,x1+nx*w1/2,y1+ny*w1/2);g.lineTo(x1-nx*w1/2,y1-ny*w1/2);g.quadraticCurveTo(mx-nx*(w0+w1)/4,my-ny*(w0+w1)/4,x0-nx*w0/2,y0-ny*w0/2);g.closePath();
  lmMeadowSoft(g,col,mx-1,my-1,Math.hypot(x1-x0,y1-y0)*0.6);
}
/* ---- Мотылёк-принцесса ---- */
/* контуры крыльев Иллюзии: корень в (0,0), крыло уходит по +x и вверх по −y */
function lmMeadowFoP(g){g.beginPath();g.moveTo(0,0.5);g.bezierCurveTo(1,-8,8,-18,17,-20.5);g.quadraticCurveTo(22,-21,23.2,-16);g.quadraticCurveTo(25.8,-12.5,23.2,-9);g.quadraticCurveTo(26.4,-5.6,22,-3);g.quadraticCurveTo(20.6,-0.2,15.5,0.8);g.bezierCurveTo(10,3.2,4,2.8,0,0.5);g.closePath();}
function lmMeadowHiP(g){g.beginPath();g.moveTo(0,1.2);g.bezierCurveTo(6,-1,14,0.5,16.6,6);g.quadraticCurveTo(19.4,10.6,15.4,13);g.quadraticCurveTo(14.2,17.6,9.6,15.6);g.quadraticCurveTo(6.4,20.4,2.8,14.4);g.bezierCurveTo(0.4,11,-0.8,6,0,1.2);g.closePath();}
/* крыло: радужная заливка, тень у корня, светлый край, жилки, пятна */
function lmMeadowWingI(g,hind,far,t){
  const P=hind?lmMeadowHiP:lmMeadowFoP,dk=far?-0.26:0;
  P(g);const gr=g.createLinearGradient(0,hind?0:-2,hind?14:24,hind?14:-14);
  gr.addColorStop(0,shadeHex('#ff8cc0',dk));gr.addColorStop(0.38,shadeHex('#e0b0ff',dk));gr.addColorStop(0.72,shadeHex('#a8d4ff',dk));gr.addColorStop(1,shadeHex('#9af0e0',dk));
  g.fillStyle=gr;g.fill();
  g.save();P(g);g.clip();
  const rg=g.createRadialGradient(0,0.5,0,0,0.5,hind?12:15);rg.addColorStop(0,'rgba(170,60,140,.6)');rg.addColorStop(1,'rgba(170,60,140,0)');g.fillStyle=rg;g.fillRect(-3,-24,30,40);
  /* перламутровый блик у переднего края */
  const hg=g.createLinearGradient(0,-20,0,2);hg.addColorStop(0,'rgba(255,255,255,.5)');hg.addColorStop(0.5,'rgba(255,255,255,.06)');hg.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=hg;g.fillRect(0,-24,28,28);
  g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=2.8;P(g);g.stroke();
  g.strokeStyle='rgba(120,60,170,.3)';g.lineWidth=1.6;g.beginPath();g.moveTo(hind?4:3,hind?15:3.4);g.bezierCurveTo(10,hind?18:2.4,18,0,hind?17:24,hind?7:-6);g.stroke();
  /* жилки */
  g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=0.4;
  const vs=hind?[[16,5],[15,11],[10,14],[5,12]]:[[18,-19],[22,-12],[22,-5],[15,-1],[10,-14]];
  for(const [x,y] of vs){g.beginPath();g.moveTo(0.4,0.2);g.quadraticCurveTo(x*0.5,y*0.3-1,x,y);g.stroke();}
  /* пятна-глазки */
  const sp=hind?[[11,8,2.6,'#ffe078'],[6.5,12,1.6,'#ff9cc8']]:[[16.5,-12.5,3.6,'#ff9cc8'],[19,-5.5,2.2,'#ffe078'],[11,-6,2.4,'#c8a0ff']];
  for(const [x,y,r,c] of sp){
    g.fillStyle=shadeHex(c,dk);g.beginPath();g.arc(x,y,r,0,TAU);g.fill();
    g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.arc(x-r*0.25,y-r*0.3,r*0.5,0,TAU);g.fill();
    g.strokeStyle='rgba(255,255,255,.65)';g.lineWidth=0.5;g.beginPath();g.arc(x,y,r+0.9,0,TAU);g.stroke();
    g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.arc(x-r*0.35,y-r*0.45,r*0.18,0,TAU);g.fill();}
  g.restore();
  P(g);g.strokeStyle=far?'rgba(90,40,120,.65)':'rgba(130,60,150,.6)';g.lineWidth=0.7;g.lineJoin='round';g.stroke();
  /* точки по краю */
  if(!hind){g.fillStyle='rgba(255,255,255,.85)';for(const [x,y] of [[22.4,-16.6],[24,-10.4],[23.4,-4.6],[18.6,-1.2]]){g.beginPath();g.arc(x-1.2,y,0.5,0,TAU);g.fill();}}
}

LM_MODEL.lbutterfly=function(g,m,FY,t,T,st,k,wv,ph){
  const dive=st==='dive',wu=(st==='windup'||st==='swoopw')?k:0,fast=dive?22:12;
  const fl=Math.sin(t*fast+m.phase),fl2=Math.sin(t*fast+m.phase-0.7);
  const dvA=dive?Math.atan2(m.dvy===undefined?0.7:m.dvy,Math.abs(m.dvx===undefined?1:m.dvx)||1):0;
  const tilt=dive?0.45+dvA*0.5:st==='swoopw'?-0.3*k:(wu>0?-(T?0.2:0.12)*k:Math.sin(t*1.7)*0.05);
  g.save();g.translate(0,-wu*(st==='swoopw'?0:2.2));g.rotate(tilt);
  /* углы крыльев: взмах; в замахе подняты и дрожат, в броске отведены назад */
  const upA=(T?0.1:-0.1)+fl*0.42,wA=wu>0?-0.66+Math.sin(t*34)*0.07*wu:dive?0.55+fl*0.12:upA;
  const sc=wu>0?1+(T?0.17:0.1)*wu:dive?0.8:1;
  const nearA=wu>0||dive?wA:wA-0.08+(fl2-fl)*0.05;
  if(!T){
    const hx=1.8,hy=-10.8;
    /* дальние крылья (+x): темнее, чуть уже */
    for(const hind of [1,0]){g.save();g.translate(2.2,-3.2+(hind?1.6:0));g.scale(0.84*sc*lmMeadowWS,0.86*sc*lmMeadowWS);g.rotate(nearA*(hind?0.75:1)+(hind?0.5:0.18));lmMeadowWingI(g,hind,true,t);g.restore();}
    /* усики: с жемчужинками */
    for(const [sx,sd] of [[-0.6,-1],[3.1,1]]){const sw=Math.sin(t*2.6+sd*1.3)*1.3+wu*Math.sin(t*20)*0.5;
      g.strokeStyle='#8a5aa0';g.lineWidth=0.7;g.lineCap='round';g.beginPath();g.moveTo(sx,hy-4.4);g.quadraticCurveTo(sx+sd*2+sw*0.5,hy-10,sx+sd*5.4+sw,hy-14.4);g.stroke();
      g.beginPath();g.arc(sx+sd*5.4+sw,hy-14.8,1.2,0,TAU);mobPath(g,'#fff0f8',sx+sd*5.4+sw,hy-14.8,1.4,true);
      g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.arc(sx+sd*5.4+sw-0.4,hy-15.2,0.35,0,TAU);g.fill();}
    /* ближние крылья (−x) */
    for(const hind of [1,0]){g.save();g.translate(-2,-3.2+(hind?1.6:0));g.scale(-sc*lmMeadowWS,sc*lmMeadowWS);g.rotate(nearA*(hind?0.75:1)+(hind?0.5:0));lmMeadowWingI(g,hind,false,t);g.restore();}
    /* ножки */
    g.strokeStyle='#c8789e';g.lineWidth=0.7;g.lineCap='round';for(const [x0,x1,y1] of [[-1.4,-3,14.6],[1.4,1.2,15.4]]){g.beginPath();g.moveTo(x0,10);g.quadraticCurveTo((x0+x1)/2-0.6,12.6,x1,y1);g.stroke();g.fillStyle='#ff9cc8';g.beginPath();g.arc(x1,y1,0.7,0,TAU);g.fill();}
    /* брюшко: радужные кольца */
    g.beginPath();g.ellipse(-0.6,6.4,3.3,7.2,0.1,0,TAU);lmMeadowSoft(g,'#ffcce2',-1.5,3,8);
    g.save();g.clip();
    const bc=['#ffa8d0','#d0b0ff','#a8d8ff','#fff0a0','#ffa8d0'];
    for(let i=0;i<5;i++){g.fillStyle=bc[i];g.globalAlpha=0.85;g.fillRect(-5,1.6+i*2.5,9,1.5);}g.globalAlpha=1;
    g.fillStyle='rgba(255,255,255,.5)';g.fillRect(-2.6,0,0.9,15);
    g.fillStyle='rgba(120,60,160,.28)';g.beginPath();g.ellipse(1.4,8,2.2,8,0,0,TAU);g.fill();
    g.restore();
    /* грудка: пушистый воротник */
    lmFluff(g,0.2,-3,4.8,4.2,9,0.2,3.7);lmMeadowSoft(g,'#ffe2ee',-1,-5,5.5);
    lmFur(g,[[-2.4,-5,-0.9,-0.7],[0,-6.6,0.2,-1.4],[2.6,-5.4,1,-1],[-3.2,-2,-1.2,0.4],[3.2,-1.6,1.2,0.6],[-1,-0.6,-0.2,1.1],[1.4,-0.2,0.4,1.1]],'rgba(255,170,205,.75)',0.5);
    lmFur(g,[[-1.6,-5.8,-0.5,-0.8],[1.4,-6,0.6,-1]],'rgba(255,255,255,.9)',0.5);
    /* задняя ручка (темнее) */
    lmMeadowArm(g,-2,-2,-5.4,2.4,1.9,1.1,'#e8a8c8',1.2);
    /* голова */
    const hb=Math.sin(t*1.9)*0.3;g.save();g.translate(0,hb);
    lmFluff(g,hx-2.4,hy-0.6,5.6,6.2,10,0.2,5.9,0.2);lmMeadowSoft(g,'#ff9ec8',hx-3,hy-3,6);
    g.beginPath();g.ellipse(hx,hy,5.5,5.2,0,0,TAU);lmMeadowSoft(g,'#ffdcea',hx-1,hy-1.5,6);
    /* пушистая чёлка */
    lmFluff(g,hx-0.2,hy-1.4,5.8,4.4,9,0.2,5.1,0,Math.PI*1.02,Math.PI*1.98);g.closePath();lmMeadowSoft(g,'#ffb0d2',hx-1.2,hy-4,6);
    lmFur(g,[[hx-3,hy-4,0.2,1.8],[hx,hy-4.6,0.4,2],[hx+3,hy-3.8,0.8,1.6]],'rgba(255,235,245,.9)',0.5);
    /* глаза: дальний меньше, ближний большой */
    for(const [ex,ey,rx,ry,far] of [[hx+4.6,hy+0.5,1.3,2.2,1],[hx+0.9,hy+0.3,2.1,2.6,0]]){
      const bl=(Math.sin(m.anim*1.1+m.phase*7)>0.985)?0.12:1,lx=(m.lookX||0)*m.facing*0.5,ly=(m.lookY||0)*0.4;
      g.fillStyle='#4a2a6a';g.beginPath();g.ellipse(ex,ey,rx,ry*bl,0,0,TAU);g.fill();
      if(bl>0.5){const ig=g.createRadialGradient(ex+lx,ey+ly+0.8,0.2,ex+lx,ey+ly,ry);ig.addColorStop(0,'#c8fff0');ig.addColorStop(0.5,'#38b8c8');ig.addColorStop(1,'#1a5a8a');
        g.fillStyle=ig;g.beginPath();g.ellipse(ex+lx,ey+ly,rx*0.9,ry*0.92,0,0,TAU);g.fill();
        g.fillStyle='#0e1a3a';g.beginPath();g.ellipse(ex+lx,ey+ly+0.1,rx*0.42,ry*0.46,0,0,TAU);g.fill();
        g.fillStyle='#fff';g.beginPath();g.arc(ex+lx-rx*0.38,ey+ly-ry*0.4,rx*0.34,0,TAU);g.fill();g.beginPath();g.arc(ex+lx+rx*0.35,ey+ly+ry*0.35,rx*0.16,0,TAU);g.fill();}
      g.strokeStyle='#6a3a8a';g.lineWidth=0.45;g.beginPath();g.ellipse(ex,ey,rx+0.05,(ry+0.05)*bl,0,Math.PI*1.1,Math.PI*1.9);g.stroke();
      if(!far){g.lineWidth=0.5;g.beginPath();g.moveTo(ex-rx,ey-ry*0.4);g.lineTo(ex-rx-1.2,ey-ry*0.8);g.moveTo(ex-rx*0.5,ey-ry*0.9);g.lineTo(ex-rx-0.5,ey-ry*1.4);g.stroke();}}
    /* румянец и улыбка */
    g.fillStyle='rgba(255,120,170,.5)';g.beginPath();g.ellipse(hx+0.2,hy+3.2,1.5,0.9,0,0,TAU);g.fill();g.beginPath();g.ellipse(hx+5.2,hy+3.1,1,0.8,0,0,TAU);g.fill();
    g.strokeStyle='#b0486e';g.lineWidth=0.6;g.lineCap='round';
    if(wu>0.15){g.fillStyle='#6a1a3a';g.beginPath();g.ellipse(hx+3,hy+3.6,1.3,0.5+wu*1.2,0,0,TAU);g.fill();}
    else{g.beginPath();g.moveTo(hx+1.6,hy+3.1);g.quadraticCurveTo(hx+3,hy+4.8,hx+4.5,hy+3.2);g.stroke();}
    /* корона */
    g.save();g.translate(hx-0.4,hy-5.4);g.rotate(-0.1);
    g.beginPath();g.moveTo(-3.6,0.6);g.lineTo(-3.8,-2.6);g.lineTo(-1.8,-1);g.lineTo(0,-3.8);g.lineTo(1.8,-1);g.lineTo(3.8,-2.6);g.lineTo(3.6,0.6);g.closePath();mobPath(g,'#ffd460',0,-1.5,4.4);
    g.fillStyle='rgba(255,255,255,.7)';g.fillRect(-3,-0.2,6,0.5);
    g.fillStyle='#ff6a9a';g.beginPath();g.arc(0,-0.4,0.75,0,TAU);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(-0.2,-0.6,0.25,0,TAU);g.fill();
    for(const px of [-3.8,0,3.8]){g.fillStyle='#fff6c0';g.beginPath();g.arc(px,px===0?-3.9:-2.7,0.55,0,TAU);g.fill();}
    g.restore();
    g.restore();
    /* ближняя ручка с волшебной палочкой */
    const ar=wu>0?-1.2*wu:Math.sin(t*2.2)*0.1,wx=9.4,wy=-5.6-wu*3;
    lmMeadowArm(g,1.8,-1.6,wx,wy+2,2.3,1.4,'#ffd0e4',1.8);
    g.fillStyle='#ffe8f2';g.beginPath();g.arc(wx,wy+2,1.2,0,TAU);g.fill();
    g.save();g.translate(wx,wy+2);g.rotate(0.42+ar*0.2);
    g.strokeStyle='#e0a840';g.lineWidth=0.9;g.lineCap='round';g.beginPath();g.moveTo(0,2.4);g.lineTo(0,-9);g.stroke();
    g.strokeStyle='#fff0b0';g.lineWidth=0.35;g.beginPath();g.moveTo(-0.2,2);g.lineTo(-0.2,-8.6);g.stroke();
    mobGlow(g,0,-11.2,6+wu*5,'#fff0a0',0.5+wu*0.4);
    lmMeadowStar(g,0,-11.2,3.4+wu*1.4,'#ffd460');lmMeadowStar(g,0,-11.2,1.8+wu*0.8,'#fffbe0');
    g.restore();
    /* искорки */
    const tw=(i)=>0.4+0.6*Math.abs(Math.sin(t*2.2+i*1.9));
    lmMeadowStar(g,-14,-16,1.8,'#fff0a0',tw(0));lmMeadowStar(g,16,-1,1.4,'#fff0f8',tw(1));lmMeadowStar(g,-17,6,1.2,'#d8f4ff',tw(2));
    /* контурный свет */
    lmRim(g,q=>{q.strokeStyle='rgba(255,236,255,.38)';q.lineWidth=0.8;q.beginPath();q.ellipse(hx,hy+hb,5.5,5.1,0,Math.PI*1.1,Math.PI*1.6);q.stroke();q.beginPath();q.ellipse(0.2,-3,4.8,4.2,0,Math.PI*1.1,Math.PI*1.5);q.stroke();});
  }else{
    lmMeadowMothT(g,m,t,st,k,wu,dive,nearA,sc,fl);
  }
  g.restore();
  if(wu>0&&!T)mobGlow(g,5,-4,12+k*8,'#ffe0f0',0.4*k);
};

/* Истина: моль с лицами и глазами на рваных крыльях */
const lmMeadowFO=[[0,0.5],[1.4,-8],[5,-13.6],[9.6,-17.8],[12.6,-18.6],[14,-15.4],[16.4,-20.8],[19.4,-21.6],[23,-18.2],[20.8,-15],[24.6,-13.8],[22,-10.6],[25.4,-8],[23.4,-4.8],[20,-5.4],[22.6,-1.6],[18,-0.6],[17,-3.2],[14.2,1],[11.2,2.2],[12.2,5.6],[8.8,3.2],[6.4,6.2],[4.6,2.8],[2,2.6]];
const lmMeadowHI=[[0,1.2],[6,-0.6],[12,0.4],[15.8,3.4],[14.6,6.6],[17.8,9.4],[14.2,10.4],[15,14.6],[11.2,12.8],[10.2,18],[7.8,14],[5.6,19.8],[3.8,14.2],[1.6,15.4],[0.4,11.2],[-0.4,7.6]];
function lmMeadowWingT(g,m,hind,far,k,eyeOpen){
  const pts=hind?lmMeadowHI:lmMeadowFO,dk=far?-0.42:0;
  const P=()=>{g.beginPath();lmMeadowSmooth(g,pts);
    if(hind){lmMeadowSmooth(g,[[8,5.6],[10.4,4.6],[11.2,7.2],[9.4,9],[7.6,8]]);}
    else{lmMeadowSmooth(g,[[7.4,-5.6],[9.6,-6.2],[10,-3.6],[8,-3.2]]);}};
  /* сплошное тело крыла: тёмный корень, средний слив, светлее к краю (без прозрачности) */
  P();const gr=g.createLinearGradient(0,0,hind?14:24,hind?10:-12);gr.addColorStop(0,shadeHex('#140e18',dk));gr.addColorStop(0.4,shadeHex('#382c40',dk));gr.addColorStop(1,shadeHex('#625268',dk));
  g.fillStyle=gr;g.fill('evenodd');
  g.save();P();g.clip('evenodd');
  /* свет сверху (у переднего края) и тень у корня */
  const tg=g.createLinearGradient(0,hind?0:-21,0,hind?18:2);tg.addColorStop(0,far?'rgba(170,150,176,.22)':'rgba(206,186,212,.3)');tg.addColorStop(0.45,'rgba(206,186,212,0)');tg.addColorStop(1,'rgba(8,4,10,.34)');g.fillStyle=tg;g.fillRect(-3,-24,30,44);
  const rg=g.createRadialGradient(0,0.5,0,0,0.5,hind?11:15);rg.addColorStop(0,'rgba(8,4,10,.85)');rg.addColorStop(1,'rgba(8,4,10,0)');g.fillStyle=rg;g.fillRect(-3,-24,30,40);
  /* выцветшие остатки Иллюзии: два тусклых пятна на крыло, без колец */
  const sp=hind?[[11.6,11.4,2.2,'#7a4a64']]:[[19.2,-8.4,2.2,'#7a4a64'],[14.8,-16.6,1.5,'#46627c']];
  for(const [x,y,r,c] of sp){g.fillStyle=shadeHex(c,dk);g.beginPath();g.arc(x,y,r,0,TAU);g.fill();g.fillStyle='rgba(255,220,235,.22)';g.beginPath();g.arc(x-r*0.3,y-r*0.35,r*0.45,0,TAU);g.fill();}
  /* жилы: толстые тёмные, с тонким бликом */
  const vs=hind?[[16,5],[13,12],[7,16]]:[[17.6,-20],[24,-10],[21,-3],[9,-14]];
  g.lineCap='round';g.strokeStyle='rgba(10,5,12,.9)';g.lineWidth=0.95;for(const [x,y] of vs){g.beginPath();g.moveTo(0.4,0.2);g.quadraticCurveTo(x*0.55,y*0.35-1,x,y);g.stroke();}
  g.strokeStyle='rgba(190,170,196,.3)';g.lineWidth=0.3;for(const [x,y] of vs){g.beginPath();g.moveTo(0.4,-0.4);g.quadraticCurveTo(x*0.55,y*0.35-1.6,x,y-0.6);g.stroke();}
  /* гнилая кромка: кровяно-сливовая по заднему краю, светлая — по переднему */
  P();g.strokeStyle='rgba(96,16,38,.62)';g.lineWidth=2.3;g.stroke();
  const eg=g.createLinearGradient(0,hind?0:-21,0,hind?18:4);eg.addColorStop(0,far?'rgba(176,156,182,.5)':'rgba(214,196,220,.8)');eg.addColorStop(0.5,'rgba(190,170,196,0)');
  P();g.strokeStyle=eg;g.lineWidth=1.8;g.stroke();
  g.restore();
  P();g.strokeStyle='rgba(8,3,10,.95)';g.lineWidth=0.85;g.lineJoin='round';g.stroke();
  /* глаза в крыльях: красные, светятся и в покое */
  const gl=0.34+k*0.6;
  if(hind)lmMeadowAlmond(g,m,11.2,13,2.7,1.8,eyeOpen*0.9,gl,-0.5);
  else lmMeadowAlmond(g,m,13.8,-9.6,4.4,3.1,eyeOpen,gl+0.1,-0.35);
}
/* тонкая бледная рука с узловатыми суставами и длинными пальцами (тёмный контур под светлой костью) */
function lmMeadowBoneArm(g,x0,y0,x1,y1,l1,l2,back,w,col,fing,t){
  const e=lmMeadowLimb2(g,x0,y0,x1,y1,l1,l2,back,w,col,'#08040a');
  const a=Math.atan2(y1-e[3],x1-e[2]);g.lineCap='round';
  for(const pass of [0,1]){g.strokeStyle=pass?shadeHex(col,0.12):'#08040a';g.lineWidth=pass?0.55:1.25;
    for(let q=-1;q<=1;q++){const aa=a+q*0.34+Math.sin(t*2.4+q)*0.06;g.beginPath();g.moveTo(e[0],e[1]);const mx=e[0]+Math.cos(aa)*fing*0.55,my=e[1]+Math.sin(aa)*fing*0.55;g.quadraticCurveTo(mx,my+0.5,e[0]+Math.cos(aa+0.25)*fing,e[1]+Math.sin(aa+0.25)*fing+0.8);g.stroke();}}
  return e;
}
function lmMeadowLimb2(g,hx,hy,fx,fy,l1,l2,back,w,col,sh){sh=sh||'#2a2030';
  const dx=fx-hx,dy=fy-hy,d=Math.min(l1+l2-0.01,Math.hypot(dx,dy)),a=Math.atan2(dy,dx);
  const c=Math.acos(clamp((l1*l1+d*d-l2*l2)/(2*l1*d),-1,1)),ka=a+(back?c:-c),kx=hx+Math.cos(ka)*l1,ky=hy+Math.sin(ka)*l1,ex=hx+Math.cos(a)*d,ey=hy+Math.sin(a)*d;
  const seg=(x0,y0,x1,y1,wa,wb)=>{const an=Math.atan2(y1-y0,x1-x0),nx=-Math.sin(an),ny=Math.cos(an);g.beginPath();g.moveTo(x0+nx*wa/2,y0+ny*wa/2);g.lineTo(x1+nx*wb/2,y1+ny*wb/2);g.lineTo(x1-nx*wb/2,y1-ny*wb/2);g.lineTo(x0-nx*wa/2,y0-ny*wa/2);g.closePath();lmMeadowSoft(g,col,(x0+x1)/2-nx,(y0+y1)/2-ny,Math.hypot(x1-x0,y1-y0)*0.7,sh);};
  seg(hx,hy,kx,ky,w,w*0.7);seg(kx,ky,ex,ey,w*0.7,w*0.5);
  g.beginPath();g.arc(kx,ky,w*0.55,0,TAU);lmMeadowSoft(g,shadeHex(col,0.08),kx,ky,w*0.6,sh);
  return [ex,ey,kx,ky];
}
/* нога моли: тёмный контур, плотный сегмент, блик сверху и крючок-коготь */
function lmMeadowSpLeg(g,x0,y0,x1,y1,l1,l2,w,col,hi,far){
  g.save();
  lmLeg(g,x0,y0,x1,y1,l1,l2,false,w+0.9,'#08040a',null);
  const e=lmLeg(g,x0,y0,x1,y1,l1,l2,false,w,col,null);
  if(!far){g.globalAlpha=0.9;lmLeg(g,x0-0.2,y0-0.3,x1-0.2,y1-0.3,l1,l2,false,w*0.26,hi,null);g.globalAlpha=1;}
  /* коготь: два крючка */
  g.lineCap='round';for(const [c,wd] of [['#08040a',1.3],[far?col:hi,0.6]]){g.strokeStyle=c;g.lineWidth=wd;for(const q of [-1,1]){g.beginPath();g.moveTo(e[0],e[1]);g.quadraticCurveTo(e[0]+q*1.2,e[1]+1.2,e[0]+q*1.5,e[1]+2.6);g.stroke();}}
  g.restore();return e;
}
function lmMeadowMothT(g,m,t,st,k,wu,dive,nearA,sc,fl){
  const hx=1.8,hy=-10.8,open=wu>0?1:0.55+Math.max(0,Math.sin(t*0.9+m.phase))*0.1;
  /* дальние крылья */
  for(const hind of [1,0]){g.save();g.translate(2.2,-3.2+(hind?1.6:0));g.scale(0.84*sc*lmMeadowWS,0.86*sc*lmMeadowWS);g.rotate(nearA*(hind?0.75:1)+(hind?0.5:0.18));lmMeadowWingT(g,m,hind,true,wu,open);g.restore();}
  /* перистые усики: плотнее и светлее фона */
  for(const [sx,sd] of [[-0.6,-1],[3.1,1]]){const sw=Math.sin(t*2.1+sd)*1.2+wu*Math.sin(t*22)*0.6,ex=sx+sd*5.6+sw,ey=hy-15.6;
    for(const [c,wd] of [['#08040a',1.5],['#7a6a80',0.75]]){g.strokeStyle=c;g.lineWidth=wd;g.lineCap='round';g.beginPath();g.moveTo(sx,hy-4.6);g.quadraticCurveTo(sx+sd*1.4+sw*0.5,hy-10.4,ex,ey);g.stroke();}
    g.strokeStyle='#6a5a70';g.lineWidth=0.5;for(let i=1;i<6;i++){const u=i/6,bx=sx+(ex-sx)*u+sd*(0.6-u)*0.4,by=hy-4.6+(ey-hy+4.6)*u,bl=2.8*(1-u*0.55);g.beginPath();g.moveTo(bx,by);g.lineTo(bx-sd*bl*0.9,by-bl*0.5);g.moveTo(bx,by);g.lineTo(bx+sd*bl*0.9,by-bl*0.1);g.stroke();}}
  /* ближние крылья */
  for(const hind of [1,0]){g.save();g.translate(-2,-3.2+(hind?1.6:0));g.scale(-sc*lmMeadowWS,sc*lmMeadowWS);g.rotate(nearA*(hind?0.75:1)+(hind?0.5:0));lmMeadowWingT(g,m,hind,false,wu,open);g.restore();}
  /* ноги: четыре плотные, дальние темнее; в замахе поджаты */
  const reach=dive?1:0,tuck=wu*0.28;
  for(const [x0,dx,dy,far] of [[-2.4,-7,14.6,1],[-0.6,-2.4,16.6,1],[1.4,3,16.4,0],[2.6,6.4,13.6,0]]){
    const sway=Math.sin(t*3+x0*2)*0.9+(reach?5:0)*(x0>0?1:0);
    lmMeadowSpLeg(g,x0,6,x0+dx*(reach?0.5:1)*(1-tuck)+sway,6+(dy-6-(reach?4:0))*(1-tuck*0.9),6.2,8.4,far?1.1:1.3,far?'#2e2834':'#524a58','#a89aae',far);}
  /* брюшко: вздутое, чёрное, с кольцами-рёбрами и клочьями шерсти */
  lmFluff(g,-0.6,6.6,3.8,7.6,10,0.14,2.2,0.1);mobPath(g,'#272230',-1.6,3,8);
  g.save();g.clip();
  for(let i=0;i<6;i++){const y0=0.6+i*2.3;g.strokeStyle='rgba(6,3,8,.7)';g.lineWidth=0.9;g.beginPath();g.moveTo(-5,y0+0.5);g.quadraticCurveTo(-0.6,y0+2.3,4,y0+0.5);g.stroke();
    g.strokeStyle='rgba(170,156,176,.55)';g.lineWidth=0.5;g.beginPath();g.moveTo(-5,y0);g.quadraticCurveTo(-0.6,y0+1.8,4,y0);g.stroke();}
  g.fillStyle='rgba(6,4,8,.45)';g.beginPath();g.ellipse(2,8,2.6,8,0,0,TAU);g.fill();
  g.restore();
  /* грудь: косматый ком; клок розового пуха на плече — остаток принцессы */
  lmFluff(g,0.2,-3,5.2,4.6,10,0.3,3.1);mobPath(g,'#2e2936',-1,-5,5.6);
  lmFur(g,[[-3,-5.4,-1,-1],[0,-7,0.3,-1.5],[3,-5.8,1.2,-1],[-3.8,-1.6,-1.3,0.5],[3.6,-1.2,1.3,0.7]],'rgba(170,158,178,.6)',0.55);
  g.fillStyle='#c0789c';lmFluff(g,-2.4,-3.2,2.1,1.7,6,0.4,7.5);g.fill();g.strokeStyle='#4a1a34';g.lineWidth=0.45;g.stroke();lmFur(g,[[-3.4,-3.6,-0.8,1.2],[-2,-2.4,-0.2,1.5],[-1,-3.8,0.6,0.8]],'rgba(255,200,226,.85)',0.5);
  /* длинные тонкие бледные руки */
  lmMeadowBoneArm(g,-1.8,-2.6,-7.8,5+Math.sin(t*2)*1,4.6,5.2,true,1.6,'#5e5864',2.6,t);
  const ax=9.6+(dive?5:0)+wu*1.6,ay=2.2+Math.sin(t*2.3)*1.2-(dive?2:0)-wu*3.6;
  lmMeadowBoneArm(g,2.2,-2.4,ax,ay,5.6,5.8,false,1.9,'#c4bcbc',3.4,t);
  /* голова: бледное вытянутое лицо в шерстяном капюшоне */
  const hb=Math.sin(t*1.9)*0.3;g.save();g.translate(0,hb);
  lmFluff(g,hx-0.3,hy-0.2,6.2,6.4,11,0.2,9.5);mobPath(g,'#201c26',hx-1,hy-3,7);
  g.beginPath();g.ellipse(hx+0.6,hy+0.4,4.4,5.4,0.05,0,TAU);mobPath(g,'#dad4d0',hx-0.6,hy-2.4,5.6);
  g.save();g.clip();g.fillStyle='rgba(60,50,70,.3)';g.beginPath();g.ellipse(hx+3.6,hy+3,3.4,5.6,0,0,TAU);g.fill();
  g.fillStyle='rgba(70,56,76,.5)';g.beginPath();g.ellipse(hx+0.6,hy-3.6,4.8,1.3,0,0,TAU);g.fill();g.restore();
  /* третий глаз на лбу и два сонных глаза с мешками */
  const eo=wu>0?1:0.62;
  lmMeadowAlmond(g,m,hx+0.7,hy-3.2,0.9,1.4,wu>0?1:0.75,0.5+wu*0.5,Math.PI/2);
  for(const [ex,ey,rx,ry] of [[hx-1.4,hy-0.2,1.8,1.2],[hx+3.4,hy-0.1,1.4,1.0]])lmMeadowAlmond(g,m,ex,ey,rx,ry,eo,0.25+wu*0.6,0);
  /* нос-щели, зашитый рот: стежки; в замахе рот разрывается и оскаливается */
  g.fillStyle='rgba(30,20,30,.7)';g.fillRect(hx+1.7,hy+1.8,0.5,0.8);g.fillRect(hx+3,hy+1.8,0.5,0.8);
  const my=hy+3.8;
  if(wu>0.1){const o=wu*1.9;g.fillStyle='#2a0610';g.beginPath();g.moveTo(hx-0.6,my);g.quadraticCurveTo(hx+2.2,my-0.8-o,hx+5,my);g.quadraticCurveTo(hx+2.2,my+0.8+o*1.6,hx-0.6,my);g.closePath();g.fill();
    g.save();g.clip();lmTeeth(g,hx-0.6,my-0.2-o*0.2,hx+5,6,1+o*0.5,'#e8e0d0',true);lmTeeth(g,hx-0.2,my+0.2+o*0.6,hx+4.6,5,1+o*0.4,'#e8e0d0',false);g.restore();
    g.strokeStyle='#1a0a10';g.lineWidth=0.4;g.beginPath();g.moveTo(hx-0.6,my);g.lineTo(hx-1.8,my-0.8);g.moveTo(hx+5,my);g.lineTo(hx+6.2,my-0.8);g.stroke();}
  else{g.strokeStyle='#1a1018';g.lineWidth=0.6;g.beginPath();g.moveTo(hx-0.2,my);g.quadraticCurveTo(hx+2.4,my+0.5,hx+4.8,my-0.1);g.stroke();
    g.lineWidth=0.45;for(let i=0;i<5;i++){const sx=hx+i*1.1;g.beginPath();g.moveTo(sx,my-0.9);g.lineTo(sx+0.3,my+0.9);g.stroke();}
    g.strokeStyle='#a01a28';g.lineWidth=0.45;g.beginPath();g.moveTo(hx+1.4,my+0.9);g.lineTo(hx+1.6,my+2.8);g.stroke();}
  g.restore();
  /* кривая ржавая корона принцессы, на боку */
  g.save();g.translate(hx-2.6,hy-6.8);g.rotate(-0.5);
  g.beginPath();g.moveTo(-3.6,0.8);g.lineTo(-4,-2);g.lineTo(-2,-0.8);g.lineTo(-0.4,-3.6);g.lineTo(1,-0.6);g.lineTo(2.4,-1.6);g.lineTo(3.6,0.8);g.closePath();mobPath(g,'#8a7438',0,-1,4.4);
  g.fillStyle='rgba(60,100,70,.5)';g.fillRect(-3.2,0,2,0.6);g.fillRect(1,-0.4,1.6,0.6);
  g.fillStyle='#3a0a10';g.beginPath();g.arc(-0.2,-0.2,0.6,0,TAU);g.fill();g.restore();
  g.restore();
  /* контурный свет: голова, грудь, верх крыльев */
  lmRim(g,q=>{q.strokeStyle='rgba(230,220,236,.4)';q.lineWidth=0.8;q.beginPath();q.ellipse(hx,hy+hb,6.2,6.4,0,Math.PI*1.1,Math.PI*1.6);q.stroke();q.beginPath();q.ellipse(0.2,-3,5,4.5,0,Math.PI*1.1,Math.PI*1.5);q.stroke();q.beginPath();q.ellipse(-0.6,6.4,3.3,7.2,0.1,Math.PI*0.95,Math.PI*1.3);q.stroke();});
  if(wu>0){/* пыльца изо рта: мелкие бледно-жёлтые крупинки */
    for(let i=0;i<12;i++){const u=(t*1.4+i*0.29)%1;g.fillStyle='rgba(230,214,160,'+(0.85-u*0.6)+')';g.beginPath();g.arc(hx+5+u*10,hy+4+Math.sin(i*2+t*3)*2.6*u,0.5+u*0.9,0,TAU);g.fill();}
    mobGlow(g,hx+5,hy+3,8+k*5,'#d8c890',0.3*k);}
}

/* ---- Ромашка-глазунья ---- */
/* поза: наклон головы, приседание, удар — общие для обоих обликов */
function lmMeadowDaisyPose(m,t,st,k){
  const walk=Math.abs(m.vx)>6,root=st==='root'?k:0,seed=st==='seed'?k:0,hit=m.atkT>0?Math.sin((1-m.atkT/0.24)*Math.PI):0;
  return {walk,root,seed,hit,sw:walk?Math.sin(m.anim*9):0,lean:root*2.4-seed*2+hit*3.2,drop:root*2.4+hit*1.2-seed*0.4,idle:Math.sin(t*1.6+m.phase)};
}
/* лист-рука: остроконечный лист со средней жилкой; ang — угол от +x вниз */
function lmMeadowLeaf(g,x,y,ang,L,W,col,vein){
  g.save();g.translate(x,y);g.rotate(ang);
  g.beginPath();g.moveTo(0,0);g.bezierCurveTo(L*0.2,-W*1.1,L*0.7,-W*1.0,L,0);g.bezierCurveTo(L*0.7,W*0.9,L*0.2,W*1.05,0,0);g.closePath();
  lmMeadowSoft(g,col,L*0.4,-W*0.5,L*0.7,'#0e4a2a');
  g.strokeStyle=vein;g.lineWidth=0.45;g.lineCap='round';g.beginPath();g.moveTo(0.4,0);g.lineTo(L*0.95,0);g.stroke();
  g.lineWidth=0.3;for(let i=1;i<4;i++){const u=i*L*0.22;g.beginPath();g.moveTo(u,0);g.lineTo(u+L*0.14,-W*0.55);g.moveTo(u,0);g.lineTo(u+L*0.14,W*0.5);g.stroke();}
  g.restore();
}
/* ступня-листик у стебля-ноги */
function lmMeadowFoot(g,x,y,col,len){
  g.beginPath();g.moveTo(x-1.6,y-1.2);g.bezierCurveTo(x,y-2.6,x+len*0.7,y-2.2,x+len,y-0.2);g.bezierCurveTo(x+len*0.6,y+0.9,x,y+0.8,x-1.6,y-0.2);g.closePath();
  lmMeadowSoft(g,col,x+len*0.3,y-1.4,len*0.8,'#0e3a1e');
}
/* стебель: сужающийся многоугольник вдоль кривой */
function lmMeadowStem(g,x0,y0,cx,cy,x1,y1,w0,w1,col,sh){
  const L=[],R=[];for(let i=0;i<=8;i++){const u=i/8,x=(1-u)*(1-u)*x0+2*u*(1-u)*cx+u*u*x1,y=(1-u)*(1-u)*y0+2*u*(1-u)*cy+u*u*y1,
    tx=2*(1-u)*(cx-x0)+2*u*(x1-cx),ty=2*(1-u)*(cy-y0)+2*u*(y1-cy),l=Math.hypot(tx,ty)||1,w=(w0+(w1-w0)*u)/2;L.push([x-ty/l*w,y+tx/l*w]);R.push([x+ty/l*w,y-tx/l*w]);}
  g.beginPath();g.moveTo(L[0][0],L[0][1]);for(const q of L)g.lineTo(q[0],q[1]);for(let i=R.length-1;i>=0;i--)g.lineTo(R[i][0],R[i][1]);g.closePath();
  lmMeadowSoft(g,col,(x0+x1)/2-1,(y0+y1)/2,Math.abs(y0-y1)*0.7,sh);
  return {L,R};
}
/* венчик лепестков одним контуром: n лепестков, длина L, ширина w */
function lmMeadowPetals(g,cx,cy,n,rot,r0,L,w,wob,t,droop){
  g.beginPath();
  for(let i=0;i<n;i++){const a=rot+i/n*TAU,ln=L*(1+0.06*Math.sin(i*2.7)+0.03*Math.sin(t*2+i)),aw=a+0.04*Math.sin(t*1.7+i*1.3)*wob;
    g.save();g.translate(cx,cy);g.rotate(aw);
    g.moveTo(r0,-w*0.4);g.bezierCurveTo(ln*0.35,-w*1.12,ln*0.9,-w*0.95,ln,-w*0.12);g.quadraticCurveTo(ln*1.03,0,ln,w*0.12);g.bezierCurveTo(ln*0.9,w*0.95,ln*0.35,w*1.12,r0,w*0.4);g.closePath();g.restore();}
}
LM_MODEL.ldaisy=function(g,m,FY,t,T,st,k,wv,ph){
  const P=lmMeadowDaisyPose(m,t,st,k);
  if(!T)lmMeadowDaisyI(g,m,FY,t,st,k,P);else lmMeadowDaisyT(g,m,FY,t,st,k,P);
};
function lmMeadowDaisyI(g,m,FY,t,st,k,P){
  const G1='#58b840',GD='#2e7a30',GL='#8ae060',hx=1.2+P.lean,hy=FY-28.4+P.drop,sw=P.sw;
  const hipY=FY-10.6-P.root*1.2;
  /* дальняя нога и дальняя рука-лист (темнее, позади) */
  {const s=lmStep(m,Math.PI,3.6),fx=-1.2+s[0]+P.lean*0.2,fy=FY-0.8+s[1];
   const e=lmMeadowLimb2(g,-1.6,hipY,fx,fy,5.9,5.9,false,1.8,shadeHex(G1,-0.3),'#0a3018');lmMeadowFoot(g,e[0],e[1],shadeHex(GD,-0.1),4);}
  lmMeadowLeaf(g,-0.6,FY-18.2,P.root?Math.PI-1.1:(Math.PI-0.6+sw*0.4+P.idle*0.08),9,3.4,shadeHex(G1,-0.32),'rgba(255,255,255,.3)');
  /* стебель */
  const nx=hx-0.4,ny=hy+7.8;
  lmMeadowStem(g,0,hipY+0.6,sw*0.9-0.6+P.lean*0.2,(hipY+ny)/2,nx,ny,3.8,3,G1,'#0e4a22');
  /* листик-юбка на стебле и светлая жилка */
  g.strokeStyle='rgba(190,255,150,.55)';g.lineWidth=0.5;g.lineCap='round';g.beginPath();g.moveTo(-0.9,hipY-0.4);g.quadraticCurveTo(sw*0.8-1.4,(hipY+ny)/2,nx-1,ny+0.6);g.stroke();
  /* ближняя нога */
  {const s=lmStep(m,0,3.6),fx=3.4+s[0]+P.lean*0.2,fy=FY-0.8+s[1];
   const e=lmMeadowLimb2(g,2,hipY,fx,fy,5.9,5.9,false,2,G1,'#0a3018');lmMeadowFoot(g,e[0],e[1],GD,4.6);
   if(P.root>0){/* корни прорастают из ступней в землю */
     g.strokeStyle='#6aa83a';g.lineWidth=0.8;g.lineCap='round';for(const [sx,dir] of [[e[0]-0.4,-1],[e[0]+1.6,1],[e[0]+3.4,1.4],[-1.4,-1.2]]){g.beginPath();g.moveTo(sx,FY-0.2);g.quadraticCurveTo(sx+dir*2*P.root,FY+2.6*P.root,sx+dir*4.4*P.root,FY+3.4*P.root);g.stroke();}}}
  /* ближняя рука-лист: качается, замахивается на «seed», бьёт при ударе */
  const nearArm=()=>{const aN=P.seed>0?0.6-P.seed*1.5:P.hit>0?0.6-P.hit*0.9:P.root>0?1.1+Math.sin(t*30)*0.05:0.6-sw*0.4+P.idle*0.07;
  lmMeadowLeaf(g,0.8,FY-18.2,aN,10,3.8,G1,'rgba(255,255,255,.4)');
  if(P.seed>0.3){/* зёрнышко в листе */g.fillStyle='#c8a040';g.beginPath();g.ellipse(0.8+Math.cos(aN)*8.6,FY-18.2+Math.sin(aN)*8.6,1.3,0.8,aN,0,TAU);g.fill();}};
  if(!(P.seed>0))nearArm();
  /* голова-цветок */
  g.save();g.translate(hx,hy);g.rotate(P.idle*0.05+P.lean*0.05-P.seed*0.1);
  /* задний ряд лепестков — темнее, глубже */
  const gp=(c0,c1)=>{const gr=g.createRadialGradient(0,0,4,0,0,12.4);gr.addColorStop(0,c0);gr.addColorStop(0.55,c1);gr.addColorStop(1,'#fffefa');return gr;};
  lmMeadowPetals(g,0,0,10,0.24+t*0.04,3,12.2,3.9,1,t);g.fillStyle=gp('#d8b8d8','#f0dce8');g.fill();g.strokeStyle='#bc98c0';g.lineWidth=0.6;g.lineJoin='round';g.stroke();
  g.save();lmMeadowPetals(g,0,0,10,0.24+t*0.04,3,12.2,3.9,1,t);g.clip();g.fillStyle='rgba(120,70,150,.18)';g.beginPath();g.arc(0,0,11,0,TAU);g.arc(-1.4,-1.8,9.6,0,TAU,true);g.fill();g.restore();
  /* передний ряд */
  lmMeadowPetals(g,0,0,10,0.24+Math.PI/10+t*0.05,3,11.4,3.8,1.4,t+1);g.fillStyle=gp('#ecd2e8','#fff6f8');g.fill();g.strokeStyle='#cfaed0';g.lineWidth=0.6;g.stroke();
  /* прожилки лепестков и блики */
  g.strokeStyle='rgba(205,170,200,.7)';g.lineWidth=0.35;for(let i=0;i<10;i++){const a=0.24+Math.PI/10+t*0.05+i/10*TAU;g.beginPath();g.moveTo(Math.cos(a)*6.4,Math.sin(a)*6.4);g.lineTo(Math.cos(a)*10,Math.sin(a)*10);g.stroke();}
  g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=0.7;g.lineCap='round';for(let i=0;i<10;i++){const a=0.24+Math.PI/10+t*0.05+i/10*TAU;if(Math.sin(a)<-0.2&&Math.cos(a)<0.4){g.beginPath();g.arc(0,0,9.2,a-0.2,a+0.1);g.stroke();}}
  /* лицо: жёлтый диск с ободком */
  g.beginPath();g.arc(0.6,0.2,5.9,0,TAU);mobPath(g,'#ffcf3c',-1,-2,7,true);
  g.strokeStyle='#e0902a';g.lineWidth=0.9;g.beginPath();g.arc(0.6,0.2,5.75,0,TAU);g.stroke();
  g.strokeStyle='rgba(255,245,170,.7)';g.lineWidth=0.6;g.beginPath();g.arc(0.6,0.2,4.9,Math.PI*1.05,Math.PI*1.55);g.stroke();
  g.fillStyle='rgba(200,110,30,.55)';for(let i=0;i<10;i++){const a=i/10*TAU+0.3;g.beginPath();g.arc(0.6+Math.cos(a)*5.5,0.2+Math.sin(a)*5.5,0.28,0,TAU);g.fill();}
  /* выражение */
  const fx=1.4+P.lean*0.08,bl=(Math.sin(m.anim*1.1+m.phase*7)>0.985);
  g.strokeStyle='#5a2a10';g.lineWidth=0.85;g.lineCap='round';
  if(P.root>0.1){/* сердитые щурые глаза и стиснутые зубы */
    g.beginPath();g.moveTo(fx-3.8,-2.6);g.lineTo(fx-1.2,-1.2);g.moveTo(fx+4.2,-2.6);g.lineTo(fx+1.8,-1.2);g.stroke();
    g.fillStyle='#3a1608';g.beginPath();g.arc(fx-2.3,-0.6,0.9,0,TAU);g.arc(fx+2.7,-0.6,0.9,0,TAU);g.fill();
    g.fillStyle='#fff7e8';g.fillRect(fx-1.9,2,4.2,1.7);g.strokeStyle='#5a2a10';g.lineWidth=0.5;g.strokeRect(fx-1.9,2,4.2,1.7);g.beginPath();g.moveTo(fx-0.5,2);g.lineTo(fx-0.5,3.7);g.moveTo(fx+0.9,2);g.lineTo(fx+0.9,3.7);g.stroke();}
  else{
    if(bl){g.beginPath();g.moveTo(fx-3.6,-1.2);g.lineTo(fx-1,-1.2);g.moveTo(fx+1.4,-1.2);g.lineTo(fx+4,-1.2);g.stroke();}
    else if(P.hit>0.3){g.beginPath();g.moveTo(fx-3.6,-2);g.lineTo(fx-1.2,-0.8);g.lineTo(fx-3.6,0.2);g.moveTo(fx+4,-2);g.lineTo(fx+1.6,-0.8);g.lineTo(fx+4,0.2);g.stroke();}
    else{/* весёлые дуги-глаза с ресничками */
      g.beginPath();g.arc(fx-2.3,-0.4,1.7,Math.PI*1.1,Math.PI*1.9);g.moveTo(fx+1.6+0.8,-0.4);g.arc(fx+2.7,-0.4,1.7,Math.PI*1.1,Math.PI*1.9);g.stroke();
      g.lineWidth=0.4;g.beginPath();g.moveTo(fx-4.1,-1.1);g.lineTo(fx-4.9,-1.7);g.moveTo(fx+4.5,-1.1);g.lineTo(fx+5.3,-1.7);g.stroke();}
    /* рот: улыбка; на «seed» — круглый рот, плюющий семечки */
    if(P.seed>0.1){g.fillStyle='#6a2010';g.beginPath();g.ellipse(fx+0.4,2.6,1.5+P.seed*0.7,1.3+P.seed*1.4,0,0,TAU);g.fill();g.strokeStyle='#5a2a10';g.lineWidth=0.5;g.stroke();}
    else{g.fillStyle='#7a2a14';g.beginPath();g.moveTo(fx-2.8,1.2);g.quadraticCurveTo(fx+0.4,2,fx+3.6,1.2);g.quadraticCurveTo(fx+3,4.8,fx+0.4,4.9);g.quadraticCurveTo(fx-2.2,4.8,fx-2.8,1.2);g.closePath();g.fill();
      g.save();g.clip();g.fillStyle='#ff8a8a';g.beginPath();g.ellipse(fx+0.5,4.9,2,1.3,0,0,TAU);g.fill();g.fillStyle='#fff7e8';g.fillRect(fx-2.8,0.9,6.8,1.1);g.restore();
      g.strokeStyle='#5a2a10';g.lineWidth=0.5;g.beginPath();g.moveTo(fx-2.8,1.2);g.quadraticCurveTo(fx+0.4,2,fx+3.6,1.2);g.stroke();}
  }
  g.fillStyle='rgba(255,110,90,.5)';g.beginPath();g.ellipse(fx-4,1.6,1.4,0.9,0,0,TAU);g.fill();g.beginPath();g.ellipse(fx+5,1.6,1.3,0.9,0,0,TAU);g.fill();
  g.restore();
  if(P.seed>0)nearArm();
  /* пыльца вокруг; в «root» — зелёные искры из земли */
  g.fillStyle='rgba(255,230,120,.85)';for(let i=0;i<3;i++){const u=(t*0.5+i/3)%1;g.beginPath();g.arc(hx-8+Math.sin(i*3+t)*4+i*6,hy-11-u*5,0.5+0.4*Math.sin(u*Math.PI),0,TAU);g.fill();}
  lmRim(g,q=>{q.strokeStyle='rgba(255,255,255,.4)';q.lineWidth=0.8;q.beginPath();q.arc(hx,hy,10.2,Math.PI*1.1,Math.PI*1.62);q.stroke();});
  if(P.root>0)mobGlow(g,1,FY,10+P.root*8,'#9aff6a',0.4*P.root);
}
/* когтистые пальцы-корешки: n кривых загнутых когтей от точки x,y по направлению ang */
function lmMeadowTwigClaws(g,x,y,ang,n,len,col,t,spread){
  g.strokeStyle=col;g.lineCap='round';g.lineJoin='round';
  for(let i=0;i<n;i++){const u=n===1?0:(i/(n-1)-0.5),a=ang+u*(spread||1.5)+Math.sin(t*3+i*1.4)*0.05,l=len*(1-Math.abs(u)*0.3),cx=Math.cos(a),cy=Math.sin(a);
    g.lineWidth=0.95;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+cx*l*0.6-cy*0.8*u*2,y+cy*l*0.6+cx*0.8*u*2,x+cx*l+cy*0.5,y+cy*l-cx*0.5+0.6);g.stroke();
    g.fillStyle=shadeHex(col,0.25);g.beginPath();g.arc(x+cx*l*0.45,y+cy*l*0.45,0.5,0,TAU);g.fill();}
}
/* шип: треугольник от точки по направлению */
function lmMeadowThorn(g,x,y,ang,l,w,col){g.fillStyle=col;g.beginPath();g.moveTo(x-Math.sin(ang)*w,y+Math.cos(ang)*w);g.lineTo(x+Math.cos(ang)*l,y+Math.sin(ang)*l);g.lineTo(x+Math.sin(ang)*w,y-Math.cos(ang)*w);g.closePath();g.fill();}
/* рваный увядший лепесток: ширина w, провис bend, зазубрины от seed */
function lmMeadowPetalsT(g,cx,cy,n,rot,r0,L,w,sag,seed,flare,flt){
  g.beginPath();
  for(let i=0;i<n;i++){if(flt&&!flt(i))continue;const a=rot+i/n*TAU,r=Math.abs(Math.sin(seed+i*12.9)),ln=L*(0.7+0.38*r)*(1+flare*0.12),bend=sag*Math.cos(a)*(ln/10)+Math.sin(seed*3+i*2.1)*0.8,j=(r-0.5)*1.6;
    g.save();g.translate(cx,cy);g.rotate(a);
    g.moveTo(r0,-w*0.45);g.bezierCurveTo(ln*0.35,-w*1.1,ln*0.8,-w*0.95+bend*0.4,ln*0.93,-w*0.5+bend*0.9);
    g.lineTo(ln*1.0,-w*0.22+bend);g.lineTo(ln*0.88+j,bend*1.05);g.lineTo(ln*1.04,w*0.2+bend);g.lineTo(ln*0.91,w*0.5+bend*0.9);
    g.bezierCurveTo(ln*0.8,w*0.95+bend*0.4,ln*0.35,w*1.1,r0,w*0.45);g.closePath();g.restore();}
}
/* огромный налитый глаз: белок с жилками, радужка, щель зрачка, тяжёлое веко */
function lmMeadowBigEye(g,m,x,y,r,P,t){
  const bl=(Math.sin(m.anim*1.1+m.phase*7)>0.988)?0.15:1,op=P.root>0?0.96:0.72*(P.hit>0.3?0.35:1)*bl+0.08;
  g.save();g.translate(x,y);
  if(P.root>0)mobGlow(g,0,0,r*2.8,'#ff2a2a',0.6*P.root);
  /* яблоко с объёмом */
  g.beginPath();g.arc(0,0,r,0,TAU);
  const gr=g.createRadialGradient(-r*0.35,-r*0.4,r*0.1,0,0,r*1.05);gr.addColorStop(0,'#fbf2e2');gr.addColorStop(0.55,'#e4d0b8');gr.addColorStop(0.85,'#b88c78');gr.addColorStop(1,'#6a3030');g.fillStyle=gr;g.fill();
  g.save();g.clip();
  const lx=(m.lookX||0)*m.facing*r*0.32,ly=(m.lookY||0)*r*0.28;
  /* жилки сходятся к радужке */
  g.strokeStyle='rgba(170,16,28,.8)';g.lineWidth=0.4;
  for(let i=0;i<11;i++){const a=i/11*TAU+0.3,x0=Math.cos(a)*r*1.05,y0=Math.sin(a)*r*1.05,x1=lx+Math.cos(a+0.2)*r*0.5,y1=ly+Math.sin(a+0.2)*r*0.5;
    g.beginPath();g.moveTo(x0,y0);g.quadraticCurveTo((x0+x1)/2+Math.sin(i*3)*1.2,(y0+y1)/2+Math.cos(i*2)*1.2,x1,y1);g.stroke();
    g.lineWidth=0.25;g.beginPath();g.moveTo((x0+x1)/2,(y0+y1)/2);g.lineTo((x0+x1)/2+Math.cos(a+1.3)*1.8,(y0+y1)/2+Math.sin(a+1.3)*1.8);g.stroke();g.lineWidth=0.4;}
  /* радужка и зрачок */
  const ir=r*0.5;const ig=g.createRadialGradient(lx-ir*0.2,ly-ir*0.2,ir*0.1,lx,ly,ir);ig.addColorStop(0,'#ffa040');ig.addColorStop(0.5,'#c63a22');ig.addColorStop(0.85,'#5a0c10');ig.addColorStop(1,'#1c0406');
  g.fillStyle=ig;g.beginPath();g.arc(lx,ly,ir,0,TAU);g.fill();
  g.strokeStyle='rgba(255,170,90,.5)';g.lineWidth=0.3;for(let i=0;i<12;i++){const a=i/12*TAU;g.beginPath();g.moveTo(lx+Math.cos(a)*ir*0.45,ly+Math.sin(a)*ir*0.45);g.lineTo(lx+Math.cos(a)*ir*0.9,ly+Math.sin(a)*ir*0.9);g.stroke();}
  g.fillStyle='#050102';g.beginPath();if(P.root>0)g.arc(lx,ly,ir*(0.55+0.2*P.root),0,TAU);else g.ellipse(lx,ly,ir*0.2,ir*0.78,0,0,TAU);g.fill();
  g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.arc(lx-ir*0.42,ly-ir*0.5,ir*0.2,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.arc(lx+ir*0.4,ly+ir*0.38,ir*0.1,0,TAU);g.fill();
  /* тяжёлое веко: тёмная мясистая складка сверху */
  const cover=(1-op)*r*0.9,yl=-r*0.25+cover*0.4,yr=-r*0.78+cover*0.4;
  g.fillStyle='#74303a';g.beginPath();g.moveTo(-r*1.2,-r*1.3);g.lineTo(r*1.2,-r*1.3);g.lineTo(r*1.2,yr-r*0.1);g.quadraticCurveTo(0,(yl+yr)/2+r*0.28,-r*1.2,yl);g.closePath();g.fill();
  g.strokeStyle='#1a0408';g.lineWidth=0.7;g.beginPath();g.moveTo(-r*1.1,yl);g.quadraticCurveTo(0,(yl+yr)/2+r*0.28,r*1.1,yr-r*0.05);g.stroke();
  g.strokeStyle='rgba(235,140,150,.4)';g.lineWidth=0.4;g.beginPath();g.moveTo(-r*0.9,yl-r*0.4);g.quadraticCurveTo(0,(yl+yr)/2-r*0.1,r*0.9,yr-r*0.4);g.stroke();
  /* ресницы-иглы по краю века */
  g.strokeStyle='#14060a';g.lineWidth=0.5;for(let i=0;i<5;i++){const u=(i+0.5)/5,x=-r*0.9+u*r*1.8,y=yl+(yr-yl)*u+Math.sin(u*Math.PI)*r*0.16;g.beginPath();g.moveTo(x,y);g.lineTo(x+0.2,y+1.6);g.stroke();}
  g.restore();
  g.strokeStyle='#2a0a10';g.lineWidth=0.7;g.beginPath();g.arc(0,0,r,0,TAU);g.stroke();
  g.strokeStyle='rgba(255,240,230,.4)';g.lineWidth=0.6;g.beginPath();g.arc(0,0,r-0.4,Math.PI*1.1,Math.PI*1.55);g.stroke();
  g.restore();
}
function lmMeadowDaisyT(g,m,FY,t,st,k,P){
  const BK='#5e4c34',BD='#2a1e12',hx=1.2+P.lean,hy=FY-28.4+P.drop,sw=P.sw,hipY=FY-10.6-P.root*1.2;
  const claw='#a89878';
  /* дальняя нога: узловатый корень */
  {const s=lmStep(m,Math.PI,3.6),fx=-2.2+s[0],fy=FY-0.8+s[1];
   const e=lmMeadowLimb2(g,-1.6,hipY,fx,fy,6,6.2,false,1.9,shadeHex(BK,-0.35),'#0a0604');lmMeadowTwigClaws(g,e[0],e[1],0.5,4,3.8,shadeHex(claw,-0.4),t,2.2);}
  /* дальняя рука: длинная, висит, когти почти у земли */
  {const tx=-7.6+sw*1.5-P.seed*2,ty=P.root>0?FY-0.8:FY-9+Math.sin(t*1.8)*0.8;
   const e=lmMeadowLimb2(g,-0.4,FY-19,tx,ty,7,7.6,true,1.6,shadeHex(BK,-0.35),'#0a0604');lmMeadowTwigClaws(g,e[0],e[1],1.5,4,4.4,shadeHex(claw,-0.4),t,1.9);
   /* остаток Иллюзии: лоскут зелёного листа, повисший на запястье */
   g.save();g.translate(e[2],e[3]);g.rotate(0.9);g.fillStyle='#4a6a30';g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(2.4,-1.8,5,0.4);g.lineTo(3.8,1);g.lineTo(4.4,2.4);g.lineTo(2,1.4);g.lineTo(1,2.2);g.closePath();g.fill();g.strokeStyle='#1c2a10';g.lineWidth=0.4;g.stroke();g.restore();}
  /* стебель: корявый, в шипах и ране-пасти */
  const nx=hx-0.4,ny=hy+7.6,cxs=sw*0.9-1.2+P.lean*0.3,cys=(hipY+ny)/2;
  const SS=lmMeadowStem(g,0,hipY+0.6,cxs,cys,nx,ny,4.2,3.4,'#4e5030','#14100a');
  g.save();g.beginPath();g.moveTo(SS.L[0][0],SS.L[0][1]);for(const q of SS.L)g.lineTo(q[0],q[1]);for(let i=SS.R.length-1;i>=0;i--)g.lineTo(SS.R[i][0],SS.R[i][1]);g.closePath();g.clip();
  g.strokeStyle='rgba(20,14,8,.7)';g.lineWidth=0.4;for(let i=0;i<5;i++){const q=SS.L[1+i];g.beginPath();g.moveTo(q[0]+0.6,q[1]);g.lineTo(q[0]+1.4+i%2,q[1]-1.6);g.moveTo(SS.R[2+i][0]-0.5,SS.R[2+i][1]);g.lineTo(SS.R[2+i][0]-1.2,SS.R[2+i][1]+1.5);g.stroke();}
  g.fillStyle='#8a1a22';g.beginPath();g.ellipse(SS.L[3][0]+1.2,SS.L[3][1],0.5,2.4,0.1,0,TAU);g.fill();g.beginPath();g.ellipse(SS.R[6][0]-1,SS.R[6][1]+0.6,0.4,1.8,0,0,TAU);g.fill();
  /* вертикальная рана-пасть с иглами зубов */
  const mp=SS.L[4],mq=SS.R[4],mxm=(mp[0]+mq[0])/2,mym=(mp[1]+mq[1])/2,open=0.55+P.root*0.4+P.hit*0.4+Math.sin(t*2.2)*0.1;
  g.fillStyle='#2a0408';g.beginPath();g.ellipse(mxm+0.3,mym,0.5+open*0.9,2.8,0.08,0,TAU);g.fill();
  g.fillStyle='#e8dcc0';for(let i=0;i<4;i++){const yy=mym-2+i*1.1;g.beginPath();g.moveTo(mxm-1.1,yy);g.lineTo(mxm-0.1,yy+0.5);g.lineTo(mxm-1.1,yy+0.9);g.fill();g.beginPath();g.moveTo(mxm+1.7,yy+0.4);g.lineTo(mxm+0.7,yy+0.9);g.lineTo(mxm+1.7,yy+1.3);g.fill();}
  g.restore();
  /* шипы по краям стебля */
  for(const [i,sd] of [[2,-1],[3,1],[5,-1],[6,1],[7,-1]]){const q=sd<0?SS.L[i]:SS.R[i];lmMeadowThorn(g,q[0],q[1],sd<0?Math.PI+0.5:-0.5,2.6,0.7,'#b8a880');}
  /* ближняя нога */
  {const s=lmStep(m,0,3.6),fx=3.6+s[0],fy=FY-0.8+s[1];
   const e=lmMeadowLimb2(g,2,hipY,fx,fy,6,6.2,false,2.2,BK,'#0a0604');lmMeadowThorn(g,e[2]-0.4,e[3]-0.6,-1.6,2.4,0.6,'#b8a880');lmMeadowTwigClaws(g,e[0],e[1],0.4,4,4.2,claw,t,2.3);
   if(P.root>0){g.strokeStyle='#4a2a1a';g.lineWidth=1.1;g.lineCap='round';for(const [sx,dir] of [[e[0]-0.4,-1],[e[0]+1.6,1],[e[0]+3.4,1.4],[-1.4,-1.2],[-3,-1.6]]){g.beginPath();g.moveTo(sx,FY-0.2);g.quadraticCurveTo(sx+dir*2*P.root,FY+2.6*P.root,sx+dir*5*P.root,FY+3.4*P.root);g.stroke();}
     mobGlow(g,e[0],FY,9+P.root*5,'#ff3a2a',0.35*P.root);}}
  /* ближняя рука: замах — вверх, удар — вперёд, корни — вонзается в землю */
  const nearArm=()=>{const tx=P.seed>0?9+P.seed*3:P.hit>0?13+P.hit*3:P.root>0?7.4:8.8+sw*1.5,ty=P.seed>0?FY-18-P.seed*10:P.hit>0?FY-16:P.root>0?FY-0.8:FY-8.4+Math.sin(t*1.9+1)*0.8;
   const e=lmMeadowLimb2(g,0.8,FY-18.4,tx,ty,7,7.6,false,1.9,BK,'#0a0604');
   lmMeadowThorn(g,e[2]+0.2,e[3]-1,-1.2,2.6,0.6,'#b8a880');lmMeadowTwigClaws(g,e[0],e[1],P.seed>0?-1.4:P.hit>0?0:1.5,5,5,claw,t,2);
   if(P.seed>0.3){g.fillStyle='#c8a040';g.beginPath();g.ellipse(e[0],e[1]-1.2,1.4,0.9,0.4,0,TAU);g.fill();}};
  if(!(P.seed>0))nearArm();
  /* голова-цветок */
  g.save();g.translate(hx,hy);g.rotate(P.idle*0.05+P.lean*0.05-P.seed*0.1);
  const fl=P.root;
  /* задний ряд: тёмные, скрюченные */
  lmMeadowPetalsT(g,0,0,10,0.3+Math.sin(t*0.6)*0.03,3,12.4,4.8,3.4,1.3,fl);
  {const gr=g.createRadialGradient(0,0,3,0,0,12);gr.addColorStop(0,'#2a0c12');gr.addColorStop(0.6,'#5a2a30');gr.addColorStop(1,'#3a181e');g.fillStyle=gr;g.fill();g.strokeStyle='#14060a';g.lineWidth=0.7;g.lineJoin='round';g.stroke();}
  /* передний ряд: мясистые, с венами; пара лепестков — грязные остатки белых */
  const fr=i=>!(i===5||i===7);
  lmMeadowPetalsT(g,0,0,9,0.3+Math.PI/9+Math.sin(t*0.6)*0.03,3,11.6,5.2,2.4,4.7,fl,fr);
  {const gr=g.createRadialGradient(0,0,3,0,0,12.4);gr.addColorStop(0,'#3a121c');gr.addColorStop(0.5,'#6a323c');gr.addColorStop(1,'#80505a');g.fillStyle=gr;g.fill();g.strokeStyle='#1c080e';g.lineWidth=0.7;g.stroke();}
  /* два лепестка — грязные остатки белых, обвисшие, в гнили */
  lmMeadowPetalsT(g,0,0,9,0.3+Math.PI/9+Math.sin(t*0.6)*0.03,3,11.6,5.2,3.6,4.7,fl,i=>i===5||i===7);
  {const gr=g.createRadialGradient(0,0,3,0,0,12.4);gr.addColorStop(0,'#5a4a3a');gr.addColorStop(0.5,'#b8aa94');gr.addColorStop(1,'#d8ccb4');g.fillStyle=gr;g.fill();g.strokeStyle='#2a1a14';g.lineWidth=0.7;g.stroke();g.save();g.clip();g.fillStyle='rgba(90,50,30,.35)';for(const [x,y,r] of [[-8,-3,2.4],[-6,6,1.8],[7,7,2]]){g.beginPath();g.arc(x,y,r,0,TAU);g.fill();}g.restore();}
  /* вены на лепестках */
  g.lineCap='round';
  for(let i=0;i<9;i++){const a=0.3+Math.PI/9+i/9*TAU+Math.sin(t*0.6)*0.03;
    g.strokeStyle='rgba(30,4,10,.7)';g.lineWidth=0.55;g.beginPath();g.moveTo(Math.cos(a)*6.4,Math.sin(a)*6.4);g.lineTo(Math.cos(a)*10.2,Math.sin(a)*10.2);g.stroke();
    g.lineWidth=0.35;for(const da of [-0.22,0.22]){g.beginPath();g.moveTo(Math.cos(a)*8,Math.sin(a)*8);g.lineTo(Math.cos(a+da)*10.2,Math.sin(a+da)*10.2);g.stroke();}
    g.strokeStyle='rgba(230,130,140,.3)';g.lineWidth=0.3;g.beginPath();g.moveTo(Math.cos(a-0.05)*6.6,Math.sin(a-0.05)*6.6);g.lineTo(Math.cos(a-0.05)*10,Math.sin(a-0.05)*10);g.stroke();}
  /* вторые и третьи глаза в основании лепестков */
  lmMeadowAlmond(g,m,-7.2,6.4,1.9,1.3,0.8,P.root*0.8,0.8);
  lmMeadowAlmond(g,m,8.2,-5,1.6,1.1,0.7,P.root*0.8,-0.7);
  /* диск-остаток улыбки: болезненно-жёлтый с трещинами и шрамом-ухмылкой на швах */
  g.beginPath();g.arc(0.5,0.1,7.6,0,TAU);mobPath(g,'#8a7430',-1.5,-2,8);
  g.save();g.clip();g.strokeStyle='rgba(40,20,6,.65)';g.lineWidth=0.4;g.beginPath();g.moveTo(-7,-3);g.lineTo(-5.2,-2.2);g.lineTo(-6,-0.4);g.moveTo(7.2,2);g.lineTo(5.6,2.6);g.lineTo(6.2,4.4);g.moveTo(-3,6.6);g.lineTo(-2,5.4);g.lineTo(-3.2,4.6);g.stroke();g.restore();
  lmMeadowBigEye(g,m,0.6+P.lean*0.1,-0.2,6.2,P,t);
  /* кровавые слёзы стекают на лепестки */
  for(const [x0,l,ph] of [[-3.4,6,0],[2.8,4.4,1.7]]){const ll=l+Math.sin(t*1.3+ph)*1.4;g.strokeStyle='#8a0c18';g.lineWidth=0.9;g.lineCap='round';g.beginPath();g.moveTo(x0,5.4);g.quadraticCurveTo(x0-0.4,5.4+ll*0.5,x0+0.2,5.4+ll);g.stroke();g.fillStyle='#b01020';g.beginPath();g.ellipse(x0+0.2,5.4+ll+0.8,0.7,1,0,0,TAU);g.fill();}
  g.restore();
  if(P.seed>0)nearArm();
  lmRim(g,q=>{q.strokeStyle='rgba(255,200,200,.25)';q.lineWidth=0.7;q.beginPath();q.arc(hx,hy,10.4,Math.PI*1.1,Math.PI*1.6);q.stroke();});
  if(P.root>0)mobGlow(g,1,FY,10+P.root*8,'#ff3a3a',0.4*P.root);
}
