/* лист анимации модели моба Лиловых небес без кэша:
   node lmanim.js <корень> <id> <out.png> [состояния через запятую, напр. crouch,leap]
   строки: Иллюзия и Истина × (покой, ход, прыжок/полёт, каждое состояние с замахом tele 0→1); 12 кадров через 0.083 с */
const { chromium } = require('playwright');const [ROOT,ID,OUT,STS]=process.argv.slice(2);
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const errs=[];
 const p=await (await b.newContext({viewport:{width:400,height:300}})).newPage();p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+ROOT+'/index.html');await p.waitForTimeout(800);
 const url=await p.evaluate(([ID,STS])=>{UI.clear();window.lmOutline=function(g,a,b2,c,d,e,f,fn){LMC.m=null;LMC.hurt=0;return withOutline(g,a,b2,c,d,e,f,fn);};
  const d=LIL_MOBS.find(q=>q.id===ID),S=3,CW=96,CH=86,NF=12;
  const rows=[['покой','idle',0,0],['ход','idle',1,0],[d.fly?'полёт-быстро':'прыжок','idle',d.fly?1:0,1]];for(const s of (STS?STS.split(','):[]))rows.push([s,s,0,0]);
  const cv=document.createElement('canvas');cv.width=CW*S*NF+60;cv.height=CH*S*rows.length*2;const g=cv.getContext('2d');g.fillStyle='#1a1024';g.fillRect(0,0,cv.width,cv.height);
  let r=0;for(const T of [0,1])for(const [lab,st,mv,air] of rows){veilT=T;
   const m={def:d,state:st,x:0,y:0,vx:0,vy:0,w:d.w,h:d.h,hp:d.hp,maxHp:d.hp,onGround:!d.fly,facing:1,anim:0,phase:0.4,st:0,timer:0,hurt:0,age:5,atkCd:0,tele:0,cd:1,alpha:1,tf:!!T,lookX:0.3,lookY:0,ext:0,frz:0,gd:0,mk:0,air:0,alive:true};
   for(let i=0;i<NF;i++){const t=10+i/12;G.time=t;m.anim=t;m.st=i/NF;
     m.vx=mv?d.spd:0;m.gd=mv?t*d.spd:0;m.mk=mv?1:0;
     if(air){m.onGround=false;m.air=1;m.vy=-380+i*70;}else{m.onGround=!d.fly;m.air=0;m.vy=0;}
     if(st!=='idle'){m.tele=Math.min(1,i/(NF*0.6));}
     g.save();g.translate((i*CW+CW/2)*S+60,(r*CH+CH*0.78)*S);g.scale(S,S);try{drawMobSprite(g,m,t);}catch(e){g.fillStyle='red';g.fillRect(-5,-5,10,10);console.error(e.message);}g.restore();}
   g.fillStyle='#fff';g.font='28px sans-serif';g.fillText((T?'И ':'Л ')+lab,6,r*CH*S+30);r++;}
  return cv.toDataURL();},[ID,STS]);
 require('fs').writeFileSync(OUT,Buffer.from(url.split(',')[1],'base64'));console.log(errs.length?errs:'ok');await b.close();})();
