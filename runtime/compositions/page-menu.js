/* PLAZA: optional desktop page overview. The existing header owns menu state. */
(() => {
  'use strict';
  if (window.PlazaPageMenu) return;
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  const attached = new WeakMap();
  const empty = Object.freeze({open: () => false, close: () => false, active: () => false});
  let config;
  try { config = JSON.parse(document.getElementById('plaza-page-menu-config').textContent); }
  catch { config = null; }

  const desktop = matchMedia(['kislovodsk','zheleznovodsk'].includes(config?.property)
    ? '(min-width:1024px) and (orientation:landscape), (min-width:1024px) and (hover:hover) and (pointer:fine)'
    : '(min-width:1024px) and (hover:hover) and (pointer:fine)');

  function attach({header, panel, button}) {
    if (!config?.enabled || !header || !panel || !button
        || (config.property && config.property !== window.PlazaShell?.property)) return empty;
    if (attached.has(panel)) return attached.get(panel);
    const pages = (Array.isArray(config.pages) ? config.pages : []).filter(page => {
      try {
        return /^[a-z][a-z0-9-]*$/.test(page.id) && page.title
          && new URL(page.href, config.baseUrl || 'https://plaza.spa/').origin === new URL(config.baseUrl || 'https://plaza.spa/').origin
          && page.light?.src && page.dark?.src;
      } catch { return false; }
    });
    if (pages.length < 2) return empty;

    const duration = Math.max(250, Math.min(2000, Number(config.duration) || 1050));
    const easing = 'cubic-bezier(.76,0,.24,1)';
    const atmosphere = document.createElement('div');
    atmosphere.className = 'pn-page-menu-atmosphere';
    atmosphere.setAttribute('aria-hidden', 'true');
    atmosphere.dataset.active = 'false';
    for (let i = 0; i < 3; i += 1) {
      const spot = document.createElement('i');
      spot.className = 'plaza-night-orbit';
      atmosphere.append(spot);
    }
    const gallery = document.createElement('nav');
    gallery.className = 'pn-page-menu-grid';

    gallery.setAttribute('aria-label', 'Страницы санатория');
    gallery.hidden = true;
    const tiles = [];
    const images = [];
    const originalRole = panel.getAttribute('role');
    const originalModal = panel.getAttribute('aria-modal');
    let phase = 'closed';
    let desiredOpen = false;
    let sequence = 0;
    let transition = null;
    let pending = null;
    let preparing = null;
    let prepared = false;
    let animations = [];
    let names = [];
    let overlay = null;
    let navigationStyle = null;
    let navigationTimer = 0;
    let canvasStyle = null;
    let forwardingThemeClick = false;
    let pageScroll = {x: 0, y: 0};

    const absolute = value => new URL(value, config.baseUrl || location.href).href;
    const sourceSet = value => String(value).split(',').map(entry => {
      const match = entry.trim().match(/^(\S+)(\s+\d+(?:\.\d+)?[wx])?$/);
      return match ? absolute(match[1]) + (match[2] || '') : entry;
    }).join(', ');
    for (const page of pages) {
      const tile = document.createElement('a');
      tile.className = 'pn-page-menu-tile';
      tile.dataset.page = page.id;
      tile.href = page.href;
      const preview = document.createElement('span');
      preview.className = 'pn-page-menu-preview';
      for (const theme of ['light', 'dark']) {
        const asset = page[theme];
        const picture = document.createElement('picture');
        picture.className = `pn-page-menu-picture pn-page-menu-${theme}`;
        const image = document.createElement('img');
        image.width = Number(asset.width) || 1440;
        image.height = Number(asset.height) || 900;
        image.alt = '';
        image.decoding = 'async';
        image.loading = 'eager';
        image.sizes = '(min-width:1800px) 390px, 23vw';
        images.push({image, asset});
        picture.append(image);
        preview.append(picture);
      }
      const title = document.createElement('span');
      title.className = 'pn-page-menu-title';
      title.textContent = page.title;
      tile.append(preview, title);
      if (page.subtitle) {
        const subtitle = document.createElement('span');
        subtitle.className = 'pn-page-menu-subtitle';
        subtitle.textContent = page.subtitle;
        tile.append(subtitle);
      }
      gallery.append(tile);
      tiles.push({tile, preview, page});
    }
    panel.append(atmosphere, gallery);

    const normalizedPath = value => {
      const url = new URL(value, location.href);
      return url.pathname.replace(/\/+$/, '') || '/';
    };
    const here = normalizedPath(config.currentURL || config.baseUrl || location.href);
    const current = tiles.slice().sort((a, b) => normalizedPath(b.page.href).length - normalizedPath(a.page.href).length)
      .find(({page}) => here === normalizedPath(page.href) || here.startsWith(normalizedPath(page.href) + '/')) || tiles[0];
    current.tile.setAttribute('aria-current', 'page');

    const state = value => { phase = value; panel.dataset.plazaPageMenuState = value; };
    const active = () => phase !== 'closed';
    const available = () => desktop.matches && config.enabled === true;
    const updateAtmosphereMotion = () => {
      atmosphere.dataset.active = String(panel.classList.contains('pn-page-menu-active')
        && available() && !document.hidden && !reduced.matches);
    };
    const canMove = () => available() && !reduced.matches && !document.hidden
      && typeof document.startViewTransition === 'function'
      && !root.classList.contains('plaza-theme-reveal')
      && root.dataset.plazaThemeState !== 'running'
      && !root.hasAttribute('data-plaza-document-stack')
      && getComputedStyle(root).viewTransitionName === 'root'
      && (!getComputedStyle(header).viewTransitionName || getComputedStyle(header).viewTransitionName === 'none');

    async function prepare() {
      if (prepared) return true;
      if (preparing) return preparing;
      preparing = Promise.all(images.map(async ({image, asset}) => {
        if (!image.getAttribute('src')) {
          if (asset.srcset) image.srcset = sourceSet(asset.srcset);
          image.src = absolute(asset.src);
        }
        try {
          if (image.decode) await image.decode();
          else if (!image.complete) await new Promise((resolve, reject) => {
            PlazaRuntime.on(image,'load',resolve,{once: true});
            PlazaRuntime.on(image,'error',reject,{once: true});
          });
          return image.naturalWidth > 1;
        } catch { return false; }
      })).then(results => {
        prepared = results.every(Boolean);
        preparing = null;
        return prepared;
      }).catch(() => {
        preparing = null;
        return false;
      });
      return preparing;
    }

    function reveal(open) {
      panel.classList.toggle('pn-page-menu-active', open);
      document.body.classList.toggle('pn-page-menu-active', open);
      gallery.hidden = !open;
      updateAtmosphereMotion();
      if (open) {
        panel.setAttribute('role', 'dialog');
        panel.setAttribute('aria-modal', 'true');
      } else {
        if (originalRole === null) panel.removeAttribute('role');
        else panel.setAttribute('role', originalRole);
        if (originalModal === null) panel.removeAttribute('aria-modal');
        else panel.setAttribute('aria-modal', originalModal);
      }
    }

    function restoreNames() {
      for (const [element, name, priority] of names) {
        if (name) element.style.setProperty('view-transition-name', name, priority);
        else element.style.removeProperty('view-transition-name');
      }
      names = [];
    }

    function clearMotion() {
      try { transition?.skipTransition(); } catch { /* Native menu state still commits. */ }
      transition = null;
      animations.forEach(animation => animation.cancel());
      animations = [];
      restoreNames();
      delete root.dataset.plazaPageMenuTransition;
      if (canvasStyle) {
        if (canvasStyle.value) root.style.setProperty('--plaza-page-menu-canvas', canvasStyle.value, canvasStyle.priority);
        else root.style.removeProperty('--plaza-page-menu-canvas');
        canvasStyle = null;
      }
    }

    function clearNavigation(keepOptOut = false) {
      clearTimeout(navigationTimer);
      navigationTimer = 0;
      overlay?.remove();
      overlay = null;
      if (!keepOptOut) {
        navigationStyle?.remove();
        navigationStyle = null;
      }
    }

    function settle(open, focus = false) {
      clearMotion();
      desiredOpen = open;
      pending = null;
      reveal(open && available());
      state(open && available() ? 'open' : 'closed');
      if (focus && open && available()) current.tile.focus({preventScroll: true});
    }

    function interrupt() {
      sequence += 1;
      pending = null;
      clearMotion();
      clearNavigation();
      return sequence;
    }

    function animate(frames, options) {
      const animation = PlazaMotion.animate(root,frames,{duration, easing, fill: 'both', ...options});
      animations.push(animation);
      animation.finished.catch(() => {});
      return animation;
    }

    function nameSnapshots() {
      const setName = (element, value) => {
        names.push([element, element.style.getPropertyValue('view-transition-name'), element.style.getPropertyPriority('view-transition-name')]);
        element.style.setProperty('view-transition-name', value);
      };
      setName(header, 'plaza-page-menu-header');
      for (const {tile, page} of tiles) {
        if (tile !== current.tile) setName(tile, 'plaza-page-menu-' + page.id);
      }
    }

    function intoTile(rect, width = document.documentElement.clientWidth, height = innerHeight) {
      const scale = Math.min(rect.width / width, rect.height / height);
      const x = rect.left + (rect.width - width * scale) / 2;
      const y = rect.top + (rect.height - height * scale) / 2;
      return `translate(${x}px,${y}px) scale(${scale})`;
    }

    function run(open, commit, token) {
      let committed = false;
      let rootSnapshot = null;
      const change = () => {
        if (committed || token !== sequence) return;
        committed = true;
        commit();
        reveal(open);
        if (rootSnapshot) {
          if (open) root.style.setProperty('view-transition-name', 'plaza-page-menu-canvas');
          else if (rootSnapshot.value) root.style.setProperty('view-transition-name', rootSnapshot.value, rootSnapshot.priority);
          else root.style.removeProperty('view-transition-name');
        }
      };
      pending = {token, change};
      if (!canMove()) {
        change();
        settle(open, open);
        return;
      }
      let rect = open ? null : current.preview.getBoundingClientRect();
      root.dataset.plazaPageMenuTransition = open ? 'opening' : 'closing';
      canvasStyle = {value: root.style.getPropertyValue('--plaza-page-menu-canvas'), priority: root.style.getPropertyPriority('--plaza-page-menu-canvas')};
      const palette = getComputedStyle(document.body);
      root.style.setProperty('--plaza-page-menu-canvas', getComputedStyle(panel).backgroundColor || palette.getPropertyValue('--pn-bg').trim() || palette.getPropertyValue('--bg').trim() || palette.backgroundColor);
      nameSnapshots();
      rootSnapshot = {value: root.style.getPropertyValue('view-transition-name'), priority: root.style.getPropertyPriority('view-transition-name')};
      names.push([root, rootSnapshot.value, rootSnapshot.priority]);
      if (!open) root.style.setProperty('view-transition-name', 'plaza-page-menu-canvas');
      state(open ? 'opening' : 'closing');
      try {
        const ownTransition = document.startViewTransition(() => {
          change();
          if (open && token === sequence) rect = current.preview.getBoundingClientRect();
        });
        transition = ownTransition;
        ownTransition.ready.then(() => {
          if (token !== sequence || !rect || reduced.matches) {
            ownTransition.skipTransition();
            return;
          }
          const target = intoTile(rect);
          const moving = open ? 'old' : 'new';
          animate(open ? [
            {transform: 'none', opacity: 1},
            {transform: target, opacity: 1, offset: .9},
            {transform: target, opacity: 0}
          ] : [
            {transform: target, opacity: 1},
            {transform: 'none', opacity: 1}
          ], {pseudoElement: `::view-transition-${moving}(root)`});
          let order = 0;
          for (const {tile, page} of open ? tiles : tiles.slice().reverse()) {
            if (tile === current.tile) continue;
            animate(open ? [
              {opacity: 0, transform: 'translateX(32vw) scale(1.1)'},
              {opacity: 1, transform: 'none'}
            ] : [
              {opacity: 1, transform: 'none'},
              {opacity: 0, transform: 'translateX(18vw) scale(1.05)'}
            ], {
              pseudoElement: `::view-transition-${open ? 'new' : 'old'}(plaza-page-menu-${page.id})`,
              duration: open ? duration * .68 : duration * .48,
              delay: order++ * (open ? 42 : 24)
            });
          }
        }).catch(() => {});
        ownTransition.finished.catch(() => {}).then(() => {
          if (token !== sequence) return;
          change();
          settle(open, open);
        });
      } catch {
        change();
        if (token === sequence) settle(open, open);
      }
    }

    function open(commit) {
      if (!available()) return false;
      const token = interrupt();
      desiredOpen = true;
      state('preparing');
      pageScroll = {x: scrollX, y: scrollY};
      // A slow or unavailable thumbnail falls back to the original compact menu.
      const timeout = new Promise(resolve => setTimeout(() => resolve(false), 2500));
      Promise.race([prepare(), timeout]).then(ready => {
        if (token !== sequence || !desiredOpen) return;
        if (!ready || !available()) {
          commit();
          settle(false);
          return;
        }
        reveal(true);
        run(true, commit, token);
      });
      return true;
    }

    function close(commit) {
      if (!active()) return false;
      const prior = phase;
      const token = interrupt();
      desiredOpen = false;
      if (prior === 'preparing' || !available() || panel.getAttribute('aria-hidden') !== 'false') {
        commit();
        settle(false);
      } else {
        if (scrollX !== pageScroll.x || scrollY !== pageScroll.y) scrollTo(pageScroll.x, pageScroll.y);
        run(false, commit, token);
      }
      return true;
    }

    async function navigate(item) {
      const token = interrupt();
      desiredOpen = true;
      state('navigating');
      const image = new Image();
      const theme = root.dataset.theme === 'dark' ? 'dark' : 'light';
      const asset = item.page[theme];
      image.alt = '';
      image.width = Number(asset.width) || 1440;
      image.height = Number(asset.height) || 900;
      image.src = absolute(asset.src);
      const loaded = await Promise.race([
        (image.decode ? image.decode().then(() => image.naturalWidth > 1).catch(() => false)
          : Promise.resolve(image.complete && image.naturalWidth > 1)),
        new Promise(resolve => setTimeout(() => resolve(false), 2500))
      ]);
      if (token !== sequence) return;
      const go = () => {
        if (token !== sequence) return;
        // Disable only this outgoing document's cross-document effect; ordinary
        // links retain the independently approved Card stack controller.
        navigationStyle = document.createElement('style');
        navigationStyle.id = 'plaza-page-menu-navigation-opt-out';
        navigationStyle.textContent = '@view-transition { navigation: none; }';
        document.head.append(navigationStyle);
        navigationTimer = setTimeout(() => {
          if (token !== sequence) return;
          // A slow native request may still complete after the UI recovers.
          clearNavigation(true);
          settle(true, true);
        }, 8000);
        try { window.PlazaSpecimenNavigate(item.tile.href); clearNavigation(); settle(true, true); }
        catch { clearNavigation(); settle(true, true); }
      };
      if (!loaded || !available() || reduced.matches || document.hidden
          || typeof image.animate !== 'function' || root.dataset.plazaThemeState === 'running'
          || root.hasAttribute('data-plaza-document-stack')) {
        go();
        return;
      }
      overlay = document.createElement('div');
      overlay.className = 'pn-page-menu-active pn-page-menu-navigation';
      overlay.setAttribute('aria-hidden', 'true');
      overlay.append(image);
      document.body.append(overlay);
      const full = image.getBoundingClientRect();
      if (!full.width || !full.height) { clearNavigation(); go(); return; }
      const rect = item.preview.getBoundingClientRect();
      const scale = Math.min(rect.width / full.width, rect.height / full.height);
      const x = rect.left + (rect.width - full.width * scale) / 2 - full.left;
      const y = rect.top + (rect.height - full.height * scale) / 2 - full.top;
      image.style.transformOrigin = '0 0';
      const animation = PlazaMotion.animate(image,[
        {transform: `translate(${x}px,${y}px) scale(${scale})`},
        {transform: 'none'}
      ],{duration, easing, fill: 'both'});
      animations.push(animation);
      await animation.finished.catch(() => {});
      if (token !== sequence) return;
      overlay.classList.add('pn-page-menu-expanded');
      go();
    }

    PlazaRuntime.on(panel,'click',event => {
      const tile = event.target instanceof Element ? event.target.closest('.pn-page-menu-tile') : null;
      if (!tile || !gallery.contains(tile) || !available()
          || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      if (new URL(tile.href).href === new URL(location.href).href) {
        button.click();
        return;
      }
      const item = tiles.find(item => item.tile === tile);
      if (item) navigate(item);
    },true);

    PlazaRuntime.on(panel,'keydown',event => {
      if (!active() || !available()) return;
      const index = tiles.findIndex(({tile}) => tile === document.activeElement);
      if (index < 0) return;
      let next = index;
      if (event.key === 'ArrowRight') next += 1;
      else if (event.key === 'ArrowLeft') next -= 1;
      else if (event.key === 'ArrowDown') next += 4;
      else if (event.key === 'ArrowUp') next -= 4;
      else if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = tiles.length - 1;
      else return;
      event.preventDefault();
      tiles[(next + tiles.length) % tiles.length].tile.focus({preventScroll: true});
    });

    PlazaRuntime.on(document,'keydown',event => {
      if (!active() || !available()) return;
      if (event.key === 'Escape' && phase === 'preparing') {
        event.preventDefault();
        event.stopImmediatePropagation();
        interrupt();
        settle(false);
        button.focus({preventScroll: true});
        return;
      }
      if (event.key !== 'Tab' || panel.getAttribute('aria-hidden') !== 'false') return;
      const choices = [...header.querySelectorAll('a[href],button:not(:disabled)'), ...gallery.querySelectorAll('a[href]')]
        .filter(element => !element.closest('[inert]') && element.getClientRects().length
          && getComputedStyle(element).visibility !== 'hidden' && element.tabIndex >= 0);
      if (!choices.length) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      const index = choices.indexOf(document.activeElement);
      const next = index < 0 ? (event.shiftKey ? choices.length - 1 : 0)
        : (index + (event.shiftKey ? -1 : 1) + choices.length) % choices.length;
      choices[next].focus({preventScroll: true});
    },true);

    function onEnvironmentChange() {
      if (!active()) return;
      const focusWasInGallery = gallery.contains(document.activeElement);
      if (phase === 'navigating' && navigationStyle) {
        // location.assign is already pending. A theme change may recover the
        // menu UI, but must not opt that pending response back into Card stack.
        sequence += 1;
        clearNavigation(true);
        settle(desiredOpen && available());
        if (!available() && focusWasInGallery) button.focus({preventScroll: true});
        return;
      }
      if (phase === 'preparing') {
        interrupt();
        settle(false);
        return;
      }
      const open = desiredOpen;
      const change = pending?.change;
      if (change) change();
      interrupt();
      settle(open && available());
      if (!available() && focusWasInGallery) button.focus({preventScroll: true});
    }
    // Window capture precedes the existing theme controller's document capture.
    // Restore our temporary snapshot names before it captures its old root.
    PlazaRuntime.on(window,'click', event => {
      if (forwardingThemeClick) return;
      if (!['preparing', 'opening', 'closing'].includes(phase)) return;
      const target = event.target instanceof Element ? event.target : null;
      // Chromium can retarget clicks on a named header snapshot to html even
      // when the transition tree has pointer-events:none. Forward only the
      // existing sun's exact hit box, after restoring the real document state.
      if ((phase === 'opening' || phase === 'closing') && target === root) {
        const sun = header.querySelector('button.pn-header-sun[data-plaza-daylight-toggle]');
        const rect = sun?.getBoundingClientRect();
        if (sun && !sun.disabled && rect?.width > 0 && rect.height > 0
            && event.clientX >= rect.left && event.clientX <= rect.right
            && event.clientY >= rect.top && event.clientY <= rect.bottom) {
          event.preventDefault();
          event.stopImmediatePropagation();
          onEnvironmentChange();
          forwardingThemeClick = true;
          try { sun.click(); }
          finally { forwardingThemeClick = false; }
          return;
        }
      }
      if (target?.closest('.footer-theme-toggle,.pn-theme:not(.pn-theme-system),.theme-toggle,.theme-auto,.pn-theme-system')) {
        onEnvironmentChange();
      }
    }, true);
    PlazaRuntime.on(window,'resize', onEnvironmentChange, {passive: true});
    PlazaRuntime.on(desktop,'change',onEnvironmentChange);
    PlazaRuntime.on(reduced,'change',onEnvironmentChange);
    PlazaRuntime.on(document,'plaza:themechange',() => {
      if (phase === 'opening' || phase === 'closing' || phase === 'navigating') onEnvironmentChange();
    });
    PlazaRuntime.on(document,'visibilitychange',updateAtmosphereMotion);
    PlazaRuntime.on(window,'pagehide', () => {
      atmosphere.dataset.active = 'false';
      sequence += 1;
      clearMotion();
      clearTimeout(navigationTimer);
      overlay?.remove();
      overlay = null;
      // Keep the outgoing opt-out until this bfcache document is shown again.
    });
    PlazaRuntime.on(window,'pageshow', event => {
      if (!event.persisted) return;
      interrupt();
      settle(false);
      if (panel.getAttribute('aria-hidden') === 'false') button.click();
    });

    const warm = () => { if (available()) prepare(); };
    PlazaRuntime.on(desktop,'change',warm);
    if (typeof requestIdleCallback === 'function') requestIdleCallback(warm, {timeout: 1500});
    else setTimeout(warm, 350);
    const instance = Object.freeze({open, close, active});
    attached.set(panel, instance);
    return instance;
  }
  window.PlazaPageMenu = Object.freeze({version: '20261023-page-menu-1', attach});
})();
