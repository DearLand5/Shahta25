'use strict';
/* ============================================================
   Модели мобов Хрустального сада (Лиловые небеса): стеклянный певчий, хрустальная садовница, звонница.
   Оба облика в одной функции, T — Истина; общие помощники — в 54
   ============================================================ */
function lmGardenPoly(g,p){g.beginPath();g.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length;i++)g.lineTo(p[i][0],p[i][1]);g.closePath();}
/* четырёхлучевая искорка (рисуется поверх света) */
function lmGardenSpark(g,x,y,r,col,a){
  g.save();g.globalAlpha=a==null?1:a;g.fillStyle=col||'#fff';g.beginPath();
  g.moveTo(x,y-r);g.quadraticCurveTo(x+r*0.12,y-r*0.12,x+r,y);g.quadraticCurveTo(x+r*0.12,y+r*0.12,x,y+r);g.quadraticCurveTo(x-r*0.12,y+r*0.12,x-r,y);g.quadraticCurveTo(x-r*0.12,y-r*0.12,x,y-r);g.fill();g.restore();
}
/* хрустальный осколок-ромб: основа, острие, ширина; освещённая половина — сверху-слева, тёмная — снизу-справа, жилка, грани */
function lmGardenKite(g,bx,by,tx,ty,w,col,pos,edge,tint){
  const dx=tx-bx,dy=ty-by,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L;
  let nx=-uy,ny=ux;if(nx+ny>0){nx=-nx;ny=-ny;}
  pos=pos==null?0.4:pos;const mx=bx+dx*pos,my=by+dy*pos,hw=w/2,ax=mx+nx*hw,ay=my+ny*hw,cx=mx-nx*hw,cy=my-ny*hw;
  g.beginPath();g.moveTo(bx,by);g.lineTo(ax,ay);g.lineTo(tx,ty);g.lineTo(cx,cy);g.closePath();
  g.fillStyle=mobG(g,mx,my,L*0.55,col);g.fill();
  g.fillStyle='rgba(255,255,255,.34)';g.beginPath();g.moveTo(bx,by);g.lineTo(ax,ay);g.lineTo(tx,ty);g.closePath();g.fill();
  g.fillStyle='rgba(40,50,140,.28)';g.beginPath();g.moveTo(bx,by);g.lineTo(cx,cy);g.lineTo(tx,ty);g.closePath();g.fill();
  if(tint){const qx=bx+dx*0.62,qy=by+dy*0.62;g.fillStyle=tint;g.beginPath();g.moveTo(qx+nx*hw*0.35,qy+ny*hw*0.35);g.lineTo(tx,ty);g.lineTo(qx-nx*hw*0.3,qy-ny*hw*0.3);g.closePath();g.fill();}
  g.strokeStyle=edge||'rgba(60,80,170,.8)';g.lineWidth=0.55;g.lineJoin='round';g.beginPath();g.moveTo(bx,by);g.lineTo(ax,ay);g.lineTo(tx,ty);g.lineTo(cx,cy);g.closePath();g.stroke();
  g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=0.35;g.beginPath();g.moveTo(bx+dx*0.08,by+dy*0.08);g.lineTo(bx+dx*0.86,by+dy*0.86);g.stroke();
}
/* кость: трёхтоновый стержень с утолщёнными концами */
function lmGardenBone(g,x0,y0,x1,y1,w,c,kn,oc){
  g.lineCap='round';g.strokeStyle=oc||shadeHex(c,-0.6);g.lineWidth=w+1.1;g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();
  g.strokeStyle=shadeHex(c,-0.18);g.lineWidth=w;g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke();
  g.strokeStyle=c;g.lineWidth=w*0.6;g.beginPath();g.moveTo(x0-w*0.12,y0-w*0.12);g.lineTo(x1-w*0.12,y1-w*0.12);g.stroke();
  g.strokeStyle=shadeHex(c,0.4);g.lineWidth=Math.max(0.25,w*0.18);g.beginPath();g.moveTo(x0-w*0.22,y0-w*0.22);g.lineTo(x1-w*0.22,y1-w*0.22);g.stroke();
  if(kn!==0){const r=w*0.62*(kn||1);for(const [x,y] of [[x0,y0],[x1,y1]])mobBlob(g,x,y,r,r*0.9,c);}
}
/* коготь: изогнутый шип */
function lmGardenClaw(g,x,y,dx,dy,l,col,w){
  const nx=-dy,ny=dx,L=Math.hypot(dx,dy)||1;const ux=dx/L,uy=dy/L,px=-uy*(w||0.9),py=ux*(w||0.9);
  g.fillStyle=col;g.beginPath();g.moveTo(x+px,y+py);g.quadraticCurveTo(x+ux*l*0.7+px*0.4+nx*0.01,y+uy*l*0.7+py*0.4+0.6,x+ux*l+uy*0.6,y+uy*l+0.9);g.quadraticCurveTo(x+ux*l*0.5-px*0.2,y+uy*l*0.5-py*0.2,x-px,y-py);g.closePath();g.fill();
}
/* веер хрустальных перьев-лезвий */
function lmGardenWing(g,px,py,base,spread,far,sc,t,ph){
  sc=sc||1;const Ls=[12.5,16.5,19,18.5,15.5,11.5],Ws=[3.6,4.6,5,4.8,4.1,3.4],n=6;
  const cols=far?['#7e9ccc','#92a8e0','#7e9ccc','#92a8e0','#7e9ccc','#92a8e0']:['#e4f6ff','#b8dcff','#f0faff','#a8cdfa','#dcefff','#b8c8f8'];
  for(let i=0;i<n;i++){
    const a=base-(i-1.5)*0.27*spread,L=Ls[i]*sc,sw=Math.sin(t*6+i*0.9+ph)*0.03;
    const tx=px+Math.cos(a+sw)*L,ty=py+Math.sin(a+sw)*L;
    lmGardenKite(g,px,py,tx,ty,Ws[i]*sc,cols[i],0.42,far?'rgba(40,50,120,.8)':'rgba(70,90,175,.8)',far?null:(i%2?'rgba(230,190,255,.38)':'rgba(190,230,255,.3)'));
  }
  if(!far){/* кроющие перья у основания */
    for(let i=0;i<3;i++){const a=base-(i-0.9)*0.34*spread,L=(7.2-i*0.6)*sc;lmGardenKite(g,px,py,px+Math.cos(a)*L,py+Math.sin(a)*L,3.2*sc,i%2?'#f4fbff':'#d0e8ff',0.5,'rgba(70,90,175,.7)');}
  }
}
function lmGardenSing(g,x,y,k,t,col,a0){
  /* голос: дуги от клюва */
  lmRim(g,q=>{q.lineCap='round';for(let i=0;i<3;i++){const f=((t*1.8+i/3)%1),r=4+f*13;q.strokeStyle=col.replace('A',((1-f)*0.8*k*(a0||1)).toFixed(2));q.lineWidth=1.1;q.beginPath();q.arc(x,y,r,-0.75,0.75);q.stroke();}});
}

LM_MODEL.lglassbird=function(g,m,FY,t,T,st,k,wv,ph){
  const sing=st==='sing'?k:0,dive=st==='dive',wind=st==='windup'?k:0,ret=st==='retreat',s0=m.st||0;
  const fq=dive?20:ret?15:st==='sing'?7:11,fl=Math.sin(t*fq+m.phase),fl2=Math.sin(t*fq+m.phase-0.7);
  /* полёт: тело качается в такт взмахам и плавает, на скорости наклоняется носом вниз, хвост и лапки отстают */
  const mk=m.mk||0,fwd=clamp((m.vx||0)*(m.facing||1)/Math.max(1,m.def.spd),-1,1)*mk,vz=clamp((m.vy||0)/220,-1,1),brt=lmBreath(t,m.phase,2.6);
  const bob=Math.sin(t*fq+m.phase-0.5)*0.7+Math.sin(t*1.7+m.phase)*1.1,hov=Math.sin(t*1.7+m.phase+0.9);
  const tuck=clamp(fwd*0.8+(dive?0.8:0),0,1),lag=fl2*0.5;
  let tilt=-0.3+Math.sin(t*1.5+m.phase)*0.05+fwd*0.17+vz*0.08+hov*0.03,wb=-2.0+fl*0.5,sp=1;
  if(st==='sing'){tilt=-0.16-k*0.3;wb=-1.72+fl*0.14;sp=1+k*0.5;}
  else if(wind>0){tilt=-0.16-wind*0.4;wb=-1.62+fl*0.2;sp=1.2;}
  else if(dive){tilt=lerp(-0.5,0.8,eOut(s0/0.14));wb=-2.85+fl*0.08;sp=0.6;}
  else if(ret){tilt=lerp(0.8,-0.35,eOut(s0/0.2));wb=-1.9+fl*0.65;}
  const inflate=1+sing*0.16+(brt-0.5)*0.03;
  g.save();g.translate(0,bob);g.rotate(tilt);
  if(!T){
    const CB='#bfe4ff';
    /* дальнее крыло — темнее, позади */
    lmGardenWing(g,-2,-6.4,wb-0.55,sp,true,0.95,t,1);
    /* хвост: три хрустальных клинка с инерцией */
    const tl=[[-8,1.2,23,17,4.4],[-8,2,19,10,3.6],[-7,0.4,17,24,3.2]];
    tl.forEach(([bx,by,L,a0,w],i)=>{const a=Math.PI-0.1+(i-1)*0.2+Math.sin(t*2.4+i*1.3+m.phase)*0.07+(dive?0:0.14)-(dive?0.1:0)+Math.sin(t*fq*0.5)*0.03+lag*0.16+fwd*0.1-vz*0.12;
      const tx=bx+Math.cos(a)*L,ty=by+Math.sin(a)*L+(dive?0:4+i);
      lmGardenKite(g,bx,by,tx,ty,w,i===0?'#c8e0ff':i===1?'#b0cef8':'#d8c8ff',0.34,'rgba(60,80,170,.8)','rgba(220,190,255,.34)');
      if(i===0){/* острие-ромб на конце */lmGardenKite(g,tx-1.4,ty-0.4,tx-5.6,ty+2.8,2.6,'#f4fbff',0.5,'rgba(60,80,170,.8)');}});
    /* лапки: хрустальные, с коготками */
    for(const [hx,dk] of [[-1.6,1],[2.6,0]]){const c=dk?'#a4b8ec':'#e4f0ff',lg=lag*(dk?0.8:1)*(1-tuck*0.4),kx=hx-1.8-tuck*2.4+lg*0.7,ky=8.2-tuck*1.8,fx=hx+0.4-tuck*3.6+lg*1.2,fy=10.8-tuck*3.4+Math.sin(t*2+hx)*0.3+(lg*0.4);
      lmGardenBone(g,hx,4.6,kx,ky,1.2,c,0.8,'#6a80c8');lmGardenBone(g,kx,ky,fx,fy,0.9,c,0.8,'#6a80c8');
      for(const a of [-0.5,0.2,0.8]){const tx=fx+Math.cos(a)*2.2+0.4,ty=fy+Math.sin(a)*1.2+0.4;g.strokeStyle=shadeHex(c,-0.35);g.lineWidth=0.55;g.lineCap='round';g.beginPath();g.moveTo(fx,fy);g.lineTo(tx,ty);g.stroke();}}
    /* тело: грудь раздувается при песне */
    g.save();g.translate(3,1);g.scale(inflate,inflate*(1+sing*0.04));g.translate(-3,-1);
    const body=[[-10.5,2.6],[-8,-2.8],[-2,-6.6],[5,-6.8],[9.4,-3.6],[9.6,1.6],[4,6.6],[-3.4,5.8]];
    lmGardenPoly(g,body);g.fillStyle=mobG(g,-1,-3,11,CB);g.fill();
    g.save();g.clip();
    g.fillStyle='rgba(255,255,255,.42)';lmGardenPoly(g,[[-8,-2.8],[-2,-6.6],[5,-6.8],[2.4,-2.6],[-4.4,-1.6]]);g.fill();
    g.fillStyle='rgba(255,255,255,.14)';lmGardenPoly(g,[[-4.4,-1.6],[2.4,-2.6],[9.4,-3.6],[9.6,1.6],[3,1.4]]);g.fill();
    g.fillStyle='rgba(235,190,255,.4)';lmGardenPoly(g,[[3,1.4],[9.6,1.6],[4,6.6],[0.4,3.6]]);g.fill();
    g.fillStyle='rgba(50,60,150,.3)';lmGardenPoly(g,[[-10.5,2.6],[-4.4,-1.6],[3,1.4],[0.4,3.6],[4,6.6],[-3.4,5.8]]);g.fill();
    g.fillStyle='rgba(30,40,120,.24)';lmGardenPoly(g,[[-3.4,5.8],[4,6.6],[9.6,1.6],[10,8],[-5,9]]);g.fill();
    /* внутренний свет в груди */
    const cg=g.createRadialGradient(3.4,0.4,0.3,3.4,0.4,5.6);cg.addColorStop(0,'rgba(255,255,255,'+(0.6+sing*0.4)+')');cg.addColorStop(0.5,'rgba(190,225,255,'+(0.28+sing*0.5)+')');cg.addColorStop(1,'rgba(190,225,255,0)');
    g.fillStyle=cg;g.beginPath();g.arc(3.4,0.4,5.6,0,TAU);g.fill();
    g.restore();
    g.strokeStyle='rgba(60,80,170,.8)';g.lineWidth=0.55;g.lineJoin='round';lmGardenPoly(g,body);g.stroke();
    g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=0.35;g.beginPath();g.moveTo(-4.4,-1.6);g.lineTo(2.4,-2.6);g.lineTo(5,-6.8);g.moveTo(2.4,-2.6);g.lineTo(9.4,-3.6);g.moveTo(-4.4,-1.6);g.lineTo(-2,-6.6);g.stroke();
    g.restore();
    /* голова */
    const hb=Math.sin(t*1.9+m.phase)*0.3,hy=-9+hb-sing*1.2;
    const hr=lmFidget(t,m.phase,4.2)*0.14-lag*0.03-fwd*0.06-(wind>0?wind*0.12:0);
    g.save();g.translate(0,hb-sing*1.2);g.translate(8,-4);g.rotate(hr);g.translate(-8,4);g.translate(9,-6);g.scale(1.14,1.14);g.translate(-9,6);
    const head=[[7,-8.2],[10.2,-12.6],[15,-11.6],[17.4,-8],[14.6,-4.4],[9.4,-3.6]];
    /* хохолок: три шпиля, дальний темнее */
    [[8.4,-11.4,3.5,-17.2,1.6,'#8aa4e0'],[10.4,-12.6,9,-19.5,2.2,'#d0e8ff'],[11.8,-12.4,14.6,-18,1.8,'#f0f8ff']].forEach(([bx,by,tx,ty,w,c],i)=>{lmGardenKite(g,bx,by,tx+Math.sin(t*2.2+i)*0.5-fwd*2-lag*0.9*(i+1)*0.4,ty+Math.abs(fl2)*0.4*(i+1)*0.3,w,c,0.45,'rgba(60,80,170,.8)');});
    lmGardenPoly(g,head);g.fillStyle=mobG(g,10,-9,8,'#cfeaff');g.fill();
    g.save();g.clip();
    g.fillStyle='rgba(255,255,255,.45)';lmGardenPoly(g,[[7,-8.2],[10.2,-12.6],[15,-11.6],[11.6,-8.8]]);g.fill();
    g.fillStyle='rgba(50,60,150,.28)';lmGardenPoly(g,[[9.4,-3.6],[14.6,-4.4],[17.4,-8],[12,-7]]);g.fill();
    g.fillStyle='rgba(235,190,255,.35)';lmGardenPoly(g,[[7,-8.2],[11.6,-8.8],[9.4,-3.6]]);g.fill();
    g.restore();
    g.strokeStyle='rgba(60,80,170,.8)';g.lineWidth=0.55;g.lineJoin='round';lmGardenPoly(g,head);g.stroke();
    g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=0.35;g.beginPath();g.moveTo(11.6,-8.8);g.lineTo(10.2,-12.6);g.moveTo(11.6,-8.8);g.lineTo(17.4,-8);g.stroke();
    /* клюв: фиолетовый кристалл, раскрывается на песне */
    const op=sing*0.55;
    g.save();g.translate(15.6,-7.4);g.rotate(-op*0.5);
    lmGardenKite(g,0,-1.2,7.8,0.2,3,'#e6c4ff',0.3,'rgba(110,60,170,.85)');g.restore();
    if(sing>0.05){g.save();g.translate(15.2,-6.6);g.rotate(op);g.fillStyle='rgba(255,255,255,'+(0.5+sing*0.4)+')';lmGardenPoly(g,[[0,-0.6],[5.4,0.6],[0.6,2]]);g.fill();g.restore();}
    g.save();g.translate(15.2,-6.4);g.rotate(op);lmGardenKite(g,0,0.2,5.8,1.2,2.2,'#cfa8f0',0.3,'rgba(110,60,170,.85)');g.restore();
    /* глаз */
    const bl=(Math.sin(m.anim*1.1+m.phase*7)>0.985)?0.12:1,lx=(m.lookX||0)*0.4,ly=(m.lookY||0)*0.35,ex=13.2,ey=-8.4;
    g.fillStyle='#3a2a6a';g.beginPath();g.ellipse(ex,ey,2.3,2.4*bl,0.1,0,TAU);g.fill();
    if(bl>0.5){const ig=g.createRadialGradient(ex+lx,ey+ly+0.6,0.2,ex+lx,ey+ly,2);ig.addColorStop(0,'#d8b8ff');ig.addColorStop(0.6,'#7a52d0');ig.addColorStop(1,'#2a1a68');g.fillStyle=ig;g.beginPath();g.ellipse(ex+lx,ey+ly,1.9,2,0.1,0,TAU);g.fill();
      g.fillStyle='#0e0828';g.beginPath();g.arc(ex+lx+0.2,ey+ly+0.1,0.8,0,TAU);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(ex+lx-0.7,ey+ly-0.8,0.7,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.arc(ex+lx+0.7,ey+ly+0.8,0.32,0,TAU);g.fill();}
    g.strokeStyle='#3a2a7a';g.lineWidth=0.65;g.lineCap='round';g.beginPath();g.ellipse(ex,ey,2.4,2.5*bl,0.1,Math.PI*1.05,Math.PI*1.95);g.stroke();
    g.beginPath();g.moveTo(ex+1.8,ey-1.8);g.lineTo(ex+2.8,ey-2.4);g.stroke();
    g.restore();
    /* ближнее крыло поверх */
    lmGardenWing(g,0.5,-5.8,wb+0.05,sp,false,1,t,0);
    /* вспышки света и искорки */
    lmRim(g,q=>{
      q.strokeStyle='rgba(235,248,255,.5)';q.lineWidth=0.8;q.lineCap='round';q.beginPath();q.moveTo(-8,-2.8);q.lineTo(-2,-6.6);q.lineTo(5,-6.8);q.stroke();
      q.save();q.translate(8,-4+hb);q.rotate(hr);q.translate(-8,4-hb);q.beginPath();q.moveTo(7.4,-8.6);q.lineTo(10.2,-12.6+hb);q.lineTo(15,-11.6+hb);q.stroke();q.restore();});
    mobGlow(g,3.4,0.4,10+sing*6,'#a8d8ff',0.2+sing*0.4);
    const sk=[[-12,-9,1.3,0],[17,6,1.1,1.7],[-17,9,1,3.1],[6,-15,0.9,4.4]];
    lmRim(g,q=>{for(const [x,y,r,o] of sk){const a=0.5+0.5*Math.sin(t*3+o*2+m.phase);lmGardenSpark(q,x,y,r*(0.6+a*0.8),'#ffffff',0.4+a*0.5);}});
    if(sing>0.05)lmGardenSing(g,20.5,-6+hb,sing,t,'rgba(210,235,255,A)');
  }else{
    /* ===== ИСТИНА: скелет птицы, крылья — вмёрзшие в кость осколки на нитях сухожилий ===== */
    const BN='#e6dcc2',BD='#9c8a72',ICE='#9ab6d8',ICD='#5a74a0',BL='#6a0a1c';
    const open=0.32+sing*0.55+Math.max(0,fl)*0.05+Math.abs(lmTwitch(t,m.phase,1.3))*0.28+Math.sin(t*5.3+m.phase)*0.04;
    const spine=u=>{const a=(1-u)*(1-u),b=2*u*(1-u),c=u*u;return [a*-11+b*-2+c*7,a*2.5+b*-1+c*-6];};
    const sh=(bx,by,tx,ty,w,far)=>{lmGardenKite(g,bx,by,tx,ty,w,far?'#6e86aa':ICE,0.38,far?'rgba(20,24,50,.85)':'rgba(30,40,90,.85)',null);
      /* тёмно-красная кровь в трещине осколка */
      const mx=bx+(tx-bx)*0.55,my=by+(ty-by)*0.55;g.fillStyle='rgba(110,8,24,.7)';g.beginPath();g.moveTo(mx,my);g.lineTo(tx,ty);g.lineTo(mx+(tx-bx)*0.1+0.5,my+(ty-by)*0.1+0.8);g.closePath();g.fill();};
    /* крыло: кости руки и висящие осколки (рисуется функцией, чтобы вызвать дважды: дальнее и ближнее) */
    const wing=(ox,oy,base,far,jit)=>{
      const dir=(a,l)=>[Math.cos(a)*l,Math.sin(a)*l],E=dir(base+0.5,7.4),W=dir(base+0.2,8.6),ex=ox+E[0],ey=oy+E[1],wx=ex+W[0],wy=ey+W[1];
      const col=far?shadeHex(BN,-0.4):BN;
      /* вторичные осколки на предплечье */
      for(let i=0;i<4;i++){const f=0.2+i*0.25,px=ox+(wx-ox)*f*0.9+E[0]*0.1,py=oy+(wy-oy)*f*0.9+E[1]*0.1,a=base-0.5-i*0.34,L=[9,12.5,13,10][i],ja=Math.sin(t*5+i*1.7+jit)*0.12;
        sh(px,py,px+Math.cos(a+ja)*L,py+Math.sin(a+ja)*L,3.4,far);}
      /* три пальца с первостепенными осколками */
      [[0.2,9,-0.02],[-0.16,11,0.05],[-0.52,9,0.1]].forEach(([da,L,j],i)=>{const a=base+da,fx=wx+Math.cos(a)*L*0.6,fy=wy+Math.sin(a)*L*0.6,tx=wx+Math.cos(a)*L,ty=wy+Math.sin(a)*L,ja=Math.sin(t*5.5+i*1.3+jit)*0.1;
        sh(fx,fy,wx+Math.cos(a+ja)*(L+6.5),wy+Math.sin(a+ja)*(L+6.5),3.4,far);
        lmGardenBone(g,wx,wy,fx,fy,0.8,col,0.8);lmGardenBone(g,fx,fy,tx,ty,0.7,col,0.7);});
      lmGardenBone(g,ox,oy,ex,ey,1.3,col,1);lmGardenBone(g,ex,ey,wx,wy,1.05,col,1);
      /* сухожилие-нить */
      g.strokeStyle='rgba(120,12,34,.8)';g.lineWidth=0.4;g.beginPath();g.moveTo(ox,oy);g.quadraticCurveTo(ox+(wx-ox)*0.5-1,oy+(wy-oy)*0.5+2,wx,wy);g.stroke();
      /* лохмотья сухожилий свисают с кости */
      if(!far){g.strokeStyle='rgba(150,20,44,.85)';g.lineWidth=0.45;for(let i=0;i<3;i++){const f=0.35+i*0.3,qx=ex+(wx-ex)*f,qy=ey+(wy-ey)*f,sw=Math.sin(t*3+i*2)*1.2;g.beginPath();g.moveTo(qx,qy);g.quadraticCurveTo(qx-1.4+sw,qy+3,qx-0.6+sw*1.4,qy+5.5+i);g.stroke();}}
    };
    wing(-1,-5.5,wb-0.25,true,1.2);
    /* хвост: цепочка позвонков, на конце — длинный осколок, рядом свисает обрывок сухожилия */
    {let px=-10.6,py=2.4;const ta=Math.PI-0.12+0.1+Math.sin(t*2.4+m.phase)*0.08+lag*0.16+fwd*0.1-vz*0.12+lmTwitch(t,m.phase+0.5,0.8)*0.2;
      for(let i=0;i<5;i++){const a=ta+i*0.04+Math.sin(t*2.4+i*0.5+m.phase)*0.03,nx=px+Math.cos(a)*3.4,ny=py+Math.sin(a)*3.4+0.8;lmGardenBone(g,px,py,nx,ny,1.1-i*0.1,BN,0.9);px=nx;py=ny;}
      sh(px+1.4,py-0.6,px-11,py+3.2,3.6,false);sh(px+0.6,py+0.2,px-6,py+8.6,2.2,true);
      g.strokeStyle='rgba(150,20,44,.8)';g.lineWidth=0.4;g.beginPath();g.moveTo(px+1,py+1);g.quadraticCurveTo(px-1,py+4+Math.sin(t*3)*1,px-2.6,py+7);g.stroke();}
    /* ноги: кость с обратным коленом и длинными пальцами-крючьями */
    const leg=(hx,hy,dx,dy,far)=>{const col=far?shadeHex(BN,-0.4):BN,kx=hx+dx*0.5-1.2,ky=hy+dy*0.45+0.2,fx=hx+dx,fy=hy+dy;
      lmGardenBone(g,hx,hy,kx,ky,1.1,col,1);lmGardenBone(g,kx,ky,fx,fy,0.85,col,0.9);
      for(const [a,l] of [[0.5,4],[0.05,4.6],[-0.4,3.6]]){const tx=fx+Math.cos(a)*l*0.6,ty=fy+Math.sin(a)*l*0.6+0.6;lmGardenBone(g,fx,fy,tx,ty,0.6,col,0.6);lmGardenClaw(g,tx,ty,Math.cos(a+0.5),Math.sin(a+0.5)+0.6,2.2,shadeHex(col,-0.25),0.5);}
      lmGardenClaw(g,fx,fy,-1,0.4,2.6,shadeHex(col,-0.25),0.5);};
    const lgx=lag*0.9-tuck*3.4,lgy=-tuck*3.2+Math.abs(lag)*0.3;
    leg(2,5,-0.5+lgx*0.8,6+lgy,true);
    /* рёбра: тёмная пустота, сердце, рёбра веером */
    const rb=1+sing*0.22;
    g.save();g.translate(1,0);g.scale(rb,1+sing*0.05);g.translate(-1,0);
    g.beginPath();g.moveTo(-6,-2);g.quadraticCurveTo(-1,-7.4,6,-5.6);g.quadraticCurveTo(10,-1,6,3.6);g.quadraticCurveTo(0,6.6,-5,4);g.closePath();
    g.fillStyle=mobG(g,0,0,9,'#2a0a12');g.fill();g.save();g.clip();
    const hp=1+Math.sin(t*(7+sing*10))*0.12;
    g.fillStyle='#7a1224';g.beginPath();g.ellipse(2.6,-0.6,2.8*hp,2.4*hp,0.3,0,TAU);g.fill();g.fillStyle='#c4283c';g.beginPath();g.ellipse(2,-1.2,1.5*hp,1.2*hp,0.3,0,TAU);g.fill();
    g.strokeStyle='#4a0612';g.lineWidth=0.5;g.beginPath();g.moveTo(4,-2.4);g.lineTo(6.4,-5);g.moveTo(1,1.4);g.lineTo(-1,4.4);g.stroke();
    g.restore();g.strokeStyle='#120408';g.lineWidth=0.7;g.stroke();
    g.restore();
    /* позвоночник */
    for(let i=0;i<9;i++){const u=i/8,[x,y]=spine(u);const r=1.2+u*0.2;g.fillStyle=BD;g.beginPath();g.ellipse(x,y,r,r*0.85,0.2,0,TAU);g.fill();g.fillStyle=BN;g.beginPath();g.ellipse(x-0.2,y-0.3,r*0.7,r*0.55,0.2,0,TAU);g.fill();g.strokeStyle=BD;g.lineWidth=0.4;g.beginPath();g.moveTo(x,y-r*0.6);g.lineTo(x-0.4,y-r-0.9);g.stroke();}
    for(let i=0;i<5;i++){const u=0.4+i*0.11,[sx,sy]=spine(u),ex=sx+3.4+(i%2)*0.6,ey=3.6-i*0.3+1.2+i*0.4;
      g.lineCap='round';g.strokeStyle='#2a0a12';g.lineWidth=1.7*rb;g.beginPath();g.moveTo(sx,sy);g.quadraticCurveTo(sx+4.8*rb,sy+1.6,ex+1,ey+1);g.stroke();
      g.strokeStyle=BD;g.lineWidth=1.2;g.beginPath();g.moveTo(sx,sy);g.quadraticCurveTo(sx+4.8*rb,sy+1.6,ex+1,ey+1);g.stroke();
      g.strokeStyle=BN;g.lineWidth=0.7;g.beginPath();g.moveTo(sx-0.2,sy-0.2);g.quadraticCurveTo(sx+4.6*rb,sy+1.2,ex+0.8,ey+0.7);g.stroke();
      g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=0.3;g.beginPath();g.moveTo(sx,sy-0.3);g.quadraticCurveTo(sx+2.4,sy+0.4,sx+3.4,sy+1.6);g.stroke();}
    /* грудина-киль с врастающим осколком */
    g.beginPath();g.moveTo(-4.4,4.6);g.quadraticCurveTo(1,7.6,7,3.6);g.lineTo(6.2,3.2);g.quadraticCurveTo(1,5.4,-4,3.8);g.closePath();mobPath(g,BN,1,5,6);
    sh(0.4,6,-3.6,12.4,3.4,false);
    /* ближняя нога поверх */
    leg(-1.5,5,-1.2+lgx,6.6+lgy,false);
    /* шея: позвонки к черепу */
    for(let i=0;i<3;i++){const x=7.6+i*1.1,y=-6.4-i*0.9;g.fillStyle=BD;g.beginPath();g.ellipse(x,y,1.2,1,0.4,0,TAU);g.fill();g.fillStyle=BN;g.beginPath();g.ellipse(x-0.2,y-0.3,0.8,0.6,0.4,0,TAU);g.fill();}
    /* череп */
    const hb=Math.sin(t*1.9+m.phase)*0.3-sing*1.2,hrT=lmFidget(t,m.phase,4.2)*0.12+lmTwitch(t,m.phase,0.9)*0.2-lag*0.03-fwd*0.06-(wind>0?wind*0.12:0);
    g.save();g.translate(0,hb);g.translate(8,-6);g.rotate(hrT);g.translate(-8,6);
    /* остаток прежнего: хрустальный хохолок на черепе */
    sh(9.4,-12.4,3.8,-18,1.8,true);sh(11,-13.2,10,-20,2.2,false);sh(12.4,-12.8,15.6,-18.6,1.8,false);
    /* нижняя челюсть, повисшая */
    g.save();g.translate(11.4,-5.4);g.rotate(open);
    g.beginPath();g.moveTo(-1,0);g.lineTo(7.6,0.4);g.quadraticCurveTo(10.8,2.8,11.8,5.6);g.lineTo(7,2.6);g.lineTo(-1,2.2);g.closePath();mobPath(g,shadeHex(BN,-0.1),4,1,8);
    lmTeeth(g,1,0.2,8,6,1.5,'#fff6e4',false);
    g.restore();
    /* глотка */
    g.fillStyle='#2a0208';g.beginPath();g.moveTo(11.4,-5.4);g.lineTo(21,-6.4);g.lineTo(11.4+Math.cos(open)*9.6,-5.4+Math.sin(open)*9.6*0.5+1);g.closePath();g.fill();
    if(sing>0.05)mobGlow(g,16,-4,8,'#ff6a5a',0.6*sing);
    /* череп: свод + клюв-крюк */
    g.beginPath();g.moveTo(7.4,-8.6);g.bezierCurveTo(7.4,-13.6,12.6,-14.2,15.4,-11.6);g.bezierCurveTo(19.6,-10.8,23.6,-8.6,24.6,-5.2);g.lineTo(23.4,-5.4);g.bezierCurveTo(21,-7.4,18,-7.4,15,-6.8);g.lineTo(11.6,-5.2);g.bezierCurveTo(9,-5.6,7.4,-7,7.4,-8.6);g.closePath();
    mobPath(g,BN,10.5,-10.5,10);
    g.save();g.clip();g.fillStyle='rgba(60,40,20,.28)';g.beginPath();g.ellipse(14,-4.6,10,2.6,0,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.ellipse(11,-12.4,4,1,-0.3,0,TAU);g.fill();g.restore();
    lmTeeth(g,13.2,-6.6,22,7,1.7,'#fff6e4');
    /* трещина на черепе с красным светом изнутри */
    g.strokeStyle='#2a0a10';g.lineWidth=0.6;g.beginPath();g.moveTo(10.4,-13.4);g.lineTo(11.4,-11.8);g.lineTo(10.6,-10.8);g.lineTo(11.8,-9.4);g.stroke();
    g.fillStyle='rgba(255,60,70,.8)';g.fillRect(10.9,-11.9,0.6,0.7);
    /* глазница с красной точкой */
    g.fillStyle='#07020a';g.beginPath();g.moveTo(10.4,-10.2);g.lineTo(12.2,-11.4);g.lineTo(14.4,-10);g.lineTo(14.2,-7.8);g.lineTo(12.4,-7);g.lineTo(10.6,-8);g.closePath();g.fill();
    const lx=(m.lookX||0)*0.5,ly=(m.lookY||0)*0.4;
    mobGlow(g,12.4+lx,-9+ly,5.5,'#ff2a3a',0.8);g.fillStyle='#ff4a58';g.beginPath();g.arc(12.4+lx,-9+ly,1,0,TAU);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(12.1+lx,-9.3+ly,0.4,0,TAU);g.fill();
    g.strokeStyle='#cbbd9e';g.lineWidth=0.5;g.beginPath();g.moveTo(10.2,-10.4);g.lineTo(12.2,-11.7);g.lineTo(14.6,-10.2);g.stroke();
    g.restore();
    wing(0.5,-5.8,wb+0.05,false,0);
    /* оторванные осколки парят рядом с крылом */
    for(let i=0;i<2;i++){const fx=-9-i*5+Math.sin(t*2+i*2)*0.8,fy=-17+i*4+Math.cos(t*2.3+i)*1,a=-2.4+i*0.9+Math.sin(t*3+i)*0.2;g.save();g.globalAlpha=0.85;lmGardenKite(g,fx,fy,fx+Math.cos(a)*5.4,fy+Math.sin(a)*5.4,2.2,ICE,0.4,'rgba(30,40,90,.85)');g.restore();}
    /* капли с челюсти */
    {const dp=(t*1.4)%1;g.fillStyle='#7a0a1c';g.beginPath();g.ellipse(17.4,-1.2+hb+dp*7,0.5,0.8,0,0,TAU);g.fill();g.strokeStyle='rgba(122,10,28,.7)';g.lineWidth=0.4;g.beginPath();g.moveTo(17.4,-1+hb);g.lineTo(17.4,-1.2+hb+dp*7);g.stroke();}
    lmRim(g,q=>{q.save();q.translate(8,-6+hb);q.rotate(hrT);q.translate(-8,6-hb);q.strokeStyle='rgba(255,245,225,.4)';q.lineWidth=0.7;q.lineCap='round';q.beginPath();q.moveTo(7.4,-9+hb);q.bezierCurveTo(7.6,-13.4+hb,12.6,-14+hb,15.2,-11.6+hb);q.stroke();q.restore();});
    if(sing>0.05)lmGardenSing(g,22,-5+hb,sing,t,'rgba(255,150,140,A)');
  }
  g.restore();
};

/* ============================================================
   Хрустальная садовница
   ============================================================ */
/* цветок: пять лепестков с объёмом, серединка; wilt — увядший, лепестки обвисли */
function lmGardenFlower(g,x,y,r,pc,cc,rot,wilt){
  for(let i=0;i<5;i++){
    const a=rot+i*TAU/5,dr=wilt?0.5+0.25*Math.sin(i*2.3):0.8,cx=x+Math.cos(a)*r*dr,cy=y+Math.sin(a)*r*dr+(wilt?r*0.22:0);
    g.beginPath();g.ellipse(cx,cy,r*0.62,r*0.42,a,0,TAU);g.fillStyle=mobG(g,cx,cy,r*0.7,wilt?shadeHex(pc,-0.3):pc);g.fill();
    g.strokeStyle=shadeHex(pc,-0.5);g.lineWidth=0.3;g.stroke();
  }
  g.beginPath();g.arc(x,y,r*0.42,0,TAU);g.fillStyle=mobG(g,x,y,r*0.45,wilt?'#8a6a30':cc);g.fill();g.strokeStyle=shadeHex(cc,-0.5);g.lineWidth=0.3;g.stroke();
  if(!wilt){g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.arc(x-r*0.14,y-r*0.16,r*0.12,0,TAU);g.fill();}
}
/* кованые садовые ножницы: рычаги крест-накрест, клинки, ручки, винт. Рисуются в системе с началом в винте, +x — к остриям */
function lmGardenShears(g,op,T,drip){
  const Lb=15,Lh=8.6;
  for(const sd of [1,-1]){
    g.save();g.rotate(sd*op);
    const e=-sd;
    /* ручка с обмоткой */
    g.lineCap='round';
    g.strokeStyle=T?'#120a0c':'#4a4e70';g.lineWidth=2.6;g.beginPath();g.moveTo(-1.5,0);g.lineTo(-Lh,0);g.stroke();
    g.strokeStyle=T?'#4a3a34':'#8c92c8';g.lineWidth=1.8;g.beginPath();g.moveTo(-2,-0.2);g.lineTo(-Lh+0.2,-0.2);g.stroke();
    g.strokeStyle=T?'#7a6a5a':'#c8ccf0';g.lineWidth=0.5;g.beginPath();g.moveTo(-2.4,-0.8);g.lineTo(-Lh+0.6,-0.8);g.stroke();
    g.strokeStyle=T?'#2a1a14':'#5a5e90';g.lineWidth=0.5;for(let i=0;i<4;i++){const x=-3.4-i*1.5;g.beginPath();g.moveTo(x,-1.2);g.lineTo(x-0.7,1.2);g.stroke();}
    g.fillStyle=T?'#2a2024':'#6a70a8';g.beginPath();g.arc(-Lh,0,1.5,0,TAU);g.fill();g.fillStyle=T?'#6a5a50':'#a8aee0';g.beginPath();g.arc(-Lh-0.3,-0.4,0.7,0,TAU);g.fill();
    /* клинок: обух сверху, режущая кромка к другому клинку */
    g.beginPath();g.moveTo(-1.2,sd*1.9);g.quadraticCurveTo(Lb*0.5,sd*1.9,Lb+0.8,e*0.1);g.lineTo(Lb*0.55,e*0.9);g.lineTo(-1.2,e*0.9);g.closePath();
    const bc=T?'#4a4a58':'#b4bcd4';g.fillStyle=mobG(g,Lb*0.35,sd*1.2,Lb*0.6,bc);g.fill();g.strokeStyle=T?'#14101a':'#4a5478';g.lineWidth=0.5;g.lineJoin='round';g.stroke();
    g.strokeStyle=T?'rgba(200,190,200,.5)':'rgba(255,255,255,.8)';g.lineWidth=0.4;g.beginPath();g.moveTo(0.5,sd*1.4);g.quadraticCurveTo(Lb*0.5,sd*1.4,Lb,e*0.05);g.stroke();
    g.strokeStyle=T?'rgba(20,10,20,.6)':'rgba(90,110,170,.55)';g.lineWidth=0.35;g.beginPath();g.moveTo(1,sd*0.5);g.lineTo(Lb*0.8,e*0.1);g.stroke();
    if(T){/* ржавчина и кровь по клинку */
      g.fillStyle='rgba(110,50,20,.5)';g.beginPath();g.ellipse(Lb*0.3,sd*0.9,2.4,0.7,0,0,TAU);g.fill();
      g.fillStyle='rgba(120,8,20,.85)';g.beginPath();g.moveTo(Lb*0.45,e*0.75);g.lineTo(Lb+0.8,e*0.1);g.lineTo(Lb*0.95,e*0.6);g.quadraticCurveTo(Lb*0.8,e*1.2,Lb*0.6,e*0.9);g.closePath();g.fill();
      g.fillStyle='rgba(200,30,40,.7)';g.fillRect(Lb*0.55,e*0.5,Lb*0.3,0.3);}
    g.restore();
  }
  /* винт */
  g.beginPath();g.arc(0,0,1.5,0,TAU);mobPath(g,T?'#6a4a30':'#e0b44a',0,0,1.5);g.strokeStyle=T?'#1a0c08':'#6a4a10';g.lineWidth=0.35;g.beginPath();g.moveTo(-0.9,-0.4);g.lineTo(0.9,0.4);g.stroke();
}
/* рука-кристалл: два сегмента с шарниром в локте */
function lmGardenArm(g,hx,hy,fx,fy,l1,l2,back,w,col,oc){
  const dx=fx-hx,dy=fy-hy,d=Math.min(l1+l2-0.01,Math.hypot(dx,dy)),a=Math.atan2(dy,dx);
  const c=Math.acos(clamp((l1*l1+d*d-l2*l2)/(2*l1*d),-1,1)),ka=a+(back?c:-c),kx=hx+Math.cos(ka)*l1,ky=hy+Math.sin(ka)*l1,ex=hx+Math.cos(a)*d,ey=hy+Math.sin(a)*d;
  lmGardenBone(g,hx,hy,kx,ky,w,col,0,oc);lmGardenBone(g,kx,ky,ex,ey,w*0.82,col,0,oc);
  g.beginPath();g.arc(kx,ky,w*0.62,0,TAU);g.fillStyle=mobG(g,kx,ky,w*0.7,shadeHex(col,0.06));g.fill();g.strokeStyle=oc||shadeHex(col,-0.6);g.lineWidth=0.5;g.stroke();
  return [ex,ey,kx,ky];
}
/* бусина/жемчужина: объём без тяжёлой обводки */
function lmGardenBead(g,x,y,r,col,oc){g.beginPath();g.arc(x,y,r,0,TAU);g.fillStyle=mobG(g,x,y,r,col);g.fill();g.strokeStyle=oc||shadeHex(col,-0.35);g.lineWidth=0.4;g.stroke();}
function lmGardenRock(g,x,w,h,yb,col,lean,fr){
  lmGardenKite(g,x,yb+0.6,x+lean,yb-h,w*2,col,0.14,fr||'rgba(60,80,170,.8)','rgba(220,190,255,.34)');
}

LM_MODEL.lstatue=function(g,m,FY,t,T,st,k,wv,ph){
  const snip=st==='snipw'?k:0,rec=st==='recover',sT=m.st||0,mk=m.mk||0,br=Math.sin(t*1.7+m.phase);
  /* ход: постамент ковыляет — перекат с боку на бок на каждом шаге, подол колышется, коса и рука раскачиваются (по пути m.gd, без скольжения) */
  const gp=lmGait(m,9),brt=lmBreath(t,m.phase,1.9),rock=Math.sin(gp)*0.05*mk,hop=lmBob(m,9,1.3),glide=Math.sin(t*2+m.phase)*0.85+hop;
  const fwd=0.035*mk-snip*0.02;
  /* позы ножниц: покой -> замах (поднять и раскрыть) -> щелчок (вперёд-вниз, закрыты) -> восстановление */
  const idle={px:9.6+Math.sin(gp)*0.7*mk,py:-27.5+Math.sin(t*1.9+m.phase)*0.3+Math.sin(gp+0.8)*0.9*mk,ax:-0.55+Math.sin(gp+0.4)*0.05*mk+Math.sin(t*1.3+m.phase)*0.02,op:0.1+Math.sin(t*2.1+m.phase)*0.025+Math.sin(t*0.9+m.phase*2)*0.02+(T?lmTwitch(t,m.phase,0.8)*0.2:0),lean:0};
  const wind={px:7.4,py:-31.6,ax:-0.92,op:0.66,lean:-0.1};
  const snap={px:11.4,py:-19.4,ax:0.42,op:0,lean:0.09};
  let P;
  if(st==='snipw'){const e=eOut(snip);P={px:lerp(idle.px,wind.px,e),py:lerp(idle.py,wind.py,e),ax:lerp(idle.ax,wind.ax,e),op:lerp(idle.op,wind.op,e),lean:lerp(0,wind.lean,e)};}
  else if(rec){const w=clamp((sT-0.3)/0.55,0,1),u=eOut(w);P={px:lerp(snap.px,idle.px,u),py:lerp(snap.py,idle.py,u),ax:lerp(snap.ax,idle.ax,u),op:lerp(0,idle.op,u),lean:lerp(snap.lean,0,u)};}
  else P=idle;
  const open=rec?clamp(1-sT/0.8,0,1):0;      /* окно ударов: трещины светятся */
  const shake=snip>0.6?Math.sin(t*60)*0.35*(snip-0.6):0;
  const CB=T?'#a4b0c8':'#cfe6ff',FR=T?'rgba(30,34,70,.85)':'rgba(60,80,170,.8)';
  const FP=T?['#7c88a8','#8a96b4','#6e7a9c','#7c88a8','#6e7a9c']:['#9ab6e8','#a8c4f0','#a0bcec','#9ab6e8','#a8c4f0'];
  /* диск-основание */
  g.save();g.translate(0,FY);
  g.beginPath();g.ellipse(0,-1,14,3.6,0,0,TAU);mobPath(g,T?'#6a7490':'#9ab8e8',0,-1,14);
  g.beginPath();g.ellipse(0,-2.2,13,3.1,0,0,TAU);mobPath(g,T?'#8a96b4':'#dcefff',-3,-3.4,13);
  g.strokeStyle='rgba(255,255,255,.45)';g.lineWidth=0.4;g.beginPath();g.ellipse(0,-2.2,11,2.4,0,Math.PI*1.05,Math.PI*1.6);g.stroke();
  /* кристаллы позади */
  [[-10,2.1,10,-0.8],[-5,2.6,13,-0.4],[4.6,2.5,12,0.5],[9.6,2.2,9,0.9]].forEach(([x,w,h,l],i)=>lmGardenRock(g,x,w,h,-3,FP[i],l+Math.sin(gp*2+i*1.7)*0.18*mk+Math.sin(t*1.2+i*2+m.phase)*0.04,FR));
  g.save();g.translate(0,glide);g.scale(0.93*(1-0.006*brt),0.93*(1+0.016*brt));
  g.translate(shake,0);
  g.save();g.rotate(P.lean+rock+fwd);
  /* ----- дальняя рука (темнее, позади тела) ----- */
  const ca=Math.cos(P.ax),sa=Math.sin(P.ax),hand=(lx,ly)=>[P.px+ca*lx-sa*ly,P.py+sa*lx+ca*ly];
  const h2=hand(-6.8,0.6);
  const farC=T?'#5a6482':'#8aa8dc';
  if(!T){lmGardenArm(g,-2.6,-30,h2[0]+Math.sin(gp+Math.PI)*0.7*mk,h2[1]+Math.sin(t*1.9+m.phase+0.6)*0.3,8,8.4,true,2.6,farC,'#5a70b8');}
  else{ /* дальняя рука висит плетью с длинными пальцами */
    const lm=lmGardenArm(g,-3,-30,-8.6+Math.sin(t*1.6)*0.6-Math.sin(gp)*2.2*mk+lmTwitch(t,m.phase+0.3,0.8)*1.8,-12.4-Math.abs(Math.cos(gp))*0.8*mk+Math.sin(t*1.9+1)*0.4,8.4,8.4,true,2.5,farC,'#2a3048');
    g.strokeStyle='#2a3048';g.lineWidth=0.7;g.lineCap='round';for(let q=-1;q<=1;q++){g.beginPath();g.moveTo(lm[0],lm[1]);g.quadraticCurveTo(lm[0]+q*1.2-0.4,lm[1]+2.6,lm[0]+q*1.9-0.6+Math.sin(t*2+q)*0.5,lm[1]+5.4);g.stroke();}
    g.strokeStyle='#8a96b4';g.lineWidth=0.35;for(let q=-1;q<=1;q++){g.beginPath();g.moveTo(lm[0],lm[1]);g.quadraticCurveTo(lm[0]+q*1.2-0.5,lm[1]+2.5,lm[0]+q*1.9-0.7+Math.sin(t*2+q)*0.5,lm[1]+5.2);g.stroke();}}
  /* ----- юбка: грани-складки ----- */
  /* подол колышется: на ходу волна по складкам, в покое лёгкое дыхание, перед ударом раздувается */
  const hem0=[[-12.4,-7],[-10.2,-4.4],[-8,-7.2],[-5.4,-4.2],[-2.8,-7.2],[0,-4],[2.8,-7.2],[5.6,-4.4],[8,-7.4],[10.4,-4.8],[12,-7.4]];
  const hem=hem0.map(([x,y],i)=>[x*(1+snip*0.05)+Math.sin(gp+i*0.9)*0.9*mk+Math.sin(t*1.5+i*0.8+m.phase)*0.22,y+Math.sin(gp*2+i*1.3)*0.5*mk*(i%2?1:0.5)+Math.sin(t*1.8+i)*0.12]);
  const skirt=[[-4.6,-22.6],[-8.6,-14],...hem,[8.4,-14],[4.4,-22.6]];
  lmGardenPoly(g,skirt);g.fillStyle=mobG(g,-2,-15,15,CB);g.fill();
  g.save();g.clip();
  const wxs=[-4.6,-2.6,-0.4,1.8,3.2,4.4],hxs=[-12.4,-7,-1.6,3.8,8.6,12];
  const tn=T?['rgba(240,245,255,.3)','rgba(240,245,255,.1)','rgba(0,0,0,0)','rgba(20,20,60,.18)','rgba(10,10,40,.34)']:['rgba(255,255,255,.42)','rgba(255,255,255,.16)','rgba(240,200,255,.2)','rgba(40,60,150,.16)','rgba(30,40,130,.3)'];
  for(let i=0;i<5;i++){g.fillStyle=tn[i];lmGardenPoly(g,[[wxs[i],-22.6],[wxs[i+1],-22.6],[hxs[i+1],-3],[hxs[i],-3]]);g.fill();}
  g.strokeStyle=T?'rgba(220,230,255,.35)':'rgba(255,255,255,.55)';g.lineWidth=0.4;for(let i=1;i<5;i++){g.beginPath();g.moveTo(wxs[i],-22.6);g.lineTo(hxs[i]*0.92+0.5,-7);g.stroke();}
  /* изломы внутри кристалла */
  g.strokeStyle=T?'rgba(20,20,50,.35)':'rgba(90,110,190,.35)';g.lineWidth=0.35;g.beginPath();g.moveTo(-3,-19);g.lineTo(-4.4,-14);g.lineTo(-3.6,-10);g.moveTo(3.4,-18);g.lineTo(5,-13);g.lineTo(4,-9);g.stroke();
  /* тень под поясом */
  const sg=g.createLinearGradient(0,-22.6,0,-17);sg.addColorStop(0,'rgba(30,40,120,.3)');sg.addColorStop(1,'rgba(30,40,120,0)');g.fillStyle=sg;g.fillRect(-12,-22.6,24,6);
  if(T){/* трещины с тёмной пустотой и красным светом */
    const cr=[[[-1,-21],[-3,-17],[-1.6,-14],[-4,-9.6],[-3,-5]],[[4.4,-20],[2.4,-16],[4.4,-12.4],[3.2,-8],[5,-4]],[[-8,-12],[-6.4,-10],[-7.6,-7]]];
    for(const c of cr){g.strokeStyle='#0c0610';g.lineWidth=1.3;g.beginPath();g.moveTo(c[0][0],c[0][1]);for(const q of c)g.lineTo(q[0],q[1]);g.stroke();
      g.strokeStyle='rgba(255,70,90,'+(0.4+0.25*Math.sin(t*3)+open*0.4).toFixed(2)+')';g.lineWidth=0.45;g.beginPath();g.moveTo(c[0][0],c[0][1]);for(const q of c)g.lineTo(q[0],q[1]);g.stroke();}
    /* грязь и кровь на подоле */
    const bg=g.createLinearGradient(0,-9,0,-3);bg.addColorStop(0,'rgba(90,8,24,0)');bg.addColorStop(1,'rgba(90,8,24,.55)');g.fillStyle=bg;g.fillRect(-13,-9,26,7);}
  g.restore();
  g.strokeStyle=FR;g.lineWidth=0.6;g.lineJoin='round';lmGardenPoly(g,skirt);g.stroke();
  if(T){/* лишний глаз в трещине юбки */
    const bl=Math.sin(m.anim*0.7+m.phase*5)>0.97?0.15:1,ex=-6.4,ey=-11.4;g.fillStyle='#08040a';g.beginPath();g.ellipse(ex,ey,2.4,1.5*bl,-0.4,0,TAU);g.fill();
    if(bl>0.5){g.fillStyle='#ece0da';g.beginPath();g.ellipse(ex,ey,1.9,1.1,-0.4,0,TAU);g.fill();mobGlow(g,ex,ey,5,'#ff2a3a',0.5);g.fillStyle='#b01426';g.beginPath();g.arc(ex+(m.lookX||0)*0.4,ey+0.1,0.8,0,TAU);g.fill();g.fillStyle='#000';g.beginPath();g.arc(ex+(m.lookX||0)*0.4,ey+0.1,0.35,0,TAU);g.fill();}}
  /* ----- коса сзади ----- */
  const sw=Math.sin(t*1.6+m.phase)*0.6+Math.cos(gp)*1.1*mk-rock*14;
  for(let i=0;i<5;i++){const bx=-3.4-i*0.9+sw*i*0.2,by=-35+i*3;mobBlob(g,bx,by,1.5-i*0.1,1.4,i%2?(T?'#7a86a6':'#b8d0f8'):(T?'#8a96b4':'#d0e2ff'));}
  if(T){g.strokeStyle='#120a14';g.lineWidth=0.5;g.lineCap='round';for(let i=0;i<4;i++){g.beginPath();g.moveTo(-3.6+i*0.4,-34+i*0.2);g.quadraticCurveTo(-7.4+sw*0.5-i*0.8,-28,-6.8+sw-i*0.6,-19+i*1.2+Math.sin(t*2+i)*0.8);g.stroke();}}
  /* ----- корпус ----- */
  const tor=[[-3.8,-22.8],[3.8,-22.8],[4.8,-26.6],[5.8,-30.4],[2,-32],[-1.4,-32],[-5.8,-30.2],[-4.8,-26.6]];
  lmGardenPoly(g,tor);g.fillStyle=mobG(g,-1,-28,9,T?'#b4c0d8':'#d8ecff');g.fill();
  g.save();g.clip();
  g.fillStyle='rgba(255,255,255,.4)';lmGardenPoly(g,[[-5.8,-30.2],[-1.4,-32],[0.6,-26],[-4.8,-26.6]]);g.fill();
  g.fillStyle='rgba(240,200,255,.22)';lmGardenPoly(g,[[0.6,-26],[2,-32],[5.8,-30.4],[4.8,-26.6]]);g.fill();
  g.fillStyle='rgba(40,60,150,.22)';lmGardenPoly(g,[[-4.8,-26.6],[0.6,-26],[4.8,-26.6],[3.8,-22.8],[-3.8,-22.8]]);g.fill();
  g.strokeStyle='rgba(255,255,255,.45)';g.lineWidth=0.35;g.beginPath();g.moveTo(0.6,-26);g.lineTo(-1.4,-32);g.moveTo(0.6,-26);g.lineTo(0.4,-22.8);g.stroke();
  g.restore();
  g.strokeStyle=FR;g.lineWidth=0.6;lmGardenPoly(g,tor);g.stroke();
  /* пояс-лента */
  g.fillStyle=T?'#4a3a4a':'#c8a8f8';g.beginPath();g.moveTo(-4,-23.6);g.lineTo(4.2,-23.6);g.lineTo(4.4,-22);g.lineTo(-4.2,-22);g.closePath();g.fill();g.fillStyle='rgba(255,255,255,.4)';g.fillRect(-4,-23.6,8,0.4);
  /* шея */
  g.beginPath();g.moveTo(-1.2,-31.8);g.lineTo(2,-31.8);g.lineTo(1.7,-34.4);g.lineTo(-0.9,-34.4);g.closePath();mobPath(g,T?'#aab6cc':'#cfe6ff',0.4,-33,3);
  /* ----- плющ вокруг корпуса ----- */
  {const vc=T?'#1e2a22':'#8fe0c0',vo=T?'#080c0a':'#3a8a70';
    const vp=[[-5.2,-29.4],[-2,-27.6],[1.6,-25.4],[4.2,-23.4],[1,-21.8],[-3,-20.4],[-7,-17.4]];
    g.lineCap='round';g.lineJoin='round';g.strokeStyle=vo;g.lineWidth=1.5;g.beginPath();g.moveTo(vp[0][0],vp[0][1]);for(let i=1;i<vp.length;i++)g.quadraticCurveTo((vp[i-1][0]+vp[i][0])/2+(i%2?0.8:-0.8),(vp[i-1][1]+vp[i][1])/2+0.6,vp[i][0],vp[i][1]);g.stroke();
    g.strokeStyle=vc;g.lineWidth=0.9;g.stroke();
    g.strokeStyle=T?'rgba(120,150,120,.4)':'rgba(255,255,255,.6)';g.lineWidth=0.3;g.stroke();
    vp.forEach(([x,y],i)=>{if(i%2===1){const a=(i%4===1?-0.9:2.4)+Math.sin(t*1.6+i)*0.1;lmGardenKite(g,x,y,x+Math.cos(a)*(T?3.6:3.2),y+Math.sin(a)*(T?3.6:3.2),T?1.3:1.9,T?'#2a3a2c':'#9ae8c8',0.45,T?'rgba(0,0,0,.8)':'rgba(40,120,100,.8)');}});
    if(T){g.strokeStyle='#0a0e0c';g.lineWidth=0.5;for(const [x,y,dx,dy] of [[-2,-27.6,-0.8,-1.8],[1.6,-25.4,1.4,-1.4],[-3,-20.4,-1.6,1.4],[4.2,-23.4,1.8,0.6]]){g.beginPath();g.moveTo(x,y);g.lineTo(x+dx,y+dy);g.stroke();}}
    if(!T){lmGardenFlower(g,-5.2,-29.8,1.6,'#e8d0ff','#ffe080',0.6);lmGardenFlower(g,-7,-17.4,1.5,'#ffb8e0','#ffe080',1.5);lmGardenFlower(g,4.4,-23.4,1.3,'#ffb8e0','#ffe080',0.2);}
    else{lmGardenFlower(g,-5.2,-29.8,1.5,'#a890c0','#8a6a30',0.6,true);lmGardenFlower(g,-7,-17.4,1.4,'#a890c0','#8a6a30',1.5,true);}}
  /* ----- голова ----- */
  const hx=0.8,hy=-38;
  /* голова: оглядывается (редкий жест), держится ровно при качке, в Истине резко дёргается */
  const hr=lmFidget(t,m.phase,5.5)*0.16+Math.sin(t*1.1+m.phase)*0.025-rock*0.7+(T?lmTwitch(t,m.phase,0.9)*0.17:0);
  g.save();g.translate(hx,hy+4.4);g.rotate(hr);g.translate(-hx,-hy-4.4-brt*0.25);
  if(!T){
    g.beginPath();g.ellipse(hx,hy,3.8,4.7,0.08,0,TAU);mobPath(g,'#dcefff',hx-1,hy-1.4,4.7);
    g.save();g.clip();g.fillStyle='rgba(40,60,150,.22)';g.beginPath();g.ellipse(hx+2.6,hy+0.6,2.2,4.8,0.1,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.4)';g.beginPath();g.ellipse(hx-1.4,hy-1.8,1.4,2.2,0.3,0,TAU);g.fill();
    g.fillStyle='rgba(240,200,255,.24)';lmGardenPoly(g,[[hx+0.4,hy-3],[hx+3.6,hy-0.4],[hx+0.6,hy+1.6]]);g.fill();
    g.fillStyle='rgba(255,255,255,.28)';lmGardenPoly(g,[[hx-3.4,hy-1],[hx-0.4,hy-4.6],[hx+1.6,hy-1.6],[hx-1.4,hy+1.6]]);g.fill();
    g.strokeStyle='rgba(110,130,210,.45)';g.lineWidth=0.35;g.beginPath();g.moveTo(hx-0.4,hy-4.6);g.lineTo(hx+0.4,hy-3);g.lineTo(hx+1.6,hy-1.6);g.lineTo(hx+0.6,hy+1.6);g.lineTo(hx+1.2,hy+4.6);g.moveTo(hx+1.6,hy-1.6);g.lineTo(hx+3.8,hy-0.6);g.stroke();
    g.strokeStyle='rgba(120,100,190,.5)';g.lineWidth=0.4;g.lineCap='round';g.beginPath();g.moveTo(hx+1.4,hy-0.6);g.quadraticCurveTo(hx+2.4,hy+0.2,hx+3.2,hy-0.5);g.stroke();g.beginPath();g.moveTo(hx+2.2,hy+2.6);g.quadraticCurveTo(hx+2.8,hy+2.9,hx+3.3,hy+2.5);g.stroke();
    g.restore();
    /* пучок волос */
    g.beginPath();g.ellipse(hx-3.2,hy-3.2,2.5,2.3,0,0,TAU);mobPath(g,'#c4d8fc',hx-4,hy-4,2.6);g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=0.3;g.beginPath();g.arc(hx-3.2,hy-3.2,1.4,3.6,5.2);g.stroke();
    /* венок */
    lmGardenFlower(g,hx-2.6,hy-6.2,1.9,'#ffb8e0','#ffe080',0.3);lmGardenFlower(g,hx+0.6,hy-6.9,1.7,'#e8d0ff','#ffe080',1.1);lmGardenFlower(g,hx+3,hy-5.2,1.6,'#ffb8e0','#ffe080',2);lmGardenFlower(g,hx-4.2,hy-2,1.4,'#e8d0ff','#ffe080',0.9);
  }else{
    /* разбитая голова: череп из кристалла, вместо лица — пролом с тьмой и двумя красными огоньками */
    const hd=[[hx-3.7,hy+1.6],[hx-3.8,hy-2.2],[hx-3,hy-3.8],[hx-2.4,hy-6.4],[hx-0.8,hy-4],[hx+0.2,hy-7.2],[hx+1.8,hy-4.2],[hx+3.4,hy-5.6],[hx+3.8,hy-1],[hx+3.4,hy+2.4],[hx+1,hy+4.7],[hx-1.6,hy+4.2]];
    lmGardenPoly(g,hd);g.fillStyle=mobG(g,hx-1,hy-1.4,5.4,'#bcc8de');g.fill();
    g.save();g.clip();
    g.fillStyle='rgba(20,24,60,.3)';g.beginPath();g.ellipse(hx+2.8,hy+0.6,2.4,5,0.1,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.3)';lmGardenPoly(g,[[hx-3.8,hy-2.2],[hx-2.4,hy-6.4],[hx-0.8,hy-4],[hx-1.4,hy]]);g.fill();
    /* пролом на лице: рваный, чёрный */
    g.fillStyle='#07030a';lmGardenPoly(g,[[hx-0.6,hy-3.4],[hx+1.2,hy-3.9],[hx+2.6,hy-2],[hx+2.2,hy+0.6],[hx+3.1,hy+1.8],[hx+0.8,hy+3],[hx-0.4,hy+1.4],[hx-1.8,hy+0.6],[hx-1.2,hy-1.6]]);g.fill();
    const lx=(m.lookX||0)*0.5;mobGlow(g,hx+0.8+lx,hy-1.2,3.4,'#ff2a3a',0.4);g.fillStyle='#ff5a68';g.beginPath();g.arc(hx-0.2+lx,hy-1.2,0.5,0,TAU);g.arc(hx+1.6+lx,hy-1.2,0.5,0,TAU);g.fill();
    g.restore();
    g.strokeStyle=FR;g.lineWidth=0.6;g.lineJoin='round';lmGardenPoly(g,hd);g.stroke();
    g.strokeStyle='#0c0610';g.lineWidth=0.45;g.beginPath();g.moveTo(hx-2.6,hy-1.2);g.lineTo(hx-1.4,hy+1.4);g.lineTo(hx-2,hy+3.4);g.stroke();
    /* остатки венка: увядшие цветы */
    lmGardenFlower(g,hx-4,hy-2,1.8,'#b8a0d0','#8a6a30',0.4,true);lmGardenFlower(g,hx+3.6,hy-4,1.5,'#a890c0','#8a6a30',1.4,true);
    /* пряди чёрных волос из разлома */
    g.strokeStyle='#120a14';g.lineWidth=0.55;g.lineCap='round';for(let i=0;i<3;i++){g.beginPath();g.moveTo(hx-0.6+i*0.9,hy-3.6);g.quadraticCurveTo(hx-3.4+i*2.4+Math.sin(t*2+i)*0.8,hy-0.6,hx-4.4+i*3+Math.sin(t*2.4+i)*1,hy+6);g.stroke();}
  }
  g.restore();
  /* ----- ножницы ----- */
  g.save();g.translate(P.px,P.py);g.rotate(P.ax);lmGardenShears(g,P.op,T,0);g.restore();
  /* ----- ближняя рука: плечо-ком, предплечье, кисть на рукоятке ----- */
  const h1=hand(-5.4,0.7);
  g.beginPath();g.ellipse(2.4,-30.4,2.5,2.4,0,0,TAU);mobPath(g,T?'#b4c0d8':'#dcefff',1.6,-31.2,2.6);
  const nc=T?'#aab6cc':'#cfe6ff';
  const na=lmGardenArm(g,2.6,-30,h1[0],h1[1],8.6,8.6,true,2.8,nc,T?'#2a3048':'#5a70b8');
  if(!T){g.beginPath();g.ellipse(h1[0],h1[1],1.9,1.7,0.3,0,TAU);mobPath(g,'#e4f2ff',h1[0]-0.4,h1[1]-0.4,2);g.strokeStyle='rgba(60,80,170,.7)';g.lineWidth=0.4;for(let q=0;q<3;q++){g.beginPath();g.moveTo(h1[0]+0.4+q*0.5,h1[1]-1.4);g.lineTo(h1[0]+1.1+q*0.5,h1[1]+1.2);g.stroke();}}
  else{/* длинные суставчатые пальцы-паучьи, обхватывают рукоять */
    for(let q=0;q<4;q++){const a0=P.ax-1.2+q*0.5+Math.sin(t*4.3+q*1.3+m.phase)*0.1+lmTwitch(t,m.phase+q*0.2,1.1)*0.25,bx=h1[0]+Math.cos(a0)*0.4,by=h1[1]+Math.sin(a0)*0.4,k1x=bx+Math.cos(a0+0.5)*2.4,k1y=by+Math.sin(a0+0.5)*2.4,k2x=k1x+Math.cos(a0+1.6)*2.2,k2y=k1y+Math.sin(a0+1.6)*2.2;
      g.strokeStyle='#2a3048';g.lineWidth=1.1;g.lineCap='round';g.lineJoin='round';g.beginPath();g.moveTo(bx,by);g.lineTo(k1x,k1y);g.lineTo(k2x,k2y);g.stroke();
      g.strokeStyle='#b4c0d8';g.lineWidth=0.55;g.beginPath();g.moveTo(bx,by);g.lineTo(k1x,k1y);g.lineTo(k2x,k2y);g.stroke();}
    g.beginPath();g.ellipse(h1[0],h1[1],1.7,1.5,0.3,0,TAU);mobPath(g,'#b4c0d8',h1[0]-0.4,h1[1]-0.4,2);}
  /* ----- грудь Истины: пролом с глазом ----- */
  if(T){
    const cx=1,cy=-26.4,wide=1+open*0.4;
    const ho=[[cx-3.2,cy-1],[cx-2,cy-3.8],[cx+0.2,cy-4.8],[cx+2.4,cy-3.6],[cx+3.8,cy-0.6],[cx+3,cy+2.8],[cx+0.6,cy+4.2],[cx-2,cy+3],];
    g.fillStyle='#0a040c';lmGardenPoly(g,ho);g.fill();g.strokeStyle='#5a6482';g.lineWidth=0.6;g.lineJoin='round';g.stroke();
    /* зубцы разлома внутрь */
    g.fillStyle='#c4cee4';for(const [x0,y0,x1,y1,x2,y2] of [[cx-3.2,cy-1,cx-1,cy-0.2,cx-3,cy+1.4],[cx+3.8,cy-0.6,cx+1.8,cy+0.2,cx+3.4,cy+1.8],[cx+0.2,cy-4.8,cx+0.4,cy-2.6,cx+1.6,cy-4.4],[cx+0.6,cy+4.2,cx+0.6,cy+2.4,cx-0.8,cy+3.8]]){g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.lineTo(x2,y2);g.closePath();g.fill();}
    mobGlow(g,cx,cy,9,'#ff2a3a',0.35+open*0.4);
    /* глаз: яблоко в красных жилках, радужка, щелевой зрачок */
    const bl=(Math.sin(m.anim*0.9+m.phase*5)>0.975&&!rec)?0.15:1,er=2.1*wide,lx=(m.lookX||0)*1.1,ly=(m.lookY||0)*0.9;
    const wg=g.createRadialGradient(cx-0.6,cy-0.8,0.2,cx,cy,er*1.1);wg.addColorStop(0,'#fff8f0');wg.addColorStop(0.7,'#f0d8d0');wg.addColorStop(1,'#c89890');
    g.fillStyle=wg;g.beginPath();g.ellipse(cx,cy,er*1.15,er*bl,0,0,TAU);g.fill();
    if(bl>0.5){g.strokeStyle='rgba(190,20,40,.8)';g.lineWidth=0.35;for(let i=0;i<5;i++){const a=i/5*TAU+0.5;g.beginPath();g.moveTo(cx+Math.cos(a)*er*1.1,cy+Math.sin(a)*er*0.95);g.quadraticCurveTo(cx+Math.cos(a+0.3)*er*0.75,cy+Math.sin(a+0.3)*er*0.7,cx+Math.cos(a)*er*0.5+lx*0.4,cy+Math.sin(a)*er*0.5+ly*0.4);g.stroke();}
      const ig=g.createRadialGradient(cx+lx,cy+ly,0.2,cx+lx,cy+ly,er*0.7);ig.addColorStop(0,'#ff7a7a');ig.addColorStop(0.6,'#b01426');ig.addColorStop(1,'#4a0610');g.fillStyle=ig;g.beginPath();g.arc(cx+lx,cy+ly,er*0.62,0,TAU);g.fill();
      g.fillStyle='#050205';g.beginPath();g.ellipse(cx+lx,cy+ly,er*0.14,er*0.5,0,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.85)';g.beginPath();g.arc(cx+lx-0.7,cy+ly-0.8,0.5,0,TAU);g.fill();}
    g.strokeStyle='#4a0610';g.lineWidth=0.5;g.beginPath();g.ellipse(cx,cy,er*1.15,er*bl,0,Math.PI*1.05,Math.PI*1.95);g.stroke();
  }
  if(T){/* щупальца тьмы тянутся из пролома */
    const cx=1,cy=-26.4;g.lineCap='round';
    for(let i=0;i<4;i++){const a=[-2.6,-0.5,0.6,2.2][i],L=[6,5,6.5,5.4][i],sw=Math.sin(t*2.2+i*1.7)*1.2+open*Math.sin(t*9+i)*0.8,ex=cx+Math.cos(a)*(L+open*2),ey=cy+Math.sin(a)*(L+open*2);
      g.strokeStyle='#0a0408';g.lineWidth=1.3;g.beginPath();g.moveTo(cx+Math.cos(a)*3,cy+Math.sin(a)*3);g.quadraticCurveTo(cx+Math.cos(a)*L*0.6-Math.sin(a)*sw,cy+Math.sin(a)*L*0.6+Math.cos(a)*sw,ex,ey);g.stroke();
      g.strokeStyle='#5a1022';g.lineWidth=0.45;g.stroke();g.fillStyle='#ff4a58';g.beginPath();g.arc(ex,ey,0.45,0,TAU);g.fill();}}
  g.restore();                 /* наклон */
  g.restore();                 /* масштаб и парение */
  /* ----- передние кристаллы и цветы у подола ----- */
  [[-7,1.9,6.5,-0.9],[-1.6,2.5,8,0.2],[6.4,2,6,0.8]].forEach(([x,w,h,l],i)=>lmGardenRock(g,x,w,h,-3,T?'#8a96b4':'#d0e4ff',l+Math.sin(gp*2+i*2.1+1)*0.2*mk+Math.sin(t*1.4+i*1.9+m.phase)*0.04,FR));
  if(!T){for(const [x,y,r,pc,rot] of [[-9,-4.6,1.8,'#ffb8e0',0.4],[-4.4,-3.2,1.5,'#e8d0ff',1.2],[7.6,-4.2,1.7,'#ffb8e0',0.8]])lmGardenFlower(g,x,y,r,pc,'#ffe080',rot);}
  else{for(const [x,y,r,pc,rot] of [[-9.4,-3.6,1.6,'#a890c0',0.4],[7.8,-3.4,1.5,'#a890c0',0.8]])lmGardenFlower(g,x,y,r,pc,'#8a6a30',rot,true);
    /* лепестки падают с венка */
    for(let i=0;i<3;i++){const f=((t*0.5+i/3+m.phase)%1);g.save();g.globalAlpha=Math.sin(f*Math.PI)*0.9;g.translate(-5+i*3+Math.sin(f*6+i)*2,-33+f*28);g.rotate(f*5+i);g.fillStyle='#a890c0';g.beginPath();g.ellipse(0,0,1,0.55,0,0,TAU);g.fill();g.restore();}}
  g.restore();                 /* FY */
  /* свет */
  lmRim(g,q=>{q.save();q.translate(0,FY);q.translate(0,glide);q.scale(0.93*(1-0.006*brt),0.93*(1+0.016*brt));q.rotate(P.lean+rock+fwd);q.lineCap='round';
    q.strokeStyle=T?'rgba(200,215,255,.3)':'rgba(240,250,255,.55)';q.lineWidth=0.8;q.beginPath();q.moveTo(-8.6,-14);q.lineTo(-4.6,-22.6);q.moveTo(-5.8,-30.2);q.lineTo(-1.4,-32);q.stroke();
    q.save();q.translate(lmGardenHx0(),-33.6);q.rotate(hr);q.translate(-lmGardenHx0(),33.6-brt*0.25);q.beginPath();q.ellipse(lmGardenHx0(),-38,3.8,4.7,0.08,Math.PI*1.05,Math.PI*1.55);q.stroke();q.restore();q.restore();
    if(!T){for(const [x,y,r,o] of [[-12,FY-24,1.3,0],[12,FY-32,1.1,1.6],[-8,FY-38,0.9,3],[11,FY-14,0.8,4.4]]){const a=0.5+0.5*Math.sin(t*3+o*2+m.phase);lmGardenSpark(q,x,y,r*(0.6+a*0.8),'#fff',0.4+a*0.5);}}});
  mobGlow(g,0,FY-20,16,T?'#a070ff':'#a8d8ff',(T?0.16:0.26)+open*0.3);
  if(rec&&sT<0.14){lmRim(g,q=>{q.save();q.translate(0,FY);const f=sT/0.14;lmGardenSpark(q,17,-14,6*(1-f)+1,'#fff',1-f);q.restore();});}
  if(T)for(let i=0;i<2;i++){/* кровь капает с лезвий */const f=((t*0.9+i*0.5)%1);if(P.op<0.4){g.fillStyle='rgba(150,10,26,'+(1-f*0.5)+')';const cx0=P.px*0.93+Math.cos(P.ax)*13*0.93,cy0=FY+(P.py+Math.sin(P.ax)*13)*0.93+glide;g.beginPath();g.ellipse(cx0+i*0.8,cy0+f*14+1,0.55,0.9,0,0,TAU);g.fill();}}
};
function lmGardenHx0(){return 0.8;}

/* ============================================================
   Звонница
   ============================================================ */
/* лента: хвост с волной и ласточкиным вырезом; dir — в какую сторону от узла */
function lmGardenRibbon(g,x0,y0,len,dir,t,ph,col,w0,ragged,sp,lag){
  sp=sp==null?9.6:sp;lag=lag||0;
  const n=12,L=[],R=[];
  for(let i=0;i<=n;i++){
    const u=i/n,cx=x0+dir*(2+sp*Math.sin(u*1.35))+Math.sin(t*2.4-u*3.2+ph)*1.7*u+lag*u*u,cy=y0+len*u+Math.cos(t*2-u*2+ph)*0.6*u;
    const w=w0*(1-0.45*u)*0.5;L.push([cx-w,cy]);R.push([cx+w,cy]);
  }
  g.beginPath();g.moveTo(L[0][0],L[0][1]);for(let i=1;i<=n;i++)g.lineTo(L[i][0],L[i][1]);
  const e=R[n],l=L[n];g.lineTo((e[0]+l[0])/2,l[1]-(ragged?2.2:2.6));
  for(let i=n;i>=0;i--)g.lineTo(R[i][0],R[i][1]);g.closePath();
  g.fillStyle=mobG(g,x0+dir*4,y0+len*0.4,len*0.6,col);g.fill();g.strokeStyle=shadeHex(col,-0.5);g.lineWidth=0.5;g.lineJoin='round';g.stroke();
  g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=0.4;g.beginPath();g.moveTo(L[0][0]+0.4,L[0][1]);for(let i=1;i<n;i++)g.lineTo(L[i][0]+0.3,L[i][1]);g.stroke();
}
/* стеклянная трубка с колпачками, бликом и радужной полосой */
function lmGardenTube(g,x,y0,len,w,ang,far,hue,ring,t){
  g.save();g.translate(x,y0);g.rotate(ang);
  g.strokeStyle=far?'rgba(150,150,210,.7)':'rgba(235,235,255,.85)';g.lineWidth=0.4;g.beginPath();g.moveTo(-w*0.35,-1.6);g.lineTo(-w*0.35,1.4);g.moveTo(w*0.35,-1.6);g.lineTo(w*0.35,1.4);g.stroke();
  const x0=-w/2,y1=1.4,y2=1.4+len;
  const gr=g.createLinearGradient(x0,0,w/2,0);
  if(far){gr.addColorStop(0,'#9ab4e8');gr.addColorStop(0.5,'#6a86c8');gr.addColorStop(1,'#46609c');}
  else{gr.addColorStop(0,'#f8fdff');gr.addColorStop(0.32,'#c4e0ff');gr.addColorStop(0.72,'#8aa8e8');gr.addColorStop(1,'#6a80c8');}
  g.fillStyle=gr;g.beginPath();g.rect(x0,y1,w,len);g.fill();
  g.strokeStyle=far?'#2c3a78':'#4a5ea8';g.lineWidth=0.5;g.strokeRect(x0,y1,w,len);
  /* радужная полоса и блики */
  g.fillStyle=hue;g.globalAlpha=far?0.3:0.5;g.fillRect(w*0.12,y1+1.2,w*0.22,len*0.6);g.globalAlpha=1;
  g.fillStyle='rgba(255,255,255,'+(far?0.35:0.85)+')';g.fillRect(x0+w*0.16,y1+1,w*0.2,len-2.4);
  g.fillStyle='rgba(255,255,255,.5)';g.fillRect(x0+w*0.16,y2-1.8,w*0.5,0.4);
  /* колпачки */
  for(const [yy,hh] of [[y1-0.4,1.3],[y2-0.9,1.3]]){const cg=g.createLinearGradient(x0,0,w/2,0);cg.addColorStop(0,far?'#9a80c8':'#f0e0ff');cg.addColorStop(1,far?'#5a4488':'#a888e0');g.fillStyle=cg;g.fillRect(x0-0.3,yy,w+0.6,hh);g.strokeStyle=far?'#2c1a58':'#6a48a8';g.lineWidth=0.4;g.strokeRect(x0-0.3,yy,w+0.6,hh);}
  g.fillStyle=far?'#3a2c6a':'#c4aae8';g.beginPath();g.ellipse(0,y2+0.3,w*0.4,0.55,0,0,TAU);g.fill();
  g.restore();
}

LM_MODEL.lchime=function(g,m,FY,t,T,st,k,wv,ph){
  const ring=st==='ring'?k:0,mk=m.mk||0,fwd=clamp((m.vx||0)*(m.facing||1)/Math.max(1,m.def.spd),-1,1)*mk,vz=clamp((m.vy||0)/200,-1,1);
  /* висит на подвесе: маятник качается сам, на ходу отстаёт от движения, звякает редким жестом; парит вверх-вниз и дышит */
  const tk=lmFidget(t,m.phase,3.6),tkj=tk*Math.sin(t*34),brt=lmBreath(t,m.phase,2.1);
  const sw=Math.sin(t*1.6+m.phase)*0.1+Math.sin(t*2.3+m.phase*2)*0.04+ring*Math.sin(t*38)*0.1+fwd*0.2+tkj*0.05,fl=Math.sin(t*1.9+m.phase)*1.3+lmBob(m,22,0.8)-vz*0.8;
  const rl=-fwd*5+Math.sin(t*1.6+m.phase+1.2)*1.2;   /* отставание лент и подвесок */
  g.save();g.translate(0,fl);g.translate(0,-23);g.rotate(sw*0.5+fwd*0.05);g.scale(1-0.01*brt,1+0.02*brt);g.translate(0,23);
  if(!T){
    const hues=['#ffb8e0','#b8e0ff','#e0c8ff','#b8ffe8','#ffe0b0'];
    /* ленты (позади), дальняя темнее */
    lmGardenRibbon(g,-0.6,-14.4,27,-1,t,1.9,'#a888e0',4,false,null,rl*1.3);
    /* дальний ряд трубок */
    [[-5.2,10,0.4],[-1.8,14,1.7],[1.8,11,2.6],[5.4,13,3.8]].forEach(([x,l,o],i)=>lmGardenTube(g,x,-8.6,l,2.8,Math.sin(t*2.1+o)*0.07+Math.sin(t*3.3+o*2)*0.03+tkj*0.1+ring*Math.sin(t*44+o)*0.1,true,hues[(i+2)%5],ring,t));
    /* диск: перламутровая крышка с жемчужинами */
    g.beginPath();g.ellipse(0,-8.1,10.4,2.9,0,0,TAU);mobPath(g,'#a890d8',0,-8,10,true);g.strokeStyle='#6a4cb0';g.lineWidth=0.6;g.stroke();
    g.beginPath();g.ellipse(0,-9.4,10.4,2.9,0,0,TAU);mobPath(g,'#efe6ff',-3,-10.4,10.4,true);g.strokeStyle='#8a6cd0';g.lineWidth=0.6;g.stroke();
    g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=0.5;g.beginPath();g.ellipse(0,-9.4,8.4,2,0,Math.PI*1.05,Math.PI*1.7);g.stroke();
    g.strokeStyle='rgba(160,130,210,.55)';g.lineWidth=0.35;g.beginPath();g.ellipse(0,-9.4,6.2,1.4,0,0.1,Math.PI-0.1);g.stroke();
    for(let i=0;i<6;i++){const a=0.15*Math.PI+i*0.14*Math.PI,x=Math.cos(a)*9.6,y=-8.6+Math.sin(a)*2.5;lmGardenBead(g,x,y,1.1,'#ffd0ec','#b05a9a');mobShine(g,x-0.3,y-0.3,0.35,0.25,0.9);}
    /* ближний ряд трубок */
    [[-8,12,0.2],[-4.1,17,1.2],[0,12,2.2],[4.1,19,3.1],[8,14,4.2]].forEach(([x,l,o],i)=>lmGardenTube(g,x,-6.4,l,3.3,Math.sin(t*2.1+o)*0.08+Math.sin(t*3.1+o*2.3)*0.035+tkj*0.12+ring*Math.sin(t*44+o)*0.12,false,hues[i%5],ring,t));
    /* язычок-жемчужина и подвеска-лепесток */
    {const a=Math.sin(t*2.6)*0.14+Math.sin(t*3.7+1)*0.05+tkj*0.22+ring*Math.sin(t*50)*0.25;g.save();g.translate(0,-6);g.rotate(a);
      g.strokeStyle='rgba(235,235,255,.9)';g.lineWidth=0.4;g.beginPath();g.moveTo(0,1.4);g.lineTo(0,10);g.stroke();
      lmGardenBead(g,0,10.4,1.9,'#fff4ff','#9a7ad0');mobShine(g,-0.6,9.7,0.7,0.5,0.9);
      g.strokeStyle='rgba(200,180,240,.9)';g.lineWidth=0.4;g.beginPath();g.moveTo(0,12.3);g.lineTo(0,14.2);g.stroke();
      lmGardenKite(g,0,13.6,0.6,23.2,5.2,'#e0c8ff',0.42,'rgba(110,70,180,.85)','rgba(255,200,240,.4)');
      g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=0.3;g.beginPath();g.moveTo(0.1,15);g.lineTo(0.5,21.6);g.stroke();g.restore();}
    lmGardenRibbon(g,0.6,-14.6,25,1,t,0.6,'#d0b2fa',4.2,false,null,rl);
    /* бант сверху */
    g.save();g.translate(0,-14.6);g.scale(0.86*(1+Math.sin(t*2.2+m.phase)*0.025),0.86*(1-Math.sin(t*2.2+m.phase)*0.03));g.rotate(rl*0.012);g.translate(0,14.6);
    for(const sd of [-1,1]){g.beginPath();g.moveTo(0,-15.6);g.bezierCurveTo(sd*3,-23.6,sd*10.6,-24,sd*10,-18.4);g.bezierCurveTo(sd*9.6,-13.2,sd*4,-13.6,0,-14.8);g.closePath();mobPath(g,sd<0?'#d2b4fa':'#c4a2f6',sd*5,-19,7);
      g.save();g.clip();g.fillStyle='rgba(110,70,190,.28)';g.beginPath();g.ellipse(sd*6.4,-15.4,5,2.6,sd*0.3,0,TAU);g.fill();
      g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=0.45;g.beginPath();g.moveTo(sd*2,-21);g.quadraticCurveTo(sd*7,-23,sd*9.4,-19.4);g.stroke();
      g.strokeStyle='rgba(110,70,190,.5)';g.lineWidth=0.4;g.beginPath();g.moveTo(sd*2.4,-15.6);g.quadraticCurveTo(sd*6.6,-19.4,sd*9,-17.6);g.stroke();g.restore();}
    g.beginPath();g.ellipse(0,-15.2,2.3,2.1,0,0,TAU);mobPath(g,'#b89aee',-0.6,-16,2.3);lmGardenBead(g,0.2,-15.4,0.95,'#fff0fa','#b05a9a');
    /* хвостики банта на диск */
    g.strokeStyle='#7a5cc0';g.lineWidth=1.5;g.beginPath();g.ellipse(0,-20.2,1.7,2.6,0,0,TAU);g.stroke();g.strokeStyle='#f4ecff';g.lineWidth=0.8;g.stroke();
    g.restore();
    /* свет, искры, звон */
    mobGlow(g,0,0,22+ring*8,'#d8c8ff',0.28+ring*0.5);
    const sk=[[-12,-4,1.2,0],[12.4,6,1.4,1.7],[-9.6,15,1,3.1],[10,-16,1.1,4.4],[2,20,0.9,5.3],[-13.5,-14,0.9,2.4]];
    lmRim(g,q=>{for(const [x,y,r,o] of sk){const a=0.5+0.5*Math.sin(t*3+o*2+m.phase);lmGardenSpark(q,x,y,r*(0.6+a*0.9),'#ffffff',0.4+a*0.55);}
      for(let i=0;i<5;i++){const a=0.5+0.5*Math.sin(t*5+i*1.9);lmGardenSpark(q,-8+i*4.1,-7.6+(i%2?13:9)*0.9+ring*2,0.8+ring*1.2,'#fff',0.2+0.5*a*(0.4+ring));}
      if(ring>0.05){q.lineCap='round';for(let i=0;i<3;i++){const f=(t*1.6+i/3)%1;q.strokeStyle='rgba(220,200,255,'+((1-f)*0.8*ring).toFixed(2)+')';q.lineWidth=1;q.beginPath();q.ellipse(0,4,6+f*17,5+f*14,0,0,TAU);q.stroke();}}});
  }else{
    const BN='#e2d6ba',BD='#9c8a6a;'.slice(0,7),ln='#1a1210';
    const tw=lmTwitch(t,m.phase,0.8);
    const vib=(o)=>Math.sin(t*1.7+o)*0.06+Math.sin(t*2.9+o*2)*0.03+tkj*0.11+tw*(0.12+0.05*Math.sin(o*5))+ring*Math.sin(t*44+o)*0.12;
    /* верёвки подвеса: V от узла к концам перекладины */
    for(const [x1,y1] of [[-11,-13],[11,-13]]){g.strokeStyle=ln;g.lineWidth=1.4;g.lineCap='round';g.beginPath();g.moveTo(0,-22);g.lineTo(x1,y1);g.stroke();g.strokeStyle='#7a6448';g.lineWidth=0.8;g.stroke();g.strokeStyle='#b09470';g.lineWidth=0.3;g.beginPath();g.moveTo(-0.3,-22);g.lineTo(x1-0.3,y1);g.stroke();}
    /* обрывки лилового банта на узле — след прежнего облика: грязные рваные ленты */
    lmGardenRibbon(g,-0.4,-21.6,6.5,-1,t,0.5,'#6e4e8e',1.7,true,1.2,rl*0.6);lmGardenRibbon(g,0.4,-21.6,8,1,t,2,'#7e5e9e',1.8,true,1.4,rl*0.6);
    g.fillStyle='rgba(100,8,22,.7)';g.beginPath();g.ellipse(-3.6,-17.2,1,0.7,0.5,0,TAU);g.fill();
    mobBlob(g,0,-22.2,1.9,1.7,'#5a4a36');mobBlob(g,0.3,-22.5,0.7,0.6,'#8a7458',0,true);
    /* кости-колокольчики: дальний ряд темнее */
    const femur=(x,y0,len,w,col,o,crack,stain)=>{g.save();g.translate(x,y0);g.rotate(vib(o));
      g.strokeStyle=ln;g.lineWidth=0.5;g.beginPath();g.moveTo(0,-3.4);g.lineTo(0,0.8);g.stroke();g.strokeStyle='#7a6448';g.lineWidth=0.35;g.stroke();
      lmGardenBone(g,0,1.4,0,len-1.2,w,col,0);
      for(const yy of [1.2,len-0.9])for(const sx of [-1,1])mobBlob(g,sx*w*0.46,yy,w*0.64,w*0.58,col,0,true);
      g.strokeStyle=shadeHex(col,-0.55);g.lineWidth=0.4;for(const yy of [0.5,len-0.2]){g.beginPath();g.arc(0,yy+0.2,w*0.9,yy<2?Math.PI*1.1:0.1,yy<2?Math.PI*1.9:Math.PI-0.1);g.stroke();}
      if(crack){g.strokeStyle='rgba(30,16,10,.8)';g.lineWidth=0.4;g.beginPath();g.moveTo(-w*0.3,len*0.35);g.lineTo(w*0.2,len*0.45);g.lineTo(-w*0.1,len*0.58);g.stroke();}
      if(stain){g.fillStyle='rgba(120,10,26,.75)';g.beginPath();g.moveTo(-w*0.5,len*0.55);g.lineTo(w*0.5,len*0.5);g.lineTo(w*0.3,len*0.75);g.lineTo(-w*0.2,len*0.72);g.closePath();g.fill();}
      g.restore();};
    femur(-3.4,-12,15.5,2,shadeHex(BN,-0.42),0.5,true,false);femur(3.8,-12,9,2.1,shadeHex(BN,-0.42),1.7,false,true);
    /* перекладина-бедренная кость с вязкой бечёвки */
    lmGardenBone(g,-10.8,-12.6,10.8,-12.6,2.5,BN,0);
    for(const sx of [-1,1])for(const dy of [-0.8,0.8])mobBlob(g,sx*11.2,-12.6+dy*1.1,1.5,1.4,BN,0,true);
    g.strokeStyle=shadeHex(BN,-0.55);g.lineWidth=0.4;for(const sx of [-1,1]){g.beginPath();g.arc(sx*10.4,-12.6,1.9,sx<0?Math.PI*0.6:-Math.PI*0.4,sx<0?Math.PI*1.4:Math.PI*0.4);g.stroke();}
    g.strokeStyle='rgba(30,16,10,.7)';g.lineWidth=0.4;g.beginPath();g.moveTo(-6,-13.4);g.lineTo(-4.4,-12.6);g.lineTo(-5.6,-11.8);g.moveTo(5,-13.6);g.lineTo(6.6,-12.8);g.stroke();
    g.fillStyle='rgba(120,10,26,.7)';g.beginPath();g.moveTo(1,-13.6);g.lineTo(3.4,-13.4);g.lineTo(2.6,-11.8);g.lineTo(0.6,-12);g.closePath();g.fill();
    for(const x of [-8.4,-0.6,8.2,-5.8,5.6]){g.strokeStyle=ln;g.lineWidth=1.5;g.beginPath();g.moveTo(x,-14.4);g.lineTo(x+0.8,-10.8);g.stroke();g.strokeStyle='#7a6448';g.lineWidth=0.9;g.stroke();}
    /* ближний ряд костей */
    femur(-6.4,-11.4,8.5,2.1,BN,0.2,false,true);femur(6.4,-11.4,13.5,2.2,BN,2.2,true,false);
    /* цепочка позвонков держит центральную куклу */
    {g.save();g.translate(0,-11.2);g.rotate(vib(0.9));for(let i=0;i<4;i++){const y=i*2.3+0.6;mobBlob(g,0,y,1.3,1.05,BN);g.strokeStyle='rgba(30,16,10,.6)';g.lineWidth=0.35;g.beginPath();g.moveTo(-1.1,y);g.lineTo(1.1,y);g.stroke();}g.restore();}
    /* куклы: слева, справа и по центру */
    lmGardenDoll(g,-10.2,-1.8,0.58,0.16+vib(1)*2+Math.sin(t*1.5)*0.09+rl*0.02+lmTwitch(t,m.phase+0.2,0.7)*0.18,t,ring,0,m);
    lmGardenDoll(g,10,0.4,0.54,-0.2+vib(2)*2+Math.sin(t*1.7+1)*0.1+rl*0.02+lmTwitch(t,m.phase+0.6,0.6)*0.18,t,ring,1,m);
    lmGardenDoll(g,0.2,-0.2,0.66,vib(0.9)*1.5+Math.sin(t*1.3+2)*0.08+rl*0.015+lmTwitch(t,m.phase+0.9,0.9)*0.16,t,ring,2,m);
    mobGlow(g,0,2,18+ring*8,'#7a3a8a',0.14+ring*0.3);
    if(ring>0.05)lmRim(g,q=>{q.lineCap='round';for(let i=0;i<3;i++){const f=(t*1.6+i/3)%1;q.strokeStyle='rgba(255,90,100,'+((1-f)*0.7*ring).toFixed(2)+')';q.lineWidth=1;q.beginPath();q.ellipse(0,4,6+f*17,5+f*14,0,0,TAU);q.stroke();}});
  }
  g.restore();
};
/* тряпичная кукла: мешковина, пуговицы-глаза, стежки на рту; на звоне рот раздирается */
function lmGardenDoll(g,x,y,sc,rot,t,ring,seed,m){
  g.save();g.translate(x,y);g.rotate(rot+ring*Math.sin(t*40+seed*2)*0.1);g.scale(sc,sc);
  const sk='#bfa67e',sl='#dccaa0',sd='#6e5a3c',ln='#241810';
  const lx=(m.lookX||0)*0.5,ly=(m.lookY||0)*0.4;
  /* нить */
  g.strokeStyle='#241810';g.lineWidth=0.9;g.beginPath();g.moveTo(0,-9);g.lineTo(0,0.4);g.stroke();g.strokeStyle='#8a7050';g.lineWidth=0.4;g.stroke();
  /* ноги: обвисшие, бахрома внизу */
  for(const sd2 of [-1,1]){g.save();g.translate(sd2*1.7,15.4);g.rotate(sd2*0.1+Math.sin(t*2.2+seed+sd2)*0.1);g.beginPath();g.moveTo(-1.5,0);g.lineTo(-1.5,7.4);g.lineTo(-0.8,6.6);g.lineTo(-0.2,8);g.lineTo(0.6,6.8);g.lineTo(1.5,7.6);g.lineTo(1.5,0);g.closePath();mobPath(g,sd2<0?shadeHex(sk,-0.18):sk,0,4,4);g.restore();}
  /* руки: свисают, одна оборвана на локте */
  for(const sd2 of [-1,1]){g.save();g.translate(sd2*3.2,9.6);g.rotate(-sd2*0.12+Math.sin(t*2.6+seed*2+sd2)*0.12);const L=sd2<0&&seed!==1?4.6:7.2;g.beginPath();g.moveTo(-1.1,0);g.lineTo(-1.1,L);g.lineTo(-0.4,L-0.8);g.lineTo(0.3,L+0.4);g.lineTo(1.1,L-0.4);g.lineTo(1.1,0);g.closePath();mobPath(g,sd2<0?shadeHex(sk,-0.2):sk,0,L*0.5,4);
    if(L<6){g.strokeStyle='#e8e0d0';g.lineWidth=0.5;g.beginPath();g.moveTo(-0.6,L-0.4);g.lineTo(-1,L+1.4);g.moveTo(0.4,L-0.2);g.lineTo(0.8,L+1.6);g.stroke();}g.restore();}
  /* туловище: мешок с заплатой и швом */
  g.beginPath();g.moveTo(-3,8.6);g.quadraticCurveTo(-4.6,13,-3.6,17);g.lineTo(3.6,17);g.quadraticCurveTo(4.6,13,3,8.6);g.closePath();mobPath(g,sk,-1,12,6);
  g.save();g.clip();g.fillStyle='rgba(60,30,10,.25)';g.beginPath();g.ellipse(3,13,2.4,5,0,0,TAU);g.fill();g.fillStyle='rgba(110,8,22,.6)';g.beginPath();g.moveTo(-1,15);g.lineTo(2.6,14.4);g.lineTo(3.4,17);g.lineTo(-1.6,17);g.closePath();g.fill();g.restore();
  g.fillStyle=sl;g.fillRect(-2.4,10.6,3.2,3.2);g.strokeStyle=ln;g.lineWidth=0.35;g.strokeRect(-2.4,10.6,3.2,3.2);for(const [a,b,c,d] of [[-2.2,10.8,0.6,13.6],[0.6,10.8,-2.2,13.6]]){g.beginPath();g.moveTo(a,b);g.lineTo(c,d);g.stroke();}
  g.strokeStyle=ln;g.lineWidth=0.4;g.beginPath();g.moveTo(0.6,8.6);g.lineTo(0.8,17);g.stroke();for(let i=0;i<4;i++){g.beginPath();g.moveTo(0.1,9.6+i*1.9);g.lineTo(1.3,9.9+i*1.9);g.stroke();}
  /* вата из разрыва на плече */
  g.fillStyle='#f0ead8';for(const [a,b,r] of [[-3.4,8.6,1.1],[-4.4,9.4,0.9],[-3.2,9.8,0.8]]){g.beginPath();g.arc(a,b,r,0,TAU);g.fill();}
  /* голова с наклоном: шея сломана */
  g.save();g.translate(0,8.4);g.rotate(0.3*(seed%2?-1:1)+Math.sin(t*1.8+seed)*0.05);g.translate(0,-8.4);
  g.beginPath();g.arc(0,4.4,4.6,0,TAU);mobPath(g,sk,-1.4,2.6,4.8);
  g.save();g.clip();g.fillStyle='rgba(60,30,10,.28)';g.beginPath();g.ellipse(3,5,2.4,5,0,0,TAU);g.fill();g.fillStyle=sl;g.beginPath();g.ellipse(-2.2,2,2.2,1.6,-0.5,0,TAU);g.fill();g.restore();
  g.strokeStyle=ln;g.lineWidth=0.4;g.beginPath();g.moveTo(-0.6,0);g.lineTo(0.2,1.4);g.lineTo(-0.4,2.8);g.stroke();for(let i=0;i<3;i++){g.beginPath();g.moveTo(-1.4,0.4+i*1.1);g.lineTo(0.5,0.8+i*1.1);g.stroke();}
  /* пуговицы-глаза: правая оторвана и висит на нитке; на звоне глаза горят */
  const ex=[-1.9,1.9],ey=3.6;
  for(let q=0;q<2;q++){const dang=q===1&&seed!==2||(q===0&&seed===2);const bx=ex[q],by=dang?ey+3.6+Math.sin(t*3+seed)*0.4:ey;
    if(dang){g.strokeStyle=ln;g.lineWidth=0.35;g.beginPath();g.moveTo(bx,ey);g.lineTo(bx+0.2,by);g.stroke();g.fillStyle='#120a08';g.beginPath();g.ellipse(bx,ey,1.2,1.2,0,0,TAU);g.fill();}
    g.fillStyle='#0c0608';g.beginPath();g.arc(bx,by,1.25,0,TAU);g.fill();
    if(ring>0.1){mobGlow(g,bx,by,3.4,'#ff2a3a',0.7*ring);g.fillStyle='#ff5a64';g.beginPath();g.arc(bx+lx*0.4,by,0.6,0,TAU);g.fill();}
    else{g.fillStyle='#3a2a2a';g.beginPath();g.arc(bx+lx*0.3,by+ly*0.3,0.8,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.8)';g.beginPath();g.arc(bx-0.4,by-0.4,0.32,0,TAU);g.fill();g.strokeStyle='#8a7a6a';g.lineWidth=0.25;g.beginPath();g.moveTo(bx-0.6,by);g.lineTo(bx+0.6,by);g.moveTo(bx,by-0.6);g.lineTo(bx,by+0.6);g.stroke();}}
  /* рот: стежки X; на звоне швы лопаются, чёрная пасть с иглами */
  if(ring<0.25){g.strokeStyle=ln;g.lineWidth=0.5;g.lineCap='round';g.beginPath();g.moveTo(-2.6,6.6);g.lineTo(2.6,6.6+(seed%2?0.4:-0.4));g.stroke();for(let i=0;i<5;i++){const xx=-2.2+i*1.1;g.beginPath();g.moveTo(xx,5.6);g.lineTo(xx+0.5,7.7);g.stroke();}}
  else{const o=ring;g.fillStyle='#07030a';g.beginPath();g.ellipse(0,6.8,2.8,1+o*2.2,0,0,TAU);g.fill();lmTeeth(g,-2.4,5.9,2.4,5,1.1,'#fff2e2');lmTeeth(g,-2.2,7.8+o*1.4,2.2,4,1,'#fff2e2',false);g.strokeStyle=ln;g.lineWidth=0.4;g.beginPath();g.moveTo(-3,6.4);g.lineTo(-2.4,7.6);g.moveTo(3,6.4);g.lineTo(2.4,7.6);g.stroke();}
  g.restore();
  g.restore();
}
