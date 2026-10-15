'use strict';
/* ============================================================
   МУЗЫКА -- спокойная генеративная: лобби и по теме каждого биома
   ============================================================ */
const Music={
  cur:null,tg:null,drone:null,beat:0,nextT:0,timer:null,lastPick:0,pend:null,pendT:0,
  THEMES:{
    lobby:{root:48,scale:[0,2,4,7,9],prog:[0,3,4,1],bpm:66,
      pad:{type:'triangle',lp:1300,vol:0.07,att:1.2,rel:1.8},
      arp:{prob:0.75,vol:0.09,oct:1,dur:1.1,pat:[0,2,1,2,3,2,1,2],ratio:3.01,index:0.9},
      bell:{prob:0.18,vol:0.06,oct:2,dur:2.4},bass:{vol:0.1}},
    b0:{root:50,scale:[0,2,3,5,7,9,10],prog:[0,3,5,4],bpm:60,
      pad:{type:'sine',lp:900,vol:0.08,att:1.8,rel:2.4},
      arp:{prob:0.55,vol:0.09,oct:1,dur:0.6,pat:[0,1,2,1],ratio:4,index:1.4},
      bell:{prob:0.08,vol:0.05,oct:2,dur:2},bass:{vol:0.1},drone:{note:38,vol:0.05}},
    b1:{root:45,scale:[0,3,5,7,10],prog:[0,2,3,1],bpm:52,
      pad:{type:'triangle',lp:700,vol:0.07,att:2.6,rel:3.2},
      bell:{prob:0.32,vol:0.08,oct:2,dur:3},drip:0.16,bass:{vol:0.09},drone:{note:33,vol:0.045,lp:220}},
    b2:{root:52,scale:[0,2,4,6,7,9,11],prog:[0,4,2,5],bpm:58,
      pad:{type:'sine',lp:1800,vol:0.07,att:2,rel:3,oct2:true},
      arp:{prob:0.62,vol:0.07,oct:2,dur:1.5,pat:[0,2,1,3,2,4,1,2],ratio:2.76,index:0.7},
      bell:{prob:0.22,vol:0.06,oct:2,dur:3.2},bass:{vol:0.08}},
    b3:{root:36,scale:[0,1,3,5,7,8,10],prog:[0,0,2,1],bpm:46,
      pad:{type:'triangle',lp:420,vol:0.09,att:3,rel:4},
      thump:{vol:0.16},bell:{prob:0.12,vol:0.06,oct:1,dur:3},bass:{vol:0.1},drone:{note:24,vol:0.06}},
    hlobby:{root:45,scale:[0,1,3,5,7,8,10],prog:[0,5,3,4],bpm:56,
      pad:{type:'triangle',lp:900,vol:0.075,att:1.6,rel:2.2},
      arp:{prob:0.55,vol:0.075,oct:1,dur:1.2,pat:[0,2,1,3,2,1],ratio:3.5,index:1.1},
      bell:{prob:0.14,vol:0.06,oct:2,dur:2.6},bass:{vol:0.11},drone:{note:33,vol:0.05,lp:240}},
    b5:{root:40,scale:[0,2,3,5,7,8,10],prog:[0,3,4,0],bpm:50,
      pad:{type:'triangle',lp:600,vol:0.08,att:2.4,rel:3},
      bell:{prob:0.16,vol:0.06,oct:2,dur:3},bass:{vol:0.1},drone:{note:28,vol:0.05,lp:200},drip:0.06},
    b6:{root:38,scale:[0,1,3,5,7,8,11],prog:[0,1,0,5],bpm:44,
      pad:{type:'sine',lp:700,vol:0.085,att:3,rel:3.6},
      thump:{vol:0.14},bell:{prob:0.1,vol:0.05,oct:1,dur:3},bass:{vol:0.1},drone:{note:26,vol:0.055}},
    b7:{root:41,scale:[0,2,3,6,7,9,10],prog:[0,4,2,3],bpm:48,
      pad:{type:'sine',lp:1200,vol:0.075,att:2.4,rel:3},
      arp:{prob:0.45,vol:0.06,oct:2,dur:1.6,pat:[0,3,1,4,2],ratio:2.2,index:0.8},
      bell:{prob:0.12,vol:0.05,oct:2,dur:3},bass:{vol:0.085},drip:0.12},
    b8:{root:36,scale:[0,1,4,5,7,8,10],prog:[0,2,1,0],bpm:40,
      pad:{type:'triangle',lp:520,vol:0.08,att:3.4,rel:4},
      bell:{prob:0.22,vol:0.07,oct:2,dur:4},bass:{vol:0.09},drone:{note:24,vol:0.05,lp:180}},
    b9:{root:35,scale:[0,1,3,5,6,8,10],prog:[0,0,3,1],bpm:46,
      pad:{type:'triangle',lp:380,vol:0.095,att:3,rel:4},
      thump:{vol:0.17},bell:{prob:0.1,vol:0.06,oct:1,dur:3},bass:{vol:0.11},drone:{note:23,vol:0.065}},
    boss:{root:38,scale:[0,1,3,5,7,8,10],prog:[0,0,5,6],bpm:92,
      pad:{type:'sawtooth',lp:700,vol:0.06,att:0.6,rel:1.2},
      arp:{prob:0.9,vol:0.07,oct:1,dur:0.35,pat:[0,2,4,2,1,3,2,0],ratio:2,index:1.6},
      thump:{vol:0.2},bass:{vol:0.12},drone:{note:26,vol:0.05}},
    boss1:{root:38,scale:[0,1,3,5,7,8,10],prog:[0,0,5,6],bpm:100,
      pad:{type:'sawtooth',lp:760,vol:0.055,att:0.5,rel:1},
      arp:{prob:1,vol:0.07,oct:1,dur:0.3,pat:[0,2,4,2,1,3,2,0],ratio:2,index:1.6},
      bass:{vol:0.12},drone:{note:26,vol:0.05},
      drums:{vol:0.9,kick:[1,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0],snare:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0],hat:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1]}},
    boss2:{root:39,scale:[0,1,3,5,7,8,11],prog:[0,5,6,4],bpm:116,
      pad:{type:'sawtooth',lp:1000,vol:0.055,att:0.3,rel:0.8},
      arp:{prob:1,vol:0.075,oct:1,dur:0.22,pat:[0,3,2,4,1,3,5,2],ratio:3,index:2},
      bass:{vol:0.13,pulse:true},drone:{note:27,vol:0.05},
      drums:{vol:1,kick:[1,0,0,1,0,0,1,0,1,0,0,1,0,0,1,0],snare:[0,0,0,0,1,0,0,0,0,0,0,0,1,0,1,0],hat:[1,1,1,0,1,1,1,0,1,1,1,0,1,1,1,1]}},
    boss3:{root:40,scale:[0,1,4,5,7,8,10],prog:[0,1,5,4],bpm:136,
      pad:{type:'sawtooth',lp:1400,vol:0.06,att:0.15,rel:0.6},
      arp:{prob:1,vol:0.08,oct:1,dur:0.18,pat:[0,4,2,5,1,4,3,6],ratio:1.5,index:2.6},
      lead:{vol:0.05},bass:{vol:0.14,pulse:true},drone:{note:28,vol:0.06},
      drums:{vol:1.1,kick:[1,0,1,0,1,0,1,0,1,0,1,0,1,0,1,1],snare:[0,0,0,0,1,0,0,1,0,0,0,0,1,0,1,1],hat:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]}},
    b4:{root:43,scale:[0,2,4,6,8,10],prog:[0,2,4,1],bpm:42,
      pad:{type:'sine',lp:1000,vol:0.07,att:4,rel:5,wide:true},
      bell:{prob:0.2,vol:0.07,oct:2,dur:4},bass:{vol:0.08},drone:{note:31,vol:0.05}}
  },
  mtof(m){return 440*Math.pow(2,(m-69)/12);},
  setVol(v){AU.setMusicVol(v);},
  desired(){
    if(G.scene==='mine'&&G.bossCut&&G.bossCut.t<3.4)return null;
    if(G.scene==='mine'&&G.arenaFight){const b=bossAlive();return 'boss'+((b&&b.b&&b.b.phase)||1);}
    if(G.scene==='mine')return 'b'+biomeAt(Math.max(0,player.y)/TILE);
    return G.dim===1?'hlobby':'lobby';
  },
  update(){
    if(!AU.ready||!AU.ctx||AU.ctx.state!=='running')return;
    const now=performance.now();
    if(now-Music.lastPick<700)return;
    Music.lastPick=now;
    const want=(AU.musicVol<=0.001)?null:Music.desired();
    if(want===Music.cur){Music.pend=null;return;}
    /* смена темы только если новый биом держится 2.5 с -- без дёрганья на стыке */
    const isB=(x)=>typeof x==='string'&&x.startsWith('boss');
    if(Music.cur===null||want===null||isB(want)||isB(Music.cur)||(Music.cur==='lobby')!==(want==='lobby')){Music.pend=null;Music.set(want);return;}
    if(Music.pend!==want){Music.pend=want;Music.pendT=now;return;}
    if(now-Music.pendT>2500){Music.pend=null;Music.set(want);}
  },
  set(name){
    const c=AU.ctx;
    if(Music.tg){
      const old=Music.tg,oldD=Music.drone;
      try{old.gain.cancelScheduledValues(c.currentTime);old.gain.setValueAtTime(old.gain.value,c.currentTime);old.gain.linearRampToValueAtTime(0,c.currentTime+3);}catch(e){}
      setTimeout(()=>{if(oldD){try{oldD.stop();}catch(e){}}try{old.disconnect();}catch(e){}},5500);
    }
    Music.tg=null;Music.drone=null;Music.cur=name;
    if(Music.timer){clearInterval(Music.timer);Music.timer=null;}
    if(!name)return;
    const T=Music.THEMES[name];
    const tg=c.createGain();tg.gain.setValueAtTime(0,c.currentTime);tg.gain.linearRampToValueAtTime(1,c.currentTime+3);
    tg.connect(AU.musicIn);
    Music.tg=tg;
    if(T.drone){
      const o=c.createOscillator();o.type='sine';o.frequency.value=Music.mtof(T.drone.note);
      const o2=c.createOscillator();o2.type='triangle';o2.frequency.value=Music.mtof(T.drone.note)*1.002;
      const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=T.drone.lp||320;
      const g=c.createGain();g.gain.value=T.drone.vol;
      const lfo=c.createOscillator();lfo.frequency.value=0.06;const lg=c.createGain();lg.gain.value=T.drone.vol*0.35;lfo.connect(lg);lg.connect(g.gain);
      o.connect(f);o2.connect(f);f.connect(g);g.connect(tg);o.start();o2.start();lfo.start();
      Music.drone={stop(){try{o.stop();o2.stop();lfo.stop();}catch(e){}}};
    }
    Music.beat=0;Music.nextT=c.currentTime+0.3;
    Music.timer=setInterval(Music.tick,200);
  },
  chord(T,bar){
    const deg=T.prog[bar%T.prog.length],sc=T.scale,n=sc.length;
    const note=(i)=>{const oct=Math.floor(i/n);return T.root+sc[((i%n)+n)%n]+12*oct;};
    return [note(deg),note(deg+2),note(deg+4),note(deg+7)];
  },
  /* мягкая подушка: один осциллятор + фильтр, медленная атака */
  pad(freq,t,dur,type,vol,att,rel,lp){
    const c=AU.ctx;if(!Music.tg)return;
    const o=c.createOscillator();o.type=type;o.frequency.value=freq;
    const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=lp;f.Q.value=0.4;
    const g=c.createGain();
    g.gain.setValueAtTime(0,t);
    g.gain.linearRampToValueAtTime(vol,t+att);
    g.gain.setValueAtTime(vol,t+Math.max(att+0.01,dur-rel));
    g.gain.linearRampToValueAtTime(0,t+dur);
    o.connect(f);f.connect(g);g.connect(Music.tg);
    o.start(t);o.stop(t+dur+0.05);
  },
  /* щипок/колокол (FM) */
  pluck(freq,t,dur,vol,ratio,index){
    const c=AU.ctx;if(!Music.tg)return;
    const car=c.createOscillator(),mod=c.createOscillator(),mg=c.createGain(),g=c.createGain();
    car.frequency.value=freq;mod.frequency.value=freq*(ratio||2);
    mg.gain.setValueAtTime(freq*(index||1),t);mg.gain.exponentialRampToValueAtTime(Math.max(1,freq*(index||1)*0.04),t+dur*0.6);
    mod.connect(mg);mg.connect(car.frequency);
    g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+0.006);
    g.gain.exponentialRampToValueAtTime(0.0008,t+dur);g.gain.linearRampToValueAtTime(0,t+dur+0.02);
    car.connect(g);g.connect(Music.tg);
    car.start(t);mod.start(t);car.stop(t+dur+0.05);mod.stop(t+dur+0.05);
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
  schedule(T,beat,t,spb){
    const bpb=4,bib=beat%bpb,bar=Math.floor(beat/bpb);
    const ch=Music.chord(T,bar),barLen=spb*bpb;
    if(bib===0){
      const P=T.pad;
      for(let i=0;i<3;i++){
        const f=Music.mtof(ch[i]+12);
        Music.pad(f,t,barLen*1.1,P.type,P.vol,P.att,P.rel,P.lp);
        if(P.oct2&&i===0)Music.pad(f*2,t+0.15,barLen,'sine',P.vol*0.4,P.att,P.rel,2600);
        if(P.wide&&i===1)Music.pad(f*1.5,t+0.25,barLen,'sine',P.vol*0.45,P.att,P.rel,P.lp);
      }
      if(T.bass)Music.pad(Music.mtof(ch[0]-12),t,barLen*1.02,'sine',T.bass.vol,0.4,1.2,500);
    }
    if(T.arp&&Math.random()<T.arp.prob){
      const A=T.arp;
      for(let h=0;h<2;h++){
        if(h===1&&Math.random()<0.45)continue;
        const k=A.pat[(beat*2+h)%A.pat.length];
        const base=ch[k%3]+12*(Math.floor(k/3)+A.oct);
        Music.pluck(Music.mtof(base),t+h*spb*0.5,A.dur,A.vol,A.ratio,A.index);
      }
    }
    if(T.bell&&Math.random()<T.bell.prob*0.5){
      const note=ch[Math.floor(Math.random()*3)]+12*T.bell.oct;
      Music.pluck(Music.mtof(note),t+Math.random()*spb*0.8,T.bell.dur,T.bell.vol,3.5,0.6);
    }
    if(T.drip&&Math.random()<T.drip){
      Music.pluck(rr(1500,2300),t+Math.random()*spb,0.25,0.05,1,0.3);
    }
    if(T.drums){
      const D=T.drums,c2=AU.ctx,dv=D.vol*(Music.duck||1);
      for(let q=0;q<4;q++){const st=bib*4+q,tt=t+q*spb/4;
        if(D.kick[st]){const o=c2.createOscillator(),g=c2.createGain();o.type='sine';o.frequency.setValueAtTime(140,tt);o.frequency.exponentialRampToValueAtTime(42,tt+0.12);
          g.gain.setValueAtTime(0.0001,tt);g.gain.linearRampToValueAtTime(0.32*dv,tt+0.005);g.gain.exponentialRampToValueAtTime(0.0008,tt+0.3);o.connect(g);g.connect(Music.tg);o.start(tt);o.stop(tt+0.32);}
        if(D.snare[st]||D.hat[st]){const isS=!!D.snare[st],len=isS?0.18:0.04,buf=Music.nbuf||(Music.nbuf=(()=>{const b=c2.createBuffer(1,c2.sampleRate*0.3,c2.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return b;})());
          const n=c2.createBufferSource();n.buffer=buf;const f=c2.createBiquadFilter();f.type=isS?'bandpass':'highpass';f.frequency.value=isS?1800:7000;f.Q.value=isS?0.8:0.5;
          const g=c2.createGain();const v=(isS?0.2:(q%2?0.035:0.055))*dv;g.gain.setValueAtTime(v,tt);g.gain.exponentialRampToValueAtTime(0.0008,tt+len);
          n.connect(f);f.connect(g);g.connect(Music.tg);n.start(tt);n.stop(tt+len+0.02);
          if(isS){const o=c2.createOscillator(),g2=c2.createGain();o.type='triangle';o.frequency.setValueAtTime(220,tt);o.frequency.exponentialRampToValueAtTime(120,tt+0.08);g2.gain.setValueAtTime(0.1*dv,tt);g2.gain.exponentialRampToValueAtTime(0.0008,tt+0.1);o.connect(g2);g2.connect(Music.tg);o.start(tt);o.stop(tt+0.12);}}}
      if(T.bass&&T.bass.pulse){for(let q=0;q<2;q++)Music.pad(Music.mtof(ch[0]-12),t+q*spb/2,spb*0.45,'sawtooth',T.bass.vol*0.6,0.01,0.12,420);}
      if(T.lead&&bib%2===0){const k=[0,2,4,3,1,4,2,5][(bar*2+bib/2)%8];Music.pad(Music.mtof(ch[k%4]+24),t,spb*1.8,'square',T.lead.vol,0.02,0.4,2200);}
    }
    if(T.thump&&bib===0&&bar%2===0){
      const c2=AU.ctx,o=c2.createOscillator(),g=c2.createGain(),f=c2.createBiquadFilter();
      f.type='lowpass';f.frequency.value=180;
      o.type='sine';o.frequency.setValueAtTime(70,t);o.frequency.exponentialRampToValueAtTime(40,t+0.5);
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(T.thump.vol,t+0.03);g.gain.exponentialRampToValueAtTime(0.0008,t+0.7);g.gain.linearRampToValueAtTime(0,t+0.72);
      o.connect(f);f.connect(g);g.connect(Music.tg);o.start(t);o.stop(t+0.75);
    }
  }
};
