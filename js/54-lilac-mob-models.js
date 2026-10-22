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

/* кэш кадров: модели Лиловых небес подробные и дорогие, поэтому модель с обводкой перерисовывается
   LMC.fps раз в секунду (вразнобой) в свой холст моба (m._lc), а в остальных кадрах кладётся готовая картинка —
   место на экране считается каждый кадр, движение остаётся плавным. Свечения (OL.defer) — каждый кадр.
   Без кэша: удар (вспышка), смерть, появление. */
const LMC={m:null,hurt:0,fps:15,ft:-1,n:0};
function lmOutline(g,cx,cy,rx,ry,col,th,fn){
  const m=LMC.m,hu=LMC.hurt;LMC.m=null;LMC.hurt=0;
  if(!m||hu>0||m.deathK!==undefined||(m.age!==undefined&&m.age<0.35)||OL.active||!g.getTransform)return withOutline(g,cx,cy,rx,ry,col,th,fn);
  const M=g.getTransform(),sc=Math.max(Math.hypot(M.a,M.b),Math.hypot(M.c,M.d))||1,tol=0.06*sc;
  const dx=M.c*cy+M.e,dy=M.d*cy+M.f;                 /* середина моба на экране */
  const pd=Math.abs(th)*sc+5,W=2*Math.ceil(Math.abs(M.a)*rx+Math.abs(M.c)*ry+pd),H=2*Math.ceil(Math.abs(M.b)*rx+Math.abs(M.d)*ry+pd);
  let c=m._lc;
  const fits=c&&c.W>=W&&c.H>=H&&c.W*c.H<=W*H*1.5+64;
  const same=fits&&c.tf===m.tf&&c.st===m.state&&G.time>=c.t&&
    Math.sign(c.a)===Math.sign(M.a)&&Math.abs(c.a-M.a)<=tol&&Math.abs(c.b-M.b)<=tol&&Math.abs(c.d-M.d)<=tol;
  /* устаревшую картинку обновляем не больше одной за кадр (кроме сильно устаревших) — без рывков от многих мобов */
  if(LMC.ft!==G.time){LMC.ft=G.time;LMC.n=0;}
  const age=same?G.time-c.t:1e9,fresh=same&&(age<1/LMC.fps||(LMC.n>=1&&age<0.25));
  if(!fresh)LMC.n++;
  if(!fresh){
    if(!fits){const cv=document.createElement('canvas');cv.width=W;cv.height=H;c=m._lc={cv,g:cv.getContext('2d'),W,H,fx:[]};}
    const C=c.g;
    C.setTransform(1,0,0,1,0,0);C.globalAlpha=1;C.globalCompositeOperation='source-over';C.clearRect(0,0,c.W,c.H);
    C.setTransform(M.a,M.b,M.c,M.d,c.W/2+dx-Math.round(dx)-M.c*cy,c.H/2+dy-Math.round(dy)-M.d*cy);
    c.fx.length=0;OL.grab=c.fx;try{withOutline(C,cx,cy,rx,ry,col,th,fn);}finally{OL.grab=null;}
    c.t=G.time-Math.random()*0.4/LMC.fps;c.tf=m.tf;c.st=m.state;c.a=M.a;c.b=M.b;c.d=M.d;   /* разброс: мобы не перерисовываются в одном кадре */
  }else OL.shade=null;
  const ox=Math.round(dx)-c.W/2,oy=Math.round(dy)-c.H/2,ga=g.globalAlpha;   /* картинка из кэша ложится с точностью до полпикселя */
  g.save();g.setTransform(1,0,0,1,0,0);g.drawImage(c.cv,ox,oy);
  for(const q of c.fx){g.setTransform(q.m.a,q.m.b,q.m.c,q.m.d,q.m.e+q.x0+ox,q.m.f+q.y0+oy);g.globalAlpha=ga*q.a;g.globalCompositeOperation='lighter';try{q.fn(g);}catch(e){}}
  g.restore();
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
};
