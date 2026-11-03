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
(()=>{
 const footer=document.querySelector('[data-plaza-footer="edges"]');if(!footer)return;
 PlazaRuntime.on(footer.querySelector('[data-plaza-print-page]'),'click',()=>window.print());
 // Native footer sheets share this footer controller; no iframe or copied policy.
 footer.querySelectorAll('[data-plaza-footer-sheet]').forEach(opener=>{
  const sheet=document.getElementById(opener.dataset.plazaFooterSheet);if(!sheet)return;
  const dock=sheet.hasAttribute('data-plaza-credit-dock');
  const policyTrial=!dock;
  const initialFocus=sheet.querySelector('h2,h3');if(initialFocus){initialFocus.tabIndex=-1;initialFocus.setAttribute('autofocus','');}sheet.querySelector('[data-plaza-footer-sheet-close]')?.removeAttribute('autofocus');
  let overflow='',lenis=null,animation=null,closing=false;
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  function place(){
   const a=opener.getBoundingClientRect(),r=sheet.getBoundingClientRect(),gap=16;
   const w=document.documentElement.clientWidth,h=innerHeight;
   const x=Math.max(gap,Math.min(a.left-24,w-r.width-gap));
   const y=Math.max(gap,Math.min(a.top-r.height-gap,h-r.height-gap));
   sheet.style.left=x+'px';sheet.style.top=y+'px';
   sheet.style.transformOrigin=(a.left+a.width/2-x)+'px '+(a.top+a.height/2-y)+'px';
  }
  const folded='perspective(900px) rotateX(-55deg) rotateZ(-8deg) scale(.08,.025)';
  const unfolded='perspective(900px) rotateX(0deg) rotateZ(0deg) scale(1)';
  function reveal(){
   place();sheet.dataset.creditState='entering';
   animation=PlazaMotion.animate(sheet,reduced.matches?[{opacity:0},{opacity:1}]:[
    {opacity:0,transform:folded},
    {opacity:1,transform:'perspective(900px) rotateX(-8deg) rotateZ(1deg) scale(.92,.8)',offset:.65},
    {opacity:1,transform:unfolded}
   ],{duration:reduced.matches?140:560,easing:'cubic-bezier(.16,1,.3,1)',fill:'both'});
   animation.finished.then(()=>{if(closing)return;sheet.dataset.creditState='open';animation.cancel();animation=null}).catch(()=>{});
  }
  function dismiss(){
   if(!sheet.open||closing)return;
   if(policyTrial){
    closing=true;animation=window.PlazaPolicyFrame.leave(sheet,animation);
    animation.finished.then(()=>sheet.close()).catch(()=>{});return;
   }
   if(!dock){sheet.close();return}
   closing=true;sheet.dataset.creditState='leaving';
   const current=getComputedStyle(sheet),from={opacity:current.opacity,transform:current.transform};
   animation?.cancel();
   animation=PlazaMotion.animate(sheet,reduced.matches?[{opacity:from.opacity},{opacity:0}]:[from,{opacity:0,transform:folded}],{duration:reduced.matches?100:420,easing:'cubic-bezier(.55,0,.85,.4)',fill:'both'});
   animation.finished.then(()=>sheet.close()).catch(()=>{});
  }
  if(dock||policyTrial)PlazaRuntime.on(sheet,'cancel',event=>{event.preventDefault();dismiss()});
  if(dock)PlazaRuntime.on(window,'resize',()=>{if(sheet.open&&!closing)place()});
  PlazaRuntime.on(opener,'click',event=>{
   if(!sheet.showModal||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
   event.preventDefault();if(sheet.open)return;
   overflow=document.documentElement.style.overflow;lenis=window.lenis||window.plazaLenis||null;
   lenis?.stop?.();document.documentElement.style.overflow='hidden';
   sheet.showModal();if(dock)reveal();
   if(policyTrial){
    animation=window.PlazaPolicyFrame.enter(sheet);
    animation.finished.then(()=>{if(closing)return;delete sheet.dataset.policyState;animation.cancel();animation=null}).catch(()=>{});
   }
   opener.setAttribute('aria-expanded','true');
   initialFocus?.focus({preventScroll:true});
  });
  PlazaRuntime.on(sheet.querySelector('[data-plaza-footer-sheet-close]'),'click',dismiss);
  PlazaRuntime.on(sheet,'click',event=>{if(event.target!==sheet)return;const r=sheet.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dismiss()});
  PlazaRuntime.on(sheet,'close',()=>{animation?.cancel();animation=null;closing=false;delete sheet.dataset.creditState;delete sheet.dataset.policyState;document.documentElement.style.overflow=overflow;lenis?.start?.();lenis=null;opener.setAttribute('aria-expanded','false');if(opener.getClientRects().length)opener.focus({preventScroll:true})});
 });

 const trigger=footer.querySelector('[data-plaza-footer-map]'),dialog=footer.querySelector('.plaza-footer-map-dialog');if(!trigger||!dialog)return;
 const mapMotion=window.PlazaPolicyFrame.bind(dialog);
 const network=footer.classList.contains('plaza-footer-compact');
 const mobile=matchMedia('(max-width:699px),(max-width:960px) and (max-height:500px)');let previousOverflow='',scrollController=null;
 function close(){mapMotion.close()}
 PlazaRuntime.on(trigger,'click',()=>{
  if((mobile.matches&&!network)||dialog.open)return;
  previousOverflow=document.documentElement.style.overflow;
  scrollController=window.lenis||window.plazaLenis||null;
  if(typeof scrollController?.stop==='function')scrollController.stop();
  document.documentElement.style.overflow='hidden';
  mapMotion.open();window.PlazaUI?.mountDetails();dialog.querySelector('.plaza-sitemap')?.focus({preventScroll:true});trigger.setAttribute('aria-expanded','true');
 });
 PlazaRuntime.on(dialog.querySelector('[data-plaza-footer-map-close]'),'click',close);
 PlazaRuntime.on(dialog,'click',event=>{if(event.target!==dialog)return;const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close()});
 PlazaRuntime.on(dialog,'close',()=>{document.documentElement.style.overflow=previousOverflow;if(typeof scrollController?.start==='function')scrollController.start();scrollController=null;trigger.setAttribute('aria-expanded','false');if(trigger.getClientRects().length)trigger.focus({preventScroll:true})});

 // Shared root navigation walks the tree one level forward, then one level back.
 const bulk=dialog.querySelector('[data-plaza-sitemap-all]');
 if(bulk){
  const nodes=[...dialog.querySelectorAll('.plaza-sitemap-disclosure')];let busy=false,opening=true;
  const depth=node=>{let n=0;for(let p=node.parentElement.closest('details');p;p=p.parentElement.closest('details'))n++;return n};
  const sync=()=>{if(busy)return;const expanded=nodes.every(node=>node.open);if(expanded)opening=false;else if(nodes.every(node=>!node.open))opening=true;bulk.setAttribute('aria-label',opening?'Развернуть следующий уровень карты сайта':'Свернуть один уровень карты сайта');bulk.setAttribute('aria-expanded',String(expanded))};
  nodes.forEach(node=>PlazaRuntime.on(node,'toggle',sync));
  PlazaRuntime.on(bulk,'click',async event=>{
   event.preventDefault();event.stopPropagation();if(busy)return;sync();const open=opening;busy=true;bulk.disabled=true;
   const pending=nodes.filter(node=>node.open!==open);
   const level=(open?Math.min:Math.max)(...pending.map(depth));
   const group=pending.filter(node=>depth(node)===level);
   try{group.forEach(node=>{if(window.PlazaUI?.changeDetails)window.PlazaUI.changeDetails(node,open);else node.open=open});await Promise.all(group.flatMap(node=>node.getAnimations().map(animation=>animation.finished.catch(()=>{}))))}
   finally{busy=false;bulk.disabled=false;sync()}
  });sync();
 }

 PlazaRuntime.on(mobile,'change',()=>{if(mobile.matches&&!network)close()});
})();
