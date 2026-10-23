-- 2026-10-23 (package RW5): HUB3's junk id. The owner's live card "ember-tetra-3caj" (2026-10-21) was folded into canonical/cards.json by BF7
-- and is now the card "ember-tetra" (a Pack 3 card of the Ashen Spurn). The game skips the old row already (arena_app.js CARD_ID_RENAMED), so
-- this only tidies the table. Apply only on the owner's "apply it".
-- Read first:  select id, deleted, updated_at from card_overrides where id = 'ember-tetra-3caj';
delete from card_overrides where id = 'ember-tetra-3caj';
