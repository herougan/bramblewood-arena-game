delete from card_overrides where id like '__cfg:map-pools:%'; -- after node tools/fold_map_pools.js has written them into canonical/map-pools.json and the build is deployed (owner: "apply it")
