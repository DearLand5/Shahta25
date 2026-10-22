'use strict';
/* ============================================================
   Модели мобов Розария (Лиловые небеса): Розовая гончая, Безликий садовник, Лепестковая дева.
   Оба облика в одной функции, T — Истина. Помощники начинаются с lmRosary.
   ============================================================ */
/* плавное приближение значения к цели (хранится в мобе) */
function lmRosaryE(m,key,tgt,t,rate){
  const k1='_lr'+key,k2='_lrt'+key,o=m[k1],pt=m[k2];
  if(o===undefined||!isFinite(o)||pt===undefined||Math.abs(t-pt)>0.5){m[k1]=tgt;m[k2]=t;return tgt;}
  const dt=t-pt;if(dt<=0)return o;
  const v=o+(tgt-o)*(1-Math.exp(-rate*dt));m[k1]=v;m[k2]=t;return v;
}
/* детерминированный шум 0..1 */
function lmRosaryR(i,s){const x=Math.sin(i*127.1+(s||0)*311.7)*43758.5453;return x-Math.floor(x);}
/* лист: основание в (x,y), направление ang, длина L, ширина w; светлая половина и жилка (без save/restore) */
function lmRosaryLeaf(g,x,y,ang,L,w,c,cl,vein){
  const cs=Math.cos(ang),sn=Math.sin(ang),P=(u,v)=>[x+cs*u-sn*v,y+sn*u+cs*v];
  const a=P(L*0.22,-w),b=P(L*0.7,-w*0.85),e=P(L,0),d=P(L*0.7,w*0.85),f=P(L*0.22,w);
  g.beginPath();g.moveTo(x,y);g.bezierCurveTo(a[0],a[1],b[0],b[1],e[0],e[1]);g.bezierCurveTo(d[0],d[1],f[0],f[1],x,y);g.closePath();
  g.fillStyle=c;g.fill();
  if(cl){const q=P(L*0.5,-w*0.1);g.fillStyle=cl;g.beginPath();g.moveTo(x,y);g.bezierCurveTo(a[0],a[1],b[0],b[1],e[0],e[1]);g.quadraticCurveTo(q[0],q[1],x,y);g.fill();}
  if(vein){const s=P(L*0.08,0),t2=P(L*0.85,0);g.strokeStyle=vein;g.lineWidth=0.25;g.beginPath();g.moveTo(s[0],s[1]);g.lineTo(t2[0],t2[1]);g.stroke();}
}
/* шипик: основание (x,y), направление ang, длина L, ширина w */
function lmRosaryThorn(g,x,y,ang,L,w,c){
  const ca=Math.cos(ang),sa=Math.sin(ang);
  g.fillStyle=c;g.beginPath();g.moveTo(x-sa*w,y+ca*w);g.quadraticCurveTo(x+ca*L*0.5-sa*w*0.3,y+sa*L*0.5+ca*w*0.3,x+ca*L,y+sa*L);g.quadraticCurveTo(x+ca*L*0.5+sa*w*0.1,y+sa*L*0.5-ca*w*0.1,x+sa*w,y-ca*w);g.closePath();g.fill();
}
/* роза: c — основной цвет (hex). wilt>0 — увядшая (без блика) */
function lmRosaryRose(g,x,y,r,c,wilt){
  const w=wilt||0,cd=shadeHex(c,-0.5),cm=shadeHex(c,-0.26),cl=shadeHex(c,w?0.12:0.34);
  g.beginPath();for(let i=0;i<=20;i++){const a=i/20*TAU,rr=r*(1+0.1*Math.sin(a*5+0.6));i?g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr*0.94):g.moveTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr*0.94);}
  g.closePath();g.fillStyle=cm;g.fill();
  g.save();g.clip();
  g.fillStyle=c;g.beginPath();g.ellipse(x-r*0.18,y-r*0.22,r*0.92,r*0.84,0,0,TAU);g.fill();
  g.fillStyle=cl;g.globalAlpha=0.7;g.beginPath();g.ellipse(x-r*0.4,y-r*0.46,r*0.46,r*0.34,-0.6,0,TAU);g.fill();g.globalAlpha=1;
  g.restore();
  g.lineCap='round';
  /* спираль лепестков: тёмная щель и светлая кромка */
  for(const [rx,ry,rr,a0,a1] of [[0.1,0.05,0.72,3.3,6.1],[-0.06,-0.04,0.48,0.2,3.6],[0.06,0.04,0.28,2.6,6.2]]){
    g.strokeStyle=cd;g.lineWidth=Math.max(0.3,r*0.12);g.beginPath();g.arc(x+r*rx,y+r*ry,r*rr,a0,a1);g.stroke();
    if(!w){g.strokeStyle=cl;g.lineWidth=Math.max(0.25,r*0.09);g.beginPath();g.arc(x+r*rx-r*0.08,y+r*ry-r*0.1,r*rr,a0+0.4,a0+1.5);g.stroke();}}
  g.strokeStyle=shadeHex(c,-0.72);g.lineWidth=0.5;g.lineJoin='round';
  g.beginPath();for(let i=0;i<=20;i++){const a=i/20*TAU,rr=r*(1+0.1*Math.sin(a*5+0.6));i?g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr*0.94):g.moveTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr*0.94);}g.closePath();g.stroke();
  if(!w){g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.ellipse(x-r*0.4,y-r*0.5,r*0.2,r*0.1,-0.7,0,TAU);g.fill();}
}
/* лоза по точкам: тёмная основа, цвет, светлая нить сверху и шипы; th — длина шипов, 0 — без */
function lmRosaryVine(g,pts,w,c,th,seed,cth){
  const n=pts.length;if(n<2)return;
  const path=()=>{g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<n-1;i++){const mx=(pts[i][0]+pts[i+1][0])/2,my=(pts[i][1]+pts[i+1][1])/2;g.quadraticCurveTo(pts[i][0],pts[i][1],mx,my);}g.lineTo(pts[n-1][0],pts[n-1][1]);};
  g.lineCap='round';g.lineJoin='round';
  g.strokeStyle=shadeHex(c,-0.55);g.lineWidth=w+0.9;path();g.stroke();
  g.strokeStyle=c;g.lineWidth=w;path();g.stroke();
  g.save();g.translate(-w*0.18,-w*0.22);g.strokeStyle=shadeHex(c,0.32);g.lineWidth=Math.max(0.25,w*0.32);path();g.stroke();g.restore();
  if(th>0){for(let i=1;i<n-1;i++){const a=Math.atan2(pts[i+1][1]-pts[i-1][1],pts[i+1][0]-pts[i-1][0]),sd=((i+(seed||0))%2)?1:-1,L=th*(0.7+0.6*lmRosaryR(i,seed||0));
    lmRosaryThorn(g,pts[i][0],pts[i][1],a+sd*(1.25+0.3*lmRosaryR(i,3)),L,Math.max(0.35,w*0.45),cth||shadeHex(c,-0.2));}}
}
/* трубка с объёмом: ровная заливка, светлая полоса со стороны света, тёмная — с другой, тонкий контур */
function lmRosaryTube(g,x0,y0,x1,y1,wa,wb,c,o){
  o=o||{};const an=Math.atan2(y1-y0,x1-x0),nx=-Math.sin(an),ny=Math.cos(an),mx=(x0+x1)/2,my=(y0+y1)/2,b=Math.max(wa,wb)*0.5*(o.bg||1);
  const path=()=>{g.beginPath();g.moveTo(x0+nx*wa/2,y0+ny*wa/2);g.quadraticCurveTo(mx+nx*b,my+ny*b,x1+nx*wb/2,y1+ny*wb/2);g.lineTo(x1-nx*wb/2,y1-ny*wb/2);g.quadraticCurveTo(mx-nx*b,my-ny*b,x0-nx*wa/2,y0-ny*wa/2);g.closePath();};
  path();g.fillStyle=c;g.fill();
  const s=(nx+ny)<0?1:-1,w=(wa+wb)/2,wa2=wa*0.5,wb2=wb*0.5;
  g.lineCap='butt';
  g.strokeStyle=shadeHex(c,-0.3);g.lineWidth=w*0.4;g.beginPath();g.moveTo(x0-s*nx*wa2*0.56,y0-s*ny*wa2*0.56);g.lineTo(x1-s*nx*wb2*0.56,y1-s*ny*wb2*0.56);g.stroke();
  g.strokeStyle=shadeHex(c,0.38);g.lineWidth=w*0.2;g.beginPath();g.moveTo(x0+s*nx*wa2*0.5,y0+s*ny*wa2*0.5);g.lineTo(x1+s*nx*wb2*0.5,y1+s*ny*wb2*0.5);g.stroke();
  g.strokeStyle=o.line||shadeHex(c,-0.78);g.lineWidth=o.lw||0.4;g.lineJoin='round';path();g.stroke();
}
/* кость: трубка с талией и расширенными концами-мыщелками */
function lmRosaryBone(g,x0,y0,x1,y1,w,c,kn){
  lmRosaryTube(g,x0,y0,x1,y1,w,w*0.85,c,{bg:0.7});
  if(kn!==false){for(const [kx,ky,kr] of [[x0,y0,w*0.56],[x1,y1,w*0.5]]){g.beginPath();g.ellipse(kx,ky,kr,kr*0.9,0.4,0,TAU);g.fillStyle=c;g.fill();
    g.strokeStyle=shadeHex(c,0.4);g.lineWidth=0.4;g.beginPath();g.arc(kx,ky,kr*0.7,3.4,4.7);g.stroke();
    g.strokeStyle=shadeHex(c,-0.3);g.lineWidth=0.5;g.beginPath();g.arc(kx,ky,kr*0.75,0.3,1.6);g.stroke();
    g.strokeStyle=shadeHex(c,-0.78);g.lineWidth=0.4;g.beginPath();g.ellipse(kx,ky,kr,kr*0.9,0.4,0,TAU);g.stroke();}}
}
/* капля крови: тёмная струйка и капля, падающая по времени */
function lmRosaryDrip(g,x,y,t,s,len,a){
  const f=(t*0.7+s*0.37)%1,L=len*(0.35+0.65*Math.min(1,f*1.6));
  g.strokeStyle='rgba(120,6,22,'+(a||0.9)+')';g.lineWidth=0.7;g.lineCap='round';g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.sin(s)*0.2,y+L);g.stroke();
  g.fillStyle='rgba(190,16,40,'+(a||0.9)+')';g.beginPath();g.ellipse(x+Math.sin(s)*0.2,y+L+0.5,0.55,0.8,0,0,TAU);g.fill();
  g.fillStyle='rgba(255,150,160,.6)';g.beginPath();g.arc(x+Math.sin(s)*0.2-0.15,y+L+0.2,0.18,0,TAU);g.fill();
}
/* пучок листьев вдоль края эллипса: наружу торчат кончики; from..to — дуга (все листья — одним путём) */
function lmRosaryLeafEdge(g,cx,cy,rx,ry,n,seed,len,c,cl,from,to,rot){
  from=from==null?0:from;to=to==null?TAU:to;const cr=Math.cos(rot||0),sr=Math.sin(rot||0),lv=[];
  for(let i=0;i<n;i++){const a=from+(to-from)*(i+lmRosaryR(i,seed)*0.8)/n,ex=Math.cos(a)*rx,ey=Math.sin(a)*ry,x=cx+ex*cr-ey*sr,y=cy+ex*sr+ey*cr,L=len*(0.7+0.6*lmRosaryR(i,seed+4));
    const ao=Math.atan2(Math.sin(a)*ry,Math.cos(a)*rx)+(rot||0)+(lmRosaryR(i,seed+9)-0.5)*0.8,cs=Math.cos(ao),sn=Math.sin(ao);
    lv.push([x-cs*L*0.4,y-sn*L*0.4,cs,sn,L,L*0.34]);}
  const path=(half)=>{g.beginPath();for(const [x,y,cs,sn,L,w] of lv){g.moveTo(x,y);g.bezierCurveTo(x+cs*L*0.22+sn*w,y+sn*L*0.22-cs*w,x+cs*L*0.7+sn*w*0.85,y+sn*L*0.7-cs*w*0.85,x+cs*L,y+sn*L);
    if(half)g.quadraticCurveTo(x+cs*L*0.5+sn*w*0.1,y+sn*L*0.5-cs*w*0.1,x,y);else g.bezierCurveTo(x+cs*L*0.7-sn*w*0.85,y+sn*L*0.7+cs*w*0.85,x+cs*L*0.22-sn*w,y+sn*L*0.22+cs*w,x,y);}};
  g.fillStyle=c;path(false);g.fill();if(cl){g.fillStyle=cl;path(true);g.fill();}
}
/* россыпь листиков в эллипсе: свет сверху-слева, тень внизу-справа; листья одного тона собраны в один путь (быстро) */
function lmRosaryLeafField(g,cx,cy,rx,ry,n,seed,pal,size){
  const np=pal.length,groups=[];for(let i=0;i<np;i++)groups.push([]);
  for(let i=0;i<n;i++){const a=lmRosaryR(i,seed)*TAU,rr=Math.sqrt(lmRosaryR(i,seed+1))*0.95,x=cx+Math.cos(a)*rx*rr,y=cy+Math.sin(a)*ry*rr;
    const lit=clamp(0.5-(x-cx)/rx*0.32-(y-cy)/ry*0.4+(lmRosaryR(i,seed+2)-0.5)*0.5,0,0.999),ci=Math.floor(lit*np);
    const L=size*(0.7+0.7*lmRosaryR(i,seed+3)),ang=(lmRosaryR(i,seed+5)-0.5)*3.4-0.6,cs=Math.cos(ang),sn=Math.sin(ang),w=L*0.36;
    groups[ci].push([x,y,cs,sn,L,w]);}
  for(let ci=0;ci<np;ci++){const gr=groups[ci];if(!gr.length)continue;
    g.fillStyle=pal[ci];g.beginPath();
    for(const [x,y,cs,sn,L,w] of gr){g.moveTo(x,y);g.bezierCurveTo(x+cs*L*0.22+sn*w,y+sn*L*0.22-cs*w,x+cs*L*0.7+sn*w*0.85,y+sn*L*0.7-cs*w*0.85,x+cs*L,y+sn*L);g.bezierCurveTo(x+cs*L*0.7-sn*w*0.85,y+sn*L*0.7+cs*w*0.85,x+cs*L*0.22-sn*w,y+sn*L*0.22+cs*w,x,y);}
    g.fill();
    if(ci<np-1){g.fillStyle=shadeHex(pal[ci],0.16);g.beginPath();
      for(const [x,y,cs,sn,L,w] of gr){g.moveTo(x,y);g.bezierCurveTo(x+cs*L*0.22+sn*w,y+sn*L*0.22-cs*w,x+cs*L*0.7+sn*w*0.85,y+sn*L*0.7-cs*w*0.85,x+cs*L,y+sn*L);g.quadraticCurveTo(x+cs*L*0.5+sn*w*0.1,y+sn*L*0.5-cs*w*0.1,x,y);}
      g.fill();}}
}
/* двухзвенная опора: возвращает [ступня x,y, колено x,y] */
function lmRosaryIK(hx,hy,fx,fy,l1,l2,back){
  const dx=fx-hx,dy=fy-hy,d=Math.min(l1+l2-0.01,Math.max(0.5,Math.hypot(dx,dy))),a=Math.atan2(dy,dx);
  const c=Math.acos(clamp((l1*l1+d*d-l2*l2)/(2*l1*d),-1,1)),ka=a+(back?c:-c);
  return [hx+Math.cos(a)*d,hy+Math.sin(a)*d,hx+Math.cos(ka)*l1,hy+Math.sin(ka)*l1];
}
/* мышечное веретено вдоль кости: бугристый ободранный жгут с волокнами и рваным краем */
function lmRosaryMuscle(g,x0,y0,x1,y1,w,c){
  const an=Math.atan2(y1-y0,x1-x0),L=Math.hypot(x1-x0,y1-y0),cs=Math.cos(an),sn=Math.sin(an),nx=-sn,ny=cs;
  const P=(u,v)=>[x0+cs*u*L+nx*v,y0+sn*u*L+ny*v];
  g.beginPath();let p=P(0,0);g.moveTo(p[0],p[1]);
  for(const [u,v] of [[0.15,-0.42],[0.45,-0.52],[0.75,-0.4],[0.97,-0.12]]){p=P(u,v*w);g.lineTo(p[0],p[1]);}
  for(const [u,v] of [[1,0.1],[0.88,0.34],[0.7,0.52],[0.5,0.42],[0.3,0.55],[0.1,0.36]]){p=P(u,v*w);g.lineTo(p[0],p[1]);}
  g.closePath();mobPath(g,c,x0+cs*L*0.4-nx*w*0.2,y0+sn*L*0.4-ny*w*0.2,L*0.5+w*0.3,true);
  g.strokeStyle=shadeHex(c,-0.7);g.lineWidth=0.4;g.lineJoin='round';g.stroke();
  g.save();g.clip();g.strokeStyle='rgba(30,2,10,.55)';g.lineWidth=0.35;g.lineCap='round';
  for(let q=-1;q<=1;q++){const a=P(0.1,q*w*0.22),b=P(0.55,q*w*0.3),e=P(0.95,q*w*0.12);g.beginPath();g.moveTo(a[0],a[1]);g.quadraticCurveTo(b[0],b[1],e[0],e[1]);g.stroke();}
  g.strokeStyle='rgba(255,150,150,.4)';g.lineWidth=0.3;const a=P(0.15,-w*0.28),b=P(0.5,-w*0.38),e=P(0.8,-w*0.25);g.beginPath();g.moveTo(a[0],a[1]);g.quadraticCurveTo(b[0],b[1],e[0],e[1]);g.stroke();
  g.restore();
}
/* кость/светлая поверхность: заливка с объёмом и тонкий тёмный контур (общий mobPath даёт серую кайму) */
function lmRosaryBP(g,c,cx,cy,r,lw){
  mobPath(g,c,cx,cy,r,true);g.strokeStyle=shadeHex(c,-0.82);g.lineWidth=lw||0.5;g.lineJoin='round';g.stroke();
}
/* ---------- Розовая гончая ---------- */
/* лапа-лист: бедро и голень — лопастные капсулы из листвы, пухлая ступня */
function lmRosaryLobe(g,x0,y0,x1,y1,w,c,seed,n){
  const an=Math.atan2(y1-y0,x1-x0),L=Math.hypot(x1-x0,y1-y0);
  lmFluff(g,(x0+x1)/2,(y0+y1)/2,L/2+w*0.42,w/2,n||8,0.08,seed,an);mobPath(g,c,(x0+x1)/2-w*0.2,(y0+y1)/2-w*0.3,L*0.55+w*0.3);
}
function lmRosaryHoundLeg(g,hx,hy,fx,fy,hind,c,seed){
  const ik=lmRosaryIK(hx,hy,fx-(hind?-0.4:0.4),fy-1.6,7.9,7.7,hind);
  const kx=ik[2],ky=ik[3],ex=ik[0],ey=ik[1],cd=shadeHex(c,-0.28),pal=[cd,c,shadeHex(c,0.18),shadeHex(c,0.34)];
  lmRosaryLobe(g,hx,hy,kx,ky,hind?6:5.2,c,seed,9);
  g.save();g.clip();lmRosaryLeafField(g,(hx+kx)/2,(hy+ky)/2,3,(Math.hypot(kx-hx,ky-hy))/2,7,seed,pal,1.8);g.restore();
  lmRosaryLobe(g,kx,ky,ex,ey,3.8,shadeHex(c,-0.04),seed+3,7);
  g.save();g.clip();lmRosaryLeafField(g,(kx+ex)/2,(ky+ey)/2,1.6,(Math.hypot(ex-kx,ey-ky))/2,5,seed+7,pal,1.5);g.restore();
  g.beginPath();g.arc(kx,ky,2.1,0,TAU);mobPath(g,shadeHex(c,0.08),kx-0.4,ky-0.5,2.3,true);
  /* пухлая лапа-ком с тремя пальцами */
  lmFluff(g,ex+1.2,ey+0.5,3.7,2.4,8,0.16,seed+2,0);mobPath(g,shadeHex(c,0.08),ex+0.4,ey-0.3,3.7);
  g.strokeStyle=shadeHex(c,-0.5);g.lineWidth=0.4;g.lineCap='round';for(const x of [1.2,2.6]){g.beginPath();g.moveTo(ex+x,ey+0.1);g.lineTo(ex+x+0.2,ey+1.9);g.stroke();}
  return [ex,ey,kx,ky];
}
/* костяная лапа собаки: на бедре и плече — ободранные мышцы, ниже голая кость, скакательный сустав, длинные пальцы с когтями */
function lmRosaryBoneLeg(g,hx,hy,fx,fy,hind,c,seed,dark){
  const ax=fx-(hind?1.6:-0.4),ay=fy-5.2,ik=lmRosaryIK(hx,hy,ax,ay,hind?7.4:6.8,hind?7:6.4,!hind);
  const kx=ik[2],ky=ik[3],ex=ik[0],ey=ik[1],cd=dark?shadeHex(c,-0.34):c,mc=dark?'#5a1824':'#962638';
  lmRosaryBone(g,hx,hy,kx,ky,2.2,cd);
  /* мышца: бугристый жгут вокруг верхней кости */
  const px=hx+(kx-hx)*0.08,py=hy+(ky-hy)*0.08,qx=hx+(kx-hx)*0.96,qy=hy+(ky-hy)*0.96;
  lmRosaryMuscle(g,px,py,qx,qy,hind?4.4:3.4,mc);
  lmRosaryBone(g,kx,ky,ex,ey,1.8,cd);
  /* сухожилие вдоль голени */
  if(!dark){g.strokeStyle='rgba(150,30,46,.85)';g.lineWidth=0.5;g.beginPath();g.moveTo(kx+0.4,ky+0.6);g.lineTo(ex+0.4,ey-0.4);g.stroke();}
  lmRosaryBone(g,ex,ey,fx,fy-0.6,1.4,cd);
  /* пальцы: три длинных, когти острые */
  g.lineCap='round';
  for(let q=-1;q<=1;q++){const tx=fx+3.8+q*0.2,ty=fy+0.2+q*0.1-Math.abs(q)*0.2;
    g.strokeStyle=shadeHex(cd,-0.6);g.lineWidth=1.2;g.beginPath();g.moveTo(fx,fy-0.7);g.quadraticCurveTo(fx+2,fy-1.5+q*0.5,tx,ty);g.stroke();
    g.strokeStyle=cd;g.lineWidth=0.7;g.beginPath();g.moveTo(fx,fy-0.7);g.quadraticCurveTo(fx+2,fy-1.5+q*0.5,tx,ty);g.stroke();
    g.fillStyle=dark?'#6a5a4a':'#2a1a14';g.beginPath();g.moveTo(tx-0.2,ty-0.5);g.lineTo(tx+1.7,ty+0.5+Math.abs(q)*0.2);g.lineTo(tx-0.2,ty+0.5);g.fill();}
  return [ex,ey,kx,ky];
}
/* рогатый череп гончей Истины; o — размер, jaw — раскрытие пасти */
function lmRosaryHoundSkull(g,m,t,jaw,cr,ph){
  const BN='#e6d8bc',BL='#fff4de',BD='#a8957a',DK='#1e0408';
  /* дальний рог (позади, темнее) */
  const antler=(far,sw)=>{
    const c=far?'#4a3626':'#6e5238',ct=far?'#8a7a64':'#d8c8a6';
    const pts=far?[[-3.4,-3.6],[-6,-8],[-9.4,-12.4],[-9.6,-17.4]]:[[-1.2,-4.4],[-3.2,-9.6],[-5.4,-14.6],[-4.4,-20]];
    lmRosaryVine(g,pts,far?1.5:1.9,c,0.8,far?1:2,ct);
    const tines=far?[[1,[-1.2,-3.2],[-1.8,-3.0]],[2,[-4.6,-4.2],[-5.6,-2.2]]]:[[1,[2.6,-1.8],[3.2,-3.6]],[2,[3.4,-2.4],[4.4,-5.4]]];
    /* отростки и «концы» */
    const p1=pts[1],p2=pts[2],p3=pts[3];
    lmRosaryVine(g,[[p1[0],p1[1]],[p1[0]+(far?-2.6:2.8),p1[1]-1.6],[p1[0]+(far?-3.6:4),p1[1]-5.2]],far?1:1.3,c,0.5,3,ct);
    lmRosaryVine(g,[[p2[0],p2[1]],[p2[0]+(far?2.4:-2.6),p2[1]-2],[p2[0]+(far?3:-3.4),p2[1]-5.4]],far?0.9:1.2,c,0.5,5,ct);
    g.fillStyle=ct;g.beginPath();g.moveTo(p3[0]-0.8,p3[1]+0.4);g.lineTo(p3[0]+0.1,p3[1]-2.6);g.lineTo(p3[0]+0.9,p3[1]+0.4);g.fill();
  };
  g.save();g.scale(0.72,0.72);antler(true,0);g.restore();
  /* череп: затылок */
  g.beginPath();g.moveTo(-5.4,0.4);g.bezierCurveTo(-6.2,-5.4,-1.4,-7.6,3.4,-6.6);g.bezierCurveTo(5.6,-6,6.4,-4.4,7.2,-3.4);g.lineTo(5.6,2.6);g.bezierCurveTo(1,3.6,-4,3.2,-5.4,0.4);g.closePath();
  lmRosaryBP(g,BN,-0.4,-3.6,8);
  g.save();g.clip();
  /* тень в затылке и трещины */
  g.fillStyle='rgba(70,40,24,.28)';g.beginPath();g.ellipse(-4,0.6,3.4,4.6,0,0,TAU);g.fill();
  g.strokeStyle='rgba(60,30,18,.75)';g.lineWidth=0.4;g.beginPath();g.moveTo(-1,-6.4);g.lineTo(-1.6,-4.2);g.lineTo(-0.2,-3);g.lineTo(-0.8,-1.2);g.moveTo(-1.6,-4.2);g.lineTo(-3.4,-3.6);g.stroke();
  /* кусок засохшей кожи со швом */
  g.fillStyle='#5a1420';g.beginPath();g.moveTo(-5.6,-1);g.lineTo(-2.4,-0.4);g.lineTo(-2,1.6);g.lineTo(-3.4,2.4);g.lineTo(-5.6,1.4);g.fill();
  g.strokeStyle='#d8c8a8';g.lineWidth=0.3;for(let i=0;i<4;i++){g.beginPath();g.moveTo(-5+i*1,-0.2+i*0.1);g.lineTo(-4.4+i*1,1.2);g.stroke();}
  g.restore();
  /* морда: вытянутая верхняя челюсть */
  g.beginPath();g.moveTo(2.4,-5.4);g.bezierCurveTo(6.6,-5.4,11,-3.6,14.4,-1.6);g.quadraticCurveTo(15.4,-0.6,14.6,1);g.lineTo(13.4,1.6);g.lineTo(3.4,2.4);g.closePath();
  lmRosaryBP(g,BN,6,-3.6,10);
  g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=0.5;g.beginPath();g.moveTo(3.4,-5);g.bezierCurveTo(7,-5,10.6,-3.4,13.8,-1.6);g.stroke();
  /* ноздря и щербины на кости */
  g.fillStyle=DK;g.beginPath();g.ellipse(13.2,-1.2,0.9,0.6,0.4,0,TAU);g.fill();
  g.strokeStyle='rgba(60,30,18,.6)';g.lineWidth=0.35;g.beginPath();g.moveTo(8,-4.2);g.lineTo(8.8,-3);g.lineTo(8,-2.2);g.stroke();
  /* нижняя челюсть: висит и раскрывается */
  g.save();g.translate(2.6,2.2);g.rotate(jaw*0.95);
  g.beginPath();g.moveTo(-1.6,-0.6);g.lineTo(11.6,-0.2);g.quadraticCurveTo(12.8,1.2,11.2,2.2);g.lineTo(0.4,3.2);g.quadraticCurveTo(-2.4,2.4,-1.6,-0.6);g.closePath();
  lmRosaryBP(g,'#c9b898',5,1.4,7);
  g.fillStyle='#3a0610';g.beginPath();g.moveTo(0,-0.6);g.lineTo(11,-0.4);g.lineTo(10.4,0.9);g.lineTo(0.6,1);g.closePath();g.fill();
  lmTeeth(g,0.8,-0.5,10.6,6,2.1,'#f4ead4',false);
  /* лоскуты мяса и сухожилие челюсти */
  g.strokeStyle='#8a1a2c';g.lineWidth=0.7;g.beginPath();g.moveTo(1,1.4);g.quadraticCurveTo(5,2.8,9,1.8);g.stroke();
  g.restore();
  /* зубы-иглы сверху, клыки длиннее */
  lmTeeth(g,4,2.4,13.6,9,1.8,'#fff6e4');
  g.fillStyle='#fffaf0';g.beginPath();g.moveTo(11.2,2.1);g.lineTo(11.9,5+jaw*1.2);g.lineTo(12.7,2);g.fill();
  g.beginPath();g.moveTo(5.6,2.5);g.lineTo(6.1,4.6+jaw);g.lineTo(6.8,2.5);g.fill();
  /* слюна */
  if(jaw>0.25){g.strokeStyle='rgba(255,226,236,.65)';g.lineWidth=0.35;for(const [x,d] of [[5,0],[8.4,1],[10.8,2]]){g.beginPath();g.moveTo(x,2.5);g.quadraticCurveTo(x+0.3,4+jaw*1.5+d*0.5,x-0.2,5.6+jaw*3+d*0.4);g.stroke();}}
  /* глазница: чёрная, с красным углём */
  g.fillStyle=DK;g.beginPath();g.ellipse(3.2,-2.4,2.9,2.5,0.25,0,TAU);g.fill();
  g.strokeStyle='rgba(60,30,18,.8)';g.lineWidth=0.5;g.beginPath();g.ellipse(3.2,-2.4,3.1,2.7,0.25,Math.PI*1.05,Math.PI*1.9);g.stroke();
  const fl=0.85+0.15*Math.sin(t*9+ph*3),ex=3.6+(m.lookX||0)*0.35,ey=-2.3+(m.lookY||0)*0.3;
  mobGlow(g,ex,ey,7.5+cr*2,'#ff2a3a',0.8*fl);
  g.fillStyle='#ff4a52';g.beginPath();g.arc(ex,ey,1.5,0,TAU);g.fill();g.fillStyle='#ffd0c8';g.beginPath();g.arc(ex-0.2,ey-0.2,0.7,0,TAU);g.fill();
  /* вторая глазница поменьше, лишняя, на лбу */
  g.fillStyle=DK;g.beginPath();g.ellipse(-1.6,-4.2,1.2,1,0.3,0,TAU);g.fill();g.fillStyle='rgba(255,60,70,'+(0.5+0.4*Math.sin(t*5+ph))+')';g.beginPath();g.arc(-1.5,-4.2,0.5,0,TAU);g.fill();
  /* кровь из глазницы */
  lmRosaryDrip(g,2.4,-0.2,t,ph*3,3.6,0.85);
  lmRosaryDrip(g,4.6,0.2,t+0.4,ph*3+2,2.4,0.8);
  /* ближний рог с розеткой у основания */
  g.save();g.scale(0.72,0.72);antler(false,0);g.restore();
  g.beginPath();g.ellipse(-1,-3.6,1.5,1.1,-0.3,0,TAU);mobPath(g,'#8a6a46',-1.4,-4,1.6);
  /* лоза через череп */
  lmRosaryVine(g,[[-4.6,-1.4],[-2.4,-3.4],[0.8,-4.8],[4.6,-4.2]],0.9,'#4a5a24',0.9,4,'#6a5a30');
}
LM_MODEL.lrosehound=function(g,m,FY,t,T,st,k,wv,ph){
  const lp=st==='leap',run=Math.abs(m.vx)>8&&!lp,phs=m.anim*15;
  const cr=lmRosaryE(m,'cr',st==='crouch'?k:0,t,14);
  const bite=m.atkT>0?Math.sin((1-m.atkT/0.24)*Math.PI):0;
  const br=Math.sin(t*2.6+ph*5),rage=clamp(cr+(lp?1:0)+bite,0,1);
  const bob=run?-Math.abs(Math.sin(phs))*1.1:0,tilt=lp?(m.vy<0?-0.2:0.17):cr*0.15,oy=bob+cr*1.5-5;
  const jaw=0.16+cr*0.7+(lp?0.5:0)+bite*0.55+Math.max(0,br)*0.05;
  const PV=[-8,-12],cs=Math.cos(tilt),sn=Math.sin(tilt);
  const Wp=(x,y)=>{const dx=x-PV[0],dy=y-PV[1];return [PV[0]+dx*cs-dy*sn,PV[1]+dx*sn+dy*cs+oy];};
  /* ступни в мире: стойка, бег, прыжок, присед */
  const ft=(bx,off,str,fl,fc)=>lp?fl:cr>0.2?[bx+(fc||0)*cr,0]:run?[bx+Math.sin(phs+off)*str,-Math.max(0,Math.cos(phs+off))*3.2]:[bx,0];
  const F={nf:ft(7.4,0,5,[21,-5],4),ff:ft(10,0.6,5,[23.5,-7.5],4.5),nh:ft(-7.4,Math.PI,5,[-19,-6],0),fh:ft(-10.4,Math.PI+0.6,5,[-21.5,-3.6],0)};
  const hip={nf:Wp(7.2,-12),ff:Wp(9,-12.4),nh:Wp(-7.6,-12),fh:Wp(-9.8,-12.4)};
  g.save();g.translate(0,FY);g.scale(0.9,0.9);
  if(!T){
    const LC='#3d8c44',LD='#235a2e',LL='#6cc25a',LH='#a8e27c',PAL=[LD,'#2e7438',LC,'#56ad4e',LL,'#88d46a'];
    const RR='#f2405e',leaf=(x,y,a,L)=>lmRosaryLeaf(g,x,y,a,L,L*0.3,'#1f5a2a','#2e7a38');
    const grp=(fn)=>{g.save();g.translate(PV[0],PV[1]+oy);g.rotate(tilt);g.translate(-PV[0],-PV[1]);fn();g.restore();};
    mobGlow(g,0,-14,24,'#7aff8a',0.16);
    const cF=shadeHex(LC,-0.3);
    lmRosaryHoundLeg(g,hip.ff[0],hip.ff[1],F.ff[0],F.ff[1],false,cF,3);
    lmRosaryHoundLeg(g,hip.fh[0],hip.fh[1],F.fh[0],F.fh[1],true,cF,4);
    grp(()=>{
      /* хвост-завиток с метёлкой листьев и розой */
      const sx=Math.sin(t*(run?10:3.6)+ph)*1.6;
      lmRosaryVine(g,[[-10,-15],[-14.4,-16.4],[-17.4,-20.4],[-16.4+sx*0.6,-24.6],[-14.6+sx,-26.8]],2.5,'#2f7a38',0);
      lmRosaryLeafEdge(g,-14.8+sx,-26.8,3.6,3.4,9,5,3.4,LD);
      lmFluff(g,-14.8+sx,-26.8,3.6,3.4,9,0.14,6);mobPath(g,LL,-15.6+sx,-27.6,4);
      lmRosaryLeafField(g,-14.8+sx,-26.8,3,2.8,6,8,PAL,1.4);
      lmRosaryRose(g,-13.8+sx,-27.6,1.8,RR);
      /* туловище: подстриженный куст */
      lmFluff(g,-1.4,-14.4,11,6.8,16,0.07,2.1);mobPath(g,LC,-6,-19,12);
      g.save();g.clip();
      g.fillStyle='rgba(6,34,16,.4)';g.beginPath();g.ellipse(-1,-6.8,14,4.6,0,0,TAU);g.fill();
      g.fillStyle='rgba(180,240,140,.18)';g.beginPath();g.ellipse(-4,-19,9,2.4,-0.1,0,TAU);g.fill();
      g.strokeStyle='rgba(225,255,190,.45)';g.lineWidth=0.9;g.beginPath();g.ellipse(-1.4,-14.4,10.4,6.2,0,Math.PI*1.1,Math.PI*1.55);g.stroke();
      lmRosaryLeafField(g,-1.4,-14.4,11,6.8,34,11,PAL,2.8);
      g.strokeStyle='rgba(8,40,18,.5)';g.lineWidth=0.5;g.beginPath();g.moveTo(1.4,-20.6);g.quadraticCurveTo(0.2,-13,2,-8);g.moveTo(-5.6,-20.8);g.quadraticCurveTo(-6.6,-14,-5.2,-8.5);g.stroke();
      g.restore();
      lmRosaryLeafEdge(g,-1.4,-14.4,11,6.8,16,21,3,LL,LH,Math.PI*1.1,Math.PI*1.9);
      if(rage>0.05){for(let i=0;i<6;i++){const x=-10+i*3.6;lmRosaryThorn(g,x,-20.6-Math.sin(i*0.5)*0.8,-1.57+(i-3)*0.08,1+rage*3.2,1,'#5a1620');}}
      /* шея: клин из листвы от плеч к голове */
      g.beginPath();g.moveTo(1.4,-19.6);g.quadraticCurveTo(6,-24,10.4,-26);g.lineTo(17,-18.6);g.quadraticCurveTo(13,-14.6,9.6,-9.4);g.lineTo(2,-11);g.closePath();mobPath(g,shadeHex(LC,0.02),6,-21,9,true);
      g.save();g.clip();lmRosaryLeafField(g,9.6,-18,7,9,20,19,PAL,2.3);g.restore();
      lmRosaryLeafEdge(g,9.6,-18,7,9,8,25,2.6,LL,LH,Math.PI*1.2,Math.PI*1.7);
      /* ошейник из роз под головой */
      g.save();g.translate(0,Math.sin(t*1.9+ph)*0.25);
      g.save();g.translate(14.8-cr*0.4,-23+cr*0.4);g.rotate(-0.04+rage*0.1+(run?Math.sin(phs*2)*0.03:0));
      /* дальнее ухо */
      g.save();g.translate(-4,-3);g.rotate(0.5+Math.sin(t*2.2+ph)*0.05+rage*0.4);
      lmFluff(g,0,2.4,2.8,4.2,9,0.12,5);mobPath(g,shadeHex(LC,-0.32),0,1,4.8);g.restore();
      /* голова-ком */
      lmFluff(g,0,0,6.4,5.8,13,0.08,3.3);mobPath(g,shadeHex(LC,0.06),-1.6,-3,7.4);
      g.save();g.clip();lmRosaryLeafField(g,0,0,6.4,5.8,24,23,PAL,2.0);g.strokeStyle='rgba(225,255,190,.4)';g.lineWidth=0.8;g.beginPath();g.ellipse(0,0,5.8,5.2,0,Math.PI*1.1,Math.PI*1.6);g.stroke();g.restore();
      /* нижняя челюсть */
      g.save();g.translate(2.6,3.6);g.rotate(jaw*0.7);
      lmFluff(g,4.4,1.2,4.8,2.1,8,0.1,9);mobPath(g,shadeHex(LC,-0.06),3,0.4,5,true);
      g.fillStyle='#4a0a1a';g.beginPath();g.moveTo(0.6,0.4);g.lineTo(9,0.2);g.lineTo(8.4,-1.2);g.lineTo(1,-0.8);g.closePath();g.fill();
      if(jaw>0.3){g.fillStyle='#e0607a';g.beginPath();g.ellipse(4.6,-0.2,2.4,0.9,0,0,TAU);g.fill();lmTeeth(g,1.2,0.2,8.4,5,1.5,'#fff2d8',false);}
      g.restore();
      /* морда */
      lmFluff(g,7.2,2.2,5,3.2,10,0.08,7);mobPath(g,LL,5.6,0,5.6);
      g.save();g.clip();lmRosaryLeafField(g,7.2,2.2,5,3.2,12,29,[LC,LL,LH,LH],1.5);g.restore();
      if(jaw>0.3)lmTeeth(g,3.8,3.8,10,5,1.4,'#fff2d8');
      /* нос */
      g.beginPath();g.moveTo(10.8,0.4);g.quadraticCurveTo(13.2,0,13,1.8);g.quadraticCurveTo(12.2,3.2,10.6,2.7);g.closePath();mobPath(g,'#241a22',11.8,1.2,2.2);
      g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.ellipse(11.8,0.7,0.7,0.35,-0.4,0,TAU);g.fill();
      if(jaw<0.45){g.strokeStyle='#143a1e';g.lineWidth=0.55;g.lineCap='round';g.beginPath();g.moveTo(10.8,3);g.quadraticCurveTo(7.8,5.2,4.2,4.3);g.quadraticCurveTo(3.4,4.1,3,3.2);g.stroke();}
      /* глаз с бликом и бровью-листиком */
      const bl=(Math.sin(m.anim*1.1+ph*7)>0.985)?0.15:1,lx=(m.lookX||0)*0.4,ly=(m.lookY||0)*0.3,ez=1-rage*0.25;
      g.fillStyle='#173a20';g.beginPath();g.ellipse(3.4,-0.8,2.2,2.4*bl*ez,0.1,0,TAU);g.fill();
      if(bl>0.5){const ig=g.createRadialGradient(3.4+lx,-0.5+ly,0.2,3.4+lx,-0.8+ly,2);ig.addColorStop(0,rage>0.4?'#ff8a8a':'#a6643a');ig.addColorStop(0.6,rage>0.4?'#b0182a':'#4a2410');ig.addColorStop(1,'#120a08');
        g.fillStyle=ig;g.beginPath();g.ellipse(3.5+lx,-0.7+ly,1.8,2*ez,0.1,0,TAU);g.fill();
        g.fillStyle='#050404';g.beginPath();g.arc(3.6+lx,-0.7+ly,0.85,0,TAU);g.fill();
        g.fillStyle='#fff';g.beginPath();g.arc(2.8+lx,-1.6+ly,0.7,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.arc(4.2+lx,0.2+ly,0.32,0,TAU);g.fill();}
      g.strokeStyle='#0e2a14';g.lineWidth=0.7;g.beginPath();g.ellipse(3.4,-0.8,2.3,2.5*bl*ez,0.1,Math.PI*1.1,Math.PI*1.95);g.stroke();
      lmRosaryLeaf(g,1.4,-3.8+rage*0.9,-0.15+rage*0.5,4,0.95,'#1f5a2a','#2e7a38');
      /* ближнее ухо — висящий куст: темнее головы, чтобы читалось отдельно */
      g.save();g.translate(-3.8,-2.8);g.rotate(0.1+Math.sin(t*2.2+ph+1)*0.06+rage*0.5+(run?0.25:0));
      lmFluff(g,0,3.2,2.3,4.1,9,0.1,15);mobPath(g,shadeHex(LC,-0.18),-0.8,0.4,4.6);
      g.save();g.clip();lmRosaryLeafField(g,0,3.2,2.3,4.1,10,31,[LD,'#2a6a34',LC,'#56ad4e'],1.7);
      g.fillStyle='rgba(6,30,14,.35)';g.beginPath();g.ellipse(0.8,4.2,1.4,2.8,0,0,TAU);g.fill();g.restore();
      lmRosaryLeafEdge(g,0,3.2,2.3,4.1,6,17,2,LC,LL,0.4,2.7);
      g.restore();
      /* хохолок и роза на макушке */
      lmFluff(g,-0.8,-5.2,3.2,2.2,8,0.14,3);mobPath(g,LL,-1.4,-6,3.4);
      leaf(-1,-5.4,-2.4,3.2);leaf(-0.2,-5.4,-0.7,3.2);
      lmRosaryRose(g,-0.4,-6.4,2.2,RR);
      lmRosaryLeafEdge(g,0,0,6.4,5.8,8,41,2.6,LL,LH,Math.PI*1.1,Math.PI*1.7);
      g.restore();g.restore();
    });
    /* ближние лапы */
    lmRosaryHoundLeg(g,hip.nf[0],hip.nf[1],F.nf[0],F.nf[1],false,LC,5);
    lmRosaryHoundLeg(g,hip.nh[0],hip.nh[1],F.nh[0],F.nh[1],true,LC,6);
    grp(()=>{
      /* бедро и плечо прикрывают верх ног */
      lmFluff(g,-8.4,-11.6,6.4,6.4,11,0.1,4.4);mobPath(g,shadeHex(LC,0.04),-10,-14.6,7.2);
      g.save();g.clip();lmRosaryLeafField(g,-8.4,-11.6,6.2,6.2,22,13,PAL,2.4);g.restore();
      g.strokeStyle='rgba(8,40,18,.5)';g.lineWidth=0.7;g.beginPath();g.arc(-8.4,-11.6,6.2,-2.3,1.1);g.stroke();
      lmFluff(g,6.6,-12.2,5.2,5.6,10,0.09,5.1);mobPath(g,shadeHex(LC,0.03),5,-15.4,6.2);
      g.save();g.clip();lmRosaryLeafField(g,6.6,-12.2,5.2,5.6,18,17,PAL,2.3);g.restore();
      g.strokeStyle='rgba(8,40,18,.5)';g.lineWidth=0.6;g.beginPath();g.arc(6.6,-12.2,5.3,-0.5,1.8);g.stroke();
      /* розы на туловище */
      for(const [x,y,r,a] of [[-5.4,-20.4,2.6,0],[2.2,-20,2.2,1],[-10.6,-12.4,2.4,2],[6.6,-10.6,1.9,3],[-1.4,-9.8,1.8,4],[-12,-17,1.7,5]]){
        leaf(x,y,Math.PI*0.9-a*0.3,3.6);leaf(x,y,Math.PI*0.1+a*0.2,3.4);
        lmRosaryRose(g,x,y,r,rage>0.4?'#ff2a48':RR);}
    });
  }else{
    const BN='#e6d8bc',BL='#fff4de',BD='#a8957a',MT='#6a1a26';
    mobGlow(g,2,-14,24,'#ff2a3a',0.1+rage*0.1);
    /* дальние кости-лапы */
    const cB='#d6c8a8';
    lmRosaryBoneLeg(g,hip.ff[0],hip.ff[1],F.ff[0],F.ff[1],false,cB,1,true);
    lmRosaryBoneLeg(g,hip.fh[0],hip.fh[1],F.fh[0],F.fh[1],true,cB,2,true);
    g.save();g.translate(PV[0],PV[1]+oy);g.rotate(tilt);g.translate(-PV[0],-PV[1]);
    /* хвост-плеть из колючей лозы */
    {const pts=[];for(let i=0;i<7;i++){pts.push([-12.4-i*2.3+Math.sin(t*3+i*0.8+ph)*i*0.22,-16.4-i*1.9-i*i*0.1+Math.sin(t*3.4+i*0.7+ph)*i*0.5]);}
     lmRosaryVine(g,pts,1.9,'#4a3a22',1.8,1,'#8a7a5a');
     const e=pts[6];lmRosaryRose(g,e[0]-0.6,e[1]-1.2,1.8,'#6a1224',1);}
    /* полость груди: тёмное сухое мясо */
    g.beginPath();g.moveTo(-12.6,-15.6);g.bezierCurveTo(-12,-21,-4,-22.4,2,-21.6);g.bezierCurveTo(7,-21,10,-19,10.4,-15.4);g.bezierCurveTo(10,-10,4.4,-6.2,-1.6,-6);g.bezierCurveTo(-8,-6.2,-12.8,-10.4,-12.6,-15.6);g.closePath();
    mobPath(g,MT,-4,-18,13);
    g.save();g.clip();
    g.fillStyle='#240610';g.beginPath();g.ellipse(-1.4,-13.4,10,6,0,0,TAU);g.fill();
    /* внутренности: мясистые комья и пузыри */
    for(const [x,y,rx,ry,c] of [[-5,-12.6,2.8,2,'#5a1424'],[0,-11.4,3,2.2,'#6a1a2c'],[4.6,-13.4,2.4,2.8,'#4a1020']]){g.fillStyle=c;g.beginPath();g.ellipse(x,y,rx,ry,0.4,0,TAU);g.fill();g.fillStyle='rgba(255,150,150,.3)';g.beginPath();g.ellipse(x-0.6,y-0.8,rx*0.4,ry*0.25,0.4,0,TAU);g.fill();}
    g.restore();
    /* лоза-плеть, оплетающая рёбра изнутри */
    lmRosaryVine(g,[[-11,-8.4],[-7,-9.6],[-3,-8],[1,-9.2],[5,-8.2],[8.6,-10.2]],0.9,'#4a5a24',1.2,2,'#7a8a3a');
    /* рёбра: широкие дуги от хребта к низу */
    for(let i=0;i<7;i++){const x=-10+i*2.7,top=-21.2+Math.abs(i-3)*0.28+(i>3?0.6:0),len=(i===2||i===3)?1:0.92;
      const ex=x+3.8-(i>4?(i-4)*0.6:0),ey=-7.2+(i<2?-1.2:0)+(i>4?(i-4)*1.6:0);
      const qx=x+4.4,qy=-16;
      if(i===4){/* сломанное ребро */
        g.strokeStyle='#2a0a10';g.lineWidth=2.1;g.lineCap='round';g.beginPath();g.moveTo(x-0.4,top);g.quadraticCurveTo(qx,qy,ex-1,ey-4);g.stroke();
        g.strokeStyle=BN;g.lineWidth=1.4;g.beginPath();g.moveTo(x-0.4,top);g.quadraticCurveTo(qx,qy,ex-1,ey-4);g.stroke();
        g.fillStyle=BN;g.beginPath();g.moveTo(ex-2,ey-4.6);g.lineTo(ex-0.4,ey-3);g.lineTo(ex-1.6,ey-1.8);g.closePath();g.fill();
        continue;}
      g.strokeStyle='#2a0a10';g.lineWidth=2.1;g.lineCap='round';g.beginPath();g.moveTo(x-0.4,top);g.quadraticCurveTo(qx,qy,ex,ey);g.stroke();
      g.strokeStyle=BD;g.lineWidth=1.5;g.beginPath();g.moveTo(x-0.4,top);g.quadraticCurveTo(qx,qy,ex,ey);g.stroke();
      g.strokeStyle=BN;g.lineWidth=1.0;g.beginPath();g.moveTo(x-0.7,top-0.1);g.quadraticCurveTo(qx-0.4,qy-0.4,ex-0.4,ey-0.2);g.stroke();
      g.strokeStyle='rgba(255,255,255,.65)';g.lineWidth=0.35;g.beginPath();g.moveTo(x-0.9,top-0.1);g.quadraticCurveTo(x+1.5,top+3,x+2.4,-16.4);g.stroke();
      if(i%2===0){g.strokeStyle='#8a1a2c';g.lineWidth=0.5;g.beginPath();g.moveTo(ex,ey);g.quadraticCurveTo(ex+0.6,ey+1.4,ex+0.2,ey+2.4);g.stroke();}}
    /* сухожилия между рёбрами */
    g.strokeStyle='rgba(150,30,50,.8)';g.lineWidth=0.4;for(let i=0;i<6;i++){const x=-8+i*2.7;g.beginPath();g.moveTo(x+1.4,-14);g.quadraticCurveTo(x+2.2,-12.6,x+1.6,-10.8);g.stroke();}
    /* глаз в грудной клетке: рваное веко из мяса */
    g.beginPath();g.ellipse(-1.2,-12.8,4.4,3.9,0,0,TAU);g.fillStyle='#4a0e1a';g.fill();
    {const ex=-1.2,ey=-12.8,lx=(m.lookX||0)*1.1,ly=(m.lookY||0)*0.8;
     mobGlow(g,ex,ey,7,'#ff2a3a',0.5+rage*0.3);
     g.beginPath();g.ellipse(ex,ey,3.4,3,0,0,TAU);g.fillStyle='#f0e4dc';g.fill();g.strokeStyle='#5a0a18';g.lineWidth=0.5;g.stroke();
     g.strokeStyle='rgba(190,20,40,.8)';g.lineWidth=0.3;for(let i=0;i<6;i++){const a=i/6*TAU+0.3;g.beginPath();g.moveTo(ex+Math.cos(a)*3.3,ey+Math.sin(a)*2.9);g.lineTo(ex+Math.cos(a)*2,ey+Math.sin(a)*1.8);g.stroke();}
     g.fillStyle='#c01830';g.beginPath();g.arc(ex+lx,ey+ly,1.5,0,TAU);g.fill();g.fillStyle='#12040a';g.beginPath();g.arc(ex+lx,ey+ly,0.75,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.arc(ex+lx-0.5,ey+ly-0.6,0.4,0,TAU);g.fill();}
    /* хребет: позвонки с шипами */
    for(let i=0;i<10;i++){const a=i/9,x=-12.8+a*22.2,y=-16.2-Math.sin(a*Math.PI*0.95)*5.6+a*(-0.4);
      lmRosaryThorn(g,x,y-0.4,-1.7+(a-0.5)*0.4,1.8+Math.sin(i*1.7)*0.5+rage*2,0.65,'#d8c8a8');
      g.beginPath();g.ellipse(x,y,1.5,1.2,-0.3+a*0.3,0,TAU);lmRosaryBP(g,BN,x-0.3,y-0.4,1.6);}
    /* таз */
    g.beginPath();g.moveTo(-14,-17.4);g.quadraticCurveTo(-10,-20.6,-7.4,-16);g.quadraticCurveTo(-6.6,-11.6,-9,-9.6);g.quadraticCurveTo(-11,-9.2,-11.6,-11.8);g.quadraticCurveTo(-14,-13,-14,-17.4);g.closePath();
    lmRosaryBP(g,BN,-11,-16,6);g.fillStyle='#240610';g.beginPath();g.ellipse(-10.2,-14.2,1.1,1.8,0.3,0,TAU);g.fill();
    g.beginPath();g.arc(-8.8,-11.8,2.3,0,TAU);lmRosaryBP(g,BN,-9.4,-12.4,2.4);
    /* лопатка */
    g.beginPath();g.moveTo(3.4,-19.2);g.quadraticCurveTo(7,-19.6,9,-17);g.quadraticCurveTo(8.6,-13.4,7.4,-11.4);g.quadraticCurveTo(4.6,-13,3.4,-19.2);g.closePath();lmRosaryBP(g,BN,5,-16,5);
    g.strokeStyle='rgba(90,60,40,.6)';g.lineWidth=0.4;g.beginPath();g.moveTo(4.6,-18);g.lineTo(7.4,-12.4);g.stroke();
    g.beginPath();g.arc(7.4,-11.8,2,0,TAU);lmRosaryBP(g,BN,6.8,-12.4,2.1);
    /* остатки Иллюзии: клок листвы на бедре и увядшая роза */
    for(const [x,y,a,L] of [[-12.4,-14.6,-2.4,4.2],[-11.4,-15.6,-1.9,4.6],[-10.2,-16.4,-1.2,4],[-13.4,-12.8,2.6,3.6]]){lmRosaryLeaf(g,x,y,a,L,1.4,'#3c5a26','#566e30','#1c2a12');}
    lmRosaryLeaf(g,-10.4,-9.4,1.7,3.4,1.2,'#2e4a1e','#46602a');
    lmRosaryRose(g,-11,-13.4,2.4,'#7a1228',1);
    g.fillStyle='rgba(120,12,30,.8)';g.beginPath();g.ellipse(-10.4,-10,0.5,0.9,0,0,TAU);g.fill();
    lmRosaryRose(g,6.4,-19.6,1.9,'#8a1a30',1);
    /* клочья кожи и свисающее мясо */
    g.fillStyle=MT;g.beginPath();g.moveTo(-2,-6.6);g.quadraticCurveTo(-0.6,-4,-1.4,-2.2);g.quadraticCurveTo(-0.2,-3,0.8,-6.4);g.closePath();g.fill();
    lmRosaryDrip(g,-1.4,-2.6,t,2.5,3,0.85);lmRosaryDrip(g,3.4,-7,t+0.3,4.1,3.6,0.85);lmRosaryDrip(g,-6,-7,t+0.6,1.3,2.8,0.8);
    /* лоза вдоль всего тела и по шее */
    lmRosaryVine(g,[[-13,-12.4],[-9.6,-14.8],[-5.4,-11.2],[-1.4,-15.6],[2.6,-11.6],[6.4,-14.8],[9.6,-11.8]],1.0,'#4a3a22',1.4,0,'#8a7a5a');
    /* шея: позвонки, жилы */
    for(let i=0;i<5;i++){const a=i/4,x=7.4+a*5.4,y=-19-a*3.8;g.beginPath();g.ellipse(x,y,1.5-a*0.2,1.2,0.5,0,TAU);lmRosaryBP(g,BN,x-0.3,y-0.4,1.6);}
    g.strokeStyle='#8a1a2c';g.lineWidth=0.7;g.beginPath();g.moveTo(8,-17.6);g.quadraticCurveTo(10.6,-18.4,13,-19);g.stroke();
    /* череп */
    g.save();g.translate(14.6-cr*0.4,-22.8+cr*0.6);g.rotate(-0.04+rage*0.12+(lp?-0.1:0));
    g.scale(0.84,0.84);lmRosaryHoundSkull(g,m,t,jaw,rage,ph);
    g.restore();
    lmRim(g,q=>{q.strokeStyle='rgba(255,245,220,.35)';q.lineWidth=0.8;q.beginPath();q.moveTo(-12,-16);q.bezierCurveTo(-10,-21,-4,-22,2,-21.8);q.stroke();});
    g.restore();
    /* ближние кости-лапы поверх рёбер */
    lmRosaryBoneLeg(g,hip.nf[0],hip.nf[1],F.nf[0],F.nf[1],false,BN,3,false);
    lmRosaryBoneLeg(g,hip.nh[0],hip.nh[1],F.nh[0],F.nh[1],true,BN,4,false);
    /* лоза обвивает ближнюю лапу */
    lmRosaryVine(g,[[hip.nf[0]+0.6,hip.nf[1]+2],[hip.nf[0]+1.4,(hip.nf[1]+F.nf[1])/2-1],[F.nf[0]-0.6,F.nf[1]-3.4]],0.9,'#4a3a22',1,2,'#8a7a5a');
  }
  g.restore();
};
/* ---------- Безликий садовник ---------- */
/* клинок вдоль +x от шарнира: ровная сталь, светлая кромка сверху, фаска, пятна; flip — зеркально (нижняя половинка); serr — зубцы */
function lmRosaryBlade(g,L,w,c,flip,serr,stain){
  const s=flip?-1:1;
  g.save();g.scale(1,s);
  g.beginPath();g.moveTo(-1.4,-w*0.5);g.lineTo(L*0.35,-w*0.62);g.quadraticCurveTo(L*0.8,-w*0.5,L,0.15);
  if(serr){for(let i=0;i<7;i++){const x=L*(0.92-i*0.12);g.lineTo(x,w*0.2+0.2);g.lineTo(x-L*0.05,w*0.5+(i%2)*0.2);}}
  g.lineTo(L*0.35,w*0.5);g.lineTo(-1.4,w*0.5);g.closePath();
  g.fillStyle=c;g.fill();
  g.save();g.clip();
  g.fillStyle=shadeHex(c,-0.32);g.fillRect(-2,w*0.08,L+2,w);
  g.fillStyle=shadeHex(c,0.45);g.fillRect(-2,-w*0.62,L+2,w*0.2);
  g.strokeStyle=shadeHex(c,-0.55);g.lineWidth=0.3;g.beginPath();g.moveTo(1,w*0.08);g.lineTo(L,w*0.08);g.stroke();
  if(stain){for(const [x,y,r] of stain){g.fillStyle='rgba(150,10,28,.75)';g.beginPath();g.ellipse(x,y*w,r*1.8,r*0.7,0,0,TAU);g.fill();}}
  g.restore();
  g.strokeStyle=shadeHex(c,-0.8);g.lineWidth=0.4;g.lineJoin='round';g.stroke();
  g.restore();
}
/* ножницы: шарнир в (x,y), направление ang, раскрытие op; ручки назад с красными накладками */
function lmRosaryShears(g,x,y,ang,op,T,t,ph,drip){
  g.save();g.translate(x,y);g.rotate(ang);
  const bc=T?'#8a8e98':'#d4d8e0';
  for(const sd of [-1,1]){
    g.save();g.rotate(sd*op);
    /* ручка */
    lmRosaryTube(g,-6.2,0,-0.6,0,1.7,1.4,T?'#4a3020':'#8a5a2e');
    lmRosaryTube(g,-6.4,0,-3.6,0,2.2,1.9,T?'#5a1822':'#c8484a');
    /* клинок */
    lmRosaryBlade(g,T?17:15,2.2,bc,sd>0,T,T?[[6,0.2,0.7],[11,-0.1,0.6],[14,0.3,0.5]]:[[12,0.28,0.35]]);
    g.restore();}
  /* шарнир-болт */
  g.beginPath();g.arc(0,0,1.15,0,TAU);mobPath(g,T?'#8a6a2a':'#e0b84a',0,0,1.2);
  g.fillStyle='rgba(0,0,0,.45)';g.beginPath();g.arc(0.1,0,0.3,0,TAU);g.fill();
  if(T&&drip){for(let i=0;i<3;i++){const dx=8+i*3.6;lmRosaryDrip(g,dx,1.2+Math.sin(op)*dx*0.6,t,ph*2+i,2.6,0.9);}}
  g.restore();
}
/* ботинок: ступня в (x,y) — линия земли, носок вперёд (+x) */
function lmRosaryBoot(g,x,y,c,T,far){
  const cd=shadeHex(c,-0.3);
  g.beginPath();g.moveTo(x-2.6,y-5.2);g.lineTo(x+2.4,y-5.2);g.quadraticCurveTo(x+2.8,y-2.6,x+4.6,y-1.8);g.quadraticCurveTo(x+6.4,y-1.4,x+6.2,y+0.1);g.lineTo(x-3,y+0.1);g.quadraticCurveTo(x-3.4,y-2,x-2.6,y-5.2);g.closePath();
  mobPath(g,c,x,y-3.6,5.6);
  /* подошва и каблук */
  g.fillStyle=shadeHex(c,-0.62);g.fillRect(x-3.1,y-0.9,9.4,1.1);
  g.fillStyle=shadeHex(c,-0.5);g.fillRect(x-3.1,y-1.6,2.4,1.5);
  /* шнурки и носок */
  if(!far){g.strokeStyle=shadeHex(c,0.5);g.lineWidth=0.35;g.lineCap='round';for(let i=0;i<3;i++){g.beginPath();g.moveTo(x+0.2+i*0.9,y-4.4+i*0.5);g.lineTo(x+1.6+i*0.9,y-4+i*0.5);g.stroke();}
    g.strokeStyle='rgba(255,230,190,.45)';g.lineWidth=0.4;g.beginPath();g.moveTo(x+3,y-2.6);g.quadraticCurveTo(x+4.8,y-2.2,x+5.6,y-1.2);g.stroke();}
  if(T){g.fillStyle='rgba(50,70,30,.7)';g.beginPath();g.ellipse(x+1,y-0.5,4,1,0,0,TAU);g.fill();}
}
LM_MODEL.lgardener=function(g,m,FY,t,T,st,k,wv,ph){
  const walk=Math.abs(m.vx)>6,sp=m.anim*13,br=Math.sin(t*2.6+ph*5);
  const sn=lmRosaryE(m,'sn',st==='snipw'?k:0,t,14),th=lmRosaryE(m,'th',st==='throw'?k:0,t,14);
  const bob=walk?-Math.abs(Math.sin(sp))*0.5:0,lean=(T?0.1:0.02)+sn*0.09-th*0.1+br*0.004;
  g.save();g.translate(0,FY);g.scale(0.92,0.92);
  const step=(off)=>walk?[Math.sin(sp+off)*3.4,-Math.max(0,Math.cos(sp+off))*2.4]:[0,0];
  const sF=step(Math.PI),sN=step(0);
  const HP=[0,-14+bob];
  /* ----- палитра ----- */
  const SK=T?'#c9c4b6':'#f6cfaa',SKD=T?'#8a8678':'#d49a76',
        SH=T?'#5a5e48':'#c8484a',SHD=T?'#34382a':'#8a2a30',
        OV=T?'#3a4a2a':'#4a8a3a',OVD=T?'#222c18':'#2e5a26',
        BT=T?'#3a2a1c':'#7a4a28';
  /* ----- ноги: штаны-комбинезон и ботинки ----- */
  const leg=(hx,s,col,far)=>{
    const ax=hx+s[0],ay=-5.6+s[1],ik=[ax,ay,hx+s[0]*0.45+0.5,(HP[1]+ay)/2];
    lmRosaryTube(g,hx,HP[1]+0.4,ax,ay,5.8,4.8,col,{bg:1.04});
    /* отворот штанины */
    lmRosaryTube(g,ik[0]-0.4,ik[1]-1.6,ik[0]-0.1,ik[1]+0.3,4.8,4.8,shadeHex(col,far?0.04:0.16),{line:shadeHex(col,-0.7)});
    lmRosaryBoot(g,ik[0]+0.2,s[1]===0?0:s[1],far?shadeHex(BT,-0.25):BT,T,far);
    /* колено: заплатка и складка */
    g.fillStyle=shadeHex(col,T?0.1:0.2);g.beginPath();g.ellipse(ik[2]+0.6,ik[3],1.7,1.9,0.2,0,TAU);g.fill();
    g.strokeStyle=T?'#c8c4b0':'#fff0c0';g.lineWidth=0.3;g.setLineDash([0.6,0.5]);g.beginPath();g.ellipse(ik[2]+0.6,ik[3],1.7,1.9,0.2,0,TAU);g.stroke();g.setLineDash([]);
  };
  leg(-2.8,sF,shadeHex(OV,-0.3),true);
  leg(2.4,sN,OV,false);
  /* ----- корпус и голова (наклон вокруг пояса) ----- */
  const grp=(fn)=>{g.save();g.translate(HP[0],HP[1]);g.rotate(lean);g.translate(-HP[0],-HP[1]);fn();g.restore();};
  /* ножницы: руки держат их перед собой */
  const sx=11.5-th*1.5,sy=-18.4-sn*4+th*2.6,sAng=-0.06-sn*0.7+th*1.15,op=0.1+sn*0.52+(T?0.04:0);
  const hx=sx-5.2*Math.cos(sAng),hy=sy-5.2*Math.sin(sAng);
  grp(()=>{
    /* Истина: колючие лозы растут из спины и висят за плащом */
    if(T){const sw=Math.sin(t*1.6+ph)*1.2,sw2=Math.sin(t*1.3+ph+1.6)*1.5;
      lmRosaryVine(g,[[-4,-22],[-8.6,-26+sw*0.3],[-11.4,-32+sw*0.5],[-10.4+sw*0.6,-38.4],[-6.4+sw,-42]],1.2,'#3a4224',2.3,1,'#9a8a58');
      lmRosaryRose(g,-5.6+sw,-43,2,'#6a1224',1);
      lmRosaryVine(g,[[-6,-19],[-10.4,-17],[-11.2+sw2*0.4,-11],[-9.6+sw2*0.8,-5.6]],1,'#3a4224',2.1,2,'#9a8a58');
      lmRosaryDrip(g,-9.6+sw2*0.8,-5.2,t,ph*7,2.6,0.8);}
    /* дальняя рука позади корпуса */
    {const ik=lmRosaryIK(-1.6,-25.4,hx-0.4,hy-0.2,T?6.4:5.4,T?6.8:5.6,true);
     lmRosaryTube(g,-1.6,-25.4,ik[2],ik[3],3.6,3.2,shadeHex(SH,-0.25),{});
     lmRosaryTube(g,ik[2],ik[3],ik[0],ik[1],3.2,2.6,T?shadeHex(SH,-0.25):shadeHex(SK,-0.25),{});
     g.beginPath();g.ellipse(ik[0],ik[1],1.6,1.4,0,0,TAU);mobPath(g,shadeHex(T?'#b8b4a6':SK,-0.25),ik[0],ik[1],1.6);}
    /* плащ-мантия в Истине позади корпуса: рваный подол */
    if(T){g.beginPath();g.moveTo(-6.4,-27);g.lineTo(-7,-18);g.lineTo(-8,-11);g.lineTo(-6,-9);g.lineTo(-5.2,-12.6);g.lineTo(-3.6,-9.6);g.lineTo(-1.6,-13);g.lineTo(0,-10);g.lineTo(3.4,-14.4);g.lineTo(6,-18);g.lineTo(6.6,-27);g.closePath();
      mobPath(g,'#26262c',0,-20,10);}
    /* ----- туловище: рубашка ----- */
    g.beginPath();g.moveTo(-5.6,-14.2);g.lineTo(-6.2,-26.4);g.quadraticCurveTo(-4.2,-29,0.4,-29.2);g.quadraticCurveTo(5,-29,6.2,-26);g.lineTo(6.8,-18.4);g.quadraticCurveTo(7.4,-15,5.6,-14);g.closePath();
    mobPath(g,SH,-2,-24,11);
    g.save();g.clip();
    if(!T){g.strokeStyle='rgba(120,20,34,.55)';g.lineWidth=0.7;for(let i=0;i<7;i++){g.beginPath();g.moveTo(-8,-28.4+i*2.2);g.lineTo(9,-28.4+i*2.2);g.stroke();g.beginPath();g.moveTo(-6+i*2.1,-30);g.lineTo(-6+i*2.1,-13);g.stroke();}
      g.strokeStyle='rgba(255,214,196,.4)';g.lineWidth=0.35;for(let i=0;i<7;i++){g.beginPath();g.moveTo(-8,-27.6+i*2.2);g.lineTo(9,-27.6+i*2.2);g.stroke();g.beginPath();g.moveTo(-5.2+i*2.1,-30);g.lineTo(-5.2+i*2.1,-13);g.stroke();}
      g.fillStyle='rgba(255,230,210,.22)';g.beginPath();g.ellipse(-3,-26,4,2.4,-0.3,0,TAU);g.fill();}
    else{g.strokeStyle='rgba(20,22,14,.5)';g.lineWidth=0.7;for(let i=0;i<7;i++){g.beginPath();g.moveTo(-8,-28.4+i*2.2);g.lineTo(9,-28.4+i*2.2);g.stroke();g.beginPath();g.moveTo(-6+i*2.1,-30);g.lineTo(-6+i*2.1,-13);g.stroke();}
      g.fillStyle='rgba(110,8,22,.5)';g.beginPath();g.ellipse(3,-17,4,5,0.2,0,TAU);g.fill();g.beginPath();g.ellipse(-3.4,-22,2.2,3,0,0,TAU);g.fill();}
    g.fillStyle='rgba(20,10,10,.28)';g.beginPath();g.ellipse(2,-14,9,2.4,0,0,TAU);g.fill();
    g.restore();
    /* нагрудник комбинезона */
    g.beginPath();g.moveTo(-4.6,-13.8);g.lineTo(-3.8,-22.4);g.quadraticCurveTo(0,-23.2,3.8,-22.4);g.lineTo(5.4,-14);g.closePath();mobPath(g,OV,0,-19,7);
    g.save();g.clip();g.strokeStyle=T?'rgba(190,186,160,.4)':'rgba(240,230,170,.45)';g.lineWidth=0.35;g.setLineDash([0.7,0.6]);g.beginPath();g.moveTo(-3.6,-22);g.lineTo(-4.4,-14.4);g.moveTo(3.6,-22);g.lineTo(5,-14.4);g.stroke();g.setLineDash([]);
    g.fillStyle='rgba(0,0,0,.18)';g.fillRect(-5,-15.6,11,0.9);g.restore();
    /* карман с секатором */
    g.beginPath();g.moveTo(-2.4,-19.6);g.lineTo(2.6,-19.6);g.lineTo(2.4,-15.4);g.lineTo(-2.2,-15.4);g.closePath();mobPath(g,shadeHex(OV,-0.12),0,-17.5,3.2);
    g.strokeStyle=shadeHex(OV,-0.5);g.lineWidth=0.35;g.beginPath();g.moveTo(-2.4,-18.8);g.lineTo(2.6,-18.8);g.stroke();
    lmRosaryTube(g,-0.4,-19.6,-0.6,-22.4,1.3,1.1,T?'#5a1822':'#c8484a');lmRosaryTube(g,0.9,-19.6,1.4,-22.2,1.2,1,'#8a5a2e');
    /* лямки и латунные пуговицы */
    lmRosaryTube(g,-3.4,-22.4,-4.8,-28.2,1.7,1.6,shadeHex(OV,0.04),{});lmRosaryTube(g,3.4,-22.4,4.6,-28.6,1.7,1.6,shadeHex(OV,0.04),{});
    for(const x of [-3.4,3.4]){g.beginPath();g.arc(x,-22.6,0.95,0,TAU);mobPath(g,T?'#8a7a3a':'#e8bc50',x,-22.6,1);}
    /* ремень и пряжка */
    g.fillStyle=shadeHex(T?'#2a1c12':'#5a3a20',0);g.fillRect(-5.8,-14.8,12.4,1.5);
    if(T){/* Истина: разрыв рубашки, рёбра и колючая лоза, торчащая из груди */
      g.beginPath();g.moveTo(3.6,-26);g.lineTo(5.6,-24.2);g.lineTo(5,-22.4);g.lineTo(6.4,-21);g.lineTo(4.2,-19.6);g.lineTo(3,-21.4);g.lineTo(3.4,-23.6);g.closePath();g.fillStyle='#1c0408';g.fill();
      g.strokeStyle='#d8c8a8';g.lineWidth=0.7;g.lineCap='round';for(let i=0;i<3;i++){g.beginPath();g.moveTo(3.4,-25+i*1.9);g.quadraticCurveTo(4.8,-24.4+i*1.9,5.8,-23.4+i*1.9);g.stroke();}}
    /* ----- шея и воротник ----- */
    lmRosaryTube(g,0.8,-28.6,1.4,-31.4,3.4,3,T?'#9a9688':'#e8b890',{});
    g.beginPath();g.moveTo(-3.8,-28.4);g.lineTo(0.6,-27);g.lineTo(5.2,-28.6);g.lineTo(3.4,-30.2);g.lineTo(0.8,-28.6);g.lineTo(-2.4,-30.2);g.closePath();mobPath(g,shadeHex(SH,0.08),0.6,-28.8,5,true);
    g.strokeStyle=shadeHex(SH,-0.6);g.lineWidth=0.4;g.stroke();
  });
  /* ----- голова ----- */
  const hy2=bob+br*0.15-sn*0.6-th*0.5-1.4;
  grp(()=>{
    g.save();g.translate(0,hy2);
    if(!T){
      /* белые волосы сзади под шляпой */
      lmFluff(g,-2.6,-32,2.6,3.2,8,0.16,3);mobPath(g,'#ece8e4',-3,-33,3.4,true);
      /* ухо */
      g.beginPath();g.ellipse(-1.6,-31.2,1.2,1.7,0.1,0,TAU);mobPath(g,SK,-1.8,-31.8,1.4);g.strokeStyle='#c07a58';g.lineWidth=0.3;g.beginPath();g.arc(-1.5,-31.2,0.5,0.5,3.4);g.stroke();
      /* лицо: овал с объёмом, нос-картошка */
      g.beginPath();g.moveTo(-1,-34.6);g.quadraticCurveTo(-2.8,-31.4,-0.6,-28.6);g.quadraticCurveTo(1.6,-26.8,4.2,-27.8);g.quadraticCurveTo(5.8,-28.6,6,-30.4);g.quadraticCurveTo(7.8,-30.6,7.6,-31.8);g.quadraticCurveTo(7,-33,5.6,-33.6);g.quadraticCurveTo(5.2,-34.8,3,-35.2);g.closePath();
      mobPath(g,SK,1,-32.4,6.4);
      g.save();g.clip();
      g.fillStyle='rgba(180,90,60,.18)';g.beginPath();g.ellipse(3.2,-28.2,4,1.6,0,0,TAU);g.fill();
      g.fillStyle='rgba(255,120,120,.3)';g.beginPath();g.ellipse(3.6,-30.2,1.7,1.1,0,0,TAU);g.fill();
      g.fillStyle='rgba(60,30,12,.32)';g.beginPath();g.ellipse(2,-35,7,1.8,0,0,TAU);g.fill();
      g.restore();
      /* нос-картошка */
      g.beginPath();g.ellipse(7,-31.6,1.5,1.3,0.2,0,TAU);mobPath(g,'#f0a890',7,-32,1.6,true);g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.arc(6.6,-32.1,0.35,0,TAU);g.fill();
      /* глаз: добрые щёлочки с морщинками */
      const bl=(Math.sin(m.anim*1.1+ph*7)>0.985)?0.15:1,lx=(m.lookX||0)*0.3,ly=(m.lookY||0)*0.25;
      g.fillStyle='#fff';g.beginPath();g.ellipse(4,-32.4,1.5,1.1*bl,0,0,TAU);g.fill();
      if(bl>0.5){g.fillStyle='#4a7aa8';g.beginPath();g.arc(4.3+lx,-32.3+ly,0.8,0,TAU);g.fill();g.fillStyle='#10161e';g.beginPath();g.arc(4.4+lx,-32.3+ly,0.42,0,TAU);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(4+lx,-32.7+ly,0.28,0,TAU);g.fill();}
      g.strokeStyle='#8a5a44';g.lineWidth=0.45;g.lineCap='round';g.beginPath();g.ellipse(4,-32.4,1.6,1.2*bl,0,Math.PI*1.05,Math.PI*1.95);g.stroke();
      g.strokeStyle='rgba(150,90,64,.7)';g.lineWidth=0.3;for(const [a,b] of [[2.2,-33],[2.1,-32.2]]){g.beginPath();g.moveTo(a,b);g.lineTo(a-0.9,b-0.2);g.stroke();}
      g.strokeStyle='#f4f2f0';g.lineWidth=1;g.beginPath();g.moveTo(2.6,-33.9);g.quadraticCurveTo(4.2,-34.5,5.6,-33.6);g.stroke();
      /* усы и бородка, улыбка */
      lmFluff(g,5.2,-29.4,3,1.5,8,0.18,2,0.1);mobPath(g,'#f2eeea',4.6,-29.8,3.2,true);g.strokeStyle='rgba(120,110,110,.5)';g.lineWidth=0.3;g.beginPath();g.moveTo(3,-29.4);g.quadraticCurveTo(5,-28.6,7,-29.4);g.stroke();
      lmFluff(g,3.6,-26.8,1.8,1.5,6,0.2,4);mobPath(g,'#f2eeea',3.4,-27,2,true);
      g.strokeStyle='#a0605a';g.lineWidth=0.45;g.beginPath();g.moveTo(2.8,-28.2);g.quadraticCurveTo(4.6,-27.2,6.2,-28.2);g.stroke();
    }else{
      /* капюшон: чёрная пустота вместо лица, ободок ткани */
      g.beginPath();g.moveTo(-5,-27);g.quadraticCurveTo(-6.6,-33,-2.8,-37.4);g.quadraticCurveTo(1.4,-39.4,5,-37);g.quadraticCurveTo(8,-33.6,6,-27.6);g.quadraticCurveTo(3,-26,-1,-26.6);g.closePath();mobPath(g,'#2a2a32',-0.5,-33,8);
      g.beginPath();g.moveTo(-2.8,-28.6);g.quadraticCurveTo(-4.6,-32,-1.8,-36);g.quadraticCurveTo(1.6,-37.6,4.6,-35.6);g.quadraticCurveTo(6.6,-32.6,5.2,-28.4);g.quadraticCurveTo(2,-26.8,-2.8,-28.6);g.closePath();g.fillStyle='#030204';g.fill();
      g.save();g.clip();
      /* в пустоте — медленные тёмные складки и два тусклых уголька */
      g.strokeStyle='rgba(60,40,60,.5)';g.lineWidth=0.4;for(let i=0;i<4;i++){g.beginPath();g.moveTo(-2,-27.6-i*2.4);g.quadraticCurveTo(1.4+Math.sin(t+i)*0.8,-29-i*2.4,5.4,-27.6-i*2.4);g.stroke();}
      const pu=0.5+0.5*Math.sin(t*2.2+ph);
      g.fillStyle='rgba(200,20,40,'+(0.35+0.45*pu+(sn>0.1?0.25:0))+')';g.beginPath();g.arc(1.2+(m.lookX||0)*0.5,-32.4,0.5,0,TAU);g.arc(4+(m.lookX||0)*0.5,-32.2,0.45,0,TAU);g.fill();
      g.restore();
      /* длинная кривая линия-улыбка, едва видимая */
      g.strokeStyle='rgba(220,210,200,'+(0.15+0.3*pu)+')';g.lineWidth=0.35;g.beginPath();g.moveTo(-0.6,-29.6);g.quadraticCurveTo(2.4,-27.6,5,-29.4);g.stroke();
      /* лозы выползают из капюшона */
      lmRosaryVine(g,[[-5.4,-29],[-7.4,-27.4],[-6.4,-25.4],[-7.8,-23]],0.9,'#3a4a22',1.1,1,'#6a6a3a');
    }
    /* ---- шляпа ---- */
    const hc=T?'#a88a4c':'#e8c870',hd=shadeHex(hc,-0.28);
    /* дальняя половина полей */
    g.beginPath();g.ellipse(0.6,-35.2,10.6,2.6,-0.05,Math.PI,TAU);mobPath(g,hd,0.6,-36,10);
    /* корона */
    g.beginPath();g.moveTo(-4.8,-35.4);g.bezierCurveTo(-5.4,-40,-1.6,-42,1.6,-42);g.bezierCurveTo(5.2,-42,6.8,-39.4,6.8,-35.4);g.closePath();mobPath(g,shadeHex(hc,0.06),-0.6,-40.4,8);
    g.save();g.clip();g.strokeStyle=shadeHex(hc,-0.34);g.lineWidth=0.35;
    for(let i=0;i<6;i++){g.beginPath();g.ellipse(0.8,-35.4,6.2,1.1+i*1.2,0,Math.PI,TAU);g.stroke();}
    g.strokeStyle=shadeHex(hc,0.3);g.lineWidth=0.35;for(let i=0;i<5;i++){g.beginPath();g.ellipse(0.6,-35.6,5.8,1.5+i*1.15,0,Math.PI*1.1,Math.PI*1.8);g.stroke();}
    g.restore();
    /* лента */
    g.beginPath();g.moveTo(-4.9,-35.8);g.quadraticCurveTo(1,-34.6,6.8,-35.8);g.lineTo(6.8,-37.6);g.quadraticCurveTo(1,-36.4,-4.9,-37.6);g.closePath();mobPath(g,T?'#5a1822':'#c8484a',1,-36.6,6,true);
    g.strokeStyle=T?'rgba(20,4,8,.5)':'rgba(110,20,30,.6)';g.lineWidth=0.3;g.stroke();
    /* роза за лентой: в Иллюзии свежая, в Истине увядшая */
    lmRosaryLeaf(g,3.6,-36.6,-2.5,3,1,T?'#2a3a18':'#1f5a2a',T?'#3a4a22':'#2e7a38');lmRosaryLeaf(g,4.4,-36.4,-0.5,3,1,T?'#2a3a18':'#1f5a2a',T?'#3a4a22':'#2e7a38');
    lmRosaryRose(g,4.8,-37.2,1.7,T?'#6a1224':'#f2405e',T?1:0);
    /* ближняя половина полей */
    g.beginPath();g.ellipse(0.6,-35.2,10.6,2.6,-0.05,0,Math.PI);mobPath(g,hc,-2,-35,10);
    g.save();g.clip();g.strokeStyle=shadeHex(hc,-0.3);g.lineWidth=0.3;for(let i=-9;i<=9;i+=1.8){g.beginPath();g.moveTo(0.6+i*0.8,-35.2);g.lineTo(0.6+i*1.04,-32.4);g.stroke();}g.restore();
    g.strokeStyle=shadeHex(hc,-0.5);g.lineWidth=0.35;g.beginPath();g.ellipse(0.6,-35.2,10.2,2.3,-0.05,0.1,Math.PI-0.1);g.stroke();
    /* растрёпанная солома на краю */
    g.strokeStyle=shadeHex(hc,0.1);g.lineWidth=0.4;g.lineCap='round';for(let i=0;i<9;i++){const a=0.15+i*0.33,x=0.6+Math.cos(a)*10.4,y=-35.2+Math.sin(a)*2.4*1.0;g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*1.3+0.2,y+0.9+((i*5)%3)*0.3);g.stroke();}
    if(T){
      /* Истина: шляпа усеяна глазами разного размера — следят и моргают */
      const eyes=[[-2.6,-39.4,1.5],[1.2,-40.8,1.1],[4.2,-38.6,1.4],[-0.4,-37.8,1],[-7.2,-34.8,1.3],[8.6,-34.6,1.4],[3.4,-33.4,0.9],[-3.8,-33.8,0.9],[0.6,-33.6,1.1]];
      eyes.forEach(([x,y,r],i)=>{const bl=Math.sin(t*1.7+i*2.3+ph*4)>0.93?0.15:1,lx=(m.lookX||0)*0.5,ly=(m.lookY||0)*0.4;
        g.fillStyle='#2a1208';g.beginPath();g.ellipse(x,y,r*1.2,r*0.95*bl+0.15,0,0,TAU);g.fill();
        g.fillStyle='#f6ece2';g.beginPath();g.ellipse(x,y,r,r*0.8*bl,0,0,TAU);g.fill();
        if(bl>0.5){g.strokeStyle='rgba(190,20,40,.8)';g.lineWidth=0.25;g.beginPath();g.moveTo(x-r*0.95,y);g.lineTo(x-r*0.4,y);g.moveTo(x+r*0.9,y-r*0.2);g.lineTo(x+r*0.4,y-r*0.1);g.stroke();
          g.fillStyle=i%3===0?'#c01830':'#8a1a20';g.beginPath();g.arc(x+lx*r*0.5,y+ly*r*0.4,r*0.5,0,TAU);g.fill();g.fillStyle='#0a0204';g.beginPath();g.arc(x+lx*r*0.5,y+ly*r*0.4,r*0.22,0,TAU);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(x+lx*r*0.5-r*0.18,y+ly*r*0.4-r*0.2,r*0.14,0,TAU);g.fill();}
        g.strokeStyle='#2a1208';g.lineWidth=0.3;g.beginPath();g.ellipse(x,y,r,r*0.8*bl,0,Math.PI*1.1,Math.PI*1.9);g.stroke();});
      /* дыры и кровь на шляпе */
      lmRosaryDrip(g,8.6,-33.4,t,ph*5,3.4,0.9);lmRosaryDrip(g,-7.2,-33.6,t+0.5,ph*3,2.6,0.85);
    }else{
      lmRim(g,q=>{q.strokeStyle='rgba(255,240,190,.35)';q.lineWidth=0.7;q.beginPath();q.moveTo(-4.6,-37);q.bezierCurveTo(-4.8,-40.4,-2,-41.6,1,-41.8);q.stroke();});
    }
    g.restore();
  });
  /* ----- ножницы и ближняя рука поверх корпуса ----- */
  grp(()=>{
    lmRosaryShears(g,sx,sy,sAng,op,T,t,ph,T);
    /* ближняя рука: плечо, локоть, кисть сжимает ручку */
    const sh=[1.6,-25.4],nhx=hx+(-9-hx)*th,nhy=hy+(-15-hy)*th-Math.sin(th*Math.PI)*0,ik=lmRosaryIK(sh[0],sh[1],nhx,nhy,T?6.4:5.4,T?6.8:5.6,true);
    g.beginPath();g.ellipse(sh[0],sh[1]+0.2,2.2,2.4,0.3,0,TAU);mobPath(g,SH,sh[0]-0.4,sh[1]-0.6,2.4,true);
    lmRosaryTube(g,sh[0],sh[1],ik[2],ik[3],T?2.9:3.5,3,SH,{bg:1.1});
    if(!T){lmRosaryTube(g,ik[2],ik[3],ik[0]-0.6,ik[1]-0.2,3.5,3,SH,{});
      /* закатанный рукав и кисть */
      lmRosaryTube(g,ik[0]-2.2,ik[1]-0.4,ik[0]-1.2,ik[1]-0.2,3.7,3.7,shadeHex(SH,0.14),{});
      g.beginPath();g.ellipse(ik[0]+0.2,ik[1],1.9,1.6,0,0,TAU);mobPath(g,SK,ik[0]-0.2,ik[1]-0.4,1.9);
      g.strokeStyle='#b07a58';g.lineWidth=0.3;for(const o of [-0.7,0,0.7]){g.beginPath();g.moveTo(ik[0]+0.6,ik[1]-0.8+o*0.5);g.lineTo(ik[0]+1.6,ik[1]-0.5+o*0.5);g.stroke();}
    }else{
      /* длинное бледное предплечье, перчатка, лишние пальцы */
      lmRosaryTube(g,ik[2],ik[3],ik[0]-0.6,ik[1]-0.2,2.6,2.2,'#d8d4c6',{});
      g.beginPath();g.ellipse(ik[0]+0.2,ik[1],1.8,1.5,0,0,TAU);mobPath(g,'#e4e0d2',ik[0],ik[1]-0.4,1.8);
      g.strokeStyle='#d8d4c6';g.lineWidth=0.7;g.lineCap='round';for(let q=0;q<5;q++){g.beginPath();g.moveTo(ik[0]+0.6,ik[1]-1+q*0.55);g.quadraticCurveTo(ik[0]+2.6,ik[1]-1.6+q*0.55,ik[0]+3.4+q*0.1,ik[1]-0.4+q*0.7);g.stroke();}
      g.fillStyle='#1a1210';for(let q=0;q<5;q++){g.beginPath();g.arc(ik[0]+3.4+q*0.1,ik[1]-0.4+q*0.7,0.3,0,TAU);g.fill();}
    }
    /* семя-колючка в кулаке при замахе */
    if(th>0.12){const px=ik[0]+(T?2:1.2),py=ik[1]-1.6;mobGlow(g,px,py,4+th*2,T?'#ff2a3a':'#ff8aa0',0.55*th);
      for(let i=0;i<7;i++){const a=i/7*TAU+t;lmRosaryThorn(g,px+Math.cos(a)*1.3,py+Math.sin(a)*1.3,a,1.5,0.5,'#e8d8c0');}
      g.beginPath();g.arc(px,py,1.7,0,TAU);mobPath(g,T?'#5a1822':'#7a4a28',px,py,1.8);}
  });
  g.restore();
};
/* ---------- Лепестковая дева ---------- */
/* лепесток-капля от основания (x,y) по направлению ang: длина L, ширина w; с жилкой и светлой кромкой */
function lmRosaryPetal(g,x,y,ang,L,w,c,veinC,rimA){
  g.save();g.translate(x,y);g.rotate(ang);
  g.beginPath();g.moveTo(0,0);g.bezierCurveTo(L*0.2,-w*0.9,L*0.8,-w*1.05,L,-w*0.12);g.bezierCurveTo(L*1.02,w*0.1,L*0.8,w*1.05,L*0.5,w*0.92);g.bezierCurveTo(L*0.2,w*0.8,L*0.06,w*0.3,0,0);g.closePath();
  mobPath(g,c,L*0.4,-w*0.3,L*0.62,true);
  g.strokeStyle=shadeHex(c,-0.38);g.lineWidth=0.55;g.lineJoin='round';g.stroke();
  g.save();g.clip();
  if(veinC!==false){g.strokeStyle=veinC||shadeHex(c,-0.3);g.lineWidth=0.3;g.beginPath();g.moveTo(L*0.08,0);g.quadraticCurveTo(L*0.5,w*0.08,L*0.92,-w*0.06);g.moveTo(L*0.4,0.04);g.lineTo(L*0.66,-w*0.5);g.moveTo(L*0.42,0.06);g.lineTo(L*0.62,w*0.5);g.stroke();}
  g.strokeStyle='rgba(255,226,238,'+(rimA==null?0.45:rimA)+')';g.lineWidth=0.4;g.beginPath();g.moveTo(L*0.12,-w*0.55);g.quadraticCurveTo(L*0.5,-w*0.95,L*0.92,-w*0.4);g.stroke();
  g.restore();g.restore();
}
/* крыло феи: корень в (0,0), вперёд по +x; fl — взмах; T — рваное костяное */
function lmRosaryWing(g,ang,len,fl,T,far,t,seed){
  g.save();g.rotate(ang+fl*0.3);g.scale(1,0.86+0.14*Math.abs(fl));
  const L=len;
  if(!T){
    const gr=g.createLinearGradient(0,0,L,0);gr.addColorStop(0,far?'rgba(255,216,236,.7)':'rgba(255,240,250,.85)');gr.addColorStop(0.6,far?'rgba(236,170,214,.45)':'rgba(255,196,228,.55)');gr.addColorStop(1,far?'rgba(206,150,226,.4)':'rgba(222,180,255,.5)');
    g.beginPath();g.moveTo(0,0);g.bezierCurveTo(L*0.2,-L*0.34,L*0.66,-L*0.46,L*1.02,-L*0.2);g.bezierCurveTo(L*1.12,-L*0.02,L*0.92,L*0.22,L*0.56,L*0.3);g.bezierCurveTo(L*0.28,L*0.3,L*0.08,L*0.16,0,0);g.closePath();
    g.fillStyle=gr;g.fill();
    g.save();g.clip();
    g.strokeStyle='rgba(255,120,170,'+(far?0.45:0.65)+')';g.lineWidth=0.35;g.lineCap='round';
    for(const [a,b,c,d] of [[0.5,-0.18,1.0,-0.2],[0.45,-0.05,1.04,-0.02],[0.4,0.06,0.9,0.2],[0.3,-0.2,0.7,-0.4],[0.3,0.12,0.6,0.28]]){g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(L*a,L*b,L*c,L*d);g.stroke();}
    g.lineWidth=0.25;for(const [a,b,c,d] of [[0.62,-0.17,0.72,-0.34],[0.82,-0.19,0.92,-0.06],[0.7,0.02,0.82,0.18],[0.5,-0.06,0.6,0.12]]){g.beginPath();g.moveTo(L*a,L*b);g.lineTo(L*c,L*d);g.stroke();}
    if(!far){g.fillStyle='rgba(255,255,255,.4)';g.beginPath();g.ellipse(L*0.4,-L*0.2,L*0.3,L*0.07,-0.25,0,TAU);g.fill();}
    g.restore();
    g.strokeStyle=far?'rgba(230,140,200,.8)':'rgba(255,150,205,.95)';g.lineWidth=0.5;g.lineJoin='round';g.stroke();
    if(!far){g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=0.5;g.beginPath();g.moveTo(L*0.1,-L*0.22);g.bezierCurveTo(L*0.3,-L*0.36,L*0.66,-L*0.45,L*1.02,-L*0.2);g.stroke();}
  }else{
    /* Истина: костяные лучи с обрывками гнилой перепонки */
    const rays=seed===1?[[0.5,-0.38,0.9,-0.4],[0.5,-0.1,1.14,-0.06],[0.36,0.12,0.6,0.26]]:[[0.5,-0.34,1.04,-0.3],[0.46,-0.06,0.82,-0.02],[0.34,0.14,0.86,0.28]];
    const mem=far?'rgba(46,30,44,.75)':'rgba(70,44,62,.85)';
    for(let i=0;i<rays.length-1;i++){const a=rays[i],b=rays[i+1];
      if((i+seed)%3===1)continue; /* дыры — перепонка выедена */
      g.beginPath();g.moveTo(0,0);g.lineTo(L*a[2],L*a[3]);
      const mx=(a[2]+b[2])/2,my=(a[3]+b[3])/2;
      g.lineTo(L*(mx*0.84+0.02),L*(my*0.84+0.04));g.lineTo(L*(b[2]*0.92),L*(b[3]*0.92+0.03));g.lineTo(L*b[2],L*b[3]);g.closePath();
      g.fillStyle=mem;g.fill();
      g.strokeStyle='rgba(18,8,16,.9)';g.lineWidth=0.4;g.stroke();
      g.strokeStyle='rgba(150,30,50,.5)';g.lineWidth=0.25;g.beginPath();g.moveTo(L*0.1,0);g.lineTo(L*mx*0.9,L*my*0.9);g.stroke();}
    g.lineCap='round';
    for(let i=0;i<rays.length;i++){const a=rays[i];
      g.strokeStyle='#1c1016';g.lineWidth=1.5;g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(L*a[0],L*a[1],L*a[2],L*a[3]);g.stroke();
      g.strokeStyle=far?'#7a6c5a':'#b8ab92';g.lineWidth=0.8;g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(L*a[0],L*a[1],L*a[2],L*a[3]);g.stroke();
      g.fillStyle=far?'#6a5a4a':'#2a1a14';g.beginPath();g.moveTo(L*a[2]-0.5,L*a[3]-0.5);g.lineTo(L*a[2]+1.8,L*a[3]+0.4);g.lineTo(L*a[2]-0.4,L*a[3]+0.8);g.fill();
      g.fillStyle=far?'#9a8c78':'#e8dcc0';g.beginPath();g.arc(L*a[0]*0.95,L*a[1]*0.9,0.7,0,TAU);g.fill();}
    /* нитки обрывков */
    g.strokeStyle='rgba(120,100,110,.7)';g.lineWidth=0.25;for(let i=0;i<4;i++){const a=rays[i%rays.length];g.beginPath();g.moveTo(L*a[2],L*a[3]);g.lineTo(L*a[2]-1+i*0.3,L*a[3]+3.4+Math.sin(t*3+i)*0.6);g.stroke();}
  }
  g.restore();
}
/* кисть: ладонь и пальцы; len — длина пальцев, ang — направление, claw — когти (Истина) */
function lmRosaryHand(g,x,y,ang,c,len,T,spread){
  g.save();g.translate(x,y);g.rotate(ang);
  g.beginPath();g.ellipse(0.4,0,1.3,1.1,0,0,TAU);mobPath(g,c,0,-0.2,1.4,true);
  g.lineCap='round';const n=T?4:4;
  for(let i=0;i<n;i++){const o=(i-(n-1)/2)*(spread||0.34),l=len*(1-Math.abs(i-1.2)*0.08);
    g.strokeStyle=shadeHex(c,-0.55);g.lineWidth=T?0.75:0.95;g.beginPath();g.moveTo(1,0);g.quadraticCurveTo(1+l*0.5,o*l*0.5,1+l,o*l);g.stroke();
    g.strokeStyle=c;g.lineWidth=T?0.45:0.62;g.beginPath();g.moveTo(1,0);g.quadraticCurveTo(1+l*0.5,o*l*0.5,1+l,o*l);g.stroke();
    if(T){g.fillStyle='#14090e';g.beginPath();g.moveTo(1+l,o*l-0.25);g.lineTo(1+l+1,o*l+0.1);g.lineTo(1+l,o*l+0.3);g.fill();}}
  g.restore();
}
LM_MODEL.lfairy=function(g,m,FY,t,T,st,k,wv,ph){
  const sp=lmRosaryE(m,'sp',st==='spin'?k:0,t,12),fl=Math.sin(t*14+ph),sl=Math.sin(t*2.4+ph*3),sw=Math.sin(t*3+ph);
  const tilt=-0.08+sw*0.04+sp*Math.sin(t*20)*0.08;
  g.save();g.scale(0.86,0.86);g.rotate(tilt);
  if(!T){
    const SK='#f6b8c6',SKD='#e8a6b8',PK='#ff8aac',PKD='#d8467a',PKL='#ffb4cc';
    mobGlow(g,0,-2,22,'#ff9ac4',0.28+sp*0.3);
    /* дальние крылья */
    g.save();g.translate(-1.2,-6.2);lmRosaryWing(g,-1.9,14.5,-fl*0.9,false,true,t,1);lmRosaryWing(g,2.4,9.5,-fl*0.7,false,true,t,2);g.restore();
    /* ближние крылья */
    g.save();g.translate(-1.8,-6);lmRosaryWing(g,-2.35,16.5,fl,false,false,t,1);lmRosaryWing(g,2.75,10.5,fl*0.8,false,false,t,2);g.restore();
    /* дальняя рука и нога — темнее */
    {const hx=-7.6-sp*1,hy=1-sp*18,ik=lmRosaryIK(-0.6,-6.2,hx,hy,5,5.2,true);
     lmRosaryTube(g,-0.6,-6.2,ik[2],ik[3],2,1.6,shadeHex(SK,-0.14),{});lmRosaryTube(g,ik[2],ik[3],ik[0],ik[1],1.6,1.2,shadeHex(SK,-0.14),{});
     lmRosaryHand(g,ik[0],ik[1],Math.atan2(ik[1]-ik[3],ik[0]-ik[2]),shadeHex(SK,-0.14),2.4,false);}
    {const kx=4.2+sp*2,ky=9.4,fx=3+sp*3,fy=16.6;
     lmRosaryTube(g,-0.6,4.4,kx,ky,2.4,1.7,shadeHex(SK,-0.14),{});lmRosaryTube(g,kx,ky,fx,fy,1.7,1.1,shadeHex(SK,-0.14),{});
     /* пуанта */
     g.beginPath();g.moveTo(fx-0.9,fy-1.2);g.quadraticCurveTo(fx,fy-1.8,fx+0.9,fy-1.2);g.quadraticCurveTo(fx+1,fy+1.6,fx+0.2,fy+2.4);g.quadraticCurveTo(fx-0.8,fy+1.6,fx-0.9,fy-1.2);g.closePath();mobPath(g,shadeHex(PK,-0.2),fx,fy,2,true);}
    /* юбка: задний ряд лепестков, потом ноги, потом передний ряд */
    const fan=0.55+sp*0.95;
    for(let i=0;i<6;i++){const a=Math.PI/2+(i-2.5)*0.4*(1+sp*1.2)+Math.sin(t*3+i)*0.07;lmRosaryPetal(g,0,3,a,10.4+((i*7)%3)*0.7,3.6,i%2?'#e85c86':'#d8467a','#a82a58',0.2);}
    /* ближняя нога выглядывает из-под юбки */
    {const kx=0.8,ky=10.6,fx=-1.8,fy=19.6;
     lmRosaryTube(g,0.6,4.6,kx,ky,2.5,1.8,SK,{});lmRosaryTube(g,kx,ky,fx,fy,1.8,1.1,SK,{});
     g.beginPath();g.moveTo(fx-1,fy-1.4);g.quadraticCurveTo(fx,fy-2,fx+1,fy-1.4);g.quadraticCurveTo(fx+0.9,fy+1.6,fx-0.2,fy+2.6);g.quadraticCurveTo(fx-1.1,fy+1.6,fx-1,fy-1.4);g.closePath();mobPath(g,PK,fx,fy,2,true);
     g.strokeStyle='#ffd8e4';g.lineWidth=0.35;g.beginPath();g.moveTo(kx-0.4,ky+3);g.quadraticCurveTo(kx-1.2,ky+5,fx+0.2,fy-1);g.stroke();}
    for(let i=0;i<5;i++){const a=Math.PI/2+(i-2)*0.52*(1+sp*1.1)+0.22+Math.sin(t*3+i*1.3)*0.08;lmRosaryPetal(g,0.2,3,a,9.2+((i*5)%3)*0.7,3.8,i%2?PKL:PK,'#c8386a',0.5);}
    /* лиф: лепестки, обнимающие грудь, пояс-лента */
    g.beginPath();g.moveTo(-3,-6.8);g.bezierCurveTo(-3.8,-3.6,-2,-1.2,-2.6,3.6);g.lineTo(2.6,3.6);g.bezierCurveTo(2.2,-1.2,3.8,-3.6,3.2,-6.8);g.quadraticCurveTo(0.2,-8,-3,-6.8);g.closePath();mobPath(g,PK,-0.6,-3,6.5);
    g.save();g.clip();g.fillStyle='rgba(170,30,90,.22)';g.beginPath();g.ellipse(2.6,0,2.2,5,0,0,TAU);g.fill();g.restore();
    for(const [x,a,l,c] of [[-2.2,-1.95,5.6,PKD],[2.4,-1.2,5.6,PKD],[0,-1.57,5.4,PKL]]){lmRosaryPetal(g,x*0.8,-0.2,a,l,2.6,c,false,0.4);}
    g.strokeStyle='#ffe0e8';g.lineWidth=1.1;g.lineCap='round';g.beginPath();g.moveTo(-3,3.2);g.quadraticCurveTo(0,4.6,3.2,3);g.stroke();
    g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=0.35;g.beginPath();g.moveTo(-3,2.6);g.quadraticCurveTo(0,4,3.2,2.4);g.stroke();
    /* шея */
    lmRosaryTube(g,0.4,-6.8,0.8,-9.4,2,1.8,SK,{});
    /* голова */
    g.save();g.translate(1.2,-13+sl*0.2);g.rotate(0.1+sl*0.03);g.scale(1.14,1.14);
    /* волосы позади */
    lmFluff(g,-1.6,0.6,3.4,4.4,9,0.14,3);mobPath(g,'#d0366a',-2,-1.6,4.4,true);
    g.strokeStyle='rgba(255,150,190,.5)';g.lineWidth=0.35;g.beginPath();g.moveTo(-2.8,-2.6);g.quadraticCurveTo(-3.6,1,-2.4,4);g.stroke();
    /* лицо */
    g.beginPath();g.moveTo(-2.2,-2.8);g.quadraticCurveTo(-3.2,0.6,-1,3.2);g.quadraticCurveTo(1.4,4.8,3.4,3.4);g.quadraticCurveTo(4.6,2.4,4.6,0.6);g.quadraticCurveTo(5.6,0.2,5.4,-0.6);g.quadraticCurveTo(4.8,-1.4,4.4,-2.6);g.quadraticCurveTo(1.6,-4.6,-2.2,-2.8);g.closePath();
    mobPath(g,SK,0.2,-0.8,5.4,true);
    g.save();g.clip();g.fillStyle='rgba(255,130,160,.34)';g.beginPath();g.ellipse(3,1.6,1.6,1,0,0,TAU);g.fill();g.fillStyle='rgba(220,110,150,.18)';g.beginPath();g.ellipse(0,4,5,1.4,0,0,TAU);g.fill();g.restore();
    /* закрытый глаз с ресницами и тень века */
    g.strokeStyle='#8a3a58';g.lineWidth=0.55;g.lineCap='round';g.beginPath();g.moveTo(1.4,-0.4);g.quadraticCurveTo(2.6,0.9,4,-0.3);g.stroke();
    g.lineWidth=0.35;for(const [a,b] of [[3.7,-0.1],[4.2,-0.4],[1.6,-0.1]]){g.beginPath();g.moveTo(a,b);g.lineTo(a+0.7,b-0.6);g.stroke();}
    g.fillStyle='rgba(255,150,200,.5)';g.beginPath();g.ellipse(2.7,-1.1,1.7,0.5,0.1,0,TAU);g.fill();
    g.strokeStyle='#b04a6a';g.lineWidth=0.35;g.beginPath();g.moveTo(1.6,-1.8);g.quadraticCurveTo(3,-2.5,4.4,-1.7);g.stroke();
    /* нос и улыбка */
    g.strokeStyle='#d8909c';g.lineWidth=0.4;g.beginPath();g.moveTo(4.7,0.1);g.quadraticCurveTo(5.5,0.7,4.7,1.1);g.stroke();
    g.strokeStyle='#c8506e';g.lineWidth=0.5;g.beginPath();g.moveTo(2.6,2.7);g.quadraticCurveTo(3.8,3.5,4.6,2.4);g.stroke();
    g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.ellipse(-0.6,-2.2,1.4,0.6,-0.4,0,TAU);g.fill();
    /* чёлка набок */
    g.beginPath();g.moveTo(-2.6,-2.8);g.quadraticCurveTo(0.8,-5.6,4.2,-3.4);g.quadraticCurveTo(1.4,-3.8,-0.2,-2.2);g.quadraticCurveTo(-1.4,-1.4,-2.6,-2.8);g.closePath();mobPath(g,'#e04a7a',0.6,-4,4,true);
    /* роза-причёска: лепестки спирально, листья у основания */
    lmRosaryLeaf(g,-3.2,-3.2,-2.7,4,1.1,'#2a8a4a','#4ab868','#1a5a30');lmRosaryLeaf(g,-2,-3.4,-0.6,3.6,1,'#2a8a4a','#4ab868','#1a5a30');
    lmRosaryRose(g,-2.6,-5.2,3.7,'#ff4a78');
    for(const [x,y,r] of [[-3.8,-6.4,1.1],[2.8,-7.8,0.9]]){g.fillStyle='rgba(255,200,220,.85)';g.beginPath();g.arc(x,y,r,0,TAU);g.fill();}
    g.restore();
    /* ближняя рука: изящно вперёд-вверх, манжета-лепесток на плече */
    {const hx=11-sp*3,hy=-11.6-sp*5,ik=lmRosaryIK(1.8,-6.2,hx,hy,5.4,5.6,false);
     lmRosaryTube(g,1.8,-6.2,ik[2],ik[3],2.1,1.7,SK,{});lmRosaryTube(g,ik[2],ik[3],ik[0],ik[1],1.7,1.3,SK,{});
     lmRosaryHand(g,ik[0],ik[1],Math.atan2(ik[1]-ik[3],ik[0]-ik[2]),SK,2.8,false);
     lmRosaryPetal(g,1.2,-7,-0.6,4.4,2.2,PKL,false,0.4);}
    /* лепестки и искры вокруг; в кружении — кольцо из лепестков */
    {const n=5+Math.round(sp*4);for(let i=0;i<n;i++){const a=t*(0.9+sp*6)+i*TAU/n+ph,r=13+sp*7+Math.sin(t*2+i)*1.4,x=Math.cos(a)*r,y=Math.sin(a)*r*0.7-1;
      g.save();g.translate(x,y);g.rotate(a*2);g.globalAlpha=0.55+0.3*Math.sin(t*3+i)+sp*0.2;g.beginPath();g.ellipse(0,0,1.7+sp*0.8,0.9+sp*0.4,0,0,TAU);g.fillStyle=i%2?'#ffb4cc':'#ff8aac';g.fill();g.restore();}
     if(sp>0.05){g.strokeStyle='rgba(255,150,200,'+(0.2+0.4*sp)+')';g.lineWidth=0.8;g.setLineDash([2,2]);g.beginPath();g.ellipse(0,-1,13+sp*7,(13+sp*7)*0.7,0,0,TAU);g.stroke();g.setLineDash([]);}}
    for(const [x,y] of [[-12,-4],[10,6],[-5,-17],[7,-18]]){const a=0.5+0.5*Math.sin(t*4+x);g.fillStyle='rgba(255,240,250,'+a*0.9+')';g.beginPath();g.moveTo(x,y-1.4);g.lineTo(x+0.4,y-0.4);g.lineTo(x+1.4,y);g.lineTo(x+0.4,y+0.4);g.lineTo(x,y+1.4);g.lineTo(x-0.4,y+0.4);g.lineTo(x-1.4,y);g.lineTo(x-0.4,y-0.4);g.closePath();g.fill();}
  }else{
    const SK='#b4baa8',SKD='#6a7266',BN='#e2d8be',RD='#7a1228',VN='#3a4224',VNL='#8a8a58';
    mobGlow(g,0,-2,22,'#c0203a',0.16+sp*0.22);
    const slump=1-sp,jerk=sp*Math.sin(t*26)*0.6;
    /* нити-лозы, на которых висит тело: вверх за пределы кадра */
    lmRosaryVine(g,[[1.4,-9],[0.6,-15],[2.4+Math.sin(t*1.4+ph)*0.6,-21],[1,-26]],0.9,VN,1.8,1,VNL);
    lmRosaryVine(g,[[4.4+sp*3,7.8-sp*14],[6.6,-2],[5.2+Math.sin(t*1.7+ph)*0.8,-12],[7,-24]],0.7,VN,1.5,2,VNL);
    lmRosaryVine(g,[[-1.6-sp*3,7.4-sp*14],[-5,-2],[-4+Math.sin(t*1.5+ph+2)*0.8,-12],[-6,-23]],0.7,VN,1.5,3,VNL);
    /* крылья: костяные лучи с гнилой перепонкой */
    g.save();g.translate(-1.2,-6.2);lmRosaryWing(g,-1.9,14,-fl*0.5-sp*0.4,true,true,t,1);lmRosaryWing(g,2.4,9,-fl*0.4,true,true,t,2);g.restore();
    g.save();g.translate(-1.8,-6);lmRosaryWing(g,-2.35,16,fl*0.6-sp*0.3,true,false,t,2);lmRosaryWing(g,2.75,10,fl*0.5,true,false,t,1);g.restore();
    /* дальние конечности: болтаются */
    const sway2=Math.sin(t*1.9+ph)*0.8;
    {const hx=-3.4-sp*5+sway2,hy=9.6-sp*17,ik=lmRosaryIK(-0.6,-6.2,hx,hy,5.6,6,true);
     lmRosaryTube(g,-0.6,-6.2,ik[2],ik[3],2,1.5,shadeHex(SK,-0.2),{});lmRosaryTube(g,ik[2],ik[3],ik[0],ik[1],1.4,1,shadeHex(SK,-0.2),{});
     lmRosaryHand(g,ik[0],ik[1],Math.atan2(ik[1]-ik[3],ik[0]-ik[2]),shadeHex(SK,-0.2),3.8,true,0.3);}
    {const kx=-2.6,ky=9.2,fx=1.2+sway2*0.4,fy=16.6;
     lmRosaryTube(g,-0.6,4.4,kx,ky,2.6,1.8,shadeHex(SK,-0.2),{});lmRosaryTube(g,kx,ky,fx,fy,1.8,1,shadeHex(SK,-0.2),{});
     g.strokeStyle=shadeHex(BN,-0.3);g.lineWidth=0.5;g.lineCap='round';for(let q=-1;q<=1;q++){g.beginPath();g.moveTo(fx,fy);g.lineTo(fx+q*0.7,fy+3.2);g.stroke();}}
    /* гнилая юбка: обрывки чёрных лепестков */
    for(let i=0;i<6;i++){const a=Math.PI/2+(i-2.5)*0.44*(1+sp*0.8)+Math.sin(t*2.4+i)*0.09;
      g.save();g.translate(0,3);g.rotate(a);g.beginPath();const L=7.4+((i*7)%4)*0.7,w=2.7;g.moveTo(0,0);g.bezierCurveTo(L*0.2,-w,L*0.7,-w,L*0.86,-w*0.3);g.lineTo(L,w*0.2);g.lineTo(L*0.82,w*0.5);g.lineTo(L*0.9,w);g.lineTo(L*0.6,w*0.8);g.bezierCurveTo(L*0.3,w*0.9,L*0.1,w*0.4,0,0);g.closePath();
      mobPath(g,i%2?'#3a2a34':'#2a1e28',L*0.4,-w*0.3,L*0.6);g.strokeStyle='rgba(150,60,80,.45)';g.lineWidth=0.3;g.beginPath();g.moveTo(1,0);g.lineTo(L*0.8,0);g.stroke();g.restore();}
    /* ближняя нога */
    {const kx=1.4,ky=10.6,fx=0.2+sway2*0.5,fy=19.6;
     lmRosaryTube(g,0.6,4.6,kx,ky,2.8,2,SK,{});lmRosaryTube(g,kx,ky,fx,fy,2,1.2,SK,{});
     g.strokeStyle=BN;g.lineWidth=0.5;g.lineCap='round';for(let q=-1;q<=1;q++){g.beginPath();g.moveTo(fx,fy);g.lineTo(fx+q*0.8,fy+3.6);g.stroke();}
     lmRosaryVine(g,[[kx-0.2,ky-1],[kx+1,ky+2],[kx-0.6,ky+4.4],[fx+0.6,fy-2.6]],0.6,VN,1.1,4,VNL);}
    for(let i=0;i<4;i++){const a=Math.PI/2+(i-1.5)*0.52*(1+sp*0.8)+0.2+Math.sin(t*2.6+i*1.3)*0.1;
      g.save();g.translate(0.2,3);g.rotate(a);const L=6.6+((i*5)%3)*0.7,w=2.9;g.beginPath();g.moveTo(0,0);g.bezierCurveTo(L*0.2,-w,L*0.7,-w*0.9,L*0.8,-w*0.4);g.lineTo(L,w*0.1);g.lineTo(L*0.76,w*0.4);g.lineTo(L*0.84,w*0.9);g.bezierCurveTo(L*0.5,w*1.1,L*0.2,w*0.6,0,0);g.closePath();
      mobPath(g,i%2?'#4a3440':'#3a2a34',L*0.4,-w*0.3,L*0.6);g.restore();}
    /* торс: рёбра через рваный лиф, вокруг — лоза */
    lmRosaryTube(g,-0.6,3.8,0.6,-6.8,5.4,6,SK,{bg:0.9});
    g.beginPath();g.moveTo(-2.4,-5.8);g.lineTo(2.6,-6.2);g.lineTo(3,-1.4);g.lineTo(1.4,2.4);g.lineTo(-1.4,2);g.lineTo(-2.8,-1.6);g.closePath();g.fillStyle='#1c0610';g.fill();
    g.strokeStyle=BN;g.lineWidth=0.7;g.lineCap='round';for(let i=0;i<4;i++){g.beginPath();g.moveTo(-2.4+i*0.2,-5+i*1.8);g.quadraticCurveTo(0.4,-4+i*1.8,2.9-i*0.3,-5.2+i*1.8);g.stroke();}
    g.strokeStyle=BN;g.lineWidth=0.7;g.beginPath();g.moveTo(0.4,-6);g.lineTo(0.4,1.8);g.stroke();
    /* остатки лифа — чёрные лоскуты */
    g.fillStyle='#2a1e28';g.beginPath();g.moveTo(-3,-6.6);g.lineTo(-2,-3);g.lineTo(-3.2,0);g.lineTo(-3.4,-2.6);g.closePath();g.fill();g.beginPath();g.moveTo(3.2,-6.4);g.lineTo(3.2,-2.4);g.lineTo(2.6,-0.2);g.closePath();g.fill();
    lmRosaryVine(g,[[-3.4,-6.4],[3.4,-4.4],[-3.2,-1.8],[3.2,0.4],[-2.8,2.6]],0.9,VN,1.4,0,VNL);
    lmRosaryRose(g,-2.4,-0.8,1.8,RD,1);lmRosaryRose(g,2.8,2.6,1.5,RD,1);
    g.fillStyle='rgba(150,10,30,.8)';g.beginPath();g.ellipse(2.6,-3,0.6,1,0,0,TAU);g.fill();
    lmRosaryDrip(g,-2.4,0.4,t,ph*3,3.6,0.9);lmRosaryDrip(g,2.8,3.8,t+0.4,ph*5,3,0.9);
    /* шея скручена: позвонки */
    for(let i=0;i<3;i++){g.beginPath();g.ellipse(0.4+i*0.9,-7.6-i*1.2,1.1,0.9,0.3,0,TAU);lmRosaryBP(g,BN,0.2+i*0.9,-7.9-i*1.2,1.2);}
    lmRosaryVine(g,[[-1.2,-8.2],[1.8,-7.4],[2.8,-9.4]],0.7,VN,1,5,VNL);
    /* голова: череп, свёрнутый набок, челюсть отвисла */
    g.save();g.translate(3.8+jerk,-11.4-sp*1);g.rotate(0.6*slump-0.55*sp+Math.sin(t*1.6+ph)*0.05);g.scale(1.22,1.22);
    /* спутанные волосы позади */
    for(let i=0;i<7;i++){g.strokeStyle=i%2?'#2a1822':'#1a0e14';g.lineWidth=0.7;g.lineCap='round';const ox=-2.6+i*0.3,wob=Math.sin(t*2+i)*0.5;g.beginPath();g.moveTo(ox,-2.4+i*0.4);g.quadraticCurveTo(ox-3-i*0.3+wob,2+i*0.6,ox-2.2+wob*1.5,6+i*0.8);g.stroke();}
    g.beginPath();g.moveTo(-3.6,0.4);g.bezierCurveTo(-4,-3.4,-1.4,-5.4,1.4,-5.2);g.bezierCurveTo(4.4,-5,5.2,-2.4,4.8,0.2);g.lineTo(3.4,1.8);g.bezierCurveTo(1.6,2.6,-1.4,2.6,-3.6,0.4);g.closePath();lmRosaryBP(g,BN,0.6,-2.4,5.4);
    g.save();g.clip();
    /* гниющая кожа на половине лица */
    g.fillStyle=SK;g.beginPath();g.moveTo(-4.4,-6);g.lineTo(0.6,-6);g.quadraticCurveTo(-0.4,-2,1,0.4);g.lineTo(-0.6,3);g.lineTo(-4.4,3);g.closePath();g.fill();
    g.fillStyle='rgba(58,66,48,.5)';g.beginPath();g.ellipse(-2,-1.4,1.6,1.4,0,0,TAU);g.fill();
    g.strokeStyle='rgba(60,40,30,.6)';g.lineWidth=0.3;g.beginPath();g.moveTo(1.6,-5);g.lineTo(2.2,-3.4);g.lineTo(1.4,-2.4);g.moveTo(3.4,-4.4);g.lineTo(3.8,-3);g.stroke();
    g.restore();
    /* глазницы: левая пустая с углём, правая под волосами */
    g.fillStyle='#10060a';g.beginPath();g.ellipse(3,-1.6,1.5,1.7,0.1,0,TAU);g.fill();g.beginPath();g.ellipse(-0.6,-1.4,1.3,1.5,-0.1,0,TAU);g.fill();
    const pu=0.7+0.3*Math.sin(t*5+ph);mobGlow(g,3,-1.6,4.4,'#ff2a3a',0.6*pu+sp*0.3);
    g.fillStyle='#ff5058';g.beginPath();g.arc(3.1+(m.lookX||0)*0.3,-1.6+(m.lookY||0)*0.2,0.65,0,TAU);g.fill();
    g.fillStyle='rgba(255,60,70,'+(0.4+0.3*Math.sin(t*4+1))+')';g.beginPath();g.arc(-0.6,-1.4,0.4,0,TAU);g.fill();
    lmRosaryDrip(g,3,-0.2,t,ph*2,3.4,0.9);
    /* нос-провал и вся пасть: челюсть отвисает */
    g.fillStyle='#10060a';g.beginPath();g.moveTo(1.4,0.5);g.lineTo(2.1,2);g.lineTo(0.8,2);g.closePath();g.fill();
    const jw=0.5+sp*0.7+Math.max(0,sl)*0.1;
    g.save();g.translate(-0.4,2.2);g.rotate(jw*0.6);
    g.beginPath();g.moveTo(-1,0);g.lineTo(5,0.2);g.quadraticCurveTo(5.4,1.8,3.6,2.6);g.lineTo(-0.6,2.2);g.closePath();lmRosaryBP(g,'#cfc3a6',2,1.2,3.4);
    g.fillStyle='#2a0610';g.beginPath();g.moveTo(-0.6,0.2);g.lineTo(4.8,0.3);g.lineTo(4,1);g.lineTo(-0.2,0.9);g.closePath();g.fill();
    lmTeeth(g,-0.2,0.2,4.6,5,1.1,'#f0e8d2',false);g.restore();
    lmTeeth(g,-0.4,2.2,4.8,6,1.2,'#f4ecd8');
    /* увядшая роза-причёска, свисающая набок */
    lmRosaryLeaf(g,-2,-4.6,-2.6,3.4,1,'#2a3a18','#3a4a22');
    lmRosaryRose(g,-2.4,-5.6,3,'#6a1224',1);
    lmRosaryRose(g,2.6,-6.2,1.3,'#8a1a30',1);
    lmRosaryDrip(g,-1.6,-3.4,t,ph*4,2.4,0.8);
    g.restore();
    /* ближняя рука болтается; кисть с длинными пальцами */
    {const hx=4+sp*5+Math.sin(t*1.9+ph+1)*0.8,hy=9.4-sp*17,ik=lmRosaryIK(1.8,-6.2,hx,hy,5.8,6.2,false);
     lmRosaryTube(g,1.8,-6.2,ik[2],ik[3],2.2,1.6,SK,{});lmRosaryTube(g,ik[2],ik[3],ik[0],ik[1],1.5,1.1,SK,{});
     lmRosaryVine(g,[[ik[2]-0.4,ik[3]-1],[ik[2]+1.2,ik[3]+0.8],[ik[0]-0.8,ik[1]-2]],0.6,VN,1,6,VNL);
     lmRosaryHand(g,ik[0],ik[1],Math.atan2(ik[1]-ik[3],ik[0]-ik[2]),SK,4,true,0.3);
     lmRosaryRose(g,ik[2]+0.2,ik[3]-0.4,1.2,RD,1);}
    /* осыпающиеся тёмные лепестки */
    {const n=5+Math.round(sp*4);for(let i=0;i<n;i++){const a=t*(0.8+sp*6)+i*TAU/n+ph,r=13+sp*7,x=Math.cos(a)*r,y=Math.sin(a)*r*0.7-1;
      g.save();g.translate(x,y);g.rotate(a*2);g.globalAlpha=0.55+0.3*Math.sin(t*3+i)+sp*0.2;g.beginPath();g.ellipse(0,0,1.7+sp*0.8,0.9+sp*0.4,0,0,TAU);g.fillStyle=i%2?'#8a1030':'#3a1822';g.fill();g.restore();}
     if(sp>0.05){g.strokeStyle='rgba(255,50,70,'+(0.2+0.4*sp)+')';g.lineWidth=0.8;g.setLineDash([2,2]);g.beginPath();g.ellipse(0,-1,13+sp*7,(13+sp*7)*0.7,0,0,TAU);g.stroke();g.setLineDash([]);}}
  }
  g.restore();
};
