// «живость» моделей: доля пикселей моба, меняющихся за 0.1 с (без кэша): node motion.js <корень>
const { chromium } = require('playwright');const ROOT=process.argv[2],ONLY=process.argv[3]||'';
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});const errs=[];
 const p=await (await b.newContext({viewport:{width:400,height:300}})).newPage();p.on('pageerror',e=>errs.push(e.message));
 await p.goto('file://'+ROOT+'/index.html');await p.waitForTimeout(800);
 const r=await p.evaluate((ONLY)=>{UI.clear();if(window.LMC)window.lmOutline=function(g,a,b2,c,d,e,f,fn){LMC.m=null;LMC.hurt=0;return withOutline(g,a,b2,c,d,e,f,fn);};
  const S=3,cv=document.createElement('canvas');cv.width=160*S;cv.height=140*S;const g=cv.getContext('2d',{willReadFrequently:true});const out=[];
  for(const d of LIL_MOBS){if(ONLY&&!ONLY.split(',').includes(d.id))continue;const row=[d.id.padEnd(11)];for(const T of [0,1])for(const mv of [0,1]){veilT=T;
    const m={def:d,state:'idle',x:0,y:0,alive:true,gd:0,mk:mv?1:0,air:0,vx:mv?d.spd*(d.fly?0.7:1):0,vy:0,w:d.w,h:d.h,hp:d.hp,maxHp:d.hp,onGround:!d.fly,facing:1,anim:0,phase:0.4,st:0.3,timer:0,hurt:0,age:5,atkCd:0,tele:0,cd:1,alpha:1,tf:!!T,lookX:0.3,lookY:0,ext:0,frz:0};
    let prev=null,sum=0,n=0;
    for(let i=0;i<12;i++){const t=10+i*0.1;G.time=t;m.anim=t;m.gd=mv?t*d.spd:0;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,cv.width,cv.height);
      g.setTransform(S,0,0,S,80*S,(d.fly?80:110)*S);try{drawMobSprite(g,m,t);}catch(e){return 'ERR '+d.id+' '+e.message;}
      const a=g.getImageData(0,0,cv.width,cv.height).data;
      if(prev){let ch=0,tot=0;for(let j=3;j<a.length;j+=16){if(a[j]>30||prev[j]>30){tot++;if(Math.abs(a[j]-prev[j])+Math.abs(a[j-1]-prev[j-1])+Math.abs(a[j-2]-prev[j-2])+Math.abs(a[j-3]-prev[j-3])>60)ch++;}}sum+=ch/Math.max(1,tot);n++;}
      prev=a;}
    row.push((T?'T':'I')+(mv?'ход':'стоя')+' '+(sum/n*100).toFixed(1).padStart(5));}
   out.push(row.join('  '));}
  return out.join('\n');},ONLY);
 console.log(r);console.log(errs.length?errs.slice(0,3):'ok');await b.close();})();
