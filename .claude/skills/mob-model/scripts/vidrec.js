/* видео мобов Лиловых небес в игре: node vidrec.js <корень> <папка кадров> [id,id|all] [сек на облик]
   каждый моб — своя арена; Иллюзия: прогулка, потом злится (мирные гуляют); Истина: бой. Шахтёр неуязвим (урон отключён). 30 к/с */
const { chromium } = require('playwright');const fs=require('fs');
const [ROOT,OUT,IDS,SEC]=[process.argv[2],process.argv[3],process.argv[4]||'all',+(process.argv[5]||4)];
fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const errs=[];
 const c=await b.newContext({viewport:{width:960,height:540}});const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript({path:__dirname+'/detinj.js'});
 await p.goto('file://'+ROOT+'/index.html');await p.waitForTimeout(700);
 await p.addStyleTag({content:'#lhintEl,.toast,#toast{display:none!important} #vlab{position:fixed;left:18px;top:14px;z-index:99999;font:22px "Russo One",sans-serif;color:#f4e8ff;text-shadow:0 2px 6px #000,0 0 2px #000;pointer-events:none} #vlab small{display:block;font:15px Rubik,sans-serif;color:#d8c8f0;margin-top:2px}'});
 const ids=await p.evaluate(()=>{__step(20);window.adaptRenderScale=function(){};UI.clear();G.seed=777;settings.waterAmount=0;switchDimension(2);enterMine();UI.clear();teleportToDepth(300);UI.clear();
   window.hurtPlayer=function(){};window.hudHidden=()=>true;window.autoAttackUpdate=function(){};view.scale=3;window.lsNightmareTick&&0;const _rm=renderMine;window.renderMine=function(dt){if(window._M&&G.scene==='mine'){G.cam.x=_M.x*0.65+player.x*0.35;G.cam.y=Math.min(player.y,_M.y)-24;}return _rm(dt);};
   const l=document.createElement('div');l.id='vlab';document.body.appendChild(l);
   return LIL_MOBS.map(d=>d.id);});
 const list=IDS==='all'?ids:IDS.split(',');let fr=0;const NF=SEC*30;
 for(const id of list)for(const TT of [0,1]){
   await p.evaluate(([id,TT])=>{UI.clear();mobs.length=0;deadMobs.length=0;if(window.lbLanReset)0;player.sanity=TT?1:100;veilT=TT;
     const px=Math.floor(player.x/TILE),py=Math.floor(player.y/TILE);for(let x=px-16;x<=px+16;x++)for(let y=py-9;y<=py+3;y++)setTile(x,y,(y>=py+1||Math.abs(x-px)>=15)?T_LSOD:T_AIR);
     player.y=(py+1)*TILE-0.1;player.vy=0;player.vx=0;player.facing=1;view.scale=3;
     const d=LIL_MOBS.find(q=>q.id===id);spawnMobAt(d,player.x+(d.fly?90:120),player.y-(d.fly?50:4));const m=mobs[mobs.length-1];window._M=m;m.tf=!!TT;
     const tm={p:'мирный',n:'нейтральный',h:'враг'}[LM_TEMPER[id]]||'';
     document.getElementById('vlab').innerHTML=d.name+'<small>'+(TT?'Истина — бой':'Иллюзия — '+tm+(LM_TEMPER[id]==='p'?', гуляет':', гуляет, потом злится'))+'</small>';
     __step(12);},[id,TT]);
   for(let f=0;f<NF;f++){
     await p.evaluate(([TT,f,NF])=>{__step(2);if(!mobs.includes(_M)){const d=_M.def;spawnMobAt(d,player.x+(d.fly?90:120),player.y-(d.fly?50:4));_M=mobs[mobs.length-1];}
       player.sanity=TT?1:100;veilT=TT;player.vx*=0.5;if(Math.abs(player.x-(window._PX||(window._PX=player.x)))>40)player.x=window._PX;
       if(!TT&&f===Math.floor(NF*0.5))_M.provoked=999;},[TT,f,NF]);
     await p.screenshot({path:`${OUT}/f${String(fr++).padStart(5,'0')}.png`});}
   process.stdout.write(id+(TT?'T ':'I '));
   await p.evaluate(()=>{window._PX=undefined;});}
 console.log('\n',errs.length?errs.slice(0,5):'ok',fr);await b.close();})();
