/* Exact goal pointer/tap handlers and theme image-state loader from medical.js; page-wide tables/navigation omitted. */
(()=>{const boot=()=>{const page=document.querySelector('.psk-medical');if(!page)return;
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


};if(document.readyState==='loading')PlazaRuntime.on(document,'DOMContentLoaded',boot,{once:true});else boot();})();
