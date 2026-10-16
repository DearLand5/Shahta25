'use strict';
/* ============================================================
   MAIN LOOP
   ============================================================ */
let lastTs=0,acc=0;
let perfAcc=0,perfN=0,perfWin=0,perfGood=0;
function adaptRenderScale(work,dt){
  if(document.hidden||dt>0.1||UI.modal||G.paused||(G.scene!=='mine'&&G.scene!=='lobby'))return;
  perfAcc+=work;perfN++;perfWin+=dt;
  if(perfWin<3)return;
  const avg=perfAcc/perfN;
  perfAcc=0;perfN=0;perfWin=0;
  G.perfAvg=avg;
  const sc=G.renderScale||1;
  /* сначала экономим на контурах мобов, и только потом снижаем разрешение */
  if(avg>15&&(OL.maxN===undefined||OL.maxN>3)){OL.maxN=Math.max(3,(OL.maxN||16)-5);perfGood=0;return;}
  if(avg<8&&OL.maxN!==undefined&&OL.maxN<16&&sc>=1){OL.maxN=Math.min(16,OL.maxN+3);return;}
  if(avg>15&&sc>0.6){G.renderScale=Math.max(0.6,Math.round((sc-0.15)*100)/100);perfGood=0;resize();}
  else if(avg<8&&sc<1){if(++perfGood>=2){G.renderScale=Math.min(1,Math.round((sc+0.15)*100)/100);perfGood=0;resize();}}
  else perfGood=0;
}
let fpsAcc=0,fpsCount=0;
function frame(ts){
  requestAnimationFrame(frame);
  try{
    if(!lastTs)lastTs=ts;
    let dt=(ts-lastTs)/1000;
    lastTs=ts;
    if(dt>0.25)dt=0.25;
    if(dt<0)dt=0;
    G.fpsNow=lerp(G.fpsNow||60, 1/Math.max(0.001,dt), 0.08);
    /* Раньше: один «медленный» отрезок в 1.5 с навсегда переключал графику на «Низкое»
       (хватало подгрузки шахты, сборки мусора или экрана 30 Гц). Теперь меряем, сколько
       времени САМА игра тратит на кадр, и при долгой нагрузке плавно снижаем только
       внутреннее разрешение; эффекты и настройки не трогаются, разрешение возвращается. */
    var _workT0=performance.now();

    if(G.scene==='menu')acc=0;
    else if(!G.paused&&!UI.modal){
      acc+=dt;
      let steps=0;
      while(acc>=1/60&&steps<4){update(1/60);acc-=1/60;steps++;}
      if(G.evNote)G.evNote.t+=dt;if(G.saveFlash>0)G.saveFlash=Math.max(0,G.saveFlash-dt);
      if(steps>=4)acc=0;
    } else acc=0;

    const frozen=!!UI.modal && UI.modal!=='menu' && !needRedraw;
    if(!frozen){
      needRedraw=false;
      ctx.setTransform(dpr,0,0,dpr,0,0);
      ctx.clearRect(0,0,view.W,view.H);

      if(G.scene==='menu')renderMenu(dt);
      else if(G.scene==='lobby')renderLobby();
      else if(G.scene==='mine')renderMine(dt);
      else if(G.scene==='cutscene')renderCutscene(dt);

      if(G.scene==='lobby'||G.scene==='mine'){
        {const hh=hudHidden();if(hh!==G._hh){G._hh=hh;document.body.classList.toggle('cutscene',hh);}}
        if(hudHidden())drawCutOverlay();
        else{drawTouchControls();drawHUD();drawMinimap();}
      }
      adaptRenderScale(performance.now()-_workT0,dt);
      if(G.fadeIn>0&&G.scene!=='cutscene'){ctx.fillStyle='rgba(0,0,0,'+Math.min(1,G.fadeIn)+')';ctx.fillRect(0,0,view.W,view.H);G.fadeIn-=dt*1.3;}
    }
    if(!frozen && cheats.showDebug && settings.cheatsUnlocked && (G.scene==='mine'||G.scene==='lobby')){
      drawDebugOverlay();
    }
    if(G.scene==='mine'||G.scene==='lobby'){
      G.saveTimer+=dt;
      if(settings.autoSave!==false&&G.saveTimer>(settings.autoSaveInt||30)){G.saveTimer=0;saveGame();}
      else if(settings.autoSave===false)G.saveTimer=0;
    }
  }catch(e){
    try{
      ctx.setTransform(1,0,0,1,0,0);
      ctx.fillStyle='#0a0d14';
      ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.fillStyle='#ff8a8a';
      ctx.font='16px system-ui,sans-serif';
      ctx.textAlign='center';
      ctx.fillText('Ошибка: '+e.message,canvas.width/2,60);
    }catch(e2){}
  }
}

/* настройки пишутся в свой ключ и никогда не трогают прогресс */
function saveSettings(){try{localStorage.setItem(SET_KEY,JSON.stringify(settings));}catch(e){}}
function loadSettingsKey(){
  try{const raw=localStorage.getItem(SET_KEY);if(!raw)return;const v=JSON.parse(raw);if(!v||typeof v!=='object')return;
    for(const k in settings){if(v[k]===undefined)continue;
      if(k==='controls'){if(v.controls&&typeof v.controls==='object')settings.controls=JSON.parse(JSON.stringify(v.controls));}
      else if(typeof v[k]!=='object')settings[k]=v[k];}
    if(!settings.controlsCustomized)settings.controls=null;
  }catch(e){}
}
/* автосохранение: все вызовы по ходу игры (покупки, смена измерения, таймер) идут сюда
   и ничего не делают, если автосохранение выключено в настройках */
function saveGame(){if(settings.autoSave===false)return false;return writeSave(false);}
function writeSave(manual){
  let ok=false;
  try{const d=buildSaveData();d.ts=Date.now();ok=Save.write(d);if(manual&&ok)Save.write(d,SAVE_KEY_M);}catch(e){Save.lastErr=String(e&&e.message||e);ok=false;}
  if(ok){G.lastSaveTs=Date.now();G.saveFlash=manual?2.2:1.4;G.dirty=false;}
  saveSettings();
  return ok;
}
/* ручное сохранение: пишет в основной слот и в отдельный «ручной», который автосейв не перезаписывает */
function manualSave(){
  const ok=writeSave(true);
  if(ok){SFX.buy();vib(25);UI.toast('💾 Игра сохранена в браузере');}
  else UI.toast('❌ Браузер не дал сохранить'+(Save.lastErr?': '+Save.lastErr:'')+'. Используй код сохранения.');
  return ok;
}
function loadFromBrowser(key){
  const d=Save.read(key);
  if(!d){UI.toast('❌ Сохранение не найдено');return false;}
  if(!applySaveData(d)){UI.toast('❌ Не удалось загрузить');return false;}
  loadSettingsKey();ensureControls();applySettings();
  mobs.length=0;projectiles.length=0;beams.length=0;drills.length=0;grapple=null;
  G.scene='menu';G.paused=false;G.mineActive=false;G.cam.x=lobbyPlayer.x;G.cam.y=0;
  G.lastSaveTs=d.ts||Date.now();
  if(key===SAVE_KEY_M)writeSave(false);   /* загруженный ручной сейв становится основным */
  SFX.buy();vib(30);UI.toast('📂 Сохранение загружено');UI.mainMenu();
  return true;
}
/* Полный сброс прогресса прямо в памяти — без перезагрузки страницы, которая в
   HTML-просмотрщиках и встроенных браузерах часто заблокирована. */
/* чистое состояние игры в памяти (без настроек): для сброса и для перехода в другую сессию */
function resetMemoryState(){
  for(const k of Object.keys(player)){if(!(k in PLAYER_DEFAULTS))delete player[k];}   /* в т.ч. лишние поля, добавленные по ходу игры */
  Object.assign(player,JSON.parse(JSON.stringify(PLAYER_DEFAULTS)));
  player.digSpeedLvl=0;player.digSpeed=1;player.drillBought=false;player.drills=0;player.drillLvl=1;player.gunLvl=0;player.gunAmmo=0;
  player.barricades=0;player.barricadeLvl=1;player.barricadeBought=false;
  openedChests.clear();springT.clear();ventT=0;hotT=0;liqCount=0;liqAcc=0;
  recomputeStats();player.hp=player.maxHp;
  for(const k in DIMWORLD)delete DIMWORLD[k];
  G.dim=0;G.wf={};G.resumeMine=null;buildings=BUILDINGS[0];LOBBY_W=LOBBY_WS[0];player.prog={};
  placedLadders.clear();barricades.clear();tileMods.clear();tileModsByChunk.clear();dugTiles.clear();chunks.clear();
  mobs.length=0;projectiles.length=0;beams.length=0;drills.length=0;grapple=null;aim.active=false;
  G.seed=Math.floor(Math.random()*100000);G.oreEpoch=0;G.descents=0;regenTotal=0;
  G.scene='menu';G.paused=false;G.mineActive=false;G.shootItem='';G.placeItem='ladder';
  G.hb=null;G.bossCut=null;G.bossDeath=null;G.arenaFight=false;
  lobbyPlayer.x=buildings[0].x+140;lobbyPlayer.y=0;lobbyPlayer.vy=0;
  G.cam.x=lobbyPlayer.x;G.cam.y=0;
  resetAllInputs();
}
/* Полный сброс прогресса текущей сессии прямо в памяти — без перезагрузки страницы,
   которая в HTML-просмотрщиках и встроенных браузерах часто заблокирована.
   Другие сессии не трогаются. */
function resetProgress(){
  try{
    Save.wipe();
    resetMemoryState();
    for(const k in settings)delete settings[k];
    Object.assign(settings,JSON.parse(JSON.stringify(SETTINGS_DEFAULTS)));
    resize();
    G.lastSaveTs=0;saveSettings();
    UI.mainMenu();
    UI.toast('🗑 Прогресс сессии стёрт');
  }catch(e){
    try{Save.wipe();location.reload();}catch(e2){}
  }
}
/* переход в другую сессию: текущая сохраняется, загружается выбранная (или начинается новая игра) */
function switchProfile(id){
  if(!Prof.data.list.some(p=>p.id===id))return false;
  try{const d=buildSaveData();d.ts=Date.now();Save.write(d);}catch(e){}
  Prof.data.cur=id;Prof.save();Prof.apply();
  resetMemoryState();
  const d=Save.read();
  if(d){applySaveData(d);G.lastSaveTs=d.ts||0;}else{G.lastSaveTs=0;writeSave(false);}
  ensureControls();applySettings();
  G.scene='menu';G.paused=false;G.mineActive=false;G.cam.x=lobbyPlayer.x;G.cam.y=0;
  resize();
  return true;
}
function loadGame(){Prof.load();const d=Save.read();let ok=false;if(d){ok=applySaveData(d);G.lastSaveTs=d.ts||0;}loadSettingsKey();return ok;}

function togglePause(){
  if(G.scene==='menu')return;
  if(G.paused){G.paused=false;UI.clear();}
  else{
    if(UI.modal && UI.modal!=='pause')return;
    G.paused=true;UI.pause();
  }
  SFX.ui();
}
document.addEventListener('visibilitychange',()=>{
  try{if(AU.ctx){if(document.hidden)AU.ctx.suspend();else AU.ctx.resume();}}catch(e){}
  if(document.hidden){
    resetAllInputs();
    if((G.scene==='lobby'||G.scene==='mine')&&!G.paused&&!UI.modal){
      G.paused=true;UI.pause();saveGame();
    }
  }
});

/* баланс v15: оружие чуть слабее, мобы чуть крепче и злее */
function applyBalance15(){
  if(applyBalance15.done)return;applyBalance15.done=true;
  for(const w of SWORDS)if(w.dmg)w.dmg=Math.max(1,Math.round(w.dmg*0.85));
  for(const w of GUNS)if(w.dmg)w.dmg=Math.max(1,Math.round(w.dmg*0.85*10)/10);
  for(const d of MOBDEFS){if(d.hp)d.hp=Math.round(d.hp*(d.boss?1.15:1.2));if(d.dmg)d.dmg=Math.round(d.dmg*(d.boss?1.3:1.15));}
}
/* экономика Ада v16: руда Ада дороже (особенно на первых ярусах), снаряжение,
   прокачки и предметы Ада — заметно дешевле, рынок насыщается медленнее */
const SAT_ORE=260;
function applyBalance16(){
  if(applyBalance16.done)return;applyBalance16.done=true;
  const PM={6:3,7:2.6,8:2.3,9:2.1,10:1.9};
  const old={};
  for(let k=0;k<ORES.length;k++){const O=ORES[k];if(!O||!O.dim)continue;old[k]=O.price;O.price=Math.round(O.price*(PM[O.tier]||2)/50)*50;}
  for(const r of SMELT){
    if(r.tab==='ingot'){const o=+r.out.slice(1);r.c=Math.max(100,Math.round((old[o]||0)*0.3/50)*50);r.time=Math.max(1.5,r.time*0.8);}
    else r.c=Math.round((r.c||0)*0.4/500)*500;
  }
  const sc=(r)=>{if(!r)return r;const o=JSON.parse(JSON.stringify(r));
    if(o.c)o.c=o.c>=10000?Math.round(o.c*0.42/1000)*1000:o.c;
    if(o.m)for(const k in o.m){if(!o.m[k])continue;o.m[k]=/^a\d+$/.test(k)?Math.max(1,Math.ceil(o.m[k]*0.67)):Math.max(1,Math.ceil(o.m[k]*0.75));}
    if(o.s)o.s=Math.ceil(o.s*0.75);
    return o;};
  for(const kind in HELL_GEAR)for(const lv in HELL_GEAR[kind])HELL_GEAR[kind][lv]=sc(HELL_GEAR[kind][lv]);
  for(const u of HUPG){const f=u.cost;u.cost=lv=>{const r=f(lv);return (r&&r.m)?sc(r):r;};}
  for(const it of HITEMS){const f=it.cost;it.cost=lv=>sc(f(lv));}
  for(const it of HCONS)it.cost=sc(it.cost);
  for(const r of RELICS)if(r.cost)r.cost=sc(r.cost);
  for(const p of PERKS)p.base=Math.round(p.base*0.7);
  for(const r of RITUALS)r.s=Math.round(r.s*0.75);
}
/* цены v19: кузницы чуть дешевле (−12%), буры и аптечки — заметно дешевле */
function applyBalance19(){
  if(applyBalance19.done)return;applyBalance19.done=true;
  const k=0.88,r=(v)=>v>=1000?Math.round(v*k/100)*100:Math.round(v*k);
  for(const L of [PICKS,SWORDS,ARMORS,GUNS])for(const it of L){if(it.cost)it.cost=r(it.cost);if(it.packCost)it.packCost=r(it.packCost);}
  for(const A of [DIG_SPEED_COSTS,TORCH_COSTS,FALL_COSTS,BARR_PACK_COST,BARR_UP_COST,DRILL_LVL_COST])for(let i=0;i<A.length;i++)A[i]=r(A[i]);
  for(let i=0;i<DRILL_PACK_COST.length;i++)DRILL_PACK_COST[i]=Math.max(100,Math.round(DRILL_PACK_COST[i]*0.45/50)*50);
  POTION_COST=80;
  const sc=(c)=>{if(!c)return c;const o=JSON.parse(JSON.stringify(c));if(o.c)o.c=r(o.c);return o;};
  for(const kind in HELL_GEAR)for(const lv in HELL_GEAR[kind])HELL_GEAR[kind][lv]=sc(HELL_GEAR[kind][lv]);
  for(const u of HUPG){const f=u.cost;u.cost=lv=>sc(f(lv));}
  for(const it of HITEMS){const f=it.cost;it.cost=lv=>sc(f(lv));}
  for(const it of HCONS)it.cost=sc(it.cost);
}
function init(){
  applyBalance15();applyBalance16();applyBalance19();
  {const bd=MOBDEFS.find(d=>d.boss);if(bd&&!bd._b23){bd._b23=1;bd.dmg=Math.round(bd.dmg*1.12);}}
  try{
    resize();
    loadGame();
    ensureControls();
    applySettings();
    partBudget=settings.quality==='low'?120:260;
    G.cam.x=lobbyPlayer.x;G.cam.y=0;
    UI.mainMenu();
    requestAnimationFrame(frame);
    setTimeout(()=>{try{resize();ensureControls();updateJoyBase();}catch(e){}},80);
    setTimeout(()=>{try{resize();ensureControls();updateJoyBase();}catch(e){}},300);
    try{checkSaveInUrl();}catch(e){}
  }catch(e){
    try{document.body.innerHTML='<div style="color:#fff;padding:20px;font-family:sans-serif">Ошибка запуска: '+e.message+'</div>';}catch(e2){}
  }
}
window.addEventListener('load',()=>{setTimeout(init,30);});
if(document.readyState==='complete')setTimeout(init,30);

['pointerdown','touchstart','keydown'].forEach(ev=>{
  window.addEventListener(ev,function once(){
    AU.init();AU.resume();
    window.removeEventListener(ev,once);
  },{once:true});
});
