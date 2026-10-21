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
        if key.startswith('if [[') and '--e2e' in key:
            prev = [j for j, l in enumerate(out) if l.strip().startswith('if [[') and '--e2e' in l]
            if prev:  # two versions of the --e2e line: one line with every test from both, in order
                items = []
                for l in (out[prev[0]], line):
                    for it in re.findall(r'run python3 [^\s;]+', l):
                        if it not in items: items.append(it)
                out[prev[0]] = 'if [[ "${1:-}" == "--e2e" ]]; then ' + '; '.join(items) + '; fi'
                continue
        seen.add(key); out.append(line)
    s = '\n'.join(out)
open(p, 'w', encoding='utf-8').write(s)
print('union', p)
