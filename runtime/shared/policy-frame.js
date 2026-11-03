/* Shared policy-frame motion for all three profiles. */
window.PlazaPolicyFrame={
 bind(sheet){
  let animation=null,closing=false;
  const close=()=>{if(!sheet.open||closing)return;closing=true;animation=window.PlazaPolicyFrame.leave(sheet,animation);animation.finished.then(()=>sheet.close()).catch(()=>{});};
  sheet.setAttribute('data-plaza-frame-motion','');
  const psk=document.body.classList.contains('plaza-object-kislovodsk');
  const initial=psk?(sheet.querySelector('h2,h3')||sheet):null;
  if(initial){initial.tabIndex=-1;initial.setAttribute('autofocus','');}

  PlazaRuntime.on(sheet,'cancel',event=>{event.preventDefault();close()});
  PlazaRuntime.on(sheet,'close',()=>{animation?.cancel();animation=null;closing=false;delete sheet.dataset.policyState});
  return {open(){if(sheet.open)return;sheet.showModal();initial?.focus({preventScroll:true});animation=window.PlazaPolicyFrame.enter(sheet);animation.finished.then(()=>{if(closing)return;delete sheet.dataset.policyState;animation.cancel();animation=null}).catch(()=>{});},close};
 },
 enter(sheet){const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;sheet.dataset.policyState='entering';return PlazaMotion.animate(sheet,reduced?[{opacity:0},{opacity:1}]:[{opacity:0,clipPath:'inset(50% 0)'},{opacity:1,clipPath:'inset(0 0)'}],{duration:reduced?100:1400,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'});},
 leave(sheet,previous){const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;sheet.dataset.policyState='leaving';const current=getComputedStyle(sheet),from={opacity:current.opacity,clipPath:current.clipPath==='none'?'inset(0 0)':current.clipPath};previous?.cancel();return PlazaMotion.animate(sheet,reduced?[{opacity:from.opacity},{opacity:0}]:[from,{opacity:from.opacity,clipPath:'inset(42% 0)',offset:.84},{opacity:0,clipPath:'inset(50% 0)'}],{duration:reduced?100:900,easing:'cubic-bezier(.4,0,1,1)',fill:'both'});}
};
