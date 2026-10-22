'use strict';
/* ============================================================
   ЗНАЧКИ ПРЕДМЕТОВ И ПРОКАЧЕК (единый стиль для Земли, Ада и Лиловых небес)
   uiIcon(ключ[,цвет]) — картинка 96×96 (data-URI, рисуется один раз и хранится);
   uiIconHtml(ключ[,цвет]) — готовый <img> для окон (кузницы, лавки).
   Стиль как у предметов Кузницы Зари (lgItemPreview): плита с радиальным свечением цвета предмета,
   предмет в 3 тонах (свет сверху-слева, основной, тень), контурный свет и тёмная обводка.
   Ключ — «имя» или «имя:уровень» (pick:3, sword:7, armor:5, gun:hellfire). Второй параметр — акцентный цвет
   (Ад — красно-оранжевый, Лиловые небеса — сиреневый), он меняет свечение и детали.
   ============================================================ */
const IC_OL='#150d12';
const IC_BASE=['#1d1812','#25130f','#1a1226'];          /* фон плиты: Земля, Ад, Лиловые небеса */
const UIC_CACHE={};

/* ---------- кирпичики рисования (центр холста — точка 0,0, размер 48×48) ---------- */
const icT=(h)=>[shadeHex(h,0.4),h,shadeHex(h,-0.38)];
/* путь-прямоугольник со скруглением и путь-многоугольник — возвращают функции построения пути */
const icRR=(x,y,w,h,r)=>(c)=>{c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);c.lineTo(x+w,y+h-r);c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
  c.lineTo(x+r,y+h);c.quadraticCurveTo(x,y+h,x,y+h-r);c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath();};
const icPoly=(pts)=>(c)=>{c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath();};
const icEl=(x,y,rx,ry,rot)=>(c)=>{c.beginPath();c.ellipse(x,y,rx,ry,rot||0,0,TAU);};
/* залитая фигура в 3 тонах: тень снизу, градиент свет→основной→тень, контурный свет сверху-слева, тёмная обводка */
function icShape(c,pathFn,tones,bb,noShadow){
  const b=bb||[-22,-22,22,22];
  c.save();
  pathFn(c);
  const g=c.createLinearGradient(b[0],b[1],b[2],b[3]);g.addColorStop(0,tones[0]);g.addColorStop(0.42,tones[1]);g.addColorStop(1,tones[2]);
  c.fillStyle=g;
  if(!noShadow){c.shadowColor='rgba(0,0,0,.55)';c.shadowBlur=3;c.shadowOffsetX=1.2;c.shadowOffsetY=1.8;}
  c.fill();
  c.shadowColor='transparent';
  c.save();c.clip();
  c.translate(-1.5,-1.5);pathFn(c);c.lineWidth=3.2;c.strokeStyle='rgba(0,0,0,.28)';c.stroke();
  c.restore();
  /* контурный свет: смещённая внутрь обводка */
  c.save();pathFn(c);c.clip();c.translate(1.3,1.3);pathFn(c);c.lineWidth=2;c.strokeStyle='rgba(255,255,255,.42)';c.stroke();c.restore();
  pathFn(c);c.lineWidth=1.5;c.lineJoin='round';c.strokeStyle=IC_OL;c.stroke();
  c.restore();
}
/* линия-стержень со светом и тенью (рукояти, рельсы, трубки) */
function icRod(c,x1,y1,x2,y2,w,tones){
  const dx=x2-x1,dy=y2-y1,l=Math.hypot(dx,dy)||1,nx=-dy/l,ny=dx/l;
  c.save();c.lineCap='round';
  c.strokeStyle=IC_OL;c.lineWidth=w+2.8;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();
  c.strokeStyle=tones[1];c.lineWidth=w;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();
  c.strokeStyle=tones[2];c.lineWidth=w*0.45;c.beginPath();c.moveTo(x1-nx*w*0.27,y1-ny*w*0.27);c.lineTo(x2-nx*w*0.27,y2-ny*w*0.27);c.stroke();
  c.strokeStyle=tones[0];c.lineWidth=w*0.3;c.beginPath();c.moveTo(x1+nx*w*0.22,y1+ny*w*0.22);c.lineTo(x2+nx*w*0.22,y2+ny*w*0.22);c.stroke();
  c.restore();
}
/* изогнутая трубка по пути */
function icTube(c,pathFn,w,tones){
  c.save();c.lineCap='round';c.lineJoin='round';
  pathFn(c);c.strokeStyle=IC_OL;c.lineWidth=w+2.8;c.stroke();
  pathFn(c);c.strokeStyle=tones[1];c.lineWidth=w;c.stroke();
  pathFn(c);c.strokeStyle=tones[0];c.lineWidth=w*0.3;c.save();c.translate(-w*0.18,-w*0.18);c.stroke();c.restore();
  c.restore();
}
const icOpen=(pts)=>(c)=>{c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));};
function icGlow(c,x,y,r,col,a){c.save();c.globalCompositeOperation='lighter';softGlow(c,x,y,r,col,a);c.restore();}
function icStar(c,x,y,r,col){c.save();c.fillStyle=col;c.beginPath();for(let i=0;i<8;i++){const a=i/8*TAU-Math.PI/2,rr=i%2?r*0.32:r;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}c.closePath();c.fill();c.restore();}
function icDot(c,x,y,r,col){c.fillStyle=col;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();}
/* заклёпка: светлая точка с тёмным ободком */
function icRivet(c,x,y,r){c.fillStyle='rgba(0,0,0,.55)';c.beginPath();c.arc(x+0.4,y+0.5,r+0.5,0,TAU);c.fill();c.fillStyle='#e8e0d0';c.beginPath();c.arc(x,y,r,0,TAU);c.fill();c.fillStyle='rgba(255,255,255,.8)';c.beginPath();c.arc(x-r*0.3,y-r*0.3,r*0.4,0,TAU);c.fill();}
/* язык пламени */
function icFlame(c,x,y,s,outer,inner,rot){
  c.save();c.translate(x,y);c.rotate(rot||0);c.scale(s,s);
  icGlow(c,0,-8,18,outer,0.55);
  c.fillStyle=outer;c.beginPath();c.moveTo(0,0);c.bezierCurveTo(-8,-3,-7,-12,-1,-20);c.bezierCurveTo(0,-13,6,-10,6,-4);c.bezierCurveTo(6,-1,3,1,0,0);c.fill();
  c.strokeStyle='rgba(20,5,5,.7)';c.lineWidth=0.9;c.stroke();
  c.fillStyle=inner;c.beginPath();c.moveTo(0,-0.5);c.bezierCurveTo(-4,-3,-3,-8,0,-12);c.bezierCurveTo(1,-8,3,-6,3,-3);c.bezierCurveTo(3,-1,2,0,0,-0.5);c.fill();
  c.restore();
}

/* плита: тёмная подложка с радиальным свечением цвета предмета, виньетка и внутренняя рамка */
function icPlate(c,col,base){
  c.fillStyle=base;c.fillRect(0,0,48,48);
  const g=c.createRadialGradient(24,20,2,24,24,34);g.addColorStop(0,hexA(col,0.46));g.addColorStop(0.55,hexA(col,0.16));g.addColorStop(1,hexA(col,0));
  c.fillStyle=g;c.fillRect(0,0,48,48);
  const v=c.createRadialGradient(24,24,17,24,24,36);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(0,0,0,.5)');c.fillStyle=v;c.fillRect(0,0,48,48);
  const sh=c.createLinearGradient(0,0,0,18);sh.addColorStop(0,'rgba(255,255,255,.09)');sh.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=sh;c.fillRect(0,0,48,18);
  c.strokeStyle=hexA(col,0.4);c.lineWidth=1;c.strokeRect(0.5,0.5,47,47);
}

/* ---------- сами значки: f(c, акцент) рисует в системе координат с центром 0,0 ---------- */
function icCart(c,x,y,h,acc,rot){
  c.save();c.translate(x,y);c.rotate(rot||0);
  icShape(c,icRR(-4,-h/2+5,8,h-5,1.6),icT('#d8a040'),[-4,0,4,0]);
  c.fillStyle='rgba(60,30,0,.45)';c.fillRect(-4,h/2-5,8,1.6);
  icShape(c,(g)=>{g.beginPath();g.moveTo(-3.6,-h/2+5);g.quadraticCurveTo(-3.6,-h/2,0,-h/2-5);g.quadraticCurveTo(3.6,-h/2,3.6,-h/2+5);g.closePath();},icT(acc||'#c8683a'),[-4,0,4,0],true);
  c.restore();
}
function icBolt(c,x,y,rot){
  c.save();c.translate(x,y);c.rotate(rot);
  icRod(c,0,8,0,-12,2.6,icT('#a8b4c8'));
  icShape(c,icPoly([[-4.2,-11],[4.2,-11],[0,-22]]),icT('#d0d8e8'),[-4,-22,4,-11],true);
  c.strokeStyle=IC_OL;c.lineWidth=1.5;c.lineCap='round';c.beginPath();c.moveTo(0,6);c.lineTo(-4.5,12);c.moveTo(0,6);c.lineTo(4.5,12);c.stroke();
  c.strokeStyle='#e0b060';c.lineWidth=0.9;c.beginPath();c.moveTo(0,6);c.lineTo(-4.5,12);c.moveTo(0,6);c.lineTo(4.5,12);c.stroke();
  c.restore();
}
function icBarr(c,x,y,s,acc){
  {const n=parseInt(acc.slice(1),16),lum=((n>>16)&255)*0.3+((n>>8)&255)*0.59+(n&255)*0.11;if(lum<90)acc=shadeHex(acc,0.45-lum/300);}
  c.save();c.translate(x,y);c.scale(s,s);
  const T=icT(acc);
  icShape(c,icRR(-16,-16,32,32,3.5),T,[-16,-16,16,16]);
  c.save();icRR(-16,-16,32,32,3.5)(c);c.clip();
  c.strokeStyle='rgba(0,0,0,.55)';c.lineWidth=1.3;
  for(const yy of [-5.3,5.3]){c.beginPath();c.moveTo(-16,yy);c.lineTo(16,yy);c.stroke();c.strokeStyle='rgba(255,255,255,.18)';c.beginPath();c.moveTo(-16,yy+1.2);c.lineTo(16,yy+1.2);c.stroke();c.strokeStyle='rgba(0,0,0,.55)';}
  /* накладные брусья крест-накрест */
  for(const sg of [1,-1])icRod(c,-15*sg,-15,15*sg,15,4.6,[shadeHex(acc,0.55),shadeHex(acc,0.12),shadeHex(acc,-0.5)]);
  c.restore();
  icRivet(c,-12,-12,1.5);icRivet(c,12,-12,1.5);icRivet(c,-12,12,1.5);icRivet(c,12,12,1.5);
  c.restore();
}
function icCrate(c,x,y,s,col){
  c.save();c.translate(x,y);c.scale(s,s);
  const T=icT(col||'#b8803e');
  icShape(c,icRR(-12,-12,24,24,2.4),T,[-12,-12,12,12]);
  c.save();icRR(-12,-12,24,24,2.4)(c);c.clip();
  c.strokeStyle='rgba(0,0,0,.5)';c.lineWidth=1.1;for(const yy of [-4,4]){c.beginPath();c.moveTo(-12,yy);c.lineTo(12,yy);c.stroke();}
  c.strokeStyle='rgba(255,230,180,.22)';for(const yy of [-3,5]){c.beginPath();c.moveTo(-12,yy);c.lineTo(12,yy);c.stroke();}
  icRod(c,-12,-12,12,12,3.2,[shadeHex(col||'#b8803e',0.4),shadeHex(col||'#b8803e',0.05),shadeHex(col||'#b8803e',-0.45)]);
  c.restore();
  c.fillStyle='#5a6068';for(const [px,py] of [[-12,-12],[8,-12],[-12,8],[8,8]])c.fillRect(px,py,4,4);
  icRivet(c,-10,-10,0.9);icRivet(c,10,-10,0.9);icRivet(c,-10,10,0.9);icRivet(c,10,10,0.9);
  c.restore();
}
function icPotion(c,liq,cross){
  const body=(g)=>{g.beginPath();g.moveTo(-4.5,-12);g.lineTo(-4.5,-6);g.bezierCurveTo(-19,-1,-17,21,0,21);g.bezierCurveTo(17,21,19,-1,4.5,-6);g.lineTo(4.5,-12);g.closePath();};
  c.save();
  body(c);c.fillStyle='rgba(190,225,240,.2)';c.shadowColor='rgba(0,0,0,.5)';c.shadowBlur=3;c.shadowOffsetY=2;c.fill();c.shadowColor='transparent';
  c.save();body(c);c.clip();
  const lg=c.createLinearGradient(-14,2,14,20);lg.addColorStop(0,shadeHex(liq,0.45));lg.addColorStop(0.5,liq);lg.addColorStop(1,shadeHex(liq,-0.4));
  c.fillStyle=lg;c.beginPath();c.moveTo(-20,3);c.quadraticCurveTo(-8,0,0,3);c.quadraticCurveTo(8,6,20,3);c.lineTo(20,24);c.lineTo(-20,24);c.closePath();c.fill();
  c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=1.1;c.beginPath();c.moveTo(-20,3);c.quadraticCurveTo(-8,0,0,3);c.quadraticCurveTo(8,6,20,3);c.stroke();
  c.fillStyle='rgba(255,255,255,.5)';for(const [bx,by,br] of [[6,11,1.6],[-3,15,1.2],[9,16,1]]){c.beginPath();c.arc(bx,by,br,0,TAU);c.fill();}
  if(cross){c.fillStyle='rgba(255,255,255,.88)';c.fillRect(-1.7,7.5,3.4,10);c.fillRect(-5,10.8,10,3.4);}
  c.translate(-1.6,-1.6);body(c);c.lineWidth=3;c.strokeStyle='rgba(0,0,0,.25)';c.stroke();
  c.restore();
  c.save();body(c);c.clip();c.translate(1.3,1.3);body(c);c.lineWidth=2;c.strokeStyle='rgba(255,255,255,.4)';c.stroke();c.restore();
  body(c);c.lineWidth=1.5;c.strokeStyle=IC_OL;c.stroke();
  c.strokeStyle='rgba(255,255,255,.75)';c.lineWidth=1.8;c.lineCap='round';c.beginPath();c.moveTo(-12,3);c.quadraticCurveTo(-14,11,-9,16);c.stroke();
  icShape(c,icRR(-6,-15,12,3.6,1.4),icT('#d8b050'),[-6,0,6,0],true);
  icShape(c,icRR(-4,-22,8,7.4,1.6),icT('#a8743c'),[-4,-22,4,-14],true);
  c.restore();
}
function icBomb(c,col,spark,sleepy){
  const body=icEl(0,4,14,14);
  icShape(c,body,icT(col),[-14,-10,12,18]);
  c.save();body(c);c.clip();
  const rg=c.createRadialGradient(-6,-3,0.5,-6,-3,11);rg.addColorStop(0,'rgba(255,255,255,.65)');rg.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=rg;c.fillRect(-16,-12,32,32);
  c.restore();
  icShape(c,icRR(-4.6,-13,9.2,6,1.6),icT('#8a9098'),[-5,-13,5,-7],true);
  c.strokeStyle=IC_OL;c.lineWidth=3.4;c.lineCap='round';c.beginPath();c.moveTo(0,-13);c.quadraticCurveTo(2,-18,8,-19);c.stroke();
  c.strokeStyle='#d8b878';c.lineWidth=1.6;c.beginPath();c.moveTo(0,-13);c.quadraticCurveTo(2,-18,8,-19);c.stroke();
  if(sleepy){
    c.strokeStyle='#f0d8ff';c.lineWidth=1.8;c.lineJoin='round';c.lineCap='round';
    for(const [zx,zy,zs] of [[8,-17,4.4],[14,-11,3.2]]){c.strokeStyle=IC_OL;c.lineWidth=3.2;c.beginPath();c.moveTo(zx-zs,zy-zs);c.lineTo(zx+zs,zy-zs);c.lineTo(zx-zs,zy+zs);c.lineTo(zx+zs,zy+zs);c.stroke();
      c.strokeStyle='#f0d8ff';c.lineWidth=1.6;c.beginPath();c.moveTo(zx-zs,zy-zs);c.lineTo(zx+zs,zy-zs);c.lineTo(zx-zs,zy+zs);c.lineTo(zx+zs,zy+zs);c.stroke();}
    icStar(c,-12,-14,3.6,'#fff0ff');
  }else{icGlow(c,9,-19,14,spark,0.9);icStar(c,9,-19,6,'#fff6c0');icDot(c,9,-19,1.6,'#fff');}
}
function icBarsDrill(c,acc,sc){
  c.save();c.scale(sc,sc);
  icShape(c,icPoly([[-7,-5],[7,-5],[0,21]]),icT('#b4bcc8'),[-7,-5,7,21]);
  c.save();icPoly([[-7,-5],[7,-5],[0,21]])(c);c.clip();
  c.strokeStyle='rgba(30,36,48,.65)';c.lineWidth=1.6;for(let k=0;k<5;k++){c.beginPath();c.moveTo(-9,-3+k*5);c.lineTo(9,-9+k*5);c.stroke();}
  c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=0.8;for(let k=0;k<5;k++){c.beginPath();c.moveTo(-9,-2+k*5);c.lineTo(9,-8+k*5);c.stroke();}
  c.restore();
  icShape(c,icRR(-9,-9,18,5,1.8),icT('#d8a840'),[-9,-9,9,-4],true);
  icShape(c,icRR(-8,-23,16,14.5,3),icT(acc),[-8,-23,8,-9]);
  c.fillStyle='rgba(20,10,5,.55)';for(let k=0;k<3;k++)c.fillRect(-4,-19+k*3.4,8,1.3);
  c.restore();
}
function icBackpack(c,col){
  const T=icT(col);
  icTube(c,(g)=>{g.beginPath();g.moveTo(-5,-17);g.quadraticCurveTo(0,-26,5,-17);},2.4,icT('#3a3030'));
  icShape(c,icRR(-14,-9,28,30,8),T,[-14,-9,14,21]);
  icShape(c,(g)=>{g.beginPath();g.moveTo(-14,-3);g.bezierCurveTo(-15,-22,15,-22,14,-3);g.bezierCurveTo(8,0,-8,0,-14,-3);g.closePath();},icT(shadeHex(col,0.12)),[-14,-18,14,0]);
  icShape(c,icRR(-9,7,18,11,3.5),icT(shadeHex(col,-0.15)),[-9,7,9,18]);
  c.strokeStyle='rgba(0,0,0,.55)';c.lineWidth=1.1;c.setLineDash([2,1.6]);c.beginPath();c.moveTo(-6,9.5);c.lineTo(6,9.5);c.stroke();c.setLineDash([]);
  icShape(c,icRR(-3.4,-4,6.8,6.4,1.4),icT('#e0b84e'),[-3,-4,3,2],true);
  icTube(c,icOpen([[-14,2],[-18,12],[-15,19]]),2.2,icT('#3a3030'));icTube(c,icOpen([[14,2],[18,12],[15,19]]),2.2,icT('#3a3030'));
}

const IC={
  speed:{col:'#ffc84a',f(c,a){a=a||'#ffc84a';
    for(const [y,l] of [[-8,12],[2,17],[11,10]]){c.strokeStyle=hexA(a,0.55);c.lineWidth=2.2;c.lineCap='round';c.beginPath();c.moveTo(-22,y);c.lineTo(-22+l,y);c.stroke();}
    icGlow(c,2,0,24,a,0.55);
    icShape(c,icPoly([[3,-22],[-11,2],[-2,2],[-6,22],[11,-5],[2,-5],[9,-22]]),icT(a),[-11,-22,11,22]);
    c.fillStyle='rgba(255,255,255,.7)';c.beginPath();c.moveTo(3.6,-19);c.lineTo(-6,-1);c.lineTo(-4,-1);c.lineTo(5,-17);c.fill();}},
  drill:{col:'#e8892c',f(c,a){a=a||'#e8892c';c.rotate(-0.62);c.translate(0,0);icBarsDrill(c,a,0.88);}},
  drills:{col:'#e8892c',f(c,a){a=a||'#e8892c';
    c.save();c.translate(-12,-1);c.rotate(0.25);c.globalAlpha=0.85;icBarsDrill(c,shadeHex(a,-0.3),0.6);c.restore();
    c.save();c.translate(12,-1);c.rotate(-0.25);c.globalAlpha=0.85;icBarsDrill(c,shadeHex(a,-0.3),0.6);c.restore();
    c.save();c.translate(0,2);icBarsDrill(c,a,0.8);c.restore();}},
  barr:{col:'#a8743e',f(c,a){icBarr(c,0,1,1,a||'#8a5a30');}},
  barrpack:{col:'#a8743e',f(c,a){const q=a||'#8a5a30';icBarr(c,-9,8,0.52,q);icBarr(c,10,8,0.52,q);icBarr(c,0,-9,0.52,q);}},
  slots:{col:'#4fc08a',f(c,a){icBackpack(c,a||'#3f9a64');}},
  stack:{col:'#c8a060',f(c,a){icCrate(c,-10,9,0.78,'#b8803e');icCrate(c,10,9,0.78,'#a87636');icCrate(c,0,-9,0.78,'#c8904a');}},
  crate:{col:'#c8a060',f(c,a){icCrate(c,0,1,1.45,'#b8803e');
    icShape(c,icRR(-3.6,-2,7.2,8,1.6),icT('#d8b050'),[-4,-2,4,6],true);c.fillStyle=IC_OL;c.fillRect(-0.7,0.6,1.4,3);}},
  torch:{col:'#ffb840',f(c,a){c.rotate(0.38);c.translate(0,6);c.scale(0.92,0.92);
    icGlow(c,0,-14,26,a||'#ffb840',0.5);
    icRod(c,0,22,0,-4,5.2,icT('#9a6a34'));
    icShape(c,icPoly([[-5.6,-11],[5.6,-11],[4,-2.5],[-4,-2.5]]),icT('#8a9098'),[-6,-11,6,-2],true);
    icShape(c,icRR(-6,-13,12,3,1.2),icT('#b0b8c0'),[-6,0,6,0],true);
    icFlame(c,0,-12,1.2,a||'#ff9a2a','#fff0a0',0);}},
  potion:{col:'#5ee08a',f(c,a){icPotion(c,a||'#46d078',true);}},
  icepot:{col:'#7fd8ff',f(c,a){icPotion(c,'#58c4f0',false);icStar(c,-13,-12,4,'#e8faff');icStar(c,14,-6,3,'#e8faff');}},
  boots:{col:'#a070e8',f(c,a){
    const T=icT(a||'#8a58d0');
    icShape(c,(g)=>{g.beginPath();g.moveTo(-10,-21);g.lineTo(4,-21);g.lineTo(5,-6);g.bezierCurveTo(10,-4,17,-1,17,5);g.lineTo(17,8);g.lineTo(-10,8);g.closePath();},T,[-10,-21,17,8]);
    icShape(c,icRR(-11,-22,16,6,2),icT(shadeHex(a||'#8a58d0',0.25)),[-11,-22,5,-16],true);
    icShape(c,icRR(-11,7,29,4.5,2),icT('#3a3038'),[-11,7,18,12],true);
    c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=0.9;c.beginPath();c.moveTo(-4,-9);c.lineTo(4,-9);c.moveTo(-4,-5);c.lineTo(4,-5);c.stroke();
    icTube(c,icOpen([[-8,12],[8,13.5],[-8,15.5],[8,17],[-8,18.5],[8,20]]),1.9,icT('#b8c4d4'));
    icShape(c,icRR(-11,20,22,3,1.2),icT('#8a9098'),[-11,20,11,23],true);}},
  ladder:{col:'#d09858',f(c,a){c.rotate(0.22);
    const T=icT(a||'#c08a4a');
    for(const y of [-14,-4,6,16])icRod(c,-9,y,9,y,3.6,T);
    icRod(c,-9,-22,-9,22,5,T);icRod(c,9,-22,9,22,5,T);
    c.fillStyle='rgba(30,16,4,.55)';for(const sx of [-9,9])for(const y of [-14,-4,6,16])c.fillRect(sx-0.6,y-0.6,1.2,1.2);}},
  hook:{col:'#7fa8d8',f(c,a){
    const T=icT('#a8b8cc');
    icTube(c,(g)=>{g.beginPath();g.moveTo(5,-17);g.bezierCurveTo(16,-22,22,-8,14,-2);g.bezierCurveTo(8,2,16,10,20,20);},2.4,icT('#c8a468'));
    c.strokeStyle='rgba(60,36,10,.7)';c.lineWidth=0.9;c.setLineDash([1.6,1.6]);c.beginPath();c.moveTo(5,-17);c.bezierCurveTo(16,-22,22,-8,14,-2);c.bezierCurveTo(8,2,16,10,20,20);c.stroke();c.setLineDash([]);
    icRod(c,0,-12,0,10,4.6,T);
    icTube(c,(g)=>{g.beginPath();g.moveTo(-14,0);g.bezierCurveTo(-14,15,-6,20,0,20);g.bezierCurveTo(6,20,14,15,14,0);},4,T);
    icShape(c,icPoly([[-18,3],[-10,3],[-14,-6]]),icT('#d0d8e8'),[-18,-6,-10,3],true);
    icShape(c,icPoly([[10,3],[18,3],[14,-6]]),icT('#d0d8e8'),[10,-6,18,3],true);
    icShape(c,icEl(0,-16,5.4,5.4),T,[-6,-22,6,-10],true);c.fillStyle='#1a1424';c.beginPath();c.arc(0,-16,2.2,0,TAU);c.fill();}},
  hookammo:{col:'#7fa8d8',f(c,a){icBolt(c,-10,3,-0.45);icBolt(c,10,3,0.45);icBolt(c,0,1,0);}},
  gunammo:{col:'#ffb060',f(c,a){const q=a||'#c8683a';icCart(c,-10,7,24,q,-0.12);icCart(c,10,7,24,q,0.12);icCart(c,0,3,30,q,0);}},
  furn:{col:'#ff8a3a',f(c,a){c.translate(5,1);c.scale(0.9,0.9);
    icGlow(c,-20,0,22,a||'#ff7a2a',0.6);
    icRod(c,-4,-1,-16,-1,5,icT('#8a8f98'));
    icShape(c,icPoly([[-18,-4.6],[-14,-3.6],[-14,1.6],[-18,2.6]]),icT('#c8a050'),[-18,-5,-14,3],true);
    icShape(c,icPoly([[-4,-12],[18,-15],[18,12],[-4,9]]),icT('#7a4a2a'),[-4,-14,18,12]);
    c.save();icPoly([[-4,-12],[18,-15],[18,12],[-4,9]])(c);c.clip();
    c.strokeStyle='rgba(0,0,0,.55)';c.lineWidth=1.3;for(let k=0;k<4;k++){c.beginPath();c.moveTo(1+k*4.6,-13);c.lineTo(1+k*4.6,12);c.stroke();}
    c.strokeStyle='rgba(255,220,170,.25)';for(let k=0;k<4;k++){c.beginPath();c.moveTo(2.2+k*4.6,-13);c.lineTo(2.2+k*4.6,12);c.stroke();}
    c.restore();
    icShape(c,icRR(-2,-19,22,6,2),icT('#a87a48'),[-2,-19,20,-13]);
    icShape(c,icRR(-2,8,22,6,2),icT('#a87a48'),[-2,8,20,14]);
    icRod(c,19,-17,23,-23,3,icT('#6a4a2a'));
    icFlame(c,-22,5,0.9,a||'#ff7a2a','#fff0a0',-1.45);}},
  cloak:{col:'#e05a2a',f(c,a){
    const T=icT(a||'#b8442a');
    icShape(c,(g)=>{g.beginPath();g.moveTo(-9,-19);g.quadraticCurveTo(0,-24,9,-19);g.lineTo(18,18);g.quadraticCurveTo(9,23,0,19);g.quadraticCurveTo(-9,23,-18,18);g.closePath();},T,[-18,-20,18,22]);
    c.save();c.beginPath();c.moveTo(-9,-19);c.quadraticCurveTo(0,-24,9,-19);c.lineTo(18,18);c.quadraticCurveTo(9,23,0,19);c.quadraticCurveTo(-9,23,-18,18);c.closePath();c.clip();
    c.strokeStyle='rgba(40,8,4,.5)';c.lineWidth=1.6;for(const [x1,x2] of [[-3,-8],[3,8],[0,0]]){c.beginPath();c.moveTo(x1,-14);c.quadraticCurveTo((x1+x2)/2,2,x2,22);c.stroke();}
    c.strokeStyle='rgba(255,200,150,.25)';for(const [x1,x2] of [[-2,-7],[4,9]]){c.beginPath();c.moveTo(x1,-14);c.quadraticCurveTo((x1+x2)/2,2,x2,22);c.stroke();}
    c.fillStyle='#ffa030';c.fillRect(-20,14,40,3);c.fillStyle='#ffd870';c.fillRect(-20,14,40,1);
    c.restore();
    icShape(c,icEl(0,-16,6.6,3.6),icT(shadeHex(a||'#b8442a',0.18)),[-7,-20,7,-12],true);
    icDot(c,0,-14.4,2.8,'#e0b84e');icDot(c,-0.7,-15.1,1,'#fff0b0');}},
  resp:{col:'#9ac8a0',f(c,a){
    icTube(c,icOpen([[-15,-4],[-22,-9]]),2.4,icT('#3a3030'));icTube(c,icOpen([[15,-4],[22,-9]]),2.4,icT('#3a3030'));
    icShape(c,(g)=>{g.beginPath();g.moveTo(-15,-8);g.quadraticCurveTo(0,-17,15,-8);g.quadraticCurveTo(17,6,0,18);g.quadraticCurveTo(-17,6,-15,-8);g.closePath();},icT(a||'#566a5a'),[-16,-14,16,18]);
    for(const s of [-1,1]){const fx=s*11;icShape(c,icEl(fx,4,6.6,6.6),icT('#9aa4ac'),[fx-6,-3,fx+6,10]);
      c.strokeStyle='rgba(20,24,30,.7)';c.lineWidth=1;for(let k=-1;k<=1;k++){c.beginPath();c.moveTo(fx-4,4+k*2.6);c.lineTo(fx+4,4+k*2.6);c.stroke();}icDot(c,fx,4,1.4,'#e0b84e');}
    icShape(c,icEl(0,8,3.8,3.8),icT('#d8a848'),[-4,4,4,12],true);c.fillStyle='#2a1c0a';c.beginPath();c.arc(0,8,1.4,0,TAU);c.fill();}},
  jet:{col:'#ff9a4a',f(c,a){
    c.translate(0,-3);c.scale(0.92,0.92);
    icFlame(c,-8,22,1.05,a||'#ff8a2a','#fff0a0',Math.PI);icFlame(c,8,22,1.05,a||'#ff8a2a','#fff0a0',Math.PI);
    for(const s of [-1,1]){const x=s*8.5;
      icShape(c,icPoly([[x-4,12],[x+4,12],[x+5.5,19],[x-5.5,19]]),icT('#6a7078'),[x-5,12,x+5,19],true);
      icShape(c,icRR(x-6.4,-18,12.8,31,6),icT(s<0?'#d84a3a':'#c8423a'),[x-6.4,-18,x+6.4,13]);
      c.fillStyle='rgba(255,255,255,.22)';c.fillRect(x-4,-14,2,22);
      c.fillStyle='#e0c470';c.fillRect(x-6.4,-6,12.8,2.6);c.fillRect(x-6.4,3,12.8,2.6);}
    icShape(c,icRR(-9,-10,18,5,2),icT('#8a9098'),[-9,-10,9,-5],true);}},
  compass:{col:'#e0b050',f(c,a){
    icShape(c,icRR(-2.6,-24,5.2,6,2),icT('#d8a848'),[-3,-24,3,-18],true);
    icShape(c,icEl(0,2,19,19),icT('#d8a848'),[-19,-17,19,21]);
    const fg=c.createRadialGradient(-4,-2,2,0,2,15);fg.addColorStop(0,'#3a4a6a');fg.addColorStop(1,'#141a2a');
    c.fillStyle=fg;c.beginPath();c.arc(0,2,14.4,0,TAU);c.fill();c.strokeStyle='rgba(0,0,0,.6)';c.lineWidth=1.2;c.stroke();
    c.strokeStyle='#e8d098';c.lineWidth=1.3;for(let k=0;k<8;k++){const an=k*Math.PI/4,r1=k%2?11.6:10;c.beginPath();c.moveTo(Math.cos(an)*r1,2+Math.sin(an)*r1);c.lineTo(Math.cos(an)*13.4,2+Math.sin(an)*13.4);c.stroke();}
    c.save();c.translate(0,2);c.rotate(0.55);
    icShape(c,icPoly([[-3,0],[3,0],[0,-12]]),icT('#e8483a'),[-3,-12,3,0],true);
    icShape(c,icPoly([[-3,0],[3,0],[0,12]]),icT('#e8eef4'),[-3,0,3,12],true);c.restore();
    icDot(c,0,2,1.9,'#e0b84e');
    c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=1.6;c.lineCap='round';c.beginPath();c.arc(0,2,11,Math.PI*1.08,Math.PI*1.42);c.stroke();}},
  beacon:{col:'#ffd060',f(c,a){
    const ac=a||'#ffd060';
    for(const s of [-1,1])for(const r of [11,16]){c.strokeStyle=hexA(ac,r>12?0.35:0.65);c.lineWidth=1.9;c.lineCap='round';c.beginPath();c.arc(0,-11,r,s>0?-0.7:Math.PI-0.7+0.0,s>0?0.7:Math.PI+0.7);c.stroke();}
    icShape(c,icPoly([[-10,22],[10,22],[6,13],[-6,13]]),icT('#7a7068'),[-10,13,10,22]);
    icRod(c,-5,14,-1.4,-4,3,icT('#8a9098'));icRod(c,5,14,1.4,-4,3,icT('#8a9098'));icRod(c,0,13,0,-5,2.6,icT('#a8b0b8'));
    icGlow(c,0,-11,22,ac,0.9);
    icShape(c,icEl(0,-11,6.4,6.4),icT(ac),[-6,-17,6,-5]);icDot(c,-2,-13.4,1.9,'rgba(255,255,255,.85)');}},
  scroll:{col:'#f0d8a0',f(c,a){c.rotate(-0.16);
    icShape(c,icRR(-12,-13,24,27,2),icT('#f0e0b0'),[-12,-13,12,14]);
    c.strokeStyle='rgba(100,70,30,.6)';c.lineWidth=1.3;c.lineCap='round';for(let k=0;k<4;k++){c.beginPath();c.moveTo(-8,-6+k*4.6);c.lineTo(k===3?0:8,-6+k*4.6);c.stroke();}
    for(const y of [-14,10]){icShape(c,icRR(-16,y-3.4,32,7.4,3.7),icT('#d8b070'),[-16,y-4,16,y+4],false);icShape(c,icEl(-16,y+0.3,2.6,3.9),icT('#e8c888'),[-18,y-4,-13,y+4],true);icShape(c,icEl(16,y+0.3,2.6,3.9),icT('#e8c888'),[13,y-4,18,y+4],true);}
    icShape(c,icPoly([[3,10],[0,21],[4,18],[7,21],[8,10]]),icT('#c84a4a'),[0,10,8,21],true);
    icShape(c,icEl(5,8,5,5),icT('#d83a3a'),[0,3,10,13],true);c.strokeStyle='rgba(255,200,200,.7)';c.lineWidth=1;c.beginPath();c.arc(5,8,2.4,0,TAU);c.stroke();}},
  totem:{col:'#b8b0a0',f(c,a){
    const ac=a||'#ffc040';
    icShape(c,icRR(-11,14,22,8,2),icT('#7a7468'),[-11,14,11,22]);
    icShape(c,icRR(-8,-6,16,22,2),icT('#9a9486'),[-8,-6,8,16]);
    icShape(c,icRR(-12,-22,24,17,3),icT('#aaa496'),[-12,-22,12,-5]);
    icShape(c,icPoly([[-16,-15],[-12,-18],[-12,-8],[-16,-5]]),icT('#8a8478'),[-16,-18,-12,-5],true);
    icShape(c,icPoly([[16,-15],[12,-18],[12,-8],[16,-5]]),icT('#8a8478'),[12,-18,16,-5],true);
    icGlow(c,-5,-14,9,ac,0.9);icGlow(c,5,-14,9,ac,0.9);
    c.fillStyle='#fff0b0';c.fillRect(-7,-16,4.4,3.8);c.fillRect(2.6,-16,4.4,3.8);
    c.fillStyle='#2a2014';c.fillRect(-5,-8.6,10,2.2);c.fillRect(-3,-6.4,1.4,1.6);c.fillRect(1.6,-6.4,1.4,1.6);
    c.strokeStyle=hexA(ac,0.9);c.lineWidth=1.4;c.lineCap='round';c.beginPath();c.moveTo(0,-1);c.lineTo(0,8);c.moveTo(-4,3);c.lineTo(4,3);c.moveTo(-3,10);c.lineTo(3,10);c.stroke();}},
  bomb:{col:'#ff6a3a',f(c,a){icBomb(c,'#3a3a44',a||'#ffb040',false);}},
  sbomb:{col:'#b080f0',f(c,a){icBomb(c,'#6a48b0','#d8b0ff',true);}},
  icegren:{col:'#7fd8ff',f(c,a){
    icShape(c,icRR(-11,-9,22,28,7),icT('#78c8f0'),[-11,-9,11,19]);
    c.save();icRR(-11,-9,22,28,7)(c);c.clip();
    c.strokeStyle='rgba(235,250,255,.85)';c.lineWidth=1.4;c.lineCap='round';
    for(let k=0;k<3;k++){const an=k*Math.PI/3;c.beginPath();c.moveTo(Math.cos(an)*7,5+Math.sin(an)*7);c.lineTo(-Math.cos(an)*7,5-Math.sin(an)*7);c.stroke();}
    icPoly([[-11,-9],[-3,-9],[-7,-1]])(c);c.fillStyle='rgba(255,255,255,.4)';c.fill();
    c.restore();
    icShape(c,icRR(-6,-15,12,7,2),icT('#8a9098'),[-6,-15,6,-8],true);
    c.strokeStyle=IC_OL;c.lineWidth=3.2;c.beginPath();c.arc(8,-17,4,0,TAU);c.stroke();c.strokeStyle='#d8dce4';c.lineWidth=1.5;c.beginPath();c.arc(8,-17,4,0,TAU);c.stroke();
    icStar(c,-15,-5,4,'#e8faff');icStar(c,16,12,3.4,'#e8faff');}},
  robot:{col:'#7ff0ff',f(c,a){
    const ac=a||'#7ff0ff';
    icRod(c,0,-17,0,-23,1.8,icT('#9aa4ac'));icGlow(c,0,-23,10,ac,0.8);icDot(c,0,-23,2.6,ac);
    icShape(c,icRR(-10,3,20,13,4),icT('#d8a848'),[-10,3,10,16]);
    icShape(c,icEl(-13,8,3.4,3.4),icT('#8a9098'),[-16,5,-10,11],true);icShape(c,icEl(13,8,3.4,3.4),icT('#8a9098'),[10,5,16,11],true);
    icDot(c,0,9.5,2,ac);
    icShape(c,icRR(-13,-17,26,21,5),icT('#aab4c0'),[-13,-17,13,4]);
    icShape(c,icRR(-9.6,-13,19.2,11,3.5),icT('#1a2030'),[-10,-13,10,-2],true);
    icGlow(c,-4.2,-7.6,8,ac,0.9);icGlow(c,4.2,-7.6,8,ac,0.9);
    c.fillStyle='#e8ffff';c.beginPath();c.arc(-4.2,-7.6,2.4,0,TAU);c.arc(4.2,-7.6,2.4,0,TAU);c.fill();
    icShape(c,icEl(-7,20,3.2,3.2),icT('#3a3438'),[-10,17,-4,23],true);icShape(c,icEl(7,20,3.2,3.2),icT('#3a3438'),[4,17,10,23],true);
    icRivet(c,-10,-14,1);icRivet(c,10,-14,1);}},
  eth:{col:'#8ab0ff',f(c,a){
    const ac=a||'#9ab8ff';
    icGlow(c,0,-9,24,ac,0.7);
    icShape(c,icPoly([[-2.4,8],[2.4,8],[3,18],[-3,18]]),icT('#d8a848'),[-3,8,3,18],true);
    icShape(c,icEl(0,19.6,10,3.2),icT('#c89a40'),[-10,16,10,23]);
    icShape(c,(g)=>{g.beginPath();g.moveTo(-14,-8);g.lineTo(14,-8);g.bezierCurveTo(14,4,6,8,2.6,9);g.lineTo(-2.6,9);g.bezierCurveTo(-6,8,-14,4,-14,-8);g.closePath();},icT('#e8c060'),[-14,-8,14,9]);
    c.save();c.beginPath();c.ellipse(0,-8,14,4,0,0,TAU);c.fillStyle='#1c2448';c.fill();c.restore();
    const lg=c.createRadialGradient(0,-8,1,0,-8,13);lg.addColorStop(0,'#ffffff');lg.addColorStop(0.5,ac);lg.addColorStop(1,shadeHex(ac,-0.3));
    c.fillStyle=lg;c.beginPath();c.ellipse(0,-8,11.6,3,0,0,TAU);c.fill();
    c.strokeStyle=IC_OL;c.lineWidth=1.3;c.beginPath();c.ellipse(0,-8,14,4,0,0,TAU);c.stroke();
    icStar(c,-6,-17,4,'#ffffff');icStar(c,6,-21,3.4,'#e0ecff');icStar(c,1,-14,2.6,'#ffffff');}},
  truth:{col:'#b890ff',f(c,a){
    const ac=a||'#b890ff';
    c.strokeStyle=hexA(ac,0.8);c.lineWidth=1.8;c.lineCap='round';
    for(let k=-3;k<=3;k++){const an=-Math.PI/2+k*0.34;c.beginPath();c.moveTo(Math.cos(an)*14,Math.sin(an)*10-4);c.lineTo(Math.cos(an)*20,Math.sin(an)*17-4);c.stroke();}
    const eye=(g)=>{g.beginPath();g.moveTo(-21,0);g.quadraticCurveTo(0,-22,21,0);g.quadraticCurveTo(0,22,-21,0);g.closePath();};
    icShape(c,eye,icT('#f0e8ff'),[-21,-12,21,12]);
    c.save();eye(c);c.clip();
    const ig=c.createRadialGradient(-2,-2,1,0,0,10);ig.addColorStop(0,shadeHex(ac,0.5));ig.addColorStop(0.6,ac);ig.addColorStop(1,shadeHex(ac,-0.5));
    c.fillStyle=ig;c.beginPath();c.arc(0,0,9.6,0,TAU);c.fill();c.strokeStyle=hexA('#1a0a30',0.8);c.lineWidth=1.2;c.stroke();
    c.fillStyle='#14081e';c.beginPath();c.ellipse(0,0,3,7,0,0,TAU);c.fill();
    c.fillStyle='rgba(255,255,255,.9)';c.beginPath();c.arc(-3.6,-3.8,2,0,TAU);c.fill();
    c.restore();
    c.strokeStyle=IC_OL;c.lineWidth=1.6;eye(c);c.stroke();}},
  dream:{col:'#c8a8ff',f(c,a){
    const ac=a||'#e8d098';c.rotate(-0.28);c.translate(-3,1);
    icGlow(c,-2,0,24,'#c8a8ff',0.6);
    icShape(c,(g)=>{g.beginPath();g.arc(0,0,16,0.9,-0.9,false);g.arc(7.4,0,12.6,-1.36,1.36,true);g.closePath();},icT(ac),[-16,-16,12,16]);
    icStar(c,13,-14,4,'#fff6d8');icStar(c,17,3,2.8,'#fff6d8');
    c.rotate(0.28);
    for(const [zx,zy,zs] of [[11,-13,4.6],[17,-4,3.2]]){c.strokeStyle=IC_OL;c.lineWidth=3.2;c.lineJoin='round';c.lineCap='round';c.beginPath();c.moveTo(zx-zs,zy-zs);c.lineTo(zx+zs,zy-zs);c.lineTo(zx-zs,zy+zs);c.lineTo(zx+zs,zy+zs);c.stroke();
      c.strokeStyle='#f0e0ff';c.lineWidth=1.6;c.stroke();}}},
  tuner:{col:'#d8c8ff',f(c,a){
    const ac=a||'#d8c8ff';
    for(const s of [-1,1])for(const r of [9,14]){c.strokeStyle=hexA(ac,r>10?0.35:0.7);c.lineWidth=1.8;c.lineCap='round';c.beginPath();c.arc(0,-10,r+4,s>0?-0.75:Math.PI-0.75+0.0,s>0?0.75:Math.PI+0.75);c.stroke();}
    icRod(c,0,6,0,21,5.4,icT('#d8a848'));
    icTube(c,(g)=>{g.beginPath();g.moveTo(-6,-19);g.lineTo(-6,0);g.quadraticCurveTo(-6,9,0,9);g.quadraticCurveTo(6,9,6,0);g.lineTo(6,-19);},4.6,icT('#c8d0dc'));
    c.fillStyle='rgba(255,255,255,.5)';c.fillRect(-7.4,-19,1.4,10);}},
  still:{col:'#e08850',f(c,a){c.translate(1,-1);c.scale(1.05,1.05);
    const ac=a||'#d6823c';
    icFlame(c,-4,23,0.8,'#ff8a2a','#fff0a0',0);icFlame(c,5,23,0.6,'#ff6a2a','#ffe080',0);
    icTube(c,(g)=>{g.beginPath();g.moveTo(1,-14);g.quadraticCurveTo(14,-20,15,-6);g.lineTo(15,5);},3.4,icT('#c87a40'));
    icShape(c,icRR(10.6,4,8.8,12,2.6),icT('#d8e8ff'),[10,4,20,16],true);
    c.fillStyle='rgba(176,120,255,.85)';c.fillRect(11.4,9,7.2,6.4);c.fillStyle='rgba(255,255,255,.5)';c.fillRect(12,9.4,1.4,5);
    icShape(c,icEl(-4,-9,6.6,8),icT('#d8924c'),[-10,-17,2,-1]);
    icShape(c,icEl(-4,7,12.6,11.2),icT(ac),[-16,-4,8,18]);
    c.save();icEl(-4,7,12.6,11.2)(c);c.clip();
    c.fillStyle='rgba(60,24,0,.5)';c.fillRect(-17,5,26,2.2);c.fillStyle='rgba(255,230,170,.3)';c.fillRect(-17,7.2,26,1);
    c.restore();
    icRivet(c,-12,7,1);icRivet(c,4,7,1);
    icShape(c,icRR(-9,-3.4,10,3.4,1.4),icT('#e8a860'),[-9,-3,1,0],true);}},
  /* Лиловые небеса: значки «Лавки» и общие — сон и звон берутся из sbomb/tuner */
};

/* ---------- снаряжение: кирки, клинки, латы, стволы ---------- */
function icSword(c,sl){
  if(sl<=1){/* Кулак */
    const T=icT('#e0a878');
    icShape(c,icRR(-12,-4,24,19,7),T,[-12,-4,12,15]);
    for(let k=0;k<4;k++)icShape(c,icEl(-8.4+k*5.6,-5.5,3.5,4.2),T,[-12,-10,12,0],true);
    icShape(c,icEl(-12,6,4,6.4,0.35),icT('#d49868'),[-16,0,-8,12],true);
    c.strokeStyle='rgba(90,40,10,.5)';c.lineWidth=1;c.beginPath();c.moveTo(-5.6,-2);c.lineTo(-5.6,5);c.moveTo(0,-2);c.lineTo(0,5);c.moveTo(5.6,-2);c.lineTo(5.6,5);c.stroke();
    icShape(c,icRR(-12,13,24,7,2),icT('#8a8f98'),[-12,13,12,20],true);return;}
  c.rotate(0.72);c.translate(0,10);
  const SC=['#e8eef7','#e8eef7','#e8eef7','#e8eef7','#9ff0ff','#b48aff','#c8b8a8','#e0303a','#f0e8d0','#ffb030'][clamp(sl-1,0,9)];
  const L=(22+Math.min(8,Math.max(0,sl-4)*1.4))*1.35,S=1.35;
  if(sl>=5)icGlow(c,0,-L*0.5,L*0.75,SC,0.6);
  icRod(c,0,-1,0,8*S,3.8,icT('#6a4420'));
  icDot(c,0,10.6*S,2.4,'#caa24a');
  const trim=sl>=6?ARMOR_LOOK[Math.min(10,sl)].trim||'#ffd98a':'#ffd98a';
  icShape(c,icPoly([[-8.4,-1.4],[-4,-5.2],[4,-5.2],[8.4,-1.4],[8.4,1.2],[-8.4,1.2]]),icT(trim),[-8,-5,8,1],true);
  icShape(c,icPoly([[-3,-3],[3,-3],[2.2,-L],[0,-L-6],[-2.2,-L]]),[shadeHex(SC,0.35),SC,shadeHex(SC,-0.38)],[-3,-L,3,-3]);
  c.fillStyle='rgba(255,255,255,.65)';c.fillRect(-0.7,-L+2,1.4,L-6);
}
function icPick(c,lv){
  c.translate(3,8);c.rotate(-0.72);c.scale(1.4,1.4);c.translate(0,-6);
  c.filter='drop-shadow(0 0 1px #150d12) drop-shadow(1px 2px 1.5px rgba(0,0,0,.6))';
  drawPickModel(c,lv,0.4);c.filter='none';
}
function icArmor(c,lv){
  c.translate(24-24,23);c.scale(0.92,0.92);
  drawPlayerSprite(c,0,0,'idle',0.5,1,{tool:null,armor:lv,pickLvl:player.pickLvl,torch:0,groundY:0});
}
function icGun(c,id){
  const L=(GUN_LOOK[id]&&GUN_LOOK[id].len)||27,s=Math.min(2.4,37/L);
  c.translate(-L*s/2-2,-3);c.scale(s,s);
  c.filter='drop-shadow(0 0 0.8px #150d12) drop-shadow(0.8px 1.6px 1.2px rgba(0,0,0,.6))';
  drawGunModel(c,id,0);c.filter='none';
}
function icColorOf(name,arg){
  if(name==='pick'){const ac=['','','','','#b890ff','#8ff0ff','#8a5aff','#ff7a2a','#ff3a4a','#7ad8ff','#ffb030','#bfe6ff','#ffc040','#8aa0ff','#ff6a9a','#ffd8a0'][+arg|0];return ac||'#c4ccd4';}
  if(name==='sword'){return ['#e8eef7','#e8eef7','#e8eef7','#e8eef7','#9ff0ff','#b48aff','#ffb070','#ff3a4a','#9ad8ff','#ffd060','#c8e8ff','#ffc040','#8aa0ff','#ff6a9a','#ffd8a0'][clamp((+arg|0)-1,0,14)]||'#e8eef7';}
  if(name==='armor'){const A=ARMOR_LOOK[clamp(+arg|0,1,ARMOR_LOOK.length-1)];if(A&&A.glow){const gl=A.glow.split(',');return '#'+((1<<24)|(+gl[0]<<16)|(+gl[1]<<8)|(+gl[2])).toString(16).slice(1);}return '#6fa8e0';}
  if(name==='gun'){return (GUN_BY_ID[arg]&&GUN_BY_ID[arg].color)||(GUN_LOOK[arg]&&GUN_LOOK[arg].acc)||'#ffe9a8';}
  return '#c8a060';
}

/* ---------- главная функция ---------- */
function icRender(c,key,acc,dim){
  const p=key.split(':'),name=p[0],arg=p[1];
  let col,fn;
  if(name==='pick'){col=icColorOf(name,arg);fn=(g)=>icPick(g,+arg|0||1);}
  else if(name==='sword'){col=icColorOf(name,arg);fn=(g)=>{if((+arg|0)>=11){g.translate(-3,17);g.rotate(0.62);g.scale(1.3,1.3);g.filter='drop-shadow(0 0 1px #150d12) drop-shadow(1px 2px 1.5px rgba(0,0,0,.6))';lgSwordModel(g,+arg|0,30,0.4);g.filter='none';}else icSword(g,+arg|0||1);};}
  else if(name==='armor'){col=icColorOf(name,arg);fn=(g)=>icArmor(g,+arg|0||1);}
  else if(name==='gun'){col=icColorOf(name,arg);fn=(g)=>icGun(g,arg);}
  else if(IC[name]){col=acc||IC[name].col;fn=(g)=>IC[name].f(g,acc);}
  else{col='#c8a060';fn=(g)=>{g.fillStyle='#e8dcc0';g.font='bold 22px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText(String(arg||name).slice(0,2),0,0);};}
  if(name==='barr'||name==='barrpack')col=acc||'#a8743e';
  icPlate(c,col,IC_BASE[dim]||IC_BASE[0]);
  c.save();c.beginPath();c.rect(1,1,46,46);c.clip();
  c.translate(24,24);
  fn(c);
  c.restore();
}
function uiIcon(key,acc){
  const dim=(typeof G!=='undefined'&&G&&G.dim)|0,ck=dim+'|'+key+'|'+(acc||'');
  let u=UIC_CACHE[ck];if(u!==undefined)return u;
  u='';
  try{
    const cv=document.createElement('canvas');cv.width=cv.height=96;const c=cv.getContext('2d');
    c.scale(2,2);icRender(c,key,acc,dim);u=cv.toDataURL('image/png');
  }catch(e){u='';}
  UIC_CACHE[ck]=u;return u;
}
function uiIconHtml(key,acc){return `<img class="uiic" alt="" draggable="false" src="${uiIcon(key,acc)}">`;}

/* ---------- соответствие строк кузниц значкам ---------- */
const UI_UPG_KEY={dig:'speed',drill:'drill',barr:'barr',slots:'slots',stack:'stack',torch:'torch',furn:'furn',eth:'eth',truth:'truth',dream:'dream',still:'still'};
/* акцент по измерению: h — Ад, l — Лиловые небеса */
const UI_UPG_ACC={h:{dig:'#ff9a3a',drill:'#d84a2a',torch:'#ff5a2a',furn:'#ff7a2a'},l:{dig:'#d0a0ff',drill:'#b070f0',torch:'#e0a8ff',still:'#c890ff'}};
function uiUpgIcon(id,tier,lv){
  let acc=(UI_UPG_ACC[tier]||{})[id];
  if(id==='barr')acc=BARR[clamp((lv|0)-1,0,BARR.length-1)].col;
  return uiIconHtml(UI_UPG_KEY[id]||id,acc);
}
const UI_CONS_KEY={beacons:'beacon',scrolls:'scroll',totems:'totem',hbombs:'bomb',icegren:'icegren',lsbomb:'sbomb',ltuner:'tuner'};
function uiConsIcon(id){return uiIconHtml(UI_CONS_KEY[id]||id);}
const UI_SUP_KEY={lad:'ladder',med:'potion',gra:'hookammo',amm:'gunammo',dri:'drills',bar:'barrpack',ice:'icepot'};
function uiSupIcon(id){return uiIconHtml(UI_SUP_KEY[id]||id,id==='bar'?BARR[clamp((player.barricadeLvl|0)-1,0,BARR.length-1)].col:undefined);}
