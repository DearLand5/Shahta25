'use strict';
/* ============================================================
   Модели мобов Кукольного городка (Лиловые небеса): фарфоровая кукла, заводной солдатик, Чёрт из табакерки.
   Оба облика в одной функции, T — Истина; шея Чёрта в мире — lmToysJackNeck (вызов из lilLongPart в 53)
   ============================================================ */
/* плавное приближение значения к цели по времени (хранится в моба) */
function lmToysE(m,key,tgt,t,rate){
  const k1='_lt'+key,k2='_ltt'+key,o=m[k1],pt=m[k2];
  if(o===undefined||!isFinite(o)||pt===undefined||Math.abs(t-pt)>0.5){m[k1]=tgt;m[k2]=t;return tgt;}
  const dt=t-pt;if(dt<=0)return o;
  const v=o+(tgt-o)*(1-Math.exp(-rate*dt));m[k1]=v;m[k2]=t;return v;
}
/* угол, который копится от скорости: скорость плавно меняется, поэтому вращение не рвётся */
function lmToysAcc(m,key,sp,t,rate){
  const v=lmToysE(m,'v'+key,sp,t,rate),ka='_la'+key,kt='_lat'+key,pt=m[kt];
  const dt=(pt===undefined||Math.abs(t-pt)>0.5)?0:Math.max(0,t-pt);
  m[ka]=(m[ka]||0)+v*dt;m[kt]=t;return m[ka];
}
/* сужающийся сегмент с объёмом */
function lmToysTaper(g,x0,y0,x1,y1,w0,w1,c,noLine){
  const a=Math.atan2(y1-y0,x1-x0),nx=-Math.sin(a),ny=Math.cos(a);
  g.beginPath();g.moveTo(x0+nx*w0/2,y0+ny*w0/2);g.lineTo(x1+nx*w1/2,y1+ny*w1/2);g.lineTo(x1-nx*w1/2,y1-ny*w1/2);g.lineTo(x0-nx*w0/2,y0-ny*w0/2);g.closePath();
  mobPath(g,c,(x0+x1)/2-nx*w0*0.2,(y0+y1)/2-ny*w0*0.2,Math.max(1,Math.hypot(x1-x0,y1-y0)*0.55),noLine);
}
/* бант: две петли, узел, хвостики; c — основной цвет */
function lmToysBow(g,x,y,sz,c,rot,torn){
  g.save();g.translate(x,y);g.rotate(rot||0);g.scale(sz,sz);
  const lw=1.2/sz;
  /* хвостики */
  for(const sd of [-1,1]){g.beginPath();g.moveTo(0,0.4);g.quadraticCurveTo(sd*1.4,2.4,sd*2.2,4.6);g.lineTo(sd*0.9,4.1);g.lineTo(sd*0.5,5);g.quadraticCurveTo(sd*0.2,2.8,0,1.2);g.closePath();mobPath(g,shadeHex(c,-0.12),sd*1.2,3,2.6,true);}
  /* петли */
  for(const sd of [-1,1]){
    if(torn&&sd>0){g.beginPath();g.moveTo(0.3,0);g.quadraticCurveTo(2,-2.6,4.6,-2.2);g.lineTo(3.6,-0.8);g.lineTo(4.8,0.6);g.lineTo(3,1.4);g.quadraticCurveTo(1.4,2.2,0.3,0.8);g.closePath();}
    else{g.beginPath();g.moveTo(sd*0.3,0);g.bezierCurveTo(sd*1.8,-3.4,sd*5.2,-3.4,sd*5,0);g.bezierCurveTo(sd*5.2,3.2,sd*1.8,3,sd*0.3,0.8);g.closePath();}
    mobPath(g,sd<0?shadeHex(c,-0.08):c,sd*2.2-1,-1.4,4.6,true);
    g.strokeStyle=mobLine(c);g.lineWidth=lw;g.lineJoin='round';g.stroke();
    /* складки петли */
    g.strokeStyle=shadeHex(c,-0.34);g.lineWidth=0.35;g.beginPath();g.moveTo(sd*1.1,-0.2);g.quadraticCurveTo(sd*2.8,-1.7,sd*4.2,-0.4);g.moveTo(sd*1.2,0.5);g.quadraticCurveTo(sd*2.8,1.4,sd*4.2,0.7);g.stroke();
    g.strokeStyle=shadeHex(c,0.45);g.lineWidth=0.4;g.beginPath();g.moveTo(sd*1.4,-1.5);g.quadraticCurveTo(sd*2.8,-2.5,sd*4,-1.9);g.stroke();
  }
  /* узел */
  g.beginPath();g.ellipse(0,0.2,1.15,1.35,0,0,TAU);mobPath(g,shadeHex(c,0.1),-0.3,-0.4,1.5);
  g.restore();
}
/* ножницы: пивот в (px,py), угол ang, раствор op, длина лезвия L */
function lmToysScissors(g,px,py,ang,op,L,T){
  g.save();g.translate(px,py);g.rotate(ang);
  const bl=T?'#a48672':'#e4ecf6',bs=T?'#5e4232':'#8e9ab0',bh=T?'#d0b49a':'#ffffff',ring=T?'#7a3450':'#f0709e',ringL=T?'#a85a78':'#ffa6c6';
  for(const s of [-1,1]){
    g.save();g.rotate(s*op);
    /* ручка-кольцо с тенью и бликом */
    g.strokeStyle=shadeHex(ring,-0.45);g.lineWidth=1.9;g.beginPath();g.ellipse(-4.1,-s*1.3,1.8,1.4,s*0.3,0,TAU);g.stroke();
    g.strokeStyle=ring;g.lineWidth=1.3;g.beginPath();g.ellipse(-4.1,-s*1.3,1.8,1.4,s*0.3,0,TAU);g.stroke();
    g.strokeStyle=ringL;g.lineWidth=0.4;g.beginPath();g.ellipse(-4.1,-s*1.3,1.8,1.4,s*0.3,Math.PI*1.1,Math.PI*1.7);g.stroke();
    g.strokeStyle=bs;g.lineWidth=1;g.beginPath();g.moveTo(0,0);g.lineTo(-2.4,-s*0.9);g.stroke();
    /* лезвие */
    g.beginPath();g.moveTo(-1.2,0);g.lineTo(L,0);g.lineTo(L-3.4,s*1.25);g.lineTo(0.2,s*1.7);g.closePath();
    g.fillStyle=bs;g.fill();
    g.beginPath();g.moveTo(-1.2,0);g.lineTo(L,0);g.lineTo(L-3.6,s*0.7);g.lineTo(0.2,s*0.8);g.closePath();g.fillStyle=bl;g.fill();
    g.strokeStyle='#201018';g.lineWidth=0.45;g.beginPath();g.moveTo(-1.2,0);g.lineTo(L,0);g.lineTo(L-3.4,s*1.25);g.lineTo(0.2,s*1.7);g.closePath();g.stroke();
    g.strokeStyle=bh;g.lineWidth=0.35;g.beginPath();g.moveTo(1,s*0.08);g.lineTo(L-1.2,s*0.08);g.stroke();
    if(T){g.fillStyle='#6a1020';g.beginPath();g.moveTo(L,0);g.lineTo(L-3,s*0.2);g.lineTo(L-2.4,s*0.9);g.lineTo(L-3.4,s*1.25);g.lineTo(L-1.2,s*0.6);g.closePath();g.fill();
      g.fillStyle='rgba(90,40,10,.7)';for(const x of [2.4,4.6,6.4])g.fillRect(x,s*0.4,0.8,0.6);}
    g.restore();
  }
  g.beginPath();g.arc(0,0,0.95,0,TAU);mobPath(g,T?'#8a6a40':'#e8c050',-0.3,-0.3,1.1,true);g.strokeStyle='#201018';g.lineWidth=0.35;g.stroke();
  g.restore();
}
/* лапа-паук: сужающиеся сегменты, коленный сустав, щетинки, коготь */
function lmToysSpider(g,hx,hy,kx,ky,fx,fy,w,col,hair){
  lmToysTaper(g,hx,hy,kx,ky,w,w*0.8,col,true);
  lmToysTaper(g,kx,ky,fx,fy,w*0.78,w*0.2,col,true);
  /* обводка и светлый край по верху */
  g.strokeStyle=shadeHex(col,-0.6);g.lineWidth=0.5;g.lineJoin='round';
  for(const [ax,ay,bx,by,w0,w1] of [[hx,hy,kx,ky,w,w*0.8],[kx,ky,fx,fy,w*0.78,w*0.2]]){const a=Math.atan2(by-ay,bx-ax),nx=-Math.sin(a),ny=Math.cos(a);
    g.beginPath();g.moveTo(ax+nx*w0/2,ay+ny*w0/2);g.lineTo(bx+nx*w1/2,by+ny*w1/2);g.lineTo(bx-nx*w1/2,by-ny*w1/2);g.lineTo(ax-nx*w0/2,ay-ny*w0/2);g.closePath();g.stroke();
    g.strokeStyle=shadeHex(col,0.5);g.lineWidth=0.35;g.beginPath();g.moveTo(ax-nx*w0*0.28,ay-ny*w0*0.28);g.lineTo(bx-nx*w1*0.28,by-ny*w1*0.28);g.stroke();g.strokeStyle=shadeHex(col,-0.6);g.lineWidth=0.5;}
  g.beginPath();g.arc(kx,ky,w*0.42,0,TAU);mobPath(g,shadeHex(col,0.1),kx-0.3,ky-0.3,w*0.45);
  if(hair){g.strokeStyle=shadeHex(col,0.25);g.lineWidth=0.3;g.lineCap='round';
    for(let i=1;i<6;i++){const f=i/6,sx=hx+(kx-hx)*f,sy=hy+(ky-hy)*f,a=Math.atan2(ky-hy,kx-hx)-1.2;g.beginPath();g.moveTo(sx,sy);g.lineTo(sx+Math.cos(a)*1.6,sy+Math.sin(a)*1.6);g.stroke();}
    for(let i=1;i<5;i++){const f=i/5,sx=kx+(fx-kx)*f,sy=ky+(fy-ky)*f,a=Math.atan2(fy-ky,fx-kx)+1.1;g.beginPath();g.moveTo(sx,sy);g.lineTo(sx+Math.cos(a)*1.3,sy+Math.sin(a)*1.3);g.stroke();}}
  /* коготь: бледный кончик */
  const a2=Math.atan2(fy-ky,fx-kx);g.strokeStyle='#e4d6bf';g.lineWidth=0.7;g.lineCap='round';g.beginPath();g.moveTo(fx-Math.cos(a2)*0.8,fy-Math.sin(a2)*0.8);g.lineTo(fx+Math.cos(a2)*1.6,fy+Math.sin(a2)*1.6);g.stroke();
}
/* глаз куклы: белок, радужка с градиентом, зрачок, два блика, ресницы */
function lmToysDollEye(g,m,x,y,rx,ry,bl,iris,side){
  const lx=(m.lookX||0)*0.5+(m._ew||0),ly=(m.lookY||0)*0.4+(m._ey||0);
  g.fillStyle='#fffafa';g.beginPath();g.ellipse(x,y,rx,ry*bl,0,0,TAU);g.fill();
  if(bl>0.5){
    const ix=x+lx,iy=y+ly,ir=Math.min(rx,ry)*0.9;
    const gr=g.createRadialGradient(ix,iy+ir*0.35,0.1,ix,iy,ir*1.1);gr.addColorStop(0,shadeHex(iris,0.55));gr.addColorStop(0.5,iris);gr.addColorStop(1,shadeHex(iris,-0.6));
    g.save();g.beginPath();g.ellipse(x,y,rx,ry*bl,0,0,TAU);g.clip();
    g.fillStyle=gr;g.beginPath();g.ellipse(ix,iy,ir*0.95,ir,0,0,TAU);g.fill();
    g.fillStyle='#10202a';g.beginPath();g.arc(ix,iy+0.1,ir*0.42,0,TAU);g.fill();
    g.restore();
    g.fillStyle='#fff';g.beginPath();g.arc(ix-ir*0.38,iy-ir*0.4,ir*0.3,0,TAU);g.fill();g.beginPath();g.arc(ix+ir*0.4,iy+ir*0.42,ir*0.14,0,TAU);g.fill();
  }
  /* верхнее веко и ресницы (только у внешнего уголка) */
  g.strokeStyle='#5a2a3a';g.lineWidth=0.75;g.lineCap='round';g.beginPath();g.ellipse(x,y,rx*1.02,ry*bl*1.04,0,Math.PI*1.06,Math.PI*1.94);g.stroke();
  g.lineWidth=0.5;for(const a of (side<0?[-2.75,-2.3]:[-0.4,-0.85])){const ex=x+Math.cos(a)*rx,ey=y+Math.sin(a)*ry*bl;g.beginPath();g.moveTo(ex,ey);g.lineTo(ex+Math.cos(a)*1.5,ey+Math.sin(a)*1.3);g.stroke();}
}

/* мягкий объём без ступенек (фарфор, волосы): свет сверху-слева, тёплая тень по краю */
function lmToysSoft(g,c,cx,cy,r,sh,noLine){
  const gr=g.createRadialGradient(cx-r*0.36,cy-r*0.42,r*0.06,cx,cy,r*1.18);
  gr.addColorStop(0,shadeHex(c,0.3));gr.addColorStop(0.4,c);gr.addColorStop(1,mixHex(c,sh||'#a04a64',0.45));
  g.fillStyle=gr;g.fill();
  if(!noLine){g.strokeStyle=mobLine(c);g.lineWidth=1.1;g.lineJoin='round';g.stroke();}
}

/* шестерёнка: зубья, объём, отверстие; rot — поворот */
function lmToysGear(g,x,y,r,n,rot,c,hole){
  g.beginPath();for(let i=0;i<n*2;i++){const a=rot+i/(n*2)*TAU,rr=(i%2?r*0.8:r)*1;const a2=a+TAU/(n*4);g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);g.lineTo(x+Math.cos(a2)*rr,y+Math.sin(a2)*rr);}
  g.closePath();mobPath(g,c,x-r*0.2,y-r*0.25,r*0.9);
  if(hole){g.fillStyle='#120a08';g.beginPath();g.arc(x,y,r*hole,0,TAU);g.fill();g.strokeStyle=hexA('#ffffff',0.25);g.lineWidth=0.3;g.beginPath();g.arc(x,y,r*hole,Math.PI*1.1,Math.PI*1.6);g.stroke();}
}
/* пружина по прямой от (x0,y0) к (x1,y1): витки с блеском; w — радиус витка */
function lmToysSpring(g,x0,y0,x1,y1,n,w,c){
  const a=Math.atan2(y1-y0,x1-x0),L=Math.hypot(x1-x0,y1-y0),ca=Math.cos(a),sa=Math.sin(a);
  g.save();g.translate(x0,y0);g.rotate(a);g.lineCap='round';
  const dark=shadeHex(c,-0.55),mid=c,lit=shadeHex(c,0.5);
  for(let i=0;i<n;i++){const cx=L*(i+0.5)/n;
    g.strokeStyle=dark;g.lineWidth=2.1;g.beginPath();g.ellipse(cx,0,L/n*0.5,w,0,0,TAU);g.stroke();
    g.strokeStyle=mid;g.lineWidth=1.4;g.beginPath();g.ellipse(cx,0,L/n*0.5,w,0,0,TAU);g.stroke();}
  for(let i=0;i<n;i++){const cx=L*(i+0.5)/n;g.strokeStyle=lit;g.lineWidth=0.5;g.beginPath();g.ellipse(cx,0,L/n*0.5,w*0.92,0,Math.PI*1.08,Math.PI*1.5);g.stroke();}
  g.restore();
}
/* ружьё: пивот в хвате (gx,gy), угол ang; Истина — ржавое и кривое; flash — вспышка у дула */
function lmToysRifle(g,gx,gy,ang,T,flash){
  g.save();g.translate(gx,gy);g.rotate(ang);
  const wood=T?'#7a5a3c':'#a8683a',steel=T?'#7a746c':'#aab0bc',brass=T?'#8a6a30':'#f0c040';
  /* приклад: дерево с торцевой накладкой */
  g.beginPath();g.moveTo(-9.6,-1.5);g.lineTo(-4.4,-1.6);g.lineTo(-2.2,-1);g.lineTo(-2.2,1);g.lineTo(-4.2,2);g.lineTo(-9.6,3.2);g.closePath();mobPath(g,wood,-6,0,6);
  g.strokeStyle=hexA(shadeHex(wood,-0.5),0.7);g.lineWidth=0.3;for(const y of [-0.6,0.5,1.5]){g.beginPath();g.moveTo(-9,y+(y>0?0.5:0));g.quadraticCurveTo(-6,y-0.3,-2.8,y*0.5);g.stroke();}
  if(T){g.fillStyle='#10080a';g.beginPath();g.moveTo(-9.6,0.2);g.lineTo(-8,-0.4);g.lineTo(-8.6,1.4);g.lineTo(-9.6,1.8);g.closePath();g.fill();}
  g.fillStyle=brass;g.fillRect(-9.9,-1.6,0.9,4.9);
  /* ложа и ствол */
  g.beginPath();g.moveTo(-2.2,-0.9);g.lineTo(7.4,-0.5);g.lineTo(7.4,1.9);g.lineTo(-2.2,1.5);g.closePath();mobPath(g,wood,2,0.5,5);
  g.beginPath();g.moveTo(-2.4,-1.9);g.lineTo(13.6,-1.3);g.lineTo(13.6,0.1);g.lineTo(-2.4,0.2);g.closePath();mobPath(g,steel,5,-0.8,8);
  g.fillStyle=hexA('#ffffff',0.55);g.fillRect(-1,-1.5,13,0.35);
  g.fillStyle=brass;for(const x of [3,7,11]){g.fillRect(x,-1.9,0.9,3.6);g.fillStyle=hexA('#ffffff',0.4);g.fillRect(x,-1.9,0.9,0.5);g.fillStyle=brass;}
  /* замок: курок и предохранитель */
  g.beginPath();g.rect(-3.6,-2.6,3.4,2);mobPath(g,brass,-2,-2,2.4);
  g.strokeStyle='#20140a';g.lineWidth=0.7;g.lineCap='round';g.beginPath();g.moveTo(-3.6,-2.4);g.lineTo(-4.8,-3.8);g.stroke();
  g.strokeStyle=brass;g.lineWidth=0.5;g.beginPath();g.moveTo(-1,1.8);g.quadraticCurveTo(-0.4,3.2,0.8,1.8);g.stroke();
  /* штык с кольцом */
  g.fillStyle=steel;g.fillRect(12.6,-1.9,1.4,2.4);
  g.beginPath();g.moveTo(14,-1.6);g.lineTo(T?17.4:20,-1.1);g.lineTo(T?16:14,-0.1);g.closePath();g.fillStyle=T?'#6a5a4a':'#dce4ee';g.fill();g.strokeStyle='#14101a';g.lineWidth=0.35;g.stroke();
  g.strokeStyle=hexA('#ffffff',0.7);g.lineWidth=0.3;g.beginPath();g.moveTo(14.2,-1.45);g.lineTo(T?16.6:19.4,-1.05);g.stroke();
  if(flash>0){const f=flash;g.save();g.globalCompositeOperation='lighter';g.translate(14,-0.7);
    mobGlow(g,2,0,9*f+3,'#ffb040',0.9*f);
    g.fillStyle='rgba(255,236,150,'+(0.95*f)+')';g.beginPath();for(let i=0;i<10;i++){const a=i/10*TAU,rr=(i%2?2.2:6.4+(i%4===0?4:0))*f;g.lineTo(2+Math.cos(a)*rr,Math.sin(a)*rr*0.8);}g.closePath();g.fill();
    g.fillStyle='rgba(255,255,255,'+f+')';g.beginPath();g.arc(2,0,2.2*f,0,TAU);g.fill();g.restore();}
  g.restore();
}
/* циферблат с делениями и стрелками */
function lmToysClock(g,x,y,r,T,hand){
  g.beginPath();g.arc(x,y,r,0,TAU);mobPath(g,T?'#d8cbb0':'#fffaf0',x-r*0.2,y-r*0.3,r);
  g.strokeStyle=T?'#3a2a1c':'#4a3a2a';g.lineWidth=0.35;for(let i=0;i<12;i++){const a=i/12*TAU;g.beginPath();g.moveTo(x+Math.cos(a)*r*0.72,y+Math.sin(a)*r*0.72);g.lineTo(x+Math.cos(a)*r*0.9,y+Math.sin(a)*r*0.9);g.stroke();}
  g.lineCap='round';g.strokeStyle=T?'#1a100a':'#2a1c14';g.lineWidth=0.6;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(hand-1.2)*r*0.5,y+Math.sin(hand-1.2)*r*0.5);g.stroke();
  g.lineWidth=0.4;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(hand)*r*0.78,y+Math.sin(hand)*r*0.78);g.stroke();
  g.fillStyle=T?'#7a1a1a':'#c02020';g.beginPath();g.arc(x,y,0.45,0,TAU);g.fill();
}

/* рукав: единая ломаная плечо-локоть-кисть, три тона (тень, цвет, свет) и тёмный контур */
function lmToysArm(g,sx,sy,hx,hy,l1,l2,back,w0,w1,col){
  const dx=hx-sx,dy=hy-sy,d=Math.min(l1+l2-0.01,Math.max(0.5,Math.hypot(dx,dy))),a=Math.atan2(dy,dx);
  const c=Math.acos(clamp((l1*l1+d*d-l2*l2)/(2*l1*d),-1,1)),ka=a+(back?c:-c),kx=sx+Math.cos(ka)*l1,ky=sy+Math.sin(ka)*l1;
  const ex=sx+Math.cos(a)*d,ey=sy+Math.sin(a)*d;
  g.lineJoin='round';g.lineCap='round';
  const path=(ox,oy)=>{g.beginPath();g.moveTo(sx+ox,sy+oy);g.lineTo(kx+ox,ky+oy);g.lineTo(ex+ox,ey+oy);};
  path(0,0);g.strokeStyle=mobLine(col);g.lineWidth=w0+1.1;g.stroke();
  path(0,0);g.strokeStyle=shadeHex(col,-0.22);g.lineWidth=w0;g.stroke();
  path(-0.18,-0.22);g.strokeStyle=col;g.lineWidth=w0*0.72;g.stroke();
  path(-0.5,-0.6);g.strokeStyle=hexA(shadeHex(col,0.4),0.75);g.lineWidth=w0*0.26;g.stroke();
  /* складка на сгибе локтя */
  g.strokeStyle=hexA(shadeHex(col,-0.55),0.6);g.lineWidth=0.35;g.beginPath();g.arc(kx,ky,w0*0.38,ka+1.9,ka+4.4);g.stroke();
  return [ex,ey,kx,ky];
}

/* ---------- Фарфоровая кукла ---------- */
LM_MODEL.ldoll=function(g,m,FY,t,T,st,k,wv,ph){
  const frz=!!m.frz,sn=st==='snipw'?k:0,Y=v=>FY+v;
  /* оживлённость: пока на куклу смотрят, она каменеет (быстро, но не рывком) */
  const al=lmToysE(m,'al',frz?0:1,t,12),mk=(m.mk||0)*al,walk=mk>0.05,gp=lmGait(m,12),sw=Math.sin(gp)*mk;
  const bth=lmBreath(t,ph,3.2)*al,br=al*Math.sin(t*2.6+ph*5),e=sn*sn*(3-2*sn);
  const fg=al*lmFidget(t,ph,4.2),fg2=al*lmFidget(t+2,ph,6.1),tw=T?al*lmTwitch(t,ph,0.8):0,tw2=T?al*lmTwitch(t+3,ph,1.2):0;
  m._ew=al*(0.32*Math.sin(t*0.8+ph*5)+0.18*Math.sin(t*2.1+ph))*(1-sn)+tw*0.5;m._ey=al*0.18*Math.sin(t*0.6+ph*2);
  const C=T?{hair:'#8e726c',hairL:'#bba49c',hairD:'#4a3636',skin:'#d9cec7',skinD:'#a89890',dress:'#a77a92',dressL:'#cba4b8',dressD:'#5e3c50',lace:'#d2c6bc',shoe:'#6a3a50',sock:'#cbc0b8',bow:'#a45a7c'}
    :{hair:'#f5bca4',hairL:'#ffe0cc',hairD:'#b5705e',skin:'#fcd8c8',skinD:'#e6a898',dress:'#f6a6c6',dressL:'#fdd2e4',dressD:'#c4709a',lace:'#fff8f8',shoe:'#ee6c9c',sock:'#fbf4f4',bow:'#ec6fa4'};
  const lerp2=(a,b,q)=>a+(b-a)*q;
  g.save();g.translate(0,FY+lmBob(m,12,0.7)*al);g.rotate(-0.07*e+sw*0.03+0.05*mk+Math.sin(t*1.7+ph*4)*0.025*al);g.scale(1+bth*0.012,1+bth*0.04);g.translate(0,-FY);
  /* ---- паучьи лапы из-под платья (только Истина): дальние слева темнее ---- */
  if(T){
    const sc=gp;
    const LG=[[7.5,-9,12.8,-31,15.6,0],[9.6,-7.6,18,-24.5,20.4,0],[11,-6,22,-14,24,0]];
    for(let pass=0;pass<2;pass++)for(let j=2;j>=0;j--){
      const sd=pass?1:-1,col=pass?'#80505a':'#573540',L=LG[j];
      const bx=sd*L[0],by=Y(L[1]);
      let kx=sd*L[2],ky=Y(L[3]),fx=sd*L[4],fy=FY+L[5];
      const pI=Math.sin(t*1.3+j*0.9+pass*2)*0.25*al,pW=Math.sin(sc+j*1.7+(sd>0?Math.PI:0)),p=pI+(pW-pI)*mk;
      const tj=T?al*lmTwitch(t,ph+j*0.41+pass*0.23,0.9):0,tap=al*lmFidget(t+j*1.3+pass*0.7,ph,5.3);
      fx+=p*2.4+tj*1.8;fy-=Math.max(0,p)*2.6+tap*2;ky-=Math.max(0,p)*1.4+tap*1.6+Math.abs(tj)*1.4+bth*0.5;
      if(sn>0&&sd>0&&j<2){fx=lerp2(fx,19+j*5,e);fy=lerp2(fy,Y(-21-j*9),e);kx=lerp2(kx,14+j*3,e);ky=lerp2(ky,Y(-35-j*2),e);}
      lmToysSpider(g,bx,by,kx,ky,fx,fy,4-j*0.4,col,true);
    }
  }
  /* ---- длинные волосы за спиной ---- */
  {const tw=T?1:0,wob=(Math.sin(t*2.2+1)*0.9+Math.sin(t*3.9+ph*4)*0.6)*(0.4+0.6*al)+Math.sin(gp*2+1)*0.7*mk;
    g.beginPath();g.moveTo(0,Y(-36.4));g.bezierCurveTo(-7.6,Y(-36.4),-10,Y(-31),-9.6,Y(-26));
    g.bezierCurveTo(-10.8,Y(-21.4),-9.8,Y(-17),-7.6+wob,Y(-14.8));
    if(tw){g.lineTo(-6.4,Y(-17.8));g.lineTo(-5.4+wob,Y(-14));g.lineTo(-4,Y(-18.4));g.lineTo(-2.4,Y(-15.6));g.lineTo(-1.6,Y(-19.4));}
    else{g.bezierCurveTo(-6.2,Y(-16.6),-4.6,Y(-18),-3,Y(-19.4));}
    g.lineTo(3.4,Y(-19.4));
    if(tw){g.lineTo(4.2,Y(-16));g.lineTo(5.6-wob,Y(-19));g.lineTo(6.8,Y(-14.4));g.lineTo(8.2,Y(-18.4));g.lineTo(9.4-wob,Y(-15.2));}
    else{g.bezierCurveTo(5,Y(-18),7,Y(-16.4),8.8-wob,Y(-15.2));}
    g.bezierCurveTo(10.8,Y(-17),10.4,Y(-22),10,Y(-26));g.bezierCurveTo(10.4,Y(-31),7.6,Y(-36.4),0,Y(-36.4));g.closePath();
    lmToysSoft(g,shadeHex(C.hair,-0.12),-0.6,Y(-26),10.4,T?'#2a1c1c':'#a0584a');
    g.save();g.clip();g.strokeStyle=hexA(C.hairD,0.6);g.lineWidth=0.5;
    for(let i=0;i<7;i++){const x=-8+i*2.7;g.beginPath();g.moveTo(x*0.7,Y(-34));g.bezierCurveTo(x*1.25,Y(-28),x*1.05,Y(-21),x*1.1+Math.sin(i*2)*0.8,Y(-14.5));g.stroke();}
    g.restore();}
  if(!T){for(const sd of [-1,1]){const cx=sd*8.6+Math.sin(t*1.9+sd+ph)*0.4*(0.5+0.5*al)-mk*0.5,cy=Y(-15.6)-Math.abs(Math.sin(gp+sd))*0.7*mk+Math.sin(t*2.2+sd)*0.2*al;g.beginPath();g.arc(cx,cy,1.9,0,TAU);lmToysSoft(g,C.hair,cx-0.5,cy-0.6,1.9,'#a0584a',false);g.strokeStyle=hexA(C.hairD,0.8);g.lineWidth=0.4;g.beginPath();g.arc(cx,cy,1,0.6,5.4);g.stroke();}}
  /* ---- дальняя рука: темнее, позади юбки ---- */
  const farH=[-8.8+sw*1.7+Math.sin(t*2.4+1)*0.6*al,Y(-13.4+(T?-0.6:0))+bth*0.4+Math.sin(t*1.3+2)*0.2*al];
  {const fa=lmLimb(g,-4.6,Y(-20.4),farH[0],farH[1],T?6.6:5.2,T?6.8:5.4,true,T?2.1:2.5,T?1.2:1.8,shadeHex(C.skin,-0.24));
    if(T){g.strokeStyle='#40343a';g.lineWidth=0.5;g.lineCap='round';for(let q=-1;q<=1;q++){const fw=Math.sin(t*2.6+q*1.7)*0.6*al+tw2*1.1*(q+1.3);g.beginPath();g.moveTo(fa[0],fa[1]);g.quadraticCurveTo(fa[0]-0.8+q*0.6+fw*0.5,fa[1]+2.2,fa[0]+q*0.9-0.6+fw,fa[1]+4.6);g.stroke();}}
    else mobBlob(g,fa[0],fa[1]+0.4,1.5,1.6,shadeHex(C.skin,-0.2));}
  /* ---- ножки в носочках и туфельки ---- */
  for(const [ox,o,far] of [[-3.4,Math.PI,1],[3.6,0,0]]){
    const s=lmFoot(m,o,12,2.4),x=ox+s[0]*0.75*al,lift=s[1]*al,sk=far?shadeHex(C.sock,-0.14):C.sock;
    g.beginPath();g.rect(x-1.3,Y(-6.4),2.6,5.4+lift);mobPath(g,sk,x-0.4,Y(-4),3,true);
    g.strokeStyle=shadeHex(sk,-0.35);g.lineWidth=0.35;g.beginPath();g.moveTo(x-1.3,Y(-1.6+lift));g.lineTo(x+1.3,Y(-1.6+lift));g.stroke();
    /* туфелька: носок вперёд, ремешок и бантик */
    g.beginPath();g.moveTo(x-2.4,Y(-0.2+lift));g.quadraticCurveTo(x-2.6,Y(-2.8+lift),x-0.6,Y(-3+lift));g.quadraticCurveTo(x+1.8,Y(-3.2+lift),x+3.4,Y(-1.6+lift));g.quadraticCurveTo(x+4,Y(-0.2+lift),x+3,Y(0.1+lift));g.lineTo(x-2.4,Y(0.1+lift));g.closePath();
    mobPath(g,far?shadeHex(C.shoe,-0.2):C.shoe,x-0.6,Y(-2.2+lift),4);
    g.strokeStyle=shadeHex(C.shoe,-0.4);g.lineWidth=0.4;g.beginPath();g.moveTo(x-1.8,Y(-2.6+lift));g.lineTo(x+1.5,Y(-1.4+lift));g.stroke();
    g.fillStyle=far?shadeHex(C.shoe,-0.1):shadeHex(C.shoe,0.3);g.beginPath();g.arc(x+1.7,Y(-2.2+lift),0.55,0,TAU);g.fill();
    if(T){g.strokeStyle='#10080a';g.lineWidth=0.35;g.beginPath();g.moveTo(x-0.6,Y(-6.2));g.lineTo(x+0.2,Y(-4.6));g.lineTo(x-0.5,Y(-3.4));g.stroke();}
  }
  /* юбка качается: сдвиг от талии, подол отстаёт на ходу */
  g.save();g.translate(0,Y(-19.4));g.transform(1,0,Math.sin(t*2.1+ph*3)*0.045*(0.5+0.5*al)+Math.sin(gp+0.8)*0.06*mk-0.03*mk+fg*0.02,1,0,0);g.translate(0,-Y(-19.4));
  /* ---- нижняя юбка-кружево (подъюбник) ---- */
  g.beginPath();g.moveTo(-10.8,Y(-8.6));
  for(let i=0;i<8;i++){const x0=-11.8+i*2.95;g.quadraticCurveTo(x0+1.5,Y(-3.2+(T&&i%3===1?-1.2:0)),x0+2.95,Y(-5.6));}
  g.lineTo(11.4,Y(-8.6));g.closePath();mobPath(g,C.lace,-1,Y(-6.4),11);
  g.fillStyle=T?'rgba(60,40,40,.5)':'rgba(200,120,160,.4)';for(let i=0;i<8;i++){g.beginPath();g.arc(-9.8+i*2.95,Y(-5.4),0.38,0,TAU);g.fill();}
  /* ---- юбка-колокол с рюшами ---- */
  g.beginPath();g.moveTo(-3.8,Y(-19.4));g.quadraticCurveTo(-9.2,Y(-15),-11.6,Y(-7.4));
  const hem=[];for(let i=0;i<8;i++){const x0=-11.6+i*2.9,tr=T&&(i===2||i===5);
    if(tr){g.lineTo(x0+1,Y(-4.6));g.lineTo(x0+1.8,Y(-6.6));g.lineTo(x0+2.9,Y(-3.8));}
    else g.quadraticCurveTo(x0+1.45,Y(-4.6-(T&&i%2?0.8:0)),x0+2.9,Y(-7.4));}
  g.quadraticCurveTo(9.4,Y(-15),3.8,Y(-19.4));g.closePath();
  mobPath(g,C.dress,-1.5,Y(-13),11.4);
  g.save();g.clip();
  /* тень справа и снизу, складки */
  {const sg=g.createLinearGradient(-12,0,12,0);sg.addColorStop(0,'rgba(255,255,255,.14)');sg.addColorStop(0.5,'rgba(255,255,255,0)');sg.addColorStop(1,'rgba(90,20,60,.3)');g.fillStyle=sg;g.fillRect(-13,Y(-20),26,16);}
  for(let i=0;i<6;i++){const x=-8.4+i*3.3,sx=x*0.34;
    g.strokeStyle=hexA(C.dressD,0.5);g.lineWidth=0.55;g.beginPath();g.moveTo(sx,Y(-19));g.quadraticCurveTo(x*0.7+0.8,Y(-13),x*1.02,Y(-6));g.stroke();
    g.strokeStyle=hexA(C.dressL,0.5);g.lineWidth=0.4;g.beginPath();g.moveTo(sx+0.6,Y(-19));g.quadraticCurveTo(x*0.7+1.7,Y(-13),x*1.02+0.9,Y(-6));g.stroke();}
  /* оборка с кружевным краем */
  g.beginPath();g.moveTo(-11.6,Y(-10.6));
  for(let i=0;i<9;i++){const x0=-11.6+i*2.6;g.quadraticCurveTo(x0+1.3,Y(-8.8),x0+2.6,Y(-10.6));}
  g.lineTo(12,Y(-3));g.lineTo(-12,Y(-3));g.closePath();g.fillStyle=T?'rgba(214,200,192,.55)':'rgba(255,248,250,.9)';g.fill();
  g.strokeStyle=hexA(C.dressD,0.5);g.lineWidth=0.3;g.beginPath();g.moveTo(-11.6,Y(-10.6));for(let i=0;i<9;i++){const x0=-11.6+i*2.6;g.quadraticCurveTo(x0+1.3,Y(-8.8),x0+2.6,Y(-10.6));}g.stroke();
  g.fillStyle=hexA(C.dressD,0.55);for(let i=0;i<9;i++){g.beginPath();g.arc(-10.3+i*2.6,Y(-9.7),0.4,0,TAU);g.fill();}
  /* мелкие бантики-горошек на юбке (в Истине — пятна и дыры) */
  if(!T){g.fillStyle='rgba(255,255,255,.55)';for(const [x,y] of [[-6,-14.4],[-1.4,-12],[3.2,-15],[6.4,-12.6],[-4,-10.2]]){g.beginPath();g.arc(x,Y(y),0.7,0,TAU);g.fill();}}
  else{
    g.fillStyle='rgba(30,10,20,.55)';for(const [x,y,r] of [[-6,-13,1.7],[4.4,-14,1.3],[7,-9,1.1],[-2,-8.5,1.5]]){g.beginPath();g.ellipse(x,Y(y),r,r*1.3,0.4,0,TAU);g.fill();}
    /* прорехи с тьмой внутри */
    g.fillStyle='#0c0408';g.beginPath();g.moveTo(-3.6,Y(-16.4));g.lineTo(-2.2,Y(-14));g.lineTo(-2.9,Y(-13.4));g.lineTo(-1.4,Y(-10.6));g.lineTo(-2.6,Y(-10.4));g.lineTo(-3.4,Y(-8.4));g.lineTo(-4.4,Y(-11));g.lineTo(-3.6,Y(-11.6));g.lineTo(-4.6,Y(-13.8));g.lineTo(-3.8,Y(-14.2));g.closePath();g.fill();
    g.beginPath();g.moveTo(5.2,Y(-14.6));g.lineTo(6.4,Y(-12.2));g.lineTo(5.8,Y(-11.8));g.lineTo(6.8,Y(-9));g.lineTo(5.4,Y(-8.4));g.lineTo(5.2,Y(-10.4));g.lineTo(4.2,Y(-11.4));g.lineTo(4.8,Y(-12.6));g.closePath();g.fill();
    g.strokeStyle='rgba(220,200,190,.5)';g.lineWidth=0.3;g.beginPath();g.moveTo(-3.4,Y(-16));g.lineTo(-3.4,Y(-16));for(const [a,b,c,d] of [[-2.2,-14,5.2,-14.6],[-1.4,-10.6,4.2,-11.4],[-3.6,-11.6,4.8,-12.6]]){g.moveTo(a,Y(b));g.lineTo(c,Y(d));}g.stroke();}
  g.restore();
  g.restore();
  /* ---- лиф, пояс, бант на груди, воротничок ---- */
  g.beginPath();g.moveTo(-4.4,Y(-19.2));g.lineTo(-4.8,Y(-23.2));g.quadraticCurveTo(0,Y(-24.6),4.8,Y(-23.2));g.lineTo(4.4,Y(-19.2));g.closePath();mobPath(g,shadeHex(C.dress,0.06),-0.6,Y(-21.4),4.8);
  g.fillStyle=C.dressD;g.beginPath();g.rect(-4.5,Y(-20),9,1.4);g.fill();g.fillStyle=hexA(C.dressL,0.7);g.fillRect(-4.5,Y(-20),9,0.4);
  lmToysBow(g,0.6,Y(-20.8)-bth*0.2,0.5,shadeHex(C.bow,0.12),Math.sin(t*2.2+ph)*0.06*al,T);
  /* ---- шея с шарнирным стыком ---- */
  g.beginPath();g.rect(-1.5,Y(-25.6),3.2,2.8);mobPath(g,shadeHex(C.skin,-0.1),-0.5,Y(-24.6),2.4,true);
  if(T){g.fillStyle='#120608';g.fillRect(-1.5,Y(-24.6),3.2,0.7);}
  /* воротничок-кружево */
  g.beginPath();g.moveTo(-5.4,Y(-23.2));for(let i=0;i<6;i++){const x0=-5.4+i*1.8;g.quadraticCurveTo(x0+0.9,Y(-21.6),x0+1.8,Y(-23.2));}
  g.quadraticCurveTo(0,Y(-25.6),-5.4,Y(-23.2));g.closePath();mobPath(g,C.lace,-1.5,Y(-24),5.6);
  /* ---- голова: наклон и дрожь ---- */
  const tilt=al*(T?0.13+Math.sin(t*0.9)*0.035+Math.sin(t*2.3+ph*3)*0.025+tw*0.17-fg2*0.05:Math.sin(t*2.0+ph)*0.07+fg*0.14-fg2*0.07+0.03*mk),hx=0.8+fg*0.45-(T?tw*0.5:0),hy=Y(-28.6)+br*0.14-bth*0.3+Math.abs(sw)*0.3;
  g.save();g.translate(0.4,Y(-24));g.rotate(tilt);g.translate(-0.4,-Y(-24));
  /* голова-яйцо */
  g.beginPath();g.moveTo(hx-6.4,hy-0.6);g.bezierCurveTo(hx-6.6,hy-5.4,hx-3,hy-7,hx,hy-7);g.bezierCurveTo(hx+3.2,hy-7,hx+6.6,hy-5.4,hx+6.4,hy-0.6);
  g.bezierCurveTo(hx+6.2,hy+3.6,hx+3.2,hy+6.4,hx,hy+6.6);g.bezierCurveTo(hx-3.2,hy+6.4,hx-6.2,hy+3.6,hx-6.4,hy-0.6);g.closePath();
  lmToysSoft(g,C.skin,hx,hy,6.8,T?'#3a2a3a':'#c8707a');
  g.save();g.clip();
  g.fillStyle=T?'rgba(60,40,50,.18)':'rgba(190,120,120,.14)';g.beginPath();g.ellipse(hx+5.6,hy+1,3,7,0,0,TAU);g.fill();
  g.restore();
  /* уши: маленькие, под волосами */
  g.fillStyle=shadeHex(C.skin,-0.1);g.beginPath();g.ellipse(hx-6.5,hy+0.8,0.9,1.5,0,0,TAU);g.fill();
  const bp=(t+ph*9)%3.7,bl=(bp<0.18&&al>0.5)?1-0.88*Math.sin(bp/0.18*Math.PI):1;
  if(!T){
    /* брови, глаза, румянец, носик, ротик */
    g.strokeStyle='#b27a68';g.lineWidth=0.5;g.lineCap='round';g.beginPath();g.moveTo(hx-4.1,hy-3.4);g.quadraticCurveTo(hx-2.4,hy-4.5,hx-0.8,hy-3.6);g.moveTo(hx+1.7,hy-3.7);g.quadraticCurveTo(hx+3.4,hy-4.8,hx+5,hy-3.7);g.stroke();
    lmToysDollEye(g,m,hx-2.5,hy+0.3,1.9,2.4,bl,'#3aa0a8',-1);lmToysDollEye(g,m,hx+3.2,hy+0.3,2.1,2.5,bl,'#3aa0a8',1);
    g.fillStyle='rgba(255,110,150,.42)';g.beginPath();g.ellipse(hx-4.1,hy+3.7,1.8,1,0,0,TAU);g.ellipse(hx+5,hy+3.7,1.7,1,0,0,TAU);g.fill();
    g.strokeStyle='rgba(190,110,110,.6)';g.lineWidth=0.4;g.beginPath();g.moveTo(hx+1.2,hy+2.7);g.quadraticCurveTo(hx+1.9,hy+3.3,hx+1.1,hy+3.5);g.stroke();
    /* ротик-бутончик */
    g.beginPath();g.moveTo(hx-0.6,hy+4.6);g.quadraticCurveTo(hx+0.4,hy+4,hx+1.1,hy+4.4);g.quadraticCurveTo(hx+1.9,hy+4,hx+2.6,hy+4.6);g.quadraticCurveTo(hx+1,hy+5.9,hx-0.6,hy+4.6);g.closePath();g.fillStyle='#d8566e';g.fill();
    g.strokeStyle='#8a2a40';g.lineWidth=0.3;g.beginPath();g.moveTo(hx-0.6,hy+4.6);g.quadraticCurveTo(hx+1,hy+4.9,hx+2.6,hy+4.6);g.stroke();
    g.fillStyle='rgba(255,255,255,.65)';g.beginPath();g.ellipse(hx+0.5,hy+4.9,0.5,0.25,0,0,TAU);g.fill();
    /* блик на лбу и щеке: глянец фарфора */
    g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=0.6;g.beginPath();g.ellipse(hx,hy,5.6,5.8,0,Math.PI*1.28,Math.PI*1.42);g.stroke();
    g.fillStyle='rgba(255,255,255,.4)';g.beginPath();g.ellipse(hx-4.8,hy+1.2,0.5,1.4,0.1,0,TAU);g.fill();
  }else{
    /* ИСТИНА: чёрные впадины, красная точка, дорожки слёз, трещина, зашитый рот */
    const gl=(0.6+0.4*Math.sin(t*3+ph))*(1-0.5*Math.abs(tw2));
    for(const [ex,ey,rx,ry] of [[hx-2.5,hy+0.5,2.1,2.9],[hx+3.2,hy+0.5,2.3,3]]){
      g.fillStyle='#050204';g.beginPath();g.ellipse(ex,ey,rx,ry,0,0,TAU);g.fill();
      g.strokeStyle='rgba(130,100,100,.7)';g.lineWidth=0.4;g.beginPath();g.ellipse(ex,ey,rx,ry,0,Math.PI*1.1,Math.PI*1.9);g.stroke();
      g.fillStyle='rgba(50,24,30,.9)';g.beginPath();g.ellipse(ex,ey+ry*0.35,rx*0.7,ry*0.5,0,0,TAU);g.fill();}
    mobGlow(g,hx-2.5,hy+0.8,5,'#ff2a2a',0.7*gl+(sn?0.3:0));g.fillStyle='#ff5a4a';g.beginPath();g.arc(hx-2.5,hy+0.8,0.55,0,TAU);g.fill();
    if(frz||sn>0.2){mobGlow(g,hx+3.2,hy+0.8,5,'#ff2a2a',0.6*gl);g.fillStyle='#ff5a4a';g.beginPath();g.arc(hx+3.2,hy+0.8,0.55,0,TAU);g.fill();}
    /* дорожки чёрных слёз: сужающиеся, с каплями на концах */
    g.fillStyle='#0e0508';
    for(const [sx,sy,ex2,ey2,w] of [[hx-2.7,hy+3.2,hx-3.4,hy+8.3,1.1],[hx+3.6,hy+3.3,hx+4.4,hy+8.8,1.2]]){
      g.beginPath();g.moveTo(sx-w*0.5,sy);g.quadraticCurveTo(sx-w*0.8,(sy+ey2)/2,ex2-0.2,ey2);g.quadraticCurveTo(sx+w*0.9,(sy+ey2)/2,sx+w*0.5,sy);g.closePath();g.fill();
      g.beginPath();g.ellipse(ex2,ey2+0.5,0.5,0.7,0,0,TAU);g.fill();}
    /* трещина фарфора с тьмой и светлым краем */
    const crack=[[hx+1.2,hy-7],[hx+2.4,hy-5],[hx+1.6,hy-3.4],[hx+3,hy-2.2],[hx+3.4,hy-1.2]];
    g.strokeStyle='#0a0406';g.lineWidth=0.75;g.lineJoin='round';g.beginPath();crack.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.stroke();
    g.beginPath();g.moveTo(hx+1.6,hy-3.4);g.lineTo(hx-0.2,hy-3);g.moveTo(hx+2.4,hy-5);g.lineTo(hx+4.2,hy-4.4);g.moveTo(hx+4.6,hy+3.6);g.lineTo(hx+5.4,hy+1.8);g.lineTo(hx+6.2,hy+1.6);g.stroke();
    g.strokeStyle='rgba(250,240,235,.5)';g.lineWidth=0.3;g.beginPath();crack.forEach((p,i)=>i?g.lineTo(p[0]+0.5,p[1]):g.moveTo(p[0]+0.5,p[1]));g.stroke();
    /* отколотый кусок на скуле */
    g.fillStyle='#14080c';g.beginPath();g.moveTo(hx+5.2,hy+3.6);g.lineTo(hx+6.5,hy+2.2);g.lineTo(hx+6.1,hy+5);g.lineTo(hx+4.7,hy+5.2);g.closePath();g.fill();
    /* рот: зашит, а в замахе швы рвутся и пасть раскрывается */
    const op=Math.max(clamp(sn*1.4-0.15,0,1),0.32*Math.abs(tw2)),my=hy+5;
    if(op>0.05){g.fillStyle='#0a0306';g.beginPath();g.ellipse(hx+0.6,my,3.2,0.5+op*1.9,0,0,TAU);g.fill();
      g.fillStyle='#f0e6d6';for(let i=0;i<7;i++){const x=hx-2.2+i*0.75;g.beginPath();g.moveTo(x,my-0.4-op*1.2);g.lineTo(x+0.35,my+0.4+op*0.6);g.lineTo(x+0.7,my-0.4-op*1.2);g.fill();g.beginPath();g.moveTo(x,my+0.4+op*1.2);g.lineTo(x+0.35,my-0.3-op*0.6);g.lineTo(x+0.7,my+0.4+op*1.2);g.fill();}}
    g.strokeStyle='#1a0a0e';g.lineWidth=0.45;g.lineCap='round';g.beginPath();g.moveTo(hx-2.6,my);g.quadraticCurveTo(hx+0.6,my+0.4,hx+3.8,my-0.1);g.stroke();
    g.lineWidth=0.4;for(let i=0;i<5;i++){const x=hx-2.2+i*1.5,sp=op*1.1;g.beginPath();g.moveTo(x-0.5,my-0.9-sp);g.lineTo(x+0.6,my+0.9+sp);g.moveTo(x+0.6,my-0.9-sp);g.lineTo(x-0.5,my+0.9+sp);g.stroke();}
    g.beginPath();g.moveTo(hx+3.6,my);g.quadraticCurveTo(hx+4.6,my+2,hx+4.2,my+3.6);g.stroke();
    /* блик */
    g.strokeStyle='rgba(255,255,255,.3)';g.lineWidth=0.5;g.beginPath();g.ellipse(hx,hy,5.6,5.8,0,Math.PI*1.28,Math.PI*1.42);g.stroke();
  }
  /* чёлка и боковые пряди */
  g.beginPath();g.moveTo(hx-7,hy+0.6);g.bezierCurveTo(hx-7.4,hy-6.2,hx-3,hy-8.6,hx+0.4,hy-8.4);g.bezierCurveTo(hx+4,hy-8.2,hx+7.6,hy-5.8,hx+7,hy+0.6);
  g.bezierCurveTo(hx+6.8,hy-1.6,hx+6.2,hy-3,hx+5.4,hy-3.8);
  for(let i=0;i<5;i++){const x0=hx+5.4-i*2.5,dip=T?(i%2?1.6:0.2)+(i===2?1.4:0):(i%2?0.9:0.3);g.quadraticCurveTo(x0-1.25,hy-3.9+dip*2.2,x0-2.5,hy-4.4+(T&&i===3?1:0));}
  g.bezierCurveTo(hx-5.6,hy-3.4,hx-6.4,hy-1.8,hx-7,hy+0.6);g.closePath();
  lmToysSoft(g,C.hair,hx,hy-3,7.8,T?'#2a1c1c':'#a0584a',true);g.strokeStyle=mobLine(C.hair);g.lineWidth=0.8;g.lineJoin='round';g.stroke();
  g.save();g.clip();g.strokeStyle=hexA(C.hairD,0.6);g.lineWidth=0.45;
  for(let i=0;i<7;i++){const x=hx-6+i*2;g.beginPath();g.moveTo(hx+(x-hx)*0.2,hy-8.4);g.quadraticCurveTo(x,hy-6,x+(x>hx?0.8:-0.8)+Math.sin(i*3)*0.4,hy-2.6);g.stroke();}
  g.strokeStyle=hexA(C.hairL,0.75);g.lineWidth=0.7;g.beginPath();g.ellipse(hx-0.6,hy-1.8,6.4,6.2,0,Math.PI*1.12,Math.PI*1.5);g.stroke();
  g.restore();
  if(T){/* дыра в голове с паучьими глазками и торчащие клочья */
    g.fillStyle='#0a0306';g.beginPath();g.moveTo(hx+2.6,hy-7.6);g.lineTo(hx+5,hy-6.6);g.lineTo(hx+5.6,hy-4.8);g.lineTo(hx+4,hy-4);g.lineTo(hx+2.6,hy-4.8);g.lineTo(hx+1.8,hy-6.2);g.closePath();g.fill();
    g.strokeStyle='#d8ccc4';g.lineWidth=0.5;g.lineJoin='round';g.stroke();
    for(const [ex,ey,er] of [[3.2,-6.6,0.5],[4.5,-6.1,0.42],[3.5,-5.2,0.55],[4.8,-4.9,0.36]]){mobGlow(g,hx+ex,hy+ey,2.6,'#ff2a2a',0.65);g.fillStyle='#ff6a5a';g.beginPath();g.arc(hx+ex,hy+ey,er,0,TAU);g.fill();}
    g.strokeStyle=C.hair;g.lineWidth=0.4;g.lineCap='round';for(const [x,y,dx,dy] of [[-6.6,-5,-2,-0.6],[-5,-7.6,-1.2,-1.8],[-1,-8.6,-0.2,-1.8],[6.6,-6.4,1.8,-0.8],[7,-3,1.8,0.4],[-7,-2,-2,0.8]]){g.beginPath();g.moveTo(hx+x,hy+y);g.quadraticCurveTo(hx+x+dx*0.3,hy+y+dy*1.2,hx+x+dx,hy+y+dy);g.stroke();}}
  /* боковая прядь спереди плеча (ближняя) */
  g.beginPath();g.moveTo(hx+6.4,hy-1);const lk=Math.sin(t*2.6+ph+1)*1.0*al+Math.sin(gp*2)*0.5*mk;g.bezierCurveTo(hx+8.2,hy+3,hx+8.6+lk*0.5,hy+8,hx+7.6+lk,hy+12.6);g.bezierCurveTo(hx+6+lk*0.8,hy+11.6,hx+5.4,hy+8,hx+5.8,hy+3);g.closePath();
  lmToysSoft(g,shadeHex(C.hair,0.04),hx+6.6,hy+5,6,T?'#2a1c1c':'#a0584a');
  g.strokeStyle=hexA(C.hairD,0.55);g.lineWidth=0.4;g.beginPath();g.moveTo(hx+6.8,hy+1);g.quadraticCurveTo(hx+7.6,hy+7,hx+7,hy+11.4);g.stroke();
  g.restore();
  /* бант на макушке: в Истине рваный и висит набок */
  lmToysBow(g,-0.4+(T?1.2:0),Y(-36)+(T?0.6:0),T?0.82:0.92,C.bow,T?0.3+tilt+Math.sin(t*2.1+ph)*0.04*al:-0.04+tilt+Math.sin(t*2.1+ph)*0.05*al,T);
  /* контурный свет по голове и подолу */
  lmRim(g,q=>{q.strokeStyle='rgba(255,240,245,'+(T?0.22:0.35)+')';q.lineWidth=0.8;q.beginPath();q.ellipse(0.2,Y(-29.4),8.6,7.8,0,Math.PI*1.22,Math.PI*1.47);q.stroke();
    q.beginPath();q.moveTo(-4.4,Y(-18.4));q.quadraticCurveTo(-8.6,Y(-14.4),-10.4,Y(-9));q.stroke();});
  /* ---- ближняя рука с ножницами ---- */
  const hxA=lerp2(9.6-sw*1.2+Math.sin(t*1.3+ph*2)*0.5*al,12.4,e),hyA=lerp2(Y(-13.6)-bth*0.6+Math.sin(t*1.7+ph)*0.45*al,Y(-19.4),e)+(sn>0.1?Math.sin(t*40)*0.25*sn:0);
  const ang=lerp2(0.62,0.0,e)+tw2*0.12,dr=[Math.cos(ang),Math.sin(ang)];
  const op=lerp2(0.14,0.62,e)+(sn>0.3?Math.sin(t*30)*0.12*sn:0)+fg2*Math.abs(Math.sin(t*16))*0.3*(1-e);
  const hnd=[hxA,hyA];
  const nearLimb=lmLimb(g,4.8,Y(-20.4),hnd[0],hnd[1],T?7.2:5.6,T?7.6:5.8,true,T?2.2:2.7,T?1.1:1.9,C.skin);
  /* ножницы: кольца у ладони, лезвия вперёд */
  lmToysScissors(g,nearLimb[0]+dr[0]*4.3,nearLimb[1]+dr[1]*4.3,ang,op,T?11:9.6,T);
  /* кисть: ладошка и пальцы, обнимающие кольцо */
  if(T){g.fillStyle=shadeHex(C.skin,-0.05);g.beginPath();g.ellipse(nearLimb[0]+0.4,nearLimb[1]+0.2,1.5,1.2,ang,0,TAU);g.fill();
    g.strokeStyle='#bcaea6';g.lineWidth=0.75;g.lineCap='round';for(let q=-1;q<=2;q++){const ax=nearLimb[0]+0.8+q*0.2,ay=nearLimb[1]+q*0.9-0.4;g.beginPath();g.moveTo(ax,ay);g.quadraticCurveTo(ax+2.2,ay-0.8,ax+3.6+q*0.2,ay+0.6);g.stroke();}
    g.strokeStyle='#3a2a2e';g.lineWidth=0.3;g.beginPath();g.moveTo(nearLimb[0]-0.6,nearLimb[1]-1);g.lineTo(nearLimb[0]-0.5,nearLimb[1]+1.2);g.stroke();}
  else{g.beginPath();g.ellipse(nearLimb[0]+0.5,nearLimb[1]+0.1,1.7,1.5,ang,0,TAU);mobPath(g,C.skin,nearLimb[0],nearLimb[1]-0.5,1.8,true);
    g.strokeStyle=shadeHex(C.skin,-0.3);g.lineWidth=0.35;for(const q of [-0.6,0.2,1]){g.beginPath();g.moveTo(nearLimb[0]+1.2,nearLimb[1]+q-0.4);g.lineTo(nearLimb[0]+2.2,nearLimb[1]+q-0.2);g.stroke();}}
  /* пышный рукав с кружевной манжетой на плече */
  g.beginPath();g.ellipse(5.4,Y(-20.8),2.1,1.9,0.3,0,TAU);mobPath(g,shadeHex(C.dress,0.04),5.1,Y(-21.2),2.2);
  g.fillStyle=C.lace;g.beginPath();g.ellipse(5.6,Y(-19.3),1.7,0.6,0.3,0,TAU);g.fill();g.strokeStyle=hexA(C.dressD,0.6);g.lineWidth=0.3;g.stroke();
  g.beginPath();g.ellipse(-5.2,Y(-20.8),2,1.8,-0.3,0,TAU);mobPath(g,shadeHex(C.dress,-0.14),-5.4,Y(-21.2),2.1);
  g.fillStyle=shadeHex(C.lace,-0.14);g.beginPath();g.ellipse(-5.4,Y(-19.3),1.6,0.55,-0.3,0,TAU);g.fill();
  g.restore();
  if(frz&&Math.random()<0.02)spawnPart(m.x,m.y-m.h*0.9,0,-10,0.6,'rgba(255,255,255,.6)',1.4,0);
};
/* ---------- Чёрт из табакерки ---------- */
/* объёмная звезда: у каждого из 10 граней свой тон по направлению к свету (сверху-слева) */
function lmToysStar(g,x,y,r,c,rot,noLine){
  rot=rot||0;const P=[],I=[];
  for(let i=0;i<5;i++){const a=rot-Math.PI/2+i*TAU/5,b=a+TAU/10;P.push([x+Math.cos(a)*r,y+Math.sin(a)*r]);I.push([x+Math.cos(b)*r*0.46,y+Math.sin(b)*r*0.46]);}
  g.beginPath();for(let i=0;i<5;i++){g.lineTo(P[i][0],P[i][1]);g.lineTo(I[i][0],I[i][1]);}g.closePath();g.fillStyle=shadeHex(c,-0.3);g.fill();
  const face=(a,b)=>{const mx=(a[0]+b[0])/2-x,my=(a[1]+b[1])/2-y,l=Math.hypot(mx,my)||1,f=(-mx-my)/l*0.7071;
    g.beginPath();g.moveTo(x,y);g.lineTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.closePath();g.fillStyle=shadeHex(c,f*0.34-0.02);g.fill();};
  for(let i=0;i<5;i++){face(I[(i+4)%5],P[i]);face(P[i],I[i]);}
  if(!noLine){g.strokeStyle=mobLine(c);g.lineWidth=Math.max(0.3,r*0.07);g.lineJoin='round';g.beginPath();for(let i=0;i<5;i++){g.lineTo(P[i][0],P[i][1]);g.lineTo(I[i][0],I[i][1]);}g.closePath();g.stroke();}
}
/* точки кривой Безье */
function lmToysBez(p0,p1,p2,p3,n){const o=[];for(let i=0;i<=n;i++){const f=i/n,u=1-f;o.push([u*u*u*p0[0]+3*u*u*f*p1[0]+3*u*f*f*p2[0]+f*f*f*p3[0],u*u*u*p0[1]+3*u*u*f*p1[1]+3*u*f*f*p2[1]+f*f*f*p3[1]]);}return o;}
/* пружина вдоль кривой: витки-эллипсы, задние дуги темнее и рисуются первыми, передние яркие с бликом */
function lmToysCoil(g,pts,w,n,T){
  const cum=[0];for(let i=1;i<pts.length;i++)cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));
  const L=cum[cum.length-1];if(L<0.5)return;
  const at=(s)=>{let i=1;while(i<pts.length-1&&cum[i]<s)i++;const f=(s-cum[i-1])/Math.max(1e-6,cum[i]-cum[i-1]),a=pts[i-1],b=pts[i];return [a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f,Math.atan2(b[1]-a[1],b[0]-a[0])];};
  const ry=Math.max(1.0,L/n*0.34),loops=[];
  for(let j=0;j<n;j++){const q=at(L*(j+0.5)/n);let ph=q[2]+Math.PI/2;if(Math.cos(ph)<0)ph+=Math.PI;loops.push([q[0],q[1],ph]);}
  const dk=T?'#2a2630':'#3e4252',md=T?'#8a8590':'#b4bac8',lt=T?'#c8c0c0':'#f8fbff';
  g.lineCap='round';
  for(const [x,y,ph] of loops){g.save();g.translate(x,y);g.rotate(ph);g.strokeStyle=shadeHex(dk,-0.2);g.lineWidth=1.9;g.beginPath();g.ellipse(0,0,w,ry,0,Math.PI,TAU);g.stroke();g.strokeStyle=shadeHex(md,-0.35);g.lineWidth=1.15;g.beginPath();g.ellipse(0,0,w,ry,0,Math.PI,TAU);g.stroke();g.restore();}
  for(const [x,y,ph] of loops){g.save();g.translate(x,y);g.rotate(ph);
    g.strokeStyle=dk;g.lineWidth=2.6;g.beginPath();g.ellipse(0,0,w,ry,0,0,Math.PI);g.stroke();
    g.strokeStyle=md;g.lineWidth=1.8;g.beginPath();g.ellipse(0,0,w,ry,0,0,Math.PI);g.stroke();
    g.strokeStyle=lt;g.lineWidth=0.6;g.beginPath();g.ellipse(0,-0.1,w*0.94,ry*0.9,0,Math.PI*0.52,Math.PI*0.97);g.stroke();
    if(T){g.fillStyle='rgba(120,40,16,.75)';g.beginPath();g.ellipse(w*0.3,ry*0.55,1.1,0.55,0,0,TAU);g.fill();}
    g.restore();}
}
/* шея-червь Истины: кольца двух цветов, три тона по цилиндру, швы, влажные блики, жилки */
function lmToysWorm(g,pts,w0,w1,t,rim){
  const n=pts.length;if(n<2)return;
  const nr=[],ws=[],cum=[0];
  for(let i=0;i<n;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)];let tx=b[0]-a[0],ty=b[1]-a[1];const l=Math.hypot(tx,ty)||1;nr.push([-ty/l,tx/l]);ws.push((w0+(w1-w0)*i/(n-1))*(1+0.07*Math.sin(t*2.8-i*0.5)));if(i)cum.push(cum[i-1]+Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]));}
  const dl=(i)=>nr[i][0]*-0.6+nr[i][1]*-0.8;
  const pt=(i,off,k)=>[pts[i][0]+nr[i][0]*(off*ws[i]*dl(i)+k*ws[i]),pts[i][1]+nr[i][1]*(off*ws[i]*dl(i)+k*ws[i])];
  const quad=(i,off,k)=>{const a=pt(i,off,k),b=pt(i+1,off,k),c=pt(i+1,off,-k),d=pt(i,off,-k);g.beginPath();g.moveTo(a[0],a[1]);g.lineTo(b[0],b[1]);g.lineTo(c[0],c[1]);g.lineTo(d[0],d[1]);g.closePath();g.fill();};
  /* тёмный контур под всем */
  g.strokeStyle='#160a1c';g.lineJoin='round';g.lineCap='round';
  {let wa=0;for(let i=0;i<n;i++)wa+=ws[i];g.lineWidth=wa/n*2+1.6;g.beginPath();for(let i=0;i<n;i++)g.lineTo(pts[i][0],pts[i][1]);g.stroke();}
  const PU='#7c44b6',GR='#4cb888';
  for(let i=0;i<n-1;i++){
    const j=Math.floor((cum[i]+cum[i+1])*0.5/6.5),c=j%2?PU:GR;
    g.fillStyle=shadeHex(c,-0.42);quad(i,0,1.02);
    g.fillStyle=shadeHex(c,-0.06);quad(i,0.3,0.8);
    g.fillStyle=shadeHex(c,j%2?0.34:0.16);quad(i,0.62,0.32);
  }
  /* швы между кольцами */
  g.lineWidth=0.5;g.lineCap='butt';
  let pj=-1;
  for(let i=0;i<n-1;i++){const j=Math.floor((cum[i]+cum[i+1])*0.5/6.5);if(j!==pj&&i>0){const a=pt(i,0,1),b=pt(i,0,-1),mx=(a[0]+b[0])/2+nr[i][0]*ws[i]*0.18,my=(a[1]+b[1])/2+nr[i][1]*ws[i]*0.18;
      g.strokeStyle='rgba(20,6,26,.8)';g.beginPath();g.moveTo(a[0],a[1]);g.quadraticCurveTo(mx,my,b[0],b[1]);g.stroke();}pj=j;}
  /* влажные блики, жилки и язвы */
  for(let i=1;i<n-1;i+=2){const p=pt(i,1.0,0.6);g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.ellipse(p[0],p[1],ws[i]*0.2,ws[i]*0.1,0.5,0,TAU);g.fill();}
  for(let i=2;i<n-2;i+=4){const p=pt(i,-0.4,-0.1);g.fillStyle='rgba(130,12,26,.85)';g.beginPath();g.arc(p[0],p[1],0.65,0,TAU);g.fill();g.fillStyle='rgba(255,150,150,.7)';g.fillRect(p[0]-0.3,p[1]-0.3,0.35,0.35);}
  g.strokeStyle='rgba(150,16,32,.7)';g.lineWidth=0.35;g.beginPath();for(let i=0;i<n;i++){const p=pt(i,-0.6,0.5+Math.sin(i*1.3)*0.12);if(i)g.lineTo(p[0],p[1]);else g.moveTo(p[0],p[1]);}g.stroke();
}
/* шея-пружина или червь — по списку точек от основания к голове */
function lmToysNeck(g,pts,T,wBase,wTop,t,pitch){
  if(T)lmToysWorm(g,pts,wBase,wTop,t);
  else{let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);lmToysCoil(g,pts,(wBase+wTop)*0.5,Math.max(3,Math.round(L/(pitch||2.9))),false);}
}
/* голова клоуна: центр головы в (x,y); op — раскрытие рта (0..1), tilt — наклон; T — Истина */
function lmToysClown(g,m,x,y,t,T,op,tilt,eyeOpen){
  g.save();g.translate(x,y);g.rotate(tilt||0);
  const bl=Math.sin(m.anim*1.1+m.phase*7)>0.985;
  const hairL=T?'#3c9a6c':'#f4603c',hairR=T?'#6a3a8e':'#38b88a',skin=T?'#d6d0c4':'#fff4ec',lx=(m.lookX||0)*0.5;
  /* волосы-пучки за головой: два пышных облака разного размера */
  for(const [sd,col] of [[-1,hairL],[1,hairR]]){
    g.save();g.translate(sd*5,-1);g.rotate(Math.sin(t*3.1+sd*1.3)*0.07+Math.sin(t*5.3+sd)*0.03);g.translate(-sd*5,1);
    const bs=sd<0?[[-7.4,-2.6,3.6],[-8.6,0.8,3.2],[-6.4,2.8,2.8],[-5.6,-4.6,2.6]]:[[7.4,-2.6,3.6],[8.8,0.6,3],[6.6,2.8,2.7],[5.8,-4.8,2.5]];
    for(const [bx,by,br] of bs){g.beginPath();g.arc(bx,by,br,0,TAU);mobPath(g,shadeHex(col,-0.08),bx-br*0.3,by-br*0.4,br*1.1);}
    g.strokeStyle=hexA(shadeHex(col,-0.4),0.55);g.lineWidth=0.4;for(const [bx,by,br] of bs){g.beginPath();g.arc(bx+br*0.1,by+br*0.1,br*0.5,Math.PI*0.2,Math.PI*1.35);g.stroke();}
    for(const [bx,by,br] of bs.slice(0,2)){g.strokeStyle=hexA(shadeHex(col,0.5),0.7);g.lineWidth=0.5;g.beginPath();g.arc(bx,by,br*0.7,Math.PI*1.1,Math.PI*1.6);g.stroke();}
    if(T){g.strokeStyle=shadeHex(col,-0.45);g.lineWidth=0.5;g.lineCap='round';for(const [bx,by,l] of bs.slice(1,4)){g.beginPath();g.moveTo(bx+sd*0.6,by+2);g.quadraticCurveTo(bx+sd*1.8,by+2+l,bx+sd*0.8,by+3+l*2.2);g.stroke();}}
    g.restore();
  }
  /* гофрированный воротник: цветные скалопы */
  {const cols=T?['#9a5a4a','#6a7a5a','#7a4a6a','#8a7a4a']:['#ff7a50','#ffd040','#50c8a0','#7a82f0'];
    for(let i=0;i<9;i++){const a=Math.PI*(0.05+i*0.1125),cx2=Math.cos(a)*6.2,cy2=7+Math.sin(a)*2.1;
      g.beginPath();g.ellipse(cx2,cy2+1,2.1,1.9,0,0,TAU);mobPath(g,cols[i%4],cx2-0.5,cy2,2.2,true);g.strokeStyle=mobLine(cols[i%4]);g.lineWidth=0.5;g.stroke();}
    g.beginPath();g.ellipse(0,7.8,6.4,2,0,0,Math.PI);g.lineTo(-6.4,7.4);g.closePath();mobPath(g,T?'#8a5a4a':'#ff6e8e',0,8,6.4,true);
    if(T){g.fillStyle='#120608';for(const px of [-4,-1.2,3.4]){g.beginPath();g.moveTo(px,8.6);g.lineTo(px+0.8,10.2);g.lineTo(px+1.4,8.6);g.fill();}}}
  /* голова */
  const hpath=()=>{g.beginPath();g.moveTo(-6.8,0);g.bezierCurveTo(-7,-5.4,-3.6,-7.4,0,-7.4);g.bezierCurveTo(3.8,-7.4,7,-5.4,6.8,0);g.bezierCurveTo(6.6,4.6,3.4,7.6,0,7.6);g.bezierCurveTo(-3.4,7.6,-6.6,4.6,-6.8,0);g.closePath();};
  hpath();
  lmToysSoft(g,skin,0,0,7.4,T?'#4a5a4a':'#e0889a');
  /* уши */
  g.fillStyle=shadeHex(skin,-0.1);g.beginPath();g.ellipse(-6.8,0.6,1,1.6,0,0,TAU);g.ellipse(6.8,0.6,1,1.6,0,0,TAU);g.fill();
  /* нос-шар */
  g.beginPath();g.arc(1.8,1.4,2.1,0,TAU);mobPath(g,T?'#b02a34':'#f02a3c',1.2,0.6,2.2);
  g.fillStyle='rgba(255,255,255,.8)';g.beginPath();g.ellipse(1.1,0.7,0.7,0.45,-0.5,0,TAU);g.fill();
  if(T){g.strokeStyle='#2a0608';g.lineWidth=0.4;g.beginPath();g.moveTo(1.4,-0.6);g.lineTo(2.2,0.6);g.lineTo(1.6,1.6);g.lineTo(2.4,2.8);g.stroke();}
  if(!T){
    /* румянец, голубые ромбики, брови, глаза */
    g.fillStyle='rgba(255,96,120,.6)';g.beginPath();g.arc(-4.8,2.8,1.5,0,TAU);g.arc(6.1,2.6,1.4,0,TAU);g.fill();
    g.fillStyle='#3a6ae0';for(const [dx,dy] of [[-2.6,-4.8],[4.2,-5]]){g.beginPath();g.moveTo(dx,dy-1.5);g.lineTo(dx+1,dy);g.lineTo(dx,dy+1.5);g.lineTo(dx-1,dy);g.closePath();g.fill();}
    g.strokeStyle='#4a2a8a';g.lineWidth=0.55;g.lineCap='round';g.beginPath();g.moveTo(-4.8,-3.2);g.quadraticCurveTo(-2.8,-4.4,-0.8,-3.2);g.moveTo(1.6,-3.6);g.quadraticCurveTo(3.6,-4.8,5.6,-3.6);g.stroke();
    for(const [ex,ey] of [[-2.6,-1.4],[3.8,-1.6]]){
      if(eyeOpen&&!bl){g.fillStyle='#fffdf8';g.beginPath();g.ellipse(ex,ey,1.9,2.2,0,0,TAU);g.fill();g.strokeStyle='#3a1a4a';g.lineWidth=0.5;g.stroke();g.fillStyle='#ffc020';g.beginPath();g.arc(ex+lx,ey+0.1,1.1,0,TAU);g.fill();g.fillStyle='#14081c';g.beginPath();g.arc(ex+lx,ey+0.1,0.55,0,TAU);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(ex+lx-0.4,ey-0.4,0.3,0,TAU);g.fill();}
      else{g.strokeStyle='#2a1636';g.lineWidth=0.85;g.beginPath();g.arc(ex,ey+0.8,1.9,Math.PI*1.12,Math.PI*1.88);g.stroke();g.lineWidth=0.4;g.beginPath();g.moveTo(ex+1.7,ey-0.6);g.lineTo(ex+2.5,ey-1.1);g.stroke();}}
    /* рот: красная улыбка до щёк; при op — раскрыт, с зубами */
    const oh=op*3.2;
    g.beginPath();g.moveTo(-5.4,2.8);g.quadraticCurveTo(0.4,4+oh*2,6.2,2.6);g.quadraticCurveTo(0.6,4.2+oh*1.2,-5.4,2.8);g.closePath();
    if(op>0.08){g.fillStyle='#8a0a24';g.fill();g.beginPath();g.moveTo(-5,3);g.quadraticCurveTo(0.4,5.6+oh*2.2,5.8,2.8);g.quadraticCurveTo(0.6,3.6,-5,3);g.closePath();g.fillStyle='#5a0418';g.fill();
      g.fillStyle='#fffdf6';g.beginPath();g.moveTo(-3.8,3.2);g.quadraticCurveTo(0.4,3.9,4.4,3.1);g.lineTo(4.2,4.2);g.quadraticCurveTo(0.4,4.9,-3.6,4.3);g.closePath();g.fill();}
    else{g.fillStyle='#e8202e';g.fill();g.strokeStyle='#a01020';g.lineWidth=0.4;g.stroke();g.fillStyle='#fffdf6';g.beginPath();g.moveTo(-3.6,3.2);g.quadraticCurveTo(0.4,4.2,4.6,3.1);g.lineTo(4.6,3.6);g.quadraticCurveTo(0.4,4.9,-3.6,3.8);g.closePath();g.fill();}
    g.strokeStyle='#a01020';g.lineWidth=0.5;g.beginPath();g.moveTo(-5.4,2.8);g.quadraticCurveTo(-6.2,2.4,-6.2,1.6);g.moveTo(6.2,2.6);g.quadraticCurveTo(7,2.2,7,1.4);g.stroke();
    g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=0.6;g.beginPath();g.ellipse(0,0,6.3,6.5,0,Math.PI*1.18,Math.PI*1.42);g.stroke();
  }else{
    /* ИСТИНА: потёкший грим, трещины, чёрные глазницы, пасть до ушей с иглами */
    g.save();hpath();g.clip();
    g.fillStyle='rgba(90,110,86,.32)';g.beginPath();g.ellipse(-4,-4,4,3,0.4,0,TAU);g.ellipse(4.6,3.6,3,3.6,0,0,TAU);g.fill();
    g.fillStyle='rgba(30,8,18,.7)';
    /* чёрные слёзы-потёки грима из глазниц */
    for(const [dx,w2,l] of [[-3.2,1.0,8.4],[3.8,0.9,7.6],[-1.2,0.55,5.2]]){g.beginPath();g.moveTo(dx-w2,-1);g.quadraticCurveTo(dx-w2*1.5,3,dx-0.2,l);g.quadraticCurveTo(dx+w2*1.5,3,dx+w2,-1);g.closePath();g.fill();}
    g.restore();
    /* глазницы: чёрные провалы, в них мелкие мутные глаза с красной точкой; правый глаз ниже и мельче */
    for(const [ex,ey,rx,ry] of [[-2.8,-1.8,2.5,3],[4,-1.3,2.1,2.5]]){
      g.fillStyle='#07020a';g.beginPath();g.ellipse(ex,ey,rx+1.2,ry+1.3,0.1,0,TAU);g.fill();
      g.fillStyle='#d8d49a';g.beginPath();g.ellipse(ex+lx*0.3,ey+0.2,rx*0.74,ry*0.7,0,0,TAU);g.fill();
      g.strokeStyle='rgba(190,20,30,.8)';g.lineWidth=0.28;for(let q=0;q<6;q++){const a=q*1.1+ex;g.beginPath();g.moveTo(ex+Math.cos(a)*rx*0.74,ey+0.2+Math.sin(a)*ry*0.7);g.lineTo(ex+Math.cos(a)*rx*0.3,ey+0.2+Math.sin(a)*ry*0.3);g.stroke();}
      mobGlow(g,ex+lx,ey+0.2,3.4,'#ff2020',0.5);g.fillStyle='#c01020';g.beginPath();g.arc(ex+lx,ey+0.2,0.95,0,TAU);g.fill();g.fillStyle='#0a0204';g.beginPath();g.ellipse(ex+lx,ey+0.2,0.28,0.85,0,0,TAU);g.fill();
      g.strokeStyle='rgba(255,255,255,.28)';g.lineWidth=0.35;g.beginPath();g.ellipse(ex,ey,rx+1,ry+1.1,0.1,Math.PI*1.05,Math.PI*1.5);g.stroke();}
    /* трещины фарфора и облупившийся грим */
    g.strokeStyle='#241216';g.lineWidth=0.5;g.lineJoin='round';g.beginPath();g.moveTo(-1,-7.2);g.lineTo(-0.2,-5);g.lineTo(-1.4,-3.6);g.lineTo(-0.6,-2);g.moveTo(5.4,-6);g.lineTo(4.8,-4.4);g.lineTo(6,-3);g.stroke();
    g.fillStyle='#8a948a';g.beginPath();g.moveTo(-5,-4);g.quadraticCurveTo(-3,-6.4,-1.6,-5.4);g.lineTo(-2.6,-3.4);g.closePath();g.fill();
    /* пасть: от уха до уха, два ряда игл, красная глотка */
    const oh=0.6+op*3.4;
    g.beginPath();g.moveTo(-6.6,1.8);g.quadraticCurveTo(0.2,5+oh*0.4,7.2,1.2);g.quadraticCurveTo(0.6,3.4+oh*2.4,-6.6,1.8);g.closePath();
    g.fillStyle='#1a0408';g.fill();
    g.save();g.clip();g.fillStyle='#7a0a1a';g.beginPath();g.ellipse(0.4,4+oh,4.4,oh*0.9+0.6,0,0,TAU);g.fill();
    if(op>0.2){mobGlow(g,0.4,4+oh,6,'#ff2030',0.4*op);g.fillStyle='#d03a4a';g.beginPath();g.ellipse(1,4.2+oh*1.3,2.4,oh*0.5+0.4,0,0,TAU);g.fill();}
    g.restore();
    g.fillStyle='#f2ecd2';
    for(let i=0;i<10;i++){const f=i/9,bx=-6+f*12.8,by=1.8+Math.sin(f*Math.PI)*(1.2+oh*0.35)*0.9-f*0.6,hh=1.4+((i*7)%3)*0.5;g.beginPath();g.moveTo(bx-0.55,by);g.lineTo(bx,by+hh);g.lineTo(bx+0.55,by);g.fill();}
    for(let i=0;i<9;i++){const f=(i+0.5)/9,bx=-5.6+f*12.2,by=3.4+Math.sin(f*Math.PI)*(1.8+oh*1.2)-f*1.2,hh=1.2+((i*5)%3)*0.5;g.beginPath();g.moveTo(bx-0.5,by);g.lineTo(bx,by-hh);g.lineTo(bx+0.5,by);g.fill();}
    g.strokeStyle='#2a0a10';g.lineWidth=0.5;g.beginPath();g.moveTo(-6.6,1.8);g.quadraticCurveTo(0.2,5+oh*0.4,7.2,1.2);g.stroke();
    /* швы в уголках рта */
    g.lineWidth=0.4;for(let i=0;i<3;i++){g.beginPath();g.moveTo(-6.8+i*0.2,0.6+i*0.9);g.lineTo(-5.6+i*0.2,1.2+i*0.9);g.moveTo(7.4-i*0.2,0+i*0.9);g.lineTo(6.2-i*0.2,0.6+i*0.9);g.stroke();}
    /* слюна */
    g.strokeStyle='rgba(210,200,170,.75)';g.lineWidth=0.4;g.beginPath();g.moveTo(-1.6,5.4+oh*0.3);g.lineTo(-1.7,7.4+oh*0.6+Math.sin(t*3)*0.4);g.moveTo(3.2,5+oh*0.3);g.lineTo(3.1,6.6+oh*0.5);g.stroke();
    g.fillStyle='rgba(220,210,180,.8)';g.beginPath();g.arc(-1.7,7.7+oh*0.6+Math.sin(t*3)*0.4,0.5,0,TAU);g.fill();
    g.strokeStyle='rgba(255,255,255,.3)';g.lineWidth=0.5;g.beginPath();g.ellipse(0,0,6.3,6.5,0,Math.PI*1.18,Math.PI*1.42);g.stroke();
  }
  /* колпак: наклонён, у Истины рваный и поникший */
  g.beginPath();g.moveTo(-5.2,-5.6);
  if(T){g.quadraticCurveTo(-5,-11,-8,-15.4);g.quadraticCurveTo(-2,-14.6,1.4,-12.4);g.lineTo(5.4,-6);}
  else{g.quadraticCurveTo(-3,-12,2.4,-18);g.quadraticCurveTo(4.6,-12,5.2,-6);}
  g.quadraticCurveTo(0,-4.6,-5.2,-5.6);g.closePath();
  mobPath(g,T?'#5e3a80':'#8a4ab8',-1.6,-11,8);
  g.save();g.clip();
  /* полосы и звёзды на колпаке */
  g.strokeStyle=hexA(T?'#8a6aa8':'#c8a0f0',0.6);g.lineWidth=0.7;for(let i=0;i<3;i++){g.beginPath();g.moveTo(-5.4,-6.6-i*3.2);g.quadraticCurveTo(0,-5.4-i*3.2-0.6,5.6,-6.8-i*3.2);g.stroke();}
  g.fillStyle=T?'#a8903a':'#ffd040';for(const [sx,sy] of [[-1.4,-9],[1.6,-12.2]]){g.beginPath();for(let i=0;i<10;i++){const a=i/10*TAU-Math.PI/2,rr=i%2?0.5:1.4;g.lineTo(sx+Math.cos(a)*rr,sy+Math.sin(a)*rr);}g.closePath();g.fill();}
  g.restore();
  /* кольцо-ободок и помпон */
  g.beginPath();g.ellipse(0,-5.1,5.3,1.15,-0.05,0,TAU);mobPath(g,T?'#8a7a3a':'#ffd040',0,-5.6,5.6,true);g.strokeStyle=mobLine(T?'#8a7a3a':'#ffd040');g.lineWidth=0.5;g.stroke();
  if(T){g.strokeStyle='#d8c8a0';g.lineWidth=0.4;g.beginPath();g.moveTo(-8,-15.4);g.quadraticCurveTo(-9.4,-12,-8.8,-9);g.stroke();g.beginPath();g.arc(-8.8,-8,1.6,0,TAU);mobPath(g,'#a8903a',-9.2,-8.4,1.8);
    g.fillStyle='#120608';g.beginPath();g.moveTo(-3.6,-9);g.lineTo(-2.2,-7.4);g.lineTo(-3.8,-6.8);g.closePath();g.fill();}
  else{g.beginPath();g.arc(2.4,-18,2.3,0,TAU);mobPath(g,'#ffd040',1.7,-18.8,2.4);g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.arc(1.6,-18.8,0.6,0,TAU);g.fill();}
  lmRim(g,q=>{q.strokeStyle='rgba(255,236,255,.45)';q.lineWidth=0.8;q.beginPath();q.moveTo(-5.2,-5.6);q.quadraticCurveTo(-3.4,-12,T?-8:2,T?-15:-17.6);q.stroke();});
  g.restore();
}
/* ---- табакерка: коробка, крышка, ноты, модель ---- */
const lmToysD=[6,-4.5];   /* уход вглубь коробки на экране */
/* заклёпка с бликом */
function lmToysRivet(g,x,y,r,c){g.beginPath();g.arc(x,y,r,0,TAU);mobPath(g,c,x-r*0.3,y-r*0.3,r*1.1,true);g.strokeStyle=hexA(shadeHex(c,-0.6),0.8);g.lineWidth=0.25;g.stroke();}
/* золотая рамка: тень, металл, блик по верху-слева; прямоугольник (x,y,w,h) в текущих координатах */
function lmToysFrame(g,x,y,w,h,lw,gold,T){
  g.lineJoin='miter';
  g.strokeStyle=shadeHex(gold,-0.55);g.lineWidth=lw+0.5;g.strokeRect(x,y,w,h);
  g.strokeStyle=gold;g.lineWidth=lw;g.strokeRect(x,y,w,h);
  g.strokeStyle=shadeHex(gold,0.5);g.lineWidth=lw*0.3;g.beginPath();g.moveTo(x+w-0.3,y+lw*0.2);g.lineTo(x+lw*0.2,y+lw*0.2);g.lineTo(x+lw*0.2,y+h-0.3);g.stroke();
  g.strokeStyle=shadeHex(gold,-0.4);g.lineWidth=lw*0.3;g.beginPath();g.moveTo(x+w-lw*0.2,y+0.3);g.lineTo(x+w-lw*0.2,y+h-lw*0.2);g.lineTo(x+0.3,y+h-lw*0.2);g.stroke();
}
/* нота: головка, штиль, хвостик */
function lmToysNote(g,x,y,s,c,a){
  g.save();g.translate(x,y);g.scale(s,s);g.globalAlpha*=a;
  g.strokeStyle='#20102a';g.lineWidth=1.9;g.lineCap='round';g.beginPath();g.moveTo(1.7,0);g.lineTo(1.7,-6.4);g.quadraticCurveTo(3.8,-5.4,3.6,-3);g.stroke();
  g.strokeStyle=c;g.lineWidth=0.95;g.beginPath();g.moveTo(1.7,0);g.lineTo(1.7,-6.4);g.quadraticCurveTo(3.8,-5.4,3.6,-3);g.stroke();
  g.beginPath();g.ellipse(0,0.3,2.1,1.5,-0.4,0,TAU);g.fillStyle='#20102a';g.fill();g.beginPath();g.ellipse(0,0.3,1.7,1.15,-0.4,0,TAU);g.fillStyle=c;g.fill();
  g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.ellipse(-0.6,-0.1,0.6,0.3,-0.5,0,TAU);g.fill();
  g.restore();
}
/* зубы по краю в локальных координатах панели (u вдоль, w вглубь): направление dir=+1 к +w */
function lmToysRimTeeth(g,u0,u1,w,n,h,dir,seed){
  const st=(u1-u0)/n;
  for(let i=0;i<n;i++){const hh=h*(0.55+0.45*Math.abs(Math.sin(seed+i*1.9))),x=u0+i*st;
    g.beginPath();g.moveTo(x,w);g.lineTo(x+st*0.5+Math.sin(seed*2+i)*0.4,w+dir*hh);g.lineTo(x+st,w);g.closePath();g.fillStyle='#e6dcc0';g.fill();
    g.beginPath();g.moveTo(x+st*0.5,w);g.lineTo(x+st*0.5+Math.sin(seed*2+i)*0.4,w+dir*hh);g.lineTo(x+st,w);g.closePath();g.fillStyle='#a89c7c';g.fill();
    g.strokeStyle='rgba(30,10,16,.8)';g.lineWidth=0.22;g.beginPath();g.moveTo(x,w);g.lineTo(x+st*0.5+Math.sin(seed*2+i)*0.4,w+dir*hh);g.lineTo(x+st,w);g.stroke();}
}
/* крышка: панель 21×17 на шарнире по левому верхнему ребру коробки; a — угол раскрытия (рад) */
function lmToysLid(g,T,a,ax,ay,BC,t,wob){
  const L=21,D=17,vx=Math.cos(a)*L,vy=-Math.sin(a)*L,dx=lmToysD[0],dy=lmToysD[1];
  /* толщина: наружная оболочка выглядывает с тыла */
  g.save();g.translate(-1.6,0.5);g.beginPath();g.moveTo(ax,ay);g.lineTo(ax+dx,ay+dy);g.lineTo(ax+dx+vx,ay+dy+vy);g.lineTo(ax+vx,ay+vy);g.closePath();
  mobPath(g,shadeHex(BC,-0.3),ax+vx*0.5,ay+vy*0.5,12);g.restore();
  g.save();g.transform(vx/L,vy/L,dx/D,dy/D,ax,ay);
  /* контур панели; у Истины свободный конец рваный */
  g.beginPath();
  if(T){g.moveTo(0,0);g.lineTo(18.6,0);g.lineTo(20.4,2.4);g.lineTo(18,4.6);g.lineTo(21,7.4);g.lineTo(18.8,9.6);g.lineTo(20.2,12.6);g.lineTo(17.6,14.6);g.lineTo(19,17);g.lineTo(0,17);g.closePath();}
  else{g.moveTo(1,0);g.lineTo(L-1,0);g.quadraticCurveTo(L,0,L,1);g.lineTo(L,D-1);g.quadraticCurveTo(L,D,L-1,D);g.lineTo(1,D);g.quadraticCurveTo(0,D,0,D-1);g.lineTo(0,1);g.quadraticCurveTo(0,0,1,0);g.closePath();}
  const lin=T?'#5a3a6c':'#cdaef0';
  mobPath(g,lin,5,4,16,true);
  g.save();g.clip();
  /* ромбовая обивка */
  g.strokeStyle=T?'rgba(20,6,26,.22)':'rgba(120,70,180,.42)';g.lineWidth=T?0.35:0.5;
  if(!T)for(let i=-4;i<9;i++){g.beginPath();g.moveTo(i*4,0);g.lineTo(i*4+D,D);g.moveTo(i*4+D,0);g.lineTo(i*4,D);g.stroke();}
  g.fillStyle=T?'rgba(150,110,170,.35)':'rgba(255,255,255,.75)';for(let i=0;i<5;i++)for(let j=0;j<4;j++){g.beginPath();g.arc(2+i*4+(j%2)*2,2+j*4.2,0.35,0,TAU);g.fill();}
  if(T){
    /* пятна гнили и три глубокие борозды когтей */
    g.fillStyle='rgba(90,20,30,.38)';g.beginPath();g.ellipse(14,12,4.6,3.2,0.4,0,TAU);g.fill();g.fillStyle='rgba(12,4,16,.35)';g.beginPath();g.ellipse(6,4,3.4,2.2,0,0,TAU);g.fill();
    g.strokeStyle='#120410';g.lineWidth=0.8;g.lineCap='round';for(let i=0;i<3;i++){g.beginPath();g.moveTo(5+i*2.2,1.4);g.lineTo(6.4+i*2.2,15.6);g.stroke();}
    g.strokeStyle='rgba(230,190,190,.55)';g.lineWidth=0.25;for(let i=0;i<3;i++){g.beginPath();g.moveTo(5.5+i*2.2,1.6);g.lineTo(6.9+i*2.2,15.4);g.stroke();}
    g.fillStyle='#e8dcc8';for(const [x,y,r] of [[3,8,1.5],[14.4,5.4,1.1],[11,2.6,0.9]]){g.beginPath();g.arc(x,y,r,0,TAU);g.arc(x+r*0.8,y+r*0.5,r*0.8,0,TAU);g.fill();}
    /* лоскут обивки висит */
    g.fillStyle='#5a3868';g.beginPath();g.moveTo(1,12);g.lineTo(6,12.6);g.lineTo(4.4,17);g.lineTo(1,17);g.closePath();g.fill();
  }else{
    lmToysStar(g,10.5,8.5,4.2,'#ffd040',0,false);
    for(const [x,y] of [[3.4,3.2],[17.6,13.8],[17.6,3.2],[3.4,13.8]])lmToysStar(g,x,y,1.4,'#ffd040',0.3,true);
  }
  g.restore();
  /* золотая кромка */
  g.strokeStyle='#20102a';g.lineWidth=T?1.5:2.0;if(T){g.setLineDash([9,2.4,5,3]);}g.stroke();g.setLineDash([]);
  g.strokeStyle=T?'#8a7440':'#ffd040';g.lineWidth=T?0.95:1.4;if(T)g.setLineDash([9,2.4,5,3]);g.stroke();g.setLineDash([]);
  g.restore();
  /* блик по верхнему краю панели */
  g.strokeStyle=T?'rgba(255,230,255,.25)':'rgba(255,255,255,.6)';g.lineWidth=0.6;g.beginPath();g.moveTo(ax+vx*0.9,ay+vy*0.9-0.2);g.lineTo(ax+vx*0.15,ay+vy*0.15-0.2);g.stroke();
}
/* коробка со звёздами: x,y — левый-верхний угол лицевой грани; возвращает ничего. stage: 'back' (до головы) / 'front' (после) */
function lmToysBoxBack(g,T,FY,BC,GOLD,t,tune){
  const fx=-13,ft=FY-18,dx=lmToysD[0],dy=lmToysD[1];
  /* верхняя грань: ободок и тёмный зев */
  g.save();g.transform(1,0,dx/17,dy/17,fx,ft);
  g.beginPath();g.rect(0,0,21,17);mobPath(g,shadeHex(BC,0.12),6,3,18,true);
  g.strokeStyle=T?'rgba(10,2,14,.5)':'rgba(255,255,255,.18)';g.lineWidth=0.4;for(const y of [4,8.5,13])for(let i=0;i<4;i++){g.beginPath();g.moveTo(1+i*5.2,y);g.lineTo(3+i*5.2,y+0.2);g.stroke();}
  /* зев */
  g.beginPath();g.rect(1.8,1.8,17.4,13.4);
  const gr=g.createLinearGradient(0,1.8,0,15.2);gr.addColorStop(0,T?'#1a0a22':'#3a1a56');gr.addColorStop(1,T?'#050106':'#120620');g.fillStyle=gr;g.fill();
  g.strokeStyle='rgba(8,2,12,.9)';g.lineWidth=0.6;g.stroke();
  /* внутренний свет: у Истины багровый */
  g.save();g.clip();
  const gl=g.createRadialGradient(10.5,8,0.5,10.5,8,11);
  if(T){gl.addColorStop(0,'rgba(190,20,40,'+(0.4+tune*0.35)+')');gl.addColorStop(1,'rgba(190,20,40,0)');}else{gl.addColorStop(0,'rgba(255,210,90,'+(0.32+tune*0.3)+')');gl.addColorStop(1,'rgba(255,210,90,0)');}
  g.fillStyle=gl;g.fillRect(1.8,1.8,17.4,13.4);
  /* ворс бархата по задней стенке */
  g.fillStyle=T?'rgba(110,20,36,.5)':'rgba(255,120,180,.28)';g.fillRect(1.8,1.8,17.4,2.4);
  g.restore();
  if(T){
    lmToysRimTeeth(g,2.4,18.6,1.8,9,2.8,1,1.3);   /* задние клыки */
    /* глаза в темноте зева */
    mobGlow(g,5.4,6,2.2,'#ff2030',0.45);mobGlow(g,15,9,2,'#ff2030',0.4);
    g.fillStyle='#ff4a50';for(const [x,y,r] of [[5,6,0.5],[6.4,6.2,0.5],[14.6,9,0.45],[15.8,9.1,0.45],[10,11.6,0.4]]){g.beginPath();g.arc(x,y,r,0,TAU);g.fill();}
  }
  g.restore();
  /* Истина: острые щепки по краям ободка */
  if(T){
    for(const [x,y,l,w,a] of [[-12.4,ft-0.4,5.2,1.6,-0.5],[-8.6,ft-2.6,3.6,1.3,0.2],[10.4,ft-3.8,5.8,1.7,0.5],[12.6,ft-3.6,3.6,1.2,-0.1]]){
      g.save();g.translate(x,y);g.rotate(a);g.beginPath();g.moveTo(-w,0.6);g.lineTo(-w*0.2,-l);g.lineTo(w,0.6);g.closePath();mobPath(g,'#8a6a46',0,-l*0.4,l,false);
      g.strokeStyle='rgba(30,16,10,.7)';g.lineWidth=0.3;g.beginPath();g.moveTo(-w*0.4,0);g.lineTo(-w*0.1,-l*0.7);g.stroke();g.restore();}
  }
}
function lmToysBoxFront(g,T,FY,BC,GOLD,t,tune,crank,m){
  const fx=-13,ft=FY-18,dx=lmToysD[0],dy=lmToysD[1];
  /* передний ободок над лицевой гранью */
  g.save();g.transform(1,0,dx/17,dy/17,fx,ft);
  g.beginPath();g.rect(0,15.2,21,1.8);mobPath(g,shadeHex(BC,0.1),6,16,10,true);
  if(T){lmToysRimTeeth(g,2.6,18.4,15.2,8,2.4,-1,2.4);}
  g.restore();
  /* правая грань: тень, золотая рамка, звезда */
  const sBC=shadeHex(BC,-0.28);
  g.beginPath();g.moveTo(8,ft);g.lineTo(8+dx,ft+dy);g.lineTo(8+dx,FY+dy);g.lineTo(8,FY);g.closePath();mobPath(g,sBC,10,FY-12,14,false);
  g.save();g.transform(dx/17,dy/17,0,1,8,ft);
  lmToysFrame(g,1.6,1.6,14,14.8,1.0,T?'#7a6638':GOLD,T);
  if(!T){}
  else{
    /* лицевая сторона рваная: тёмная дыра, края щепой, внутри глаза и бледные пальцы */
    g.beginPath();g.moveTo(5,7);g.lineTo(7.6,5.6);g.lineTo(10,8);g.lineTo(13.6,6.4);g.lineTo(15.4,11);g.lineTo(13,13.6);g.lineTo(14.6,16.8);g.lineTo(3,16.8);g.lineTo(4.4,12);g.lineTo(2.6,9.4);g.closePath();
    g.fillStyle='#060108';g.fill();g.strokeStyle='#7a5a3a';g.lineWidth=0.7;g.lineJoin='round';g.stroke();
    mobGlow(g,7.4,11,3,'#ff2030',0.55);mobGlow(g,11.6,12.4,2.4,'#ff2030',0.45);
    g.fillStyle='#ff5a5a';for(const [x,y,r] of [[6.4,11,0.7],[8.2,11,0.7],[11,12.6,0.55],[12.4,12.6,0.55],[9.4,14.6,0.4]]){g.beginPath();g.arc(x,y,r,0,TAU);g.fill();}
    g.fillStyle='#10020a';for(const [x,y] of [[6.4,11],[8.2,11],[11,12.6],[12.4,12.6]]){g.beginPath();g.ellipse(x+0.1,y,0.2,0.5,0,0,TAU);g.fill();}
  }
  g.restore();
  if(!T){g.save();g.translate(8+dx*0.5,ft+dy*0.5+9);g.scale(0.62,1);lmToysStar(g,0,0,3.4,'#ffd040',0,false);g.restore();}
  /* лицевая грань */
  const fT=FY-18;
  g.beginPath();g.rect(fx,fT,21,18);mobPath(g,BC,-6,FY-12,17,false);
  g.save();g.beginPath();g.rect(fx,fT,21,18);g.clip();
  /* доски: волокно */
  g.strokeStyle=T?'rgba(8,2,12,.4)':'rgba(40,10,70,.22)';g.lineWidth=0.35;
  for(let i=0;i<9;i++){const x=fx+1.2+i*2.4;g.beginPath();g.moveTo(x,fT);g.quadraticCurveTo(x+0.5,FY-9,x-0.2,FY);g.stroke();}
  g.strokeStyle=T?'rgba(8,2,12,.55)':'rgba(40,10,70,.35)';g.lineWidth=0.5;g.beginPath();g.moveTo(fx,FY-6);g.lineTo(fx+21,FY-6.3);g.stroke();
  /* глянец сверху-слева */
  g.fillStyle=T?'rgba(220,190,255,.08)':'rgba(255,255,255,.2)';g.beginPath();g.moveTo(fx,fT);g.lineTo(fx+14,fT);g.lineTo(fx+4,FY-6);g.lineTo(fx,FY-5);g.closePath();g.fill();
  if(T){
    /* пятна плесени и тёмные подтёки */
    g.fillStyle='rgba(60,90,60,.4)';g.beginPath();g.ellipse(fx+3,FY-3,4,2,0.2,0,TAU);g.ellipse(fx+19,fT+4,3,2,0,0,TAU);g.fill();
    g.fillStyle='rgba(8,2,12,.45)';g.beginPath();g.ellipse(fx+8,FY-1,6,1.6,0,0,TAU);g.fill();
  }
  g.restore();
  /* рамка и угловые накладки */
  lmToysFrame(g,fx+1.1,fT+1.1,18.8,15.8,1.2,T?'#7a6638':GOLD,T);
  for(const [x,y] of [[fx+1.1,fT+1.1],[fx+19.9,fT+1.1],[fx+1.1,FY-1.1-0],[fx+19.9,FY-1.1]])lmToysRivet(g,x,y,0.85,T?'#8a7440':'#ffe27a');
  /* цоколь */
  g.beginPath();g.rect(fx,FY-2.6,21,2.6);mobPath(g,shadeHex(BC,-0.42),fx+4,FY-3,8,true);g.fillStyle=T?'#6a5a30':'#e0b028';g.fillRect(fx,FY-0.7,21,0.7);
  /* звезда: большая и малые */
  const sx=-4,sy=FY-9.6;
  if(!T){lmToysStar(g,sx,sy,6.4,'#ffd040',0,false);mobGlow(g,sx,sy,9,'#ffd040',0.16);
    lmToysStar(g,fx+17.4,fT+4.4,1.9,'#ffd040',0.3,false);lmToysStar(g,fx+14.6,FY-4.8,1.3,'#ffd040',0.1,true);lmToysStar(g,fx+4.2,fT+3.8,1.2,'#ffd040',0.4,true);
    g.fillStyle='#ffe27a';for(const [x,y] of [[fx+8.6,fT+3.4],[fx+4.4,FY-4],[fx+10.4,FY-4.4]]){g.beginPath();g.arc(x,y,0.5,0,TAU);g.fill();}}
  else{
    /* звезда треснула пополам, правая половина съехала, края облуплены; по трещине — швы */
    g.save();g.beginPath();g.moveTo(-14,FY-20);g.lineTo(sx+0.2,FY-20);g.lineTo(sx-1.6,sy-2);g.lineTo(sx+1.2,sy+2.4);g.lineTo(sx-0.6,FY);g.lineTo(-14,FY);g.closePath();g.clip();lmToysStar(g,sx,sy,6.2,'#9a8444',0,false);g.restore();
    g.save();g.translate(1.1,1.4);g.beginPath();g.moveTo(sx+0.2,FY-20);g.lineTo(10,FY-20);g.lineTo(10,FY);g.lineTo(sx-0.6,FY);g.lineTo(sx+1.2,sy+2.4);g.lineTo(sx-1.6,sy-2);g.closePath();g.clip();lmToysStar(g,sx,sy,6.2,'#8a7440',0,false);g.restore();
    g.strokeStyle='#08020c';g.lineWidth=0.8;g.lineJoin='round';g.beginPath();g.moveTo(sx+0.2,fT+1);g.lineTo(sx-1.6,sy-2);g.lineTo(sx+1.2,sy+2.4);g.lineTo(sx-0.6,FY-2.6);g.stroke();
    g.strokeStyle='#d8c8a0';g.lineWidth=0.3;for(let i=0;i<5;i++){const y=sy-5+i*2.9;g.beginPath();g.moveTo(sx-1.8+((i%2)*0.5),y);g.lineTo(sx+1.8,y+0.9);g.stroke();}
    /* глаза, глядящие из трещины */
    mobGlow(g,sx+0.8,sy+0.6,2.2,'#ff2030',0.45);g.fillStyle='#ff4a50';g.beginPath();g.arc(sx-0.2,sy+0.4,0.35,0,TAU);g.arc(sx+1.6,sy+0.9,0.35,0,TAU);g.fill();
    /* потёки: тёмно-красная слизь с края зева */
    for(const [x,l,w] of [[-9.6,6.4,1.0],[-3.4,9,1.2],[11,4.4,0.8]]){const hh=l+Math.sin(t*1.3+x)*0.4;
      g.beginPath();g.moveTo(x-w,fT);g.lineTo(x+w,fT);g.quadraticCurveTo(x+w*0.7,fT+hh*0.6,x+w*0.5,fT+hh);g.arc(x,fT+hh,w*0.55,0,Math.PI);g.quadraticCurveTo(x-w*0.7,fT+hh*0.6,x-w,fT);g.closePath();
      g.fillStyle='#5a0a18';g.fill();g.fillStyle='rgba(255,140,140,.55)';g.fillRect(x-w*0.4,fT+1,0.35,hh*0.7);}
  }
  if(T){
    /* бледная лапа с длинными пальцами цепляется за край: кто-то лезет из коробки */
    const hb=Math.sin(t*2.2)*0.3;
    for(const [x,l,c] of [[2,3.4,0],[4,4.6,1],[6,4.2,0],[8,2.8,1]]){
      const kx=x+0.2,ky=ft+0.4,tx=x+0.8+c*0.3,ty=ft+0.4+l+hb;
      lmToysTaper(g,x,ft-1.2,kx,ky,1.5,1.25,'#cfc4b0',true);lmToysTaper(g,kx,ky,tx,ty,1.25,0.6,'#cfc4b0',true);
      g.beginPath();g.arc(kx,ky,0.7,0,TAU);mobPath(g,'#d8cebb',kx-0.2,ky-0.3,0.9,true);
      g.fillStyle='#1a0a10';g.beginPath();g.moveTo(tx-0.4,ty-0.5);g.lineTo(tx+0.1,ty+1.5);g.lineTo(tx+0.45,ty-0.5);g.closePath();g.fill();
      g.strokeStyle='rgba(255,255,255,.4)';g.lineWidth=0.22;g.beginPath();g.moveTo(x-0.4,ft-0.8);g.lineTo(kx-0.4,ky);g.stroke();}
  }
  /* ручка-завод на правой грани */
  const ax=8+dx*0.5,ay=ft+dy*0.5+9,ex=ax+4.8,R=3.6,cr=crank;
  const hx=ex+Math.cos(cr)*R*0.4,hy=ay+Math.sin(cr)*R-Math.cos(cr)*R*0.26;
  g.lineCap='round';g.strokeStyle='#20102a';g.lineWidth=2.6;g.beginPath();g.moveTo(ax,ay);g.lineTo(ex,ay);g.lineTo(hx,hy);g.stroke();
  const hc=T?'#8a7440':'#ffd040';g.strokeStyle=hc;g.lineWidth=1.5;g.beginPath();g.moveTo(ax,ay);g.lineTo(ex,ay);g.stroke();g.beginPath();g.moveTo(ex,ay);g.lineTo(hx,hy);g.stroke();
  g.strokeStyle=shadeHex(hc,0.5);g.lineWidth=0.4;g.beginPath();g.moveTo(ax,ay-0.5);g.lineTo(ex,ay-0.5);g.stroke();
  g.beginPath();g.arc(hx,hy,1.55,0,TAU);mobPath(g,T?'#6a2a3a':'#ff6a8a',hx-0.5,hy-0.6,1.8);
  g.beginPath();g.arc(ax,ay,1.3,0,TAU);mobPath(g,hc,ax-0.3,ay-0.3,1.5);
}

/* состояние: бросок вверх — голова выскочила, остаётся пустая коробка */
LM_MODEL.ljack=function(g,m,FY,t,T,st,k,wv,ph){
  const tune=st==='tune'?clamp(k,0,1):0,out=(m.ext||0)>0.01,air=!m.onGround;
  const str=air?clamp(-m.vy/400,-0.4,0.5):0;
  const BC=T?'#4e3470':'#8a4ab8',GOLD='#e8b830';
  /* движение: переваливается по пути (шаг = наклон на угол), приземление сплющивает и пружинит, голова на пружине отстаёт */
  const mk=m.mk||0,mw=clamp(mk*2.2,0,1)*(air?0:1),gp=lmGait(m,12),gs=Math.sin(gp)*mw;
  const fg=lmFidget(t,ph,4.0),fg2=lmFidget(t+2,ph,5.5),tw=T?lmTwitch(t,ph,0.8):0,tw2=T?lmTwitch(t+3,ph,1.3):0;
  {const pt=m._jlt,dt=(pt===undefined||Math.abs(t-pt)>0.5)?0:Math.max(0,t-pt);m._jl=(m._jl||0)*Math.exp(-7*dt);m._jlt=t;
   if(m._wa&&!air&&m.onGround)m._jl=0.22;m._wa=air?1:0;}
  const jl=m._jl||0,pre=(!air&&!out&&!tune&&Math.abs(m.vx)<5&&m.timer>0&&m.timer<0.16)?1-m.timer/0.16:0,rec=st==='pop'?Math.max(0,1-(m.st||0)/0.3):0;
  const sq=jl*(0.7+0.3*Math.cos(t*22))+pre*0.07+tune*0.05+rec*0.12;   /* сжатие по высоте */
  const fwd=(m.vx||0)*(m.facing||1),hlag=lmToysE(m,'hl',-clamp(fwd*0.05,-3,3),t,8);
  const shk=(tune?Math.sin(t*52)*tune*1.1:0)+Math.sin(t*70)*0.5*rec+tw*0.4;
  g.save();g.translate(shk,0);
  g.translate(0,FY);g.scale(1-str*0.12+sq*0.7,1+str*0.16-sq);g.translate(0,-FY);
  {const ag2=gs*0.07,px=ag2>0?8:-13;g.translate(px,FY);g.rotate(ag2+0.025*mw);g.translate(-px,-FY);}
  /* ступени крышки: покой — открыта, при заводе дрожит шире, при выбросе — до упора */
  const lidA=out?2.28+Math.sin(t*9)*0.025:2.02+tune*0.16+(tune?Math.sin(t*34)*0.07*tune:Math.sin(t*1.6+ph)*0.04+fg*0.1+fg2*Math.abs(Math.sin(t*14))*0.06+Math.abs(gs)*0.07+jl*Math.sin(t*20)*0.8+tw*0.06);
  const fx=-13,ft=FY-18;
  lmToysLid(g,T,lidA,fx,ft,BC,t,0);
  lmToysBoxBack(g,T,FY,BC,GOLD,t,tune);
  /* голова на пружине (или червь), пока сидит в коробке; у выброса остаётся только пружина-основание */
  const bob=Math.sin(t*2.3+ph)*1.2+Math.sin(t*4.1+ph*2)*0.4+fg*2.2+Math.abs(Math.sin(gp-0.9))*-1.4*mw,sway=Math.sin(t*1.7+ph)*1.6+Math.sin(t*3.3)*0.5+hlag-gs*1.6+tw2*1.2;
  const mx=0.5,my=FY-20.4;
  if(!out){
    const rise=2+tune*3.4+(tune?Math.sin(t*41)*0.5*tune:0),hy=FY-38-rise-bob+(air?clamp(m.vy*0.012,-2,2):0)+jl*14*Math.sin(t*26)+tw*1.5-pre*2,hx=mx+sway+(tune?Math.sin(t*37)*0.9*tune:0);
    const pts=lmToysBez([mx,my],[mx+(T?12:2),my-5],[hx-(T?12:2),hy+11],[hx,hy+7.4],T?20:12);
    lmToysNeck(g,pts,T,T?4.4:3.7,T?4:3.4,t);
    lmToysClown(g,m,hx,hy,t,T,T?0.15+tune*0.85+0.1*lmBreath(t,ph,3)+0.35*Math.abs(tw2):tune*0.9+fg*0.12,sway*0.07+(tune?Math.sin(t*29)*0.06*tune:0)+(m.lookX||0)*0.03+fg*0.1-fg2*0.07-gs*0.08+tw*0.16,true);
  }else{
    /* основание пружины в пустой коробке: до уровня, откуда мир рисует шею */
    const pts=lmToysBez([mx,my],[mx+1,my-3],[mx,my-6],[mx,FY-28],6);
    lmToysNeck(g,pts,T,T?3.9:3.7,T?3.9:3.7,t);
  }
  lmToysBoxFront(g,T,FY,BC,GOLD,t,tune,1.3+lmToysAcc(m,'c',tune?13:out?3:0.9+mw*3,t,6),m);
  /* ноты при заводе (мелодия табакерки) */
  if(tune>0.02){for(let i=0;i<3;i++){const f=(t*0.9+i/3+ph*0.1)%1;lmToysNote(g,[-19,18.5,-24][i]+Math.sin(f*6+i)*2.4,FY-30-f*18,0.95,T?['#ff6a7a','#d0a0ff','#ffd890'][i]:['#ffd040','#ff8ab0','#8ae0ff'][i],Math.sin(f*Math.PI)*tune);}}
  g.restore();
};
/* для мира (lilLongPart): шея и голова на конце — по тем же помощникам */
function lmToysJackNeck(g,m,time){
  const T=m.tf,e=m.ext,x0=m.x,y0=m.y-m.h*0.9,x1=x0+m.nx2*e,y1=y0+m.ny2*e-7.4*(1-e),a=Math.atan2(y1-y0,x1-x0),bend=8*(m.facing||1);
  const n=Math.max(6,Math.floor(Math.hypot(x1-x0,y1-y0)/(T?4.5:6))),pts=[];
  for(let i=0;i<=n;i++){const f=i/n,off=Math.sin(f*Math.PI)*bend*(1-e*0.4);pts.push([x0+(x1-x0)*f+Math.cos(a+Math.PI/2)*off,y0+(y1-y0)*f+Math.sin(a+Math.PI/2)*off+(1-f)*6]);}
  lmToysNeck(g,pts,T,T?5.4:4.6,T?4.6:3.9,time,5.4);
  g.save();g.translate(x1,y1);g.scale(m.facing||1,1);lmToysClown(g,m,0,0,time,T,1,0,true);g.restore();
}

/* ---------- Заводной солдатик ---------- */
LM_MODEL.lsoldier=function(g,m,FY,t,T,st,k,wv,ph){
  const aim=st==='aim',rw=st==='rewind',Y=v=>FY+v,s2=m.st||0;
  /* марш: шаги по пути (ноги не скользят), подскок, качание; покой: дыхание, взгляд, перо, ключ */
  const mk=m.mk||0,walk=mk>0.05,gp=lmGait(m,12),sw=Math.sin(gp)*mk,ammo=m.ammo===undefined?3:m.ammo;
  const bth=lmBreath(t,ph,3.0),fg=lmFidget(t,ph,4.6),fg2=lmFidget(t+2,ph,6.3),tw=T?lmTwitch(t,ph,0.9):0,tw2=T?lmTwitch(t+3,ph,1.4):0;
  const kick=aim&&ammo<3?Math.max(0,1-s2/0.2):0,flash=aim&&ammo<3?Math.max(0,1-s2/0.1):0;
  const aimA=clamp(Math.atan2((m.ay||0)-(m.y-m.h*0.62),Math.abs((m.ax||m.x+300)-m.x)),-0.8,0.8);
  const pa=lmToysE(m,'pa',aim?1:0,t,aim?9:5),pr=lmToysE(m,'pr',rw?1:0,t,6);
  const lerp2=(a,b,q)=>a+(b-a)*q;
  const C=T?{coat:'#7e7c60',coatD:'#363324',coatL:'#b0ac88',gold:'#a8863c',goldD:'#4a3818',white:'#c0b298',pants:'#74634c',boot:'#3c3026',skin:'#d2c8ba',hat:'#9a7c58',rust:'#c26a2c',steel:'#a4a4a0'}
    :{coat:'#3a5cbc',coatD:'#22358a',coatL:'#7090e8',gold:'#f2c444',goldD:'#a87818',white:'#f8f4ea',pants:'#f6f1e8',boot:'#1e1c28',skin:'#ffdcc4',hat:'#2c449a',rust:'#000',steel:'#aab0bc'};
  const bob=lmBob(m,12,1.1)-(1-mk)*bth*0.35-pr*0.3;
  /* ---- ноги: прямые, как у игрушки; дальняя темнее ---- */
  for(const [hxL,o,far] of [[-1.9,Math.PI,1],[1.7,0,0]]){
    const sp=lmFoot(m,o,12,3.4),tp=(1-mk)*lmFidget(t+o*0.7,ph,5.2+o*0.4)*1.4,hy=Y(-12.6),ax=hxL+sp[0]*0.9+(far?tw*0.8:0),ay=Y(-2.6)+sp[1]-tp;
    const pc=far?shadeHex(C.pants,-0.26):C.pants;
    if(T&&far){
      /* дальняя нога ободрана: стальной стержень с пружиной вместо голени */
      lmToysTaper(g,hxL,hy,hxL+(ax-hxL)*0.4,hy+3.2,3.4,3.1,pc);
      g.fillStyle='#120a06';g.beginPath();g.moveTo(hxL-1.8,hy+3);g.lineTo(hxL-0.6,hy+4.4);g.lineTo(hxL+0.4,hy+3.1);g.lineTo(hxL+1.7,hy+4.6);g.lineTo(hxL+1.9,hy+2.9);g.closePath();g.fill();
      lmToysSpring(g,hxL+(ax-hxL)*0.4,hy+3.6,ax,ay-1.2,4,1,'#8a8e92');
      g.strokeStyle='#5a5e62';g.lineWidth=0.9;g.beginPath();g.moveTo(hxL+(ax-hxL)*0.4,hy+3.6);g.lineTo(ax,ay-1);g.stroke();
    }else{
      lmToysTaper(g,hxL,hy,ax,ay-1.4,3.6,3,pc);
      if(T){g.save();g.beginPath();g.rect(-8,-60+FY,16,60);g.restore();
        g.fillStyle='#120a06';g.beginPath();g.moveTo(ax-1.6,ay-6);g.lineTo(ax-0.2,ay-4.4);g.lineTo(ax+0.6,ay-6.2);g.lineTo(ax+1.7,ay-4.2);g.lineTo(ax+1.4,ay-2.6);g.lineTo(ax-1.6,ay-3.2);g.closePath();g.fill();
        g.fillStyle=hexA(C.rust,0.7);g.beginPath();g.ellipse(ax+0.2,ay-7.4,1.1,1.6,0.2,0,TAU);g.fill();}
      else{g.strokeStyle=hexA('#a8a090',0.5);g.lineWidth=0.35;g.beginPath();g.moveTo(hxL+0.9,hy+1);g.lineTo(ax+0.4,ay-3);g.stroke();}
    }
    /* сапог: голенище, носок вперёд, блик */
    g.beginPath();g.moveTo(ax-1.9,ay-2);g.lineTo(ax+1.9,ay-2);g.lineTo(ax+2.2,ay+0.2);g.quadraticCurveTo(ax+5,ay+0.4,ax+5,ay+2.6);g.lineTo(ax+5,FY+0.1+sp[1]*0);g.lineTo(ax-2.1,FY+0.1);g.lineTo(ax-2.2,ay-0.2);g.closePath();
    mobPath(g,far?shadeHex(C.boot,0.02):shadeHex(C.boot,0.1),ax-0.4,ay-0.6,4.4);
    g.fillStyle=hexA('#ffffff',T?0.12:0.28);g.fillRect(ax-1.2,ay-1.8,0.7,2.6);
    g.strokeStyle=hexA('#000',0.5);g.lineWidth=0.3;g.beginPath();g.moveTo(ax-2,ay+0.6);g.lineTo(ax+4.6,ay+1.2);g.stroke();
  }
  g.save();g.translate(Math.sin(t*61)*0.3*pr+tw*0.5,bob);g.translate(0,FY);g.rotate(sw*0.03+0.03*mk-0.02*pa+pr*0.06+Math.sin(t*1.3+ph)*0.012*(1-mk));g.scale(1+bth*0.01,1+bth*0.03);g.translate(0,-FY);
  /* ---- ключ на спине: бабочка, вращается; в заводе — быстро ---- */
  {const th=lmToysAcc(m,'k',rw?13:1.5+mk*3,t,5)+ph+tw*0.7;
    g.fillStyle=shadeHex(C.gold,-0.35);g.beginPath();g.ellipse(-5.8,Y(-18.6),0.9,2.6,0,0,TAU);g.fill();
    g.strokeStyle=C.goldD;g.lineWidth=1.3;g.lineCap='round';g.beginPath();g.moveTo(-5.4,Y(-18.8));g.lineTo(-9.4,Y(-18.8));g.stroke();
    g.strokeStyle=C.gold;g.lineWidth=0.7;g.beginPath();g.moveTo(-5.4,Y(-19.1));g.lineTo(-9.4,Y(-19.1));g.stroke();
    const cs=Math.cos(th),sn2=Math.sin(th);
    for(const sd of (sn2>0?[-1,1]:[1,-1])){const y=Y(-18.8)+sd*3.4*cs,dep=sd*sn2;
      if(T&&sd<0){g.beginPath();g.moveTo(-9.2,y+0.6);g.lineTo(-12.4,y+1.4);g.lineTo(-12.8,y-1);g.lineTo(-11,y-2.4);g.lineTo(-9.4,y-1.6);g.closePath();mobPath(g,dep<0?shadeHex(C.rust,-0.2):'#a2622a',-11,y,3);g.fillStyle='#120a06';g.beginPath();g.arc(-11,y,0.8,0,TAU);g.fill();}
      else{g.beginPath();g.ellipse(-11.2,y,2.1,2.7,0,0,TAU);mobPath(g,dep<0?shadeHex(C.gold,-0.25):C.gold,-11.8,y-0.8,2.7);g.fillStyle='#2a1a0c';g.beginPath();g.ellipse(-11.2,y,0.8,1.2,0,0,TAU);g.fill();
        g.strokeStyle=hexA('#fff',T?0.2:0.55);g.lineWidth=0.35;g.beginPath();g.ellipse(-11.2,y,1.6,2.2,0,Math.PI*1.1,Math.PI*1.55);g.stroke();}}
    if(rw){g.strokeStyle='rgba(255,230,150,.5)';g.lineWidth=0.5;for(let i=0;i<3;i++){g.beginPath();g.arc(-11.2,Y(-18.8),4+i*0.8,t*9+i*2,t*9+i*2+1.1);g.stroke();}}
  }
  /* ---- поза ружья ---- */
  const ia=T?-1.28:-0.95,iGx=T?8:5.4,iGy=T?Y(-12.2):Y(-20.4);
  let ra=lerp2(ia+Math.sin(t*1.3+ph)*0.025*(1-mk)+Math.sin(gp)*0.04*mk,aimA-kick*0.1,pa),gx=lerp2(iGx,7.4,pa),gy=lerp2(iGy-bth*0.3+Math.sin(gp*2)*0.4*mk,Y(-22.2),pa);
  ra=lerp2(ra,-1.5,pr);gx=lerp2(gx,6.6,pr);gy=lerp2(gy,Y(-12.4),pr);
  gx-=Math.cos(ra)*kick*2;gy-=Math.sin(ra)*kick*2;
  const dr=[Math.cos(ra),Math.sin(ra)];
  const nH=[gx+dr[0]*3.4,gy+dr[1]*3.4];
  const holdF=[gx-dr[0]*4.6,gy-dr[1]*4.6],idleF=T?[-5.6+tw2*0.8,Y(-12.4)+Math.sin(t*1.6)*0.7+tw2*1.2]:holdF;
  let fH=[lerp2(idleF[0],holdF[0],pa),lerp2(idleF[1],holdF[1],pa)];
  fH=[lerp2(fH[0],-8.6,pr),lerp2(fH[1],Y(-18.2),pr)];
  const farBehind=T&&pa<0.35&&pr<0.35;
  let f2=[0,0];
  const farArm=()=>{const fa=lmToysArm(g,-3.7,Y(-23.6),fH[0],fH[1],T?5.4:5,T?5.6:5.2,true,T?2.6:3.2,T?1.8:2.4,shadeHex(C.coat,-0.2));
    f2=[fa[0],fa[1]];g.fillStyle=T?'#4a3a28':C.gold;
    const cuffX=fa[2]+(fa[0]-fa[2])*0.82,cuffY=fa[3]+(fa[1]-fa[3])*0.82;g.beginPath();g.ellipse(cuffX,cuffY,1.4,1.1,Math.atan2(fa[1]-fa[3],fa[0]-fa[2])+1.57,0,TAU);g.fill();};
  if(farBehind)farArm();
  /* ---- мундир ---- */
  const tail=T?1:0;
  g.beginPath();g.moveTo(-4.7,Y(-23.4));g.quadraticCurveTo(-5.1,Y(-25.5),-3,Y(-25.6));g.lineTo(3.8,Y(-25.6));g.quadraticCurveTo(5.6,Y(-25.5),5.3,Y(-23.2));g.lineTo(4.9,Y(-14.8));
  if(T){g.lineTo(6.2,Y(-9.6));g.lineTo(4.8,Y(-11.8));g.lineTo(4.2,Y(-7.6));g.lineTo(2.6,Y(-11.4));g.lineTo(1.4,Y(-8.4));g.lineTo(0.2,Y(-11.8));g.lineTo(-1.2,Y(-7.2));g.lineTo(-2.6,Y(-11.6));g.lineTo(-3.8,Y(-8.6));g.lineTo(-5,Y(-11.8));g.lineTo(-6.2,Y(-9.4));g.lineTo(-5.5,Y(-12.6));}
  else{g.lineTo(5.9,Y(-11.6));g.lineTo(-5.5,Y(-11.6));}
  g.lineTo(-4.5,Y(-14.8));g.closePath();
  mobPath(g,C.coat,-1.4,Y(-20),9.6);
  g.save();g.clip();
  /* свет по левому краю, тень справа и у подола */
  {const sg=g.createLinearGradient(-6,0,6,0);sg.addColorStop(0,hexA(C.coatL,T?0.25:0.4));sg.addColorStop(0.35,hexA(C.coatL,0));sg.addColorStop(0.75,'rgba(0,0,20,0)');sg.addColorStop(1,'rgba(0,0,20,.34)');g.fillStyle=sg;g.fillRect(-7,Y(-26),14,16);}
  /* складки подола */
  g.strokeStyle=hexA(C.coatD,0.7);g.lineWidth=0.4;for(const x of [-3.2,-0.6,2.2,4.2]){g.beginPath();g.moveTo(x*0.9,Y(-14.4));g.quadraticCurveTo(x*1.05,Y(-12.6),x*1.15,Y(-10));g.stroke();}
  /* белая выпушка по подолу и борту */
  if(!T){g.fillStyle=C.white;g.fillRect(-6,Y(-12.5),12,0.8);g.fillRect(1.9,Y(-25.6),0.9,12.9);}
  else{g.fillStyle='rgba(168,154,132,.7)';g.fillRect(-6,Y(-12.5),12,0.5);
    /* ржавые потёки, пятна, заплаты */
    g.fillStyle=hexA(C.rust,0.42);for(const [x,y,rx,ry] of [[-3.4,-22,1.3,1.8],[3.8,-16.4,1.1,1.5],[-4,-15.4,1.2,1.2]]){g.beginPath();g.ellipse(x,Y(y),rx,ry,0.3,0,TAU);g.fill();}
    g.strokeStyle='rgba(120,50,18,.45)';g.lineWidth=0.4;for(const x of [-3.6,3.6]){g.beginPath();g.moveTo(x,Y(-24.4));g.lineTo(x+0.3,Y(-19+Math.abs(x)));g.stroke();}
    g.strokeStyle='#1a0e08';g.lineWidth=0.4;g.beginPath();g.moveTo(-4.4,Y(-17));g.lineTo(-2.6,Y(-18.4));g.lineTo(-3.2,Y(-20));g.moveTo(3.8,Y(-24));g.lineTo(3,Y(-21.4));g.stroke();
    g.fillStyle='#120a06';for(const [x,y] of [[-3.6,-14.4],[-4.2,-21.2]]){g.beginPath();g.arc(x,Y(y),0.7,0,TAU);g.fill();}}
  g.restore();
  /* перекрёстные портупеи, бляха, пуговицы */
  if(!T){for(const [x0,y0,x1,y1] of [[-4.4,-25,3.8,-14.8],[4.6,-25,-3.8,-14.8]]){const a=Math.atan2(Y(y1)-Y(y0),x1-x0),nx=-Math.sin(a)*0.8,ny=Math.cos(a)*0.8;
      g.beginPath();g.moveTo(x0+nx,Y(y0)+ny);g.lineTo(x1+nx,Y(y1)+ny);g.lineTo(x1-nx,Y(y1)-ny);g.lineTo(x0-nx,Y(y0)-ny);g.closePath();mobPath(g,C.white,0,Y(-20),8,true);
      g.strokeStyle='rgba(60,70,120,.5)';g.lineWidth=0.3;g.stroke();}
    g.beginPath();g.arc(0.3,Y(-19.9),1.35,0,TAU);mobPath(g,C.gold,-0.2,Y(-20.4),1.6);g.fillStyle='#6a4a10';g.beginPath();g.arc(0.3,Y(-19.9),0.5,0,TAU);g.fill();
    g.fillStyle=C.gold;for(const y of [-17.4,-15.8])if(1){g.beginPath();g.arc(2.4,Y(y),0.7,0,TAU);g.fill();g.fillStyle=hexA('#fff',0.7);g.fillRect(2.1,Y(y)-0.4,0.35,0.35);g.fillStyle=C.gold;}}
  else{/* ремень висит клочьями */
    g.fillStyle=C.white;g.beginPath();g.moveTo(-4.4,Y(-25));g.lineTo(-3.2,Y(-25));g.lineTo(0.6,Y(-21));g.lineTo(-0.4,Y(-20.4));g.closePath();g.fill();g.strokeStyle='#2a1e14';g.lineWidth=0.35;g.stroke();
    g.beginPath();g.moveTo(3.2,Y(-18));g.lineTo(4.4,Y(-17));g.lineTo(3.8,Y(-14.8));g.lineTo(2.6,Y(-15.4));g.closePath();g.fill();g.stroke();}
  /* пояс с пряжкой */
  g.fillStyle=T?'#4a3a28':C.white;g.fillRect(-4.9,Y(-14.9),9.9,1.3);g.fillStyle=hexA('#fff',T?0.1:0.5);g.fillRect(-4.9,Y(-14.9),9.9,0.35);
  g.beginPath();g.rect(-0.6,Y(-15.2),2.6,1.9);mobPath(g,C.gold,0.4,Y(-14.6),1.8);
  /* ---- грудь Истины: разорванный мундир, часы и шестерни ---- */
  if(T){
    const cx=1.7,cy=Y(-19.4),R=3.9,open=pr;
    g.beginPath();for(let i=0;i<10;i++){const a=i/10*TAU,rr=R*(i%2?1.0:1.45)+(open?0.4:0);g.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*1.04);}g.closePath();
    g.fillStyle='#0c0604';g.fill();g.strokeStyle='#241810';g.lineWidth=0.5;g.stroke();
    /* внутри: шестерни, потом циферблат */
    lmToysGear(g,cx-1.6,cy+1.8,1.7,7,t*(rw?7:0.9),'#9a7a3a',0.3);lmToysGear(g,cx+2.1,cy+2.2,1.3,6,-t*(rw?9:1.2)+0.4,'#7a6a58',0.3);
    lmToysClock(g,cx,cy-0.3,3.1,true,rw?t*10:Math.floor(t*1.0)*0.5236+Math.sin(t*20)*0.02*(Math.sin(t*1)>0.9?1:0));
    g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=0.3;g.beginPath();g.moveTo(cx-1.8,cy-2.2);g.lineTo(cx-0.4,cy-0.2);g.lineTo(cx-1.2,cy+1.2);g.moveTo(cx-0.4,cy-0.2);g.lineTo(cx+1.4,cy+0.4);g.stroke();
    if(rw)mobGlow(g,cx,cy,R*2.6,'#ff8a30',0.6+0.2*Math.sin(t*18));
    /* лоскуты ткани у края дыры */
    g.fillStyle=C.coatL;for(const [a,l] of [[0.5,2],[2.2,1.8],[3.6,2.2],[5.1,1.6]]){const x=cx+Math.cos(a)*R*1.3,y=cy+Math.sin(a)*R*1.3;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*l*0.8-Math.sin(a)*0.8,y+Math.sin(a)*l*0.8+Math.cos(a)*0.8);g.lineTo(x-Math.sin(a)*1.2,y+Math.cos(a)*1.2);g.closePath();g.fill();}
    /* провода и сухожилия свисают из дыры, качаются */
    g.lineCap='round';for(const [dx,col,L] of [[-1.4,'#1a0a0a',5.6],[0.4,'#8a1a22',7],[2.2,'#2a1a10',5]]){const sx=cx+dx,sy=cy+R*0.9,sw2=Math.sin(t*2.2+dx*3)*1.2;
      g.strokeStyle=col;g.lineWidth=0.75;g.beginPath();g.moveTo(sx,sy);g.bezierCurveTo(sx+sw2,sy+L*0.4,sx-sw2*0.8,sy+L*0.7,sx+sw2*0.6,sy+L);g.stroke();
      g.strokeStyle=hexA('#c8a050',0.7);g.lineWidth=0.3;g.beginPath();g.moveTo(sx+0.2,sy+0.2);g.bezierCurveTo(sx+sw2+0.2,sy+L*0.4,sx-sw2*0.8+0.2,sy+L*0.7,sx+sw2*0.6+0.2,sy+L);g.stroke();}
  }
  /* ---- воротник и эполеты ---- */
  g.beginPath();g.moveTo(-3.4,Y(-25.4));g.lineTo(-3,Y(-27.2));g.lineTo(3.8,Y(-27.2));g.lineTo(4,Y(-25.4));g.closePath();mobPath(g,shadeHex(C.coat,0.06),0.4,Y(-26.4),4);
  g.fillStyle=C.gold;g.fillRect(-3.2,Y(-27.2),7,0.6);g.fillStyle=C.goldD;for(let i=0;i<4;i++)g.fillRect(-2.6+i*1.7,Y(-26.2),0.5,0.5);
  for(const [ex,far] of [[-5.2,1],[5.4,0]]){
    g.beginPath();g.ellipse(ex,Y(-24.9),2.7,1.4,far?0.25:-0.25,0,TAU);mobPath(g,far?shadeHex(C.gold,-0.2):C.gold,ex-0.6,Y(-25.4),2.7);
    g.strokeStyle=hexA(C.goldD,0.9);g.lineWidth=0.3;for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(ex+i*0.9,Y(-24.2));g.lineTo(ex+i*0.9+(far?-0.3:0.3),Y(-22.6)+Math.abs(i)*0.2);g.stroke();}
    g.fillStyle=hexA('#fff',T?0.15:0.6);g.fillRect(ex-1.4,Y(-25.5),1.4,0.35);
    if(T&&!far){g.fillStyle='#120a06';g.beginPath();g.moveTo(ex+0.4,Y(-25.6));g.lineTo(ex+2.2,Y(-24.4));g.lineTo(ex+1.2,Y(-24));g.closePath();g.fill();}
  }
  /* дальняя рука: через грудь к спуску, темнее */
  {if(!farBehind)farArm();
    lmToysRifle(g,gx,gy,ra,T,flash);
    /* дальняя перчатка поверх ружья */
    if(T){g.strokeStyle='#6a6a68';g.lineWidth=0.7;g.lineCap='round';for(let q=-1;q<=1;q++){g.beginPath();g.moveTo(f2[0],f2[1]);g.lineTo(f2[0]+1.6+q*0.2+tw2*0.9*q,f2[1]+q*0.9+Math.sin(t*3+q*2)*0.25);g.stroke();}}
    else{g.beginPath();g.ellipse(f2[0]+0.3,f2[1]+0.1,1.8,1.6,ra,0,TAU);mobPath(g,shadeHex(C.white,-0.12),f2[0],f2[1]-0.4,1.8,true);g.strokeStyle='rgba(60,60,80,.55)';g.lineWidth=0.3;g.stroke();}}
  /* ближняя рука: рукав, манжета, перчатка на цевье */
  {const na=lmToysArm(g,4.6,Y(-23.6),nH[0],nH[1],5,5.2,true,T?2.9:3.6,T?2.2:2.7,C.coat);
    if(T){/* рукав разорван у локтя: торчат стержень и сустав */
      g.fillStyle='#120a06';g.beginPath();g.moveTo(na[2]-1.8,na[3]-1);g.lineTo(na[2]+0.2,na[3]+1.4);g.lineTo(na[2]+1.8,na[3]-0.8);g.lineTo(na[2]+2.2,na[3]+1.6);g.lineTo(na[2]-1.6,na[3]+2);g.closePath();g.fill();
      g.strokeStyle='#8a8a88';g.lineWidth=0.8;g.beginPath();g.moveTo(na[2]-0.8,na[3]+0.4);g.lineTo(na[2]+0.8,na[3]+1);g.stroke();lmToysGear(g,na[2]+0.2,na[3]+0.6,0.9,5,t*2,'#a08040',0.3);}
    const cuffX=na[2]+(na[0]-na[2])*0.84,cuffY=na[3]+(na[1]-na[3])*0.84;g.fillStyle=T?'#4a3a28':C.gold;g.beginPath();g.ellipse(cuffX,cuffY,1.5,1.2,Math.atan2(na[1]-na[3],na[0]-na[2])+1.57,0,TAU);g.fill();
    if(T){g.strokeStyle='#a0a09c';g.lineWidth=0.8;g.lineCap='round';g.lineJoin='round';for(let q=-1;q<=1;q++){g.beginPath();g.moveTo(na[0],na[1]);g.lineTo(na[0]+1.4,na[1]+q*0.9-0.3);g.lineTo(na[0]+2.6,na[1]+q*1.2+0.4);g.stroke();}
      g.fillStyle='#6a6a68';g.beginPath();g.arc(na[0],na[1],0.9,0,TAU);g.fill();}
    else{g.beginPath();g.ellipse(na[0]+0.4,na[1],2,1.7,ra,0,TAU);mobPath(g,C.white,na[0],na[1]-0.5,2,true);g.strokeStyle='rgba(60,60,80,.6)';g.lineWidth=0.35;g.stroke();
      g.strokeStyle='rgba(120,120,150,.5)';g.lineWidth=0.3;for(const q of [-0.6,0.4]){g.beginPath();g.moveTo(na[0]+0.6,na[1]+q);g.lineTo(na[0]+1.8,na[1]+q+0.2);g.stroke();}}
    /* вторая свободная рука-«щупальца» не нужна: в Истине провода уже свисают из груди */
  }
  /* ---- голова ---- */
  const hb=aim?0.8:0,hx=0.6+hb*0.4+fg*0.3,hy=Y(-29.2)+(rw?1.4*Math.min(1,s2*3):0)+(T?Math.sin(t*3+ph)*0.35:0)-bth*0.25*(1-mk)+Math.abs(sw)*0.25+(T?tw*0.6:0);
  g.save();g.translate(0.4,Y(-26));g.rotate((rw?0.16*pr:0)+(T?Math.sin(t*0.8)*0.04+tw*0.17:0)+(fg*0.1-fg2*0.08)*(1-pa)+Math.sin(t*1.7+ph)*0.025+0.03*mk);g.translate(-0.4,-Y(-26));
  if(T)lmToysSpring(g,0.4,Y(-26.6),hx*0.7+0.3,hy+2.6,3,1.2,'#8a8e92');
  /* голова */
  g.beginPath();g.ellipse(hx,hy,3.7,3.9,0,0,TAU);lmToysSoft(g,C.skin,hx,hy,3.9,T?'#3a2a1c':'#c8707a');
  if(!T){
    /* уши, глаза-точки, брови, румянец, нос, улыбка */
    g.fillStyle=shadeHex(C.skin,-0.1);g.beginPath();g.ellipse(hx-3.6,hy+0.5,0.7,1,0,0,TAU);g.fill();
    const sq=aim?1:0,bl=((t+ph*9)%4.1)<0.14;
    for(const [ex,ey,far] of [[hx-0.2,hy-0.3,1],[hx+2.4,hy-0.3,0]]){
      if(bl||(far&&sq)||(rw&&pr>0.5)){g.strokeStyle='#2a1a1a';g.lineWidth=0.5;g.lineCap='round';g.beginPath();g.moveTo(ex-0.8,ey+0.1);g.quadraticCurveTo(ex,ey-0.7,ex+0.8,ey+0.1);g.stroke();}
      else{g.fillStyle='#fffaf4';g.beginPath();g.ellipse(ex,ey,0.95,1.1,0,0,TAU);g.fill();g.fillStyle='#1a1424';g.beginPath();g.arc(ex+(m.lookX||0)*0.3,ey+0.1,0.62,0,TAU);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(ex-0.2+(m.lookX||0)*0.3,ey-0.2,0.2,0,TAU);g.fill();}
      g.strokeStyle='#6a3a2a';g.lineWidth=0.4;g.beginPath();g.moveTo(ex-1,ey-1.7+(far&&sq?0.3:0));g.quadraticCurveTo(ex,ey-2.2,ex+1,ey-1.7);g.stroke();}
    g.fillStyle='rgba(255,110,130,.45)';g.beginPath();g.ellipse(hx-1.7,hy+1.8,0.9,0.6,0,0,TAU);g.ellipse(hx+3.2,hy+1.8,0.9,0.6,0,0,TAU);g.fill();
    g.strokeStyle='rgba(180,90,80,.7)';g.lineWidth=0.35;g.beginPath();g.moveTo(hx+1.4,hy+0.8);g.quadraticCurveTo(hx+2,hy+1.4,hx+1.3,hy+1.5);g.stroke();
    g.strokeStyle='#8a2a2a';g.lineWidth=0.5;g.beginPath();if(rw&&pr>0.5){g.ellipse(hx+1.3,hy+2.5,0.6,0.5,0,0,TAU);}else if(aim){g.moveTo(hx+0.2,hy+2.5);g.lineTo(hx+2.6,hy+2.5);}else{g.moveTo(hx,hy+2.3);g.quadraticCurveTo(hx+1.4,hy+3.2,hx+2.8,hy+2.3);}g.stroke();
    g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=0.4;g.beginPath();g.ellipse(hx,hy,3.3,3.5,0,Math.PI*1.2,Math.PI*1.42);g.stroke();
  }else{
    /* безликая жестяная маска: шов, потёки ржавчины, тьма под каской */
    g.save();g.clip();
    const sh=g.createLinearGradient(0,hy-4,0,hy+2);sh.addColorStop(0,'rgba(6,2,2,.9)');sh.addColorStop(0.5,'rgba(6,2,2,.45)');sh.addColorStop(1,'rgba(6,2,2,0)');g.fillStyle=sh;g.fillRect(hx-5,hy-4.4,10,4.6);
    g.fillStyle=hexA(C.rust,0.45);g.beginPath();g.ellipse(hx-2.2,hy+2.4,0.6,2.4,0.1,0,TAU);g.ellipse(hx+2.6,hy+2.8,0.5,1.8,0,0,TAU);g.fill();
    g.strokeStyle='rgba(30,14,8,.8)';g.lineWidth=0.35;g.beginPath();g.moveTo(hx+0.8,hy-0.8);g.lineTo(hx+1,hy+1.6);g.lineTo(hx+0.6,hy+3.9);g.stroke();
    g.restore();
    /* глаза-огоньки в тени */
    const gl=(0.7+0.3*Math.sin(t*4+ph)+(aim?0.4:0))*(1-0.4*Math.abs(tw2));
    for(const ex of [hx-0.6,hx+2.6]){mobGlow(g,ex,hy+0.3,2.2,'#ff2a1a',0.5*gl);g.fillStyle='#ff6a4a';g.beginPath();g.arc(ex,hy+0.3,0.55,0,TAU);g.fill();}
    g.strokeStyle='rgba(255,230,200,.3)';g.lineWidth=0.4;g.beginPath();g.ellipse(hx,hy,3.3,3.5,0,Math.PI*1.2,Math.PI*1.42);g.stroke();
  }
  /* головной убор */
  if(!T){
    const hb2=hy-3.7,top=hb2-8.6;
    /* ремешок под подбородок */
    g.strokeStyle=C.goldD;g.lineWidth=0.5;g.beginPath();g.moveTo(hx-3.4,hy-1.6);g.quadraticCurveTo(hx-3,hy+3,hx+1.4,hy+3.7);g.stroke();
    /* кивер */
    g.beginPath();g.moveTo(hx-4,hb2+0.8);g.lineTo(hx-3.5,top+0.6);g.quadraticCurveTo(hx+0.6,top-0.5,hx+4.6,top+0.6);g.lineTo(hx+5,hb2+0.8);g.closePath();mobPath(g,C.hat,hx-1,hb2-3,7);
    g.save();g.clip();
    {const sg=g.createLinearGradient(hx-4,0,hx+5,0);sg.addColorStop(0,'rgba(150,180,255,.32)');sg.addColorStop(0.4,'rgba(150,180,255,0)');sg.addColorStop(1,'rgba(0,0,30,.34)');g.fillStyle=sg;g.fillRect(hx-5,top-1,11,10);}
    g.restore();
    /* золотая лента, шнуры, бляха-звезда, козырёк */
    g.fillStyle=C.gold;g.fillRect(hx-4.1,hb2-0.6,9.2,1.7);g.fillStyle=hexA('#fff',0.6);g.fillRect(hx-4.1,hb2-0.6,9.2,0.35);g.fillStyle=C.goldD;for(let i=0;i<7;i++)g.fillRect(hx-3.6+i*1.3,hb2+0.2,0.45,0.45);
    g.strokeStyle=C.gold;g.lineWidth=0.5;g.beginPath();g.moveTo(hx-3.4,top+2);g.quadraticCurveTo(hx-4.8,top+5,hx-3.8,hb2-0.8);g.moveTo(hx-3.4,top+2);g.quadraticCurveTo(hx-1,top+4.2,hx+1.4,top+2.4);g.stroke();
    g.fillStyle=C.gold;g.beginPath();g.arc(hx-3.8,hb2-0.4,0.7,0,TAU);g.fill();
    g.beginPath();for(let i=0;i<10;i++){const a=i/10*TAU-Math.PI/2,rr=i%2?0.9:2.3;g.lineTo(hx+1.6+Math.cos(a)*rr,top+4.4+Math.sin(a)*rr);}g.closePath();mobPath(g,C.gold,hx+1.2,top+4,2.4,true);
    g.strokeStyle=C.goldD;g.lineWidth=0.3;g.stroke();
    g.beginPath();g.moveTo(hx+2.4,hb2+1);g.quadraticCurveTo(hx+6.6,hb2+0.6,hx+8.4,hb2+1.8);g.lineTo(hx+2.4,hb2+1.9);g.closePath();mobPath(g,'#15121c',hx+4.6,hb2+1.2,3,true);g.fillStyle=hexA('#fff',0.5);g.fillRect(hx+3,hb2+1.1,4,0.3);
    /* султан: золотое перо с красным основанием; качается на шарнире, на ходу отстаёт */
    g.save();g.translate(hx+0.6,top-0.4);g.rotate(Math.sin(t*2.6+ph)*0.09+Math.sin(gp*2)*0.05*mk-mk*0.08+fg*0.1);g.translate(-(hx+0.6),-(top-0.4));
    g.beginPath();g.ellipse(hx+0.6,top-0.4,1.1,0.9,0,0,TAU);mobPath(g,'#d02a3a',hx+0.4,top-0.7,1.2,true);
    g.beginPath();g.moveTo(hx+0.6,top-0.6);g.bezierCurveTo(hx-1.8,top-3.2,hx-0.4,top-6.4,hx+0.8,top-7.2);g.bezierCurveTo(hx+2.8,top-5.2,hx+2.6,top-2.2,hx+0.6,top-0.6);g.closePath();mobPath(g,C.gold,hx+0.4,top-4,3.4);
    g.strokeStyle=hexA(C.goldD,0.8);g.lineWidth=0.3;g.beginPath();g.moveTo(hx+0.7,top-1);g.quadraticCurveTo(hx+0.4,top-3.5,hx+0.8,top-6.6);g.stroke();
    g.restore();
    /* контурный свет на кивере */
    lmRim(g,q=>{q.strokeStyle='rgba(200,220,255,.45)';q.lineWidth=0.7;q.beginPath();q.moveTo(hx-3.6,hb2);q.lineTo(hx-3.2,top+1);q.quadraticCurveTo(hx-1,top-0.2,hx+1.5,top+0.1);q.stroke();});
  }else{
    /* ржавая каска: купол, ободок, пулевые пробоины, остатки синей краски и золотого галуна */
    const hb2=hy-1.9;
    g.beginPath();g.moveTo(hx-5.4,hb2+0.4);g.quadraticCurveTo(hx-5.6,hb2-7,hx,hb2-7.2);g.quadraticCurveTo(hx+5.6,hb2-7,hx+5.6,hb2+0.2);g.quadraticCurveTo(hx+7,hb2+0.8,hx+6.6,hb2+1.4);g.lineTo(hx-6.4,hb2+1.8);g.quadraticCurveTo(hx-6.8,hb2+1,hx-5.4,hb2+0.4);g.closePath();
    mobPath(g,C.hat,hx-1.6,hb2-4,7);
    g.save();g.clip();
    g.fillStyle=hexA(C.rust,0.6);for(const [x,y,rx,ry] of [[-2.6,-5.2,1.6,1],[2.6,-2.4,1.8,1.3],[-4,-1.4,1.2,1.5],[4,-5.4,1,1.2]]){g.beginPath();g.ellipse(hx+x,hb2+y,rx,ry,0.3,0,TAU);g.fill();}
    g.fillStyle='rgba(60,90,170,.75)';g.beginPath();g.moveTo(hx-5.4,hb2-2.4);g.lineTo(hx-3.2,hb2-2.8);g.lineTo(hx-3.6,hb2-1.4);g.lineTo(hx-5.4,hb2-0.8);g.closePath();g.fill();
    g.fillStyle='rgba(168,138,60,.8)';g.fillRect(hx-6,hb2-0.4,5,0.9);
    g.strokeStyle='rgba(30,14,8,.7)';g.lineWidth=0.35;g.beginPath();g.moveTo(hx+2.2,hb2-6.6);g.lineTo(hx+1.6,hb2-4.6);g.lineTo(hx+2.6,hb2-3.4);g.stroke();
    g.restore();
    /* пробоины */
    for(const [x,y,r] of [[0.8,-4.6,0.9],[3.8,-2.6,0.7],[-3.2,-3.4,0.6]]){g.fillStyle='#050202';g.beginPath();g.ellipse(hx+x,hb2+y,r,r*0.85,0.3,0,TAU);g.fill();g.strokeStyle='#d0a070';g.lineWidth=0.3;g.stroke();
      g.strokeStyle='#1a0c08';g.lineWidth=0.3;for(let q=0;q<3;q++){const a=q*2.1+x;g.beginPath();g.moveTo(hx+x+Math.cos(a)*r,hb2+y+Math.sin(a)*r);g.lineTo(hx+x+Math.cos(a)*(r+1.1),hb2+y+Math.sin(a)*(r+1.1));g.stroke();}}
    g.fillStyle=shadeHex(C.hat,0.3);g.beginPath();g.arc(hx-3.6,hb2-0.2,0.45,0,TAU);g.arc(hx+4,hb2-0.2,0.45,0,TAU);g.fill();
    lmRim(g,q=>{q.strokeStyle='rgba(255,220,180,.35)';q.lineWidth=0.7;q.beginPath();q.moveTo(hx-5.2,hb2);q.quadraticCurveTo(hx-5.4,hb2-6,hx-0.4,hb2-7);q.stroke();});
    /* вмятина и потёк по лбу */
    g.strokeStyle=hexA(C.rust,0.8);g.lineWidth=0.7;g.lineCap='round';g.beginPath();g.moveTo(hx-2.4,hb2+1.4);g.lineTo(hx-2.6,hb2+3.2);g.stroke();
  }
  g.restore();
  /* контурный свет по мундиру */
  lmRim(g,q=>{q.strokeStyle='rgba(210,230,255,'+(T?0.2:0.4)+')';q.lineWidth=0.7;q.beginPath();q.moveTo(-4.5,Y(-15));q.lineTo(-4.9,Y(-23));q.quadraticCurveTo(-4.8,Y(-25.2),-3,Y(-25.4));q.stroke();});
  g.restore();
};
