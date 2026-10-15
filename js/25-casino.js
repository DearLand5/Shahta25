'use strict';
/* ============================================================
   CASINO STATE
   ============================================================ */
const WHEEL=[
  {c:'#3a4a6a',m:0},{c:'#4a8a5a',m:2},{c:'#8a6a2a',m:0.5},{c:'#8a3a4a',m:5},
  {c:'#4a3a6a',m:0},{c:'#6a8a3a',m:1.5},{c:'#3a6a8a',m:1},{c:'#8a5a2a',m:3}
];
const WHEEL_WEIGHTS=[0.20,0.14,0.18,0.02,0.20,0.12,0.11,0.03];


/* ================= ОБЩИЕ ИГРЫ КАЗИНО (ставка предметом: руда, слитки, души) ================= */
const RL_ORDER=[0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
const RL_RED=new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);
const CG={rl:{bet:'red',rot:0,ball:0,spin:false,res:null},bj:null,hl:{bet:'over',res:null},sl:{reels:[0,1,2],spin:false,res:null},sk:{res:null}};
/* адаптер ставки: {name, have(), take(n), give(n), unit} */
function cgStakeLabel(st){return st.amount+' '+st.unit;}
function cgFinish(st,mult,msg){const gain=Math.floor(st.amount*mult);if(gain>0)st.give(gain);
  if(mult>1){SFX.win?SFX.win():SFX.coin();vib(30);}else if(mult===1)SFX.ui();else SFX.uiBack();
  saveGame();return msg+(gain>0?' · +'+gain+' '+st.unit:' · ставка сгорела');}
function cgCanBet(st){return st.amount>0&&st.have()>=st.amount;}
/* --- рулетка: красное, чёрное, зелёное, дюжины --- */
function cgRoulette(body,st,rerender){
  const R=CG.rl;
  const bets=[['red','🔴 Красное ×2'],['black','⚫ Чёрное ×2'],['green','🟢 Зеро ×14'],['d1','1–12 ×3'],['d2','13–24 ×3'],['d3','25–36 ×3']];
  body.innerHTML=`<div style="text-align:center"><canvas id="rlC" width="460" height="460" style="width:min(230px,62vw);height:auto;display:block;margin:4px auto"></canvas>
    <div class="tiny" style="min-height:16px;color:#ffd98a">${R.res||'Выбери ставку и крути'}</div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:5px;margin-top:8px">${bets.map(b=>`<button class="btn small ${R.bet===b[0]?'':'alt'}" data-rb="${b[0]}" style="padding:7px 4px">${b[1]}</button>`).join('')}</div>
    <button class="btn" id="rlSpin" style="margin-top:10px;width:100%" ${R.spin||!cgCanBet(st)?'disabled':''}>🎡 Крутить (${cgStakeLabel(st)})</button></div>`;
  const cv=body.querySelector('#rlC'),g=cv.getContext('2d');
  const draw=(rot,ball,bR)=>{const c=230,r=210;g.clearRect(0,0,460,460);
    g.save();g.translate(c,c);
    const rim=g.createRadialGradient(0,0,r*0.6,0,0,r+20);rim.addColorStop(0,'#3a1a0a');rim.addColorStop(1,'#120604');g.fillStyle=rim;g.beginPath();g.arc(0,0,r+18,0,TAU);g.fill();
    g.strokeStyle='#caa24a';g.lineWidth=5;g.beginPath();g.arc(0,0,r+14,0,TAU);g.stroke();
    g.rotate(rot);const n=RL_ORDER.length,da=TAU/n;
    for(let i=0;i<n;i++){const v=RL_ORDER[i];g.fillStyle=v===0?'#1a8a3a':RL_RED.has(v)?'#b01420':'#141014';
      g.beginPath();g.moveTo(0,0);g.arc(0,0,r,i*da-Math.PI/2-da/2,(i+1)*da-Math.PI/2-da/2);g.closePath();g.fill();
      g.strokeStyle='rgba(202,162,74,.7)';g.lineWidth=1.5;g.stroke();
      g.save();g.rotate(i*da);g.fillStyle='#fff';g.font='700 15px system-ui';g.textAlign='center';g.fillText(String(v),0,-r+22);g.restore();}
    g.fillStyle='#2a140a';g.beginPath();g.arc(0,0,r*0.62,0,TAU);g.fill();
    const cg2=g.createRadialGradient(-20,-20,4,0,0,r*0.6);cg2.addColorStop(0,'#6a4020');cg2.addColorStop(1,'#1a0a04');g.fillStyle=cg2;g.beginPath();g.arc(0,0,r*0.58,0,TAU);g.fill();
    g.strokeStyle='#caa24a';g.lineWidth=6;for(let k=0;k<4;k++){g.rotate(Math.PI/4);g.beginPath();g.moveTo(-r*0.4,0);g.lineTo(r*0.4,0);g.stroke();}
    g.fillStyle='#e0b850';g.beginPath();g.arc(0,0,16,0,TAU);g.fill();g.restore();
    g.save();g.translate(c,c);g.rotate(ball);g.fillStyle='#f4f4f4';g.beginPath();g.arc(0,-bR,9,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.9)';g.beginPath();g.arc(-3,-bR-3,3,0,TAU);g.fill();g.restore();
    g.fillStyle='#ffd060';g.beginPath();g.moveTo(c,8);g.lineTo(c-10,-6+8);g.lineTo(c+10,-6+8);g.closePath();g.fill();};
  draw(R.rot,R.ball,R.res?165:186);
  body.querySelectorAll('[data-rb]').forEach(b=>b.onclick=()=>{if(R.spin)return;R.bet=b.getAttribute('data-rb');R.res=null;SFX.ui();rerender();});
  body.querySelector('#rlSpin').onclick=()=>{
    if(R.spin||!cgCanBet(st))return;st.take(st.amount);R.spin=true;R.res=null;
    const idx=Math.floor(Math.random()*37),v=RL_ORDER[idx],da=TAU/37;
    const r0=R.rot,r1=r0+TAU*4+Math.random()*TAU;const b0=R.ball,b1end=b0-TAU*7;
    const T0=performance.now(),D=4200;SFX.ui();
    const step=()=>{const k=Math.min(1,(performance.now()-T0)/D),e=1-Math.pow(1-k,3);
      const rot=r0+(r1-r0)*e;
      /* шарик падает в карман idx к концу */
      const target=rot+idx*da;let ball=b0+(b1end-b0)*e;if(k>0.75){const q=(k-0.75)/0.25;ball=ball*(1-q)+(target-TAU*Math.round((target-ball)/TAU))*q;}
      const bR=186-Math.min(1,k*1.4)*(186-165)+(k>0.6&&k<0.9?Math.sin(k*90)*4:0);
      if(document.body.contains(cv))draw(rot,ball,bR);
      if(k<1)requestAnimationFrame(step);else{R.rot=rot%TAU;R.ball=target%TAU;R.spin=false;
        const red=RL_RED.has(v),col=v===0?'зеро':red?'красное':'чёрное';
        let m=0;if(R.bet==='red'&&red&&v)m=2;else if(R.bet==='black'&&!red&&v)m=2;else if(R.bet==='green'&&v===0)m=14;
        else if(R.bet==='d1'&&v>=1&&v<=12)m=3;else if(R.bet==='d2'&&v>=13&&v<=24)m=3;else if(R.bet==='d3'&&v>=25)m=3;
        R.res=cgFinish(st,m,'Выпало '+v+' ('+col+')');rerender();}};
    requestAnimationFrame(step);rerender(true);
  };
}
/* --- блэкджек --- */
function cgCard(){const v=['A','2','3','4','5','6','7','8','9','10','J','Q','K'][Math.floor(Math.random()*13)],su='♠♥♦♣'[Math.floor(Math.random()*4)];return {v,su};}
function cgHand(h){let s2=0,a=0;for(const c of h){if(c.v==='A'){a++;s2+=11;}else if('JQK'.includes(c.v))s2+=10;else s2+=+c.v;}while(s2>21&&a){s2-=10;a--;}return s2;}
function cgCardsHtml(h,hide){return h.map((c,i)=>{const hidden=hide&&i===1,red=c.su==='♥'||c.su==='♦';
  return `<div style="width:44px;height:62px;border-radius:7px;display:inline-flex;flex-direction:column;align-items:center;justify-content:center;margin:0 3px;font-weight:900;font-size:17px;
    ${hidden?'background:repeating-linear-gradient(45deg,#6a1010,#6a1010 4px,#3a0808 4px,#3a0808 8px);border:2px solid #caa24a;':'background:linear-gradient(170deg,#fffaf0,#e8e0d0);border:1px solid #888;color:'+(red?'#b01420':'#14101a')+';'}box-shadow:0 3px 8px rgba(0,0,0,.4)">${hidden?'':c.v+'<span style="font-size:15px">'+c.su+'</span>'}</div>`;}).join('');}
function cgBlackjack(body,st,rerender){
  const B=CG.bj;
  const playing=B&&!B.done;
  body.innerHTML=`<div style="text-align:center;background:radial-gradient(ellipse at center,#1e5a32,#0c2a16);border-radius:14px;padding:10px;border:2px solid #4a3a1a">
    <div class="tiny" style="color:#cfe8d0">Дилер ${B?(B.done?'· '+cgHand(B.d):''):''}</div>
    <div style="min-height:66px;margin:4px 0">${B?cgCardsHtml(B.d,!B.done):''}</div>
    <div style="min-height:66px;margin:4px 0">${B?cgCardsHtml(B.p,false):''}</div>
    <div class="tiny" style="color:#cfe8d0">Ты ${B?'· '+cgHand(B.p):''}</div>
    <div class="tiny" style="min-height:16px;color:#ffd98a;margin-top:4px">${B&&B.msg?B.msg:'Набери ближе к 21, чем дилер. Блэкджек ×2.5'}</div></div>
    ${playing?`<div class="row" style="gap:6px;margin-top:8px"><button class="btn small" id="bjHit" style="flex:1">Ещё</button><button class="btn small alt" id="bjStand" style="flex:1">Хватит</button>
      <button class="btn small alt" id="bjDbl" style="flex:1" ${B.p.length===2&&st.have()>=st.amount?'':'disabled'}>Удвоить</button></div>`
     :`<button class="btn" id="bjDeal" style="margin-top:10px;width:100%" ${cgCanBet(st)?'':'disabled'}>🃏 Раздать (${cgStakeLabel(st)})</button>`}`;
  const end=(m,msg)=>{B.done=true;B.msg=cgFinish({amount:B.bet,give:st.give,unit:st.unit},m,msg);rerender();};
  const dealer=()=>{while(cgHand(B.d)<17)B.d.push(cgCard());const p=cgHand(B.p),d=cgHand(B.d);
    if(d>21)end(2,'У дилера перебор ('+d+')');else if(p>d)end(2,'Победа '+p+' против '+d);else if(p===d)end(1,'Ничья '+p);else end(0,'Дилер выиграл '+d+' против '+p);};
  if(body.querySelector('#bjDeal'))body.querySelector('#bjDeal').onclick=()=>{if(!cgCanBet(st))return;st.take(st.amount);
    CG.bj={p:[cgCard(),cgCard()],d:[cgCard(),cgCard()],bet:st.amount,done:false,msg:''};SFX.ui();
    const b2=CG.bj;if(cgHand(b2.p)===21){CG.bj.done=true;CG.bj.msg=cgHand(b2.d)===21?cgFinish({amount:b2.bet,give:st.give,unit:st.unit},1,'Оба блэкджека'):cgFinish({amount:b2.bet,give:st.give,unit:st.unit},2.5,'БЛЭКДЖЕК!');}
    rerender();};
  if(body.querySelector('#bjHit'))body.querySelector('#bjHit').onclick=()=>{B.p.push(cgCard());SFX.ui();if(cgHand(B.p)>21)end(0,'Перебор ('+cgHand(B.p)+')');else if(cgHand(B.p)===21)dealer();else rerender();};
  if(body.querySelector('#bjStand'))body.querySelector('#bjStand').onclick=()=>dealer();
  if(body.querySelector('#bjDbl'))body.querySelector('#bjDbl').onclick=()=>{if(st.have()<st.amount)return;st.take(st.amount);B.bet*=2;B.p.push(cgCard());if(cgHand(B.p)>21)end(0,'Перебор ('+cgHand(B.p)+')');else dealer();};
}
/* --- кости Преисподней (больше/меньше 7) --- */
function cgDie(v,col){const P={1:[[50,50]],2:[[28,28],[72,72]],3:[[25,25],[50,50],[75,75]],4:[[28,28],[72,28],[28,72],[72,72]],5:[[25,25],[75,25],[50,50],[25,75],[75,75]],6:[[28,22],[72,22],[28,50],[72,50],[28,78],[72,78]]}[v]||[];
  return `<div style="width:58px;height:58px;border-radius:12px;position:relative;background:linear-gradient(150deg,${col||'#f4ead8'},#c8b89a);box-shadow:inset 0 -4px 8px rgba(0,0,0,.25),0 4px 10px rgba(0,0,0,.5)">${P.map(([x,y])=>`<span style="position:absolute;left:${x}%;top:${y}%;width:10px;height:10px;margin:-5px;border-radius:50%;background:#7a0a10"></span>`).join('')}</div>`;}
function cgHiLo(body,st,rerender){
  const H2=CG.hl;
  body.innerHTML=`<div style="text-align:center"><div style="display:flex;justify-content:center;gap:16px;margin:10px 0" id="hlD">${cgDie(H2.d1||1)}${cgDie(H2.d2||6)}</div>
    <div class="tiny" style="min-height:16px;color:#ffd98a">${H2.res||'Угадай сумму двух костей'}</div>
    <div class="row" style="gap:6px;margin-top:8px"><button class="btn small ${H2.bet==='under'?'':'alt'}" data-hb="under" style="flex:1">Меньше 7 ×2</button>
      <button class="btn small ${H2.bet==='seven'?'':'alt'}" data-hb="seven" style="flex:1">Ровно 7 ×5</button><button class="btn small ${H2.bet==='over'?'':'alt'}" data-hb="over" style="flex:1">Больше 7 ×2</button></div>
    <button class="btn" id="hlRoll" style="margin-top:10px;width:100%" ${H2.rolling||!cgCanBet(st)?'disabled':''}>🎲 Бросить (${cgStakeLabel(st)})</button></div>`;
  body.querySelectorAll('[data-hb]').forEach(b=>b.onclick=()=>{if(H2.rolling)return;H2.bet=b.getAttribute('data-hb');SFX.ui();rerender();});
  body.querySelector('#hlRoll').onclick=()=>{if(H2.rolling||!cgCanBet(st))return;st.take(st.amount);H2.rolling=true;H2.res=null;let n=0;
    const box=body.querySelector('#hlD');const iv=setInterval(()=>{n++;const a=1+Math.floor(Math.random()*6),b=1+Math.floor(Math.random()*6);if(box)box.innerHTML=cgDie(a)+cgDie(b);SFX.ui();
      if(n>=10){clearInterval(iv);H2.d1=a;H2.d2=b;const sum=a+b;let m=0;if(H2.bet==='under'&&sum<7)m=2;else if(H2.bet==='over'&&sum>7)m=2;else if(H2.bet==='seven'&&sum===7)m=5;
        H2.rolling=false;H2.res=cgFinish(st,m,'Сумма '+sum);rerender();}},90);};
}
/* --- слоты --- */
const SLOT_SYM=['⛏','🪨','💎','⭐','🔥','7'];
function cgSlots(body,st,rerender){
  const S2=CG.sl;
  const reel=(i)=>`<div style="width:64px;height:76px;border-radius:10px;background:linear-gradient(180deg,#f4ead8,#d0c4a8);display:flex;align-items:center;justify-content:center;font-size:36px;font-weight:900;color:#b01420;box-shadow:inset 0 6px 10px rgba(0,0,0,.35),inset 0 -6px 10px rgba(0,0,0,.35)">${SLOT_SYM[S2.reels[i]]}</div>`;
  body.innerHTML=`<div style="text-align:center"><div style="display:inline-flex;gap:8px;padding:12px;border-radius:16px;background:linear-gradient(180deg,#6a1a10,#2a0806);border:3px solid #caa24a;box-shadow:0 6px 18px rgba(0,0,0,.5)" id="slR">${reel(0)}${reel(1)}${reel(2)}</div>
    <div class="tiny" style="min-height:16px;color:#ffd98a;margin-top:6px">${S2.res||'7-7-7 ×20 · 💎 ×10 · ⭐ ×6 · три одинаковых ×4 · пара ×1.5'}</div>
    <button class="btn" id="slSpin" style="margin-top:10px;width:100%" ${S2.spin||!cgCanBet(st)?'disabled':''}>🎰 Дёрнуть рычаг (${cgStakeLabel(st)})</button></div>`;
  body.querySelector('#slSpin').onclick=()=>{if(S2.spin||!cgCanBet(st))return;st.take(st.amount);S2.spin=true;S2.res=null;
    const W8=[30,26,12,10,14,8],pick=()=>{let r=Math.random()*100;for(let i=0;i<6;i++){r-=W8[i];if(r<=0)return i;}return 0;};
    const fin=[pick(),pick(),pick()];let n=0;const box=body.querySelector('#slR');
    const iv=setInterval(()=>{n++;for(let i=0;i<3;i++)if(n<8+i*5)S2.reels[i]=Math.floor(Math.random()*6);else S2.reels[i]=fin[i];if(box)box.innerHTML=reel(0)+reel(1)+reel(2);SFX.ui();
      if(n>=18){clearInterval(iv);const [a,b,c]=fin;let m=0;
        if(a===b&&b===c)m=a===5?20:a===2?10:a===3?6:4;else if(a===b||b===c)m=1.5;
        S2.spin=false;S2.res=cgFinish(st,m,m?'Выигрышная линия!':'Пусто');rerender();}},80);};
}
/* --- три черепа (ставка душами) --- */
function cgSkulls(body,st,rerender){
  const K=CG.sk;
  body.innerHTML=`<div style="text-align:center"><p class="muted" style="margin-bottom:6px">Под одним черепом горит пламя души. Угадаешь — ставка ×2.7</p>
    <div class="row" style="gap:12px;justify-content:center">${[0,1,2].map(i=>{const open=K.res&&(i===K.at||i===K.pick);
      return `<div data-sk="${i}" style="width:78px;height:86px;border-radius:14px;cursor:${K.res?'default':'pointer'};display:flex;align-items:center;justify-content:center;font-size:40px;
      background:linear-gradient(170deg,#3a2a3a,#140a14);border:2px solid ${K.res?(i===K.at?'#7ad8ff':i===K.pick?'#ff5a4a':'rgba(255,255,255,.12)'):'rgba(150,200,255,.3)'};box-shadow:0 6px 14px rgba(0,0,0,.5)">${open&&i===K.at?'👻':'💀'}</div>`;}).join('')}</div>
    <div class="tiny" style="min-height:16px;color:#ffd98a;margin-top:8px">${K.msg||('Ставка: '+cgStakeLabel(st))}</div>
    ${K.res?'<button class="btn" id="skAgain" style="margin-top:8px;width:100%">Ещё раз</button>':''}</div>`;
  if(!K.res)body.querySelectorAll('[data-sk]').forEach(el=>el.onclick=()=>{if(!cgCanBet(st)){UI.toast('Не хватает');return;}st.take(st.amount);const at=Math.floor(Math.random()*3),pick=+el.getAttribute('data-sk');
    K.res=true;K.at=at;K.pick=pick;K.msg=cgFinish(st,at===pick?2.7:0,at===pick?'Пламя найдено!':'Пусто');rerender();});
  if(body.querySelector('#skAgain'))body.querySelector('#skAgain').onclick=()=>{K.res=null;K.msg=null;SFX.ui();rerender();};
}
/* --- колесо душ: ставка душами, призы — слитки, сплавы, части, души --- */
function cgSoulWheel(body,st,rerender){
  const W2=CG.sw||(CG.sw={rot:0,spin:false,res:null});
  const SEC=[{l:'×0',c:'#1a1424'},{l:'×2',c:'#2a4a7a',m:2},{l:'▰',c:'#6a5030',ing:1},{l:'×0',c:'#120e1a'},{l:'×1.5',c:'#304a6a',m:1.5},{l:'⚗',c:'#5a2a6a',alloy:1},{l:'×0',c:'#1a1424'},{l:'×4',c:'#4a8ac8',m:4}];
  const WG=[0.22,0.16,0.14,0.2,0.14,0.05,0.06,0.03];
  body.innerHTML=`<div style="text-align:center"><div class="wheelWrap" style="margin:6px auto"><div class="wheelPin"></div><div class="wheel" id="swW"></div><div class="wheelC">${W2.res?W2.res.l:'👻'}</div></div>
    <div class="tiny" style="min-height:16px;color:#9ad8ff">${W2.res?W2.res.msg:'Ставка душами. Слиток ▰ и сплав ⚗ — редкие призы'}</div>
    <button class="btn" id="swSpin" style="margin-top:10px;width:100%" ${W2.spin||!cgCanBet(st)?'disabled':''}>🎡 Крутить (${cgStakeLabel(st)})</button></div>`;
  const wEl=body.querySelector('#swW'),n=SEC.length,deg=360/n;
  wEl.style.background='conic-gradient('+SEC.map((q,i)=>q.c+' '+(i*deg)+'deg '+((i+1)*deg)+'deg').join(',')+')';wEl.style.transition='none';wEl.style.transform='rotate('+W2.rot+'deg)';
  SEC.forEach((q,i)=>{const mid=i*deg+deg/2,rad=mid*Math.PI/180,l=document.createElement('div');l.textContent=q.l;l.style.cssText=`position:absolute;left:${50+33*Math.sin(rad)}%;top:${50-33*Math.cos(rad)}%;transform:translate(-50%,-50%) rotate(${mid}deg);font-size:13px;font-weight:900;color:#fff;text-shadow:0 1px 2px #000;pointer-events:none;z-index:2;`;wEl.appendChild(l);});
  body.querySelector('#swSpin').onclick=()=>{if(W2.spin||!cgCanBet(st))return;st.take(st.amount);let r=Math.random(),idx=0;for(let i=0;i<n;i++){r-=WG[i];if(r<=0){idx=i;break;}}
    const q=SEC[idx];W2.spin=true;W2.rot=W2.rot-(W2.rot%360)+360*6+(360-(idx*deg+deg/2));void wEl.offsetHeight;wEl.style.transition='transform 3s cubic-bezier(.15,.85,.2,1)';wEl.style.transform='rotate('+W2.rot+'deg)';SFX.ui();
    setTimeout(()=>{W2.spin=false;let msg;const t=clamp(player.pickLvl-6,0,4);
      if(q.ing){const pool=[[18,27,19,28],[29,20,30,21],[31,22,32,23],[33,24,34,25],[35,26,36]][t],o=pool[Math.floor(Math.random()*pool.length)],nn=2+Math.floor(st.amount/10);addMat('i'+o,nn);msg='Слитки: '+MATS['i'+o].n+' ×'+nn;SFX.coin();}
      else if(q.alloy){const a='a'+(7+t),nn=1+Math.floor(st.amount/40);addMat(a,nn);msg='Сплав: '+MATS[a].n+' ×'+nn;SFX.win&&SFX.win();}
      else msg=cgFinish(st,q.m||0,q.m?'Души умножены':'Колесо поглотило души');
      W2.res={l:q.l,msg};saveGame();rerender();},3100);};
}
/* --- общий выбор ставки (руда / слитки / души) --- */
function cgStakePicker(opts){
  /* opts: {ores:true, mats:bool, souls:bool, key} -> state in CG.pick[key] */
  if(!CG.pick)CG.pick={};const P=CG.pick[opts.key]||(CG.pick[opts.key]={kind:null,id:null,amount:1});
  const list=[];
  if(opts.souls)list.push({kind:'soul',id:'s',name:'Души',ic:'👻',col:'#9ad8ff',have:player.souls||0});
  if(opts.ores)for(const k of Object.keys(player.inv).filter(k=>player.inv[k]>0)){const o=ORES[k];list.push({kind:'ore',id:+k,name:o.name,col:o.color,have:player.inv[k]});}
  if(opts.mats)for(const id of Object.keys(player.mats||{}).filter(id=>/^i\d+$/.test(id)&&player.mats[id]>0)){const M=MATS[id];list.push({kind:'mat',id,name:M.n,ic:M.ic||'▰',col:M.col||'#ccc',have:player.mats[id]});}
  if(!list.length)return {html:'<p class="muted tiny" style="text-align:center;padding:10px">'+(opts.souls&&!opts.ores?'Нет душ для ставки':'Нечего ставить — '+(opts.mats?'нужна руда или слитки':'нужна руда'))+'</p>',st:{amount:0,have:()=>0,take(){},give(){},unit:''},bind(){}};
  let cur=list.find(x=>x.kind===P.kind&&String(x.id)===String(P.id))||list[0];P.kind=cur.kind;P.id=cur.id;
  P.amount=clamp(P.amount,1,Math.max(1,cur.have));
  const st={amount:P.amount,unit:cur.kind==='soul'?'👻':cur.kind==='ore'?'шт':'слит.',
    have:()=>cur.kind==='soul'?(player.souls||0):cur.kind==='ore'?(player.inv[cur.id]||0):((player.mats||{})[cur.id]||0),
    take:(n)=>{if(cur.kind==='soul')player.souls-=n;else if(cur.kind==='ore'){player.inv[cur.id]-=n;if(player.inv[cur.id]<=0)delete player.inv[cur.id];}else{player.mats[cur.id]-=n;if(player.mats[cur.id]<=0)delete player.mats[cur.id];}},
    give:(n)=>{if(cur.kind==='soul')player.souls=(player.souls||0)+n;else if(cur.kind==='ore')player.inv[cur.id]=(player.inv[cur.id]||0)+n;else addMat(cur.id,n);}};
  const html=`<div style="margin-top:10px;border-top:1px solid rgba(255,255,255,.08);padding-top:8px">
    <div class="tiny" style="margin-bottom:5px">Ставка:</div>
    <div class="scroll" style="max-height:132px;border:1px solid rgba(255,255,255,.08);border-radius:10px;padding:4px 6px;margin-bottom:6px">
      ${list.map(x=>`<div class="item" data-stk="${x.kind}:${x.id}" style="cursor:pointer;padding:6px 8px;${x===cur?'border-color:#ffd98a;background:rgba(255,217,138,.1)':''}">
        <div class="ico" style="width:24px;height:24px;background:${x.kind==='ore'?x.col:'rgba(255,255,255,.07)'};display:flex;align-items:center;justify-content:center;font-size:14px;color:${x.col}">${x.kind==='ore'?'':x.ic}</div>
        <div class="txt"><div class="nm" style="font-size:13px">${x.name}</div><div class="ds">есть ${x.have}</div></div>${x===cur?'<span class="pill">✓</span>':''}</div>`).join('')}</div>
    <div class="qline"><div class="qwrap">${(UI._qty=UI._qty||{},UI._qty['stk'+opts.key]=P.amount,qtyHtml('stk'+opts.key,cur.have))}
      <div class="qsum">ставка: <b data-qs="stk${opts.key}">${P.amount}</b> ${cur.kind==='soul'?'👻':cur.kind==='ore'?'шт':'слит.'}${cur.kind==='ore'?' · ≈<b class="gold" data-qp="stk'+opts.key+'">'+fmt(Math.round(ORES[cur.id].price*P.amount))+'</b> 💰':''}</div></div>
      <button class="btn small alt" id="stMax">MAX</button></div></div>`;
  const bind=(root,rerender)=>{
    root.querySelectorAll('[data-stk]').forEach(el=>el.onclick=()=>{const [k,id]=el.getAttribute('data-stk').split(':');P.kind=k;P.id=id;SFX.ui();rerender();});
    const set=(v)=>{P.amount=clamp(v,1,Math.max(1,st.have()));SFX.ui();rerender();};
    wireQty(root,(key,v,fin)=>{if(key!=='stk'+opts.key)return;P.amount=v;st.amount=v;const a=root.querySelector(`[data-qs="${key}"]`),b=root.querySelector(`[data-qp="${key}"]`);if(a)a.textContent=v;if(b&&cur.kind==='ore')b.textContent=fmt(Math.round(ORES[cur.id].price*v));if(fin)rerender();});
    root.querySelector('#stMax').onclick=()=>set(st.have());};
  return {html,st,bind};
}
/* ---------- ползунок количества (рынок, биржа, печь, ящики, ставки) ----------
   Значение запоминается в UI._qty[key]; по умолчанию — максимум. */
function qtyVal(key,max,def){if(!UI._qty)UI._qty={};let v=UI._qty[key];if(v==null)v=def==null?max:def;return Math.max(1,Math.min(max,Math.round(v)));}
function qtyHtml(key,max,opt){opt=opt||{};max=Math.max(1,max|0);const v=qtyVal(key,max,opt.def);
  return `<div class="qty${opt.sm?' sm':''}" data-qk="${key}" data-qmax="${max}"><button class="qb" data-qd="-1" aria-label="меньше">−</button>`+
    `<input type="range" min="1" max="${max}" step="1" value="${v}" style="--p:${max>1?((v-1)/(max-1)*100).toFixed(1):100}%" ${max<=1?'disabled':''}>`+
    `<button class="qb" data-qd="1" aria-label="больше">+</button><b class="qn">${v}</b></div>`;}
/* onChange(key,v,final) — вызывается при движении (final=false) и по отпусканию/кнопкам (final=true) */
function wireQty(root,onChange){
  if(!UI._qty)UI._qty={};
  root.querySelectorAll('.qty').forEach(q=>{
    const key=q.dataset.qk,inp=q.querySelector('input'),out=q.querySelector('.qn'),max=+q.dataset.qmax;
    const paint=(v)=>{out.textContent=v;inp.style.setProperty('--p',(max>1?(v-1)/(max-1)*100:100).toFixed(1)+'%');};
    const set=(v,fin)=>{v=Math.max(1,Math.min(max,Math.round(v)));inp.value=v;UI._qty[key]=v;paint(v);if(onChange)onChange(key,v,fin);};
    inp.addEventListener('pointerdown',()=>{UI._qDrag=true;},{passive:true});
    inp.oninput=()=>set(+inp.value,false);
    inp.onchange=()=>{UI._qDrag=false;set(+inp.value,true);};
    q.querySelectorAll('[data-qd]').forEach(b=>{let rep=0,tm=0;const d=+b.dataset.qd;
      const step=()=>{const k=rep>12?Math.max(1,Math.round(max/40)):rep>5?Math.max(1,Math.round(max/100)):1;set(+inp.value+d*k,false);rep++;};
      const stop=()=>{if(tm){clearTimeout(tm);tm=0;if(rep>0){SFX.ui();set(+inp.value,true);}}};
      b.addEventListener('pointerdown',e=>{e.preventDefault();rep=0;step();const loop=()=>{tm=setTimeout(()=>{step();loop();},rep>1?70:380);};loop();});
      b.addEventListener('pointerup',stop);b.addEventListener('pointerleave',stop);b.addEventListener('pointercancel',stop);
      b.onclick=(e)=>{e.preventDefault();};});
    if(onChange)onChange(key,+inp.value,false);
  });
}
window.addEventListener('pointerup',()=>{UI._qDrag=false;},{passive:true});
const casinoState={
  game:'wheel',oreId:null,amount:1,spinning:false,
  wheelRot:0,wheelResult:null,betType:'big',diceResult:null,cupsState:null
};
