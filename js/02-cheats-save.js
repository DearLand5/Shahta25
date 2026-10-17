'use strict';
/* ============================================================
   ЧИТЫ
   ============================================================ */
const CHEAT_CODE='DIGDEEP';
const cheats={
  god:false,infMoney:false,instantDig:false,noFall:false,
  superSpeed:false,superJump:false,noclip:false,flyMode:false,
  megaLight:false,showDebug:false
};

/* ============================================================
   SAVE
   ============================================================ */
/* ключи сохранения текущей сессии. Сессия 1 использует прежние ключи, поэтому
   старый прогресс автоматически становится первой сессией. */
let SAVE_KEY='deep_hope_v1';
let SAVE_KEY_M='deep_hope_manual';       /* ручной слот */
const SET_KEY='deep_hope_settings';      /* настройки хранятся отдельно от прогресса и общие для всех сессий */
const PROF_KEY='deep_hope_profiles';     /* список сессий */
/* ============================================================
   СЕССИИ: несколько независимых игр, у каждой свой прогресс
   ============================================================ */
const Prof={
  data:null,
  keyOf(id){return id===1?'deep_hope_v1':'deep_hope_v1_p'+id;},
  keyMOf(id){return id===1?'deep_hope_manual':'deep_hope_manual_p'+id;},
  load(){
    let d=null;try{d=JSON.parse(localStorage.getItem(PROF_KEY)||'null');}catch(e){d=null;}
    if(!d||typeof d!=='object'||!Array.isArray(d.list)||!d.list.length)d={cur:1,next:2,list:[{id:1,name:'Сессия 1',created:Date.now()}]};
    d.list=d.list.filter(p=>p&&isFinite(p.id)).map(p=>({id:p.id|0,name:String(p.name||('Сессия '+p.id)).slice(0,24),created:p.created||0}));
    if(!d.list.length)d.list=[{id:1,name:'Сессия 1',created:Date.now()}];
    if(!d.list.some(p=>p.id===d.cur))d.cur=d.list[0].id;
    d.next=Math.max(d.next|0,...d.list.map(p=>p.id+1));
    this.data=d;this.apply();
  },
  save(){try{localStorage.setItem(PROF_KEY,JSON.stringify(this.data));}catch(e){}},
  apply(){SAVE_KEY=this.keyOf(this.data.cur);SAVE_KEY_M=this.keyMOf(this.data.cur);},
  cur(){return this.data.list.find(p=>p.id===this.data.cur)||this.data.list[0];},
  add(name){const id=this.data.next++;this.data.list.push({id,name:(name||'Сессия '+id).slice(0,24),created:Date.now()});this.save();return id;},
  rename(id,name){const p=this.data.list.find(q=>q.id===id);if(p&&name&&name.trim()){p.name=name.trim().slice(0,24);this.save();}},
  remove(id){if(this.data.list.length<=1||id===this.data.cur)return false;
    try{localStorage.removeItem(this.keyOf(id));localStorage.removeItem(this.keyMOf(id));}catch(e){}
    this.data.list=this.data.list.filter(p=>p.id!==id);this.save();return true;}
};
const Save={
  available:true,lastErr:'',
  /* ВАЖНО: раньше читалась только версия 1, а писалась версия 2 — сейв писался, но
     при запуске не загружался, а изменение настроек затирало его пустым. */
  read(key){
    try{
      const raw=localStorage.getItem(key||SAVE_KEY);
      if(!raw)return null;
      const d=JSON.parse(raw);
      if(!d||typeof d!=='object')return null;
      if(!(d.v===1||d.v===2))return null;
      return d;
    }catch(e){Save.lastErr=String(e&&e.message||e);return null;}
  },
  /* true — записано. При переполнении хранилища выкидываем «историю раскопок»
     (она нужна только для затягивания породы) и пробуем ещё раз. */
  write(obj,key){
    key=key||SAVE_KEY;
    try{localStorage.setItem(key,JSON.stringify(obj));Save.available=true;Save.lastErr='';return true;}
    catch(e){
      try{
        const o=JSON.parse(JSON.stringify(obj));o.dug=[];
        if(o.dims)for(const k in o.dims)if(o.dims[k])o.dims[k].dug=[];
        localStorage.setItem(key,JSON.stringify(o));Save.available=true;Save.lastErr='';return true;
      }catch(e2){Save.available=false;Save.lastErr=String(e2&&e2.message||e2);return false;}
    }
  },
  wipe(){try{localStorage.removeItem(SAVE_KEY);localStorage.removeItem(SAVE_KEY_M);localStorage.removeItem(SET_KEY);}catch(e){}},
  info(key){try{const d=Save.read(key);const p=d&&d.player||{};return d?{ts:d.ts||0,money:p.money||0,dim:d.dim||0,depth:p.maxDepth||0,hell:!!(p.prog&&p.prog.hellUnlocked),souls:p.souls||0}:null;}catch(e){return null;}}
};
function agoText(ts){
  if(!ts)return 'нет';
  const s=Math.max(0,Math.round((Date.now()-ts)/1000));
  if(s<5)return 'только что';if(s<60)return s+' с назад';if(s<3600)return Math.floor(s/60)+' мин назад';
  if(s<86400)return Math.floor(s/3600)+' ч назад';
  try{return new Date(ts).toLocaleString('ru-RU',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});}catch(e){return Math.floor(s/86400)+' дн назад';}
}

const BSAVE_MAGIC='DH1';
const BSAVE_VERSION=2;
function b64encode(str){
  const bytes=new TextEncoder().encode(str);
  let bin='';
  for(let i=0;i<bytes.length;i++)bin+=String.fromCharCode(bytes[i]);
  return btoa(bin);
}
function b64decode(b64){
  const bin=atob(b64);
  const bytes=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}
function csHash(str){
  let h=5381;
  for(let i=0;i<str.length;i++)h=((h<<5)+h+str.charCodeAt(i))|0;
  return (h>>>0).toString(36);
}
function encodeBufferSave(){
  const payload=JSON.stringify(buildSaveData());
  return BSAVE_MAGIC+'|'+BSAVE_VERSION+'|'+csHash(payload)+'|'+b64encode(payload);
}
/* код сохранения можно вставить как есть или ссылкой вида …#save=КОД / …?save=КОД */
function extractSaveCode(raw){
  let x=String(raw||'').trim();if(!x)return '';
  const m=x.match(/[#?&]save=([^&#\s]+)/);
  if(m){try{x=decodeURIComponent(m[1]);}catch(e){x=m[1];}}
  return x.trim();
}
function saveLink(){
  let base='';try{base=String(location.href).split('#')[0].split('?')[0];}catch(e){}
  return (base||'shahta.html')+'#save='+encodeURIComponent(encodeBufferSave());
}
function checkSaveInUrl(){
  let h='';try{h=String(location.hash||'')+String(location.search||'');}catch(e){return;}
  const code=extractSaveCode(h);if(!code||h.indexOf('save=')<0)return;
  setTimeout(()=>{
    let ok=false;try{ok=window.confirm('В ссылке есть сохранение «Шахты». Загрузить его? Текущий прогресс будет заменён.');}catch(e){}
    try{history.replaceState(null,'',String(location.href).split('#')[0].split('?')[0]);}catch(e){}
    if(!ok)return;
    try{const data=decodeBufferSave(code);if(!applySaveData(data))throw new Error('Не удалось применить');ensureControls();applySettings();writeSave(false);UI.toast('✅ Сохранение из ссылки загружено');UI.mainMenu();}
    catch(e){UI.toast('❌ Сейв из ссылки: '+e.message);}
  },600);
}
function decodeBufferSave(raw){
  const code=String(raw).replace(/\s+/g,'');
  if(!code)throw new Error('Пустой код');
  const parts=code.split('|');
  if(parts.length!==4)throw new Error('Неверная структура кода');
  if(parts[0]!==BSAVE_MAGIC)throw new Error('Это не сейв этой игры');
  if(parseInt(parts[1],10)>BSAVE_VERSION)throw new Error('Сейв от более новой версии');
  let payload;
  try{payload=b64decode(parts[3]);}catch(e){throw new Error('Повреждённый код');}
  if(csHash(payload)!==parts[2])throw new Error('Контрольная сумма не совпала');
  let d;
  try{d=JSON.parse(payload);}catch(e){throw new Error('Повреждённые данные');}
  if(!d||typeof d!=='object')throw new Error('Неверный тип данных');
  return d;
}
function copyText(text){
  if(navigator.clipboard&&navigator.clipboard.writeText){
    return navigator.clipboard.writeText(text).catch(()=>legacyCopy(text));
  }
  return Promise.resolve(legacyCopy(text));
}
function legacyCopy(text){
  const ta=document.createElement('textarea');
  ta.value=text;
  ta.style.position='fixed';ta.style.top='0';ta.style.left='0';ta.style.opacity='0';
  document.body.appendChild(ta);
  ta.focus();ta.select();
  try{ta.setSelectionRange(0,text.length);}catch(e){}
  let ok=false;
  try{ok=document.execCommand('copy');}catch(e){}
  document.body.removeChild(ta);
  if(!ok)throw new Error('Копирование недоступно');
}

/* состояние ОДНОГО мира (у каждого измерения своё) */
function packWorldData(){
  const tileModsArr=[];
  for(const [k,t] of tileMods){
    const idx=k.indexOf(',');
    tileModsArr.push([+k.slice(0,idx), +k.slice(idx+1), t]);
  }
  const now=G.time;
  const dugArr=[];
  let dcount=0;
  for(const [k,t] of dugTiles){
    if(dcount++>=25000)break;
    const idx=k.indexOf(',');
    dugArr.push([+k.slice(0,idx), +k.slice(idx+1), Math.round(Math.max(0,now-t)*10)/10]);
  }
  return {
    seed:G.seed,oreEpoch:G.oreEpoch||0,chests:Array.from(openedChests),
    placed:Array.from(placedLadders),
    barr:Array.from(barricades,([k,b])=>[k,b.lvl,Math.round(b.hp)]),
    tileMods:tileModsArr,dug:dugArr,wf:JSON.parse(JSON.stringify(G.wf||{})),
    ...(G.dim===2?{gv:LILAC_GV}:{})
  };
}
/* версия генератора Лиловых небес: мир, выкопанный старым генератором, создаётся заново */
const LILAC_GV=2;
function applyWorldData(d){
  d=d||{};
  if(G.dim===2&&d.gv!==LILAC_GV)d={};
  G.seed=(typeof d.seed==='number')?(d.seed|0):Math.floor(Math.random()*100000);
  G.oreEpoch=(typeof d.oreEpoch==='number')?(d.oreEpoch|0):0;
  G.wf=(d.wf&&typeof d.wf==='object')?d.wf:{};
  openedChests.clear();if(Array.isArray(d.chests))for(const k of d.chests)if(typeof k==='string')openedChests.add(k);
  barricades.clear();
  if(Array.isArray(d.barr)){
    for(const e of d.barr){
      if(!Array.isArray(e)||typeof e[0]!=='string')continue;
      const lv=clamp(Math.floor(e[1]||1),1,BARR.length),mx=BARR[lv-1].hp;
      barricades.set(e[0],{lvl:lv,hp:clamp(+e[2]||mx,1,mx),max:mx,hitT:-9});
    }
  }
  placedLadders.clear();
  if(Array.isArray(d.placed))for(const s2 of d.placed)if(typeof s2==='string')placedLadders.add(s2);
  tileMods.clear();tileModsByChunk.clear();
  if(Array.isArray(d.tileMods)){
    for(const entry of d.tileMods){
      if(Array.isArray(entry)&&entry.length===3){
        const tx=entry[0]|0,ty=entry[1]|0,t=entry[2]|0;
        if(tx>=0&&ty>=0&&tx<MW)recordTileMod(tx,ty,t);
      }
    }
  }
  dugTiles.clear();
  if(Array.isArray(d.dug)){
    for(const e of d.dug){
      if(!Array.isArray(e)||e.length<3)continue;
      const tx=e[0]|0,ty=e[1]|0,age=+e[2]||0;
      if(tx<0||ty<0||tx>=MW)continue;
      dugTiles.set(tx+','+ty,G.time-age);
    }
  }else{
    for(const [k,t] of tileMods){if(t===T_AIR)dugTiles.set(k,G.time-rnd(0,REGEN.delay*2));}
  }
  try{chunks.clear();}catch(e){}
}
/* миры неактивных измерений (упакованы) */
const DIMWORLD={};
function switchDimension(nd){
  if(nd===G.dim)return;
  DIMWORLD[G.dim]=packWorldData();
  const w=DIMWORLD[nd];delete DIMWORLD[nd];
  G.dim=nd;
  applyWorldData(w||{});           /* нет мира — создаётся новый со своим сидом */
  buildings=BUILDINGS[nd];LOBBY_W=LOBBY_WS[nd];G.resumeMine=null;
  mobs.length=0;projectiles.length=0;beams.length=0;grapple=null;drills.length=0;
  G.scene='lobby';G.mineActive=false;
  lobbyPlayer.x=buildings[buildings.length-1].x-150;lobbyPlayer.y=0;lobbyPlayer.vy=0;
  G.cam.x=lobbyPlayer.x;G.cam.y=0;
  Music.lastPick=0;
  saveGame();
}
function buildSaveData(){
  const w=packWorldData();
  const dims={};for(const k in DIMWORLD)dims[k]=DIMWORLD[k];
  return Object.assign(w,{
    v:2,dim:G.dim,dims:dims,settings:settings,
    player:{
      money:player.money,hp:player.hp,maxHp:player.maxHp,
      pickLvl:player.pickLvl,digSpeed:player.digSpeed,digSpeedLvl:player.digSpeedLvl||0,
      digRadius:player.digRadius,swordLvl:player.swordLvl,armorLvl:player.armorLvl,
      slots:player.slots,maxDepth:player.maxDepth,inv:player.inv,
      ladders:player.ladders,drills:player.drills,drillLvl:player.drillLvl,drillBought:player.drillBought,gunLvl:player.gunLvl,gunAmmo:player.gunAmmo,
      barricades:player.barricades,barricadeLvl:player.barricadeLvl,barricadeBought:player.barricadeBought,
      placeItem:G.placeItem,shootItem:G.shootItem,qslots:qsList().slice(),
      grappleUnlocked:player.grappleUnlocked,
      grappleAmmo:player.grappleAmmo,torchLvl:player.torchLvl,
      potions:player.potions,fallProtLvl:player.fallProtLvl,
      prog:JSON.parse(JSON.stringify(player.prog||{})),
      souls:player.souls||0,perks:JSON.parse(JSON.stringify(player.perks||{})),icePotions:player.icePotions||0,gasMask:!!player.gasMask,
      contracts:JSON.parse(JSON.stringify(player.contracts||null)),
      stackLvl:player.stackLvl||0,mats:JSON.parse(JSON.stringify(player.mats||{})),
      furn:(()=>{const F=JSON.parse(JSON.stringify(furn()));F.ts=Date.now();return F;})(),
      lfurn:(()=>{const F=JSON.parse(JSON.stringify(lstill()));F.ts=Date.now();return F;})(),
      lcontracts:JSON.parse(JSON.stringify(player.lcontracts||null)),
      hitems:JSON.parse(JSON.stringify(player.hitems||{})),relics:JSON.parse(JSON.stringify(player.relics||{})),relEq:(player.relEq||[]).slice(),
      rit:JSON.parse(JSON.stringify(player.rit||{})),altarXp:player.altarXp||0,soulBuy:player.soulBuy||0,wingT:player.wingT||0,
      stats:JSON.parse(JSON.stringify(player.stats||{})),bestiary:JSON.parse(JSON.stringify(player.bestiary||{})),
      crates:JSON.parse(JSON.stringify(player.crates||[])),crateSeq:player.crateSeq||0,
      sorter:(()=>{const S=bot();return {owned:!!S.owned,placed:!!S.placed,input:S.input||null,moved:S.moved||0,spdLv:S.spdLv|0,capLv:S.capLv|0,
        units:S.units.map(u=>({id:u.id,name:u.name,skin:u.skin,placed:!!u.placed,x:Math.round(u.x||0),face:u.face||1,moved:u.moved|0,carry:u.carry?JSON.parse(JSON.stringify(u.carry)):null}))};})()
    },
    lobbyX:lobbyPlayer.x,
    mine:(G.scene==='mine'&&!(player.hp<=0))?{x:Math.round(player.x),y:Math.round(player.y),dim:G.dim}:(G.resumeMine?{x:Math.round(G.resumeMine.x),y:Math.round(G.resumeMine.y),dim:G.resumeMine.dim}:null)
  });
}
function applySaveData(d){
  if(!d||typeof d!=='object')return false;
  try{
    G.dim=(d.dim===1||d.dim===2)?d.dim:0;
    for(const k in DIMWORLD)delete DIMWORLD[k];
    if(d.dims&&typeof d.dims==='object'){for(const k in d.dims){if(+k!==G.dim&&d.dims[k])DIMWORLD[k]=d.dims[k];}}
    buildings=BUILDINGS[G.dim];LOBBY_W=LOBBY_WS[G.dim];
    if(d.settings){
      for(const k in settings){
        const v=d.settings[k];
        if(v===undefined)continue;
        if(k==='controls'){
          if(v && typeof v==='object'){
            settings.controls=JSON.parse(JSON.stringify(v));
          }
        } else if(typeof v!=='object'){
          settings[k]=v;
        }
      }
    }
    if(!settings.controlsCustomized)settings.controls=null;
    /* старая авто-«Низкая графика» включалась сама из-за любого лага — один раз возвращаем «Высокую» */
    if(!(d.settings&&d.settings.qv>=2)){if(settings.quality==='low')settings.quality='high';settings.qv=2;}
    if(d.player){
      const p=d.player;
      player.money=p.money||0;
      player.pickLvl=clamp(p.pickLvl||1,1,10);
      {
        /* старые сохранения: уровней могло быть сколько угодно — лишнее возвращаем монетами */
        const oldLvl=Math.max(0,Math.floor(p.digSpeedLvl||0));
        player.digSpeedLvl=Math.min(oldLvl,DIG_SPEED_HMAX);
        for(let i=DIG_SPEED_HMAX;i<oldLvl;i++)player.money+=Math.floor(400*Math.pow(1.85,i));
        player.digSpeed=digSpeedMult(player.digSpeedLvl);
      }
      player.digRadius=clamp(p.digRadius||0,0,3);
      player.swordLvl=clamp(p.swordLvl||1,1,10);
      player.armorLvl=clamp(p.armorLvl||1,1,10);
      player.slots=clamp(p.slots||8,8,40);
      player.stackLvl=clamp(Math.floor(p.stackLvl||0),0,16);
      player.maxDepth=p.maxDepth||0;
      player.ladders=Math.max(0,Math.floor(p.ladders==null?20:p.ladders));
      player.drillLvl=clamp(p.drillLvl||1,1,10);
      /* бур теперь нужно купить; старые сохранения: куплен, если уже прокачан */
      player.drillBought=(p.drillBought!==undefined)?!!p.drillBought:(player.drillLvl>1);
      player.barricadeBought=!!p.barricadeBought;
      player.prog=(p.prog&&typeof p.prog==='object')?p.prog:{};
      player.souls=Math.max(0,Math.floor(p.souls||0));
      player.perks=(p.perks&&typeof p.perks==='object')?p.perks:{};
      player.icePotions=Math.max(0,Math.floor(p.icePotions||0));
      player.gasMask=!!p.gasMask;
      player.contracts=(p.contracts&&Array.isArray(p.contracts.list))?p.contracts:null;
      const obj=(v)=>(v&&typeof v==='object'&&!Array.isArray(v))?v:{};
      player.mats={};for(const k in obj(p.mats))if(MATS[k]&&p.mats[k]>0)player.mats[k]=Math.floor(p.mats[k]);
      player.hitems=obj(p.hitems);player.relics=obj(p.relics);player.relEq=Array.isArray(p.relEq)?p.relEq.filter(x=>RELICS.some(r=>r.id===x)):[];
      player.rit=obj(p.rit);player.altarXp=Math.max(0,p.altarXp||0);player.soulBuy=Math.max(0,p.soulBuy||0);player.wingT=p.wingT||0;
      player.stats=obj(p.stats);player.bestiary=obj(p.bestiary);
      player.crates=Array.isArray(p.crates)?p.crates.filter(c=>c&&typeof c==='object').map(c=>({id:String(c.id||('c'+Math.random().toString(36).slice(2))),name:String(c.name||'Ящик').slice(0,24),inv:obj(c.inv),mats:obj(c.mats)})):[];player.crateSeq=Math.max(0,p.crateSeq|0);
      {const q=obj(p.sorter);player.sorter={owned:!!q.owned,placed:!!q.placed,x:+q.x||300,input:typeof q.input==='string'?q.input:null,face:q.face||1,moved:q.moved|0,spdLv:clamp(q.spdLv|0,0,5),capLv:clamp(q.capLv|0,0,5),carry:(q.carry&&typeof q.carry==='object')?q.carry:null};
        if(Array.isArray(q.units))player.sorter.units=q.units.slice(0,BOT_MAX).filter(u=>u&&typeof u==='object').map((u,i)=>({id:typeof u.id==='string'?u.id:'b'+(i+1),name:String(u.name||BOT_NAMES[i]||'Робот').slice(0,16),skin:botSkin(u.skin).id,placed:!!u.placed,x:+u.x||300,face:u.face||1,moved:u.moved|0,carry:(u.carry&&typeof u.carry==='object')?u.carry:null,job:null}));
        bot();}
      if(p.gasMask&&!player.hitems.resp)player.hitems.resp=1;
      if(p.furn&&Array.isArray(p.furn.q)){player.furn={q:p.furn.q.filter(j=>SMELT_BY[j.r]&&j.n>0),lvl:clamp(p.furn.lvl|0,0,3),ts:p.furn.ts||Date.now()};
        const el=clamp((Date.now()-(p.furn.ts||Date.now()))/1000,0,4*3600);if(el>0)updateFurnace(el,true);}else player.furn={q:[],lvl:0,ts:Date.now()};
      /* Перегонный куб Лиловых небес (в старых сейвах нет — пустой) */
      if(p.lfurn&&Array.isArray(p.lfurn.q)){player.lfurn={q:p.lfurn.q.filter(j=>SMELT_BY[j.r]&&j.n>0),lvl:clamp(p.lfurn.lvl|0,0,3),ts:p.lfurn.ts||Date.now()};
        const el=clamp((Date.now()-(p.lfurn.ts||Date.now()))/1000,0,4*3600);if(el>0)updateStill(el,true);}else player.lfurn={q:[],lvl:0,ts:Date.now()};
      player.lcontracts=(p.lcontracts&&Array.isArray(p.lcontracts.list))?p.lcontracts:null;
      player.barricadeLvl=clamp(Math.floor(p.barricadeLvl||1),1,7);
      player.barricades=player.barricadeBought?Math.max(0,Math.floor(p.barricades||0)):0;
      player.drills=player.drillBought?Math.max(0,Math.floor(p.drills||0)):0;
      player.gunLvl=clamp(Math.floor(p.gunLvl||0),0,GUNS.length);
      player.gunAmmo=Math.max(0,Math.floor(p.gunAmmo||0));
      if(!player.gunLvl&&p.guns&&typeof p.guns==='object'){       /* старый формат: оружие по отдельности */
        for(const g of GUNS){const o=p.guns[g.id];if(o&&typeof o==='object'){player.gunLvl=Math.max(player.gunLvl,g.lv);player.gunAmmo+=Math.max(0,Math.floor(o.ammo||0));}}
      }
      player.grappleUnlocked=!!p.grappleUnlocked;
      player.grappleAmmo=Math.max(0,Math.floor(p.grappleAmmo||0));
      player.torchLvl=clamp(p.torchLvl||0,0,8);
      player.potions=Math.max(0,Math.floor(p.potions||0));
      player.fallProtLvl=clamp(p.fallProtLvl||0,0,3);
      if(p.inv&&typeof p.inv==='object'){
        player.inv={};
        for(const k in p.inv){
          const id=parseInt(k,10);
          if(ORES[id]&&typeof p.inv[k]==='number'&&p.inv[k]>0)player.inv[id]=Math.floor(p.inv[k]);
        }
      }
      recomputeStats();
      player.hp=player.maxHp;
    }
    if(typeof d.placeItem==='string')G.placeItem=d.placeItem;
    if(typeof d.shootItem==='string')G.shootItem=d.shootItem;
    G.qslots=qsLoad(d.qslots);                 /* старые сейвы без слотов — слоты по умолчанию */
    applyWorldData(d);

    if(typeof d.lobbyX==='number')lobbyPlayer.x=clamp(d.lobbyX,60,LOBBY_W-60);
    G.resumeMine=(d.mine&&typeof d.mine.x==='number'&&typeof d.mine.y==='number'&&d.mine.dim===G.dim&&!(G.dim===2&&d.gv!==LILAC_GV))?{x:d.mine.x,y:d.mine.y,dim:d.mine.dim,live:false}:null;
    return true;
  }catch(e){return false;}
}
