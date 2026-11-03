/* One shared card spotlight: property grids, rooms, network panels and native booking frames. */
(() => {
  'use strict';
  const root = document.documentElement;
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const touch = matchMedia('(any-pointer: coarse)');

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const propertyMaterials = document.body.matches('.plaza-object-kislovodsk,.plaza-object-zheleznovodsk');
  const isMaterial = card => propertyMaterials && card.matches('.card,.facts > div,.visit-grid > article,.wellness-search-surface,[data-plaza-card-material-opt-in]');
  const groups = [];
  const assigned = new Set();
  const addGroup = (host, cards) => {
    cards = cards.filter(card => !assigned.has(card));
    if (!cards.length) return;
    host.setAttribute('data-plaza-spotlight-owner', '');
    cards.forEach(card => assigned.add(card));
    const existing = groups.find(group => group.host === host);
    if (existing) existing.cards.push(...cards);
    else groups.push({host, cards});
  };
  // Kislovodsk: the visible card, not the entire row, owns Stripe.
  // Other property profiles retain their existing group behaviour.
  const addCardGroup = (host, cards) => {
    if (document.body.matches('.plaza-object-kislovodsk')) cards.forEach(card => addGroup(card, [card]));
    else addGroup(host, cards);
  };
  document.querySelectorAll('main .facts, main .swipe-rail, main .visit-grid, .resort-amenities, .wellness-amenities, .pn-booking-row').forEach(host => {
    const selector = host.matches('.facts') ? 'div' : host.matches('.pn-booking-row') ? '.plaza-booking-panel, .pn-social-panel' : '.card, article';
    addCardGroup(host, [...host.children].filter(card => card.matches(selector)));
  });
  document.querySelectorAll('.wellness-search-surface, .plaza-booking-panel, .pn-social-panel').forEach(card => addGroup(card, [card]));
  // Reuse the card light on Zheleznovodsk's three room filters; info controls are not cards.
  document.querySelectorAll('body.plaza-object-zheleznovodsk .comparison-filters').forEach(host => {
    addGroup(host, [...host.querySelectorAll('[data-room-filter]')]);
  });
  // Semantic card groups and native tables share this engine in both themes.
  // Never infer card groups from arbitrary three-column layout or photo mosaics.
  const surfaceGroups = 'main .inclusions, main .facts, main .visit-grid, main .resort-amenities, main .wellness-amenities, main .detail-facts, main .pb-principles, main .pb-trust, main .resort-directory, main .wellness-directory, main .resort-directory-grid, main .wellness-directory-grid, main .room-groups, main .resort-book-staff-grid, main [data-plaza-card-group]';
  const surfaceCandidates = 'body.plaza-shell main .card, body.plaza-shell main [data-plaza-card], body.plaza-shell .plaza-booking-panel, body.plaza-shell .pn-social-panel, body.plaza-shell .wellness-search-surface, body.plaza-shell footer[data-plaza-footer=edges]';
  const mountSurfaces = () => {
    const first = groups.length;
    document.querySelectorAll(surfaceGroups).forEach(host => {
      host.setAttribute('data-plaza-shared-group', '');
      const cards = [...host.children].filter(card => card.matches('article,div,a,section,figure,li'));
      cards.forEach(card => card.setAttribute('data-plaza-shared-surface', ''));
      addCardGroup(host,cards);
    });
    // Every standard card opts in by its component class, including future insertions.
    document.querySelectorAll(surfaceCandidates).forEach(card => {
      card.setAttribute('data-plaza-shared-surface', '');
      if (!assigned.has(card)) addGroup(card,[card]);
    });
    // The network comparison is a div grid: each complete row owns the shared light.
    document.querySelectorAll('body.plaza-network #choice .pb-comparison > .pb-compare-row').forEach(row => {
      row.setAttribute('data-plaza-shared-surface', '');
      row.setAttribute('data-plaza-table-row', '');
      addGroup(row, [row]);
    });
    document.querySelectorAll('body.plaza-shell table').forEach(table => {
      table.setAttribute('data-plaza-table', '');
      const cells = [...table.querySelectorAll('th,td')].filter(cell => cell.closest('table') === table);
      cells.forEach(cell => cell.setAttribute('data-plaza-table-cell', ''));
      if (table.matches('body:is(.plaza-object-kislovodsk,.plaza-object-zheleznovodsk) .comparison-table')) {
        table.setAttribute('data-plaza-table-rows', '');
        table.querySelectorAll('tr').forEach(row => {
          if (row.closest('table') !== table) return;
          row.setAttribute('data-plaza-table-row', '');
          addGroup(row, cells.filter(cell => cell.parentElement === row));
        });
      } else addGroup(table,cells);
    });
    return groups.slice(first);
  };
  mountSurfaces();
  // Navigation rows opt into the same light engine, in both themes.
  const mountNavigation = () => {
    const first = groups.length;
    document.querySelectorAll('[data-plaza-navigation-row]').forEach(card=>addGroup(card,[card]));
    return groups.slice(first);
  };
  mountNavigation();
  // Accordion membership follows the component, never its URL or page template.
  const accordionRows = new WeakSet();
  const measureAccordion = row => {
    if (!row.isConnected) return;
    const item = row.parentElement.getBoundingClientRect(), rect = row.getBoundingClientRect();
    row.style.setProperty('--plaza-accordion-light-top', `${(item.top - rect.top).toFixed(1)}px`);
    row.style.setProperty('--plaza-accordion-light-height', `${Math.max(0,item.height - 1).toFixed(1)}px`);
  };
  const accordionResize = new ResizeObserver(entries => {
    for (const {target} of entries) {
      const row = target.hasAttribute('data-plaza-accordion-trigger') ? target : target.querySelector(':scope > [data-plaza-accordion-trigger]');
      if (row) measureAccordion(row);
    }
  });
  const mountAccordions = () => {
    const added = [];
    document.querySelectorAll('body.plaza-shell details > summary').forEach(row => {
      if ((row.closest('.site-header') || row.parentElement.hasAttribute('data-plaza-mobile-disclosure')) || accordionRows.has(row)) return;
      accordionRows.add(row);
      row.setAttribute('data-plaza-accordion-trigger', '');
      row.parentElement.setAttribute('data-plaza-accordion-item', '');
      const first = groups.length;
      addGroup(row.parentElement, [row]);
      added.push(...groups.slice(first));
      accordionResize.observe(row.parentElement);accordionResize.observe(row);
      measureAccordion(row);
    });
    return added;
  };
  mountAccordions();
  if (root.dataset.plazaSpotlightMounted) return;
  root.dataset.plazaSpotlightMounted = 'true';
  let enabled = false, active = null, point = null, frame = 0;
  const clear = () => {
    active?.host.removeAttribute('data-spotlight-active');
    active = point = null;
    PlazaMotion.cancelFrame(frame);
    frame = 0;
  };
  const paint = () => {
    frame = 0;
    if (!active || !point || !enabled || reduced.matches || document.hidden) return;
    const bounds = active.host.getBoundingClientRect();
    if (point.x < bounds.left || point.x > bounds.right || point.y < bounds.top || point.y > bounds.bottom) {
      clear(); return;
    }
    const positions = active.cards.map(card => ({card, rect:card.getBoundingClientRect()}));
    for (const {card, rect} of positions) {
      if (rect.right < bounds.left || rect.left > bounds.right || rect.bottom < 0 || rect.top > innerHeight) continue;
      card.style.setProperty('--plaza-card-light-x', `${(point.x - rect.left).toFixed(1)}px`);
      card.style.setProperty('--plaza-card-light-y', `${(point.y - rect.top).toFixed(1)}px`);
      if (card.hasAttribute('data-plaza-accordion-trigger')) {
        const item = card.parentElement.getBoundingClientRect();
        card.style.setProperty('--plaza-accordion-light-top', `${(item.top - rect.top).toFixed(1)}px`);
        card.style.setProperty('--plaza-accordion-light-height', `${(item.height - 1).toFixed(1)}px`);
        card.style.setProperty('--plaza-accordion-light-y', `${(point.y - item.top).toFixed(1)}px`);
      }
    }
    active.host.setAttribute('data-spotlight-active', 'true');
  };
  const queue = () => { if (!frame && active && !reduced.matches) frame = PlazaMotion.frame(paint); };
  const move = (group, event, offsetFrame) => {
    if (!enabled || !['mouse','touch','pen'].includes(event.pointerType)) return;

    if (reduced.matches) {if (active !== group && (document.body.matches('.plaza-object-kislovodsk') || group.host.hasAttribute('data-plaza-table-row'))) clear();active = group;group.host.setAttribute('data-spotlight-active','true');return;}
    if (active !== group) clear();
    active = group;
    if (offsetFrame) {
      const rect = offsetFrame.getBoundingClientRect();
      const doc = offsetFrame.contentDocument;
      const scaleX = rect.width / (doc.documentElement.clientWidth || rect.width);
      const scaleY = rect.height / (doc.documentElement.clientHeight || rect.height);
      point = {x:rect.left + event.clientX * scaleX, y:rect.top + event.clientY * scaleY};
    } else point = {x:event.clientX, y:event.clientY};
    queue();
  };
  // TravelLine's existing about:blank form is same-origin. Observe its real mouse
  // events without an intercepting overlay, provider edits or messages across origins.
  const frameDocs = new WeakMap();
  const frameWatches = new WeakSet();
  const attachFrame = (element, group, card) => {
    const bind = () => {
      try {
        const doc = element.contentDocument;
        if (!doc || frameDocs.get(element) === doc) return;
        frameDocs.set(element, doc);
        let keyboard = true;
        PlazaRuntime.on(doc,'pointerdown',event => { keyboard = false; card.removeAttribute('data-spotlight-frame-focus'); move(group,event,element); },{passive:true});
        PlazaRuntime.on(doc,'pointerup',event => {if(event.pointerType!=='mouse')move(group,event,element);},{passive:true});
        PlazaRuntime.on(doc,'keydown',() => { keyboard = true; });
        PlazaRuntime.on(doc,'pointermove',event => move(group, event, element),{passive:true});
        PlazaRuntime.on(doc,'pointerleave',event => { if (event.pointerType === 'mouse' && active === group) clear(); },{passive:true});
        PlazaRuntime.on(doc,'pointercancel',clear,{passive:true});
        PlazaRuntime.on(doc,'focusin',() => { if (enabled && keyboard) card.setAttribute('data-spotlight-frame-focus', ''); });
        PlazaRuntime.on(doc,'focusout',event => { if (!event.relatedTarget || event.relatedTarget === doc.body) card.removeAttribute('data-spotlight-frame-focus'); });
      } catch { /* A future isolated provider frame retains its native behaviour. */ }
    };
    bind();
    if (frameWatches.has(element)) return;
    frameWatches.add(element);
    PlazaRuntime.on(element,'load',bind);
  };
  const bindGroup = group => {
    PlazaRuntime.on(group.host,'pointerdown',event => {if(event.pointerType!=='mouse' && event.target.closest('[data-plaza-spotlight-owner]')===group.host)move(group,event);},{passive:true});
    PlazaRuntime.on(group.host,'pointerup',event => {if(event.pointerType!=='mouse' && event.target.closest('[data-plaza-spotlight-owner]')===group.host)move(group,event);},{passive:true});
    PlazaRuntime.on(group.host,'pointermove',event => {
      // A containing card or accordion must not steal a nested accordion's light.
      const item = event.target.closest('[data-plaza-spotlight-owner]');
      if (item && item !== group.host) return;
      move(group, event);
    },{passive:true});
    PlazaRuntime.on(group.host,'pointerleave',event => { if (event.pointerType === 'mouse' && active === group) clear(); },{passive:true});
    PlazaRuntime.on(group.host,'pointercancel',clear,{passive:true});
    for (const card of group.cards) {
      if (!card.matches('.wellness-search-surface')) continue;
      const connect = () => card.querySelectorAll('iframe').forEach(element => attachFrame(element, group, card));
      new MutationObserver(records => {
        if (records.some(record => [...record.addedNodes].some(node => node.nodeType === 1 && (node.matches('iframe') || node.querySelector('iframe'))))) connect();
      }).observe(card, {childList:true, subtree:true});
      connect();
    }
  };
  groups.forEach(bindGroup);
  const sync = () => {
    clear();
    // Every registered spotlight component works in both themes.
    enabled = fine.matches || touch.matches;
    for (const {host, cards} of groups) {
      const groupEnabled = enabled;
      host.toggleAttribute('data-plaza-spotlight-group', groupEnabled);
      for (const card of cards) {
        if (!card.matches('[data-plaza-accordion-trigger],[data-plaza-navigation-row],[data-plaza-table-cell]')) card.setAttribute('data-plaza-shared-surface', '');
        card.toggleAttribute('data-plaza-card-material', isMaterial(card));
        card.querySelectorAll(':scope > .plaza-card-border-light, :scope > .plaza-card-surface-light').forEach(light => light.remove());
        if (card.hasAttribute('data-plaza-table-cell')) continue; // Cell backgrounds preserve native table layout.
        if (groupEnabled) {
          card.setAttribute('data-plaza-spotlight', '');
          const light = document.createElement('span');
          light.className = 'plaza-card-border-light';
          light.setAttribute('aria-hidden', 'true');
          card.append(light);
          if (isMaterial(card) || card.hasAttribute('data-plaza-shared-surface') || !card.matches('.card, .facts > div, .visit-grid > article, .pb-principles > article, .wellness-search-surface')) {
            const surface = document.createElement('span');
            surface.className = 'plaza-card-surface-light';
            surface.setAttribute('aria-hidden', 'true');
            card.append(surface);
          }
        } else {
          card.removeAttribute('data-plaza-spotlight');
          card.removeAttribute('data-spotlight-frame-focus');
          card.style.removeProperty('--plaza-card-light-x');
          card.style.removeProperty('--plaza-card-light-y');
          card.querySelectorAll(':scope > .plaza-card-border-light, :scope > .plaza-card-surface-light').forEach(light => light.remove());
        }
      }
    }
  };
  // Mount newly inserted components without rescanning on pointer movement.
  new MutationObserver(records => {
    const relevant = records.some(record => [...record.addedNodes].some(node =>
      node.nodeType === 1 && !node.matches('.plaza-card-border-light,.plaza-card-surface-light') &&
      (node.matches('details,summary,table,tr,td,th,[data-plaza-navigation-row],'+surfaceGroups+','+surfaceCandidates) || node.querySelector('details,summary,table,[data-plaza-navigation-row],'+surfaceGroups+','+surfaceCandidates) || node.parentElement?.matches(surfaceGroups))));
    const rebuiltTrigger = records.some(record => record.target.nodeType === 1 &&
      record.target.matches('[data-plaza-accordion-trigger]') && [...record.addedNodes].some(node =>
        node.nodeType === 3 || (node.nodeType === 1 && !node.matches('.plaza-card-border-light,.plaza-card-surface-light'))));
    if (!relevant && !rebuiltTrigger) return;
    const added = [...mountSurfaces(), ...mountAccordions(), ...mountNavigation()];
    if (added.length) { added.forEach(bindGroup); window.PlazaUI?.mountDetails?.(); }
    sync();
  }).observe(document.body,{childList:true,subtree:true});
  new MutationObserver(sync).observe(root, {attributes:true, attributeFilter:['data-theme']});
  PlazaRuntime.on(fine,'change',sync);
  PlazaRuntime.on(touch,'change',sync);
  PlazaRuntime.on(reduced,'change',clear);
  PlazaRuntime.on(document,'scroll',queue,{passive:true, capture:true});
  PlazaRuntime.on(window,'resize',clear,{passive:true});
  PlazaRuntime.on(window,'blur',clear);
  PlazaRuntime.on(document,'visibilitychange',clear);
  PlazaRuntime.on(window,'pagehide',clear);
  sync();
})();
