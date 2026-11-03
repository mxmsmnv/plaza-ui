/* Standalone specimen integration: calls the original PlazaUI factories. */
(()=>{'use strict';const boot=()=>{
 window.PlazaUI?.mountDetails();window.PlazaUI?.mountTableCaptions();
 document.querySelectorAll('.swipe-rail').forEach(rail=>{
  const host=rail.closest('[data-carousel]');
  window.PlazaUI?.mountSwipeRail(rail,[...rail.children],host?{host}:{});
 });
};if(document.readyState==='loading')PlazaRuntime.on(document,'DOMContentLoaded',boot,{once:true});else boot();})();
