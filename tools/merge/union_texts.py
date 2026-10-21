# Resolve conflicts in bramblewood-texts.js's TEXT table where both sides appended keys (2026-10-21, workflow audit).
# Keeps both sides in order (ours, then theirs), fixes the commas between entries, refuses if a key ends up twice with
# different texts, and refuses any conflict outside the TEXT table. The caller checks the file still loads in node.
import re, sys
p = 'bramblewood-texts.js'
s = open(p, encoding='utf-8').read()
start, end = s.find('/*TEXT-TABLE-START*/'), s.find('/*TEXT-TABLE-END*/')
blocks = list(re.finditer(r'^<<<<<<< [^\n]*\n(.*?)^=======\n(.*?)^>>>>>>> [^\n]*\n', s, flags=re.M | re.S))
if not blocks or any(b.start() < start or b.end() > end for b in blocks):
    print('union_texts: conflict outside the TEXT table; resolve by hand'); sys.exit(1)
out, pos = [], 0
for b in blocks:
    out.append(s[pos:b.start()])
    lines = [l for l in (b.group(1) + b.group(2)).split('\n') if l.strip()]
    lines = [l.rstrip().rstrip(',') for l in lines]
    tail = s[b.end():].lstrip()
    last_in_table = tail.startswith('}')
    out.append(',\n'.join(lines) + ('\n' if last_in_table else ',\n'))
    pos = b.end()
out.append(s[pos:])
r = ''.join(out)
keys = re.findall(r'^\s*"([\w.-]+)"\s*:\s*("(?:[^"\\]|\\.)*")', r[start:r.find('/*TEXT-TABLE-END*/')], flags=re.M)
seen = {}
for k, v in keys:
    if k in seen and seen[k] != v: print('union_texts: key', k, 'has two different texts; resolve by hand'); sys.exit(1)
    seen[k] = v
open(p, 'w', encoding='utf-8').write(r)
print('union_texts: kept both sides of', len(blocks), 'conflict(s)')
