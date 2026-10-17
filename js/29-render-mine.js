'use strict';
/* ============================================================
   RENDER MINE
   ============================================================ */
function mixHex(a,b,t){
  const pa=parseInt(a.slice(1),16),pb=parseInt(b.slice(1),16);
  const r=Math.round(lerp((pa>>16)&255,(pb>>16)&255,t)),g=Math.round(lerp((pa>>8)&255,(pb>>8)&255,t)),bl=Math.round(lerp(pa&255,pb&255,t));
  return '#'+((1<<24)|(r<<16)|(g<<8)|bl).toString(16).slice(1);
}
/* Фон: свой для каждого биома, плавно перетекает в следующий */

let _atm=null,_atmSpr={};
function atmSprite(key,r,c0,c1){
  if(_atmSpr[key])return _atmSpr[key];
  const c=document.createElement('canvas');c.width=c.height=r*2;const g=c.getContext('2d');
  const gr=g.createRadialGradient(r,r,0,r,r,r);gr.addColorStop(0,c0);gr.addColorStop(1,c1);g.fillStyle=gr;g.fillRect(0,0,r*2,r*2);
  return (_atmSpr[key]=c);
}
function drawEarthAtmos(W,H){
  if(G.dim!==0||settings.quality==='low'||G.scene!=='mine')return;
  const depth=Math.max(0,player.y)/TILE,bi=biomeAt(depth),T=G.time,cam=G.cam;
  if(depth<6)return;
  if(!_atm){_atm=[];for(let i=0;i<70;i++)_atm.push({x:Math.random(),y:Math.random(),s:Math.random(),p:Math.random()*TAU});}
  const g=ctx;g.save();g.setTransform(dpr,0,0,dpr,0,0);
  const px=(cam.x*0.3)%W,py=(cam.y*0.3)%H;
  if(bi<=1){/* пылинки в луче фонаря */
    for(const a of _atm){if(a.s<0.45)continue;const x=((a.x*W+Math.sin(T*0.3+a.p)*14-px)%W+W)%W,y=((a.y*H+T*3*(a.s-0.5)-py)%H+H)%H;
      g.fillStyle='rgba(230,215,180,'+(0.12+0.18*Math.sin(T*1.5+a.p)**2)+')';g.fillRect(x,y,1.4,1.4);}
  }else if(bi===2){g.globalCompositeOperation='lighter';
    for(const a of _atm){if(a.s<0.6)continue;const x=((a.x*W-px)%W+W)%W,y=((a.y*H-py)%H+H)%H,tw=Math.max(0,Math.sin(T*2.4+a.p*7));
      g.fillStyle=(a.s>0.8?'rgba(170,230,255,':'rgba(220,170,255,')+(0.5*tw)+')';g.fillRect(x-2*tw,y-0.4,4*tw,0.8);g.fillRect(x-0.4,y-2*tw,0.8,4*tw);}
  }else if(bi===3){g.globalCompositeOperation='lighter';
    for(const a of _atm){if(a.s<0.5)continue;const ph=(T*0.12*(0.5+a.s)+a.p)%1,x=atmWrap(a.x*W-cam.x*0.3,W+20)-10+Math.sin(T+a.p)*8,y=atmWrap(a.y*H-cam.y*0.3-ph*H,H+20)-10;
      g.fillStyle='rgba(255,'+(120+Math.floor(a.s*100))+',40,'+(0.45*(1-ph))+')';g.fillRect(x,y,1.6,1.6);}
    const hz=g.createLinearGradient(0,H*0.6,0,H);hz.addColorStop(0,'rgba(255,80,20,0)');hz.addColorStop(1,'rgba(255,80,20,.06)');g.globalCompositeOperation='source-over';g.fillStyle=hz;g.fillRect(0,H*0.6,W,H*0.4);
  }else{g.globalCompositeOperation='lighter';
    for(const a of _atm){if(a.s<0.6)continue;const x=((a.x*W+Math.sin(T*0.4+a.p)*30-px*0.5)%W+W)%W,y=((a.y*H+Math.cos(T*0.3+a.p)*20-py*0.5)%H+H)%H;
      const al=0.25*(0.5+0.5*Math.sin(T*1.2+a.p));g.globalAlpha=al;g.drawImage(atmSprite('void',16,'rgba(190,150,255,1)','rgba(100,60,220,0)'),x-8,y-8,16,16);}
    g.globalAlpha=1;}
  g.restore();
}
/* парящие частицы атмосферы: одинаковый параллакс по обеим осям, плавный перенос по краям */
function atmWrap(v,span){return ((v%span)+span)%span;}
function drawHellAtmos(W,H,dt){
  if(G.dim===2){drawLilacAtmos(W,H);drawLilacTruthGrade(W,H);lilDrawSleep(W,H);return;}
  if(G.dim!==1||settings.quality==='low'){drawEarthAtmos(W,H);return;}
  const depth=Math.max(0,player.y)/TILE,bi=biomeAt(depth),T=G.time,cam=G.cam;
  if(!_atm){_atm=[];for(let i=0;i<70;i++)_atm.push({x:Math.random(),y:Math.random(),s:Math.random(),p:Math.random()*TAU});}
  const g=ctx;g.save();g.setTransform(dpr,0,0,dpr,0,0);
  const px=(cam.x*0.35)%W,py=(cam.y*0.35)%H;
  if(bi===5){
    const wind=stormOn>0?4:1;
    for(const a of _atm){const x=((a.x*W+T*(18+a.s*30)*wind-px)%W+W)%W,y=((a.y*H+T*(16+a.s*20)-py)%H+H)%H;
      if(a.s>0.85){g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,'+(120+Math.floor(a.s*100))+',40,'+(0.5+0.4*Math.sin(T*6+a.p))+')';g.fillRect(x,H-y,2,2);g.globalCompositeOperation='source-over';}
      else{g.fillStyle='rgba(150,140,130,'+(0.25+a.s*0.35)+')';g.fillRect(x,y,1.5+a.s*1.5,1.5+a.s*1.5);}}
    const hz=g.createLinearGradient(0,H*0.6,0,H);hz.addColorStop(0,'rgba(255,90,30,0)');hz.addColorStop(1,'rgba(255,90,30,.08)');g.fillStyle=hz;g.fillRect(0,H*0.6,W,H*0.4);
  }else if(bi===6){
    const bt=(T*1.15)%1,beat=Math.max(Math.exp(-bt*14),0.7*Math.exp(-Math.max(0,bt-0.18)*14)*(bt>0.18?1:0));
    const vg=g.createRadialGradient(W/2,H/2,Math.min(W,H)*0.3,W/2,H/2,Math.max(W,H)*0.75);vg.addColorStop(0,'rgba(120,0,16,0)');vg.addColorStop(1,'rgba(110,0,16,'+(0.28+0.22*beat)+')');
    g.fillStyle=vg;g.fillRect(0,0,W,H);
    for(const a of _atm){if(a.s<0.5)continue;const x=((a.x*W+Math.sin(T*0.5+a.p)*20-px)%W+W)%W,y=((a.y*H-T*(6+a.s*8)-py)%H+H)%H;g.fillStyle='rgba(200,20,40,'+(0.2+0.25*a.s)+')';g.beginPath();g.arc(x,y,1+a.s*1.6,0,TAU);g.fill();}
  }else if(bi===7){
    for(let k=0;k<2;k++){const yy=H*(0.3+k*0.36)+Math.sin(T*0.3+k)*20-((cam.y*0.2)%60);const off=((T*(12+k*6)-cam.x*0.2)%(W*1.5)+W*1.5)%(W*1.5)-W*0.25;
      const fs=atmSprite('fog',90,'rgba(190,210,60,.10)','rgba(190,210,60,0)');
      for(let q=0;q<3;q++){const cx=off+q*W*0.55-W*0.4;g.drawImage(fs,cx-180,yy-180,360,360);}}
    for(const a of _atm){if(a.s<0.6)continue;const ph=(T*0.12*(0.5+a.s)+a.p)%1,x=atmWrap(a.x*W-cam.x*0.5,W+20)-10+Math.sin(T+a.p)*6,y=atmWrap(a.y*H-cam.y*0.5-ph*H*0.9,H+40)-20;g.strokeStyle='rgba(200,255,90,'+(0.35*(1-ph))+')';g.lineWidth=1;g.beginPath();g.arc(x,y,2+a.s*4,0,TAU);g.stroke();}
    g.fillStyle='rgba(120,140,20,.06)';g.fillRect(0,0,W,H);
  }else if(bi===8){
    /* катакомбы: медленно оседающая костяная пыль и редкие души с мягким хвостом */
    for(const a of _atm){if(a.s>0.72)continue;
      const f=0.35+a.s*0.4,x=atmWrap(a.x*W+Math.sin(T*0.35+a.p)*12-cam.x*f,W+20)-10,y=atmWrap(a.y*H+T*(4+a.s*6)-cam.y*f,H+20)-10,tw=0.5+0.5*Math.sin(T*1.3+a.p*4);
      g.fillStyle='rgba(214,208,192,'+(0.08+0.16*tw*a.s)+')';g.beginPath();g.arc(x,y,0.6+a.s*1.1,0,TAU);g.fill();}
    g.globalCompositeOperation='lighter';
    for(const a of _atm){if(a.s<0.8)continue;
      const sp=0.045*(0.6+a.s),ph=(T*sp+a.p)%1,f=0.55,bx=atmWrap(a.x*W-cam.x*f,W+60)-30,by=atmWrap(a.y*H-cam.y*f,H+120)-60,al=Math.sin(ph*Math.PI)*0.6;
      const pos=(q)=>[bx+Math.sin((T-q*0.35)*1.1+a.p*3)*16,by+60-(ph-q*0.018)*170];
      for(let q=6;q>=1;q--){const [tx,ty]=pos(q);g.globalAlpha=al*(1-q/7)*0.45;g.drawImage(atmSprite('wisp',16,'rgba(150,210,255,1)','rgba(60,140,255,0)'),tx-(6-q*0.6),ty-(6-q*0.6),(6-q*0.6)*2,(6-q*0.6)*2);}
      const [x,y]=pos(0),rr2=7+a.s*5;g.globalAlpha=al;g.drawImage(atmSprite('wisp',16,'rgba(190,235,255,1)','rgba(60,140,255,0)'),x-rr2,y-rr2,rr2*2,rr2*2);
      g.globalAlpha=al*0.9;g.fillStyle='rgba(235,250,255,1)';g.beginPath();g.arc(x,y,1.4,0,TAU);g.fill();g.globalAlpha=1;}
    g.globalCompositeOperation='source-over';
    /* холодный стелющийся туман склепов */
    {const fs=atmSprite('cfog',90,'rgba(170,190,220,.09)','rgba(170,190,220,0)');
      for(let k=0;k<2;k++){const yy=H*(0.55+k*0.3)+Math.sin(T*0.25+k*2)*16-((cam.y*0.25)%80);const off=((T*(7+k*5)-cam.x*0.25)%(W*1.6)+W*1.6)%(W*1.6)-W*0.3;
        for(let q=0;q<3;q++){const cx=off+q*W*0.6-W*0.5;g.drawImage(fs,cx-200,yy-120,400,240);}}}
    const vg=g.createRadialGradient(W/2,H/2,Math.min(W,H)*0.35,W/2,H/2,Math.max(W,H)*0.75);vg.addColorStop(0,'rgba(10,20,40,0)');vg.addColorStop(1,'rgba(10,20,50,.3)');g.fillStyle=vg;g.fillRect(0,0,W,H);
  }else if(bi>=9){
    const hz=g.createLinearGradient(0,H*0.5,0,H);hz.addColorStop(0,'rgba(255,80,10,0)');hz.addColorStop(1,'rgba(255,80,10,'+(0.12+0.04*Math.sin(T*1.7))+')');g.fillStyle=hz;g.fillRect(0,H*0.5,W,H*0.5);
    for(const a of _atm){const ph=(T*0.25*(0.5+a.s)+a.p)%1,f=0.3+a.s*0.4,x=atmWrap(a.x*W-cam.x*f,W+20)-10+Math.sin(T*2+a.p*5)*10*ph,y=atmWrap(a.y*H-cam.y*f-ph*H,H+20)-10;
      g.fillStyle='rgba(255,'+(160+Math.floor(a.s*90))+',60,'+(0.6*(1-ph))+')';g.fillRect(x,y,1.5+a.s*2,1.5+a.s*2);}
  }
  g.restore();
}
function drawHellBackdrop(g,W,H,cam,bi,T,shift){
  if(bi===5){
    /* пепельные пустоши: дальние вулканы, оседающий пепел */
    for(let L=0;L<2;L++){
      g.globalAlpha=0.35+L*0.2;g.fillStyle=L?'#1a100c':'#2a1a14';
      const px=shift(0.1+L*0.08,600);
      for(let i=-1;i<4;i++){const xx=px+i*300+L*120,hh=H*(0.32+((i*37+L*11)%25)/100);
        g.beginPath();g.moveTo(xx-140,H);g.lineTo(xx-22,H-hh);g.lineTo(xx+22,H-hh);g.lineTo(xx+140,H);g.closePath();g.fill();
        if(L===0){g.globalCompositeOperation='lighter';g.globalAlpha=0.12+0.06*Math.sin(T+i);g.fillStyle='#ff5a1a';g.beginPath();g.ellipse(xx,H-hh,26,8,0,0,TAU);g.fill();g.globalCompositeOperation='source-over';g.globalAlpha=0.35;g.fillStyle='#2a1a14';}
      }
    }
    g.globalAlpha=0.5;g.fillStyle='#8a7a70';
    for(let i=0;i<40;i++){const x=((hash2(i,1,5)%1000)/1000*W+T*14*(1+(i%3))-cam.x*0.05)%W,y=((hash2(i,2,5)%1000)/1000*H+T*22*(1+(i%2)))%H;g.fillRect(x<0?x+W:x,y,1.6,1.6);}
  }else if(bi===6){
    /* кровавые копи: пульсирующие вены */
    const p=0.5+0.5*Math.sin(T*1.6);
    g.globalAlpha=0.22+0.08*p;g.strokeStyle='#5a0812';g.lineWidth=14;
    const px=shift(0.14,520);
    for(let i=-1;i<5;i++){const xx=px+i*170;g.beginPath();g.moveTo(xx,0);g.bezierCurveTo(xx+60,H*0.3,xx-50,H*0.6,xx+30,H);g.stroke();}
    g.lineWidth=5;g.strokeStyle='#8a1020';g.globalAlpha=0.18+0.1*p;
    for(let i=-1;i<6;i++){const xx=px*1.3+i*130+40;g.beginPath();g.moveTo(xx,H);g.quadraticCurveTo(xx+40,H*0.5,xx-20,0);g.stroke();}
    const gr=g.createRadialGradient(W*0.5,H*0.5,10,W*0.5,H*0.5,Math.max(W,H)*0.7);gr.addColorStop(0,'rgba(120,0,20,0)');gr.addColorStop(1,'rgba(60,0,10,'+(0.25+0.1*p).toFixed(2)+')');
    g.globalAlpha=1;g.fillStyle=gr;g.fillRect(0,0,W,H);
  }else if(bi===7){
    /* серные топи: туман и пузыри */
    for(let L=0;L<3;L++){
      g.globalAlpha=0.12;g.fillStyle=L%2?'#8a8a20':'#5a6a10';
      const px=shift(0.08+L*0.06,700);
      g.beginPath();g.moveTo(0,H);
      for(let x=-1;x<=Math.ceil(W/70)+12;x++){const xx=px+x*70;g.lineTo(xx,H*(0.6+L*0.1)+Math.sin(x*0.9+T*0.5+L)*18);}
      g.lineTo(W+700,H);g.closePath();g.fill();
    }
    g.globalCompositeOperation='lighter';
    for(let i=0;i<14;i++){const ph=(T*0.15+i*0.073)%1,x=((hash2(i,3,9)%1000)/1000*W-cam.x*0.06)%W;
      g.globalAlpha=0.18*(1-ph);g.fillStyle='#c8ff4a';g.beginPath();g.arc(x<0?x+W:x,H*(1-ph),4+ph*8,0,TAU);g.fill();}
    g.globalCompositeOperation='source-over';
  }else if(bi===8){
    /* костяные катакомбы: дальняя стена-оссуарий с нишами и черепами, ближе — колонны с арками */
    const px=shift(0.12,280);
    g.globalAlpha=0.22;
    for(let i=-1;i<Math.ceil(W/70)+2;i++)for(let r=0;r<3;r++){
      const xx=px+i*70,yy=H*(0.22+r*0.2),hsh=hash2(i,r,8);
      g.fillStyle='#0c0c14';g.beginPath();g.moveTo(xx-22,yy+20);g.lineTo(xx-22,yy-6);g.arc(xx,yy-6,22,Math.PI,0);g.lineTo(xx+22,yy+20);g.closePath();g.fill();
      if(hsh%3===0)continue;
      const n=1+(hsh%3);
      for(let k=0;k<n;k++){const sx=xx-((n-1)*9)+k*18,sy=yy+8-(hsh>>3)%3;
        g.fillStyle='#8a8678';g.beginPath();g.arc(sx,sy-3,6,Math.PI*0.92,Math.PI*2.08);g.quadraticCurveTo(sx+6,sy+4,sx+3,sy+6);g.lineTo(sx-3,sy+6);g.quadraticCurveTo(sx-6,sy+4,sx-6,sy-2);g.fill();
        g.fillStyle='#0c0c14';g.beginPath();g.ellipse(sx-2.3,sy-1.5,1.7,2,0,0,TAU);g.ellipse(sx+2.3,sy-1.5,1.7,2,0,0,TAU);g.fill();g.fillRect(sx-0.6,sy+1.2,1.2,1.6);}
    }
    g.globalAlpha=0.32;
    const px2=shift(0.22,400);
    for(let i=-1;i<Math.ceil(W/200)+2;i++){const xx=px2+i*200;
      const grd=g.createLinearGradient(xx,0,xx+26,0);grd.addColorStop(0,'#1a1a24');grd.addColorStop(0.5,'#2c2c3a');grd.addColorStop(1,'#14141c');
      g.fillStyle=grd;g.fillRect(xx,H*0.38,26,H*0.62);g.fillRect(xx-5,H*0.36,36,8);g.fillRect(xx-5,H-14,36,14);
      g.strokeStyle='#22222e';g.lineWidth=12;g.beginPath();g.arc(xx+113,H*0.4,87,Math.PI,0);g.stroke();
      g.fillStyle='rgba(200,196,180,.5)';g.beginPath();g.arc(xx+113,H*0.4-87,5,0,TAU);g.fill();}
    g.globalAlpha=1;
  }else{
    /* огненное ядро: лавовые реки и сияние */
    const gl=g.createLinearGradient(0,H*0.35,0,H);
    gl.addColorStop(0,'rgba(255,60,10,0)');gl.addColorStop(1,'rgba(255,120,20,'+(0.32+0.08*Math.sin(T*1.3)).toFixed(3)+')');
    g.fillStyle=gl;g.fillRect(0,H*0.35,W,H*0.65);
    g.globalCompositeOperation='lighter';
    for(let k=0;k<3;k++){g.globalAlpha=0.1;g.strokeStyle=k===1?'#ffb040':'#ff4a10';g.lineWidth=10+k*6;
      g.beginPath();for(let x=0;x<=W;x+=24){const y=H*(0.55+k*0.13)+Math.sin(x*0.01+T*0.6+k*1.7)*24;if(x===0)g.moveTo(x,y);else g.lineTo(x,y);}g.stroke();}
    g.globalCompositeOperation='source-over';
    g.globalAlpha=0.55;g.fillStyle='#0e0302';
    const px=shift(0.2,460);
    for(let i=-1;i<5;i++){const xx=px+i*150,hh=H*(0.2+(((i*31)%30)/100));g.beginPath();g.moveTo(xx,0);g.lineTo(xx+30,hh);g.lineTo(xx+60,hh*0.5);g.lineTo(xx+100,hh*1.1);g.lineTo(xx+140,0);g.closePath();g.fill();}
  }
}
function drawBackdrop(g,W,H,cam,depth,bi,B){
  let c1=B.bg,c2=B.bg2,fog=B.fog;
  const nb=(BIOMES[bi+1]&&BIOMES[bi+1].dim===B.dim)?BIOMES[bi+1]:null;
  if(nb){const left=B.d1-depth;if(left<25){const t=1-left/25;c1=mixHex(B.bg,nb.bg,t);c2=mixHex(B.bg2,nb.bg2,t);fog=mixHex(B.fog,nb.fog,t);}}
  if(B.dim===2&&veilT>0.01){const k=veilT*0.75;c1=mixHex(c1,'#2a0812',k);c2=mixHex(c2,'#0a0204',k);fog=mixHex(fog,'#1a0408',k);}   /* Истина */
  const bg=g.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,c1);bg.addColorStop(1,c2);
  g.fillStyle=bg;g.fillRect(0,0,W,H);
  const T=G.time;
  g.save();
  const shift=(f,span)=>{let v=-(cam.x*f)%span;return v>0?v-span:v;};
  if(bi===0){
    /* пласты земли и корни */
    for(let L=0;L<3;L++){
      g.globalAlpha=0.16+L*0.05;g.fillStyle=L%2?'#3a2a1a':'#2a1d12';
      const px=shift(0.12+L*0.07,300);
      g.beginPath();g.moveTo(0,H);
      for(let x=-1;x<=Math.ceil(W/60)+6;x++){const xx=px+x*60;g.lineTo(xx,H*(0.55+L*0.12)+Math.sin(x*1.3+L*2)*H*0.05);}
      g.lineTo(W+400,H);g.closePath();g.fill();
    }
    g.globalAlpha=0.5;g.strokeStyle='#4a3018';g.lineWidth=2;
    const px=shift(0.2,520);
    for(let i=0;i<8;i++){const xx=px+i*130+((i*53)%40),len=H*(0.12+((i*37)%25)/100);
      g.beginPath();g.moveTo(xx,0);g.quadraticCurveTo(xx+14*Math.sin(T*0.5+i),len*0.5,xx-6,len);g.stroke();}
  }else if(bi===1){
    /* каменные колонны и сталактиты */
    g.fillStyle=fog;
    for(let L=0;L<2;L++){
      g.globalAlpha=0.28+L*0.12;
      const px=shift(0.16+L*0.1,480);
      for(let i=-1;i<5;i++){
        const xx=px+i*160+L*60,w=34+((i*29+L*17)%30),hh=H*(0.28+(((i*41+L*13)%35)/100));
        g.beginPath();g.moveTo(xx,H);g.lineTo(xx+4,H-hh);g.lineTo(xx+w*0.5,H-hh-12);g.lineTo(xx+w-4,H-hh+2);g.lineTo(xx+w,H);g.closePath();g.fill();
        g.beginPath();g.moveTo(xx+10,0);g.lineTo(xx+w*0.5+10,H*0.12+((i*23)%40));g.lineTo(xx+w+10,0);g.closePath();g.fill();
      }
    }
  }else if(bi===2){
    /* кристальные шпили */
    const px=shift(0.18,520);
    for(let L=0;L<2;L++){
      for(let i=-1;i<7;i++){
        const xx=px*(1+L*0.4)+i*(90+L*30)+L*45,hh=H*(0.22+(((i*47+L*19)%40)/100));
        g.globalAlpha=0.35;g.fillStyle=L?'#241f5a':'#2c2670';
        g.beginPath();g.moveTo(xx,H);g.lineTo(xx+10,H-hh);g.lineTo(xx+22,H);g.closePath();g.fill();
        g.globalCompositeOperation='lighter';g.globalAlpha=0.07+0.05*Math.sin(T*1.5+i);g.fillStyle='#8a7cff';
        g.beginPath();g.moveTo(xx+10,H-hh);g.lineTo(xx+4,H-hh+hh*0.3);g.lineTo(xx+16,H-hh+hh*0.3);g.closePath();g.fill();
        g.globalCompositeOperation='source-over';
      }
    }
  }else if(bi===3){
    /* лавовое зарево и чёрные скалы */
    const gl=g.createLinearGradient(0,H*0.45,0,H);
    gl.addColorStop(0,'rgba(255,90,20,0)');gl.addColorStop(1,'rgba(255,110,30,'+(0.24+0.06*Math.sin(T*1.7)).toFixed(3)+')');
    g.fillStyle=gl;g.fillRect(0,H*0.45,W,H*0.55);
    g.globalAlpha=0.5;g.fillStyle='#120503';
    const px=shift(0.2,420);
    for(let i=-1;i<5;i++){const xx=px+i*140,hh=H*(0.18+(((i*31)%30)/100));
      g.beginPath();g.moveTo(xx,H);g.lineTo(xx+20,H-hh);g.lineTo(xx+46,H-hh*0.6);g.lineTo(xx+80,H-hh*1.1);g.lineTo(xx+120,H);g.closePath();g.fill();}
  }else if(bi>=10){
    drawLilacBackdrop(g,W,H,cam,bi,T,shift);
  }else if(bi>=5){
    drawHellBackdrop(g,W,H,cam,bi,T,shift);
  }else{
    /* бездна: звёзды и тусклые ленты пустоты */
    for(let i=0;i<70;i++){
      const hx=hash2(i,3,77),hy=hash2(i,5,78);
      const x=((hx%1000)/1000*(W+200)-cam.x*0.04)%(W+200);
      const y=((hy%1000)/1000)*H;
      g.globalAlpha=0.25+0.5*Math.abs(Math.sin(T*(0.6+(i%5)*0.25)+i));
      g.fillStyle=i%4===0?'#c8b0ff':'#8a7acc';
      g.fillRect(x<0?x+W+200:x,y,1.6,1.6);
    }
    g.globalCompositeOperation='lighter';
    for(let k=0;k<2;k++){
      g.globalAlpha=0.07;g.strokeStyle=k?'#6a3acc':'#3a6acc';g.lineWidth=26;
      g.beginPath();
      for(let x=0;x<=W;x+=24){const y=H*(0.3+k*0.25)+Math.sin(x*0.012+T*0.4+k*2)*30;if(x===0)g.moveTo(x,y);else g.lineTo(x,y);}
      g.stroke();
    }
    g.globalCompositeOperation='source-over';
  }
  g.restore();
}

/* Декор биомов: корни, сталактиты, грибы, кристаллы, крепь штолен, трещины магмы... */
let _dg=null;
/* паутина в углу: (cx,cy) — угол, dx — направление от стены */
function drawCobweb(g,cx,cy,dx,sz){
  g.strokeStyle='rgba(215,220,230,.32)';g.lineWidth=0.6;g.beginPath();
  const n=4;for(let k=0;k<=n;k++){const a=(k/n)*Math.PI/2;g.moveTo(cx,cy);g.lineTo(cx+dx*Math.cos(a)*sz,cy+Math.sin(a)*sz);}
  for(let r=1;r<=3;r++){const rr=sz*r/3.4;for(let k=0;k<n;k++){const a0=(k/n)*Math.PI/2,a1=((k+1)/n)*Math.PI/2,am=(a0+a1)/2,sag=rr*0.82;
    if(k===0)g.moveTo(cx+dx*Math.cos(a0)*rr,cy+Math.sin(a0)*rr);g.quadraticCurveTo(cx+dx*Math.cos(am)*sag,cy+Math.sin(am)*sag,cx+dx*Math.cos(a1)*rr,cy+Math.sin(a1)*rr);}}
  g.stroke();
}
/* галереи Катакомб: колонны со сводами, фонари душ, саркофаги и надгробия; true — клетку больше не украшать */
function catCryptDecor(g,x,y,tx,ty,h,up,dn,time,gl){
  const c=catBand(ty);if(c.row<1||c.row>3||tx<c.x0||tx>c.x1)return false;
  const rel=tx-c.x0,span=c.x1-c.x0;
  const isShaft=(wx)=>{const lx=((wx%12)+12)%12;return lx>=3&&lx<=8&&hash2(Math.floor(wx/12),c.band,G.seed+50053)%3===0;};
  const pillarAt=(r)=>r>=5&&r<=span-2&&r%11===5&&!isShaft(c.x0+r);
  if(c.row===1&&up){/* свод: дуга между соседними колоннами */
    const u=((rel-5)%11+11)%11,pl=rel-u;
    if(pillarAt(pl)&&pillarAt(pl+11)){
      const S=11*TILE,ax=x-u*TILE;const yb=(px)=>{const q=(px-ax-16)/(S);return y+5+17*Math.pow(Math.abs(2*q-1),2.2);};
      g.fillStyle='#24222b';g.beginPath();g.moveTo(x,y);g.lineTo(x+TILE,y);for(let k=4;k>=0;k--){const px=x+k*8;g.lineTo(px,yb(px));}g.closePath();g.fill();
      g.strokeStyle='#4c4856';g.lineWidth=1.6;g.beginPath();for(let k=0;k<=4;k++){const px=x+k*8;if(k)g.lineTo(px,yb(px));else g.moveTo(px,yb(px));}g.stroke();
      g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=1;for(let k=0;k<4;k++){const px=x+4+k*8;g.beginPath();g.moveTo(px,y);g.lineTo(px+(px-ax-S/2-16)*0.02,yb(px)-1);g.stroke();}
      if(u===5){/* замковый камень с черепом */g.fillStyle='#4a4652';g.beginPath();g.moveTo(x+10,y);g.lineTo(x+22,y);g.lineTo(x+20,y+11);g.lineTo(x+12,y+11);g.closePath();g.fill();
        g.fillStyle='#c8c0ac';g.beginPath();g.arc(x+16,y+5,3.4,0,TAU);g.fill();g.fillRect(x+14,y+7,4,2.4);g.fillStyle='#1a1418';g.fillRect(x+14,y+4.2,1.5,1.6);g.fillRect(x+16.6,y+4.2,1.5,1.6);}
    }
  }
  if(pillarAt(rel)){
    const gr=g.createLinearGradient(x+9,0,x+23,0);gr.addColorStop(0,'#2a2832');gr.addColorStop(0.4,'#4e4a58');gr.addColorStop(1,'#1e1c24');
    g.fillStyle=gr;g.fillRect(x+10,y,12,TILE);
    g.fillStyle='rgba(0,0,0,.3)';g.fillRect(x+13,y,1,TILE);g.fillRect(x+18,y,1,TILE);
    if(c.row===1){g.fillStyle='#45414f';g.fillRect(x+5,y,22,5);g.fillStyle='#38343f';g.fillRect(x+7,y+5,18,3);g.fillStyle='rgba(255,255,255,.08)';g.fillRect(x+5,y+4,22,1);}
    if(c.row===3){g.fillStyle='#38343f';g.fillRect(x+7,y+TILE-8,18,3);g.fillStyle='#45414f';g.fillRect(x+5,y+TILE-5,22,5);g.fillStyle='rgba(255,255,255,.08)';g.fillRect(x+5,y+TILE-5,22,1);}
    if(c.row===2&&h%3===0){/* череп, прибитый к колонне */g.fillStyle='#cfc6b0';g.beginPath();g.arc(x+16,y+14,4,0,TAU);g.fill();g.fillRect(x+13.5,y+16,5,3);g.fillStyle='#1a1418';g.fillRect(x+13.8,y+13,1.8,2);g.fillRect(x+16.6,y+13,1.8,2);}
    return true;
  }
  if(c.row===1&&up&&rel>0&&rel%11===0&&!isShaft(tx)){/* фонарь душ на цепи */
    const sw=Math.sin(time*1.3+(h%13))*0.08,cx=x+16;
    g.save();g.translate(cx,y);g.rotate(sw);
    g.strokeStyle='#4a4a52';g.lineWidth=1.1;for(let k=0;k<3;k++){g.beginPath();g.ellipse(0,1.5+k*2.6,0.9,1.4,0,0,TAU);g.stroke();}
    g.fillStyle='#1c1c22';g.beginPath();g.moveTo(-5,9);g.lineTo(5,9);g.lineTo(3,7.4);g.lineTo(-3,7.4);g.closePath();g.fill();g.fillRect(-5,21,10,2);
    const fl=0.8+0.2*Math.sin(time*11+h)+0.1*Math.sin(time*23);
    g.fillStyle='rgba(90,190,255,.35)';g.fillRect(-4,9,8,12);
    g.fillStyle='#bfefff';g.beginPath();g.moveTo(0,10.5+(1-fl)*3);g.quadraticCurveTo(3.4,17,0,20);g.quadraticCurveTo(-3.4,17,0,10.5+(1-fl)*3);g.fill();
    g.fillStyle='#5ab8ff';g.beginPath();g.ellipse(0,17.4,1.8,2.4,0,0,TAU);g.fill();
    g.strokeStyle='#2a2a32';g.lineWidth=1;for(const bx of [-4,-1.3,1.3,4]){g.beginPath();g.moveTo(bx,9);g.lineTo(bx,21);g.stroke();}
    g.restore();gl(cx,y+16,46,'#6ac8ff');
    return true;
  }
  if(c.row===3&&dn&&(rel%11===2||rel%11===8)&&!isShaft(tx)){
    const k=(h>>>3)%4,b=y+TILE;
    if(k===0){/* саркофаг */
      g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x+1,b-2,31,2);
      g.fillStyle='#3a3742';g.fillRect(x+2,b-11,28,11);g.fillStyle='#4e4a58';g.fillRect(x,b-14,32,4);g.fillStyle='#5c5866';g.fillRect(x+1,b-15,30,1.4);
      g.strokeStyle='rgba(0,0,0,.4)';g.lineWidth=1;g.strokeRect(x+5.5,b-8.5,21,6);
      g.fillStyle='#8a8494';g.fillRect(x+15,b-13.4,2,-0.1);g.fillStyle='rgba(150,210,255,.35)';g.fillRect(x+15,b-8,2,4);g.fillRect(x+13,b-7,6,1.4);
      if(h%5===0){g.fillStyle='#cfc6b0';g.beginPath();g.arc(x+24,b-17.5,3,0,TAU);g.fill();g.fillStyle='#1a1418';g.fillRect(x+22.6,b-18.4,1.3,1.4);g.fillRect(x+24.6,b-18.4,1.3,1.4);}
    }else if(k===1){/* надгробие */
      g.fillStyle='rgba(0,0,0,.3)';g.fillRect(x+7,b-2,20,2);
      g.fillStyle='#45414f';g.beginPath();g.moveTo(x+9,b);g.lineTo(x+9,b-13);g.arc(x+16,b-13,7,Math.PI,0);g.lineTo(x+23,b);g.closePath();g.fill();
      g.fillStyle='rgba(255,255,255,.08)';g.fillRect(x+9,b-13,1.4,13);
      g.strokeStyle='rgba(0,0,0,.45)';g.lineWidth=1;g.beginPath();g.moveTo(x+12,b-12);g.lineTo(x+20,b-12);g.moveTo(x+12,b-9);g.lineTo(x+20,b-9);g.moveTo(x+13,b-6);g.lineTo(x+19,b-6);g.moveTo(x+20,b-18);g.lineTo(x+18,b-14);g.lineTo(x+21,b-11);g.stroke();
    }else if(k===2){/* погребальная урна с дымком душ */
      g.fillStyle='#5a3e30';g.beginPath();g.moveTo(x+12,b);g.quadraticCurveTo(x+8,b-8,x+12,b-13);g.lineTo(x+20,b-13);g.quadraticCurveTo(x+24,b-8,x+20,b);g.closePath();g.fill();
      g.fillStyle='#3a2820';g.fillRect(x+11,b-15,10,2.4);g.fillStyle='rgba(255,220,170,.15)';g.fillRect(x+12,b-11,2,8);
      g.strokeStyle='#8a6a40';g.lineWidth=0.8;g.beginPath();g.moveTo(x+10.5,b-8);g.lineTo(x+21.5,b-8);g.stroke();
      const ph=(time*0.35+(h%9)*0.11)%1;g.fillStyle='rgba(150,210,255,'+(0.3*(1-ph)).toFixed(2)+')';g.beginPath();g.arc(x+16+Math.sin(time*2+h)*2*ph,b-17-ph*18,1.6+ph*3,0,TAU);g.fill();
    }else{/* куча костей */
      g.fillStyle='#b8af98';for(let q=0;q<4;q++){g.save();g.translate(x+7+q*6,b-2-(q%2)*2);g.rotate(((h>>>q)%7-3)*0.25);g.fillRect(-5,-1,10,2);g.beginPath();g.arc(-5,0,1.5,0,TAU);g.arc(5,0,1.5,0,TAU);g.fill();g.restore();}
      g.fillStyle='#d4cbb4';g.beginPath();g.arc(x+13,b-7,4,0,TAU);g.arc(x+21,b-5.5,3.4,0,TAU);g.fill();
      g.fillStyle='#1a1418';g.fillRect(x+11,b-8.4,1.6,1.8);g.fillRect(x+13.8,b-8.4,1.6,1.8);g.fillRect(x+19.6,b-6.6,1.4,1.5);g.fillRect(x+21.8,b-6.6,1.4,1.5);
    }
    return true;
  }
  return false;
}
function hellAirDecor(g,x,y,tx,ty,bi,h,up,dn,time,gl,solid){
  if(bi===8){
    if(catCryptDecor(g,x,y,tx,ty,h,up,dn,time,gl))return;
    if(up&&h%4<2){const wl=solid(tx-1,ty),wr=solid(tx+1,ty);if(wl&&h%4===0)drawCobweb(g,x,y,1,12+(h>>>6)%8);else if(wr&&h%4===1)drawCobweb(g,x+TILE,y,-1,12+(h>>>6)%8);}
  }

  const sL=solid(tx-1,ty),sR=solid(tx+1,ty);
  if((sL||sR)&&!up&&!dn){
    const wx=sL?x:x+TILE,dir=sL?1:-1;
    if(bi===5&&h%9===0){/* тлеющая трещина в стене */
      const a=0.5+0.4*Math.sin(time*2+h%13);g.strokeStyle='rgba(255,'+(90+(h%60))+',30,'+a.toFixed(2)+')';g.lineWidth=2;
      g.beginPath();g.moveTo(wx,y+6);g.lineTo(wx+dir*5,y+12);g.lineTo(wx+dir*2,y+18);g.lineTo(wx+dir*6,y+26);g.stroke();gl(wx+dir*4,y+16,22,'#ff6a1a');
    }else if(bi===6&&h%8===0){/* глаз в стене плоти: следит за игроком и моргает */
      const cx=wx+dir*7,cy=y+16,bl=((time*0.4+(h%17)*0.13)%1)>0.94;
      g.fillStyle='#5a0a14';g.beginPath();g.ellipse(cx,cy,8,6,0,0,TAU);g.fill();
      if(bl){g.strokeStyle='#2a0006';g.lineWidth=2;g.beginPath();g.moveTo(cx-6,cy);g.lineTo(cx+6,cy);g.stroke();}
      else{g.fillStyle='#f0e0c8';g.beginPath();g.ellipse(cx,cy,6,4.4,0,0,TAU);g.fill();
        const ax=player.x-cx,ay=player.y-player.h*0.6-cy,al=Math.hypot(ax,ay)||1;
        g.fillStyle='#a0101e';g.beginPath();g.arc(cx+ax/al*2.4,cy+ay/al*1.6,2.6,0,TAU);g.fill();g.fillStyle='#000';g.beginPath();g.arc(cx+ax/al*2.6,cy+ay/al*1.8,1.1,0,TAU);g.fill();}
      g.strokeStyle='rgba(140,10,30,.7)';g.lineWidth=1;g.beginPath();g.moveTo(cx-8,cy);g.lineTo(cx-12,cy-4);g.moveTo(cx+8,cy+1);g.lineTo(cx+12,cy+5);g.stroke();
    }else if(bi===7&&h%9===0){/* серный клапан, пыхтящий газом */
      g.fillStyle='#8a8020';g.beginPath();g.ellipse(wx+dir*2,y+16,5,7,0,0,TAU);g.fill();g.fillStyle='#2a2a04';g.beginPath();g.ellipse(wx+dir*3,y+16,2.4,3.4,0,0,TAU);g.fill();
      const ph=(time*0.7+(h%11)*0.09)%1;if(ph<0.6){const q=ph/0.6;g.fillStyle='rgba(200,230,70,'+(0.35*(1-q))+')';g.beginPath();g.arc(wx+dir*(6+q*22),y+16-q*8,4+q*10,0,TAU);g.fill();}
      gl(wx+dir*3,y+16,16,'#d8e84a');
    }else if(bi===8&&h%8===0){/* ниша с черепом и свечой */
      g.fillStyle='#16141c';g.beginPath();g.moveTo(wx,y+26);g.lineTo(wx,y+8);g.quadraticCurveTo(wx+dir*12,y+4,wx+dir*12,y+14);g.lineTo(wx+dir*12,y+26);g.closePath();g.fill();
      g.fillStyle='#d8d0bc';g.beginPath();g.arc(wx+dir*6,y+20,4,0,TAU);g.fill();g.fillStyle='#1a1410';g.fillRect(wx+dir*6-2.5,y+19,1.6,1.6);g.fillRect(wx+dir*6+0.8,y+19,1.6,1.6);
      const fl=Math.sin(time*9+h%7)*1;g.fillStyle='#e8e0c8';g.fillRect(wx+dir*10-1,y+14,2,6);g.fillStyle='#7ad8ff';g.beginPath();g.ellipse(wx+dir*10,y+12+fl*0.4,1.6,3,0,0,TAU);g.fill();gl(wx+dir*10,y+12,20,'#7ad8ff');
    }else if(bi>=9&&h%8===0){/* обсидиановые кристаллы с жилой лавы */
      g.fillStyle='#120a18';g.beginPath();g.moveTo(wx,y+8);g.lineTo(wx+dir*14,y+12);g.lineTo(wx,y+16);g.closePath();g.fill();
      g.beginPath();g.moveTo(wx,y+16);g.lineTo(wx+dir*10,y+22);g.lineTo(wx,y+26);g.closePath();g.fill();
      g.strokeStyle='rgba(180,140,255,.5)';g.lineWidth=1;g.beginPath();g.moveTo(wx,y+10);g.lineTo(wx+dir*12,y+12);g.stroke();
      const a=0.5+0.4*Math.sin(time*2.6+h%9);g.fillStyle='rgba(255,140,40,'+a.toFixed(2)+')';g.fillRect(sL?wx:wx-2,y+4,2,24);gl(wx,y+16,20,'#ff7a2a');
    }
  }
  if(dn&&!up){
    if(bi===5&&h%23===4){/* обугленное дерево */
      g.strokeStyle='#161010';g.lineWidth=3;g.lineCap='round';g.beginPath();g.moveTo(x+16,y+TILE);g.lineTo(x+17,y+4);g.moveTo(x+16,y+16);g.lineTo(x+8,y+6);g.moveTo(x+17,y+10);g.lineTo(x+25,y+2);g.stroke();g.lineCap='butt';
      g.strokeStyle='rgba(255,100,30,.5)';g.lineWidth=1;g.beginPath();g.moveTo(x+16,y+TILE-2);g.lineTo(x+16.5,y+14);g.stroke();
    }else if(bi===8&&h%13===5){/* свечи */
      for(let k=0;k<3;k++){const cx=x+8+k*7,hh=6+((h>>>k)%6);g.fillStyle='#e8e0c8';g.fillRect(cx-1.5,y+TILE-hh,3,hh);
        const fl=Math.sin(time*10+k+h%5)*0.6;g.fillStyle='#ffd070';g.beginPath();g.ellipse(cx,y+TILE-hh-3+fl*0.3,1.4,2.6,0,0,TAU);g.fill();gl(cx,y+TILE-hh-3,14,'#ffb050');}
    }else if(bi===6&&h%17===6){/* пульсирующий мешок с кровью */
      const p=1+0.1*Math.sin(time*4+h%5);g.fillStyle='#7a0a18';g.beginPath();g.ellipse(x+16,y+TILE-9*p,7*p,9*p,0,0,TAU);g.fill();
      g.strokeStyle='#3a0006';g.lineWidth=1;g.beginPath();g.moveTo(x+12,y+TILE-14);g.quadraticCurveTo(x+16,y+TILE-9,x+20,y+TILE-15);g.stroke();
      g.fillStyle='rgba(255,120,140,.35)';g.beginPath();g.ellipse(x+13,y+TILE-13*p,2,3,0,0,TAU);g.fill();
    }else if(bi>=9&&h%15===7){/* лавовый гейзер-жерло */
      g.fillStyle='#1a0804';g.beginPath();g.moveTo(x+4,y+TILE);g.lineTo(x+11,y+TILE-8);g.lineTo(x+21,y+TILE-8);g.lineTo(x+28,y+TILE);g.closePath();g.fill();
      const ph=(time*0.5+(h%7)*0.13)%1;g.fillStyle='rgba(255,180,60,.9)';g.fillRect(x+13,y+TILE-9,6,2);
      if(ph<0.25){const q=ph/0.25;g.fillStyle='rgba(255,'+(200-Math.floor(q*100))+',50,'+(1-q)+')';g.beginPath();g.ellipse(x+16,y+TILE-10-q*26,3+q*2,6+q*14,0,0,TAU);g.fill();gl(x+16,y+TILE-20,36,'#ff8a2a');}
      gl(x+16,y+TILE-8,18,'#ff6a1a');
    }
  }
  if(up){
    if(bi===5&&h%6===0){
      g.fillStyle='#2a2422';g.beginPath();g.moveTo(x+10,y);g.lineTo(x+22,y);g.lineTo(x+16+((h>>>5)%5)-2,y+9+((h>>>8)%10));g.closePath();g.fill();
    }else if(bi===6&&h%4===0){
      const l=8+((h>>>5)%16),cx=x+6+((h>>>9)%20),sw=Math.sin(time*1.5+tx)*1.5;
      g.strokeStyle='#5a0a14';g.lineWidth=3;g.beginPath();g.moveTo(cx,y);g.quadraticCurveTo(cx+sw,y+l*0.6,cx+sw*1.5,y+l);g.stroke();
      const ph=(time*0.8+(h%7)*0.37)%1.4;if(ph<1){const yy=y+l+ph*30;g.fillStyle='#b0101e';g.beginPath();g.arc(cx+sw*1.5,yy,2,0,TAU);g.fill();}
    }else if(bi===7&&h%5===0){
      const cx=x+8+((h>>>6)%16),l=6+((h>>>9)%10);
      g.fillStyle='#d8d040';g.beginPath();g.moveTo(cx-5,y);g.lineTo(cx+5,y);g.lineTo(cx,y+l);g.closePath();g.fill();
      gl(cx,y+l*0.5,16,'#e8e060');
    }else if(bi===8&&h%7===0){
      const sw=Math.sin(time*1.1+h%9)*2,len=12+((h>>>5)%20),cx=x+16;
      g.strokeStyle='#6a6a72';g.lineWidth=1.5;for(let k=0;k<len;k+=5){g.beginPath();g.ellipse(cx+sw*k/len,y+k+2,1.4,2.4,0,0,TAU);g.stroke();}
      if(h%3===0){g.fillStyle='#d8d0bc';g.beginPath();g.arc(cx+sw,y+len+5,4,0,TAU);g.fill();g.fillStyle='#1a1410';g.fillRect(cx+sw-2,y+len+4,1.5,1.5);g.fillRect(cx+sw+0.8,y+len+4,1.5,1.5);}
    }else if(bi===9&&h%6===0){
      g.fillStyle='#1c0804';g.beginPath();g.moveTo(x+9,y);g.lineTo(x+23,y);g.lineTo(x+16,y+12+((h>>>5)%8));g.closePath();g.fill();
      const ph=(time*1.1+(h%7)*0.37)%1.3;
      if(ph<1){const yy=y+12+ph*36;g.fillStyle='#ffb050';g.beginPath();g.arc(x+16,yy,2.4,0,TAU);g.fill();gl(x+16,yy,18,'#ff8a30');}
    }
  }
  if(dn){
    if(bi===5){
      if(h%7===0){g.fillStyle='#3a3230';g.beginPath();g.ellipse(x+16,y+TILE,12,5,0,Math.PI,0);g.fill();
        const a=0.4+0.4*Math.sin(time*2+h%9);g.fillStyle='rgba(255,100,40,'+a.toFixed(2)+')';g.fillRect(x+12,y+TILE-3,8,2);gl(x+16,y+TILE-3,18,'#ff6a2a');}
      else if(h%5===1){g.strokeStyle='#2a2220';g.lineWidth=1.6;const cx=x+10+((h>>>6)%12);g.beginPath();g.moveTo(cx,y+TILE);g.lineTo(cx-2,y+TILE-12);g.moveTo(cx-1,y+TILE-6);g.lineTo(cx+4,y+TILE-10);g.stroke();}
    }else if(bi===6){
      if(h%6===0){const cx=x+16,p=1+0.12*Math.sin(time*3+h%7);
        g.fillStyle='#6a0a18';g.beginPath();g.ellipse(cx,y+TILE-6*p,8*p,6*p,0,0,TAU);g.fill();
        g.fillStyle='#b01a2a';g.beginPath();g.ellipse(cx-2,y+TILE-8*p,3,2,0,0,TAU);g.fill();gl(cx,y+TILE-6,20,'#ff2a3a');}
      else if(h%5===1){g.fillStyle='#d8cfc0';for(let k=0;k<3;k++){g.beginPath();g.moveTo(x+6+k*9,y+TILE);g.lineTo(x+9+k*9,y+TILE-8-((h>>>k)%6));g.lineTo(x+12+k*9,y+TILE);g.closePath();g.fill();}}
    }else if(bi===7){
      if(h%5===0){
        const cx=x+8+((h>>>6)%16),hh=10+((h>>>9)%12);
        g.fillStyle='#c8c030';g.beginPath();g.moveTo(cx-5,y+TILE);g.lineTo(cx+5,y+TILE);g.lineTo(cx+1,y+TILE-hh);g.closePath();g.fill();
        g.fillStyle='rgba(255,255,180,.5)';g.fillRect(cx-1,y+TILE-hh+3,2,hh-4);gl(cx,y+TILE-hh*0.5,18,'#e8e060');
      }else if(h%4===1){
        const ph=((time*0.9+(h%9)*0.21)%1);g.fillStyle='rgba(180,255,90,'+(0.6*(1-ph)).toFixed(2)+')';g.beginPath();g.arc(x+8+(h>>>5)%16,y+TILE-4-ph*22,2+ph*3,0,TAU);g.fill();
      }
    }else if(bi===8){
      if(h%6===0){g.fillStyle='#d8d0bc';g.beginPath();g.arc(x+12,y+TILE-5,5,0,TAU);g.arc(x+21,y+TILE-4,4,0,TAU);g.fill();g.fillStyle='#1a1410';g.fillRect(x+10,y+TILE-7,2,2);g.fillRect(x+13,y+TILE-7,2,2);}
      else if(h%9===2){const a=0.5+0.5*Math.sin(time*2.4+h%11);g.fillStyle='rgba(120,200,255,'+(0.5*a).toFixed(2)+')';g.beginPath();g.ellipse(x+16,y+TILE-10,4,8,0,0,TAU);g.fill();gl(x+16,y+TILE-10,30,'#5ab8ff');}
    }else if(bi===9){
      if(h%5===0){const a=0.5+0.4*Math.sin(time*3+h%11);g.strokeStyle='rgba(255,150,40,'+a.toFixed(2)+')';g.lineWidth=2;g.beginPath();g.moveTo(x+4,y+TILE-1);g.lineTo(x+12,y+TILE-5);g.lineTo(x+20,y+TILE-1);g.lineTo(x+28,y+TILE-4);g.stroke();gl(x+16,y+TILE-3,28,'#ff7a2a');}
      else if(h%7===3&&settings.quality!=='low'&&Math.random()<0.01)spawnPart(x+16,y+TILE-4,rnd(-10,10),rnd(-70,-40),0.8,'#ffb050',2,-30);
    }
  }
}
function drawBiomeDecor(g,tx0,tx1,ty0,ty1){
  const cols=tx1-tx0+3,rows=ty1-ty0+3,gx0=tx0-1,gy0=ty0-1;
  if(!_dg||_dg.length<cols*rows)_dg=new Uint8Array(cols*rows);
  for(let y=0;y<rows;y++)for(let x=0;x<cols;x++)_dg[y*cols+x]=getTile(gx0+x,gy0+y);
  const inside=structInterior(tx0,tx1,ty0,ty1);
  const T=(x,y)=>_dg[(y-gy0)*cols+(x-gx0)];
  const solid=(x,y)=>{const t=T(x,y);return t!==T_AIR&&t!==T_LAVA&&t!==T_LADDER&&!isLiq(t);};
  const time=G.time,low=settings.quality==='low';
  const glows=[];
  const gl=(x,y,r,c)=>{if(glows.length<(low?30:110))glows.push([x,y,r,c]);};
  const PAL2=['#8a6cff','#5cc8ff','#d38cff'];
  const PAL4=['#c58bff','#7fe0ff','#ff8fd8','#9bffcf'];
  const MUSH=['#d85a5a','#e8b04a','#b48ae0','#5ac8b0'];
  g.save();
  for(let ty=ty0;ty<=ty1;ty++){
    if(ty<3)continue;
    const bi=biomeAt(ty);
    for(let tx=tx0;tx<=tx1;tx++){
      const t=T(tx,ty);
      const x=tx*TILE,y=ty*TILE;
      const h=hash2(tx,ty,41);
      if(t===T_LADDER||t===T_LAVA||isLiq(t))continue;
      if(inside.has(tx+','+ty))continue;
      if(t===T_WOOD||t===T_BRICK||t===T_BONE)continue;
      if(t===T_AIR){
        const up=solid(tx,ty-1),dn=solid(tx,ty+1);
        const cr=(bi===1)?corridorInfo(tx,ty):null;
        if(cr){
          /* заброшенная штольня */
          if(ty===cr.row+2){
            g.fillStyle='#4e3720';g.fillRect(x,y+TILE-5,TILE,5);
            g.fillStyle='#8a8e98';g.fillRect(x,y+TILE-10,TILE,2);g.fillRect(x,y+TILE-6,TILE,1);
            g.fillStyle='#6a4a2a';for(let k=0;k<4;k++)g.fillRect(x+k*8+2,y+TILE-8,3,3);
          }
          const rel=tx-cr.x0;
          if(rel%6===0){
            g.fillStyle='#6f4c2a';g.fillRect(x+13,y,6,TILE);
            g.fillStyle='#8a6238';g.fillRect(x+13,y,2,TILE);
            if(ty===cr.row){g.fillStyle='#7a5530';g.fillRect(x-4,y,TILE+8,7);g.fillStyle='#9a7040';g.fillRect(x-4,y,TILE+8,2);}
          }
          if(rel%12===3&&ty===cr.row+1){
            g.fillStyle='#caa24a';g.fillRect(x+12,y+4,8,10);g.fillStyle='#ffe3a0';g.fillRect(x+14,y+6,4,6);
            g.strokeStyle='#5a4a30';g.lineWidth=1;g.beginPath();g.moveTo(x+16,y);g.lineTo(x+16,y+4);g.stroke();
            gl(x+16,y+10,34,'#ffd98a');
          }
          if(rel===Math.floor(cr.len/2)&&ty===cr.row+2){
            g.fillStyle='#5a4a3c';g.beginPath();g.moveTo(x+3,y+10);g.lineTo(x+29,y+10);g.lineTo(x+25,y+24);g.lineTo(x+7,y+24);g.closePath();g.fill();
            g.fillStyle='#b06a3b';for(let k=0;k<4;k++){g.beginPath();g.arc(x+8+k*5,y+9,3.5,0,TAU);g.fill();}
            g.fillStyle='#222';g.beginPath();g.arc(x+9,y+26,3.2,0,TAU);g.arc(x+23,y+26,3.2,0,TAU);g.fill();
          }
          continue;
        }
        if(bi>=10){lilacAirDecor(g,x,y,tx,ty,bi,h,up,dn,time,gl,solid);continue;}
        if(bi>=5){hellAirDecor(g,x,y,tx,ty,bi,h,up,dn,time,gl,solid);continue;}
        const gk=(bi===2)?geodeAt(tx,ty):0;
        if(gk===1){
          /* внутри геоды — крупные светящиеся кристаллы */
          if(h%3!==0){
            const col=PAL4[(h>>>3)%4];
            g.fillStyle=col;g.globalAlpha=0.92;
            const sz=9+((h>>>6)%9);
            if(up){const cx=x+8+((h>>>9)%16);g.beginPath();g.moveTo(cx-5,y);g.lineTo(cx+5,y);g.lineTo(cx,y+sz);g.closePath();g.fill();gl(cx,y+sz*0.6,26,col);}
            else if(dn){const cx=x+8+((h>>>9)%16);g.beginPath();g.moveTo(cx-6,y+TILE);g.lineTo(cx+6,y+TILE);g.lineTo(cx+1,y+TILE-sz-4);g.closePath();g.fill();gl(cx,y+TILE-sz*0.6,28,col);}
            else if(solid(tx-1,ty)){g.beginPath();g.moveTo(x,y+12);g.lineTo(x,y+22);g.lineTo(x+sz,y+17);g.closePath();g.fill();gl(x+4,y+17,22,col);}
            else if(solid(tx+1,ty)){g.beginPath();g.moveTo(x+TILE,y+12);g.lineTo(x+TILE,y+22);g.lineTo(x+TILE-sz,y+17);g.closePath();g.fill();gl(x+TILE-4,y+17,22,col);}
            g.globalAlpha=1;
          }
          if((h>>>5)%4===0){
            const a=0.4+0.6*Math.abs(Math.sin(time*3+h%17));
            g.globalAlpha=a;g.fillStyle='#fff';
            const sx=x+6+(h>>>11)%20,sy=y+6+(h>>>14)%20;
            g.fillRect(sx-3,sy,7,1);g.fillRect(sx,sy-3,1,7);g.globalAlpha=1;
          }
          continue;
        }
        if(up){
          if(bi===0&&h%5===0){
            const ox=8+((h>>>9)%16),len=7+((h>>>4)%15),sw=Math.sin(time*1.3+tx*0.9)*1.6;
            g.strokeStyle='#5c3b1f';g.lineWidth=2;
            g.beginPath();g.moveTo(x+ox,y);g.quadraticCurveTo(x+ox+2+sw,y+len*0.5,x+ox-2+sw*1.6,y+len);g.stroke();
            g.strokeStyle='#7d5733';g.lineWidth=1;
            g.beginPath();g.moveTo(x+ox+3,y);g.quadraticCurveTo(x+ox+6+sw,y+len*0.4,x+ox+4+sw*1.2,y+len*0.8);g.stroke();
          }else if(bi===1&&h%6===0){
            const w=8+((h>>>5)%8),l=7+((h>>>9)%15);
            g.fillStyle='#4a5160';g.beginPath();g.moveTo(x+16-w/2,y);g.lineTo(x+16+w/2,y);g.lineTo(x+16+((h>>>13)%5)-2,y+l);g.closePath();g.fill();
            g.strokeStyle='#7a8296';g.lineWidth=1;g.beginPath();g.moveTo(x+16-w/2+1,y);g.lineTo(x+16+((h>>>13)%5)-2,y+l);g.stroke();
          }else if(bi===2&&h%4===0){
            const col=PAL2[(h>>>3)%3],l=8+((h>>>7)%12),cx=x+8+((h>>>10)%16);
            g.fillStyle=col;g.globalAlpha=0.9;
            g.beginPath();g.moveTo(cx-4,y);g.lineTo(cx+4,y);g.lineTo(cx,y+l);g.closePath();g.fill();
            g.beginPath();g.moveTo(cx+4,y);g.lineTo(cx+9,y);g.lineTo(cx+6,y+l*0.55);g.closePath();g.fill();
            g.globalAlpha=1;gl(cx,y+l*0.6,22,col);
          }else if(bi===3&&h%7===0){
            g.fillStyle='#2a1410';g.beginPath();g.moveTo(x+10,y);g.lineTo(x+22,y);g.lineTo(x+16,y+10+((h>>>5)%8));g.closePath();g.fill();
            const ph=(time*0.9+(h%7)*0.37)%1.5;
            if(ph<1){const yy=y+10+ph*34;g.fillStyle='#ff9a40';g.beginPath();g.arc(x+16,yy,2.2,0,TAU);g.fill();gl(x+16,yy,16,'#ff8a30');}
          }else if(bi===4&&h%5===0){
            const ox=x+8+((h>>>8)%16);
            g.strokeStyle='rgba(120,80,190,.8)';g.lineWidth=2;g.beginPath();g.moveTo(ox,y);
            let px=ox,py=y;for(let k=1;k<=4;k++){px=ox+Math.sin(time*1.4+k*1.3+h%7)*(3+k);py=y+k*6;g.lineTo(px,py);}
            g.stroke();
            const a=0.5+0.5*Math.sin(time*2+h%9);g.fillStyle='#c0a0ff';g.globalAlpha=a;g.beginPath();g.arc(px,py,2,0,TAU);g.fill();g.globalAlpha=1;
            gl(px,py,18,'#a080ff');
          }
        }
        if(dn){
          if(bi===0){
            if(h%11===0){
              const col=MUSH[(h>>>4)%4],cx=x+10+((h>>>8)%12);
              g.fillStyle='#d8cfa8';g.fillRect(cx-1.5,y+TILE-9,3,9);
              g.fillStyle=col;g.beginPath();g.ellipse(cx,y+TILE-9,6,4.5,0,Math.PI,0);g.fill();
              g.fillStyle='rgba(255,255,255,.7)';g.fillRect(cx-3,y+TILE-12,2,2);g.fillRect(cx+1,y+TILE-11,2,2);
              if((h>>>6)%3===0)gl(cx,y+TILE-10,26,'#7dffb0');
            }else if(h%4===1){
              g.strokeStyle='#7a6a3a';g.lineWidth=1.5;
              for(let k=0;k<3;k++){g.beginPath();g.moveTo(x+8+k*7,y+TILE);g.lineTo(x+7+k*7+((h>>>k)%3),y+TILE-5-((h>>>(k+3))%4));g.stroke();}
            }else if(h%9===2){g.fillStyle='#6a5a4a';g.beginPath();g.arc(x+12+((h>>>5)%10),y+TILE-2,3,Math.PI,0);g.fill();}
          }else if(bi===1){
            if(h%7===0){
              const w=9+((h>>>5)%7),l=7+((h>>>9)%13);
              g.fillStyle='#454c5a';g.beginPath();g.moveTo(x+16-w/2,y+TILE);g.lineTo(x+16+w/2,y+TILE);g.lineTo(x+16+((h>>>13)%5)-2,y+TILE-l);g.closePath();g.fill();
            }else if(h%5===1){g.fillStyle='#5a6070';g.beginPath();g.arc(x+10+((h>>>5)%12),y+TILE-2,2.6,Math.PI,0);g.arc(x+19+((h>>>9)%8),y+TILE-1,2,Math.PI,0);g.fill();}
          }else if(bi===2){
            if(h%4===0){
              const col=PAL2[(h>>>3)%3],l=9+((h>>>7)%13),cx=x+8+((h>>>10)%16);
              g.fillStyle=col;g.globalAlpha=0.92;
              g.beginPath();g.moveTo(cx-4,y+TILE);g.lineTo(cx+4,y+TILE);g.lineTo(cx+1,y+TILE-l);g.closePath();g.fill();
              g.beginPath();g.moveTo(cx+3,y+TILE);g.lineTo(cx+10,y+TILE);g.lineTo(cx+7,y+TILE-l*0.6);g.closePath();g.fill();
              g.globalAlpha=1;gl(cx,y+TILE-l*0.5,24,col);
            }else if(h%3===1){
              g.fillStyle='rgba(74,208,192,.35)';g.beginPath();g.ellipse(x+16,y+TILE-1,11,3,0,0,TAU);g.fill();
            }
          }else if(bi===3){
            if(h%9===0){
              const a=0.5+0.4*Math.sin(time*3+h%11);
              g.strokeStyle='rgba(255,130,40,'+a.toFixed(2)+')';g.lineWidth=2;
              g.beginPath();g.moveTo(x+6,y+TILE-1);g.lineTo(x+14,y+TILE-4);g.lineTo(x+22,y+TILE-1);g.lineTo(x+27,y+TILE-3);g.stroke();
              gl(x+16,y+TILE-3,26,'#ff7a2a');
            }else if(h%5===2){g.fillStyle='#1c0c08';g.beginPath();g.arc(x+8+((h>>>5)%16),y+TILE-2,3.4,Math.PI,0);g.fill();}
          }else if(bi===4){
            if(h%11===0){
              g.strokeStyle='#9a92b8';g.lineWidth=3;g.beginPath();g.arc(x+16,y+TILE,12,Math.PI*1.1,Math.PI*1.9);g.stroke();
            }else if(h%7===1){
              const cx=x+10+((h>>>6)%12),a=0.55+0.45*Math.sin(time*2+h%13);
              g.strokeStyle='#4a3a78';g.lineWidth=1.5;g.beginPath();g.moveTo(cx,y+TILE);g.lineTo(cx+2,y+TILE-12);g.stroke();
              g.globalAlpha=a;g.fillStyle='#b8a0ff';g.beginPath();g.arc(cx+2,y+TILE-13,3,0,TAU);g.fill();g.globalAlpha=1;
              gl(cx+2,y+TILE-13,20,'#a080ff');
            }
          }
        }
      }else if(t!==T_BEDROCK){
        /* стенки: мох, трещины, грани, окаменелости */
        if(!solid(tx,ty-1)){
          if(bi>=10){lilacEdge(g,x,y,bi,h);lilacEdgeT(g,x,y,h,time);}
          else if(bi===0){g.fillStyle='rgba(95,110,52,.9)';g.fillRect(x,y,TILE,3);if(h%3===0){g.fillRect(x+4+(h>>>4)%20,y-2,2,2);}}
          else if(bi===1){g.fillStyle='rgba(150,160,180,.3)';g.fillRect(x,y,TILE,2);}
          else if(bi===2){g.fillStyle='rgba(185,168,255,.38)';g.fillRect(x,y,TILE,2);}
          else if(bi===3){g.fillStyle='rgba(255,140,60,.45)';g.fillRect(x,y,TILE,2);}
          else if(bi===5){g.fillStyle='rgba(150,140,130,.55)';g.fillRect(x,y,TILE,3);if(h%4===0)g.fillRect(x+4+(h>>>4)%20,y-2,3,2);}
          else if(bi===6){g.fillStyle='rgba(140,10,30,.75)';g.fillRect(x,y,TILE,3);if(h%3===0){g.beginPath();g.arc(x+6+(h>>>4)%20,y+3,2.5,0,Math.PI);g.fill();}}
          else if(bi===7){g.fillStyle='rgba(220,220,60,.5)';g.fillRect(x,y,TILE,2);if(h%3===0){g.fillStyle='rgba(250,250,140,.6)';g.fillRect(x+3+(h>>>4)%22,y-3,5,3);}}
          else if(bi===8){g.fillStyle='rgba(220,215,200,.35)';g.fillRect(x,y,TILE,2);}
          else if(bi===9){g.fillStyle='rgba(255,110,30,.55)';g.fillRect(x,y,TILE,2);}
          else{g.fillStyle='rgba(154,122,255,.32)';g.fillRect(x,y,TILE,2);}
        }
        if(t===T_WOOD){
          g.strokeStyle='rgba(50,28,10,.5)';g.lineWidth=1;
          g.beginPath();g.moveTo(x,y+10);g.lineTo(x+TILE,y+10);g.moveTo(x,y+21);g.lineTo(x+TILE,y+21);g.stroke();
          g.fillStyle='rgba(30,18,6,.55)';g.fillRect(x+3,y+4,2,2);g.fillRect(x+TILE-5,y+15,2,2);g.fillRect(x+6,y+26,2,2);
          g.fillStyle='rgba(255,220,170,.12)';g.fillRect(x,y,TILE,3);
        }else if(t===T_BRICK){
          g.strokeStyle='rgba(20,22,30,.55)';g.lineWidth=1;
          g.beginPath();
          for(let k=1;k<4;k++){g.moveTo(x,y+k*8);g.lineTo(x+TILE,y+k*8);}
          for(let k=0;k<4;k++){const off=(k%2)?8:0;g.moveTo(x+off+8,y+k*8);g.lineTo(x+off+8,y+k*8+8);g.moveTo(x+off+24,y+k*8);g.lineTo(x+off+24,y+k*8+8);}
          g.stroke();
          g.fillStyle='rgba(255,255,255,.08)';g.fillRect(x,y,TILE,2);
        }else if(t===T_SPRING){
          g.fillStyle='rgba(90,170,240,.55)';g.fillRect(x+6,y+TILE-10,TILE-12,10);
          g.fillStyle='rgba(180,225,255,.7)';g.fillRect(x+TILE/2-1,y+TILE-6,2,6);
          const ph=(time*1.6+(h%5)*0.2)%1;g.fillStyle='rgba(150,205,255,.85)';g.beginPath();g.arc(x+TILE/2,y+TILE+ph*14,2,0,TAU);g.fill();
          gl(x+TILE/2,y+TILE-4,26,'#7ac0ff');
        }else if(t===T_HOT){
          const a=0.55+0.4*Math.sin(time*3+h%11);
          g.fillStyle='rgba(255,90,30,'+(0.18+0.12*Math.sin(time*2.2+h%7)).toFixed(2)+')';g.fillRect(x,y,TILE,TILE);
          g.strokeStyle='rgba(255,170,60,'+a.toFixed(2)+')';g.lineWidth=2;
          g.beginPath();g.moveTo(x+3,y+9);g.lineTo(x+12,y+15);g.lineTo(x+16,y+8);g.lineTo(x+26,y+19);g.lineTo(x+20,y+28);g.stroke();
          g.beginPath();g.moveTo(x+8,y+26);g.lineTo(x+14,y+20);g.stroke();
          gl(x+16,y+16,20,'#ff6a20');
        }else if(t===T_VENT){
          const warn=ventWarning(tx,ty),erup=ventErupting(tx,ty);
          const gas=G.dim===1&&ty>=550;
          g.fillStyle=gas?'#1a1c08':'#1c0e08';g.beginPath();g.ellipse(x+16,y+4,10,5,0,0,TAU);g.fill();
          g.fillStyle=gas?(erup?'#e8ff60':warn?'#b0d030':'#4a5a10'):(erup?'#ffcc50':warn?'#ff7a30':'#7a2a14');g.beginPath();g.ellipse(x+16,y+4,6,2.6,0,0,TAU);g.fill();
          if(warn||erup)gl(x+16,y+2,erup?44:30,gas?'#c8ff40':'#ff8a30');
          if(erup){
            const hgt=6*TILE;
            const gr=g.createLinearGradient(0,y,0,y-hgt);
            if(gas){gr.addColorStop(0,'rgba(220,255,120,.8)');gr.addColorStop(0.5,'rgba(140,200,40,.5)');gr.addColorStop(1,'rgba(90,140,10,0)');}
            else{gr.addColorStop(0,'rgba(255,220,100,.85)');gr.addColorStop(0.5,'rgba(255,120,30,.6)');gr.addColorStop(1,'rgba(255,60,10,0)');}
            g.fillStyle=gr;
            g.beginPath();g.moveTo(x+8,y+2);
            for(let k=0;k<=8;k++){const yy=y-hgt*k/8;g.lineTo(x+16+10*Math.sin(time*14+k*1.3)-6*(k/8)+(-8+k),yy);}
            for(let k=8;k>=0;k--){const yy=y-hgt*k/8;g.lineTo(x+24-9*Math.sin(time*13+k*1.1+2)+6*(k/8),yy);}
            g.closePath();g.fill();
            if(Math.random()<0.5)spawnPart(x+16+rnd(-6,6),y-rnd(0,hgt),rnd(-30,30),rnd(-80,-20),0.6,gas?'#c8ff60':'#ffb050',2.6,-20);
          }
        }else if(bi===4&&ty>=1030&&(monolithAt(tx,ty)===2||monolithAt(tx,ty)===3)){
          const a=0.45+0.4*Math.sin(time*2+(tx+ty)%9);
          g.strokeStyle='rgba(150,255,235,'+a.toFixed(2)+')';g.lineWidth=1.6;
          const rr=(h>>>3)%3;
          if(rr===0){g.beginPath();g.moveTo(x+8,y+8);g.lineTo(x+16,y+4);g.lineTo(x+24,y+8);g.lineTo(x+16,y+14);g.closePath();g.stroke();}
          else if(rr===1){g.beginPath();g.moveTo(x+16,y+4);g.lineTo(x+16,y+26);g.moveTo(x+8,y+14);g.lineTo(x+24,y+14);g.stroke();}
          else{g.beginPath();g.arc(x+16,y+16,7,0,TAU);g.moveTo(x+9,y+16);g.lineTo(x+23,y+16);g.stroke();}
          gl(x+16,y+16,22,'#7affe8');
        }else if(t===T_MAGMA&&h%7===0){
          const a=0.45+0.4*Math.sin(time*2.5+h%13);
          g.strokeStyle='rgba(255,120,40,'+a.toFixed(2)+')';g.lineWidth=2;
          const o=(h>>>5)%10;
          g.beginPath();g.moveTo(x+3,y+8+o%8);g.lineTo(x+12,y+14);g.lineTo(x+17,y+10+o%6);g.lineTo(x+27,y+20);g.stroke();
        }else if(t===T_CRYSTAL&&h%13===0){
          const a=0.5+0.5*Math.abs(Math.sin(time*2+h%7));
          g.fillStyle='rgba(220,200,255,'+a.toFixed(2)+')';
          const cx=x+8+(h>>>5)%16,cy=y+8+(h>>>9)%16;
          g.beginPath();g.moveTo(cx,cy-5);g.lineTo(cx+3,cy);g.lineTo(cx,cy+5);g.lineTo(cx-3,cy);g.closePath();g.fill();
        }else if(t===T_OBS&&h%7===0){
          const a=0.3+0.4*Math.sin(time*1.8+h%9);
          g.strokeStyle='rgba(170,120,255,'+a.toFixed(2)+')';g.lineWidth=1.5;
          g.beginPath();g.moveTo(x+4,y+24);g.lineTo(x+13,y+15);g.lineTo(x+20,y+19);g.lineTo(x+28,y+7);g.stroke();
        }else if((t===T_DIRT||t===T_STONE)&&hash2(tx,ty,59)%131===0){
          g.strokeStyle='rgba(235,225,200,.75)';g.lineWidth=2.4;
          g.beginPath();g.moveTo(x+7,y+22);g.lineTo(x+25,y+11);g.stroke();
          g.fillStyle='rgba(235,225,200,.75)';
          g.beginPath();g.arc(x+6,y+23,2.6,0,TAU);g.arc(x+26,y+10,2.6,0,TAU);g.fill();
        }else if(t===T_CRYSTAL&&hash2(tx,ty,61)%151===0){
          g.strokeStyle='rgba(230,215,255,.7)';g.lineWidth=1.8;
          g.beginPath();g.arc(x+16,y+16,3,0,TAU*1.6);g.arc(x+16,y+16,7,0,TAU*1.5);g.stroke();
        }
      }
    }
  }
  g.restore();
  if(glows.length)drawGlowList(g,glows,0.4);
}


/* ---------------- декор структур ---------------- */
function drawStructWall(g,style,x,y,wx,wy,ceil){
  const h=hash2(wx,wy,3);
  switch(style){
    case 'plank':{
      g.fillStyle='#3b2715';g.fillRect(x,y,TILE,TILE);
      for(let k=0;k<4;k++){
        g.fillStyle=((wy*4+k+((h>>>k)&1))%3===0)?'#432c18':'#35230f';
        g.fillRect(x,y+k*8,TILE,7);
        g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x,y+k*8+7,TILE,1);
      }
      g.fillStyle='rgba(0,0,0,.3)';g.fillRect(x+((wy%2)?10:22),y,1,TILE);
      g.fillStyle='rgba(20,12,4,.6)';g.fillRect(x+3,y+3,2,2);g.fillRect(x+27,y+19,2,2);
      break;}
    case 'brick':case 'brickc':{
      const cc=style==='brick'?['#2a2c34','#30323b','#262830','rgba(10,10,14,.55)']:['#251f44','#2b2450','#211b3d','rgba(160,130,255,.18)'];
      g.fillStyle=cc[0];g.fillRect(x,y,TILE,TILE);
      for(let r=0;r<4;r++){
        const off=((wy*4+r)%2)?8:0;
        for(let k=-1;k<2;k++){
          const bx=x+off+k*16;
          g.fillStyle=((h>>>(r*2+k+1))&1)?cc[1]:cc[2];
          g.fillRect(Math.max(x,bx+1),y+r*8+1,Math.min(15,x+TILE-Math.max(x,bx+1)),6);
        }
      }
      g.fillStyle=cc[3];
      for(let r=0;r<4;r++)g.fillRect(x,y+r*8,TILE,1);
      break;}
    case 'basalt':{
      g.fillStyle='#1a1416';g.fillRect(x,y,TILE,TILE);
      const off=(wx%2)?8:0;
      for(let k=0;k<3;k++){const cy=y+off-8+k*16;g.fillStyle=((wx+k)%3)?'#2a2224':'#241c1e';
        g.beginPath();g.moveTo(x+4,cy);g.lineTo(x+16,cy-6);g.lineTo(x+28,cy);g.lineTo(x+28,cy+10);g.lineTo(x+16,cy+16);g.lineTo(x+4,cy+10);g.closePath();g.fill();
        g.strokeStyle='rgba(255,110,50,.08)';g.lineWidth=1;g.stroke();}
      if(h%9===0){g.fillStyle='rgba(255,120,40,'+(0.2+0.15*Math.sin(G.time*2+h)).toFixed(2)+')';g.fillRect(x+15,y+2,2,28);}
      break;}
    case 'metal':{
      g.fillStyle='#2a2618';g.fillRect(x,y,TILE,TILE);
      g.fillStyle=(h%2)?'#3a3420':'#34301c';g.fillRect(x+1,y+1,TILE-2,TILE-2);
      g.fillStyle='rgba(120,90,30,.35)';g.beginPath();g.ellipse(x+8+(h%14),y+22,6,3,0,0,TAU);g.fill();
      g.fillStyle='#5a5034';for(const [rx,ry] of [[4,4],[28,4],[4,28],[28,28]]){g.beginPath();g.arc(x+rx,y+ry,1.6,0,TAU);g.fill();}
      g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x,y+15,TILE,2);
      if(h%5===0){g.fillStyle='rgba(180,220,60,.18)';g.fillRect(x+10,y+16,2,10+(h%6));}
      break;}
    case 'char':{
      g.fillStyle='#1a120e';g.fillRect(x,y,TILE,TILE);
      for(let k=0;k<4;k++){g.fillStyle=((wy*4+k+((h>>>k)&1))%3===0)?'#2a1c14':'#22160f';g.fillRect(x,y+k*8,TILE,7);g.fillStyle='rgba(0,0,0,.5)';g.fillRect(x,y+k*8+7,TILE,1);}
      if(h%4===0){const a=0.25+0.25*Math.sin(G.time*3+h%11);g.strokeStyle='rgba(255,110,40,'+a.toFixed(2)+')';g.lineWidth=1;g.beginPath();g.moveTo(x+3,y+8+(h%8));g.lineTo(x+14,y+12+(h%6));g.lineTo(x+26,y+9+(h%9));g.stroke();}
      break;}
    case 'hellbrick':case 'flesh':case 'bone':{
      const cc=style==='hellbrick'?['#2a0f0c','#341410','#220b08','rgba(255,90,30,.16)']:style==='flesh'?['#3a0a12','#460e18','#30070e','rgba(255,60,80,.12)']:['#4a463e','#58534a','#3e3a33','rgba(0,0,0,.35)'];
      g.fillStyle=cc[0];g.fillRect(x,y,TILE,TILE);
      for(let r=0;r<4;r++){
        const off=((wy*4+r)%2)?8:0;
        for(let k=-1;k<2;k++){const bx=x+off+k*16;g.fillStyle=((h>>>(r*2+k+1))&1)?cc[1]:cc[2];g.fillRect(Math.max(x,bx+1),y+r*8+1,Math.min(15,x+TILE-Math.max(x,bx+1)),6);}
      }
      g.fillStyle=cc[3];for(let r=0;r<4;r++)g.fillRect(x,y+r*8,TILE,1);
      if(style==='hellbrick'&&h%7===0){g.fillStyle='rgba(255,120,40,'+(0.25+0.2*Math.sin(G.time*2+h%9)).toFixed(2)+')';g.fillRect(x+4,y+15,24,1);}
      if(style==='bone'&&h%5===0){g.fillStyle='rgba(240,235,220,.35)';g.beginPath();g.arc(x+16,y+14,5,0,TAU);g.fill();g.fillStyle='rgba(0,0,0,.45)';g.fillRect(x+13,y+13,2,2);g.fillRect(x+17,y+13,2,2);}
      if(style==='flesh'&&h%4===0){g.strokeStyle='rgba(120,0,20,.6)';g.lineWidth=1.5;g.beginPath();g.moveTo(x,y+(h%30));g.quadraticCurveTo(x+16,y+(h>>>5)%32,x+32,y+(h>>>9)%32);g.stroke();}
      break;}
    case 'obs':{
      g.fillStyle='#16101f';g.fillRect(x,y,TILE,TILE);
      g.fillStyle='#1d1530';g.fillRect(x+1,y+1,14,14);g.fillRect(x+17,y+17,14,14);
      g.fillStyle='#120d1a';g.fillRect(x+17,y+1,14,14);g.fillRect(x+1,y+17,14,14);
      if(h%5===0){g.fillStyle='rgba(176,128,255,'+(0.25+0.2*Math.sin(G.time*2+h%7))+')';g.fillRect(x+15,y+6,2,20);}
      break;}
    case 'dirt':{
      g.fillStyle='#2c1d10';g.fillRect(x,y,TILE,TILE);
      g.fillStyle='#24170c';g.beginPath();g.arc(x+8+(h%14),y+10+((h>>>4)%12),5,0,TAU);g.fill();
      g.fillStyle='#3a2816';g.fillRect(x+4+((h>>>6)%20),y+20,3,2);g.fillRect(x+16+((h>>>9)%10),y+6,2,2);
      break;}
    case 'moss':{
      g.fillStyle='rgba(28,40,24,.75)';g.fillRect(x,y,TILE,TILE);
      g.fillStyle='rgba(70,110,50,.35)';g.beginPath();g.arc(x+10+(h%12),y+12+((h>>>3)%10),6,0,TAU);g.fill();
      break;}
  }
  if(ceil){g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x,y,TILE,5);g.fillStyle='rgba(0,0,0,.18)';g.fillRect(x,y+5,TILE,4);}
}
/* глубина интерьера: нижняя панель у кирпичных стен, тень у пола и у боковых стен */
function structWallDepth(g,style,x,y,floor,left,right){
  if(floor){
    if(style==='brick'||style==='brickc'||style==='obs'||style==='hellbrick'||style==='basalt'||style==='bone'||style==='metal'){
      const pc=style==='brickc'?'#1c1734':style==='obs'?'#110c18':style==='hellbrick'?'#1e0a08':style==='basalt'?'#141012':style==='bone'?'#38352e':style==='metal'?'#24201a':'#1e2026';
      g.fillStyle=pc;g.fillRect(x,y+TILE-11,TILE,11);
      g.fillStyle='rgba(255,255,255,.07)';g.fillRect(x,y+TILE-12,TILE,1);
      g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x,y+TILE-11,TILE,1);
      g.fillStyle='rgba(0,0,0,.18)';g.fillRect(x+((x/TILE)%2?15:31),y+TILE-10,1,10);
    }else{const gr=g.createLinearGradient(0,y+TILE-12,0,y+TILE);gr.addColorStop(0,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(0,0,0,.32)');g.fillStyle=gr;g.fillRect(x,y+TILE-12,TILE,12);}
  }
  if(left){const gr=g.createLinearGradient(x,0,x+10,0);gr.addColorStop(0,'rgba(0,0,0,.35)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x,y,10,TILE);}
  if(right){const gr=g.createLinearGradient(x+TILE,0,x+TILE-10,0);gr.addColorStop(0,'rgba(0,0,0,.35)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(x+TILE-10,y,10,TILE);}
}
function drawStructWalls(g,tx0,tx1,ty0,ty1){
  const lst=structList(tx0,tx1,ty0,ty1);
  for(const q of lst){
    const style=q.st.wall;
    if(!style||style==='none')continue;
    for(let r=0;r<q.th;r++){
      const wy=q.py+r;if(wy<ty0||wy>ty1)continue;
      const row=q.st.tpl[r];
      for(let c=0;c<q.tw;c++){
        const wx=q.px+c;if(wx<tx0||wx>tx1)continue;
        if(STRUCT_SOLID.indexOf(row[c])>=0||row[c]==='l')continue;
        const t=getTile(wx,wy);
        if(t!==T_AIR&&!isLiq(t)&&t!==T_LADDER)continue;
        const ceil=isSolid(wx,wy-1),floor=isSolid(wx,wy+1);
        drawStructWall(g,style,wx*TILE,wy*TILE,wx,wy,ceil);
        structWallDepth(g,style,wx*TILE,wy*TILE,floor,isSolid(wx-1,wy),isSolid(wx+1,wy));
        /* колонны и арки на задней стене — глубина интерьера */
        if(q.tw>=9&&(c-3)%6===0&&c>1&&c<q.tw-2)drawStructColumn(g,style,wx*TILE,wy*TILE,isSolid(wx,wy-1),isSolid(wx,wy+1));
      }
    }
  }
}
function drawStructColumn(g,style,x,y,top,bot){
  const hell=G.dim===1;
  const col=style==='plank'?'#4a3018':style==='basalt'?'#2e2426':style==='metal'?'#34383e':style==='char'?'#2a1a14':style==='brickc'?'#2e2650':style==='bone'?'#6a645a':style==='flesh'?'#3a1a20':hell?'#2e2428':'#3a3c46';
  const cx=x+16,w=8;
  /* тень колонны на стене */
  g.fillStyle='rgba(0,0,0,.2)';g.fillRect(cx+w,y,5,TILE);
  /* ствол: скруглённый объём и каннелюры */
  const gr=g.createLinearGradient(cx-w,0,cx+w,0);gr.addColorStop(0,shadeHex(col,-0.4));gr.addColorStop(0.3,shadeHex(col,0.28));gr.addColorStop(0.55,col);gr.addColorStop(1,shadeHex(col,-0.5));
  g.fillStyle=gr;g.fillRect(cx-w,y,w*2,TILE);
  if(style==='plank'){g.fillStyle='rgba(0,0,0,.25)';g.fillRect(cx-2,y,1,TILE);g.fillStyle='rgba(255,220,170,.08)';g.fillRect(cx-w+2,y,1,TILE);}
  else{g.fillStyle='rgba(0,0,0,.2)';for(let k=-1;k<=1;k++)g.fillRect(cx+k*4.6-0.5,y,1,TILE);g.fillStyle='rgba(255,255,255,.07)';for(let k=-1;k<=1;k++)g.fillRect(cx+k*4.6+0.5,y,1,TILE);}
  if(top){
    /* капитель: плита + валик */
    g.fillStyle=shadeHex(col,0.2);g.fillRect(cx-w-5,y,w*2+10,4);
    g.fillStyle=shadeHex(col,-0.15);g.fillRect(cx-w-3,y+4,w*2+6,3);
    g.fillStyle='rgba(255,255,255,.12)';g.fillRect(cx-w-5,y,w*2+10,1);
    g.fillStyle='rgba(0,0,0,.3)';g.fillRect(cx-w-3,y+7,w*2+6,1);
    /* изогнутые кронштейны-упоры под потолком в обе стороны (у дерева -- косые подкосы) */
    const R=13,fc=shadeHex(col,-0.08);
    for(const sd of [-1,1]){const x0=cx+sd*(w+3);
      g.fillStyle=fc;g.beginPath();
      if(style==='plank'){g.moveTo(x0,y+R+4);g.lineTo(x0,y+R);g.lineTo(x0+sd*R,y);g.lineTo(x0+sd*(R+4),y);g.closePath();}
      else{g.moveTo(x0,y+R+2);g.quadraticCurveTo(x0,y+2,x0+sd*R,y+1);g.lineTo(x0+sd*R,y);g.lineTo(x0,y);g.closePath();}
      g.fill();g.strokeStyle='rgba(0,0,0,.28)';g.lineWidth=1;g.beginPath();
      if(style==='plank'){g.moveTo(x0,y+R+4);g.lineTo(x0+sd*(R+4),y);}else{g.moveTo(x0,y+R+2);g.quadraticCurveTo(x0,y+2,x0+sd*R,y+1);}g.stroke();}
  }
  if(bot){
    /* база: ступенчатый цоколь */
    g.fillStyle=shadeHex(col,-0.2);g.fillRect(cx-w-2,y+TILE-10,w*2+4,3);
    g.fillStyle=shadeHex(col,0.12);g.fillRect(cx-w-5,y+TILE-7,w*2+10,7);
    g.fillStyle='rgba(255,255,255,.1)';g.fillRect(cx-w-5,y+TILE-7,w*2+10,1);
  }
}
const STRUCT_BANNER={dugout:'#8a3a2a',warren:'#6a4a2a',mushgrove:'#4a7a4a',forgeRuin:'#8a2a24',shaft:'#6a4a2a',crypt:'#4a2a5a',
  temple:'#5a3aa8',garden:'#2a8a7a',dwarfForge:'#a8401a',bridge:'#8a2a14',ribs:'#5a1a4a',voidAltar:'#5a1aa8',
  ashOutpost:'#7a2a14',bloodShrine:'#8a0a1a',sulfurWorks:'#8a7a14',ossuary:'#3a3a5a',fireTemple:'#c03a0a',
  minerCamp:'#2a5a8a',library:'#4a2aa8',spiderNest:'#5a3a8a',observatory:'#3a2a8a',gnomeHall:'#a8601a',ashTemple:'#8a2a10',cursedMine:'#5a2a10',meatworks:'#7a0a14',scorpNest:'#6a6a10',kingsCrypt:'#5a4a8a',demonForge:'#b0300a',
  turretKeep:'#5a1a10',turretKeepB:'#3a3a5a',flameHall:'#b03a0a',flameHallC:'#b03a0a',bloodHive:'#8a0a1a',crusherHall:'#6a1a1a',crusherHallB:'#4a4a5a',summonPit:'#7a1a8a',summonPitC:'#a01a0a',riftShrine:'#4a1aa8'};
