'use strict';
/* ============================================================
   ЛИЛОВЫЕ НЕБЕСА — рисунки: текстуры пород, задние стены, руда,
   фон биомов, атмосфера, декор пещер, частицы.
   Свет сверху-слева, у каждой детали три тона (свет, основной, тень).
   Подключается в рисование Земли/Ада проверками G.dim===2 / bi>=10 / type 40–53.
   ============================================================ */
function lilIsTile(t){return t>=40&&t<=53;}

/* ---------- текстуры пород 32×32 (вызывается из makeTex) ---------- */
function lilacTex(g,type,v,R,base){
  const dots=(n,s0,s1,k,col)=>{for(let i=0;i<n;i++){const x=R()*32|0,y=R()*32|0,sz=Math.ceil(s0+R()*(s1-s0));g.fillStyle=shadeHex(col||base,(R()-0.5)*k);g.fillRect(x,y,sz,sz);}};
  const crack=(cc,w,n)=>{g.strokeStyle=cc;g.lineWidth=w;g.beginPath();let x=R()*32,y=R()*32;g.moveTo(x,y);for(let k=0;k<n;k++){x+=(R()-0.5)*14;y+=(R()-0.4)*12;g.lineTo(x,y);}g.stroke();};
  const lit=shadeHex(base,0.22),dk=shadeHex(base,-0.3);
  switch(type){
    case T_LSOD:{/* цветочный дёрн: лиловая земля, корешки, лепестки, светлые камешки */
      dots(70,1,2.2,0.26);
      for(let i=0;i<2;i++){const by=4+R()*24;g.fillStyle=hexA(dk,0.35);g.beginPath();g.moveTo(0,by);for(let x=0;x<=32;x+=4)g.lineTo(x,by+Math.sin(x*0.35+v+i)*1.4);for(let x=32;x>=0;x-=4)g.lineTo(x,by+2.4+Math.sin(x*0.5+v)*1);g.closePath();g.fill();}
      for(let i=0;i<3;i++){g.strokeStyle=hexA('#d8c0a8',0.32);g.lineWidth=0.7;g.beginPath();let x=R()*32,y=R()*8;g.moveTo(x,y);for(let k=0;k<3;k++){x+=(R()-0.5)*7;y+=4+R()*5;g.lineTo(x,y);}g.stroke();}
      for(let i=0;i<2;i++){const x=3+R()*26,y=3+R()*26,r=1.2+R()*1.5;g.fillStyle=shadeHex('#a898b4',(R()-0.5)*0.3);g.beginPath();g.ellipse(x,y,r*1.3,r,R(),0,TAU);g.fill();g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.ellipse(x+0.6,y+0.7,r,r*0.6,0,0,Math.PI);g.fill();g.fillStyle='rgba(255,255,255,.35)';g.fillRect(x-r*0.6,y-r*0.6,1.2,1);}
      const pc=['#ffb0d8','#fff0fa','#e0b0ff','#ffe0a0'];
      for(let i=0;i<4;i++){const x=R()*30,y=R()*30,a=R()*TAU,c=pc[(R()*4)|0];g.save();g.translate(x,y);g.rotate(a);g.fillStyle=hexA(c,0.55);g.beginPath();g.ellipse(0,0,2,1,0,0,TAU);g.fill();g.fillStyle=hexA('#ffffff',0.4);g.fillRect(-1,-0.6,1,0.6);g.restore();}
      break;}
    case T_LGLASS:{/* стеклокамень: крупные грани, преломление, искры */
      dots(26,1,2,0.25);
      for(let i=0;i<4;i++){const x=R()*32,y=R()*32,r=6+R()*8,n=4+(R()*3|0),pts=[];for(let k=0;k<n;k++){const a=k/n*TAU+R()*0.6;pts.push([x+Math.cos(a)*r,y+Math.sin(a)*r*0.85]);}
        const gr=g.createLinearGradient(x-r,y-r,x+r,y+r);gr.addColorStop(0,hexA(shadeHex(base,0.45),0.55));gr.addColorStop(0.5,hexA(base,0.25));gr.addColorStop(1,hexA(shadeHex(base,-0.4),0.55));
        g.fillStyle=gr;g.beginPath();pts.forEach((p,k)=>k?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill();
        g.strokeStyle='rgba(220,240,255,.22)';g.lineWidth=0.8;g.beginPath();g.moveTo(pts[n-1][0],pts[n-1][1]);g.lineTo(pts[0][0],pts[0][1]);g.lineTo(pts[1][0],pts[1][1]);g.stroke();
        g.strokeStyle='rgba(10,16,40,.35)';g.beginPath();g.moveTo(pts[1][0],pts[1][1]);g.lineTo(pts[2][0],pts[2][1]);g.stroke();}
      if(v===2){g.strokeStyle='rgba(230,245,255,.1)';g.lineWidth=1.4;g.beginPath();const o=R()*20;g.moveTo(o,0);g.lineTo(o+10,32);g.stroke();}
      for(let i=0;i<5;i++){g.fillStyle=R()<0.5?'rgba(220,245,255,.8)':'rgba(255,200,240,.6)';g.fillRect(R()*31|0,R()*31|0,1,1);}
      break;}
    case T_LWAX:{/* воск: мелкие соты со светлыми ободками, местами капля мёда */
      const r0=4.3,sx=r0*Math.sqrt(3),sy=r0*1.5;
      for(let j=-1;j<8;j++)for(let i=-1;i<6;i++){const cx=i*sx+((j&1)?sx/2:0)+(v%2)*2,cy=j*sy;
        const hex=(rr)=>{g.beginPath();for(let k=0;k<6;k++){const a=Math.PI/6+k*Math.PI/3;g.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);}g.closePath();};
        hex(r0);g.fillStyle=shadeHex(base,-0.12+(R()-0.5)*0.1);g.fill();
        hex(r0-1.3);const gr=g.createLinearGradient(cx-r0,cy-r0,cx+r0,cy+r0);gr.addColorStop(0,dk);gr.addColorStop(1,shadeHex(base,-0.1));g.fillStyle=gr;g.fill();
        g.strokeStyle=hexA(lit,0.55);g.lineWidth=0.8;g.beginPath();for(let k=3;k<6;k++){const a=Math.PI/6+k*Math.PI/3;g.lineTo(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0);}g.stroke();
        if(R()<0.12){hex(r0-1.6);g.fillStyle='rgba(255,170,30,.75)';g.fill();g.fillStyle='rgba(255,240,180,.7)';g.fillRect(cx-1.6,cy-1.8,1.4,1);}}
      break;}
    case T_LPORC:{/* фарфоровый камень: кракелюр, глянец, обломок росписи */
      dots(30,1,2,0.12);
      const gr=g.createLinearGradient(0,0,32,32);gr.addColorStop(0,'rgba(255,255,255,.18)');gr.addColorStop(0.5,'rgba(255,255,255,0)');gr.addColorStop(1,'rgba(40,20,50,.16)');g.fillStyle=gr;g.fillRect(0,0,32,32);
      for(let i=0;i<4;i++){g.strokeStyle=hexA(shadeHex(base,-0.42),0.6);g.lineWidth=0.6;g.beginPath();let x=R()*32,y=R()*32;g.moveTo(x,y);for(let k=0;k<4;k++){x+=(R()-0.5)*12;y+=(R()-0.5)*12;g.lineTo(x,y);}g.stroke();}
      if(v===1||v===3){const x=6+R()*18,y=6+R()*18,c=v===1?'#7a8ad8':'#d87aa8';
        g.strokeStyle=hexA(c,0.6);g.lineWidth=1.1;g.beginPath();g.arc(x,y,4,0.2,Math.PI*1.5);g.stroke();
        for(let k=0;k<5;k++){const a=k/5*TAU;g.fillStyle=hexA(c,0.55);g.beginPath();g.ellipse(x+Math.cos(a)*2.2,y+Math.sin(a)*2.2,1.4,0.8,a,0,TAU);g.fill();}
        g.fillStyle='#ffe090';g.beginPath();g.arc(x,y,0.9,0,TAU);g.fill();}
      g.fillStyle='rgba(255,255,255,.55)';g.beginPath();g.ellipse(9+R()*6,6+R()*4,4,1.2,-0.5,0,TAU);g.fill();
      break;}
    case T_LTHORN:{/* терновник: плотное сплетение одревесневших стеблей разной толщины, шипы, засохшие капли */
      g.fillStyle=shadeHex(base,-0.45);g.fillRect(0,0,32,32);
      const stem=(x0,y0,x1,y1,cx,cy,w)=>{
        g.strokeStyle=shadeHex(base,-0.2);g.lineWidth=w+1.6;g.beginPath();g.moveTo(x0,y0+0.8);g.quadraticCurveTo(cx,cy+0.8,x1,y1+0.8);g.stroke();
        g.strokeStyle=shadeHex(base,(R()-0.4)*0.25);g.lineWidth=w;g.beginPath();g.moveTo(x0,y0);g.quadraticCurveTo(cx,cy,x1,y1);g.stroke();
        g.strokeStyle=hexA(shadeHex(base,0.55),0.55);g.lineWidth=0.9;g.beginPath();g.moveTo(x0,y0-w*0.3);g.quadraticCurveTo(cx,cy-w*0.3,x1,y1-w*0.3);g.stroke();
        for(let k=1;k<3;k++){const t=k/3+R()*0.1,px=(1-t)*(1-t)*x0+2*t*(1-t)*cx+t*t*x1,py=(1-t)*(1-t)*y0+2*t*(1-t)*cy+t*t*y1,up=R()<0.5?-1:1;
          g.fillStyle='#e0c8a8';g.beginPath();g.moveTo(px-1.4,py);g.lineTo(px+1.2,py+up*(w*0.5+3.4));g.lineTo(px+1.6,py);g.closePath();g.fill();
          g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.moveTo(px+1.2,py+up*(w*0.5+3.4));g.lineTo(px+1.6,py);g.lineTo(px+0.6,py);g.closePath();g.fill();}};
      g.lineCap='round';
      for(let i=0;i<4;i++){const a=R()*Math.PI,cx=16+(R()-0.5)*12,cy=16+(R()-0.5)*12,l=20+R()*14,dx=Math.cos(a)*l,dy=Math.sin(a)*l;
        stem(cx-dx,cy-dy,cx+dx,cy+dy,cx+(R()-0.5)*16,cy+(R()-0.5)*16,2.4+R()*3);}
      if(R()<0.6){g.fillStyle='rgba(150,10,36,.55)';g.beginPath();g.ellipse(4+R()*24,4+R()*24,1.4,1.9,0,0,TAU);g.fill();}
      break;}
    case T_LMIRROR:{/* зеркальный сланец: пласты, серебряные блики, осколки */
      dots(30,1,2,0.2);
      for(let i=0;i<4;i++){const y0=3+i*8+R()*3;g.fillStyle=hexA(i%2?dk:shadeHex(base,0.1),0.55);g.beginPath();g.moveTo(0,y0);for(let x=0;x<=32;x+=8)g.lineTo(x,y0+(R()-0.5)*2);g.lineTo(32,y0+3);g.lineTo(0,y0+3);g.closePath();g.fill();
        g.fillStyle='rgba(220,240,250,.22)';g.fillRect(0,y0,32,0.8);}
      for(let i=0;i<3;i++){const x=R()*26+2,y=R()*26+2,w=3+R()*4;const gr=g.createLinearGradient(x,y,x+w,y+w);gr.addColorStop(0,'rgba(255,255,255,.8)');gr.addColorStop(0.5,'rgba(180,220,235,.6)');gr.addColorStop(1,'rgba(60,90,100,.6)');
        g.fillStyle=gr;g.beginPath();g.moveTo(x,y);g.lineTo(x+w,y+1);g.lineTo(x+w*0.6,y+w*0.7);g.closePath();g.fill();}
      break;}
    case T_LCRADLE:{/* пуховая плоть: мягкие складки, тонкие лиловые жилки, пушок */
      dots(40,1,2.4,0.22);
      for(let i=0;i<3;i++){const x=R()*32,y=R()*32,r=5+R()*6;const gr=g.createRadialGradient(x-r*0.3,y-r*0.3,0.5,x,y,r);gr.addColorStop(0,hexA(shadeHex(base,0.28),0.6));gr.addColorStop(1,hexA(base,0));g.fillStyle=gr;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();
        g.strokeStyle=hexA(dk,0.45);g.lineWidth=0.9;g.beginPath();g.arc(x,y,r*0.9,0.3,1.6);g.stroke();}
      for(let i=0;i<2;i++){g.strokeStyle='rgba(110,40,140,.55)';g.lineWidth=0.9;g.beginPath();let x=R()*32,y=R()*32;g.moveTo(x,y);for(let k=0;k<4;k++){x+=(R()-0.5)*12;y+=(R()-0.5)*12;g.quadraticCurveTo(x+(R()-0.5)*6,y+(R()-0.5)*6,x,y);}g.stroke();}
      for(let i=0;i<5;i++){const x=R()*30,y=R()*30;g.strokeStyle='rgba(255,240,255,.4)';g.lineWidth=0.6;g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+2,y-2,x+4,y-1);g.moveTo(x,y);g.quadraticCurveTo(x+1,y-3,x+3,y-4);g.stroke();}
      for(let i=0;i<4;i++){g.fillStyle='rgba(60,20,50,.4)';g.beginPath();g.ellipse(R()*32,R()*32,0.9,0.6,0,0,TAU);g.fill();}
      break;}
    case T_LROOT:{/* сплетённые корни */
      g.fillStyle=shadeHex(base,-0.5);g.fillRect(0,0,32,32);
      for(let i=0;i<5;i++){const x0=R()*32,c=shadeHex(base,(R()-0.4)*0.3),w=3+R()*3;
        g.strokeStyle=c;g.lineWidth=w;g.lineCap='round';g.beginPath();g.moveTo(x0,-2);g.bezierCurveTo(x0+(R()-0.5)*24,10,x0+(R()-0.5)*24,22,x0+(R()-0.5)*14,34);g.stroke();
        g.strokeStyle=hexA(lit,0.5);g.lineWidth=0.9;g.beginPath();g.moveTo(x0-w*0.3,-2);g.bezierCurveTo(x0-w*0.3+(R()-0.5)*6,10,x0-w*0.3,22,x0-w*0.3,34);g.stroke();}
      for(let i=0;i<6;i++){g.fillStyle='rgba(20,10,4,.45)';g.fillRect(R()*31|0,R()*31|0,2,1);}
      break;}
    case T_LQUARTZ:{/* хрустальный столб: три грани, внутреннее свечение, вертикальные блики */
      const gl=g.createLinearGradient(0,0,32,0);gl.addColorStop(0,shadeHex(base,0.35));gl.addColorStop(0.33,shadeHex(base,0.12));gl.addColorStop(0.34,base);gl.addColorStop(0.7,shadeHex(base,-0.08));gl.addColorStop(0.71,shadeHex(base,-0.3));gl.addColorStop(1,shadeHex(base,-0.42));
      g.fillStyle=gl;g.fillRect(0,0,32,32);
      const ig=g.createRadialGradient(16,16,1,16,16,16);ig.addColorStop(0,'rgba(255,255,255,.35)');ig.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=ig;g.fillRect(0,0,32,32);
      g.fillStyle='rgba(255,255,255,.55)';g.fillRect(3+v,0,1.4,32);g.fillStyle='rgba(255,255,255,.25)';g.fillRect(14+v,0,1,32);
      g.fillStyle='rgba(20,40,80,.35)';g.fillRect(22,0,1,32);
      if(v===2){g.strokeStyle='rgba(255,255,255,.35)';g.lineWidth=0.8;g.beginPath();g.moveTo(4,20);g.lineTo(28,14);g.stroke();}
      for(let i=0;i<3;i++){g.fillStyle='rgba(255,220,250,.8)';g.fillRect(R()*30|0,R()*31|0,1,1);}
      break;}
    case T_LCOMB:{/* медовые соты: крупные ячейки с глянцевым мёдом */
      g.fillStyle=shadeHex('#a87c2c',-0.15);g.fillRect(0,0,32,32);
      const r0=7,sx=r0*Math.sqrt(3),sy=r0*1.5;
      for(let j=-1;j<4;j++)for(let i=-1;i<4;i++){const cx=i*sx+((j&1)?sx/2:0)+(v%2)*3,cy=j*sy;
        const hex=(rr)=>{g.beginPath();for(let k=0;k<6;k++){const a=Math.PI/6+k*Math.PI/3;g.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);}g.closePath();};
        hex(r0);g.fillStyle='#c89a3a';g.fill();
        hex(r0-1.6);const gr=g.createRadialGradient(cx-2,cy-2,0.5,cx,cy,r0);gr.addColorStop(0,'#ffe080');gr.addColorStop(0.45,base);gr.addColorStop(1,shadeHex(base,-0.35));g.fillStyle=gr;g.fill();
        g.fillStyle='rgba(255,255,230,.75)';g.beginPath();g.ellipse(cx-2,cy-2.4,1.8,0.9,-0.6,0,TAU);g.fill();
        g.strokeStyle='rgba(255,230,160,.5)';g.lineWidth=0.7;hex(r0);g.stroke();}
      break;}
    case T_LTOY:{/* кукольный кирпич: пастельные блоки со скруглением и глянцем */
      const pal=['#d88aa8','#8ac8b4','#b8a0dc','#e8c890','#9ab8e8'];
      g.fillStyle='#5a4058';g.fillRect(0,0,32,32);
      for(let r=0;r<2;r++){const off=(r+v)%2?8:0;
        for(let k=-1;k<2;k++){const bx=off+k*16+1,by=r*16+1,bw=14,bh=14,c=pal[(R()*pal.length)|0];
          g.fillStyle=shadeHex(c,-0.3);g.beginPath();g.roundRect?g.roundRect(bx,by+1,bw,bh,3):g.rect(bx,by+1,bw,bh);g.fill();
          g.fillStyle=c;g.beginPath();g.roundRect?g.roundRect(bx,by,bw,bh-1,3):g.rect(bx,by,bw,bh-1);g.fill();
          g.fillStyle='rgba(255,255,255,.4)';g.fillRect(bx+2,by+1.5,bw-6,1.4);g.fillRect(bx+1.5,by+2,1.2,bh-7);
          g.fillStyle='rgba(0,0,0,.14)';g.fillRect(bx+2,by+bh-3,bw-3,1.2);}}
      if(v===3){g.strokeStyle='rgba(60,30,50,.55)';g.lineWidth=0.7;g.beginPath();g.moveTo(10,3);g.lineTo(14,9);g.lineTo(12,13);g.stroke();}
      break;}
    case T_LBRIAR:{/* шипастая лоза: толстые стебли с крупными шипами */
      g.fillStyle=shadeHex(base,-0.35);g.fillRect(0,0,32,32);
      for(let i=0;i<3;i++){const y0=4+i*11+R()*3,dir=R()<0.5?1:-1;
        const path=(dy)=>{g.beginPath();g.moveTo(-2,y0+dy);g.bezierCurveTo(10,y0+dy+dir*7,22,y0+dy-dir*7,34,y0+dy);};
        g.strokeStyle=shadeHex(base,-0.15);g.lineWidth=6;path(1);g.stroke();
        g.strokeStyle=base;g.lineWidth=4.4;path(0);g.stroke();
        g.strokeStyle=hexA(shadeHex(base,0.5),0.7);g.lineWidth=1;path(-1.4);g.stroke();
        for(let k=0;k<3;k++){const x=4+k*11+R()*4,y=y0+dir*Math.sin((x/32)*Math.PI*2)*3,up=R()<0.5?-1:1;
          g.fillStyle='#e8d8b0';g.beginPath();g.moveTo(x-2,y);g.lineTo(x+0.5,y+up*5);g.lineTo(x+2,y);g.closePath();g.fill();
          g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.moveTo(x+0.5,y+up*5);g.lineTo(x+2,y);g.lineTo(x+0.6,y);g.closePath();g.fill();}}
      break;}
    case T_LSILVER:{/* серебряная жила: ртутный блеск, мягкие волны отражения, отражённое лиловое небо */
      const gr=g.createLinearGradient(0,0,8,32);gr.addColorStop(0,shadeHex(base,0.25));gr.addColorStop(0.5,shadeHex(base,-0.05));gr.addColorStop(1,shadeHex(base,-0.35));g.fillStyle=gr;g.fillRect(0,0,32,32);
      for(let i=0;i<3;i++){const y0=4+i*10+R()*4;g.fillStyle=i===1?'rgba(200,160,255,.22)':'rgba(255,255,255,.28)';g.beginPath();g.moveTo(0,y0);
        for(let x=0;x<=32;x+=4)g.lineTo(x,y0+Math.sin(x*0.25+v+i*2)*2);for(let x=32;x>=0;x-=4)g.lineTo(x,y0+1.6+Math.sin(x*0.25+v+i*2+0.6)*2);g.closePath();g.fill();}
      for(let i=0;i<5;i++){const x=R()*30,y=R()*30,r=1+R()*2;const rg=g.createRadialGradient(x-r*0.3,y-r*0.3,0.2,x,y,r);rg.addColorStop(0,'#ffffff');rg.addColorStop(0.6,shadeHex(base,0.2));rg.addColorStop(1,shadeHex(base,-0.3));
        g.fillStyle=rg;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();}
      g.fillStyle='rgba(20,40,50,.3)';g.beginPath();g.ellipse(R()*32,R()*32,4,1.2,R(),0,TAU);g.fill();
      break;}
    case T_LDOWN:{/* пух: пушистые комья (свет сверху-слева, тень снизу-справа) и пёрышки */
      g.fillStyle=dk;g.fillRect(0,0,32,32);
      for(let i=0;i<7;i++){const x=R()*32,y=R()*32,r=5+R()*4;
        g.fillStyle=hexA(shadeHex(base,-0.35),0.7);g.beginPath();g.arc(x+1.4,y+1.8,r,0,TAU);g.fill();
        const gr2=g.createRadialGradient(x-r*0.4,y-r*0.45,0.5,x,y,r);gr2.addColorStop(0,shadeHex(base,0.38));gr2.addColorStop(0.55,base);gr2.addColorStop(1,shadeHex(base,-0.12));
        g.fillStyle=gr2;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();
        g.strokeStyle=hexA(shadeHex(base,0.5),0.5);g.lineWidth=0.5;for(let k=0;k<5;k++){const a=Math.PI*1.05+k*0.28;g.beginPath();g.moveTo(x+Math.cos(a)*r*0.7,y+Math.sin(a)*r*0.7);g.lineTo(x+Math.cos(a)*(r+1.4),y+Math.sin(a)*(r+1.4));g.stroke();}}
      for(let i=0;i<2;i++){const x=R()*32,y=R()*32,a=R()*TAU,l=6+R()*4;g.save();g.translate(x,y);g.rotate(a);
        g.strokeStyle='rgba(120,90,140,.6)';g.lineWidth=0.7;g.beginPath();g.moveTo(-l/2,0);g.lineTo(l/2,0);g.stroke();
        for(let k=-3;k<=3;k++){g.strokeStyle='rgba(255,245,255,.5)';g.lineWidth=0.5;g.beginPath();g.moveTo(k*l/7,0);g.quadraticCurveTo(k*l/7+1,-2,k*l/7+2.4,-3);g.moveTo(k*l/7,0);g.quadraticCurveTo(k*l/7+1,2,k*l/7+2.4,3);g.stroke();}
        g.restore();}
      break;}
  }
}

/* ---------- задние стены пещер биомов 10–16 ---------- */
function lilacWall(bi,v){
  const c=texCanvas(),g=c.getContext('2d'),R=texRng(bi*3571+v*911+3);
  const rock=LIL_ROCK[bi-10]||T_LSOD;
  const base=shadeHex(TILECOL[rock][v%3],-0.6);
  g.fillStyle=base;g.fillRect(0,0,32,32);
  for(let i=0;i<46;i++){g.fillStyle=shadeHex(base,(R()-0.5)*0.45);g.fillRect(R()*32|0,R()*32|0,1+(R()*2|0),1+(R()*2|0));}
  for(let i=0;i<3;i++){g.fillStyle=hexA(shadeHex(base,-0.35),0.5);g.beginPath();g.ellipse(R()*32,R()*32,3+R()*6,2+R()*4,R()*3,0,TAU);g.fill();}
  const b=bi-10;
  if(b===0){/* тени корней и лепестки */
    g.strokeStyle=hexA(shadeHex(base,-0.4),0.6);g.lineWidth=1.4;g.beginPath();const x=R()*32;g.moveTo(x,0);g.quadraticCurveTo(x+6,16,x-3,32);g.stroke();
    for(let i=0;i<2;i++){g.fillStyle='rgba(255,170,220,.16)';g.beginPath();g.ellipse(R()*32,R()*32,1.6,0.9,R()*3,0,TAU);g.fill();}}
  else if(b===1){for(let i=0;i<2;i++){g.fillStyle='rgba(170,220,255,.2)';const x=R()*32,y=R()*32;g.beginPath();g.moveTo(x,y-5);g.lineTo(x+2,y);g.lineTo(x,y+5);g.lineTo(x-2,y);g.closePath();g.fill();}}
  else if(b===2){/* соты на стене */
    const r0=5.2,sx=r0*Math.sqrt(3),sy=r0*1.5;g.strokeStyle=hexA(shadeHex(base,0.25),0.4);g.lineWidth=0.8;
    for(let j=-1;j<7;j++)for(let i=-1;i<5;i++){const cx=i*sx+((j&1)?sx/2:0),cy=j*sy;g.beginPath();for(let k=0;k<6;k++){const a=Math.PI/6+k*Math.PI/3;g.lineTo(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0);}g.closePath();g.stroke();}}
  else if(b===3){/* обои с узором */
    g.fillStyle=hexA(shadeHex(base,0.18),0.35);for(let y=2;y<32;y+=8)for(let x=(y/8%2)*4+2;x<32;x+=8){g.beginPath();g.arc(x,y,1.2,0,TAU);g.fill();}
    g.fillStyle=hexA(shadeHex(base,-0.3),0.4);g.fillRect(0,30,32,2);}
  else if(b===4){g.strokeStyle=hexA('#3a0a1a',0.6);g.lineWidth=1.6;g.beginPath();let x=0,y=R()*32;g.moveTo(x,y);for(let k=0;k<4;k++){x+=8;y+=(R()-0.5)*10;g.lineTo(x,y);}g.stroke();
    g.fillStyle='rgba(200,40,70,.18)';g.beginPath();g.arc(R()*32,R()*32,2,0,TAU);g.fill();}
  else if(b===5){g.fillStyle='rgba(180,220,230,.12)';for(let i=0;i<3;i++)g.fillRect(0,4+i*10+R()*3,32,1);}
  else{/* рёбра колыбели */
    g.strokeStyle=hexA(shadeHex(base,0.2),0.35);g.lineWidth=2;g.beginPath();const x=8+R()*16;g.moveTo(x,0);g.lineTo(x,32);g.stroke();
    g.strokeStyle='rgba(140,60,160,.3)';g.lineWidth=0.8;g.beginPath();g.moveTo(0,R()*32);g.quadraticCurveTo(16,R()*32,32,R()*32);g.stroke();}
  return c;
}

/* ---------- самородки Лиловых небес: у каждой руды свой рисунок ---------- */
function drawLilacOre(g,x,y,size,o){
  const h=hash2(Math.floor(x/32),Math.floor(y/32),o.id*31+5);
  const C=o.color,L=shadeHex(C,0.35),D=shadeHex(C,-0.38),GL=o.glow||'#ffffff';
  const sc=size/32;
  g.save();g.translate(x,y);g.scale(sc,sc);
  g.fillStyle='rgba(0,0,0,.24)';g.beginPath();g.ellipse(16,17,11,9,(h%7)*0.4,0,TAU);g.fill();
  const n=2+(h%2);
  for(let k=0;k<n;k++){
    const hk=hash2(h,k,77),cx=8+((hk%1000)/1000)*16,cy=9+(((hk>>10)%1000)/1000)*14,s=(k===0?1.15:0.8)*(0.85+((hk>>20)%5)*0.06),rot=((hk%628)/100)*0.5-0.25;
    g.save();g.translate(cx,cy);g.rotate(rot);g.scale(s,s);
    lilOreShape(g,o.sh,C,L,D,GL,hk);
    g.restore();
  }
  if(o.rar>=2){const a=0.75+0.25*((h>>>9)%3)/2;g.fillStyle=hexA(GL,0.9*a);const sx=8+(h%16),sy=8+((h>>6)%16);g.fillRect(sx-3,sy-0.5,6,1);g.fillRect(sx-0.5,sy-3,1,6);}
  g.restore();
}
function lilOreShape(g,sh,C,L,D,GL,hk){
  const shadow=(fn)=>{g.save();g.translate(0.9,1.2);g.fillStyle='rgba(0,0,0,.45)';fn();g.fill();g.restore();};
  switch(sh){
    case 'drop':{const p=()=>{g.beginPath();g.moveTo(0,-6);g.bezierCurveTo(3,-2,5,1,5,3);g.arc(0,3,5,0,Math.PI);g.bezierCurveTo(-5,1,-3,-2,0,-6);g.closePath();};
      shadow(p);const gr=g.createRadialGradient(-1.6,1,0.5,0,2,6);gr.addColorStop(0,L);gr.addColorStop(0.6,C);gr.addColorStop(1,D);g.fillStyle=gr;p();g.fill();
      g.fillStyle='rgba(255,255,255,.85)';g.beginPath();g.ellipse(-1.8,1,1.1,1.8,0.3,0,TAU);g.fill();break;}
    case 'pollen':{shadow(()=>{g.beginPath();g.arc(0,0,4.6,0,TAU);});
      for(let k=0;k<10;k++){const a=k/10*TAU;g.fillStyle=k<5?L:D;g.beginPath();g.arc(Math.cos(a)*4.6,Math.sin(a)*4.6,1.2,0,TAU);g.fill();}
      const gr=g.createRadialGradient(-1.5,-1.5,0.5,0,0,4.6);gr.addColorStop(0,L);gr.addColorStop(0.7,C);gr.addColorStop(1,D);g.fillStyle=gr;g.beginPath();g.arc(0,0,4.4,0,TAU);g.fill();
      g.fillStyle=hexA(D,0.6);for(let k=0;k<4;k++){g.beginPath();g.arc(Math.cos(k*1.7)*2,Math.sin(k*1.7)*2,0.7,0,TAU);g.fill();}
      g.fillStyle='rgba(255,255,255,.7)';g.fillRect(-2.4,-2.6,1.6,1);break;}
    case 'petal':{for(let k=0;k<3;k++){g.save();g.rotate(k*2.1);const p=()=>{g.beginPath();g.moveTo(0,0);g.bezierCurveTo(-4,-3,-3,-8,0,-8.5);g.bezierCurveTo(3,-8,4,-3,0,0);};
        shadow(p);const gr=g.createLinearGradient(-3,-8,3,0);gr.addColorStop(0,L);gr.addColorStop(0.6,C);gr.addColorStop(1,D);g.fillStyle=gr;p();g.fill();
        g.strokeStyle=hexA(D,0.6);g.lineWidth=0.5;g.beginPath();g.moveTo(0,-1);g.lineTo(0,-7);g.stroke();g.restore();}
      g.fillStyle=GL;g.beginPath();g.arc(0,0,1.3,0,TAU);g.fill();break;}
    case 'pearl':{shadow(()=>{g.beginPath();g.arc(0,0,4.8,0,TAU);});
      const gr=g.createRadialGradient(-1.8,-1.8,0.4,0,0,5);gr.addColorStop(0,'#ffffff');gr.addColorStop(0.35,L);gr.addColorStop(0.8,C);gr.addColorStop(1,D);g.fillStyle=gr;g.beginPath();g.arc(0,0,4.8,0,TAU);g.fill();
      g.strokeStyle='rgba(255,190,240,.35)';g.lineWidth=0.8;g.beginPath();g.arc(0,0,3.4,0.6,2.2);g.stroke();
      g.fillStyle='rgba(255,255,255,.95)';g.beginPath();g.arc(-1.7,-1.9,1,0,TAU);g.fill();break;}
    case 'shard':{const p=()=>{g.beginPath();g.moveTo(0,-8);g.lineTo(3.2,-1);g.lineTo(1.6,6);g.lineTo(-2,5);g.lineTo(-3.2,-2);g.closePath();};
      shadow(p);g.fillStyle=C;p();g.fill();
      g.fillStyle=L;g.beginPath();g.moveTo(0,-8);g.lineTo(-3.2,-2);g.lineTo(-2,5);g.lineTo(-0.4,5.4);g.closePath();g.fill();
      g.fillStyle=D;g.beginPath();g.moveTo(0,-8);g.lineTo(3.2,-1);g.lineTo(1.6,6);g.lineTo(0.8,5.8);g.closePath();g.fill();
      g.fillStyle='rgba(255,255,255,.8)';g.fillRect(-1.6,-4,0.9,5);break;}
    case 'hex':{const hx=(r)=>{g.beginPath();for(let k=0;k<6;k++){const a=Math.PI/6+k*Math.PI/3;g.lineTo(Math.cos(a)*r,Math.sin(a)*r);}g.closePath();};
      shadow(()=>hx(5.2));g.fillStyle=D;hx(5.2);g.fill();g.fillStyle=C;hx(4);g.fill();
      g.fillStyle=L;g.beginPath();g.moveTo(-4,-2.3);g.lineTo(0,-4.6);g.lineTo(0,0);g.closePath();g.fill();
      g.fillStyle='rgba(255,255,255,.75)';g.fillRect(-2.4,-2.6,1.4,1);break;}
    case 'nugget':{const p=()=>{g.beginPath();g.moveTo(-5,0);g.quadraticCurveTo(-5,-5,-1,-5);g.quadraticCurveTo(2,-6,4,-3);g.quadraticCurveTo(6,1,3,4);g.quadraticCurveTo(-1,6,-4,3);g.closePath();};
      shadow(p);const gr=g.createLinearGradient(-5,-5,5,5);gr.addColorStop(0,L);gr.addColorStop(0.5,C);gr.addColorStop(1,D);g.fillStyle=gr;p();g.fill();
      g.fillStyle=hexA(D,0.5);g.beginPath();g.arc(1.6,1.4,1,0,TAU);g.arc(-2,1.8,0.7,0,TAU);g.fill();
      g.fillStyle='rgba(255,255,240,.9)';g.fillRect(-3,-3.4,2,1);break;}
    case 'button':{shadow(()=>{g.beginPath();g.arc(0,0,5,0,TAU);});
      g.fillStyle=D;g.beginPath();g.arc(0,0,5,0,TAU);g.fill();const gr=g.createRadialGradient(-1.5,-1.5,0.5,0,0,4.6);gr.addColorStop(0,L);gr.addColorStop(1,C);g.fillStyle=gr;g.beginPath();g.arc(0,0,4.2,0,TAU);g.fill();
      g.fillStyle=D;for(const [a,b] of [[-1.3,-1.3],[1.3,-1.3],[-1.3,1.3],[1.3,1.3]]){g.beginPath();g.arc(a,b,0.75,0,TAU);g.fill();}
      g.fillStyle='rgba(255,255,255,.7)';g.fillRect(-3,-3.2,1.6,0.9);break;}
    case 'gear':{const p=()=>{g.beginPath();for(let k=0;k<16;k++){const a=k/16*TAU,r=k%2?5.6:4.2;g.lineTo(Math.cos(a)*r,Math.sin(a)*r);}g.closePath();};
      shadow(p);const gr=g.createLinearGradient(-5,-5,5,5);gr.addColorStop(0,L);gr.addColorStop(0.5,C);gr.addColorStop(1,D);g.fillStyle=gr;p();g.fill();
      g.fillStyle=D;g.beginPath();g.arc(0,0,1.6,0,TAU);g.fill();g.fillStyle='rgba(255,255,230,.8)';g.fillRect(-3.2,-3,1.5,0.9);break;}
    case 'eye':{shadow(()=>{g.beginPath();g.arc(0,0,5,0,TAU);});
      const gr=g.createRadialGradient(-1.6,-1.6,0.5,0,0,5);gr.addColorStop(0,'#ffffff');gr.addColorStop(1,'#d8d0e0');g.fillStyle=gr;g.beginPath();g.arc(0,0,5,0,TAU);g.fill();
      const ang=(hk%628)/100,ex=Math.cos(ang)*1.2,ey=Math.sin(ang*1.3)*0.8;
      g.fillStyle=C;g.beginPath();g.arc(ex,ey,2.6,0,TAU);g.fill();g.fillStyle=D;g.beginPath();g.arc(ex,ey,2.6,0.2,Math.PI);g.fill();
      g.fillStyle='#0a0612';g.beginPath();g.arc(ex,ey,1.2,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.95)';g.fillRect(ex-1.4,ey-1.6,1,1);break;}
    case 'thorn':{const p=()=>{g.beginPath();g.moveTo(-5,3);g.lineTo(0,-8);g.lineTo(5,3);g.quadraticCurveTo(0,5,-5,3);g.closePath();};
      shadow(p);g.fillStyle=C;p();g.fill();g.fillStyle=L;g.beginPath();g.moveTo(-5,3);g.lineTo(0,-8);g.lineTo(-0.6,3.6);g.closePath();g.fill();
      g.fillStyle=D;g.beginPath();g.moveTo(5,3);g.lineTo(0,-8);g.lineTo(1,3.8);g.closePath();g.fill();g.fillStyle='rgba(255,255,255,.7)';g.fillRect(-1.8,-3,0.8,3);break;}
    case 'heart':{const p=()=>{g.beginPath();g.moveTo(0,5);g.bezierCurveTo(-7,0,-4,-6,0,-2.6);g.bezierCurveTo(4,-6,7,0,0,5);g.closePath();};
      shadow(p);const gr=g.createRadialGradient(-2,-2,0.5,0,0,6);gr.addColorStop(0,L);gr.addColorStop(0.6,C);gr.addColorStop(1,D);g.fillStyle=gr;p();g.fill();
      const pu=0.6;g.fillStyle=hexA(GL,0.25+0.35*pu);g.beginPath();g.arc(0,0,2,0,TAU);g.fill();
      g.fillStyle='rgba(255,255,255,.85)';g.beginPath();g.ellipse(-2.4,-1.6,1.2,0.8,-0.5,0,TAU);g.fill();break;}
    case 'star':{const p=()=>{g.beginPath();for(let k=0;k<10;k++){const a=-Math.PI/2+k/10*TAU,r=k%2?2.6:6.4;g.lineTo(Math.cos(a)*r,Math.sin(a)*r);}g.closePath();};
      shadow(p);g.fillStyle=C;p();g.fill();g.fillStyle=L;g.beginPath();g.moveTo(0,0);for(let k=6;k<=10;k++){const a=-Math.PI/2+k/10*TAU,r=k%2?2.6:6.4;g.lineTo(Math.cos(a)*r,Math.sin(a)*r);}g.closePath();g.fill();
      g.fillStyle=hexA('#c88aff',0.5);g.beginPath();g.moveTo(0,0);for(let k=1;k<=5;k++){const a=-Math.PI/2+k/10*TAU,r=k%2?2.6:6.4;g.lineTo(Math.cos(a)*r,Math.sin(a)*r);}g.closePath();g.fill();
      g.fillStyle='#ffffff';g.beginPath();g.arc(0,0,1.2,0,TAU);g.fill();break;}
    default:{g.fillStyle=C;g.beginPath();g.arc(0,0,4,0,TAU);g.fill();}
  }
}

/* ---------- фон биомов (экранные слои за пещерой) ---------- */
function drawLilacBackdrop(g,W,H,cam,bi,T,shift){
  drawLilacBackdropI(g,W,H,cam,bi,T,shift);
  drawLilacTruthBackdrop(g,W,H,cam,veilT,T);
}
function drawLilacBackdropI(g,W,H,cam,bi,T,shift){
  const b=bi-10;
  if(b===0){
    /* Цветущие луга: косые лучи света, гигантские цветы вдали, летящие семена */
    g.globalCompositeOperation='lighter';
    for(let k=0;k<3;k++){const x0=((k*0.37+0.1)*W+Math.sin(T*0.07+k)*40-cam.x*0.05)%(W*1.4);
      const gr=g.createLinearGradient(x0,0,x0+H*0.35,H);gr.addColorStop(0,'rgba(255,220,240,.10)');gr.addColorStop(1,'rgba(255,220,240,0)');
      g.fillStyle=gr;g.beginPath();g.moveTo(x0,0);g.lineTo(x0+70,0);g.lineTo(x0+70+H*0.4,H);g.lineTo(x0+H*0.4-30,H);g.closePath();g.fill();}
    g.globalCompositeOperation='source-over';
    for(let L=0;L<2;L++){
      const px=shift(0.08+L*0.08,520),col=L?'rgba(120,80,140,.38)':'rgba(150,110,170,.22)';
      for(let i=-1;i<5;i++){const xx=px+i*190+L*80,hh=H*(0.45+(((i*37+L*13)%30)/100)),sw=Math.sin(T*0.4+i+L)*6;
        g.strokeStyle=col;g.lineWidth=4+L*2;g.beginPath();g.moveTo(xx,H);g.quadraticCurveTo(xx+20+sw,H-hh*0.5,xx+sw,H-hh);g.stroke();
        g.fillStyle=col;for(let p=0;p<6;p++){const a=p/6*TAU+T*0.05;g.beginPath();g.ellipse(xx+sw+Math.cos(a)*18*(1+L*0.3),H-hh+Math.sin(a)*12*(1+L*0.3),13*(1+L*0.3),7*(1+L*0.3),a,0,TAU);g.fill();}
        g.fillStyle=L?'rgba(255,220,140,.35)':'rgba(255,220,140,.2)';g.beginPath();g.arc(xx+sw,H-hh,6+L*2,0,TAU);g.fill();}}
    for(let i=0;i<14;i++){const sx=((hash2(i,1,301)%1000)/1000*W*1.3+T*(8+i%5)-cam.x*0.1)%(W*1.3)-W*0.15,sy=(hash2(i,2,302)%1000)/1000*H+Math.sin(T*0.8+i)*14;
      g.strokeStyle='rgba(255,255,255,.3)';g.lineWidth=0.8;g.beginPath();for(let k=0;k<5;k++){const a=-Math.PI/2+(k-2)*0.4;g.moveTo(sx,sy);g.lineTo(sx+Math.cos(a)*4,sy+Math.sin(a)*4);}g.stroke();
      g.fillStyle='rgba(255,255,255,.45)';g.fillRect(sx-0.5,sy,1,3);}
  }else if(b===1){
    /* Хрустальный сад: стеклянные деревья и радужные лучи */
    for(let L=0;L<2;L++){const px=shift(0.12+L*0.1,560);
      for(let i=-1;i<5;i++){const xx=px+i*200+L*90,hh=H*(0.5+(((i*41+L*7)%30)/100)),w=14+L*6;
        g.fillStyle=L?'rgba(70,90,150,.42)':'rgba(90,110,170,.25)';
        g.beginPath();g.moveTo(xx-w,H);g.lineTo(xx-w*0.3,H-hh);g.lineTo(xx+w*0.3,H-hh-10);g.lineTo(xx+w,H);g.closePath();g.fill();
        for(let k=0;k<3;k++){const by=H-hh*(0.4+k*0.2),dir=k%2?1:-1,bl=40+k*10;g.beginPath();g.moveTo(xx,by);g.lineTo(xx+dir*bl,by-bl*0.7);g.lineTo(xx+dir*bl*0.8,by-bl*0.5);g.lineTo(xx+dir*4,by+8);g.closePath();g.fill();}
        g.strokeStyle='rgba(200,230,255,'+(0.12+L*0.08)+')';g.lineWidth=1.2;g.beginPath();g.moveTo(xx-w*0.3,H-hh);g.lineTo(xx-w,H);g.stroke();}}
    g.globalCompositeOperation='lighter';
    const rb=['rgba(255,120,160,','rgba(255,220,120,','rgba(120,255,200,','rgba(120,180,255,','rgba(200,140,255,'];
    for(let k=0;k<5;k++){const x0=W*0.15+k*7-cam.x*0.03%W+Math.sin(T*0.1)*30;g.fillStyle=rb[k]+(0.035+0.015*Math.sin(T*0.7+k))+')';
      g.beginPath();g.moveTo(x0,0);g.lineTo(x0+8,0);g.lineTo(x0+8+H*0.6,H);g.lineTo(x0+H*0.6,H);g.closePath();g.fill();}
    g.globalCompositeOperation='source-over';
  }else if(b===2){
    /* Медовые соты: огромная решётка сот, тёплое свечение, тягучие нити мёда */
    const gl=g.createLinearGradient(0,H*0.4,0,H);gl.addColorStop(0,'rgba(255,170,40,0)');gl.addColorStop(1,'rgba(255,160,30,.14)');g.fillStyle=gl;g.fillRect(0,H*0.4,W,H*0.6);
    for(let L=0;L<2;L++){const r0=L?70:46,sx=r0*Math.sqrt(3),sy=r0*1.5,ox=shift(0.1+L*0.08,sx*2),oy=-((cam.y*(0.1+L*0.08))%(sy*2));
      g.strokeStyle=L?'rgba(255,190,80,.16)':'rgba(255,190,80,.08)';g.lineWidth=L?5:3;
      for(let j=-1;j<H/sy+2;j++)for(let i=-1;i<W/sx+2;i++){const cx=ox+i*sx+((j&1)?sx/2:0),cy=oy+j*sy;
        g.beginPath();for(let k=0;k<6;k++){const a=Math.PI/6+k*Math.PI/3;g.lineTo(cx+Math.cos(a)*r0,cy+Math.sin(a)*r0);}g.closePath();g.stroke();
        if(L&&hash2(i,j,505)%7===0){g.fillStyle='rgba(255,170,40,'+(0.05+0.03*Math.sin(T+i+j))+')';g.fill();}}}
    for(let i=0;i<6;i++){const xx=shift(0.25,600)+i*130+((i*53)%40),len=H*(0.1+((i*37)%25)/100)*(0.8+0.2*Math.sin(T*0.6+i));
      g.strokeStyle='rgba(255,180,50,.28)';g.lineWidth=3;g.beginPath();g.moveTo(xx,0);g.lineTo(xx,len);g.stroke();g.fillStyle='rgba(255,190,60,.4)';g.beginPath();g.arc(xx,len+3,4,0,TAU);g.fill();}
  }else if(b===3){
    /* Кукольный городок: силуэты домиков с окнами и гирлянды */
    for(let L=0;L<2;L++){const px=shift(0.1+L*0.1,640),base=H*(0.72+L*0.12);
      g.fillStyle=L?'rgba(40,24,44,.7)':'rgba(70,46,74,.45)';
      for(let i=-1;i<7;i++){const xx=px+i*(110+L*20),w=70+((i*31+L*7)%30),hh=60+((i*47+L*11)%50)+L*20,hx=hash2(i,L,909);
        g.beginPath();g.moveTo(xx,H);g.lineTo(xx,base-hh);g.lineTo(xx+w/2,base-hh-w*0.45);g.lineTo(xx+w,base-hh);g.lineTo(xx+w,H);g.closePath();g.fill();
        g.fillRect(xx+w*0.7,base-hh-w*0.4,8,w*0.3);
        for(let k=0;k<2;k++){const wx=xx+12+k*(w-34),wy=base-hh+16,on=((hx>>k)&3)!==0&&Math.sin(T*0.3+hx+k)>-0.85;
          g.fillStyle=on?(L?'rgba(255,200,120,.75)':'rgba(255,200,120,.4)'):'rgba(20,10,20,.6)';g.fillRect(wx,wy,10,12);g.fillStyle=L?'rgba(40,24,44,.9)':'rgba(70,46,74,.7)';g.fillRect(wx+4.5,wy,1,12);g.fillRect(wx,wy+5.5,10,1);}
        g.fillStyle=L?'rgba(40,24,44,.7)':'rgba(70,46,74,.45)';}}
    const px=shift(0.18,400);
    for(let i=-1;i<5;i++){const x0=px+i*200,x1=x0+200,y0=H*0.3;g.strokeStyle='rgba(30,20,30,.5)';g.lineWidth=1;g.beginPath();g.moveTo(x0,y0);g.quadraticCurveTo((x0+x1)/2,y0+40,x1,y0);g.stroke();
      for(let k=1;k<10;k++){const t=k/10,xx=x0+(x1-x0)*t,yy=y0+40*2*t*(1-t)*1,c=['#ffb0d0','#b0e8ff','#ffe0a0','#c8b0ff'][k%4],a=0.4+0.4*Math.sin(T*2+k+i);
        g.fillStyle=hexA(c,a);g.beginPath();g.arc(xx,yy+2,2,0,TAU);g.fill();}}
  }else if(b===4){
    /* Розарий: огромные розы и тернистые плети, красная дымка снизу */
    const gl=g.createLinearGradient(0,H*0.5,0,H);gl.addColorStop(0,'rgba(160,20,50,0)');gl.addColorStop(1,'rgba(160,20,50,.16)');g.fillStyle=gl;g.fillRect(0,H*0.5,W,H*0.5);
    for(let L=0;L<2;L++){const px=shift(0.1+L*0.1,620);
      for(let i=-1;i<5;i++){const xx=px+i*210+L*100,yy=H*(0.3+(((i*29+L*17)%40)/100)),R0=30+L*18,col=L?'rgba(110,16,40,.5)':'rgba(140,40,70,.28)';
        g.strokeStyle=col;g.lineWidth=5+L*2;g.beginPath();g.moveTo(xx,H);g.bezierCurveTo(xx-40,H*0.8,xx+40,yy+60,xx,yy);g.stroke();
        for(let k=0;k<6;k++){const ty=H-(H-yy)*k/6,tx=xx+Math.sin(k*1.7)*24;g.fillStyle=col;g.beginPath();g.moveTo(tx,ty);g.lineTo(tx+10,ty-4);g.lineTo(tx,ty-6);g.closePath();g.fill();}
        g.fillStyle=col;for(let r=0;r<4;r++){g.beginPath();g.arc(xx+Math.cos(r*1.9+T*0.03)*r*4,yy+Math.sin(r*1.9)*r*3,R0-r*6,0,TAU);g.fill();}
        g.strokeStyle=L?'rgba(255,120,150,.18)':'rgba(255,140,170,.1)';g.lineWidth=2;g.beginPath();for(let a=0;a<12;a+=0.2){const rr=a*2.4;g.lineTo(xx+Math.cos(a)*rr,yy+Math.sin(a)*rr*0.8);}g.stroke();}}
  }else if(b===5){
    /* Зеркальные топи: горизонт, отражённые камыши, мерцающая гладь */
    const hz=H*0.55;
    const gl=g.createLinearGradient(0,hz-60,0,hz+60);gl.addColorStop(0,'rgba(140,220,230,0)');gl.addColorStop(0.5,'rgba(160,230,240,.12)');gl.addColorStop(1,'rgba(140,220,230,0)');g.fillStyle=gl;g.fillRect(0,hz-60,W,120);
    for(let L=0;L<2;L++){const px=shift(0.08+L*0.08,300);
      for(let i=-1;i<W/30+2;i++){const xx=px+i*(30-L*8)+((i*13)%9),hh=30+((i*37+L*11)%40)+L*20,sw=Math.sin(T*0.8+i*0.7)*3,col=L?'rgba(30,60,70,.55)':'rgba(60,100,110,.3)';
        g.strokeStyle=col;g.lineWidth=1.6+L;g.beginPath();g.moveTo(xx,hz);g.quadraticCurveTo(xx+sw,hz-hh*0.6,xx+sw*2,hz-hh);g.stroke();
        if(i%3===0){g.fillStyle=col;g.beginPath();g.ellipse(xx+sw*2,hz-hh,2.4+L,6+L*2,0,0,TAU);g.fill();}
        g.globalAlpha=0.45;g.beginPath();g.moveTo(xx,hz);g.quadraticCurveTo(xx-sw,hz+hh*0.6,xx-sw*2,hz+hh);g.stroke();g.globalAlpha=1;}}
    g.globalCompositeOperation='lighter';
    for(let k=0;k<12;k++){const yy=hz+8+k*10,w=40+((k*53)%80),xx=((k*97+T*(6+k))%(W+200))-100;g.fillStyle='rgba(200,250,255,'+(0.08-k*0.005)+')';g.fillRect(xx,yy,w,1);}
    g.globalCompositeOperation='source-over';
  }else{
    /* Колыбель: прутья колыбели, дуга перекладины, далёкие игрушки-подвески; медленное «дыхание» */
    const br=0.5+0.5*Math.sin(T*0.6);
    for(let L=0;L<2;L++){const sp=L?90:60,px=shift(0.1+L*0.1,sp),col=L?'rgba(60,20,50,.55)':'rgba(110,60,100,.28)';
      g.fillStyle=col;for(let x=px;x<W+sp;x+=sp){g.fillRect(x,0,L?10:6,H);g.fillStyle=L?'rgba(200,140,190,.12)':'rgba(220,170,210,.08)';g.fillRect(x,0,2,H);g.fillStyle=col;}
      g.strokeStyle=col;g.lineWidth=L?14:9;g.beginPath();g.moveTo(-20,H*(0.12+L*0.06));g.quadraticCurveTo(W/2,H*(0.02+L*0.04)-br*6,W+20,H*(0.12+L*0.06));g.stroke();}
    for(let i=0;i<3;i++){const xx=shift(0.05,W)+(i+0.5)*W/3,yy=H*0.2+Math.sin(T*0.5+i)*6,a=T*0.3+i;
      g.strokeStyle='rgba(160,110,150,.25)';g.lineWidth=1;g.beginPath();g.moveTo(xx,0);g.lineTo(xx,yy);g.stroke();
      for(let k=0;k<3;k++){const ax=xx+Math.cos(a+k*2.1)*30,ay=yy+20+Math.sin(a+k*2.1)*6;g.beginPath();g.moveTo(xx,yy);g.lineTo(ax,ay);g.stroke();
        g.fillStyle='rgba(200,160,200,.22)';if(k===1){g.beginPath();g.arc(ax,ay+8,6,0.6,Math.PI*1.8);g.arc(ax+3,ay+6,5,Math.PI*1.7,0.7,true);g.fill();}
        else{g.beginPath();for(let q=0;q<10;q++){const aa=-Math.PI/2+q/10*TAU,r=q%2?3:7;g.lineTo(ax+Math.cos(aa)*r,ay+8+Math.sin(aa)*r);}g.closePath();g.fill();}}}
    const vg=g.createRadialGradient(W/2,H/2,Math.min(W,H)*0.3,W/2,H/2,Math.max(W,H)*0.75);vg.addColorStop(0,'rgba(40,0,30,0)');vg.addColorStop(1,'rgba(40,0,30,'+(0.25+0.1*br)+')');g.fillStyle=vg;g.fillRect(0,0,W,H);
  }
}

/* ---------- атмосфера поверх пещеры ---------- */
function drawLilacAtmos(W,H){
  if(settings.quality==='low'||G.scene!=='mine')return;
  const depth=Math.max(0,player.y)/TILE,b=biomeAt(depth)-10,T=G.time,cam=G.cam;
  if(depth<6||b<0)return;
  if(!_atm){_atm=[];for(let i=0;i<70;i++)_atm.push({x:Math.random(),y:Math.random(),s:Math.random(),p:Math.random()*TAU});}
  const g=ctx;g.save();g.setTransform(dpr,0,0,dpr,0,0);
  if(b===0){g.globalCompositeOperation='lighter';
    for(const a of _atm){if(a.s<0.45)continue;const f=0.3+a.s*0.3,x=atmWrap(a.x*W+Math.sin(T*0.4+a.p)*16-cam.x*f,W+20)-10,y=atmWrap(a.y*H-T*(4+a.s*6)-cam.y*f,H+20)-10;
      const tw=0.5+0.5*Math.sin(T*1.6+a.p*5);g.fillStyle='rgba(255,230,140,'+(0.18+0.3*tw)+')';g.beginPath();g.arc(x,y,0.8+a.s*1.2,0,TAU);g.fill();}
  }else if(b===1){g.globalCompositeOperation='lighter';
    for(const a of _atm){if(a.s<0.55)continue;const f=0.4,x=atmWrap(a.x*W-cam.x*f,W+20)-10,y=atmWrap(a.y*H-cam.y*f,H+20)-10,tw=Math.max(0,Math.sin(T*2.2+a.p*7));
      g.fillStyle=(a.s>0.8?'rgba(200,240,255,':'rgba(255,200,240,')+(0.55*tw)+')';g.fillRect(x-3*tw,y-0.4,6*tw,0.8);g.fillRect(x-0.4,y-3*tw,0.8,6*tw);}
  }else if(b===2){
    const hz=g.createLinearGradient(0,H*0.5,0,H);hz.addColorStop(0,'rgba(255,170,40,0)');hz.addColorStop(1,'rgba(255,170,40,.07)');g.fillStyle=hz;g.fillRect(0,H*0.5,W,H*0.5);
    g.globalCompositeOperation='lighter';
    for(const a of _atm){if(a.s<0.5)continue;const f=0.35,x=atmWrap(a.x*W+Math.sin(T*0.5+a.p)*20-cam.x*f,W+20)-10,y=atmWrap(a.y*H+Math.cos(T*0.4+a.p)*14-cam.y*f,H+20)-10;
      g.fillStyle='rgba(255,200,90,'+(0.12+0.2*a.s)+')';g.fillRect(x,y,1.6,1.6);}
  }else if(b===3){
    for(const a of _atm){if(a.s<0.5)continue;const f=0.4,ph=(T*0.05*(0.5+a.s)+a.p)%1,x=atmWrap(a.x*W+Math.sin(T*0.6+a.p)*24-cam.x*f,W+20)-10,y=atmWrap(a.y*H+ph*H-cam.y*f,H+20)-10;
      if(a.s>0.85){g.save();g.translate(x,y);g.rotate(T*2+a.p);g.fillStyle=['rgba(255,170,210,.5)','rgba(170,230,255,.5)','rgba(255,230,150,.5)'][Math.floor(a.p)%3];g.fillRect(-2,-1,4,2);g.restore();}
      else{g.fillStyle='rgba(230,210,230,'+(0.08+0.15*a.s)+')';g.fillRect(x,y,1.3,1.3);}}
  }else if(b===4){
    for(const a of _atm){if(a.s<0.4)continue;const f=0.45,x=atmWrap(a.x*W+T*(10+a.s*14)-cam.x*f,W+20)-10,y=atmWrap(a.y*H+T*(8+a.s*10)-cam.y*f,H+20)-10;
      g.save();g.translate(x,y);g.rotate(T*(1+a.s)+a.p);g.fillStyle='rgba('+(200+Math.floor(a.s*55))+',60,100,'+(0.25+0.3*a.s)+')';g.beginPath();g.ellipse(0,0,3+a.s*2,1.6,0,0,TAU);g.fill();g.restore();}
  }else if(b===5){
    const fs=atmSprite('lfog',90,'rgba(170,230,240,.10)','rgba(170,230,240,0)');
    for(let k=0;k<2;k++){const yy=H*(0.45+k*0.32)+Math.sin(T*0.25+k*2)*16-((cam.y*0.25)%80);const off=((T*(8+k*5)-cam.x*0.25)%(W*1.6)+W*1.6)%(W*1.6)-W*0.3;
      for(let q=0;q<3;q++){const cx=off+q*W*0.6-W*0.5;g.drawImage(fs,cx-200,yy-110,400,220);}}
    g.globalCompositeOperation='lighter';
    for(const a of _atm){if(a.s<0.7)continue;const x=atmWrap(a.x*W-cam.x*0.5,W+20)-10,y=atmWrap(a.y*H-cam.y*0.5,H+20)-10,tw=Math.max(0,Math.sin(T*1.8+a.p*4));g.fillStyle='rgba(220,255,255,'+(0.5*tw)+')';g.fillRect(x-2,y,4,0.8);}
  }else{
    for(const a of _atm){if(a.s<0.45)continue;const f=0.35+a.s*0.2,x=atmWrap(a.x*W+Math.sin(T*0.5+a.p)*22-cam.x*f,W+20)-10,y=atmWrap(a.y*H+T*(3+a.s*4)-cam.y*f,H+20)-10;
      g.save();g.translate(x,y);g.rotate(Math.sin(T+a.p)*0.8);g.strokeStyle='rgba(250,235,255,'+(0.18+0.25*a.s)+')';g.lineWidth=0.7;g.beginPath();g.moveTo(-4,0);g.lineTo(4,0);
      for(let k=-3;k<=3;k+=1.5){g.moveTo(k,0);g.lineTo(k+1.2,-2);}g.stroke();g.restore();}
    const br=0.5+0.5*Math.sin(T*0.6);const vg=g.createRadialGradient(W/2,H/2,Math.min(W,H)*0.35,W/2,H/2,Math.max(W,H)*0.8);vg.addColorStop(0,'rgba(60,0,40,0)');vg.addColorStop(1,'rgba(60,0,40,'+(0.12+0.1*br)+')');g.fillStyle=vg;g.fillRect(0,0,W,H);
  }
  g.restore();
}

/* ---------- декор пустот у стен (каждый кадр, живой) ---------- */
const LIL_FLW=['#ffb0d8','#fff2fa','#ffe08a','#d8a8ff','#ff8ac0'];
function lilFlower(g,cx,by,h,time,tx){
  const sw=Math.sin(time*1.6+tx*0.9+h%7)*1.8,len=8+(h>>>3)%7,c=LIL_FLW[(h>>>6)%5],fx=cx+sw,fy=by-len;
  g.strokeStyle='#4a8a62';g.lineWidth=1.3;g.beginPath();g.moveTo(cx,by);g.quadraticCurveTo(cx+sw*0.3,by-len*0.5,fx,fy);g.stroke();
  g.fillStyle='#5aa070';g.beginPath();g.ellipse(cx+sw*0.3+2.4,by-len*0.45,2.6,1.1,-0.5,0,TAU);g.fill();
  for(let p=0;p<5;p++){const a=p/5*TAU+h;g.fillStyle=p<3?c:shadeHex(c,-0.18);g.beginPath();g.ellipse(fx+Math.cos(a)*2.4,fy+Math.sin(a)*2.2,2.2,1.4,a,0,TAU);g.fill();}
  g.fillStyle='#ffe070';g.beginPath();g.arc(fx,fy,1.2,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.7)';g.fillRect(fx-2.6,fy-2.4,1,1);
}
function lilacAirDecorI(g,x,y,tx,ty,bi,h,up,dn,time,gl,solid){
  const b=bi-10,B=x+TILE,Y=y+TILE;
  if(b===0){
    if(dn){
      if(h%3===0){g.strokeStyle='#5aa878';g.lineWidth=1.4;g.beginPath();for(let i=0;i<4;i++){const gx=x+4+i*7,sw=Math.sin(time*1.8+gx*0.08)*1.6;g.moveTo(gx,Y);g.quadraticCurveTo(gx+sw*0.5,Y-4,gx+sw,Y-6-((h>>>(i*2))%5));}g.stroke();
        g.strokeStyle='#8ad8a8';g.lineWidth=0.7;g.beginPath();g.moveTo(x+11,Y);g.lineTo(x+11+Math.sin(time*1.8)*1.2,Y-7);g.stroke();}
      else if(h%5===1){lilFlower(g,x+10+(h>>>9)%12,Y,h,time,tx);if((h>>>12)%3===0)lilFlower(g,x+6+(h>>>14)%8,Y,h>>>2,time,tx+1);}
      else if(h%13===3){/* одуванчик */const cx=x+16,sw=Math.sin(time*1.4+tx)*1.5;g.strokeStyle='#6a9a6a';g.lineWidth=1;g.beginPath();g.moveTo(cx,Y);g.lineTo(cx+sw,Y-13);g.stroke();
        g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=0.6;g.beginPath();for(let k=0;k<12;k++){const a=k/12*TAU;g.moveTo(cx+sw,Y-13);g.lineTo(cx+sw+Math.cos(a)*5,Y-13+Math.sin(a)*5);}g.stroke();
        g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.arc(cx+sw,Y-13,1.2,0,TAU);g.fill();gl(cx,Y-13,18,'#ffffff');}
    }
    if(up&&h%6===0){/* глициния: свисающая гроздь */
      const cx=x+8+(h>>>9)%16,n=5+(h>>>4)%4,sw0=Math.sin(time*1.1+tx*0.7)*2;
      g.strokeStyle='#5a6a4a';g.lineWidth=1;g.beginPath();g.moveTo(cx,y);g.quadraticCurveTo(cx+sw0*0.5,y+n*2,cx+sw0,y+n*3.4);g.stroke();
      for(let k=0;k<n;k++){const t=k/n,sw=sw0*t,r=3.4*(1-t*0.6),yy=y+2+k*3.6;
        g.fillStyle=k%2?'#b890e8':'#d0a8ff';g.beginPath();g.ellipse(cx+sw-r*0.6,yy,r,r*0.75,0,0,TAU);g.ellipse(cx+sw+r*0.6,yy+1,r,r*0.75,0,0,TAU);g.fill();
        g.fillStyle='rgba(255,240,255,.6)';g.fillRect(cx+sw-r,yy-r*0.5,1.2,1);}
      gl(cx,y+n*2,22,'#c8a0ff');}
    else if(up&&h%7===2){/* корешки */const ox=x+6+(h>>>9)%20,len=6+(h>>>4)%12,sw=Math.sin(time*1.3+tx)*1.4;g.strokeStyle='#7a5a3a';g.lineWidth=1.6;g.beginPath();g.moveTo(ox,y);g.quadraticCurveTo(ox+2+sw,y+len*0.5,ox-1+sw*1.5,y+len);g.stroke();}
  }else if(b===1){
    if(dn&&h%4===0){/* друза стекла */
      const cx=x+8+(h>>>10)%16,cols=['#bfe8ff','#ffd0f0','#d0f8ff'];
      for(let k=0;k<3;k++){const l=6+((h>>>(k*3))%9),w=2.6+k*0.4,ox=cx+(k-1)*4,a=(k-1)*0.25,c=cols[(h>>>(k+4))%3];
        g.save();g.translate(ox,Y);g.rotate(a);
        g.fillStyle=shadeHex(c,-0.35);g.beginPath();g.moveTo(0,0);g.lineTo(w,0);g.lineTo(w*0.4,-l);g.closePath();g.fill();
        g.fillStyle=c;g.beginPath();g.moveTo(-w,0);g.lineTo(0,0);g.lineTo(w*0.4,-l);g.closePath();g.fill();
        g.fillStyle='rgba(255,255,255,.7)';g.fillRect(-w*0.5,-l*0.6,0.8,l*0.4);g.restore();}
      gl(cx,Y-6,20,'#bfe8ff');
      if((h>>>7)%3===0){const a=Math.max(0,Math.sin(time*2.6+h%13));g.fillStyle='rgba(255,255,255,'+a+')';g.fillRect(cx-3,Y-10,6,0.8);g.fillRect(cx-0.4,Y-13,0.8,6);}}
    else if(dn&&h%17===5){/* стеклянный тюльпан */const cx=x+16;g.strokeStyle='rgba(180,230,255,.8)';g.lineWidth=1.2;g.beginPath();g.moveTo(cx,Y);g.lineTo(cx,Y-12);g.stroke();
      g.fillStyle='rgba(220,200,255,.85)';g.beginPath();g.moveTo(cx-4,Y-14);g.quadraticCurveTo(cx-4,Y-21,cx,Y-22);g.quadraticCurveTo(cx+4,Y-21,cx+4,Y-14);g.quadraticCurveTo(cx,Y-11,cx-4,Y-14);g.fill();
      g.fillStyle='rgba(255,255,255,.7)';g.fillRect(cx-2.6,Y-19,1,4);gl(cx,Y-17,26,'#e0c0ff');}
    if(up&&h%5===0){/* стеклянные сосульки-подвески */
      for(let k=0;k<2;k++){const cx=x+7+k*12+(h>>>(9+k))%6,l=7+((h>>>(4+k*3))%10);
        g.fillStyle='rgba(180,220,255,.75)';g.beginPath();g.moveTo(cx-3,y);g.lineTo(cx+3,y);g.lineTo(cx,y+l);g.closePath();g.fill();
        g.fillStyle='rgba(255,255,255,.75)';g.fillRect(cx-1.6,y,0.8,l*0.6);
        const ph=(time*0.5+(h%9)*0.2+k*0.5)%3;if(ph<1){g.fillStyle='rgba(220,240,255,'+(1-ph)+')';g.beginPath();g.arc(cx,y+l+1,1.4,0,TAU);g.fill();}}
      gl(x+16,y+8,18,'#a8d8ff');}
  }else if(b===2){
    if(up&&h%5===0){/* восковой натёк и капля мёда */
      const cx=x+10+(h>>>9)%12,l=6+(h>>>4)%8;
      g.fillStyle='#b88a30';g.beginPath();g.moveTo(cx-5,y);g.quadraticCurveTo(cx-2,y+l,cx,y+l+2);g.quadraticCurveTo(cx+2,y+l,cx+5,y);g.closePath();g.fill();
      g.fillStyle='rgba(255,230,150,.5)';g.fillRect(cx-3,y,1.2,l*0.6);
      const ph=(time*0.45+(h%7)*0.29)%1.6;
      if(ph<1){const st=Math.min(1,ph*2),yy=y+l+2+Math.max(0,ph-0.5)*60;
        if(ph<0.5){g.fillStyle='#ffb020';g.beginPath();g.ellipse(cx,y+l+2+st*3,1.6+st,2+st*1.4,0,0,TAU);g.fill();}
        else{g.fillStyle='#ffb020';g.beginPath();g.ellipse(cx,yy,2,2.8,0,0,TAU);g.fill();g.fillStyle='rgba(255,250,210,.8)';g.fillRect(cx-1,yy-1.6,0.9,0.9);}
        gl(cx,yy,14,'#ffb020');}}
    if(dn&&h%4===1){/* лужица мёда */const cx=x+16;g.fillStyle='#d08a18';g.beginPath();g.ellipse(cx,Y-1,12,3,0,0,TAU);g.fill();
      g.fillStyle='#ffc040';g.beginPath();g.ellipse(cx-1,Y-1.6,10,2,0,0,TAU);g.fill();g.fillStyle='rgba(255,255,220,.7)';g.beginPath();g.ellipse(cx-4,Y-2.2,3,0.7,0,0,TAU);g.fill();}
    else if(dn&&h%11===6){/* дохлая пчела: Истина просвечивает и здесь */const cx=x+14;g.fillStyle='#2a1a0a';g.beginPath();g.ellipse(cx,Y-3,4,2.6,0,0,TAU);g.fill();
      g.fillStyle='#ffc030';g.fillRect(cx-2,Y-5,1.4,4.4);g.fillRect(cx+1,Y-5,1.4,4.4);g.fillStyle='rgba(230,240,255,.5)';g.beginPath();g.ellipse(cx-1,Y-6.5,2.6,1.4,-0.4,0,TAU);g.fill();}
  }else if(b===3){
    if(dn){
      if(h%9===0){/* пуговица */const cx=x+8+(h>>>9)%16,c=['#d86a9a','#6ab8d8','#e8c060','#9a7ad8'][(h>>>4)%4];g.fillStyle=shadeHex(c,-0.35);g.beginPath();g.ellipse(cx,Y-2,4,2,0,0,TAU);g.fill();
        g.fillStyle=c;g.beginPath();g.ellipse(cx,Y-2.6,3.6,1.6,0,0,TAU);g.fill();g.fillStyle=shadeHex(c,-0.4);g.fillRect(cx-1.4,Y-3,0.9,0.8);g.fillRect(cx+0.6,Y-3,0.9,0.8);}
      else if(h%11===2){/* катушка ниток */const cx=x+16;g.fillStyle='#c8a070';g.fillRect(cx-5,Y-10,10,2);g.fillRect(cx-5,Y-2,10,2);g.fillStyle='#d84a6a';g.fillRect(cx-4,Y-8,8,6);
        g.strokeStyle='rgba(255,200,210,.6)';g.lineWidth=0.6;for(let k=0;k<3;k++){g.beginPath();g.moveTo(cx-4,Y-7+k*2);g.lineTo(cx+4,Y-6.4+k*2);g.stroke();}
        g.strokeStyle='#d84a6a';g.lineWidth=0.8;g.beginPath();g.moveTo(cx+4,Y-4);g.quadraticCurveTo(cx+10,Y-1,cx+14,Y);g.stroke();}
      else if(h%13===4){/* кубик с буквой */const cx=x+10+(h>>>9)%10,c=['#ff9ab8','#9ad8ff','#b8f0a0'][(h>>>4)%3];g.fillStyle=shadeHex(c,-0.3);g.fillRect(cx,Y-9,9,9);g.fillStyle=c;g.fillRect(cx,Y-9,8,8);
        g.fillStyle='rgba(255,255,255,.5)';g.fillRect(cx,Y-9,8,1.2);g.fillStyle='#5a3a5a';g.font='bold 7px system-ui';g.textAlign='center';g.fillText('АБВГ'[(h>>>6)%4],cx+4,Y-2.6);}
      else if(h%29===7){/* ручка куклы */const cx=x+12;g.fillStyle='#f0d0c0';g.beginPath();g.ellipse(cx,Y-2,6,1.8,-0.15,0,TAU);g.fill();
        g.fillStyle='#e0b8a8';for(let k=0;k<4;k++)g.fillRect(cx+5,Y-3.4+k*0.9,2.4,0.7);g.fillStyle='rgba(255,255,255,.5)';g.fillRect(cx-4,Y-3.2,5,0.7);}
    }
    if(up&&h%7===0){/* гирлянда флажков */
      const sag=6+Math.sin(time*0.9+tx)*1.2;g.strokeStyle='rgba(240,220,240,.6)';g.lineWidth=0.7;g.beginPath();g.moveTo(x,y+2);g.quadraticCurveTo(x+16,y+2+sag*2,B,y+2);g.stroke();
      const cs=['#ff9ab8','#9ad8ff','#ffe08a','#c8a8ff'];
      for(let k=0;k<4;k++){const t=(k+0.5)/4,fx=x+t*TILE,fy=y+2+sag*2*2*t*(1-t);g.fillStyle=cs[(k+h)%4];g.beginPath();g.moveTo(fx-3,fy);g.lineTo(fx+3,fy);g.lineTo(fx,fy+6);g.closePath();g.fill();
        g.fillStyle='rgba(0,0,0,.2)';g.beginPath();g.moveTo(fx,fy);g.lineTo(fx+3,fy);g.lineTo(fx,fy+6);g.closePath();g.fill();}}
    else if(up&&h%11===3){/* бумажный фонарик */
      const cx=x+16,sw=Math.sin(time*1.2+tx)*1.5,ly=y+10;g.strokeStyle='#5a4a5a';g.lineWidth=0.8;g.beginPath();g.moveTo(cx,y);g.lineTo(cx+sw,ly-5);g.stroke();
      const gr=g.createRadialGradient(cx+sw-1.5,ly-1.5,0.5,cx+sw,ly,6);gr.addColorStop(0,'#fff0c0');gr.addColorStop(0.6,'#ffb070');gr.addColorStop(1,'#d86040');g.fillStyle=gr;g.beginPath();g.ellipse(cx+sw,ly,5,6,0,0,TAU);g.fill();
      g.strokeStyle='rgba(120,40,30,.4)';g.lineWidth=0.6;for(let k=-1;k<=1;k++){g.beginPath();g.ellipse(cx+sw,ly,Math.abs(k)*3+0.5,6,0,0,TAU);g.stroke();}
      g.fillStyle='#6a4a3a';g.fillRect(cx+sw-2.4,ly-6.6,4.8,1.4);g.fillRect(cx+sw-2.4,ly+5.4,4.8,1.4);gl(cx+sw,ly,34,'#ffb070');}
  }else if(b===4){
    if(dn&&h%4===0){/* розовый куст */
      const cx=x+10+(h>>>9)%12,l=10+(h>>>4)%8,sw=Math.sin(time*1.1+tx)*1.2,c=['#d81e40','#ff6a9a','#b0102a','#ffb0c8'][(h>>>6)%4],rx=cx+sw,ry=Y-l;
      g.strokeStyle='#2a4a22';g.lineWidth=1.6;g.beginPath();g.moveTo(cx,Y);g.quadraticCurveTo(cx-3+sw*0.4,Y-l*0.5,rx,ry);g.stroke();
      g.fillStyle='#e8d0b0';g.beginPath();g.moveTo(cx-1,Y-4);g.lineTo(cx-4,Y-6);g.lineTo(cx-0.6,Y-5.4);g.closePath();g.fill();
      g.fillStyle='#3a6a2a';g.beginPath();g.ellipse(cx+3,Y-l*0.45,3,1.4,0.6,0,TAU);g.fill();
      g.fillStyle=shadeHex(c,-0.3);g.beginPath();g.arc(rx,ry,4.4,0,TAU);g.fill();
      g.fillStyle=c;g.beginPath();g.arc(rx-0.5,ry-0.5,3.8,0,TAU);g.fill();
      g.strokeStyle=shadeHex(c,-0.4);g.lineWidth=0.8;g.beginPath();for(let a=0;a<9;a+=0.35){const rr=a*0.42;g.lineTo(rx-0.5+Math.cos(a)*rr,ry-0.5+Math.sin(a)*rr);}g.stroke();
      g.fillStyle='rgba(255,255,255,.4)';g.fillRect(rx-3,ry-3,1.4,1);}
    if(up&&h%5===0){/* свисающая плеть с бутоном */
      const ox=x+6+(h>>>9)%20,len=10+(h>>>4)%14,sw=Math.sin(time*1+tx*0.8)*2;
      g.strokeStyle='#2a3a20';g.lineWidth=1.8;g.beginPath();g.moveTo(ox,y);g.quadraticCurveTo(ox+3+sw,y+len*0.5,ox+sw*1.5,y+len);g.stroke();
      for(let k=1;k<4;k++){const t=k/4,px=ox+sw*1.5*t+3*t*(1-t)*2,py=y+len*t;g.fillStyle='#e8d0b0';g.beginPath();g.moveTo(px,py);g.lineTo(px+(k%2?4:-4),py-1.6);g.lineTo(px,py+1.2);g.closePath();g.fill();}
      g.fillStyle='#a0102a';g.beginPath();g.ellipse(ox+sw*1.5,y+len+2,2.2,3,0,0,TAU);g.fill();g.fillStyle='#3a6a2a';g.beginPath();g.moveTo(ox+sw*1.5-2,y+len);g.lineTo(ox+sw*1.5,y+len+3);g.lineTo(ox+sw*1.5+2,y+len);g.closePath();g.fill();}
  }else if(b===5){
    if(dn&&h%3===0){/* камыши и рогоз */
      for(let k=0;k<3;k++){const gx=x+6+k*9+((h>>>k)%3),hh=12+((h>>>(k*3))%10),sw=Math.sin(time*1.2+gx*0.06)*2.2;
        g.strokeStyle=k===1?'#3a6a5a':'#4a7a68';g.lineWidth=1.3;g.beginPath();g.moveTo(gx,Y);g.quadraticCurveTo(gx+sw*0.4,Y-hh*0.5,gx+sw,Y-hh);g.stroke();
        if(k===1&&(h>>>8)%2){g.fillStyle='#5a3a2a';g.beginPath();g.ellipse(gx+sw,Y-hh-1,1.8,4,0,0,TAU);g.fill();g.fillStyle='rgba(255,220,200,.3)';g.fillRect(gx+sw-1,Y-hh-3.4,0.7,3);}}}
    if(up&&h%6===0){/* серебряные капли */const cx=x+8+(h>>>9)%16;g.fillStyle='#b8c8d0';g.beginPath();g.moveTo(cx-3,y);g.quadraticCurveTo(cx,y+5,cx,y+6);g.quadraticCurveTo(cx,y+5,cx+3,y);g.fill();
      const ph=(time*0.6+(h%9)*0.21)%1.4;if(ph<1){const yy=y+6+ph*ph*60;g.fillStyle='rgba(220,240,250,.9)';g.beginPath();g.arc(cx,yy,1.5,0,TAU);g.fill();g.fillStyle='#fff';g.fillRect(cx-0.7,yy-0.9,0.7,0.7);}}
  }else{
    if(up&&h%9===0){/* подвеска над колыбелью: звёзды и месяц, медленно кружатся */
      const cx=x+16,ly=y+12,a=time*0.4+h;g.strokeStyle='rgba(230,210,230,.7)';g.lineWidth=0.7;g.beginPath();g.moveTo(cx,y);g.lineTo(cx,ly);g.stroke();
      g.fillStyle='#c8a8d8';g.fillRect(cx-11,ly-0.8,22,1.6);
      for(let k=0;k<3;k++){const ax=cx+Math.cos(a+k*2.1)*10,az=Math.sin(a+k*2.1),ay=ly+7+k*2;g.beginPath();g.moveTo(ax,ly);g.lineTo(ax,ay-4);g.stroke();
        const s=0.75+0.25*az,c=k===1?'#ffe8a0':'#f0c8e8';g.fillStyle=shadeHex(c,az<0?-0.25:0);
        if(k===1){g.beginPath();g.arc(ax,ay,3.6*s,0.5,Math.PI*1.9);g.arc(ax+1.6*s,ay-1,3*s,Math.PI*1.8,0.6,true);g.fill();}
        else{g.beginPath();for(let q=0;q<10;q++){const aa=-Math.PI/2+q/10*TAU,r=(q%2?1.6:3.8)*s;g.lineTo(ax+Math.cos(aa)*r,ay+Math.sin(aa)*r);}g.closePath();g.fill();}}
      gl(cx,ly+8,22,'#f0c8f0');}
    else if(up&&h%5===2){/* лента с бантом */const ox=x+8+(h>>>9)%16,len=12+(h>>>4)%10;g.strokeStyle='#f0a0c8';g.lineWidth=2.2;g.beginPath();g.moveTo(ox,y);
      for(let k=1;k<=4;k++)g.lineTo(ox+Math.sin(time*1.3+k*1.1+h%5)*(1+k*0.6),y+len*k/4);g.stroke();
      g.fillStyle='#ff90c0';g.beginPath();g.ellipse(ox-3,y+3,3,1.8,0.3,0,TAU);g.ellipse(ox+3,y+3,3,1.8,-0.3,0,TAU);g.fill();g.fillStyle='#d8609a';g.beginPath();g.arc(ox,y+3,1.2,0,TAU);g.fill();}
    if(dn&&h%3===0){/* клочья пуха */for(let k=0;k<2;k++){const cx=x+8+k*14+(h>>>(k+5))%6,r=3+((h>>>(k*2))%3);const gr=g.createRadialGradient(cx-1,Y-r-1,0.5,cx,Y-r,r+1);gr.addColorStop(0,'#ffffff');gr.addColorStop(1,'rgba(230,210,240,.3)');g.fillStyle=gr;g.beginPath();g.arc(cx,Y-r+1,r,Math.PI,0);g.fill();}}
    else if(dn&&h%19===4){/* погремушка */const cx=x+14;g.fillStyle='#e8d0a0';g.fillRect(cx-0.8,Y-9,1.6,7);g.fillStyle='#ff9ac0';g.beginPath();g.arc(cx,Y-11,4,0,TAU);g.fill();
      g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.arc(cx-1.4,Y-12.4,1.2,0,TAU);g.fill();g.fillStyle='#e8d0a0';g.beginPath();g.arc(cx,Y-2,1.8,0,TAU);g.fill();}
    const sL=solid(tx-1,ty),sR=solid(tx+1,ty);
    if((sL||sR)&&!up&&!dn&&h%6===0){/* пульсирующие жилки на стенке */const wx=sL?x:B,dir=sL?1:-1,p=0.5+0.5*Math.sin(time*1.2+h%7);
      g.strokeStyle='rgba(160,60,170,'+(0.35+0.3*p)+')';g.lineWidth=1.4+p*0.6;g.beginPath();g.moveTo(wx,y+2);g.quadraticCurveTo(wx+dir*6,y+12,wx+dir*2,y+18);g.quadraticCurveTo(wx+dir*7,y+24,wx+dir*3,y+30);g.stroke();}
  }
}
/* верхняя кромка породы под пустотой */
function lilacEdge(g,x,y,bi,h){
  const b=bi-10;
  if(b===0){g.fillStyle='#4a8a62';g.fillRect(x,y,TILE,3);g.fillStyle='#7ac89a';g.fillRect(x,y,TILE,1.2);
    if(h%3===0){g.fillStyle=LIL_FLW[(h>>>4)%5];g.fillRect(x+4+(h>>>6)%22,y-1.5,2,2);}}
  else if(b===1){g.fillStyle='rgba(200,235,255,.55)';g.fillRect(x,y,TILE,1.6);g.fillStyle='rgba(120,170,230,.3)';g.fillRect(x,y+1.6,TILE,1.4);}
  else if(b===2){g.fillStyle='#e8a830';g.fillRect(x,y,TILE,2.4);g.fillStyle='rgba(255,240,170,.7)';g.fillRect(x,y,TILE,0.9);
    if(h%4===0){const dx=x+5+(h>>>5)%20;g.fillStyle='#e8a830';g.beginPath();g.moveTo(dx-2,y+2);g.quadraticCurveTo(dx,y+7,dx+2,y+2);g.fill();}}
  else if(b===3){g.fillStyle='rgba(240,220,235,.4)';g.fillRect(x,y,TILE,2);g.fillStyle='rgba(60,30,50,.4)';g.fillRect(x,y+2,TILE,1);}
  else if(b===4){g.fillStyle='#3a1420';g.fillRect(x,y,TILE,3);g.fillStyle='rgba(140,30,60,.6)';g.fillRect(x,y,TILE,1);
    if(h%3===0){g.fillStyle='#e8d0b0';const sx=x+4+(h>>>5)%22;g.beginPath();g.moveTo(sx-1.6,y);g.lineTo(sx,y-3.4);g.lineTo(sx+1.6,y);g.closePath();g.fill();}}
  else if(b===5){g.fillStyle='rgba(210,235,245,.5)';g.fillRect(x,y,TILE,1.6);}
  else{g.fillStyle='#f0e2f6';g.beginPath();g.moveTo(x,y+2.6);for(let k=0;k<=4;k++)g.quadraticCurveTo(x+k*8-4,y-1.6,x+k*8,y+2.6);g.lineTo(x+TILE,y+3);g.lineTo(x,y+3);g.closePath();g.fill();}
}
/* живые блики на особых блоках (каждый кадр) */
function lilacDecor(g,tx,ty,t,h){
  const x=tx*TILE,y=ty*TILE,time=G.time;
  if(veilT>0.03)lilacDecorT(g,tx,ty,t,h);
  if(t===T_LQUARTZ){const ph=((time*0.35+(h%17)*0.07+ty*0.05)%1.6);if(ph<1){g.fillStyle='rgba(255,255,255,'+(0.35*Math.sin(ph*Math.PI))+')';g.fillRect(x+3,y+ph*TILE-3,26,3);}}
  else if(t===T_LCOMB){if(h%3===0){const p=0.5+0.5*Math.sin(time*2+h);g.fillStyle='rgba(255,250,200,'+(0.2+0.4*p)+')';g.beginPath();g.ellipse(x+8+(h%14),y+8+((h>>4)%14),1.6,0.8,-0.6,0,TAU);g.fill();}}
  else if(t===T_LSILVER){const ph=((time*0.25+tx*0.11+ty*0.03)%2);if(ph<1){g.fillStyle='rgba(255,255,255,'+(0.25*Math.sin(ph*Math.PI))+')';g.beginPath();g.moveTo(x+ph*40-8,y);g.lineTo(x+ph*40,y);g.lineTo(x+ph*40-12,y+TILE);g.lineTo(x+ph*40-20,y+TILE);g.closePath();g.fill();}}
  else if(t===T_LCRADLE&&h%9===0){const p=0.5+0.5*Math.sin(time*1.2+h%5);g.fillStyle='rgba(200,120,200,'+(0.08+0.1*p)+')';g.fillRect(x,y,TILE,TILE);}
}
/* частицы в воздухе вокруг шахтёра */
function lilacAmbient(x,y,bi){
  switch(bi-10){
    case 0:spawnPart(x,y,rnd(-6,6),rnd(-12,-3),rnd(3,6),Math.random()<0.6?'#ffe08a':'#ffd0f0',1.6,0);break;
    case 1:spawnPart(x,y,rnd(-4,4),rnd(-6,6),rnd(2,4),Math.random()<0.5?'#d0f0ff':'#ffd8f4',1.4,0);break;
    case 2:if(Math.random()<0.6)spawnPart(x,y,rnd(-8,8),rnd(-6,6),rnd(3,5),'#ffc860',1.6,0);else spawnPart(x,y,0,10,1.2,'#ffb020',2,320);break;
    case 3:spawnPart(x,y,rnd(-8,8),rnd(4,12),rnd(3,6),['#ffb0d0','#b0e0ff','#ffe0a0','#e8d8e8'][Math.floor(Math.random()*4)],1.6,0);break;
    case 4:spawnPart(x,y,rnd(8,20),rnd(6,16),rnd(3,6),Math.random()<0.7?'#e04a70':'#ff9ab8',2,0);break;
    case 5:if(Math.random()<0.5)spawnPart(x,y,rnd(-4,4),rnd(-4,2),rnd(3,5),'#c8f0f4',1.4,0);else spawnPart(x,y,0,20,0.9,'#d8f0f8',1.4,380);break;
    default:spawnPart(x,y,rnd(-6,6),rnd(2,8),rnd(4,7),'#f4e8fa',2,0);
  }
}
