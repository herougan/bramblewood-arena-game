/* ============================================================
   Bramblewood a11y — modal focus management (2026-10-18, R3-WP5)
   ============================================================
   Why: the game has ~35 role="dialog" overlays built in many places. None trapped focus, about half lacked
   aria-modal, ~10 had no Escape key, and only the in-page <select> menu gave focus back on close. Rather than
   touching every builder, one MutationObserver watches for dialogs appearing and disappearing and does the
   standard modal chores for all of them:
     - sets aria-modal="true" when missing (light popovers such as the Settings panel get role=dialog only);
     - remembers what had focus, moves focus to the first focusable element (or the dialog itself) unless the
       game already put focus inside;
     - keeps Tab / Shift+Tab inside the top-most dialog (nested dialogs: only the top one traps);
     - Escape presses the dialog's own close button (.modal-close-btn, [data-close], [data-*-close], #…Close,
       ✕ …) only when no existing handler dealt with the key (defaultPrevented / stopPropagation, or the dialog
       changed), and never for dialogs that must not be dismissed by accident (data-no-esc and NO_ESC below:
       splash/onboarding screens, the tutorial's starter steps, VS intros, the results animation, hatching);
     - on close, gives focus back to what had it before.
   Opt-outs a builder can add: data-no-esc (no Escape fallback), data-a11y-skip (not managed at all),
   data-a11y-close (marks the button Escape should press).
   DOM-only; does nothing outside a browser (the engine bundle is also read by Node tests). */
(function(){
  if(typeof window === 'undefined' || typeof document === 'undefined' || typeof MutationObserver === 'undefined') return;
  if(window.BWA11y) return;

  const DIALOG_SEL = '[role=dialog], [role=alertdialog], .modal-overlay, .settings-panel';
  // Small anchored popovers / mid-battle prompts: not modal, they keep their own light-dismiss behaviour.
  const SKIP_SEL = '[data-a11y-skip], .energy-panel, .sweep-menu, .pack-pop, .grave-peek, .ambush-pop, .draw-offer';
  // Light dialogs: managed (focus in, Tab loops, focus back) but not marked aria-modal (the page around them stays live).
  const LIGHT_SEL = '.settings-panel';
  // Battle-critical / onboarding overlays: Escape must not close them by accident.
  const NO_ESC_SEL = '[data-no-esc], #splashScreen, #factionScreen, #tutorialDeckPickerScreen, .vs-screen, .vs-opener, .rr-stage, '
    + '.starter-step, .tut-reward, .starter-modal, .hatch-ov, .po2, .pack-open-overlay';
  // Buttons Escape must never press even if they look like a close button (leaving a live trench fight).
  const NEVER_ESC_BTN = '.tr-leave-btn, [data-no-esc]';
  // Floating layers outside any dialog that may legitimately hold focus while a dialog is open.
  const FLOATING_SEL = '.bw-sel-menu, .toast, .coach-tip, ' + SKIP_SEL;
  const FOCUSABLE = 'a[href], area[href], button, input:not([type=hidden]), select, textarea, iframe, summary, [tabindex], [contenteditable=""], [contenteditable="true"]';

  const recs = new Map(); // host element → {host, root, opener, seq, light}
  let seq = 0, scanQueued = false;
  const history = []; // the last few focused elements, newest last (to find the opener when the game focuses inside first)

  const visible = el=> !!el && el.isConnected && !el.closest('[hidden]') && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
  const usable = el=> visible(el) && !el.disabled && !el.closest('[inert]') && el.getAttribute('aria-hidden') !== 'true';
  function focusables(root){
    return [...root.querySelectorAll(FOCUSABLE)].filter(el=> el.tabIndex >= 0 && usable(el));
  }
  // Text fields would pop the on-screen keyboard on phones, so the first focus prefers a button/control.
  const isTextEntry = el=> el.isContentEditable || el.tagName === 'TEXTAREA' || (el.tagName === 'INPUT' && !/^(checkbox|radio|range|button|submit|reset|color|file|image)$/i.test(el.type));
  function focusEl(el){ try{ el.focus({preventScroll: true}); }catch(e){ try{ el.focus(); }catch(e2){} } return document.activeElement === el; }
  function focusRoot(root){ if(!root.hasAttribute('tabindex')) root.setAttribute('tabindex', '-1'); focusEl(root); }

  // Every open dialog, as {host, root}. host = the overlay that comes and goes (kept across re-renders of its content).
  function findOpen(){
    const out = new Map();
    document.querySelectorAll(DIALOG_SEL).forEach(el=>{
      if(el.matches(SKIP_SEL) || el.closest('[data-a11y-skip]')) return;
      let root = el;
      if(el.classList.contains('modal-overlay') && !/^(alert)?dialog$/.test(el.getAttribute('role') || '')){
        if(el.querySelector('[role=dialog], [role=alertdialog]')) return; // its inner dialog stands for it
        if(!el.firstElementChild) return; // an empty, parked overlay
        root = el.querySelector(':scope > .modal') || el;
      }
      // A dialog inside another managed dialog is part of it (only the outer one counts).
      const outer = root.parentElement && root.parentElement.closest('[role=dialog], [role=alertdialog]');
      if(outer && !outer.matches(SKIP_SEL)) return;
      const host = (!root.matches(LIGHT_SEL) && root.closest('.modal-overlay')) || root;
      if(out.has(host) || !visible(root)) return;
      out.set(host, root);
    });
    return out;
  }
  function labelRoot(root){
    if(!/^(alert)?dialog$/.test(root.getAttribute('role') || '')) root.setAttribute('role', 'dialog');
    if(!root.hasAttribute('aria-label') && !root.hasAttribute('aria-labelledby')){
      const h = root.querySelector('h1, h2, h3, .settings-panel-title');
      if(h && h.textContent.trim()) root.setAttribute('aria-label', h.textContent.replace(/\s+/g, ' ').trim().slice(0, 80));
    }
  }
  function top(){ let best = null; recs.forEach(r=>{ if(!best || r.seq > best.seq) best = r; }); return best; }

  function scan(){
    scanQueued = false;
    const open = findOpen();
    // closed
    [...recs.values()].forEach(r=>{ if(!open.has(r.host)){ recs.delete(r.host); onClose(r); } });
    // opened or re-rendered
    open.forEach((root, host)=>{
      let r = recs.get(host);
      if(!r){
        const light = root.matches(LIGHT_SEL);
        labelRoot(root);
        if(!light && !root.hasAttribute('aria-modal')) root.setAttribute('aria-modal', 'true');
        const a = document.activeElement;
        let opener = a && a !== document.body && !host.contains(a) ? a : null;
        if(!opener) for(let i = history.length - 1; i >= 0; i--){ const h = history[i]; if(h.isConnected && !host.contains(h)){ opener = h; break; } }
        r = {host, root, opener, seq: ++seq, light};
        recs.set(host, r);
        // Let the game's own focus code run first (several builders focus a button after ~30 ms).
        setTimeout(()=>{ if(recs.get(host) === r && top() === r) initialFocus(r); }, 60);
        // …and once more if something put focus back on the opener (or dropped it) right after.
        setTimeout(()=>{ const a = document.activeElement; if(recs.get(host) === r && top() === r && (!a || a === document.body || a === r.opener)) initialFocus(r); }, 300);
      } else if(r.root !== root){
        const lostId = r.lastFocusId;
        labelRoot(root);
        if(!r.light && !root.hasAttribute('aria-modal')) root.setAttribute('aria-modal', 'true');
        r.root = root;
        const a = document.activeElement;
        if(top() === r && (!a || a === document.body || !a.isConnected)){
          const same = lostId && root.querySelector('#' + CSS.escape(lostId));
          if(!(same && usable(same) && focusEl(same))) initialFocus(r);
        }
      }
    });
  }
  function initialFocus(r){
    const a = document.activeElement;
    if(a && a !== document.body && r.root.contains(a)) return; // the game already put focus inside
    if(a && a !== document.body && a.closest && a.closest('.bw-sel-menu')) return; // a select menu opened from inside
    const auto = r.root.querySelector('[autofocus]');
    const list = focusables(r.root);
    const first = (auto && usable(auto)) ? auto : list.find(el=> !isTextEntry(el));
    if(!(first && focusEl(first))) focusRoot(r.root);
  }
  function onClose(r){
    const a = document.activeElement;
    const lost = !a || a === document.body || !a.isConnected || r.host.contains(a) || !visible(a);
    if(!lost) return;
    const t = top();
    if(r.opener && usable(r.opener) && (!t || t.host.contains(r.opener)) && focusEl(r.opener)) return;
    if(t) initialFocus(t);
  }
  function queue(){ if(!scanQueued){ scanQueued = true; setTimeout(scan, 0); } }
  function relevant(n){
    if(!n || n.nodeType !== 1) return false;
    if(n.matches(DIALOG_SEL) || n.querySelector(DIALOG_SEL)) return true;
    for(const r of recs.values()) if(n.contains(r.host) || r.host.contains(n) && n.contains(r.root)) return true;
    return false;
  }
  const mo = new MutationObserver(list=>{
    if(scanQueued) return;
    for(const m of list){
      if(m.type === 'childList'){
        for(const n of m.addedNodes) if(relevant(n)) return queue();
        for(const n of m.removedNodes) if(relevant(n)) return queue();
        for(const r of recs.values()) if(!r.root.isConnected || r.host.contains(m.target)) return queue();
      } else if(relevant(m.target)) return queue();
    }
  });
  mo.observe(document.documentElement, {subtree: true, childList: true, attributes: true, attributeFilter: ['hidden', 'class', 'role', 'inert']});

  document.addEventListener('focusin', e=>{
    const t = e.target; if(!t || t === document.body) return;
    history.push(t); if(history.length > 8) history.shift();
    const r = top(); if(r && r.root.contains(t) && t.id) r.lastFocusId = t.id;
  }, true);

  // Tab trap (capture, so it runs before page handlers; only acts when focus is in the top dialog or nowhere).
  document.addEventListener('keydown', e=>{
    if(e.key !== 'Tab' || e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    if(scanQueued) scan();
    const r = top(); if(!r) return;
    const a = document.activeElement;
    const inside = a && r.root.contains(a);
    if(!inside && a && a !== document.body && a.isConnected && a.closest(FLOATING_SEL)) return; // the in-page <select> menu, a toast: leave it alone
    const list = focusables(r.root);
    if(!list.length){ e.preventDefault(); focusRoot(r.root); return; }
    const first = list[0], last = list[list.length - 1];
    if(e.shiftKey){ if(!inside || a === first || a === r.root){ e.preventDefault(); focusEl(last); } }
    else if(!inside || a === last || a === r.root){ e.preventDefault(); focusEl(first); }
  }, true);

  // The button Escape should press, if the dialog has one (not inside a nested dialog, visible, enabled).
  function closeButton(root){
    const own = el=> usable(el) && !el.matches(NEVER_ESC_BTN) && (el.closest('[role=dialog], [role=alertdialog]') || root) === root;
    const pick = sel=> [...root.querySelectorAll(sel)].find(own);
    let b = pick('[data-a11y-close]') || pick('.modal-close-btn, .ci-x, button.close, .close-btn, [data-close], [data-x]');
    if(b) return b;
    b = [...root.querySelectorAll('button, [role=button]')].find(el=> own(el) && [...el.attributes].some(at=> /^data-[\w-]*-close$/.test(at.name)));
    if(b) return b;
    b = pick('button[id$="Close"], button[id$="Cancel"], button[id$="close"]');
    if(b) return b;
    return [...root.querySelectorAll('button, [role=button]')].find(el=> own(el) && (/^(close|cancel)$/i.test((el.getAttribute('aria-label') || '').trim()) || /^[✕✖×xX]$/.test(el.textContent.trim()) || /^(close|cancel)$/i.test(el.textContent.trim())));
  }
  const sig = r=> [r.host.isConnected, visible(r.root), r.host.className, r.root.className, r.root.innerHTML.length].join('|');
  // Bubble phase on window: runs after the game's own document/overlay handlers, which can stop it or preventDefault.
  window.addEventListener('keydown', e=>{
    if(e.key !== 'Escape' || e.defaultPrevented || e.isComposing) return;
    if(scanQueued) scan();
    const r = top(); if(!r) return;
    if(r.root.closest(NO_ESC_SEL) || r.host.matches(NO_ESC_SEL) || r.root.querySelector('[data-no-esc]')) return;
    const btn = closeButton(r.root); if(!btn) return;
    const before = sig(r), root = r.root;
    // If a handler we can't see already closed or changed the dialog this tick, don't press anything (no double close).
    setTimeout(()=>{ if(recs.get(r.host) === r && r.root === root && sig(r) === before && btn.isConnected && usable(btn)) btn.click(); }, 0);
  });

  function start(){ scan(); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else setTimeout(start, 0);
  window.BWA11y = {scan, stack: ()=> [...recs.values()].sort((a, b)=> a.seq - b.seq).map(r=> r.root), closeButton};
})();
