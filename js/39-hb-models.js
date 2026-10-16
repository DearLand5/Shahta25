'use strict';
/* ============================================================
   ВЛАДЫКИ ПРЕИСПОДНЕЙ: модели боссов (по концептам из concepts/).
   Рамка высотой 100 (ноги в 0, верх в -100), вид 3/4, лицом вправо;
   масштаб и разворот задаёт hbDrawMob.
   Позы плавно перетекают (hbPose), длинные части — «живые» верёвки
   с инерцией (hbRope): плащ, хвост, щупальца, цепи.
   HB_PRE / HB_POST — части в мировых координатах (цепи, язык, руки, кисти).
   ============================================================ */
const HB_MODEL={},HB_PRE={},HB_POST={};
function hbPoly(g,pts){g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.closePath();}
function hbLin(g,x0,y0,x1,y1,st){const gr=g.createLinearGradient(x0,y0,x1,y1);for(const [o,c] of st)gr.addColorStop(o,c);return gr;}
/* заливка с объёмом: свет сверху-слева, тень снизу-справа */
function hbVol(g,x,y,r,c){return mobG(g,x,y,r,c);}
/* сужающаяся конечность со скруглёнными суставами */
function hbLimb(g,x1,y1,x2,y2,w1,w2,col,line){
  const a=Math.atan2(y2-y1,x2-x1),nx=-Math.sin(a),ny=Math.cos(a);
  g.beginPath();g.moveTo(x1+nx*w1,y1+ny*w1);g.lineTo(x2+nx*w2,y2+ny*w2);g.lineTo(x2-nx*w2,y2-ny*w2);g.lineTo(x1-nx*w1,y1-ny*w1);g.closePath();
  g.fillStyle=col;g.fill();if(line){g.strokeStyle=line;g.lineWidth=0.8;g.stroke();}
  g.beginPath();g.arc(x1,y1,w1,0,TAU);g.arc(x2,y2,w2,0,TAU);g.fill();
}
/* мускулистая конечность: «веретено» с утолщением посередине и бликом */
function hbMuscle(g,x1,y1,x2,y2,w1,wm,w2,col,hi){
  const a=Math.atan2(y2-y1,x2-x1),nx=-Math.sin(a),ny=Math.cos(a),mx=(x1+x2)/2,my=(y1+y2)/2;
  g.beginPath();g.moveTo(x1+nx*w1,y1+ny*w1);g.quadraticCurveTo(mx+nx*wm*1.25,my+ny*wm*1.25,x2+nx*w2,y2+ny*w2);
  g.lineTo(x2-nx*w2,y2-ny*w2);g.quadraticCurveTo(mx-nx*wm*1.1,my-ny*wm*1.1,x1-nx*w1,y1-ny*w1);g.closePath();
  g.fillStyle=col;g.fill();
  if(hi){g.strokeStyle=hi;g.lineWidth=wm*0.28;g.lineCap='round';g.beginPath();g.moveTo(x1-nx*w1*0.5,y1-ny*w1*0.5);g.quadraticCurveTo(mx-nx*wm*0.7,my-ny*wm*0.7,x2-nx*w2*0.4,y2-ny*w2*0.4);g.stroke();}
  g.fillStyle=col;g.beginPath();g.arc(x1,y1,w1,0,TAU);g.arc(x2,y2,w2,0,TAU);g.fill();
}
function hbIK(x1,y1,x2,y2,l1,l2,bend){
  const dx=x2-x1,dy=y2-y1,d=Math.min(l1+l2-0.01,Math.max(0.01,Math.hypot(dx,dy))),a=Math.atan2(dy,dx);
  const c=Math.acos(clamp((l1*l1+d*d-l2*l2)/(2*l1*d),-1,1)),ka=a+bend*c;
  return [x1+Math.cos(ka)*l1,y1+Math.sin(ka)*l1,x1+Math.cos(a)*d,y1+Math.sin(a)*d];
}
function hbFlame(g,x,y,w,h,t,seed,c1,c2){
  const f=Math.sin(t*11+seed*3.1)*0.18+Math.sin(t*7.3+seed)*0.12;
  g.fillStyle=c1;g.beginPath();g.moveTo(x-w,y);g.quadraticCurveTo(x-w*0.9,y-h*0.6,x+f*w*2,y-h*(1+f*0.3));g.quadraticCurveTo(x+w*0.9,y-h*0.55,x+w,y);g.closePath();g.fill();
  if(c2){g.fillStyle=c2;g.beginPath();g.moveTo(x-w*0.5,y);g.quadraticCurveTo(x-w*0.4,y-h*0.4,x+f*w,y-h*0.62);g.quadraticCurveTo(x+w*0.45,y-h*0.35,x+w*0.5,y);g.closePath();g.fill();}
}
function hbHorn(g,pts,w0,c1,c2){
  const n=pts.length,L=[],R=[];
  for(let i=0;i<n;i++){const a=pts[Math.min(n-1,i+1)],b=pts[Math.max(0,i-1)],ang=Math.atan2(a[1]-b[1],a[0]-b[0]),w=w0*(1-i/(n-1))*0.95+0.15;
    L.push([pts[i][0]-Math.sin(ang)*w,pts[i][1]+Math.cos(ang)*w]);R.push([pts[i][0]+Math.sin(ang)*w,pts[i][1]-Math.cos(ang)*w]);}
  g.beginPath();g.moveTo(L[0][0],L[0][1]);for(let i=1;i<n;i++)g.lineTo(L[i][0],L[i][1]);for(let i=n-1;i>=0;i--)g.lineTo(R[i][0],R[i][1]);g.closePath();
  g.fillStyle=hbLin(g,pts[0][0],pts[0][1],pts[n-1][0],pts[n-1][1],[[0,c2],[0.55,c1],[1,shadeHex(c1,0.25)]]);g.fill();
  g.strokeStyle=shadeHex(c2,-0.4);g.lineWidth=0.5;g.stroke();
  g.strokeStyle=hexA(shadeHex(c2,-0.3),0.7);g.lineWidth=0.45;g.beginPath();for(let i=1;i<n-2;i++){g.moveTo(L[i][0],L[i][1]);g.lineTo(R[i][0],R[i][1]);}g.stroke();
}
function hbEye(g,m,x,y,r,iris,glow,o){
  o=o||{};const bl=(Math.sin(m.anim*0.9+x*0.7+m.phase*5)>0.985)?0.1:1;
  const lx=(m.lookX||0)*(m.facing||1),ly=m.lookY||0;
  if(glow)mobGlow(g,x,y,r*2.8,glow,0.5);
  g.fillStyle=o.white||'#f2e6c8';g.beginPath();g.ellipse(x,y,r,r*bl,0,0,TAU);g.fill();
  if(bl>0.5){const ix=x+lx*r*0.35,iy=y+ly*r*0.3;g.fillStyle=iris;g.beginPath();g.arc(ix,iy,r*0.62,0,TAU);g.fill();
    g.fillStyle='#0a0406';if(o.slit==='h'){g.beginPath();g.ellipse(ix,iy,r*0.5,r*0.14,0,0,TAU);g.fill();}else{g.beginPath();g.ellipse(ix,iy,r*0.2,r*0.5,0,0,TAU);g.fill();}
    g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.arc(ix-r*0.25,iy-r*0.28,r*0.2,0,TAU);g.fill();}
  g.strokeStyle='rgba(20,8,10,.7)';g.lineWidth=Math.max(0.6,r*0.2);g.beginPath();g.ellipse(x,y,r,r*bl,0,0,TAU);g.stroke();
}

/* ---------- плавные позы и «живые» верёвки ---------- */
function hbPose(m,tgt,k){
  const P=m.ps||(m.ps={}),dt=m._dt||0.016,a=1-Math.exp(-(k||9)*dt);
  for(const key in tgt){const v=tgt[key];if(P[key]===undefined||!isFinite(P[key]))P[key]=v;else P[key]+=(v-P[key])*a;}
  return P;
}
/* верёвка из n точек, прикреплённая к точке модели (lx,ly); считается в мире, отдаётся в координатах модели */
function hbRope(m,key,lx,ly,n,seg,U,o){
  o=o||{};const f=m.facing||1,R=m.ropes||(m.ropes={});
  const ax=m.x+lx*U*f,ay=m.y+ly*U,sg=seg*U;
  let r=R[key];
  if(!r||r.length!==n||Math.abs(r[0].x-ax)>sg*n*3||Math.abs(r[0].y-ay)>sg*n*3){r=R[key]=[];for(let i=0;i<n;i++){const x=ax+(o.sx||0)*i*sg*f,y=ay+(o.sy===undefined?1:o.sy)*i*sg;r.push({x,y,px:x,py:y});}}
  const dt=Math.min(0.04,m._dt||0.016),gv=(o.grav===undefined?900:o.grav)*U,damp=o.damp||0.9;
  r[0].x=ax;r[0].y=ay;r[0].px=ax;r[0].py=ay;
  for(let i=1;i<n;i++){const p=r[i],vx=(p.x-p.px)*damp,vy=(p.y-p.py)*damp;p.px=p.x;p.py=p.y;p.x+=vx;p.y+=vy+gv*dt*dt;
    if(o.curl){p.x+=Math.sin(G.time*o.curl+i*0.9+(o.seed||0))*o.amp*U*dt*f;}}
  for(let it=0;it<3;it++)for(let i=1;i<n;i++){const a=r[i-1],b=r[i],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||0.001,k=(d-sg)/d;
    if(i===1){b.x-=dx*k;b.y-=dy*k;}else{a.x+=dx*k*0.5;a.y+=dy*k*0.5;b.x-=dx*k*0.5;b.y-=dy*k*0.5;}}
  if(o.stiff){for(let i=1;i<n;i++){const tx=ax+(o.sx||0)*i*sg*f,ty=ay+(o.sy===undefined?1:o.sy)*i*sg;r[i].x+=(tx-r[i].x)*o.stiff;r[i].y+=(ty-r[i].y)*o.stiff;}}
  return r.map(p=>[(p.x-m.x)/(U*f),(p.y-m.y)/U]);
}
function hbCurve(g,pts){g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length-1;i++){const mx=(pts[i][0]+pts[i+1][0])/2,my=(pts[i][1]+pts[i+1][1])/2;g.quadraticCurveTo(pts[i][0],pts[i][1],mx,my);}const l=pts[pts.length-1];g.lineTo(l[0],l[1]);}
/* щупальце/хвост по точкам с сужением */
function hbTube(g,pts,w0,w1,col,hi){
  const n=pts.length,L=[],R=[];
  for(let i=0;i<n;i++){const a=pts[Math.min(n-1,i+1)],b=pts[Math.max(0,i-1)],an=Math.atan2(a[1]-b[1],a[0]-b[0]),w=lerp(w0,w1,i/(n-1));
    L.push([pts[i][0]-Math.sin(an)*w,pts[i][1]+Math.cos(an)*w]);R.push([pts[i][0]+Math.sin(an)*w,pts[i][1]-Math.cos(an)*w]);}
  g.beginPath();hbCurve(g,L);const Rr=R.slice().reverse();for(const p of Rr)g.lineTo(p[0],p[1]);g.closePath();g.fillStyle=col;g.fill();
  if(hi){g.strokeStyle=hi;g.lineWidth=Math.max(0.6,w0*0.35);g.lineCap='round';g.beginPath();hbCurve(g,R.map((p,i)=>[lerp(p[0],pts[i][0],0.45),lerp(p[1],pts[i][1],0.45)]));g.stroke();}
}

/* ---------- крылья: растут из лопаток, перепонка крепится к боку до пояса ---------- */
const HB_WING_OPEN={R:[5,-72],E:[30,-94],W:[52,-104],F:[[82,-98],[88,-70],[76,-44],[48,-30]],M:[12,-40]};
const HB_WING_FOLD={R:[5,-72],E:[18,-92],W:[24,-106],F:[[32,-100],[34,-72],[29,-50],[21,-36]],M:[10,-42]};
function hbWingPts(side,open,flap,S){
  const A=HB_WING_OPEN,F=HB_WING_FOLD,mix=(a,b)=>[lerp(b[0],a[0],open),lerp(b[1],a[1],open)];
  const R=A.R,rot=(p)=>{const dx=p[0]-R[0],dy=p[1]-R[1],c=Math.cos(flap),s=Math.sin(flap);return [R[0]+(dx*c-dy*s)*S,R[1]+(dx*s+dy*c)*S];};
  const T=(p)=>{const q=rot(p);return [q[0]*side,q[1]];};
  return {R:T(R),E:T(mix(A.E,F.E)),W:T(mix(A.W,F.W)),F:A.F.map((p,i)=>T(mix(p,F.F[i]))),M:[mix(A.M,F.M)[0]*side,mix(A.M,F.M)[1]]};
}
function hbWing(g,side,open,flap,S,col,bone,o){
  o=o||{};const P=hbWingPts(side,open,flap,S),W=P.W,t=G.time;
  g.beginPath();g.moveTo(P.R[0],P.R[1]);g.lineTo(P.E[0],P.E[1]);g.lineTo(W[0],W[1]);g.lineTo(P.F[0][0],P.F[0][1]);
  const edge=P.F.slice(1).concat([P.M]);let prev=P.F[0];
  edge.forEach((q,i)=>{const mx=(prev[0]+q[0])/2,my=(prev[1]+q[1])/2,cx=lerp(mx,W[0],0.36),cy=lerp(my,W[1],0.36);
    if(o.torn&&i<3){const px=lerp(lerp(prev[0],cx,0.5),lerp(cx,q[0],0.5),0.5),py=lerp(lerp(prev[1],cy,0.5),lerp(cy,q[1],0.5),0.5),j=Math.sin(t*3+i)*0.8;
      g.quadraticCurveTo(lerp(prev[0],cx,0.7),lerp(prev[1],cy,0.7),px,py);g.lineTo(lerp(px,W[0],0.1)+j,lerp(py,W[1],0.1));g.lineTo(lerp(px,q[0],0.12),lerp(py,q[1],0.12));
      g.quadraticCurveTo(lerp(cx,q[0],0.4),lerp(cy,q[1],0.4),q[0],q[1]);}
    else g.quadraticCurveTo(cx,cy,q[0],q[1]);prev=q;});
  g.lineTo(P.R[0],P.R[1]);g.closePath();
  g.fillStyle=hbLin(g,W[0],W[1],P.M[0],P.M[1],[[0,shadeHex(col,0.22)],[0.5,col],[1,o.warm||shadeHex(col,-0.3)]]);g.fill();
  if(o.glowEdge){g.save();g.clip();g.strokeStyle=hexA(o.glowEdge,0.8);g.lineWidth=7*S;g.beginPath();prev=P.F[0];g.moveTo(prev[0],prev[1]);for(const q of edge){g.lineTo(q[0],q[1]);}g.stroke();g.restore();}
  g.strokeStyle=hexA(shadeHex(col,0.4),0.4);g.lineWidth=0.7*S;g.beginPath();
  for(let i=0;i<P.F.length-1;i++){const a=P.F[i],b=P.F[i+1];g.moveTo(W[0],W[1]);g.quadraticCurveTo(lerp(W[0],(a[0]+b[0])/2,0.55),lerp(W[1],(a[1]+b[1])/2,0.45),lerp(W[0],(a[0]+b[0])/2,0.85),lerp(W[1],(a[1]+b[1])/2,0.85));}
  g.stroke();
  g.strokeStyle=bone;g.lineCap='round';g.lineJoin='round';
  g.lineWidth=3.2*S;g.beginPath();g.moveTo(P.R[0],P.R[1]);g.lineTo(P.E[0],P.E[1]);g.lineTo(W[0],W[1]);g.stroke();
  g.lineWidth=1.5*S;g.beginPath();for(const f of P.F){g.moveTo(W[0],W[1]);g.quadraticCurveTo(lerp(W[0],f[0],0.5)+side*1.5,lerp(W[1],f[1],0.5)-2,f[0],f[1]);}g.stroke();
  g.fillStyle=bone;g.beginPath();g.arc(P.E[0],P.E[1],2.1*S,0,TAU);g.arc(W[0],W[1],2*S,0,TAU);g.fill();
  g.beginPath();g.moveTo(W[0]-side*1.5,W[1]);g.quadraticCurveTo(W[0]+side*1*S,W[1]-9*S,W[0]+side*5*S,W[1]-12*S);g.lineTo(W[0]+side*2,W[1]+1);g.closePath();g.fill();
  if(o.burn)for(const f of P.F.slice(0,3)){mobGlow(g,f[0],f[1],12*S,'#ff7a1a',0.55);hbFlame(g,f[0],f[1]+1,2*S,6*S,t,f[0],'#ff7a1a','#ffd060');}
}
/* костяная кисть Императора (мировые координаты) */
function hbBoneHand(g,x,y,s,flip,curl,t,glow){
  g.save();g.translate(x,y);g.scale(s*flip,s);
  olLight(g,(g)=>{softGlow(g,-6,0,24,'#7ac8ff',0.5+glow*0.4);});
  const bn='#ece4d0',bd='#8a806c';
  g.strokeStyle=bd;g.lineCap='round';g.lineWidth=3;g.beginPath();g.moveTo(-17,-2);g.lineTo(-8,-1.5);g.moveTo(-17,2.6);g.lineTo(-8,2.2);g.stroke();g.strokeStyle=bn;g.lineWidth=1.8;g.stroke();
  g.fillStyle=bn;for(const [cx,cy,r] of [[-7.5,-2.4,2.1],[-7.5,1.8,2.2],[-4.8,-0.3,2.4],[-5,3.6,1.8],[-4.8,-4,1.7]]){g.beginPath();g.arc(cx,cy,r,0,TAU);g.fill();}
  for(let k=0;k<4;k++){const c=curl+(k-1.5)*0.05;g.save();g.translate(-3,(-4.4+k*3)*0.6);g.rotate((k-1.5)*0.14);
    g.strokeStyle=bd;g.lineWidth=2.4;g.beginPath();g.moveTo(0,0);g.lineTo(7,0);g.stroke();g.strokeStyle=bn;g.lineWidth=1.6;g.stroke();g.translate(7,0);
    for(let j=0;j<3;j++){const L=[4.8,3.6,2.8][j];g.fillStyle=bn;g.beginPath();g.arc(0,0,1.2,0,TAU);g.fill();g.rotate(c*(j?0.8:0.6));
      g.strokeStyle=bd;g.lineWidth=2-j*0.3;g.beginPath();g.moveTo(0,0);g.lineTo(L,0);g.stroke();g.strokeStyle=bn;g.lineWidth=1.4-j*0.2;g.stroke();g.translate(L,0);}
    g.fillStyle=bn;g.beginPath();g.moveTo(0,-0.7);g.lineTo(1.6,0);g.lineTo(0,0.7);g.fill();g.restore();}
  g.save();g.translate(-4.5,-4.6);g.rotate(-0.95+curl*0.7);for(let j=0;j<2;j++){g.strokeStyle=bn;g.lineWidth=1.8;g.beginPath();g.moveTo(0,0);g.lineTo(4.2,0);g.stroke();g.translate(4.2,0);g.rotate(0.3);}g.restore();
  olLight(g,(g)=>{for(let k=0;k<4;k++){const f=(t*1.8+k*0.25)%1;g.fillStyle='rgba(150,220,255,'+(0.65*(1-f))+')';g.beginPath();g.ellipse(-17-f*10,(k-1.5)*2+Math.sin(t*6+k)*1.4,2.4*(1-f*0.4),1.6,0,0,TAU);g.fill();}
    if(glow>0.05)softGlow(g,6,0,16,'#bfe8ff',glow*0.7);});
  g.restore();
}

function hbDrawMob(g,m,t){
  const echo=m.def.mech==='hbecho';
  const id=m.copy||m.def.hb;if(!HB_MODEL[id])return;
  const B=m.b||{phase:1,atk:'idle'};
  const U=m.h/100;
  m._dt=clamp(G.time-(m._lt===undefined?G.time:m._lt),0,0.05);m._lt=G.time;
  m.svx=lerp(m.svx||0,m.vx||0,Math.min(1,m._dt*4));m.svy=lerp(m.svy||0,m.vy||0,Math.min(1,m._dt*4));
  g.save();
  g.globalAlpha=(m.alpha===undefined?1:m.alpha)*(echo?0.5:1);
  g.translate(m.x,m.y);
  if(m.flinch>0){const k=m.flinch;g.translate((m.flinchDir||1)*k*3*U,0);g.translate(0,-m.h*0.5);g.scale(1-k*0.03,1+k*0.02);g.translate(0,m.h*0.5);}
  if(m.deathK!==undefined&&echo){const k=clamp((m.deadT||0)/0.5,0,1);g.globalAlpha*=1-k;g.translate(0,-k*20);}
  if(HB_PRE[id])HB_PRE[id](g,m,t,B,U);
  const OR=Math.max(m.w,m.h)*0.9+40;
  OL.shade={h:m.h,top:0.14,bot:id==='warden'?0.12:0.3};
  withOutline(g,0,-m.h*0.5,OR,OR,echo?'rgba(120,200,255,.6)':'rgba(8,3,5,.96)',-1.6,(gg)=>{
    if(OL.active&&gg===OL.g){if(m.hurt>0)OL.tint='rgba(255,246,236,'+(0.2+0.45*clamp(m.hurt/0.24,0,1))+')';else if(echo)OL.tint='rgba(120,200,255,.35)';else if(B.stagT>0)OL.tint='rgba(255,230,120,'+(0.12+0.08*Math.sin(t*16))+')';}
    gg.save();gg.scale(U*(m.facing||1),U);HB_MODEL[id](gg,m,t,B,U);gg.restore();
  });
  if(HB_POST[id])HB_POST[id](g,m,t,B,U);
  if(B.stagT>0&&!echo){for(let k=0;k<3;k++){const a=t*4+k*TAU/3;g.fillStyle='#ffe070';g.font='bold '+Math.round(12+U*4)+'px system-ui';g.textAlign='center';g.fillText('✦',Math.cos(a)*m.w*0.35,-m.h-8+Math.sin(a)*6);}}
  if(m.invuln>0&&!G.bossCut&&!echo&&m.alive!==false&&B.atk==='trans'){g.strokeStyle='rgba(255,255,255,'+(0.2+0.2*Math.sin(t*20))+')';g.lineWidth=2;g.beginPath();g.ellipse(0,-m.h*0.5,m.w*0.62,m.h*0.58,0,0,TAU);g.stroke();}
  if(B.armor>0&&!echo){olLight(g,(g)=>{g.strokeStyle='rgba(200,230,255,'+(0.35+0.2*Math.sin(t*9))+')';g.lineWidth=3;g.setLineDash([10,7]);g.lineDashOffset=-t*60;g.beginPath();g.ellipse(0,-m.h*0.5,m.w*0.7,m.h*0.6,0,0,TAU);g.stroke();g.setLineDash([]);});}
  if(B.weak>0&&!(B.stagT>0)&&!echo){const k=0.5+0.5*Math.sin(t*14);olLight(g,(g)=>{softGlow(g,0,-m.h*0.5,m.w*0.6,'#ffd040',0.18+0.12*k);});}
  g.restore();
}

/* ======================= ПЕПЕЛЬНЫЙ ВЕСТНИК =======================
   Парящий глашатай в рваном пепельном плаще, костяная маска под капюшоном,
   корона из угольков, медный боевой горн, пепельные крылья из лопаток. */
HB_MODEL.herald=function(g,m,t,B,U){
  const ph=B.phase||1,sp=m.spawnS===undefined?1:m.spawnS,burn=ph>=3,dash=!!B.dashing;
  const blow=clamp(B.horn||0,0,1),cast=(B.atk==='rain'||B.atk==='tornado'||B.atk==='bats')?Math.min(1,(m.tele||0)+0.3):0;
  const P=hbPose(m,{open:(dash?0.25:blow>0.5||B.atk==='storm'?1:0.62)*sp,flapA:dash?0.25:B.atk==='storm'?0.18:0.1,lean:dash?0.32:clamp((m.svx||0)*0.0006,-0.2,0.2),
    horn:blow,cast:cast,stag:B.stagT>0?1:0},7);
  const flap=Math.sin(t*(dash?13:3.2))*P.flapA-P.stag*0.25;
  const bob=Math.sin(t*2.2+m.phase)*2.2+P.stag*6;
  g.translate(0,bob);g.rotate(P.lean+P.stag*0.12);
  const robe='#4a403c',robeD='#262020',robeL='#6a5e58',bone='#ddd2bc',ember='#ff8a3a';
  hbWing(g,-1,P.open,-flap*0.9,0.92,'#3a2420','#2a1e1a',{torn:true,glowEdge:'#ff6a2a',warm:'#a8401a',burn});
  hbWing(g,1,P.open,flap,1.05,'#4a2e28','#3a2a24',{torn:true,glowEdge:'#ff8a3a',warm:'#c85a24',burn});
  /* длинный рваный низ плаща — тянется за движением */
  const tail=[];for(let k=0;k<6;k++){const x0=-18+k*7;tail.push(hbRope(m,'hem'+k,x0,-30,5,6.5,U,{grav:120,damp:0.86,curl:2.4,amp:30,seed:k,stiff:0.06,sx:-0.15,sy:1}));}
  tail.forEach((pts,k)=>{hbTube(g,pts,5.6,1.2,k%2?robeD:'#342a28',k%2?null:'rgba(255,255,255,.05)');});
  /* балахон */
  g.fillStyle=hbLin(g,-20,-76,20,-16,[[0,robeL],[0.45,robe],[1,robeD]]);
  g.beginPath();g.moveTo(-12,-74);g.quadraticCurveTo(-26,-48,-24,-22);g.lineTo(-20,-26);g.lineTo(-15,-18);g.lineTo(-9,-25);g.lineTo(-2,-16);g.lineTo(5,-24);g.lineTo(11,-17);g.lineTo(17,-25);g.lineTo(22,-20);
  g.quadraticCurveTo(24,-48,14,-74);g.closePath();g.fill();
  g.strokeStyle='rgba(16,10,8,.65)';g.lineWidth=1.1;for(const x of [-12,-3,7]){g.beginPath();g.moveTo(x*0.5,-68);g.quadraticCurveTo(x*0.9,-46,x*1.2,-24);g.stroke();}
  olLight(g,(g)=>{g.strokeStyle='rgba(255,130,50,'+(0.55+0.25*Math.sin(t*4))+')';g.lineWidth=1.2;g.beginPath();g.moveTo(-15,-30);g.lineTo(-11,-38);g.lineTo(-14,-46);g.moveTo(-11,-38);g.lineTo(-7,-42);g.moveTo(9,-28);g.lineTo(6,-36);g.lineTo(10,-44);g.stroke();});
  g.fillStyle='#1e1614';g.beginPath();g.moveTo(-15,-50);g.quadraticCurveTo(0,-47,16,-50);g.lineTo(16,-45);g.quadraticCurveTo(0,-42,-15,-45);g.closePath();g.fill();
  /* накидка на плечах с рваным краем */
  g.fillStyle=hbLin(g,0,-80,0,-56,[[0,'#5e524c'],[1,'#3a302c']]);
  g.beginPath();g.moveTo(-14,-76);g.quadraticCurveTo(-24,-70,-25,-58);g.lineTo(-20,-60);g.lineTo(-16,-54);g.lineTo(-11,-59);g.lineTo(-5,-53);g.lineTo(1,-58);g.lineTo(7,-53);g.lineTo(12,-59);g.lineTo(18,-55);g.lineTo(23,-60);g.quadraticCurveTo(22,-71,15,-76);g.closePath();g.fill();
  g.strokeStyle='rgba(255,240,220,.12)';g.lineWidth=1;g.beginPath();g.moveTo(-12,-74);g.quadraticCurveTo(-20,-69,-22,-62);g.stroke();
  /* дальняя рука */
  {const up=P.cast,hx=-17-4*up,hy=lerp(-44,-90,up);
    g.fillStyle='#3a302c';g.beginPath();g.moveTo(-15,-66);g.quadraticCurveTo(-22,-56+(-30)*up,hx-2,hy+6);g.lineTo(hx+4,hy+6);g.quadraticCurveTo(-14,-56-20*up,-9,-64);g.closePath();g.fill();
    g.strokeStyle=bone;g.lineWidth=1.3;g.lineCap='round';for(let k=-1;k<=2;k++){g.beginPath();g.moveTo(hx+k*1.4,hy+4);g.lineTo(hx+k*2.4-1,hy-3);g.lineTo(hx+k*2.6-0.5,hy-6);g.stroke();}
    if(up>0.2){mobGlow(g,hx,hy-4,16,ember,0.5*up);hbFlame(g,hx,hy-4,2.4,8,t,2,ember,'#ffd060');}}
  /* капюшон и маска */
  g.save();g.translate(3,-82);g.rotate(-0.05+P.horn*0.12);
  g.fillStyle=hbLin(g,-12,-20,12,10,[[0,'#4a3e3a'],[1,'#221a18']]);
  g.beginPath();g.moveTo(-11,9);g.quadraticCurveTo(-14,-10,-5,-19);g.quadraticCurveTo(-2,-24,-8,-28);g.quadraticCurveTo(6,-24,11,-12);g.quadraticCurveTo(15,0,12,10);g.closePath();g.fill();
  g.fillStyle='#0c0807';g.beginPath();g.ellipse(3,-1,8,10,0.05,0,TAU);g.fill();
  g.fillStyle=hbLin(g,0,-10,0,10,[[0,'#f0e6d0'],[1,'#b8ab94']]);
  g.beginPath();g.moveTo(-3,-9);g.quadraticCurveTo(4,-11,10,-8);g.quadraticCurveTo(11,1,8,6);g.lineTo(5,9);g.lineTo(1,9);g.quadraticCurveTo(-4,3,-3,-9);g.closePath();g.fill();
  g.strokeStyle='rgba(60,40,30,.7)';g.lineWidth=0.7;g.beginPath();g.moveTo(5,-10);g.lineTo(4,-5);g.lineTo(6,-3);g.moveTo(1,7);g.lineTo(2,9);g.moveTo(4,7);g.lineTo(4,9);g.stroke();
  const ec=burn?'#ffe080':ember;
  for(const [x,y] of [[1,-3],[7,-3]]){g.fillStyle='#0a0504';g.beginPath();g.ellipse(x,y,2.2,1.6,-0.15,0,TAU);g.fill();mobGlow(g,x,y,7,ec,0.9);g.fillStyle=ec;g.beginPath();g.ellipse(x+0.4,y,1.1,0.8,0,0,TAU);g.fill();}
  g.restore();
  for(let k=0;k<5;k++)hbFlame(g,-6+k*4.4,-104+Math.abs(k-2)*1.6,2.1,6+(k===2?5:k%2?2:3),t,k,burn?'#ffb030':'#ff6a1a','#ffe080');
  mobGlow(g,3,-108,16,ember,0.5);
  /* горн и ближняя рука */
  {const h=P.horn,gx=lerp(15,13,h),gy=lerp(-48,-80,h),a=lerp(0.95,-0.5,h);
    g.fillStyle='#3a302c';g.beginPath();g.moveTo(10,-68);g.quadraticCurveTo(18,-60+(-12)*h,gx+3,gy+4);g.lineTo(gx-3,gy+6);g.quadraticCurveTo(10,-58-10*h,5,-66);g.closePath();g.fill();
    g.save();g.translate(gx,gy);g.rotate(a);
    g.fillStyle=hbLin(g,0,-6,0,6,[[0,'#ffe0a0'],[0.45,'#c89850'],[1,'#6a4a20']]);
    g.beginPath();g.moveTo(-6,-1.4);g.quadraticCurveTo(18,-3,34,-5);g.quadraticCurveTo(42,-7,46,-13);g.lineTo(47,8);g.quadraticCurveTo(42,3,34,3);g.quadraticCurveTo(18,2.4,-6,1.4);g.closePath();g.fill();
    g.strokeStyle='#4a2e10';g.lineWidth=0.8;g.stroke();
    g.fillStyle='#5a3a18';for(const x of [6,16,26])g.fillRect(x,-2.6-x*0.06,1.8,5.2+x*0.1);
    g.fillStyle='rgba(255,255,255,.35)';g.fillRect(0,-1.2,30,0.8);
    g.fillStyle='#1a0e06';g.beginPath();g.ellipse(46.5,-2.5,2,10,0,0,TAU);g.fill();
    if(h>0.5)olLight(g,(g)=>{for(let k=0;k<3;k++){const r=8+((t*44+k*15)%45);g.strokeStyle='rgba(255,180,100,'+(0.7*(1-r/54))+')';g.lineWidth=1.8;g.beginPath();g.arc(47,-2.5,r,-0.75,0.75);g.stroke();}});
    g.restore();
    g.strokeStyle=bone;g.lineWidth=1.3;for(let k=0;k<3;k++){g.beginPath();g.moveTo(gx-2+k*1.6,gy-2);g.lineTo(gx-1+k*1.6,gy+2.5);g.stroke();}}
  if(m.tele>0.05)mobGlow(g,3,-62,44,ember,m.tele*0.32);
  if(settings.quality!=='low'&&m._dt>0&&Math.random()<0.3)spawnPart(m.x+rnd(-14,14)*U,m.y-rnd(5,25)*U,rnd(-10,10),rnd(10,40),rnd(0.6,1.2),Math.random()<0.7?'#8a7c74':ember,rnd(1.5,2.6),-20);
};

/* ======================= МАТЬ ПЛОТИ =======================
   Яйцевидная багровая утроба, обвитая рёбрами, с россыпью жёлтых глаз,
   вертикальной зубастой пастью с кристальным сердцем и костяной короной.
   В 1–2 фазе вросла корнями, в 3-й стоит на шести костяных лапах. */
HB_MODEL.mother=function(g,m,t,B,U){
  const ph=B.phase||1,sp=m.spawnS===undefined?1:m.spawnS,free=!!B.free;
  const P=hbPose(m,{open:clamp((B.open||0)+(B.weak>0?0.6:0),0,1),lift:free?1:0,squash:B.atk==='leap'&&B.sub===1?1:0,whip:B.whip||0,stag:B.stagT>0?1:0},8);
  if(sp<1){g.beginPath();g.rect(-200,-400,400,401);g.clip();g.translate(0,(1-sp)*100);}
  const fl='#b02a40',bone='#eadcc2',boneD='#a8987c';
  const pulse=Math.sin(t*2.6)*0.025+P.open*0.03;
  const bodyY=-50-P.lift*20+P.squash*8;
  if(P.lift<0.95){g.save();g.globalAlpha*=1-P.lift;
    for(let k=0;k<7;k++){const s=k<3?-1:k>3?1:0,i=Math.abs(k-3),x0=(k-3)*7,y0=-14;
      const pts=[[x0,y0],[x0+s*(10+i*6),-6+Math.sin(t*1.2+k)*1.2],[x0+s*(22+i*10),-1],[x0+s*(30+i*14)+Math.sin(t+k)*2,1]];
      hbTube(g,pts,6.5-i*0.4,1.4,k%2?'#7a1426':'#5a0c1c','rgba(255,120,140,.25)');}
    g.restore();}
  if(P.lift>0.05){const run=Math.abs(m.vx)>20;g.save();g.globalAlpha*=P.lift;
    for(let k=0;k<6;k++){const s=k<3?-1:1,i=k%3,ph2=m.anim*10+i*2.1+(s>0?Math.PI:0);
      const hx=s*(14+i*6),hy=bodyY+18+i*2,fx=s*(34+i*12)+(run?Math.sin(ph2)*8:0),fy=!m.onGround?-8:-Math.max(0,Math.cos(ph2))*(run?7:0);
      const kx=hx+s*(16+i*4),ky=Math.min(hy,fy)-18-i*3;
      hbLimb(g,hx,hy,kx,ky,3.4,2.6,i===1?boneD:bone);hbLimb(g,kx,ky,fx,fy,2.6,0.8,i===1?boneD:bone);
      g.fillStyle=bone;g.beginPath();g.arc(kx,ky,3,0,TAU);g.fill();}
    g.restore();}
  for(const s of [-1,1]){const whip=s>0?P.whip:0;
    const pts=hbRope(m,'tent'+s,s*30,bodyY+6,6,7,U,{grav:whip>1.5?-400:300,damp:0.88,curl:1.6,amp:40,seed:s*3,stiff:whip>0.1?0.35:0.08,sx:s*(whip>1.5?1:whip>0?0.4:0.35),sy:whip>1.5?0.1:whip>0?-1:1});
    hbTube(g,pts,4.2,1.6,'#8a1a2c','rgba(255,150,160,.3)');
    const e=pts[pts.length-1],p2=pts[pts.length-2],a=Math.atan2(e[1]-p2[1],e[0]-p2[0]);
    g.save();g.translate(e[0],e[1]);g.rotate(a);g.fillStyle=bone;g.beginPath();g.moveTo(0,-1.5);g.quadraticCurveTo(6,-2,6,4);g.quadraticCurveTo(4,1,0,1.5);g.closePath();g.fill();g.restore();}
  g.save();g.translate(0,bodyY);g.rotate(P.stag*Math.sin(t*9)*0.05);g.scale(1+pulse-P.squash*0.06,1-pulse+P.squash*0.08);
  g.beginPath();g.ellipse(0,0,36,42,0,0,TAU);g.fillStyle=hbVol(g,0,0,44,fl);g.fill();
  g.strokeStyle='rgba(60,4,14,.7)';g.lineWidth=1.2;g.stroke();
  g.fillStyle='rgba(255,210,220,.35)';g.beginPath();g.ellipse(-16,-24,7,4,-0.6,0,TAU);g.fill();g.beginPath();g.ellipse(-24,-10,2.4,1.6,-0.6,0,TAU);g.fill();
  g.strokeStyle='rgba(80,6,20,.6)';g.lineWidth=1;for(const [a,b,c,d] of [[-30,-20,-22,-34],[28,-18,22,-32],[-26,22,-14,32],[24,24,12,34]]){g.beginPath();g.moveTo(a,b);g.quadraticCurveTo((a+c)/2+4,(b+d)/2,c,d);g.stroke();}
  for(let k=0;k<5;k++){const y=-26+k*12,w=30-Math.abs(k-2)*3;
    for(const s of [-1,1]){g.strokeStyle=boneD;g.lineWidth=5.2-Math.abs(k-2)*0.5;g.lineCap='round';g.beginPath();g.moveTo(s*6,y-3);g.quadraticCurveTo(s*(w+4),y-2,s*(w+2),y+8);g.stroke();
      g.strokeStyle=bone;g.lineWidth=3.6-Math.abs(k-2)*0.4;g.stroke();
      g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=0.8;g.beginPath();g.moveTo(s*8,y-4);g.quadraticCurveTo(s*(w+2),y-4,s*(w+1),y+3);g.stroke();}}
  {const mo=10+P.open*12,mw=5+P.open*4;
    g.fillStyle='#3a0610';g.beginPath();g.moveTo(0,-mo-6);g.quadraticCurveTo(mw+3,0,0,mo+6);g.quadraticCurveTo(-mw-3,0,0,-mo-6);g.fill();
    g.fillStyle='#200206';g.beginPath();g.moveTo(0,-mo);g.quadraticCurveTo(mw,0,0,mo);g.quadraticCurveTo(-mw,0,0,-mo);g.fill();
    g.fillStyle='#f6ecd8';for(let k=0;k<6;k++){const y=-mo+3+k*(mo*2-6)/5;for(const s of [-1,1]){const x=s*mw*0.85*Math.sqrt(Math.max(0,1-Math.pow(y/mo,2)));g.beginPath();g.moveTo(x,y-1.6);g.lineTo(x-s*3,y);g.lineTo(x,y+1.6);g.fill();}}
    const hb2=1+Math.sin(t*(B.weak>0?14:5))*0.1;g.save();g.scale(hb2,hb2);
    g.fillStyle=hbLin(g,0,-7,0,7,[[0,'#ff9aa8'],[0.5,'#e01a34'],[1,'#7a0016']]);g.beginPath();g.moveTo(0,-7);g.lineTo(3.6,-1);g.lineTo(0,7);g.lineTo(-3.6,-1);g.closePath();g.fill();
    g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.moveTo(0,-6);g.lineTo(1.4,-1.5);g.lineTo(-0.6,-1.5);g.fill();g.restore();
    mobGlow(g,0,0,14+P.open*14,B.weak>0?'#ffd060':'#ff2a3a',0.45+P.open*0.35);}
  for(const [x,y,r] of [[-14,-30,5.2],[12,-32,6],[-24,-14,3.6],[22,-14,4.4],[-8,-40,3],[26,4,3.4],[-26,8,3],[-14,28,4],[14,30,3.6],[4,-42,2.6]])
    hbEye(g,m,x,y,r*(ph>=2?1.08:1),'#c01a24',ph>=2?'#ffd040':null,{white:'#f0d870'});
  g.restore();
  for(let k=0;k<7;k++){const x=(k-3)*6.5,h=8+(k===3?16:k===2||k===4?10:5)+Math.sin(t*0.8+k)*0.4,y=bodyY-38+Math.abs(k-3)*1.5;
    g.fillStyle=k%2?bone:'#d6c6a6';g.beginPath();g.moveTo(x-3,y+2);g.quadraticCurveTo(x-1.5,y-h*0.6,x+1,y-h);g.quadraticCurveTo(x+1.8,y-h*0.5,x+3,y+2);g.closePath();g.fill();
    g.fillStyle='rgba(255,255,255,.45)';g.fillRect(x-1,y-h*0.7,0.8,h*0.6);}
  if(m.tele>0.05)mobGlow(g,0,bodyY,60,'#ff4a5a',m.tele*0.3);
};

/* ======================= КОРОЛЬ ТОПЕЙ =======================
   Огромная оливковая жаба с пятнами, светлым брюхом, гребнем серных кристаллов,
   золотыми глазами, маленькой короной и жёлтым горловым мешком. */
HB_MODEL.toadking=function(g,m,t,B,U){
  const ph=B.phase||1,air=!m.onGround&&Math.abs(m.vy)>60,up=air&&m.vy<0;
  const crouch=(B.atk==='hop'||B.atk==='quake')&&!air?(m.tele||0):0;
  const P=hbPose(m,{crouch:crouch,stretch:air?(up?1:0.6):0,croak:clamp(B.croak||0,0,1),mouth:(B.tongue?1:0)+((B.atk==='spit'||B.atk==='bombs')?(m.tele||0)*0.6:0),stag:B.stagT>0?1:0},12);
  if(B.atk==='dive'&&m.hbB){const R=hbBounds(m);g.beginPath();g.rect(-300,-300,600,300+(R.floor-m.y)/U+1);g.clip();}
  g.translate(0,P.crouch*6);g.scale(1+P.crouch*0.08-P.stretch*0.06,1-P.crouch*0.1+P.stretch*0.1);g.rotate(-P.stretch*0.12+P.stag*Math.sin(t*8)*0.04);
  const sk='#7a8a2e',skD='#465216',skL='#a8b848',belly='#e8dc94',spot='#c8c84a';
  if(P.stretch>0.3){hbMuscle(g,-30,-30,-58,-6,10,9,5,shadeHex(sk,-0.3));hbLimb(g,-58,-6,-80,6,5,3,shadeHex(sk,-0.3));}
  g.beginPath();g.moveTo(-50,-30);g.bezierCurveTo(-56,-60,-20,-74,14,-66);g.bezierCurveTo(44,-60,58,-46,56,-28);g.bezierCurveTo(54,-8,30,-2,0,-2);g.bezierCurveTo(-30,-2,-46,-12,-50,-30);g.closePath();
  g.fillStyle=hbVol(g,-4,-40,62,sk);g.fill();g.strokeStyle=skD;g.lineWidth=1.2;g.stroke();
  g.fillStyle=hbLin(g,0,-40,0,-2,[[0,shadeHex(belly,0.1)],[1,shadeHex(belly,-0.2)]]);
  g.beginPath();g.moveTo(-6,-6);g.bezierCurveTo(-18,-20,6,-46,34,-40);g.bezierCurveTo(52,-34,52,-14,36,-6);g.quadraticCurveTo(14,0,-6,-6);g.fill();
  g.strokeStyle='rgba(140,120,60,.35)';g.lineWidth=0.8;for(let k=0;k<4;k++){g.beginPath();g.moveTo(4+k*9,-30+k*2);g.quadraticCurveTo(8+k*9,-18,6+k*9,-8);g.stroke();}
  for(let k=0;k<24;k++){const a=(k*2.399)%TAU,r=14+(k*13)%26,x=-12+Math.cos(a)*r*1.4,y=-42+Math.sin(a)*r*0.65;if(y>-18||x>30)continue;
    g.fillStyle=k%4===0?skD:spot;g.beginPath();g.ellipse(x,y,1.6+(k%3)*0.9,1.2+(k%3)*0.6,a,0,TAU);g.fill();}
  for(const [x,y,h,a,w] of [[-40,-52,18,-0.7,5],[-32,-60,24,-0.45,6],[-20,-66,30,-0.2,7],[-8,-68,22,0.05,6],[2,-68,16,0.2,5],[-26,-58,14,-0.3,4]]){
    g.save();g.translate(x,y);g.rotate(a);
    g.fillStyle=hbLin(g,-w,0,w,-h,[[0,'#9a8a10'],[0.45,'#f0e050'],[1,'#fffcc0']]);g.beginPath();g.moveTo(-w,2);g.lineTo(-w*0.8,-h*0.75);g.lineTo(0,-h);g.lineTo(w*0.8,-h*0.75);g.lineTo(w,2);g.closePath();g.fill();
    g.strokeStyle='rgba(120,100,0,.6)';g.lineWidth=0.6;g.stroke();g.fillStyle='rgba(255,255,255,.45)';g.beginPath();g.moveTo(-w*0.5,-h*0.7);g.lineTo(0,-h*0.95);g.lineTo(-w*0.1,-h*0.5);g.fill();g.restore();
    mobGlow(g,x,y-h*0.5,h,'#f0e04a',ph>=3?0.55:0.35);}
  if(P.stretch>0.3){hbMuscle(g,-24,-24,-48,-2,13,12,6,sk,skL);hbLimb(g,-48,-2,-74,10,6,3.4,sk);g.fillStyle=sk;for(let k=0;k<3;k++){g.beginPath();g.ellipse(-78-k*3,12+k*2,5,2,0.4,0,TAU);g.fill();}}
  else{g.beginPath();g.ellipse(-30,-20,22,17,-0.3,0,TAU);g.fillStyle=hbVol(g,-34,-24,22,sk);g.fill();g.strokeStyle=skD;g.lineWidth=1;g.stroke();
    g.fillStyle=sk;g.beginPath();g.moveTo(-24,-6);g.lineTo(-2,-1);g.lineTo(0,1);g.lineTo(-34,1);g.closePath();g.fill();
    for(let k=0;k<3;k++){g.beginPath();g.ellipse(-2+k*5,0.5,4.6,1.8,0.1*k,0,TAU);g.fill();}
    g.fillStyle=spot;g.beginPath();g.arc(-36,-24,2.6,0,TAU);g.arc(-26,-16,1.8,0,TAU);g.fill();}
  {const fx=P.stretch>0.3?50:44,fy=P.stretch>0.3?-6:0;hbMuscle(g,34,-26,fx,fy-4,7,6,4,sk,skL);
    g.fillStyle=sk;for(let k=-1;k<=2;k++){g.beginPath();g.ellipse(fx+k*4,fy,3.6,1.6,k*0.35,0,TAU);g.fill();}}
  g.save();g.translate(30,-52);g.rotate(-P.croak*0.08-P.mouth*0.06);
  g.beginPath();g.moveTo(-14,-12);g.bezierCurveTo(-2,-24,22,-22,30,-8);g.bezierCurveTo(34,0,30,8,22,10);g.lineTo(-10,8);g.closePath();g.fillStyle=hbVol(g,8,-6,30,sk);g.fill();g.strokeStyle=skD;g.lineWidth=1;g.stroke();
  {const r=6+P.croak*16;g.fillStyle=hbLin(g,0,-r,0,r,[[0,'#fff0a0'],[1,'#d8b040']]);g.beginPath();g.ellipse(18,12+r*0.4,r*1.05,r*0.85,0,0,TAU);g.fill();
    g.strokeStyle='rgba(140,100,20,.6)';g.lineWidth=0.8;g.stroke();g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.ellipse(14,8+r*0.2,r*0.35,r*0.18,-0.4,0,TAU);g.fill();}
  {const op=P.mouth*7;g.strokeStyle='#1e2406';g.lineWidth=2;g.lineCap='round';g.beginPath();g.moveTo(-6,2);g.quadraticCurveTo(14,8,30,0);g.stroke();
    if(op>0.5){g.fillStyle='#6a1428';g.beginPath();g.moveTo(-2,3);g.quadraticCurveTo(14,6+op,29,1);g.quadraticCurveTo(14,8-op*0.2,-2,3);g.fill();}
    const d=(t*24)%16;g.fillStyle='rgba(190,255,110,.85)';g.beginPath();g.ellipse(4,6+d*0.6,1.4,2.4+d*0.08,0,0,TAU);g.fill();}
  for(const [x,y,r] of [[2,-18,7.5],[18,-17,8.5]]){g.fillStyle=hbVol(g,x,y,r+3,sk);g.beginPath();g.arc(x,y,r+3,Math.PI*0.95,TAU+0.05);g.lineTo(x+r+3,y+3);g.lineTo(x-r-3,y+3);g.fill();
    hbEye(g,m,x,y,r,'#e0a018',ph>=3?'#ffd040':null,{slit:'h',white:'#f6e070'});
    g.strokeStyle=skD;g.lineWidth=1.4;g.beginPath();g.arc(x,y,r+0.5,Math.PI*1.1,Math.PI*1.9);g.stroke();}
  {g.save();g.translate(10,-28);g.rotate(-0.15+Math.sin(t*1.2)*0.03);
    g.fillStyle=hbLin(g,0,-14,0,3,[[0,'#fff2a8'],[0.5,'#e0b030'],[1,'#8a5a10']]);
    g.beginPath();g.moveTo(-11,3);g.lineTo(-12,-7);g.lineTo(-7,-3);g.lineTo(-4,-13);g.lineTo(0,-4);g.lineTo(4,-13);g.lineTo(7,-3);g.lineTo(12,-7);g.lineTo(11,3);g.closePath();g.fill();
    g.strokeStyle='#5a3a06';g.lineWidth=0.7;g.stroke();
    g.fillStyle='#3ae060';g.beginPath();g.moveTo(0,-4);g.lineTo(2.2,-1);g.lineTo(0,2);g.lineTo(-2.2,-1);g.closePath();g.fill();mobGlow(g,0,-1,8,'#7aff8a',0.6);
    if(ph>=3){g.strokeStyle='#2a1a00';g.lineWidth=1;g.beginPath();g.moveTo(-6,-9);g.lineTo(-3,-3);g.lineTo(-6,0);g.lineTo(-2,3);g.stroke();}
    g.restore();}
  g.restore();
  if(m.tele>0.05)mobGlow(g,30,-40,40,'#c8ff4a',m.tele*0.28);
};
HB_POST.toadking=function(g,m,t,B){
  const T=B.tongue;if(!T||T.l<2)return;
  const x0=T.x-m.x,y0=T.y-m.y,x1=x0+Math.cos(T.a)*T.l,y1=y0+Math.sin(T.a)*T.l,mx=(x0+x1)/2,my=(y0+y1)/2-Math.min(30,T.l*0.08);
  g.lineCap='round';g.strokeStyle='#7a1838';g.lineWidth=12;g.beginPath();g.moveTo(x0,y0);g.quadraticCurveTo(mx,my,x1,y1);g.stroke();
  g.strokeStyle='#e8708e';g.lineWidth=8;g.stroke();g.strokeStyle='rgba(255,210,225,.55)';g.lineWidth=2;g.stroke();
  g.fillStyle='#e8708e';g.beginPath();g.ellipse(x1,y1,11,8,T.a,0,TAU);g.fill();g.fillStyle='#ffa8c0';g.beginPath();g.arc(x1-2,y1-2,4,0,TAU);g.fill();
};

/* ======================= КОСТЯНОЙ ИМПЕРАТОР =======================
   Скелет в высокой золотой короне, костяной воротник и наплечники-черепа,
   открытая грудь с синим сердцем души, рваная фиолетовая мантия с золотом,
   призрачные языки внизу; огромные кисти парят отдельно. */
HB_MODEL.emperor=function(g,m,t,B,U){
  const ph=B.phase||1,sp=m.spawnS===undefined?1:m.spawnS;
  const cast=B.atk==='curse'||B.atk==='army'||B.atk==='beams'||B.atk==='echo'?Math.min(1,(m.tele||0)+0.4):0;
  const P=hbPose(m,{cast:cast,jaw:(m.tele||0)+(cast>0?0.5:0),sway:clamp((m.svx||0)*0.002,-0.25,0.25),stag:B.stagT>0?1:0},8);
  const bob=Math.sin(t*1.6+m.phase)*2.6+P.stag*5;g.translate(0,bob);g.rotate(-P.sway*0.4+P.stag*0.1);
  const bone='#ece4d0',boneD='#a89e88',robe='#4a3266',robeD='#22163a',gold='#e8b848',soul='#8ad0ff';
  const as=(k)=>{if(sp>=1)return;const a=k*2.3,r=(1-sp)*90;g.translate(Math.cos(a)*r,Math.sin(a)*r-(1-sp)*30);g.rotate((1-sp)*(k%2?2:-2));};
  olLight(g,(g)=>{for(let k=0;k<6;k++){const x=-20+k*8,w=Math.sin(t*3+k)*3;g.fillStyle='rgba(120,200,255,'+(0.28*sp)+')';g.beginPath();g.moveTo(x-5,-14);g.quadraticCurveTo(x+w,-2,x+w*1.6,6+(k%3)*3);g.quadraticCurveTo(x+3,-4,x+5,-14);g.fill();}});
  g.save();as(1);
  const hem=[];for(let k=0;k<5;k++)hem.push(hbRope(m,'robe'+k,-20+k*10,-26,4,6,U,{grav:200,damp:0.85,curl:2,amp:24,seed:k,stiff:0.1,sx:-0.1,sy:1}));
  hem.forEach((pts,k)=>hbTube(g,pts,6.5,2,k%2?robe:robeD));
  g.fillStyle=hbLin(g,-26,-80,26,-10,[[0,'#6a4a8e'],[0.45,robe],[1,robeD]]);
  g.beginPath();g.moveTo(-17,-76);g.quadraticCurveTo(-30,-44,-29,-18);g.lineTo(-22,-22);g.lineTo(-15,-14);g.lineTo(-7,-21);g.lineTo(1,-13);g.lineTo(8,-21);g.lineTo(16,-14);g.lineTo(23,-21);g.lineTo(28,-17);g.quadraticCurveTo(28,-44,17,-76);g.closePath();g.fill();
  g.strokeStyle=gold;g.lineWidth=2.4;g.beginPath();g.moveTo(-10,-74);g.quadraticCurveTo(-15,-44,-14,-18);g.moveTo(10,-74);g.quadraticCurveTo(15,-44,14,-18);g.stroke();
  g.strokeStyle='#8a6a20';g.lineWidth=0.7;g.stroke();
  g.fillStyle='#0e0a18';g.beginPath();g.moveTo(-10,-74);g.lineTo(10,-74);g.quadraticCurveTo(12,-56,8,-38);g.lineTo(-8,-38);g.quadraticCurveTo(-12,-56,-10,-74);g.closePath();g.fill();
  g.strokeStyle=bone;g.lineCap='round';g.lineWidth=3;g.beginPath();g.moveTo(0,-74);g.lineTo(0,-36);g.stroke();
  g.fillStyle=bone;for(let k=0;k<7;k++){g.beginPath();g.ellipse(0,-72+k*5.4,2.2,1.6,0,0,TAU);g.fill();}
  g.lineWidth=1.8;for(let k=0;k<5;k++){const y=-70+k*6.2,w=9-k*0.6;g.strokeStyle=boneD;g.beginPath();g.moveTo(0,y);g.quadraticCurveTo(-w,y-1,-w+1,y+5);g.moveTo(0,y);g.quadraticCurveTo(w,y-1,w-1,y+5);g.stroke();
    g.strokeStyle=bone;g.lineWidth=1.3;g.stroke();g.lineWidth=1.8;}
  {const hb2=0.6+0.4*Math.sin(t*3.2),hx=-1,hy=-58;mobGlow(g,hx,hy,18,soul,0.5+0.3*hb2);
    g.fillStyle='rgba(150,220,255,'+(0.75+0.25*hb2)+')';g.beginPath();g.moveTo(hx,hy+4);g.bezierCurveTo(hx-6,hy-1,hx-3,hy-6,hx,hy-3);g.bezierCurveTo(hx+3,hy-6,hx+6,hy-1,hx,hy+4);g.fill();}
  g.fillStyle=boneD;g.beginPath();g.ellipse(0,-36,9,3.4,0,0,TAU);g.fill();g.fillStyle=gold;g.fillRect(-12,-40,24,3);
  g.fillStyle=bone;g.beginPath();g.arc(0,-35,3.4,0,TAU);g.fill();g.fillStyle='#120c18';g.fillRect(-1.8,-36,1.2,1.3);g.fillRect(0.6,-36,1.2,1.3);
  g.restore();
  for(const s of [-1,1]){const up=P.cast;const ex=s*lerp(24,26,up),ey=lerp(-52,-84,up);
    hbLimb(g,s*17,-72,ex,ey,2.4,2,boneD);hbLimb(g,s*17,-72,ex,ey,1.6,1.3,bone);g.fillStyle=bone;g.beginPath();g.arc(ex,ey,2.2,0,TAU);g.fill();
    olLight(g,(g)=>{softGlow(g,ex,ey,7,soul,0.5);});}
  g.save();as(2);
  for(const s of [-1,1]){const x=s*18,y=-75;g.fillStyle=hbVol(g,x,y,10,bone);g.beginPath();g.ellipse(x,y,10,8,s*0.25,0,TAU);g.fill();
    g.fillStyle=bone;g.fillRect(x-5,y+4,10,4);g.fillStyle='#16101e';g.beginPath();g.ellipse(x-3.4,y-0.5,2.2,2.6,0,0,TAU);g.ellipse(x+3.4,y-0.5,2.2,2.6,0,0,TAU);g.fill();
    g.fillRect(x-0.6,y+3,1.2,1.6);for(let k=-2;k<=2;k++)g.fillRect(x+k*1.8-0.4,y+5,0.8,2.6);
    olLight(g,(g)=>{softGlow(g,x-3.4,y-0.5,4,soul,0.5);softGlow(g,x+3.4,y-0.5,4,soul,0.5);});}
  for(let k=0;k<9;k++){const x=-16+k*4,h=10+(k===4?8:(k%2)*4),a=(k-4)*0.12;g.save();g.translate(x,-78);g.rotate(a);g.fillStyle=k%2?bone:boneD;
    g.beginPath();g.moveTo(-1.8,0);g.lineTo(0,-h);g.lineTo(1.8,0);g.fill();g.restore();}
  g.restore();
  g.save();as(3);g.translate(1,-90);
  {const jaw=P.jaw*4;
    g.fillStyle=hbVol(g,0,-2,13,bone);g.beginPath();g.ellipse(0,-2,11,12,0,0,TAU);g.fill();g.strokeStyle=boneD;g.lineWidth=0.7;g.stroke();
    g.fillStyle=bone;g.beginPath();g.moveTo(-7,6);g.lineTo(7,6);g.lineTo(6,10+jaw);g.lineTo(-6,10+jaw);g.closePath();g.fill();
    g.fillStyle='#120c18';for(const [x,y] of [[-4.2,-2],[4.2,-2]]){g.beginPath();g.ellipse(x,y,3.4,3.9,0,0,TAU);g.fill();}
    for(const [x,y] of [[-4.2,-2],[4.2,-2]]){mobGlow(g,x,y,11,soul,0.9);g.fillStyle='#e0f6ff';g.beginPath();g.arc(x+(m.lookX||0)*0.8,y,1.3,0,TAU);g.fill();
      olLight(g,(g)=>{g.fillStyle='rgba(140,210,255,.5)';g.beginPath();g.moveTo(x-2,y-3);g.quadraticCurveTo(x+Math.sin(t*7+x)*2,y-9,x+1,y-12);g.quadraticCurveTo(x+2,y-7,x+2.6,y-3);g.fill();});}
    g.fillStyle='#120c18';g.beginPath();g.moveTo(0,1.5);g.lineTo(1.6,4.6);g.lineTo(-1.6,4.6);g.fill();
    g.fillStyle='#f6eedc';for(let k=0;k<6;k++){g.fillRect(-6.2+k*2.2,6,1.6,2.2);g.fillRect(-6.2+k*2.2,8.2+jaw,1.6,2);}
    g.strokeStyle='rgba(80,70,60,.6)';g.lineWidth=0.6;g.beginPath();g.moveTo(-2,-12);g.lineTo(-1,-7);g.lineTo(-3,-5);g.stroke();}
  {const lift=ph>=3?3+Math.sin(t*2)*1.5:0;g.translate(0,-lift);
    g.fillStyle=hbLin(g,0,-34,0,-11,[[0,'#fff4c0'],[0.45,gold],[1,'#7a5410']]);
    g.beginPath();g.moveTo(-11,-10);g.lineTo(-13,-24);g.lineTo(-8,-17);g.lineTo(-6,-32);g.lineTo(-2,-19);g.lineTo(0,-38);g.lineTo(2,-19);g.lineTo(6,-32);g.lineTo(8,-17);g.lineTo(13,-24);g.lineTo(11,-10);g.closePath();g.fill();
    g.strokeStyle='#5a3c08';g.lineWidth=0.7;g.stroke();g.fillStyle='rgba(255,255,255,.4)';g.fillRect(-10,-12,20,1);
    for(const [x,y,r] of [[-6,-13,1.6],[0,-14,2.2],[6,-13,1.6]]){g.fillStyle='#6ad0ff';g.beginPath();g.moveTo(x,y-r*1.3);g.lineTo(x+r,y);g.lineTo(x,y+r*1.3);g.lineTo(x-r,y);g.closePath();g.fill();mobGlow(g,x,y,6,soul,0.65);}
    if(ph>=3)mobGlow(g,0,-22,28,soul,0.35);}
  g.restore();
  if(ph>=2){for(let k=0;k<3;k++){const a=t*1.4+k*TAU/3,x=Math.cos(a)*40,y=-56+Math.sin(a)*14;if(Math.sin(a)<-0.3)continue;
    g.fillStyle=bone;g.beginPath();g.arc(x,y,4,0,TAU);g.fill();g.fillRect(x-2.4,y+2,4.8,2.4);g.fillStyle='#120c18';g.fillRect(x-2,y-1,1.5,1.6);g.fillRect(x+0.5,y-1,1.5,1.6);mobGlow(g,x,y,9,soul,0.4);}}
  if(m.tele>0.05)mobGlow(g,1,-88,40,soul,m.tele*0.4);
};
HB_POST.emperor=function(g,m,t,B,U){
  if(!B.hx)return;const s=m.h/100*1.75,sp=m.spawnS===undefined?1:m.spawnS;
  g.globalAlpha*=sp;
  const P=m.ps||{};const curl=(B.clap>0||B.atk==='teleport'&&B.sub===3)?1.1:0.2+(P.cast||0)*0.35;
  for(let i=0;i<2;i++){const x=B.hx[i]-m.x,y=B.hy[i]-m.y;hbBoneHand(g,x,y,s,i?1:-1,curl,t,P.cast||0);}
  if(B.clap>0)B.clap-=m._dt||0.016;
};

/* ======================= ВЛАДЫКА МАГМЫ =======================
   Каменный исполин из чёрных базальтовых плит, скреплённых швами магмы,
   по пояс в лаве. Плечи-валуны с кандалами и цепями, рогатая голова,
   грудь с ядром под плитами. */
HB_MODEL.warden=function(g,m,t,B,U){
  const ph=B.phase||1,sy=(m.hbB?(hbBounds(m).floor-m.y)/U:-19)+2,coreOpen=ph>=3||B.weak>0;
  const P=hbPose(m,{core:coreOpen?(ph>=3?1:0.7):0,hunch:(B.fist&&B.fist.k<0?-B.fist.k:0)*0.6+(B.stagT>0?0.8:0)},6);
  g.beginPath();g.rect(-300,-400,600,400+sy);g.clip();
  const rock='#2c2420',rockL='#4a3c34',rockD='#140e0c',mag='#ff7a1a';
  g.translate(0,P.hunch*4);g.rotate(P.hunch*0.05);
  const seam=(pts,w)=>{g.strokeStyle='#ff9a2a';g.lineWidth=w||1.8;g.lineJoin='round';g.lineCap='round';g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.stroke();
    olLight(g,(g)=>{g.strokeStyle='rgba(255,'+(110+Math.floor(50*Math.sin(t*2.6+pts[0][0])))+',30,.4)';g.lineWidth=(w||1.8)*2.6;g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)g.lineTo(pts[i][0],pts[i][1]);g.stroke();});};
  const plate=(pts,c)=>{hbPoly(g,pts);g.fillStyle=c;g.fill();g.strokeStyle=rockD;g.lineWidth=1.2;g.stroke();
    g.strokeStyle='rgba(255,255,255,.08)';g.lineWidth=1;g.beginPath();g.moveTo(pts[0][0],pts[0][1]);g.lineTo(pts[1][0],pts[1][1]);g.stroke();};
  /* цельный каменный торс: грудные плиты и пресс, между ними тонкие швы магмы */
  const torso=[[-30,-12],[-36,-40],[-42,-66],[-28,-84],[0,-90],[28,-84],[42,-66],[36,-40],[30,-12]];
  hbPoly(g,torso);g.fillStyle=hbLin(g,-30,-90,30,-12,[[0,'#4a3e36'],[0.5,rock],[1,'#1a1210']]);g.fill();g.strokeStyle=rockD;g.lineWidth=1.4;g.stroke();
  g.save();hbPoly(g,torso);g.clip();
  /* объём плит: светлее грудные пластины, темнее пресс */
  for(const [x,y,rx,ry] of [[-18,-70,16,11],[18,-70,16,11],[-14,-44,10,7],[14,-44,10,7],[-12,-28,9,6],[12,-28,9,6]]){g.fillStyle='rgba(255,240,220,.07)';g.beginPath();g.ellipse(x,y-2,rx,ry,0,Math.PI,TAU);g.fill();}
  for(const p of [[[0,-88],[0,-52]],[[-40,-60],[-22,-55],[-7,-52],[0,-50],[7,-52],[22,-55],[40,-60]],[[0,-50],[0,-13]],[[-30,-38],[-11,-36],[0,-36],[11,-36],[30,-38]],
    [[-28,-24],[-11,-22],[0,-23],[11,-22],[28,-24]],[[-27,-85],[-23,-71],[-40,-62]],[[27,-85],[23,-71],[40,-62]],[[-36,-46],[-28,-50]],[[36,-46],[28,-50]],[[-24,-15],[-20,-23]],[[24,-15],[20,-23]]])seam(p,1.1);
  g.restore();
  /* ядро в груди: при уязвимости плиты расходятся */
  {const cx=0,cy=-64,r=11,pk=0.5+0.5*Math.sin(t*(coreOpen?7:3)),k=P.core;
    if(k>0.05){const gr=g.createRadialGradient(cx,cy,1,cx,cy,r*1.3);gr.addColorStop(0,'#fffbe8');gr.addColorStop(0.35,'#ffe060');gr.addColorStop(0.75,'#ff7a1a');gr.addColorStop(1,'#8a2a08');
      g.globalAlpha*=Math.min(1,k*1.5);g.fillStyle=gr;g.beginPath();g.arc(cx,cy,r*(0.9+pk*0.08)*k,0,TAU);g.fill();g.globalAlpha/=Math.min(1,k*1.5);mobGlow(g,cx,cy,r*(1.5+k*2.5),'#ffd040',0.25+0.5*k);}
    else mobGlow(g,cx,cy,r*1.4,'#ff7a1a',0.18+0.1*pk);
    const op=k*8;if(k>0.05)for(let q=0;q<5;q++){const a=q/5*TAU-Math.PI/2;g.save();g.translate(cx+Math.cos(a)*(r*0.6+op),cy+Math.sin(a)*(r*0.6+op));g.rotate(a);
      g.fillStyle=q%2?rockL:'#3a2e28';g.beginPath();g.moveTo(-3,-5);g.lineTo(6,-4);g.lineTo(5,5);g.lineTo(-3,4);g.closePath();g.fill();g.strokeStyle=rockD;g.lineWidth=0.9;g.stroke();g.restore();}}
  seam([[-30,-22],[-26,-32],[-29,-40]]);seam([[26,-24],[22,-34],[27,-42]]);
  {const hx=0,hy=-94;
    g.fillStyle='#5a4a42';for(const s of [-1,1]){g.beginPath();g.moveTo(hx+s*7,hy-6);g.quadraticCurveTo(hx+s*20,hy-10,hx+s*18,hy-26);g.quadraticCurveTo(hx+s*14,hy-14,hx+s*3,hy-8);g.closePath();g.fill();
      g.strokeStyle='rgba(255,255,255,.12)';g.lineWidth=1;g.beginPath();g.moveTo(hx+s*9,hy-7);g.quadraticCurveTo(hx+s*18,hy-11,hx+s*17,hy-22);g.stroke();}
    g.fillStyle=hbVol(g,hx,hy,14,rock);g.beginPath();g.moveTo(hx-11,hy+9);g.lineTo(hx-12,hy-5);g.lineTo(hx-6,hy-11);g.lineTo(hx+6,hy-11);g.lineTo(hx+12,hy-5);g.lineTo(hx+11,hy+9);g.lineTo(hx,hy+12);g.closePath();g.fill();
    g.strokeStyle=rockD;g.lineWidth=1;g.stroke();
    g.fillStyle=rockD;g.beginPath();g.moveTo(hx-12,hy-4);g.lineTo(hx+12,hy-4);g.lineTo(hx+10,hy+0.5);g.lineTo(hx-10,hy+0.5);g.closePath();g.fill();
    const eg=ph>=3?'#fff0a0':'#ffb030';for(const s of [-1,1]){g.fillStyle=eg;g.beginPath();g.moveTo(hx+s*2,hy-1);g.lineTo(hx+s*8,hy-2.4);g.lineTo(hx+s*7,hy+0.4);g.closePath();g.fill();mobGlow(g,hx+s*5,hy-1,10,eg,0.85);}
    g.strokeStyle=rockD;g.lineWidth=1.4;g.beginPath();g.moveTo(hx-5,hy+6);g.quadraticCurveTo(hx,hy+4+(m.tele||0)*2,hx+5,hy+6);g.stroke();}
  for(const s of [-1,1]){const x=s*40,y=-80;g.fillStyle=hbVol(g,x-s*4,y-4,20,rockL);
    g.beginPath();g.moveTo(x-18,y+8);g.lineTo(x-20,y-6);g.lineTo(x-10,y-17);g.lineTo(x+8,y-18);g.lineTo(x+19,y-7);g.lineTo(x+18,y+8);g.lineTo(x+6,y+15);g.lineTo(x-8,y+14);g.closePath();g.fill();
    g.strokeStyle=rockD;g.lineWidth=1.3;g.stroke();g.strokeStyle='rgba(255,255,255,.1)';g.beginPath();g.moveTo(x-18,y-4);g.lineTo(x-9,y-15);g.lineTo(x+6,y-16);g.stroke();
    seam([[x-8,y-6],[x-2,y],[x+6,y-4]],1.3);
    /* кандалы: железное кольцо, к нему крепится цепь */
    {const cx=x-s*12,cy=y+13;g.strokeStyle='#2a2a32';g.lineWidth=4;g.beginPath();g.ellipse(cx,cy,5,3.4,0,0,TAU);g.stroke();g.strokeStyle='#8a8a98';g.lineWidth=1.6;g.stroke();
      g.fillStyle='rgba(255,255,255,.35)';g.fillRect(cx-3,cy-3.6,3,1);}}
  for(let k=0;k<5;k++){const x=-28+k*14,d=((t*12+k*9)%32);g.fillStyle='rgba(255,150,40,.9)';g.beginPath();g.ellipse(x,-44+d,1.3,2.8,0,0,TAU);g.fill();}
};
HB_PRE.warden=function(g,m,t,B,U){
  if(!m.hbB)return;const R=hbBounds(m),f=m.facing||1;
  for(const s of [-1,1]){const sx=(s*40-s*12)*U*f,sy=-70*U,ax=(s*f<0?R.minX-m.w*0.5:R.maxX+m.w*0.5)-m.x+(s*f<0?10:-10),ay=R.top-m.y+60;
    const mx=(sx+ax)/2,my=Math.max(sy,ay)+70+Math.sin(t*0.9+s)*8;
    g.strokeStyle='#2a2a32';g.lineWidth=6;g.setLineDash([10,6]);g.lineDashOffset=s*t*4;g.beginPath();g.moveTo(ax,ay);g.quadraticCurveTo(mx,my,sx,sy);g.stroke();
    g.strokeStyle='#7a7a88';g.lineWidth=2.4;g.stroke();g.setLineDash([]);}
};
HB_POST.warden=function(g,m,t,B,U){
  const R=m.hbB?hbBounds(m):{floor:m.y-m.h*0.19,minX:m.x-300,maxX:m.x+300},f=m.facing||1,surf=R.floor-m.y;
  const rock='#2c2420',rockL='#4a3c34',rockD='#140e0c';
  const P=m.ps||{};
  g.save();g.beginPath();g.rect(-2000,-2000,4000,2000+surf+4);g.clip();   /* всё, что под лавой, не видно */
  for(let i=0;i<2;i++){const s=i?1:-1,shx=s*48*U*f,shy=-78*U+(P.hunch||0)*4*U;
    let fx=shx+s*f*4*U+Math.sin(t*1.3+i)*4,fy=surf-14+Math.sin(t*1.7+i*2)*4;
    const act=B.fist&&((B.fist.side>0)===(s*f>0));
    if(act){const tx=B.fist.x-m.x,ty=B.fist.y-m.y-16;
      if(B.fist.k<0){const k=-B.fist.k;fx=lerp(fx,shx+s*f*8,k);fy=lerp(fy,shy-62*U*k,k);}else{const k=eOut(B.fist.k);fx=lerp(fx,tx,k);fy=lerp(fy,ty,k);}}
    if(B.raise>0){fx=lerp(fx,shx*0.6,B.raise);fy=lerp(fy,shy-50*U,B.raise);}
    if(B.sweepK&&s*f>0){const k=B.sweepK,ty=(B.sweepY||m.y)-m.y;if(k<0){fx=lerp(fx,-f*90*U,-k);fy=lerp(fy,ty,-k);}else{fx=lerp(-f*90*U,f*(R.maxX-R.minX)*0.6,eOut(k));fy=ty;}}
    if(B.stagT>0){fy=surf-4;}
    const [ex,ey]=hbIK(shx,shy,fx,fy,42*U,42*U,s*f>0?-1:1);
    const seg=(x1,y1,x2,y2,w,c)=>{const a=Math.atan2(y2-y1,x2-x1),L=Math.hypot(x2-x1,y2-y1);g.save();g.translate(x1,y1);g.rotate(a);
      g.fillStyle=c;g.beginPath();g.moveTo(-w*0.5,-w);g.lineTo(L*0.5,-w*1.08);g.lineTo(L+w*0.3,-w*0.9);g.lineTo(L+w*0.4,w*0.9);g.lineTo(L*0.5,w*1.05);g.lineTo(-w*0.5,w);g.closePath();g.fill();g.strokeStyle=rockD;g.lineWidth=1.4;g.stroke();
      g.strokeStyle='#ff9a2a';g.lineWidth=1.6;g.beginPath();g.moveTo(L*0.48,-w);g.lineTo(L*0.52,w);g.stroke();
      olLight(g,(g)=>{g.strokeStyle='rgba(255,130,30,.55)';g.lineWidth=4;g.beginPath();g.moveTo(L*0.48,-w);g.lineTo(L*0.52,w);g.stroke();});g.restore();};
    seg(shx,shy,ex,ey,11*U,rock);seg(ex,ey,fx,fy,10*U,rockL);
    g.fillStyle=hbVol(g,fx,fy,15*U,rockL);g.beginPath();g.moveTo(fx-13*U,fy-10*U);g.lineTo(fx+10*U,fy-13*U);g.lineTo(fx+15*U,fy+2*U);g.lineTo(fx+9*U,fy+13*U);g.lineTo(fx-10*U,fy+12*U);g.lineTo(fx-15*U,fy);g.closePath();g.fill();
    g.strokeStyle=rockD;g.lineWidth=1.4;g.stroke();
    g.strokeStyle='#ff9a2a';g.lineWidth=1.2;for(let k=0;k<3;k++){g.beginPath();g.moveTo(fx-9*U+k*7*U,fy-11*U);g.lineTo(fx-8*U+k*7*U,fy-4*U);g.stroke();}
    if(act&&B.fist.k>0.9)mobGlow(g,fx,fy,46*U,'#ff7a1a',0.6);}
  g.restore();
  olLight(g,(g)=>{softGlow(g,0,surf,m.w*0.85,'#ff6a10',0.55);});
  g.fillStyle='rgba(255,140,40,.9)';g.beginPath();g.ellipse(0,surf,m.w*0.44,7+Math.sin(t*3)*1.5,0,0,TAU);g.fill();
  g.fillStyle='rgba(255,224,130,.75)';for(let k=0;k<6;k++){const x=(k-2.5)*m.w*0.14+Math.sin(t*2+k)*4;g.beginPath();g.arc(x,surf-1+Math.sin(t*5+k)*1.5,2+((k*7)%3),0,TAU);g.fill();}
};

/* ======================= АРХИДЕМОН ИНФЕРНАЛИС =======================
   Багровый мускулистый демон: козлиные ноги с копытами, хвост с наконечником,
   железные наплечники с шипами и нагрудник с рунами, пояс с черепом и набедренник,
   бараньи рога и огненная корона, огромные крылья из лопаток, чёрный клинок с пламенем. */
HB_MODEL.archdemon=function(g,m,t,B,U){
  const ph=B.phase||1,air=B.flap>0||!!B.diving;
  const walk=m.onGround&&Math.abs(m.vx)>30;
  const sw=B.swing||0,raise=clamp(B.raise||0,0,1);
  const P=hbPose(m,{open:(B.wings===undefined?1:B.wings)*(air?1:sw<0||raise>0.3?0.95:0.35),swing:sw,raise:raise,breath:B.breath?1:0,
    crouch:(B.atk==='stomp'&&B.sub===1?(m.tele||0):0)+(B.stagT>0?0.6:0),lean:clamp((m.svx||0)*0.0005,-0.2,0.2)+(B.diving?0.35:0)},sw!==0?16:8);
  const flap=air?Math.sin(t*(B.diving?12:4.2))*0.35:Math.sin(t*1.2)*0.04;
  const skin='#9a2a30',skinD='#5a1418',iron='#3a3438',ironL='#6a6068',bone='#e8dcc0',fire='#ff6a1a';
  g.translate(0,P.crouch*5);g.rotate(P.lean);
  hbWing(g,-1,P.open,-flap*0.9,1.12,'#5a1418','#2a1414',{torn:ph>=3,burn:ph>=4});
  hbWing(g,1,P.open,flap,1.25,'#7e1e24','#3a1a18',{torn:ph>=3,burn:ph>=4});
  {const pts=hbRope(m,'tail',-8,-40,8,8,U,{grav:500,damp:0.9,curl:1.4,amp:46,seed:1,stiff:0.12,sx:-0.9,sy:0.35});
    hbTube(g,pts,4.6,1.4,skinD,'rgba(255,140,120,.25)');const e=pts[pts.length-1],p2=pts[pts.length-2],a=Math.atan2(e[1]-p2[1],e[0]-p2[0]);
    g.save();g.translate(e[0],e[1]);g.rotate(a);g.fillStyle='#2a1a1c';g.beginPath();g.moveTo(-2,0);g.lineTo(4,-7);g.lineTo(12,0);g.lineTo(4,7);g.closePath();g.fill();g.strokeStyle='#0a0606';g.lineWidth=0.8;g.stroke();g.restore();}
  const leg=(s)=>{const far=s<0,c=far?skinD:skin,ph2=m.anim*7+(far?Math.PI:0);
    const hx=s*9,hy=-40;let fx=s*12,fy=0;
    if(walk){fx+=Math.sin(ph2)*9;fy=-Math.max(0,Math.cos(ph2))*6;}
    if(!m.onGround&&!air){fx=s*10+4;fy=-10;}
    if(air){fx=s*6-4;fy=-12;}
    const kx=hx+s*4+3,ky=hy+12+P.crouch*3,ax=fx-3,ay=fy-11;
    hbMuscle(g,hx,hy,kx,ky,8,9,6,c,far?null:'rgba(255,160,140,.25)');hbMuscle(g,kx,ky,ax,ay,6,5,3.6,c);hbLimb(g,ax,ay,fx,fy-2,3.6,3,c);
    g.fillStyle='#1a0e10';g.beginPath();g.moveTo(fx-4.5,fy-3.4);g.lineTo(fx+5,fy-3.4);g.lineTo(fx+6,fy);g.lineTo(fx-5,fy);g.closePath();g.fill();
    g.fillStyle='rgba(255,255,255,.12)';g.fillRect(fx-4,fy-3.2,8,0.8);};
  leg(-1);
  {const up=P.raise,sx=-19,sy=-70,hx=lerp(-24,-14,up),hy=lerp(-40,-104,up);const [ex,ey]=hbIK(sx,sy,hx,hy,16,16,1);
    hbMuscle(g,sx,sy,ex,ey,6,7,4.6,skinD);hbMuscle(g,ex,ey,hx,hy,4.6,5,3.6,skinD);g.fillStyle=iron;g.fillRect(lerp(ex,hx,0.45)-4,lerp(ey,hy,0.45)-3,8,6);
    g.strokeStyle=bone;g.lineWidth=1.3;g.lineCap='round';for(let k=-1;k<=2;k++){g.beginPath();g.moveTo(hx,hy);g.lineTo(hx+k*2.4,hy-(up>0.5?6:-6));g.stroke();}
    if(up>0.3){mobGlow(g,hx,hy-8,26,fire,0.6*up);hbFlame(g,hx,hy-6,4,13,t,3,fire,'#ffd060');}}
  g.fillStyle=hbVol(g,0,-60,30,skin);g.beginPath();g.moveTo(-14,-40);g.quadraticCurveTo(-26,-56,-24,-72);g.quadraticCurveTo(0,-82,26,-72);g.quadraticCurveTo(24,-56,14,-40);g.closePath();g.fill();
  g.strokeStyle=skinD;g.lineWidth=1;g.beginPath();g.moveTo(0,-62);g.lineTo(0,-44);for(const y of [-56,-50,-45]){g.moveTo(-8,y);g.quadraticCurveTo(0,y+2,9,y);}g.stroke();
  g.strokeStyle='rgba(255,170,150,.3)';g.lineWidth=1.2;g.beginPath();g.moveTo(-10,-58);g.quadraticCurveTo(-6,-54,-2,-56);g.stroke();
  olLight(g,(g)=>{g.strokeStyle='rgba(255,'+(90+Math.floor(40*Math.sin(t*2.4)))+',30,'+(ph>=4?0.75:0.4)+')';g.lineWidth=0.9;g.beginPath();g.moveTo(-12,-44);g.lineTo(-8,-50);g.lineTo(-12,-56);g.moveTo(13,-45);g.lineTo(9,-52);g.stroke();});
  g.fillStyle=hbLin(g,0,-80,0,-58,[[0,ironL],[0.5,iron],[1,'#24202a']]);
  g.beginPath();g.moveTo(-20,-74);g.quadraticCurveTo(0,-82,22,-74);g.lineTo(19,-60);g.quadraticCurveTo(0,-55,-17,-60);g.closePath();g.fill();g.strokeStyle='#121014';g.lineWidth=1;g.stroke();
  g.fillStyle='#8a7a6a';for(const [x,y] of [[-16,-71],[18,-71],[-13,-62],[15,-62]]){g.beginPath();g.arc(x,y,0.9,0,TAU);g.fill();}
  olLight(g,(g)=>{g.strokeStyle='rgba(255,140,40,'+(0.65+0.25*Math.sin(t*3))+')';g.lineWidth=1.1;g.beginPath();
    for(const ox of [-10,6]){g.moveTo(ox,-72);g.lineTo(ox+2,-66);g.lineTo(ox+4,-72);g.moveTo(ox+2,-66);g.lineTo(ox+2,-63);}g.stroke();});
  g.fillStyle='#3a2a20';g.fillRect(-16,-45,32,6);g.fillStyle='#6a5a4a';for(let k=-2;k<=2;k++){g.beginPath();g.arc(k*6,-42,0.8,0,TAU);g.fill();}
  g.fillStyle=hbLin(g,0,-40,0,-18,[[0,'#5a3e2a'],[1,'#2e1e14']]);g.beginPath();g.moveTo(-8,-40);g.lineTo(9,-40);g.lineTo(11,-22);g.lineTo(5,-25);g.lineTo(1,-19);g.lineTo(-3,-24);g.lineTo(-9,-21);g.closePath();g.fill();
  g.fillStyle=bone;g.beginPath();g.arc(1,-42,4.2,0,TAU);g.fill();g.fillRect(-1.6,-39,5.2,2.4);g.fillStyle='#1a0808';g.beginPath();g.arc(-0.6,-42.4,1.2,0,TAU);g.arc(2.6,-42.4,1.2,0,TAU);g.fill();
  leg(1);
  for(const s of [-1,1]){const x=s*22,y=-73;g.fillStyle=hbVol(g,x,y,11,ironL);g.beginPath();g.ellipse(x,y,11,7.5,s*0.35,0,TAU);g.fill();g.strokeStyle='#121014';g.lineWidth=1;g.stroke();
    g.strokeStyle='rgba(255,255,255,.18)';g.beginPath();g.ellipse(x,y,9,5.5,s*0.35,Math.PI*1.1,Math.PI*1.7);g.stroke();
    g.fillStyle=bone;for(let k=0;k<3;k++){const bx=x+s*(k*4-2),by=y-6+k;g.beginPath();g.moveTo(bx-1.8,by);g.lineTo(bx+s*2,by-9+k*1.5);g.lineTo(bx+1.8,by);g.fill();}}
  {const hx=4,hy=-84,jaw=P.breath*6+(m.tele||0)*2.4,ec=ph>=4?'#ffffff':'#ffd040';
    g.save();g.translate(hx,hy);g.scale(1.25,1.25);
    hbHorn(g,[[-4,-6],[-10,-12],[-16,-11],[-18,-5],[-15,0],[-11,0],[-9,-3]],3.4,'#a89070','#3a2e24');
    for(let k=0;k<5;k++)hbFlame(g,-6+k*3.2,-9,1.8,7+(k%2)*4,t,k+7,fire,'#ffe080');mobGlow(g,0,-14,18,fire,0.5);
    g.fillStyle=hbVol(g,0,-2,10,skin);
    g.beginPath();g.moveTo(-7,-8);g.quadraticCurveTo(0,-11,7,-8);g.lineTo(10,-3);g.lineTo(9,2);g.lineTo(5,6);g.lineTo(-5,6);g.lineTo(-9,2);g.lineTo(-10,-3);g.closePath();g.fill();
    g.strokeStyle=skinD;g.lineWidth=0.6;g.stroke();
    g.fillStyle='#2a0608';g.beginPath();g.moveTo(-8,-5);g.lineTo(8,-5);g.lineTo(6,-2.6);g.lineTo(-6,-2.6);g.closePath();g.fill();
    for(const ex of [-3.6,3.6]){g.fillStyle=ec;g.beginPath();g.moveTo(ex-2.2,-3.4);g.lineTo(ex+2.2,-3.8);g.lineTo(ex+1.4,-2.2);g.closePath();g.fill();mobGlow(g,ex,-3,7,'#ffa020',0.9);}
    g.fillStyle=skinD;g.beginPath();g.moveTo(-1,-1);g.lineTo(1,-1);g.lineTo(0.5,1.6);g.lineTo(-0.5,1.6);g.fill();
    g.save();g.translate(0,3.6);g.fillStyle=skinD;g.beginPath();g.moveTo(-5,0);g.lineTo(5,0);g.lineTo(4,3+jaw*0.4);g.lineTo(-4,3+jaw*0.4);g.closePath();g.fill();
    if(jaw>1){g.fillStyle='#ffb040';g.beginPath();g.ellipse(0,1.6+jaw*0.15,3.4,jaw*0.25,0,0,TAU);g.fill();mobGlow(g,0,2,14,'#ffa030',0.85);}
    g.fillStyle='#f6ead4';for(const x of [-3.6,3.6]){g.beginPath();g.moveTo(x-0.9,0);g.lineTo(x,-2.6);g.lineTo(x+0.9,0);g.fill();g.beginPath();g.moveTo(x-0.8,0.2);g.lineTo(x,2.8);g.lineTo(x+0.8,0.2);g.fill();}g.restore();
    hbHorn(g,[[4,-6],[10,-12],[16,-11],[18,-5],[15,0],[11,0],[9,-3]],3.6,'#cbb08a','#4a3a2c');
    hbHorn(g,[[3,-8],[5,-14],[7,-20],[10,-24]],1.8,'#d8c4a0','#4a3a2c');hbHorn(g,[[-3,-8],[-5,-14],[-7,-20],[-10,-24]],1.8,'#b8a484','#3a2e24');
    g.restore();}
  {const swg=P.swing,sx=20,sy=-70;let hx,hy,ang;
    if(swg<0){const k=-swg;hx=lerp(26,10,k);hy=lerp(-44,-106,k);ang=lerp(0.7,-2.4,k);}
    else if(swg>0){const k=eOut(swg);hx=lerp(10,36,k);hy=lerp(-106,-40,k);ang=lerp(-2.4,0.85,k);}
    else{hx=26;hy=-44+Math.sin(t*1.4);ang=air?-0.25:0.7;}
    if(B.atk==='breath'){hx=24;hy=-48;ang=1.1;}
    const [ex,ey]=hbIK(sx,sy,hx,hy,17,16,-1);hbMuscle(g,sx,sy,ex,ey,6.4,7.6,5,skin,'rgba(255,170,150,.3)');hbMuscle(g,ex,ey,hx,hy,5,5.6,4.2,skin);
    g.fillStyle=iron;g.save();g.translate(lerp(ex,hx,0.5),lerp(ey,hy,0.5));g.rotate(Math.atan2(hy-ey,hx-ex));g.fillRect(-5,-4.4,10,8.8);g.fillStyle='#8a7a6a';g.fillRect(-4,-4.4,1,8.8);g.fillRect(3,-4.4,1,8.8);g.restore();
    g.save();g.translate(hx,hy);g.rotate(ang);
    g.fillStyle='#3a2418';g.fillRect(-11,-2.2,13,4.4);g.fillStyle='#c8a050';g.beginPath();g.arc(-12,0,2.8,0,TAU);g.fill();
    g.fillStyle=ironL;g.beginPath();g.moveTo(2,-10);g.lineTo(6,-8);g.lineTo(6,8);g.lineTo(2,10);g.closePath();g.fill();
    g.fillStyle=hbLin(g,0,-6,0,6,[[0,'#4a4048'],[0.5,'#141014'],[1,'#2e262c']]);g.beginPath();g.moveTo(6,-5.2);g.lineTo(70,-3.6);g.lineTo(82,0);g.lineTo(70,3.6);g.lineTo(6,5.2);g.closePath();g.fill();
    olLight(g,(g)=>{g.strokeStyle='rgba(255,'+(130+Math.floor(60*Math.sin(t*9)))+',40,.95)';g.lineWidth=1.8;g.beginPath();g.moveTo(8,-4.8);g.lineTo(70,-3.4);g.lineTo(81,0);g.stroke();
      g.strokeStyle='rgba(255,210,90,.8)';g.lineWidth=0.8;g.beginPath();g.moveTo(10,0);g.lineTo(64,0);g.stroke();});
    for(let k=0;k<7;k++)hbFlame(g,14+k*9.5,-3.4,2.6,7+((k*5)%4),t,k+11,hexA(fire,0.9),hexA('#ffd060',0.9));
    if(swg>0.15&&swg<0.98)olLight(g,(g)=>{g.strokeStyle='rgba(255,170,70,'+(0.55*(1-swg))+')';g.lineWidth=14;g.beginPath();g.arc(-8,0,74,-1.4,0.1);g.stroke();});
    g.restore();}
  if(ph>=4){olLight(g,(g)=>{g.strokeStyle='rgba(255,130,40,.75)';g.lineWidth=1.2;g.beginPath();g.moveTo(-6,-70);g.lineTo(-2,-62);g.lineTo(-8,-52);g.moveTo(10,-66);g.lineTo(6,-56);g.moveTo(-10,-32);g.lineTo(-14,-20);g.stroke();});}
  if(m.tele>0.05)mobGlow(g,4,-60,72,fire,m.tele*0.28);
};
