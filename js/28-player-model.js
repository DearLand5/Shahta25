'use strict';
/* ============================================================
   ПЕРСОНАЖ v12: шахтёр в стиле «стимпанк-мультфильм» --
   крупная голова, усы, каска с фонарём, коренастое тело, большие перчатки
   и ботинки; каждый уровень брони — свой силуэт.
   ============================================================ */
const PL_SKIN='#f0bf8f',PL_SKIN_D='#c98c62',PL_BEARD=['#6a3a1c','#6a3a1c','#5a3218','#4a2a14','#e8f4ff','#2a1a3a','#3a2a24','#4a0a12','#d8d0bc','#2a0a04'];
function plBlob(g,x,y,rx,ry,c,rot){g.beginPath();g.ellipse(x,y,rx,ry,rot||0,0,TAU);g.fillStyle=c;g.fill();}
function plVol(g,x,y,rx,ry,c,rot){
  const gr=g.createLinearGradient(x-rx*0.6,y-ry,x+rx*0.4,y+ry);gr.addColorStop(0,shadeHex(c,0.22));gr.addColorStop(0.45,c);gr.addColorStop(0.5,shadeHex(c,-0.12));gr.addColorStop(1,shadeHex(c,-0.32));
  g.beginPath();g.ellipse(x,y,rx,ry,rot||0,0,TAU);g.fillStyle=gr;g.fill();
}
/* конечность из двух сегментов с объёмом */
function plSeg(g,x,y,a1,l1,k,l2,w1,w2,c,hi){
  const x1=x+Math.sin(a1)*l1,y1=y+Math.cos(a1)*l1,a2=a1-k,x2=x1+Math.sin(a2)*l2,y2=y1+Math.cos(a2)*l2;
  g.lineCap='round';g.lineJoin='round';g.strokeStyle=c;
  g.lineWidth=w1;g.beginPath();g.moveTo(x,y);g.lineTo(x1,y1);g.stroke();
  g.lineWidth=w2;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();
  if(hi){g.strokeStyle=hi;g.lineWidth=Math.max(1,w1*0.28);g.beginPath();g.moveTo(x-w1*0.18,y);g.lineTo(x1-w1*0.18,y1);g.lineTo(x2-w2*0.18,y2);g.stroke();}
  return [x1,y1,x2,y2,a2];
}
function plBoot(g,x,y,a,c,lv){
  g.save();g.translate(x,y);g.rotate(-a*0.6);
  g.fillStyle=c;g.beginPath();g.moveTo(-4.6,-4);g.lineTo(3,-4.4);g.quadraticCurveTo(8.4,-3.4,8.4,0.4);g.lineTo(8.4,1.6);g.lineTo(-4.8,1.6);g.closePath();g.fill();
  g.fillStyle=shadeHex(c,-0.4);g.fillRect(-4.8,0.2,13.2,1.6);
  g.fillStyle=shadeHex(c,0.25);g.fillRect(-3.6,-3.6,5,1.2);
  if(lv>=4){g.fillStyle=lv>=6?ARMOR_LOOK[lv].trim:'#c4ccd8';g.beginPath();g.moveTo(2,-4.4);g.quadraticCurveTo(8,-3.6,8.2,0);g.lineTo(5,0);g.closePath();g.fill();}
  g.restore();
}
function plGlove(g,x,y,c,lv){
  plVol(g,x,y,3.6,3.4,c);
  g.fillStyle=shadeHex(c,-0.35);g.fillRect(x-3,y+0.6,6,1);
  if(lv>=4){g.fillStyle=lv>=6?ARMOR_LOOK[lv].trim:'#e8eef6';g.beginPath();g.arc(x-1.6,y-1.6,0.9,0,TAU);g.arc(x+1.2,y-2,0.9,0,TAU);g.fill();}
}
function plPauldron(g,x,y,lv,A,t){
  if(lv<2)return;
  if(lv===2){plVol(g,x,y,5,3.6,'#6a4426');g.strokeStyle='#3a2410';g.lineWidth=0.8;g.beginPath();g.arc(x,y,3,Math.PI*1.1,Math.PI*1.9);g.stroke();return;}
  if(lv===3){plVol(g,x,y,5.4,4,'#7a828c');g.fillStyle='rgba(40,46,56,.5)';for(let k=0;k<4;k++){g.beginPath();g.arc(x-3+k*2,y+1,0.9,0,TAU);g.fill();}return;}
  const col=lv===4?'#c4ccd8':A.body;
  plVol(g,x,y,6.4,4.8,col,-0.2);
  g.fillStyle=lv===4?'#8a94a4':A.trim;g.beginPath();g.ellipse(x,y+2.6,6,1.4,-0.2,0,TAU);g.fill();
  if(lv===5){g.fillStyle='#e8fbff';for(const [dx,h] of [[-3,7],[0,10],[3,7]]){g.beginPath();g.moveTo(x+dx-1.6,y-3);g.lineTo(x+dx,y-3-h);g.lineTo(x+dx+1.6,y-3);g.fill();}mobGlow(g,x,y-6,9,'#8ff0ff',0.35);}
  else if(lv===6){g.fillStyle='#14102a';for(const [dx,h] of [[-3,6],[1,9]]){g.beginPath();g.moveTo(x+dx-1.8,y-3);g.lineTo(x+dx+1,y-3-h);g.lineTo(x+dx+2,y-3);g.fill();}}
  else if(lv===7){g.fillStyle='#2a2420';g.beginPath();g.moveTo(x-3,y-3.4);g.lineTo(x-1.5,y-8);g.lineTo(x+1.5,y-8);g.lineTo(x+3,y-3.4);g.fill();mobGlow(g,x,y-8,6,'#ff7a2a',0.5+0.3*Math.sin(t*4));g.fillStyle='#ffb050';g.fillRect(x-1.2,y-8.4,2.4,1);}
  else if(lv===8){g.fillStyle='#e8dcc0';for(const dx of [-3,0,3]){g.beginPath();g.moveTo(x+dx-1.2,y-3.4);g.quadraticCurveTo(x+dx-2,y-8,x+dx+1.4,y-10);g.lineTo(x+dx+1.2,y-3.4);g.fill();}}
  else if(lv===9){plVol(g,x,y-2,4.6,4.2,'#efe6d0');g.fillStyle='#0a1020';g.fillRect(x-2.4,y-3,1.6,1.8);g.fillRect(x+0.6,y-3,1.6,1.8);mobGlow(g,x,y-2,6,'#5ab8ff',0.45);}
  else if(lv===10){olLight(g,(g)=>{for(let k=0;k<3;k++){const fx=x-3+k*3,fh=5+Math.sin(t*12+k*2)*2;g.fillStyle=k===1?'rgba(255,230,140,.9)':'rgba(255,100,20,.85)';g.beginPath();g.moveTo(fx-1.6,y-3);g.quadraticCurveTo(fx,y-3-fh*1.6,fx+1.6,y-3);g.fill();}});}
}
function drawArmorBody(g,lv,bob,t){
  const A=ARMOR_LOOK[lv],y0=-36+bob*0.4;
  /* торс-бочонок */
  const shirt=lv===1?'#c86a3a':lv===2?'#9a5a3a':shadeHex(A.body,-0.25);
  g.beginPath();g.moveTo(-9,-14);g.quadraticCurveTo(-12,-24,-10.5,y0+2);g.quadraticCurveTo(0,y0-3,10.5,y0+2);g.quadraticCurveTo(12.5,-24,9.5,-14);g.closePath();
  {const gr=g.createLinearGradient(-10,y0,8,-14);gr.addColorStop(0,shadeHex(shirt,0.2));gr.addColorStop(0.55,shirt);gr.addColorStop(0.6,shadeHex(shirt,-0.15));gr.addColorStop(1,shadeHex(shirt,-0.3));g.fillStyle=gr;g.fill();}
  if(lv===1){
    /* комбинезон с лямками */
    g.fillStyle='#3a6aa8';g.beginPath();g.moveTo(-8,-14);g.lineTo(-7.4,-27);g.lineTo(7.6,-27);g.lineTo(8.6,-14);g.closePath();g.fill();
    g.fillStyle='#2a5288';g.fillRect(-7.4,-27,15,2);
    g.strokeStyle='#3a6aa8';g.lineWidth=2.4;g.beginPath();g.moveTo(-5.6,-27);g.lineTo(-7,y0+1.5);g.moveTo(5.6,-27);g.lineTo(6.8,y0+1.5);g.stroke();
    g.fillStyle='#ffd04a';g.beginPath();g.arc(-5.6,-26.4,1.1,0,TAU);g.arc(5.6,-26.4,1.1,0,TAU);g.fill();
    g.fillStyle='#2a5288';g.fillRect(-3,-24,6,4);g.fillStyle='rgba(255,255,255,.25)';g.fillRect(-2.6,-23.6,2,0.8);
    g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=0.7;g.setLineDash([1.2,1.2]);g.beginPath();g.moveTo(-7,-15.5);g.lineTo(-6.6,-26);g.moveTo(7.4,-15.5);g.lineTo(7,-26);g.stroke();g.setLineDash([]);
  }else if(lv===2){
    g.fillStyle='#7a4a26';g.beginPath();g.moveTo(-9,-14);g.lineTo(-10,y0+3);g.quadraticCurveTo(0,y0-1,10,y0+3);g.lineTo(9,-14);g.closePath();g.fill();
    g.strokeStyle='#4a2a12';g.lineWidth=2.2;g.beginPath();g.moveTo(-9,y0+3);g.lineTo(8,-16);g.stroke();
    g.fillStyle='#caa24a';for(let k=0;k<3;k++){g.beginPath();g.arc(-6+k*6,y0+6+k*5.4,0.9,0,TAU);g.fill();}
    g.strokeStyle='rgba(40,20,8,.6)';g.lineWidth=0.7;g.setLineDash([1.4,1.2]);g.beginPath();g.moveTo(-8.4,-15);g.lineTo(-9.4,y0+4);g.moveTo(8.4,-15);g.lineTo(9.4,y0+4);g.stroke();g.setLineDash([]);
  }else if(lv===3){
    g.save();g.beginPath();g.moveTo(-9,-14);g.quadraticCurveTo(-12,-24,-10.5,y0+2);g.quadraticCurveTo(0,y0-3,10.5,y0+2);g.quadraticCurveTo(12.5,-24,9.5,-14);g.closePath();g.clip();
    g.fillStyle='#9aa2ac';g.fillRect(-13,y0-4,26,26);g.strokeStyle='rgba(50,56,66,.75)';g.lineWidth=0.8;
    for(let ry=y0;ry<-13;ry+=2.6)for(let rx=-12;rx<12;rx+=2.6){g.beginPath();g.arc(rx+((Math.round(ry))%2?1.3:0),ry,1.15,0,TAU);g.stroke();}
    g.fillStyle='rgba(255,255,255,.18)';g.fillRect(-10,y0,5,20);g.restore();
    g.fillStyle='#5a3a20';g.fillRect(-1.5,y0+1,3,20);
  }else if(lv===4){
    g.fillStyle='#c4ccd8';g.beginPath();g.moveTo(-9,-15);g.quadraticCurveTo(-11,-26,-9.4,y0+3);g.quadraticCurveTo(0,y0,9.4,y0+3);g.quadraticCurveTo(11,-26,9,-15);g.quadraticCurveTo(0,-12.6,-9,-15);g.fill();
    g.fillStyle='rgba(255,255,255,.45)';g.fillRect(-1,y0+2,2,19);g.fillStyle='rgba(255,255,255,.2)';g.beginPath();g.ellipse(-4.6,y0+8,2.4,6,0,0,TAU);g.fill();
    g.strokeStyle='#8a94a4';g.lineWidth=1;g.beginPath();g.moveTo(-8.6,-20);g.quadraticCurveTo(0,-17.6,8.6,-20);g.stroke();
    g.fillStyle='#e8eef6';for(const [rx,ry] of [[-7,y0+5],[7,y0+5],[-7,-18],[7,-18]]){g.beginPath();g.arc(rx,ry,0.9,0,TAU);g.fill();}
    g.fillStyle='#d03a3a';g.beginPath();g.moveTo(-3,y0+8);g.lineTo(3,y0+8);g.lineTo(0,y0+13);g.closePath();g.fill();
  }else if(lv===5){
    const gr=g.createLinearGradient(-9,y0,9,-14);gr.addColorStop(0,'#c8f6ff');gr.addColorStop(0.5,'#79dcf5');gr.addColorStop(1,'#3a8aa8');
    g.fillStyle=gr;g.beginPath();g.moveTo(-9,-15);g.lineTo(-10,y0+3);g.lineTo(0,y0-1);g.lineTo(10,y0+3);g.lineTo(9,-15);g.lineTo(0,-12.4);g.closePath();g.fill();
    g.strokeStyle='rgba(232,251,255,.8)';g.lineWidth=0.8;g.beginPath();g.moveTo(-10,y0+3);g.lineTo(0,-12.4);g.lineTo(10,y0+3);g.moveTo(0,y0-1);g.lineTo(0,-12.4);g.stroke();
    g.fillStyle='#e8fbff';g.beginPath();g.moveTo(0,y0+5);g.lineTo(3.6,y0+10);g.lineTo(0,y0+15);g.lineTo(-3.6,y0+10);g.closePath();g.fill();mobGlow(g,0,y0+10,14,'#8ff0ff',0.45+0.15*Math.sin(t*4));
  }else{
    /* VI–X: тяжёлые адские латы */
    const gr=g.createLinearGradient(-9,y0,9,-14);gr.addColorStop(0,shadeHex(A.body,0.25));gr.addColorStop(0.5,A.body);gr.addColorStop(1,shadeHex(A.body,-0.35));
    g.fillStyle=gr;g.beginPath();g.moveTo(-9,-15);g.quadraticCurveTo(-11.4,-26,-9.6,y0+3);g.quadraticCurveTo(0,y0-0.5,9.6,y0+3);g.quadraticCurveTo(11.4,-26,9,-15);g.quadraticCurveTo(0,-12.4,-9,-15);g.fill();
    g.strokeStyle=hexA(A.trim,0.9);g.lineWidth=1;g.beginPath();g.moveTo(-9.4,y0+3);g.quadraticCurveTo(0,y0-0.5,9.4,y0+3);g.moveTo(-8.6,-20);g.quadraticCurveTo(0,-17,8.6,-20);g.stroke();
    const gl=A.glow||'176,128,255',pulse=0.6+0.4*Math.sin(t*3);
    if(lv===6){g.strokeStyle='rgba('+gl+','+pulse+')';g.lineWidth=1.2;g.beginPath();g.moveTo(-5,y0+5);g.lineTo(-1.6,y0+10);g.lineTo(-5,y0+15);g.moveTo(5,y0+5);g.lineTo(1.6,y0+10);g.lineTo(5,y0+15);g.moveTo(0,y0+3);g.lineTo(0,-18);g.stroke();mobGlow(g,0,y0+10,14,'#a070ff',0.35);}
    else if(lv===7){g.strokeStyle='rgba(255,'+(120+Math.floor(60*pulse))+',40,.95)';g.lineWidth=1.1;g.beginPath();g.moveTo(-7,y0+4);g.lineTo(-3,y0+9);g.lineTo(-6,y0+14);g.moveTo(-3,y0+9);g.lineTo(2,y0+7);g.lineTo(6,y0+12);g.moveTo(2,y0+7);g.lineTo(1,-18);g.stroke();mobGlow(g,-1,y0+9,12,'#ff7a2a',0.3);}
    else if(lv===8){g.strokeStyle='#e0d0c0';g.lineWidth=1.3;for(let k=0;k<3;k++){g.beginPath();g.moveTo(-8,y0+5+k*4);g.quadraticCurveTo(-3.4,y0+7+k*4,-1,y0+5+k*4);g.moveTo(8,y0+5+k*4);g.quadraticCurveTo(3.4,y0+7+k*4,1,y0+5+k*4);g.stroke();}
      const hb=1+0.18*Math.max(0,Math.sin(t*6));g.fillStyle='#ff2a3a';g.beginPath();g.arc(-1.2,y0+16,1.8*hb,0,TAU);g.arc(1.2,y0+16,1.8*hb,0,TAU);g.moveTo(-3.2*hb,y0+16.6);g.lineTo(0,y0+16+3.6*hb);g.lineTo(3.2*hb,y0+16.6);g.fill();mobGlow(g,0,y0+16,10,'#ff2a3a',0.4);}
    else if(lv===9){g.fillStyle='#f0e8d0';for(let k=0;k<5;k++){g.beginPath();g.ellipse(0,y0+4+k*3.6,1.6,1.3,0,0,TAU);g.fill();}
      g.strokeStyle='#e8dcc0';g.lineWidth=1.2;for(let k=0;k<3;k++){g.beginPath();g.moveTo(-1.6,y0+5+k*4);g.quadraticCurveTo(-6,y0+4+k*4,-8,y0+8+k*4);g.moveTo(1.6,y0+5+k*4);g.quadraticCurveTo(6,y0+4+k*4,8,y0+8+k*4);g.stroke();}mobGlow(g,0,y0+10,12,'#5ab8ff',0.3);}
    else{const p=0.7+0.3*Math.sin(t*5);olLight(g,(g)=>{const cg=g.createRadialGradient(0,y0+10,0.5,0,y0+10,7);cg.addColorStop(0,'rgba(255,255,210,'+p+')');cg.addColorStop(0.5,'rgba(255,170,40,'+p+')');cg.addColorStop(1,'rgba(255,60,0,0)');g.fillStyle=cg;g.beginPath();g.arc(0,y0+10,7,0,TAU);g.fill();});
      g.strokeStyle='rgba(255,170,40,.9)';g.lineWidth=0.9;g.beginPath();for(let k=0;k<6;k++){const a=k/6*TAU;g.moveTo(Math.cos(a)*3.4,y0+10+Math.sin(a)*3.4);g.lineTo(Math.cos(a)*7,y0+10+Math.sin(a)*7);}g.stroke();mobGlow(g,0,y0+10,16,'#ff9a30',0.4);}
  }
  /* пояс с пряжкой и подсумками */
  g.fillStyle=lv>=6?shadeHex(A.trim,-0.45):'#4a2c18';g.fillRect(-9.6,-17.6,19.4,3);
  g.fillStyle=lv>=6?A.trim:'#e0b84a';g.fillRect(-1.6,-18,3.4,3.8);g.fillStyle=lv>=6?shadeHex(A.trim,-0.3):'#8a6a20';g.fillRect(-0.6,-17,1.4,1.8);
  g.fillStyle=lv>=6?shadeHex(A.body,-0.35):'#6a4628';g.beginPath();g.moveTo(3.6,-15.2);g.lineTo(8.4,-15.2);g.lineTo(8,-10.8);g.lineTo(4,-10.8);g.closePath();g.fill();
  g.fillStyle='rgba(255,255,255,.18)';g.fillRect(4,-14.8,4,0.8);
}
function shadeHex(c,k){
  const n=parseInt(c.slice(1),16);
  let r=(n>>16)&255,gg=(n>>8)&255,b=n&255;
  const f=k<0?(1+k):1,a=k>0?255*k:0;
  r=Math.round(clamp(r*f+a,0,255));gg=Math.round(clamp(gg*f+a,0,255));b=Math.round(clamp(b*f+a,0,255));
  return '#'+((1<<24)|(r<<16)|(gg<<8)|b).toString(16).slice(1);
}
function drawPlayerHead(g,lv,bob,t,torch,face,opts){
  opts=opts||{};
  const hx=2,hy=-44+bob,R=10.6;
  const hurt=face==='hurt',effort=face==='effort';
  /* голова */
  {const gr=g.createRadialGradient(hx-3,hy-4,1,hx,hy,R*1.15);gr.addColorStop(0,'#ffd8b0');gr.addColorStop(0.55,PL_SKIN);gr.addColorStop(0.62,'#e2a878');gr.addColorStop(1,PL_SKIN_D);
    g.fillStyle=gr;g.beginPath();g.ellipse(hx,hy,R,R*0.96,0,0,TAU);g.fill();}
  /* ухо */
  plBlob(g,hx-6.4,hy+1,2.4,3,PL_SKIN_D);plBlob(g,hx-6.2,hy+1,1.2,1.8,'#b07a52');
  const open=hurt?0.25:((Math.sin(t*0.9+1.3)>0.985)?0.12:1);
  const noHelm=!!opts.noHelm,covered=lv>=4&&!noHelm,HAIR='#6a3a1c';
  if(!covered){
    /* глаза: дальний и ближний */
    const ex=hx+6.4,ey=hy-0.4;
    g.fillStyle='#fff';g.beginPath();g.ellipse(ex-5.6,ey+0.2,1.8,2.6*open,0,0,TAU);g.fill();
    g.beginPath();g.ellipse(ex,ey,2.6,3.2*open,0,0,TAU);g.fill();
    if(open>0.5){g.fillStyle='#2a3a5a';g.beginPath();g.ellipse(ex+0.9,ey+0.2,1.5,2,0,0,TAU);g.fill();g.beginPath();g.ellipse(ex-4.9,ey+0.4,1.1,1.6,0,0,TAU);g.fill();
      g.fillStyle='#0a0e18';g.beginPath();g.arc(ex+1.1,ey+0.3,0.8,0,TAU);g.fill();
      g.fillStyle='#fff';g.beginPath();g.arc(ex+0.3,ey-0.9,0.7,0,TAU);g.fill();g.beginPath();g.arc(ex-5.4,ey-0.5,0.5,0,TAU);g.fill();}
    /* брови */
    g.strokeStyle=noHelm?HAIR:PL_BEARD[lv-1];g.lineWidth=1.5;g.lineCap='round';
    g.beginPath();g.moveTo(ex-2.6,ey-4.4+(hurt?1:0));g.lineTo(ex+2.6,ey-(effort?3.4:4.8));g.moveTo(ex-7.2,ey-3.6);g.lineTo(ex-4.4,ey-(effort?3:4));g.stroke();
  }
  /* нос-картошка */
  plVol(g,hx+9.6,hy+3.2,2.6,2.3,'#e8a07a');g.fillStyle='rgba(255,255,255,.4)';g.beginPath();g.arc(hx+9.2,hy+2.4,0.8,0,TAU);g.fill();
  /* усы */
  const bc=noHelm?HAIR:PL_BEARD[lv-1];
  g.fillStyle=bc;g.beginPath();g.moveTo(hx+3.4,hy+5.4);g.quadraticCurveTo(hx+6,hy+3.6,hx+8.6,hy+4.6);g.quadraticCurveTo(hx+11.6,hy+4.2,hx+12.4,hy+6.6);g.quadraticCurveTo(hx+10.4,hy+6,hx+8.8,hy+7.2);g.quadraticCurveTo(hx+6,hy+8.4,hx+3.4,hy+5.4);g.fill();
  g.fillStyle='rgba(255,255,255,.18)';g.fillRect(hx+5,hy+4.6,3,0.8);
  /* рот */
  if(hurt){g.fillStyle='#5a1a14';g.beginPath();g.ellipse(hx+8,hy+8.6,1.6,1.2,0,0,TAU);g.fill();}
  else if(effort){g.fillStyle='#fff';g.fillRect(hx+6,hy+7.6,4,1.4);g.strokeStyle='#5a2a1a';g.lineWidth=0.6;g.strokeRect(hx+6,hy+7.6,4,1.4);}
  else{g.strokeStyle='#8a4a30';g.lineWidth=0.9;g.beginPath();g.moveTo(hx+6.4,hy+8.2);g.quadraticCurveTo(hx+8,hy+9.2,hx+9.4,hy+8);g.stroke();}
  /* румянец */
  g.fillStyle='rgba(230,90,80,.25)';g.beginPath();g.ellipse(hx+4.4,hy+4,2,1.2,0,0,TAU);g.fill();
  /* ---- шлемы ---- */
  const lamp=(lx,ly,col)=>{plVol(g,lx,ly,2.8,2.8,'#3a3a40');plBlob(g,lx+0.6,ly,1.9,1.9,col||'#fff3c0');mobGlow(g,lx+1,ly,10+torch*1.5,col||'#ffe9a8',0.55);
    if(opts.lampBeam)olLight(g,(g)=>{const bl=46+torch*6;const gr=g.createLinearGradient(lx,ly,lx+bl,ly);gr.addColorStop(0,'rgba(255,240,190,.28)');gr.addColorStop(1,'rgba(255,240,190,0)');g.fillStyle=gr;g.beginPath();g.moveTo(lx+1,ly-1.6);g.lineTo(lx+bl,ly-12-torch);g.lineTo(lx+bl,ly+12+torch);g.lineTo(lx+1,ly+1.6);g.closePath();g.fill();});};
  if(noHelm){   /* шлем скрыт настройкой: волосы и налобный фонарь на ремешке */
    g.fillStyle=HAIR;g.beginPath();g.moveTo(hx-10.6,hy+3);g.quadraticCurveTo(hx-12.4,hy-12,hx-1,hy-11.8);g.quadraticCurveTo(hx+9.4,hy-12.2,hx+10.4,hy-3.6);
    g.quadraticCurveTo(hx+7,hy-7.6,hx+3,hy-6.2);g.quadraticCurveTo(hx+0.5,hy-8.4,hx-2.6,hy-5.6);g.quadraticCurveTo(hx-5.6,hy-3.4,hx-7.6,hy+3);g.closePath();g.fill();
    g.strokeStyle='rgba(255,220,180,.22)';g.lineWidth=1;g.beginPath();g.moveTo(hx-7,hy-8);g.quadraticCurveTo(hx-2,hy-11,hx+4,hy-9.6);g.stroke();
    g.strokeStyle='rgba(30,14,6,.45)';g.lineWidth=0.7;for(let k=0;k<3;k++){g.beginPath();g.moveTo(hx-8+k*3,hy-4+k*0.5);g.quadraticCurveTo(hx-6+k*3,hy-9,hx-2+k*3,hy-10.4);g.stroke();}
    g.fillStyle='#2a2a30';g.beginPath();g.moveTo(hx-10.8,hy-3.2);g.quadraticCurveTo(hx,hy-7.6,hx+10.6,hy-5.4);g.lineTo(hx+10.6,hy-3.8);g.quadraticCurveTo(hx,hy-6,hx-10.8,hy-1.6);g.closePath();g.fill();
    lamp(hx+9.6,hy-4.8);
    return;
  }
  if(lv===1){
    g.fillStyle='#f0b030';g.beginPath();g.moveTo(hx-11.4,hy-2);g.quadraticCurveTo(hx-11,hy-13.6,hx,hy-13.4);g.quadraticCurveTo(hx+11,hy-13.6,hx+11.4,hy-2);g.closePath();g.fill();
    g.fillStyle='#d08a18';g.beginPath();g.ellipse(hx+1,hy-2.2,13.6,2.4,0,0,TAU);g.fill();
    g.fillStyle='#ffd870';g.beginPath();g.ellipse(hx-4,hy-9,3.6,2,-0.5,0,TAU);g.fill();
    g.fillStyle='#c07810';g.fillRect(hx-1,hy-13.2,2,10.6);lamp(hx+8.4,hy-8);
  }else if(lv===2){
    g.fillStyle='#8a5a30';g.beginPath();g.moveTo(hx-11,hy-1.6);g.quadraticCurveTo(hx-10.6,hy-13,hx,hy-13);g.quadraticCurveTo(hx+10.6,hy-13,hx+11,hy-1.6);g.closePath();g.fill();
    g.fillStyle='#6a4020';g.beginPath();g.ellipse(hx+1.4,hy-2,13.4,2.2,0,0,TAU);g.fill();
    g.strokeStyle='#4a2a10';g.lineWidth=0.7;g.setLineDash([1.2,1]);g.beginPath();g.arc(hx,hy-2,9.6,Math.PI*1.08,Math.PI*1.92);g.stroke();g.setLineDash([]);
    /* очки на каске */
    g.fillStyle='#3a3a40';g.fillRect(hx-6,hy-8.6,12,2.4);plBlob(g,hx-2,hy-7.4,2.6,2.6,'#5a8ab0');plBlob(g,hx+4,hy-7.4,2.6,2.6,'#5a8ab0');
    g.fillStyle='rgba(255,255,255,.6)';g.fillRect(hx-3,hy-8.6,1.2,1);g.fillRect(hx+3,hy-8.6,1.2,1);lamp(hx+9,hy-6);
  }else if(lv===3){
    g.fillStyle='#8a929c';g.beginPath();g.moveTo(hx-11.4,hy+3);g.lineTo(hx-11.6,hy-4);g.quadraticCurveTo(hx-10.4,hy-14,hx,hy-14);g.quadraticCurveTo(hx+10,hy-14,hx+11,hy-4);g.lineTo(hx+11,hy-2);g.closePath();g.fill();
    g.fillStyle='#6a727c';g.fillRect(hx-11.6,hy-4.4,23,2.4);g.fillStyle='rgba(255,255,255,.3)';g.beginPath();g.ellipse(hx-4,hy-10,3,1.6,-0.5,0,TAU);g.fill();
    g.strokeStyle='rgba(50,56,66,.7)';g.lineWidth=0.7;for(let k=0;k<3;k++){g.beginPath();g.moveTo(hx-11,hy-1+k*2);g.lineTo(hx-6,hy-1+k*2);g.stroke();}
    lamp(hx+9.4,hy-8);
  }else if(lv===4){
    g.fillStyle='#c4ccd8';g.beginPath();g.moveTo(hx-11.4,hy+8);g.lineTo(hx-11.6,hy-4);g.quadraticCurveTo(hx-11,hy-14.6,hx,hy-14.6);g.quadraticCurveTo(hx+11.6,hy-14.6,hx+12,hy-3);g.lineTo(hx+12.6,hy+2);g.lineTo(hx+7,hy+4);g.lineTo(hx+6,hy+8);g.closePath();g.fill();
    g.fillStyle='#8a94a4';g.fillRect(hx+2,hy-3,10.6,3.4);g.fillStyle='#1a2233';g.fillRect(hx+3.4,hy-2,8.6,1.4);
    g.fillStyle='rgba(255,255,255,.45)';g.fillRect(hx-5,hy-12,2,12);
    g.fillStyle='#e8eef6';for(const [rx,ry] of [[hx-8,hy+4],[hx-8,hy-6]]){g.beginPath();g.arc(rx,ry,0.9,0,TAU);g.fill();}
    g.fillStyle='#d03a3a';g.beginPath();g.moveTo(hx-2,hy-14);g.quadraticCurveTo(hx-10,hy-22+Math.sin(t*5)*1.5,hx-17,hy-10+Math.sin(t*4)*1.5);g.quadraticCurveTo(hx-10,hy-13,hx-4,hy-12);g.closePath();g.fill();
  }else if(lv===5){
    g.fillStyle='#79dcf5';g.beginPath();g.moveTo(hx-11.4,hy+7);g.lineTo(hx-11.6,hy-4);g.quadraticCurveTo(hx-11,hy-14.6,hx,hy-14.6);g.quadraticCurveTo(hx+11.6,hy-14.6,hx+12,hy-3);g.lineTo(hx+12.4,hy+3);g.lineTo(hx+6,hy+7);g.closePath();g.fill();
    g.fillStyle='#e8fbff';g.fillRect(hx+2,hy-3,10.6,3);g.fillStyle='#0a2a3a';g.fillRect(hx+3.4,hy-2.2,8.6,1.4);mobGlow(g,hx+8,hy-1.5,7,'#8ff0ff',0.6);
    g.fillStyle='#bff6ff';for(const [x1,y1,x2,y2,x3,y3] of [[-8,-6,-20,-14,-9,-1],[-2,-13,-6,-25,2,-14],[5,-12,10,-23,9,-11]]){g.beginPath();g.moveTo(hx+x1,hy+y1);g.lineTo(hx+x2,hy+y2);g.lineTo(hx+x3,hy+y3);g.closePath();g.fill();}
  }else{
    const A2=ARMOR_LOOK[lv],gl=A2.glow||'190,130,255';
    if(lv===9){/* шлем-череп */
      plVol(g,hx+1,hy-2,12,11.4,'#efe6d0');g.fillStyle='#d8ccb0';g.fillRect(hx-4,hy+6,12,4);
      g.fillStyle='#0a1020';g.beginPath();g.ellipse(hx+6.4,hy-1,2.6,3,0,0,TAU);g.ellipse(hx+0.4,hy-1,2.2,2.8,0,0,TAU);g.fill();g.fillRect(hx+7.6,hy+3,2,2.4);
      for(let k=0;k<4;k++){g.fillStyle='#0a1020';g.fillRect(hx-2+k*2.8,hy+6.4,0.8,3);}
      mobGlow(g,hx+5,hy-1,10,'#5ab8ff',0.8);g.fillStyle='#bfe8ff';g.beginPath();g.arc(hx+6.6,hy-1,1,0,TAU);g.arc(hx+0.6,hy-1,0.8,0,TAU);g.fill();
      g.fillStyle='#e8dcc0';for(const sd of [-1,1]){g.beginPath();g.moveTo(hx+sd*7,hy-8);g.quadraticCurveTo(hx+sd*17,hy-14,hx+sd*14,hy-26);g.quadraticCurveTo(hx+sd*12,hy-16,hx+sd*3,hy-11);g.closePath();g.fill();}
      return;}
    g.fillStyle=A2.body;g.beginPath();g.moveTo(hx-11.6,hy+8);g.lineTo(hx-11.8,hy-4);g.quadraticCurveTo(hx-11.2,hy-15,hx,hy-15);g.quadraticCurveTo(hx+11.8,hy-15,hx+12.4,hy-3);g.lineTo(hx+13,hy+3);g.lineTo(hx+7,hy+6);g.lineTo(hx+6,hy+9);g.closePath();g.fill();
    g.fillStyle='rgba(255,255,255,.14)';g.beginPath();g.ellipse(hx-4,hy-9,3,4,-0.4,0,TAU);g.fill();
    g.fillStyle=A2.trim;
    if(lv===6){for(const sd of [-1,1]){g.beginPath();g.moveTo(hx+sd*7,hy-9);g.lineTo(hx+sd*13,hy-23);g.lineTo(hx+sd*2,hy-12);g.closePath();g.fill();}}
    else if(lv===7){for(const sd of [-1,1]){g.beginPath();g.moveTo(hx+sd*8,hy-8);g.lineTo(hx+sd*10,hy-19);g.lineTo(hx+sd*5,hy-19);g.lineTo(hx+sd*4,hy-11);g.closePath();g.fill();}
      mobGlow(g,hx-7.5,hy-19,6,'#ff7a2a',0.6);mobGlow(g,hx+7.5,hy-19,6,'#ff7a2a',0.6);
      g.strokeStyle='rgba(255,140,60,.9)';g.lineWidth=0.9;g.beginPath();g.moveTo(hx-6,hy-10);g.lineTo(hx-3,hy-5);g.lineTo(hx-5,hy);g.stroke();}
    else if(lv===8){g.fillStyle='#4a0a12';for(let k=0;k<5;k++){g.beginPath();g.moveTo(hx-8+k*4,hy-12);g.lineTo(hx-6+k*4,hy-20-(k%2)*3);g.lineTo(hx-4+k*4,hy-12.4);g.fill();}
      g.fillStyle='#e8dcc0';for(let k=0;k<4;k++){g.beginPath();g.moveTo(hx+3+k*2.2,hy+3);g.lineTo(hx+4.1+k*2.2,hy+6.8);g.lineTo(hx+5.2+k*2.2,hy+3);g.closePath();g.fill();}}
    else{olLight(g,(g)=>{for(let k=0;k<5;k++){const fx=hx-7+k*3.6,fh=6+Math.sin(t*12+k*1.7)*2.4;g.fillStyle=k%2?'rgba(255,220,120,.9)':'rgba(255,90,20,.9)';g.beginPath();g.moveTo(fx-2,hy-13);g.quadraticCurveTo(fx,hy-13-fh*1.9,fx+2,hy-13);g.fill();}});}
    /* смотровая щель */
    g.fillStyle='#08040a';g.fillRect(hx+2,hy-2.6,10.4,3.2);
    olLight(g,(g)=>{g.fillStyle='rgba('+gl+','+(0.8+0.2*Math.sin(t*4))+')';g.fillRect(hx+3,hy-1.8,8.6,1.6);});
    mobGlow(g,hx+7,hy-1,9,'rgb('+gl+')'.replace(/rgb\((\d+),(\d+),(\d+)\)/,(m0,r,gg,b)=>'#'+((1<<24)|(r<<16)|(gg<<8)|(+b)).toString(16).slice(1)),0.5);
  }
}
/* кисть: кулак с большим пальцем, повёрнутый по направлению предплечья */
function plHand(g,x,y,a,c,lv,front){
  g.save();g.translate(x,y);g.rotate(-a);
  plVol(g,0,0.6,2.5,2.9,c);
  g.fillStyle=shadeHex(c,-0.3);g.fillRect(-2.1,1.2,4.2,0.8);g.fillRect(-2.1,2.4,4.2,0.6);
  if(front){g.fillStyle=shadeHex(c,0.12);g.beginPath();g.ellipse(1.9,-0.4,1.1,1.6,0.3,0,TAU);g.fill();}
  if(lv>=4){g.fillStyle=lv>=6?ARMOR_LOOK[lv].trim:'#e8eef6';g.fillRect(-2.2,-1.6,4.4,1.1);}
  g.restore();
}
/* рука: плечо → локоть → кисть, с рукавом/наручем и манжетой */
function plArm(g,x,y,a1,k,sleeve,hand,lv,front){
  const l1=6.2,l2=5.6,x1=x+Math.sin(a1)*l1,y1=y+Math.cos(a1)*l1,a2=a1-k,x2=x1+Math.sin(a2)*l2,y2=y1+Math.cos(a2)*l2;
  g.lineCap='round';g.lineJoin='round';
  /* тёмная кромка, чтобы рука читалась поверх туловища того же цвета */
  g.strokeStyle='rgba(20,10,6,.55)';g.lineWidth=6;g.beginPath();g.moveTo(x,y);g.lineTo(x1,y1);g.lineTo(x2,y2);g.stroke();
  g.strokeStyle=sleeve;g.lineWidth=4.6;g.beginPath();g.moveTo(x,y);g.lineTo(x1,y1);g.stroke();
  g.strokeStyle=shadeHex(sleeve,-0.08);g.lineWidth=3.9;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2-Math.sin(a2)*1.2,y2-Math.cos(a2)*1.2);g.stroke();
  if(front){g.strokeStyle='rgba(255,255,255,.2)';g.lineWidth=1.1;g.beginPath();g.moveTo(x-1,y);g.lineTo(x1-1,y1);g.lineTo(x2-1,y2);g.stroke();}
  /* манжета */
  const cx=x2-Math.sin(a2)*1.6,cy=y2-Math.cos(a2)*1.6;g.save();g.translate(cx,cy);g.rotate(-a2);g.fillStyle=lv>=4?(lv>=6?ARMOR_LOOK[lv].trim:'#c4ccd8'):shadeHex(sleeve,-0.3);g.fillRect(-2.4,-1,4.8,2);g.restore();
  plHand(g,x2,y2,a2,hand,lv,front);
  return [x1,y1,x2,y2,a2];
}
function playerGroundY(){
  const tx=Math.floor(player.x/TILE),ty0=Math.floor((player.y-2)/TILE);
  for(let ty=ty0;ty<ty0+8;ty++){if(ty<0)continue;if(isSolid(tx,ty)||(placedLadders&&placedLadders.has(tx+','+ty)&&ty>ty0))return Math.max(player.y,ty*TILE);}
  return player.y+999;
}
function drawPlayerSprite(g,x,y,st,anim,facing,opts){
  opts=opts||{};
  if(!opts._ol){
    /* тень лежит на земле под персонажем: в прыжке остаётся внизу, уменьшается и бледнеет
       (рисуется до контура, чтобы её не обрезало окно обводки) */
    if(!opts.swim&&!opts.hang&&!opts.climb){const dh=opts.groundY!==undefined?Math.max(0,opts.groundY-y):0;
      if(dh<220){const k=1-dh/220,rx=(st==='run'?13:12)*(0.45+0.55*k);
        g.fillStyle='rgba(0,0,0,'+(0.34*k*k+0.05)+')';g.beginPath();g.ellipse(x,y+dh,rx,3.8*(0.6+0.4*k),0,0,TAU);g.fill();}}
    const o2=Object.assign({},opts,{_ol:1});
    withOutline(g,x,y-28,48,42,'rgba(20,12,8,.92)',-1.25,(gg)=>drawPlayerSprite(gg,x,y,st,anim,facing,o2));return;}
  const lvA=clamp(Math.floor(opts.armor||1),1,10),lvP=clamp(Math.floor(opts.pickLvl||1),1,10);
  const A=ARMOR_LOOK[lvA];
  const t=anim;
  g.save();
  g.translate(x,y);
  const swim=!!opts.swim,hang=!!opts.hang,climb=!!opts.climb;
  g.scale(facing,1);
  if(opts.sq>0)g.scale(1+opts.sq*0.16,1-opts.sq*0.16);
  const run=st==='run'&&!swim&&!climb;
  const vy=opts.vy||0,air=st==='jump'&&!swim&&!hang&&!climb,rising=air&&vy<0;
  if(air){const v=clamp(vy/600,-1,1);g.scale(1-Math.abs(v)*0.05,1+Math.abs(v)*0.06);}
  const rs=Math.sin(t*12),rc=Math.cos(t*12);
  const breath=Math.sin(t*2.4);
  const bob=run?-Math.abs(rs)*2.4+1.2:(hang?Math.sin(t*2.5)*0.8:(st==='idle'&&!climb&&!swim)?breath*0.7:0);
  const dig=!!opts.digging&&!hang&&!climb&&!swim,swing=opts.swing||0;
  const tool=opts.tool||'pick',gunOn=!!(opts.gun&&opts.gunAnim>0)&&!hang&&!climb;
  /* ---- позы ног ---- */
  let la=0.08,lb=-0.08,ka=0,kb=0;
  if(swim){const s2=Math.sin(t*8);la=0.9+s2*0.5;lb=0.9-s2*0.5;ka=0.4;kb=0.4;}
  else if(climb){const s2=Math.sin(t*8);la=0.15+Math.max(0,s2)*0.9;lb=0.15+Math.max(0,-s2)*0.9;ka=-0.2-Math.max(0,s2)*1.4;kb=-0.2-Math.max(0,-s2)*1.4;}
  else if(hang){const sw2=Math.sin(t*2);la=0.25+sw2*0.15;lb=-0.1+sw2*0.15;ka=-0.35;kb=-0.2;}
  else if(air){if(rising){la=1.05;lb=-0.35;ka=-1.5;kb=-0.6;}else{const f=Math.sin(t*14)*0.12;la=0.45+f;lb=-0.45-f;ka=-0.5;kb=-0.3;}}
  else if(run){la=rs*1.0;lb=-rs*1.0;ka=-(Math.max(0,-rs)*1.3+0.15);kb=-(Math.max(0,rs)*1.3+0.15);}
  else if(dig){la=0.25;lb=-0.3;ka=-0.25;kb=-0.1;}
  /* ---- позы рук (0 — вниз, π/2 — вперёд, π — вверх) ---- */
  let aF=0.38+breath*0.04,kF=-1.0,aB=0.1+breath*0.03,kB=-0.35,toolRot=0.32,showTool=true,lean=0;
  if(swim){const s2=Math.sin(t*6);aF=1.7+s2*1.1;kF=-0.3;aB=1.7-s2*1.1;kB=-0.3;showTool=false;}
  else if(climb){const s2=Math.sin(t*8);aF=2.75+s2*0.32;kF=0.35;aB=2.75-s2*0.32;kB=0.35;showTool=false;}
  else if(hang){aF=3.0+Math.sin(t*2)*0.05;kF=0.05;aB=2.85;kB=0.15;showTool=false;}
  else if(dig){/* замах из-за головы и удар с наклоном корпуса */
    const sw2=swing<0.35?swing/0.35:1-(swing-0.35)/0.65*0.15;const hit=clamp((swing-0.35)/0.65,0,1);
    aF=swing<0.35?2.0+sw2*1.0:3.0-hit*2.0;kF=swing<0.35?0.4:0.4-hit*0.75;toolRot=swing<0.35?-0.2-sw2*1.3:-1.5+hit*3.0;
    aB=aF-0.3;kB=kF;lean=swing<0.35?-0.06*sw2:0.12*hit;}
  else if(air){if(rising){aF=2.35;kF=-0.5;aB=2.6;kB=-0.2;toolRot=-0.4;}else{const fl=Math.sin(t*18)*0.18;aF=2.0+fl;kF=-0.3;aB=2.5-fl;kB=0.3;toolRot=0.1;}}
  else if(run){aF=0.45+rs*0.7;kF=-1.15;aB=0.15-rs*0.85;kB=-1.1;toolRot=0.6+rs*0.25;lean=0.1;}
  if(tool==='sword'&&!hang&&!climb&&!swim){aF=2.7-swing*2.2;kF=0.2-swing*0.5;lean=swing>0.3?0.1:-0.04;}
  if(gunOn){aF=1.57;kF=0.05;aB=1.45;kB=0.2;lean=-0.03;}
  if(swim){g.translate(0,-18);g.rotate(0.95);g.translate(0,18);}
  else if(lean){g.translate(0,-12);g.rotate(lean);g.translate(0,12);}
  /* ---- плащ / шарф ---- */
  if(!swim){
    const sp=run?11:air?8:3,wv=Math.sin(t*(run?11:6));
    if(lvA>=6){const cc=lvA===6?'#2a1a4a':lvA===7?'#3a2a22':lvA===8?'#6a0a18':lvA===9?'#2a4a6a':'#5a1606';
      g.fillStyle=cc;g.beginPath();g.moveTo(-6,-36+bob);g.quadraticCurveTo(-14-sp*0.4,-26+wv*2,-15-sp*0.9,-10+wv*3+(rising?6:0));
      for(let k=0;k<4;k++)g.lineTo(-15-sp*0.9+k*3.4,(k%2?-6:-9)+wv*(3-k*0.6)+(rising?6:0));g.lineTo(-4,-16);g.closePath();g.fill();
      g.fillStyle=shadeHex(cc,0.25);g.beginPath();g.moveTo(-6,-36+bob);g.quadraticCurveTo(-10,-30,-11-sp*0.4,-22+wv*2);g.lineTo(-7,-24);g.closePath();g.fill();}
    else{const up=rising?-6:air?4:0;
      g.strokeStyle='#d03a3a';g.lineWidth=4;g.lineCap='round';g.beginPath();g.moveTo(-6,-35+bob);
      g.quadraticCurveTo(-13,-34+bob+wv*sp*0.3+up*0.5,-19-sp*0.7,-31+bob+Math.sin(t*9+1)*sp*0.45+up);g.stroke();
      g.strokeStyle='#a02828';g.lineWidth=2.4;g.beginPath();g.moveTo(-6,-34+bob);g.quadraticCurveTo(-12,-32+bob,-17-sp*0.6,-27+bob+Math.sin(t*9+2)*sp*0.35+up);g.stroke();}
  }
  /* ---- рюкзак (кирка за спиной, когда руки заняты) ---- */
  if(!swim){const bc=lvA>=6?shadeHex(A.body,-0.4):'#7a5230';
    if(!showTool){g.save();g.translate(-13,-28+bob);g.rotate(-0.5);g.scale(0.8,0.8);drawPickModel(g,lvP,t);g.restore();}
    g.fillStyle=bc;g.beginPath();g.moveTo(-15.4,-33+bob);g.quadraticCurveTo(-16.6,-24,-14.6,-17);g.lineTo(-8,-17);g.lineTo(-8.4,-35+bob);g.closePath();g.fill();
    g.fillStyle=shadeHex(bc,0.25);g.fillRect(-15.6,-30+bob,7,2);g.fillStyle=shadeHex(bc,-0.3);g.fillRect(-15,-22,6,4);
    g.fillStyle='#caa24a';g.fillRect(-12.6,-29.6+bob,1.6,1.4);
    g.strokeStyle='#b89a6a';g.lineWidth=1.4;g.beginPath();g.ellipse(-15.4,-19,2.6,1.8,0,0,TAU);g.stroke();}
  const armC=lvA<=1?'#c86a3a':lvA===2?'#9a5a3a':lvA===3?'#8a929c':A.arm;
  const handC=lvA<=1?'#e8b98a':lvA===2?'#7a4a26':lvA===3?'#6a727c':lvA===4?'#b4bcc8':shadeHex(A.arm,-0.15);
  const legC=lvA===1?'#3a6aa8':A.leg,bootC=lvA<=3?'#5a3a22':A.boot;
  /* ---- задняя рука и нога ---- */
  plArm(g,-4,-31+bob,aB,kB,shadeHex(armC,-0.3),shadeHex(handC,-0.25),lvA,false);
  {const L=plSeg(g,-3,-15,lb,7.4,-kb,7,5.6,4.8,shadeHex(legC,-0.3),null);plBoot(g,L[2],L[3]+1,lb-kb,shadeHex(bootC,-0.25),lvA);}
  /* ---- торс с дыханием ---- */
  g.save();if(!run&&!air){g.translate(0,-16);g.scale(1,1+breath*0.012);g.translate(0,16);}
  drawArmorBody(g,lvA,bob,t);g.restore();
  /* ---- передняя нога ---- */
  {const L=plSeg(g,3,-15,la,7.4,-ka,7,5.8,5,legC,'rgba(255,255,255,.18)');plBoot(g,L[2],L[3]+1,la-ka,bootC,lvA);
    if(lvA>=4){g.fillStyle=lvA===4?'#c4ccd8':A.trim;g.beginPath();g.ellipse(L[0],L[1],2.8,2.2,0,0,TAU);g.fill();}}
  /* ---- голова: чуть наклоняется по движению ---- */
  const face=opts.hurt>0?'hurt':(dig&&swing>0.4)||(opts.gunAnim>0.5)?'effort':'';
  {const ht=run?0.06+rs*0.02:air?(rising?-0.08:0.06):dig?(swing<0.35?-0.06:0.08):0;
    g.save();g.translate(1,-34+bob);g.rotate(ht);g.translate(-1,34-bob);
    drawPlayerHead(g,lvA,bob,t,opts.torch||0,face,{lampBeam:!!opts.lamp,noHelm:!!settings.hideHelmet});g.restore();}
  /* ---- передняя рука + инструмент ---- */
  const shX=4.5,shY=-31+bob;
  if(gunOn){
    const arm=plArm(g,shX,shY,aF,kF,armC,handC,lvA,true);
    g.save();g.translate(arm[2]-1,arm[3]-0.6);drawGunModel(g,opts.gun,clamp(opts.gunAnim,0,1));g.restore();
    plHand(g,arm[2],arm[3],arm[4],handC,lvA,true);
  }else if(tool==='sword'&&!hang&&!climb&&!swim){
    const arm=plArm(g,shX,shY,aF,kF,armC,handC,lvA,true);
    if(swing>0.3&&swing<0.9){olLight(g,(g)=>{g.strokeStyle='rgba(255,255,255,'+(0.35*Math.sin((swing-0.3)/0.6*Math.PI))+')';g.lineWidth=6;g.lineCap='round';g.beginPath();g.arc(shX,shY,22,-Math.PI*0.9,-Math.PI*0.9+swing*2.4);g.stroke();});}
    g.save();g.translate(arm[2],arm[3]);g.rotate(Math.PI-arm[4]+Math.PI/2-0.25);
    {const sl=opts.sword||2,SC=['#e8eef7','#e8eef7','#e8eef7','#e8eef7','#9ff0ff','#b48aff','#c8b8a8','#e0303a','#f0e8d0','#ffb030'][sl-1]||'#e8eef7';
    const L=22+Math.min(8,Math.max(0,sl-4)*1.4);
    g.rotate(-Math.PI/2);
    g.fillStyle='#5a3a1a';g.fillRect(-1.6,-1,3.2,7);g.fillStyle='#caa24a';g.beginPath();g.arc(0,6.6,1.8,0,TAU);g.fill();
    g.fillStyle=sl>=6?ARMOR_LOOK[Math.min(10,sl)].trim||'#ffd98a':'#ffd98a';g.beginPath();g.moveTo(-6,-1.6);g.quadraticCurveTo(0,-4,6,-1.6);g.lineTo(6,0.6);g.lineTo(-6,0.6);g.closePath();g.fill();
    const bg=g.createLinearGradient(-2,0,2,0);bg.addColorStop(0,shadeHex(SC,0.3));bg.addColorStop(0.5,SC);bg.addColorStop(0.55,shadeHex(SC,-0.2));bg.addColorStop(1,shadeHex(SC,-0.35));
    g.fillStyle=bg;g.beginPath();g.moveTo(-2.2,-2);g.lineTo(2.2,-2);g.lineTo(1.6,-L);g.lineTo(0,-L-4.4);g.lineTo(-1.6,-L);g.closePath();g.fill();
    g.fillStyle='rgba(255,255,255,.55)';g.fillRect(-0.5,-L,1,L-3);
    if(sl>=5){olLight(g,(g)=>{g.strokeStyle=hexA(SC,0.35);g.lineWidth=6;g.beginPath();g.moveTo(0,-3);g.lineTo(0,-L-2);g.stroke();});}}
    g.restore();
    plHand(g,arm[2],arm[3],arm[4],handC,lvA,true);
  }else{
    const arm=plArm(g,shX,shY,aF,kF,armC,handC,lvA,true);
    if(showTool&&tool==='pick'){
      const hx2=arm[2],hy2=arm[3],rot=toolRot;
      if(lvP>=4&&dig&&swing>0.45){const gc=['','','','','#b890ff','#8ff0ff','#8a5aff','#ff7a2a','#ff3a4a','#7ad8ff','#ffb030'][lvP];
        olLight(g,(g)=>{g.translate(hx2,hy2);g.strokeStyle=hexA(gc,0.4);g.lineWidth=5;g.lineCap='round';g.beginPath();g.arc(0,0,15*(1+(lvP-1)*0.06),-Math.PI/2+rot-1.0,-Math.PI/2+rot,false);g.stroke();});}
      g.save();g.translate(hx2,hy2);g.rotate(rot);g.translate(0,-7);drawPickModel(g,lvP,t);g.restore();
      plHand(g,hx2,hy2,arm[4],handC,lvA,true);
    }
  }
  /* наплечник поверх руки (компактный) */
  if(lvA>=4){g.save();g.translate(shX,shY+0.4);g.scale(0.78,0.78);g.translate(-shX,-shY-0.4);plPauldron(g,shX,shY+0.4,lvA,A,t);g.restore();}
  else{/* плечо рукава: небольшой шов вместо круглой накладки */g.fillStyle=shadeHex(armC,0.15);g.beginPath();g.ellipse(shX,shY+0.6,2.8,2.2,0,0,TAU);g.fill();}
  if(opts.hurt>0&&OL.active&&g===OL.g)OL.tint='rgba(255,60,60,'+(opts.hurt*0.5)+')';
  g.restore();
}

/* ---------- обводка моделей (стиль «мультяшный контур»): модель рисуется в черновик,
   затем под неё кладётся тёмный силуэт со смещениями; свечения откладываются и
   накладываются поверх, чтобы не получить грязную обводку вокруг ореолов ---------- */
const OL={cv:null,g:null,scv:null,sg:null,active:false,defer:[],w:0,h:0,tint:null};
function olReady(){
  if(OL.cv)return true;
  try{OL.cv=document.createElement('canvas');OL.cv.width=OL.cv.height=256;OL.g=OL.cv.getContext('2d');
    OL.scv=document.createElement('canvas');OL.scv.width=OL.scv.height=256;OL.sg=OL.scv.getContext('2d');return !!(OL.g&&OL.g.getTransform);}catch(e){return false;}
}
function olLight(g,fn){
  if(OL.active&&g===OL.g){OL.defer.push({m:g.getTransform(),fn:fn,a:g.globalAlpha});return;}
  g.save();g.globalCompositeOperation='lighter';fn(g);g.restore();
}
const OL_OFF8=[[1,0],[-1,0],[0,1],[0,-1],[0.72,0.72],[-0.72,0.72],[0.72,-0.72],[-0.72,-0.72]],OL_OFF4=[[1,0.35],[-1,0.35],[0.35,1],[-0.35,-1]];
function withOutline(g,cx,cy,rx,ry,col,th,fn){
  const SH=OL.active?null:OL.shade;if(!OL.active)OL.shade=null;
  if(settings.quality==='low'||settings.outline===false||OL.active||!g.getTransform||!olReady()){fn(g);return;}
  /* бюджет на кадр: много мобов на экране — упрощённый контур, потом без контура */
  if(OL.ft!==G.time){OL.ft=G.time;OL.cnt=0;}OL.cnt++;
  if(OL.cnt>(OL.maxN||16)){fn(g);return;}
  const M=g.getTransform();
  if(th<0)th=clamp(-th*Math.hypot(M.a,M.b),1.1,3.6);
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for(const [px,py] of [[cx-rx,cy-ry],[cx+rx,cy-ry],[cx-rx,cy+ry],[cx+rx,cy+ry]]){const X=M.a*px+M.c*py+M.e,Y=M.b*px+M.d*py+M.f;if(X<x0)x0=X;if(X>x1)x1=X;if(Y<y0)y0=Y;if(Y>y1)y1=Y;}
  const cw=g.canvas.width,ch=g.canvas.height,pad=Math.ceil(th)+2;
  x0=Math.floor(Math.max(-pad,x0-pad));y0=Math.floor(Math.max(-pad,y0-pad));x1=Math.ceil(Math.min(cw+pad,x1+pad));y1=Math.ceil(Math.min(ch+pad,y1+pad));
  const w=x1-x0,h=y1-y0;
  if(w<=2||h<=2)return;
  if(w*h>700*700){fn(g);return;}
  if(OL.cv.width<w||OL.cv.height<h){const nw=Math.max(OL.cv.width,w),nh=Math.max(OL.cv.height,h);OL.cv.width=OL.scv.width=nw;OL.cv.height=OL.scv.height=nh;}
  const sg=OL.g;sg.setTransform(1,0,0,1,0,0);sg.globalAlpha=1;sg.globalCompositeOperation='source-over';sg.clearRect(0,0,w,h);
  sg.setTransform(M.a,M.b,M.c,M.d,M.e-x0,M.f-y0);sg.imageSmoothingEnabled=true;
  OL.active=true;OL.defer.length=0;
  try{sg.save();fn(sg);sg.restore();}catch(e){OL.active=false;throw e;}
  OL.active=false;
  /* объём: мягкий свет сверху и затенение к земле -- только по пикселям модели */
  if(SH){const S=SH;
    sg.setTransform(M.a,M.b,M.c,M.d,M.e-x0,M.f-y0);sg.globalCompositeOperation='source-atop';
    const lg=sg.createLinearGradient(0,cy-S.h*0.62,0,cy+S.h*0.55);
    lg.addColorStop(0,'rgba(255,238,214,'+(S.top||0.16)+')');lg.addColorStop(0.32,'rgba(255,238,214,0)');
    lg.addColorStop(0.62,'rgba(12,8,6,0)');lg.addColorStop(1,'rgba(12,8,6,'+(S.bot||0.34)+')');
    sg.fillStyle=lg;sg.fillRect(cx-rx,cy-ry,rx*2,ry*2);
    sg.globalCompositeOperation='source-over';}
  if(OL.tint){sg.setTransform(1,0,0,1,0,0);sg.globalCompositeOperation='source-atop';sg.fillStyle=OL.tint;sg.fillRect(0,0,w,h);sg.globalCompositeOperation='source-over';OL.tint=null;}
  const s2=OL.sg;s2.setTransform(1,0,0,1,0,0);s2.globalCompositeOperation='source-over';s2.clearRect(0,0,w,h);
  s2.drawImage(OL.cv,0,0,w,h,0,0,w,h);s2.globalCompositeOperation='source-in';s2.fillStyle=col;s2.fillRect(0,0,w,h);s2.globalCompositeOperation='source-over';
  g.save();g.setTransform(1,0,0,1,0,0);
  const d=th,dd=th*0.72;
  const offs=OL.cnt>8?OL_OFF4:OL_OFF8;
  for(const [ox,oy] of offs)g.drawImage(OL.scv,0,0,w,h,x0+ox*d,y0+oy*d,w,h);
  g.drawImage(OL.cv,0,0,w,h,x0,y0,w,h);
  const ga=g.globalAlpha;
  for(const q of OL.defer){g.setTransform(q.m.a,q.m.b,q.m.c,q.m.d,q.m.e+x0,q.m.f+y0);g.globalAlpha=ga*q.a;g.globalCompositeOperation='lighter';try{q.fn(g);}catch(e){}g.globalCompositeOperation='source-over';}
  OL.defer.length=0;
  g.restore();
}
/* ---------- помощники для моделей мобов: объём, контур, глаза ---------- */
function mobG(g,x,y,r,c){
  if(settings.quality==='low')return c;
  const gr=g.createRadialGradient(x-r*0.38,y-r*0.5,r*0.05,x-r*0.1,y-r*0.15,r*1.25);
  gr.addColorStop(0,shadeHex(c,0.38));gr.addColorStop(0.18,shadeHex(c,0.12));gr.addColorStop(0.56,c);gr.addColorStop(0.6,shadeHex(c,-0.22));gr.addColorStop(1,shadeHex(c,-0.45));
  return gr;
}
function mobLine(c){return shadeHex(c,-0.6);}
const HK_KEEP=new Set(['skullturret','skeleton','bonegolem','skullbat','skelminion','riftcrystal','sulfurel','firebird','gasbag','bloodpod']);
/* бледная маска в духе «мрачной сказки»: светящиеся глаза в прорезях */
function hkMask(g,x,y,w,h,eye,o){
  o=o||{};const col=o.col||'#ece4d6';
  g.fillStyle=col;g.beginPath();g.moveTo(x-w*0.5,y-h*0.25);g.quadraticCurveTo(x-w*0.5,y-h*0.62,x,y-h*0.6);g.quadraticCurveTo(x+w*0.55,y-h*0.62,x+w*0.5,y-h*0.2);
  g.quadraticCurveTo(x+w*0.45,y+h*0.25,x+w*0.12,y+h*0.42);g.lineTo(x-w*0.06,y+h*0.42);g.quadraticCurveTo(x-w*0.48,y+h*0.25,x-w*0.5,y-h*0.25);g.closePath();g.fill();
  g.fillStyle='rgba(60,50,70,.28)';g.beginPath();g.moveTo(x-w*0.5,y-h*0.25);g.quadraticCurveTo(x-w*0.48,y+h*0.25,x-w*0.06,y+h*0.42);g.quadraticCurveTo(x-w*0.3,y,x-w*0.2,y-h*0.56);g.quadraticCurveTo(x-w*0.45,y-h*0.5,x-w*0.5,y-h*0.25);g.fill();
  if(o.horns){g.fillStyle=col;for(const sd of [-1,1]){g.beginPath();g.moveTo(x+sd*w*0.22,y-h*0.55);g.quadraticCurveTo(x+sd*w*0.7,y-h*1.1,x+sd*w*0.5,y-h*1.5);g.quadraticCurveTo(x+sd*w*0.42,y-h*1.05,x+sd*w*0.02,y-h*0.6);g.closePath();g.fill();}}
  for(const sd of [-1,1]){const ex=x+sd*w*0.2+w*0.06,ey=y-h*0.1;g.fillStyle='#07040a';g.beginPath();g.ellipse(ex,ey,w*0.13,h*0.2,sd*0.25,0,TAU);g.fill();
    if(eye){mobGlow(g,ex,ey,w*0.32,eye,0.75);g.fillStyle=o.pupil||'#ffffff';g.beginPath();g.arc(ex+w*0.02,ey,w*0.045,0,TAU);g.fill();}}
  if(o.crack){g.strokeStyle='rgba(30,20,30,.6)';g.lineWidth=0.7;g.beginPath();g.moveTo(x+w*0.1,y-h*0.6);g.lineTo(x+w*0.04,y-h*0.35);g.lineTo(x+w*0.14,y-h*0.25);g.stroke();}
}
function mixHex(a,b,k){const A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16);const f=(sh)=>Math.round(((A>>sh)&255)*(1-k)+((B>>sh)&255)*k);return '#'+((1<<24)|(f(16)<<16)|(f(8)<<8)|f(0)).toString(16).slice(1);}
function mobPath(g,c,cx,cy,r,noLine){
  g.fillStyle=mobG(g,cx,cy,r,c);g.fill();
  if(!noLine){g.strokeStyle=mobLine(c);g.lineWidth=1.2;g.lineJoin='round';g.stroke();}
}
function mobBlob(g,x,y,rx,ry,c,rot,noLine){g.beginPath();g.ellipse(x,y,rx,ry,rot||0,0,TAU);mobPath(g,c,x,y,Math.max(rx,ry),noLine);}
function mobShine(g,x,y,rx,ry,a){g.fillStyle='rgba(255,255,255,'+(a||0.35)+')';g.beginPath();g.ellipse(x,y,rx,ry,-0.4,0,TAU);g.fill();}

/* ---------- мягкие свечения и частицы: кэшированные спрайты вместо плоских кружков ---------- */
const _glowSpr=new Map();
function glowSprite(col){
  let c=_glowSpr.get(col);if(c)return c;
  c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');
  const gr=g.createRadialGradient(32,32,0,32,32,32);
  gr.addColorStop(0,hexA(col,1));gr.addColorStop(0.18,hexA(col,0.62));gr.addColorStop(0.42,hexA(col,0.24));gr.addColorStop(0.7,hexA(col,0.07));gr.addColorStop(1,hexA(col,0));
  g.fillStyle=gr;g.fillRect(0,0,64,64);
  if(_glowSpr.size>160)_glowSpr.clear();_glowSpr.set(col,c);return c;
}
function softGlow(g,x,y,r,col,a){if(a<=0.01||r<=0.5)return;const ga=g.globalAlpha;g.globalAlpha=ga*Math.min(1,a);g.drawImage(glowSprite(col),x-r,y-r,r*2,r*2);g.globalAlpha=ga;}
function drawGlowList(g,list,k){
  g.save();g.globalCompositeOperation='lighter';
  for(const q of list){const fl=0.92+0.08*Math.sin((G.time||0)*3+q[0]*0.05);softGlow(g,q[0],q[1],q[2]*1.15,q[3],(k||0.42)*fl);}
  g.restore();
}
const _pSpr=new Map();
function colRGB(c){
  if(c[0]==='#'){const n=parseInt(c.length===4?c.slice(1).split('').map(x=>x+x).join(''):c.slice(1,7),16);return [(n>>16)&255,(n>>8)&255,n&255];}
  const m=c.match(/[\d.]+/g);return m?[+m[0],+m[1],+m[2]]:[200,200,200];
}
function partInfo(col){
  let e=_pSpr.get(col);if(e)return e;
  const [r,gg,b]=colRGB(col),mx=Math.max(r,gg,b),mn=Math.min(r,gg,b);
  const hot=(r>200&&gg>70&&b<140)||(mx>200&&(mx-mn)>90&&(r+gg+b)>420);
  const c=document.createElement('canvas');c.width=c.height=24;const g=c.getContext('2d');
  const gr=g.createRadialGradient(12,12,0,12,12,12);
  if(hot){gr.addColorStop(0,'rgba(255,255,240,1)');gr.addColorStop(0.22,'rgba('+r+','+gg+','+b+',1)');gr.addColorStop(0.55,'rgba('+r+','+gg+','+b+',.35)');gr.addColorStop(1,'rgba('+r+','+gg+','+b+',0)');}
  else{gr.addColorStop(0,'rgba('+Math.min(255,r+30)+','+Math.min(255,gg+30)+','+Math.min(255,b+30)+',1)');gr.addColorStop(0.55,'rgba('+r+','+gg+','+b+',1)');gr.addColorStop(0.8,'rgba('+r+','+gg+','+b+',.6)');gr.addColorStop(1,'rgba('+r+','+gg+','+b+',0)');}
  g.fillStyle=gr;g.fillRect(0,0,24,24);
  e={c,hot};if(_pSpr.size>300)_pSpr.clear();_pSpr.set(col,e);return e;
}
function mobGlow(g,x,y,r,c,a){
  if(settings.quality==='low'||a<=0.01)return;
  if(OL.active&&g===OL.g){OL.defer.push({m:g.getTransform(),a:1,fn:(gg2)=>{softGlow(gg2,x,y,r,c,Math.min(1,a)*1.1);}});return;}
  g.save();g.globalCompositeOperation='lighter';softGlow(g,x,y,r,c,Math.min(1,a)*1.1);g.restore();
}
function mobEye(g,m,x,y,r,o){
  o=o||{};
  const bl=(Math.sin(m.anim*1.1+m.phase*7)>0.985)?0.12:1;
  const lx=(m.lookX||0)*m.facing,ly=(m.lookY||0);
  if(o.glow)mobGlow(g,x,y,r*2.6,o.glow,0.55);
  g.fillStyle=o.white||'#f6f4ee';g.beginPath();g.ellipse(x,y,r,r*bl,0,0,TAU);g.fill();
  if(bl>=0.5){
    const ix=x+lx*r*0.38,iy=y+ly*r*0.32;
    g.fillStyle=o.iris||'#1a2233';g.beginPath();g.arc(ix,iy,r*(o.ir||0.6),0,TAU);g.fill();
    if(o.pupil){g.fillStyle=o.pupil;g.beginPath();g.ellipse(ix,iy,r*0.16,r*0.5,0,0,TAU);g.fill();}
    g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.arc(ix-r*0.25,iy-r*0.28,r*0.22,0,TAU);g.fill();
  }
  if(o.brow){g.strokeStyle=o.brow;g.lineWidth=r*0.45;g.lineCap='round';g.beginPath();g.moveTo(x-r*1.0,y-r*1.25);g.lineTo(x+r*0.9,y-r*0.7);g.stroke();}
}
function mobLeg(g,x,y,a1,l1,k,l2,w,c){
  const x1=x+Math.sin(a1)*l1,y1=y+Math.cos(a1)*l1,a2=a1-k,x2=x1+Math.sin(a2)*l2,y2=y1+Math.cos(a2)*l2;
  g.strokeStyle=c;g.lineWidth=w;g.lineCap='round';g.lineJoin='round';
  g.beginPath();g.moveTo(x,y);g.lineTo(x1,y1);g.lineTo(x2,y2);g.stroke();
  return [x2,y2];
}
function drawMobSprite(g,m,t){
  const h0=m.hurt;try{drawMobSprite0(g,m,t);}finally{m.hurt=h0;}
}
const eOut=(x)=>1-Math.pow(1-clamp(x,0,1),3),eIn=(x)=>{x=clamp(x,0,1);return x*x;};
function deathXform(g,m,t){
  const T=m.deadT||0,f=m.facing||1,H=m.h,W=m.w;
  switch(m.dstyle){
    case 'fall':{const a=eOut(T/0.36),b=T>0.36?Math.sin(clamp((T-0.36)/0.22,0,1)*Math.PI)*0.09:0;
      const tw=(T>0.5&&T<0.9)?Math.sin(T*55)*0.025*(0.9-T)/0.4:0;
      g.translate(0,-W*0.42*a);g.rotate(-f*(a*Math.PI*0.5-b+tw));break;}
    case 'legsup':{const p=clamp(T/0.42,0,1),a=eOut(p),land=T>0.42?Math.sin(clamp((T-0.42)/0.16,0,1)*Math.PI)*0.12:0;g.translate(0,-Math.sin(p*Math.PI)*12);g.scale(1+land,1-land);
      g.translate(0,-H*0.5);g.rotate(f*a*Math.PI);g.translate(0,H*0.5);
      if(T>0.42&&T<1.0)g.scale(1+Math.sin(T*48)*0.035*(1-T)/0.58,1);break;}
    case 'splat':{const a=eOut(T/0.22);g.scale(1+0.75*a,1-0.88*a);break;}
    case 'melt':{const a=clamp((T-0.08)/1.05,0,1),e=a*a*(3-2*a);g.translate(Math.sin(T*15)*1.6*(1-e),H*0.98*e);g.scale(1+0.22*e+Math.sin(T*11)*0.03*(1-e),1-0.12*e);break;}
    case 'bones':{const sh=T<0.18?Math.sin(T*90)*1.6*(T/0.18):0,e=eIn((T-0.12)/0.18);g.translate(sh,0);g.scale(1+0.25*e,1-0.85*e);break;}
    case 'crumble':{const sh=T<0.32?Math.sin(T*85)*2.4*(T/0.32):0,e=eIn((T-0.3)/0.3);g.translate(sh,H*0.8*e);g.scale(1+0.12*e,1-0.2*e);break;}
    case 'shatter':{const e=clamp(T/0.12,0,1);g.translate(0,-H*0.5);g.scale(1+0.1*e,1+0.1*e);g.translate(0,H*0.5);break;}
    case 'pop':{const e=clamp(T/0.15,0,1);g.translate(0,-H*0.5);const s2=1+0.45*e*e+Math.sin(T*90)*0.05;g.scale(s2,s2*(1-0.1*e));g.translate(0,H*0.5);break;}
    case 'dissolve':{const e=eOut(T/0.95);g.translate(Math.sin(T*18)*2.5*e,-22*e);g.scale(1-0.4*e,1+0.5*e);break;}
    case 'burn':{const e=clamp(T/1.15,0,1);g.translate(Math.sin(T*40)*0.8*(1-e),0);g.scale(1+0.08*e,1-0.6*e*e);break;}
    case 'tumble':{const sp=m.landed?(m.landT||T):T;g.translate(0,-H*0.5);g.rotate(f*Math.min(sp,1.1)*Math.PI*1.7);g.translate(0,H*0.5);break;}
    case 'implode':{const e=eIn(T/0.55);g.translate(0,-H*0.5);g.rotate(e*Math.PI*1.4);const s2=Math.max(0.02,1-e*0.98);g.scale(s2*(1+Math.sin(T*40)*0.06*(1-e)),s2);g.translate(0,H*0.5);break;}
  }
}
function deathTint(m){
  const T=m.deadT||0,k=m.deathK||0;
  switch(m.dstyle){
    case 'burn':return 'rgba(28,10,4,'+Math.min(0.88,T*0.9)+')';
    case 'shatter':return hexA(shadeHex(m.def.c1,0.55),0.55*clamp(T/0.12,0,1));
    case 'dissolve':return 'rgba(200,228,255,'+(0.45*k)+')';
    case 'implode':return 'rgba(50,10,90,'+(0.7*k)+')';
    case 'pop':return hexA(shadeHex(m.def.c1,0.3),0.4*clamp(T/0.15,0,1));
    case 'melt':case 'splat':return 'rgba(60,8,12,'+(0.3*k)+')';
    default:return 'rgba(20,10,10,'+(0.35*k)+')';
  }
}
function drawMobSprite0(g,m,t){
  const def=m.def;
  /* Ад: тёмные силуэты со светящимися акцентами */
  const HK=def.dim===1&&!HK_KEEP.has(def.id);
  const olOn=settings.quality!=='low'&&settings.outline!==false;
  const hw=m.hurt>0&&!olOn;
  const c1=hw?'#ffffff':HK?(def._d1||(def._d1=mixHex(def.c1,'#120e16',0.58))):def.c1;
  const c2=hw?'#ffcccc':HK?(def._d2||(def._d2=mixHex(def.c2,'#0a070c',0.62))):def.c2;
  const hurtSave=m.hurt;if(olOn&&m.hurt>0)m.hurt=0;
  g.save();
  g.globalAlpha=m.alpha;
  g.translate(m.x,m.y);
  /* смерть: падает на спину / кувыркается вниз и тает */
  if(m.deathK!==undefined){if(m.dstyle==='melt'||m.dstyle==='crumble'){g.beginPath();g.rect(-400,-600,800,601);g.clip();}deathXform(g,m,t);}
  if((def.mech==='laser'||def.mech==='gazer'||(def.mech==='boss'&&m.b&&m.b.atk==='laser'))&&m.tele>0.05){
    g.save();
    g.strokeStyle='rgba(255,'+(def.mech==='laser'?120:200)+',255,'+(0.25+m.tele*0.6)+')';
    g.lineWidth=1+m.tele*2;g.setLineDash([6,5]);
    g.beginPath();g.moveTo(0,-m.h*0.5);g.lineTo(Math.cos(m.aimA)*(def.mech==='laser'?420:320),-m.h*0.5+Math.sin(m.aimA)*(def.mech==='laser'?420:320));g.stroke();
    g.restore();
  }
  if(m.wave>0){
    const k=1-m.wave/0.5;
    g.save();g.strokeStyle='rgba(220,200,170,'+(0.7*(1-k))+')';g.lineWidth=4*(1-k)+1;
    g.beginPath();g.ellipse(0,-2,30+k*(def.mech==='colossus'?150:110),6+k*8,0,0,TAU);g.stroke();g.restore();
  }

  /* --- мировые эффекты адских мобов (до отражения по facing) --- */
  if(m.state==='remains'){
    const ph=def.mech==='phoenix'||def.shape==='h_phoenix',k=1-Math.max(0,m.remT||0)/3.6;
    if(ph){const p2=1+Math.sin(t*(4+k*14))*0.05*(1+k*2);g.save();g.translate(0,-9);g.scale(p2,p2);
      mobGlow(g,0,0,18+k*12,'#ff8a20',0.4+k*0.4);
      const gr=g.createRadialGradient(-2,-3,1,0,0,10);gr.addColorStop(0,'#fff0a0');gr.addColorStop(0.5,'#ff9a30');gr.addColorStop(1,'#8a2a08');
      g.fillStyle=gr;g.beginPath();g.ellipse(0,0,7,9,0,0,TAU);g.fill();
      g.strokeStyle='rgba(60,10,0,'+(0.4+k*0.5)+')';g.lineWidth=1;g.beginPath();g.moveTo(-3,-6);g.lineTo(0,-1);g.lineTo(-2,3);g.moveTo(0,-1);g.lineTo(4,1);g.stroke();g.restore();}
    else{g.fillStyle=shadeHex(def.c1,-0.35);g.beginPath();g.ellipse(0,-3,16,5,0,0,TAU);g.fill();
      for(let q=0;q<7;q++){const bx=-12+q*4,by=-5-(q%3)*2+Math.sin(t*20+q)*k*1.5;g.save();g.translate(bx,by);g.rotate(q*1.3+Math.sin(t*15+q)*k*0.4);
        g.fillStyle=q%2?def.c1:shadeHex(def.c1,0.2);g.fillRect(-4,-1.2,8,2.4);g.beginPath();g.arc(-4,0,1.8,0,TAU);g.arc(4,0,1.8,0,TAU);g.fill();g.restore();}
      g.fillStyle=shadeHex(def.c1,0.1);g.beginPath();g.arc(4,-9-k*3,4.4,0,TAU);g.fill();g.fillStyle='#1a1410';g.fillRect(2.5,-10-k*3,1.4,1.4);g.fillRect(5,-10-k*3,1.4,1.4);
      mobGlow(g,4,-9-k*3,8,'#ff5a2a',0.2+k*0.6);}
    if(k>0.6){g.strokeStyle='rgba(255,180,80,'+((k-0.6)*2)+')';g.lineWidth=2;g.beginPath();g.ellipse(0,-6,18*(1.6-k),6,0,0,TAU);g.stroke();}
    g.restore();return;
  }
  if(def.shape==='h_worm'){
    if(m.state==='under'||m.state==='rumble'){
      g.globalAlpha=1;g.fillStyle='rgba(60,20,10,.45)';g.beginPath();g.ellipse(0,-4,16,5,0,0,TAU);g.fill();
      if(m.state==='rumble'){mobGlow(g,0,-6,20+m.tele*20,'#ff7a2a',0.3+0.4*m.tele);g.fillStyle='rgba(255,140,50,'+(0.4+0.4*m.tele)+')';g.beginPath();g.ellipse(0,-4,10*m.tele+4,3,0,0,TAU);g.fill();
        g.strokeStyle='rgba(30,10,5,.8)';g.lineWidth=1.2;for(let q=0;q<5;q++){const a=q/5*TAU+0.3;g.beginPath();g.moveTo(0,-4);g.lineTo(Math.cos(a)*(8+m.tele*10),-4+Math.sin(a)*3);g.stroke();}}
      g.restore();return;}
    const tr=m.trail&&m.trail.length?m.trail:[[m.x,m.y-m.h*0.5]],n=tr.length;
    for(let q=n-1;q>=0;q--){const sx=tr[q][0]-m.x,sy=tr[q][1]-m.y,r=Math.max(4,12-q*0.55);
      const cc=m.hurt>0?'#fff':(q%2?def.c1:shadeHex(def.c1,-0.18));mobBlob(g,sx,sy,r,r*0.92,cc);
      g.fillStyle='rgba(255,'+(140+(q%3)*30)+',40,.75)';g.beginPath();g.arc(sx,sy-r*0.55,r*0.28,0,TAU);g.fill();
      if(q%2===0){g.fillStyle=shadeHex(def.c2,-0.2);g.beginPath();g.moveTo(sx-2,sy-r+0.5);g.lineTo(sx,sy-r-4);g.lineTo(sx+2,sy-r+0.5);g.fill();}}
    const a=Math.atan2(m.vy||-1,m.vx||m.facing),hx=tr[0][0]-m.x,hy=tr[0][1]-m.y;
    g.save();g.translate(hx,hy);g.rotate(a);mobBlob(g,0,0,13,12,m.hurt>0?'#fff':def.c1);
    const op=0.4+0.3*Math.sin(t*12);for(let q=0;q<4;q++){const aa=q/4*TAU+Math.PI/4;g.save();g.rotate(aa);g.fillStyle=def.c2;g.beginPath();g.moveTo(8,-3);g.lineTo(18+op*4,0);g.lineTo(8,3);g.fill();g.restore();}
    mobGlow(g,6,0,14,'#ffb040',0.8);g.fillStyle='#ffe080';g.beginPath();g.arc(7,0,4,0,TAU);g.fill();g.fillStyle='#3a0a00';g.beginPath();g.arc(8,0,2.4,0,TAU);g.fill();
    g.restore();g.restore();return;
  }
  if(def.shape==='h_toad'&&m.tongueT>0){const ex=player.x-m.x,ey=player.y-player.h*0.5-m.y;g.save();g.strokeStyle='#8a2040';g.lineWidth=5;g.lineCap='round';g.beginPath();g.moveTo(m.facing*14,-m.h*0.45);g.quadraticCurveTo(ex*0.5,ey*0.5-14,ex,ey);g.stroke();
    g.strokeStyle='#e07090';g.lineWidth=3;g.stroke();g.fillStyle='#e07090';g.beginPath();g.arc(ex,ey,5,0,TAU);g.fill();g.restore();}
  if(def.shape==='h_soulwraith'&&m.drain>0){olLight(g,(g)=>{const x1=0,y1=-m.h*0.6,x2=player.x-m.x,y2=player.y-player.h*0.5-m.y;
    for(const [lw,al] of [[6,0.25],[2.5,0.7]]){g.strokeStyle='rgba(120,210,255,'+al+')';g.lineWidth=lw;g.beginPath();g.moveTo(x1,y1);for(let q=1;q<=10;q++){const f=q/10;g.lineTo(x1+(x2-x1)*f+Math.sin(t*30+q)*4*(1-Math.abs(f-0.5)*2),y1+(y2-y1)*f+Math.cos(t*25+q)*4*(1-Math.abs(f-0.5)*2));}g.stroke();}
    for(let q=0;q<4;q++){const f=1-((t*1.6+q*0.25)%1);g.fillStyle='rgba(200,240,255,.9)';g.beginPath();g.arc(x1+(x2-x1)*f,y1+(y2-y1)*f,2,0,TAU);g.fill();}});}
  if(def.shape==='h_priest'&&m.link&&m.link.alive){const x2=m.link.x-m.x,y2=m.link.y-m.link.h*0.5-m.y;olLight(g,(g)=>{
    g.strokeStyle='rgba(255,40,60,'+(0.35+0.25*Math.sin(t*10))+')';g.lineWidth=3;g.setLineDash([5,4]);g.lineDashOffset=-t*40;g.beginPath();g.moveTo(0,-m.h*0.7);g.quadraticCurveTo(x2*0.5,Math.min(-m.h,y2)-30,x2,y2);g.stroke();g.setLineDash([]);
    mobGlow(g,x2,y2,16,'#ff2a3a',0.4);});}
  if(!def.fly){   /* мягкая тень на земле */
    const sr=m.w*0.55,sh=g.createRadialGradient(0,0,0,0,0,sr);sh.addColorStop(0,'rgba(0,0,0,.42)');sh.addColorStop(0.6,'rgba(0,0,0,.22)');sh.addColorStop(1,'rgba(0,0,0,0)');
    g.save();g.scale(1,Math.max(0.2,m.h*0.2/sr));g.fillStyle=sh;g.beginPath();g.arc(0,0,sr,0,TAU);g.fill();g.restore();
  }
  g.scale(m.facing,1);
  /* отдача от удара: короткое сплющивание и откидывание назад */
  if(hurtSave>0&&!def.boss&&m.alive!==false){const k=Math.sin(clamp(hurtSave/0.24,0,1)*Math.PI);g.translate(-k*3.2,0);g.rotate(-k*0.12);g.scale(1+k*0.12,1-k*0.1);}
  /* замах: подготовка с дрожью и вытягиванием */
  if(m.tele>0.05&&m.teleUp&&!def.boss&&m.alive!==false){const k=Math.min(1,m.tele);g.translate(-k*2+Math.sin(t*55)*k*0.9,0);g.scale(1-k*0.06,1+k*0.07);}
  /* атака: выпад вперёд */
  if(m.atkT>0&&!def.boss){const k=Math.sin((1-m.atkT/0.24)*Math.PI);g.translate(k*5,0);g.scale(1+k*0.1,1-k*0.06);}
  /* дыхание у стоящих наземных */
  if(!def.fly&&!def.boss&&Math.abs(m.vx)<5&&m.deathK===undefined){const b2=Math.sin(t*2.6+m.phase)*0.018;g.translate(0,0);g.scale(1+b2,1-b2);}
  /* появление: вырастает из земли */
  if(m.age!==undefined&&m.age<0.35){const k=m.age/0.35;g.scale(0.5+0.5*k,k);}
  const bob=Math.sin(t*4+m.phase)*(def.fly?3:1.4);
  const ty=-m.h*0.5+bob;
  const s=Math.max(m.w,m.h)/34;
  const OR=Math.max(m.w,m.h)*1.3+16,dark=def.dim===1||(def.boss&&false);
  const olTh=-1.2;
  OL.shade={h:m.h,top:dark?0.1:0.16,bot:def.fly?0.26:0.36};
  withOutline(g,0,-m.h*0.5,OR,OR,dark?'rgba(5,2,4,.96)':'rgba(24,15,10,.92)',olTh,(g)=>{
  if(OL.active&&g===OL.g){if(hurtSave>0)OL.tint='rgba(255,250,245,'+(0.25+0.55*clamp(hurtSave/0.24,0,1))+')';else if(m.deathK!==undefined)OL.tint=deathTint(m);}
  g.save();
  g.translate(0,ty);
  g.scale(s,s);
  const FY=(m.h*0.5-bob)/s;                       /* линия земли в координатах модели */
  const wk=Math.abs(m.vx)>6?m.anim*13:0,sw=Math.sin(wk);
  const ang=(def.dmg>0&&!def.neutral)||m.provoked>0;
  switch(def.shape){
    case 'rabbit':{
      const hop=clamp(-m.vy/400,-0.5,0.7);
      g.save();g.translate(0,-hop*3);
      g.fillStyle=shadeHex(c1,-0.25);g.beginPath();g.ellipse(-7,FY-4+hop*2,6,4,-0.3-hop*0.8,0,TAU);g.fill();
      mobBlob(g,-12,0,4.5,4.5,'#f4efe6');
      mobBlob(g,-1,2,11,8.5,c1);
      g.fillStyle=hexA('#f6efe0',0.55);g.beginPath();g.ellipse(2,6,6,3.5,0,0,TAU);g.fill();
      g.strokeStyle=shadeHex(c1,-0.2);g.lineWidth=3;g.lineCap='round';g.beginPath();g.moveTo(5,6);g.lineTo(6+sw*2,FY-1);g.stroke();
      const ew=Math.sin(t*5+m.phase)*0.15-hop*0.5;
      for(const [ex,ea] of [[3,-0.35],[7,0.1]]){g.save();g.translate(ex,-8);g.rotate(ea+ew);mobBlob(g,0,-6,2.6,7.5,c1);g.fillStyle='#f0b8b0';g.beginPath();g.ellipse(0,-6,1.2,5.5,0,0,TAU);g.fill();g.restore();}
      mobBlob(g,8,-3,7,6,c1);
      mobEye(g,m,10,-4.5,2.2,{iris:'#2a1a12'});
      g.fillStyle='#e8908a';g.beginPath();g.arc(14.5,-1.5+Math.sin(t*14)*0.3,1.2,0,TAU);g.fill();
      g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=0.5;g.beginPath();g.moveTo(14,-1);g.lineTo(18,-2);g.moveTo(14,-0.5);g.lineTo(18,0.5);g.stroke();
      g.restore();break;}
    case 'worm':{
      /* червь-плевун: цельное кольчатое тело по изгибу, поясок, пасть-воронка */
      const open=m.tele,N=16;
      const sp=[];for(let i=0;i<=N;i++){const f=i/N,px=-20+f*33,lift=f>0.62?Math.pow((f-0.62)/0.38,1.5)*(10+open*3):0;
        sp.push([px,FY-3.4-Math.abs(Math.sin(t*4-f*6))*2.2*(1-f*0.6)-lift]);}
      const wid=(i)=>{const f=i/N;return 1.2+Math.sin(Math.min(1,f*1.1)*Math.PI*0.6)*2.4+(f>0.88?0.5:0);};
      const nrm=(i)=>{const a=sp[Math.max(0,i-1)],b=sp[Math.min(N,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1;return [-dy/l,dx/l];};
      g.beginPath();for(let i=0;i<=N;i++){const [nx,ny]=nrm(i),w=wid(i);i?g.lineTo(sp[i][0]+nx*w,sp[i][1]+ny*w):g.moveTo(sp[i][0]+nx*w,sp[i][1]+ny*w);}
      for(let i=N;i>=0;i--){const [nx,ny]=nrm(i),w=wid(i);g.lineTo(sp[i][0]-nx*w,sp[i][1]-ny*w);}g.closePath();
      {const gr=g.createLinearGradient(0,FY-16,0,FY);gr.addColorStop(0,shadeHex(c1,0.25));gr.addColorStop(0.55,c1);gr.addColorStop(1,shadeHex(c1,-0.35));
        g.fillStyle=m.hurt>0?'#fff':gr;g.fill();g.strokeStyle=mobLine(c1);g.lineWidth=1.1;g.lineJoin='round';g.stroke();}
      /* кольца */
      g.strokeStyle=hexA(shadeHex(c1,-0.4),0.4);g.lineWidth=0.5;
      for(let i=1;i<N;i+=2){const [nx,ny]=nrm(i),w=wid(i)*0.92;g.beginPath();g.moveTo(sp[i][0]+nx*w,sp[i][1]+ny*w);g.quadraticCurveTo(sp[i][0]+0.8,sp[i][1],sp[i][0]-nx*w,sp[i][1]-ny*w);g.stroke();}
      /* поясок */
      {const i=Math.round(N*0.42),[nx,ny]=nrm(i),w=wid(i)+0.4;g.fillStyle=shadeHex(c1,0.2);g.beginPath();
        g.moveTo(sp[i-1][0]+nx*w,sp[i-1][1]+ny*w);g.lineTo(sp[i+1][0]+nx*w,sp[i+1][1]+ny*w);g.lineTo(sp[i+1][0]-nx*w,sp[i+1][1]-ny*w);g.lineTo(sp[i-1][0]-nx*w,sp[i-1][1]-ny*w);g.closePath();g.fill();}
      /* блик вдоль спины */
      g.strokeStyle='rgba(255,255,255,.28)';g.lineWidth=1;g.lineCap='round';g.beginPath();for(let i=2;i<N-1;i++){const [nx,ny]=nrm(i),w=wid(i)*0.55;i>2?g.lineTo(sp[i][0]+nx*w,sp[i][1]+ny*w):g.moveTo(sp[i][0]+nx*w,sp[i][1]+ny*w);}g.stroke();
      /* пасть-воронка с зубками */
      const hx=sp[N][0],hy=sp[N][1];
      g.save();g.translate(hx+1.2,hy);
      g.fillStyle='#3a0a1a';g.beginPath();g.ellipse(0,0,1.6+open*1.4,1.6+open*3,0,0,TAU);g.fill();
      g.fillStyle='#fff6ea';for(let k=0;k<6;k++){const a=k/6*TAU;g.beginPath();g.moveTo(Math.cos(a)*(1.5+open*1.3),Math.sin(a)*(1.5+open*2.9));g.lineTo(Math.cos(a+0.25)*(0.5+open*0.4),Math.sin(a+0.25)*(0.5+open));g.lineTo(Math.cos(a+0.5)*(1.5+open*1.3),Math.sin(a+0.5)*(1.5+open*2.9));g.fill();}
      g.restore();
      if(open>0.3){mobGlow(g,hx+4,hy,7,'#9be85a',0.7*open);g.fillStyle='rgba(155,232,90,'+open+')';g.beginPath();g.arc(hx+4,hy,1.6+open,0,TAU);g.fill();}
      mobEye(g,m,hx-3,hy-3.8,2,{iris:'#3a0a1a',ir:0.55,brow:ang?shadeHex(c2,-0.5):null});
      /* комочки земли у хвоста */
      g.fillStyle='rgba(90,64,40,.85)';for(let k=0;k<3;k++){g.beginPath();g.arc(-16+k*2.6,FY-0.6-(k%2),0.9,0,TAU);g.fill();}
      break;}
    case 'bug':{

      if(m.tele>0.05)g.rotate(-m.tele*0.15);
      for(let i=0;i<3;i++){const lx=-6+i*6,ph=wk+i*2.1;mobLeg(g,lx,4,0.5+Math.sin(ph)*0.5,5,-1.0,5,1.7,shadeHex(c2,-0.4));}
      /* брюшко */
      mobBlob(g,-1,4,12,5.5,shadeHex(c2,-0.25));
      /* металлический надкрылья с заклёпками */
      g.beginPath();g.moveTo(-13,3);g.quadraticCurveTo(-13,-10,-1,-10.5);g.quadraticCurveTo(10,-10,11,2);g.closePath();
      {const gr=g.createLinearGradient(0,-11,0,3);gr.addColorStop(0,shadeHex(c1,0.35));gr.addColorStop(0.45,c1);gr.addColorStop(1,shadeHex(c1,-0.35));g.fillStyle=m.hurt>0?'#fff':gr;g.fill();g.strokeStyle=mobLine(c1);g.lineWidth=1.2;g.stroke();}
      g.strokeStyle=hexA(mobLine(c1),0.9);g.lineWidth=1.1;g.beginPath();g.moveTo(-1,-10.4);g.lineTo(-1.6,2.6);g.stroke();
      g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=1.4;g.beginPath();g.arc(-1,-1,8.4,Math.PI*1.15,Math.PI*1.55);g.stroke();
      g.fillStyle='#d8c890';for(const [rx,ry] of [[-9,-1],[-6,-6],[3,-7],[7,-2],[-4,0.5],[4,0]]){g.beginPath();g.arc(rx,ry,0.9,0,TAU);g.fill();}
      g.fillStyle=hexA(shadeHex(c1,0.6),0.25);g.beginPath();g.ellipse(-5,-6,4,1.6,-0.3,0,TAU);g.fill();
      for(let i=0;i<3;i++){const lx=-5+i*6,ph=wk+i*2.1+Math.PI;mobLeg(g,lx,5,-0.3+Math.sin(ph)*0.5,5,-1.1,5,1.8,shadeHex(c2,-0.2));}
      /* голова с рогом */
      mobBlob(g,12,1,5,4.4,shadeHex(c2,-0.1));
      g.beginPath();g.moveTo(13,-2);g.quadraticCurveTo(18,-5,17,-11);g.quadraticCurveTo(15.6,-6,12,-3.4);g.closePath();mobPath(g,'#d8d0b0',15,-6,5);
      mobEye(g,m,14,0,1.4,{white:'#ffe066',iris:'#200',ir:0.5,brow:ang?'#100':null});
      g.strokeStyle=shadeHex(c2,-0.4);g.lineWidth=0.9;g.beginPath();g.moveTo(16,2.6);g.lineTo(19,3.4);g.moveTo(16,3.4);g.lineTo(18.6,5);g.stroke();
      break;}
    case 'golem':{
      const lift=m.tele,swA=Math.abs(m.vx)>5?Math.sin(m.anim*6)*0.35:Math.sin(t*1.5)*0.04;
      for(const [lx,ph] of [[-6,0],[6,Math.PI]]){const st=Math.max(0,Math.sin(m.anim*6+ph))*(Math.abs(m.vx)>5?2:0);
        g.beginPath();g.rect(lx-4.5,FY-9-st,9,9+st);mobPath(g,shadeHex(c2,-0.1),lx,FY-5,6);}
      g.save();g.translate(-12,-9);g.rotate(swA-lift*1.4);
      g.beginPath();g.rect(-4,0,8,12);mobPath(g,shadeHex(c2,-0.15),0,6,8);
      mobBlob(g,0,14,5.5,5,shadeHex(c1,-0.15));g.restore();
      g.beginPath();g.moveTo(-12,-12);g.lineTo(12,-13);g.lineTo(13,6);g.lineTo(-13,7);g.closePath();mobPath(g,c1,-2,-4,14);
      g.strokeStyle=hexA(mobLine(c1),0.6);g.lineWidth=0.9;g.beginPath();g.moveTo(-12,-3);g.lineTo(-3,-1);g.lineTo(4,-5);g.lineTo(13,-3);g.moveTo(-6,7);g.lineTo(-3,-1);g.stroke();
      g.fillStyle='rgba(90,140,60,.75)';g.beginPath();g.ellipse(-7,-12,5,1.8,0,0,TAU);g.ellipse(7,-13,4,1.5,0,0,TAU);g.fill();
      const cp=0.6+0.4*Math.sin(t*3)+lift*0.6;
      mobGlow(g,0,-1,9,'#9a6aff',0.45*cp);
      g.fillStyle='rgba(190,150,255,'+Math.min(1,0.7*cp)+')';g.beginPath();g.moveTo(0,-6);g.lineTo(3,-1);g.lineTo(0,4);g.lineTo(-3,-1);g.closePath();g.fill();
      g.beginPath();g.moveTo(-7,-13);g.lineTo(-6,-21);g.lineTo(7,-22);g.lineTo(8,-13);g.closePath();mobPath(g,shadeHex(c1,0.05),0,-17,8);
      g.fillStyle='rgba(0,0,0,.5)';g.fillRect(-4,-19,10,3.5);
      g.fillStyle='rgba(200,160,255,'+(0.8+0.2*Math.sin(t*4))+')';g.fillRect(1,-18.5,2.4,2.4);g.fillRect(5,-18.5,2.4,2.4);
      mobGlow(g,4,-17.5,6,'#b080ff',0.5);
      g.save();g.translate(12,-9);g.rotate(-swA+lift*1.4);
      g.beginPath();g.rect(-4,0,8,12);mobPath(g,c2,0,6,8);
      mobBlob(g,0,14,6,5.5,c1);g.restore();
      break;}
    case 'bat':{

      const dive=m.state==='dive',fl=Math.sin(t*(dive?6:15)+m.phase);
      const wing=(dir)=>{g.save();g.scale(dir,1);g.translate(3,-2);g.rotate(dive?0.95:-fl*0.75);
        g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(6,-9,12,-8);g.lineTo(18,-10);g.quadraticCurveTo(17,-4,19,1);g.quadraticCurveTo(15,-1,13,3);g.quadraticCurveTo(10,0,7,4);g.quadraticCurveTo(4,1,1,3);g.closePath();
        mobPath(g,shadeHex(c2,0.08),10,-3,11);
        g.fillStyle=hexA(shadeHex(c2,0.35),0.35);g.beginPath();g.moveTo(1,1);g.quadraticCurveTo(7,-6,12,-7);g.lineTo(13,2);g.quadraticCurveTo(8,0,1,1);g.fill();
        g.strokeStyle=shadeHex(c1,-0.1);g.lineWidth=1;g.lineCap='round';g.beginPath();g.moveTo(0,0);g.lineTo(12,-8);g.lineTo(18,-10);g.moveTo(12,-8);g.lineTo(13,3);g.moveTo(12,-8);g.lineTo(7,4);g.stroke();
        g.fillStyle='#e8e0d0';g.beginPath();g.moveTo(12,-8);g.lineTo(13,-11);g.lineTo(13.6,-8);g.fill();g.restore();};
      wing(-1);
      /* меховое тельце с хохолком */
      mobBlob(g,0,1,6.4,7,c1);
      g.fillStyle=shadeHex(c1,0.25);g.beginPath();g.ellipse(0.6,4,3.8,3.6,0,0,TAU);g.fill();
      g.fillStyle=shadeHex(c1,-0.15);for(let k=0;k<4;k++){g.beginPath();g.moveTo(-3+k*2,-5.6);g.lineTo(-2+k*2,-8.4-(k%2));g.lineTo(-1+k*2,-5.6);g.fill();}
      /* большие уши */
      for(const [ex,er] of [[-3.5,-0.25],[3.5,0.25]]){g.save();g.translate(ex,-5);g.rotate(er+Math.sin(t*3+ex)*0.08);g.beginPath();g.moveTo(-2.4,0);g.quadraticCurveTo(-1.6,-7,0,-9);g.quadraticCurveTo(1.6,-7,2.4,0);g.closePath();mobPath(g,c1,0,-4,5);
        g.fillStyle='#d88890';g.beginPath();g.moveTo(-1,-0.5);g.quadraticCurveTo(-0.6,-5,0,-6.5);g.quadraticCurveTo(0.6,-5,1,-0.5);g.fill();g.restore();}
      /* мордочка: пятачок, глаза, клыки */
      mobEye(g,m,-2,-1.4,1.8,{white:'#ffd060',iris:'#2a0800',ir:0.5,glow:'#ffb030',brow:'#1a0a10'});mobEye(g,m,2.6,-1.4,1.8,{white:'#ffd060',iris:'#2a0800',ir:0.5,brow:'#1a0a10'});
      g.fillStyle='#3a1a24';g.beginPath();g.ellipse(0.4,1.6,1.6,1.1,0,0,TAU);g.fill();
      g.fillStyle='#fff';g.beginPath();g.moveTo(-1,2.8);g.lineTo(-0.5,5.2);g.lineTo(0,2.8);g.moveTo(1,2.8);g.lineTo(1.5,5.2);g.lineTo(2,2.8);g.fill();
      /* лапки */
      g.strokeStyle=shadeHex(c1,-0.3);g.lineWidth=1;g.beginPath();g.moveTo(-2,7.5);g.lineTo(-2.4,9.6);g.moveTo(2,7.5);g.lineTo(2.4,9.6);g.stroke();
      wing(1);
      break;}
    case 'spider':{

      const pounce=m.state==='pounce',air=!m.onGround,mv=Math.abs(m.vx)>6;
      const gy=FY;
      /* нога паука: из сустава вверх к колену, затем вниз к земле (как у настоящего паука) */
      const leg=(jx,jy,dir,spread,ph,c,w)=>{
        const lift=mv&&!air?Math.max(0,Math.sin(ph))*3.2:0,swing=mv&&!air?Math.cos(ph)*2.6:0;
        const fx=jx+dir*spread+swing*dir*0.6+(air?dir*2:0),fy=air?jy+9:gy-lift;
        const kx=jx+dir*spread*0.55,ky=jy-7.5-(air?-1:0)-lift*0.4;
        g.strokeStyle=c;g.lineCap='round';g.lineJoin='round';g.lineWidth=w;g.beginPath();g.moveTo(jx,jy);g.lineTo(kx,ky);g.stroke();
        g.lineWidth=w*0.75;g.beginPath();g.moveTo(kx,ky);g.lineTo(fx,fy);g.stroke();
        g.fillStyle=shadeHex(c,0.35);g.beginPath();g.arc(kx,ky,w*0.55,0,TAU);g.fill();
        g.fillStyle='#e8f4ff';g.beginPath();g.arc(fx,fy,0.8,0,TAU);g.fill();};
      const wk2=m.anim*14;
      /* дальние ноги (тёмные) */
      const far=shadeHex(c2,-0.45);
      leg(3,0,1,13,wk2+0.0,far,2);leg(1.5,0.5,1,7,wk2+Math.PI,far,2);leg(-0.5,0.5,-1,6,wk2+0.0,far,2);leg(-2,0,-1,12,wk2+Math.PI,far,2);
      /* брюшко с кристаллами */
      g.save();g.translate(-8,-3+Math.sin(t*3+m.phase)*0.5);
      g.beginPath();g.ellipse(0,0,9.5,7.6,-0.15,0,TAU);mobPath(g,c2,-2,-3,10);
      g.fillStyle=hexA(shadeHex(c1,0.3),0.55);g.beginPath();g.moveTo(-5,0);g.lineTo(-1,-3.6);g.lineTo(3,0);g.lineTo(-1,3.4);g.closePath();g.fill();
      const cc=['#c8a8ff','#9be8ff','#ffb0f0'];
      for(let k=0;k<3;k++){const bx=-4.6+k*4,bh=7+k*1.6-(k===2?2:0);mobGlow(g,bx,-6-bh*0.5,7,cc[k],0.25);
        g.fillStyle=shadeHex(cc[k],-0.25);g.beginPath();g.moveTo(bx-2.2,-5.4);g.lineTo(bx+2.2,-5.4);g.lineTo(bx+0.4,-5.4-bh);g.closePath();g.fill();
        g.fillStyle=cc[k];g.beginPath();g.moveTo(bx-2.2,-5.4);g.lineTo(bx,-5.4);g.lineTo(bx+0.4,-5.4-bh);g.closePath();g.fill();}
      g.restore();
      /* головогрудь */
      g.beginPath();g.ellipse(3.6,-1,6.6,5.2,0.1,0,TAU);mobPath(g,c1,3,-3,7);
      g.fillStyle=hexA(shadeHex(c1,-0.4),0.6);g.beginPath();g.ellipse(3,-3.6,3,1.2,0,0,TAU);g.fill();
      /* ближние ноги */
      const near=shadeHex(c2,-0.1);
      leg(5,1,1,14,wk2+Math.PI,near,2.4);leg(3,1.6,1,8,wk2,near,2.4);leg(1,1.6,-1,7,wk2+Math.PI,near,2.4);leg(-1,1,-1,13,wk2,near,2.4);
      /* хелицеры и глаза */
      const bite=pounce||m.tele>0.3?0.6:0.15+Math.sin(t*6)*0.1;
      g.strokeStyle='#f0e8ff';g.lineWidth=1.4;g.lineCap='round';
      g.beginPath();g.moveTo(9,1);g.quadraticCurveTo(11.5+bite*2,3,10+bite,5.5);g.moveTo(8,1.6);g.quadraticCurveTo(9.6+bite,4,8.2+bite*0.6,6);g.stroke();
      mobGlow(g,8,-2.6,6,'#ff5ad0',0.45);
      for(const [ex,ey,er] of [[7.6,-2.4,1.3],[9.4,-1.8,1.1],[6.4,-3.8,0.8],[8.8,-3.6,0.8]]){g.fillStyle='#ff5ad0';g.beginPath();g.arc(ex,ey,er,0,TAU);g.fill();g.fillStyle='#fff';g.beginPath();g.arc(ex-0.3,ey-0.3,er*0.35,0,TAU);g.fill();}
      break;}
    case 'wisp':{

      const pu=0.7+0.3*Math.sin(t*5+m.phase);
      mobGlow(g,0,0,24,c1,0.45*pu);
      olLight(g,(g)=>{
      for(let k=0;k<4;k++){g.fillStyle=hexA(k?c1:'#ffffff',0.32);g.beginPath();g.moveTo(-5,3);g.quadraticCurveTo(-13-k*2,5+Math.sin(t*7+k)*3,-19-k*3,-1+Math.sin(t*6+k)*4);g.quadraticCurveTo(-11,-5,-5,-4);g.closePath();g.fill();}
      for(let k=0;k<5;k++){const a=t*2+k*TAU/5,r=12+Math.sin(t*3+k)*1.5;g.fillStyle='rgba(220,250,255,.8)';g.beginPath();g.arc(Math.cos(a)*r,Math.sin(a)*r*0.6,0.9,0,TAU);g.fill();}
      });
      {const gr=g.createRadialGradient(-2.4,-3,1,0,0,9.4);gr.addColorStop(0,'#ffffff');gr.addColorStop(0.4,c1);gr.addColorStop(1,hexA(c2,0.95));
      g.fillStyle=gr;g.beginPath();g.moveTo(0,-11);g.quadraticCurveTo(6,-8,8.6,-2);g.quadraticCurveTo(9,7,0,8.6);g.quadraticCurveTo(-9,7,-8.6,-2);g.quadraticCurveTo(-6,-8,0,-11);g.fill();}
      /* хитрая мордочка-обманка */
      mobEye(g,m,3,-1,2.2,{iris:'#0a3a5a',ir:0.55});mobEye(g,m,-2.6,-1,1.9,{iris:'#0a3a5a',ir:0.55});
      g.strokeStyle='#0a3a5a';g.lineWidth=0.9;g.beginPath();g.moveTo(-1.6,3);g.quadraticCurveTo(0.6,4.8+(m.tele>0.2?1.6:0),3,3);g.stroke();
      if(ang){g.strokeStyle='#0a3a5a';g.lineWidth=1;g.beginPath();g.moveTo(1.4,-4.6);g.lineTo(4.6,-3.4);g.moveTo(-1.2,-4.4);g.lineTo(-4,-3.4);g.stroke();}
      break;}
    case 'orb':{

      const rot=t*0.8,pu=0.5+0.5*Math.sin(t*3);
      mobGlow(g,0,0,22,'#7dffb0',0.3+pu*0.15);
      /* лепестки-листья */
      for(let k=0;k<6;k++){g.save();g.rotate(rot+k*TAU/6);g.beginPath();g.moveTo(0,-7);g.quadraticCurveTo(4.4,-12,0,-18);g.quadraticCurveTo(-4.4,-12,0,-7);g.closePath();mobPath(g,k%2?shadeHex(c1,0.1):shadeHex(c1,-0.08),0,-12,6);
        g.strokeStyle=hexA(shadeHex(c1,-0.45),0.7);g.lineWidth=0.6;g.beginPath();g.moveTo(0,-8);g.lineTo(0,-16);g.stroke();g.restore();}
      /* ядро-бутон */
      {const gr=g.createRadialGradient(-3,-3,1,0,0,9);gr.addColorStop(0,'#f0fff6');gr.addColorStop(0.5,c1);gr.addColorStop(1,shadeHex(c1,-0.35));g.fillStyle=m.hurt>0?'#fff':gr;g.beginPath();g.arc(0,0,8.6,0,TAU);g.fill();g.strokeStyle=mobLine(c1);g.lineWidth=1.2;g.stroke();}
      mobShine(g,-3,-4.5,3,1.5,0.5);
      mobEye(g,m,2.8,-1.2,1.9,{iris:'#0a3a20'});mobEye(g,m,-2.6,-1.2,1.9,{iris:'#0a3a20'});
      g.fillStyle='#e87890';g.globalAlpha=m.alpha*0.6;g.beginPath();g.ellipse(-4.4,1.6,1.4,0.8,0,0,TAU);g.ellipse(4.6,1.6,1.4,0.8,0,0,TAU);g.fill();g.globalAlpha=m.alpha;
      g.strokeStyle='#0a3a20';g.lineWidth=0.8;g.beginPath();g.arc(0.2,2.2,1.6,0.3,Math.PI-0.3);g.stroke();
      /* целебный крест и нимб */
      g.fillStyle='rgba(255,255,255,'+(0.7+0.3*pu)+')';g.fillRect(-0.9,4.4,1.8,4.6);g.fillRect(-2.3,5.8,4.6,1.8);
      g.strokeStyle='rgba(220,255,230,'+(0.5+0.4*pu)+')';g.lineWidth=1.4;g.beginPath();g.ellipse(0,-21,6.4,1.8,0,0,TAU);g.stroke();
      break;}
    case 'slime':{
      /* лавовый слизень: светящаяся капля под остывшей коркой, подтёки по краям */
      const sq=clamp(1-m.vy/700,0.75,1.3),wob=Math.sin(t*5+m.phase)*0.05;
      g.save();g.translate(0,FY);g.scale(1/Math.sqrt(sq)+wob,sq-wob);g.translate(0,-FY);
      const body=()=>{g.beginPath();g.moveTo(-16,FY);g.bezierCurveTo(-18,FY-10,-12,FY-20,-2,FY-21);g.bezierCurveTo(9,FY-22,17,FY-12,16,FY-2);
        for(let k=0;k<4;k++){const x=12-k*8;g.quadraticCurveTo(x-2,FY+1.8+Math.sin(t*3+k)*0.8,x-4,FY);}g.closePath();};
      body();
      {const gr=g.createRadialGradient(-1,FY-7,1,0,FY-9,19);gr.addColorStop(0,'#fff6b0');gr.addColorStop(0.3,'#ffb040');gr.addColorStop(0.75,c1);gr.addColorStop(1,shadeHex(c1,-0.35));
        g.fillStyle=m.hurt>0?'#fff':gr;g.fill();g.strokeStyle=mobLine(c1);g.lineWidth=1.2;g.stroke();}
      /* остывшая корка: тёмные плиты с трещинками */
      g.save();body();g.clip();
      g.fillStyle=shadeHex(c2,-0.45);
      for(const [px,py,w,h,r] of [[-7,FY-18,7,4.5,-0.3],[3,FY-19.5,7.5,4,0.15],[11,FY-14,5,4,0.6],[-13,FY-11,4.5,4,-0.8]]){
        g.save();g.translate(px,py);g.rotate(r);g.beginPath();g.moveTo(-w/2,0);g.lineTo(-w*0.3,-h/2);g.lineTo(w*0.35,-h/2);g.lineTo(w/2,0);g.lineTo(w*0.2,h/2);g.lineTo(-w*0.35,h/2);g.closePath();g.fill();
        g.fillStyle='rgba(255,255,255,.08)';g.fillRect(-w*0.3,-h/2,w*0.5,1);g.fillStyle=shadeHex(c2,-0.45);g.restore();}
      g.restore();
      mobGlow(g,0,FY-7,15,'#ffb050',0.4);
      for(let k=0;k<4;k++){const ph=(t*0.6+k*0.27+m.phase)%1;g.fillStyle='rgba(255,240,160,'+(0.7*(1-ph))+')';g.beginPath();g.arc(-7+k*4.6,FY-4-ph*9,0.9+ph*1.2,0,TAU);g.fill();}
      mobShine(g,-8,FY-13,2.6,1.1,0.4);
      mobEye(g,m,5.4,FY-9.5,2.7,{white:'#fff8e0',iris:'#3a0a00',brow:ang?'#3a0a00':null});mobEye(g,m,-1.2,FY-9.8,2.3,{white:'#fff8e0',iris:'#3a0a00'});
      g.fillStyle='#4a0e00';g.beginPath();g.ellipse(2.6,FY-4.6,2.6,1+Math.max(0,m.tele)*1.6,0,0,TAU);g.fill();
      g.restore();
      break;}
    case 'boss':{
      const B=m.b||{phase:1,atk:''};const ph=B.phase||1;
      const col=ph===1?['#6a2ac8','#1a0838','#c8a0ff']:ph===2?['#a02ab0','#2a0630','#ff90ff']:['#c0203a','#3a0610','#ffb080'];
      {const sp=m.spawnS===undefined?1:m.spawnS;if(sp<1){g.scale(Math.max(0.01,sp),Math.max(0.01,sp));g.rotate((1-sp)*2.5);}}
      mobGlow(g,0,0,32,col[2],0.22+0.1*Math.sin(t*3));
      /* кольцо рун */
      g.save();g.rotate(t*0.4*(ph===3?2:1));g.strokeStyle=hexA(col[2],0.35);g.lineWidth=0.8;g.beginPath();g.arc(0,0,27,0,TAU);g.stroke();
      g.fillStyle=hexA(col[2],0.75);for(let k=0;k<8;k++){g.save();g.rotate(k*TAU/8);g.translate(0,-27);g.fillRect(-1.6,-0.4,3.2,0.8);g.fillRect(-0.4,-1.6,0.8,3.2);if(k%2){g.beginPath();g.arc(0,0,1.6,0,TAU);g.stroke();}g.restore();}g.restore();
      /* корона рогов */
      g.fillStyle=shadeHex(col[1],0.15);for(let k=0;k<5;k++){const a=-Math.PI/2+(k-2)*0.42,L=(k===2?26:22)+(ph-1)*2;g.save();g.rotate(a+Math.PI/2);g.beginPath();g.moveTo(-2.4,-12);g.quadraticCurveTo(-3+Math.sin(t+k)*0.6,-L*0.7,0,-L);g.quadraticCurveTo(2,-L*0.7,2.4,-12);g.closePath();g.fill();
        g.strokeStyle=hexA(col[2],0.5);g.lineWidth=0.6;g.stroke();g.restore();}
      for(let k=0;k<9;k++){const a=k/9*TAU+t*0.3;const L=15+3*Math.sin(t*2+k);
        g.strokeStyle=col[1];g.lineWidth=3.4-((k%2)*0.8);g.lineCap='round';g.beginPath();
        g.moveTo(Math.cos(a)*10,Math.sin(a)*10);
        for(let j=1;j<=4;j++){const r=10+L*j/4,aa=a+Math.sin(t*2.2+k+j*0.8)*0.3*j/4;g.lineTo(Math.cos(aa)*r,Math.sin(aa)*r);}
        g.stroke();g.strokeStyle=hexA(col[2],0.45);g.lineWidth=0.8;g.stroke();}
      g.fillStyle=col[1];for(let k=0;k<7;k++){const a=-Math.PI/2+(k-3)*0.3;g.beginPath();g.moveTo(Math.cos(a-0.1)*12,Math.sin(a-0.1)*12);g.lineTo(Math.cos(a)*(19+(k%2)*4),Math.sin(a)*(19+(k%2)*4));g.lineTo(Math.cos(a+0.1)*12,Math.sin(a+0.1)*12);g.closePath();g.fill();}
      {const gr=g.createRadialGradient(-4,-5,2,0,0,14);gr.addColorStop(0,shadeHex(col[0],0.3));gr.addColorStop(1,col[1]);
      g.fillStyle=m.hurt>0?'#ffffff':gr;g.beginPath();g.arc(0,0,13,0,TAU);g.fill();g.strokeStyle=hexA(col[2],0.7);g.lineWidth=0.8;g.stroke();}
      {const open=B.atk==='laser'?1:0.75+0.25*Math.abs(Math.sin(t*0.7));
      g.fillStyle='#f4ecff';g.beginPath();g.ellipse(0,-3,7,5*open,0,0,TAU);g.fill();
      const lx=(m.lookX||0)*m.facing*2.5,ly=(m.lookY||0)*1.8;
      g.fillStyle=col[0];g.beginPath();g.arc(lx,-3+ly,3.4*open,0,TAU);g.fill();
      g.fillStyle='#000';g.beginPath();g.ellipse(lx,-3+ly,0.9,2.8*open,0,0,TAU);g.fill();
      mobGlow(g,lx,-3+ly,6,col[2],0.5);}
      {const mo=1.6+Math.max(0,Math.sin(t*4))*1.6+(B.atk==='summon'||B.atk==='transition'?3:0);
      g.fillStyle='#0a0010';g.beginPath();g.ellipse(0,7,7,mo,0,0,TAU);g.fill();
      g.fillStyle='#f0e8f8';for(let k=-3;k<=3;k++){g.beginPath();g.moveTo(k*2-0.8,7-mo);g.lineTo(k*2,7-mo+2);g.lineTo(k*2+0.8,7-mo);g.fill();g.beginPath();g.moveTo(k*2-0.8,7+mo);g.lineTo(k*2,7+mo-2);g.lineTo(k*2+0.8,7+mo);g.fill();}}
      /* бронепластины и доп. глаза по фазам */
      g.fillStyle=hexA(shadeHex(col[1],0.25),0.9);for(const sd of [-1,1]){g.beginPath();g.moveTo(sd*9,-9);g.quadraticCurveTo(sd*16,-2,sd*10,8);g.lineTo(sd*12.5,-1);g.closePath();g.fill();}
      if(ph>=2){for(const [ex,ey,r] of [[-9,-7,2],[9,-7,2],[-7,5,1.6],[7,5,1.6]]){const bl=((t*0.5+ex*0.1)%1)>0.92;g.fillStyle='#f4ecff';g.beginPath();g.ellipse(ex,ey,r,bl?0.3:r*0.8,0,0,TAU);g.fill();
        if(!bl){g.fillStyle=col[0];g.beginPath();g.arc(ex+(m.lookX||0)*m.facing*0.6,ey+(m.lookY||0)*0.4,r*0.55,0,TAU);g.fill();}mobGlow(g,ex,ey,4,col[2],0.35);}}
      if(ph===3){g.strokeStyle='rgba(255,'+(170+Math.floor(60*Math.sin(t*6)))+',90,.9)';g.lineWidth=0.9;g.beginPath();
        for(const [x1,y1,x2,y2,x3,y3] of [[-11,-4,-6,-1,-8,4],[10,-5,6,0,9,5],[-3,9,0,5,3,10]]){g.moveTo(x1,y1);g.lineTo(x2,y2);g.lineTo(x3,y3);}g.stroke();
        const dp=(t*1.3)%1;g.fillStyle='rgba(255,140,80,'+(1-dp)+')';g.beginPath();g.arc(-2,12+dp*14,1.2,0,TAU);g.arc(4,11+((dp+0.5)%1)*14,1,0,TAU);g.fill();}
      if(m.invuln>0&&!G.bossCut){g.strokeStyle='rgba(255,255,255,'+(0.35+0.3*Math.sin(t*20))+')';g.lineWidth=1.4;g.beginPath();g.arc(0,0,20,0,TAU);g.stroke();}
      if(m.tele>0.05)mobGlow(g,0,0,28,'#ffffff',m.tele*0.35);
      if(m.dieK>0){olLight(g,(g)=>{g.strokeStyle='rgba(255,255,255,'+(0.5+0.5*m.dieK)+')';g.lineWidth=0.8+m.dieK*1.5;g.beginPath();
        for(let k=0;k<6+Math.floor(m.dieK*8);k++){const a=k*2.4;g.moveTo(Math.cos(a)*3,Math.sin(a)*3);g.lineTo(Math.cos(a+0.3)*8,Math.sin(a+0.3)*8);g.lineTo(Math.cos(a)*13*Math.min(1,0.4+m.dieK),Math.sin(a)*13*Math.min(1,0.4+m.dieK));}g.stroke();});}
      break;}

    case 'h_hound':{
      /* адская гончая: поджарый пёс-волк с обсидиановыми шипами, огненной гривой и хвостом-плетью;
         рысь диагональными парами лап, приседание перед прыжком, вытянутый прыжок */
      const lp=m.state==='leap',wu=m.state==='windup'?Math.min(1,m.tele):0,run=Math.abs(m.vx)>8&&!lp;
      const ph=m.anim*15,br=Math.sin(t*3+m.phase);
      const crouch=wu*3.2,bodyY=-2+crouch+(run?-Math.abs(Math.sin(ph))*1.2:br*0.25);
      const tilt=lp?(m.vy<0?-0.18:0.14):wu*0.12;
      /* двухзвенная лапа с суставом: бедро -> голень -> лапа на земле */
      const leg=(hx,hy,fx,fy,l1,l2,back,w,col)=>{const dx=fx-hx,dy=fy-hy,d=Math.min(l1+l2-0.01,Math.hypot(dx,dy)),a=Math.atan2(dy,dx);
        const c=Math.acos(clamp((l1*l1+d*d-l2*l2)/(2*l1*d),-1,1)),ka=a+(back?c:-c),kx=hx+Math.cos(ka)*l1,ky=hy+Math.sin(ka)*l1;
        const ex=hx+Math.cos(a)*d,ey=hy+Math.sin(a)*d;
        g.strokeStyle=col;g.lineCap='round';g.lineJoin='round';g.lineWidth=w*1.25;g.beginPath();g.moveTo(hx,hy);g.lineTo(kx,ky);g.stroke();
        g.lineWidth=w*0.66;g.beginPath();g.moveTo(kx,ky);g.lineTo(ex,ey);g.stroke();
        g.fillStyle=col;g.beginPath();g.arc(kx,ky,w*0.5,0,TAU);g.fill();
        g.fillStyle=col;g.beginPath();g.ellipse(ex+1,ey-0.4,w*0.62,w*0.38,0,0,TAU);g.fill();
        g.fillStyle='#e8dcc8';for(let q=0;q<2;q++){g.beginPath();g.moveTo(ex+1.8+q*0.9,ey-0.6);g.lineTo(ex+3.2+q*0.9,ey+0.6);g.lineTo(ex+1.6+q*0.9,ey+0.4);g.fill();}};
      const foot=(baseX,off,stride)=>{if(lp)return null;if(!run)return [baseX,FY];const p=ph+off;return [baseX+Math.sin(p)*stride,FY-Math.max(0,Math.cos(p))*3.2];};
      const dark=shadeHex(c1,-0.28);
      g.save();g.translate(0,bodyY);g.rotate(tilt);
      /* хвост-плеть с языком пламени */
      {const sw2=Math.sin(t*(run?9:4)+m.phase)*(run?3:2),tx=-24,ty=-12+sw2-(wu*3);
        g.strokeStyle=c1;g.lineWidth=2.4;g.lineCap='round';g.beginPath();g.moveTo(-13,-6);g.bezierCurveTo(-18,-8,-20,-4+sw2*0.5,tx,ty);g.stroke();
        olLight(g,(g)=>{const fl=1+Math.sin(t*15)*0.15;g.fillStyle='rgba(255,120,30,.9)';g.beginPath();g.moveTo(tx+1.5,ty+1.5);g.quadraticCurveTo(tx-4*fl,ty-1,tx-3,ty-7*fl);g.quadraticCurveTo(tx+1,ty-3,tx+1.5,ty+1.5);g.fill();
          g.fillStyle='rgba(255,230,140,.9)';g.beginPath();g.ellipse(tx-0.8,ty-1.6,1,2,-0.4,0,TAU);g.fill();});}
      /* дальние лапы (темнее) */
      {const fr=foot(9,Math.PI,4.5),bk=foot(-10,0,4.5);
        if(lp){leg(8,-1-bodyY,20,-2-bodyY,5.5,5.5,false,3,dark);leg(-9,-1-bodyY,-22,2-bodyY,6,6,true,3.4,dark);}
        else{leg(8,-1,fr[0],fr[1]-bodyY,5.8,6.4,false,3,dark);leg(-9,-1,bk[0]-1,bk[1]-bodyY,6.2,6.8,true,3.4,dark);}}
      /* туловище: глубокая грудь, поджарый живот, выгнутая спина */
      g.beginPath();g.moveTo(-14,-6);g.quadraticCurveTo(-12,-11.5,-4,-10.6);g.quadraticCurveTo(4,-12.6,10,-11.2);g.quadraticCurveTo(14,-9.6,14,-5);
      g.quadraticCurveTo(14,1.6,8,2.6);g.quadraticCurveTo(2,1,-4,0.2);g.quadraticCurveTo(-10,1.6,-13.6,-1);g.closePath();mobPath(g,c1,2,-6,14);
      /* мускулистые бедро и лопатка */
      g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=0.9;g.beginPath();g.moveTo(-5.6,-8.6);g.quadraticCurveTo(-4.2,-3,-8,0.4);g.moveTo(6.4,-9.4);g.quadraticCurveTo(5.4,-4,7.4,1.6);g.stroke();
      g.strokeStyle='rgba(255,220,200,.10)';g.lineWidth=1.1;g.beginPath();g.moveTo(-12.4,-7.6);g.quadraticCurveTo(-8,-10.6,-3,-10);g.moveTo(5,-11.2);g.quadraticCurveTo(9,-11.4,12.4,-9.4);g.stroke();
      /* тлеющие трещины-рёбра */
      olLight(g,(g)=>{const gw=0.55+0.45*Math.sin(t*5+m.phase);g.strokeStyle='rgba(255,'+(110+70*gw|0)+',40,'+(0.45+0.4*gw)+')';g.lineWidth=0.9;g.lineCap='round';
        for(let k=0;k<3;k++){g.beginPath();g.moveTo(-1+k*2.6,-8.4);g.quadraticCurveTo(-2.4+k*2.6,-4.6,-1+k*2.6,-1.2);g.stroke();}});
      /* обсидиановые шипы по хребту */
      g.fillStyle=shadeHex(c2,-0.45);for(let k=0;k<6;k++){const sx=-10+k*3.8,by=-10.6-Math.sin((k/5)*Math.PI)*1.2,hh=2.4+(k%2)*1.6+Math.sin((k/5)*Math.PI)*1.4;
        g.beginPath();g.moveTo(sx-1.4,by+0.6);g.lineTo(sx+0.9,by-hh);g.lineTo(sx+2,by+0.6);g.closePath();g.fill();}
      /* огненная грива на загривке */
      olLight(g,(g)=>{for(let k=0;k<6;k++){const fx=0.5+k*1.45,fh=3.4+Math.sin(t*13+k*1.3)*1.5+(m.haste>0?2:0);
        g.fillStyle=k%2?'rgba(255,205,90,.85)':'rgba(255,90,20,.8)';g.beginPath();g.moveTo(fx-1.6,-10.8-k*0.12);g.quadraticCurveTo(fx-2.8,-13-fh*0.4,fx-2.4,-11.4-fh);g.quadraticCurveTo(fx+0.4,-13,fx+1.6,-10.8-k*0.12);g.fill();}});
      /* ближние лапы */
      {const fr=foot(10,0,4.5),bk=foot(-9,Math.PI,4.5);
        if(lp){leg(10,-1-bodyY*0,23,-4,5.5,5.5,false,3.4,c1);leg(-8,-1,-21,4,6,6,true,3.8,c1);}
        else{leg(10,-1,fr[0]+1,fr[1]-bodyY,5.8,6.4,false,3.4,c1);leg(-8,-1,bk[0],bk[1]-bodyY,6.2,6.8,true,3.8,c1);}}
      /* шея и голова: при замахе опущена, пасть раскрыта */
      g.save();g.translate(14,-8.6+wu*1.6);g.rotate((lp?-0.22:0)+wu*0.22+(run?Math.sin(ph*2)*0.04:br*0.03));
      g.beginPath();g.ellipse(0.4,-0.6,5.2,3.8,-0.55,0,TAU);mobPath(g,c1,0,0,6,true);
      /* череп и вытянутая волчья морда */
      mobBlob(g,4,-2.4,4.8,4.2,c1);
      g.beginPath();g.moveTo(5.4,-5.6);g.quadraticCurveTo(10,-5.2,15.6,-2.6);g.quadraticCurveTo(16.6,-1.6,15.6,-0.6);g.lineTo(7.4,0.8);g.quadraticCurveTo(5.4,0.4,5,-1.6);g.closePath();mobPath(g,c1,9,-2.4,7);
      g.fillStyle='rgba(255,255,255,.08)';g.beginPath();g.moveTo(6,-5);g.quadraticCurveTo(10,-4.8,14.6,-2.6);g.lineTo(13.8,-2.2);g.quadraticCurveTo(10,-3.9,6,-4.2);g.closePath();g.fill();
      g.fillStyle='#0a0303';g.beginPath();g.ellipse(15.6,-1.7,1,0.75,0,0,TAU);g.fill();
      /* нижняя челюсть с клыками */
      {const jaw=0.1+wu*0.5+(m.atkT>0?Math.sin((1-m.atkT/0.24)*Math.PI)*0.45:0)+(lp?0.35:0);
        if(jaw>0.2)olLight(g,(g)=>{const gr=g.createRadialGradient(10.5,0.8,0.5,10.5,0.8,6);gr.addColorStop(0,'rgba(255,220,120,'+Math.min(0.85,jaw)+')');gr.addColorStop(1,'rgba(255,80,20,0)');g.fillStyle=gr;g.beginPath();g.arc(10.5,0.8,6,0,TAU);g.fill();});
        g.save();g.translate(5.6,0.2);g.rotate(jaw);
        g.beginPath();g.moveTo(0,0);g.lineTo(9,0.4);g.quadraticCurveTo(9.6,1.6,8.2,1.9);g.lineTo(1,2.2);g.closePath();mobPath(g,dark,4,1,5);
        g.fillStyle='#f0e6d0';for(let q=0;q<3;q++){g.beginPath();g.moveTo(3.4+q*2,0.3);g.lineTo(4+q*2,-1.3);g.lineTo(4.6+q*2,0.3);g.fill();}g.restore();
        g.fillStyle='#f0e6d0';for(let q=0;q<3;q++){g.beginPath();g.moveTo(9+q*2,-0.1+q*0.1);g.lineTo(9.6+q*2,1.5+(q===0?0.7:0));g.lineTo(10.2+q*2,0+q*0.1);g.fill();}}
      /* острое ухо и загнутый назад рог */
      g.beginPath();g.moveTo(2.4,-5.4);g.lineTo(0.4,-10.6);g.lineTo(5.2,-6.2);g.closePath();mobPath(g,shadeHex(c1,0.05),2.6,-7,4);
      g.strokeStyle=shadeHex(c2,-0.2);g.lineWidth=1.8;g.lineCap='round';g.beginPath();g.moveTo(5,-5.6);g.quadraticCurveTo(3,-10.4,-2.6,-10.8);g.stroke();
      g.strokeStyle='rgba(255,230,200,.25)';g.lineWidth=0.6;g.beginPath();g.moveTo(4.6,-6.6);g.quadraticCurveTo(3,-9.8,-1.6,-10.2);g.stroke();
      /* горящий глаз со следом */
      olLight(g,(g)=>{g.fillStyle='rgba(255,140,30,.18)';g.beginPath();g.moveTo(9.4,-3.6);g.lineTo(5.6,-4.4-(run?0.8:0));g.lineTo(5.8,-3.4);g.closePath();g.fill();
        softGlow(g,9.4,-3.3,2.8,'#ff9a30',0.4);g.fillStyle='#ffe070';g.beginPath();g.ellipse(9.4,-3.3,1.4,0.95,-0.2,0,TAU);g.fill();g.fillStyle='#3a0a00';g.beginPath();g.ellipse(9.9,-3.2,0.45,0.75,0,0,TAU);g.fill();});
      g.restore();
      g.restore();
      if(m.haste>0)mobGlow(g,0,-4,24,'#ff5a1a',0.18);
      break;}
    case 'h_ashgolem':{
      /* пепельный голем: глыбы из пепельного камня на тлеющем ядре, руки из валунов, щель-забрало */
      const wind=m.state==='windup'?m.tele:0,wk2=Math.abs(m.vx)>6?Math.sin(m.anim*6):0,gw=0.5+0.5*Math.sin(t*3);
      const slab=(pts,col,cx,cy,r)=>{g.beginPath();pts.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.closePath();mobPath(g,col,cx,cy,r);};
      /* ноги-тумбы */
      for(const [sd,ph] of [[-1,wk2],[1,-wk2]]){g.save();g.translate(sd*5.5,8);g.rotate(ph*0.25);
        slab([[-3.6,0],[3.6,0],[4.2,7],[3,FY-8-1],[-3.6,FY-8-1],[-4.2,7]],shadeHex(c1,sd>0?0.05:-0.12),0,4,6);
        g.fillStyle=shadeHex(c1,-0.35);g.fillRect(-4,FY-8-2.6,8.4,1.6);g.restore();}
      /* задняя рука */
      const arm=(sd,front)=>{const raise=wind*1.5,a=sd*(0.25+raise*0.9)+(front?0.08:-0.1)+(Math.abs(m.vx)>6?Math.sin(m.anim*6+(front?0:Math.PI))*0.25:0);
        g.save();g.translate(sd*12,-8);g.rotate(a);const col=shadeHex(c1,front?0:-0.25);
        slab([[-3,-2],[3,-2.5],[3.6,5],[-3.4,5.5]],col,0,2,5);
        slab([[-3.2,5.5],[3.4,5],[3.2,10],[-3,10.4]],shadeHex(col,-0.08),0,8,4);
        /* кулак-валун */
        slab([[-5,10],[0,8.6],[5,10],[5.6,15],[1,17.4],[-4.6,16]],shadeHex(col,0.08),0,13,6);
        g.strokeStyle='rgba(255,'+(110+60*gw|0)+',40,'+(0.55+0.3*gw+wind*0.3)+')';g.lineWidth=0.9;g.beginPath();g.moveTo(-2,12);g.lineTo(1,14);g.lineTo(3,12);g.stroke();
        g.restore();};
      arm(-1,false);
      /* туловище: три пластины */
      slab([[-13,-9],[-2,-14],[1,-6],[-3,4],[-12,6]],shadeHex(c1,-0.08),-6,-4,12);
      slab([[0,-14],[11,-12],[14,-2],[9,6],[0,5],[2,-5]],c1,6,-3,12);
      slab([[-11,5],[0,4],[10,6],[8,11],[-9,11]],shadeHex(c1,-0.2),0,8,10);
      /* тлеющее ядро и трещины */
      mobGlow(g,-0.5,-3,10,'#ff6a1a',0.35+0.35*gw+wind*0.4);
      g.strokeStyle='rgba(255,'+(100+70*gw|0)+',30,'+(0.75+0.2*gw)+')';g.lineWidth=1.4;g.lineCap='round';g.lineJoin='round';
      g.beginPath();g.moveTo(-1,-13);g.lineTo(1,-6);g.lineTo(-2.6,4);g.moveTo(1,-6);g.lineTo(7,-3);g.lineTo(9,5);g.moveTo(-2.6,4);g.lineTo(-9,5.6);g.stroke();
      olLight(g,(g)=>{g.fillStyle='rgba(255,190,90,'+(0.5+0.4*gw)+')';g.beginPath();g.arc(-0.5,-3,2.4+wind*2,0,TAU);g.fill();});
      /* пепельные крапинки */
      g.fillStyle='rgba(255,255,255,.08)';for(const [x,y] of [[-8,-6],[6,-9],[10,-1],[-6,8],[4,8]]){g.beginPath();g.arc(x,y,0.9,0,TAU);g.fill();}
      /* голова-глыба с забралом */
      slab([[-5,-14],[-6,-19],[-2,-22.5],[5,-22],[7,-17],[5,-13.5]],shadeHex(c1,-0.05),0,-18,7);
      g.fillStyle='#120806';g.fillRect(-3.8,-19.2,9,2.4);
      g.fillStyle='rgba(255,'+(130+80*gw|0)+',40,1)';g.fillRect(-3,-18.6,2.8,1.2);g.fillRect(1.6,-18.6,2.8,1.2);mobGlow(g,1,-18,7,'#ff7a2a',0.6);
      arm(1,true);
      if(settings.quality!=='low'&&Math.random()<0.15)spawnPart(m.x+rnd(-14,14),m.y-m.h*rnd(0.3,0.9),rnd(-10,10),rnd(-20,10),1.2,'#7a706a',2.4,20);
      break;}
    case 'h_emberbat':{

      const fl=Math.sin(t*16+m.phase);
      for(const sd of [-1,1]){g.save();g.scale(sd,1);g.translate(3,-2);g.rotate(-fl*0.7);
        g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(7,-10,13,-8);g.lineTo(19,-9);g.quadraticCurveTo(17,-3,19,2);g.quadraticCurveTo(15,-1,13,3);g.quadraticCurveTo(9,0,6,4);g.quadraticCurveTo(3,1,0,3);g.closePath();
        mobPath(g,c1,10,-3,10,true);
        olLight(g,(g)=>{g.strokeStyle='rgba(255,'+(110+Math.floor(60*Math.sin(t*6)))+',40,.8)';g.lineWidth=1;g.beginPath();g.moveTo(0,0);g.lineTo(13,-8);g.lineTo(19,-9);g.moveTo(13,-8);g.lineTo(13,3);g.moveTo(13,-8);g.lineTo(6,4);g.stroke();});
        g.restore();}
      mobBlob(g,0,0,5.6,5.6,c1);
      olLight(g,(g)=>{g.strokeStyle='rgba(255,140,40,.8)';g.lineWidth=0.8;g.beginPath();g.moveTo(-3,2);g.lineTo(-1,0);g.lineTo(1,2.6);g.lineTo(3,0.4);g.stroke();});
      hkMask(g,0.6,-1,7.4,7,'#ff8a20',{horns:true,col:'#d8c8b0'});
      mobGlow(g,0,0,13,'#ff6a1a',0.3);
      break;}
    case 'h_ashwraith':{

      const wv=t*3+m.phase,grab=m.state==='grab';
      /* рваный пепельный саван */
      g.beginPath();g.moveTo(-9,-8);g.quadraticCurveTo(-11,-21,0,-21);g.quadraticCurveTo(11,-21,9,-8);
      for(let k=0;k<=7;k++){const xx=9-k*18/7,yy=13+Math.sin(wv+k*1.4)*3+(k%2?3.6:-1);g.lineTo(xx+Math.sin(wv*0.7+k)*1.5,yy);}
      g.closePath();{const gr=g.createLinearGradient(0,-21,0,16);gr.addColorStop(0,shadeHex(c1,0.08));gr.addColorStop(0.6,c1);gr.addColorStop(1,hexA(c2,0.05));g.fillStyle=gr;g.fill();}
      for(let k=0;k<6;k++){const ph=(t*0.6+k*0.17)%1;g.fillStyle='rgba(150,140,130,'+(0.5*(1-ph))+')';g.beginPath();g.arc(-8+k*3+Math.sin(t+k)*2,8+ph*12,1.6+ph*2,0,TAU);g.fill();}
      /* капюшон и маска */
      g.fillStyle=shadeHex(c1,-0.3);g.beginPath();g.moveTo(-8,-6);g.quadraticCurveTo(-9,-22,1,-23);g.quadraticCurveTo(10,-22,9,-6);g.quadraticCurveTo(1,-9,-8,-6);g.fill();
      hkMask(g,1,-12,12,13,'#ff8a3a',{crack:true});
      {const reach=grab?m.tele*10:0;g.strokeStyle=shadeHex(c1,0.15);g.lineWidth=2.4;g.lineCap='round';
        g.beginPath();g.moveTo(7,-5);g.quadraticCurveTo(13+reach,-3+Math.sin(wv)*2,15+reach*1.5,3);g.stroke();
        g.strokeStyle='#ece4d6';g.lineWidth=0.9;for(let k=-1;k<=1;k++){g.beginPath();g.moveTo(15+reach*1.5,3);g.lineTo(18+reach*1.5,4+k*2);g.stroke();}}
      break;}
    case 'h_fireimp':{
      /* бес: прыгучая походка, хвост и крылья, замах огнешаром за голову, бросок, исчезновение в пламени */
      const cast=m.castT>0?1-m.castT/0.42:0,thr=m.throwT>0?m.throwT/0.32:0,moving=Math.abs(m.vx)>8;
      const hopS=Math.sin(m.hopPh||0),hop=moving?Math.abs(hopS)*4.2:(1+Math.sin(t*3+m.phase))*0.8;
      const bo=m.blinkOut>0?1-m.blinkOut/0.28:0,bi=m.blinkIn>0?m.blinkIn/0.3:0,vis=1-Math.max(bo,bi);
      if(bo>0||bi>0)olLight(g,(g)=>{const fh=10+26*Math.max(bo,bi);const gr=g.createLinearGradient(0,FY,0,FY-fh*1.6);gr.addColorStop(0,'rgba(255,200,80,.9)');gr.addColorStop(1,'rgba(255,60,10,0)');
        g.fillStyle=gr;g.beginPath();g.moveTo(-7,FY);g.quadraticCurveTo(-9,FY-fh,Math.sin(t*20)*2,FY-fh*1.6);g.quadraticCurveTo(9,FY-fh,7,FY);g.fill();});
      if(vis<=0.02)break;
      g.save();g.translate(0,FY);g.scale((0.35+0.65*vis)*(1+Math.sin(t*40)*0.08*(1-vis)),vis);g.translate(0,-FY);
      g.translate(0,-hop);
      g.rotate(thr*0.28-cast*0.16+(moving?hopS*0.05:0));
      /* хвост с огоньком — плавно хлещет */
      const tw=Math.sin(t*4.5+m.phase)*3.5;
      g.strokeStyle=c2;g.lineWidth=1.8;g.lineCap='round';g.beginPath();g.moveTo(-5,5);g.bezierCurveTo(-11,9,-16,4+tw,-14,-3+tw*0.6);g.stroke();
      olLight(g,(g)=>{const fx=-14,fy=-3+tw*0.6,fl=1+Math.sin(t*16)*0.15;g.fillStyle='#ffb030';g.beginPath();g.moveTo(fx-1.6,fy+1);g.quadraticCurveTo(fx-3*fl,fy-5*fl,fx+0.5,fy-9*fl);g.quadraticCurveTo(fx+1.4,fy-4,fx+1.6,fy+1);g.fill();
        g.fillStyle='#fff0a0';g.beginPath();g.ellipse(fx,fy-1.5,0.9,1.8,0,0,TAU);g.fill();});
      /* перепончатые крылья: медленно в покое, часто при прыжках и замахе */
      const fr=moving||cast>0?14:6,fw=Math.sin(t*fr+m.phase)*(moving?0.5:0.3)-cast*0.4;
      for(const [side,sh] of [[-1,-0.25],[1,0.05]]){g.save();g.translate(-2,-7);g.rotate(-0.55+fw*(side<0?1:0.8)+(side<0?-0.2:0.15));g.scale(side<0?1:0.82,1);
        g.beginPath();g.moveTo(0,0);g.lineTo(-12,-10);g.quadraticCurveTo(-11,-5,-15,-2);g.quadraticCurveTo(-10,-1,-12,4);g.quadraticCurveTo(-7,2,-3,3);g.closePath();
        mobPath(g,shadeHex(c2,sh),-6,-3,8);g.strokeStyle='rgba(30,5,0,.5)';g.lineWidth=0.6;g.beginPath();g.moveTo(0,0);g.lineTo(-15,-2);g.moveTo(0,0);g.lineTo(-12,4);g.stroke();g.restore();}
      /* ноги: подтягиваются в прыжке, мягко пружинят при приземлении */
      const air=moving?Math.max(0,hopS*hopS):0,legA=moving?0.25+air*0.7:0.15;
      mobLeg(g,-3,6,legA,4.4,0.5+air*1.2,4.6,2.4,shadeHex(c2,-0.1));mobLeg(g,3,6,-legA*0.6,4.4,0.5+air*1.2,4.6,2.4,c2);
      mobBlob(g,0,1,6.6,7.6,c1);
      olLight(g,(g)=>{g.fillStyle='rgba(255,150,40,'+(0.35+0.25*cast)+')';g.beginPath();g.ellipse(1,3,3,4,0,0,TAU);g.fill();});
      /* задняя рука — противовес */
      mobLeg(g,-3,-3,0.7-cast*0.6+thr*0.4,4.4,0.5,3.8,2,shadeHex(c1,-0.15));
      /* голова-маска: наклон за броском, ухмылка шире при замахе */
      g.save();g.translate(1,-10);g.rotate(thr*0.15-cast*0.1+Math.sin(t*2.5+m.phase)*0.04);
      mobBlob(g,0,0,6,5.6,c1);
      hkMask(g,1,-0.4,10.4,10,'#ffcc33',{horns:true,col:'#e8d8c0'});
      g.fillStyle='#2a0000';g.beginPath();g.moveTo(-1.4,4.6);g.quadraticCurveTo(1.4,6.4+cast*1.2,4.2,4.4);g.lineTo(3.6,3.8);g.quadraticCurveTo(1.4,5,-1.2,4);g.closePath();g.fill();
      g.restore();
      /* рука с огнешаром: замах за голову -> резкий бросок вперёд */
      {const aA=cast>0?1.2+cast*2.9:thr>0?3.8-(1-thr)*2.4:1.15+Math.sin(t*3+m.phase)*0.08;
        const e=mobLeg(g,5,-3,aA,4.6,cast>0?-0.4:0.6,4,2.2,c1);
        const bR=cast>0?2+cast*4.2:(thr>0?0:1.4+Math.sin(t*9)*0.4);
        if(bR>0.3)olLight(g,(g)=>{const ex=e[0]+1,ey=e[1]-1.5;const gr=g.createRadialGradient(ex,ey,0.4,ex,ey,bR*2.2);gr.addColorStop(0,'rgba(255,245,180,.98)');gr.addColorStop(0.45,'rgba(255,150,40,.85)');gr.addColorStop(1,'rgba(255,60,10,0)');
          g.fillStyle=gr;g.beginPath();g.arc(ex,ey,bR*2.2,0,TAU);g.fill();});}
      g.restore();
      break;}
    case 'h_worm':{break;}
    case 'h_leech':{

      const wv=t*6+m.phase;
      /* гладкое сегментированное тело-минога */
      const pts=[];for(let k=0;k<7;k++)pts.push([-15+k*5,Math.sin(wv-k*0.9)*1.6+2]);
      g.beginPath();g.moveTo(pts[0][0],pts[0][1]);for(let k=0;k<7;k++){const r=k===0?1.5:3.4+Math.min(k,4)*0.4;g.lineTo(pts[k][0],pts[k][1]-r);}
      for(let k=6;k>=0;k--){const r=k===0?1.5:3+Math.min(k,4)*0.4;g.lineTo(pts[k][0],pts[k][1]+r);}g.closePath();mobPath(g,c1,0,0,16);
      g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=0.8;for(let k=1;k<6;k++){g.beginPath();g.moveTo(pts[k][0],pts[k][1]-4);g.lineTo(pts[k][0]-0.6,pts[k][1]+4);g.stroke();}
      g.fillStyle='rgba(255,90,110,.5)';for(let k=1;k<6;k++){g.beginPath();g.arc(pts[k][0]+1,pts[k][1]-2.4,0.7,0,TAU);g.fill();}
      /* круглая присоска с кольцами зубов */
      g.save();g.translate(17,pts[6][1]);
      g.beginPath();g.ellipse(0,0,4.6,5.6,0,0,TAU);mobPath(g,shadeHex(c1,0.1),0,0,6);
      g.fillStyle='#1a0006';g.beginPath();g.ellipse(1,0,3,4,0,0,TAU);g.fill();
      g.strokeStyle='#ffe0e0';g.lineWidth=0.7;for(let r=0;r<2;r++)for(let k=0;k<8;k++){const a=k/8*TAU+t*(r?-2:2);g.beginPath();g.moveTo(1+Math.cos(a)*(1+r*1.2),Math.sin(a)*(1.3+r*1.5));g.lineTo(1+Math.cos(a)*(2+r*1.2),Math.sin(a)*(2.6+r*1.4));g.stroke();}
      g.restore();
      /* маленькие слепые глаза-огоньки */
      for(const ex of [12,9.6]){mobGlow(g,ex,pts[6][1]-3.6,3,'#ff2a3a',0.7);g.fillStyle='#ff5a6a';g.beginPath();g.arc(ex,pts[6][1]-3.6,0.8,0,TAU);g.fill();}
      if(m.latch>0){mobGlow(g,0,0,22,'#ff2a3a',0.5);g.fillStyle='rgba(220,10,30,.7)';for(let k=0;k<3;k++){const ph=(t*2+k*0.33)%1;g.beginPath();g.arc(16-ph*28,2-Math.sin(ph*3)*3,1.8,0,TAU);g.fill();}}
      break;}
    case 'h_fleshgolem':{
      const wind=m.state==='windup'?m.tele:0,hook=m.state==='hook'?m.tele:0;
      mobLeg(g,-5,8,0.1+sw*0.4,5,0.3,5,6,shadeHex(c2,0.2));mobLeg(g,5,8,-0.1-sw*0.4,5,0.3,5,6,shadeHex(c2,0.25));
      g.beginPath();g.moveTo(-13,-6);g.quadraticCurveTo(-16,6,-8,10);g.lineTo(9,10);g.quadraticCurveTo(16,4,13,-8);g.quadraticCurveTo(4,-16,-6,-13);g.closePath();mobPath(g,c1,0,-1,15);
      g.strokeStyle='#2a0608';g.lineWidth=1.2;for(const [x1,y1,x2,y2] of [[-8,-8,-3,4],[4,-10,8,2],[-10,2,4,6]]){g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();
        const n=5;for(let k=1;k<n;k++){const xx=x1+(x2-x1)*k/n,yy=y1+(y2-y1)*k/n;g.beginPath();g.moveTo(xx-1.5,yy-1.5);g.lineTo(xx+1.5,yy+1.5);g.stroke();}}
      g.fillStyle='#d8ccb0';for(const [bx,by] of [[-9,-11],[10,-11],[-12,0]]){g.beginPath();g.moveTo(bx,by);g.lineTo(bx+(bx>0?3:-3),by-5);g.lineTo(bx+(bx>0?1:-1),by+1);g.fill();}
      g.fillStyle='rgba(255,180,190,.2)';g.beginPath();g.ellipse(2,0,6,7,0,0,TAU);g.fill();
      {const e=mobLeg(g,-12,-6,-1.0-wind*1.2,6,-0.5,6,5,shadeHex(c1,-0.15));g.fillStyle=shadeHex(c1,-0.2);g.beginPath();g.arc(e[0],e[1],4,0,TAU);g.fill();}
      {const e=mobLeg(g,12,-6,1.0+wind*1.2+hook*0.8,6,0.5-hook*0.5,6,5,c1);
        g.strokeStyle='#8a8e98';g.lineWidth=2.4;g.beginPath();g.arc(e[0]+2,e[1]+2,4,-1.2,2);g.stroke();
        g.strokeStyle='#5a5a62';g.lineWidth=1.2;for(let k=0;k<4;k++){g.beginPath();g.ellipse(e[0]-2-k*2,e[1]+3+k*2,1,1.6,0.6,0,TAU);g.stroke();}}
      mobBlob(g,2,-16,5,4.4,shadeHex(c1,0.05));
      g.fillStyle='#1a0004';g.fillRect(-1,-15,7,2.6);g.fillStyle='#e8e0d0';for(let k=0;k<4;k++)g.fillRect(-0.5+k*1.8,-15,1,1.4);
      mobEye(g,m,4.5,-18,1.3,{white:'#ffe066',iris:'#5a0000',ir:0.5});mobEye(g,m,0.5,-18.5,0.9,{white:'#ffe066',iris:'#5a0000',ir:0.5});
      break;}
    case 'h_bloodslime':{

      const sq=clamp(-m.vy/500,-0.4,0.5),p2=1+Math.sin(t*4+m.phase)*0.05;
      g.save();g.translate(0,FY);g.scale(p2*(1-sq*0.3),1+sq*0.4);
      const gr=g.createRadialGradient(-4,-14,2,0,-9,16);gr.addColorStop(0,'#ff6a7a');gr.addColorStop(0.45,'#a0101e');gr.addColorStop(1,'#3a0408');
      g.fillStyle=m.hurt>0?'#fff':gr;g.beginPath();g.moveTo(-15,0);g.quadraticCurveTo(-16,-16,0,-19);g.quadraticCurveTo(16,-16,15,0);
      for(let k=0;k<=6;k++)g.lineTo(15-k*5,Math.sin(t*5+k)*1.4+(k%2?1.5:0));g.closePath();g.fill();
      /* внутри плавает череп-ядро */
      g.save();g.globalAlpha*=0.85;g.translate(Math.sin(t*1.3)*2,-9+Math.cos(t*1.7)*1.2);
      g.fillStyle='#e8dcc8';g.beginPath();g.arc(0,0,4.4,0,TAU);g.fill();g.fillRect(-2.6,2.6,5.2,2.6);
      g.fillStyle='#2a0006';g.beginPath();g.ellipse(-1.6,-0.4,1.1,1.5,0,0,TAU);g.ellipse(1.8,-0.4,1.1,1.5,0,0,TAU);g.fill();
      g.restore();mobGlow(g,0,-9,6,'#ff3a4a',0.35);
      g.fillStyle='rgba(255,210,220,.45)';g.beginPath();g.ellipse(-6,-14,3.4,1.8,-0.4,0,TAU);g.fill();
      g.fillStyle='rgba(30,0,6,.6)';for(const [bx,by,br] of [[-8,-5,1.6],[8,-6,1.2],[5,-13,1]]){g.beginPath();g.arc(bx,by,br,0,TAU);g.fill();}
      g.restore();
      g.fillStyle='#ffe0e0';g.beginPath();g.ellipse(6,FY-12,1.4,1.8,0,0,TAU);g.fill();g.fillStyle='#3a0006';g.beginPath();g.arc(6.4,FY-12,0.8,0,TAU);g.fill();
      break;}
    case 'h_demon':{
      const ch=m.state==='charge',sp=m.state==='spin',rage=m.rage||0;
      if(sp){g.save();g.rotate((m.spinA||0)%TAU);for(let k=0;k<2;k++){g.rotate(Math.PI);g.fillStyle='#d8dde8';g.beginPath();g.moveTo(4,-2);g.lineTo(26,-1);g.lineTo(4,2);g.closePath();g.fill();}g.restore();
        g.strokeStyle='rgba(255,90,60,.5)';g.lineWidth=3;g.beginPath();g.arc(0,0,24,0,TAU);g.stroke();}
      {const fw=Math.sin(t*3)*0.25;g.save();g.translate(-5,-10);g.rotate(-0.4+fw);g.beginPath();g.moveTo(0,0);g.lineTo(-15,-13);g.lineTo(-12,-5);g.lineTo(-17,-1);g.lineTo(-10,1);g.lineTo(-13,7);g.lineTo(-2,4);g.closePath();mobPath(g,shadeHex(c2,0.15),-6,-2,10);
        g.strokeStyle=hexA('#ff5a3a',0.5);g.lineWidth=0.8;g.beginPath();g.moveTo(0,0);g.lineTo(-12,-5);g.moveTo(0,0);g.lineTo(-10,1);g.stroke();g.restore();}
      mobLeg(g,-4,7,0.15+sw*0.6,6,0.5,6,4.2,shadeHex(c2,-0.1));mobLeg(g,4,7,-0.15-sw*0.6,6,0.5,6,4.2,c2);
      g.beginPath();g.moveTo(-9,-9);g.quadraticCurveTo(0,-15,10,-9);g.lineTo(8,8);g.quadraticCurveTo(0,10,-7,8);g.closePath();mobPath(g,c1,0,-1,11);
      g.strokeStyle=hexA(shadeHex(c1,-0.45),0.85);g.lineWidth=1;g.beginPath();g.moveTo(0,-9);g.lineTo(0,6);g.moveTo(-5,-3);g.lineTo(5,-3);g.moveTo(-4,1);g.lineTo(4,1);g.moveTo(-4,5);g.lineTo(4,5);g.stroke();
      if(rage>0.2){g.strokeStyle='rgba(255,'+(160-rage*120|0)+',40,'+(0.4+rage*0.5)+')';g.lineWidth=1.2;g.beginPath();g.moveTo(-6,-6);g.lineTo(-2,-2);g.lineTo(-5,3);g.moveTo(5,-7);g.lineTo(2,-1);g.stroke();}
      mobBlob(g,3,-15,5.6,5,c1);
      g.fillStyle='#e8dcc0';for(const [hx,dir] of [[0.5,-1],[5.5,1]]){g.beginPath();g.moveTo(hx-1.5,-18);g.quadraticCurveTo(hx+dir*5,-25,hx+dir*1.5,-30);g.quadraticCurveTo(hx+dir*1.6,-23,hx+1.5,-18);g.closePath();g.fill();}
      hkMask(g,3.6,-15,9.6,9.4,rage>0.5?'#ff3a10':'#ff8a30',{col:'#ddd0bc',crack:rage>0.3});
      g.fillStyle='#1a0000';g.beginPath();g.moveTo(2,-11);g.lineTo(7,-11.2);g.lineTo(6,-9.6);g.lineTo(3,-9.6);g.closePath();g.fill();g.fillStyle='#fff';for(let k=0;k<3;k++){g.beginPath();g.moveTo(2.6+k*1.4,-11.1);g.lineTo(3.2+k*1.4,-10);g.lineTo(3.8+k*1.4,-11.1);g.fill();}
      if(!sp){const raise=m.state==='windup'?m.tele:ch?0.6:0,e=mobLeg(g,7,-7,1.0+raise*1.2,6,0.5-raise*0.5,6,3.6,c1);
        g.fillStyle='#c8ccd8';g.save();g.translate(e[0],e[1]);g.rotate(-0.4-raise);g.beginPath();g.moveTo(0,-1.5);g.lineTo(16,-0.5);g.lineTo(18,1);g.lineTo(0,1.5);g.closePath();g.fill();g.fillStyle='#4a2a1a';g.fillRect(-4,-1.2,4,2.4);g.restore();}
      if(ch||rage>0.6)mobGlow(g,0,0,26,'#ff4010',0.35);
      break;}
    case 'h_priest':{

      g.beginPath();g.moveTo(-8,FY);g.lineTo(-6,-8);g.quadraticCurveTo(0,-13,6,-8);g.lineTo(9,FY);g.closePath();mobPath(g,c1,0,0,14);
      g.fillStyle=shadeHex(c1,-0.3);for(let k=0;k<5;k++){g.beginPath();g.moveTo(-8+k*3.4,FY);g.lineTo(-6.3+k*3.4,FY-3-(k%2)*2);g.lineTo(-4.6+k*3.4,FY);g.fill();}
      g.strokeStyle='#8a1020';g.lineWidth=1.4;g.beginPath();g.moveTo(0,-8);g.lineTo(0,FY-2);g.stroke();
      g.fillStyle='#ece4d6';g.beginPath();g.arc(0,-1,2.6,0,TAU);g.fill();g.fillStyle='#c0142a';g.beginPath();g.arc(0,-1,1.3,0,TAU);g.fill();mobGlow(g,0,-1,5,'#ff2a3a',0.5);
      /* высокий капюшон и маска-слеза */
      g.beginPath();g.moveTo(-7,-7);g.quadraticCurveTo(-6,-22,0,-28);g.quadraticCurveTo(6,-22,7,-7);g.closePath();mobPath(g,shadeHex(c1,-0.1),0,-16,9);
      g.fillStyle='#0a0004';g.beginPath();g.ellipse(1,-13,4.4,6,0,0,TAU);g.fill();
      hkMask(g,1.4,-12.4,7.6,9.6,'#ff2a3a',{pupil:'#ffd0d0'});
      g.fillStyle='rgba(192,20,42,.9)';g.beginPath();g.moveTo(-0.6,-11);g.quadraticCurveTo(-1,-7,-0.4,-6);g.quadraticCurveTo(0.2,-7.4,-0.2,-11);g.fill();
      {const cast=m.tele,e=mobLeg(g,5,-6,1.1+cast*0.9,5,0.4,5,2.4,c1);
        g.strokeStyle='#2a1a14';g.lineWidth=1.8;g.beginPath();g.moveTo(e[0],e[1]+10);g.lineTo(e[0]+1,e[1]-14);g.stroke();
        g.fillStyle='#ece4d6';g.beginPath();g.arc(e[0]+1,e[1]-16,3.4,0,TAU);g.fill();g.fillStyle='#1a1410';g.fillRect(e[0]-0.5,e[1]-17,1,1);g.fillRect(e[0]+2,e[1]-17,1,1);
        g.strokeStyle='#ece4d6';g.lineWidth=1;g.beginPath();g.moveTo(e[0]-2,e[1]-18);g.quadraticCurveTo(e[0]-5,e[1]-22,e[0]-3,e[1]-25);g.moveTo(e[0]+4,e[1]-18);g.quadraticCurveTo(e[0]+7,e[1]-22,e[0]+5,e[1]-25);g.stroke();
        mobGlow(g,e[0]+1,e[1]-16,7+cast*6,'#ff2a3a',0.4+cast*0.5);}
      for(let k=0;k<3;k++){const a=t*1.6+k*TAU/3;g.fillStyle='rgba(220,20,40,.85)';g.beginPath();g.arc(Math.cos(a)*12,-4+Math.sin(a)*4,1.6,0,TAU);g.fill();}
      break;}
    case 'h_scorpion':{

      for(let k=0;k<4;k++){const lx=-8+k*5,ph=sw*(k%2?1:-1)*0.5;mobLeg(g,lx,3,0.6+ph,5,-1.2,6,1.6,shadeHex(c2,-0.1));}
      /* сегментированный хвост дугой */
      const tl=m.tele;const segs=[[-11,-2],[-16,-7],[-18,-13],[-16,-19],[-11,-23-tl*3],[-5,-23+tl*3],[-1,-19+tl*5]];
      g.strokeStyle=shadeHex(c1,-0.2);g.lineWidth=6;g.lineCap='round';g.lineJoin='round';g.beginPath();g.moveTo(segs[0][0],segs[0][1]);for(const q of segs)g.lineTo(q[0],q[1]);g.stroke();
      for(let k=1;k<segs.length;k++){const [sx,sy]=segs[k],r=4.4-k*0.35;mobBlob(g,sx,sy,r,r*0.9,k%2?c1:shadeHex(c1,-0.08));g.fillStyle='rgba(255,255,200,.12)';g.fillRect(sx-r*0.5,sy-r*0.6,r,0.8);}
      const tx=segs[6][0],ty=segs[6][1];
      g.fillStyle='#2a2a10';g.beginPath();g.ellipse(tx+2,ty+2,3.4,2.6,0.6,0,TAU);g.fill();
      g.fillStyle='#e8f080';g.beginPath();g.moveTo(tx+3,ty+3);g.quadraticCurveTo(tx+9,ty+5,tx+8,ty+10);g.quadraticCurveTo(tx+6,ty+6,tx+2,ty+5);g.closePath();g.fill();
      mobGlow(g,tx+6,ty+7,8,'#c8ff40',0.5+tl*0.5);
      /* панцирь */
      g.beginPath();g.moveTo(-12,1);g.quadraticCurveTo(-11,-8,0,-8);g.quadraticCurveTo(11,-8,12,0);g.quadraticCurveTo(0,6,-12,1);g.closePath();mobPath(g,c1,0,-2,11);
      g.strokeStyle='rgba(200,230,80,.35)';g.lineWidth=0.9;for(let k=-2;k<=2;k++){g.beginPath();g.moveTo(k*3.8,-7.4);g.lineTo(k*3.6,3.6);g.stroke();}
      for(let k=0;k<4;k++){const lx=-7+k*5,ph=sw*(k%2?-1:1)*0.5;mobLeg(g,lx,3,-0.5-ph,5,1.1,6,1.8,c2);}
      /* клешня */
      {const e=mobLeg(g,9,-1,1.5,5,0.4,5,2.6,c1);const op=Math.sin(t*4)*0.3+0.35+tl*0.3;
        g.save();g.translate(e[0]+3,e[1]-1);g.beginPath();g.ellipse(0,0,5,3.2,-0.3,0,TAU);mobPath(g,c1,0,0,5);
        g.beginPath();g.moveTo(3,-2);g.quadraticCurveTo(9,-5-op*3,10,-1);g.lineTo(4,-0.6);g.closePath();mobPath(g,shadeHex(c1,0.1),6,-2,4);
        g.beginPath();g.moveTo(3,1.4);g.quadraticCurveTo(9,3+op*3,10,1);g.lineTo(4,0.4);g.closePath();mobPath(g,shadeHex(c1,-0.05),6,2,4);g.restore();}
      /* глаза-бусины */
      for(const [ex,ey] of [[7.6,-5],[5,-5.6],[9.4,-3.6]]){g.fillStyle='#07040a';g.beginPath();g.arc(ex,ey,1.1,0,TAU);g.fill();mobGlow(g,ex,ey,3,'#e8ff60',0.6);g.fillStyle='#f0ff90';g.fillRect(ex-0.3,ey-0.5,0.7,0.7);}
      break;}
    case 'h_gasbag':{

      const pulse=1+Math.sin(t*2.4+m.phase)*0.06+(m.state==='swell'?m.tele*0.3:0);
      /* щупальца-трубки */
      for(let k=-3;k<=3;k++){g.strokeStyle=hexA(shadeHex(c2,k%2?0:0.15),0.95);g.lineWidth=2.2-Math.abs(k)*0.2;g.lineCap='round';g.beginPath();g.moveTo(k*2.6,9);g.quadraticCurveTo(k*3+Math.sin(t*3+k)*3,15,k*2.4+Math.sin(t*2+k)*2.4,21+Math.abs(k));g.stroke();
        g.fillStyle='#c8ff60';g.beginPath();g.arc(k*2.4+Math.sin(t*2+k)*2.4,21+Math.abs(k),0.9,0,TAU);g.fill();}
      g.save();g.scale(pulse,pulse);
      {const gr=g.createRadialGradient(-4,-6,2,0,-1,15);gr.addColorStop(0,'#f4ffb8');gr.addColorStop(0.45,c1);gr.addColorStop(1,shadeHex(c2,0.1));
        g.fillStyle=m.hurt>0?'#fff':gr;g.beginPath();g.ellipse(0,-1,13,12,0,0,TAU);g.fill();g.strokeStyle=mobLine(c1);g.lineWidth=1.3;g.stroke();}
      /* швы-рёбра и гнойные пузыри */
      g.strokeStyle=hexA(c2,0.7);g.lineWidth=1.1;for(let k=-1;k<=1;k++){g.beginPath();g.moveTo(k*6,-12);g.quadraticCurveTo(k*9,-1,k*6,10);g.stroke();}
      for(const [bx,by,br] of [[-7,-4,2.4],[6,3,1.8],[-2,6,1.6],[7,-7,1.4],[-4,-9,1.2]]){g.fillStyle=hexA('#4a6a10',0.7);g.beginPath();g.arc(bx,by,br,0,TAU);g.fill();g.fillStyle='rgba(255,255,220,.45)';g.beginPath();g.arc(bx-br*0.3,by-br*0.3,br*0.35,0,TAU);g.fill();}
      g.restore();
      mobShine(g,-5,-8,4,2.4,0.4);
      /* единственный глаз и клапан-рот */
      g.fillStyle='#1a2a04';g.beginPath();g.ellipse(4,0,4.2,3.2,0,0,TAU);g.fill();
      mobEye(g,m,4,0,2.4,{white:'#f0ffa0',iris:'#2a3a00',ir:0.5,pupil:'#000',brow:'#1a2a04'});
      g.fillStyle='#1a2a04';g.beginPath();g.arc(0,8,2.2,0,TAU);g.fill();
      if(m.state==='swell'){mobGlow(g,0,0,28,'#c8ff40',m.tele*0.7);g.strokeStyle='rgba(220,255,120,'+m.tele+')';g.lineWidth=1;g.beginPath();g.arc(0,-1,15*pulse,0,TAU);g.stroke();}
      break;}
    case 'h_acidmother':{

      for(let k=0;k<4;k++){const ph=Math.sin(m.anim*12+k*1.7)*(Math.abs(m.vx)>6?0.5:0.1);
        mobLeg(g,-4+k*2,0,-0.9-k*0.25+ph,8,-1.5,10,1.9,c2);}
      /* раздутое брюшко-кладка с яйцами */
      g.save();g.translate(-9,-3);const p2=1+Math.sin(t*3)*0.05;g.scale(p2,p2);
      g.beginPath();g.ellipse(0,0,10.5,8.5,0,0,TAU);mobPath(g,c1,-3,-3,11);
      olLight(g,(g)=>{for(const [ex,ey] of [[-4,2],[0,3.6],[4,2],[-2,-1],[2.4,-0.6]]){const gr=g.createRadialGradient(ex,ey,0,ex,ey,2.4);gr.addColorStop(0,'rgba(230,255,150,.9)');gr.addColorStop(1,'rgba(120,200,40,0)');g.fillStyle=gr;g.beginPath();g.arc(ex,ey,2.4,0,TAU);g.fill();}});
      g.fillStyle='rgba(20,30,5,.7)';g.beginPath();g.moveTo(-6,-5);g.lineTo(0,-8);g.lineTo(6,-5);g.lineTo(0,-3);g.closePath();g.fill();
      g.restore();
      for(let k=0;k<4;k++){const ph=Math.sin(m.anim*12+k*1.7+2)*(Math.abs(m.vx)>6?0.5:0.1);
        mobLeg(g,-2+k*2,1,0.5+k*0.3-ph,8,1.4,10,2,shadeHex(c2,0.15));}
      /* голова-маска с жвалами */
      mobBlob(g,5,-1,6.2,5.2,shadeHex(c1,-0.05));
      hkMask(g,6,-2,8.4,8,'#c8ff40',{col:'#d8e0b8',pupil:'#f8ffd0'});
      g.fillStyle='#d8e84a';for(const sd of [-1,1]){g.beginPath();g.moveTo(8+sd*1.6,3);g.quadraticCurveTo(10.5+sd*1.2,6,9+sd*2.6,8);g.quadraticCurveTo(9.4+sd*0.6,5.6,7+sd*1.6,3.6);g.fill();}
      const dp=(t*1.4)%1;g.fillStyle='rgba(180,255,80,'+(1-dp)+')';g.beginPath();g.arc(9,8+dp*6,0.9,0,TAU);g.fill();
      break;}
    case 'h_acidling':{

      for(let k=0;k<3;k++){const ph=Math.sin(m.anim*16+k*1.7)*0.5;mobLeg(g,-3+k*3,1,-0.8+ph,6,-1.4,6,1.6,c2);mobLeg(g,-2+k*3,1,0.8-ph,6,1.4,6,1.6,shadeHex(c2,0.2));}
      mobBlob(g,-3,-1,7.4,5.4,c1);
      olLight(g,(g)=>{g.fillStyle='rgba(200,255,90,.7)';g.beginPath();g.arc(-4,-1,1.8,0,TAU);g.fill();});
      mobBlob(g,5,-1,4.6,3.8,shadeHex(c1,-0.1));
      g.fillStyle='#e8ff60';g.beginPath();g.arc(7,-2,1.3,0,TAU);g.arc(5.4,-2.6,1,0,TAU);g.fill();mobGlow(g,6.4,-2.2,4,'#c8ff40',0.5);
      break;}
    case 'h_sulfurel':{
      const a=t*1.4;
      mobGlow(g,0,0,26,'#e8d84a',0.3+0.1*Math.sin(t*3));
      for(let k=0;k<6;k++){const aa=a+k*TAU/6,rx=Math.cos(aa)*15,ry=Math.sin(aa)*6;if(Math.sin(aa)>0)continue;
        g.fillStyle=shadeHex(c1,-0.3);g.beginPath();g.moveTo(rx,ry-4);g.lineTo(rx+2.6,ry);g.lineTo(rx,ry+4);g.lineTo(rx-2.6,ry);g.fill();}
      g.beginPath();g.moveTo(0,-17);g.lineTo(8,-8);g.lineTo(10,2);g.lineTo(4,12);g.lineTo(-4,12);g.lineTo(-10,2);g.lineTo(-8,-8);g.closePath();
      {const gr=g.createLinearGradient(-10,-17,10,12);gr.addColorStop(0,'#fff8a0');gr.addColorStop(0.5,c1);gr.addColorStop(1,c2);g.fillStyle=m.hurt>0?'#fff':gr;g.fill();g.strokeStyle=mobLine(c1);g.lineWidth=1;g.stroke();}
      g.strokeStyle='rgba(255,255,220,.6)';g.lineWidth=0.8;g.beginPath();g.moveTo(0,-17);g.lineTo(0,12);g.moveTo(-8,-8);g.lineTo(4,12);g.moveTo(8,-8);g.lineTo(-4,12);g.stroke();
      g.fillStyle='#3a3004';g.beginPath();g.ellipse(-2,-4,2.4,1.6,0,0,TAU);g.ellipse(4,-4,2.4,1.6,0,0,TAU);g.fill();
      mobGlow(g,1,-4,6,'#9aff40',0.7);g.fillStyle='#d0ff80';g.beginPath();g.arc(-2,-4,0.9,0,TAU);g.arc(4,-4,0.9,0,TAU);g.fill();
      for(let k=0;k<6;k++){const aa=a+k*TAU/6,rx=Math.cos(aa)*15,ry=Math.sin(aa)*6;if(Math.sin(aa)<=0)continue;
        g.fillStyle=c1;g.beginPath();g.moveTo(rx,ry-4);g.lineTo(rx+2.6,ry);g.lineTo(rx,ry+4);g.lineTo(rx-2.6,ry);g.fill();}
      break;}
    case 'h_toad':{

      const air=!m.onGround,crouch=m.state==='tongue'?0:air?-0.3:Math.max(0,Math.sin(t*2))*0.2;
      mobLeg(g,-8,4,air?-1.2:0.9,7,air?0.4:-2.2,8,3.6,shadeHex(c2,0.1));
      g.beginPath();g.moveTo(-14,4);g.quadraticCurveTo(-14,-10+crouch*4,0,-11);g.quadraticCurveTo(13,-11,14,-2);g.quadraticCurveTo(10,7,-4,7);g.closePath();mobPath(g,c1,0,-2,14);
      g.fillStyle=shadeHex(c1,0.3);g.beginPath();g.ellipse(4,3,8,3.4,0,0,TAU);g.fill();
      /* светящиеся ядовитые бородавки */
      for(const [bx,by,br] of [[-8,-5,2.2],[-3,-8,1.7],[3,-7.6,1.5],[-10,0,1.5],[7,-6,1.2]]){g.fillStyle=shadeHex(c2,0.2);g.beginPath();g.arc(bx,by,br,0,TAU);g.fill();mobGlow(g,bx,by,br*2,'#c8ff40',0.35+0.2*Math.sin(t*3+bx));g.fillStyle='#d8ff70';g.beginPath();g.arc(bx-br*0.25,by-br*0.3,br*0.4,0,TAU);g.fill();}
      /* горловой мешок */
      {const ps=0.6+0.4*Math.max(0,Math.sin(t*2.6+m.phase));g.fillStyle='rgba(200,240,90,'+(0.55+0.25*ps)+')';g.beginPath();g.ellipse(9,3.4,4*ps+2,3*ps+1.6,0,0,TAU);g.fill();}
      mobLeg(g,-5,5,air?-1.2:1.0,6,air?0.4:-2.2,7,3.8,c1);
      mobLeg(g,8,3,0.4,4,0.8,4,2.4,c1);
      for(const [ex,ey] of [[2,-11],[8,-10]]){mobBlob(g,ex,ey,3.2,3.2,c1);g.fillStyle='#07040a';g.beginPath();g.arc(ex+0.5,ey-0.4,2.1,0,TAU);g.fill();mobGlow(g,ex+0.5,ey-0.4,4,'#e8ff60',0.7);g.fillStyle='#f0ff90';g.beginPath();g.ellipse(ex+0.7,ey-0.4,0.6,1.6,0,0,TAU);g.fill();}
      g.strokeStyle='#0a1404';g.lineWidth=1.2;g.beginPath();g.moveTo(5,-3);g.quadraticCurveTo(10,-1,14,-3);g.stroke();
      break;}
    case 'h_skeleton':{
      const bone=c1,dk=c2;
      mobLeg(g,-2,5,0.15+sw*0.6,6,0.5,6,2.2,dk);mobLeg(g,2,5,-0.15-sw*0.6,6,0.5,6,2.2,bone);
      g.fillStyle=bone;g.beginPath();g.ellipse(0,4,5,2.4,0,0,TAU);g.fill();
      g.strokeStyle=bone;g.lineWidth=2;g.beginPath();g.moveTo(0,3);g.lineTo(0,-12);g.stroke();
      g.lineWidth=1.3;for(let k=0;k<4;k++){g.beginPath();g.ellipse(0,-10+k*3,5.4-k*0.5,1.5,0,0,TAU);g.stroke();}
      g.fillStyle='#4a2a1a';g.beginPath();g.moveTo(-6,-13);g.lineTo(-9,6);g.lineTo(-6,6);g.lineTo(-4,-12);g.fill();
      g.fillStyle='#6a4a2a';for(let k=0;k<3;k++)g.fillRect(-9.5+k*1.2,-14-k,1,6);
      mobBlob(g,1,-17,5.2,4.8,bone);
      g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(1,-14.5,4.6,1.6,0,0,Math.PI);g.fill();
      g.fillStyle='#1a1410';g.beginPath();g.ellipse(3,-17.5,1.5,1.8,0,0,TAU);g.ellipse(-0.6,-17.5,1.3,1.6,0,0,TAU);g.fill();
      mobGlow(g,3,-17.5,4,'#5ab8ff',0.75);g.fillStyle='rgba(150,220,255,.95)';g.beginPath();g.arc(3,-17.5,0.8,0,TAU);g.fill();
      g.fillStyle='#1a1410';for(let k=0;k<4;k++)g.fillRect(-0.5+k*1.5,-13.6,0.8,1.6);
      {const dr=m.tele;g.save();g.translate(4,-8);g.rotate(clamp(Math.atan2(m.lookY||0,Math.abs(m.lookX||1)),-1,1));
        g.strokeStyle=bone;g.lineWidth=1.8;g.beginPath();g.moveTo(0,0);g.lineTo(6,0);g.stroke();
        g.strokeStyle='#5a3a1a';g.lineWidth=2;g.beginPath();g.arc(7,0,9,-1.25,1.25);g.stroke();g.strokeStyle='#d8ccb0';g.lineWidth=0.8;g.beginPath();g.arc(7,0,9,-1.25,-1.0);g.stroke();
        g.strokeStyle='#ddd';g.lineWidth=0.6;g.beginPath();g.moveTo(7+Math.cos(-1.25)*9,Math.sin(-1.25)*9);g.lineTo(7-dr*6,0);g.lineTo(7+Math.cos(1.25)*9,Math.sin(1.25)*9);g.stroke();
        if(dr>0.1){g.strokeStyle='#c8b090';g.lineWidth=1;g.beginPath();g.moveTo(7-dr*6,0);g.lineTo(17,0);g.stroke();g.fillStyle='#d8dde8';g.beginPath();g.moveTo(19,0);g.lineTo(16,-1.6);g.lineTo(16,1.6);g.fill();}
        g.restore();}
      break;}
    case 'h_soulwraith':{

      const wv=t*3+m.phase;
      /* призрачное тело: тёмный плащ с синим ореолом */
      mobGlow(g,0,-4,26,'#5ab8ff',0.25);
      g.beginPath();g.moveTo(-10,-10);g.quadraticCurveTo(-12,-22,0,-23);g.quadraticCurveTo(12,-22,10,-10);
      for(let k=0;k<=7;k++){const xx=10-k*20/7,yy=15+Math.sin(wv+k*1.3)*3+(k%2?3.4:-1);g.lineTo(xx,yy);}g.closePath();
      {const gr=g.createLinearGradient(0,-23,0,18);gr.addColorStop(0,'#1a2440');gr.addColorStop(0.6,'#101828');gr.addColorStop(1,'rgba(20,40,90,0)');g.fillStyle=gr;g.fill();}
      g.strokeStyle='rgba(120,200,255,.35)';g.lineWidth=1;g.stroke();
      /* маска-череп с короной */
      hkMask(g,0.6,-13,12,13,'#7ad8ff',{horns:false,col:'#e8eef4'});
      g.fillStyle='#e8eef4';for(let k=0;k<5;k++){g.beginPath();g.moveTo(-5+k*2.8,-19.4);g.lineTo(-4.2+k*2.8,-24-(k===2?3:k%2?1:2));g.lineTo(-3.4+k*2.8,-19.6);g.fill();}
      /* костлявые руки */
      g.strokeStyle='#d8dce4';g.lineWidth=1.5;g.lineCap='round';g.beginPath();g.moveTo(-6,-6);g.lineTo(-12,-1+Math.sin(wv)*2);g.lineTo(-14,4);g.moveTo(7,-6);g.lineTo(12,-2+Math.cos(wv)*2);g.lineTo(15,3);g.stroke();
      {const n=Math.floor(m.orbs===undefined?3:m.orbs);for(let k=0;k<n;k++){const a=t*2+k*TAU/3;const ox=Math.cos(a)*16,oy=-4+Math.sin(a)*7;mobGlow(g,ox,oy,6,'#7ad8ff',0.7);g.fillStyle='#dff6ff';g.beginPath();g.arc(ox,oy,2,0,TAU);g.fill();}}
      break;}
    case 'h_bonecolossus':{
      const wind=m.state==='windup'?m.tele:0;
      mobLeg(g,-5,7,0.1+sw*0.4,5,0.3,5,4,shadeHex(c1,-0.2));mobLeg(g,5,7,-0.1-sw*0.4,5,0.3,5,4,c1);
      g.fillStyle=c2;g.fillRect(-8,4,16,4);
      g.strokeStyle=c1;g.lineWidth=2.6;g.beginPath();g.moveTo(0,5);g.lineTo(0,-13);g.stroke();
      for(let k=0;k<5;k++){g.lineWidth=2;g.strokeStyle=k%2?c1:shadeHex(c1,-0.1);g.beginPath();g.ellipse(0,-10+k*3.2,9-k*0.7,2.2,0,Math.PI*1.05,Math.PI*1.95);g.stroke();g.beginPath();g.ellipse(0,-10+k*3.2,9-k*0.7,2.2,0,Math.PI*0.05,Math.PI*0.95);g.stroke();}
      mobGlow(g,0,-5,9,'#7ad8ff',0.4+0.2*Math.sin(t*3));g.fillStyle='rgba(150,220,255,.8)';g.beginPath();g.arc(0,-5,2.4,0,TAU);g.fill();
      for(const sd of [-1,1]){const e=mobLeg(g,sd*9,-12,sd*(1.3+wind*1.3),7,sd*0.7,7,3.4,c1);
        mobBlob(g,e[0],e[1],4.6,4.6,shadeHex(c1,-0.05));g.fillStyle='#1a1410';g.fillRect(e[0]-1,e[1]-1,2,2);}
      g.fillStyle=c1;g.beginPath();g.arc(0,-19,6.6,0,TAU);g.fill();g.fillRect(-4,-15,8,4);
      g.fillStyle='#e8dcc0';g.beginPath();g.moveTo(-6,-22);g.quadraticCurveTo(-13,-26,-12,-32);g.quadraticCurveTo(-9,-26,-4,-24);g.fill();
      g.beginPath();g.moveTo(6,-22);g.quadraticCurveTo(13,-26,12,-32);g.quadraticCurveTo(9,-26,4,-24);g.fill();
      g.fillStyle='#0a1020';g.beginPath();g.ellipse(-2.4,-19.5,2,2.4,0,0,TAU);g.ellipse(2.8,-19.5,2,2.4,0,0,TAU);g.fill();
      mobGlow(g,0.2,-19.5,8,'#7ad8ff',0.7);
      g.fillStyle='#1a1410';for(let k=0;k<5;k++)g.fillRect(-3+k*1.5,-14.5,0.8,1.8);
      break;}
    case 'h_necro':{
      g.beginPath();g.moveTo(-9,FY);g.lineTo(-6,-9);g.quadraticCurveTo(0,-14,6,-9);g.lineTo(10,FY);g.closePath();mobPath(g,c1,0,0,14);
      g.strokeStyle=hexA(c2,0.6);g.lineWidth=1;g.beginPath();g.moveTo(-7,FY-4);g.lineTo(8,FY-4);g.moveTo(-6,FY-9);g.lineTo(7,FY-9);g.stroke();
      g.fillStyle='#e0d8c4';for(let k=0;k<4;k++){g.beginPath();g.arc(-5+k*3.4,-6,1.5,0,TAU);g.fill();}
      g.beginPath();g.moveTo(-7,-10);g.quadraticCurveTo(0,-26,7,-10);g.closePath();mobPath(g,shadeHex(c1,-0.1),0,-15,8);
      g.fillStyle='#d8ccb0';g.beginPath();g.ellipse(1.5,-13,3.6,4,0,0,TAU);g.fill();
      g.fillStyle='#0a1a10';g.fillRect(-0.2,-14.5,1.8,1.8);g.fillRect(2.4,-14.5,1.8,1.8);mobGlow(g,1.6,-14,5,c2,0.8);
      {const cast=m.tele,e=mobLeg(g,5,-6,1.1+cast*1.0,5,0.4,5,2.2,c1);
        g.strokeStyle='#2a2a2a';g.lineWidth=1.8;g.beginPath();g.moveTo(e[0],e[1]+12);g.lineTo(e[0]+1,e[1]-14);g.stroke();
        g.strokeStyle='#d8ccb0';g.lineWidth=1.4;g.beginPath();g.arc(e[0]+1,e[1]-16,4,0,TAU);g.stroke();
        g.fillStyle=c2;g.beginPath();g.arc(e[0]+1,e[1]-16,2,0,TAU);g.fill();mobGlow(g,e[0]+1,e[1]-16,8+cast*8,c2,0.5+cast*0.4);}
      if(m.shieldOn){g.strokeStyle='rgba(120,255,180,'+(0.35+0.2*Math.sin(t*4))+')';g.lineWidth=1.6;g.beginPath();g.ellipse(0,-2,17,22,0,0,TAU);g.stroke();
        for(let k=0;k<5;k++){const a=t*1.5+k*TAU/5;g.fillStyle='#d8ccb0';g.save();g.translate(Math.cos(a)*16,-2+Math.sin(a)*20);g.rotate(a);g.fillRect(-3,-1,6,2);g.restore();}}
      break;}
    case 'h_skullbat':{

      const fl=Math.sin(t*18+m.phase);
      for(const sd of [-1,1]){g.save();g.scale(sd,1);g.translate(4,-1);g.rotate(-fl*0.6);
        /* костяные пальцы крыла и рваная перепонка */
        g.fillStyle=hexA(c2,0.9);g.beginPath();g.moveTo(0,0);g.lineTo(8,-8);g.lineTo(15,-6);g.lineTo(18,0);g.lineTo(14,-1);g.lineTo(12,3);g.lineTo(9,0);g.lineTo(6,4);g.lineTo(3,1);g.closePath();g.fill();
        g.strokeStyle='#e0d6c0';g.lineWidth=1.2;g.lineCap='round';g.beginPath();g.moveTo(0,0);g.lineTo(8,-8);g.lineTo(15,-6);g.moveTo(8,-8);g.lineTo(12,3);g.moveTo(8,-8);g.lineTo(18,0);g.stroke();g.restore();}
      g.fillStyle='#e8e0cc';g.beginPath();g.arc(0,-1,7,0,TAU);g.fill();g.fillRect(-4.4,3,8.8,4);
      g.fillStyle='rgba(80,60,90,.35)';g.beginPath();g.arc(-2,1,6,0.4,2.6);g.fill();
      g.strokeStyle='rgba(60,40,50,.6)';g.lineWidth=0.7;g.beginPath();g.moveTo(2,-7.6);g.lineTo(1,-4);g.lineTo(3,-2.6);g.stroke();
      for(const sd of [-1,1]){g.fillStyle='#0c0812';g.beginPath();g.ellipse(sd*2.6,-1.4,2.1,2.5,sd*0.2,0,TAU);g.fill();}
      mobGlow(g,0,-1.4,8,'#c080ff',0.7);
      olLight(g,(g)=>{g.fillStyle='#e8c8ff';g.beginPath();g.arc(-2.6,-1.4,0.9,0,TAU);g.arc(2.6,-1.4,0.9,0,TAU);g.fill();});
      g.fillStyle='#0c0812';g.beginPath();g.moveTo(-0.8,1.4);g.lineTo(0,3);g.lineTo(0.8,1.4);g.fill();
      g.fillStyle='#0c0812';for(let k=0;k<4;k++)g.fillRect(-3+k*1.8,4.4,0.9,2.2);
      break;}
    case 'h_lostsoul':{
      const wv=t*3+m.phase,em=m.emerge>0?m.emerge:0;
      g.save();if(em>0){g.translate(0,em*12);g.scale(1,1-em*0.6);}
      olLight(g,(g)=>{g.beginPath();g.moveTo(-8,-6);g.quadraticCurveTo(-9,-17,0,-17);g.quadraticCurveTo(9,-17,8,-6);
        for(let k=0;k<=5;k++){const xx=8-k*3.2,yy=10+Math.sin(wv+k*1.4)*3+(k%2?3:0);g.lineTo(xx+Math.sin(wv*0.6+k)*2,yy);}g.closePath();
        const gr=g.createLinearGradient(0,-17,0,14);gr.addColorStop(0,'rgba(190,235,255,.85)');gr.addColorStop(0.5,'rgba(90,160,255,.55)');gr.addColorStop(1,'rgba(30,60,160,0)');g.fillStyle=gr;g.fill();});
      g.fillStyle='rgba(10,20,40,.85)';g.beginPath();g.ellipse(-2.6,-10,2,2.8,0.1,0,TAU);g.ellipse(2.8,-10,2,2.8,-0.1,0,TAU);g.fill();
      g.beginPath();g.ellipse(0.2,-3.6,2.2,3+Math.sin(t*4)*0.8,0,0,TAU);g.fill();
      mobGlow(g,0,-9,14,'#7ad8ff',0.5);
      olLight(g,(g)=>{g.fillStyle='#e0f6ff';g.beginPath();g.arc(-2.6,-10.4,0.8,0,TAU);g.arc(2.8,-10.4,0.8,0,TAU);g.fill();});
      g.strokeStyle='rgba(200,235,255,.7)';g.lineWidth=1.4;g.lineCap='round';
      g.beginPath();g.moveTo(-6,-6);g.quadraticCurveTo(-12,-2+Math.sin(wv)*3,-13,4);g.moveTo(6,-6);g.quadraticCurveTo(12,-3+Math.cos(wv)*3,14,3);g.stroke();
      g.restore();
      break;}
    case 'h_skelminion':{
      const bone=c1;
      mobLeg(g,-2,5,0.15+sw*0.6,6,0.5,6,2.2,c2);mobLeg(g,2,5,-0.15-sw*0.6,6,0.5,6,2.2,bone);
      g.strokeStyle=bone;g.lineWidth=2;g.beginPath();g.moveTo(0,4);g.lineTo(0,-11);g.stroke();
      g.lineWidth=1.2;for(let k=0;k<3;k++){g.beginPath();g.ellipse(0,-9+k*3,5-k*0.5,1.4,0,0,TAU);g.stroke();}
      g.fillStyle='#5a4a3a';g.beginPath();g.ellipse(-6,-4,4.4,6,0,0,TAU);g.fill();g.strokeStyle='#8a7a6a';g.lineWidth=1;g.stroke();
      mobBlob(g,1,-16,4.8,4.4,bone);g.fillStyle='#1a1410';g.fillRect(-1,-17.5,2,2);g.fillRect(2.4,-17.5,2,2);mobGlow(g,1.6,-16.5,4,'#7affb0',0.6);
      {const e=mobLeg(g,4,-8,1.3+Math.max(0,1-(m.atkCd||0))*0.4,5,0.5,4,2,bone);g.fillStyle='#a8acb8';g.save();g.translate(e[0],e[1]);g.rotate(-0.5);g.fillRect(0,-1,13,2);g.fillStyle='#4a3a2a';g.fillRect(-3,-1.5,3,3);g.restore();}
      break;}
    case 'h_meatling':{

      const wv=t*12+m.phase;
      for(let k=0;k<4;k++){const lx=-6+k*4;g.strokeStyle=shadeHex(c2,0.1);g.lineWidth=1.8;g.lineCap='round';g.beginPath();g.moveTo(lx,3);g.quadraticCurveTo(lx+Math.sin(wv+k)*3,FY-2,lx+Math.sin(wv+k)*2,FY);g.stroke();}
      g.beginPath();g.moveTo(-9,3);g.quadraticCurveTo(-10,-6,-2,-6);g.quadraticCurveTo(8,-7,9,1);g.quadraticCurveTo(8,5,0,5);g.quadraticCurveTo(-8,5,-9,3);g.closePath();mobPath(g,c1,-1,-2,9);
      g.strokeStyle='#2a0608';g.lineWidth=0.8;g.beginPath();g.moveTo(-6,-3);g.lineTo(-2,1);for(let k=0;k<3;k++){g.moveTo(-5.4+k*1.3,-2.4+k*1.3);g.lineTo(-4.2+k*1.3,-3.4+k*1.3);}g.stroke();
      g.fillStyle='#e8dcc0';for(const [bx,by] of [[-5,-6],[-1,-7],[3,-6.4]]){g.beginPath();g.moveTo(bx-1,by+1);g.lineTo(bx,by-3);g.lineTo(bx+1,by+1);g.fill();}
      g.fillStyle='#1a0004';g.beginPath();g.ellipse(6,1.4,2.6,1.6+Math.abs(Math.sin(wv))*1.2,0,0,TAU);g.fill();
      g.fillStyle='#fff';g.fillRect(5,0.4,0.8,1);g.fillRect(6.6,0.4,0.8,1);
      mobEye(g,m,4,-2.6,1.4,{white:'#ffe066',iris:'#5a0000',ir:0.5});
      break;}
    case 'h_infernal':{
      /* инфернал: сгорбленный исполин из вулканических плит, магма течёт по швам; огромные руки-кувалды */
      const wind=m.state==='windup'?m.tele:0,slam=m.wave>0?m.wave/0.5:0,call=m.tele>0.05&&m.state!=='windup'?m.tele:0;
      const walk=Math.abs(m.vx)>6,ph=m.anim*7,br=Math.sin(t*2+m.phase);
      const rock=shadeHex(c2,0.18),rockD=shadeHex(c2,-0.1),seam=(a)=>'rgba(255,'+(120+Math.floor(90*a))+',30,'+(0.55+0.4*a)+')';
      const gw=Math.min(1,0.55+0.35*Math.sin(t*3.2+m.phase)+wind*0.5+call*0.4);
      mobGlow(g,0,-2,30,'#ff5a1a',0.25+wind*0.35);
      /* ноги-колонны */
      for(const sd of [-1,1]){const lift=walk?Math.max(0,Math.sin(ph+(sd>0?0:Math.PI)))*2.4:0,fx=sd*6.5+(walk?Math.sin(ph+(sd>0?0:Math.PI))*2.6:0);
        g.fillStyle=sd<0?rockD:rock;g.beginPath();g.moveTo(sd*3-3.6,4);g.lineTo(sd*3+3.6,4);g.lineTo(fx+3.4,FY-3-lift);g.lineTo(fx-3.4,FY-3-lift);g.closePath();g.fill();
        g.fillStyle=shadeHex(rock,-0.2);g.beginPath();g.ellipse(fx,FY-2.4-lift,4.8,2.6,0,0,TAU);g.fill();
        olLight(g,(g)=>{g.strokeStyle=seam(gw);g.lineWidth=0.9;g.beginPath();g.moveTo(sd*3,6);g.lineTo(fx-sd,FY-6-lift);g.stroke();});}
      /* дальняя рука */
      const armPose=(sd)=>{const sw2=walk?Math.sin(ph+(sd>0?Math.PI:0))*0.35:br*0.05;
        if(wind>0)return {e:[sd*9-2,-24-wind*4],f:[sd*5,-31-wind*6]};
        if(slam>0)return {e:[sd*8+6,-2],f:[sd*5+12,FY-4]};
        if(call>0&&sd>0)return {e:[12,-22],f:[14,-32]};
        return {e:[sd*15+sw2*4,-2],f:[sd*15+sw2*7,FY-6+Math.abs(sw2)*-2]};};
      const arm=(sd,col)=>{const P=armPose(sd),sx=sd*11,sy=-10;
        g.strokeStyle=col;g.lineCap='round';g.lineWidth=6.5;g.beginPath();g.moveTo(sx,sy);g.lineTo(P.e[0],P.e[1]);g.stroke();
        g.lineWidth=5.6;g.beginPath();g.moveTo(P.e[0],P.e[1]);g.lineTo(P.f[0],P.f[1]);g.stroke();
        olLight(g,(g)=>{g.strokeStyle=seam(gw);g.lineWidth=0.8;g.beginPath();g.moveTo(sx,sy);g.lineTo(P.e[0],P.e[1]);g.lineTo(P.f[0],P.f[1]);g.stroke();});
        /* кулак-валун с раскалёнными костяшками */
        g.beginPath();g.moveTo(P.f[0]-5,P.f[1]-3);g.lineTo(P.f[0]-1,P.f[1]-5.6);g.lineTo(P.f[0]+5,P.f[1]-3.4);g.lineTo(P.f[0]+5.4,P.f[1]+3);g.lineTo(P.f[0],P.f[1]+5);g.lineTo(P.f[0]-5,P.f[1]+3);g.closePath();mobPath(g,col,P.f[0],P.f[1],6);
        olLight(g,(g)=>{g.fillStyle=seam(gw);for(let k=0;k<3;k++){g.beginPath();g.arc(P.f[0]-2.4+k*2.4,P.f[1]-3.4,0.9,0,TAU);g.fill();}
          if(wind>0.6||call>0)softGlow(g,P.f[0],P.f[1],10,'#ff8a2a',0.5);});};
      arm(-1,rockD);
      /* торс: сгорбленная глыба из плит */
      g.beginPath();g.moveTo(-12,-6);g.lineTo(-14,-11);g.lineTo(-8,-16);g.lineTo(8,-16.4);g.lineTo(14,-11);g.lineTo(12,-6);g.lineTo(10,3);g.quadraticCurveTo(0,8,-10,3);g.closePath();
      mobPath(g,rock,0,-6,15);
      g.fillStyle='rgba(255,255,255,.07)';g.beginPath();g.moveTo(-8,-15.6);g.lineTo(8,-16);g.lineTo(6,-12);g.lineTo(-6,-12);g.closePath();g.fill();
      /* швы с магмой и пульсирующее ядро в груди */
      olLight(g,(g)=>{g.strokeStyle=seam(gw);g.lineWidth=1.3;g.lineJoin='round';g.beginPath();
        for(const pl of [[[-12,-6],[-6,-9],[-2,-15]],[[12,-6],[6,-9],[3,-16]],[[-6,-9],[-5,-1],[-9,2]],[[6,-9],[5,-1],[8,2]],[[-5,-1],[5,-1]]]){g.moveTo(pl[0][0],pl[0][1]);for(let k=1;k<pl.length;k++)g.lineTo(pl[k][0],pl[k][1]);}g.stroke();
        const cr=3+0.6*Math.sin(t*4)+wind*1.4;softGlow(g,0,-5,cr*4,'#ff9a30',0.75);const cg=g.createRadialGradient(0,-5,0.5,0,-5,cr);cg.addColorStop(0,'#fff6c0');cg.addColorStop(0.5,'#ffb030');cg.addColorStop(1,'#c02a00');g.fillStyle=cg;g.beginPath();g.arc(0,-5,cr,0,TAU);g.fill();});
      /* плечи-валуны с шипами */
      for(const sd of [-1,1]){g.beginPath();g.ellipse(sd*11.5,-12,5.4,4.6,sd*0.3,0,TAU);mobPath(g,shadeHex(rock,0.08),sd*11.5,-12,6);
        g.fillStyle=shadeHex(c2,-0.35);for(let k=0;k<3;k++){const bx=sd*(8.5+k*2.6),by=-15.5+k*0.8;g.beginPath();g.moveTo(bx-1.4,by+1);g.lineTo(bx+sd*0.8,by-4.4+k*0.6);g.lineTo(bx+1.4,by+1);g.fill();}}
      /* голова, утопленная в плечах: надбровье, рога вперёд, горящие глаза */
      g.save();g.translate(3,-16+(wind>0?-1:0));g.rotate(slam>0?0.25:call>0?-0.25:br*0.03);
      g.beginPath();g.moveTo(-5,1);g.lineTo(-4.6,-4);g.lineTo(0,-6);g.lineTo(5,-4.4);g.lineTo(6,0);g.lineTo(4,3);g.lineTo(-3,3);g.closePath();mobPath(g,rock,0,-1,6);
      g.fillStyle='#e8d8b8';for(const sd of [-1,1]){g.beginPath();g.moveTo(sd*3,-4.6);g.quadraticCurveTo(sd*7+3,-10,sd*4+6,-13);g.quadraticCurveTo(sd*4+3,-8.6,sd*1,-3.4);g.closePath();g.fill();}
      g.fillStyle='rgba(60,30,20,.5)';g.fillRect(-4,-3.4,9.4,1.2);
      olLight(g,(g)=>{softGlow(g,2.4,-1.8,6,'#ff7a1a',0.8);g.fillStyle='#ffe070';g.fillRect(0,-2.4,2.2,1.3);g.fillRect(3.4,-2.4,2.2,1.3);
        g.fillStyle='rgba(255,'+(110+Math.floor(gw*90))+',30,.9)';g.fillRect(-1,1,6,0.9+wind);});
      g.restore();
      arm(1,rock);
      if(slam>0){g.strokeStyle='rgba(255,150,60,'+(0.6*slam)+')';g.lineWidth=2;g.beginPath();g.ellipse(14,FY,10+(1-slam)*20,2.4,0,0,TAU);g.stroke();}
      if(settings.quality!=='low'&&Math.random()<0.3)spawnPart(m.x+rnd(-22,22),m.y-m.h*rnd(0.3,0.95),rnd(-10,10),rnd(-60,-30),0.6,Math.random()<0.5?'#ff8a30':'#ffd060',2.2,-30);
      break;}
    case 'h_magmael':{
      /* ядерный элементаль: раскалённое ядро в клетке из базальтовых плит, вокруг — снаряды-капли магмы */
      const fuse=m.state==='fuse'?m.tele:0,n=Math.floor(m.rocks===undefined?3:m.rocks),walk=Math.abs(m.vx)>6;
      const hov=Math.sin(t*2.6+m.phase)*1.2,sh=fuse>0?Math.sin(t*60)*fuse*1.2:0;
      g.translate(sh,hov-2);
      const drop=(front)=>{for(let k=0;k<n;k++){const a=t*1.9+k*TAU/3,rx=Math.cos(a)*17,ry=Math.sin(a)*6-1;if((Math.sin(a)>=0)!==front)continue;
        olLight(g,(g)=>{for(let q=1;q<4;q++){const aa=a-q*0.16;g.fillStyle='rgba(255,'+(140-q*25)+',40,'+(0.35-q*0.08)+')';g.beginPath();g.arc(Math.cos(aa)*17,Math.sin(aa)*6-1,2.6-q*0.5,0,TAU);g.fill();}
          const gr=g.createRadialGradient(rx-0.8,ry-0.8,0.3,rx,ry,3.2);gr.addColorStop(0,'#fff0a0');gr.addColorStop(0.6,'#ff8a20');gr.addColorStop(1,'#a02a00');g.fillStyle=gr;g.beginPath();g.arc(rx,ry,3.2,0,TAU);g.fill();});}};
      drop(false);
      /* капающие «ноги» из магмы */
      olLight(g,(g)=>{for(const sd of [-1,1]){const sw2=walk?Math.sin(m.anim*9+(sd>0?0:Math.PI))*2:0;const gr=g.createLinearGradient(0,6,0,FY);gr.addColorStop(0,'rgba(255,140,40,.9)');gr.addColorStop(1,'rgba(200,40,0,.5)');
        g.fillStyle=gr;g.beginPath();g.moveTo(sd*5-2.4,7);g.quadraticCurveTo(sd*6+sw2,FY-6,sd*6+sw2-2,FY-hov+1);g.lineTo(sd*6+sw2+2.4,FY-hov+1);g.quadraticCurveTo(sd*6+2+sw2,FY-6,sd*5+2.4,7);g.closePath();g.fill();}});
      /* ядро */
      const cr=8.4+Math.sin(t*5)*0.5+fuse*3;
      olLight(g,(g)=>{softGlow(g,0,0,cr*3,fuse>0.5?'#fff0c0':'#ff8a2a',0.7+fuse*0.3);const cg=g.createRadialGradient(-1,-1,0.5,0,0,cr);
        cg.addColorStop(0,'#ffffff');cg.addColorStop(0.35,fuse>0.4?'#fff8d0':'#ffe070');cg.addColorStop(0.75,'#ff8a20');cg.addColorStop(1,'#a01e00');g.fillStyle=cg;g.beginPath();g.arc(0,0,cr,0,TAU);g.fill();});
      /* базальтовые плиты-клетка: при детонации расходятся */
      const open=fuse*4;
      for(let k=0;k<5;k++){const a=k/5*TAU-Math.PI/2+Math.sin(t*0.8)*0.08,ox=Math.cos(a)*open,oy=Math.sin(a)*open;
        g.save();g.translate(ox,oy);g.rotate(a);
        g.beginPath();g.moveTo(7.4,-5.2);g.lineTo(12.8,-3.4);g.lineTo(13.4,3.2);g.lineTo(7.6,5.4);g.quadraticCurveTo(9.4,0,7.4,-5.2);g.closePath();
        const pg=g.createLinearGradient(7,0,14,0);pg.addColorStop(0,'#3a2420');pg.addColorStop(1,'#140806');g.fillStyle=pg;g.fill();g.strokeStyle='rgba(10,4,2,.8)';g.lineWidth=0.8;g.stroke();
        olLight(g,(g)=>{g.strokeStyle='rgba(255,'+Math.floor(150+90*fuse)+',60,'+(0.55+0.4*Math.sin(t*6+k)+fuse*0.3)+')';g.lineWidth=0.8;g.beginPath();g.moveTo(9.4,-3);g.lineTo(11.4,0.4);g.lineTo(10,3.4);g.stroke();});
        g.restore();}
      /* лицо на ядре */
      g.fillStyle='rgba(60,10,0,.8)';g.beginPath();g.moveTo(-1,-3.4);g.lineTo(2.6,-1.6);g.lineTo(-1,-1.6);g.closePath();g.fill();g.beginPath();g.moveTo(6,-3.4);g.lineTo(3.4,-1.6);g.lineTo(6.4,-1.6);g.closePath();g.fill();
      g.fillStyle='rgba(60,10,0,.75)';g.beginPath();g.moveTo(-0.6,2.4);g.quadraticCurveTo(2.6,4.6+fuse*2,6,2.4);g.quadraticCurveTo(2.6,3.4,-0.6,2.4);g.fill();
      /* язычки пламени над ядром */
      olLight(g,(g)=>{for(let k=0;k<4;k++){const fx=-4.5+k*3,fh=5+Math.sin(t*11+k*1.7)*2+fuse*5;g.fillStyle=k%2?'rgba(255,220,110,.85)':'rgba(255,110,30,.8)';g.beginPath();g.moveTo(fx-2,-cr+2);g.quadraticCurveTo(fx-0.5,-cr-fh,fx+1,-cr-fh*1.4);g.quadraticCurveTo(fx+1.6,-cr-fh*0.6,fx+2,-cr+2);g.fill();}});
      drop(true);
      if(fuse>0.3){olLight(g,(g)=>{g.strokeStyle='rgba(255,255,230,'+(fuse*0.8)+')';g.lineWidth=1.2;for(let k=0;k<6;k++){const a=k/6*TAU+t*3;g.beginPath();g.moveTo(Math.cos(a)*cr,Math.sin(a)*cr);g.lineTo(Math.cos(a)*(cr+5+fuse*6),Math.sin(a)*(cr+5+fuse*6));g.stroke();}});}
      break;}
    case 'h_phoenix':{

      const fl=Math.sin(t*9+m.phase),dive=m.state==='dive';
      olLight(g,(g)=>{for(let k=0;k<7;k++){const tx=-10-k*3.4,ty=2+Math.sin(t*8+k)*2;g.fillStyle=k%2?'rgba(255,210,90,.6)':'rgba(255,90,20,.6)';g.beginPath();g.ellipse(tx,ty,5.4-k*0.6,2.6-k*0.3,0.2,0,TAU);g.fill();}});
      /* перьевые крылья: тёмное основание, огненные кончики */
      for(const sd of [-1,1]){g.save();g.scale(1,sd>0?1:0.75);const wy=-(dive?4:9+fl*8);
        for(let k=4;k>=0;k--){const len=17-k*1.8;g.fillStyle=k<2?'#3a1006':'#5a1a08';
          g.beginPath();g.moveTo(-3,-1);g.quadraticCurveTo(-4-k*2,wy*0.55,-1-k*2.6,wy-k*0.6);g.quadraticCurveTo(1-k*2.4,wy*0.4,2-k*1.6,-1);g.closePath();g.fill();
          olLight(g,(g)=>{g.fillStyle=k%2?'rgba(255,190,70,.8)':'rgba(255,90,20,.8)';g.beginPath();g.arc(-1-k*2.6,wy-k*0.6,1.6,0,TAU);g.fill();});}
        g.restore();}
      g.beginPath();g.ellipse(0,0,8.4,5.2,0,0,TAU);mobPath(g,c1,0,-1,8);
      olLight(g,(g)=>{g.fillStyle='rgba(255,230,160,.55)';g.beginPath();g.ellipse(1,1.8,5,2,0,0,TAU);g.fill();});
      g.beginPath();g.ellipse(8,-4,4.2,3.6,0,0,TAU);mobPath(g,c1,8,-4,4);
      g.fillStyle='#ffd060';g.beginPath();g.moveTo(11,-4.4);g.quadraticCurveTo(15,-4,16.4,-2);g.lineTo(11,-1.6);g.closePath();g.fill();
      olLight(g,(g)=>{for(let k=0;k<4;k++){g.fillStyle=k%2?'#ffd060':'#ff5a1a';g.beginPath();g.moveTo(5.6+k*1.4,-7);g.quadraticCurveTo(3+k*2,-12-k,5+k*2.2,-15-k*0.6);g.quadraticCurveTo(6+k*1.6,-11,7.6+k*1.4,-7);g.fill();}});
      mobEye(g,m,9.4,-4.8,1.4,{white:'#ffffff',iris:'#ff3a00',ir:0.5,glow:'#ffd060',brow:'#1a0600'});
      mobGlow(g,0,0,18,'#ff7a20',0.3);
      break;}
    case 'h_blademaster':{
      /* огненный мечник: демон-самурай в тёмных латах, рогатый шлем с огненным гребнем, рваный горящий плащ, изогнутый двуручный клинок */
      const combo=m.state==='combo',k2=combo?Math.floor(m.st/0.38):0,swing=combo?((m.st%0.38)/0.38):0,walk=Math.abs(m.vx)>6,ph=m.anim*10;
      const arm=shadeHex(c2,0.35),armL=shadeHex(c2,0.55),gold='#c89a4a';
      const lean=combo?(swing<0.35?-0.08:0.14):walk?0.06:0;g.rotate(lean);
      /* плащ */
      {const fl=Math.sin(t*4+m.phase)*2+(walk?3:0)+(combo?4:0);g.beginPath();g.moveTo(-5,-10);g.quadraticCurveTo(-11-fl*0.4,2,-13-fl,FY-1);
        for(let k=0;k<4;k++){const x=-13-fl+k*3.2;g.lineTo(x+1.6,FY-3+(k%2)*2);g.lineTo(x+3.2,FY-0.5);}g.lineTo(-2,FY-4);g.closePath();g.fillStyle=shadeHex(c2,-0.1);g.fill();
        olLight(g,(g)=>{for(let k=0;k<4;k++){const x=-12.4-fl+k*3.2;g.fillStyle=k%2?'rgba(255,170,60,.7)':'rgba(255,80,20,.6)';g.beginPath();g.moveTo(x,FY-0.5);g.quadraticCurveTo(x+1,FY-3-Math.sin(t*12+k)*1.2,x+2,FY-0.5);g.fill();}});}
      /* ноги в поножах */
      const legA=walk?Math.sin(ph)*0.55:combo?0.35:0.12;
      const leg=(x,a,col)=>{const e=mobLeg(g,x,6,a,6.4,a>0?0.5:-0.2,6.6,4,col);g.fillStyle=shadeHex(col,-0.2);g.beginPath();g.moveTo(e[0]-2,e[1]-1);g.lineTo(e[0]+4,e[1]-1);g.lineTo(e[0]+4.4,e[1]+1.2);g.lineTo(e[0]-2.4,e[1]+1.2);g.closePath();g.fill();};
      leg(-3,-legA,shadeHex(arm,-0.15));leg(3,legA,arm);
      /* кираса */
      g.beginPath();g.moveTo(-7.6,-10.4);g.quadraticCurveTo(0,-13,8.4,-10.4);g.lineTo(7,2);g.quadraticCurveTo(0,5,-6,2);g.closePath();mobPath(g,arm,0,-4,10);
      g.strokeStyle=gold;g.lineWidth=0.9;g.beginPath();g.moveTo(-6.6,-3.6);g.quadraticCurveTo(0,-1.8,7,-3.6);g.stroke();
      g.fillStyle=shadeHex(c2,-0.2);g.fillRect(-6.4,1,13,3);g.fillStyle=gold;g.fillRect(-1,1,2.4,3);
      olLight(g,(g)=>{const gw=0.6+0.4*Math.sin(t*5);g.strokeStyle='rgba(255,'+(100+Math.floor(80*gw))+',30,'+(0.5+0.4*gw)+')';g.lineWidth=1;g.beginPath();g.moveTo(0,-9);g.lineTo(-1.6,-6);g.lineTo(1,-4.4);g.stroke();});
      /* наплечники с шипами */
      for(const sd of [-1,1]){g.beginPath();g.ellipse(sd*7.6,-9.6,4.2,3,sd*0.35,0,TAU);mobPath(g,armL,sd*7.6,-9.6,4.4);
        g.fillStyle=shadeHex(c2,-0.3);g.beginPath();g.moveTo(sd*7-1,-12);g.lineTo(sd*9.4,-16.4);g.lineTo(sd*8.8+1.4,-11.4);g.fill();g.fillStyle=gold;g.fillRect(sd*7.6-2.6,-8.4,5.2,0.8);}
      /* рогатый шлем с огненным гребнем и щелью визора */
      g.save();g.translate(1.5,-15.5);g.rotate(combo?(swing<0.35?-0.1:0.12):Math.sin(t*1.6)*0.03);
      olLight(g,(g)=>{for(let k=0;k<4;k++){const fx=-3+k*2.2,fh=5+Math.sin(t*12+k*2)*2;g.fillStyle=k%2?'rgba(255,220,120,.9)':'rgba(255,90,20,.85)';g.beginPath();g.moveTo(fx-1.6,-4.4);g.quadraticCurveTo(fx-2,-6-fh,fx-3+Math.sin(t*9+k),-6-fh*1.4);g.quadraticCurveTo(fx+0.6,-5-fh*0.5,fx+1.6,-4.4);g.fill();}});
      g.beginPath();g.moveTo(-4.6,2.6);g.lineTo(-5,-2.4);g.quadraticCurveTo(-3,-5.6,1,-5.4);g.quadraticCurveTo(5,-5,5.6,-1);g.lineTo(5.2,2.8);g.lineTo(1,4.4);g.closePath();mobPath(g,arm,0,-1,6);
      g.fillStyle='#e0d0b0';for(const sd of [-1,1]){g.beginPath();g.moveTo(sd*2.4+0.6,-4.6);g.quadraticCurveTo(sd*6+0.6,-6,sd*6.4+1.6,-10);g.quadraticCurveTo(sd*4+1,-6.4,sd*0.6+0.6,-4);g.closePath();g.fill();}
      g.fillStyle='#0a0404';g.fillRect(0.4,-1.6,5,1.6);olLight(g,(g)=>{softGlow(g,3,-0.8,4.4,'#ff7a1a',0.7);g.fillStyle='rgba(255,160,60,.95)';g.fillRect(1,-1.2,3.8,0.8);});
      g.fillStyle=gold;g.fillRect(-4.6,1.6,10,0.8);
      g.restore();
      /* изогнутый клинок двумя руками; в серии — три рассечения с огненным шлейфом */
      {const ang=combo?(k2%2?1.6-swing*2.6:-1.0+swing*2.6):(m.tele>0?-1.2:(walk?0.5+Math.sin(ph)*0.08:0.62));
        if(combo&&swing>0.2&&swing<0.85)olLight(g,(g)=>{const a0=k2%2?1.6-0.2*2.6:-1+0.2*2.6,a1=ang;g.strokeStyle='rgba(255,140,40,'+(0.45*Math.sin((swing-0.2)/0.65*Math.PI))+')';g.lineWidth=7;g.lineCap='round';
          g.beginPath();g.arc(5,-6,26,Math.min(a0,a1),Math.max(a0,a1));g.stroke();g.strokeStyle='rgba(255,230,160,.5)';g.lineWidth=2;g.stroke();});
        g.save();g.translate(5,-6);g.rotate(ang);
        g.strokeStyle=armL;g.lineWidth=3.2;g.lineCap='round';g.beginPath();g.moveTo(-2,-1);g.lineTo(3,0);g.stroke();
        g.fillStyle='#2a1810';g.fillRect(2,-1.3,6,2.6);g.fillStyle=gold;for(let k=0;k<3;k++)g.fillRect(2.6+k*2,-1.3,0.7,2.6);
        g.fillStyle=gold;g.beginPath();g.ellipse(8.4,0,1.2,3.4,0,0,TAU);g.fill();
        const gr=g.createLinearGradient(9,0,34,0);gr.addColorStop(0,'#fff0c0');gr.addColorStop(0.5,'#ffb040');gr.addColorStop(1,'#ff4a10');g.fillStyle=gr;
        g.beginPath();g.moveTo(9,-1.8);g.quadraticCurveTo(22,-3.4,33.6,-1.4);g.lineTo(34.6,0.2);g.quadraticCurveTo(22,0.4,9,1.8);g.closePath();g.fill();
        g.strokeStyle='rgba(120,30,0,.6)';g.lineWidth=0.6;g.beginPath();g.moveTo(10,0.6);g.quadraticCurveTo(22,-0.6,33,-0.6);g.stroke();
        olLight(g,(g)=>{g.strokeStyle='rgba(255,140,40,.45)';g.lineWidth=5;g.beginPath();g.moveTo(10,0);g.quadraticCurveTo(22,-1.6,34,-0.6);g.stroke();
          if(Math.random()<0.5){g.fillStyle='rgba(255,200,90,.9)';g.beginPath();g.arc(12+Math.random()*20,-2+Math.random()*3,0.8,0,TAU);g.fill();}});
        g.restore();}
      break;}
    case 'h_magmacrab':{
      /* магмовый краб: плоское тело, панцирь-вулкан с кратером, суставчатые лапы, клешни разного размера, глаза на стебельках */
      const shell=m.state==='shell',walk=Math.abs(m.vx)>6,ph=m.anim*12,shellC=shadeHex(c1,0.05);
      const atk=m.atkT>0?Math.sin((1-m.atkT/0.24)*Math.PI):0,spit=m.tele>0.05?m.tele:0;
      /* лапы: по три с каждой стороны, суставом вверх, кончики-шипы на земле */
      const leg=(bx,side,k,col)=>{const p=walk?Math.sin(ph+k*2.1+(side>0?0:Math.PI)):0,lift=Math.max(0,p)*2.4,fx=bx+side*(9+k*1.6)+p*2.6,fy=FY-lift;
        const kx=bx+side*(4+k),ky=-5-k*0.6-(shell?-3:0);
        g.strokeStyle=col;g.lineCap='round';g.lineWidth=2.4;g.beginPath();g.moveTo(bx,0);g.lineTo(kx,ky);g.stroke();g.lineWidth=1.8;g.beginPath();g.moveTo(kx,ky);g.lineTo(fx,shell?ky+5:fy);g.stroke();
        g.fillStyle='#ffb050';g.beginPath();g.arc(kx,ky,0.8,0,TAU);g.fill();};
      if(!shell)for(let k=0;k<3;k++)leg(-6+k*4,-1,k,shadeHex(c1,-0.15));
      /* тело */
      g.beginPath();g.ellipse(0,1,15,5.4,0,0,TAU);mobPath(g,shadeHex(c1,-0.05),0,1,15);
      if(!shell)for(let k=0;k<3;k++)leg(-4+k*4,1,k,shadeHex(c1,0.12));
      /* панцирь-вулкан */
      const sy=shell?3:0;
      g.beginPath();g.moveTo(-15,1+sy);g.quadraticCurveTo(-14,-7+sy,-6,-9.6+sy);g.lineTo(-2.4,-14+sy);g.lineTo(3.4,-14+sy);g.lineTo(6,-9.6+sy);g.quadraticCurveTo(14,-7+sy,15,1+sy);g.closePath();
      {const gr=g.createLinearGradient(0,-14+sy,0,2+sy);gr.addColorStop(0,'#5a2c1a');gr.addColorStop(1,shellC);g.fillStyle=gr;g.fill();g.strokeStyle=mobLine(c1);g.lineWidth=1.1;g.stroke();}
      g.fillStyle='rgba(255,255,255,.08)';g.beginPath();g.moveTo(-12,-3+sy);g.quadraticCurveTo(-9,-8+sy,-4,-9.4+sy);g.lineTo(-4.6,-7.6+sy);g.quadraticCurveTo(-9,-6+sy,-10.6,-2.4+sy);g.closePath();g.fill();
      g.fillStyle='#2a1208';for(let k=0;k<5;k++){const x=-11+k*5.4,y=-3.4-Math.sin((k/4)*Math.PI)*3+sy;g.beginPath();g.moveTo(x-1.4,y+1.4);g.lineTo(x,y-2.6);g.lineTo(x+1.4,y+1.4);g.fill();}
      /* кратер: магма, дым, лавовые ручейки по склонам */
      olLight(g,(g)=>{const gw=0.6+0.4*Math.sin(t*4)+spit*0.5+(shell?0.4:0);g.fillStyle='#1a0804';g.beginPath();g.ellipse(0.5,-14+sy,3.2,1.2,0,0,TAU);g.fill();
        g.fillStyle='rgba(255,'+Math.floor(170+60*Math.min(1,gw))+',70,'+Math.min(1,gw)+')';g.beginPath();g.ellipse(0.5,-14+sy,2.4,0.8,0,0,TAU);g.fill();softGlow(g,0.5,-14+sy,7+spit*6,'#ff8a20',0.5*Math.min(1,gw));
        g.strokeStyle='rgba(255,'+(120+Math.floor(80*Math.min(1,gw)))+',40,'+Math.min(1,0.5+0.4*gw)+')';g.lineWidth=1.2;g.lineCap='round';
        for(const [x1,y1,x2,y2,x3,y3] of [[-1,-13.4,-4,-9,-9,-4],[2,-13.4,5,-8,10,-3],[-4,-9,-2,-5,-5,-1]]){g.beginPath();g.moveTo(x1,y1+sy);g.quadraticCurveTo(x2,y2+sy,x3,y3+sy);g.stroke();}
        for(let k=0;k<2;k++){const p=((t*0.7+k*0.5)%1);g.fillStyle='rgba(90,70,64,'+(0.45*(1-p))+')';g.beginPath();g.arc(0.5+Math.sin(t*2+k)*2*p,-16-p*12+sy,1.4+p*3,0,TAU);g.fill();}});
      if(!shell){
        /* глаза на стебельках */
        for(const [ex,lean] of [[8.6,0.2],[11.6,0.35]]){const ey=-5-Math.sin(t*3+ex)*0.6;g.strokeStyle=shadeHex(c1,0.2);g.lineWidth=1.2;g.beginPath();g.moveTo(ex-1,-1);g.lineTo(ex+lean*3,ey);g.stroke();
          mobEye(g,m,ex+lean*3,ey-1,1.5,{white:'#ffd060',iris:'#3a0a00',ir:0.5,glow:'#ff8a20'});}
        /* клешни: малая сзади, большая спереди, щёлкают при атаке и плевке */
        const claw=(sx,sy2,sc,col,open)=>{g.save();g.translate(sx,sy2);g.scale(sc,sc);
          g.strokeStyle=col;g.lineWidth=3;g.lineCap='round';g.beginPath();g.moveTo(-4,2);g.lineTo(2,-1-atk*3);g.stroke();
          g.translate(3+atk*4,-2-atk*3);g.beginPath();g.ellipse(2.4,0,4.4,3,-0.2,0,TAU);mobPath(g,col,2.4,0,4.6);
          g.fillStyle='#c25a2e';g.save();g.translate(5.6,-0.6);g.rotate(-0.25-open*0.6);g.beginPath();g.moveTo(0,-1.2);g.quadraticCurveTo(4.4,-2.6,6.4,-0.2);g.lineTo(0,1);g.closePath();g.fill();g.restore();
          g.save();g.translate(5.6,0.8);g.rotate(0.2+open*0.5);g.beginPath();g.moveTo(0,-0.8);g.quadraticCurveTo(3.6,0.6,5,1.8);g.lineTo(0,1.2);g.closePath();g.fill();g.restore();
          olLight(g,(g)=>{g.fillStyle='rgba(255,150,50,.75)';g.beginPath();g.arc(2,0,1,0,TAU);g.fill();});g.restore();};
        const op=0.25+0.25*Math.sin(t*4)+atk*0.6+spit*0.3;
        claw(9,2,0.8,'#7a3220',op*0.7);
        claw(12,0.5,1.15,'#9a4026',op);
      }else{olLight(g,(g)=>{softGlow(g,0,-4,24,'#ff7a2a',0.4);});}
      break;}
    case 'h_salamander':{

      const wv=m.anim*8,prov=m.provoked>0;
      g.strokeStyle=c2;g.lineWidth=4.4;g.lineCap='round';g.beginPath();g.moveTo(-8,0);g.quadraticCurveTo(-14,Math.sin(wv)*3,-20,2+Math.cos(wv)*2);g.stroke();
      olLight(g,(g)=>{g.strokeStyle='rgba(255,170,60,.7)';g.lineWidth=1.4;g.beginPath();g.moveTo(-9,-1);g.quadraticCurveTo(-14,Math.sin(wv)*3-1,-19,1+Math.cos(wv)*2);g.stroke();});
      for(let k=0;k<2;k++)mobLeg(g,-6+k*9,2,0.4+Math.sin(wv+k*3)*0.5,4,-0.8,4,2.4,c2);
      g.beginPath();g.moveTo(-11,1);g.quadraticCurveTo(-10,-6,0,-5.4);g.quadraticCurveTo(9,-6,11,-1);g.quadraticCurveTo(9,4,0,4);g.quadraticCurveTo(-9,4,-11,1);g.closePath();mobPath(g,c1,0,-2,11);
      /* пламенный гребень по хребту */
      olLight(g,(g)=>{for(let k=0;k<5;k++){const fx=-8+k*4,fh=4+Math.sin(t*10+k)*1.6+(prov?3:0);g.fillStyle=k%2?'rgba(255,220,120,.85)':'rgba(255,110,30,.85)';g.beginPath();g.moveTo(fx-2,-5);g.quadraticCurveTo(fx,-5-fh*1.6,fx+2,-5);g.fill();}});
      g.fillStyle=shadeHex(c2,-0.2);for(let k=0;k<5;k++){g.beginPath();g.arc(-7+k*3.5,-1+(k%2),1.4,0,TAU);g.fill();}
      for(let k=0;k<2;k++)mobLeg(g,-4+k*9,2,-0.3-Math.sin(wv+k*3)*0.5,4,-0.8,4,2.6,shadeHex(c1,-0.1));
      g.beginPath();g.ellipse(13,-1.4,5.6,3.8,0.1,0,TAU);mobPath(g,c1,13,-2,6);
      mobEye(g,m,14.6,-3,1.5,{white:'#ffd040',iris:'#1a0800',ir:0.5,pupil:'#000',glow:prov?'#ff6a1a':null});
      g.strokeStyle=mobLine(c1);g.lineWidth=0.8;g.beginPath();g.moveTo(15,0.6);g.lineTo(18.4,0);g.stroke();
      if(prov)mobGlow(g,18,0,6,'#ffb040',0.5+0.3*Math.sin(t*20));
      break;}
    case 'turret':{
      /* череп-турель: рогатый череп на кованом кронштейне, прибитом к стене цепями; глазницы разгораются при зарядке, челюсть отбрасывает при выстреле */
      const ch=m.ch||0,jaw=Math.max(0,m.jaw||0),bone='#e2d6bc',boneD='#b8aa8c';
      /* кронштейн и цепи */
      g.fillStyle='#2a2224';g.fillRect(-17,-11,5,22);g.fillStyle='#4a3e38';for(const yy of [-8,8]){g.beginPath();g.arc(-14.5,yy,1.2,0,TAU);g.fill();}
      g.strokeStyle='#5a4a40';g.lineWidth=2.6;g.beginPath();g.moveTo(-12,0);g.lineTo(-6,0);g.stroke();g.fillStyle='#3a302c';g.beginPath();g.arc(-6,0,2.4,0,TAU);g.fill();
      g.strokeStyle='#6a5a50';g.lineWidth=0.9;for(const sd of [-1,1]){g.beginPath();for(let k=0;k<4;k++){g.ellipse(-12+k*2.4,sd*(5-k*1.1),1.2,0.8,0.5,0,TAU);}g.stroke();}
      g.save();g.translate(2,-2);g.rotate(-jaw*0.12);
      /* рога */
      for(const sd of [-1,1]){g.fillStyle=sd<0?'#5a4a3a':'#7a6650';g.beginPath();g.moveTo(-3+sd*1,-8);g.quadraticCurveTo(-6+sd*2,-17,-1+sd*3,-19);g.quadraticCurveTo(-3+sd*2,-14,1+sd*1,-9);g.closePath();g.fill();}
      /* черепная коробка */
      const cg=g.createRadialGradient(-2,-6,1,0,-2,12);cg.addColorStop(0,'#f6ecd6');cg.addColorStop(1,boneD);g.fillStyle=cg;
      g.beginPath();g.arc(0,-3,10,Math.PI*0.85,Math.PI*2.15);g.quadraticCurveTo(10,5,7,6);g.lineTo(-5,6);g.quadraticCurveTo(-9,4,-9.6,0);g.closePath();g.fill();
      g.strokeStyle='rgba(60,40,20,.5)';g.lineWidth=0.8;g.beginPath();g.moveTo(-3,-12);g.lineTo(-1,-8);g.lineTo(-3.6,-5);g.moveTo(4,-11.4);g.lineTo(5.6,-8.4);g.stroke();
      /* глазницы с огнём */
      g.fillStyle='#120806';g.beginPath();g.ellipse(-1,-3,2.8,3.2,0.1,0,TAU);g.ellipse(6,-3,2.6,3,-0.1,0,TAU);g.fill();
      olLight(g,(g)=>{const a=0.35+ch*0.65;softGlow(g,6,-3,6+ch*10,'#ff4a1a',a);softGlow(g,-1,-3,5+ch*8,'#ff4a1a',a*0.8);
        g.fillStyle='rgba(255,'+Math.round(170-ch*100)+',50,1)';g.beginPath();g.arc(6,-3,1.3+ch*1.1,0,TAU);g.arc(-1,-3,1.1+ch*0.9,0,TAU);g.fill();});
      g.fillStyle='#1a0e0a';g.beginPath();g.moveTo(2.4,1.6);g.lineTo(1.4,4);g.lineTo(3.6,4);g.closePath();g.fill();
      /* верхние зубы */
      g.fillStyle=bone;for(let k=0;k<5;k++)g.fillRect(-3.4+k*2.4,5.4,1.8,2.2);
      g.restore();
      /* челюсть: откидывается при выстреле, во рту пламя при зарядке */
      g.save();g.translate(-3,4.6);g.rotate(0.15+jaw*0.55);
      olLight(g,(g)=>{if(ch>0.2||jaw>0.1){const gr=g.createRadialGradient(6,0,0.5,6,0,6);gr.addColorStop(0,'rgba(255,230,140,'+Math.min(1,ch+jaw)+')');gr.addColorStop(1,'rgba(255,80,20,0)');g.fillStyle=gr;g.beginPath();g.arc(6,0,6,0,TAU);g.fill();}});
      g.fillStyle=boneD;g.beginPath();g.moveTo(0,0);g.lineTo(11,0.6);g.quadraticCurveTo(11.4,3.6,8,4.4);g.lineTo(1,3.8);g.closePath();g.fill();
      g.fillStyle=bone;for(let k=0;k<4;k++)g.fillRect(1.4+k*2.4,-1.6,1.7,2);
      g.restore();
      if(ch>0.5&&Math.random()<0.4)spawnPart(m.x+m.facing*8,m.y-m.h*0.5+4,rnd(-10,10),rnd(-40,-20),0.4,'#ffb040',1.6,-30);
      break;}
    case 'pod':{
      /* кровяной кокон: пульсирующий мешок плоти на корнях, сквозь мембрану видна шевелящаяся тварь; сверху раскрывается сфинктер */
      const ch=m.ch||0,beat=Math.max(0,Math.sin(t*3.2+m.phase))**3,p=1+0.05*beat+ch*0.12;
      /* корни-щупальца в землю */
      for(let k=0;k<6;k++){const sd=k<3?-1:1,i=k%3,x0=sd*(3+i*2),wob=Math.sin(t*2+k)*1.4;g.strokeStyle=k%2?shadeHex(c2,0.1):c2;g.lineWidth=2.6-i*0.5;g.lineCap='round';
        g.beginPath();g.moveTo(x0,FY-8);g.quadraticCurveTo(sd*(8+i*5)+wob,FY-6+i,sd*(12+i*6)+wob,FY);g.stroke();}
      g.save();g.translate(0,FY-15);g.scale(p,p*(1+beat*0.03));
      /* тень-основание */
      g.fillStyle=shadeHex(c2,-0.2);g.beginPath();g.ellipse(0,12,9,3,0,0,TAU);g.fill();
      /* мембрана */
      const gr=g.createRadialGradient(-4,-6,2,0,0,17);gr.addColorStop(0,'#e86070');gr.addColorStop(0.55,c1);gr.addColorStop(1,shadeHex(c1,-0.35));
      g.fillStyle=gr;g.beginPath();g.moveTo(0,-15);g.bezierCurveTo(10,-15,13,-4,12,4);g.bezierCurveTo(11,11,5,14,0,14);g.bezierCurveTo(-5,14,-11,11,-12,4);g.bezierCurveTo(-13,-4,-10,-15,0,-15);g.closePath();g.fill();
      /* силуэт твари внутри */
      g.save();g.globalAlpha=0.38+ch*0.3;g.fillStyle='#3a0610';const wv=Math.sin(t*2.2+m.phase);g.translate(wv*1.2,1+Math.cos(t*1.7)*0.8);g.rotate(wv*0.15);
      g.beginPath();g.ellipse(0,1,4.6,6.4,0,0,TAU);g.fill();g.beginPath();g.arc(1,-5.4,3,0,TAU);g.fill();
      g.strokeStyle='#3a0610';g.lineWidth=1.2;for(const sd of [-1,1]){g.beginPath();g.moveTo(sd*3,0);g.lineTo(sd*6.4,3+wv*sd);g.moveTo(sd*2,5);g.lineTo(sd*5,8.4);g.stroke();}g.restore();
      /* вены */
      g.strokeStyle='rgba(70,0,14,.75)';g.lineWidth=1;g.lineCap='round';
      for(const [x1,y1,cx1,cy1,x2,y2] of [[-3,-14,-9,-6,-10,6],[3,-14,9,-4,9,8],[0,-15,-2,0,-4,13],[-8,-10,-5,-4,-6,2],[7,-11,4,-2,5,4]]){g.beginPath();g.moveTo(x1,y1);g.quadraticCurveTo(cx1,cy1,x2,y2);g.stroke();}
      olLight(g,(g)=>{g.strokeStyle='rgba(255,70,90,'+(0.25+0.45*beat)+')';g.lineWidth=0.7;for(const [x1,y1,cx1,cy1,x2,y2] of [[-3,-14,-9,-6,-10,6],[3,-14,9,-4,9,8]]){g.beginPath();g.moveTo(x1,y1);g.quadraticCurveTo(cx1,cy1,x2,y2);g.stroke();}});
      g.fillStyle='rgba(255,220,230,.35)';g.beginPath();g.ellipse(-5,-8,2.4,4,-0.4,0,TAU);g.fill();
      /* сфинктер сверху: раскрывается, когда выводит тварь */
      const op=ch;g.fillStyle=shadeHex(c1,-0.25);g.beginPath();g.ellipse(0,-14,5,2.2,0,0,TAU);g.fill();
      g.fillStyle='#1a0006';g.beginPath();g.ellipse(0,-14,1.2+op*3.6,0.5+op*1.6,0,0,TAU);g.fill();
      for(let k=0;k<6;k++){const a=k/6*TAU;g.strokeStyle='rgba(60,0,10,.7)';g.lineWidth=0.8;g.beginPath();g.moveTo(Math.cos(a)*(1.4+op*3.6),-14+Math.sin(a)*(0.6+op*1.6));g.lineTo(Math.cos(a)*5,-14+Math.sin(a)*2.2);g.stroke();}
      g.restore();
      /* капли крови */
      const dp=(t*0.9+m.phase)%1;g.fillStyle='rgba(160,10,30,'+(1-dp)+')';g.beginPath();g.ellipse(7,FY-12+dp*10,0.9,1.4,0,0,TAU);g.fill();
      mobGlow(g,0,FY-15,22,'#ff2a3a',0.15+0.25*beat+ch*0.3);
      break;}
    case 'rift':{
      /* кристалл разлома: друза парит над обломком скалы с рунами; в главном кристалле — трещина в пустоту, вокруг кружат осколки */
      const a=t*1.2,sum=m.cd>6.6?(m.cd-6.6)/1.4:0,pulse=0.5+0.5*Math.sin(t*2.2);
      olLight(g,(g)=>{softGlow(g,0,-2,34,'#a070ff',0.3+0.15*pulse+sum*0.4);});
      /* парящий обломок скалы с рунами */
      g.save();g.translate(0,13+Math.sin(t*1.5)*0.6);
      g.fillStyle='#24182e';g.beginPath();g.moveTo(-11,-2);g.lineTo(11,-2);g.lineTo(8,3);g.lineTo(3,7);g.lineTo(-2,9);g.lineTo(-7,4);g.closePath();g.fill();
      g.fillStyle='rgba(255,255,255,.07)';g.fillRect(-11,-2,22,1.4);
      olLight(g,(g)=>{g.strokeStyle='rgba(200,160,255,'+(0.4+0.5*pulse)+')';g.lineWidth=0.9;g.beginPath();g.moveTo(-6,1);g.lineTo(-4,3);g.lineTo(-2,1);g.moveTo(2,1);g.lineTo(2,4);g.moveTo(5,1);g.arc(5.5,2.2,1.2,0,TAU);g.stroke();});
      g.restore();
      /* малые кристаллы друзы */
      const cry=(x,y,w2,h2,rot,col)=>{g.save();g.translate(x,y);g.rotate(rot);g.beginPath();g.moveTo(0,-h2);g.lineTo(w2,-h2*0.55);g.lineTo(w2*0.8,0);g.lineTo(-w2*0.8,0);g.lineTo(-w2,-h2*0.55);g.closePath();
        const cg=g.createLinearGradient(-w2,0,w2,0);cg.addColorStop(0,shadeHex(col,0.35));cg.addColorStop(0.5,col);cg.addColorStop(1,shadeHex(col,-0.35));g.fillStyle=cg;g.fill();
        g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.moveTo(0,-h2);g.lineTo(-w2*0.35,-h2*0.5);g.lineTo(-w2*0.2,0);g.lineTo(0.4,-h2*0.5);g.closePath();g.fill();g.restore();};
      cry(-7,11,3.4,10,-0.45,shadeHex(c1,-0.15));cry(7.5,11,3,9,0.5,shadeHex(c1,-0.1));cry(-3.4,11,2.4,6,-0.2,c1);
      /* главный кристалл с трещиной-разломом */
      g.save();g.rotate(Math.sin(a)*0.08);
      g.beginPath();g.moveTo(0,-21);g.lineTo(8,-10);g.lineTo(6.4,11);g.lineTo(-6.4,11);g.lineTo(-8,-10);g.closePath();
      const mg=g.createLinearGradient(-8,0,8,0);mg.addColorStop(0,'#d8c0ff');mg.addColorStop(0.45,c1);mg.addColorStop(1,shadeHex(c1,-0.45));g.fillStyle=mg;g.fill();
      g.strokeStyle='rgba(40,10,80,.6)';g.lineWidth=0.9;g.stroke();
      g.fillStyle='rgba(255,255,255,.4)';g.beginPath();g.moveTo(0,-20);g.lineTo(-5,-10);g.lineTo(-3,9);g.lineTo(-1,-9);g.closePath();g.fill();
      g.strokeStyle='rgba(255,255,255,.25)';g.lineWidth=0.7;g.beginPath();g.moveTo(0,-21);g.lineTo(0,11);g.stroke();
      /* разлом: тёмная щель с мерцающими звёздами пустоты */
      const rw=2.4+sum*3+pulse*0.6;
      g.fillStyle='#08001a';g.beginPath();g.moveTo(0.4,-13);g.quadraticCurveTo(rw+0.6,-3,0.8,7);g.quadraticCurveTo(-rw,-2,0.4,-13);g.closePath();g.fill();
      olLight(g,(g)=>{g.strokeStyle='rgba(210,170,255,'+(0.6+0.4*pulse)+')';g.lineWidth=0.8;g.beginPath();g.moveTo(0.4,-13);g.quadraticCurveTo(rw+0.6,-3,0.8,7);g.quadraticCurveTo(-rw,-2,0.4,-13);g.stroke();
        for(let k=0;k<4;k++){const yy=-10+((t*6+k*4)%16),tw=0.5+0.5*Math.sin(t*9+k);g.fillStyle='rgba(255,255,255,'+tw+')';g.fillRect(0.2+Math.sin(k*2.3)*0.8,yy,0.8,0.8);}});
      g.restore();
      /* кружащие осколки и кольцо энергии */
      olLight(g,(g)=>{g.strokeStyle='rgba(200,170,255,'+(0.3+sum*0.5)+')';g.lineWidth=1;g.beginPath();g.ellipse(0,0,21,7.5,0,(a%TAU),(a%TAU)+4.2);g.stroke();});
      for(let k=0;k<5;k++){const aa=a*1.4+k*TAU/5,rx=Math.cos(aa)*(18+sum*4),ry=Math.sin(aa)*7-2;if(Math.sin(aa)<0)continue;
        g.save();g.translate(rx,ry);g.rotate(aa*2);g.fillStyle=hexA('#e0ccff',0.9);g.beginPath();g.moveTo(0,-3.4);g.lineTo(1.8,0);g.lineTo(0,3.4);g.lineTo(-1.8,0);g.closePath();g.fill();g.restore();}
      if(sum>0)olLight(g,(g)=>{softGlow(g,0,-2,16+sum*20,'#e0c8ff',sum*0.8);});
      break;}
    case 'hound':{
      g.strokeStyle=c2;g.lineWidth=2.6;g.lineCap='round';g.beginPath();g.moveTo(-11,-2);g.quadraticCurveTo(-18,-6+Math.sin(t*8)*2,-17,-12);g.stroke();
      mobLeg(g,-8,2,0.3+sw*0.8,6,-0.7,6,3,shadeHex(c2,-0.1));
      mobLeg(g,6,2,-0.3-sw*0.8,6,0.6,5,3,shadeHex(c2,-0.1));
      mobBlob(g,-1,-2,12,6.5,c1);
      g.strokeStyle=hexA('#ff6a2a',0.55);g.lineWidth=1.2;for(let k=0;k<3;k++){g.beginPath();g.moveTo(-6+k*4,-7);g.lineTo(-7+k*4,1);g.stroke();}
      mobLeg(g,-6,2,-0.2-sw*0.8,6,-0.7,6,3,c2);
      mobLeg(g,8,2,0.2+sw*0.8,6,0.6,5,3,c2);
      mobBlob(g,11,-7,6,5,c1);
      g.fillStyle=c1;g.beginPath();g.moveTo(14,-8);g.lineTo(21,-5);g.lineTo(14,-3);g.closePath();g.fill();
      {const jaw=0.15+m.tele*0.5;g.save();g.translate(14,-3.5);g.rotate(jaw);g.fillStyle=shadeHex(c2,-0.2);g.beginPath();g.moveTo(0,0);g.lineTo(6.5,0.5);g.lineTo(0,2.6);g.closePath();g.fill();g.restore();
        if(jaw>0.3){g.fillStyle='rgba(255,160,40,.8)';g.beginPath();g.arc(19,-3,2,0,TAU);g.fill();}}
      g.fillStyle='#fff';g.beginPath();g.moveTo(16,-4);g.lineTo(16.6,-2.4);g.lineTo(17.3,-4);g.fill();
      g.fillStyle=shadeHex(c2,-0.3);g.beginPath();g.moveTo(8,-11);g.lineTo(8.5,-17);g.lineTo(11,-11);g.closePath();g.fill();
      mobEye(g,m,13.5,-9,1.6,{white:'#ffdd55',iris:'#3a0a00',ir:0.4,glow:'#ff8a20'});
      olLight(g,(g)=>{
      for(let k=0;k<5;k++){const fx=-7+k*4.2,fh=5+Math.sin(t*12+k*1.9)*2.5;g.fillStyle=k%2?'rgba(255,200,80,.7)':'rgba(255,90,20,.7)';g.beginPath();g.moveTo(fx-2.5,-7);g.quadraticCurveTo(fx-1,-7-fh*1.6,fx+2.5,-7);g.closePath();g.fill();}
      });
      break;}
    case 'leech':{
      const wv=t*6+m.phase;
      for(let k=0;k<5;k++){const xx=-12+k*6,yy=Math.sin(wv-k*0.9)*1.5;mobBlob(g,xx,yy+2,5.4+(k===2?1:0),5-Math.abs(k-2)*0.5,k%2?c1:shadeHex(c1,-0.15));}
      g.fillStyle=c2;g.beginPath();g.arc(15,2,4.6,0,TAU);g.fill();
      g.fillStyle='#2a0006';g.beginPath();g.arc(16,2,2.7,0,TAU);g.fill();
      g.strokeStyle='#ffd8d8';g.lineWidth=0.8;for(let k=0;k<6;k++){const a=k/6*TAU+t*2;g.beginPath();g.moveTo(16+Math.cos(a)*1.1,2+Math.sin(a)*1.1);g.lineTo(16+Math.cos(a)*2.6,2+Math.sin(a)*2.6);g.stroke();}
      mobShine(g,-2,-1.5,9,1.5,0.3);
      if(m.latch>0)mobGlow(g,0,0,20,'#ff2a3a',0.45);
      break;}
    case 'demon':{
      const chg=m.state==='charge',wind=m.state==='windup';
      {const fw=Math.sin(t*3)*0.2;g.save();g.translate(-4,-8);g.rotate(-0.4+fw);g.beginPath();g.moveTo(0,0);g.lineTo(-14,-12);g.lineTo(-11,-4);g.lineTo(-16,0);g.lineTo(-9,2);g.lineTo(-12,7);g.lineTo(-2,4);g.closePath();mobPath(g,shadeHex(c2,0.1),-6,-2,10);g.restore();}
      mobLeg(g,-4,6,0.15+sw*0.6,6,0.5,6,4,shadeHex(c2,-0.1));
      mobLeg(g,4,6,-0.15-sw*0.6,6,0.5,6,4,c2);
      g.beginPath();g.moveTo(-8,-8);g.quadraticCurveTo(0,-13,9,-8);g.lineTo(7,7);g.quadraticCurveTo(0,9,-6,7);g.closePath();mobPath(g,c1,0,-1,10);
      g.strokeStyle=hexA(shadeHex(c1,-0.45),0.8);g.lineWidth=1;g.beginPath();g.moveTo(0,-8);g.lineTo(0,5);g.moveTo(-5,-2);g.lineTo(5,-2);g.moveTo(-4,2);g.lineTo(4,2);g.stroke();
      mobBlob(g,3,-14,5.5,5,c1);
      g.fillStyle='#e8dcc0';for(const [hx,dir] of [[0.5,-1],[5.5,1]]){g.beginPath();g.moveTo(hx-1.5,-17);g.quadraticCurveTo(hx+dir*4,-23,hx+dir*1,-27);g.quadraticCurveTo(hx+dir*1.4,-21,hx+1.5,-17);g.closePath();g.fill();}
      mobEye(g,m,5.5,-14.5,1.5,{white:'#ffee66',iris:'#ff3a00',ir:0.5,glow:'#ff6a20',brow:'#2a0000'});
      g.fillStyle='#2a0000';g.fillRect(3,-11.5,5,1.2);g.fillStyle='#fff';g.fillRect(4,-11.5,1,1);g.fillRect(6.5,-11.5,1,1);
      {const raise=wind?m.tele:chg?0.6:0;const e=mobLeg(g,7,-6,1.0+raise*1.2,6,0.5-raise*0.5,6,3.4,c1);
        g.strokeStyle='#f0e0c0';g.lineWidth=1;for(let k=-1;k<=1;k++){g.beginPath();g.moveTo(e[0],e[1]);g.lineTo(e[0]+3,e[1]+k*2+1);g.stroke();}}
      if(chg)mobGlow(g,0,0,26,'#ff4010',0.4);
      break;}
    case 'scorpion':{
      for(let k=0;k<3;k++){const lx=-6+k*6,ph=sw*(k%2?1:-1)*0.5;mobLeg(g,lx,3,0.5+ph,5,-1.1,6,1.8,shadeHex(c2,-0.1));mobLeg(g,lx+2,3,-0.5-ph,5,1.1,6,1.8,c2);}
      mobBlob(g,0,0,10,5.5,c1);
      g.strokeStyle=hexA(c2,0.9);g.lineWidth=1;for(let k=-1;k<=1;k++){g.beginPath();g.moveTo(k*4,-5);g.lineTo(k*4,4.5);g.stroke();}
      {const tl=m.tele;let px0=-9,py0=-1;g.strokeStyle=c1;g.lineCap='round';
        const segs=[[-14,-6],[-16,-13],[-12,-19],[-5,-21-tl*2],[0,-18+tl*3]];
        for(let k=0;k<segs.length;k++){const [sx,sy]=segs[k];g.lineWidth=5-k*0.6;g.beginPath();g.moveTo(px0,py0);g.lineTo(sx,sy+Math.sin(t*3+k)*0.6);g.stroke();px0=sx;py0=sy;}
        g.fillStyle='#d8e84a';g.beginPath();g.moveTo(px0,py0);g.lineTo(px0+5,py0+3);g.lineTo(px0+1,py0+5);g.closePath();g.fill();
        mobGlow(g,px0+2,py0+3,6,'#c8ff40',0.4+tl*0.5);}
      {const e=mobLeg(g,8,0,1.6,5,0.4,5,2.6,c1);g.fillStyle=c1;g.beginPath();g.ellipse(e[0]+2,e[1]-1,4,2.6,-0.3,0,TAU);g.fill();
        g.fillStyle=c2;g.beginPath();g.moveTo(e[0]+4,e[1]-2);g.lineTo(e[0]+8,e[1]-3+Math.sin(t*6)*1);g.lineTo(e[0]+5,e[1]);g.closePath();g.fill();}
      mobEye(g,m,8,-3,1.2,{white:'#e8ff60',iris:'#2a3a00',ir:0.5});
      break;}
    case 'gasbag':{
      const pulse=1+Math.sin(t*2.4+m.phase)*0.06+m.tele*0.2;
      g.strokeStyle=hexA(c2,0.8);g.lineWidth=1.4;for(let k=-2;k<=2;k++){g.beginPath();g.moveTo(k*3,8);g.quadraticCurveTo(k*3+Math.sin(t*3+k)*3,14,k*3+Math.sin(t*2+k)*2,19);g.stroke();}
      g.save();g.scale(pulse,pulse);
      {const gr=g.createRadialGradient(-3,-5,2,0,0,14);gr.addColorStop(0,shadeHex(c1,0.35));gr.addColorStop(1,c1);
      g.fillStyle=gr;g.beginPath();g.ellipse(0,-1,13,11,0,0,TAU);g.fill();g.strokeStyle=mobLine(c1);g.lineWidth=1;g.stroke();}
      g.fillStyle=hexA(c2,0.6);for(let k=0;k<4;k++){g.beginPath();g.arc(-7+k*4.5,-4+((k*7)%5),1.6+(k%2),0,TAU);g.fill();}
      g.restore();
      mobShine(g,-5,-7,4,2.4,0.4);
      mobEye(g,m,4,-1,2.2,{white:'#f0ffa0',iris:'#2a3a00',ir:0.5});
      if(m.tele>0.2)mobGlow(g,0,0,24,'#c8ff40',m.tele*0.6);
      break;}
    case 'skeleton':{
      const bone=c1,dk=c2;
      mobLeg(g,-2,4,0.15+sw*0.6,6,0.5,6,2,dk);
      mobLeg(g,2,4,-0.15-sw*0.6,6,0.5,6,2,bone);
      g.fillStyle=bone;g.fillRect(-4,2,8,3);
      g.strokeStyle=bone;g.lineWidth=1.8;g.beginPath();g.moveTo(0,2);g.lineTo(0,-12);g.stroke();
      g.lineWidth=1.2;for(let k=0;k<4;k++){g.beginPath();g.ellipse(0,-10+k*3,5-k*0.5,1.4,0,0,TAU);g.stroke();}
      mobBlob(g,1,-17,5,4.6,bone);
      g.fillStyle='#1a1410';g.beginPath();g.ellipse(3,-17.5,1.4,1.7,0,0,TAU);g.fill();
      mobGlow(g,3,-17.5,3.5,'#5ab8ff',0.7);
      g.fillStyle='rgba(150,220,255,.95)';g.beginPath();g.arc(3,-17.5,0.7,0,TAU);g.fill();
      g.fillStyle='#1a1410';for(let k=0;k<3;k++)g.fillRect(1+k*1.6,-14,0.8,1.5);
      {const dr=m.tele;g.save();g.translate(4,-8);g.rotate(clamp(Math.atan2(m.lookY||0,Math.abs(m.lookX||1)),-1,1));
        g.strokeStyle=bone;g.lineWidth=1.8;g.beginPath();g.moveTo(0,0);g.lineTo(6,0);g.stroke();
        g.strokeStyle='#6a4a2a';g.lineWidth=1.6;g.beginPath();g.arc(7,0,8,-1.2,1.2);g.stroke();
        g.strokeStyle='#ddd';g.lineWidth=0.6;g.beginPath();g.moveTo(7+Math.cos(-1.2)*8,Math.sin(-1.2)*8);g.lineTo(7-dr*5,0);g.lineTo(7+Math.cos(1.2)*8,Math.sin(1.2)*8);g.stroke();
        if(dr>0.1){g.strokeStyle='#c8b090';g.lineWidth=1;g.beginPath();g.moveTo(7-dr*5,0);g.lineTo(16,0);g.stroke();}
        g.restore();}
      break;}
    case 'imp':{
      /* имп: семенящий бег, хвост-плеть, обе руки вверх — три огонька над головой — бросок веером; исчезает, свернувшись клубком */
      const cast=m.castT>0?1-m.castT/0.45:0,thr=m.throwT>0?m.throwT/0.3:0,moving=Math.abs(m.vx)>8;
      const bo=m.blinkOut>0?1-m.blinkOut/0.22:0,bi=m.blinkIn>0?m.blinkIn/0.24:0,ball=Math.max(bo,bi);
      if(ball>0){olLight(g,(g)=>{for(let q=0;q<5;q++){const a=t*9+q*1.26,r=(6+ball*10);g.fillStyle='rgba(120,100,90,'+(0.45*ball)+')';g.beginPath();g.arc(Math.cos(a)*r,-8+Math.sin(a)*r*0.6,3+ball*3,0,TAU);g.fill();}});}
      if(ball>0.85)break;
      g.save();if(ball>0){g.translate(0,-6);g.rotate(t*18*ball);g.scale(1-ball*0.7,1-ball*0.7);g.translate(0,6);}
      const bob=moving?Math.abs(Math.sin(t*14+m.phase))*1.6:Math.sin(t*2.6+m.phase)*0.5;g.translate(0,-bob);
      g.rotate(thr*0.22-cast*0.1);
      const tl=Math.sin(t*5+m.phase)*3+(thr>0?-3*thr:0);
      g.strokeStyle=c2;g.lineWidth=2;g.lineCap='round';g.beginPath();g.moveTo(-5,4);g.bezierCurveTo(-12,6,-15,2+tl,-13,-6+tl*0.5);g.stroke();
      g.fillStyle=c2;g.beginPath();g.moveTo(-13,-5+tl*0.5);g.lineTo(-16.5,-9+tl*0.5);g.lineTo(-10.5,-8.5+tl*0.5);g.closePath();g.fill();
      const fw=Math.sin(t*(moving?12:7))*0.3-cast*0.3;
      g.save();g.translate(-3,-5);g.rotate(-0.5+fw);g.beginPath();g.moveTo(0,0);g.lineTo(-10,-8);g.lineTo(-8,-2);g.lineTo(-11,1);g.lineTo(-5,2);g.closePath();mobPath(g,shadeHex(c2,0.1),-6,-3,8);g.restore();
      const st2=moving?Math.sin(t*14+m.phase):sw;
      mobLeg(g,-3,6,0.2+st2*0.7,5,0.5+Math.max(0,st2)*0.5,5,2.6,shadeHex(c2,-0.1));
      mobLeg(g,3,6,-0.2-st2*0.7,5,0.5+Math.max(0,-st2)*0.5,5,2.6,c2);
      mobBlob(g,0,1,7,8,c1);
      g.fillStyle=hexA('#ffb070',0.35+cast*0.25);g.beginPath();g.ellipse(1,3,3.5,4,0,0,TAU);g.fill();
      /* задняя рука: при замахе тоже поднята */
      mobLeg(g,-3,-2,cast>0?2.6+cast*0.5:thr>0?2.2-thr*0.4:0.6,4.2,0.5,3.6,2.2,shadeHex(c1,-0.15));
      mobBlob(g,1,-9,6.5,6,c1);
      g.fillStyle='#f0e0c0';g.beginPath();g.moveTo(-3,-13);g.quadraticCurveTo(-7,-19,-4,-22);g.quadraticCurveTo(-3,-17,-1,-14);g.closePath();g.fill();
      g.beginPath();g.moveTo(3,-14);g.quadraticCurveTo(5,-20,9,-21);g.quadraticCurveTo(6,-17,5,-13);g.closePath();g.fill();
      mobEye(g,m,3.5,-9.5,1.8,{white:'#ffe066',iris:'#3a0a00',ir:0.45,glow:'#ffcc33',brow:'#3a0a00'});
      mobEye(g,m,-0.8,-9.5,1.6,{white:'#ffe066',iris:'#3a0a00',ir:0.45});
      g.strokeStyle='#3a0a00';g.lineWidth=1;g.beginPath();g.moveTo(0,-5.5);g.lineTo(2,-6.5-cast);g.lineTo(4,-5.5);g.stroke();
      {const aA=cast>0?1.2+cast*1.9:thr>0?3.1-(1-thr)*1.6:1.2;mobLeg(g,5,-2,aA,4.5,cast>0?-0.3:0.6,4,2.4,c1);}
      /* три огонька собираются дугой над головой */
      if(cast>0)olLight(g,(g)=>{for(let k=-1;k<=1;k++){const a=-Math.PI/2+k*0.55,r=13+cast*3,ox=1+Math.cos(a)*r,oy=-10+Math.sin(a)*r,rr=1+cast*2.4+Math.sin(t*20+k)*0.3;
        const gr=g.createRadialGradient(ox,oy,0.3,ox,oy,rr*2.2);gr.addColorStop(0,'rgba(255,245,190,.98)');gr.addColorStop(0.5,'rgba(255,150,50,.8)');gr.addColorStop(1,'rgba(255,70,10,0)');g.fillStyle=gr;g.beginPath();g.arc(ox,oy,rr*2.2,0,TAU);g.fill();}});
      g.restore();
      break;}
    case 'elemental':{
      /* магмовый элементаль: груда валунов с раскалёнными швами, голова-валун и парящие кулаки */
      const fuse=m.state==='fuse'?m.tele:0,glw=0.65+0.35*Math.sin(t*5)+fuse;
      const bob2=Math.sin(t*3+m.phase)*1.2;
      const fist=(sd,front)=>{const a=t*2+m.phase+(sd>0?0:Math.PI),x=sd*14+Math.cos(a)*1.5,y=2+Math.sin(a)*2.5+bob2;
        g.beginPath();g.moveTo(x-4,y-1);g.lineTo(x-2,y-4.5);g.lineTo(x+3,y-4);g.lineTo(x+4.5,y+0.5);g.lineTo(x+1,y+4);g.lineTo(x-3.5,y+3);g.closePath();
        mobPath(g,shadeHex(c2,front?-0.3:-0.5),x,y,5);
        g.strokeStyle='rgba(255,150,50,'+Math.min(1,0.7*glw)+')';g.lineWidth=0.9;g.beginPath();g.moveTo(x-2,y-1);g.lineTo(x+1,y+1);g.lineTo(x+2.5,y-2);g.stroke();};
      fist(-1,false);
      mobGlow(g,0,0,22,'#ff7a20',0.35+fuse*0.4);
      /* туловище из трёх глыб */
      const rock=(pts,col)=>{g.beginPath();pts.forEach((q,i)=>i?g.lineTo(q[0],q[1]+bob2*0.5):g.moveTo(q[0],q[1]+bob2*0.5));g.closePath();mobPath(g,col,0,0,14);};
      rock([[-12,4],[-11,-6],[-4,-10],[3,-9],[6,-3],[2,4],[-5,8]],shadeHex(c2,-0.45));
      rock([[-2,-8],[6,-11],[12,-5],[12,4],[7,10],[0,9],[-2,2]],shadeHex(c2,-0.35));
      rock([[-9,6],[-2,4],[5,7],[6,13],[-1,15],[-9,13]],shadeHex(c2,-0.5));
      /* раскалённые швы между глыбами */
      g.strokeStyle='rgba(255,'+Math.floor(150+80*Math.min(1,fuse))+',60,'+Math.min(1,0.85*glw)+')';g.lineWidth=1.4+fuse*1.5;g.lineCap='round';g.lineJoin='round';
      g.beginPath();g.moveTo(-3,-8+bob2*0.5);g.lineTo(-1,0+bob2*0.5);g.lineTo(-4,5+bob2*0.5);g.moveTo(-1,0+bob2*0.5);g.lineTo(4,6+bob2*0.5);g.moveTo(5,-7+bob2*0.5);g.lineTo(8,-2+bob2*0.5);g.stroke();
      olLight(g,(g)=>{g.fillStyle='rgba(255,170,60,'+(0.25*glw)+')';g.beginPath();g.arc(-1,1+bob2*0.5,5,0,TAU);g.fill();});
      /* голова-валун */
      const hy=-15+bob2;
      g.beginPath();g.moveTo(-5,hy+3);g.lineTo(-6,hy-2);g.lineTo(-2,hy-6);g.lineTo(4,hy-5.5);g.lineTo(7,hy-1);g.lineTo(5,hy+4);g.lineTo(0,hy+5);g.closePath();mobPath(g,shadeHex(c2,-0.3),0,hy,7);
      olLight(g,(g)=>{for(let k=0;k<4;k++){const fx=-3+k*2.6,fh=4+Math.sin(t*10+k*1.7)*2+fuse*4;g.fillStyle=k%2?'rgba(255,210,90,.85)':'rgba(255,120,30,.85)';g.beginPath();g.moveTo(fx-2,hy-5);g.quadraticCurveTo(fx,hy-5-fh*1.6,fx+2,hy-5);g.closePath();g.fill();}});
      mobEye(g,m,3,hy,1.8,{white:fuse>0.5?'#ffffff':'#ffd060',iris:'#5a1400',ir:0.4,glow:'#ffb040'});
      mobEye(g,m,-1.4,hy,1.6,{white:fuse>0.5?'#ffffff':'#ffd060',iris:'#5a1400',ir:0.4});
      g.strokeStyle='rgba(255,160,60,.9)';g.lineWidth=1;g.beginPath();g.moveTo(-1.5,hy+2.6);g.lineTo(3.5,hy+2.4);g.stroke();
      fist(1,true);
      if(fuse>0.3){g.fillStyle='rgba(255,255,255,'+(fuse*0.4*(0.5+0.5*Math.sin(t*30)))+')';g.beginPath();g.arc(0,0,15,0,TAU);g.fill();}
      break;}
    case 'ghost':{

      const wv=t*4+m.phase,big=m.w>24;
      /* рваный плащ-саван */
      g.beginPath();g.moveTo(-10,-3);g.quadraticCurveTo(-12,-18,0,-18.6);g.quadraticCurveTo(12,-18,10,-3);
      for(let k=0;k<=7;k++){const xx=10-k*20/7,yy=12+Math.sin(wv+k*1.3)*2.6+(k%2?3.2:-0.6);g.lineTo(xx+Math.sin(wv*0.6+k)*1.2,yy);}
      g.closePath();
      {const gr=g.createLinearGradient(0,-18,0,15);gr.addColorStop(0,shadeHex(c1,0.12));gr.addColorStop(0.55,c1);gr.addColorStop(1,hexA(c2,0.1));g.fillStyle=gr;g.fill();}
      /* бледная маска с прорезями */
      g.fillStyle='#e8e2f4';g.beginPath();g.moveTo(-6,-14);g.quadraticCurveTo(0,-19,7,-14);g.quadraticCurveTo(8,-6,4,-2);g.quadraticCurveTo(1,0,-2,-2);g.quadraticCurveTo(-7,-6,-6,-14);g.closePath();g.fill();
      g.fillStyle='rgba(120,100,160,.4)';g.beginPath();g.moveTo(-6,-14);g.quadraticCurveTo(-7,-6,-2,-2);g.quadraticCurveTo(-4,-8,-3,-14);g.closePath();g.fill();
      if(big){g.fillStyle='#e8e2f4';for(const sd of [-1,1]){g.beginPath();g.moveTo(sd*4,-16);g.quadraticCurveTo(sd*9,-22,sd*7,-27);g.quadraticCurveTo(sd*6,-21,sd*1.6,-17);g.closePath();g.fill();}}
      for(const ex of [-2.4,3.8]){g.fillStyle='#05030c';g.beginPath();g.ellipse(ex,-10,2,2.8,ex<0?0.2:-0.2,0,TAU);g.fill();mobGlow(g,ex,-10,5,'#a080ff',0.7);
        g.fillStyle='#d8c8ff';g.beginPath();g.arc(ex+(m.lookX||0)*m.facing*0.6,-10,0.8,0,TAU);g.fill();}
      g.strokeStyle='rgba(30,20,50,.6)';g.lineWidth=0.7;g.beginPath();g.moveTo(0.6,-6);g.lineTo(0.6,-3.4);g.stroke();
      /* когтистые руки */
      g.strokeStyle=hexA(shadeHex(c1,0.1),0.95);g.lineWidth=2.6;g.lineCap='round';
      g.beginPath();g.moveTo(8,-5);g.quadraticCurveTo(14,-3+Math.sin(wv)*2,15,3);g.stroke();
      g.beginPath();g.moveTo(-8,-5);g.quadraticCurveTo(-13,-2+Math.sin(wv+1)*2,-12,4);g.stroke();
      g.lineWidth=1;g.strokeStyle='#e8e2f4';for(const [hx,sg] of [[15,1],[-12,-1]]){for(let k=-1;k<=1;k++){g.beginPath();g.moveTo(hx,3+(sg<0?1:0));g.lineTo(hx+sg*2+k,6.5);g.stroke();}}
      break;}
    case 'thief':{

      const sack=1+Math.min(3,(m.loot?m.loot.length:0))*0.14;
      /* мешок с добычей */
      g.save();g.translate(-9,-3);g.rotate(Math.sin(t*4)*0.08);
      g.beginPath();g.moveTo(-5*sack,4*sack);g.quadraticCurveTo(-7*sack,-4*sack,0,-6*sack);g.quadraticCurveTo(7*sack,-4*sack,5*sack,4*sack);g.quadraticCurveTo(0,7*sack,-5*sack,4*sack);g.closePath();mobPath(g,'#9a7a44',0,0,7*sack);
      g.strokeStyle='#5a3a1a';g.lineWidth=1.2;g.beginPath();g.moveTo(-2,-5.6*sack);g.lineTo(2,-6*sack);g.stroke();
      g.fillStyle='rgba(0,0,0,.2)';g.beginPath();g.arc(1.6,0,1.6*sack,0,TAU);g.fill();
      if(m.loot&&m.loot.length){g.fillStyle='#ffd24a';g.beginPath();g.arc(-1,-6.8*sack,1.8,0,TAU);g.arc(1.6,-7*sack,1.4,0,TAU);g.fill();mobGlow(g,0,-7*sack,6,'#ffd24a',0.5);}
      g.restore();
      mobLeg(g,-2,6,0.25+sw*0.8,5,0.7,5,2.8,'#2a2418');
      /* сгорбленное тело в капюшоне */
      g.beginPath();g.moveTo(-6,-4);g.quadraticCurveTo(1,-10,8,-4);g.lineTo(8,8);g.quadraticCurveTo(0,10,-7,8);g.closePath();mobPath(g,c2,0,1,10);
      g.fillStyle=shadeHex(c2,-0.3);g.fillRect(-7,3,15,2);g.fillStyle='#caa24a';g.fillRect(-1,2.6,3,2.8);
      mobLeg(g,3,6,-0.25-sw*0.8,5,0.7,5,2.8,'#3a3220');
      g.beginPath();g.moveTo(-6,-4);g.quadraticCurveTo(-8,-15,1,-17);g.quadraticCurveTo(10,-16,9,-4);g.quadraticCurveTo(2,-6,-6,-4);g.closePath();mobPath(g,c1,0,-10,9);
      g.fillStyle=shadeHex(c1,-0.3);g.beginPath();g.moveTo(1,-17);g.quadraticCurveTo(-4,-20,-9,-14);g.quadraticCurveTo(-4,-15,-2,-15);g.closePath();g.fill();
      /* тёмное лицо, светящиеся глаза, повязка */
      g.fillStyle='#0a0806';g.beginPath();g.ellipse(3.4,-9.6,4.6,4.4,0,0,TAU);g.fill();
      g.fillStyle='#5a1a1a';g.fillRect(-1,-7.6,9.4,2.6);
      mobEye(g,m,5.4,-10.6,1.3,{white:'#ffe066',iris:'#ffe066',ir:0.1,glow:'#ffd040'});mobEye(g,m,2,-10.6,1.1,{white:'#ffe066',iris:'#ffe066',ir:0.1});
      /* кинжал */
      g.save();g.translate(6,-1);g.rotate(0.5+Math.sin(t*3)*0.12-m.tele*0.8);g.strokeStyle=c1;g.lineWidth=2.6;g.lineCap='round';g.beginPath();g.moveTo(0,0);g.lineTo(5,4);g.stroke();
      g.fillStyle='#4a3020';g.fillRect(4,2.6,3,3);g.fillStyle='#e8eef6';g.beginPath();g.moveTo(6.6,3.4);g.lineTo(15,1.4);g.lineTo(7,5.6);g.closePath();g.fill();g.fillStyle='rgba(255,255,255,.7)';g.fillRect(8,3,5,0.6);g.restore();
      break;}
    case 'horror':{

      const br=Math.sin(t*2+m.phase),wind=m.state==='windup'?m.tele:0,mv=Math.abs(m.vx)>5,wk2=m.anim*6;
      /* ноги-тумбы */
      const legL=(x,ph,c)=>{const st=mv?Math.sin(wk2+ph)*0.35:0;mobLeg(g,x,8,st,6,-0.25,6,6,c);g.fillStyle=shadeHex(c,-0.2);g.beginPath();g.ellipse(x+Math.sin(st)*6+1.5,FY-1,4.6,2.2,0,0,TAU);g.fill();};
      legL(-6,0,shadeHex(c2,-0.15));legL(6,Math.PI,c2);
      /* рука: плечо -> локоть -> когтистая кисть. В покое костяшками в пол, при замахе обе над головой */
      const arm=(sx,sy,dir,c,ph)=>{
        const rest=mv?Math.sin(wk2+ph)*0.35:Math.sin(t*1.5+ph)*0.08;
        const a1=dir*(0.35+rest*0.5)+wind*dir*2.4,k=dir*(-0.35-wind*0.4);
        g.save();const e=mobLeg(g,sx,sy,a1,11,k,11,6.2,c);
        /* предплечье толще у кисти */
        const a2=a1-k;g.strokeStyle=shadeHex(c,0.1);g.lineWidth=4;g.beginPath();g.moveTo(e[0]-Math.sin(a2)*6,e[1]-Math.cos(a2)*6);g.lineTo(e[0],e[1]);g.stroke();
        g.translate(e[0],e[1]);g.rotate(-a2);
        g.fillStyle=shadeHex(c,0.05);g.beginPath();g.ellipse(0,1.5,4.2,3.4,0,0,TAU);g.fill();
        g.fillStyle='#e8d8c0';for(let q=-1;q<=1;q++){g.beginPath();g.moveTo(q*2.6-1,3.6);g.quadraticCurveTo(q*3.4,8,q*2.6+1.6,9.6);g.quadraticCurveTo(q*2.8+0.6,6,q*2.6+1,3.6);g.fill();}
        g.restore();};
      arm(-11,-8,-1,shadeHex(c1,-0.3),Math.PI);
      /* туловище: сгорбленная туша с шипами */
      g.save();g.scale(1,1+br*0.025);
      g.fillStyle=shadeHex(c2,-0.3);
      for(let k=0;k<5;k++){const a=-2.6+k*0.32;g.beginPath();g.moveTo(Math.cos(a)*13,Math.sin(a)*14-2);g.lineTo(Math.cos(a+0.07)*21,Math.sin(a+0.07)*22-2);g.lineTo(Math.cos(a+0.16)*13,Math.sin(a+0.16)*14-2);g.closePath();g.fill();}
      g.beginPath();g.moveTo(-14,4);g.quadraticCurveTo(-17,-12,-4,-17);g.quadraticCurveTo(10,-19,14,-6);g.quadraticCurveTo(16,6,8,10);g.quadraticCurveTo(-6,13,-14,4);g.closePath();mobPath(g,c1,-3,-6,16);
      g.fillStyle=hexA(shadeHex(c1,0.25),0.4);g.beginPath();g.ellipse(2,4,7,4,0,0,TAU);g.fill();
      for(const [ex,ey,er] of [[-4,-9,2.3],[4,-11,2.8],[9,-6,1.8],[-1,-14,1.5],[7,-14,1.4]])mobEye(g,m,ex,ey,er,{white:'#ffe0f0',iris:'#c0104a',ir:0.55});
      {const open=Math.min(1.6,0.5+0.5*Math.sin(t*2)+m.tele);
      g.fillStyle='#1a0008';g.beginPath();g.ellipse(3,2,8,3+open*2.5,0,0,TAU);g.fill();
      mobGlow(g,3,2,8,'#ff2a6a',0.2+0.2*open);
      g.fillStyle='#f4ead6';
      for(let k=0;k<6;k++){const tx2=-4+k*2.8,top=2-3-open*2.5,bot=2+3+open*2.5;
        g.beginPath();g.moveTo(tx2-1.2,top+0.8);g.lineTo(tx2,top+3);g.lineTo(tx2+1.2,top+0.8);g.fill();
        g.beginPath();g.moveTo(tx2-1.2,bot-0.8);g.lineTo(tx2,bot-3);g.lineTo(tx2+1.2,bot-0.8);g.fill();}}
      g.restore();
      arm(11,-7,1,shadeHex(c1,-0.15),0);
      break;}
    case 'mole':{

      if(m.state==='under'||(m.state==='sink'&&m.st>0.2)){
        const gy=FY;
        g.fillStyle=mobG(g,0,gy-3,14,'#6a5038');g.beginPath();g.ellipse(0,gy,15,6.5,0,Math.PI,0);g.fill();
        g.fillStyle='rgba(0,0,0,.25)';for(let k=0;k<5;k++){g.beginPath();g.arc(-10+k*5,gy-2-(k%2)*2.4,1.5,0,TAU);g.fill();}
        g.fillStyle='#8a6a48';for(let k=0;k<3;k++){g.beginPath();g.arc(-6+k*6+Math.sin(t*9+k)*1,gy-5-Math.abs(Math.sin(t*7+k))*3,1.4,0,TAU);g.fill();}
        if(Math.sin(t*8)>0.6){g.fillStyle='#f0a8a0';g.beginPath();g.arc(2,gy-6,2.2,0,TAU);g.fill();}
      }else{
      const sh=m.state==='rise'?Math.sin(t*50)*1.4:0;
      g.translate(sh,m.state==='rise'?7:0);
      const dig=Math.sin(t*14)*0.5;
      /* бархатное тело-груша */
      g.beginPath();g.moveTo(-13,6);g.quadraticCurveTo(-15,-8,-2,-10);g.quadraticCurveTo(10,-11,12,-1);g.quadraticCurveTo(13,8,4,10);g.quadraticCurveTo(-8,11,-13,6);g.closePath();mobPath(g,c1,-2,-2,13);
      g.fillStyle=hexA(shadeHex(c1,0.35),0.5);g.beginPath();g.ellipse(2,5,7,4,0,0,TAU);g.fill();
      g.strokeStyle=hexA(shadeHex(c1,0.25),0.4);g.lineWidth=0.6;for(let k=0;k<6;k++){g.beginPath();g.moveTo(-10+k*3.6,-7+Math.abs(k-2.5)*0.6);g.lineTo(-11+k*3.6,-4.6);g.stroke();}
      /* шахтёрские очки на лбу */
      g.fillStyle='#3a3a40';g.fillRect(-2,-9.4,11,2);plBlob(g,1.4,-8.6,2.4,2.2,'#8ac0e0');plBlob(g,6.4,-8.6,2.4,2.2,'#8ac0e0');g.fillStyle='rgba(255,255,255,.7)';g.fillRect(0.6,-9.6,1,0.8);g.fillRect(5.6,-9.6,1,0.8);
      /* звёздчатый нос и щурящиеся глаза */
      mobBlob(g,12,0,4.6,3.6,'#f0b0a8');
      g.fillStyle='#e07080';for(let k=0;k<6;k++){const a=k/6*TAU+t*2;g.beginPath();g.ellipse(16+Math.cos(a)*2,-0.4+Math.sin(a)*2,1.4,0.7,a,0,TAU);g.fill();}
      g.fillStyle='#c04050';g.beginPath();g.arc(16,-0.4,1.3,0,TAU);g.fill();
      g.strokeStyle='#1a1010';g.lineWidth=1.1;g.lineCap='round';g.beginPath();g.moveTo(5.4,-4);g.quadraticCurveTo(6.6,-5,7.8,-4);g.stroke();
      g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=0.5;g.beginPath();g.moveTo(14,1.5);g.lineTo(19,3);g.moveTo(14,0.5);g.lineTo(19,-1);g.stroke();
      g.fillStyle='#fff';g.fillRect(10.6,3.2,1.4,2);g.fillRect(12.4,3.2,1.4,2);
      /* лапы-лопаты */
      for(const [cx,dc] of [[8,1],[-6,-1]]){g.save();g.translate(cx,7);g.rotate(dc*dig);plVol(g,dc*3,0,5,3,'#e8cca8');
        g.fillStyle='#fff4dc';for(let k=0;k<4;k++){g.beginPath();g.moveTo(dc*6.4,-2+k*1.3);g.lineTo(dc*10,-2.4+k*1.5);g.lineTo(dc*6.4,-1.2+k*1.3);g.fill();}g.restore();}
      }
      break;}
    case 'glowbug':{

      const fl=Math.sin(t*40+m.phase),pu=0.6+0.4*Math.sin(t*3+m.phase);
      /* светящееся брюшко-фонарик */
      mobGlow(g,-7,3,18,'#e8ff80',0.6*pu);
      olLight(g,(g)=>{g.fillStyle='rgba(225,255,245,.45)';for(const sd of [-1,1]){g.save();g.translate(-1,-5);g.rotate(sd*(0.7-fl*0.5));g.beginPath();g.ellipse(sd*7,-1,8,3.4,0,0,TAU);g.fill();g.restore();}});
      {const gr=g.createRadialGradient(-8,3,0.5,-7,3,7);gr.addColorStop(0,'#ffffe0');gr.addColorStop(0.5,'#e8ff80');gr.addColorStop(1,'#8ac030');g.fillStyle=gr;g.beginPath();g.ellipse(-7,3,6.5,5,0.2,0,TAU);g.fill();}
      g.strokeStyle='rgba(90,130,30,.6)';g.lineWidth=0.8;for(let k=0;k<3;k++){g.beginPath();g.arc(-7,3,2+k*1.6,-1.2,1.2);g.stroke();}
      mobBlob(g,1,-1,5.6,5,c2);mobShine(g,-0.5,-3.4,2.4,1.2,0.4);
      mobBlob(g,6.5,-2,4.6,4.2,shadeHex(c2,0.1));
      g.strokeStyle=shadeHex(c2,-0.3);g.lineWidth=0.9;g.lineCap='round';g.beginPath();g.moveTo(8,-5.6);g.quadraticCurveTo(10,-11,13,-11);g.moveTo(6.4,-6);g.quadraticCurveTo(7,-12,9.4,-13);g.stroke();
      g.fillStyle='#e8ff80';g.beginPath();g.arc(13,-11,1.2,0,TAU);g.arc(9.4,-13,1.1,0,TAU);g.fill();
      for(let k=0;k<3;k++)mobLeg(g,-1+k*3,3,0.4+Math.sin(t*20+k)*0.3,3,-0.6,3,1,shadeHex(c2,-0.3));
      mobEye(g,m,8.4,-2.6,2,{iris:'#14200a',ir:0.62});
      g.strokeStyle='#14200a';g.lineWidth=0.7;g.beginPath();g.arc(8.6,0.6,1.2,0.3,Math.PI-0.3);g.stroke();
      break;}
    case 'goblin':{

      const thr=m.tele;
      mobLeg(g,-3,6,0.15+sw*0.7,5,0.6,5,3.2,'#4a3a22');
      plBoot(g,-3+Math.sin(0.15+sw*0.7)*5,FY-1,0,'#3a2a18',1);
      /* жилетка с шашками-патронташем */
      g.beginPath();g.moveTo(-7,-5);g.quadraticCurveTo(0,-8,7,-5);g.lineTo(8,7);g.quadraticCurveTo(0,9,-8,7);g.closePath();mobPath(g,'#7a5632',0,0,9);
      g.strokeStyle='#4a2a14';g.lineWidth=2;g.beginPath();g.moveTo(-6,-5);g.lineTo(6,6);g.stroke();
      g.fillStyle='#d03a2a';for(let k=0;k<4;k++){g.save();g.translate(-4.6+k*3,-3.4+k*3);g.rotate(0.8);g.fillRect(-0.8,-2.2,1.6,4.4);g.restore();}
      g.fillStyle='#caa24a';g.fillRect(-8,4,16,2);
      mobLeg(g,3,6,-0.15-sw*0.7,5,0.6,5,3.2,'#5a4628');
      plBoot(g,3+Math.sin(-0.15-sw*0.7)*5,FY-1,0,'#4a3420',1);
      /* огромные уши */
      for(const sd of [-1,1]){g.beginPath();g.moveTo(sd*5,-14);g.quadraticCurveTo(sd*13,-20,sd*18,-15);g.quadraticCurveTo(sd*12,-12,sd*6,-9);g.closePath();mobPath(g,c1,sd*11,-14,7);
        g.fillStyle=shadeHex(c1,-0.25);g.beginPath();g.moveTo(sd*7,-13);g.quadraticCurveTo(sd*12,-16,sd*15,-15);g.quadraticCurveTo(sd*11,-13,sd*7,-11);g.fill();}
      /* голова с длинным носом */
      mobBlob(g,0,-12,8.4,7.6,c1);
      g.beginPath();g.moveTo(5,-13);g.quadraticCurveTo(12,-12,12.6,-8.6);g.quadraticCurveTo(9,-8.4,5.4,-9.6);g.closePath();mobPath(g,shadeHex(c1,-0.05),8,-11,4);
      mobEye(g,m,3,-14.6,2.2,{white:'#ffe066',iris:'#3a1a00',ir:0.55,brow:'#2a3a10'});mobEye(g,m,-2.2,-14.4,1.8,{white:'#ffe066',iris:'#3a1a00',ir:0.55,brow:'#2a3a10'});
      /* хитрая ухмылка */
      g.fillStyle='#2a0a04';g.beginPath();g.moveTo(-2,-8.2);g.quadraticCurveTo(2,-5.4,6,-8);g.quadraticCurveTo(2,-7,-2,-8.2);g.fill();
      g.fillStyle='#fff';g.fillRect(0.4,-7.9,1.2,1.2);g.fillRect(3.2,-7.9,1.2,1.4);
      /* каска с фонарём */
      g.beginPath();g.arc(0,-17,7.4,Math.PI,0);g.closePath();mobPath(g,'#c9a24a',0,-19,7);
      g.fillStyle='#9a7a2a';g.fillRect(-8.6,-17.6,17.2,1.8);
      plBlob(g,1,-20.4,2,2,'#fff6c0');mobGlow(g,1,-20.4,7,'#fff0a0',0.5);
      /* шашка динамита */
      g.save();g.translate(7,-4);g.rotate(-0.4-thr*1.8);
      g.strokeStyle=c1;g.lineWidth=2.8;g.lineCap='round';g.beginPath();g.moveTo(0,0);g.lineTo(0,7);g.stroke();
      g.fillStyle='#d03a2a';g.fillRect(-2.2,-11,4.4,11);g.fillStyle='#8a1a10';g.fillRect(-2.2,-4,4.4,1.2);g.fillStyle='rgba(255,255,255,.3)';g.fillRect(-1.6,-11,1,11);
      g.strokeStyle='#333';g.lineWidth=0.8;g.beginPath();g.moveTo(0,-11);g.quadraticCurveTo(2,-13,1.5,-15);g.stroke();
      if(thr>0.1){mobGlow(g,1.5,-15,7,'#ffd060',0.9);g.fillStyle='#fff8c0';g.beginPath();g.arc(1.5,-15,1.4+Math.sin(t*40)*0.6,0,TAU);g.fill();}
      g.restore();
      break;}
    case 'crab':{
      const open=m.provoked>0?0.6+Math.sin(t*12)*0.25:0.15+Math.sin(t*2)*0.05;
      for(let i=0;i<3;i++){const lx=-7+i*6;mobLeg(g,lx,3,-0.6+Math.sin(wk+i)*0.3,4.5,-1.0,4.5,1.6,shadeHex(c2,-0.2));mobLeg(g,lx+1,3,0.6+Math.sin(wk+i+2)*0.3,4.5,1.0,4.5,1.6,shadeHex(c2,-0.05));}
      g.beginPath();g.ellipse(0,0,13,8,0,0,TAU);mobPath(g,c1,-2,-3,13);
      g.fillStyle=hexA(shadeHex(c1,-0.35),0.6);for(let k=0;k<5;k++){g.beginPath();g.arc(-6+k*3,-3.5+Math.abs(k-2)*0.6,1,0,TAU);g.fill();}
      mobShine(g,-4,-5,5,1.6,0.3);
      for(const sd of [-1,1]){g.save();g.translate(sd*12,-3);g.rotate(sd*(-0.5-open*0.4));
        mobBlob(g,sd*3,-4,5.5,4.5,c1);
        g.beginPath();g.moveTo(sd*5,-5);g.lineTo(sd*12,-5-open*5);g.lineTo(sd*8,-2);g.closePath();mobPath(g,shadeHex(c1,-0.1),sd*8,-4,5);
        g.beginPath();g.moveTo(sd*5,-4);g.lineTo(sd*12,-4+open*4);g.lineTo(sd*8,-7);g.closePath();mobPath(g,shadeHex(c1,-0.1),sd*8,-5,5);
        g.restore();}
      g.strokeStyle=shadeHex(c2,-0.3);g.lineWidth=1.3;g.beginPath();g.moveTo(-3,-6);g.lineTo(-4,-11);g.moveTo(3,-6);g.lineTo(4,-11);g.stroke();
      mobEye(g,m,-4,-11.5,1.9,{iris:'#111',brow:m.provoked>0?'#5a1a0a':null});mobEye(g,m,4,-11.5,1.9,{iris:'#111'});
      break;}
    case 'fish':{

      const out=!mobInWater(m),bite=m.tele;
      g.rotate(out?Math.sin(t*20)*0.5:clamp(Math.atan2(m.vy,Math.abs(m.vx)+1)*0.5,-0.6,0.6));
      const tw=Math.sin(t*10+m.phase)*3;
      /* хвост-веер */
      g.beginPath();g.moveTo(-10,0);g.quadraticCurveTo(-15,-3,-19,-8+tw);g.quadraticCurveTo(-16,0,-19,8+tw);g.quadraticCurveTo(-15,3,-10,0);g.closePath();mobPath(g,c2,-15,0,7);
      g.strokeStyle=hexA(shadeHex(c2,0.4),0.6);g.lineWidth=0.6;for(let k=-2;k<=2;k++){g.beginPath();g.moveTo(-11,0);g.lineTo(-18,k*3+tw*0.8);g.stroke();}
      /* спинной плавник с шипами */
      g.beginPath();g.moveTo(-6,-5);g.lineTo(-4,-12);g.lineTo(-1,-8);g.lineTo(1,-13);g.lineTo(3,-8);g.lineTo(6,-11);g.lineTo(7,-5);g.closePath();mobPath(g,c2,0,-8,6);
      /* тело с крупной головой */
      g.beginPath();g.moveTo(-11,0);g.quadraticCurveTo(-6,-8,4,-7);g.quadraticCurveTo(13,-6,13,0);g.quadraticCurveTo(13,6,4,6.5);g.quadraticCurveTo(-6,7,-11,0);g.closePath();mobPath(g,c1,-1,-2,12);
      g.fillStyle='rgba(240,250,255,.55)';g.beginPath();g.moveTo(-8,2);g.quadraticCurveTo(2,7,12,2);g.quadraticCurveTo(4,4,-8,2);g.fill();
      g.fillStyle=hexA(shadeHex(c1,-0.35),0.45);for(let r=0;r<2;r++)for(let k=0;k<4;k++){g.beginPath();g.arc(-6+k*3.4+r*1.7,-2+r*3,1.3,Math.PI,0);g.fill();}
      /* жабры и челюсть с зубами */
      g.strokeStyle=hexA(shadeHex(c1,-0.5),0.8);g.lineWidth=1;g.beginPath();g.arc(6,0,4,-1.3,1.3);g.stroke();
      const jaw=0.15+bite*0.6+Math.max(0,Math.sin(t*3))*0.1;
      g.fillStyle='#0a1a2a';g.beginPath();g.moveTo(9,1.2);g.lineTo(14,0.4-jaw*2);g.lineTo(14,1.6+jaw*4);g.closePath();g.fill();
      g.fillStyle='#fff';for(let k=0;k<3;k++){g.beginPath();g.moveTo(10.4+k*1.2,0.9);g.lineTo(11+k*1.2,2.2);g.lineTo(11.6+k*1.2,0.8);g.fill();}
      /* удильщик-огонёк */
      g.strokeStyle=shadeHex(c2,-0.2);g.lineWidth=0.8;g.beginPath();g.moveTo(6,-7);g.quadraticCurveTo(10,-15,15,-11+Math.sin(t*4)*1.5);g.stroke();
      mobGlow(g,15,-11+Math.sin(t*4)*1.5,7,'#bff6ff',0.7);g.fillStyle='#e8fbff';g.beginPath();g.arc(15,-11+Math.sin(t*4)*1.5,1.5,0,TAU);g.fill();
      mobEye(g,m,8,-2.4,2.3,{iris:'#0a1a2a',ir:0.55,brow:ang?'#0a2a3a':null});
      break;}
    case 'prism':{
      /* призма-страж: огранённый кристалл с ядром-глазом и кольцом осколков */
      const rt=t*1.4+m.phase;
      const shards=(front)=>{for(let k=0;k<4;k++){const a=rt*1.3+k*TAU/4;if((Math.sin(a)>0)!==front)continue;
        const x=Math.cos(a)*20,y=Math.sin(a)*6-2,h=4+(k%2)*1.5;
        g.beginPath();g.moveTo(x,y-h);g.lineTo(x+2,y);g.lineTo(x,y+h*0.7);g.lineTo(x-2,y);g.closePath();
        g.fillStyle=front?c1:shadeHex(c1,-0.3);g.fill();g.strokeStyle=hexA('#ffffff',front?0.6:0.25);g.lineWidth=0.5;g.stroke();}};
      shards(false);
      mobGlow(g,0,-2,24,c1,0.3+m.tele*0.4);
      const fy=Math.sin(rt*0.7)*1.2;
      /* грани: тёмная левая, светлая правая, середина -- с переливом */
      const P=[[0,-19+fy],[8,-9+fy],[10,0+fy],[0,18+fy],[-10,0+fy],[-8,-9+fy]];
      const face=(pts,col)=>{g.beginPath();pts.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.closePath();g.fillStyle=col;g.fill();};
      face([P[0],P[5],P[4],[ -3,0+fy],[ -2,-9+fy]],shadeHex(c2,-0.1));
      face([P[0],[-2,-9+fy],[-3,0+fy],[3,0+fy],[2,-9+fy]],c1);
      face([P[0],[2,-9+fy],[3,0+fy],P[2],P[1]],shadeHex(c1,0.35));
      face([P[4],[-3,0+fy],P[3]],shadeHex(c2,-0.3));
      face([[-3,0+fy],[3,0+fy],P[3]],shadeHex(c2,0.1));
      face([[3,0+fy],P[2],P[3]],c1);
      g.beginPath();P.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]));g.closePath();g.strokeStyle=hexA('#ffffff',0.85);g.lineWidth=1;g.stroke();
      g.strokeStyle=hexA('#ffffff',0.35);g.lineWidth=0.6;g.beginPath();g.moveTo(-10,fy);g.lineTo(10,fy);g.moveTo(0,-19+fy);g.lineTo(-3,fy);g.lineTo(0,18+fy);g.lineTo(3,fy);g.lineTo(0,-19+fy);g.stroke();
      /* блик-перелив */
      g.fillStyle='rgba(255,255,255,'+(0.25+0.2*Math.sin(rt*2))+')';g.beginPath();g.moveTo(5,-12+fy);g.lineTo(7,-9+fy);g.lineTo(4,-2+fy);g.lineTo(3,-6+fy);g.closePath();g.fill();
      /* ядро-глаз */
      mobGlow(g,0,-3+fy,9+m.tele*8,'#ffffff',0.55+m.tele*0.4);
      g.fillStyle='#f6f0ff';g.beginPath();g.ellipse(0,-3+fy,4,2.8,0,0,TAU);g.fill();
      {const lx=(m.lookX||0)*m.facing*1.2;g.fillStyle=shadeHex(c2,-0.4);g.beginPath();g.arc(lx,-3+fy,1.8+m.tele*0.8,0,TAU);g.fill();
        g.fillStyle='#fff';g.beginPath();g.arc(lx-0.6,-3.7+fy,0.6,0,TAU);g.fill();}
      shards(true);
      break;}
    case 'turtle':{

      const hide=m.state==='hide';
      if(!hide){
        for(const [lx,ph] of [[-10,0],[8,Math.PI]]){const up=Math.max(0,Math.sin(wk*0.6+ph))*1.6;g.beginPath();g.ellipse(lx,6-up,3.6,4.2,0,0,TAU);mobPath(g,c2,lx,6,4);
          g.fillStyle=shadeHex(c2,-0.35);for(let k=0;k<3;k++)g.fillRect(lx-2.4+k*1.8,9-up,0.9,1.2);}
        g.save();g.translate(14,0);g.rotate(Math.sin(t*1.6+m.phase)*0.08);
        g.beginPath();g.ellipse(2,1,6,4.4,0.1,0,TAU);mobPath(g,c2,2,0,6);
        g.fillStyle=shadeHex(c2,0.2);g.beginPath();g.ellipse(3,3,3.6,1.4,0,0,TAU);g.fill();
        mobEye(g,m,4,-0.4,1.6,{iris:'#111',brow:'#2a3a1a'});
        g.strokeStyle=mobLine(c2);g.lineWidth=0.9;g.beginPath();g.moveTo(5,3);g.quadraticCurveTo(6.6,3.6,7.6,2.6);g.stroke();g.restore();
        g.beginPath();g.moveTo(-14,3);g.lineTo(-19,4.5);g.lineTo(-14,5.5);g.closePath();g.fillStyle=c2;g.fill();
      }
      const sy=hide?4:0;
      /* купол-панцирь с ободом и шестигранниками */
      g.beginPath();g.ellipse(0,sy+3,15.5,hide?9:10.5,0,Math.PI,0);g.lineTo(15.5,sy+4);g.lineTo(-15.5,sy+4);g.closePath();mobPath(g,c1,-3,sy-4,15);
      g.fillStyle=shadeHex(c1,-0.3);g.fillRect(-15.5,sy+2.6,31,2.6);g.fillStyle=shadeHex(c1,0.25);g.fillRect(-15.5,sy+2.6,31,0.8);
      g.strokeStyle=hexA(mobLine(c1),0.85);g.lineWidth=1.1;
      const hex=(hx,hy,r)=>{g.beginPath();for(let k=0;k<6;k++){const a=k/6*TAU;g.lineTo(hx+Math.cos(a)*r,hy+Math.sin(a)*r*0.7);}g.closePath();g.stroke();};
      hex(0,sy-3,4.2);hex(-8,sy-1,3.4);hex(8,sy-1,3.4);
      g.fillStyle='rgba(255,255,255,.18)';g.beginPath();g.ellipse(-5,sy-6,5,1.8,-0.2,0,TAU);g.fill();
      /* друза кристаллов на спине */
      const cc=['#c58bff','#7fe0ff','#ff8fd8','#9bffcf'];
      for(let k=0;k<4;k++){const bx=-6+k*4,by=sy-(hide?5:7)+Math.abs(k-1.5),hh=7+((k*7)%4)+Math.sin(t*3+k)*0.6;mobGlow(g,bx,by-4,7,cc[k],0.3);
        g.fillStyle=shadeHex(cc[k],-0.25);g.beginPath();g.moveTo(bx-2.6,by);g.lineTo(bx+2.6,by);g.lineTo(bx+0.4,by-hh);g.closePath();g.fill();
        g.fillStyle=cc[k];g.beginPath();g.moveTo(bx-2.6,by);g.lineTo(bx,by);g.lineTo(bx+0.4,by-hh);g.closePath();g.fill();
        g.fillStyle='rgba(255,255,255,.6)';g.fillRect(bx-1,by-hh*0.7,0.7,hh*0.5);}
      break;}
    case 'vulture':{
      /* стервятник: широкие крылья с маховыми перьями, голая шея, крючковатый клюв */
      const dive=m.state==='dive';
      const fl=Math.sin(t*(dive?24:6.5)+m.phase);
      const wing=(near)=>{g.save();g.translate(near?-1:1,-4);
        const a=dive?1.35:(0.5+fl*0.62)+(near?0:0.14);g.rotate(a);
        const col=near?c2:shadeHex(c2,-0.28);
        /* кроющие перья */
        g.beginPath();g.moveTo(0,-2);g.bezierCurveTo(-8,-7,-17,-6,-23,-3);g.lineTo(-22,1);g.bezierCurveTo(-15,2,-7,4,0,4);g.closePath();mobPath(g,col,-10,-1,12);
        /* маховые перья: веером к концу крыла */
        for(let k=0;k<6;k++){const bx=-9-k*2.6,by=1.5-k*0.4,len=6+k*1.1,an=0.25+k*0.16;
          g.beginPath();g.moveTo(bx+1.8,by-1);g.lineTo(bx-Math.sin(an)*len-1,by+Math.cos(an)*len);g.lineTo(bx-Math.sin(an)*len+1.6,by+Math.cos(an)*len+0.6);g.lineTo(bx+3,by);g.closePath();
          mobPath(g,k%2?shadeHex(col,-0.12):col,bx-2,by+3,5,true);}
        g.strokeStyle=hexA('#efe4cc',near?0.55:0.3);g.lineWidth=0.8;g.beginPath();g.moveTo(-2,0.5);g.quadraticCurveTo(-11,-1.5,-20,-1);g.stroke();
        g.restore();};
      if(dive)mobGlow(g,0,0,24,'#ff8a30',0.5);
      wing(false);
      /* хвост веером */
      for(let k=-1;k<=1;k++){g.beginPath();g.moveTo(-6,5);g.lineTo(-15,7+k*3);g.lineTo(-14,9.5+k*3);g.lineTo(-5,8);g.closePath();mobPath(g,shadeHex(c2,k?-0.2:-0.05),-9,7,6,true);}
      /* тело-капля */
      g.beginPath();g.moveTo(9,-3);g.bezierCurveTo(9,6,2,11,-6,8);g.bezierCurveTo(-11,6,-9,-4,-2,-6);g.bezierCurveTo(3,-7.5,8,-6,9,-3);g.closePath();mobPath(g,c1,0,0,10);
      g.strokeStyle=hexA(shadeHex(c1,-0.4),0.6);g.lineWidth=0.6;for(let k=0;k<3;k++){g.beginPath();g.arc(-2+k*3.4,2+k*1.2,3.2,0.3,1.6);g.stroke();}
      /* белый воротник */
      g.fillStyle='#ece2cc';g.beginPath();for(let k=0;k<9;k++){const a=Math.PI*(0.85+k*0.16);g.lineTo(4+Math.cos(a)*6.4,-6+Math.sin(a)*3);g.lineTo(4+Math.cos(a+0.08)*8.4,-5+Math.sin(a+0.08)*4.4);}g.closePath();g.fill();
      g.strokeStyle='rgba(120,100,80,.6)';g.lineWidth=0.6;g.stroke();
      /* голая шея и голова */
      g.strokeStyle='#c98a78';g.lineWidth=3;g.lineCap='round';g.beginPath();g.moveTo(5,-7);g.quadraticCurveTo(9,-11,8,-14);g.stroke();
      mobBlob(g,8.6,-15,4.4,3.9,'#d89a86');
      g.fillStyle='rgba(150,70,60,.45)';g.beginPath();g.ellipse(7.6,-13.4,2.2,1.4,0.3,0,TAU);g.fill();
      /* крючковатый клюв */
      g.beginPath();g.moveTo(11.8,-17);g.quadraticCurveTo(17.4,-16.6,16.6,-12);g.quadraticCurveTo(15.6,-13.6,12.6,-12.4);g.closePath();mobPath(g,'#e6c45a',14,-14.6,4);
      g.fillStyle='#3a2a10';g.beginPath();g.ellipse(13,-15.4,0.6,0.4,0,0,TAU);g.fill();
      mobEye(g,m,9.6,-16,1.5,{white:'#ffcc33',iris:'#2a0a00',ir:0.5,brow:'#3a1a10'});
      /* когтистые лапы */
      g.strokeStyle='#5a4028';g.lineWidth=1.5;g.lineCap='round';for(const sd of [-1.5,2.5]){g.beginPath();g.moveTo(sd,8);g.lineTo(sd+0.5,12);g.moveTo(sd+0.5,12);g.lineTo(sd+2.6,13.6);g.moveTo(sd+0.5,12);g.lineTo(sd-1.4,13.8);g.moveTo(sd+0.5,12);g.lineTo(sd+0.6,14.2);g.stroke();}
      wing(true);
      break;}
    case 'salamander':{
      /* саламандра: гибкое пятнистое тело с гребнем, тёплые светящиеся пятна, растопыренные лапы */
      const wv=Math.sin(t*5+m.phase);
      mobGlow(g,0,0,22,'#ff9a3a',0.18+0.08*wv);
      const N=12,sp=[];for(let i=0;i<=N;i++){const f=i/N;sp.push([-24+f*44,FY-5.5+Math.sin(t*5-f*4)*1.8*(1-f*0.6)-(f>0.85?(f-0.85)*8:0)]);}
      const wid=(i)=>{const f=i/N;return f<0.35?0.6+f/0.35*3.6:f<0.8?4.2+Math.sin((f-0.35)/0.45*Math.PI)*0.8:4.2-(f-0.8)/0.2*0.6;};
      for(let k=0;k<2;k++){const i=k?4:9;mobLeg(g,sp[i][0],sp[i][1]+2,-0.7+Math.sin(wk+k*2)*0.45,4,-0.9,3.6,2.2,shadeHex(c2,-0.15));}
      g.beginPath();for(let i=0;i<=N;i++){const w=wid(i);i?g.lineTo(sp[i][0],sp[i][1]-w):g.moveTo(sp[i][0],sp[i][1]-w);}
      g.quadraticCurveTo(sp[N][0]+5,sp[N][1]-1,sp[N][0]+4.6,sp[N][1]+1.6);
      for(let i=N;i>=0;i--){const w=wid(i)*0.9;g.lineTo(sp[i][0],sp[i][1]+w);}g.closePath();mobPath(g,c1,-2,-2,18);
      /* светлое брюшко */
      g.fillStyle='#ffe2a0';g.beginPath();for(let i=3;i<=N;i++){const w=wid(i)*0.9;g.lineTo(sp[i][0],sp[i][1]+w*0.35);}for(let i=N;i>=3;i--){const w=wid(i)*0.9;g.lineTo(sp[i][0],sp[i][1]+w-0.3);}g.closePath();g.fill();
      /* гребень */
      g.fillStyle=shadeHex(c2,-0.1);for(let i=2;i<N-1;i++){const w=wid(i);g.beginPath();g.moveTo(sp[i][0]-1.8,sp[i][1]-w+0.4);g.lineTo(sp[i][0]-0.4,sp[i][1]-w-1.8-(i%2)*0.8);g.lineTo(sp[i][0]+1.4,sp[i][1]-w+0.4);g.closePath();g.fill();}
      /* пятна */
      g.fillStyle='#2a0a04';for(let i=2;i<N;i++){const w=wid(i);g.beginPath();g.ellipse(sp[i][0]+(i%2)*1.2,sp[i][1]-w*0.35,1.3+(i%3)*0.3,0.9,0.2,0,TAU);g.fill();}
      olLight(g,(g)=>{g.fillStyle='rgba(255,210,90,.75)';for(let i=3;i<N;i+=2){const w=wid(i);g.beginPath();g.arc(sp[i][0]+(i%2)*1.2,sp[i][1]-w*0.35,0.7,0,TAU);g.fill();}});
      for(let k=0;k<2;k++){const i=k?3:8;mobLeg(g,sp[i][0]+1,sp[i][1]+2.4,0.7+Math.sin(wk+k*2+2)*0.45,4,0.9,3.6,2.4,c2);}
      /* голова */
      const hx=sp[N][0],hy=sp[N][1];
      mobEye(g,m,hx-0.6,hy-3.4,1.9,{white:'#ffe066',iris:'#3a0a00',ir:0.45,pupil:'#000'});
      g.strokeStyle=mobLine(c1);g.lineWidth=0.8;g.beginPath();g.moveTo(hx-3,hy+1.2);g.quadraticCurveTo(hx+1,hy+2,hx+4,hy+0.6);g.stroke();
      if(Math.sin(t*3+m.phase)>0.7){g.strokeStyle='#ff5a6a';g.lineWidth=0.9;g.beginPath();g.moveTo(hx+4.4,hy+0.6);g.lineTo(hx+7.4,hy+1);g.moveTo(hx+7.4,hy+1);g.lineTo(hx+8.4,hy-0.2);g.moveTo(hx+7.4,hy+1);g.lineTo(hx+8.4,hy+2);g.stroke();}
      break;}
    case 'eye':{
      for(let k=0;k<5;k++){g.strokeStyle=hexA(shadeHex(c2,0.1),0.85);g.lineWidth=2.2-k*0.2;g.lineCap='round';g.beginPath();g.moveTo(-8+k*4,10);g.quadraticCurveTo(-9+k*5+Math.sin(t*3+k)*3,18,-7+k*4+Math.sin(t*2+k*1.7)*4,25);g.stroke();}
      mobGlow(g,0,0,26,c1,0.25+m.tele*0.35);
      {const gr=g.createRadialGradient(-5,-6,2,0,0,16);gr.addColorStop(0,'#ffffff');gr.addColorStop(0.7,'#ece4f6');gr.addColorStop(1,'#b8a8cc');
      g.fillStyle=gr;g.beginPath();g.arc(0,0,15,0,TAU);g.fill();g.strokeStyle=mobLine(c2);g.lineWidth=1.2;g.stroke();}
      g.strokeStyle='rgba(200,60,90,.5)';g.lineWidth=0.7;
      for(let k=0;k<7;k++){const a=k*0.9+0.3;g.beginPath();g.moveTo(Math.cos(a)*14.5,Math.sin(a)*14.5);g.quadraticCurveTo(Math.cos(a+0.2)*11,Math.sin(a+0.2)*11,Math.cos(a)*8,Math.sin(a)*8);g.stroke();}
      {const ix=(m.lookX||0)*m.facing*5,iy=(m.lookY||0)*5;
      const ig=g.createRadialGradient(ix,iy,1,ix,iy,8);ig.addColorStop(0,shadeHex(c2,0.45));ig.addColorStop(1,c2);
      g.fillStyle=ig;g.beginPath();g.arc(ix,iy,8-m.tele*1.5,0,TAU);g.fill();
      g.fillStyle='#08040e';g.beginPath();g.ellipse(ix,iy,1.8+m.tele*1.6,3.8-m.tele*1.2,0,0,TAU);g.fill();
      g.fillStyle='rgba(255,255,255,.85)';g.beginPath();g.arc(ix-2.6,iy-2.8,1.6,0,TAU);g.fill();}
      {const blink=Math.sin(m.anim*0.9+m.phase*3)>0.97;
      g.fillStyle=shadeHex(c2,-0.2);g.globalAlpha=m.alpha*(blink?1:Math.max(0,0.2-m.tele*0.2));
      g.beginPath();g.arc(0,0,15.5,Math.PI*1.08,Math.PI*1.92);g.closePath();g.fill();g.globalAlpha=m.alpha;}
      if(m.tele>0.1){g.strokeStyle='rgba(232,208,255,'+m.tele+')';g.lineWidth=2;g.beginPath();g.arc(0,0,17+m.tele*5,0,TAU);g.stroke();}
      break;}
    case 'spirit':{
      const ready=(m.cd||0)<=0;
      g.globalAlpha=m.alpha*0.92;
      {const tl=g.createLinearGradient(0,-4,0,18);tl.addColorStop(0,hexA(c1,0.9));tl.addColorStop(1,hexA(c2,0));
      g.fillStyle=tl;g.beginPath();g.moveTo(-7,0);g.quadraticCurveTo(-9+Math.sin(t*3)*3,12,-3+Math.sin(t*4)*4,19);g.quadraticCurveTo(2,10,0,19);g.quadraticCurveTo(8+Math.sin(t*3.4)*3,12,7,0);g.closePath();g.fill();}
      mobGlow(g,0,-6,22,c1,0.35);
      {const og=g.createRadialGradient(-2,-9,1,0,-6,13);og.addColorStop(0,'#ffffff');og.addColorStop(0.5,c1);og.addColorStop(1,hexA(c2,0.2));
      g.fillStyle=og;g.beginPath();g.arc(0,-6,12,0,TAU);g.fill();}
      mobEye(g,m,-3,-7,1.8,{white:'#0d3a30',iris:'#c8fff0',ir:0.35});mobEye(g,m,3,-7,1.8,{white:'#0d3a30',iris:'#c8fff0',ir:0.35});
      g.strokeStyle='#0d3a30';g.lineWidth=0.8;g.beginPath();g.arc(0,-3,1.8,0.3,Math.PI-0.3);g.stroke();
      g.strokeStyle='rgba(200,255,240,'+(ready?0.95:0.25)+')';g.lineWidth=1.6;g.beginPath();g.ellipse(0,-20,8,2.6,0,0,TAU);g.stroke();
      if(ready){g.strokeStyle='rgba(168,255,232,'+(0.3+0.3*Math.sin(t*4))+')';g.beginPath();g.arc(0,-6,17+Math.sin(t*4)*1.5,0,TAU);g.stroke();}
      g.globalAlpha=m.alpha;
      break;}
    default:{mobBlob(g,0,0,12,12,c1);}
  }
  g.restore();
  });
  /* накладки: подготовка атаки, щит, оглушение */
  g.scale(m.facing,1);
  if(m.tele>0.12&&!['laser','gazer'].includes(def.mech)){
    const rr=Math.max(m.w,m.h)*0.7+4;
    g.strokeStyle='rgba(255,70,50,'+(0.25+m.tele*0.6)+')';g.lineWidth=2;
    g.beginPath();g.arc(0,-m.h*0.5,rr+(1-m.tele)*8,0,TAU);g.stroke();
    if(m.tele>0.6){g.fillStyle='rgba(255,90,60,'+(0.5+0.5*Math.sin(t*30))+')';g.font='800 14px system-ui,sans-serif';g.textAlign='center';g.fillText('!',0,-m.h-14);}
  }
  if(m.shield>0){
    g.strokeStyle='rgba(125,255,176,'+(0.35+0.2*Math.sin(t*8))+')';g.lineWidth=2;
    g.beginPath();g.arc(0,-m.h*0.5,Math.max(m.w,m.h)*0.7+6,0,TAU);g.stroke();
    g.fillStyle='rgba(125,255,176,.1)';g.fill();
  }
  if(m.stun>0){
    g.fillStyle='#ffe066';
    for(let k=0;k<3;k++){const a=t*6+k*2.1;g.fillRect(Math.cos(a)*10-1.5,-m.h-8+Math.sin(a)*3,3,3);}
  }
  if(def.neutral&&m.provoked>0){g.fillStyle='#ff5a4a';g.font='800 13px system-ui,sans-serif';g.textAlign='center';g.fillText('💢',0,-m.h-10);}
  g.scale(m.facing,1);
  if(m.elite){
    olLight(g,(g)=>{const ea=0.25+0.15*Math.sin(t*5);
    const gr=g.createRadialGradient(0,-m.h*0.5,4,0,-m.h*0.5,m.w*0.9);gr.addColorStop(0,hexA(m.elite.c,ea));gr.addColorStop(1,hexA(m.elite.c,0));
    g.fillStyle=gr;g.beginPath();g.arc(0,-m.h*0.5,m.w*0.9,0,TAU);g.fill();});
    g.save();g.scale(m.facing,1);g.fillStyle=m.elite.c;g.font='800 10px system-ui,sans-serif';g.textAlign='center';g.fillText('★ '+m.elite.n,0,-m.h-18);g.restore();
  }
  if(m.hp<m.maxHp&&!def.boss){
    const bw=Math.max(24,m.w*0.9),bh=4;
    const by=-m.h-12;
    g.fillStyle='rgba(0,0,0,.6)';g.fillRect(-bw/2-1,by-1,bw+2,bh+2);
    g.fillStyle=def.neutral&&!(m.provoked>0)?'#7ad07a':'#ff4d4d';g.fillRect(-bw/2,by,bw*clamp(m.hp/m.maxHp,0,1),bh);
  }
  g.restore();
}

function drawOreShape(g,x,y,size,o,t){
  if(settings.simpleOre){                 /* как в ранних версиях: четыре плоских самородка с бликами */
    const r=size*0.15,pts=[[0.30,0.34],[0.64,0.30],[0.46,0.66],[0.72,0.62]];
    g.fillStyle=o.color;
    for(let k=0;k<4;k++){const p=pts[k],cx=x+p[0]*size,cy=y+p[1]*size;g.beginPath();
      for(let i=0;i<6;i++){const a=i/6*TAU+o.id,rr=r*(0.75+0.5*((i*13+o.id*7+k*3)%5)/4);g.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);}
      g.closePath();g.fill();}
    g.fillStyle=hexA(o.glow||'#ffffff',0.75);
    for(let k=0;k<3;k++){const p=pts[k];g.beginPath();g.arc(x+p[0]*size-r*0.25,y+p[1]*size-r*0.25,r*0.32,0,TAU);g.fill();}
    return;
  }
  const h=hash2(Math.floor(x/32),Math.floor(y/32),o.id*31+5);
  const n=3+(h%3),rare=(o.rar||0)>=2;
  /* тёмное «гнездо» в породе */
  g.fillStyle='rgba(0,0,0,.22)';
  g.beginPath();g.ellipse(x+size*0.5,y+size*0.52,size*0.36,size*0.3,(h%7)*0.4,0,TAU);g.fill();
  for(let k=0;k<n;k++){
    const hk=hash2(h,k,77);
    const cx=x+size*(0.24+((hk%1000)/1000)*0.52),cy=y+size*(0.24+(((hk>>10)%1000)/1000)*0.52);
    const r=size*(0.09+((hk>>20)%7)*0.013)*(k===0?1.3:1);
    const rot=(hk%628)/100;
    const sides=rare?5:6;
    const pts=[];for(let i2=0;i2<sides;i2++){const a=rot+i2/sides*TAU;const rr2=r*(0.78+0.4*(((hk>>(i2*3))&7)/7));pts.push([cx+Math.cos(a)*rr2,cy+Math.sin(a)*rr2*0.9]);}
    /* контур-тень */
    g.fillStyle='rgba(0,0,0,.45)';g.beginPath();pts.forEach((p,i3)=>i3?g.lineTo(p[0]+0.8,p[1]+1.2):g.moveTo(p[0]+0.8,p[1]+1.2));g.closePath();g.fill();
    /* тело самородка */
    g.fillStyle=o.color;g.beginPath();pts.forEach((p,i3)=>i3?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill();
    /* тёмная грань снизу-справа */
    g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.moveTo(cx,cy);for(let i3=0;i3<=Math.floor(sides/2);i3++){const p=pts[(i3+1)%sides];g.lineTo(p[0],p[1]);}g.closePath();g.fill();
    /* светлая грань и блик */
    g.fillStyle=hexA(o.glow,0.55);g.beginPath();g.moveTo(cx,cy);const pa=pts[sides-2],pb=pts[sides-1];g.lineTo(pa[0],pa[1]);g.lineTo(pb[0],pb[1]);g.closePath();g.fill();
    g.fillStyle='rgba(255,255,255,.75)';g.fillRect(cx-r*0.45,cy-r*0.5,Math.max(1,r*0.35),Math.max(1,r*0.22));
  }
  if(rare){g.fillStyle=hexA(o.glow,0.9);const sx=x+size*(0.3+(h%40)/100),sy=y+size*(0.3+((h>>6)%40)/100);g.fillRect(sx-2.5,sy-0.5,5,1);g.fillRect(sx-0.5,sy-2.5,1,5);}
}
function drawLadderTile(g,x,y,t){
  g.fillStyle='#7a4a20';g.fillRect(x+7,y,4,TILE);g.fillRect(x+TILE-11,y,4,TILE);
  g.fillStyle='#c89050';
  for(let i=0;i<3;i++)g.fillRect(x+7,y+6+i*10,TILE-14,3);
  g.fillStyle='rgba(255,220,150,.25)';
  g.fillRect(x+7,y,2,TILE);g.fillRect(x+TILE-11,y,2,TILE);
}
/* Декор блоков разделён: неподвижное (внутри клетки) уходит в кэш участков,
   живое мерцание и то, что выступает за клетку (трава, грибы), рисуется каждый кадр. */
function drawDecorStatic(g,tx,ty,t){
  if(t===T_WOOD||t===T_BRICK||t===T_BONE||t===T_SPRING||t===T_HOT||t===T_VENT||t===T_BARRICADE)return;
  const b=biomeAt(ty);
  const h=hash2(tx,ty,913);
  const x=tx*TILE,y=ty*TILE;
  const r=h%100;
  if(b>=5){
    if(t===T_ARENA||t===T_BASALT||t===T_SOULSTONE)return;
    if(b===5&&r<10){g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(x+10+(h%12),y+12+((h>>4)%10),4,2,0.4,0,TAU);g.fill();}
    else if(b===6&&r<18){g.strokeStyle='rgba(50,0,8,.6)';g.lineWidth=2;g.beginPath();g.moveTo(x,y+(h%28)+2);g.quadraticCurveTo(x+16,y+((h>>5)%32),x+32,y+((h>>9)%28)+2);g.stroke();}
    else if(b===7&&r<12){g.fillStyle='rgba(255,255,160,.2)';g.beginPath();g.arc(x+8+(h%16),y+8+((h>>4)%16),3,0,TAU);g.fill();}
    else if(b===8&&r<6){g.fillStyle='rgba(235,230,215,.4)';g.beginPath();g.arc(x+16,y+14,5,0,TAU);g.fill();g.fillRect(x+13,y+17,6,4);g.fillStyle='rgba(0,0,0,.5)';g.fillRect(x+13,y+13,2,2);g.fillRect(x+17,y+13,2,2);}
    else if(b===9&&r<24){g.strokeStyle='rgba(255,140,40,.7)';g.lineWidth=1.4;g.beginPath();let cx=x+3,cy=y+6+(h%18);g.moveTo(cx,cy);for(let i=0;i<3;i++){cx+=9;cy+=((h>>(i*3))%11)-5;g.lineTo(cx,cy);}g.stroke();}
    return;
  }
  if(b===0){
    if(r<14){g.fillStyle='rgba(0,0,0,.22)';g.beginPath();g.arc(x+8+(h%14),y+20+((h>>4)%8),3,0,TAU);g.fill();}
    if(r>=20&&r<27){g.strokeStyle='rgba(60,40,20,.6)';g.lineWidth=1.4;g.beginPath();g.moveTo(x+4,y+6);g.quadraticCurveTo(x+14,y+16,x+8,y+28);g.stroke();}
  }else if(b===1){
    if(r>=55&&r<63){g.fillStyle='rgba(255,255,255,.06)';g.fillRect(x+(h%20)+4,y+(h%18)+6,4,3);}
    if(r>=63&&r<68){g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.arc(x+10+(h%12),y+10+((h>>3)%12),2.4,0,TAU);g.fill();}
  }else if(b===2){
    if(r>=34&&r<40){g.fillStyle='rgba(140,120,255,.14)';g.fillRect(x+5,y+5,TILE-10,TILE-10);}
  }else if(b===3){
    if(r<30){
      g.strokeStyle='rgba(255,120,40,.8)';g.lineWidth=1.6;
      g.beginPath();
      let cxx=x+4,cyy=y+6+(h%18);g.moveTo(cxx,cyy);
      for(let i=0;i<3;i++){cxx+=8;cyy+=((h>>(i*3))%11)-5;g.lineTo(cxx,cyy);}
      g.stroke();
      g.strokeStyle='rgba(255,220,120,.45)';g.lineWidth=0.8;g.stroke();
    }
  }else{
    if(r<3){
      g.strokeStyle='rgba(210,205,225,.35)';g.lineWidth=1.4;
      g.beginPath();
      for(let k=0;k<=28;k++){const a=k*0.42,rad=1+k*0.35;const px=x+16+Math.cos(a)*rad,py=y+16+Math.sin(a)*rad;if(k)g.lineTo(px,py);else g.moveTo(px,py);}
      g.stroke();
    }
    if(r>=34&&r<44){g.strokeStyle='rgba(120,80,220,.35)';g.lineWidth=1.2;g.beginPath();g.moveTo(x+6,y+26);g.lineTo(x+14,y+12);g.lineTo(x+24,y+24);g.stroke();}
  }
}
function drawDecor(g,tx,ty,t){
  if(t===T_WOOD||t===T_BRICK||t===T_BONE||t===T_SPRING||t===T_HOT||t===T_VENT||t===T_BARRICADE)return;
  const b=biomeAt(ty);
  const h=hash2(tx,ty,913);
  const r=h%100;
  if(b>=5){
    if(t===T_ARENA)return;
    const x=tx*TILE,y=ty*TILE;
    if(t===T_SOULSAND){if(getTile(tx,ty-1)===T_AIR){const ph=(G.time*0.5+(h%17)*0.13)%1;if(h%3===0){g.fillStyle='rgba(150,210,255,'+(0.5*Math.sin(ph*Math.PI))+')';g.beginPath();g.ellipse(x+8+(h%16),y-ph*18,1.6,3+ph*3,0,0,TAU);g.fill();}}
      const p2=0.5+0.5*Math.sin(G.time*1.5+h);if(h%4===0){g.fillStyle='rgba(120,190,255,'+(0.12+0.15*p2)+')';g.beginPath();g.ellipse(x+10+(h%12),y+14,2,2.6,0,0,TAU);g.ellipse(x+15+(h%12),y+14,2,2.6,0,0,TAU);g.fill();}return;}
    if(t===T_ASHVENT){const ph=((G.time+hash2(tx,ty,5)%60/10)%5.2);if(ph>3.6&&ph<4.4){g.fillStyle='rgba(255,140,60,'+(0.3+0.4*(ph-3.6)/0.8)+')';g.beginPath();g.ellipse(x+16,y+4,7,3,0,0,TAU);g.fill();}
      else if(ph>=4.4){g.save();g.globalCompositeOperation='lighter';softGlow(g,x+16,y,26,'#ff8a3a',0.6);g.restore();}return;}
    if(t===T_FLESHPOD){const p2=1+0.08*Math.sin(G.time*4+h);g.fillStyle='#a02a40';g.beginPath();g.ellipse(x+16,y+16,10*p2,9*p2,0,0,TAU);g.fill();g.fillStyle='rgba(255,170,190,.45)';g.beginPath();g.ellipse(x+13,y+12,4*p2,2.6*p2,-0.4,0,TAU);g.fill();
      g.strokeStyle='rgba(60,0,12,.7)';g.lineWidth=1;g.beginPath();g.moveTo(x+10,y+18);g.quadraticCurveTo(x+16,y+14*p2,x+22,y+19);g.stroke();return;}
    if(t===T_SULFBOMB){const p2=0.5+0.5*Math.sin(G.time*5+h);if(h%2===0){g.fillStyle='rgba(255,255,140,'+(0.15+0.3*p2)+')';g.fillRect(x+6+(h%16),y+6+((h>>3)%16),3,3);}return;}
    if(t===T_CRUST){const k=crustT.get(tx+','+ty)||0;const p2=0.5+0.5*Math.sin(G.time*2+h);g.strokeStyle='rgba(255,'+(140+Math.floor(80*k))+',40,'+(0.35+0.3*p2+k*0.5)+')';g.lineWidth=1.2+k*2;
      g.beginPath();g.moveTo(x+4,y+6);g.lineTo(x+14,y+10+k*4);g.lineTo(x+28,y+5);g.moveTo(x+14,y+10);g.lineTo(x+16,y+26);g.stroke();if(k>0.2){g.fillStyle='rgba(255,200,80,'+k*0.6+')';g.fillRect(x+12,y+8,6,6);}return;}
    if(t===T_BSPIKE){if(getTile(tx,ty-1)===T_AIR){g.fillStyle='#e8e0cc';for(let q=0;q<4;q++){const sx=x+3+q*7.5,sh=8+((h>>q)%5);g.beginPath();g.moveTo(sx-2.6,y+1);g.lineTo(sx,y-sh);g.lineTo(sx+2.6,y+1);g.closePath();g.fill();}
      g.fillStyle='rgba(120,10,20,.6)';g.fillRect(x+3,y-3,1.4,2);}return;}
    if(b===9&&r>=24&&r<34){const p=0.5+0.5*Math.sin(G.time*3+tx*2.1+ty*1.3);g.fillStyle='rgba(255,170,60,'+(0.3+0.4*p).toFixed(2)+')';g.fillRect(x+4+(h%20),y+4+((h>>3)%20),4,4);}
    else if(t===T_SOULSTONE&&r<40){const p=0.5+0.5*Math.sin(G.time*2+tx+ty);g.fillStyle='rgba(150,220,255,'+(0.2+0.4*p).toFixed(2)+')';g.fillRect(x+8+(h%14),y+8+((h>>4)%14),3,3);}
    else if(b===6&&r>=90&&!isSolid(tx,ty+1)&&getTile(tx,ty+1)===T_AIR){const ph=(G.time*0.7+(h%9)*0.31)%1.6;if(ph<1){g.fillStyle='#a0101e';g.beginPath();g.arc(x+16,y+TILE+ph*40,2.2,0,TAU);g.fill();}}
    return;
  }
  if(b===0){
    if(r>=40&&!(r>=27&&r<31))return;
  }else if(b===1)return;
  else if(b===2){if(r<40||r>=45)return;}
  else if(b===3){if(r<30||r>=44)return;}
  else if(b===4){if(r<16||r>=34)return;}
  const x=tx*TILE,y=ty*TILE;
  if(b===0){
    if(!isSolid(tx,ty-1)&&r<40){
      g.strokeStyle='#5c8a3e';g.lineWidth=1.6;
      g.beginPath();
      for(let i=0;i<3;i++){const gx=x+6+i*9;g.moveTo(gx,y);g.lineTo(gx+((h>>(i*3))%3)-1,y-4-((h>>(i*2+4))%5));}
      g.stroke();
    }
    if(r>=27&&r<31&&!isSolid(tx,ty-1)&&getTile(tx,ty-1)===T_AIR){
      g.fillStyle='#d8cfa8';g.fillRect(x+13,y-6,3,6);
      g.fillStyle='#e05a5a';g.beginPath();g.ellipse(x+14.5,y-6,5,3.6,0,Math.PI,0);g.fill();
      g.fillStyle='rgba(255,255,255,.6)';g.fillRect(x+12,y-8,1.6,1.6);g.fillRect(x+16,y-9,1.6,1.6);
    }
  }else if(b===2){
    const p=0.5+0.5*Math.sin(G.time*2.5+tx*1.7+ty);
    g.fillStyle='rgba(160,220,255,'+(0.3+0.4*p).toFixed(2)+')';
    g.fillRect(x+7+(h%16),y+7+((h>>4)%16),3,3);
  }else if(b===3){
    if(!isSolid(tx,ty-1)&&r>=30&&r<38){
      g.fillStyle='#3a1408';g.fillRect(x+10,y-3,12,5);
      g.fillStyle='rgba(255,140,50,.9)';g.fillRect(x+12,y-4,8,2);
    }
    if(r>=38&&r<44){
      const p=0.5+0.5*Math.sin(G.time*3+tx*2.1+ty*1.3);
      g.fillStyle='rgba(255,150,60,'+(0.25+0.35*p).toFixed(2)+')';
      g.fillRect(x+4+(h%20),y+4+((h>>3)%20),4,4);
    }
  }else{
    const p=0.5+0.5*Math.sin(G.time*2+tx+ty);
    const sz=3+(h%3);
    g.fillStyle='rgba(150,90,255,'+(0.25+0.35*p).toFixed(2)+')';
    g.fillRect(x+8+(h%16)-sz/2,y+8+((h>>4)%16)-sz/2,sz,sz);
  }
}

let ambT=0;
/* поверхность под ногами — для звука шагов */
function footMat(){const t=getTile(Math.floor(player.x/TILE),Math.floor((player.y+4)/TILE));
  if(t===T_WOOD||t===T_LADDER||t===T_BARRICADE)return 'wood';
  if(t===T_CRYSTAL||t===T_SOULSTONE)return 'crystal';
  if(t===T_DIRT||t===T_FLESH||t===T_SOULSAND)return 'dirt';
  if(t===T_ASH)return 'ash';
  if(t===T_ARENA||t===T_BRICK)return 'metal';
  return 'stone';}
function landDustCol(){const t=getTile(Math.floor(player.x/TILE),Math.floor((player.y+4)/TILE));const c=TILECOL[t];return c?shadeHex(c[0],0.25):'#a89880';}
function ambientParticles(dt){
  ambT-=dt;
  if(ambT>0)return;
  ambT=settings.quality==='low'?0.24:0.08;
  if(parts.length>partBudget*0.7)return;
  const bi=biomeAt(Math.max(0,player.y)/TILE);
  const hw=view.W/(2*view.scale),hh=view.H/(2*view.scale);
  const x=G.cam.x+rnd(-hw,hw),y=G.cam.y+rnd(-hh,hh);
  const tt=getTile(Math.floor(x/TILE),Math.floor(y/TILE));
  if(tt!==T_AIR)return;
  switch(bi){
    case 0:spawnPart(x,y,rnd(-6,6),rnd(-10,-2),rnd(3,5),'#b89a72',1.6,0);break;
    case 1:if(Math.random()<0.5)spawnPart(x,y,rnd(-4,4),rnd(-4,4),rnd(3,5),'#8a8e9a',1.4,0);else spawnPart(x,y,0,20,0.9,'#7aa8d8',1.4,380);break;
    case 2:spawnPart(x,y,rnd(-8,8),rnd(-18,-6),rnd(3,6),Math.random()<0.5?'#9be8ff':'#d8a8ff',2,0);break;
    case 3:spawnPart(x,y,rnd(-14,14),rnd(-50,-22),rnd(1.4,2.6),Math.random()<0.6?'#ff8a30':'#ffd060',1.8,-30);break;
    case 4:spawnPart(x,y,rnd(-16,16),rnd(-6,6),rnd(3,6),'#b090ff',1.8,0);break;
    case 5:spawnPart(x,y,rnd(10,30),rnd(8,24),rnd(3,6),Math.random()<0.8?'#8a7e76':'#ff7a3a',Math.random()<0.8?1.8:1.4,0);break;
    case 6:if(Math.random()<0.5)spawnPart(x,y,rnd(-4,4),rnd(-8,-2),rnd(3,5),'#8a1a2a',1.6,0);else spawnPart(x,y,0,10,0.9,'#a0101e',1.6,360);break;
    case 7:spawnPart(x,y,rnd(-6,6),rnd(-14,-4),rnd(3,6),Math.random()<0.6?'#c8e84a':'#e8e070',2.2,0);break;
    case 8:spawnPart(x,y,rnd(-10,10),rnd(-10,4),rnd(3,6),'#8ad0ff',1.6,0);break;
    case 9:spawnPart(x,y,rnd(-18,18),rnd(-60,-26),rnd(1.2,2.4),Math.random()<0.5?'#ff6a1a':'#ffd060',2,-36);break;
    default:spawnPart(x,y,rnd(-16,16),rnd(-6,6),rnd(3,6),'#b090ff',1.8,0);
  }
}

function drawExitStructure(g,t){
  const left=(ROOM_X0)*TILE-6;
  const right=(ROOM_X1+1)*TILE+6;
  const top=(ROOM_Y0)*TILE-30;
  const bottom=(ROOM_Y1+1)*TILE;
  const cx=(ROOM_X0+ROOM_X1+1)/2*TILE;
  g.fillStyle='#5a3f22';
  g.fillRect(left,top,14,bottom-top+18);g.fillRect(right-14,top,14,bottom-top+18);
  g.fillRect(left,top,right-left,14);
  g.fillStyle='#7a5632';
  g.fillRect(left+3,top+3,8,bottom-top+12);g.fillRect(right-11,top+3,8,bottom-top+12);
  g.fillStyle='#2a1c10';g.fillRect(cx-58,top-42,116,32);
  g.strokeStyle='#ffd98a';g.lineWidth=2;
  g.strokeRect(cx-58,top-42,116,32);
  g.fillStyle='#ffd98a';g.font='800 16px system-ui,sans-serif';g.textAlign='center';
  g.fillText('ВЫХОД',cx,top-20);
  const pulse=0.5+0.5*Math.sin(t*3);
  g.globalAlpha=0.4+pulse*0.5;g.font='800 20px system-ui,sans-serif';
  g.fillText('▲',cx,top+52);g.fillText('▲',cx,top+82);
  g.globalAlpha=1;
  const shaftL=(SHAFT_X0)*TILE-4;
  const shaftR=(SHAFT_X1+1)*TILE+4;
  g.fillStyle='#6b4a2a';
  g.fillRect(shaftL,SHAFT_Y0*TILE,6,(SHAFT_Y1-SHAFT_Y0+1)*TILE);
  g.fillRect(shaftR-6,SHAFT_Y0*TILE,6,(SHAFT_Y1-SHAFT_Y0+1)*TILE);
  g.fillStyle='#8a6a3a';
  for(let i=0;i<2;i++)g.fillRect(shaftL+6,SHAFT_Y0*TILE+i*TILE+10,shaftR-shaftL-12,4);
  const glow=0.35+0.25*Math.sin(t*3);
  g.globalCompositeOperation='lighter';
  const gr=g.createRadialGradient(cx,(top+bottom)/2,10,cx,(top+bottom)/2,200);
  gr.addColorStop(0,'rgba(255,217,138,'+(glow*0.22)+')');
  gr.addColorStop(1,'rgba(255,217,138,0)');
  g.fillStyle=gr;g.fillRect(cx-220,(top+bottom)/2-220,440,440);
  g.globalCompositeOperation='source-over';
}
