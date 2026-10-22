'use strict';
/* ============================================================
   ЛИЛОВЫЕ НЕБЕСА — модели мобов. Рамка модели — 34 единицы по большей стороне,
   начало координат — середина моба, FY — линия земли, +x — вперёд (по взгляду).
   Каждая модель рисует два облика: Иллюзию (T=false) и Истину (T=true).
   Свет сверху-слева (mobPath даёт объём), дальние конечности темнее.
   ============================================================ */
/* двухзвенная конечность с суставом */
function lmLeg(g,hx,hy,fx,fy,l1,l2,back,w,col,claw){
  const dx=fx-hx,dy=fy-hy,d=Math.min(l1+l2-0.01,Math.hypot(dx,dy)),a=Math.atan2(dy,dx);
  const c=Math.acos(clamp((l1*l1+d*d-l2*l2)/(2*l1*d),-1,1)),ka=a+(back?c:-c),kx=hx+Math.cos(ka)*l1,ky=hy+Math.sin(ka)*l1;
  const ex=hx+Math.cos(a)*d,ey=hy+Math.sin(a)*d;
  g.strokeStyle=col;g.lineCap='round';g.lineJoin='round';g.lineWidth=w;g.beginPath();g.moveTo(hx,hy);g.lineTo(kx,ky);g.stroke();
  g.lineWidth=w*0.72;g.beginPath();g.moveTo(kx,ky);g.lineTo(ex,ey);g.stroke();
  if(claw){g.strokeStyle=claw;g.lineWidth=0.8;for(let q=-1;q<=1;q++){g.beginPath();g.moveTo(ex,ey);g.lineTo(ex+2.6+q*0.4,ey+q*1.4+0.6);g.stroke();}}
  return [ex,ey];
}
/* шаг: смещение ступни по фазе */
function lmStep(m,off,str){if(Math.abs(m.vx)<6)return [0,0];const p=m.anim*13+off;return [Math.sin(p)*str,-Math.max(0,Math.cos(p))*2.4];}
function lmTeeth(g,x0,y0,x1,n,h,col,down){g.fillStyle=col||'#fff6ea';const w=(x1-x0)/n;for(let i=0;i<n;i++){g.beginPath();g.moveTo(x0+i*w,y0);g.lineTo(x0+(i+0.5)*w,y0+(down===false?-h:h));g.lineTo(x0+(i+1)*w,y0);g.fill();}}
function lmRim(g,fn){olLight(g,fn);}
/* блик-обводка сверху-слева: тонкая светлая дуга */
function lmShine(g,x,y,rx,ry,a){g.strokeStyle='rgba(255,255,255,'+(a||0.35)+')';g.lineWidth=0.9;g.beginPath();g.ellipse(x,y,rx,ry,0,Math.PI*1.05,Math.PI*1.55);g.stroke();}

/* пушистое пятно: эллипс с пучками шерсти по краю */
function lmFluff(g,cx,cy,rx,ry,n,amp,seed,rot,from,to){
  from=from==null?0:from;to=to==null?TAU:to;
  g.beginPath();
  const pt=(a,k)=>{const r=1+k;const x=Math.cos(a)*rx*r,y=Math.sin(a)*ry*r;const c=Math.cos(rot||0),s=Math.sin(rot||0);return [cx+x*c-y*s,cy+x*s+y*c];};
  const full=to-from>=TAU-0.001;
  const st=pt(from,0);g.moveTo(st[0],st[1]);
  for(let i=0;i<n;i++){
    const a0=from+(to-from)*i/n,a1=from+(to-from)*(i+1)/n,am=(a0+a1)/2;
    const h=amp*(0.7+0.6*Math.abs(Math.sin(seed+i*2.39)));
    const c1=pt(am-(a1-a0)*0.15,h*1.6),e=pt(a1,0);
    g.quadraticCurveTo(c1[0],c1[1],e[0],e[1]);
  }
  if(full)g.closePath();
}
/* светлые штрихи шерсти */
function lmFur(g,pts,col,w){g.strokeStyle=col;g.lineWidth=w||0.55;g.lineCap='round';for(const [x,y,dx,dy] of pts){g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+dx*0.4,y+dy*0.7,x+dx,y+dy);g.stroke();}}

/* жилистая конечность: два сужающихся сегмента с объёмом, сустав-ком и сухожилие */
function lmLimb(g,hx,hy,fx,fy,l1,l2,back,w0,w1,col){
  const dx=fx-hx,dy=fy-hy,d=Math.min(l1+l2-0.01,Math.hypot(dx,dy)),a=Math.atan2(dy,dx);
  const c=Math.acos(clamp((l1*l1+d*d-l2*l2)/(2*l1*d),-1,1)),ka=a+(back?c:-c),kx=hx+Math.cos(ka)*l1,ky=hy+Math.sin(ka)*l1;
  const ex=hx+Math.cos(a)*d,ey=hy+Math.sin(a)*d;
  const seg=(x0,y0,x1,y1,wa,wb,bulge)=>{const an=Math.atan2(y1-y0,x1-x0),nx=-Math.sin(an),ny=Math.cos(an),mx=(x0+x1)/2,my=(y0+y1)/2,bw=Math.max(wa,wb)*0.5*bulge;
    g.beginPath();g.moveTo(x0+nx*wa/2,y0+ny*wa/2);g.quadraticCurveTo(mx+nx*bw,my+ny*bw,x1+nx*wb/2,y1+ny*wb/2);g.lineTo(x1-nx*wb/2,y1-ny*wb/2);
    g.quadraticCurveTo(mx-nx*bw*0.8,my-ny*bw*0.8,x0-nx*wa/2,y0-ny*wa/2);g.closePath();mobPath(g,col,mx-nx*1,my-ny*1,Math.hypot(x1-x0,y1-y0)*0.6);
    g.strokeStyle='rgba(255,190,190,.35)';g.lineWidth=0.35;g.beginPath();g.moveTo(x0+nx*wa*0.15,y0+ny*wa*0.15);g.quadraticCurveTo(mx+nx*bw*0.3,my+ny*bw*0.3,x1,y1);g.stroke();};
  seg(hx,hy,kx,ky,w0,w0*0.62,1.25);seg(kx,ky,ex,ey,w0*0.62,w1,1.1);
  g.beginPath();g.arc(kx,ky,w0*0.36,0,TAU);mobPath(g,shadeHex(col,0.05),kx,ky,w0*0.4,true);
  return [ex,ey,kx,ky];
}

function lilMobModel(g,m,FY,t){
  const d=m.def,T=!!m.tf,st=m.state,k=m.tele||0,wv=m.anim*13,ph=m.phase||0;
  const fn=LM_MODEL[d.id];if(fn)fn(g,m,FY,t,T,st,k,wv,ph);
}
const LM_MODEL={
  lbunny(g,m,FY,t,T,st,k){
    const cr=st==='crouch'?k:0,air=!m.onGround,str=air?clamp(-m.vy/400,-0.4,0.5):0,br=Math.sin(t*3.1+m.phase*5);
    g.save();g.translate(0,FY);g.scale(1-str*0.15+cr*0.08,1+str*0.2-cr*0.18);g.translate(0,-FY);
    if(!T){
      const C='#d6bcf2',CL='#f2e6ff',CD='#a684d0',CP='#ffb4d2';
      /* хвост-помпон (позади тела) */
      lmFluff(g,-14.2,FY-10.5,3.8,3.6,7,0.28,1);mobPath(g,'#e8d4fc',-14.5,FY-11,4);
      /* дальняя задняя лапа и дальнее ухо — темнее */
      mobBlob(g,-3.5,FY-1.7,5.2,1.9,shadeHex(C,-0.22));
      g.save();g.translate(4.6,FY-20.5);g.rotate(-0.62+Math.sin(t*2.3)*0.05-cr*0.35);
      g.beginPath();g.moveTo(-2.2,0);g.bezierCurveTo(-3.4,-6,-2.2,-11.5,0,-12.2);g.bezierCurveTo(2.2,-11.5,3.2,-6,2.2,0);g.closePath();mobPath(g,shadeHex(C,-0.26),0,-6,7);
      g.fillStyle=shadeHex(CP,-0.3);g.beginPath();g.ellipse(0.1,-6,1.1,4.6,0,0,TAU);g.fill();g.restore();
      /* тело: груша с шерстяным краем */
      lmFluff(g,-3,FY-10,11.6,9.4,13,0.12,2.1);mobPath(g,C,-5,FY-13,12);
      /* тень под брюхом и складка бедра */
      g.save();g.clip();
      g.fillStyle='rgba(90,50,140,.22)';g.beginPath();g.ellipse(-2,FY-1,12,4.5,0,0,TAU);g.fill();
      g.restore();
      /* бедро */
      lmFluff(g,-7.2,FY-7.4,6.6,6,9,0.14,4.4,0,-2.6,2.2);g.closePath();mobPath(g,shadeHex(C,0.04),-8.5,FY-10,7,true);
      g.strokeStyle=shadeHex(C,-0.32);g.lineWidth=0.8;g.beginPath();g.arc(-7.2,FY-7.4,6.3,-2.2,0.9);g.stroke();
      /* шерсть на спине */
      lmFur(g,[[-12,FY-14,1.6,-1.4],[-9,FY-17,1.4,-1.6],[-5.5,FY-18.6,1.2,-1.6],[-2,FY-19,1.2,-1.4],[-11,FY-9,1.4,-1],[-9.5,FY-5,1.6,-0.6]],'rgba(255,255,255,.55)',0.6);
      lmFur(g,[[-6,FY-3.5,1.4,0.8],[-1,FY-2.6,1.6,0.6],[-12.5,FY-6,0.6,1.2]],'rgba(120,80,170,.45)',0.55);
      /* ближняя задняя лапа: длинная ступня с подушечками */
      g.beginPath();g.ellipse(-1.5,FY-1.9,6.4,2.2,0.02,0,TAU);mobPath(g,shadeHex(C,0.06),-3,FY-3,6);
      g.strokeStyle=shadeHex(C,-0.35);g.lineWidth=0.5;for(const x of [3.2,4.4]){g.beginPath();g.moveTo(x,FY-3.2);g.lineTo(x+0.5,FY-0.9);g.stroke();}
      /* грудка: светлая манишка */
      lmFluff(g,4.6,FY-8.2,4.6,5.8,8,0.16,6.2,0.15);mobPath(g,CL,3.4,FY-11,6,true);
      lmFur(g,[[3,FY-11,0.8,1.4],[5,FY-12,1,1.6],[6.4,FY-9,0.8,1.6],[4,FY-7,1,1.4]],'rgba(150,110,190,.35)',0.5);
      /* передние лапки: дальняя темнее */
      mobBlob(g,8.6,FY-1.6,2.2,1.6,shadeHex(C,-0.2));
      mobBlob(g,6.2,FY-1.8,2.4,1.8,CL);
      g.strokeStyle=shadeHex(C,-0.35);g.lineWidth=0.45;for(const x of [6.6,7.5]){g.beginPath();g.moveTo(x,FY-2.6);g.lineTo(x+0.2,FY-0.6);g.stroke();}
      /* голова */
      const hb=Math.sin(t*1.7)*0.3;
      g.save();g.translate(0,hb);
      lmFluff(g,8.4,FY-15.2,7.4,6.6,12,0.1,3.3);mobPath(g,shadeHex(C,0.05),7,FY-18,8);
      /* щека-пух */
      lmFluff(g,11.3,FY-12,3.6,2.8,6,0.2,8.1,0,-0.6,3.4);g.closePath();mobPath(g,CL,10.5,FY-13,4,true);
      /* ближнее ухо: изгиб, розовая середина, складка */
      g.save();g.translate(6.8,FY-20.4);g.rotate(-0.18+Math.sin(t*2.1+1)*0.06-cr*0.5);
      g.beginPath();g.moveTo(-2.6,0.6);g.bezierCurveTo(-4,-6.4,-2.6,-12.6,0.2,-13.4);g.bezierCurveTo(3,-12.8,3.8,-6.4,2.6,0.6);g.closePath();mobPath(g,shadeHex(C,0.04),-0.6,-8,8);
      const eg=g.createLinearGradient(0,-12,0,0);eg.addColorStop(0,'#ffd0e4');eg.addColorStop(1,'#f08ab4');
      g.fillStyle=eg;g.beginPath();g.moveTo(-1.2,-0.4);g.bezierCurveTo(-2.2,-5.6,-1.4,-10.6,0.3,-11.2);g.bezierCurveTo(1.9,-10.6,2.2,-5.6,1.4,-0.4);g.closePath();g.fill();
      g.strokeStyle='rgba(200,80,130,.55)';g.lineWidth=0.45;g.beginPath();g.moveTo(0.2,-1.5);g.quadraticCurveTo(-0.4,-6,0.3,-10);g.stroke();
      lmFur(g,[[-2.4,-3,-0.8,-0.4],[-2.8,-7,-0.8,-0.2],[2.6,-4,0.7,-0.4]],'rgba(255,255,255,.6)',0.5);
      g.restore();
      /* глаз: большая радужка, два блика, верхнее веко */
      const bl=(Math.sin(m.anim*1.1+m.phase*7)>0.985)?0.12:1,lx=(m.lookX||0)*0.45,ly=(m.lookY||0)*0.4;
      const ex=10.6,ey=FY-16.2;
      g.fillStyle='#3a2050';g.beginPath();g.ellipse(ex,ey,2.7,3*bl,0.1,0,TAU);g.fill();
      if(bl>0.5){const ig=g.createRadialGradient(ex+lx,ey+ly+0.8,0.2,ex+lx,ey+ly,2.6);ig.addColorStop(0,'#b88ae8');ig.addColorStop(0.55,'#5a2e8a');ig.addColorStop(1,'#1e0e30');
        g.fillStyle=ig;g.beginPath();g.ellipse(ex+lx,ey+ly,2.3,2.6,0.1,0,TAU);g.fill();
        g.fillStyle='#0e0618';g.beginPath();g.arc(ex+lx+0.2,ey+ly+0.1,1,0,TAU);g.fill();
        g.fillStyle='#fff';g.beginPath();g.arc(ex+lx-0.8,ey+ly-1,0.85,0,TAU);g.fill();
        g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.arc(ex+lx+0.9,ey+ly+1,0.4,0,TAU);g.fill();}
      g.strokeStyle='#4a2a5e';g.lineWidth=0.75;g.lineCap='round';g.beginPath();g.ellipse(ex,ey,2.8,3.1*bl,0.1,Math.PI*1.1,Math.PI*1.95);g.stroke();
      g.lineWidth=0.5;g.beginPath();g.moveTo(ex+2.2,ey-2.2);g.lineTo(ex+3.2,ey-2.9);g.moveTo(ex+2.7,ey-1.4);g.lineTo(ex+3.7,ey-1.8);g.stroke();
      /* румянец, нос, рот, усы */
      g.fillStyle='rgba(255,130,180,.45)';g.beginPath();g.ellipse(11.6,FY-12.4,2.2,1.2,0,0,TAU);g.fill();
      g.fillStyle='#e06a98';g.beginPath();g.moveTo(15.1,FY-14.6);g.quadraticCurveTo(16.2,FY-14.4,15.6,FY-13.2);g.quadraticCurveTo(14.6,FY-13.4,15.1,FY-14.6);g.fill();
      g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.arc(15.2,FY-14.2,0.35,0,TAU);g.fill();
      g.strokeStyle='#8a4a72';g.lineWidth=0.55;g.beginPath();g.moveTo(15.4,FY-13.2);g.lineTo(15.1,FY-12.1);g.quadraticCurveTo(14.2,FY-11.2,13.4,FY-12);g.moveTo(15.1,FY-12.1);g.quadraticCurveTo(15.6,FY-11.3,16.2,FY-11.9);g.stroke();
      g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=0.35;for(const [a,b] of [[-0.25,4.8],[0.05,5.2],[0.35,4.4]]){g.beginPath();g.moveTo(14.2,FY-12.8);g.quadraticCurveTo(14.2+Math.cos(a)*b*0.6,FY-12.8+Math.sin(a)*b*0.6-0.4,14.2+Math.cos(a)*b,FY-12.8+Math.sin(a)*b);g.stroke();}
      g.restore();
      /* контурный свет сверху-слева */
      lmRim(g,q=>{q.strokeStyle='rgba(255,236,255,.35)';q.lineWidth=0.9;q.beginPath();q.ellipse(-3,FY-10,11,9,0,Math.PI*1.08,Math.PI*1.6);q.stroke();
        q.beginPath();q.ellipse(8.4,FY-15.2+hb,7,6.2,0,Math.PI*1.1,Math.PI*1.55);q.stroke();});
    }else{
      /* ИСТИНА: ободранная тварь — мышцы, рёбра, хребет, длинные руки с когтями, клочья прежней шкуры */
      const reach=cr*5+(st==='leap'?7:0),jaw=0.35+cr*0.55+(st==='leap'?0.4:0)+Math.max(0,br)*0.08;
      const M='#c4586a',MD='#7e2436',ML='#e88a92',BN='#f0dcc6',BD='#b89a86';
      const fl=(x,y)=>{g.strokeStyle=MD;g.lineWidth=0.5;g.stroke();};
      /* дальние рука и нога — темнее, позади */
      lmLimb(g,-8,FY-9,-12.5,FY-0.4,5.6,5.8,true,3.6,1.6,shadeHex(M,-0.4));
      const fa=lmLimb(g,5,FY-14,17+reach*0.6-cr*3,FY-0.4-cr*6,8,8.4,false,3,1.3,shadeHex(M,-0.42));
      g.strokeStyle=shadeHex(BN,-0.35);g.lineWidth=0.8;for(let q=-1;q<=1;q++){g.beginPath();g.moveTo(fa[0],fa[1]);g.quadraticCurveTo(fa[0]+2,fa[1]-0.6+q*0.4,fa[0]+3.4+q*0.3,fa[1]+0.2+q*0.8);g.stroke();}
      /* туловище: сгорбленная спина */
      g.beginPath();g.moveTo(-14,FY-8);g.bezierCurveTo(-15,FY-15,-8,FY-21.5,-1,FY-21);g.bezierCurveTo(5,FY-20.5,9,FY-18,9.5,FY-14);
      g.bezierCurveTo(8,FY-10,4,FY-8,0,FY-7.6);g.bezierCurveTo(-4,FY-5.2,-10,FY-4,-14,FY-8);g.closePath();
      mobPath(g,M,-4,FY-15,13);
      g.save();g.clip();
      /* волокна мышц: тёмные борозды и светлые жгуты по форме тела */
      for(let i=0;i<9;i++){const x=-13+i*2.6;g.strokeStyle='rgba(90,10,30,.55)';g.lineWidth=0.6;g.beginPath();g.moveTo(x-1,FY-21);g.bezierCurveTo(x+1.6,FY-16,x-0.6,FY-11,x+1.2,FY-5);g.stroke();
        g.strokeStyle='rgba(255,180,180,.28)';g.lineWidth=0.5;g.beginPath();g.moveTo(x+0.3,FY-20.5);g.bezierCurveTo(x+2.6,FY-16,x+0.6,FY-11,x+2.2,FY-6);g.stroke();}
      /* рёбра: бледные дуги с тёмными щелями */
      for(let i=0;i<3;i++){const x=-2.4+i*3.1+(i===2?0.4:0);g.strokeStyle='#4a0a18';g.lineWidth=1.3;g.beginPath();g.moveTo(x-0.6,FY-17.5);g.quadraticCurveTo(x+2.6,FY-13,x+0.6,FY-8.6);g.stroke();
        g.strokeStyle=BN;g.lineWidth=0.85;g.beginPath();g.moveTo(x-1.4,FY-17.6);g.quadraticCurveTo(x+1.8,FY-13,x-0.2,FY-8.8);g.stroke();
        g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=0.35;g.beginPath();g.moveTo(x-1.5,FY-17.4);g.quadraticCurveTo(x+1.2,FY-14,x+0.2,FY-12);g.stroke();}
      /* тень брюха */
      g.fillStyle='rgba(40,0,12,.35)';g.beginPath();g.ellipse(-3,FY-5,13,4,0,0,TAU);g.fill();
      g.restore();
      /* позвонки по хребту */
      for(let i=0;i<6;i++){const a=i/5,x=-12+a*17,y=FY-15.5-Math.sin(a*Math.PI)*6+ a*1.5;
        g.fillStyle=BD;g.beginPath();g.ellipse(x,y-1,1.25,1.1,-0.4,0,TAU);g.fill();g.fillStyle=BN;g.beginPath();g.ellipse(x-0.25,y-1.3,0.8,0.7,-0.4,0,TAU);g.fill();}
      /* клок старой шкуры на бедре: рваный край и стежки */
      g.beginPath();g.moveTo(-14.6,FY-12);g.quadraticCurveTo(-12,FY-16.4,-8.2,FY-15.6);g.lineTo(-7.6,FY-13);g.lineTo(-9,FY-12.2);g.lineTo(-8.4,FY-10.2);g.lineTo(-10.6,FY-10.8);g.lineTo(-11.2,FY-8.6);g.lineTo(-13,FY-9.6);g.lineTo(-14.6,FY-8.8);g.closePath();
      mobPath(g,'#d2b0f0',-12,FY-13,4);
      lmFur(g,[[-13,FY-14,0.8,-1.2],[-11,FY-15.2,0.6,-1.2],[-9.4,FY-14.8,0.6,-1]],'rgba(255,255,255,.55)',0.5);
      g.strokeStyle='#5a1a2a';g.lineWidth=0.4;for(let i=0;i<4;i++){const x=-13.4+i*1.4;g.beginPath();g.moveTo(x,FY-9.6+i*0.1);g.lineTo(x+0.6,FY-8.4);g.stroke();}
      /* ближнее бедро: мышечный ком, жилистая голень, длинная ступня с когтями */
      g.beginPath();g.ellipse(-8.6,FY-8.6,5,4.4,-0.4,0,TAU);mobPath(g,shadeHex(M,0.06),-9.5,FY-10,5);
      g.strokeStyle='rgba(90,10,30,.5)';g.lineWidth=0.5;g.beginPath();g.arc(-8.6,FY-8.6,3.2,-2.6,0.4);g.stroke();
      const hf=lmLimb(g,-7,FY-6,-4.4,FY-0.5,4.4,4.8,true,3.2,1.5,M);
      g.strokeStyle=BN;g.lineWidth=0.75;for(let q=-1;q<=1;q++){g.beginPath();g.moveTo(hf[0],hf[1]);g.lineTo(hf[0]+2.6,hf[1]+0.3+q*0.3);g.stroke();}
      /* ближняя рука: плечо-ком, длинное предплечье, кисть с костяными когтями */
      const nearArm=()=>{
      g.beginPath();g.ellipse(5.4,FY-13.4,3.6,4,0.5,0,TAU);mobPath(g,shadeHex(M,0.08),4.5,FY-15,4);
      /* в атаке ближняя рука взлетает для удара когтями */
      const ha=lmLimb(g,6,FY-12.5,18+reach+cr*4,FY-0.6-cr*6,8,8.6,false,3.4,1.5,shadeHex(M,0.04));
      for(let q=-1;q<=1;q++){g.strokeStyle=BD;g.lineWidth=1.1;g.beginPath();g.moveTo(ha[0],ha[1]);g.quadraticCurveTo(ha[0]+2.4,ha[1]-0.8+q*0.5,ha[0]+4+q*0.4,ha[1]+0.4+q*0.9);g.stroke();
        g.strokeStyle=BN;g.lineWidth=0.5;g.beginPath();g.moveTo(ha[0]+0.3,ha[1]-0.2);g.quadraticCurveTo(ha[0]+2.2,ha[1]-0.9+q*0.5,ha[0]+3.6+q*0.4,ha[1]+0.1+q*0.9);g.stroke();}
      };
      if(cr<=0.3)nearArm();
      /* шея: натянутые жилы */
      g.strokeStyle=ML;g.lineWidth=0.7;for(const o of [0,1.4]){g.beginPath();g.moveTo(5+o,FY-18.6);g.quadraticCurveTo(8+o,FY-18.8,10+o*0.6,FY-17);g.stroke();}
      /* голова: вытянутый череп без кожи */
      g.save();g.translate(12+cr*2.5,FY-18.4+cr*2);g.rotate(0.12+cr*0.25);
      /* уши: рваные перепонки с жилками (дальнее темнее) */
      for(const [ex,a,dk] of [[-3.2,-0.95,1],[-1,-0.45,0]]){g.save();g.translate(ex,-3.4);g.rotate(a+Math.sin(t*2.6+ex)*0.06-cr*0.3);
        g.beginPath();g.moveTo(-1.8,0);g.bezierCurveTo(-2.8,-5,-1.6,-11,0.4,-12.6);g.lineTo(0.9,-10.2);g.lineTo(1.8,-11);g.bezierCurveTo(2.6,-7,2.4,-3,1.8,0);g.closePath();
        mobPath(g,dk?shadeHex(M,-0.35):'#d07a84',0,-6,7);
        g.strokeStyle=dk?'rgba(60,0,16,.6)':'#8a1a32';g.lineWidth=0.4;g.beginPath();g.moveTo(0,-0.5);g.quadraticCurveTo(-0.6,-5,0.2,-10.5);g.moveTo(0,-4);g.lineTo(1.3,-6.4);g.moveTo(-0.2,-6.5);g.lineTo(-1.3,-8.6);g.stroke();g.restore();}
      /* верхняя челюсть и свод черепа */
      g.beginPath();g.moveTo(-5,-1);g.bezierCurveTo(-5,-6.4,2,-7.2,6,-4.4);g.bezierCurveTo(8.4,-3,9.6,-1.4,9.4,0.4);g.lineTo(1,0.8);g.closePath();mobPath(g,'#cc6a76',2,-3,7);
      /* кость черепа проступает сверху */
      g.fillStyle=BN;g.beginPath();g.moveTo(-3.8,-3.6);g.bezierCurveTo(-2.6,-6,1.8,-6.4,4.4,-4.6);g.bezierCurveTo(2,-5,-1,-4.6,-3.8,-3.6);g.fill();
      /* нижняя челюсть: открывается при атаке */
      g.save();g.translate(0.6,0.6);g.rotate(jaw*0.6);
      g.beginPath();g.moveTo(-3,0);g.lineTo(8,0.2);g.quadraticCurveTo(8.4,2.4,6,3);g.lineTo(-1.6,2.6);g.closePath();mobPath(g,'#b4505e',3,1.5,5);
      g.fillStyle='#4a0614';g.beginPath();g.moveTo(-1,0.2);g.lineTo(7.4,0.3);g.lineTo(6,1.6);g.lineTo(-0.6,1.4);g.closePath();g.fill();
      g.fillStyle='#e0607a';g.beginPath();g.ellipse(2.6,0.6,2.6,0.8,0.05,0,TAU);g.fill();
      lmTeeth(g,0.4,0.3,7.6,7,1.5,'#fff2e2',false);
      g.restore();
      /* пасть: тёмная глотка и иглы верхних зубов */
      g.fillStyle='#2a0208';g.beginPath();g.moveTo(-0.6,0.6);g.lineTo(9.2,0.4);g.lineTo(9,0.4+jaw*3.6);g.lineTo(-0.6,0.8+jaw*2.2);g.closePath();g.fill();
      lmTeeth(g,0.2,0.4,9,8,1.9,'#fff6ea');
      /* слюна */
      if(jaw>0.4){g.strokeStyle='rgba(255,230,240,.6)';g.lineWidth=0.35;g.beginPath();g.moveTo(5,0.8);g.quadraticCurveTo(5.4,1.8+jaw*2,4.6,2.2+jaw*3);g.stroke();}
      /* глаз без века: выпученный, в красных прожилках */
      g.fillStyle='#3a0610';g.beginPath();g.ellipse(2.2,-3,3,2.8,0,0,TAU);g.fill();
      const wg=g.createRadialGradient(1.8,-3.6,0.3,2.2,-3,2.6);wg.addColorStop(0,'#ffffff');wg.addColorStop(0.7,'#f4e4d8');wg.addColorStop(1,'#d8a8a0');
      g.fillStyle=wg;g.beginPath();g.ellipse(2.2,-3,2.5,2.3,0,0,TAU);g.fill();
      g.strokeStyle='rgba(190,20,40,.7)';g.lineWidth=0.3;for(const a of [0.3,1.4,2.6,3.6,4.8,5.6]){g.beginPath();g.moveTo(2.2+Math.cos(a)*2.4,-3+Math.sin(a)*2.2);g.quadraticCurveTo(2.2+Math.cos(a+0.4)*1.6,-3+Math.sin(a+0.4)*1.4,2.2+Math.cos(a)*1.1,-3+Math.sin(a)*1);g.stroke();}
      const ix=2.6+(m.lookX||0)*0.5,iy=-2.9+(m.lookY||0)*0.4;
      g.fillStyle='#c01830';g.beginPath();g.arc(ix,iy,1.2,0,TAU);g.fill();g.fillStyle='#200006';g.beginPath();g.arc(ix,iy,0.55,0,TAU);g.fill();
      g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.arc(ix-0.5,iy-0.6,0.35,0,TAU);g.fill();
      /* ноздри-дыры */
      g.fillStyle='#3a0610';g.beginPath();g.ellipse(8.6,-1.6,0.6,0.4,0.3,0,TAU);g.fill();
      g.restore();
      if(cr>0.3)nearArm();
      /* влажные блики на мясе */
      lmRim(g,q=>{q.fillStyle='rgba(255,230,230,.35)';for(const [x,y,r] of [[-6,FY-19,1],[-1,FY-20,0.8],[5,FY-16,0.7],[-9,FY-11,0.8]]){q.beginPath();q.ellipse(x,y,r*1.4,r*0.6,-0.4,0,TAU);q.fill();}
        q.strokeStyle='rgba(255,200,200,.3)';q.lineWidth=0.8;q.beginPath();q.moveTo(-13.6,FY-11);q.bezierCurveTo(-13,FY-16,-8,FY-20.5,-1,FY-20.4);q.stroke();});
    }
    g.restore();
  },
  lbutterfly(g,m,FY,t,T,st,k){
    const fl=Math.sin(t*(st==='dive'?22:12)+m.phase),wing=0.55+0.45*fl;
    const wc=T?['#8a8a90','#5a5a62']:['#ffc0e0','#9ad8ff'];
    /* крылья: дальнее темнее и позади тела */
    for(const far of [1,0]){g.save();g.translate(-1,-3);g.scale(1.45,1.45);g.rotate(-0.15-(far?0.35:0));g.scale(wing*(far?0.85:1),far?0.92:1);
      const gr=g.createLinearGradient(-16,-16,8,10);gr.addColorStop(0,far?shadeHex(wc[0],-0.3):wc[0]);gr.addColorStop(1,far?shadeHex(wc[1],-0.3):wc[1]);
      g.fillStyle=gr;g.beginPath();g.moveTo(0,0);g.bezierCurveTo(-18,-22,-24,-6,-12,2);g.bezierCurveTo(-18,8,-10,16,0,4);g.closePath();g.fill();
      g.strokeStyle=T?'rgba(30,30,36,.7)':'rgba(120,60,140,.5)';g.lineWidth=0.8;g.stroke();
      if(!far){if(T){/* на крыле — лицо с глазами */
          g.fillStyle='#c8c4c0';g.beginPath();g.ellipse(-11,-7,4.4,5.4,0.3,0,TAU);g.fill();g.fillStyle='#1a1a1e';g.beginPath();g.ellipse(-12.6,-8.4,1,0.6,0,0,TAU);g.ellipse(-9.4,-8,1,0.6,0,0,TAU);g.fill();
          g.strokeStyle='#3a3a40';g.lineWidth=0.6;g.beginPath();g.moveTo(-12.4,-4.8);g.lineTo(-9.6,-4.6);g.stroke();
          g.fillStyle='#ff2a3a';g.beginPath();g.arc(-6,4,1,0,TAU);g.fill();}
        else{g.fillStyle='rgba(255,255,255,.55)';for(const [x,y,r] of [[-12,-8,2.4],[-8,-12,1.6],[-9,6,1.8],[-15,-2,1.2]]){g.beginPath();g.arc(x,y,r,0,TAU);g.fill();}
          g.fillStyle='rgba(255,230,120,.7)';g.beginPath();g.arc(-6,-4,1.4,0,TAU);g.fill();}}
      g.restore();}
    /* тельце */
    g.beginPath();g.ellipse(0,0,4.4,8,0.2,0,TAU);mobPath(g,T?'#4a4a52':'#ffd8ec',0,0,8);
    if(!T){g.strokeStyle='rgba(160,200,255,.7)';g.lineWidth=1.2;for(let i=0;i<3;i++){g.beginPath();g.moveTo(-3.6,-1+i*3);g.lineTo(3.2,0+i*3);g.stroke();}}
    else{g.fillStyle='rgba(30,30,36,.6)';for(let i=0;i<8;i++){g.fillRect(-3+((i*7)%7),-6+i*1.6,1,1.4);}}
    /* голова */
    g.beginPath();g.arc(3,-10,4.6,0,TAU);mobPath(g,T?'#5a5a62':'#ffe0f0',3,-10,5);
    g.strokeStyle=T?'#2a2a30':'#7a4a8a';g.lineWidth=0.7;for(const sd of [0,1]){g.beginPath();g.moveTo(2+sd*2,-14);g.quadraticCurveTo(1+sd*4,-20,-1+sd*7,-21);g.stroke();g.fillStyle=g.strokeStyle;g.beginPath();g.arc(-1+sd*7,-21,0.9,0,TAU);g.fill();}
    if(!T){mobEye(g,m,5,-10.4,1.6,{iris:'#3a7ad8',ir:0.7});g.fillStyle='rgba(255,140,180,.6)';g.beginPath();g.arc(5.6,-8,1,0,TAU);g.fill();
      g.fillStyle='#ffd040';g.beginPath();g.moveTo(0,-14);g.lineTo(1,-17);g.lineTo(2.4,-15);g.lineTo(3.6,-17.4);g.lineTo(4.6,-15);g.lineTo(6,-16.6);g.lineTo(6,-14);g.closePath();g.fill();}
    else{g.fillStyle='#e8e4e0';g.beginPath();g.ellipse(5,-10,2.4,3,0,0,TAU);g.fill();g.fillStyle='#1a1a1e';g.beginPath();g.arc(5.6,-11,0.7,0,TAU);g.arc(3.8,-10.6,0.6,0,TAU);g.arc(5,-8.6,0.6,0,TAU);g.fill();}
    if(st==='windup')mobGlow(g,6,-4,10+k*8,T?'#a0a0a0':'#ffe0f0',0.5*k);
  },
  ldaisy(g,m,FY,t,T,st,k){
    const walk=Math.abs(m.vx)>6,sw=walk?Math.sin(m.anim*9):0,root=st==='root'?k:0;
    /* корни-ножки */
    const rc=T?'#5a4a3a':'#4a8a3a';
    for(const [ox,o] of [[-3,0],[3,Math.PI]]){const s=lmStep(m,o,4);
      g.strokeStyle=rc;g.lineWidth=2.2;g.lineCap='round';g.beginPath();g.moveTo(ox*0.4,FY-12);g.quadraticCurveTo(ox,FY-6,ox+s[0]+(T?2:0),FY+s[1]-root*0);g.stroke();
      if(T){g.lineWidth=0.9;for(let f=-1;f<=1;f++){g.beginPath();g.moveTo(ox+s[0]+2,FY+s[1]);g.lineTo(ox+s[0]+4+f,FY+s[1]+1);g.stroke();}}
      else{g.fillStyle='#3a6a2a';g.beginPath();g.ellipse(ox+s[0]+1,FY+s[1]-0.6,2.6,1.2,0,0,TAU);g.fill();}}
    /* стебель и листья-руки */
    g.strokeStyle=T?'#4a5a2a':'#3e8a3a';g.lineWidth=2.6;g.beginPath();g.moveTo(0,FY-12);g.quadraticCurveTo(sw*1.5,FY-20,0,FY-27);g.stroke();
    for(const sd of [-1,1]){g.save();g.translate(0,FY-18);g.rotate(sd*(0.9+Math.sin(t*3+sd)*0.15)+(st==='seed'?-k*0.6:0));
      g.beginPath();g.ellipse(sd*5,0,5,2.2,0,0,TAU);mobPath(g,T?'#5a6a3a':'#5aa83a',sd*5,0,5);g.restore();}
    /* голова-цветок */
    g.save();g.translate(1,FY-30);g.rotate(Math.sin(t*1.6)*0.08-root*0.2);
    const pc=T?'#8a4a4a':'#fffaf2';
    /* лепестки двумя заливками: чётные и нечётные */
    for(const odd of [1,0]){g.beginPath();for(let i=odd;i<12;i+=2){const a=i/12*TAU+t*0.1,cx=Math.sin(a)*8.4,cy=-Math.cos(a)*8.4;g.moveTo(cx+Math.cos(a)*2.8,cy+Math.sin(a)*2.8);g.ellipse(cx,cy,2.8,5.2,a,0,TAU);}
      g.fillStyle=odd?shadeHex(pc,-0.12):pc;g.fill();g.strokeStyle=T?'#4a1a1a':'#d8c8b8';g.lineWidth=0.5;g.stroke();}
    if(!T){g.beginPath();g.arc(0,0,6,0,TAU);mobPath(g,'#ffd040',0,0,6);
      g.fillStyle='#3a2410';g.beginPath();g.arc(-1.4,-1,0.9,0,TAU);g.arc(2.6,-1,0.9,0,TAU);g.fill();
      g.strokeStyle='#8a4a10';g.lineWidth=0.9;g.beginPath();g.arc(0.6,0.8,2.6,0.2,Math.PI-0.2);g.stroke();
      g.fillStyle='rgba(255,120,80,.5)';g.beginPath();g.arc(-3,1,1,0,TAU);g.arc(4,1,1,0,TAU);g.fill();}
    else{/* глазное яблоко с жилками, следит за шахтёром */
      g.fillStyle='#f4ece4';g.beginPath();g.arc(0,0,6.4,0,TAU);g.fill();
      g.strokeStyle='rgba(180,20,30,.8)';g.lineWidth=0.6;for(let i=0;i<7;i++){const a=i/7*TAU;g.beginPath();g.moveTo(Math.cos(a)*6,Math.sin(a)*6);g.quadraticCurveTo(Math.cos(a+0.3)*4,Math.sin(a+0.3)*4,Math.cos(a)*2.6,Math.sin(a)*2.6);g.stroke();}
      const lx=(m.lookX||0)*2,ly=(m.lookY||0)*2;g.fillStyle='#8a1a20';g.beginPath();g.arc(lx,ly,2.8,0,TAU);g.fill();g.fillStyle='#120408';g.beginPath();g.arc(lx,ly,1.4,0,TAU);g.fill();
      g.fillStyle='rgba(255,255,255,.8)';g.beginPath();g.arc(lx-1,ly-1,0.7,0,TAU);g.fill();
      g.fillStyle='#8a0a14';g.fillRect(-4,5,1,3);g.fillRect(2,5.4,1,4);}
    g.restore();
    if(root>0)mobGlow(g,0,FY,10+root*8,T?'#ff3a3a':'#9aff6a',0.4*root);
  },
  lbee(g,m,FY,t,T,st,k){
    const fl=Math.sin(t*40+m.phase),dash=st==='dash';
    g.save();g.rotate(dash?0.15:Math.sin(t*3+m.phase)*0.06);
    /* крылья: дальнее позади */
    g.fillStyle='rgba(230,240,255,.5)';g.beginPath();g.ellipse(-3,-9,4.4,7*(0.4+0.6*Math.abs(fl)),-0.5,0,TAU);g.fill();
    /* жало / шприц */
    if(T){g.save();g.translate(-12,2);g.rotate(0.15);g.fillStyle='rgba(220,235,245,.8)';g.fillRect(-9,-2,9,4);g.fillStyle='#8a1020';g.fillRect(-8,-1.4,5+k*2,2.8);g.fillStyle='#c8ccd8';g.fillRect(-12,-0.5,3,1);g.fillRect(0,-2.6,1.4,5.2);g.restore();}
    else{g.fillStyle='#2a1a06';g.beginPath();g.moveTo(-11,1);g.lineTo(-16-k*2,2);g.lineTo(-11,3.4);g.closePath();g.fill();}
    /* тельце в полоску */
    g.beginPath();g.ellipse(-3,1,10,8.4,0,0,TAU);mobPath(g,'#ffd040',-3,1,10);
    g.save();g.beginPath();g.ellipse(-3,1,10,8.4,0,0,TAU);g.clip();g.fillStyle='#3a2a10';for(const x of [-9,-3.6]){g.fillRect(x,-8,3,18);}g.restore();
    g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.ellipse(-5,-4,4,1.6,-0.3,0,TAU);g.fill();
    g.fillStyle='rgba(240,248,255,.7)';g.beginPath();g.ellipse(-1,-10,4.6,7*(0.4+0.6*Math.abs(fl)),0.4,0,TAU);g.fill();
    /* голова */
    if(!T){g.beginPath();g.arc(7,-1,6.4,0,TAU);mobPath(g,'#ffe070',7,-1,6);
      g.fillStyle='#fff6f0';g.beginPath();g.arc(6,-6,6.6,Math.PI*1.05,Math.PI*1.95);g.quadraticCurveTo(13,-3,11,-2);g.lineTo(1,-3);g.closePath();g.fill();
      g.fillStyle='#ffb8d4';g.beginPath();g.arc(6,-11,1.6,0,TAU);g.fill();
      mobEye(g,m,9,-1,2,{iris:'#3a2410',ir:0.75});g.fillStyle='rgba(255,120,120,.55)';g.beginPath();g.arc(10,2.4,1.2,0,TAU);g.fill();
      g.strokeStyle='#3a2410';g.lineWidth=0.7;g.beginPath();g.arc(11,1.6,1.4,0.3,Math.PI-0.3);g.stroke();}
    else{g.beginPath();g.ellipse(7.4,-1,6.6,7,0,0,TAU);mobPath(g,'#f0d0c4',7,-1,7);
      g.fillStyle='#fff';g.beginPath();g.arc(8.4,-2.6,2.2,0,TAU);g.arc(12,-2.2,1.8,0,TAU);g.fill();g.fillStyle='#1a1a1a';g.beginPath();g.arc(8.8,-2.6,0.9,0,TAU);g.arc(12.2,-2.2,0.8,0,TAU);g.fill();
      g.fillStyle='#4a0a14';g.beginPath();g.ellipse(11,2.6,1.8,2.2,0,0,TAU);g.fill();g.strokeStyle='#c8a090';g.lineWidth=0.5;g.beginPath();g.arc(6,-6,3,3.6,5.4);g.stroke();}
    g.strokeStyle='#2a1a06';g.lineWidth=0.7;g.beginPath();g.moveTo(5,-7);g.quadraticCurveTo(4,-12,2,-13);g.moveTo(8,-7);g.quadraticCurveTo(9,-12,11,-13);g.stroke();
    for(const sd of [0,1]){g.strokeStyle='#2a1a06';g.lineWidth=0.9;g.beginPath();g.moveTo(-4+sd*4,8);g.lineTo(-5+sd*4,11);g.stroke();}
    g.restore();
  },
  lslime(g,m,FY,t,T,st,k){
    const b=Math.sin(t*4+m.phase),air=!m.onGround,sq=air?clamp(-m.vy/300,-0.3,0.3):0,sp=st==='spit'?k:0;
    g.save();g.translate(0,FY);g.scale(1+b*0.04-sq*0.15+sp*0.08,1-b*0.04+sq*0.2-sp*0.1);
    if(!T){
      g.beginPath();g.moveTo(-14,0);g.quadraticCurveTo(-15,-14,0,-24);g.quadraticCurveTo(15,-14,14,0);g.closePath();mobPath(g,'#ffb030',0,-10,14);
      g.fillStyle='rgba(255,240,180,.55)';g.beginPath();g.ellipse(-6,-14,3,5,-0.5,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.8)';g.beginPath();g.arc(-6,-17,1.4,0,TAU);g.fill();
      g.fillStyle='rgba(160,80,0,.25)';for(let i=0;i<4;i++){g.beginPath();g.arc(-6+i*4,-4+Math.sin(t*2+i)*1,1.2,0,TAU);g.fill();}
      mobEye(g,m,4,-11,2.2,{iris:'#3a1a00',ir:0.8});mobEye(g,m,10,-10.6,1.8,{iris:'#3a1a00',ir:0.8});
      g.fillStyle='rgba(255,120,120,.5)';g.beginPath();g.arc(2,-7,1.3,0,TAU);g.arc(12,-7,1.1,0,TAU);g.fill();
      g.strokeStyle='#6a3200';g.lineWidth=0.9;g.beginPath();g.arc(7,-7.6,2+sp,0.2,Math.PI-0.2);g.stroke();
    }else{
      /* Истина: тёмный мёд, внутри — утонувшие лица и руки */
      g.beginPath();g.moveTo(-17,0);g.quadraticCurveTo(-16,-12,-4,-17);g.quadraticCurveTo(8,-19,14,-10);g.quadraticCurveTo(18,-4,17,0);g.closePath();mobPath(g,'#9a5a10',0,-8,16);
      for(const [x,y,s] of [[-8,-7,1],[3,-11,0.9],[9,-5,0.8],[-2,-3,0.7]]){g.fillStyle='rgba(60,30,8,.6)';g.beginPath();g.ellipse(x,y,3*s,3.6*s,0,0,TAU);g.fill();
        g.fillStyle='rgba(30,12,4,.8)';g.beginPath();g.arc(x-1*s,y-0.8*s,0.6*s,0,TAU);g.arc(x+1*s,y-0.8*s,0.6*s,0,TAU);g.fill();g.beginPath();g.ellipse(x,y+1.4*s,0.8*s,1.2*s,0,0,TAU);g.fill();}
      g.strokeStyle='rgba(70,36,10,.7)';g.lineWidth=1;for(let i=0;i<3;i++){const x=-10+i*9,y=-12+Math.sin(t*2+i)*1.4;g.beginPath();g.moveTo(x,y);g.lineTo(x-1.4,y-3);g.moveTo(x,y);g.lineTo(x+0.4,y-3.4);g.moveTo(x,y);g.lineTo(x+1.8,y-2.6);g.stroke();}
      g.fillStyle='rgba(255,220,140,.3)';g.beginPath();g.ellipse(-6,-12,4,2,-0.3,0,TAU);g.fill();
    }
    g.restore();
  },
  lwaxknight(g,m,FY,t,T,st,k){
    const wu=st==='windup'?k:0,th=st==='thrust',melt=m.melt||T;
    const wc=['#fff6dc','#f0dcaa','#c8a868'],walk=Math.abs(m.vx)>6;
    /* ноги */
    for(const [ox,o,far] of [[-3,Math.PI,1],[3,0,0]]){const s=lmStep(m,o,3.2);g.fillStyle=far?wc[2]:wc[1];g.fillRect(ox-2+s[0]*0.5,FY-10,4,10+s[1]);g.fillStyle=far?'#8a6a30':'#b8862a';g.fillRect(ox-2.6+s[0]*0.5,FY-2+s[1],5.6,2.4);}
    /* копьё: отводится на замахе */
    const lx=th?8:-wu*7;
    g.save();g.translate(lx,FY-18);g.strokeStyle='#8a6a40';g.lineWidth=2;g.beginPath();g.moveTo(-6,0);g.lineTo(16,0);g.stroke();
    g.fillStyle=melt?'#d8c8a0':'#f4ead0';g.beginPath();g.moveTo(14,-3.4);g.lineTo(28,0);g.lineTo(14,3.4);g.closePath();g.fill();g.fillStyle='rgba(255,255,255,.5)';g.beginPath();g.moveTo(15,-2.4);g.lineTo(26,-0.3);g.lineTo(15,-0.6);g.fill();
    if(melt){g.fillStyle='#f4e2b0';g.beginPath();g.arc(20,2.6,1.2,0,TAU);g.fill();g.fillRect(19.4,2.6,1.2,3);}g.restore();
    /* тело-свеча в доспехе */
    g.beginPath();g.moveTo(-7,FY-10);g.lineTo(-7.6,FY-27);g.quadraticCurveTo(0,FY-29,7.6,FY-27);g.lineTo(7,FY-10);g.closePath();mobPath(g,wc[1],0,FY-19,10);
    g.fillStyle='#b8862a';g.fillRect(-7.4,FY-15,14.8,2);g.fillStyle='#e0b050';g.fillRect(-7.4,FY-15,14.8,0.8);
    for(const x of [-4,0,4]){g.fillStyle='#e0b050';g.beginPath();g.arc(x,FY-24,0.9,0,TAU);g.fill();}
    if(melt){g.fillStyle=wc[0];for(const [x,l] of [[-6,6],[-2,9],[3,5],[6,8]]){g.beginPath();g.moveTo(x-1.4,FY-27);g.lineTo(x+1.4,FY-27);g.lineTo(x+0.8,FY-27+l);g.arc(x,FY-27+l,0.9,0,Math.PI);g.closePath();g.fill();}}
    /* голова: в Иллюзии — пламя, в Истине — оплывшее лицо */
    if(!T){g.beginPath();g.moveTo(-5,FY-27);g.lineTo(-5,FY-36);g.quadraticCurveTo(0,FY-38,5,FY-36);g.lineTo(5,FY-27);g.closePath();mobPath(g,wc[0],0,FY-32,6);
      g.fillStyle='#3a2a10';g.fillRect(-3.4,FY-33,2.4,1.4);g.fillRect(1.2,FY-33,2.4,1.4);g.fillStyle='rgba(255,200,80,.9)';g.fillRect(-3,FY-32.8,1.6,0.8);g.fillRect(1.6,FY-32.8,1.6,0.8);
      g.strokeStyle='#2a2020';g.lineWidth=0.8;g.beginPath();g.moveTo(0,FY-37);g.lineTo(0,FY-39);g.stroke();
      const f=1+Math.sin(t*14)*0.12;lmRim(g,(g)=>{g.fillStyle='rgba(255,150,40,.95)';g.beginPath();g.moveTo(-3,FY-38.6);g.quadraticCurveTo(0,FY-48*f,3,FY-38.6);g.closePath();g.fill();
        g.fillStyle='rgba(255,240,180,.95)';g.beginPath();g.ellipse(0,FY-41,1.2,2.6*f,0,0,TAU);g.fill();softGlow(g,0,FY-42,14,'#ffb040',0.6);});}
    else{g.beginPath();g.moveTo(-5,FY-27);g.quadraticCurveTo(-7,FY-34,-3,FY-38);g.quadraticCurveTo(3,FY-40,5,FY-35);g.lineTo(6,FY-27);g.closePath();mobPath(g,'#e8d8b8',0,FY-32,6);
      g.fillStyle='#e8d8b8';g.beginPath();g.moveTo(-6,FY-35);g.quadraticCurveTo(-9,FY-30,-7,FY-24);g.lineTo(-5,FY-30);g.closePath();g.fill();
      g.fillStyle='#1a1008';g.beginPath();g.ellipse(-1,FY-33,1.4,1.8,0.3,0,TAU);g.ellipse(3,FY-32,1.2,1.4,-0.2,0,TAU);g.fill();
      g.fillStyle='#4a2a1a';g.beginPath();g.ellipse(1.6,FY-29,1.6,2.4,0.2,0,TAU);g.fill();}
    /* щит спереди */
    g.save();g.translate(5,FY-19);g.beginPath();g.ellipse(0,0,5,8,0,0,TAU);mobPath(g,melt?'#d8b870':'#e0b050',0,0,8);
    g.fillStyle=melt?'#a8862a':'#c89030';g.beginPath();for(let i=0;i<6;i++){const a=i/6*TAU;g.lineTo(Math.cos(a)*2.6,Math.sin(a)*2.6);}g.closePath();g.fill();
    g.strokeStyle='rgba(255,240,180,.7)';g.lineWidth=0.7;g.beginPath();g.ellipse(-0.6,-0.6,4,7,0,Math.PI*1.1,Math.PI*1.6);g.stroke();g.restore();
  },
  ldoll(g,m,FY,t,T,st,k){
    const frz=m.frz,walk=!frz&&Math.abs(m.vx)>6,sn=st==='snipw'?k:0;
    /* паучьи лапы в Истине (из-под платья) */
    if(T){for(let i=0;i<4;i++){const sd=i%2?1:-1,ph=walk?Math.sin(m.anim*16+i*1.6)*3:0;
      g.strokeStyle=i<2?'#2a1a20':'#3a2a30';g.lineWidth=1.6;g.lineCap='round';g.beginPath();g.moveTo(sd*2,FY-12);g.quadraticCurveTo(sd*(10+i*2),FY-20+i,sd*(13+i*1.6)+ph,FY);g.stroke();}}
    /* ножки */
    if(!T)for(const [ox,o] of [[-2.4,0],[2.4,Math.PI]]){const s=walk?lmStep(m,o,2.4):[0,0];g.fillStyle='#f8e8f0';g.fillRect(ox-1+s[0]*0.4,FY-6,2,6+s[1]);g.fillStyle='#e06a9a';g.fillRect(ox-1.6+s[0]*0.4,FY-1.4+s[1],3.6,1.8);}
    /* платье */
    g.beginPath();g.moveTo(-10,FY-5);g.quadraticCurveTo(-8,FY-16,-4,FY-20);g.lineTo(4,FY-20);g.quadraticCurveTo(8,FY-16,10,FY-5);g.closePath();mobPath(g,T?'#c88aa8':'#ffb8d8',0,FY-12,10);
    g.fillStyle='#fff';for(let i=0;i<7;i++){g.beginPath();g.arc(-9+i*3,FY-5,1.6,0,Math.PI);g.fill();}
    if(T){g.strokeStyle='#5a2a3a';g.lineWidth=0.7;g.beginPath();g.moveTo(-6,FY-5);g.lineTo(-4,FY-10);g.lineTo(-5,FY-14);g.moveTo(5,FY-5);g.lineTo(6,FY-9);g.stroke();g.fillStyle='#1a0a10';g.beginPath();g.moveTo(-2,FY-5);g.lineTo(0,FY-9);g.lineTo(2,FY-5);g.fill();}
    g.fillStyle='#e06a9a';g.beginPath();g.moveTo(0,FY-18);g.lineTo(-3,FY-20);g.lineTo(-3,FY-16);g.closePath();g.moveTo(0,FY-18);g.lineTo(3,FY-20);g.lineTo(3,FY-16);g.closePath();g.fill();
    /* руки и ножницы */
    g.strokeStyle='#f8e8f0';g.lineWidth=1.8;g.lineCap='round';g.beginPath();g.moveTo(3,FY-18);g.lineTo(7+sn*2,FY-14-sn*3);g.stroke();
    g.save();g.translate(8+sn*2,FY-14-sn*3);const op=0.15+sn*0.5;for(const sd of [-1,1]){g.save();g.rotate(sd*op);g.fillStyle='#d8dce4';g.fillRect(0,-0.6,7,1.2);g.restore();}
    g.strokeStyle='#e06a9a';g.lineWidth=0.9;g.beginPath();g.arc(-1.4,-1.4,1.4,0,TAU);g.arc(-1.4,1.4,1.4,0,TAU);g.stroke();g.restore();
    /* голова */
    g.beginPath();g.arc(0,FY-25,6,0,TAU);mobPath(g,'#fdf2f4',0,FY-25,6);
    g.fillStyle='#ffd890';g.beginPath();g.arc(0,FY-27,6.6,Math.PI*1.02,TAU*0.99);g.fill();g.fillRect(-6.6,FY-27,2.4,10);g.fillRect(4.2,FY-27,2.4,10);
    g.fillStyle='rgba(255,255,255,.4)';g.beginPath();g.ellipse(-2,FY-31,2.4,0.9,-0.3,0,TAU);g.fill();
    g.fillStyle='#e06a9a';for(const sd of [-1,1]){g.beginPath();g.moveTo(0,FY-32);g.lineTo(sd*4,FY-35);g.lineTo(sd*4,FY-30);g.closePath();g.fill();}
    if(!T){mobEye(g,m,-1.6,FY-25,1.5,{iris:'#3a8ab8',ir:0.75});mobEye(g,m,2.6,FY-25,1.5,{iris:'#3a8ab8',ir:0.75});
      g.fillStyle='rgba(255,130,160,.5)';g.beginPath();g.arc(-3,FY-22.6,1.1,0,TAU);g.arc(4,FY-22.6,1.1,0,TAU);g.fill();g.fillStyle='#d04a6a';g.beginPath();g.arc(0.6,FY-21.6,0.8,0,TAU);g.fill();}
    else{g.fillStyle='#0a0408';g.beginPath();g.ellipse(-1.6,FY-25,1.6,2,0,0,TAU);g.ellipse(2.6,FY-25,1.6,2,0,0,TAU);g.fill();
      g.strokeStyle='#3a1a24';g.lineWidth=0.7;g.beginPath();g.moveTo(-1.6,FY-23);g.lineTo(-2,FY-19);g.moveTo(2.4,FY-31);g.lineTo(1.4,FY-28);g.lineTo(2.6,FY-26.6);g.stroke();
      g.strokeStyle='#5a0a1a';g.beginPath();g.moveTo(-1,FY-21.6);g.lineTo(2.4,FY-21.6);g.stroke();}
    if(frz&&Math.random()<0.02)spawnPart(m.x,m.y-m.h*0.9,0,-10,0.6,'rgba(255,255,255,.6)',1.4,0);
  },
  lsoldier(g,m,FY,t,T,st,k){
    const walk=Math.abs(m.vx)>6,aim=st==='aim'?1:0,rw=st==='rewind';
    const coat=T?'#5a4a3a':'#3a4a8a',pants=T?'#6a5a4a':'#f4f0e8';
    for(const [ox,o,far] of [[-2.4,Math.PI,1],[2.4,0,0]]){const s=walk?lmStep(m,o,3):[0,0];g.fillStyle=far?shadeHex(pants,-0.25):pants;g.fillRect(ox-1.6+s[0]*0.5,FY-12,3.2,12+s[1]);g.fillStyle='#1a1a20';g.fillRect(ox-2+s[0]*0.5,FY-1.6+s[1],4.4,1.8);}
    /* заводной ключ на спине */
    g.save();g.translate(-7,FY-20);g.rotate(rw?t*12:t*1.5);g.fillStyle=T?'#8a6a40':'#e0b050';g.fillRect(-0.8,-1,1.6,2);for(const sd of [-1,1]){g.beginPath();g.ellipse(0,sd*3.4,2,2.6,0,0,TAU);g.fill();}
    g.fillStyle=T?'#3a2a1a':'#7a5a20';for(const sd of [-1,1]){g.beginPath();g.arc(0,sd*3.4,0.9,0,TAU);g.fill();}g.restore();
    /* мундир */
    g.beginPath();g.moveTo(-5,FY-12);g.lineTo(-5.6,FY-25);g.lineTo(5.6,FY-25);g.lineTo(5,FY-12);g.closePath();mobPath(g,coat,0,FY-18,8);
    g.fillStyle=T?'#8a7a5a':'#f4f0e8';g.fillRect(-1,FY-25,2,13);g.fillStyle=T?'#6a4a2a':'#e0b050';for(let i=0;i<3;i++){g.beginPath();g.arc(2,FY-23+i*3.6,0.7,0,TAU);g.fill();}
    g.fillStyle=T?'#6a4a2a':'#e0b050';g.fillRect(-6.4,FY-25.6,3,1.6);g.fillRect(3.4,FY-25.6,3,1.6);
    if(T){g.fillStyle='rgba(120,60,20,.6)';for(const [x,y] of [[-3,FY-20],[3,FY-15],[-2,FY-14]]){g.beginPath();g.arc(x,y,1.4,0,TAU);g.fill();}}
    /* ружьё */
    g.save();g.translate(3,FY-18);g.rotate(aim?-Math.atan2((m.ay||0)-(m.y-m.h*0.62),Math.abs((m.ax||m.x+1)-m.x))*-1*0+(aim?-0.0:0.6):0.6);
    g.fillStyle='#6a4a2a';g.fillRect(-4,-1.4,8,2.8);g.fillStyle='#3a3a40';g.fillRect(3,-0.9,13,1.8);g.fillStyle='#8a8e98';g.fillRect(3,-0.9,13,0.6);g.restore();
    /* голова и кивер */
    g.beginPath();g.arc(0.4,FY-28.6,3.6,0,TAU);mobPath(g,T?'#5a4a3a':'#ffe0c8',0.4,FY-28.6,4);
    if(!T){g.fillStyle='#1a1a2a';g.beginPath();g.arc(1.8,FY-29,0.6,0,TAU);g.fill();g.fillStyle='#e8806a';g.beginPath();g.arc(2.6,FY-27.4,0.8,0,TAU);g.fill();
      g.beginPath();g.moveTo(-3.6,FY-31);g.lineTo(-3.2,FY-40);g.lineTo(4,FY-40);g.lineTo(4.4,FY-31);g.closePath();mobPath(g,'#1a2240',0.4,FY-35,5);
      g.fillStyle='#e0b050';g.fillRect(-3.8,FY-32,8.4,1.4);g.beginPath();g.arc(0.4,FY-36,1.4,0,TAU);g.fill();g.fillStyle='#e02a3a';g.fillRect(-0.4,FY-44,1.6,4.4);}
    else{g.beginPath();g.ellipse(0.4,FY-31,4.8,2.6,0,Math.PI,TAU);mobPath(g,'#5a4a30',0.4,FY-31,5);g.fillStyle='#3a2a1a';g.fillRect(-4.4,FY-31,9.6,1.2);g.fillStyle='rgba(20,10,4,.5)';g.beginPath();g.arc(1,FY-28,1.6,0,TAU);g.fill();}
  },
  ljack(g,m,FY,t,T,st,k){
    const tune=st==='tune'?k:0,out=(m.ext||0)>0.01,box=st==='box'||st==='idle'||!st,hop=!m.onGround;
    g.save();g.translate(tune?Math.sin(t*50)*tune*1.2:0,0);
    /* коробка со звёздами */
    const bc=T?'#5a3a7a':'#8a4ab8';
    g.beginPath();g.rect(-12,FY-20,24,20);mobPath(g,bc,0,FY-10,12);
    g.fillStyle=shadeHex(bc,-0.25);g.fillRect(6,FY-20,6,20);
    g.fillStyle='#e0b050';g.fillRect(-12,FY-20,24,1.6);g.fillRect(-12,FY-1.6,24,1.6);g.fillRect(-12,FY-20,1.6,20);g.fillRect(10.4,FY-20,1.6,20);
    const star=(x,y,r)=>{g.fillStyle=T?'#c8a040':'#ffd040';g.beginPath();for(let i=0;i<10;i++){const a=i/10*TAU-Math.PI/2,rr2=i%2?r*0.42:r;g.lineTo(x+Math.cos(a)*rr2,y+Math.sin(a)*rr2);}g.closePath();g.fill();};
    star(-3,FY-10,4.6);star(8,FY-13,2.4);
    if(T){g.strokeStyle='#2a1a2a';g.lineWidth=0.7;g.beginPath();g.moveTo(-8,FY-2);g.lineTo(-6,FY-8);g.lineTo(-9,FY-12);g.stroke();}
    /* ручка-завод */
    g.save();g.translate(12,FY-10);g.rotate(tune?t*14:0);g.strokeStyle='#e0b050';g.lineWidth=1.4;g.beginPath();g.moveTo(0,0);g.lineTo(4,0);g.lineTo(4,4);g.stroke();g.restore();
    /* крышка */
    const lid=out?1.2:tune?1+Math.sin(t*30)*0.12*tune:0.95;
    g.save();g.translate(-12,FY-20);g.rotate(-lid);g.beginPath();g.rect(0,-2.4,24,2.4);mobPath(g,shadeHex(bc,0.15),12,-1,12);g.fillStyle='#e0b050';g.fillRect(0,-2.4,24,0.8);g.restore();
    /* голова выглядывает из щели, пока сидит в коробке */
    if(!out){const bob=Math.sin(t*3+m.phase)*1.2+(tune?Math.sin(t*40)*tune*1.5:0),sy=FY-20,hy=sy-9-bob-(hop?2:0);
      for(let i=0;i<4;i++){g.strokeStyle=i%2?'#c8ccd8':'#8a8e98';g.lineWidth=1.6;g.beginPath();g.ellipse(0,sy-1.5-i*2.1,5,1.4,0,0,TAU);g.stroke();}
      g.save();g.scale(0.82,0.82);lilClownHead(g,0,hy/0.82,m,t);g.restore();}
    if(out){g.strokeStyle='#c8ccd8';g.lineWidth=2;g.beginPath();g.moveTo(-3,FY-20);g.lineTo(3,FY-22);g.stroke();}
    g.restore();
  },
  lrosehound(g,m,FY,t,T,st,k){
    const lp=st==='leap',cr=st==='crouch'?k:0,run=Math.abs(m.vx)>8&&!lp,phs=m.anim*15;
    const body=-2+cr*3+(run?-Math.abs(Math.sin(phs))*1.2:0),tilt=lp?(m.vy<0?-0.18:0.14):cr*0.12;
    const foot=(bx,off,str)=>lp?null:run?[bx+Math.sin(phs+off)*str,FY-Math.max(0,Math.cos(phs+off))*3]:[bx,FY];
    g.save();g.translate(0,body);g.rotate(tilt);
    const lc=T?'#5a3a2a':'#2e6a36',lf=T?'#7a5a40':'#3e8a46';
    /* хвост */
    const sw=Math.sin(t*(run?10:4))*3;g.strokeStyle=lc;g.lineWidth=T?1.6:3;g.lineCap='round';g.beginPath();g.moveTo(-13,-6);g.quadraticCurveTo(-18,-12+sw,-17,-16+sw);g.stroke();
    if(!T){mobBlob(g,-17,-16+sw,3,3,lf);}
    /* дальние лапы */
    const fr=foot(8,Math.PI,4.5),bk=foot(-9,0,4.5);
    if(lp){lmLeg(g,8,-1,20,-2,5.5,5.5,false,T?1.6:3,lc);lmLeg(g,-9,-1,-21,2,6,6,true,T?1.6:3.2,lc);}else{lmLeg(g,8,-1,fr[0],fr[1]-body,5.8,6.2,false,T?1.6:3,lc);lmLeg(g,-9,-1,bk[0],bk[1]-body,6,6.6,true,T?1.6:3.2,lc);}
    if(!T){
      /* тело из листвы: шарики листьев с розами */
      for(const [x,y,r] of [[-9,-6,6],[-2,-8,7],[6,-7,6.4],[0,-3,6],[-8,-2,5],[7,-2,5]])mobBlob(g,x,y,r,r*0.86,lf,0,true);
      g.fillStyle='rgba(20,60,26,.5)';for(let i=0;i<10;i++){g.beginPath();g.ellipse(-10+i*2.2,-4+Math.sin(i*2)*4,1.4,0.7,i,0,TAU);g.fill();}
      for(const [x,y] of [[-6,-10],[2,-11],[-10,-3],[5,-3]]){g.fillStyle='#b8203e';g.beginPath();g.arc(x,y,1.8,0,TAU);g.fill();g.fillStyle='#ff6a8a';g.beginPath();g.arc(x-0.4,y-0.4,0.8,0,TAU);g.fill();}
    }else{
      /* скелет из колючих лоз */
      g.strokeStyle='#d8c8a8';g.lineWidth=1.6;g.beginPath();g.moveTo(-13,-6);g.quadraticCurveTo(-2,-11,10,-8);g.stroke();
      for(let i=0;i<5;i++){g.lineWidth=1;g.beginPath();g.moveTo(-8+i*3.6,-9.4+i*0.2);g.quadraticCurveTo(-7+i*3.6,-3,-9+i*3.6,0);g.stroke();}
      g.strokeStyle='#3a2a1a';g.lineWidth=1.2;g.beginPath();g.moveTo(-14,-4);for(let i=0;i<8;i++)g.lineTo(-12+i*3.4,-5+Math.sin(i*1.7)*3);g.stroke();
      g.fillStyle='#d8c8a8';for(let i=0;i<8;i++){g.beginPath();g.moveTo(-11+i*3.2,-6+Math.sin(i*1.7)*3);g.lineTo(-10.4+i*3.2,-8.6+Math.sin(i*1.7)*3);g.lineTo(-9.6+i*3.2,-6+Math.sin(i*1.7)*3);g.fill();}
      g.fillStyle='#8a0a1e';for(let i=0;i<3;i++){const dy=((t*0.8+i*0.33)%1)*8;g.fillRect(-6+i*6,-2+dy,1,2);}
    }
    /* ближние лапы */
    const fr2=foot(9,0,4.5),bk2=foot(-8,Math.PI,4.5);
    if(lp){lmLeg(g,9,-1,22,0,5.5,5.5,false,T?1.8:3.2,lf);lmLeg(g,-8,-1,-20,3,6,6,true,T?1.8:3.4,lf);}else{lmLeg(g,9,-1,fr2[0],fr2[1]-body,5.8,6.2,false,T?1.8:3.2,lf);lmLeg(g,-8,-1,bk2[0],bk2[1]-body,6,6.6,true,T?1.8:3.4,lf);}
    /* голова */
    g.save();g.translate(13,-9-cr*1.4);
    if(!T){mobBlob(g,0,0,6,5.4,lf);mobBlob(g,5,1.4,3.6,3,lf);g.fillStyle='#1a1a1a';g.beginPath();g.arc(8,0.6,1.1,0,TAU);g.fill();mobEye(g,m,2,-1.6,1.3,{iris:'#2a1a1a',ir:0.8});
      g.fillStyle='#b8203e';g.beginPath();g.arc(-3,-4,1.8,0,TAU);g.fill();mobBlob(g,-4,-5,2.4,3.4,shadeHex(lf,-0.15),-0.5,true);}
    else{g.fillStyle='#e0d4bc';g.beginPath();g.moveTo(-5,-4);g.quadraticCurveTo(2,-7,10,-1);g.lineTo(9,3);g.quadraticCurveTo(2,5,-4,3);g.closePath();g.fill();
      g.fillStyle='#120606';g.beginPath();g.ellipse(1,-1.4,1.8,1.6,0,0,TAU);g.fill();g.fillStyle='#ff2a3a';g.beginPath();g.arc(1.2,-1.4,0.8,0,TAU);g.fill();
      lmTeeth(g,3,2.6,9.6,5,1.6,'#f4ead6');g.strokeStyle='#3a2a1a';g.lineWidth=1;g.beginPath();g.moveTo(-4,-4);g.lineTo(-6,-10);g.moveTo(-1,-5);g.lineTo(-1,-11);g.stroke();
      g.fillStyle='#8a0a1e';g.fillRect(6,3,1,3);}
    g.restore();
    g.restore();
  },
  lgardener(g,m,FY,t,T,st,k){
    const walk=Math.abs(m.vx)>6,sn=st==='snipw'?k:0,thr=st==='throw'?k:0;
    for(const [ox,o,far] of [[-2.4,Math.PI,1],[2.4,0,0]]){const s=walk?lmStep(m,o,3):[0,0];
      g.fillStyle=far?'#3a5a2a':'#4a7a34';g.fillRect(ox-1.8+s[0]*0.5,FY-14,3.6,12+s[1]);g.fillStyle='#5a3a20';g.fillRect(ox-2.4+s[0]*0.5,FY-3+s[1],5,3);}
    /* туловище: рубашка в клетку и комбинезон */
    g.beginPath();g.moveTo(-6,FY-13);g.lineTo(-6.6,FY-28);g.quadraticCurveTo(0,FY-30,6.6,FY-28);g.lineTo(6,FY-13);g.closePath();mobPath(g,T?'#4a4a3a':'#c8484a',0,FY-20,9);
    if(!T){g.strokeStyle='rgba(255,230,210,.35)';g.lineWidth=0.6;for(let i=0;i<4;i++){g.beginPath();g.moveTo(-6,FY-26+i*3.4);g.lineTo(6,FY-26+i*3.4);g.moveTo(-4+i*3,FY-28);g.lineTo(-4+i*3,FY-14);g.stroke();}}
    g.beginPath();g.moveTo(-5,FY-12);g.lineTo(-4.4,FY-22);g.lineTo(4.4,FY-22);g.lineTo(5,FY-12);g.closePath();mobPath(g,T?'#3a4a2a':'#4a7a34',0,FY-17,6);
    g.fillStyle=T?'#5a6a3a':'#e0b050';g.beginPath();g.arc(-3,FY-21,0.8,0,TAU);g.arc(3,FY-21,0.8,0,TAU);g.fill();
    /* ножницы садовника */
    g.save();g.translate(5,FY-17);g.rotate(-0.1-thr*1.2);g.strokeStyle='#6a4a2a';g.lineWidth=1.8;g.beginPath();g.moveTo(-4,0);g.lineTo(2,0);g.stroke();
    const op=0.1+sn*0.55;for(const sd of [-1,1]){g.save();g.translate(2,0);g.rotate(sd*op);g.fillStyle=T?'#8a8e98':'#d8dce4';g.beginPath();g.moveTo(0,-1);g.lineTo(14,-0.3*sd);g.lineTo(0,1);g.closePath();g.fill();
      if(T){g.fillStyle='#8a1020';g.fillRect(9,-0.6,4,1.2);}g.restore();}g.restore();
    g.strokeStyle=T?'#c8c0b0':'#ffd8b8';g.lineWidth=2;g.lineCap='round';g.beginPath();g.moveTo(4,FY-26);g.lineTo(5,FY-18);g.stroke();
    /* голова */
    if(!T){g.beginPath();g.arc(1,FY-32,4.2,0,TAU);mobPath(g,'#ffd8b8',1,FY-32,4);
      g.fillStyle='#e8e8e8';g.beginPath();g.ellipse(2.6,FY-29.6,3,1.6,0,0,Math.PI);g.fill();g.fillStyle='#2a1a1a';g.beginPath();g.arc(3,FY-33,0.6,0,TAU);g.fill();
      g.strokeStyle='#a0705a';g.lineWidth=0.6;g.beginPath();g.arc(3.4,FY-31.4,1,0.2,Math.PI-0.4);g.stroke();}
    else{g.beginPath();g.moveTo(-3.6,FY-28);g.quadraticCurveTo(-4.4,FY-36,1,FY-37);g.quadraticCurveTo(6,FY-36,5,FY-28);g.closePath();mobPath(g,'#2a2a30',1,FY-32,5);
      g.fillStyle='#050308';g.beginPath();g.ellipse(2,FY-31.6,2.6,3.4,0,0,TAU);g.fill();}
    /* соломенная шляпа (в Истине — вся в глазах) */
    g.beginPath();g.ellipse(1,FY-35.6,9,2.2,0,0,TAU);mobPath(g,T?'#b89a5a':'#e8c870',1,FY-35.6,9);
    g.beginPath();g.moveTo(-4,FY-35.6);g.quadraticCurveTo(-3.4,FY-41,1,FY-41);g.quadraticCurveTo(5.4,FY-41,6,FY-35.6);g.closePath();mobPath(g,T?'#c8a868':'#f0d488',1,FY-38,5);
    if(!T){g.fillStyle='#c8484a';g.fillRect(-4,FY-37.4,10,1.4);}
    else{for(const [x,y] of [[-2,-38.6],[1.4,-39.4],[4.4,-38],[-6,-35.6],[7.4,-35.4],[1,-36.4]]){const bl=Math.sin(t*2+x*3)>0.95?0.2:1;g.fillStyle='#f4ece4';g.beginPath();g.ellipse(x,FY+y,1.2,0.9*bl,0,0,TAU);g.fill();
      if(bl>0.5){g.fillStyle='#8a1020';g.beginPath();g.arc(x+(m.lookX||0)*0.4,FY+y,0.5,0,TAU);g.fill();}}}
  },
  lfairy(g,m,FY,t,T,st,k){
    const fl=Math.sin(t*14+m.phase),spin=st==='spin'?k:0;
    g.save();g.rotate(spin*Math.sin(t*20)*0.1);
    /* крылья */
    for(const far of [1,0]){g.save();g.translate(-2,-6);g.rotate((far?-0.6:-0.3)+fl*0.3);g.fillStyle=T?(far?'rgba(80,60,60,.4)':'rgba(120,90,90,.5)'):(far?'rgba(255,220,240,.35)':'rgba(255,235,250,.55)');
      g.beginPath();g.ellipse(-6,-6,5,10,0.5,0,TAU);g.fill();g.beginPath();g.ellipse(-5,3,3.6,6,-0.6,0,TAU);g.fill();
      if(T){g.strokeStyle='rgba(60,30,30,.6)';g.lineWidth=0.5;g.beginPath();g.moveTo(0,0);g.lineTo(-9,-12);g.moveTo(-3,-3);g.lineTo(-8,-1);g.stroke();}g.restore();}
    if(!T){
      /* платье из лепестков */
      for(let i=0;i<5;i++){const a=-0.8+i*0.4;g.save();g.translate(0,2);g.rotate(a+Math.sin(t*3+i)*0.08);g.beginPath();g.ellipse(0,6,3.4,7,0,0,TAU);mobPath(g,i%2?'#ff8ab0':'#ffa8c4',0,6,7,true);g.restore();}
      g.beginPath();g.ellipse(0,-4,3.4,5.6,0,0,TAU);mobPath(g,'#ff9ab8',0,-4,6);
      g.strokeStyle='#ffe0e8';g.lineWidth=1.4;g.lineCap='round';g.beginPath();g.moveTo(2,-6);g.quadraticCurveTo(7,-8+Math.sin(t*3)*2,9,-12);g.moveTo(-2,-6);g.quadraticCurveTo(-6,-2,-8,0);g.stroke();
      g.beginPath();g.moveTo(-1,13);g.lineTo(-2,19);g.moveTo(1.4,13);g.quadraticCurveTo(3,16,5,17);g.stroke();
      g.beginPath();g.arc(1,-12,3.6,0,TAU);mobPath(g,'#ffe8ee',1,-12,4);
      g.fillStyle='#4a2a3a';g.beginPath();g.arc(2.6,-12,0.5,0,TAU);g.fill();g.strokeStyle='#4a2a3a';g.lineWidth=0.5;g.beginPath();g.arc(2.4,-12.4,1.2,3.6,5.4);g.stroke();
      /* роза-причёска */
      for(let i=0;i<6;i++){const a=i/6*TAU+t*0.2;g.fillStyle=i%2?'#e04a7a':'#ff6a9a';g.beginPath();g.ellipse(-0.6+Math.cos(a)*2.2,-16+Math.sin(a)*1.6,2.4,1.6,a,0,TAU);g.fill();}
      g.fillStyle='#ffb0c8';g.beginPath();g.arc(-0.6,-16,1.4,0,TAU);g.fill();
      lmRim(g,(g)=>{softGlow(g,0,-2,16,'#ffb8d0',0.45+spin*0.3);});
    }else{
      /* Истина: тело, оплетённое лозой, вместо лица — череп */
      g.beginPath();g.moveTo(-4,-8);g.lineTo(-3,14);g.lineTo(3,14);g.lineTo(4,-8);g.closePath();mobPath(g,'#6a7a6a',0,3,9);
      g.fillStyle='#4a5a4a';g.fillRect(-3,8,6,1.4);g.fillRect(-3,2,6,1.2);
      g.strokeStyle='#2a3a1a';g.lineWidth=1.2;g.beginPath();for(let y=-8;y<=14;y+=2){const x=Math.sin(y*0.5+t)*4.4;y===-8?g.moveTo(x,y):g.lineTo(x,y);}g.stroke();
      for(const [x,y] of [[-3,-4],[3,4],[-2,10]]){g.fillStyle='#8a1a3a';g.beginPath();g.arc(x,y,1.8,0,TAU);g.fill();}
      g.strokeStyle='#6a7a6a';g.lineWidth=1.6;g.lineCap='round';g.beginPath();g.moveTo(3,-5);g.lineTo(7,0);g.moveTo(-3,-5);g.lineTo(-6,2);g.moveTo(-1,14);g.lineTo(-2,20);g.moveTo(1.4,14);g.lineTo(1.6,20);g.stroke();
      g.fillStyle='#d8d0bc';g.beginPath();g.arc(1,-12,4,0,TAU);g.fill();g.fillRect(-0.6,-9.6,3.4,2.6);
      g.fillStyle='#120808';g.beginPath();g.ellipse(-0.4,-12.4,1.2,1.4,0,0,TAU);g.ellipse(2.8,-12.4,1.2,1.4,0,0,TAU);g.fill();
      g.strokeStyle='#120808';g.lineWidth=0.4;for(let i=0;i<4;i++){g.beginPath();g.moveTo(-0.2+i*0.9,-9.4);g.lineTo(-0.2+i*0.9,-7.2);g.stroke();}
      g.fillStyle='#8a1a3a';g.beginPath();g.arc(-2,-16,2,0,TAU);g.fill();
    }
    g.restore();
  },
  lmirror(g,m,FY,t,T,st,k){
    const walk=Math.abs(m.vx)>6,dash=st==='dash',wu=st==='windup'?k:0;
    const sv=['#f4fbff','#b8ccdc','#6a8aa8'];
    /* серебряный силуэт шахтёра: каска, кирка, фонарь */
    for(const [ox,o,far] of [[-2.4,Math.PI,1],[2.4,0,0]]){const s=walk?lmStep(m,o,3):[0,0];g.fillStyle=far?sv[2]:sv[1];g.fillRect(ox-1.8+s[0]*0.5,FY-11,3.6,11+s[1]);}
    g.beginPath();g.moveTo(-5,FY-11);g.lineTo(-5.4,FY-24);g.quadraticCurveTo(0,FY-26,5.4,FY-24);g.lineTo(5,FY-11);g.closePath();mobPath(g,sv[1],0,FY-17,8);
    if(T){g.fillStyle='#0a1418';g.beginPath();g.moveTo(-2,FY-24);g.lineTo(2,FY-24);g.lineTo(1,FY-12);g.lineTo(-3,FY-14);g.closePath();g.fill();
      g.strokeStyle='#e8f8ff';g.lineWidth=0.6;g.beginPath();g.moveTo(-4,FY-22);g.lineTo(-1,FY-18);g.lineTo(-3,FY-13);g.moveTo(4,FY-23);g.lineTo(2,FY-17);g.stroke();}
    /* кирка */
    g.save();g.translate(4,FY-19);g.rotate(dash?-0.6:-1.2+wu*0.8+Math.sin(t*2)*0.05);g.strokeStyle=sv[2];g.lineWidth=1.6;g.beginPath();g.moveTo(0,0);g.lineTo(0,-12);g.stroke();
    g.fillStyle=sv[0];g.beginPath();g.moveTo(-6,-11);g.quadraticCurveTo(0,-15,6,-11);g.lineTo(5,-10);g.quadraticCurveTo(0,-13,-5,-10);g.closePath();g.fill();g.restore();
    /* голова в каске */
    g.beginPath();g.arc(0.4,FY-29,4.4,0,TAU);mobPath(g,sv[0],0.4,FY-29,4.4);
    g.beginPath();g.ellipse(0.4,FY-31.4,5.4,3.6,0,Math.PI,TAU);mobPath(g,sv[1],0.4,FY-32,5);g.fillStyle=sv[0];g.fillRect(-5,FY-31.6,10.8,1.2);
    g.fillStyle='#fff';g.beginPath();g.arc(3.6,FY-33,1.2,0,TAU);g.fill();
    if(!T){g.fillStyle='rgba(90,120,150,.6)';g.beginPath();g.arc(2.4,FY-29,0.7,0,TAU);g.fill();}
    else{g.fillStyle='#0a1418';g.beginPath();g.moveTo(-3,FY-29);g.lineTo(4.6,FY-29);g.lineTo(3.8,FY-26);g.lineTo(-2.4,FY-26.6);g.closePath();g.fill();
      lmTeeth(g,-2.6,FY-29,4.4,6,1.4,'#e8f8ff');lmTeeth(g,-2,FY-26.4,3.8,5,1.2,'#e8f8ff',false);
      lmRim(g,(g)=>{softGlow(g,-0.6,FY-31,5,'#7affff',0.9);softGlow(g,2.6,FY-31,5,'#7affff',0.9);});
      g.fillStyle='#bfffff';g.beginPath();g.ellipse(-0.6,FY-31,1.2,0.8,0,0,TAU);g.ellipse(2.6,FY-31,1.2,0.8,0,0,TAU);g.fill();}
    /* блики зеркала */
    g.fillStyle='rgba(255,255,255,.45)';g.beginPath();g.moveTo(-4,FY-23);g.lineTo(-2,FY-23);g.lineTo(-4,FY-14);g.closePath();g.fill();
    lmRim(g,(g)=>{softGlow(g,0,FY-20,14,T?'#7affff':'#d8f4ff',0.35);});
  },
  lswan(g,m,FY,t,T,st,k){
    const fl=Math.sin(t*6+m.phase),wu=st==='neckw'?k:0,ext=(m.ext||0)>0.01,gu=st==='gustw'?k:0;
    const wc=['#ffffff','#e8eef4','#b8c4d0'];
    /* дальнее крыло */
    g.save();g.translate(-2,-2);g.rotate(-0.3-fl*0.25-gu*0.6);g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(-10,-16,-20,-8);g.quadraticCurveTo(-14,-2,-4,4);g.closePath();mobPath(g,wc[2],-8,-4,10,true);g.restore();
    /* тело */
    g.beginPath();g.moveTo(-16,0);g.quadraticCurveTo(-14,-9,0,-8);g.quadraticCurveTo(10,-8,12,-2);g.quadraticCurveTo(8,6,-4,6);g.quadraticCurveTo(-14,5,-16,0);g.closePath();mobPath(g,wc[1],-2,-1,14);
    g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.ellipse(-4,-5,7,1.6,-0.1,0,TAU);g.fill();
    /* шея (короткая, пока не бьёт) */
    if(!ext){
      const back=wu*6;g.save();g.translate(9,-6);
      g.strokeStyle=T?'#e0b0b0':wc[0];g.lineWidth=4.4;g.lineCap='round';g.beginPath();g.moveTo(0,0);g.bezierCurveTo(4-back,-6,-2-back,-12,3-back,-17);g.stroke();
      g.strokeStyle=T?'#a06a6a':wc[2];g.lineWidth=1;g.beginPath();g.moveTo(1.6,0);g.bezierCurveTo(5.6-back,-6,-0.4-back,-12,4.6-back,-17);g.stroke();
      g.save();g.translate(4-back,-18);
      if(!T){g.beginPath();g.ellipse(0,0,3.6,2.8,0.1,0,TAU);mobPath(g,wc[0],0,0,3.6);g.fillStyle='#ff9a3a';g.beginPath();g.moveTo(2.6,-1);g.lineTo(8,0.6);g.lineTo(2.6,1.6);g.closePath();g.fill();
        g.fillStyle='#1a1a20';g.beginPath();g.moveTo(1.6,-1.8);g.lineTo(3.6,-1);g.lineTo(2.6,1);g.closePath();g.fill();g.beginPath();g.arc(0.2,-0.8,0.7,0,TAU);g.fill();}
      else{g.beginPath();g.ellipse(0,0,4.4,3.6,0.1,0,TAU);mobPath(g,'#e0b0b0',0,0,4);g.fillStyle='#4a0a14';g.beginPath();g.moveTo(1.6,0);g.lineTo(8,-2.4);g.lineTo(8,2.4);g.closePath();g.fill();
        lmTeeth(g,2.4,-0.8,7.6,4,1.2);g.fillStyle='#ff2a3a';g.beginPath();g.arc(-0.6,-1.4,0.8,0,TAU);g.fill();}
      g.restore();g.restore();
    }else{g.fillStyle=T?'#e0b0b0':wc[0];g.beginPath();g.ellipse(10,-6,3,3.4,0,0,TAU);g.fill();}
    /* ближнее крыло */
    g.save();g.translate(-3,-4);g.rotate(-0.15-fl*0.2-gu*0.8);g.beginPath();g.moveTo(4,0);g.quadraticCurveTo(-6,-12,-18,-5);g.quadraticCurveTo(-12,0,-2,4);g.closePath();mobPath(g,wc[0],-6,-3,10);
    g.strokeStyle=wc[2];g.lineWidth=0.6;for(let i=0;i<4;i++){g.beginPath();g.moveTo(-3-i*3.4,-1-i*0.6);g.lineTo(-6-i*3.4,-5-i*0.8);g.stroke();}g.restore();
    /* лапы и вода под ним */
    g.strokeStyle='#3a3a40';g.lineWidth=1;g.beginPath();g.moveTo(-2,6);g.lineTo(-3,10);g.moveTo(2,6);g.lineTo(2,10);g.stroke();
  },
  lfrog(g,m,FY,t,T,st,k){
    const puff=st==='puff'?k:0,air=!m.onGround,str=air?clamp(-m.vy/400,-0.4,0.4):0,br=Math.sin(t*2+m.phase)*0.03;
    g.save();g.translate(0,FY);g.scale(1+br-str*0.12,1-br+str*0.2);g.translate(0,-FY);
    const c=T?'#5a6a3a':'#8ac8a8';
    /* задние лапы */
    g.beginPath();g.ellipse(-8,FY-4,7,4.4,-0.3-(air?0.6:0),0,TAU);mobPath(g,shadeHex(c,-0.15),-8,FY-4,7);
    g.strokeStyle=shadeHex(c,-0.2);g.lineWidth=2;g.lineCap='round';g.beginPath();g.moveTo(-4,FY-1);g.lineTo(air?-14:-2,air?FY+3:FY);g.stroke();
    /* тело */
    g.beginPath();g.ellipse(0,FY-9,T?14:12,T?10:9,0,0,TAU);mobPath(g,c,0,FY-9,12);
    g.fillStyle=T?'#c8b878':'#e8f8e0';g.beginPath();g.ellipse(4,FY-5,7,4.6,0,0,TAU);g.fill();
    if(T){g.fillStyle='rgba(40,50,20,.55)';for(const [x,y,r] of [[-6,-14,1.6],[-1,-16,1.2],[-9,-8,1.4],[3,-14,1],[-4,-10,1]]){g.beginPath();g.arc(x,FY+y,r,0,TAU);g.fill();}}
    /* щёки-пузырь на замахе */
    if(puff>0){const r=3+puff*7,cl=T?'#c8b478':'#dcf6e4';
      g.fillStyle=shadeHex(cl,-0.35);g.beginPath();g.ellipse(9,FY-5+r*0.25,r*1.05,r*0.85,0,0,TAU);g.fill();
      g.fillStyle=hexA(cl,0.92);g.beginPath();g.ellipse(9,FY-5+r*0.2,r,r*0.78,0,0,TAU);g.fill();
      g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.ellipse(9-r*0.35,FY-5-r*0.15,r*0.32,r*0.18,-0.5,0,TAU);g.fill();
      if(T){g.strokeStyle='rgba(120,30,30,.5)';g.lineWidth=0.7;for(let q=0;q<3;q++){g.beginPath();g.moveTo(9-r*0.5+q*r*0.4,FY-5);g.quadraticCurveTo(9+q*2-r*0.3,FY-5+r*0.4,9-r*0.2+q*r*0.4,FY-5+r*0.7);g.stroke();}}}
    /* передние лапы */
    g.strokeStyle=shadeHex(c,-0.1);g.lineWidth=2;g.beginPath();g.moveTo(6,FY-4);g.lineTo(8,FY);g.stroke();
    /* глаза */
    if(!T){mobBlob(g,1,FY-17,3.4,3,c);mobBlob(g,7,FY-17,3.4,3,c);mobEye(g,m,1.6,FY-17.4,1.8,{iris:'#1a2a1a',ir:0.7});mobEye(g,m,7.6,FY-17.4,1.8,{iris:'#1a2a1a',ir:0.7});
      g.strokeStyle='#2a4a3a';g.lineWidth=0.8;g.beginPath();g.arc(8,FY-11,4,0.3,Math.PI*0.7);g.stroke();
      /* корона */
      g.fillStyle='#e0b050';g.beginPath();g.moveTo(-1,FY-19);g.lineTo(-1,FY-23);g.lineTo(1,FY-21);g.lineTo(3,FY-24);g.lineTo(5,FY-21);g.lineTo(7,FY-23);g.lineTo(7,FY-19);g.closePath();g.fill();
      g.fillStyle='#9ad8ff';g.beginPath();g.arc(3,FY-20.6,0.9,0,TAU);g.fill();}
    else{for(const x of [1,7.6]){g.fillStyle='#f0e8d8';g.beginPath();g.ellipse(x,FY-17,3,3.4,0,0,TAU);g.fill();g.fillStyle='#5a7a3a';g.beginPath();g.arc(x+(m.lookX||0)*0.8,FY-17,1.8,0,TAU);g.fill();g.fillStyle='#120a04';g.beginPath();g.arc(x+(m.lookX||0)*0.8,FY-17,0.9,0,TAU);g.fill();}
      g.strokeStyle='#2a3a10';g.lineWidth=1;g.beginPath();g.moveTo(1,FY-11);g.quadraticCurveTo(7,FY-8,13,FY-11);g.stroke();}
    g.restore();
  },
  lsheep(g,m,FY,t,T,st,k){
    const air=!m.onGround,leg=T?7:3.6;
    /* ноги: в Истине — длинные и тонкие */
    for(const [x,far] of [[-7,1],[-3,0],[5,1],[8,0]]){g.strokeStyle=far?(T?'#6a5a5a':'#3a2a3a'):(T?'#8a7a7a':'#4a3a4a');g.lineWidth=T?1.2:2.2;g.lineCap='round';
      const kx=air?(x<0?-2:2):0;g.beginPath();g.moveTo(x,FY-leg-4);g.lineTo(x+kx,FY-(air?leg*0.5:0));g.stroke();}
    const by=FY-leg-8+(air?-1:0);
    /* шерсть-облако */
    const wool=T?'#d8ccc4':'#f8f4fc';
    for(const [x,y,r] of [[-9,0,5.4],[-3,-3,6.4],[4,-2,6],[8,1,4.6],[-6,3,5],[2,3,5.4]])mobBlob(g,x,by+y,r,r*0.92,wool,0,true);
    g.strokeStyle=T?'rgba(80,60,60,.5)':'rgba(180,170,200,.5)';g.lineWidth=0.6;for(let i=0;i<8;i++){g.beginPath();g.arc(-9+i*2.6,by-1+Math.sin(i*1.7)*3,1.4,0,Math.PI*1.4);g.stroke();}
    if(T){/* в шерсти — глаза */
      for(const [x,y] of [[-8,-2],[-3,-5],[2,-4],[6,0],[-5,2],[1,2],[-1,-1]]){const bl=Math.sin(t*3+x*2+y)>0.9?0.2:1;g.fillStyle='#f4ece4';g.beginPath();g.ellipse(x,by+y,1.6,1.1*bl,0,0,TAU);g.fill();
        if(bl>0.5){g.fillStyle='#3a1a1a';g.beginPath();g.arc(x+(m.lookX||0)*0.5,by+y,0.6,0,TAU);g.fill();}}}
    /* голова */
    g.save();g.translate(11,by-2);
    g.beginPath();g.ellipse(0,0,4,3.4,0.2,0,TAU);mobPath(g,T?'#8a7a74':'#4a3a4a',0,0,4);
    g.fillStyle=T?'#8a7a74':'#4a3a4a';g.beginPath();g.ellipse(-2.4,-2.6,2,1,-0.6,0,TAU);g.fill();
    if(!T){g.strokeStyle='#f4eefa';g.lineWidth=0.7;g.beginPath();g.arc(1,-0.6,1,3.4,6);g.stroke();g.fillStyle='rgba(255,150,180,.6)';g.beginPath();g.arc(2,1.2,0.8,0,TAU);g.fill();}
    else{g.fillStyle='#f4ece4';g.beginPath();g.arc(1,-0.6,1.3,0,TAU);g.fill();g.fillStyle='#2a0a0a';g.beginPath();g.arc(1.3,-0.6,0.6,0,TAU);g.fill();}
    mobBlob(g,-2,-3.4,2.6,2,wool,0,true);
    g.restore();
  },
  lsandman(g,m,FY,t,T,st,k){
    const thr=st==='throw'?k:0,bob=Math.sin(t*1.8+m.phase)*1.5;
    g.save();g.translate(0,bob);
    if(!T){
      /* сонный старичок в колпаке, в мантии со звёздами */
      g.beginPath();g.moveTo(-7,14);g.quadraticCurveTo(-8,0,-4,-8);g.lineTo(5,-8);g.quadraticCurveTo(8,0,8,14);g.quadraticCurveTo(0,17,-7,14);g.closePath();mobPath(g,'#9a8ad8',0,3,12);
      g.fillStyle='#ffe890';for(const [x,y] of [[-3,2],[3,7],[0,11],[4,-2]]){g.beginPath();for(let i=0;i<10;i++){const a=i/10*TAU-Math.PI/2,r=i%2?0.6:1.4;g.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);}g.closePath();g.fill();}
      g.beginPath();g.arc(1,-12,5,0,TAU);mobPath(g,'#ffe0c8',1,-12,5);
      g.fillStyle='#f4f4f4';g.beginPath();g.moveTo(-3,-10);g.quadraticCurveTo(1,2,6,-10);g.quadraticCurveTo(1,-7,-3,-10);g.fill();
      g.strokeStyle='#5a3a2a';g.lineWidth=0.7;g.beginPath();g.arc(0.6,-13,1,0.3,Math.PI-0.3);g.arc(3.6,-13,1,0.3,Math.PI-0.3);g.stroke();
      g.fillStyle='rgba(255,150,150,.5)';g.beginPath();g.arc(4.4,-11,1,0,TAU);g.fill();
      /* колпак */
      g.beginPath();g.moveTo(-4,-15);g.quadraticCurveTo(0,-20,6,-15);g.quadraticCurveTo(-2,-22,-10,-14+Math.sin(t*2)*1.4);g.quadraticCurveTo(-6,-15,-4,-15);g.closePath();mobPath(g,'#c8c0f0',0,-17,7);
      g.strokeStyle='#8a80c8';g.lineWidth=1;for(let i=0;i<3;i++){g.beginPath();g.moveTo(-2-i*2.6,-17+i*0.3);g.lineTo(-1-i*2.6,-15.4+i*0.3);g.stroke();}
      g.fillStyle='#fff';g.beginPath();g.arc(-10,-14+Math.sin(t*2)*1.4,1.8,0,TAU);g.fill();
    }else{
      /* Истина: высокая худая фигура, из пустых глаз сыплется песок */
      g.fillStyle='#6a6070';g.beginPath();g.moveTo(-6,16);g.lineTo(-4,-6);g.lineTo(4,-6);g.lineTo(7,16);g.lineTo(3,13);g.lineTo(0,17);g.lineTo(-3,13);g.closePath();g.fill();
      g.strokeStyle='#3a3040';g.lineWidth=0.6;for(let i=0;i<4;i++){g.beginPath();g.moveTo(-3+i*2,-4);g.lineTo(-4+i*3,15);g.stroke();}
      g.beginPath();g.ellipse(1,-13,4,5.6,0,0,TAU);mobPath(g,'#d8d0c0',1,-13,5);
      g.fillStyle='#0a0606';g.beginPath();g.ellipse(-0.6,-13.6,1.2,1.8,0,0,TAU);g.ellipse(3,-13.6,1.2,1.8,0,0,TAU);g.fill();g.beginPath();g.ellipse(1.2,-9.6,1.4,2.2,0,0,TAU);g.fill();
      g.fillStyle='rgba(232,216,160,.85)';for(let i=0;i<6;i++){const y=-12+((t*14+i*2.4)%14);g.fillRect(-0.9+Math.sin(i)*0.3,y,0.8,0.8);g.fillRect(2.7+Math.cos(i)*0.3,y+1,0.8,0.8);}
    }
    /* рука с горстью песка и мешок */
    g.strokeStyle=T?'#d8d0c0':'#9a8ad8';g.lineWidth=2;g.lineCap='round';g.beginPath();g.moveTo(4,-4);g.lineTo(9+thr*3,-2-thr*6);g.stroke();
    if(thr>0.2){mobGlow(g,10+thr*3,-3-thr*6,6,'#f4e6b0',0.6*thr);g.fillStyle='#f4e6b0';for(let i=0;i<4;i++)g.fillRect(9+thr*3+Math.sin(t*20+i)*1.4,-4-thr*6+Math.cos(t*16+i)*1.4,0.9,0.9);}
    g.beginPath();g.ellipse(-7,6,4,5,0.2,0,TAU);mobPath(g,T?'#7a6a5a':'#c8a878',-7,6,5);g.strokeStyle=T?'#4a3a2a':'#8a6a40';g.lineWidth=0.8;g.beginPath();g.moveTo(-9,1.6);g.lineTo(-5,1.4);g.stroke();
    if(!T&&Math.random()<0.1)spawnPart(m.x-m.facing*6,m.y+4,rnd(-6,6),20,1,'#f4e6b0',1.4,40);
    g.restore();
  },
  lnightmare(g,m,FY,t,T,st,k){
    const truth=veilT>0.45,roar=st==='roar'?k:0,ch=st==='charge';
    if(!truth){
      /* Иллюзия: еле видная дрожь воздуха с двумя огоньками */
      g.globalAlpha*=0.6;g.fillStyle='rgba(220,210,255,.25)';g.beginPath();g.moveTo(-8,8);g.quadraticCurveTo(-10,-8,0,-12);g.quadraticCurveTo(10,-8,8,8);g.quadraticCurveTo(4,4,2,10);g.quadraticCurveTo(-2,4,-8,8);g.fill();
      g.fillStyle='rgba(255,255,255,.8)';g.beginPath();g.ellipse(-2,-4,1,1.6,0,0,TAU);g.ellipse(3,-4,1,1.6,0,0,TAU);g.fill();return;}
    /* Истина: тень-зверь, сгорбленный, с множеством глаз и когтями */
    g.save();g.translate(0,ch?-2:0);g.rotate(ch?0.1:roar*-0.08);
    const sw=Math.sin(t*3+m.phase);
    for(const [hx,fx,far] of [[-8,-14,1],[6,10+roar*3,1],[-6,-11,0],[8,14+roar*4,0]]){lmLeg(g,hx,2,fx+(ch?6:0),FY-1,7,8,hx<0,far?3:3.6,far?'#0a0612':'#1a1028','#e8dcc8');}
    g.beginPath();g.moveTo(-16,4);g.quadraticCurveTo(-18,-12,-4,-15);g.quadraticCurveTo(10,-17,14,-6);g.quadraticCurveTo(15,4,6,7);g.quadraticCurveTo(-8,9,-16,4);g.closePath();mobPath(g,'#1a1028',0,-4,16);
    /* дымные клочья */
    g.fillStyle='rgba(20,10,30,.7)';for(let i=0;i<5;i++){const a=t*2+i*1.3;g.beginPath();g.arc(-12+i*5+Math.sin(a)*2,-14-Math.abs(Math.cos(a))*4,2.6,0,TAU);g.fill();}
    /* глаза по всему телу */
    for(const [x,y,r] of [[-10,-6,1.4],[-5,-10,1.6],[0,-12,1.3],[-3,-4,1.2],[5,-8,1.4],[-8,0,1.1],[2,-2,1]]){const bl=Math.sin(t*2.4+x+y)>0.94?0.2:1;
      lmRim(g,(g)=>{softGlow(g,x,y,r*3,'#ffb030',0.6*bl);});g.fillStyle='#ffc040';g.beginPath();g.ellipse(x,y,r,r*0.8*bl,0,0,TAU);g.fill();if(bl>0.5){g.fillStyle='#2a0a00';g.beginPath();g.ellipse(x+(m.lookX||0)*0.4,y,r*0.3,r*0.7,0,0,TAU);g.fill();}}
    /* голова и пасть */
    g.save();g.translate(14,-6+roar*-2);
    g.beginPath();g.ellipse(0,0,7,6,0.1,0,TAU);mobPath(g,'#140a20',0,0,7);
    g.fillStyle='#3a0a10';g.beginPath();g.moveTo(-1,1);g.quadraticCurveTo(6,2+roar*6,10,1);g.quadraticCurveTo(6,6+roar*6,-1,4+roar*3);g.closePath();g.fill();
    lmTeeth(g,0,1.4,9.6,6,1.8,'#f4ead6');lmTeeth(g,0,4+roar*3,8.4,5,1.6,'#f4ead6',false);
    for(const [x,y] of [[1,-3],[4.4,-3.6]]){lmRim(g,(g)=>{softGlow(g,x,y,5,'#ffb030',0.8);});g.fillStyle='#ffd060';g.beginPath();g.ellipse(x,y,1.4,1,0,0,TAU);g.fill();}
    g.restore();
    g.restore();
    if(roar>0)mobGlow(g,14,-6,12+roar*14,'#ff3a2a',0.5*roar);
  }
};
