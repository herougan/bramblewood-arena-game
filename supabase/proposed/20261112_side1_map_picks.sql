-- 2026-11-12 (package SIDE1, phase A). PROPOSED ONLY: run it only after the owner says "apply it" for this change.
-- Claude's side-map Yes picks (docs/design/side-picks-proposal-2026-11-12.json) as the owner's Map cards flags (card_overrides rows
-- __cfg:map-picks:<side map>, the shape ui37Publish writes: {kind, mapId, mapNo, yes, no, targets}). A row the owner already filled is left alone
-- (The Old Bramble has his own picks and is not in this file). No flag reads as No in the window, so only the Yes cards are written.
insert into card_overrides (id, data, deleted, deleted_snapshot, updated_at)
  values ('__cfg:map-picks:mq', '{"kind":"map-picks","mapId":"mq","mapNo":1,"yes":["lucky-hopper","jackrabbit-sprinter","clover-butterfly","chipmunk-cavalry","cottontail","robin-redbreast","dormouse","puddle-skimmer","honey-bee","bee-forager"],"no":[],"targets":{}}'::jsonb, false, null, now())
  on conflict (id) do update set data = excluded.data, deleted = false, updated_at = now()
  where card_overrides.deleted or card_overrides.data is null or coalesce(jsonb_array_length(card_overrides.data->'yes'), 0) = 0;
insert into card_overrides (id, data, deleted, deleted_snapshot, updated_at)
  values ('__cfg:map-picks:mp', '{"kind":"map-picks","mapId":"mp","mapNo":2,"yes":["riverworks-bastion","lodge-engineer","dam-keeper-beaver","beaver-lumberjack","muskrat-reedgatherer","muskrat-lodgekeeper","duck-paddler","snapstick-turtle","pond-algae","raft-spider","water-shrew"],"no":[],"targets":{}}'::jsonb, false, null, now())
  on conflict (id) do update set data = excluded.data, deleted = false, updated_at = now()
  where card_overrides.deleted or card_overrides.data is null or coalesce(jsonb_array_length(card_overrides.data->'yes'), 0) = 0;
insert into card_overrides (id, data, deleted, deleted_snapshot, updated_at)
  values ('__cfg:map-picks:mg', '{"kind":"map-picks","mapId":"mg","mapNo":2,"yes":["octopus-tactician","raccoon-nightcrew","salvager-hermit-crab","gull-thief","pincushion-urchin","limpet-clinger","open-ocean-hermit-crab","driftwood-crab","rock-pool-starfish"],"no":[],"targets":{}}'::jsonb, false, null, now())
  on conflict (id) do update set data = excluded.data, deleted = false, updated_at = now()
  where card_overrides.deleted or card_overrides.data is null or coalesce(jsonb_array_length(card_overrides.data->'yes'), 0) = 0;
insert into card_overrides (id, data, deleted, deleted_snapshot, updated_at)
  values ('__cfg:map-picks:ms', '{"kind":"map-picks","mapId":"ms","mapNo":5,"yes":["hedgehog-herbalist","peat-cutter-vole","mudflat-godwit","snapper-hatchling","swamp-alligator","constrictor-coil","muskrat-reedgatherer","mudpuppy","newt-doctor","nutria-reedcutter","cypress-root-lurker","crocodile-ambusher"],"no":[],"targets":{}}'::jsonb, false, null, now())
  on conflict (id) do update set data = excluded.data, deleted = false, updated_at = now()
  where card_overrides.deleted or card_overrides.data is null or coalesce(jsonb_array_length(card_overrides.data->'yes'), 0) = 0;
insert into card_overrides (id, data, deleted, deleted_snapshot, updated_at)
  values ('__cfg:map-picks:mz', '{"kind":"map-picks","mapId":"mz","mapNo":7,"yes":["rootworm-colony","fungal-colossus","tunnel-wyrm","rot-swollen-carcass","puffball-bombardier","fungus-gnat-cloud","leopard-slug","compost-grub","hawthorn-shieldbug","planarian-splitter","earthworm"],"no":[],"targets":{}}'::jsonb, false, null, now())
  on conflict (id) do update set data = excluded.data, deleted = false, updated_at = now()
  where card_overrides.deleted or card_overrides.data is null or coalesce(jsonb_array_length(card_overrides.data->'yes'), 0) = 0;
insert into card_overrides (id, data, deleted, deleted_snapshot, updated_at)
  values ('__cfg:map-picks:mn', '{"kind":"map-picks","mapId":"mn","mapNo":8,"yes":["lantern-spark-fly","glimmer-spider","cave-swiftlet","sulfur-cinder-moth","gallery-orb-weaver","echo-screecher","stalactite-golem","cave-olm","quarry-mole","giant-cave-huntsman","barrow-leech-bat"],"no":[],"targets":{}}'::jsonb, false, null, now())
  on conflict (id) do update set data = excluded.data, deleted = false, updated_at = now()
  where card_overrides.deleted or card_overrides.data is null or coalesce(jsonb_array_length(card_overrides.data->'yes'), 0) = 0;
insert into card_overrides (id, data, deleted, deleted_snapshot, updated_at)
  values ('__cfg:map-picks:mj', '{"kind":"map-picks","mapId":"mj","mapNo":10,"yes":["blue-ringed-octopus","kraken-spawnling","riptide-eel","coral-current-eel","reef-shark","moon-jelly","sea-turtle-elder","krill-swarm","giant-clam"],"no":[],"targets":{}}'::jsonb, false, null, now())
  on conflict (id) do update set data = excluded.data, deleted = false, updated_at = now()
  where card_overrides.deleted or card_overrides.data is null or coalesce(jsonb_array_length(card_overrides.data->'yes'), 0) = 0;
insert into card_overrides (id, data, deleted, deleted_snapshot, updated_at)
  values ('__cfg:map-picks:mv', '{"kind":"map-picks","mapId":"mv","mapNo":11,"yes":["wound-reaver","great-horned-owl","sparrow-chick","eyrie-warden","eagle-owl-quartermaster","golden-eagle-diver","the-gannet-queen","chamois-leaper","anvil-thrush","peak-condor","peregrine-stooper"],"no":[],"targets":{}}'::jsonb, false, null, now())
  on conflict (id) do update set data = excluded.data, deleted = false, updated_at = now()
  where card_overrides.deleted or card_overrides.data is null or coalesce(jsonb_array_length(card_overrides.data->'yes'), 0) = 0;
insert into card_overrides (id, data, deleted, deleted_snapshot, updated_at)
  values ('__cfg:map-picks:my', '{"kind":"map-picks","mapId":"my","mapNo":14,"yes":["jaguar-stalker","kinkajou-lurker","hercules-beetle","bramblewood-macaque","proboscis-monkey","camouflage-frog","fishing-cat","amber-cicada","mosquito-cloud"],"no":[],"targets":{}}'::jsonb, false, null, now())
  on conflict (id) do update set data = excluded.data, deleted = false, updated_at = now()
  where card_overrides.deleted or card_overrides.data is null or coalesce(jsonb_array_length(card_overrides.data->'yes'), 0) = 0;
insert into card_overrides (id, data, deleted, deleted_snapshot, updated_at)
  values ('__cfg:map-picks:mi', '{"kind":"map-picks","mapId":"mi","mapNo":17,"yes":["greenland-shark","frostbitten-wolverine","harp-seal-pup","snow-ermine","ringed-seal","harbor-seal","glacier-yak","walrus-icebreaker","ice-crevasse-wolf","polar-bear"],"no":[],"targets":{}}'::jsonb, false, null, now())
  on conflict (id) do update set data = excluded.data, deleted = false, updated_at = now()
  where card_overrides.deleted or card_overrides.data is null or coalesce(jsonb_array_length(card_overrides.data->'yes'), 0) = 0;
insert into card_overrides (id, data, deleted, deleted_snapshot, updated_at)
  values ('__cfg:map-picks:mpd', '{"kind":"map-picks","mapId":"mpd","mapNo":18,"yes":["quicksand-queen","sandstorm-roc","antlion-pit","dune-jackal","barrel-cactus","roadrunner-courier","horned-lizard","nightjar-drifter","sunbittern-strider","caustic-scorpion"],"no":[],"targets":{}}'::jsonb, false, null, now())
  on conflict (id) do update set data = excluded.data, deleted = false, updated_at = now()
  where card_overrides.deleted or card_overrides.data is null or coalesce(jsonb_array_length(card_overrides.data->'yes'), 0) = 0;
insert into card_overrides (id, data, deleted, deleted_snapshot, updated_at)
  values ('__cfg:map-picks:m9', '{"kind":"map-picks","mapId":"m9","mapNo":19,"yes":["ember-revenant","grindstone-boar","fire-salamander","obsidian-scorpion","smoke-raccoon","pumice-beetle","cinder-hornet","cinder-gecko","basalt-boar","cinder-skeleton"],"no":[],"targets":{}}'::jsonb, false, null, now())
  on conflict (id) do update set data = excluded.data, deleted = false, updated_at = now()
  where card_overrides.deleted or card_overrides.data is null or coalesce(jsonb_array_length(card_overrides.data->'yes'), 0) = 0;
insert into card_overrides (id, data, deleted, deleted_snapshot, updated_at)
  values ('__cfg:map-picks:me', '{"kind":"map-picks","mapId":"me","mapNo":20,"yes":["the-contradiction","obsidian-lich","ash-moth","berserker-boar","basalt-boar","sulfur-vent-crab","ur-elk","magma-salamander","obsidian-scorpion","honey-badger-fury"],"no":[],"targets":{}}'::jsonb, false, null, now())
  on conflict (id) do update set data = excluded.data, deleted = false, updated_at = now()
  where card_overrides.deleted or card_overrides.data is null or coalesce(jsonb_array_length(card_overrides.data->'yes'), 0) = 0;
insert into card_overrides (id, data, deleted, deleted_snapshot, updated_at)
  values ('__cfg:map-picks:mx', '{"kind":"map-picks","mapId":"mx","mapNo":20,"yes":["caldera-wyrm","fire-drake-hatchling","magma-salamander","fumarole-ibex","obsidian-scorpion","quillback-elder","fire-salamander","basalt-boar","ur-elk"],"no":[],"targets":{}}'::jsonb, false, null, now())
  on conflict (id) do update set data = excluded.data, deleted = false, updated_at = now()
  where card_overrides.deleted or card_overrides.data is null or coalesce(jsonb_array_length(card_overrides.data->'yes'), 0) = 0;
