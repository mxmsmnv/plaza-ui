/* Shared internal photo travel: same bounded scroll progress as the photo journal. */
(()=>{'use strict';const frames=[...document.querySelectorAll('[data-plaza-inner-photo]')];if(!frames.length)return;
const media=matchMedia('(prefers-reduced-motion:no-preference)'),active=new Set();let raf=0;
const render=()=>{raf=0;if(document.hidden)return;for(const el of active){const r=el.getBoundingClientRect(),p=Math.max(0,Math.min(1,(innerHeight-r.top)/(innerHeight+r.height))),amount=el.dataset.plazaInnerPhoto==='gallery'?Number(el.dataset.plazaInnerIntensity||.24):(el.dataset.plazaInnerPhoto==='gentle'?.02:.06);if(el.dataset.plazaInnerPhoto==='gallery')el.style.setProperty('--plaza-inner-photo-reserve',(amount*100)+'%');el.style.setProperty('--plaza-inner-photo-y',media.matches?((p-.5)*r.height*amount).toFixed(2)+'px':'0px');}};
const wake=()=>{if(!raf&&!document.hidden)raf=PlazaMotion.frame(render);};
const io=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting)active.add(e.target);else active.delete(e.target);}wake();},{rootMargin:'100px'});frames.forEach(el=>io.observe(el));
PlazaRuntime.on(window,'scroll',wake,{passive:true});PlazaRuntime.on(window,'resize',wake,{passive:true});PlazaRuntime.on(media,'change',wake);PlazaRuntime.on(document,'visibilitychange',wake);wake();})();
