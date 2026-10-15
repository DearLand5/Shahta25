'use strict';
/* ============================================================
   КЭШ ОТРИСОВКИ УЧАСТКОВ (16x16 блоков)
   Статичные слои -- задние стены, текстуры пород, лестницы, руда и тени
   граней -- рисуются один раз в картинку участка в точном экранном
   разрешении и дальше просто копируются. При изменении блока
   перерисовывается только клетка с соседями. Анимация не кэшируется.
   ============================================================ */
const CC=new Map();
const CC_MAX=14;
function ccMarkDirty(tx,ty){
  if(CC.size===0)return;
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
    const x=tx+dx,y=ty+dy;if(y<0||x<0||x>=MW)continue;
    const e=CC.get((x>>4)+'_'+(y>>4));
    if(e){(e.dirty||(e.dirty=[])).push(x,y);}
  }
}
function drawStaticRange(g,tx0,tx1,ty0,ty1){
  drawCaveWalls(g,tx0,tx1,ty0,ty1);
  drawStructWalls(g,tx0,tx1,ty0,ty1);
  for(let ty=ty0;ty<=ty1;ty++){
    if(ty<0)continue;
    let runStart=null,runType=-1;
    for(let tx=tx0;tx<=tx1+1;tx++){
      let t=(tx>tx1)?-999:getTile(tx,ty);
      if(isLiq(t))t=T_AIR;
      if(t===T_LADDER){
        if(runStart!==null&&runType!==T_AIR&&runType!==-999&&runType!==-2)drawTileRun(g,runStart,ty,tx-runStart,runType);
        drawLadderTile(g,tx*TILE,ty*TILE,0);
        runStart=tx+1;runType=-2;continue;
      }
      if(t!==runType){
        if(runStart!==null&&runType!==T_AIR&&runType!==-999&&runType!==-2)drawTileRun(g,runStart,ty,tx-runStart,runType);
        runStart=tx;runType=t;
      }
    }
  }
  for(let ty=ty0;ty<=ty1;ty++){
    if(ty<0)continue;
    for(let tx=tx0;tx<=tx1;tx++){
      const t=getTile(tx,ty);
      if(t!==T_AIR&&t!==T_LADDER&&t!==T_LAVA&&!isLiq(t))drawDecorStatic(g,tx,ty,t);
      const o=getOre(tx,ty);if(o)drawOreShape(g,tx*TILE,ty*TILE,TILE,ORES[o],0);
    }
  }
  drawCaveShading(g,tx0,tx1,ty0,ty1);
}
function ccScale(){return Math.min(2.25,Math.max(0.5,view.scale*dpr));}
function ccGet(cx,cy){
  const k=cx+'_'+cy,sc=ccScale();
  let e=CC.get(k);
  const S=CHUNK*TILE;
  if(!e||e.sc!==sc){
    const cv=e&&e.cv&&e.sc===sc?e.cv:document.createElement('canvas');
    const px=Math.ceil(S*sc);
    if(cv.width!==px){cv.width=px;cv.height=px;}
    const g=cv.getContext('2d');
    g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,px,px);
    g.setTransform(sc,0,0,sc,-cx*S*sc,-cy*S*sc);
    g.imageSmoothingEnabled=false;
    drawStaticRange(g,cx*CHUNK,cx*CHUNK+CHUNK-1,cy*CHUNK,cy*CHUNK+CHUNK-1);
    e={cv,g,sc,dirty:null};
  }else if(e.dirty&&e.dirty.length){
    const d=e.dirty;e.dirty=null;
    let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
    for(let i=0;i<d.length;i+=2){const x=d[i],y=d[i+1];if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
    x0=Math.max(x0,cx*CHUNK);x1=Math.min(x1,cx*CHUNK+CHUNK-1);y0=Math.max(y0,cy*CHUNK);y1=Math.min(y1,cy*CHUNK+CHUNK-1);
    if(x0<=x1&&y0<=y1){
      const g=e.g;g.save();
      g.setTransform(sc,0,0,sc,-cx*S*sc,-cy*S*sc);
      g.beginPath();g.rect(x0*TILE,y0*TILE,(x1-x0+1)*TILE,(y1-y0+1)*TILE);g.clip();
      g.clearRect(x0*TILE,y0*TILE,(x1-x0+1)*TILE,(y1-y0+1)*TILE);
      g.imageSmoothingEnabled=false;
      drawStaticRange(g,x0,x1,y0,y1);
      g.restore();
    }
  }
  CC.delete(k);CC.set(k,e);
  while(CC.size>CC_MAX){const first=CC.keys().next().value;CC.delete(first);}
  return e;
}
function drawStaticCached(tx0,tx1,ty0,ty1,ox,oy){
  const S=CHUNK*TILE,sc=view.scale*dpr,csc=ccScale();
  const exact=Math.abs(csc-sc)<1e-6;
  ctx.save();
  ctx.setTransform(1,0,0,1,0,0);
  ctx.imageSmoothingEnabled=!exact;
  for(let cy=Math.max(0,ty0>>4);cy<=(ty1>>4);cy++){
    for(let cx=Math.max(0,tx0>>4);cx<=Math.min((MW-1)>>4,tx1>>4);cx++){
      const e=ccGet(cx,cy);
      const dx=Math.round(ox+cx*S*sc),dy=Math.round(oy+cy*S*sc);
      if(exact)ctx.drawImage(e.cv,dx,dy);
      else ctx.drawImage(e.cv,dx,dy,Math.round(S*sc),Math.round(S*sc));
    }
  }
  ctx.restore();
}
function drawTileRun(g,x0,y,count,type){
  if(type===T_BASALT&&G.dim===1&&y>=850&&y<1200)type=60;/* плиты склепа в Катакомбах */
  const cols=TILECOL[type];
  if(!cols){g.fillStyle='#333';g.fillRect(x0*TILE,y*TILE,count*TILE,TILE);return;}
  const w=count*TILE,px=x0*TILE,py=y*TILE;
  g.fillStyle=cols[0];g.fillRect(px,py,w,TILE);
  if(TEXABLE.has(type)&&settings.quality!=='low'){
    g.fillStyle=texPat(g,type);g.fillRect(px,py,w,TILE);
    return;
  }
  for(let i=0;i<count;i++){
    const v=(hash2(x0+i,y,7)%3)|0;
    if(v!==0){g.fillStyle=cols[v];g.fillRect((x0+i)*TILE,py,TILE,TILE);}
  }
  g.fillStyle='rgba(0,0,0,.18)';g.fillRect(px,py,w,2);
}

let _lightSpr=null;
function lightSprite(){
  if(_lightSpr)return _lightSpr;
  const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');
  const gr=g.createRadialGradient(64,64,0,64,64,64);
  gr.addColorStop(0,'rgba(0,0,0,1)');gr.addColorStop(0.45,'rgba(0,0,0,.92)');gr.addColorStop(0.75,'rgba(0,0,0,.45)');gr.addColorStop(1,'rgba(0,0,0,0)');
  g.fillStyle=gr;g.fillRect(0,0,128,128);
  return (_lightSpr=c);
}
function applyLighting(){
  const W=view.W,H=view.H,sc=view.scale;
  const depth=Math.max(0,player.y)/TILE;
  /* Чем глубже, тем темнее, а собственный свет игрока без факелов сужается:
     на дне без прокачанных факелов почти ничего не видно. */
  let dark=G.dim===1?clamp(0.2+depth/900,0.2,0.94):clamp(0.16+depth/650,0.16,0.975);
  /* глубокие биомы Ада темнее: Топи, Катакомбы, Ядро (в Ядре немного светлее из-за лавы) */
  const hbi=G.dim===1?biomeAt(depth):-1;
  if(hbi===7)dark=Math.max(dark,0.95);else if(hbi===8)dark=Math.max(dark,0.978);else if(hbi>=9)dark=Math.max(dark,0.968);
  if(G.dim===0&&depth>ARENA_Y0)dark=Math.min(dark,0.62);
  if(settings.quality==='low')dark=Math.max(0,dark-0.05);
  if(player.y<12*TILE)dark=Math.max(0.05,dark-0.12);
  if(cheats.megaLight)dark=Math.max(0,dark-0.7);
  const lw=lightCanvas.width,lh=lightCanvas.height;
  const kx=lw/W,ky=lh/H;
  lctx.setTransform(1,0,0,1,0,0);
  lctx.clearRect(0,0,lw,lh);
  lctx.fillStyle='rgba(0,0,0,'+dark.toFixed(3)+')';
  lctx.fillRect(0,0,lw,lh);

  const px=(player.x-G.cam.x)*sc+W/2;
  const py=(player.y-player.h*0.5-G.cam.y)*sc+H/2;
  const baseT=lerp(7.4,2.6,clamp(depth/900,0,1))*(hbi===8?0.62:hbi>=9?0.7:hbi===7?0.8:1);          /* радиус света без факела, в блоках */
  const hellT=G.dim===1?Math.max(0,player.torchLvl-5):0;    /* уровни Адского фонаря */
  let R=(baseT*TILE*sc)*(1+Math.min(5,player.torchLvl)*0.42+Math.max(0,player.torchLvl-5)*(G.dim===1?0.6:0.3))*(cheats.megaLight?4:1)*(player.lightBuff>0?1.5:1);
  if(player.blind>0)R*=0.45;                                 /* слепота от Глаза Бездны */
  const flick=1+Math.sin(G.time*9)*0.012+Math.sin(G.time*23)*0.008;
  R*=flick;

  lctx.globalCompositeOperation='destination-out';
  const spr=lightSprite();
  const hole=(x,y,r,a)=>{
    const rr=r*kx;if(rr<1)return;
    lctx.globalAlpha=a;
    lctx.drawImage(spr,x*kx-rr,y*ky-rr,rr*2,rr*2);
  };
  hole(px,py,R,1);
  /* Адский фонарь вдобавок даёт мягкий широкий отсвет: окрестности видны силуэтами */
  if(hellT>0&&!cheats.megaLight)hole(px,py,R*(1.55+0.15*hellT),0.1+0.07*hellT);
  /* природные источники света: лава, светящаяся руда, кристаллы, светящиеся мобы */
  if(settings.quality!=='low'){
    const halfW=W/(2*sc),halfH=H/(2*sc);
    const tx0=Math.floor((G.cam.x-halfW)/TILE),tx1=Math.ceil((G.cam.x+halfW)/TILE);
    const ty0=Math.floor((G.cam.y-halfH)/TILE),ty1=Math.ceil((G.cam.y+halfH)/TILE);
    let n=0,oreHoles=0;
    for(let ty=ty0;ty<=ty1&&n<26;ty++){
      for(let tx=tx0;tx<=tx1&&n<26;tx++){
        const t=getTile(tx,ty);
        let rad=0,a=0;
        if(t===T_LAVA){rad=3.4;a=0.85;}
        else if(t===T_HOT){rad=2.6;a=0.7;}
        else if(t===T_VENT){rad=2.4;a=0.6;}
        else{
          const o=getOre(tx,ty);
          if(o&&ORES[o].rar>=2&&(relicOn('eye')?oreHoles<22:(oreHoles<10&&((tx+ty)&1)))){rad=(relicOn('eye')?1.3:1.05)+ORES[o].rar*0.12;a=relicOn('eye')?0.5:0.32;oreHoles++;}
        }
        if(rad>0){
          if(((tx*7+ty*13)&1)&&t===T_LAVA)continue;
          hole((tx*TILE+16-G.cam.x)*sc+W/2,(ty*TILE+16-G.cam.y)*sc+H/2,rad*TILE*sc,a);n++;
        }
      }
    }
    /* фонари душ в галереях Катакомб рассеивают тьму */
    if(G.dim===1&&ty1>=850&&ty0<1200){
      for(let ty=Math.max(ty0,850);ty<=Math.min(ty1,1199);ty++){const c=catBand(ty);if(c.row!==1)continue;
        for(let tx=Math.max(tx0,c.x0+11);tx<=Math.min(tx1,c.x1);tx++){if((tx-c.x0)%11!==0)continue;
          if(getTile(tx,ty)!==T_AIR||getTile(tx,ty-1)===T_AIR)continue;const lx=((tx%12)+12)%12;if(lx>=3&&lx<=8&&hash2(Math.floor(tx/12),c.band,G.seed+50053)%3===0)continue;
          hole((tx*TILE+16-G.cam.x)*sc+W/2,(ty*TILE+20-G.cam.y)*sc+H/2,3.2*TILE*sc,0.6);}}
    }
    {
      const sl=structList(tx0,tx1,ty0,ty1);
      for(const q of sl){
        for(let r=0;r<q.th;r++){
          const wy=q.py+r;if(wy<ty0||wy>ty1)continue;
          for(let c=0;c<q.tw;c++){
            const wx=q.px+c;if(wx<tx0||wx>tx1)continue;
            const ch=q.st.tpl[r][c];
            const rad=ch==='L'?3.8:ch==='F'?4.2:ch==='E'?3.6:ch==='V'?4.5:ch==='P'||ch==='M'?3.4:ch==='U'||ch==='J'?2.6:ch==='c'||ch==='m'||ch==='C'?2.2:0;
            if(rad)hole((wx*TILE+16-G.cam.x)*sc+W/2,(wy*TILE+16-G.cam.y)*sc+H/2,rad*TILE*sc,0.85);
          }
        }
      }
    }
    for(const m of mobs){
      if(m.def.light&&m.alive){hole((m.x-G.cam.x)*sc+W/2,(m.y-m.h*0.5-G.cam.y)*sc+H/2,m.def.light*TILE*sc,0.8);}
    }
  }
  lctx.globalAlpha=1;
  lctx.globalCompositeOperation='source-over';

  ctx.drawImage(lightCanvas,0,0,W,H);
}

function drawParticles(){
  const sc=view.scale,cam=G.cam,W=view.W,H=view.H;
  for(const p of parts){
    const sx=(p.x-cam.x)*sc+W/2;
    const sy=(p.y-cam.y)*sc+H/2;
    if(sx<-20||sx>W+20||sy<-20||sy>H+20)continue;
    const a=clamp(p.life/p.max,0,1),inf=partInfo(p.color);
    const s=Math.max(1.4,p.size*sc*(0.45+0.55*a));
    const sp=Math.hypot(p.vx,p.vy);
    if(inf.hot)ctx.globalCompositeOperation='lighter';
    ctx.globalAlpha=inf.hot?Math.min(1,a*1.2):Math.min(1,a*1.4);
    if(sp>240&&s<8){/* быстрые искры -- вытянутые штрихи */
      const k=Math.min(0.05,22/sp)*sc;ctx.strokeStyle=p.color;ctx.lineCap='round';ctx.lineWidth=Math.max(1,s*0.55);
      ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx-p.vx*k,sy-p.vy*k);ctx.stroke();}
    const ds=inf.hot?s*2.6:s*1.25;ctx.drawImage(inf.c,sx-ds/2,sy-ds/2,ds,ds);
    if(inf.hot)ctx.globalCompositeOperation='source-over';
  }
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
}
function drawFloats(){
  const sc=view.scale,cam=G.cam,W=view.W,H=view.H;
  ctx.textAlign='center';
  for(const f of floats){
    const sx=(f.x-cam.x)*sc+W/2;
    const sy=(f.y-cam.y)*sc+H/2;
    const a=clamp(f.life,0,1);
    ctx.globalAlpha=a;
    ctx.font='800 13px system-ui,sans-serif';
    const tw=ctx.measureText(f.text).width,fx=Math.max(tw/2+6,Math.min(W-tw/2-6,sx)),fy=Math.max(16,Math.min(H-8,sy));
    ctx.lineWidth=3;ctx.strokeStyle='rgba(0,0,0,.75)';
    ctx.strokeText(f.text,fx,fy);
    ctx.fillStyle=f.color;
    ctx.fillText(f.text,fx,fy);
  }
  ctx.globalAlpha=1;
}

/* ================== ЛОББИ: окружение и здания ================== */
function lobbyTree(g,x,y,sc,kind,t,dark){
  const sw=Math.sin(t*0.9+x*0.01)*1.5*sc;
  const k=dark?0.55:1;
  const col=(a)=>dark?shadeHex(a,-0.45):a;
  g.save();g.translate(x,y);g.scale(sc,sc);
  if(kind==='pine'){
    g.fillStyle=col('#4a2f1a');g.fillRect(-4,-22,8,24);
    const tiers=[['#1f4a2c',-20,34,30],['#265a34',-44,28,26],['#2e6a3c',-66,22,22]];
    for(const [c,ty,w,hh] of tiers){
      g.fillStyle=col(c);
      g.beginPath();g.moveTo(-w+sw*0.3,ty);g.lineTo(sw,ty-hh);g.lineTo(w+sw*0.3,ty);g.closePath();g.fill();
    }
    g.fillStyle='rgba(255,255,255,.08)';g.beginPath();g.moveTo(0+sw,-86);g.lineTo(-10+sw*0.5,-66);g.lineTo(0+sw*0.7,-66);g.closePath();g.fill();
  }else{
    g.fillStyle=col('#5a3a20');g.fillRect(-5,-34,10,36);
    g.fillStyle=col('#3a7a3a');
    for(const [bx,by,r] of [[-16,-48,20],[14,-52,22],[0,-70,24],[-6,-56,20]]){
      g.beginPath();g.arc(bx+sw,by,r,0,TAU);g.fill();
    }
    g.fillStyle='rgba(180,255,150,.14)';g.beginPath();g.arc(-6+sw,-74,14,0,TAU);g.fill();
  }
  g.restore();
}
function lobbyLamp(g,x,t,glowList){
  g.fillStyle='#2a2a30';g.fillRect(x-2,-58,4,58);
  g.fillRect(x-8,-60,16,3);
  const fl=0.85+0.15*Math.sin(t*9+x);
  g.fillStyle='#ffe3a0';g.fillRect(x-5,-70,10,12);
  g.fillStyle='#2a2a30';g.beginPath();g.moveTo(x-7,-70);g.lineTo(x,-76);g.lineTo(x+7,-70);g.closePath();g.fill();
  glowList.push([x,-64,70*fl,'#ffd98a']);
}
function drawLobbyScenery(g,cam,t,W,sc,glowList){
  const x0=cam.x-W/(2*sc)-120,x1=cam.x+W/(2*sc)+120;
  /* дальний ряд деревьев */
  for(let x=Math.floor(x0/90)*90;x<x1;x+=90){
    const h=hash2(x/90|0,1,311);
    if(h%3===0)continue;
    lobbyTree(g,x+(h%40),-3,0.55+(h%5)*0.05,(h>>>4)%2?'pine':'oak',t,true);
  }
  /* основная линия: деревья, кусты, цветы, заборы, фонари, ящики, камни */
  for(let x=Math.floor(x0/64)*64;x<x1;x+=64){
    const i=x/64|0,h=hash2(i,5,123);
    let nearB=false;
    for(const b of buildings)if(Math.abs(x-b.x)<125)nearB=true;
    const px=x+(h%30);
    const typ=h%12;
    if(!nearB){
      if(typ===0)lobbyTree(g,px,2,0.9+(h%4)*0.12,'pine',t,false);
      else if(typ===1)lobbyTree(g,px,2,0.85+(h%4)*0.1,'oak',t,false);
      else if(typ===2||typ===3){
        g.fillStyle='#2f6a34';g.beginPath();g.ellipse(px,-6,14,10,0,Math.PI,0);g.fill();
        g.fillStyle='#3d8244';g.beginPath();g.ellipse(px+8,-5,10,8,0,Math.PI,0);g.fill();
        g.fillStyle='#e0344a';for(let k=0;k<4;k++){g.beginPath();g.arc(px-8+k*6,-9+(k%2)*3,1.6,0,TAU);g.fill();}
      }else if(typ===6){
        g.fillStyle='#6a4a2a';
        for(let k=0;k<3;k++)g.fillRect(px+k*22,-22,4,24);
        g.fillRect(px,-18,48,3);g.fillRect(px,-9,48,3);
        g.fillStyle='rgba(255,220,170,.15)';g.fillRect(px,-18,48,1);
      }else if(typ===7)lobbyLamp(g,px,t,glowList);
      else if(typ===8){
        g.fillStyle='#7a5632';g.fillRect(px,-18,20,18);g.fillStyle='#8a6a3a';g.fillRect(px,-18,20,4);
        g.strokeStyle='#5a3f22';g.lineWidth=1;g.strokeRect(px+0.5,-17.5,19,17);g.beginPath();g.moveTo(px,-18);g.lineTo(px+20,0);g.stroke();
        g.fillStyle='#6a4018';g.beginPath();g.ellipse(px+30,-8,8,9,0,0,TAU);g.fill();
        g.strokeStyle='#caa24a';g.lineWidth=1.4;g.beginPath();g.ellipse(px+30,-8,8,3,0,0,TAU);g.stroke();
      }else if(typ===9){
        g.fillStyle='#6a6f78';g.beginPath();g.ellipse(px,-5,11,8,0,Math.PI,0);g.fill();
        g.fillStyle='#868b95';g.beginPath();g.ellipse(px+10,-4,7,5,0,Math.PI,0);g.fill();
      }
    }
    /* цветы и трава -- везде */
    if(typ===4||typ===5||typ===10||typ===11){
      const fc=['#ff7aa8','#ffd94d','#9be8ff','#ffffff'];
      for(let k=0;k<3;k++){
        const fx=px+k*9,sw=Math.sin(t*2+fx*0.2)*1.4;
        g.strokeStyle='#3d7a3a';g.lineWidth=1.2;g.beginPath();g.moveTo(fx,0);g.lineTo(fx+sw,-9);g.stroke();
        g.fillStyle=fc[(h+k)%4];g.beginPath();g.arc(fx+sw,-10,2.4,0,TAU);g.fill();
      }
    }
  }
  /* колышущаяся трава */
  g.strokeStyle='#4a7a30';g.lineWidth=1.4;
  for(let x=Math.floor(x0/12)*12;x<x1;x+=12){
    const sw=Math.sin(t*1.8+x*0.07)*2;
    g.beginPath();g.moveTo(x,-1);g.lineTo(x+sw,-9-((x*7)%5));g.stroke();
    g.beginPath();g.moveTo(x+4,-1);g.lineTo(x+4+sw*0.8,-7-((x*3)%4));g.stroke();
  }
}
function renderLobby(){
  if(G.dim===1){renderHellLobby();return;}
  const W=view.W,H=view.H,sc=view.scale;
  const t=performance.now()/1000;
  const cam=G.cam;
  const sky=ctx.createLinearGradient(0,0,0,H*0.66);
  sky.addColorStop(0,'#0a1230');sky.addColorStop(0.45,'#243b66');sky.addColorStop(0.8,'#a8607a');sky.addColorStop(1,'#e69a6a');
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  /* звёзды */
  for(let i=0;i<70;i++){
    const hx=hash2(i,2,901),hy=hash2(i,3,902);
    const x=((hx%1000)/1000)*W,y=((hy%1000)/1000)*H*0.5;
    ctx.globalAlpha=(0.25+0.6*Math.abs(Math.sin(t*(0.5+(i%5)*0.3)+i)))*(1-y/(H*0.55));
    ctx.fillStyle='#fff';ctx.fillRect(x,y,(i%7===0)?2:1.4,(i%7===0)?2:1.4);
  }
  ctx.globalAlpha=1;
  /* луна */
  {
    const mx=W*0.78,my=H*0.17;
    const mg=ctx.createRadialGradient(mx,my,10,mx,my,110);mg.addColorStop(0,'rgba(255,240,210,.35)');mg.addColorStop(1,'rgba(255,240,210,0)');
    ctx.fillStyle=mg;ctx.beginPath();ctx.arc(mx,my,110,0,TAU);ctx.fill();
    ctx.fillStyle='#f4ecd6';ctx.beginPath();ctx.arc(mx,my,34,0,TAU);ctx.fill();
    ctx.fillStyle='rgba(180,170,150,.35)';
    ctx.beginPath();ctx.arc(mx-9,my-6,7,0,TAU);ctx.arc(mx+10,my+8,5,0,TAU);ctx.arc(mx+4,my-14,4,0,TAU);ctx.fill();
  }
  /* облака */
  for(let i=0;i<6;i++){
    const cx=((i*330+t*(6+i*2)-cam.x*0.05)%(W+500)+W+500)%(W+500)-250,cy=H*(0.12+(i%3)*0.1);
    ctx.fillStyle='rgba(215,170,190,'+(0.16+(i%3)*0.05)+')';
    for(const [ox,oy,rx,ry] of [[0,0,80,20],[-46,6,50,16],[50,5,56,15],[10,-10,46,16]]){ctx.beginPath();ctx.ellipse(cx+ox,cy+oy,rx,ry,0,0,TAU);ctx.fill();}
  }
  /* птицы */
  for(let i=0;i<3;i++){
    const bx=((t*(26+i*9)+i*400)%(W+300))-150,by=H*(0.24+i*0.05)+Math.sin(t*2+i)*8;
    const fl=Math.sin(t*10+i)*5;
    ctx.strokeStyle='rgba(20,18,30,.75)';ctx.lineWidth=1.6;ctx.beginPath();
    ctx.moveTo(bx-9,by-fl);ctx.quadraticCurveTo(bx-4,by-4,bx,by);ctx.quadraticCurveTo(bx+4,by-4,bx+9,by-fl);ctx.stroke();
  }
  /* горы (три слоя, дальний со снежными шапками) и силуэты леса */
  for(let layer=0;layer<3;layer++){
    const k=0.06+layer*0.11;
    const off=-(cam.x*k)%640;
    const cols=['#2a2f55','#232948','#1c2140'];
    ctx.fillStyle=cols[layer];
    for(let i=-1;i<4;i++){
      const bx=off+i*640,base=H*0.64+layer*12;
      const pk=[[0,0],[80,-90-layer*16],[170,-28],[270,-120-layer*20],[380,-44],[470,-100],[560,-30],[640,0]];
      ctx.beginPath();ctx.moveTo(bx,base);
      for(const [px,py] of pk)ctx.lineTo(bx+px,base+py);
      ctx.lineTo(bx+640,H);ctx.lineTo(bx,H);ctx.closePath();ctx.fill();
      if(layer===0){
        ctx.fillStyle='rgba(235,240,255,.55)';
        for(const [px,py] of [[80,-90],[270,-120],[470,-100]]){
          ctx.beginPath();ctx.moveTo(bx+px,base+py);ctx.lineTo(bx+px-16,base+py+20);ctx.lineTo(bx+px-6,base+py+16);ctx.lineTo(bx+px+4,base+py+24);ctx.lineTo(bx+px+16,base+py+18);ctx.closePath();ctx.fill();
        }
        ctx.fillStyle=cols[layer];
      }
    }
    if(layer>=1){
      ctx.fillStyle=layer===1?'#1a2540':'#141c34';
      for(let x=((off%46)-46);x<W+46;x+=46){
        const hh=26+((x*13+layer*7)%18),by=H*0.64+layer*12+6;
        ctx.beginPath();ctx.moveTo(x,by);ctx.lineTo(x+8,by-hh);ctx.lineTo(x+16,by);ctx.closePath();ctx.fill();
      }
    }
  }
  ctx.setTransform(dpr*sc,0,0,dpr*sc, dpr*(W/2-cam.x*sc), dpr*(H*0.62-cam.y*sc));
  /* земля */
  const gnd=ctx.createLinearGradient(0,0,0,420);
  gnd.addColorStop(0,'#4a7a36');gnd.addColorStop(0.06,'#6a4c30');gnd.addColorStop(0.35,'#4a3322');gnd.addColorStop(1,'#1e140c');
  ctx.fillStyle=gnd;ctx.fillRect(-2000,0,6000,700);
  ctx.fillStyle='#5f9a40';ctx.fillRect(-2000,-5,6000,9);
  ctx.fillStyle='rgba(255,255,255,.07)';ctx.fillRect(-2000,-5,6000,2);
  /* дорожка из брусчатки */
  ctx.fillStyle='#7a6a58';ctx.fillRect(-2000,4,6000,9);
  ctx.fillStyle='rgba(0,0,0,.2)';
  for(let x=-2000;x<4000;x+=22){ctx.fillRect(x,4,1,9);}
  ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(-2000,4,6000,1);
  /* подземные слои: камни и корни */
  for(let i=0;i<150;i++){
    const gx=-1900+i*40+((i*53)%23),gy=24+((i*37)%190);
    ctx.fillStyle=['#5a4630','#3a2a1c','#6a6a72','#4a3a2a'][i%4];
    ctx.beginPath();ctx.ellipse(gx,gy,3+(i%4),2+(i%3),0,0,TAU);ctx.fill();
  }
  const glowList=[];
  drawLobbyScenery(ctx,cam,t,W,sc,glowList);
  for(const b of buildings)drawBuilding(ctx,b,glowList);
  drawLobbyCrates(ctx);drawLobbyBot(ctx);
  if(G.scene==='lobby')drawLobbyPlaceGhost(ctx);
  if(!G.cutHide)drawPlayerSprite(ctx,lobbyPlayer.x,lobbyPlayer.y,lobbyPlayer.animState,lobbyPlayer.anim,lobbyPlayer.facing,{tool:null,armor:player.armorLvl,pickLvl:player.pickLvl,torch:player.torchLvl,groundY:0});
  drawCrateLabels(ctx);
  /* свечение фонарей и окон */
  drawGlowList(ctx,glowList,0.45);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  /* светлячки и дым труб */
  if(settings.quality!=='low'&&parts.length<partBudget*0.8){
    if(Math.random()<0.08){
      const fx=cam.x+rnd(-W/(2*sc),W/(2*sc)),fy=rnd(-60,-10);
      spawnPart(fx,fy,rnd(-10,10),rnd(-12,4),rnd(2.5,4),'#ffe9a0',1.8,0);
    }
  }
  drawParticles();drawFloats();
}
