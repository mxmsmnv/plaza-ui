/* Approved Card stack: one implementation, independently enabled PLAZA profiles. */
(() => {
  'use strict';
  if (window.PlazaPageTransition) return;
  const root = document.documentElement;
  let config;
  try { config = JSON.parse(document.getElementById('plaza-page-transition-config').textContent); }
  catch { return; }
  if (!('onpagereveal' in window) || !('onpageswap' in window)
      || !window.CSS?.supports('view-transition-name', 'root') || !window.KeyframeEffect) return;
  try {
    const probe = new KeyframeEffect(root, [], {pseudoElement: '::view-transition-old(root)'});
    if (probe.pseudoElement !== '::view-transition-old(root)') return;
  } catch { return; }

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const duration = Math.max(1, Number(config.durationMs) || 1500);
  const easing = config.easing || 'cubic-bezier(.42,0,.18,1)';
  const routes = (Array.isArray(config.routes) ? config.routes : [
    {basePath: config.basePath || '/kislovodsk/', enabled: true}
  ]).filter(route => typeof route.basePath === 'string' && route.basePath.startsWith('/'))
    .slice().sort((first, second) => second.basePath.length - first.basePath.length);
  const optIn = document.createElement('style');
  optIn.id = 'plaza-page-transition-opt-in';
  document.head.appendChild(optIn);
  let current = null;
  let animations = [];

  const within = value => {
    try {
      const url = new URL(value, location.href);
      if (url.origin !== location.origin) return false;
      // Resolve the most specific profile before checking enabled. A disabled
      // property must never inherit the network's broad "/" opt-in.
      const route = routes.find(({basePath}) => basePath === '/'
        || url.pathname === basePath.slice(0, -1) || url.pathname.startsWith(basePath));
      return route?.enabled === true;
    } catch { return false; }
  };
  const eligible = activation => {
    if (reduced.matches || !activation?.from?.url || !activation?.entry?.url
        || activation.navigationType === 'reload') return false;
    if (!within(activation.from.url) || !within(activation.entry.url)) return false;
    const from = new URL(activation.from.url), to = new URL(activation.entry.url);
    return from.pathname !== to.pathname || from.search !== to.search;
  };
  const clearSurface = () => {
    delete root.dataset.plazaDocumentStack;
    delete root.dataset.plazaDocumentSnapshot;
    delete root.dataset.plazaDocumentOldSnapshot;
    delete root.dataset.plazaDocumentNewSnapshot;
    root.style.removeProperty('--plaza-page-canvas');
  };
  const skip = transition => {
    try { transition?.skipTransition(); } catch { /* Navigation remains native. */ }
  };
  const stop = () => {
    const transition = current;
    current = null;
    skip(transition);
    animations.forEach(animation => animation.cancel());
    animations = [];
    clearSurface();
  };
  const surface = activation => {
    const palette = getComputedStyle(document.body || root);
    const background = palette.getPropertyValue('--bg').trim();
    if (background) root.style.setProperty('--plaza-page-canvas', background);
    root.dataset.plazaDocumentStack = 'stack';
    // Keep the document's own viewport capture, but give night navigation a
    // distinct identity from the root snapshots used by the theme reveal.
    // Cross-profile navigation keeps its existing shared root contract.
    const property = ['kislovodsk', 'zheleznovodsk'].includes(config.profile);
    const sameProperty = property && [activation.from.url, activation.entry.url].every(value => {
      const path = new URL(value).pathname;
      return path === config.basePath.slice(0, -1) || path.startsWith(config.basePath);
    });
    if (sameProperty && root.dataset.theme === 'dark') {
      root.dataset.plazaDocumentSnapshot = 'plaza-document-card';
    }
  };
  const optInForMotion = () => {
    optIn.textContent = '@view-transition { navigation: ' + (reduced.matches ? 'none' : 'auto') + '; }';
    if (reduced.matches) stop();
  };
  optInForMotion();
  PlazaRuntime.on(reduced,'change',optInForMotion);

  PlazaRuntime.on(window,'pageswap', event => {
    stop();
    const transition = event.viewTransition;
    if (!transition) return;
    if (!eligible(event.activation)) { skip(transition); return; }
    surface(event.activation);
    // An outgoing page can be frozen in bfcache. pagereveal resets its surface.
    transition.ready.catch(() => {});
    transition.finished.catch(() => {});
  });

  PlazaRuntime.on(window,'pagereveal', event => {
    stop();
    const transition = event.viewTransition;
    const activation = window.navigation?.activation;
    if (!transition) return;
    if (!eligible(activation)) { skip(transition); return; }
    current = transition;
    surface(activation);
    const snapshot = root.dataset.plazaDocumentSnapshot || 'root';
    root.dataset.plazaDocumentLastSnapshot = snapshot;
    root.dataset.plazaDocumentLastTheme = root.dataset.theme;
    root.dataset.plazaDocumentLastState = 'preparing';
    const direction = activation.navigationType === 'traverse'
      && activation.entry.index < activation.from.index ? -1 : 1;
    transition.ready.then(() => {
      if (current !== transition || reduced.matches) { skip(transition); return; }
      root.dataset.plazaDocumentLastState = 'running';
      let oldSnapshot = snapshot;
      // A page restored from an earlier release may have captured root while
      // this document uses the night card. Select the existing outgoing image.
      // only-child is checked on both groups, so the normal pair is untouched.
      if (snapshot === 'plaza-document-card' && root.dataset.theme === 'dark') {
        const single = (kind, name) => getComputedStyle(root,
          `::view-transition-${kind}(${name})`).getPropertyValue('--plaza-document-single').trim();
        if (single('new', snapshot) === 'new' && single('old', 'root') === 'old') {
          oldSnapshot = 'root';
          root.dataset.plazaDocumentOldSnapshot = oldSnapshot;
          root.dataset.plazaDocumentNewSnapshot = snapshot;
        }
      }
      root.dataset.plazaDocumentLastOldSnapshot = oldSnapshot;
      const options = {duration, easing, fill: 'both'};
      try {
        animations.push(PlazaMotion.animate(root,[
            {transform: 'translateY(0) scale(1) rotate(0)', opacity: 1},
            {transform: `translateY(-9%) scale(.86) rotate(${-direction * 4}deg)`, opacity: .6, offset: .55},
            {transform: `translateY(-9%) scale(.86) rotate(${-direction * 4}deg)`, opacity: .6}
          ],{...options, pseudoElement: `::view-transition-old(${oldSnapshot})`}));
        animations.push(PlazaMotion.animate(root,[
            {transform: `translate(${direction * 9}%,112%) rotate(${direction * 5}deg)`},
            {transform: `translate(${direction * 9}%,112%) rotate(${direction * 5}deg)`, offset: .18},
            {transform: 'translate(0,0) rotate(0)'}
          ],{...options, pseudoElement: `::view-transition-new(${snapshot})`}));
      } catch { stop(); }
    }).catch(() => {});
    transition.finished.catch(() => {}).then(() => {
      if (current !== transition) return;
      current = null;
      root.dataset.plazaDocumentLastState = 'finished';
      animations.forEach(animation => animation.cancel());
      animations = [];
      clearSurface();
    });
  });
  PlazaRuntime.on(window,'resize', () => { if (current) stop(); });
  window.PlazaPageTransition = Object.freeze({
    version: '20261023-snapshot-pair-4', effect: 'stack', durationMs: duration, profile: config.profile
  });
})();
