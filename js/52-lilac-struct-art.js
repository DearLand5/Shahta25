'use strict';
/* ============================================================
   ЛИЛОВЫЕ НЕБЕСА — облик построек: задние стены, предметы, мимик,
   опасности испытаний, сонный карман и экранные эффекты.
   Свет сверху-слева, у каждой детали три тона. Предметы рисуются только
   на клетках T_AIR — лестницы и поставленные блоки не закрываются.
   ============================================================ */
const L3=(c)=>[shadeHex(c,0.32),c,shadeHex(c,-0.38)];

/* ---------- задние стены ---------- */
function lilStructWall(g,style,x,y,wx,wy,ceil){
  const h=hash2(wx,wy,5),fl=isSolid(wx,wy+1);
  switch(style){
    case 'llattice':{     /* беседка: белая решётка с лозой на фоне неба пещеры */
      g.strokeStyle='rgba(250,240,255,.32)';g.lineWidth=1.6;
      g.beginPath();for(let k=-32;k<=32;k+=16){g.moveTo(x+k,y);g.lineTo(x+k+32,y+32);g.moveTo(x+k+32,y);g.lineTo(x+k,y+32);}g.stroke();
      g.strokeStyle='rgba(120,90,140,.25)';g.lineWidth=0.8;g.beginPath();for(let k=-32;k<=32;k+=16){g.moveTo(x+k+1,y);g.lineTo(x+k+33,y+32);}g.stroke();
      if(h%3===0){g.fillStyle='#3e7a46';for(let k=0;k<4;k++){const lx=x+((h>>>(k*3))%28)+2,ly=y+((h>>>(k*3+7))%26)+3;g.beginPath();g.ellipse(lx,ly,3.2,1.8,k,0,TAU);g.fill();}
        g.fillStyle='#ffb0d8';g.beginPath();g.arc(x+8+(h%16),y+10+((h>>>5)%14),1.8,0,TAU);g.fill();}
      break;}
    case 'lglass':{       /* оранжерея: стеклянные панели в белых рамах */
      g.fillStyle='rgba(160,225,255,.13)';g.fillRect(x,y,TILE,TILE);
      g.fillStyle='rgba(255,255,255,.28)';g.fillRect(x,y,TILE,1.6);g.fillRect(x,y,1.6,TILE);g.fillRect(x+16,y,1,TILE);
      if(h%2===0){g.fillStyle='rgba(255,255,255,.09)';g.beginPath();g.moveTo(x+4,y+30);g.lineTo(x+12,y+30);g.lineTo(x+26,y+2);g.lineTo(x+18,y+2);g.closePath();g.fill();}
      g.fillStyle='rgba(220,250,255,.25)';for(let k=0;k<3;k++)g.fillRect(x+((h>>>(k*4))%30),y+((h>>>(k*4+2))%30),1.2,1.2);
      break;}
    case 'lchapel':{      /* часовня: светлый камень в перевязку */
      g.fillStyle='#3a3450';g.fillRect(x,y,TILE,TILE);
      for(let r=0;r<2;r++){const off=((wy*2+r)%2)?8:-8;for(let k=0;k<3;k++){const bx=x+off+k*16;
        g.fillStyle=((h>>>(r*3+k))&1)?'#4a4264':'#433c5a';g.fillRect(Math.max(x,bx+1),y+r*16+1,Math.min(15,x+TILE-Math.max(x,bx+1)),14);
        g.fillStyle='rgba(255,255,255,.06)';g.fillRect(Math.max(x,bx+1),y+r*16+1,Math.min(15,x+TILE-Math.max(x,bx+1)),1);}}
      if(h%11===0){g.strokeStyle='rgba(255,230,160,.18)';g.lineWidth=1;g.beginPath();g.arc(x+16,y+16,5,0,TAU);g.moveTo(x+16,y+9);g.lineTo(x+16,y+23);g.stroke();}
      break;}
    case 'lwax':{         /* улей: шестигранные ячейки воска */
      g.fillStyle='#5e3a0c';g.fillRect(x,y,TILE,TILE);
      for(let j=-1;j<=2;j++)for(let i=-1;i<=2;i++){const cx=x+i*16+((j+wy*2)&1?8:0),cy=y+j*14;
        g.fillStyle=((hash2(wx*4+i,wy*4+j,9))%5===0)?'#a8680e':'#6e4410';
        g.beginPath();for(let k=0;k<6;k++){const a=k/6*TAU+Math.PI/6;g.lineTo(cx+Math.cos(a)*7.2,cy+Math.sin(a)*7.2);}g.closePath();g.fill();
        g.strokeStyle='rgba(255,200,90,.22)';g.lineWidth=1;g.stroke();}
      break;}
    case 'lshop':{        /* свечная: тёплые доски и потёки воска */
      for(let k=0;k<4;k++){g.fillStyle=((wy*4+k+((h>>>k)&1))%3===0)?'#5a3a24':'#4a2e1c';g.fillRect(x,y+k*8,TILE,7);g.fillStyle='rgba(0,0,0,.3)';g.fillRect(x,y+k*8+7,TILE,1);}
      if(ceil&&h%3===0){for(let k=0;k<2;k++){const dx=x+6+((h>>>(k*3))%20),dl=3+((h>>>(k*3+9))%6);g.fillStyle='rgba(240,224,192,.55)';g.beginPath();g.moveTo(dx-1.6,y+4);g.lineTo(dx+1.6,y+4);g.lineTo(dx+1,y+4+dl);g.arc(dx,y+4+dl,1.1,0,Math.PI);g.closePath();g.fill();}}
      break;}
    case 'lpaper':{       /* кукольный домик: обои в полоску с цветочками */
      g.fillStyle='#6e3a5a';g.fillRect(x,y,TILE,TILE);
      g.fillStyle='#7c4466';g.fillRect(x+2,y,6,TILE);g.fillRect(x+18,y,6,TILE);
      g.fillStyle='rgba(255,220,240,.22)';for(const [fx,fy] of [[13,8],[29,24]]){g.beginPath();g.arc(x+fx,y+fy,2,0,TAU);g.fill();}
      g.fillStyle='rgba(255,240,200,.2)';g.fillRect(x+12.4,y+7.4,1.2,1.2);
      if(fl){g.fillStyle='#4a2a22';g.fillRect(x,y+TILE-10,TILE,10);g.fillStyle='#6a4030';g.fillRect(x,y+TILE-10,TILE,2);g.fillStyle='rgba(0,0,0,.3)';g.fillRect(x+15,y+TILE-8,1,8);}
      break;}
    case 'lcircus':{      /* карусель: выцветший полосатый шатёр */
      const sw=((wx%2)+2)%2;g.fillStyle=sw?'#6a2434':'#776a5e';g.fillRect(x,y,TILE,TILE);
      g.fillStyle='rgba(255,255,255,.06)';g.fillRect(x+2,y,3,TILE);g.fillStyle='rgba(0,0,0,.18)';g.fillRect(x+TILE-4,y,4,TILE);
      if(h%7===0){g.fillStyle='rgba(20,8,14,.55)';g.beginPath();g.moveTo(x+10,y+8);g.lineTo(x+20,y+12);g.lineTo(x+14,y+22);g.lineTo(x+8,y+16);g.closePath();g.fill();}
      break;}
    case 'lcurtain':{     /* театр: тяжёлый бархат в складках */
      const gr=g.createLinearGradient(x,0,x+16,0);gr.addColorStop(0,'#3a0a16');gr.addColorStop(0.5,'#6a1a2a');gr.addColorStop(1,'#3a0a16');
      g.fillStyle=gr;g.fillRect(x,y,16,TILE);g.save();g.translate(16,0);g.fillStyle=gr;g.fillRect(x,y,16,TILE);g.restore();
      if(ceil){g.fillStyle='#b8862a';g.fillRect(x,y,TILE,4);g.fillStyle='#e8c060';g.fillRect(x,y,TILE,1);for(let k=0;k<4;k++){g.fillStyle='#b8862a';g.fillRect(x+3+k*8,y+4,2,5);}}
      break;}
    case 'lrose':case 'lhedge':{   /* розарий: живая изгородь с розами */
      g.fillStyle=style==='lrose'?'#1c3020':'#18281a';g.fillRect(x,y,TILE,TILE);
      for(let k=0;k<7;k++){const lx=x+((h>>>(k*2))%30)+1,ly=y+((h>>>(k*2+5))%30)+1;g.fillStyle=k%3?'#24402a':'#2e5434';g.beginPath();g.ellipse(lx,ly,4.6,2.6,k*0.9,0,TAU);g.fill();}
      if(h%3===0){const rx=x+8+(h%16),ry=y+8+((h>>>4)%16);g.fillStyle='#7a1028';g.beginPath();g.arc(rx,ry,3.2,0,TAU);g.fill();g.fillStyle='#b8203e';g.beginPath();g.arc(rx-0.8,ry-0.8,1.8,0,TAU);g.fill();}
      if(style==='lhedge'){g.strokeStyle='rgba(220,200,170,.3)';g.lineWidth=0.8;g.beginPath();g.moveTo(x+4,y+20);g.lineTo(x+8,y+17);g.moveTo(x+22,y+10);g.lineTo(x+26,y+7);g.stroke();}
      break;}
    case 'lmirror':{      /* зеркальный лабиринт: серебряная плитка */
      g.fillStyle='#3e4a56';g.fillRect(x,y,TILE,TILE);
      g.fillStyle='#4a5866';g.fillRect(x+1,y+1,14,14);g.fillRect(x+17,y+17,14,14);g.fillStyle='#36424e';g.fillRect(x+17,y+1,14,14);g.fillRect(x+1,y+17,14,14);
      g.fillStyle='rgba(230,250,255,.12)';g.beginPath();g.moveTo(x+2,y+14);g.lineTo(x+14,y+2);g.lineTo(x+14,y+6);g.lineTo(x+6,y+14);g.closePath();g.fill();
      break;}
    case 'lold':{         /* перевёрнутый дом: старые обои, узор вверх ногами */
      g.fillStyle='#4a3e52';g.fillRect(x,y,TILE,TILE);
      g.fillStyle='rgba(210,190,230,.13)';g.save();g.translate(x+16,y+16);g.scale(1,-1);
      g.beginPath();g.moveTo(0,-11);g.quadraticCurveTo(7,-4,0,6);g.quadraticCurveTo(-7,-4,0,-11);g.fill();g.fillRect(-0.6,6,1.2,6);g.restore();
      if(h%6===0){g.fillStyle='rgba(30,22,10,.25)';g.beginPath();g.ellipse(x+10+(h%12),y+6,8,5,0,0,TAU);g.fill();}
      break;}
    case 'lquilt':{       /* колодец снов: стёганое одеяло */
      g.fillStyle=((wx+wy)&1)?'#5a4a7e':'#6a4a72';g.fillRect(x,y,TILE,TILE);
      g.fillStyle='rgba(255,255,255,.06)';g.fillRect(x+1,y+1,TILE-2,3);g.fillStyle='rgba(0,0,0,.18)';g.fillRect(x+1,y+TILE-4,TILE-2,3);
      g.strokeStyle='rgba(255,230,250,.25)';g.setLineDash([2.5,2.5]);g.lineWidth=0.8;g.strokeRect(x+3,y+3,TILE-6,TILE-6);g.setLineDash([]);
      g.fillStyle='#d8b8e8';g.beginPath();g.arc(x,y,2.4,0,TAU);g.fill();
      break;}
    case 'lstars':{       /* детская: тёмные обои со звёздами и месяцами */
      g.fillStyle='#262250';g.fillRect(x,y,TILE,TILE);
      g.fillStyle='rgba(255,236,170,.35)';const sx=x+(h%24)+4,sy=y+((h>>>5)%22)+5;
      g.beginPath();for(let k=0;k<10;k++){const a=k/10*TAU-Math.PI/2,r=k%2?1.4:3.4;g.lineTo(sx+Math.cos(a)*r,sy+Math.sin(a)*r);}g.closePath();g.fill();
      if(h%4===0){g.beginPath();g.arc(x+8,y+24,4,0,TAU);g.fill();g.fillStyle='#262250';g.beginPath();g.arc(x+10,y+22.5,3.6,0,TAU);g.fill();}
      break;}
    case 'lplank':{       /* тайник: доски, крашенные в лиловый */
      for(let k=0;k<4;k++){g.fillStyle=((wy*4+k+((h>>>k)&1))%3===0)?'#4e3c5e':'#433352';g.fillRect(x,y+k*8,TILE,7);g.fillStyle='rgba(0,0,0,.32)';g.fillRect(x,y+k*8+7,TILE,1);}
      g.fillStyle='rgba(20,12,24,.6)';g.fillRect(x+3,y+3,2,2);g.fillRect(x+27,y+19,2,2);
      break;}
  }
  if(ceil){g.fillStyle='rgba(0,0,0,.3)';g.fillRect(x,y,TILE,5);g.fillStyle='rgba(0,0,0,.15)';g.fillRect(x,y+5,TILE,4);}
}

/* ---------- мелкие помощники ---------- */
function lsAirOK(wx0,wy0,wx1,wy1){
  for(let ty=wy0;ty<=wy1;ty++)for(let tx=wx0;tx<=wx1;tx++){const t=getTile(tx,ty);if(t!==T_AIR&&t!==T_WATER&&t!==T_HONEY)return false;if(placedLadders.hasXY(tx,ty))return false;}
  return true;
}
/* рисовать только по клеткам воздуха: лестницы и блоки остаются видны */
function lsClip(g,wx0,wy0,wx1,wy1){
  g.save();g.beginPath();
  for(let ty=wy0;ty<=wy1;ty++)for(let tx=wx0;tx<=wx1;tx++){const t=getTile(tx,ty);if(t===T_AIR||t===T_WATER||t===T_HONEY)g.rect(tx*TILE,ty*TILE,TILE,TILE);}
  g.clip();
}
function lsBlob(g,x,y,rx,ry,c,rot){const t=L3(c);g.fillStyle=t[2];g.beginPath();g.ellipse(x,y,rx,ry,rot||0,0,TAU);g.fill();
  g.fillStyle=t[1];g.beginPath();g.ellipse(x-rx*0.12,y-ry*0.12,rx*0.86,ry*0.84,rot||0,0,TAU);g.fill();
  g.fillStyle=t[0];g.beginPath();g.ellipse(x-rx*0.36,y-ry*0.4,rx*0.36,ry*0.3,rot||0,0,TAU);g.fill();}
function lsRect3(g,x,y,w,h,c){const t=L3(c);g.fillStyle=t[1];g.fillRect(x,y,w,h);g.fillStyle=t[0];g.fillRect(x,y,w,Math.min(2,h));g.fillRect(x,y,Math.min(2,w),h);g.fillStyle=t[2];g.fillRect(x,y+h-Math.min(2,h),w,Math.min(2,h));g.fillRect(x+w-Math.min(2,w),y,Math.min(2,w),h);}
function lsLabel(g,x,y,txt,col){
  g.font='700 11px Rubik,system-ui,sans-serif';
  if(g.measureText(txt).width>250){const i=txt.indexOf(' ',Math.floor(txt.length/2)-4);if(i>0){lsLabel(g,x,y-18,txt.slice(0,i),col);txt=txt.slice(i+1);}}
  const w=g.measureText(txt).width+14;
  g.fillStyle='rgba(30,14,40,.78)';roundRect(g,x-w/2,y-15,w,18,8);g.fill();
  g.strokeStyle='rgba(255,210,250,.35)';g.lineWidth=1;roundRect(g,x-w/2+0.5,y-14.5,w-1,17,7.5);g.stroke();
  g.fillStyle=col||'#ffe6ff';g.textAlign='center';g.fillText(txt,x,y-2);g.textAlign='left';
}
/* горшок с бутоном (и мимик, и настоящий цветок): начало координат — точка на полу */
function lilPotArt(g,o){
  const t=o.t||0,op=o.open||0,wr=o.warn||0,T=o.truth||0,hue=o.hue||0;
  const pot=['#f2e0fa','#dcc2ec','#a888c0'],bud=[['#ffc8e2','#f086b8','#b84a80'],['#ffe0c8','#f0a07a','#b8603e'],['#e8d8ff','#b890f0','#7a54b8']][hue%3];
  const sh=wr>0.05?Math.sin(t*60)*wr*1.2:0;
  g.save();g.translate(sh,0);g.rotate(-op*0.16);
  /* лозы-руки при нападении */
  if(op>0.2){
    for(const sd of [-1,1]){const k=op*(sd>0?1:0.8),tx=sd>0?14+k*18:-10-k*10,ty=-14-k*10+Math.sin(t*9+sd)*3;
      const cx1=sd*12+k*4,cy1=-30*k;
      g.strokeStyle='#22482a';g.lineWidth=3.2;g.lineCap='round';g.beginPath();g.moveTo(sd*6,-13);g.quadraticCurveTo(cx1,cy1,tx,ty);g.stroke();
      g.strokeStyle='#5a9a4a';g.lineWidth=1;g.beginPath();g.moveTo(sd*6-0.8,-13.8);g.quadraticCurveTo(cx1-0.8,cy1-0.8,tx-0.8,ty-0.8);g.stroke();
      g.fillStyle='#d8a0a8';for(let f=0.25;f<0.9;f+=0.22){const a=1-f,bx=a*a*sd*6+2*a*f*cx1+f*f*tx,by=a*a*-13+2*a*f*cy1+f*f*ty;g.beginPath();g.moveTo(bx-1,by);g.lineTo(bx,by-2.6);g.lineTo(bx+1,by);g.fill();}
      g.fillStyle='#f0e6d0';for(const o of [-1,1]){g.beginPath();g.moveTo(tx,ty);g.quadraticCurveTo(tx+3.6*sd,ty+o*1.4,tx+4.6*sd,ty+o*3.6);g.lineTo(tx+1.4*sd,ty+o*0.6);g.closePath();g.fill();}}
  }
  /* горшок */
  g.fillStyle=pot[2];g.beginPath();g.moveTo(-9,0);g.lineTo(9,0);g.lineTo(11,-13);g.lineTo(-11,-13);g.closePath();g.fill();
  g.fillStyle=pot[1];g.beginPath();g.moveTo(-8.2,-0.6);g.lineTo(6.4,-0.6);g.lineTo(8.2,-13);g.lineTo(-10.2,-13);g.closePath();g.fill();
  g.fillStyle=pot[0];g.beginPath();g.moveTo(-8,-1);g.lineTo(-5.6,-1);g.lineTo(-6.6,-12.6);g.lineTo(-9.8,-12.6);g.closePath();g.fill();
  g.fillStyle=pot[1];g.fillRect(-12.5,-16.5,25,4);g.fillStyle=pot[0];g.fillRect(-12.5,-16.5,25,1.4);g.fillStyle=pot[2];g.fillRect(-12.5,-13.4,25,1);
  g.fillStyle='rgba(255,255,255,.55)';for(let k=0;k<5;k++){const a=k/5*TAU-Math.PI/2;g.beginPath();g.arc(0.5+Math.cos(a)*2,-7+Math.sin(a)*2,1.3,0,TAU);g.fill();}
  g.fillStyle='rgba(255,200,230,.8)';g.beginPath();g.arc(0.5,-7,0.9,0,TAU);g.fill();
  if(wr>0.3||T>0.5){g.strokeStyle='rgba(60,20,40,.7)';g.lineWidth=0.7;g.beginPath();g.moveTo(-6,-16);g.lineTo(-4,-11);g.lineTo(-6,-7);g.moveTo(5,-16);g.lineTo(6,-12);g.stroke();}
  g.fillStyle='#3a2418';g.beginPath();g.ellipse(0,-16.4,11,1.8,0,0,TAU);g.fill();
  if(o.picked){g.strokeStyle='#3a7a3a';g.lineWidth=1.6;g.beginPath();g.moveTo(0,-16);g.lineTo(0.5,-20);g.stroke();g.restore();return;}
  /* стебель и листья */
  const hx=op*12,hy=-34-op*6;
  g.strokeStyle='#2e6a32';g.lineWidth=2.4;g.beginPath();g.moveTo(0,-16);g.quadraticCurveTo(-2+hx*0.2,-26,hx,hy+7);g.stroke();
  g.strokeStyle='#5a9a4a';g.lineWidth=0.9;g.beginPath();g.moveTo(-0.7,-16);g.quadraticCurveTo(-2.7+hx*0.2,-26,hx-0.7,hy+7);g.stroke();
  for(const sd of [-1,1]){const lw=Math.sin(t*2+sd)*0.08+(wr*Math.sin(t*40)*0.2);g.save();g.translate(hx*0.25,-23);g.rotate(sd*(0.5+lw));g.scale(1.3,1.3);
    g.fillStyle='#2a5a2a';g.beginPath();g.ellipse(sd*5,0,5.4,2.4,0,0,TAU);g.fill();g.fillStyle='#4a8a3a';g.beginPath();g.ellipse(sd*5-0.4,-0.4,4.6,1.8,0,0,TAU);g.fill();
    g.fillStyle='#7ab85a';g.beginPath();g.ellipse(sd*4-0.8,-0.9,2.2,0.7,0,0,TAU);g.fill();g.restore();}
  g.save();g.translate(hx,hy);g.scale(1.45,1.45);
  if(op<0.3){
    /* бутон: при тревоге половинки расходятся, внутри красный свет */
    const sp=wr*0.32+op;
    if(sp>0.04){softGlow(g,0,-1,10+sp*14,'#ff2a3a',0.4+sp);}
    for(const sd of [-1,1]){g.save();g.rotate(sd*sp);g.fillStyle=bud[2];g.beginPath();g.moveTo(0,5);g.quadraticCurveTo(sd*9,2,sd*5,-6);g.quadraticCurveTo(sd*2,-9,0,-8);g.closePath();g.fill();
      g.fillStyle=bud[1];g.beginPath();g.moveTo(0,4);g.quadraticCurveTo(sd*7.6,1.6,sd*4.4,-5.4);g.quadraticCurveTo(sd*2,-7.8,0,-7.2);g.closePath();g.fill();
      if(sd<0){g.fillStyle=bud[0];g.beginPath();g.ellipse(-3,-3,1.6,3,0.4,0,TAU);g.fill();}g.restore();}
    g.strokeStyle=bud[2];g.lineWidth=0.8;g.beginPath();g.arc(0,-3.2,2.6,Math.PI*0.9,Math.PI*2.2);g.stroke();
    if(T>0.4||wr>0.2){g.fillStyle='#fff6ea';for(let k=-1;k<=1;k++){g.beginPath();g.moveTo(k*1.8-0.8,-1);g.lineTo(k*1.8,1.4);g.lineTo(k*1.8+0.8,-1);g.fill();}}
    g.fillStyle='#2e6a32';g.beginPath();g.moveTo(-4,4);g.lineTo(0,6.6);g.lineTo(4,4);g.lineTo(0,2.4);g.closePath();g.fill();
  }else{
    /* пасть: верхний и нижний лепесток раскрыты, внутри зубы и язык */
    const a=op*1.0;
    g.fillStyle='#4a0816';g.beginPath();g.ellipse(5,0,8,8*op,0,0,TAU);g.fill();
    softGlow(g,4,0,10,'#ff3a4a',0.35);
    g.fillStyle='#8a3a8a';g.beginPath();g.moveTo(-1,1);g.quadraticCurveTo(6,3+op*2,10,1+Math.sin(t*14)*1.4);g.quadraticCurveTo(6,1,-1,0);g.fill();
    for(const sd of [-1,1]){g.save();g.rotate(-sd*a*0.85);
      g.fillStyle=bud[2];g.beginPath();g.moveTo(-5,0);g.quadraticCurveTo(-3,sd*-10,8,sd*-7);g.quadraticCurveTo(13,sd*-3,12,0);g.closePath();g.fill();
      g.fillStyle=bud[1];g.beginPath();g.moveTo(-4,sd*-0.6);g.quadraticCurveTo(-2,sd*-9,7.4,sd*-6.2);g.quadraticCurveTo(11.6,sd*-2.6,11,sd*-0.6);g.closePath();g.fill();
      if(sd<0){g.fillStyle=bud[0];g.beginPath();g.ellipse(2,-6.6,3.4,1.2,0.1,0,TAU);g.fill();}
      g.fillStyle='#fff8ee';for(let k=0;k<5;k++){const tx=-1.6+k*2.6;g.beginPath();g.moveTo(tx-1,sd*-0.8);g.lineTo(tx,sd*(1.8+(k%2)));g.lineTo(tx+1,sd*-0.8);g.closePath();g.fill();}
      g.restore();}
    for(let k=0;k<3;k++){g.fillStyle='rgba(255,200,220,.6)';g.beginPath();g.arc(-4+k*2,-2,0.6,0,TAU);g.fill();}
  }
  g.restore();
  g.restore();
}
/* модель моба-мимика (рисуется внутри общей обводки мобов) */
function lilMimicModel(g,m,FY,t){
  g.save();g.translate(0,FY);g.scale(0.92,0.92);
  lilPotArt(g,{t,open:m.open||0,warn:m.state==='warn'?Math.min(1,m.st/0.7):0,truth:veilT,hue:hash2(Math.floor(m.x/TILE),Math.floor(m.y/TILE),7)%3});
  g.restore();
}

/* ---------- предметы ---------- */
function lsLantern(g,x,cy,ly,time,h,gl,col){
  const sw=Math.sin(time*1.4+h%7)*2;
  g.strokeStyle='#6a5a6a';g.lineWidth=1.2;g.beginPath();g.moveTo(x+16,cy);g.lineTo(x+16+sw,ly);g.stroke();
  const c=L3(col||'#ff9ac8'),lx=x+16+sw,yy=ly+11;
  g.fillStyle='#4a3040';g.fillRect(lx-4,ly,8,3);g.fillRect(lx-4,ly+19,8,2.4);
  g.fillStyle=c[2];g.beginPath();g.ellipse(lx,yy,9,8.6,0,0,TAU);g.fill();
  g.fillStyle=c[1];g.beginPath();g.ellipse(lx-0.8,yy-0.6,7.8,7.8,0,0,TAU);g.fill();
  const fl=0.85+0.15*Math.sin(time*9+h);g.fillStyle='rgba(255,240,200,'+(0.55*fl).toFixed(2)+')';g.beginPath();g.ellipse(lx,yy,4.4,5.4,0,0,TAU);g.fill();
  g.strokeStyle=c[2];g.lineWidth=0.8;for(const k of [-4,0,4]){g.beginPath();g.ellipse(lx,yy,Math.abs(k)?6:1,8,0,0,TAU);g.stroke();}
  g.fillStyle=c[0];g.beginPath();g.ellipse(lx-4,yy-4,2,1.4,-0.6,0,TAU);g.fill();
  g.strokeStyle='#e8c060';g.lineWidth=1;g.beginPath();g.moveTo(lx,ly+21);g.lineTo(lx,ly+26);g.stroke();
  gl(lx,yy,60*fl,'#ffc8e8');
}
function lsChest(g,x,y,open,kind,time,h,gl,locked){
  const t=time;g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(x+16,y+31,14,3,0,0,TAU);g.fill();
  if(kind==='basket'){
    const c=L3('#c8a060');g.fillStyle=c[2];g.beginPath();g.moveTo(x+4,y+16);g.lineTo(x+28,y+16);g.lineTo(x+25,y+31);g.lineTo(x+7,y+31);g.closePath();g.fill();
    g.fillStyle=c[1];g.beginPath();g.moveTo(x+5,y+16.6);g.lineTo(x+26,y+16.6);g.lineTo(x+23.6,y+30);g.lineTo(x+8,y+30);g.closePath();g.fill();
    g.strokeStyle=c[2];g.lineWidth=0.8;for(let k=0;k<4;k++){g.beginPath();g.moveTo(x+5+k*0.4,y+19+k*3);g.lineTo(x+27-k*0.4,y+19+k*3);g.stroke();}
    for(let k=0;k<6;k++){g.beginPath();g.moveTo(x+7+k*3.6,y+17);g.lineTo(x+8+k*3.2,y+30);g.stroke();}
    g.fillStyle='#ff9ac8';g.fillRect(x+4,y+15,24,3);g.fillStyle='#fff';for(let k=0;k<6;k++)g.fillRect(x+5+k*4,y+15,2,1.4);
    g.strokeStyle=c[0];g.lineWidth=2.2;g.beginPath();g.arc(x+16,y+16,10,Math.PI,TAU);g.stroke();
    if(!open){g.fillStyle='#fff0f6';g.beginPath();g.moveTo(x+6,y+16);g.quadraticCurveTo(x+16,y+9,x+26,y+16);g.closePath();g.fill();gl(x+16,y+16,30,'#ffd0f0');}
    return;
  }
  if(kind==='royal'){   /* королевская ячейка: золотой восковой кокон */
    const c=L3('#e8a420'),p=open?0:Math.sin(t*2+h)*0.6;
    g.fillStyle=c[2];g.beginPath();for(let k=0;k<6;k++){const a=k/6*TAU+Math.PI/6;g.lineTo(x+16+Math.cos(a)*14,y+18+Math.sin(a)*13);}g.closePath();g.fill();
    g.fillStyle=c[1];g.beginPath();for(let k=0;k<6;k++){const a=k/6*TAU+Math.PI/6;g.lineTo(x+15+Math.cos(a)*12,y+17+Math.sin(a)*11);}g.closePath();g.fill();
    g.fillStyle=c[0];g.beginPath();g.ellipse(x+10,y+12,4,2.4,-0.5,0,TAU);g.fill();
    if(open){g.fillStyle='#4a2a08';g.beginPath();g.ellipse(x+16,y+17,7,6,0,0,TAU);g.fill();}
    else{g.fillStyle='rgba(255,250,220,.9)';g.beginPath();g.ellipse(x+16,y+18+p,6,5,0,0,TAU);g.fill();gl(x+16,y+18,44,'#ffd060');
      g.strokeStyle='rgba(120,70,0,.6)';g.lineWidth=0.8;g.beginPath();g.arc(x+16,y+18+p,3,0,TAU*0.8);g.stroke();}
    return;
  }
  /* лаковый лиловый ларец с латунью и замком-сердцем */
  const wood=L3('#7a3a8a'),br=L3('#e0b050');
  g.fillStyle=wood[2];g.fillRect(x+3,y+16,26,15);g.fillStyle=wood[1];g.fillRect(x+4,y+17,23,13);g.fillStyle=wood[0];g.fillRect(x+4,y+17,23,2);
  g.fillStyle=br[1];g.fillRect(x+3,y+16,3,15);g.fillRect(x+26,y+16,3,15);g.fillRect(x+3,y+23,26,2);g.fillStyle=br[0];g.fillRect(x+3,y+16,3,1);
  if(open){
    g.fillStyle='#2a1030';g.fillRect(x+5,y+12,22,5);
    g.fillStyle=wood[1];g.beginPath();g.moveTo(x+3,y+13);g.lineTo(x+7,y+3);g.lineTo(x+29,y+3);g.lineTo(x+29,y+13);g.closePath();g.fill();g.fillStyle=br[1];g.fillRect(x+7,y+3,22,2);
  }else{
    g.fillStyle=wood[1];g.beginPath();g.moveTo(x+3,y+17);g.quadraticCurveTo(x+16,y+5,x+29,y+17);g.closePath();g.fill();
    g.fillStyle=wood[0];g.beginPath();g.moveTo(x+6,y+14);g.quadraticCurveTo(x+12,y+9,x+16,y+8.6);g.lineTo(x+16,y+10.4);g.quadraticCurveTo(x+11,y+11,x+7,y+15);g.closePath();g.fill();
    g.strokeStyle=br[1];g.lineWidth=2;g.beginPath();g.moveTo(x+3,y+17);g.quadraticCurveTo(x+16,y+5,x+29,y+17);g.stroke();
    /* замок-сердце */
    g.fillStyle=locked?'#8a8a98':'#ff6aa8';g.beginPath();g.moveTo(x+16,y+27);g.bezierCurveTo(x+10,y+22,x+12,y+17,x+16,y+20);g.bezierCurveTo(x+20,y+17,x+22,y+22,x+16,y+27);g.fill();
    if(locked){g.strokeStyle='#6a6a78';g.lineWidth=1.6;g.beginPath();g.arc(x+16,y+17,3,Math.PI,TAU);g.stroke();
      g.strokeStyle='rgba(150,140,170,.8)';g.lineWidth=1.2;g.beginPath();g.moveTo(x+3,y+19);g.lineTo(x+29,y+28);g.moveTo(x+29,y+19);g.lineTo(x+3,y+28);g.stroke();}
    else{const a=0.5+0.5*Math.sin(t*3+h%5);gl(x+16,y+20,30+a*12,'#ff9ad8');if(Math.random()<0.03)spawnPart(x+6+Math.random()*20,y+10,0,-14,0.8,'#ffe0f8',1.4,0);}
  }
}
function lsCandle(g,cx,base,len,lit,time,h,gl){
  const c=L3('#f4ead6');
  g.fillStyle='#8a6a40';g.fillRect(cx-6,base-3,12,3);g.fillStyle='#b8925a';g.fillRect(cx-6,base-3,12,1);
  g.fillStyle=c[1];g.fillRect(cx-3,base-3-len,6,len);g.fillStyle=c[0];g.fillRect(cx-3,base-3-len,2,len);g.fillStyle=c[2];g.fillRect(cx+2,base-3-len,1,len);
  g.fillStyle=c[1];g.beginPath();g.arc(cx+2.6,base-len+1,1.4,0,TAU);g.fill();g.fillRect(cx+2,base-len,1.4,4);
  g.strokeStyle='#2a2020';g.lineWidth=1;g.beginPath();g.moveTo(cx,base-3-len);g.lineTo(cx,base-6-len);g.stroke();
  if(lit){const f=0.8+0.2*Math.sin(time*13+h),fy=base-6-len;
    g.fillStyle='rgba(255,170,60,.95)';g.beginPath();g.moveTo(cx-3,fy+1);g.quadraticCurveTo(cx,fy-9*f,cx+3,fy+1);g.closePath();g.fill();
    g.fillStyle='rgba(255,245,200,.95)';g.beginPath();g.ellipse(cx,fy-1.4,1.2,2.6*f,0,0,TAU);g.fill();gl(cx,fy-3,46*f,'#ffb860');}
}
function lsMirror(g,x,y,ch,time,gl,h){
  /* высокое овальное зеркало на ножках; внутри — отражение шахтёра */
  const cx=x+16,cy=y+4,rw=13,rh=26,fr=L3('#c8d4e0');
  g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(cx,y+31,14,2.6,0,0,TAU);g.fill();
  g.fillStyle=fr[2];g.fillRect(cx-9,y+26,3,6);g.fillRect(cx+6,y+26,3,6);
  g.fillStyle=fr[2];g.beginPath();g.ellipse(cx,cy,rw+3,rh+3,0,0,TAU);g.fill();
  g.fillStyle=fr[1];g.beginPath();g.ellipse(cx-0.6,cy-0.6,rw+2,rh+2,0,0,TAU);g.fill();
  g.fillStyle=fr[0];g.beginPath();g.ellipse(cx-4,cy-rh*0.6,4,2,-0.5,0,TAU);g.fill();
  const gr=g.createLinearGradient(cx-rw,cy-rh,cx+rw,cy+rh);gr.addColorStop(0,'#c8ecff');gr.addColorStop(0.5,'#6a8aa8');gr.addColorStop(1,'#2a3a4e');
  g.fillStyle=gr;g.beginPath();g.ellipse(cx,cy,rw,rh,0,0,TAU);g.fill();
  g.save();g.beginPath();g.ellipse(cx,cy,rw,rh,0,0,TAU);g.clip();
  /* отражение: повторяет движения, а лживое ('5') — стоит и улыбается */
  const d=player.x-cx,near=Math.abs(d)<TILE*6&&Math.abs(player.y-(y+32))<TILE*3;
  if(near){const liar=ch==='5',rx=cx+(liar?0:clamp(-d*0.25,-6,6)),ry=y+30,by=Math.sin(time*(liar?0.6:6))*0.6;
    g.fillStyle=liar?'rgba(60,10,40,.85)':'rgba(40,40,70,.75)';
    g.beginPath();g.ellipse(rx,ry-24+by,4.6,5,0,0,TAU);g.fill();g.fillRect(rx-5,ry-19+by,10,12);g.fillRect(rx-4,ry-8,3,8);g.fillRect(rx+1,ry-8,3,8);
    g.fillStyle='#ffd040';g.fillRect(rx-5,ry-29+by,10,3);
    if(liar){g.fillStyle='#fff';g.beginPath();g.arc(rx,ry-22.6,3,0.15,Math.PI-0.15);g.fill();g.fillStyle='#ff2a4a';g.fillRect(rx-2.6,ry-26,1.6,1.6);g.fillRect(rx+1,ry-26,1.6,1.6);}
  }
  g.fillStyle='rgba(255,255,255,.22)';g.beginPath();g.moveTo(cx-rw,cy-4);g.lineTo(cx-rw+6,cy-rh);g.lineTo(cx-rw+11,cy-rh);g.lineTo(cx-rw,cy+6);g.closePath();g.fill();
  g.restore();
  g.fillStyle=fr[1];g.beginPath();g.arc(cx,cy-rh-3,3.4,0,TAU);g.fill();g.fillStyle=fr[0];g.beginPath();g.arc(cx-1,cy-rh-4,1.2,0,TAU);g.fill();
  gl(cx,cy,40,'#c8f0ff');
}

/* ---------- кукольный домик: комнаты ---------- */
const LS_ROOMS=['детская','кухня','спальня','гостиная','чердак','сокровищница'];
function lsDollRoomDraw(g,q,i,type,time,gl,S){
  const col=i%3,fl=Math.floor(i/3),x0=(q.px+1+col*7)*TILE,fy=(q.py+(fl?13:8))*TILE;
  const ok=()=>true;
  lsClip(g,q.px+1+col*7,q.py+(fl?9:4),q.px+6+col*7,q.py+(fl?12:7));
  switch(type){
    case 0:{   /* детская: кроватка и кукла */
      if(ok(0,1)){const c=L3('#e8b0d0');g.fillStyle=c[2];g.fillRect(x0+6,fy-18,46,14);g.fillStyle=c[1];g.fillRect(x0+7,fy-17,44,11);g.fillStyle='#fff';g.fillRect(x0+9,fy-20,12,5);
        g.fillStyle='#8a5a3a';for(let k=0;k<7;k++)g.fillRect(x0+4+k*7.6,fy-26,2,22);g.fillRect(x0+3,fy-27,52,3);}
      if(ok(3,3)){lsDoll(g,x0+108,fy,time,0);}
      break;}
    case 1:{   /* кухня: плита с кастрюлей, стол */
      if(ok(0,1)){lsRect3(g,x0+4,fy-28,30,28,'#d8d0e0');g.fillStyle='#2a2430';g.fillRect(x0+9,fy-18,20,12);g.fillStyle='#ff7a3a';g.fillRect(x0+11,fy-10,16,3);gl(x0+19,fy-10,22,'#ff9a50');
        lsRect3(g,x0+10,fy-38,18,10,'#8a8aa0');g.fillStyle='rgba(255,255,255,.3)';for(let k=0;k<3;k++){const sy=fy-42-((time*14+k*7)%16);g.beginPath();g.arc(x0+16+k*4,sy,2,0,TAU);g.fill();}}
      if(ok(3,5)){lsRect3(g,x0+104,fy-20,56,4,'#a0704a');g.fillStyle='#7a5030';g.fillRect(x0+108,fy-16,3,16);g.fillRect(x0+153,fy-16,3,16);
        g.fillStyle='#f4eefa';g.beginPath();g.ellipse(x0+130,fy-21,8,2,0,0,TAU);g.fill();g.fillStyle='#c41e3c';g.beginPath();g.arc(x0+130,fy-23,3,0,TAU);g.fill();}
      break;}
    case 2:{   /* спальня: кровать и шкаф */
      if(ok(0,2)){g.fillStyle='#5a3a2a';g.fillRect(x0+4,fy-30,4,30);g.fillRect(x0+80,fy-20,4,20);const c=L3('#9a7ad0');g.fillStyle=c[1];g.fillRect(x0+8,fy-16,72,10);g.fillStyle=c[0];g.fillRect(x0+8,fy-16,72,2);
        g.fillStyle='#f4eefa';g.fillRect(x0+10,fy-21,18,6);g.fillStyle='#5a3a2a';g.fillRect(x0+4,fy-6,80,4);
        if(veilT>0.4){g.fillStyle='rgba(20,0,10,.8)';g.beginPath();g.ellipse(x0+44,fy-17,22,5,0,Math.PI,TAU);g.fill();}}
      if(ok(4,5)){lsRect3(g,x0+136,fy-58,40,58,'#6a4a3a');g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x0+155,fy-56,1.4,54);g.fillStyle='#e0b050';g.fillRect(x0+151,fy-32,3,5);g.fillRect(x0+158,fy-32,3,5);
        if(Math.sin(time*0.7+i)>0.95){g.fillStyle='#ff2a4a';g.fillRect(x0+153,fy-44,1.6,1.6);g.fillRect(x0+157,fy-44,1.6,1.6);}}
      break;}
    case 3:{   /* гостиная: диван, часы с маятником, картина */
      if(ok(0,2)){const c=L3('#c06a9a');g.fillStyle=c[2];g.fillRect(x0+6,fy-24,70,16);g.fillStyle=c[1];g.fillRect(x0+8,fy-22,66,12);g.fillStyle=c[0];g.fillRect(x0+8,fy-22,66,2);
        lsBlob(g,x0+8,fy-14,6,8,'#c06a9a');lsBlob(g,x0+74,fy-14,6,8,'#c06a9a');g.fillStyle='#5a3a2a';g.fillRect(x0+10,fy-8,3,8);g.fillRect(x0+70,fy-8,3,8);}
      if(ok(4,4)){lsRect3(g,x0+140,fy-70,22,70,'#6a4a2a');g.fillStyle='#f4eefa';g.beginPath();g.arc(x0+151,fy-58,8,0,TAU);g.fill();
        g.strokeStyle='#2a1a10';g.lineWidth=1.2;const a=time*0.5;g.beginPath();g.moveTo(x0+151,fy-58);g.lineTo(x0+151+Math.cos(a)*6,fy-58+Math.sin(a)*6);g.moveTo(x0+151,fy-58);g.lineTo(x0+151,fy-63);g.stroke();
        const sw=Math.sin(time*3)*0.4;g.strokeStyle='#e0b050';g.beginPath();g.moveTo(x0+151,fy-46);g.lineTo(x0+151+Math.sin(sw)*16,fy-46+Math.cos(sw)*16);g.stroke();
        g.fillStyle='#e0b050';g.beginPath();g.arc(x0+151+Math.sin(sw)*16,fy-46+Math.cos(sw)*16,3,0,TAU);g.fill();}
      if(ok(2,3)){const py=fy-96;lsRect3(g,x0+84,py,40,30,'#b8862a');g.fillStyle='#2a2440';g.fillRect(x0+88,py+4,32,22);
        g.fillStyle='#e8c8a8';g.beginPath();g.arc(x0+104,py+14,6,0,TAU);g.fill();g.fillStyle=veilT>0.4?'#ff2a4a':'#3a2a5a';g.fillRect(x0+101,py+12,2,2);g.fillRect(x0+106,py+12,2,2);}
      break;}
    case 4:{   /* чердак: коробки и лошадка-качалка */
      if(ok(0,1)){lsRect3(g,x0+4,fy-22,24,22,'#a8865a');lsRect3(g,x0+30,fy-16,18,16,'#9a7a50');lsRect3(g,x0+10,fy-36,16,14,'#b89668');
        g.strokeStyle='rgba(60,40,20,.6)';g.lineWidth=1;g.beginPath();g.moveTo(x0+16,fy-22);g.lineTo(x0+16,fy);g.stroke();}
      if(ok(3,5)){const r=Math.sin(time*1.6+i)*0.18;g.save();g.translate(x0+130,fy-4);g.rotate(r);
        g.strokeStyle='#8a4a2a';g.lineWidth=3;g.beginPath();g.arc(0,-30,30,Math.PI*0.3,Math.PI*0.7);g.stroke();
        const c=L3('#f4eefa');g.fillStyle=c[1];g.beginPath();g.ellipse(0,-20,16,7,0,0,TAU);g.fill();g.fillStyle=c[0];g.beginPath();g.ellipse(-4,-23,8,2.4,0,0,TAU);g.fill();
        g.fillStyle=c[1];g.beginPath();g.ellipse(14,-30,6,8,0.4,0,TAU);g.fill();g.fillStyle='#c41e3c';g.fillRect(-14,-24,6,3);
        g.fillStyle='#1a1018';g.beginPath();g.arc(17,-32,1.4,0,TAU);g.fill();g.fillStyle='#ff9ac8';for(let k=0;k<4;k++)g.fillRect(8-k*2,-38+k,2,6);
        g.fillStyle='#5a3a2a';g.fillRect(-12,-14,2.4,10);g.fillRect(9,-14,2.4,10);g.restore();}
      break;}
    case 5:{   /* сокровищница: ларец среди подарков */
      if(ok(2,5)){const [cx,cy]=lsDollChest(q,i),open=S&&S.done;
        lsRect3(g,x0+70,fy-18,18,18,'#7ad8c8');g.fillStyle='#ff6aa8';g.fillRect(x0+78,fy-18,3,18);g.fillRect(x0+70,fy-11,18,3);
        lsRect3(g,x0+160,fy-14,14,14,'#ffd060');g.fillStyle='#9a6ad8';g.fillRect(x0+166,fy-14,2.4,14);
        lsChest(g,cx*TILE,cy*TILE,open,'lilac',time,7,gl,false);}
      break;}
  }
  g.restore();
}
function lsDoll(g,x,fy,time,k){
  const c=L3('#f4e0e8'),look=clamp((player.x-x)/200,-1,1);
  g.fillStyle='#9a3a6a';g.beginPath();g.moveTo(x-9,fy);g.lineTo(x+9,fy);g.lineTo(x+5,fy-16);g.lineTo(x-5,fy-16);g.closePath();g.fill();
  g.fillStyle='#c05a8a';g.beginPath();g.moveTo(x-7,fy-1);g.lineTo(x-1,fy-1);g.lineTo(x-2,fy-15);g.lineTo(x-4.6,fy-15);g.closePath();g.fill();
  g.fillStyle=c[1];g.beginPath();g.arc(x,fy-22,7,0,TAU);g.fill();g.fillStyle=c[0];g.beginPath();g.arc(x-2.4,fy-24.4,2.6,0,TAU);g.fill();
  g.fillStyle='#e0b050';g.beginPath();g.arc(x,fy-25,7.4,Math.PI*1.05,TAU*0.98);g.fill();g.fillRect(x-7.4,fy-25,2.4,9);g.fillRect(x+5,fy-25,2.4,9);
  const T=veilT;g.fillStyle=T>0.5?'#ff2a4a':'#2a3a6a';g.beginPath();g.arc(x-2.6+look*1.2,fy-22,1.3,0,TAU);g.arc(x+2.6+look*1.2,fy-22,1.3,0,TAU);g.fill();
  g.fillStyle='#ff8aa8';g.beginPath();g.arc(x-4,fy-19.6,1.4,0,TAU);g.arc(x+4,fy-19.6,1.4,0,TAU);g.fill();
  g.strokeStyle=T>0.5?'#5a0010':'#b04060';g.lineWidth=0.8;g.beginPath();g.arc(x+look,fy-19,T>0.5?3:1.6,0.2,Math.PI-0.2);g.stroke();
}

/* ---------- карусель ---------- */
function lsCarouselArt(g,x,y,q,time,gl,S){
  const cx=x+16,fy=y+32,run=S&&S.run,done=S&&S.done,T=veilT,rot=run?time*1.6:(done?time*0.25:0);
  const roofY=fy-150,R=118;
  /* платформа */
  g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(cx,fy,R+6,8,0,0,TAU);g.fill();
  const pc=L3('#8a5a9a');g.fillStyle=pc[2];g.beginPath();g.ellipse(cx,fy-6,R,10,0,0,TAU);g.fill();g.fillStyle=pc[1];g.fillRect(cx-R,fy-12,R*2,6);
  g.fillStyle=pc[0];g.beginPath();g.ellipse(cx,fy-12,R,9,0,0,TAU);g.fill();g.fillStyle='rgba(255,230,160,.6)';for(let k=0;k<16;k++){const a=k/16*TAU+rot;if(Math.sin(a)<0)continue;g.beginPath();g.arc(cx+Math.cos(a)*R*0.96,fy-8+Math.sin(a)*4,1.6,0,TAU);g.fill();}
  /* лошадки: дальние — темнее и меньше, ближние — поверх столба */
  const horses=[];for(let k=0;k<5;k++){const a=k/5*TAU+rot;horses.push({a,z:Math.sin(a),x:cx+Math.cos(a)*R*0.74,k});}
  horses.sort((p,q2)=>p.z-q2.z);
  const drawH=(hh)=>{const s=0.75+0.25*(hh.z+1)/2,bob=run?Math.sin(time*4+hh.k*1.3)*8:0,hy=fy-56+bob,dark=hh.z<0;
    g.strokeStyle=dark?'#8a7040':'#e0b050';g.lineWidth=2;g.beginPath();g.moveTo(hh.x,roofY+20);g.lineTo(hh.x,fy-12);g.stroke();
    g.save();g.translate(hh.x,hy);g.scale((Math.cos(hh.a)>0?-1:1)*s,s);
    const c=L3(dark?'#a898b8':'#f4eefa');if(T>0.5){c[0]='#d8c8c0';c[1]='#a89890';c[2]='#5a4a48';}
    g.fillStyle=c[2];g.beginPath();g.ellipse(0,0,19,8,0,0,TAU);g.fill();g.fillStyle=c[1];g.beginPath();g.ellipse(-1,-1,17,6.6,0,0,TAU);g.fill();
    g.fillStyle=c[0];g.beginPath();g.ellipse(-4,-4,9,2.2,0,0,TAU);g.fill();
    g.fillStyle=c[1];g.beginPath();g.moveTo(12,-4);g.quadraticCurveTo(18,-18,24,-16);g.lineTo(27,-10);g.quadraticCurveTo(22,-8,17,2);g.closePath();g.fill();
    g.fillStyle=c[2];for(const [lx,la] of [[-12,0.5],[-7,-0.4],[9,0.4],[13,-0.5]]){g.save();g.translate(lx,5);g.rotate(run?la*Math.sin(time*8+hh.k):la*0.4);g.fillRect(-1.6,0,3.2,14);g.restore();}
    g.fillStyle=dark?'#7a2a5a':'#ff6aa8';g.fillRect(-6,-8,10,4);g.fillStyle='#e0b050';g.fillRect(-6,-4,10,2);
    g.fillStyle=T>0.5?'#c01030':'#ff9ac8';for(let k=0;k<4;k++)g.fillRect(14+k*2,-18+k*0.6,2,7);
    g.fillStyle=T>0.5?'#ff2a3a':'#1a1018';g.beginPath();g.arc(22,-13,1.5,0,TAU);g.fill();
    if(T>0.5){g.fillStyle='#f0e8d8';for(let k=0;k<3;k++)g.fillRect(23+k*1.4,-9,1,2.4);}
    g.restore();};
  for(const hh of horses)if(hh.z<0)drawH(hh);
  /* центральный столб с зеркальцами */
  const pl=L3('#e0b050');g.fillStyle=pl[2];g.fillRect(cx-7,roofY+10,14,fy-roofY-20);g.fillStyle=pl[1];g.fillRect(cx-6,roofY+10,10,fy-roofY-20);g.fillStyle=pl[0];g.fillRect(cx-5,roofY+10,3,fy-roofY-20);
  g.fillStyle='#c8ecff';for(let k=0;k<4;k++){g.fillRect(cx-3,roofY+30+k*24,6,8);}
  for(const hh of horses)if(hh.z>=0)drawH(hh);
  /* шатёр: полосатый конус и фестоны */
  for(let k=0;k<10;k++){const a0=k/10,a1=(k+1)/10;g.fillStyle=k%2?(T>0.5?'#5a1a24':'#c8486a'):(T>0.5?'#8a7a70':'#f4e6e0');
    g.beginPath();g.moveTo(cx,roofY-36);g.lineTo(cx-R-8+(2*R+16)*a0,roofY+16);g.lineTo(cx-R-8+(2*R+16)*a1,roofY+16);g.closePath();g.fill();}
  g.fillStyle='rgba(255,255,255,.18)';g.beginPath();g.moveTo(cx,roofY-36);g.lineTo(cx-R-8,roofY+16);g.lineTo(cx-R+30,roofY+16);g.closePath();g.fill();
  g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.moveTo(cx,roofY-36);g.lineTo(cx+R-20,roofY+16);g.lineTo(cx+R+8,roofY+16);g.closePath();g.fill();
  for(let k=0;k<12;k++){const fx=cx-R-8+k*(2*R+16)/12;g.fillStyle=k%2?'#c8486a':'#f4e6e0';g.beginPath();g.arc(fx+(2*R+16)/24,roofY+16,(2*R+16)/24,0,Math.PI);g.fill();
    const on=run?(Math.sin(time*8+k)>-0.3):(done?1:(k%5===2?0.3:0));if(on){g.fillStyle='rgba(255,240,180,'+(on===true?1:on)+')';g.beginPath();g.arc(fx+(2*R+16)/24,roofY+27,2.2,0,TAU);g.fill();if(run)gl(fx+(2*R+16)/24,roofY+27,18,'#ffe6a0');}}
  g.fillStyle=pl[1];g.beginPath();g.arc(cx,roofY-40,5,0,TAU);g.fill();g.fillStyle='#ff6aa8';g.beginPath();g.moveTo(cx,roofY-62);g.lineTo(cx+12,roofY-56);g.lineTo(cx,roofY-50);g.closePath();g.fill();
  g.strokeStyle=pl[2];g.lineWidth=1.4;g.beginPath();g.moveTo(cx,roofY-45);g.lineTo(cx,roofY-62);g.stroke();
  if(run){gl(cx,fy-70,120,'#ffb0e0');if(Math.random()<0.15)spawnPart(cx+rnd(-R,R),roofY+30,rnd(-10,10),rnd(-30,-10),1.4,'#ffe0f6',2,-10);}
}
function lsCarouselHz(g,time){
  for(const h of LCR.hz){
    if(h.k==='shard'){
      if(h.t<h.warn){const k=h.t/h.warn;g.strokeStyle='rgba(255,60,60,'+(0.3+0.5*k)+')';g.lineWidth=2;g.beginPath();g.ellipse(h.x,h.fy-2,10+6*(1-k),3,0,0,TAU);g.stroke();
        g.fillStyle='rgba(255,90,60,'+(0.15+0.25*k)+')';g.fillRect(h.x-1.5,h.y,3,h.fy-h.y);
        g.fillStyle='#f4eefa';g.save();g.translate(h.x+Math.sin(time*50)*k*1.4,h.y+4);g.beginPath();g.moveTo(-5,0);g.lineTo(5,0);g.lineTo(0,10);g.closePath();g.fill();g.restore();}
      else{g.save();g.translate(h.x,h.y);g.rotate(h.t*9);const c=L3('#f4eefa');g.fillStyle=c[1];g.beginPath();g.moveTo(-7,-5);g.lineTo(6,-6);g.lineTo(2,9);g.closePath();g.fill();
        g.fillStyle=c[0];g.beginPath();g.moveTo(-6,-4.4);g.lineTo(0,-5);g.lineTo(-2,2);g.closePath();g.fill();g.strokeStyle='#c8a0e0';g.lineWidth=1;g.beginPath();g.moveTo(-3,-1);g.lineTo(3,-2);g.stroke();g.restore();}
    }else{
      if(h.t<h.warn){const k=h.t/h.warn;g.fillStyle='rgba(255,50,50,'+(0.12+0.3*k)+')';g.fillRect(h.dir>0?h.x:h.x-2000,h.y-40,2000,40);
        g.fillStyle='rgba(255,120,120,'+(0.4+0.5*k)+')';g.font='900 18px Rubik,system-ui';g.textAlign='center';g.fillText(h.dir>0?'»':'«',h.dir>0?h.x+40:h.x-40,h.y-14);g.textAlign='left';}
      else{g.save();g.translate(h.x,h.y-20);g.scale(h.dir>0?1:-1,1);g.globalAlpha=0.85;
        const c=['#e8f0ff','#a8b8e0','#5a6a98'];g.fillStyle=c[2];g.beginPath();g.ellipse(0,0,22,9,0,0,TAU);g.fill();g.fillStyle=c[1];g.beginPath();g.ellipse(-1,-1,20,7.6,0,0,TAU);g.fill();
        g.fillStyle=c[0];g.beginPath();g.moveTo(14,-4);g.quadraticCurveTo(20,-20,28,-17);g.lineTo(30,-10);g.quadraticCurveTo(24,-8,18,2);g.closePath();g.fill();
        g.fillStyle=c[1];for(let k=0;k<4;k++){g.save();g.translate(-14+k*8,6);g.rotate(Math.sin(time*18+k)*0.6);g.fillRect(-1.6,0,3.2,14);g.restore();}
        g.fillStyle='#ff2a4a';g.beginPath();g.arc(25,-14,1.6,0,TAU);g.fill();
        for(let k=0;k<3;k++){g.fillStyle='rgba(200,220,255,'+(0.3-k*0.09)+')';g.beginPath();g.ellipse(-28-k*14,0,10,6,0,0,TAU);g.fill();}
        g.globalAlpha=1;g.restore();}
    }
  }
}

/* ---------- кукольный театр ---------- */
const LS_ACTS=['Жили-были люди в деревне, где солнце никогда не садилось.','Однажды из-под земли поднялся лиловый туман — тёплый и сладкий.','Кто вдыхал его, видел сны наяву… и уходил в шахту за ними.','Кукольник собрал их всех. Теперь они играют для тебя.'];
function lsStageArt(g,x,y,q,time,gl,S){
  const cx=x+16,fy=y+32,W2=168,top=fy-178,act=S&&S.act||0,at=S&&S.at||0,T=veilT;
  /* задник сцены */
  const bg=g.createLinearGradient(0,top+20,0,fy);bg.addColorStop(0,'#1a1440');bg.addColorStop(1,'#3a2a5a');g.fillStyle=bg;g.fillRect(cx-W2+16,top+20,(W2-16)*2,fy-top-20);
  if(act){
    g.save();g.beginPath();g.rect(cx-W2+16,top+20,(W2-16)*2,fy-top-20);g.clip();
    const sil='#0c0814',k=clamp(at/1.2,0,1);
    const pup=(px,py,wave,face)=>{g.strokeStyle='rgba(230,220,255,.5)';g.lineWidth=0.7;g.beginPath();g.moveTo(px,top+20);g.lineTo(px,py-22);g.moveTo(px-6,top+20);g.lineTo(px-7,py-14);g.moveTo(px+6,top+20);g.lineTo(px+7+wave,py-14);g.stroke();
      g.fillStyle=sil;g.beginPath();g.arc(px,py-22,5,0,TAU);g.fill();g.fillRect(px-4,py-17,8,12);g.fillRect(px-4,py-5,2.6,7);g.fillRect(px+1.4,py-5,2.6,7);
      g.save();g.translate(px+4,py-15);g.rotate(-0.6-wave*0.08);g.fillRect(0,-1.2,9,2.4);g.restore();
      if(face){g.fillStyle=T>0.5?'#ff2a4a':'#ffe6ff';g.fillRect(px-2.6,py-23.6,1.6,1.6);g.fillRect(px+1,py-23.6,1.6,1.6);}};
    if(act===1){g.fillStyle='rgba(255,220,120,'+k+')';g.beginPath();g.arc(cx+60,top+60,16,0,TAU);g.fill();gl(cx+60,top+60,60,'#ffd070');
      g.fillStyle=sil;for(let i=0;i<4;i++){const hx=cx-110+i*52;g.fillRect(hx,fy-40,30,30);g.beginPath();g.moveTo(hx-4,fy-40);g.lineTo(hx+15,fy-56);g.lineTo(hx+34,fy-40);g.closePath();g.fill();}
      pup(cx-40,fy-8,Math.sin(time*5)*5,false);pup(cx+10,fy-8,Math.sin(time*5+1)*5,false);}
    else if(act===2){for(let l=0;l<3;l++){g.fillStyle='rgba(190,130,255,'+(0.25*k)+')';g.beginPath();g.moveTo(cx-W2,fy);for(let i=0;i<=16;i++){const xx=cx-W2+i*W2/8;g.lineTo(xx,fy-30-l*22-Math.sin(time*1.4+i*0.8+l)*8-k*20);}g.lineTo(cx+W2,fy);g.closePath();g.fill();}
      pup(cx-30,fy-8,0,true);pup(cx+30,fy-8,0,true);}
    else if(act===3){g.fillStyle='#000';g.beginPath();g.ellipse(cx+70,fy-6,30,8,0,0,TAU);g.fill();
      for(let i=0;i<3;i++){const p=((at*0.18+i*0.33)%1),px=cx-110+p*180,py=fy-8+(px>cx+50?(px-cx-50)*1.2:0);if(py<fy+30)pup(px,py,Math.sin(time*6+i)*3,false);}}
    else{const hy=top+34+Math.sin(time*1.2)*4;g.fillStyle=sil;for(const sd of [-1,1]){g.beginPath();g.ellipse(cx+sd*60,hy,26,12,sd*0.2,0,TAU);g.fill();for(let f=0;f<4;f++)g.fillRect(cx+sd*60-14+f*8,hy+6,5,14);}
      for(let i=0;i<4;i++)pup(cx-75+i*50,fy-8+Math.sin(time*2+i)*3,Math.sin(time*3+i)*4,at>4);
      if(at>4){g.fillStyle='rgba(255,40,70,'+clamp((at-4)/2,0,0.35)+')';g.fillRect(cx-W2,top,W2*2,fy-top);}}
    g.restore();
  }
  /* занавес: открывается во время представления */
  const open=act?clamp(at/1.2+(act>1?1:0),0,1):0,cw=(W2-16)*(1-open*0.78);
  for(const sd of [-1,1]){const x0=sd<0?cx-W2+16:cx+W2-16-cw;
    const gr=g.createLinearGradient(x0,0,x0+cw,0);gr.addColorStop(0,'#5a0e1e');gr.addColorStop(0.5,'#8a1e32');gr.addColorStop(1,'#4a0a18');g.fillStyle=gr;g.fillRect(x0,top+24,cw,fy-top-24);
    g.fillStyle='rgba(0,0,0,.25)';for(let k=0;k<cw;k+=12)g.fillRect(x0+k+8,top+24,2,fy-top-24);g.fillStyle='rgba(255,180,200,.12)';for(let k=0;k<cw;k+=12)g.fillRect(x0+k+2,top+24,2,fy-top-24);
    g.fillStyle='#e0b050';g.fillRect(sd<0?x0+cw-3:x0,top+24,3,fy-top-24);}
  /* арка: колонны и ламбрекен с кистями */
  const pc=L3('#b8862a');for(const sd of [-1,1]){const px=cx+sd*(W2-8)-8;g.fillStyle=pc[2];g.fillRect(px,top,16,fy-top);g.fillStyle=pc[1];g.fillRect(px+1,top,12,fy-top);g.fillStyle=pc[0];g.fillRect(px+2,top,3,fy-top);}
  g.fillStyle='#6a1424';g.fillRect(cx-W2,top,W2*2,24);
  for(let k=0;k<14;k++){const fx=cx-W2+k*W2/7;g.fillStyle='#8a1e32';g.beginPath();g.arc(fx+W2/14,top+24,W2/14,0,Math.PI);g.fill();g.fillStyle='#e0b050';g.fillRect(fx+W2/14-1,top+24+W2/14-2,2,8);}
  g.fillStyle=pc[1];g.fillRect(cx-W2,top-4,W2*2,5);g.fillStyle=pc[0];g.fillRect(cx-W2,top-4,W2*2,1.4);
  g.fillStyle='#f4eefa';g.beginPath();g.arc(cx,top+12,8,0,TAU);g.fill();g.fillStyle='#1a1018';g.beginPath();g.arc(cx-3,top+10,1.4,0,TAU);g.arc(cx+3,top+10,1.4,0,TAU);g.fill();
  g.strokeStyle='#1a1018';g.lineWidth=1;g.beginPath();g.arc(cx,top+13,3.4,0.2,Math.PI-0.2);g.stroke();
  for(const sd of [-1,1])gl(cx+sd*80,fy-4,50,'#ffd890');
  /* подпись акта */
  if(act&&!S.pause)lsLabel(g,cx,top+50,LS_ACTS[act-1],'#ffe6ff');
}

/* ---------- колыбель и шкатулка ---------- */
function lsCradleArt(g,x,y,time,gl,S){
  const cx=x+48,fy=y+32,wake=S&&S.wake>0,done=S&&S.done,r=wake?Math.sin(time*14)*0.12:Math.sin(time*1.3)*0.1;
  g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(cx,fy,70,6,0,0,TAU);g.fill();
  g.save();g.translate(cx,fy-6);g.rotate(r);
  const w=L3('#e6c4f2');
  g.strokeStyle='#b88a6a';g.lineWidth=6;g.beginPath();g.arc(0,-60,62,Math.PI*0.28,Math.PI*0.72);g.stroke();
  g.fillStyle=w[2];g.beginPath();g.moveTo(-62,-56);g.quadraticCurveTo(-60,-6,0,-6);g.quadraticCurveTo(60,-6,62,-56);g.closePath();g.fill();
  g.fillStyle=w[1];g.beginPath();g.moveTo(-58,-56);g.quadraticCurveTo(-56,-10,0,-10);g.quadraticCurveTo(54,-10,56,-56);g.closePath();g.fill();
  g.fillStyle=w[0];g.beginPath();g.moveTo(-54,-54);g.quadraticCurveTo(-50,-22,-20,-14);g.lineTo(-22,-20);g.quadraticCurveTo(-44,-28,-48,-54);g.closePath();g.fill();
  g.strokeStyle=w[2];g.lineWidth=1;for(let k=-3;k<=3;k++){g.beginPath();g.moveTo(k*15,-54);g.lineTo(k*14,-14);g.stroke();}
  /* одеяло и капюшон */
  const b=L3('#fff0f8');g.fillStyle=b[1];g.beginPath();g.moveTo(-60,-56);g.quadraticCurveTo(-20,-70,30,-58);g.quadraticCurveTo(50,-60,60,-56);g.lineTo(58,-48);g.quadraticCurveTo(0,-40,-58,-48);g.closePath();g.fill();
  g.fillStyle=b[0];g.beginPath();g.ellipse(-20,-60,18,3,-0.1,0,TAU);g.fill();
  const hd=L3('#b898e8');g.fillStyle=hd[2];g.beginPath();g.moveTo(14,-56);g.quadraticCurveTo(30,-110,64,-56);g.closePath();g.fill();g.fillStyle=hd[1];g.beginPath();g.moveTo(20,-56);g.quadraticCurveTo(32,-100,58,-56);g.closePath();g.fill();
  g.fillStyle='#120818';g.beginPath();g.moveTo(26,-56);g.quadraticCurveTo(36,-90,52,-56);g.closePath();g.fill();
  if(wake||(done&&veilT>0.3)){const a=wake?1:0.5;g.fillStyle='rgba(255,40,70,'+a+')';g.beginPath();g.ellipse(34,-70,2.6,1.6,0,0,TAU);g.ellipse(44,-70,2.6,1.6,0,0,TAU);g.fill();gl(39,-70,30,'#ff2a4a');
    if(wake){g.fillStyle='#e8d8d0';for(let k=0;k<3;k++){g.save();g.translate(30+k*6,-56);g.rotate(-0.5+Math.sin(time*10+k)*0.3);g.fillRect(0,-1.4,12,2.8);g.restore();}}}
  else if(!done){g.fillStyle='rgba(255,230,250,.5)';g.beginPath();g.ellipse(39,-64,6,3,0,0,TAU);g.fill();}
  g.restore();
  if(!done&&Math.random()<0.04)spawnPart(cx+rnd(-30,30),fy-80,rnd(-6,6),-20,2.4,'#ffe6ff',2.2,-6);
}
function lsMusicBox(g,x,y,time,gl,S){
  const cx=x+16,fy=y+32,on=!(S&&S.done),w=L3('#d8a8e0'),br=L3('#e0b050');
  g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(cx,fy,14,2.6,0,0,TAU);g.fill();
  g.fillStyle=w[2];g.fillRect(cx-12,fy-14,24,14);g.fillStyle=w[1];g.fillRect(cx-11,fy-13,21,12);g.fillStyle=w[0];g.fillRect(cx-11,fy-13,21,2);
  g.fillStyle=br[1];g.fillRect(cx-12,fy-8,24,2);g.fillStyle=br[0];g.fillRect(cx+12,fy-10,4,2);
  g.save();g.translate(cx+16,fy-9);g.rotate(on?time*4:0);g.fillStyle=br[1];g.fillRect(-1,-5,2,10);g.restore();
  if(on){g.fillStyle=w[1];g.save();g.translate(cx-12,fy-14);g.rotate(-1.1);g.fillRect(0,-12,2,12);g.fillRect(0,-12,22,2);g.restore();
    g.fillStyle='#ffd8f0';g.save();g.translate(cx,fy-16);g.scale(Math.cos(time*3),1);g.beginPath();g.moveTo(-6,0);g.lineTo(6,0);g.lineTo(0,-6);g.closePath();g.fill();g.fillRect(-1,-14,2,8);g.beginPath();g.arc(0,-16,2.4,0,TAU);g.fill();g.fillRect(-6,-12,12,1.4);g.restore();
    gl(cx,fy-18,30,'#ffd0f0');if(Math.random()<0.05)spawnPart(cx+rnd(-6,6),fy-24,rnd(-10,10),-30,1.6,'#fff0ff',2,-10);}
  else{g.fillStyle=w[1];g.fillRect(cx-12,fy-17,24,3);}
}

/* ---------- колодец снов ---------- */
function lsWellArt(g,x,y,time,gl,S){
  const cx=x+16,fy=y+32,done=S&&S.done,st=L3('#8a80a0'),wd=L3('#7a5a6a');
  g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(cx,fy,46,5,0,0,TAU);g.fill();
  /* навес */
  g.fillStyle=wd[2];g.fillRect(cx-40,fy-78,5,62);g.fillRect(cx+35,fy-78,5,62);g.fillStyle=wd[0];g.fillRect(cx-40,fy-78,1.6,62);
  const rf=L3('#5a3a6a');g.fillStyle=rf[2];g.beginPath();g.moveTo(cx-52,fy-74);g.lineTo(cx,fy-106);g.lineTo(cx+52,fy-74);g.closePath();g.fill();
  g.fillStyle=rf[1];g.beginPath();g.moveTo(cx-46,fy-76);g.lineTo(cx,fy-102);g.lineTo(cx+46,fy-76);g.closePath();g.fill();
  g.fillStyle=rf[0];g.beginPath();g.moveTo(cx-44,fy-76);g.lineTo(cx,fy-101);g.lineTo(cx-10,fy-76);g.closePath();g.fill();
  g.strokeStyle='#3a2a2a';g.lineWidth=1;g.beginPath();g.moveTo(cx-36,fy-66);g.lineTo(cx+36,fy-66);g.stroke();
  g.strokeStyle='#c8b8a0';g.beginPath();g.moveTo(cx+6,fy-66);g.lineTo(cx+6,fy-46+Math.sin(time)*2);g.stroke();lsRect3(g,cx,fy-46+Math.sin(time)*2,12,9,'#8a6a4a');
  /* вода: светится и зовёт */
  g.fillStyle='#120a20';g.beginPath();g.ellipse(cx,fy-24,30,6,0,0,TAU);g.fill();
  if(!done){const gr=g.createRadialGradient(cx,fy-24,2,cx,fy-24,30);gr.addColorStop(0,'rgba(255,220,255,.9)');gr.addColorStop(0.5,'rgba(190,140,255,.6)');gr.addColorStop(1,'rgba(90,50,160,.2)');g.fillStyle=gr;g.beginPath();g.ellipse(cx,fy-24,29,5.4,0,0,TAU);g.fill();
    g.strokeStyle='rgba(255,240,255,.6)';g.lineWidth=0.8;for(let k=0;k<2;k++){const rr2=((time*0.6+k*0.5)%1);g.beginPath();g.ellipse(cx,fy-24,rr2*28,rr2*5,0,0,TAU);g.stroke();}
    gl(cx,fy-30,90,'#c8a0ff');if(Math.random()<0.12)spawnPart(cx+rnd(-24,24),fy-26,rnd(-6,6),rnd(-40,-16),1.6,Math.random()<0.5?'#ffe6ff':'#c8a0ff',2,-8);}
  /* каменное кольцо */
  for(let k=0;k<6;k++){const bx=cx-36+k*12;lsRect3(g,bx,fy-22,12,9,k%2?'#8a80a0':'#7a7090');lsRect3(g,bx+6*(k<5?1:0)-6*(k===5?0:0),fy-13,12,9,k%2?'#7a7090':'#8a80a0');}
  lsRect3(g,cx-38,fy-26,76,5,'#9a90b0');
}

/* ---------- главный рисовальщик ---------- */
function lilStructDecor(g,lst,tx0,tx1,ty0,ty1){
  const time=G.time,low=settings.quality==='low',T=veilT;
  const glows=[];const gl=(x,y,r,c)=>{if(glows.length<70)glows.push([x,y,r,c]);};
  g.save();
  for(const q of lst){
    const id=q.st.id,S=lsPeek(q);
    /* кукольный домик рисует содержимое комнат целиком */
    if(id==='dollHouse'){const p=(S&&S.perm)||[0,1,2,3,4,5];for(let i=0;i<6;i++)lsDollRoomDraw(g,q,i,p[i],time,gl,S);}
    for(let r=0;r<q.th;r++){
      const row=q.st.tpl[r];
      for(let c=0;c<q.tw;c++){
        const ch=row[c];
        if('#xwbo.~=ig'.indexOf(ch)>=0)continue;
        const wx=q.px+c,wy=q.py+r;
        if(wx<tx0-6||wx>tx1+6||wy<ty0-6||wy>ty1+6)continue;
        if(getTile(wx,wy)!==T_AIR)continue;
        const x=wx*TILE,h=hash2(wx,wy,77);
        const fr=glyphFloorRow(wx,wy),cr=glyphCeilRow(wx,wy);
        const y=fr>=0?fr*TILE:wy*TILE,ceilY=cr>=0?cr*TILE:wy*TILE;
        switch(ch){
          case 'L':
            if(id==='upsideHouse'){   /* торшер вверх ногами */
              g.fillStyle='#5a4a3a';g.fillRect(x+15,ceilY,2,40);g.fillRect(x+9,ceilY,14,3);
              const c=L3('#e8c0d8');g.fillStyle=c[1];g.beginPath();g.moveTo(x+6,ceilY+52);g.lineTo(x+26,ceilY+52);g.lineTo(x+22,ceilY+38);g.lineTo(x+10,ceilY+38);g.closePath();g.fill();
              g.fillStyle=c[0];g.fillRect(x+10,ceilY+38,4,14);gl(x+16,ceilY+48,40,'#ffe0c0');}
            else lsLantern(g,x,ceilY,ceilY+14+(h%10),time,h,gl,id==='mirrorMaze'?'#bfe6ff':id==='puppetTheater'?'#ffd070':['#ff9ac8','#c8a0ff','#ffd0a0'][h%3]);
            break;
          case 'v':
            if(id==='queenHive'){    /* ячейка с личинкой на стене улья */
              const c=L3('#c8861a'),cy=wy*TILE+16;g.fillStyle=c[2];g.beginPath();for(let k=0;k<6;k++){const a=k/6*TAU;g.lineTo(x+16+Math.cos(a)*13,cy+Math.sin(a)*13);}g.closePath();g.fill();
              g.fillStyle='#3a2006';g.beginPath();for(let k=0;k<6;k++){const a=k/6*TAU;g.lineTo(x+16+Math.cos(a)*10,cy+Math.sin(a)*10);}g.closePath();g.fill();
              const wg=Math.sin(time*3+h)*1.4;g.fillStyle=T>0.5?'#e8c8b8':'#f4ecd8';g.beginPath();g.ellipse(x+16+wg*0.5,cy+1,6,4.6,wg*0.1,0,TAU);g.fill();
              g.strokeStyle='rgba(160,120,80,.6)';g.lineWidth=0.7;for(let k=-1;k<=1;k++){g.beginPath();g.moveTo(x+16+k*3,cy-3);g.lineTo(x+16+k*3,cy+5);g.stroke();}
              if(T>0.5){g.fillStyle='#3a0a10';g.fillRect(x+13,cy-1,1.4,1.4);g.fillRect(x+17.6,cy-1,1.4,1.4);g.beginPath();g.arc(x+16,cy+2,1.6,0,Math.PI);g.fill();}
              g.fillStyle='rgba(255,220,140,.35)';g.beginPath();g.ellipse(x+12,cy-7,4,1.4,-0.4,0,TAU);g.fill();
            }else{                 /* гирлянда из лозы и цветов */
              const len=22+(h%14),sw=Math.sin(time*1.1+h%9)*2;
              g.strokeStyle='#2e6a32';g.lineWidth=1.6;g.beginPath();g.moveTo(x,ceilY+2);g.quadraticCurveTo(x+16+sw,ceilY+len,x+32,ceilY+2);g.stroke();
              for(let k=1;k<6;k++){const f=k/6,lx=x+32*f+sw*Math.sin(f*Math.PI),ly=ceilY+2+len*Math.sin(f*Math.PI)*0.9;
                g.fillStyle=k%2?'#3e7a46':'#5a9a50';g.beginPath();g.ellipse(lx,ly+2,3,1.6,k,0,TAU);g.fill();
                if(k%2===0){g.fillStyle=['#ffb0d8','#fff0f6','#c8a0ff'][(h+k)%3];g.beginPath();g.arc(lx,ly+5,2.2,0,TAU);g.fill();g.fillStyle='#ffe080';g.beginPath();g.arc(lx,ly+5,0.8,0,TAU);g.fill();}}
            }
            break;
          case '|':{               /* резная колонна беседки, обвитая лозой */
            if(fr<0||cr<0)break;const top=ceilY,bot=y+TILE,c=L3('#f2e8f6');
            g.fillStyle=c[2];g.fillRect(x+10,top,12,bot-top);g.fillStyle=c[1];g.fillRect(x+11,top,9,bot-top);g.fillStyle=c[0];g.fillRect(x+12,top,2.4,bot-top);
            g.fillStyle=c[1];g.fillRect(x+6,top,20,5);g.fillRect(x+6,bot-6,20,6);g.fillStyle=c[0];g.fillRect(x+6,top,20,1.4);g.fillRect(x+6,bot-6,20,1.4);
            g.strokeStyle='#3e7a46';g.lineWidth=1.6;g.beginPath();for(let yy=top+6;yy<bot-6;yy+=2){const xx=x+16+Math.sin((yy-top)*0.18)*7;yy===top+6?g.moveTo(xx,yy):g.lineTo(xx,yy);}g.stroke();
            for(let yy=top+14;yy<bot-8;yy+=18){g.fillStyle='#5a9a50';g.beginPath();g.ellipse(x+16+Math.sin((yy-top)*0.18)*7+3,yy,3,1.6,0.6,0,TAU);g.fill();g.fillStyle='#ffb0d8';g.beginPath();g.arc(x+16+Math.sin((yy-top+9)*0.18)*7,yy+9,1.8,0,TAU);g.fill();}
            break;}
          case 'h':
            if(id==='puppetTheater'){const c=L3('#9a1e32');g.fillStyle='#3a2a2a';g.fillRect(x+8,y+26,3,6);g.fillRect(x+21,y+26,3,6);
              g.fillStyle=c[2];g.fillRect(x+6,y+8,20,14);g.fillStyle=c[1];g.fillRect(x+7,y+9,17,12);g.fillStyle=c[0];g.fillRect(x+7,y+9,4,12);
              g.fillStyle=c[1];g.fillRect(x+5,y+20,22,7);g.fillStyle='#e0b050';g.fillRect(x+5,y+20,22,1.4);}
            else if(id==='upsideHouse'){const c=L3('#7a5a4a');g.fillStyle=c[1];g.fillRect(x+8,ceilY,3,14);g.fillRect(x+21,ceilY,3,14);g.fillRect(x+7,ceilY+13,18,4);g.fillRect(x+21,ceilY+13,3,16);g.fillStyle=c[0];g.fillRect(x+7,ceilY+13,18,1.2);}
            else{   /* кованый стул; в Истине на нём сидит тень гостя */
              const c=L3('#f4eefa');g.strokeStyle=c[2];g.lineWidth=2.2;g.beginPath();g.moveTo(x+9,y+32);g.lineTo(x+10,y+20);g.moveTo(x+23,y+32);g.lineTo(x+22,y+20);g.moveTo(x+9,y+20);g.lineTo(x+9,y+4);g.stroke();
              g.strokeStyle=c[1];g.lineWidth=1.4;g.beginPath();g.moveTo(x+9,y+5);g.quadraticCurveTo(x+4,y+10,x+9,y+14);g.stroke();
              g.fillStyle=c[1];g.fillRect(x+7,y+18,18,3);g.fillStyle=c[0];g.fillRect(x+7,y+18,18,1);
              if(T>0.25){g.globalAlpha=clamp((T-0.25)*1.6,0,0.9);g.fillStyle='#0c0612';g.beginPath();g.ellipse(x+16,y-2,6,7,0,0,TAU);g.fill();g.fillRect(x+10,y+3,12,16);
                g.fillStyle='#ff2a4a';g.fillRect(x+13,y-3,2,1.6);g.fillRect(x+18,y-3,2,1.6);g.globalAlpha=1;}}
            break;
          case 'T':
            if(id==='upsideHouse'){const c=L3('#8a6a4a');g.fillStyle=c[1];g.fillRect(x+4,ceilY,3,14);g.fillRect(x+25,ceilY,3,14);g.fillRect(x-4,ceilY+14,40,4);g.fillStyle=c[0];g.fillRect(x-4,ceilY+14,40,1.2);
              g.fillStyle='#f4eefa';g.fillRect(x+6,ceilY+18,8,6);g.fillRect(x+18,ceilY+18,6,4);break;}
            {g.save();g.translate(x+32,y+32);g.scale(1.35,1.35);g.translate(-(x+32),-(y+32));
             const done=S&&S.done,c=L3('#fff6fc');   /* чайный стол с кружевной скатертью */
              g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(x+32,y+31,26,3,0,0,TAU);g.fill();
              g.fillStyle='#8a6a7a';g.fillRect(x+30,y+18,4,14);g.fillRect(x+22,y+29,20,3);
              g.fillStyle=c[2];g.beginPath();g.ellipse(x+32,y+16,26,5,0,0,TAU);g.fill();g.fillStyle=c[1];g.beginPath();g.ellipse(x+31,y+15,25,4,0,0,TAU);g.fill();
              g.fillStyle=c[1];g.beginPath();g.moveTo(x+6,y+16);for(let k=0;k<=8;k++)g.lineTo(x+6+k*6.5,y+22+(k%2)*2);g.lineTo(x+58,y+16);g.closePath();g.fill();
              g.fillStyle=c[0];g.beginPath();g.ellipse(x+22,y+13.6,10,1.4,0,0,TAU);g.fill();
              /* чайник */
              const p=L3('#f4e6f8');g.fillStyle=p[2];g.beginPath();g.ellipse(x+32,y+5,8,7,0,0,TAU);g.fill();g.fillStyle=p[1];g.beginPath();g.ellipse(x+31,y+4,7,6,0,0,TAU);g.fill();
              g.fillStyle=p[0];g.beginPath();g.ellipse(x+28,y+1,2.4,1.6,-0.5,0,TAU);g.fill();g.fillStyle='#ff9ac8';g.beginPath();g.arc(x+34,y+5,1.6,0,TAU);g.arc(x+30,y+7,1.2,0,TAU);g.fill();
              g.strokeStyle=p[2];g.lineWidth=1.6;g.beginPath();g.moveTo(x+39,y+4);g.quadraticCurveTo(x+44,y+1,x+45,y-3);g.stroke();g.beginPath();g.arc(x+24,y+4,3.4,Math.PI*0.5,Math.PI*1.5);g.stroke();
              g.fillStyle=p[1];g.fillRect(x+29,y-3,6,2);g.beginPath();g.arc(x+32,y-4,1.6,0,TAU);g.fill();
              /* чашки: одна лишняя */
              for(const [cx2,k] of [[x+12,0],[x+20,1],[x+44,2],[x+52,3]]){g.fillStyle='#f4eefa';g.beginPath();g.moveTo(cx2-3,y+8);g.lineTo(cx2+3,y+8);g.lineTo(cx2+2,y+12);g.lineTo(cx2-2,y+12);g.closePath();g.fill();
                g.fillStyle=done?'#e8d8e0':T>0.5?'#5a0a14':'#a0602a';g.fillRect(cx2-2.4,y+8,4.8,1.2);g.strokeStyle='#f4eefa';g.lineWidth=0.8;g.beginPath();g.arc(cx2+3.4,y+10,1.4,-1.4,1.4);g.stroke();}
              if(!done){gl(x+32,y+4,34,'#ffe6d0');if(!low&&Math.random()<0.08)spawnPart(x+45+rnd(-1,1),y-4,rnd(-4,4),rnd(-24,-12),1.4,'rgba(255,255,255,.7)',2.4,-6);}
              g.restore();
            }
            break;
          case 'e':{lsBlob(g,x+16,y+24,14,9,'#3e7a46');lsBlob(g,x+8,y+26,8,6,'#2e6a3a');
            for(let k=0;k<5;k++){const fx=x+6+((h>>>(k*3))%20),fy=y+16+((h>>>(k*3+5))%10);g.fillStyle=['#ffb0d8','#fff0f6','#c8a0ff','#ffd080'][(h+k)%4];
              g.beginPath();for(let p=0;p<5;p++){const a=p/5*TAU+time*0.2;g.moveTo(fx,fy);g.arc(fx+Math.cos(a)*2.2,fy+Math.sin(a)*2.2,1.6,0,TAU);}g.fill();g.fillStyle='#ffe080';g.beginPath();g.arc(fx,fy,0.9,0,TAU);g.fill();}
            break;}
          case 'P':{               /* клетчатое покрывало */
            const left=row[c-1]!=='P'&&row[c-1]!=='K',right=row[c+1]!=='P'&&row[c+1]!=='K';
            g.fillStyle='#f4e0ea';g.fillRect(x,y+27,TILE,5);for(let k=0;k<4;k++){g.fillStyle='rgba(220,70,120,.55)';g.fillRect(x+k*8,y+27,4,5);}
            g.fillStyle='rgba(220,70,120,.35)';g.fillRect(x,y+29,TILE,1.4);
            if(left){g.fillStyle='#fff';for(let k=0;k<3;k++)g.fillRect(x-1,y+27+k*2,2,1);}if(right){g.fillStyle='#fff';for(let k=0;k<3;k++)g.fillRect(x+31,y+27+k*2,2,1);}
            break;}
          case 'K':{               /* пирожное на тарелке */
            g.fillStyle='#f4e0ea';g.fillRect(x,y+27,TILE,5);for(let k=0;k<4;k++){g.fillStyle='rgba(220,70,120,.55)';g.fillRect(x+k*8,y+27,4,5);}
            const eaten=S&&S.eat&&S.eat.indexOf(wx+','+wy)>=0;
            g.fillStyle='#fff';g.beginPath();g.ellipse(x+16,y+26,10,2.4,0,0,TAU);g.fill();
            if(eaten){g.fillStyle='#d8a0b8';for(let k=0;k<5;k++)g.fillRect(x+9+k*3,y+24+(k%2),1.6,1.6);break;}
            const rot=T>0.5,c=L3(rot?'#8a8a70':'#ff9ac8'),sp=L3(rot?'#6a5a40':'#f8e0b0');
            g.fillStyle=sp[1];g.fillRect(x+8,y+16,16,9);g.fillStyle=sp[2];g.fillRect(x+8,y+22,16,3);g.fillStyle=c[1];g.fillRect(x+8,y+19,16,2);
            g.fillStyle=c[1];g.beginPath();g.ellipse(x+16,y+16,8.6,3.4,0,0,TAU);g.fill();g.fillStyle=c[0];g.beginPath();g.ellipse(x+13,y+15,4,1.4,0,0,TAU);g.fill();
            g.fillStyle=rot?'#3a2a1a':'#c41e3c';g.beginPath();g.arc(x+16,y+12,2.6,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.arc(x+15,y+11,0.8,0,TAU);g.fill();
            if(rot){g.fillStyle='#1a1010';for(let k=0;k<3;k++){g.beginPath();g.arc(x+16+Math.cos(time*6+k*2)*10,y+10+Math.sin(time*7+k)*4,1,0,TAU);g.fill();}}
            break;}
          case 'C':case 'k':{
            const kind=id==='picnic'?'basket':id==='queenHive'?'royal':'lilac';
            const locked=ch==='k'&&!lsDone(q);
            lsChest(g,x,y,openedChests.has(wx+','+wy),kind,time,h,gl,locked);
            break;}
          case 'U':{               /* сундук вверх ногами, «стоит» на потолке */
            g.save();g.translate(0,ceilY*2+32);g.scale(1,-1);lsChest(g,x,ceilY,!!(S&&S.done),'lilac',time,h,gl,false);g.restore();break;}
          case 'c':lsCandle(g,x+16,y+32,10,true,time,h,gl);break;
          case 'n':{               /* шкатулка с запиской */
            const read=S&&S.read,c=L3('#8a6a4a');g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(x+16,y+31,10,2,0,0,TAU);g.fill();
            g.fillStyle=c[2];g.fillRect(x+7,y+21,18,10);g.fillStyle=c[1];g.fillRect(x+8,y+22,15,8);g.fillStyle=c[0];g.fillRect(x+8,y+22,15,1.4);
            if(read){g.fillStyle=c[1];g.save();g.translate(x+7,y+21);g.rotate(-1.2);g.fillRect(0,-1,10,2.4);g.restore();}
            else{g.fillStyle='#f4ead6';g.save();g.translate(x+16,y+20);g.rotate(-0.25);g.fillRect(-5,-6,10,7);g.fillStyle='rgba(80,60,40,.5)';for(let k=0;k<3;k++)g.fillRect(-4,-5+k*2,8,0.6);g.restore();
              g.fillStyle=c[1];g.fillRect(x+7,y+19,18,3);gl(x+16,y+20,24,'#ffe6a0');}
            break;}
          case 'f':case 'M':{
            if(ch==='M'){const key=wx+','+wy;if(trapSpawned.has(key))break;
              if(G.wf.trd&&G.wf.trd.indexOf(key)>=0){g.fillStyle='#b294c6';for(let k=0;k<5;k++){g.save();g.translate(x+8+k*4,y+30);g.rotate(k*1.3);g.fillRect(-3,-2,6,3);g.restore();}
                g.fillStyle='#3a2418';g.beginPath();g.ellipse(x+16,y+31,8,1.6,0,0,TAU);g.fill();break;}}
            const picked=ch==='f'&&S&&S.pick&&S.pick.indexOf(wx+','+wy)>=0;
            g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(x+16,y+31,12,2.4,0,0,TAU);g.fill();
            g.save();g.translate(x+16,y+32);g.scale(1.15,1.15);lilPotArt(g,{t:time+h,picked,truth:ch==='M'?T:0,hue:h%3});g.restore();
            if(ch==='f'&&!picked)gl(x+16,y-2,22,'#bfe6ff');
            break;}
          case 'W':{               /* витраж часовни */
            const cy=wy*TILE+8,c=['#ff9ac8','#9ad8ff','#ffd070','#c8a0ff'];
            g.fillStyle='#2a2440';g.beginPath();g.moveTo(x+4,cy+30);g.lineTo(x+4,cy+4);g.quadraticCurveTo(x+16,cy-12,x+28,cy+4);g.lineTo(x+28,cy+30);g.closePath();g.fill();
            for(let k=0;k<6;k++){g.fillStyle=c[(h+k)%4];g.globalAlpha=0.55+0.15*Math.sin(time*0.8+k);const kx=x+7+(k%2)*10,ky=cy+(k>>1)*9;g.fillRect(kx,ky,8,7);}
            g.globalAlpha=1;g.strokeStyle='#e0b050';g.lineWidth=1.2;g.beginPath();g.moveTo(x+4,cy+30);g.lineTo(x+4,cy+4);g.quadraticCurveTo(x+16,cy-12,x+28,cy+4);g.lineTo(x+28,cy+30);g.closePath();g.stroke();
            gl(x+16,cy+12,40,c[h%4]);break;}
          case 'B':{               /* колокол: качается, когда звонит */
            const ring=S&&S.ring&&G.time-S.ring<3?Math.sin((G.time-S.ring)*12)*0.4*(1-(G.time-S.ring)/3):Math.sin(time*0.8)*0.03;
            g.save();g.translate(x+16,ceilY);g.rotate(ring);g.strokeStyle='#5a4a3a';g.lineWidth=2;g.beginPath();g.moveTo(0,0);g.lineTo(0,10);g.stroke();
            const c=L3('#c8964a');g.fillStyle=c[2];g.beginPath();g.moveTo(-14,34);g.quadraticCurveTo(-12,10,0,10);g.quadraticCurveTo(12,10,14,34);g.closePath();g.fill();
            g.fillStyle=c[1];g.beginPath();g.moveTo(-12,33);g.quadraticCurveTo(-10,12,0,12);g.quadraticCurveTo(8,12,10,33);g.closePath();g.fill();
            g.fillStyle=c[0];g.fillRect(-8,14,3,16);g.fillStyle=c[2];g.fillRect(-15,32,30,3);g.fillStyle='#3a2a1a';g.beginPath();g.arc(0,36,3,0,TAU);g.fill();g.restore();break;}
          case 'p':{               /* скамья */
            const c=L3('#b48cc0');g.fillStyle=c[2];g.fillRect(x-2,y+18,36,4);g.fillStyle=c[1];g.fillRect(x-2,y+18,36,2.4);g.fillStyle=c[0];g.fillRect(x-2,y+18,36,0.8);
            g.fillStyle=c[2];g.fillRect(x+1,y+22,3,10);g.fillRect(x+28,y+22,3,10);g.fillRect(x-2,y+6,3,12);g.fillStyle=c[1];g.fillRect(x-2,y+6,36,3);break;}
          case 'A':
            if(id==='roseAltar'){const n=(S&&S.n)||0,c=L3('#5a2a3a');
              g.fillStyle=c[2];g.fillRect(x-6,y+12,44,20);g.fillStyle=c[1];g.fillRect(x-5,y+13,41,18);g.fillStyle=c[0];g.fillRect(x-5,y+13,41,2);
              g.fillStyle=c[1];g.fillRect(x-9,y+8,50,5);g.fillStyle=c[0];g.fillRect(x-9,y+8,50,1.4);
              g.fillStyle='#2a3a22';g.beginPath();g.ellipse(x+16,y+6,14,4,0,0,TAU);g.fill();
              for(let k=0;k<5;k++){const rx=x+6+k*5,ry=y+2-Math.sin(k*1.3)*3,s2=n>=3?2.4:3.6;g.fillStyle=n>=3?'#5a1a2a':'#b8203e';g.beginPath();g.arc(rx,ry,s2,0,TAU);g.fill();g.fillStyle=n>=3?'#3a0a1a':'#ff6a8a';g.beginPath();g.arc(rx-0.8,ry-0.8,s2*0.45,0,TAU);g.fill();}
              g.strokeStyle='#3a5a2a';g.lineWidth=1.4;for(const sd of [-1,1]){g.beginPath();g.moveTo(x+16+sd*20,y+32);g.quadraticCurveTo(x+16+sd*26,y+14,x+16+sd*14,y+6);g.stroke();
                for(let k=0;k<4;k++){g.fillStyle='#e8d0b0';g.fillRect(x+16+sd*(21+k*-1.4)-0.6,y+28-k*6,1.2,2);}}
              g.fillStyle='#8a0a1e';for(let k=0;k<3;k++){const dy=((time*0.5+k*0.33)%1)*14;g.fillRect(x+4+k*12,y+13+dy,1.6,3);}
              if(n<3)gl(x+16,y+4,46,'#ff3a5a');}
            else{const c=L3('#e8e0f0');   /* алтарь часовни */
              g.fillStyle=c[2];g.fillRect(x-4,y+12,40,20);g.fillStyle=c[1];g.fillRect(x-3,y+13,37,18);g.fillStyle=c[0];g.fillRect(x-3,y+13,37,2);
              g.fillStyle='#7a5aa8';g.fillRect(x+8,y+12,16,20);g.fillStyle='#e0b050';g.fillRect(x+8,y+12,16,1.4);g.fillRect(x+15,y+16,2,10);g.fillRect(x+12,y+19,8,2);
              lsCandle(g,x-1,y+12,7,true,time,h,gl);lsCandle(g,x+33,y+12,9,true,time,h+3,gl);}
            break;
          case 'j':{               /* свеча мастерской: горит и тает */
            const lit=S&&S.lit&&S.lit[wx+','+wy],len=lit?clamp((lit-G.time)/12,0.15,1)*20:(S&&S.done?6:20);
            lsCandle(g,x+16,y+32,len,!!lit||(S&&S.done),time,h,gl);
            if(lit&&!low&&Math.random()<0.05)spawnPart(x+19,y+32-len,0,30,0.8,'#f4ead6',1.6,200);break;}
          case 'Y':{               /* рычаг карусели */
            const on=S&&(S.run||S.done),c=L3('#e0b050');g.fillStyle='#3a2a3a';g.fillRect(x+8,y+22,16,10);g.fillStyle='#5a4a5a';g.fillRect(x+8,y+22,16,2);
            g.save();g.translate(x+16,y+24);g.rotate(on?0.7:-0.7);g.fillStyle=c[1];g.fillRect(-1.6,-20,3.2,20);g.fillStyle=c[0];g.fillRect(-1.6,-20,1,20);
            g.fillStyle='#ff6aa8';g.beginPath();g.arc(0,-21,4,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.5)';g.beginPath();g.arc(-1.4,-22.4,1.2,0,TAU);g.fill();g.restore();break;}
          case 'R':
            if(id==='carousel'){lsClip(g,wx-5,wy-7,wx+5,wy);lsCarouselArt(g,x,y,q,time,gl,S);g.restore();}
            else{const len=26+(h%20),sw=Math.sin(time*1.2+h%5)*2;   /* свисающие плети роз */
              g.strokeStyle='#2a4a22';g.lineWidth=1.8;g.beginPath();g.moveTo(x+16,ceilY);g.quadraticCurveTo(x+12+sw,ceilY+len*0.6,x+16+sw*1.5,ceilY+len);g.stroke();
              for(let k=1;k<=3;k++){const f=k/3.2,rx=x+16+sw*f*1.4-Math.sin(f*3)*3,ry=ceilY+len*f;g.fillStyle='#8a1028';g.beginPath();g.arc(rx,ry,3.4,0,TAU);g.fill();g.fillStyle='#c8304e';g.beginPath();g.arc(rx-0.8,ry-0.8,1.8,0,TAU);g.fill();
                g.fillStyle='#3e6a34';g.beginPath();g.ellipse(rx+4,ry-2,2.6,1.2,0.6,0,TAU);g.fill();}}
            break;
          case 'r':{lsBlob(g,x+16,y+24,13,9,'#24402a');
            for(let k=0;k<4;k++){const rx=x+6+((h>>>(k*3))%20),ry=y+17+((h>>>(k*3+5))%8);g.fillStyle=T>0.5?'#4a0a14':'#a01a3a';g.beginPath();g.arc(rx,ry,3.2,0,TAU);g.fill();g.fillStyle=T>0.5?'#7a1020':'#e04060';g.beginPath();g.arc(rx-0.8,ry-0.8,1.6,0,TAU);g.fill();}
            g.fillStyle='#e8d0b0';for(let k=0;k<4;k++)g.fillRect(x+4+k*7,y+22+(k%2)*3,1,2);break;}
          case 'S':lsClip(g,wx-6,wy-6,wx+6,wy);lsStageArt(g,x,y,q,time,gl,S);g.restore();break;
          case '1':case '2':case '3':case '4':case '5':lsMirror(g,x,y,ch,time,gl,h);break;
          case 'Z':case '*':{      /* подвеска: месяц и звёзды */
            const rot=Math.sin(time*0.6+h)*0.3;g.save();g.translate(x+16,ceilY);g.strokeStyle='rgba(230,220,240,.6)';g.lineWidth=0.8;
            g.beginPath();g.moveTo(0,0);g.lineTo(0,14);g.stroke();g.rotate(rot);g.strokeStyle='#c8b8a0';g.lineWidth=1.4;g.beginPath();g.moveTo(-16,14);g.lineTo(16,14);g.stroke();
            for(let k=0;k<3;k++){const sx=-14+k*14,sl=10+k*6;g.strokeStyle='rgba(230,220,240,.6)';g.lineWidth=0.7;g.beginPath();g.moveTo(sx,14);g.lineTo(sx,14+sl);g.stroke();
              g.fillStyle=k===1&&ch==='Z'?'#fff0b0':'#ffe080';g.beginPath();
              if(k===1&&ch==='Z'){g.arc(sx,20+sl,6,0,TAU);g.fill();g.fillStyle='#2a2440';g.beginPath();g.arc(sx+3,18+sl,5,0,TAU);}
              else for(let p=0;p<10;p++){const a=p/10*TAU-Math.PI/2,r2=p%2?1.6:4;g.lineTo(sx+Math.cos(a)*r2,18+sl+Math.sin(a)*r2);}
              g.fill();gl(x+16+sx,ceilY+18+sl,18,'#ffe6a0');}
            g.restore();break;}
          case 'X':lsClip(g,wx-1,wy-4,wx+4,wy);lsCradleArt(g,x,y,time,gl,S);g.restore();break;
          case 'm':lsMusicBox(g,x,y,time,gl,S);break;
          case 'O':lsClip(g,wx-2,wy-4,wx+2,wy);lsWellArt(g,x,y,time,gl,S);g.restore();break;
        }
      }
    }
    if(id==='carousel'&&LCR.q===q)lsCarouselHz(g,time);
  }
  /* рой пчёл */
  if(LSW.t>0){
    softGlow(g,player.x,player.y-player.h*0.6,70,'#ffb020',0.25*Math.min(1,LSW.t));
    for(const b of LSW.bees){const d=b.vx>=0?1:-1,f=Math.abs(Math.sin(G.time*60+b.ph));
      g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.ellipse(b.x-1*d,b.y-4,2.6,1.2+f*1.4,-0.3*d,0,TAU);g.ellipse(b.x+1.4*d,b.y-4,2.2,1+f*1.2,0.3*d,0,TAU);g.fill();
      g.fillStyle='#ffc020';g.beginPath();g.ellipse(b.x,b.y,4.6,3.2,0,0,TAU);g.fill();
      g.fillStyle='#2a1a06';g.fillRect(b.x-1.6,b.y-3,1.6,6);g.fillRect(b.x+1.4,b.y-2.8,1.4,5.6);g.beginPath();g.arc(b.x+4*d,b.y-0.4,1.8,0,TAU);g.fill();
      g.fillStyle='#ffe890';g.beginPath();g.ellipse(b.x-1,b.y-1.6,2,0.8,0,0,TAU);g.fill();
      g.strokeStyle='#2a1a06';g.lineWidth=0.8;g.beginPath();g.moveTo(b.x-4.4*d,b.y);g.lineTo(b.x-6.4*d,b.y+0.6);g.stroke();}}
  g.restore();
  if(glows.length)drawGlowList(g,glows,0.4);
  /* подсказки у предметов */
  for(const hn of LS_HINTS)lsLabel(g,hn.x,hn.y,hn.txt,hn.col);
}

/* ---------- экран: моргание, сон и таймер сна ---------- */
function lilStructScreen(W,H){
  const g=ctx;g.save();g.setTransform(dpr,0,0,dpr,0,0);
  if(G.lsBlink>0){g.fillStyle='rgba(8,2,12,'+clamp(G.lsBlink/0.25,0,1)*0.92+')';g.fillRect(0,0,W,H);}
  if(G.dream&&!hudHidden()){
    const t=G.dream.t,k=t<10?1-t/10:0;
    const vg=g.createRadialGradient(W/2,H*0.45,Math.min(W,H)*0.3,W/2,H*0.45,Math.max(W,H)*0.75);vg.addColorStop(0,'rgba(255,220,250,0)');vg.addColorStop(1,'rgba('+Math.round(200-150*k)+','+Math.round(160-150*k)+',255,'+(0.35+0.3*k)+')');
    g.fillStyle=vg;g.fillRect(0,0,W,H);
    const txt='Сон · '+Math.ceil(t)+' с';g.font='700 13px '+HUDF;const tw=g.measureText(txt).width+40,x=W/2-tw/2,y=Math.min(H*0.14,118);
    hudPlate(x,y,tw,22,t<10);hudIcon('eye',x+15,y+11,14);g.fillStyle=t<10?'#ffb0c0':'#f0e0ff';g.textAlign='left';g.fillText(txt,x+28,y+15.5);
    g.fillStyle='rgba(255,220,250,.25)';g.fillRect(x+4,y+19,(tw-8)*clamp(t/DREAM_T,0,1),2);
  }
  g.restore();
}
/* ---------- сонный карман: небо сна ---------- */
function lilDreamBackdrop(g,W,H,cam,T){
  const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#2a1e5a');gr.addColorStop(0.55,'#7a5aa8');gr.addColorStop(1,'#f0b8d8');g.fillStyle=gr;g.fillRect(0,0,W,H);
  g.fillStyle='rgba(255,250,230,.9)';for(let i=0;i<60;i++){const x=((i*137.5-cam.x*0.05)%W+W)%W,y=(i*71.3)%(H*0.6),tw=0.5+0.5*Math.sin(T*2+i);g.globalAlpha=0.3+0.6*tw;g.fillRect(x,y,1.6,1.6);}
  g.globalAlpha=1;
  const mx=W*0.72-cam.x*0.02,my=H*0.22;softGlow(g,mx,my,90,'#fff0d0',0.6);g.fillStyle='#fff6e0';g.beginPath();g.arc(mx,my,30,0,TAU);g.fill();g.fillStyle='rgba(200,170,220,.35)';g.beginPath();g.arc(mx-8,my-6,7,0,TAU);g.arc(mx+9,my+8,5,0,TAU);g.fill();
  for(let l=0;l<3;l++){g.fillStyle='rgba(255,230,250,'+(0.18+l*0.08)+')';const off=-cam.x*(0.08+l*0.06)+T*(4+l*3);
    for(let i=-1;i<6;i++){const cx=((i*W/4+off)%(W*1.5)+W*1.5)%(W*1.5)-W*0.25,cy=H*(0.55+l*0.14);g.beginPath();g.ellipse(cx,cy,80+l*20,18+l*6,0,0,TAU);g.ellipse(cx+40,cy-10,50,16,0,0,TAU);g.fill();}}
}

/* ---------- тест-панель: найти ближайшую постройку ---------- */
function lilFindStruct(id){
  const st=STRUCTS.find(s=>s.id===id&&s.dim===2);if(!st)return null;
  let best=null,bd=1e9;const py=player.y/TILE;
  for(let cy=Math.floor(st.d0/st.ch);cy<=Math.floor(st.d1/st.ch);cy++)for(let cx=0;cx<=Math.floor(MW/st.cw);cx++){
    const pl=structPlace(st,cx,cy);if(!pl)continue;const d=Math.abs(pl.py-py)+Math.abs(pl.px-player.x/TILE)*0.2;if(d<bd){bd=d;best=pl;}}
  return best;
}
function lilTpStruct(id){
  if(G.dim!==2||G.scene!=='mine'){UI.toast('Сначала спустись в шахту Лиловых небес');return;}
  const pl=lilFindStruct(id);if(!pl){UI.toast('Не нашлось');return;}
  const st=STRUCTS.find(s=>s.id===id&&s.dim===2);
  /* встаём у левого края, на пол постройки */
  let tx=pl.px+1,ty=pl.py+pl.th-2;
  for(let r=pl.th-2;r>=0;r--){const row=st.tpl[r];let c=row.split('').findIndex((ch,i)=>i>0&&'#xwbo~='.indexOf(ch)<0&&'#xwbo'.indexOf((st.tpl[r+1]||'')[i])>=0);if(c>0){tx=pl.px+c;ty=pl.py+r;break;}}
  player.x=tx*TILE+16;player.y=(ty+1)*TILE-1;player.vx=0;player.vy=0;G.cam.x=player.x;G.cam.y=player.y-player.h*0.5;
  UI.close();UI.toast((LS_NAMES[id]||id)+' · '+Math.round(pl.py)+' м');
}
