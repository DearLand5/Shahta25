'use strict';
/* ============================================================
   SETTINGS
   ============================================================ */
const settings={
  sfx:0.6,music:0.5,vibrate:true,quality:'high',
  regen:true,
  regenSpeed:1,          /* ← новое: множитель скорости восстановления (0.25–4) */
  oreDensity:1,          /* ← новое: множитель плотности руды (0.25–3) */
  mobRate:1,             /* множитель частоты появления мобов (0–3) */
  waterAmount:1,         /* сколько воды (озёра, лужи, родники) — 0…3 */
  lavaAmount:1,          /* сколько лавы (озёра, капли) — 0…3 */
  cheatsUnlocked:false,
  controls:null,
  controlsCustomized:false,
  minimap:true,          /* мини-карта в шахте */
  outline:true,          /* мультяшный контур моделей */
  minimapSize:1,         /* 0 — маленькая, 1 — средняя, 2 — большая */
  autoSave:true,         /* автосохранение в браузер */
  simpleOre:false,       /* упрощённая отрисовка руды, как в ранних версиях */
  hideHelmet:false,      /* скрыть шлем брони — видна голова персонажа */
  autoSaveInt:30,        /* интервал автосохранения, с */
  qv:2
};
const SETTINGS_DEFAULTS=JSON.parse(JSON.stringify(settings));
/* Скорость копания: ограниченное число уровней (раньше росла бесконечно).
   Каждый уровень даёт +0.45 к множителю; на максимуме ×6.4 — с кирками VI
   даже обсидиан и ядра Бездны копаются почти мгновенно. */
const DIG_SPEED_MAX=12;
const DIG_SPEED_COSTS=[400,760,1450,2750,5200,9900,18800,35700,67900,129000,245000,465000];
const DIG_SPEED_HMAX=20;
const DIG_SPEED_LMAX=30;   /* уровни 21–30 — Кузница Зари (61-lilac-forge) */
function digSpeedMult(lv){lv=lv|0;return lv<=DIG_SPEED_MAX?1+0.45*Math.max(0,lv):6.4+0.5*Math.min(lv-DIG_SPEED_MAX,DIG_SPEED_HMAX-DIG_SPEED_MAX)+0.6*Math.max(0,Math.min(lv,DIG_SPEED_LMAX)-DIG_SPEED_HMAX);}
function applySettings(){
  AU.setVol(settings.sfx);
  AU.setMusicVol(typeof settings.music==='number'?settings.music:0.5);
  resize();
}
function vib(ms){
  if(!settings.vibrate)return;
  try{if(navigator.vibrate)navigator.vibrate(ms);}catch(e){}
}

/* ============================================================
   УПРАВЛЕНИЕ — раскладки кнопок
   ============================================================ */
function getDefaultControls(){
  const W=view.W||360, H=view.H||640;
  const sc=Math.min(1.5,Math.max(0.8,view.scale||1));
  const pad=26,big=68,med=42,sm=36,gap=12;
  const joyPad=94,joyR=64;
  const jr=big*sc, mr=med*sc;
  const jcx=W-pad-jr, jcy=H-pad-jr;
  const shootX=jcx, shootY=jcy-jr-mr-gap;
  const placeX=jcx-2*mr-gap, placeY=shootY;          /* рядом с «Стрелять», не на джойстике */
  /* на альбомном экране рюкзак встаёт в ряд с «Ставить» и «Стрелять»,
     иначе он уезжает наверх под мини-карту */
  const land=W>H*1.15;
  const itemsY=land?shootY:shootY-mr-sm*sc-gap;
  const itemsX=land?placeX-mr-sm*sc-gap:jcx;
  /* быстрые слоты: на вертикальном экране — столбик у правого края над рюкзаком,
     на альбомном — ряд над «Ставить»/«Стрелять»; точка — центр слота 1 */
  const qr=24*sc,qs=2*qr+10;
  const qX=land?jcx-3*qs:W-10-qr;
  const qY=land?shootY-mr-14-qr:itemsY-sm*sc-12-qr-3*qs;
  return {
    joy:    {cx:joyPad/W,  cy:(H-joyPad-30)/H, r:joyR, a:0.55},
    jump:   {cx:jcx/W,     cy:jcy/H,           r:big,  a:1.00},
    place:  {cx:placeX/W,  cy:placeY/H,        r:med,  a:1.00},
    shoot:  {cx:shootX/W,  cy:shootY/H,        r:med,  a:1.00},
    items:  {cx:itemsX/W,  cy:itemsY/H,        r:sm,   a:0.90},
    qbar:   {cx:qX/W,      cy:qY/H,            r:24,   a:0.92},
    pause:  {cx:(W-30)/W,  cy:30/H,            r:22,   a:0.85}
  };
}
function ensureControls(){
  if(!settings.controls || typeof settings.controls!=='object'){
    settings.controls=getDefaultControls();
    return;
  }
  const def=getDefaultControls();
  for(const k in def){
    if(!settings.controls[k] || typeof settings.controls[k]!=='object'){
      settings.controls[k]=Object.assign({},def[k]);
    } else {
      const c=settings.controls[k];
      if(typeof c.cx!=='number')c.cx=def[k].cx;
      if(typeof c.cy!=='number')c.cy=def[k].cy;
      if(typeof c.r!=='number')c.r=def[k].r;
      if(typeof c.a!=='number')c.a=def[k].a;
    }
  }
}
function getControlRadius(r){
  return r*Math.min(1.5,Math.max(0.8,view.scale||1));
}
function getBtnRect(key){
  ensureControls();
  const c=settings.controls[key];
  if(!c)return {x:0,y:0,r:0,a:1};
  return {
    x:c.cx*view.W,
    y:c.cy*view.H,
    r:getControlRadius(c.r),
    a:c.a
  };
}
const CONTROL_LABELS={
  joy:'Джойстик',
  jump:'Прыжок',
  place:'Ставить',
  shoot:'Стрелять',
  items:'Предметы',
  qbar:'Слоты',
  pause:'Пауза'
};
const CONTROL_ORDER=['joy','jump','place','shoot','items','qbar','pause'];
