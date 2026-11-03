/* Mount inside the existing guide boot. Original tables keep all semantics. */
(() => { const boot=()=>{
  const page = document.querySelector('body.plaza-object-kislovodsk main');
  if (!page || page.dataset.tableHeadsReady === 'true') return;
  page.dataset.tableHeadsReady = 'true';

  const header = document.querySelector('.site-header');
  const sectionNav = page.querySelector('.al-section-nav,.ml-anchors');
  const entries = Array.from(page.querySelectorAll('table'))
    .filter(table => table.tHead && table.tHead.rows.length && Array.from(table.tBodies).reduce((n, body) => n + body.rows.length, 0) > 0)
    .map(table => ({
      table,
      head: table.tHead,
      viewport: table.closest('.pg-table-scroll') || table.parentElement,
      layer: null,
      copy: null,
      height: 0,
      dirty: true
    }));
  if (!entries.length) return;

  const cellStyles = [
    'background-color', 'background-image', 'color', 'font-family', 'font-size',
    'font-style', 'font-weight', 'font-variant-numeric', 'line-height',
    'letter-spacing', 'text-align', 'text-transform', 'text-indent',
    'white-space', 'word-break', 'overflow-wrap', 'vertical-align',
    'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
    'border-top', 'border-right', 'border-bottom', 'border-left',
    'border-radius', 'box-shadow'
  ];
  let frame = 0;
  let followUntil = 0;

  const schedule = (geometry = false, follow = false) => {
    if (geometry) entries.forEach(entry => { entry.dirty = true; });
    // Header transforms can finish after the last scroll event.
    if (follow) followUntil = Math.max(followUntil, performance.now() + 450);
    if (!frame) frame = PlazaMotion.frame(update);
  };

  const build = entry => {
    const { table, head } = entry;
    const headRect = head.getBoundingClientRect();
    const layer = entry.layer || document.createElement('div');
    if (!entry.layer) {
      layer.className = 'pg-sticky-head';
      if(table.closest('.plaza-room-comparison'))layer.classList.add('comparison-sticky-head');
      layer.setAttribute('aria-hidden', 'true');
      layer.setAttribute('inert', '');
      layer.hidden = true;
      document.body.append(layer);
      entry.layer = layer;
    }

    const copy = table.cloneNode(false);
    const copyHead = head.cloneNode(true);
    copy.append(copyHead);
    [copy, ...copy.querySelectorAll('*')].forEach(node => {
      node.removeAttribute('id');
      node.removeAttribute('name');
      node.removeAttribute('aria-labelledby');
      node.removeAttribute('aria-describedby');
      if (node.matches('a, button, input, select, textarea, [tabindex], [contenteditable]')) {
        node.setAttribute('tabindex', '-1');
        node.removeAttribute('contenteditable');
      }
    });

    // Explicit cell rectangles preserve arbitrary colspan and rowspan geometry.
    // No separate table-layout algorithm can diverge from the source table.
    Object.assign(copy.style, {
      display: 'block', position: 'absolute', margin: '0', padding: '0',
      border: '0', borderSpacing: '0', minWidth: '0', maxWidth: 'none',
      width: `${headRect.width}px`, height: `${headRect.height}px`,
      boxSizing: 'border-box', transform: 'none'
    });
    Object.assign(copyHead.style, {
      display: 'block', position: 'relative', margin: '0', padding: '0',
      border: '0', width: '100%', height: `${headRect.height}px`
    });
    Array.from(copyHead.rows).forEach(row => { row.style.display = 'contents'; });
    const originalCells = Array.from(head.querySelectorAll('th, td'));
    Array.from(copyHead.querySelectorAll('th, td')).forEach((cell, index) => {
      const original = originalCells[index];
      const rect = original.getBoundingClientRect();
      const computed = getComputedStyle(original);
      cellStyles.forEach(property => cell.style.setProperty(property, computed.getPropertyValue(property)));
      const content = document.createElement('div');
      content.append(...cell.childNodes);
      content.style.cssText = 'display:block;width:100%;min-width:0;';
      cell.append(content);
      Object.assign(cell.style, {
        display: 'flex', flexDirection: 'column', position: 'absolute', boxSizing: 'border-box',
        justifyContent: computed.verticalAlign === 'middle' ? 'center'
          : computed.verticalAlign === 'bottom' ? 'flex-end' : 'flex-start',
        margin: '0', minWidth: '0', maxWidth: 'none', transform: 'none',
        left: `${rect.left - headRect.left}px`, top: `${rect.top - headRect.top}px`,
        width: `${rect.width}px`, height: `${rect.height}px`
      });
    });
    if(copyHead.querySelector('.comparison-places-note abbr'))layer.inert=false;
    layer.replaceChildren(copy);
    entry.copy = copy;
    entry.height = headRect.height;
    entry.dirty = false;
  };

  function update() {
    frame = 0;
    const headerRect = header?.getBoundingClientRect();
    const headerBottom = headerRect && headerRect.top <= 1 && headerRect.bottom > 0
      ? Math.max(0, headerRect.bottom) : 0;
    const navigationTop = Math.max(headerBottom, sectionNav?.getBoundingClientRect().bottom || 0);

    entries.forEach(entry => {
      const tableRect = entry.table.getBoundingClientRect();
      const headRect = entry.head.getBoundingClientRect();
      const viewportRect = entry.viewport.getBoundingClientRect();
      const internallyScrolled = entry.viewport.scrollHeight > entry.viewport.clientHeight + 2 && getComputedStyle(entry.viewport).overflowY !== 'visible';
      const top = Math.max(navigationTop, internallyScrolled ? viewportRect.top + entry.viewport.clientTop : 0);
      const left = Math.max(0, viewportRect.left + entry.viewport.clientLeft);
      const right = Math.min(innerWidth,
        viewportRect.left + entry.viewport.clientLeft + entry.viewport.clientWidth);
      const bottom = Math.min(tableRect.bottom, viewportRect.bottom);
      const active = headRect.width > 0 && headRect.height > 0
        && headRect.top < top && bottom > top && right > left;
      if (!active) {
        if (entry.layer) entry.layer.hidden = true;
        return;
      }

      if (entry.dirty || !entry.copy) build(entry);
      const height = Math.min(entry.height, bottom - top);
      Object.assign(entry.layer.style, {
        left: `${left}px`, top: `${top}px`, width: `${right - left}px`,
        height: `${Math.max(0, height)}px`
      });
      Object.assign(entry.copy.style, {
        left: `${headRect.left - left}px`,
        top: `${Math.min(0, bottom - top - entry.height)}px`
      });
      entry.layer.toggleAttribute('data-first-column-sticky', entry.viewport.classList.contains('psk-frozen-column'));
      if(entry.table.closest('.plaza-room-comparison')){const cell=entry.copy.querySelector('thead tr>:first-child');if(cell)cell.style.transform=innerWidth<=700?'translateX('+entry.viewport.scrollLeft+'px)':'';}
      entry.layer.hidden = false;
    });
    if (performance.now() < followUntil) frame = PlazaMotion.frame(update);
  }

  PlazaRuntime.on(window,'scroll',() => schedule(false, true),{ passive: true });
  PlazaRuntime.on(window,'resize',() => schedule(true, true),{ passive: true });
  PlazaRuntime.on(window,'afterprint',() => schedule(true));
  PlazaRuntime.on(window.visualViewport,'resize',() => schedule(true, true),{ passive: true });
  PlazaRuntime.on(window.visualViewport,'scroll',() => schedule(false, true),{ passive: true });
  entries.forEach(entry => {
    PlazaRuntime.on(entry.viewport,'scroll',() => schedule(),{ passive: true });
    new MutationObserver(() => {
      entry.dirty = true;
      schedule();
    }).observe(entry.table, {
      subtree: true, childList: true, characterData: true, attributes: true,
      attributeFilter: ['hidden', 'class', 'style', 'colspan', 'rowspan']
    });
  });
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(() => schedule(true));
    entries.forEach(entry => {
      observer.observe(entry.table);
      observer.observe(entry.head);
      observer.observe(entry.viewport);
    });
    if (header) observer.observe(header);
    if (sectionNav) observer.observe(sectionNav);
  }
  const themeObserver = new MutationObserver(() => schedule(true, true));
  [document.documentElement, document.body].forEach(element => {
    themeObserver.observe(element, {
      attributes: true, attributeFilter: ['class', 'style', 'data-theme']
    });
  });
  if (header) {
    new MutationObserver(() => schedule(false, true)).observe(header, {
      attributes: true, attributeFilter: ['class', 'style', 'hidden']
    });
    PlazaRuntime.on(header,'transitionrun',event => {
      if (event.target === header) schedule(false, true);
    });
    PlazaRuntime.on(header,'transitionend',event => {
      if (event.target === header) schedule(false, true);
    });
  }
  document.fonts?.ready.then(() => schedule(true));
  schedule(true);
};if(document.readyState==='loading')PlazaRuntime.on(document,'DOMContentLoaded',boot,{once:true});else boot();})();
