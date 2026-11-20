#!/bin/bash
# 2026-11-20 (package REFIT15): the fresh check (seeds 141100 / 142100, 400 games) of the search's candidates (search-2026-11-20.jsonl, acc.jsonl)
# and the castle levers left by the brief (Shield between 0 and the rule; Health only down to the 60% floor). hq values are node.hqHp
# (the castle reads half: BRAMBLE_SCALE).
cd "$(dirname "$0")" || exit 1
P=./pair_2026_11_20.sh
bash $P 5-2 400 out=nutria-reedcutter:1+add=muskrat-reedgatherer:1
bash $P 2-2 400 out=duck-paddler:1+add=hedgerow-shrew:1 shield=0 out=duck-paddler:1+add=hedgerow-shrew:1+shield=0
bash $P 4-3 400 shield=0
bash $P 3-5 400 out=golden-eagle-diver:2,kittiwake-flock:1,beachcomber-sanderling:2,limpet-clinger:1+add=feral-tomcat:4,pika-hoarder:2
bash $P 1-4 400 out=cottontail:1+add=jackrabbit-sprinter:1
bash $P 0-3 400 out=worker-ant:2+add=ant-scout:2
bash $P 4-1 400 out=slow-worm:2,lotus-frog:1+add=water-shrew:3 out=slow-worm:2,lotus-frog:1+add=water-shrew:3+hq=14 hq=14
bash $P 3-4 400 out=chipmunk-skirmisher:2+add=gannet-nestweaver:2 shield=0 out=chipmunk-skirmisher:2+add=gannet-nestweaver:2+shield=0
bash $P 5-5 400 shield=0 shield=2 hq=24 hq=18
bash $P 9-1 400 hq=24 hq=18
bash $P 7-2 400 out=fungus-gnat-cloud:2+add=planarian-splitter:1,sleepless-shrew:1 shield=4 shield=0 out=fungus-gnat-cloud:2+add=planarian-splitter:1,sleepless-shrew:1+shield=4
bash $P 2-3 400 out=open-ocean-hermit-crab:1+add=puddle-skimmer:1
bash $P 9-4 400 hq=24 hq=18
bash $P 7-3 400 out=puffball-bombardier:1,cypress-root-lurker:1+add=amber-cicada:1,earthworm:1 shield=4 shield=0 out=puffball-bombardier:1,cypress-root-lurker:1+add=amber-cicada:1,earthworm:1+shield=4
bash $P 1-3 400 out=bee-knight:1,bramble-sprout:4+add=dormouse:1,terrier-pup:4
echo FRESH DONE
