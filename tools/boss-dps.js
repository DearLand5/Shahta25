// Бессмертный бот-замерщик (см. CLAUDE.md, «Новый босс»): сколько секунд бьётся босс и сколько продержался бы шахтёр.
// Запуск из корня репозитория:  NODE_PATH=$(npm root -g) node tools/boss-dps.js herald:7 mother:8:turtle
//   id:снаряжение[:режим]; режим turtle — шахтёр застраивается лестницами вверх и стреляет сверху (проверка «отсидки»).
// Меряет по ИГРОВОМУ времени: урон в секунду по боссу -> ttk (время боя), входящий урон -> ttd (жизнь без уворотов и аптечек).
// Переменные: SEC (сек. замера, 40), PAR (параллельно, 3).
const { chromium } = require('playwright');
const ROOT=process.env.ROOT||require('path').resolve(__dirname,'..');const SEC=+(process.env.SEC||40);
(async()=>{
  const runs=process.argv.slice(2);
  const b=await chromium.launch({executablePath:process.env.CHROMIUM||'/opt/pw-browsers/chromium'});
  const one=async(r)=>{const [id,tier,mode]=r.split(':');
    const p=await (await b.newContext({viewport:{width:390,height:780}})).newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
    await p.goto('file://'+ROOT+'/index.html');await p.waitForTimeout(900);
    const T=tier==='max'?10:Math.min(10,+tier),GN=tier==='max'?11:+tier;
    await p.evaluate(`UI.clear();switchDimension(1);player.pickLvl=player.swordLvl=player.armorLvl=${T};player.gunLvl=${GN};player.gunAmmo=99999;player.ladders=999;recomputeStats();player.hp=player.maxHp;enterMine();UI.clear();cheats.god=true;
      hbCheat('hbTp_${id}');UI.clear();hbCheat('hbSeals');UI.clear();hbStart(hbById('${id}'));G.bossCut.t=G.bossCut.dur-0.1;G.shootItem='gun';G.placeItem='ladder';
      window.S={dmg:0,taken:0,hits:0,t0:-1,n:0,src:{}};
      const od=damageMob;damageMob=function(m,d,kb,src){if(m.def.hb&&!m.copy){const h0=m.hp;od(m,d,kb,src);S.dmg+=Math.max(0,h0-m.hp);}else od(m,d,kb,src);};
      const oh=hurtPlayer;hurtPlayer=function(d,src,fx){if(G.bossCut||S.t0<0)return;const cd=player.hurtCd;player.hp=1e9;oh(d,src,fx);const got=1e9-player.hp;if(got>0){S.taken+=got;S.hits++;S.src[src]=(S.src[src]||0)+got;}player.hp=player.maxHp;};
      const MODE='${mode||''}';let climbT=0;
      setInterval(()=>{const H=hbFight();if(!H||G.bossCut)return;if(S.t0<0){S.t0=G.time;cheats.god=false;}const m=H.m;S.n++;
        if(MODE==='turtle'){
          /* «застроиться»: лезем вверх по своим лестницам и стреляем сверху */
          Input.keys.ArrowLeft=Input.keys.ArrowRight=false;
          const ty=Math.floor((player.y-player.h*0.5)/TILE),tx=Math.floor(player.x/TILE);
          if(window._y0===undefined)window._y0=player.y;
          /* лестница пропала (порвали) — строим заново, как живой игрок */
          if(player.y>_y0-8*TILE){if(!placedLadders.hasXY(tx,ty))usePlace();if(!placedLadders.hasXY(tx,ty-1)&&!isSolid(tx,ty-1))setTile(tx,ty-1,T_LADDER);
            Input.joy.active=true;Input.joy.id=-5;Input.joy.dx=0;Input.joy.dy=-1;Input.joy.mag=1;}
          else{Input.joy.active=false;Input.joy.dy=0;}
          climbT+=0.05;
        }else{
          const dx=m.x-player.x,want=Math.abs(dx)>m.w*0.5+40?Math.sign(dx):(Math.abs(dx)<m.w*0.3?-Math.sign(dx||1):0);
          Input.keys.ArrowRight=want>0;Input.keys.ArrowLeft=want<0;
          const dy=(m.y-m.h*0.5)-(player.y-player.h*0.5);if(dy<-70&&player.onGround)Input.jumpPressed=true;
        }
        Input.shootPtr=1;player.gunAmmo=99999;},50);`);
    let gt=0;const t0=Date.now();
    while(Date.now()-t0<(SEC*1000*3+20000)){await p.waitForTimeout(2000);gt=await p.evaluate(`S.t0<0?0:G.time-S.t0`).catch(()=>gt);
      const alive=await p.evaluate(`!!(G.hb&&G.hb.m&&G.hb.m.alive&&G.hb.m.hp>0)`).catch(()=>false);if(gt>=SEC||!alive)break;}
    const res=await p.evaluate(`(()=>{const H=G.hb;const m=H&&H.m;const gt=G.time-S.t0;return {gt:+gt.toFixed(1),maxHp:m?m.maxHp:0,left:m?Math.round(m.hp):0,ph:m?m.b.phase:0,dmg:Math.round(S.dmg),taken:Math.round(S.taken),hits:S.hits,php:player.maxHp,src:S.src};})()`);
    const dps=res.dmg/res.gt,inc=res.taken/res.gt;
    const ttk=res.maxHp?res.maxHp/dps:0,ttd=inc>0?res.php/inc:999;
    const top=Object.entries(res.src).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k,v])=>k+':'+Math.round(v/res.gt)).join(' ');
    console.log((id+':'+tier+(mode?':'+mode:'')).padEnd(20),'ttk',String(Math.round(ttk)+'s').padStart(5),' ttd',String(Math.round(ttd)+'s').padStart(5),' dps',Math.round(dps),' вход/с',Math.round(inc),' hp',res.php,' фаза',res.ph,' |',top,errs.slice(0,1).join(''));
    await p.context().close();
  };
  const PAR=+(process.env.PAR||3);const q=runs.slice();
  await Promise.all(Array.from({length:PAR},async()=>{while(q.length)await one(q.shift());}));
  await b.close();
})();
