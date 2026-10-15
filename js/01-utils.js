'use strict';
const clamp=(v,a,b)=>v<a?a:(v>b?b:v);
const lerp=(a,b,t)=>a+(b-a)*t;
const rnd=(a,b)=>a+Math.random()*(b-a);
const TAU=Math.PI*2;
function hash2(x,y,s){
  let h=Math.imul(x|0,374761393)^Math.imul(y|0,668265263)^Math.imul(s|0,1013904223);
  h=Math.imul(h^(h>>>13),1274126177);
  return (h^(h>>>16))>>>0;
}
function rnd2(x,y,s){return hash2(x,y,s)/4294967296;}
function vnoise(x,y,s){
  const xi=Math.floor(x),yi=Math.floor(y);
  const xf=x-xi,yf=y-yi;
  const u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
  const a=rnd2(xi,yi,s),b=rnd2(xi+1,yi,s),c=rnd2(xi,yi+1,s),d=rnd2(xi+1,yi+1,s);
  return lerp(lerp(a,b,u),lerp(c,d,u),v);
}
function fmt(n){
  n=Math.floor(n);
  if(n>=1e9)return (n/1e9).toFixed(2)+'B';
  if(n>=1e6)return (n/1e6).toFixed(2)+'M';
  if(n>=1e4)return (n/1e3).toFixed(1)+'K';
  return ''+n;
}
function hexA(hex,a){
  const n=parseInt(hex.slice(1),16);
  return 'rgba('+((n>>16)&255)+','+((n>>8)&255)+','+(n&255)+','+a+')';
}
