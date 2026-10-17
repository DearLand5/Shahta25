'use strict';
/* ============================================================
   ЛИЛОВЫЕ НЕБЕСА — ОБЛИК ЗДАНИЙ ЭТАПА 8 (56-lilac-buildings)
   здания в деревне: Оранжерея, Маяк ясности, Колодец желаний, Чайный домик;
   картинки в окнах: грядки и растения, прополка, карта маяка, колодец, хозяйка-кукла, чашки;
   фонари-якоря в шахте. Свет сверху-слева, у каждой детали свет / основной / тень.
   ============================================================ */

/* ---------- растения ---------- */
/* x,y — место, где стебель выходит из земли; v — рост 0..1; wilt — сорняк душит (растение никнет) */
function gdPlantArt(g,x,y,q,v,t,rare,wilt,hk){
  hk=hk||1;
  const sw=Math.sin(t*1.3+x*0.1)*(1.5+v*2)-(wilt?6:0);
  const leafC=wilt?'#7a8a5a':'#5ab04a',leafL=wilt?'#9aa878':'#8ad870',leafD=wilt?'#4a5438':'#2e7a34';
  if(v<0.12){   /* семечко в лунке */
    g.fillStyle='#3a2418';g.beginPath();g.ellipse(x,y,9,3.5,0,0,TAU);g.fill();
    g.fillStyle=q.c2;g.beginPath();g.ellipse(x,y-2,3.2,2.2,-0.4,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.5)';g.fillRect(x-1.6,y-3.4,1.4,1);
    if(v>0.05){g.strokeStyle=leafC;g.lineWidth=1.6;g.beginPath();g.moveTo(x,y-2);g.quadraticCurveTo(x+1,y-6,x+3,y-8);g.stroke();}
    return;
  }
  const H=(8+v*(q.s==='lsiris'?62:52))*hk,tx=x+sw,ty=y-H;
  const leaf=(lx,ly,ang,L,W)=>{g.save();g.translate(lx,ly);g.rotate(ang);
    g.fillStyle=leafD;g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(L*0.5,-W*1.1,L,0);g.quadraticCurveTo(L*0.5,W*0.9,0,0);g.fill();
    g.fillStyle=leafC;g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(L*0.5,-W,L,0);g.quadraticCurveTo(L*0.5,W*0.2,0,0);g.fill();
    g.strokeStyle=leafL;g.lineWidth=0.8;g.beginPath();g.moveTo(1,0);g.lineTo(L*0.85,-0.5);g.stroke();g.restore();};
  /* аура редкого цветка */
  if(rare&&v>=0.5){const a=0.25+0.15*Math.sin(t*3);g.save();g.globalCompositeOperation='lighter';softGlow(g,tx,ty,34,'#fff0b0',a);g.restore();
    for(let k=0;k<3;k++){const ph=(t*0.5+k/3)%1;g.fillStyle='rgba(255,248,200,'+(1-ph)+')';g.beginPath();g.arc(tx+Math.sin(k*2.1+t)*16,ty-ph*30+10,1.4,0,TAU);g.fill();}}
  if(q.s==='lsiris'){
    for(let k=-1;k<=1;k+=2){g.fillStyle=k<0?leafC:leafD;g.beginPath();g.moveTo(x+k*2,y);g.quadraticCurveTo(x+k*8+sw*0.5,y-H*0.5,x+k*5+sw,y-H*0.8);g.quadraticCurveTo(x+k*4,y-H*0.4,x+k*5,y);g.fill();}
  }
  /* стебель: тень и свет */
  g.strokeStyle=leafD;g.lineWidth=3;g.lineCap='round';g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+sw*0.3,y-H*0.5,tx,ty);g.stroke();
  g.strokeStyle=leafC;g.lineWidth=1.6;g.beginPath();g.moveTo(x-0.6,y);g.quadraticCurveTo(x+sw*0.3-0.6,y-H*0.5,tx-0.6,ty);g.stroke();
  if(v<0.3){leaf(tx,ty,-0.5-(wilt?-0.8:0),7+v*14,3);leaf(tx,ty,Math.PI+0.5+(wilt?-0.8:0),7+v*14,3);return;}
  /* листья по стеблю */
  const nl=Math.min(4,1+Math.floor(v*4));
  for(let k=0;k<nl;k++){const f=0.25+k*0.18,lx=x+sw*0.3*f*2,ly=y-H*f,s=k%2?1:-1;
    if(q.s==='lsthorn'){g.fillStyle='#c8a0a0';g.beginPath();g.moveTo(lx,ly+3);g.lineTo(lx-s*4,ly+1);g.lineTo(lx,ly);g.fill();}
    if(q.s==='lsclover'){for(let j=0;j<3;j++){const a=(s>0?-0.3:Math.PI+0.3)+(j-1)*0.7;g.fillStyle=j===1?leafC:leafD;g.beginPath();g.arc(lx+Math.cos(a)*6,ly+Math.sin(a)*6,3.6,0,TAU);g.fill();}
      g.fillStyle=leafL;g.beginPath();g.arc(lx+(s>0?4:-4),ly-3,1.2,0,TAU);g.fill();}
    else if(q.s!=='lsiris')leaf(lx,ly,(s>0?-0.45:Math.PI+0.45)+(wilt?s*0.6:0),9+v*6,q.s==='lsmint'?4.4:3.4);}
  if(v<0.7)return;
  /* бутон и цветок */
  const open=clamp((v-0.82)/0.18,0,1),col=rare?'#fff4d0':q.c,col2=rare?'#e0c070':q.c2,colL=shadeHex(col,0.35);
  g.save();g.translate(tx,ty);
  if(wilt){g.rotate(1.1);g.globalAlpha=0.75;}
  if(open<=0){g.fillStyle=leafD;g.beginPath();g.ellipse(0,1,4,6,0,0,TAU);g.fill();g.fillStyle=col2;g.beginPath();g.ellipse(0,-2,3,4.5,0,0,TAU);g.fill();g.restore();return;}
  const R=4+open*7;
  switch(q.s){
    case 'lsclover':{for(let k=0;k<14;k++){const a=k/14*TAU,rr=R*0.65;g.fillStyle=k%3?col:col2;g.beginPath();g.ellipse(Math.cos(a)*rr,Math.sin(a)*rr*0.9,2.6,3.6,a+Math.PI/2,0,TAU);g.fill();}
      g.fillStyle=colL;g.beginPath();g.arc(-1.5,-1.5,R*0.5,0,TAU);g.fill();g.fillStyle=col2;g.beginPath();g.arc(1,1,R*0.3,0,TAU);g.fill();
      if(open>=1){const ph=(t*0.6)%1;g.fillStyle='rgba(255,200,80,.9)';g.beginPath();g.ellipse(2,R*0.8+ph*14,1.6,2.2+ph,0,0,TAU);g.fill();}break;}
    case 'lspollen':{g.strokeStyle=hexA(col,0.9);g.lineWidth=1;for(let k=0;k<22;k++){const a=k/22*TAU;g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(a)*R*1.15,Math.sin(a)*R*1.15);g.stroke();}
      g.fillStyle=col;for(let k=0;k<22;k++){const a=k/22*TAU;g.beginPath();g.arc(Math.cos(a)*R*1.15,Math.sin(a)*R*1.15,1.5,0,TAU);g.fill();}
      g.fillStyle=col2;g.beginPath();g.arc(0,0,R*0.42,0,TAU);g.fill();g.fillStyle=colL;g.beginPath();g.arc(-1,-1,R*0.2,0,TAU);g.fill();
      if(open>=1)for(let k=0;k<4;k++){const ph=(t*0.3+k/4)%1;g.fillStyle='rgba(255,240,140,'+(1-ph)*0.9+')';g.beginPath();g.arc(Math.sin(k*1.7+t)*10+ph*14,-ph*30,1.3,0,TAU);g.fill();}break;}
    case 'lsthorn':{for(let r=3;r>=0;r--){const rr=R*(0.4+r*0.2);g.fillStyle=r===3?col2:r===0?colL:col;
        for(let k=0;k<5;k++){const a=k/5*TAU+r*0.6;g.beginPath();g.ellipse(Math.cos(a)*rr*0.45,Math.sin(a)*rr*0.4,rr*0.55,rr*0.42,a,0,TAU);g.fill();}}
      g.strokeStyle=hexA(col2,0.9);g.lineWidth=0.9;g.beginPath();g.arc(0,0,R*0.25,0,Math.PI*1.5);g.stroke();break;}
    case 'lsmint':{for(let k=0;k<4;k++){const yy=-k*4.2,rr=(R*0.5)*(1-k*0.15);g.fillStyle=k%2?col:colL;g.beginPath();g.ellipse(0,yy,rr,2.6,0,0,TAU);g.fill();
        g.fillStyle=col2;g.beginPath();g.arc(-rr*0.6,yy+0.5,1,0,TAU);g.arc(rr*0.6,yy+0.5,1,0,TAU);g.fill();}
      if(open>=1){g.fillStyle='rgba(220,255,240,.85)';g.font='bold 8px system-ui';g.textAlign='center';const ph=(t*0.4)%1;g.globalAlpha*=1-ph;g.fillText('z',8+ph*6,-14-ph*16);}break;}
    case 'lsiris':{for(let k=0;k<3;k++){const a=-Math.PI/2+(k-1)*0.8;g.fillStyle=col;g.beginPath();g.ellipse(Math.cos(a)*R*0.5,Math.sin(a)*R*0.5-2,R*0.32,R*0.62,a+Math.PI/2,0,TAU);g.fill();}
      for(let k=0;k<3;k++){const a=Math.PI/2+(k-1)*1.0;g.fillStyle=col2;g.beginPath();g.ellipse(Math.cos(a)*R*0.55,Math.sin(a)*R*0.55,R*0.35,R*0.7,a+Math.PI/2,0,TAU);g.fill();
        g.fillStyle='#ffd860';g.beginPath();g.ellipse(Math.cos(a)*R*0.35,Math.sin(a)*R*0.35,0.9,R*0.3,a+Math.PI/2,0,TAU);g.fill();}
      g.fillStyle='rgba(255,255,255,'+(0.4+0.4*Math.sin(t*2))+')';g.beginPath();g.arc(-R*0.25,-R*0.6,1.4,0,TAU);g.fill();break;}
    default:{  /* лунный цветок: светящийся колокольчик */
      g.save();g.globalCompositeOperation='lighter';softGlow(g,0,2,R*3,'#c8b8ff',0.5+0.2*Math.sin(t*2));g.restore();
      g.rotate(0.35);const bg=g.createRadialGradient(-2,-2,1,0,2,R*1.2);bg.addColorStop(0,'#ffffff');bg.addColorStop(0.6,col);bg.addColorStop(1,col2);
      g.fillStyle=bg;g.beginPath();g.moveTo(-R*0.5,-R*0.3);g.quadraticCurveTo(-R*0.7,R*0.7,-R,R*1.1);g.lineTo(R,R*1.1);g.quadraticCurveTo(R*0.7,R*0.7,R*0.5,-R*0.3);g.quadraticCurveTo(0,-R*0.8,-R*0.5,-R*0.3);g.fill();
      g.fillStyle=col2;for(let k=-1;k<=1;k++){g.beginPath();g.arc(k*R*0.66,R*1.1,R*0.34,0,Math.PI);g.fill();}
      g.fillStyle='#fff8c0';g.beginPath();g.arc(0,R*1.25,1.6,0,TAU);g.fill();}
  }
  g.restore();
}
/* сорняк-мухоловка: голова на стебле, пасть с зубами; open 0..1, glow — красный отсвет пасти */
function gdWeedArt(g,x,y,hx,hy,s,open,glow,t,hit){
  /* стебель */
  g.strokeStyle='#2a5a24';g.lineWidth=6*s;g.lineCap='round';g.beginPath();g.moveTo(x,y);g.bezierCurveTo(x-10*s,y-30*s,hx+18*s,hy+34*s,hx,hy+12*s);g.stroke();
  g.strokeStyle='#5aa04a';g.lineWidth=2.4*s;g.beginPath();g.moveTo(x-1.5*s,y);g.bezierCurveTo(x-11*s,y-30*s,hx+16*s,hy+34*s,hx-1.5*s,hy+12*s);g.stroke();
  /* листья-лопасти у основания */
  for(const k of [-1,1]){g.fillStyle='#2e6a28';g.beginPath();g.moveTo(x,y-2);g.quadraticCurveTo(x+k*22*s,y-16*s,x+k*30*s,y-4*s);g.quadraticCurveTo(x+k*16*s,y,x,y-2);g.fill();
    g.fillStyle='#4a9040';g.beginPath();g.moveTo(x,y-3);g.quadraticCurveTo(x+k*20*s,y-15*s,x+k*28*s,y-5*s);g.quadraticCurveTo(x+k*16*s,y-8*s,x,y-3);g.fill();}
  g.save();g.translate(hx,hy);if(hit>0){g.translate(rnd(-2,2),rnd(-2,2));}
  const a=open*0.75;
  if(glow>0){g.save();g.globalCompositeOperation='lighter';softGlow(g,0,0,46*s,'#ff3020',glow*0.8);g.restore();}
  /* челюсти на шарнире слева: верхняя (side −1) поднимается, нижняя опускается */
  g.translate(-22*s,0);
  for(const side of [1,-1]){
    g.save();g.rotate(side*a);
    const B=(side<0?26:20)*s*side,L=50*s;
    const jg=g.createLinearGradient(0,B,0,0);jg.addColorStop(0,side<0?'#8ad070':'#3e7a32');jg.addColorStop(1,side<0?'#5aa04a':'#2e6a28');
    g.fillStyle=jg;g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(L*0.15,B,L*0.55,B*0.8);g.quadraticCurveTo(L*0.95,B*0.5,L,0);g.closePath();g.fill();
    g.strokeStyle=side<0?'rgba(220,255,190,.5)':'rgba(0,0,0,.25)';g.lineWidth=1.2;g.beginPath();g.moveTo(L*0.1,B*0.55);g.quadraticCurveTo(L*0.5,B*0.95,L*0.85,B*0.45);g.stroke();
    g.fillStyle=glow>0.3?'#ff4a3a':'#c83040';g.beginPath();g.moveTo(L*0.08,0);g.quadraticCurveTo(L*0.3,B*0.42,L*0.62,B*0.36);g.quadraticCurveTo(L*0.88,B*0.22,L*0.94,0);g.closePath();g.fill();
    if(side<0){g.fillStyle='rgba(255,255,255,.28)';g.beginPath();g.arc(L*0.3,B*0.62,2.4*s,0,TAU);g.arc(L*0.55,B*0.66,1.8*s,0,TAU);g.fill();}
    g.fillStyle='#fff8e8';for(let k=0;k<7;k++){const tx=L*0.14+k*L*0.12;g.beginPath();g.moveTo(tx-2*s,0);g.lineTo(tx,-side*6*s);g.lineTo(tx+2*s,0);g.closePath();g.fill();}
    if(side<0){g.fillStyle='#fff6c0';g.beginPath();g.ellipse(L*0.4,B*0.55,5*s,4*s,0,0,TAU);g.fill();
      g.fillStyle=glow>0.3?'#c00':'#1a0a0a';g.beginPath();g.ellipse(L*0.4+Math.sin(t*2)*1.2*s,B*0.55,1.6*s,3.2*s,0,0,TAU);g.fill();
      g.fillStyle='#fff';g.beginPath();g.arc(L*0.4-1.6*s,B*0.55-1.4*s,0.9*s,0,TAU);g.fill();}
    g.restore();
  }
  g.restore();
}
/* грядка в окне Оранжереи */
function gdDrawBed(g,w,h,b,t){
  g.clearRect(0,0,w,h);
  const bg=g.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#3a2c52');bg.addColorStop(1,'#1c1428');g.fillStyle=bg;g.fillRect(0,0,w,h);
  g.strokeStyle='rgba(220,200,255,.12)';g.lineWidth=1;for(let x=0;x<w;x+=30){g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke();}
  g.fillStyle='rgba(255,255,255,.06)';g.beginPath();g.moveTo(0,0);g.lineTo(40,0);g.lineTo(0,50);g.fill();
  const by=h-30;
  /* ящик: доски, уголки с заклёпками */
  g.fillStyle='#6a4430';g.fillRect(14,by,w-28,26);
  for(let k=0;k<3;k++){g.fillStyle=k%2?'#8a5a3a':'#7a4e34';g.fillRect(14,by+2+k*8,w-28,7);g.fillStyle='rgba(255,220,180,.18)';g.fillRect(14,by+2+k*8,w-28,1);}
  g.fillStyle='#a07050';g.fillRect(10,by-4,w-20,6);g.fillStyle='#c8946a';g.fillRect(10,by-4,w-20,1.6);
  for(const x of [14,w-22]){g.fillStyle='#4a4a58';g.fillRect(x,by-2,8,26);g.fillStyle='#8a8a9a';g.fillRect(x,by-2,2,26);g.fillStyle='#c8c8d8';g.beginPath();g.arc(x+4,by+4,1.3,0,TAU);g.arc(x+4,by+18,1.3,0,TAU);g.fill();}
  /* земля */
  g.fillStyle='#2a1a12';g.beginPath();g.ellipse(w/2,by,w/2-16,5,0,0,TAU);g.fill();
  g.fillStyle='#4a3020';for(let k=0;k<9;k++){g.beginPath();g.arc(24+k*(w-48)/8,by-1+(k%2),1.6,0,TAU);g.fill();}
  if(!b){g.fillStyle='rgba(230,210,255,.35)';g.font='700 11px system-ui';g.textAlign='center';g.fillText('пусто',w/2,by-30);return;}
  const q=GD_BY[b.s],v=gdGrowth(b),weedy=gdWeedy(b);
  gdPlantArt(g,w/2-(weedy?14:0),by-1,q,v,t,b.m===1,weedy,0.78);
  if(weedy){const s=0.55,hx=w/2+30+Math.sin(t*1.6)*5,hy=by-52+Math.sin(t*2.3)*3,op=0.35+0.3*Math.max(0,Math.sin(t*2.2));gdWeedArt(g,w/2+26,by-1,hx,hy,s,op,0,t,0);}
  /* полоска роста — табличка на ящике */
  g.fillStyle='rgba(20,8,4,.6)';roundRect(g,30,by+9,w-60,8,4);g.fill();
  g.fillStyle=weedy?'#ff6a5a':v>=1?'#ffe080':'#9ae870';roundRect(g,31,by+10,Math.max(6,(w-62)*v),6,3);g.fill();
  g.fillStyle='rgba(255,255,255,.3)';g.fillRect(34,by+10.5,Math.max(1,(w-68)*v),1.2);
  if(v>=1&&!weedy){g.fillStyle='rgba(255,240,170,'+(0.6+0.4*Math.sin(t*4))+')';g.font='800 10px system-ui';g.textAlign='left';g.fillText('созрело!',8,14);}
}
/* прополка: большая сцена */
function gdDrawWeedGame(g,w,h,W,b,t){
  g.clearRect(0,0,w,h);
  const bg=g.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#40305e');bg.addColorStop(1,'#1a1226');g.fillStyle=bg;g.fillRect(0,0,w,h);
  g.strokeStyle='rgba(230,215,255,.14)';g.lineWidth=2;for(let x=0;x<=w;x+=50){g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke();}g.beginPath();g.moveTo(0,70);g.lineTo(w,70);g.stroke();
  g.save();g.globalCompositeOperation='lighter';softGlow(g,60,20,90,'#fff0d0',0.18);g.restore();
  const by=h-34;
  g.fillStyle='#7a4e34';g.fillRect(20,by,w-40,34);g.fillStyle='#a07050';g.fillRect(14,by-5,w-28,7);g.fillStyle='#c8946a';g.fillRect(14,by-5,w-28,2);
  g.fillStyle='#2a1a12';g.beginPath();g.ellipse(w/2,by,w/2-24,7,0,0,TAU);g.fill();
  /* само растение сбоку, подвядшее */
  if(b)gdPlantArt(g,62,by-1,GD_BY[b.s],gdGrowth(b),t,b.m===1,true);
  const dead=W.ph==='dead',dd=dead?Math.min(1,W.dead/1.1):0;
  let open=0.25+0.1*Math.sin(t*3),glow=0;
  if(W.ph==='warn'){const k=Math.min(1,W.pt/0.75);open=0.3+0.7*k;glow=k*(0.7+0.3*Math.sin(t*30));}
  else if(W.ph==='snap'){open=Math.max(0,1-W.pt*8);glow=0.3;}
  const lunge=W.ph==='snap'?Math.sin(Math.min(1,W.pt/0.3)*Math.PI)*18:0;
  const hx=150+W.x,hy=96+lunge+dd*90;
  g.save();if(dead)g.globalAlpha=1-dd;
  if(W.ph==='warn'){g.strokeStyle='rgba(255,60,50,'+(0.4+0.4*Math.sin(t*20))+')';g.lineWidth=3;g.setLineDash([6,5]);g.beginPath();g.arc(hx,hy,52,0,TAU);g.stroke();g.setLineDash([]);}
  gdWeedArt(g,160,by-1,hx,hy,1.35,dead?0.9:open,glow,t,W.hit);
  g.restore();
  for(const p of W.parts){g.fillStyle=p.c;g.globalAlpha=Math.min(1,p.l*2);g.beginPath();g.ellipse(p.x,p.y,3,1.6,p.x*0.1,0,TAU);g.fill();}g.globalAlpha=1;
  if(W.swing>0){g.strokeStyle='rgba(255,255,255,'+W.swing+')';g.lineWidth=4*W.swing+1;g.beginPath();g.arc(hx,hy,44,-2.4+(1-W.swing)*1.6,-1.0+(1-W.swing)*1.6);g.stroke();}
  if(W.bite>0){const vg=g.createRadialGradient(w/2,h/2,40,w/2,h/2,200);vg.addColorStop(0,'rgba(255,0,0,0)');vg.addColorStop(1,'rgba(255,20,20,'+W.bite*0.9+')');g.fillStyle=vg;g.fillRect(0,0,w,h);}
  /* здоровье сорняка */
  for(let k=0;k<W.max;k++){const x=w/2-(W.max*14)/2+k*14+7;g.fillStyle=k<W.hp?'#7ad050':'rgba(255,255,255,.15)';g.beginPath();g.arc(x,14,5,0,TAU);g.fill();if(k<W.hp){g.fillStyle='#c8f0a0';g.beginPath();g.arc(x-1.5,12.5,1.6,0,TAU);g.fill();}}
  if(dead){g.fillStyle='rgba(220,255,200,'+Math.min(1,W.dead*2)+')';g.font='800 18px system-ui';g.textAlign='center';g.fillText('Выполот!',w/2,h/2);}
}

/* ---------- карта маяка ---------- */
function bkDrawMap(g,w,h,D,t){
  g.clearRect(0,0,w,h);
  g.fillStyle='#120c1a';g.fillRect(0,0,w,h);
  const x0=12,sw=120,y0=26,y1=h-12,sy=(d)=>y0+(d/LIL_FLOOR)*(y1-y0),sx=(x)=>x0+x/MW*sw;
  for(let i=10;i<=16;i++){const B=BIOMES[i],a=sy(B.d0),b=sy(Math.min(LIL_FLOOR,B.d1));
    const gg=g.createLinearGradient(x0,0,x0+sw,0);gg.addColorStop(0,shadeHex(B.bg,0.35));gg.addColorStop(0.5,shadeHex(B.bg,0.15));gg.addColorStop(1,shadeHex(B.bg,-0.2));
    g.fillStyle=gg;g.fillRect(x0,a,sw,b-a);
    g.fillStyle='rgba(255,255,255,.12)';g.fillRect(x0,a,sw,1);
    g.fillStyle='#e8d8ff';g.font='700 11px system-ui';g.textAlign='left';g.fillText(B.n,x0+sw+10,a+14);
    g.fillStyle='#9a88b8';g.font='600 10px system-ui';g.fillText(B.d0+' м',x0+sw+10,a+27);
    g.strokeStyle='rgba(200,180,255,.25)';g.beginPath();g.moveTo(x0+sw,a+0.5);g.lineTo(x0+sw+8,a+0.5);g.stroke();}
  /* деревня наверху */
  g.fillStyle='#ffd8f0';g.beginPath();g.moveTo(x0+sw/2-10,y0-4);g.lineTo(x0+sw/2,y0-14);g.lineTo(x0+sw/2+10,y0-4);g.fill();g.fillRect(x0+sw/2-7,y0-4,14,6);
  g.fillStyle='#e8d8ff';g.font='700 10px system-ui';g.textAlign='left';g.fillText('Деревня',x0+sw+10,y0-4);
  /* глубина, до которой ты дошёл */
  if(D.maxd>0){const yy=sy(D.maxd);g.strokeStyle='#ffe080';g.lineWidth=1.5;g.setLineDash([4,3]);g.beginPath();g.moveTo(x0-4,yy);g.lineTo(x0+sw+4,yy);g.stroke();g.setLineDash([]);
    g.fillStyle='#ffe080';g.beginPath();g.moveTo(x0-4,yy);g.lineTo(x0-10,yy-4);g.lineTo(x0-10,yy+4);g.fill();}
  /* мерцающий туман вне изведанного */
  if(D.maxd<LIL_FLOOR){const yy=sy(Math.max(0,D.maxd));const fg=g.createLinearGradient(0,yy,0,yy+30);fg.addColorStop(0,'rgba(18,12,26,0)');fg.addColorStop(1,'rgba(18,12,26,.6)');g.fillStyle=fg;g.fillRect(x0,yy,sw,30);g.fillStyle='rgba(18,12,26,.6)';g.fillRect(x0,yy+30,sw,y1-yy-30);}
  for(const s of D.st){const x=sx(s.x),y=sy(s.y);g.fillStyle=s.dn?'rgba(200,170,255,.45)':'#e6b8ff';g.strokeStyle='#1a0a24';g.lineWidth=1;
    g.beginPath();g.moveTo(x,y-4);g.lineTo(x+4,y);g.lineTo(x,y+4);g.lineTo(x-4,y);g.closePath();g.fill();g.stroke();}
  for(const a of D.lan){const x=sx(a[0]+0.5),y=sy(a[1]);g.save();g.globalCompositeOperation='lighter';softGlow(g,x,y,9,'#fff0b0',0.6+0.3*Math.sin(t*3+a[0]));g.restore();g.fillStyle='#fffbe0';g.beginPath();g.arc(x,y,1.8,0,TAU);g.fill();}
  /* глаз Колыбели внизу */
  {const ex=x0+sw/2,ey=y1-14,bl=((t*0.35)%1)>0.94?0.15:1;g.fillStyle='rgba(255,220,240,.85)';g.beginPath();g.ellipse(ex,ey,12,5*bl,0,0,TAU);g.fill();if(bl>0.5){g.fillStyle='#a0104a';g.beginPath();g.arc(ex+Math.sin(t*0.7)*4,ey,3,0,TAU);g.fill();}}
  g.strokeStyle='rgba(230,200,255,.4)';g.lineWidth=1;g.strokeRect(x0+0.5,y0+0.5,sw-1,y1-y0-1);
}

/* ---------- колодец в окне ---------- */
function wlDrawWell(g,w,h,A,t){
  g.clearRect(0,0,w,h);
  const night=lilNight()>0.5;
  const sky=g.createLinearGradient(0,0,0,h);sky.addColorStop(0,night?'#1a0c2a':'#6a4c9a');sky.addColorStop(1,night?'#0a0612':'#2a1a40');g.fillStyle=sky;g.fillRect(0,0,w,h);
  const cx=w/2,cy=96,rx=104,ry=36;
  /* шахта колодца: внутренняя кладка уходит вниз к воде */
  g.fillStyle='#120a18';g.beginPath();g.ellipse(cx,cy,rx,ry,0,0,TAU);g.fill();
  g.save();g.beginPath();g.ellipse(cx,cy,rx-8,ry-4,0,0,TAU);g.clip();
  for(let r=0;r<4;r++){const yy=cy-ry+6+r*9,sh=r/4;for(let k=0;k<14;k++){const x=cx-rx+((k+(r%2)*0.5)*15);
    g.fillStyle='rgba('+Math.round(90-sh*50)+','+Math.round(74-sh*44)+','+Math.round(110-sh*60)+',1)';roundRect(g,x,yy,13,7.5,2.5);g.fill();
    g.fillStyle='rgba(255,255,255,'+(0.12-sh*0.1)+')';g.fillRect(x+2,yy+1,9,1);}}
  const sg=g.createLinearGradient(0,cy-ry,0,cy+ry);sg.addColorStop(0,'rgba(10,4,16,0)');sg.addColorStop(0.7,'rgba(10,4,16,.75)');g.fillStyle=sg;g.fillRect(cx-rx,cy-ry,rx*2,ry*2);
  g.restore();
  /* вода */
  const wy=cy+12,wrx=rx-26,wry=ry-15;
  const wg=g.createRadialGradient(cx-20,wy-6,4,cx,wy,wrx);wg.addColorStop(0,night?'#3a2a5a':'#b8a0e8');wg.addColorStop(1,night?'#100820':'#3a2a6a');
  g.fillStyle=wg;g.beginPath();g.ellipse(cx,wy,wrx,wry,0,0,TAU);g.fill();
  g.save();g.beginPath();g.ellipse(cx,wy,wrx,wry,0,0,TAU);g.clip();
  /* монеты на дне */
  for(let k=0;k<12;k++){const x=cx-wrx*0.8+llbRand(k+7)*wrx*1.6,y=wy-wry*0.6+llbRand(k+19)*wry*1.2,gl=0.5+0.5*Math.sin(t*2+k*1.3);
    g.fillStyle=k%4?'rgba(240,190,80,.75)':'rgba(200,170,255,.7)';g.beginPath();g.ellipse(x,y,3.2,1.4,0,0,TAU);g.fill();if(gl>0.9){g.fillStyle='#fff';g.fillRect(x-0.5,y-2.5,1,5);g.fillRect(x-2.5,y-0.5,5,1);}}
  /* ночью в воде отражается глаз-луна */
  if(night){const bl=((t*0.3)%1)>0.95?0.15:1;g.fillStyle='rgba(255,240,250,.85)';g.beginPath();g.ellipse(cx+18,wy-2,16,6*bl,0,0,TAU);g.fill();
    if(bl>0.5){g.fillStyle='#8a0a3a';g.beginPath();g.arc(cx+18+Math.sin(t*0.6)*5,wy-2,3.6,0,TAU);g.fill();}}
  else{g.fillStyle='rgba(255,255,255,.18)';g.beginPath();g.ellipse(cx-26,wy-6,24,4,0,0,TAU);g.fill();}
  /* круги по воде и свет желания */
  if(A.drop>=0){const p=Math.min(1,A.drop),sp=(p-0.55)/0.45;
    if(sp>0){for(let k=0;k<3;k++){const r=(sp*1.4-k*0.25);if(r<=0||r>1)continue;g.strokeStyle='rgba(240,230,255,'+(1-r)*0.8+')';g.lineWidth=1.5;g.beginPath();g.ellipse(cx,wy,r*wrx,r*wry,0,0,TAU);g.stroke();}}
    if(A.res&&p>=1){g.save();g.globalCompositeOperation='lighter';softGlow(g,cx,wy,wrx,A.col,0.35+0.15*Math.sin(t*4));g.restore();}}
  g.restore();
  /* ободок из камней: свет сверху-слева */
  for(let k=0;k<22;k++){const a=k/22*TAU,x=cx+Math.cos(a)*rx,y=cy+Math.sin(a)*ry,front=Math.sin(a)>0;
    const c0=front?'#8a7a9a':'#6a5a7a',c1=front?'#b8a8c8':'#8a7a9a',c2=front?'#4a3a5a':'#3a2a48';
    g.fillStyle=c2;g.beginPath();g.ellipse(x+1,y+2,15,8,a+Math.PI/2,0,TAU);g.fill();
    g.fillStyle=c0;g.beginPath();g.ellipse(x,y,14,7.5,a+Math.PI/2,0,TAU);g.fill();
    g.fillStyle=c1;g.beginPath();g.ellipse(x-2,y-2,7,3,a+Math.PI/2,0,TAU);g.fill();
    if(k%5===0){g.fillStyle='#4a8a4a';g.beginPath();g.arc(x+3,y+4,3,0,TAU);g.fill();}}
  /* падающая монета или камень */
  if(A.drop>=0&&A.drop<0.6){const p=A.drop/0.55,y=-10+p*(wy+10),sc=1-p*0.5;
    g.save();g.translate(cx,Math.min(y,wy));g.scale(sc,sc);
    if(A.gem){g.fillStyle=A.gem;g.beginPath();g.moveTo(0,-8);g.lineTo(7,0);g.lineTo(0,8);g.lineTo(-7,0);g.closePath();g.fill();g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.moveTo(0,-8);g.lineTo(-3,-1);g.lineTo(-7,0);g.closePath();g.fill();}
    else{const sq=Math.abs(Math.cos(t*14));g.fillStyle='#c8902a';g.beginPath();g.ellipse(0,0,8*sq+1,8,0,0,TAU);g.fill();g.fillStyle='#ffd870';g.beginPath();g.ellipse(-1,-1,6*sq+0.6,6,0,0,TAU);g.fill();}
    g.restore();}
  if(A.drop>=0)A.drop+=1/60/1.5;
  if(A.drop>=0.55&&A.drop<0.58&&!A.spl){A.spl=1;SFX.splash();}
  if(A.drop<0)A.spl=0;
}

/* ---------- хозяйка-кукла ---------- */
function thDrawDoll(g,w,h,D,t,night){
  g.clearRect(0,0,w,h);
  /* обои в цветочек и полка с чашками */
  const bg=g.createLinearGradient(0,0,0,h);bg.addColorStop(0,night?'#2a1424':'#f0c8d8');bg.addColorStop(1,night?'#140810':'#c890a8');g.fillStyle=bg;g.fillRect(0,0,w,h);
  for(let k=0;k<12;k++){const x=(k%4)*36+(Math.floor(k/4)%2)*18+8,y=Math.floor(k/4)*36+10;g.fillStyle=night?'rgba(120,40,70,.35)':'rgba(255,255,255,.35)';
    for(let j=0;j<5;j++){const a=j/5*TAU;g.beginPath();g.arc(x+Math.cos(a)*3,y+Math.sin(a)*3,2.2,0,TAU);g.fill();}}
  g.fillStyle=night?'#3a1a20':'#8a5a48';g.fillRect(0,28,w,5);g.fillStyle=night?'#4a2a30':'#a8786a';g.fillRect(0,28,w,1.4);
  for(const x of [10,104]){g.fillStyle=night?'#6a5a60':'#fff6f0';g.beginPath();g.moveTo(x,20);g.lineTo(x+14,20);g.lineTo(x+12,28);g.lineTo(x+2,28);g.closePath();g.fill();g.strokeStyle=night?'#4a3a40':'#d8a0b0';g.lineWidth=1;g.beginPath();g.arc(x+15,24,3,-1.2,1.2);g.stroke();}
  const step=night?Math.floor(t*2)/2:t;
  const tilt=Math.sin(step*0.9)*(night?0.18:0.08)+(D.mood<0?-0.06:0);
  const cx=w/2,cy=58;
  /* платье и руки с чашкой */
  const dg=g.createLinearGradient(cx-40,0,cx+40,0);dg.addColorStop(0,night?'#5a3a6a':'#c8a8f0');dg.addColorStop(0.5,night?'#3a2448':'#a080d8');dg.addColorStop(1,night?'#24142e':'#7050a8');
  g.fillStyle=dg;g.beginPath();g.moveTo(cx-24,88);g.quadraticCurveTo(cx-46,110,cx-50,h);g.lineTo(cx+50,h);g.quadraticCurveTo(cx+46,110,cx+24,88);g.closePath();g.fill();
  g.fillStyle=night?'#8a7a88':'#fffaf6';g.beginPath();g.moveTo(cx-20,86);g.quadraticCurveTo(cx,100,cx+20,86);g.lineTo(cx+14,82);g.lineTo(cx-14,82);g.closePath();g.fill();
  g.strokeStyle=night?'#6a5a68':'#e8d8e8';g.lineWidth=1;for(let k=-3;k<=3;k++){g.beginPath();g.arc(cx+k*6,90+Math.abs(k)*0.8,3,0,Math.PI);g.stroke();}
  /* чашка в ладонях */
  {const ux=cx+2,uy=114;g.fillStyle=night?'#a89aa0':'#fff8f4';g.beginPath();g.moveTo(ux-12,uy-8);g.lineTo(ux+12,uy-8);g.quadraticCurveTo(ux+11,uy+4,ux,uy+5);g.quadraticCurveTo(ux-11,uy+4,ux-12,uy-8);g.fill();
    g.fillStyle=night?'#4a6a3a':'#c87a4a';g.beginPath();g.ellipse(ux,uy-8,11,2.4,0,0,TAU);g.fill();g.strokeStyle='#e0b050';g.lineWidth=1;g.beginPath();g.ellipse(ux,uy-8,12,2.8,0,0,TAU);g.stroke();
    g.fillStyle='#f0c8b8';for(const k of [-1,1]){g.beginPath();g.ellipse(ux+k*13,uy-2,4.5,3.4,0,0,TAU);g.fill();}
    for(let k=0;k<2;k++){const ph=(t*0.5+k*0.5)%1;g.strokeStyle='rgba(255,255,255,'+(1-ph)*0.5+')';g.lineWidth=1.4;g.beginPath();g.moveTo(ux-3+k*6,uy-12-ph*20);g.quadraticCurveTo(ux+3+k*6,uy-18-ph*20,ux-2+k*6,uy-24-ph*20);g.stroke();}}
  g.save();g.translate(cx,cy+26);g.rotate(tilt);g.translate(-cx,-(cy+26));
  /* шея */
  g.fillStyle='#e8c8c0';g.fillRect(cx-5,cy+22,10,8);
  /* локоны */
  const curl=(x,y,s,dir)=>{for(let k=0;k<3;k++){const yy=y+k*9*s,sw=Math.sin(t*1.5+k)*1.2;g.fillStyle=night?'#6a5030':'#e8b860';g.beginPath();g.ellipse(x+sw,yy,5*s,5.5*s,0,0,TAU);g.fill();
    g.fillStyle=night?'#4a3418':'#b8862a';g.beginPath();g.arc(x+sw+dir*1.5,yy+1.5,3*s,0,TAU);g.fill();g.fillStyle=night?'#8a7040':'#fff0b0';g.beginPath();g.arc(x+sw-1.5,yy-2,1.4*s,0,TAU);g.fill();}};
  curl(cx-27,cy+2,1,1);curl(cx+27,cy+2,1,-1);
  /* лицо: фарфор, свет сверху-слева */
  const fg=g.createRadialGradient(cx-9,cy-10,3,cx,cy,30);fg.addColorStop(0,night?'#e8dcd8':'#fffaf6');fg.addColorStop(0.7,night?'#c8b4b0':'#f6e0d8');fg.addColorStop(1,night?'#8a7470':'#d8b4b0');
  g.fillStyle=fg;g.beginPath();g.ellipse(cx,cy,24,26,0,0,TAU);g.fill();
  g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=1.2;g.beginPath();g.ellipse(cx,cy,23,25,0,Math.PI*1.05,Math.PI*1.45);g.stroke();
  /* трещина (ночью) */
  if(night){g.strokeStyle='#3a2028';g.lineWidth=1;g.beginPath();g.moveTo(cx+12,cy-20);g.lineTo(cx+8,cy-10);g.lineTo(cx+13,cy-4);g.lineTo(cx+9,cy+4);g.stroke();}
  /* румянец */
  g.fillStyle=night?'rgba(160,40,60,.4)':'rgba(255,120,140,.35)';g.beginPath();g.ellipse(cx-13,cy+6,5,3,0,0,TAU);g.ellipse(cx+13,cy+6,5,3,0,0,TAU);g.fill();
  /* глаза: стеклянные, моргают */
  const blink=((t*0.33)%1)>0.96;
  for(const s of [-1,1]){const ex=cx+s*9,ey=cy-2;
    if(blink){g.strokeStyle='#4a2a2a';g.lineWidth=1.6;g.beginPath();g.moveTo(ex-6,ey);g.quadraticCurveTo(ex,ey+3,ex+6,ey);g.stroke();continue;}
    g.fillStyle=night?'#100008':'#fff';g.beginPath();g.ellipse(ex,ey,5.2,D.mood<0?3.4:5.8,0,0,TAU);g.fill();
    if(night){g.fillStyle='#ff2a3a';g.beginPath();g.arc(ex+Math.sin(t*0.5)*1.5,ey,1.4,0,TAU);g.fill();}
    else{const ig=g.createRadialGradient(ex-1,ey-1,0.5,ex,ey,4.4);ig.addColorStop(0,'#c8b0ff');ig.addColorStop(0.6,'#7050c8');ig.addColorStop(1,'#2a1a5a');g.fillStyle=ig;g.beginPath();g.arc(ex+0.5,ey+0.8,4,0,TAU);g.fill();
      g.fillStyle='#120a20';g.beginPath();g.arc(ex+0.5,ey+0.8,1.7,0,TAU);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(ex-1.2,ey-1.2,1.3,0,TAU);g.fill();}
    g.strokeStyle='#2a1418';g.lineWidth=1.5;g.beginPath();g.ellipse(ex,ey,5.3,D.mood<0?3.5:5.9,0,Math.PI*1.08,Math.PI*1.92);g.stroke();
    g.lineWidth=1;for(let k=0;k<3;k++){const a=Math.PI*(1.15+k*0.18),aa=s<0?a:Math.PI*3-a;g.beginPath();g.moveTo(ex+Math.cos(aa)*5.3,ey+Math.sin(aa)*5.9);g.lineTo(ex+Math.cos(aa)*7.6,ey+Math.sin(aa)*8);g.stroke();}
    g.strokeStyle=night?'#2a1418':'#a07850';g.lineWidth=1.2;g.beginPath();g.moveTo(ex-4,ey-9+(D.mood<0?s*1.5:0));g.quadraticCurveTo(ex,ey-11,ex+4,ey-9);g.stroke();}
  /* рот марионетки: при разговоре челюсть опускается */
  const jaw=D.talk>0?Math.abs(Math.sin(t*14))*3.4:0;
  if(jaw>0.4||night){g.strokeStyle=night?'rgba(60,20,30,.6)':'rgba(150,100,100,.35)';g.lineWidth=0.7;g.beginPath();g.moveTo(cx-5,cy+13);g.lineTo(cx-5,cy+18+jaw);g.moveTo(cx+5,cy+13);g.lineTo(cx+5,cy+18+jaw);g.stroke();}
  g.fillStyle=night?'#2a0008':'#7a1a2a';g.beginPath();g.ellipse(cx,cy+13+jaw*0.5,3.6,1.2+jaw*0.6,0,0,TAU);g.fill();
  g.fillStyle=night?'#a0303a':'#e0506a';g.beginPath();g.moveTo(cx-4,cy+12.2);g.quadraticCurveTo(cx,cy+(D.mood>0?15:13),cx+4,cy+12.2);g.quadraticCurveTo(cx,cy+10.6,cx-4,cy+12.2);g.fill();
  /* чепчик с кружевом и бантом */
  const hg=g.createLinearGradient(cx-30,cy-40,cx+30,cy-10);hg.addColorStop(0,night?'#6a4a7a':'#e8d0ff');hg.addColorStop(1,night?'#2a1a36':'#9a78d0');
  g.fillStyle=hg;g.beginPath();g.ellipse(cx,cy-12,30,22,0,Math.PI*1.02,Math.PI*1.98);g.closePath();g.fill();
  g.fillStyle=night?'#9a8a98':'#fffaff';for(let k=0;k<13;k++){const a=Math.PI*(1.04+k*0.07);g.beginPath();g.arc(cx+Math.cos(a)*29,cy-12+Math.sin(a)*21,3.2,0,TAU);g.fill();}
  g.fillStyle=night?'#6a1a2a':'#ff7aa8';g.beginPath();g.moveTo(cx+22,cy-24);g.lineTo(cx+34,cy-30);g.lineTo(cx+33,cy-18);g.closePath();g.moveTo(cx+22,cy-24);g.lineTo(cx+12,cy-32);g.lineTo(cx+12,cy-20);g.closePath();g.fill();
  g.fillStyle=night?'#8a2a3a':'#ffb0cc';g.beginPath();g.arc(cx+22,cy-24,3.2,0,TAU);g.fill();
  g.restore();
}
/* три чашки на столе */
function thDrawCups(g,w,h,C,t){
  g.clearRect(0,0,w,h);
  const bg=g.createLinearGradient(0,0,0,h);bg.addColorStop(0,'#3a2236');bg.addColorStop(1,'#1c0f1a');g.fillStyle=bg;g.fillRect(0,0,w,h);
  const ty=h-36;
  const tg=g.createLinearGradient(0,ty,0,h);tg.addColorStop(0,'#a8705a');tg.addColorStop(1,'#5a3424');g.fillStyle=tg;g.fillRect(0,ty,w,h-ty);
  g.fillStyle='rgba(255,230,210,.25)';g.fillRect(0,ty,w,2);
  g.strokeStyle='rgba(255,255,255,.12)';g.lineWidth=1;for(let x=-20;x<w;x+=34){g.beginPath();g.moveTo(x,ty+4);g.lineTo(x+30,h);g.stroke();}
  const ease=(k)=>k<0.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
  const order=[0,1,2].map(i=>{const k=C.ph==='shuffle'?ease(C.sw):1,sx=50+C.from[i]*100,ex=50+C.pos[i]*100,x=sx+(ex-sx)*k,arc=(C.from[i]!==C.pos[i]&&C.ph==='shuffle')?Math.sin(k*Math.PI)*(C.pos[i]>C.from[i]?-14:10):0;return {i,x,arc};}).sort((a,b)=>a.arc-b.arc);
  for(const o of order){
    const sel=C.ph==='reveal'&&o.i===C.pick,lift=sel?Math.min(1,C.rt/0.4)*14:0,bob=C.ph==='choose'?Math.sin(t*3+o.i*2)*2:0;
    const x=o.x,y=ty-6+o.arc-lift+bob;
    if(sel)C.rt+=1/60;
    /* блюдце */
    g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(x,ty+4,30,6,0,0,TAU);g.fill();
    g.fillStyle='#d8c8d0';g.beginPath();g.ellipse(x,ty+1,28,6,0,0,TAU);g.fill();g.fillStyle='#fff8fa';g.beginPath();g.ellipse(x,ty,26,5,0,0,TAU);g.fill();
    /* чашка: фарфор, золотой ободок, розочки */
    const cg=g.createLinearGradient(x-20,0,x+20,0);cg.addColorStop(0,'#ffffff');cg.addColorStop(0.55,'#f4e4ec');cg.addColorStop(1,'#c8a8b8');
    g.fillStyle=cg;g.beginPath();g.moveTo(x-20,y-30);g.lineTo(x+20,y-30);g.quadraticCurveTo(x+19,y-4,x,y-2);g.quadraticCurveTo(x-19,y-4,x-20,y-30);g.fill();
    g.strokeStyle='#c8a8b8';g.lineWidth=4;g.beginPath();g.arc(x+22,y-18,7,-1.3,1.3);g.stroke();g.strokeStyle='#fff';g.lineWidth=1.4;g.beginPath();g.arc(x+22,y-18,7,-1.2,0.2);g.stroke();
    for(let k=0;k<3;k++){const rx=x-10+k*10,ry=y-16+(k%2)*3;g.fillStyle='#ff8ab0';g.beginPath();g.arc(rx,ry,2.6,0,TAU);g.fill();g.fillStyle='#d04a78';g.beginPath();g.arc(rx+0.6,ry+0.6,1.2,0,TAU);g.fill();g.fillStyle='#6ab060';g.beginPath();g.ellipse(rx+3.4,ry+1,2,1,0.5,0,TAU);g.fill();}
    g.fillStyle='#3a1a14';g.beginPath();g.ellipse(x,y-30,19,4,0,0,TAU);g.fill();
    g.strokeStyle='#e8c060';g.lineWidth=1.6;g.beginPath();g.ellipse(x,y-30,20,4.6,0,0,TAU);g.stroke();
    /* пар */
    let sc='rgba(255,255,255,',n=2;
    if(sel&&C.res==='gift'){sc='rgba(255,220,120,';n=4;}else if(sel&&C.res==='curse'){sc='rgba(80,160,90,';n=4;}
    for(let k=0;k<n;k++){const ph=(t*0.5+k/n)%1;g.strokeStyle=sc+(1-ph)*0.55+')';g.lineWidth=sel?2.4:1.6;g.beginPath();g.moveTo(x-6+k*4,y-34-ph*26);g.quadraticCurveTo(x+4+k*4,y-42-ph*26,x-4+k*4,y-50-ph*26);g.stroke();}
    if(sel&&C.res==='gift'){g.save();g.globalCompositeOperation='lighter';softGlow(g,x,y-40,40,'#ffd080',0.6);g.restore();}
    if(sel&&C.res==='curse'){g.save();g.globalCompositeOperation='lighter';softGlow(g,x,y-40,40,'#40a050',0.5);g.restore();}
  }
  if(C.ph==='choose'){g.fillStyle='rgba(255,230,250,'+(0.6+0.4*Math.sin(t*4))+')';g.font='800 12px system-ui';g.textAlign='center';g.fillText('выбери чашку',w/2,18);}
}

/* ---------- фонари-якоря в шахте ---------- */
function lbDrawLanterns(g,tx0,tx1,ty0,ty1){
  const L=G.wf.lan;if(!L||!L.length)return;
  const t=G.time,lv=bkLv(),truth=veilT>0.5;
  for(const a of L){
    if(a[0]<tx0-6||a[0]>tx1+6||a[1]<ty0-6||a[1]>ty1+6)continue;
    const x=a[0]*TILE+16,y=(a[1]+1)*TILE;
    /* безопасный круг, если шахтёр рядом */
    const pd=Math.hypot(player.x-x,player.y-y)/TILE;
    if(pd<10){const al=(1-pd/10)*0.3;g.save();g.strokeStyle='rgba(255,240,200,'+al+')';g.lineWidth=2;g.setLineDash([6,8]);g.lineDashOffset=-t*20;
      g.beginPath();g.ellipse(x,y-2*TILE,5.5*TILE,4.5*TILE,0,0,TAU);g.stroke();g.restore();}
    const fl=0.85+0.15*Math.sin(t*9+a[0])*Math.sin(t*5.3+a[1]);
    g.save();g.globalCompositeOperation='lighter';softGlow(g,x,y-50,70,truth?'#ffb0d0':'#fff0c0',0.42*fl);g.restore();
    /* каменное основание: свет, основной, тень */
    g.fillStyle='#3a3048';g.fillRect(x-11,y-8,22,8);g.fillStyle='#5a4e6a';g.fillRect(x-11,y-8,22,2.4);g.fillStyle='#241c30';g.fillRect(x+5,y-6,6,6);
    g.fillStyle='#4a8a5a';g.beginPath();g.arc(x-8,y-7,2.4,0,TAU);g.arc(x-4,y-8,1.8,0,TAU);g.fill();
    /* кованый столб с завитком */
    g.fillStyle='#1c1824';g.fillRect(x-2.5,y-46,5,38);g.fillStyle='#5a5470';g.fillRect(x-2.5,y-46,1.6,38);
    g.strokeStyle='#2a2434';g.lineWidth=2;g.beginPath();g.arc(x+6,y-24,5,Math.PI*0.9,Math.PI*2.4);g.stroke();
    g.strokeStyle='#6a6080';g.lineWidth=0.8;g.beginPath();g.arc(x+6,y-24,5,Math.PI*1.0,Math.PI*1.6);g.stroke();
    /* фонарь: крышка, стекло, огонёк */
    const ly=y-58;
    g.fillStyle='#2a2434';g.beginPath();g.moveTo(x-10,ly-8);g.lineTo(x,ly-17);g.lineTo(x+10,ly-8);g.closePath();g.fill();
    g.fillStyle='#6a6080';g.beginPath();g.moveTo(x-10,ly-8);g.lineTo(x,ly-17);g.lineTo(x-1,ly-8);g.closePath();g.fill();
    g.fillStyle='#e0b050';g.beginPath();g.arc(x,ly-18,2,0,TAU);g.fill();
    g.fillStyle='rgba(255,246,220,'+(0.28+0.12*fl)+')';g.fillRect(x-8,ly-8,16,18);
    const fg=g.createRadialGradient(x,ly+2,0.5,x,ly+2,9);fg.addColorStop(0,'#ffffff');fg.addColorStop(0.5,truth?'#ffb0d8':'#fff0b0');fg.addColorStop(1,'rgba(255,200,150,0)');
    g.fillStyle=fg;g.beginPath();g.arc(x,ly+2,9,0,TAU);g.fill();
    if(truth){g.fillStyle='#fff';g.beginPath();g.ellipse(x,ly+2,4.4,2.6,0,0,TAU);g.fill();g.fillStyle='#a0104a';g.beginPath();g.arc(x+clamp((player.x-x)*0.02,-1.6,1.6),ly+2,1.6,0,TAU);g.fill();}
    else{g.fillStyle='#fffbe8';g.beginPath();g.moveTo(x,ly-4-fl*2);g.quadraticCurveTo(x+3.4,ly+3,x,ly+6);g.quadraticCurveTo(x-3.4,ly+3,x,ly-4-fl*2);g.fill();}
    g.strokeStyle='#1c1824';g.lineWidth=1.6;g.strokeRect(x-8,ly-8,16,18);g.beginPath();g.moveTo(x,ly-8);g.lineTo(x,ly+10);g.stroke();
    g.strokeStyle='#7a7090';g.lineWidth=0.7;g.beginPath();g.moveTo(x-7.5,ly-7.5);g.lineTo(x-7.5,ly+9.5);g.stroke();
    g.fillStyle='#2a2434';g.fillRect(x-10,ly+10,20,3);g.fillStyle='#5a5470';g.fillRect(x-10,ly+10,20,1);
    /* уровень маяка: колечки света на столбе */
    for(let k=0;k<lv;k++){g.fillStyle=hexA('#fff0c0',0.5+0.3*Math.sin(t*3+k));g.fillRect(x-3.5,y-42+k*6,7,1.6);}
    if(Math.random()<0.05&&settings.quality!=='low')spawnPart(x+rnd(-6,6),ly,rnd(-8,8),rnd(-30,-14),1.2,truth?'#ffc0e0':'#fff6d0',1.4,-10);
  }
}

/* ============================================================
   ЗДАНИЯ В ДЕРЕВНЕ (вызываются из drawLilacBuilding, начало координат — центр у земли)
   ============================================================ */
function drawLilacGarden(g,gpush,t,N,mx){
  /* кирпичный цоколь */
  g.fillStyle=mx('#9a6a5a','#2a1814');g.fillRect(-110,-26,220,26);
  for(let r=0;r<2;r++)for(let k=0;k<9;k++){const bx=-108+k*24+(r?12:0);if(bx>106)continue;g.fillStyle=mx(((r+k)%2)?'#b8806a':'#a87460','#2a1a16');g.fillRect(bx,-24+r*12,Math.min(21,108-bx),10);g.fillStyle=mx('rgba(255,230,210,.22)','rgba(255,255,255,.04)');g.fillRect(bx,-24+r*12,Math.min(21,108-bx),1.4);}
  /* растения внутри: по грядкам игрока */
  const beds=(player.prog&&player.prog.gd&&player.prog.gd.beds)||[];
  g.save();g.beginPath();g.rect(-100,-128,200,104);g.ellipse(0,-126,100,62,0,Math.PI,TAU);g.clip();
  const ig=g.createLinearGradient(0,-190,0,-26);ig.addColorStop(0,mx('#cfe8e0','#1a2a2a'));ig.addColorStop(1,mx('#8ab8a8','#0e1816'));g.fillStyle=ig;g.fillRect(-100,-190,200,166);
  for(let k=0;k<7;k++){const x=-88+k*29,hh=40+llbRand(k+3)*36;g.fillStyle=mx(k%2?'#4a9a5a':'#3a8a4e','#12301e');g.beginPath();g.ellipse(x,-26-hh*0.5,16,hh*0.55,0,0,TAU);g.fill();
    g.fillStyle=mx('#6ac070','#1a4028');g.beginPath();g.ellipse(x-4,-30-hh*0.62,8,hh*0.3,-0.3,0,TAU);g.fill();}
  g.fillStyle=mx('#7a5a44','#241812');g.fillRect(-96,-44,192,5);
  for(let i=0;i<6;i++){const b=beds[i],x=-80+i*32;
    g.fillStyle=mx('#c87850','#3a2014');g.beginPath();g.moveTo(x-8,-44);g.lineTo(x+8,-44);g.lineTo(x+6,-56);g.lineTo(x-6,-56);g.closePath();g.fill();g.fillStyle=mx('#e09a6a','#4a2a1a');g.fillRect(x-8,-58,16,3);
    if(b){const v=gdGrowth(b),q=GD_BY[b.s];if(q){const hh=6+v*26;g.strokeStyle=mx('#3a8a3a','#163016');g.lineWidth=2;g.beginPath();g.moveTo(x,-58);g.quadraticCurveTo(x+Math.sin(t+i)*2,-58-hh*0.5,x+Math.sin(t*1.2+i)*3,-58-hh);g.stroke();
      if(v>=0.8){g.fillStyle=N>0.5?'#3a2a4a':q.c;g.beginPath();g.arc(x+Math.sin(t*1.2+i)*3,-60-hh,4+(v>=1?2:0),0,TAU);g.fill();if(N<=0.5&&v>=1)gpush([x,-60-hh,14,q.c]);}
      if(gdWeedy(b)){g.fillStyle=mx('#4a9040','#1a3a18');g.beginPath();g.arc(x+6,-70,6,0,TAU);g.fill();g.fillStyle='#c83040';g.fillRect(x+2,-71,8,2);}}}}
  /* ночью к стеклу прижимается мухоловка */
  if(N>0.4){const a=Math.min(1,(N-0.4)*2),sx=58+Math.sin(t*0.7)*6;g.globalAlpha=a;gdWeedArt(g,70,-44,sx,-108,1.0,0.4+0.3*Math.max(0,Math.sin(t*1.7)),0.3,t,0);g.globalAlpha=1;}
  g.restore();
  /* стекло: переплёт, блики сверху-слева */
  g.fillStyle=mx('rgba(230,250,255,.28)','rgba(80,120,140,.18)');g.fillRect(-100,-128,200,102);g.beginPath();g.ellipse(0,-126,100,62,0,Math.PI,TAU);g.fill();
  const fr=mx('#fbf8ff','#5a5468'),frD=mx('#c8c0d8','#2a2636');
  g.strokeStyle=frD;g.lineWidth=5;g.strokeRect(-100,-128,200,102);
  g.strokeStyle=fr;g.lineWidth=3;g.strokeRect(-100,-128,200,102);
  for(let k=1;k<8;k++){const x=-100+k*25;g.beginPath();g.moveTo(x,-128);g.lineTo(x,-26);g.stroke();}
  g.beginPath();g.moveTo(-100,-80);g.lineTo(100,-80);g.stroke();
  g.beginPath();g.ellipse(0,-126,100,62,0,Math.PI,TAU);g.stroke();
  for(let k=1;k<6;k++){const a=Math.PI+k/6*Math.PI;g.beginPath();g.moveTo(0,-126);g.lineTo(Math.cos(a)*100,-126+Math.sin(a)*62);g.stroke();}
  g.beginPath();g.ellipse(0,-126,56,34,0,Math.PI,TAU);g.stroke();
  g.fillStyle=mx('rgba(255,255,255,.55)','rgba(255,255,255,.1)');
  for(const [x,y] of [[-92,-120],[-67,-120],[-92,-74]]){g.beginPath();g.moveTo(x,y);g.lineTo(x+8,y);g.lineTo(x+2,y+24);g.lineTo(x-4,y+24);g.closePath();g.fill();}
  g.beginPath();g.moveTo(-80,-160);g.quadraticCurveTo(-60,-182,-30,-186);g.lineTo(-30,-180);g.quadraticCurveTo(-58,-176,-74,-156);g.closePath();g.fill();
  /* конёк с флюгером-пчелой */
  g.fillStyle=mx('#e0b050','#6a5028');g.fillRect(-2,-206,4,20);g.beginPath();g.arc(0,-208,4,0,TAU);g.fill();
  {const r=Math.sin(t*0.6)*0.5;g.save();g.translate(0,-214);g.rotate(r);g.fillStyle=mx('#ffd040','#5a4a20');g.beginPath();g.ellipse(0,0,9,5,0,0,TAU);g.fill();
    g.fillStyle=mx('#2a1a10','#140a06');g.fillRect(-3,-5,2,10);g.fillRect(2,-5,2,10);g.fillStyle=mx('rgba(255,255,255,.7)','rgba(200,200,255,.3)');g.beginPath();g.ellipse(-2,-7,5,3,-0.4,0,TAU);g.fill();g.restore();}
  /* дверь */
  g.fillStyle=mx('#e8f4f0','#3a4044');g.beginPath();g.moveTo(-18,0);g.lineTo(-18,-58);g.quadraticCurveTo(0,-76,18,-58);g.lineTo(18,0);g.closePath();g.fill();
  g.fillStyle=mx('rgba(160,220,200,.5)','rgba(40,70,60,.6)');g.fillRect(-14,-56,12,52);g.fillRect(2,-56,12,52);
  g.fillStyle=mx('#e0b050','#6a5028');g.beginPath();g.arc(-4,-28,1.8,0,TAU);g.arc(4,-28,1.8,0,TAU);g.fill();
  /* лейка и горшки снаружи */
  {const x=96;g.fillStyle=mx('#7aa0b8','#2a3640');g.beginPath();g.moveTo(x,-2);g.lineTo(x+22,-2);g.lineTo(x+20,-22);g.lineTo(x+2,-22);g.closePath();g.fill();
    g.fillStyle=mx('#a8c8e0','#3a4a58');g.fillRect(x+2,-22,4,20);g.strokeStyle=mx('#7aa0b8','#2a3640');g.lineWidth=3;g.beginPath();g.moveTo(x+20,-14);g.lineTo(x+34,-26);g.stroke();g.beginPath();g.arc(x+11,-24,7,Math.PI,TAU);g.stroke();}
  for(let k=0;k<3;k++){const x=-128+k*12;g.fillStyle=mx('#c87850','#3a2014');g.fillRect(x-5,-12,10,12);g.fillStyle=N>0.5?'#3a2a3a':['#ff8ab0','#ffd060','#c8a0ff'][k];g.beginPath();g.arc(x,-16,4.5,0,TAU);g.fill();}
  gpush([0,-80,100,N>0.5?'#60c080':'#c8ffe0']);
}
function drawLilacBeacon(g,gpush,t,N,mx,lv){
  /* луч прожектора — за башней */
  const ang=t*0.8,cs=Math.cos(ang),Lc=N>0.5?1:0.5;
  if(lv>0||N>0.4){g.save();g.globalCompositeOperation='lighter';
    for(const s of [1,-1]){const dir=cs*s;if(dir<0.05)continue;const L=420*dir,wd=26+(1-dir)*40,al=(0.1+0.04*lv)*Lc*dir;
      const bgr=g.createLinearGradient(0,-262,s*L,-262);bgr.addColorStop(0,'rgba(255,245,210,'+al+')');bgr.addColorStop(1,'rgba(255,245,210,0)');
      g.fillStyle=bgr;g.beginPath();g.moveTo(0,-266);g.lineTo(s*L,-262-wd);g.lineTo(s*L,-262+wd);g.closePath();g.fill();}
    g.restore();}
  /* каменное основание */
  g.fillStyle=mx('#8a7a98','#241c2c');g.beginPath();g.moveTo(-56,0);g.lineTo(-50,-30);g.lineTo(50,-30);g.lineTo(56,0);g.closePath();g.fill();
  for(let k=0;k<5;k++){g.fillStyle=mx(k%2?'#a898b8':'#9888a8','#2a2234');g.fillRect(-50+k*20,-28,18,12);g.fillStyle=mx('rgba(255,255,255,.2)','rgba(255,255,255,.04)');g.fillRect(-50+k*20,-28,18,1.4);}
  /* башня в полоску: круглая — свет слева, тень справа */
  const bands=7,top=-236,bot=-30;
  for(let k=0;k<bands;k++){const y0=bot-(k)*(bot-top)/bands,y1=bot-(k+1)*(bot-top)/bands,w0=38-k*(14/bands),w1=38-(k+1)*(14/bands);
    const lil=k%2===1,gg=g.createLinearGradient(-w0,0,w0,0);
    gg.addColorStop(0,mx(lil?'#e8c8ff':'#ffffff',lil?'#4a3060':'#5a5068'));gg.addColorStop(0.45,mx(lil?'#c89af0':'#f0eaf6',lil?'#3a2450':'#48404e'));gg.addColorStop(1,mx(lil?'#8a5ac0':'#b8b0c8',lil?'#1e1230':'#2a2430'));
    g.fillStyle=gg;g.beginPath();g.moveTo(-w0,y0);g.lineTo(-w1,y1);g.lineTo(w1,y1);g.lineTo(w0,y0);g.closePath();g.fill();}
  g.strokeStyle=mx('rgba(255,255,255,.5)','rgba(255,255,255,.08)');g.lineWidth=2;g.beginPath();g.moveTo(-30,-40);g.lineTo(-20,-226);g.stroke();
  /* окошки */
  for(const y of [-96,-162]){g.fillStyle=mx('#3a2a4a','#120a18');g.beginPath();g.moveTo(-6,y+12);g.lineTo(-6,y);g.quadraticCurveTo(0,y-8,6,y);g.lineTo(6,y+12);g.closePath();g.fill();
    if(N>0.3){g.fillStyle='rgba(255,220,140,'+Math.min(1,N)+')';g.fillRect(-4,y,8,10);gpush([0,y+5,16,'#ffd080']);}}
  /* дверь */
  g.fillStyle=mx('#7a4a3a','#2a1410');g.beginPath();g.moveTo(-12,-30);g.lineTo(-12,-50);g.quadraticCurveTo(0,-62,12,-50);g.lineTo(12,-30);g.closePath();g.fill();
  g.fillStyle=mx('#9a6a52','#3a2016');g.fillRect(-12,-50,3,20);g.fillStyle=mx('#e0b050','#6a5028');g.beginPath();g.arc(7,-40,1.6,0,TAU);g.fill();
  /* галерея с перилами */
  g.fillStyle=mx('#4a3a5a','#1a1220');g.fillRect(-36,-242,72,7);g.fillStyle=mx('#6a5a7a','#2a2030');g.fillRect(-36,-242,72,2);
  g.strokeStyle=mx('#4a3a5a','#1a1220');g.lineWidth=1.6;g.beginPath();g.moveTo(-34,-256);g.lineTo(34,-256);for(let k=-34;k<=34;k+=8.5){g.moveTo(k,-256);g.lineTo(k,-242);}g.stroke();
  /* фонарная комната и линза; ночью линза — глаз, следящий за шахтёром */
  g.fillStyle=mx('rgba(255,250,230,.55)','rgba(90,80,70,.5)');g.fillRect(-18,-282,36,40);
  const lensA=0.6+0.4*Math.sin(t*2)*(lv>0?1:0.3);
  g.save();g.globalCompositeOperation='lighter';softGlow(g,0,-262,40+lv*6,N>0.5?'#ffb0c0':'#fff0b0',(0.35+0.08*lv)*lensA);g.restore();
  if(N>0.5){const ex=clamp((lobbyPlayer.x-5000)*0.01,-6,6);g.fillStyle='#fff6f0';g.beginPath();g.ellipse(0,-262,13,8,0,0,TAU);g.fill();g.fillStyle='#a0104a';g.beginPath();g.arc(ex,-262,5,0,TAU);g.fill();g.fillStyle='#200008';g.beginPath();g.arc(ex,-262,2.2,0,TAU);g.fill();}
  else{const lg2=g.createRadialGradient(-3,-265,1,0,-262,12);lg2.addColorStop(0,'#ffffff');lg2.addColorStop(0.6,'#fff0b0');lg2.addColorStop(1,'#e0a040');g.fillStyle=lg2;g.beginPath();g.arc(0,-262,11,0,TAU);g.fill();
    g.strokeStyle='rgba(200,140,40,.7)';g.lineWidth=1;for(let k=1;k<4;k++){g.beginPath();g.arc(0,-262,k*3,0,TAU);g.stroke();}}
  g.strokeStyle=mx('#3a2a4a','#120a18');g.lineWidth=2.4;g.strokeRect(-18,-282,36,40);g.beginPath();g.moveTo(-6,-282);g.lineTo(-6,-242);g.moveTo(6,-282);g.lineTo(6,-242);g.stroke();
  /* купол со шпилем */
  g.fillStyle=mx('#8a5ac0','#2a1840');g.beginPath();g.ellipse(0,-282,24,16,0,Math.PI,TAU);g.fill();
  g.fillStyle=mx('#b88ae8','#3a2450');g.beginPath();g.ellipse(-6,-286,10,8,0,Math.PI,TAU);g.fill();
  g.fillStyle=mx('#e0b050','#6a5028');g.beginPath();g.moveTo(-2,-296);g.lineTo(0,-314);g.lineTo(2,-296);g.closePath();g.fill();g.beginPath();g.arc(0,-296,3,0,TAU);g.fill();
  gpush([0,-262,70+lv*10,N>0.5?'#ff9ab0':'#fff0b0']);
}
function drawLilacWell(g,gpush,t,N,mx){
  /* крыша на двух столбах, ворот с верёвкой и ведром */
  for(const s of [-1,1]){g.fillStyle=mx('#7a5040','#24140e');g.fillRect(s*48-4,-150,8,108);g.fillStyle=mx('#a07058','#341e14');g.fillRect(s*48-4,-150,2.4,108);}
  g.fillStyle=mx('#6a3a5a','#1e0c18');g.beginPath();g.moveTo(-72,-146);g.lineTo(0,-198);g.lineTo(72,-146);g.closePath();g.fill();
  for(let r=0;r<4;r++){const y=-150-r*11,hw=68-r*15;for(let k=-hw;k<hw;k+=12){g.fillStyle=mx(((k/12+r)|0)%2?'#9a5a80':'#8a4a70','#2a1022');g.beginPath();g.arc(k+6,y,6.4,0,Math.PI);g.fill();}}
  g.fillStyle=mx('rgba(255,255,255,.22)','rgba(255,255,255,.04)');g.beginPath();g.moveTo(-72,-146);g.lineTo(0,-198);g.lineTo(-10,-190);g.lineTo(-62,-148);g.closePath();g.fill();
  g.fillStyle=mx('#8a5a40','#2a1810');g.fillRect(-48,-124,96,6);g.fillStyle=mx('#b07a58','#3a2418');g.fillRect(-48,-124,96,1.6);
  g.strokeStyle=mx('#8a5a40','#2a1810');g.lineWidth=3;g.beginPath();g.moveTo(52,-121);g.lineTo(62,-121);g.lineTo(62,-108);g.stroke();
  const sw=Math.sin(t*1.1)*3;
  g.strokeStyle=mx('#d8c8a0','#4a4030');g.lineWidth=1.4;g.beginPath();g.moveTo(-10,-118);g.lineTo(-10+sw,-84);g.stroke();
  g.fillStyle=mx('#8a6a50','#2a1a10');g.beginPath();g.moveTo(-20+sw,-84);g.lineTo(0+sw,-84);g.lineTo(-3+sw,-66);g.lineTo(-17+sw,-66);g.closePath();g.fill();
  g.fillStyle=mx('#5a5a68','#1a1a20');g.fillRect(-20+sw,-80,20,2);g.fillRect(-19+sw,-71,18,2);
  /* сруб из камней: три ряда, свет сверху-слева */
  g.fillStyle=mx('#4a3a5a','#140c18');g.beginPath();g.ellipse(0,-46,52,13,0,0,TAU);g.fill();
  const wg=g.createRadialGradient(-10,-48,2,0,-46,42);wg.addColorStop(0,N>0.5?'#3a2050':'#d8c0ff');wg.addColorStop(1,N>0.5?'#120820':'#5a3a9a');g.fillStyle=wg;g.beginPath();g.ellipse(0,-45,42,9,0,0,TAU);g.fill();
  if(N>0.5){const bl=((t*0.3)%1)>0.95?0.2:1;g.fillStyle='rgba(255,240,250,.9)';g.beginPath();g.ellipse(6,-45,12,3.4*bl,0,0,TAU);g.fill();if(bl>0.5){g.fillStyle='#a0104a';g.beginPath();g.arc(6+Math.sin(t*0.5)*4,-45,2.4,0,TAU);g.fill();}}
  else for(let k=0;k<5;k++){if(Math.sin(t*2+k*1.7)>0.7){const x=-28+k*14,y=-46+(k%2)*3;g.fillStyle='#fff';g.fillRect(x-0.5,y-2,1,4);g.fillRect(x-2,y-0.5,4,1);}}
  g.fillStyle=mx('#7a6a8a','#241c2c');g.fillRect(-52,-46,104,46);
  for(let r=0;r<3;r++)for(let k=0;k<6;k++){const x=-52+k*18+(r%2?9:0),y=-44+r*15;if(x>44)continue;const ww=Math.min(17,52-x);
    g.fillStyle=mx(((k+r)%3===0)?'#9a8aaa':'#8a7a9a','#2a2234');roundRect(g,x+0.5,y,ww-1,13,4);g.fill();
    g.fillStyle=mx('rgba(255,255,255,.25)','rgba(255,255,255,.05)');g.fillRect(x+3,y+1.5,ww-7,1.6);
    g.fillStyle=mx('rgba(40,20,60,.35)','rgba(0,0,0,.3)');g.fillRect(x+2,y+11,ww-5,1.6);}
  g.fillStyle=mx('rgba(30,10,40,.25)','rgba(0,0,0,.3)');g.fillRect(30,-46,22,46);
  for(const [x,y] of [[-46,-8],[-30,-40],[38,-22]]){g.fillStyle=mx('#5aa060','#1a3a20');g.beginPath();g.arc(x,y,3,0,TAU);g.arc(x+3,y+1,2.4,0,TAU);g.fill();}
  /* ободок */
  g.strokeStyle=mx('#b8a8c8','#3a3044');g.lineWidth=4;g.beginPath();g.ellipse(0,-46,52,13,0,0,Math.PI);g.stroke();
  g.strokeStyle=mx('#e0d4ee','#4a4058');g.lineWidth=1.4;g.beginPath();g.ellipse(0,-47,51,12,0,Math.PI,TAU);g.stroke();
  /* монетки у колодца */
  for(let k=0;k<5;k++){const x=-80+k*40+(k>2?20:0),gl=Math.sin(t*2.4+k*1.9);if(Math.abs(x)<56)continue;g.fillStyle=mx('#e8b040','#5a4418');g.beginPath();g.ellipse(x,-2,4,1.6,0,0,TAU);g.fill();
    if(gl>0.85){g.fillStyle='#fff';g.fillRect(x-0.5,-6,1,7);g.fillRect(x-3,-2.5,6,1);}}
  gpush([0,-46,70,N>0.5?'#c050a0':'#c8a0ff']);
}
function drawLilacTeaHouse(g,gpush,t,N,mx){
  /* ручка чайника слева */
  g.strokeStyle=mx('#e8d8e0','#3a3036');g.lineWidth=16;g.lineCap='round';g.beginPath();g.moveTo(-82,-132);g.bezierCurveTo(-140,-140,-140,-40,-84,-44);g.stroke();
  g.strokeStyle=mx('#fffafc','#4a4048');g.lineWidth=5;g.beginPath();g.moveTo(-86,-136);g.bezierCurveTo(-138,-142,-140,-52,-100,-46);g.stroke();
  /* носик справа — дымоход */
  g.fillStyle=mx('#d8c0cc','#2e262c');g.beginPath();g.moveTo(74,-104);g.quadraticCurveTo(118,-110,132,-162);g.lineTo(146,-158);g.quadraticCurveTo(134,-96,82,-72);g.closePath();g.fill();
  g.fillStyle=mx('#fffafc','#4a4048');g.beginPath();g.moveTo(76,-102);g.quadraticCurveTo(116,-108,130,-158);g.lineTo(134,-157);g.quadraticCurveTo(120,-104,80,-94);g.closePath();g.fill();
  g.fillStyle=mx('#4a2a3a','#140a10');g.beginPath();g.ellipse(139,-161,8,3.4,-0.5,0,TAU);g.fill();
  for(let k=0;k<3;k++){const ph=(t*0.35+k/3)%1;g.strokeStyle=(N>0.5?'rgba(160,140,170,':'rgba(255,255,255,')+(1-ph)*0.6+')';g.lineWidth=4-ph*2;g.beginPath();g.moveTo(140,-166-ph*50);g.quadraticCurveTo(152+Math.sin(t+k)*8,-180-ph*50,140,-194-ph*50);g.stroke();}
  /* брюшко чайника: фарфор, свет сверху-слева */
  const bg=g.createRadialGradient(-34,-120,10,0,-80,100);bg.addColorStop(0,mx('#ffffff','#5a5258'));bg.addColorStop(0.6,mx('#f8e6ee','#3e363c'));bg.addColorStop(1,mx('#c8a0b4','#1e181c'));
  g.fillStyle=bg;g.beginPath();g.ellipse(0,-78,94,76,0,0,TAU);g.fill();
  /* узор: пояс с розами */
  g.strokeStyle=mx('#e0b050','#6a5028');g.lineWidth=2;g.beginPath();g.ellipse(0,-78,94,76,0,Math.PI*0.08,Math.PI*0.92);g.stroke();
  g.beginPath();g.ellipse(0,-92,93,10,0,0,Math.PI);g.stroke();
  for(let k=0;k<9;k++){const a=Math.PI*(0.1+k*0.1),x=Math.cos(a)*86,y=-90+Math.sin(a)*12;if(Math.abs(x)<26)continue;
    g.fillStyle=N>0.5?'#5a1a2a':'#ff8ab0';g.beginPath();g.arc(x,y,4.4,0,TAU);g.fill();g.fillStyle=N>0.5?'#3a0a14':'#d04a78';g.beginPath();g.arc(x+1,y+1,2,0,TAU);g.fill();
    g.fillStyle=N>0.5?'#1a3a18':'#6ab060';g.beginPath();g.ellipse(x+6,y+2,3,1.4,0.4,0,TAU);g.ellipse(x-6,y+2,3,1.4,-0.4,0,TAU);g.fill();}
  g.fillStyle=mx('rgba(255,255,255,.6)','rgba(255,255,255,.08)');g.beginPath();g.ellipse(-46,-122,22,10,-0.6,0,TAU);g.fill();
  /* ножка */
  g.fillStyle=mx('#e8d0dc','#2e262c');g.beginPath();g.ellipse(0,-4,60,8,0,0,TAU);g.fill();g.strokeStyle=mx('#e0b050','#6a5028');g.lineWidth=1.6;g.beginPath();g.ellipse(0,-6,60,7,0,0,Math.PI);g.stroke();
  /* крышка-крыша с шишечкой */
  g.fillStyle=mx('#e8c8d8','#342a30');g.beginPath();g.ellipse(0,-150,58,18,0,Math.PI,TAU);g.lineTo(58,-148);g.lineTo(-58,-148);g.fill();
  g.fillStyle=mx('#ffb0cc','#4a1a2a');g.beginPath();g.ellipse(0,-152,50,20,0,Math.PI,TAU);g.fill();
  g.fillStyle=mx('#ffd0e0','#5a2a3a');g.beginPath();g.ellipse(-14,-160,22,9,0,Math.PI,TAU);g.fill();
  g.strokeStyle=mx('#e0b050','#6a5028');g.lineWidth=2;g.beginPath();g.ellipse(0,-150,58,8,0,0,Math.PI);g.stroke();
  const kg=g.createRadialGradient(-3,-180,1,0,-176,9);kg.addColorStop(0,mx('#fff0b0','#8a7a40'));kg.addColorStop(1,mx('#c88a20','#4a3008'));g.fillStyle=kg;g.beginPath();g.arc(0,-176,8,0,TAU);g.fill();
  /* круглые окна: ночью в левом — силуэт хозяйки */
  for(const s of [-1,1]){const wx=s*48,wy=-100;g.fillStyle=mx('#e0b050','#6a5028');g.beginPath();g.arc(wx,wy,15,0,TAU);g.fill();
    const lg=g.createRadialGradient(wx-4,wy-4,1,wx,wy,13);lg.addColorStop(0,N>0.3?'#fff0c0':'#fff8ff');lg.addColorStop(1,N>0.3?'#f0a050':'#d0b8e0');g.fillStyle=lg;g.beginPath();g.arc(wx,wy,12,0,TAU);g.fill();
    g.strokeStyle=mx('#c8a0b4','#3a2a30');g.lineWidth=1.6;g.beginPath();g.moveTo(wx-12,wy);g.lineTo(wx+12,wy);g.moveTo(wx,wy-12);g.lineTo(wx,wy+12);g.stroke();
    if(N>0.3)gpush([wx,wy,26,'#ffc070']);
    if(s<0&&N>0.5){g.fillStyle='rgba(30,10,20,.85)';g.beginPath();g.arc(wx+2,wy-1,6,0,TAU);g.fill();g.beginPath();g.ellipse(wx+2,wy+9,8,5,0,Math.PI,TAU);g.fill();
      g.fillStyle='#ff3a4a';g.fillRect(wx-1,wy-2,1.6,1.6);g.fillRect(wx+3.4,wy-2,1.6,1.6);}}
  /* дверь */
  g.fillStyle=mx('#c8708a','#3a1420');g.beginPath();g.moveTo(-20,-4);g.lineTo(-20,-46);g.arc(0,-46,20,Math.PI,TAU);g.lineTo(20,-4);g.closePath();g.fill();
  g.fillStyle=mx('#e0909a','#4a1a28');g.fillRect(-20,-46,4,42);
  g.strokeStyle=mx('#8a3a50','#200810');g.lineWidth=1.2;g.beginPath();g.moveTo(0,-66);g.lineTo(0,-4);g.stroke();
  g.fillStyle=mx('#e0b050','#6a5028');g.beginPath();g.arc(7,-30,2,0,TAU);g.fill();
  /* фонарики-чашечки под носиком и столик */
  for(let k=0;k<2;k++){const x=104+k*18,y=-82+k*14+Math.sin(t*1.4+k)*2;g.strokeStyle=mx('#6a4a3a','#1a0e08');g.lineWidth=1;g.beginPath();g.moveTo(x,y-14);g.lineTo(x,y-6);g.stroke();
    g.fillStyle=N>0.5?'#ff9a6a':'#ffe0ea';g.beginPath();g.moveTo(x-7,y-6);g.lineTo(x+7,y-6);g.quadraticCurveTo(x+6,y+4,x,y+5);g.quadraticCurveTo(x-6,y+4,x-7,y-6);g.fill();gpush([x,y,18,N>0.5?'#ff9a50':'#ffd0e0']);}
  {const x=124;g.fillStyle=mx('#8a5a44','#2a1810');g.fillRect(x-18,-26,36,4);g.fillRect(x-2,-22,4,22);
    for(const s of [-1,1]){g.fillStyle=mx('#fffafc','#5a5058');g.fillRect(x+s*9-4,-33,8,7);g.fillStyle=mx('#c87a4a','#3a2010');g.fillRect(x+s*9-3,-33,6,1.6);}}
  gpush([0,-90,90,N>0.5?'#ff7090':'#ffd0e8']);
}

/* значок Снов для верхней панели: полумесяц со звёздочкой */
function lbDreamIcon(c,s){
  const g=c.createRadialGradient(-s*0.2,-s*0.2,1,0,0,s*0.5);g.addColorStop(0,'#fff8ff');g.addColorStop(0.6,'#d8b0ff');g.addColorStop(1,'#7a4ab8');
  c.fillStyle=g;c.beginPath();c.arc(0,0,s*0.44,0.6,Math.PI*2-0.6+Math.PI*0.1,false);c.arc(s*0.22,-s*0.08,s*0.34,Math.PI*1.6,0.75,true);c.closePath();c.fill();
  c.fillStyle='#fff6c0';c.beginPath();const sx=s*0.28,sy=-s*0.26,r=s*0.13;for(let k=0;k<8;k++){const a=k/8*TAU,rr=k%2?r*0.4:r;c.lineTo(sx+Math.cos(a)*rr,sy+Math.sin(a)*rr);}c.closePath();c.fill();
}
