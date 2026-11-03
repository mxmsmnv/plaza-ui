/* Addressed data adapters. PLAZA owns sliders, disclosure and reveal engines. */
(() => {
  'use strict';

  const boot = () => {
    const page = document.querySelector('body.plaza-psg-guide .pg-page');
    if (!page || page.dataset.guideReady === 'true') return;
    page.dataset.guideReady = 'true';
    let printState = [];
    PlazaRuntime.on(window,'beforeprint',() => {
      printState = Array.from(page.querySelectorAll('details')).map(detail => [detail, detail.open]);
      printState.forEach(([detail]) => { detail.open = true; });
    });
    PlazaRuntime.on(window,'afterprint',() => { printState.forEach(([detail, open]) => { detail.open = open; }); });
    const ui = window.PlazaUI;
    const normalize = value => ui?.normalizeText
      ? ui.normalizeText(value, true)
      : String(value).toLocaleLowerCase('ru').replaceAll('ё', 'е').replace(/\s+/g, ' ').trim();

    page.querySelectorAll('[data-document-list]').forEach(list => {
      const host = list.closest('.pg-documents');
      const input = host?.querySelector('[data-document-search]');
      const status = host?.querySelector('[data-document-status]');
      if (!input || !status) return;
      const entries = Array.from(list.querySelectorAll(':scope > details[data-document-entry]'))
        .map(row => ({ row, text: normalize(row.textContent) }));
      const filter = () => {
        const terms = normalize(input.value).split(' ').filter(Boolean);
        let found = 0;
        entries.forEach(entry => {
          const matches = terms.every(term => entry.text.includes(term));
          entry.row.hidden = !matches;
          if (matches) found += 1;
        });
        status.textContent = found
          ? `Найдено ${found} из ${entries.length}`
          : 'Ничего не найдено. Измените запрос или очистите поле поиска.';
      };
      PlazaRuntime.on(input,'input',filter);
      PlazaRuntime.on(input,'search',filter);
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
          const viewport = host.querySelector('.pg-table-scroll');
          if (viewport) viewport.scrollTop = 0;
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
        bodySelector: 'body.plaza-psg-guide',
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
