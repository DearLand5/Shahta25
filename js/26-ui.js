'use strict';
/* ============================================================
   UI
   ============================================================ */
const uiRoot=document.getElementById('ui');
uiRoot.addEventListener('pointerdown',()=>{
  if(UI.modal && (Input.ptrs.size||Input.joy.active||Input.digActive))resetAllInputs();
},{capture:true,passive:true});

const MenuScroll=(()=>{
  const SLOP=9;
  let g=null, inertiaRaf=0, swallowUntil=0;

  function stopInertia(){if(inertiaRaf){cancelAnimationFrame(inertiaRaf);inertiaRaf=0;}}
  function canScroll(el,d){
    const max=el.scrollHeight-el.clientHeight;
    if(max<=1)return false;
    if(d>0)return el.scrollTop<max-0.5;
    if(d<0)return el.scrollTop>0.5;
    return true;
  }
  function pickScroller(target,d){
    let el=target;
    while(el&&el!==uiRoot&&el!==document.body){
      if(el.nodeType===1&&(el.classList.contains('scroll')||el.classList.contains('panel'))&&canScroll(el,d))return el;
      el=el.parentElement;
    }
    return null;
  }
  function onDown(e){
    try{
      if(e.pointerType==='mouse')return;
      if(UI.modal==='controlsEditor')return;
      const t=e.target;
      if(!t||!t.closest||!t.closest('.panel'))return;
      if(t.closest('input,textarea,select'))return;
      stopInertia();
      g={id:e.pointerId,target:t,y0:e.clientY,lastY:e.clientY,lastT:e.timeStamp,v:0,drag:false,sc:null};
    }catch(_){g=null;}
  }
  function onMove(e){
    if(!g||e.pointerId!==g.id)return;
    try{
      const y=e.clientY;
      if(!g.drag){
        const total=y-g.y0;
        if(Math.abs(total)<SLOP)return;
        const sc=pickScroller(g.target,-total);
        if(!sc){g=null;return;}
        g.sc=sc;g.drag=true;
      }
      const dy=y-g.lastY;
      const dt=Math.max(1,e.timeStamp-g.lastT);
      g.sc.scrollTop-=dy;
      g.v=g.v*0.6+(dy/dt)*0.4;
      g.lastY=y;g.lastT=e.timeStamp;
    }catch(_){g=null;}
  }
  function onUp(e){
    if(!g||e.pointerId!==g.id)return;
    const gg=g;g=null;
    if(!gg.drag)return;
    swallowUntil=performance.now()+150;
    if(e.type==='pointercancel')return;
    if(e.timeStamp-gg.lastT>80)return;
    let v=gg.v;
    if(Math.abs(v)<0.12)return;
    const sc=gg.sc;let last=performance.now();
    const step=(now)=>{
      const dt=Math.min(40,now-last);last=now;
      const before=sc.scrollTop;
      sc.scrollTop-=v*dt;
      v*=Math.pow(0.94,dt/16);
      if(Math.abs(v)<0.02||!sc.isConnected||sc.scrollTop===before){inertiaRaf=0;return;}
      inertiaRaf=requestAnimationFrame(step);
    };
    inertiaRaf=requestAnimationFrame(step);
  }
  uiRoot.addEventListener('pointerdown',onDown,{capture:true,passive:true});
  window.addEventListener('pointermove',onMove,{passive:true});
  window.addEventListener('pointerup',onUp,{passive:true});
  window.addEventListener('pointercancel',onUp,{passive:true});
  uiRoot.addEventListener('click',e=>{
    if(performance.now()<swallowUntil){swallowUntil=0;e.stopPropagation();e.preventDefault();}
  },true);
  return {stop:stopInertia};
})();
/* ---------- эмблема и надпись главного меню (рисованные, без эмодзи) ---------- */
const LOGO_EMBLEM=`<svg class="emblem" viewBox="0 0 120 128" aria-hidden="true">
  <defs>
    <linearGradient id="lgRing" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6d48a"/><stop offset=".5" stop-color="#c8862f"/><stop offset="1" stop-color="#6e4214"/></linearGradient>
    <radialGradient id="lgGem" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#fffbe6"/><stop offset=".35" stop-color="#9ff3ff"/><stop offset="1" stop-color="#2a8fb8"/></radialGradient>
    <radialGradient id="lgGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#9ff3ff" stop-opacity=".75"/><stop offset="1" stop-color="#9ff3ff" stop-opacity="0"/></radialGradient>
    <linearGradient id="lgSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#18203a"/><stop offset="1" stop-color="#2e2a3e"/></linearGradient>
    <clipPath id="lgIn"><circle cx="60" cy="68" r="47"/></clipPath>
  </defs>
  <circle cx="60" cy="68" r="56" fill="#1a120b"/>
  <circle cx="60" cy="68" r="54" fill="url(#lgRing)"/>
  <circle cx="60" cy="68" r="48.5" fill="#20160e"/>
  <g clip-path="url(#lgIn)">
    <rect x="0" y="0" width="120" height="44" fill="url(#lgSky)"/>
    <circle cx="82" cy="32" r="5" fill="#f3ecd2" opacity=".9"/>
    <path d="M6 44 L24 34 L36 40 L50 30 L66 41 L80 35 L96 42 L114 36 L120 44 Z" fill="#3a3550"/>
    <path d="M0 44 H120 V50 H0 Z" fill="#5d8a3a"/>
    <path d="M0 49 Q30 46 60 50 T120 49 V66 Q90 63 60 67 T0 65 Z" fill="#7a5233"/>
    <path d="M0 65 Q30 62 60 67 T120 66 V84 Q88 80 60 85 T0 82 Z" fill="#5c6068"/>
    <path d="M0 82 Q32 79 60 85 T120 84 V100 Q90 96 60 101 T0 98 Z" fill="#4a3478"/>
    <path d="M0 98 Q30 95 60 101 T120 100 V130 H0 Z" fill="#8a2a12"/>
    <path d="M10 108 q8-4 14 1 M88 112 q9-5 16 0 M40 118 q10-3 18 2" stroke="#ff9a3a" stroke-width="2" fill="none" opacity=".8"/>
    <g fill="#c9a9ff" opacity=".85"><path d="M22 90 l3-6 3 6 -3 3z"/><path d="M92 92 l2.5-5 2.5 5 -2.5 2.5z"/></g>
    <g fill="#9aa0a8" opacity=".55"><circle cx="20" cy="74" r="2"/><circle cx="96" cy="73" r="1.6"/><circle cx="84" cy="78" r="1.2"/></g>
    <rect x="53" y="44" width="14" height="62" fill="#0e0a07"/>
    <g stroke="#b07a40" stroke-width="2"><path d="M55 44 V104 M65 44 V104"/></g>
    <g stroke="#8a5a2a" stroke-width="2"><path d="M55 52 H65 M55 60 H65 M55 68 H65 M55 76 H65 M55 84 H65 M55 92 H65"/></g>
    <circle cx="60" cy="108" r="16" fill="url(#lgGlow)"/>
    <path d="M60 99 L68 107 L60 118 L52 107 Z" fill="url(#lgGem)" stroke="#e8fbff" stroke-width="1"/>
    <path d="M52 107 H68 M60 99 L57 107 L60 118 M60 99 L63 107 L60 118" stroke="#2a8fb8" stroke-width=".7" fill="none" opacity=".8"/>
  </g>
  <g fill="#3a2a1a">${[0,1,2,3,4,5,6,7].map(i=>{const a=i/8*Math.PI*2+Math.PI/8;return `<circle cx="${(60+Math.cos(a)*51.2).toFixed(1)}" cy="${(68+Math.sin(a)*51.2).toFixed(1)}" r="1.7"/>`;}).join('')}</g>
  <g transform="translate(60 14)">
    <rect x="-3.2" y="0" width="6.4" height="26" rx="2" fill="#8a5a2c" stroke="#2a1608" stroke-width="1.4"/>
    <path d="M-40 6 Q-22 -10 0 -9 Q22 -10 40 6 L36 9 Q20 -1 0 -1 Q-20 -1 -36 9 Z" fill="#c9ccd2" stroke="#24201c" stroke-width="2" stroke-linejoin="round"/>
    <path d="M-34 4 Q-18 -6 0 -6" stroke="#ffffff" stroke-width="1.4" fill="none" opacity=".6"/>
    <rect x="-6" y="-11" width="12" height="11" rx="2" fill="#6b6f78" stroke="#24201c" stroke-width="1.6"/>
  </g>
</svg>`;
const LOGO_WORD=`<svg class="wordmark" viewBox="0 0 380 118" aria-label="Глубины Надежды">
  <defs>
    <linearGradient id="lgTxt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2cc"/><stop offset=".45" stop-color="#f7c35c"/><stop offset=".8" stop-color="#df7e2c"/><stop offset="1" stop-color="#a8461a"/></linearGradient>
  </defs>
  <g font-family="Russo One, Rubik, sans-serif" text-anchor="middle" paint-order="stroke" stroke-linejoin="round">
    <text x="190" y="54" font-size="54" textLength="350" lengthAdjust="spacingAndGlyphs" fill="url(#lgTxt)" stroke="#2a1407" stroke-width="7">ГЛУБИНЫ</text>
    <text x="190" y="104" font-size="40" textLength="250" lengthAdjust="spacingAndGlyphs" fill="url(#lgTxt)" stroke="#2a1407" stroke-width="6">НАДЕЖДЫ</text>
  </g>
  <g fill="#e4a443" stroke="#2a1407" stroke-width="1.5"><path d="M30 90 l8 -6 8 6 -8 6z"/><path d="M334 90 l8 -6 8 6 -8 6z"/></g>
  <path d="M50 90 H52 M328 90 H330" stroke="#e4a443" stroke-width="2"/>
</svg>`;
/* значки кнопок меню (простые линии в цвет текста) */
const ICONS={
  users:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><circle cx="17" cy="9" r="2.8"/><path d="M16.5 14.6c2.6.2 4.4 1.9 5 5"/></svg>',
  gear:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/></svg>',
  disk:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M4 4h12l4 4v12H4z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/></svg>',
  book:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M4 5c3-1.5 5.5-1.5 8 0v15c-2.5-1.5-5-1.5-8 0zM20 5c-3-1.5-5.5-1.5-8 0v15c2.5-1.5 5-1.5 8 0z"/></svg>',
  help:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M9.3 9.4a2.8 2.8 0 0 1 5.4 1c0 1.9-2.7 2.3-2.7 4"/><circle cx="12" cy="17.6" r=".6" fill="currentColor"/></svg>',
  wrench:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 5.5a4 4 0 0 0 5 5l-9 9a2.1 2.1 0 0 1-3-3l9-9a4 4 0 0 0-2-2z"/></svg>',
  play:'<svg class="ic" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l12-7.5z"/></svg>'
};
/* эмодзи в начале заголовков и кнопок делают интерфейс «шаблонным» — убираем их,
   если после этого остаётся текст. Значки в списках предметов (.ico) не трогаем. */
const LEAD_EMOJI=/^\s*(?:[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}][\u{FE0F}\u{200D}\u{1F3FB}-\u{1F3FF}]*)+\s*/u;
function stripLeadEmoji(str){const r=str.replace(LEAD_EMOJI,'');return r.trim()?r:str;}
/* значки монет и душ в тексте окон -- рисованными кружками вместо эмодзи */
const INLINE_IC={'💰':'coin','👻':'soul'};
function inlineIcons(root){
  try{const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),list=[];let n;
    while((n=w.nextNode()))if(/[💰👻]/u.test(n.nodeValue)&&!(n.parentElement&&n.parentElement.closest('textarea,svg')))list.push(n);
    for(const t of list){const frag=document.createDocumentFragment();
      for(const part of t.nodeValue.split(/([💰👻])/u)){if(!part)continue;
        if(INLINE_IC[part]){const i=document.createElement('i');i.className='mi '+INLINE_IC[part]+' inl';frag.appendChild(i);}
        else frag.appendChild(document.createTextNode(part));}
      t.parentNode.replaceChild(frag,t);}
  }catch(e){}
}
function cleanEmoji(root){
  inlineIcons(root);
  try{root.querySelectorAll('h1,h2,h3,.btn,.tabs button,.seg button,.sect,.cheatSection,.setHead b').forEach(el=>{
    const w=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let n;
    while((n=w.nextNode())){if(!n.nodeValue.trim())continue;if(n.parentElement&&n.parentElement.closest('.ico,svg'))break;
      const r=n.nodeValue.replace(LEAD_EMOJI,'');if(r.trim()||el.textContent.trim()!==n.nodeValue.trim())n.nodeValue=r;break;}
  });}catch(e){}
}
const UI={
  modal:null,el:null,
  clear(){if(this.el){try{this.el.remove();}catch(e){}}this.el=null;this.modal=null;},
  close(){SFX.uiBack();this.clear();},
  toast(msg){
    let t=document.getElementById('toastEl');
    if(!t){t=document.createElement('div');t.id='toastEl';t.className='toast';uiRoot.appendChild(t);}
    t.textContent=stripLeadEmoji(String(msg)).replace(/\s?💰/gu,' монет').replace(/\s?👻/gu,' душ');t.classList.add('show');t.classList.toggle('low',!!UI.modal);
    clearTimeout(t._t);
    t._t=setTimeout(()=>t.classList.remove('show'),1800);
  },
  build(cls,html){
    resetAllInputs();
    const name=cls||'generic';
    let keep=null;
    if(this.el && this.modal===name){
      try{
        keep={top:this.el.scrollTop,
          inner:Array.from(this.el.querySelectorAll('.scroll')).map(x=>x.scrollTop)};
      }catch(e){keep=null;}
    }
    const fresh=!this.el;
    this.clear();
    const d=document.createElement('div');
    if(G.dim===2&&typeof lilacSkinHtml==='function')html=lilacSkinHtml(name,html);
    d.className='panel';d.innerHTML=html;cleanEmoji(d);
    if(fresh&&name!=='menu'&&name!=='death')SFX.open();
    uiRoot.appendChild(d);
    this.el=d;this.modal=name;
    if(keep){
      const apply=()=>{
        try{
          d.scrollTop=keep.top;
          d.querySelectorAll('.scroll').forEach((x,i)=>{if(keep.inner[i]!=null)x.scrollTop=keep.inner[i];});
        }catch(e){}
      };
      apply();
      requestAnimationFrame(()=>{if(UI.el===d)apply();});
    }
    return d;
  },
  mainMenu(){
    const dimName=DIM_NAMES[G.dim]||DIM_NAMES[0];
    const d=this.build('menu',`
      <div class="menuWrap"><div class="brand">
      ${LOGO_EMBLEM}${LOGO_WORD}
      <h2 class="sub">${player.prog&&player.prog.hellUnlocked?'Земля надежды · Ад':'Копай · Продавай · Выживай'}</h2>
      <div class="menuStats">
        <span><i class="mi coin"></i>${fmt(player.money)}</span><span><i class="mi depth"></i>рекорд ${fmt(player.maxDepth||0)} м</span>
        ${(player.souls||0)>0||G.dim===1?`<span><i class="mi soul"></i>${fmt(player.souls||0)}</span>`:''}
        <span><i class="mi ${['earth','hell','lilac'][G.dim]||'earth'}"></i>${dimName}</span>
        ${player.prog&&player.prog.key?'<span><i class="mi key"></i>Ключ</span>':''}${player.prog&&player.prog.heart&&!player.prog.hellUnlocked?'<span><i class="mi heart"></i>Сердце</span>':''}
      </div></div><div class="menuActions">
      <button class="btn big" id="mPlay">${canResumeMine()?'Продолжить':'Играть'}<small>${canResumeMine()?'Шахта · '+Math.max(0,Math.floor(G.resumeMine.y/TILE))+' м':G.dim===1?'Лобби Ада':G.dim===2?'Деревня Вечного Рассвета':'Лобби · '+dimName}</small></button>
      <button class="btn alt sessBtn" id="mSess">${ICONS.users}<span>Сессия: <b>${escHtml(Prof.cur().name)}</b></span><small>${Prof.data.list.length>1?'всего '+Prof.data.list.length:'создать ещё'}</small></button>
      <div class="menuGrid">
        <button class="btn alt" id="mSet">${ICONS.gear}Настройки</button>
        <button class="btn alt" id="mSave">${ICONS.disk}Сохранения</button>
        <button class="btn alt" id="mAbout">${ICONS.book}Об игре</button>
        ${settings.cheatsUnlocked?`<button class="btn alt" id="mCheat" style="border-color:#5ea85e">${ICONS.wrench}Тест-панель</button>`:`<button class="btn alt" id="mHow">${ICONS.help}Как играть</button>`}
      </div>
      <div class="ver">Обновление «Владыки Преисподней» · v22</div></div></div>
    `);
    d.classList.add('menuPanel');
    d.querySelector('#mPlay').onclick=()=>{SFX.ui();AU.init();AU.resume();if(canResumeMine()){resumeMine();return;}G.scene='lobby';lobbyPlayer.x=200;UI.close();};
    d.querySelector('#mSave').onclick=()=>{SFX.ui();UI.saves();};
    d.querySelector('#mSess').onclick=()=>{SFX.ui();UI.sessions();};
    d.querySelector('#mSet').onclick=()=>{SFX.ui();UI.settings();};
    d.querySelector('#mAbout').onclick=()=>{SFX.ui();UI.about();};
    if(d.querySelector('#mHow'))d.querySelector('#mHow').onclick=()=>{SFX.ui();UI.about();};
    if(d.querySelector('#mCheat'))d.querySelector('#mCheat').onclick=()=>{SFX.ui();UI.cheats();};
  },
  /* сессии: несколько независимых игр, у каждой свой прогресс; настройки общие */
  sessions(){
    const P=Prof.data,cur=P.cur;
    const rows=P.list.map(p=>{const inf=Save.info(Prof.keyOf(p.id)),me=p.id===cur;
      const ds=inf?`<i class="mi coin"></i> ${fmt(inf.money)} · рекорд ${fmt(inf.depth)} м · ${DIM_NAMES[inf.dim]||DIM_NAMES[0]}${inf.souls?' · 👻 '+fmt(inf.souls):''}<br>сохранено: ${agoText(inf.ts)}`:'новая игра';
      return `<div class="item sessRow${me?' on':''}">
        <div class="ico" style="background:${me?'rgba(255,200,110,.18)':'rgba(255,255,255,.06)'};display:flex;align-items:center;justify-content:center">${ICONS.users}</div>
        <div class="txt"><div class="nm">${escHtml(p.name)}${me?' <span class="tiny" style="color:#ffd08a">· сейчас</span>':''}</div><div class="ds">${ds}</div></div>
        <div class="sessBtns">${me?'':`<button class="btn small" data-sgo="${p.id}">Играть</button>`}
          <button class="btn small alt" data-sren="${p.id}" title="Переименовать">✎</button>
          ${me||P.list.length<=1?'':`<button class="btn small alt" data-sdel="${p.id}" title="Удалить">✕</button>`}</div></div>`;}).join('');
    const d=this.build('sessions',`
      <div class="card" style="max-width:520px;width:96vw">
        <h3>Сессии</h3>
        <p class="tiny" style="margin-bottom:8px">Каждая сессия — отдельная игра со своим прогрессом: деньги, снаряжение, мир, Ад. Настройки и управление общие для всех.</p>
        <div class="scroll" style="max-height:52vh">${rows}</div>
      </div>
      <button class="btn" id="sNew">Новая сессия</button>
      <button class="btn alt" id="sBack">Назад</button>`);
    d.querySelectorAll('[data-sgo]').forEach(b=>b.onclick=()=>{SFX.ui();const id=+b.dataset.sgo;
      if(switchProfile(id)){UI.mainMenu();UI.toast('Сессия: '+Prof.cur().name);}});
    d.querySelectorAll('[data-sren]').forEach(b=>b.onclick=()=>{SFX.ui();UI.sessionName(+b.dataset.sren);});
    d.querySelectorAll('[data-sdel]').forEach(b=>b.onclick=()=>{SFX.ui();const id=+b.dataset.sdel,p=P.list.find(q=>q.id===id);
      const c=UI.build('sessions',`<div class="card" style="max-width:420px;width:94vw;text-align:center"><h3>Удалить сессию?</h3>
        <p class="muted">«${escHtml(p.name)}» и весь её прогресс будут удалены навсегда.</p></div>
        <button class="btn" id="sDelYes" style="background:linear-gradient(#b8463a,#7a2418)">Удалить</button><button class="btn alt" id="sDelNo">Отмена</button>`);
      c.querySelector('#sDelYes').onclick=()=>{Prof.remove(id);SFX.uiBack();UI.toast('Сессия удалена');UI.sessions();};
      c.querySelector('#sDelNo').onclick=()=>{SFX.uiBack();UI.sessions();};});
    d.querySelector('#sNew').onclick=()=>{SFX.ui();UI.sessionName(0);};
    d.querySelector('#sBack').onclick=()=>{SFX.uiBack();UI.mainMenu();};
  },
  /* имя сессии: id=0 — создать новую и сразу начать в ней игру */
  sessionName(id){
    const p=id?Prof.data.list.find(q=>q.id===id):null,def=p?p.name:'Сессия '+Prof.data.next;
    const d=this.build('sessions',`
      <div class="card" style="max-width:420px;width:94vw">
        <h3>${p?'Переименовать сессию':'Новая сессия'}</h3>
        ${p?'':'<p class="tiny" style="margin-bottom:8px">Начнётся новая игра с нуля. Текущая сессия сохранится, к ней можно вернуться в любой момент.</p>'}
        <input id="sName" class="sessInput" maxlength="24" value="${escHtml(def)}" autocomplete="off">
      </div>
      <button class="btn" id="sOk">${p?'Сохранить':'Создать и играть'}</button>
      <button class="btn alt" id="sCancel">Отмена</button>`);
    const inp=d.querySelector('#sName');setTimeout(()=>{try{inp.focus();inp.select();}catch(e){}},60);
    const ok=()=>{const v=(inp.value||'').trim()||def;SFX.ui();
      if(p){Prof.rename(id,v);UI.sessions();}
      else{const nid=Prof.add(v);switchProfile(nid);UI.mainMenu();UI.toast('Новая сессия: '+v);}};
    d.querySelector('#sOk').onclick=ok;inp.onkeydown=(e)=>{if(e.key==='Enter')ok();};
    d.querySelector('#sCancel').onclick=()=>{SFX.uiBack();UI.sessions();};
  },
  about(){
    const d=this.build('about',`
      <div class="card">
        <h3>Об игре</h3>
        <p class="muted">Ты — старатель. Первое измерение — <b>Земля надежды</b>: спускайся в шахту, добывай руду,
          продавай её на бирже, улучшай снаряжение в кузнице.</p>
        <p class="muted" style="margin-top:8px"><b>🔥 Путь в Ад:</b> кирка, меч, броня и огнестрел VI, максимальная скорость копания,
          бур 6 ур. и пушка-крюк (факел, амортизаторы и баррикады — по желанию). Затем найди <b>💜 Сердце Бездны</b> в святилище на глубине 1150–1450 м, победи <b>☠ Пожирателя Бездны</b>
          на арене (2000 м) и забери <b>🗝 Ключ</b>. Портал в лобби откроется за 2 000 000 монет.</p>
        <p class="muted" style="margin-top:8px"><b>👹 Ад:</b> пять биомов, 19 видов адской руды, больше 30 своих мобов с уникальными атаками
          и опасные структуры (сокровищницы с черепами-турелями, ульи, круги призыва, давилки, огненные залы). <b>Жар</b> снижают адская броня,
          ледяные зелья и ритуалы.</p>
        <p class="muted" style="margin-top:8px"><b>🏭 Производство:</b> руда Ада переплавляется в <b>Печи</b> в слитки, сплавы и компоненты
          (плавка идёт и пока ты в шахте). В <b>Кузнице</b> из слитков + монет куются кирки, броня, мечи и огнестрел VII–XI,
          прокачки (копание, бур, баррикады, слоты, стопки, факелы, печь) и адские предметы (плащ, респиратор, ранец, компас).
          Рынок душ покупает руду, слитки и сплавы, но насыщается — продавай разное.</p>
        <p class="muted" style="margin-top:8px"><b>📦 Ящики и сортировщик:</b> ящики из Кузницы Ада ставятся в лобби и в шахте («Ставить»), хранят любые ресурсы,
          переименовываются и видны на мини-карте. Робот-сортировщик (ставится в лобби Ада) сам разносит ресурсы из ящика-приёмника по ящикам с нужными фильтрами.</p>
        <p class="muted" style="margin-top:8px"><b>👻 Алтарь душ:</b> благословения, ритуалы на время, реликвии в слоты, подношения для уровня алтаря.
          <b>🌦 Погода Ада:</b> в каждом биоме свои явления — буря и смерч в Пустошах, кровавый дождь и луна в Копях, кислотный дождь и туман в Топях, ночь душ и ветер мёртвых в Катакомбах, огненный дождь и вспышка ядра в Ядре.</p>
        <p class="muted" style="margin-top:8px"><b>🧱 Особые породы Ада:</b> песок душ (из него выбираются Заблудшие души), костяные шипы, пепельные гейзеры-трамплины,
          наросты плоти (лечат или выпускают тварей), нестабильная сера (взрывается) и корка над лавой (обваливается). Рынок душ покупает и слитки.</p>
        <p class="muted" style="margin-top:8px"><b>🎰 Казино:</b> на Земле — колесо, кости, напёрстки, рулетка, блэкджек, слоты (ставка рудой). В «Котле» — рулетка, блэкджек, кости
          (руда или слитки), а на души — «Три черепа», «Колесо душ» и сделка с демоном.</p>
        <p class="muted" style="margin-top:8px"><b>🎒 Предметы → Ресурсы:</b> что лежит в рюкзаке, сколько слотов занято и вместимость стопки.
          <b>💾 Сохранение:</b> автосохранение (вкл/выкл и частота) и ручное сохранение — в Настройки → Прочее. Выход в меню из шахты запоминает место.</p>
        <p class="muted" style="margin-top:8px"><b>📖 Бестиарий</b> (в паузе): все встреченные враги, статистика и трофеи — 50 убийств
          одного вида дают +15% урона по нему.</p>
        <p class="muted" style="margin-top:8px"><b>⚓ Якоря</b> стоят в каждом биоме обоих измерений и переносят в соседний биом.
          Они отмечены на <b>мини-карте</b> (нажми на неё — развернётся; вкл/выкл в настройках).</p>
        <p class="muted" style="margin-top:8px"><b>Управление:</b> джойстик, прыжок, «Ставить» (лестницы, баррикады, бур),
          «Стрелять» (крюк, аптечки, ледяные зелья, огнестрел), «Предметы» — выбор, «Ставить» в лобби — ящики. <b>Тап</b> по экрану копает блок и задаёт направление.
          Атака мечом — автоматическая.</p>
      </div>
      <button class="btn" id="aBack">Назад</button>
    `);
    d.querySelector('#aBack').onclick=()=>{SFX.uiBack();UI.mainMenu();};
  },
  saves(){
    const cur=encodeBufferSave();
    const d=this.build('saves',`
      <div class="card" style="max-width:560px;width:96vw">
        <h3>💾 Сохранения</h3>
        <p class="muted" style="font-size:12.5px;margin-bottom:10px">
          Если браузер не сохраняет прогресс — используй буфер обмена.
        </p>
        <div class="row" style="margin-bottom:8px;gap:6px">
          <button class="btn small" id="svCopy" style="flex:1">📋 Скопировать код</button>
          <button class="btn alt small" id="svLink" style="flex:1">🔗 Ссылка с сейвом</button>
        </div>
        <div style="position:relative">
          <textarea id="svCode" class="svCode" rows="5" placeholder="Вставь сюда код сохранения или ссылку с ним..."></textarea>
          <button id="svClear" title="Стереть" style="position:absolute;right:6px;top:6px;width:34px;height:34px;border-radius:10px;border:1px solid rgba(255,255,255,.2);background:rgba(20,10,10,.85);color:#ff9a8a;font-size:16px;font-weight:900;pointer-events:auto">✕</button>
        </div>
        <div class="row" style="margin-top:6px;gap:6px">
          <button class="btn alt small" id="svWipe" style="flex:1">🗑 Стереть поле</button>
          <button class="btn alt small" id="svPaste" style="flex:1">📥 Вставить из буфера</button>
        </div>
        <div class="row" style="margin-top:10px">
          <button class="btn" id="svApply" style="flex:1">📥 Загрузить</button>
        </div>
        <div id="svStatus" class="svStatus">Готово.</div>
      </div>
      <button class="btn alt" id="svBack">Назад</button>
    `);
    const codeEl=d.querySelector('#svCode');
    const statusEl=d.querySelector('#svStatus');
    codeEl.value=cur;
    const setStatus=(msg,cls)=>{statusEl.textContent=msg;statusEl.className='svStatus'+(cls?(' '+cls):'');};
    d.querySelector('#svCopy').onclick=async()=>{
      const code=encodeBufferSave();codeEl.value=code;
      try{await copyText(code);SFX.ui();setStatus('✅ Скопировано','ok');}
      catch(e){try{codeEl.focus();codeEl.select();}catch(_){}setStatus('⚠️ Выдели вручную','err');}
    };
    const wipe=()=>{codeEl.value='';SFX.ui();setStatus('Поле очищено. Вставь свой код или ссылку.','');try{codeEl.focus();}catch(e){}};
    d.querySelector('#svClear').onclick=wipe;d.querySelector('#svWipe').onclick=wipe;
    d.querySelector('#svPaste').onclick=async()=>{
      try{const tx=await navigator.clipboard.readText();if(!tx){setStatus('Буфер пуст','err');return;}codeEl.value=tx.trim();SFX.ui();setStatus('Вставлено из буфера — нажми «Загрузить»','ok');}
      catch(e){try{codeEl.value='';codeEl.focus();}catch(_){}setStatus('⚠️ Браузер не дал доступ к буферу — вставь вручную (долгое нажатие → Вставить)','err');}
    };
    d.querySelector('#svLink').onclick=async()=>{
      const link=saveLink();codeEl.value=link;
      try{await copyText(link);SFX.ui();setStatus('✅ Ссылка скопирована. Открой её — игра предложит загрузить сейв.','ok');}
      catch(e){try{codeEl.focus();codeEl.select();}catch(_){}setStatus('⚠️ Выдели вручную','err');}
    };
    d.querySelector('#svApply').onclick=()=>{
      const raw=extractSaveCode(codeEl.value);
      if(!raw){setStatus('Вставь код.','err');return;}
      try{
        const data=decodeBufferSave(raw);
        if(!applySaveData(data))throw new Error('Не удалось применить');
        ensureControls();
        applySettings();writeSave(false);SFX.buy();vib(30);
        setStatus('✅ Загружено!','ok');
        setTimeout(()=>{G.scene='menu';G.paused=false;G.cam.x=lobbyPlayer.x;G.cam.y=0;UI.mainMenu();},700);
      }catch(e){setStatus('❌ '+e.message,'err');}
    };
    d.querySelector('#svBack').onclick=()=>{SFX.uiBack();if(G.paused&&G.scene!=='menu')UI.pause();else UI.mainMenu();};
  },
  settings(tab){
    ensureControls();
    tab=tab||UI._sTab||'sound';if(!['sound','gfx','world','ctrl','misc'].includes(tab))tab='sound';UI._sTab=tab;
    const c=settings.controls;
    const regenDelaySec=Math.round(REGEN.delay/(settings.regenSpeed||1));
    const head=(ic,t,sub)=>`<div class="setHead"><div class="ic">${ic}</div><div><b>${t}</b>${sub?`<span>${sub}</span>`:''}</div></div>`;
    const seg=(a,b,on,idA,idB)=>`<div class="seg"><button id="${idA}" class="${on?'on':''}">${a}</button><button id="${idB}" class="${!on?'on':''}">${b}</button></div>`;
    const TABS=[['sound','🔊 Звук'],['gfx','🖥 Экран'],['world','🌍 Мир'],['ctrl','🎮 Управление'],['misc','💾 Прочее']];
    let body='';
    if(tab==='sound'){
      body=`<div class="card">${head('🔊','Звук и отклик','')}
        <div class="sliderRow"><div class="top"><span>Громкость звуков</span><b id="sfxV" style="color:#ffd98a">${Math.round(settings.sfx*100)}%</b></div>
          <input type="range" id="sSfx" min="0" max="1" step="0.05" value="${settings.sfx}"></div>
        <div class="sliderRow"><div class="top"><span>Громкость музыки</span><b id="musV" style="color:#ffd98a">${Math.round(settings.music*100)}%</b></div>
          <input type="range" id="sMusic" min="0" max="1" step="0.05" value="${settings.music}"></div>
        <div class="setting"><span>Виброотклик</span>${seg('Вкл','Выкл',settings.vibrate,'sVibOn','sVibOff')}</div></div>`;
    }else if(tab==='gfx'){
      body=`<div class="card">${head('🖥','Графика','Качество теперь не падает само: при нагрузке плавно снижается только внутреннее разрешение')}
        <div class="setting"><span>Качество графики</span>${seg('Высокое','Низкое',settings.quality==='high','sQHi','sQLo')}</div>
        <div class="setting"><span>Контуры персонажа и мобов</span>${seg('Вкл','Выкл',settings.outline!==false,'sOlOn','sOlOff')}</div>
        <div class="setting"><span>Упрощённая руда<br><span class="tiny">как в ранних версиях</span></span>${seg('Вкл','Выкл',!!settings.simpleOre,'sSoOn','sSoOff')}</div>
        <div class="setting"><span>Скрыть шлем<br><span class="tiny">видна голова персонажа</span></span>${seg('Вкл','Выкл',!!settings.hideHelmet,'sHhOn','sHhOff')}</div>
        <div class="tiny" style="padding:4px 2px">Разрешение рендера сейчас: <b style="color:#7dffb0">${Math.round((G.renderScale||1)*100)}%</b> · FPS ${Math.round(G.fpsNow||0)}</div></div>
      <div class="card">${head('🗺','Мини-карта','Показывает пещеры, руду, мобов и ⚓ якоря. Нажми на неё в игре — развернётся')}
        <div class="setting"><span>Мини-карта</span>${seg('Вкл','Выкл',settings.minimap,'sMmOn','sMmOff')}</div>
        <div class="setting"><span>Размер</span><div class="seg">
          <button data-mms="0" class="${settings.minimapSize===0?'on':''}">S</button><button data-mms="1" class="${settings.minimapSize===1?'on':''}">M</button><button data-mms="2" class="${settings.minimapSize===2?'on':''}">L</button></div></div></div>`;
    }else if(tab==='world'){
      body=`<div class="card">${head('⛏','Восстановление породы','Выкопанное вдали от тебя затягивается свежей породой')}
        <div class="setting"><span>Статус</span>${seg('Вкл','Выкл',settings.regen,'sRegOn','sRegOff')}</div>
        <div class="sliderRow"><div class="top"><span>Скорость затягивания</span><b id="regenSpeedV" style="color:#7dffb0">×${settings.regenSpeed.toFixed(2)}</b></div>
          <input type="range" id="sRegSpeed" min="0.25" max="4" step="0.05" value="${settings.regenSpeed}">
          <div class="labels"><span>0.25×</span><span>1×</span><span>4×</span></div></div>
        <div class="presetRow"><button class="btn small alt" data-regpreset="0.35">🐢 Оч. медл.</button><button class="btn small alt" data-regpreset="0.7">🐌 Медленно</button><button class="btn small alt" data-regpreset="1">⚖ Обычно</button><button class="btn small alt" data-regpreset="2.5">⚡ Быстро</button></div>
        <div class="tiny" style="margin-top:8px">Задержка ~<b id="regenDelayV" style="color:#7dffb0">${regenDelaySec}</b> с · восстановлено: ${regenTotal} · в очереди: ${dugTiles.size}</div></div>
      <div class="card">${head('💎','Плотность руды','Применяется к новым спускам')}
        <div class="sliderRow"><div class="top"><span>Плотность</span><b id="oreDensityV" style="color:#ffd98a">×${settings.oreDensity.toFixed(2)}</b></div>
          <input type="range" id="sOreDensity" min="0.25" max="3" step="0.05" value="${settings.oreDensity}">
          <div class="labels"><span>редко</span><span>1×</span><span>густо</span></div></div>
        <div class="presetRow"><button class="btn small alt" data-orepreset="0.5">💧 Редко</button><button class="btn small alt" data-orepreset="1">⚖ Обычно</button><button class="btn small alt" data-orepreset="1.6">💎 Богато</button><button class="btn small alt" data-orepreset="2.5">🌟 Оч. много</button></div></div>
      <div class="card">${head('👾','Мобы','Скорость появления и максимум вокруг тебя')}
        <div class="sliderRow"><div class="top"><span>Спавн мобов</span><b id="mobRateV" style="color:#ff9a9a">${settings.mobRate<=0?'выкл':'×'+settings.mobRate.toFixed(2)}</b></div>
          <input type="range" id="sMobRate" min="0" max="3" step="0.05" value="${settings.mobRate}">
          <div class="labels"><span>нет</span><span>1×</span><span>орда</span></div></div>
        <div class="presetRow"><button class="btn small alt" data-mobpreset="0">🕊 Нет</button><button class="btn small alt" data-mobpreset="0.5">🐇 Редко</button><button class="btn small alt" data-mobpreset="1">⚖ Обычно</button><button class="btn small alt" data-mobpreset="2">👹 Много</button></div>
        <div class="tiny" style="margin-top:8px">До <b id="mobCapV" style="color:#ff9a9a">${mobCap()}</b> мобов одновременно</div></div>
      <div class="card">${head('🌊','Жидкости','Вода (на Земле), кровь и кислота (в Аду) и лава')}
        <div class="sliderRow"><div class="top"><span>🌊 Вода · кровь · кислота</span><b id="waterV" style="color:#7ac0ff">${settings.waterAmount<=0?'нет':'×'+settings.waterAmount.toFixed(2)}</b></div>
          <input type="range" id="sWater" min="0" max="3" step="0.05" value="${settings.waterAmount}"></div>
        <div class="presetRow"><button class="btn small alt" data-waterpreset="0">🏜 Нет</button><button class="btn small alt" data-waterpreset="0.5">💧 Мало</button><button class="btn small alt" data-waterpreset="1">⚖ Обычно</button><button class="btn small alt" data-waterpreset="2">🌊 Много</button></div>
        <div class="sliderRow" style="margin-top:10px"><div class="top"><span>🌋 Лава</span><b id="lavaV" style="color:#ff9a5a">${settings.lavaAmount<=0?'нет':'×'+settings.lavaAmount.toFixed(2)}</b></div>
          <input type="range" id="sLava" min="0" max="3" step="0.05" value="${settings.lavaAmount}"></div>
        <div class="presetRow"><button class="btn small alt" data-lavapreset="0">❄ Нет</button><button class="btn small alt" data-lavapreset="0.5">🔥 Мало</button><button class="btn small alt" data-lavapreset="1">⚖ Обычно</button><button class="btn small alt" data-lavapreset="2">🌋 Много</button></div></div>`;
    }else if(tab==='ctrl'){
      body=`<div class="card">${head('🎮','Раскладка','Перетаскивай кнопки, размер — кнопками +/−')}
        <button class="btn" id="sControls">🎮 Настроить управление</button></div>
      <div class="card">${head('🎨','Прозрачность кнопок','')}
        <div class="setting"><span>Джойстик</span><input type="range" id="tJoy" min="0.1" max="1" step="0.05" value="${c.joy.a}"></div>
        <div class="setting"><span>Прыжок</span><input type="range" id="tJump" min="0.1" max="1" step="0.05" value="${c.jump.a}"></div>
        <div class="setting"><span>Ставить</span><input type="range" id="tPlace" min="0.1" max="1" step="0.05" value="${c.place.a}"></div>
        <div class="setting"><span>Стрелять</span><input type="range" id="tShoot" min="0.1" max="1" step="0.05" value="${c.shoot.a}"></div>
        <div class="setting"><span>Предметы</span><input type="range" id="tItems" min="0.1" max="1" step="0.05" value="${c.items.a}"></div>
        <div class="setting"><span>Пауза</span><input type="range" id="tPause" min="0.1" max="1" step="0.05" value="${c.pause.a}"></div></div>`;
    }else{
      const mi=Save.info(SAVE_KEY_M),ai=Save.info(SAVE_KEY);
      const ints=[[15,'15 с'],[30,'30 с'],[60,'1 мин'],[180,'3 мин']];
      body=`<div class="card">${head('🌐','Сохранение в браузере',settings.autoSave===false?'Автосохранение выключено — не забывай сохраняться вручную':'Прогресс сохраняется сам, а ручной слот — твоя «точка отката»')}
        <div class="setting"><span>Автосохранение</span>${seg('Вкл','Выкл',settings.autoSave!==false,'sAsOn','sAsOff')}</div>
        ${settings.autoSave!==false?`<div class="setting"><span>Как часто</span><div class="seg">${ints.map(t=>`<button data-asint="${t[0]}" class="${(settings.autoSaveInt||30)===t[0]?'on':''}">${t[1]}</button>`).join('')}</div></div>`:''}
        <div class="tiny" style="padding:2px 2px 8px;line-height:1.5">Основной слот: <b style="color:#7dffb0">${ai?agoText(ai.ts):'пусто'}</b>${ai?' · '+fmt(ai.money)+' 💰':''}<br>
          Ручной слот: <b style="color:#ffd98a">${mi?agoText(mi.ts):'пусто'}</b>${mi?' · '+fmt(mi.money)+' 💰':''}
          ${Save.available?'':'<br><b style="color:#ff8a8a">⚠ Браузер запрещает сохранение'+(Save.lastErr?' ('+Save.lastErr+')':'')+' — используй код сохранения ниже</b>'}</div>
        <div class="row" style="gap:6px">
          <button class="btn small" id="sSaveNow" style="flex:1">💾 Сохранить сейчас</button>
          <button class="btn alt small" id="sLoadM" style="flex:1" ${mi?'':'disabled'}>📂 Загрузить ручной</button></div>
        <button class="btn alt small" id="sLoadA" style="width:100%;margin-top:6px" ${ai?'':'disabled'}>↩ Откатиться к основному слоту</button></div>
      <div class="card">${head('💾','Код сохранения','Перенос прогресса текстом или ссылкой')}
        <button class="btn" id="sSaves">💾 Сохранения (буфер)</button></div>
      <div class="card" style="border-color:${settings.cheatsUnlocked?'rgba(94,224,106,.5)':'rgba(255,255,255,.08)'}">${head('🔐','Секретный код','')}
        <div class="row" style="gap:6px">
          <input type="text" id="cheatCode" class="cheatInput" style="flex:1;min-width:0" placeholder="${settings.cheatsUnlocked?'✅ Читы активны':'Введите код...'}" ${settings.cheatsUnlocked?'disabled':''}>
          <button class="btn small" id="cheatApply" style="min-width:70px">OK</button></div>
        ${settings.cheatsUnlocked?'<button class="btn alt" id="sCheat" style="border:1px solid #5ee06a;margin-top:10px;width:100%">🔧 Тест-панель</button>':''}</div>
      <div class="card">${head('⚠','Опасная зона','')}
        <button class="btn alt" id="sDefaults" style="width:100%;margin-bottom:8px">↺ Настройки по умолчанию</button>
        <button class="btn alt" id="sReset" style="width:100%">🗑 Сбросить прогресс</button></div>`;
    }
    const d=this.build('settings',`
      <div class="card" style="padding:10px 12px 4px">
        <h3 style="margin-bottom:8px">⚙ Настройки</h3>
        <div class="tabs">${TABS.map(t=>`<button data-stab="${t[0]}" class="${tab===t[0]?'on':''}">${t[1]}</button>`).join('')}</div>
      </div>
      ${body}
      <button class="btn alt" id="sBack">Назад</button>
    `);
    const $=id=>d.querySelector('#'+id);
    const on=(id,fn)=>{const el=$(id);if(el)el.onclick=fn;};
    const upd=()=>{applySettings();saveSettings();};
    d.querySelectorAll('[data-stab]').forEach(b=>b.onclick=()=>{SFX.ui();UI.settings(b.getAttribute('data-stab'));});
    if($('sSfx'))$('sSfx').oninput=e=>{settings.sfx=+e.target.value;$('sfxV').textContent=Math.round(settings.sfx*100)+'%';upd();};
    if($('sMusic'))$('sMusic').oninput=e=>{settings.music=+e.target.value;$('musV').textContent=Math.round(settings.music*100)+'%';AU.setMusicVol(settings.music);upd();};
    on('sVibOn',()=>{settings.vibrate=true;SFX.ui();upd();UI.settings();});
    on('sVibOff',()=>{settings.vibrate=false;SFX.ui();upd();UI.settings();});
    on('sQHi',()=>{settings.quality='high';SFX.ui();upd();UI.settings();});
    on('sQLo',()=>{settings.quality='low';settings.qv=2;SFX.ui();upd();UI.settings();});
    on('sMmOn',()=>{settings.minimap=true;SFX.ui();upd();UI.settings();});
    on('sOlOn',()=>{settings.outline=true;SFX.ui();upd();UI.settings();});
    on('sSoOn',()=>{settings.simpleOre=true;try{CC.clear();}catch(e){}SFX.ui();upd();UI.settings();});on('sSoOff',()=>{settings.simpleOre=false;try{CC.clear();}catch(e){}SFX.ui();upd();UI.settings();});
    on('sHhOn',()=>{settings.hideHelmet=true;SFX.ui();upd();UI.settings();});on('sHhOff',()=>{settings.hideHelmet=false;SFX.ui();upd();UI.settings();});on('sOlOff',()=>{settings.outline=false;SFX.ui();upd();UI.settings();});
    on('sMmOff',()=>{settings.minimap=false;SFX.ui();upd();UI.settings();});
    d.querySelectorAll('[data-mms]').forEach(b=>b.onclick=()=>{settings.minimapSize=+b.getAttribute('data-mms');SFX.ui();upd();UI.settings();});
    on('sRegOn',()=>{settings.regen=true;SFX.ui();upd();UI.settings();});
    on('sAsOn',()=>{settings.autoSave=true;SFX.ui();upd();writeSave(false);UI.toast('🌐 Автосохранение включено');UI.settings();});
    on('sAsOff',()=>{settings.autoSave=false;SFX.uiBack();upd();UI.toast('⚠ Автосохранение выключено');UI.settings();});
    d.querySelectorAll('[data-asint]').forEach(b=>b.onclick=()=>{settings.autoSaveInt=+b.getAttribute('data-asint');SFX.ui();upd();UI.settings();});
    on('sSaveNow',()=>{manualSave();UI.settings();});
    const confirmLoad=(key,txt)=>{
      const back=()=>UI.settings();
      const dd=UI.build('confirm',`<div class="card" style="max-width:400px"><h3>${txt}</h3>
        <p class="muted" style="margin:8px 0 12px">Текущий несохранённый прогресс будет потерян.</p>
        <div class="row" style="gap:6px"><button class="btn" id="clYes" style="flex:1">Загрузить</button><button class="btn alt" id="clNo" style="flex:1">Отмена</button></div></div>`);
      dd.querySelector('#clYes').onclick=()=>{loadFromBrowser(key);};dd.querySelector('#clNo').onclick=()=>{SFX.uiBack();back();};};
    on('sLoadM',()=>{SFX.ui();confirmLoad(SAVE_KEY_M,'📂 Загрузить ручное сохранение?');});
    on('sLoadA',()=>{SFX.ui();confirmLoad(SAVE_KEY,'↩ Откатиться к основному слоту?');});
    on('sRegOff',()=>{settings.regen=false;SFX.uiBack();upd();UI.settings();});
    on('sSaves',()=>{SFX.ui();UI.saves();});
    on('sControls',()=>{SFX.ui();UI.controlsEditor();});
    on('sCheat',()=>{SFX.ui();UI.cheats();});
    on('sDefaults',()=>{const keep={cheatsUnlocked:settings.cheatsUnlocked,controls:settings.controls,controlsCustomized:settings.controlsCustomized};
      Object.assign(settings,JSON.parse(JSON.stringify(SETTINGS_DEFAULTS)),keep);chunks.clear();upd();UI.toast('Настройки сброшены');UI.settings();});
    if($('sRegSpeed')){
      $('sRegSpeed').oninput=e=>{settings.regenSpeed=parseFloat(e.target.value);$('regenSpeedV').textContent='×'+settings.regenSpeed.toFixed(2);$('regenDelayV').textContent=Math.round(REGEN.delay/settings.regenSpeed);saveSettings();};
      $('sRegSpeed').onchange=()=>{saveSettings();UI.toast('⛏ Скорость затягивания: ×'+settings.regenSpeed.toFixed(2));};
    }
    d.querySelectorAll('[data-regpreset]').forEach(btn=>btn.onclick=()=>{settings.regenSpeed=parseFloat(btn.getAttribute('data-regpreset'));SFX.ui();saveSettings();UI.toast('⛏ Скорость затягивания: ×'+settings.regenSpeed.toFixed(2));UI.settings();});
    if($('sOreDensity')){
      $('sOreDensity').oninput=e=>{settings.oreDensity=parseFloat(e.target.value);$('oreDensityV').textContent='×'+settings.oreDensity.toFixed(2);saveSettings();};
      $('sOreDensity').onchange=()=>{settings.oreDensity=parseFloat($('sOreDensity').value);chunks.clear();saveSettings();UI.toast('💎 Плотность руды: ×'+settings.oreDensity.toFixed(2));};
    }
    d.querySelectorAll('[data-orepreset]').forEach(btn=>btn.onclick=()=>{settings.oreDensity=parseFloat(btn.getAttribute('data-orepreset'));chunks.clear();SFX.ui();saveSettings();UI.toast('💎 Плотность руды: ×'+settings.oreDensity.toFixed(2));UI.settings();});
    const liqBind=(key,sliderId,labelId,presetAttr,name,emptyWord)=>{
      const el=$(sliderId);
      const show=()=>{const v=$(labelId);if(v)v.textContent=settings[key]<=0?emptyWord:'×'+settings[key].toFixed(2);};
      const apply=()=>{chunks.clear();saveSettings();UI.toast(name+(settings[key]<=0?': нет':': ×'+settings[key].toFixed(2)));};
      if(el){el.oninput=e=>{settings[key]=parseFloat(e.target.value);show();saveSettings();};el.onchange=()=>{settings[key]=parseFloat(el.value);apply();};}
      d.querySelectorAll('['+presetAttr+']').forEach(btn=>{btn.onclick=()=>{settings[key]=parseFloat(btn.getAttribute(presetAttr));SFX.ui();apply();UI.settings();};});
    };
    liqBind('waterAmount','sWater','waterV','data-waterpreset','🌊 Жидкости','нет');
    liqBind('lavaAmount','sLava','lavaV','data-lavapreset','🌋 Лава','нет');
    if($('sMobRate')){
      const mobShow=()=>{$('mobRateV').textContent=settings.mobRate<=0?'выкл':'×'+settings.mobRate.toFixed(2);$('mobCapV').textContent=mobCap();};
      $('sMobRate').oninput=e=>{settings.mobRate=parseFloat(e.target.value);mobShow();saveSettings();};
      $('sMobRate').onchange=()=>{saveSettings();UI.toast(settings.mobRate<=0?'👾 Мобы не появляются':'👾 Спавн мобов: ×'+settings.mobRate.toFixed(2));};
    }
    d.querySelectorAll('[data-mobpreset]').forEach(btn=>btn.onclick=()=>{settings.mobRate=parseFloat(btn.getAttribute('data-mobpreset'));SFX.ui();saveSettings();UI.settings();});
    const bindTrans=(key,id)=>{const el=$(id);if(!el)return;el.oninput=e=>{ensureControls();settings.controls[key].a=+e.target.value;settings.controlsCustomized=true;saveSettings();};};
    bindTrans('joy','tJoy');bindTrans('jump','tJump');bindTrans('place','tPlace');bindTrans('shoot','tShoot');bindTrans('items','tItems');bindTrans('pause','tPause');
    const cheatInp=$('cheatCode'),cheatBtn=$('cheatApply');
    if(cheatInp&&cheatBtn){
      const tryUnlock=()=>{
        const val=(cheatInp.value||'').trim().toUpperCase();
        if(!val)return;
        if(val===CHEAT_CODE){settings.cheatsUnlocked=true;saveSettings();SFX.win();vib(60);UI.toast('🔓 Читы разблокированы!');UI.settings();}
        else{SFX.uiBack();vib(30);UI.toast('❌ Неверный код');cheatInp.value='';}
      };
      cheatBtn.onclick=tryUnlock;
      cheatInp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();tryUnlock();}});
      cheatInp.addEventListener('input',()=>{const v=(cheatInp.value||'').toUpperCase();cheatBtn.style.background=v===CHEAT_CODE?'linear-gradient(180deg,#5ee06a,#2a7a3a)':'';});
    }
    on('sReset',()=>{SFX.uiBack();UI.confirmReset();});
    on('sBack',()=>{SFX.uiBack();saveSettings();if(G.scene==='menu')UI.mainMenu();else UI.pause();});
  },

  controlsEditor(){
    resetAllInputs();
    this.clear();
    ensureControls();

    const d=document.createElement('div');
    d.className='panel';
    d.style.cssText='padding:0;justify-content:flex-start;align-items:stretch;gap:0;overflow:hidden;touch-action:none;'+
      'background:linear-gradient(180deg,#1c1a22 0%,#2e2a30 45%,#5a3e2c 62%,#1e140c 100%)';
    d.innerHTML=`
      <div id="ceArea" style="position:absolute;inset:0;touch-action:none;overflow:hidden"></div>
      <div style="position:absolute;top:0;left:0;right:0;padding:14px;pointer-events:none;z-index:6;text-align:center">
        <div style="display:inline-block;padding:8px 14px;border-radius:12px;background:rgba(20,16,12,.88);border:1px solid #4a3d31;font-size:12px;color:#e6d9c4;max-width:82vw;line-height:1.5">
          <b style="color:#ffd98a">Перетащи</b> кнопку · коснись — появятся <b style="color:#ffd98a">+</b> <b style="color:#ffd98a">−</b><br>
          Прозрачность — в Настройках
        </div>
      </div>
      <button class="btn" id="ceBack" style="position:absolute;left:calc(env(safe-area-inset-left) + 14px);top:14px;z-index:7;width:auto;padding:8px 16px;min-height:46px;font-size:15px">Готово</button>
    `;
    uiRoot.appendChild(d);
    this.el=d;this.modal='controlsEditor';

    const area=d.querySelector('#ceArea');

    const circles={};
    CONTROL_ORDER.forEach(key=>{
      const el=document.createElement('div');
      el.className='ceCircle';
      el.dataset.key=key;
      el.textContent=CONTROL_LABELS[key];
      area.appendChild(el);
      circles[key]=el;
    });

    let selected=null;

    const renderCircles=()=>{
      const W=area.clientWidth, H=area.clientHeight;
      CONTROL_ORDER.forEach(key=>{
        const c=settings.controls[key];
        const r=Math.max(18, getControlRadius(c.r));
        const el=circles[key];
        el.style.left=((c.cx*W)-r)+'px';
        el.style.top=((c.cy*H)-r)+'px';
        el.style.width=(r*2)+'px';
        el.style.height=(r*2)+'px';
        el.style.opacity=String(c.a);
        el.style.fontSize=Math.max(9,Math.min(14,r*0.42))+'px';
        el.classList.toggle('sel',key===selected);
      });
    };

    const activeTouches=new Map();

    /* кнопки «+» и «−» появляются у выбранной кнопки (после касания) */
    const sizeBox=document.createElement('div');
    sizeBox.style.cssText='position:absolute;z-index:8;display:none;gap:8px;align-items:center;padding:6px 8px;border-radius:30px;background:rgba(0,0,0,.78);border:1px solid rgba(255,217,138,.55);box-shadow:0 4px 14px rgba(0,0,0,.5);pointer-events:auto;touch-action:none';
    sizeBox.innerHTML=`
      <button id="ceMinus" style="width:44px;height:44px;border-radius:50%;border:none;background:linear-gradient(180deg,#ffd98a,#f0a33c);color:#3a2300;font:900 26px system-ui,sans-serif;line-height:1">−</button>
      <span id="ceSz" style="min-width:34px;text-align:center;color:#ffd98a;font:800 13px system-ui,sans-serif"></span>
      <button id="cePlus" style="width:44px;height:44px;border-radius:50%;border:none;background:linear-gradient(180deg,#ffd98a,#f0a33c);color:#3a2300;font:900 26px system-ui,sans-serif;line-height:1">+</button>`;
    d.appendChild(sizeBox);
    const placeSizeBox=()=>{
      if(!selected){sizeBox.style.display='none';return;}
      const W=area.clientWidth,H=area.clientHeight;
      const c=settings.controls[selected];
      const r=Math.max(18,getControlRadius(c.r));
      const cx=c.cx*W,cy=c.cy*H;
      sizeBox.style.display='flex';
      const bw=sizeBox.offsetWidth||150,bh=sizeBox.offsetHeight||56;
      let top=cy-r-bh-8;
      if(top<64)top=cy+r+8;                      /* сверху нет места — ставим снизу */
      if(top+bh>H-6)top=Math.max(64,cy-bh/2);
      sizeBox.style.left=clamp(cx-bw/2,6,W-bw-6)+'px';
      sizeBox.style.top=top+'px';
      d.querySelector('#ceSz').textContent=Math.round(c.r)+'';
    };
    const stepSize=(dir)=>{
      if(!selected)return;
      const c=settings.controls[selected];
      c.r=clamp(Math.round(c.r*(dir>0?1.08:1/1.08)*10)/10,20,160);
      settings.controlsCustomized=true;
      renderCircles();placeSizeBox();SFX.ui();
    };
    let rep=null;
    const bindHold=(id,dir)=>{
      const b=sizeBox.querySelector(id);
      const stop=()=>{if(rep){clearInterval(rep);rep=null;}};
      b.addEventListener('pointerdown',e=>{
        e.preventDefault();e.stopPropagation();
        stepSize(dir);stop();
        rep=setTimeout(()=>{rep=setInterval(()=>stepSize(dir),90);},320);
      });
      for(const ev of ['pointerup','pointercancel','pointerleave'])b.addEventListener(ev,()=>{if(rep){clearTimeout(rep);clearInterval(rep);rep=null;}saveSettings();updateJoyBase();});
    };
    bindHold('#ceMinus',-1);bindHold('#cePlus',1);

    area.addEventListener('pointerdown',e=>{
      const el=e.target.closest('.ceCircle');
      if(!el){selected=null;renderCircles();placeSizeBox();return;}   /* касание пустого места — снимаем выбор */
      e.preventDefault();e.stopPropagation();
      const key=el.dataset.key;
      for(const tt of activeTouches.values())if(tt.key===key)return;     /* один палец на кнопку */
      if(selected!==key){selected=key;renderCircles();}
      try{e.target.setPointerCapture(e.pointerId);}catch(_){}
      const c=settings.controls[key];
      activeTouches.set(e.pointerId,{key,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,startCx:c.cx,startCy:c.cy});
      placeSizeBox();
    },{passive:false});

    const onMove=(e)=>{
      const t=activeTouches.get(e.pointerId);
      if(!t)return;
      e.preventDefault();
      const W=area.clientWidth,H=area.clientHeight;
      const key=t.key;
      settings.controls[key].cx=clamp(t.startCx+(e.clientX-t.startX)/W,0.03,0.97);
      settings.controls[key].cy=clamp(t.startCy+(e.clientY-t.startY)/H,0.03,0.97);
      settings.controlsCustomized=true;
      renderCircles();placeSizeBox();
    };
    area.addEventListener('pointermove',onMove,{passive:false});

    const onUp=(e)=>{
      if(!activeTouches.has(e.pointerId))return;
      activeTouches.delete(e.pointerId);
      saveSettings();
      updateJoyBase();
    };
    area.addEventListener('pointerup',onUp,{passive:true});
    area.addEventListener('pointercancel',onUp,{passive:true});

    d.querySelector('#ceBack').onclick=()=>{
      SFX.uiBack();
      saveSettings();
      updateJoyBase();
      UI.settings();
    };

    renderCircles();
    setTimeout(renderCircles,30);
    setTimeout(renderCircles,150);
  },

  confirmReset(){
    const d=this.build('confirmReset',`
      <div class="card" style="max-width:380px;text-align:center">
        <h3 style="text-align:center">🗑 Сброс прогресса</h3>
        <p class="muted" style="text-align:center">Весь прогресс, снаряжение, руда и настройки будут удалены безвозвратно.</p>
        <p class="muted" style="text-align:center;margin-top:6px;color:#ff8a8a"><b>Точно сбросить?</b></p>
      </div>
      <div class="row" style="width:min(88vw,380px)">
        <button class="btn alt" id="crNo" style="flex:1">Отмена</button>
        <button class="btn" id="crYes" style="flex:1;background:linear-gradient(180deg,#ff8a7a,#c94a2a);color:#fff;box-shadow:0 4px 0 #7a2a14,0 8px 18px rgba(0,0,0,.45)">Да, сбросить</button>
      </div>
    `);
    d.querySelector('#crNo').onclick=()=>{SFX.uiBack();UI.settings();};
    d.querySelector('#crYes').onclick=()=>{
      SFX.lose();vib(50);
      resetProgress();
    };
  },

  bestiary(tab){
    const lilMobs=MOBDEFS.some(d=>d.dim===2);
    tab=tab||(G.dim===1?'hell':G.dim===2&&lilMobs?'lilac':'earth');
    const B=player.bestiary||{},S=player.stats||{};
    const TABS=[['earth','🌍 Земля'],['hell','🔥 Ад'],...(lilMobs?[['lilac','🌸 Небеса']]:[]),['stats','📊 Статистика']];
    let body='';
    if(tab==='stats'){
      const row=(a,b)=>`<div class="row spread"><span class="muted">${a}</span><b>${b}</b></div>`;
      const totalKinds=MOBDEFS.filter(d=>!d.trap&&d.id!=='spirit'&&d.mech!=='hbecho').length,known=MOBDEFS.filter(d=>B[d.id]>0).length;
      const trophies=MOBDEFS.filter(d=>(B[d.id]||0)>=TROPHY_N&&!d.boss).length;
      body=`<div class="card" style="max-width:440px">
        ${row('Врагов повержено',fmt(S.kills||0))}${row('Видов в бестиарии',known+' / '+totalKinds)}${row('Охотничьих трофеев 🏆',trophies)}
        ${row('Блоков выкопано',fmt(S.blocks||0))}${row('Руды добыто',fmt(S.ore||0))}${row('Сундуков открыто',fmt((S.chests||0)+(S.bigChests||0)))}
        ${row('Событий Пустошей пережито',fmt(S.events||0))}${row('Смертей',fmt(S.deaths||0))}
        ${row('Глубочайшая точка Земли',Math.floor(player.maxDepth||0)+' м')}${row('Глубочайшая точка Ада',(player.prog.hellDepth||0)+' м')}${player.prog.lilacDepth?row('Глубочайшая точка Лиловых небес',player.prog.lilacDepth+' м'):''}
        ${row('Пожиратель Бездны',player.prog.key?'повержен ✅':'жив')}
        ${row('Владыки Преисподней',HB_MINIS.filter(b=>hbKills(b.id)).length+' / 5')}${row('Архидемон Инферналис',hbKills('archdemon')?'повержен ✅':'жив')}
      </div><p class="tiny muted" style="text-align:center">Убей ${TROPHY_N} врагов одного вида — получишь трофей: +15% урона по ним навсегда.</p>`;
    }else{
      const dim=tab==='hell'?1:tab==='lilac'?2:0;
      const list=MOBDEFS.filter(d=>(d.dim||0)===dim&&d.id!=='spirit'&&d.mech!=='hbecho');
      body='<div class="scroll"><div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center">';
      for(const d of list){const n=B[d.id]||0,k=n>0;
        const tr=n>=TROPHY_N&&!d.boss;
        body+=`<div style="box-sizing:border-box;width:150px;padding:8px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid ${tr?'#ffd060':'rgba(255,255,255,.1)'}">
          <img data-mob="${d.id}" alt="" style="width:120px;height:84px;display:block;margin:0 auto;border-radius:8px;background:rgba(0,0,0,.25)">
          <div style="font-weight:800;font-size:13px;margin-top:4px">${k?d.name:'???'} ${tr?'🏆':''}</div>
          <div class="tiny muted">${k?('Убито: '+n+' · ОЗ '+fmt(d.hp)+' · урон '+d.dmg):'Ещё не встречен'}</div>
          ${k&&MOB_LORE[d.id]?`<div class="tiny" style="margin-top:3px;color:#cfd8e8">${MOB_LORE[d.id]}</div>`:''}
          ${k&&!tr&&!d.boss?`<div style="height:4px;background:rgba(255,255,255,.1);border-radius:3px;margin-top:5px"><div style="height:4px;border-radius:3px;background:#ffd060;width:${Math.min(100,n/TROPHY_N*100)}%"></div></div>`:''}
        </div>`;}
      body+='</div></div>';
    }
    const d=this.build('bestiary',`
      <h1 class="title" style="font-size:clamp(22px,6vw,34px)">📖 Бестиарий</h1>
      <div class="card" style="max-width:560px;padding:8px"><div class="tabs">${TABS.map(t=>`<button data-btab="${t[0]}" class="${tab===t[0]?'on':''}">${t[1]}</button>`).join('')}</div>${body}</div>
      <button class="btn alt" id="bBack">Назад</button>`);
    d.querySelectorAll('[data-btab]').forEach(b=>b.onclick=()=>{SFX.ui();UI.bestiary(b.dataset.btab);});
    d.querySelector('#bBack').onclick=()=>{SFX.uiBack();if(G.scene==='menu')UI.mainMenu();else UI.pause();};
    d.querySelectorAll('img[data-mob]').forEach(im=>{const def=MOBDEFS.find(x=>x.id===im.dataset.mob);if(!def)return;const c=document.createElement('canvas');c.width=120;c.height=84;const g=c.getContext('2d');
      try{const m={def:def,x:0,y:0,w:def.w,h:def.h,vx:0,vy:0,facing:1,alpha:1,tele:0,hurt:0,anim:1.2,phase:0.5,state:def.mech==='lavaworm'?'out':'idle',onGround:true,hp:def.hp,maxHp:def.hp,lookX:0.7,lookY:0.1,b:def.boss?{phase:1,atk:''}:null,trail:null};
        const sc=Math.min(1.6,58/Math.max(def.w,def.h));g.save();g.translate(60,def.fly?42+def.h*sc*0.5:76);g.scale(sc,sc);
        if(!(B[def.id]>0)){g.filter='brightness(0)';g.globalAlpha=0.55;}
        drawMobSprite(g,m,1.3);g.restore();}catch(e){}
      im.src=c.toDataURL();
    });
  },
  pause(){
    const cheatBtn=settings.cheatsUnlocked?'<button class="btn alt" id="pCheat" style="border-color:#5ea85e">Читы</button>':'';
    const d=this.build('pause',`
      <h1 class="title" style="font-size:clamp(24px,7vw,40px)">ПАУЗА</h1>
      <div class="pauseWrap">
      <div class="card" style="max-width:420px">
        <h3>Сводка</h3>
        <div class="statGrid">
          <span>Глубина</span><b>${player.y>0?Math.floor(player.y/TILE):0} м</b>
          <span>Здоровье</span><b>${Math.ceil(player.hp)} / ${player.maxHp}</b>
          <span>Монеты</span><b class="gold">${fmt(player.money)}</b>
          <span>Руда</span><b>${totalOre()} шт · ${fmt(invValue())}</b>
          ${settings.regen?`<span>Восстановлено породы</span><b style="color:var(--teal)">${regenTotal} бл.</b>`:''}
        </div>
      </div>
      <div class="pauseBtns">
        <button class="btn big" id="pResume">Продолжить</button>
        <button class="btn" id="pSaveNow">Сохранить игру <small style="font-family:var(--font-body);font-size:11px;opacity:.75;font-weight:600">· ${G.lastSaveTs?agoText(G.lastSaveTs):'ещё не сохранено'}${settings.autoSave===false?' · автосейв выкл':''}</small></button>
        <div class="two">
          <button class="btn alt" id="pBest">Бестиарий</button>
          <button class="btn alt" id="pSet">Настройки</button>
          <button class="btn alt" id="pSave">Код сохранения</button>
          <button class="btn alt" id="pCopy">Копировать сейв</button>
          ${cheatBtn}
          <button class="btn alt" id="pMenu"${cheatBtn?'':' style="grid-column:1/-1"'}>В главное меню</button>
        </div>
      </div>
      </div>
    `);
    d.querySelector('#pResume').onclick=()=>{SFX.ui();G.paused=false;UI.clear();};
    d.querySelector('#pSaveNow').onclick=()=>{if(manualSave())UI.pause();};
    d.querySelector('#pCopy').onclick=async()=>{
      try{const code=encodeBufferSave();await copyText(code);SFX.ui();UI.toast('✅ Сейв скопирован');}
      catch(e){UI.toast('❌ Не удалось');}
    };
    if(d.querySelector('#pCheat'))d.querySelector('#pCheat').onclick=()=>{SFX.ui();UI.cheats();};
    d.querySelector('#pSave').onclick=()=>{SFX.ui();UI.saves();};
    d.querySelector('#pBest').onclick=()=>{SFX.ui();UI.bestiary();};
    d.querySelector('#pSet').onclick=()=>{SFX.ui();UI.settings();};
    d.querySelector('#pMenu').onclick=()=>{SFX.uiBack();if(G.scene==='mine')G.resumeMine={x:player.x,y:player.y,dim:G.dim,live:true};saveGame();G.paused=false;G.scene='menu';G.mineActive=false;UI.mainMenu();};
  },

  market(){
    const hell=G.dim>=1;
    const preview=(k,n)=>{const base=orePrice(k);if(!ORES[k].dim)return Math.round(base*n);let sv=(G.wf.sat&&G.wf.sat[k])||0,sum=0;for(let i=0;i<n;i++){sum+=base/(1+sv/SAT_ORE);sv++;}return Math.round(sum);};
    const previewM=(id,n)=>{const base=matValue(id);let sv=(G.wf.sat&&G.wf.sat['m:'+id])||0,sum=0;for(let i=0;i<n;i++){sum+=base/(1+sv/60);sv++;}return Math.round(sum);};
    const sellN=(k,n)=>{n=Math.min(n,player.inv[k]||0);if(n<=0)return 0;const g=sellOre(k,n);player.money+=g;player.inv[k]-=n;if(player.inv[k]<=0)delete player.inv[k];return g;};
    const keys=Object.keys(player.inv).filter(k=>player.inv[k]>0).sort((a,b)=>ORES[b].price-ORES[a].price);
    let total=0;for(const k of keys)total+=preview(k,player.inv[k]);
    const demC=(dem)=>dem>80?'#7dffb0':dem>55?'#ffd98a':'#ff8a6a';
    const sellLine=(key,n,kind,id)=>`<div class="qline"><div class="qwrap">${qtyHtml(key,n)}
        <div class="qsum">за <b data-qs="${key}">${n}</b> шт: <b class="gold" data-qp="${key}">…</b><span data-qa="${key}"></span></div></div>
        <button class="btn small" data-sellq="${kind}:${id}:${key}">Продать</button></div>`;
    let html='<div class="scroll">';
    if(!keys.length)html+='<p class="muted" style="text-align:center;padding:18px">Нет руды</p>';
    for(const k of keys){
      const o=ORES[k],n=player.inv[k],dem=Math.round(satMult(k)*100);
      html+=`<div class="item mk">
        <div class="ico gem" style="--c:${o.color};--g:${o.glow}"></div>
        <div class="txt"><div class="nm">${o.name} <span class="cnt">×${n}</span></div>
        <div class="ds">${fmt(Math.round(orePrice(k)*satMult(k)))} 💰/шт${o.dim?` · спрос <b style="color:${demC(dem)}">${dem}%</b>`:''} · всё: <b style="color:#ffd98a">${fmt(preview(k,n))}</b></div></div>
        ${sellLine('mo'+k,n,'o',k)}</div>`;
    }
    if(hell){
      const mk=Object.keys(player.mats||{}).filter(id=>player.mats[id]>0&&matValue(id)>0).sort((a,b)=>matValue(b)-matValue(a));
      html+='<div class="sect" style="margin-top:8px">Слитки и сплавы</div>';
      if(!mk.length)html+='<p class="muted tiny" style="text-align:center;padding:8px">Нет слитков — переплавь руду в Печи</p>';
      for(const id of mk){const M=MATS[id]||{n:id,ic:'▬',col:'#ccc'},n=player.mats[id],dem=Math.round(matSatMult(id)*100),pr=Math.round(matValue(id)*matSatMult(id));
        html+=`<div class="item mk"><div class="ico" style="background:rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center">${resSwatch('m',id)}</div>
          <div class="txt"><div class="nm">${M.n} <span class="cnt">×${n}</span></div><div class="ds">${fmt(pr)} 💰/шт · спрос <b style="color:${demC(dem)}">${dem}%</b> · всё: <b style="color:#ffd98a">${fmt(previewM(id,n))}</b></div></div>
          ${sellLine('mm'+id,n,'m',id)}</div>`;}
    }
    html+='</div>';
    const d=this.build('market',`
      <div class="card ${hell?'hell':''}" style="max-width:540px;width:96vw">
        <h3>${hell?'👻 Рынок душ':'💹 Рудная биржа'}</h3>
        <div class="bal"><span>Баланс</span><b>${fmt(player.money)} 💰</b></div>
        ${hell?'<p class="tiny" style="margin-bottom:8px">Скупщики Ада быстро насыщаются: чем больше продаёшь одной руды, тем ниже цена. Спрос восстанавливается за несколько минут. Ценнее переплавить руду в Печи.</p>':''}
        <p class="tiny" style="margin-bottom:6px">Ползунком выбери, сколько продать — цена за это количество видна сразу (с учётом падения спроса). Рюкзак: ${invCount()}/${player.slots} видов · стопка до ${stackCap()} шт</p>
        ${html}
      </div>
      <div class="row" style="width:min(94vw,540px)">
        <button class="btn" id="mAll" style="flex:1" ${keys.length?'':'disabled'}>💰 Продать всю руду (${fmt(total)})</button>
      </div>
      ${hell&&keys.some(k=>!ORES[k].dim)?`<div class="row" style="width:min(94vw,540px)"><button class="btn alt" id="mEarth" style="flex:1">🌍 Продать только руду Земли</button></div>`:''}
      <button class="btn alt" id="mBack">Выйти</button>
    `);
    wireQty(d,(key,v)=>{const kind=key[1],id=key.slice(2);const sum=kind==='o'?preview(id,v):previewM(id,v);
      const a=d.querySelector(`[data-qs="${key}"]`),b=d.querySelector(`[data-qp="${key}"]`),c=d.querySelector(`[data-qa="${key}"]`);
      if(a)a.textContent=v;if(b)b.innerHTML=fmt(sum)+' <i class="mi coin inl"></i>';if(c)c.textContent=v>1?' · ≈'+fmt(Math.round(sum/v))+'/шт':'';});
    d.querySelector('#mAll').onclick=()=>{let g=0,n=0;for(const k of keys){n+=player.inv[k]||0;g+=sellN(k,player.inv[k]||0);}
      if(!g){UI.toast('Нечего продавать');return;}SFX.sell();SFX.coin();vib(20);UI.toast('Продано '+n+' шт за '+fmt(g)+' 💰');statAdd('earned',g);saveGame();UI.market();};
    if(d.querySelector('#mEarth'))d.querySelector('#mEarth').onclick=()=>{let g=0;for(const k of keys)if(!ORES[k].dim)g+=sellN(k,player.inv[k]);SFX.coin();UI.toast('+'+fmt(g)+' 💰');statAdd('earned',g);saveGame();UI.market();};
    d.querySelectorAll('[data-sellq]').forEach(b=>{b.onclick=()=>{const [kind,id,key]=b.getAttribute('data-sellq').split(':');
      const have=kind==='o'?(player.inv[id]||0):((player.mats||{})[id]||0),n=Math.min(have,qtyVal(key,have));if(n<=0)return;
      let g;if(kind==='o')g=sellN(id,n);else{g=sellMat(id,n);player.money+=g;}
      statAdd('earned',g);SFX.coin();vib(10);UI.toast('Продано '+n+' шт за '+fmt(g)+' 💰');if(UI._qty)delete UI._qty[key];saveGame();UI.market();};});
    d.querySelector('#mBack').onclick=()=>{SFX.uiBack();UI.close();};
  },
  forge(){
    const buyPick=()=>{
      const nxt=PICKS.find(p=>p.lv===player.pickLvl+1&&!p.hell);
      if(!nxt){UI.toast('Максимум');return;}
      if(player.money<nxt.cost){UI.toast('Мало монет');SFX.uiBack();return;}
      player.money-=nxt.cost;player.pickLvl=nxt.lv;
      SFX.buy();vib(25);UI.toast('Куплено: '+nxt.name);saveGame();UI.forge();
    };
    const buySword=()=>{
      const nxt=SWORDS.find(p=>p.lv===player.swordLvl+1&&!p.hell);
      if(!nxt){UI.toast('Максимум');return;}
      if(player.money<nxt.cost){UI.toast('Мало монет');SFX.uiBack();return;}
      player.money-=nxt.cost;player.swordLvl=nxt.lv;
      SFX.buy();vib(25);UI.toast('Куплено: '+nxt.name);saveGame();UI.forge();
    };
    const buyArmor=()=>{
      const nxt=ARMORS.find(p=>p.lv===player.armorLvl+1&&!p.hell);
      if(!nxt){UI.toast('Максимум');return;}
      if(player.money<nxt.cost){UI.toast('Мало монет');SFX.uiBack();return;}
      player.money-=nxt.cost;player.armorLvl=nxt.lv;
      recomputeStats();player.hp=player.maxHp;
      SFX.buy();vib(25);UI.toast('Куплено: '+nxt.name);saveGame();UI.forge();
    };
    const buyStack=()=>{
      const lv=player.stackLvl||0;if(lv>=8){UI.toast('Дальше — в Кузнице Ада');return;}
      const cost=Math.round(900*Math.pow(2.3,lv));
      if(player.money<cost){UI.toast('Мало монет');SFX.uiBack();return;}
      player.money-=cost;player.stackLvl=lv+1;SFX.buy();vib(25);UI.toast('📦 Стопка: '+stackCap()+' шт');saveGame();UI.forge();
    };
    const buySlot=()=>{
      if(player.slots>=20){UI.toast('Дальше — в Кузнице Ада');return;}
      const cost=Math.floor(600*Math.pow(2.1,player.slots-8));
      if(player.money<cost){UI.toast('Мало монет');SFX.uiBack();return;}
      player.money-=cost;player.slots++;
      SFX.buy();vib(25);UI.toast('Слотов: '+player.slots);saveGame();UI.forge();
    };
    const buySpeed=()=>{
      const lv=player.digSpeedLvl||0;
      if(lv>=DIG_SPEED_MAX){UI.toast('Максимум');return;}
      const cost=DIG_SPEED_COSTS[lv];
      if(player.money<cost){UI.toast('Мало монет');SFX.uiBack();return;}
      player.money-=cost;player.digSpeedLvl=lv+1;
      player.digSpeed=digSpeedMult(player.digSpeedLvl);
      SFX.buy();vib(25);UI.toast('⚡ Скорость копания: ур. '+player.digSpeedLvl+'/'+DIG_SPEED_MAX);saveGame();UI.forge();
    };
    const buyBarrBase=()=>{
      if(player.money<BARR_BUY){UI.toast('Мало монет');SFX.uiBack();return;}
      player.money-=BARR_BUY;player.barricadeBought=true;player.barricades+=BARR_PACK;
      SFX.buy();vib(30);UI.toast('🧱 Баррикады куплены! +'+BARR_PACK);saveGame();UI.forge();
    };
    const C_LAD=earthSupCost('lad',250,10),C_POT=earthSupCost('med',POTION_COST,1),C_AMMO=earthSupCost('gra',AMMO_COST,AMMO_PACK),
      C_GUNAMMO=curGun()?earthSupCost('amm',curGun().packCost,curGun().pack):0,C_DRILLS=earthSupCost('dri',drillPackCost(),5),
      C_BARR=player.barricadeBought?earthSupCost('bar',BARR_PACK_COST[player.barricadeLvl-1],BARR_PACK):0;
    const buyBarrPack=()=>{
      const cost=C_BARR;
      if(player.money<cost){UI.toast('Мало монет');SFX.uiBack();return;}
      player.money-=cost;player.barricades+=BARR_PACK;
      SFX.buy();vib(20);UI.toast('🧱 +'+BARR_PACK+' баррикад');saveGame();UI.forge();
    };
    const buyBarrUp=()=>{
      if(player.barricadeLvl>=4){UI.toast('Максимум');return;}
      const cost=BARR_UP_COST[player.barricadeLvl];
      if(player.money<cost){UI.toast('Мало монет');SFX.uiBack();return;}
      player.money-=cost;player.barricadeLvl++;
      SFX.buy();vib(25);UI.toast('🧱 Теперь баррикады: '+BARR[player.barricadeLvl-1].name.toLowerCase());saveGame();UI.forge();
    };
    const buyDrillBase=()=>{
      if(player.money<DRILL_BUY_COST){UI.toast('Мало монет');SFX.uiBack();return;}
      player.money-=DRILL_BUY_COST;player.drillBought=true;player.drills+=3;
      SFX.buy();vib(30);UI.toast('🛠️ Бур куплен! +3 бура');saveGame();UI.forge();
    };
    const buyGunUp=()=>{
      const next=GUNS[player.gunLvl];
      if(!next||next.hell){UI.toast('Максимум');return;}
      if(player.money<next.cost){UI.toast('Мало монет');SFX.uiBack();return;}
      player.money-=next.cost;
      const first=player.gunLvl===0;
      player.gunLvl++;
      if(first)player.gunAmmo+=next.pack;
      validateSelection();
      SFX.buy();vib(30);UI.toast(next.icon+' '+next.name+(first?' куплен! +'+next.pack+' патр.':' — улучшено!'));saveGame();UI.forge();
    };
    const buyGunAmmo=()=>{
      const g=curGun();if(!g)return;
      if(player.money<C_GUNAMMO){UI.toast('Мало монет');SFX.uiBack();return;}
      player.money-=C_GUNAMMO;player.gunAmmo+=g.pack;
      SFX.buy();vib(20);UI.toast('+'+g.pack+' патронов');saveGame();UI.forge();
    };
    const buyDrillUp=()=>{
      if(player.drillLvl>=6){UI.toast('Максимум');return;}
      const cost=DRILL_LVL_COST[player.drillLvl];
      if(player.money<cost){UI.toast('Мало монет');SFX.uiBack();return;}
      player.money-=cost;player.drillLvl++;
      SFX.buy();vib(25);UI.toast('Бур ур. '+player.drillLvl);saveGame();UI.forge();
    };
    const buyDrills=()=>{
      const cost=C_DRILLS;
      if(player.money<cost){UI.toast('Мало монет');SFX.uiBack();return;}
      player.money-=cost;player.drills+=5;
      SFX.buy();vib(20);UI.toast('+5 буров');saveGame();UI.forge();
    };
    const buyLadders=()=>{
      const cost=C_LAD;
      if(player.money<cost){UI.toast('Мало монет');SFX.uiBack();return;}
      player.money-=cost;player.ladders+=10;
      SFX.buy();vib(25);UI.toast('+10 лестниц');saveGame();UI.forge();
    };
    const buyGrapple=()=>{
      if(player.money<GRAPPLE_COST){UI.toast('Мало монет');SFX.uiBack();return;}
      player.money-=GRAPPLE_COST;player.grappleUnlocked=true;player.grappleAmmo+=10;
      SFX.buy();vib(30);UI.toast('🪝 Пушка-крюк! +10 снарядов');saveGame();UI.forge();
    };
    const buyAmmo=()=>{
      if(!player.grappleUnlocked){UI.toast('Сначала купите крюк');SFX.uiBack();return;}
      if(player.money<C_AMMO){UI.toast('Мало монет');SFX.uiBack();return;}
      player.money-=C_AMMO;player.grappleAmmo+=AMMO_PACK;
      SFX.buy();vib(20);UI.toast('+'+AMMO_PACK+' снарядов');saveGame();UI.forge();
    };
    const buyTorch=()=>{
      if(player.torchLvl>=5){UI.toast('Максимум');return;}
      const cost=TORCH_COSTS[player.torchLvl];
      if(player.money<cost){UI.toast('Мало монет');SFX.uiBack();return;}
      player.money-=cost;player.torchLvl++;
      SFX.buy();vib(25);UI.toast('Факел ур. '+player.torchLvl);saveGame();UI.forge();
    };
    const buyPotion=()=>{
      if(player.money<C_POT){UI.toast('Мало монет');SFX.uiBack();return;}
      player.money-=C_POT;player.potions++;
      SFX.buy();vib(20);UI.toast('🧪 Аптечка: '+player.potions);saveGame();UI.forge();
    };
    const buyFall=()=>{
      if(player.fallProtLvl>=3){UI.toast('Максимум');return;}
      const cost=FALL_COSTS[player.fallProtLvl];
      if(player.money<cost){UI.toast('Мало монет');SFX.uiBack();return;}
      player.money-=cost;player.fallProtLvl++;
      SFX.buy();vib(25);UI.toast('Амортизаторы ур. '+player.fallProtLvl);saveGame();UI.forge();
    };

    const nextPick=PICKS.find(p=>p.lv===player.pickLvl+1&&!p.hell);
    const nextSword=SWORDS.find(p=>p.lv===player.swordLvl+1&&!p.hell);
    const nextArmor=ARMORS.find(p=>p.lv===player.armorLvl+1&&!p.hell);
    const slotCost=Math.floor(600*Math.pow(2.1,player.slots-8));
    const spCost=(player.digSpeedLvl||0)>=DIG_SPEED_MAX?0:DIG_SPEED_COSTS[player.digSpeedLvl||0];
    const torchCost=player.torchLvl>=5?0:TORCH_COSTS[player.torchLvl];
    const fallCost=player.fallProtLvl>=3?0:FALL_COSTS[player.fallProtLvl];
    const curPick=PICKS[player.pickLvl-1];
    const curSword=SWORDS[player.swordLvl-1];
    const curArmor=ARMORS[player.armorLvl-1];

    const d=this.build('forge',`
      <div class="card" style="max-width:560px;width:96vw">
        <h3>Кузница и лавка</h3>
        <div class="bal"><span>Баланс</span><b style="color:#ffd98a">${fmt(player.money)} 💰</b></div>
        ${hellPricesOn()?'<p class="tiny" style="margin:-4px 0 8px;color:#ffb48a">🌀 Портал открыт: расходники (лестницы, аптечки, снаряды, патроны, буры, баррикады) стоят столько же, сколько в Аду</p>':''}
        <div class="item"><div class="ico" style="background:linear-gradient(135deg,#9aa6b0,#5a6470);display:flex;align-items:center;justify-content:center;font-size:16px">⛏</div>
          <div class="txt"><div class="nm">${curPick.name} ${nextPick?'→ '+nextPick.name:''}</div>
          <div class="ds">Скорость ×${curPick.speed.toFixed(2)}${nextPick?' → ×'+nextPick.speed.toFixed(2):''}${nextPick?'<br>Откроет руду: '+oreUnlockText(nextPick.lv):''}</div></div>
          ${nextPick?`<button class="btn small" id="bPick" ${player.money<nextPick.cost?'disabled':''}>${fmt(nextPick.cost)} 💰</button>`:'<span class="tiny">MAX</span>'}
        </div>
        <div class="item"><div class="ico" style="background:linear-gradient(135deg,#e0e8f0,#7a8a9a);display:flex;align-items:center;justify-content:center;font-size:16px">⚔️</div>
          <div class="txt"><div class="nm">Оружие: ${curSword.name}${nextSword?' → '+nextSword.name:''}</div>
          <div class="ds">Урон ${curSword.dmg}${nextSword?' → '+nextSword.dmg:''}</div></div>
          ${nextSword?`<button class="btn small" id="bSword" ${player.money<nextSword.cost?'disabled':''}>${fmt(nextSword.cost)} 💰</button>`:'<span class="tiny">MAX</span>'}
        </div>
        <div class="item"><div class="ico" style="background:linear-gradient(135deg,#6fa8e0,#2a4a80);display:flex;align-items:center;justify-content:center;font-size:16px">🛡</div>
          <div class="txt"><div class="nm">Броня: ${curArmor.name}${nextArmor?' → '+nextArmor.name:''}</div>
          <div class="ds">HP ${curArmor.hp} · Защита ${Math.round(curArmor.red*100)}%</div></div>
          ${nextArmor?`<button class="btn small" id="bArmor" ${player.money<nextArmor.cost?'disabled':''}>${fmt(nextArmor.cost)} 💰</button>`:'<span class="tiny">MAX</span>'}
        </div>

        <div style="margin:14px 0 6px;color:#e0b86a;font-size:12px;letter-spacing:1px;text-transform:uppercase;border-top:1px solid rgba(255,255,255,.1);padding-top:10px">Инструменты</div>

        <div class="item"><div class="ico" style="background:linear-gradient(135deg,#8fa8c8,#2a4a68)"></div>
          <div class="txt"><div class="nm">🪝 Пушка-крюк</div>
          <div class="ds">${player.grappleUnlocked?('Разблокировано · снарядов: '+player.grappleAmmo):'Дальность '+GRAPPLE_RANGE+' блоков, подтягивает, можно качаться и лазать по верёвке'}</div></div>
          ${player.grappleUnlocked?'<span class="pill" style="background:rgba(120,200,255,.2);color:#7fcaff">✓</span>':`<button class="btn small" id="bGrapple" ${player.money<GRAPPLE_COST?'disabled':''}>${fmt(GRAPPLE_COST)} 💰</button>`}
        </div>
        ${player.grappleUnlocked?`
        <div class="item"><div class="ico" style="background:linear-gradient(135deg,#c8a878,#7a5a30)"></div>
          <div class="txt"><div class="nm">🚀 Снаряды ×${AMMO_PACK}</div>
          <div class="ds">У вас: ${player.grappleAmmo} шт</div></div>
          <button class="btn small" id="bAmmo" ${player.money<C_AMMO?'disabled':''}>${fmt(C_AMMO)} 💰</button>
        </div>`:''}
        <div class="item"><div class="ico" style="background:linear-gradient(135deg,#ffe9a8,#f0a33c)"></div>
          <div class="txt"><div class="nm">🔦 Факел (ур. ${player.torchLvl}/5)</div>
          <div class="ds">Радиус света +${player.torchLvl*42}% · глубже темнее: для Бездны нужен ур. 4+</div></div>
          ${player.torchLvl>=5?'<span class="tiny">MAX</span>':`<button class="btn small" id="bTorch" ${player.money<torchCost?'disabled':''}>${fmt(torchCost)} 💰</button>`}
        </div>
        <div class="item"><div class="ico" style="background:linear-gradient(135deg,#5ee06a,#1f7a52)"></div>
          <div class="txt"><div class="nm">🧪 Аптечка</div>
          <div class="ds">У вас: ${player.potions} шт · +30% HP. Выберите в «Предметах», лечение — кнопкой «Стрелять»</div></div>
          <button class="btn small" id="bPotion" ${player.money<C_POT?'disabled':''}>${fmt(C_POT)} 💰</button>
        </div>
        <div class="item"><div class="ico" style="background:linear-gradient(135deg,#a05ce0,#5a2a90)"></div>
          <div class="txt"><div class="nm">🥾 Амортизаторы (ур. ${player.fallProtLvl}/3)</div>
          <div class="ds">Урон от падения: −${player.fallProtLvl*20}%</div></div>
          ${player.fallProtLvl>=3?'<span class="tiny">MAX</span>':`<button class="btn small" id="bFall" ${player.money<fallCost?'disabled':''}>${fmt(fallCost)} 💰</button>`}
        </div>
        <div class="item"><div class="ico" style="background:linear-gradient(135deg,#e0a860,#7a4a20)"></div>
          <div class="txt"><div class="nm">🪜 Лестницы ×10</div>
          <div class="ds">У вас: ${player.ladders} шт</div></div>
          <button class="btn small" id="bLad" ${player.money<C_LAD?'disabled':''}>${fmt(C_LAD)} 💰</button>
        </div>

        <div style="margin:14px 0 6px;color:#e0b86a;font-size:12px;letter-spacing:1px;text-transform:uppercase;border-top:1px solid rgba(255,255,255,.1);padding-top:10px">Огнестрельное (кнопка «Стрелять», автоприцел)</div>
        ${(()=>{
          const cg=curGun(),ng=(GUNS[player.gunLvl]&&!GUNS[player.gunLvl].hell)?GUNS[player.gunLvl]:null;
          const dmgTxt=g=>'Урон '+g.dmg+(g.pellets>1?'×'+g.pellets:'');
          return `
        <div class="item"><div class="ico" style="background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;font-size:16px">${(ng||cg).icon}</div>
          <div class="txt"><div class="nm">Огнестрел: ${cg?cg.name:'нет'}${ng?' → '+ng.name:''}</div>
          <div class="ds">${cg?dmgTxt(cg):'Автоприцел на мобов'}${ng?(cg?' → ':' · ')+dmgTxt(ng)+' · '+ng.desc:''}</div></div>
          ${ng?`<button class="btn small" id="bGunUp" ${player.money<ng.cost?'disabled':''}>${fmt(ng.cost)} 💰</button>`:'<span class="tiny">MAX</span>'}
        </div>
        ${cg?`<div class="item"><div class="ico" style="background:linear-gradient(135deg,#ffb060,#a05010)"></div>
          <div class="txt"><div class="nm">🔸 Патроны ×${cg.pack}</div>
          <div class="ds">У вас: ${player.gunAmmo} · цена зависит от уровня оружия</div></div>
          <button class="btn small" id="bGunAmmo" ${player.money<C_GUNAMMO?'disabled':''}>${fmt(C_GUNAMMO)} 💰</button>
        </div>`:''}`;
        })()}

        <div style="margin:14px 0 6px;color:#e0b86a;font-size:12px;letter-spacing:1px;text-transform:uppercase;border-top:1px solid rgba(255,255,255,.1);padding-top:10px">Копание</div>

        <div class="item"><div class="ico" style="background:linear-gradient(135deg,#ffd98a,#f0a33c)"></div>
          <div class="txt"><div class="nm">⚡ Скорость копания (ур. ${player.digSpeedLvl||0}/${DIG_SPEED_MAX})</div>
          <div class="ds">${(player.digSpeedLvl||0)>=DIG_SPEED_MAX?'Максимум: с киркой VI копаешь почти мгновенно':'Ускоряет копание любой киркой. На максимуме — почти мгновенно'}</div></div>
          ${(player.digSpeedLvl||0)>=DIG_SPEED_MAX?'<span class="tiny">MAX</span>':`<button class="btn small" id="bSpd" ${player.money<spCost?'disabled':''}>${fmt(spCost)} 💰</button>`}
        </div>
        ${!player.drillBought?`
        <div class="item"><div class="ico" style="background:linear-gradient(135deg,#ffd98a,#c8781a)"></div>
          <div class="txt"><div class="nm">🛠️ Бур</div>
          <div class="ds">Пробивает туннель в направлении тапа. После покупки откроются снаряды и улучшения</div></div>
          <button class="btn small" id="bDrillBuy" ${player.money<DRILL_BUY_COST?'disabled':''}>${fmt(DRILL_BUY_COST)} 💰</button>
        </div>`:`
        <div class="item"><div class="ico" style="background:linear-gradient(135deg,#ffd98a,#c8781a)"></div>
          <div class="txt"><div class="nm">🛠️ Бур (ур. ${player.drillLvl}/6)</div>
          <div class="ds">Мощность ${drillPower()} · ширина ${drillWidth()}${player.drillLvl<6?' → мощность '+DRILL_POWER[player.drillLvl]:''}</div></div>
          ${player.drillLvl>=6?'<span class="tiny">MAX</span>':`<button class="btn small" id="bDrillUp" ${player.money<DRILL_LVL_COST[player.drillLvl]?'disabled':''}>${fmt(DRILL_LVL_COST[player.drillLvl])} 💰</button>`}
        </div>
        <div class="item"><div class="ico" style="background:linear-gradient(135deg,#ffb060,#a05010)"></div>
          <div class="txt"><div class="nm">🧰 Буры ×5</div>
          <div class="ds">У вас: ${player.drills} шт · одноразовые · цена растёт с уровнем бура</div></div>
          <button class="btn small" id="bDrills" ${player.money<C_DRILLS?'disabled':''}>${fmt(C_DRILLS)} 💰</button>
        </div>`}
        ${!player.barricadeBought?`
        <div class="item"><div class="ico" style="background:linear-gradient(135deg,#a8743e,#4a2c14);display:flex;align-items:center;justify-content:center;font-size:15px">🧱</div>
          <div class="txt"><div class="nm">Баррикады</div>
          <div class="ds">Защитные блоки: ставятся кнопкой «Ставить», мобы тратят время, чтобы их сломать. Комплект ×${BARR_PACK}</div></div>
          <button class="btn small" id="bBarrBuy" ${player.money<BARR_BUY?'disabled':''}>${fmt(BARR_BUY)} 💰</button>
        </div>`:`
        <div class="item"><div class="ico" style="background:linear-gradient(135deg,#a8743e,#4a2c14);display:flex;align-items:center;justify-content:center;font-size:15px">🧱</div>
          <div class="txt"><div class="nm">Баррикада: ${BARR[player.barricadeLvl-1].name.toLowerCase()} (ур. ${player.barricadeLvl}/4)</div>
          <div class="ds">Прочность ${BARR[player.barricadeLvl-1].hp}${player.barricadeLvl<4?' → '+BARR[player.barricadeLvl].name.toLowerCase()+' '+BARR[player.barricadeLvl].hp:''}</div></div>
          ${player.barricadeLvl>=4?'<span class="tiny">MAX</span>':`<button class="btn small" id="bBarrUp" ${player.money<BARR_UP_COST[player.barricadeLvl]?'disabled':''}>${fmt(BARR_UP_COST[player.barricadeLvl])} 💰</button>`}
        </div>
        <div class="item"><div class="ico" style="background:linear-gradient(135deg,#c89060,#6a4018)"></div>
          <div class="txt"><div class="nm">🧱 Баррикады ×${BARR_PACK}</div>
          <div class="ds">У вас: ${player.barricades} шт · новые ставятся текущего уровня</div></div>
          <button class="btn small" id="bBarrPack" ${player.money<C_BARR?'disabled':''}>${fmt(C_BARR)} 💰</button>
        </div>`}
        <div class="item"><div class="ico" style="background:linear-gradient(135deg,#5ce0a0,#1f7a52)"></div>
          <div class="txt"><div class="nm">🎒 Слоты рюкзака (${player.slots}/20)</div>
          <div class="ds">Сколько видов руды помещается. Новый вид при полном рюкзаке уходит скупщику за ½ цены</div></div>
          ${player.slots>=20?'<span class="tiny">MAX</span>':`<button class="btn small" id="bSlot" ${player.money<slotCost?'disabled':''}>${fmt(slotCost)} 💰</button>`}
        </div>
        <div class="item"><div class="ico" style="background:linear-gradient(135deg,#c8a060,#5a3a10)"></div>
          <div class="txt"><div class="nm">📦 Вместимость стопки (${stackCap()} шт)</div>
          <div class="ds">Сколько штук одной руды помещается. Излишек — за ½ цены</div></div>
          ${(player.stackLvl||0)>=8?'<span class="tiny">MAX</span>':`<button class="btn small" id="bStack" ${player.money<Math.round(900*Math.pow(2.3,player.stackLvl||0))?'disabled':''}>${fmt(Math.round(900*Math.pow(2.3,player.stackLvl||0)))} 💰</button>`}
        </div>
      </div>
      <button class="btn alt" id="fBack">Выйти</button>
    `);
    if(d.querySelector('#bPick'))d.querySelector('#bPick').onclick=buyPick;
    if(d.querySelector('#bSword'))d.querySelector('#bSword').onclick=buySword;
    if(d.querySelector('#bArmor'))d.querySelector('#bArmor').onclick=buyArmor;
    if(d.querySelector('#bSpd'))d.querySelector('#bSpd').onclick=buySpeed;
    if(d.querySelector('#bDrillUp'))d.querySelector('#bDrillUp').onclick=buyDrillUp;
    if(d.querySelector('#bDrills'))d.querySelector('#bDrills').onclick=buyDrills;
    if(d.querySelector('#bSlot'))d.querySelector('#bSlot').onclick=buySlot;
    if(d.querySelector('#bStack'))d.querySelector('#bStack').onclick=buyStack;
    if(d.querySelector('#bLad'))d.querySelector('#bLad').onclick=buyLadders;
    if(d.querySelector('#bGrapple'))d.querySelector('#bGrapple').onclick=buyGrapple;
    if(d.querySelector('#bAmmo'))d.querySelector('#bAmmo').onclick=buyAmmo;
    if(d.querySelector('#bTorch'))d.querySelector('#bTorch').onclick=buyTorch;
    if(d.querySelector('#bPotion'))d.querySelector('#bPotion').onclick=buyPotion;
    if(d.querySelector('#bFall'))d.querySelector('#bFall').onclick=buyFall;
    if(d.querySelector('#bDrillBuy'))d.querySelector('#bDrillBuy').onclick=buyDrillBase;
    if(d.querySelector('#bBarrBuy'))d.querySelector('#bBarrBuy').onclick=buyBarrBase;
    if(d.querySelector('#bBarrPack'))d.querySelector('#bBarrPack').onclick=buyBarrPack;
    if(d.querySelector('#bBarrUp'))d.querySelector('#bBarrUp').onclick=buyBarrUp;
    if(d.querySelector('#bGunUp'))d.querySelector('#bGunUp').onclick=buyGunUp;
    if(d.querySelector('#bGunAmmo'))d.querySelector('#bGunAmmo').onclick=buyGunAmmo;
    d.querySelector('#fBack').onclick=()=>{SFX.uiBack();UI.close();};
  },
  portal(){
    const reqs=portalReqs(),all=reqs.every(r=>r.ok||r.opt),open=!!player.prog.hellUnlocked;
    const dd=this.build('portal',`
      <div class="card" style="max-width:480px;width:96vw;text-align:center">
        <h3 style="text-align:center">🌀 Портал в Ад</h3>
        <div style="width:118px;height:118px;margin:6px auto 10px;border-radius:50%;
          background:radial-gradient(circle at 50% 50%, ${open?'#ffd080 0%, #ff4a1a 35%, #6a0a0a 68%':'#d8a0ff 0%, #6a2ad0 40%, #1a0a30 70%'}, #0a0518 100%);
          box-shadow:0 0 40px ${open?'rgba(255,90,30,.7)':'rgba(150,80,255,.6)'}, inset 0 0 30px rgba(255,255,255,.25);"></div>
        ${open?`<p class="muted">Портал открыт навсегда. Путь в Ад бесплатный.</p>`:`
        <p class="muted" style="margin-bottom:8px">Чтобы пройти, нужно быть полностью готовым:</p>
        ${reqs.map(r=>`<div class="chk ${r.ok?'ok':r.opt?'':'no'}" ${!r.ok&&r.opt?'style="opacity:.7"':''}>${r.ok?'✔':r.opt?'○':'✘'} ${r.t}${r.opt?' <span class="tiny">(необязательно)</span>':''}<b>${r.v}</b></div>`).join('')}
        <p class="tiny" style="margin-top:8px">Сердце, Ключ и 2 000 000 монет уйдут на открытие портала.</p>`}
      </div>
      ${open?`<button class="btn" id="poGo">🔥 Отправиться в Ад</button>`:`<button class="btn" id="poOpen" ${all?'':'disabled'}>🔥 Открыть портал</button>`}
      <button class="btn alt" id="poBack">Закрыть</button>
    `);
    SFX.portal();
    if(dd.querySelector('#poGo'))dd.querySelector('#poGo').onclick=()=>startCutscene(1);
    if(dd.querySelector('#poOpen'))dd.querySelector('#poOpen').onclick=()=>{
      if(!portalReqs().every(r=>r.ok||r.opt)){UI.toast('Не все условия выполнены');return;}
      if(!cheats.infMoney)player.money-=PORTAL_COST;
      player.prog.hellUnlocked=true;player.prog.heartUsed=true;
      saveGame();startCutscene(1);
    };
    dd.querySelector('#poBack').onclick=()=>{SFX.uiBack();UI.close();};
  },
  anchor(a){
    const tg=anchorTargets(a);
    const lbl=(d,dir)=>{if(!d)return '';
      if(d.exit)return 'К выходу из шахты';
      if(d.arena)return 'На арену Пожирателя ('+ARENA_FLOOR+' м)';
      return BIOMES[d.bi].n+' · '+d.y+' м';};
    const d=this.build('anchor',`
      <div class="card ${G.dim===1?'hell':''}" style="max-width:440px;width:94vw;text-align:center">
        <h3 style="text-align:center">⚓ Якорь · ${BIOMES[a.bi].n}</h3>
        <p class="muted" style="margin-bottom:10px">Якоря связаны между соседними биомами. Куда отправиться?</p>
        ${tg.up?`<button class="btn" id="anUp" style="margin:0 auto 8px">⬆ ${lbl(tg.up)}</button>`:''}
        ${tg.down?`<button class="btn" id="anDown" style="margin:0 auto 8px">⬇ ${lbl(tg.down)}</button>`:`<p class="tiny">Ниже якорей нет.</p>`}
      </div>
      <button class="btn alt" id="anStay">Остаться</button>`);
    SFX.portal();
    if(d.querySelector('#anUp'))d.querySelector('#anUp').onclick=()=>anchorTravel(tg.up);
    if(d.querySelector('#anDown'))d.querySelector('#anDown').onclick=()=>anchorTravel(tg.down);
    d.querySelector('#anStay').onclick=()=>{SFX.uiBack();UI.close();};
  },
  hfurnace(tab){
    tab=tab||UI._hfTab||'ingot';UI._hfTab=tab;
    const F=furn(),lines=FURN_LINES[F.lvl|0],sp=FURN_SPEED[F.lvl|0];
    const tierOK=r=>r.tier<=Math.max(6,player.pickLvl);
    const list=SMELT.filter(r=>r.tab===tab);
    const maxN=r=>{let n=99;const c=r.c||0;if(c>0&&!cheats.infMoney)n=Math.min(n,Math.floor(player.money/c));
      for(const k in (r.o||{}))n=Math.min(n,Math.floor((player.inv[k]||0)/r.o[k]));for(const k in (r.m||{}))n=Math.min(n,Math.floor(matN(k)/r.m[k]));return Math.max(0,n);};
    const row=r=>{const M=MATS[r.out],mx=maxN(r),lock=!tierOK(r);
      return `<div class="item" style="flex-wrap:wrap;${lock?'opacity:.5':''}">
        <div class="ico" style="background:${M.col};display:flex;align-items:center;justify-content:center;font-size:14px">${M.kind==='ingot'?'':M.ic}</div>
        <div class="txt"><div class="nm">${M.n} <span class="tiny">· есть ${matN(r.out)}</span></div>
        <div class="ds">${(r.time/sp).toFixed(1)} с/шт${lock?' · <b style="color:#ff9a8a">нужна кирка '+['','','','','','','VI','VII','VIII','IX','X'][r.tier]+'</b>':''}</div>
        <div class="cost" data-fc="${r.id}">${costChips(r,mx>=1?qtyVal('f'+r.id,mx):1)}</div></div>
        ${mx>=1&&!lock?`<div class="qline"><div class="qwrap">${qtyHtml('f'+r.id,mx)}<div class="qsum">в печь <b data-qs="f${r.id}">1</b> шт · ≈<b data-qt="f${r.id}">0</b> с</div></div>
          <button class="btn small" data-qf="${r.id}">🔥 Плавить</button></div>`:`<button class="btn small" disabled>${lock?'Закрыто':'Не хватает'}</button>`}
      </div>`;};
    const qHtml=F.q.length?F.q.map((j,i)=>{const r=SMELT_BY[j.r],M=MATS[r.out],act=i<lines;
      return `<div class="item" style="padding:6px 8px"><div class="txt"><div class="nm" style="font-size:13px">${M.ic==='▰'?'▰':M.ic} ${M.n} ×${j.n}</div>
        <div style="height:5px;border-radius:3px;background:rgba(255,255,255,.08);margin-top:4px;overflow:hidden"><div data-qbar="${i}" style="height:100%;width:${act?Math.round(100*j.t/r.time):0}%;background:${act?'#ff8a3a':'#555'}"></div></div>
        <div class="tiny">${act?'плавится':'ждёт'} · осталось ~${Math.ceil((j.n*r.time-j.t)/sp)} с</div></div>
        <button class="btn small alt" data-cancel="${i}" style="padding:6px 9px">✕</button></div>`;}).join(''):'<p class="tiny" style="padding:4px 2px">Очередь пуста. Печь работает и пока ты в шахте.</p>';
    const mats=Object.keys(player.mats||{}).filter(k=>matN(k)>0);
    const matsHtml=mats.length?mats.map(k=>`<span style="border-left:3px solid ${MATS[k].col}">${MATS[k].kind==='ingot'?'▰':MATS[k].ic} ${MATS[k].n} <b>${matN(k)}</b></span>`).join(''):'<span>пусто</span>';
    const d=this.build('hfurnace',`
      <div class="card hell" style="max-width:580px;width:96vw">
        <h3>🔥 Печь</h3>
        <div class="bal"><span>Горнов: ${lines} · скорость ×${sp}</span><b style="color:#ffd98a">${fmt(player.money)} 💰</b></div>
        <div class="sect" style="margin-top:4px">Очередь (${F.q.length}/8)</div>${qHtml}
        <div class="tabs" style="margin-top:8px">
          <button data-tab="ingot" class="${tab==='ingot'?'on':''}">▰ Слитки</button>
          <button data-tab="alloy" class="${tab==='alloy'?'on':''}">⬢ Сплавы</button>
          <button data-tab="comp" class="${tab==='comp'?'on':''}">⚙️ Компоненты</button>
          <button data-tab="bag" class="${tab==='bag'?'on':''}">📦 Склад</button></div>
        ${tab==='bag'?`<div class="cost" style="gap:6px">${matsHtml}</div><p class="tiny" style="margin-top:8px">Слитки делаются из 3 руды. Сплавы и компоненты нужны в Кузнице Ада. Части врагов (клыки, угли, кровь, железы, кости) падают с мобов Ада.</p>`
          :list.map(row).join('')}
      </div>
      <button class="btn alt" id="hfBack">Выйти</button>`);
    d.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{SFX.ui();UI.hfurnace(b.getAttribute('data-tab'));});
    wireQty(d,(key,v)=>{const id=key.slice(1),r=SMELT_BY[id];if(!r)return;const a=d.querySelector(`[data-qs="${key}"]`),t=d.querySelector(`[data-qt="${key}"]`),c=d.querySelector(`[data-fc="${id}"]`);
      if(a)a.textContent=v;if(t)t.textContent=Math.ceil(v*r.time/sp);if(c)c.innerHTML=costChips(r,v);});
    d.querySelectorAll('[data-qf]').forEach(b=>b.onclick=()=>{const id=b.getAttribute('data-qf'),r=SMELT_BY[id],mx=maxN(r),n=Math.min(mx,qtyVal('f'+id,mx));
      if(n>0&&furnQueue(id,n)){SFX.buy();vib(15);UI.toast('🔥 В печь: '+MATS[r.out].n+' ×'+n);if(UI._qty)delete UI._qty['f'+id];saveGame();UI.hfurnace();}else{UI.toast('Не хватает');SFX.uiBack();}});
    d.querySelectorAll('[data-cancel]').forEach(b=>b.onclick=()=>{furnCancel(+b.getAttribute('data-cancel'));SFX.uiBack();saveGame();UI.hfurnace();});
    d.querySelector('#hfBack').onclick=()=>{SFX.uiBack();clearInterval(UI._hfTimer);UI.close();};
    clearInterval(UI._hfTimer);
    UI._hfTimer=setInterval(()=>{
      if(UI.modal!=='hfurnace'){clearInterval(UI._hfTimer);return;}
      updateFurnace(0.25);
      if(UI._furnDirty&&!UI._qDrag){UI._furnDirty=false;UI.hfurnace();return;}
      const F2=furn();d.querySelectorAll('[data-qbar]').forEach(el=>{const j=F2.q[+el.getAttribute('data-qbar')];if(j&&+el.getAttribute('data-qbar')<FURN_LINES[F2.lvl|0])el.style.width=Math.round(100*j.t/SMELT_BY[j.r].time)+'%';});
    },250);
  },
  hforge(tab){
    tab=tab||UI._hgTab||'gear';UI._hgTab=tab;
    const tierName=['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI'];
    const gear=(kind,arr,cur,label,stat)=>{
      const n=gearNext(kind),c=arr[clamp(cur-1,0,arr.length-1)];
      if(!n)return `<div class="item"><div class="txt"><div class="nm">${label}: ${c?c.name:'—'}</div><div class="ds">Максимум</div></div><span class="tiny">MAX</span></div>`;
      const nx=arr[n.lv-1];
      return `<div class="item" style="flex-wrap:wrap"><div class="ico" style="background:rgba(255,140,60,.15);display:flex;align-items:center;justify-content:center;font-size:15px">${kind==='pick'?'⛏':kind==='sword'?'⚔️':kind==='armor'?'🛡':(nx.icon||'🔫')}</div>
        <div class="txt"><div class="nm">${nx.name}</div><div class="ds">${stat(c,nx)}${!n.ready?' · <b style="color:#ff9a8a">сначала ур. VI на Земле</b>':''}</div>
        <div class="cost">${costChips(n.r)}</div></div>
        <button class="btn small" data-gear="${kind}" ${n.ready&&canPay(n.r)?'':'disabled'}>Ковать</button></div>`;};
    let body='';
    if(tab==='gear'){
      body=gear('pick',PICKS,player.pickLvl,'Кирка',(c,n)=>'Скорость ×'+c.speed.toFixed(1)+' → ×'+n.speed.toFixed(1)+'<br>Откроет: '+oreUnlockText(n.lv))
        +gear('sword',SWORDS,player.swordLvl,'Оружие',(c,n)=>'Урон '+c.dmg+' → '+n.dmg)
        +gear('armor',ARMORS,player.armorLvl,'Броня',(c,n)=>'HP '+c.hp+' → '+n.hp+' · защита '+Math.round(n.red*100)+'% · жаростойкость '+Math.round((n.heat||0)*100)+'%')
        +(player.gunLvl>=6?gear('gun',GUNS,player.gunLvl,'Огнестрел',(c,n)=>(c?c.name+' → ':'')+n.desc+' · урон '+n.dmg+(n.pellets>1?'×'+n.pellets:'')):'<p class="tiny">Огнестрел Ада откроется после Пустотного излучателя (ур. VI на Земле).</p>')
        +`<div class="sect">Линейка огнестрела Ада</div>`+GUNS.filter(g=>g.hell).map(g=>`<div class="chk ${player.gunLvl>=g.lv?'ok':'no'}">${g.icon} ${g.name}<b>${player.gunLvl>=g.lv?'есть':'ур. '+g.lv}</b></div>`).join('');
    }else if(tab==='upg'){
      body=HUPG.map(u=>{const lv=u.cur();
        if(u.id==='drill'&&!player.drillBought||u.id==='barr'&&!player.barricadeBought)return `<div class="item"><div class="txt"><div class="nm">${u.ic} ${u.n}</div><div class="ds">Сначала купи на Земле</div></div></div>`;
        const lockLow=lv<u.min,max=lv>=u.max;
        return `<div class="item" style="flex-wrap:wrap"><div class="ico" style="background:rgba(255,140,60,.15);display:flex;align-items:center;justify-content:center;font-size:15px">${u.ic}</div>
          <div class="txt"><div class="nm">${u.n} · ${lv}/${u.max}</div><div class="ds">${lockLow?'Сначала прокачай на Земле до '+u.min:u.desc(lv)}</div>
          ${!max&&!lockLow?`<div class="cost">${costChips(u.cost(lv))}</div>`:''}</div>
          ${max?'<span class="tiny">MAX</span>':`<button class="btn small" data-upg="${u.id}" ${!lockLow&&canPay(u.cost(lv))?'':'disabled'}>Улучшить</button>`}</div>`;}).join('');
    }else if(tab==='items'){
      body=HITEMS.map(it=>{const lv=itemLv(it.id),max=lv>=it.max;
        return `<div class="item" style="flex-wrap:wrap"><div class="ico" style="background:rgba(255,140,60,.15);display:flex;align-items:center;justify-content:center;font-size:15px">${it.ic}</div>
          <div class="txt"><div class="nm">${it.n}${it.max>1?' · '+lv+'/'+it.max:''}</div><div class="ds">${it.desc(lv)}</div>${!max?`<div class="cost">${costChips(it.cost(lv))}</div>`:''}</div>
          ${max?'<span class="pill" style="background:rgba(120,255,160,.15);color:#7dffb0">✓</span>':`<button class="btn small" data-item="${it.id}" ${canPay(it.cost(lv))?'':'disabled'}>${lv?'Улучшить':'Создать'}</button>`}</div>`;}).join('')
        +`<div class="sect">Расходники</div>`+HCONS.map(c=>`<div class="item" style="flex-wrap:wrap"><div class="ico" style="background:rgba(255,140,60,.15);display:flex;align-items:center;justify-content:center;font-size:15px">${c.ic}</div>
          <div class="txt"><div class="nm">${c.n} <span class="tiny">· есть ${(player.hitems&&player.hitems[c.id])||0}</span></div><div class="ds">${c.desc}</div><div class="cost">${costChips(c.cost)}</div></div>
          <button class="btn small" data-cons="${c.id}" ${canPay(c.cost)?'':'disabled'}>Создать</button></div>`).join('')
        +`<div class="item" style="flex-wrap:wrap"><div class="ico" style="background:rgba(120,200,255,.15);display:flex;align-items:center;justify-content:center;font-size:15px">🧊</div>
          <div class="txt"><div class="nm">Ледяное зелье ×2 <span class="tiny">· есть ${player.icePotions}</span></div><div class="ds">Сбрасывает Жар и охлаждает на 25 с</div><div class="cost">${costChips({c:40000,m:{i27:1}})}</div></div>
          <button class="btn small" id="hgIce" ${canPay({c:40000,m:{i27:1}})?'':'disabled'}>Создать</button></div>`
        +`<div class="sect">Хранение</div><div class="item" style="flex-wrap:wrap"><div class="ico" style="background:rgba(200,144,74,.2);display:flex;align-items:center;justify-content:center;font-size:15px">📦</div>
          <div class="txt"><div class="nm">Ящик для хранения <span class="tiny">· с собой ${packedCrates().length} · всего ${crateTotal()}/${CRATE_MAX}</span></div><div class="ds">Хранит любую руду и материалы без ограничений. Ставится в лобби и в шахте («Ставить»), переименовывается, разбирается вместе с содержимым. Ящики в шахте видны на мини-карте.</div><div class="cost">${costChips(CRATE_COST)}</div></div>
          <button class="btn small" id="hgCrate" ${canPay(CRATE_COST)&&crateTotal()<CRATE_MAX?'':'disabled'}>Создать</button></div>`
        +`<div class="item" style="flex-wrap:wrap"><div class="ico" style="background:rgba(127,240,255,.15);display:flex;align-items:center;justify-content:center;font-size:15px">🤖</div>
          <div class="txt"><div class="nm">Робот-кладовщик <span class="cnt">${botUnits().length}/${BOT_MAX}</span></div><div class="ds">Ставится в лобби Ада. Назначь ящик-приёмник и фильтры ящиков — роботы сами разнесут всё по местам (по ${botLoad()} шт за ходку) и делят работу между собой. Имя, скин и прокачки — в меню робота (тапни по нему).</div>${botUnits().length<BOT_MAX?`<div class="cost">${costChips(BOT_COST)}</div>`:''}</div>
          ${botUnits().length>=BOT_MAX?'<span class="pill" style="background:rgba(120,255,160,.15);color:#7dffb0">MAX</span>':`<button class="btn small" id="hgBot" ${canPay(BOT_COST)?'':'disabled'}>Создать</button>`}</div>`;
    }else{
      const sup=[
        {id:'lad',ic:'🪜',n:'Лестницы ×20',d:'У вас: '+player.ladders,c:Math.round(hellSupUnit('lad')*20)},
        {id:'med',ic:'🧪',n:'Аптечки ×3',d:'У вас: '+player.potions,c:Math.round(hellSupUnit('med')*3)},
        player.grappleUnlocked?{id:'gra',ic:'🚀',n:'Снаряды крюка ×20',d:'У вас: '+player.grappleAmmo,c:Math.round(hellSupUnit('gra')*20)}:null,
        curGun()?{id:'amm',ic:'🔸',n:'Патроны ×'+curGun().pack,d:'У вас: '+player.gunAmmo,c:Math.round(hellSupUnit('amm')*curGun().pack)}:null,
        player.drillBought?{id:'dri',ic:'🧰',n:'Буры ×5',d:'У вас: '+player.drills,c:Math.round(hellSupUnit('dri')*5)}:null,
        player.barricadeBought?{id:'bar',ic:'🧱',n:'Баррикады ×'+BARR_PACK,d:'У вас: '+player.barricades,c:Math.round(hellSupUnit('bar')*BARR_PACK)}:null
      ].filter(Boolean);
      UI._hgSup=sup;
      body=sup.map(x=>`<div class="item"><div class="ico" style="background:rgba(255,255,255,.08);display:flex;align-items:center;justify-content:center;font-size:16px">${x.ic}</div>
        <div class="txt"><div class="nm">${x.n}</div><div class="ds">${x.d}</div>${x.m?`<div class="cost">${costChips({c:x.c,m:x.m})}</div>`:''}</div>
        <button class="btn small" data-sup="${x.id}" ${canPay({c:x.c,m:x.m})?'':'disabled'}>${x.m?'Создать':fmt(x.c)+' 💰'}</button></div>`).join('');
    }
    const d=this.build('hforge',`
      <div class="card hell" style="max-width:580px;width:96vw">
        <h3>⚒ Кузница Ада</h3>
        <div class="bal"><span>Крафт из сплавов и компонентов Печи</span><b style="color:#ffd98a">${fmt(player.money)} 💰</b></div>
        <div class="tabs"><button data-tab="gear" class="${tab==='gear'?'on':''}">⚔️ Снаряжение</button><button data-tab="upg" class="${tab==='upg'?'on':''}">⬆ Прокачки</button>
          <button data-tab="items" class="${tab==='items'?'on':''}">🎒 Предметы</button><button data-tab="shop" class="${tab==='shop'?'on':''}">🛒 Лавка</button></div>
        ${body}
      </div>
      <button class="btn alt" id="hgBack">Выйти</button>`);
    const done=(msg)=>{SFX.buy();SFX.boom();vib(50);UI.toast(msg);recomputeStats();validateSelection();saveGame();UI.hforge();};
    d.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{SFX.ui();UI.hforge(b.getAttribute('data-tab'));});
    d.querySelectorAll('[data-gear]').forEach(b=>b.onclick=()=>{
      const kind=b.getAttribute('data-gear'),n=gearNext(kind);if(!n||!n.ready||!pay(n.r)){UI.toast('Не хватает материалов');return;}
      if(kind==='pick')player.pickLvl=n.lv;else if(kind==='sword')player.swordLvl=n.lv;else if(kind==='armor'){player.armorLvl=n.lv;recomputeStats();player.hp=player.maxHp;}
      else{player.gunLvl=n.lv;player.gunAmmo+=GUNS[n.lv-1].pack;}
      done('⚒ Выковано: '+(kind==='pick'?PICKS:kind==='sword'?SWORDS:kind==='armor'?ARMORS:GUNS)[n.lv-1].name);});
    d.querySelectorAll('[data-upg]').forEach(b=>b.onclick=()=>{const u=HUPG.find(q=>q.id===b.getAttribute('data-upg')),lv=u.cur();
      if(lv<u.min||lv>=u.max||!pay(u.cost(lv)))return;u.apply();done(u.ic+' '+u.n+': '+u.cur());});
    d.querySelectorAll('[data-item]').forEach(b=>b.onclick=()=>{const it=HITEMS.find(q=>q.id===b.getAttribute('data-item')),lv=itemLv(it.id);
      if(lv>=it.max||!pay(it.cost(lv)))return;if(!player.hitems)player.hitems={};player.hitems[it.id]=lv+1;done(it.ic+' '+it.n+(it.max>1?' ур. '+(lv+1):''));});
    d.querySelectorAll('[data-cons]').forEach(b=>b.onclick=()=>{const c=HCONS.find(q=>q.id===b.getAttribute('data-cons'));if(!pay(c.cost))return;
      if(!player.hitems)player.hitems={};player.hitems[c.id]=(player.hitems[c.id]||0)+c.pack;done(c.ic+' '+c.n);});
    if(d.querySelector('#hgBot'))d.querySelector('#hgBot').onclick=()=>{const S=bot();if(S.units.length>=BOT_MAX||!pay(BOT_COST))return;const U=newBotUnit(S.units.length);
      const used=new Set(S.units.map(u=>u.name));if(used.has(U.name))U.name=BOT_NAMES.find(n=>!used.has(n))||U.name;S.units.push(U);bot();G.placeItem='sorter';SFX.buy();vib(30);validateSelection();saveGame();
      UI.toast('🤖 '+U.name+' собран! В лобби Ада выбери его в «Предметах» и нажми «Ставить»');UI.hforge('items');};
    if(d.querySelector('#hgCrate'))d.querySelector('#hgCrate').onclick=()=>{if(crateTotal()>=CRATE_MAX||!pay(CRATE_COST))return;packedCrates().push(newCrate());G.placeItem='crate';SFX.buy();vib(20);validateSelection();saveGame();UI.toast('📦 Ящик готов — выбери его в «Предметах» и нажми «Ставить»');UI.hforge('items');};
    if(d.querySelector('#hgIce'))d.querySelector('#hgIce').onclick=()=>{if(!pay({c:40000,m:{i27:1}}))return;player.icePotions+=2;SFX.buy();vib(20);validateSelection();saveGame();UI.hforge('items');};
    d.querySelectorAll('[data-sup]').forEach(b=>b.onclick=()=>{const x=(UI._hgSup||[]).find(q=>q.id===b.getAttribute('data-sup'));if(!x||!pay({c:x.c,m:x.m}))return;
      if(x.id==='lad')player.ladders+=20;else if(x.id==='med')player.potions+=3;else if(x.id==='ice')player.icePotions+=2;
      else if(x.id==='gra')player.grappleAmmo+=20;else if(x.id==='amm')player.gunAmmo+=curGun().pack;else if(x.id==='dri')player.drills+=5;else if(x.id==='bar')player.barricades+=BARR_PACK;
      SFX.buy();vib(20);validateSelection();saveGame();UI.hforge();});
    d.querySelector('#hgBack').onclick=()=>{SFX.uiBack();UI.close();};
  },
  altar(tab){
    tab=tab||UI._alTab||'perks';UI._alTab=tab;
    const al=altarLevel(),nextXp=ALTAR_LV[al]||null;
    let body='';
    if(tab==='perks'){
      body=PERKS.map(pk=>{const lv=perkLv(pk.id),c=perkCost(pk),max=lv>=pk.max,lock=(pk.lv||1)>al;
        return `<div class="item" style="${lock?'opacity:.5':''}"><div class="ico" style="background:rgba(120,180,255,.12);display:flex;align-items:center;justify-content:center;font-size:15px">${pk.ic}</div>
        <div class="txt"><div class="nm">${pk.n} · ${lv}/${pk.max}</div><div class="ds">${pk.d}${lock?' · <b style="color:#ff9a8a">алтарь ур. '+pk.lv+'</b>':''}</div></div>
        ${max?'<span class="tiny">MAX</span>':`<button class="btn small" data-perk="${pk.id}" ${!lock&&(player.souls||0)>=c?'':'disabled'}>${fmt(c)} 👻</button>`}</div>`;}).join('');
    }else if(tab==='rit'){
      body=`<p class="tiny" style="margin-bottom:6px">Ритуалы действуют ограниченное время (идёт и в лобби). Можно держать несколько сразу.</p>`+RITUALS.map(r=>{const left=(player.rit&&player.rit[r.id])||0;
        return `<div class="item"><div class="ico" style="background:rgba(255,120,80,.14);display:flex;align-items:center;justify-content:center;font-size:15px">${r.ic}</div>
        <div class="txt"><div class="nm">${r.n}</div><div class="ds">${r.d} · ${Math.round(r.dur/60)} мин${left>0?' · <b style="color:#7dffb0">идёт: '+Math.ceil(left/60)+' мин</b>':''}</div></div>
        <button class="btn small" data-rit="${r.id}" ${(player.souls||0)>=r.s?'':'disabled'}>${left>0?'Продлить ':''}${r.s} 👻</button></div>`;}).join('');
    }else if(tab==='relic'){
      const eq=player.relEq||[],slots=relicSlots();
      body=`<p class="tiny" style="margin-bottom:6px">Надето реликвий: <b>${eq.length}/${slots}</b> (слоты растут с уровнем алтаря). Реликвию создают один раз, потом её можно снимать и надевать.</p>`+RELICS.map(r=>{
        const own=!!(player.relics&&player.relics[r.id]),on=eq.indexOf(r.id)>=0;
        return `<div class="item" style="flex-wrap:wrap;${on?'border-color:#9ad8ff;background:rgba(120,200,255,.08)':''}"><div class="ico" style="background:rgba(120,180,255,.12);display:flex;align-items:center;justify-content:center;font-size:15px">${r.ic}</div>
          <div class="txt"><div class="nm">${r.n}</div><div class="ds">${r.d}</div>${own?'':`<div class="cost">${costChips(r.cost)}</div>`}</div>
          ${own?`<button class="btn small ${on?'':'alt'}" data-eq="${r.id}">${on?'Снять':'Надеть'}</button>`:`<button class="btn small" data-relic="${r.id}" ${canPay(r.cost)?'':'disabled'}>Создать</button>`}</div>`;}).join('');
    }else if(tab==='summon'){
      body=hbAltarBody();
    }else{
      const price=Math.round(4000*Math.pow(1.03,player.soulBuy||0));
      body=`<div class="item"><div class="ico" style="background:rgba(255,217,138,.14);display:flex;align-items:center;justify-content:center;font-size:15px">🪙</div>
        <div class="txt"><div class="nm">Золотое подношение</div><div class="ds">10 душ за ${fmt(price*10)} 💰 (каждое подношение дороже на 3%)</div></div>
        <button class="btn small" id="alBuy" ${player.money>=price*10||cheats.infMoney?'':'disabled'}>Поднести</button></div>
        <div class="item"><div class="ico" style="background:rgba(255,120,80,.14);display:flex;align-items:center;justify-content:center;font-size:15px">🦴</div>
        <div class="txt"><div class="nm">Подношение костей</div><div class="ds">5 Древних костей → 25 душ</div></div>
        <button class="btn small" id="alBone" ${matN('bone')>=5?'':'disabled'}>Поднести</button></div>
        <div class="item"><div class="ico" style="background:rgba(120,180,255,.14);display:flex;align-items:center;justify-content:center;font-size:15px">✨</div>
        <div class="txt"><div class="nm">Очищение эссенции</div><div class="ds">5 Эссенций души → 20 душ</div></div>
        <button class="btn small" id="alEss" ${matN('essence')>=5?'':'disabled'}>Поднести</button></div>`;
    }
    const d=this.build('altar',`
      <div class="card hell" style="max-width:560px;width:96vw">
        <h3>👻 Алтарь душ · ур. ${al}</h3>
        <div class="bal"><span>Души</span><b style="color:#9ad8ff">${fmt(player.souls||0)} 👻</b></div>
        <div style="height:6px;border-radius:3px;background:rgba(255,255,255,.08);overflow:hidden;margin-bottom:4px"><div style="height:100%;width:${nextXp?Math.round(100*((player.altarXp||0)-ALTAR_LV[al-1])/(nextXp-ALTAR_LV[al-1])):100}%;background:linear-gradient(90deg,#5ab8ff,#c8a0ff)"></div></div>
        <p class="tiny" style="margin-bottom:8px">${nextXp?'До ур. '+(al+1)+': '+fmt(nextXp-(player.altarXp||0))+' потраченных душ':'Алтарь максимального уровня'}</p>
        <div class="tabs"><button data-tab="perks" class="${tab==='perks'?'on':''}">✨ Благословения</button><button data-tab="rit" class="${tab==='rit'?'on':''}">🕯 Ритуалы</button>
          <button data-tab="relic" class="${tab==='relic'?'on':''}">💎 Реликвии</button><button data-tab="offer" class="${tab==='offer'?'on':''}">🪙 Подношения</button><button data-tab="summon" class="${tab==='summon'?'on':''}">🔱 Призыв</button></div>
        ${body}
      </div>
      <button class="btn alt" id="alBack">Выйти</button>`);
    d.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{SFX.ui();UI.altar(b.getAttribute('data-tab'));});
    hbAltarBind(d);
    d.querySelectorAll('[data-perk]').forEach(b=>b.onclick=()=>{
      const pk=PERKS.find(q=>q.id===b.getAttribute('data-perk'));const c=perkCost(pk);
      if((player.souls||0)<c||perkLv(pk.id)>=pk.max)return;
      spendSouls(c);player.perks[pk.id]=perkLv(pk.id)+1;recomputeStats();
      SFX.portal();vib(40);UI.toast(pk.ic+' '+pk.n+' — ур. '+player.perks[pk.id]);saveGame();UI.altar();});
    d.querySelectorAll('[data-rit]').forEach(b=>b.onclick=()=>{const r=RITUALS.find(q=>q.id===b.getAttribute('data-rit'));if((player.souls||0)<r.s)return;
      spendSouls(r.s);if(!player.rit)player.rit={};player.rit[r.id]=(player.rit[r.id]||0)+r.dur;if(r.id==='blood')recomputeStats();
      SFX.portal();vib(40);UI.toast(r.ic+' '+r.n+' начат');saveGame();UI.altar();});
    d.querySelectorAll('[data-relic]').forEach(b=>b.onclick=()=>{const r=RELICS.find(q=>q.id===b.getAttribute('data-relic'));
      const c=JSON.parse(JSON.stringify(r.cost));const sl=c.s;delete c.s;if(!canPay(r.cost))return;pay(c);spendSouls(sl);
      if(!player.relics)player.relics={};player.relics[r.id]=true;if(!player.relEq)player.relEq=[];if(player.relEq.length<relicSlots())player.relEq.push(r.id);
      SFX.portal();vib(60);UI.toast(r.ic+' '+r.n+' создана');saveGame();UI.altar();});
    d.querySelectorAll('[data-eq]').forEach(b=>b.onclick=()=>{const id=b.getAttribute('data-eq');if(!player.relEq)player.relEq=[];const i=player.relEq.indexOf(id);
      if(i>=0)player.relEq.splice(i,1);else{if(player.relEq.length>=relicSlots()){UI.toast('Все слоты заняты');return;}player.relEq.push(id);}
      SFX.ui();recomputeStats();saveGame();UI.altar();});
    if(d.querySelector('#alBuy'))d.querySelector('#alBuy').onclick=()=>{const price=Math.round(4000*Math.pow(1.03,player.soulBuy||0))*10;if(player.money<price&&!cheats.infMoney)return;
      if(!cheats.infMoney)player.money-=price;player.soulBuy=(player.soulBuy||0)+1;player.souls=(player.souls||0)+10;SFX.coin();saveGame();UI.altar();};
    if(d.querySelector('#alBone'))d.querySelector('#alBone').onclick=()=>{if(matN('bone')<5)return;player.mats.bone-=5;player.souls=(player.souls||0)+25;SFX.portal();saveGame();UI.altar();};
    if(d.querySelector('#alEss'))d.querySelector('#alEss').onclick=()=>{if(matN('essence')<5)return;player.mats.essence-=5;player.souls=(player.souls||0)+20;SFX.portal();saveGame();UI.altar();};
    d.querySelector('#alBack').onclick=()=>{SFX.uiBack();UI.close();};
  },
  hcasino(game,soft){
    game=game||UI._hcGame||'roulette';UI._hcGame=game;
    const st0=UI._hc||(UI._hc={card:null});
    const GAMESL=[['roulette','🎡 Рулетка'],['bj','🃏 Блэкджек'],['hilo','🎲 Кости'],['skulls','💀 Три черепа'],['swheel','👻 Колесо душ'],['deal','😈 Сделка']];
    const soulGame=game==='skulls'||game==='swheel';
    const pk=game==='deal'?null:cgStakePicker({key:soulGame?'hsoul':'hitem',ores:!soulGame,mats:!soulGame,souls:soulGame});
    const busy=()=>CG.rl.spin||CG.hl.rolling||(CG.sw&&CG.sw.spin)||(CG.bj&&!CG.bj.done);
    const d=this.build('hcasino',`
      <div class="card hell" style="max-width:520px;width:96vw">
        <h3 style="text-align:center">🎰 Казино «Котёл»</h3>
        <div class="bal"><span>Ставки — рудой или слитками. Души — только в играх 💀 и 👻</span><b style="color:#9ad8ff">${fmt(player.souls||0)} 👻</b></div>
        <div class="tabs">${GAMESL.map(g2=>`<button data-g="${g2[0]}" class="${game===g2[0]?'on':''}">${g2[1]}</button>`).join('')}</div>
        <div id="hcBody"></div>
        ${pk?pk.html:''}
      </div>
      <button class="btn alt" id="hcBack">Выйти</button>`);
    const rer=(keepAnim)=>{if(keepAnim){const b2=d.querySelector('#rlSpin');if(b2)b2.disabled=true;return;}if(UI.modal==='hcasino')UI.hcasino(game);};
    d.querySelectorAll('[data-g]').forEach(b2=>b2.onclick=()=>{if(busy())return;st0.card=null;SFX.ui();UI.hcasino(b2.getAttribute('data-g'));});
    d.querySelector('#hcBack').onclick=()=>{if(busy())return;SFX.uiBack();UI.close();};
    if(pk)pk.bind(d,()=>{if(!busy())UI.hcasino(game);});
    const body=d.querySelector('#hcBody');
    if(game==='roulette')cgRoulette(body,pk.st,rer);
    else if(game==='bj')cgBlackjack(body,pk.st,rer);
    else if(game==='hilo')cgHiLo(body,pk.st,rer);
    else if(game==='skulls')cgSkulls(body,pk.st,rer);
    else if(game==='swheel')cgSoulWheel(body,pk.st,rer);
    else{
      const c=st0.card;
      body.innerHTML=`<div style="text-align:center">
        <p class="muted" style="margin-bottom:8px">Демон предлагает сделку: <b>25 душ</b> за одну карту. Обычно там материалы, слитки или золото... но иногда проклятие.</p>
        <div class="row" style="gap:10px;justify-content:center">${[0,1,2].map(i=>`<div data-card="${i}" style="width:84px;height:118px;border-radius:12px;cursor:${c?'default':'pointer'};
          background:${c&&c.i===i?'linear-gradient(160deg,#3a1408,#120404)':'linear-gradient(160deg,#5a1010,#1a0404)'};border:2px solid ${c&&c.i===i?(c.bad?'#ff4a3a':'#ffd060'):'rgba(255,140,80,.4)'};
          display:flex;align-items:center;justify-content:center;flex-direction:column;font-size:${c&&c.i===i?'13px':'34px'};font-weight:800;color:#ffd0a0;padding:6px;box-shadow:0 6px 18px rgba(0,0,0,.5)">${c&&c.i===i?c.html:'😈'}</div>`).join('')}</div>
        <div class="tiny" style="margin-top:8px;min-height:16px;color:#ffb070">${c?c.msg:'Выбери карту'}</div>
        ${c?'<button class="btn" id="hcAgain" style="margin-top:8px;width:100%">Ещё сделку</button>':''}</div>`;
      body.querySelectorAll('[data-card]').forEach(el=>el.onclick=()=>{
        if(st0.card)return;if((player.souls||0)<25){UI.toast('Нужно 25 душ');return;}
        player.souls-=25;
        const t=clamp(player.pickLvl-6,0,4),pool=[[18,27,19,28],[29,20,30,21],[31,22,32,23],[33,24,34,25],[35,26,36]][t];
        const parts=[['fang','ember','essence'],['ichor','horn','fang'],['gland','ichor'],['bone','essence','gland'],['magma','ember','bone']][t];
        let r=Math.random(),html,msg,bad=false;
        if(r<0.38){const k=parts[Math.floor(Math.random()*parts.length)],n=3+Math.floor(Math.random()*4);addMat(k,n);html=MATS[k].ic+'<br>'+MATS[k].n+'<br>×'+n;msg='Части врагов';}
        else if(r<0.68){const o=pool[Math.floor(Math.random()*pool.length)],n=3+Math.floor(Math.random()*5);addMat('i'+o,n);html='▰<br>'+MATS['i'+o].n+'<br>×'+n;msg='Слитки';}
        else if(r<0.80){const k=['mech','lens','cloth','powder','soulglass'][Math.min(4,t)],n=1+Math.floor(Math.random()*2);addMat(k,n);html=MATS[k].ic+'<br>'+MATS[k].n+'<br>×'+n;msg='Редкий компонент!';}
        else if(r<0.93){const o=pool[Math.floor(Math.random()*pool.length)],n=8+Math.floor(Math.random()*10);addOre(o,n);html='⛏<br>'+ORES[o].name+'<br>×'+n;msg='Руда демона';}
        else if(r<0.97){player.souls+=60;html='👻<br>+60 душ';msg='Демон вернул души с лихвой';}
        else{bad=true;const k=Object.keys(player.mats||{}).filter(id=>/^i\d+$/.test(id));const id=k[Math.floor(Math.random()*k.length)];
          if(id){const lost=Math.ceil(player.mats[id]*0.3);player.mats[id]-=lost;html='☠<br>Проклятие<br>−'+lost+' '+MATS[id].n;}else{player.souls=Math.max(0,player.souls-25);html='☠<br>Проклятие<br>−25 👻';}msg='Демон обманул!';}
        st0.card={i:+el.getAttribute('data-card'),html,msg,bad};SFX[bad?'uiBack':'portal']();saveGame();UI.hcasino('deal');});
      if(body.querySelector('#hcAgain'))body.querySelector('#hcAgain').onclick=()=>{st0.card=null;SFX.ui();UI.hcasino('deal');};
    }
  },
  board(){
    ensureContracts();
    const L=player.contracts.list;
    const d=this.build('board',`
      <div class="card hell" style="max-width:520px;width:96vw">
        <h3>📜 Доска контрактов</h3>
        <p class="tiny" style="margin-bottom:8px">Три заказа от жителей Ада. Выполнено всего: ${player.contracts.done}</p>
        ${L.map((c,i)=>`<div class="item" style="flex-wrap:wrap">
          <div class="txt"><div class="nm">${c.type==='kill'?'⚔️':c.type==='ore'?'⛏':'⬇️'} ${c.title}</div>
          <div class="ds">Награда: <b style="color:#ffd98a">${fmt(c.rc)} 💰</b> + <b style="color:#9ad8ff">${c.rs} 👻</b></div>
          <div style="height:6px;border-radius:3px;background:rgba(255,255,255,.08);margin-top:5px;overflow:hidden"><div style="height:100%;width:${Math.round(100*Math.min(1,c.have/c.need))}%;background:${c.ready?'#7dffb0':'#ff8a4a'}"></div></div>
          <div class="ds">${Math.min(c.have,c.need)} / ${c.need}</div></div>
          ${c.ready?`<button class="btn small" data-claim="${i}">Забрать</button>`:`<button class="btn small alt" data-swap="${i}" ${(player.souls||0)>=5?'':'disabled'}>↻ 5 👻</button>`}
        </div>`).join('')}
      </div>
      <button class="btn alt" id="boBack">Выйти</button>`);
    d.querySelectorAll('[data-claim]').forEach(b=>b.onclick=()=>{
      const i=+b.getAttribute('data-claim'),c=L[i];if(!c||!c.ready)return;
      player.money+=c.rc;player.souls=(player.souls||0)+c.rs;player.contracts.done++;
      L.splice(i,1);ensureContracts();SFX.coin();SFX.buy();vib(30);UI.toast('Награда: +'+fmt(c.rc)+' 💰, +'+c.rs+' 👻');saveGame();UI.board();
    });
    d.querySelectorAll('[data-swap]').forEach(b=>b.onclick=()=>{
      const i=+b.getAttribute('data-swap');if((player.souls||0)<5)return;
      player.souls-=5;L[i]=makeContract();SFX.ui();saveGame();UI.board();
    });
    d.querySelector('#boBack').onclick=()=>{SFX.uiBack();UI.close();};
  },
  portal3(){
    const d=this.build('portal3',`
      <div class="card hell" style="max-width:480px;width:96vw;text-align:center">
        <h3 style="text-align:center">🕳 Врата Пустоты</h3>
        <div style="width:118px;height:118px;margin:6px auto 10px;border-radius:50%;
          background:conic-gradient(from 0deg,#1a0a2a,#3a1a6a,#0a2a3a,#2a0a1a,#1a0a2a);box-shadow:0 0 40px rgba(120,80,255,.4),inset 0 0 40px #000;"></div>
        <p class="muted">Древние врата запечатаны. За ними — <b style="color:#c8b0ff">третье измерение</b>, о котором не знает никто.</p>
        <div class="chk no">🔒 Измерение III<b>в разработке</b></div>
        <div class="chk no">🔒 Печать врат<b>скоро</b></div>
        <p class="tiny" style="margin:8px 0 2px">А пока врата могут вернуть тебя домой.</p>
      </div>
      <button class="btn" id="p3Home">🌄 Вернуться на Землю надежды</button>
      <button class="btn alt" id="p3Back">Закрыть</button>`);
    SFX.portal();
    d.querySelector('#p3Home').onclick=()=>startCutscene(0);
    d.querySelector('#p3Back').onclick=()=>{SFX.uiBack();UI.close();};
  },
  casino(){
    const invKeys=Object.keys(player.inv).filter(k=>player.inv[k]>0).map(k=>parseInt(k,10));
    if(!invKeys.length){
      const d=this.build('casino',`
        <div class="card" style="max-width:460px;width:96vw">
          <h3>🎰 Казино «Золотая жила»</h3>
          <p class="muted" style="text-align:center;padding:24px 10px">Нет руды для игры.</p>
        </div>
        <button class="btn alt" id="cBack">Выйти</button>
      `);
      d.querySelector('#cBack').onclick=()=>{SFX.uiBack();UI.close();};
      return;
    }
    if(casinoState.oreId==null || !player.inv[casinoState.oreId])casinoState.oreId=invKeys[0];
    const have=player.inv[casinoState.oreId]||0;
    if(casinoState.amount<1)casinoState.amount=1;
    if(casinoState.amount>have)casinoState.amount=have;

    const tabsHtml=`
      <div class="row" style="gap:6px;margin-bottom:10px">
        <button class="btn small ${casinoState.game==='wheel'?'':'alt'}" data-game="wheel">🎡 Колесо</button>
        <button class="btn small ${casinoState.game==='dice'?'':'alt'}" data-game="dice">🎲 Кости</button>
        <button class="btn small ${casinoState.game==='cups'?'':'alt'}" data-game="cups">🥤 Напёрстки</button>
      </div>
      <div class="row" style="gap:6px;margin:-4px 0 10px">
        <button class="btn small ${casinoState.game==='roulette'?'':'alt'}" data-game="roulette">🎡 Рулетка</button>
        <button class="btn small ${casinoState.game==='bj'?'':'alt'}" data-game="bj">🃏 Блэкджек</button>
        <button class="btn small ${casinoState.game==='slots'?'':'alt'}" data-game="slots">🎰 Слоты</button>
      </div>
    `;
    const oreListHtml=invKeys.map(id=>{
      const o=ORES[id];
      const sel=id===casinoState.oreId;
      return `<div class="item" data-pick="${id}" style="cursor:pointer;${sel?'border-color:#ffd98a;background:rgba(255,217,138,.1)':''}">
        <div class="ico" style="background:${o.color};box-shadow:inset 0 0 10px ${o.glow}"></div>
        <div class="txt"><div class="nm">${o.name}</div>
        <div class="ds">${player.inv[id]} шт · ${o.price} 💰</div></div>
        ${sel?'<span class="pill" style="background:rgba(255,217,138,.2);color:#ffd98a">✓</span>':''}
      </div>`;
    }).join('');

    const betHtml=`
      <div style="margin-top:12px;border-top:1px solid rgba(255,255,255,.08);padding-top:10px">
        <div class="tiny" style="margin-bottom:6px">Ставка рудой (${invKeys.length}):</div>
        <div class="scroll" style="max-height:170px;margin-bottom:8px;border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:5px 6px">
          ${oreListHtml}
        </div>
        <div class="tiny" style="margin-bottom:2px">Сколько поставить (${ORES[casinoState.oreId].name}, есть ${have}):</div>
        <div class="qline" style="margin-bottom:8px"><div class="qwrap">${(UI._qty=UI._qty||{},UI._qty.cas=casinoState.amount,qtyHtml('cas',have))}
          <div class="qsum">ставка <b data-qs="cas">${casinoState.amount}</b> шт · ≈<b class="gold" data-qp="cas">${fmt(Math.round(ORES[casinoState.oreId].price*casinoState.amount))}</b> 💰</div></div>
          <button class="btn small alt" id="amtMax">MAX</button></div>
      </div>
    `;
    const d=this.build('casino',`
      <div class="card" style="max-width:540px;width:96vw">
        <h3 style="text-align:center">🎰 Казино «Золотая жила»</h3>
        ${tabsHtml}
        <div id="casinoBody"></div>
        ${betHtml}
      </div>
      <button class="btn alt" id="cBack">Выйти</button>
    `);

    d.querySelectorAll('[data-game]').forEach(btn=>{
      btn.onclick=()=>{
        const g=btn.getAttribute('data-game');
        if(g!==casinoState.game && !casinoState.spinning){
          casinoState.game=g;casinoState.diceResult=null;
          casinoState.cupsState=null;casinoState.wheelResult=null;
          SFX.ui();UI.casino();
        }
      };
    });
    d.querySelectorAll('[data-pick]').forEach(el=>{
      el.onclick=()=>{
        if(casinoState.spinning)return;
        const id=parseInt(el.getAttribute('data-pick'),10);
        casinoState.oreId=id;
        if(casinoState.amount>player.inv[id])casinoState.amount=player.inv[id];
        SFX.ui();UI.casino();
      };
    });
    wireQty(d,(key,v,fin)=>{if(casinoState.spinning)return;casinoState.amount=v;const a=d.querySelector('[data-qs="cas"]'),b=d.querySelector('[data-qp="cas"]');if(a)a.textContent=v;if(b)b.textContent=fmt(Math.round(ORES[casinoState.oreId].price*v));
      if(fin)UI.casino();});
    d.querySelector('#amtMax').onclick=()=>{if(casinoState.spinning)return;casinoState.amount=have;SFX.ui();UI.casino();};
    d.querySelector('#cBack').onclick=()=>{if(casinoState.spinning)return;SFX.uiBack();UI.close();};

    const body=d.querySelector('#casinoBody');
    if(casinoState.game==='roulette'||casinoState.game==='bj'||casinoState.game==='slots'){
      const oid=casinoState.oreId;
      const st={amount:casinoState.amount,unit:'шт',have:()=>player.inv[oid]||0,take:(n)=>{player.inv[oid]-=n;if(player.inv[oid]<=0)delete player.inv[oid];},give:(n)=>{player.inv[oid]=(player.inv[oid]||0)+n;}};
      const rer=(keep)=>{if(keep){const b2=d.querySelector('#rlSpin');if(b2)b2.disabled=true;return;}if(UI.modal==='casino')UI.casino();};
      if(casinoState.game==='roulette')cgRoulette(body,st,rer);else if(casinoState.game==='bj')cgBlackjack(body,st,rer);else cgSlots(body,st,rer);
      return;
    }
    if(casinoState.game==='wheel'){
      body.innerHTML=`
        <div style="text-align:center">
          <div class="wheelWrap" style="margin:6px auto">
            <div class="wheelPin"></div>
            <div class="wheel" id="wheelEl"></div>
            <div class="wheelC" id="wheelCEl">${casinoState.wheelResult!=null?'×'+casinoState.wheelResult:'?'}</div>
          </div>
        </div>
      `;
      const wheelEl=body.querySelector('#wheelEl');
      const grad=WHEEL.map((s,i)=>`${s.c} ${i*45}deg ${(i+1)*45}deg`).join(',');
      wheelEl.style.background=`conic-gradient(${grad})`;
      wheelEl.style.transition='none';
      wheelEl.style.transform=`rotate(${casinoState.wheelRot}deg)`;
      void wheelEl.offsetHeight;
      for(let i=0;i<WHEEL.length;i++){
        const mid=i*45+22.5;
        const midRad=mid*Math.PI/180;
        const R=33;
        const x=50+R*Math.sin(midRad);
        const y=50-R*Math.cos(midRad);
        const lbl=document.createElement('div');
        lbl.textContent='×'+WHEEL[i].m;
        lbl.style.cssText=`position:absolute;left:${x}%;top:${y}%;transform:translate(-50%,-50%) rotate(${mid}deg);font-size:13px;font-weight:900;color:#fff;text-shadow:0 1px 2px #000, 0 0 5px rgba(0,0,0,.95);pointer-events:none;white-space:nowrap;letter-spacing:-0.3px;z-index:2;`;
        wheelEl.appendChild(lbl);
      }
      const btn=document.createElement('button');
      btn.className='btn';btn.style.marginTop='12px';btn.style.width='100%';
      btn.textContent=casinoState.spinning?'...':'🎡 Крутить';
      btn.disabled=casinoState.spinning;
      body.appendChild(btn);
      btn.onclick=()=>playCasinoWheel();
    } else if(casinoState.game==='dice'){
      const dr=casinoState.diceResult;
      body.innerHTML=`
        <div style="text-align:center">
          <div style="display:flex;justify-content:center;gap:16px;margin:10px 0">
            ${renderDie(dr?dr.d1:0)}
            ${renderDie(dr?dr.d2:0)}
          </div>
          <div class="tiny" style="color:#9be8ff;min-height:16px">${dr?('Сумма: '+dr.sum):'&nbsp;'}</div>
          <div class="row" style="gap:6px;justify-content:center;margin-top:10px">
            <button class="btn small ${casinoState.betType==='big'?'':'alt'}" data-bet="big">Больше 7 (×2)</button>
            <button class="btn small ${casinoState.betType==='small'?'':'alt'}" data-bet="small">Меньше 7 (×2)</button>
            <button class="btn small ${casinoState.betType==='seven'?'':'alt'}" data-bet="seven">Ровно 7 (×5)</button>
          </div>
        </div>
      `;
      body.querySelectorAll('[data-bet]').forEach(bt=>{
        bt.onclick=()=>{casinoState.betType=bt.getAttribute('data-bet');casinoState.diceResult=null;SFX.ui();UI.casino();};
      });
      const btn=document.createElement('button');
      btn.className='btn';btn.style.marginTop='12px';btn.style.width='100%';
      btn.textContent='🎲 Бросить';
      body.appendChild(btn);
      btn.onclick=()=>playCasinoDice();
    } else if(casinoState.game==='cups'){
      const cs=casinoState.cupsState;
      body.innerHTML=`
        <div style="text-align:center">
          <div class="tiny" style="margin-bottom:8px;color:#9be8ff">${cs? (cs.win?'🎉 Угадали!':'😢 Мимо…') : 'Угадайте, где руда'}</div>
          <div class="row" style="justify-content:center;gap:14px">
            ${[0,1,2].map(i=>{
              const revealed=!!cs;
              const isBall=cs && cs.ballAt===i;
              const isChosen=cs && cs.chosen===i;
              let content,border='2px solid rgba(255,255,255,.18)';
              if(revealed){
                content=isBall?'⛏':'';
                if(isBall)border='2px solid #5ee06a';
                else if(isChosen)border='2px solid #ff5c5c';
              } else content='🥤';
              return `<div data-cup="${i}" style="width:76px;height:86px;border-radius:12px;background:linear-gradient(180deg,#4a3a2a,#2a1c10);border:${border};display:flex;align-items:center;justify-content:center;font-size:38px;cursor:${cs?'default':'pointer'};box-shadow:inset 0 -6px 12px rgba(0,0,0,.5);">${content}</div>`;
            }).join('')}
          </div>
        </div>
      `;
      if(!cs){
        body.querySelectorAll('[data-cup]').forEach(el=>{
          el.onclick=()=>{const i=parseInt(el.getAttribute('data-cup'),10);playCasinoCups(i);};
        });
      } else {
        const btn=document.createElement('button');
        btn.className='btn';btn.style.marginTop='12px';btn.style.width='100%';
        btn.textContent='Продолжить';
        body.appendChild(btn);
        btn.onclick=()=>{
          const st=casinoState.cupsState;
          if(st){
            const gain=Math.floor(st.amount*st.mult);
            if(gain>0)player.inv[st.oreId]=(player.inv[st.oreId]||0)+gain;
            casinoState.cupsState=null;saveGame();UI.casino();
          }
        };
      }
    }
  },
  /* меню предметов — лист снизу с плитками (43-quickbar) */
  items(tab){itemsMenu(tab);},
  /* вкладка «Ресурсы»: всё, что лежит в рюкзаке */
  resources(){
    const cap=stackCap(),used=invCount(),keys=Object.keys(player.inv).filter(k=>player.inv[k]>0).sort((a,b)=>ORES[b].price-ORES[a].price);
    const oreCell=(k)=>{const n=player.inv[k],O=ORES[k];return `<div class="resCell">${resSwatch('o',k)}<div style="min-width:0;flex:1"><div class="rn">${escHtml(O.name)}</div>
      <div class="rc">${fmt(n)} <span style="color:#8a98ac;font-weight:600">/ ${cap}</span></div><div class="rb"><b style="width:${Math.min(100,n/cap*100)}%"></b></div></div></div>`;};
    let slotsHtml=keys.map(oreCell).join('');
    for(let i=used;i<player.slots;i++)slotsHtml+=`<div class="resCell empty">пустой слот</div>`;
    const mats=player.mats||{};
    const matHtml=MAT_KINDS.map(([kind,title])=>{const ids=Object.keys(mats).filter(id=>MATS[id]&&MATS[id].kind===kind&&mats[id]>0).sort((a,b)=>MATS[b].tier-MATS[a].tier);
      if(!ids.length)return '';
      return `<div class="cheatSection" style="text-align:left">${title} <span class="tiny">· ${ids.reduce((s2,id)=>s2+mats[id],0)} шт</span></div><div class="resGrid">`+
        ids.map(id=>`<div class="resCell">${resSwatch('m',id)}<div style="min-width:0;flex:1"><div class="rn">${escHtml(MATS[id].n)}</div><div class="rc">${fmt(mats[id])} шт</div></div></div>`).join('')+'</div>';}).join('');
    const pc=packedCrates().length,wc=worldCrates();
    const crateHtml=(pc||wc.length)?`<div class="cheatSection" style="text-align:left">📦 Ящики</div>
      <p class="tiny" style="line-height:1.5">С собой: <b>${pc}</b>${wc.length?'<br>'+wc.map(c=>{const cc=crateCount(c);return '📦 <b>'+escHtml(c.name)+'</b> — '+(c.where==='lobby'?'лобби':'шахта, '+c.y+' м')+' · '+(cc.kinds?cc.kinds+' вид., '+fmt(cc.total)+' шт':'пусто');}).join('<br>'):''}</p>`:'';
    const d=this.build('items',`
      <div class="card" style="max-width:520px;width:96vw">
        <div class="tabs"><button data-ittab="items">🎒 Предметы</button><button data-ittab="res" class="on">⛏ Ресурсы</button></div>
        <div class="resHead">
          <span>🎒 Слоты<br><b>${used} / ${player.slots}</b> видов руды</span>
          <span>📦 Стопка<br><b>до ${cap}</b> шт каждого вида</span>
          <span>💰 Руда стоит<br><b>${fmt(invValue())}</b></span>
        </div>
        <div class="cheatSection" style="text-align:left">⛏ Руда в рюкзаке <span class="tiny">· ${fmt(totalOre())} шт</span></div>
        <div class="resGrid">${slotsHtml||'<div class="resCell empty">рюкзак пуст</div>'}</div>
        ${matHtml||''}
        ${matHtml?'<p class="tiny" style="margin-top:4px">Слитки, сплавы, компоненты и части мобов слоты рюкзака не занимают.</p>':'<p class="tiny" style="margin-top:6px">Материалов Ада пока нет — их дают Печь и мобы Ада.</p>'}
        ${crateHtml}
      </div>
      <button class="btn" id="itClose">Закрыть</button>
    `);
    d.querySelectorAll('[data-ittab]').forEach(b=>b.onclick=()=>{SFX.ui();UI.items(b.getAttribute('data-ittab'));});
    d.querySelector('#itClose').onclick=()=>{SFX.uiBack();UI.clear();};
  },
  /* настройка робота-кладовщика */
  sorter(uid){
    const S=bot(),L=lobbyCrates(),inp=L.find(c=>c.id===S.input);
    if(uid)UI._botSel=uid;const U=botById(UI._botSel)||S.units.find(u=>u.placed)||S.units[0];if(!U){UI.clear();return;}UI._botSel=U.id;
    const st=U.state==='work'?(U.carry?'Несёт '+(U.carry.kind==='o'?ORES[U.carry.id].name:MATS[U.carry.id].n)+' ×'+U.carry.n+' → «'+escHtml((crateById(U.carry.to)||{}).name||'?')+'»':'Работает'):
      U.state==='noinput'?'Выбери ящик-приёмник ниже':U.state==='nofilter'?'В приёмнике есть ресурсы, для которых нет ящика — отметь категорию или «Всё остальное»':U.placed?'Отдыхает: в приёмнике нечего сортировать':'Не поставлен — выбери его в «Предметах» и нажми «Ставить» в лобби';
    const known=new Set();for(const c of L){for(const k in c.inv)if(c.inv[k]>0)known.add('o:'+k);for(const k in c.mats)if(c.mats[k]>0)known.add('m:'+k);if(c.sf)for(const k of (c.sf.ids||[]))known.add(k);}
    for(const k in player.inv)if(player.inv[k]>0)known.add('o:'+k);for(const k in (player.mats||{}))if(player.mats[k]>0)known.add('m:'+k);
    const knownL=[...known].filter(k=>{const [a,b]=k.split(':');return a==='o'?!!ORES[b]:!!MATS[b];});
    const others=L.filter(c=>c.id!==S.input);
    const crateCard=(c)=>{const sf=c.sf||{cats:[],ids:[]},open=UI._botOpen===c.id,cc=crateCount(c);
      return `<div class="card" style="padding:9px 10px;margin:6px 0;background:rgba(255,255,255,.035)">
        <div class="row spread"><b>📦 ${escHtml(c.name)}</b><span class="tiny">${cc.kinds} вид. · ${fmt(cc.total)} шт</span></div>
        <div class="chips" style="display:flex;flex-wrap:wrap;gap:5px;margin-top:6px">${BOT_CATS.map(([k,n])=>`<button class="btn small ${sf.cats.includes(k)?'':'alt'}" data-bcat="${c.id}|${k}" style="padding:5px 8px;font-size:11.5px;min-width:0">${n}</button>`).join('')}</div>
        <button class="btn alt small" data-bopen="${c.id}" style="margin-top:6px;width:100%;font-size:11.5px">${open?'▴ Скрыть точный выбор':'▾ Точный выбор ресурсов'}${sf.ids.length?' · '+sf.ids.length:''}</button>
        ${open?`<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px">${knownL.length?knownL.map(k=>{const [a,b]=k.split(':'),on=sf.ids.includes(k);
          return `<button class="crRow" data-bid="${c.id}|${k}" style="margin:0;padding:4px 7px;gap:5px;border:1px solid ${on?'#7ff0ff':'rgba(255,255,255,.1)'};background:${on?'rgba(127,240,255,.14)':'rgba(255,255,255,.04)'};color:#e8eef7;font-size:11px;font-weight:700">${resSwatch(a,b)}${escHtml(a==='o'?ORES[b].name:MATS[b].n)}</button>`;}).join(''):'<span class="tiny">Здесь появятся ресурсы, которые у тебя есть</span>'}</div>`:''}
      </div>`;};
    const d=this.build('sorter',`
      <div class="card hell" style="max-width:540px;width:96vw">
        ${S.units.length>1?`<div class="tabs" style="margin-bottom:8px">${S.units.map(u=>`<button data-bsel="${u.id}" class="${u===U?'on':''}">🤖 ${escHtml(u.name)}${u.placed?'':' · не стоит'}</button>`).join('')}</div>`:''}
        <div style="display:flex;flex-wrap:nowrap;gap:10px;align-items:center"><img id="botImg" style="width:72px;height:72px;image-rendering:auto;flex:0 0 72px;border-radius:14px;background:radial-gradient(circle at 50% 70%,rgba(127,240,255,.16),rgba(0,0,0,0) 70%)"><div style="flex:1;min-width:0">
          <h3 style="margin:0;border:none;padding:0">🤖 Робот-кладовщик</h3>
          <div class="row" style="gap:6px;margin-top:6px;flex-wrap:nowrap"><input id="botName" class="crName" maxlength="16" value="${escHtml(U.name)}" aria-label="Имя робота"><button class="btn small" id="botRen" style="min-width:48px">✏️</button></div>
          <p class="tiny" style="margin-top:4px;line-height:1.4">Берёт ресурсы из <b>ящика-приёмника</b> и относит их в ящики лобби по фильтрам. Роботы делят работу между собой. Перенёс: ${fmt(U.moved||0)} шт</p></div></div>
        <div class="cheatSection" style="text-align:left">🎨 Скин (бесплатно)</div>
        <div class="skinGrid">${BOT_SKINS.map(k=>`<button class="skinBtn ${U.skin===k.id?'on':''}" data-bskin="${k.id}"><img data-skimg="${k.id}" alt=""><span>${k.n}</span></button>`).join('')}</div>
        <div class="cheatSection" style="text-align:left">⚙️ Прокачки (действуют на всех роботов)</div>
        <div class="resHead" style="margin-top:8px">
          <span>⚡ Ходовая · ур. ${S.spdLv|0}/5<br><b>×${botSpd().toFixed(2)}</b> скорость</span>
          <span>📦 Отсек · ур. ${S.capLv|0}/5<br><b>${botLoad()}</b> шт за ходку</span>
          <span>🚚 Если ящики рядом<br><b>до ~${fmt(Math.round(botLoad()*60/(600/(BOT_SPEED*botSpd())+1.65/(1+(botSpd()-1)*0.6))))}</b> шт/мин</span></div>
        ${['spd','cap'].map(k=>{const lv=(k==='spd'?S.spdLv:S.capLv)|0,max=lv>=5,c=BOT_UPG[k][lv];
          return `<div class="item" style="flex-wrap:wrap;margin-top:4px"><div class="ico" style="background:rgba(127,240,255,.12);display:flex;align-items:center;justify-content:center;font-size:15px">${k==='spd'?'⚡':'📦'}</div>
          <div class="txt"><div class="nm">${k==='spd'?'Ходовая и моторы':'Грузовой отсек'} · ${lv}/5</div><div class="ds">${k==='spd'?'Скорость езды и погрузки ×'+BOT_SPD[lv].toFixed(2)+(max?'':' → ×'+BOT_SPD[lv+1].toFixed(2)):'За ходку '+BOT_CAP[lv]+' шт'+(max?'':' → '+BOT_CAP[lv+1]+' шт')}</div>${max?'':`<div class="cost">${costChips(c)}</div>`}</div>
          ${max?'<span class="pill" style="background:rgba(120,255,160,.15);color:#7dffb0">MAX</span>':`<button class="btn small" data-bup="${k}" ${canPay(c)?'':'disabled'}>Улучшить</button>`}</div>`;}).join('')}
        <div class="tiny" style="margin:8px 0 2px;padding:7px 9px;border-radius:9px;background:rgba(127,240,255,.08);color:#bfefff;line-height:1.4">${st}${S.moved?'<br>Всего перенесено: '+fmt(S.moved)+' шт':''}</div>
        <div class="cheatSection" style="text-align:left">📥 Ящик-приёмник (сюда складывай всё)</div>
        ${L.length?`<div style="display:flex;flex-wrap:wrap;gap:5px">${L.map(c=>`<button class="btn small ${c.id===S.input?'':'alt'}" data-binp="${c.id}" style="font-size:12px;min-width:0;padding:6px 10px">${c.id===S.input?'✓ ':''}${escHtml(c.name)}</button>`).join('')}</div>`
          :'<p class="muted">В лобби нет ящиков. Поставь хотя бы два: приёмник и склад.</p>'}
        <div class="cheatSection" style="text-align:left">🗂 Что класть в остальные ящики</div>
        ${inp?(others.length?others.map(crateCard).join(''):'<p class="muted">Поставь в лобби ещё ящики — и отметь, что в них класть.</p>'):'<p class="muted">Сначала выбери приёмник.</p>'}
        <p class="tiny" style="margin-top:6px;line-height:1.4">Порядок выбора ящика: точный выбор → категория → «Всё остальное». Если подходит несколько — первый по списку.</p>
      </div>
      <div class="row" style="gap:6px;max-width:540px;width:96vw">
        <button class="btn alt" id="bPick" style="flex:1">🔧 Переставить</button>
        <button class="btn" id="bClose" style="flex:1">Закрыть</button></div>
    `);
    const botPic=(o,sz,sc)=>{const c=document.createElement('canvas');c.width=c.height=sz;const g=c.getContext('2d');g.translate(sz/2,sz*0.88);g.scale(sc,sc);drawBot(g,0,0,Object.assign({},o,{vx:0,job:null,state:'work'}),1.2,false);return c.toDataURL();};
    try{d.querySelector('#botImg').src=botPic(Object.assign({},U,{capLv:S.capLv,spdLv:S.spdLv,carry:U.carry}),144,2.7);
      d.querySelectorAll('[data-skimg]').forEach(im=>{im.src=botPic({skin:im.dataset.skimg,face:1,capLv:0,spdLv:0},80,1.6);});}catch(e){}
    d.querySelectorAll('[data-bsel]').forEach(b=>b.onclick=()=>{SFX.ui();UI.sorter(b.getAttribute('data-bsel'));});
    d.querySelectorAll('[data-bskin]').forEach(b=>b.onclick=()=>{U.skin=botSkin(b.getAttribute('data-bskin')).id;SFX.ui();vib(10);saveGame();UI.sorter();});
    d.querySelector('#botRen').onclick=()=>{const v=String(d.querySelector('#botName').value||'').replace(/\s+/g,' ').trim().slice(0,16);if(!v){UI.toast('Имя не может быть пустым');return;}U.name=v;SFX.ui();saveGame();UI.toast('🤖 Теперь его зовут «'+v+'»');UI.sorter();};
    d.querySelector('#botName').onkeydown=(e)=>{if(e.key==='Enter')d.querySelector('#botRen').click();};
    const re=()=>{saveGame();UI.sorter();};
    d.querySelectorAll('[data-bup]').forEach(b=>b.onclick=()=>{const k=b.getAttribute('data-bup'),lv=(k==='spd'?S.spdLv:S.capLv)|0;if(lv>=5||!pay(BOT_UPG[k][lv]))return;
      if(k==='spd')S.spdLv=lv+1;else S.capLv=lv+1;SFX.buy();vib(25);UI.toast(k==='spd'?'⚡ Болтик стал быстрее':'📦 Болтик берёт больше');re();});
    d.querySelectorAll('[data-binp]').forEach(b=>b.onclick=()=>{S.input=b.getAttribute('data-binp');for(const u of S.units)u.job=null;SFX.ui();re();});
    d.querySelectorAll('[data-bcat]').forEach(b=>b.onclick=()=>{const [cid,k]=b.getAttribute('data-bcat').split('|'),c=crateById(cid);if(!c)return;if(!c.sf)c.sf={cats:[],ids:[]};
      const i=c.sf.cats.indexOf(k);if(i>=0)c.sf.cats.splice(i,1);else c.sf.cats.push(k);SFX.ui();re();});
    d.querySelectorAll('[data-bopen]').forEach(b=>b.onclick=()=>{const id=b.getAttribute('data-bopen');UI._botOpen=UI._botOpen===id?null:id;SFX.ui();UI.sorter();});
    d.querySelectorAll('[data-bid]').forEach(b=>b.onclick=()=>{const v=b.getAttribute('data-bid'),cid=v.split('|')[0],k=v.slice(cid.length+1),c=crateById(cid);if(!c)return;if(!c.sf)c.sf={cats:[],ids:[]};
      const i=c.sf.ids.indexOf(k);if(i>=0)c.sf.ids.splice(i,1);else c.sf.ids.push(k);SFX.ui();re();});
    d.querySelector('#bPick').onclick=()=>{if(U.carry){const inp2=crateById(S.input)||lobbyCrates()[0];if(inp2){const box=U.carry.kind==='o'?inp2.inv:inp2.mats;box[U.carry.id]=(box[U.carry.id]||0)+U.carry.n;}U.carry=null;}
      U.placed=false;U.job=null;bot();G.placeItem='sorter';validateSelection();saveGame();UI.clear();UI.toast('🤖 '+U.name+' у тебя — выбери место и нажми «Ставить»');};
    d.querySelector('#bClose').onclick=()=>{SFX.uiBack();UI.clear();};
  },
  /* хранилище ящика */
  crate(id){
    const c=crateById(id);if(!c){UI.clear();return;}
    const cc=crateCount(c),mats=player.mats||{};
    const row=(kind,k,n,dir)=>{const nm=kind==='o'?ORES[k].name:MATS[k].n,key='c'+dir+kind+k;
      return `<div class="crRow">${resSwatch(kind,k)}<div class="rn">${escHtml(nm)}<span class="rc">${fmt(n)}</span></div>
        ${n>1?qtyHtml(key,n,{sm:1}):''}<button class="crGo" data-mv="${kind}:${k}:${key}:${dir}">${dir==='in'?'⬇':'⬆'} <b data-qs="${key}">${n>1?qtyVal(key,n):1}</b></button></div>`;};
    const bagO=Object.keys(player.inv).filter(k=>player.inv[k]>0).sort((a,b)=>ORES[b].price-ORES[a].price);
    const bagM=Object.keys(mats).filter(k=>MATS[k]&&mats[k]>0).sort((a,b)=>MATS[b].tier-MATS[a].tier);
    const inO=Object.keys(c.inv).filter(k=>c.inv[k]>0&&ORES[k]).sort((a,b)=>ORES[b].price-ORES[a].price);
    const inM=Object.keys(c.mats).filter(k=>c.mats[k]>0&&MATS[k]).sort((a,b)=>MATS[b].tier-MATS[a].tier);
    const d=this.build('crate',`
      <div class="card" style="max-width:520px;width:96vw">
        <div class="row" style="gap:6px;margin-bottom:6px"><span style="font-size:22px">📦</span>
          <input id="crName" class="crName" maxlength="20" value="${escHtml(c.name)}"><button class="btn small" id="crRen" style="min-width:56px">✏️</button></div>
        <p class="tiny">${c.where==='lobby'?'Стоит в лобби':'Стоит в шахте на '+c.y+' м'} · внутри ${cc.kinds} вид., ${fmt(cc.total)} шт · рюкзак ${invCount()}/${player.slots}, стопка до ${stackCap()}</p>
        <div class="row" style="gap:6px;margin:8px 0">
          <button class="btn small" id="crPutAll" style="flex:1">⬇ Положить всё</button>
          <button class="btn alt small" id="crTakeAll" style="flex:1">⬆ Забрать всё</button></div>
        <div class="cheatSection" style="text-align:left">В ящике</div>
        ${inO.map(k=>row('o',k,c.inv[k],'out')).join('')}${inM.map(k=>row('m',k,c.mats[k],'out')).join('')}
        ${(inO.length||inM.length)?'':'<p class="muted" style="text-align:center;padding:8px">Пусто</p>'}
        <div class="cheatSection" style="text-align:left">В рюкзаке</div>
        ${bagO.map(k=>row('o',k,player.inv[k],'in')).join('')}${bagM.map(k=>row('m',k,mats[k],'in')).join('')}
        ${(bagO.length||bagM.length)?'':'<p class="muted" style="text-align:center;padding:8px">Рюкзак пуст</p>'}
        <div id="crMsg" class="tiny" style="min-height:16px;margin-top:6px;color:#ffb070"></div>
      </div>
      <div class="row" style="gap:6px;max-width:520px;width:96vw">
        <button class="btn alt" id="crPick" style="flex:1">🔨 Разобрать и забрать</button>
        <button class="btn" id="crClose" style="flex:1">Закрыть</button></div>
    `);
    const msg=(t)=>{const el=d.querySelector('#crMsg');if(el)el.textContent=t;};
    const done=(t)=>{saveGame();UI.crate(id);if(t)setTimeout(()=>{const el=document.getElementById('crMsg');if(el)el.textContent=t;},0);};
    wireQty(d,(key,v)=>{const a=d.querySelector(`[data-qs="${key}"]`);if(a)a.textContent=v;});
    d.querySelectorAll('[data-mv]').forEach(b=>b.onclick=()=>{const [kind,k,key,dir]=b.getAttribute('data-mv').split(':');
      const have=dir==='in'?(kind==='o'?(player.inv[k]||0):matN(k)):(kind==='o'?(c.inv[k]||0):(c.mats[k]||0));
      const n=Math.min(have,qtyVal(key,have));if(UI._qty)delete UI._qty[key];const r=crateMove(c,kind,k,n,dir);
      if(r===-1){SFX.uiBack();msg('Нет свободного слота в рюкзаке');return;}if(r===-2){SFX.uiBack();msg('Стопка этой руды в рюкзаке полна ('+stackCap()+')');return;}
      if(r>0){SFX.ui();done();}});
    d.querySelector('#crPutAll').onclick=()=>{let n=0;for(const k of Object.keys(player.inv))n+=Math.max(0,crateMove(c,'o',k,1e9,'in'));for(const k of Object.keys(player.mats||{}))if(MATS[k])n+=Math.max(0,crateMove(c,'m',k,1e9,'in'));
      if(n){SFX.buy();vib(15);}done(n?'Положено '+fmt(n)+' шт':'');};
    d.querySelector('#crTakeAll').onclick=()=>{let n=0,blocked=false;for(const k of Object.keys(c.inv)){const r=crateMove(c,'o',k,1e9,'out');if(r>0)n+=r;else if(r<0)blocked=true;}
      for(const k of Object.keys(c.mats))n+=Math.max(0,crateMove(c,'m',k,1e9,'out'));
      if(n){SFX.buy();vib(15);}done((n?'Забрано '+fmt(n)+' шт':'')+(blocked?' · не всё влезло в рюкзак':''));};
    d.querySelector('#crRen').onclick=()=>{const v=String(d.querySelector('#crName').value||'').replace(/\s+/g,' ').trim().slice(0,20);if(!v){msg('Имя не может быть пустым');return;}c.name=v;SFX.ui();done('Переименовано');};
    d.querySelector('#crName').onkeydown=(e)=>{if(e.key==='Enter')d.querySelector('#crRen').click();};
    d.querySelector('#crPick').onclick=()=>{const L=worldCrates(),i=L.indexOf(c);if(i<0)return;L.splice(i,1);delete c.where;delete c.x;delete c.y;packedCrates().push(c);
      SFX.breakBlock&&SFX.breakBlock();vib(25);G.placeItem='crate';validateSelection();saveGame();UI.clear();UI.toast('📦 '+c.name+' разобран и у тебя — содержимое внутри');};
    d.querySelector('#crClose').onclick=()=>{SFX.uiBack();UI.clear();};
  },
  cheats(tab){
    if(!settings.cheatsUnlocked){UI.toast('Читы не разблокированы');return;}
    tab=tab||UI._chTab||'quick';UI._chTab=tab;
    const tog=(key,label)=>`<button class="btn small ${cheats[key]?'cheatOn':''}" data-cheat="${key}">${label}</button>`;
    const act=(a,label,cls)=>`<button class="btn small ${cls||''}" data-action="${a}">${label}</button>`;
    /* переход между измерениями: кнопки на все, кроме текущего */
    const dimBtns=(suf)=>[['🌄 На Землю',0],['🔥 В Ад',1],['🌸 В Лиловые небеса',2]].filter(q=>q[1]!==G.dim).map(q=>act('dim'+q[1],q[0]+suf)).join('');
    const step=(key,label,min,max,val)=>`<div class="setting"><span>${label}</span><span class="row" style="width:auto;gap:6px;flex-wrap:nowrap">
      <button class="btn small alt" data-step="${key}:-1" style="min-width:40px">−</button><b style="min-width:42px;text-align:center">${val}</b>
      <button class="btn small alt" data-step="${key}:1" style="min-width:40px">+</button></span></div>`;
    const inMine=G.scene==='mine';
    const TABS=[['quick','⚡ Быстро'],['player','🧍 Игрок'],['res','💰 Ресурсы'],['prog','📈 Прогресс'],['world','🌍 Мир'],['mobs','👾 Мобы'],['sys','⚙ Служебное']];
    let body='';
    if(tab==='quick'){
      body=`<div class="sect" style="border:none;margin-top:0;padding-top:0">Режимы</div>
      <div class="cheatGrid">${tog('god','🛡 Бог-мод')}${tog('instantDig','⚡ Мгновенное копание')}${tog('megaLight','🔦 Мега-свет')}${tog('flyMode','🕊 Полёт')}${tog('noclip','👻 Noclip')}${tog('infMoney','💰 ∞ Деньги')}</div>
      <div class="sect">Готовые состояния для теста</div>
      <div class="cheatGrid">
        ${act('presetHell','🔥 Готов к порталу')}${act('presetHellMax','👑 Ад: всё на макс')}
        ${act('presetBoss','☠ Готов к боссу')}${act('presetFresh','🐣 Как новичок')}
      </div>
      <div class="sect">Быстрый переход</div>
      <div class="cheatGrid">
        ${dimBtns(' (без катсцены)')}${act('cutscene','🎬 Показать катсцену')}
        ${G.dim===0?act('tpArena','☠ На арену босса')+act('tpHeart','💜 К Сердцу Бездны'):act('tpCore','🌋 В Огненное ядро')+act('heat0','🧊 Жар = 0')}
        ${act('heal','❤️ Полное HP')}${act('killMobs','💀 Убить всех мобов')}
      </div>`;
    }else if(tab==='player'){
      body=`<div class="cheatGrid">
        ${tog('god','🛡 Бог-мод')}${tog('noFall','🥾 Без урона падения')}${tog('superSpeed','💨 Скорость ×3')}${tog('superJump','🦘 Супер-прыжок')}
        ${tog('noclip','👻 Noclip')}${tog('flyMode','🕊 Полёт')}${tog('megaLight','🔦 Мега-свет')}${tog('instantDig','⚡ Мгновенное копание')}
        ${act('heal','❤️ Полное HP')}${act('maxhp','💗 +1000 HP макс')}${act('heat0','🧊 Жар = 0')}${act('heat100','🔥 Жар = 100')}
        ${act('clearFx','✨ Снять эффекты')}${act('curse','💀 Самоубийство')}
      </div>
      <p class="tiny" style="margin-top:8px">HP ${Math.round(player.hp)}/${player.maxHp} · урон оружием ${swordDmg()} · защита ${Math.round(dmgReduction()*100)}% · жаростойкость ${Math.round(heatResist()*100)}%</p>`;
    }else if(tab==='res'){
      body=`<div class="cheatGrid">
        ${tog('infMoney','💰 ∞ Деньги')}${act('money','💵 +100 000')}${act('money10','💎 +10 000 000')}${act('money0','🚫 Деньги = 0')}
        ${act('souls','👻 +500 душ')}${act('ladders','🪜 +100 лестниц')}${act('ammo','🚀 +100 снарядов крюка')}${act('gunAmmo','🔸 +500 патронов')}
        ${act('potions','🧪 +50 аптечек')}${act('ice','🧊 +20 ледяных зелий')}${act('drills','🛠️ +50 буров')}${act('barr','🧱 +50 баррикад')}
        ${act('earthOres','🎁 Руда Земли ×100')}${act('hellOres','🔥 Руда Ада ×100')}${act('lilacOres','🌸 Руда Лиловых небес ×100')}${act('clearInv','🗑 Очистить инвентарь')}
        ${act('allMats','📦 Материалы Ада ×50')}${act('allCons','💣 Расходники Ада ×5')}${act('furnDone','🔥 Печь: готово сразу')}
      </div>`;
    }else if(tab==='prog'){
      const P=player;
      body=`${step('pickLvl','⛏ Кирка',1,10,P.pickLvl)}${step('swordLvl','⚔️ Оружие',1,10,P.swordLvl)}${step('armorLvl','🛡 Броня',1,10,P.armorLvl)}
        ${step('gunLvl','🔫 Огнестрел',0,GUNS.length,P.gunLvl)}${step('digSpeedLvl','⚡ Скорость копания',0,DIG_SPEED_MAX,P.digSpeedLvl||0)}
        ${step('torchLvl','🔦 Факел',0,5,P.torchLvl)}${step('drillLvl','🛠️ Бур',0,6,P.drillBought?P.drillLvl:0)}${step('barricadeLvl','🧱 Баррикады',0,4,P.barricadeBought?P.barricadeLvl:0)}
        ${step('fallProtLvl','🥾 Амортизаторы',0,3,P.fallProtLvl)}${step('slots','🎒 Слоты',8,40,P.slots)}${step('stackLvl','📦 Стопка',0,16,P.stackLvl||0)}
        ${HITEMS.map(h=>step('it_'+h.id,h.ic+' '+h.n,0,h.max,itemLv(h.id))).join('')}
        <div class="sect">Сюжет</div>
        <div class="cheatGrid">
          <button class="btn small ${P.prog.heart?'cheatOn':''}" data-flag="heart">💜 Сердце Бездны</button>
          <button class="btn small ${P.prog.key?'cheatOn':''}" data-flag="key">🗝 Ключ Бездны</button>
          <button class="btn small ${P.prog.hellUnlocked?'cheatOn':''}" data-flag="hellUnlocked">🌀 Портал открыт</button>
          <button class="btn small ${G.wf.bossDead?'cheatOn':''}" data-flag="bossDead">☠ Босс побеждён</button>
        </div>
        <div class="sect">Ад</div>
        <div class="cheatGrid">${act('perksMax','✨ Все благословения')}${act('perksReset','↩️ Сброс благословений')}${act('contractsDone','📜 Выполнить контракты')}${act('mask','😷 Противогаз')}</div>
        <div class="sect">Наборы</div>
        <div class="cheatGrid">${act('maxAll','⭐ Земля на максимум')}${act('presetHellMax','👑 Ад на максимум')}${act('resetUpgrades','↩️ Сброс улучшений')}</div>`;
    }else if(tab==='world'){
      const off=dimInfo().b0;
      body=`<div class="sect" style="border:none;margin-top:0;padding-top:0">Измерение: ${DIM_NAMES[G.dim]}</div>
        <div class="cheatGrid">${dimBtns('')}${act('toLobby','🏠 В лобби')}${G.dim===2?act('lilNight',lilNight()>0.5?'☀ День в деревне':'🌙 Ночь в деревне')+act('san100','👁 Рассудок 100')+act('san30','👁 Рассудок 30')+act('san0','👁 Рассудок 0')+act('ltea','🍵 +10 настоев'):''}</div>
        <div class="sect">Телепорт по биомам</div>
        <div class="cheatGrid">${Array.from({length:dimInfo().bn},(_,b)=>act('tpB'+(off+b),'⬇ '+BIOMES[off+b].n+' ('+BIOMES[off+b].d0+' м)')).join('')}</div>
        <div class="row" style="gap:6px;margin-top:8px">
          <input type="number" id="tpDepth" class="cheatInput" placeholder="Глубина, м" style="flex:1;min-width:0">
          <button class="btn small" id="tpBtn">ТП</button>
        </div>
        <div class="sect">Места</div>
        <div class="cheatGrid">
          ${G.dim===0?act('tpArena','☠ Арена (2012 м)')+act('tpHeart','💜 Святилище Сердца'):''}
          ${act('tpAnchor','⚓ Ближайший якорь')}${act('tpExit','⬆ К выходу')}
        </div>
        <div class="sect">Опасности и порода</div>
        <div class="cheatGrid">
          ${G.dim===1?act('storm','🌪 Пепельная буря')+act('meteors','☄ Огненный дождь')+act('gas','☁ Ядовитое облако')+Object.keys(ASH_EVENTS).filter(k=>k!=='storm').map(k=>act('ev_'+k,ASH_EVENTS[k].ic+' '+ASH_EVENTS[k].n)).join(''):''}
          ${act('clearArea','⛏ Расчистить 10×10')}${act('regenNow','🌱 Восстановить породу')}${act('regenStats','📈 Инфо о регене')}
        </div>`;
    }else if(tab==='mobs'){
      const list=MOBDEFS.filter(d=>(d.dim||0)===G.dim&&!d.boss);
      body=`<div class="cheatGrid">${act('killMobs','💀 Убить всех')}${act('spawnMobs','👾 +5 случайных')}
          ${G.dim===0?act('spawnBoss','☠ Вызвать Пожирателя')+act('bossPhase','⏭ Следующая фаза босса'):''}</div>
        ${G.dim===1?hbCheatHtml(act):''}
        <div class="sect">Создать рядом</div>
        <div class="cheatGrid">${list.map(d=>`<button class="btn small" data-spawn="${d.id}">${d.name}</button>`).join('')}</div>
        <p class="tiny" style="margin-top:6px">Ползунок частоты мобов — в настройках, раздел «Мир».</p>`;
    }else{
      body=`<div class="cheatGrid">${tog('showDebug','📊 Отладка-панель')}${act('saveNow','💾 Сохранить')}${act('resetCheats','🔄 Выключить читы')}${act('lockCheats','🔒 Заблокировать читы','alt')}</div>
        <p class="tiny" style="margin-top:8px">FPS ${Math.round(G.fpsNow||0)} · масштаб рендера ${Math.round((G.renderScale||1)*100)}% · участков в памяти ${chunks.size} · кэш отрисовки ${typeof CC!=='undefined'?CC.size:0} · мобов ${mobs.length} · частиц ${parts.length}</p>`;
    }
    const d=this.build('cheats',`
      <div class="card" style="max-width:580px;width:96vw">
        <h3 style="text-align:center">🔧 Панель тестирования</h3>
        <p class="tiny" style="text-align:center;margin:-4px 0 8px">${DIM_NAMES[G.dim]} · ${inMine?Math.floor(player.y/TILE)+' м':'лобби'} · 💰 ${fmt(player.money)} · 👻 ${fmt(player.souls||0)}</p>
        <div class="tabs">${TABS.map(t=>`<button data-tab="${t[0]}" class="${tab===t[0]?'on':''}">${t[1]}</button>`).join('')}</div>
        ${body}
      </div>
      <button class="btn alt" id="chBack">Закрыть</button>
    `);
    const rerender=()=>{if(UI.modal==='cheats')UI.cheats();};
    const needMine=()=>{if(G.scene!=='mine'){enterMine();UI.clear();}};
    const setMax=()=>{
      player.pickLvl=Math.max(player.pickLvl,6);player.swordLvl=Math.max(player.swordLvl,6);player.armorLvl=Math.max(player.armorLvl,6);player.gunLvl=Math.max(player.gunLvl,6);
      player.slots=Math.max(player.slots,20);player.digSpeedLvl=DIG_SPEED_MAX;player.digSpeed=digSpeedMult(DIG_SPEED_MAX);
      player.grappleUnlocked=true;player.grappleAmmo+=200;player.torchLvl=5;player.fallProtLvl=3;player.potions+=30;player.ladders+=100;
      player.drillBought=true;player.drillLvl=6;player.drills+=20;player.barricadeBought=true;player.barricadeLvl=4;player.barricades+=30;player.gunAmmo+=300;
      recomputeStats();player.hp=player.maxHp;validateSelection();
    };
    d.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{SFX.ui();UI.cheats(b.getAttribute('data-tab'));});
    d.querySelectorAll('[data-cheat]').forEach(btn=>{
      btn.onclick=()=>{const k=btn.getAttribute('data-cheat');cheats[k]=!cheats[k];SFX.ui();rerender();};
    });
    d.querySelectorAll('[data-step]').forEach(btn=>btn.onclick=()=>{
      const [k,dv]=btn.getAttribute('data-step').split(':');const v=+dv;const P=player;
      const lim={pickLvl:[1,10],swordLvl:[1,10],armorLvl:[1,10],gunLvl:[0,GUNS.length],digSpeedLvl:[0,DIG_SPEED_HMAX],torchLvl:[0,8],drillLvl:[0,10],barricadeLvl:[0,7],fallProtLvl:[0,3],slots:[8,40],stackLvl:[0,16]}[k];
      if(k.startsWith('it_')){const id=k.slice(3),h=HITEMS.find(q=>q.id===id);if(!P.hitems)P.hitems={};P.hitems[id]=clamp(itemLv(id)+v,0,h.max);}
      else if(k==='drillLvl'){const cur=P.drillBought?P.drillLvl:0,n=clamp(cur+v,0,10);P.drillBought=n>0;P.drillLvl=Math.max(1,n);}
      else if(k==='barricadeLvl'){const cur=P.barricadeBought?P.barricadeLvl:0,n=clamp(cur+v,0,7);P.barricadeBought=n>0;P.barricadeLvl=Math.max(1,n);}
      else{P[k]=clamp((P[k]||0)+v,lim[0],lim[1]);}
      if(k==='digSpeedLvl')P.digSpeed=digSpeedMult(P.digSpeedLvl);
      if(k==='armorLvl'){recomputeStats();P.hp=P.maxHp;}
      validateSelection();SFX.ui();saveGame();rerender();
    });
    d.querySelectorAll('[data-flag]').forEach(btn=>btn.onclick=()=>{
      const f=btn.getAttribute('data-flag');
      if(f==='bossDead')G.wf.bossDead=!G.wf.bossDead;
      else{player.prog[f]=!player.prog[f];if(f==='heart')G.wf.heartTaken=player.prog.heart;}
      SFX.ui();saveGame();rerender();
    });
    d.querySelectorAll('[data-spawn]').forEach(btn=>btn.onclick=()=>{
      needMine();const def=MOBDEFS.find(q=>q.id===btn.getAttribute('data-spawn'));if(!def)return;
      const x=player.x+player.facing*90,y=def.fly?player.y-60:player.y;spawnMobAt(def,x,y);
      UI.toast('Создан: '+def.name);SFX.ui();
    });
    d.querySelectorAll('[data-action]').forEach(btn=>{
      btn.onclick=()=>{
        const a=btn.getAttribute('data-action');
        SFX.ui();
        if(a.startsWith('hb')&&hbCheat(a))return;
        if(a.startsWith('tpB')){const bi=+a.slice(3);const B=BIOMES[bi];if((B.dim||0)!==G.dim)switchDimension(B.dim||0);teleportToDepth(B.d0+(bi===dimInfo().b0?20:12));UI.clear();return;}
        switch(a){
          case 'heal': player.hp=player.maxHp;player.heat=0; UI.toast('❤️ HP восстановлено'); break;
          case 'maxhp': player.maxHp+=1000; player.hp=player.maxHp; UI.toast('+1000 макс HP'); break;
          case 'curse': hurtPlayer(99999,'чит'); break;
          case 'heat0': player.heat=0; UI.toast('🧊 Жар 0'); break;
          case 'heat100': player.heat=100; UI.toast('🔥 Жар 100'); break;
          case 'clearFx': for(const k in player.fx)player.fx[k]=0;player.blind=0; UI.toast('✨ Эффекты сняты'); break;
          case 'money': player.money+=100000; UI.toast('💵 +100 000'); break;
          case 'money10': player.money+=10000000; UI.toast('💎 +10 000 000'); break;
          case 'money0': cheats.infMoney=false;player.money=0; UI.toast('Деньги = 0'); break;
          case 'souls': player.souls=(player.souls||0)+500; UI.toast('👻 +500 душ'); break;
          case 'ladders': player.ladders+=100; UI.toast('🪜 +100 лестниц'); break;
          case 'ammo': player.grappleUnlocked=true; player.grappleAmmo+=100; UI.toast('🚀 +100 снарядов'); break;
          case 'gunAmmo': if(!player.gunLvl)player.gunLvl=1;player.gunAmmo+=500;validateSelection(); UI.toast('🔸 +500 патронов'); break;
          case 'potions': player.potions+=50; UI.toast('🧪 +50 аптечек'); break;
          case 'ice': player.icePotions=(player.icePotions||0)+20; UI.toast('🧊 +20 зелий'); break;
          case 'drills': player.drillBought=true;player.drills+=50; UI.toast('🛠️ +50 буров'); break;
          case 'barr': player.barricadeBought=true;player.barricades+=50; UI.toast('🧱 +50 баррикад'); break;
          case 'earthOres': for(let i=1;i<=17;i++)player.inv[i]=(player.inv[i]||0)+100; UI.toast('🎁 Руда Земли ×100'); break;
          case 'hellOres': for(let i=18;i<ORES.length;i++)if(ORES[i].dim===1)player.inv[i]=(player.inv[i]||0)+100; UI.toast('🔥 Руда Ада ×100'); break;
          case 'lilacOres': for(let i=1;i<ORES.length;i++)if(ORES[i].dim===2)player.inv[i]=(player.inv[i]||0)+100; UI.toast('🌸 Руда Лиловых небес ×100'); break;
          case 'clearInv': player.inv={}; UI.toast('🗑 Очищено'); break;
          case 'maxAll': setMax(); UI.toast('⭐ Земля на максимуме'); break;
          case 'presetHell': setMax();player.prog.heart=true;player.prog.key=true;G.wf.heartTaken=true;player.money=Math.max(player.money,2000000); UI.toast('🔥 Всё готово: иди к порталу'); break;
          case 'presetBoss': setMax();player.potions+=20; teleportToDepth(ARENA_Y0-4);UI.toast('☠ Арена внизу'); UI.clear();return;
          case 'allMats': for(const k in MATS)addMat(k,50); UI.toast('📦 Материалы ×50'); break;
          case 'allCons': if(!player.hitems)player.hitems={};for(const c of HCONS)player.hitems[c.id]=(player.hitems[c.id]||0)+5;validateSelection(); UI.toast('💣 Расходники ×5'); break;
          case 'furnDone': updateFurnace(36000,true); UI.toast('🔥 Печь закончила'); break;
          case 'presetHellMax': setMax();player.pickLvl=10;player.swordLvl=10;player.armorLvl=10;player.gunLvl=GUNS.length;player.gunAmmo+=500;player.gasMask=true;player.icePotions+=20;
            player.digSpeedLvl=DIG_SPEED_HMAX;player.digSpeed=digSpeedMult(DIG_SPEED_HMAX);player.drillLvl=10;player.barricadeLvl=7;player.torchLvl=8;player.slots=34;player.stackLvl=16;furn().lvl=3;
            if(!player.hitems)player.hitems={};for(const h of HITEMS)player.hitems[h.id]=h.max;player.relics={};for(const r of RELICS)player.relics[r.id]=true;player.altarXp=Math.max(player.altarXp||0,16000);player.relEq=['fang','heart','coin','ember'];
            player.prog.heart=player.prog.key=player.prog.hellUnlocked=true;for(const pk of PERKS)player.perks[pk.id]=pk.max;recomputeStats();player.hp=player.maxHp;validateSelection(); UI.toast('👑 Всё на максимум Ада'); break;
          case 'presetFresh': case 'resetUpgrades':
            player.pickLvl=1;player.swordLvl=1;player.armorLvl=1;player.gunLvl=0;player.torchLvl=0;player.fallProtLvl=0;
            player.slots=8;player.digSpeedLvl=0;player.digSpeed=1;player.digRadius=0;player.drillLvl=1;player.drillBought=false;player.barricadeBought=false;player.barricadeLvl=1;player.grappleUnlocked=false;
            player.perks={};recomputeStats();player.hp=player.maxHp;validateSelection();
            UI.toast('↩️ Улучшения сброшены'); break;
          case 'perksMax': for(const pk of PERKS)player.perks[pk.id]=pk.max;recomputeStats(); UI.toast('✨ Благословения на максимум'); break;
          case 'perksReset': player.perks={};recomputeStats(); UI.toast('↩️ Благословения сброшены'); break;
          case 'contractsDone': ensureContracts();for(const c of player.contracts.list){c.have=c.need;c.ready=true;} UI.toast('📜 Контракты выполнены — забери на Доске'); break;
          case 'mask': player.gasMask=!player.gasMask; UI.toast('😷 Противогаз: '+(player.gasMask?'есть':'нет')); break;
          case 'dimSwap': switchDimension(G.dim===0?1:0); UI.toast('Измерение: '+DIM_NAMES[G.dim]); UI.clear(); return;
          case 'san100': case 'san30': case 'san0': player.sanity=+a.slice(3);veilT=veilTarget();UI.toast('Рассудок: '+player.sanity);UI.clear();return;
          case 'ltea': addMat('ltea',10);validateSelection();UI.toast('🍵 +10 настоев');break;
          case 'lilNight': lilSetNight(!(lilNight()>0.5)); Music.lastPick=0; UI.toast(lilNight()>0.5?'🌙 Ночь':'☀ День'); UI.clear(); return;
          case 'dim0': case 'dim1': case 'dim2': switchDimension(+a.slice(3)); UI.toast('Измерение: '+DIM_NAMES[G.dim]); UI.clear(); return;
          case 'cutscene': startCutscene(G.dim===0?1:0); return;
          case 'toLobby': if(G.scene==='mine')exitMine();UI.clear();return;
          case 'tpArena': if(G.dim!==0)switchDimension(0); teleportToDepth(ARENA_FLOOR-1); UI.clear(); return;
          case 'tpHeart':{ if(G.dim!==0)switchDimension(0); needMine(); const h=heartSpot();player.x=(h.x-3)*TILE+16;player.y=(h.y+1)*TILE;player.peakY=player.y;G.cam.x=player.x;G.cam.y=player.y; UI.clear(); return;}
          case 'tpCore': if(G.dim!==1)switchDimension(1); teleportToDepth(1230); UI.clear(); return;
          case 'tpExit': needMine(); teleportToDepth(6); UI.clear(); return;
          case 'tpAnchor':{ needMine(); let best=null,bd=1e9;for(const q of anchorList()){const dd=Math.hypot(q.x*TILE-player.x,q.y*TILE-player.y);if(dd<bd){bd=dd;best=q;}}
            if(best){player.x=(best.x-2)*TILE+16;player.y=(best.y+1)*TILE;player.peakY=player.y;G.cam.x=player.x;G.cam.y=player.y;anchorNear=best.id;} UI.clear(); return;}
          case 'storm': if(G.scene==='mine'&&G.dim===1){if(ashEv)endAshEvent(true);startAshEvent('storm',true);UI.clear();return;} else UI.toast('Только в шахте Ада'); break;
          default: if(a&&a.startsWith('ev_')){if(G.scene==='mine'&&G.dim===1){if(ashEv)endAshEvent(true);startAshEvent(a.slice(3),true);UI.clear();return;} UI.toast('Только в шахте Ада');} break;
          case 'meteors': if(G.scene==='mine'&&G.dim===1){for(let k=0;k<5;k++)hellFx.push({type:'meteor',x:player.x+rnd(-250,250),y:player.y-12*TILE,vy:200,t:-k*0.25,warn:0.9,dmg:120});UI.clear();return;} UI.toast('Только в шахте Ада'); break;
          case 'gas': if(G.scene==='mine'){gasCloud(player.x+player.facing*80,player.y-30,90,80,7);UI.clear();return;} break;
          case 'clearArea':{
            if(G.scene!=='mine'){UI.toast('Только в шахте');break;}
            const ptx=Math.floor(player.x/TILE),pty=Math.floor(player.y/TILE);
            for(let dy=-5;dy<=5;dy++)for(let dx=-5;dx<=5;dx++){
              const t=getTile(ptx+dx,pty+dy);
              if(t!==T_AIR&&t!==T_BEDROCK&&t!==T_ARENA&&t!==T_LAVA)setTile(ptx+dx,pty+dy,T_AIR);
            }
            UI.toast('⛏ Расчищено'); break;
          }
          case 'killMobs': mobs.length=0; G.arenaFight&&(G.arenaFight=true); UI.toast('💀 Мобы убраны'); break;
          case 'spawnMobs':
            if(G.scene!=='mine'){UI.toast('Только в шахте');break;}
            for(let i=0;i<5;i++)trySpawnMob();
            UI.toast('👾 +5 мобов'); break;
          case 'spawnBoss': if(G.dim!==0){UI.toast('Босс живёт на Земле');break;} G.wf.bossDead=false; teleportToDepth(ARENA_FLOOR-1); UI.clear(); return;
          case 'bossPhase':{const b=bossAlive();if(!b){UI.toast('Босса нет');break;} b.invuln=0;b.hp=Math.min(b.hp,b.maxHp*(b.b.phase===1?0.65:0.32));UI.clear();return;}
          case 'regenNow':{
            if(G.scene!=='mine'){UI.toast('Только в шахте');break;}
            let cnt=0;
            const keys=Array.from(dugTiles.keys());
            for(const k of keys){
              const idx=k.indexOf(',');
              const tx=+k.slice(0,idx),ty=+k.slice(idx+1);
              if(placedLadders.has(k)){dugTiles.delete(k);continue;}
              if(getTile(tx,ty)!==T_AIR){dugTiles.delete(k);continue;}
              regenTile(tx,ty);
              dugTiles.delete(k);
              cnt++;regenTotal++;
              if(cnt>=2000)break;
            }
            UI.toast('🌱 Восстановлено '+cnt+' блоков'); break;
          }
          case 'regenStats':
            UI.toast('Очередь: '+dugTiles.size+' · Восстановлено: '+regenTotal); break;
          case 'resetCheats':
            for(const k in cheats)cheats[k]=false;
            UI.toast('🔄 Читы сброшены'); break;
          case 'lockCheats':
            settings.cheatsUnlocked=false;saveSettings();
            UI.toast('🔒 Читы заблокированы');UI.mainMenu();return;
          case 'saveNow': manualSave(); break;
        }
        saveGame();
        rerender();
      };
    });
    if(d.querySelector('#tpBtn'))d.querySelector('#tpBtn').onclick=()=>{
      const v=parseInt(d.querySelector('#tpDepth').value,10);
      if(isNaN(v)||v<0){UI.toast('Неверно');return;}
      teleportToDepth(v);UI.clear();
    };
    d.querySelector('#chBack').onclick=()=>{
      SFX.uiBack();
      if(G.scene==='menu')UI.mainMenu();else UI.pause();
    };
  }
};

function teleportToDepth(depth){
  if(G.scene!=='mine'){enterMine();UI.clear();}
  mobs=mobs.filter(m=>m.def.boss);
  const ptx=Math.floor(MW/2);
  const pty=Math.max(0,Math.floor(depth));
  let best=null;
  outer: for(let r=0;r<20;r++){
    for(let dx=-r;dx<=r;dx++)for(let dy=-r;dy<=r;dy++){
      const tx=ptx+dx, ty=pty+dy;
      if(tx<1||tx>=MW-1||ty<1)continue;
      if(getTile(tx,ty)===T_AIR && getTile(tx,ty-1)===T_AIR && isSolid(tx,ty+1)){
        best={tx,ty};break outer;
      }
    }
  }
  if(!best){UI.toast('Не найдено место');return;}
  player.x=best.tx*TILE+TILE/2;
  player.y=(best.ty+1)*TILE-2;
  player.vx=0;player.vy=0;
  player.peakY=player.y;
  G.cam.x=player.x;G.cam.y=player.y;
  UI.toast('🌐 Телепорт на '+depth+' м');
  saveGame();
}

function renderDie(n){
  return `<div style="width:62px;height:62px;border-radius:12px;background:linear-gradient(180deg,#f5f7fb,#cfd6e0);color:#1a2233;display:flex;align-items:center;justify-content:center;font-size:34px;font-weight:900;box-shadow:0 4px 0 #8a90a0,inset 0 -4px 8px rgba(0,0,0,.2);">${n||'?'}</div>`;
}

function playCasinoWheel(){
  if(casinoState.spinning)return;
  const oreId=casinoState.oreId;
  const amount=casinoState.amount;
  if(!oreId||!player.inv[oreId]||player.inv[oreId]<amount){UI.toast('Мало руды');return;}
  player.inv[oreId]-=amount;
  if(player.inv[oreId]<=0)delete player.inv[oreId];
  casinoState.spinning=true;casinoState.wheelResult=null;

  let r=Math.random(),acc=0,idx=0;
  for(let i=0;i<WHEEL_WEIGHTS.length;i++){
    acc+=WHEEL_WEIGHTS[i];
    if(r<=acc){idx=i;break;}
  }
  const mult=WHEEL[idx].m;
  const currentRot=casinoState.wheelRot;
  const currentAngle=((currentRot%360)+360)%360;
  const targetAngle=((360-(idx*45+22.5))%360+360)%360;
  const delta=((targetAngle-currentAngle)%360+360)%360;
  const totalRot=currentRot+5*360+delta;
  casinoState.wheelRot=totalRot;

  const wheelEl=document.getElementById('wheelEl');
  if(wheelEl){
    wheelEl.style.transition='transform 3.6s cubic-bezier(.12,.72,.16,1)';
    wheelEl.style.transform=`rotate(${totalRot}deg)`;
  }
  SFX.spin();vib(15);

  setTimeout(()=>{
    casinoState.spinning=false;
    casinoState.wheelResult=mult;
    const gain=Math.floor(amount*mult);
    if(gain>0)player.inv[oreId]=(player.inv[oreId]||0)+gain;
    const cEl=document.getElementById('wheelCEl');
    if(cEl)cEl.textContent='×'+mult;
    if(mult>1){SFX.win();vib(45);UI.toast('Выигрыш! +'+gain+' '+ORES[oreId].name);}
    else if(mult===1){UI.toast('Возврат');}
    else {SFX.lose();vib(30);UI.toast('Проигрыш: −'+amount);}
    saveGame();
    setTimeout(()=>{if(UI.modal==='casino')UI.casino();},900);
  },3700);
}
function playCasinoDice(){
  const oreId=casinoState.oreId;
  const amount=casinoState.amount;
  if(!oreId||!player.inv[oreId]||player.inv[oreId]<amount){UI.toast('Мало руды');return;}
  player.inv[oreId]-=amount;
  if(player.inv[oreId]<=0)delete player.inv[oreId];
  const d1=1+Math.floor(Math.random()*6);
  const d2=1+Math.floor(Math.random()*6);
  const sum=d1+d2;
  const type=casinoState.betType;
  let win=false,mult=0;
  if(type==='big'&&sum>7){win=true;mult=2;}
  else if(type==='small'&&sum<7){win=true;mult=2;}
  else if(type==='seven'&&sum===7){win=true;mult=5;}
  casinoState.diceResult={d1,d2,sum,win,mult};
  SFX.dice();
  setTimeout(()=>{
    const gain=Math.floor(amount*mult);
    if(gain>0)player.inv[oreId]=(player.inv[oreId]||0)+gain;
    if(win){SFX.win();vib(40);UI.toast('Победа! +'+gain);}
    else {SFX.lose();vib(30);UI.toast('Проигрыш: −'+amount);}
    saveGame();UI.casino();
  },600);
}
function playCasinoCups(chosen){
  if(casinoState.cupsState)return;
  const oreId=casinoState.oreId;
  const amount=casinoState.amount;
  if(!oreId||!player.inv[oreId]||player.inv[oreId]<amount){UI.toast('Мало руды');return;}
  player.inv[oreId]-=amount;
  if(player.inv[oreId]<=0)delete player.inv[oreId];
  const ballAt=Math.floor(Math.random()*3);
  const win=chosen===ballAt;
  const mult=win?2.8:0;
  casinoState.cupsState={ballAt,chosen,win,mult,oreId,amount};
  if(win){SFX.win();vib(30);}else{SFX.lose();vib(30);}
  UI.casino();
}

function showDeath(lost){
  SFX.lose();
  const d=UI.build('death',`
    <h1 class="title" style="font-size:clamp(26px,8vw,44px);background:linear-gradient(180deg,#ff9a9a,#c92a2a);-webkit-background-clip:text;background-clip:text;color:transparent;">ВЫ ПОГИБЛИ</h1>
    <div class="card" style="max-width:420px;text-align:center">
      <p class="muted">Потеряно руды: <b style="color:#ff8a8a">${lost} шт</b></p>
      <p class="muted">Улучшения сохранены.</p>
    </div>
    <button class="btn" id="dRes">Возродиться</button>
  `);
  d.querySelector('#dRes').onclick=()=>{
    SFX.ui();
    player.hp=player.maxHp;player.vx=0;player.vy=0;
    G.scene='lobby';G.mineActive=false;
    mobs=[];projectiles.length=0;beams.length=0;grapple=null;drills.length=0;aim.active=false;
    Input.digActive=false;Input.digPtr=null;
    lobbyPlayer.x=buildings[0].x+140;
    UI.clear();saveGame();
  };
}

function roundRect(c,x,y,w,h,r){
  r=Math.min(r,w/2,h/2);
  c.beginPath();
  c.moveTo(x+r,y);
  c.arcTo(x+w,y,x+w,y+h,r);
  c.arcTo(x+w,y+h,x,y+h,r);
  c.arcTo(x,y+h,x,y,r);
  c.arcTo(x,y,x+w,y,r);
  c.closePath();
}

/* ---------- значки и плашки верхней панели (рисуются на холсте, без эмодзи) ---------- */
const HUDF='Rubik,system-ui,sans-serif';
const HUDL={rb:56};
function hudPlate(x,y,w,h,warn){
  ctx.fillStyle='rgba(18,14,11,.84)';roundRect(ctx,x,y,w,h,Math.min(7,h/2));ctx.fill();
  ctx.strokeStyle=warn?'rgba(255,90,70,.75)':'rgba(255,224,176,.16)';ctx.lineWidth=1;roundRect(ctx,x+0.5,y+0.5,w-1,h-1,Math.min(6.5,h/2));ctx.stroke();
  ctx.fillStyle='rgba(255,236,206,.06)';ctx.fillRect(x+4,y+1,w-8,1);
}
function hudIcon(kind,cx,cy,s){
  const c=ctx;c.save();c.translate(cx,cy);c.lineJoin='round';c.lineCap='round';
  switch(kind){
    case 'coin':{const g=c.createRadialGradient(-s*0.2,-s*0.25,s*0.05,0,0,s*0.5);g.addColorStop(0,'#fff4c8');g.addColorStop(0.55,'#f2b84a');g.addColorStop(1,'#a86a1a');
      c.fillStyle=g;c.beginPath();c.arc(0,0,s*0.46,0,TAU);c.fill();c.strokeStyle='rgba(110,60,10,.9)';c.lineWidth=1;c.stroke();
      c.strokeStyle='rgba(140,80,20,.7)';c.beginPath();c.arc(0,0,s*0.28,0,TAU);c.stroke();break;}
    case 'heart':{c.fillStyle='#ff5a5a';c.beginPath();c.moveTo(0,s*0.38);c.bezierCurveTo(-s*0.55,0,-s*0.42,-s*0.48,0,-s*0.18);c.bezierCurveTo(s*0.42,-s*0.48,s*0.55,0,0,s*0.38);c.fill();
      c.fillStyle='rgba(255,255,255,.55)';c.beginPath();c.ellipse(-s*0.18,-s*0.14,s*0.08,s*0.05,-0.6,0,TAU);c.fill();break;}
    case 'depth':{c.strokeStyle='#9be8ff';c.lineWidth=Math.max(1.6,s*0.14);c.beginPath();c.moveTo(0,-s*0.4);c.lineTo(0,s*0.22);c.moveTo(-s*0.24,0);c.lineTo(0,s*0.26);c.lineTo(s*0.24,0);c.stroke();
      c.strokeStyle='rgba(155,232,255,.5)';c.beginPath();c.moveTo(-s*0.4,s*0.42);c.lineTo(s*0.4,s*0.42);c.stroke();break;}
    case 'soul':{const g=c.createRadialGradient(0,s*0.1,1,0,0,s*0.5);g.addColorStop(0,'#eafcff');g.addColorStop(0.6,'#7fd8ff');g.addColorStop(1,'#2a6a98');c.fillStyle=g;
      c.beginPath();c.moveTo(0,-s*0.46);c.quadraticCurveTo(s*0.42,0,s*0.3,s*0.24);c.arc(0,s*0.18,s*0.3,0.2,Math.PI-0.2);c.quadraticCurveTo(-s*0.42,0,0,-s*0.46);c.fill();break;}
    case 'ore':{c.fillStyle='#8a8f98';c.beginPath();c.moveTo(-s*0.44,s*0.1);c.lineTo(-s*0.2,-s*0.36);c.lineTo(s*0.3,-s*0.3);c.lineTo(s*0.46,s*0.12);c.lineTo(s*0.1,s*0.4);c.lineTo(-s*0.3,s*0.34);c.closePath();c.fill();
      c.fillStyle='#ffd060';c.beginPath();c.arc(-s*0.08,-s*0.06,s*0.12,0,TAU);c.arc(s*0.2,s*0.14,s*0.08,0,TAU);c.fill();break;}
    case 'sprout':{c.strokeStyle='#7dffb0';c.lineWidth=Math.max(1.4,s*0.12);c.beginPath();c.moveTo(0,s*0.42);c.lineTo(0,-s*0.05);c.stroke();
      c.fillStyle='#7dffb0';c.beginPath();c.ellipse(-s*0.2,-s*0.12,s*0.22,s*0.1,0.6,0,TAU);c.ellipse(s*0.2,-s*0.24,s*0.22,s*0.1,-0.6,0,TAU);c.fill();break;}
    case 'flame':{c.fillStyle='#ffb030';c.beginPath();c.moveTo(0,-s*0.48);c.quadraticCurveTo(s*0.46,0,s*0.2,s*0.42);c.quadraticCurveTo(0,s*0.5,-s*0.2,s*0.42);c.quadraticCurveTo(-s*0.46,0,0,-s*0.48);c.fill();
      c.fillStyle='#fff0a0';c.beginPath();c.ellipse(0,s*0.18,s*0.12,s*0.18,0,0,TAU);c.fill();break;}
    case 'eye':{const T=veilT;c.fillStyle=T>0.5?'#f0d0c8':'#f4ecff';c.beginPath();c.ellipse(0,0,s*0.5,s*0.3,0,0,TAU);c.fill();
      c.fillStyle=T>0.5?'#b01030':'#9a6ad8';c.beginPath();c.arc(0,0,s*0.2,0,TAU);c.fill();c.fillStyle='#120818';c.beginPath();c.ellipse(0,0,s*0.07,s*0.16,0,0,TAU);c.fill();
      c.strokeStyle='rgba(60,20,70,.8)';c.lineWidth=1;c.beginPath();c.ellipse(0,0,s*0.5,s*0.3,0,0,TAU);c.stroke();break;}
    case 'tea':{c.fillStyle='#e8f8ee';c.beginPath();c.moveTo(-s*0.38,-s*0.15);c.lineTo(s*0.32,-s*0.15);c.quadraticCurveTo(s*0.3,s*0.42,0,s*0.42);c.quadraticCurveTo(-s*0.36,s*0.42,-s*0.38,-s*0.15);c.fill();
      c.fillStyle='#7ad8a0';c.fillRect(-s*0.3,-s*0.12,s*0.56,s*0.12);c.strokeStyle='#e8f8ee';c.lineWidth=1.4;c.beginPath();c.arc(s*0.38,s*0.08,s*0.12,-1.4,1.4);c.stroke();break;}
    case 'ice':{c.strokeStyle='#9fe8ff';c.lineWidth=Math.max(1.4,s*0.12);for(let k=0;k<3;k++){c.rotate(Math.PI/3);c.beginPath();c.moveTo(0,-s*0.44);c.lineTo(0,s*0.44);c.stroke();}break;}
  }
  c.restore();
}
/* плашка «значок + текст», выровненная по правому краю rx */
function hudPillR(rx,y,kind,text,col){
  ctx.font='700 12px '+HUDF;const tw=ctx.measureText(text).width,w=tw+34;
  hudPlate(rx-w,y,w,20);hudIcon(kind,rx-w+13,y+10,13);
  ctx.fillStyle=col;ctx.textAlign='left';ctx.fillText(text,rx-w+24,y+14.5);return w;
}
/* катсцена: весь интерфейс скрыт, видны только полосы кино, титры и вспышки */
function hudHidden(){return G.scene==='mine'&&!!G.bossCut;}
function drawCutOverlay(){
  const W=view.W,H=view.H;ctx.save();
  if(G.bossCut&&G.bossCut.hb&&G.scene==='mine')hbDrawCutHud(ctx,W,H);
  else if(G.bossCut&&G.scene==='mine'){
    const c=G.bossCut,t=c.t,lb=Math.min(1,t/0.6,(c.dur-t)/0.6),bh=H*0.11*lb;
    ctx.fillStyle='#000';ctx.fillRect(0,0,W,bh);ctx.fillRect(0,H-bh,W,bh);
    if(t>3.5&&t<6.2){const a=Math.min(1,(t-3.5)/0.5,(6.2-t)/0.5);ctx.globalAlpha=a;ctx.textAlign='center';
      const sp=Math.max(0,1-(t-3.5)/0.8);ctx.fillStyle='#e8c8ff';ctx.font='900 '+Math.min(36,W*0.08)+'px system-ui,sans-serif';
      const title='ПОЖИРАТЕЛЬ БЕЗДНЫ';if(ctx.letterSpacing!==undefined)ctx.letterSpacing=(2+sp*14)+'px';
      ctx.shadowColor='#7a3aff';ctx.shadowBlur=18;ctx.fillText(title,W/2,H*0.74);ctx.shadowBlur=0;if(ctx.letterSpacing!==undefined)ctx.letterSpacing='0px';
      ctx.font='700 13px system-ui,sans-serif';ctx.fillStyle='#b8a0e0';ctx.fillText('Страж Ключа Бездны · Древнее Око Пустоты',W/2,H*0.74+22);ctx.globalAlpha=1;}
  }
  hbDrawHudFx(ctx,W,H);
  if(G.bossFlash>0){ctx.fillStyle='rgba(255,245,255,'+Math.min(0.85,G.bossFlash*0.7)+')';ctx.fillRect(0,0,W,H);}
  ctx.restore();
}
function drawHUD(){
  const W=view.W,H=view.H;
  ctx.save();
  const top=8;
  const hpW=Math.min(170,W*0.36);
  const hpF=clamp(player.hp/player.maxHp,0,1),low=hpF<0.25&&player.hp>0;
  hudPlate(10,top,hpW,22,low&&Math.sin(G.time*8)>0);
  hudIcon('heart',23,top+11.5,14);
  const bx0=34,bw0=hpW-30;
  ctx.fillStyle='rgba(0,0,0,.45)';roundRect(ctx,bx0,top+5,bw0,12,6);ctx.fill();
  if(hpF>0){const grd=ctx.createLinearGradient(0,top+5,0,top+17);
    grd.addColorStop(0,low?'#ff7a6a':'#ff6a5a');grd.addColorStop(1,low?'#b8201a':'#c8302a');
    ctx.fillStyle=grd;roundRect(ctx,bx0,top+5,Math.max(12,bw0*hpF),12,6);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.22)';ctx.fillRect(bx0+5,top+6,Math.max(2,bw0*hpF-10),2);}
  bfDrawHpExtra(bx0+2,top+6,bw0-4,10);               /* рана и лечение в бою с боссом */
  ctx.fillStyle='#fff';ctx.font='700 10.5px '+HUDF;ctx.textAlign='center';
  ctx.shadowColor='rgba(0,0,0,.8)';ctx.shadowBlur=2;ctx.fillText(Math.ceil(player.hp)+' / '+player.maxHp,bx0+bw0/2,top+15);ctx.shadowBlur=0;
  if(G.dim===1&&G.scene==='mine'){
    const hf=clamp((player.heat||0)/100,0,1);
    hudPlate(10,top+25,hpW,15);hudIcon(player.iceT>0?'ice':'flame',22,top+32.5,11);
    ctx.fillStyle='rgba(0,0,0,.45)';roundRect(ctx,bx0,top+29,bw0,7,3.5);ctx.fill();
    const hg=ctx.createLinearGradient(bx0,0,bx0+bw0,0);hg.addColorStop(0,'#ffb030');hg.addColorStop(1,'#ff2a0a');
    if(hf>0){ctx.fillStyle=player.iceT>0?'#7fd8ff':hg;roundRect(ctx,bx0,top+29,Math.max(7,bw0*hf),7,3.5);ctx.fill();}
    if(hf>=1){ctx.fillStyle='rgba(255,255,255,'+(0.3+0.3*Math.sin(G.time*14))+')';roundRect(ctx,bx0,top+29,bw0,7,3.5);ctx.fill();}
    ctx.fillStyle='#ffe0c0';ctx.font='700 9px '+HUDF;ctx.textAlign='right';ctx.fillText(Math.round(player.heat||0)+'%',10+hpW-6,top+36);
  }
  if(G.dim===2&&G.scene==='mine'){   /* Рассудок: полная полоса — Иллюзия, пустая — Истина */
    const sf=clamp((player.sanity==null?100:player.sanity)/100,0,1),lowS=sf<0.25;
    hudPlate(10,top+25,hpW,15,lowS&&Math.sin(G.time*6)>0);hudIcon(player.teaT>0?'tea':'eye',22,top+32.5,12);
    ctx.fillStyle='rgba(0,0,0,.45)';roundRect(ctx,bx0,top+29,bw0,7,3.5);ctx.fill();
    const sg=ctx.createLinearGradient(bx0,0,bx0+bw0,0);sg.addColorStop(0,'#a01a4a');sg.addColorStop(0.45,'#b07ae0');sg.addColorStop(1,'#f0d0ff');
    if(sf>0){ctx.fillStyle=player.teaT>0?'#bff0d0':sg;roundRect(ctx,bx0,top+29,Math.max(7,bw0*sf),7,3.5);ctx.fill();ctx.fillStyle='rgba(255,255,255,.25)';ctx.fillRect(bx0+4,top+30,Math.max(2,bw0*sf-8),1.4);}
    ctx.fillStyle=lowS?'#ffb0c8':'#ecdcff';ctx.font='700 9px '+HUDF;ctx.textAlign='right';ctx.fillText(Math.round((player.sanity==null?100:player.sanity))+'%',10+hpW-6,top+36);
  }

  /* правая колонка: левее кнопки паузы, подложки по ширине текста */
  const pb=getBtnRect('pause'),pw=pb.r*1.9,ph=pb.r*1.7;
  const nearPause=pb.y-ph/2<top+60&&pb.x+pw/2>W-170;
  const rx=nearPause?pb.x-pw/2-6:W-10;
  let ry=top;
  hudPillR(rx,ry,'coin',fmt(player.money),'#ffd98a');ry+=24;
  if(G.dim===1||(player.souls||0)>0){hudPillR(rx,ry,'soul',fmt(player.souls||0),'#9ad8ff');ry+=24;}
  if(G.scene==='mine'){
    hudPillR(rx,ry,'ore',totalOre()+' шт · '+invCount()+'/'+player.slots,'#e6d9c4');ry+=24;
    if(settings.regen&&dugTiles.size>0){hudPillR(rx,ry,'sprout',dugTiles.size+' в очереди','#7dffb0');ry+=24;}
  }
  HUDL.rb=Math.max(ry,nearPause?pb.y+ph/2+6:0);

  const depth=G.scene==='mine'?Math.floor(Math.max(0,player.y)/TILE):0;
  {ctx.font='800 12.5px '+HUDF;const t=depth+' м',w=ctx.measureText(t).width+34;
    hudPlate(W/2-w/2,top,w,20);hudIcon('depth',W/2-w/2+13,top+10,13);
    ctx.fillStyle='#bff0ff';ctx.textAlign='left';ctx.fillText(t,W/2-w/2+24,top+14.5);}
  if(G.saveFlash>0){   /* короткая отметка об автосохранении под глубиной */
    const fa=Math.min(1,G.saveFlash/0.5,(2.2-G.saveFlash)/0.2+0.4);ctx.globalAlpha=clamp(fa,0,1)*0.9;
    hudPlate(W/2-36,top+24,72,15);
    ctx.fillStyle='#9fe8b0';ctx.font='700 9.5px '+HUDF;ctx.textAlign='center';ctx.fillText('сохранено',W/2,top+35);ctx.globalAlpha=1;
  }

  ctx.globalAlpha=pb.a;
  hudPlate(pb.x-pw/2,pb.y-ph/2,pw,ph);
  ctx.fillStyle='#e9dcc7';
  {const bw=Math.max(3,pb.r*0.2),bh=pb.r*0.72;roundRect(ctx,pb.x-bw*1.6,pb.y-bh/2,bw,bh,1.5);ctx.fill();roundRect(ctx,pb.x+bw*0.6,pb.y-bh/2,bw,bh,1.5);ctx.fill();}
  ctx.textBaseline='alphabetic';
  ctx.globalAlpha=1;

  if(G.scene==='mine'){
    /* шкала глубины: между верхней панелью и джойстиком, не залезает на него */
    const jbr=getBtnRect('joy'),jTop=(jbr.x<W*0.4)?jbr.y-jbr.r-18:H*0.7;
    const bx=12,bw=8,by=Math.max(H*0.2,G.dim>=1?84:62),bh=Math.max(50,Math.min(H*0.42,jTop-by-6));
    hudPlate(bx-3,by-3,bw+6,bh+6);
    const DI=dimInfo(),maxD=DI.maxD;
    const cols=['#7a5a34','#6a7180','#5a4aa0','#a0442a','#3a2a6a','#6a5a52','#8a2030','#a09a2a','#b8b8c8','#e04a10',
      '#c98ad8','#7ab8e8','#e8b040','#d87aa8','#c0304a','#5ab8b0','#9a3a7a'];
    for(let i=DI.b0;i<DI.b0+DI.bn;i++){
      const b=BIOMES[i];
      const y0=by+bh*(clamp(b.d0,0,maxD)/maxD);
      const y1=by+bh*(clamp(b.d1,0,maxD)/maxD);
      ctx.fillStyle=cols[i];
      ctx.fillRect(bx+1,y0,bw-2,Math.max(2,y1-y0-1));
    }
    const py=by+bh*(clamp(depth,0,maxD)/maxD);
    ctx.fillStyle='#fff';
    ctx.fillRect(bx-2,py-1,bw+4,2);
    ctx.fillStyle='rgba(230,217,196,.8)';ctx.font='700 9.5px '+HUDF;ctx.textAlign='left';
    ctx.shadowColor='rgba(0,0,0,.9)';ctx.shadowBlur=2;
    ctx.fillText('0',bx+bw+6,by+8);
    ctx.fillText(DI.mark,bx+bw+6,by+bh);ctx.shadowBlur=0;
    if(G.dim===0){const ay=by+bh*(ARENA_Y0/maxD);ctx.fillStyle=G.wf.bossDead?'#5ab8ff':'#ff5aff';ctx.fillRect(bx-3,ay-1,bw+6,3);ctx.font='12px system-ui';ctx.fillText(G.wf.bossDead?'✔':'☠',bx+bw+4,ay+4);}
  }
  {const boss=G.scene==='mine'&&!G.bossCut?bossAlive():null;
  if(boss&&boss.def.hb)hbDrawBar(ctx,boss,W,top);
  else if(boss){
    const bw2=Math.min(W-40,420),bx2=W/2-bw2/2,by2=top+30;
    ctx.fillStyle='rgba(8,4,16,.82)';roundRect(ctx,bx2-4,by2-2,bw2+8,28,8);ctx.fill();
    const f=clamp(boss.hp/boss.maxHp,0,1),ph=boss.b?boss.b.phase:1;
    const gg=ctx.createLinearGradient(bx2,0,bx2+bw2,0);
    gg.addColorStop(0,ph===3?'#ff3a3a':'#8a3aff');gg.addColorStop(1,ph===1?'#c8a0ff':'#ff70ff');
    ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(bx2,by2+14,bw2,8);
    ctx.fillStyle=gg;ctx.fillRect(bx2,by2+14,bw2*f,8);
    ctx.fillStyle='rgba(255,255,255,.5)';ctx.fillRect(bx2+bw2*0.66,by2+13,2,10);ctx.fillRect(bx2+bw2*0.33,by2+13,2,10);
    if(boss.invuln>0){ctx.fillStyle='rgba(255,255,255,'+(0.2+0.2*Math.sin(G.time*20))+')';ctx.fillRect(bx2,by2+14,bw2*f,8);}
    ctx.fillStyle='#f0e0ff';ctx.font='800 12px system-ui,sans-serif';ctx.textAlign='center';
    ctx.fillText('ПОЖИРАТЕЛЬ БЕЗДНЫ · фаза '+ph,W/2,by2+11);
  }
  hbDrawHudFx(ctx,W,H);
  if(G.bossFlash>0&&G.scene==='mine'){ctx.fillStyle='rgba(255,245,255,'+Math.min(0.85,G.bossFlash*0.7)+')';ctx.fillRect(0,0,W,H);}
  if(G.bossIntro>0&&G.scene==='mine'){
    const a=Math.min(1,G.bossIntro,3.2-G.bossIntro);
    ctx.fillStyle='rgba(0,0,0,'+(0.45*a)+')';ctx.fillRect(0,H*0.38,W,H*0.18);
    ctx.globalAlpha=a;ctx.textAlign='center';ctx.fillStyle='#e8c8ff';ctx.font='900 '+Math.min(34,W*0.075)+'px system-ui,sans-serif';
    ctx.fillText('ПОЖИРАТЕЛЬ БЕЗДНЫ',W/2,H*0.47);
    ctx.font='700 13px system-ui,sans-serif';ctx.fillStyle='#b8a0e0';ctx.fillText('Страж Ключа Бездны',W/2,H*0.52);ctx.globalAlpha=1;
  }
  if(stormOn>0&&G.scene==='mine'&&G.dim===1){ctx.fillStyle='rgba(120,90,70,'+(0.28*Math.min(1,stormOn,16-stormOn))+')';ctx.fillRect(0,0,W,H);}
  if(ashEv&&G.scene==='mine'&&G.dim===1){
    const E=ASH_EVENTS[ashEv.id],e=ashEv;
    if(e.id==='bloodmoon'||e.id==='toxfog'||e.id==='coldwind'){const a=Math.min(1,e.t/2,(e.dur-e.t)/2);
      const col=e.id==='bloodmoon'?'120,0,10':e.id==='toxfog'?'110,140,20':'150,200,255';
      const vg=ctx.createRadialGradient(W/2,H/2,e.id==='toxfog'?20:60,W/2,H/2,Math.max(W,H)*0.62);vg.addColorStop(0,'rgba('+col+','+(e.id==='toxfog'?0.25:0.06)*a+')');vg.addColorStop(1,'rgba('+col+','+(e.id==='toxfog'?0.8:0.45)*a+')');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
      if(e.id==='bloodmoon'){const mx=W*0.82,my=H*0.2;ctx.fillStyle='rgba(200,20,30,'+a+')';ctx.beginPath();ctx.arc(mx,my,20,0,TAU);ctx.fill();ctx.fillStyle='rgba(255,90,90,'+(0.3*a)+')';ctx.beginPath();ctx.arc(mx,my,30,0,TAU);ctx.fill();}}
    if(G.evFlash>0){ctx.fillStyle=e.id==='heartbeat'?'rgba(160,0,20,'+(G.evFlash*0.5)+')':'rgba(255,220,140,'+(G.evFlash*0.45)+')';ctx.fillRect(0,0,W,H);}
    if(e.id==='eclipse'){const a=Math.min(1,e.t/2,(e.dur-e.t)/2)*(relicOn('mask')?0.35:1);const vg=ctx.createRadialGradient(W/2,H/2,40,W/2,H/2,Math.max(W,H)*0.6);vg.addColorStop(0,'rgba(20,0,40,'+(0.15*a)+')');vg.addColorStop(1,'rgba(10,0,25,'+(0.7*a)+')');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
      const mx=W*0.82,my=H*0.2;ctx.fillStyle='rgba(0,0,0,'+a+')';ctx.beginPath();ctx.arc(mx,my,22,0,TAU);ctx.fill();ctx.strokeStyle='rgba(200,160,255,'+(0.8*a)+')';ctx.lineWidth=2;ctx.beginPath();ctx.arc(mx,my,23,0,TAU);ctx.stroke();}
    /* компактная плашка события: слева под шкалой Жара, не закрывает обзор */
    ctx.font='700 10.5px system-ui,sans-serif';
    const lbl=E.ic+' '+E.n,bw=Math.min(Math.max(96,ctx.measureText(lbl).width+18),W*0.42),bx=10,by=46;
    ctx.fillStyle='rgba(8,6,10,.62)';roundRect(ctx,bx,by,bw,19,9.5);ctx.fill();
    ctx.save();roundRect(ctx,bx,by,bw,19,9.5);ctx.clip();ctx.fillStyle=hexA(E.col,0.22);ctx.fillRect(bx,by,bw*Math.max(0,1-e.t/e.dur),19);ctx.restore();
    ctx.textAlign='left';ctx.fillStyle=E.col;ctx.fillText(lbl,bx+8,by+13);
  }
  if(G.scene==='mine'||G.scene==='lobby')drawEvNotice(W,H);
  if(G.bossPhaseFlash>0&&G.scene==='mine'){ctx.fillStyle='rgba(255,180,255,'+(0.35*G.bossPhaseFlash)+')';ctx.fillRect(0,0,W,H);}
  if(G.bossOutro>0&&G.scene==='mine'){
    const a=Math.min(1,G.bossOutro);ctx.globalAlpha=a;ctx.textAlign='center';
    ctx.fillStyle='#ffd98a';ctx.font='900 '+Math.min(28,W*0.065)+'px system-ui,sans-serif';ctx.fillText('ПОЖИРАТЕЛЬ ПОВЕРЖЕН',W/2,H*0.4);
    ctx.font='700 13px system-ui,sans-serif';ctx.fillStyle='#e0c8ff';ctx.fillText('🗝 Ключ Бездны у тебя. Портал в Ад ждёт в лобби.',W/2,H*0.4+24);ctx.globalAlpha=1;
  }}
  if(G.scene==='lobby'&&G.nearBuilding){
    ctx.textAlign='center';
    const nm=G.nearBuilding.name,tp=G.nearBuilding.tip+' · тапни по зданию';
    ctx.font='800 13px system-ui,sans-serif';const w1=ctx.measureText(nm).width;
    let fs=11.5;ctx.font='600 '+fs+'px system-ui,sans-serif';while(ctx.measureText(tp).width>W-44&&fs>8.5){fs-=0.5;ctx.font='600 '+fs+'px system-ui,sans-serif';}
    const tw=Math.min(W-20,Math.max(w1,ctx.measureText(tp).width)+26);
    ctx.fillStyle='rgba(8,10,16,.85)';roundRect(ctx,W/2-tw/2,H-176,tw,38,12);ctx.fill();
    ctx.font='800 13px system-ui,sans-serif';ctx.fillStyle='#ffd98a';ctx.fillText(nm,W/2,H-160);
    ctx.font='600 '+fs+'px system-ui,sans-serif';ctx.fillStyle='rgba(230,236,245,.8)';ctx.fillText(tp,W/2,H-145);
  }
  if(settings.cheatsUnlocked){
    const active=[];
    if(cheats.god)active.push('🛡');
    if(cheats.infMoney)active.push('💰');
    if(cheats.instantDig)active.push('⚡');
    if(cheats.noclip)active.push('👻');
    if(cheats.superSpeed)active.push('💨');
    if(cheats.superJump)active.push('🦘');
    if(cheats.flyMode)active.push('🕊');
    if(cheats.megaLight)active.push('🔦');
    if(cheats.noFall)active.push('🥾');
    if(active.length){
      ctx.textAlign='left';
      ctx.fillStyle='rgba(8,10,16,.7)';
      roundRect(ctx,10,top+26,Math.min(180,W*0.4),20,10);ctx.fill();
      ctx.fillStyle='#5ee06a';ctx.font='700 11px system-ui,sans-serif';
      ctx.fillText('🔧 '+active.join(' '),18,top+40);
    }
  }
  ctx.restore();
}

function drawDebugOverlay(){
  if(!cheats.showDebug)return;
  ctx.save();
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const W=220,H=210;
  const x=10, y=view.H-H-10;
  ctx.fillStyle='rgba(0,0,0,.78)';
  roundRect(ctx,x,y,W,H,10);ctx.fill();
  ctx.strokeStyle='rgba(94,224,106,.5)';ctx.lineWidth=1;
  roundRect(ctx,x,y,W,H,10);ctx.stroke();
  ctx.fillStyle='#7dffb0';
  ctx.font='700 11px ui-monospace,Menlo,Consolas,monospace';
  ctx.textAlign='left';
  const lines=[
    'FPS: '+Math.round(G.fpsNow),
    'Scene: '+G.scene+(G.paused?' [PAUSED]':''),
    'Pos: '+Math.round(player.x)+','+Math.round(player.y),
    'Depth: '+Math.round(player.y/TILE)+' m',
    'Vel: '+player.vx.toFixed(0)+','+player.vy.toFixed(0),
    'onG: '+(player.onGround?'Y':'N')+' lad: '+(player.onLadder?'Y':'N'),
    'HP: '+Math.ceil(player.hp)+'/'+player.maxHp,
    'Mobs: '+mobs.length+' Chunks: '+chunks.size,
    'Mods: '+tileMods.size,
    'Dug queue: '+dugTiles.size,
    'Regen: '+(settings.regen?'ON':'OFF')+' ×'+settings.regenSpeed.toFixed(2)+' total '+regenTotal,
    'OreDensity: ×'+settings.oreDensity.toFixed(2),
    'Water: ×'+settings.waterAmount.toFixed(2)+' Lava: ×'+settings.lavaAmount.toFixed(2),
    'Money: '+player.money,
    'Inv: '+invCount()+'/'+player.slots,
    'view: '+view.W+'x'+view.H+' sc '+view.scale.toFixed(2)
  ];
  for(let i=0;i<lines.length;i++)ctx.fillText(lines[i],x+10,y+16+i*14);
  ctx.restore();
}

/* круглая кнопка в стиле «латунь и железо»: латунный обод, железная или латунная середина */
function ctrlDisc(x,y,r,pressed,face,ring){
  const c=ctx;
  c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.arc(x,y+3,r,0,TAU);c.fill();
  const rg=c.createLinearGradient(x,y-r,x,y+r);
  rg.addColorStop(0,ring==='red'?'#ff9a8a':ring==='green'?'#a8f0b0':'#f7d088');rg.addColorStop(1,ring==='red'?'#8a2a20':ring==='green'?'#2a6a38':'#7a4c16');
  c.fillStyle=rg;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();
  const ir=r*0.86,fg=c.createRadialGradient(x-ir*0.3,y-ir*0.4,ir*0.1,x,y,ir);
  if(face==='brass'){fg.addColorStop(0,pressed?'#fff0c0':'#ffe2a0');fg.addColorStop(0.6,pressed?'#f3b450':'#e4a443');fg.addColorStop(1,'#a8661e');}
  else{fg.addColorStop(0,pressed?'#5a5047':'#463e36');fg.addColorStop(1,pressed?'#2a241f':'#1c1815');}
  c.fillStyle=fg;c.beginPath();c.arc(x,y,ir,0,TAU);c.fill();
  c.strokeStyle='rgba(255,240,210,'+(pressed?0.5:0.22)+')';c.lineWidth=1.2;c.beginPath();c.arc(x,y,ir-1,Math.PI*1.1,Math.PI*1.9);c.stroke();
}
function ctrlCount(x,y,r,n,ok){
  ctx.font='700 '+Math.max(10,Math.floor(r*0.3))+'px '+HUDF;ctx.textAlign='center';ctx.textBaseline='middle';
  const t=String(n),w=Math.max(r*0.62,ctx.measureText(t).width+10),h=Math.max(13,r*0.36);
  ctx.fillStyle='rgba(16,12,9,.92)';roundRect(ctx,x-w/2,y+r*0.62-h/2,w,h,h/2);ctx.fill();
  ctx.fillStyle=ok?'#ffe2a6':'#ff8a7a';ctx.fillText(t,x,y+r*0.62+0.5);
}
function drawTouchControls(){
  if(G.scene!=='lobby'&&G.scene!=='mine')return;
  const W=view.W,H=view.H;
  ctx.save();

  const j=Input.joy;
  const jb=getBtnRect('joy');
  const joyAlpha=settings.controls.joy.a;
  const jR=jb.r;
  ctx.globalAlpha=joyAlpha;
  ctx.beginPath();ctx.arc(jb.x,jb.y,jR,0,TAU);
  const bg=ctx.createRadialGradient(jb.x,jb.y,jR*0.15,jb.x,jb.y,jR);
  bg.addColorStop(0,'rgba(34,28,23,.6)');bg.addColorStop(1,'rgba(18,14,11,.55)');
  ctx.fillStyle=bg;ctx.fill();
  ctx.lineWidth=3;ctx.strokeStyle='rgba(228,164,67,'+(j.active?0.85:0.45)+')';ctx.stroke();
  ctx.fillStyle='rgba(240,200,130,'+(j.active?0.7:0.4)+')';
  for(let i=0;i<4;i++){const a=i*Math.PI/2,px=jb.x+Math.cos(a)*jR*0.8,py=jb.y+Math.sin(a)*jR*0.8;
    ctx.save();ctx.translate(px,py);ctx.rotate(a);ctx.beginPath();ctx.moveTo(jR*0.09,0);ctx.lineTo(-jR*0.05,-jR*0.08);ctx.lineTo(-jR*0.05,jR*0.08);ctx.closePath();ctx.fill();ctx.restore();}
  const kx=j.active?j.kx:jb.x, ky=j.active?j.ky:jb.y;
  const stickR=jR*0.42;
  ctrlDisc(kx,ky,stickR,j.active,j.active?'brass':'iron');

  const b=getBtnRect('jump');
  const pressed=Input.jumpPtr!==null;
  const off=pressed?4:0;
  ctx.globalAlpha=b.a;
  ctrlDisc(b.x,b.y+off,b.r,pressed,'brass');
  {const s2=b.r*0.36,y0=b.y+off;ctx.fillStyle='#3a2208';ctx.beginPath();
    ctx.moveTo(b.x,y0-s2*1.25);ctx.lineTo(b.x+s2*1.05,y0-s2*0.1);ctx.lineTo(b.x+s2*0.38,y0-s2*0.1);ctx.lineTo(b.x+s2*0.38,y0+s2*1.05);
    ctx.lineTo(b.x-s2*0.38,y0+s2*1.05);ctx.lineTo(b.x-s2*0.38,y0-s2*0.1);ctx.lineTo(b.x-s2*1.05,y0-s2*0.1);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(255,240,200,.35)';ctx.fillRect(b.x-s2*0.3,y0+s2*0.1,s2*0.12,s2*0.8);}
  ctx.textBaseline='alphabetic';

  {
    const inMine=G.scene==='mine';
    const pb=getBtnRect('place');
    const pp=Input.placePtr!==null;
    const po=pp?3:0;
    ctx.globalAlpha=pb.a*((inMine||G.placeItem==='crate'||G.placeItem==='sorter')?1:0.4);
    ctrlDisc(pb.x,pb.y+po,pb.r,pp,'iron');ctx.fillStyle='#f3e6cf';ctx.strokeStyle='#f3e6cf';
    ctx.textAlign='center';ctx.textBaseline='middle';
    validateSelection();
    if(G.placeItem==='sorter'){
      {const u=pb.r*0.3,y0=pb.y+po-u*0.3;ctx.fillStyle='#9fe8ff';roundRect(ctx,pb.x-u*1.2,y0-u,u*2.4,u*1.8,u*0.4);ctx.fill();
        ctx.fillStyle='#1c1815';ctx.beginPath();ctx.arc(pb.x-u*0.5,y0-u*0.1,u*0.28,0,TAU);ctx.arc(pb.x+u*0.5,y0-u*0.1,u*0.28,0,TAU);ctx.fill();
        ctx.strokeStyle='#9fe8ff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(pb.x,y0-u);ctx.lineTo(pb.x,y0-u*1.6);ctx.stroke();}
    }else if(G.placeItem==='crate'){
      const cs=pb.r*0.5;ctx.fillStyle='#fff';ctx.fillRect(pb.x-cs,pb.y+po-cs*1.05,cs*2,cs*1.6);
      ctx.fillStyle='#8a5c34';ctx.fillRect(pb.x-cs+2.5,pb.y+po-cs*1.05+2.5,cs*2-5,cs*1.6-5);
      ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(pb.x-cs+3,pb.y+po-cs*0.25);ctx.lineTo(pb.x+cs-3,pb.y+po-cs*0.25);ctx.stroke();
      ctrlCount(pb.x,pb.y+po,pb.r,packedCrates().length,true);
    }else if(G.placeItem==='barricade'){
      const bs=pb.r*0.42,bx0=pb.x-bs,by0=pb.y+po-bs*0.95;
      ctx.fillStyle='#fff';
      for(let r=0;r<3;r++){const off=(r%2)?bs*0.5:0;for(let k=0;k<3;k++){const xx=bx0+off+k*bs*0.72-(r%2?bs*0.36:0);if(xx<bx0-1||xx+bs*0.62>bx0+bs*2+1)continue;ctx.fillRect(xx,by0+r*bs*0.62,bs*0.62,bs*0.5);}}
      ctrlCount(pb.x,pb.y+po,pb.r,player.barricades,player.barricades>0);
    }else if(G.placeItem==='drill'){
      ctx.save();
      ctx.translate(pb.x,pb.y+po);
      ctx.rotate(-0.6);
      ctx.fillStyle='#fff';
      ctx.beginPath();ctx.moveTo(pb.r*0.5,0);ctx.lineTo(-pb.r*0.3,-pb.r*0.4);ctx.lineTo(-pb.r*0.3,pb.r*0.4);ctx.closePath();ctx.fill();
      ctx.fillRect(-pb.r*0.55,-pb.r*0.2,pb.r*0.25,pb.r*0.4);
      ctx.restore();
      ctrlCount(pb.x,pb.y+po,pb.r,player.drills,player.drills>0);
    }else{
      ctx.strokeStyle='#f3e6cf';ctx.lineWidth=2.4;ctx.lineCap='round';
      const ls=pb.r*0.42,lo=-pb.r*0.12;
      ctx.beginPath();
      ctx.moveTo(pb.x-ls*0.8,pb.y+po+lo-ls);ctx.lineTo(pb.x-ls*0.8,pb.y+po+lo+ls);
      ctx.moveTo(pb.x+ls*0.8,pb.y+po+lo-ls);ctx.lineTo(pb.x+ls*0.8,pb.y+po+lo+ls);
      for(let k=-1;k<=1;k++){
        ctx.moveTo(pb.x-ls*0.8,pb.y+po+lo+k*(ls*0.62));
        ctx.lineTo(pb.x+ls*0.8,pb.y+po+lo+k*(ls*0.62));
      }
      ctx.stroke();ctx.lineCap='butt';
      ctrlCount(pb.x,pb.y+po,pb.r,player.ladders,player.ladders>0);
    }
    ctx.textBaseline='alphabetic';

    const shItem=G.shootItem;
    const shList=getShootItems();
    const shCur=shList.find(x=>x.id===shItem);
    const sb=getBtnRect('shoot');
    const sp=Input.shootPtr!==null;
    const so=sp?3:0;
    ctx.globalAlpha=sb.a*((inMine&&shCur)?1:0.4);
    const medk=(shItem==='medkit'),gunk=(shItem==='gun');
    ctrlDisc(sb.x,sb.y+so,sb.r,sp,'iron',medk?'green':gunk?'red':null);
    ctx.strokeStyle='#f3e6cf';ctx.fillStyle=medk?'#a8f0b0':'#f3e6cf';ctx.lineWidth=2.4;ctx.lineCap='round';
    const gs=sb.r*0.36;
    if(medk){
      ctx.fillRect(sb.x-gs*0.28,sb.y+so-gs*1.0,gs*0.56,gs*2.0);
      ctx.fillRect(sb.x-gs*1.0,sb.y+so-gs*0.28,gs*2.0,gs*0.56);
      bfCdPie(sb.x,sb.y+so,sb.r);
    }else if(gunk){
      ctx.beginPath();
      ctx.rect(sb.x-gs*1.1,sb.y+so-gs*0.55,gs*1.9,gs*0.55);ctx.fill();
      ctx.fillRect(sb.x-gs*0.8,sb.y+so-gs*0.1,gs*0.5,gs*0.95);
      ctx.fillRect(sb.x+gs*0.8,sb.y+so-gs*0.4,gs*0.5,gs*0.25);
    }else{
      ctx.beginPath();
      ctx.moveTo(sb.x,sb.y+so-gs*1.4);ctx.lineTo(sb.x,sb.y+so+gs*0.3);
      ctx.moveTo(sb.x-gs,sb.y+so-gs*0.8);ctx.lineTo(sb.x+gs,sb.y+so-gs*0.8);
      ctx.moveTo(sb.x-gs,sb.y+so-gs*0.8);ctx.lineTo(sb.x-gs*1.25,sb.y+so-gs*0.2);
      ctx.moveTo(sb.x+gs,sb.y+so-gs*0.8);ctx.lineTo(sb.x+gs*1.25,sb.y+so-gs*0.2);
      ctx.moveTo(sb.x-gs*0.55,sb.y+so+gs*0.3);ctx.lineTo(sb.x+gs*0.55,sb.y+so+gs*0.3);
      ctx.stroke();
    }
    ctx.lineCap='butt';
    ctrlCount(sb.x,sb.y+so,sb.r,shCur?shCur.count:'—',!!(shCur&&shCur.count>0));
    ctx.textBaseline='alphabetic';

    const ib=getBtnRect('items');
    const ip=Input.itemsPtr!==null;
    const io=ip?3:0;
    ctx.globalAlpha=ib.a*(inMine?1:0.5);
    ctrlDisc(ib.x,ib.y+io,ib.r,ip,'iron');
    {const u=ib.r*0.34,x0=ib.x,y0=ib.y+io+u*0.15;   /* рюкзак */
      ctx.strokeStyle='#f3e6cf';ctx.lineWidth=2;ctx.beginPath();ctx.arc(x0,y0-u*0.85,u*0.45,Math.PI,0);ctx.stroke();
      ctx.fillStyle='#e4a443';roundRect(ctx,x0-u*0.95,y0-u*0.85,u*1.9,u*1.85,u*0.45);ctx.fill();
      ctx.fillStyle='#8a5a1c';roundRect(ctx,x0-u*0.6,y0+u*0.05,u*1.2,u*0.7,u*0.2);ctx.fill();
      ctx.fillStyle='#f3e6cf';ctx.fillRect(x0-u*0.12,y0-u*0.05,u*0.24,u*0.22);}
    ctx.textBaseline='alphabetic';
  }
  ctx.globalAlpha=1;
  if(G.scene==='mine'&&grapple&&grapple.state==='anchored'){
    ctx.textAlign='center';ctx.fillStyle='rgba(155,232,255,.92)';
    ctx.font='800 12px system-ui,sans-serif';
    ctx.fillText('На крюке: ← → качаться · ↑ ↓ верёвка · «прыжок» — слезть',view.W/2,view.H-58);
  }

  if(G.scene==='mine'&&!Input.digActive){
    if(playerInExitRoom()){
      ctx.textAlign='center';
      ctx.fillStyle='rgba(255,217,138,.85)';
      ctx.font='800 13px system-ui,sans-serif';
      ctx.fillText('▸ тапни здесь, чтобы выйти ◂',W/2,H-40);
    }else if(((player.stats&&player.stats.blocks)||0)<40&&!hbFight()){
      /* подсказка только для новичка, потом исчезает и не перекрывает кнопки */
      ctx.textAlign='center';const a=0.55*clamp(1-((player.stats&&player.stats.blocks)||0)/40,0,1);
      ctx.font='600 11px '+HUDF;const L1='тапни — копать и прицелиться',L2='«Ставить» / «Стрелять» — использовать предмет';
      const tw=Math.max(ctx.measureText(L1).width,ctx.measureText(L2).width)+20,hy=H*0.3;
      ctx.fillStyle='rgba(18,14,11,'+(a*1.3)+')';roundRect(ctx,W/2-tw/2,hy-15,tw,36,7);ctx.fill();
      ctx.fillStyle='rgba(255,217,138,'+a+')';ctx.fillText(L1,W/2,hy);ctx.fillText(L2,W/2,hy+14);
    }
  }
  ctx.restore();
}
