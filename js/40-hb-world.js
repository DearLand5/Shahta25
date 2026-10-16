'use strict';
/* ============================================================
   ВЛАДЫКИ ПРЕИСПОДНЕЙ: облик святилищ и арены, эффекты атак,
   снаряды, катсцены появления и анимации смерти.
   ============================================================ */
/* ---------- задняя стена святилищ: свой узор у каждого ---------- */
const HB_THEME={
  herald:  {wall:'#2a2422',seam:'#14100e',acc:'#ff8a3a',brick:[32,16]},
  mother:  {wall:'#3a1018',seam:'#1a0408',acc:'#ff3a4a',brick:[0,0]},
  toadking:{wall:'#25291a',seam:'#11140a',acc:'#c8e040',brick:[24,16]},
  emperor: {wall:'#2a2630',seam:'#121016',acc:'#9ad8ff',brick:[16,12]},
  warden:  {wall:'#2a1c16',seam:'#120a06',acc:'#ff7a1a',brick:[32,32]},
  archdemon:{wall:'#2a1012',seam:'#120406',acc:'#ff4a2a',brick:[48,24]}
};
const _hbWallPat={};
function hbWallPattern(g,id){
  if(_hbWallPat[id])return _hbWallPat[id];
  const T=HB_THEME[id],c=document.createElement('canvas');c.width=c.height=96;const q=c.getContext('2d'),R=texRng(id.length*7919+13);
  q.fillStyle=T.wall;q.fillRect(0,0,96,96);
  for(let i=0;i<260;i++){q.fillStyle=shadeHex(T.wall,(R()-0.5)*0.5);q.fillRect(R()*96|0,R()*96|0,1+(R()*3|0),1+(R()*2|0));}
  if(id==='mother'){   /* живая стена: жилы и складки */
    q.strokeStyle='rgba(10,0,4,.55)';q.lineWidth=3;for(let k=0;k<6;k++){q.beginPath();let x=R()*96,y=0;q.moveTo(x,y);while(y<96){x+=(R()-0.5)*18;y+=10+R()*10;q.lineTo(x,y);}q.stroke();}
    q.strokeStyle='rgba(180,30,50,.35)';q.lineWidth=1.4;for(let k=0;k<5;k++){q.beginPath();let x=R()*96,y=R()*96;q.moveTo(x,y);for(let j=0;j<4;j++){x+=(R()-0.5)*24;y+=(R()-0.5)*24;q.lineTo(x,y);}q.stroke();}
  }else{
    const [bw,bh]=T.brick;
    for(let y=0;y<96;y+=bh){const off=(y/bh)%2?bw/2:0;q.fillStyle=T.seam;q.fillRect(0,y,96,2);for(let x=-bw;x<96+bw;x+=bw)q.fillRect(x+off,y,2,bh);
      q.fillStyle='rgba(255,255,255,.04)';q.fillRect(0,y+2,96,1);}
    if(id==='emperor'){for(let k=0;k<3;k++){const x=8+k*32,y=20+(k%2)*48;q.fillStyle='#d8d0bc';q.beginPath();q.arc(x,y,5,0,TAU);q.fill();q.fillRect(x-3,y+3,6,3);q.fillStyle='#121016';q.fillRect(x-3,y-1,2,2);q.fillRect(x+1,y-1,2,2);}}
    if(id==='toadking'){q.fillStyle='rgba(120,150,40,.35)';for(let k=0;k<14;k++){q.beginPath();q.ellipse(R()*96,R()*96,3+R()*6,1.5+R()*2,0,0,TAU);q.fill();}}
    if(id==='warden'||id==='archdemon'){q.strokeStyle=hexA(T.acc,0.18);q.lineWidth=1;for(let k=0;k<3;k++){q.beginPath();let x=R()*96,y=R()*96;q.moveTo(x,y);for(let j=0;j<3;j++){x+=(R()-0.5)*20;y+=(R()-0.5)*20;q.lineTo(x,y);}q.stroke();}}
  }
  return (_hbWallPat[id]=g.createPattern(c,'repeat'));
}
function hbVisible(b,tx0,tx1,ty0,ty1){return !(b.x0+b.W+10<tx0||b.x0-10>tx1||b.y0+b.H<ty0||b.y0-12>ty1);}
function hbBrazier(g,x,y,col,t,k){
  g.fillStyle='#1a1210';g.fillRect(x-2,y-2,4,14);
  g.fillStyle='#3a2a22';g.beginPath();g.moveTo(x-10,y-4);g.lineTo(x+10,y-4);g.lineTo(x+6,y+3);g.lineTo(x-6,y+3);g.closePath();g.fill();
  g.strokeStyle='#5a4434';g.lineWidth=1;g.stroke();
  g.save();g.globalCompositeOperation='lighter';softGlow(g,x,y-12,44,col,0.45);g.restore();
  hbFlame(g,x,y-4,7,18+Math.sin(t*5+k)*3,t,k,hexA(col,0.9),'#ffe0a0');
}
function hbBanner(g,x,y,h,col,t,k,sig){
  g.fillStyle='#2a1a14';g.fillRect(x-12,y-3,24,3);
  const w=Math.sin(t*1.3+k)*2;
  g.fillStyle=col;g.beginPath();g.moveTo(x-10,y);g.lineTo(x+10,y);g.lineTo(x+10+w,y+h);g.lineTo(x+w,y+h-8);g.lineTo(x-10+w,y+h);g.closePath();g.fill();
  g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x+4,y,6,h-4);
  if(sig){g.fillStyle='rgba(255,220,140,.7)';g.font='bold 14px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText(sig,x+w*0.5,y+h*0.42);}
}
/* постамент призыва */
function hbDrawPedestal(g,b,t){
  const p=hbPedPx(b),x=p.x,y=p.y,H=hbById(b.id),active=G.hb&&G.hb.b===b;
  const have=matN(hbRecipe(b.id).id)>0;
  g.fillStyle='#1e1614';g.beginPath();g.moveTo(x-22,y);g.lineTo(x+22,y);g.lineTo(x+16,y-8);g.lineTo(x-16,y-8);g.closePath();g.fill();
  g.fillStyle='#2e2420';g.fillRect(x-11,y-34,22,26);
  g.fillStyle='#3e3028';g.beginPath();g.moveTo(x-18,y-34);g.lineTo(x+18,y-34);g.lineTo(x+14,y-40);g.lineTo(x-14,y-40);g.closePath();g.fill();
  g.strokeStyle=hexA(H.col,0.6);g.lineWidth=1.2;g.strokeRect(x-8,y-30,16,18);
  const pk=0.5+0.5*Math.sin(t*3);
  if(!active){g.save();g.globalCompositeOperation='lighter';softGlow(g,x,y-46,have?40:22,H.col,have?0.5+0.3*pk:0.18);g.restore();
    g.font='bold 16px system-ui';g.textAlign='center';g.textBaseline='middle';g.globalAlpha=have?1:0.45;g.fillText(MATS[hbRecipe(b.id).id].ic,x,y-48-pk*2);g.globalAlpha=1;
    if(G.hbNear===b){g.fillStyle='rgba(255,230,190,.95)';g.font='700 11px system-ui';g.fillText(have?'Пробудить: '+H.name:'Нужна '+MATS[hbRecipe(b.id).id].n,x,y-70);}}
  else{g.save();g.globalCompositeOperation='lighter';softGlow(g,x,y-40,30,H.col,0.3);g.restore();}
}
function hbDrawWorld(g,tx0,tx1,ty0,ty1){
  if(G.dim!==1)return;const t=G.time;
  for(const b of HB_ALL){
    if(!hbVisible(b,tx0,tx1,ty0,ty1))continue;
    const T=HB_THEME[b.id],X0=b.x0*TILE,Y0=b.y0*TILE,FYp=(b.y0+b.FY)*TILE;
    /* стена позади — только на пустых клетках внутри */
    g.save();g.fillStyle=hbWallPattern(g,b.id);
    const ya=Math.max(ty0,b.y0+2),yb=Math.min(ty1,b.y0+b.FY+1),xa=Math.max(tx0,b.x0+2),xb=Math.min(tx1,b.x0+b.W-3);
    for(let ty=ya;ty<=yb;ty++){let run=-1;
      for(let tx=xa;tx<=xb+1;tx++){const tt=tx<=xb?getTile(tx,ty):-1,ok=tt===T_AIR||tt===T_LADDER;
        if(ok&&run<0)run=tx;if(!ok&&run>=0){g.fillRect(run*TILE,ty*TILE,(tx-run)*TILE,TILE);run=-1;}}}
    /* затемнение к потолку и тёплый отсвет снизу */
    const gr=g.createLinearGradient(0,Y0+2*TILE,0,FYp);gr.addColorStop(0,'rgba(0,0,0,.55)');gr.addColorStop(0.6,'rgba(0,0,0,.15)');gr.addColorStop(1,hexA(T.acc,0.12));
    g.fillStyle=gr;g.beginPath();
    for(let ty=ya;ty<=yb;ty++){let run=-1;for(let tx=xa;tx<=xb+1;tx++){const tt=tx<=xb?getTile(tx,ty):-1,ok=tt===T_AIR||tt===T_LADDER;if(ok&&run<0)run=tx;if(!ok&&run>=0){g.rect(run*TILE,ty*TILE,(tx-run)*TILE,TILE);run=-1;}}}
    g.fill();
    g.restore();
    HB_DECOR[b.id](g,b,t,X0,Y0,FYp);
    hbDrawPedestal(g,b,t);
    /* закрытые ворота: светящиеся печати поверх блоков */
    if(G.hb&&G.hb.b===b&&G.hbGateT!==undefined){for(const [x,y] of hbGateCells(b)){if(getTile(x,y)!==T_HBWALL)continue;
      g.save();g.globalCompositeOperation='lighter';g.fillStyle=hexA(T.acc,0.18+0.12*Math.sin(t*5+y));g.fillRect(x*TILE+2,y*TILE+2,TILE-4,TILE-4);
      g.strokeStyle=hexA(T.acc,0.7);g.lineWidth=1.4;g.beginPath();g.moveTo(x*TILE+8,y*TILE+8);g.lineTo(x*TILE+24,y*TILE+24);g.moveTo(x*TILE+24,y*TILE+8);g.lineTo(x*TILE+8,y*TILE+24);g.stroke();g.restore();}}
  }
}
const HB_DECOR={
  herald(g,b,t,X0,Y0,FY){
    /* колоннада из базальта с порванными знамёнами, жаровни, статуи крылатых глашатаев */
    for(const lx of [6,17,38,49]){const x=X0+lx*TILE+16;
      g.fillStyle='#3a322e';g.fillRect(x-10,Y0+2*TILE,20,FY-Y0-2*TILE);g.fillStyle='rgba(255,255,255,.05)';g.fillRect(x-10,Y0+2*TILE,4,FY-Y0-2*TILE);
      g.fillStyle='#4a403a';g.fillRect(x-14,Y0+2*TILE,28,10);g.fillRect(x-14,FY-10,28,10);
      hbBanner(g,x,Y0+3*TILE,70,'#5a2a1a',t,lx,'🔥');}
    for(const lx of [11,44])hbBrazier(g,X0+lx*TILE+16,FY-12,'#ff8a3a',t,lx);
    for(const lx of [27.5]){const x=X0+lx*TILE+16,y=Y0+4*TILE;
      g.fillStyle='rgba(60,50,46,.9)';g.beginPath();g.moveTo(x,y);g.lineTo(x-40,y-10);g.lineTo(x-18,y+20);g.lineTo(x,y+60);g.lineTo(x+18,y+20);g.lineTo(x+40,y-10);g.closePath();g.fill();
      g.save();g.globalCompositeOperation='lighter';softGlow(g,x,y+14,26,'#ff8a3a',0.3+0.15*Math.sin(t*2));g.restore();}
    /* хлопья пепла */
    g.fillStyle='rgba(200,190,180,.45)';for(let k=0;k<26;k++){const x=X0+(2+((k*37+t*14*(k%3+1))%(b.W-4)*TILE)/1),y=Y0+2*TILE+((k*53+t*20)%((b.FY-2)*TILE));g.fillRect(X0+2*TILE+((k*97+t*(10+k%5*4))%((b.W-4)*TILE)),y,2,2);void x;}
  },
  mother(g,b,t,X0,Y0,FY){
    /* рёбра-арки, свисающие мешки и пуповины, бьющиеся жилы */
    /* рёбра исполинской грудной клетки вдоль стен, позвоночник под потолком */
    const top=Y0+2*TILE,cx=X0+b.W*TILE/2;
    g.strokeStyle='#3a1a18';g.lineWidth=18;g.beginPath();g.moveTo(X0+3*TILE,top+10);g.lineTo(X0+(b.W-3)*TILE,top+10);g.stroke();
    for(let k=0;k<12;k++){const x=X0+(4+k*4.4)*TILE;g.fillStyle='#cdbb9a';g.beginPath();g.ellipse(x,top+10,14,10,0,0,TAU);g.fill();g.fillStyle='#8a7a60';g.fillRect(x-3,top+2,6,16);}
    for(const s of [-1,1])for(let k=0;k<4;k++){const x0=cx+s*(130+k*150),x1=x0+s*120,y1=FY-30-k*10;
      g.lineCap='round';g.strokeStyle='#cdbb9a';g.lineWidth=13-k;g.beginPath();g.moveTo(x0,top+14);g.bezierCurveTo(x0+s*140,top+120,x1+s*30,y1-140,x1,y1);g.stroke();
      g.strokeStyle='rgba(90,60,40,.55)';g.lineWidth=3;g.stroke();}
    for(let k=0;k<7;k++){const x=X0+(5+k*7.5)*TILE,L=40+((k*29)%50)+Math.sin(t+k)*4,top=Y0+2*TILE;
      g.strokeStyle='#5a0a18';g.lineWidth=3;g.beginPath();g.moveTo(x,top);g.quadraticCurveTo(x+Math.sin(t*0.8+k)*8,top+L*0.6,x,top+L);g.stroke();
      const r=10+(k%3)*3,pk=1+Math.sin(t*2+k)*0.06;g.fillStyle=mobG(g,x,top+L+r,r,'#8a1a2a');g.beginPath();g.ellipse(x,top+L+r,r*pk,r*1.2*pk,0,0,TAU);g.fill();
      g.save();g.globalCompositeOperation='lighter';softGlow(g,x,top+L+r,r*1.8,'#ff2a3a',0.2);g.restore();}
    for(const lx of [3,52])hbBrazier(g,X0+lx*TILE+16,FY-12,'#ff3a4a',t,lx);
  },
  toadking(g,b,t,X0,Y0,FY){
    /* мшистые арки, свисающий мох, серные кристаллы, кувшинки на кислоте */
    for(const lx of [9,46]){const x=X0+lx*TILE+16;g.fillStyle='#2e3420';g.fillRect(x-12,Y0+2*TILE,24,FY-Y0-2*TILE);
      for(let k=0;k<5;k++){g.fillStyle='rgba(120,150,50,.55)';g.beginPath();g.ellipse(x+(k%2?8:-8),Y0+3*TILE+k*60,8,14,0,0,TAU);g.fill();}}
    for(let k=0;k<12;k++){const x=X0+(3+k*4.5)*TILE,L=30+((k*41)%60);g.strokeStyle='rgba(110,140,40,.75)';g.lineWidth=2;g.beginPath();g.moveTo(x,Y0+2*TILE);g.quadraticCurveTo(x+Math.sin(t+k)*6,Y0+2*TILE+L*0.6,x+Math.sin(t*0.7+k)*4,Y0+2*TILE+L);g.stroke();}
    for(const [lx,h] of [[4,30],[5,20],[51,26],[52,34]]){const x=X0+lx*TILE+16;g.fillStyle=hbLin(g,x,FY,x,FY-h,[[0,'#8a8010'],[1,'#fff6a0']]);g.beginPath();g.moveTo(x-7,FY);g.lineTo(x,FY-h);g.lineTo(x+7,FY);g.fill();
      g.save();g.globalCompositeOperation='lighter';softGlow(g,x,FY-h*0.5,h,'#e8e04a',0.3);g.restore();}
    for(const lx of [19,22,33,36]){const x=X0+lx*TILE+16+Math.sin(t*0.6+lx)*6;g.fillStyle='#4a7a2a';g.beginPath();g.ellipse(x,FY+1,12,3.4,0,0.3,TAU-0.1);g.lineTo(x,FY+1);g.fill();}
  },
  emperor(g,b,t,X0,Y0,FY){
    /* ниши с черепами, свечи, огромный трон за помостом */
    const tx=X0+28*TILE,ty=FY-2*TILE;
    g.fillStyle='#1e1a24';g.fillRect(tx-70,ty-210,140,210);
    g.fillStyle='#3a3444';g.beginPath();g.moveTo(tx-80,ty);g.lineTo(tx-80,ty-170);g.quadraticCurveTo(tx-60,ty-260,tx,ty-280);g.quadraticCurveTo(tx+60,ty-260,tx+80,ty-170);g.lineTo(tx+80,ty);g.closePath();g.fill();
    g.strokeStyle='#e0b040';g.lineWidth=3;g.stroke();
    g.fillStyle='#d8d0bc';g.beginPath();g.arc(tx,ty-230,22,0,TAU);g.fill();g.fillRect(tx-14,ty-214,28,14);g.fillStyle='#121016';g.beginPath();g.arc(tx-8,ty-232,6,0,TAU);g.arc(tx+8,ty-232,6,0,TAU);g.fill();
    g.save();g.globalCompositeOperation='lighter';for(const s of [-8,8])softGlow(g,tx+s,ty-232,14,'#9ad8ff',0.6+0.2*Math.sin(t*2+s));g.restore();
    for(const s of [-1,1])for(let k=0;k<4;k++){const x=tx+s*(130+k*90),y=Y0+5*TILE+(k%2)*60;g.fillStyle='#14121a';g.beginPath();g.arc(x,y,22,Math.PI,TAU);g.lineTo(x+22,y+30);g.lineTo(x-22,y+30);g.fill();
      g.fillStyle='#d8d0bc';g.beginPath();g.arc(x,y+12,9,0,TAU);g.fill();g.fillStyle='#121016';g.fillRect(x-5,y+10,3,3);g.fillRect(x+2,y+10,3,3);}
    for(const lx of [3,7,48,52]){const x=X0+lx*TILE+16;g.fillStyle='#e8e0cc';g.fillRect(x-3,FY-18,6,18);hbFlame(g,x,FY-18,3,10,t,lx,'#9ad8ff','#e8f8ff');g.save();g.globalCompositeOperation='lighter';softGlow(g,x,FY-24,30,'#9ad8ff',0.35);g.restore();}
  },
  warden(g,b,t,X0,Y0,FY){
    /* наковальни, мехи, цепи над платформами, лавопады */
    for(const [a,c] of [[10,14],[17,21],[25,30],[34,38],[41,45]]){const xa=X0+a*TILE+8,xb=X0+(c+1)*TILE-8,py=a===25?FY-2*TILE:FY-TILE;
      for(const x of [xa,xb]){g.strokeStyle='#3a3a44';g.lineWidth=3;g.setLineDash([6,4]);g.beginPath();g.moveTo(x,Y0+2*TILE);g.lineTo(x+Math.sin(t*0.8+x)*2,py);g.stroke();g.setLineDash([]);}}
    for(const lx of [4,52]){const x=X0+lx*TILE+16;g.fillStyle='#2a2a30';g.fillRect(x-16,FY-24,32,10);g.fillRect(x-8,FY-14,16,14);g.fillStyle='#4a4a54';g.fillRect(x-16,FY-24,32,3);}
    for(const lx of [2.2,52.8]){const x=X0+lx*TILE+16;const gr=g.createLinearGradient(x-10,0,x+10,0);gr.addColorStop(0,'rgba(255,90,20,0)');gr.addColorStop(0.5,'rgba(255,170,60,.9)');gr.addColorStop(1,'rgba(255,90,20,0)');
      g.fillStyle=gr;g.fillRect(x-10,Y0+2*TILE,20,FY-Y0-2*TILE);g.save();g.globalCompositeOperation='lighter';softGlow(g,x,FY-40,60,'#ff6a10',0.35);g.restore();}
    g.save();g.globalCompositeOperation='lighter';const gr2=g.createLinearGradient(0,FY-160,0,FY);gr2.addColorStop(0,'rgba(255,90,20,0)');gr2.addColorStop(1,'rgba(255,90,20,.22)');g.fillStyle=gr2;g.fillRect(X0+8*TILE,FY-160,40*TILE,160);g.restore();
  },
  archdemon(g,b,t,X0,Y0,FY){
    /* колоссальный зал: колонны, знамёна, лавопады по стенам, круг рун, трон со статуей Архидемона */
    const cx=X0+48*TILE,ty=FY-2*TILE;
    for(const lx of [8,20,30,66,76,88]){const x=X0+lx*TILE;
      g.fillStyle='#2a1416';g.fillRect(x-18,Y0+2*TILE,36,FY-Y0-2*TILE);g.fillStyle='rgba(255,90,40,.08)';g.fillRect(x-18,Y0+2*TILE,6,FY-Y0-2*TILE);
      g.fillStyle='#3a1c1e';g.fillRect(x-24,Y0+2*TILE,48,16);g.fillRect(x-24,FY-16,48,16);
      g.fillStyle='#e0b040';g.fillRect(x-24,Y0+2*TILE+14,48,2);g.fillRect(x-24,FY-16,48,2);
      hbBanner(g,x,Y0+4*TILE,120,'#6a0e10',t,lx,'🔱');}
    for(const lx of [3,92]){const x=X0+lx*TILE+16;const gr=g.createLinearGradient(x-14,0,x+14,0);gr.addColorStop(0,'rgba(255,90,20,0)');gr.addColorStop(0.5,'rgba(255,170,60,.9)');gr.addColorStop(1,'rgba(255,90,20,0)');
      g.fillStyle=gr;g.fillRect(x-14,Y0+2*TILE,28,FY-Y0-2*TILE);}
    for(const lx of [14,26,36,60,70,82])hbBrazier(g,X0+lx*TILE+16,FY-12,'#ff5a2a',t,lx);
    /* круг рун на полу перед троном */
    g.save();g.translate(cx,FY-4);g.scale(1,0.22);g.strokeStyle='rgba(255,80,40,'+(0.35+0.2*Math.sin(t*2))+')';g.lineWidth=6;g.beginPath();g.arc(0,0,520,0,TAU);g.stroke();g.lineWidth=3;g.beginPath();g.arc(0,0,440,0,TAU);g.stroke();
    for(let k=0;k<12;k++){const a=k/12*TAU+t*0.1;g.save();g.rotate(a);g.translate(480,0);g.fillStyle='rgba(255,120,60,.6)';g.fillRect(-10,-14,20,28);g.restore();}g.restore();
    /* трон */
    g.fillStyle='#1e0c0e';g.beginPath();g.moveTo(cx-120,ty);g.lineTo(cx-120,ty-200);g.lineTo(cx-90,ty-300);g.lineTo(cx-50,ty-240);g.lineTo(cx,ty-360);g.lineTo(cx+50,ty-240);g.lineTo(cx+90,ty-300);g.lineTo(cx+120,ty-200);g.lineTo(cx+120,ty);g.closePath();g.fill();
    g.strokeStyle='#e0b040';g.lineWidth=4;g.stroke();
    g.fillStyle='#3a1416';g.fillRect(cx-90,ty-90,180,90);g.fillStyle='#5a1c1e';g.fillRect(cx-100,ty-96,200,12);
    /* статуя: каменный Архидемон восседает, пока его не пробудят */
    const awake=G.hb&&G.hb.id==='archdemon'&&!(G.bossCut&&G.bossCut.t<G.bossCut.roarT-2);
    if(!awake){const st=hbStatueImg();g.drawImage(st,cx-st.width/2,ty-60-st.height+40);
      g.save();g.globalCompositeOperation='lighter';for(const ex of [cx+20,cx+31])softGlow(g,ex,ty-60-220*0.83-8,14,'#ff4a2a',0.35+0.25*Math.sin(t*1.5));g.restore();}
    else{g.fillStyle='#2a2224';for(let k=0;k<9;k++){g.beginPath();g.ellipse(cx-80+k*20,ty-96+((k*7)%3)*3,10+(k%3)*4,6,k,0,TAU);g.fill();}}
    /* балкон и надпись */
    g.fillStyle='rgba(255,210,150,.55)';g.font='700 14px system-ui';g.textAlign='center';g.fillText('ТРОН ПРЕИСПОДНЕЙ',cx,Y0+2*TILE+26);
  }
};

/* каменная статуя Архидемона над троном: рисуется один раз и хранится картинкой */
let _hbStatue=null;
function hbStatueImg(){
  if(_hbStatue)return _hbStatue;
  const W=560,H=560,c=document.createElement('canvas');c.width=W;c.height=H;const q=c.getContext('2d');
  const fm={x:0,y:0,w:220,h:220,facing:1,def:{hb:'archdemon',mech:'hboss'},b:{phase:1,atk:'idle',wings:0.55,flap:0},anim:0,phase:0,tele:0,spawnS:1,onGround:true,vx:0,vy:0,lookX:0,lookY:0,alpha:1};
  const keepQ=settings.quality;settings.quality='low';   /* без свечений: камень не светится */
  try{q.save();q.translate(W/2,H-40);q.scale(2.2,2.2);HB_MODEL.archdemon(q,fm,0,fm.b);q.restore();}catch(e){}
  settings.quality=keepQ;
  /* перекрашиваем в тёмный базальт с прожилками */
  const d=q.getImageData(0,0,W,H),a=d.data;
  for(let i=0;i<a.length;i+=4){if(!a[i+3])continue;const l=(a[i]*0.3+a[i+1]*0.59+a[i+2]*0.11)/255,v=28+l*70;a[i]=v*1.05;a[i+1]=v*0.92;a[i+2]=v*0.9;}
  q.putImageData(d,0,0);
  q.globalCompositeOperation='source-atop';const gr=q.createLinearGradient(0,0,0,H);gr.addColorStop(0,'rgba(255,255,255,.08)');gr.addColorStop(1,'rgba(0,0,0,.35)');q.fillStyle=gr;q.fillRect(0,0,W,H);
  q.strokeStyle='rgba(255,90,40,.35)';q.lineWidth=1.4;for(let k=0;k<7;k++){q.beginPath();let x=W*0.3+k*30,y=H*0.25+(k%3)*60;q.moveTo(x,y);for(let j=0;j<4;j++){x+=(Math.sin(k*3+j)*16);y+=18;q.lineTo(x,y);}q.stroke();}
  return (_hbStatue=c);
}
/* ---------- эффекты атак ---------- */
function drawHbFx(g){
  if(!hbFx.length&&!G.hbWind)return;const t=G.time;
  for(const f of hbFx){
    switch(f.type){
      case 'pillar':{
        if(f.t<0)break;
        if(!f.fired){const k=clamp(f.t/f.warn,0,1);
          g.save();g.globalCompositeOperation='lighter';g.fillStyle=hexA(f.col,0.18+0.3*k);g.fillRect(f.x-f.w/2,f.y-4,f.w,4);softGlow(g,f.x,f.y-6,f.w*0.8,f.col,0.25+0.4*k);g.restore();
          if(Math.random()<0.4)spawnPart(f.x+rnd(-f.w/2,f.w/2),f.y-2,rnd(-10,10),rnd(-120,-40),0.3,f.col,2,0);
          g.strokeStyle=hexA(f.col,0.35*k);g.setLineDash([5,5]);g.lineWidth=1.2;g.strokeRect(f.x-f.w/2,f.y-f.h,f.w,f.h);g.setLineDash([]);}
        else{const k=clamp((f.t-f.warn)/0.12,0,1),fade=clamp(1-(f.t-f.warn-(f.dur||0.35))/0.4,0,1),h=f.h*k;
          g.save();g.globalAlpha=fade;
          if(f.style==='tentacle'){g.strokeStyle='#8a1424';g.lineCap='round';g.lineWidth=f.w*0.5;g.beginPath();g.moveTo(f.x,f.y);g.quadraticCurveTo(f.x+Math.sin(t*6+f.x)*14,f.y-h*0.6,f.x+Math.sin(t*4)*8,f.y-h);g.stroke();
            g.strokeStyle='#c83448';g.lineWidth=f.w*0.3;g.stroke();g.fillStyle='#f0b0b8';for(let q=1;q<5;q++){g.beginPath();g.arc(f.x+Math.sin(t*5+q)*3+5,f.y-h*q/5,2.4,0,TAU);g.fill();}}
          else if(f.style==='bone'){for(let q=-1;q<=1;q++){const hh=h*(q?0.7:1);g.fillStyle='#e8e0cc';g.beginPath();g.moveTo(f.x+q*12-7,f.y);g.lineTo(f.x+q*12,f.y-hh);g.lineTo(f.x+q*12+7,f.y);g.fill();}}
          else{const gr=g.createLinearGradient(f.x-f.w/2,0,f.x+f.w/2,0);gr.addColorStop(0,hexA(f.col,0));gr.addColorStop(0.3,hexA(f.col,0.9));gr.addColorStop(0.5,f.style==='acid'?'#efffc0':'#fff0b0');gr.addColorStop(0.7,hexA(f.col,0.9));gr.addColorStop(1,hexA(f.col,0));
            g.fillStyle=gr;g.beginPath();g.moveTo(f.x-f.w/2,f.y);g.quadraticCurveTo(f.x-f.w*0.3,f.y-h*0.6,f.x+Math.sin(t*20)*4,f.y-h);g.quadraticCurveTo(f.x+f.w*0.3,f.y-h*0.6,f.x+f.w/2,f.y);g.closePath();g.fill();
            g.globalCompositeOperation='lighter';softGlow(g,f.x,f.y-h*0.5,f.w*1.2,f.col,0.5);}
          g.restore();}
        break;}
      case 'meteor':{
        if(f.gy===undefined)f.gy=hbFloorAt(f.x,f.y);
        const k=clamp(f.t/f.warn,0,1);
        g.save();g.translate(f.x,f.gy);g.scale(1,0.3);g.strokeStyle=hexA(f.col,0.3+0.5*k);g.lineWidth=3;g.beginPath();g.arc(0,0,(f.blast||60)*(1.3-0.3*k),0,TAU);g.stroke();
        g.fillStyle=hexA(f.col,0.12*k);g.fill();g.restore();
        if(f.t>=f.warn){g.save();g.globalCompositeOperation='lighter';softGlow(g,f.x,f.y,f.r*2.4,f.col,0.7);g.restore();
          g.fillStyle='#3a1a0a';g.beginPath();g.arc(f.x,f.y,f.r*0.6,0,TAU);g.fill();g.fillStyle=f.col;g.beginPath();g.arc(f.x-2,f.y-2,f.r*0.35,0,TAU);g.fill();}
        break;}
      case 'zone':{
        if(f.t<0)break;const k=clamp(f.t/f.warn,0,1),on=f.t>=f.warn,fade=on?clamp((f.warn+f.dur-f.t)/0.4,0,1):1;
        g.save();g.translate(f.x,f.y);g.globalAlpha=fade;
        if(f.gas){g.globalCompositeOperation='source-over';for(let q=0;q<5;q++){const a=q*1.3+t*0.4;g.fillStyle=hexA(f.col,on?0.28:0.12);g.beginPath();g.arc(Math.cos(a)*f.r*0.4,Math.sin(a)*f.r*0.3,f.r*0.6,0,TAU);g.fill();}}
        else{g.rotate(t*(on?1.2:0.4));g.strokeStyle=hexA(f.col,on?0.9:0.35+0.4*k);g.lineWidth=on?3:1.6;if(!on)g.setLineDash([8,6]);g.beginPath();g.arc(0,0,f.r*(on?1:0.6+0.4*k),0,TAU);g.stroke();g.setLineDash([]);
          if(on){g.globalCompositeOperation='lighter';softGlow(g,0,0,f.r*1.1,f.col,0.4);g.strokeStyle=hexA(f.col,0.7);g.lineWidth=1.4;g.beginPath();for(let q=0;q<5;q++){const a=q/5*TAU*2;const x=Math.cos(a)*f.r*0.85,y=Math.sin(a)*f.r*0.85;q?g.lineTo(x,y):g.moveTo(x,y);}g.closePath();g.stroke();}}
        g.restore();break;}
      case 'tornado':{
        const fade=Math.min(1,f.t*3,(f.life-f.t)*2);g.save();g.globalAlpha=fade;
        for(let q=0;q<12;q++){const y=f.y-q/12*f.h,w=10+q*3.2,a=t*9+q*0.7;g.strokeStyle=hexA(f.col,0.55);g.lineWidth=3;g.beginPath();g.ellipse(f.x+Math.sin(t*3+q*0.4)*6,y,w,w*0.28,0,a%TAU,(a%TAU)+4.2);g.stroke();}
        g.restore();break;}
      case 'wall':{
        if(f.t<(f.warn||0))break;const fade=Math.min(1,(f.life+(f.warn||0)-f.t)*2);g.save();g.globalAlpha=fade;
        if(f.style==='bone'){for(let q=-2;q<=2;q++){const hh=f.h*(1-Math.abs(q)*0.18);g.fillStyle=q%2?'#d8d0bc':'#f0e8d8';g.beginPath();g.moveTo(f.x+q*9-6,f.y);g.lineTo(f.x+q*9+Math.sign(f.vx)*4,f.y-hh);g.lineTo(f.x+q*9+6,f.y);g.fill();}}
        else{const c=f.col;const gr=g.createLinearGradient(0,f.y-f.h,0,f.y);gr.addColorStop(0,hexA(c,0));gr.addColorStop(0.4,hexA(c,0.85));gr.addColorStop(1,shadeHex(c,-0.3));
          g.fillStyle=gr;g.beginPath();g.moveTo(f.x-Math.sign(f.vx)*40,f.y);g.quadraticCurveTo(f.x-Math.sign(f.vx)*10,f.y-f.h*1.1,f.x+Math.sign(f.vx)*14,f.y-f.h*0.6+Math.sin(t*14)*4);g.quadraticCurveTo(f.x+Math.sign(f.vx)*20,f.y-f.h*0.2,f.x+Math.sign(f.vx)*22,f.y);g.closePath();g.fill();
          if(f.style==='fire'||f.style==='lava'){g.globalCompositeOperation='lighter';softGlow(g,f.x,f.y-f.h*0.5,f.h,c,0.5);}}
        g.restore();break;}
      case 'line':{const a=clamp(1-f.t/f.life,0,1);g.save();g.strokeStyle=hexA(f.col,0.25+0.5*(1-a));g.lineWidth=f.w*(0.5+(1-a));g.setLineDash([14,8]);g.lineDashOffset=-t*80;g.beginPath();g.moveTo(f.x1,f.y1);g.lineTo(f.x2,f.y2);g.stroke();g.setLineDash([]);g.restore();break;}
      case 'chain':{
        if(f.t<0)break;
        if(!f.fired){const k=clamp(f.t/f.warn,0,1);g.save();g.strokeStyle=hexA(f.col,0.2+0.5*k);g.lineWidth=1+k*2;g.setLineDash([4,6]);g.beginPath();g.moveTo(f.x,f.y);g.lineTo(f.tx,f.ty);g.stroke();g.setLineDash([]);
          g.globalCompositeOperation='lighter';softGlow(g,f.x,f.y,22,f.col,0.5*k);g.restore();}
        else{const fade=clamp(1-(f.t-f.warn)/0.45,0,1);g.save();g.globalAlpha=fade;const a=Math.atan2(f.y2-f.y,f.x2-f.x),L=Math.hypot(f.x2-f.x,f.y2-f.y);
          g.translate(f.x,f.y);g.rotate(a);g.strokeStyle='#5a5a66';g.lineWidth=3;for(let d=0;d<L;d+=14){g.beginPath();g.ellipse(d+7,0,7,d/14%2?2:4.4,0,0,TAU);g.stroke();}
          g.globalCompositeOperation='lighter';g.strokeStyle=hexA(f.col,0.6);g.lineWidth=6;g.beginPath();g.moveTo(0,0);g.lineTo(L,0);g.stroke();g.restore();}
        break;}
      case 'sweep':{
        const on=f.t>=f.warn,k=clamp(f.t/f.warn,0,1);g.save();
        if(!on){g.fillStyle=hexA(f.col,0.08+0.18*k);g.fillRect(f.x-f.w,f.y-f.h/2,f.w*2,f.h);g.strokeStyle=hexA(f.col,0.5*k);g.setLineDash([12,8]);g.lineWidth=2;g.strokeRect(f.x-f.w,f.y-f.h/2,f.w*2,f.h);g.setLineDash([]);}
        else{const a=clamp(1-(f.t-f.warn)/0.5,0,1);g.globalCompositeOperation='lighter';g.fillStyle=hexA(f.col,0.6*a);g.fillRect(f.x-f.w,f.y-f.h*0.3,f.w*2,f.h*0.6);}
        g.restore();break;}
      case 'mark':{const k=clamp(f.t/f.life,0,1);g.save();g.translate(f.x,f.y);g.scale(1,0.28);g.strokeStyle=hexA(f.col,0.4+0.5*k);g.lineWidth=4;g.beginPath();g.arc(0,0,f.r*(1.4-0.4*k),0,TAU);g.stroke();
        g.fillStyle=hexA(f.col,0.15*k);g.fill();g.restore();break;}
      case 'shade':{
        const H=hbById(f.id),D=hbDef(f.id),a=Math.min(1,f.t*3,(f.life-f.t)*2)*0.5;if(a<=0)break;
        const fm={x:f.x,y:f.y,w:D.w,h:D.h,facing:f.f,def:D,b:{phase:2,atk:'idle',horn:f.t>0.6&&f.t<1.2?1:0,open:0.6,croak:f.t>0.6?0.6:0},anim:f.t,phase:1,tele:clamp(f.t/0.9,0,1),spawnS:1,onGround:true,vx:0,vy:0,alpha:a,lookX:0,lookY:0,hbB:G.hb?G.hb.b:HB_FINAL};
        g.save();g.globalAlpha=a;g.translate(f.x,f.y);const U=D.h/100;g.scale(U*f.f,U);
        try{HB_MODEL[f.id](g,fm,t,fm.b,U);}catch(e){}
        g.restore();
        g.save();g.globalCompositeOperation='lighter';softGlow(g,f.x,f.y-D.h*0.5,D.h,H.col,a*0.6);g.restore();
        break;}
    }
  }
}
/* ---------- снаряды Владык ---------- */
function hbDrawProj(g,p){
  const t=G.time;
  switch(p.hbk){
    case 'ember':{g.save();g.globalCompositeOperation='lighter';softGlow(g,p.x,p.y,p.size*3,'#ff7a2a',0.7);
      g.strokeStyle='rgba(255,140,50,.6)';g.lineWidth=p.size;g.lineCap='round';g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x-p.vx*0.04,p.y-p.vy*0.04);g.stroke();g.restore();
      g.fillStyle='#3a1608';g.beginPath();g.arc(p.x,p.y,p.size*0.8,0,TAU);g.fill();g.fillStyle='#ffb040';g.beginPath();g.arc(p.x-1,p.y-1,p.size*0.45,0,TAU);g.fill();return true;}
    case 'clot':case 'drop':{const a=Math.atan2(p.vy,p.vx);g.save();g.translate(p.x,p.y);g.rotate(a);g.fillStyle='#8a0a1a';g.beginPath();g.ellipse(0,0,p.size*(p.hbk==='drop'?1.8:1.2),p.size*(p.hbk==='drop'?0.6:1),0,0,TAU);g.fill();
      g.fillStyle='rgba(255,120,130,.6)';g.beginPath();g.arc(p.size*0.3,-p.size*0.3,p.size*0.3,0,TAU);g.fill();g.restore();return true;}
    case 'acid':{g.save();g.globalCompositeOperation='lighter';softGlow(g,p.x,p.y,p.size*2.6,'#9aff40',0.55);g.restore();
      g.fillStyle='#6ac020';g.beginPath();g.arc(p.x,p.y,p.size,0,TAU);g.fill();g.fillStyle='#d8ff90';g.beginPath();g.arc(p.x-2,p.y-2,p.size*0.4,0,TAU);g.fill();return true;}
    case 'bomb':{g.fillStyle='#4a4418';g.beginPath();g.arc(p.x,p.y,p.size,0,TAU);g.fill();g.fillStyle='#e8d84a';g.beginPath();g.arc(p.x-3,p.y-3,p.size*0.35,0,TAU);g.fill();
      g.strokeStyle='#8a7a40';g.lineWidth=1.6;g.beginPath();g.moveTo(p.x,p.y-p.size);g.quadraticCurveTo(p.x+4,p.y-p.size-6,p.x+2,p.y-p.size-9);g.stroke();
      g.save();g.globalCompositeOperation='lighter';softGlow(g,p.x+2,p.y-p.size-9,8+Math.sin(t*30)*3,'#ffd060',0.9);g.restore();return true;}
    case 'skull':{g.save();g.globalCompositeOperation='lighter';softGlow(g,p.x,p.y,p.size*3,'#7ac8ff',0.6);
      g.strokeStyle='rgba(120,200,255,.5)';g.lineWidth=p.size*0.9;g.lineCap='round';g.beginPath();g.moveTo(p.x,p.y);g.lineTo(p.x-p.vx*0.06,p.y-p.vy*0.06);g.stroke();g.restore();
      const f=p.vx>=0?1:-1;g.save();g.translate(p.x,p.y);g.scale(f,1);g.fillStyle='#e8e0cc';g.beginPath();g.arc(0,-1,p.size*0.8,0,TAU);g.fill();g.fillRect(-p.size*0.5,0,p.size,p.size*0.6);
      g.fillStyle='#0a1a2a';g.fillRect(-p.size*0.5,-p.size*0.3,p.size*0.35,p.size*0.35);g.fillRect(p.size*0.1,-p.size*0.3,p.size*0.35,p.size*0.35);
      g.fillStyle='#9ae0ff';g.fillRect(-p.size*0.42,-p.size*0.22,p.size*0.2,p.size*0.2);g.fillRect(p.size*0.18,-p.size*0.22,p.size*0.2,p.size*0.2);g.restore();return true;}
  }
  return false;
}

/* ---------- катсцены: эффекты появления ---------- */
function hbCutFxTick(c,dt){
  const H=hbById(c.hb),m=c.m;if(!m)return;const t=c.t,R=hbBounds(m);
  if(settings.quality==='low'&&Math.random()<0.5)return;
  const near=t>0.4&&t<c.roarT;
  switch(c.hb){
    case 'herald':if(near){const a=Math.random()*TAU,r=rnd(80,220);spawnPart(m.x+Math.cos(a)*r,m.y-m.h*0.5+Math.sin(a)*r*0.7,-Math.cos(a+1.2)*r*1.6,-Math.sin(a+1.2)*r*1.2,0.6,Math.random()<0.6?'#9a8a80':'#ff8a3a',rnd(2,4),0);}break;
    case 'mother':if(near){spawnPart(m.x+rnd(-90,90),R.floor-2,rnd(-40,40),rnd(-320,-120),rnd(0.5,1),Math.random()<0.5?'#8a0a1a':'#ff4a5a',rnd(2,4),700);if(Math.random()<0.3)shake(2);}break;
    case 'toadking':if(near){spawnPart(rnd(R.minX-80,R.maxX+80),R.top+4,rnd(-10,10),rnd(20,80),1,'#8a8070',2,500);if(Math.random()<0.5)spawnPart((m.hbB.x0+rnd(17,39))*TILE,R.floor-2,rnd(-20,20),rnd(-160,-60),0.6,'#b0ff60',3,400);}break;
    case 'emperor':if(near){const a=Math.random()*TAU,r=rnd(120,260);spawnPart(m.x+Math.cos(a)*r,m.y-m.h*0.5+Math.sin(a)*r,-Math.cos(a)*r*1.4,-Math.sin(a)*r*1.4,0.7,Math.random()<0.6?'#e8e0cc':'#9ad8ff',rnd(2,4),0);}break;
    case 'warden':if(near){spawnPart(m.x+rnd(-200,200),R.floor-2,rnd(-30,30),rnd(-380,-140),rnd(0.6,1.1),Math.random()<0.5?'#ff7a1a':'#ffd040',rnd(2,5),700);if(Math.random()<0.4)shake(2.5);}break;
    case 'archdemon':if(near){spawnPart(m.x+rnd(-260,260),R.floor-2,rnd(-30,30),rnd(-460,-160),rnd(0.6,1.2),Math.random()<0.5?'#ff5a1a':'#ffd040',rnd(2,6),600);if(t>c.roarT-2.4&&Math.random()<0.5)shake(4);}break;
  }
}
function hbDrawCutFx(g,c){
  const H=hbById(c.hb),m=c.m;if(!m)return;const t=c.t,b=m.hbB,p=hbPedPx(b);
  const o=clamp((t-0.2)/0.8,0,1)*clamp((c.roarT+0.8-t)/0.8,0,1);
  if(o<=0)return;
  g.save();g.globalCompositeOperation='lighter';
  /* столб света из постамента и круг призыва под боссом */
  const bw=18+10*Math.sin(t*8);const gr=g.createLinearGradient(p.x-bw,0,p.x+bw,0);gr.addColorStop(0,hexA(H.col,0));gr.addColorStop(0.5,hexA(H.col,0.55*o));gr.addColorStop(1,hexA(H.col,0));
  g.fillStyle=gr;g.fillRect(p.x-bw,(b.y0+2)*TILE,bw*2,p.y-(b.y0+2)*TILE-36);
  const fy=c.hb==='herald'||c.hb==='emperor'?(b.y0+b.FY)*TILE:Math.min(m.y,(b.y0+b.FY)*TILE);
  g.translate(m.x,fy-4);g.scale(1,0.26);
  const r=Math.max(m.w,m.h)*0.9+40;
  g.strokeStyle=hexA(H.col,0.7*o);g.lineWidth=5;g.beginPath();g.arc(0,0,r,0,TAU);g.stroke();
  g.lineWidth=2.4;g.beginPath();g.arc(0,0,r*0.78,0,TAU);g.stroke();
  g.rotate(t*0.8);g.beginPath();for(let k=0;k<=5;k++){const a=k/5*TAU*2-Math.PI/2;const x=Math.cos(a)*r*0.78,y=Math.sin(a)*r*0.78;k?g.lineTo(x,y):g.moveTo(x,y);}g.stroke();
  for(let k=0;k<10;k++){const a=k/10*TAU;g.fillStyle=hexA(H.col,0.8*o);g.fillRect(Math.cos(a)*r*0.9-5,Math.sin(a)*r*0.9-5,10,10);}
  g.restore();
  if(c.roared){const k=clamp((t-c.roarT)/0.9,0,1);g.save();g.translate(m.x,m.y-m.h*0.5);g.strokeStyle='rgba(255,255,255,'+(1-k)+')';g.lineWidth=10*(1-k)+1;g.beginPath();g.ellipse(0,0,40+k*600,30+k*340,0,0,TAU);g.stroke();g.restore();}
}

/* ---------- анимации смерти ---------- */
const HB_DEATH_T={herald:2.6,mother:2.8,toadking:2.6,emperor:2.8,warden:3.0,archdemon:4.2};
function hbUpdateDeath(d,rdt){
  d.t+=rdt;const m=d.m,T1=HB_DEATH_T[d.hb]||2.6,k=clamp(d.t/T1,0,1),H=hbById(d.hb),cy=d.y-m.h*0.5;
  m.dieK=k;m.hurt=d.t<T1&&Math.floor(d.t*12)%2?0.06:0;
  if(d.t<T1){
    shake(1.2+k*2.5);
    if(Math.random()<rdt*(6+k*10)){const a=Math.random()*TAU,r=rnd(10,Math.max(m.w,m.h)*0.5);burst(d.x+Math.cos(a)*r,cy+Math.sin(a)*r,8,Math.random()<0.5?'#ffffff':H.col,200,3);if(Math.random()<0.3)SFX.hit();}
    switch(d.hb){
      case 'herald':if(Math.random()<0.8)spawnPart(d.x+rnd(-m.w*0.6,m.w*0.6),cy+rnd(-m.h*0.4,m.h*0.4),rnd(-40,40),rnd(-30,60),rnd(0.8,1.6),Math.random()<0.7?'#8a7c74':'#ff8a3a',rnd(2,4),200);break;
      case 'mother':if(Math.random()<0.7)spawnPart(d.x+rnd(-40,40),cy+rnd(-40,20),rnd(-260,260),rnd(-420,-80),rnd(0.6,1.1),Math.random()<0.6?'#a0101e':'#ff4a5a',rnd(2,5),900);break;
      case 'toadking':if(Math.random()<0.5)spawnPart(d.x+rnd(-50,50),cy,rnd(-60,60),rnd(-160,-40),1.2,'#c8d040',rnd(3,6),-30);break;
      case 'emperor':if(Math.random()<0.6)spawnPart(d.x+rnd(-30,30),cy+rnd(-50,30),rnd(-30,30),rnd(-200,-80),1,'#9ad8ff',rnd(2,4),-60);break;
      case 'warden':if(Math.random()<0.8)spawnPart(d.x+rnd(-60,60),d.y-rnd(0,m.h),rnd(-20,20),rnd(-120,-40),1,Math.random()<0.5?'#5a5a5a':'#ff7a1a',rnd(3,6),-40);break;
      case 'archdemon':if(Math.random()<0.9)spawnPart(d.x+rnd(-90,90),cy+rnd(-90,90),rnd(-80,80),rnd(-260,-40),1,Math.random()<0.5?'#c89aff':'#ff5a1a',rnd(2,6),-30);break;
    }
  }
  if(d.t>=T1&&!d.flashed){
    d.flashed=true;G.hbFlash={t:1,col:d.hb==='archdemon'?'#d8b0ff':H.col};shake(d.hb==='archdemon'?34:22);SFX.boom();vib(260);
    for(let i=0;i<(d.hb==='archdemon'?220:140);i++){const a=Math.random()*TAU,sp=rnd(80,d.hb==='archdemon'?900:620);spawnPart(d.x,cy,Math.cos(a)*sp,Math.sin(a)*sp,rnd(0.6,2),i%3===0?'#ffffff':i%3===1?H.col:(d.hb==='archdemon'?'#b07aff':shadeHex(H.col,-0.3)),rnd(2,6),120);}
    shockRings.push({x:d.x,y:cy,r:10,max:d.hb==='archdemon'?1200:700,t:0,col:d.hb==='archdemon'?'#c89aff':H.col});
    if(d.hb==='mother')for(let i=0;i<4;i++)addPatch(d.x+(i-1.5)*60,d.y-6,70,8,'blood',0);
    if(d.hb==='toadking')gasCloud(d.x,cy,110,0,5);
    hbGiveLoot(d);SFX.chest&&SFX.chest();
    const tr=H.trophy?MATS[H.trophy]:null;
    floatText(d.x,cy-m.h*0.5-30,tr?tr.ic+' '+tr.n+'!':'🗝 Ключ Лиловых небес!','#ffe0a0');
    d.ix=d.x;d.iy=cy;d.ivy=-260;
  }
  if(d.flashed){/* трофей падает на пол, затем летит к игроку */
    const fl=(m.hbB.y0+m.hbB.FY)*TILE-14;
    if(d.t<T1+2.2){d.ivy+=900*rdt;d.iy=Math.min(fl,d.iy+d.ivy*rdt);if(d.iy>=fl)d.ivy*=-0.3;}
    else{d.ix=lerp(d.ix,player.x,Math.min(1,rdt*5));d.iy=lerp(d.iy,player.y-player.h*0.5,Math.min(1,rdt*5));}
  }
  if(G.hbFlash&&G.hbFlash.t>0)G.hbFlash.t-=rdt*0.6;
  if(d.t>T1+3.2)G.bossDeath=null;
}
function hbDrawDeath(g,d){
  const m=d.m,T1=HB_DEATH_T[d.hb]||2.6,H=hbById(d.hb),t=G.time;
  if(d.t<T1){
    const k=d.t/T1,cy=d.y-m.h*0.5;
    m.x=d.x+rnd(-1,1)*(1+k*4);m.y=d.y;m.alpha=1;
    g.save();
    switch(d.hb){
      case 'herald':g.translate(0,k*k*40);g.globalAlpha=1-Math.max(0,k-0.55)/0.45*0.85;break;
      case 'mother':g.translate(d.x,d.y);g.scale(1+k*0.2,1-k*0.45);g.translate(-d.x,-d.y);break;
      case 'toadking':g.translate(d.x,cy);g.rotate(-(m.facing||1)*Math.min(1,k*1.6)*Math.PI);g.scale(1+k*0.35,1+k*0.35);g.translate(-d.x,-cy);break;
      case 'emperor':g.translate(0,k*k*60);g.globalAlpha=1-k*0.5;break;
      case 'warden':g.translate(0,k*k*m.h*0.7);break;
      case 'archdemon':{g.translate(d.x,d.y);g.scale(1,1-Math.min(0.25,k*0.4));g.translate(-d.x,-d.y);break;}
    }
    drawMobSprite(g,m,t);
    g.restore();
    /* остывание Владыки Магмы и трещины света у остальных */
    g.save();g.globalCompositeOperation='lighter';g.translate(d.x,cy);
    const col=d.hb==='archdemon'?'#c89aff':d.hb==='warden'?'#ff9a3a':'#ffffff';
    const n=5+Math.floor(k*12);for(let i=0;i<n;i++){const a=i/n*TAU+t*0.5+(hash2(i,3,1)%10)*0.1,L=(m.h*0.4+k*m.h*2.2)*(0.6+(hash2(i,5,2)%40)/100);
      const gr=g.createLinearGradient(0,0,Math.cos(a)*L,Math.sin(a)*L);gr.addColorStop(0,hexA(col,0.3+k*0.5));gr.addColorStop(1,hexA(H.col,0));
      g.fillStyle=gr;g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(a-0.05)*L,Math.sin(a-0.05)*L);g.lineTo(Math.cos(a+0.05)*L,Math.sin(a+0.05)*L);g.closePath();g.fill();}
    softGlow(g,0,0,m.h*0.4+k*m.h*0.6,col,0.4+k*0.5);
    g.restore();
    if(d.hb==='warden'){g.save();g.globalAlpha=k*0.7;g.translate(d.x,d.y);g.fillStyle='#1a1414';g.beginPath();g.ellipse(0,-m.h*0.5+k*k*m.h*0.7,m.w*0.5,m.h*0.48,0,0,TAU);g.fill();g.restore();}
  }else{
    const k=clamp((d.t-T1)/1.2,0,1),cy=d.y-m.h*0.5;
    g.save();g.translate(d.x,cy);g.strokeStyle='rgba(255,255,255,'+(1-k)+')';g.lineWidth=16*(1-k)+1;g.beginPath();g.arc(0,0,30+k*700,0,TAU);g.stroke();
    g.strokeStyle=hexA(d.hb==='archdemon'?'#c89aff':H.col,0.8*(1-k));g.lineWidth=7*(1-k)+1;g.beginPath();g.arc(0,0,20+k*480,0,TAU);g.stroke();g.restore();
    /* лиловый разлом после Архидемона: намёк на третье измерение */
    if(d.hb==='archdemon'){const a=clamp(1-(d.t-T1-1.6)/1.6,0,1);if(a>0){g.save();g.globalCompositeOperation='lighter';g.translate(d.x,cy);softGlow(g,0,0,160,'#b07aff',0.6*a);
      g.strokeStyle='rgba(220,190,255,'+(0.8*a)+')';g.lineWidth=3;g.beginPath();g.moveTo(0,-90);g.lineTo(10,-40);g.lineTo(-8,0);g.lineTo(12,40);g.lineTo(0,90);g.stroke();g.restore();}}
  }
  /* трофей */
  if(d.flashed&&d.ix!==undefined){const tr=H.trophy?MATS[H.trophy]:{ic:'🗝',col:'#c89aff'};const a=clamp(T1+3.2-d.t,0,1);
    g.save();g.globalAlpha=a;g.globalCompositeOperation='lighter';softGlow(g,d.ix,d.iy,30+Math.sin(t*6)*4,tr.col,0.8);g.restore();
    g.save();g.globalAlpha=a;g.font='bold 24px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText(tr.ic,d.ix,d.iy+Math.sin(t*4)*2);g.restore();}
}
