/* PLAZA logo: clockwise orbit, quick acceleration and a continuous gentle coast. */

(() => {

  'use strict';

  function bindOrbit(brand, orbit, cx, cy, loadingAtStart = true) {


  if (!orbit || orbit.dataset.orbitBound) return;
  orbit.dataset.orbitBound="true";



  const reduced = matchMedia('(prefers-reduced-motion:reduce)');

  const fine = matchMedia('(hover:hover) and (pointer:fine)');

  const speed = 240; // degrees per second, clockwise in SVG coordinates

  const acceleration = .14;

  const coast = .80;

  let angle = 0, velocity = 0, lastTime = 0, frame = 0;

  let hovered = false, focused = false;

  let loading = loadingAtStart && document.readyState !== 'complete';

  orbit.dataset.pageLoading = String(loading);



  const active = () => !document.hidden && !reduced.matches && (loading || hovered || focused);

  const paint = () => orbit.setAttribute('transform', 'rotate(' + angle.toFixed(4) + ' '+cx+' '+cy+')');

  function stop() {

    if (frame) PlazaMotion.cancelFrame(frame);

    frame = 0; lastTime = 0; velocity = 0;

  }

  function tick(time) {

    frame = 0;

    if (document.hidden || reduced.matches) { stop(); return; }

    if (!lastTime) lastTime = time;

    const dt = Math.min((time - lastTime) / 1000, .05);

    lastTime = time;

    const target = active() ? speed : 0;

    const tau = target ? acceleration : coast;

    const decay = Math.exp(-dt / tau);

    // Exact integration of velocity: frame rate cannot change the motion curve.

    angle = (angle + target * dt + (velocity - target) * tau * (1 - decay)) % 360;

    velocity = target + (velocity - target) * decay;

    paint();

    if (!target && velocity < .5) { stop(); return; }

    frame = PlazaMotion.frame(tick);

  }

  function start() {

    if (reduced.matches || document.hidden || frame) return;

    lastTime = 0;

    frame = PlazaMotion.frame(tick);

  }

  PlazaRuntime.on(brand,'pointerenter',event => {

    if (event.pointerType !== 'mouse' || !fine.matches) return;

    hovered = true; start();

  });

  PlazaRuntime.on(brand,'pointerleave',() => { hovered = false; });

  PlazaRuntime.on(brand,'pointercancel',() => { hovered = false; });

  PlazaRuntime.on(brand,'focusin',() => {

    focused = brand.matches(':focus-visible');

    if (focused) start();

  });

  PlazaRuntime.on(brand,'focusout',() => { focused = false; });

  function preferenceChanged() {

    if (!fine.matches) hovered = false;

    if (reduced.matches) stop();

    else if (active()) start();

  }

  PlazaRuntime.on(reduced,'change',preferenceChanged);

  PlazaRuntime.on(fine,'change',preferenceChanged);

  PlazaRuntime.on(document,'visibilitychange',() => {

    if (document.hidden) stop();

    else {

      hovered = fine.matches && brand.matches(':hover');

      if (active()) start();

    }

  });

  PlazaRuntime.on(window,'load', () => {

    loading = false;

    orbit.dataset.pageLoading = 'false';

  }, { once: true });

  if (loading) start();

  PlazaRuntime.on(window,'pagehide', stop);

  PlazaRuntime.on(window,'pageshow', event => { if(event.persisted){loading=false;orbit.dataset.pageLoading='false';} if(active())start(); });
  PlazaRuntime.on(document,'click',event=>{
    if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const a=event.target.closest('a[href]');if(!a||a.hasAttribute('download')||(a.target&&a.target!=='_self'))return;
    const url=new URL(a.href,location.href);if(url.origin!==location.origin||!/^https?:$/.test(url.protocol))return;
    if(url.pathname===location.pathname&&url.search===location.search)return;
    queueMicrotask(()=>{if(event.defaultPrevented)return;loading=true;orbit.dataset.pageLoading='true';start();});
  });

  }
  const brand=document.querySelector('.site-header .brand');
  bindOrbit(brand,brand?.querySelector('.pn-logo-orbit'),51.3251,51.9868);
  // User-approved sun settings: stationary inner endpoints, outward growth only.
  function bindSun(sun){
  if(sun.dataset.plazaSunBound)return;sun.dataset.plazaSunBound='true';
  const rays=sun?.querySelector('[data-plaza-sun="dots-outward-v1"]');
  if(sun&&rays){
    const paths=[...rays.querySelectorAll('path')];
    const reduced=matchMedia('(prefers-reduced-motion:reduce)');
    const fine=matchMedia('(hover:hover) and (pointer:fine)');
    let hovered=false,focused=false,length=0,frame=0;
    const paint=value=>{length=value;paths.forEach(path=>path.setAttribute('d','M19 12h'+Math.max(.00001,value).toFixed(5)));};
    function update(){
      if(frame)PlazaMotion.cancelFrame(frame);frame=0;
      const target=(hovered||focused)?2:0;
      if(reduced.matches||document.hidden){paint(target);return;}
      const from=length,start=performance.now();
      function tick(now){
        const t=Math.max(0,Math.min(1,(now-start)/330));
        const eased=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
        paint(from+(target-from)*eased);
        if(t<1)frame=PlazaMotion.frame(tick);else frame=0;
      }
      frame=PlazaMotion.frame(tick);
    }
    PlazaRuntime.on(sun,'pointerenter',event=>{if(event.pointerType==='mouse'&&fine.matches){hovered=true;update();}});
    PlazaRuntime.on(sun,'pointerleave',()=>{hovered=false;update();});
    PlazaRuntime.on(sun,'pointercancel',()=>{hovered=false;update();});
    PlazaRuntime.on(sun,'focusin',()=>{focused=sun.matches(':focus-visible');update();});
    PlazaRuntime.on(sun,'focusout',()=>{focused=false;update();});
    PlazaRuntime.on(reduced,'change',update);
    PlazaRuntime.on(fine,'change',()=>{if(!fine.matches)hovered=false;update();});
    PlazaRuntime.on(document,'visibilitychange',()=>{if(document.hidden){hovered=false;focused=false;}update();});
    PlazaRuntime.on(window,'pagehide',()=>{if(frame)PlazaMotion.cancelFrame(frame);frame=0;hovered=false;focused=false;paint(0);});
    PlazaRuntime.on(window,'pageshow',()=>{hovered=false;focused=false;paint(0);});
    paint(0);
  }
  }
  function mountSuns(){document.querySelectorAll('.plaza-sun-toggle').forEach(bindSun);}
  mountSuns();
  if(document.readyState==='loading')PlazaRuntime.on(document,'DOMContentLoaded',mountSuns,{once:true});
})();
