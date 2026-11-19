// Card-data integrity (2026-10-03, T3 / "how do we verify the card data is correct on the client?").
// A fingerprint of every gameplay field of every card: cost, wait, attack, health, effects, keywords…
// Cosmetic fields (art, flavor, icon, ids, unlock flags) are left out so new art never changes it.
// The client sends this hash with every verified transaction (pack open, raid attempt, ranked result).
// The server computes the same hash from ITS copy of the card table; a mismatch means the client is
// running edited or stale card data, and the transaction is rejected (or the client is told to reload).
// Pure and dependency-free so the browser, Node tests and a Supabase Edge Function share one copy.
(function(root){
'use strict';
// 'barks' (2026-10-16): a card's voice lines are words only, so adding or editing them never changes the fingerprint.
const COSMETIC = new Set(['flavor', 'art', 'arts', 'icon', 'uuid', 'numericId', 'locked', 'source', 'lore', 'credit', 'artCredit', 'level', 'barks']);

function stableStringify(v){
  if(v === null || typeof v !== 'object') return JSON.stringify(v === undefined ? null : v);
  if(Array.isArray(v)) return '[' + v.map(stableStringify).join(',') + ']';
  return '{' + Object.keys(v).filter(k=> v[k] !== undefined).sort().map(k=> JSON.stringify(k) + ':' + stableStringify(v[k])).join(',') + '}';
}

// SHA-256 over a UTF-8 string, synchronous (crypto.subtle is async and missing on file:// in some
// browsers, and the replay verifier wants a plain function).
const K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
const KI = new Int32Array(K);
function sha256(str){
  // 2026-11-19 (package PERF6): the bytes come from TextEncoder into a typed array, padded in place (it was one array push per byte, then a
  // 64-bit-safe length); same digest, about 10x faster on the card table (236 -> 17 ms in node), which the page hashes once after load (a 600 ms task at 4x CPU).
  const enc = typeof TextEncoder !== 'undefined' ? new TextEncoder().encode(str) : Uint8Array.from(unescape(encodeURIComponent(str)), c=> c.charCodeAt(0));
  const n = enc.length, total = ((n + 9 + 63) >> 6) << 6, bytes = new Uint8Array(total);
  bytes.set(enc); bytes[n] = 0x80;
  const hi = Math.floor(n / 0x20000000), lo = (n << 3) >>> 0;
  bytes[total-8] = hi >>> 24; bytes[total-7] = (hi >>> 16) & 255; bytes[total-6] = (hi >>> 8) & 255; bytes[total-5] = hi & 255;
  bytes[total-4] = lo >>> 24; bytes[total-3] = (lo >>> 16) & 255; bytes[total-2] = (lo >>> 8) & 255; bytes[total-1] = lo & 255;
  const H = new Int32Array([0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19]);
  const W = new Int32Array(64), Kt = KI;
  for(let off = 0; off < total; off += 64){
    for(let t = 0, o = off; t < 16; t++, o += 4) W[t] = (bytes[o] << 24) | (bytes[o+1] << 16) | (bytes[o+2] << 8) | bytes[o+3];
    for(let t = 16; t < 64; t++){
      const x = W[t-15], y = W[t-2];
      W[t] = (W[t-16] + (((x >>> 7) | (x << 25)) ^ ((x >>> 18) | (x << 14)) ^ (x >>> 3)) + W[t-7] + (((y >>> 17) | (y << 15)) ^ ((y >>> 19) | (y << 13)) ^ (y >>> 10))) | 0;
    }
    let a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
    for(let t = 0; t < 64; t++){
      const t1 = (h + (((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7))) + ((e & f) ^ (~e & g)) + Kt[t] + W[t]) | 0;
      const t2 = ((((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10))) + ((a & b) ^ (a & c) ^ (b & c))) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0; H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
  }
  return Array.from(H, x=> (x >>> 0).toString(16).padStart(8, '0')).join('');
}

function gameplayView(def){
  const out = {};
  Object.keys(def || {}).forEach(k=>{ if(!COSMETIC.has(k)) out[k] = def[k]; });
  return out;
}
// defs: {id: def} or [def]. Returns the full 64-hex hash; show the first 12 to humans.
function cardDataHash(defs){
  const list = Array.isArray(defs) ? defs : Object.keys(defs || {}).map(id=> Object.assign({id}, defs[id]));
  // 2026-10-19 (package AN): pool cards ("pool": true, the owner's unplaced candidates) aren't in the build, so they aren't hashed:
  // canonical/cards.json (pool rows included) and the page (pool rows left out) give the same fingerprint.
  // ENG35 (2026-11-07): a fused skill ("nocturnal": {"v": 2, "hp": 1}, canonical/skill-params.json) hashes as its flat keys, so cards.json (fused)
  // and the page (the build expands it) still give the same fingerprint, the one they had before the fold. Optional: without the helper
  // (an Edge Function's own copy) the defs are hashed as they come.
  const SPL = (typeof BramblewoodSkillParams !== 'undefined' && BramblewoodSkillParams) || (()=>{ try{ return typeof require === 'function' ? require('./bramblewood-skillparams.js') : null; }catch(e){ return null; } })();
  const rows = list.filter(d=> d && !d.pool).map(d=> SPL ? SPL.expandDef(d) : d).map(gameplayView).sort((a,b)=> String(a.id) < String(b.id) ? -1 : String(a.id) > String(b.id) ? 1 : 0);
  return sha256(stableStringify(rows));
}

const api = {stableStringify, sha256, gameplayView, cardDataHash, COSMETIC};
if(typeof module !== 'undefined' && module.exports) module.exports = api;
if(root) root.BramblewoodIntegrity = api;
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null));
