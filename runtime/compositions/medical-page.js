/* Page 2615 adapters. Shared PlazaUI owns carousels and shared Stripe owns light. */

(() => {

  'use strict';

  const boot = () => {

    const page = document.querySelector('.psk-medical');

    if (!page || page.dataset.medicalReady) return;

    page.dataset.medicalReady = 'true';

    const $ = s => page.querySelector(s);

    const $$ = s => Array.from(page.querySelectorAll(s));

    const normalize = text => window.PlazaUI.normalizeText(text, true);



    $$('[data-med-rail]').forEach(rail => {

      window.PlazaUI.mountSwipeRail(rail, Array.from(rail.children), {

        label: rail.closest('section')?.querySelector('h2')?.textContent || 'Медицинские услуги'

      });

    });



    // One ten-row pager for the price, doctor list and reception schedule.
    const mountTablePager = (inputSelector, rowSelector, moreSelector, statusSelector, accept = () => true) => {
      const input = $(inputSelector), more = $(moreSelector), status = $(statusSelector);
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

    PlazaRuntime.on(page,'pointerover',event => { if (event.pointerType === 'mouse') event.target.closest('[data-med-goal]')?.classList.remove('is-touch'); });

    PlazaRuntime.on(page,'click',event => {

      const goal = event.target.closest('[data-med-goal]');
      const detail = event.target.closest('[data-med-info]');
      if (goal && (event.pointerType === 'touch' || event.pointerType === 'pen' || !matchMedia('(hover:hover) and (pointer:fine)').matches)) goal.classList.add('is-touch');
      if (goal && !detail && (event.target.closest('.ml-goal-toggle') || event.pointerType === 'touch' || event.pointerType === 'pen' || !matchMedia('(hover:hover) and (pointer:fine)').matches)) {
        event.preventDefault();
        const healthy = goal.classList.toggle('is-healthy');
        const toggle = goal.querySelector('.ml-goal-toggle');
        toggle.setAttribute('aria-pressed', String(healthy));
        toggle.setAttribute('aria-label', (healthy ? 'Показать исходное состояние: ' : 'Показать здоровое состояние: ') + goal.querySelector('h3').textContent);
        return;
      }
    });

    const nav = $('.ml-anchors');

    const links = Array.from(nav.querySelectorAll('a'));
    const sections = ['goal','tickets','how','doctors','prices'].map(id => $('#' + id));

    const header = document.querySelector('.site-header');

    let pending = false;

    const updateNavigation = () => {

      pending = false;

      const top = Math.max(0, header?.getBoundingClientRect().bottom || 0);

      page.style.setProperty('--ml-anchor-top', `${top}px`);

      let active = null;

      sections.forEach(section => {

        if (section.getBoundingClientRect().top <= top + nav.offsetHeight + 80) active = section.id;

      });

      links.forEach(link => {

        const selected = link.hash === '#' + active;

        link.classList.toggle('ml-on', selected);

        if (selected) link.setAttribute('aria-current','location');

        else link.removeAttribute('aria-current');

      });
      nav.querySelector('#anchors').dispatchEvent(new Event('plaza:segment-change'));

    };

    PlazaRuntime.on(window,'scroll',() => {

      if (!pending) { pending = true; PlazaMotion.frame(updateNavigation); }

    },{passive:true});

    PlazaRuntime.on(window,'resize',updateNavigation,{passive:true});

    updateNavigation();

  };

  if (document.readyState === 'loading') PlazaRuntime.on(document,'DOMContentLoaded',boot,{once:true});

  else boot();

})();



/* Page2615 theme-state adapter, factual odometers and shared paged controls. */
(() => {
 const boot=()=>{
  const page=document.querySelector('.psk-medical');if(!page)return;
  const desktop=matchMedia('(hover:hover) and (pointer:fine)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const loadStates=()=>{
   const dark=document.documentElement.dataset.theme==='dark';
   page.querySelectorAll('img[data-med-state]').forEach(img=>{
    const state=img.dataset.medState;
    if((state.startsWith('night')&&!dark)||(state.startsWith('day')&&dark)||img.hasAttribute('src'))return;
    PlazaRuntime.on(img,'load',()=>{if(img.naturalWidth)img.dataset.stateReady='true';},{once:true});
    img.sizes='(min-width:1051px) 410px, (min-width:701px) 46vw, 86vw';img.srcset=img.dataset.stateSrcset;img.src=img.dataset.stateSrc;
    if(img.complete&&img.naturalWidth)img.dataset.stateReady='true';
   });
  };
  loadStates();PlazaRuntime.on(desktop,'change',loadStates);new MutationObserver(loadStates).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});

  const facts=page.querySelector('.ml-facts');
  if(facts&&!reduced.matches){
   const animate=()=>facts.querySelectorAll('[data-med-count]').forEach(value=>{
    const number=value.querySelector('.ml-counter-number'),target=Number(value.dataset.medCount),format=new Intl.NumberFormat('ru-RU'),started=performance.now(),duration=2200;
    const step=now=>{const t=Math.min((now-started)/duration,1),progress=1-Math.pow(1-t,3);number.textContent=format.format(Math.round(target*progress));number.style.filter=t<1?'blur('+((1-t)*.65).toFixed(2)+'px)':'';if(t<1)PlazaMotion.frame(step);};PlazaMotion.frame(step);
   });
   const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();animate();}},{threshold:.45});observer.observe(facts);
  }

  const rail=page.querySelector('#railDoc');
  if(rail){
   PlazaUI.mountSwipeDrag(rail);
   const cards=[...rail.querySelectorAll(':scope>article')],spacer=document.createElement('div');spacer.className='ml-doctor-spacer';spacer.setAttribute('aria-hidden','true');spacer.inert=true;rail.append(spacer);rail.tabIndex=0;
   let ui,count=0,current=0,perView=6,stride=0;
   const update=()=>{current=Math.max(0,Math.min(count-1,Math.round(rail.scrollLeft/(stride*perView))));ui?.update(current,current===0,current===count-1,count>1);};
   const select=index=>{rail.scrollTo({left:Math.max(0,Math.min(count-1,index))*stride*perView,behavior:reduced.matches?'instant':'smooth'});};
   const measure=()=>{
    perView=Number(getComputedStyle(rail).getPropertyValue('--ml-doctor-columns'))||6;stride=cards[1].offsetLeft-cards[0].offsetLeft;
    const tail=(perView-cards.length%perView)%perView;spacer.hidden=!tail;spacer.style.gridColumn='span '+Math.max(1,tail);
    const nextCount=Math.ceil(cards.length/perView);
    if(count!==nextCount){count=nextCount;ui?.element.remove();ui=PlazaUI.createSliderControls(Array.from({length:count},(_,i)=>`Врачи ${i*perView+1}–${Math.min(cards.length,(i+1)*perView)}`),select,direction=>select(current+direction),{previous:'Предыдущая группа врачей',next:'Следующая группа врачей'});rail.after(ui.element);}
    update();
   };
   PlazaRuntime.on(rail,'scroll',update,{passive:true});PlazaRuntime.on(rail,'keydown',e=>{if(e.target===rail&&['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();select(current+(e.key==='ArrowRight'?1:-1));}});new ResizeObserver(measure).observe(rail);document.fonts?.ready.then(measure);measure();
  }
  window.PlazaPhotoCopy?.mount(page);
 };
 if(document.readyState==='loading')PlazaRuntime.on(document,'DOMContentLoaded',boot,{once:true});else boot();
})();

