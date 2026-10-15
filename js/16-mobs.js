'use strict';
/* ============================================================
   MOBS
   ============================================================ */
let mobs=[];
const deadMobs=[];
/* ---------- индивидуальные анимации смерти ---------- */
const DEATH_STYLE={
  goblin:'fall',thief:'fall',demon:'fall',firedemon:'burn',
  rabbit:'legsup',mole:'legsup',hound:'legsup',toad:'legsup',beetle:'legsup',spider:'legsup',scorpion:'legsup',acidspider:'legsup',
  acidling:'legsup',turtle:'legsup',crab:'legsup',salamander:'legsup',fish:'legsup',
  slime:'splat',bloodslime:'splat',leech:'splat',meatling:'splat',worm:'splat',
  fleshgolem:'melt',bloodpriest:'melt',
  skeleton:'bones',skelminion:'bones',bonegolem:'bones',skullturret:'bones',
  guard:'crumble',ashgolem:'crumble',
  prism:'shatter',riftcrystal:'shatter',healer:'shatter',
  shade:'dissolve',shadeling:'dissolve',ashwraith:'dissolve',wraith:'dissolve',lostsoul:'dissolve',spirit:'dissolve',wisp:'dissolve',necro:'dissolve',
  bat:'tumble',vulture:'tumble',cinderbat:'tumble',glowbug:'tumble',skullbat:'tumble',
  imp:'burn',elemental:'burn',ashimp:'burn',infernal:'burn',magmael:'burn',hellsal:'burn',sulfurel:'burn',firebird:'burn',lavaworm:'burn',magmacrab:'burn',
  gasbag:'pop',bloodpod:'pop',
  eye:'implode',horror:'implode'
};
const DEATH_DUR={fall:1.25,legsup:1.25,splat:1.0,melt:1.35,bones:1.0,crumble:1.0,shatter:0.5,dissolve:1.05,tumble:1.6,burn:1.45,pop:0.4,implode:0.85};
function deathStyle(def){return DEATH_STYLE[def.id]||(def.ghost?'dissolve':def.fly?'tumble':(def.h>def.w*1.2?'fall':'legsup'));}
const debris=[],deathFx=[];
function addDebris(x,y,vx,vy,kind,col,sz,life){
  if(debris.length>180)debris.shift();
  debris.push({x,y,vx,vy,rot:Math.random()*TAU,vr:rnd(-14,14),kind,col,sz:sz||4,t:0,life:life||rnd(0.9,1.4),rest:false,
    sway:Math.random()*TAU,g:kind==='feather'||kind==='ash'?160:kind==='wisp'?-40:980});
}
function updateDebris(dt){
  for(let i=debris.length-1;i>=0;i--){const d=debris[i];d.t+=dt;if(d.t>=d.life){debris.splice(i,1);continue;}
    if(d.rest)continue;
    if(d.kind==='feather'||d.kind==='ash'){d.sway+=dt*5;d.vx=d.vx*0.97+Math.sin(d.sway)*30*dt;d.vy=Math.min(d.vy+d.g*dt,70);d.rot=Math.sin(d.sway)*0.9;}
    else{d.vy+=d.g*dt;d.rot+=d.vr*dt;}
    const nx=d.x+d.vx*dt,ny=d.y+d.vy*dt;
    if(d.g>0&&solidAtPx(nx,ny+d.sz*0.4)){
      if(d.vy>60&&d.kind!=='feather'&&d.kind!=='ash'){d.vy*=-0.32;d.vx*=0.55;d.vr*=0.5;}
      else{d.vy=0;d.vx*=0.4;if(Math.abs(d.vx)<8){d.rest=true;d.rot=Math.round(d.rot/Math.PI)*Math.PI+(d.kind==='bone'?d.rot%0.4:0);}}
      if(solidAtPx(nx,d.y))d.vx=-d.vx*0.3;
    }else{d.x=nx;d.y=ny;}
  }
  for(let i=deathFx.length-1;i>=0;i--){const f=deathFx[i];f.t+=dt;if(f.t>=f.life)deathFx.splice(i,1);}
}
function drawDebris(g){
  for(const d of debris){
    const a=Math.min(1,(d.life-d.t)/0.35);if(a<=0)continue;
    g.save();g.globalAlpha=a;g.translate(d.x,d.y);g.rotate(d.rot);const z=d.sz;
    switch(d.kind){
      case 'bone':g.fillStyle=d.col;g.strokeStyle='rgba(40,30,20,.55)';g.lineWidth=0.8;
        g.beginPath();g.rect(-z,-z*0.22,z*2,z*0.44);g.fill();g.stroke();
        for(const sx of [-z,z]){g.beginPath();g.arc(sx,-z*0.22,z*0.3,0,TAU);g.arc(sx,z*0.22,z*0.3,0,TAU);g.fill();}break;
      case 'skull':g.fillStyle=d.col;g.beginPath();g.arc(0,-z*0.15,z,0,TAU);g.fill();g.fillRect(-z*0.6,z*0.3,z*1.2,z*0.6);
        g.fillStyle='#1a1410';g.beginPath();g.arc(-z*0.38,-z*0.1,z*0.26,0,TAU);g.arc(z*0.38,-z*0.1,z*0.26,0,TAU);g.fill();break;
      case 'chunk':{g.fillStyle=d.col;g.beginPath();g.moveTo(-z,-z*0.5);g.lineTo(-z*0.2,-z);g.lineTo(z,-z*0.4);g.lineTo(z*0.7,z*0.8);g.lineTo(-z*0.8,z*0.6);g.closePath();g.fill();
        g.fillStyle='rgba(255,255,255,.16)';g.beginPath();g.moveTo(-z,-z*0.5);g.lineTo(-z*0.2,-z);g.lineTo(z,-z*0.4);g.lineTo(0,-z*0.2);g.closePath();g.fill();
        g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.moveTo(z,-z*0.4);g.lineTo(z*0.7,z*0.8);g.lineTo(-z*0.8,z*0.6);g.lineTo(0,z*0.1);g.closePath();g.fill();break;}
      case 'shard':{g.fillStyle=d.col;g.beginPath();g.moveTo(0,-z*1.4);g.lineTo(z*0.55,z*0.6);g.lineTo(-z*0.5,z*0.5);g.closePath();g.fill();
        g.fillStyle='rgba(255,255,255,'+(0.35+0.35*Math.sin(d.t*14+d.sway))+')';g.beginPath();g.moveTo(0,-z*1.4);g.lineTo(z*0.18,z*0.2);g.lineTo(-z*0.2,z*0.1);g.closePath();g.fill();break;}
      case 'feather':g.fillStyle=d.col;g.beginPath();g.ellipse(0,0,z*1.3,z*0.42,0,0,TAU);g.fill();
        g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=0.6;g.beginPath();g.moveTo(-z*1.4,0);g.lineTo(z*1.2,0);g.stroke();break;
      case 'ash':g.fillStyle=d.col;g.beginPath();g.ellipse(0,0,z*0.7,z*0.45,0,0,TAU);g.fill();break;
      case 'gib':g.fillStyle=d.col;g.beginPath();g.ellipse(0,0,z,z*0.75,0,0,TAU);g.fill();
        g.fillStyle='rgba(255,255,255,.22)';g.beginPath();g.ellipse(-z*0.3,-z*0.3,z*0.35,z*0.22,0,0,TAU);g.fill();break;
      default:g.fillStyle=d.col;g.fillRect(-z*0.5,-z*0.5,z,z);
    }
    g.restore();
  }
}
/* лужи, свечение углей, следы -- рисуются под/над телами */
function drawDeathFxUnder(g){
  for(const f of deathFx){if(f.kind!=='puddle')continue;
    const grow=Math.min(1,f.t/(f.grow||0.25)),a=Math.min(1,(f.life-f.t)/0.6)*0.85;
    const r=f.r*(0.3+0.7*(1-Math.pow(1-grow,3)));
    g.save();g.globalAlpha=a;g.fillStyle=f.col;g.beginPath();g.ellipse(f.x,f.y-1.5,r,Math.max(1.5,r*0.18),0,0,TAU);g.fill();
    g.fillStyle='rgba(255,255,255,.18)';g.beginPath();g.ellipse(f.x-r*0.25,f.y-2.4,r*0.35,Math.max(0.8,r*0.05),0,0,TAU);g.fill();g.restore();}
}
function drawDeathFxOver(g){
  for(const f of deathFx){if(f.kind!=='glow')continue;
    const a=Math.min(1,f.t/0.1)*Math.max(0,1-f.t/f.life);
    g.save();g.globalCompositeOperation='lighter';softGlow(g,f.x,f.y,f.r*(1+f.t*0.3),f.col,a*f.a);g.restore();}
}
function deathDust(m,n,col){
  for(let k=0;k<n;k++)spawnPart(m.x+rnd(-m.w*0.55,m.w*0.55),m.y-rnd(0,6),rnd(-40,40),rnd(-50,-15),rnd(0.45,0.8),col||(m.def.dim===1?'#4a3c38':'#8a7a6a'),rnd(2,3.4),-20);
}
function deathStart(m){
  const def=m.def,st=m.dstyle,cx=m.x,cy=m.y-m.h*0.5,c1=def.c1,c2=def.c2;
  if(st==='splat'||st==='melt'){
    const blood=def.id==='bloodslime'||def.id==='leech'||def.id==='meatling'||def.id==='fleshgolem'||def.id==='bloodpriest';
    const pc=blood?'#7a0a14':shadeHex(c1,-0.15);
    deathFx.push({kind:'puddle',x:m.x,y:m.y,r:m.w*(st==='melt'?0.85:0.75),col:pc,t:0,life:st==='melt'?3.2:2.6,grow:st==='melt'?0.9:0.22});
    const n=st==='splat'?14:6;
    for(let k=0;k<n;k++){const a=-Math.PI*rnd(0.1,0.9);addDebris(cx,m.y-m.h*0.3,Math.cos(a)*rnd(60,200),Math.sin(a)*rnd(120,300),'gib',k%3?c1:pc,rnd(1.6,3.2),rnd(0.5,0.9));}
  }
  if(st==='shatter'){
    for(let k=0;k<14;k++){const a=Math.random()*TAU,sp=rnd(90,260);addDebris(cx+Math.cos(a)*6,cy+Math.sin(a)*8,Math.cos(a)*sp,Math.sin(a)*sp-120,'shard',k%3===0?c2:k%3===1?c1:shadeHex(c1,0.35),rnd(2.6,4.6),rnd(0.8,1.3));}
    for(let k=0;k<10;k++){const a=Math.random()*TAU,sp=rnd(60,200);spawnPart(cx,cy,Math.cos(a)*sp,Math.sin(a)*sp,rnd(0.25,0.5),shadeHex(c1,0.45),rnd(1.5,2.5),0);}
    deathFx.push({kind:'glow',x:cx,y:cy,r:m.w*1.3,col:shadeHex(c1,0.3),a:0.7,t:0,life:0.35});
    shockRings.push({x:cx,y:cy,r:4,max:m.w*0.85,t:0,col:shadeHex(c1,0.1)});
  }
  if(st==='pop'){
    const gas=def.id==='gasbag';
    shockRings.push({x:cx,y:cy,r:4,max:m.w*1.1,t:0,col:gas?'#9ab840':'#b01828'});
    for(let k=0;k<16;k++){const a=Math.random()*TAU,sp=rnd(40,160);spawnPart(cx,cy,Math.cos(a)*sp,Math.sin(a)*sp,rnd(0.5,1.0),gas?(k%2?'#9ab840':'#6a8030'):(k%2?'#b01020':'#600810'),rnd(2.5,4.5),gas?-30:300);}
    for(let k=0;k<6;k++){const a=Math.random()*TAU;addDebris(cx,cy,Math.cos(a)*rnd(80,200),Math.sin(a)*rnd(80,200)-80,'gib',shadeHex(c1,-0.2),rnd(2,3.4),rnd(0.6,1));}
  }
  if(st==='tumble'&&(def.id==='vulture'||def.id==='bat')){for(let k=0;k<5;k++)addDebris(cx+rnd(-8,8),cy+rnd(-4,4),rnd(-60,60),rnd(-90,-20),'feather',k%2?c1:c2,rnd(2.5,3.5),rnd(1.2,1.8));}
  if(st==='implode')deathFx.push({kind:'glow',x:cx,y:cy,r:m.w*1.2,col:'#7a3aff',a:0.5,t:0,life:DEATH_DUR.implode});
  if(st==='burn')deathFx.push({kind:'glow',x:cx,y:m.y-m.h*0.3,r:m.w*1.1,col:'#ff6a1a',a:0.55,t:0,life:DEATH_DUR.burn});
  if(st==='dissolve')deathFx.push({kind:'glow',x:cx,y:cy,r:m.w,col:shadeHex(c1,0.4),a:0.35,t:0,life:0.8});
}
function deathTick(m,dt){
  const def=m.def,st=m.dstyle,T=m.deadT,cx=m.x,cy=m.y-m.h*0.5,ev=(t0)=>T>=t0&&T-dt<t0;
  if(st==='fall'||st==='legsup'){if(ev(st==='fall'?0.36:0.42)){deathDust(m,7);if(m.h>40)shake(2);}if(ev(DEATH_DUR[st]-0.4))deathDust(m,8);}
  else if(st==='bones'){if(ev(0.22)){const bc='#e6dcc6',n=def.id==='bonegolem'?12:7;
      for(let k=0;k<n;k++)addDebris(cx+rnd(-m.w*0.3,m.w*0.3),cy+rnd(-m.h*0.3,m.h*0.3),rnd(-130,130),rnd(-260,-60),'bone',k%4===0?'#cfc4ac':bc,rnd(3,def.id==='bonegolem'?7:5),rnd(1.6,2.2));
      addDebris(cx,m.y-m.h*0.85,rnd(-60,60),rnd(-240,-140),'skull',bc,def.id==='bonegolem'?7:4.5,rnd(1.8,2.3));
      deathDust(m,8,'#a89c88');if(def.id==='bonegolem')shake(4);}}
  else if(st==='crumble'){if(ev(0.32)){const n=def.id==='ashgolem'||def.id==='guard'?14:9;
      for(let k=0;k<n;k++)addDebris(cx+rnd(-m.w*0.4,m.w*0.4),m.y-rnd(4,m.h*0.9),rnd(-140,140),rnd(-280,-40),'chunk',k%3===0?def.c2:k%3===1?shadeHex(def.c1,-0.25):def.c1,rnd(3,6.5),rnd(1.5,2.1));
      deathDust(m,12,def.dim===1?'#5a4c46':'#9a8c7c');shake(4);}
    if(T<0.32&&Math.random()<dt*30)spawnPart(cx+rnd(-m.w*0.4,m.w*0.4),m.y-rnd(0,m.h),rnd(-10,10),rnd(-10,20),0.4,'#8a7c70',rnd(1.2,2),300);}
  else if(st==='dissolve'){if(T<0.85&&Math.random()<dt*40){const a=Math.random()*TAU;
      spawnPart(cx+Math.cos(a)*m.w*0.35,cy+Math.sin(a)*m.h*0.35,Math.cos(a+1.6)*30,rnd(-80,-40),rnd(0.5,0.9),shadeHex(def.c1,0.35),rnd(1.6,3),-60);}}
  else if(st==='burn'){
    if(T<1.2&&Math.random()<dt*36)spawnPart(cx+rnd(-m.w*0.4,m.w*0.4),m.y-rnd(0,m.h*0.8*(1-T/1.4)),rnd(-15,15),rnd(-120,-50),rnd(0.4,0.8),Math.random()<0.6?'#ffb040':'#ff5a10',rnd(1.4,2.6),-90);
    if(T>0.5&&T<1.3&&Math.random()<dt*14)addDebris(cx+rnd(-m.w*0.4,m.w*0.4),m.y-rnd(4,m.h*0.4),rnd(-30,30),rnd(-30,0),'ash',Math.random()<0.5?'#3a3230':'#5a504a',rnd(1.4,2.4),rnd(0.8,1.3));
    if(ev(1.05))deathDust(m,10,'#4a4240');}
  else if(st==='tumble'){if(m.landed&&!m.landFx){m.landFx=true;deathDust(m,6);
      if(def.id==='skullbat'){addDebris(m.x,m.y-6,rnd(-40,40),-120,'skull','#e6dcc6',4,1.6);for(let k=0;k<3;k++)addDebris(m.x,m.y-6,rnd(-90,90),rnd(-160,-60),'bone','#e6dcc6',3,1.5);}
      if(def.id==='cinderbat')for(let k=0;k<8;k++)spawnPart(m.x+rnd(-8,8),m.y-4,rnd(-40,40),rnd(-110,-40),rnd(0.3,0.6),'#ff9a3a',rnd(1.2,2),-60);}
    if(def.id==='cinderbat'&&!m.landed&&Math.random()<dt*30)spawnPart(cx,cy,rnd(-20,20),rnd(-40,0),0.4,'#ff8a2a',1.6,-40);}
  else if(st==='implode'){if(T<0.6&&Math.random()<dt*60){const a=Math.random()*TAU,r=m.w*rnd(0.9,1.5),life=rnd(0.25,0.4);
      spawnPart(cx+Math.cos(a)*r,cy+Math.sin(a)*r,-Math.cos(a)*r/life,-Math.sin(a)*r/life,life,Math.random()<0.5?'#b08aff':'#5a2aa0',rnd(1.5,2.6),0);}
    if(ev(0.6)){shockRings.push({x:cx,y:cy,r:3,max:m.w*0.8,t:0,col:'#8a50e0'});for(let k=0;k<12;k++){const a=Math.random()*TAU,sp=rnd(80,220);spawnPart(cx,cy,Math.cos(a)*sp,Math.sin(a)*sp,rnd(0.3,0.6),'#c8a8ff',rnd(1.4,2.4),0);}if(m.h>50)shake(5);}}
  else if(st==='melt'){if(T<1.0&&Math.random()<dt*10)addDebris(m.x+rnd(-m.w*0.35,m.w*0.35),m.y-m.h*0.7*(1-T),rnd(-20,20),10,'gib',Math.random()<0.5?def.c1:'#7a0a14',rnd(1.4,2.4),0.45);
    if(T<1.6&&Math.random()<dt*16){const bx=m.x+rnd(-m.w*0.7,m.w*0.7);spawnPart(bx,m.y-1,rnd(-6,6),rnd(-30,-12),rnd(0.25,0.45),'#a01020',rnd(1.2,2.2),60);}
    if(ev(0.5)||ev(0.9))deathFx.push({kind:'puddle',x:m.x+rnd(-8,8),y:m.y,r:m.w*0.45,col:'#5a0610',t:0,life:2.6,grow:0.3});}
}
function updateDeadMobs(dt){
  if(G.scene!=='mine'){deadMobs.length=0;debris.length=0;deathFx.length=0;return;}
  updateDebris(dt);
  for(let i=deadMobs.length-1;i>=0;i--){const m=deadMobs[i];m.deadT+=dt;
    const st=m.dstyle,D=DEATH_DUR[st]||1,T=m.deadT;
    m.deathK=Math.min(1,T/D);
    /* тело падает, пока не упрётся в землю (призраки, коконы и «схлопывание» висят в воздухе) */
    if(st!=='dissolve'&&st!=='implode'&&st!=='pop'&&st!=='shatter'&&!m.landed){
      m.dvy+=(st==='tumble'?900:1300)*dt;const ny=m.y+m.dvy*dt;
      if(solidAtPx(m.x,ny)){if(st==='tumble'&&m.dvy>220&&!m.bounced){m.bounced=true;m.dvy=-m.dvy*0.25;}else{m.dvy=0;m.landed=true;m.landT=T;}}else m.y=ny;
    }
    if(m.kbx&&st!=='dissolve'&&st!=='implode'&&st!=='pop'&&st!=='shatter'&&st!=='melt'){const nx=m.x+m.kbx*dt;if(!solidAtPx(nx+Math.sign(m.kbx)*m.w*0.4,m.y-8))m.x=nx;m.kbx*=Math.exp(-dt*7);if(Math.abs(m.kbx)<2)m.kbx=0;}
    deathTick(m,dt);
    /* прозрачность тела по стилю */
    let a=1;
    if(st==='fall'||st==='legsup')a=1-clamp((T-(D-0.4))/0.4,0,1);
    else if(st==='splat')a=1-clamp((T-0.2)/0.25,0,1);
    else if(st==='melt')a=1-clamp((T-1.05)/0.25,0,1);
    else if(st==='bones')a=1-clamp((T-0.18)/0.12,0,1);
    else if(st==='crumble')a=1-clamp((T-0.45)/0.18,0,1);
    else if(st==='shatter')a=T<0.12?1:0;
    else if(st==='pop')a=T<0.15?1:0;
    else if(st==='dissolve')a=Math.pow(1-clamp(T/0.95,0,1),1.3);
    else if(st==='burn')a=1-clamp((T-1.0)/0.4,0,1);
    else if(st==='implode')a=1-clamp((T-0.5)/0.12,0,1);
    else if(st==='tumble')a=m.landed?1-clamp((T-(m.landT||T)-0.45)/0.4,0,1):1;
    m.alpha=a;
    if(T>D+0.9||(st==='tumble'&&T>3))deadMobs.splice(i,1);}
}
