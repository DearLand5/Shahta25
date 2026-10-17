'use strict';
/* ============================================================
   ЛИЛОВЫЕ НЕБЕСА — ОБЛИК СНАРЯЖЕНИЯ ЗАРИ (этап 9, логика — 58-lilac-gear)
   кирки XI–XV, клинки и латы 11–15 (шлем, наплечник, кираса), огнестрел Зари и его снаряды,
   предметы (зонт, лоза, сачок, ноты шкатулки, вспышка щита, подсветка иллюзий), питомцы,
   картинки в Кузнице Зари. Свет сверху-слева, 3 тона на деталь.
   ============================================================ */

/* облик лат 11–15 для общей модели шахтёра */
ARMOR_LOOK[11]={body:'#bfe6ff',trim:'#ffffff',leg:'#5a7aa8',boot:'#34507a',arm:'#a4d0f0',glow:'190,235,255'};
ARMOR_LOOK[12]={body:'#f0b030',trim:'#6a3a0c',leg:'#8a5a20',boot:'#4a2c0c',arm:'#dca028',glow:'255,200,80'};
ARMOR_LOOK[13]={body:'#f6f0f4',trim:'#4a6ad0',leg:'#cfc6d4',boot:'#7a6a84',arm:'#e8e0ea',glow:'130,160,255'};
ARMOR_LOOK[14]={body:'#a01848',trim:'#4a8a4e',leg:'#5a0a24',boot:'#243a1c',arm:'#8a1440',glow:'255,100,160'};
ARMOR_LOOK[15]={body:'#e6d6ff',trim:'#ffd060',leg:'#7a5ab8',boot:'#40306e',arm:'#d4c0f6',glow:'255,220,140'};
PL_BEARD.push('#e8f4ff','#6a3a10','#d8d0dc','#3a0a1a','#f0e0ff');

/* ---------- кирки XI–XV ---------- */
function lgPickModel(g,lv,t){
  /* рукоять: свет, основной, тень */
  const hc=lv===11?'#d8e0e8':lv===12?'#a06a2a':lv===13?'#5a3a24':lv===14?'#3a5a2a':'#e8d8f8';
  g.fillStyle=shadeHex(hc,-0.3);g.fillRect(-1.6,-2,3.2,21);g.fillStyle=hc;g.fillRect(-1.6,-2,2,21);g.fillStyle=shadeHex(hc,0.3);g.fillRect(-1.4,-2,0.8,21);
  g.fillStyle=lv===15?'#ffd060':'#caa24a';g.fillRect(-2,11,4,2);g.fillRect(-2,17,4,1.6);
  const sz=1.42;g.save();g.scale(sz,sz);
  if(lv===11){/* росяная: прозрачный кристалл с каплей на остриях */
    const gr=g.createLinearGradient(-10,-9,10,0);gr.addColorStop(0,'#ffffff');gr.addColorStop(0.5,'#bfe6ff');gr.addColorStop(1,'#6a9ad0');
    g.fillStyle=gr;g.beginPath();g.moveTo(-11,0);g.lineTo(-7,-6);g.lineTo(0,-9);g.lineTo(7,-6);g.lineTo(11,0);g.lineTo(5,-3);g.lineTo(-5,-3);g.closePath();g.fill();
    g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=0.6;g.beginPath();g.moveTo(-7,-6);g.lineTo(-3,-3.2);g.moveTo(0,-9);g.lineTo(0,-3);g.moveTo(7,-6);g.lineTo(3,-3.2);g.stroke();
    for(const s of [-1,1]){const ph=(t*0.7+(s>0?0.5:0))%1;g.fillStyle='rgba(220,245,255,'+(1-ph)+')';g.beginPath();g.ellipse(s*11,1+ph*5,0.9,1.3,0,0,TAU);g.fill();}
    olLight(g,(g)=>{g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.arc(-2,-6.5,0.9,0,TAU);g.fill();});
  }else if(lv===12){/* медовая: янтарь с сотами, капает мёд */
    g.fillStyle='#8a4a08';g.beginPath();g.moveTo(-12,0);g.quadraticCurveTo(0,-11,12,0);g.lineTo(8,-3);g.quadraticCurveTo(0,-11,-8,-3);g.closePath();g.fill();
    g.fillStyle='#f0a820';g.beginPath();g.moveTo(-11,-0.6);g.quadraticCurveTo(0,-10,11,-0.6);g.lineTo(8,-3.4);g.quadraticCurveTo(0,-10,-8,-3.4);g.closePath();g.fill();
    g.strokeStyle='#a85a08';g.lineWidth=0.5;for(let k=-2;k<=2;k++){const x=k*3.6,y=-5.6+Math.abs(k)*0.9;g.beginPath();for(let j=0;j<6;j++){const a=j/6*TAU;g.lineTo(x+Math.cos(a)*1.5,y+Math.sin(a)*1.5);}g.closePath();g.stroke();}
    g.fillStyle='rgba(255,240,180,.7)';g.fillRect(-5,-8.4,5,0.8);
    const dp=(t*0.8)%1;g.fillStyle='#f0a020';g.beginPath();g.moveTo(10.4,-0.4);g.quadraticCurveTo(11,1+dp*4,10.8,2+dp*5);g.quadraticCurveTo(10,1+dp*4,10.4,-0.4);g.fill();
  }else if(lv===13){/* заводная: латунь, шестерня в центре и ключик */
    g.fillStyle='#8a5a20';g.beginPath();g.moveTo(-12,0);g.lineTo(-9,-5);g.lineTo(9,-5);g.lineTo(12,0);g.lineTo(6,-2.4);g.lineTo(-6,-2.4);g.closePath();g.fill();
    g.fillStyle='#e0b050';g.beginPath();g.moveTo(-11.4,-0.6);g.lineTo(-8.6,-5);g.lineTo(8.6,-5);g.lineTo(8,-4);g.lineTo(-8,-4);g.closePath();g.fill();
    g.save();g.translate(0,-5);g.rotate(t*1.5);g.fillStyle='#c8902a';for(let k=0;k<8;k++){g.rotate(TAU/8);g.fillRect(-1,-5.2,2,2);}g.beginPath();g.arc(0,0,4.2,0,TAU);g.fill();
    g.fillStyle='#ffe090';g.beginPath();g.arc(-1,-1,2,0,TAU);g.fill();g.fillStyle='#5a3a10';g.beginPath();g.arc(0,0,1,0,TAU);g.fill();g.restore();
    g.strokeStyle='#e0b050';g.lineWidth=1;g.beginPath();g.moveTo(0,-10);g.lineTo(0,-13);g.stroke();g.beginPath();g.ellipse(-1.8,-14,1.8,1.2,0,0,TAU);g.ellipse(1.8,-14,1.8,1.2,0,0,TAU);g.stroke();
  }else if(lv===14){/* шипастая: лоза, шипы и роза */
    g.fillStyle='#24401e';g.beginPath();g.moveTo(-12,1);g.quadraticCurveTo(-6,-9,0,-7);g.quadraticCurveTo(6,-9,12,1);g.lineTo(7,-3);g.quadraticCurveTo(0,-5,-7,-3);g.closePath();g.fill();
    g.strokeStyle='#4a8a4e';g.lineWidth=0.9;g.beginPath();g.moveTo(-11,0);g.quadraticCurveTo(-5,-8,0,-6);g.quadraticCurveTo(5,-8,11,0);g.stroke();
    g.fillStyle='#e0d0c0';for(const [x,y,a] of [[-8,-4,-2],[-4,-6.6,-1.6],[4,-6.6,-1.4],[8,-4,-1]]){g.beginPath();g.moveTo(x-0.8,y);g.lineTo(x+Math.cos(a)*3,y+Math.sin(a)*3);g.lineTo(x+0.8,y);g.closePath();g.fill();}
    for(let r=2;r>=0;r--){g.fillStyle=r===2?'#7a0a2a':r===1?'#c8304e':'#ff6a8a';for(let k=0;k<5;k++){const a=k/5*TAU+r;g.beginPath();g.ellipse(Math.cos(a)*(r+0.6),-6+Math.sin(a)*(r+0.6),1.6+r*0.5,1.2+r*0.4,a,0,TAU);g.fill();}}
  }else{/* рассветная: солнце и полумесяц на двух концах */
    const gr=g.createLinearGradient(-12,0,12,0);gr.addColorStop(0,'#ffd060');gr.addColorStop(0.5,'#fff4e0');gr.addColorStop(1,'#b8a0f0');
    g.fillStyle='#5a3a8a';g.beginPath();g.moveTo(-12,0);g.quadraticCurveTo(0,-11,12,0);g.lineTo(8,-3.4);g.quadraticCurveTo(0,-11.4,-8,-3.4);g.closePath();g.fill();
    g.fillStyle=gr;g.beginPath();g.moveTo(-11,-0.6);g.quadraticCurveTo(0,-9.6,11,-0.6);g.lineTo(9,-2);g.quadraticCurveTo(0,-10,-9,-2);g.closePath();g.fill();
    g.fillStyle='#ffd060';g.beginPath();g.arc(-9,-3,2.6,0,TAU);g.fill();for(let k=0;k<8;k++){const a=k/8*TAU+t;g.fillRect(-9+Math.cos(a)*3.6-0.4,-3+Math.sin(a)*3.6-0.4,0.8,0.8);}
    g.fillStyle='#e8e0ff';g.beginPath();g.arc(9,-3,2.6,0,TAU);g.fill();g.fillStyle='#5a3a8a';g.beginPath();g.arc(10.2,-3.8,2.2,0,TAU);g.fill();
  }
  g.fillStyle='rgba(255,255,255,.5)';g.fillRect(-4,-6.8,6,1);
  g.restore();
  const gc=ARMOR_LOOK[lv]?ARMOR_LOOK[lv].glow:'255,220,255';
  olLight(g,(g)=>{const gl=g.createRadialGradient(0,-8,1,0,-8,22);gl.addColorStop(0,'rgba('+gc+','+(0.35+0.15*Math.sin(t*5))+')');gl.addColorStop(1,'rgba('+gc+',0)');
    g.fillStyle=gl;g.beginPath();g.arc(0,-8,22,0,TAU);g.fill();
    g.fillStyle='rgba('+gc+',.85)';for(let k=0;k<3;k++){const a=t*3+k*2.1;g.fillRect(Math.cos(a)*14-1,-8+Math.sin(a)*7-1,2,2);}});
}

/* ---------- клинки 11–15: рукоять, гарда и клинок (локальные координаты как у обычного меча, острие вверх) ---------- */
const LG_SWC=['#d8f0ff','#f0a820','#f8f4f8','#2e6a34','#ffe8b0'];
function lgSwordModel(g,sl,L,t){
  const i=clamp(sl-11,0,4),SC=LG_SWC[i];
  g.fillStyle=i===3?'#2a3a1a':'#4a2a3a';g.fillRect(-1.6,-1,3.2,7);g.fillStyle=i===4?'#ffd060':'#e0c0ff';g.beginPath();g.arc(0,6.6,1.9,0,TAU);g.fill();
  /* гарда */
  if(i===0){g.strokeStyle='#e8f4ff';g.lineWidth=1.2;g.beginPath();g.arc(0,1,5,Math.PI*0.1,Math.PI*0.9);g.stroke();g.fillStyle='#bfe6ff';g.fillRect(-5,-1.6,10,1.8);}
  else if(i===1){g.fillStyle='#3a2a10';g.beginPath();g.ellipse(0,-0.6,6,2.4,0,0,TAU);g.fill();g.fillStyle='#f0b030';g.fillRect(-4,-1.4,2,1.6);g.fillRect(0,-1.4,2,1.6);}
  else if(i===2){g.fillStyle='#4a6ad0';g.beginPath();g.moveTo(-6,-1.4);g.quadraticCurveTo(0,-4,6,-1.4);g.lineTo(6,0.6);g.lineTo(-6,0.6);g.closePath();g.fill();g.fillStyle='#fff';g.beginPath();g.arc(-4,-0.6,0.8,0,TAU);g.arc(4,-0.6,0.8,0,TAU);g.fill();}
  else if(i===3){for(let r=1;r>=0;r--){g.fillStyle=r?'#8a0a2a':'#ff6a8a';for(let k=0;k<5;k++){const a=k/5*TAU;g.beginPath();g.ellipse(Math.cos(a)*(1.4+r),-0.4+Math.sin(a)*(1.4+r),1.8+r*0.5,1.3,a,0,TAU);g.fill();}}}
  else{g.fillStyle='#ffd060';g.beginPath();g.arc(0,-0.6,3.4,Math.PI,TAU);g.fill();for(let k=0;k<7;k++){const a=Math.PI+k/6*Math.PI;g.fillRect(Math.cos(a)*5-0.4,-0.6+Math.sin(a)*5-0.4,0.9,0.9);}}
  /* клинок: свет слева, основной, тень справа */
  const w=i===0?1.4:i===1?2.4:2.2;
  const bg=g.createLinearGradient(-w,0,w,0);bg.addColorStop(0,shadeHex(SC,0.35));bg.addColorStop(0.5,SC);bg.addColorStop(0.55,shadeHex(SC,-0.2));bg.addColorStop(1,shadeHex(SC,-0.4));
  g.fillStyle=bg;g.beginPath();
  if(i===2){g.moveTo(-w,-2);g.quadraticCurveTo(-w-1.5,-L*0.6,1.5,-L-3);g.quadraticCurveTo(w+1.5,-L*0.55,w,-2);}   /* изогнутая сабля */
  else if(i===1){g.moveTo(-w,-2);g.lineTo(w,-2);g.lineTo(0.6,-L);g.lineTo(0,-L-6);g.lineTo(-0.6,-L);}
  else{g.moveTo(-w,-2);g.lineTo(w,-2);g.lineTo(w*0.7,-L);g.lineTo(0,-L-4.4);g.lineTo(-w*0.7,-L);}
  g.closePath();g.fill();
  if(i===1){g.fillStyle='#2a1a08';for(let k=0;k<4;k++)g.fillRect(-1.8+k*0.1,-6-k*5,3.6-k*0.4,1.4);g.fillStyle='#1a0e04';g.beginPath();g.moveTo(-0.6,-L);g.lineTo(0,-L-6);g.lineTo(0.6,-L);g.fill();}
  if(i===2){g.fillStyle='#4a6ad0';for(let k=0;k<3;k++){g.beginPath();g.arc(-0.2+k*0.3,-6-k*6,0.9,0,TAU);g.fill();}g.strokeStyle='rgba(60,60,80,.5)';g.lineWidth=0.4;g.beginPath();g.moveTo(0.4,-L*0.4);g.lineTo(-0.6,-L*0.5);g.lineTo(0.2,-L*0.56);g.stroke();}
  if(i===3){g.fillStyle='#e0d0c0';for(let k=0;k<4;k++){const y=-6-k*5,s=k%2?1:-1;g.beginPath();g.moveTo(s*w*0.8,y);g.lineTo(s*(w+2.4),y-1.4);g.lineTo(s*w*0.8,y-1.8);g.fill();}}
  g.fillStyle='rgba(255,255,255,.55)';g.fillRect(-0.5,-L+2,1,L-6);
  const gc=ARMOR_LOOK[11+i].glow;
  olLight(g,(g)=>{g.strokeStyle='rgba('+gc+','+(0.3+0.12*Math.sin(t*4))+')';g.lineWidth=6;g.lineCap='round';g.beginPath();g.moveTo(0,-3);g.lineTo(0,-L-2);g.stroke();
    if(i===0||i===4)for(let k=0;k<2;k++){const ph=(t*0.8+k*0.5)%1;g.fillStyle='rgba('+gc+','+(1-ph)+')';g.fillRect(-0.6+Math.sin(k*3+t)*2,-L*ph-2,1.2,1.2);}});
}

/* ---------- латы 11–15 ---------- */
function lgArmorBody(g,lv,bob,t){
  const A=ARMOR_LOOK[lv],y0=-36+bob*0.4,gl=A.glow,pulse=0.6+0.4*Math.sin(t*3);
  /* рубаха под латами и кираса: свет сверху-слева */
  const shirt=shadeHex(A.body,-0.3);
  g.fillStyle=shirt;g.beginPath();g.moveTo(-9,-14);g.quadraticCurveTo(-12,-24,-10.5,y0+2);g.quadraticCurveTo(0,y0-3,10.5,y0+2);g.quadraticCurveTo(12.5,-24,9.5,-14);g.closePath();g.fill();
  const gr=g.createLinearGradient(-9,y0,9,-14);gr.addColorStop(0,shadeHex(A.body,0.3));gr.addColorStop(0.5,A.body);gr.addColorStop(1,shadeHex(A.body,-0.35));
  g.fillStyle=gr;g.beginPath();g.moveTo(-9,-15);g.quadraticCurveTo(-11.4,-26,-9.6,y0+3);g.quadraticCurveTo(0,y0-0.5,9.6,y0+3);g.quadraticCurveTo(11.4,-26,9,-15);g.quadraticCurveTo(0,-12.4,-9,-15);g.fill();
  g.strokeStyle=hexA(A.trim,0.9);g.lineWidth=1;g.beginPath();g.moveTo(-9.4,y0+3);g.quadraticCurveTo(0,y0-0.5,9.4,y0+3);g.moveTo(-8.6,-20);g.quadraticCurveTo(0,-17,8.6,-20);g.stroke();
  g.fillStyle='rgba(255,255,255,.22)';g.beginPath();g.ellipse(-5,y0+8,2.2,6,0.1,0,TAU);g.fill();
  if(lv===11){/* грани кристалла и капли росы */
    g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=0.7;g.beginPath();g.moveTo(-8,y0+5);g.lineTo(0,y0+12);g.lineTo(8,y0+5);g.moveTo(0,y0+12);g.lineTo(0,-18);g.moveTo(-8,-19);g.lineTo(0,y0+12);g.lineTo(8,-19);g.stroke();
    for(const [x,y,r] of [[-4,y0+7,1.4],[5,y0+10,1.1],[-2,y0+15,1],[3,y0+4,0.8]]){g.fillStyle='rgba(120,180,230,.8)';g.beginPath();g.arc(x+0.3,y+0.4,r,0,TAU);g.fill();g.fillStyle='#ffffff';g.beginPath();g.arc(x,y,r*0.8,0,TAU);g.fill();g.fillStyle='rgba(160,210,250,.9)';g.beginPath();g.arc(x+0.2,y+0.3,r*0.45,0,TAU);g.fill();}
    mobGlow(g,0,y0+10,12,'#bfe6ff',0.35*pulse);
  }else if(lv===12){/* соты и стекающий мёд */
    g.strokeStyle='#8a4a08';g.lineWidth=0.6;
    for(let r=0;r<3;r++)for(let k=-1;k<=1;k++){const x=k*4.4+(r%2?2.2:0),y=y0+6+r*4;if(Math.abs(x)>7)continue;g.beginPath();for(let j=0;j<6;j++){const a=j/6*TAU+Math.PI/6;g.lineTo(x+Math.cos(a)*2.3,y+Math.sin(a)*2.3);}g.closePath();g.fillStyle=(r+k)%2?'rgba(255,220,120,.5)':'rgba(200,120,20,.35)';g.fill();g.stroke();}
    const dp=(t*0.5)%1;g.fillStyle='#e89818';g.beginPath();g.moveTo(-6,y0+3);g.quadraticCurveTo(-5.4,y0+6+dp*8,-5.8,y0+8+dp*9);g.quadraticCurveTo(-6.6,y0+6+dp*8,-6,y0+3);g.fill();
    g.fillStyle='#2a1a08';g.fillRect(-9,-21,18,1.4);
  }else if(lv===13){/* фарфор с синей росписью и трещинкой */
    g.fillStyle='#4a6ad0';for(const [x,y] of [[-4,y0+8],[4,y0+13]]){for(let k=0;k<5;k++){const a=k/5*TAU;g.beginPath();g.arc(x+Math.cos(a)*1.6,y+Math.sin(a)*1.6,1,0,TAU);g.fill();}g.fillStyle='#ffd060';g.beginPath();g.arc(x,y,0.7,0,TAU);g.fill();g.fillStyle='#4a6ad0';}
    g.strokeStyle='#4a6ad0';g.lineWidth=0.6;g.beginPath();g.moveTo(-4,y0+10);g.quadraticCurveTo(0,y0+12,4,y0+11);g.stroke();
    g.strokeStyle='rgba(60,50,70,.6)';g.lineWidth=0.5;g.beginPath();g.moveTo(6,y0+4);g.lineTo(4,y0+7);g.lineTo(6,y0+9);g.lineTo(5,y0+12);g.stroke();
    plVol(g,0,-16,2.4,2.4,'#e8e0ea');
  }else if(lv===14){/* роза на груди и шипастая лоза */
    g.strokeStyle='#2e5a30';g.lineWidth=1.3;g.beginPath();g.moveTo(-9,-19);g.quadraticCurveTo(-4,y0+12,2,y0+8);g.quadraticCurveTo(7,y0+5,9,y0+4);g.stroke();
    g.fillStyle='#e0d0c0';for(const [x,y] of [[-6,y0+16],[-3,y0+11],[5,y0+6]]){g.beginPath();g.moveTo(x-0.8,y);g.lineTo(x,y-2.4);g.lineTo(x+0.8,y);g.fill();}
    for(let r=2;r>=0;r--){g.fillStyle=r===2?'#6a0a22':r===1?'#d0305a':'#ff7a9a';for(let k=0;k<5;k++){const a=k/5*TAU+r*0.7;g.beginPath();g.ellipse(2+Math.cos(a)*(r*0.9+0.5),y0+9+Math.sin(a)*(r*0.9+0.5),1.8+r*0.6,1.3+r*0.4,a,0,TAU);g.fill();}}
    mobGlow(g,2,y0+9,9,'#ff6a9a',0.3*pulse);
  }else{/* рассвет: солнце над горизонтом и жемчужный отлив */
    g.save();g.beginPath();g.moveTo(-9,-15);g.quadraticCurveTo(-11.4,-26,-9.6,y0+3);g.quadraticCurveTo(0,y0-0.5,9.6,y0+3);g.quadraticCurveTo(11.4,-26,9,-15);g.closePath();g.clip();
    const sg=g.createLinearGradient(0,y0+2,0,-15);sg.addColorStop(0,'rgba(255,200,230,.0)');sg.addColorStop(0.6,'rgba(255,190,220,.45)');sg.addColorStop(1,'rgba(255,220,150,.5)');g.fillStyle=sg;g.fillRect(-12,y0,24,24);g.restore();
    olLight(g,(g)=>{g.fillStyle='rgba(255,220,120,'+(0.7+0.3*pulse)+')';g.beginPath();g.arc(0,y0+14,4.4,Math.PI,TAU);g.fill();
      g.strokeStyle='rgba(255,230,160,.9)';g.lineWidth=0.8;g.beginPath();for(let k=0;k<7;k++){const a=Math.PI+(k+0.5)/7*Math.PI;g.moveTo(Math.cos(a)*5.6,y0+14+Math.sin(a)*5.6);g.lineTo(Math.cos(a)*8.4,y0+14+Math.sin(a)*8.4);}g.stroke();});
    g.strokeStyle='#ffd060';g.lineWidth=0.9;g.beginPath();g.moveTo(-8,y0+14);g.lineTo(8,y0+14);g.stroke();
    mobGlow(g,0,y0+13,15,'#ffd8a0',0.35+0.15*pulse);
  }
  /* пояс */
  g.fillStyle=shadeHex(A.trim,-0.45);g.fillRect(-9.6,-17.6,19.4,3);
  g.fillStyle=A.trim;g.fillRect(-1.6,-18,3.4,3.8);g.fillStyle=shadeHex(A.trim,-0.3);g.fillRect(-0.6,-17,1.4,1.8);
  g.fillStyle=shadeHex(A.body,-0.35);g.beginPath();g.moveTo(3.6,-15.2);g.lineTo(8.4,-15.2);g.lineTo(8,-10.8);g.lineTo(4,-10.8);g.closePath();g.fill();
  g.fillStyle='rgba(255,255,255,.18)';g.fillRect(4,-14.8,4,0.8);
}
function lgPauldron(g,x,y,lv,t){
  const A=ARMOR_LOOK[lv];
  plVol(g,x,y,6.4,4.8,A.body,-0.2);
  g.fillStyle=A.trim;g.beginPath();g.ellipse(x,y+2.6,6,1.4,-0.2,0,TAU);g.fill();
  if(lv===11){g.fillStyle='#ffffff';g.beginPath();g.moveTo(x-1,y-3);g.lineTo(x+1,y-10);g.lineTo(x+3,y-3);g.fill();g.fillStyle='rgba(160,210,250,.8)';g.beginPath();g.moveTo(x+1,y-10);g.lineTo(x+3,y-3);g.lineTo(x+1.6,y-3);g.fill();}
  else if(lv===12){g.strokeStyle='#8a4a08';g.lineWidth=0.6;g.beginPath();for(let j=0;j<6;j++){const a=j/6*TAU;g.lineTo(x+Math.cos(a)*2.2,y-0.6+Math.sin(a)*2.2);}g.closePath();g.stroke();}
  else if(lv===13){g.fillStyle='#4a6ad0';for(let k=0;k<5;k++){const a=k/5*TAU;g.beginPath();g.arc(x+Math.cos(a)*1.4,y-0.6+Math.sin(a)*1.4,0.8,0,TAU);g.fill();}}
  else if(lv===14){g.fillStyle='#e0d0c0';for(const dx of [-3,0,3]){g.beginPath();g.moveTo(x+dx-1,y-3.4);g.lineTo(x+dx+0.4,y-8);g.lineTo(x+dx+1,y-3.4);g.fill();}g.fillStyle='#d0305a';g.beginPath();g.arc(x,y-0.4,1.8,0,TAU);g.fill();}
  else{olLight(g,(g)=>{g.fillStyle='rgba(255,220,120,.9)';g.beginPath();g.arc(x,y-1,2.2,0,TAU);g.fill();g.strokeStyle='rgba(255,230,160,.8)';g.lineWidth=0.7;g.beginPath();for(let k=0;k<6;k++){const a=k/6*TAU+t*0.6;g.moveTo(x+Math.cos(a)*3,y-1+Math.sin(a)*3);g.lineTo(x+Math.cos(a)*4.6,y-1+Math.sin(a)*4.6);}g.stroke();});}
}
function lgHelmet(g,lv,hx,hy,t){
  const A2=ARMOR_LOOK[lv],gl=A2.glow;
  /* общий закрытый шлем: свет сверху-слева */
  const hg=g.createLinearGradient(hx-10,hy-15,hx+10,hy+8);hg.addColorStop(0,shadeHex(A2.body,0.3));hg.addColorStop(0.5,A2.body);hg.addColorStop(1,shadeHex(A2.body,-0.3));
  g.fillStyle=hg;g.beginPath();g.moveTo(hx-11.6,hy+8);g.lineTo(hx-11.8,hy-4);g.quadraticCurveTo(hx-11.2,hy-15,hx,hy-15);g.quadraticCurveTo(hx+11.8,hy-15,hx+12.4,hy-3);g.lineTo(hx+13,hy+3);g.lineTo(hx+7,hy+6);g.lineTo(hx+6,hy+9);g.closePath();g.fill();
  g.fillStyle='rgba(255,255,255,.3)';g.beginPath();g.ellipse(hx-4,hy-9,3,4,-0.4,0,TAU);g.fill();
  g.strokeStyle=hexA(A2.trim,0.8);g.lineWidth=1;g.beginPath();g.moveTo(hx-11.6,hy-4);g.quadraticCurveTo(hx,hy-6.4,hx+12.4,hy-3);g.stroke();
  if(lv===11){g.fillStyle='rgba(255,255,255,.95)';for(const [x1,y1,x2,y2,x3,y3] of [[-7,-11,-12,-24,-3,-13],[-2,-14,1,-28,3,-14],[4,-13,10,-24,8,-11]]){g.beginPath();g.moveTo(hx+x1,hy+y1);g.lineTo(hx+x2,hy+y2);g.lineTo(hx+x3,hy+y3);g.closePath();g.fill();}
    g.fillStyle='rgba(150,200,240,.8)';g.beginPath();g.moveTo(hx+1,hy-28);g.lineTo(hx+3,hy-14);g.lineTo(hx+1.6,hy-14);g.fill();
    const ph=(t*0.4)%1;g.fillStyle='rgba(220,245,255,'+(1-ph)+')';g.beginPath();g.ellipse(hx+1,hy-28+ph*2,1,1.4,0,0,TAU);g.fill();}
  else if(lv===12){g.strokeStyle='#2a1a08';g.lineWidth=1.2;for(const s of [-1,1]){g.beginPath();g.moveTo(hx+s*3,hy-14);g.quadraticCurveTo(hx+s*6,hy-24,hx+s*10+Math.sin(t*3+s)*1.2,hy-25);g.stroke();g.fillStyle='#2a1a08';g.beginPath();g.arc(hx+s*10+Math.sin(t*3+s)*1.2,hy-25,1.6,0,TAU);g.fill();}
    g.fillStyle='#2a1a08';g.fillRect(hx-10.6,hy-10,22,1.6);g.fillRect(hx-11,hy-6.6,23,1.4);}
  else if(lv===13){g.fillStyle='rgba(255,120,150,.35)';g.beginPath();g.ellipse(hx+6,hy+3,2.2,1.4,0,0,TAU);g.fill();
    g.fillStyle='#4a6ad0';for(let k=0;k<5;k++){const a=k/5*TAU;g.beginPath();g.arc(hx-4+Math.cos(a)*1.8,hy-9+Math.sin(a)*1.8,1.1,0,TAU);g.fill();}g.fillStyle='#ffd060';g.beginPath();g.arc(hx-4,hy-9,0.8,0,TAU);g.fill();
    g.strokeStyle='rgba(60,50,70,.6)';g.lineWidth=0.5;g.beginPath();g.moveTo(hx+8,hy-13);g.lineTo(hx+6,hy-9);g.lineTo(hx+8,hy-6);g.stroke();
    g.fillStyle='#e8e0ea';g.beginPath();g.ellipse(hx,hy-15,8,2.2,0,Math.PI,TAU);g.fill();}
  else if(lv===14){g.fillStyle='#e0d0c0';for(let k=0;k<5;k++){g.beginPath();g.moveTo(hx-8+k*4,hy-13);g.lineTo(hx-7+k*4,hy-19-(k%2)*2);g.lineTo(hx-6+k*4,hy-13.4);g.fill();}
    for(const rx of [-5,4]){for(let r=2;r>=0;r--){g.fillStyle=r===2?'#6a0a22':r===1?'#d0305a':'#ff7a9a';for(let k=0;k<5;k++){const a=k/5*TAU+r;g.beginPath();g.ellipse(hx+rx+Math.cos(a)*(r*0.8+0.4),hy-15+Math.sin(a)*(r*0.8+0.4),1.6+r*0.5,1.2+r*0.4,a,0,TAU);g.fill();}}}
    g.fillStyle='#4a8a4e';g.beginPath();g.ellipse(hx-1,hy-14,2.4,1,0.3,0,TAU);g.fill();}
  else{olLight(g,(g)=>{g.strokeStyle='rgba(255,220,140,'+(0.55+0.25*Math.sin(t*2))+')';g.lineWidth=1.6;g.beginPath();g.arc(hx-1,hy-6,15,Math.PI*1.1,Math.PI*1.9);g.stroke();
      g.lineWidth=0.9;for(let k=0;k<9;k++){const a=Math.PI*(1.12+k*0.095);g.beginPath();g.moveTo(hx-1+Math.cos(a)*16.5,hy-6+Math.sin(a)*16.5);g.lineTo(hx-1+Math.cos(a)*(19+(k%2)*2),hy-6+Math.sin(a)*(19+(k%2)*2));g.stroke();}});
    g.fillStyle='#ffd060';g.beginPath();g.arc(hx-2,hy-13,2.6,0,TAU);g.fill();g.fillStyle=A2.body;g.beginPath();g.arc(hx-0.8,hy-13.8,2.2,0,TAU);g.fill();}
  /* смотровая щель со светом */
  g.fillStyle='#08040a';g.fillRect(hx+2,hy-2.6,10.4,3.2);
  olLight(g,(g)=>{g.fillStyle='rgba('+gl+','+(0.8+0.2*Math.sin(t*4))+')';g.fillRect(hx+3,hy-1.8,8.6,1.6);});
  const p=gl.split(','),hex='#'+((1<<24)|(+p[0]<<16)|(+p[1]<<8)|(+p[2])).toString(16).slice(1);
  mobGlow(g,hx+7,hy-1,9,hex,0.5);
}

/* ---------- огнестрел Зари ---------- */
const LG_GUNLEN={lpetal:20,lbubble:22,lprism:24,lbeegun:24,lchime:26};
function lgGunModel(g,id,T){
  const box=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
  const hl=(x,y,w)=>{g.fillStyle='rgba(255,255,255,.3)';g.fillRect(x,y,w,0.9);};
  const grip=(x,c)=>{g.fillStyle=c;g.beginPath();g.moveTo(x,1.6);g.lineTo(x+4,1.6);g.lineTo(x+2.6,8.4);g.lineTo(x-1.2,8.4);g.closePath();g.fill();g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x-0.6,4,4,0.8);};
  const glowDot=(x,y,r,c,a)=>{olLight(g,(g)=>{const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,hexA(c,a));gr.addColorStop(1,hexA(c,0));g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();});};
  if(id==='lpetal'){
    box(0,-2.4,13,4.6,'#7a3a5a');hl(0,-2.4,13);grip(2,'#5a2a40');box(3,-3.2,7,0.9,'#ffd0e8');
    for(let k=-2;k<=2;k++){g.save();g.translate(14,0);g.rotate(k*0.32+Math.sin(T*3)*0.05);g.fillStyle=k%2?'#ff9ac8':'#ffc8e0';g.beginPath();g.ellipse(4.4,0,4.4,1.6,0,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.5)';g.fillRect(2,-0.8,3,0.6);g.restore();}
    g.fillStyle='#ffd040';g.beginPath();g.arc(14,0,1.8,0,TAU);g.fill();return 20;}
  if(id==='lbubble'){
    g.fillStyle='#5a7aa8';g.beginPath();g.ellipse(5,-5,4.4,3.4,0,0,TAU);g.fill();g.fillStyle='rgba(190,232,255,.85)';g.beginPath();g.ellipse(5,-4.4,3.4,2.2,0,0,Math.PI);g.fill();
    box(0,-2,16,4,'#34507a');hl(0,-2,16);grip(2,'#243a5a');
    g.strokeStyle='#e0b050';g.lineWidth=1.4;g.beginPath();g.arc(20,0,4,0,TAU);g.stroke();
    g.fillStyle='rgba(200,240,255,'+(0.25+0.15*Math.sin(T*4))+')';g.beginPath();g.arc(20,0,3.4,0,TAU);g.fill();
    g.strokeStyle='rgba(255,180,230,.6)';g.lineWidth=0.6;g.beginPath();g.arc(20,0,3,-1,0.6);g.stroke();return 22;}
  if(id==='lprism'){
    box(0,-2.6,16,5.2,'#8a6a2a');hl(0,-2.6,16);box(2,-3.6,12,1,'#e0b050');grip(3,'#5a3a14');
    g.fillStyle='#c8a050';g.beginPath();g.moveTo(15,-4);g.lineTo(18,-4);g.lineTo(18,4);g.lineTo(15,4);g.fill();
    const pg=g.createLinearGradient(18,-5,24,5);pg.addColorStop(0,'#ffffff');pg.addColorStop(0.5,'#fff0b0');pg.addColorStop(1,'#b0e8ff');
    g.fillStyle=pg;g.beginPath();g.moveTo(18,-5);g.lineTo(25,0);g.lineTo(18,5);g.closePath();g.fill();
    g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=0.5;g.beginPath();g.moveTo(18,0);g.lineTo(25,0);g.stroke();
    glowDot(22,0,8,'#fff0b0',0.6+0.2*Math.sin(T*6));return 25;}
  if(id==='lbeegun'){
    box(-4,-1,6,3,'#7a4a1a');grip(1,'#5a3410');box(17,-2,7,3,'#7a4a1a');box(17,-2,7,0.8,'#a87040');
    /* улей-купол: соломенные кольца, свет сверху-слева */
    const hg=g.createRadialGradient(6,-9,1,9,-3,11);hg.addColorStop(0,'#ffe0a0');hg.addColorStop(0.6,'#e0a040');hg.addColorStop(1,'#8a5a1a');
    g.fillStyle=hg;g.beginPath();g.moveTo(1,3);g.quadraticCurveTo(0,-12,9,-12);g.quadraticCurveTo(18,-12,17,3);g.closePath();g.fill();
    g.strokeStyle='#8a5a1a';g.lineWidth=0.7;for(let k=0;k<4;k++){const y=-9+k*3;g.beginPath();g.moveTo(2.4+Math.abs(k-1)*0.4,y);g.quadraticCurveTo(9,y+1.4,16,y);g.stroke();}
    g.fillStyle='#3a2208';g.beginPath();g.ellipse(14.6,-1,1.8,1.4,0,0,TAU);g.fill();
    const dp=(T*0.7)%1;g.fillStyle='#f0a020';g.beginPath();g.ellipse(6,3.6+dp*4,0.9,1.3+dp,0,0,TAU);g.fill();
    for(let k=0;k<2;k++){const a=T*5+k*3,bx=10+Math.cos(a)*9,by=-9+Math.sin(a*1.3)*3;g.fillStyle='#ffd040';g.beginPath();g.ellipse(bx,by,1.4,1,0,0,TAU);g.fill();g.fillStyle='#2a1a08';g.fillRect(bx-0.3,by-1,0.6,2);g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.ellipse(bx,by-1.4,1,0.6,0,0,TAU);g.fill();}
    return 24;}
  /* колокол-гром */
  box(0,-2.2,14,4.4,'#5a3a7a');hl(0,-2.2,14);grip(2,'#3a2450');box(3,-3,8,0.8,'#e8dcff');
  const bg=g.createLinearGradient(14,-6,26,6);bg.addColorStop(0,'#fff0b0');bg.addColorStop(0.5,'#e0b050');bg.addColorStop(1,'#8a5a20');
  g.fillStyle=bg;g.beginPath();g.moveTo(14,-2.6);g.quadraticCurveTo(20,-3,24,-7);g.lineTo(26,-7);g.lineTo(26,7);g.lineTo(24,7);g.quadraticCurveTo(20,3,14,2.6);g.closePath();g.fill();
  g.fillStyle='#3a2208';g.beginPath();g.ellipse(25.4,0,1.4,6.4,0,0,TAU);g.fill();
  const sw=Math.sin(T*10)*0.8;g.fillStyle='#e8dcff';g.beginPath();g.arc(22+sw,0,1.4,0,TAU);g.fill();
  glowDot(26,0,9,'#e8dcff',0.4);return 26;
}
/* снаряды огнестрела Зари */
function lgDrawProj(g,p){
  const k=p.lgk,t=G.time;
  if(k==='lgpetal'){g.save();g.translate(p.x,p.y);g.rotate(Math.atan2(p.vy,p.vx)+Math.sin(p.wob)*0.8);
    g.scale(1.6,1.6);const pg=g.createLinearGradient(-6,0,6,0);pg.addColorStop(0,'#ff6aa8');pg.addColorStop(1,'#ffe0f0');g.fillStyle=pg;g.beginPath();g.moveTo(-6,0);g.quadraticCurveTo(0,-4.4,6,0);g.quadraticCurveTo(0,3,-6,0);g.fill();
    g.strokeStyle='rgba(200,60,120,.6)';g.lineWidth=0.6;g.beginPath();g.moveTo(-5,0);g.lineTo(5,0);g.stroke();g.restore();
    g.save();g.globalCompositeOperation='lighter';softGlow(g,p.x,p.y,12,'#ffb0d8',0.35);g.restore();return true;}
  if(k==='lgbubble'){const r=p.size;g.save();g.globalCompositeOperation='lighter';softGlow(g,p.x,p.y,r*1.8,'#bfe8ff',0.25);g.restore();
    g.fillStyle='rgba(200,235,255,.16)';g.beginPath();g.arc(p.x,p.y,r,0,TAU);g.fill();
    const rg=g.createLinearGradient(p.x-r,p.y-r,p.x+r,p.y+r);rg.addColorStop(0,'rgba(255,170,230,.9)');rg.addColorStop(0.5,'rgba(170,240,255,.9)');rg.addColorStop(1,'rgba(255,240,150,.9)');
    g.strokeStyle=rg;g.lineWidth=1.6;g.beginPath();g.arc(p.x,p.y,r,0,TAU);g.stroke();
    g.fillStyle='rgba(255,255,255,.85)';g.beginPath();g.ellipse(p.x-r*0.4,p.y-r*0.45,r*0.28,r*0.16,-0.6,0,TAU);g.fill();return true;}
  if(k==='lgbee'){g.save();g.translate(p.x,p.y);g.rotate(Math.atan2(p.vy,p.vx));g.scale(1.5,1.5);
    const fl=Math.sin(t*60)*0.6;g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.ellipse(-1,-3,3,1.6,-0.4+fl,0,TAU);g.ellipse(-1,3,3,1.6,0.4-fl,0,TAU);g.fill();
    g.fillStyle='#ffd040';g.beginPath();g.ellipse(0,0,4.4,3,0,0,TAU);g.fill();g.fillStyle='#2a1a08';g.fillRect(-1.6,-3,1.2,6);g.fillRect(1,-2.8,1.1,5.6);g.beginPath();g.moveTo(-4.4,0);g.lineTo(-6.6,-0.6);g.lineTo(-6.6,0.6);g.fill();
    g.fillStyle='#fff';g.beginPath();g.arc(3.4,-1,0.8,0,TAU);g.fill();g.restore();return true;}
  if(k==='lgchime'){const r=p.size,a=Math.atan2(p.vy,p.vx);g.save();g.globalCompositeOperation='lighter';
    for(let i=0;i<3;i++){g.strokeStyle='rgba(232,220,255,'+(0.75-i*0.22)+')';g.lineWidth=3-i*0.8;g.beginPath();g.arc(p.x-Math.cos(a)*i*6,p.y-Math.sin(a)*i*6,r-i*3,a-1.1,a+1.1);g.stroke();}
    softGlow(g,p.x,p.y,r,'#c8b8ff',0.25);g.restore();return true;}
  return false;
}

/* ---------- мир: подсветка иллюзий, питомец, предметы (до и после шахтёра) ---------- */
function lgWorldBack(g,tx0,tx1,ty0,ty1){
  const L=lgi('lamp');if(!L||veilT>0.5)return;
  const R=3+L*2,px=Math.floor(player.x/TILE),py=Math.floor((player.y-20)/TILE),t=G.time;
  for(let ty=py-R;ty<=py+R;ty++)for(let tx=px-R;tx<=px+R;tx++){
    if(tx<tx0||tx>tx1||ty<ty0||ty>ty1)continue;if((tx-px)*(tx-px)+(ty-py)*(ty-py)>R*R)continue;
    const o=getOre(tx,ty);if(!o||!ORES[o]||ORES[o].dim!==2||!lilIllusory(tx,ty))continue;
    const x=tx*TILE,y=ty*TILE,a=0.45+0.25*Math.sin(t*4+tx);
    g.strokeStyle='rgba(255,120,170,'+a+')';g.lineWidth=1.6;g.setLineDash([3,3]);g.strokeRect(x+3,y+3,TILE-6,TILE-6);g.setLineDash([]);
    g.strokeStyle='rgba(255,200,230,'+a+')';g.lineWidth=1;g.beginPath();g.moveTo(x+8,y+9);g.lineTo(x+15,y+15);g.lineTo(x+12,y+20);g.lineTo(x+22,y+24);g.stroke();}
}
function lgWorldFront(g){
  const t=G.time;
  /* пузыри вокруг пойманных мобов */
  for(const m of mobs){if(!(m.lgBub>0)||!m.alive)continue;const r=Math.max(m.w,m.h)*0.7,y=m.y-m.h*0.5;
    g.fillStyle='rgba(200,235,255,.14)';g.beginPath();g.arc(m.x,y,r,0,TAU);g.fill();g.strokeStyle='rgba(190,230,255,.75)';g.lineWidth=1.6;g.beginPath();g.arc(m.x,y,r,0,TAU);g.stroke();
    g.fillStyle='rgba(255,255,255,.8)';g.beginPath();g.ellipse(m.x-r*0.4,y-r*0.45,r*0.25,r*0.14,-0.6,0,TAU);g.fill();}
  /* жала пчёлки */
  for(const s of LGS.stings){g.strokeStyle='rgba(255,220,80,'+(s.t/0.18)+')';g.lineWidth=2;g.beginPath();g.moveTo(s.x0,s.y0);g.lineTo(s.x1,s.y1);g.stroke();}
  /* питомец */
  if(LGS.pet){const q=LGS.pet;g.save();g.translate(q.x,q.y-q.hop);lgPetArt(g,q.id,t,q.face,q.hop,1);g.restore();
    if(q.id==='firefly'||q.id==='butterfly'&&LGS.petShT<=0&&petAct('butterfly')){g.save();g.globalCompositeOperation='lighter';softGlow(g,q.x,q.y,q.id==='firefly'?40:22,q.id==='firefly'?'#fff6a0':'#ffc8e8',0.45);g.restore();}}
  /* зонт над головой */
  if(LGS.glide>0){const x=player.x,y=player.y-player.h-14,sw=Math.sin(t*3)*0.08;g.save();g.translate(x,y);g.rotate(sw);
    g.strokeStyle='#5a3a2a';g.lineWidth=1.6;g.beginPath();g.moveTo(0,0);g.lineTo(0,22);g.stroke();
    const ug=g.createLinearGradient(-22,-14,22,0);ug.addColorStop(0,'#ffd0ec');ug.addColorStop(0.5,'#c890f0');ug.addColorStop(1,'#7a4ab8');
    g.fillStyle=ug;g.beginPath();g.moveTo(-24,0);g.quadraticCurveTo(0,-26,24,0);for(let k=4;k>=0;k--){const x0=-24+k*9.6;g.quadraticCurveTo(x0+4.8,-4,x0,0);}g.closePath();g.fill();
    g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=0.8;for(let k=-1;k<=1;k++){g.beginPath();g.moveTo(0,-13);g.quadraticCurveTo(k*8,-10,k*14,0);g.stroke();}
    g.fillStyle='#e0b050';g.beginPath();g.arc(0,-14,1.6,0,TAU);g.fill();g.restore();}
  /* лоза держит у стены */
  if(LGS.cling>0){const d=LGS.clingDir||1,hx=player.x+d*8,hy=player.y-player.h*0.6,wx=player.x+d*(player.w*0.5+6);
    g.strokeStyle='#3e7a46';g.lineWidth=2;for(let k=0;k<3;k++){g.beginPath();g.moveTo(hx,hy+k*4);g.quadraticCurveTo((hx+wx)/2,hy-6+k*6+Math.sin(t*8+k)*2,wx,hy-8+k*8);g.stroke();}
    g.fillStyle='#6ab060';for(let k=0;k<3;k++){g.beginPath();g.ellipse(wx-d*2,hy-8+k*8,2.4,1.2,0.4*d,0,TAU);g.fill();}}
  /* сачок */
  if(LGS.netT>0){const k=1-LGS.netT/0.35,a=-1.6+k*2.4,d=player.facing,x=player.x+d*6,y=player.y-player.h*0.6;
    g.save();g.translate(x,y);g.scale(d,1);g.rotate(a);g.strokeStyle='#8a6a40';g.lineWidth=2;g.beginPath();g.moveTo(0,0);g.lineTo(30,0);g.stroke();
    g.strokeStyle='#e0d8c0';g.lineWidth=1.4;g.beginPath();g.ellipse(40,0,10,7,0,0,TAU);g.stroke();
    g.strokeStyle='rgba(240,235,220,.55)';g.lineWidth=0.6;for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(32+i*2,-6);g.lineTo(46+i*2,8);g.moveTo(32+i*2,6);g.lineTo(46+i*2,-8);g.stroke();}g.restore();}
  /* ноты шкатулки */
  for(const n of LGS.notes){g.globalAlpha=Math.max(0,1-n.t/n.L);g.fillStyle=n.c;g.font='bold 16px system-ui';g.textAlign='center';g.fillText(n.t%0.6<0.3?'♪':'♫',n.x,n.y);}g.globalAlpha=1;
  /* вспышка зеркального щита */
  if(LGS.mirT>0){const a=LGS.mirT/0.3,x=player.x+player.facing*14,y=player.y-player.h*0.55;g.save();g.globalCompositeOperation='lighter';softGlow(g,x,y,40,'#c8e8ff',a*0.8);g.restore();
    g.strokeStyle='rgba(220,240,255,'+a+')';g.lineWidth=2.4;g.beginPath();g.ellipse(x,y,9,13,0,0,TAU);g.stroke();}
}
/* питомец в деревне — рядом с шахтёром */
const LG_LOBPET={x:0,y:0,t:0};
function lgLobbyPet(g){
  const P=player.prog&&player.prog.pets;if(!P||!P.act||!petLv(P.act))return;
  const id=P.act,gr=id==='bunny'||id==='sheep',tx=lobbyPlayer.x-lobbyPlayer.facing*34,ty=gr?-2:-62;
  LG_LOBPET.t+=1/60;LG_LOBPET.x+=(tx-LG_LOBPET.x)*0.06;LG_LOBPET.y+=(ty-LG_LOBPET.y)*0.06;if(Math.abs(LG_LOBPET.x-tx)>600){LG_LOBPET.x=tx;LG_LOBPET.y=ty;}
  const hop=gr&&Math.abs(tx-LG_LOBPET.x)>6?Math.abs(Math.sin(LG_LOBPET.t*9))*8:0;
  g.save();g.translate(LG_LOBPET.x,LG_LOBPET.y-hop+(gr?0:Math.sin(LG_LOBPET.t*2.4)*4));lgPetArt(g,id,LG_LOBPET.t,tx>LG_LOBPET.x?1:-1,hop,1);g.restore();
}
/* питомцы: начало координат — центр (у наземных — у лап) */
function lgPetArt(g,id,t,face,hop,alpha){
  g.save();g.globalAlpha*=alpha;g.scale(face||1,1);
  if(id==='bunny'){
    g.fillStyle='rgba(0,0,0,.2)';g.beginPath();g.ellipse(0,0,9,2.4,0,0,TAU);g.fill();
    plVol(g,-1,-7,8,6.4,'#f4ecfa');plVol(g,5,-12,5.4,5,'#f8f0ff');
    for(const [dx,a] of [[3,-0.3],[6.4,0.15]]){g.save();g.translate(5+dx-4,-15);g.rotate(a+Math.sin(t*3+dx)*0.1);g.fillStyle='#e0d0f0';g.beginPath();g.ellipse(0,-6,2.2,6,0,0,TAU);g.fill();g.fillStyle='#ffb8d8';g.beginPath();g.ellipse(0.3,-6,1,4.4,0,0,TAU);g.fill();g.restore();}
    g.fillStyle='#2a1a3a';g.beginPath();g.arc(7.4,-12.6,1.2,0,TAU);g.fill();g.fillStyle='#fff';g.fillRect(7.4,-13.4,0.6,0.6);g.fillStyle='#ff9ac0';g.beginPath();g.arc(10,-11,0.9,0,TAU);g.fill();
    g.fillStyle='#fff';g.beginPath();g.arc(-8.4,-8,2.4,0,TAU);g.fill();
  }else if(id==='butterfly'){
    /* вид спереди: крылья машут — сужаются к телу */
    const fl=0.3+0.7*Math.abs(Math.sin(t*8));
    for(const s of [-1,1]){g.save();g.scale(s*fl,1);
      g.fillStyle='#d870a8';g.beginPath();g.moveTo(0,-2);g.bezierCurveTo(4,-14,14,-15,12,-5);g.quadraticCurveTo(10,0,0,0);g.fill();
      g.fillStyle='#ffc8e8';g.beginPath();g.moveTo(0,-2.4);g.bezierCurveTo(4,-12.6,12.6,-13.4,10.8,-5.4);g.quadraticCurveTo(9,-1.4,0,-1);g.fill();
      g.fillStyle='#78b8e8';g.beginPath();g.moveTo(0,0);g.bezierCurveTo(6,1,10,6,6,9);g.quadraticCurveTo(2,8,0,2);g.fill();
      g.fillStyle='#b8e4ff';g.beginPath();g.moveTo(0.4,0.6);g.bezierCurveTo(5,1.6,8.4,5.6,5.6,7.6);g.quadraticCurveTo(2.4,6.6,0.4,2);g.fill();
      g.fillStyle='#fff';g.beginPath();g.arc(7.6,-8,1.5,0,TAU);g.fill();g.fillStyle='#8a3a6a';g.beginPath();g.arc(7.6,-8,0.7,0,TAU);g.fill();g.restore();}
    g.fillStyle='#4a2a3a';g.beginPath();g.ellipse(0,0,1.5,5.6,0,0,TAU);g.fill();g.fillStyle='#6a4a5a';g.beginPath();g.arc(0,-5.6,1.8,0,TAU);g.fill();
    g.strokeStyle='#4a2a3a';g.lineWidth=0.7;g.beginPath();g.moveTo(-0.6,-7);g.quadraticCurveTo(-2,-11,-3.6,-11.4);g.moveTo(0.6,-7);g.quadraticCurveTo(2,-11,3.6,-11.4);g.stroke();
  }else if(id==='bee'){
    const fl=Math.sin(t*50)*0.5;g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.ellipse(-2,-7,4,2.2,-0.6+fl,0,TAU);g.ellipse(2,-7,4,2.2,0.6-fl,0,TAU);g.fill();
    plVol(g,0,0,7,5.6,'#ffd040');g.fillStyle='#2a1a08';g.fillRect(-3,-5,2,10);g.fillRect(1.4,-4.6,1.8,9.2);
    g.beginPath();g.moveTo(-7,0);g.lineTo(-10,-0.8);g.lineTo(-10,0.8);g.fill();
    g.fillStyle='#2a1a08';g.beginPath();g.arc(5,-1.4,1.3,0,TAU);g.fill();g.fillStyle='#fff';g.fillRect(5,-2,0.6,0.6);
    g.fillStyle='rgba(255,120,150,.5)';g.beginPath();g.arc(5.6,1.4,1,0,TAU);g.fill();
  }else if(id==='sheep'){
    g.fillStyle='rgba(0,0,0,.2)';g.beginPath();g.ellipse(0,0,10,2.4,0,0,TAU);g.fill();
    g.fillStyle='#4a3a5a';g.fillRect(-6,-4,2,4);g.fillRect(4,-4,2,4);
    for(const [x,y,r] of [[-5,-9,4.4],[0,-11,5],[5,-9,4.4],[-2,-6,4.4],[3,-6,4.4]])plVol(g,x,y,r,r*0.9,'#f8f2ff');
    plVol(g,8,-11,3.6,3.4,'#d8c8e8');g.fillStyle='#2a1a3a';g.beginPath();g.arc(9.4,-11.6,0.9,0,TAU);g.fill();
    g.fillStyle='rgba(230,215,255,.9)';g.font='bold 7px system-ui';g.textAlign='center';const ph=(t*0.5)%1;g.globalAlpha*=1-ph;g.fillText('z',12+ph*4,-18-ph*8);
  }else{/* светлячок */
    g.scale(1.5,1.5);const fl=Math.sin(t*40)*0.5;g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.ellipse(-1,-4,3.4,1.8,-0.5+fl,0,TAU);g.ellipse(1,-4,3.4,1.8,0.5-fl,0,TAU);g.fill();
    plVol(g,1.6,-1,3,2.6,'#3a3048');
    const p=0.7+0.3*Math.sin(t*4);g.save();g.globalCompositeOperation='lighter';softGlow(g,-3,1,12,'#fff6a0',0.7*p);g.restore();
    g.fillStyle='rgb(255,'+Math.round(230+25*p)+',140)';g.beginPath();g.ellipse(-3,1,3.6,3,0,0,TAU);g.fill();
    g.fillStyle='#fff';g.beginPath();g.arc(3,-1.6,0.7,0,TAU);g.fill();
  }
  g.restore();
}

/* ---------- картинки в Кузнице Зари ---------- */
function lgPrevBg(c,w,h,col){c.clearRect(0,0,w,h);const bg=c.createRadialGradient(w/2,h/2-4,3,w/2,h/2,w*0.6);bg.addColorStop(0,hexA(col,0.35));bg.addColorStop(1,'#1a1226');c.fillStyle=bg;c.fillRect(0,0,w,h);}
function lgPreview(c,w,h,kind,lv,t){
  const lvc=kind==='gun'?lv-1:lv,A=ARMOR_LOOK[clamp(lvc,11,15)],gl=A.glow.split(','),col='#'+((1<<24)|(+gl[0]<<16)|(+gl[1]<<8)|(+gl[2])).toString(16).slice(1);
  lgPrevBg(c,w,h,col);
  c.save();
  if(kind==='pick'){c.translate(w/2+4,h/2+8);c.rotate(-0.7);c.scale(1.25,1.25);c.translate(0,-6);drawPickModel(c,lv,t);}
  else if(kind==='sword'){c.translate(w/2,h/2+16);c.rotate(0.6);c.scale(1.1,1.1);lgSwordModel(c,lv,30,t);}
  else if(kind==='armor'){c.translate(w/2,h-6);c.scale(0.95,0.95);drawPlayerSprite(c,0,0,'idle',t,1,{tool:null,armor:lv,pickLvl:player.pickLvl,torch:0,groundY:0});}
  else{const g0=GUNS[lv-1];c.translate(w/2-15,h/2);c.scale(1.6,1.6);drawGunModel(c,g0?g0.id:'lpetal',0);}
  c.restore();
}
function lgItemPreview(c,w,h,id,t){
  lgPrevBg(c,w,h,id==='mirror'?'#c8e8ff':id==='umb'?'#c890f0':id==='vine'?'#6ab060':id==='mbox'?'#ffd0f0':id==='shears'?'#ff6a9a':id==='net'?'#e0d8c0':'#fff0b0');
  c.save();c.translate(w/2,h/2);
  if(id==='lamp'){c.fillStyle='#2a2434';c.beginPath();c.moveTo(-10,-10);c.lineTo(0,-20);c.lineTo(10,-10);c.closePath();c.fill();c.fillStyle='#6a6080';c.beginPath();c.moveTo(-10,-10);c.lineTo(0,-20);c.lineTo(-1,-10);c.closePath();c.fill();
    c.fillStyle='rgba(255,246,220,.4)';c.fillRect(-8,-10,16,20);c.save();c.globalCompositeOperation='lighter';softGlow(c,0,0,26,'#fff0c0',0.6+0.2*Math.sin(t*5));c.restore();
    c.fillStyle='#fffbe8';c.beginPath();c.moveTo(0,-6);c.quadraticCurveTo(4,2,0,6);c.quadraticCurveTo(-4,2,0,-6);c.fill();c.strokeStyle='#1c1824';c.lineWidth=1.6;c.strokeRect(-8,-10,16,20);c.fillStyle='#2a2434';c.fillRect(-10,10,20,3);}
  else if(id==='umb'){const ug=c.createLinearGradient(-20,-14,20,0);ug.addColorStop(0,'#ffd0ec');ug.addColorStop(0.5,'#c890f0');ug.addColorStop(1,'#7a4ab8');
    c.strokeStyle='#5a3a2a';c.lineWidth=1.8;c.beginPath();c.moveTo(0,-8);c.lineTo(0,16);c.quadraticCurveTo(0,20,-4,19);c.stroke();
    c.fillStyle=ug;c.beginPath();c.moveTo(-22,-4);c.quadraticCurveTo(0,-30,22,-4);for(let k=4;k>=0;k--){const x0=-22+k*8.8;c.quadraticCurveTo(x0+4.4,-8,x0,-4);}c.closePath();c.fill();
    c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=0.8;for(let k=-1;k<=1;k++){c.beginPath();c.moveTo(0,-17);c.quadraticCurveTo(k*8,-14,k*13,-4);c.stroke();}}
  else if(id==='vine'){plVol(c,0,4,10,9,'#5a8a4a');c.fillStyle='#3e6a34';for(let k=0;k<4;k++){c.beginPath();c.ellipse(-6+k*4,-6,2,4,0,0,TAU);c.fill();}
    c.strokeStyle='#2e5a30';c.lineWidth=1.6;c.beginPath();c.moveTo(-10,8);c.quadraticCurveTo(-18,-4,-12,-16);c.quadraticCurveTo(-6,-22,2,-18);c.stroke();
    c.fillStyle='#8ad070';for(const [x,y] of [[-15,-8],[-9,-18],[0,-19]]){c.beginPath();c.ellipse(x,y,3,1.6,0.6,0,TAU);c.fill();}}
  else if(id==='net'){c.rotate(-0.6);c.strokeStyle='#8a6a40';c.lineWidth=2.4;c.beginPath();c.moveTo(-18,14);c.lineTo(2,-2);c.stroke();
    c.strokeStyle='#e0d8c0';c.lineWidth=1.6;c.beginPath();c.ellipse(10,-10,11,8,-0.6,0,TAU);c.stroke();c.strokeStyle='rgba(240,235,220,.5)';c.lineWidth=0.6;for(let i=-3;i<=3;i++){c.beginPath();c.moveTo(4+i*2,-18);c.lineTo(16+i*2,-2);c.stroke();}
    c.rotate(0.6);lgPetArt(c,'butterfly',t,1,0,1);}
  else if(id==='shears'){for(const s of [-1,1]){c.save();c.rotate(s*(0.25+0.12*Math.sin(t*3)));c.fillStyle='#d8dce8';c.beginPath();c.moveTo(-2,0);c.lineTo(20,-1.6*s);c.lineTo(-2,3*s);c.closePath();c.fill();
      c.fillStyle='#8a929c';c.fillRect(-2,s>0?0:-1,20,1);c.strokeStyle='#c8304e';c.lineWidth=2.4;c.beginPath();c.ellipse(-9,s*5,5,3.4,0.2*s,0,TAU);c.stroke();c.restore();}
    c.fillStyle='#e0b050';c.beginPath();c.arc(0,0,2,0,TAU);c.fill();}
  else if(id==='mbox'){c.fillStyle='#7a3a5a';c.fillRect(-14,-2,28,14);c.fillStyle='#9a5a7a';c.fillRect(-14,-2,28,3);c.fillStyle='#e0b050';c.fillRect(-14,5,28,1.4);
    c.save();c.translate(-14,-2);c.rotate(-0.9);c.fillStyle='#8a4a6a';c.fillRect(0,-12,28,12);c.fillStyle='rgba(255,220,240,.6)';c.fillRect(2,-10,24,8);c.restore();
    c.fillStyle='#ffd0e8';c.beginPath();c.arc(4,-6+Math.sin(t*2)*1,3,0,TAU);c.fill();c.fillRect(3.4,-12,1.2,6);
    c.fillStyle='#fff0b0';c.font='bold 11px system-ui';c.textAlign='center';c.fillText('♪',14+Math.sin(t*2)*2,-14-((t*10)%8));}
  else{const mg=c.createRadialGradient(-5,-6,2,0,0,17);mg.addColorStop(0,'#ffffff');mg.addColorStop(0.5,'#b8d8f0');mg.addColorStop(1,'#4a6a98');
    c.fillStyle='#c8a050';c.beginPath();c.ellipse(0,0,17,19,0,0,TAU);c.fill();c.fillStyle=mg;c.beginPath();c.ellipse(0,0,14,16,0,0,TAU);c.fill();
    c.fillStyle='rgba(255,255,255,.6)';c.beginPath();c.moveTo(-9,-6);c.lineTo(-4,-12);c.lineTo(-1,-12);c.lineTo(-7,-3);c.closePath();c.fill();
    c.save();c.globalCompositeOperation='lighter';softGlow(c,0,0,24,'#c8e8ff',0.3+0.2*Math.sin(t*3));c.restore();}
  c.restore();
}

/* ---------- звук выстрела огнестрела Зари ---------- */
{const base=SFX.shot;SFX.shot=function(id){
  switch(id){
    case 'lpetal':if(!sfxGate('shot',45))return;AU.noise(0.18,5000,0.12,0,{type:'bandpass',q:2,to:2200});AU.bell(1568,0.2,0.04,0,{ratio:2.01,index:0.4});return;
    case 'lbubble':if(!sfxGate('shot',45))return;AU.osc('sine',380,0.22,0.16,0,{to:900});AU.osc('sine',760,0.12,0.06,0.04,{to:1500});return;
    case 'lprism':if(!sfxGate('shot',45))return;AU.bell(2093,0.5,0.06,0,{ratio:1.5,index:0.8,rev:0.5});AU.noise(0.12,7000,0.05,0,{type:'highpass'});return;
    case 'lbeegun':if(!sfxGate('shot',45))return;AU.osc('sawtooth',220,0.25,0.06,0,{to:180,lp:900});AU.noise(0.1,1800,0.08,0,{type:'bandpass',q:3});return;
    case 'lchime':if(!sfxGate('shot',45))return;AU.bell(523,1.1,0.1,0,{ratio:2.76,index:1.2,rev:0.6});AU.bell(1046,0.8,0.04,0.02,{ratio:2.01,index:0.6});return;
  }
  return base.call(this,id);};}
