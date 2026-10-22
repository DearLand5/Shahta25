// node compare.js <id моба> <прототип.js|-> <куда.png без расширения> [состояние атаки] — «было/стало»: Иллюзия, Истина, атака крупно и в размере игры
// прототип переопределяет LM_MODEL.<id>=function(...){...}; «-» — только текущая модель
const { chromium } = require('playwright');
const [id,proto,out,atk]=[process.argv[2],process.argv[3],process.argv[4],process.argv[5]||'crouch'];
(async()=>{
  const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
  const p=await b.newPage({viewport:{width:1500,height:1000}});
  const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('file://'+require('path').resolve(__dirname,'../../../../index.html'));await p.waitForTimeout(1200);
  await p.evaluate(()=>{UI.clear();const cv=document.createElement('canvas');cv.width=1500;cv.height=1000;cv.style.cssText='position:fixed;left:0;top:0;z-index:99999';document.body.appendChild(cv);window.__g=cv.getContext('2d');});
  const draw=async(row,label,clear)=>p.evaluate(([id,atk,row,label,clear])=>{
    const g=window.__g;if(clear){const bg=g.createLinearGradient(0,0,0,1000);bg.addColorStop(0,'#241a30');bg.addColorStop(1,'#140e1c');g.fillStyle=bg;g.fillRect(0,0,1500,1000);}
    const d=(typeof LIL_MOBS!=='undefined'?LIL_MOBS:[]).concat(MOBDEFS).find(q=>q.id===id);
    const cols=[['Иллюзия',false,'idle'],['Истина',true,'idle'],['Истина — атака',true,atk]];
    cols.forEach(([lab,T,st],c)=>{
      const cx=210+c*360,cy=row*480+330;
      g.fillStyle='#2e2238';g.fillRect(cx-170,cy,340,40);
      veilT=T?1:0;G.time=10.3;
      const m={def:d,state:st,x:0,y:0,vx:0,vy:0,w:d.w,h:d.h,hp:d.hp,maxHp:d.hp,onGround:true,facing:1,anim:1.3,phase:0.4,st:0.3,timer:0,hurt:0,age:5,atkCd:0,dashT:0,tele:st==='idle'?0:0.85,teleUp:false,cd:1,alpha:1,tf:T,lookX:0.3,lookY:0.1,ext:0,frz:0,ax:300,ay:-40};
      g.save();g.translate(cx,cy);g.scale(7,7);drawMobSprite(g,m,G.time);g.restore();
      g.fillStyle='#e8dcc8';g.font='16px sans-serif';g.textAlign='center';g.fillText(label+': '+lab,cx,cy+26);
    });
    /* в игре: масштаб 1.6 на фоне породы */
    const x0=1110,y0=row*480+60;g.fillStyle='#3a2a46';g.fillRect(x0,y0,360,330);g.fillStyle='#4e3a5c';g.fillRect(x0,y0+250,360,80);
    cols.forEach(([lab,T,st],c)=>{veilT=T?1:0;const m={def:d,state:st,x:0,y:0,vx:0,vy:0,w:d.w,h:d.h,hp:d.hp,maxHp:d.hp,onGround:true,facing:1,anim:1.3,phase:0.4,st:0.3,timer:0,hurt:0,age:5,atkCd:0,dashT:0,tele:st==='idle'?0:0.85,teleUp:false,cd:1,alpha:1,tf:T,lookX:0.3,lookY:0.1,ext:0,frz:0,ax:300,ay:-40};
      g.save();g.translate(x0+60+c*120,y0+250-(d.h/2)*1.8);g.scale(1.8,1.8);drawMobSprite(g,m,G.time);g.restore();});
    g.fillStyle='#e8dcc8';g.font='14px sans-serif';g.textAlign='center';g.fillText('размер как в игре',x0+180,y0+320);
  },[id,atk,row,label,clear]);
  await draw(0,'Было',true);
  if(proto!=='-')await p.addScriptTag({path:proto});
  await draw(1,'Стало',false);
  await p.screenshot({path:out+'-cmp.png'});
  console.log(errs.length?errs:'ok');await b.close();
})();
