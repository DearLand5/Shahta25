'use strict';
/* ============================================================
   БЫСТРЫЕ СЛОТЫ, КОЛЕСО ВЫБОРА ИЗ РЮКЗАКА И МЕНЮ ПРЕДМЕТОВ
   слоты — G.qslots: 4 кода вида 'p:hbomb' (для «Ставить») или 's:medkit' (для «Стрелять»)
   ============================================================ */
const QS_N=4;
/* чем заполнить слоты старого сейва: первые 4 предмета из этого списка, что есть у игрока */
const QS_AUTO=['s:medkit','p:barricade','p:hbomb','p:icegren','s:ice','s:scroll','p:drill','s:beacon'];
/* разделы меню */
const IT_CATS=[['all','Все'],['build','Стройка'],['fight','Бой'],['use','Расходники']];
const IT_CAT_OF={ladder:'build',barricade:'build',crate:'build',drill:'build',sorter:'build',grapple:'build',
  hbomb:'fight',icegren:'fight',gun:'fight',medkit:'use',ice:'use',beacon:'use',scroll:'use'};

function qsLoad(a){
  if(!Array.isArray(a))return null;                 /* null — заполнить при первом обращении */
  const r=[];
  for(let i=0;i<QS_N;i++){const v=a[i];r.push(typeof v==='string'&&/^[ps]:[a-z]+$/.test(v)&&r.indexOf(v)<0?v:'');}
  return r;
}
function qsList(){
  if(!Array.isArray(G.qslots)||G.qslots.length!==QS_N){
    const r=[];
    for(const k of QS_AUTO){if(r.length>=QS_N)break;const m=qsMeta(k);if(m&&m.n>0)r.push(k);}
    while(r.length<QS_N)r.push('');
    G.qslots=r;
  }
  return G.qslots;
}
/* значок, имя и количество предмета по коду — даже если он закончился */
function qsMeta(code){
  if(!code)return null;
  const c=code[0],id=code.slice(2),h=player.hitems||{};
  let n=0,icon='❔',name=id;
  switch(id){
    case 'ladder':n=player.ladders;icon='🪜';name='Лестница';break;
    case 'barricade':n=player.barricadeBought?player.barricades:0;icon='🧱';name='Баррикада';break;
    case 'hbomb':n=h.hbombs||0;icon='💣';name='Адская бомба';break;
    case 'icegren':n=h.icegren||0;icon='❄️';name='Ледяная граната';break;
    case 'crate':n=packedCrates().length;icon='📦';name='Ящик';break;
    case 'drill':n=player.drillBought?player.drills:0;icon='🛠️';name='Бур';break;
    case 'sorter':n=botUnits().filter(u=>!u.placed).length;icon='🤖';name='Робот-кладовщик';break;
    case 'grapple':n=player.grappleUnlocked?player.grappleAmmo:0;icon='🪝';name='Пушка-крюк';break;
    case 'medkit':n=medkitAvail();icon='🧪';name='Аптечка';break;
    case 'beacon':n=h.beacons||0;icon='📡';name='Рудный маяк';break;
    case 'scroll':n=h.scrolls||0;icon='📜';name='Свиток возврата';break;
    case 'ice':n=player.icePotions||0;icon='🧊';name='Ледяное зелье';break;
    case 'gun':{const g=curGun();n=g?player.gunAmmo:0;icon=g?g.icon:'🔫';name=g?g.name:'Огнестрел';break;}
    default:return null;
  }
  return {c,id,n:Math.max(0,n|0),icon,name};
}
/* все купленные предметы одним списком: {k,c,id,icon,name,count,desc} */
function itAll(){
  return getPlaceItems().map(it=>Object.assign({k:'p:'+it.id,c:'p'},it))
    .concat(getShootItems().map(it=>Object.assign({k:'s:'+it.id,c:'s'},it)));
}
function qsShown(){
  return G.scene==='mine'&&!hudHidden()&&(qsList().some(Boolean)||itAll().length>=3);
}
function qsRects(){
  const b=getBtnRect('qbar'),r=b.r,land=view.W>view.H*1.15,st=2*r+10,out=[];
  for(let i=0;i<QS_N;i++){
    const x=land?b.x+i*st:b.x,y=land?b.y:b.y+i*st;
    out.push({x:clamp(x,r+4,view.W-r-4),y:clamp(y,r+4,view.H-r-4),r,a:b.a});
  }
  return out;
}
function qsHit(x,y){
  if(!qsShown())return -1;
  const R=qsRects();
  for(let i=0;i<R.length;i++)if(Math.hypot(x-R[i].x,y-R[i].y)<=R[i].r*1.18)return i;
  return -1;
}
/* тап по слоту: расходники и броски срабатывают сразу, не трогая кнопки;
   огнестрел встаёт на «Стрелять» (его держат зажатым) */
function qsUse(i){
  if(G.scene!=='mine'||G.bossCut||hudHidden())return;
  const code=qsList()[i];
  if(!code){SFX.ui();UI.items('items');UI.toast('Выбери предмет и нажми номер слота');return;}
  const m=qsMeta(code);
  if(!m)return;
  if(m.n<=0){floatText(player.x,player.y-64,'Нет: '+m.name,'#ff8a8a');SFX.uiBack();return;}
  if(!G.qsFlash)G.qsFlash=[0,0,0,0];
  G.qsFlash[i]=1;
  if(code==='s:gun'){
    if(G.shootItem!=='gun'){G.shootItem='gun';floatText(player.x,player.y-70,m.name+' → «Стрелять»','#ffd98a');SFX.ui();}
    return;
  }
  if(m.c==='s'){const prev=G.shootItem;G.shootItem=m.id;useShoot(false);if(G.shootItem===m.id&&prev)G.shootItem=prev;}
  else{const prev=G.placeItem;G.placeItem=m.id;usePlace();if(G.placeItem===m.id)G.placeItem=prev;}
  validateSelection();
}
/* положить предмет в слот i (из другого слота он переедет) */
function qsSet(i,code){
  const L=qsList();
  for(let j=0;j<QS_N;j++)if(L[j]===code)L[j]='';
  L[i]=code||'';
}

/* ---------- кадр: таймер удержания рюкзака, вспышки слотов ---------- */
function qsTick(dt){
  if(G.qsFlash)for(let i=0;i<QS_N;i++)G.qsFlash[i]=Math.max(0,G.qsFlash[i]-dt*5);
  if(Input.itemsPtr!=null&&!G.wheel){
    const rec=Input.ptrs.get(Input.itemsPtr);
    if(rec&&rec.type==='items'&&performance.now()-rec.t>280)wheelOpen();
  }
  if(G.wheel&&(Input.itemsPtr==null||G.scene!=='mine'||G.bossCut||UI.modal))wheelClose();
}

/* ---------- колесо выбора вокруг рюкзака ---------- */
function wheelOpen(){
  if(G.wheel||G.scene!=='mine'||G.bossCut||hudHidden()||UI.modal)return;
  validateSelection();
  const b=getBtnRect('items');
  const P=getPlaceItems().filter(it=>it.id!=='sorter'),S=getShootItems();
  if(P.length+S.length<2)return;
  const rw=Math.round(23*Math.min(1.5,Math.max(0.8,view.scale||1)));
  const ang=Math.atan2(view.H*0.38-b.y,view.W*0.5-b.x);           /* веер раскрывается к центру экрана */
  const items=[];
  const SPAN=1.85;                                                   /* веер не шире ~105°, иначе заезжает под кнопки */
  let R=b.r+rw+30;
  const ring=(list,c)=>{
    if(!list.length)return;
    let st=(2*rw+9)/R;
    if((list.length-1)*st>SPAN){R=(2*rw+9)*(list.length-1)/SPAN;st=(2*rw+9)/R;}
    const a0=ang-(list.length-1)*st/2;
    list.forEach((it,i)=>{
      const a=a0+i*st;
      items.push({k:c+':'+it.id,c,id:it.id,icon:it.icon,name:it.name,count:it.count,
        x:clamp(b.x+Math.cos(a)*R,rw+6,view.W-rw-6),y:clamp(b.y+Math.sin(a)*R,rw+6,view.H-rw-6),r:rw});
    });
    R+=2*rw+16;
  };
  ring(P,'p');ring(S,'s');
  G.wheel={items,hover:-1,cx:b.x,cy:b.y,br:b.r,t0:performance.now()};
  SFX.open();vib(14);
}
function wheelClose(){G.wheel=null;}
function wheelMove(rec,x,y){
  if(!G.wheel){
    if(G.scene==='mine'&&Math.hypot(x-rec.x,y-rec.y)>18)wheelOpen();
    if(!G.wheel)return;
  }
  const W=G.wheel;let best=-1,bd=1e9;
  W.items.forEach((it,i)=>{const d=Math.hypot(x-it.x,y-it.y);if(d<it.r*1.7&&d<bd){bd=d;best=i;}});
  if(Math.hypot(x-W.cx,y-W.cy)<W.br)best=-1;                         /* палец вернулся на рюкзак — отмена */
  if(best!==W.hover){W.hover=best;if(best>=0){SFX.ui();vib(6);}}
}
function wheelRelease(rec,cancel){
  const W=G.wheel;
  if(!W){if(!cancel)UI.items();return;}                              /* короткий тап — меню */
  const it=W.hover>=0?W.items[W.hover]:null;
  wheelClose();
  if(!it||cancel)return;
  if(it.c==='p')G.placeItem=it.id;else G.shootItem=it.id;
  validateSelection();
  floatText(player.x,player.y-70,it.name+' → «'+(it.c==='p'?'Ставить':'Стрелять')+'»','#ffd98a');
  SFX.place();vib(14);
}

/* ---------- отрисовка ---------- */
function qsIcon(x,y,r,icon,alpha){
  ctx.save();ctx.globalAlpha*=alpha;
  ctx.font=Math.round(r*0.92)+'px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fff';
  ctx.fillText(icon,x,y-r*0.08);
  ctx.restore();
}
function qsBadge(x,y,t,col){
  ctx.fillStyle='rgba(16,12,9,.92)';ctx.beginPath();ctx.arc(x,y,7.5,0,TAU);ctx.fill();
  ctx.strokeStyle=col||'rgba(228,164,67,.7)';ctx.lineWidth=1.2;ctx.stroke();
  ctx.fillStyle=col||'#f7cb73';ctx.font='700 9.5px '+HUDF;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t,x,y+0.5);
}
function drawQuickBar(){
  if(!qsShown()||G.wheel)return;
  const R=qsRects(),L=qsList(),low=player.hp<player.maxHp*0.35;
  ctx.save();
  for(let i=0;i<QS_N;i++){
    const s=R[i],m=qsMeta(L[i]),fl=G.qsFlash?G.qsFlash[i]:0;
    ctx.globalAlpha=s.a;
    if(!m){                                                          /* пустой слот */
      ctx.globalAlpha=s.a*0.6;
      ctx.fillStyle='rgba(16,12,9,.5)';ctx.beginPath();ctx.arc(s.x,s.y,s.r*0.9,0,TAU);ctx.fill();
      ctx.setLineDash([4,4]);ctx.strokeStyle='rgba(228,164,67,.6)';ctx.lineWidth=1.5;ctx.stroke();ctx.setLineDash([]);
      ctx.strokeStyle='rgba(247,203,115,.75)';ctx.lineWidth=2;ctx.beginPath();
      ctx.moveTo(s.x-s.r*0.3,s.y);ctx.lineTo(s.x+s.r*0.3,s.y);ctx.moveTo(s.x,s.y-s.r*0.3);ctx.lineTo(s.x,s.y+s.r*0.3);ctx.stroke();
      qsBadge(s.x-s.r*0.74,s.y-s.r*0.74,String(i+1));
      continue;
    }
    const ok=m.n>0,warn=m.id==='medkit'&&low&&ok;
    const on=(m.c==='p'&&G.placeItem===m.id)||(m.c==='s'&&G.shootItem===m.id);
    if(warn){                                                        /* мало здоровья — аптечка мигает */
      const p=0.5+0.5*Math.sin(G.time*9);
      ctx.fillStyle='rgba(255,70,50,'+(0.25+0.3*p)+')';ctx.beginPath();ctx.arc(s.x,s.y,s.r*(1.22+0.12*p),0,TAU);ctx.fill();
    }
    ctrlDisc(s.x,s.y+(fl>0.4?2:0),s.r,fl>0.05,'iron',warn?'red':on?'green':undefined);
    qsIcon(s.x,s.y+(fl>0.4?2:0),s.r,m.icon,ok?1:0.35);
    if(m.id==='medkit')bfCdPie(s.x,s.y,s.r);
    ctrlCount(s.x,s.y+1,s.r,m.n,ok);
    qsBadge(s.x-s.r*0.74,s.y-s.r*0.74,String(i+1));
    if(fl>0){ctx.globalAlpha=s.a*fl;ctx.strokeStyle='#fff0c0';ctx.lineWidth=3;ctx.beginPath();ctx.arc(s.x,s.y,s.r*(1+0.4*(1-fl)),0,TAU);ctx.stroke();}
  }
  ctx.restore();
}
function drawWheel(){
  const W=G.wheel;if(!W)return;
  const k=clamp((performance.now()-W.t0)/160,0,1),e=1-Math.pow(1-k,3);
  ctx.save();
  /* затемнение экрана, светлее у рюкзака */
  const g=ctx.createRadialGradient(W.cx,W.cy,W.br,W.cx,W.cy,Math.max(view.W,view.H));
  g.addColorStop(0,'rgba(8,6,4,'+(0.35*e)+')');g.addColorStop(1,'rgba(8,6,4,'+(0.72*e)+')');
  ctx.fillStyle=g;ctx.fillRect(0,0,view.W,view.H);
  /* центр — рюкзак, отпустить на нём = отмена */
  ctrlDisc(W.cx,W.cy,W.br,false,'iron');
  ctx.strokeStyle=W.hover<0?'#f7cb73':'rgba(247,203,115,.45)';ctx.lineWidth=3;ctx.lineCap='round';
  {const q=W.br*0.26;ctx.beginPath();ctx.moveTo(W.cx-q,W.cy-q);ctx.lineTo(W.cx+q,W.cy+q);ctx.moveTo(W.cx+q,W.cy-q);ctx.lineTo(W.cx-q,W.cy+q);ctx.stroke();}
  ctx.lineCap='butt';
  const hv=W.hover>=0?W.items[W.hover]:null;
  if(hv){ctx.setLineDash([6,5]);ctx.strokeStyle='rgba(247,203,115,.8)';ctx.lineWidth=2;
    ctx.beginPath();ctx.moveTo(W.cx,W.cy);ctx.lineTo(hv.x,hv.y);ctx.stroke();ctx.setLineDash([]);}
  /* предметы */
  W.items.forEach((it,i)=>{
    const h=i===W.hover,x=W.cx+(it.x-W.cx)*e,y=W.cy+(it.y-W.cy)*e,r=it.r*(h?1.18:1);
    const cur=(it.c==='p'&&G.placeItem===it.id)||(it.c==='s'&&G.shootItem===it.id);
    ctx.globalAlpha=e;
    if(h){ctx.fillStyle='rgba(255,210,120,.28)';ctx.beginPath();ctx.arc(x,y,r*1.3,0,TAU);ctx.fill();}
    ctrlDisc(x,y,r,h,h?'brass':'iron',it.c==='s'?'red':undefined);
    qsIcon(x,y,r,it.icon,it.count>0?1:0.4);
    ctrlCount(x,y+1,r,it.count,it.count>0);
    if(cur)qsBadge(x+r*0.74,y-r*0.74,'✓','#a8f0b0');
  });
  /* подсказка над выбранным */
  {const txt=hv?hv.name+' ×'+hv.count+' → «'+(hv.c==='p'?'Ставить':'Стрелять')+'»':'Внутри — «Ставить», снаружи — «Стрелять»';
    ctx.globalAlpha=e;ctx.font='700 12.5px '+HUDF;
    const tw=Math.min(view.W-20,ctx.measureText(txt).width+24);
    let ty=Math.min(...W.items.map(it=>it.y))-W.items[0].r-30;
    ty=Math.max(ty,HUDL&&HUDL.rb?HUDL.rb+20:70);
    const tx=clamp(hv?hv.x:view.W/2,tw/2+10,view.W-tw/2-10);
    ctx.fillStyle='rgba(20,15,11,.94)';roundRect(ctx,tx-tw/2,ty-14,tw,28,14);ctx.fill();
    ctx.strokeStyle='rgba(228,164,67,.7)';ctx.lineWidth=1.2;ctx.stroke();
    ctx.fillStyle=hv?'#ffe2a6':'#d8cbb6';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(txt,tx,ty+0.5);}
  ctx.restore();
}

/* ---------- меню предметов: лист снизу с плитками ---------- */
function itemsMenu(tab){
  tab=tab||UI._itTab||'items';UI._itTab=tab;
  if(tab==='res'){UI.resources();return;}
  validateSelection();
  const fresh=UI.modal!=='items';
  const cat=UI._itCat||'all';
  const all=itAll(),L=qsList();
  const shown=all.filter(it=>cat==='all'||IT_CAT_OF[it.id]===cat);
  const tags=(it)=>{let t='';
    if(it.c==='p'&&G.placeItem===it.id)t+='<i class="b">Ставить</i>';
    if(it.c==='s'&&G.shootItem===it.id)t+='<i class="r">Стрелять</i>';
    const si=L.indexOf(it.k);if(si>=0)t+='<i class="q">'+(si+1)+'</i>';
    return t;};
  const tile=(it)=>`<div class="itTile${tags(it)?' on':''}${it.count>0?'':' zero'}" data-k="${it.k}">
      <span class="itN">${fmt(it.count)}</span><span class="itIc">${it.icon}</span>
      <span class="itNm">${escHtml(it.name)}</span><span class="itTags">${tags(it)}</span></div>`;
  const bindCell=(c,title)=>{const id=c==='p'?G.placeItem:G.shootItem,m=qsMeta(id?c+':'+id:'');
    return `<div class="itBind ${c==='s'?'red':''}" data-bk="${m?c+':'+id:''}"><span class="lb">${title}</span>
      <span class="itDisc">${m?m.icon:'—'}${m?'<b>'+fmt(m.n)+'</b>':''}</span></div>`;};
  const slotCell=(i)=>{const m=qsMeta(L[i]);
    return `<div class="itQ${m?'':' empty'}${m&&m.n<=0?' zero':''}" data-qs="${i}"><i>${i+1}</i>${m?m.icon:'+'}${m?'<b>'+fmt(m.n)+'</b>':''}</div>`;};
  const extra=[
    `Рюкзак: ${invCount()}/${player.slots} видов · стопка до ${stackCap()}`,
    (player.relEq&&player.relEq.length)?'Реликвии: '+player.relEq.map(id=>{const r=RELICS.find(q=>q.id===id);return r?r.ic+' '+r.n:'';}).join(' · '):'',
    Object.keys(player.rit||{}).length?'Ритуалы: '+Object.keys(player.rit).map(id=>{const r=RITUALS.find(q=>q.id===id);return r?r.ic+' '+r.n+' ('+Math.ceil(player.rit[id]/60)+' мин)':'';}).join(' · '):'',
    (()=>{const it=HITEMS.filter(h=>itemLv(h.id)>0);return it.length?'Снаряжение: '+it.map(h=>h.ic+' '+h.n+(h.max>1?' '+itemLv(h.id):'')).join(' · ')+(player.hitems.totems?' · 🗿×'+player.hitems.totems:''):'';})()
  ].filter(Boolean).map(t=>'<p class="tiny">'+t+'</p>').join('');
  const d=UI.build('items',`
    <div class="card itSheet${fresh?' rise':''}">
      <div class="itGrip"><span></span></div>
      <div class="tabs"><button data-ittab="items" class="on">🎒 Предметы</button><button data-ittab="res">⛏ Ресурсы</button></div>
      <div class="itTop">${bindCell('p','Ставить')}${bindCell('s','Стрелять')}
        <div class="itQBox"><span class="lb">Быстрые слоты</span><div class="itQs">${[0,1,2,3].map(slotCell).join('')}</div></div></div>
      <div class="itCats">${IT_CATS.map(([k,n])=>`<button data-cat="${k}" class="${k===cat?'on':''}">${n}</button>`).join('')}</div>
      <div class="itGrid">${shown.length?shown.map(tile).join(''):'<p class="muted" style="grid-column:1/-1;text-align:center;padding:14px 4px">В этом разделе пусто. Предметы продаются в кузнице и Печи.</p>'}</div>
      <p class="tiny itHint">Тап по плитке — куда её поставить. <b>Зажми рюкзак</b> в шахте — колесо выбора, веди палец к предмету.</p>
      ${extra}
      <button class="btn" id="itClose">Закрыть</button>
    </div>`);
  d.classList.add('sheetPanel');
  const card=d.querySelector('.itSheet');
  d.onclick=(e)=>{if(e.target===d){SFX.uiBack();UI.clear();}};
  d.querySelectorAll('[data-ittab]').forEach(b=>b.onclick=()=>{SFX.ui();UI.items(b.getAttribute('data-ittab'));});
  d.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{SFX.ui();UI._itCat=b.getAttribute('data-cat');itemsMenu('items');});
  d.querySelector('#itClose').onclick=()=>{SFX.uiBack();UI.clear();};
  d.querySelectorAll('.itTile').forEach(el=>el.onclick=(e)=>{e.stopPropagation();SFX.ui();itPop(card,el,el.getAttribute('data-k'));});
  d.querySelectorAll('[data-bk]').forEach(el=>el.onclick=(e)=>{e.stopPropagation();const k=el.getAttribute('data-bk');if(k){SFX.ui();itPop(card,el,k);}});
  d.querySelectorAll('[data-qs]').forEach(el=>el.onclick=(e)=>{e.stopPropagation();const i=+el.getAttribute('data-qs'),k=L[i];
    if(k){SFX.ui();itPop(card,el,k);}else UI.toast('Тапни по предмету ниже и выбери слот '+(i+1));});
  card.onclick=(e)=>{if(!e.target.closest('.itPop'))itPopClose(card);};
  /* смахнуть лист вниз — закрыть */
  const grip=card.querySelector('.itGrip');let sy=null,dy=0;
  const down=(e)=>{sy=e.clientY;dy=0;card.style.transition='none';try{grip.setPointerCapture(e.pointerId);}catch(_){}};
  const move=(e)=>{if(sy==null)return;dy=Math.max(0,e.clientY-sy);card.style.transform='translateY('+dy+'px)';};
  const up=()=>{if(sy==null)return;sy=null;card.style.transition='';
    if(dy>70){SFX.uiBack();UI.clear();}else card.style.transform='';};
  grip.addEventListener('pointerdown',down);grip.addEventListener('pointermove',move);
  grip.addEventListener('pointerup',up);grip.addEventListener('pointercancel',up);
}
function itPopClose(card){const p=card.querySelector('.itPop');if(p)p.remove();}
/* всплывающее окошко у плитки: на кнопку, в слот, описание */
function itPop(card,anchor,k){
  itPopClose(card);
  const it=itAll().find(q=>q.k===k),m=qsMeta(k);
  if(!m)return;
  const L=qsList(),si=L.indexOf(k),c=m.c,id=m.id;
  const cur=(c==='p'&&G.placeItem===id)||(c==='s'&&G.shootItem===id);
  const pop=document.createElement('div');
  pop.className='itPop';
  pop.innerHTML=`<div class="itPopHd"><span class="itIc">${m.icon}</span><div><b>${escHtml(it?it.name:m.name)}</b><span>×${fmt(m.n)}</span></div></div>
    ${it?'<p class="itPopDs">'+it.desc+'</p>':'<p class="itPopDs">Закончился — купи ещё.</p>'}
    ${it?`<button class="itAct${cur?' on':''}" data-act="bind">${cur?'✓ ':''}На кнопку «${c==='p'?'Ставить':'Стрелять'}»</button>`:''}
    ${id!=='sorter'&&id!=='crate'?`<div class="itActLb">Быстрый слот — тап сразу применяет</div>
    <div class="itSlots">${[0,1,2,3].map(i=>{const q=qsMeta(L[i]);return `<button data-slot="${i}" class="${i===si?'on':''}"><i>${i+1}</i>${q?q.icon:''}</button>`;}).join('')}</div>`:''}
    ${si>=0?`<button class="itAct alt" data-act="unslot">Убрать из слота ${si+1}</button>`:''}`;
  card.appendChild(pop);
  /* ставим под плиткой, если не влезает — над ней */
  const cr=card.getBoundingClientRect(),ar=anchor.getBoundingClientRect();
  const pw=Math.min(card.clientWidth-16,260);pop.style.width=pw+'px';
  let left=ar.left-cr.left+ar.width/2-pw/2;left=clamp(left,8,card.clientWidth-pw-8);
  let top=ar.bottom-cr.top+6;
  const ph=pop.offsetHeight;
  if(ar.bottom+6+ph>window.innerHeight-8&&ar.top-cr.top-ph-6>0)top=ar.top-cr.top-ph-6;
  pop.style.left=left+'px';pop.style.top=top+'px';
  pop.onclick=(e)=>e.stopPropagation();
  const b=pop.querySelector('[data-act="bind"]');
  if(b)b.onclick=()=>{if(c==='p')G.placeItem=id;else G.shootItem=id;SFX.place();saveGame();itemsMenu('items');};
  pop.querySelectorAll('[data-slot]').forEach(el=>el.onclick=()=>{const i=+el.getAttribute('data-slot');
    if(L[i]===k)L[i]='';else qsSet(i,k);SFX.place();saveGame();itemsMenu('items');});
  const u=pop.querySelector('[data-act="unslot"]');
  if(u)u.onclick=()=>{L[si]='';SFX.uiBack();saveGame();itemsMenu('items');};
}
