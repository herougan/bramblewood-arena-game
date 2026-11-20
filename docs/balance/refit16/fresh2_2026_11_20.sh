#!/bin/bash
# 2026-11-20 (package REFIT16): the fresh check (seeds 151100 / 152100, 400 games) of the Map 17 candidates and 13-8's second step.
cd "$(dirname "$0")" || exit 1
P=./pair_2026_11_20.sh
bash $P 17-7 400 out=ringed-seal:4+add=harbor-seal:4 out=warhorse-charger:1+add=briarback-hedgehog:1 out=ringed-seal:4,warhorse-charger:1+add=harbor-seal:4,briarback-hedgehog:1 out=warhorse-charger:1+add=ice-crevasse-wolf:1
bash $P 17-6 400 out=ringed-seal:4+add=harbor-seal:4 out=warhorse-charger:1+add=briarback-hedgehog:1 out=ringed-seal:4,warhorse-charger:1+add=harbor-seal:4,briarback-hedgehog:1 out=warhorse-charger:1+add=cataphract-destrier:1
bash $P 17-4 400 out=ice-crevasse-wolf:1+add=snow-ermine:1 out=elderhorn-monarch:1+add=snowshoe-hare:1 out=arctic-tern:1+add=snow-ermine:1 out=ice-crevasse-wolf:1,elderhorn-monarch:1+add=snow-ermine:1,snowshoe-hare:1
bash $P 13-8 400 out=slow-worm:1,beaver-feller:1+add=amber-cicada:1,redwood-woodpecker:1 out=slow-worm:1,tasmanian-devil:1+add=amber-cicada:1,bramblewood-lynx:1 out=slow-worm:1,owl-nightwatch:1+add=amber-cicada:1,redwood-woodpecker:1
echo FRESH2 DONE
