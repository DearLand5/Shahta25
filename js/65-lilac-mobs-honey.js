'use strict';
/* ============================================================
   Модели мобов Медовых сот (Лиловые небеса): пчела-нянька, медовый слизень, восковой страж.
   Оба облика в одной функции, T — Истина; общие помощники — в 54
   ============================================================ */
function lmHoneyPoly(g,p){g.beginPath();g.moveTo(p[0][0],p[0][1]);for(let i=1;i<p.length;i++)g.lineTo(p[i][0],p[i][1]);g.closePath();}
/* капля: остриё вверх, круглое брюшко внизу */
function lmHoneyDrop(g,x,y,r,col,noLine){g.beginPath();g.moveTo(x,y-r*1.8);g.bezierCurveTo(x+r*0.3,y-r*0.9,x+r,y-r*0.4,x+r,y+r*0.2);g.arc(x,y+r*0.2,r,0,Math.PI);g.bezierCurveTo(x-r,y-r*0.4,x-r*0.3,y-r*0.9,x,y-r*1.8);g.closePath();mobPath(g,col,x,y,r*1.4,noLine);}
/* шов крестиками */
function lmHoneyStitch(g,x0,y0,x1,y1,n,l,col,w){g.strokeStyle=col;g.lineWidth=w||0.45;g.lineCap='round';const dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy)||1,nx=-dy/L*l,ny=dx/L*l;
  g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);for(let i=0;i<=n;i++){const f=i/n,x=x0+dx*f,y=y0+dy*f;g.moveTo(x-nx,y-ny);g.lineTo(x+nx,y+ny);}g.stroke();}
/* детская ручка: ладонь и четыре пальчика (dir — угол, sp — раскрытие пальцев, s — размер) */
function lmHoneyHand(g,x,y,dir,s,col,sp,dk){
  const cd=Math.cos(dir),sd=Math.sin(dir);
  const fing=(a,l,w)=>{const aa=dir+a,ex=x+cd*s*0.8+Math.cos(aa)*l*s,ey=y+sd*s*0.8+Math.sin(aa)*l*s;
    g.lineCap='round';g.strokeStyle=dk||shadeHex(col,-0.55);g.lineWidth=(w+0.55)*s;g.beginPath();g.moveTo(x+cd*s*0.5,y+sd*s*0.5);g.lineTo(ex,ey);g.stroke();
    g.strokeStyle=col;g.lineWidth=w*s;g.beginPath();g.moveTo(x+cd*s*0.5,y+sd*s*0.5);g.lineTo(ex,ey);g.stroke();};
  fing(-0.75*sp,1.5,0.42);fing(-0.25*sp,1.9,0.42);fing(0.25*sp,1.8,0.4);fing(0.75*sp,1.4,0.36);
  g.beginPath();g.ellipse(x,y,s*0.95,s*0.85,dir,0,TAU);mobPath(g,col,x-s*0.2,y-s*0.3,s);
}

LM_MODEL.lbee=function(g,m,FY,t,T,st,k,wv,ph){
  const dash=st==='dash',wind=st==='windup'?k:0,fq=dash?58:wind>0?46:36,fl=Math.sin(t*fq+ph),fl2=Math.sin(t*fq+ph-0.8);
  const bob=Math.sin(t*3+ph),br=Math.sin(t*2.4+ph*2),ff=m.facing||1;
  let aim=0;
  if(m.ax!==undefined&&(dash||wind>0)){const dx=Math.abs(dash&&m.dvx!==undefined?m.dvx:(m.ax-m.x)),dy=dash&&m.dvy!==undefined?m.dvy:(m.ay-(m.y-m.h*0.5));aim=clamp(Math.atan2(dy,dx||1e-3),-0.9,0.9);}
  const curl=dash?0.8:wind,rot=dash?aim*0.8+0.12:(-wind*0.3+aim*wind*0.3)+bob*0.05+(m.mk||0)*0.1;/* в полёте клонится вперёд */
  g.save();g.translate(-wind*2.2,bob*0.6);g.rotate(rot);
  const bl=(Math.sin(m.anim*1.1+ph*7)>0.985)?0.12:1;
  if(!T){
    const Y='#ffd13c',YL='#ffe488',YD='#d98f14',BR='#3b2610',CR='#fffaf0',CRD='#e8d2a8',PK='#ff9cc0';
    /* дальнее крыло и дальняя ножка — темнее и позади */
    const wing=(far)=>{
      g.save();g.translate(far?-2.6:0.2,-6.4);g.rotate((far?-0.45:-0.72)+(far?fl2:fl)*0.5-(dash?0.5:0)-(wind>0?0.18:0));
      g.beginPath();g.moveTo(0,0);g.bezierCurveTo(-4.4,-2.6,-4.8,-11.4,0.6,-15);g.bezierCurveTo(5.8,-11.4,4.6,-2.6,0,0);g.closePath();
      const gr=g.createLinearGradient(0,0,0,-15);gr.addColorStop(0,far?'rgba(160,180,225,.6)':'rgba(240,248,255,.88)');gr.addColorStop(1,far?'rgba(140,160,220,.28)':'rgba(190,214,255,.42)');
      g.fillStyle=gr;g.fill();g.strokeStyle=far?'rgba(80,100,170,.6)':'rgba(110,140,205,.8)';g.lineWidth=0.6;g.lineJoin='round';g.stroke();
      g.strokeStyle=far?'rgba(90,110,170,.5)':'rgba(120,150,210,.65)';g.lineWidth=0.35;g.beginPath();
      g.moveTo(0,-1);g.quadraticCurveTo(0.9,-8,0.6,-13.6);g.moveTo(0,-3.5);g.lineTo(-3.2,-8.6);g.moveTo(0.1,-5);g.lineTo(3.6,-9.4);g.moveTo(0.4,-9);g.lineTo(-1.6,-12);g.stroke();
      if(!far){g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=0.7;g.beginPath();g.moveTo(-3.4,-4.4);g.quadraticCurveTo(-3.8,-9.6,-0.4,-13.4);g.stroke();}
      g.restore();};
    mobGlow(g,2,0,17,'#ffc040',0.3);
    wing(true);
    /* дальняя усик-антенна */
    const sw=Math.sin(t*2.6+ph)-(m.mk||0)*1.4;
    g.strokeStyle=shadeHex(BR,-0.2);g.lineWidth=0.6;g.lineCap='round';g.beginPath();g.moveTo(9.6,-9);g.quadraticCurveTo(10.6,-13.4,14.6+sw*0.8,-14.4);g.stroke();
    mobBlob(g,14.7+sw*0.8,-14.5,1.1,1.1,shadeHex('#e0a020',-0.3),0,true);
    /* ножки: три пары, дальние темнее */
    const legs=(far)=>{for(const [hx,fx,fy] of [[-0.6,-3.4,12.2],[2.6,2.4,12.6],[5.4,7.2,12]]){
      const sy=Math.sin(t*5+hx+ph)*0.5-(m.mk||0)*1.6;/* на лету ножки отстают назад */
      lmLeg(g,hx+(far?1.4:0),6.2,fx+(far?1.4:0)+sy,fy-(far?0.8:0),3.4,3.4,true,1.05,far?'#2a180a':'#4a2c12');
      if(!far&&hx<0){mobBlob(g,fx+sy+0.1,fy-3.3,1.3,1.7,'#f0a828',0.3,true);}}};
    legs(true);
    /* брюшко: пушистая груша */
    lmFluff(g,-5.2,2.4,10.6,8,16,0.1,2.3);mobPath(g,Y,-7,-2,11);
    g.save();g.clip();
    /* полосы: мохнатые бархатные пояса */
    for(const [bx,bw] of [[-12.2,2.4],[-7.4,3.2],[-2.4,3.2]]){
      g.beginPath();g.moveTo(bx-bw/2,-9);g.quadraticCurveTo(bx-bw/2+1.8,2,bx-bw/2+0.5,12);g.lineTo(bx+bw/2+0.5,12);g.quadraticCurveTo(bx+bw/2+1.8,2,bx+bw/2,-9);g.closePath();
      g.fillStyle=BR;g.fill();
      g.fillStyle='rgba(120,80,30,.55)';g.beginPath();g.moveTo(bx-bw/2,-9);g.quadraticCurveTo(bx-bw/2+1.8,2,bx-bw/2+0.5,12);g.lineTo(bx-bw/2+1.1,12);g.quadraticCurveTo(bx-bw/2+2.4,2,bx-bw/2+0.7,-9);g.fill();
      g.strokeStyle=BR;g.lineWidth=0.5;g.lineCap='round';for(let q=1;q<9;q+=3){const y=-7+q*2,sx=bx+bw/2+Math.sin(y*0.5+bx)*0.4+1.8*Math.sin((y+9)/21*Math.PI);g.beginPath();g.moveTo(sx-0.3,y);g.lineTo(sx+0.9,y+0.5);g.stroke();
        const sx2=bx-bw/2+1.6*Math.sin((y+9)/21*Math.PI);g.beginPath();g.moveTo(sx2+0.3,y);g.lineTo(sx2-0.9,y+0.4);g.stroke();}}
    /* свет сверху-слева, тень снизу */
    g.fillStyle='rgba(255,250,200,.3)';g.beginPath();g.ellipse(-8,-4.8,7,2.4,-0.25,0,TAU);g.fill();
    g.fillStyle='rgba(110,50,0,.3)';g.beginPath();g.ellipse(-4,10.2,14,4,0,0,TAU);g.fill();
    g.restore();
    lmFur(g,[[-13.5,-3,1.4,-1.4],[-10.5,-7.2,1.4,-1.6],[-6,-9,1.2,-1.8],[-1.6,-8.2,1.4,-1.5],[-14,2,-0.8,0.8],[-12,7,-0.6,1.2],[-8,9.2,-0.2,1.4]],'rgba(255,245,200,.8)',0.55);
    /* жало: кончик брюшка, при замахе загибается вперёд-вниз */
    g.save();g.translate(-14.4,3.2);g.rotate(-curl*1.7);
    g.beginPath();g.moveTo(1.2,-1.5);g.quadraticCurveTo(-1.6,-1,-5.2-curl*1.6,0.1);g.quadraticCurveTo(-1.6,1,1.2,1.6);g.closePath();mobPath(g,'#8a5a1c',-2,0,2.6);
    g.fillStyle='#4a2a0c';g.beginPath();g.ellipse(1.2,0,1,1.8,0,0,TAU);g.fill();
    g.strokeStyle='rgba(255,210,140,.6)';g.lineWidth=0.3;g.beginPath();g.moveTo(0,-1);g.quadraticCurveTo(-2.4,-0.8,-5.2,0);g.stroke();
    if(wind>0.1){lmHoneyDrop(g,-5.2-curl*2.4,2.6+wind*1.4,0.6+wind*0.4,'#ffd048',true);}
    g.restore();
    /* грудка: светлый пух */
    lmFluff(g,3.6,0.6,5.4,6,11,0.12,5.1);mobPath(g,'#ffe9a8',2,-2.4,6);
    lmFur(g,[[0.4,-3,1,-1.2],[3,-4.6,1,-1.4],[5.8,-3,1,-1],[1.4,2.8,0.4,1.4],[4.6,3.6,0.6,1.4],[6.4,0.6,1.2,0.4]],'rgba(255,255,255,.75)',0.5);
    lmFur(g,[[1,4.4,0.2,1.2],[3.6,5.2,0.4,1.1]],'rgba(190,120,20,.55)',0.5);
    /* ближние ножки и ближнее крыло */
    legs(false);
    wing(false);
    /* голова: большой пушистый шар, в три четверти — видны оба глаза */
    const hb=Math.sin(t*1.9+ph)*0.35,ang=wind>0.2||dash;
    g.save();g.translate(0,hb);
    lmFluff(g,9.8,-0.4,7.3,6.9,13,0.06,3.3);mobPath(g,'#ffe680',7.6,-3.8,8);
    /* пушистый воротничок и щёчки */
    lmFluff(g,5.4,3,3.4,2.8,7,0.2,9.1,0,0.3,3.7);g.closePath();mobPath(g,CR,5,2.4,3.6,true);
    lmFluff(g,13.4,3.6,3.2,2.4,6,0.18,7.7,0,-0.3,3.5);g.closePath();mobPath(g,'#fff0b0',13,3,3.4,true);
    /* глаза: дальний — меньше, у самого края */
    const eye=(ex,ey,rx,ry,lk)=>{
      const lx=(m.lookX||0)*0.4*lk,ly=(m.lookY||0)*0.35*lk;
      g.fillStyle='#3a2010';g.beginPath();g.ellipse(ex,ey,rx,ry*bl,0.08,0,TAU);g.fill();
      if(bl>0.5){const ig=g.createRadialGradient(ex+lx,ey+ly+ry*0.3,0.2,ex+lx,ey+ly,ry*0.95);ig.addColorStop(0,'#ffb850');ig.addColorStop(0.5,'#a05818');ig.addColorStop(1,'#2a1204');
        g.fillStyle=ig;g.beginPath();g.ellipse(ex+lx,ey+ly,rx*0.86,ry*0.88,0.08,0,TAU);g.fill();
        g.fillStyle='#120804';g.beginPath();g.arc(ex+lx+0.15,ey+ly+0.1,rx*(ang?0.26:0.4),0,TAU);g.fill();
        g.fillStyle='#fff';g.beginPath();g.arc(ex+lx-rx*0.34,ey+ly-ry*0.36,rx*0.32,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.arc(ex+lx+rx*0.36,ey+ly+ry*0.36,rx*0.15,0,TAU);g.fill();}
      g.strokeStyle='#3a2010';g.lineWidth=0.75;g.lineCap='round';g.beginPath();g.ellipse(ex,ey,rx*1.05,ry*1.04*bl,0.08,Math.PI*1.1,Math.PI*1.92);g.stroke();
      g.lineWidth=0.45;g.beginPath();g.moveTo(ex+rx*0.85,ey-ry*0.7);g.lineTo(ex+rx*1.3,ey-ry*0.95);g.moveTo(ex+rx*1.0,ey-ry*0.4);g.lineTo(ex+rx*1.45,ey-ry*0.5);g.stroke();
      if(ang){g.lineWidth=0.85;g.beginPath();g.moveTo(ex-rx*1.0,ey-ry*1.25);g.lineTo(ex+rx*1.05,ey-ry*0.8);g.stroke();}};
    eye(15.6,-0.4,1.75,2.5,0.6);
    eye(11.2,-0.5,2.7,3.2,1);
    /* румянец, рот */
    g.fillStyle='rgba(255,110,150,.5)';g.beginPath();g.ellipse(9.2,3.6,1.9,1.1,0.1,0,TAU);g.fill();g.beginPath();g.ellipse(16,3.2,1.3,0.9,0.1,0,TAU);g.fill();
    if(ang){g.fillStyle='#4a1a10';g.beginPath();g.ellipse(13.6,4.8,1.5,1.2+wind*1.2,0,0,TAU);g.fill();g.fillStyle='#ff8ca8';g.beginPath();g.ellipse(13.6,5.6+wind*0.4,0.9,0.6,0,0,TAU);g.fill();}
    else{g.strokeStyle='#6a3210';g.lineWidth=0.75;g.lineCap='round';g.beginPath();g.moveTo(12.2,4.1);g.quadraticCurveTo(13.8,6.4,15.4,4.1);g.stroke();g.fillStyle='#ff8ca8';g.beginPath();g.moveTo(13,5.2);g.quadraticCurveTo(13.8,6.6,14.6,5.2);g.fill();}
    /* чепчик: кружево, лента, цветок */
    g.beginPath();g.moveTo(3.8,0.6);g.bezierCurveTo(2.2,-6.2,5.6,-10.4,10.4,-10);g.bezierCurveTo(14.4,-9.6,16.8,-7,16.4,-4.6);
    g.quadraticCurveTo(11,-6.4,8.4,-4.2);g.quadraticCurveTo(5.6,-2.4,5.4,3.4);g.closePath();lmHoneyWaxFill(g,3,16.4,'#ffffff','#fff6e0','#f0d0a0','#a07848');
    g.save();g.clip();
    g.strokeStyle='rgba(200,160,110,.5)';g.lineWidth=0.4;for(let i=0;i<4;i++){g.beginPath();g.moveTo(3.4+i*2.8,-10.8);g.quadraticCurveTo(4.4+i*2.8,-5,3.6+i*2.2,2);g.stroke();}
    g.fillStyle=PK;for(const [x,y] of [[5.4,-7.4],[8.4,-8.2],[12,-8.4],[6.4,-3.4],[4.6,-4.6],[14,-6.6]]){g.beginPath();g.arc(x,y,0.45,0,TAU);g.fill();}
    g.restore();
    /* оборка по краю */
    g.fillStyle=CR;g.strokeStyle='#c8a878';g.lineWidth=0.5;for(let i=0;i<7;i++){const f=i/6,x=16.4-f*8.6,y=-4.6-Math.sin(f*Math.PI)*1.1+f*0.6;g.beginPath();g.arc(x,y,1.3,0,TAU);g.fill();g.stroke();}
    g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.ellipse(8.4,-8.4,3.6,1.2,-0.4,0,TAU);g.fill();g.fillStyle='rgba(255,214,150,.28)';g.beginPath();g.ellipse(9,-4.8,5,1.2,0,0,TAU);g.fill();
    /* завязки и бантик */
    g.fillStyle=PK;g.strokeStyle='#c8587e';g.lineWidth=0.4;
    g.beginPath();g.moveTo(5.6,2.4);g.quadraticCurveTo(2.2,0.4,2.8,-1.2);g.lineTo(4.4,-1);g.quadraticCurveTo(5.4,0.8,6.4,1.6);g.closePath();g.fill();g.stroke();
    g.beginPath();g.moveTo(5.2,3);g.quadraticCurveTo(3.4,5,4.4,6.6);g.lineTo(5.8,6);g.quadraticCurveTo(5.6,4.4,6.4,3.2);g.closePath();g.fill();g.stroke();
    mobBlob(g,5.6,2.6,0.9,0.9,'#ff7aa8',0,true);
    /* цветок: пять лепестков и сердцевинка */
    g.save();g.translate(7.4,-10.4);for(let i=0;i<5;i++){g.rotate(TAU/5);g.beginPath();g.ellipse(0,-1.7,1.15,1.6,0,0,TAU);mobPath(g,i%2?'#ffc4dc':'#ffe0ee',0,-1.7,1.6,true);g.strokeStyle='#d8708e';g.lineWidth=0.3;g.stroke();}
    g.beginPath();g.arc(0,0,1,0,TAU);mobPath(g,'#ffb830',0,0,1,true);g.restore();
    g.fillStyle='#8ed060';g.beginPath();g.ellipse(10.2,-10.6,1.8,0.8,-0.3,0,TAU);g.fill();
    /* ближняя антенна: пружинка с бусиной */
    g.strokeStyle=BR;g.lineWidth=0.7;g.beginPath();g.moveTo(13.4,-8.8);g.quadraticCurveTo(15.2,-13.2,18.4+sw,-13.2);g.stroke();
    mobBlob(g,18.5+sw,-13.2,1.3,1.3,'#f0a828');
    g.restore();
    lmRim(g,q=>{q.strokeStyle='rgba(255,246,200,.5)';q.lineWidth=0.9;q.beginPath();q.ellipse(-5.2,2.4,10.4,7.8,0,Math.PI*1.12,Math.PI*1.62);q.stroke();q.beginPath();q.ellipse(9.8,-0.4+hb,7,6.6,0,Math.PI*1.15,Math.PI*1.6);q.stroke();});
  }else{
    /* ИСТИНА: пчела, из которой растёт ребёнок */
    const FL='#e8c2b2',FLD='#b88878',FLL='#f8dccd',BLD='#7a0f1c',BLB='#c01a2c';
    g.restore();g.save();g.translate(-wind*2.2,bob*0.6);g.rotate(rot);
    /* дальнее крыло — рваное */
    const rag=(far)=>{
      g.save();g.translate(far?-2.6:0.2,-6.4);g.rotate((far?-0.42:-0.7)+(far?fl2:fl)*0.45-(dash?0.5:0)-(wind>0?0.18:0)+(far?0:0.1));
      g.beginPath();g.moveTo(0,0);g.bezierCurveTo(-4.6,-2.6,-5,-10.6,-2.4,-13.4);g.lineTo(-1.4,-11.6);g.lineTo(-0.6,-14.4);g.lineTo(1,-12);g.lineTo(2.2,-13.8);g.lineTo(3,-10.4);g.bezierCurveTo(5.4,-8,4.6,-2.6,0,0);g.closePath();
      const gr=g.createLinearGradient(0,0,0,-14);gr.addColorStop(0,far?'rgba(120,120,100,.6)':'rgba(205,205,170,.82)');gr.addColorStop(1,far?'rgba(100,100,90,.25)':'rgba(170,170,140,.4)');
      g.fillStyle=gr;g.fill();g.strokeStyle=far?'rgba(60,40,30,.7)':'rgba(70,45,30,.85)';g.lineWidth=0.55;g.lineJoin='round';g.stroke();
      g.strokeStyle=far?'rgba(130,20,30,.55)':'rgba(170,20,34,.75)';g.lineWidth=0.4;g.beginPath();g.moveTo(0,-1);g.quadraticCurveTo(0.9,-7,-0.6,-12);g.moveTo(0,-3.5);g.lineTo(-3.4,-8);g.moveTo(0.1,-5);g.lineTo(3.2,-8.6);g.moveTo(-0.2,-7);g.lineTo(-1.8,-10);g.stroke();
      if(!far){g.fillStyle='rgba(20,10,10,.55)';g.beginPath();g.ellipse(1.6,-6.2,1,1.5,0.3,0,TAU);g.fill();}
      g.restore();};
    rag(true);
    /* детские ножки сзади: пухлые, с пальчиками */
    const baby=(x0,y0,x1,y1,col,far)=>{
      lmLimb(g,x0,y0,x1,y1,3.8,3.6,true,3.8,2.7,col);
      g.beginPath();g.ellipse(x1+0.6,y1+0.5,2.5,1.4,0.1,0,TAU);mobPath(g,col,x1,y1,2.4);
      g.fillStyle=far?shadeHex(FLD,-0.2):FLL;for(let q=0;q<4;q++){g.beginPath();g.arc(x1+2.5+q*0.1,y1-0.6+q*0.6,0.5,0,TAU);g.fill();g.strokeStyle='rgba(70,30,30,.6)';g.lineWidth=0.25;g.stroke();}};
    baby(-3.4,6.4,-8,13.4,shadeHex(FL,-0.38),true);
    /* дальняя ручка */
    lmLimb(g,3.6,5,9.4+wind*2.4,9.4-wind*2,3.4,3.4,false,3.2,2.2,shadeHex(FL,-0.38));
    lmHoneyHand(g,9.6+wind*2.4,9.8-wind*2,0.3,1.55,shadeHex(FL,-0.38),0.6+wind*0.5);
    /* усик-антенна дальняя */
    const sw=Math.sin(t*2.6+ph)-(m.mk||0)*1.4;
    g.strokeStyle='#150c06';g.lineWidth=0.5;g.lineCap='round';g.beginPath();g.moveTo(10.4,-9);g.quadraticCurveTo(10.6,-13.8,14.6+sw*0.8,-15);g.stroke();
    g.beginPath();g.arc(14.8+sw*0.8,-15.2,1.05,0,TAU);mobPath(g,'#cfc4b4',14.8,-15,1.1,true);g.fillStyle=BLB;g.beginPath();g.arc(15.1+sw*0.8,-15.2,0.5,0,TAU);g.fill();
    /* брюшко: треснувший хитин, полосы грязно-золотые и чёрные */
    lmFluff(g,-5.2,2.6,10.6,8,15,0.05,6.3);mobPath(g,'#a88428',-7,-2,11);
    g.save();g.clip();
    for(const [bx,bw] of [[-12.4,2.6],[-7.6,3.4],[-2.4,3.2]]){
      g.beginPath();g.moveTo(bx-bw/2,-9);g.quadraticCurveTo(bx-bw/2+1.8,2,bx-bw/2+0.5,12);g.lineTo(bx+bw/2+0.5,12);g.quadraticCurveTo(bx+bw/2+1.8,2,bx+bw/2,-9);g.closePath();
      g.fillStyle='#17100a';g.fill();g.strokeStyle='#5a4418';g.lineWidth=0.4;g.stroke();}
    /* кольца хитина и грязь */
    g.strokeStyle='rgba(40,24,6,.55)';g.lineWidth=0.4;for(const x of [-10,-5,0.4]){g.beginPath();g.moveTo(x,-8);g.quadraticCurveTo(x+1.6,2,x+0.2,11);g.stroke();}
    g.fillStyle='rgba(255,230,150,.22)';g.beginPath();g.ellipse(-8,-4.8,7,2.2,-0.25,0,TAU);g.fill();
    g.fillStyle='rgba(30,10,6,.42)';g.beginPath();g.ellipse(-4,10.4,14,4.2,0,0,TAU);g.fill();
    /* рана-разрез по боку: розовое мясо, тёмное нутро, шов */
    g.beginPath();g.moveTo(-9.6,-0.4);g.quadraticCurveTo(-6.4,-2.6,-2.6,1.2);g.quadraticCurveTo(-5.6,0.6,-9.6,-0.4);g.closePath();
    g.fillStyle=BLD;g.fill();g.beginPath();g.moveTo(-9,-0.4);g.quadraticCurveTo(-6.4,-1.6,-3.4,1);g.quadraticCurveTo(-6.2,-0.4,-9,-0.4);g.fillStyle='#e06a7a';g.fill();
    lmHoneyStitch(g,-9.6,-0.4,-2.6,1.2,6,0.9,'#0c0606',0.45);
    g.restore();
    g.strokeStyle='rgba(20,10,4,.5)';g.lineWidth=0.4;lmFur(g,[[-13.5,-3,1.2,-1.2],[-10.5,-7.2,1.2,-1.4],[-6,-9,1,-1.6],[-1.6,-8.2,1.2,-1.4]],'rgba(120,90,40,.8)',0.5);
    /* шприц вместо жала: стекло, кровь, поршень, игла; при замахе поворачивается вперёд-вниз */
    g.save();g.translate(-13.6,3.4);g.rotate(0.28-curl*0.95);
    const sy=wind>0.5?1:0;
    /* шток поршня уходит в брюшко */
    g.fillStyle='#8a8f9a';g.fillRect(-2,-0.5,5,1);g.fillStyle='#c0c4cc';g.fillRect(-2,-0.5,5,0.4);
    g.beginPath();g.ellipse(2.8,0,0.5,1.7,0,0,TAU);mobPath(g,'#a8acb6',2.8,0,1.4,true);
    /* стеклянный цилиндр */
    g.beginPath();g.moveTo(-1.4,-2.3);g.lineTo(-12.6,-2.3);g.lineTo(-12.6,2.3);g.lineTo(-1.4,2.3);g.closePath();
    g.fillStyle='rgba(214,230,238,.55)';g.fill();g.strokeStyle='rgba(30,40,56,.9)';g.lineWidth=0.7;g.stroke();
    /* кровь внутри */
    const lv=4.4+wind*3.2;g.fillStyle=BLB;g.fillRect(-12.2,-1.8,lv*0.7,3.6);g.fillStyle=BLD;g.fillRect(-12.2,0.4,lv*0.7,1.4);g.fillStyle='#e8505c';g.fillRect(-12.2,-1.8,lv*0.7,0.7);
    g.fillStyle='#ff7a86';g.beginPath();g.arc(-4.6+Math.sin(t*3)*0.4,-0.4,0.35,0,TAU);g.fill();
    g.strokeStyle='rgba(30,40,56,.85)';g.lineWidth=0.35;for(let i=0;i<5;i++){g.beginPath();g.moveTo(-4.2-i*1.5,-2.3);g.lineTo(-4.2-i*1.5,-1.1-(i%2)*0.5);g.stroke();}
    g.fillStyle='rgba(255,255,255,.75)';g.fillRect(-11.6,-2,8,0.5);
    /* фланец и игла */
    g.fillStyle='#b8bcc6';g.fillRect(-1.4,-3.6,1,7.2);g.strokeStyle='#40444e';g.lineWidth=0.35;g.strokeRect(-1.4,-3.6,1,7.2);
    g.fillStyle='#d6dae0';g.beginPath();g.moveTo(-12.6,-1);g.lineTo(-14.2,-0.4);g.lineTo(-14.2,0.4);g.lineTo(-12.6,1);g.closePath();g.fill();
    g.strokeStyle='#e8ecf2';g.lineWidth=0.5;g.beginPath();g.moveTo(-14.2,0);g.lineTo(-19.4-curl*1.4,0.1);g.stroke();g.strokeStyle='#707684';g.lineWidth=0.25;g.beginPath();g.moveTo(-14.2,0.3);g.lineTo(-19.4-curl*1.4,0.2);g.stroke();
    if(true){const dy=((t*1.3)%1);g.fillStyle=BLB;g.beginPath();g.ellipse(-19.6-curl*1.4,1.2+dy*3.4,0.5,0.8,0,0,TAU);g.fill();}
    if(wind>0.6){for(let i=0;i<4;i++){const f=(t*3+i*0.25)%1;g.fillStyle='rgba(200,20,36,'+(1-f)+')';g.beginPath();g.arc(-20-curl*1.4-f*3,(i-1.5)*0.9*f*2,0.4,0,TAU);g.fill();}}
    g.restore();
    /* грудка: голая плоть, из неё растут ручки */
    lmFluff(g,3.6,1.2,5,5.4,9,0.06,7.1);mobPath(g,'#c88a7c',2,-2,6);
    g.save();g.clip();g.strokeStyle='rgba(120,30,40,.6)';g.lineWidth=0.4;g.beginPath();g.moveTo(1,-3);g.quadraticCurveTo(2.6,0,1.2,5);g.moveTo(3.6,-3.6);g.quadraticCurveTo(5.4,0,4.4,5);g.moveTo(5.6,-1);g.lineTo(3,3);g.stroke();
    g.fillStyle='rgba(30,6,10,.3)';g.beginPath();g.ellipse(3,6,6,2.4,0,0,TAU);g.fill();g.restore();
    lmFur(g,[[0,-4,0.8,-1.4],[2.4,-5.4,1,-1.4],[5.2,-4.4,1,-1]],'rgba(60,40,18,.8)',0.5);
    /* ближние детские ножка и ручка */
    baby(-0.4,7,-4,14,FL,false);
    lmLimb(g,5.4,5.4,11.4+wind*3,10.4-wind*3.4,3.8,3.6,false,3.9,2.7,FL);
    lmHoneyHand(g,11.6+wind*3,10.8-wind*3.4,0.2-wind*0.3,1.8,FL,0.7+wind*0.7);
    rag(false);
    /* голова: ребёнок */
    const hb=Math.sin(t*1.9+ph)*0.35,open=0.4+wind*0.5+(dash?0.4:0)+Math.max(0,br)*0.1;
    g.save();g.translate(0,hb);
    /* лоскут старого чепчика сзади: рваный, в бурых пятнах */
    g.beginPath();g.moveTo(3.4,-6.6);g.bezierCurveTo(0,-8.4,-3,-4,-3.8,2);g.lineTo(-2.2,0.6);g.lineTo(-2.4,4.4);g.lineTo(-0.2,2.4);g.lineTo(0.4,5.6);g.lineTo(2.4,1.8);g.lineTo(4.2,2.2);g.closePath();mobPath(g,'#d8ccae',0,-2,6);
    g.fillStyle='rgba(120,30,20,.5)';g.beginPath();g.ellipse(-0.6,-0.8,1.2,1.8,0.4,0,TAU);g.fill();
    g.strokeStyle='rgba(100,80,50,.6)';g.lineWidth=0.35;g.beginPath();g.moveTo(1.6,-5.4);g.quadraticCurveTo(-1.2,-3,-1.8,1.4);g.stroke();
    g.strokeStyle='#3a2a1a';g.lineWidth=0.4;g.beginPath();g.moveTo(-0.2,4.4);g.lineTo(-0.6,7.6+Math.sin(t*3+ph)*0.4);g.stroke();
    for(let i=0;i<5;i++){g.save();g.translate(-0.6,8.2+Math.sin(t*3+ph)*0.4);g.rotate(i*1.26);g.beginPath();g.ellipse(0,-0.9,0.5,0.95,0,0,TAU);g.fillStyle=i%2?'#4a2a2a':'#6a3a3a';g.fill();g.restore();}
    /* череп-голова */
    g.beginPath();g.moveTo(3.6,-3.4);g.bezierCurveTo(3.8,-9.6,11.6,-10.8,14.6,-6.6);g.bezierCurveTo(17.2,-3,16.8,2.4,14,5.2);g.bezierCurveTo(11.4,8,6.4,7.6,4.2,4.4);g.bezierCurveTo(2.8,2,2.8,-1,3.6,-3.4);g.closePath();
    mobPath(g,'#f0d0c2',8,-4,10);
    g.save();g.clip();
    g.fillStyle='rgba(110,110,70,.22)';g.beginPath();g.ellipse(7,5,8,3.6,0,0,TAU);g.fill();
    g.fillStyle='rgba(140,60,70,.2)';g.beginPath();g.ellipse(14.6,1,2.6,3.4,0,0,TAU);g.fill();
    /* вены на виске */
    g.strokeStyle='rgba(90,80,160,.65)';g.lineWidth=0.4;g.beginPath();g.moveTo(6.6,-8);g.quadraticCurveTo(5.4,-4,7.4,-2);g.moveTo(5.6,-6.6);g.lineTo(4.4,-4);g.moveTo(8.4,-8.6);g.quadraticCurveTo(9.4,-6.4,8.6,-4.4);g.stroke();
    /* шов поперёк лба */
    lmHoneyStitch(g,5,-8.8,14,-5.6,7,0.8,'#2a0c10',0.4);
    g.restore();
    g.strokeStyle='rgba(255,236,226,.5)';g.lineWidth=0.7;g.beginPath();g.ellipse(8.6,-3.6,7.4,6.4,0,Math.PI*1.15,Math.PI*1.55);g.stroke();
    /* несколько волосков */
    g.strokeStyle='#4a3020';g.lineWidth=0.35;g.beginPath();g.moveTo(8,-9.6);g.quadraticCurveTo(7,-12,5,-12.4);g.moveTo(9.4,-9.8);g.quadraticCurveTo(10,-12.4,8.6,-13.6);g.stroke();
    /* дальний глаз — выпирает за контур */
    const ex2=15,ey2=-2.4;
    g.beginPath();g.arc(ex2,ey2,2.4,0,TAU);mobPath(g,'#f6ecdc',ex2,ey2,2.4);
    g.strokeStyle='rgba(190,20,34,.8)';g.lineWidth=0.3;for(let i=0;i<7;i++){const a=i/7*TAU+0.3;g.beginPath();g.moveTo(ex2+Math.cos(a)*2.3,ey2+Math.sin(a)*2.3);g.lineTo(ex2+Math.cos(a)*1.1,ey2+Math.sin(a)*1.1);g.stroke();}
    g.fillStyle='#caa070';g.beginPath();g.arc(ex2+0.2,ey2+0.1,1,0,TAU);g.fill();g.fillStyle='#050202';g.beginPath();g.arc(ex2+0.3,ey2+0.1,0.5,0,TAU);g.fill();
    /* ближний глаз: огромный, выкаченный, в красных жилах */
    const ex=10.2,ey=-2.2,lx=(m.lookX||0)*0.5,ly=(m.lookY||0)*0.4;
    g.fillStyle='#3a0c12';g.beginPath();g.ellipse(ex,ey,4.5,4.7,0,0,TAU);g.fill();
    const wg=g.createRadialGradient(ex-1,ey-1.4,0.4,ex,ey,4.2);wg.addColorStop(0,'#ffffff');wg.addColorStop(0.7,'#f6e8dc');wg.addColorStop(1,'#d89890');
    g.fillStyle=wg;g.beginPath();g.ellipse(ex,ey,4.1,4.3,0,0,TAU);g.fill();
    g.strokeStyle='rgba(190,16,32,.85)';g.lineWidth=0.34;for(let i=0;i<11;i++){const a=i/11*TAU+0.2;g.beginPath();g.moveTo(ex+Math.cos(a)*4.1,ey+Math.sin(a)*4.2);g.quadraticCurveTo(ex+Math.cos(a+0.3)*2.8,ey+Math.sin(a+0.3)*2.9,ex+Math.cos(a)*1.9+lx*0.4,ey+Math.sin(a)*1.9+ly*0.4);g.stroke();}
    g.fillStyle='#b89260';g.beginPath();g.arc(ex+lx*0.9,ey+ly*0.8,1.55,0,TAU);g.fill();g.fillStyle='#030101';g.beginPath();g.arc(ex+lx*0.9,ey+ly*0.8,(wind>0.3||dash)?0.55:0.85,0,TAU);g.fill();
    g.fillStyle='#fff';g.beginPath();g.arc(ex-1.1,ey-1.4,0.8,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.arc(ex+1.3,ey+1.4,0.38,0,TAU);g.fill();
    g.strokeStyle='rgba(60,10,16,.85)';g.lineWidth=0.5;g.beginPath();g.ellipse(ex,ey,4.3,4.5,0,0,TAU);g.stroke();
    /* нос-точки и вопящий рот */
    g.fillStyle='#8a4a48';g.beginPath();g.arc(15.2,1.6,0.35,0,TAU);g.fill();
    const mx=12.2,my=3.2+open*0.5;
    g.fillStyle='#1c0408';g.beginPath();g.ellipse(mx,my,2.7,1.8+open*2.2,0.15,0,TAU);g.fill();
    g.fillStyle='#b43a4a';g.beginPath();g.ellipse(mx+0.2,my+0.6+open*0.9,1.8,0.9+open*0.7,0.1,0,TAU);g.fill();
    g.fillStyle='#fff2e2';g.beginPath();g.moveTo(mx-1.6,my-1.6-open*0.3);g.lineTo(mx-1.1,my-0.6);g.lineTo(mx-0.6,my-1.7);g.lineTo(mx,my-0.7);g.lineTo(mx+0.5,my-1.8);g.lineTo(mx+0.7,my-1.5);g.lineTo(mx-1.6,my-1.7);g.fill();
    g.beginPath();g.moveTo(mx-1.4,my+1.8+open*1.3);g.lineTo(mx-0.7,my+0.9+open*0.7);g.lineTo(mx-0.1,my+1.9+open*1.2);g.lineTo(mx+0.9,my+0.9+open*0.7);g.lineTo(mx+1.3,my+1.8+open*1.2);g.closePath();g.fill();
    g.strokeStyle='rgba(255,230,240,.7)';g.lineWidth=0.35;g.beginPath();g.moveTo(mx+0.4,my+2.4+open*1.6);g.quadraticCurveTo(mx+0.9,my+4.6+open*2,mx+0.2,my+6.2+open*2+Math.sin(t*5)*0.4);g.stroke();
    g.restore();
    /* антенна ближняя, с глазком на конце */
    g.strokeStyle='#150c06';g.lineWidth=0.6;g.beginPath();g.moveTo(11.4,-9.6+hb);g.quadraticCurveTo(13.4,-13.4+hb,17+sw,-13.4+hb);g.stroke();
    g.beginPath();g.arc(17.2+sw,-13.4+hb,1.3,0,TAU);mobPath(g,'#d6ccbc',17,-13.4,1.3,true);g.fillStyle=BLB;g.beginPath();g.arc(17.6+sw,-13.4+hb,0.65,0,TAU);g.fill();g.fillStyle='#000';g.beginPath();g.arc(17.7+sw,-13.4+hb,0.28,0,TAU);g.fill();
    lmRim(g,q=>{q.strokeStyle='rgba(255,236,220,.35)';q.lineWidth=0.8;q.beginPath();q.ellipse(-5.2,2.6,10.4,7.8,0,Math.PI*1.12,Math.PI*1.55);q.stroke();});
  }
  g.restore();
};
/* ---------- медовый слизень ---------- */
/* четырёхлучевая искорка */
function lmHoneySpark(g,x,y,r,col,a){g.save();g.globalAlpha=a==null?1:a;g.fillStyle=col||'#fff6c0';g.beginPath();
  g.moveTo(x,y-r);g.quadraticCurveTo(x+r*0.14,y-r*0.14,x+r,y);g.quadraticCurveTo(x+r*0.14,y+r*0.14,x,y+r);g.quadraticCurveTo(x-r*0.14,y+r*0.14,x-r,y);g.quadraticCurveTo(x-r*0.14,y-r*0.14,x,y-r);g.fill();g.restore();}
/* утонувшее лицо: dp — глубина (0 у поверхности … 1 на дне), mood: 0 — вопит, 1 — выпученные глаза, 2 — спит */
function lmHoneyFace(g,x,y,s,rot,dp,mood,glint){
  g.save();g.translate(x,y);g.rotate(rot);g.scale(s,s);
  const sk=mixHex('#ecc98c','#5a3010',dp*0.85),dk=mixHex('#8a5a28','#2a1204',dp*0.8);
  g.beginPath();g.ellipse(0,0,0.78,1,0,0,TAU);g.fillStyle=sk;g.fill();
  g.fillStyle=mixHex('#fff0c0','#8a5a28',dp);g.globalAlpha=0.35;g.beginPath();g.ellipse(-0.25,-0.42,0.34,0.3,0,0,TAU);g.fill();g.globalAlpha=1;
  g.fillStyle=dk;g.globalAlpha=0.45;g.beginPath();g.ellipse(0.3,0.5,0.55,0.5,0,0,TAU);g.fill();g.globalAlpha=1;
  g.lineWidth=0.09;g.strokeStyle=dk;g.beginPath();g.ellipse(0,0,0.78,1,0,0,TAU);g.stroke();
  /* глазницы */
  const er=mood===1?0.27:0.21;
  for(const sx of [-0.33,0.33]){
    if(mood===2){g.strokeStyle='#1c0c04';g.lineWidth=0.09;g.beginPath();g.arc(sx,-0.2,0.2,0.2,Math.PI-0.2);g.stroke();continue;}
    g.fillStyle='#1c0c04';g.beginPath();g.ellipse(sx,-0.2,er,er*1.2,0,0,TAU);g.fill();
    if(mood===1){g.fillStyle='#f4e2b0';g.beginPath();g.arc(sx,-0.2,er*0.62,0,TAU);g.fill();g.fillStyle='#120804';g.beginPath();g.arc(sx+0.03,-0.18,er*0.3,0,TAU);g.fill();}
    else if(glint){g.fillStyle='rgba(255,232,150,.95)';g.beginPath();g.arc(sx+0.02,-0.18,0.07,0,TAU);g.fill();}}
  g.strokeStyle=dk;g.lineWidth=0.07;g.beginPath();g.moveTo(0,-0.12);g.lineTo(-0.06,0.2);g.lineTo(0.08,0.22);g.stroke();
  /* рот */
  if(mood===2){g.strokeStyle='#1c0c04';g.lineWidth=0.08;g.beginPath();g.moveTo(-0.2,0.5);g.quadraticCurveTo(0,0.58,0.2,0.5);g.stroke();}
  else{g.fillStyle='#160804';g.beginPath();g.ellipse(0,0.52,mood===1?0.2:0.24,mood===1?0.22:0.34,0,0,TAU);g.fill();
    if(dp<0.5){g.fillStyle='#e8d098';g.fillRect(-0.12,0.22,0.24,0.08);}}
  g.restore();
}

/* рука: сужающаяся кривая от плеча к кисти, с объёмом; возвращает [x,y,угол] кисти */
function lmHoneyArm(g,x0,y0,cx,cy,x1,y1,w0,w1,col){
  const N=10,P=[],Q=[];
  for(let i=0;i<=N;i++){const f=i/N,a=(1-f)*(1-f),b=2*f*(1-f),c=f*f;P.push([a*x0+b*cx+c*x1,a*y0+b*cy+c*y1]);}
  for(let i=0;i<=N;i++){const A=P[Math.max(0,i-1)],B=P[Math.min(N,i+1)],dx=B[0]-A[0],dy=B[1]-A[1],l=Math.hypot(dx,dy)||1,f=i/N,w=(w0+(w1-w0)*f)*(1+0.12*Math.sin(f*Math.PI))/2;Q.push([-dy/l*w,dx/l*w]);}
  g.beginPath();for(let i=0;i<=N;i++)g[i?'lineTo':'moveTo'](P[i][0]+Q[i][0],P[i][1]+Q[i][1]);for(let i=N;i>=0;i--)g.lineTo(P[i][0]-Q[i][0],P[i][1]-Q[i][1]);g.closePath();
  mobPath(g,col,(x0+x1)/2,(y0+y1)/2,Math.hypot(x1-x0,y1-y0)*0.6);
  const e=P[N],d=P[N-1];
  return [e[0],e[1],Math.atan2(e[1]-d[1],e[0]-d[0])];
}

LM_MODEL.lslime=function(g,m,FY,t,T,st,k,wv,ph){
  const sp=st==='spit'?k:0,mk=m.mk||0,air=m.air||0;
  /* прыжок: растяжение по плавному m.air (без щелчка при отрыве), после посадки — шлёпок, затухающий упругими колебаниями */
  const sq=clamp(-(m.vy||0)/300,-0.3,0.3)*air;
  if(air>0.3)m.lmAt=t;
  const dtl=(m.lmAt!==undefined&&air<=0.3)?t-m.lmAt:9,land=(dtl>=0&&dtl<0.7)?Math.exp(-dtl*6)*Math.cos(dtl*17)*0.16:0;
  const b=Math.sin(t*4+ph),b2=Math.sin(t*2.3+ph*1.7),w1=Math.sin(t*2.6+ph),w2=Math.sin(t*1.9+ph*2.3),bl=(Math.sin(m.anim*1.1+ph*7)>0.985)?0.12:1;
  /* ползёт волной: тело то вытягивается вперёд, то стягивается; вершина тянется с запозданием (наклон от основания) */
  const ga=lmGait(m,32),roll=Math.sin(ga)*mk,rol2=Math.cos(ga)*mk;
  const tw=T?lmTwitch(t,ph,0.55):0;
  const lean=rol2*0.1+b2*0.04+Math.sin(t*1.3+ph)*0.04-sp*0.14+sq*0.2+tw*0.05;
  g.save();g.translate(0,FY);
  g.transform(1+b*0.05+b2*0.03+roll*0.07-sq*0.15+sp*0.07+land+tw*0.04,0,-lean,1-b*0.05-b2*0.03-roll*0.07+sq*0.2-sp*0.08-land*1.2,0,0);
  g.rotate(-sp*0.05);
  /* следы: комочки мёда остаются позади на земле (стоят на месте, пока слизень ползёт) */
  if(mk>0.08){for(let i=0;i<3;i++){const u=((m.gd||0)*0.9/26+i/3)%1,al=Math.sin(u*Math.PI)*mk;
    g.fillStyle=T?'rgba(58,26,6,'+al+')':'rgba(224,146,14,'+al+')';g.strokeStyle=T?'rgba(26,10,2,'+al*0.8+')':'rgba(122,60,6,'+al*0.8+')';g.lineWidth=0.4;
    g.beginPath();g.ellipse(-17-u*26,0.9,2.8*(1-u*0.4),0.9,0,0,TAU);g.fill();g.stroke();}}
  if(!T){
    const H='#ffb02c';
    /* лужица-подставка: тёмный мёд с блеском и каплями */
    g.save();g.beginPath();g.ellipse(0,0.4,17.6+sp*1.4,3,0,0,TAU);g.fillStyle='#c97a0c';g.fill();g.strokeStyle='#7a3c06';g.lineWidth=0.9;g.stroke();
    g.fillStyle='rgba(255,226,130,.55)';g.beginPath();g.ellipse(-3,-0.2,11,1.2,0,0,TAU);g.fill();
    g.fillStyle='#e0920e';for(const [x,y,r] of [[-17.2,1.6,1.3],[15.8,1.8,1.1],[-11,3,0.8],[9.6,3.1,0.9]]){g.beginPath();g.arc(x,y,r,0,TAU);g.fill();g.strokeStyle='#7a3c06';g.lineWidth=0.5;g.stroke();g.fillStyle='rgba(255,246,200,.7)';g.beginPath();g.arc(x-r*0.3,y-r*0.3,r*0.3,0,TAU);g.fill();g.fillStyle='#e0920e';}
    g.restore();
    /* тело: капля с тянущейся макушкой */
    const body=()=>{g.beginPath();g.moveTo(-15.6,-0.6);g.bezierCurveTo(-16.8,-8+w1*0.3,-10.4,-15.4,-4.6+w2*0.4,-21.2);g.bezierCurveTo(-3+w2*0.6,-25.6+sp*1.2,2.4+w2*0.8,-26.2+sp*1.2,3.6+w2*0.6,-21.4);
      g.bezierCurveTo(9.4,-14.6,16.8,-8-w1*0.3,15.6,-0.6);g.bezierCurveTo(10,1.8,-10,1.8,-15.6,-0.6);g.closePath();};
    body();
    {const gr=g.createRadialGradient(-4,-14,1,-1,-9,18);gr.addColorStop(0,'#ffec9a');gr.addColorStop(0.32,'#ffc83c');gr.addColorStop(0.7,'#f09a14');gr.addColorStop(1,'#c25e06');g.fillStyle=gr;g.fill();}
    g.strokeStyle='#7a3c06';g.lineWidth=1.15;g.lineJoin='round';g.stroke();
    g.save();body();g.clip();
    /* внутри: густой тёмный низ, светлое ядро, каустик у дна */
    g.fillStyle='rgba(150,70,0,.3)';g.beginPath();g.ellipse(7,-4,11,8,-0.3,0,TAU);g.fill();
    g.fillStyle='rgba(120,50,0,.22)';g.beginPath();g.ellipse(0,1,17,4,0,0,TAU);g.fill();
    g.fillStyle='rgba(255,238,150,.62)';g.beginPath();g.ellipse(-1,-2.2,11,2.4,0,0,TAU);g.fill();
    g.fillStyle='rgba(255,255,230,.5)';g.beginPath();g.ellipse(-2,-3,5,0.9,0,0,TAU);g.fill();
    /* тягучие прожилки */
    g.strokeStyle='rgba(255,240,170,.4)';g.lineWidth=0.5;g.lineCap='round';g.beginPath();g.moveTo(-12,-5);g.bezierCurveTo(-8,-9,-7,-14,-3,-17);g.moveTo(9,-6);g.bezierCurveTo(8,-11,6,-14,5,-17);g.stroke();
    g.strokeStyle='rgba(150,70,0,.28)';g.beginPath();g.moveTo(12,-3);g.bezierCurveTo(9,-6,4,-5,1,-7.6);g.stroke();
    /* пузырьки и сотовый осколок */
    for(const [x0,y0,r,sp2] of [[-8.4,-7.6,1.5,0],[6.2,-16.4,0.95,1],[-2.4,-17.6,0.75,2],[10.6,-6.2,1.2,3],[-12.6,-3.6,0.8,4]]){
      /* пузырёк всплывает по телу, чуть качаясь, у вершины гаснет и рождается снова у дна */
      const f=(t*0.11+sp2*0.21+ph*0.1)%1,x=x0*(1-f*0.7)+Math.sin(t*1.3+sp2*2)*1.1,y=-2.4-f*19,fa=Math.sin(f*Math.PI);g.globalAlpha=Math.min(1,fa*1.6);
      g.fillStyle='rgba(255,246,200,.28)';g.beginPath();g.arc(x,y,r,0,TAU);g.fill();g.strokeStyle='rgba(255,255,240,.75)';g.lineWidth=0.35;g.stroke();
      g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.arc(x-r*0.35,y-r*0.35,r*0.28,0,TAU);g.fill();}
    g.globalAlpha=1;
    g.save();g.translate(-6.4,-13.6);g.rotate(0.3);g.fillStyle='rgba(255,236,150,.22)';g.strokeStyle='rgba(150,80,10,.45)';g.lineWidth=0.4;g.beginPath();for(let i=0;i<6;i++){const a=i/6*TAU;g.lineTo(Math.cos(a)*2.2,Math.sin(a)*2.2);}g.closePath();g.fill();g.stroke();g.restore();
    g.fillStyle='rgba(120,60,0,.35)';for(const [x,y] of [[-4.6,-6.2],[1.6,-4.4],[8,-9.4],[-10,-10.4],[3.6,-18.4]]){g.beginPath();g.arc(x,y,0.45,0,TAU);g.fill();}
    g.restore();
    /* лицо */
    const gl=lmFidget(t,ph,6.5),lx=(m.lookX||0)*0.5+gl*Math.sin(ph*9)*0.9,ly=(m.lookY||0)*0.4-gl*0.25;/* изредка оглядывается */
    const eye=(ex,ey,r)=>{
      g.fillStyle='#3a1a00';g.beginPath();g.ellipse(ex,ey,r*0.92,r*1.08*bl,0,0,TAU);g.fill();
      if(bl>0.5){const ig=g.createRadialGradient(ex+lx,ey+ly+r*0.4,0.2,ex+lx,ey+ly,r*1.02);ig.addColorStop(0,'#c8761c');ig.addColorStop(0.55,'#6a3008');ig.addColorStop(1,'#1c0a00');
        g.fillStyle=ig;g.beginPath();g.ellipse(ex+lx,ey+ly,r*0.82,r*0.95,0,0,TAU);g.fill();
        g.fillStyle='#100400';g.beginPath();g.arc(ex+lx+0.1,ey+ly,r*0.4,0,TAU);g.fill();
        g.fillStyle='#fff';g.beginPath();g.arc(ex+lx-r*0.36,ey+ly-r*0.4,r*0.34,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.8)';g.beginPath();g.arc(ex+lx+r*0.38,ey+ly+r*0.4,r*0.16,0,TAU);g.fill();}
      g.strokeStyle='#4a2200';g.lineWidth=0.7;g.lineCap='round';g.beginPath();g.ellipse(ex,ey,r*0.98,r*1.12*bl,0,Math.PI*1.1,Math.PI*1.92);g.stroke();
      if(sp>0.1){g.lineWidth=0.8;g.beginPath();g.moveTo(ex-r,ey-r*1.2);g.lineTo(ex+r,ey-r*0.8);g.stroke();}};
    eye(-3.6,-11.2,2.7);eye(5,-10.8,2.3);
    g.fillStyle='rgba(255,100,110,.5)';g.beginPath();g.ellipse(-7.8,-7,1.9,1.1,0.1,0,TAU);g.ellipse(9.6,-6.8,1.7,1,0.1,0,TAU);g.fill();
    /* рот */
    if(sp>0.1){g.fillStyle='#5a2400';g.beginPath();g.ellipse(0.8,-6.4,1.8+sp*1.2,1.4+sp*1.9,0,0,TAU);g.fill();g.fillStyle='#e0647a';g.beginPath();g.ellipse(0.8,-5+sp*0.8,1.2+sp*0.6,0.8+sp*0.4,0,0,TAU);g.fill();}
    else{g.fillStyle='#5a2400';g.beginPath();g.moveTo(-2.6,-7.8);g.quadraticCurveTo(0.8,-3.6,4.4,-7.8);g.quadraticCurveTo(0.8,-6.4,-2.6,-7.8);g.fill();g.fillStyle='#ff8c9a';g.beginPath();g.ellipse(0.8,-5.8,1.2,0.7,0,0,TAU);g.fill();
      g.strokeStyle='#6a3200';g.lineWidth=0.7;g.beginPath();g.moveTo(-2.6,-7.8);g.quadraticCurveTo(0.8,-3.4,4.4,-7.8);g.stroke();}
    /* глянец сверху-слева */
    g.strokeStyle='rgba(255,248,214,.85)';g.lineWidth=2;g.lineCap='round';g.beginPath();g.moveTo(-12.4,-8);g.quadraticCurveTo(-12.8,-14.2,-7.4,-18.6);g.stroke();
    g.strokeStyle='rgba(255,255,255,.4)';g.lineWidth=0.8;g.beginPath();g.moveTo(-13.8,-5.4);g.lineTo(-13.4,-6.8);g.stroke();
    g.fillStyle='rgba(255,250,224,.95)';g.beginPath();g.ellipse(-4.6,-20.2,1.2,0.8,-0.6,0,TAU);g.fill();
    lmHoneySpark(g,-9.6,-16.6,2.6+Math.sin(t*4)*0.4,'#fffbe8',0.95);lmHoneySpark(g,11.2,-11.8,1.5,'#fffbe8',0.8);
    g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=0.9;g.beginPath();g.moveTo(11,-13);g.quadraticCurveTo(13.6,-10.6,13.8,-6.6);g.stroke();
    /* тянущаяся нить по боку */
    const th=Math.sin(t*1.9+ph)*0.6+roll*0.5,ty=4.6+Math.sin(t*1.2+ph)*0.8;
    g.fillStyle='#f09a14';g.beginPath();g.moveTo(14.4,-1.8);g.quadraticCurveTo(15.6+th*0.5,2,15.2+th,ty);g.quadraticCurveTo(14.6+th,ty+1,14+th,ty);g.quadraticCurveTo(14+th*0.5,2,13.6,-0.8);g.closePath();g.fill();g.strokeStyle='#7a3c06';g.lineWidth=0.5;g.stroke();
    /* глоток мёда во рту при плевке */
    if(sp>0.1){const gx=15.5+sp*3,gy=-8.6,gr=1.6+sp*2.8;
      g.strokeStyle='#e08a10';g.lineWidth=1.4*(1-sp*0.5)+0.4;g.beginPath();g.moveTo(11,-7.6);g.quadraticCurveTo(13.4,-8.2,gx-gr*0.6,gy);g.stroke();
      g.beginPath();g.arc(gx,gy,gr,0,TAU);mobPath(g,'#ffc23c',gx,gy,gr);g.fillStyle='rgba(255,255,255,.85)';g.beginPath();g.ellipse(gx-gr*0.35,gy-gr*0.4,gr*0.3,gr*0.2,-0.6,0,TAU);g.fill();}
    lmRim(g,q=>{q.strokeStyle='rgba(255,250,210,.5)';q.lineWidth=0.9;q.lineCap='round';q.beginPath();q.moveTo(-15.6,-3);q.bezierCurveTo(-16.8,-8,-10.4,-15.4,-4.6,-21.2);q.stroke();});
  }else{
    /* ИСТИНА: тёмный мёд-могильник — под плёнкой тонут лица и тянутся руки */
    const pulse=Math.sin(t*2.2+ph)*0.5,bump=Math.sin(t*3.1+ph)*0.4+tw*0.8;/* изнутри толкаются: плёнка вздувается */
    /* лужа и остатки: осколок крыла, череп наполовину в мёде */
    g.beginPath();g.ellipse(0,0.6,19.6+sp*1.4,3.2,0,0,TAU);g.fillStyle='#3a1a06';g.fill();g.strokeStyle='#1a0a02';g.lineWidth=0.9;g.stroke();
    g.fillStyle='rgba(255,190,80,.28)';g.beginPath();g.ellipse(-5,0.1,12,1,0,0,TAU);g.fill();
    g.fillStyle='rgba(210,215,200,.45)';g.beginPath();g.moveTo(11,1.4);g.quadraticCurveTo(14,-1.6,18,-0.4);g.quadraticCurveTo(15,1.6,11,1.4);g.fill();g.strokeStyle='rgba(60,30,10,.7)';g.lineWidth=0.35;g.stroke();
    /* череп в луже */
    g.save();g.translate(-16,0.4);g.beginPath();g.ellipse(0,-1.5,2.3,2,0,Math.PI,TAU);g.lineTo(2.1,0.5);g.lineTo(-2.1,0.5);g.closePath();mobPath(g,'#d8c8a0',0,-1.4,2.4);g.fillStyle='#1a0a02';g.beginPath();g.ellipse(-0.9,-1.4,0.55,0.7,0,0,TAU);g.ellipse(0.9,-1.4,0.55,0.7,0,0,TAU);g.fill();g.fillRect(-0.9,-0.2,1.8,0.7);g.restore();
    /* дальняя рука: выбирается из мёда, тянется вверх-влево */
    {const ra=Math.sin(t*1.6+ph)+Math.sin(t*2.7+ph*2)*0.4,ex=-12+ra*1.9-sp*1.2-roll*1.6,ey=-24.6+sp*3+pulse*0.4+Math.cos(t*1.3+ph)*0.8-Math.max(0,-roll)*1.4;
      const h=lmHoneyArm(g,-8.4,-13.8,-14.4+ra*0.6,-17,ex,ey,3.2,2.6,'#b8884a');
      lmHoneyHand(g,h[0]+Math.cos(h[2])*1.2,h[1]+Math.sin(h[2])*1.2,h[2],2.1,'#c8985a',1.2+Math.sin(t*2.2+ph)*0.25+lmTwitch(t,ph+0.5,1.3)*0.5,'#4a2808');
      g.beginPath();g.ellipse(-8.4,-13.8,3.4,2.4,-0.6,0,TAU);g.fillStyle='rgba(150,84,14,.9)';g.fill();g.strokeStyle='rgba(255,214,130,.8)';g.lineWidth=0.7;g.beginPath();g.ellipse(-8.4,-13.8,3.4,2.4,-0.6,Math.PI*1.1,Math.PI*1.9);g.stroke();
      g.strokeStyle='#d88a14';g.lineWidth=1;g.lineCap='round';g.beginPath();g.moveTo(-10.4,-14.4);g.quadraticCurveTo(-11.4,-12,-11,-9);g.stroke();
      lmHoneyDrop(g,-11,-7.4+Math.sin(t*2+ph)*0.5,0.7,'#e89a1c',true);}
    /* тело-курган */
    const body=()=>{g.beginPath();g.moveTo(-18.4,0.2);g.quadraticCurveTo(-19.2,-5,-14.6,-8.2);g.quadraticCurveTo(-15.4,-13.4+bump,-9,-14.6);g.quadraticCurveTo(-7.6,-19.4,-1.2,-19.2+pulse*0.3);
      g.quadraticCurveTo(5,-21.4,8,-16.2);g.quadraticCurveTo(14.6,-15.8,14.8,-9.4);g.quadraticCurveTo(19.4,-7.2,18.6,0.2);g.bezierCurveTo(10,2.8,-10,2.8,-18.4,0.2);g.closePath();};
    body();
    {const gr=g.createRadialGradient(-4,-14,1,0,-8,22);gr.addColorStop(0,'#d08a22');gr.addColorStop(0.35,'#8a4a0c');gr.addColorStop(0.75,'#4a2208');gr.addColorStop(1,'#2a1204');g.fillStyle=gr;g.fill();}
    g.strokeStyle='#1a0a02';g.lineWidth=1.25;g.lineJoin='round';g.stroke();
    g.save();body();g.clip();
    /* глубина: тёмные утопленники и светлая муть позади */
    g.fillStyle='rgba(255,170,60,.22)';g.beginPath();g.ellipse(1,-9,14,7,0,0,TAU);g.fill();
    const fc=(arr)=>{for(const [x,y,s,r,dp,mo,gl] of arr)lmHoneyFace(g,x+Math.sin(t*0.9+x)*0.8,y+Math.sin(t*1.1+y*0.7)*0.8,s*(1+Math.sin(t*1.7+x)*0.03),r+Math.sin(t*0.8+x*2)*0.12+lmTwitch(t,x*0.1,0.5)*0.15,dp,mo,gl);};
    fc([[-12.4,-6,3.6,-0.4,1,2],[12.4,-5.2,3.4,0.5,1,0],[2.6,-14.6,3.4,0.1,1,1],[-3.6,-3.6,3,-0.2,1,0]]);
    g.fillStyle='rgba(150,76,10,.42)';g.fillRect(-22,-26,44,30);
    /* глубокая рука-тень */
    g.save();g.translate(5,-4);g.rotate(-1.9);g.strokeStyle='rgba(90,48,14,.8)';g.lineWidth=2;g.lineCap='round';g.beginPath();g.moveTo(0,0);g.lineTo(0,-6);g.stroke();for(let i=0;i<4;i++){g.beginPath();g.moveTo(0,-6);g.lineTo((i-1.5)*0.9,-8.8-(i%3?0:0.6));g.stroke();}g.restore();
    fc([[-7.6,-11.6,4.4,-0.5,0.5,1],[7.6,-12,3.8,0.5,0.5,2],[-1.6,-7.4,4.2,0.1,0.5,0],[-15,-3.4,3.2,-0.9,0.5,0]]);
    g.fillStyle='rgba(176,92,12,.26)';g.fillRect(-22,-26,44,30);
    /* ладони давят изнутри: плёнка натянута на пальцах */
    for(const [x,y,r2] of [[-4,-15.6,-0.5],[11.4,-12.4,0.5],[-13,-9.6,-0.9]]){
      const pr=Math.max(0,Math.sin(t*1.1+x*0.9));/* ладонь то давит на плёнку, то отпускает */
      g.save();g.translate(x+pr*0.5,y-pr*1.2);g.rotate(r2+Math.sin(t*1.7+x)*0.16);g.scale(1+pr*0.1,1+pr*0.1);
      g.fillStyle='rgba(205,155,90,.82)';g.beginPath();g.ellipse(0,0,1.9,2.3,0,0,TAU);g.fill();
      g.fillStyle='rgba(60,30,8,.6)';for(let i=0;i<4;i++){g.beginPath();g.ellipse((i-1.5)*1.05,-2.7-(i%3?0.2:-0.4),0.46,1.2,0,0,TAU);g.fill();}
      g.fillStyle='rgba(225,184,118,.82)';for(let i=0;i<4;i++){g.beginPath();g.ellipse((i-1.5)*1.05-0.1,-2.8-(i%3?0.2:-0.4),0.36,1.05,0,0,TAU);g.fill();}
      g.restore();}
    /* главное лицо у поверхности — спереди */
    lmHoneyFace(g,6.2,-6.4,5.6,0.04+bump*0.03,0.04,0,true);
    lmHoneyFace(g,-11.6,-4.2,3.6,-0.8,0.2,1,true);
    /* пасть главного лица: при плевке раскрывается */
    if(sp>0.05){g.fillStyle='#120602';g.beginPath();g.ellipse(6.2,-3.2,2.4+sp*0.9,1.6+sp*2.8,0.04,0,TAU);g.fill();g.fillStyle='rgba(255,190,80,.4)';g.beginPath();g.ellipse(6.2,-1.4+sp,1.6,0.8,0,0,TAU);g.fill();}
    g.fillStyle='rgba(120,56,8,.14)';g.fillRect(-22,-26,44,30);
    /* пузыри газа, поднимающиеся и лопающиеся */
    for(let i=0;i<4;i++){const f=((t*0.4+i*0.27+ph)%1),x=-12+i*8+Math.sin(i*2.4)*2,y=-2-f*15,r=0.6+0.7*(1-Math.abs(f-0.5)*2)*0.9;
      g.strokeStyle='rgba(255,220,140,'+(0.8*(1-f*0.5))+')';g.lineWidth=0.35;g.fillStyle='rgba(255,230,170,.18)';g.beginPath();g.arc(x,y,r,0,TAU);g.fill();g.stroke();}
    /* тёмное нутро снизу, блики мокрой плёнки сверху */
    g.fillStyle='rgba(20,8,2,.5)';g.beginPath();g.ellipse(0,2.4,20,5,0,0,TAU);g.fill();
    g.strokeStyle='rgba(255,226,150,.75)';g.lineWidth=1.6;g.lineCap='round';g.beginPath();g.moveTo(-15.6,-9);g.quadraticCurveTo(-14.6,-14,-9.4,-15.2);g.moveTo(-7.2,-17.8);g.quadraticCurveTo(-4.6,-19.6,-1,-19);g.stroke();
    g.strokeStyle='rgba(255,236,180,.5)';g.lineWidth=0.7;g.beginPath();g.moveTo(8.6,-17);g.quadraticCurveTo(12.6,-15.4,13.8,-12);g.stroke();
    g.fillStyle='rgba(255,244,210,.85)';g.beginPath();g.ellipse(-12.2,-14,0.9,0.55,-0.6,0,TAU);g.ellipse(4.4,-19.4,0.8,0.5,-0.3,0,TAU);g.fill();
    g.restore();
    /* ближняя рука тянется вперёд к добыче (при плевке убирается) */
    {const ex=19.4-sp*5+Math.sin(ga)*2.6*mk+Math.sin(t*1.8+ph)*0.9,ey=-15.6+sp*2+Math.sin(t*1.8+ph)*1.4-Math.max(0,Math.cos(ga))*1.8*mk;
      const h=lmHoneyArm(g,11.2,-12.4,16,-13.6-sp,ex,ey,2.8,2.4,'#c8985a');
      lmHoneyHand(g,h[0]+Math.cos(h[2])*1.1,h[1]+Math.sin(h[2])*1.1,h[2],2.1,'#d8a868',1.1+Math.sin(t*2.6)*0.3+lmTwitch(t,ph,1.1)*0.5,'#4a2808');
      g.beginPath();g.ellipse(11.2,-12.4,3.4,2.4,0.4,0,TAU);g.fillStyle='rgba(138,74,14,.92)';g.fill();g.strokeStyle='rgba(255,214,130,.8)';g.lineWidth=0.7;g.beginPath();g.ellipse(11.2,-12.4,3.4,2.4,0.4,Math.PI*1.1,Math.PI*1.9);g.stroke();
      g.strokeStyle='#d88a14';g.lineWidth=0.9;g.lineCap='round';g.beginPath();g.moveTo(15.8,-11);g.quadraticCurveTo(16.2,-8,15.8,-5.4+Math.sin(t*2.4)*0.5);g.stroke();}
    /* пузыри на самой плёнке */
    for(const [x,y,r] of [[-14.6,-8.6,1.2],[13.4,-14.4,1.1],[16.6,-4.6,0.9]]){g.beginPath();g.arc(x,y,r,0,TAU);g.fillStyle='rgba(215,140,40,.7)';g.fill();g.strokeStyle='rgba(30,12,2,.9)';g.lineWidth=0.5;g.stroke();g.fillStyle='rgba(255,240,190,.85)';g.beginPath();g.arc(x-r*0.3,y-r*0.3,r*0.3,0,TAU);g.fill();}
    /* свисающие нити и капли с краёв */
    g.strokeStyle='#8a4a0c';g.lineWidth=1.1;g.lineCap='round';for(const [x,y,l] of [[-16.4,-2.6,3.4],[14.6,-1,4.2],[9,1.4,2.6]]){g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+0.4+Math.sin(t*1.5+x)*0.5,y+l*0.6,x+0.2+Math.sin(t*1.5+x)*0.9,y+l+Math.sin(t*2+x)*0.9);g.stroke();}
    /* плевок: из пасти тянется нить к комку с крохотным лицом внутри */
    if(sp>0.1){const gx=14+sp*4,gy=-4.6,gr=1.8+sp*2.6;
      g.strokeStyle='#8a4a0c';g.lineWidth=1.6*(1-sp*0.5)+0.4;g.beginPath();g.moveTo(10.6,-4.2);g.quadraticCurveTo(12.6,-4.4,gx-gr*0.7,gy);g.stroke();
      g.beginPath();g.arc(gx,gy,gr,0,TAU);mobPath(g,'#b86a10',gx,gy,gr);
      g.save();g.beginPath();g.arc(gx,gy,gr,0,TAU);g.clip();lmHoneyFace(g,gx+0.3,gy+0.2,gr*0.8,0.3,0.25,0,true);g.fillStyle='rgba(176,92,12,.3)';g.fillRect(gx-gr,gy-gr,gr*2,gr*2);g.restore();
      g.fillStyle='rgba(255,244,210,.85)';g.beginPath();g.ellipse(gx-gr*0.4,gy-gr*0.45,gr*0.28,gr*0.18,-0.6,0,TAU);g.fill();}
    lmRim(g,q=>{q.strokeStyle='rgba(255,224,150,.4)';q.lineWidth=0.9;q.lineCap='round';q.beginPath();q.moveTo(-18,-4);q.quadraticCurveTo(-18.4,-9,-14.6,-9);q.quadraticCurveTo(-14.4,-14,-9,-14.6);q.quadraticCurveTo(-7.6,-18.8,-1.4,-19);q.stroke();});
  }
  g.restore();
};
/* ---------- восковой страж ---------- */
/* два звена с изгибом: колено/локоть (back — вбок назад) */
function lmHoneyIK(hx,hy,fx,fy,l1,l2,back){
  const dx=fx-hx,dy=fy-hy,d=Math.min(l1+l2-0.01,Math.hypot(dx,dy)||0.01),a=Math.atan2(dy,dx);
  const c=Math.acos(clamp((l1*l1+d*d-l2*l2)/(2*l1*d),-1,1)),ka=a+(back?c:-c);
  return [hx+Math.cos(ka)*l1,hy+Math.sin(ka)*l1,hx+Math.cos(a)*d,hy+Math.sin(a)*d];
}
/* пластина-трапеция между двумя точками: объём, гребень, свет */
function lmHoneySeg(g,x0,y0,x1,y1,wa,wb,col,rim){
  const dx=x1-x0,dy=y1-y0,L=Math.hypot(dx,dy)||1,nx=-dy/L,ny=dx/L;
  g.beginPath();g.moveTo(x0+nx*wa/2,y0+ny*wa/2);g.lineTo(x1+nx*wb/2,y1+ny*wb/2);g.lineTo(x1-nx*wb/2,y1-ny*wb/2);g.lineTo(x0-nx*wa/2,y0-ny*wa/2);g.closePath();
  mobPath(g,col,(x0+x1)/2-nx*0.6,(y0+y1)/2-ny*0.6,L*0.62);
  if(rim){g.strokeStyle=rim;g.lineWidth=0.4;g.lineCap='round';g.beginPath();g.moveTo(x0+nx*wa*0.2,y0+ny*wa*0.2);g.lineTo(x1+nx*wb*0.2,y1+ny*wb*0.2);g.stroke();}
}
/* язык-капля воска, свисающий вниз: [x,y,длина,ширина] */
let lmHoneyDK=1;/* множитель длины потёков: в замахе Истины воск течёт сильнее */
function lmHoneyDrips(g,list,col,hi){
  for(const [x,y,l0,w] of list){const l=lmHoneyDK>1.001?l0*lmHoneyDK*(1+0.1*Math.sin(G.time*5+x*3)):l0;
    g.beginPath();
    if(l>3){const rb=w*1.05,cy=y+l-rb*0.2;g.moveTo(x-w,y);g.bezierCurveTo(x-w*0.8,y+l*0.4,x-w*0.46,y+l*0.55,x-w*0.46,cy-rb*0.7);g.arc(x,cy,rb,Math.PI*1.12,Math.PI*-0.12,true);g.bezierCurveTo(x+w*0.46,y+l*0.55,x+w*0.8,y+l*0.4,x+w,y);}
    else{g.moveTo(x-w,y);g.bezierCurveTo(x-w*0.9,y+l*0.55,x-w*0.62,y+l,x,y+l+w*0.3);g.bezierCurveTo(x+w*0.62,y+l,x+w*0.9,y+l*0.55,x+w,y);}
    g.closePath();
    g.fillStyle=col;g.fill();g.strokeStyle=shadeHex(col,-0.45);g.globalAlpha=0.6;g.lineWidth=0.4;g.lineJoin='round';g.stroke();g.globalAlpha=1;
    if(hi){g.strokeStyle=hi;g.lineWidth=0.4;g.lineCap='round';g.beginPath();g.moveTo(x-w*0.4,y+0.4);g.lineTo(x-w*0.35,y+l*0.85);g.stroke();}
    if(l>3){g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.arc(x-w*0.3,y+l-w*0.3,w*0.24,0,TAU);g.fill();}
  }
}
/* тёплая заливка воска: свет слева, тёплая тень справа (без серых краёв) */
function lmHoneyWaxFill(g,x0,x1,l,m,d,line){const gr=g.createLinearGradient(x0,0,x1,0);gr.addColorStop(0,l);gr.addColorStop(0.45,m);gr.addColorStop(1,d);g.fillStyle=gr;g.fill();if(line){g.strokeStyle=line;g.lineWidth=1.1;g.lineJoin='round';g.stroke();}}
/* шестиугольник-сота */
function lmHoneyHex(g,x,y,r,rot){g.beginPath();for(let i=0;i<6;i++){const a=rot+i/6*TAU;g.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);}g.closePath();}

LM_MODEL.lwaxknight=function(g,m,FY,t,T,st,k,wv,ph){
  const th=st==='thrust',melt=!!m.melt;
  /* поза: coil — замах (копьё отведено, присед, щит поднят), ext — выпад вперёд; всё плавно по k и времени выпада */
  const sm=u=>u*u*(3-2*u);
  if(th)m.lmKt=t;
  const rec=(!th&&st!=='windup'&&m.lmKt!==undefined)?clamp(1-(t-m.lmKt)/0.45,0,1):0;
  const tp=th?clamp(m.st/0.09,0,1):0,ext=th?sm(tp):sm(rec),coil=st==='windup'?sm(clamp(k,0,1)):th?1-sm(tp):0,wu=coil;
  const br=Math.sin(t*2.2+ph),fl=Math.sin(t*14+ph),fl2=Math.sin(t*9.3+ph*2),fl3=Math.sin(t*21+ph*3);
  const trem=st==='windup'&&k>0.6?Math.sin(t*46)*0.35*(k-0.6)/0.4:0;/* дрожь натянутого замаха */
  /* ход: тело подскакивает на шагах (lmBob), чуть клонится вперёд; копьё и щит качаются навстречу шагу; в покое — дыхание и редкий осмотр */
  const mk=m.mk||0,ga=lmGait(m,19),gs=Math.sin(ga)*mk,gc=Math.cos(ga)*mk;
  const calm=1-Math.max(coil,ext),fid=lmFidget(t,ph,5.2)*calm,tw=T?lmTwitch(t,ph,0.6)*calm:0,tw2=T?lmTwitch(t,ph+0.4,0.9)*calm:0;
  const bre=(Math.sin(t*2.8+ph)+Math.sin(t*4.1+ph*1.7)*0.3)/1.3;/* неровное дыхание */
  const lx=-coil*9+ext*12+trem+gs*1.6-fid*0.8+tw*0.8+Math.sin(t*1.1+ph)*0.7*calm,bl=(Math.sin(m.anim*1.1+ph*7)>0.985)?0.2:1;
  const sw=Math.sin(t*1.3+ph*2)*1.0*calm+gc*0.5,tsw=-gs*1.0+Math.sin(t*2.1+ph)*0.6*calm;/* sw — копьё, tsw — подол качается навстречу шагу *//* покачивание копья вверх-вниз */
  const cr=coil*2.8+ext*1.4-Math.abs(gc)*1.0+bre*0.2,sx=-coil*2.4+ext*4.5+mk*1.1+Math.sin(t*0.7+ph)*0.8*calm,rot=-coil*0.2+ext*0.17+mk*0.06+bre*0.012+Math.sin(t*1.7+ph*1.3)*0.03*calm;
  lmHoneyDK=1+(T?wu*0.45:0);
  /* палитра: золото лат и воск */
  const AG=T?'#b8922e':'#f2c458',AGL=T?'#e0bc58':'#ffe9a0',AGD=T?'#5a4214':'#b8862a';
  const WX=T?'#e6d48c':'#f6e2b0',WXL=T?'#f4e8b8':'#fff8e0',WXD=T?'#9a8446':'#c8a868';
  g.save();g.translate(0,FY);
  /* лужа воска у ног в Истине */
  if(T){g.beginPath();g.ellipse(0,0.6,15,2.6,0,0,TAU);g.fillStyle='#8a7648';g.fill();g.strokeStyle='#3a2e14';g.lineWidth=0.8;g.stroke();
    g.fillStyle='rgba(240,228,180,.45)';g.beginPath();g.ellipse(-3,0,9,0.9,0,0,TAU);g.fill();
    g.fillStyle='#b8a470';for(const [x,y,r] of [[10,1.4,1.2],[-12,1.6,1],[4,2,0.8]]){g.beginPath();g.arc(x,y,r,0,TAU);g.fill();g.strokeStyle='#3a2e14';g.lineWidth=0.4;g.stroke();}}
  /* ---- ноги ---- */
  const leg=(ox,far)=>{
    const s=lmFoot(m,far?Math.PI:0,19,2.6),fx=ox+s[0]*calm+(far?-0.6-coil*3.8-ext*2.4:0.8+coil*3.4+ext*6.5),fy=-0.8+s[1]*(0.3+0.7*calm);
    const c=far?-0.28:0,hx=ox+sx*0.8,hy=-11.5+cr,[kx,ky,ex,ey]=lmHoneyIK(hx,hy,fx,fy-1.2,5.4,5.4,false);
    if(T){
      /* гнилая нога: серое мясо, оголённая кость, обломки лат */
      const fc=far?'#5a5a48':'#8a8670';
      lmLimb(g,hx,hy,fx,fy-1.2,5.4,5.4,false,4.4,3.2,fc);
      g.strokeStyle=far?'#a89a80':'#d8cdb0';g.lineWidth=1;g.lineCap='round';g.beginPath();g.moveTo(kx,ky);g.lineTo(ex,ey);g.stroke();
      g.fillStyle=far?'#a89a80':'#e8dcc0';g.beginPath();g.arc(kx,ky,1.5,0,TAU);g.fill();g.beginPath();g.arc(ex,ey,1.1,0,TAU);g.fill();
      if(!far){lmHoneySeg(g,hx-0.2,hy+0.6,kx+0.2,ky-0.6,5.2,4.2,AG,'rgba(255,230,150,.4)');
        g.strokeStyle='#1a1408';g.lineWidth=0.5;g.beginPath();g.moveTo(hx-1,hy+1.4);g.lineTo(hx+0.4,hy+3);g.lineTo(hx-0.4,hy+4.6);g.stroke();
        lmHoneyDrips(g,[[hx+1.2,hy+3.4,3.6,0.7],[hx-1.4,hy+3.6,2.4,0.55]],WX,'rgba(255,250,220,.6)');}
    }else{
      lmHoneySeg(g,hx,hy,kx,ky,5,4.4,far?shadeHex(AG,-0.26):AG,far?null:AGL);
      lmHoneySeg(g,kx,ky,ex,ey,4.4,3.6,far?shadeHex(AG,-0.3):shadeHex(AG,0.03),far?null:AGL);
      /* наколенник с сотой */
      g.beginPath();g.arc(kx+0.6,ky,2.5,0,TAU);mobPath(g,far?shadeHex(AG,-0.22):shadeHex(AG,0.08),kx,ky-0.6,2.6);
      g.strokeStyle=far?'rgba(80,50,10,.5)':'rgba(120,76,10,.7)';g.lineWidth=0.4;lmHoneyHex(g,kx+0.6,ky,1.2,0.5);g.stroke();
      if(!far){g.fillStyle='rgba(255,246,200,.7)';g.beginPath();g.arc(kx-0.2,ky-1.2,0.5,0,TAU);g.fill();
        g.fillStyle='#8a5a10';for(const q of [0.3,0.7]){g.beginPath();g.arc(hx+0.4,hy+(ky-hy)*q+0.4,0.4,0,TAU);g.fill();g.beginPath();g.arc(kx+(ex-kx)*q,ky+(ey-ky)*q,0.35,0,TAU);g.fill();}}}
    /* ступня: сабатон с носком */
    g.beginPath();g.moveTo(ex-2.8,ey-0.8);g.quadraticCurveTo(ex-3,ey+1.8,ex-2.6,0.2);g.lineTo(ex+4.6,0.2);g.quadraticCurveTo(ex+6,-0.6,ex+4.2,-1.8);g.quadraticCurveTo(ex+2,-2.6,ex+1.6,ey-0.8);g.closePath();
    mobPath(g,far?shadeHex(T?'#5a4a2a':'#b8862a',-0.15):(T?'#6a5a34':'#d49a2a'),ex+1,-1.4,5);
    g.strokeStyle='rgba(255,236,170,.5)';g.lineWidth=0.35;g.beginPath();g.moveTo(ex-1,-0.6);g.lineTo(ex+3.6,-0.8);g.stroke();
  };
  leg(-3,true);
  leg(3.4,false);
  /* верх тела: приседает и изгибается в пояснице вокруг бёдер */
  g.save();g.translate(sx,cr);g.translate(0,-12);g.rotate(rot);g.translate(0,12);
  /* ---- копьё и дальняя рука ---- */
  g.save();g.translate(lx+10.4,-18.4+sw);g.rotate(-coil*0.12+ext*0.03+sw*0.025+tw2*0.05);g.translate(-10.4,0);
  /* древко: медовое дерево с волокном */
  g.beginPath();g.moveTo(-8.6,-1);g.lineTo(14.4,-0.9);g.lineTo(14.4,0.9);g.lineTo(-8.6,1);g.closePath();mobPath(g,T?'#6a4a20':'#b8842c',3,-1,9);
  g.strokeStyle='rgba(60,30,6,.45)';g.lineWidth=0.3;g.beginPath();g.moveTo(-7,-0.2);g.lineTo(13,-0.3);g.moveTo(-5,0.5);g.lineTo(9,0.4);g.stroke();
  g.fillStyle=T?'#4a3a18':'#8a5a10';g.fillRect(-9.4,-1.3,1.6,2.6);
  /* наконечник: витая восковая свеча-пика */
  g.beginPath();g.moveTo(13.4,-3.6);g.quadraticCurveTo(21.5,-2.6,T?26.4:29,T?-0.4:0);g.quadraticCurveTo(T?22:21.5,2.6,13.4,3.6);g.closePath();
  lmHoneyWaxFill(g,13,29,T?'#e8dcb0':'#fffaf0',T?'#d0c088':'#ffe8b0',T?'#a89860':'#d8a050',T?'#3a2e14':'#8a6420');
  g.save();g.clip();
  g.fillStyle=T?'rgba(60,44,20,.38)':'rgba(200,150,60,.4)';g.beginPath();g.moveTo(13,0.3);g.lineTo(30,0.6);g.lineTo(30,5);g.lineTo(13,5);g.fill();
  g.strokeStyle=T?'rgba(50,36,14,.55)':'rgba(190,130,40,.6)';g.lineWidth=0.5;for(let i=0;i<5;i++){const x=14.6+i*3;g.beginPath();g.moveTo(x,-4);g.quadraticCurveTo(x+1.8,0,x-0.6,4.4);g.stroke();}
  g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=0.5;g.beginPath();g.moveTo(14.4,-2.4);g.quadraticCurveTo(21,-1.8,27,-0.4);g.stroke();
  g.restore();
  /* золотое кольцо у основания и лента */
  g.beginPath();g.moveTo(12.4,-3.2);g.lineTo(14.4,-3.6);g.lineTo(14.4,3.6);g.lineTo(12.4,3.2);g.closePath();mobPath(g,AG,13,0,3.6);
  const rb=Math.sin(t*6+ph);g.strokeStyle=T?'#6a4a3a':'#ff9a30';g.lineWidth=1.2;g.lineCap='round';
  g.beginPath();g.moveTo(12.6,2.4);g.quadraticCurveTo(10.6,5+rb*0.8,11.6+rb,8.4);g.stroke();g.beginPath();g.moveTo(13,2.6);g.quadraticCurveTo(14.4,5.6,13.4+rb*1.2,9.2);g.stroke();
  if(T){
    /* острие обломано, с острия и с древка свисают капли */
    g.fillStyle='#c8b888';g.beginPath();g.moveTo(26.2,-0.8);g.lineTo(29.2,1.4);g.lineTo(26.6,1);g.fill();g.strokeStyle='#3a2e14';g.lineWidth=0.5;g.stroke();
    lmHoneyDrips(g,[[17,2.6,5,0.8],[21.6,1.8,3.4,0.6],[24.4,0.9,5.6,0.5]],WX,'rgba(255,250,224,.6)');
    g.strokeStyle='rgba(30,20,8,.8)';g.lineWidth=0.5;g.beginPath();g.moveTo(15.6,-3);g.lineTo(17.4,-0.6);g.lineTo(16.2,1.4);g.stroke();
    /* насаженный клочок крыла пчелы */
    g.fillStyle='rgba(210,215,190,.55)';g.beginPath();g.moveTo(2,0.8);g.quadraticCurveTo(0,6,4,8);g.quadraticCurveTo(6,4,5,0.8);g.closePath();g.fill();g.strokeStyle='rgba(60,30,10,.7)';g.lineWidth=0.35;g.stroke();
  }
  g.restore();
  /* дальняя рука: наплечник, предплечье, кулак на древке */
  {const sx=-3.4,sy=-24.4,fx=lx+10.4,fy=-18.4+sw,[ex,ey]=lmHoneyIK(sx,sy,fx,fy,8.4,8.4,true);
    const ac=T?'#6a6a52':shadeHex(AG,-0.3);
    if(T){const r=lmLimb(g,sx,sy,fx,fy,8.4,8.4,true,3.4,2.4,'#5a5a4a');g.strokeStyle='#b8ae92';g.lineWidth=0.9;g.lineCap='round';g.beginPath();g.moveTo(sx,sy);g.lineTo(r[2],r[3]);g.lineTo(fx-0.6,fy);g.stroke();
      g.fillStyle='#d8cdb0';g.beginPath();g.arc(r[2],r[3],1.1,0,TAU);g.fill();lmHoneySeg(g,sx+0.4,sy+0.6,r[2]-0.4,r[3]-0.4,4.2,3.6,shadeHex(AG,-0.3),null);}
    else{lmHoneySeg(g,sx,sy,ex,ey,3.8,3.4,ac,null);lmHoneySeg(g,ex,ey,fx,fy,3.4,3,shadeHex(ac,0.04),null);}
    if(!T){g.beginPath();g.arc(ex,ey,1.7,0,TAU);mobPath(g,ac,ex,ey,1.8);}
    g.beginPath();g.ellipse(fx+0.4,fy,2.5,2.1,0,0,TAU);mobPath(g,T?'#c8c0a4':shadeHex(AG,-0.18),fx,fy-0.6,2.5);
    g.strokeStyle=T?'rgba(40,30,16,.7)':'rgba(100,60,6,.6)';g.lineWidth=0.35;for(const q of [-0.7,0.1,0.9]){g.beginPath();g.moveTo(fx-0.2+q*0.2,fy-1.9);g.lineTo(fx+q*0.4-0.2,fy+1.9);g.stroke();}}
  /* ---- торс ---- */
  const bob=bre*0.6;
  g.save();g.translate(0,bob*0.5);
  /* дыхание: грудь чуть раздувается от пояса */
  g.translate(0,-13);g.scale(1+0.02*bre,1+0.04*bre);g.translate(0,13);
  /* набедренные пластины-юбка */
  if(T){g.beginPath();g.moveTo(-6,-13);g.lineTo(6.8,-13);g.lineTo(6.2+tsw,-9.4);g.lineTo(4.4+tsw,-8);g.lineTo(3.6+tsw,-9.6);g.lineTo(1.4+tsw,-7.6);g.lineTo(-1+tsw,-9.6);g.lineTo(-3.4+tsw,-8);g.lineTo(-6.2+tsw,-10);g.closePath();mobPath(g,shadeHex(AG,-0.1),0,-11,7);}
  else{for(let i=0;i<4;i++){const x=-5.6+i*3.5;g.beginPath();g.moveTo(x,-13.4);g.lineTo(x+3.7,-13.4);g.lineTo(x+3.3+tsw,-8.4+(i%2)*0.5);g.quadraticCurveTo(x+1.8+tsw,-7.4,x+0.3+tsw,-8.4+(i%2)*0.5);g.closePath();mobPath(g,i%2?shadeHex(AG,-0.08):AG,x+1.4,-11,3.6);}}
  /* нагрудник */
  g.beginPath();g.moveTo(-6.8,-26);g.quadraticCurveTo(-8,-19,-6,-13);g.lineTo(6.2,-13);g.quadraticCurveTo(8.2,-19,7.6,-26);g.quadraticCurveTo(0.4,-28.6,-6.8,-26);g.closePath();
  mobPath(g,AG,-2,-21,11);
  g.save();g.clip();
  if(!T){
    /* сотовый узор рельефом */
    g.strokeStyle='rgba(130,84,10,.55)';g.lineWidth=0.45;
    for(let r=0;r<3;r++)for(let c=0;c<4;c++){const x=-4.8+c*3.4+(r%2)*1.7,y=-23.6+r*3.1;lmHoneyHex(g,x,y,1.75,0.52);g.stroke();}
    g.strokeStyle='rgba(255,244,190,.5)';g.lineWidth=0.35;for(let r=0;r<3;r++)for(let c=0;c<4;c++){const x=-4.8+c*3.4+(r%2)*1.7,y=-23.6+r*3.1;g.beginPath();g.arc(x,y,1.75,Math.PI*1.05,Math.PI*1.5);g.stroke();}
    g.strokeStyle='rgba(255,246,200,.8)';g.lineWidth=0.7;g.beginPath();g.moveTo(2.8,-26.4);g.quadraticCurveTo(4.2,-19.6,3,-13.6);g.stroke();
    g.fillStyle='rgba(255,246,200,.35)';g.beginPath();g.ellipse(-4.6,-22,1.6,5,0.1,0,TAU);g.fill();
    g.fillStyle='rgba(110,60,0,.28)';g.beginPath();g.ellipse(2,-12.4,9,2.6,0,0,TAU);g.fill();
  }else{
    /* рваная дыра в груди: рёбра на тёмном */
    g.fillStyle='#1a0a08';g.beginPath();g.moveTo(1,-24);g.lineTo(5.6,-25);g.lineTo(8.4,-21.4);g.lineTo(6.6,-18.6);g.lineTo(7.8,-15.6);g.lineTo(4,-14);g.lineTo(1.6,-16.6);g.lineTo(-0.4,-19);g.closePath();g.fill();
    g.strokeStyle='#d8cdb0';g.lineWidth=0.9;g.lineCap='round';for(let i=0;i<3;i++){g.beginPath();g.moveTo(1.4+i*0.1,-22.4+i*3);g.quadraticCurveTo(5,-23+i*3,8,-21.4+i*3);g.stroke();}
    g.strokeStyle='#a89a80';g.lineWidth=0.35;for(let i=0;i<3;i++){g.beginPath();g.moveTo(1.6,-21.8+i*3);g.quadraticCurveTo(5,-22.4+i*3,7.6,-20.8+i*3);g.stroke();}
    g.fillStyle='rgba(120,20,16,.6)';g.beginPath();g.ellipse(4,-18,1.4,1,0,0,TAU);g.fill();
    g.strokeStyle='#1a1408';g.lineWidth=0.6;g.beginPath();g.moveTo(-3,-26);g.lineTo(-4.4,-21);g.lineTo(-3,-18);g.lineTo(-4.6,-13.6);g.stroke();
    g.strokeStyle='rgba(255,230,150,.35)';g.lineWidth=0.4;for(let r=0;r<2;r++)for(let c=0;c<2;c++){lmHoneyHex(g,-5.4+c*3.2+(r%2)*1.6,-24+r*3,1.7,0.52);g.stroke();}
    g.fillStyle='rgba(20,12,4,.35)';g.beginPath();g.ellipse(2,-12.4,9,2.6,0,0,TAU);g.fill();
  }
  g.restore();
  /* воротник-горжет и пояс */
  g.beginPath();g.ellipse(0.2,-26.4,6.6,1.9,0,0,TAU);mobPath(g,shadeHex(AG,-0.05),0,-27,6);
  g.beginPath();g.moveTo(-7,-15);g.lineTo(7.2,-15);g.lineTo(7,-12.8);g.lineTo(-6.8,-12.8);g.closePath();mobPath(g,T?'#4a3418':'#8a5a22',0,-14,7);
  g.fillStyle=T?'#6a5018':AGL;lmHoneyHex(g,2.6,-13.9,1.7,0.52);g.fill();g.strokeStyle='#3a2408';g.lineWidth=0.4;g.stroke();
  /* восковая накидка-табард по центру */
  g.beginPath();g.moveTo(-1.2,-13);g.lineTo(5.4,-13);g.lineTo(5.2+tsw*1.3,-8.6);g.quadraticCurveTo(2+tsw*1.3,-7+Math.abs(tsw)*0.3,-0.8+tsw*1.3,-8.8);g.closePath();lmHoneyWaxFill(g,-1.2,5.4,'#fffaf0','#ffecb8',T?'#c8aa58':'#e8b868','#8a6420');
  g.strokeStyle='rgba(150,110,40,.4)';g.lineWidth=0.35;g.beginPath();g.moveTo(1.6,-12.6);g.lineTo(1.8,-8.4);g.moveTo(3.6,-12.6);g.lineTo(3.8,-8.4);g.stroke();
  if(!T){lmHoneyDrips(g,[[-0.2,-9.4,1.6,0.5],[4.4,-9,2.2,0.55]],WX,'rgba(255,255,255,.6)');}
  g.restore();
  /* ---- голова: свеча ---- */
  const hr=Math.sin(t*0.6+ph)*0.035*calm+fid*Math.sin(ph*5)*0.14+Math.sin(t*2.3+ph)*0.025*calm+tw*0.13+mk*0.03-gs*0.012;/* голова поворачивается, оглядывается */
  g.save();g.translate(0,bob+(T?-2:0));g.translate(0,-27);g.rotate(hr);g.translate(0,27);
  const hx0=0.3;
  if(!T){
    /* корпус свечи */
    g.beginPath();g.moveTo(-5.2,-27);g.lineTo(-5.4,-36);g.quadraticCurveTo(-5.4,-38.4,-2,-38.4);g.lineTo(3,-38.4);g.quadraticCurveTo(5.8,-38.4,5.8,-36);g.lineTo(5.6,-27);g.quadraticCurveTo(0,-25.8,-5.2,-27);g.closePath();
    lmHoneyWaxFill(g,-5.4,5.8,'#fffdf0','#ffecb4','#e6b25a','#8a6420');
    g.save();g.clip();
    g.fillStyle='rgba(190,120,30,.25)';g.beginPath();g.ellipse(5.4,-31,2.4,7,0,0,TAU);g.fill();g.fillStyle='rgba(150,90,20,.22)';g.beginPath();g.ellipse(0,-26.4,7,1.8,0,0,TAU);g.fill();
    g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.ellipse(-3.4,-33,1.1,4.4,0,0,TAU);g.fill();
    g.restore();
    /* золотой ободок-забрало с прорезями-глазами */
    g.beginPath();g.moveTo(-5.4,-34.6);g.lineTo(5.9,-34.6);g.lineTo(5.8,-30.6);g.lineTo(-5.3,-30.6);g.closePath();mobPath(g,shadeHex(AG,-0.04),0,-32.6,6);
    g.fillStyle='#2a1604';g.beginPath();g.moveTo(-1.6,-33.6);g.lineTo(2.4,-33.6);g.lineTo(2.4,-31.6*1+0.4);g.lineTo(-1.6,-31.6+0.4);g.closePath();g.fill();
    for(const [ex,ew] of [[-1.2,2.2],[3.2,2.2]]){const h=1.5*bl+(wu>0.3?-0.3:0);g.fillStyle=wu>0.3?'#fff2b0':'#ffb83a';g.fillRect(ex,-33.3,ew,h);g.fillStyle='rgba(255,255,230,.9)';g.fillRect(ex+0.2,-33.2,ew*0.6,h*0.4);}
    g.strokeStyle='rgba(255,246,200,.7)';g.lineWidth=0.35;g.beginPath();g.moveTo(-5,-34.4);g.lineTo(5.6,-34.4);g.stroke();
    g.fillStyle='#8a5a10';for(const x of [-4,0,4.6]){g.beginPath();g.arc(x,-30.6+0.3,0.4,0,TAU);g.fill();}
    /* верхний край: лужица воска, фитиль */
    g.beginPath();g.ellipse(0.2,-38.4,5.3,1.5,0,0,TAU);{const pg=g.createRadialGradient(-1,-38.8,0.3,0.2,-38.4,5.4);pg.addColorStop(0,'#fff6c8');pg.addColorStop(1,'#f4cc66');g.fillStyle=pg;g.fill();}g.strokeStyle='#b88a30';g.lineWidth=0.5;g.stroke();
    g.fillStyle='rgba(255,252,226,.9)';g.beginPath();g.ellipse(-1.6,-38.8,2,0.4,0,0,TAU);g.fill();
    /* потёки по бокам (в таянии — длиннее) */
    if(melt)lmHoneyDrips(g,[[-4.4,-38,7,0.9],[4.6,-37.8,9,0.9],[-1,-37.6,4,0.7]],'#fff2c4','rgba(255,255,255,.7)');
    g.strokeStyle='#2a2020';g.lineWidth=0.7;g.beginPath();g.moveTo(0.2,-38.8);g.quadraticCurveTo(0.6,-40.2,0.2,-41);g.stroke();
  }else{
    /* оплывшая свеча-капюшон: тяжёлые складки воска, лицо трупа под ним */
    /* лицо */
    g.beginPath();g.moveTo(-3,-27.4);g.quadraticCurveTo(-5,-33,-2.4,-37);g.quadraticCurveTo(2,-39,5.2,-36);g.quadraticCurveTo(7.2,-32,5,-27.4);g.quadraticCurveTo(0,-25.6,-3,-27.4);g.closePath();
    mobPath(g,'#98987a',1.2,-33,7);
    g.save();g.clip();
    g.fillStyle='rgba(30,36,20,.38)';g.beginPath();g.ellipse(-1,-30,3,4,0,0,TAU);g.fill();g.fillStyle='rgba(140,60,50,.28)';g.beginPath();g.ellipse(5.6,-31,2,3.6,0,0,TAU);g.fill();
    /* глазницы: левая пустая, правая — выпученная, с тлеющей точкой */
    g.fillStyle='#120804';g.beginPath();g.ellipse(0,-33,1.8,2.2,0.2,0,TAU);g.fill();
    g.fillStyle='#1a0a06';g.beginPath();g.ellipse(4,-33.2,1.7,2,-0.15,0,TAU);g.fill();
    g.fillStyle='#e8dcc0';g.beginPath();g.arc(4,-33.2,1.15*bl+0.01,0,TAU);g.fill();g.fillStyle='rgba(190,30,26,.9)';g.beginPath();g.arc(4.2,-33.1,0.7*bl,0,TAU);g.fill();g.fillStyle='#ff4a2a';g.beginPath();g.arc(4.3,-33.2,0.32*bl,0,TAU);g.fill();
    g.fillStyle='rgba(255,60,30,.85)';g.beginPath();g.arc(0.2,-33,0.26,0,TAU);g.fill();
    if(wu>0.05){mobGlow(g,4.2,-33.2,3.6+wu*2,'#ff3a1a',0.55*wu);mobGlow(g,0.2,-33,3+wu*1.6,'#ff3a1a',0.4*wu);}
    /* нос-провал, рот: отвисшая челюсть с гнилыми зубами */
    g.fillStyle='#2a1208';g.beginPath();g.moveTo(2.2,-31.4);g.lineTo(1.4,-29.8);g.lineTo(3,-29.8);g.closePath();g.fill();
    const jw=1.4+wu*2.8+Math.max(0,br)*0.3+Math.abs(tw2)*1.5+Math.max(0,Math.sin(t*1.3+ph*3))*0.35;
    g.fillStyle='#120504';g.beginPath();g.moveTo(-0.6,-29.6);g.lineTo(5.4,-29.8);g.lineTo(4.8,-29.2+jw);g.quadraticCurveTo(2.2,-27.6+jw*1.1,-0.2,-29.0+jw);g.closePath();g.fill();
    if(wu>0.05){g.fillStyle='rgba(255,64,26,'+(0.65*wu)+')';g.beginPath();g.ellipse(2.4,-28.4+jw*0.62,2.3,jw*0.42+0.2,0,0,TAU);g.fill();}
    g.fillStyle='#b8a878';for(let i=0;i<5;i++){g.beginPath();g.moveTo(-0.2+i*1.2,-29.7);g.lineTo(0.3+i*1.2,-28.4-(i%2)*0.4);g.lineTo(0.8+i*1.2,-29.7);g.fill();}
    g.fillStyle='#9a8a5a';for(let i=0;i<4;i++){g.beginPath();g.moveTo(0.2+i*1.3,-29.1+jw);g.lineTo(0.7+i*1.3,-30.1+jw-(i%2)*0.4);g.lineTo(1.2+i*1.3,-29.1+jw);g.fill();}
    g.fillStyle='#8a4a44';g.beginPath();g.ellipse(2.4,-28.8+jw,1.5,0.5,0,0,TAU);g.fill();
    g.strokeStyle='rgba(235,222,170,.7)';g.lineWidth=0.35;g.beginPath();g.moveTo(1.4,-28.4+jw);g.quadraticCurveTo(1.2,-26+jw+Math.sin(t*3)*0.3,1.6,-24.4+jw);g.stroke();
    /* впалые щёки и жилки на лице */
    g.fillStyle='rgba(30,36,18,.35)';g.beginPath();g.ellipse(-1.6,-29.4,1.4,2.6,0.3,0,TAU);g.fill();
    g.strokeStyle='rgba(110,40,50,.5)';g.lineWidth=0.3;g.beginPath();g.moveTo(5,-35.6);g.quadraticCurveTo(6,-34,5.2,-32.4);g.moveTo(-1.4,-36.4);g.quadraticCurveTo(-2.4,-35,-2,-33.6);g.stroke();
    g.restore();
    g.strokeStyle='rgba(255,245,200,.35)';g.lineWidth=0.5;g.beginPath();g.moveTo(-3,-35);g.quadraticCurveTo(-2.4,-37,0,-37.6);g.stroke();
    /* слёзы воска по щекам */
    lmHoneyDrips(g,[[4.8,-31.4,4.6,0.6]],WX,'rgba(255,250,224,.6)');
    /* капюшон-колпак: оплывшая верхушка, нависает слева и сзади */
    g.beginPath();g.moveTo(-6.6,-26.4);g.quadraticCurveTo(-9,-33,-6,-38);g.quadraticCurveTo(-3.4,-42,1.4,-40.6);g.quadraticCurveTo(4.6,-39.6,5.6,-37.2);g.quadraticCurveTo(2,-36.6,-0.4,-36);g.quadraticCurveTo(-3.6,-35,-3.8,-31);g.quadraticCurveTo(-4.4,-28,-3,-26.4);g.closePath();
    mobPath(g,WX,-3,-34,9);
    g.save();g.clip();g.strokeStyle='rgba(90,72,30,.5)';g.lineWidth=0.5;g.beginPath();g.moveTo(-6,-39);g.quadraticCurveTo(-6.6,-33,-5,-28);g.moveTo(-3,-40.6);g.quadraticCurveTo(-4,-35,-3.4,-31);g.stroke();
    g.fillStyle='rgba(255,252,230,.55)';g.beginPath();g.ellipse(-4.8,-37,1.4,2.4,0.4,0,TAU);g.fill();g.restore();
    /* обугленный погнутый фитиль без пламени и дым */
    g.strokeStyle='#201410';g.lineWidth=0.8;g.lineCap='round';g.beginPath();g.moveTo(0,-40.6);g.quadraticCurveTo(0.4,-43,3,-43.4);g.stroke();
    g.fillStyle='rgba(255,70,24,'+(0.5+0.4*fl)+')';g.beginPath();g.arc(3.1,-43.4,0.42,0,TAU);g.fill();
    for(let i=0;i<4;i++){const f=(t*0.7+i*0.25)%1;g.fillStyle='rgba(170,162,146,'+(0.5*(1-f))+')';g.beginPath();g.arc(3.2+Math.sin(f*7+i*2)*1.4,-44-f*8,0.5+f*1.1,0,TAU);g.fill();}
    /* потёки капюшона на плечо и грудь */
    lmHoneyDrips(g,[[-6.8,-31,7,1.1],[-4.4,-28.6,9.6,1.2],[-1.6,-27.6,6.2,0.9]],WX,'rgba(255,252,224,.65)');
  }
  g.restore();
  /* ---- наплечник ближний ---- */
  g.save();g.translate(0,bob*0.5);
  g.beginPath();g.moveTo(-5.2,-24);g.quadraticCurveTo(-5.8,-29,-0.4,-28.6);g.quadraticCurveTo(4.6,-28.4,4.4,-23.8);g.quadraticCurveTo(-0.4,-22.2,-5.2,-24);g.closePath();mobPath(g,shadeHex(AG,0.04),-1.6,-27,6);
  g.strokeStyle=T?'rgba(30,20,6,.6)':'rgba(120,76,10,.7)';g.lineWidth=0.45;g.beginPath();g.moveTo(-5.4,-26);g.quadraticCurveTo(-0.6,-24.4,4.4,-26);g.moveTo(-5.2,-24.4);g.quadraticCurveTo(-0.4,-22.8,4.4,-24.4);g.stroke();
  g.fillStyle=T?'#c8b480':'#fff2b8';for(const x of [-3.6,0.2,3.4]){g.beginPath();g.arc(x,-27.4+(x===0.2?0.4:0),0.5,0,TAU);g.fill();}
  if(T){g.strokeStyle='#120c04';g.lineWidth=0.6;g.beginPath();g.moveTo(1.4,-28.4);g.lineTo(0.2,-26.4);g.lineTo(1.6,-24.2);g.stroke();
    /* тяжёлая масса воска на плече, стекающая на грудь */
    g.beginPath();g.moveTo(-6.6,-25);g.bezierCurveTo(-8.8,-28.4,-6.2,-31,-3,-29.8);g.bezierCurveTo(-1,-28.6,2,-29.8,3.6,-27.6);g.bezierCurveTo(5.8,-25.8,4.6,-23.4,2.8,-22.8);g.lineTo(-5.2,-22.6);g.closePath();mobPath(g,WX,-2,-27.6,7);
    g.fillStyle='rgba(255,252,226,.6)';g.beginPath();g.ellipse(-3.4,-28.4,2,0.8,-0.4,0,TAU);g.fill();
    lmHoneyDrips(g,[[-5.6,-23,6.4,0.9],[-1.8,-22.6,4.4,0.8],[2.6,-22.8,8,1]],WX,'rgba(255,252,224,.65)');}
  else if(melt){lmHoneyDrips(g,[[-4.2,-23.4,5,0.8],[3,-23,3.4,0.7]],WX,'rgba(255,255,255,.7)');}
  g.restore();
  /* ---- щит: сотовая эмблема ---- */
  g.save();g.translate(6.8+coil*2.2-ext*3.6-gs*0.5+tw2*0.4,-18.4+bob*0.4-coil*3.4+ext*1.5+gc*0.6);g.rotate(-coil*0.12+ext*0.2-gs*0.05+tw2*0.1);g.scale(1+coil*0.1,1+coil*0.07);
  g.beginPath();g.ellipse(0,0,5.2,8.8,0,0,TAU);mobPath(g,T?'#8a6a24':'#f0bc48',-0.8,-1.5,9);
  g.save();g.clip();
  g.beginPath();g.ellipse(0,0,3.8,7.2,0,0,TAU);g.fillStyle=T?'#6a5018':'#d8a032';g.fill();g.strokeStyle=T?'rgba(20,14,4,.6)':'rgba(120,76,10,.7)';g.lineWidth=0.5;g.stroke();
  /* соты: центральная и шесть вокруг */
  g.strokeStyle=T?'rgba(255,230,150,.3)':'rgba(255,246,200,.75)';g.lineWidth=0.5;g.fillStyle=T?'rgba(255,210,100,.2)':'rgba(255,230,140,.3)';
  lmHoneyHex(g,0,0,1.9,0.52);g.fill();g.stroke();
  for(let i=0;i<6;i++){const a=i/6*TAU+0.52;lmHoneyHex(g,Math.cos(a)*3.3*0.78,Math.sin(a)*3.3*1.15,1.3,0.52);g.stroke();}
  g.fillStyle='rgba(255,255,230,.35)';g.beginPath();g.ellipse(-2,-3.2,1.2,3,0.2,0,TAU);g.fill();
  if(T){g.strokeStyle='#120c04';g.lineWidth=0.7;g.beginPath();g.moveTo(-1.4,-9);g.lineTo(0.6,-4.6);g.lineTo(-1,-1.6);g.lineTo(1.4,2);g.lineTo(0.4,9);g.stroke();
    g.fillStyle='#120c04';g.beginPath();g.moveTo(1.6,3.4);g.lineTo(4,4.8);g.lineTo(2.6,7.6);g.lineTo(0.6,5.8);g.closePath();g.fill();}
  g.restore();
  /* заклёпки по ободу */
  g.fillStyle=T?'#c8a850':'#fff0b0';for(let i=0;i<9;i++){const a=i/9*TAU+0.3;g.beginPath();g.arc(Math.cos(a)*4.5,Math.sin(a)*7.9,0.42,0,TAU);g.fill();}
  g.strokeStyle='rgba(255,244,190,.75)';g.lineWidth=0.7;g.beginPath();g.ellipse(-0.5,-0.5,4.7,8.2,0,Math.PI*1.1,Math.PI*1.6);g.stroke();
  if(T){
    /* костлявые пальцы вцепились в верхний край */
    g.lineCap='round';for(let i=0;i<4;i++){const px=-3.4+i*1.5,py=-7.6+Math.abs(i-1.5)*0.7-Math.abs(lmTwitch(t,ph+i*0.27,1.5))*0.9;g.strokeStyle='#2a2010';g.lineWidth=1.3;g.beginPath();g.moveTo(px,py-2.8);g.lineTo(px+0.3,py+0.4);g.stroke();g.strokeStyle='#d8cdb0';g.lineWidth=0.7;g.stroke();
      g.fillStyle='#e8dcc0';g.beginPath();g.arc(px+0.1,py-1.2,0.5,0,TAU);g.fill();}
    lmHoneyDrips(g,[[-3,7.6,3.6,0.7],[2.4,8.2,5.2,0.8]],WX,'rgba(255,250,224,.6)');
  }
  g.restore();
  /* ---- пламя свечи (Иллюзия) и свет ---- */
  if(!T){
    const f=1+fl*0.1+fl3*0.06+wu*0.5+mk*0.08,sk=fl2*0.6+wu*0.4-mk*0.9+gs*0.25-hr*3;/* на ходу пламя отклоняется назад */
    g.save();g.translate(0.2+hr*14,-40.8+bob);
    g.beginPath();g.moveTo(-3,0);g.bezierCurveTo(-3.6,-3,-1.2+sk*0.4,-6*f,sk,-9.4*f);g.bezierCurveTo(1.6+sk*0.4,-6*f,3.6,-3,3,0);g.quadraticCurveTo(0,1.6,-3,0);g.closePath();
    const gr=g.createLinearGradient(0,0,0,-9*f);gr.addColorStop(0,'#ff9a20');gr.addColorStop(0.55,'#ffb838');gr.addColorStop(1,'#ffd870');g.fillStyle=gr;g.fill();g.strokeStyle='#e8601a';g.lineWidth=0.5;g.stroke();
    g.beginPath();g.moveTo(-1.4,-0.2);g.bezierCurveTo(-1.7,-2,-0.6,-4*f,sk*0.5,-5.6*f);g.bezierCurveTo(1,-4*f,1.7,-2,1.4,-0.2);g.closePath();g.fillStyle=wu>0.3?'#ffffff':'#fff4b8';g.fill();
    g.fillStyle='#2a6aff';g.globalAlpha=0.5;g.beginPath();g.ellipse(0,-0.4,0.9,0.6,0,0,TAU);g.fill();g.globalAlpha=1;
    g.restore();
    lmRim(g,q=>{softGlow(q,0.2,-45,16+wu*8,'#ffb040',0.55+wu*0.3+fl*0.05);softGlow(q,0.4,-33,12,'#ffa030',0.18);
      if(wu>0.2){q.strokeStyle='rgba(255,200,90,'+(0.2+0.4*wu)+')';q.lineWidth=0.6;for(let i=0;i<3;i++){const a=-1.9+i*0.55;q.beginPath();q.moveTo(Math.cos(a)*9,-45+Math.sin(a)*9);q.lineTo(Math.cos(a)*13,-45+Math.sin(a)*13);q.stroke();}}});
  }else{
    lmRim(g,q=>{softGlow(q,3,-33.2,5,'#ff3a1a',0.28+0.1*fl);});
  }
  if(th){lmRim(g,q=>{q.strokeStyle='rgba(255,236,170,.9)';q.lineWidth=1;q.lineCap='round';for(let i=0;i<4;i++){q.beginPath();q.moveTo(-8-i*1.6,-27+i*3.2);q.lineTo(-15-i*3,-27+i*3.2);q.stroke();}});}
  lmRim(g,q=>{q.strokeStyle='rgba(255,246,200,.4)';q.lineWidth=0.8;q.lineCap='round';q.beginPath();q.moveTo(-6.8,-25.6);q.quadraticCurveTo(-8,-19,-6.2,-13.4);q.stroke();});
  /* Истина: капли воска падают с челюсти, плеча, щита и острия — в замахе вдвое-втрое чаще */
  if(T){const sp=0.45+wu*2.6;
    for(const [dx,dy,rc,i] of [[2,-24.5,12,0],[-5.4,-17,14,1],[7+coil*2.2,-9.6-coil*3.4,10,2],[lx+23,-16,15,3],[lx+17,-15.6,13,4]]){
      for(let q=0;q<(wu>0.2?2:1);q++){const u=(t*sp+i*0.37+q*0.5)%1;g.fillStyle=WX;g.strokeStyle='#3a2e14';g.lineWidth=0.3;g.beginPath();g.ellipse(dx+Math.sin(i*3+q)*0.4,dy+u*u*rc,0.55*(1-u*0.3),0.8*(1+u*0.4),0,0,TAU);g.fill();g.stroke();}}}
  g.restore();
  g.restore();
  lmHoneyDK=1;
};
