'use strict';
/* ============================================================
   Модели мобов Зеркальных топей (Лиловые небеса): Отражение, Лебедь-обманщик, Лягушачий принц.
   Оба облика в одной функции, T — Истина; шея лебедя и язык лягушки в мире — lmMirrorSwanLong/lmMirrorFrogLong (из lilLongPart в 53)
   Помощники — с приставкой lmMirror
   ============================================================ */
/* многоугольник по списку точек */
function lmMirrorPoly(g,p){g.beginPath();g.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length;i++)g.lineTo(p[i][0],p[i][1]);g.closePath();}
/* сужающаяся трубка с круглыми концами (путь строится, заливка — снаружи) */
function lmMirrorTubePath(g,x0,y0,x1,y1,w0,w1){
  const an=Math.atan2(y1-y0,x1-x0),nx=-Math.sin(an),ny=Math.cos(an);
  g.beginPath();g.moveTo(x0+nx*w0/2,y0+ny*w0/2);g.lineTo(x1+nx*w1/2,y1+ny*w1/2);g.arc(x1,y1,w1/2,an+Math.PI/2,an-Math.PI/2,true);
  g.lineTo(x0-nx*w0/2,y0-ny*w0/2);g.arc(x0,y0,w0/2,an-Math.PI/2,an-Math.PI*1.5,true);g.closePath();
}
/* двухзвенная конечность: возвращает [конец, колено] */
function lmMirrorIK(hx,hy,fx,fy,l1,l2,back){
  const dx=fx-hx,dy=fy-hy,d=Math.min(l1+l2-0.01,Math.max(0.5,Math.hypot(dx,dy))),a=Math.atan2(dy,dx);
  const c=Math.acos(clamp((l1*l1+d*d-l2*l2)/(2*l1*d),-1,1)),ka=a+(back?c:-c);
  return [hx+Math.cos(a)*d,hy+Math.sin(a)*d,hx+Math.cos(ka)*l1,hy+Math.sin(ka)*l1];
}
/* стекло: объём, тень снизу, косые полосы света, светлая кромка внутри контура (путь уже построен) */
function lmMirrorGlass(g,col,cx,cy,r,o){
  o=o||{};
  mobPath(g,col,cx,cy,r,o.noLine);
  g.save();g.clip();
  g.fillStyle=o.low||'rgba(40,70,120,.28)';g.beginPath();g.ellipse(cx+r*0.25,cy+r*1.05,r*1.3,r*0.62,0,0,TAU);g.fill();
  const a=o.ang==null?-0.9:o.ang,ca=Math.cos(a),sa=Math.sin(a),sx=cx-r*0.45,sy=cy+r*0.1;
  g.lineCap='butt';
  g.strokeStyle='rgba(255,255,255,'+(o.sh||0.42)+')';g.lineWidth=r*0.3;g.beginPath();g.moveTo(sx-ca*r*2,sy-sa*r*2);g.lineTo(sx+ca*r*2,sy+sa*r*2);g.stroke();
  g.strokeStyle='rgba(255,255,255,'+((o.sh||0.42)*0.5)+')';g.lineWidth=r*0.11;g.beginPath();g.moveTo(sx+r*0.55-ca*r*2,sy-sa*r*2+r*0.2);g.lineTo(sx+r*0.55+ca*r*2,sy+sa*r*2+r*0.2);g.stroke();
  g.strokeStyle=o.rim||'rgba(190,240,255,.34)';g.lineWidth=2.2;g.lineJoin='round';g.stroke();
  g.restore();
}
/* четырёхлучевая искра */
function lmMirrorSpark(g,x,y,r,a,col){
  g.fillStyle=col||'rgba(255,255,255,'+a+')';g.beginPath();g.moveTo(x,y-r);g.quadraticCurveTo(x+r*0.12,y-r*0.12,x+r,y);g.quadraticCurveTo(x+r*0.12,y+r*0.12,x,y+r);g.quadraticCurveTo(x-r*0.12,y+r*0.12,x-r,y);g.quadraticCurveTo(x-r*0.12,y-r*0.12,x,y-r);g.fill();
}
/* трещина: тёмная ломаная со светящейся кромкой */
function lmMirrorCrack(g,pts,w,dark,glow){
  g.lineCap='round';g.lineJoin='round';
  g.strokeStyle=dark||'#050c10';g.lineWidth=w;g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.stroke();
  if(glow){g.strokeStyle=glow;g.lineWidth=w*0.32;g.beginPath();g.moveTo(pts[0][0]-0.25,pts[0][1]-0.25);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0]-0.25,pts[i][1]-0.25);g.stroke();}
}
/* кривая Безье по четырём точкам: n+1 отсчётов */
function lmMirrorBez(P,n){const o=[];for(let i=0;i<=n;i++){const f=i/n,u=1-f,a=u*u*u,b=3*u*u*f,c=3*u*f*f,d=f*f*f;o.push([a*P[0][0]+b*P[1][0]+c*P[2][0]+d*P[3][0],a*P[0][1]+b*P[1][1]+c*P[2][1]+d*P[3][1]]);}return o;}
/* края ленты вдоль ломаной: ширина плавно меняется от w0 до w1 */
function lmMirrorEdges(pts,w0,w1){
  const n=pts.length,L=[],R=[];
  for(let i=0;i<n;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(n-1,i+1)],an=Math.atan2(b[1]-a[1],b[0]-a[0]),w=(typeof w0==='function'?w0(i/(n-1)):w0+(w1-w0)*i/(n-1))/2;
    L.push([pts[i][0]-Math.sin(an)*w,pts[i][1]+Math.cos(an)*w]);R.push([pts[i][0]+Math.sin(an)*w,pts[i][1]-Math.cos(an)*w]);}
  return {L,R};
}
function lmMirrorRibbon(g,pts,w0,w1){
  const e=lmMirrorEdges(pts,w0,w1),n=pts.length;
  g.beginPath();g.moveTo(e.L[0][0],e.L[0][1]);for(let i=1;i<n;i++)g.lineTo(e.L[i][0],e.L[i][1]);for(let i=n-1;i>=0;i--)g.lineTo(e.R[i][0],e.R[i][1]);g.closePath();
  return e;
}
/* линия вдоль ленты со смещением off (доля ширины от -0.5 до 0.5); путь строится, обводка снаружи */
function lmMirrorRibbonLine(g,e,off,a,b){
  const n=e.L.length;a=a||0;b=b==null?n-1:b;g.beginPath();
  for(let i=a;i<=b;i++){const f=off+0.5,x=e.L[i][0]+(e.R[i][0]-e.L[i][0])*f,y=e.L[i][1]+(e.R[i][1]-e.L[i][1])*f;i===a?g.moveTo(x,y):g.lineTo(x,y);}
}
/* перо: заострённый лист от (x,y) под углом a, bend — изгиб кончика (доля длины) */
function lmMirrorFeather(g,x,y,a,len,wd,col,edge,shaft,bend){
  bend=bend||0;g.save();g.translate(x,y);g.rotate(a);
  const N=4,L=[],R=[];
  for(let i=0;i<=N;i++){const f=i/N,px=len*f,py=bend*len*f*f,sl=2*bend*f,nn=Math.hypot(1,sl),w=wd*0.5*Math.sin(Math.PI*Math.pow(f,0.8));
    L.push([px-sl/nn*w,py+w/nn]);R.push([px+sl/nn*w,py-w/nn]);}
  g.beginPath();g.moveTo(L[0][0],L[0][1]);for(let i=1;i<=N;i++)g.lineTo(L[i][0],L[i][1]);for(let i=N-1;i>=0;i--)g.lineTo(R[i][0],R[i][1]);g.closePath();
  g.fillStyle=col;g.fill();g.strokeStyle=edge;g.lineWidth=0.45;g.lineJoin='round';g.stroke();
  g.strokeStyle=shaft||'rgba(255,255,255,.6)';g.lineWidth=0.3;g.beginPath();g.moveTo(len*0.05,0);g.quadraticCurveTo(len*0.5,0,len*0.93,bend*len*0.86);g.stroke();
  g.restore();
}
/* Отражение: серебряный шахтёр из зеркальной воды / Пустая оболочка. y=0 — земля (FY). */
LM_MODEL.lmirror=function(g,m,FY,t,T,st,k,wv,ph){
  const walk=Math.abs(m.vx)>6,dash=st==='dash',wu=st==='windup'?k:0,air=!m.onGround;
  const sw=Math.sin(t*2.4+ph*3),bob=walk?Math.abs(Math.sin(wv))*0.5:0;
  g.save();g.translate(0,FY);
  /* лужа-зеркало под ногами */
  if(!T){
    g.beginPath();g.ellipse(0,-0.3,13.5,2.5,0,0,TAU);mobPath(g,'#4c7094',0,-0.4,13);
    g.fillStyle='rgba(215,244,255,.6)';g.beginPath();g.ellipse(-2,-0.9,8.4,1,0,0,TAU);g.fill();
    g.fillStyle='rgba(255,255,255,.5)';g.beginPath();g.ellipse(-6,-1,2.4,0.4,0,0,TAU);g.fill();
    /* отражение сапог вверх ногами */
    g.fillStyle='rgba(190,225,245,.35)';g.beginPath();g.ellipse(-1.4,0.9,2.6,0.7,0,0,TAU);g.ellipse(3.6,0.9,2.6,0.7,0,0,TAU);g.fill();
    for(let i=0;i<2;i++){const f=(t*0.45+i*0.5+ph)%1;g.strokeStyle='rgba(225,250,255,'+(0.55*(1-f))+')';g.lineWidth=0.55;g.beginPath();g.ellipse(0,-0.4,4+f*9,0.8+f*1.5,0,0,TAU);g.stroke();}
    for(let i=0;i<2;i++){const f=(t*0.6+i*0.5+ph*2)%1;g.fillStyle='rgba(225,250,255,'+(0.8*Math.sin(f*Math.PI))+')';g.beginPath();g.arc([-8,9][i],-1-f*7,0.5,0,TAU);g.fill();}
  }else{
    g.beginPath();g.ellipse(0,-0.2,14,2.7,0,0,TAU);mobPath(g,'#070d12',0,-0.4,13);
    g.strokeStyle='rgba(110,240,255,.45)';g.lineWidth=0.6;g.beginPath();g.ellipse(0,-0.4,13,2.2,0,Math.PI*1.05,Math.PI*1.9);g.stroke();
    /* в чёрной воде — бледное лицо прежнего шахтёра */
    g.fillStyle='rgba(205,240,245,.35)';g.beginPath();g.ellipse(-4.5,-0.8,2.6,0.8,0,0,TAU);g.fill();
    g.fillStyle='rgba(120,245,255,.8)';g.beginPath();g.ellipse(-5.4,-0.8,0.6,0.28,0,0,TAU);g.ellipse(-3.6,-0.8,0.6,0.28,0,0,TAU);g.fill();
    for(let i=0;i<2;i++){const f=(t*0.35+i*0.5+ph)%1;g.strokeStyle='rgba(110,240,255,'+(0.4*(1-f))+')';g.lineWidth=0.5;g.beginPath();g.ellipse(2,-0.4,3+f*9,0.7+f*1.4,0,0,TAU);g.stroke();}
  }
  /* наклон: назад на замахе, вперёд в рывке */
  g.save();
  const lean=dash?0.2:-wu*0.13+(walk?0.04:0);g.translate(0,-bob);g.rotate(lean);g.scale(0.96,0.96);
  const UY=-1.3;
  /* положение кирки и рук (верхняя часть тела) */
  const pa=dash?2.0:(0.42-wu*1.4+Math.sin(t*1.8)*0.04);
  const hx=dash?9.2:(7.6-wu*13.2),hy=dash?-17:(-16-wu*11.2);
  const sh=[3.2,-19.8],sh2=[-1,-19.8],bk=wu<0.3;
  const leg=(lx,off,far,mk)=>{const s=walk?lmStep(m,off,3):[0,0],ax=lx+s[0]*0.8+(air?(far?-1.5:1.5):0),ay=-2.6+s[1]*1.2-(air?2.4:0);mk(ax,ay,far);};
  if(!T){
    const C='#aed2e6',CL='#effcff',CD='#5f90ac',CK='#38607e',WM='#ffe8a0';
    const GL='#9fe8ff';
    lmRim(g,q=>{softGlow(q,0,-17,19,GL,0.22);});
    /* дальняя рука с фонарём — темнее и позади */
    g.save();g.translate(0,UY);
    const lw=air?[3.6,-12.5]:[8.8,-11.2+sw*0.3],ar=lmMirrorIK(sh2[0],sh2[1],lw[0],lw[1],6,6,true);
    lmMirrorTubePath(g,sh2[0],sh2[1],ar[2],ar[3],3.2,2.7);lmMirrorGlass(g,shadeHex(C,-0.3),ar[2],ar[3],3);
    lmMirrorTubePath(g,ar[2],ar[3],ar[0],ar[1],2.7,2.2);lmMirrorGlass(g,shadeHex(C,-0.3),ar[2],ar[3],3);
    /* фонарь: дужка, колпак, стёкла с огоньком, донце */
    g.save();g.translate(ar[0],ar[1]);g.rotate(Math.sin(t*2.1+ph)*0.1-0.05);
    g.strokeStyle='#5a7694';g.lineWidth=0.6;g.beginPath();g.arc(0,0.3,1.5,Math.PI,TAU);g.stroke();
    g.fillStyle='#8aa6c0';g.fillRect(-1.9,0.9,3.8,0.9);
    g.beginPath();g.rect(-1.7,1.8,3.4,4);mobPath(g,'#ffeab0',0,3.8,3);
    g.strokeStyle='#4c6684';g.lineWidth=0.5;g.beginPath();g.moveTo(0,1.8);g.lineTo(0,5.8);g.moveTo(-1.7,3.8);g.lineTo(1.7,3.8);g.stroke();
    g.fillStyle='#8aa6c0';g.fillRect(-2,5.7,4,0.9);
    lmRim(g,q=>{softGlow(q,0,3.8,9,'#ffdc80',0.7);});g.restore();
    mobBlob(g,ar[0],ar[1],1.6,1.5,CL,0,true);
    g.restore();
    for(const [lx,off,far] of [[-2.4,Math.PI,1],[2.2,0,0]])leg(lx,off,far,(ax,ay)=>{
      const col=far?shadeHex(C,-0.3):C;
      lmMirrorTubePath(g,lx*0.7,-11.5,ax,ay,3.9,3);lmMirrorGlass(g,col,lx,-7,5);
      /* сапог: голенище, нос, подошва */
      g.beginPath();g.moveTo(ax-2,ay-1.8);g.lineTo(ax+1.8,ay-1.8);g.lineTo(ax+1.9,ay+0.2);g.quadraticCurveTo(ax+5.6,ay+0.2,ax+5.4,ay+2.2);g.lineTo(ax-2.4,ay+2.3);g.closePath();
      mobPath(g,far?shadeHex(CD,-0.15):CD,ax+1,ay,4);
      g.fillStyle='rgba(255,255,255,.4)';g.fillRect(ax-1.6,ay-1.4,0.8,2.2);
      g.fillStyle=far?'#2e4c68':CK;g.fillRect(ax-2.4,ay+1.6,7.8,0.8);
    });
    g.save();g.translate(0,UY);
    /* туловище: комбинезон со шлейками, карманом и поясом */
    g.beginPath();g.moveTo(-4.8,-20.2);g.quadraticCurveTo(-5.9,-15,-4.4,-10.2);g.lineTo(4.6,-10.2);g.quadraticCurveTo(5.9,-15,5,-20.2);g.quadraticCurveTo(0,-22.6,-4.8,-20.2);g.closePath();
    lmMirrorGlass(g,C,-1,-16,8);
    g.save();g.clip();
    g.strokeStyle='rgba(60,95,130,.55)';g.lineWidth=0.9;g.beginPath();g.moveTo(-2.6,-21);g.lineTo(-1.8,-11.5);g.moveTo(2.6,-21.5);g.lineTo(2.9,-11.5);g.stroke();
    g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=0.3;g.beginPath();g.moveTo(-3.1,-21);g.lineTo(-2.3,-11.5);g.moveTo(2.1,-21.5);g.lineTo(2.4,-11.5);g.stroke();
    g.strokeStyle='rgba(235,250,255,.3)';g.lineWidth=0.4;for(const y0 of [-19.4,-16.4]){g.beginPath();for(let x=-6;x<=6;x+=1.5){const y=y0+Math.sin(x*0.9+t*2+y0)*0.45;x===-6?g.moveTo(x,y):g.lineTo(x,y);}g.stroke();}
    g.fillStyle='#86aac4';g.fillRect(-5.2,-13,10.8,2.2);g.fillStyle='rgba(255,255,255,.45)';g.fillRect(-5.2,-13,10.8,0.5);
    g.fillStyle='#f4fcff';g.fillRect(-1.2,-13.3,2.4,2.7);g.fillStyle='#5f90ac';g.fillRect(-0.5,-12.6,1,1.3);
    g.beginPath();g.rect(-3.8,-18.6,3.2,2.8);g.fillStyle='rgba(60,95,130,.3)';g.fill();g.strokeStyle='rgba(235,250,255,.6)';g.lineWidth=0.35;g.stroke();
    g.restore();
    /* ближняя рука: за головой при замахе */
    const arm=lmMirrorIK(sh[0],sh[1],hx,hy,5.8,6,bk);
    lmMirrorTubePath(g,sh[0],sh[1],arm[2],arm[3],3.4,2.9);lmMirrorGlass(g,C,arm[2],arm[3],3.4);
    lmMirrorTubePath(g,arm[2],arm[3],arm[0],arm[1],2.9,2.3);lmMirrorGlass(g,C,arm[2],arm[3],3.4);
    mobBlob(g,sh[0]+0.1,sh[1]+0.5,1.7,1.6,'#b4d4e8',0,true);
    /* голова: гладкое стекло лица, каска с лампой */
    g.save();g.translate(0.8,-19.6);g.scale(0.92,0.92);g.translate(-0.8,19.6);
    g.beginPath();g.arc(0.8,-25.4,6.2,0,TAU);lmMirrorGlass(g,'#c4def0',0.8,-25.4,6.2,{ang:-0.7});
    /* лицо: мягкие впадины глаз и тень улыбки */
    g.fillStyle='rgba(70,115,155,.5)';g.beginPath();g.ellipse(1.8,-24.6,1.25,1.65,0.05,0,TAU);g.ellipse(5.1,-24.8,1.1,1.55,0.05,0,TAU);g.fill();
    g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.arc(1.4,-25.3,0.55,0,TAU);g.arc(4.7,-25.5,0.5,0,TAU);g.fill();
    g.strokeStyle='rgba(70,115,155,.55)';g.lineWidth=0.5;g.lineCap='round';g.beginPath();g.moveTo(2,-21.8);g.quadraticCurveTo(3.8,-20.7,5.5,-22.2);g.stroke();
    g.fillStyle='rgba(255,170,200,.3)';g.beginPath();g.ellipse(0.6,-22.6,1.2,0.7,0,0,TAU);g.ellipse(6,-22.8,0.9,0.6,0,0,TAU);g.fill();
    /* каска: купол, ребро, околыш, налобная лампа */
    g.beginPath();g.moveTo(-6.4,-27.6);g.bezierCurveTo(-6.6,-33.8,-1,-36.4,3.4,-35.8);g.bezierCurveTo(7.4,-35.2,8.2,-31.4,8,-27.6);g.closePath();lmMirrorGlass(g,'#98b8d0',0.5,-31.5,7.6,{ang:-0.6,sh:0.5});
    g.strokeStyle='rgba(55,92,128,.7)';g.lineWidth=0.5;g.beginPath();g.moveTo(-4,-28.4);g.bezierCurveTo(-4.4,-32.4,-1,-34.6,2,-34.8);g.stroke();
    g.beginPath();g.moveTo(-1,-35.7);g.quadraticCurveTo(1.2,-31.6,1,-27.8);g.stroke();
    g.beginPath();g.moveTo(-7.8,-27.4);g.lineTo(9.8,-27.4);g.quadraticCurveTo(10.8,-26.6,9.6,-25.8);g.lineTo(-7.2,-25.8);g.quadraticCurveTo(-8.6,-26.4,-7.8,-27.4);g.closePath();
    mobPath(g,'#c4dcec',1,-26.6,9);g.fillStyle='rgba(255,255,255,.55)';g.fillRect(-6,-27.2,7,0.35);
    g.beginPath();g.arc(5.5,-31,2.1,0,TAU);mobPath(g,'#86a6c2',5.5,-31,2.1);
    g.beginPath();g.arc(6.1,-31,1.45,0,TAU);mobPath(g,'#fff4c8',6.1,-31,1.5,true);
    lmRim(g,q=>{softGlow(q,8.5,-30.5,10,'#ffe8a0',0.55+0.1*sw);});
    g.fillStyle='#fff';g.beginPath();g.arc(5.6,-31.6,0.45,0,TAU);g.fill();
    g.restore();
    /* кирка поверх головы: рукоять в обмотке, серебряное навершие */
    g.save();g.translate(hx,hy);g.rotate(pa);
    g.beginPath();g.rect(-0.9,-17.6,1.8,21);mobPath(g,'#d0e4f2',0,-7,9);
    g.fillStyle='rgba(55,92,128,.5)';for(const y of [-3.4,-1.8,-0.2,1.4])g.fillRect(-0.9,y,1.8,0.45);
    g.fillStyle='rgba(255,255,255,.6)';g.fillRect(-0.55,-16,0.45,12);
    g.fillStyle='#86a6c2';g.fillRect(-1.4,-18.6,2.8,2);
    g.beginPath();g.moveTo(-8.4,-13.4);g.quadraticCurveTo(-4.6,-19.8,0,-19.4);g.quadraticCurveTo(4.6,-19.8,8.4,-13.4);g.quadraticCurveTo(4.6,-16.8,0,-16.6);g.quadraticCurveTo(-4.6,-16.8,-8.4,-13.4);g.closePath();
    mobPath(g,'#eefaff',0,-17.4,8,false);
    g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=0.4;g.beginPath();g.moveTo(-7,-14.5);g.quadraticCurveTo(-3.6,-18.6,0,-18.4);g.stroke();
    g.fillStyle='rgba(60,100,140,.35)';g.beginPath();g.moveTo(8.4,-13.4);g.quadraticCurveTo(4.6,-19.8,0,-19.4);g.quadraticCurveTo(4.6,-16.8,8.4,-13.4);g.fill();
    g.restore();
    /* кулак на рукояти */
    mobBlob(g,hx,hy,1.8,1.6,CL);
    g.strokeStyle='rgba(60,100,140,.6)';g.lineWidth=0.35;g.beginPath();g.moveTo(hx-0.6,hy-1.4);g.lineTo(hx-0.6,hy+1.3);g.moveTo(hx+0.5,hy-1.5);g.lineTo(hx+0.5,hy+1.4);g.stroke();
    /* рывок: серебряная дуга удара */
    if(dash){g.strokeStyle='rgba(235,250,255,.55)';g.lineWidth=1.4;g.lineCap='round';g.beginPath();g.arc(2,-18,17,-2.5,0.35);g.stroke();g.strokeStyle='rgba(235,250,255,.3)';g.lineWidth=0.8;g.beginPath();g.arc(2,-18,12,-2.1,0.2);g.stroke();}
    /* контурный свет и искры по стеклу */
    lmRim(g,q=>{q.strokeStyle='rgba(235,252,255,.4)';q.lineWidth=0.9;q.lineCap='round';
      q.beginPath();q.arc(0.6,-25.4,5.8,Math.PI*1.05,Math.PI*1.55);q.stroke();q.beginPath();q.moveTo(-5.2,-19.4);q.lineTo(-5.8,-14.5);q.lineTo(-4.8,-10.5);q.stroke();});
    for(let i=0;i<3;i++){const f=(t*0.7+i*0.37+ph)%1,a=Math.sin(f*Math.PI);lmMirrorSpark(g,[-3,3.4,-1][i],[-17,-22,-30][i]+f*-1.5,1.6*a+0.3,0.85*a);}
    g.restore();
  }else{
    /* ИСТИНА — Пустая оболочка */
    const S='#5f8088',SL='#a8d0d4',SD='#2c464e',VD='#04080c',CY='#6af2ff',CW='#d8fcff';
    const jaw=0.3+wu*0.7+(dash?0.5:0)+Math.max(0,sw)*0.06;
    g.save();g.translate(0,UY);
    /* дальняя рука (длинная, в осколках) — темнее и позади */
    const faw=air?[5,-10]:[7.4,-9.4],ar=lmMirrorIK(sh2[0],sh2[1],faw[0],faw[1],6.4,6.6,true);
    lmMirrorTubePath(g,sh2[0],sh2[1],ar[2],ar[3],2.4,1.8);mobPath(g,shadeHex(S,-0.42),ar[2],ar[3],4);
    lmMirrorTubePath(g,ar[2],ar[3],ar[0],ar[1],1.8,1.1);mobPath(g,shadeHex(S,-0.42),ar[2],ar[3],4);
    for(let q=-1;q<=1;q++){g.strokeStyle=shadeHex(S,-0.2);g.lineWidth=0.7;g.lineCap='round';g.beginPath();g.moveTo(ar[0],ar[1]);g.lineTo(ar[0]+3.4+q*0.5,ar[1]+1.6+q*1.2);g.stroke();}
    g.fillStyle=shadeHex(S,-0.3);g.beginPath();g.moveTo(ar[2]-0.6,ar[3]-0.6);g.lineTo(ar[2]-3.2,ar[3]-2);g.lineTo(ar[2]+0.4,ar[3]+0.9);g.fill();
    g.restore();
    for(const [lx,off,far] of [[-2.2,Math.PI,1],[2,0,0]])leg(lx,off,far,(ax,ay)=>{
      ay+=0.8;
      const kn=lmMirrorIK(lx*0.6,-11.5,ax,ay,5.8,6,false),col=far?shadeHex(S,-0.42):shadeHex(S,-0.05);
      /* ноги-осколки с обратным коленом */
      lmMirrorTubePath(g,lx*0.6,-11.5,kn[2],kn[3],3,1.9);mobPath(g,col,lx,-9,5);
      lmMirrorTubePath(g,kn[2],kn[3],ax,ay,1.9,1.2);mobPath(g,col,ax,ay-2,5);
      g.fillStyle=shadeHex(col,0.12);g.beginPath();g.moveTo(kn[2],kn[3]-0.8);g.lineTo(kn[2]-2.8,kn[3]+0.4);g.lineTo(kn[2]+0.2,kn[3]+1.2);g.fill();
      g.beginPath();g.moveTo(ax-1,ay-0.8);g.lineTo(ax+6.4,ay+1.6);g.lineTo(ax-1.2,ay+1.8);g.closePath();mobPath(g,col,ax+2,ay+1,4);
    });
    g.save();g.translate(0,UY);
    /* рваный подол: свисающие осколки */
    for(const [x,l] of [[-3.6,3.8],[-0.8,5],[2,3.4],[4,2.6]]){g.save();g.translate(x,-9.4);g.rotate(Math.sin(t*2+x)*0.07);
      g.beginPath();g.moveTo(-1.4,0);g.lineTo(1.4,0);g.lineTo(0.2,l);g.closePath();mobPath(g,shadeHex(S,-0.1),0,1,3);g.restore();}
    /* оболочка-туловище: рамка стекла, внутри пустота */
    lmMirrorPoly(g,[[-5.8,-20.8],[-1.6,-22.8],[4.8,-21.6],[6,-19.2],[5.2,-14.2],[4.6,-10.2],[3,-8.8],[1.6,-10.6],[0.2,-8.4],[-1.4,-10.4],[-3,-8.2],[-4.2,-10.4],[-5.4,-14.6]]);
    mobPath(g,S,-1,-15,9);
    g.save();g.clip();
    lmMirrorPoly(g,[[-3.2,-21],[3.4,-21.2],[4,-16],[3,-12],[2.4,-8],[0.4,-10.4],[-1,-7.6],[-2.2,-10.2],[-3.6,-8],[-3.9,-13],[-3.4,-17]]);
    g.fillStyle=VD;g.fill();
    g.fillStyle='rgba(70,160,175,.2)';g.beginPath();g.ellipse(0,-17,3.4,5,0,0,TAU);g.fill();
    /* бледная рука изнутри прижата к стеклу */
    const hp=Math.sin(t*1.3+ph)*0.4;
    g.strokeStyle='rgba(200,235,235,.65)';g.lineWidth=0.6;g.lineCap='round';
    for(const [a,l] of [[-1.15,3.6],[-0.8,4.8],[-0.4,5],[0,4],[1.5,2.6]]){g.beginPath();g.moveTo(0.2,-13.2+hp);g.lineTo(0.2+Math.sin(a)*l*0.5,-13.2+hp-Math.cos(a)*l*0.5);g.lineTo(0.2+Math.sin(a)*l,-13.2+hp-Math.cos(a)*l);g.stroke();}
    g.fillStyle='rgba(210,240,238,.55)';g.beginPath();g.ellipse(0.2,-12.6+hp,1.3,1.2,0,0,TAU);g.fill();
    /* плавающие в пустоте осколки */
    for(let i=0;i<4;i++){const f=(t*0.22+i*0.27+ph)%1,x=-2.4+i*1.7+Math.sin(f*6.28)*0.7,y=-9.6-f*11;g.fillStyle='rgba(190,245,255,'+(0.75*Math.sin(f*Math.PI))+')';
      g.beginPath();g.moveTo(x,y-0.9);g.lineTo(x+0.7,y+0.6);g.lineTo(x-0.7,y+0.5);g.fill();}
    g.strokeStyle='rgba(235,255,255,.45)';g.lineWidth=0.6;g.beginPath();g.moveTo(-4.6,-19.8);g.lineTo(-4.6,-11);g.stroke();
    g.strokeStyle='rgba(170,230,235,.35)';g.lineWidth=1.6;g.beginPath();g.moveTo(4.6,-20);g.lineTo(5,-12);g.stroke();
    g.restore();
    lmMirrorCrack(g,[[-5.4,-18.4],[-3.6,-17],[-4.2,-14.6],[-3.4,-12.4]],0.6,'#050c10','#6af2ff');
    lmMirrorCrack(g,[[4.4,-21.4],[3.8,-19.2],[4.7,-17.8]],0.5,'#050c10','#6af2ff');
    lmRim(g,q=>{q.strokeStyle='rgba(120,245,255,.5)';q.lineWidth=0.5;q.beginPath();q.moveTo(-3.2,-21);q.lineTo(-3.4,-17);q.lineTo(-3.9,-13);q.lineTo(-3.6,-8);q.stroke();});
    /* ближняя рука (за головой при замахе) */
    const arm=lmMirrorIK(sh[0],sh[1],hx,hy,6,6.2,bk);
    lmMirrorTubePath(g,sh[0],sh[1],arm[2],arm[3],2.8,2);mobPath(g,S,arm[2],arm[3],4);
    lmMirrorTubePath(g,arm[2],arm[3],arm[0],arm[1],2,1.2);mobPath(g,S,arm[2],arm[3],4);
    g.fillStyle=S;g.strokeStyle=shadeHex(S,-0.6);g.lineWidth=0.8;g.beginPath();g.moveTo(arm[2]-0.6,arm[3]-0.4);g.lineTo(arm[2]-4,arm[3]-2.4);g.lineTo(arm[2]+0.2,arm[3]+1.4);g.closePath();g.fill();g.stroke();
    g.beginPath();g.moveTo(sh[0]-1.6,sh[1]-1.2);g.lineTo(sh[0]-3.4,sh[1]-4.4);g.lineTo(sh[0]+1.4,sh[1]-2);g.closePath();mobPath(g,shadeHex(S,0.1),sh[0],sh[1]-2,3);
    /* голова: огранённый череп-зеркало с трещиной, обломок каски с мёртвой лампой */
    lmMirrorPoly(g,[[-5.6,-26.4],[-3.8,-32.8],[2.4,-34.2],[6.8,-30.2],[7,-24.4],[4.4,-20],[-1.8,-19.4],[-4.8,-22.4]]);
    lmMirrorGlass(g,'#73949c',0.6,-26.6,7,{ang:-0.8,sh:0.3,low:'rgba(10,30,40,.35)',rim:'rgba(150,230,235,.3)'});
    lmMirrorCrack(g,[[2.6,-34],[1.6,-31.4],[3.2,-29.6],[2.2,-27.4]],0.8,'#030a0e','#6af2ff');
    lmMirrorCrack(g,[[3.2,-29.6],[5.8,-28.6],[6.6,-26.2]],0.55,'#030a0e','#6af2ff');
    lmMirrorCrack(g,[[-3.2,-31],[-1.2,-29],[-3,-26.4]],0.5,'#030a0e','#6af2ff');
    lmMirrorPoly(g,[[-6.8,-27.2],[-6.2,-32.6],[-1.4,-35.8],[1.8,-35.2],[-0.4,-32.6],[-1.2,-30.2],[-3.6,-28.6],[-4.4,-26.4]]);
    mobPath(g,'#6a8a96',-2.6,-31,5);g.strokeStyle='rgba(10,24,30,.7)';g.lineWidth=0.5;g.beginPath();g.moveTo(-5.4,-30.6);g.lineTo(-3,-33.8);g.stroke();
    g.strokeStyle='#2a3c42';g.lineWidth=0.7;g.beginPath();g.moveTo(1,-35);g.lineTo(1.4,-34.2);g.stroke();
    g.beginPath();g.arc(1.6,-34.2,1.7,0,TAU);mobPath(g,'#4a6068',1.6,-34.2,1.7);
    g.fillStyle='#0a1418';g.beginPath();g.arc(2,-34.2,1.1,0,TAU);g.fill();g.fillStyle=CY;g.beginPath();g.arc(2.3,-34.4,0.35,0,TAU);g.fill();
    /* глаза-щели: холодный свет и стекающие линии */
    for(const [ex,ey,r] of [[0.7,-27.2,1],[5,-27.6,0.9]]){
      g.fillStyle='#02080a';g.beginPath();g.moveTo(ex-2.2,ey-0.6*r);g.quadraticCurveTo(ex,ey-1.6*r,ex+2,ey+0.4*r);g.quadraticCurveTo(ex,ey+1.3*r,ex-2.2,ey-0.6*r);g.fill();
      lmRim(g,q=>{softGlow(q,ex,ey,5.6,CY,0.9);});
      g.fillStyle=CY;g.beginPath();g.moveTo(ex-1.7,ey-0.4*r);g.quadraticCurveTo(ex,ey-1.2*r,ex+1.6,ey+0.3*r);g.quadraticCurveTo(ex,ey+0.8*r,ex-1.7,ey-0.4*r);g.fill();
      g.fillStyle=CW;g.beginPath();g.ellipse(ex-0.1,ey-0.1,0.8,0.3,0.4,0,TAU);g.fill();
      g.strokeStyle='rgba(106,242,255,.5)';g.lineWidth=0.35;g.beginPath();g.moveTo(ex+0.2,ey+0.9);g.lineTo(ex+0.4,ey+2.6+Math.sin(t*3+ex)*0.3);g.stroke();}
    /* широкая оскаленная пасть */
    g.fillStyle=VD;g.beginPath();g.moveTo(-2.6,-23.6);g.quadraticCurveTo(2,-24.8,6.4,-24.2);g.quadraticCurveTo(5.4,-21.2-jaw*2.6,1.8,-20.6-jaw*2.8);g.quadraticCurveTo(-1.6,-21.2-jaw,-2.6,-23.6);g.closePath();g.fill();
    lmTeeth(g,-2.2,-23.8,6,8,1.6+jaw*0.6,CW);lmTeeth(g,-1.2,-21.2-jaw*2.4,5.2,7,1.4,'#b4e8ee',false);
    g.strokeStyle='#050c10';g.lineWidth=0.5;g.lineCap='round';g.beginPath();g.moveTo(-2.6,-23.6);g.lineTo(-4.2,-25.2);g.moveTo(6.4,-24.2);g.lineTo(7.2,-26.4);g.stroke();
    g.strokeStyle='rgba(60,200,215,.55)';g.lineWidth=0.35;g.lineCap='round';for(const [x,l] of [[0.2,1.8],[5.2,2.6]]){const dr=(t*0.8+x)%1,y0=-20.6-jaw*2.4;g.beginPath();g.moveTo(x,y0);g.lineTo(x+0.05,y0+l*dr);g.stroke();g.fillStyle='rgba(120,240,250,'+(0.8*(1-dr))+')';g.beginPath();g.arc(x+0.05,y0+l*dr+0.3,0.4,0,TAU);g.fill();}
    /* кирка-коса поверх головы: треснувшая рукоять, чёрное лезвие с холодной кромкой */
    g.save();g.translate(hx,hy);g.rotate(pa);
    g.beginPath();g.rect(-0.9,-17.6,1.8,21);mobPath(g,'#2a3c42',0,-7,9);
    g.fillStyle='#02080a';for(const y of [-9,-3.4])g.fillRect(-1,y,2,0.7);
    g.strokeStyle='#8a1a2a';g.lineWidth=0.9;g.beginPath();g.moveTo(-1,1.6);g.lineTo(1,0.4);g.moveTo(-1,-1);g.lineTo(1,-1.8);g.stroke();
    g.beginPath();g.moveTo(-5.4,-14);g.quadraticCurveTo(-2.8,-19.2,0,-19.4);g.quadraticCurveTo(7,-21,13.6,-13.2);g.lineTo(12,-12.8);g.quadraticCurveTo(7,-17.2,0,-16.8);g.quadraticCurveTo(-3,-16.6,-5.4,-14);g.closePath();
    mobPath(g,'#1a2a30',2,-17,10);
    g.fillStyle='#02080a';g.beginPath();g.moveTo(9,-18.4);g.lineTo(8.6,-17);g.lineTo(9.8,-17.6);g.fill();
    lmRim(g,q=>{q.strokeStyle='rgba(106,242,255,.6)';q.lineWidth=0.55;q.beginPath();q.moveTo(13.4,-13.4);q.quadraticCurveTo(7,-21,0.4,-19.2);q.stroke();});
    g.restore();
    /* когти-осколки на рукояти */
    g.strokeStyle='#8bb6bc';g.lineWidth=0.8;g.lineCap='round';
    for(const [a,l] of [[-0.9,3.2],[0.1,3.6],[1,3]]){g.beginPath();g.moveTo(hx,hy);g.lineTo(hx+Math.cos(pa-1.57+a)*l+0.2,hy+Math.sin(pa-1.57+a)*l+1.2);g.stroke();}
    g.fillStyle=S;g.beginPath();g.arc(hx,hy,1.3,0,TAU);g.fill();
    if(dash){g.strokeStyle='rgba(106,242,255,.5)';g.lineWidth=1.4;g.lineCap='round';g.beginPath();g.arc(2,-18,17,-2.5,0.35);g.stroke();}
    /* крошки стекла, отлетающие от тела */
    for(let i=0;i<4;i++){const f=(t*0.5+i*0.25+ph)%1,x=[-7,6.8,-5,7][i]+Math.sin(f*5+i)*1,y=[-24,-17,-12,-27][i]-f*5;
      g.fillStyle='rgba(180,240,248,'+(0.8*Math.sin(f*Math.PI))+')';g.beginPath();g.moveTo(x,y-1);g.lineTo(x+0.8,y+0.7);g.lineTo(x-0.8,y+0.6);g.fill();}
    lmRim(g,q=>{q.strokeStyle='rgba(170,240,245,.4)';q.lineWidth=0.8;q.lineCap='round';q.beginPath();q.moveTo(-5.8,-26);q.lineTo(-3.8,-32.4);q.lineTo(2.2,-33.8);q.stroke();
      q.beginPath();q.moveTo(-5.7,-20.6);q.lineTo(-1.6,-22.6);q.stroke();});
    g.restore();
  }
  g.restore();g.restore();
};
/* Лебедь-обманщик: стеклянно-белый красавец / тварь с шеей-червём. Начало координат — середина тела, шея растёт из (7.2,-5.2). */
/* крыло веером: три ряда перьев от плеча (A — ось, pal — три тона) */
function lmMirrorSwanWing(g,sx,sy,A,pal,edge,k,bnd,spr){
  bnd=bnd==null?0.1:bnd;spr=spr||1;
  const rows=[[7,18.5,4.2,0.22,0],[6,13,3.8,0.26,0.06],[5,7.6,3.3,0.32,0.03]];
  rows.forEach(([n,len,wd,sp,off],ri)=>{
    for(let i=0;i<n;i++){const a=A+(i-(n-1)/2)*sp*spr+off,c=pal[ri];
      lmMirrorFeather(g,sx+Math.cos(A)*ri*1.4,sy+Math.sin(A)*ri*1.4,a+Math.sin(k*3+i)*0.02,len*(1-Math.abs(i-(n-1)/2)*0.012),wd,shadeHex(c,i%2?-0.05:0.02),edge,null,bnd);}
  });
}
/* голова: начало — конец шеи, +x вдоль головы; jaw — раскрытие пасти */
function lmMirrorSwanHead(g,T,t,jaw,ph,m){
  const bl=(Math.sin((m.anim||0)*1.1+ph*7)>0.985)?0.15:1,lk=m.lookX||0;
  if(!T){
    /* череп */
    g.beginPath();g.ellipse(1.2,0,3.3,2.7,0.05,0,TAU);mobPath(g,'#f6fcfe',0.4,-0.8,3.6);
    /* чёрная «маска» у основания клюва и вокруг глаза */
    g.fillStyle='#24242c';g.beginPath();g.moveTo(2.4,-1.8);g.quadraticCurveTo(3.6,-2.1,4.6,-1.2);g.lineTo(4.8,0.6);g.quadraticCurveTo(3.4,1.8,2,1.4);g.quadraticCurveTo(1,0.2,2.4,-1.8);g.fill();
    /* нижняя часть клюва (чуть раскрывается) */
    g.save();g.translate(3.2,0.9);g.rotate(jaw*0.35);g.beginPath();g.moveTo(0,-0.3);g.lineTo(7.4,-0.1);g.quadraticCurveTo(8,0.4,7.2,0.7);g.lineTo(0.2,1.1);g.closePath();
    g.fillStyle='#e8751c';g.fill();g.strokeStyle='#6a3008';g.lineWidth=0.5;g.lineJoin='round';g.stroke();g.restore();
    /* верхняя часть клюва: гребень, ноздря, чёрный коготок */
    g.beginPath();g.moveTo(3,-1.7);g.quadraticCurveTo(7.4,-1.9,11.8,-0.5);g.quadraticCurveTo(12.6,0.1,11.8,0.7);g.lineTo(3.4,0.9);g.closePath();
    g.fillStyle='#ff9c34';g.fill();g.strokeStyle='#6a3008';g.lineWidth=0.5;g.stroke();
    g.fillStyle='#ffcf7a';g.beginPath();g.moveTo(4,-1.4);g.quadraticCurveTo(8,-1.6,11,-0.6);g.quadraticCurveTo(8,-0.8,4,-0.4);g.fill();
    g.fillStyle='rgba(180,70,10,.45)';g.beginPath();g.moveTo(3.6,0.3);g.lineTo(11.4,0.2);g.lineTo(11.4,0.7);g.lineTo(3.4,0.9);g.fill();
    g.fillStyle='#2a1a14';g.beginPath();g.ellipse(6.6,-0.5,0.9,0.3,0.1,0,TAU);g.fill();
    g.beginPath();g.moveTo(11,-0.7);g.quadraticCurveTo(12.8,-0.4,12,0.6);g.lineTo(11,0.7);g.closePath();g.fill();
    g.fillStyle='#24242c';g.beginPath();g.moveTo(2.8,-1.8);g.quadraticCurveTo(3.6,-3.4,4.6,-1.7);g.closePath();g.fill();
    /* глаз с бликом и веком */
    g.fillStyle='#fffaf2';g.beginPath();g.ellipse(2.1,-0.5,0.95,0.85*bl,0,0,TAU);g.fill();
    if(bl>0.5){g.fillStyle='#0c0c14';g.beginPath();g.arc(2.3+lk*0.2,-0.5,0.62,0,TAU);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(2.05,-0.8,0.25,0,TAU);g.fill();}
    g.strokeStyle='rgba(60,70,90,.7)';g.lineWidth=0.35;g.beginPath();g.ellipse(2.1,-0.5,1,0.9*bl,0,Math.PI*1.05,Math.PI*1.95);g.stroke();
    lmRim(g,q=>{q.strokeStyle='rgba(255,255,255,.7)';q.lineWidth=0.7;q.beginPath();q.ellipse(1.2,0,3.2,2.6,0.05,Math.PI*1.1,Math.PI*1.55);q.stroke();});
  }else{
    const FL='#dcaaa6',FD='#8a4650',BL='#8a0c1c';
    /* нижняя челюсть: отвисает, зубы-иглы, язык, слюна и кровь (позади черепа) */
    g.save();g.translate(0.2,1.2);g.rotate(0.14+jaw*0.7);
    g.beginPath();g.moveTo(-1.8,0.2);g.lineTo(7.6,0.4);g.quadraticCurveTo(8.6,1.8,7,2.8);g.lineTo(-0.6,3.2);g.quadraticCurveTo(-2.6,2.4,-1.8,0.2);g.closePath();mobPath(g,shadeHex(FL,-0.14),3,1.8,5);
    g.fillStyle='#3a0612';g.beginPath();g.moveTo(-0.2,0.3);g.lineTo(7.2,0.5);g.lineTo(6.2,1.9);g.lineTo(0.2,2.2);g.closePath();g.fill();
    g.fillStyle='#c4506a';g.beginPath();g.moveTo(0.8,0.9);g.quadraticCurveTo(3.6,0.1+Math.sin(t*3)*0.3,6.4,1.1);g.quadraticCurveTo(3.6,2.6,0.8,2.1);g.closePath();g.fill();
    g.strokeStyle='#8a2a44';g.lineWidth=0.3;g.beginPath();g.moveTo(1.2,1.4);g.lineTo(5.6,1.2);g.stroke();
    lmTeeth(g,0.2,0.5,7.2,7,1.8,'#fff4e6',false);
    g.fillStyle=BL;g.beginPath();g.moveTo(5.2,2.8);g.lineTo(6.4,2.6);g.lineTo(5.9,3.6+1.4+Math.sin(t*2)*0.5);g.closePath();g.fill();
    g.restore();
    /* череп без перьев: округлый, со складками и венами */
    g.beginPath();g.moveTo(-4,-0.2);g.bezierCurveTo(-4,-4.8,1.4,-5,4.4,-3.4);g.bezierCurveTo(6.6,-2.4,8,-1.6,8.8,-0.6);g.lineTo(8.6,0.8);g.lineTo(1.2,1.8);g.bezierCurveTo(-2.4,2.6,-4.2,2,-4,-0.2);g.closePath();
    mobPath(g,FL,0.2,-1.8,7);
    g.save();g.clip();
    g.strokeStyle='rgba(120,24,40,.55)';g.lineWidth=0.35;g.beginPath();g.moveTo(-2.4,-3.4);g.quadraticCurveTo(0,-4.2,2.4,-3.4);g.moveTo(0,-4.2);g.lineTo(-0.4,-2.2);g.moveTo(1.6,-3.8);g.quadraticCurveTo(3,-3,2.8,-1.6);g.moveTo(-3,-1.2);g.quadraticCurveTo(-2,0.4,-2.8,1.4);g.stroke();
    g.strokeStyle='rgba(120,70,70,.5)';g.lineWidth=0.4;g.beginPath();g.moveTo(4.2,-3);g.quadraticCurveTo(4.8,-1.8,4.4,-0.8);g.moveTo(5.6,-2.6);g.quadraticCurveTo(6.2,-1.6,5.8,-0.6);g.stroke();
    g.fillStyle='rgba(255,230,220,.45)';g.beginPath();g.ellipse(-0.8,-3.6,3,0.8,-0.1,0,TAU);g.fill();
    g.fillStyle='rgba(60,10,20,.28)';g.beginPath();g.ellipse(1,2.2,6,1.4,0,0,TAU);g.fill();
    g.restore();
    /* верхняя челюсть: дёсны и иглы */
    g.fillStyle='#3a0612';g.beginPath();g.moveTo(0.6,0.6);g.lineTo(8.8,-0.2);g.lineTo(8.2,1.2+jaw*1.2);g.lineTo(1,2+jaw*1.4);g.closePath();g.fill();
    g.fillStyle='#b84060';g.fillRect(1,0.5,7.8,0.7);
    lmTeeth(g,1.2,0.9,8.6,8,2.2,'#fff8ee');
    /* глаза: молочные, налитые, под тяжёлым веком */
    for(const [ex,ey,r,dk] of [[3,-3.2,1.05,1],[1.4,-1.8,1.65,0]]){
      g.fillStyle=dk?'#a88880':'#f0e6d2';g.beginPath();g.ellipse(ex,ey,r,r*0.95,0,0,TAU);g.fill();
      g.strokeStyle='rgba(180,20,40,.7)';g.lineWidth=0.25;for(const a of [0.5,2,3.6,5]){g.beginPath();g.moveTo(ex+Math.cos(a)*r,ey+Math.sin(a)*r);g.lineTo(ex+Math.cos(a)*r*0.45,ey+Math.sin(a)*r*0.45);g.stroke();}
      g.fillStyle=dk?'#8a1020':'#d01a30';g.beginPath();g.arc(ex+0.3+lk*0.2,ey+0.1,r*0.5,0,TAU);g.fill();g.fillStyle='#150004';g.beginPath();g.arc(ex+0.35+lk*0.2,ey+0.1,r*0.22,0,TAU);g.fill();
      g.strokeStyle=FD;g.lineWidth=0.55;g.beginPath();g.moveTo(ex-r*1.1,ey-0.1);g.quadraticCurveTo(ex,ey-r*1.35,ex+r*1.1,ey+0.1);g.stroke();
      if(!dk){lmRim(g,q=>{softGlow(q,ex,ey,3.8,'#ff3a50',0.32);});}}
    g.fillStyle='#2a0612';g.beginPath();g.ellipse(8,-1.2,0.4,0.25,0.4,0,TAU);g.fill();
    lmRim(g,q=>{q.strokeStyle='rgba(255,230,220,.45)';q.lineWidth=0.7;q.beginPath();q.moveTo(-3.4,-2.8);q.quadraticCurveTo(0,-5,4.4,-3.6);q.stroke();});
  }
}
/* тело шеи по ломаной: перья или плоть (w0, w1 — ширина у тела и у головы) */
function lmMirrorSwanNeck(g,pts,w0,w1,T,t,wu,flat){
  const e=lmMirrorRibbon(g,pts,w0,w1);
  if(flat){g.fillStyle=T?'#d9a7a3':'#f2fafc';g.fill();g.strokeStyle=T?'#3a1218':'#40586a';g.lineWidth=1.1;g.lineJoin='round';g.stroke();g.beginPath();g.arc(pts[0][0],pts[0][1],w0*0.5-0.5,0,TAU);g.fill();lmMirrorRibbon(g,pts,w0,w1);}
  else mobPath(g,T?'#d9a7a3':'#f2fafc',pts[8][0],pts[8][1],w0*2);
  g.save();g.clip();
  /* тень снизу-справа и свет сверху-слева */
  g.strokeStyle=T?'rgba(90,30,44,.45)':'rgba(90,140,170,.4)';g.lineWidth=w0*0.4;g.lineCap='round';lmMirrorRibbonLine(g,e,0.38);g.stroke();
  g.strokeStyle=T?'rgba(255,236,224,.55)':'rgba(255,255,255,.75)';g.lineWidth=w0*0.16;lmMirrorRibbonLine(g,e,-0.3);g.stroke();
  if(!T){
    /* перьевая гладь: тонкие поперечные штрихи */
    g.strokeStyle='rgba(120,165,190,.38)';g.lineWidth=0.35;for(let i=2;i<pts.length-1;i+=2){g.beginPath();g.moveTo(e.L[i][0],e.L[i][1]);g.lineTo((e.R[i][0]+e.L[i][0])/2+0.4,(e.R[i][1]+e.L[i][1])/2+0.9);g.stroke();}
  }else{
    /* кольца плоти, вены, швы */
    g.strokeStyle='rgba(106,42,52,.4)';g.lineWidth=0.5;for(let i=1;i<pts.length-1;i+=2){g.beginPath();g.moveTo(e.L[i][0],e.L[i][1]);g.quadraticCurveTo((e.L[i][0]+e.R[i][0])/2+0.5,(e.L[i][1]+e.R[i][1])/2+0.3,e.R[i][0],e.R[i][1]);g.stroke();}
    g.strokeStyle='rgba(255,226,214,.3)';g.lineWidth=0.3;for(let i=1;i<pts.length-1;i+=2){g.beginPath();g.moveTo(e.L[i][0],e.L[i][1]-0.3);g.quadraticCurveTo((e.L[i][0]+e.R[i][0])/2+0.5,(e.L[i][1]+e.R[i][1])/2,e.R[i][0],e.R[i][1]-0.3);g.stroke();}
    g.strokeStyle='rgba(168,24,44,.75)';g.lineWidth=0.4;lmMirrorRibbonLine(g,e,0.1,2,pts.length-3);g.stroke();lmMirrorRibbonLine(g,e,-0.22,4,pts.length-2);g.stroke();
    g.strokeStyle='#40121e';g.lineWidth=0.4;const i0=Math.floor(pts.length*0.5);g.beginPath();g.moveTo(pts[i0][0]-1.8,pts[i0][1]);g.lineTo(pts[i0+3][0]+1.8,pts[i0+3][1]);g.stroke();
    for(let q=0;q<4;q++){const px=pts[i0][0]-1.2+q*(pts[i0+3][0]-pts[i0][0]+2.4)/3,py=pts[i0][1]+(pts[i0+3][1]-pts[i0][1])*q/3;g.beginPath();g.moveTo(px-0.5,py-0.9);g.lineTo(px+0.5,py+0.9);g.stroke();}
  }
  g.restore();
  if(T){
    /* глаз на шее: открывается на замахе */
    const ep=pts[Math.floor(pts.length*0.28)],o=0.4+wu*0.6;
    g.fillStyle='#4a0612';g.beginPath();g.ellipse(ep[0],ep[1],1.6,1.3*o,0.3,0,TAU);g.fill();
    g.fillStyle='#e8dcc4';g.beginPath();g.ellipse(ep[0],ep[1],1.25,0.95*o,0.3,0,TAU);g.fill();g.fillStyle='#c8182c';g.beginPath();g.arc(ep[0]+0.2,ep[1],0.5*o,0,TAU);g.fill();
    g.strokeStyle='#6a2a34';g.lineWidth=0.4;g.beginPath();g.ellipse(ep[0],ep[1],1.7,1.4*o,0.3,0,TAU);g.stroke();
  }
  lmRim(g,q=>{q.strokeStyle=T?'rgba(255,226,214,.4)':'rgba(255,255,255,.6)';q.lineWidth=0.7;q.lineCap='round';lmMirrorRibbonLine(q,e,-0.42,5,pts.length-3);q.stroke();});
  return e;
}
LM_MODEL.lswan=function(g,m,FY,t,T,st,k,wv,ph){
  const wu=st==='neckw'?k:(st==='neck'?1:0),gu=st==='gustw'?k:0,ext=(m.ext||0)>0.01;
  const fl=Math.sin(t*6+ph),ff=m.facing||1;
  const hv=Math.sin(t*1.7+ph)*0.4;
  /* направление головы: вниз-вперёд, на замахе — на цель */
  let aim=0.36;
  if(wu>0&&m.ax!==undefined){const dx=(m.ax-m.x)*ff-10,dy=m.ay-(m.y-m.h*0.7);aim=lerp(0.36,clamp(Math.atan2(dy,Math.abs(dx)||1),-0.9,0.9),wu);}
  const A1=-2.3+fl*0.3-gu*0.6-wu*0.15,A2=T?-1.95:A1-0.42;
  const Bd=!T?'#ecf6f8':'#e0e0e4';
  const wp=!T?['#ffffff','#e8f4f8','#c8e0ea']:['#fdfdff','#e6eef6','#c4d4e4'],we='rgba(90,130,155,.55)';
  /* свечение стекла за телом */
  if(!T)lmRim(g,q=>{softGlow(q,-1,-3,22,'#a8ecff',0.2);});
  /* дальнее крыло: в Истине — голые кости с клочьями перьев */
  g.save();
  if(!T)lmMirrorSwanWing(g,1.5,-7,A2,wp.map(c=>shadeHex(c,-0.2)),'rgba(60,100,125,.6)',t,0.1,1+gu*0.3);
  else{
    const sx=1.5,sy=-7,w1=[sx+Math.cos(A2)*7.4,sy+Math.sin(A2)*7.4],bone='#d8d0bc',bd='#6e6252',Ls=[15,19,17,14,11],an=[-0.6,-0.25,0.1,0.42,0.75];
    /* рваная перепонка */
    g.fillStyle='#7c5a6a';g.strokeStyle='#2a1a24';g.lineWidth=0.5;g.beginPath();g.moveTo(sx,sy);g.lineTo(w1[0],w1[1]);
    for(let i=0;i<5;i++){const a=A2+an[i],l=Ls[i];g.lineTo(w1[0]+Math.cos(a)*l*0.86,w1[1]+Math.sin(a)*l*0.86);if(i<4){const a2=A2+(an[i]+an[i+1])/2,l2=l*(i%2?0.46:0.62);g.lineTo(w1[0]+Math.cos(a2)*l2,w1[1]+Math.sin(a2)*l2);}}
    g.lineTo(sx+Math.cos(A2+1.1)*3,sy+Math.sin(A2+1.1)*3);g.closePath();g.fill();g.stroke();
    g.strokeStyle='rgba(30,10,20,.5)';g.lineWidth=0.4;for(let i=0;i<5;i++){const a=A2+an[i];g.beginPath();g.moveTo(w1[0],w1[1]);g.lineTo(w1[0]+Math.cos(a)*Ls[i]*0.8,w1[1]+Math.sin(a)*Ls[i]*0.8);g.stroke();}
    g.lineCap='round';g.strokeStyle=bd;g.lineWidth=2;g.beginPath();g.moveTo(sx,sy);g.lineTo(w1[0],w1[1]);g.stroke();
    g.strokeStyle=bone;g.lineWidth=1.1;g.beginPath();g.moveTo(sx,sy);g.lineTo(w1[0],w1[1]);g.stroke();
    for(let i=0;i<5;i++){const a=A2+an[i],l=Ls[i];g.strokeStyle=bd;g.lineWidth=1.1;g.beginPath();g.moveTo(w1[0],w1[1]);g.lineTo(w1[0]+Math.cos(a)*l,w1[1]+Math.sin(a)*l);g.stroke();
      g.strokeStyle=bone;g.lineWidth=0.55;g.beginPath();g.moveTo(w1[0],w1[1]);g.lineTo(w1[0]+Math.cos(a)*l,w1[1]+Math.sin(a)*l);g.stroke();}
    for(const [i,l] of [[1,9],[3,7]]){const a=A2+an[i];lmMirrorFeather(g,w1[0]+Math.cos(a)*4,w1[1]+Math.sin(a)*4,a+0.25,l,3,'#c8d4e0','rgba(60,70,90,.6)',null,0.1);}
    g.fillStyle=bone;g.beginPath();g.arc(w1[0],w1[1],1.4,0,TAU);g.fill();g.strokeStyle=bd;g.lineWidth=0.4;g.stroke();
  }
  g.restore();
  /* ноги позади тела: в Истине — длинные костлявые пальцы */
  g.save();
  for(const [lx,ly,dk] of [[-6,3.2,1],[-3,3.8,0]]){
    const tx=lx-7.4-Math.sin(t*3+lx)*0.6,ty=ly+3.4+Math.sin(t*3+lx)*0.5;
    if(!T){g.strokeStyle=dk?'#3a4252':'#566074';g.lineWidth=1.2;g.lineCap='round';g.beginPath();g.moveTo(lx,ly);g.lineTo(tx,ty);g.stroke();
      g.beginPath();g.moveTo(tx+0.4,ty-0.3);g.quadraticCurveTo(tx-2.4,ty-2,tx-3.6,ty-0.8);g.quadraticCurveTo(tx-4.2,ty+0.6,tx-3.4,ty+1.9);g.quadraticCurveTo(tx-1.6,ty+1.3,tx+0.4,ty+0.5);g.closePath();mobPath(g,dk?'#3e4658':'#68748a',tx-2.4,ty,3);
      g.strokeStyle='rgba(20,26,40,.6)';g.lineWidth=0.35;for(const q of [-1.6,0,1.6]){g.beginPath();g.moveTo(tx,ty);g.lineTo(tx-3.5,ty+q*0.9+0.4);g.stroke();}}
    else{g.strokeStyle=dk?'#6a5a52':'#b8a898';g.lineWidth=1;g.lineCap='round';g.beginPath();g.moveTo(lx,ly);g.lineTo(lx-4,ly+0.6);g.lineTo(tx,ty);g.stroke();
      for(let q=-1;q<=1;q++){g.lineWidth=0.7;g.beginPath();g.moveTo(tx,ty);g.lineTo(tx-5,ty+q*2+0.4);g.stroke();g.fillStyle='#2a1a1a';g.beginPath();g.arc(tx-5,ty+q*2+0.4,0.45,0,TAU);g.fill();}}
  }
  g.restore();
  /* хвост: веер перьев */
  for(let i=0;i<5;i++){const a=Math.PI+0.17*(i-2)-0.45;lmMirrorFeather(g,-15,-5,a,6.6-Math.abs(i-2)*0.5,2.6,shadeHex(wp[1],-0.04),we,null,-0.08);}
  /* тело: узкая ладья с загнутым хвостом */
  g.beginPath();g.moveTo(-20,-9.6);g.bezierCurveTo(-15,-5.2,-10,-7.4,-4,-7.4);g.bezierCurveTo(2,-7.4,7,-8.4,10.4,-5.6);g.bezierCurveTo(13.6,-2.8,11.6,3.6,4,4.8);g.bezierCurveTo(-3,5.8,-12,4,-20,-9.6);g.closePath();
  mobPath(g,Bd,-4,-4,16);
  g.save();g.clip();
  /* тень брюха */
  g.fillStyle=!T?'rgba(80,130,160,.3)':'rgba(40,40,60,.34)';g.beginPath();g.ellipse(-2,6.6,16,3.4,0,0,TAU);g.fill();
  /* ряды перьев: чешуйки-дуги */
  g.lineCap='round';
  for(let r=0;r<3;r++){const y=-4.2+r*3.1;for(let x=-12+(r%2)*1.8;x<9;x+=3.6){
    g.strokeStyle=!T?'rgba(110,160,185,.5)':'rgba(100,100,125,.5)';g.lineWidth=0.45;g.beginPath();g.arc(x,y,1.9,0.15,Math.PI-0.15);g.stroke();
    g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=0.3;g.beginPath();g.arc(x,y-0.5,1.8,Math.PI*1.1,Math.PI*1.9);g.stroke();}}
  if(T){
    /* рана на боку: рёбра и тёмное мясо */
    g.save();g.translate(-6,0.4);g.scale(0.78,0.66);g.translate(6,-0.4);
    g.fillStyle='#4a0612';g.beginPath();g.moveTo(-9,-1);g.quadraticCurveTo(-6.4,-3.6,-3,-1.8);g.quadraticCurveTo(-1.6,1.4,-4.4,4.2);g.quadraticCurveTo(-8,5,-9.6,2.4);g.closePath();g.fill();
    g.strokeStyle='#c8bca8';g.lineWidth=1.1;g.lineCap='round';for(let i=0;i<3;i++){g.beginPath();g.moveTo(-8.6+i*0.3,-0.4+i*1.7);g.quadraticCurveTo(-5.4,-1.6+i*1.7,-2.6+i*0.3,0.4+i*1.6);g.stroke();}
    g.strokeStyle='#e8dcc8';g.lineWidth=0.5;for(let i=0;i<3;i++){g.beginPath();g.moveTo(-8.4+i*0.3,-0.8+i*1.7);g.quadraticCurveTo(-5.4,-2+i*1.7,-2.8+i*0.3,0.1+i*1.6);g.stroke();}
    g.restore();
    g.strokeStyle='#8a0c1c';g.lineWidth=0.5;g.beginPath();g.moveTo(-6,4);g.lineTo(-6.4,6.4);g.moveTo(-8.6,2.4);g.lineTo(-9,5);g.stroke();
    /* кровавые потёки на грудных перьях */
    g.fillStyle='rgba(138,12,28,.55)';for(const [x,y,l] of [[6,-3,5],[8.4,-2,3.6],[4,-4,3]]){g.beginPath();g.moveTo(x-0.7,y);g.lineTo(x+0.7,y);g.lineTo(x+0.2,y+l);g.closePath();g.fill();}
  }
  g.restore();
  /* контурный свет по спине и груди */
  lmRim(g,q=>{q.strokeStyle=!T?'rgba(255,255,255,.55)':'rgba(255,255,255,.35)';q.lineWidth=0.9;q.lineCap='round';q.beginPath();q.moveTo(-17,-8.4);q.bezierCurveTo(-13,-5.6,-9.6,-7.6,-3,-7.4);q.stroke();q.beginPath();q.moveTo(9.8,-6.8);q.quadraticCurveTo(12.6,-3,11.6,0);q.stroke();});
  /* шея: пока не бьёт, рисуем её в модели; в броске — рисует мир */
  const sw=wu*0.12+1,P=[[7.2,-5.2],[lerp(21,16,wu),lerp(-7.6,-7.4,wu)+gu*1],[lerp(-4,3,wu)-gu*3,lerp(-15,-8.4,wu)],[lerp(9+Math.sin(t*1.3+ph)*0.4,-1.5,wu)-gu*4,lerp(-23.5+hv,-19,wu)+gu*1.5]];
  if(!ext){
    const pts=lmMirrorBez(P,22),w0=(T?7:4.8)*sw,w1=(T?5.2:2.8)*sw,e=lmMirrorSwanNeck(g,pts,w0,w1,T,t,wu,1);
    /* голова на конце шеи */
    const he=pts[pts.length-1];g.save();g.translate(he[0],he[1]);g.rotate(aim);
    lmMirrorSwanHead(g,T,t,T?0.4+wu*0.6+Math.max(0,Math.sin(t*2+ph))*0.1:wu*0.5,ph,m);g.restore();
  }else{
    /* шея вытянута: в основании — гнездо плоти (само тело шеи рисует мир) */
    if(T){g.fillStyle='#6a1a2a';g.beginPath();g.ellipse(7.6,-5.4,3.4,2.8,0.3,0,TAU);g.fill();g.fillStyle='#d9a7a3';g.beginPath();g.ellipse(7.8,-5.6,2.6,2.1,0.3,0,TAU);g.fill();}
    else{g.fillStyle='#f2fafc';g.beginPath();g.ellipse(7.8,-5.6,2.6,2.3,0.3,0,TAU);g.fill();}
  }
  /* воротник: пух у основания шеи; в Истине — рваные перья вокруг раны */
  if(!T){lmFluff(g,8,-4.2,3.8,3.2,8,0.22,2.2);mobPath(g,'#ffffff',6,-6.4,8.5,true);g.strokeStyle='rgba(110,160,185,.5)';g.lineWidth=0.4;g.stroke();}
  else for(let i=0;i<6;i++){const a=-0.5-i*0.42+Math.sin(i*5)*0.15;lmMirrorFeather(g,7.2+Math.cos(a)*1.5,-4.6+Math.sin(a)*1,a+1.2,i%2?4:2.6,1.7,i%3===0?'#c8b0a8':'#e4e4ea',we);}
  if(T){g.fillStyle='rgba(138,12,28,.6)';g.beginPath();g.moveTo(4.6,-4);g.lineTo(11,-3.4);g.lineTo(9.6,-1.2);g.lineTo(7.4,-2.4);g.lineTo(5.6,-0.8);g.closePath();g.fill();}
  /* ближнее крыло: веер перьев, взмах */
  lmMirrorSwanWing(g,-2,-5.6,A1,wp,we,t,0.1,1+gu*0.3);
  if(T){g.fillStyle='rgba(138,12,28,.35)';g.beginPath();g.ellipse(-3.4,-6.4,1.4,0.7,-0.6,0,TAU);g.fill();}
  /* искры стекла */
  if(!T)for(let i=0;i<3;i++){const f=(t*0.6+i*0.34+ph)%1,a=Math.sin(f*Math.PI);lmMirrorSpark(g,[-14,2,-8][i],[-12,-12,4][i]-f*2,1.7*a+0.2,0.8*a);}
};
/* Лягушачий принц: мятный сказочный принц с лотосом / раздутая жаба-язык-рука. y=0 — земля (FY). Рот — около (11.3,-15). */
/* пальцы-ласты: n округлых пальцев веером от (x,y) вперёд */
function lmMirrorToes(g,x,y,a0,n,len,wd,col,spread){
  for(let i=0;i<n;i++){const a=a0+(i-(n-1)/2)*spread,ex=x+Math.cos(a)*len,ey=y+Math.sin(a)*len;
    lmMirrorTubePath(g,x,y,ex,ey,wd,wd*0.82);mobPath(g,col,(x+ex)/2,(y+ey)/2,len*0.8);}
}
/* лотос: венчик из лепестков (cx,cy — середина цветка) */
function lmMirrorLotus(g,cx,cy,s,t,dead){
  const pet=dead?['#6a4a3a','#4a3228','#8a6a4a']:['#ffc4d8','#ffdfe9','#f08ab0'];
  for(let i=0;i<7;i++){const a=-Math.PI/2+(i-3)*0.42,l=(i===3?4.4:i%2?3.4:3.9)*s;
    g.save();g.translate(cx,cy);g.rotate(a+Math.PI/2+(dead?(i-3)*0.18:0));
    g.beginPath();g.moveTo(0,0.4);g.bezierCurveTo(-l*0.5,-l*0.2,-l*0.5,-l*0.85,0,-l);g.bezierCurveTo(l*0.5,-l*0.85,l*0.5,-l*0.2,0,0.4);g.closePath();
    g.fillStyle=i%2?pet[1]:pet[0];g.fill();g.strokeStyle=dead?'#1a120c':'#b0507a';g.lineWidth=0.4;g.lineJoin='round';g.stroke();
    g.fillStyle=dead?'rgba(255,230,200,.15)':'rgba(255,255,255,.55)';g.beginPath();g.ellipse(-l*0.14,-l*0.55,l*0.1,l*0.3,0.1,0,TAU);g.fill();
    if(!dead){g.strokeStyle='rgba(220,90,140,.5)';g.lineWidth=0.3;g.beginPath();g.moveTo(0,-0.2);g.lineTo(0,-l*0.8);g.stroke();}
    g.restore();}
  g.fillStyle=dead?'#3a2a1a':'#ffe272';g.beginPath();g.ellipse(cx,cy-0.2*s,1.4*s,0.9*s,0,0,TAU);g.fill();
  g.fillStyle=dead?'#6a5030':'#fff2a8';g.beginPath();g.ellipse(cx-0.3*s,cy-0.4*s,0.6*s,0.35*s,0,0,TAU);g.fill();
}
LM_MODEL.lfrog=function(g,m,FY,t,T,st,k,wv,ph){
  const puff=st==='puff'?k:0,air=!m.onGround,str=air?clamp(-m.vy/400,-0.4,0.4):0,br=Math.sin(t*2+ph);
  const tg=st==='tongue',ext=m.ext||0,bite=(m.bite>0)?1:0;
  const jaw=Math.max(puff*0.45,ext*1.0,bite*0.8,tg?0.5:0);
  const lk=(m.lookX||0);
  g.save();g.translate(0,FY);
  const sq=puff*0.05-str*0.1;g.scale(0.91*(1+br*0.012+sq*0.7),0.91*(1-br*0.014-sq+str*0.15));
  if(!T){
    const C='#8fd0b2',CL='#d4f6e4',CD='#4a9a82',CK='#2a6a5c',BL='#f0fbec',SP='rgba(60,140,120,.38)';
    lmRim(g,q=>{softGlow(q,0,-12,22,'#a8ffd8',0.16);});
    /* кувшинка: лист с вырезом, прожилки, кольцо воды */
    if(!air){
      g.beginPath();g.moveTo(0,-0.9);g.ellipse(0,-0.9,17.5,3.2,0,0.16,TAU-0.16);g.closePath();mobPath(g,'#52b898',0,-1,17);
      g.save();g.clip();g.strokeStyle='rgba(30,100,80,.55)';g.lineWidth=0.45;for(let i=0;i<9;i++){const a=0.5+i*0.68;g.beginPath();g.moveTo(0,-0.9);g.lineTo(Math.cos(a)*17,-0.9+Math.sin(a)*3.2);g.stroke();}
      g.fillStyle='rgba(220,255,235,.35)';g.beginPath();g.ellipse(-4,-2.2,9,0.9,0,0,TAU);g.fill();g.restore();
      const f=(t*0.4+ph)%1;g.strokeStyle='rgba(215,250,240,'+(0.45*(1-f))+')';g.lineWidth=0.5;g.beginPath();g.ellipse(0,-0.5,17+f*4,3.4+f*1,0,0,TAU);g.stroke();
    }
    /* дальняя задняя лапа и дальняя рука — темнее */
    mobBlob(g,-5.6,-5,5.4,4.6,shadeHex(C,-0.3),-0.3);
    lmMirrorToes(g,3.4,-1.8,-0.08,4,6.6,2.2,shadeHex(C,-0.32),0.26);
    lmMirrorTubePath(g,3.2,-10,5.4,-2.6,3.6,2.8);mobPath(g,shadeHex(C,-0.32),4,-6,5);
    lmMirrorToes(g,5.6,-1.6,0.1,4,3.4,1.6,shadeHex(C,-0.34),0.34);
    /* тело */
    g.beginPath();g.ellipse(-1,-8.2,11.6,8.6,0,0,TAU);mobPath(g,C,-4,-12,12);
    g.save();g.clip();
    g.fillStyle='rgba(30,90,90,.26)';g.beginPath();g.ellipse(-1,0,14,4,0,0,TAU);g.fill();
    /* светлое брюшко и складки */
    g.beginPath();g.ellipse(3.4,-5,8,5.4,0.1,0,TAU);g.fillStyle=BL;g.fill();
    g.strokeStyle='rgba(110,180,150,.55)';g.lineWidth=0.4;for(const y of [-8,-5.6,-3.2]){g.beginPath();g.moveTo(-1.4,y);g.quadraticCurveTo(3.4,y+1.2,9,y-0.2);g.stroke();}
    /* пятна на спине */
    for(const [x,y,r] of [[-8,-13,1.7],[-4,-15.4,1.4],[-10,-8.6,1.5],[-1,-16,1.1],[-6,-10,1]]){g.fillStyle=SP;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();g.fillStyle='rgba(235,255,245,.5)';g.beginPath();g.arc(x-r*0.3,y-r*0.3,r*0.35,0,TAU);g.fill();}
    g.restore();
    /* ближняя задняя лапа: бедро, голень, перепончатая ступня */
    g.beginPath();g.ellipse(-7.6,-5.6,6.8,5.4,-0.35,0,TAU);mobPath(g,shadeHex(C,0.04),-9.4,-8.4,7);
    g.strokeStyle=shadeHex(C,-0.36);g.lineWidth=0.5;g.beginPath();g.arc(-7.6,-5.6,5.6,-2.4,0.5);g.stroke();
    for(const [x,y,r] of [[-9.6,-8,1.2],[-6.6,-9.2,1],[-10.4,-4.6,0.9]]){g.fillStyle=SP;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();}
    g.beginPath();g.ellipse(-0.4,-2.1,8.6,2.4,0.02,0,TAU);mobPath(g,shadeHex(C,0.04),-1.5,-3.2,8);
    lmMirrorToes(g,6.8,-1.9,-0.06,4,6,2.3,shadeHex(C,0.02),0.27);
    g.strokeStyle='rgba(235,255,245,.5)';g.lineWidth=0.4;g.beginPath();g.moveTo(7.2,-2.6);g.lineTo(12.4,-3.4);g.stroke();
    /* горловой мешок: надувается при замахе языка */
    if(puff>0.02){const r=3.4+puff*5.6,cx=8.4,cy=-8.4+r*0.2;
      g.beginPath();g.ellipse(cx,cy,r*1.12,r*0.95,0.1,0,TAU);g.fillStyle='#dcfbe8';g.fill();g.strokeStyle='#4a9a82';g.lineWidth=0.9;g.stroke();
      g.save();g.clip();g.fillStyle='rgba(90,170,150,.28)';g.beginPath();g.ellipse(cx+r*0.2,cy+r*0.6,r*1.3,r*0.6,0,0,TAU);g.fill();g.restore();
      g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.ellipse(cx-r*0.35,cy-r*0.35,r*0.32,r*0.16,-0.5,0,TAU);g.fill();
      g.strokeStyle='rgba(90,170,140,.45)';g.lineWidth=0.4;for(let q=0;q<3;q++){g.beginPath();g.moveTo(cx-r*0.5+q*r*0.5,cy-r*0.6);g.quadraticCurveTo(cx-r*0.4+q*r*0.5,cy,cx-r*0.55+q*r*0.5,cy+r*0.6);g.stroke();}}
    /* ближняя рука с лотосом */
    const hxn=air?15:13.2,hyn=air?-14:-12.6;
    lmMirrorTubePath(g,6.4,-9.4,hxn,hyn,4.2,3);mobPath(g,C,9,-11,5);
    g.strokeStyle='#3a8a5a';g.lineWidth=0.9;g.lineCap='round';g.beginPath();g.moveTo(hxn,hyn+1.4);g.quadraticCurveTo(hxn+2.6,hyn-6,hxn+1.8+Math.sin(t*1.4)*0.5,-22.4);g.stroke();
    g.strokeStyle='rgba(190,255,200,.6)';g.lineWidth=0.3;g.beginPath();g.moveTo(hxn-0.2,hyn+1);g.quadraticCurveTo(hxn+2.2,hyn-6,hxn+1.4+Math.sin(t*1.4)*0.5,-22.4);g.stroke();
    lmMirrorLotus(g,hxn+1.8+Math.sin(t*1.4)*0.5,-23.2,1,t,false);
    mobBlob(g,hxn,hyn,2.2,2,shadeHex(C,0.06));
    for(const q of [-0.7,0.5]){g.strokeStyle=shadeHex(C,-0.36);g.lineWidth=0.4;g.beginPath();g.moveTo(hxn+0.3,hyn-1.6+q*0.2);g.lineTo(hxn+1.8,hyn-0.4+q);g.stroke();}
    /* голова: широкий рот-улыбка, румянец, глаза-дуги, ноздри */
    const hb=Math.sin(t*1.7+ph)*0.25-puff*0.6;
    g.save();g.translate(0,hb);
    g.beginPath();g.ellipse(2,-15.2,10.6,6.6,0,0,TAU);mobPath(g,shadeHex(C,0.05),-0.4,-18.4,11);
    g.save();g.clip();g.fillStyle='rgba(235,255,245,.4)';g.beginPath();g.ellipse(-1,-19.6,7,1.5,-0.1,0,TAU);g.fill();g.fillStyle='rgba(30,90,90,.22)';g.beginPath();g.ellipse(3,-8.6,12,2.4,0,0,TAU);g.fill();g.restore();
    /* глазные бугры */
    for(const [ex,ey,r,far] of [[-2,-20.2,3.7,1],[7.6,-20.6,3.5,0]]){
      g.beginPath();g.ellipse(ex,ey,r,r*0.95,0,0,TAU);mobPath(g,far?shadeHex(C,-0.08):shadeHex(C,0.08),ex-1,ey-1.4,r*1.1);
      const op=puff>0.2||tg;
      if(!op){/* закрытые довольные глаза: дуга-«домик» с ресничками */
        g.strokeStyle='#265a4c';g.lineWidth=0.9;g.lineCap='round';g.beginPath();g.moveTo(ex-2.2,ey+0.6);g.quadraticCurveTo(ex,ey-2.6,ex+2.2,ey+0.6);g.stroke();
        g.lineWidth=0.4;g.beginPath();g.moveTo(ex-2.2,ey+0.6);g.lineTo(ex-3,ey+1.4);g.moveTo(ex+2.2,ey+0.6);g.lineTo(ex+3,ey+1.2);g.stroke();
        g.fillStyle='rgba(255,255,255,.5)';g.beginPath();g.ellipse(ex-1.2,ey-1.7,1,0.4,-0.4,0,TAU);g.fill();
      }else{/* открыты: решительный взгляд */
        g.fillStyle='#f6fff0';g.beginPath();g.ellipse(ex,ey,r*0.72,r*0.7,0,0,TAU);g.fill();
        g.fillStyle='#1c3a2c';g.beginPath();g.arc(ex+lk*0.5+0.4,ey+0.2,r*0.4,0,TAU);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(ex+lk*0.5-0.1,ey-0.3,0.55,0,TAU);g.fill();
        g.strokeStyle='#265a4c';g.lineWidth=0.8;g.lineCap='round';g.beginPath();g.moveTo(ex-r*0.9,ey-r*0.4);g.lineTo(ex+r*0.8,ey-r*0.8+(far?0.2:0));g.stroke();}
    }
    /* рот: улыбка до щёк; при выстреле — раскрыт */
    if(jaw<0.15){
      g.strokeStyle='#2a6a58';g.lineWidth=0.7;g.lineCap='round';g.beginPath();g.moveTo(-5.4,-13.4);g.quadraticCurveTo(2,-9.6,10.8,-14);g.stroke();
      g.beginPath();g.moveTo(-5.4,-13.4);g.lineTo(-6.2,-14.4);g.moveTo(10.8,-14);g.lineTo(11.6,-15);g.stroke();
      g.strokeStyle='rgba(235,255,245,.6)';g.lineWidth=0.35;g.beginPath();g.moveTo(-4,-12.7);g.quadraticCurveTo(2,-8.8,9.6,-12.7);g.stroke();
    }else{
      g.fillStyle='#2a4a40';g.beginPath();g.moveTo(-3,-13.6);g.quadraticCurveTo(3,-12.6,11.6,-14.6);g.quadraticCurveTo(12,-10.6-jaw*3,7,-9.6-jaw*3.4);g.quadraticCurveTo(0,-9.6-jaw*2,-3,-13.6);g.closePath();g.fill();
      g.fillStyle='#e87898';g.beginPath();g.ellipse(6,-11.6-jaw*1.4,4.6,1.5+jaw*0.8,0.05,0,TAU);g.fill();
      g.strokeStyle='#6ac0a0';g.lineWidth=0.7;g.beginPath();g.moveTo(-3.4,-13.8);g.quadraticCurveTo(3,-12.8,11.8,-14.8);g.stroke();}
    g.fillStyle='rgba(40,110,90,.7)';g.beginPath();g.ellipse(10.8,-17.2,0.5,0.3,0.3,0,TAU);g.ellipse(8.8,-17.8,0.5,0.3,0.3,0,TAU);g.fill();
    g.fillStyle='rgba(255,140,170,.45)';g.beginPath();g.ellipse(-2.4,-13.8,2.2,1.2,0,0,TAU);g.ellipse(9.6,-12,1.8,1,0,0,TAU);g.fill();
    /* корона: золото, острия, камни, блик */
    g.save();g.translate(3.6,-25.2);g.scale(0.82,0.82);g.rotate(-0.04+Math.sin(t*1.7+ph)*0.02);
    g.beginPath();g.moveTo(-4.6,2.2);g.lineTo(-5,-2.6);g.lineTo(-2.6,-0.2);g.lineTo(-1.4,-3.8);g.lineTo(0,-0.6);g.lineTo(1.4,-3.8);g.lineTo(2.6,-0.2);g.lineTo(5,-2.6);g.lineTo(4.6,2.2);g.closePath();
    mobPath(g,'#f0c050',-1,-1,6);
    g.fillStyle='#c88a20';g.fillRect(-4.6,0.9,9.2,1.3);
    g.fillStyle='#ff7aa0';g.beginPath();g.arc(0,1.4,0.6,0,TAU);g.fill();g.fillStyle='#8ad8ff';g.beginPath();g.arc(-2.6,1.4,0.5,0,TAU);g.arc(2.6,1.4,0.5,0,TAU);g.fill();
    g.fillStyle='#fff6c8';for(const [x,y] of [[-5,-2.9],[-1.4,-4.1],[1.4,-4.1],[5,-2.9]]){g.beginPath();g.arc(x,y,0.5,0,TAU);g.fill();}
    g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=0.4;g.beginPath();g.moveTo(-4,0.2);g.lineTo(-3,-1.2);g.stroke();g.restore();
    g.restore();
    lmRim(g,q=>{q.strokeStyle='rgba(235,255,245,.4)';q.lineWidth=0.9;q.beginPath();q.ellipse(-1,-8.2,11,8.2,0,Math.PI*1.08,Math.PI*1.55);q.stroke();q.beginPath();q.ellipse(2,-15.2+hb,10.2,6.2,0,Math.PI*1.1,Math.PI*1.5);q.stroke();});
    for(let i=0;i<3;i++){const f=(t*0.6+i*0.34+ph)%1,a=Math.sin(f*Math.PI);lmMirrorSpark(g,[-12,14,4][i],[-16,-26,-27][i]-f*2,1.6*a+0.2,0.8*a);}
  }else{
    /* ИСТИНА — жаба: бородавки, налитые глаза, ржавая корона, язык-рука */
    const C='#66803f',CL='#9aaa60',CD='#2a361a',BY='#c8b878',PU='#d8d884',BLD='#8a1020';
    /* сгнивший лист с дырами */
    if(!air){
      g.beginPath();g.moveTo(0,-0.9);g.ellipse(0,-0.9,18,3.3,0,0.16,TAU-0.16);g.closePath();mobPath(g,'#34402a',0,-1,17);
      g.save();g.clip();g.fillStyle='rgba(90,70,30,.7)';for(const [x,y,rx] of [[-10,-1.4,3.4],[8,-0.5,3],[-2,-2.4,2.2]]){g.beginPath();g.ellipse(x,y,rx,0.9,0,0,TAU);g.fill();}
      g.fillStyle='#050804';for(const [x,y] of [[-6,-0.6],[11,-1.6]]){g.beginPath();g.ellipse(x,y,1.5,0.6,0,0,TAU);g.fill();}
      g.strokeStyle='rgba(15,25,10,.6)';g.lineWidth=0.4;for(let i=0;i<8;i++){const a=0.5+i*0.74;g.beginPath();g.moveTo(0,-0.9);g.lineTo(Math.cos(a)*18,-0.9+Math.sin(a)*3.3);g.stroke();}
      g.restore();
      g.fillStyle='rgba(160,200,90,.35)';g.beginPath();g.ellipse(-4,-1.8,7,0.6,0,0,TAU);g.fill();
    }
    /* дальняя задняя лапа и рука */
    mobBlob(g,-6.2,-5,6,5,shadeHex(C,-0.4),-0.3);
    lmMirrorToes(g,3.8,-1.7,-0.08,4,7.2,1.7,shadeHex(C,-0.4),0.3);
    lmMirrorTubePath(g,3.2,-10,5.6,-2.4,4,2.6);mobPath(g,shadeHex(C,-0.4),4,-6,5);
    lmMirrorToes(g,5.8,-1.6,0.1,4,4.2,1.1,shadeHex(C,-0.4),0.34);
    /* тело: грузное, в буграх */
    lmFluff(g,-1,-8,13.6,9,18,0.08,3.7);mobPath(g,C,-5,-13,14);
    g.save();g.clip();
    g.fillStyle='rgba(10,20,6,.38)';g.beginPath();g.ellipse(-1,0.4,16,4.6,0,0,TAU);g.fill();
    /* обвисшее брюхо с венами */
    g.beginPath();g.ellipse(3.8,-4.4,9,5.8,0.1,0,TAU);g.fillStyle=BY;g.fill();
    g.fillStyle='rgba(60,40,10,.25)';g.beginPath();g.ellipse(3.8,-1.6,9,3,0.1,0,TAU);g.fill();
    g.strokeStyle='rgba(150,30,40,.55)';g.lineWidth=0.35;g.beginPath();g.moveTo(-1,-7);g.quadraticCurveTo(2,-4,1,-1);g.moveTo(5,-8);g.quadraticCurveTo(7,-5,9,-3);g.moveTo(2,-5.4);g.quadraticCurveTo(4,-3,6,-1.4);g.stroke();
    /* бородавки: тёмная кайма, светлый бугор */
    for(const [x,y,r] of [[-10,-12,1.8],[-6.4,-15,1.5],[-2.6,-16.6,1.7],[-12,-7,1.5],[-8,-9,1.2],[-4,-12,1.1],[-0.6,-13,1.3],[1.4,-16,1],[-13,-3.4,1.3],[-9,-4,1.1]]){
      g.fillStyle=CD;g.beginPath();g.arc(x,y,r+0.4,0,TAU);g.fill();g.fillStyle='#6e7e44';g.beginPath();g.arc(x-0.1,y-0.1,r,0,TAU);g.fill();g.fillStyle='rgba(205,220,140,.7)';g.beginPath();g.arc(x-r*0.3,y-r*0.35,r*0.4,0,TAU);g.fill();}
    g.restore();
    /* глаза-нарывы на спине: следят */
    for(const [x,y,r] of [[-8.4,-14,1.7],[-3.4,-16,1.4]]){
      g.fillStyle='#3a1a14';g.beginPath();g.arc(x,y,r+0.5,0,TAU);g.fill();g.fillStyle='#e8e0c0';g.beginPath();g.arc(x,y,r,0,TAU);g.fill();
      g.fillStyle='#b01828';g.beginPath();g.arc(x+0.35+lk*0.3+Math.sin(t*1.3+x)*0.2,y+0.1,r*0.45,0,TAU);g.fill();g.fillStyle='#100';g.beginPath();g.arc(x+0.4+lk*0.3+Math.sin(t*1.3+x)*0.2,y+0.1,r*0.2,0,TAU);g.fill();}
    /* лопнувший нарыв: гной стекает */
    g.fillStyle=PU;g.beginPath();g.arc(-11.4,-9.4,1.2,0,TAU);g.fill();g.fillStyle='#8a2a2a';g.beginPath();g.arc(-11.4,-9.4,0.6,0,TAU);g.fill();
    g.strokeStyle='rgba(216,216,132,.8)';g.lineWidth=0.6;g.lineCap='round';const dp=(t*0.5+ph)%1;g.beginPath();g.moveTo(-11.4,-8.6);g.lineTo(-11.6,-8.6+2.4*dp);g.stroke();g.fillStyle='rgba(216,216,132,.9)';g.beginPath();g.arc(-11.6,-8.2+2.4*dp,0.5,0,TAU);g.fill();
    /* ближняя задняя лапа */
    g.beginPath();g.ellipse(-8,-5.6,7.2,5.8,-0.35,0,TAU);mobPath(g,shadeHex(C,0.05),-10,-8.4,7.4);
    g.strokeStyle='rgba(15,25,8,.55)';g.lineWidth=0.5;g.beginPath();g.arc(-8,-5.6,6,-2.4,0.5);g.stroke();
    for(const [x,y,r] of [[-10.4,-8,1.2],[-6.8,-9.4,1],[-11,-4.4,1]]){g.fillStyle='#3a4a22';g.beginPath();g.arc(x,y,r+0.3,0,TAU);g.fill();g.fillStyle='#7a8a4c';g.beginPath();g.arc(x,y,r,0,TAU);g.fill();}
    g.beginPath();g.ellipse(-0.4,-2.1,9,2.5,0.02,0,TAU);mobPath(g,shadeHex(C,0.04),-1.5,-3.2,8);
    lmMirrorToes(g,7.2,-1.9,-0.06,4,6.8,1.9,shadeHex(C,0.0),0.26);
    g.strokeStyle='#d8d0b0';g.lineWidth=0.5;g.lineCap='round';for(let i=0;i<4;i++){const a=-0.06+(i-1.5)*0.26;g.beginPath();g.moveTo(7.2+Math.cos(a)*6.4,-1.9+Math.sin(a)*6.4);g.lineTo(7.2+Math.cos(a)*7.6,-1.9+Math.sin(a)*7.6);g.stroke();}
    /* вздутый горловой мешок: просвечивают пальцы изнутри */
    if(puff>0.02||jaw>0.3){const pf=Math.max(puff,jaw*0.5),r=3.8+pf*5.4,cx=8.2,cy=-8.4+r*0.2;
      g.beginPath();g.ellipse(cx,cy,r*1.12,r*0.95,0.1,0,TAU);mobPath(g,'#c2b070',cx-r*0.3,cy-r*0.4,r*1.2);
      g.save();g.clip();g.strokeStyle='rgba(150,30,40,.6)';g.lineWidth=0.4;for(let q=0;q<4;q++){g.beginPath();g.moveTo(cx-r*0.7+q*r*0.45,cy-r*0.8);g.quadraticCurveTo(cx-r*0.5+q*r*0.45,cy,cx-r*0.75+q*r*0.5,cy+r*0.8);g.stroke();}
      g.fillStyle='rgba(235,210,180,.55)';g.strokeStyle='rgba(90,40,30,.6)';g.lineWidth=0.3;for(let q=0;q<4;q++){const a=-0.5+q*0.34;g.beginPath();g.ellipse(cx+Math.cos(a)*r*0.5-0.4,cy-Math.sin(a+1)*r*0.2-r*0.1,0.9,2.4+Math.sin(t*5+q)*0.5,a,0,TAU);g.fill();g.stroke();}
      g.fillStyle='rgba(255,250,200,.45)';g.beginPath();g.ellipse(cx-r*0.35,cy-r*0.35,r*0.3,r*0.15,-0.5,0,TAU);g.fill();g.restore();}
    /* ближняя рука: упёрта в лист, пальцы длинные и бледные; в ней — высохший лотос */
    lmMirrorTubePath(g,6.4,-9.4,10.6,-2.2,5,3.2);mobPath(g,shadeHex(C,0.04),8,-6,6);
    lmMirrorToes(g,10.6,-1.6,-0.1,4,5,1.3,'#b0a470',0.3);
    g.strokeStyle='#2a1a10';g.lineWidth=0.6;g.lineCap='round';g.beginPath();g.moveTo(10.2,-3.4);g.quadraticCurveTo(14,-9,15.6+Math.sin(t*1.1)*0.3,-12);g.stroke();
    g.save();g.translate(15.6+Math.sin(t*1.1)*0.3,-12);g.rotate(2.4);lmMirrorLotus(g,0,0,0.9,t,true);g.restore();
    /* голова */
    const hb=Math.sin(t*1.7+ph)*0.25-puff*0.5;
    g.save();g.translate(0,hb);
    g.beginPath();g.moveTo(-8.4,-14);g.bezierCurveTo(-9,-21,6,-22.6,11.4,-17.4);g.bezierCurveTo(13,-16,13.4,-14.4,12.6,-13.2);g.lineTo(-6,-9.6);g.bezierCurveTo(-8.6,-10.4,-8.4,-12,-8.4,-14);g.closePath();
    mobPath(g,shadeHex(C,0.03),-0.4,-18.4,12);
    g.save();g.clip();
    for(const [x,y,r] of [[-5,-16,1],[-2,-18.6,0.9],[2,-19,1.1],[6,-17.6,0.8],[9,-15.6,0.9],[-6.6,-12.8,0.8]]){g.fillStyle=CD;g.beginPath();g.arc(x,y,r+0.3,0,TAU);g.fill();g.fillStyle='#738348';g.beginPath();g.arc(x,y,r,0,TAU);g.fill();}
    g.fillStyle='rgba(205,220,150,.25)';g.beginPath();g.ellipse(-1,-20,7,1.4,-0.1,0,TAU);g.fill();g.restore();
    /* рот: нижняя челюсть с мелкими человечьими зубами, язык-корень */
    const jw=jaw*3.4+0.8;
    g.beginPath();g.moveTo(-6.6,-12.4);g.quadraticCurveTo(2,-10.6-jw*0.6,12.4,-14);g.quadraticCurveTo(12,-10-jw,6,-7.6-jw);g.quadraticCurveTo(-3,-7.8-jw*0.8,-6.6,-12.4);g.closePath();
    mobPath(g,shadeHex(C,-0.12),3,-9.4,8);
    g.fillStyle='#3a0618';g.beginPath();g.moveTo(-5.6,-12.6);g.quadraticCurveTo(2,-11.8,11.8,-14.1);g.quadraticCurveTo(11.4,-10.4-jw*0.85,6,-8.6-jw*0.9);g.quadraticCurveTo(-2,-8.8-jw*0.7,-5.6,-12.6);g.closePath();g.fill();
    g.fillStyle='#c4506a';g.beginPath();g.ellipse(5,-10.6-jw*0.45,4.6,1.1+jaw*1.4,0.08,0,TAU);g.fill();
    g.fillStyle='#f4ecd8';g.strokeStyle='#5a3a30';g.lineWidth=0.25;for(let i=0;i<8;i++){const x=-4.6+i*2,y=-12.3+i*0.04-(i>3?(i-3)*0.3:0),h=1+((i*7)%5)*0.25,w=0.9+((i*3)%3)*0.18;g.beginPath();g.rect(x,y,w,h);g.fill();g.stroke();g.beginPath();g.rect(x+0.4,-9.4-jw*0.88+(i%2)*0.2-(i>4?0.3:0),w*0.9,0.8+((i*5)%4)*0.2);g.fill();g.stroke();}
    g.strokeStyle='#1a2410';g.lineWidth=0.4;g.beginPath();g.moveTo(-6.4,-12.6);g.quadraticCurveTo(2,-11,12.4,-14.2);g.stroke();
    /* слюна: нити из пасти */
    g.strokeStyle='rgba(220,240,200,.6)';g.lineWidth=0.4;g.beginPath();g.moveTo(1,-9.6-jw*0.8);g.quadraticCurveTo(1.4,-7-jw,0.6,-4.4-jw*0.4+Math.sin(t*2)*0.4);g.moveTo(8,-8.4-jw);g.lineTo(8.2,-5.6-jw*0.7);g.stroke();
    g.fillStyle='rgba(200,230,200,.7)';g.beginPath();g.arc(0.6,-4.2-jw*0.4+Math.sin(t*2)*0.4,0.5,0,TAU);g.fill();
    g.fillStyle='#1a2410';g.beginPath();g.ellipse(11,-17.2,0.5,0.3,0.3,0,TAU);g.ellipse(8.8,-18.2,0.5,0.3,0.3,0,TAU);g.fill();
    /* ржавая корона, вросшая в череп: кровь по лбу */
    g.save();g.translate(2.8,-24.4);g.scale(0.9,0.9);g.rotate(0.3);
    g.beginPath();g.moveTo(-4.4,1.8);g.lineTo(-5,-3.2);g.lineTo(-2.4,-0.8);g.lineTo(-1,-4.2);g.lineTo(0.6,-0.8);g.lineTo(2,-2.4);g.lineTo(3,1.2);g.lineTo(4.6,1.8);g.closePath();
    mobPath(g,'#7a6428',-1,-1,6);
    g.fillStyle='#5a3a14';g.fillRect(-4.4,0.6,9,1.2);
    g.fillStyle='#1a0a14';g.beginPath();g.arc(0,1.2,0.6,0,TAU);g.fill();g.fillStyle='#4a2a14';g.beginPath();g.arc(-2.6,1.2,0.5,0,TAU);g.fill();
    g.strokeStyle='rgba(150,80,30,.7)';g.lineWidth=0.4;g.beginPath();g.moveTo(-3,-1);g.lineTo(-2,0.8);g.moveTo(1,-1);g.lineTo(0.2,0.6);g.stroke();
    g.restore();
    g.strokeStyle=BLD;g.lineWidth=0.7;g.lineCap='round';g.beginPath();g.moveTo(1.6,-23.2);g.lineTo(1.4,-20.6);g.moveTo(4.6,-23.4);g.lineTo(4.2,-20.8);g.stroke();
    g.fillStyle=BLD;g.beginPath();g.arc(1.4,-20.4,0.5,0,TAU);g.arc(4.2,-20.6,0.45,0,TAU);g.fill();
    /* глаза: выпученные, молочные, разбегаются в стороны */
    for(const [ex,ey,r,far] of [[-2,-21,4.2,1],[7.6,-21.2,4.9,0]]){
      g.beginPath();g.ellipse(ex,ey,r+0.7,r+0.5,0,0,TAU);mobPath(g,shadeHex(C,far?-0.12:0.05),ex-1,ey-1.6,r*1.1);
      g.fillStyle='#f1edd0';g.beginPath();g.ellipse(ex,ey,r,r*0.96,0,0,TAU);g.fill();
      g.strokeStyle='rgba(176,20,40,.75)';g.lineWidth=0.3;for(let a=0.3;a<6.3;a+=0.85){g.beginPath();g.moveTo(ex+Math.cos(a)*r,ey+Math.sin(a)*r*0.96);g.quadraticCurveTo(ex+Math.cos(a+0.3)*r*0.7,ey+Math.sin(a+0.3)*r*0.7,ex+Math.cos(a)*r*0.4,ey+Math.sin(a)*r*0.4);g.stroke();}
      const dx=far?Math.sin(t*0.9+ph*3)*1.4-1:-lk*0.4+Math.cos(t*0.7+ph)*0.6,dy=far?-1.2+Math.cos(t*1.1)*0.4:0.8;
      g.fillStyle=far?'#d4a020':'#8a9a2a';g.beginPath();g.arc(ex+dx*0.6,ey+dy*0.6,r*0.34,0,TAU);g.fill();
      g.fillStyle='#0a0a04';g.beginPath();if(far)g.arc(ex+dx*0.6,ey+dy*0.6,r*0.16,0,TAU);else g.ellipse(ex+dx*0.6,ey+dy*0.6,r*0.3,r*0.1,0,0,TAU);g.fill();
      g.fillStyle='rgba(255,255,255,.85)';g.beginPath();g.arc(ex-r*0.28,ey-r*0.34,r*0.14,0,TAU);g.fill();
      /* тяжёлое веко сверху */
      g.fillStyle=shadeHex(C,-0.1);g.beginPath();g.ellipse(ex,ey,r+0.5,r+0.4,0,Math.PI*1.04,Math.PI*1.96-(far?0.4:0));g.lineTo(ex,ey-r*(far?0.35:0.5));g.closePath();g.fill();
      g.strokeStyle='#1a2410';g.lineWidth=0.5;g.beginPath();g.ellipse(ex,ey,r+0.5,r+0.4,0,Math.PI*1.05,Math.PI*1.95);g.stroke();}
    g.restore();
    lmRim(g,q=>{q.strokeStyle='rgba(200,225,140,.3)';q.lineWidth=0.9;q.beginPath();q.ellipse(-1,-8,13,8.6,0,Math.PI*1.08,Math.PI*1.55);q.stroke();});
  }
  g.restore();
};
/* «Длинные» части Лебедя и Лягушки: рисуются в мире (lilLongPart в 53 вызывает их вместо плоских линий).
   Размеры модели — единицы модели: масштаб s = max(w,h)/34. */
/* кисть: ладонь и 4 пальца с суставами, большой палец; dir — куда смотрит кисть, wig — подёргивание пальцев */
function lmMirrorHand(g,x,y,dir,time,grip){
  g.save();g.translate(x,y);g.rotate(dir);
  const SK='#e2c8b0',SKD='#a07a68',SKL='#f6e6d4';
  /* запястье с рваным краем и кровью */
  g.fillStyle='#8a0c1c';g.beginPath();g.moveTo(-3.4,-2.6);g.lineTo(-1.6,-1.4);g.lineTo(-3,0);g.lineTo(-1.4,1.4);g.lineTo(-3.4,2.8);g.lineTo(0.4,3.2);g.lineTo(0.4,-3.2);g.closePath();g.fill();
  /* ладонь */
  g.beginPath();g.ellipse(2.4,0,3.6,3.2,0,0,TAU);mobPath(g,SK,1.2,-1,4);
  g.strokeStyle='rgba(120,70,60,.55)';g.lineWidth=0.35;g.beginPath();g.moveTo(1,-1.2);g.quadraticCurveTo(2.6,0,1.8,1.8);g.moveTo(1.4,0.4);g.lineTo(4,0.2);g.stroke();
  /* большой палец */
  const th=-0.9+grip*0.5;
  lmMirrorTubePath(g,2.4,-2.4,2.4+Math.cos(th)*4.2,-2.4+Math.sin(th)*4.2,1.7,1.3);mobPath(g,SK,3,-4,3);
  /* пальцы: два сустава, ногти */
  const L=[5.2,6.4,6,4.4],A=[-0.46,-0.16,0.14,0.46];
  for(let i=0;i<4;i++){
    const w=Math.sin(time*13+i*1.7)*0.12,a=A[i]*(1-grip*0.55)+w,l1=L[i]*0.55,l2=L[i]*0.5,x1=5.2+Math.cos(a)*l1,y1=Math.sin(a)*l1+(i-1.5)*0.2,a2=a+grip*0.9+w*0.5,x2=x1+Math.cos(a2)*l2,y2=y1+Math.sin(a2)*l2;
    lmMirrorTubePath(g,5.2,(i-1.5)*0.9,x1,y1,1.5,1.25);mobPath(g,SK,(5.2+x1)/2,y1-0.4,2,true);
    lmMirrorTubePath(g,x1,y1,x2,y2,1.25,0.95);mobPath(g,SKL,(x1+x2)/2,(y1+y2)/2-0.3,2,true);
    g.fillStyle='#4a2a20';g.beginPath();g.ellipse(x2+Math.cos(a2)*0.2,y2+Math.sin(a2)*0.2,0.55,0.4,a2,0,TAU);g.fill();
    g.fillStyle=SKD;g.beginPath();g.arc(x1,y1,0.45,0,TAU);g.fill();
  }
  g.restore();
}
/* шея лебедя в броске */
function lmMirrorSwanLong(g,m,time){
  const e=m.ext,T=!!m.tf,s=Math.max(m.w,m.h)/34,ff=m.facing||1;
  const x0=m.x+ff*10,y0=m.y-m.h*0.7,dx=m.nx2*e/s,dy=m.ny2*e/s;
  g.save();g.translate(x0,y0);g.scale(s,s);
  const P=[[0,0],[dx*0.35,dy*0.35-9*(1-e)],[dx*0.7,dy*0.7-12*(1-e)],[dx,dy]],ln=Math.hypot(dx,dy),pts=lmMirrorBez(P,clamp(Math.round(ln/2.6),10,60));
  lmMirrorSwanNeck(g,pts,T?7:4.8,T?5.6:3.2,T,time,1,true);
  g.translate(dx,dy);g.scale(ff,1);g.rotate(Math.atan2(m.ny2,Math.abs(m.nx2)));
  lmMirrorSwanHead(g,T,time,T?1:0.5,m.phase||0,m);
  g.restore();
}
/* язык лягушки: влажный, у Истины — с кистью на конце */
function lmMirrorFrogLong(g,m,time){
  const e=m.ext,T=!!m.tf,s=Math.max(m.w,m.h)/34,ff=m.facing||1;
  const x0=m.x+ff*12,y0=m.y-m.h*0.55,dx=m.nx2*e/s,dy=m.ny2*e/s;
  g.save();g.translate(x0,y0);g.scale(s,s);
  /* корень языка — во рту (чуть ниже опорной точки мира), конец — в точке удара */
  const P=[[-1.6,4.2],[dx*0.33,dy*0.33-5*(1-e)+2],[dx*0.66,dy*0.66-6*(1-e)],[dx,dy]],pts=lmMirrorBez(P,16);
  const w0=T?5.4:4.8,ed=lmMirrorRibbon(g,pts,f=>(T?3.2:3)+(w0-(T?3.2:3))*Math.min(1,f*3.5)*(1-f*(T?0.35:0.1)),0);
  g.fillStyle=T?'#b8606e':'#f48cae';g.fill();g.strokeStyle=T?'#3a0a18':'#7a2040';g.lineWidth=0.9;g.lineJoin='round';g.stroke();
  g.save();g.clip();
  g.strokeStyle='rgba(120,30,60,.35)';g.lineWidth=w0*0.3;g.lineCap='round';lmMirrorRibbonLine(g,ed,0.36);g.stroke();
  g.strokeStyle='rgba(255,230,236,.7)';g.lineWidth=w0*0.14;lmMirrorRibbonLine(g,ed,-0.28);g.stroke();
  g.strokeStyle='rgba(150,40,70,.5)';g.lineWidth=0.35;lmMirrorRibbonLine(g,ed,0.05);g.stroke();
  if(T){g.strokeStyle='rgba(120,20,40,.65)';g.lineWidth=0.35;for(let i=2;i<pts.length-2;i+=2){g.beginPath();g.moveTo(ed.L[i][0],ed.L[i][1]);g.lineTo(ed.R[i][0],ed.R[i][1]);g.stroke();}
    g.fillStyle='rgba(255,220,200,.5)';for(let i=1;i<pts.length-2;i+=2){g.beginPath();g.arc(pts[i][0]+0.4,pts[i][1]-0.5,0.4,0,TAU);g.fill();}}
  else{g.fillStyle='rgba(255,240,244,.6)';for(let i=1;i<pts.length-2;i+=2){g.beginPath();g.arc(pts[i][0]+0.3,pts[i][1]-0.5,0.35,0,TAU);g.fill();}}
  g.restore();
  const tx=pts[pts.length-1][0],ty=pts[pts.length-1][1],a=Math.atan2(dy,dx);
  if(!T){g.beginPath();g.arc(tx,ty,3.6,0,TAU);mobPath(g,'#ff86ac',tx-1,ty-1.2,3.8);g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.ellipse(tx-1.2,ty-1.4,1.2,0.6,-0.5,0,TAU);g.fill();
    g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=0.4;g.beginPath();g.moveTo(tx+3.4,ty);g.quadraticCurveTo(tx+5,ty+1.4,tx+4.6,ty+3.4);g.stroke();}
  else{g.save();g.translate(tx,ty);g.scale(1.3,1.3);lmMirrorHand(g,0,0,a,time,e>=0.99?0.35:0.1);g.restore();}
  g.restore();
}
