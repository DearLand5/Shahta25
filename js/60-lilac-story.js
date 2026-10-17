'use strict';
/* ============================================================
   ЛИЛОВЫЕ НЕБЕСА — ИСТОРИЯ МИРА (этап 10)
   катсцена прибытия (G.cut.lil, рисует renderLilacCut), дневник Первого шахтёра (14 страниц,
   player.prog.ldiary), Книга деревни `UI.lbook` (дневник, записки жителей, истории хозяйки),
   подсказки при первом знакомстве `lstHint` (player.prog.lhint) и знакомство с биомами.
   ============================================================ */

/* ---------- дневник Первого шахтёра: по две страницы на биом ----------
   первая — в первом сундуке биома, вторая — с первого моба, побеждённого в Истине */
const LST_PAGES=[
  [10,'День первый','Врата выплюнули меня на луг. Трава мягкая, как одеяло, небо розовое, и солнце совсем не греет. Жители машут мне из окон. Я помахал в ответ. Только потом понял: они машут, не останавливаясь. Уже час.'],
  [10,'Улыбки','Здесь все улыбаются. Пекарша, фонарщик, дети на качелях. Я долго не мог понять, что не так, а потом заметил: никто не моргает. Ни разу. Я тоже стараюсь не моргать, чтобы не обидеть.'],
  [11,'Хрустальный сад','Статуи-садовницы стоят у клумб. Утром они поливали розы, вечером — уже другие клумбы. Я пометил одну мелом. Наутро метка была у меня на рукаве.'],
  [11,'Звон','Когда Рассудок тает, хрусталь начинает звенеть словами. Сначала это просто звон. Потом — моё имя. Потом — имена тех, кого я оставил на Земле надежды. Я заткнул уши воском. Не помогло: звенит изнутри.'],
  [12,'Медовые соты','Пчёлы носят не мёд. Я попробовал — это сон. Сладкий, тягучий, чужой. Мне приснился дом, которого у меня никогда не было, и мама, которую я не помню. Я съел ещё ложку. Нельзя так.'],
  [12,'Лицо в соте','В запечатанной соте я нашёл лицо. Спокойное, спящее. Это Анна, пекарша, — та, что машет из окна наверху. Если она здесь, то кто же машет?'],
  [13,'Кукольный городок','Куклы похожи на жителей. Каждая. У фонарщика даже такая же заплатка на локте. Куклы сидят в домиках и ждут. Солдатик сказал мне: «Скоро смена караула». Я не спросил, кого будут менять.'],
  [13,'Моё место','Сегодня у костра в городке сидела кукла в каске. С моей киркой. С моими усами. Она подвинулась, чтобы я сел рядом, и сказала моим голосом: «Ты опоздал. Я уже всё сделал за тебя».'],
  [14,'Розарий','Розы растут из того, что в них упало. Я уронил платок — к утру на кусте распустился цветок в клеточку. Больше я ничего не роняю. Особенно себя.'],
  [14,'Садовник','Безликий садовник поливает кусты чем-то тёмным. Я спросил, кого он кормит. Он ответил: «Тех, кто спит наверху. Им нужно много сил, чтобы улыбаться». У него нет рта, но я его услышал.'],
  [15,'Отражение','В Зеркальных топях моё отражение пошло в другую сторону. Я догнал его у воды. Оно сказало, что настоящий — оно, а я — то, что ему снится. Мы поспорили. Я не уверен, что выиграл.'],
  [15,'Правда о небе','В Истине деревня наверху нарисована на внутренней стороне век. Солнце — это луна с закрытым глазом. Когда наступает ночь, глаз открывается и смотрит, всё ли спит как надо.'],
  [16,'Колыбель','Внизу кто-то спит. Огромный. Я чувствую, как он дышит: стены поднимаются и опускаются. Вся деревня — его сон. Если он проснётся — нас не станет. Если мы уснём — мы станем его снами.'],
  [16,'Последняя страница','Я спускаюсь к Колыбели. Если ты читаешь это — не буди Спящую. Или разбуди. Я уже не знаю, кто из нас настоящий. Оставляю фонарь у входа: пусть горит, пока ты идёшь. — Аким, шахтёр с Земли надежды.']
];
function lstDiary(){const p=player.prog;if(!Array.isArray(p.ldiary))p.ldiary=[];return p.ldiary;}
function lstGivePage(i,x,y,open){
  const D=lstDiary();if(i<0||i>=LST_PAGES.length||D.indexOf(i)>=0)return false;
  D.push(i);SFX.chest();AU.bell(880,1,0.06,0,{ratio:2.01,index:0.6,rev:0.6});
  if(x!=null)floatText(x,y,'📖 Страница дневника!','#ffe6a0');
  saveGame();
  if(open)setTimeout(()=>{if(!UI.modal)UI.lpage(i);},350);
  else UI.toast('📖 Найдена страница дневника — читай в Книге деревни');
  lstHint('diary');
  return true;
}
/* первый сундук биома */
function lstPageChest(wx,wy){if(wy>=LIL_FLOOR)return;const b=clamp(biomeAt(wy)-10,0,6);lstGivePage(b*2,wx*TILE+16,wy*TILE-64,true);}
/* первый моб биома, побеждённый в Истине */
function lstPageTruth(m){if(!m.tf)return;const b=clamp(biomeAt(Math.floor(m.y/TILE))-10,0,6);lstGivePage(b*2+1,m.x,m.y-m.h-70,false);}
UI.lpage=function(i){
  const p=LST_PAGES[i],got=lstDiary().length;
  const d=this.build('lpage',`
    <div class="card lilac" style="max-width:440px;width:94vw">
      <h3>Дневник Первого шахтёра</h3>
      <div class="lnote diary"><div class="lnh">${p[1]}</div><div class="lnt">${p[2]}</div><div class="lns">— страница ${i+1} из ${LST_PAGES.length}</div></div>
      <p class="tiny" style="text-align:center;margin-top:6px">Найдено страниц: ${got} из ${LST_PAGES.length}. Все записи — в Книге деревни (Доска пропавших).</p>
    </div>
    <button class="btn" id="lpBack">Закрыть дневник</button>`);
  d.querySelector('#lpBack').onclick=()=>{SFX.uiBack();UI.close();};
};

/* ---------- Книга деревни ---------- */
UI.lbook=function(tab,sel){
  tab=tab||UI._lbkTab||'diary';UI._lbkTab=tab;
  const P=player.prog,D=lstDiary(),N=P.lnotes||[],told=Math.min(P.tales|0,TH_TALES.length);
  let list='',text='';
  if(tab==='diary'){
    if(sel==null)sel=D.length?D[D.length-1]:-1;
    list=LST_PAGES.map((p,i)=>D.indexOf(i)>=0?`<button class="lbkItem ${i===sel?'on':''}" data-sel="${i}">${i+1}. ${p[1]}</button>`
      :`<div class="lbkItem locked">${i+1}. ??? <span class="tiny">· ${BIOMES[p[0]].n}, ${i%2?'моб в Истине':'первый сундук'}</span></div>`).join('');
    if(sel>=0){const p=LST_PAGES[sel];text=`<div class="lnote diary"><div class="lnh">${p[1]}</div><div class="lnt">${p[2]}</div><div class="lns">— страница ${sel+1}</div></div>`;}
  }else if(tab==='notes'){
    if(sel==null)sel=N.length?N[N.length-1]:-1;
    list=LIL_NOTES.map((n,i)=>N.indexOf(i)>=0?`<button class="lbkItem ${i===sel?'on':''}" data-sel="${i}">${n[0]}</button>`:`<div class="lbkItem locked">??? <span class="tiny">· тайник в шахте</span></div>`).join('');
    if(sel>=0){const n=LIL_NOTES[sel];text=`<div class="lnote"><div class="lnt">${n[1]}</div><div class="lns">— ${n[0]}</div></div>`;}
  }else{
    if(sel==null)sel=told?told-1:-1;
    list=TH_TALES.map((t,i)=>i<told?`<button class="lbkItem ${i===sel?'on':''}" data-sel="${i}">История ${i+1}</button>`:`<div class="lbkItem locked">??? <span class="tiny">· Чайный домик</span></div>`).join('');
    if(sel>=0)text=`<div class="lnote tea"><div class="lnt">${TH_TALES[sel]}</div><div class="lns">— хозяйка Чайного домика</div></div>`;
  }
  const cnt=tab==='diary'?D.length+' / '+LST_PAGES.length:tab==='notes'?N.length+' / '+LIL_NOTES.length:told+' / '+TH_TALES.length;
  const d=this.build('lbook',`
    <div class="card lilac" style="max-width:560px;width:96vw">
      <h3>📖 Книга деревни</h3>
      <div class="tabs"><button data-t="diary" class="${tab==='diary'?'on':''}">Дневник</button><button data-t="notes" class="${tab==='notes'?'on':''}">Записки</button><button data-t="tales" class="${tab==='tales'?'on':''}">Истории</button></div>
      <div class="tiny" style="text-align:right;margin:-2px 0 4px">Собрано: <b>${cnt}</b></div>
      ${text||'<p class="tiny muted" style="text-align:center;margin:12px 0">Здесь пока пусто. Записи находятся в шахте Лиловых небес.</p>'}
      <div class="lbkList scroll">${list}</div>
    </div>
    <button class="btn alt" id="lbkBack">Закрыть книгу</button>`);
  d.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{SFX.ui();UI.lbook(b.getAttribute('data-t'));});
  d.querySelectorAll('[data-sel]').forEach(b=>b.onclick=()=>{SFX.ui();UI.lbook(tab,+b.getAttribute('data-sel'));});
  d.querySelector('#lbkBack').onclick=()=>{SFX.uiBack();UI.close();};
};

/* ---------- подсказки при первом знакомстве ---------- */
const LST_HINTS={
  village:['🌸','Деревня Вечного Рассвета','Здесь всё как дома: шахта, перегонный куб, кузница, ярмарка. Начни с Шахты Рассвета — она слева.'],
  sanity:['👁','Рассудок','Лиловая полоса под здоровьем. В шахте она тает. Держат её свет, светящиеся камни, якоря и Настой ясности.'],
  truth:['🩸','Истина','Пелена спала — ты видишь, каков мир на самом деле. Мобы злее, но в пустой породе прячется истинная руда.'],
  illusion:['✨','Иллюзия','Часть руды — обман и рассыпается в руках. Фонарь ясности из Кузницы Зари заранее помечает иллюзии.'],
  pick:['⛏','Руда Зари','Эту руду не взять кирками Ада. Кирки XI–XV куются в Кузнице Зари из слитков Перегонного куба.'],
  struct:['🏠','Постройка жителей','У каждой постройки своя загадка. Подойди ближе — над ней появится подсказка, что делать.'],
  note:['📜','Записки','Записки жителей и страницы дневника собираются в Книге деревни — она на Доске пропавших.'],
  diary:['📖','Дневник Первого шахтёра','Кто-то уже спускался сюда до тебя. Страницы прячутся в первом сундуке каждого биома и у мобов в Истине.'],
  sny:['🌙','Сны','Валюта деревни. На неё покупают в Чайном домике, зажигают Маяк ясности и куют снаряжение Зари.'],
  seed:['🌰','Семена','Посади их в Оранжерее — растения растут, пока ты копаешь.'],
  night:['🌙','Ночь','Ночью деревня показывает своё лицо. Ночь короткая — рассвет вернётся сам.'],
  dream:['💤','Сон','Ты в Колодце снов. Собери, что успеешь, — через минуту проснёшься у колодца.'],
  mob:['🎭','Два облика','Мобы Лиловых небес выглядят мило, пока держится Рассудок. В Истине они показывают настоящий облик и бьют больнее.']
};
/* знакомство с биомами: одна строчка при первом спуске */
const LST_BIOME={
  10:'Цветущие луга — пушистые зверьки, ромашки с глазами и тёплый туман.',
  11:'Хрустальный сад — звенящий хрусталь, стеклянные птицы и садовницы, которые не стоят на месте.',
  12:'Медовые соты — вязкий мёд, пчёлы-няньки и воск, который тает от взрыва.',
  13:'Кукольный городок — улицы, домики и жители, которые очень похожи на настоящих.',
  14:'Розарий — шипы, зарастающие проходы и розы, которые просят немного крови.',
  15:'Зеркальные топи — вода, в которой мир переворачивается. Верь только своему отражению.',
  16:'Колыбель — самое дно сна. Здесь кто-то дышит.'
};
const LSH_Q=[];let lstHintT=0;
function lstSeen(id){const p=player.prog;if(!p.lhint||typeof p.lhint!=='object')p.lhint={};return !!p.lhint[id];}
function lstHint(id){
  if(G.dim!==2||settings.lilHints===false||lstSeen(id))return;
  player.prog.lhint[id]=1;
  const h=LST_HINTS[id];if(h)LSH_Q.push(h);
}
function lstBiomeHint(b){
  const id='b'+b;if(lstSeen(id))return;player.prog.lhint[id]=1;
  LSH_Q.push(['⬇','Новый биом: '+BIOMES[b].n,LST_BIOME[b]||'']);
}
function lstShowHint(h){
  let el=document.getElementById('lhintEl');
  if(!el){el=document.createElement('div');el.id='lhintEl';el.className='lhint';uiRoot.appendChild(el);
    el.addEventListener('pointerdown',(e)=>{e.stopPropagation();lstHintT=Math.min(lstHintT,0.35);});}
  el.innerHTML=`<div class="lhIc">${h[0]}</div><div class="lhTx"><b>${h[1]}</b><span>${h[2]}</span></div>`;
  el.classList.add('show');
  lstHintT=7;
}
/* такт: в деревне и в шахте Лиловых небес */
function lstTick(dt){
  const el=document.getElementById('lhintEl');
  const blocked=!!UI.modal||G.scene==='cutscene'||hudHidden();
  if(lstHintT>0){if(!blocked)lstHintT-=dt;if(el)el.classList.toggle('show',lstHintT>0.3&&!blocked);}
  else if(LSH_Q.length&&!blocked&&G.dim===2){const h=LSH_Q.shift();if(!(h===LST_HINTS.village&&G.scene!=='lobby'))lstShowHint(h);}
  if(G.dim!==2){if(el)el.classList.remove('show');LSH_Q.length=0;lstHintT=0;return;}
  if(blocked)return;
  if(G.scene==='lobby'){
    lstHint('village');
    if(lilNight()>0.5)lstHint('night');
    if(snyN()>0)lstHint('sny');
    if(GD_SEEDS.some(q=>matN(q.s)>0))lstHint('seed');
    return;
  }
  if(G.scene!=='mine')return;
  const d=Math.max(0,player.y)/TILE;
  if(d>14&&!G.dream)lstHint('sanity');
  if(veilT>0.5)lstHint('truth');
  if(G.dream)lstHint('dream');
  if(d>14&&d<LIL_FLOOR){const b=biomeAt(Math.floor(d));if(b>=10)lstBiomeHint(b);}
  /* моб и постройка рядом */
  G.lstScan=(G.lstScan||0)-dt;
  if(G.lstScan<=0){G.lstScan=0.5;
    if(!lstSeen('mob')&&mobs.some(m=>m.alive&&m.def.lm&&Math.abs(m.x-player.x)<300&&Math.abs(m.y-player.y)<200))lstHint('mob');
    if(!lstSeen('struct')){const tx=player.x/TILE,ty=player.y/TILE;if(structList(tx-4,tx+4,ty-4,ty+4).some(q=>q.st.dim===2))lstHint('struct');}}
}

/* ---------- катсцена прибытия ---------- */
function lilacCutStart(){
  UI.clear();resetAllInputs();
  G.cut={lil:1,t:0,to:2,dur:13,from:G.dim,seed:Math.random()*1000,switched:false};
  G.scene='cutscene';document.body.classList.add('cutscene');G._hh=true;
  AU.capture=[];try{lilCutSound();}catch(e){}G.cut.nodes=AU.capture;AU.capture=null;vib(60);
}
function lilCutSwitch(c){
  if(c.switched)return;c.switched=true;
  try{switchDimension(2);}catch(e){}
  if(typeof lilSetNight==='function')lilSetNight(false);   /* прибытие — всегда на рассвете */
  G.scene='cutscene';
  const pb=buildings.find(b=>b.id==='lportal');lobbyPlayer.x=pb?pb.x-160:300;lobbyPlayer.y=0;lobbyPlayer.vy=0;lobbyPlayer.facing=-1;
  G.cam.x=lobbyPlayer.x;G.cam.y=0;
}
function finishLilacCut(){
  const c=G.cut;if(!c)return;
  G.cut=null;
  if(c.nodes&&c.t<c.dur-0.2){for(const n of c.nodes){try{n.stop();}catch(e){}}}
  lilCutSwitch(c);
  document.body.classList.remove('cutscene');G._hh=false;
  G.cutHide=false;G.scene='lobby';G.cam.x=lobbyPlayer.x;G.cam.y=0;lobbyPlayer.animState='idle';lobbyPlayer.vy=0;lobbyPlayer.y=0;
  UI.toast('🌸 Лиловые небеса');G.fadeIn=0.6;
  saveGame();
}
/* музыка катсцены: тихие колокольчики, тёплая подложка, ветер; всё расписано заранее */
function lilCutSound(){
  if(!AU.ok||!AU.ok())return;
  /* врата: тихий гул и колокольчики */
  AU.osc('sine',98,3,0.18,0,{to:147,a:1.6,sus:0.6});
  [0,4,7,11,14,16,19].forEach((s,k)=>AU.bell(392*Math.pow(2,s/12),1.4,0.05,0.3+k*0.28,{ratio:2.01,index:0.6,rev:0.7,pan:Math.sin(k)*0.5}));
  AU.osc('sine',300,0.6,0.12,2.3,{to:1800,a:0.4});AU.noise(1.2,2600,0.12,2.6,{type:'lowpass',to:180,rev:0.6});
  /* падение: ветер и подложка */
  AU.noise(4.4,700,0.12,2.8,{type:'bandpass',to:1600,q:0.7,a:1.2,rev:0.4});
  for(const f of [196,247,294,392])AU.osc('sine',f,4.6,0.035,2.9,{a:1.4,sus:2,rev:0.6});
  /* глаз: шёпот и низкий тон */
  AU.osc('sine',62,2.4,0.16,4.2,{to:52,a:0.8});AU.noise(1.6,900,0.05,4.6,{type:'bandpass',q:4,to:500,rev:0.6});
  /* рассвет: мажорный аккорд колокольчиками */
  [523,659,784,988,1175].forEach((f,k)=>AU.bell(f,2.8,0.07,7.3+k*0.14,{ratio:2,index:0.7,rev:0.75}));
  AU.osc('sine',262,3.6,0.08,7.3,{a:0.8,sus:1.6,rev:0.6});AU.osc('sine',330,3.6,0.05,7.4,{a:0.8,sus:1.6,rev:0.6});
  /* приземление и титр */
  AU.osc('sine',220,0.5,0.1,8.95,{to:120});AU.noise(0.4,1400,0.06,8.95,{type:'bandpass',q:1.2});
  [784,988,1175,1568].forEach((f,k)=>AU.bell(f,1.8,0.05,9.3+k*0.2,{ratio:2.01,index:0.5,rev:0.8}));
}
function renderLilacCut(dt){
  const c=G.cut,W=view.W,H=view.H,T=c.t,cx=W/2,M=Math.max(W,H),S=Math.min(W,H);
  const ss=(a,b,x)=>{const q=clamp((x-a)/(b-a),0,1);return q*q*(3-2*q);};
  const rnd2=(k)=>{const x=Math.sin(k*127.1+c.seed)*43758.5;return x-Math.floor(x);};
  const petal=(x,y,s,a,col)=>{ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.scale(s,s);ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(-6,0);ctx.quadraticCurveTo(0,-4.4,6,0);ctx.quadraticCurveTo(0,3,-6,0);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.4)';ctx.beginPath();ctx.ellipse(-1,-1,3,0.8,0,0,TAU);ctx.fill();ctx.restore();};
  const PC=['#ffb0d8','#ffd8ec','#e0b8ff','#fff0f8'];
  const say=(txt,t0,t1,y)=>{const a=Math.min(ss(t0,t0+0.6,T),1-ss(t1-0.6,t1,T));if(a<=0)return;
    ctx.save();ctx.globalAlpha=a;ctx.textAlign='center';ctx.font='italic 600 '+Math.round(clamp(S*0.042,14,22))+'px '+HUDF;
    ctx.shadowColor='rgba(40,0,40,.9)';ctx.shadowBlur=8;ctx.fillStyle='#fff0fa';
    const words=txt.split(' '),lines=[];let cur='';const maxW=W*0.86;
    for(const w of words){const tt=cur?cur+' '+w:w;if(ctx.measureText(tt).width>maxW&&cur){lines.push(cur);cur=w;}else cur=tt;}lines.push(cur);
    lines.forEach((l,i)=>ctx.fillText(l,cx,y+i*Math.round(clamp(S*0.05,18,28))));ctx.restore();};
  ctx.setTransform(dpr,0,0,dpr,0,0);
  if(T<2.9){
    /* ===== 1. Врата Пустоты раскрываются как глаз ===== */
    const bg=ctx.createRadialGradient(cx,H*0.45,10,cx,H*0.45,M*0.75);bg.addColorStop(0,'#2a1240');bg.addColorStop(1,'#05020a');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
    for(let i=0;i<60;i++){const tw=0.5+0.5*Math.sin(T*2+i);ctx.fillStyle='rgba(230,210,255,'+(0.5*tw)+')';ctx.fillRect(rnd2(i)*W,rnd2(i+70)*H,1.5,1.5);}
    const op=ss(0.2,1.8,T),gy=H*0.45,gw=S*0.26,gh=S*0.42*op;
    ctx.save();ctx.globalCompositeOperation='lighter';softGlow(ctx,cx,gy,S*0.6,'#b080ff',0.5*op);softGlow(ctx,cx,gy,S*0.25,'#ffd0f0',0.6*op);ctx.restore();
    if(gh>1){ctx.save();ctx.beginPath();ctx.moveTo(cx,gy-gh);ctx.quadraticCurveTo(cx+gw,gy,cx,gy+gh);ctx.quadraticCurveTo(cx-gw,gy,cx,gy-gh);ctx.closePath();ctx.clip();
      const ig=ctx.createLinearGradient(0,gy-gh,0,gy+gh);ig.addColorStop(0,'#5a3a9a');ig.addColorStop(0.5,'#ffb0d0');ig.addColorStop(1,'#ffe8c8');ctx.fillStyle=ig;ctx.fillRect(cx-gw,gy-gh,gw*2,gh*2);
      ctx.globalCompositeOperation='lighter';ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=2;
      for(let k=0;k<3;k++){ctx.beginPath();for(let a=0;a<10;a+=0.2){const rr=a*gw*0.1;ctx.lineTo(cx+Math.cos(a+T*1.4+k*2.1)*rr,gy+Math.sin(a+T*1.4+k*2.1)*rr*1.5);}ctx.stroke();}
      ctx.restore();
      ctx.strokeStyle='rgba(255,230,255,'+(0.8*op)+')';ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(cx,gy-gh);ctx.quadraticCurveTo(cx+gw,gy,cx,gy+gh);ctx.quadraticCurveTo(cx-gw,gy,cx,gy-gh);ctx.stroke();
      /* ресницы-лучи вокруг */
      ctx.strokeStyle='rgba(220,180,255,'+(0.5*op)+')';ctx.lineWidth=1.6;for(let k=0;k<14;k++){const a=k/14*TAU,r0=Math.max(gw*0.75,gh*0.95);ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*r0*0.7,gy+Math.sin(a)*r0);ctx.lineTo(cx+Math.cos(a)*r0*0.95,gy+Math.sin(a)*r0*1.25);ctx.stroke();}}
    /* лепестки летят навстречу */
    for(let i=0;i<40;i++){const z=((rnd2(i+10)+T*0.45)%1),a=rnd2(i+20)*TAU,r=Math.pow(z,1.6)*M*0.7;if(z*op<0.05)continue;ctx.globalAlpha=Math.min(1,z*3)*op;
      petal(cx+Math.cos(a)*r,gy+Math.sin(a)*r*0.8,0.5+z*2.6,a+T*3+i,PC[i%4]);}ctx.globalAlpha=1;
    /* шахтёр подходит к вратам, и его втягивает */
    {const k=ss(1.2,2.6,T),px=cx-S*0.36+S*0.36*ss(0.3,1.8,T),py=H*0.45+S*0.36-k*S*0.36,sc=Math.min(1.6,S/300)*(1-k*0.85);
      ctx.save();ctx.translate(px,py);ctx.scale(sc,sc);ctx.rotate(k*k*3);ctx.globalAlpha=1-k*0.6;
      drawPlayerSprite(ctx,0,0,T<1.8?'run':'jump',T*1.6,1,{armor:player.armorLvl,pickLvl:player.pickLvl,torch:player.torchLvl,tool:null,groundY:0});ctx.restore();ctx.globalAlpha=1;}
    say('Врата Пустоты открылись.',0.4,2.6,H*(W>H?0.93:0.85));
    const fl=clamp(1-Math.abs(T-2.75)/0.25,0,1);if(fl>0){ctx.fillStyle='rgba(255,240,255,'+fl+')';ctx.fillRect(0,0,W,H);}
  }else if(T<7.3){
    /* ===== 2. падение сквозь рассветное небо ===== */
    const k=T-2.9,dawn=ss(0,4.4,k);
    const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,mixHex('#1a0a3a','#5a3a9a',dawn));sky.addColorStop(0.55,mixHex('#5a2a7a','#e294bc',dawn));sky.addColorStop(1,mixHex('#a05a9a','#ffd8c0',dawn));
    ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
    for(let i=0;i<70;i++){const tw=0.5+0.5*Math.sin(T*3+i);ctx.fillStyle='rgba(255,240,255,'+(0.7*(1-dawn)*tw)+')';ctx.fillRect(rnd2(i)*W,((rnd2(i+70)*H-k*20)%H+H)%H,1.6,1.6);}
    /* луна-глаз: открывается, смотрит на шахтёра и закрывается */
    {const ex=W*0.72,ey=H*0.28,ER=S*0.2,o=Math.min(ss(0.9,1.9,k),1-ss(3.3,4.1,k));
      if(o>0.01){ctx.save();ctx.globalAlpha=0.85;ctx.globalCompositeOperation='lighter';softGlow(ctx,ex,ey,ER*3,'#ff6a8a',0.3*o);ctx.restore();
        ctx.save();ctx.beginPath();ctx.ellipse(ex,ey,ER*1.3,ER*0.82*o,0,0,TAU);ctx.clip();
        const sg=ctx.createRadialGradient(ex-ER*0.3,ey-ER*0.3,ER*0.1,ex,ey,ER*1.3);sg.addColorStop(0,'#fff4ec');sg.addColorStop(0.7,'#f0c8c0');sg.addColorStop(1,'#a0505a');ctx.fillStyle=sg;ctx.fillRect(ex-ER*1.4,ey-ER,ER*2.8,ER*2);
        ctx.strokeStyle='rgba(180,20,40,.45)';ctx.lineWidth=1.4;for(let j=0;j<8;j++){const a=j/8*TAU;ctx.beginPath();ctx.moveTo(ex+Math.cos(a)*ER*1.25,ey+Math.sin(a)*ER*0.8);ctx.quadraticCurveTo(ex+Math.cos(a+0.3)*ER*0.8,ey+Math.sin(a+0.3)*ER*0.5,ex+Math.cos(a)*ER*0.55,ey+Math.sin(a)*ER*0.35);ctx.stroke();}
        const ang=Math.atan2(H*0.55-ey,cx-ex),ix=ex+Math.cos(ang)*ER*0.35,iy=ey+Math.sin(ang)*ER*0.22;
        const ig=ctx.createRadialGradient(ix,iy,1,ix,iy,ER*0.5);ig.addColorStop(0,'#ffd040');ig.addColorStop(0.5,'#c03040');ig.addColorStop(1,'#4a0a1a');ctx.fillStyle=ig;ctx.beginPath();ctx.arc(ix,iy,ER*0.5,0,TAU);ctx.fill();
        ctx.fillStyle='#0a0006';ctx.beginPath();ctx.ellipse(ix,iy,ER*0.1,ER*0.38,0,0,TAU);ctx.fill();ctx.fillStyle='rgba(255,255,255,.75)';ctx.beginPath();ctx.arc(ix-ER*0.18,iy-ER*0.2,ER*0.07,0,TAU);ctx.fill();
        ctx.restore();ctx.strokeStyle='rgba(60,0,20,.8)';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(ex,ey,ER*1.3,ER*0.82*o,0,0,TAU);ctx.stroke();}}
    /* облака уносятся вверх слоями */
    for(let L=0;L<3;L++){const sp=(120+L*160)*Math.min(1,S/500),n=4;
      for(let i=0;i<n;i++){const y=((rnd2(i*9+L*31)*H*1.6-k*sp)%(H*1.6)+H*1.6)%(H*1.6)-H*0.3,x=rnd2(i*5+L*13)*W,s=(0.8+rnd2(i+L*7)*0.8)*(0.7+L*0.35)*Math.min(1.4,S/420);
        const c1=mixHex('#7a5aa8','#fff0f8',dawn),c2=mixHex('#3a2a5a','#e0a8d0',dawn);ctx.globalAlpha=0.55+L*0.15;
        for(let j=0;j<5;j++){const cxx=x+(j-2)*30*s,cyy=y-(j%2)*9*s,r=(28-Math.abs(j-2)*6)*s;const gr=ctx.createLinearGradient(0,cyy-r,0,cyy+r);gr.addColorStop(0,c1);gr.addColorStop(1,c2);ctx.fillStyle=gr;ctx.beginPath();ctx.arc(cxx,cyy,r,0,TAU);ctx.fill();}}
      if(L===1){/* сам шахтёр между слоями облаков */
        ctx.globalAlpha=1;const sc=Math.min(1.8,S/260),px=cx+Math.sin(k*1.2)*W*0.05,py=H*0.55+Math.cos(k*0.9)*H*0.02;
        ctx.save();ctx.globalCompositeOperation='lighter';softGlow(ctx,px,py-20*sc,46*sc,'#ffe0f0',0.35);ctx.restore();
        ctx.save();ctx.translate(px,py);ctx.rotate(Math.sin(k*1.1)*0.5+k*0.35);ctx.scale(sc,sc);ctx.translate(0,22);
        drawPlayerSprite(ctx,0,0,'jump',k*2,1,{armor:player.armorLvl,pickLvl:player.pickLvl,torch:player.torchLvl,tool:null,vy:200,groundY:0});ctx.restore();}}
    ctx.globalAlpha=1;
    for(let i=0;i<30;i++){const y=((rnd2(i+300)*H*1.3-k*(220+rnd2(i)*200))%(H*1.3)+H*1.3)%(H*1.3)-H*0.15,x=rnd2(i+330)*W+Math.sin(k*2+i)*20;petal(x,y,0.8+rnd2(i+4)*1.6,k*3+i,PC[i%4]);}
    say('Говорят, здесь никогда не заходит солнце…',3.3,5.4,H*(W>H?0.9:0.82));
    say('…и никто никогда не просыпается.',5.5,7.1,H*(W>H?0.9:0.82));
    const fl=ss(3.9,4.4,k);if(fl>0){ctx.fillStyle='rgba(255,246,250,'+fl+')';ctx.fillRect(0,0,W,H);}
  }else{
    /* ===== 3. рассвет над деревней: шахтёр плавно опускается у Лиловых врат ===== */
    lilCutSwitch(c);G.cutHide=true;
    const a=T-7.3,land=1.7;
    const pb=buildings.find(b=>b.id==='lportal'),lx=lobbyPlayer.x;
    G.cam.x=lx+80-ss(0,3,a)*60;G.cam.y=0;
    renderLilacLobby();
    const sc=view.scale;ctx.setTransform(dpr*sc,0,0,dpr*sc,dpr*(W/2-G.cam.x*sc),dpr*(H*0.62-G.cam.y*sc));
    const q=clamp(a/land,0,1),py=-460*Math.pow(1-q,1.6),sway=Math.sin(a*3)*14*(1-q);
    for(let i=0;i<24;i++){const r=40+i*3*(1-q)+Math.sin(a*2+i)*6,an=i/24*TAU+a*(2-q);petal(lx+sway+Math.cos(an)*r*(0.6+q),py-30+Math.sin(an)*r*0.5,0.9,an*2,PC[i%4]);}
    if(a<land+0.05){ctx.save();ctx.globalCompositeOperation='lighter';softGlow(ctx,lx+sway,py-30,70,'#ffd8f0',0.45);ctx.restore();}
    const sq=a>land?Math.sin(clamp((a-land)/0.45,0,1)*Math.PI)*0.7:0;
    drawPlayerSprite(ctx,lx+sway,py,a<land?'jump':'idle',T*1.6,-1,{armor:player.armorLvl,pickLvl:player.pickLvl,torch:player.torchLvl,tool:null,sq,vy:a<land?60:0,groundY:-py});
    if(a>land&&a<land+1.2){const d=(a-land)/1.2;for(let i=0;i<16;i++){const an=i/16*TAU;petal(lx+Math.cos(an)*(14+d*90),-6-Math.abs(Math.sin(an))*d*40+d*d*30,1.1*(1-d*0.5),an+d*4,PC[i%4]);}
      ctx.strokeStyle='rgba(255,230,250,'+(0.6*(1-d))+')';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(lx,0,20+d*80,4+d*12,0,0,TAU);ctx.stroke();}
    ctx.setTransform(dpr,0,0,dpr,0,0);
    /* титр */
    const ta=Math.min(ss(1.9,2.7,a),1-ss(4.9,5.6,a));
    if(ta>0){ctx.save();ctx.globalAlpha=ta;ctx.textAlign='center';const fs=Math.round(clamp(S*0.085,26,58)),ty=W>H?fs*1.25:H*0.2;
      {const bg=ctx.createLinearGradient(0,ty-fs*1.3,0,ty+fs*1.1);bg.addColorStop(0,'rgba(30,10,50,0)');bg.addColorStop(0.5,'rgba(30,10,50,.45)');bg.addColorStop(1,'rgba(30,10,50,0)');ctx.fillStyle=bg;ctx.fillRect(0,ty-fs*1.3,W,fs*2.4);}
      ctx.font=fs+"px 'Russo One',"+HUDF;if(ctx.letterSpacing!==undefined)ctx.letterSpacing=Math.round(fs*0.08)+'px';
      ctx.shadowColor='#b060ff';ctx.shadowBlur=24;ctx.fillStyle='#fff0ff';ctx.fillText('ЛИЛОВЫЕ НЕБЕСА',cx,ty);ctx.shadowBlur=0;
      const tg=ctx.createLinearGradient(0,ty-fs,0,ty);tg.addColorStop(0,'#ffffff');tg.addColorStop(1,'#f0c0ff');ctx.fillStyle=tg;ctx.fillText('ЛИЛОВЫЕ НЕБЕСА',cx,ty);
      if(ctx.letterSpacing!==undefined)ctx.letterSpacing='0px';
      ctx.font='italic 600 '+Math.round(fs*0.36)+'px '+HUDF;ctx.fillStyle='#ffe0f0';ctx.shadowColor='rgba(60,0,60,.9)';ctx.shadowBlur=8;ctx.fillText('Деревня Вечного Рассвета',cx,ty+fs*0.62);
      ctx.strokeStyle='rgba(255,220,250,.7)';ctx.lineWidth=1.4;const lw=Math.min(W*0.3,fs*3)*ss(2,3.2,a);ctx.beginPath();ctx.moveTo(cx-lw,ty+fs*0.82);ctx.lineTo(cx+lw,ty+fs*0.82);ctx.stroke();
      ctx.restore();}
    const wf=1-ss(0,0.7,a);if(wf>0){ctx.fillStyle='rgba(255,246,250,'+wf+')';ctx.fillRect(0,0,W,H);}
    const ff=ss(c.dur-7.3-0.5,c.dur-7.3,a);if(ff>0){ctx.fillStyle='rgba(0,0,0,'+(ff*0.5)+')';ctx.fillRect(0,0,W,H);}
  }
  /* подсказка «нажми, чтобы пропустить» */
  if(T>1&&T<c.dur-1){ctx.globalAlpha=0.45;ctx.fillStyle='#fff';ctx.font='600 11px '+HUDF;ctx.textAlign='right';ctx.fillText('нажми, чтобы пропустить',W-12,H-14);ctx.globalAlpha=1;}
}

/* ---------- тест-панель ---------- */
function lstCheat(k){
  if(k==='all'){const D=lstDiary();for(let i=0;i<LST_PAGES.length;i++)if(D.indexOf(i)<0)D.push(i);player.prog.lnotes=LIL_NOTES.map((_,i)=>i);player.prog.tales=TH_TALES.length;UI.toast('📖 Все записи открыты');saveGame();}
  else if(k==='hints'){player.prog.lhint={};UI.toast('💡 Подсказки покажутся заново');saveGame();}
}
/* открылось окно — подсказка прячется (игра в это время стоит) */
{const base=UI.build;UI.build=function(){const e=document.getElementById('lhintEl');if(e)e.classList.remove('show');return base.apply(this,arguments);};}
