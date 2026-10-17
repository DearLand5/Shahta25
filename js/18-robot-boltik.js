'use strict';
/* ============================================================
   РОБОТ-КЛАДОВЩИК «БОЛТИК»: стоит в лобби Ада, берёт ресурсы из ящика-приёмника
   и разносит их по ящикам лобби согласно их фильтрам
   ============================================================ */
const BOT_COST={c:220000,m:{mech:3,a7:2,lens:1}},BOT_SPEED=120,BOT_LOAD=60;
/* прокачки Болтика: ходовая (скорость езды и погрузки) и грузовой отсек (сколько за ходку) */
const BOT_SPD=[1,1.35,1.75,2.2,2.75,3.4],BOT_CAP=[60,100,160,240,350,500];
const BOT_UPG={
  spd:[{c:120000,m:{mech:2,i18:4}},{c:320000,m:{mech:3,a7:2}},{c:800000,m:{mech:4,a8:2}},{c:1800000,m:{a9:3,lens:2}},{c:4000000,m:{a10:3,fcore:1}}],
  cap:[{c:100000,m:{mech:2,i27:4}},{c:280000,m:{a7:3,cloth:1}},{c:700000,m:{a8:3,cloth:2}},{c:1600000,m:{a9:4,mech:4}},{c:3600000,m:{a10:4,soulglass:1}}]};
function botSpd(){return BOT_SPD[clamp(bot().spdLv|0,0,5)];}
function botLoad(){return BOT_CAP[clamp(bot().capLv|0,0,5)];}
const BOT_CATS=[['hore','🔥 Руда Ада'],['eore','🌍 Руда Земли'],['ingot','▰ Слитки'],['alloy','⬢ Сплавы'],['comp','⚙️ Компоненты'],['part','🦴 Части мобов'],['rest','✳ Всё остальное']];
/* общее состояние (приёмник, прокачки — одни на всех роботов) + список роботов S.units (до BOT_MAX) */
const BOT_MAX=3,BOT_NAMES=['Болтик','Гаечка','Шуруп'];
const BOT_SKINS=[
  {id:'brass',n:'Латунь',b:['#e8b86a','#c8904a','#7a5226'],pan:'#3a2a1a',riv:'#f0d090',arm:['#8a6232','#6a4a28'],h:['#f8d898','#a87a3e'],vis:'#7ff0ff'},
  {id:'steel',n:'Сталь',b:['#d0dce8','#8c9cae','#4a5868'],pan:'#1a2230',riv:'#eef4fa',arm:['#6a7888','#4a5664'],h:['#f2f6fa','#7a8a9a'],vis:'#7ff0ff'},
  {id:'copper',n:'Медь',b:['#f4a878','#c4683a','#6a3018'],pan:'#3a1a10',riv:'#ffd0a0',arm:['#a05030','#703818'],h:['#ffc8a0','#a05a30'],vis:'#a0ff9a'},
  {id:'obsid',n:'Обсидиан',b:['#5a4858','#2e2230','#120a12'],pan:'#0a0408',riv:'#ff7a3a',arm:['#3e2e3e','#24182a'],h:['#6a586a','#1a101a'],vis:'#ff5a2a'},
  {id:'jade',n:'Нефрит',b:['#a6e8bc','#3aa070','#1a5a3a'],pan:'#0a2a1a',riv:'#e0ffe8',arm:['#2a8a5a','#1a6040'],h:['#d0ffe0','#3a9a6a'],vis:'#fff07a'},
  {id:'gold',n:'Золото',b:['#fff2a8','#f0c040','#a07010'],pan:'#3a2a08',riv:'#ffffff',arm:['#c09030','#8a6010'],h:['#fffad0','#d0a030'],vis:'#ff7ae0'},
  {id:'bone',n:'Кость',b:['#f6eedc','#d0c4a8','#8a7c64'],pan:'#2a2420',riv:'#ffffff',arm:['#b8aa90','#8a7c64'],h:['#fffaf0','#c0b090'],vis:'#9ad8ff'},
  {id:'candy',n:'Карамель',b:['#ffa8d8','#e05aa0','#8a2a60'],pan:'#3a1030',riv:'#ffffff',arm:['#c84a90','#9a3070'],h:['#ffd8ee','#d060a0'],vis:'#7ff0ff'}];
function botSkin(id){return BOT_SKINS.find(k=>k.id===id)||BOT_SKINS[0];}
function newBotUnit(i){return {id:'b'+Date.now().toString(36)+Math.floor(Math.random()*1e4).toString(36),name:BOT_NAMES[i]||('Робот '+(i+1)),skin:BOT_SKINS[i%3].id,placed:false,x:300,face:1,moved:0,carry:null,job:null};}
function bot(){if(!player.sorter||typeof player.sorter!=='object')player.sorter={owned:false,placed:false};const S=player.sorter;
  if(!Array.isArray(S.units)){S.units=[];if(S.owned){const u=newBotUnit(0);u.id='b1';u.placed=!!S.placed;u.x=S.x||300;u.face=S.face||1;u.carry=S.carry||null;u.moved=S.moved|0;S.units.push(u);}S.carry=null;}
  S.owned=S.units.length>0;S.placed=S.units.some(u=>u.placed);return S;}
function botUnits(){return bot().units;}
function botById(id){return bot().units.find(u=>u.id===id)||null;}
function botUnplaced(){return bot().units.find(u=>!u.placed)||null;}
function botActive(){return G.dim===1&&bot().units.some(u=>u.placed);}
function resCat(kind,id){if(kind==='o')return ORES[id]&&ORES[id].dim===1?'hore':'eore';const M=MATS[id];return M?M.kind:'part';}
function lobbyCrates(){return worldCrates().filter(c=>c.where==='lobby');}
/* куда отнести: точный выбор > категория > «всё остальное» */
function botTarget(kind,id,inputId){
  let best=null,bp=0;const key=kind+':'+id,cat=resCat(kind,id);
  for(const c of lobbyCrates()){if(c.id===inputId||!c.sf)continue;
    const p=(c.sf.ids||[]).includes(key)?3:(c.sf.cats||[]).includes(cat)?2:(c.sf.cats||[]).includes('rest')?1:0;
    if(p>bp){bp=p;best=c;}}
  return best;
}
function botNextJob(S,inp,claims){
  let any=null;
  for(const kind of ['o','m']){const box=kind==='o'?inp.inv:inp.mats;
    for(const k of Object.keys(box)){if(!(box[k]>0)||!(kind==='o'?ORES[k]:MATS[k]))continue;const tg=botTarget(kind,k,inp.id);if(!tg)continue;
      const j={kind,id:k,to:tg.id};if(!claims||!claims.has(kind+':'+k))return j;if(!any)any=j;}}
  return any;   /* все задания заняты другими роботами — помогаем с тем же ресурсом */
}
function botUnsorted(inp){let n=0;for(const k in inp.inv)if(inp.inv[k]>0&&!botTarget('o',k,inp.id))n++;for(const k in inp.mats)if(inp.mats[k]>0&&!botTarget('m',k,inp.id))n++;return n;}
function crateOpen(c,t){c._openT=Math.max(c._openT||0,t);}
function sorterTick(dt){
  if(!botActive())return;
  const S=bot();
  for(const c of lobbyCrates())if(c._openT>0)c._openT-=dt;
  const inp=lobbyCrates().find(c=>c.id===S.input);
  const placed=S.units.filter(u=>u.placed);
  placed.forEach((U,idx)=>{
    const claims=new Set();for(const o of placed)if(o!==U&&o.job&&(o.job.ph==='toIn'||o.job.ph==='grab'))claims.add(o.job.kind+':'+o.job.id);
    botUnitTick(U,idx,inp,claims,dt);});
}
function botUnitTick(U,idx,inp,claims,dt){
  U.t=(U.t||0)+dt;U.anim=(U.anim||0)+dt;
  const sp=BOT_SPEED*botSpd(),hk=1/(1+(botSpd()-1)*0.6);const goTo=(x)=>{const d=x-U.x;if(Math.abs(d)<3){U.vx=0;return true;}const st=Math.sign(d)*Math.min(Math.abs(d),sp*dt);U.x+=st;U.vx=Math.sign(d)*sp;U.face=Math.sign(d);return false;};
  U.vx=0;
  if(!U.job){
    if(U.carry){const tg=crateById(U.carry.to);if(!tg){/* ящик убрали — вернуть в приёмник */if(inp){const box=U.carry.kind==='o'?inp.inv:inp.mats;box[U.carry.id]=(box[U.carry.id]||0)+U.carry.n;}U.carry=null;}
      else{U.job={ph:'toOut',to:tg.id};}}
    else if(!inp){U.state='noinput';return;}
    else{const j=botNextJob(U,inp,claims);if(!j){U.state=botUnsorted(inp)?'nofilter':'idle';const hx=inp.x+40+idx*30;if(Math.abs(U.x-hx)>4)goTo(hx);return;}
      U.job={ph:'toIn',kind:j.kind,id:j.id,to:j.to};}
  }
  const J=U.job;U.state='work';const side=(c)=>(U.x<c.x?-24:24)+(idx?(idx===1?-8:8):0);
  if(J.ph==='toIn'){if(!inp){U.job=null;return;}if(goTo(inp.x+side(inp))){J.ph='grab';J.t=0;crateOpen(inp,0.9);}}
  else if(J.ph==='grab'){J.t+=dt/hk;if(J.t>0.55&&!U.carry){const box=J.kind==='o'?inp.inv:inp.mats,have=box[J.id]||0,n=Math.min(botLoad(),have);
      if(n<=0){U.job=null;return;}box[J.id]=have-n;if(box[J.id]<=0)delete box[J.id];U.carry={kind:J.kind,id:J.id,n:n,to:J.to};}
    if(J.t>0.85){J.ph='toOut';}}
  else if(J.ph==='toOut'){const tg=crateById(J.to);if(!tg){U.job=null;return;}if(goTo(tg.x+side(tg))){J.ph='drop';J.t=0;crateOpen(tg,0.9);}}
  else if(J.ph==='drop'){J.t+=dt/hk;const tg=crateById(J.to);
    if(J.t>0.45&&U.carry&&tg){const C=U.carry,box=C.kind==='o'?tg.inv:tg.mats;box[C.id]=(box[C.id]||0)+C.n;U.carry=null;U.moved=(U.moved||0)+C.n;const S=bot();S.moved=(S.moved||0)+C.n;
      if(G.scene==='lobby'&&Math.abs(tg.x-G.cam.x)<view.W)floatText(tg.x,-40,'+'+C.n+' '+(C.kind==='o'?ORES[C.id].name:MATS[C.id].n),'#9fe8ff');}
    if(J.t>0.8){U.job=null;const S=bot();if(G.time-(S.saveT||0)>20){S.saveT=G.time;saveGame();}}}
}
function placeBot(){
  const U=botUnplaced();if(!U)return;
  if(G.dim!==1||G.scene!=='lobby'){UI.toast('Робота можно поставить только в лобби Ада');SFX.uiBack();return;}
  const x=lobbyPlaceX(),why=lobbyPlaceCheck('sorter',x);if(why){UI.toast(why);SFX.uiBack();return;}
  U.placed=true;U.x=Math.round(x);U.face=x>=lobbyPlayer.x?-1:1;U.job=null;bot();
  G.lobbyAim=null;
  burst(U.x,-14,14,'#9fe8ff',130,2.6);SFX.portal&&SFX.portal();vib(20);validateSelection();saveGame();UI.toast('🤖 '+U.name+' готов к работе — тапни по нему, чтобы настроить');
}
function botColor(kind,id){return kind==='o'?ORES[id].color:MATS[id].col;}
/* модель: латунный робот на гусеничном ходу, купол-голова с визором, антенна, руки-клешни */
function drawBot(g,x,y,S,t,near){
  const K=botSkin(S.skin);
  const mv=Math.abs(S.vx||0)>1,f=S.face||1,J=S.job,carry=S.carry;
  const work=S.state==='work',sleep=S.state==='idle'||S.state==='noinput';
  const bob=mv?Math.abs(Math.sin(t*14))*0.8:Math.sin(t*2.2)*0.6;
  const ph=J?J.ph:'',jt=J?(J.t||0):0;
  const reach=ph==='grab'?Math.sin(clamp(jt/0.85,0,1)*Math.PI):ph==='drop'?Math.sin(clamp(jt/0.8,0,1)*Math.PI):0;
  g.save();g.translate(x,y);
  g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(0,0,15,3.2,0,0,TAU);g.fill();
  g.scale(f,1);
  /* гусеницы */
  {const tr=(S.anim||0)*(mv?Math.abs(S.vx||0)/4:0);g.fillStyle='#2a2a30';g.beginPath();g.moveTo(-12,-1);g.quadraticCurveTo(-14,-4.5,-11,-7.5);g.lineTo(11,-7.5);g.quadraticCurveTo(14,-4.5,12,-1);g.closePath();g.fill();
    g.fillStyle='#4a4a54';for(let k=0;k<7;k++){const xx=-11+((k*3.6+tr)%25);g.fillRect(xx,-1.6,1.6,1.4);g.fillRect(xx,-7.6,1.6,1.2);}
    g.fillStyle='#6a6a76';for(const wx of [-8,0,8]){g.beginPath();g.arc(wx,-4.2,2.4,0,TAU);g.fill();g.fillStyle='#2a2a30';g.beginPath();g.arc(wx,-4.2,0.9,0,TAU);g.fill();g.fillStyle='#6a6a76';}}
  g.translate(0,-bob);
  /* корпус: латунь, заклёпки, шкала-индикатор */
  const lean=mv?0.06:0;g.rotate(lean);
  const bg=g.createLinearGradient(-10,-24,10,-8);bg.addColorStop(0,K.b[0]);bg.addColorStop(0.5,K.b[1]);bg.addColorStop(1,K.b[2]);
  g.fillStyle=bg;roundRect(g,-10,-23,20,15,4);g.fill();g.strokeStyle='rgba(40,22,8,.8)';g.lineWidth=1;roundRect(g,-10,-23,20,15,4);g.stroke();
  g.fillStyle=K.pan;roundRect(g,-6,-19.5,12,6,1.5);g.fill();
  {const lvl=carry?1:(S.state==='nofilter'?0.35:0.15);g.fillStyle=S.state==='nofilter'?'#ff7a4a':'#7ff0a0';g.fillRect(-5,-18.5,10*lvl,1.6);
    for(let k=0;k<3;k++){g.fillStyle=(Math.floor(t*3+k)%3===0&&!sleep)?'#ffd060':'#5a4020';g.beginPath();g.arc(-3+k*3,-15,0.9,0,TAU);g.fill();}}
  g.fillStyle=K.riv;for(const [rx,ry] of [[-8.4,-21.4],[8.4,-21.4],[-8.4,-9.6],[8.4,-9.6]]){g.beginPath();g.arc(rx,ry,0.8,0,TAU);g.fill();}
  /* прокачки видны на модели: грузовой короб за спиной и турбина-выхлоп */
  if((S.capLv|0)>0){const cl=S.capLv|0;g.fillStyle='#5a4a3a';roundRect(g,-15,-21+(5-cl)*0.6,6,10+cl*1.2,1.5);g.fill();g.strokeStyle='#2a2018';g.lineWidth=0.8;roundRect(g,-15,-21+(5-cl)*0.6,6,10+cl*1.2,1.5);g.stroke();
    g.fillStyle='#c8904a';for(let k=0;k<Math.min(cl,4);k++)g.fillRect(-14.4,-19+k*2.6,4.8,0.9);}
  if((S.spdLv|0)>0){const sl=S.spdLv|0;g.fillStyle='#6a6a76';g.beginPath();g.ellipse(-11,-12,2.2,3.2+sl*0.2,0,0,TAU);g.fill();
    if(mv)olLight(g,(g)=>{const fl=3+sl*1.6+Math.sin(t*40)*1.2;const gr=g.createLinearGradient(-12,-12,-12-fl,-12);gr.addColorStop(0,'rgba(140,230,255,.9)');gr.addColorStop(1,'rgba(60,140,255,0)');g.fillStyle=gr;g.beginPath();g.moveTo(-12,-14);g.lineTo(-12-fl,-12);g.lineTo(-12,-10);g.closePath();g.fill();});}
  /* труба с паром */
  g.fillStyle='#5a5a64';g.fillRect(-8,-27,3,5);g.fillStyle='#3a3a42';g.fillRect(-8.6,-27.6,4.2,1.2);
  if(work&&Math.sin(t*5)>0.6){g.fillStyle='rgba(220,220,230,.35)';g.beginPath();g.arc(-6.5-(t*8%6),-30-(t*12%8),1.8+(t*3%2),0,TAU);g.fill();}
  /* руки-манипуляторы: тянутся к ящику при погрузке, держат груз над головой при переноске */
  const armUp=carry&&ph!=='drop'?1:0;
  const arm=(sx,back)=>{const a1=armUp?-2.5:(1.2-reach*0.9),l=7;const ex=sx+Math.sin(a1)*l,ey=-17+Math.cos(a1)*l*(armUp?1:1);
    g.strokeStyle=back?K.arm[1]:K.arm[0];g.lineWidth=2.4;g.lineCap='round';g.beginPath();g.moveTo(sx,-17);g.lineTo(ex,ey);g.stroke();
    g.fillStyle='#4a4a54';g.beginPath();g.arc(sx,-17,1.6,0,TAU);g.fill();
    g.strokeStyle='#3a3a42';g.lineWidth=1.3;const ca=Math.sin(t*6)*0.2;g.beginPath();g.moveTo(ex,ey);g.lineTo(ex+2.2,ey-1.6-ca);g.moveTo(ex,ey);g.lineTo(ex+2.2,ey+1.6+ca);g.stroke();return [ex,ey];};
  arm(-9,true);
  /* голова-купол с визором и антенной */
  g.save();g.translate(1,-23);g.rotate(mv?0:Math.sin(t*0.9)*0.08);
  const hg=g.createRadialGradient(-2,-5,1,0,-3,8);hg.addColorStop(0,K.h[0]);hg.addColorStop(1,K.h[1]);g.fillStyle=hg;g.beginPath();g.arc(0,-1,7,Math.PI,0);g.lineTo(7,1);g.lineTo(-7,1);g.closePath();g.fill();
  g.strokeStyle='rgba(40,22,8,.8)';g.lineWidth=1;g.stroke();
  g.fillStyle='#16242a';roundRect(g,-1,-4.6,7.6,4,2);g.fill();
  {const scan=sleep?0:Math.sin(t*(work?3:1.4))*2,eyeA=sleep?(0.3+0.2*Math.sin(t*1.5)):(Math.sin(t*0.7)>0.97?0.2:1);
    olLight(g,(g)=>{softGlow(g,2.8+scan,-2.6,5,K.vis,0.55*eyeA);g.fillStyle=hexA(shadeHex(K.vis,0.35),eyeA);g.beginPath();g.ellipse(2.8+scan,-2.6,1.6,sleep?0.5:1.2,0,0,TAU);g.fill();});}
  g.strokeStyle='#5a5a64';g.lineWidth=1;g.beginPath();g.moveTo(-3,-7.4);g.quadraticCurveTo(-4+Math.sin(t*3)*1.5,-11,-3+Math.sin(t*3)*2,-13);g.stroke();
  olLight(g,(g)=>{const bl=(Math.floor(t*(work?4:1))%2)?1:0.25;softGlow(g,-3+Math.sin(t*3)*2,-13.4,3.5,S.state==='nofilter'?'#ff6a3a':'#ff3a3a',0.6*bl);g.fillStyle=S.state==='nofilter'?'#ffa070':'#ff6a6a';g.beginPath();g.arc(-3+Math.sin(t*3)*2,-13.4,1.1,0,TAU);g.fill();});
  if(sleep){g.fillStyle='rgba(200,230,255,'+(0.5+0.4*Math.sin(t*2))+')';g.font='700 6px system-ui';g.fillText('z',8,-9-(t*4%5));g.font='700 4.5px system-ui';g.fillText('z',11,-14-(t*4%5));}
  g.restore();
  const hand=arm(8,false);
  /* груз: светящийся брусок цвета ресурса */
  if(carry){const cc=botColor(carry.kind,carry.id),hy=armUp?-37:hand[1]-2,hx=armUp?1:hand[0]+1;
    g.fillStyle=shadeHex(cc,-0.3);roundRect(g,hx-5,hy-3,10,6,1.5);g.fill();g.fillStyle=cc;roundRect(g,hx-4.5,hy-3,9,4,1.5);g.fill();
    g.fillStyle='rgba(255,255,255,.5)';g.fillRect(hx-3.5,hy-2.5,4,1);
    g.font='800 4.5px system-ui';g.textAlign='center';g.fillStyle='#fff';g.fillText('×'+carry.n,hx,hy+7.5);}
  if(S.state==='nofilter'&&!mv){g.font='900 9px system-ui';g.textAlign='center';g.fillStyle='rgba(255,170,90,'+(0.6+0.4*Math.sin(t*5))+')';g.fillText('?',1,-46);}
  g.restore();
  if(near){g.save();g.font='800 10px system-ui,sans-serif';g.textAlign='center';const msg=botStatusShort(S),lbl='🤖 '+(S.name||'Болтик')+' · '+msg,tw=g.measureText(lbl).width+12;
    g.fillStyle='rgba(10,8,6,.74)';roundRect(g,x-tw/2,y-100,tw,15,7.5);g.fill();g.fillStyle='#9fe8ff';g.fillText(lbl,x,y-89);
    g.font='700 8.5px system-ui,sans-serif';g.fillStyle='rgba(220,240,255,.8)';g.fillText('тапни по роботу, чтобы настроить',x,y-104);g.restore();}
}
function botStatusShort(S){return S.state==='work'?(S.carry?'несёт '+(S.carry.kind==='o'?ORES[S.carry.id].name:MATS[S.carry.id].n):'работает'):S.state==='noinput'?'нет приёмника':S.state==='nofilter'?'не знает, куда нести':'отдыхает';}
function drawLobbyBot(g){if(G.dim!==1)return;const S=bot();let nearU=null,nd=130;
  for(const U of S.units){if(!U.placed)continue;const d=Math.abs(lobbyPlayer.x-U.x);if(d<nd){nd=d;nearU=U;}}
  for(const U of S.units){if(!U.placed)continue;U.capLv=S.capLv;U.spdLv=S.spdLv;drawBot(g,U.x,0,U,G.time+(U.id.length*0.37),G.scene!=='cutscene'&&U===nearU);}}
function botTap(wx,wy){if(G.dim!==1||G.scene!=='lobby')return false;let hit=null,hd=21;
  for(const U of botUnits()){if(!U.placed)continue;const d=Math.abs(wx-U.x);if(d<hd&&wy>-44&&wy<6){hd=d;hit=U;}}
  if(!hit)return false;if(Math.abs(lobbyPlayer.x-hit.x)>170){UI.toast('Подойди ближе к роботу «'+hit.name+'»');return true;}SFX.ui();UI.sorter(hit.id);return true;}
const MOB_CAP=30;
function mobRate(){const r=settings.mobRate;return (typeof r==='number'&&r>=0)?r:1;}
function mobCap(){return Math.round(MOB_CAP*mobRate()*(settings.quality==='low'?0.8:1));}
let spawnTimer=0;

function spawnMobAt(def,x,y){
  const m={
    def,x,y,vx:0,vy:0,w:def.w,h:def.h,
    hp:def.hp,maxHp:def.hp,onGround:false,facing:Math.random()<0.5?-1:1,
    anim:Math.random()*10,phase:Math.random()*TAU,
    state:'idle',st:0,timer:0,hurt:0,age:0,atkCd:0,dashT:0,fleeT:0,tele:0,cd:rnd(0.5,2),
    alpha:1,stolen:0,loot:[],healCd:0,shootCd:0,alive:true,provoked:0,shield:0,
    gy:y,untargetable:false,hidden:false,losT:0,los:false,aimA:0
  };
  if(def.mech==='mole'){m.state='under';m.untargetable=true;m.alpha=0.4;}
  mobs.push(m);
  return m;
}
function trySpawnMob(){
  if(mobRate()<=0||mobs.length>=mobCap())return;
  if(!G.mineActive)return;
  if(player.y<12*TILE)return;
  if(G.hb||hbAt(player.x,player.y-4))return;          /* в святилищах Владык обычные мобы не появляются */
  if(G.dim===0&&player.y>(ARENA_Y0-3)*TILE)return;
  /* иногда ищем воду — там живёт рыба */
  if(G.dim===0&&Math.random()<0.12){
    const wx=player.x+rnd(-16,16)*TILE,wy=player.y+rnd(-10,10)*TILE;
    const tx=Math.floor(wx/TILE),ty=Math.floor(wy/TILE);
    if(tx>=1&&tx<MW-1&&getTile(tx,ty)===T_WATER&&getTile(tx,ty-1)===T_WATER){
      const fd=MOBDEFS.find(dd=>dd.id==='fish');
      if(fd&&ty>=fd.d0&&ty<=fd.d1&&Math.hypot(wx-player.x,wy-player.y)>4*TILE){spawnMobAt(fd,tx*TILE+16,ty*TILE+16);return;}
    }
  }
  for(let att=0;att<14;att++){
    const side=Math.random()<0.5?-1:1;
    const dist=rnd(8,20)*TILE*side;
    const wx=player.x+dist;
    const wy=player.y+rnd(-7,7)*TILE;
    const tx=Math.floor(wx/TILE),ty=Math.floor(wy/TILE);
    if(tx<1||tx>=MW-1)continue;
    const d=MOBDEFS.filter(dd=>!dd.swim&&(dd.dim||0)===G.dim&&ty>=dd.d0&&ty<=dd.d1&&dd.d0<90000&&!dd.boss&&!(dd.truthOnly&&veilT<0.35));
    if(!d.length)continue;
    let wsum=0;for(const dd of d)wsum+=dd.neutral?1:2.2;
    let pick=Math.random()*wsum,def=d[0];
    for(const dd of d){pick-=dd.neutral?1:2.2;if(pick<=0){def=dd;break;}}
    const tile=getTile(tx,ty);
    if(def.mech==='lavawalker'){
      if(tile!==T_AIR&&tile!==T_LAVA)continue;
    }else if(tile!==T_AIR)continue;
    if(!def.fly){
      if(!isSolid(tx,ty+1)&&!isSolid(tx,ty+2)&&getTile(tx,ty+1)!==T_LAVA)continue;
    }
    const m=def.fly?spawnMobAt(def,tx*TILE+16,ty*TILE+16):spawnMobAt(def,tx*TILE+16,(ty+1)*TILE);
    if(G.dim===1&&m&&!def.boss&&Math.random()<(ritOn('hunt')?0.14:0.02))makeElite(m);
    if(def.group>1&&mobs.length<mobCap()-1){
      for(let k=1;k<def.group+Math.floor(Math.random()*2);k++){
        const ox=tx+Math.floor(rnd(-2,2));
        if(getTile(ox,ty)===T_AIR)spawnMobAt(def,ox*TILE+16,ty*TILE+16);
      }
    }
    return;
  }
}
function mobLOS(m){
  if(--m.losT>0)return m.los;
  m.losT=7;
  /* баррикады не скрывают игрока: мобы «чуют» его сквозь них и идут ломать */
  const x0=m.x,y0=m.y-m.h*0.5,x1=player.x,y1=player.y-player.h*0.5;
  const n=Math.ceil(Math.hypot(x1-x0,y1-y0)/10);
  let ok=true;
  for(let i=1;i<n;i++){const t=i/n;const tt=getTile(Math.floor((x0+(x1-x0)*t)/TILE),Math.floor((y0+(y1-y0)*t)/TILE));
    if(tt!==T_AIR&&tt!==T_LAVA&&tt!==T_LADDER&&!isLiq(tt)&&tt!==T_BARRICADE){ok=false;break;}}
  m.los=ok;
  return m.los;
}
function mobShoot(m,ang,spd,dmg,color,size,opts){
  opts=opts||{};m.atkT=0.24;
  projectiles.push({x:m.x+Math.cos(ang)*10,y:m.y-m.h*0.5+Math.sin(ang)*10,vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd,
    life:opts.life||2.6,dmg:dmg,color:color,size:size,owner:'mob',fx:opts.fx,grav:opts.grav||0,fuse:opts.fuse,bomb:opts.bomb,blast:opts.blast,
    homing:opts.homing,arrow:opts.arrow,ghost:opts.ghost,kind:opts.kind});
}
const beams=[];
const clouds=[];
function gasCloud(x,y,r,dps,life){
  if(clouds.length>14)clouds.shift();
  clouds.push({x,y,r,dps,life,max:life,t:0});
  burst(x,y,16,'#b8e840',140,4);SFX.boom();
}
function updateClouds(dt){
  for(let i=clouds.length-1;i>=0;i--){
    const c=clouds[i];c.life-=dt;c.t+=dt;
    if(c.life<=0){clouds.splice(i,1);continue;}
    const d=Math.hypot(player.x-c.x,(player.y-player.h*0.5)-c.y);
    if(d<c.r*Math.min(1,c.t*3)&&!cheats.god){
      c.tick=(c.tick||0)-dt;
      if(c.tick<=0){c.tick=0.5;const res=player.gasMask?0.4:1;hurtPlayer(c.dps*0.5*res,'ядовитый газ',{poison:2});}
    }
  }
}
function drawClouds(g){
  if(!clouds.length)return;
  g.save();
  for(const c of clouds){
    const a=Math.min(1,c.life/1.2)*Math.min(1,c.t*3);
    for(let k=0;k<5;k++){
      const ang=k/5*TAU+G.time*0.4+c.x*0.01,rr=c.r*(0.5+0.12*Math.sin(G.time*1.3+k));
      const x=c.x+Math.cos(ang)*c.r*0.35,y=c.y+Math.sin(ang)*c.r*0.25;
      const gr=g.createRadialGradient(x,y,2,x,y,rr);
      gr.addColorStop(0,'rgba(170,220,60,'+(0.32*a).toFixed(3)+')');gr.addColorStop(1,'rgba(120,170,30,0)');
      g.fillStyle=gr;g.beginPath();g.arc(x,y,rr,0,TAU);g.fill();
    }
  }
  g.restore();
}
