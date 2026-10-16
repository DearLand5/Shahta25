'use strict';
/* ============================================================
   МУЗЫКА — спокойная генеративная: лобби и по теме каждого биома
   Слои: тёплая «струнная» подушка (два расстроенных осциллятора
   через мягкий фильтр с медленным «дыханием»), неторопливая
   мелодия-фразами (калимба / электропиано / музыкальная шкатулка)
   с эхом, редкий бас и колокольчики. Аккорды сменяются раз в два
   такта, голоса ведутся плавно — без скачков.
   Отдельно — фон пещеры (ветер, капли, гул, бульканье лавы),
   он идёт через шину звуков и не зависит от громкости музыки.
   ============================================================ */
const Music={
  cur:null,tg:null,drone:null,beat:0,nextT:0,timer:null,lastPick:0,pend:null,pendT:0,
  voices:null,mel:null,dly:null,
  /* inst: kalimba | epiano | box | glass | flute
     prog: ступени лада; каждая держится barsPer тактов */
  THEMES:{
    lobby:{root:50,scale:[0,2,4,7,9],prog:[0,4,5,3],barsPer:2,bpm:68,
      pad:{type:'triangle',lp:1100,vol:0.05,att:2.2,rel:2.6,det:7},
      mel:{inst:'epiano',vol:0.085,dens:0.42,oct:1,dur:1.6},
      bell:{prob:0.1,vol:0.035,oct:2},bass:{vol:0.07,every:2}},
    b0:{root:48,scale:[0,2,4,5,7,9],prog:[0,5,3,4],barsPer:2,bpm:62,
      pad:{type:'triangle',lp:900,vol:0.055,att:2.4,rel:3,det:6},
      mel:{inst:'kalimba',vol:0.09,dens:0.38,oct:1,dur:1.4},
      bass:{vol:0.07,every:2},amb:{wind:0.018,wlp:420,drip:0.05,rumble:0.01}},
    b1:{root:45,scale:[0,2,3,5,7,10],prog:[0,3,5,4],barsPer:2,bpm:56,
      pad:{type:'sawtooth',lp:520,vol:0.04,att:3,rel:3.6,det:8},
      mel:{inst:'kalimba',vol:0.08,dens:0.3,oct:1,dur:1.8},
      bell:{prob:0.08,vol:0.03,oct:2},bass:{vol:0.07,every:2},drone:{note:33,vol:0.035,lp:200},
      amb:{wind:0.022,wlp:300,drip:0.1,rumble:0.02}},
    b2:{root:52,scale:[0,2,4,6,7,9,11],prog:[0,4,2,5],barsPer:2,bpm:58,
      pad:{type:'triangle',lp:1500,vol:0.05,att:2.6,rel:3.2,det:5,shimmer:true},
      mel:{inst:'glass',vol:0.07,dens:0.34,oct:2,dur:2.6},
      bell:{prob:0.12,vol:0.035,oct:2},bass:{vol:0.06,every:2},
      amb:{wind:0.014,wlp:900,drip:0.12,chime:0.05}},
    b3:{root:40,scale:[0,2,3,5,7,8,10],prog:[0,5,3,6],barsPer:2,bpm:50,
      pad:{type:'sawtooth',lp:420,vol:0.045,att:3.2,rel:4,det:9},
      mel:{inst:'flute',vol:0.06,dens:0.24,oct:1,dur:2.4},
      bass:{vol:0.08,every:2},drone:{note:28,vol:0.04,lp:180},
      amb:{wind:0.02,wlp:260,rumble:0.04,bubble:0.12}},
    b4:{root:43,scale:[0,2,4,7,9],prog:[0,3,1,4],barsPer:2,bpm:46,
      pad:{type:'sine',lp:900,vol:0.06,att:4,rel:5,det:4,wide:true},
      mel:{inst:'glass',vol:0.06,dens:0.22,oct:2,dur:3.4},
      bass:{vol:0.06,every:4},drone:{note:31,vol:0.035,lp:240},
      amb:{wind:0.024,wlp:500,chime:0.03}},
    hlobby:{root:45,scale:[0,2,3,5,7,8,10],prog:[0,5,3,4],barsPer:2,bpm:58,
      pad:{type:'sawtooth',lp:700,vol:0.04,att:2.4,rel:3,det:8},
      mel:{inst:'epiano',vol:0.075,dens:0.34,oct:1,dur:1.8},
      bass:{vol:0.08,every:2},drone:{note:33,vol:0.035,lp:220},
      amb:{wind:0.016,wlp:380,crackle:0.08}},
    b5:{root:40,scale:[0,2,3,5,7,8,10],prog:[0,3,4,5],barsPer:2,bpm:52,
      pad:{type:'triangle',lp:600,vol:0.05,att:3,rel:3.6,det:7},
      mel:{inst:'kalimba',vol:0.075,dens:0.28,oct:1,dur:1.8},
      bass:{vol:0.08,every:2},drone:{note:28,vol:0.035,lp:200},
      amb:{wind:0.026,wlp:340,crackle:0.06,rumble:0.02}},
    b6:{root:38,scale:[0,1,3,5,7,8,10],prog:[0,5,3,1],barsPer:2,bpm:48,
      pad:{type:'sawtooth',lp:520,vol:0.05,att:3.4,rel:4,det:9},
      mel:{inst:'flute',vol:0.055,dens:0.22,oct:1,dur:2.6},
      bass:{vol:0.08,every:2},drone:{note:26,vol:0.04,lp:180},
      amb:{wind:0.02,wlp:280,drip:0.08,rumble:0.03}},
    b7:{root:41,scale:[0,2,3,5,7,9,10],prog:[0,4,2,3],barsPer:2,bpm:50,
      pad:{type:'triangle',lp:1000,vol:0.05,att:3,rel:3.4,det:6},
      mel:{inst:'kalimba',vol:0.07,dens:0.3,oct:1,dur:1.6},
      bass:{vol:0.07,every:2},amb:{wind:0.016,wlp:450,bubble:0.16,drip:0.05}},
    b8:{root:36,scale:[0,1,3,5,7,8,10],prog:[0,3,1,0],barsPer:2,bpm:44,
      pad:{type:'triangle',lp:520,vol:0.05,att:3.6,rel:4.4,det:6},
      mel:{inst:'box',vol:0.05,dens:0.22,oct:2,dur:2.2},
      bass:{vol:0.07,every:4},drone:{note:24,vol:0.04,lp:170},
      amb:{wind:0.024,wlp:320,chime:0.02,rumble:0.02}},
    b9:{root:35,scale:[0,2,3,5,7,8,10],prog:[0,5,6,4],barsPer:2,bpm:48,
      pad:{type:'sawtooth',lp:480,vol:0.052,att:3,rel:4,det:9},
      mel:{inst:'flute',vol:0.055,dens:0.24,oct:1,dur:2.4},
      bass:{vol:0.08,every:2},drone:{note:23,vol:0.045,lp:160},
      amb:{wind:0.02,wlp:300,rumble:0.05,bubble:0.14,crackle:0.05}},
    /* Лиловые небеса: музыкальная шкатулка — светло и тихо, но в ладу прячется
       чужая нота (пониженная ступень), а глубже мелодия редеет и звучит неуютнее */
    llobby:{root:53,scale:[0,2,4,7,9],prog:[0,5,3,4],barsPer:2,bpm:64,
      pad:{type:'triangle',lp:1400,vol:0.045,att:2.4,rel:3,det:5,shimmer:true},
      mel:{inst:'glass',vol:0.075,dens:0.4,oct:2,dur:1.8},
      bell:{prob:0.14,vol:0.03,oct:2},bass:{vol:0.06,every:2}},
    b10:{root:52,scale:[0,2,4,7,9],prog:[0,3,5,4],barsPer:2,bpm:60,
      pad:{type:'triangle',lp:1300,vol:0.05,att:2.6,rel:3,det:5},
      mel:{inst:'kalimba',vol:0.085,dens:0.38,oct:1,dur:1.5},
      bell:{prob:0.1,vol:0.03,oct:2},bass:{vol:0.06,every:2},amb:{wind:0.012,wlp:700,chime:0.03}},
    b11:{root:54,scale:[0,2,4,6,7,9,11],prog:[0,4,2,5],barsPer:2,bpm:56,
      pad:{type:'sine',lp:1700,vol:0.05,att:3,rel:3.6,det:4,shimmer:true},
      mel:{inst:'glass',vol:0.07,dens:0.32,oct:2,dur:2.6},
      bell:{prob:0.14,vol:0.032,oct:2},bass:{vol:0.05,every:2},amb:{wind:0.01,wlp:1100,chime:0.07,drip:0.05}},
    b12:{root:50,scale:[0,2,4,5,7,9,10],prog:[0,5,3,4],barsPer:2,bpm:58,
      pad:{type:'triangle',lp:1000,vol:0.05,att:2.8,rel:3.4,det:6},
      mel:{inst:'epiano',vol:0.07,dens:0.34,oct:1,dur:1.8},
      bass:{vol:0.07,every:2},drone:{note:38,vol:0.025,lp:260},amb:{wind:0.012,wlp:380,drip:0.1,buzz:0.08}},
    b13:{root:51,scale:[0,2,4,5,7,8,11],prog:[0,4,5,1],barsPer:2,bpm:54,
      pad:{type:'triangle',lp:1100,vol:0.045,att:3,rel:3.6,det:7},
      mel:{inst:'box',vol:0.06,dens:0.3,oct:2,dur:1.6},
      bell:{prob:0.12,vol:0.028,oct:2},bass:{vol:0.06,every:2},amb:{wind:0.014,wlp:520,chime:0.02,creak:0.05}},
    b14:{root:47,scale:[0,2,3,5,7,8,11],prog:[0,5,3,4],barsPer:2,bpm:50,
      pad:{type:'sawtooth',lp:700,vol:0.04,att:3.2,rel:4,det:8},
      mel:{inst:'flute',vol:0.06,dens:0.26,oct:1,dur:2.2},
      bass:{vol:0.07,every:2},drone:{note:35,vol:0.03,lp:220},amb:{wind:0.018,wlp:340,drip:0.04}},
    b15:{root:49,scale:[0,2,4,7,9],prog:[0,3,1,4],barsPer:2,bpm:46,
      pad:{type:'sine',lp:1200,vol:0.055,att:4,rel:5,det:4,wide:true,shimmer:true},
      mel:{inst:'glass',vol:0.06,dens:0.22,oct:2,dur:3.2},
      bass:{vol:0.05,every:4},drone:{note:37,vol:0.03,lp:300},amb:{wind:0.016,wlp:600,drip:0.12,bubble:0.06}},
    b16:{root:45,scale:[0,1,4,5,7,8,11],prog:[0,1,5,4],barsPer:2,bpm:44,
      pad:{type:'triangle',lp:560,vol:0.05,att:3.6,rel:4.4,det:7},
      mel:{inst:'box',vol:0.05,dens:0.2,oct:2,dur:2.4},
      bass:{vol:0.07,every:4},drone:{note:33,vol:0.04,lp:180},amb:{wind:0.022,wlp:300,rumble:0.02,drip:0.05}},
    /* бой с боссом: напряжённо, но без грохота — мягкая перкуссия и пульс баса */
    boss:{root:38,scale:[0,2,3,5,7,8,10],prog:[0,5,6,4],barsPer:1,bpm:84,
      pad:{type:'sawtooth',lp:700,vol:0.045,att:0.8,rel:1.2,det:9},
      mel:{inst:'epiano',vol:0.07,dens:0.55,oct:1,dur:0.8},
      bass:{vol:0.09,every:1,pulse:true},drone:{note:26,vol:0.04,lp:220},
      drums:{vol:0.45,kick:[1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0],snare:[0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],hat:[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0]}},
    boss1:{root:38,scale:[0,2,3,5,7,8,10],prog:[0,5,6,4],barsPer:1,bpm:90,
      pad:{type:'sawtooth',lp:760,vol:0.045,att:0.6,rel:1,det:9},
      mel:{inst:'epiano',vol:0.07,dens:0.6,oct:1,dur:0.7},
      bass:{vol:0.1,every:1,pulse:true},drone:{note:26,vol:0.04,lp:220},
      drums:{vol:0.5,kick:[1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0],snare:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],hat:[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0]}},
    boss2:{root:39,scale:[0,1,3,5,7,8,10],prog:[0,5,6,4],barsPer:1,bpm:100,
      pad:{type:'sawtooth',lp:900,vol:0.045,att:0.4,rel:0.8,det:10},
      mel:{inst:'epiano',vol:0.075,dens:0.66,oct:1,dur:0.55},
      bass:{vol:0.1,every:1,pulse:true},drone:{note:27,vol:0.04,lp:240},
      drums:{vol:0.55,kick:[1,0,0,1,0,0,1,0,1,0,0,0,0,0,1,0],snare:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],hat:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,0]}},
    boss3:{root:40,scale:[0,1,4,5,7,8,10],prog:[0,1,5,4],barsPer:1,bpm:112,
      pad:{type:'sawtooth',lp:1100,vol:0.05,att:0.3,rel:0.6,det:10},
      mel:{inst:'epiano',vol:0.08,dens:0.72,oct:1,dur:0.45},
      bass:{vol:0.11,every:1,pulse:true},drone:{note:28,vol:0.045,lp:260},
      drums:{vol:0.6,kick:[1,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0],snare:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,1],hat:[1,0,1,1,1,0,1,0,1,0,1,1,1,0,1,0]}},
    /* Владыки Преисподней: тёмные, тягучие, но тихие — низкий гул и мерный пульс */
    hb1:{root:38,scale:[0,1,3,5,7,8,10],prog:[0,5,1,4],barsPer:1,bpm:84,
      pad:{type:'sawtooth',lp:620,vol:0.045,att:0.9,rel:1.3,det:11},
      mel:{inst:'flute',vol:0.06,dens:0.45,oct:1,dur:0.9},
      bass:{vol:0.1,every:1,pulse:true},drone:{note:26,vol:0.045,lp:200},
      drums:{vol:0.45,kick:[1,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0],snare:[0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],hat:[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0]}},
    hb2:{root:37,scale:[0,1,3,5,7,8,10],prog:[0,1,5,4],barsPer:1,bpm:94,
      pad:{type:'sawtooth',lp:780,vol:0.045,att:0.6,rel:1,det:12},
      mel:{inst:'box',vol:0.055,dens:0.55,oct:1,dur:0.7},
      bass:{vol:0.1,every:1,pulse:true},drone:{note:25,vol:0.045,lp:220},
      drums:{vol:0.5,kick:[1,0,0,1,0,0,0,0,1,0,1,0,0,0,0,0],snare:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],hat:[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,1]}},
    hb3:{root:36,scale:[0,1,4,5,7,8,10],prog:[0,1,6,5],barsPer:1,bpm:104,
      pad:{type:'sawtooth',lp:940,vol:0.05,att:0.4,rel:0.8,det:12},
      mel:{inst:'epiano',vol:0.07,dens:0.66,oct:1,dur:0.5},
      bass:{vol:0.11,every:1,pulse:true},drone:{note:24,vol:0.05,lp:240},
      drums:{vol:0.56,kick:[1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0],snare:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],hat:[1,0,1,0,1,0,1,1,1,0,1,0,1,0,1,1]}},
    hbf:{root:33,scale:[0,1,3,5,7,8,11],prog:[0,5,1,4],barsPer:1,bpm:88,
      pad:{type:'sawtooth',lp:560,vol:0.05,att:1.2,rel:1.6,det:13,wide:true},
      mel:{inst:'glass',vol:0.06,dens:0.4,oct:2,dur:1.1},
      bass:{vol:0.11,every:1,pulse:true},drone:{note:21,vol:0.055,lp:180},
      drums:{vol:0.5,kick:[1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0],snare:[0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0],hat:[0,0,1,0,0,0,1,0,0,0,1,0,0,0,1,0]}}
  },
  mtof(m){return 440*Math.pow(2,(m-69)/12);},
  setVol(v){AU.setMusicVol(v);},
  desired(){
    if(G.scene==='mine'&&G.bossCut&&G.bossCut.t<(G.bossCut.hb?G.bossCut.roarT:3.4))return null;
    if(G.scene==='mine'&&G.hb&&G.hb.m&&G.hb.m.alive){const ph=(G.hb.m.b&&G.hb.m.b.phase)||1;return G.hb.id==='archdemon'?(ph<=2?'hbf':'hb3'):'hb'+Math.min(3,ph);}
    if(G.scene==='mine'&&G.arenaFight){const b=bossAlive();return 'boss'+((b&&b.b&&b.b.phase)||1);}
    if(G.scene==='mine')return 'b'+biomeAt(Math.max(0,player.y)/TILE);
    return G.dim===1?'hlobby':G.dim===2?'llobby':'lobby';
  },
  update(){
    if(!AU.ready||!AU.ctx||AU.ctx.state!=='running')return;
    const now=performance.now();
    if(now-Music.lastPick<700)return;
    Music.lastPick=now;
    const scene=Music.desired();
    Amb.want(G.scene==='menu'?null:scene);
    const want=(AU.musicVol<=0.001)?null:scene;
    if(want===Music.cur){Music.pend=null;return;}
    /* смена темы только если новый биом держится 2.5 с — без дёрганья на стыке */
    const isB=(x)=>typeof x==='string'&&x.startsWith('boss');
    if(Music.cur===null||want===null||isB(want)||isB(Music.cur)||(Music.cur==='lobby')!==(want==='lobby')){Music.pend=null;Music.set(want);return;}
    if(Music.pend!==want){Music.pend=want;Music.pendT=now;return;}
    if(now-Music.pendT>2500){Music.pend=null;Music.set(want);}
  },
  /* общее эхо для мелодии: мягкое, с завалом верхов */
  echo(){
    if(Music.dly)return Music.dly;
    const c=AU.ctx,inp=c.createGain(),d=c.createDelay(1.5),fb=c.createGain(),lp=c.createBiquadFilter(),out=c.createGain();
    d.delayTime.value=0.48;fb.gain.value=0.32;lp.type='lowpass';lp.frequency.value=1700;out.gain.value=0.42;
    inp.connect(d);d.connect(lp);lp.connect(fb);fb.connect(d);lp.connect(out);out.connect(AU.musicIn);
    Music.dly={inp,d};return Music.dly;
  },
  set(name){
    const c=AU.ctx;
    if(Music.tg){
      const old=Music.tg,oldD=Music.drone;
      try{old.gain.cancelScheduledValues(c.currentTime);old.gain.setValueAtTime(old.gain.value,c.currentTime);old.gain.linearRampToValueAtTime(0,c.currentTime+3);}catch(e){}
      setTimeout(()=>{if(oldD){try{oldD.stop();}catch(e){}}try{old.disconnect();}catch(e){}},5500);
    }
    Music.tg=null;Music.drone=null;Music.cur=name;Music.voices=null;Music.mel=null;
    if(Music.timer){clearInterval(Music.timer);Music.timer=null;}
    if(!name)return;
    const T=Music.THEMES[name];
    const tg=envGain(c);tg.gain.setValueAtTime(0,c.currentTime);tg.gain.linearRampToValueAtTime(1,c.currentTime+4);
    tg.connect(AU.musicIn);
    Music.tg=tg;
    const E=Music.echo();
    try{E.d.delayTime.setTargetAtTime(Math.min(1.2,60/T.bpm*0.75),c.currentTime,0.5);}catch(e){}
    if(T.drone){
      const o=c.createOscillator();o.type='sine';o.frequency.value=Music.mtof(T.drone.note);
      const o2=c.createOscillator();o2.type='triangle';o2.frequency.value=Music.mtof(T.drone.note)*1.003;
      const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=T.drone.lp||320;
      const g=c.createGain();g.gain.value=T.drone.vol;
      const lfo=c.createOscillator();lfo.frequency.value=0.05;const lg=c.createGain();lg.gain.value=T.drone.vol*0.4;lfo.connect(lg);lg.connect(g.gain);
      o.connect(f);o2.connect(f);f.connect(g);g.connect(tg);o.start();o2.start();lfo.start();
      Music.drone={stop(){try{o.stop();o2.stop();lfo.stop();}catch(e){}}};
    }
    Music.beat=0;Music.nextT=c.currentTime+0.4;
    Music.timer=setInterval(Music.tick,200);
  },
  /* ноты аккорда ступени deg: 1-3-5-7 лада */
  chordPcs(T,deg){
    const sc=T.scale,n=sc.length;
    const note=(i)=>T.root+sc[((i%n)+n)%n]+12*Math.floor(i/n);
    return [note(deg),note(deg+2),note(deg+4),note(deg+6)];
  },
  /* плавное ведение голосов: каждый голос встаёт на ближайшую ноту аккорда */
  voiceLead(T,deg){
    const pcs=Music.chordPcs(T,deg).map(x=>((x%12)+12)%12);
    const lo=T.root+7,hi=T.root+24;
    let prev=Music.voices||[T.root+12,T.root+16,T.root+19];
    const used=new Set(),out=[];
    for(const v of prev){
      let best=null,bd=99;
      for(let m=lo;m<=hi;m++){const pc=((m%12)+12)%12;if(!pcs.includes(pc)||used.has(pc)&&used.size<pcs.length)continue;const d=Math.abs(m-v);if(d<bd){bd=d;best=m;}}
      if(best===null)best=v;out.push(best);used.add(((best%12)+12)%12);
    }
    out.sort((a,b)=>a-b);Music.voices=out;return out;
  },
  /* тёплая подушка: два расстроенных осциллятора через фильтр с медленным «дыханием» */
  pad(freq,t,dur,P,vol){
    const c=AU.ctx;if(!Music.tg)return;
    const f=c.createBiquadFilter();f.type='lowpass';f.Q.value=0.5;
    f.frequency.setValueAtTime(P.lp*0.6,t);f.frequency.linearRampToValueAtTime(P.lp,t+dur*0.5);f.frequency.linearRampToValueAtTime(P.lp*0.7,t+dur);
    const g=envGain(c),v=(vol===undefined?P.vol:vol);
    g.gain.setValueAtTime(0,t);
    g.gain.linearRampToValueAtTime(v,t+P.att);
    g.gain.setValueAtTime(v,t+Math.max(P.att+0.01,dur-P.rel));
    g.gain.linearRampToValueAtTime(0,t+dur);
    for(const dt of [-(P.det||6),(P.det||6)]){
      const o=c.createOscillator();o.type=P.type;o.frequency.value=freq;o.detune.value=dt;
      o.connect(f);o.start(t);o.stop(t+dur+0.05);
    }
    f.connect(g);g.connect(Music.tg);
    AU.ends.push(t+dur);                     /* музыка тоже в общем счёте голосов */
  },
  /* одиночная мягкая нота (бас, флейта) */
  soft(freq,t,dur,type,vol,att,rel,lp,vib){
    const c=AU.ctx;if(!Music.tg)return;
    const o=c.createOscillator();o.type=type;o.frequency.value=freq;
    if(vib){const l=c.createOscillator(),lg=c.createGain();l.frequency.value=4.6;lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(freq*0.006,t+att+0.3);l.connect(lg);lg.connect(o.frequency);l.start(t);l.stop(t+dur+0.05);}
    const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=lp;f.Q.value=0.4;
    const g=envGain(c);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+att);
    g.gain.setValueAtTime(vol,t+Math.max(att+0.01,dur-rel));g.gain.linearRampToValueAtTime(0,t+dur);
    o.connect(f);f.connect(g);g.connect(Music.tg);
    if(vib)g.connect(Music.echo().inp);
    o.start(t);o.stop(t+dur+0.05);AU.ends.push(t+dur);
  },
  /* FM-нота: калимба / электропиано / шкатулка / стекло */
  fm(freq,t,dur,vol,ratio,index,send){
    const c=AU.ctx;if(!Music.tg)return;
    const car=c.createOscillator(),mod=c.createOscillator(),mg=c.createGain(),g=envGain(c);
    car.frequency.value=freq;mod.frequency.value=freq*ratio;
    mg.gain.setValueAtTime(freq*index,t);mg.gain.exponentialRampToValueAtTime(Math.max(1,freq*index*0.03),t+Math.min(dur,0.9)*0.7);
    mod.connect(mg);mg.connect(car.frequency);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+0.008);
    g.gain.exponentialRampToValueAtTime(0.0008,t+dur);g.gain.linearRampToValueAtTime(0,t+dur+0.02);
    car.connect(g);g.connect(Music.tg);
    if(send){const s=c.createGain();s.gain.value=send;g.connect(s);s.connect(Music.echo().inp);}
    car.start(t);mod.start(t);car.stop(t+dur+0.05);mod.stop(t+dur+0.05);AU.ends.push(t+dur);
  },
  note(inst,freq,t,dur,vol){
    switch(inst){
      case 'kalimba':Music.fm(freq,t,dur,vol,1,0.9,0.5);Music.fm(freq*2,t,dur*0.4,vol*0.18,3.5,0.6,0);break;
      case 'epiano':Music.fm(freq,t,dur,vol,1,0.55,0.45);Music.fm(freq,t,dur*0.5,vol*0.22,14,0.12,0);break;
      case 'box':Music.fm(freq,t,dur,vol,3.5,0.7,0.6);break;
      case 'glass':Music.fm(freq,t,dur,vol*0.8,1.41,0.5,0.7);Music.soft(freq,t,dur*0.8,'sine',vol*0.35,0.25,dur*0.5,3000);break;
      case 'flute':Music.soft(freq,t,dur,'triangle',vol,0.18,dur*0.55,1800,true);break;
    }
  },
  tick(){
    if(!AU.ready||AU.ctx.state!=='running'||!Music.cur)return;
    const T=Music.THEMES[Music.cur];
    const c=AU.ctx,spb=60/T.bpm;
    /* опоздавшие доли пропускаем, а не играем пачкой задним числом */
    while(Music.nextT<c.currentTime+0.02){Music.beat++;Music.nextT+=spb;}
    while(Music.nextT<c.currentTime+1.2){
      Music.schedule(T,Music.beat,Music.nextT,spb);
      Music.beat++;Music.nextT+=spb;
    }
  },
  /* мелодия: случайное блуждание по ладу маленькими шагами, фразы по 4 такта,
     сильные доли тянутся к нотам аккорда, в конце фразы — длинная нота и пауза */
  melody(T,beat,t,spb,deg){
    const M=T.mel;if(!M)return;
    const bib=beat%4,bar=Math.floor(beat/4),phraseBar=bar%4,phrase=Math.floor(bar/4);
    const S=Music.mel||(Music.mel={i:T.scale.length*M.oct+2,rest:false,lastPhrase:-1});
    if(S.lastPhrase!==phrase){S.lastPhrase=phrase;S.rest=phrase%4===3&&Math.random()<0.7;}
    if(S.rest)return;
    if(phraseBar===3&&bib>0)return;           /* хвост фразы — дышим */
    const n=T.scale.length;
    const chordIdx=[deg,deg+2,deg+4].map(x=>((x%n)+n)%n);
    for(let h=0;h<2;h++){
      const strong=h===0&&(bib===0||bib===2);
      const p=M.dens*(strong?1.25:h===1?0.55:0.85);
      if(Math.random()>p)continue;
      let step=[-2,-1,-1,0,1,1,2][Math.floor(Math.random()*7)];
      S.i+=step;
      const lo=n*M.oct-1,hi=n*(M.oct+1)+3;
      if(S.i<lo)S.i=lo+1;if(S.i>hi)S.i=hi-1;
      if(strong){const cur=((S.i%n)+n)%n;if(!chordIdx.includes(cur)){S.i+=(chordIdx.some(ci=>ci===((cur+1)%n))?1:-1);}}
      const midi=T.root+T.scale[((S.i%n)+n)%n]+12*Math.floor(S.i/n)+12;
      const long=phraseBar===3&&bib===0;
      Music.note(M.inst,Music.mtof(midi),t+h*spb*0.5+(Math.random()*0.02),long?M.dur*1.8:M.dur,M.vol*(strong?1:0.8));
    }
  },
  schedule(T,beat,t,spb){
    const bpb=4,bib=beat%bpb,bar=Math.floor(beat/bpb),per=T.barsPer||1;
    const deg=T.prog[Math.floor(bar/per)%T.prog.length];
    const chordStart=bib===0&&bar%per===0,chordLen=spb*bpb*per;
    if(chordStart){
      const P=T.pad,vs=Music.voiceLead(T,deg);
      for(let i=0;i<vs.length;i++)Music.pad(Music.mtof(vs[i]),t,chordLen*1.08,P,P.vol*(i===1?0.85:1));
      if(P.shimmer)Music.pad(Music.mtof(vs[vs.length-1]+12),t+0.3,chordLen,{type:'sine',lp:3200,att:P.att*1.3,rel:P.rel,det:3},P.vol*0.3);
      if(P.wide)Music.pad(Music.mtof(vs[0]+7),t+0.4,chordLen,{type:'sine',lp:P.lp,att:P.att,rel:P.rel,det:3},P.vol*0.4);
    }
    const B=T.bass;
    if(B&&bib===0&&!B.pulse&&bar%(B.every||2)===0){
      const r=Music.chordPcs(T,deg)[0];Music.soft(Music.mtof(r-12),t,spb*4*(B.every||2)*0.95,'sine',B.vol,0.5,1.6,420);
    }
    if(B&&B.pulse){const r=Music.chordPcs(T,deg)[0];Music.soft(Music.mtof(r-12),t,spb*0.9,'triangle',B.vol*0.7,0.02,0.35,380);}
    Music.melody(T,beat,t,spb,deg);
    if(T.bell&&bib===2&&Math.random()<T.bell.prob){
      const ch=Music.chordPcs(T,deg),note=ch[Math.floor(Math.random()*3)]+12*T.bell.oct;
      Music.fm(Music.mtof(note),t+Math.random()*spb*0.5,3,T.bell.vol,3.5,0.5,0.5);
    }
    if(T.drums){
      const D=T.drums,c2=AU.ctx,dv=D.vol*(Music.duck||1);
      for(let q=0;q<4;q++){const st=bib*4+q,tt=t+q*spb/4;
        if(D.kick[st]){const o=c2.createOscillator(),g=envGain(c2);o.type='sine';o.frequency.setValueAtTime(110,tt);o.frequency.exponentialRampToValueAtTime(44,tt+0.14);
          g.gain.setValueAtTime(0.0001,tt);g.gain.linearRampToValueAtTime(0.3*dv,tt+0.008);g.gain.exponentialRampToValueAtTime(0.0008,tt+0.34);o.connect(g);g.connect(Music.tg);o.start(tt);o.stop(tt+0.36);}
        if(D.snare[st]||D.hat[st]){const isS=!!D.snare[st],len=isS?0.22:0.05,buf=AU.nbuf;if(!buf)continue;
          const n=c2.createBufferSource();n.buffer=buf;const f=c2.createBiquadFilter();f.type=isS?'bandpass':'highpass';f.frequency.value=isS?1400:6500;f.Q.value=isS?0.7:0.5;
          const g=envGain(c2);const v=(isS?0.12:0.025)*dv;
          /* плавное начало 2–4 мс: мгновенный старт шума щёлкал на каждой доле (замер: 26 щелчков за 12 с) */
          g.gain.setValueAtTime(0,tt);g.gain.linearRampToValueAtTime(v,tt+(isS?0.004:0.0025));g.gain.exponentialRampToValueAtTime(0.0008,tt+len);g.gain.linearRampToValueAtTime(0,tt+len+0.015);
          n.connect(f);f.connect(g);g.connect(Music.tg);n.start(tt,Math.random()*0.5);n.stop(tt+len+0.03);AU.ends.push(tt+len);}
      }
    }
  }
};

/* ============================================================
   ФОН ПЕЩЕРЫ: ветер в туннелях, капли, далёкий гул, бульканье
   лавы, треск углей, хрустальный перезвон. Тихо, через шину звуков.
   ============================================================ */
const Amb={
  cur:null,node:null,timer:null,
  want(name){
    if(!AU.ready||AU.volume<=0.001)name=null;
    const T=name&&Music.THEMES[name],key=T&&T.amb?name:null;
    if(key===Amb.cur)return;
    Amb.stop();Amb.cur=key;
    if(!key)return;
    const A=T.amb,c=AU.ctx;
    const g=envGain(c);g.gain.setValueAtTime(0,c.currentTime);g.gain.linearRampToValueAtTime(1,c.currentTime+3);g.connect(AU.sfxBus);
    let src=null,lfo=null;
    if(A.wind){
      src=c.createBufferSource();src.buffer=AU.nbuf;src.loop=true;
      const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=A.wlp||400;f.Q.value=0.9;
      lfo=c.createOscillator();lfo.frequency.value=0.07;const lg=c.createGain();lg.gain.value=(A.wlp||400)*0.45;lfo.connect(lg);lg.connect(f.frequency);
      const wg=c.createGain();wg.gain.value=A.wind;
      const lfo2=c.createOscillator();lfo2.frequency.value=0.13;const lg2=c.createGain();lg2.gain.value=A.wind*0.5;lfo2.connect(lg2);lg2.connect(wg.gain);
      src.connect(f);f.connect(wg);wg.connect(g);src.start();lfo.start();lfo2.start();
      Amb.node={g,stop(){try{src.stop();lfo.stop();lfo2.stop();}catch(e){}}};
    }else Amb.node={g,stop(){}};
    Amb.timer=setInterval(()=>Amb.events(A),400);
  },
  stop(){
    if(Amb.timer){clearInterval(Amb.timer);Amb.timer=null;}
    const n=Amb.node;Amb.node=null;
    if(n){try{const c=AU.ctx;n.g.gain.cancelScheduledValues(c.currentTime);n.g.gain.setValueAtTime(n.g.gain.value,c.currentTime);n.g.gain.linearRampToValueAtTime(0,c.currentTime+2);}catch(e){}
      setTimeout(()=>{n.stop();try{n.g.disconnect();}catch(e){}},2300);}
  },
  /* одно событие: короткий звук прямо в шину фона */
  ev(fn){if(!Amb.node||!AU.ctx||AU.ctx.state!=='running'||AU.busy())return;AU.ends.push(AU.ctx.currentTime+0.6);try{fn(AU.ctx,Amb.node.g,AU.ctx.currentTime+AU.LEAD+Math.random()*0.3);}catch(e){}},
  events(A){
    if(G.paused||document.hidden)return;
    const P=(p)=>Math.random()<p*0.4;
    if(A.drip&&P(A.drip))Amb.ev((c,out,t)=>{          /* капля: короткий «плинк» со спадом высоты */
      const f0=rr(1300,2400),o=c.createOscillator(),g=envGain(c),pn=c.createStereoPanner?c.createStereoPanner():null;
      o.type='sine';o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f0*0.55,t+0.09);
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.05,t+0.004);g.gain.exponentialRampToValueAtTime(0.0008,t+0.22);
      o.connect(g);if(pn){pn.pan.value=rr(-0.8,0.8);g.connect(pn);pn.connect(out);pn.connect(AU.sfxSend);}else g.connect(out);
      o.start(t);o.stop(t+0.25);});
    if(A.rumble&&P(A.rumble))Amb.ev((c,out,t)=>{      /* далёкий гул породы */
      const s=c.createBufferSource();s.buffer=AU.nbuf;const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=110;
      const g=envGain(c),d=rr(1.6,3);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.11,t+d*0.35);g.gain.linearRampToValueAtTime(0,t+d);
      s.connect(f);f.connect(g);g.connect(out);s.start(t,Math.random()*0.5);s.stop(t+d+0.05);});
    if(A.bubble&&P(A.bubble))Amb.ev((c,out,t)=>{      /* бульканье лавы: пара глухих пузырей */
      for(let k=0;k<1+Math.floor(Math.random()*3);k++){const tt=t+k*rr(0.08,0.2),f0=rr(140,260),o=c.createOscillator(),g=envGain(c);
        o.type='sine';o.frequency.setValueAtTime(f0,tt);o.frequency.exponentialRampToValueAtTime(f0*1.9,tt+0.07);
        g.gain.setValueAtTime(0,tt);g.gain.linearRampToValueAtTime(0.045,tt+0.01);g.gain.exponentialRampToValueAtTime(0.0008,tt+0.12);
        o.connect(g);g.connect(out);o.start(tt);o.stop(tt+0.14);}});
    if(A.crackle&&P(A.crackle))Amb.ev((c,out,t)=>{    /* треск углей: мягкие тёплые щелчки, а не резкие — резкие звучали как сломанный динамик */
      for(let k=0;k<1+Math.floor(Math.random()*3);k++){const tt=t+k*rr(0.05,0.14),s=c.createBufferSource();s.buffer=AU.nbuf;
        const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=rr(900,2200);f.Q.value=1.4;const g=envGain(c);
        g.gain.setValueAtTime(0,tt);g.gain.linearRampToValueAtTime(rr(0.012,0.03),tt+0.003);g.gain.exponentialRampToValueAtTime(0.0008,tt+0.06);
        s.connect(f);f.connect(g);g.connect(out);s.start(tt,Math.random()*0.8);s.stop(tt+0.08);}});
    if(A.chime&&P(A.chime))Amb.ev((c,out,t)=>{        /* хрустальный перезвон где-то вдали */
      const base=[1568,1760,2093,2349,2637][Math.floor(Math.random()*5)];
      for(let k=0;k<2;k++){const tt=t+k*rr(0.1,0.25),o=c.createOscillator(),g=envGain(c);o.type='sine';o.frequency.value=base*(k?1.5:1);
        g.gain.setValueAtTime(0,tt);g.gain.linearRampToValueAtTime(0.018,tt+0.01);g.gain.exponentialRampToValueAtTime(0.0008,tt+1.6);
        o.connect(g);g.connect(out);g.connect(AU.sfxSend);o.start(tt);o.stop(tt+1.65);}});
    if(A.buzz&&P(A.buzz))Amb.ev((c,out,t)=>{          /* пчела пролетает мимо: тихое жужжание с допплером и панорамой */
      const d=rr(1.2,2.2),f0=rr(190,240),o=c.createOscillator(),f=c.createBiquadFilter(),g=envGain(c),pn=c.createStereoPanner?c.createStereoPanner():null;
      o.type='sawtooth';o.frequency.setValueAtTime(f0*1.04,t);o.frequency.linearRampToValueAtTime(f0*0.95,t+d);
      const lfo=c.createOscillator(),lg=c.createGain();lfo.frequency.value=rr(18,26);lg.gain.value=f0*0.03;lfo.connect(lg);lg.connect(o.frequency);
      f.type='bandpass';f.frequency.value=f0*3;f.Q.value=1.2;
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.012,t+d*0.45);g.gain.linearRampToValueAtTime(0,t+d);
      o.connect(f);f.connect(g);if(pn){const s0=rr(-0.9,0.9);pn.pan.setValueAtTime(s0,t);pn.pan.linearRampToValueAtTime(-s0,t+d);g.connect(pn);pn.connect(out);}else g.connect(out);
      o.start(t);lfo.start(t);o.stop(t+d+0.05);lfo.stop(t+d+0.05);});
    if(A.creak&&P(A.creak))Amb.ev((c,out,t)=>{        /* далёкий скрип карусели и бренчание заводной игрушки */
      const d=rr(0.5,0.9),s=c.createBufferSource();s.buffer=AU.nbuf;const f=c.createBiquadFilter();f.type='bandpass';f.Q.value=9;
      f.frequency.setValueAtTime(rr(500,700),t);f.frequency.linearRampToValueAtTime(rr(800,1000),t+d*0.6);f.frequency.linearRampToValueAtTime(rr(450,600),t+d);
      const g=envGain(c);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.03,t+0.08);g.gain.linearRampToValueAtTime(0,t+d);
      s.connect(f);f.connect(g);g.connect(out);s.start(t,Math.random()*0.5);s.stop(t+d+0.05);
      if(Math.random()<0.5){const sc=[1047,1175,1319,1568,1760];for(let k=0;k<3;k++){const tt=t+d+0.1+k*0.22,o=c.createOscillator(),g2=envGain(c);o.type='triangle';o.frequency.value=sc[Math.floor(Math.random()*5)];
        g2.gain.setValueAtTime(0,tt);g2.gain.linearRampToValueAtTime(0.012,tt+0.005);g2.gain.exponentialRampToValueAtTime(0.0006,tt+0.5);o.connect(g2);g2.connect(out);g2.connect(AU.sfxSend);o.start(tt);o.stop(tt+0.55);}}});
  }
};
