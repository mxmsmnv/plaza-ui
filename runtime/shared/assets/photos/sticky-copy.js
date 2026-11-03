/* Same eligibility rule as the established guide hero; native sticky owns travel. */
(()=>{'use strict';if(window.PlazaPhotoCopy)return;
 const mounted=new WeakSet(),media=matchMedia('(min-width:1051px) and (hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)');
 function mount(root=document){
  const hosts=[...(root.matches?.('[data-plaza-photo-copy]')?[root]:[]),...root.querySelectorAll('[data-plaza-photo-copy]')];
  hosts.forEach(host=>{
   if(mounted.has(host))return;const copy=host.querySelector(':scope>[data-plaza-copy-body]'),photo=host.querySelector(':scope>[data-plaza-copy-photo]');if(!copy||!photo)return;mounted.add(host);
   const measure=()=>{const top=(document.querySelector('.site-header')?.offsetHeight||77)+16;const enabled=media.matches&&copy.offsetHeight<innerHeight-top-16&&photo.offsetHeight>copy.offsetHeight;host.dataset.plazaCopySticky=String(enabled);host.style.setProperty('--plaza-copy-top',top+'px');};
   const observer=new ResizeObserver(measure);[copy,photo].forEach(el=>observer.observe(el));PlazaRuntime.on(window,'resize',measure,{passive:true});PlazaRuntime.on(media,'change',measure);document.fonts?.ready.then(measure);measure();
  });
 }
 window.PlazaPhotoCopy={mount};if(document.readyState==='loading')PlazaRuntime.on(document,'DOMContentLoaded',()=>mount(),{once:true});else mount();
})();
