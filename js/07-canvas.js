'use strict';
/* ============================================================
   CANVAS
   ============================================================ */
const canvas=document.getElementById('c');
const ctx=canvas.getContext('2d');
const lightCanvas=document.createElement('canvas');
const lctx=lightCanvas.getContext('2d');
let dpr=1;
const view={W:360,H:640,scale:1};

let needRedraw=true;
function resize(){
  try{
    const rect=canvas.getBoundingClientRect();
    const w=Math.max(200,Math.floor(rect.width||canvas.clientWidth||window.innerWidth));
    const h=Math.max(200,Math.floor(rect.height||canvas.clientHeight||window.innerHeight));
    let nd=Math.min(2,window.devicePixelRatio||1);
    if(settings.quality==='low')nd=Math.min(1,nd);
    nd=Math.max(0.75,nd*(G.renderScale||1));          /* адаптивное разрешение при долгой нагрузке */
    const cw=Math.floor(w*nd), ch=Math.floor(h*nd);
    dpr=nd;
    if(w===view.W && h===view.H && (cw!==canvas.width||ch!==canvas.height)){
      /* поменялось только разрешение отрисовки: управление и раскладку не трогаем */
      canvas.width=cw;canvas.height=ch;needRedraw=true;
      return;
    }
    if(cw===canvas.width && ch===canvas.height && w===view.W && h===view.H){
      updateJoyBase();
      return;
    }
    canvas.width=cw;
    canvas.height=ch;
    view.W=w;view.H=h;
    view.scale=Math.min(w/(11*TILE),h/(19*TILE));
    view.scale=Math.max(0.65,view.scale);
    if(!settings.controlsCustomized)settings.controls=getDefaultControls();
    lightCanvas.width=Math.max(64,Math.floor(w/2));
    lightCanvas.height=Math.max(64,Math.floor(h/2));
    updateJoyBase();
    resetAllInputs();
    needRedraw=true;
  }catch(e){}
}
window.addEventListener('resize',()=>{try{resize();}catch(e){}});
window.addEventListener('orientationchange',()=>{setTimeout(()=>{try{resize();}catch(e){}},260);});

function getCanvasPoint(e){
  const r=canvas.getBoundingClientRect();
  return {x:e.clientX-r.left, y:e.clientY-r.top};
}
