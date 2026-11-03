/* Network data adapter: poster pairs only; theme state lives in shared. */
(()=>{'use strict';const root=document.documentElement;const updatePosters=()=>{document.querySelectorAll('.plaza-video-poster[data-pn-poster-night]').forEach(img=>{if(!img.hasAttribute('data-pn-poster-day-srcset')){const partnerImage=img.closest('.pn-poster-layers')?.querySelector('.pn-video-poster-alt');img.setAttribute('data-pn-poster-day-srcset',img.getAttribute('srcset')||'');img.setAttribute('data-pn-poster-night-srcset',partnerImage?.getAttribute('srcset')||'')}const night=root.dataset.theme==='dark',src=img.getAttribute(night?'data-pn-poster-night':'data-pn-poster-day'),alt=img.getAttribute(night?'data-pn-poster-night-alt':'data-pn-poster-day-alt');const set=img.getAttribute(night?'data-pn-poster-night-srcset':'data-pn-poster-day-srcset');if(set)img.setAttribute('srcset',set);else img.removeAttribute('srcset');if(src&&img.getAttribute('src')!==src)img.src=src;if(alt)img.alt=alt;const alternate=img.closest('.pn-poster-layers')?.querySelector('.pn-video-poster-alt'),partner=img.getAttribute(night?'data-pn-poster-day':'data-pn-poster-night');if(alternate&&partner){const partnerSet=img.getAttribute(night?'data-pn-poster-day-srcset':'data-pn-poster-night-srcset');if(partnerSet)alternate.setAttribute('srcset',partnerSet);else alternate.removeAttribute('srcset');if(alternate.getAttribute('src')!==partner)alternate.src=partner}});};PlazaRuntime.on(document,'plaza:themechange',updatePosters);updatePosters()})();

/* Network candidate adapter for the single shared reveal engine. */
(()=>{'use strict';if(!window.PlazaRevealEngine)return;window.PlazaRevealEngine.mount({bodySelector:'body.plaza-network',footerTriggerSelector:'.pn-footer-inner',collect:function({select,addGroup,singleton,contentChildren,collectBooking}){
singleton('.pn-section-label', 'heading');
    select('.pn-property').forEach(function (property) {
      addGroup(property, select('.pn-video-frame',property), 'photo', 0);
      addGroup(property, select('.pn-property-copy',property), 'pairedCopy', 0);
    });
    if(typeof collectBooking==='function')collectBooking();
    singleton('.pn-footer-inner','opacity');
    select('.pn-social').forEach(function(group){addGroup(group,Array.from(group.children),'social',75)});
}});})();
/* Small scroll displacement; the entire map and its links move together. */
/* Map is fixed on every device; no scroll or pointer parallax. */


/* A small warm pool of light follows a mouse on the night atlas. */
(()=>{'use strict';const map=document.querySelector('.pn-map');if(!map)return;const fine=matchMedia('(min-width:1024px) and (hover:hover) and (pointer:fine)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');let frame=0,x=0,y=0;function clear(){map.classList.remove('pn-light-on');if(frame)PlazaMotion.cancelFrame(frame);frame=0}function paint(){frame=0;map.style.setProperty('--light-x',x+'px');map.style.setProperty('--light-y',y+'px')}PlazaRuntime.on(map,'pointermove',e=>{if(e.pointerType!=='mouse'||!fine.matches||reduced.matches||document.documentElement.dataset.theme!=='dark'){clear();return}const r=map.getBoundingClientRect();x=e.clientX-r.left;y=e.clientY-r.top;map.classList.add('pn-light-on');if(!frame)frame=PlazaMotion.frame(paint)});PlazaRuntime.on(map,'pointerleave',clear);PlazaRuntime.on(map,'pointercancel',clear);PlazaRuntime.on(fine,'change',clear);PlazaRuntime.on(reduced,'change',clear);PlazaRuntime.on(window,'pagehide',clear,{once:true});})();

/* PLAZA logo: clockwise orbit, quick acceleration and a continuous gentle coast. */
/* Header logo motion is owned by the shared header controller. */


/* Network footer watercolor moves behind shared glass; stars turn once on mouse/touch. */
(()=>{const init=()=>{const footer=document.querySelector('body.plaza-network #contacts');if(!footer)return;const desktop=matchMedia('(min-width:1024px) and (hover:hover) and (pointer:fine)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');let frame=0;const paint=()=>{frame=0;if(!desktop.matches||reduced.matches){footer.style.setProperty('--pn-wash-scroll','0px');return}const r=footer.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight+220)return;const shift=Math.max(-32,Math.min(32,(innerHeight*.5-r.top)*.08));footer.style.setProperty('--pn-wash-scroll',shift.toFixed(2)+'px')};const schedule=()=>{if(!frame)frame=PlazaMotion.frame(paint)};PlazaRuntime.on(window,'scroll',schedule,{passive:true});PlazaRuntime.on(window,'resize',schedule);PlazaRuntime.on(desktop,'change',schedule);PlazaRuntime.on(reduced,'change',schedule);paint();document.querySelectorAll('.pn-rating-star').forEach(star=>{let turning=null;const spin=()=>{if(reduced.matches||turning)return;turning=PlazaMotion.animate(star,[{transform:'rotateY(0deg)'},{transform:'rotateY(360deg)'}],{duration:1000,easing:'cubic-bezier(.35,0,.25,1)'});star.dataset.spinCount=String(Number(star.dataset.spinCount||0)+1);turning.finished.catch(()=>{}).finally(()=>{turning=null})};PlazaRuntime.on(star,'pointerenter',e=>{if(e.pointerType==='mouse')spin()});PlazaRuntime.on(star,'pointerdown',e=>{if(e.pointerType!=='mouse')spin()});PlazaRuntime.on(reduced,'change',()=>{if(reduced.matches&&turning)turning.cancel()})})};if(document.readyState==='loading')PlazaRuntime.on(document,'DOMContentLoaded',init,{once:true});else init()})();
