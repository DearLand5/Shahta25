'use strict';
/* ============================================================
   ЯЩИКИ ДЛЯ ХРАНЕНИЯ: покупаются в Кузнице Ада, ставятся в лобби и в шахте,
   хранят любую руду и материалы, переименовываются, разбираются вместе с содержимым
   ============================================================ */
const CRATE_COST={c:12000,m:{i18:1}},CRATE_MAX=16;
function escHtml(t){return String(t==null?'':t).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
function packedCrates(){if(!Array.isArray(player.crates))player.crates=[];return player.crates;}
function worldCrates(){if(!G.wf)G.wf={};if(!Array.isArray(G.wf.crates))G.wf.crates=[];return G.wf.crates;}
function crateTotal(){let n=packedCrates().length+worldCrates().length;for(const k in DIMWORLD){const w=DIMWORLD[k];if(w&&w.wf&&Array.isArray(w.wf.crates))n+=w.wf.crates.length;}return n;}
function newCrate(){player.crateSeq=(player.crateSeq||0)+1;return {id:'c'+Date.now().toString(36)+player.crateSeq,name:'Ящик №'+player.crateSeq,inv:{},mats:{}};}
function crateAtTile(tx,ty){if(G.scene!=='mine'&&G.scene!=='menu')return null;for(const c of worldCrates())if(c.where==='mine'&&c.x===tx&&c.y===ty)return c;return null;}
function crateCount(c){let k=0,n=0;for(const i in c.inv)if(c.inv[i]>0){k++;n+=c.inv[i];}for(const i in c.mats)if(c.mats[i]>0){k++;n+=c.mats[i];}return {kinds:k,total:n};}
/* ---------- точная установка в лобби: прицел (смещение от игрока), призрак-схема, проверка места ---------- */
function lobbyPlacing(){if(G.scene!=='lobby'||UI.modal)return null;if(G.placeItem==='crate'&&packedCrates().length)return 'crate';if(G.placeItem==='sorter'&&botUnplaced())return 'sorter';return null;}
function lobbyAimMax(){return Math.max(80,view.W/(2*view.scale)-24);}
function lobbyPlaceX(){const lp=lobbyPlayer,def=(lp.facing||1)*(G.placeItem==='sorter'?50:46);
  const dx=G.lobbyAim?G.lobbyAim.dx:def;return Math.round(clamp(lp.x+dx,60,LOBBY_W-60));}
function setLobbyAim(wx){const lp=lobbyPlayer,m=lobbyAimMax();G.lobbyAim={dx:clamp(wx-lp.x,-m,m)};}
function lobbyPlaceCheck(kind,x){
  if(kind==='crate'){for(const c of worldCrates())if(c.where==='lobby'&&Math.abs(c.x-x)<36)return 'Слишком близко к ящику «'+c.name+'»';}
  if(x<=60||x>=LOBBY_W-60)return 'Край лобби';
  for(const b of buildings)if(Math.abs(b.x-x)<70)return 'Слишком близко ко входу: «'+b.name+'»';   /* ящик и робот не стоят у дверей зданий */
  return '';
}
function drawLobbyPlaceGhost(g){
  const kind=lobbyPlacing();if(!kind)return;
  const x=lobbyPlaceX(),why=lobbyPlaceCheck(kind,x),ok=!why,t=G.time,lp=lobbyPlayer;
  const col=ok?'127,240,160':'255,110,90';
  g.save();
  /* пунктир от игрока к месту */
  g.setLineDash([4,5]);g.lineDashOffset=-t*20;g.strokeStyle='rgba('+col+',.55)';g.lineWidth=1.5;
  g.beginPath();g.moveTo(lp.x,-20);g.quadraticCurveTo((lp.x+x)/2,-46,x,-30);g.stroke();g.setLineDash([]);
  /* метка на полу */
  g.fillStyle='rgba('+col+',.18)';g.beginPath();g.ellipse(x,0,22,4.5,0,0,TAU);g.fill();
  g.strokeStyle='rgba('+col+',.8)';g.lineWidth=1.2;g.beginPath();g.ellipse(x,0,22,4.5,0,0,TAU);g.stroke();
  /* схема предмета */
  g.globalAlpha=0.42+0.12*Math.sin(t*5);
  if(kind==='crate')drawCrate(g,x,0,{name:'',inv:{},mats:{}},false,t);
  else{const U=botUnplaced(),S=bot();drawBot(g,x,0,{skin:U.skin,face:x>=lp.x?-1:1,state:'idle',capLv:S.capLv,spdLv:S.spdLv},t,false);}
  g.globalAlpha=1;
  const w=kind==='crate'?30:34,h=kind==='crate'?28:44;
  g.setLineDash([3,3]);g.strokeStyle='rgba('+col+',.95)';g.lineWidth=1.4;g.strokeRect(x-w/2,-h,w,h);g.setLineDash([]);
  for(const [cx,cy,dx,dy] of [[x-w/2,-h,1,1],[x+w/2,-h,-1,1],[x-w/2,0,1,-1],[x+w/2,0,-1,-1]]){g.beginPath();g.moveTo(cx+dx*6,cy);g.lineTo(cx,cy);g.lineTo(cx,cy+dy*6);g.stroke();}
  g.font='800 9px system-ui,sans-serif';g.textAlign='center';
  const lbl=ok?'«Ставить» — сюда':why,tw=g.measureText(lbl).width+12;
  g.fillStyle='rgba(8,10,14,.75)';roundRect(g,x-tw/2,-h-20,tw,14,7);g.fill();g.fillStyle='rgba('+col+',1)';g.fillText(lbl,x,-h-10);
  if(!G.lobbyAim){g.font='700 8px system-ui,sans-serif';g.fillStyle='rgba(230,240,255,.75)';g.fillText('тапни по полу или веди пальцем — выбрать место',x,-h-25);}
  g.restore();
}
function placeCrate(){
  const L=packedCrates();if(!L.length){floatText(player.x,player.y-64,'Нет ящиков — купи в Кузнице Ада','#ff8a8a');SFX.uiBack();return;}
  if(G.scene==='lobby'){
    const x=lobbyPlaceX(),why=lobbyPlaceCheck('crate',x);
    if(why){UI.toast(why+' — выбери другое место');SFX.uiBack();return;}
    const c=L.shift();c.where='lobby';c.x=Math.round(x);c.y=0;worldCrates().push(c);G.lobbyAim=null;
    burst(x,-12,10,'#c89a60',110,2.6);SFX.place();vib(15);validateSelection();saveGame();UI.toast('📦 '+c.name+' поставлен');return;
  }
  if(G.scene!=='mine')return;
  const cands=[],pcx=player.x,pcy=player.y-player.h*0.5;
  if(aim.active){let ax=aim.x-pcx,ay=aim.y-pcy;const l=Math.hypot(ax,ay)||1;ax/=l;ay/=l;
    for(let d=0.9;d<=3.4;d+=0.3)cands.push([Math.floor((pcx+ax*d*TILE)/TILE),Math.floor((pcy+ay*d*TILE)/TILE)]);}
  const fx=Math.floor((player.x+player.facing*(player.w/2+16))/TILE),fty=Math.floor((player.y-4)/TILE);
  cands.push([fx,fty],[fx,fty-1],[Math.floor(player.x/TILE),fty]);
  for(const [tx,ty] of cands){
    if(tx<1||tx>=MW-1||ty<2)continue;
    if(getTile(tx,ty)!==T_AIR||getOre(tx,ty)||crateAtTile(tx,ty)||placedLadders.hasXY(tx,ty))continue;
    if(!(isSolid(tx,ty+1)||crateAtTile(tx,ty+1)))continue;
    const c=L.shift();c.where='mine';c.x=tx;c.y=ty;worldCrates().push(c);
    burst(tx*TILE+16,ty*TILE+20,10,'#c89a60',110,2.6);SFX.place();vib(15);validateSelection();saveGame();
    floatText(tx*TILE+16,ty*TILE-6,'📦 '+c.name,'#ffd98a');return;
  }
  floatText(player.x,player.y-64,'Нужно свободное место на полу','#ff8a8a');SFX.uiBack();
}
let crateFallT=0;
function updateCrates(dt){
  if(G.scene!=='mine')return;
  crateFallT+=dt;if(crateFallT<0.08)return;crateFallT=0;
  for(const c of worldCrates()){if(c.where!=='mine')continue;
    if(isSolid(c.x,c.y)){let ty=c.y;while(ty>1&&isSolid(c.x,ty))ty--;c.y=ty;continue;}   /* затянуло породой — выталкиваем наверх */
    if(!isSolid(c.x,c.y+1)&&!crateAtTile(c.x,c.y+1)&&c.y<4000){c.y++;c.fallT=0.2;}}
}
function drawCrate(g,x,y,c,near,t){
  /* x,y — середина низа; ящик 26×24, дощатый, с коваными уголками и табличкой */
  const w=26,h=24,x0=x-w/2,y0=y-h;
  g.save();
  g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(x,y,w*0.6,3,0,0,TAU);g.fill();
  const gr=g.createLinearGradient(0,y0,0,y);gr.addColorStop(0,'#8a5c34');gr.addColorStop(1,'#5a3820');
  g.fillStyle=gr;g.fillRect(x0,y0,w,h);
  g.strokeStyle='rgba(40,22,10,.75)';g.lineWidth=1;
  for(let k=1;k<3;k++){g.beginPath();g.moveTo(x0,y0+k*h/3);g.lineTo(x0+w,y0+k*h/3);g.stroke();}
  g.strokeStyle='rgba(60,34,16,.9)';g.lineWidth=2;g.beginPath();g.moveTo(x0+3,y0+3);g.lineTo(x0+w-3,y-3);g.stroke();
  g.fillStyle='rgba(255,220,170,.14)';g.fillRect(x0,y0,w,2.2);
  g.fillStyle='#4a4a52';for(const [cx,cy] of [[x0,y0],[x0+w-5,y0],[x0,y-5],[x0+w-5,y-5]])g.fillRect(cx,cy,5,5);
  g.fillStyle='#9a9aa4';for(const [cx,cy] of [[x0+2.5,y0+2.5],[x0+w-2.5,y0+2.5],[x0+2.5,y-2.5],[x0+w-2.5,y-2.5]]){g.beginPath();g.arc(cx,cy,0.9,0,TAU);g.fill();}
  g.fillStyle='#d8c08a';g.fillRect(x-5,y0+h*0.38,10,6);g.strokeStyle='rgba(60,40,20,.8)';g.lineWidth=0.8;g.strokeRect(x-5,y0+h*0.38,10,6);
  g.strokeStyle='rgba(20,10,5,.85)';g.lineWidth=1.2;g.strokeRect(x0+0.5,y0+0.5,w-1,h-1);
  if(c._openT>0){const k=Math.min(1,c._openT/0.25,(0.9-Math.max(0,c._openT-0.65))/0.25);g.save();g.translate(x0+w,y0);g.rotate(-1.2*Math.min(1,k));
    g.fillStyle='#9a6a3e';g.fillRect(-w,-3,w,3.2);g.fillStyle='#4a4a52';g.fillRect(-w,-3,4,3.2);g.fillRect(-4,-3,4,3.2);g.restore();
    g.fillStyle='rgba(20,10,4,.85)';g.fillRect(x0+2,y0,w-4,2.6);}
  if(near)softGlow(g,x,y-h*0.5,26,'#ffd080',0.18+0.08*Math.sin((t||0)*4));
  g.restore();
}
/* подпись рисуется отдельным проходом поверх персонажа и выше его головы */
function drawCrateLabel(g,x,y,c){
  const cc=crateCount(c),y0=y-24;
  g.save();g.font='800 10px system-ui,sans-serif';g.textAlign='center';
  const lbl='📦 '+c.name+(cc.kinds?' · '+cc.kinds+' вид.':' · пусто'),tw=g.measureText(lbl).width+12;
  g.fillStyle='rgba(10,8,6,.74)';roundRect(g,x-tw/2,y0-46,tw,15,7.5);g.fill();
  g.fillStyle='#ffd98a';g.fillText(lbl,x,y0-35);
  g.font='700 8.5px system-ui,sans-serif';g.fillStyle='rgba(255,240,200,.8)';g.fillText('тапни по ящику, чтобы открыть',x,y0-50);
  g.restore();
}
function drawCrateLabels(g){
  if(G.scene==='cutscene')return;
  if(G.scene==='mine'){for(const c of worldCrates()){if(c.where!=='mine')continue;const x=c.x*TILE+TILE/2,y=(c.y+1)*TILE;if(Math.hypot(player.x-x,player.y-y)<TILE*3.2)drawCrateLabel(g,x,y,c);}}
  else if(G.scene==='lobby'){for(const c of worldCrates()){if(c.where==='lobby'&&Math.abs(lobbyPlayer.x-c.x)<130)drawCrateLabel(g,c.x,0,c);}}
}
function drawMineCrates(g,cam,halfW,halfH){
  for(const c of worldCrates()){if(c.where!=='mine')continue;
    const x=c.x*TILE+TILE/2,y=(c.y+1)*TILE;
    if(Math.abs(x-cam.x)>halfW+60||Math.abs(y-cam.y)>halfH+60)continue;
    const near=Math.hypot(player.x-x,player.y-y)<TILE*3.2;
    drawCrate(g,x,y,c,near,G.time);}
}
function drawLobbyCrates(g){
  for(const c of worldCrates()){if(c.where!=='lobby')continue;
    drawCrate(g,c.x,0,c,Math.abs(lobbyPlayer.x-c.x)<130,G.time);}
}
/* тап по ящику: открыть, если игрок рядом */
function crateTap(wx,wy){
  if(G.scene==='mine'){
    const c=crateAtTile(Math.floor(wx/TILE),Math.floor(wy/TILE));if(!c)return false;
    if(Math.hypot(player.x-(c.x*TILE+16),player.y-(c.y+1)*TILE)>TILE*3.4){UI.toast('Подойди ближе к ящику');return true;}
    SFX.ui();UI.crate(c.id);return true;
  }
  if(G.scene==='lobby'){
    for(const c of worldCrates()){if(c.where!=='lobby')continue;
      if(Math.abs(wx-c.x)<20&&wy>-34&&wy<6){
        if(Math.abs(lobbyPlayer.x-c.x)>150){UI.toast('Подойди ближе к ящику');return true;}
        SFX.ui();UI.crate(c.id);return true;}}
  }
  return false;
}
function crateById(id){return worldCrates().find(c=>c.id===id)||null;}
function crateMove(c,kind,id,n,dir){
  if(n<=0)return 0;
  if(kind==='o'){
    if(dir==='in'){const have=player.inv[id]||0;n=Math.min(n,have);if(n<=0)return 0;
      c.inv[id]=(c.inv[id]||0)+n;player.inv[id]=have-n;if(player.inv[id]<=0)delete player.inv[id];return n;}
    const inC=c.inv[id]||0;if(inC<=0)return 0;
    if(!(player.inv[id]>0)&&invCount()>=player.slots)return -1;
    const room=Math.max(0,stackCap()-(player.inv[id]||0));n=Math.min(n,inC,room);if(n<=0)return -2;
    player.inv[id]=(player.inv[id]||0)+n;c.inv[id]=inC-n;if(c.inv[id]<=0)delete c.inv[id];return n;
  }
  if(!player.mats)player.mats={};
  if(dir==='in'){const have=player.mats[id]||0;n=Math.min(n,have);if(n<=0)return 0;
    c.mats[id]=(c.mats[id]||0)+n;player.mats[id]=have-n;if(player.mats[id]<=0)delete player.mats[id];return n;}
  const inC=c.mats[id]||0;n=Math.min(n,inC);if(n<=0)return 0;
  player.mats[id]=(player.mats[id]||0)+n;c.mats[id]=inC-n;if(c.mats[id]<=0)delete c.mats[id];return n;
}
function resSwatch(kind,id){
  if(kind==='o'){const O=ORES[id];return `<span class="rsw" style="background:radial-gradient(circle at 35% 30%,${shadeHex(O.color,0.45)},${O.color} 55%,${shadeHex(O.color,-0.35)})"></span>`;}
  const M=MATS[id];return `<span class="rsw rm" style="border-color:${M.col}">${M.ic==='▰'?`<i style="background:linear-gradient(180deg,${shadeHex(M.col,0.4)},${M.col},${shadeHex(M.col,-0.3)})"></i>`:M.ic==='⬢'?`<i class="hx" style="background:${M.col}"></i>`:M.ic}</span>`;
}
const MAT_KINDS=[['ingot','▰ Слитки'],['alloy','⬢ Сплавы'],['comp','⚙️ Компоненты'],['part','🦴 Части мобов']];
