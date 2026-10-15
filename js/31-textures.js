'use strict';
/* ============================================================
   ТЕКСТУРЫ ПОРОД (процедурные, рисуются один раз и кэшируются)
   ============================================================ */
const TEX={},WALLTEX={},TEXPAT={},WALLPAT={};
function texRng(seed){let st=(seed>>>0)||1;return ()=>{st^=st<<13;st>>>=0;st^=st>>>17;st^=st<<5;st>>>=0;return st/4294967296;};}
function texCanvas(){const c=document.createElement('canvas');c.width=c.height=32;return c;}
function makeTex(type,v){
  const c=texCanvas(),g=c.getContext('2d'),R=texRng(type*92821+v*68917+7);
  const col=TILECOL[type]||['#555555','#5b5b5b','#4f4f4f'];
  const base=col[v%3];
  g.fillStyle=base;g.fillRect(0,0,32,32);
  const dots=(n,s0,s1,k)=>{for(let i=0;i<n;i++){const x=R()*32|0,y=R()*32|0,sz=Math.ceil(s0+R()*(s1-s0));g.fillStyle=shadeHex(base,(R()-0.5)*k);g.fillRect(x,y,sz,sz);}};
  const crack=(cc,w,n)=>{g.strokeStyle=cc;g.lineWidth=w;g.beginPath();let x=R()*32,y=R()*32;g.moveTo(x,y);for(let k=0;k<n;k++){x+=(R()-0.5)*14;y+=(R()-0.4)*12;g.lineTo(x,y);}g.stroke();};
  switch(type){
    case T_DIRT:{
      dots(80,1,2.6,0.34);
      const by=5+R()*20;
      g.fillStyle=hexA(shadeHex(base,-0.28),0.4);
      g.beginPath();g.moveTo(0,by);for(let x=0;x<=32;x+=4)g.lineTo(x,by+Math.sin(x*0.4+v)*1.4);
      for(let x=32;x>=0;x-=4)g.lineTo(x,by+3+Math.sin(x*0.5+v*2)*1.2);g.closePath();g.fill();
      for(let i=0;i<3;i++){const x=3+R()*26,y=3+R()*26,r=1.2+R()*2.2;g.fillStyle=shadeHex('#8a7a66',(R()-0.5)*0.4);g.beginPath();g.ellipse(x,y,r*1.3,r,R(),0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.2)';g.fillRect(x-r*0.6,y-r*0.6,1.2,1.2);}
      if(R()<0.25){g.strokeStyle=hexA('#3a2414',0.6);g.lineWidth=1;g.beginPath();const x=R()*32;g.moveTo(x,0);g.quadraticCurveTo(x+4,12,x-2,22);g.stroke();}
      break;}
    case T_STONE:case T_SPRING:{
      dots(55,1,2,0.26);
      for(let i=0;i<3;i++){const x=R()*32,y=R()*32,r=5+R()*7;
        g.fillStyle=hexA(shadeHex(base,(R()-0.35)*0.28),0.65);g.beginPath();
        for(let k=0;k<5;k++){const a=k/5*TAU+R()*0.5;g.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r*0.8);}
        g.closePath();g.fill();g.strokeStyle='rgba(255,255,255,.09)';g.lineWidth=1;g.stroke();}
      if(R()<0.65)crack(hexA(shadeHex(base,-0.5),0.7),1,4);
      break;}
    case T_CRYSTAL:{
      dots(30,1,2,0.3);
      for(let i=0;i<4;i++){const x=R()*32,y=R()*32,w=4+R()*7,h=8+R()*12,a=(R()-0.5)*1.4;
        g.save();g.translate(x,y);g.rotate(a);
        const gr=g.createLinearGradient(-w,0,w,0);gr.addColorStop(0,hexA(shadeHex(base,0.4),0.6));gr.addColorStop(0.5,hexA(shadeHex(base,0.08),0.35));gr.addColorStop(1,hexA(shadeHex(base,-0.32),0.6));
        g.fillStyle=gr;g.beginPath();g.moveTo(0,-h/2);g.lineTo(w/2,0);g.lineTo(0,h/2);g.lineTo(-w/2,0);g.closePath();g.fill();
        g.strokeStyle='rgba(235,225,255,.18)';g.lineWidth=0.8;g.stroke();g.restore();}
      for(let i=0;i<4;i++){g.fillStyle='rgba(235,225,255,.7)';g.fillRect(R()*31|0,R()*31|0,1,1);}
      break;}
    case T_MAGMA:case T_HOT:{
      dots(60,1,2.6,0.42);
      for(let i=0;i<5;i++){g.fillStyle=hexA('#1a0a06',0.35);g.beginPath();g.arc(R()*32,R()*32,1+R()*2.4,0,TAU);g.fill();}
      const hot=type===T_HOT;
      for(let i=0;i<2;i++)crack(hot?'rgba(255,200,100,.75)':'rgba(255,110,40,.38)',hot?1.8:1.1,4);
      break;}
    case T_OBS:{
      dots(28,1,2,0.3);
      const gr=g.createLinearGradient(0,0,32,32);gr.addColorStop(0,'rgba(150,120,210,.12)');gr.addColorStop(0.45,'rgba(255,255,255,0)');gr.addColorStop(0.55,'rgba(190,160,255,.09)');gr.addColorStop(1,'rgba(0,0,0,.18)');
      g.fillStyle=gr;g.fillRect(0,0,32,32);
      for(let i=0;i<2;i++)crack('rgba(30,22,48,.85)',1,2);
      for(let i=0;i<3;i++){g.fillStyle='rgba(180,140,255,.5)';g.fillRect(R()*31|0,R()*31|0,1,1);}
      break;}
    case T_BEDROCK:dots(90,2,4.5,0.36);break;
    case T_VENT:dots(60,1,2.6,0.4);break;
    case T_SOULSAND:{
      dots(70,1,2.4,0.3);
      /* лица душ, впечатанные в песок */
      for(let i=0;i<2;i++){const x=6+R()*20,y=8+R()*16;g.fillStyle='rgba(20,14,30,.55)';g.beginPath();g.ellipse(x-2.2,y,1.4,2,0,0,TAU);g.ellipse(x+2.2,y,1.4,2,0,0,TAU);g.fill();g.beginPath();g.ellipse(x,y+4,1.6,2.2,0,0,TAU);g.fill();}
      for(let i=0;i<4;i++){g.fillStyle='rgba(150,200,255,.25)';g.fillRect(R()*31|0,R()*31|0,1,1);}
      break;}
    case T_ASHVENT:{
      dots(60,1,2.2,0.3);
      g.fillStyle='#1a1210';g.beginPath();g.ellipse(16,4,9,4,0,0,TAU);g.fill();
      g.strokeStyle='rgba(255,120,50,.55)';g.lineWidth=1.2;g.beginPath();g.ellipse(16,4,9,4,0,0,TAU);g.stroke();
      for(let i=0;i<3;i++){g.strokeStyle='rgba(20,10,8,.6)';g.lineWidth=1;g.beginPath();g.moveTo(16,6);g.lineTo(6+i*10,30);g.stroke();}
      break;}
    case T_FLESHPOD:{
      dots(40,1,2.6,0.3);
      for(let i=0;i<3;i++){g.strokeStyle='rgba(60,0,12,.75)';g.lineWidth=1.6;g.beginPath();g.moveTo(R()*32,R()*32);g.quadraticCurveTo(R()*32,R()*32,R()*32,R()*32);g.stroke();}
      const gr2=g.createRadialGradient(16,16,2,16,16,13);gr2.addColorStop(0,'rgba(255,120,140,.55)');gr2.addColorStop(1,'rgba(120,10,30,0)');g.fillStyle=gr2;g.beginPath();g.arc(16,16,13,0,TAU);g.fill();
      break;}
    case T_SULFBOMB:{
      dots(40,1,2.4,0.35);
      for(let i=0;i<4;i++){const x=R()*26+3,y=R()*26+3;g.fillStyle='rgba(255,255,170,.6)';g.beginPath();g.moveTo(x,y-5);g.lineTo(x+3,y);g.lineTo(x,y+5);g.lineTo(x-3,y);g.closePath();g.fill();}
      crack('rgba(90,70,0,.7)',1.2,4);
      break;}
    case T_CRUST:{
      dots(40,1,2,0.3);
      for(let i=0;i<3;i++)crack('rgba(255,'+(110+R()*80|0)+',30,.85)',1.4,4);
      g.fillStyle='rgba(0,0,0,.25)';g.fillRect(0,24,32,8);
      break;}
    case T_BSPIKE:{
      dots(30,1,2,0.18);
      g.fillStyle='rgba(60,50,40,.35)';g.fillRect(0,0,32,3);
      break;}
    case T_ASH:{
      dots(90,1,2.2,0.3);
      /* слоистые пласты пепла */
      for(let i=0;i<3;i++){const y0=4+i*10+R()*4;g.strokeStyle=i%2?'rgba(20,14,12,.35)':'rgba(140,125,115,.18)';g.lineWidth=1.2;g.beginPath();g.moveTo(0,y0);for(let x=0;x<=32;x+=8)g.lineTo(x,y0+(R()-0.5)*3);g.stroke();}
      if(R()<0.35){g.strokeStyle='rgba(255,110,40,.4)';g.lineWidth=0.8;g.beginPath();let x=R()*32,y=R()*32;g.moveTo(x,y);for(let k=0;k<3;k++){x+=(R()-0.5)*10;y+=(R()-0.5)*10;g.lineTo(x,y);}g.stroke();}
      for(let i=0;i<4;i++){g.fillStyle='rgba(20,16,16,.35)';g.beginPath();g.ellipse(R()*32,R()*32,2+R()*4,1+R()*2,R()*3,0,TAU);g.fill();}
      for(let i=0;i<6;i++){g.fillStyle=R()<0.5?'rgba(255,120,60,.35)':'rgba(220,210,200,.22)';g.fillRect(R()*31|0,R()*31|0,1,1);}
      break;}
    case T_BASALT:{
      dots(40,1,2,0.22);
      g.strokeStyle='rgba(0,0,0,.45)';g.lineWidth=1;
      g.beginPath();const ox=R()*6;g.moveTo(ox+8,0);g.lineTo(ox+8,32);g.moveTo(ox+20,0);g.lineTo(ox+20,32);g.stroke();
      g.fillStyle='rgba(255,255,255,.06)';g.fillRect(ox+9,0,2,32);g.fillRect(ox+21,0,2,32);
      g.strokeStyle='rgba(0,0,0,.3)';g.beginPath();g.moveTo(0,R()*32);g.lineTo(ox+8,R()*32);g.stroke();
      break;}
    case T_FLESH:{
      dots(50,1,2.4,0.35);
      /* поры и жировые прослойки */
      for(let i=0;i<5;i++){const x=R()*32,y=R()*32;g.fillStyle='rgba(30,0,6,.45)';g.beginPath();g.ellipse(x,y,1.2+R(),0.8+R()*0.6,R()*3,0,TAU);g.fill();}
      if(R()<0.5){g.fillStyle='rgba(230,200,150,.18)';g.beginPath();g.ellipse(R()*32,R()*32,5+R()*4,2,R()*3,0,TAU);g.fill();}
      for(let i=0;i<2;i++){g.strokeStyle='rgba(60,0,10,.7)';g.lineWidth=1.6;g.beginPath();let x=R()*32,y=R()*32;g.moveTo(x,y);for(let k=0;k<4;k++){x+=(R()-0.5)*16;y+=(R()-0.5)*16;g.quadraticCurveTo(x+(R()-0.5)*8,y+(R()-0.5)*8,x,y);}g.stroke();
        g.strokeStyle='rgba(255,90,110,.22)';g.lineWidth=0.7;g.stroke();}
      for(let i=0;i<3;i++){g.fillStyle='rgba(255,170,170,.18)';g.beginPath();g.arc(R()*32,R()*32,1+R()*2,0,TAU);g.fill();}
      break;}
    case T_SULFUR:{
      dots(60,1,2.6,0.32);
      /* корка и кристаллики серы */
      for(let i=0;i<2;i++){const y0=6+R()*20;g.fillStyle='rgba(30,28,4,.28)';g.fillRect(0,y0,32,2+R()*2);}
      for(let i=0;i<3;i++){const x=R()*28+2,y=R()*28+2,h=3+R()*4;g.fillStyle='rgba(240,230,90,.55)';g.beginPath();g.moveTo(x-1.6,y);g.lineTo(x,y-h);g.lineTo(x+1.6,y);g.closePath();g.fill();g.fillStyle='rgba(255,255,200,.5)';g.fillRect(x-0.3,y-h+1,0.6,h-1.5);}
      for(let i=0;i<5;i++){const x=R()*32,y=R()*32,r=1.5+R()*3;g.fillStyle='rgba(255,250,150,.28)';g.beginPath();g.arc(x,y,r,0,TAU);g.fill();g.fillStyle='rgba(80,70,0,.3)';g.beginPath();g.arc(x+r*0.4,y+r*0.4,r*0.6,0,TAU);g.fill();}
      crack('rgba(60,80,10,.5)',1,3);
      break;}
    case T_BONEROCK:{
      /* оссуарий: кости, плотно уложенные в тёмную землю; черепа, рёбра, позвонки */
      const dk=shadeHex(base,-0.3);g.fillStyle=dk;g.fillRect(0,0,32,32);
      for(let i=0;i<34;i++){g.fillStyle=shadeHex(dk,(R()-0.5)*0.6);g.fillRect(R()*32|0,R()*32|0,1+(R()*2|0),1);}
      const bone=(x,y,len,a,w,sh)=>{g.save();g.translate(x,y);g.rotate(a);const L=len/2;
        const knob=(c,dy)=>{g.fillStyle=c;g.beginPath();g.rect(-L,-w/2+dy,len,w);for(const ex of [-L,L])for(const ey of [-w*0.42,w*0.42]){g.moveTo(ex+w*0.72,ey+dy);g.arc(ex,ey+dy,w*0.72,0,TAU);}g.fill();};
        knob('rgba(0,0,0,.42)',1.1);knob(shadeHex(base,sh-0.2),0);
        g.fillStyle=shadeHex(base,sh+0.08);g.fillRect(-L+w*0.5,-w/2,len-w,w*0.45);
        g.fillStyle='rgba(255,252,240,.35)';g.fillRect(-L+w*0.7,-w/2+0.3,len-w*1.4,0.7);g.restore();};
      const skull=(x,y,r,a)=>{g.save();g.translate(x,y);g.rotate(a);
        g.fillStyle='rgba(0,0,0,.45)';g.beginPath();g.ellipse(0.8,1.4,r*1.05,r,0,0,TAU);g.fill();
        const gr=g.createRadialGradient(-r*0.35,-r*0.45,0.5,0,0,r*1.2);gr.addColorStop(0,shadeHex(base,0.32));gr.addColorStop(1,shadeHex(base,-0.22));g.fillStyle=gr;
        g.beginPath();g.ellipse(0,-r*0.15,r,r*0.88,0,0,TAU);g.fill();g.fillRect(-r*0.6,r*0.35,r*1.2,r*0.62);
        g.fillStyle='#1c1612';g.beginPath();g.ellipse(-r*0.4,r*0.08,r*0.27,r*0.3,0.2,0,TAU);g.ellipse(r*0.4,r*0.08,r*0.27,r*0.3,-0.2,0,TAU);g.fill();
        g.beginPath();g.moveTo(0,r*0.32);g.lineTo(-r*0.13,r*0.58);g.lineTo(r*0.13,r*0.58);g.closePath();g.fill();
        g.fillStyle='rgba(20,14,10,.7)';for(let k=-1;k<=1;k++)g.fillRect(k*r*0.3-0.35,r*0.72,0.7,r*0.24);
        g.fillStyle='rgba(255,250,235,.3)';g.beginPath();g.ellipse(-r*0.35,-r*0.55,r*0.32,r*0.16,-0.5,0,TAU);g.fill();g.restore();};
      if(v===1){/* ряды бедренных костей торцами, как в стенах оссуария */
        for(let r=0;r<3;r++){const y0=5+r*11;for(let k=0;k<2;k++)bone(9+k*15+(r%2?3:0)+(R()-0.5)*2,y0+(R()-0.5)*1.4,12+R()*2,(R()-0.5)*0.12,2.6,(R()-0.5)*0.16);}}
      else{
        /* кости по сетке 2x2 с разбросом, чтобы не сходились звездой */
        for(let i=0;i<4;i++){if(v<4&&i===((v*3)&3))continue;bone(9+(i&1)*14+(R()-0.5)*5,9+(i>>1)*14+(R()-0.5)*5,8+R()*6,R()*Math.PI,1.8+R()*0.8,(R()-0.5)*0.2);}
        if(v===0)skull(16+(R()-0.5)*4,15+(R()-0.5)*4,6+R()*1.2,(R()-0.5)*0.5);
        else if(v===2){/* позвонки цепочкой */const a=R()*Math.PI,cx=16,cy=16;for(let k=-2;k<=2;k++){const x=cx+Math.cos(a)*k*4,y=cy+Math.sin(a)*k*4;g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.arc(x+0.6,y+0.9,2.2,0,TAU);g.fill();g.fillStyle=shadeHex(base,0.05-Math.abs(k)*0.04);g.beginPath();g.arc(x,y,2.1,0,TAU);g.fill();g.fillStyle=dk;g.beginPath();g.arc(x,y,0.7,0,TAU);g.fill();}}
        else if(v===3){/* обломок челюсти */const x=10+R()*12,y=12+R()*8;g.fillStyle='rgba(0,0,0,.4)';g.beginPath();g.arc(x+0.8,y+1,5,0.1,Math.PI-0.1);g.lineTo(x-3,y+1);g.arc(x+0.8,y+1,2.6,Math.PI-0.1,0.1,true);g.fill();
          g.fillStyle=shadeHex(base,0.06);g.beginPath();g.arc(x,y,5,0.1,Math.PI-0.1);g.lineTo(x-2.6,y);g.arc(x,y,2.6,Math.PI-0.1,0.1,true);g.closePath();g.fill();g.fillStyle=shadeHex(base,0.25);for(let k=0;k<4;k++)g.fillRect(x-3+k*1.8,y+2.2,1,1.3);}
      }
      g.fillStyle=R()<0.5?'rgba(120,150,190,.05)':'rgba(170,120,70,.05)';g.fillRect(0,0,32,32);
      if(R()<0.4)crack('rgba(30,24,18,.5)',0.9,3);
      break;}
    case 60:{
      /* склеп: тёсаные плиты тёмного камня с резьбой (пол и свод коридоров Катакомб) */
      g.fillStyle=shadeHex(base,-0.5);g.fillRect(0,0,32,32);
      for(let r=0;r<2;r++){const off=(r+v)%2?10:0;
        for(let k=-1;k<2;k++){const bx=off+k*20+1,by=r*16+1,bw=19,bh=14,sh=(R()-0.5)*0.18;
          const gr=g.createLinearGradient(bx,by,bx+bw*0.6,by+bh);gr.addColorStop(0,shadeHex(base,0.16+sh));gr.addColorStop(1,shadeHex(base,-0.14+sh));g.fillStyle=gr;g.fillRect(bx,by,bw,bh);
          g.fillStyle='rgba(255,255,255,.1)';g.fillRect(bx,by,bw,1);g.fillStyle='rgba(0,0,0,.3)';g.fillRect(bx,by+bh-1,bw,1);g.fillRect(bx+bw-1,by,1,bh);
          for(let i=0;i<6;i++){g.fillStyle=shadeHex(base,(R()-0.5)*0.4);g.fillRect(bx+R()*bw|0,by+R()*bh|0,1,1);}}}
      if(v===1){/* резной череп */const x=16,y=8;g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.arc(x+0.6,y+0.6,4,0,TAU);g.fill();g.fillStyle=shadeHex(base,0.2);g.beginPath();g.arc(x,y,4,0,TAU);g.fill();g.fillRect(x-2.4,y+2,4.8,2.6);
        g.fillStyle=shadeHex(base,-0.45);g.fillRect(x-2.3,y-0.6,1.6,1.8);g.fillRect(x+0.7,y-0.6,1.6,1.8);}
      else if(v===2)crack('rgba(10,8,14,.6)',1,4);
      else if(v===3){/* полустёртая руна */g.strokeStyle='rgba(140,200,255,.22)';g.lineWidth=0.9;const x=8+R()*14,y=20+R()*4;g.beginPath();g.moveTo(x,y-4);g.lineTo(x,y+4);g.moveTo(x-3,y-1);g.lineTo(x+3,y+2);g.moveTo(x-3,y+2);g.lineTo(x+3,y-1);g.stroke();}
      break;}
    case T_HELLSTONE:{
      dots(50,1,2.6,0.35);
      /* обсидиановые сколы */
      for(let i=0;i<2;i++){const x=R()*28,y=R()*28;g.fillStyle='rgba(20,6,10,.55)';g.beginPath();g.moveTo(x,y);g.lineTo(x+5+R()*4,y+2);g.lineTo(x+2,y+6+R()*3);g.closePath();g.fill();g.fillStyle='rgba(200,150,255,.18)';g.fillRect(x+1,y+1,3,0.8);}
      for(let i=0;i<3;i++)crack('rgba(255,'+(70+R()*80|0)+',20,.55)',1.4,4);
      for(let i=0;i<4;i++){g.fillStyle='rgba(255,200,80,.5)';g.fillRect(R()*31|0,R()*31|0,1,1);}
      break;}
    case T_SOULSTONE:{
      dots(30,1,2,0.25);
      const gr=g.createRadialGradient(16,16,2,16,16,18);gr.addColorStop(0,'rgba(170,230,255,.28)');gr.addColorStop(1,'rgba(30,60,120,0)');g.fillStyle=gr;g.fillRect(0,0,32,32);
      for(let i=0;i<3;i++){g.strokeStyle='rgba(180,240,255,.35)';g.lineWidth=0.8;g.beginPath();const x=R()*32,y=R()*32;g.arc(x,y,2+R()*3,0,Math.PI*1.4);g.stroke();}
      break;}
    case T_ARENA:{
      g.fillStyle='rgba(0,0,0,.25)';g.fillRect(0,15,32,2);g.fillRect(15+(v%2?0:-8),0,2,15);g.fillRect(8+(v%2?8:0),17,2,15);
      g.strokeStyle='rgba(170,110,255,.25)';g.lineWidth=1;g.strokeRect(3.5,3.5,25,25);
      for(let i=0;i<2;i++){g.fillStyle='rgba(190,140,255,.45)';g.fillRect(R()*30|0,R()*30|0,2,1);}
      break;}
    case T_BONE:{
      /* кладка из костей и черепов */
      g.fillStyle=shadeHex(base,-0.25);g.fillRect(0,0,32,32);
      for(let r=0;r<3;r++){const y0=r*11+1,off=(r+v)%2?6:0;
        for(let k=-1;k<3;k++){const x0=off+k*14;
          const gr=g.createLinearGradient(0,y0,0,y0+9);gr.addColorStop(0,shadeHex(base,0.12));gr.addColorStop(1,shadeHex(base,-0.18));g.fillStyle=gr;
          g.beginPath();g.moveTo(x0+2,y0+1.5);g.lineTo(x0+12,y0+1.5);g.quadraticCurveTo(x0+14,y0+4.5,x0+12,y0+7.5);g.lineTo(x0+2,y0+7.5);g.quadraticCurveTo(x0,y0+4.5,x0+2,y0+1.5);g.fill();
          g.fillStyle='rgba(255,255,255,.25)';g.fillRect(x0+3,y0+2,8,1);}}
      if(v===1){g.fillStyle=shadeHex(base,0.15);g.beginPath();g.arc(16,15,6,0,TAU);g.fill();g.fillRect(12.5,18,7,4);g.fillStyle='rgba(30,22,16,.85)';g.fillRect(12.6,13.6,2.6,3);g.fillRect(16.8,13.6,2.6,3);g.fillRect(15.4,18,1.2,1.6);}
      g.fillStyle='rgba(40,30,20,.5)';g.fillRect(0,10,32,1);g.fillRect(0,21,32,1);
      break;}
    case T_BRICK:{
      /* каменная кладка: блоки с фаской, сколы, раствор */
      g.fillStyle=shadeHex(base,-0.45);g.fillRect(0,0,32,32);
      for(let r=0;r<2;r++){const off=(r+v)%2?8:0;
        for(let k=-1;k<2;k++){const bx=off+k*16+1,by=r*16+1,bw=14,bh=14,sh=(R()-0.5)*0.16;
          const gr=g.createLinearGradient(bx,by,bx+bw,by+bh);gr.addColorStop(0,shadeHex(base,0.14+sh));gr.addColorStop(0.6,shadeHex(base,sh));gr.addColorStop(1,shadeHex(base,-0.2+sh));
          g.fillStyle=gr;g.fillRect(bx,by,bw,bh);
          g.fillStyle='rgba(255,255,255,.16)';g.fillRect(bx,by,bw,1);g.fillRect(bx,by,1,bh);
          g.fillStyle='rgba(0,0,0,.25)';g.fillRect(bx,by+bh-1,bw,1);g.fillRect(bx+bw-1,by,1,bh);
          if(R()<0.35){g.fillStyle=shadeHex(base,-0.35);g.beginPath();g.moveTo(bx+bw,by+R()*6);g.lineTo(bx+bw-3,by+3+R()*4);g.lineTo(bx+bw,by+8+R()*4);g.fill();}}}
      if(R()<0.3){g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=0.8;g.beginPath();let x=R()*32,y=R()*32;g.moveTo(x,y);for(let k=0;k<3;k++){x+=(R()-0.5)*10;y+=(R()-0.3)*8;g.lineTo(x,y);}g.stroke();}
      if(R()<0.25){g.fillStyle='rgba(70,110,50,.45)';g.beginPath();g.ellipse(R()*32,0,6,3,0,0,Math.PI);g.fill();}
      break;}
    case T_WOOD:{
      /* доски с волокнами, сучками и гвоздями */
      for(let k=0;k<4;k++){const y0=k*8,sh=(R()-0.5)*0.18;const gr=g.createLinearGradient(0,y0,0,y0+8);gr.addColorStop(0,shadeHex(base,0.12+sh));gr.addColorStop(1,shadeHex(base,-0.15+sh));g.fillStyle=gr;g.fillRect(0,y0,32,8);
        g.strokeStyle='rgba(60,30,10,.35)';g.lineWidth=0.7;g.beginPath();g.moveTo(0,y0+3+R()*2);g.quadraticCurveTo(16,y0+2+R()*4,32,y0+3+R()*2);g.stroke();
        g.fillStyle='rgba(0,0,0,.4)';g.fillRect(0,y0+7,32,1);
        if(R()<0.3){g.fillStyle='rgba(60,30,10,.5)';g.beginPath();g.ellipse(4+R()*24,y0+4,1.8,1.2,0,0,TAU);g.fill();}}
      const sx=(v%2)?10:22;g.fillStyle='rgba(0,0,0,.35)';g.fillRect(sx,0,1,32);
      g.fillStyle='#8a8a90';for(let k=0;k<4;k++){g.fillRect(sx-3,k*8+3,1.4,1.4);g.fillRect(sx+2,k*8+3,1.4,1.4);}
      break;}
    default:dots(35,1,2,0.2);
  }
  return c;
}
const TEXABLE=new Set([60,T_BRICK,T_WOOD,T_DIRT,T_STONE,T_CRYSTAL,T_MAGMA,T_OBS,T_BEDROCK,T_SPRING,T_HOT,T_VENT,T_BONE,T_ASH,T_BASALT,T_FLESH,T_SULFUR,T_BONEROCK,T_HELLSTONE,T_SOULSTONE,T_ARENA,T_SOULSAND,T_ASHVENT,T_FLESHPOD,T_SULFBOMB,T_CRUST,T_BSPIKE]);
function texFor(type,tx,ty){
  let a=TEX[type];
  if(!a){a=TEX[type]=[0,1,2,3].map(v=>makeTex(type,v));}
  return a[hash2(tx,ty,7)&3];
}
/* узор 8x8 блоков из случайных вариантов — целая полоса заливается одной операцией */
function makeAtlasPattern(g,variants,salt){
  const c=document.createElement('canvas');c.width=c.height=256;const cg=c.getContext('2d');
  for(let y=0;y<8;y++)for(let x=0;x<8;x++)cg.drawImage(variants[hash2(x,y,salt)%variants.length],x*32,y*32);
  return g.createPattern(c,'repeat');
}
function texPat(g,type){
  let pt=TEXPAT[type];
  if(!pt){if(!TEX[type])TEX[type]=(type===T_BONEROCK?[0,1,2,3,4,5]:[0,1,2,3]).map(v=>makeTex(type,v));pt=TEXPAT[type]=makeAtlasPattern(g,TEX[type],type*31+7);}
  return pt;
}
/* задняя стена пещеры: тёмная порода биома за пустотами */
function makeWall(bi,v){
  const c=texCanvas(),g=c.getContext('2d'),R=texRng(bi*3571+v*911+3);
  const rock=[T_DIRT,T_STONE,T_CRYSTAL,T_MAGMA,T_OBS,T_ASH,T_FLESH,T_SULFUR,T_BONEROCK,T_HELLSTONE][bi]||T_STONE;
  const base=shadeHex(TILECOL[rock][v%3],-0.56);
  g.fillStyle=base;g.fillRect(0,0,32,32);
  for(let i=0;i<50;i++){g.fillStyle=shadeHex(base,(R()-0.5)*0.5);g.fillRect(R()*32|0,R()*32|0,1+(R()*2|0),1+(R()*2|0));}
  for(let i=0;i<3;i++){g.fillStyle=hexA(shadeHex(base,-0.35),0.5);g.beginPath();g.ellipse(R()*32,R()*32,3+R()*6,2+R()*4,R()*3,0,TAU);g.fill();}
  if(bi===0){g.fillStyle=hexA(shadeHex(base,-0.3),0.5);g.fillRect(0,8+R()*16|0,32,2);}
  else if(bi===1){g.strokeStyle=hexA(shadeHex(base,0.25),0.35);g.lineWidth=1;g.beginPath();g.moveTo(R()*32,0);g.lineTo(R()*32,32);g.stroke();}
  else if(bi===2){for(let i=0;i<2;i++){g.fillStyle='rgba(170,150,255,.28)';g.beginPath();const x=R()*32,y=R()*32;g.moveTo(x,y-4);g.lineTo(x+2,y);g.lineTo(x,y+4);g.lineTo(x-2,y);g.fill();}}
  else if(bi===3){g.strokeStyle='rgba(255,100,30,.16)';g.lineWidth=1;g.beginPath();let x=R()*32,y=R()*32;g.moveTo(x,y);for(let k=0;k<3;k++){x+=(R()-0.5)*14;y+=(R()-0.5)*14;g.lineTo(x,y);}g.stroke();}
  else if(bi===4){for(let i=0;i<3;i++){g.fillStyle='rgba(160,110,255,.35)';g.fillRect(R()*31|0,R()*31|0,1,1);}}
  else if(bi===5){for(let i=0;i<3;i++){g.fillStyle='rgba(255,110,50,.22)';g.fillRect(R()*31|0,R()*31|0,1,1);}g.fillStyle='rgba(0,0,0,.25)';g.fillRect(R()*28|0,0,2,32);}
  else if(bi===6){g.strokeStyle='rgba(120,0,20,.45)';g.lineWidth=1.4;g.beginPath();let x=R()*32,y=0;g.moveTo(x,y);for(let k=0;k<4;k++){x+=(R()-0.5)*12;y+=8;g.lineTo(x,y);}g.stroke();}
  else if(bi===7){for(let i=0;i<3;i++){g.fillStyle='rgba(200,230,60,.16)';g.beginPath();g.arc(R()*32,R()*32,1.5+R()*2,0,TAU);g.fill();}}
  else if(bi===8){/* стена оссуария: приглушённые ряды черепов и костей, местами голый камень */
    const sk=shadeHex(base,0.2),skD=shadeHex(base,0.1),hol=shadeHex(base,-0.45);
    if(v===1){for(let k=0;k<4;k++){if(R()<0.25)continue;const x=4+k*8+(R()-0.5)*1.6,y=12+(R()-0.5)*2;
        g.fillStyle=hexA(hol,0.5);g.beginPath();g.arc(x+0.5,y+0.7,3.3,0,TAU);g.fill();
        g.fillStyle=R()<0.3?skD:sk;g.beginPath();g.arc(x,y,3.1,0,TAU);g.fill();g.fillRect(x-1.8,y+1.4,3.6,2);
        g.fillStyle=hol;g.fillRect(x-1.8,y-0.4,1.3,1.4);g.fillRect(x+0.5,y-0.4,1.3,1.4);}
      g.fillStyle=hexA(skD,0.6);g.fillRect(0,4,32,2);g.fillRect(0,20,32,2);}
    else if(v===2){for(let k=0;k<4;k++){const x=8*k+3+(R()-0.5)*2,y=10+(R()-0.5)*3;g.fillStyle=hexA(sk,0.55);g.beginPath();g.arc(x,y,1.7,0,TAU);g.arc(x,y+3,1.7,0,TAU);g.fill();g.fillStyle=hexA(hol,0.6);g.beginPath();g.arc(x,y+1.5,0.7,0,TAU);g.fill();}
      g.save();g.translate(16,24);g.rotate((R()-0.5)*0.6);g.fillStyle=hexA(skD,0.6);g.fillRect(-7,-0.9,14,1.8);g.beginPath();g.arc(-7,0,1.3,0,TAU);g.arc(7,0,1.3,0,TAU);g.fill();g.restore();}
    else{g.save();g.translate(8+R()*16,8+R()*16);g.rotate(R()*3);g.fillStyle=hexA(skD,0.5);g.fillRect(-5,-0.8,10,1.6);g.beginPath();g.arc(-5,0,1.2,0,TAU);g.arc(5,0,1.2,0,TAU);g.fill();g.restore();}}
  else{g.strokeStyle='rgba(255,90,20,.22)';g.lineWidth=1;g.beginPath();let x=R()*32,y=R()*32;g.moveTo(x,y);for(let k=0;k<3;k++){x+=(R()-0.5)*14;y+=(R()-0.5)*14;g.lineTo(x,y);}g.stroke();}
  return c;
}
function wallPat(g,bi){
  let pt=WALLPAT[bi];
  if(!pt){if(!WALLTEX[bi])WALLTEX[bi]=[0,1,2].map(v=>makeWall(bi,v));pt=WALLPAT[bi]=makeAtlasPattern(g,WALLTEX[bi],bi*17+3);}
  return pt;
}
function drawCaveWalls(g,tx0,tx1,ty0,ty1){
  if(settings.quality==='low')return;
  const inside=structInterior(tx0,tx1,ty0,ty1);
  g.save();
  for(let ty=Math.max(ty0,5);ty<=ty1;ty++){
    g.globalAlpha=ty<9?(ty-4)*0.16:0.8;
    g.fillStyle=wallPat(g,biomeAt(ty));
    let run=-1;
    for(let tx=tx0;tx<=tx1+1;tx++){
      let open=false;
      if(tx<=tx1){const t=getTile(tx,ty);open=(t===T_AIR||t===T_LADDER||isLiq(t))&&!inside.has(tx+','+ty);}
      if(open){if(run<0)run=tx;}
      else if(run>=0){g.fillRect(run*TILE,ty*TILE,(tx-run)*TILE,TILE);run=-1;}
    }
  }
  g.restore();
}
/* объём: блик на верхних гранях, тени на нижних, мягкая тень в пустотах у стен */
let _sg=null;
function drawCaveShading(g,tx0,tx1,ty0,ty1){
  const cols=tx1-tx0+3,rows=ty1-ty0+3,gx0=tx0-1,gy0=ty0-1;
  if(!_sg||_sg.length<cols*rows)_sg=new Uint8Array(cols*rows);
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const t=getTile(gx0+x,gy0+y);_sg[y*cols+x]=(t===T_AIR||t===T_LADDER||isLiq(t)||t===T_LAVA)?0:1;}
  const S=(x,y)=>_sg[(y-gy0)*cols+(x-gx0)];
  for(let ty=Math.max(ty0,1);ty<=ty1;ty++){
    for(let tx=tx0;tx<=tx1;tx++){
      const x=tx*TILE,y=ty*TILE;
      if(S(tx,ty)){
        const up=!S(tx,ty-1),dn=!S(tx,ty+1),lf=!S(tx-1,ty),rt=!S(tx+1,ty);
        if(up){g.fillStyle='rgba(0,0,0,.5)';g.fillRect(x,y,TILE,1.2);g.fillStyle='rgba(255,255,255,.2)';g.fillRect(x,y+1.2,TILE,1.6);g.fillStyle='rgba(255,255,255,.06)';g.fillRect(x,y+2.8,TILE,3);}
        if(dn){g.fillStyle='rgba(0,0,0,.34)';g.fillRect(x,y+TILE-4,TILE,4);g.fillStyle='rgba(0,0,0,.14)';g.fillRect(x,y+TILE-8,TILE,4);g.fillStyle='rgba(0,0,0,.55)';g.fillRect(x,y+TILE-1.2,TILE,1.2);}
        if(lf){g.fillStyle='rgba(0,0,0,.45)';g.fillRect(x,y,1.2,TILE);g.fillStyle='rgba(255,255,255,.08)';g.fillRect(x+1.2,y,1.4,TILE);}
        if(rt){g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x+TILE-3,y,3,TILE);g.fillStyle='rgba(0,0,0,.5)';g.fillRect(x+TILE-1.2,y,1.2,TILE);}
        /* скруглённые выпуклые углы: тёмная фаска */
        g.fillStyle='rgba(0,0,0,.5)';
        if(up&&lf){g.beginPath();g.moveTo(x,y);g.lineTo(x+5,y);g.lineTo(x,y+5);g.closePath();g.fill();}
        if(up&&rt){g.beginPath();g.moveTo(x+TILE,y);g.lineTo(x+TILE-5,y);g.lineTo(x+TILE,y+5);g.closePath();g.fill();}
        if(dn&&lf){g.beginPath();g.moveTo(x,y+TILE);g.lineTo(x+5,y+TILE);g.lineTo(x,y+TILE-5);g.closePath();g.fill();}
        if(dn&&rt){g.beginPath();g.moveTo(x+TILE,y+TILE);g.lineTo(x+TILE-5,y+TILE);g.lineTo(x+TILE,y+TILE-5);g.closePath();g.fill();}
      }else{
        if(S(tx,ty-1)){g.fillStyle='rgba(0,0,0,.3)';g.fillRect(x,y,TILE,4);g.fillStyle='rgba(0,0,0,.15)';g.fillRect(x,y+4,TILE,6);g.fillStyle='rgba(0,0,0,.06)';g.fillRect(x,y+10,TILE,6);}
        if(S(tx-1,ty)){g.fillStyle='rgba(0,0,0,.2)';g.fillRect(x,y,4,TILE);g.fillStyle='rgba(0,0,0,.08)';g.fillRect(x+4,y,4,TILE);}
        if(S(tx+1,ty)){g.fillStyle='rgba(0,0,0,.2)';g.fillRect(x+TILE-4,y,4,TILE);g.fillStyle='rgba(0,0,0,.08)';g.fillRect(x+TILE-8,y,4,TILE);}
        if(S(tx,ty+1)){g.fillStyle='rgba(0,0,0,.12)';g.fillRect(x,y+TILE-3,TILE,3);}
      }
    }
  }
}
