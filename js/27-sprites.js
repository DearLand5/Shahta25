'use strict';
/* ============================================================
   SPRITES
   ============================================================ */
/* ---------- модель игрока: поза, броня (6 видов), кирка (6 видов), оружие ---------- */
function plLimb(g,x,y,a1,l1,k,l2,w,col,endCol){
  const x1=x+Math.sin(a1)*l1,y1=y+Math.cos(a1)*l1;
  const a2=a1-k;
  const x2=x1+Math.sin(a2)*l2,y2=y1+Math.cos(a2)*l2;
  g.lineCap='round';g.lineJoin='round';
  g.strokeStyle=col;g.lineWidth=w;
  g.beginPath();g.moveTo(x,y);g.lineTo(x1,y1);g.lineTo(x2,y2);g.stroke();
  if(endCol){g.fillStyle=endCol;g.beginPath();g.arc(x2,y2,w*0.62,0,TAU);g.fill();}
  return [x2,y2];
}
const ARMOR_LOOK=[
  null,
  {body:'#b8a070',trim:'#8a7448',leg:'#3a3a4a',boot:'#4a3a2a',arm:'#b8a070'},
  {body:'#8a5a30',trim:'#5a3a20',leg:'#4a3624',boot:'#3a2616',arm:'#7a4e2a'},
  {body:'#98a0aa',trim:'#6a727c',leg:'#5a626c',boot:'#3a4048',arm:'#8a929c'},
  {body:'#c4ccd8',trim:'#8a94a4',leg:'#98a2b0',boot:'#6a7482',arm:'#b4bcc8'},
  {body:'#79dcf5',trim:'#e8fbff',leg:'#3a8aa8',boot:'#2a6a88',arm:'#6ccbe8'},
  {body:'#2a1f4a',trim:'#b080ff',leg:'#1c1436',boot:'#120c28',arm:'#241a40'},
  {body:'#5a5048',trim:'#ff8a3a',leg:'#3a322c',boot:'#2a2420',arm:'#4e4640',glow:'255,140,60'},
  {body:'#7a1420',trim:'#ff5a6a',leg:'#4a0a12',boot:'#2a060a',arm:'#6a1018',glow:'255,60,80'},
  {body:'#d8d0bc',trim:'#5ab8ff',leg:'#8a8270',boot:'#5a5448',arm:'#c8c0ac',glow:'110,190,255'},
  {body:'#2a0a04',trim:'#ffb030',leg:'#1a0602',boot:'#100402',arm:'#3a0e06',glow:'255,170,40'}
];
function drawPickModel(g,lv,t){
  if(lv>=11){lgPickModel(g,lv,t);return;}
  /* ручка */
  g.fillStyle='#8a5a2a';g.fillRect(-1.6,-2,3.2,21);
  g.fillStyle='#6a4018';g.fillRect(-1.6,10,3.2,2);
  const heads={
    1:['#9a8f80','#6f665a'],2:['#c4ccd4','#8a949c'],3:['#e2e8f2','#9eb0d0'],
    4:['#b890ff','#6a3ac8'],5:['#8ff0ff','#3aa8cc'],6:['#241a3a','#6a2ac8'],
    7:['#6a605a','#ff7a2a'],8:['#c0142a','#5a0010'],9:['#f0e8d0','#5ab8ff'],10:['#ffb030','#ff3a00']
  }[lv]||['#9a8f80','#6f665a'];
  const sz=1+(lv-1)*0.06;
  g.save();g.scale(sz,sz);
  if(lv===7){/* базальтовая мотыга: широкое лезвие + шип, тлеющие трещины */
    g.fillStyle='#4a423e';g.beginPath();g.moveTo(-12,1);g.lineTo(-11,-6);g.lineTo(-3,-8);g.lineTo(3,-7);g.lineTo(11,-3);g.lineTo(13,1);g.lineTo(4,-3);g.lineTo(-4,-3.4);g.closePath();g.fill();
    g.fillStyle='#2a2422';g.fillRect(-2.6,-9,5.2,7);
    g.strokeStyle='rgba(255,'+(110+Math.floor(50*Math.sin(t*4)))+',40,.95)';g.lineWidth=1;g.beginPath();g.moveTo(-10,-3);g.lineTo(-6,-5);g.lineTo(-2,-4);g.moveTo(4,-5);g.lineTo(9,-3);g.stroke();
  }else if(lv===8){/* кровавая коса-кирка */
    g.fillStyle='#8a0a18';g.beginPath();g.moveTo(-3,-6);g.quadraticCurveTo(-14,-10,-16,2);g.quadraticCurveTo(-11,-4,-3,-2);g.closePath();g.fill();
    g.fillStyle='#c0142a';g.beginPath();g.moveTo(3,-6);g.lineTo(13,-3);g.lineTo(3,-2);g.closePath();g.fill();
    g.fillStyle='#2a0006';g.beginPath();g.arc(0,-4,3.4,0,TAU);g.fill();g.fillStyle='#ff4a5a';g.beginPath();g.arc(0,-4,1.4,0,TAU);g.fill();
    const dp=(t*1.2)%1;g.fillStyle='rgba(200,10,30,'+(1-dp)+')';g.beginPath();g.arc(-15,2+dp*8,1,0,TAU);g.fill();
  }else if(lv===9){/* костяная кирка с черепом */
    g.fillStyle='#e8dcc0';g.beginPath();g.moveTo(-13,0);g.quadraticCurveTo(-8,-7,-3,-5);g.lineTo(-3,-2);g.quadraticCurveTo(-8,-3,-13,0);g.fill();
    g.beginPath();g.moveTo(13,0);g.quadraticCurveTo(8,-7,3,-5);g.lineTo(3,-2);g.quadraticCurveTo(8,-3,13,0);g.fill();
    g.fillStyle='#f0e8d0';g.beginPath();g.arc(0,-5,4.4,0,TAU);g.fill();g.fillRect(-2.6,-2,5.2,2.4);
    g.fillStyle='#0a1020';g.fillRect(-2.6,-6,1.8,1.8);g.fillRect(0.8,-6,1.8,1.8);
    olLight(g,(g)=>{g.fillStyle='rgba(110,190,255,.9)';g.fillRect(-2.2,-5.6,1,1);g.fillRect(1.2,-5.6,1,1);});
  }else if(lv===10){/* расплавленная кирка ядра с пламенем */
    g.fillStyle='#3a0e06';g.beginPath();g.moveTo(-12,0);g.quadraticCurveTo(0,-11,12,0);g.lineTo(8,-4);g.quadraticCurveTo(0,-13,-8,-4);g.closePath();g.fill();
    const gr=g.createLinearGradient(-12,0,12,0);gr.addColorStop(0,'#ffb030');gr.addColorStop(0.5,'#fff0a0');gr.addColorStop(1,'#ff3a00');
    g.fillStyle=gr;g.beginPath();g.moveTo(-11,-0.6);g.quadraticCurveTo(0,-9,11,-0.6);g.lineTo(9,-2);g.quadraticCurveTo(0,-9.6,-9,-2);g.closePath();g.fill();
    olLight(g,(g)=>{for(let k=0;k<4;k++){const fx=-6+k*4,fh=4+Math.sin(t*14+k*1.7)*2;g.fillStyle=k%2?'rgba(255,220,120,.85)':'rgba(255,90,20,.85)';g.beginPath();g.moveTo(fx-1.6,-8);g.quadraticCurveTo(fx,-8-fh*1.8,fx+1.6,-8);g.fill();}});
  }else{
  g.fillStyle=heads[0];
  g.beginPath();g.moveTo(-10,-1);g.quadraticCurveTo(0,-9,10,-1);g.lineTo(7,-5);g.quadraticCurveTo(0,-11,-7,-5);g.closePath();g.fill();
  g.fillStyle=heads[1];
  g.beginPath();g.moveTo(-10,-1);g.lineTo(-7,-5);g.lineTo(-3,-2.5);g.closePath();g.fill();
  g.beginPath();g.moveTo(10,-1);g.lineTo(7,-5);g.lineTo(3,-2.5);g.closePath();g.fill();
  }
  g.fillStyle='rgba(255,255,255,.55)';g.fillRect(-4,-6.4,6,1.2);
  g.restore();
  if(lv>=4){
    olLight(g,(g)=>{
    const gl=g.createRadialGradient(0,-5,1,0,-5,18);
    const gc=lv===4?'180,120,255':lv===5?'120,240,255':lv===6?'160,80,255':lv===7?'255,140,60':lv===8?'255,60,80':lv===9?'110,190,255':'255,170,40';
    gl.addColorStop(0,'rgba('+gc+','+(0.35+0.15*Math.sin(t*5))+')');gl.addColorStop(1,'rgba('+gc+',0)');
    g.fillStyle=gl;g.beginPath();g.arc(0,-5,18,0,TAU);g.fill();
    if(lv>=5){g.fillStyle='rgba('+gc+',.8)';for(let k=0;k<3;k++){const a=t*3+k*2.1;g.fillRect(Math.cos(a)*12-1,-5+Math.sin(a)*6-1,2,2);}}
    });
  }
}
const GUN_LOOK={
  pistol:{len:12,col:'#3a3f48',acc:'#8a8f98'},
  shotgun:{len:20,col:'#5a3a22',acc:'#2a2d34'},
  rifle:{len:22,col:'#2f353d',acc:'#6a717c'},
  plasma:{len:18,col:'#3a2a6a',acc:'#7fe8ff'},
  rail:{len:26,col:'#3a2a48',acc:'#ff9aff'},
  void:{len:20,col:'#1c1436',acc:'#b080ff'},
  hellfire:{len:24,col:'#3a0e06',acc:'#ffb030'},
  bloodshot:{len:22,col:'#4a0a10',acc:'#ff4a5a'},
  acidcan:{len:26,col:'#2a3a10',acc:'#9aff40'},
  soulrail:{len:30,col:'#1a2a3a',acc:'#7ad8ff'},
  infernus:{len:24,col:'#2a0a00',acc:'#ffb030'}
};
function drawGunModel(g,id,recoil){
  const L=GUN_LOOK[id]||GUN_LOOK.pistol,T=G.time||0;
  g.translate(-recoil*3.4,0);g.rotate(-recoil*0.12);
  const box=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h);};
  const hl=(x,y,w)=>{g.fillStyle='rgba(255,255,255,.22)';g.fillRect(x,y,w,0.9);};
  const glowDot=(x,y,r,c,a)=>{olLight(g,(g)=>{const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,hexA(c,a));gr.addColorStop(1,hexA(c,0));g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();});};
  const grip=(x,c)=>{g.fillStyle=c||'#2a2420';g.beginPath();g.moveTo(x,1.6);g.lineTo(x+4,1.6);g.lineTo(x+2.6,8.4);g.lineTo(x-1.2,8.4);g.closePath();g.fill();g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x-0.6,4,4,0.8);g.fillRect(x-0.8,6,4,0.8);};
  let muzzle=L.len,flash='#ffe08a';
  if(LG_GUNLEN[id]){lgGunModel(g,id,T);return;}
  switch(id){
    case 'pistol':
      box(0,-2.4,12,4,'#3a3f48');hl(0,-2.4,12);box(1,-3.2,9,1,'#5a606a');grip(1.2,'#4a3a2a');box(4,1.6,3,2,'#2a2d34');box(11,-1.4,2.4,2,'#1a1c20');muzzle=13.4;break;
    case 'shotgun':
      box(-7,-1.8,8,3.6,'#7a5230');box(1,-2.6,18,2.4,'#2a2d34');box(1,-0.2,18,2.2,'#3a3d44');hl(1,-2.6,18);
      box(8,1.8,7,2.4,'#7a5230');for(let k=0;k<3;k++)box(9+k*2,2,0.8,2,'#5a3a20');grip(1.5,'#5a3a22');box(18,-2.8,1.4,5,'#1a1c20');muzzle=20;flash='#ffcc66';break;
    case 'rifle':
      box(-6,-1.6,7,3.4,'#2f353d');box(1,-2.4,20,4,'#2f353d');hl(1,-2.4,20);box(21,-1,6,2,'#1a1c20');
      box(5,-5.4,9,2.4,'#6a717c');g.fillStyle='#9ad8ff';g.fillRect(12.4,-5,1.4,1.6);box(9,1.6,3,6.6,'#4a5058');grip(3,'#3a3020');box(15,1.6,4,1.4,'#4a5058');muzzle=27;break;
    case 'plasma':{
      box(0,-3,16,6,'#3a2a6a');hl(0,-3,16);box(16,-1.8,4,3.6,'#2a1e4a');grip(2,'#241a40');
      const p=0.6+0.4*Math.sin(T*8);g.fillStyle='rgba(127,232,255,'+p+')';g.fillRect(3,-1,9,2);for(let k=0;k<3;k++){g.fillStyle='#7fe8ff';g.fillRect(4+k*3,-3.8,1.4,1);}
      glowDot(19,0,7,'#7fe8ff',0.6);muzzle=20;flash='#9ff4ff';break;}
    case 'rail':{
      box(0,-2,8,4,'#3a2a48');box(4,-4.6,20,1.6,'#ff9aff');box(4,3,20,1.6,'#ff9aff');box(6,-2.6,18,5.2,'#2a1e34');hl(6,-2.6,18);
      for(let k=0;k<4;k++){const a=0.4+0.6*((Math.sin(T*10-k)+1)/2);g.fillStyle='rgba(255,154,255,'+a+')';g.fillRect(9+k*4,-1,2,2);}
      grip(1.5,'#241a30');glowDot(25,0,6,'#ff9aff',0.5);muzzle=26;flash='#ffb8ff';break;}
    case 'void':{
      box(0,-2.6,10,5.2,'#1c1436');grip(1.5,'#140e28');
      g.fillStyle='#2a1e4a';g.beginPath();g.moveTo(10,-4);g.lineTo(18,-6);g.lineTo(18,6);g.lineTo(10,4);g.closePath();g.fill();
      const p=0.5+0.5*Math.sin(T*6);g.save();g.translate(19,0);g.rotate(T*3);g.strokeStyle='rgba(176,128,255,'+(0.6+0.4*p)+')';g.lineWidth=1.2;g.beginPath();g.arc(0,0,3.4,0,Math.PI*1.4);g.stroke();g.restore();
      g.fillStyle='#000';g.beginPath();g.arc(19,0,2,0,TAU);g.fill();glowDot(19,0,8,'#b080ff',0.5);muzzle=21;flash='#c8a0ff';break;}
    case 'hellfire':{
      /* огнемёт: бак, сопло, запальник */
      g.fillStyle='#5a1a0a';g.beginPath();g.ellipse(4,4,4.4,3.2,0,0,TAU);g.fill();g.fillStyle='#ffb030';g.fillRect(1,3.4,6,1);
      box(0,-2.4,18,4.4,'#3a0e06');hl(0,-2.4,18);box(18,-3.4,6,6.8,'#2a0a04');box(18,-3.4,6,1.2,'#8a3a10');
      for(let k=0;k<3;k++)box(6+k*3.6,-3.4,1.6,1,'#ffb030');grip(9,'#2a1208');
      const fl=2.4+Math.sin(T*22)*0.8;olLight(g,(g)=>{g.fillStyle='rgba(120,200,255,.8)';g.beginPath();g.ellipse(25,2.6,1.4,fl*0.6,0,0,TAU);g.fill();});
      muzzle=24;flash='#ff8a30';break;}
    case 'bloodshot':{
      /* двуствольный кровавый обрез с костяным прикладом */
      g.fillStyle='#d8ccb0';g.beginPath();g.moveTo(-8,-1);g.lineTo(1,-2.4);g.lineTo(1,2.4);g.lineTo(-7,3.6);g.closePath();g.fill();
      box(1,-3,19,2.6,'#4a0a10');box(1,-0.2,19,2.6,'#3a060c');hl(1,-3,19);box(4,-3.8,10,0.9,'#ff4a5a');
      g.fillStyle='#a0101e';g.beginPath();g.arc(9,2.8,2.2,0,TAU);g.fill();g.fillStyle='rgba(255,140,150,.6)';g.fillRect(8.2,2,1,1);
      grip(2,'#2a0606');g.fillStyle='#1a0204';g.beginPath();g.arc(20,-1.6,1.2,0,TAU);g.arc(20,1.2,1.2,0,TAU);g.fill();
      muzzle=21;flash='#ff5a6a';break;}
    case 'acidcan':{
      /* кислотная пушка: колба с булькающей кислотой */
      box(0,-2.6,22,5,'#2a3a10');hl(0,-2.6,22);box(22,-3.6,5,7,'#1a2608');
      g.fillStyle='rgba(20,30,5,.8)';g.beginPath();g.ellipse(9,-5.4,5,3.4,0,0,TAU);g.fill();
      const lv=(Math.sin(T*2)+1)/2;g.fillStyle='#9aff40';g.beginPath();g.ellipse(9,-4.6+lv*0.4,4,2.4,0,0,Math.PI);g.fill();
      for(let k=0;k<2;k++){const ph=(T*1.4+k*0.5)%1;g.fillStyle='rgba(220,255,160,'+(1-ph)+')';g.beginPath();g.arc(7+k*4,-4.4-ph*2.4,0.8,0,TAU);g.fill();}
      grip(3,'#1a2608');glowDot(26,0,7,'#9aff40',0.45);muzzle=27;flash='#b8ff60';break;}
    case 'soulrail':{
      /* рельсотрон душ: длинные направляющие, кольца-фокусы */
      box(-4,-1.8,8,3.6,'#1a2a3a');box(4,-3.2,26,1.6,'#2a3a4a');box(4,1.6,26,1.6,'#2a3a4a');box(4,-1.6,24,3.2,'#0e1620');
      for(let k=0;k<4;k++){const a=0.5+0.5*Math.sin(T*8-k*1.3);g.strokeStyle='rgba(122,216,255,'+a+')';g.lineWidth=1;g.beginPath();g.ellipse(9+k*5.4,0,1.4,4.4,0,0,TAU);g.stroke();}
      g.fillStyle='rgba(180,240,255,.9)';g.fillRect(5,-0.5,23*(0.6+0.4*Math.sin(T*4)),1);grip(2,'#0e1620');glowDot(30,0,8,'#7ad8ff',0.6);muzzle=31;flash='#bff0ff';break;}
    case 'infernus':{
      /* Инфернус: рогатая пушка ядра с вращающимся жерлом */
      box(-5,-2,7,4,'#2a0a00');g.fillStyle='#3a1206';g.beginPath();g.moveTo(1,-4);g.lineTo(20,-3);g.lineTo(22,0);g.lineTo(20,3);g.lineTo(1,4);g.closePath();g.fill();hl(2,-3.6,17);
      g.fillStyle='#e0d0b0';g.beginPath();g.moveTo(4,-4);g.quadraticCurveTo(6,-9,11,-9);g.quadraticCurveTo(8,-7,8,-4);g.fill();
      g.strokeStyle='rgba(255,'+(140+Math.floor(60*Math.sin(T*5)))+',40,.9)';g.lineWidth=1;g.beginPath();g.moveTo(4,-1);g.lineTo(9,1);g.lineTo(14,-1);g.lineTo(19,1);g.stroke();
      g.save();g.translate(22,0);g.rotate(T*6);g.fillStyle='#ffb030';for(let k=0;k<4;k++){g.rotate(Math.PI/2);g.fillRect(-0.6,1.4,1.2,2.4);}g.restore();
      grip(3,'#1a0600');glowDot(22,0,9,'#ffb030',0.6);muzzle=23;flash='#ffc040';break;}
    default:box(0,-2,L.len,4.2,L.col);grip(2,L.col);
  }
  if(recoil>0.5){
    const k=(recoil-0.5)*2;olLight(g,(g)=>{
    if(id==='hellfire'){for(let q=0;q<4;q++){g.fillStyle=q%2?'rgba(255,220,120,'+k+')':'rgba(255,90,20,'+k+')';g.beginPath();g.ellipse(muzzle+6+q*5,(q%2?-1:1)*1.4,6+q*2,3+q,0,0,TAU);g.fill();}}
    else{const gr=g.createRadialGradient(muzzle+4,0,0,muzzle+4,0,12);gr.addColorStop(0,hexA(flash,k));gr.addColorStop(1,hexA(flash,0));g.fillStyle=gr;g.beginPath();g.arc(muzzle+4,0,12,0,TAU);g.fill();
      g.fillStyle=hexA('#ffffff',k*0.9);g.beginPath();g.moveTo(muzzle,0);g.lineTo(muzzle+7,-3.4);g.lineTo(muzzle+15,0);g.lineTo(muzzle+7,3.4);g.closePath();g.fill();
      if(id==='shotgun'||id==='bloodshot'){g.fillStyle=hexA(flash,k);for(let q=-1;q<=1;q++){g.beginPath();g.moveTo(muzzle+2,0);g.lineTo(muzzle+12,q*6-1);g.lineTo(muzzle+12,q*6+1);g.closePath();g.fill();}}}
    });
  }
}
