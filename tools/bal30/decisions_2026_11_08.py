#!/usr/bin/env python3
"""BAL30 (2026-11-08): close ENG33-4's Bulwark price question (owner 17:22: "Bulwark - estimate yourself") and fix ENG36-3's stale price sentence.
One decision a line in docs/decisions.json; only those two lines change."""
import json
P = 'docs/decisions.json'
out = []
for line in open(P, encoding='utf-8').read().split('\n'):
    s = line.strip().rstrip(',')
    if s.startswith('{"id": "ENG33-4"'):
        e = json.loads(s)
        e['status'] = 'DONE'
        e['decided'] = '2026-11-08'
        e['answer'] = ('2026-11-08 17:22: Owner: "Bulwark - estimate yourself." Claude (BAL30): Bulwark is 6.65 x N^0.47: 6.65 for one wall, 9.2 for two, 11.1 for three '
                       '(was 3.5 a wall: 3.5 / 7). The ladder reads a 0/4 wall at 6.2 and two at 8.5: the first wall carries most of the worth; +8% as walls grow to 0/8 at Level 10. '
                       'No card re-fitted (Sloth Titan 77%, Lodgekeeper 75% of budget).')
        e['body'] = e['body'].replace('Log Walls are 0/8 (3.5 a wall)', 'Log Walls were priced 3.5 a wall')
        line = '    ' + json.dumps(e, ensure_ascii=False) + (',' if line.rstrip().endswith(',') else '')
    elif s.startswith('{"id": "ENG36-3"'):
        e = json.loads(s)
        e['body'] = e['body'].replace("Bulwark's price (3.5 a wall) is unchanged.", "Bulwark's price is now 6.65 x N^0.47 (BAL30, ENG33-4).")
        line = '    ' + json.dumps(e, ensure_ascii=False) + (',' if line.rstrip().endswith(',') else '')
    out.append(line)
open(P, 'w', encoding='utf-8').write('\n'.join(out))
