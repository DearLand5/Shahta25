'use strict';
/* ============================================================
   AUDIO
   ============================================================ */
/* ============================================================
   АУДИО-ДВИЖОК
   Цепочка: голоса → шины (звуки / музыка) → мастер → мягкий
   компрессор → ограничитель с запасом → динамики.
   Против хрипа: большой буфер (latencyHint 'playback'), общий лимит
   голосов (звуки + музыка + фон), один лёгкий ревербератор, запуск
   звуков с небольшим запасом по времени (иначе начало звука
   «проскакивает» и щёлкает) и ограничитель, который не срезает пики.
   ============================================================ */
/* узел громкости для огибающей звука: с нуля сразу при создании.
   По умолчанию громкость 1, и если источник успевал выдать первый отсчёт раньше,
   чем срабатывала команда «начни с нуля», шум проскакивал на полной громкости —
   одиночный выброс. Это и был хрип музыки на долях барабанов (до 0.9 при громкости тарелки 0.015). */
function envGain(c){const g=c.createGain();g.gain.value=0;return g;}
const AU_MUSIC_MK=1.6;   /* музыка мимо компрессора: громкость подобрана по записи — как была с компрессором */
const AU_POST=1.1;   /* ×0.5 перед кривой: итоговое усиление ×0.55 — громкость как была до переделки */
const AU={
  ctx:null,master:null,sfxBus:null,musicIn:null,musicBus:null,conv:null,sfxSend:null,musicSend:null,nbuf:null,
  ready:false,volume:0.6,musicVol:0.5,active:0,MAXV:38,ends:[],LEAD:0.012,
  init(){
    if(AU.ready)return;
    try{
      const AC=window.AudioContext||window.webkitAudioContext;
      if(!AC)return;
      let c;
      try{c=new AC({latencyHint:'playback'});}catch(e){c=new AC();}
      AU.ctx=c;
      /* ограничитель-предохранитель с запасом: принимает сигнал до ×2.
         До 0.8 звук проходит без изменений, выше — плавно поджимается к 1.0.
         Раньше кривая кончалась на 1.0: всё громче просто срезалось —
         это и был хрип в бою (замер: до 230 срезов в секунду).
         Без передискретизации: она сильно грузила аудиопоток телефона. */
      const clip=c.createWaveShaper();
      const n=4096,curve=new Float32Array(n),K=0.8;
      for(let i=0;i<n;i++){
        const x=(i/(n-1)*2-1)*2,ax=Math.abs(x);
        curve[i]=ax<K?x:Math.sign(x)*(K+(1-K)*Math.tanh((ax-K)/(1-K)));
      }
      clip.curve=curve;clip.oversample='none';
      clip.connect(c.destination);
      const half=c.createGain();half.gain.value=0.5;half.connect(clip);   /* кривая рассчитана на вход ×2 */
      /* компрессор мягче и медленнее: при атаке 6 мс он «сжимал» звук прямо
         внутри одного колебания баса и искажал удары и взрывы.
         Он сам добавляет громкость (≈+4 дБ), поэтому отдельного усиления больше нет. */
      const comp=c.createDynamicsCompressor();
      comp.threshold.value=-16;comp.knee.value=12;comp.ratio.value=4;comp.attack.value=0.012;comp.release.value=0.25;
      const post=c.createGain();post.gain.value=AU_POST;
      comp.connect(post);post.connect(half);
      AU.LEAD=clamp((c.baseLatency||0.01)*0.6,0.008,0.03);
      AU.master=c.createGain();AU.master.gain.value=1;AU.master.connect(comp);
      AU.sfxBus=c.createGain();AU.sfxBus.gain.value=AU.volume;AU.sfxBus.connect(AU.master);
      AU.musicBus=c.createGain();AU.musicBus.gain.value=AU.musicVol;
      /* музыка идёт мимо компрессора: иначе выстрелы и взрывы «дёргали» её громкость
         прямо внутри колебаний баса — это слышно как хрип музыки в бою.
         Срез ниже 38 Гц: такой бас телефон не воспроизводит, а динамик от него дребезжит. */
      {const hp=c.createBiquadFilter();hp.type='highpass';hp.frequency.value=38;hp.Q.value=0.7;
        const mk=c.createGain();mk.gain.value=AU_MUSIC_MK;AU.musicBus.connect(hp);hp.connect(mk);mk.connect(post);}
      AU.musicIn=c.createGain();AU.musicIn.gain.value=0.6;AU.musicIn.connect(AU.musicBus);
      const nl=c.sampleRate,nb=c.createBuffer(1,nl,c.sampleRate),nd=nb.getChannelData(0);
      for(let i=0;i<nl;i++)nd[i]=Math.random()*2-1;
      AU.nbuf=nb;
      /* лёгкая реверберация: 4 линии задержки с затуханием и срезом верхов
         (в разы дешевле свёртки и не «шуршит») */
      const revIn=c.createGain();revIn.gain.value=0.5;
      const revOut=c.createGain();revOut.gain.value=0.55;revOut.connect(AU.master);
      const pre=c.createBiquadFilter();pre.type='lowpass';pre.frequency.value=3200;revIn.connect(pre);
      [0.0297,0.0371,0.0411,0.0437].forEach((dt,i)=>{
        const d=c.createDelay(0.2);d.delayTime.value=dt*1.6;
        const fb=c.createGain();fb.gain.value=0.72;
        const damp=c.createBiquadFilter();damp.type='lowpass';damp.frequency.value=2200;
        pre.connect(d);d.connect(damp);damp.connect(fb);fb.connect(d);
        const pan=c.createStereoPanner?c.createStereoPanner():null;
        if(pan){pan.pan.value=(i%2?0.5:-0.5);damp.connect(pan);pan.connect(revOut);}else damp.connect(revOut);
      });
      AU.conv=revIn;
      AU.sfxSend=c.createGain();AU.sfxSend.gain.value=AU.volume;AU.sfxSend.connect(revIn);
      AU.musicSend=c.createGain();AU.musicSend.gain.value=AU.musicVol*0.6;AU.musicSend.connect(revIn);
      AU.musicIn.connect(AU.musicSend);
      AU.ready=true;
      /* любое касание «будит» звук (iOS/Android могут приостановить или прервать его) */
      const wake=()=>AU.resume();
      window.addEventListener('pointerdown',wake,{passive:true});
      window.addEventListener('touchend',wake,{passive:true});
    }catch(e){AU.ready=false;}
  },
  resume(){try{if(AU.ctx && AU.ctx.state!=='running'&&AU.ctx.state!=='closed'&&!document.hidden) AU.ctx.resume();}catch(e){}},
  setVol(v){
    AU.volume=clamp(v,0,1)*1.25;
    try{if(AU.sfxBus){AU.sfxBus.gain.setTargetAtTime(AU.volume,AU.ctx.currentTime,0.05);AU.sfxSend.gain.setTargetAtTime(AU.volume,AU.ctx.currentTime,0.05);}}catch(e){}
  },
  setMusicVol(v){
    AU.musicVol=clamp(v,0,1)*1.1;
    try{if(AU.musicBus){AU.musicBus.gain.setTargetAtTime(AU.musicVol,AU.ctx.currentTime,0.25);AU.musicSend.gain.setTargetAtTime(AU.musicVol*0.6,AU.ctx.currentTime,0.25);}}catch(e){}
  },
  /* сколько голосов звучит прямо сейчас — считаем по времени окончания,
     а не по событию onended (оно теряется, если игру свернули) */
  busy(){
    const now=AU.ctx.currentTime;
    if(AU.ends.length>8){let j=0;for(let i=0;i<AU.ends.length;i++)if(AU.ends[i]>now)AU.ends[j++]=AU.ends[i];AU.ends.length=j;}
    AU.active=AU.ends.length;
    return AU.active>=AU.MAXV;
  },
  ok(){return AU.ready && AU.ctx && AU.ctx.state==='running' && AU.volume>0.001 && !AU.busy();},
  _track(node,stopT){AU.ends.push(stopT||AU.ctx.currentTime+0.5);if(AU.capture)AU.capture.push(node);},
  /* осциллятор с огибающей. o: {a, to, curve:'exp'|'lin', lp, hp, q, rev, det, pan, sus} */
  osc(type,freq,dur,vol,delay,o){
    if(!AU.ok())return;
    try{
      o=o||{};
      const c=AU.ctx,t0=c.currentTime+AU.LEAD+(delay||0);
      const os=c.createOscillator();os.type=type||'sine';
      os.frequency.setValueAtTime(Math.max(20,freq),t0);
      if(o.to){
        if(o.curve==='lin')os.frequency.linearRampToValueAtTime(Math.max(20,o.to),t0+(o.glide||dur));
        else os.frequency.exponentialRampToValueAtTime(Math.max(20,o.to),t0+(o.glide||dur));
      }
      if(o.det)os.detune.value=o.det;
      const g=envGain(c);
      const v=Math.min(0.6,vol||0.2),a=o.a||0.004;
      g.gain.setValueAtTime(0,t0);
      g.gain.linearRampToValueAtTime(v,t0+a);
      if(o.sus)g.gain.setValueAtTime(v,t0+a+o.sus);
      g.gain.exponentialRampToValueAtTime(0.0008,t0+dur);
      g.gain.linearRampToValueAtTime(0,t0+dur+0.02);
      let node=os;
      if(o.lp){const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=o.lp;f.Q.value=o.q||0.7;node.connect(f);node=f;}
      if(o.hp){const f=c.createBiquadFilter();f.type='highpass';f.frequency.value=o.hp;node.connect(f);node=f;}
      node.connect(g);
      let out=g;
      if(o.pan&&c.createStereoPanner){const pn=c.createStereoPanner();pn.pan.value=clamp(o.pan,-1,1);g.connect(pn);out=pn;}
      out.connect(AU.sfxBus);
      if(o.rev){const rs=c.createGain();rs.gain.value=o.rev;out.connect(rs);rs.connect(AU.sfxSend);}
      AU._track(os,t0+dur+0.05);
      os.start(t0);os.stop(t0+dur+0.05);
    }catch(e){}
  },
  /* фильтрованный шум. o: {type, q, to, a, rev, pan} */
  noise(dur,freq,vol,delay,o){
    if(!AU.ok()||!AU.nbuf)return;
    try{
      o=o||{};
      const c=AU.ctx,t0=c.currentTime+AU.LEAD+(delay||0);
      const src=c.createBufferSource();src.buffer=AU.nbuf;src.loop=true;
      const f=c.createBiquadFilter();f.type=o.type||'bandpass';
      f.frequency.setValueAtTime(Math.max(40,freq),t0);
      if(o.to)f.frequency.exponentialRampToValueAtTime(Math.max(40,o.to),t0+dur);
      f.Q.value=o.q||0.8;
      const g=envGain(c);
      const v=Math.min(0.6,vol||0.2);
      g.gain.setValueAtTime(0,t0);
      g.gain.linearRampToValueAtTime(v,t0+(o.a||0.003));
      g.gain.exponentialRampToValueAtTime(0.0008,t0+dur);
      g.gain.linearRampToValueAtTime(0,t0+dur+0.02);
      src.connect(f);f.connect(g);
      let out=g;
      if(o.pan&&c.createStereoPanner){const pn=c.createStereoPanner();pn.pan.value=clamp(o.pan,-1,1);g.connect(pn);out=pn;}
      out.connect(AU.sfxBus);
      if(o.rev){const rs=c.createGain();rs.gain.value=o.rev;out.connect(rs);rs.connect(AU.sfxSend);}
      AU._track(src,t0+dur+0.05);
      src.start(t0,Math.random()*0.8);src.stop(t0+dur+0.05);
    }catch(e){}
  },
  /* FM-колокольчик: мягкий «стеклянный» тембр без резкости */
  bell(freq,dur,vol,delay,o){
    if(!AU.ok())return;
    try{
      o=o||{};
      const c=AU.ctx,t0=c.currentTime+AU.LEAD+(delay||0);
      const car=c.createOscillator(),mod=c.createOscillator(),mg=c.createGain(),g=envGain(c);
      car.type='sine';mod.type='sine';
      car.frequency.value=freq;mod.frequency.value=freq*(o.ratio||3.5);
      const idx=freq*(o.index||1.6);
      mg.gain.setValueAtTime(idx,t0);mg.gain.exponentialRampToValueAtTime(Math.max(1,idx*0.05),t0+dur*0.7);
      mod.connect(mg);mg.connect(car.frequency);
      const v=Math.min(0.5,vol||0.15);
      g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(v,t0+0.004);
      g.gain.exponentialRampToValueAtTime(0.0008,t0+dur);g.gain.linearRampToValueAtTime(0,t0+dur+0.02);
      car.connect(g);
      let out=g;
      if(o.pan&&c.createStereoPanner){const pn=c.createStereoPanner();pn.pan.value=o.pan;g.connect(pn);out=pn;}
      out.connect(AU.sfxBus);
      const rs=c.createGain();rs.gain.value=(o.rev===undefined?0.45:o.rev);out.connect(rs);rs.connect(AU.sfxSend);
      AU._track(car,t0+dur+0.05);
      car.start(t0);mod.start(t0);car.stop(t0+dur+0.05);mod.stop(t0+dur+0.05);
    }catch(e){}
  },
  /* совместимость со старыми вызовами */
  tone(freq,dur,type,vol,delay,o){AU.osc(type,freq,dur,(vol||0.1)*2.2,delay,o);},
  slide(f1,f2,dur,type,vol,delay,o){AU.osc(type,f1,dur,(vol||0.1)*2.2,delay,Object.assign({to:f2},o||{}));}
};

const sfxLast={};
function sfxGate(id,ms){
  const t=performance.now();
  if(sfxLast[id]&&t-sfxLast[id]<ms)return false;
  sfxLast[id]=t;
  return true;
}
const rr=(a,b)=>a+Math.random()*(b-a);
const PENTA=[1047,1175,1319,1568,1760,2093];
/* материал блока для звуков копания */
function tileMat(t){
  if(t===1)return 'dirt';
  if(t===13)return 'wood';
  if(t===3)return 'crystal';
  if(t===4||t===11||t===12)return 'magma';
  if(t===5)return 'obsidian';
  if(t===40||t===42||t===46||t===49||t===53)return 'dirt';
  if(t===44||t===47||t===51)return 'wood';
  if(t===41||t===48||t===52)return 'crystal';
  return 'stone';
}
/* из чего сделан моб — для звуков ударов и гибели */
const MOB_MAT={golem:'stone',h_ashgolem:'stone',h_magmacrab:'stone',crab:'stone',turtle:'stone',elemental:'stone',h_magmael:'stone',h_infernal:'stone',
  prism:'crystal',rift:'crystal',wisp:'crystal',h_sulfurel:'crystal',
  skeleton:'bone',h_skeleton:'bone',h_bonecolossus:'bone',h_skelminion:'bone',h_necro:'bone',h_skullbat:'bone',turret:'bone',
  slime:'slime',h_bloodslime:'slime',h_acidmother:'slime',h_acidling:'slime',gasbag:'slime',h_gasbag:'slime',h_meatling:'slime',leech:'slime',h_leech:'slime',worm:'slime',
  ghost:'ghost',spirit:'ghost',h_lostsoul:'ghost',h_soulwraith:'ghost',h_ashwraith:'ghost',orb:'ghost',eye:'ghost',
  h_blademaster:'metal',thief:'metal',pod:'slime'};
function mobMat(def){return (def&&MOB_MAT[def.shape])||'flesh';}
const SFX={
  /* --- интерфейс --- */
  ui(){if(!sfxGate('ui',40))return;AU.osc('sine',1250,0.05,0.16,0,{to:950});AU.noise(0.012,5000,0.05,0,{type:'highpass'});},
  uiBack(){if(!sfxGate('uib',40))return;AU.osc('sine',820,0.07,0.15,0,{to:540});},
  buy(){if(!sfxGate('buy',110))return;
    AU.noise(0.05,3800,0.12,0,{type:'bandpass',q:2});
    AU.bell(1319,0.55,0.16,0.03,{ratio:3,index:1.2});AU.bell(1976,0.7,0.13,0.11,{ratio:3,index:1});
    for(let i=0;i<3;i++)AU.noise(0.03,rr(5000,7000),0.05,0.14+i*0.05,{type:'bandpass',q:4});},
  sell(){if(!sfxGate('sell',110))return;
    for(let i=0;i<5;i++)AU.noise(0.035,rr(3500,6000),0.09,i*0.045,{type:'bandpass',q:5,pan:rr(-0.4,0.4)});
    AU.bell(1568,0.5,0.12,0.12,{ratio:3,index:1});AU.bell(2093,0.6,0.1,0.2,{ratio:3,index:1});},
  coin(){if(!sfxGate('coin',50))return;AU.osc('square',988,0.07,0.07,0,{lp:3500,sus:0.04});AU.osc('square',1319,0.28,0.07,0.07,{lp:3500,rev:0.25});},
  win(){if(!sfxGate('win',400))return;[523,659,784,1047,1319].forEach((f,i)=>AU.bell(f,0.9,0.14,i*0.09,{ratio:2,index:1.2}));},
  lose(){if(!sfxGate('lose',400))return;[392,330,277,220].forEach((f,i)=>AU.osc('triangle',f,0.5,0.16,i*0.15,{lp:1200,rev:0.4}));},
  spin(){if(!sfxGate('spin',600))return;for(let i=0;i<10;i++)AU.noise(0.02,rr(2500,4000),0.08,i*0.05*(1+i*0.08),{type:'bandpass',q:6});},
  dice(){if(!sfxGate('dice',150))return;for(let i=0;i<5;i++)AU.noise(0.04,rr(1200,2400),0.13,i*0.055+rr(0,0.02),{type:'bandpass',q:3,pan:rr(-0.5,0.5)});},
  /* --- движение --- */
  /* шаги: свой звук для каждой поверхности, с лёгким разбросом, чтобы не «тикало» */
  step(mat){if(!sfxGate('step',150))return;
    const v=rr(0.85,1.15),pan=rr(-0.15,0.15);
    switch(mat||'dirt'){
      case 'grass':AU.noise(0.08,rr(1800,2600),0.07*v,0,{type:'bandpass',q:0.8,pan});AU.noise(0.05,rr(300,420),0.08*v,0,{type:'lowpass',pan});break;
      case 'wood':AU.osc('triangle',rr(150,190),0.07,0.1*v,0,{to:110,lp:900,pan});AU.noise(0.04,rr(700,950),0.09*v,0,{type:'bandpass',q:1.4,pan});break;
      case 'metal':AU.noise(0.04,rr(2600,3400),0.07*v,0,{type:'bandpass',q:4,pan});AU.osc('triangle',rr(420,520),0.09,0.05*v,0,{lp:2600,pan,rev:0.15});break;
      case 'crystal':AU.noise(0.035,rr(3200,4200),0.06*v,0,{type:'bandpass',q:3,pan});AU.bell(rr(2400,3000),0.18,0.025*v,0,{ratio:1.41,index:0.5,rev:0.3,pan});break;
      case 'stone':AU.noise(0.05,rr(900,1300),0.1*v,0,{type:'bandpass',q:1.6,pan});AU.osc('sine',rr(90,110),0.04,0.06*v,0,{pan});break;
      case 'ash':AU.noise(0.09,rr(500,800),0.09*v,0,{type:'lowpass',q:0.5,pan});break;
      default:AU.noise(0.07,rr(260,420),0.12*v,0,{type:'lowpass',q:0.6,pan});AU.osc('sine',rr(75,95),0.05,0.07*v,0,{pan});
    }},
  /* приземление: глухой удар, тем сильнее, чем выше падал */
  land(k){if(!sfxGate('land',140))return;k=clamp(k||0.5,0.2,1);
    AU.noise(0.12+k*0.1,rr(380,520),0.12+k*0.16,0,{type:'lowpass',to:120});AU.osc('sine',90,0.12+k*0.08,0.12+k*0.2,0,{to:45});
    if(k>0.7)for(let i=0;i<3;i++)AU.noise(0.04,rr(1200,2200),0.05,0.04+i*0.04,{type:'bandpass',q:2,pan:rr(-0.4,0.4)});},
  /* скрип перекладины лестницы */
  ladder(){if(!sfxGate('lad',260))return;AU.osc('triangle',rr(200,240),0.08,0.06,0,{to:rr(160,180),lp:900});AU.noise(0.05,rr(800,1000),0.05,0,{type:'bandpass',q:2});},
  jump(){if(!sfxGate('jump',90))return;AU.noise(0.1,600,0.07,0,{type:'bandpass',to:1300,q:1});AU.noise(0.05,320,0.06,0,{type:'lowpass'});AU.osc('sine',170,0.08,0.05,0,{to:260});},
  splash(){if(!sfxGate('splash',180))return;
    AU.noise(0.4,2200,0.24,0,{type:'lowpass',to:350,q:0.7,rev:0.25});
    for(let i=0;i<4;i++)AU.osc('sine',rr(700,1100),0.08,0.06,0.05+i*0.06,{to:rr(1300,1900),rev:0.3});},
  place(){if(!sfxGate('place',70))return;AU.noise(0.05,900,0.2,0,{type:'bandpass',q:1.5});AU.osc('triangle',260,0.07,0.12,0,{to:180});AU.noise(0.04,800,0.12,0.08,{type:'bandpass',q:1.5});},
  enter(){if(!sfxGate('enter',500))return;AU.noise(0.7,600,0.18,0,{type:'lowpass',to:140,rev:0.4});AU.osc('sine',150,0.6,0.16,0,{to:70});},
  portal(){if(!sfxGate('portal',900))return;AU.osc('sine',180,1.2,0.14,0,{to:900,rev:0.7});AU.osc('sine',182,1.2,0.1,0,{to:906,det:12,rev:0.7});AU.bell(1760,1.2,0.08,0.6,{ratio:1.5,index:2});},
  /* --- копание: свой звук для каждого материала --- */
  dig(t){
    if(!sfxGate('dig',110))return;
    switch(tileMat(t)){
      case 'dirt':AU.noise(0.09,rr(500,700),0.24,0,{type:'lowpass',to:220,q:0.7});AU.osc('sine',rr(110,130),0.07,0.14,0,{to:65});break;
      case 'wood':AU.noise(0.06,rr(800,1000),0.2,0,{type:'bandpass',q:1.6});AU.osc('triangle',rr(280,320),0.06,0.12,0,{to:190});break;
      case 'crystal':AU.noise(0.03,5500,0.1,0,{type:'highpass'});AU.bell(rr(2200,2800),0.25,0.08,0,{ratio:1.41,index:0.8,rev:0.35});break;
      case 'magma':AU.noise(0.08,rr(700,900),0.2,0,{type:'lowpass',to:300});AU.osc('sine',95,0.08,0.12,0,{to:55});AU.noise(0.16,6000,0.04,0.02,{type:'highpass'});break;
      case 'obsidian':AU.noise(0.05,rr(2800,3400),0.17,0,{type:'bandpass',q:3});AU.osc('triangle',rr(650,750),0.05,0.08,0,{to:420});break;
      default:AU.noise(0.05,rr(1800,2400),0.2,0,{type:'bandpass',q:2});AU.osc('triangle',rr(480,560),0.045,0.1,0,{to:300});
    }
  },
  breakBlock(t){
    if(!sfxGate('brk',90))return;
    const m=tileMat(t||2);
    const base=m==='dirt'?550:m==='wood'?900:m==='crystal'?3000:m==='obsidian'?2600:m==='magma'?800:1500;
    for(let i=0;i<3;i++)AU.noise(0.07,base*rr(0.8,1.2),0.16-i*0.03,i*0.035,{type:m==='dirt'?'lowpass':'bandpass',q:m==='dirt'?0.6:1.4,pan:rr(-0.3,0.3)});
    AU.osc('sine',m==='dirt'?110:140,0.14,0.18,0,{to:50});
    if(m==='crystal')AU.bell(rr(1800,2400),0.6,0.1,0.02,{ratio:1.41,index:1.2});
    if(m==='wood')AU.osc('triangle',220,0.12,0.1,0,{to:120});
  },
  /* шёпот Пелены: тихий шелест с «гласными» и далёкая расстроенная нота шкатулки (k — 0..1, чем ниже Рассудок, тем ближе) */
  whisper(k){if(!sfxGate('whisp',1500))return;k=clamp(k||0.5,0,1);const pan=rr(-0.9,0.9);
    for(let i=0;i<3;i++)AU.noise(rr(0.18,0.32),rr(900,1700),0.02+0.025*k,i*rr(0.14,0.22),{type:'bandpass',q:6,to:rr(600,1100),pan,rev:0.5});
    if(Math.random()<0.5)AU.bell(rr(700,1100)*(1+rr(-0.03,0.03)),1.2,0.012+0.012*k,0.5,{ratio:2.01,index:0.5,rev:0.7,pan:-pan});},
  ore(){if(!sfxGate('ore',70))return;
    const f=PENTA[Math.floor(Math.random()*PENTA.length)];
    AU.bell(f,0.7,0.16,0,{ratio:3,index:1.1});AU.bell(f*1.5,0.6,0.08,0.06,{ratio:3,index:0.8});
    AU.noise(0.1,7000,0.04,0,{type:'highpass'});},
  chest(){[784,988,1175,1568].forEach((f,i)=>AU.bell(f,0.9,0.15,i*0.08,{ratio:2,index:1.3}));AU.noise(0.4,7000,0.05,0.2,{type:'highpass',rev:0.5});},
  barrHit(lv){if(!sfxGate('bh',90))return;
    if(lv===1){AU.noise(0.07,700,0.2,0,{type:'bandpass',q:1.5});AU.osc('triangle',220,0.08,0.12,0,{to:150});}
    else if(lv===2){AU.noise(0.06,1800,0.2,0,{type:'bandpass',q:2});AU.osc('triangle',420,0.05,0.1,0,{to:260});}
    else if(lv===3){AU.bell(rr(500,600),0.35,0.12,0,{ratio:2.7,index:1.5,rev:0.25});AU.noise(0.04,3500,0.1,0,{type:'bandpass',q:3});}
    else{AU.bell(rr(300,360),0.45,0.12,0,{ratio:1.41,index:1.2,rev:0.4});AU.noise(0.05,2600,0.12,0,{type:'bandpass',q:3});}},
  barrBreak(lv){if(!sfxGate('bb',150))return;
    for(let i=0;i<4;i++)AU.noise(0.08,(lv===1?700:lv===2?1500:2500)*rr(0.8,1.2),0.2,i*0.04,{type:'bandpass',q:1.2});
    AU.osc('sine',lv>2?160:120,0.2,0.22,0,{to:50});},
  regen(){if(!sfxGate('regen',2500))return;AU.osc('sine',110,0.8,0.06,0,{to:180,rev:0.4,a:0.2});},
  /* --- бой --- */
  hit(){if(!sfxGate('hit',70))return;AU.noise(0.09,1400,0.16,0,{type:'bandpass',to:500,q:1});AU.osc('sine',150,0.09,0.2,0,{to:60});},
  /* взмах оружием: короткий «вжух» */
  swing(){if(!sfxGate('swing',90))return;AU.noise(0.14,rr(900,1200),0.1,0,{type:'bandpass',to:rr(2600,3200),q:1.6,a:0.03});},
  /* попадание по мобу: звук зависит от того, из чего он сделан */
  mobHit(def){if(!sfxGate('mh',60))return;
    switch(mobMat(def)){
      case 'stone':AU.noise(0.07,rr(1500,2000),0.18,0,{type:'bandpass',q:1.8});AU.osc('triangle',rr(300,360),0.06,0.1,0,{to:180});break;
      case 'crystal':AU.noise(0.03,5000,0.08,0,{type:'highpass'});AU.bell(rr(1700,2300),0.4,0.08,0,{ratio:1.41,index:1,rev:0.35});break;
      case 'bone':AU.noise(0.04,rr(2200,2800),0.14,0,{type:'bandpass',q:3});AU.osc('square',rr(600,700),0.03,0.04,0,{to:400,lp:1800});break;
      case 'slime':AU.osc('sine',rr(220,280),0.12,0.14,0,{to:90});AU.noise(0.1,600,0.1,0,{type:'lowpass',to:200});break;
      case 'ghost':AU.osc('sine',rr(500,600),0.25,0.07,0,{to:300,rev:0.5});AU.noise(0.12,3000,0.04,0,{type:'bandpass',q:1,to:1200});break;
      case 'metal':AU.bell(rr(420,520),0.35,0.08,0,{ratio:2.76,index:1.8,rev:0.2});AU.noise(0.04,3500,0.1,0,{type:'bandpass',q:3});break;
      default:AU.noise(0.08,rr(900,1200),0.16,0,{type:'bandpass',to:400,q:1});AU.osc('sine',rr(130,160),0.08,0.16,0,{to:60});
    }},
  hurt(){if(!sfxGate('hurt',220))return;AU.osc('sine',240,0.2,0.3,0,{to:110});AU.osc('triangle',180,0.18,0.1,0,{to:90,lp:900});AU.noise(0.1,600,0.14,0,{type:'bandpass',q:0.8});},
  mobDie(def){if(!sfxGate('mobd',80))return;
    const m=def?mobMat(def):'flesh',big=def&&(def.w>=44||def.boss);
    switch(m){
      case 'stone':for(let i=0;i<4;i++)AU.noise(0.1,rr(700,1400),0.16,i*0.05,{type:'bandpass',q:1.2,pan:rr(-0.4,0.4)});AU.osc('sine',90,0.4,0.2,0,{to:40});break;
      case 'crystal':[0,1,2].forEach(i=>AU.bell(rr(1800,2800),0.7,0.07,i*0.06,{ratio:1.41,index:1.2,rev:0.5,pan:rr(-0.5,0.5)}));AU.noise(0.2,6000,0.08,0,{type:'highpass'});break;
      case 'bone':for(let i=0;i<5;i++)AU.noise(0.04,rr(1800,3000),0.12,i*0.045,{type:'bandpass',q:3,pan:rr(-0.5,0.5)});break;
      case 'slime':AU.osc('sine',300,0.3,0.16,0,{to:70});AU.noise(0.3,900,0.16,0,{type:'lowpass',to:150});break;
      case 'ghost':AU.osc('sine',700,0.8,0.08,0,{to:180,rev:0.7});AU.osc('sine',704,0.8,0.06,0,{to:182,det:15,rev:0.7});break;
      case 'metal':AU.bell(300,0.8,0.1,0,{ratio:2.76,index:2,rev:0.3});AU.noise(0.25,1800,0.14,0,{type:'lowpass',to:200});break;
      default:AU.noise(0.28,1400,0.18,0,{type:'lowpass',to:180});AU.osc('sine',big?160:280,0.24,0.16,0,{to:big?40:80});
    }
    AU.bell(rr(600,700),0.3,0.04,0.06,{ratio:2,index:1,rev:0.3});},
  /* гибель игрока: тяжёлый удар и печальный спуск */
  death(){if(!sfxGate('death',1500))return;AU.noise(0.6,900,0.3,0,{type:'lowpass',to:90,rev:0.4});AU.osc('sine',110,0.8,0.3,0,{to:40});
    [392,349,311,262].forEach((f,i)=>AU.osc('triangle',f,0.9,0.1,0.25+i*0.28,{lp:1100,rev:0.6,a:0.04}));},
  /* стук сердца при малом здоровье */
  heart(){if(!sfxGate('heart',700))return;AU.osc('sine',62,0.14,0.22,0,{to:44,lp:200});AU.osc('sine',58,0.12,0.16,0.18,{to:42,lp:200});},
  /* открытие окна: мягкий шорох и деревянный стук */
  open(){if(!sfxGate('open',150))return;AU.noise(0.12,1800,0.05,0,{type:'bandpass',to:900,q:0.8,a:0.02});AU.osc('triangle',190,0.06,0.05,0.03,{to:140,lp:900});},
  boom(){if(!sfxGate('boom',150))return;AU.noise(0.8,1600,0.42,0,{type:'lowpass',to:110,rev:0.35});AU.osc('sine',80,0.7,0.45,0,{to:32});for(let i=0;i<5;i++)AU.noise(0.03,rr(2000,4000),0.08,0.1+i*0.07,{type:'bandpass',q:3});},
  heal(){if(!sfxGate('heal',200))return;[784,988,1175,1568].forEach((f,i)=>AU.bell(f,0.6,0.12,i*0.07,{ratio:2,index:0.9}));AU.osc('sine',392,0.6,0.08,0,{to:784,a:0.1,rev:0.4});},
  grapple(){if(!sfxGate('grap',80))return;AU.noise(0.05,3000,0.18,0,{type:'highpass'});AU.osc('sawtooth',900,0.12,0.1,0,{to:320,lp:1800});AU.noise(0.22,2200,0.1,0.05,{type:'bandpass',to:700,q:2});AU.osc('square',1800,0.03,0.05,0.24,{lp:3000});},
  drill(){if(!sfxGate('drill',80))return;AU.osc('sawtooth',rr(110,140),0.11,0.1,0,{to:90,lp:800});AU.noise(0.1,rr(600,900),0.16,0,{type:'bandpass',q:1});},
  geyser(){if(!sfxGate('gey',700))return;AU.noise(0.9,500,0.26,0,{type:'lowpass',to:1600,a:0.15});AU.osc('sine',90,0.7,0.14,0,{to:60});},
  shot(id){
    if(!sfxGate('shot',45))return;
    switch(id){
      case 'shotgun':AU.noise(0.32,3200,0.45,0,{type:'lowpass',to:280,rev:0.3});AU.osc('sine',120,0.26,0.4,0,{to:40});break;
      case 'rifle':AU.noise(0.06,2600,0.26,0,{type:'bandpass',q:0.8});AU.osc('sine',210,0.06,0.22,0,{to:80});break;
      case 'plasma':AU.osc('sine',1400,0.2,0.2,0,{to:280,rev:0.3});AU.osc('sawtooth',700,0.16,0.08,0,{to:200,lp:1800});AU.noise(0.08,4000,0.06,0,{type:'highpass'});break;
      case 'rail':AU.osc('sawtooth',2400,0.34,0.12,0,{to:180,lp:3500,rev:0.35});AU.noise(0.3,6000,0.14,0,{type:'highpass',to:900});AU.osc('sine',80,0.32,0.35,0,{to:36});break;
      case 'void':AU.osc('sine',330,0.22,0.22,0,{to:110,rev:0.4});AU.osc('sine',334,0.22,0.16,0,{to:112,det:20,rev:0.4});break;
      case 'hellfire':AU.noise(0.14,1400,0.18,0,{type:'bandpass',q:0.6,to:600});break;
      case 'bloodshot':AU.noise(0.3,2600,0.42,0,{type:'lowpass',to:240,rev:0.3});AU.osc('sawtooth',140,0.22,0.18,0,{to:50,lp:600});break;
      case 'acidcan':AU.osc('sine',90,0.3,0.4,0,{to:40});AU.noise(0.2,900,0.2,0,{type:'lowpass'});break;
      case 'soulrail':AU.osc('sawtooth',1800,0.3,0.12,0,{to:220,lp:4000,rev:0.4});AU.osc('sine',2600,0.2,0.08,0,{to:900});AU.noise(0.12,7000,0.1,0,{type:'highpass'});break;
      case 'infernus':AU.osc('sine',260,0.22,0.2,0,{to:620});AU.noise(0.18,1800,0.16,0,{type:'bandpass',q:1});break;
      default:AU.noise(0.08,2000,0.32,0,{type:'bandpass',q:0.7,rev:0.2});AU.osc('sine',180,0.1,0.3,0,{to:60});
    }
  }
};
