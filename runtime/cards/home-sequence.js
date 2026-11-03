/* Original mountHomeSequence function. Preview uses production provider-error fallback; no provider/prefetch requests. */
(()=>{'use strict';const url=window.PlazaSpecimenContext?.source_url||'';let path;try{path=new URL(url).pathname.replace(/\/+$/,'')}catch{return}if(!['/kislovodsk','/zheleznovodsk'].includes(path))return;
function mountHomeSequence() {
  const root = document.documentElement;
  const form = document.getElementById('plaza-home-search-form');
  const search = form?.closest('.wellness-search');
  if (!search || root.dataset.plazaHomeSequenceMounted) { if (!search) root.classList.remove('plaza-home-sequence'); return; }
  const sections = [];
  for (let node = search.nextElementSibling; node; node = node.nextElementSibling) {
    if (!node.matches('script,style')) sections.push(node);
  }
  const footer = document.querySelector('footer[data-plaza-footer="edges"]');
  if (footer) sections.push(footer);
  const reduced = matchMedia('(prefers-reduced-motion:reduce)');
  let opened = false, fadeTimer = 0, providerTimer = 0, overallTimer = 0, finishing = false, observer;
  const shown = new WeakSet();
  sections.forEach(node => { node.inert = true; });
  function show(node, delay = 0, instant = false) {
    if (shown.has(node)) return;
    shown.add(node); node.classList.add('plaza-home-sequence-shown'); observer?.unobserve(node);
    if (instant || reduced.matches || !node.animate) return;
    try {
      const animation = PlazaMotion.animate(node,[{opacity:0,translate:'0 18px'},{opacity:1,translate:'0 0'}],{duration:450,delay,easing:'cubic-bezier(.22,.61,.36,1)',fill:'both'});
      animation.finished.catch(()=>{}).finally(()=>animation.cancel());
    } catch (error) { /* The visible CSS state remains a safe fallback. */ }
  }
  function visible() {
    let index = 0;
    sections.forEach(node => {
      const rect = node.getBoundingClientRect();
      if (rect.bottom <= 0) show(node,0,true);
      else if (rect.top < innerHeight) show(node,index++ * 120);
    });
  }
  function release() {
    if (opened) return;
    opened = true; clearTimeout(fadeTimer); clearTimeout(providerTimer); clearTimeout(overallTimer);
    root.classList.add('plaza-home-sequence-open');
    sections.forEach(node => { node.inert = false; });
    if (typeof IntersectionObserver === 'function') {
      observer = new IntersectionObserver(entries => {
        let index = 0;
        entries.filter(e=>e.isIntersecting).sort((a,b)=>sections.indexOf(a.target)-sections.indexOf(b.target))
          .forEach(entry=>show(entry.target,index++ * 120));
      }, {threshold:0});
      sections.forEach(node=>observer.observe(node));
      visible();
    } else sections.forEach(node=>show(node,0,true));
  }
  function afterForm() {
    if (finishing || opened) return;
    finishing = true; clearTimeout(providerTimer);
    PlazaMotion.frame(()=>PlazaMotion.frame(()=>{
      if (reduced.matches) { release(); return; }
      // Wait for the actual CSS opacity transition, with a bounded fallback.
      const fades = form.getAnimations?.().filter(a=>a.transitionProperty==='opacity') || [];
      if (fades.length) Promise.allSettled(fades.map(a=>a.finished)).then(release);
      else if (Number(getComputedStyle(form).opacity) >= .999) { release(); return; }
      fadeTimer = setTimeout(release,650);
    }));
  }
  function state() {
    const value = form.dataset.plazaSearchState;
    if (value === 'ready' || value === 'error') afterForm();
    else if (value === 'loading' && !providerTimer && !opened) providerTimer = setTimeout(()=>{
      if (!['ready','error'].includes(form.dataset.plazaSearchState)) form.dataset.plazaSearchState = 'error';
      afterForm();
    },12000);
  }
  new MutationObserver(state).observe(form,{attributes:true,attributeFilter:['data-plaza-search-state']});
  PlazaRuntime.on(document,'focusin',event=>{if(opened) sections.filter(n=>n.contains(event.target)).forEach(n=>show(n,0,true));});
  PlazaRuntime.on(window,'pageshow',()=>{state();if(opened)visible();});
  // Also release if the independent provider loader never reaches "loading".
  overallTimer = setTimeout(()=>{
    if (!['ready','error'].includes(form.dataset.plazaSearchState)) form.dataset.plazaSearchState = 'error';
    afterForm();
  },16000);
  root.dataset.plazaHomeSequenceMounted = 'true';
  state();
}

const boot=()=>{document.documentElement.classList.add('plaza-home-sequence');mountHomeSequence()};if(document.readyState==='loading')PlazaRuntime.on(document,'DOMContentLoaded',boot,{once:true});else boot();})();
