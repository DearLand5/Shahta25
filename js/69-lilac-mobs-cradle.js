'use strict';
/* Модели мобов Колыбели (Лиловые небеса): Счётная овечка, Дрёма, Кошмар. Оба облика в одной функции, T — Истина; помощники — lmCradle* */
/* четырёхлучевая звёздочка (мерцает через a) */
function lmCradleStar(g,x,y,r,col,a){const ga=g.globalAlpha;g.globalAlpha=ga*a;g.fillStyle=col;g.beginPath();for(let i=0;i<8;i++){const an=i/8*TAU-Math.PI/2,rr=i%2?r*0.3:r;g.lineTo(x+Math.cos(an)*rr,y+Math.sin(an)*rr);}g.closePath();g.fill();g.globalAlpha=ga;}
/* клок шерсти: пушистая заливка с тонким внутренним контуром */
function lmCradleTuft(g,cx,cy,rx,ry,n,amp,seed,col,from,to,rot,ln,ramp){
  lmFluff(g,cx,cy,rx,ry,n,amp,seed,rot||0,from,to);g.closePath();
  if(ramp)lmCradleFill(g,cx-rx*0.3,cy-ry*0.4,Math.max(rx,ry),ramp);else mobPath(g,col,cx-rx*0.3,cy-ry*0.4,Math.max(rx,ry),true);
  g.strokeStyle=ln||shadeHex(col,-0.52);g.lineWidth=0.6;g.lineJoin='round';g.stroke();
}
/* заливка текущего контура объёмом в своих тонах: [свет, основной, тень] — тень цветная, а не серая */
function lmCradleFill(g,cx,cy,r,ramp){const gr=g.createRadialGradient(cx-r*0.2,cy-r*0.3,r*0.05,cx+r*0.1,cy+r*0.2,r*1.3);gr.addColorStop(0,ramp[0]);gr.addColorStop(0.42,ramp[1]);gr.addColorStop(1,ramp[2]);g.fillStyle=gr;g.fill();}
/* завиток шерсти: спираль */
function lmCradleSpiral(g,x,y,r,col,w,rot,turns){g.strokeStyle=col;g.lineWidth=w||0.5;g.lineCap='round';g.beginPath();const N=14,tt=(turns||1.6)*TAU;for(let i=0;i<=N;i++){const a=i/N*tt+(rot||0),rr=r*(0.15+0.85*i/N);i?g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr):g.moveTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}g.stroke();}
/* глазное яблоко: белок с объёмом, радужка, зрачок (круглый, щель или горизонтальная «овечья» полоска), прожилки, веко-тень, блик */
function lmCradleEye(g,x,y,rx,ry,o){
  o=o||{};const bl=o.bl==null?1:o.bl,ry2=Math.max(0.12,ry*bl);
  if(o.glow)mobGlow(g,x,y,rx*3.2,o.glow,o.ga||0.5);
  g.beginPath();g.ellipse(x,y,rx,ry2,o.rot||0,0,TAU);
  if(rx>=2.1)mobPath(g,o.w||'#f0e4d8',x,y,rx,true);else{g.fillStyle=o.w||'#f0e4d8';g.fill();}
  g.strokeStyle=o.ln||'rgba(40,8,18,.8)';g.lineWidth=Math.max(0.3,rx*0.17);g.stroke();
  if(bl>0.45){
    const lx=(o.lx||0)*rx*0.3,ly=(o.ly||0)*ry*0.25,ix=x+lx,iy=y+ly;
    if(o.vein&&rx>=1.5){g.strokeStyle='rgba(190,24,40,.7)';g.lineWidth=0.28;for(const a of [0.2,1.5,2.7,3.7,4.9]){g.beginPath();g.moveTo(x+Math.cos(a)*rx*0.96,y+Math.sin(a)*ry2*0.96);g.lineTo(x+Math.cos(a+0.2)*rx*0.55,y+Math.sin(a+0.2)*ry2*0.55);g.stroke();}}
    g.fillStyle=o.iris||'#b02a2a';g.beginPath();g.ellipse(ix,iy,rx*(o.ir||0.56),ry2*(o.ir||0.56)*1.05,0,0,TAU);g.fill();
    g.fillStyle=o.pupil||'#12040a';g.beginPath();
    if(o.hp)g.ellipse(ix,iy,rx*0.5*(o.ir?o.ir/0.56:1),ry2*0.17,0,0,TAU);else if(o.slit)g.ellipse(ix,iy,rx*0.15,ry2*0.55,0,0,TAU);else g.ellipse(ix,iy,rx*0.26,ry2*0.28,0,0,TAU);
    g.fill();
    if(rx>=1.3){g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.arc(ix-rx*0.22,iy-ry2*0.3,Math.max(0.2,rx*0.14),0,TAU);g.fill();}
  }
  if(o.lid){g.strokeStyle=o.lid;g.lineWidth=Math.max(0.35,rx*0.28);g.lineCap='round';g.beginPath();g.ellipse(x,y,rx*1.02,ry2*1.02,o.rot||0,Math.PI*1.05,Math.PI*1.95);g.stroke();}
}
/* раздвоенное копыто */
function lmCradleHoof(g,x,y,s,col,fw,ln){
  g.beginPath();g.moveTo(x-1.1*s,y-1.7*s);g.lineTo(x+1.2*s,y-1.7*s);g.lineTo(x+(2.6+fw)*s,y+0.6*s);g.lineTo(x-1.9*s,y+0.6*s);g.closePath();
  mobPath(g,col,x,y-1.5*s,2.4*s,true);g.strokeStyle=ln||shadeHex(col,-0.55);g.lineWidth=0.5;g.stroke();
  g.beginPath();g.moveTo(x+0.3*s,y-1.2*s);g.lineTo(x+0.5*s,y+0.6*s);g.stroke();
}
LM_MODEL.lsheep=function(g,m,FY,t,T,st,k,wv,ph){
  const air=!m.onGround,vy=m.vy||0,lift=air?clamp(-vy/420,-1,1):0,u=(lift+1)/2;
  const br=Math.sin(t*2.3+ph*4),lkx=m.lookX||0,lky=m.lookY||0;
  const s1=air?[0,0]:lmStep(m,0,2.6),s2=air?[0,0]:lmStep(m,Math.PI,2.6);
  /* цель ступни: на земле — под бедром, в прыжке — вытянута вперёд/назад, при падении — вниз */
  const foot=(hx,dir,sh)=>air?[hx+dir*(2+9*u),FY-1-6*u]:[hx+dir*sh[0]*0.0+sh[0],FY-0.5+sh[1]];
  g.save();
  if(air){g.translate(0,FY-10);g.rotate(-lift*0.13);g.scale(1-lift*0.04,1+lift*0.06);g.translate(0,-(FY-10));}
  if(!T)lmCradleSheepI(g,m,FY,t,ph,air,lift,u,br,lkx,lky,s1,s2,foot);else lmCradleSheepT(g,m,FY,t,ph,air,lift,u,br,lkx,lky,s1,s2,st,k);
  g.restore();
};
/* Счётная овечка — Иллюзия: пышное облако-шерсть, сонные глаза, звёздочки */
function lmCradleSheepI(g,m,FY,t,ph,air,lift,u,br,lkx,lky,s1,s2,foot){
  const FACE=['#fff8fb','#fbe4ee','#d89ab9'],LN='rgba(112,86,166,.82)';
  const W0=['#ffffff','#f6f0ff','#b9a6e4'],W1=['#f6eeff','#e0d4f5','#a68fd8'],W2=['#ffffff','#fefaff','#cfc0f0'],WB=['#e8ddfa','#c8b6e8','#8e76c4'];
  const LEG='#e2c2e0',HOOF='#6c4c80',tf=(x,y,rx,ry,n,sd,rp,a)=>lmCradleTuft(g,x,y,rx,ry,n,a||0.2,sd,'#cbbbec',null,null,0,LN,rp);
  /* дальние ноги — темнее, позади */
  for(const [hx,dir,sh,bk] of [[7.4,1,s2,false],[-7.4,-1,s2,true]]){const f=foot(hx,dir,sh);const e=lmLimb(g,hx,FY-8.4,f[0]+(air?0:dir*1.2),f[1],4.6,4.8,bk,2.2,1.3,shadeHex(LEG,-0.3));lmCradleHoof(g,e[0],e[1]+0.4,0.8,shadeHex(HOOF,-0.2),0.4);}
  /* хвостик-помпон */
  tf(-15.6,FY-16.2,3,2.8,7,7,W1,0.3);
  /* дальнее ухо: темнее */
  g.save();g.translate(8.8,FY-18);g.rotate(3.7+Math.sin(t*2.1)*0.05);
  g.beginPath();g.moveTo(0,-1.6);g.quadraticCurveTo(4,-3,7.6,-0.8);g.quadraticCurveTo(4,2,0,1.6);g.closePath();lmCradleFill(g,3,0,4,['#e8c0d6','#c898b8','#8a5e86']);g.strokeStyle='rgba(70,40,90,.8)';g.lineWidth=0.8;g.stroke();
  g.fillStyle='#b8648e';g.beginPath();g.moveTo(1,-0.8);g.quadraticCurveTo(3.8,-1.6,5.8,-0.7);g.quadraticCurveTo(3.8,0.8,1,0.9);g.fill();g.restore();
  /* ближние ноги (шерсть закрывает бёдра) */
  for(const [hx,dir,sh,bk] of [[5.2,1,s1,false],[-9.8,-1,s1,true]]){const f=foot(hx,dir,sh);const e=lmLimb(g,hx,FY-8.4,f[0],f[1],4.6,4.8,bk,2.4,1.4,LEG);lmCradleHoof(g,e[0],e[1]+0.4,0.9,HOOF,0.5);}
  /* тело-облако: большой клок, снизу темнее (цветная тень), сверху клубы светлее */
  lmCradleTuft(g,-3.2,FY-14.4,12.4,9.2,16,0.2,2.3,'#cbbbec',null,null,0,LN,W0);
  g.save();g.clip();g.fillStyle='rgba(120,92,196,.3)';g.beginPath();g.ellipse(-2,FY-3.6,14,5.4,0,0,TAU);g.fill();g.fillStyle='rgba(120,92,196,.14)';g.beginPath();g.ellipse(-14.4,FY-14,4,9,0,0,TAU);g.fill();g.restore();
  for(const [x,y,rx,ry,n,sd,rp] of [[-11.8,FY-11.4,5,4.6,8,1.1,W1],[-1.8,FY-9.4,6.4,3.8,9,6.6,WB],[7.2,FY-10.8,3.8,3.8,7,5.5,W1],[-12.8,FY-17.8,3.6,3.4,7,8.2,W0],[-9,FY-20.6,5.4,4.2,9,2.2,W2],[-3,FY-22.4,3.6,2.6,7,9.1,W2],[0.8,FY-20.4,6,4.4,10,3.3,W2],[7,FY-18,4.2,4,8,4.4,W0],[5.6,FY-23,2.8,2.1,6,9.7,W2]])tf(x,y,rx,ry,n,sd,rp);
  /* завитки на шерсти */
  for(const [x,y,r,rt] of [[-8,FY-14.4,2.2,0.4],[-1,FY-16,2.6,2.2],[4,FY-12.6,1.9,1],[-5,FY-9.4,1.7,3],[2.4,FY-20.4,1.8,0.2],[-11.2,FY-11.4,1.5,2],[-8.6,FY-20.4,1.5,1.4]])lmCradleSpiral(g,x,y,r,'rgba(142,112,206,.65)',0.5,rt);
  lmFur(g,[[-11,FY-22,1.2,-1.2],[-3,FY-25.2,1,-1.4],[3,FY-24.4,1.2,-1.2],[8,FY-21,1.2,-0.8],[-14,FY-15,-1.2,-0.4]],'rgba(255,255,255,.85)',0.55);
  /* шейный воротник и голова */
  const hb=Math.sin(t*1.7)*0.35;
  tf(7.8,FY-14.4+hb,4.8,5.2,9,9,W0);
  g.save();g.translate(0,hb);
  g.beginPath();g.ellipse(11.6,FY-15,5,4.8,0.1,0,TAU);lmCradleFill(g,10.4,FY-17.2,5.6,FACE);g.strokeStyle=LN;g.lineWidth=0.8;g.stroke();
  /* мордочка */
  g.beginPath();g.ellipse(15.2,FY-13.2,3.4,2.7,0.28,0,TAU);lmCradleFill(g,14.4,FY-14.4,3.6,['#fffafc','#fde8f1','#e2a6c4']);g.stroke();
  g.fillStyle='#d4607e';g.beginPath();g.ellipse(17.9,FY-14.3,1.05,0.85,0.3,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.arc(17.6,FY-14.6,0.3,0,TAU);g.fill();
  g.strokeStyle='#a0506e';g.lineWidth=0.5;g.lineCap='round';g.beginPath();g.moveTo(17.7,FY-13.4);g.lineTo(17.3,FY-12.4);g.quadraticCurveTo(16.2,FY-11.2,14.6,FY-12.2);g.stroke();
  g.fillStyle='rgba(255,112,166,.5)';g.beginPath();g.ellipse(12.4,FY-12.5,1.9,1.15,0,0,TAU);g.fill();
  /* ближнее ухо: розовая середина */
  g.save();g.translate(9.2,FY-16.6);g.rotate(2.6+Math.sin(t*2.1+1)*0.07);
  g.beginPath();g.moveTo(0,-2);g.quadraticCurveTo(4.6,-3.5,8.2,-0.9);g.quadraticCurveTo(4.6,2.5,0,2);g.closePath();lmCradleFill(g,3,-0.6,4.6,FACE);g.stroke();
  const eg=g.createLinearGradient(0,0,7,0);eg.addColorStop(0,'#f9b8d4');eg.addColorStop(1,'#ee82b0');g.fillStyle=eg;g.beginPath();g.moveTo(1,-1.1);g.quadraticCurveTo(4.6,-2.1,6.8,-0.7);g.quadraticCurveTo(4.6,1.5,1,1.3);g.fill();
  g.strokeStyle='rgba(206,72,128,.5)';g.lineWidth=0.35;g.beginPath();g.moveTo(1.4,0);g.lineTo(6.2,-0.4);g.stroke();g.restore();
  /* чёлка-кудряшка */
  tf(10.8,FY-19.6,4,2.8,8,4,W2,0.24);tf(14.2,FY-18.2,2,1.8,6,5,W0,0.3);lmCradleSpiral(g,10.6,FY-19.8,1.5,'rgba(142,112,206,.75)',0.45,0.5);
  /* глаз: сонное веко и ресницы; при моргании закрывается */
  const bl=(Math.sin(m.anim*1.1+ph*7)>0.985)?0.1:1,ex=13.1,ey=FY-16;
  if(bl>0.5){const ig=g.createRadialGradient(ex+0.2,ey+1.2,0.2,ex,ey+0.6,2.6);ig.addColorStop(0,'#cfa6f6');ig.addColorStop(0.55,'#6e3ea6');ig.addColorStop(1,'#2a1448');
    g.fillStyle=ig;g.beginPath();g.ellipse(ex+lkx*0.2,ey+0.5,2.15,2.5,0,0,TAU);g.fill();g.fillStyle='#140626';g.beginPath();g.arc(ex+lkx*0.2+0.1,ey+0.7,0.95,0,TAU);g.fill();
    g.fillStyle='#fff';g.beginPath();g.arc(ex-0.7+lkx*0.2,ey-0.2,0.75,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.arc(ex+0.8,ey+1.6,0.32,0,TAU);g.fill();}
  const lid=bl>0.5?-1.1:1;
  g.fillStyle='#fcdcea';g.beginPath();g.moveTo(ex-2.7,ey+0.4);g.quadraticCurveTo(ex,ey-3.6,ex+2.7,ey+0.4);g.quadraticCurveTo(ex,ey+lid+0.9,ex-2.7,ey+0.4);g.fill();
  g.strokeStyle='#5a3470';g.lineWidth=0.7;g.lineCap='round';g.beginPath();g.moveTo(ex-2.6,ey+0.4);g.quadraticCurveTo(ex,ey+lid+1,ex+2.7,ey+0.4);g.stroke();
  g.lineWidth=0.5;for(const [a,b] of [[2.2,0.2],[2.7,-0.5],[3,-1.2]]){g.beginPath();g.moveTo(ex+a-0.2,ey+0.4+b*0.4);g.lineTo(ex+a+0.9,ey+0.1+b*1.2-0.5);g.stroke();}
  g.restore();
  /* звёздочки сна */
  lmRim(g,q=>{for(const [x,y,r,o] of [[-11,FY-27,1.7,0],[14.5,FY-26,1.3,2],[-17,FY-12,1.1,4]])lmCradleStar(q,x,y+Math.sin(t*1.5+o)*0.8,r,'#fff4c0',0.5+0.5*Math.sin(t*3+o));});
  lmRim(g,q=>{q.strokeStyle='rgba(255,244,255,.5)';q.lineWidth=0.8;q.beginPath();q.ellipse(-3.2,FY-14.4,12.2,9.2,0,Math.PI*1.08,Math.PI*1.62);q.stroke();q.beginPath();q.ellipse(11.6,FY-15+hb,5,4.8,0,Math.PI*1.1,Math.PI*1.6);q.stroke();});
}
/* Счётная овечка — Истина: тощая тварь на ходулях, шерсть клочьями, рёбра, десятки глаз, горизонтальный зрачок */
function lmCradleSheepT(g,m,FY,t,ph,air,lift,u,br,lkx,lky,s1,s2,st,k){
  const SK='#a68489',SKD='#6a4a54',SKL='#caa8ac',BN='#e2d6c2',BD='#a89880',WD='#8f8499',WR=['#ece4f2','#c2b6cc','#6e6280'],WR2=['#f2ecf6','#d0c6da','#7e7290'],WLN='rgba(52,36,66,.8)';
  g.save();g.translate(-1.2,FY);g.scale(0.93,0.93);g.translate(0,-FY);
  const jw=0.26+Math.max(0,br)*0.06+(air?0.28*(1-u):0);
  const s1b=air?s1:[s1[0]*1.5,s1[1]*1.5],s2b=air?s2:[s2[0]*1.5,s2[1]*1.5];
  const leg=(hx,hy,f,l1,l2,bk,w0,w1,w2,ramp)=>{const q=lmCradleIK(hx,hy,f[0],f[1],l1,l2,bk);lmCradleMuscleLimb(g,[hx,hy],[q[0],q[1]],[q[2],q[3]],w0,w1,w2,bk?-0.5:0.5,ramp);return [q[2],q[3]];};
  const SKR=['#c8a4aa','#a68489','#5a3e46'],SKRD=['#7a5a62','#4e363e','#241418'];
  /* парящие глазки на стебельках — дрейфуют над спиной */
  for(const [x,y,r,o] of [[-8,FY-31,1.9,0],[1.5,FY-33,1.5,1.7],[9.5,FY-30,1.7,3.1]]){const fy=y+Math.sin(t*1.6+o)*1.1,fx=x+Math.sin(t*1.1+o*2)*0.8;
    g.strokeStyle='rgba(150,80,100,.75)';g.lineWidth=0.5;g.beginPath();g.moveTo(fx,fy+r);g.quadraticCurveTo(fx+Math.sin(t+o)*1.4,fy+r+3,x*0.6,FY-27);g.stroke();
    lmCradleEye(g,fx,fy,r,r*0.92,{w:'#efe4d6',vein:1,lx:lkx,ly:lky,iris:'#a82a30',glow:'#ff6a70',ga:0.25,bl:(Math.sin(t*2+o*3)>0.985)?0.2:1});}
  /* дальние ноги — тоньше и темнее */
  const FOOT=(hx,dir,sh)=>air?[hx+dir*(2+12*u),FY-1-13*u]:[hx+sh[0]+dir*1.4,FY-0.5+sh[1]];
  for(const [hx,dir,sh,bk] of [[6.6,1,s2b,false],[-7.2,-1,s2b,true]]){const f=FOOT(hx,dir,sh);const e=leg(hx,FY-16,f,8.8,9.2,bk,2.1,1.4,1,SKRD);lmCradleHoof(g,e[0],e[1]+0.3,0.75,'#2e2024',0.7);}
  /* хвост: голый, как крысиный, с жидким пучком */
  g.strokeStyle=SKD;g.lineWidth=1.1;g.lineCap='round';g.beginPath();g.moveTo(-12,FY-21);g.bezierCurveTo(-15,FY-20.4,-16.6,FY-16,-15.4,FY-12);g.stroke();
  g.strokeStyle=SKL;g.lineWidth=0.3;g.beginPath();g.moveTo(-12.2,FY-21.4);g.bezierCurveTo(-15,FY-20.8,-16.8,FY-16,-15.6,FY-12.4);g.stroke();
  lmFur(g,[[-15.4,FY-12,-0.8,2],[-15.4,FY-12,0.5,2.2],[-15.4,FY-12,-1.5,1]],WD,0.5);
  /* туловище: ободранная кожа, впалые бока, горб в холке */
  g.beginPath();g.moveTo(-12.5,FY-19.5);g.bezierCurveTo(-12.5,FY-25,-4,FY-27,2,FY-26.4);g.bezierCurveTo(8,FY-25.8,11,FY-22.5,10,FY-18.5);g.bezierCurveTo(9,FY-14.2,3,FY-12.8,-3,FY-13.4);g.bezierCurveTo(-8,FY-13.4,-12.5,FY-14.5,-12.5,FY-19.5);g.closePath();
  mobPath(g,SK,-3,FY-23,13);
  g.save();g.clip();
  g.fillStyle='rgba(70,30,40,.3)';for(const [x,y,r] of [[-6,FY-16,3],[3,FY-16.6,2.4],[-10,FY-22,2]]){g.beginPath();g.ellipse(x,y,r*1.3,r,0.3,0,TAU);g.fill();}
  for(let i=0;i<6;i++){const x=-8.6+i*2.5;g.strokeStyle='rgba(50,12,24,.85)';g.lineWidth=1.25;g.beginPath();g.moveTo(x-0.6,FY-24.4);g.quadraticCurveTo(x+2.4,FY-20,x-0.2,FY-14.6);g.stroke();
    g.strokeStyle=BN;g.lineWidth=0.8;g.beginPath();g.moveTo(x-1.4,FY-24.2);g.quadraticCurveTo(x+1.6,FY-20,x-1,FY-14.8);g.stroke();
    g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=0.3;g.beginPath();g.moveTo(x-1.5,FY-23.8);g.quadraticCurveTo(x+1,FY-21,x-0.4,FY-18.4);g.stroke();}
  g.fillStyle='rgba(30,6,14,.42)';g.beginPath();g.ellipse(-3,FY-12.6,13,3.4,0,0,TAU);g.fill();
  g.restore();
  /* ближняя задняя нога: бедро-ком и жилистая голень на ходуле */
  const fh=FOOT(-10.4,-1,s1b);
  g.beginPath();g.ellipse(-9.8,FY-17,3.7,3.9,-0.3,0,TAU);mobPath(g,shadeHex(SK,0.05),-10.6,FY-18.4,4);
  const eh=leg(-10,FY-15.6,fh,8.8,9.2,true,2.6,1.6,1.1,SKR);lmCradleHoof(g,eh[0],eh[1]+0.3,0.85,'#3a2a2e',0.8);
  /* грязная свалявшаяся шерсть: клочьями по хребту, холке и крупу */
  for(const [x,y,rx,ry,n,sd,rp] of [[-10.8,FY-20.4,3.6,5.2,8,5.1,WR2],[7.4,FY-20.4,3.8,5,8,6.2,WR2],[-2.4,FY-26,8.6,3.8,12,1.3,WR],[-3,FY-13.8,6.2,2.1,9,3.1,WR2],[-7.6,FY-23.2,3.4,3.1,7,2.2,WR],[3.6,FY-24.4,3.6,3,7,3.9,WR]])lmCradleTuft(g,x,y,rx,ry,n,0.34,sd,WD,null,null,0,WLN,rp);
  for(const [x,y,r,rt] of [[-6.6,FY-25.4,1.7,1],[3,FY-26,1.5,3],[-10.4,FY-20.6,1.3,2]])lmCradleSpiral(g,x,y,r,'rgba(80,62,100,.7)',0.45,rt);
  /* позвонки торчат сквозь шерсть */
  for(const [x,y] of [[-10.4,FY-23.6],[-7.2,FY-26.8],[-4,FY-28.2],[-0.8,FY-28.5],[2.4,FY-28.2],[5.4,FY-26.6],[8,FY-24]]){g.fillStyle=BD;g.beginPath();g.ellipse(x,y,1.2,1.05,-0.3,0,TAU);g.fill();g.fillStyle=BN;g.beginPath();g.ellipse(x-0.25,y-0.3,0.75,0.65,-0.3,0,TAU);g.fill();}
  /* глаза в шерсти и на коже: каждый смотрит на шахтёра */
  const EY=[[-10.6,FY-21.6,1.5,0],[-6.6,FY-24.6,2.1,1],[-1.8,FY-26.2,1.7,2],[3.8,FY-25,2.3,3],[7.6,FY-21.4,1.6,4],[-9.2,FY-17.4,1.2,5],[-4,FY-20,2.7,6],[1.6,FY-18.4,1.5,7],[5.4,FY-16.4,1.2,8],[-6.6,FY-14.8,1.1,9],[-1,FY-14,1,10],[0.2,FY-22.6,1.15,12],[-3.6,FY-26.8,1,11]];
  for(const [x,y,r,i] of EY){const bk=Math.sin(t*0.8+i*2.7+ph*3);const bl=bk>0.965?0.12:(bk<-0.9?0.55:1);
    lmCradleEye(g,x,y,r,r*0.84,{w:i%3?'#f0e6d8':'#e8dccc',vein:1,lx:lkx,ly:lky,bl,iris:i%4===0?'#c8a020':'#a82828',lid:'rgba(60,20,36,.7)',hp:i%2});}
  /* ближняя передняя нога */
  const ff=FOOT(5.4,1,s1b);
  
  const ef=leg(5.6,FY-16.2,ff,8.8,9.2,false,2.5,1.6,1.1,SKR);lmCradleHoof(g,ef[0],ef[1]+0.3,0.85,'#3a2a2e',0.8);
  /* шея: два звена и острый локоть — неправильный изгиб; позвонки вдоль неё */
  const nh=air?-4:0,hb=Math.sin(t*1.5)*0.4;
  {const q=lmCradleIK(5.6,FY-21.4,14.6,FY-11.4+nh+hb,6,6.2,true);lmCradleMuscleLimb(g,[5.6,FY-21.4],[q[0],q[1]],[q[2],q[3]],3.8,2.8,2.8,-0.6,SKR);}
  g.strokeStyle='rgba(60,14,30,.6)';g.lineWidth=0.4;for(let i=0;i<4;i++){const a=i/4;g.beginPath();g.moveTo(5.6+a*9,FY-22.6+a*9.6+nh*a);g.lineTo(5.6+a*9+1.2,FY-20+a*9.6+nh*a);g.stroke();}
  /* голова: опущена к земле, как у овцы, но череп вытянут */
  g.save();g.translate(14.8,FY-10.8+nh+hb);g.rotate(0.42-(air?0.5:0));g.scale(0.84,0.84);
  const horn=(x0,y0,r0,a0,sw,w0,col,sh)=>{const N=12;g.lineCap='round';let px=null,py=null;for(let i=0;i<=N;i++){const a=a0+i/N*sw,r=r0*(1-0.5*i/N),x=x0+Math.cos(a)*r,y=y0+Math.sin(a)*r;if(px!==null){g.strokeStyle=shadeHex(col,-0.45);g.lineWidth=w0*(1-i/N*0.8)+0.7;g.beginPath();g.moveTo(px,py);g.lineTo(x,y);g.stroke();g.strokeStyle=sh?shadeHex(col,-0.25):col;g.lineWidth=w0*(1-i/N*0.8);g.beginPath();g.moveTo(px,py);g.lineTo(x,y);g.stroke();if(i%2===0){g.strokeStyle=shadeHex(col,-0.45);g.lineWidth=0.35;g.beginPath();g.moveTo(x+Math.cos(a)*w0*0.3,y+Math.sin(a)*w0*0.3);g.lineTo(x-Math.cos(a)*w0*0.3,y-Math.sin(a)*w0*0.3);g.stroke();}}px=x;py=y;}};
  horn(-2.6,-2.4,3.4,-1.5,4.6,1.4,BN,true);
  /* рваное длинное ухо повисло */
  g.save();g.translate(-2.2,-2.4);g.rotate(2.15+Math.sin(t*1.9)*0.08);
  g.beginPath();g.moveTo(0,-1.5);g.quadraticCurveTo(4.6,-2.8,9,-1);g.lineTo(7.6,0);g.lineTo(9.2,0.9);g.quadraticCurveTo(4.6,2.6,0,1.6);g.closePath();mobPath(g,SK,3,-0.8,5);
  g.fillStyle='rgba(120,30,50,.65)';g.beginPath();g.moveTo(1.4,-0.6);g.quadraticCurveTo(4.6,-1.2,7,-0.4);g.quadraticCurveTo(4.6,0.8,1.4,0.8);g.fill();g.restore();
  /* череп: лопнувшая кожа и кость */
  g.beginPath();g.moveTo(-4.4,-2.2);g.bezierCurveTo(-3.6,-5,2.4,-5,6.6,-2.6);g.bezierCurveTo(9,-1.4,10,-0.4,9.6,0.9);g.lineTo(0.6,1.7);g.bezierCurveTo(-3,1.9,-5.2,0.6,-4.4,-2.2);g.closePath();mobPath(g,shadeHex(SK,0.04),1,-2.6,7);
  g.fillStyle=BN;g.beginPath();g.moveTo(4.2,-3.8);g.bezierCurveTo(6.6,-2.9,8.8,-1.6,9.2,0);g.lineTo(7.2,-0.4);g.bezierCurveTo(6.2,-1.9,5,-2.9,3,-3.4);g.closePath();g.fill();
  g.strokeStyle='rgba(70,40,30,.7)';g.lineWidth=0.35;g.beginPath();g.moveTo(5,-3.2);g.lineTo(5.8,-2.2);g.lineTo(5.2,-1.4);g.moveTo(7.2,-1.6);g.lineTo(8,-0.6);g.stroke();
  /* нижняя челюсть отвисла: язык, зубы-квадратики */
  g.save();g.translate(0.4,1);g.rotate(jw);
  g.beginPath();g.moveTo(-2.6,0);g.lineTo(9,0.2);g.quadraticCurveTo(9.4,2.2,7,2.8);g.lineTo(-1,2.4);g.closePath();mobPath(g,shadeHex(SK,-0.1),3,1.2,5,false);
  g.fillStyle='#3a0a16';g.beginPath();g.moveTo(-1,0.1);g.lineTo(8.4,0.2);g.lineTo(7,1.4);g.lineTo(-0.5,1.2);g.closePath();g.fill();
  g.fillStyle='#caa8a0';for(let i=0;i<8;i++){const hh=0.7+((i*5)%3)*0.35;g.fillRect(0.2+i*1,0.1-hh,0.72,hh);}
  g.strokeStyle='#b05a70';g.lineWidth=1.3;g.lineCap='round';g.beginPath();g.moveTo(2,0.8);g.bezierCurveTo(6,1.6,9.6,2.6,9.2,5.4+Math.sin(t*2)*0.4);g.stroke();
  g.restore();
  g.fillStyle='#1c0408';g.beginPath();g.moveTo(-0.4,0.9);g.lineTo(9.2,0.5);g.lineTo(9,0.9+jw*5);g.lineTo(-0.4,1+jw*3);g.closePath();g.fill();
  g.fillStyle='#d8c8b2';for(let i=0;i<9;i++){const hh=0.8+((i*7)%3)*0.3;g.fillRect(0.2+i*0.98,0.7,0.76,hh);}
  g.strokeStyle='rgba(230,215,225,.7)';g.lineWidth=0.3;g.beginPath();g.moveTo(5,1.2+jw*3);g.quadraticCurveTo(5.4,3+jw*4,4.8,4.6+jw*5+Math.sin(t*3)*0.3);g.stroke();
  /* глаза: главный вытаращен, налит, горизонтальный зрачок; лишние — на лбу и на морде */
  lmCradleEye(g,3,-1.6,2.5,2.1,{w:'#f2e6d8',vein:1,hp:1,ir:0.62,lx:lkx,ly:lky,iris:'#c02830',glow:'#ff5058',ga:0.4,lid:'rgba(50,16,28,.8)'});
  lmCradleEye(g,-0.3,-3.4,1.2,1,{w:'#e8dccc',vein:1,hp:1,lx:lkx,ly:lky,iris:'#c8a020',bl:(Math.sin(t*1.6+2)>0.95)?0.2:1});
  lmCradleEye(g,6.2,-2.4,0.8,0.7,{w:'#efe4d6',lx:lkx,ly:lky,iris:'#a82828'});
  g.fillStyle='#2a0a10';g.beginPath();g.ellipse(9.2,-0.8,0.55,0.4,0.3,0,TAU);g.fill();
  horn(-3.2,-2.2,3.8,-1.4,4.9,1.8,BN,false);
  /* остаток прежнего пушка: милая кудряшка на лбу, но грязная */
  lmCradleTuft(g,0.6,-4.6,2.7,1.8,7,0.3,8,WD,null,null,0,WLN,WR2);lmCradleSpiral(g,0.8,-4.8,1.1,'rgba(80,62,100,.8)',0.4,0.4);
  g.restore();
  /* влажные блики на мясе */
  lmRim(g,q=>{q.fillStyle='rgba(255,224,224,.35)';for(const [x,y,r] of [[-6,FY-18,1],[2,FY-19,0.9],[-9.6,FY-15,0.8]]){q.beginPath();q.ellipse(x,y,r*1.4,r*0.6,-0.4,0,TAU);q.fill();}});
  g.restore();
}
/* сужающееся звено (рукав, кость): объёмная заливка, тонкий контур, сустав-ком на конце */
function lmCradleSeg(g,x0,y0,x1,y1,wa,wb,ramp,ln,bulge){
  const an=Math.atan2(y1-y0,x1-x0),nx=-Math.sin(an),ny=Math.cos(an),mx=(x0+x1)/2,my=(y0+y1)/2,bw=Math.max(wa,wb)*0.5*(bulge==null?0.3:bulge);
  g.beginPath();g.moveTo(x0+nx*wa/2,y0+ny*wa/2);g.quadraticCurveTo(mx+nx*(wa+wb)/4+nx*bw,my+ny*(wa+wb)/4+ny*bw,x1+nx*wb/2,y1+ny*wb/2);g.lineTo(x1-nx*wb/2,y1-ny*wb/2);
  g.quadraticCurveTo(mx-nx*(wa+wb)/4-nx*bw,my-ny*(wa+wb)/4-ny*bw,x0-nx*wa/2,y0-ny*wa/2);g.closePath();
  lmCradleFill(g,mx-nx*(wa+wb)*0.2,my-ny*(wa+wb)*0.2,Math.hypot(x1-x0,y1-y0)*0.7+wa*0.4,ramp);g.strokeStyle=ln||'rgba(40,24,60,.8)';g.lineWidth=0.6;g.lineJoin='round';g.stroke();
}
/* падающие песчинки: n зёрен по струе длиной len, дрейф dx */
function lmCradleSand(g,x,y,len,t,seed,n,col,sp,dx,w){
  const ga=g.globalAlpha;g.fillStyle=col;
  for(let i=0;i<n;i++){const f=((t*(sp||0.9)+i/n+seed*0.37+Math.sin(i*5.1+seed)*0.04)%1),xx=x+(dx||0)*f+Math.sin(seed+i*2.1+t*3)*0.55*f+Math.sin(i*7.3)*0.12;g.globalAlpha=ga*(1-f*f)*(0.55+0.4*Math.abs(Math.sin(i*3.7+seed)));const ww=(w||0.8)*(0.7+0.5*Math.abs(Math.sin(i*2.3)));g.fillRect(xx,y+f*len,ww,ww+f*0.9);}
  g.globalAlpha=ga;
}
/* костяной палец: три фаланги с суставами, ломаная от угла a0 к a1 */
function lmCradleFinger(g,x,y,a0,a1,len,w,col,dk){
  const pts=[[x,y]];for(let i=0;i<3;i++){const a=a0+(a1-a0)*(i/2),l=len*(i===1?0.36:0.32);const p=pts[i];pts.push([p[0]+Math.cos(a)*l,p[1]+Math.sin(a)*l]);}
  g.lineCap='round';g.lineJoin='round';
  g.strokeStyle=dk||'rgba(30,18,24,.9)';g.lineWidth=w+0.7;g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<4;i++)g.lineTo(pts[i][0],pts[i][1]);g.stroke();
  g.strokeStyle=col;g.lineWidth=w;g.stroke();
  g.fillStyle=col;for(let i=1;i<3;i++){g.beginPath();g.arc(pts[i][0],pts[i][1],w*0.62,0,TAU);g.fill();}
  return pts[3];
}
/* Дрёма: плавает, бросает сонный песок (throw), растворяется и появляется (fade/appear) */
LM_MODEL.lsandman=function(g,m,FY,t,T,st,k,wv,ph){
  const thr=st==='throw'?k:0,fd=st==='fade'?clamp(m.st/0.4,0,1):st==='appear'?1-clamp(m.st/0.4,0,1):0;
  /* после броска рука плавно проходит вперёд и опускается (бросок происходит в тот кадр, когда замах кончился) */
  if(st==='throw')m._sdK=k;else if(m._sdK>0.6){m._sdRel=t;m._sdK=0;}
  const rel=(m._sdRel!=null&&st!=='throw')?clamp((t-m._sdRel)/0.34,0,1):1;
  const pose=st==='throw'?thr*thr*(3-2*thr):(rel<1?(1-rel)*(1-rel)*(1-rel):0),fol=rel<1?Math.sin(rel*Math.PI):0;
  const bob=Math.sin(t*1.8+ph)*1.2;
  g.save();g.translate(0,bob);g.translate(0,3);g.rotate(-pose*0.1);g.scale(1+fd*0.08,1-fd*0.1);g.translate(0,-3);
  if(!T)lmCradleSandI(g,m,FY,t,ph,pose,fol,thr,m.lookX||0,m.lookY||0);else lmCradleSandT(g,m,FY,t,ph,pose,fol,thr,m.lookX||0,m.lookY||0);
  g.restore();
  /* растворение и появление: рассыпается песчинками и звёздной пылью */
  if(fd>0.01){const ga=g.globalAlpha;for(let i=0;i<22;i++){const a=i*2.399+ph,r=3+fd*(8+(i%5)*2.4),x=Math.cos(a)*r*0.9,y=-4+Math.sin(a)*r*1.1-fd*5;g.globalAlpha=ga*(0.9-fd*0.4);g.fillStyle=i%3?(T?'#bfa86a':'#f6e6a8'):(T?'#e8e0d0':'#fff4c8');g.fillRect(x,y,0.7,0.7);}
    g.globalAlpha=ga;lmRim(g,q=>{for(let i=0;i<4;i++)lmCradleStar(q,Math.cos(i*1.7+ph)*(5+fd*10),Math.sin(i*2.3)*(8+fd*6)-4,1.4,T?'#d8c890':'#fff2b8',0.9);});}
};
/* Дрёма — Иллюзия: добрый сонный старичок в колпаке и звёздной мантии, мешок и песок */
function lmCradleSandI(g,m,FY,t,ph,pose,fol,thr,lkx,lky){
  const sw=Math.sin(t*2+ph),sw2=Math.sin(t*1.5+ph+1.7),LN='rgba(46,30,92,.85)';
  const R0=['#e0d6ff','#a898ec','#5e4eb4'],RD=['#b8aae6','#7c6ccc','#3c2e86'],SKIN=['#fff2e6','#ffd9c0','#d9957e'],WH=['#ffffff','#f6f0ff','#b4a6dc'],PJ=['#d8cdfa','#b4a4ee','#6a58bc'],SLP=['#ffd0ee','#e08ac8','#8c4e90'];
  const GOLD='#ffe27a';
  const lerp2=(a,b)=>[a[0]+(b[0]-a[0])*pose,a[1]+(b[1]-a[1])*pose];
  const E=lerp2([8.4,0.8],[10.8,-5.2]),H=lerp2([12.4,-0.4+sw2*0.5],[10.9,-13.4]);
  /* дальняя рука с мешком песка (темнее, позади) */
  const E2=[-6.8+sw*0.4,1],H2=[-8.8+sw*0.5,5.4];
  lmCradleSeg(g,-3,-2.8,E2[0],E2[1],4.2,3.6,RD,LN);lmCradleSeg(g,E2[0],E2[1],H2[0],H2[1],3.6,2.6,RD,LN);
  /* мешок: круглый, на завязке, песок сочится */
  const bx=-10.6+sw*0.5,by=8.6;
  g.beginPath();g.moveTo(bx-1.6,by-3.6);g.quadraticCurveTo(bx-4.8,by-0.4,bx-3.6,by+2.8);g.quadraticCurveTo(bx,by+4.6,bx+3.6,by+2.8);g.quadraticCurveTo(bx+4.8,by-0.4,bx+1.6,by-3.6);g.closePath();
  lmCradleFill(g,bx-1,by-1.4,5,['#f8e4b4','#d6aa72','#7e5a36']);g.strokeStyle='#4a3220';g.lineWidth=0.7;g.stroke();
  g.strokeStyle='#8e6a3e';g.lineWidth=0.7;g.beginPath();g.moveTo(bx-1.8,by-3.4);g.quadraticCurveTo(bx,by-2.4,bx+1.8,by-3.4);g.stroke();
  g.fillStyle='#8e6a3e';g.beginPath();g.moveTo(bx-1.4,by-3.8);g.lineTo(bx-2.6,by-5.2);g.lineTo(bx-0.2,by-4.2);g.moveTo(bx+1.4,by-3.8);g.lineTo(bx+2.6,by-5);g.lineTo(bx+0.2,by-4.2);g.fill();
  g.strokeStyle='rgba(255,246,214,.6)';g.lineWidth=0.5;g.beginPath();g.moveTo(bx-3,by-0.6);g.quadraticCurveTo(bx-2.6,by+1.6,bx-1,by+2.8);g.stroke();
  g.fillStyle='#ffe27a';lmCradleStar(g,bx+0.4,by+0.6,1.1,GOLD,0.9);
  lmCradleSand(g,bx+3.2,by+3.4,17-by-3.4,t,1,5,'#f4e2a0',0.6,0.8,0.6);
  /* дальняя нога и ближняя: пижамные штанишки и пушистые тапки, одна нога шагает */
  const lg=Math.sin(t*2.4+ph);
  {const fx=-2.8-lg*0.5,fy=15.8;lmCradleSeg(g,-2.8,8.6,-2.8-lg*0.2,12.4,3.2,2.8,PJ.map(c=>shadeHex(c,-0.25)),LN);lmCradleSeg(g,-2.8-lg*0.2,12.4,fx,fy,2.8,2.2,PJ.map(c=>shadeHex(c,-0.25)),LN);g.beginPath();g.moveTo(fx-2.2,fy-0.6);g.quadraticCurveTo(fx+1,fy-2,fx+3.4,fy-0.6);g.quadraticCurveTo(fx+4.4,fy+0.8,fx+3,fy+1.4);g.lineTo(fx-2.2,fy+1.4);g.closePath();lmCradleFill(g,fx,fy-1,3.4,['#d8a0cc','#b068a8','#6a3a70']);g.strokeStyle=LN;g.lineWidth=0.6;g.stroke();}
  /* хвост колпака позади головы — болтается с запаздыванием */
  const tx=-10.6+Math.sin(t*2-0.6+ph)*1.2,ty=-11+Math.cos(t*1.6+ph)*1.3;
  /* мантия-колокол: волнистый подол, звёзды, золотая кайма */
  const hem=(i)=>[-9.8+i*3.3,10.4+(i%2?1.5:0)+Math.sin(t*2+i*1.3+ph)*0.5];
  g.beginPath();g.moveTo(-5.2,-4.6);g.bezierCurveTo(-7.4,0,-9.4,5,-9.8,10.2);for(let i=1;i<=6;i++){const p=hem(i),q=hem(i-1);g.quadraticCurveTo((p[0]+q[0])/2,Math.max(p[1],q[1])+1.2,p[0],p[1]);}
  g.bezierCurveTo(9.6,5,7.8,0,6.4,-4.6);g.quadraticCurveTo(0.6,-6.8,-5.2,-4.6);g.closePath();
  lmCradleFill(g,-3,-2,13,R0);g.strokeStyle=LN;g.lineWidth=0.9;g.lineJoin='round';g.stroke();
  g.save();g.clip();
  g.fillStyle='rgba(60,40,140,.3)';g.beginPath();g.ellipse(-3,13,13,4.4,0,0,TAU);g.fill();g.fillStyle='rgba(60,40,140,.2)';g.beginPath();g.ellipse(-9,3,3.4,9,0.1,0,TAU);g.fill();
  /* складки */
  g.strokeStyle='rgba(60,40,140,.35)';g.lineWidth=0.5;for(const x of [-5,-1.6,2,5.6]){g.beginPath();g.moveTo(x*0.7,0.6);g.quadraticCurveTo(x*1.05+Math.sin(t*2+x)*0.3,5,x*1.2,10.6);g.stroke();}
  g.strokeStyle='rgba(255,255,255,.3)';g.lineWidth=0.5;g.beginPath();g.moveTo(-3.6,-3.6);g.quadraticCurveTo(-5.6,1,-6.8,6);g.stroke();
  /* звёзды-узор и полумесяц */
  for(const [x,y,r] of [[-4.6,3.2,1.3],[1,5.8,1.5],[-1.6,8.6,1.1],[5.2,7.2,1.2],[-6.8,7.6,0.9],[4.2,-0.4,1],[-1,0.4,0.8]])lmCradleStar(g,x,y,r,GOLD,1);
  g.fillStyle='#fff0b4';g.beginPath();g.arc(-4,-0.4,1.5,Math.PI*0.4,Math.PI*1.7);g.arc(-3.4,-0.5,1.1,Math.PI*1.6,Math.PI*0.5,true);g.fill();
  g.restore();
  /* золотая кайма по подолу */
  g.strokeStyle='#f6d880';g.lineWidth=0.9;g.beginPath();for(let i=0;i<=6;i++){const p=hem(i);i?g.lineTo(p[0],p[1]-0.7):g.moveTo(p[0],p[1]-0.7);}g.stroke();
  /* ближняя нога поверх подола не нужна: она за мантией, видна ступня */
  {const fx=3.6+lg*0.7,fy=15.2;lmCradleSeg(g,3,9.4,4.8+lg*0.3,12.6,3.4,3,PJ,LN);lmCradleSeg(g,4.8+lg*0.3,12.6,fx,fy,3,2.4,PJ,LN);g.beginPath();g.moveTo(fx-2.4,fy-0.6);g.quadraticCurveTo(fx+1,fy-2.2,fx+3.6,fy-0.8);g.quadraticCurveTo(fx+5,fy-1,fx+4.6,fy+0.4);g.quadraticCurveTo(fx+3.8,fy+1.6,fx+2.4,fy+1.6);g.lineTo(fx-2.4,fy+1.6);g.closePath();lmCradleFill(g,fx,fy-1.2,3.6,SLP);g.strokeStyle=LN;g.lineWidth=0.6;g.stroke();
    lmCradleTuft(g,fx+4.8,fy-0.2,1.1,1.1,6,0.3,3,'#ffffff',null,null,0,LN,WH);}
  /* пояс-шнур с кисточками */
  g.strokeStyle='#fff0c8';g.lineWidth=1.3;g.beginPath();g.moveTo(-7.6,2.8);g.quadraticCurveTo(0,4.6,7.6,2.6);g.stroke();g.strokeStyle='#d8a838';g.lineWidth=0.4;g.beginPath();g.moveTo(-7.4,3);g.quadraticCurveTo(0,4.8,7.4,2.8);g.stroke();
  g.fillStyle='#ffe27a';g.beginPath();g.arc(4.4,3.8,1,0,TAU);g.fill();
  for(const [x,l] of [[3.6,5.6],[5.4,4.8]]){g.strokeStyle='#fff0c8';g.lineWidth=0.7;g.beginPath();g.moveTo(x,4.2);g.lineTo(x+Math.sin(t*2.2+x)*0.4,4.2+l*0.8);g.stroke();lmCradleTuft(g,x+Math.sin(t*2.2+x)*0.4,4.2+l*0.8+0.7,0.9,0.9,5,0.3,x,'#ffe27a',null,null,0,'#a07818',['#fff4b8','#ffe27a','#c09428']);}
  /* голова: крупное лицо, ухо, нос, румянец, усы и борода-облако */
  const HX=1.8,HY=-8.6,hb=Math.sin(t*1.7+ph)*0.25;g.save();g.translate(0,hb);g.translate(1.8,-3);g.scale(1.06,1.06);g.translate(-1.8,3);
  g.beginPath();g.ellipse(HX,HY,5.7,5.3,0.05,0,TAU);lmCradleFill(g,HX-1.6,HY-2.2,6.2,SKIN);g.strokeStyle=LN;g.lineWidth=0.8;g.stroke();
  g.beginPath();g.ellipse(-2.6,-8,1.3,1.9,0.1,0,TAU);lmCradleFill(g,-2.8,-8.8,2,SKIN);g.stroke();
  lmCradleTuft(g,-2.8,-10.6,2.3,1.9,7,0.34,2,'#f6f0ff',null,null,0,LN,WH);
  lmCradleTuft(g,2.6,-2.6+sw2*0.2,4.8,3.9,12,0.26,5,'#f6f0ff',null,null,0,LN,WH);
  lmCradleSpiral(g,1.2,-2,1.6,'rgba(140,120,200,.55)',0.45,1);lmCradleSpiral(g,5,-2.8,1.3,'rgba(140,120,200,.55)',0.45,3);
  lmFur(g,[[-0.8,0.2,-0.6,1.6],[2.8,1.1,0.4,1.4],[6,0,0.8,1.2]],'rgba(255,255,255,.9)',0.5);
  lmCradleTuft(g,6.6,-5.4,3,1.3,8,0.3,6,'#f6f0ff',null,null,-0.15,LN,WH);
  g.beginPath();g.arc(8,-7,1.2,0,TAU);lmCradleFill(g,7.5,-7.6,1.5,['#ffe2d4','#ffa890','#cc6a60']);g.strokeStyle='rgba(120,50,50,.7)';g.lineWidth=0.5;g.stroke();g.fillStyle='rgba(255,255,255,.8)';g.beginPath();g.arc(7.6,-7.5,0.34,0,TAU);g.fill();
  g.fillStyle='rgba(255,130,150,.4)';g.beginPath();g.ellipse(5.4,-6.6,1.9,1,0,0,TAU);g.fill();
  /* глаз: закрыт в довольной улыбке — дуга с ресницами, морщинки, пушистая бровь; при замахе чуть приоткрывается */
  const bl=(Math.sin(m.anim*1.1+ph*7)>0.985)?0.1:1,ex=5,ey=-9.2,op=pose*0.9;
  if(op>0.15){g.fillStyle='#fff7f0';g.beginPath();g.ellipse(ex,ey+0.4,2.1,1.1*op+0.3,0,0,TAU);g.fill();const ig=g.createRadialGradient(ex,ey+0.6,0.1,ex,ey+0.4,1.6);ig.addColorStop(0,'#b0c8ff');ig.addColorStop(1,'#3a50b0');g.fillStyle=ig;g.beginPath();g.ellipse(ex+lkx*0.2,ey+0.5,1.3,0.7+op*0.7,0,0,TAU);g.fill();}
  g.strokeStyle='#5a3040';g.lineWidth=0.75;g.lineCap='round';g.beginPath();g.moveTo(ex-2.5,ey+0.9);g.quadraticCurveTo(ex,ey-2.2*(op>0.15?0.5:1)+0.4*(1-bl),ex+2.5,ey+0.5);g.stroke();
  g.lineWidth=0.45;for(const [a,b] of [[2.3,0.2],[2.7,-0.3],[-2.3,0.9]]){g.beginPath();g.moveTo(ex+a*0.92,ey+0.6+b*0.2);g.lineTo(ex+a*1.25,ey+0.1+b*0.9);g.stroke();}
  g.strokeStyle='rgba(150,100,100,.5)';g.lineWidth=0.35;g.beginPath();g.moveTo(ex+2.9,ey+1.1);g.lineTo(ex+3.7,ey+1.6);g.stroke();
  lmCradleTuft(g,ex-0.3,ey-3.3-op*0.8,2.6,0.9,6,0.4,3,'#f6f0ff',null,null,-0.2,LN,WH);
  /* колпак: полосатый, со звездой, меховой отворот, помпон на болтающемся конце */
  g.beginPath();g.moveTo(6.4,-13.4);g.bezierCurveTo(6.2,-15.8,3.8,-16.8,0.6,-16.6);g.bezierCurveTo(-4,-16.3,-8.4,-14.6,tx,ty);g.bezierCurveTo(-7.6,-13.8,-5.6,-13.8,-4,-13.5);g.closePath();
  lmCradleFill(g,0,-16,9,['#e6defe','#b6a6f2','#6252c0']);g.strokeStyle=LN;g.lineWidth=0.85;g.lineJoin='round';g.stroke();
  g.save();g.clip();g.strokeStyle='rgba(106,86,200,.55)';g.lineWidth=1.3;for(let i=0;i<4;i++){g.beginPath();g.moveTo(-6+i*3.4,-18.4);g.lineTo(-4+i*3.4,-12.4);g.stroke();}
  g.strokeStyle='rgba(255,255,255,.4)';g.lineWidth=0.5;g.beginPath();g.moveTo(-3,-16.8);g.quadraticCurveTo(1,-17.4,4.6,-15.6);g.stroke();g.restore();
  lmCradleStar(g,1,-15.2,1.1,GOLD,1);
  lmCradleTuft(g,1.4,-13.7,5.8,1.5,12,0.2,9,'#f6f0ff',null,null,0,LN,WH);
  lmCradleTuft(g,tx-0.4,ty+0.3,2.3,2.3,8,0.3,4,'#ffffff',null,null,0,LN,WH);
  g.restore();
  /* ближняя рука: широкий рукав, кисть сыплет песок; при замахе поднята вверх над песчаным шаром */
  lmCradleSeg(g,4.6,-3,E[0],E[1],4.6,3.8,R0,LN);lmCradleSeg(g,E[0],E[1],H[0],H[1],3.8,2.8,R0,LN);
  
  g.fillStyle=WH[1];g.beginPath();g.ellipse(H[0]+0.2,H[1]+0.1,2.1,1.6,0.4,0,TAU);g.fill();g.stroke();
  g.beginPath();g.ellipse(H[0]+0.8,H[1]+0.9,1.5,1.5,0.4,0,TAU);lmCradleFill(g,H[0]+0.3,H[1]+0.2,1.8,SKIN);g.stroke();
  g.strokeStyle='rgba(150,80,70,.6)';g.lineWidth=0.35;g.beginPath();g.moveTo(H[0]+1.4,H[1]+1.6);g.lineTo(H[0]+2.4,H[1]+2);g.moveTo(H[0]+0.6,H[1]+1.9);g.lineTo(H[0]+1.2,H[1]+2.6);g.stroke();
  if(pose<0.5)lmCradleSand(g,H[0]+1.8,H[1]+2,17-(H[1]+2),t,3,9,'#f6e6a8',0.8,1.2,0.6);
  if(pose>0.1||fol>0.05){
    lmRim(g,q=>{softGlow(q,H[0]+0.6,H[1]-1.6,3+9*pose,'#f4e6b0',0.8*pose);for(let i=0;i<7;i++){const a=t*7+i*0.9,r=2.2+pose*1.6;q.fillStyle='#fff4c8';q.fillRect(H[0]+0.6+Math.cos(a)*r,H[1]-1.4+Math.sin(a)*r*0.7,0.6,0.6);}});
    g.fillStyle='#f6e6a8';g.beginPath();g.ellipse(H[0]+0.6,H[1]-1.6,1.1+pose*1.2,0.9+pose*0.8,0,0,TAU);g.fill();g.fillStyle='#fffbe8';g.beginPath();g.ellipse(H[0]+0.3,H[1]-1.9,0.6+pose*0.6,0.5+pose*0.4,0,0,TAU);g.fill();
    if(fol>0.05){g.fillStyle='rgba(246,230,168,.9)';for(let i=0;i<10;i++){const f=fol*(0.4+i*0.08);g.fillRect(H[0]+2+f*12+Math.sin(i*3.1)*1.4,H[1]-2+f*8*Math.sin(i)+f*f*6,0.7,0.7);}}}
  /* звёзды и пылинки сна вокруг */
  lmRim(g,q=>{for(const [x,y,r,o] of [[-12.4,-9,1.6,0],[13.4,-13,1.3,1.7],[-6.4,13,1.1,3.1],[14,7,1.2,4.5],[-14,2,0.9,2.2]])lmCradleStar(q,x+Math.sin(t*1.3+o)*0.8,y+Math.cos(t*1.1+o)*0.8,r,'#fff4c0',0.45+0.55*Math.sin(t*3.2+o*2)**2);
    q.strokeStyle='rgba(255,240,255,.45)';q.lineWidth=0.8;q.beginPath();q.moveTo(-5.2,-4.4);q.bezierCurveTo(-7.4,0,-9.2,5,-9.6,9.6);q.stroke();});
}
/* Дрёма — Истина: высохший скелет в лохмотьях мантии; из глазниц и раскрытой пасти сыплется песок */
function lmCradleSandT(g,m,FY,t,ph,pose,fol,thr,lkx,lky){
  const sw=Math.sin(t*2.2+ph),sw2=Math.sin(t*1.5+ph+1.7),LN='rgba(24,12,22,.9)';
  const BNR=['#fff6e2','#e4d6b8','#8c7c62'],BDR=['#c8bca2','#9a8c72','#4a4030'],RB=['#a094b4','#6c6082','#2a2236'],RBD=['#7c708e','#4c4262','#1c1626'],SK=['#a8987a','#6c5e48','#2e2618'];
  const BN='#e4d6b8',BD='#9a8c72',SAND='#cdb06a';
  const jaw=0.36+Math.max(0,sw)*0.06+pose*0.34;
  const lerp2=(a,b)=>[a[0]+(b[0]-a[0])*pose,a[1]+(b[1]-a[1])*pose];
  const E=lerp2([8.8,0.6],[10.8,-5.4]),H=lerp2([12.6,0.2+sw2*0.5],[11,-13.4]);
  /* кость с суставным концом */
  const bone=(x0,y0,x1,y1,w0,w1,rp)=>{lmCradleSeg(g,x0,y0,x1,y1,w0,w1,rp,LN,0.15);g.beginPath();g.arc(x1,y1,w1*0.78,0,TAU);lmCradleFill(g,x1-0.3,y1-0.3,w1,rp);g.strokeStyle=LN;g.lineWidth=0.5;g.stroke();};
  const toes=(x,y,dir,n,rp)=>{for(let i=0;i<n;i++){const a=(dir>0?0.05:Math.PI-0.05)+dir*(i-1)*0.34+(dir>0?0.25:-0.25);lmCradleFinger(g,x,y,a,a+dir*0.5,3.6+(i===1?0.6:0),0.6,rp[1]);}};
  /* дальняя рука с мешком: тёмные кости */
  const E2=[-7+sw*0.3,0.4],H2=[-8.8+sw*0.4,5.2];
  bone(-3,-4,E2[0],E2[1],1.5,1.2,BDR);bone(E2[0],E2[1],H2[0],H2[1],1.3,1,BDR);
  /* мешок: ветхий, залатанный, дырявый — из дыр сыплется песок */
  const bx=-10.4+sw*0.4,by=8.6;
  g.beginPath();g.moveTo(bx-1.6,by-3.8);g.quadraticCurveTo(bx-5,by-0.6,bx-3.8,by+2.8);g.quadraticCurveTo(bx-1,by+4.8,bx+1.6,by+4);g.quadraticCurveTo(bx+4.4,by+3.6,bx+3.9,by+0.4);g.quadraticCurveTo(bx+3.6,by-2.4,bx+1.6,by-3.8);g.closePath();
  lmCradleFill(g,bx-1,by-1.4,5,SK);g.strokeStyle=LN;g.lineWidth=0.7;g.stroke();
  g.fillStyle='#14100a';g.beginPath();g.ellipse(bx+1.8,by+1.2,0.9,0.7,0.4,0,TAU);g.ellipse(bx-2,by+2.4,0.6,0.5,0,0,TAU);g.fill();
  g.fillStyle='#7a6a50';g.fillRect(bx-3,by-1.6,2.4,2);g.strokeStyle='rgba(30,20,10,.8)';g.lineWidth=0.3;g.strokeRect(bx-3,by-1.6,2.4,2);g.beginPath();g.moveTo(bx-2.6,by-1.2);g.lineTo(bx-1.4,by-0.2);g.moveTo(bx-1.4,by-1.2);g.lineTo(bx-2.6,by-0.2);g.stroke();
  g.strokeStyle='#5a4a34';g.lineWidth=0.8;g.beginPath();g.moveTo(bx-1.8,by-3.6);g.quadraticCurveTo(bx,by-2.6,bx+1.8,by-3.6);g.stroke();
  lmCradleSand(g,bx+1.8,by+1.8,17-by-1.8,t,1,6,SAND,0.7,0.5,0.55);lmCradleSand(g,bx-2,by+3,17-by-3,t,4,4,SAND,0.6,-0.3,0.5);
  for(let q=-1;q<=1;q++)lmCradleFinger(g,H2[0]+0.2,H2[1]-0.4,-0.6+q*0.5,0.8+q*0.5,2.8,0.6,BDR[1]);
  /* ноги: тонкие кости, длинные стопы (дальняя темнее) */
  const lg=Math.sin(t*2.4+ph);
  bone(-2,9.4,-3.2-lg*0.2,12.8,1.6,1.3,BDR);bone(-3.2-lg*0.2,12.8,-3.8-lg*0.4,16,1.3,1,BDR);toes(-3.8-lg*0.4,16.2,1,3,BDR);
  bone(3,9.8,5.6+lg*0.3,12.8,1.9,1.5,BNR);bone(5.6+lg*0.3,12.8,4.4+lg*0.5,16.2,1.5,1.1,BNR);toes(4.4+lg*0.5,16.4,1,4,BNR);
  /* мантия-лохмотья: рваный подол длинными лентами, дыры и заплата, выцветшие звёзды */
  const TIP=[6.4,3.2,7.6,2.4,6.2,3.8,5.6];
  g.beginPath();g.moveTo(-5.4,-5.2);g.quadraticCurveTo(-7.6,0,-9.4,9);
  for(let i=0;i<7;i++){const x0=-9.4+i*2.7,xm=x0+1.3+Math.sin(t*2.2+i*1.7+ph)*0.7;g.lineTo(xm,9+TIP[i]+Math.sin(t*2.6+i*2.1)*0.8-pose*1.4);g.lineTo(x0+2.7,9.2+((i%2)?0.6:-0.4));}
  g.quadraticCurveTo(10.2,2,6,-5.2);g.quadraticCurveTo(0.4,-6.8,-5.4,-5.2);g.closePath();
  lmCradleFill(g,-3,-2,13,RB);g.strokeStyle=LN;g.lineWidth=0.9;g.lineJoin='round';g.stroke();
  g.save();g.clip();
  g.fillStyle='rgba(20,10,30,.35)';g.beginPath();g.ellipse(-3,13,13,5,0,0,TAU);g.fill();g.fillStyle='rgba(20,10,30,.26)';g.beginPath();g.ellipse(-9.6,3,3.4,9,0.1,0,TAU);g.fill();
  g.strokeStyle='rgba(20,10,30,.5)';g.lineWidth=0.5;for(const x of [-6,-2.6,1,4.6,7.4]){g.beginPath();g.moveTo(x*0.7,1);g.quadraticCurveTo(x*1.05+Math.sin(t*2+x)*0.3,6,x*1.25,14);g.stroke();}
  /* выцветшие звёзды: тусклое золото, одна прожжена */
  for(const [x,y,r] of [[-5.4,4,1.2],[-1.6,8.4,1.3],[6,7.4,1]])lmCradleStar(g,x,y,r,'#a8943c',0.7);
  g.fillStyle='#120a14';g.beginPath();g.moveTo(2.2,6.4);g.lineTo(3.6,5.4);g.lineTo(4.4,6.6);g.lineTo(3.8,8);g.lineTo(2.4,8.2);g.closePath();g.fill();g.strokeStyle='rgba(150,130,100,.5)';g.lineWidth=0.4;g.stroke();
  g.fillStyle='#120a14';g.beginPath();g.moveTo(-8,1.6);g.lineTo(-6.6,0.8);g.lineTo(-6,2.6);g.lineTo(-7.2,3.6);g.closePath();g.fill();
  /* заплата со стежками */
  g.fillStyle='#8a7c98';g.fillRect(4.6,-0.4,3.4,3.2);g.strokeStyle='rgba(20,10,30,.8)';g.lineWidth=0.4;g.strokeRect(4.6,-0.4,3.4,3.2);g.lineWidth=0.35;for(let i=0;i<4;i++){g.beginPath();g.moveTo(4.8+i*0.8,-0.5);g.lineTo(4.8+i*0.8,0.3);g.moveTo(4.8+i*0.8,2.2);g.lineTo(4.8+i*0.8,3);g.stroke();}
  /* вырез на груди: тёмный, в нём рёбра и позвоночник */
  g.fillStyle='#120a18';g.beginPath();g.moveTo(-2.8,-5.4);g.lineTo(1.2,4.4);g.lineTo(5,-5.4);g.closePath();g.fill();
  g.restore();
  g.save();g.beginPath();g.moveTo(-2.8,-5.4);g.lineTo(1.2,4.4);g.lineTo(5,-5.4);g.closePath();g.clip();
  g.strokeStyle=BN;g.lineWidth=0.7;for(let i=0;i<5;i++){const y=-4.6+i*1.75,w=4.2-i*0.7;g.beginPath();g.moveTo(1.2,y);g.quadraticCurveTo(1.2+w*0.7,y-0.6,1.2+w,y+0.8);g.stroke();g.beginPath();g.moveTo(1.2,y);g.quadraticCurveTo(1.2-w*0.5,y-0.4,1.2-w*0.7,y+0.6);g.stroke();}
  g.strokeStyle=BD;g.lineWidth=0.9;g.beginPath();g.moveTo(1.2,-5.6);g.lineTo(1.2,4.4);g.stroke();g.fillStyle=BN;for(let i=0;i<6;i++){g.beginPath();g.arc(1.2,-4.6+i*1.5,0.6,0,TAU);g.fill();}
  g.restore();
  /* воротник: рваный край выреза */
  g.strokeStyle='#4c4262';g.lineWidth=0.9;g.lineJoin='round';g.beginPath();g.moveTo(-2.8,-5.4);g.lineTo(-1.8,-3);g.lineTo(-2.2,-2.4);g.lineTo(-0.6,0.2);g.lineTo(-0.8,1);g.lineTo(1.2,4.4);g.lineTo(2.6,1.2);g.lineTo(3.2,-1.2);g.lineTo(4,-3.2);g.lineTo(5,-5.4);g.stroke();
  /* гнилой пояс с обрывком кисточки */
  g.strokeStyle='#8a7a5a';g.lineWidth=1.1;g.beginPath();g.moveTo(-7.6,3.4);g.quadraticCurveTo(0,5.4,7.6,3.2);g.stroke();g.strokeStyle='rgba(20,12,8,.6)';g.lineWidth=0.4;g.setLineDash([0.8,0.8]);g.stroke();g.setLineDash([]);
  g.strokeStyle='#8a7a5a';g.lineWidth=0.6;for(const [x,l] of [[3.4,4.4],[4.6,2.6]]){g.beginPath();g.moveTo(x,4.6);g.lineTo(x+Math.sin(t*2.2+x)*0.5,4.6+l);g.stroke();}
  /* голова: череп, глазницы с огоньками, раскрытая пасть, остатки колпака и бороды */
  const hb=Math.sin(t*1.7+ph)*0.3;
  g.save();g.translate(1.4,-6.6+hb);g.rotate(-0.06-pose*0.14+Math.sin(t*0.9+ph)*0.03);g.translate(-1.4,6.6);
  /* шея: позвонки */
  for(let i=0;i<3;i++){g.fillStyle=BD;g.beginPath();g.ellipse(0.4+i*0.15,-6+i*1.05,1.35,0.6,0,0,TAU);g.fill();g.fillStyle=BN;g.beginPath();g.ellipse(0.3+i*0.15,-6.2+i*1.05,0.9,0.4,0,0,TAU);g.fill();}
  /* пряди бороды: остались у подбородка, колышутся */
  g.lineCap='round';for(const [x,l,o] of [[2.8,9,0],[3.8,12,1.2],[4.8,7,2.1],[1.8,6,3.3],[5.6,5,4.1]]){const sx=Math.sin(t*1.9+o+ph)*1.2;g.strokeStyle='rgba(235,228,240,.85)';g.lineWidth=0.5;g.beginPath();g.moveTo(x,-5.4);g.quadraticCurveTo(x+sx*0.5+0.4,-5.4+l*0.5,x+sx,-5.4+l);g.stroke();}
  /* хвост колпака позади (рваный) */
  const tw=Math.sin(t*2-0.6+ph);
  g.beginPath();g.moveTo(-2.8,-16.2);g.lineTo(-6.6,-13.8);g.lineTo(-9,-9.6+tw*0.5);g.lineTo(-10.4+tw*0.9,-6+tw*0.8);g.lineTo(-8.4+tw*0.5,-8);g.lineTo(-8.2+tw*0.8,-5);g.lineTo(-6.4,-9.4);g.lineTo(-4.6,-11);g.lineTo(-3.4,-13);g.closePath();
  lmCradleFill(g,-6,-12,6,['#a698c4','#7a6c98','#3a2e54']);g.strokeStyle=LN;g.lineWidth=0.7;g.lineJoin='round';g.stroke();
  g.save();g.clip();g.strokeStyle='rgba(30,20,60,.5)';g.lineWidth=1.1;for(let i=0;i<4;i++){g.beginPath();g.moveTo(-3-i*2,-17);g.lineTo(-5-i*2.2,-6);g.stroke();}g.fillStyle='#120a18';g.beginPath();g.ellipse(-6.2,-11,0.9,0.6,0.5,0,TAU);g.fill();g.restore();
  /* череп: чуть повёрнут, трещина, скула, нос-дыра */
  g.beginPath();g.moveTo(-2.2,-12);g.bezierCurveTo(-2.4,-16.8,4.6,-17.8,6.6,-14);g.bezierCurveTo(7.4,-12.8,7.8,-11.2,7.8,-9.6);g.lineTo(7.8,-7.8);g.lineTo(1.6,-7.6);g.bezierCurveTo(-0.4,-8.4,-2.4,-9.8,-2.2,-12);g.closePath();
  lmCradleFill(g,0.4,-14.4,8,BNR);g.strokeStyle=LN;g.lineWidth=0.85;g.lineJoin='round';g.stroke();
  g.save();g.clip();g.fillStyle='rgba(60,40,20,.25)';g.beginPath();g.ellipse(-1.2,-9,3,3,0,0,TAU);g.fill();g.strokeStyle='rgba(50,30,20,.75)';g.lineWidth=0.4;g.beginPath();g.moveTo(1.8,-17.6);g.lineTo(2.4,-15.2);g.lineTo(1.6,-13.6);g.lineTo(2.2,-12.4);g.moveTo(2.4,-15.2);g.lineTo(3.8,-14.4);g.stroke();
  g.strokeStyle='rgba(50,30,20,.6)';g.beginPath();g.moveTo(1.8,-9.8);g.quadraticCurveTo(4,-10.6,6.4,-10);g.stroke();g.strokeStyle='rgba(255,250,235,.5)';g.lineWidth=0.35;g.beginPath();g.moveTo(1.9,-9.4);g.quadraticCurveTo(4,-10.2,6.4,-9.6);g.stroke();g.restore();
  /* глазницы: тьма и огонёк, из которых сыплется песок */
  for(const [x,y,r,P] of [[-0.3,-12.2,0.4,[[-1.6,-13.2],[-0.2,-13.8],[0.9,-13],[1.1,-11.8],[0.2,-11],[-1,-11],[-1.6,-12]]],[4.4,-12.4,0.65,[[2.7,-13.6],[4.6,-14.2],[6.2,-12.9],[6.4,-11.4],[5.2,-10.6],[3.6,-10.4],[2.8,-11.6]]]]){
    g.beginPath();g.moveTo(P[0][0],P[0][1]);g.quadraticCurveTo(P[1][0],P[1][1],P[2][0],P[2][1]);g.quadraticCurveTo(P[3][0],P[3][1],P[4][0],P[4][1]);g.quadraticCurveTo(P[5][0],P[5][1],P[6][0],P[6][1]);g.closePath();
    const sg=g.createLinearGradient(0,y-2,0,y+2);sg.addColorStop(0,'#000000');sg.addColorStop(1,'#1e0c12');g.fillStyle=sg;g.fill();g.strokeStyle='rgba(40,24,18,.9)';g.lineWidth=0.35;g.stroke();
    const px=x+lkx*0.3+0.3,py=y+0.7+lky*0.3;lmRim(g,q=>{softGlow(q,px,py,r*4.5,'#ffe8a0',0.5);});g.fillStyle='#fffbe0';g.beginPath();g.arc(px,py,r*0.42,0,TAU);g.fill();}
  g.strokeStyle='rgba(40,24,16,.8)';g.lineWidth=0.35;g.beginPath();g.moveTo(2.8,-13.4);g.lineTo(1.6,-14.6);g.lineTo(1.9,-15.8);g.moveTo(6.2,-11.2);g.lineTo(7.2,-11.8);g.moveTo(3.4,-10.4);g.lineTo(3,-9.2);g.lineTo(3.6,-8.6);g.stroke();
  g.fillStyle='#0a0408';g.beginPath();g.moveTo(7.2,-9.8);g.lineTo(6,-8.4);g.lineTo(7.8,-8.4);g.closePath();g.fill();
  /* пасть: тёмная глотка, верхние иглы, отвисшая нижняя челюсть с зубами */
  const hx=1.2,hy=-8.2,cj=Math.cos(jaw),sj=Math.sin(jaw),rot=(x,y)=>[hx+x*cj-y*sj,hy+x*sj+y*cj];
  const j1=rot(7.4,0.6),j2=rot(0.8,0.4);
  g.fillStyle='#0c0408';g.beginPath();g.moveTo(1.8,-7.9);g.lineTo(7.8,-7.7);g.lineTo(j1[0],j1[1]);g.lineTo(j2[0],j2[1]);g.closePath();g.fill();
  g.fillStyle='#6a1220';g.beginPath();g.ellipse((j1[0]+j2[0])/2,(j1[1]+j2[1])/2-0.6,2.6,0.8+jaw,0.2,0,TAU);g.fill();
  lmTeeth(g,2.2,-7.8,7.8,6,1.6,'#f0e8d2');
  g.save();g.translate(hx,hy);g.rotate(jaw);
  g.beginPath();g.moveTo(-1.4,-1.8);g.lineTo(0.6,0.4);g.lineTo(7.4,0.8);g.lineTo(7.8,2.4);g.lineTo(2.4,3.8);g.lineTo(-0.8,2.2);g.closePath();lmCradleFill(g,3,1,5,BNR);g.strokeStyle=LN;g.lineWidth=0.7;g.stroke();
  lmTeeth(g,1.2,0.6,7.2,5,1.5,'#f0e8d2',false);g.restore();
  /* песок: струя изо рта и две дорожки из глазниц */
  lmCradleSand(g,6.2,j1[1]+0.4,17-j1[1],t,2,11,SAND,0.8,2.2,0.7);
  lmCradleSand(g,4.4,-10,27,t,5,6,SAND,0.7,1.4,0.5);lmCradleSand(g,0.3,-10.4,27,t,7,4,SAND,0.7,-0.8,0.5);
  /* колпак спереди: лоскут на макушке с дырой */
  g.beginPath();g.moveTo(5.6,-15.4);g.lineTo(4.2,-17.2);g.lineTo(0.8,-17.8);g.lineTo(-2.8,-16.4);g.lineTo(-3.8,-14.6);g.lineTo(-1.8,-14);g.lineTo(-0.4,-15.2);g.lineTo(1.4,-14.2);g.lineTo(3.2,-15.4);g.lineTo(4.6,-14.6);g.closePath();
  lmCradleFill(g,1,-16.6,5,['#b4a6d0','#7a6c98','#3a2e54']);g.strokeStyle=LN;g.lineWidth=0.7;g.lineJoin='round';g.stroke();
  lmCradleStar(g,0,-16,0.8,'#a8943c',0.7);
  /* дохлый помпон-паутина на конце хвоста */
  lmCradleTuft(g,-10.4+tw*0.9,-5.4+tw*0.8,1.9,1.9,7,0.45,3,'#a89cb8',null,null,0,LN,['#d8d0e0','#a89cb8','#5a4e6c']);
  g.strokeStyle='rgba(220,210,235,.6)';g.lineWidth=0.3;g.beginPath();g.moveTo(-10.4+tw*0.9,-4);g.lineTo(-11+tw*1.1,-1.4);g.moveTo(-9.6+tw*0.9,-4);g.lineTo(-9.4+tw*1.2,-1);g.stroke();
  g.restore();
  /* ближняя рука: рваный рукав, кости, длинные пальцы; при замахе вскинута к шару песка */
  bone(4.4,-3.4,E[0],E[1],1.7,1.4,BNR);
  /* клок рукава на плече: два рваных лоскута */
  g.beginPath();g.moveTo(3,-4.6);g.lineTo(6,-4.2);g.lineTo(6.6,-2.4);g.lineTo(5.6,-3);g.lineTo(5.4,-1.2+Math.sin(t*2.6+ph)*0.3);g.lineTo(4.2,-2.6);g.lineTo(3,-1.4);g.closePath();
  lmCradleFill(g,4,-4,3,RB);g.strokeStyle=LN;g.lineWidth=0.7;g.lineJoin='round';g.stroke();
  bone(E[0],E[1],H[0],H[1],1.3,1.1,BNR);bone(E[0]+0.2,E[1]+0.8,H[0]-0.2,H[1]+0.8,1.1,0.9,BDR);
  const open=pose;
  for(let q=0;q<4;q++){const a0=1.2-open*2.7+q*0.2-0.2,a1=1.9-open*2.6+q*0.28;lmCradleFinger(g,H[0]+0.2,H[1]+0.2+q*0.35,a0,a1,3.8+(q===1||q===2?0.8:0),0.65,BN);}
  lmCradleFinger(g,H[0]-0.4,H[1]+0.6,0.2-open*1.6,0.9-open*1.4,2.6,0.6,BN);
  if(pose<0.5)lmCradleSand(g,H[0]+2.2,H[1]+3,17-(H[1]+3),t,3,10,SAND,0.8,1.2,0.6);
  if(pose>0.1||fol>0.05){
    lmRim(g,q=>{softGlow(q,H[0]+0.6,H[1]-2,3+8*pose,'#e0cc80',0.65*pose);for(let i=0;i<7;i++){const a=t*7+i*0.9,r=2.4+pose*1.6;q.fillStyle='#f0e0a0';q.fillRect(H[0]+0.6+Math.cos(a)*r,H[1]-1.8+Math.sin(a)*r*0.7,0.6,0.6);}});
    g.fillStyle='#b49a58';g.beginPath();g.ellipse(H[0]+0.6,H[1]-2,1.2+pose*1.3,1+pose*0.9,0,0,TAU);g.fill();g.fillStyle='#e8d890';g.beginPath();g.ellipse(H[0]+0.3,H[1]-2.3,0.6+pose*0.6,0.5+pose*0.4,0,0,TAU);g.fill();
    if(fol>0.05){g.fillStyle='rgba(205,176,106,.9)';for(let i=0;i<10;i++){const f=fol*(0.4+i*0.08);g.fillRect(H[0]+2+f*12+Math.sin(i*3.1)*1.4,H[1]-2+f*8*Math.sin(i)+f*f*6,0.7,0.7);}}}
  /* холодный контурный свет и дрейфующая пыль */
  lmRim(g,q=>{q.strokeStyle='rgba(220,210,255,.35)';q.lineWidth=0.7;q.beginPath();q.moveTo(-5.4,-5);q.quadraticCurveTo(-7.4,0,-9.2,8);q.stroke();
    q.fillStyle='rgba(230,215,160,.7)';for(let i=0;i<5;i++){const a=t*0.8+i*1.3;q.fillRect(Math.cos(a)*11-1,Math.sin(a*1.3+i)*12-2,0.7,0.7);}});
}
/* конусная лента-дымок: от (x0,y0) к (x1,y1) через изгиб (cx,cy), ширина w у основания сходит на нет */
function lmCradleRibbon(g,x0,y0,cx,cy,x1,y1,w,col){
  const nx0=-(cy-y0),ny0=cx-x0,l0=Math.hypot(nx0,ny0)||1,nx1=-(y1-cy),ny1=x1-cx,l1=Math.hypot(nx1,ny1)||1;
  g.beginPath();g.moveTo(x0+nx0/l0*w/2,y0+ny0/l0*w/2);g.quadraticCurveTo(cx+nx0/l0*w*0.3,cy+ny0/l0*w*0.3,x1,y1);g.quadraticCurveTo(cx-nx1/l1*w*0.3,cy-ny1/l1*w*0.3,x0-nx0/l0*w/2,y0-ny0/l0*w/2);g.closePath();g.fillStyle=col;g.fill();
}
/* коготь: изогнутый конус от основания к кончику, обводка и блик */
function lmCradleClaw(g,x,y,a,len,w,bend,col){
  const tx=x+Math.cos(a)*len+Math.cos(a+1.57)*bend,ty=y+Math.sin(a)*len+Math.sin(a+1.57)*bend,mx=x+Math.cos(a)*len*0.5+Math.cos(a+1.57)*bend*0.35,my=y+Math.sin(a)*len*0.5+Math.sin(a+1.57)*bend*0.35,nx=-Math.sin(a)*w/2,ny=Math.cos(a)*w/2;
  g.beginPath();g.moveTo(x+nx,y+ny);g.quadraticCurveTo(mx+nx*0.7,my+ny*0.7,tx,ty);g.quadraticCurveTo(mx-nx*0.7,my-ny*0.7,x-nx,y-ny);g.closePath();
  g.fillStyle=col||'#e8dcc8';g.fill();g.strokeStyle='rgba(12,6,14,.9)';g.lineWidth=0.55;g.lineJoin='round';g.stroke();
  g.strokeStyle='rgba(255,255,245,.55)';g.lineWidth=0.3;g.beginPath();g.moveTo(x+nx*0.2,y+ny*0.2);g.quadraticCurveTo(mx,my,tx,ty);g.stroke();
}
/* два звена к цели: локоть по стороне flip (true — назад/вниз), цель ограничена длиной */
function lmCradleIK(sx,sy,hx,hy,l1,l2,flip){
  let dx=hx-sx,dy=hy-sy,d=Math.hypot(dx,dy)||1;const dm=Math.min(l1+l2-0.01,d);dx/=d;dy/=d;
  const c=Math.acos(clamp((l1*l1+dm*dm-l2*l2)/(2*l1*dm),-1,1)),a=Math.atan2(dy,dx)+(flip?c:-c);
  return [sx+Math.cos(a)*l1,sy+Math.sin(a)*l1,sx+dx*dm,sy+dy*dm];
}
/* точка кубической кривой */
function lmCradleBez(p0,p1,p2,p3,u){const v=1-u,a=v*v*v,b=3*v*v*u,c=3*v*u*u,d=u*u*u;return [a*p0[0]+b*p1[0]+c*p2[0]+d*p3[0],a*p0[1]+b*p1[1]+c*p2[1]+d*p3[1]];}
/* живая конечность: гладкая лента переменной ширины через точки P (ширины W) — мышцы, а не трубка */
function lmCradleLimb(g,P,W,ramp,ln){
  const n=P.length,L=[],R=[];
  for(let i=0;i<n;i++){const a=P[Math.max(0,i-1)],b=P[Math.min(n-1,i+1)];let dx=b[0]-a[0],dy=b[1]-a[1];const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;L.push([P[i][0]-dy*W[i]/2,P[i][1]+dx*W[i]/2]);R.push([P[i][0]+dy*W[i]/2,P[i][1]-dx*W[i]/2]);}
  g.beginPath();g.moveTo(L[0][0],L[0][1]);
  for(let i=1;i<n-1;i++)g.quadraticCurveTo(L[i][0],L[i][1],(L[i][0]+L[i+1][0])/2,(L[i][1]+L[i+1][1])/2);
  g.lineTo(L[n-1][0],L[n-1][1]);g.lineTo(R[n-1][0],R[n-1][1]);
  for(let i=n-2;i>0;i--)g.quadraticCurveTo(R[i][0],R[i][1],(R[i][0]+R[i-1][0])/2,(R[i][1]+R[i-1][1])/2);
  g.lineTo(R[0][0],R[0][1]);g.closePath();
  lmCradleFill(g,P[0][0],P[0][1]-2,Math.hypot(P[n-1][0]-P[0][0],P[n-1][1]-P[0][1])*0.7+W[0],ramp);g.strokeStyle=ln||'rgba(6,3,10,.95)';g.lineWidth=0.8;g.lineJoin='round';g.stroke();
  /* контурный свет по краю, обращённому вверх-влево */
  let sc=0;for(let i=0;i<n;i++)sc+=(L[i][0]+L[i][1])-(R[i][0]+R[i][1]);const E=sc<0?L:R;
  lmRim(g,q=>{q.strokeStyle='rgba(180,156,240,.38)';q.lineWidth=0.8;q.lineCap='round';q.beginPath();q.moveTo(E[0][0],E[0][1]);for(let i=1;i<n-1;i++)q.quadraticCurveTo(E[i][0],E[i][1],(E[i][0]+E[i+1][0])/2,(E[i][1]+E[i+1][1])/2);q.stroke();});
}
/* рука/нога из двух звеньев с мышечной выпуклостью: точки S-e-h, ширины w0 (плечо), w1 (локоть), w2 (кисть) */
function lmCradleMuscleLimb(g,S,e,h,w0,w1,w2,bulge,ramp){
  const mid=(a,b,k)=>{const dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;return [(a[0]+b[0])/2-dy/l*k,(a[1]+b[1])/2+dx/l*k];};
  const P=[S,mid(S,e,bulge),e,mid(e,h,bulge*0.5),h],W=[w0,w0*1.12,w1,w1*1.1,w2];
  lmCradleLimb(g,P,W,ramp);
}
/* Кошмар: виден только в Истине (veilT>0.45); в Иллюзии — еле заметная звёздная тень. Состояния: idle, roar (замах, k 0..1), charge (рывок) */
LM_MODEL.lnightmare=function(g,m,FY,t,T,st,k,wv,ph){
  const truth=veilT>0.45,roar=st==='roar'?k:0,ch=st==='charge';
  if(!truth){lmCradleNightI(g,m,FY,t,ph);return;}
  g.save();g.translate(0,-4);g.scale(0.86,0.86);g.translate(0,4);
  lmCradleNightT(g,m,FY,t,ph,roar*roar*(3-2*roar),ch,m.lookX||0,m.lookY||0);
  g.restore();
};
/* Кошмар — Иллюзия: полупрозрачная звёздная тень — тонкая фигура с хвостом-шлейфом, две светлые щели-глаза */
function lmCradleNightI(g,m,FY,t,ph){
  const sw=Math.sin(t*1.6+ph),sw2=Math.sin(t*2.3+ph+1),sw3=Math.sin(t*1.1+ph+2.4);
  /* пряди-волосы от головы: стелются вверх-назад, запаздывают друг за другом */
  for(const [x0,y0,cx,cy,x1,y1,w,o] of [[1,-16,-6+sw*1.2,-20,-15+sw2*3,-22+sw*2,3.4,0],[2,-14,-8+sw2*1.5,-16,-18+sw*3,-14+sw3*3,3,1.4],[3,-18,-2+sw3*1.5,-24,-9+sw*3,-28+sw2*2,2.4,2.7]])lmCradleRibbon(g,x0,y0,cx,cy,x1,y1,w,'rgba(214,200,255,.3)');
  /* руки-пряди, свисают вперёд (позади тела) */
  for(const [x0,y0,cx,cy,x1,y1,w] of [[3,-5,9+sw2,-1,10+sw3*1.6,7,2.4]])lmCradleRibbon(g,x0,y0,cx,cy,x1,y1,w,'rgba(206,190,252,.3)');
  /* тело: узкая фигура с головой-каплей и хвостом-шлейфом, который закручивается назад */
  const tx=-16+sw2*2,ty=13+sw3*2;
  g.beginPath();g.moveTo(3,-17);g.bezierCurveTo(8,-17,9,-11,7,-7);g.bezierCurveTo(10,-2,9,5,4,9);g.bezierCurveTo(0,13,-8,15,tx,ty);g.bezierCurveTo(-8,10,-8,6,-7,0);g.bezierCurveTo(-6,-5,-4,-6,-3,-9);g.bezierCurveTo(-3,-14,-1,-17,3,-17);g.closePath();
  lmCradleFill(g,0,-12,16,['rgba(255,250,255,.8)','rgba(196,180,244,.5)','rgba(104,88,184,.14)']);
  g.strokeStyle='rgba(236,228,255,.75)';g.lineWidth=0.7;g.lineJoin='round';g.stroke();
  g.save();g.clip();g.fillStyle='rgba(110,90,200,.28)';g.beginPath();g.ellipse(2,8,9,5,-0.4,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.25)';g.beginPath();g.ellipse(-1,-12,3,5,0.3,0,TAU);g.fill();
  g.strokeStyle='rgba(255,255,255,.3)';g.lineWidth=0.5;g.beginPath();g.moveTo(1,-5);g.quadraticCurveTo(2,2,-4,9);g.moveTo(5,-4);g.quadraticCurveTo(6,3,2,8);g.stroke();g.restore();
  for(const [x,y,r,o] of [[0,-1,1.1,0],[5,3,1.4,1.3],[-4,8,1,2.1],[7,-3,0.9,3.2],[-9,12,0.8,4]])lmCradleStar(g,x,y,r,'#fff8ff',0.4+0.55*Math.sin(t*3+o*1.7)**2);
  /* глаза: две светлые щели-ромбы со слабым блеском; рядом три янтарные искорки — Истина уже смотрит */
  for(const [x,y,r] of [[1.4,-11.6,1.1],[5.6,-11.6,1.4]]){lmRim(g,q=>{softGlow(q,x,y,r*4,'#f4eeff',0.4);});
    g.fillStyle='#fffbff';g.beginPath();g.moveTo(x-r*1.9,y+0.5);g.quadraticCurveTo(x,y-r*1.6,x+r*1.9,y-0.4);g.quadraticCurveTo(x,y+r*1.1,x-r*1.9,y+0.5);g.fill();g.fillStyle='#4a3a8a';g.beginPath();g.ellipse(x+0.2,y-0.1,r*0.34,r*0.8,0,0,TAU);g.fill();}
  lmRim(g,q=>{for(const [x,y,o] of [[-7,-4,0],[9,-9,1],[0,7,2]]){const a=0.4+0.4*Math.sin(t*2.4+o*2);softGlow(q,x,y,3,'#ffb030',a*0.8);q.fillStyle='rgba(255,210,120,'+a+')';q.beginPath();q.arc(x,y,0.45,0,TAU);q.fill();}
    q.strokeStyle='rgba(255,255,255,.4)';q.lineWidth=0.6;q.beginPath();q.moveTo(3,-17);q.bezierCurveTo(-1,-17,-3,-14,-3,-9);q.bezierCurveTo(-4,-6,-6,-5,-7,0);q.stroke();
    for(const [x,y,r,o] of [[-12,-12,1.3,0],[12,-15,1.1,1.5],[13,4,0.9,3]])lmCradleStar(q,x,y+Math.sin(t*1.3+o)*0.8,r,'#fff4ff',0.4+0.5*Math.sin(t*2.7+o*2)**2);});
}
/* Кошмар — Истина: сгорбленный тёмный зверь, десятки янтарных глаз, пасть с клыками, длинные руки с когтями, дымные лохмотья */
function lmCradleNightT(g,m,FY,t,ph,E,ch,lkx,lky){
  const sw=Math.sin(t*3+ph),sw2=Math.sin(t*2.1+ph+1.2),br=Math.sin(t*2.4+ph);
  const FUR=['#3e3046','#160e1c','#050307'],FURL=['#56445e','#241a2e','#0a060e'],FURD=['#2a2034','#0f0a14','#030204'],BNC='#eadfca',AMB='#ffb838';
  const roar=E,jaw=0.2+br*0.03+roar*0.8+(ch?0.32:0);
  const LN='rgba(6,3,10,.95)',fy=FY-1;
  mobGlow(g,2,-4,30,'#4a2a8a',0.28);
  g.save();
  g.translate(-3,-roar*1.5-(ch?1:0));
  g.translate(-2,2);g.rotate(-0.15*roar+(ch?0.17:0));g.translate(2,-2);
  /* дымные лохмотья позади: запаздывают, при рывке вытягиваются назад */
  const stre=ch?1:0;
  for(const [x0,y0,cx,cy,x1,y1,w] of [[-12,-10,-18-stre*5,-17+sw*1.5,-26-stre*8,-12+sw2*3,7],[-6,-16,-11,-25+sw2*2,-20-stre*6,-27+sw*2,6],[-16,0,-21-stre*5,4+sw,-28-stre*8,9+sw2*2,6],[-14,7,-19-stre*4,12,-24-stre*7,15+sw*2,5]])lmCradleRibbon(g,x0,y0,cx,cy,x1,y1,w,'rgba(22,12,40,.72)');
  /* цели лап: покой — на земле, рёв — вперёд-в стороны, рывок — вперёд (хватать) / назад (ноги) */
  const nH=ch?[28,9]:[16.6-3.6*roar,fy-0.6-(fy+22)*roar],fH=ch?[26,2]:[20.4-2.4*roar,fy-0.6-(fy+20)*roar];
  /* дальняя рука и дальняя нога — темнее, позади */
  {const e=lmCradleIK(7,-6,fH[0],fH[1],12,13,true);
   lmCradleMuscleLimb(g,[7,-6],[e[0],e[1]],[e[2],e[3]],6.8,4.8,3.6,1.4,['#4a3a56','#1a1224','#07040c']);
   g.beginPath();g.ellipse(e[2],e[3],2.6,2.2,0,0,TAU);lmCradleFill(g,e[2],e[3]-1,2.6,FURD);g.stroke();
   for(let q=0;q<3;q++)lmCradleClaw(g,e[2]+(q-1)*0.9,e[3]+0.6,(ch?0.4:1.2-roar*2.7)+q*0.3,6.6,1.8,1.6,'#a89e8c');}
  {const f=lmCradleIK(-9,3,ch?-17:-6+sw*0.8,ch?9:fy,8.4,9,false);
   lmCradleMuscleLimb(g,[-9,3],[f[0],f[1]],[f[2],f[3]],6.4,3.6,2.6,-1.2,FURD);
   for(let q=0;q<3;q++)lmCradleClaw(g,f[2],f[3],(ch?2.9:0.4)+q*0.3,3.8,1.2,0.8,'#a89e8c');}
  /* шерстистая бахрома по хребту — рваный силуэт */
  const A=[[-18,6],[-21,-2],[-14,-10],[-6,-16]],B=[[-6,-16],[0,-23],[9,-24],[13,-17]];
  g.beginPath();let first=true;
  for(const [seg,sd] of [[A,0],[B,3]])for(let i=0;i<=8;i++){
    const u=i/8,P=lmCradleBez(seg[0],seg[1],seg[2],seg[3],u),ox=P[0]+2,oy=P[1]+6,ol=Math.hypot(ox,oy)||1,len=2.4+3*Math.abs(Math.sin(i*2.7+sd))+Math.sin(t*2.4+i*1.3+sd)*0.7+roar*1.4+(ch?1.4:0);
    const tip=[P[0]+ox/ol*len-1.4-(ch?2.4:0),P[1]+oy/ol*len+0.9];
    if(first){g.moveTo(P[0],P[1]);first=false;}else g.lineTo(P[0],P[1]);g.lineTo(tip[0],tip[1]);}
  g.lineTo(12,-6);g.lineTo(-14,4);g.closePath();g.fillStyle='#0a0510';g.fill();g.strokeStyle=LN;g.lineWidth=0.5;g.stroke();
  /* туловище: горб над головой, впалый живот */
  g.beginPath();g.moveTo(-18,6);g.bezierCurveTo(-21,-2,-14,-10,-6,-16);g.bezierCurveTo(0,-23,9,-24,13,-17);g.bezierCurveTo(15,-12,14,-4,10,1);g.bezierCurveTo(7,5,0,8,-6,8);g.bezierCurveTo(-12,9,-17,9,-18,6);g.closePath();
  lmCradleFill(g,-4,-17,22,FUR);g.strokeStyle=LN;g.lineWidth=0.9;g.lineJoin='round';g.stroke();
  g.save();g.clip();
  g.fillStyle='rgba(0,0,0,.5)';g.beginPath();g.ellipse(-4,9,18,5,0,0,TAU);g.fill();
  g.strokeStyle='rgba(130,110,170,.26)';g.lineWidth=0.5;g.lineCap='round';for(let i=0;i<13;i++){const x=-17+i*2.4,y=-10-Math.sin(i*0.5)*9;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+1.4,y+3,x+0.6,y+6.4);g.stroke();}
  g.strokeStyle='rgba(0,0,0,.55)';for(let i=0;i<10;i++){const x=-15+i*2.9,y=-2+Math.sin(i)*3;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x-1.6,y+3,x-0.6,y+6);g.stroke();}
  g.strokeStyle='rgba(255,150,40,.6)';g.lineWidth=0.5;g.beginPath();g.moveTo(-14,0);g.lineTo(-11.6,-2.4);g.lineTo(-10.4,-1);g.lineTo(-8,-3.6);g.moveTo(3,0);g.lineTo(5,-1.6);g.lineTo(6.4,-0.4);g.stroke();
  g.restore();
  /* ближняя задняя нога: бедро-ком, голень назад, лапа с когтями */
  {const f=lmCradleIK(-8,3,ch?-17:-9.4+sw*0.6,ch?9:fy,8.4,9,false);
   g.beginPath();g.ellipse(-8.6,2.4,6.4,5.6,-0.3,0,TAU);lmCradleFill(g,-10,-0.4,6.4,FURL);g.strokeStyle=LN;g.lineWidth=0.8;g.stroke();
   lmCradleMuscleLimb(g,[-8,3.4],[f[0],f[1]],[f[2],f[3]],6,3.8,2.8,-1.4,FURL);
   for(let q=0;q<4;q++)lmCradleClaw(g,f[2],f[3],(ch?2.9:0.2)+q*0.28,4.4,1.3,1,BNC);}
  /* рот на боку: узкая зубастая щель с тлеющим нутром */
  {g.save();g.translate(-5,-2.2);g.rotate(-0.12);const open=0.5+roar*0.5+Math.sin(t*1.8+ph)*0.15;
   g.beginPath();g.moveTo(-5,0);g.quadraticCurveTo(0,-2.4*open,5.4,0);g.quadraticCurveTo(0,2.6*open,-5,0);g.closePath();g.fillStyle='#4a0a10';g.fill();g.strokeStyle='rgba(4,2,6,.95)';g.lineWidth=0.7;g.stroke();
   lmRim(g,q=>{softGlow(q,0,0,5,'#ff7a20',0.35);});
   g.fillStyle='#e6d6bc';for(let i=0;i<7;i++){const x=-4+i*1.5,h=0.9*open+(i%2)*0.7;g.beginPath();g.moveTo(x-0.5,-0.9*open*(1-Math.abs(x)/6));g.lineTo(x,-0.9*open*(1-Math.abs(x)/6)+h);g.lineTo(x+0.5,-0.9*open*(1-Math.abs(x)/6));g.fill();g.beginPath();g.moveTo(x-0.5,0.9*open*(1-Math.abs(x)/6));g.lineTo(x+0.2,0.9*open*(1-Math.abs(x)/6)-h);g.lineTo(x+0.6,0.9*open*(1-Math.abs(x)/6));g.fill();}
   g.restore();}
  /* глаза по всему телу: каждый смотрит на шахтёра, прикрыты тяжёлыми веками */
  const EY=[[-14,-1,1.4,0],[-10,-9,1.7,1],[-5,-14,2.2,2],[0,-18,2.5,3],[5.4,-17,1.6,4],[-7,-4,2.1,5],[10,-10,1.4,6],[-2.4,-8,1.2,7],[2.4,-12,1.2,8],[-15.4,-6,1.1,9],[-1,-1,1,10]];
  for(const [x,y,r,i] of EY){const bk=Math.sin(t*0.9+i*2.9+ph*3),bl=bk>0.955?0.15:(bk<-0.9?0.6:1);
    lmRim(g,q=>{softGlow(q,x,y,r*3.6,AMB,0.55*(bl>0.5?1:0.3));});
    lmCradleEye(g,x,y,r,r*0.62,{w:'#ffc860',iris:'#ff8a20',ir:0.8,pupil:'#1a0600',slit:1,lx:lkx,ly:lky,bl,rot:-0.18+(i%3)*0.12,lid:'rgba(8,4,14,.95)',ln:'rgba(10,4,6,.9)'});}
  /* ближняя рука: огромное плечо, мышцы предплечья, лапа с костяными когтями */
  {const S=[3,-6],e=lmCradleIK(S[0],S[1],nH[0],nH[1],12,13,true);
   g.beginPath();g.ellipse(3.4,-7.4,6.4,6,0.5,0,TAU);lmCradleFill(g,1.6,-10,6.4,FURL);g.strokeStyle=LN;g.lineWidth=0.9;g.stroke();
   lmCradleMuscleLimb(g,S,[e[0],e[1]],[e[2],e[3]],7.8,5.8,4.4,1.8,['#6c5a7a','#2e2238','#0e0914']);
   g.beginPath();g.moveTo(e[0]-1,e[1]-1.2);g.lineTo(e[0]-3.6,e[1]-3.4);g.lineTo(e[0]+0.8,e[1]-2.2);g.closePath();g.fillStyle=BNC;g.fill();g.strokeStyle=LN;g.lineWidth=0.5;g.stroke();
   g.beginPath();g.ellipse(e[2],e[3],3.8,3,0.2,0,TAU);lmCradleFill(g,e[2]-0.6,e[3]-0.8,3.8,['#6c5a7a','#2e2238','#0e0914']);g.strokeStyle=LN;g.lineWidth=0.8;g.stroke();
   for(let q=0;q<4;q++){const a=ch?0.5-q*0.1:(-1.5+q*0.3)*roar+(0.7+q*0.3)*(1-roar);lmCradleClaw(g,e[2]+(q-1.5)*1.1,e[3]+0.8,a+(q-1.5)*0.12,8-Math.abs(q-1.5)*0.9,2.2,2,BNC);}}
  /* загривок: шипы гривы */
  for(let i=0;i<5;i++){const a=i/4,bx=6+a*5,by=-18+a*5;g.beginPath();g.moveTo(bx-1.4,by);g.lineTo(bx+1.6-a*3-sw*0.3,by-5.2-Math.sin(i*2)*1.4);g.lineTo(bx+1.6,by+1);g.closePath();g.fillStyle='#0a0510';g.fill();g.strokeStyle=LN;g.lineWidth=0.4;g.stroke();}
  /* голова: массивный череп, клыки, глаза, уши-шипы; сидит спереди-снизу, под горбом */
  const hu=-roar*0.6+(ch?0.1:0)+Math.sin(t*1.4+ph)*0.03;
  g.save();g.translate(14,-2.6);g.rotate(hu);g.scale(0.92,0.92);
  g.beginPath();g.moveTo(-3,-7);g.lineTo(-8,-17);g.lineTo(0.6,-9.4);g.closePath();lmCradleFill(g,-3,-11,6,FURD);g.strokeStyle=LN;g.lineWidth=0.6;g.stroke();
  g.beginPath();g.moveTo(-0.4,-10.4);g.lineTo(-3.6,-19.4+sw*0.4);g.lineTo(3.6,-11.2);g.closePath();lmCradleFill(g,0,-13,6,FUR);g.stroke();
  g.fillStyle='#8a2a40';g.beginPath();g.moveTo(-0.6,-10.8);g.lineTo(-2.8,-17.2);g.lineTo(1.8,-11.4);g.closePath();g.fill();
  for(const [x,y,tx,ty] of [[3.6,-11.4,5.6,-16],[7,-10.4,9.8,-14]]){g.beginPath();g.moveTo(x-1.2,y);g.lineTo(tx,ty);g.lineTo(x+1.4,y+0.4);g.closePath();g.fillStyle='#e4d8c0';g.fill();g.strokeStyle=LN;g.lineWidth=0.5;g.stroke();}
  g.beginPath();g.moveTo(-6.4,-5);g.bezierCurveTo(-5.6,-11.4,4,-12.6,8,-8.6);g.bezierCurveTo(11,-6.4,13.4,-4.6,14,-1.4);g.lineTo(13.4,0.8);g.bezierCurveTo(8,1.8,2,1.6,-3,1);g.bezierCurveTo(-6.6,0,-8,-2.6,-6.4,-5);g.closePath();
  lmCradleFill(g,0,-8,12,FURL);g.strokeStyle=LN;g.lineWidth=0.9;g.lineJoin='round';g.stroke();
  g.save();g.clip();g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.ellipse(-2,2,12,3,0,0,TAU);g.fill();
  g.strokeStyle='rgba(0,0,0,.6)';g.lineWidth=0.5;g.beginPath();g.moveTo(5.6,-6.6);g.quadraticCurveTo(9,-6.2,12,-3.6);g.moveTo(6,-3.4);g.quadraticCurveTo(9,-3,12.6,-1);g.stroke();
  g.strokeStyle='rgba(150,130,190,.3)';g.beginPath();for(let i=0;i<6;i++){g.moveTo(-5+i*2,-9+Math.abs(i-2)*0.4);g.lineTo(-4.4+i*2,-6);}g.stroke();g.restore();
  const hx=-1,hy=1.2,cj=Math.cos(jaw),sj=Math.sin(jaw),rot=(x,y)=>[hx+x*cj-y*sj,hy+x*sj+y*cj];
  const j1=rot(12.4,1),j2=rot(-0.6,0.8);
  g.fillStyle='#4a0610';g.beginPath();g.moveTo(1.6,0.6);g.lineTo(13.2,0.5);g.lineTo(j1[0],j1[1]);g.lineTo(j2[0],j2[1]);g.closePath();g.fill();
  lmRim(g,q=>{softGlow(q,6.6,1.6+jaw*4,2+jaw*9,'#ff5a20',0.25+roar*0.45);});
  g.fillStyle='#e6d6bc';for(let i=0;i<8;i++){const x=1.8+i*1.5,h=(i%3===1?4.4:2.2)+(i===7?1.6:0);g.beginPath();g.moveTo(x-0.7,0.9);g.lineTo(x+0.2+(i>5?0.4:0),0.9+h);g.lineTo(x+0.8,0.7);g.closePath();g.fill();g.strokeStyle='rgba(30,10,10,.8)';g.lineWidth=0.3;g.stroke();}
  g.save();g.translate(hx,hy);g.rotate(jaw);
  g.beginPath();g.moveTo(-3.4,-0.6);g.lineTo(12.6,0.8);g.lineTo(13.2,3);g.bezierCurveTo(9,6.6,0,6.8,-4.4,3.6);g.closePath();lmCradleFill(g,4,2,9,FUR);g.strokeStyle=LN;g.lineWidth=0.8;g.stroke();
  g.fillStyle='#e6d6bc';for(let i=0;i<6;i++){const x=1.2+i*1.9,h=(i%2===0?3.8:2);g.beginPath();g.moveTo(x-0.7,0.9);g.lineTo(x+0.1,0.9-h);g.lineTo(x+0.9,0.9);g.closePath();g.fill();g.strokeStyle='rgba(30,10,10,.8)';g.lineWidth=0.3;g.stroke();}
  g.restore();
  g.strokeStyle='rgba(255,190,90,.55)';g.lineWidth=0.4;for(const x of [4,8]){const q=rot(x,3);g.beginPath();g.moveTo(q[0],q[1]);g.quadraticCurveTo(q[0]+0.3,q[1]+2+jaw*3,q[0]-0.2,q[1]+3.6+jaw*5+Math.sin(t*3+x)*0.4);g.stroke();}
  lmRim(g,q=>{softGlow(q,4.8,-5.4,7,AMB,0.7);});
  lmCradleEye(g,4.8,-5.4,2.4,1.5,{w:'#ffd060',iris:'#ff8a20',ir:0.8,pupil:'#1a0600',slit:1,lx:lkx,ly:lky,rot:0.2,lid:'rgba(6,3,12,.98)',glow:'#ff8a20',ga:0.35});
  g.strokeStyle='rgba(6,3,10,.95)';g.lineWidth=1.6;g.lineCap='round';g.beginPath();g.moveTo(1.6,-8.6);g.lineTo(7.8,-6.8);g.stroke();
  for(const [x,y,r] of [[9.2,-4.6,1.2],[0.6,-8.4,1],[1.4,-2.6,0.8]]){lmRim(g,q=>{softGlow(q,x,y,r*3.4,AMB,0.5);});lmCradleEye(g,x,y,r,r*0.7,{w:'#ffc860',iris:'#ff8a20',ir:0.8,pupil:'#1a0600',slit:1,lx:lkx,ly:lky,rot:0.2,lid:'rgba(6,3,12,.95)'});}
  g.fillStyle='#ff8a20';g.beginPath();g.ellipse(12.8,-2.6,0.55,0.4,0.4,0,TAU);g.fill();
  g.restore();
  lmRim(g,q=>{q.strokeStyle='rgba(176,150,255,.42)';q.lineWidth=0.9;q.lineCap='round';q.beginPath();q.moveTo(-18,4);q.bezierCurveTo(-21,-2,-14,-10,-6,-16);q.bezierCurveTo(0,-23,9,-24,13,-17);q.stroke();
    q.beginPath();q.ellipse(3.4,-7.4,6.4,6,0.5,Math.PI*1.1,Math.PI*1.6);q.stroke();});
  lmRim(g,q=>{for(let i=0;i<5;i++){const f=((t*0.5+i*0.2+ph)%1),x=-12+i*5+Math.sin(t+i)*2,y=-20-f*8;q.fillStyle='rgba(255,170,60,'+(0.7*(1-f))+')';q.fillRect(x,y,0.7,0.7);}});
  g.restore();
  if(roar>0.02)mobGlow(g,16,-8,10+roar*14,'#ff3a2a',0.42*roar);
}
