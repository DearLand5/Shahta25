'use strict';
/* ============================================================
   ЛИЛОВЫЕ НЕБЕСА — ПЕЛЕНА И РАССУДОК
   В шахте Лиловых небес Рассудок (player.sanity, 0–100) медленно тает.
   Пока он высок — видна Иллюзия: цветы, мёд, игрушки. Чем ниже — тем
   сильнее мир «сползает» в Истину (veilT 0–1): глаза на стеблях,
   зубы вместо кристаллов, кровь вместо мёда, жилы на стенах.
   Держат Рассудок: свет (фонарь, светящиеся блоки), фонари-якоря,
   Настой ясности (Перегонный куб), верх шахты. На нуле — Кошмар: урон.
   Руда Истины: часть руды — иллюзия (рассыпается при добыче, в Истине
   видно, что она ненастоящая), а истинная руда видна только в Истине.
   Рассудок не сохраняется: в деревне он сразу восстанавливается.
   ============================================================ */
const SAN_RATE=[0.22,0.3,0.38,0.46,0.55,0.64,0.75];      /* потеря Рассудка в секунду по биомам */
const SAN_TRUE=[40,44,47,51,54,57,60];                   /* какую руду даёт истинная жила биома */
let veilT=0;                                             /* сглаженная доля Истины для рисования */
const VEIL={msg50:false,msg20:false,hurtT:0,whT:4,last:100};
function veilTarget(){if(G.dim!==2||G.scene!=='mine')return 0;if(LAB.eyeT>0)return 1;const s=player.sanity==null?100:player.sanity;return clamp((62-s)/50,0,1);}
function sanityRate(){
  const d=Math.max(0,player.y)/TILE,b=clamp(biomeAt(d)-10,0,6);
  if(d<12)return 6;
  if(cheats.god)return 10;
  if(LAB.eyeT>0)return 0;
  const tx=Math.floor(player.x/TILE),ty=Math.floor((player.y-20)/TILE);
  /* фонари-якоря: рядом с ними Рассудок восстанавливается */
  for(const a of anchorList()){if(Math.abs(a.x-tx)<=5&&Math.abs(a.y-1-ty)<=4)return 5;}
  if(lbLanNear(tx,ty,5,4))return 5+bkLv();
  let rate=-SAN_RATE[b];
  /* свет: светящиеся блоки рядом и фонарь шахтёра */
  let glow=0;for(let yy=-3;yy<=3;yy++)for(let xx=-3;xx<=3;xx++){const t=getTile(tx+xx,ty+yy);if(t===T_LQUARTZ||t===T_LCOMB)glow++;}
  rate*=1-Math.min(0.5,glow*0.08);
  rate*=1-Math.min(5,player.torchLvl||0)*0.04-Math.max(0,(player.torchLvl||0)-5)*0.03;
  if(player.teaT>0)rate=0.4;
  return lbSanRate(rate,tx,ty);
}
function updateVeil(dt){
  if(G.dim!==2||G.scene!=='mine'){player.sanity=100;player.teaT=0;veilT=Math.max(0,veilT-dt*2);VEIL.msg50=VEIL.msg20=false;if(typeof Music!=='undefined')Music.sour=0;return;}
  if(player.sanity==null)player.sanity=100;
  if(player.teaT>0)player.teaT-=dt;
  const s0=player.sanity;
  player.sanity=clamp(s0+sanityRate()*dt,0,100);
  const s=player.sanity;
  if(s<50&&!VEIL.msg50){VEIL.msg50=true;UI.toast('👁 Пелена истончается — мир показывает правду');}
  if(s>65)VEIL.msg50=false;
  if(s<20&&!VEIL.msg20){VEIL.msg20=true;UI.toast('Рассудок на исходе: ищи свет, якорь или выпей настой');}
  if(s>35)VEIL.msg20=false;
  /* Кошмар: Рассудок кончился */
  if(s<=0&&!(player.hp<=0)){VEIL.hurtT-=dt;if(VEIL.hurtT<=0){VEIL.hurtT=0.8;hurtPlayer(Math.max(5,player.maxHp*0.03),'кошмар');floatText(player.x,player.y-70,'Кошмар!','#ff6a9a');}}
  /* шёпот, когда Рассудок низкий */
  if(s<40){VEIL.whT-=dt;if(VEIL.whT<=0){VEIL.whT=rnd(4,9)*(0.5+s/80);if(SFX.whisper)SFX.whisper(1-s/40);}}
  veilT+=(veilTarget()-veilT)*Math.min(1,dt*0.8);
  if(typeof Music!=='undefined')Music.sour=veilT*38;
}
/* ---------- руда Истины ---------- */
function lilIllusory(tx,ty){return hash2(tx,ty,G.seed+91001)%100<22;}
function lilTrueOre(tx,ty,t){
  if(G.dim!==2||ty<12)return 0;
  const b=clamp(biomeAt(ty)-10,0,6);if(t!==LIL_ROCK[b])return 0;
  if(vnoise(tx/3.2,ty/3.2,G.seed+91003)<0.875)return 0;
  if(getOre(tx,ty))return 0;
  return SAN_TRUE[b];
}
/* вызывается из копания: true — руда не выдаётся (иллюзия) */
function lilOreDug(tx,ty,oreId,mx,my){
  if(G.dim!==2||!oreId||!ORES[oreId]||ORES[oreId].dim!==2||!lilIllusory(tx,ty))return false;
  floatText(mx,my-14,'Иллюзия рассыпалась','#d8b0ff');lstHint('illusion');burst(mx,my,14,'#c8a0ff',120,2.6);SFX.uiBack();
  return true;
}
/* копание пустой породы: в Истине там может быть истинная руда */
function lilRockDug(tx,ty,t,mx,my){
  if(G.dim!==2||veilT<0.5)return;
  const o=lilTrueOre(tx,ty,t);if(!o)return;
  addOre(o,1);SFX.ore();burst(mx,my,14,ORES[o].glow,170,3.2);floatText(mx,my-14,'+1 '+ORES[o].name+' · истинная жила','#ff9ad8');
}
/* ---------- Настой ясности ---------- */
defMat('ltea','Настой ясности','🍵','#c8f0d8','brew',10);
if(!MAT_KINDS.some(k=>k[0]==='brew'))MAT_KINDS.push(['brew','🍵 Настои']);
SMELT.push({id:'sltea',out:'ltea',n:2,o:{37:2,38:1},c:150000,time:6,tab:'less',tier:10});
SMELT_BY.sltea=SMELT[SMELT.length-1];
function useLTea(){
  if(matN('ltea')<=0){UI.toast('Нет настоя ясности');return;}
  player.mats.ltea--;if(player.mats.ltea<=0)delete player.mats.ltea;
  player.sanity=Math.min(100,(player.sanity==null?100:player.sanity)+50);player.teaT=30;
  SFX.splash();burst(player.x,player.y-30,22,'#c8f0d8',150,3);floatText(player.x,player.y-64,'🍵 Ясность','#c8f0d8');
  validateSelection();
}

/* ---------- облик Истины ---------- */
/* декор пустот: Иллюзия тает, сквозь неё проступает Истина */
function lilacAirDecor(g,x,y,tx,ty,bi,h,up,dn,time,gl,solid){
  const T=veilT;
  if(T<0.98){if(T>0.02)g.globalAlpha=1-T*0.9;lilacAirDecorI(g,x,y,tx,ty,bi,h,up,dn,time,gl,solid);g.globalAlpha=1;}
  if(T>0.02){g.globalAlpha=Math.min(1,T*1.15);lilacAirDecorT(g,x,y,tx,ty,bi,h,up,dn,time,solid);g.globalAlpha=1;}
}
function lilEye(g,cx,cy,r,time,h){
  const bl=((time*0.3+(h%13)*0.07)%1)>0.95;
  g.fillStyle='#3a0a14';g.beginPath();g.ellipse(cx,cy,r*1.25,r,0,0,TAU);g.fill();
  if(bl){g.strokeStyle='#1a0006';g.lineWidth=1.4;g.beginPath();g.moveTo(cx-r,cy);g.lineTo(cx+r,cy);g.stroke();return;}
  g.fillStyle='#f4e4d0';g.beginPath();g.ellipse(cx,cy,r,r*0.78,0,0,TAU);g.fill();
  g.strokeStyle='rgba(180,20,40,.6)';g.lineWidth=0.6;g.beginPath();g.moveTo(cx-r,cy);g.lineTo(cx-r*0.4,cy-r*0.2);g.moveTo(cx+r,cy+r*0.1);g.lineTo(cx+r*0.5,cy);g.stroke();
  const ax=player.x-cx,ay=player.y-player.h*0.6-cy,al=Math.hypot(ax,ay)||1;
  g.fillStyle='#a01020';g.beginPath();g.arc(cx+ax/al*r*0.35,cy+ay/al*r*0.25,r*0.48,0,TAU);g.fill();
  g.fillStyle='#000';g.beginPath();g.arc(cx+ax/al*r*0.4,cy+ay/al*r*0.3,r*0.2,0,TAU);g.fill();
}
function lilacAirDecorT(g,x,y,tx,ty,bi,h,up,dn,time,solid){
  const b=bi-10,Y=y+TILE;
  if(dn){
    if(b===0&&h%5===1){/* цветы → глаза на стеблях */const cx=x+10+(h>>>9)%12,sw=Math.sin(time*1.6+tx)*1.8,len=10+(h>>>3)%7;
      g.strokeStyle='#3a2a2a';g.lineWidth=1.4;g.beginPath();g.moveTo(cx,Y);g.quadraticCurveTo(cx+sw*0.3,Y-len*0.5,cx+sw,Y-len);g.stroke();lilEye(g,cx+sw,Y-len-2,3.2,time,h);}
    else if(b===0&&h%3===0){g.strokeStyle='#2a1a1a';g.lineWidth=1.3;g.beginPath();for(let i=0;i<4;i++){const gx=x+4+i*7;g.moveTo(gx,Y);g.lineTo(gx+(i%2?2:-2),Y-7-(h>>>(i*2))%5);}g.stroke();}
    else if(b===1&&h%4===0){/* друзы → зубы в дёснах */const cx=x+8+(h>>>10)%16;g.fillStyle='#8a2a3a';g.beginPath();g.ellipse(cx,Y-1,10,3,0,Math.PI,0);g.fill();
      for(let k=0;k<4;k++){const l=4+((h>>>(k*3))%6),ox=cx-7+k*4.6;g.fillStyle='#e8dcc4';g.beginPath();g.moveTo(ox-1.8,Y-2);g.lineTo(ox+1.8,Y-2);g.lineTo(ox+0.4,Y-2-l);g.closePath();g.fill();g.fillStyle='rgba(120,90,60,.5)';g.fillRect(ox+0.6,Y-2-l*0.7,0.8,l*0.6);}}
    else if(b===2&&h%4===1){/* мёд → кровь */const cx=x+16;g.fillStyle='#5a0610';g.beginPath();g.ellipse(cx,Y-1,12,3,0,0,TAU);g.fill();g.fillStyle='#a01020';g.beginPath();g.ellipse(cx-1,Y-1.6,10,2,0,0,TAU);g.fill();g.fillStyle='rgba(255,200,200,.4)';g.fillRect(cx-5,Y-2.4,3,0.8);}
    else if(b===2&&h%7===3){/* личинки */for(let k=0;k<3;k++){const cx=x+8+k*7,wr=Math.sin(time*4+k+h)*1.5;g.fillStyle='#e8dcc0';g.beginPath();g.ellipse(cx,Y-2.4,3.6,2+wr*0.2,wr*0.2,0,TAU);g.fill();g.strokeStyle='rgba(120,90,60,.5)';g.lineWidth=0.5;for(let q=-1;q<=1;q++){g.beginPath();g.moveTo(cx+q*1.4,Y-4);g.lineTo(cx+q*1.4,Y-0.8);g.stroke();}}}
    else if(b===3&&h%9===0){/* голова куклы с трещиной */const cx=x+12+(h>>>9)%10;g.fillStyle='#e8d8d0';g.beginPath();g.arc(cx,Y-6,6,0,TAU);g.fill();g.fillStyle='#c8b0a8';g.beginPath();g.arc(cx+1.5,Y-5,6,0.2,1.8);g.fill();
      g.fillStyle='#1a0a10';g.beginPath();g.arc(cx-2.2,Y-7,1.4,0,TAU);g.fill();g.fillStyle='#000';g.beginPath();g.ellipse(cx+2.4,Y-7,1.6,1.8,0,0,TAU);g.fill();
      g.strokeStyle='#5a3a3a';g.lineWidth=0.7;g.beginPath();g.moveTo(cx-1,Y-12);g.lineTo(cx+1,Y-8);g.lineTo(cx-0.5,Y-5);g.stroke();g.strokeStyle='#8a1a2a';g.beginPath();g.moveTo(cx-2,Y-3);g.lineTo(cx+2,Y-3);g.stroke();}
    else if(b===4&&h%4===0){/* роза → рот с зубами */const cx=x+10+(h>>>9)%12,l=10+(h>>>4)%8,sw=Math.sin(time*1.1+tx)*1.2,rx=cx+sw,ry=Y-l,op=0.5+0.5*Math.sin(time*2+h);
      g.strokeStyle='#1a2a14';g.lineWidth=1.6;g.beginPath();g.moveTo(cx,Y);g.quadraticCurveTo(cx-3,Y-l*0.5,rx,ry);g.stroke();
      g.fillStyle='#5a0a1a';g.beginPath();g.ellipse(rx,ry,5,3+op*2,0,0,TAU);g.fill();g.fillStyle='#1a0006';g.beginPath();g.ellipse(rx,ry,3.6,1+op*1.6,0,0,TAU);g.fill();
      g.fillStyle='#f0e4d0';for(let k=0;k<4;k++){g.beginPath();g.moveTo(rx-3+k*2,ry-1-op*1.4);g.lineTo(rx-2+k*2,ry+0.6-op*0.4);g.lineTo(rx-1+k*2,ry-1-op*1.4);g.fill();}}
    else if(b===5&&h%3===0){/* камыши → бледные пальцы из земли */for(let k=0;k<4;k++){const gx=x+7+k*5+((h>>>k)%3),hh=8+((h>>>(k*3))%7),cr=Math.sin(time*0.9+k+h)*1.4;
      g.strokeStyle='#d8c8c0';g.lineWidth=2.4;g.lineCap='round';g.beginPath();g.moveTo(gx,Y);g.quadraticCurveTo(gx+cr,Y-hh*0.6,gx+cr*1.8,Y-hh);g.stroke();
      g.strokeStyle='#8a6a6a';g.lineWidth=0.6;g.beginPath();g.moveTo(gx-1,Y-hh*0.5);g.lineTo(gx+1,Y-hh*0.5);g.stroke();}}
    else if(b===6&&h%19===4){/* погремушка-черепок */const cx=x+14;g.fillStyle='#d8c8b0';g.fillRect(cx-0.8,Y-9,1.6,7);g.fillStyle='#e8dcc8';g.beginPath();g.arc(cx,Y-11,4,0,TAU);g.fill();g.fillStyle='#1a0a10';g.fillRect(cx-2.2,Y-12,1.6,1.6);g.fillRect(cx+0.6,Y-12,1.6,1.6);}
    else if(b===6&&h%3===0){/* следы маленьких ладошек */g.fillStyle='rgba(120,20,40,.55)';for(let k=0;k<2;k++){const cx=x+9+k*13;g.beginPath();g.ellipse(cx,Y-1.6,2.4,1.2,0,0,TAU);g.fill();for(let q=0;q<4;q++)g.fillRect(cx-2+q*1.4,Y-3.6,0.8,1.6);}}
  }
  if(up){
    if((b===0||b===5)&&h%6===0){/* свисающие волосы, с них капает тёмное */const cx=x+8+(h>>>9)%16;g.strokeStyle='#1a0a10';g.lineWidth=0.8;
      for(let k=0;k<6;k++){const sw=Math.sin(time*1.1+k+tx)*2;g.beginPath();g.moveTo(cx-3+k,y);g.quadraticCurveTo(cx-3+k+sw*0.5,y+8,cx-3+k+sw,y+14+k%3*3);g.stroke();}
      const ph=(time*0.5+(h%7)*0.3)%1.4;if(ph<1){g.fillStyle='#3a0610';g.beginPath();g.arc(cx,y+18+ph*ph*50,1.6,0,TAU);g.fill();}}
    else if(b===1&&h%5===0){/* сосульки → клыки */for(let k=0;k<2;k++){const cx=x+7+k*12+(h>>>(9+k))%6,l=7+((h>>>(4+k*3))%10);g.fillStyle='#e8dcc4';g.beginPath();g.moveTo(cx-3,y);g.lineTo(cx+3,y);g.lineTo(cx,y+l);g.closePath();g.fill();
      g.fillStyle='rgba(120,90,60,.5)';g.beginPath();g.moveTo(cx+1,y);g.lineTo(cx+3,y);g.lineTo(cx,y+l);g.closePath();g.fill();g.fillStyle='#8a1020';g.beginPath();g.arc(cx,y+l+1,1,0,TAU);g.fill();}}
    else if(b===2&&h%5===0){/* кровь капает с натёков */const cx=x+10+(h>>>9)%12,ph=(time*0.45+(h%7)*0.29)%1.6;g.fillStyle='#5a0a14';g.beginPath();g.moveTo(cx-4,y);g.quadraticCurveTo(cx,y+8,cx+4,y);g.fill();
      if(ph<1){g.fillStyle='#a01020';g.beginPath();g.ellipse(cx,y+8+Math.max(0,ph-0.4)*60,1.8,2.6,0,0,TAU);g.fill();}}
    else if(b===3&&h%7===0){/* нити марионетки и висящая ручка куклы */const cx=x+16,sw=Math.sin(time*0.8+tx)*3;g.strokeStyle='rgba(230,220,220,.6)';g.lineWidth=0.5;g.beginPath();g.moveTo(cx-4,y);g.lineTo(cx-4+sw,y+18);g.moveTo(cx+4,y);g.lineTo(cx+4+sw,y+16);g.stroke();
      g.fillStyle='#e8d0c8';g.save();g.translate(cx+sw,y+17);g.rotate(sw*0.1);g.fillRect(-1.6,0,3.2,9);g.beginPath();g.arc(0,10,2,0,TAU);g.fill();g.restore();}
    else if(b===4&&h%5===0){/* тернистая плеть, сочится */const ox=x+6+(h>>>9)%20,len=12+(h>>>4)%12,sw=Math.sin(time+tx)*2;g.strokeStyle='#1a1a10';g.lineWidth=2;g.beginPath();g.moveTo(ox,y);g.quadraticCurveTo(ox+3+sw,y+len*0.5,ox+sw*1.5,y+len);g.stroke();
      g.fillStyle='#8a1020';g.beginPath();g.arc(ox+sw*1.5,y+len+2,1.6,0,TAU);g.fill();}
    else if(b===6&&h%9===0){/* вместо подвески — пустая распашонка на нитке, качается */const cx=x+16,a=Math.sin(time*0.7+h)*0.3;g.strokeStyle='rgba(230,210,230,.6)';g.lineWidth=0.7;g.beginPath();g.moveTo(cx,y);g.lineTo(cx+Math.sin(a)*10,y+10);g.stroke();
      g.save();g.translate(cx+Math.sin(a)*10,y+10);g.rotate(a);g.fillStyle='#d8c8d0';g.beginPath();g.moveTo(-5,0);g.lineTo(5,0);g.lineTo(8,4);g.lineTo(5,5);g.lineTo(5,12);g.lineTo(-5,12);g.lineTo(-5,5);g.lineTo(-8,4);g.closePath();g.fill();
      g.fillStyle='rgba(120,20,40,.5)';g.beginPath();g.arc(1,8,2,0,TAU);g.fill();g.restore();}
    else if(b===6&&h%5===2){/* пуповина-жила */const ox=x+8+(h>>>9)%16,len=14+(h>>>4)%10;g.strokeStyle='#8a2a4a';g.lineWidth=2.4;g.beginPath();g.moveTo(ox,y);for(let k=1;k<=4;k++)g.lineTo(ox+Math.sin(time*1.3+k*1.1+h%5)*(1+k*0.6),y+len*k/4);g.stroke();}
  }
  /* стены: глаза */
  const sL=solid(tx-1,ty),sR=solid(tx+1,ty);
  if((sL||sR)&&!up&&!dn&&h%11===0){const wx=sL?x:x+TILE,dir=sL?1:-1;lilEye(g,wx+dir*6,y+16,4,time,h);}
}
/* жилы по кромкам породы в Истине (рисуется поверх кромки Иллюзии) */
function lilacEdgeT(g,x,y,h,time){
  const T=veilT;if(T<0.03)return;
  const p=0.5+0.5*Math.sin(time*1.4+(h%17));
  g.globalAlpha=T;g.fillStyle='#4a0816';g.fillRect(x,y,TILE,2.6);g.fillStyle='rgba(200,30,60,'+(0.35+0.3*p)+')';g.fillRect(x,y,TILE,1);
  if(h%3===0){g.strokeStyle='rgba(140,10,30,.8)';g.lineWidth=1.2;g.beginPath();g.moveTo(x+4+(h>>>5)%20,y+2);g.quadraticCurveTo(x+8+(h>>>5)%20,y+8,x+5+(h>>>5)%20,y+12);g.stroke();}
  g.globalAlpha=1;
}
/* по клеткам породы: иллюзорная руда тает, истинная проступает, в стенах — жилы и глаза */
function lilacDecorT(g,tx,ty,t,h){
  const T=veilT;if(T<0.03)return;
  const x=tx*TILE,y=ty*TILE,time=G.time;
  const o=getOre(tx,ty);
  if(o&&ORES[o]&&ORES[o].dim===2&&lilIllusory(tx,ty)){
    g.globalAlpha=T*0.9;g.drawImage(texFor(t,tx,ty),4,4,24,24,x+4,y+4,24,24);g.globalAlpha=T*0.6;
    const w=Math.sin(time*2.2+h)*1.5;g.strokeStyle='rgba(225,205,255,.55)';g.lineWidth=1;g.beginPath();g.ellipse(x+16,y+16,8+w,6-w*0.5,0.3,0,TAU);g.stroke();
    g.fillStyle='rgba(230,215,255,.35)';for(let k=0;k<3;k++){const a=time*1.3+k*2.1+h;g.beginPath();g.arc(x+16+Math.cos(a)*7,y+16+Math.sin(a)*5,1.2,0,TAU);g.fill();}
    g.globalAlpha=1;return;}
  if(!o){const tr=lilTrueOre(tx,ty,t);
    if(tr&&T>0.3){const a=Math.min(1,(T-0.3)/0.5),p=0.6+0.4*Math.sin(time*2.4+h);g.globalAlpha=a;drawLilacOre(g,x,y,TILE,ORES[tr]);
      g.globalCompositeOperation='lighter';g.fillStyle='rgba(255,90,170,'+(0.18*p)+')';g.fillRect(x,y,TILE,TILE);g.globalCompositeOperation='source-over';g.globalAlpha=1;return;}}
  if(h%9===0){const p=0.5+0.5*Math.sin(time*1.2+h%7);g.globalAlpha=T*(0.5+0.4*p);g.strokeStyle='#6a0a1e';g.lineWidth=1.6;
    g.beginPath();g.moveTo(x,y+(h%20)+4);g.quadraticCurveTo(x+12,y+((h>>5)%28),x+TILE,y+((h>>9)%24)+4);g.stroke();g.globalAlpha=1;}
  else if(h%53===7){g.globalAlpha=T;lilEye(g,x+16,y+16,5,time,h);g.globalAlpha=1;}
}
/* Истина на фоне: дышащие рёбра и далёкие глаза */
function drawLilacTruthBackdrop(g,W,H,cam,T,time){
  if(T<0.03)return;
  g.save();g.globalAlpha=T;
  const br=1+0.03*Math.sin(time*0.9),off=-((cam.x*0.08)%260)-260;
  g.strokeStyle='rgba(70,10,24,.55)';g.lineWidth=14;
  for(let x=off;x<W+260;x+=130){g.beginPath();g.moveTo(x,H);g.quadraticCurveTo(x+60*br,H*0.4,x+130,H*0.05);g.stroke();}
  for(let i=0;i<5;i++){const ex=((hash2(i,7,511)%1000)/1000*W*1.3-cam.x*0.05)%(W*1.3),ey=H*(0.15+((hash2(i,8,512)%1000)/1000)*0.5),op=Math.max(0,Math.sin(time*0.25+i*1.7));
    if(op<0.05)continue;g.fillStyle='rgba(60,0,16,.6)';g.beginPath();g.ellipse(ex,ey,22,14*op,0,0,TAU);g.fill();g.fillStyle='rgba(230,200,180,.35)';g.beginPath();g.ellipse(ex,ey,16,10*op,0,0,TAU);g.fill();
    g.fillStyle='rgba(160,10,30,.6)';g.beginPath();g.arc(ex,ey,6*op,0,TAU);g.fill();}
  g.restore();
}
/* экранный слой Истины поверх всего: багровый оттенок, тёмные края, жилы по краям экрана */
function drawLilacTruthGrade(W,H){
  const T=veilT;if(T<0.03)return;
  const g=ctx;g.save();g.setTransform(dpr,0,0,dpr,0,0);
  g.globalCompositeOperation='color';g.fillStyle='rgba(120,14,40,'+(0.5*T).toFixed(3)+')';g.fillRect(0,0,W,H);
  g.globalCompositeOperation='multiply';g.fillStyle='rgba(190,150,160,'+(0.45*T).toFixed(3)+')';g.fillRect(0,0,W,H);
  g.globalCompositeOperation='source-over';
  const p=0.5+0.5*Math.sin(G.time*(1.2+T));
  const vg=g.createRadialGradient(W/2,H/2,Math.min(W,H)*0.3,W/2,H/2,Math.max(W,H)*0.72);vg.addColorStop(0,'rgba(40,0,10,0)');vg.addColorStop(1,'rgba(40,0,10,'+(0.55*T*(0.8+0.2*p)).toFixed(3)+')');g.fillStyle=vg;g.fillRect(0,0,W,H);
  if(T>0.4){g.strokeStyle='rgba(120,8,28,'+((T-0.4)*0.9).toFixed(3)+')';g.lineWidth=2.4;
    for(let k=0;k<6;k++){const sx=k<3?0:W,sy=H*(0.15+(k%3)*0.32),dir=k<3?1:-1;g.beginPath();g.moveTo(sx,sy);
      for(let q=1;q<5;q++)g.lineTo(sx+dir*q*W*0.05*(0.8+0.4*p),sy+Math.sin(q*1.7+k)*20);g.stroke();}}
  g.restore();
}
