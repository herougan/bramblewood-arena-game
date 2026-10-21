# Resolve a text conflict by keeping both sides (2026-10-21, workflow audit). Used for docs/CHANGELOG.md and tests/run-all.sh only.
# For run-all.sh, a line that appears twice after the union is kept once. Never use this on .js or .json files.
import sys, re
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
s = re.sub(r'^<<<<<<< .*\n', '', s, flags=re.M)
s = re.sub(r'^=======\n', '', s, flags=re.M)
s = re.sub(r'^>>>>>>> .*\n', '', s, flags=re.M)
if p.endswith('.sh'):
    seen, out = set(), []
    for line in s.split('\n'):
        key = line.strip()
        if key.startswith('run ') and key in seen:
            continue
        seen.add(key); out.append(line)
    s = '\n'.join(out)
open(p, 'w', encoding='utf-8').write(s)
print('union', p)
