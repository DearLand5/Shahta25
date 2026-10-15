'use strict';
/* ============================================================
   WORLD
   ============================================================ */
const EXIT_CX=Math.floor(MW/2);
const SAFE_X0=EXIT_CX-4, SAFE_X1=EXIT_CX+4;
const ROOM_X0=EXIT_CX-3, ROOM_X1=EXIT_CX+3;
const ROOM_Y0=2, ROOM_Y1=6;
const SHAFT_X0=EXIT_CX-1, SHAFT_X1=EXIT_CX+1;
const SHAFT_Y0=7, SHAFT_Y1=8;
const LANDING_Y=9;

function getSafeZoneTile(wx,wy){
  if(wx<SAFE_X0||wx>SAFE_X1)return -1;
  if(wy<0||wy>LANDING_Y)return -1;
  if(wx>=ROOM_X0&&wx<=ROOM_X1&&wy>=ROOM_Y0&&wy<=ROOM_Y1)return T_AIR;
  if(wx>=SHAFT_X0&&wx<=SHAFT_X1&&wy>=SHAFT_Y0&&wy<=SHAFT_Y1)return T_AIR;
  if(wx>=SHAFT_X0&&wx<=SHAFT_X1&&wy===LANDING_Y)return T_DIRT;
  return T_BEDROCK;
}

const chunks=new Map();
{const _clr=chunks.clear.bind(chunks);chunks.clear=function(){_clr();if(typeof CC!=='undefined')CC.clear();};}
const placedLadders=new Set();
/* ---------- БАРРИКАДЫ ---------- */
const BARR=[
  {name:'Деревянная',  hp:60,  col:'#8a5a30'},
  {name:'Каменная',    hp:150, col:'#7a808c'},
  {name:'Железная',    hp:340, col:'#9aa6b8'},
  {name:'Обсидиановая',hp:700, col:'#3a2a5a'},
  {name:'Базальтовая', hp:2600,col:'#4a3a34'},
  {name:'Адская',      hp:6500,col:'#a0300a'},
  {name:'Костяная цитадель',hp:15000,col:'#d8d0bc'}
];
const BARR_BUY=600,BARR_PACK=6;
const BARR_PACK_COST=[180,450,1200,3200];
const BARR_UP_COST=[0,2500,12000,60000];
const barricades=new Map();      /* "x,y" -> {lvl,hp,max,hitT} */
function barrAt(tx,ty){
  const k=tx+','+ty;let b=barricades.get(k);
  if(!b){b={lvl:1,hp:BARR[0].hp,max:BARR[0].hp,hitT:-9};barricades.set(k,b);}
  return b;
}
function damageBarricade(tx,ty,dmg){
  if(getTile(tx,ty)!==T_BARRICADE)return false;
  const b=barrAt(tx,ty);
  b.hp-=dmg;b.hitT=G.time;
  const cx=tx*TILE+16,cy=ty*TILE+16;
  for(let i=0;i<4;i++)spawnPart(cx+rnd(-12,12),cy+rnd(-12,12),rnd(-80,80),rnd(-120,-20),0.5,BARR[b.lvl-1].col,rnd(1.5,3),500);
  SFX.barrHit(b.lvl);
  if(b.hp<=0){
    barricades.delete(tx+','+ty);
    setTile(tx,ty,T_AIR);
    burst(cx,cy,14,BARR[b.lvl-1].col,170,3.4);
    floatText(cx,cy-10,'Баррикада разрушена','#ff9a7a');
    SFX.barrBreak(b.lvl);shake(2);
  }
  return true;
}
function canPlaceBarr(tx,ty){
  if(tx<1||tx>=MW-1||ty<1)return false;
  const t=getTile(tx,ty);
  if(t!==T_AIR&&!isLiq(t))return false;
  if(placedLadders.has(tx+','+ty)||crateAtTile(tx,ty))return false;
  const x0=tx*TILE+1,x1=tx*TILE+TILE-1,y0=ty*TILE+1,y1=ty*TILE+TILE-1;
  const pl=player.x-player.w/2,pr=player.x+player.w/2,pt=player.y-player.h,pb=player.y;
  if(x0<pr&&x1>pl&&y0<pb&&y1>pt)return false;
  for(const m of mobs){
    if(!m.alive)continue;
    if(x0<m.x+m.w/2&&x1>m.x-m.w/2&&y0<m.y&&y1>m.y-m.h)return false;
  }
  return true;
}
function placeBarricade(){
  if(!player.barricadeBought){floatText(player.x,player.y-64,'Баррикады продаются в кузнице','#ff9a3c');SFX.uiBack();return;}
  if(player.barricades<=0){floatText(player.x,player.y-64,'Нет баррикад — купи в кузнице','#ff8a8a');SFX.uiBack();return;}
  const cands=[];
  const pcx=player.x,pcy=player.y-player.h*0.5;
  if(aim.active){
    let ax=aim.x-pcx,ay=aim.y-pcy;const l=Math.hypot(ax,ay)||1;ax/=l;ay/=l;
    for(let d=0.9;d<=3.4;d+=0.3)cands.push([Math.floor((pcx+ax*d*TILE)/TILE),Math.floor((pcy+ay*d*TILE)/TILE)]);
  }
  const fx=Math.floor((player.x+player.facing*(player.w/2+16))/TILE);
  const fty=Math.floor((player.y-4)/TILE);
  cands.push([fx,fty],[fx,fty-1]);
  for(const [tx,ty] of cands){
    if(!canPlaceBarr(tx,ty))continue;
    const L=BARR[clamp(player.barricadeLvl,1,BARR.length)-1];
    setTile(tx,ty,T_BARRICADE);
    barricades.set(tx+','+ty,{lvl:clamp(player.barricadeLvl,1,BARR.length),hp:L.hp,max:L.hp,hitT:-9});
    player.barricades--;
    burst(tx*TILE+16,ty*TILE+16,8,L.col,110,2.6);
    SFX.place();vib(15);
    if(tx*TILE+16>player.x+2)player.facing=1;else if(tx*TILE+16<player.x-2)player.facing=-1;
    return;
  }
  floatText(player.x,player.y-64,'Здесь не поставить','#ff9a3c');SFX.uiBack();
}
function drawBarricades(g,tx0,tx1,ty0,ty1){
  for(let ty=ty0;ty<=ty1;ty++){
    for(let tx=tx0;tx<=tx1;tx++){
      if(getTile(tx,ty)!==T_BARRICADE)continue;
      const b=barrAt(tx,ty);
      const x=tx*TILE,y=ty*TILE,lv=b.lvl;
      g.save();
      if(lv===1){
        g.fillStyle='#4a2c14';g.fillRect(x,y,TILE,TILE);
        for(let k=0;k<3;k++){g.fillStyle=k%2?'#8a5a30':'#7a4e28';g.fillRect(x+1,y+1+k*10,TILE-2,9);g.fillStyle='rgba(255,220,170,.12)';g.fillRect(x+1,y+1+k*10,TILE-2,2);}
        g.strokeStyle='#5a3618';g.lineWidth=4;g.beginPath();g.moveTo(x+3,y+3);g.lineTo(x+29,y+29);g.stroke();
        g.fillStyle='#c8c8d0';for(const [nx,ny] of [[4,4],[28,4],[4,28],[28,28],[16,16]])g.fillRect(x+nx-1,y+ny-1,2.4,2.4);
      }else if(lv===2){
        g.fillStyle='#4a4e58';g.fillRect(x,y,TILE,TILE);
        for(let r=0;r<4;r++){const off=(r%2)?8:0;for(let k=-1;k<2;k++){const bx=x+off+k*16+1;const cx0=Math.max(x+1,bx),cw=Math.min(x+TILE-1,bx+14)-cx0;if(cw<=0)continue;
          g.fillStyle=((r+k)%2)?'#868c98':'#7a808c';g.fillRect(cx0,y+r*8+1,cw,6);g.fillStyle='rgba(255,255,255,.14)';g.fillRect(cx0,y+r*8+1,cw,1.4);}}
      }else if(lv===3){
        const gr=g.createLinearGradient(x,y,x+TILE,y+TILE);gr.addColorStop(0,'#c8d2e0');gr.addColorStop(0.5,'#8a96a8');gr.addColorStop(1,'#5a6474');
        g.fillStyle=gr;g.fillRect(x,y,TILE,TILE);
        g.strokeStyle='#4a5260';g.lineWidth=2;g.strokeRect(x+2,y+2,TILE-4,TILE-4);
        g.strokeStyle='rgba(60,70,84,.8)';g.lineWidth=3;g.beginPath();g.moveTo(x+4,y+4);g.lineTo(x+28,y+28);g.moveTo(x+28,y+4);g.lineTo(x+4,y+28);g.stroke();
        g.fillStyle='#e8eef6';for(const [nx,ny] of [[5,5],[27,5],[5,27],[27,27]]){g.beginPath();g.arc(x+nx,y+ny,1.8,0,TAU);g.fill();}
      }else if(lv>=5){
        const C=lv===5?['#2a201c','#4a3a34','#ff8a3a']:lv===6?['#2a0806','#6a1408','#ffb030']:['#8a8270','#d8d0bc','#7ad8ff'];
        g.fillStyle=C[0];g.fillRect(x,y,TILE,TILE);
        g.fillStyle=C[1];for(let k=0;k<3;k++)g.fillRect(x+2+k*10,y+2,8,TILE-4);
        g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x,y+15,TILE,2);
        const a=0.45+0.35*Math.sin(G.time*3+tx+ty);
        g.strokeStyle=hexA(C[2],a);g.lineWidth=1.6;g.strokeRect(x+3,y+3,TILE-6,TILE-6);
        if(lv===7){g.fillStyle='#f0e8d4';g.beginPath();g.arc(x+16,y+14,5,0,TAU);g.fill();g.fillStyle='#1a1410';g.fillRect(x+13,y+13,2,2);g.fillRect(x+17,y+13,2,2);}
        if(lv===6){g.fillStyle=hexA('#ff7a1a',a*0.6);g.fillRect(x+14,y+4,4,24);}
      }else{
        g.fillStyle='#120c20';g.fillRect(x,y,TILE,TILE);
        g.fillStyle='#2a1e44';g.beginPath();g.moveTo(x+2,y+2);g.lineTo(x+30,y+2);g.lineTo(x+22,y+16);g.lineTo(x+30,y+30);g.lineTo(x+2,y+30);g.lineTo(x+10,y+16);g.closePath();g.fill();
        const a=0.55+0.35*Math.sin(G.time*2.5+tx+ty);
        g.strokeStyle='rgba(190,140,255,'+a.toFixed(2)+')';g.lineWidth=1.5;
        g.beginPath();g.moveTo(x+16,y+6);g.lineTo(x+20,y+16);g.lineTo(x+16,y+26);g.lineTo(x+12,y+16);g.closePath();g.stroke();
        g.fillStyle='rgba(255,255,255,.12)';g.fillRect(x+3,y+3,10,2);
      }
      /* трещины по мере износа */
      const r=b.hp/b.max;
      if(r<0.7){
        g.strokeStyle='rgba(15,10,6,.75)';g.lineWidth=1.4;
        g.beginPath();g.moveTo(x+6,y+4);g.lineTo(x+12,y+13);g.lineTo(x+9,y+20);
        if(r<0.4){g.moveTo(x+24,y+6);g.lineTo(x+19,y+15);g.lineTo(x+26,y+24);g.lineTo(x+20,y+29);g.moveTo(x+12,y+13);g.lineTo(x+19,y+15);}
        g.stroke();
      }
      if(G.time-b.hitT<0.15){g.fillStyle='rgba(255,255,255,.45)';g.fillRect(x,y,TILE,TILE);}
      if(r<0.999&&G.time-b.hitT<4){
        g.fillStyle='rgba(0,0,0,.6)';g.fillRect(x+3,y-7,TILE-6,4);
        g.fillStyle=r>0.5?'#7ad07a':r>0.25?'#ffcc33':'#ff5a4a';g.fillRect(x+4,y-6,(TILE-8)*clamp(r,0,1),2);
      }
      g.restore();
    }
  }
}


const tileMods=new Map();
const tileModsByChunk=new Map();
