'use strict';
/* ============================================================
   INPUT
   ============================================================ */
const Input={
  ptrs:new Map(),
  joy:{active:false,id:null,bx:0,by:0,kx:0,ky:0,dx:0,dy:0,mag:0},
  jumpPressed:false,jumpPtr:null,
  placePtr:null,
  shootPtr:null,
  itemsPtr:null,
  digActive:false,digPtr:null,digTX:-1,digTY:-1,
  keys:{}
};

function resetJoystick(){
  const j=Input.joy;
  j.active=false;
  j.id=null;
  j.dx=0; j.dy=0; j.mag=0;
  try{
    const b=getBtnRect('joy');
    j.kx=b.x; j.ky=b.y;
  }catch(e){}
  for(const [id,rec] of Array.from(Input.ptrs)){
    if(rec && rec.type==='joy') Input.ptrs.delete(id);
  }
}
function releaseAllCaptures(){
  try{
    for(const id of Array.from(Input.ptrs.keys())){
      try{canvas.releasePointerCapture(id);}catch(_){}
    }
  }catch(_){}
}
function resetAllInputs(){
  releaseAllCaptures();
  resetJoystick();
  Input.jumpPressed=false;
  Input.jumpPtr=null;
  Input.placePtr=null;
  Input.shootPtr=null;
  Input.itemsPtr=null;
  Input.digActive=false;
  Input.digPtr=null;
  Input.digTX=-1; Input.digTY=-1;
  Input.ptrs.clear();
  try{G.wheel=null;}catch(_){}
}

let inputSanityT=0;
function sanityCheckInput(dt){
  inputSanityT+=dt;
  if(inputSanityT<0.5)return;
  inputSanityT=0;
  if(Input.joy.active){
    let ok=false;
    for(const [id,rec] of Input.ptrs){
      if(rec.type==='joy'&&id===Input.joy.id){ok=true;break;}
    }
    if(!ok) resetJoystick();
  }
  if(Input.jumpPtr!==null){
    let ok=false;
    for(const [id,rec] of Input.ptrs){
      if(rec.type==='jump'&&id===Input.jumpPtr){ok=true;break;}
    }
    if(!ok)Input.jumpPtr=null;
  }
  if(Input.placePtr!==null){
    let ok=false;
    for(const [id,rec] of Input.ptrs){
      if(rec.type==='place'&&id===Input.placePtr){ok=true;break;}
    }
    if(!ok)Input.placePtr=null;
  }
  if(Input.shootPtr!==null){
    let ok=false;
    for(const [id,rec] of Input.ptrs){
      if(rec.type==='shoot'&&id===Input.shootPtr){ok=true;break;}
    }
    if(!ok)Input.shootPtr=null;
  }
  if(Input.itemsPtr!==null){
    let ok=false;
    for(const [id,rec] of Input.ptrs){
      if(rec.type==='items'&&id===Input.itemsPtr){ok=true;break;}
    }
    if(!ok)Input.itemsPtr=null;
  }
  if(Input.digPtr!==null){
    let ok=false;
    for(const [id,rec] of Input.ptrs){
      if(rec.type==='dig'&&id===Input.digPtr){ok=true;break;}
    }
    if(!ok){Input.digActive=false;Input.digPtr=null;Input.digTX=-1;Input.digTY=-1;}
  }
  if(Input.joy.active && Input.ptrs.size===0) resetJoystick();
}

function updateJoyBase(){
  const b=getBtnRect('joy');
  const j=Input.joy;
  j.bx=b.x; j.by=b.y;
  if(!j.active){j.kx=b.x;j.ky=b.y;}
}
function joyZoneContains(x,y){
  const b=getBtnRect('joy');
  const dx=x-b.x, dy=y-b.y;
  const z=b.r*1.45;
  return (dx*dx+dy*dy) <= z*z;
}
function getJumpBtn(){return getBtnRect('jump');}
function getPlaceBtn(){return getBtnRect('place');}
function getShootBtn(){return getBtnRect('shoot');}
function getItemsBtn(){return getBtnRect('items');}
function inBtn(b,x,y){
  const dx=x-b.x,dy=y-b.y;
  return dx*dx+dy*dy<=b.r*b.r*1.25;
}
function isPauseBtn(x,y){
  const b=getBtnRect('pause');
  const dx=x-b.x, dy=y-b.y;
  const hitR=Math.max(b.r*1.4, 34);
  return (dx*dx+dy*dy) <= hitR*hitR;
}
function screenToWorldMine(sx,sy){
  const sc=view.scale;
  return {x:(sx-view.W/2)/sc+G.cam.x, y:(sy-view.H/2)/sc+G.cam.y};
}
function screenToWorldLobby(sx,sy){
  const sc=view.scale;
  return {x:(sx-view.W/2)/sc+G.cam.x, y:(sy-view.H*0.62)/sc};
}
function joyUpdate(tx,ty){
  const j=Input.joy;
  const b=getBtnRect('joy');
  const R=b.r;
  let dx=tx-j.bx, dy=ty-j.by;
  const d=Math.hypot(dx,dy);
  const m=Math.min(1,d/R);
  j.mag=m;
  if(d>0.001){
    j.dx=dx/d*m; j.dy=dy/d*m;
    j.kx=j.bx+dx/d*R*m;
    j.ky=j.by+dy/d*R*m;
  }else{
    j.dx=0;j.dy=0;j.kx=j.bx;j.ky=j.by;
  }
}

function tryOpenBuilding(x,y){
  if(G.scene!=='lobby')return false;
  const w=screenToWorldLobby(x,y);
  for(const bld of buildings){
    if(Math.abs(w.x-bld.x)<115 && w.y>-260 && w.y<60){
      openBuilding(bld);
      return true;
    }
  }
  return false;
}

function pointerDown(e){
  try{
    const p=getCanvasPoint(e);
    const x=p.x,y=p.y;

    if(G.scene==='cutscene'){if(G.cut&&G.cut.t>1)finishCutscene();return;}
    if(G.scene!=='menu' && isPauseBtn(x,y)){
      if(!UI.modal) togglePause();
      return;
    }
    if(UI.modal)return;
    if(G.scene==='menu')return;
    if(minimapHit(x,y))return;


    if(G.scene==='mine'){const qi=qsHit(x,y);if(qi>=0){Input.ptrs.set(e.pointerId,{type:'none'});qsUse(qi);vib(10);return;}}
    if(inBtn(getJumpBtn(),x,y)){
      Input.jumpPressed=true;
      Input.jumpPtr=e.pointerId;
      try{canvas.setPointerCapture(e.pointerId);}catch(_){}
      Input.ptrs.set(e.pointerId,{type:'jump'});
      vib(8);
      return;
    }
    if(inBtn(getItemsBtn(),x,y)){
      /* короткий тап — меню (по отпусканию), удержание или протяжка — колесо выбора */
      Input.itemsPtr=e.pointerId;
      try{canvas.setPointerCapture(e.pointerId);}catch(_){}
      Input.ptrs.set(e.pointerId,{type:'items',t:performance.now(),x,y});
      vib(10);
      return;
    }
    if(G.scene==='mine' && inBtn(getShootBtn(),x,y)){
      Input.shootPtr=e.pointerId;
      try{canvas.setPointerCapture(e.pointerId);}catch(_){}
      Input.ptrs.set(e.pointerId,{type:'shoot'});
      useShoot(false);
      vib(12);
      return;
    }
    if((G.scene==='mine'||(G.scene==='lobby'&&(G.placeItem==='crate'||G.placeItem==='sorter'))) && inBtn(getPlaceBtn(),x,y)){
      Input.placePtr=e.pointerId;
      try{canvas.setPointerCapture(e.pointerId);}catch(_){}
      Input.ptrs.set(e.pointerId,{type:'place'});
      usePlace();
      vib(12);
      return;
    }
    /* здания и ящики лобби — после экранных кнопок, чтобы кнопка поверх здания нажималась */
    if(G.scene==='lobby'&&!lobbyPlacing()){
      {const w=screenToWorldLobby(x,y);if(botTap(w.x,w.y)||crateTap(w.x,w.y)){Input.ptrs.set(e.pointerId,{type:'building'});return;}}
      if(tryOpenBuilding(x,y)){
        Input.ptrs.set(e.pointerId,{type:'building'});
        return;
      }
    }
    if(joyZoneContains(x,y)){
      if(Input.joy.active && Input.joy.id!==e.pointerId){
        resetJoystick();
      }
      if(!Input.joy.active){
        Input.joy.active=true;
        Input.joy.id=e.pointerId;
        try{canvas.setPointerCapture(e.pointerId);}catch(_){}
        joyUpdate(x,y);
        Input.ptrs.set(e.pointerId,{type:'joy'});
        return;
      }
    }

    if(G.scene==='mine'){
      if(playerInExitRoom() && G.exitGrace<=0){
        exitMine();
        return;
      }
      const w=screenToWorldMine(x,y);
      if(crateTap(w.x,w.y)){Input.ptrs.set(e.pointerId,{type:'none'});return;}
      aim.active=true;aim.x=w.x;aim.y=w.y;
      Input.digActive=true;
      Input.digPtr=e.pointerId;
      try{canvas.setPointerCapture(e.pointerId);}catch(_){}
      Input.digTX=Math.floor(w.x/TILE);
      Input.digTY=Math.floor(w.y/TILE);
      Input.ptrs.set(e.pointerId,{type:'dig'});
      return;
    }
    if(G.scene==='lobby'&&lobbyPlacing()){
      /* режим установки: тап по полу или протяжка — прицел; короткий тап выше пола — как обычно (здания, ящики, роботы) */
      const w=screenToWorldLobby(x,y),rec={type:'laim',sx:x,sy:y,t:performance.now(),aim:false};
      if(w.y>-6){rec.aim=true;setLobbyAim(w.x);SFX.ui();}
      try{canvas.setPointerCapture(e.pointerId);}catch(_){}
      Input.ptrs.set(e.pointerId,rec);return;
    }
    Input.ptrs.set(e.pointerId,{type:'none'});
  }catch(err){}
}
function pointerMove(e){
  try{
    const p=getCanvasPoint(e);
    const x=p.x,y=p.y;
    if(Input.joy.active&&Input.joy.id===e.pointerId){
      joyUpdate(x,y);
    }
    {const rec=Input.ptrs.get(e.pointerId);
      if(rec&&rec.type==='items')wheelMove(rec,x,y);
      if(rec&&rec.type==='laim'&&G.scene==='lobby'){
        if(!rec.aim&&(Math.hypot(x-rec.sx,y-rec.sy)>10||performance.now()-rec.t>260))rec.aim=true;
        if(rec.aim)setLobbyAim(screenToWorldLobby(x,y).x);}}
    if(Input.digActive&&Input.digPtr===e.pointerId&&G.scene==='mine'){
      const w=screenToWorldMine(x,y);
      aim.active=true;aim.x=w.x;aim.y=w.y;
      Input.digTX=Math.floor(w.x/TILE);
      Input.digTY=Math.floor(w.y/TILE);
    }
  }catch(err){}
}
function pointerUp(e){
  try{
    const rec=Input.ptrs.get(e.pointerId);
    if(rec){
      if(rec.type==='joy'&&Input.joy.id===e.pointerId){
        Input.joy.active=false;Input.joy.id=null;
        Input.joy.dx=0;Input.joy.dy=0;Input.joy.mag=0;
        Input.joy.kx=Input.joy.bx;Input.joy.ky=Input.joy.by;
      }
      if(rec.type==='dig'&&Input.digPtr===e.pointerId){
        Input.digActive=false;Input.digPtr=null;
        Input.digTX=-1;Input.digTY=-1;
      }
      if(rec.type==='jump'&&Input.jumpPtr===e.pointerId)Input.jumpPtr=null;
      if(rec.type==='place'&&Input.placePtr===e.pointerId)Input.placePtr=null;
      if(rec.type==='shoot'&&Input.shootPtr===e.pointerId)Input.shootPtr=null;
      if(rec.type==='items'&&Input.itemsPtr===e.pointerId){Input.itemsPtr=null;wheelRelease(rec,e.type==='pointercancel');}
      if(rec.type==='laim'&&G.scene==='lobby'){
        if(!rec.aim&&performance.now()-rec.t>260)setLobbyAim(screenToWorldLobby(rec.sx,rec.sy).x);
        else if(!rec.aim){const w=screenToWorldLobby(rec.sx,rec.sy);if(!(botTap(w.x,w.y)||crateTap(w.x,w.y)))tryOpenBuilding(rec.sx,rec.sy);}}
      Input.ptrs.delete(e.pointerId);
    }
  }catch(err){}
}

canvas.addEventListener('pointerdown',e=>{
  e.preventDefault();
  AU.init();AU.resume();
  pointerDown(e);
},{passive:false});
window.addEventListener('pointermove',e=>{pointerMove(e);},{passive:true});
window.addEventListener('pointerup',e=>{
  if(!Input.ptrs.has(e.pointerId) && !Input.joy.active)return;
  try{canvas.releasePointerCapture(e.pointerId);}catch(_){}
  pointerUp(e);
},{passive:true});
window.addEventListener('pointercancel',e=>{
  if(!Input.ptrs.has(e.pointerId) && !Input.joy.active)return;
  try{canvas.releasePointerCapture(e.pointerId);}catch(_){}
  pointerUp(e);
},{passive:true});

canvas.addEventListener('lostpointercapture',e=>{
  const rec=Input.ptrs.get(e.pointerId);
  if(rec){
    if(rec.type==='joy'&&Input.joy.id===e.pointerId){
      resetJoystick();
    } else {
      Input.ptrs.delete(e.pointerId);
      if(rec.type==='jump'&&Input.jumpPtr===e.pointerId)Input.jumpPtr=null;
      if(rec.type==='place'&&Input.placePtr===e.pointerId)Input.placePtr=null;
      if(rec.type==='shoot'&&Input.shootPtr===e.pointerId)Input.shootPtr=null;
      if(rec.type==='items'&&Input.itemsPtr===e.pointerId){Input.itemsPtr=null;wheelClose();}
      if(rec.type==='dig'&&Input.digPtr===e.pointerId){
        Input.digActive=false;Input.digPtr=null;Input.digTX=-1;Input.digTY=-1;
      }
    }
  }
});

window.addEventListener('blur',resetAllInputs);
window.addEventListener('contextmenu',()=>{ if(!UI.modal) resetAllInputs(); });
window.addEventListener('pointerleave',e=>{
  if(Input.joy.active && Input.joy.id===e.pointerId) resetJoystick();
});
document.addEventListener('visibilitychange',()=>{ if(document.hidden) resetAllInputs(); });

window.addEventListener('keydown',e=>{
  if(e.target&&(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'))return;   /* печать в поле ввода — не управление */
  Input.keys[e.code]=true;
  if(e.code==='Space'){Input.jumpPressed=true;e.preventDefault();}
  if(e.code==='KeyF'&&G.scene==='mine'){usePlace();}
  if(e.code==='KeyG'&&G.scene==='mine'){useShoot(false);}
  if(/^Digit[1-4]$/.test(e.code)&&G.scene==='mine'&&!UI.modal&&!G.paused){qsUse(+e.code.slice(5)-1);}
  if(false){fireGrapple();}
  if(e.code==='Escape'){if(G.scene!=='menu'&&!UI.modal)togglePause();}
  if(e.code==='Backquote'&&settings.cheatsUnlocked){UI.cheats();}
  if(settings.cheatsUnlocked && e.code==='KeyH' && G.scene!=='menu'){player.hp=player.maxHp;UI.toast('Полное HP');}
  if(settings.cheatsUnlocked && e.code==='KeyK' && G.scene==='mine'){mobs.length=0;UI.toast('Все мобы убиты');}
  if(settings.cheatsUnlocked && e.code==='KeyM' && G.scene!=='menu'){player.money+=100000;UI.toast('+100 000');}
});
window.addEventListener('keyup',e=>{Input.keys[e.code]=false;});
