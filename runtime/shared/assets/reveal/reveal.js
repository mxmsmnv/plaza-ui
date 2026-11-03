/* One PLAZA reveal engine. Standard §14 confirmed 2026-10-17: 80% viewport line. */
(function () {
 'use strict';if(window.PlazaRevealEngine)return;
 window.PlazaRevealEngine={mount:function(config){
 if(window.PlazaRevealEngine.instance)return window.PlazaRevealEngine.instance;
  'use strict';

  var body = document.body;
  if (!body || !body.matches(config.bodySelector)) return;

  var desktop = window.matchMedia('(min-width:1024px) and (hover:hover) and (pointer:fine)');
  var reduced = window.matchMedia('(prefers-reduced-motion:reduce)');
  var userOff = false;
  try { userOff = new URLSearchParams(window.location.search).get('motion') === 'off'; } catch (ignore) {}

  var observer = null;
  var footerObserver = null;
  var checks = [];
  var records = [];
  var groups = [];
  var enabled = false;
  var destroyed = false;
  var endFrame = 0;
  var triggerInset = 0.20;
  var durationScale = 1.5;
  var booted = false;
  var epoch = 0;
  var revealOptions = {
    soft: { distance: 20, duration: 880 },
    heading: { distance: 24, duration: 920 },
    card: { distance: 30, duration: 980 },
    photo: { x: -24, distance: 18, duration: 1000 },
    copy: { distance: 24, duration: 940 },
    pairedCopy: { x: 24, distance: 12, duration: 940 },
    row: { distance: 16, duration: 880 },
    opacity: { distance: 0, duration: 880 },
    social: { distance: 12, duration: 840 }
  };

  function eligible() {
    return !destroyed && !userOff && desktop.matches && !reduced.matches &&
      typeof window.IntersectionObserver === 'function' &&
      typeof Element.prototype.animate === 'function' &&
      'translate' in document.documentElement.style;
  }

  function contentChildren(element) {
    if (!element) return [];
    var inner = Array.from(element.children).find(function (child) {
      return child.classList.contains('wp-block-group__inner-container');
    });
    return Array.from((inner || element).children).filter(function (child) {
      return !child.matches('script,style,.plaza-slider-controls');
    });
  }

  function select(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  function addGroup(trigger, elements, kind, stagger) {
    if (!trigger || !elements.length) return;
    var group = { trigger: trigger, records: [] };
    elements.forEach(function (element, index) {
      if(element&&element.matches('.plaza-heading-large,.plaza-heading-medium'))return;
      if(element&&element.querySelector('.plaza-heading-large,.plaza-heading-medium')){addGroup(trigger,contentChildren(element),kind,stagger);return;}
      if (!element || records.some(function (record) {
        return record.element === element || record.element.contains(element) || element.contains(record.element);
      })) return;
      var record = {
        element: element,
        kind: kind,
        delay: Math.min(index * (stagger || 0), 360) * durationScale,
        pending: false,
        animation: null,
        fadeAnimation: null,
        fallbackTimer: 0,
        oldKind: element.getAttribute('data-pm-kind')
      };
      records.push(record);
      group.records.push(record);
    });
    if (group.records.length) groups.push(group);
  }

  function singleton(selector, kind) {
    select(selector).forEach(function (element) { addGroup(element, [element], kind, 0); });
  }

  function collect() {
    records=[];groups=[];
    function collectBooking(){
      select('.plaza-booking-layout').forEach(function(layout){
        var elements=['copy','portrait','actions'].map(function(role){return layout.querySelector(':scope > .plaza-booking-'+role);}).filter(Boolean);
        addGroup(layout,elements,'copy',120);
      });
    }
    config.collect({select,addGroup,singleton,contentChildren,collectBooking});
  }

  function finish(record, animation) {
    if (animation && record.animation !== animation) return;
    if (record.fallbackTimer) window.clearTimeout(record.fallbackTimer);
    record.fallbackTimer = 0;
    var current = record.animation;
    var fade = record.fadeAnimation;
    record.animation = null;
    record.fadeAnimation = null;
    record.pending = false;
    record.element.classList.remove('pm-pending', 'pm-running');
    if (current) current.cancel();
    if (fade && fade !== current) fade.cancel();
  }

  function reveal(record, immediate) {
    if (!record.pending && !record.animation) return;
    if (immediate || !enabled || !eligible()) { finish(record); return; }
    if (record.animation) return;
    record.pending = false;
    record.element.classList.remove('pm-pending');
    record.element.classList.add('pm-running');
    try {
      var options = revealOptions[record.kind] || revealOptions.soft;
      var duration = options.duration * durationScale;
      var timing = { duration: duration, delay: record.delay, fill: 'both' };
      // Fade grows gradually; movement keeps the approved gentle deceleration.
      var fade = PlazaMotion.animate(record.element,[{ opacity: 0 }, { opacity: 1 }],Object.assign({}, timing, {
        easing: 'cubic-bezier(.4,0,.2,1)'
      }));
      record.fadeAnimation = fade;
      var animation = fade;
      if (record.kind !== 'opacity') {
        var from = { translate: (options.x || 0) + 'px ' + options.distance + 'px' };
        var to = { translate: '0 0' };
        if (record.kind === 'social') { from.scale = '.78'; to.scale = '1'; }
        animation = PlazaMotion.animate(record.element,[from, to],Object.assign({}, timing, {
          easing: 'cubic-bezier(.16,1,.3,1)'
        }));
      }
      record.animation = animation;
      Promise.all([animation.finished, fade.finished]).then(function () { finish(record, animation); }, function () { finish(record, animation); });
      record.fallbackTimer = window.setTimeout(function () { finish(record, animation); }, duration + record.delay + 300);
    } catch (error) { finish(record); }
  }

  function revealRelated(target) {
    if (!target) return;
    records.forEach(function (record) {
      if (record.element === target || record.element.contains(target) || target.contains(record.element)) reveal(record, true);
    });
  }

  function hashTarget() {
    var id;
    try { id = decodeURIComponent(window.location.hash.slice(1)); } catch (ignore) { return null; }
    return id ? document.getElementById(id) : null;
  }

  function revealHash() { revealRelated(hashTarget()); }

  function observeGroups() {
    if (observer) observer.disconnect();
    if (footerObserver) footerObserver.disconnect();
    var generation = epoch;
    // IO percentages use root width; use pixels for a true 20% viewport-height inset.
    var inset = Math.round(window.innerHeight * triggerInset);
    var callback = function (entries) {
      if (generation !== epoch || !enabled) return;
      try {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          groups.forEach(function (group) {
            if (group.trigger === entry.target) group.records.forEach(function (record) { reveal(record, false); });
          });
          observer.unobserve(entry.target);
          footerObserver.unobserve(entry.target);
        });
      } catch (error) { stop(); }
    };
    observer = new IntersectionObserver(callback, { rootMargin: '0px 0px -' + inset + 'px 0px', threshold: 0 });
    footerObserver = new IntersectionObserver(callback, { rootMargin: '0px', threshold: 0 });
    groups.forEach(function (group) {
      if (group.records.some(function (record) { return record.pending; })) {
        (config.footerTriggerSelector && group.trigger.matches(config.footerTriggerSelector) ? footerObserver : observer).observe(group.trigger);
      }
    });
  }

  function revealEndOfPage() {
    if (!enabled) return;
    var scroller = document.scrollingElement || document.documentElement;
    if (scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight - 3) return;
    // Final footer rows cannot always reach the inset line: reveal visible groups at the end.
    groups.forEach(function (group) {
      if (!group.records.some(function (record) { return record.pending; })) return;
      var rect = group.trigger.getBoundingClientRect();
      if (rect.top >= window.innerHeight || rect.bottom <= 0) return;
      group.records.forEach(function (record) { reveal(record, false); });
      if (observer) observer.unobserve(group.trigger);
    });
  }

  // Each inclusion mark follows its row from 95% to 50% of viewport height.
  // Read the untransformed row, never the animated glyph, to avoid feedback.
  function updateChecks() {
    var active = !destroyed && !userOff && !reduced.matches;
    var height = Math.max(1, window.innerHeight);
    var samples = active ? checks.map(function (mark) {
      var row = mark.parentElement.getBoundingClientRect();
      var progress = Math.max(0, Math.min(1, (height * .95 - row.top) / (height * .45)));
      return {mark:mark, value:progress * progress * (3 - 2 * progress)};
    }) : [];
    checks.forEach(function (mark) { mark.toggleAttribute('data-plaza-check-motion', active); });
    samples.forEach(function (sample) {
      var value = sample.value, mark = sample.mark;
      mark.style.setProperty('--plaza-check-opacity', value.toFixed(4));
      mark.style.setProperty('--plaza-check-scale', (3 - 2 * value).toFixed(4));
      mark.style.setProperty('--plaza-check-blur', (12 * (1 - value)).toFixed(3) + 'px');
      mark.style.setProperty('--plaza-check-offset', (32 * (1 - value)).toFixed(3) + 'px');
    });
  }

  function onScroll() {
    if (destroyed || endFrame) return;
    endFrame = PlazaMotion.frame(function () {
      endFrame = 0;
      try { updateChecks(); if (enabled) revealEndOfPage(); } catch (error) { stop(); }
    });
  }

  function onResize() {
    onScroll();
    if (!enabled || !eligible()) return;
    try { observeGroups(); onScroll(); } catch (error) { stop(); }
  }

  function stop() {
    epoch += 1;
    if (endFrame) PlazaMotion.cancelFrame(endFrame);
    endFrame = 0;
    if (observer) observer.disconnect();
    observer = null;
    if (footerObserver) footerObserver.disconnect();
    footerObserver = null;
    enabled = false;
    body.classList.remove('pm-enabled');
    records.forEach(function (record) {
      finish(record);
      if (record.oldKind === null) record.element.removeAttribute('data-pm-kind');
      else record.element.setAttribute('data-pm-kind', record.oldKind);
    });
    records = [];
    groups = [];
  }

  function start(options) {
    if (destroyed) return;
    stop();
    if (!eligible()) return;
    try {
      collect();
      enabled = true;
      body.classList.add('pm-enabled');
      records.forEach(function (record) {
        record.element.setAttribute('data-pm-kind', record.kind);
        var rect = record.element.getBoundingClientRect();
        // Preserve visible content when re-enabling after a media change.
        if (rect.bottom <= 0 || (options && options.preserveViewport && rect.top < window.innerHeight)) return;
        record.pending = true;
        record.element.classList.add('pm-pending');
      });
      revealHash();
      observeGroups();
      onScroll();
    } catch (error) { stop(); }
  }

  function onFocus(event) { revealRelated(event.target); }
  function onHash() { revealHash(); }
  function onMedia() {
    if (eligible()) start({ preserveViewport: true });
    else stop();
    onScroll();
  }
  function onPageShow(event) {
    onScroll();
    if (!event.persisted || destroyed) return;
    if (!eligible()) { stop(); return; }
    if (!enabled) { start({ preserveViewport: true }); return; }
    records.forEach(function (record) {
      if (record.element.getBoundingClientRect().top < window.innerHeight) reveal(record, true);
    });
    revealHash();
  }

  function destroy() {
    if (destroyed) return;
    stop();
    destroyed = true;
    checks.forEach(function(mark){mark.removeAttribute("data-plaza-check-motion");});
    checks = [];
    PlazaRuntime.off(desktop,'change',onMedia);
    PlazaRuntime.off(reduced,'change',onMedia);
    PlazaRuntime.off(document,'focusin',onFocus);
    PlazaRuntime.off(window,'hashchange',onHash);
    PlazaRuntime.off(window,'pageshow',onPageShow);
    PlazaRuntime.off(window,'scroll',onScroll);
    PlazaRuntime.off(window,'resize',onResize);
    PlazaRuntime.off(document,'DOMContentLoaded',boot);
  }

  function boot() {
    if (destroyed || booted) return;
    try {
      booted = true;
      checks = select("main .included-grid .inclusions .check");
      PlazaRuntime.on(desktop,'change',onMedia);
      PlazaRuntime.on(reduced,'change',onMedia);
      PlazaRuntime.on(document,'focusin',onFocus);
      PlazaRuntime.on(window,'hashchange',onHash);
      PlazaRuntime.on(window,'pageshow',onPageShow);
      PlazaRuntime.on(window,'scroll',onScroll,{ passive: true });
      PlazaRuntime.on(window,'resize',onResize);
      start();
      onScroll();
    } catch (error) { stop(); }
  }

  const api = {
    start: function () { userOff = false; start({ preserveViewport: true }); },
    destroy: destroy,
    get enabled() { return enabled; }
  };
  window.PlazaScrollMotion=window.PlazaNetworkMotion=window.PlazaRevealEngine.instance=api;
  if (document.readyState === 'loading') PlazaRuntime.on(document,'DOMContentLoaded',boot,{ once: true });
  else boot();
return api;
 }};
}());
