/* детерминированный запуск: свой генератор случайных чисел, ручные кадры, виртуальное время */
(()=>{let s=12345;Math.random=function(){s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
  let vt=1000;const q=[];window.__vt=()=>vt;
  const _pn=performance.now.bind(performance);window.__realNow=_pn;performance.now=()=>vt;Date.now=()=>1700000000000+vt;
  window.requestAnimationFrame=(cb)=>{q.push(cb);return q.length;};
  window.__step=(n,ms)=>{for(let i=0;i<n;i++){vt+=ms||1000/60;const cbs=q.splice(0);for(const cb of cbs)cb(vt);}};
})();
