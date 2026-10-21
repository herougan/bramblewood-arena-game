# 3-way merge of a translation pack keyed by English source text (2026-10-21, workflow audit; was a session scratch file).
# A key edited on one side only takes that side; edited on both, the branch being merged wins; deleted on our side stays deleted.
import json,subprocess,sys
def show(ref,p):
    try: return json.loads(subprocess.check_output(['git','show',f'{ref}:{p}'],stderr=subprocess.DEVNULL))
    except subprocess.CalledProcessError: return {}
mb=subprocess.check_output(['git','merge-base','HEAD','MERGE_HEAD']).decode().strip()
for p in sys.argv[1:]:
    base=show(mb,p); ours=show('HEAD',p); theirs=show('MERGE_HEAD',p)
    out=dict(theirs)
    for k,v in ours.items():
        if base.get(k)!=v and not (k in theirs and theirs[k]!=base.get(k)): out[k]=v
    for k in list(out):
        if k in base and k not in ours and theirs.get(k)==base.get(k): out.pop(k)
    order={k:i for i,k in enumerate(theirs)}
    items=sorted(out.items(), key=lambda kv: order.get(kv[0],10**9))
    open(p,'w',encoding='utf-8').write(json.dumps(dict(items),ensure_ascii=False,indent=1)+'\n')
    print('merged',p)
