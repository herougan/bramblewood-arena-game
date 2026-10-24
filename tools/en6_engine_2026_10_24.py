#!/usr/bin/env python3
"""EN6 (2026-10-24, owner 03:17 + 12:02 #11 "03:17 - all"): the engine edits, applied once (each edit asserts its anchor is there once).
Hand-size, temperature, weather and season state skills (EN6_STATES, beside EN5's), Full Hand / Lean N, Hibernate, and the "– bramble" target
toggle on Arrow / Fire Arrow / Fire Bolt and on the Arrow, Missile and Deal damage actions.
  python3 tools/en6_engine_2026_10_24.py"""
import os, sys
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
P = os.path.join(ROOT, 'bramblewood-engine.js')
src = open(P, encoding='utf-8').read()
if 'EN6_STATES' in src: sys.exit('already applied')

def rep(old, new, count=1):
    global src
    n = src.count(old)
    assert n == count, (n, old[:90])
    src = src.replace(old, new)

BLOCK = r'''
  // ==== EN6 (2026-10-24, owner 03:17: "1. Based on number of cards in hand ... 2. Actions: Some actions like arrow - can have a subtoggle - bramble
  //   ... 3. Temperature based ... 4. What about 'salty'? ... like RAIN - {}, what else? ... hibernate?"; 12:02 #11: "03:17 - all") ====
  //   State skills like EN5's (Name – {…}: the braces while the state holds, the default when a card prints the plain name), read in
  //   condStatsOf with EN5's, so they turn on and off at every stat sync and share its 'stateSkill' event and the board's gold pip:
  //     plenty / scarcity        you hold 4+ cards / 1 or fewer (the hand limit is MAX_HAND 5)
  //     foePlenty / foeScarcity  the opponent holds 4+ / 1 or fewer
  //     heat                     the field is hot: Scorching, a hot map (rules.hotMap: the volcano, forge, frostfire and desert maps), the
  //                              volcano's fires (Scorched Ground, Wildfire Front, Lava Spout, Ash Rain), or Summer
  //     frost                    the field is cold: Frigid, Hail, Freezing, the map's frost (rules.frostbite / frostWait / frostCount), a cold
  //                              map (rules.coldMap: tundra and frostfire), or Winter
  //     rain                     Spring Rain (a field or a Rain card) or a Thunderstorm
  //     storm                    a Thunderstorm, or a strong-wind round (Windy, Gale, a Sandstorm's wind)
  //     fog                      Thick Fog or the Mist
  //     salt                     a salt-water map (rules.saltMap: the beach and reef maps, or set by a fight) while the tide is out (Ebb):
  //                              the sea leaves salt on the sand as it draws back. No tide, no salt; Perma-tide never ebbs.
  //     drought                  a fight with weather (rules.weatherMap, wind, a Thunderstorm, Mist, Hail, Seasons, or rain at some point)
  //                              on a dry map (not wet, not Perma-tide, not dark or the depths) after 3 rounds in a row without rain
  //     season                   effects.season names one ('spring' | 'summer' | 'autumn' | 'winter'): on in that season of the fight's
  //                              Seasons cycle (rules.seasons: true = 3 rounds a season, a number = that many; rules.seasonStart, Spring by
  //                              default). Off with no cycle (the field option is off by default).
  //   Full Hand N / Lean N (effects.fullHand / lean, and foeFullHand / foeLean): +N Attack per card in your (the opponent's) hand / per
  //     empty hand slot below the hand limit. ("Hoard" already names the Lumber skill, so the hand one is Full Hand: call EN6-1.)
  //   Hibernate N (effects.hibernate, plain 2): while the field is cold (Frigid, Hail, Freezing, the map's frost, Winter), or at night on a
  //     cold map, the unit sleeps: c.hibernating, with its Asleep kept on (no swing, shot or trigger, no Wait tick; damage does not wake it),
  //     its Taunt and Guardian off, and it heals N at each round's start. It wakes as the condition ends.
  //   – bramble (owner 03:17 #2): effects.arrowBramble / fireArrowBramble / fireBoltBramble aim that skill's shot at the enemy bramble;
  //     a trigger's t.bramble does the same for the Arrow and Missile actions and for Deal damage at one opponent.
  const EN6_SEASONS = ['spring', 'summer', 'autumn', 'winter'];
  const EN6_BRAMBLE_SHOTS = ['arrow', 'fireArrow', 'fireBolt'];
  function en6SeasonLen(){ const v = rules.seasons; return !v ? 0 : (v === true ? 3 : Math.max(1, Math.round(Number(v) || 3))); } // 3 rounds a season by default: a typical 12-round fight sees one year
  function en6Season(){ const L = en6SeasonLen(); if(!L) return null; const s0 = Math.max(0, EN6_SEASONS.indexOf(String(rules.seasonStart || 'spring').toLowerCase()));
    return EN6_SEASONS[(s0 + Math.floor(Math.max(0, turnNo) / L)) % 4]; }
  function en6Hot(){ const f = field && field.id; return f === 'heatwave' || !!rules.hotMap || !!rules.wildfire || !!rules.lavaSpout || Number(rules.eruption) > 0 || !!rules.volcano || !!rules.ashRain || en6Season() === 'summer'; }
  function en6ColdField(){ const f = field && field.id; return f === 'frozen' || !!rules.hail || !!rules.freezing || !!rules.frostbite || !!rules.frostWait || !!rules.frostCount || en6Season() === 'winter'; }
  function en6Cold(){ return en6ColdField() || !!rules.coldMap; }
  function en6Rain(){ return !!((field && field.id === 'rain') || rules.thunderstorm); }
  function en6Storm(){ return !!(rules.thunderstorm || isWindy()); }
  function en6Fog(){ return !!((field && field.id === 'fog') || rules.misty || rules.fog); }
  function en6Salt(){ return !!rules.saltMap && !permaTide && getTide() === 'ebb'; }
  let en6RainWas = null, en6DryRun = 0, en6RainSeen = false, en6SeasonWas = null;
  function en6WeatherMap(){ return !!(rules.weatherMap || windMode() || rules.thunderstorm || rules.misty || rules.hail || rules.seasons || en6RainSeen || (field && (field.id === 'rain' || field.id === 'fog'))); }
  function en6Drought(){ return en6WeatherMap() && !rules.wet && !permaTide && !rules.dark && !rules.crushingDepths && !en6Rain() && en6DryRun >= 3; }
  function en6HibernateCond(){ const ph = phaseActive() ? getPhase() : null; return en6ColdField() || (!!rules.coldMap && (ph === 'night' || ph === 'twilight')); }
  const handN = pl=> (pl && Array.isArray(pl.hand)) ? pl.hand.length : 0;
  const EN6_STATES = {
    plenty:      {grant:'plentyGrant',      dflt:{attack: 1, health: 1}, on: (pl)=> handN(pl) >= 4},
    scarcity:    {grant:'scarcityGrant',    dflt:{attack: 1},            on: (pl)=> !!pl && handN(pl) <= 1},
    foePlenty:   {grant:'foePlentyGrant',   dflt:{health: 2},            on: (pl, foe)=> handN(foe) >= 4},
    foeScarcity: {grant:'foeScarcityGrant', dflt:{attack: 1},            on: (pl, foe)=> !!foe && handN(foe) <= 1},
    heat:        {grant:'heatGrant',        dflt:{attack: 1},            on: ()=> en6Hot()},
    frost:       {grant:'frostGrant',       dflt:{health: 2},            on: ()=> en6Cold()},
    rain:        {grant:'rainGrant',        dflt:{attack: 1, health: 1}, on: ()=> en6Rain()},
    storm:       {grant:'stormGrant',       dflt:{attack: 2},            on: ()=> en6Storm()},
    fog:         {grant:'fogGrant',         dflt:{evasive: true},        on: ()=> en6Fog()},
    salt:        {grant:'saltGrant',        dflt:{armor: 1},             on: ()=> en6Salt()},
    drought:     {grant:'droughtGrant',     dflt:{attack: 1},            on: ()=> en6Drought()},
    season:      {grant:'seasonGrant',      dflt:{attack: 1, health: 1}, on: (pl, foe, e)=> { const s = en6Season(); return !!s && s === en6SeasonOf(e); }}
  };
  function en6SeasonOf(e){ const v = e && e.season; const s = typeof v === 'string' ? v.toLowerCase() : 'winter'; return EN6_SEASONS.includes(s) ? s : 'winter'; }
  function en6StateGrant(k, e){ const s = EN6_STATES[k], g = e && e[s.grant]; return g && typeof g === 'object' && Object.keys(g).length ? g : s.dflt; }
  function en6StatesOn(e, pl, foe){ const out = []; if(!e || !pl) return out; Object.keys(EN6_STATES).forEach(k=>{ if((e[k] || e[EN6_STATES[k].grant]) && EN6_STATES[k].on(pl, foe, e)) out.push(k); }); return out; }
  // Full Hand / Lean: +N Attack per card in hand / per empty slot (the hand limit MAX_HAND), yours and the opponent's
  function en6HandAtk(e, pl, foe){ if(!e) return 0; const n = k=> Math.max(0, Number(e[k] === true ? 1 : e[k]) || 0); let a = 0;
    if(e.fullHand) a += n('fullHand') * handN(pl); if(e.lean && pl) a += n('lean') * Math.max(0, MAX_HAND - handN(pl));
    if(e.foeFullHand) a += n('foeFullHand') * handN(foe); if(e.foeLean && foe) a += n('foeLean') * Math.max(0, MAX_HAND - handN(foe)); return a; }
  function en6HibernateN(e){ const v = e && e.hibernate; return v === true ? 2 : Math.max(0, Number(v) || 0); }
  // Hibernate: called per unit at each stat sync (syncPhaseStats); it falls asleep or wakes as the condition turns
  function en6HibernateSync(c, e, side, events){ if(!c || !e || !e.hibernate || !(c.hp > 0)) { if(c && c.hibernating){ c.hibernating = false; c.asleep = 0; } return; }
    const on = en6HibernateCond();
    if(on){ if(!c.hibernating){ c.hibernating = true; if(recordEvents && events) events.push({type:'statusFx', kind:'hibernate', on:true, side, attUid:c.uid, attDefId:c.defId, targetSide:side, targetUid:c.uid, targetDefId:c.defId}); }
      c.asleep = Math.max(c.asleep || 0, 1); c._asleepJustSet = false; }
    else if(c.hibernating){ c.hibernating = false; c.asleep = 0; if(recordEvents && events) events.push({type:'statusFx', kind:'hibernate', on:false, side, attUid:c.uid, attDefId:c.defId, targetSide:side, targetUid:c.uid, targetDefId:c.defId}); } }
  // At a round's start (roundStart, after the day / night turn and the stat sync): the dry spell's count, the season turning, Hibernate's heal
  function en6RoundStart(players, sideOf, events){
    const wet = en6Rain(), prev = en6RainWas === null ? wet : en6RainWas; /* round 1's weather: as it stands now */ if(prev) en6DryRun = 0; else en6DryRun += 1; en6RainWas = wet; if(wet){ en6RainSeen = true; en6DryRun = 0; }
    const s = en6Season(); if(s && s !== en6SeasonWas){ if(en6SeasonWas !== null && recordEvents && events) events.push({type:'season', season:s, round: turnNo + 1}); en6SeasonWas = s; }
    [1, 2].forEach(pid=>{ const pl = players && players[pid]; if(!pl || !pl.row) return; [...pl.row.left, ...pl.row.center, ...pl.row.right].forEach(c=>{
      if(!c || c.gap || !c.hibernating || !(c.hp > 0)) return; const e = effectsOf(c), n = en6HibernateN(e), h = Math.min(n, Math.max(0, c.maxHp - c.hp)); if(!(h > 0)) return;
      c.hp += h; if(recordEvents && events) events.push({type:'heal', cause:'hibernate', side:sideOf(pid), attUid:c.uid, attDefId:c.defId, targetUid:c.uid, targetDefId:c.defId, amount:h}); /* a plain heal (the replay's Health and green motes), its own log line */ }); });
  }
'''
anchor = "  function en5StatesOn(e, pl){ const out = []; if(!e || !pl) return out; Object.keys(EN5_STATES).forEach(k=>{ if((e[k] || e[EN5_STATES[k].grant]) && EN5_STATES[k].on(pl)) out.push(k); }); return out; }\n"
rep(anchor, anchor + BLOCK)

# condStatsOf: EN6 states beside EN5's (one list, one pip system), Full Hand / Lean
rep("    { const on = en5StatesOn(e, pl); on.forEach(k=> addGrant(en5StateGrant(k, e))); c._en5On = on.length ? on.join(',') : ''; }\n",
    "    { const on = en5StatesOn(e, pl); on.forEach(k=> addGrant(en5StateGrant(k, e)));\n"
    "      const on6 = en6StatesOn(e, pl, foe); on6.forEach(k=> addGrant(en6StateGrant(k, e))); /* EN6 (2026-10-24): hand, heat / frost, weather, season */\n"
    "      const all = on.concat(on6); c._en5On = all.length ? all.join(',') : ''; }\n"
    "    a += en6HandAtk(e, pl, foe); // EN6 (2026-10-24): Full Hand / Lean N, yours and the foe's\n")

# syncPhaseStats: Hibernate falls asleep / wakes with the condition
rep("        { const was5 = c._en5On || ''; const [ca, ch, grant] = condStatsOf(c, e, pid, players); a += ca; h += ch;\n",
    "        try{ en6HibernateSync(c, e, sideOf ? sideOf(pid) : (pid===1?'A':'B'), events); }catch(err){} // EN6 (2026-10-24): Hibernate\n"
    "        { const was5 = c._en5On || ''; const [ca, ch, grant] = condStatsOf(c, e, pid, players); a += ca; h += ch;\n")

# roundStart: after its stat sync
rep("    syncPhaseStats(players, sideOf, events);\n    // The active Exile zone (2026-10-09",
    "    syncPhaseStats(players, sideOf, events);\n    en6RoundStart(players, sideOf, events); // EN6 (2026-10-24): the dry spell, the season, Hibernate's heal\n    // The active Exile zone (2026-10-09")

# a hibernating unit is not woken by damage, and its sleep does not wear off in the upkeep
rep("    if(o.wake && dmg > 0 && card.asleep > 0){", "    if(o.wake && dmg > 0 && card.asleep > 0 && !card.hibernating /* EN6: Hibernate wakes with the cold, not a hit */){")
rep("      if(c.asleep>0){ if(c._asleepJustSet) c._asleepJustSet=false; else c.asleep -= 1; }",
    "      if(c.asleep>0 && !c.hibernating){ if(c._asleepJustSet) c._asleepJustSet=false; else c.asleep -= 1; } // EN6 (2026-10-24): a hibernating unit sleeps on")

# Taunt and Guardian are off while it hibernates
rep("en.card.hp > 0 && effectsOf(en.card).taunt && !isInvisible(en.card)", "en.card.hp > 0 && effectsOf(en.card).taunt && !en.card.hibernating /* EN6 */ && !isInvisible(en.card)")
rep("  function isLiveGuardian(n){ return !!(n && !n.gap && n.hp > 0 && ((CARD_DEFS[n.defId]||{}).effects||{}).guardian); }",
    "  function isLiveGuardian(n){ return !!(n && !n.gap && n.hp > 0 && !n.hibernating /* EN6: asleep, it can't step in */ && ((CARD_DEFS[n.defId]||{}).effects||{}).guardian); }")

# – bramble on the skill shots
rep("for(let k = 0; k < nA; k++) shots.push({amount: fx.arrow + fletch + fl17, dmgType: 'physical', fire: false, nth: k || undefined}); }",
    "for(let k = 0; k < nA; k++) shots.push({amount: fx.arrow + fletch + fl17, dmgType: 'physical', fire: false, nth: k || undefined, at: fx.arrowBramble ? 'hq' : undefined /* EN6: Arrow – bramble */}); }")
rep("        if(fx.fireArrow > 0) shots.push({amount: fx.fireArrow + fl17, dmgType: 'heat', fire: true});",
    "        if(fx.fireArrow > 0) shots.push({amount: fx.fireArrow + fl17, dmgType: 'heat', fire: true, at: fx.fireArrowBramble ? 'hq' : undefined /* EN6 */});")
rep("          shots.push({amount: B.noDamage ? 0 : n, n, dmgType: B.dmgType, bolt: B.element, status: B.status, boltKey: k}); });",
    "          shots.push({amount: B.noDamage ? 0 : n, n, dmgType: B.dmgType, bolt: B.element, status: B.status, boltKey: k, at: (k === 'fireBolt' && fx.fireBoltBramble) ? 'hq' : undefined /* EN6: Fire Bolt – bramble */}); });")

# – bramble on the Arrow action
rep("  function bxArrowShot(players, sideOf, pid, c, n, stats, events, how){",
    "  function bxArrowShot(players, sideOf, pid, c, n, stats, events, how, bramble){")
rep("    const target = near ? {kind:'card', card: shieldCall(enemy, near) || near} : {kind:'hq'};\n    if(c.invisible > 0){ c.invisible = 0;",
    "    const target = (near && !bramble) ? {kind:'card', card: shieldCall(enemy, near) || near} : {kind:'hq'}; // EN6 (2026-10-24): Arrow – bramble aims at the bramble\n    if(c.invisible > 0){ c.invisible = 0;")
rep("        case 'arrow': bxArrowShot(players, sideOf, playerId, boardCard, numN(t.amount, 1), stats, events, t.keyword === 'archer' ? 'archer' : 'action'); break;",
    "        case 'arrow': bxArrowShot(players, sideOf, playerId, boardCard, numN(t.amount, 1), stats, events, t.keyword === 'archer' ? 'archer' : 'action', !!t.bramble); break;")
# Missile and Deal damage – bramble
rep("        case 'missile': fireMissile(players, sideOf, playerId, boardCard, {amount:t.amount||0, dmgType:'physical'}, stats, events); break;",
    "        case 'missile': if(t.bramble){ fireDamageAction(players, sideOf, playerId, boardCard.defId, t.amount||0, 'physical', {kind:'hq'}, stats, events, null, boardCard.uid); if(recordEvents && events) events.push({type:'brambleShot', side:mySide, defId:boardCard.defId, uid:boardCard.uid, targetSide:sideOf(otherId(playerId)), amount:t.amount||0, act:'missile'}); break; } // EN6: Missile – bramble\n"
    "          fireMissile(players, sideOf, playerId, boardCard, {amount:t.amount||0, dmgType:'physical'}, stats, events); break;")
rep("          if(sub==='all' && who!=='self'){\n            const sidePl = who==='ally' ? pl : enemy;",
    "          if(t.bramble && who==='enemy' && sub!=='all'){ fireDamageAction(players, sideOf, playerId, boardCard.defId, amount, t.dmgType, {kind:'hq'}, stats, events, null, boardCard.uid); if(recordEvents && events) events.push({type:'brambleShot', side:mySide, defId:boardCard.defId, uid:boardCard.uid, targetSide:sideOf(otherId(playerId)), amount, act:'damage'}); break; } // EN6 (2026-10-24): Deal damage – bramble\n"
    "          if(sub==='all' && who!=='self'){\n            const sidePl = who==='ally' ? pl : enemy;")

# Irradiation: the new braces and toggles are parameters, not skills of their own
rep("'timberedGrant', 'bedrockGrant', 'forgedGrant', 'lastStandGrant' /* EN5 (2026-10-24) */, 'triggers'",
    "'timberedGrant', 'bedrockGrant', 'forgedGrant', 'lastStandGrant' /* EN5 (2026-10-24) */, 'plentyGrant', 'scarcityGrant', 'foePlentyGrant', 'foeScarcityGrant', 'heatGrant', 'frostGrant', 'rainGrant', 'stormGrant', 'fogGrant', 'saltGrant', 'droughtGrant', 'seasonGrant', 'arrowBramble', 'fireArrowBramble', 'fireBoltBramble' /* EN6 (2026-10-24) */, 'triggers'")
rep("lastStand:['lastStandGrant'] /* EN5 */};",
    "lastStand:['lastStandGrant'] /* EN5 */, plenty:['plentyGrant'], scarcity:['scarcityGrant'], foePlenty:['foePlentyGrant'], foeScarcity:['foeScarcityGrant'], heat:['heatGrant'], frost:['frostGrant'], rain:['rainGrant'], storm:['stormGrant'], fog:['fogGrant'], salt:['saltGrant'], drought:['droughtGrant'], season:['seasonGrant'], arrow:['arrowBramble'], fireArrow:['fireArrowBramble'], fireBolt:['fireBoltBramble'] /* EN6 */};")

# exports
rep("en5Woods, en5CanopyCover, EN5_STATES, en5StatesOn, en5HemoN /* 2026-10-24 (package EN5) */ };",
    "en5Woods, en5CanopyCover, EN5_STATES, en5StatesOn, en5HemoN /* 2026-10-24 (package EN5) */, EN6_STATES, EN6_SEASONS, EN6_BRAMBLE_SHOTS, en6StatesOn, en6Season, en6Hot, en6Cold, en6ColdField, en6Rain, en6Storm, en6Fog, en6Salt, en6Drought, en6WeatherMap, en6HibernateCond, en6HandAtk, en6DryRun: ()=> en6DryRun /* 2026-10-24 (package EN6) */ };")

open(P, 'w', encoding='utf-8').write(src)
print('engine: EN6 applied')
