'use strict';
/* ============================================================
   ВЛАДЫКИ ПРЕИСПОДНЕЙ: интерфейс.
   Полоска здоровья и титры катсцены, вкладка «Призыв» в Алтаре душ,
   портал «Лиловые небеса», бестиарий, мини-карта, свет, тест-панель.
   ============================================================ */
Object.assign(MOB_LORE,{
  hb_herald:'Глашатай пепельной бури. Трубит в горн из рога древнего зверя — и Пустоши отвечают ему ветром, смерчами и стаями угольных мышей.',
  hb_mother:'Утроба Кровавых копей. Срослась с камнем жилами и рожает всё мясо, что ползает в копях. Когда ей больно — вырывает корни.',
  hb_toadking:'Владыка серных купален. Язык ловит добычу с полусотни шагов, корона из серы на спине светится в темноте.',
  hb_emperor:'Властелин Катакомб. Его кисти живут отдельно от тела, а отражения в 3-й фазе не отличить от настоящего.',
  hb_warden:'Страж Огненного ядра, скованный цепями в лавовом озере. Ядро в груди раскрывается, когда он бьёт кулаком.',
  hb_archdemon:'Владыка Преисподней. Хранит Ключ Лиловых небес. Вдвое больше Пожирателя Бездны.'
});

/* ---------- полоска здоровья ---------- */
function hbDrawBar(ctx,boss,W,top){
  const H=hbById(boss.def.hb),B=boss.b||{phase:1},n=boss.def.hbPhases||3;
  /* тонкая полоска сразу под верхней панелью: на телефоне мини-карта в бою скрыта, поле боя свободно */
  const narrow=W<600,by=narrow?HUDL.rb+6:top+30,bw=narrow?W-20:Math.min(W-40,460),bx=W/2-bw/2,bh=narrow?6:8;
  ctx.save();
  ctx.fillStyle='rgba(10,6,8,.78)';roundRect(ctx,bx-5,by-3,bw+10,bh+20,7);ctx.fill();
  ctx.strokeStyle=hexA(H.col,0.45);ctx.lineWidth=1;roundRect(ctx,bx-5,by-3,bw+10,bh+20,7);ctx.stroke();
  const f=clamp(boss.hp/boss.maxHp,0,1),yb=by+12;
  boss._hpShow=boss._hpShow===undefined?f:Math.max(f,boss._hpShow-0.25/60);
  ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(bx,yb,bw,bh);
  ctx.fillStyle='rgba(255,240,220,.45)';ctx.fillRect(bx,yb,bw*boss._hpShow,bh);
  const gg=ctx.createLinearGradient(bx,0,bx+bw,0);gg.addColorStop(0,shadeHex(H.col,-0.35));gg.addColorStop(1,H.col);
  ctx.fillStyle=gg;ctx.fillRect(bx,yb,bw*f,bh);ctx.fillStyle='rgba(255,255,255,.2)';ctx.fillRect(bx,yb,bw*f,1.5);
  ctx.fillStyle='rgba(255,255,255,.55)';for(let k=1;k<n;k++)ctx.fillRect(bx+bw*k/n-1,yb-2,2,bh+4);
  if(boss.invuln>0&&B.atk==='trans'){ctx.fillStyle='rgba(255,255,255,'+(0.2+0.2*Math.sin(G.time*20))+')';ctx.fillRect(bx,yb,bw*f,bh);}
  /* шкала оглушения */
  const th=boss.maxHp*(boss.def.hb==='archdemon'?0.05:0.075),sg=B.stagT>0?1:clamp((B.stag||0)/th,0,1);
  ctx.fillStyle=B.stagT>0?'rgba(255,224,112,'+(0.6+0.4*Math.sin(G.time*14))+')':'rgba(255,224,112,.75)';ctx.fillRect(bx,yb+bh+1.5,bw*sg,2);
  ctx.fillStyle='#f6e8d8';ctx.font='700 '+(narrow?10:11.5)+'px '+HUDF;ctx.textAlign='left';
  ctx.fillText(boss.def.name.toUpperCase(),bx,by+8);
  ctx.textAlign='right';ctx.fillStyle=B.weak>0?'#ffd060':'#d8c8b8';ctx.fillText(B.stagT>0?'ОГЛУШЁН':B.weak>0?'ОТКРЫТ':'фаза '+B.phase+'/'+n,bx+bw,by+8);
  ctx.restore();
}
/* ---------- титры катсцены, вспышки, итоги боя ---------- */
function hbDrawCutHud(ctx,W,H){
  const c=G.bossCut,t=c.t,Hb=hbById(c.hb),lb=Math.min(1,t/0.6,(c.dur-t)/0.6),bh=H*0.11*lb;
  ctx.fillStyle='#000';ctx.fillRect(0,0,W,bh);ctx.fillRect(0,H-bh,W,bh);
  const t0=c.roarT-0.1,t1=c.dur-0.5;
  if(t>t0&&t<t1){const a=Math.min(1,(t-t0)/0.5,(t1-t)/0.5);ctx.save();ctx.globalAlpha=a;ctx.textAlign='center';
    const sp=Math.max(0,1-(t-t0)/0.9),ty=W<H?H*0.24:H*0.74;
    const nm=Hb.name.toUpperCase(),ls=2+sp*16;let fs=c.hb==='archdemon'?40:34;
    ctx.font=fs+'px "Russo One",'+HUDF;while(fs>14&&ctx.measureText(nm).width+ls*nm.length>W-24){fs-=1;ctx.font=fs+'px "Russo One",'+HUDF;}
    ctx.font='12px '+HUDF;ctx.fillStyle=hexA(Hb.col,0.9);if(ctx.letterSpacing!==undefined)ctx.letterSpacing='4px';ctx.fillText(Hb.place.toUpperCase(),W/2,ty-fs-6);
    if(ctx.letterSpacing!==undefined)ctx.letterSpacing=ls+'px';
    ctx.font=fs+'px "Russo One",'+HUDF;ctx.shadowColor=Hb.col;ctx.shadowBlur=20;ctx.fillStyle='#fff2e0';ctx.fillText(nm,W/2,ty);ctx.shadowBlur=0;
    if(ctx.letterSpacing!==undefined)ctx.letterSpacing='0px';
    ctx.font='600 13px '+HUDF;ctx.fillStyle='#e0cbb0';ctx.fillText(Hb.title,W/2,ty+22);
    ctx.restore();}
}
function hbDrawHudFx(ctx,W,H){
  if(G.scene!=='mine')return;
  if(G.hbWind&&hbFight()){ctx.save();ctx.strokeStyle='rgba(200,185,170,.28)';ctx.lineWidth=1.4;
    for(let k=0;k<40;k++){const y=(k*53.7)%H,x=((k*197+G.time*900*G.hbWind)%(W+200)+W+200)%(W+200)-100;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-G.hbWind*60,y+2);ctx.stroke();}
    ctx.fillStyle='rgba(120,100,85,.14)';ctx.fillRect(0,0,W,H);ctx.restore();}
  if(G.hbFlash&&G.hbFlash.t>0){ctx.fillStyle=hexA(G.hbFlash.col||'#ffffff',Math.min(0.7,G.hbFlash.t*0.55));ctx.fillRect(0,0,W,H);}
  const o=G.hbOutro;
  if(o&&o.t>0){const a=Math.min(1,o.t,(5.5-o.t)*2);ctx.save();ctx.globalAlpha=a;ctx.textAlign='center';
    ctx.fillStyle='rgba(0,0,0,.4)';ctx.fillRect(0,H*0.32,W,H*0.2);
    ctx.font=Math.min(30,W*0.068)+'px "Russo One",'+HUDF;ctx.fillStyle='#ffe0a0';ctx.shadowColor=o.b.col;ctx.shadowBlur=14;
    ctx.fillText(o.b.name.toUpperCase()+hbG(o.b,' ПОВЕРЖЕН',' ПОВЕРЖЕНА'),W/2,H*0.39);ctx.shadowBlur=0;
    ctx.font='600 13px '+HUDF;ctx.fillStyle='#f0dcc8';
    const tr=o.b.trophy?MATS[o.b.trophy].ic+' '+MATS[o.b.trophy].n:'🗝 Ключ Лиловых небес';
    ctx.fillText(tr+' · +'+fmt(o.souls)+' душ · +'+fmt(o.coins)+' монет',W/2,H*0.39+24);
    if(!o.b.trophy)ctx.fillText('Врата Пустоты в лобби Ада ждут. Лиловые небеса откроются в следующем обновлении.',W/2,H*0.39+44);
    else{const left=HB_MINIS.filter(b=>!hbKills(b.id)).length;ctx.fillText(left?'Осталось Владык: '+left:'Все пять трофеев собраны — создай Печать Преисподней!',W/2,H*0.39+44);}
    ctx.restore();}
}

/* ---------- Алтарь душ: вкладка «Призыв» ---------- */
function hbAltarBody(){
  const P=hbProg();
  let h=`<p class="tiny" style="margin-bottom:6px">Печать открывает святилище Владыки в его биоме. Положи её на постамент внутри святилища — и бой начнётся. С каждого Владыки падает трофей; пять трофеев складываются в Печать Преисподней.</p>`;
  for(const r of HB_RECIPES){
    const b=hbById(r.boss),M=MATS[r.id],k=P.kills[r.boss]|0,have=matN(r.id);
    const cost={c:r.c,m:r.m,s:r.s};
    const where=b===HB_FINAL?'Трон Преисподней · '+b.y0+' м':b.place+' · '+BIOMES[b.bi].n+' · '+(b.y0+b.FY)+' м';
    h+=`<div class="item" style="flex-wrap:wrap;border-color:${hexA(b.col,0.45)}"><div class="ico" style="background:${hexA(b.col,0.16)};display:flex;align-items:center;justify-content:center;font-size:16px">${M.ic}</div>
      <div class="txt"><div class="nm">${M.n}${have?' · <b style="color:#7dffb0">есть '+have+'</b>':''}</div>
      <div class="ds">${b.name} — ${where}${k?' · побед: '+k:''}</div>
      <div class="cost">${costChips(cost)}</div></div>
      <button class="btn small" data-seal="${r.id}" ${canPay(cost)?'':'disabled'}>Создать</button></div>`;
  }
  const tr=HB_MINIS.map(b=>{const M=MATS[b.trophy],n=matN(b.trophy);return `<span class="${n?'':'no'}" style="border-left:3px solid ${M.col}">${M.ic} ${M.n} ${n}</span>`;}).join('');
  h+=`<p class="tiny" style="margin:8px 0 4px">Трофеи Владык:</p><div class="cost">${tr}</div>`;
  if(player.prog.lilacKey)h+=`<p class="tiny" style="margin-top:8px;color:#d8b8ff">🗝 Ключ Лиловых небес у тебя.</p>`;
  return h;
}
function hbAltarBind(d){
  d.querySelectorAll('[data-seal]').forEach(b=>b.onclick=()=>{
    const r=HB_RECIPES.find(q=>q.id===b.getAttribute('data-seal'));const cost={c:r.c,m:r.m,s:r.s};
    if(!canPay(cost))return;pay({c:r.c,m:r.m});spendSouls(r.s);addMat(r.id,1);
    SFX.portal();vib(60);UI.toast(MATS[r.id].ic+' '+MATS[r.id].n+' создана');saveGame();UI.altar('summon');});
}

/* ---------- Врата Пустоты: путь в Лиловые небеса ---------- */
const LILAC_COST={c:40000000,s:6666};
function lilacReqs(){
  const P=player,F=furn(),bots=bot().units.length;
  return [
    {ok:P.pickLvl>=10,t:'⛏ Кирка',v:'ур. '+Math.min(P.pickLvl,10)+'/10'},
    {ok:P.swordLvl>=10,t:'⚔️ Меч',v:'ур. '+Math.min(P.swordLvl,10)+'/10'},
    {ok:P.armorLvl>=10,t:'🛡 Броня',v:'ур. '+Math.min(P.armorLvl,10)+'/10'},
    {ok:P.gunLvl>=11,t:'🔫 Огнестрел',v:'ур. '+Math.min(P.gunLvl,11)+'/11'},
    {ok:(P.digSpeedLvl||0)>=DIG_SPEED_HMAX,t:'⚡ Адская скорость копания',v:(P.digSpeedLvl||0)+'/'+DIG_SPEED_HMAX},
    {ok:!!P.drillBought&&P.drillLvl>=10,t:'🛠️ Мощность бура',v:(P.drillBought?P.drillLvl:0)+'/10'},
    {ok:(F.lvl||0)>=3,t:'🔥 Мехи и горны Печи',v:(F.lvl||0)+'/3'},
    {ok:bots>=BOT_MAX,t:'🤖 Роботы-сортировщики',v:bots+'/'+BOT_MAX},
    {ok:!!P.prog.lilacKey,t:'🗝 Ключ Лиловых небес',v:P.prog.lilacKey?'есть':'Архидемон, Трон Преисподней',key:1},
    {ok:P.money>=LILAC_COST.c||cheats.infMoney,t:'💰 40 000 000 монет',v:fmt(P.money)+' / '+fmt(LILAC_COST.c),key:1},
    {ok:(P.souls||0)>=LILAC_COST.s,t:'👻 6 666 душ',v:fmt(P.souls||0)+' / '+fmt(LILAC_COST.s),key:1}
  ];
}
UI.portal3=function(){
  if(player.prog.lilacOpen){   /* врата уже открыты — путь свободный */
    const d=this.build('portal3',`
      <div class="card hell" style="max-width:440px;width:96vw;text-align:center">
        <h3 style="text-align:center">🕳 Врата Пустоты</h3>
        <div class="lilacGate keyed open"></div>
        <p class="muted">Врата открыты навсегда. За ними — <b style="color:#d8b8ff">Лиловые небеса</b> и Деревня Вечного Рассвета.</p>
      </div>
      <button class="btn" id="p3Go">🌸 В Лиловые небеса</button>
      <button class="btn alt" id="p3Home">🌄 Вернуться на Землю надежды</button>
      <button class="btn alt" id="p3Back">Закрыть</button>`);
    SFX.portal();
    d.querySelector('#p3Go').onclick=()=>startCutscene(2);
    d.querySelector('#p3Home').onclick=()=>startCutscene(0);
    d.querySelector('#p3Back').onclick=()=>{SFX.uiBack();UI.close();};
    return;
  }
  const reqs=lilacReqs(),all=reqs.every(r=>r.ok);
  const d=this.build('portal3',`
    <div class="card hell" style="max-width:480px;width:96vw;text-align:center">
      <h3 style="text-align:center">🕳 Врата Пустоты</h3>
      <div class="lilacGate${player.prog.lilacKey?' keyed':''}"></div>
      <p class="muted">За вратами — <b style="color:#d8b8ff">Лиловые небеса</b>, третье измерение. Врата откроются лишь тому, кто покорил Ад целиком.</p>
      ${reqs.map(r=>`<div class="chk ${r.ok?'ok':'no'}">${r.ok?'✔':'✘'} ${r.t}<b>${r.v}</b></div>`).join('')}
      <p class="tiny" style="margin-top:8px">40 000 000 монет и 6 666 душ уйдут на открытие врат, Ключ останется у тебя. Врата откроются навсегда.</p>
    </div>
    <button class="btn" id="p3Open" ${all?'':'disabled'}>🌌 Открыть врата</button>
    <button class="btn alt" id="p3Home">🌄 Вернуться на Землю надежды</button>
    <button class="btn alt" id="p3Back">Закрыть</button>`);
  SFX.portal();
  d.querySelector('#p3Open').onclick=()=>{
    if(!lilacReqs().every(r=>r.ok)){UI.toast('Не все условия выполнены');return;}
    /* ключ остаётся у шахтёра (он нужен и дальше), монеты и души уходят на открытие */
    if(!cheats.infMoney)player.money-=LILAC_COST.c;
    player.souls=(player.souls||0)-LILAC_COST.s;
    player.prog.lilacOpen=true;
    SFX.portal();vib(80);saveGame();
    startCutscene(2);
  };
  d.querySelector('#p3Home').onclick=()=>startCutscene(0);
  d.querySelector('#p3Back').onclick=()=>{SFX.uiBack();UI.close();};
};

/* ---------- мини-карта: святилища ---------- */
function hbMinimap(g,toS,r){
  if(G.dim!==1)return;
  g.textAlign='center';g.textBaseline='middle';
  for(const b of HB_ALL){const [sx,sy]=toS(b.x0+b.W/2,b.y0+b.FY-3);
    if(sx<r.x-10||sx>r.x+r.s+10||sy<r.y-10||sy>r.y+r.s+10)continue;
    const [x0,y0]=toS(b.x0,b.y0),[x1,y1]=toS(b.x0+b.W,b.y0+b.H);
    g.strokeStyle=hexA(b.col,0.8);g.lineWidth=1.4;g.strokeRect(x0,y0,x1-x0,y1-y0);
    g.fillStyle='rgba(0,0,0,.6)';g.beginPath();g.arc(sx,sy,7,0,TAU);g.fill();
    g.fillStyle=b.col;g.font='bold 10px system-ui';g.fillText(hbKills(b.id)?'✔':b===HB_FINAL?'🔱':'☠',sx,sy+0.5);}
}
/* ---------- свет: святилища освещены жаровнями ---------- */
const HB_LIGHTS={herald:[[11,-1,4],[44,-1,4],[28,-7,3.4]],mother:[[3,-1,4],[52,-1,4],[28,-6,3]],toadking:[[4,-1,3],[52,-1,3],[20,0,3],[35,0,3]],
  emperor:[[3,-1,3],[7,-1,3],[48,-1,3],[52,-1,3],[28,-9,4]],warden:[[2,-3,5],[53,-3,5],[20,0,4],[35,0,4]],
  archdemon:[[14,-1,5],[26,-1,5],[36,-1,5],[60,-1,5],[70,-1,5],[82,-1,5],[3,-12,6],[92,-12,6],[48,-12,7]]};
function hbLightDark(){const b=hbAt(player.x,player.y-4);return b?(b===HB_FINAL?0.5:0.58):-1;}
function hbLightHoles(hole,W,H,sc){
  if(G.dim!==1)return;
  for(const b of HB_ALL){
    const cy=(b.y0+b.H/2)*TILE;if(Math.abs(cy-G.cam.y)>(H/sc)*0.5+b.H*TILE*0.6)continue;
    for(const [lx,dy,r] of HB_LIGHTS[b.id]){const x=(b.x0+lx)*TILE+16,y=(b.y0+b.FY+dy)*TILE;
      hole((x-G.cam.x)*sc+W/2,(y-G.cam.y)*sc+H/2,r*TILE*sc,0.85);}
    const p=hbPedPx(b);hole((p.x-G.cam.x)*sc+W/2,(p.y-40-G.cam.y)*sc+H/2,3*TILE*sc,0.7);
  }
}
/* ---------- тест-панель ---------- */
function hbCheatHtml(act){
  return `<div class="sect">Владыки Преисподней</div><div class="cheatGrid">
    ${HB_ALL.map(b=>act('hbTp_'+b.id,'➜ '+b.place)).join('')}
    ${act('hbSeals','🔱 Все печати')}${act('hbTroph','🏆 Все трофеи')}${act('hbPhase','⏭ Фаза Владыки')}${act('hbKill','💀 Добить Владыку')}${act('hbReset','↺ Сбросить победы')}</div>`;
}
function hbCheat(a){
  if(a.startsWith('hbTp_')){const b=hbById(a.slice(5));if(!b)return true;if(G.dim!==1){UI.toast('Только в Аду');return true;}
    if(G.scene!=='mine'){enterMine();}
    hbAbort();mobs=mobs.filter(m=>m.def.boss);const p=hbPedPx(b);player.x=p.x-3*TILE;player.y=p.y-2;player.vx=player.vy=0;player.peakY=player.y;
    G.cam.x=player.x;G.cam.y=player.y;G.hbAsk=null;UI.clear();return true;}
  switch(a){
    case 'hbSeals':for(const r of HB_RECIPES)addMat(r.id,1);UI.toast('🔱 Выданы все печати');saveGame();break;
    case 'hbTroph':for(const b of HB_MINIS)addMat(b.trophy,1);UI.toast('🏆 Выданы все трофеи');saveGame();break;
    case 'hbPhase':{const H=hbFight();if(!H){UI.toast('Владыка не призван');break;}const m=H.m,n=m.def.hbPhases||3;m.invuln=0;m.hp=Math.min(m.hp,m.maxHp*(1-(m.b.phase)/n)-1);UI.clear();return true;}
    case 'hbKill':{const H=hbFight();if(!H){UI.toast('Владыка не призван');break;}H.m.invuln=0;H.m.hp=1;damageMob(H.m,10,0,null);UI.clear();return true;}
    case 'hbReset':hbProg().kills={};player.prog.lilacKey=false;UI.toast('Победы над Владыками сброшены');saveGame();break;
    default:return false;
  }
  return true;
}
