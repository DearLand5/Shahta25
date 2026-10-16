// Честный бот-боец для баланса боссов (см. CLAUDE.md, «Новый босс»).
// Запуск из корня репозитория:  NODE_PATH=$(npm root -g) node tools/boss-bot.js herald:7:3 mother:8:3
//   id:снаряжение[:попыток], снаряжение 7..10 или max. Переменные: MAXT (сек. боя, 300), PAR (параллельно, 4),
//   MISS (доля прозёванных коронных, 0.25), LOG=1 — урон по источникам.
// Бот смертен, пьёт аптечки из пояса (<45% здоровья), уворачивается от коронных ударов (с промахом MISS),
// держится на расстоянии и подходит с мечом в окна, обходит лаву и кислоту. От обычных атак НЕ уворачивается —
// живой игрок сильнее бота. Выводит: победа/смерть, время, сколько коронных попало, аптечек, причина смерти.
const { chromium } = require('playwright');
const ROOT=process.env.ROOT||require('path').resolve(__dirname,'..');const MAXT=+(process.env.MAXT||300);
(async()=>{
  const jobs=[];for(const r of process.argv.slice(2)){const [id,tier,n]=r.split(':');for(let i=0;i<(+n||3);i++)jobs.push({id,tier});}
  const b=await chromium.launch({executablePath:process.env.CHROMIUM||'/opt/pw-browsers/chromium'});
  const res={};
  const one=async({id,tier})=>{
    const p=await (await b.newContext({viewport:{width:390,height:780}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
    await p.goto('file://'+ROOT+'/index.html');await p.waitForTimeout(900);
    const T=tier==='max'?10:Math.min(10,+tier),GN=tier==='max'?11:+tier;
    await p.evaluate(`UI.clear();switchDimension(1);player.pickLvl=player.swordLvl=player.armorLvl=${T};player.gunLvl=${GN};player.gunAmmo=99999;player.potions=30;player.hitems=player.hitems||{};player.hitems.totems=0;recomputeStats();player.hp=player.maxHp;enterMine();UI.clear();
      hbCheat('hbTp_${id}');UI.clear();hbCheat('hbSeals');UI.clear();hbStart(hbById('${id}'));G.bossCut.t=G.bossCut.dur-0.1;G.shootItem='gun';
      window.R={dead:false,win:false,t0:-1,ults:0,ultHit:0,pots:0,killer:'',hpMin:1};
      const od=playerDie;playerDie=function(){R.dead=true;R.t=G.time-R.t0;try{R.killer=Object.entries(window.__dmgLog||{}).sort((a,b)=>b[1]-a[1]).slice(0,2).map(x=>x[0]).join(',');}catch(e){}};
      window.__dmgLog={};
      const ouf=bfUltFire;bfUltFire=function(u){R.ults++;const h=player.hp;ouf(u);if(player.hp<h)R.ultHit++;};
      const omk=bfMedkit;bfMedkit=function(){const n=G.bf.pots;omk();if(G.bf.pots<n)R.pots++;};
      let lastHitT=0;
      setInterval(()=>{if(R.dead)return;const H=hbFight();
        if(!H){if(R.t0>=0&&!R.win){R.win=true;R.t=G.time-R.t0;}return;}
        if(G.bossCut)return;if(R.t0<0)R.t0=G.time;const m=H.m;
        R.hpMin=Math.min(R.hpMin,player.hp/player.maxHp);
        const F=G.bf,u=F&&F.u;let want=0;
        const dx=m.x-player.x;
        if(u&&u._miss===undefined)u._miss=Math.random()<${process.env.MISS||0.25};   /* как живой игрок: иногда прозёвывает */
        if(u&&!u.fired&&!u._miss){
          if(u.type==='gap'){let best=null,bd=1e9;for(const [a,b2] of u.gaps){const c=(a+b2)/2,d=Math.abs(c-player.x);if(d<bd){bd=d;best=c;}}want=Math.abs(best-player.x)>12?Math.sign(best-player.x):0;
            if(u.t>u.warn-0.15&&bfInUlt(u))bfDash(Math.sign(best-player.x));}
          else if(u.type==='quake'){want=0;if(u.t>u.warn-0.28&&player.onGround)Input.jumpPressed=true;}
          else if(u.type==='beam'){want=0;if(u.t>0.6&&player.onGround&&Math.abs((player.y-player.h*0.5)-u.y)<1.5*TILE&&u.t>u.warn-0.3)Input.jumpPressed=true;if(u.t>u.warn-0.1&&bfInUlt(u))bfDash(-Math.sign(dx)||1);}
          else if(u.type==='nova'){want=-Math.sign(u.x-player.x)||1;if(u.t>u.warn-0.12&&bfInUlt(u))bfDash(want);}
        }else{
          /* в окна — вплотную с мечом, иначе держится на расстоянии выстрела и вне луж */
          const win=bfWindow(),near=win?m.w*0.5+40:m.w*0.55+90,far=win?m.w*0.3:m.w*0.55+40;
          want=Math.abs(dx)>near?Math.sign(dx):(Math.abs(dx)<far?-Math.sign(dx||1):0);
          if(typeof patches!=='undefined')for(const q of patches){if(Math.abs(player.x-q.x)<q.w*0.5+8&&Math.abs(player.y-q.y)<30){want=Math.sign(player.x-q.x)||1;break;}}
          const dy=(m.y-m.h*0.5)-(player.y-player.h*0.5);if(dy<-70&&player.onGround)Input.jumpPressed=true;
          /* лечится, когда здоровья меньше 45% и рядом нет коронного */
          if(player.hp<player.maxHp*0.45&&medkitAvail()>0&&!(player.potionCd>0)&&!(player.healLeft>0)){const s=G.shootItem;G.shootItem='medkit';useShoot(false);G.shootItem=s;}
        }
        /* не лезет в лаву и кислоту: стоп у края; если уже в ней — выпрыгивает */
        {const bad=(x,y)=>{const t=getTile(Math.floor(x/TILE),Math.floor(y/TILE));return t===T_LAVA||isLiq(t);};
          if(bad(player.x,player.y-4)||bad(player.x,player.y+4)){Input.jumpPressed=true;
            /* к ближайшему сухому месту */
            let best=0,bd=1e9;for(let k=-14;k<=14;k++){if(!k)continue;const x=player.x+k*TILE,ty=Math.floor((player.y+4)/TILE);const tt=getTile(Math.floor(x/TILE),ty);if(isSolid(Math.floor(x/TILE),ty)&&tt!==T_LAVA&&Math.abs(k)<bd){bd=Math.abs(k);best=Math.sign(k);}}
            want=best||want||1;}
          else if(want&&(bad(player.x+want*26,player.y+6)||bad(player.x+want*26,player.y+40)))want=0;}
        Input.keys.ArrowRight=want>0;Input.keys.ArrowLeft=want<0;
        Input.shootPtr=1;player.gunAmmo=99999;},50);`);
    const t0=Date.now();
    while(Date.now()-t0<MAXT*1000*2.2){await p.waitForTimeout(2000);
      const s=await p.evaluate(`({d:R.dead,w:R.win,gt:R.t0<0?0:G.time-R.t0})`).catch(()=>({d:true}));if(s.d||s.w||s.gt>MAXT)break;}
    const r=await p.evaluate(`({...R,log:Object.fromEntries(Object.entries(window.__dmgLog||{}).map(([k,v])=>[k,Math.round(v)])),t:R.t||G.time-R.t0,bossLeft:hbFight()?Math.round(hbFight().m.hp/hbFight().m.maxHp*100):0,enr:!!(G.bf&&G.bf.enr)})`);
    const k=id+':'+tier;(res[k]=res[k]||[]).push(r);
    if(process.env.LOG)console.log(JSON.stringify(r.log||{}));console.log(k.padEnd(14),r.win?'ПОБЕДА':r.dead?'смерть':'время ',String(Math.round(r.t)+'с').padStart(5),'босс',String(r.bossLeft+'%').padStart(4),'коронных',r.ultHit+'/'+r.ults,'аптечек',r.pots,'мин.hp',Math.round(r.hpMin*100)+'%',r.killer||'',errs.slice(0,1).join(''));
    await p.context().close();
  };
  const PAR=+(process.env.PAR||4);await Promise.all(Array.from({length:PAR},async()=>{while(jobs.length)await one(jobs.shift());}));
  console.log('--- итог');for(const k in res){const a=res[k],w=a.filter(x=>x.win);console.log(k.padEnd(14),'побед',w.length+'/'+a.length,'ср.время победы',w.length?Math.round(w.reduce((s,x)=>s+x.t,0)/w.length)+'с':'-');}
  await b.close();
})();
