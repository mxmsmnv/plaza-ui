/* Exact numerical-facts odometer from medical.js, without full-page pager/navigation. */
(()=>{const boot=()=>{const page=document.querySelector('.psk-medical');if(!page)return;const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const facts=page.querySelector('.ml-facts');
  if(facts&&!reduced.matches){
   const animate=()=>facts.querySelectorAll('[data-med-count]').forEach(value=>{
    const number=value.querySelector('.ml-counter-number'),target=Number(value.dataset.medCount),format=new Intl.NumberFormat('ru-RU'),started=performance.now(),duration=2200;
    const step=now=>{const t=Math.min((now-started)/duration,1),progress=1-Math.pow(1-t,3);number.textContent=format.format(Math.round(target*progress));number.style.filter=t<1?'blur('+((1-t)*.65).toFixed(2)+'px)':'';if(t<1)PlazaMotion.frame(step);};PlazaMotion.frame(step);
   });
   const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();animate();}},{threshold:.45});observer.observe(facts);
  }


};if(document.readyState==='loading')PlazaRuntime.on(document,'DOMContentLoaded',boot,{once:true});else boot();})();
