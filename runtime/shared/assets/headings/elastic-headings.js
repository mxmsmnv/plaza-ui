/* Elastic / rubber text: cursor repulsion and damped spring return. No dependencies. */
(() => {
  'use strict';
  if (window.PlazaElasticHeadings) return;
  const settings = Object.freeze({
    radius: 100,          // CSS px: influence around the cursor
    displacement: 22,     // CSS px: maximum target displacement
    stiffness: 0.085,     // spring acceleration per nominal 60 Hz step
    damping: 0.78,        // retained velocity per nominal 60 Hz step
    rotation: 10,         // degrees at maximum horizontal displacement
    stretch: 0.08,        // maximum horizontal expansion (8%)
    settle: 0.035         // px and px/step: stop the animation below this
  });
  const media = matchMedia('(prefers-reduced-motion:no-preference)');
  const targets = [];
  let raf = 0, last = 0, enabled = false;
  function reset(t) {
    t.pointer = null;
    t.touchId = null;
    clearTimeout(t.releaseTimer);
    for (const p of t.letters) {
      p.x = p.y = p.vx = p.vy = 0;
      for (const name of ['translate', 'rotate', 'scale']) p.el.style.removeProperty(name);
    }
  }
  function measure(t) {
    const box = t.el.getBoundingClientRect();
    t.box = box;
    for (const p of t.letters) {
      const r = p.el.getBoundingClientRect();
      // Individual translate is independent of the existing entrance transform.
      p.cx = r.left - box.left + r.width / 2 - p.x;
      p.cy = r.top - box.top + r.height / 2 - p.y;
      const word = p.el.closest('.plaza-elastic-gradient-word');
      if (word) {
        const origin = word.closest('.plaza-heading-gradient').getBoundingClientRect();
        p.el.style.setProperty('--plaza-elastic-bg-x', `${-(r.left - origin.left - p.x)}px`);
      }
    }
    t.dirty = false;
  }
  function wake() {
    if (enabled && !document.hidden && !raf) { last = 0; raf = PlazaMotion.frame(frame); }
  }
  function frame(now) {
    raf = 0;
    if (!enabled || document.hidden) return;
    const dt = last ? Math.min((now - last) / (1000 / 60), 2) : 1;
    last = now;
    let moving = false;
    // Batch geometry reads before writes. No per-frame layout measurement.
    for (const t of targets) if (t.visible && t.dirty) measure(t);
    for (const t of targets) {
      if (!t.visible) continue;
      const ready = !t.el.classList.contains('plaza-heading-large') || t.el.classList.contains('pg-title-done');
      for (const p of t.letters) {
        let tx = 0, ty = 0;
        if (ready && t.pointer) {
          const dx = p.cx - t.pointer.x, dy = p.cy - t.pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance < settings.radius) {
            const influence = (1 - distance / settings.radius) ** 2;
            const amount = influence * settings.displacement;
            tx = distance > 0.01 ? dx / distance * amount : 0;
            ty = distance > 0.01 ? dy / distance * amount : -amount;
          }
        }
        // Substeps keep the spring stable on slow frames and high refresh displays.
        const steps = Math.ceil(dt / 0.5), step = dt / steps;
        for (let i = 0; i < steps; i++) {
          p.vx = (p.vx + (tx - p.x) * settings.stiffness * step) * settings.damping ** step;
          p.vy = (p.vy + (ty - p.y) * settings.stiffness * step) * settings.damping ** step;
          p.x += p.vx * step; p.y += p.vy * step;
        }
        const unsettled = Math.max(Math.abs(tx - p.x), Math.abs(ty - p.y), Math.abs(p.vx), Math.abs(p.vy)) > settings.settle;
        moving ||= unsettled;
        if (!unsettled && tx === 0 && ty === 0) {
          p.x = p.y = p.vx = p.vy = 0;
          for (const name of ['translate', 'rotate', 'scale']) p.el.style.removeProperty(name);
        } else {
          const strain = Math.min(1, Math.hypot(p.x, p.y) / settings.displacement);
          p.el.style.translate = `${p.x.toFixed(3)}px ${p.y.toFixed(3)}px`;
          p.el.style.rotate = `${(p.x / settings.displacement * settings.rotation).toFixed(3)}deg`;
          p.el.style.scale = `${(1 + strain * settings.stretch).toFixed(4)} ${(1 - strain * settings.stretch / 2).toFixed(4)}`;
        }
      }
    }
    if (moving) raf = PlazaMotion.frame(frame);
  }
  function split(t) {
    if (t.mounted) return;
    if (!t.el.hasAttribute('aria-label')) t.el.setAttribute('aria-label', t.el.innerText.replace(/\s+/g, ' ').trim());
    if (!t.el.querySelector('.plaza-motion-letter')) {
      for (const word of t.el.querySelectorAll('.pg-ink-word')) {
        const gradient = getComputedStyle(word).backgroundImage;
        if (gradient !== 'none') {
          word.style.setProperty('--plaza-elastic-gradient', gradient);
          word.classList.add('plaza-elastic-gradient-word');
        }
        const fragment = document.createDocumentFragment();
        for (const char of Array.from(word.textContent)) {
          const el = document.createElement('span');
          el.className = 'plaza-elastic-letter'; el.textContent = char;
          fragment.append(el);
        }
        word.replaceChildren(fragment);
        word.setAttribute('aria-hidden', 'true');
      }
    }
    t.letters = [...t.el.querySelectorAll('.plaza-motion-letter,.plaza-elastic-letter')].map(el => ({el, x:0,y:0,vx:0,vy:0,cx:0,cy:0}));
    t.mounted = true; t.dirty = true;
    t.el.dataset.plazaElastic = 'ready';
  }
  function sync() {
    enabled = media.matches;
    if (!enabled) { PlazaMotion.cancelFrame(raf); raf = 0; }
    for (const t of targets) { reset(t); if (enabled) split(t); t.dirty = true; }
    if (enabled) wake();
  }
  function init() {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        const t = targets.find(item => item.el === entry.target);
        t.visible = entry.isIntersecting; t.dirty = true;
        if (!t.visible) reset(t);
      }
      wake();
    });
    const resize = new ResizeObserver(() => { for (const t of targets) t.dirty = true; wake(); });
    for (const el of document.querySelectorAll(window.PlazaElasticHeadingsConfig?.selector || 'main h1.plaza-heading-large, main h2.plaza-heading-medium')) {
      if (el.closest('dialog,nav')) continue;
      const t = {el, letters:[], mounted:false, visible:false, dirty:true, pointer:null, touchId:null, releaseTimer:0};
      targets.push(t); observer.observe(el); resize.observe(el);
      function point(event) {
        clearTimeout(t.releaseTimer);
        if (t.dirty) measure(t);
        const box = el.getBoundingClientRect();
        t.pointer = {x:event.clientX - box.left, y:event.clientY - box.top};
        wake();
      }
      PlazaRuntime.on(el,'pointerdown',event => {
        if (!enabled || event.pointerType === 'mouse' || !event.isPrimary) return;
        t.touchId = event.pointerId;
        point(event);
      },{passive:true});
      PlazaRuntime.on(el,'pointermove',event => {
        if (!enabled) return;
        if (event.pointerType !== 'mouse' && t.touchId !== event.pointerId) return;
        point(event);
      },{passive:true});
      PlazaRuntime.on(el,'pointerleave',event => {
        if (event.pointerType === 'mouse') { t.pointer = null; wake(); }
      },{passive:true});
      function release(event) {
        if (event.pointerId !== t.touchId) return;
        t.touchId = null;
        clearTimeout(t.releaseTimer);
        // Brief hold makes even a quick tap perceptible; cancellation yields to scrolling immediately.
        if (event.type === 'pointercancel') { t.pointer = null; wake(); }
        else t.releaseTimer = setTimeout(() => { t.pointer = null; wake(); }, 120);
      }
      PlazaRuntime.on(document,'pointerup',release,{passive:true});
      PlazaRuntime.on(document,'pointercancel',release,{passive:true});
    }
    PlazaRuntime.on(document,'pointerdown',event => {
      if (event.pointerType !== 'mouse' && !event.isPrimary) {
        for (const t of targets) { t.touchId = null; clearTimeout(t.releaseTimer); t.pointer = null; }
        wake();
      }
    },{passive:true});
    PlazaRuntime.on(media,'change',sync);
    PlazaRuntime.on(window,'scroll', () => { for (const t of targets) { t.pointer = null; t.touchId = null; clearTimeout(t.releaseTimer); t.dirty = true; } wake(); }, {passive:true});
    PlazaRuntime.on(document,'visibilitychange',() => {
      if (document.hidden) { PlazaMotion.cancelFrame(raf); raf = 0; for (const t of targets) reset(t); }
      else { for (const t of targets) t.dirty = true; wake(); }
    });
    PlazaRuntime.on(window,'blur', () => { for (const t of targets) { t.pointer = null; t.touchId = null; clearTimeout(t.releaseTimer); } wake(); });
    PlazaRuntime.on(window,'pageshow', sync);
    sync();
  }
  window.PlazaElasticHeadings = {version:2, settings};
  const start = () => (document.fonts?.ready || Promise.resolve()).then(init);
  if (document.readyState === 'loading') PlazaRuntime.on(document,'DOMContentLoaded',start,{once:true}); else start();
})();
