# Перенос прототипа модели в игру.
#   python3 integrate.py <прототип.js>                 — заменяет методы LM_MODEL в js/54 (прототип без своих помощников)
#   python3 integrate.py <прототип.js> js/NN-имя.js   — кладёт прототип целиком отдельным файлом (с помощниками),
#        убирает из объекта LM_MODEL в 54 старые методы тех же мобов и подключает файл в index.html после 54
import re,sys,os
ROOT=os.path.normpath(os.path.join(os.path.dirname(__file__),'../../../..'))
src=open(sys.argv[1]).read();p=os.path.join(ROOT,'js/54-lilac-mob-models.js');dst=open(p).read()
def match(s,i):
  d=0;j=i;q=None
  while j<len(s):
    c=s[j]
    if q:
      if c=='\\':j+=2;continue
      if c==q:q=None
    elif c in '\'"`':q=c
    elif s.startswith('/*',j):j=s.index('*/',j)+2;continue
    elif s.startswith('//',j):j=s.index('\n',j);continue
    elif c=='{':d+=1
    elif c=='}':
      d-=1
      if d==0:return j
    j+=1
ids=[m.group(1) for m in re.finditer(r'LM_MODEL\.(\w+)\s*=\s*function',src)]
if len(sys.argv)>2:
  out=os.path.join(ROOT,sys.argv[2]);rel=sys.argv[2].replace('\\','/')
  body=src if src.lstrip().startswith("'use strict'") else "'use strict';\n"+src
  open(out,'w').write(body if body.endswith('\n') else body+'\n');print('файл',rel)
  for mid in ids:
    k=re.search(r'\n  '+mid+r'\(([^)]*)\)\{',dst)
    if not k:print('в 54 нет старого',mid);continue
    e1=match(dst,k.end()-1);end=e1+1
    if dst[end:end+1]==',':end+=1
    dst=dst[:k.start()]+dst[end:];print('убран старый',mid)
  open(p,'w').write(dst)
  ih=os.path.join(ROOT,'index.html');h=open(ih).read();tag='<script src="'+rel+'"></script>'
  if tag not in h:
    last=None
    for a in re.finditer(r'<script src="js/(\d\d)-[^"]+"></script>',h):
      if a.group(1)<=os.path.basename(rel)[:2]:last=a
    h=h[:last.end()]+'\n'+tag+h[last.end():];open(ih,'w').write(h);print('подключён в index.html')
  sys.exit()
for m in re.finditer(r'LM_MODEL\.(\w+)\s*=\s*function\s*\(([^)]*)\)\s*\{',src):
  mid,args=m.group(1),m.group(2);b0=m.end()-1;b1=match(src,b0);body=src[b0:b1+1].replace('\n','\n  ')
  k=re.search(r'\n  '+mid+r'\(([^)]*)\)\{',dst)
  if not k:print('нет в 54:',mid);continue
  e0=k.end()-1;e1=match(dst,e0)
  dst=dst[:k.start()]+'\n  '+mid+'('+args+')'+body+dst[e1+1:];print('заменён',mid)
open(p,'w').write(dst)
