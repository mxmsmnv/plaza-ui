/* Addressed data adapters. PLAZA owns sliders, disclosure and reveal engines. */
(() => {
  'use strict';

  const boot = () => {
    const page = document.querySelector('body.plaza-psk-guide .pg-page, body.plaza-psk-inner-tables main');
    if (!page || page.dataset.guideReady === 'true') return;
    page.dataset.guideReady = 'true';
    const ui = window.PlazaUI;
    const packing = page.querySelector('.pg-packing-toggle');
    if (packing) {
      const after = packing.querySelector('.pg-packing-after img');
      const ready = () => {
        if (!after.naturalWidth) return;
        packing.classList.add('is-ready');
        packing.disabled = false;
      };
      if (after.complete) ready();
      else PlazaRuntime.on(after,'load',ready,{once:true});
      PlazaRuntime.on(packing,'click',() => {
        const packed = packing.getAttribute('aria-pressed') !== 'true';
        packing.setAttribute('aria-pressed', String(packed));
        packing.setAttribute('aria-label', packed ? 'Вернуть вещи перед сборкой' : 'Собрать чемодан');
      });
    }
    // Sticky only while the adjacent image is taller and the copy fits the screen.
    const heroCopy = page.querySelector('.pg-hero-copy');
    const heroPhoto = page.querySelector('.pg-hero-photo');
    if (heroCopy && heroPhoto) {
      const placeCopy = () => {
        const top = (document.querySelector('.site-header')?.offsetHeight || 77) + 16;
        heroCopy.style.setProperty('--pg-copy-top', `${top}px`);
        heroCopy.classList.toggle('pg-copy-sticky', innerWidth >= 1051 && heroCopy.offsetHeight < innerHeight - top - 16 && heroPhoto.offsetHeight > heroCopy.offsetHeight);
      };
      const observer = new ResizeObserver(placeCopy);
      [heroCopy, heroPhoto].forEach(node => observer.observe(node));
      PlazaRuntime.on(window,'resize',placeCopy,{passive:true});
      placeCopy();
    }

    const normalize = value => ui?.normalizeText
      ? ui.normalizeText(value, true)
      : String(value).toLocaleLowerCase('ru').replaceAll('ё', 'е').replace(/\s+/g, ' ').trim();

    page.querySelectorAll('.pg-documents').forEach(host => {
      const input=host.querySelector('[data-document-search]');
      const status=host.querySelector('[data-document-status]');
      const groups=host.querySelector('[data-document-tabs]');
      if(!input || !status || !groups) return;
      const entries=Array.from(host.querySelectorAll('details[data-document-entry]')).map(row=>({row,text:normalize(row.textContent)}));
      const filter=()=>{
        const active=groups.querySelector('[role="tab"][aria-selected="true"]');
        const panel=active && document.getElementById(active.getAttribute('aria-controls'));
        const terms=normalize(input.value).split(' ').filter(Boolean);
        const current=entries.filter(entry=>panel?.contains(entry.row));
        let found=0;
        current.forEach(entry=>{const match=terms.every(term=>entry.text.includes(term));entry.row.hidden=!match;if(match)found++;});
        status.textContent=current.length ? (found ? `Найдено ${found} из ${current.length}` : 'Ничего не найдено в этом разделе.') : '';
      };
      PlazaRuntime.on(input,'input',filter);PlazaRuntime.on(input,'search',filter);
      groups.querySelectorAll('[role="tab"]').forEach(tab=>{PlazaRuntime.on(tab,'click',()=>setTimeout(filter,0));PlazaRuntime.on(tab,'keydown',()=>setTimeout(filter,0));});
      PlazaRuntime.on(window,'load',()=>{const target=document.getElementById(location.hash.slice(1));const panel=target?.closest('[role="tabpanel"]');const tab=panel&&groups.querySelector(`[aria-controls="${panel.id}"]`);if(tab)tab.click();filter();},{once:true});
      filter();
    });

    if (ui?.createDataTable) {
      page.querySelectorAll('[data-guide-table]').forEach(host => {
        const table = host.querySelector('table');
        const input = host.querySelector('input[type="search"]');
        const previous = host.querySelector('[data-table-previous]');
        const next = host.querySelector('[data-table-next]');
        const status = host.querySelector('[data-table-status]');
        if (!table || !input || !previous || !next || !status) return;
        const records = Array.from(table.rows)
          .filter(row => !row.closest('thead, tfoot'))
          .map(row => ({ row, text: normalize(row.textContent) }));
        let terms = [];
        const adapter = ui.createDataTable(records, {
          pageSize: 20,
          previous,
          next,
          status,
          match: record => terms.every(term => record.text.includes(term)),
          format: ({ from, to, total }) => {
            if (!total) return 'Ничего не найдено. Измените запрос.';
            const range = `${from}–${to} из ${total}`;
            return terms.length && total !== records.length
              ? `${range} · всего ${records.length}`
              : range;
          }
        });
        const search = () => {
          terms = normalize(input.value).split(' ').filter(Boolean);
          adapter.reset();
          const viewport = host.querySelector('.pg-table-scroll');
          if (viewport) viewport.scrollTop = 0;
        };
        const step = delta => {
          adapter.step(delta);
          host.scrollIntoView({block:'start', behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
        };
        PlazaRuntime.on(previous,'click',() => step(-1));
        PlazaRuntime.on(next,'click',() => step(1));
        PlazaRuntime.on(input,'input',search);
        PlazaRuntime.on(input,'search',search);
        search();
      });
    }




    if (ui?.mountSwipeRail) {
      page.querySelectorAll('.pg-rail').forEach(rail => {
        const cards = Array.from(rail.querySelectorAll(':scope > .pg-feature'));
        const title = rail.closest('.pg-discover')?.querySelector('h2')?.textContent.trim();
        ui.mountSwipeRail(rail, cards, {
          host: rail.closest('.carousel'),
          label: title || 'Разделы санатория',
          previous: 'Предыдущая карточка',
          next: 'Следующая карточка'
        });
      });
    }
    ui?.mountDetails?.();
    ui?.mountTableCaptions?.();
    const openLinkedDocument = () => {
      const id = decodeURIComponent(location.hash.slice(1));
      const entry = id ? document.getElementById(id) : null;
      if (entry?.matches('details[data-document-entry]') && !entry.open) ui?.changeDetails?.(entry, true);
    };
    openLinkedDocument();
    PlazaRuntime.on(window,'hashchange',openLinkedDocument);

    if (window.PlazaRevealEngine) {
      window.PlazaRevealEngine.mount({
        bodySelector: 'body.plaza-psk-guide',
        footerTriggerSelector: '',
        collect({ select, addGroup }) {
          select('.pg-page .pg-section').forEach(section => {
            const children = Array.from(section.children)
              .filter(child => child.matches('.pg-section-heading, .pg-section-body'));
            addGroup(section, children, 'soft', 80);
          });
        }
      });
    }
  };

  if (document.readyState === 'loading') PlazaRuntime.on(document,'DOMContentLoaded',boot,{ once: true });
  else boot();
})();
