# python3 integrate.py <прототип.js>: переносит LM_MODEL.id=function(...){...} из прототипа в js/54 (заменяет метод объекта LM_MODEL)
import re,sys
src=open(sys.argv[1]).read();p=__import__('os').path.join(__import__('os').path.dirname(__file__),'../../../../js/54-lilac-mob-models.js');dst=open(p).read()
def match(s,i):
  d=0;j=i;q=None
  while j<len(s):
    c=s[j]
    if q:
      if c=='\\':j+=2;continue
      if c==q:q=None
    elif c in '\'"`':q=c
    elif s.startswith('/*',j):j=s.index('*/',j)+2;continue
    elif c=='{':d+=1
    elif c=='}':
      d-=1
      if d==0:return j
    j+=1
for m in re.finditer(r'LM_MODEL\.(\w+)\s*=\s*function\s*\(([^)]*)\)\s*\{',src):
  mid,args=m.group(1),m.group(2);b0=m.end()-1;b1=match(src,b0);body=src[b0:b1+1].replace('\n','\n  ')
  k=re.search(r'\n  '+mid+r'\(([^)]*)\)\{',dst)
  if not k:print('нет в 54:',mid);continue
  e0=k.end()-1;e1=match(dst,e0)
  dst=dst[:k.start()]+'\n  '+mid+'('+args+')'+body+dst[e1+1:];print('заменён',mid)
open(p,'w').write(dst)
