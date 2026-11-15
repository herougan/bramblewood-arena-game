# Bramblewood Lab

One program on your Mac that runs and sums up every simulation: road measures, deck optimising, the free player's journey, the economy, what-ifs and the repo's other balance tools. It keeps every result and pools them.

## Open it
1. GitHub → Actions → **Lab build** → the newest run → download **BramblewoodLab-mac-arm64** (Apple silicon) or **-x64** (Intel).
2. Unzip, drag **Bramblewood Lab.app** to Applications.
3. First open only: right-click → **Open** (on macOS 15: try to open it once, then System Settings → Privacy & Security → **Open Anyway**). It is signed ad hoc, not with an Apple account.
4. Your browser opens on the Lab (http://127.0.0.1:47800). Opening the app again just brings the page back. **Quit Lab** is on the Queue tab.

Headless (overnight, Terminal): `"/Applications/Bramblewood Lab.app/Contents/MacOS/BramblewoodLab" help` lists the commands, e.g. `... measure --games 200`, `... journey --to 20 --seeds 20`, `... queue add measure --games 400` then `... queue run`. From a checkout: `node tools/lab/lab.js help`.

## Before every run it pulls
It asks GitHub for `main`'s newest commit and downloads only the files the sims read (about 100 MB the first time, then only what changed; never the 850 MB of docs). Each result records the commit (sha) and a **data hash**: the cards, map lists, fights, reference decks and engine. Offline, it uses the last pull and says so. **Live card edits** (header switch) lays the live Supabase `card_overrides` over the cards for new runs; read only.

## Tabs
- **Dashboard**: road status, main and side (in band / within 10 / beyond 20, Maps 0-20, curve fights, no endless floors), worst fights with how many more games a ±5 reading needs, a per-map table, every fight, and the trend across all results (yours and the repo's saved ones).
- **Road measure**: the Map reference deck against every road fight, N games, on all cores (`tools/skirmish_pass.js`). Options: seed, maps, only some fights, another reference deck.
- **Optimiser**: the best deck from a card list you give (copies and levels optional) for a map (`tools/opt/deckopt.js`). "Use the map's own cards" fills the list.
- **Journey**: seeded free players from Map 0 to N with the game's own rewards and pack draws, then extra farming days (default 30). Charts: cards owned by day, map reached by day, win rate per map against the band, deck power, Leaves and Dust. Deck: a quick pick from the map's known best decks, or the optimiser every K maps.
- **Economy**: the ECON2 dedicated and casual players day by day.
- **What-if**: change a card's cost / wait / Attack / Health / skills in a private copy and re-measure the fights that hold it, before and after on the same games. Nothing live or in the repo changes.
- **Compare**: two results fight by fight; which differences are beyond noise.
- **Tools**: the repo's other sims as they are (card contribution, skill worth, skill canon, PRO ease, the 100 reference players, the BAL13 summary, raids, ...).
- **Runs**: every Lab run (CSV and JSON), the import of every saved road result in docs/balance, and a list of every kind of saved file with headline numbers.
- **Queue**: one run at a time, each on all cores; progress, cancel, an overnight set. A stopped road measure resumes when queued again.

## How aggregation works
Runs on the **same data hash** with the same reference deck pool: wins and games are added per fight, and the win rate gets a Wilson 95% interval. Each run plays fresh seeds (a blank seed picks a new set), so two 1-million-game runs make a 2-million-game result; a repeated seed set is counted once. A different data hash (the game changed) is a new point on the trend, never mixed in. Saved results from the repo are each their own point (their inputs were not recorded).

Data folder: `~/Library/Application Support/BramblewoodLab` (runs.jsonl, the queue, the downloaded game files).
