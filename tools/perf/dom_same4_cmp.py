import json,sys,difflib,os
S=os.environ.get('DOMDIR','/tmp')
a=json.load(open(S+'/dom-%s.json'%sys.argv[1]));b=json.load(open(S+'/dom-%s.json'%sys.argv[2]))
print(len(a),len(b))
for x,y in zip(a,b):
    eq={k:(x['snap'][k]==y['snap'][k]) for k in x['snap']}
    print(x['round'],x['over'],x['logLen'],x['hp'],y['logLen'],y['hp'],eq)
    for k,v in eq.items():
        if not v:
            sm=difflib.SequenceMatcher(None,x['snap'][k],y['snap'][k],autojunk=False)
            for op in sm.get_opcodes():
                if op[0]!='equal': print('   ',k,op[0],repr(x['snap'][k][max(0,op[1]-30):op[2]+30])[:160],'|',repr(y['snap'][k][max(0,op[3]-30):op[4]+30])[:160]); break
