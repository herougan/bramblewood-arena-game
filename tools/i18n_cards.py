#!/usr/bin/env python3
"""Card-name translation coverage (2026-10-18, audit I2: about 360 player-visible card names were in no language pack).

The page translator (bramblewood-i18n.js) translates card names (.nm) by looking them up in the built pack. Card names live in
lang/cards/<code>.json and are merged into lang/<code>.json by assemble_arena.py (the main pack wins on a clash). A card is
player-visible unless it is a test card (`test: true`, the Codex's own filter: renderCodexGrid hides them outside the dev-only
"Test cards" view), so test and reference filler cards ("Test: Poison", "Training Dummy", "Fork Filler" ...) are left out.

    python3 tools/i18n_cards.py            # coverage per language, and the names each one is missing
    python3 tools/i18n_cards.py --names    # list every missing name in full (default: the first 10 per language)

Exits 1 when a pack is missing a visible card name or lang/cards/<code>.json has a key that isn't a card name.
"""
import glob, json, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load(rel):
    p = os.path.join(ROOT, rel)
    return json.load(open(p, encoding='utf-8')) if os.path.exists(p) else {}


def visible_names():
    cards = load('canonical/cards.json')
    return sorted({c['name'] for c in cards if not c.get('test')}), {c['name'] for c in cards}


def codes():
    found = {os.path.basename(p)[:-5] for p in glob.glob(os.path.join(ROOT, 'lang', '*.json')) + glob.glob(os.path.join(ROOT, 'lang', 'cards', '*.json'))}
    return sorted(found - {'en'})


def main(argv):
    full = '--names' in argv
    visible, all_names = visible_names()
    bad = False
    print('%d player-visible card names (test cards excluded)\n' % len(visible))
    print('%-8s %8s %8s %8s  %s' % ('lang', 'covered', 'main', 'cards', 'missing'))
    for code in codes():
        main_pack, card_pack = load('lang/%s.json' % code), load('lang/cards/%s.json' % code)
        merged = dict(card_pack); merged.update(main_pack)
        missing = [n for n in visible if n not in merged]
        stray = sorted(k for k in card_pack if k not in all_names)
        empty = sorted(k for k, v in card_pack.items() if not isinstance(v, str) or not v.strip())
        print('%-8s %4d/%-3d %8d %8d  %d' % (code, len(visible) - len(missing), len(visible), sum(n in main_pack for n in visible), len(card_pack), len(missing)))
        for n in (missing if full else missing[:10]): print('           - %s' % n)
        if not full and len(missing) > 10: print('           … and %d more (--names)' % (len(missing) - 10))
        for k in stray: print('           ! lang/cards/%s.json: %r is not a card name' % (code, k))
        for k in empty: print('           ! lang/cards/%s.json: %r has an empty translation' % (code, k))
        bad = bad or bool(missing or stray or empty)
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
