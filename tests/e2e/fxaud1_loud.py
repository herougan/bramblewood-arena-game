#!/usr/bin/env python3
"""FXAUD1: play every SoundKit cue once, alone, through a tap on the audio destination, and record peak, RMS (over the part above -60 dB),
length (first to last sample above -54 dB) and whether the cue is still sounding 2 s after it started. Real time: about 2.6 s a cue.
    python3 tests/e2e/fxaud1_loud.py [--list] [--only regex]  -> docs/perf/fxaud1/loudness.json
Run it alone. The page starts a fight board first so the match cues have a match."""
import sys, asyncio, json, os, re, argparse, math
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fxaud1_probe as P
from playwright.async_api import async_playwright
TAP = """(()=>{ const BA = BaseAudioContext.prototype, d = Object.getOwnPropertyDescriptor(BA, 'destination'); window.__rec = null; window.__sr = 44100;
  Object.defineProperty(BA, 'destination', {configurable: true, get(){ const real = d.get.call(this); if(!this.__tap){ window.__sr = this.sampleRate; const g = this.createGain(), sp = this.createScriptProcessor(2048, 1, 1);
    sp.onaudioprocess = e=>{ if(window.__rec) window.__rec(e.inputBuffer.getChannelData(0)); }; g.connect(sp); sp.connect(real); this.__tap = g; } return this.__tap; }}); })()"""
SKIPRE = r'^(audioContext|stopAll|prim|at|unlock|mute|isMuted|toggle|set[A-Z]|get[A-Z]|volume|speak|resume|duck|enable|disable|init|preload|bake|warm|hush)'
MEASURE = """async(name)=>{ const buf = []; let n = 0; window.__rec = x=>{ buf.push(Float32Array.from(x)); };
  let err = null; try{ const r = SoundKit[name](); if(r && r.then) await r; }catch(e){ err = String(e && e.message || e); }
  await new Promise(r=> setTimeout(r, 2600)); window.__rec = null; const sr = window.__sr; const all = new Float32Array(buf.reduce((a, b)=> a + b.length, 0)); let o = 0; buf.forEach(b=>{ all.set(b, o); o += b.length; });
  return {err, sr, n: all.length, data: Array.from(all.filter((_, i)=> i % 4 === 0))}; }"""
async def main(a):
    httpd = P.serve(); url = f'http://127.0.0.1:{httpd.server_address[1]}/index.html'
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=P.CHROME, args=P.FLAGS)
        pg = await b.new_page(viewport={'width': 1366, 'height': 860})
        await pg.add_init_script(P.SKIP + "localStorage.setItem('bramblewood_fx_level','high');localStorage.setItem('bw_musicVolume','0');localStorage.setItem('bramblewood_battle_music','off');localStorage.setItem('bramblewood_calm_music','off');" + TAP)
        await pg.goto(url, wait_until='domcontentloaded', timeout=180000); await pg.wait_for_function("typeof startConquestMatch === 'function'", timeout=180000); await pg.wait_for_timeout(1500)
        await pg.evaluate("(()=>{ " + P.OWN + " })()"); await pg.evaluate(P.BOARD)
        await pg.evaluate("Object.keys(window).filter(k=> /^(FX|SkillFX)/.test(k)).length")
        # ask each effect module for its cues (they register on first use): play a handful of events first
        names = await pg.evaluate("Object.keys(SoundKit).filter(k=> typeof SoundKit[k] === 'function')")
        names = [n for n in names if not re.search(SKIPRE, n)]
        if a.only: names = [n for n in names if re.search(a.only, n)]
        print(len(names), 'cues', flush=True)
        if a.list: print(names); return
        out = {}
        # silence floor
        await pg.evaluate("window.__rec = null")
        for i, n in enumerate(names):
            try: r = await pg.evaluate(MEASURE, n)
            except Exception as ex: out[n] = {'err': str(ex)[:80]}; continue
            d = r['data']; sr = r['sr'] / 4
            if not d: out[n] = {'err': r['err'] or 'no samples'}; continue
            pk = max(abs(x) for x in d); act = [i for i, x in enumerate(d) if abs(x) > 0.002]
            if not act: out[n] = {'peak': 0, 'len': 0, 'err': r['err']}; continue
            first, last = act[0], act[-1]; seg = d[first:last + 1]; rms = math.sqrt(sum(x * x for x in seg) / len(seg))
            out[n] = {'peak_db': round(20 * math.log10(max(pk, 1e-6)), 1), 'rms_db': round(20 * math.log10(max(rms, 1e-6)), 1), 'len_s': round((last - first) / sr, 2), 'start_s': round(first / sr, 2), 'long': (last / sr) > 2.0, 'err': r['err']}
            if i % 25 == 0: print(i, n, out[n], flush=True)
        json.dump(out, open(os.path.join(P.ROOT, 'docs/perf/fxaud1/loudness.json'), 'w'), indent=0)
        await b.close()
if __name__ == '__main__':
    ap = argparse.ArgumentParser(); ap.add_argument('--list', action='store_true'); ap.add_argument('--only'); asyncio.run(main(ap.parse_args()))
