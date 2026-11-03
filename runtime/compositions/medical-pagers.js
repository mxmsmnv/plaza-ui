/* Exact original medical table pager, isolated from unrelated page behavior. */
(()=>{'use strict';const boot=()=>{const page=document.querySelector('.psk-medical');if(!page)return;const $=s=>page.querySelector(s),$$=s=>Array.from(page.querySelectorAll(s));const normalize=text=>window.PlazaUI.normalizeText(text,true);
    const mountTablePager = (inputSelector, rowSelector, moreSelector, statusSelector, accept = () => true) => {
      const input = $(inputSelector), more = $(moreSelector), status = $(statusSelector);
      if (!input || !more || !status) return {reset: () => {}};
      const items = $$(rowSelector).map(row => ({row, text: normalize(row.textContent + ' ' + (row.dataset.search || ''))}));
      let shown = 10;
      const render = () => {
        const terms = normalize(input.value).split(' ').filter(Boolean);
        const matched = items.filter(item => accept(item.row) && terms.every(term => item.text.includes(term)));
        items.forEach(item => { item.row.hidden = true; });
        matched.slice(0, shown).forEach(item => { item.row.hidden = false; });
        more.hidden = matched.length <= shown;
        status.textContent = matched.length ? `Показано ${Math.min(shown, matched.length)} из ${matched.length}` : 'Ничего не найдено. Измените запрос.';
        if (inputSelector === '#q') $('[data-med-empty]').hidden = matched.length > 0;
      };
      const reset = () => { shown = 10; render(); };
      PlazaRuntime.on(input,'input',reset);
      PlazaRuntime.on(input,'search',reset);
      PlazaRuntime.on(more,'click',() => { shown += 10; render(); });
      render();
      return {reset};
    };
    let category = 'Все';
    const pricePager = mountTablePager('#q', '[data-med-price]', '#more', '#medical-price-status', row => category === 'Все' || row.dataset.category === category);
    PlazaRuntime.on($('#chips'),'click',event => {
      const button = event.target.closest('[data-med-category]');
      if (!button) return;
      category = button.dataset.medCategory;
      $$('[data-med-category]').forEach(other => other.setAttribute('aria-pressed', String(other === button)));
      pricePager.reset();
    });
    mountTablePager('#qd', '[data-med-doctor]', '[data-med-more="doctor"]', '#medical-doctor-status');
    mountTablePager('#qs', '[data-med-schedule]', '[data-med-more="schedule"]', '#medical-schedule-status');


};if(document.readyState==='loading')PlazaRuntime.on(document,'DOMContentLoaded',boot,{once:true});else boot();})();
