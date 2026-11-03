/* Native overflow keeps all real breadcrumb links and structured data intact. */
(()=>{const init=()=>document.querySelectorAll('nav.wellness-breadcrumbs,nav.resort-breadcrumbs').forEach(nav=>{
 if(nav.dataset.plazaBreadcrumbs)return;nav.dataset.plazaBreadcrumbs='scroll';
 let first=true,atEnd=true;
 const fit=()=>{const overflow=nav.scrollWidth>nav.clientWidth+1;nav.tabIndex=overflow?0:-1;nav.setAttribute('aria-label',overflow?'Хлебные крошки — прокрутите влево или вправо':'Хлебные крошки');if(first||atEnd)nav.scrollLeft=nav.scrollWidth-nav.clientWidth;first=false;};
 PlazaRuntime.on(nav,'scroll',()=>{atEnd=nav.scrollWidth-nav.clientWidth-nav.scrollLeft<2;},{passive:true});
 PlazaRuntime.on(nav,'keydown',event=>{if(event.target!==nav)return;const amount=event.key==='ArrowLeft'?-120:event.key==='ArrowRight'?120:0;if(amount){event.preventDefault();nav.scrollBy({left:amount,behavior:'auto'});}});
 fit();document.fonts?.ready.then(fit);if(window.ResizeObserver)new ResizeObserver(fit).observe(nav);
});if(document.readyState==='loading')PlazaRuntime.on(document,'DOMContentLoaded',init,{once:true});else init();})();
