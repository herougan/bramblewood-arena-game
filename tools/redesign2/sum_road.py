import json,sys,collections
R=json.load(open(sys.argv[1]))
bym=collections.defaultdict(list)
for f in R: bym[f['map']].append(f)
for m in sorted(bym):
    fs=bym[m]
    print(f"=== Map {m} {fs[0]['mapName']} ({fs[0]['mapId']})")
    rk=collections.Counter(); sk=collections.Counter(); trig=collections.Counter(); cast=collections.Counter(); lead=[]
    for f in fs:
        for k,v in (f['rules'] or {}).items():
            if v not in (None,False,0,'') and k not in ('phase',): rk[f"{k}={v}" if not isinstance(v,(dict,list)) else k]+=1
        rk['phase='+str((f['rules'] or {}).get('phase'))]+=1
        for k in (f['castle'] or {}).get('effects',{}): cast[k]+=1
        if f.get('leaders'): lead.append(f['key']+':'+json.dumps(f['leaders'])[:80])
        for c in f['deck']:
            for k in c['effects']: sk[k]+=c['k']
            for t in (c['triggers'] or []):
                trig[(t.get('on') or '?')+'>'+str(t.get('do') or t.get('action') or '?')]+=c['k']
    print(' fights:', ', '.join(f"{f['key']}({f['kind']})" for f in fs))
    print(' rules:', dict(rk))
    print(' castle fx:', dict(cast))
    print(' enemy skills (copies):', ', '.join(f"{k}:{v}" for k,v in sk.most_common()))
    print(' triggers:', ', '.join(f"{k}:{v}" for k,v in trig.most_common(8)))
    print(' leaders:', '; '.join(lead)[:400])
