'use strict';
/* ============================================================
   ДЕКОР СТРУКТУР v11: новые предметы и ловушки
   ============================================================ */
function drawGlyph11(g,ch,x,y,ceilY,wx,wy,h,time,low,gl,ban,q){
  const hell=G.dim===1,deep=wy;
  switch(ch){
    case '!':{ /* висячий фонарь */
      const sw=Math.sin(time*1.3+h%7)*2,ly=ceilY+18;
      const c=hell?(deep>=850&&deep<1200?['#5ab8ff','#d8f4ff']:['#ff4a1a','#ffd080']):['#ffb040','#fff0b0'];
      g.strokeStyle='#3a3a40';g.lineWidth=1.4;g.beginPath();g.moveTo(x+16,ceilY);g.lineTo(x+16+sw,ly);g.stroke();
      g.fillStyle='#1e1c22';g.fillRect(x+11+sw,ly,10,3);g.fillRect(x+11+sw,ly+15,10,3);
      g.fillStyle=hexA(c[0],0.85);g.fillRect(x+12+sw,ly+3,8,12);
      g.fillStyle=c[1];g.beginPath();g.ellipse(x+16+sw,ly+9,2,3.4+Math.sin(time*11+h)*0.6,0,0,TAU);g.fill();
      g.strokeStyle='#1e1c22';g.lineWidth=1;g.beginPath();g.moveTo(x+14+sw,ly+3);g.lineTo(x+14+sw,ly+15);g.moveTo(x+18+sw,ly+3);g.lineTo(x+18+sw,ly+15);g.stroke();
      gl(x+16+sw,ly+9,56,c[0]);return true;}
    case '0':{ /* люстра со свечами */
      const sw=Math.sin(time*0.9+h%5)*1.5,cy=ceilY+22;
      g.strokeStyle='#4a4048';g.lineWidth=1.6;g.beginPath();g.moveTo(x+16,ceilY);g.lineTo(x+16+sw,cy);g.stroke();
      g.strokeStyle=hell?'#5a2a20':'#8a7040';g.lineWidth=2.4;g.beginPath();g.ellipse(x+16+sw,cy,20,5,0,0,TAU);g.stroke();
      for(let k=0;k<5;k++){const a=k/5*TAU+0.3,cx=x+16+sw+Math.cos(a)*20,yy=cy+Math.sin(a)*5;
        g.fillStyle=hell?'#d8d0bc':'#f0e8d0';g.fillRect(cx-1.5,yy-7,3,7);
        const f=0.7+0.3*Math.sin(time*12+k*2+h);g.fillStyle=hell&&deep>=850&&deep<1200?'rgba(120,210,255,.95)':'rgba(255,190,90,.95)';
        g.beginPath();g.ellipse(cx,yy-9,1.6,3*f,0,0,TAU);g.fill();}
      gl(x+16+sw,cy-6,70,hell?(deep>=850&&deep<1200?'#5ab8ff':'#ff7a2a'):'#ffd98a');return true;}
    case '%':{ /* гобелен */
      const sw=Math.sin(time*1.1+h%9)*1.5;
      g.fillStyle='#2a2028';g.fillRect(x+4,y+2,24,3);
      g.fillStyle=ban;g.beginPath();g.moveTo(x+6,y+5);g.lineTo(x+26,y+5);g.lineTo(x+26+sw,y+44);g.lineTo(x+20+sw,y+38);g.lineTo(x+16+sw,y+46);g.lineTo(x+12+sw,y+38);g.lineTo(x+6+sw,y+44);g.closePath();g.fill();
      g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x+6,y+5,4,36);
      g.strokeStyle=hell?'rgba(255,190,90,.7)':'rgba(255,230,160,.7)';g.lineWidth=1.4;
      g.beginPath();if(hell){g.moveTo(x+16+sw*0.5,y+12);g.lineTo(x+21+sw*0.5,y+26);g.lineTo(x+11+sw*0.5,y+18);g.lineTo(x+21+sw*0.5,y+18);g.lineTo(x+11+sw*0.5,y+26);g.closePath();}
      else{g.arc(x+16+sw*0.5,y+20,5,0,TAU);g.moveTo(x+16+sw*0.5,y+13);g.lineTo(x+16+sw*0.5,y+27);}g.stroke();
      return true;}
    case '=':{ /* витраж */
      const a=0.55+0.25*Math.sin(time*1.4+h);
      g.fillStyle='#1a1620';g.beginPath();g.moveTo(x+4,y+30);g.lineTo(x+4,y+10);g.quadraticCurveTo(x+16,y-6,x+28,y+10);g.lineTo(x+28,y+30);g.closePath();g.fill();
      const cols=hell?['#ff4a1a','#ffb030','#a01a0a','#ff7a3a']:['#5a8aff','#c86aff','#ffd060','#5affc0'];
      for(let k=0;k<4;k++){g.fillStyle=hexA(cols[k],a);g.fillRect(x+6+(k%2)*10,y+12+Math.floor(k/2)*9,9,8);}
      g.fillStyle=hexA(cols[(h>>>3)%4],a);g.beginPath();g.moveTo(x+6,y+11);g.quadraticCurveTo(x+16,y-2,x+26,y+11);g.closePath();g.fill();
      g.strokeStyle='#100c14';g.lineWidth=1.4;g.beginPath();g.moveTo(x+16,y+1);g.lineTo(x+16,y+30);g.moveTo(x+5,y+20);g.lineTo(x+27,y+20);g.stroke();
      gl(x+16,y+16,40,cols[0]);return true;}
    case '|':{ /* колонна */
      const st=q.st.wall,wood=st==='plank'||st==='char';
      const c=wood?['#5a3a1e','#7a5230']:hell?['#3e2e32','#6a5458']:['#4a4e5a','#6a707e'];
      g.fillStyle=c[0];g.fillRect(x+10,y,12,TILE);g.fillStyle=c[1];g.fillRect(x+10,y,3,TILE);
      g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x+19,y,3,TILE);
      if(isSolid(wx,wy-1)){g.fillStyle=c[1];g.fillRect(x+6,y,20,5);}
      if(isSolid(wx,wy+1)){g.fillStyle=c[1];g.fillRect(x+6,y+TILE-5,20,5);}
      if(!wood&&hell&&h%3===0){g.fillStyle='rgba(255,100,40,'+(0.3+0.2*Math.sin(time*2+h)).toFixed(2)+')';g.fillRect(x+15,y+6,2,20);}
      return true;}
    case 'a':{ /* костёр / огненная яма */
      g.fillStyle='#3a3230';for(let k=0;k<6;k++){g.beginPath();g.ellipse(x+4+k*5,y+29,3.4,2.4,0,0,TAU);g.fill();}
      g.strokeStyle=hell?'#2a1010':'#5a3a1e';g.lineWidth=3;g.beginPath();g.moveTo(x+8,y+28);g.lineTo(x+22,y+20);g.moveTo(x+24,y+28);g.lineTo(x+10,y+20);g.stroke();
      const fc=hell?(deep>=550&&deep<850?['#9aff40','#e8ffa0']:['#ff4a1a','#ffd060']):['#ff8a30','#fff0a0'];
      for(let k=0;k<4;k++){const fx=x+9+k*5,fh=10+Math.sin(time*11+k*1.7+h)*4;g.fillStyle=k%2?fc[1]:fc[0];g.beginPath();g.moveTo(fx-3.5,y+26);g.quadraticCurveTo(fx,y+26-fh*1.7,fx+3.5,y+26);g.closePath();g.fill();}
      gl(x+16,y+16,84,fc[0]);
      if(!low&&Math.random()<0.12)spawnPart(x+16+rnd(-6,6),y+10,rnd(-12,12),rnd(-70,-30),1,fc[0],2,-25);
      return true;}
    case 'd':{ /* палатка */
      const c=hell?['#6a4038','#4a2a24','#d8ccb0']:['#8a7a5a','#6a5a3e','#5a3a1e'];
      g.fillStyle=c[1];g.beginPath();g.moveTo(x-16,y+32);g.lineTo(x+16,y-4);g.lineTo(x+48,y+32);g.closePath();g.fill();
      g.fillStyle=c[0];g.beginPath();g.moveTo(x-12,y+32);g.lineTo(x+16,y);g.lineTo(x+44,y+32);g.closePath();g.fill();
      g.fillStyle='#120c08';g.beginPath();g.moveTo(x+8,y+32);g.lineTo(x+16,y+12);g.lineTo(x+24,y+32);g.closePath();g.fill();
      g.strokeStyle=c[2];g.lineWidth=2;g.beginPath();g.moveTo(x+16,y-8);g.lineTo(x+16,y+2);g.stroke();
      if(hell){g.fillStyle='#d8ccb0';g.beginPath();g.arc(x+16,y-10,3.4,0,TAU);g.fill();}
      else{g.fillStyle=ban;g.beginPath();g.moveTo(x+16,y-8);g.lineTo(x+26,y-5);g.lineTo(x+16,y-2);g.fill();}
      g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=1;g.beginPath();g.moveTo(x+2,y+20);g.lineTo(x+12,y+10);g.moveTo(x+30,y+20);g.lineTo(x+20,y+10);g.stroke();
      return true;}
    case 'e':{ /* стеллаж с банками */
      const top=y-TILE+4;
      g.fillStyle='#3a2414';g.fillRect(x+2,top,28,TILE*2-4);g.fillStyle='#1e120a';g.fillRect(x+4,top+3,24,TILE*2-10);
      g.fillStyle='#4a2c18';for(let k=1;k<4;k++)g.fillRect(x+2,top+k*14,28,3);
      const jc=hell?['#ff4a3a','#9aff40','#5ab8ff','#ffd060']:['#5affc0','#c86aff','#ffd060','#5a8aff'];
      for(let sh=0;sh<4;sh++){for(let k=0;k<3;k++){const c=jc[(h+sh+k)%4],jx=x+6+k*8,jy=top+sh*14+5;
        g.fillStyle=hexA(c,0.85);g.fillRect(jx,jy,5,8);g.fillStyle='#2a2028';g.fillRect(jx,jy-2,5,2);
        if((h+sh*3+k)%4===0)gl(jx+2,jy+4,16,c);}}
      return true;}
    case 'n':{ /* вагонетка с рудой */
      g.fillStyle='#4a3a2c';g.beginPath();g.moveTo(x+2,y+12);g.lineTo(x+30,y+12);g.lineTo(x+26,y+26);g.lineTo(x+6,y+26);g.closePath();g.fill();
      g.fillStyle='#6a5a48';g.fillRect(x+2,y+12,28,3);
      const oc=hell?['#ff5a1a','#ffd23a','#e0203a']:['#b06a3b','#c8c8d0','#ffcc33'];
      for(let k=0;k<5;k++){g.fillStyle=oc[(h+k)%3];g.beginPath();g.arc(x+7+k*4.5,y+11-(k%2)*2,3.4,0,TAU);g.fill();}
      if(hell)gl(x+16,y+10,26,'#ff7a2a');
      g.fillStyle='#1a1a1e';g.beginPath();g.arc(x+9,y+28,3.4,0,TAU);g.arc(x+23,y+28,3.4,0,TAU);g.fill();
      return true;}
    case 't':{ /* телескоп */
      g.strokeStyle='#5a5e6a';g.lineWidth=2;g.beginPath();g.moveTo(x+16,y+14);g.lineTo(x+6,y+32);g.moveTo(x+16,y+14);g.lineTo(x+26,y+32);g.moveTo(x+16,y+14);g.lineTo(x+16,y+32);g.stroke();
      g.save();g.translate(x+16,y+12);g.rotate(-0.7+Math.sin(time*0.2+h)*0.1);
      g.fillStyle='#8a7040';g.fillRect(-14,-4,30,8);g.fillStyle='#b8984a';g.fillRect(-14,-4,30,2);g.fillStyle='#6a5030';g.fillRect(12,-5,6,10);
      g.fillStyle='rgba(180,220,255,'+(0.6+0.3*Math.sin(time*3))+')';g.beginPath();g.arc(18,0,3,0,TAU);g.fill();g.restore();
      gl(x+28,y,20,'#b0d0ff');return true;}
    case 'u':{ /* идол */
      const top=y-TILE*2+4;
      g.fillStyle=hell?'#2a1c1c':'#6a5a30';g.fillRect(x+2,y+20,28,12);g.fillStyle=hell?'#3a2a28':'#8a7a40';g.fillRect(x,y+16,32,6);
      const bc=hell?'#3a2626':'#c8a040';
      g.fillStyle=bc;g.beginPath();g.moveTo(x+8,y+16);g.lineTo(x+6,top+30);g.quadraticCurveTo(x+16,top+18,x+26,top+30);g.lineTo(x+24,y+16);g.closePath();g.fill();
      g.beginPath();g.arc(x+16,top+16,9,0,TAU);g.fill();
      if(hell){g.fillStyle='#e0d4b8';g.beginPath();g.moveTo(x+9,top+12);g.quadraticCurveTo(x+2,top+2,x+6,top-6);g.quadraticCurveTo(x+8,top+4,x+12,top+9);g.fill();
        g.beginPath();g.moveTo(x+23,top+12);g.quadraticCurveTo(x+30,top+2,x+26,top-6);g.quadraticCurveTo(x+24,top+4,x+20,top+9);g.fill();}
      else{g.fillStyle='#e8c860';g.beginPath();g.moveTo(x+8,top+8);g.lineTo(x+16,top-2);g.lineTo(x+24,top+8);g.closePath();g.fill();}
      const ec=hell?'#ff3a1a':'#5affc0',ea=0.6+0.4*Math.sin(time*2+h);
      g.fillStyle=hexA(ec,ea);g.fillRect(x+11,top+14,3,3);g.fillRect(x+18,top+14,3,3);
      gl(x+16,top+15,40,ec);
      g.fillStyle='rgba(255,255,255,.1)';g.fillRect(x+8,top+20,3,30);
      if(hell){for(let k=0;k<3;k++){const fh=8+Math.sin(time*9+k*2)*3;g.fillStyle=k===1?'#ffd060':'#ff5a1a';g.beginPath();g.moveTo(x+10+k*6,y+16);g.quadraticCurveTo(x+12+k*6,y+16-fh,x+14+k*6,y+16);g.fill();}gl(x+16,y+10,36,'#ff6a1a');}
      return true;}
    case 'y':{ /* трон */
      const top=y-TILE+2,c=hell?['#2a1214','#7a1a1a','#d8ccb0']:['#4a2c18','#8a1a2a','#e8c860'];
      g.fillStyle=c[0];g.fillRect(x+4,top,24,TILE*2-2);g.fillRect(x,y+12,32,8);g.fillRect(x+2,y+20,4,12);g.fillRect(x+26,y+20,4,12);
      g.fillStyle=c[1];g.fillRect(x+7,top+4,18,TILE+8);g.fillRect(x+4,y+10,24,4);
      g.fillStyle=c[2];g.beginPath();g.moveTo(x+4,top);g.lineTo(x+8,top-8);g.lineTo(x+12,top);g.moveTo(x+12,top);g.lineTo(x+16,top-11);g.lineTo(x+20,top);g.moveTo(x+20,top);g.lineTo(x+24,top-8);g.lineTo(x+28,top);g.fill();
      if(hell){g.beginPath();g.arc(x+16,top+8,4,0,TAU);g.fill();g.fillStyle='#1a1410';g.fillRect(x+14,top+7,1.5,1.5);g.fillRect(x+17,top+7,1.5,1.5);}
      return true;}
    case '1':{ /* тотем из черепов */
      const top=y-TILE+2;
      g.fillStyle='#3a2a1e';g.fillRect(x+14,top,4,TILE*2-2);
      for(let k=0;k<3;k++){const sy=top+4+k*14;g.fillStyle='#d8ccb0';g.beginPath();g.arc(x+16,sy+4,6,0,TAU);g.fill();g.fillRect(x+12,sy+7,8,4);
        g.fillStyle=k===0?'#ff4a1a':'#1a1410';g.fillRect(x+12.5,sy+2,2.5,2.5);g.fillRect(x+17,sy+2,2.5,2.5);}
      g.fillStyle='#e0d4b8';g.beginPath();g.moveTo(x+11,top+4);g.quadraticCurveTo(x+2,top-4,x+4,top-12);g.quadraticCurveTo(x+7,top-4,x+13,top+1);g.fill();
      g.beginPath();g.moveTo(x+21,top+4);g.quadraticCurveTo(x+30,top-4,x+28,top-12);g.quadraticCurveTo(x+25,top-4,x+19,top+1);g.fill();
      gl(x+16,top+6,22,'#ff4a1a');return true;}
    case '2':{ /* кокон / кладка */
      const p=1+0.06*Math.sin(time*2.4+h);
      const c=hell?(deep<850?['rgba(200,220,80,.55)','#6a7a10']:['rgba(220,200,180,.55)','#7a6a50']):['rgba(230,230,240,.55)','#8a8aa0'];
      g.save();g.translate(x+16,y+20);g.scale(p,p);
      g.fillStyle=c[0];g.beginPath();g.ellipse(0,0,10,13,0,0,TAU);g.fill();g.strokeStyle=c[1];g.lineWidth=1;g.stroke();
      g.strokeStyle='rgba(255,255,255,.35)';g.beginPath();g.moveTo(-8,-6);g.quadraticCurveTo(0,-2,8,-8);g.moveTo(-9,4);g.quadraticCurveTo(0,8,9,2);g.stroke();
      g.fillStyle='rgba(20,10,20,.35)';g.beginPath();g.ellipse(0,1,4,7,0,0,TAU);g.fill();g.restore();
      return true;}
    case '3':{ /* котёл / бак */
      const lc=deep>=550&&deep<850?'#9aff40':'#b0101e';
      g.fillStyle='#1c1a1e';g.beginPath();g.moveTo(x+1,y+10);g.quadraticCurveTo(x,y+32,x+16,y+32);g.quadraticCurveTo(x+32,y+32,x+31,y+10);g.closePath();g.fill();
      g.fillStyle='#2e2a30';g.fillRect(x,y+8,32,4);
      g.fillStyle=lc;g.beginPath();g.ellipse(x+16,y+10,14,3,0,0,TAU);g.fill();
      for(let k=0;k<3;k++){const ph=((time*1.1+k*0.37+h%5*0.1)%1);g.fillStyle=hexA(lc,0.8*(1-ph));g.beginPath();g.arc(x+8+k*8,y+9-ph*16,2+ph*2,0,TAU);g.fill();}
      gl(x+16,y+8,40,lc);
      g.fillStyle='rgba(255,120,40,'+(0.4+0.3*Math.sin(time*6+h))+')';g.fillRect(x+10,y+30,12,2);
      return true;}
    case '4':{ /* труба */
      g.fillStyle='#4a4430';g.fillRect(x+11,y,10,TILE);g.fillStyle='#6a6040';g.fillRect(x+11,y,3,TILE);g.fillStyle='rgba(0,0,0,.3)';g.fillRect(x+18,y,3,TILE);
      if(wy%3===0){g.fillStyle='#7a7048';g.fillRect(x+9,y+12,14,6);g.fillStyle='#3a3420';g.fillRect(x+9,y+17,14,1);}
      if(wy%4===1&&!low&&Math.random()<0.05)spawnPart(x+22,y+14,rnd(10,30),rnd(-30,-10),1.2,'rgba(200,220,150,.5)',4,-10);
      return true;}
    case '5':{ /* ящики */
      for(const [bx,by,bw] of [[2,14,16],[17,18,13],[7,1,13]]){g.fillStyle='#7a5632';g.fillRect(x+bx,y+by,bw,bw);g.strokeStyle='#4a2c14';g.lineWidth=1.4;g.strokeRect(x+bx+0.5,y+by+0.5,bw-1,bw-1);
        g.beginPath();g.moveTo(x+bx,y+by);g.lineTo(x+bx+bw,y+by+bw);g.stroke();g.fillStyle='rgba(255,255,255,.1)';g.fillRect(x+bx,y+by,bw,2);}
      return true;}
    case '6':{ /* стойка с оружием */
      g.fillStyle='#4a2c18';g.fillRect(x+3,y+8,3,24);g.fillRect(x+26,y+8,3,24);g.fillRect(x+3,y+10,26,3);g.fillRect(x+3,y+26,26,3);
      g.fillStyle='#c8ccd8';g.beginPath();g.moveTo(x+10,y+28);g.lineTo(x+11,y-2);g.lineTo(x+12,y+28);g.fill();g.fillStyle='#8a6a3a';g.fillRect(x+8,y+22,6,2);
      g.strokeStyle='#6a4a2a';g.lineWidth=2;g.beginPath();g.moveTo(x+17,y+30);g.lineTo(x+17,y);g.stroke();g.fillStyle='#a8acb8';g.beginPath();g.moveTo(x+14,y+2);g.lineTo(x+17,y-6);g.lineTo(x+20,y+2);g.fill();
      g.strokeStyle='#6a4a2a';g.beginPath();g.moveTo(x+23,y+30);g.lineTo(x+23,y+4);g.stroke();g.fillStyle='#a8acb8';g.beginPath();g.moveTo(x+23,y+4);g.quadraticCurveTo(x+31,y+6,x+29,y+14);g.lineTo(x+23,y+11);g.fill();
      return true;}
    case '7':{ /* груда черепов */
      for(const [sx,sy,r] of [[8,26,5],[16,27,5],[24,26,5],[12,20,4.6],[20,20,4.6],[16,14,4.4]]){g.fillStyle='#d8ccb0';g.beginPath();g.arc(x+sx,y+sy,r,0,TAU);g.fill();
        g.fillStyle='#1a1410';g.fillRect(x+sx-2.6,y+sy-1,1.8,1.8);g.fillRect(x+sx+0.8,y+sy-1,1.8,1.8);}
      g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x+2,y+31,28,1);
      return true;}
    case '8':{ /* кровавый фонтан */
      g.fillStyle='#2a1418';g.beginPath();g.ellipse(x+16,y+28,15,4,0,0,TAU);g.fill();g.fillRect(x+1,y+22,30,7);
      g.fillStyle='#8a0a1a';g.beginPath();g.ellipse(x+16,y+22,13,3,0,0,TAU);g.fill();
      g.fillStyle='#3a1c20';g.fillRect(x+12,y-16,8,38);g.beginPath();g.ellipse(x+16,y-16,8,3,0,0,TAU);g.fill();
      for(let k=0;k<6;k++){const ph=((time*1.6+k/6)%1),dx=(k%2?1:-1)*ph*12,dy=-18+ph*ph*40;g.fillStyle='rgba(190,20,40,'+(1-ph*0.6)+')';g.beginPath();g.arc(x+16+dx,y+dy,2,0,TAU);g.fill();}
      gl(x+16,y+14,40,'#ff2a3a');return true;}
    case '9':{ /* исполинская наковальня */
      g.fillStyle='#1a1a20';g.fillRect(x+6,y+22,20,10);g.fillRect(x+10,y+14,12,9);
      g.beginPath();g.moveTo(x-6,y+4);g.lineTo(x+30,y+4);g.lineTo(x+38,y+9);g.lineTo(x+30,y+15);g.lineTo(x+2,y+15);g.closePath();g.fill();
      g.fillStyle='rgba(255,255,255,.18)';g.fillRect(x-4,y+4,32,2);
      const a=0.5+0.5*Math.sin(time*3+h);g.fillStyle='rgba(255,140,40,'+a.toFixed(2)+')';g.fillRect(x+6,y+5,14,3);
      gl(x+12,y+6,30,'#ff7a2a');
      if(!low&&Math.random()<0.04)for(let k=0;k<6;k++)spawnPart(x+12,y+4,rnd(-90,90),rnd(-160,-40),0.5,'#ffd060',1.6,500);
      return true;}
    case 'j':{ /* крюк с тушей */
      const sw=Math.sin(time*0.9+h%7)*3,len=Math.max(14,y-ceilY+10);
      g.strokeStyle='#4a4a52';g.lineWidth=2;for(let k=0;k<len;k+=6){g.beginPath();g.ellipse(x+16+sw*k/len,ceilY+k+3,1.6,2.8,0,0,TAU);g.stroke();}
      const hx=x+16+sw,hy=ceilY+len+4;
      g.strokeStyle='#8a8e98';g.lineWidth=2.4;g.beginPath();g.arc(hx,hy+5,5,-1.6,1.8);g.stroke();
      if(hell){   /* туша: окорок с костью, прожилки и капли */
        const mg=g.createLinearGradient(hx-8,0,hx+8,0);mg.addColorStop(0,'#5a0e18');mg.addColorStop(0.45,'#a8283a');mg.addColorStop(1,'#4a0a12');
        g.fillStyle='#e8dcc0';g.fillRect(hx-1.6,hy+7,3.2,6);g.beginPath();g.arc(hx-1.4,hy+7,2,0,TAU);g.arc(hx+1.4,hy+7,2,0,TAU);g.fill();
        g.fillStyle=mg;g.beginPath();g.moveTo(hx-4,hy+12);g.quadraticCurveTo(hx-10,hy+22,hx-6,hy+32);g.quadraticCurveTo(hx,hy+36,hx+6,hy+32);g.quadraticCurveTo(hx+10,hy+22,hx+4,hy+12);g.closePath();g.fill();
        g.strokeStyle='rgba(30,0,6,.6)';g.lineWidth=1;g.stroke();
        g.strokeStyle='rgba(240,200,190,.35)';g.lineWidth=1;g.beginPath();g.moveTo(hx-5,hy+19);g.quadraticCurveTo(hx-1,hy+21,hx+2,hy+18);g.moveTo(hx-4,hy+26);g.quadraticCurveTo(hx+1,hy+28,hx+5,hy+24);g.stroke();
        g.fillStyle='rgba(255,220,210,.25)';g.beginPath();g.ellipse(hx-3,hy+18,1.6,4,0.2,0,TAU);g.fill();
        if(!low&&Math.random()<0.03)spawnPart(hx,hy+34,0,20,1,'#a0101e',2,400);}
      return true;}
    case 'v':{ /* паутина */
      const left=isSolid(wx-1,wy),cx=left?x:x+TILE,dir=left?1:-1,yy=ceilY;
      g.strokeStyle='rgba(230,236,245,.5)';g.lineWidth=0.8;
      for(let k=0;k<6;k++){const a=k/5*Math.PI/2;g.beginPath();g.moveTo(cx,yy);g.lineTo(cx+dir*Math.cos(a)*40,yy+Math.sin(a)*40);g.stroke();}
      for(let r=8;r<=40;r+=8){g.beginPath();for(let k=0;k<=5;k++){const a=k/5*Math.PI/2,px=cx+dir*Math.cos(a)*r,py=yy+Math.sin(a)*r;if(k)g.quadraticCurveTo((px+cx+dir*Math.cos(a-0.15)*r)/2,(py+yy+Math.sin(a-0.15)*r)/2+2,px,py);else g.moveTo(px,py);}g.stroke();}
      return true;}
    /* ---------------- ловушки ---------------- */
    case 'f':{ /* огненная струя */
      const st=flameJetState(wx,wy);
      g.fillStyle='#1e1a1c';g.fillRect(x+6,y+24,20,8);g.fillStyle='#3a3034';g.fillRect(x+8,y+22,16,3);
      g.fillStyle=st.warn?'#ffb030':st.on?'#fff0a0':'#5a2a14';g.beginPath();g.ellipse(x+16,y+23,6,2,0,0,TAU);g.fill();
      if(st.warn&&!low&&Math.random()<0.4)spawnPart(x+16+rnd(-5,5),y+20,rnd(-20,20),rnd(-120,-60),0.3,'#ffd060',1.8,200);
      if(st.on){
        const hgt=TILE*2.8*st.k;
        const gr=g.createLinearGradient(0,y+22,0,y+22-hgt);gr.addColorStop(0,'rgba(255,250,200,.95)');gr.addColorStop(0.35,'rgba(255,150,40,.85)');gr.addColorStop(1,'rgba(255,60,10,0)');
        g.fillStyle=gr;g.beginPath();g.moveTo(x+8,y+22);
        for(let k=0;k<=6;k++){const yy=y+22-hgt*k/6;g.lineTo(x+10+6*Math.sin(time*18+k*1.3)-k*0.6,yy);}
        for(let k=6;k>=0;k--){const yy=y+22-hgt*k/6;g.lineTo(x+22-6*Math.sin(time*16+k*1.1+2)+k*0.6,yy);}
        g.closePath();g.fill();gl(x+16,y-20,80,'#ff7a2a');
        if(!low&&Math.random()<0.5)spawnPart(x+16+rnd(-6,6),y-rnd(0,hgt),rnd(-20,20),rnd(-80,-30),0.4,'#ffb050',2.6,-20);
      }
      return true;}
    case 'p':{ /* давилка */
      const st=crusherState(wx,wy,ceilY);
      const top=ceilY,len=Math.max(0,(st.floorY-top)*st.e);
      g.fillStyle='#2a2628';g.fillRect(x+12,top,8,len+2);g.fillStyle='#4a4448';g.fillRect(x+12,top,2,len+2);
      const by=top+len,shake=st.warn?rnd(-1.5,1.5):0;
      g.fillStyle='#3a3438';g.fillRect(x-4+shake,by-2,40,12);g.fillStyle='#5a5258';g.fillRect(x-4+shake,by-2,40,3);
      g.fillStyle='#8a8e98';for(let k=0;k<5;k++){g.beginPath();g.moveTo(x-2+k*9+shake,by+10);g.lineTo(x+2+k*9+shake,by+17);g.lineTo(x+6+k*9+shake,by+10);g.fill();}
      g.fillStyle='rgba(255,90,40,'+(st.warn?0.8:0.25)+')';g.fillRect(x+8,top+4,16,3);
      return true;}
    case 's':{ /* круг призыва */
      const key=q.px+','+q.py,done=G.wf.done&&G.wf.done.indexOf(key)>=0,act=G.circ&&G.circ[key];
      const a=done?0.15:act?0.85:0.45+0.2*Math.sin(time*2+h);
      const c=done?'#5ab8ff':'#ff3a6a';
      g.save();g.translate(x+16,y+30);g.scale(1,0.32);
      g.strokeStyle=hexA(c,a);g.lineWidth=4;g.beginPath();g.arc(0,0,70,0,TAU);g.stroke();g.beginPath();g.arc(0,0,56,0,TAU);g.stroke();
      g.lineWidth=3;g.beginPath();for(let k=0;k<=5;k++){const ang=-Math.PI/2+k*TAU*2/5+time*(act?0.8:0.15);const px=Math.cos(ang)*56,py=Math.sin(ang)*56;if(k)g.lineTo(px,py);else g.moveTo(px,py);}g.stroke();
      g.restore();
      if(!done){gl(x+16,y+24,act?120:70,c);if(act&&!low&&Math.random()<0.5)spawnPart(x+16+rnd(-60,60),y+28,0,rnd(-90,-40),0.8,c,2.4,-20);}
      return true;}
    case 'k':{ /* запертый сундук */
      const unlocked=lockedChestOpen(q),open=openedChests.has(wx+','+wy);
      g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(x+16,y+31,15,3,0,0,TAU);g.fill();
      g.fillStyle=hell?'#3a1a14':'#4a2a10';g.fillRect(x+2,y+14,28,17);
      g.fillStyle='#c8a030';g.fillRect(x+2,y+14,4,17);g.fillRect(x+26,y+14,4,17);g.fillRect(x+2,y+21,28,2);
      if(open){g.fillStyle='#120804';g.fillRect(x+4,y+10,24,5);g.fillStyle=hell?'#4a2218':'#5a3416';g.beginPath();g.moveTo(x+2,y+11);g.lineTo(x+7,y);g.lineTo(x+30,y);g.lineTo(x+30,y+11);g.closePath();g.fill();}
      else{g.fillStyle=hell?'#4a2218':'#5a3416';g.beginPath();g.moveTo(x+2,y+15);g.quadraticCurveTo(x+16,y+1,x+30,y+15);g.closePath();g.fill();
        if(!unlocked){g.strokeStyle='#7a7e88';g.lineWidth=2.4;g.beginPath();g.moveTo(x,y+12);g.lineTo(x+32,y+28);g.moveTo(x+32,y+12);g.lineTo(x,y+28);g.stroke();
          g.fillStyle='#9a9ea8';g.fillRect(x+12,y+18,8,8);g.fillStyle='#2a2a30';g.fillRect(x+15,y+21,2,3);
          const a=0.4+0.3*Math.sin(time*4);gl(x+16,y+20,26,'#ff3a3a');g.fillStyle='rgba(255,60,60,'+a+')';g.fillRect(x+13,y+15,6,2);}
        else{const a=0.6+0.4*Math.sin(time*3);gl(x+16,y+16,48+a*12,'#ffd060');g.fillStyle='#ffe066';g.fillRect(x+13,y+16,6,7);
          if(!low&&Math.random()<0.06)spawnPart(x+6+Math.random()*20,y+8,0,-20,1,'#ffe9a0',1.6,0);}}
      return true;}
    case 'q':case 'h':case 'z':{ /* крепление стражей-ловушек */
      const dead=G.wf.trd&&G.wf.trd.indexOf(wx+','+wy)>=0;
      if(ch==='q'){const left=isSolid(wx-1,wy),bx=left?x:x+TILE-8;g.fillStyle=dead?'#2a2226':'#3a2e30';g.fillRect(bx,y+6,8,20);
        if(dead){g.fillStyle='#5a4a48';g.beginPath();g.arc(left?x+12:x+20,y+28,5,0,TAU);g.fill();}}
      else if(dead){g.fillStyle=ch==='h'?'rgba(90,10,20,.7)':'rgba(80,40,140,.5)';g.beginPath();g.ellipse(x+16,y+(ch==='h'?30:22),12,4,0,0,TAU);g.fill();}
      return true;}
  }
  return false;
}
function flameJetState(wx,wy){
  const P=3.2,ph=(G.time+wx*0.41)%P;
  return {warn:ph>=1.2&&ph<1.7,on:ph>=1.7&&ph<2.9,k:clamp(Math.min(ph-1.7,2.9-ph)/0.15,0,1)};
}
function crusherState(wx,wy,ceilY){
  const P=2.6,ph=(G.time+wx*0.53)%P;
  let e;if(ph<0.9)e=0;else if(ph<1.02)e=(ph-0.9)/0.12;else if(ph<1.5)e=1;else e=1-(ph-1.5)/1.1;
  const fr=glyphFloorRow(wx,wy);
  return {e:clamp(e,0,1),warn:ph>=0.55&&ph<0.9,floorY:(fr>=0?(fr+1)*TILE:ceilY+TILE*3)-26};
}
function drawStructDecor(g,tx0,tx1,ty0,ty1){
  const lst=structList(tx0,tx1,ty0,ty1);
  if(!lst.length)return;
  const time=G.time,low=settings.quality==='low';
  const glows=[];
  const gl=(x,y,r,c)=>{if(glows.length<70)glows.push([x,y,r,c]);};
  g.save();
  /* 2) предметы */
  for(const q of lst){
    const ban=STRUCT_BANNER[q.st.id]||'#8a2a24';
    for(let r=0;r<q.th;r++){
      const row=q.st.tpl[r];
      for(let c=0;c<q.tw;c++){
        const ch=row[c];
        if('LHWQZJECAFTSBKYUNOGRXcmMPVDrI!0%=|adetuny123456789jpvqfhksz'.indexOf(ch)<0)continue;
        const wx=q.px+c,wy=q.py+r;
        if(wx<tx0-1||wx>tx1+1||wy<ty0-2||wy>ty1+2)continue;
        if(getTile(wx,wy)!==T_AIR)continue;
        const x=wx*TILE;
        const h=hash2(wx,wy,77);
        /* напольные предметы стоят на полу, потолочные висят на потолке */
        let y=wy*TILE;
        if('CAFTSBKYUNOGRXcmMPDradetuny12356789fhks'.indexOf(ch)>=0){const fr=glyphFloorRow(wx,wy);if(fr<0)continue;y=fr*TILE;}
        let ceilY=y;
        if('LHWQZJI!0jpv'.indexOf(ch)>=0){const cr=glyphCeilRow(wx,wy);if(cr<0)continue;ceilY=cr*TILE;}
        if(drawGlyph11(g,ch,x,y,ceilY,wx,wy,h,time,low,gl,ban,q))continue;
        switch(ch){
          case 'L':{
            const ly=y+8,sw=Math.sin(time*1.6+h%7)*1.5;
            g.strokeStyle='#4a4a52';g.lineWidth=1.4;g.beginPath();g.moveTo(x+16,ceilY);g.lineTo(x+16+sw,ly);g.stroke();
            g.fillStyle='#2a2a30';g.fillRect(x+10+sw,ly,12,3);
            g.fillStyle='#caa24a';g.fillRect(x+11+sw,ly+3,10,13);
            const fl=0.8+0.2*Math.sin(time*11+h);
            g.fillStyle='rgba(255,'+Math.floor(200+40*fl)+',140,1)';g.fillRect(x+13+sw,ly+5,6,9);
            g.fillStyle='#2a2a30';g.fillRect(x+10+sw,ly+16,12,2);
            gl(x+16,ly+10,74*fl,'#ffd98a');break;}
          case 'D':{
            const soul=wy>=850&&wy<1200;const fc=soul?['#5ab8ff','#d8f4ff','#3a8aff']:['#ff6a1a','#ffe08a','#ff3a0a'];
            g.fillStyle='#1c1416';g.fillRect(x+13,y+16,6,16);g.fillRect(x+8,y+29,16,3);
            g.fillStyle='#3a2a2a';g.beginPath();g.moveTo(x+4,y+10);g.lineTo(x+28,y+10);g.lineTo(x+22,y+18);g.lineTo(x+10,y+18);g.closePath();g.fill();
            g.fillStyle='#5a4040';g.fillRect(x+4,y+10,24,2);
            for(let k=0;k<3;k++){const fx=x+10+k*6,fh=10+Math.sin(time*11+k*2+h)*3;g.fillStyle=k===1?fc[1]:fc[0];g.beginPath();g.moveTo(fx-4,y+11);g.quadraticCurveTo(fx,y+11-fh*1.5,fx+4,y+11);g.closePath();g.fill();}
            gl(x+16,y+4,76,fc[2]);
            if(!low&&Math.random()<0.06)spawnPart(x+16+rnd(-6,6),y,rnd(-10,10),rnd(-60,-30),0.9,fc[0],2,-20);
            break;}
          case 'r':{
            const top=y-TILE*2+6;
            g.fillStyle='#22202c';g.fillRect(x+8,top,16,y+TILE-top);
            g.fillStyle='#2e2a3a';g.fillRect(x+6,top,20,5);g.fillRect(x+6,y+TILE-5,20,5);
            const a=0.45+0.35*Math.sin(time*2+h%7);
            g.fillStyle='rgba(120,210,255,'+a.toFixed(2)+')';
            for(let k=0;k<4;k++)g.fillRect(x+13+((k%2)?2:-1),top+10+k*10,4,5);
            gl(x+16,top+26,50,'#5ab8ff');
            break;}
          case 'I':{
            const sw=Math.sin(time*1.1+h%9)*3,len=Math.max(10,y-ceilY+6);
            g.strokeStyle='#4a4a52';g.lineWidth=2;g.beginPath();g.moveTo(x+16,ceilY);g.lineTo(x+16+sw,ceilY+len);g.stroke();
            const cx=x+16+sw,cy=ceilY+len;
            g.strokeStyle='#5a5a62';g.lineWidth=1.6;
            g.beginPath();g.ellipse(cx,cy,9,3,0,0,TAU);g.stroke();
            for(let k=-2;k<=2;k++){g.beginPath();g.moveTo(cx+k*4,cy);g.lineTo(cx+k*4,cy+22);g.stroke();}
            g.beginPath();g.ellipse(cx,cy+22,9,3,0,0,TAU);g.stroke();
            g.fillStyle='#d8d0bc';g.beginPath();g.arc(cx,cy+15,3.6,0,TAU);g.fill();g.fillRect(cx-2,cy+17,4,4);
            g.fillStyle='#1a1410';g.fillRect(cx-2,cy+14,1.5,1.5);g.fillRect(cx+0.8,cy+14,1.5,1.5);
            break;}
          case 'H':{
            const sw=Math.sin(time*1.2+h%9)*3,len=y-ceilY+20;
            g.strokeStyle='#5a5a62';g.lineWidth=2;
            for(let k=0;k<len;k+=5){const t1=k/len;g.beginPath();g.ellipse(x+16+sw*t1,ceilY+k+2,1.6,2.6,0,0,TAU);g.stroke();}
            g.beginPath();g.arc(x+16+sw,ceilY+len+4,4,0,Math.PI*1.2);g.stroke();
            break;}
          case 'W':{
            const left=isSolid(wx-1,wy),cx=left?x:x+TILE,dir=left?1:-1;
            g.strokeStyle='rgba(230,236,245,.55)';g.lineWidth=0.8;
            for(let k=0;k<5;k++){const a=k/4*Math.PI/2;g.beginPath();g.moveTo(cx,y);g.lineTo(cx+dir*Math.cos(a)*28,y+Math.sin(a)*28);g.stroke();}
            for(let rr2=8;rr2<=28;rr2+=7){g.beginPath();for(let k=0;k<=4;k++){const a=k/4*Math.PI/2;const px=cx+dir*Math.cos(a)*rr2,py=y+Math.sin(a)*rr2;if(k)g.lineTo(px,py);else g.moveTo(px,py);}g.stroke();}
            break;}
          case 'Q':{
            const sw=Math.sin(time*1.4+h%5)*2;
            g.fillStyle='#3a2a1a';g.fillRect(x+3,ceilY+2,26,3);
            g.fillStyle=ban;
            g.beginPath();g.moveTo(x+6,ceilY+5);g.lineTo(x+26,ceilY+5);g.lineTo(x+26+sw,ceilY+40);g.lineTo(x+16+sw,ceilY+33);g.lineTo(x+6+sw,ceilY+40);g.closePath();g.fill();
            g.fillStyle='rgba(255,255,255,.12)';g.fillRect(x+7,ceilY+5,4,30);
            g.fillStyle='#ffd98a';g.beginPath();g.arc(x+16+sw*0.5,ceilY+18,4.5,0,TAU);g.fill();
            g.fillStyle=ban;g.beginPath();g.arc(x+16+sw*0.5,ceilY+18,2,0,TAU);g.fill();
            break;}
          case 'Z':{
            g.strokeStyle='#5c3b1f';g.lineWidth=2.2;
            for(let k=0;k<3;k++){const ox=x+7+k*9,sw=Math.sin(time*1.3+wx+k)*2,l=14+((h>>>(k*3))%14);
              g.beginPath();g.moveTo(ox,ceilY);g.quadraticCurveTo(ox+3+sw,ceilY+l*0.5,ox-1+sw*1.5,ceilY+l);g.stroke();}
            break;}
          case 'J':{
            const cc=['#9b7cff','#5cc8ff','#d38cff'][h%3];
            g.fillStyle=cc;g.globalAlpha=0.9;
            g.beginPath();g.moveTo(x+9,ceilY);g.lineTo(x+23,ceilY);g.lineTo(x+16,ceilY+22+(h%10));g.closePath();g.fill();
            g.fillStyle='rgba(255,255,255,.45)';g.beginPath();g.moveTo(x+14,ceilY);g.lineTo(x+17,ceilY);g.lineTo(x+16,ceilY+14);g.closePath();g.fill();
            g.globalAlpha=1;gl(x+16,ceilY+12,34,cc);break;}
          case 'E':{
            const left=isSolid(wx-1,wy),bx=left?x+3:x+TILE-3,dir=left?1:-1;
            g.strokeStyle='#3a3a40';g.lineWidth=3;g.beginPath();g.moveTo(bx,y+16);g.lineTo(bx+dir*8,y+12);g.stroke();
            g.fillStyle='#5a3a20';g.fillRect(bx+dir*8-2,y+8,4,8);
            const fl=0.75+0.25*Math.sin(time*13+h);
            g.fillStyle='rgba(255,150,40,.95)';g.beginPath();g.moveTo(bx+dir*8-4,y+9);g.quadraticCurveTo(bx+dir*8,y-4-fl*4,bx+dir*8+4,y+9);g.closePath();g.fill();
            g.fillStyle='rgba(255,240,170,.95)';g.beginPath();g.ellipse(bx+dir*8,y+6,2,4*fl,0,0,TAU);g.fill();
            gl(bx+dir*8,y+4,64*fl,'#ffa040');
            if(!low&&Math.random()<0.04)spawnPart(bx+dir*8,y,rnd(-8,8),rnd(-40,-20),0.6,'#ffb050',1.6,-20);
            break;}
          case 'C':{
            const open=openedChests.has(wx+','+wy);
            g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(x+16,y+31,14,3,0,0,TAU);g.fill();
            g.fillStyle='#6a4018';g.fillRect(x+4,y+16,24,15);
            g.fillStyle='#82521f';g.fillRect(x+4,y+16,24,4);
            g.fillStyle='#b8902a';g.fillRect(x+4,y+16,3,15);g.fillRect(x+25,y+16,3,15);g.fillRect(x+4,y+22,24,2);
            if(open){
              g.fillStyle='#2a1a0a';g.fillRect(x+6,y+12,20,5);
              g.fillStyle='#82521f';g.beginPath();g.moveTo(x+4,y+13);g.lineTo(x+8,y+3);g.lineTo(x+28,y+3);g.lineTo(x+28,y+13);g.closePath();g.fill();
              g.fillStyle='#b8902a';g.fillRect(x+8,y+3,20,2);
            }else{
              g.fillStyle='#82521f';g.beginPath();g.moveTo(x+4,y+17);g.quadraticCurveTo(x+16,y+5,x+28,y+17);g.closePath();g.fill();
              g.strokeStyle='#b8902a';g.lineWidth=2;g.beginPath();g.moveTo(x+4,y+17);g.quadraticCurveTo(x+16,y+5,x+28,y+17);g.stroke();
              g.fillStyle='#ffe066';g.fillRect(x+13,y+18,6,7);g.fillStyle='#3a2a0a';g.fillRect(x+15,y+20,2,3);
              const a=0.5+0.5*Math.sin(time*3+h%5);
              gl(x+16,y+18,30+a*10,'#ffd060');
              if(!low&&Math.random()<0.03)spawnPart(x+6+Math.random()*20,y+10,0,-14,0.8,'#ffe9a0',1.4,0);
            }
            break;}
          case 'A':
            g.fillStyle='#4a3a2a';g.fillRect(x+9,y+24,14,8);
            g.fillStyle='#2a2d34';g.fillRect(x+11,y+18,10,7);
            g.beginPath();g.moveTo(x+3,y+12);g.lineTo(x+26,y+12);g.lineTo(x+31,y+16);g.lineTo(x+26,y+19);g.lineTo(x+7,y+19);g.closePath();g.fill();
            g.fillStyle='rgba(255,255,255,.22)';g.fillRect(x+5,y+12,21,2);
            g.strokeStyle='#6a4a2a';g.lineWidth=2.5;g.beginPath();g.moveTo(x+20,y+11);g.lineTo(x+27,y+2);g.stroke();
            g.fillStyle='#3a3a40';g.fillRect(x+24,y-1,8,5);break;
          case 'F':{
            g.fillStyle='#4a3a32';g.fillRect(x+1,y+4,30,28);
            g.fillStyle='#5a4a40';for(let k=0;k<4;k++)g.fillRect(x+1+((k%2)?0:8),y+4+k*7,14,1);
            g.fillStyle='#1a1214';g.beginPath();g.moveTo(x+7,y+30);g.lineTo(x+7,y+18);g.quadraticCurveTo(x+16,y+9,x+25,y+18);g.lineTo(x+25,y+30);g.closePath();g.fill();
            const f=0.6+0.4*Math.sin(time*9+h%7);
            for(let k=0;k<3;k++){const fx=x+11+k*5,fh=8+Math.sin(time*10+k*2)*3+f*3;
              g.fillStyle=k===1?'rgba(255,230,140,.95)':'rgba(255,110,30,.9)';
              g.beginPath();g.moveTo(fx-3,y+30);g.quadraticCurveTo(fx,y+30-fh*1.4,fx+3,y+30);g.closePath();g.fill();}
            gl(x+16,y+22,66,'#ff7a2a');
            if(!low&&Math.random()<0.08)spawnPart(x+16+rnd(-6,6),y+4,rnd(-10,10),rnd(-60,-30),0.9,'#ffb050',2,-20);
            break;}
          case 'T':
            g.fillStyle='#6a4a2a';g.fillRect(x+2,y+17,28,4);g.fillRect(x+5,y+21,3,11);g.fillRect(x+24,y+21,3,11);
            g.fillStyle='#8a6a3a';g.fillRect(x+2,y+17,28,1);
            g.fillStyle='#e8e0c8';g.fillRect(x+7,y+11,4,6);
            {const f=0.7+0.3*Math.sin(time*12+h);g.fillStyle='rgba(255,210,120,.95)';g.beginPath();g.ellipse(x+9,y+9,1.6,3*f,0,0,TAU);g.fill();gl(x+9,y+9,26,'#ffd98a');}
            g.fillStyle='#8a5a30';g.fillRect(x+18,y+11,6,6);g.fillStyle='#d8c070';g.fillRect(x+19,y+12,4,2);
            break;
          case 'S':
            g.fillStyle='rgba(0,0,0,.3)';g.fillRect(x+2,y+30,28,2);
            g.fillStyle='#7a8090';g.fillRect(x+2,y+17,28,14);
            g.fillStyle='#9aa0ae';g.beginPath();g.moveTo(x+1,y+17);g.lineTo(x+6,y+11);g.lineTo(x+26,y+11);g.lineTo(x+31,y+17);g.closePath();g.fill();
            g.fillStyle='#5a6070';g.fillRect(x+15,y+12,2,12);g.fillRect(x+11,y+15,10,2);
            g.fillStyle='rgba(0,0,0,.2)';g.fillRect(x+2,y+24,28,1);
            break;
          case 'B':
            g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(x+16,y+31,11,2.4,0,0,TAU);g.fill();
            g.fillStyle='#6a4018';g.beginPath();g.moveTo(x+7,y+10);g.quadraticCurveTo(x+4,y+21,x+7,y+31);g.lineTo(x+25,y+31);g.quadraticCurveTo(x+28,y+21,x+25,y+10);g.closePath();g.fill();
            g.fillStyle='rgba(255,255,255,.12)';g.fillRect(x+10,y+11,3,19);
            g.fillStyle='#3a3a40';g.fillRect(x+6,y+14,20,2);g.fillRect(x+6,y+26,20,2);
            g.fillStyle='#5a3410';g.beginPath();g.ellipse(x+16,y+10,9,2.4,0,0,TAU);g.fill();
            break;
          case 'K':
            g.fillStyle='rgba(0,0,0,.3)';g.fillRect(x+3,y+30,26,2);
            g.fillStyle='#7a5632';g.fillRect(x+4,y+8,24,23);
            g.strokeStyle='#4a2c14';g.lineWidth=2;g.strokeRect(x+5,y+9,22,21);
            g.beginPath();g.moveTo(x+5,y+9);g.lineTo(x+27,y+30);g.moveTo(x+27,y+9);g.lineTo(x+5,y+30);g.stroke();
            g.fillStyle='rgba(255,255,255,.1)';g.fillRect(x+5,y+9,22,2);
            break;
          case 'Y':
            g.fillStyle='#e0d8c4';
            g.save();g.translate(x+10,y+29);g.rotate(0.3);g.fillRect(-7,-1.5,14,3);g.beginPath();g.arc(-7,0,2.4,0,TAU);g.arc(7,0,2.4,0,TAU);g.fill();g.restore();
            g.save();g.translate(x+22,y+30);g.rotate(-0.5);g.fillRect(-6,-1.5,12,3);g.beginPath();g.arc(-6,0,2.2,0,TAU);g.arc(6,0,2.2,0,TAU);g.fill();g.restore();
            g.beginPath();g.arc(x+17,y+22,6,0,TAU);g.fill();g.fillRect(x+13,y+24,8,5);
            g.fillStyle='#1a1410';g.beginPath();g.arc(x+15,y+22,1.8,0,TAU);g.arc(x+19.5,y+22,1.8,0,TAU);g.fill();
            g.fillRect(x+15,y+27,1,2);g.fillRect(x+17,y+27,1,2);g.fillRect(x+19,y+27,1,2);
            break;
          case 'U':{
            g.fillStyle='#1c1c22';g.beginPath();g.moveTo(x+4,y+14);g.quadraticCurveTo(x+4,y+31,x+16,y+31);g.quadraticCurveTo(x+28,y+31,x+28,y+14);g.closePath();g.fill();
            g.fillStyle='#2a2a32';g.fillRect(x+3,y+12,26,3);
            g.fillStyle='#5ae070';g.beginPath();g.ellipse(x+16,y+14,11,2.6,0,0,TAU);g.fill();
            for(let k=0;k<3;k++){const ph=((time*1.2+k*0.37+h%5*0.1)%1);g.fillStyle='rgba(140,255,150,'+(0.8*(1-ph))+')';g.beginPath();g.arc(x+9+k*7,y+12-ph*14,2+ph*1.5,0,TAU);g.fill();}
            gl(x+16,y+12,40,'#5ae070');
            g.strokeStyle='#3a2a1a';g.lineWidth=2;g.beginPath();g.moveTo(x+8,y+31);g.lineTo(x+6,y+32);g.moveTo(x+24,y+31);g.lineTo(x+26,y+32);g.stroke();
            break;}
          case 'N':{
            const top=y-TILE+4;
            g.fillStyle='#4a2c14';g.fillRect(x+2,top,28,TILE*2-4);
            g.fillStyle='#2a1a0a';g.fillRect(x+4,top+3,24,TILE*2-10);
            g.fillStyle='#4a2c14';for(let k=1;k<4;k++)g.fillRect(x+2,top+k*14,28,3);
            const bc=['#8a2a24','#2a5a8a','#3a7a3a','#caa24a','#6a3a8a'];
            for(let sh=0;sh<4;sh++){let bx=x+5;while(bx<x+26){const bw=2+((h>>>(bx+sh))%3);g.fillStyle=bc[(bx+sh*3+h)%5];g.fillRect(bx,top+sh*14+4+((bx*7+sh)%3),bw,10-((bx*7+sh)%3));bx+=bw+1;}}
            break;}
          case 'O':{   /* каменная статуя стража: цоколь, фигура в плаще с мечом, мягкий объём */
            const top=y-TILE+2,sc=G.dim===1?['#5a4a4a','#7a6868','#3a2e2e']:['#6a6e7a','#9298a6','#454952'];
            g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(x+16,y+32,14,2.4,0,0,TAU);g.fill();
            /* цоколь в две ступени */
            g.fillStyle=sc[2];g.fillRect(x+3,y+26,26,6);g.fillStyle=sc[0];g.fillRect(x+5,y+22,22,5);
            g.fillStyle='rgba(255,255,255,.14)';g.fillRect(x+3,y+26,26,1);g.fillRect(x+5,y+22,22,1);
            /* плащ */
            const gr=g.createLinearGradient(x+8,0,x+24,0);gr.addColorStop(0,sc[1]);gr.addColorStop(0.5,sc[0]);gr.addColorStop(1,sc[2]);
            g.fillStyle=gr;g.beginPath();g.moveTo(x+8,y+22);g.quadraticCurveTo(x+9,top+30,x+11,top+20);g.lineTo(x+21,top+20);g.quadraticCurveTo(x+23,top+30,x+24,y+22);g.closePath();g.fill();
            g.strokeStyle='rgba(0,0,0,.22)';g.lineWidth=1;g.beginPath();g.moveTo(x+13,top+24);g.lineTo(x+12,y+22);g.moveTo(x+17,top+24);g.lineTo(x+17.5,y+22);g.moveTo(x+21,top+26);g.lineTo(x+22,y+21);g.stroke();
            /* плечи и голова в капюшоне */
            g.fillStyle=sc[0];g.beginPath();g.ellipse(x+16,top+21,7,3,0,0,TAU);g.fill();
            g.fillStyle=sc[1];g.beginPath();g.moveTo(x+11,top+19);g.quadraticCurveTo(x+11,top+8,x+16,top+7);g.quadraticCurveTo(x+21,top+8,x+21,top+19);g.closePath();g.fill();
            g.fillStyle=sc[2];g.beginPath();g.ellipse(x+16,top+15,3,3.6,0,0,TAU);g.fill();
            /* меч остриём вниз, руки на гарде */
            g.fillStyle=sc[1];g.fillRect(x+15,top+24,2,y+20-(top+24));g.fillStyle=sc[2];g.fillRect(x+12,top+23,8,2);
            g.fillStyle=sc[0];g.beginPath();g.arc(x+13.5,top+23.5,1.8,0,TAU);g.arc(x+18.5,top+23.5,1.8,0,TAU);g.fill();
            g.fillStyle='rgba(255,255,255,.18)';g.fillRect(x+12,top+10,1.4,10);
            /* мох и трещина */
            g.fillStyle='rgba(80,120,60,.55)';g.fillRect(x+5,y+21,4,2);g.fillRect(x+22,y+25,4,2);
            g.strokeStyle='rgba(0,0,0,.3)';g.lineWidth=0.8;g.beginPath();g.moveTo(x+20,top+28);g.lineTo(x+19,top+34);g.lineTo(x+21,top+38);g.stroke();
            if(G.dim===1||h%3===0){g.fillStyle='rgba(160,120,255,'+(0.4+0.4*Math.sin(time*2+h))+')';g.fillRect(x+14.4,top+14.2,1.2,1.2);g.fillRect(x+16.6,top+14.2,1.2,1.2);}
            break;}
          case 'G':
            g.fillStyle='rgba(0,0,0,.3)';g.fillRect(x+6,y+30,20,2);
            g.fillStyle='#6a6e78';g.beginPath();g.moveTo(x+8,y+31);g.lineTo(x+8,y+14);g.quadraticCurveTo(x+16,y+4,x+24,y+14);g.lineTo(x+24,y+31);g.closePath();g.fill();
            g.fillStyle='rgba(255,255,255,.12)';g.fillRect(x+9,y+14,3,16);
            g.fillStyle='#3a3e48';g.fillRect(x+15,y+12,2,12);g.fillRect(x+12,y+15,8,2);
            g.fillStyle='#4a7a36';g.fillRect(x+7,y+29,4,2);g.fillRect(x+21,y+28,3,3);
            break;
          case 'R':
            g.fillStyle='#4e3720';for(let k=0;k<3;k++)g.fillRect(x+2+k*11,y+28,7,4);
            g.fillStyle='#8a8e98';g.fillRect(x,y+25,TILE,2);g.fillRect(x,y+29,TILE,1);
            break;
          case 'X':
            g.fillStyle='#4e3720';for(let k=0;k<3;k++)g.fillRect(x+2+k*11,y+28,7,4);
            g.fillStyle='#8a8e98';g.fillRect(x-4,y+25,TILE+8,2);
            g.fillStyle='#5a4a3c';g.beginPath();g.moveTo(x+2,y+10);g.lineTo(x+30,y+10);g.lineTo(x+26,y+24);g.lineTo(x+6,y+24);g.closePath();g.fill();
            g.fillStyle='#7a6a58';g.fillRect(x+2,y+10,28,3);
            g.fillStyle=['#b06a3b','#c8c8d0','#ffcc33'][h%3];for(let k=0;k<4;k++){g.beginPath();g.arc(x+7+k*6,y+9-(k%2)*2,3.5,0,TAU);g.fill();}
            g.fillStyle='#222';g.beginPath();g.arc(x+9,y+26,3.4,0,TAU);g.arc(x+23,y+26,3.4,0,TAU);g.fill();
            break;
          case 'P':{
            const pc=['#9b7cff','#5cc8ff','#d38cff'][h%3];
            g.fillStyle=pc;g.globalAlpha=0.92;
            g.beginPath();g.moveTo(x+7,y+TILE);g.lineTo(x+12,y-10);g.lineTo(x+16,y-28);g.lineTo(x+20,y-10);g.lineTo(x+25,y+TILE);g.closePath();g.fill();
            g.fillStyle='rgba(255,255,255,.4)';g.beginPath();g.moveTo(x+14,y+TILE);g.lineTo(x+16,y-22);g.lineTo(x+17,y+TILE);g.closePath();g.fill();
            g.globalAlpha=1;gl(x+16,y-4,56,pc);break;}
          case 'c':{
            const cc=['#c58bff','#7fe0ff','#ff8fd8','#9bffcf'];
            for(let k=0;k<3;k++){
              const col=cc[(h+k)%4],bx=x+6+k*9,hh=12+((h>>>(k*3))%14);
              g.fillStyle=col;g.globalAlpha=0.92;
              g.beginPath();g.moveTo(bx-4,y+TILE);g.lineTo(bx+4,y+TILE);g.lineTo(bx+1,y+TILE-hh);g.closePath();g.fill();
              g.globalAlpha=1;gl(bx,y+TILE-hh*0.6,24,col);
            }
            break;}
          case 'm':
            g.fillStyle='#d8cfa8';g.fillRect(x+14,y+22,3,10);
            g.fillStyle='#5ac8b0';g.beginPath();g.ellipse(x+15.5,y+22,7,5,0,Math.PI,0);g.fill();
            g.fillStyle='rgba(255,255,255,.6)';g.fillRect(x+12,y+19,2,2);
            gl(x+16,y+20,36,'#7dffb0');break;
          case 'M':{
            g.fillStyle='#d8cfa8';g.fillRect(x+13,y-14,6,46);
            g.fillStyle='rgba(0,0,0,.15)';g.fillRect(x+16,y-14,3,46);
            const mc=['#d85a5a','#b48ae0','#e8b04a'][h%3];
            g.fillStyle=mc;g.beginPath();g.ellipse(x+16,y-14,20,11,0,Math.PI,0);g.fill();
            g.fillStyle='rgba(0,0,0,.2)';g.beginPath();g.ellipse(x+16,y-14,20,3,0,0,Math.PI);g.fill();
            g.fillStyle='rgba(255,255,255,.75)';g.fillRect(x+6,y-21,3,3);g.fillRect(x+18,y-24,3,3);g.fillRect(x+25,y-18,3,3);
            gl(x+16,y-12,62,'#7dffb0');break;}
          case 'V':{
            for(let k=0;k<4;k++){
              const rr2=24-k*4,a=time*(1+k*0.5);
              const gr=g.createRadialGradient(x+16,y+16,2,x+16,y+16,rr2);
              gr.addColorStop(0,'rgba(220,180,255,'+(0.6-k*0.1)+')');gr.addColorStop(1,'rgba(90,20,170,0)');
              g.fillStyle=gr;g.save();g.translate(x+16,y+16);g.rotate(a);g.beginPath();g.ellipse(0,0,rr2,rr2*0.42,0,0,TAU);g.fill();g.restore();
            }
            gl(x+16,y+16,96,'#a060ff');
            if(!low&&Math.random()<0.2)spawnPart(x+16+rnd(-14,14),y+16+rnd(-8,8),rnd(-10,10),rnd(-30,-10),1,'#c8a0ff',1.8,-20);
            break;}
        }
      }
    }
  }
  g.restore();
  if(glows.length)drawGlowList(g,glows,0.4);
}

/* ---------------- вода ---------------- */
const LIQ_LOOK={
  9:{deep:'rgba(36,98,176,0.50)',top:'rgba(46,120,200,0.46)',line:'rgba(205,238,255,.85)',caust:'190,230,255',glint:'rgba(255,255,255,.7)'},
  22:{deep:'rgba(70,170,40,0.62)',top:'rgba(110,210,60,0.55)',line:'rgba(210,255,150,.9)',caust:'200,255,140',glint:'rgba(230,255,190,.8)'},
  23:{deep:'rgba(110,6,20,0.78)',top:'rgba(150,12,30,0.72)',line:'rgba(255,120,130,.75)',caust:'255,110,120',glint:'rgba(255,190,190,.6)'}
};
function drawWater(g,tx0,tx1,ty0,ty1){
  const T=G.time;
  for(let ty=ty0;ty<=ty1;ty++){
    if(ty<0)continue;
    for(let tx=tx0;tx<=tx1;tx++){
      const lt=getTile(tx,ty);
      if(!isLiq(lt))continue;
      const L=LIQ_LOOK[lt];
      const x=tx*TILE,y=ty*TILE;
      const above=getTile(tx,ty-1)===lt;
      const deep=getTile(tx,ty+1)===lt;
      g.fillStyle=deep?L.deep:L.top;
      let fallStream=false;{let yy=ty+1;for(let k=0;k<14;k++,yy++){const u=getTile(tx,yy);if(u===T_AIR){fallStream=true;break;}if(u!==lt)break;}}
      if(fallStream&&!(getTile(tx-1,ty)===lt&&getTile(tx+1,ty)===lt)){
        /* падающая струя: узкий поток с бегущими бликами вместо квадрата */
        const wob=Math.sin(T*9+ty*1.3+tx*1.7)*1.2,bottom=getTile(tx,ty+1)===T_AIR,w=above?16:12,x0=x+16-w/2+wob;
        g.fillStyle=L.top;g.beginPath();if(above&&!bottom)g.rect(x0,y,w,TILE);else if(above){g.rect(x0,y,w,TILE*0.6);g.ellipse(x+16+wob,y+TILE*0.6,w/2,7,0,0,Math.PI);}else{g.ellipse(x+16+wob,y+18,w/2,12,0,0,TAU);}g.fill();
        g.strokeStyle=L.line;g.lineWidth=1.2;g.globalAlpha=0.7;
        for(let k=0;k<2;k++){const ph=((T*3+k*0.5+tx*0.13)%1)*TILE;g.beginPath();g.moveTo(x0+3+k*(w-6),y+ph);g.lineTo(x0+3+k*(w-6),Math.min(y+TILE,y+ph+9));g.stroke();}
        g.globalAlpha=1;continue;
      }
      if(!above){
        const sp=lt===T_BLOOD?1.2:2.4,amp=lt===T_BLOOD?0.9:1.6;
        const w1=Math.sin(T*sp+tx*0.9)*amp,w2=Math.sin(T*sp+(tx+1)*0.9)*amp;
        g.beginPath();g.moveTo(x,y+4+w1);g.lineTo(x+TILE,y+4+w2);g.lineTo(x+TILE,y+TILE);g.lineTo(x,y+TILE);g.closePath();g.fill();
        g.strokeStyle=L.line;g.lineWidth=2;
        g.beginPath();g.moveTo(x,y+4+w1);g.lineTo(x+TILE,y+4+w2);g.stroke();
        if((hash2(tx,ty,3)+Math.floor(T*2))%9===0){g.fillStyle=L.glint;g.fillRect(x+6+(hash2(tx,ty,5)%18),y+2+w1,3,2);}
        if(lt===T_ACID&&(hash2(tx,ty,8)+Math.floor(T*1.3))%5===0){
          const q=(T*1.3)%1;g.fillStyle='rgba(200,255,140,'+(0.8*(1-q)).toFixed(2)+')';g.beginPath();g.arc(x+8+(hash2(tx,ty,2)%16),y+4-q*10,1.5+q*2,0,TAU);g.fill();
        }
      }else g.fillRect(x,y,TILE,TILE);
      if(hash2(tx,ty,11)%3===0){
        g.strokeStyle='rgba('+L.caust+','+(0.10+0.08*Math.sin(T*1.7+tx+ty)).toFixed(3)+')';g.lineWidth=1.5;
        g.beginPath();g.moveTo(x+3,y+10+Math.sin(T+tx)*3);g.quadraticCurveTo(x+16,y+18,x+29,y+9+Math.cos(T+ty)*3);g.stroke();
      }
    }
  }
}

function renderMine(dt){
  const W=view.W,H=view.H,sc=view.scale,cam=G.cam;
  const depth=Math.max(0,player.y)/TILE;
  const bi=biomeAt(depth);
  const B=BIOMES[bi];
  drawBackdrop(ctx,W,H,cam,depth,bi,B);

  const shk=G.shake;
  const sx=shk?rnd(-shk,shk):0, sy=shk?rnd(-shk,shk):0;
  ctx.setTransform(dpr*sc,0,0,dpr*sc, dpr*(W/2-cam.x*sc+sx), dpr*(H/2-cam.y*sc+sy));

  const halfW=W/(2*sc),halfH=H/(2*sc);
  const tx0=Math.floor((cam.x-halfW)/TILE)-1, tx1=Math.ceil((cam.x+halfW)/TILE)+1;
  const ty0=Math.floor((cam.y-halfH)/TILE)-1, ty1=Math.ceil((cam.y+halfH)/TILE)+1;
  /* статичные слои из кэша участков (в точном экранном разрешении) */
  drawStaticCached(tx0,tx1,ty0,ty1,dpr*(W/2-cam.x*sc+sx),dpr*(H/2-cam.y*sc+sy));
  for(let ty=ty0;ty<=ty1;ty++){
    if(ty<0)continue;
    for(let tx=tx0;tx<=tx1;tx++){
      const dt2=getTile(tx,ty);
      if(dt2!==T_AIR&&dt2!==T_LADDER&&dt2!==T_LAVA&&!isLiq(dt2))drawDecor(ctx,tx,ty,dt2);
    }
  }
  drawBiomeDecor(ctx,tx0,tx1,ty0,ty1);
  drawStructDecor(ctx,tx0,tx1,ty0,ty1);
  drawBarricades(ctx,tx0,tx1,ty0,ty1);
  drawArenaDecor(ctx,tx0,tx1,ty0,ty1);
  hbDrawWorld(ctx,tx0,tx1,ty0,ty1);
  drawAnchors(ctx,tx0,tx1,ty0,ty1);
  drawHeartShrine(ctx,tx0,tx1,ty0,ty1);
  for(let ty=ty0;ty<=ty1;ty++){
    if(ty<0)continue;
    for(let tx=tx0;tx<=tx1;tx++){
      const d=getDmg(tx,ty);
      if(d>0){
        const t=getTile(tx,ty);
        if(t!==T_AIR){
          const x=tx*TILE,y=ty*TILE,dd=d/255;
          ctx.strokeStyle='rgba(0,0,0,'+(0.15+d/255*0.6)+')';
          ctx.lineWidth=1.6;
          ctx.beginPath();
          ctx.moveTo(x+4+dd*6,y+6);ctx.lineTo(x+14,y+13);ctx.lineTo(x+9,y+24);ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(x+22,y+8);ctx.lineTo(x+18,y+17);ctx.lineTo(x+26,y+26);ctx.stroke();
        }
      }
    }
  }
  for(let ty=ty0;ty<=ty1;ty++){
    for(let tx=tx0;tx<=tx1;tx++){
      if(getTile(tx,ty)===T_LAVA){
        const a=0.35+0.25*Math.sin(G.time*3+tx*0.7+ty*0.5);
        const lx=tx*TILE,ly=ty*TILE;
        ctx.fillStyle='rgba(255,220,80,'+a.toFixed(2)+')';
        ctx.fillRect(lx+4,ly+6,TILE-8,4);
        const top=getTile(tx,ty-1)!==T_LAVA;
        if(top){
          const w1=Math.sin(G.time*2.8+tx*1.1)*2,w2=Math.sin(G.time*2.8+(tx+1)*1.1)*2;
          const lg=ctx.createLinearGradient(0,ly,0,ly+14);
          lg.addColorStop(0,'rgba(255,240,150,.95)');lg.addColorStop(1,'rgba(255,150,40,0)');
          ctx.fillStyle=lg;
          ctx.beginPath();ctx.moveTo(lx,ly+w1);ctx.lineTo(lx+TILE,ly+w2);ctx.lineTo(lx+TILE,ly+14);ctx.lineTo(lx,ly+14);ctx.closePath();ctx.fill();
        }
        const bph=(hash2(tx,ty,9)+Math.floor(G.time*1.6))%8;
        if(bph===0){
          const q=(G.time*1.6)%1;
          ctx.fillStyle='rgba(255,230,140,'+(0.8*(1-q)).toFixed(2)+')';
          ctx.beginPath();ctx.arc(lx+8+(hash2(tx,ty,2)%16),ly+TILE-q*TILE*0.8,2+q*2,0,TAU);ctx.fill();
        }
        if(top&&settings.quality!=='low'&&Math.random()<0.02)spawnPart(lx+rnd(4,28),ly,rnd(-16,16),rnd(-90,-40),0.8,'#ffb050',2.6,200);
      }
    }
  }
  ctx.save();
  ctx.globalCompositeOperation='lighter';
  for(let ty=ty0;ty<=ty1;ty++){
    for(let tx=tx0;tx<=tx1;tx++){
      const o=getOre(tx,ty);
      if(o&&ORES[o].rar>=2){
        /* в плотных жилах свечение делится между соседями — не сливается в белое пятно */
        let nb=0;for(let yy=-1;yy<=1;yy++)for(let xx=-1;xx<=1;xx++){const o2=getOre(tx+xx,ty+yy);if(o2&&ORES[o2].rar>=2)nb++;}
        const p=0.5+0.5*Math.sin(G.time*2.4+tx*1.3+ty*0.9);
        const R=TILE*(0.75+p*0.25);
        const g2=ctx.createRadialGradient(tx*TILE+16,ty*TILE+16,1,tx*TILE+16,ty*TILE+16,R);
        g2.addColorStop(0,hexA(ORES[o].glow,0.24*(0.4+p*0.6)/Math.sqrt(nb)));
        g2.addColorStop(1,hexA(ORES[o].glow,0));
        ctx.fillStyle=g2;
        ctx.beginPath();ctx.arc(tx*TILE+16,ty*TILE+16,R,0,TAU);ctx.fill();
      }
    }
  }
  ctx.restore();

  if(cam.y<30*TILE)drawExitStructure(ctx,G.time);

  if(Input.digActive && Input.digTX>=0){
    const tx=Input.digTX,ty=Input.digTY;
    const t=getTile(tx,ty);
    if(t!==T_AIR&&t!==T_BEDROCK&&t!==T_LADDER){
      const pulse=0.5+0.5*Math.sin(G.time*8);
      ctx.strokeStyle='rgba(255,217,138,'+(0.6+pulse*0.4)+')';
      ctx.lineWidth=2.5;
      ctx.strokeRect(tx*TILE+1,ty*TILE+1,TILE-2,TILE-2);
      ctx.strokeStyle='rgba(255,255,255,'+(0.3+pulse*0.3)+')';
      ctx.lineWidth=1;
      ctx.strokeRect(tx*TILE+3,ty*TILE+3,TILE-6,TILE-6);
    } else if(t===T_BEDROCK){
      ctx.strokeStyle='rgba(255,90,90,.65)';ctx.lineWidth=2.5;
      ctx.strokeRect(tx*TILE+2,ty*TILE+2,TILE-4,TILE-4);
      ctx.beginPath();
      ctx.moveTo(tx*TILE+8,ty*TILE+8);ctx.lineTo(tx*TILE+TILE-8,ty*TILE+TILE-8);
      ctx.moveTo(tx*TILE+TILE-8,ty*TILE+8);ctx.lineTo(tx*TILE+8,ty*TILE+TILE-8);
      ctx.stroke();
    }
  }

  if(aim.active){
    const apx=player.x, apy=player.y-player.h*0.5;
    let adx=aim.x-apx, ady=aim.y-apy;
    const ad=Math.hypot(adx,ady);
    if(ad>4){
      const alen=Math.min(ad,16*TILE);
      const anx=adx/ad, any=ady/ad;
      ctx.strokeStyle='rgba(255,217,138,.5)';
      ctx.lineWidth=2;
      ctx.setLineDash([6,6]);
      ctx.beginPath();ctx.moveTo(apx,apy);ctx.lineTo(apx+anx*alen,apy+any*alen);ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle='rgba(255,217,138,.85)';
      ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(apx+anx*alen,apy+any*alen,7,0,TAU);ctx.stroke();
    }
  }
  for(const dr2 of drills){
    ctx.save();
    ctx.translate(dr2.x,dr2.y);
    ctx.rotate(Math.atan2(dr2.vy,dr2.vx)+Math.sin(dr2.spin)*0.15);
    ctx.fillStyle='#c9d6e8';
    ctx.beginPath();ctx.moveTo(11,0);ctx.lineTo(-6,-7);ctx.lineTo(-6,7);ctx.closePath();ctx.fill();
    ctx.fillStyle='#ffd98a';
    ctx.beginPath();ctx.moveTo(11,0);ctx.lineTo(2,-3.5);ctx.lineTo(2,3.5);ctx.closePath();ctx.fill();
    ctx.fillStyle='#8a5a2a';ctx.fillRect(-12,-3.5,7,7);
    ctx.restore();
    ctx.globalCompositeOperation='lighter';
    const dg2=ctx.createRadialGradient(dr2.x,dr2.y,1,dr2.x,dr2.y,16);
    dg2.addColorStop(0,'rgba(255,200,90,.4)');dg2.addColorStop(1,'rgba(255,200,90,0)');
    ctx.fillStyle=dg2;ctx.beginPath();ctx.arc(dr2.x,dr2.y,16,0,TAU);ctx.fill();
    ctx.globalCompositeOperation='source-over';
  }
  drawMineCrates(ctx,cam,halfW,halfH);
  drawDeathFxUnder(ctx);
  for(const m of deadMobs){if(m.alpha<=0.01||Math.abs(m.x-cam.x)>halfW+160||Math.abs(m.y-cam.y)>halfH+160)continue;drawMobSprite(ctx,m,G.time);}
  drawDebris(ctx);drawDeathFxOver(ctx);
  for(const m of mobs){if(!m.def.boss&&(Math.abs(m.x-cam.x)>halfW+160||Math.abs(m.y-m.h*0.5-cam.y)>halfH+160))continue;drawMobSprite(ctx,m,G.time);}
  drawBossCutFx(ctx);drawBossDeath(ctx);
  for(const b of beams){
    const k=b.boss?1:clamp(b.t/0.22,0,1);
    ctx.save();ctx.lineCap='round';
    ctx.strokeStyle=hexA(b.color,0.35*k);ctx.lineWidth=14*k+2;
    ctx.beginPath();ctx.moveTo(b.x1,b.y1);ctx.lineTo(b.x2,b.y2);ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,'+(0.9*k)+')';ctx.lineWidth=3*k+1;
    ctx.beginPath();ctx.moveTo(b.x1,b.y1);ctx.lineTo(b.x2,b.y2);ctx.stroke();
    ctx.restore();
  }
  drawPatches(ctx);
  if(player.pull&&player.pull.mob){const pm=player.pull.mob;ctx.strokeStyle=pm.def.mech==='toad'?'#d06080':pm.def.mech==='wraithgrab'?'rgba(180,170,160,.7)':'#8a8e98';ctx.lineWidth=pm.def.mech==='toad'?4:2.4;ctx.beginPath();ctx.moveTo(pm.x+pm.facing*pm.w*0.3,pm.y-pm.h*0.55);ctx.lineTo(player.x,player.y-player.h*0.5);ctx.stroke();}
  drawClouds(ctx);
  drawBossFx(ctx);
  drawHbFx(ctx);
  bfDrawWorld(ctx);
  drawHz(ctx);
  drawHellFx(ctx);
  drawFxLists(ctx);
  for(const p of projectiles){
    if(p.hbk&&hbDrawProj(ctx,p))continue;
    if(p.hook&&p.src){ctx.strokeStyle='#8a8e98';ctx.lineWidth=2;ctx.setLineDash([4,3]);ctx.beginPath();ctx.moveTo(p.src.x,p.src.y-p.src.h*0.6);ctx.lineTo(p.x,p.y);ctx.stroke();ctx.setLineDash([]);
      ctx.strokeStyle='#c8ccd8';ctx.lineWidth=2.4;ctx.beginPath();ctx.arc(p.x,p.y,5,0.3,Math.PI*1.4);ctx.stroke();continue;}
    if(p.ground){
      ctx.fillStyle=p.color;for(let k=-1;k<=1;k++){ctx.beginPath();ctx.moveTo(p.x+k*9-6,p.y);ctx.lineTo(p.x+k*9,p.y-14-(k===0?8:0));ctx.lineTo(p.x+k*9+6,p.y);ctx.fill();}
      continue;}
    if(p.arrow){
      const a=Math.atan2(p.vy,p.vx);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(a);
      ctx.strokeStyle='#8a6a40';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(-14,0);ctx.lineTo(2,0);ctx.stroke();
      if(p.color==='#ff9a3c'){ctx.fillStyle='rgba(255,150,40,.85)';ctx.beginPath();ctx.ellipse(4,0,5,2.6,0,0,TAU);ctx.fill();}
      ctx.fillStyle='#d8dde8';ctx.beginPath();ctx.moveTo(5,0);ctx.lineTo(0,-2.6);ctx.lineTo(0,2.6);ctx.closePath();ctx.fill();
      ctx.fillStyle='#e8e0cc';ctx.fillRect(-15,-2,4,1.2);ctx.fillRect(-15,0.8,4,1.2);ctx.restore();continue;
    }
    if(p.owner==='player'&&p.gun){
      ctx.strokeStyle=hexA(p.color,0.55);ctx.lineWidth=Math.max(1.5,p.size*0.7);ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(p.x-p.vx*0.022,p.y-p.vy*0.022);ctx.lineTo(p.x,p.y);ctx.stroke();
    }
    ctx.fillStyle=p.color;
    ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,TAU);ctx.fill();
    ctx.globalCompositeOperation='lighter';
    const g3=ctx.createRadialGradient(p.x,p.y,1,p.x,p.y,p.size*3);
    g3.addColorStop(0,hexA(p.color,0.6));g3.addColorStop(1,hexA(p.color,0));
    ctx.fillStyle=g3;ctx.beginPath();ctx.arc(p.x,p.y,p.size*3,0,TAU);ctx.fill();
    ctx.globalCompositeOperation='source-over';
  }

  if(grapple){
    const hx=player.x+player.facing*6;
    const hy=player.y-player.h*0.55;
    ctx.strokeStyle=grapple.state==='anchored'?'rgba(200,180,140,0.95)':'rgba(200,180,140,0.55)';
    ctx.lineWidth=1.8;
    ctx.beginPath();ctx.moveTo(hx,hy);ctx.lineTo(grapple.x,grapple.y);ctx.stroke();
    if(grapple.state==='anchored'){ctx.strokeStyle='rgba(120,90,50,.55)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(hx,hy+1);ctx.lineTo(grapple.x,grapple.y+1);ctx.stroke();}
    ctx.fillStyle='#c8a878';
    ctx.beginPath();ctx.arc(grapple.x,grapple.y,grapple.state==='anchored'?5:3.5,0,TAU);ctx.fill();
    if(grapple.state==='anchored'){
      ctx.globalCompositeOperation='lighter';
      const gg=ctx.createRadialGradient(grapple.anchorX,grapple.anchorY,1,grapple.anchorX,grapple.anchorY,22);
      gg.addColorStop(0,'rgba(200,180,140,0.45)');
      gg.addColorStop(1,'rgba(200,180,140,0)');
      ctx.fillStyle=gg;
      ctx.beginPath();ctx.arc(grapple.anchorX,grapple.anchorY,22,0,TAU);ctx.fill();
      ctx.globalCompositeOperation='source-over';
    }
  }

  let tool='pick', swing=0;
  if(player.atkAnim>0){
    tool = player.swordLvl>=2 ? 'sword' : 'fist';
    swing = 1-player.atkAnim;
  } else if(player.digProg>0 && player.digTileX>=0){
    tool='pick';swing=0.5+0.5*Math.sin(player.digSwing);var digging=true;
  } else {tool='pick';swing=0.35;}
  {
    const bT=getTile(Math.floor(player.x/TILE),Math.floor((player.y-player.h*0.4)/TILE));
    const gunNow=(player.gunAnim>0&&player.gunLvl>0)?curGun().id:null;
    drawPlayerSprite(ctx,player.x,player.y,player.animState,player.anim,player.facing,
      {tool:tool,swing:swing,hurt:player.hurtCd>0?player.hurtCd/0.7:0,
       armor:player.armorLvl,pickLvl:player.pickLvl,torch:player.torchLvl,vy:player.vy,sword:player.swordLvl,
       swim:(isLiq(bT)||bT===T_LAVA),hang:!!(grapple&&grapple.state==='anchored'),climb:!!player.onLadder,
       gun:gunNow,gunAnim:gunNow?clamp(player.gunAnim*1.3,0,1):0,digging:typeof digging!=='undefined'&&digging,sq:player.landSq||0,lamp:player.y>4*TILE,groundY:playerGroundY()});
  }
  drawCrateLabels(ctx);

  drawWater(ctx,tx0,tx1,ty0,ty1);
  if(player.air<0.995){
    const n=Math.ceil(player.air*8);
    for(let k=0;k<8;k++){
      ctx.strokeStyle=k<n?'rgba(200,235,255,.95)':'rgba(200,235,255,.2)';ctx.lineWidth=1.5;
      ctx.beginPath();ctx.arc(player.x-21+k*6,player.y-player.h-14,2.3,0,TAU);ctx.stroke();
    }
  }
  {
    /* статус-эффекты вокруг игрока */
    const f=player.fx,px0=player.x,py0=player.y;
    if(f.slow>0){ctx.strokeStyle='rgba(200,230,255,.8)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(px0,py0-2,16,5,0,0,TAU);ctx.stroke();}
    if(f.stun>0){ctx.fillStyle='#ffe066';for(let k=0;k<3;k++){const a=G.time*7+k*2.1;ctx.fillRect(px0+Math.cos(a)*11-1.5,py0-54+Math.sin(a)*3,3,3);}}
    if(f.poison>0){ctx.fillStyle='rgba(122,208,58,'+(0.25+0.15*Math.sin(G.time*8))+')';ctx.beginPath();ctx.ellipse(px0,py0-22,15,24,0,0,TAU);ctx.fill();}
    if(f.burn>0){ctx.fillStyle='rgba(255,120,40,'+(0.25+0.15*Math.sin(G.time*14))+')';ctx.beginPath();ctx.ellipse(px0,py0-22,15,24,0,0,TAU);ctx.fill();}
  }
  ctx.setTransform(dpr,0,0,dpr,0,0);
  drawParticles();
  applyLighting();
  drawHellAtmos(W,H,dt);
  if(G.shake>0)G.shake=Math.max(0,G.shake-dt*40);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  drawFloats();
}
