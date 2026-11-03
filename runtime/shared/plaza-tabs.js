/* Shared PLAZA tabs and sliding segments. Panels opt into motion explicitly. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const positionIndicator = item => {
    if (!item) return;
    const track = item.parentElement;
    const indicator = track.querySelector('.plaza-tabs-indicator');
    const vertical = track.dataset.plazaSegmentAxis === 'vertical';
    if (indicator) {
      indicator.style.width = item.offsetWidth + 'px';
      indicator.style.height = item.offsetHeight + 'px';
      if (track.classList.contains('ml-anchors-in')) indicator.style.top = item.offsetTop + 'px';
      indicator.style.transform = vertical
        ? `translate(${item.offsetLeft}px,${item.offsetTop}px)`
        : `translateX(${item.offsetLeft}px)`;
      indicator.hidden = false;
    }
    if (!vertical && (item.offsetLeft < track.scrollLeft || item.offsetLeft + item.offsetWidth > track.scrollLeft + track.clientWidth)) {
      track.scrollTo({left: Math.max(0,item.offsetLeft - (track.clientWidth - item.offsetWidth)/2),behavior: reduced.matches ? 'instant' : 'smooth'});
    }
  };
  // Tabs, section navigation and the vertical catalogue share one preview controller.
  // Preview never changes selection, panels, location or the scroll position of the page.
  const tracks = new WeakMap();
  const mountSegments = track => {
    if (tracks.has(track)) return tracks.get(track);
    const enabled = document.body.classList.contains('plaza-object-kislovodsk');
    let pointed = null;
    const update = () => positionIndicator(
      (enabled && pointed) ||
      (enabled && track.querySelector('a:focus-visible,[role="tab"]:focus-visible,[data-plaza-segment-item]:focus-visible')) ||
      track.querySelector('[aria-current],[aria-selected="true"],[data-plaza-segment-item][aria-pressed="true"]') ||
      (enabled && track.querySelector('a,[role="tab"],[data-plaza-segment-item]'))
    );
    const controller = {update};
    tracks.set(track,controller);
    PlazaRuntime.on(track,'plaza:segment-change',update);
    PlazaRuntime.on(track,'click',event => {if(event.target.closest('[data-plaza-segment-item]')) PlazaMotion.frame(update);});
    if (enabled) {
      PlazaRuntime.on(track,'pointerover',event => {
        if (event.pointerType === 'touch') return;
        const item = event.target.closest('a,[role="tab"],[data-plaza-segment-item]');
        if (item?.parentElement === track && pointed !== item) {pointed=item;update();}
      });
      PlazaRuntime.on(track,'pointerleave',() => {pointed=null;update();});
      PlazaRuntime.on(track,'focusin',update);
      PlazaRuntime.on(track,'focusout',() => PlazaMotion.frame(update));
    }
    new ResizeObserver(update).observe(track);
    document.fonts?.ready.then(update);
    update();
    return controller;
  };
  const moveIndicator = item => {if (item) mountSegments(item.parentElement).update();};
  document.querySelectorAll('[data-plaza-segments]').forEach(mountSegments);
  document.querySelectorAll('[data-plaza-tabs]').forEach(group => {
    const tabs = [...group.querySelectorAll('[role="tab"]')];
    const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));
    if (!tabs.length || panels.some(panel => !panel)) return;
    const motion = group.dataset.plazaTabsMotion === 'slide';
    const stable = motion && group.dataset.plazaTabsSize === 'stable';
    let viewport;
    if (motion) {
      viewport = document.createElement('div');
      viewport.className = 'plaza-tab-panels';
      panels[0].before(viewport);
      panels.forEach(panel => viewport.append(panel));
    }
    let active = Math.max(0,tabs.findIndex(tab => tab.getAttribute('aria-selected') === 'true'));
    let intent = 0, run = 0, animations = [];
    const clean = () => {
      run++;
      animations.forEach(animation => animation.cancel());
      animations = [];
      panels.forEach((panel,i) => {
        panel.hidden = i !== active;
        panel.inert = i !== active;
        panel.removeAttribute('aria-hidden');
        ['position','inset','width'].forEach(property => panel.style.removeProperty(property));
      });
      viewport?.style.removeProperty('height');
    };
    const warm = panel => Promise.allSettled([...panel.querySelectorAll('img')].map(img => {
      img.loading = 'eager';
      img.fetchPriority = 'low';
      return img.decode();
    }));
    const show = async (index,animate) => {
      const oldIndex = active;
      const startHeight = viewport?.offsetHeight;
      clean();
      const outgoing = panels[oldIndex], incoming = panels[index];
      active = index;
      incoming.hidden = false;
      incoming.inert = false;
      if (!animate || reduced.matches || oldIndex === index) {
        clean();
        window.dispatchEvent(new Event('resize'));
        return;
      }
      const currentRun = ++run;
      const direction = index > oldIndex ? 1 : -1;
      const distance = Math.min(100,viewport.clientWidth * .16);
      outgoing.inert = true;
      outgoing.setAttribute('aria-hidden','true');
      // Reserve the current flow height before both panels become absolute.
      if (!stable) {
        viewport.style.height = startHeight + 'px';
        [outgoing,incoming].forEach(panel => Object.assign(panel.style,{position:'absolute',inset:'0 auto auto 0',width:'100%'}));
      }
      window.dispatchEvent(new Event('resize'));
      await new Promise(PlazaMotion.frame);
      if (run !== currentRun) return;
      const endHeight = incoming.offsetHeight;
      if (!stable) viewport.style.height = endHeight + 'px';
      animations = [
        ...(!stable ? [PlazaMotion.animate(viewport,[{height:startHeight+'px'},{height:endHeight+'px'}],{duration:650,easing:'cubic-bezier(.22,1,.36,1)'})] : []),
        PlazaMotion.animate(outgoing,[{transform:'translateX(0)',opacity:1},{transform:`translateX(${-direction*distance}px) scale(.985)`,opacity:0}],{duration:400,easing:'cubic-bezier(.4,0,.6,1)',fill:'forwards'}),
        PlazaMotion.animate(incoming,[
          {transform:`translateX(${direction*distance}px)`,opacity:0,offset:0,easing:'cubic-bezier(.2,.8,.25,1)'},
          {transform:`translateX(${-direction*6}px)`,opacity:1,offset:.8,easing:'ease-out'},
          {transform:'translateX(0)',opacity:1,offset:1}
        ],{duration:650,easing:'linear',fill:'forwards'})
      ];
      await Promise.allSettled(animations.map(animation => animation.finished));
      if (run !== currentRun) return;
      clean();
      window.dispatchEvent(new Event('resize'));
    };
    const activate = async (index,focus = false) => {
      const request = ++intent;
      tabs.forEach((tab,i) => {
        tab.setAttribute('aria-selected',String(i === index));
        tab.tabIndex = i === index ? 0 : -1;
      });
      if (focus) tabs[index].focus();
      moveIndicator(tabs[index]);
      if (index === active) { clean(); group.removeAttribute('aria-busy'); return; }
      if (motion) {
        group.setAttribute('aria-busy','true');
        // A slow or missing image must not block tab navigation.
        await Promise.race([warm(panels[index]),new Promise(resolve=>setTimeout(resolve,400))]);
        if (request !== intent) return;
      }
      group.removeAttribute('aria-busy');
      show(index,motion);
    };
    group.classList.add('svc-enhanced');
    tabs.forEach((tab,i) => {
      PlazaRuntime.on(tab,'click',() => activate(i));
      if (motion) {
        PlazaRuntime.on(tab,'pointerenter',() => warm(panels[i]),{once:true});
        PlazaRuntime.on(tab,'focus',() => warm(panels[i]),{once:true});
      }
      PlazaRuntime.on(tab,'keydown',event => {
        let next;
        if (event.key === 'ArrowRight') next = (i+1)%tabs.length;
        else if (event.key === 'ArrowLeft') next = (i-1+tabs.length)%tabs.length;
        else if (event.key === 'Home') next = 0;
        else if (event.key === 'End') next = tabs.length-1;
        else return;
        event.preventDefault();
        activate(next,true);
      });
    });
    const selectedTab = () => tabs.find(tab => tab.getAttribute('aria-selected') === 'true');
    PlazaRuntime.on(window,'resize',() => moveIndicator(selectedTab()),{passive:true});
    document.fonts?.ready.then(() => moveIndicator(selectedTab()));
    PlazaRuntime.on(reduced,'change',() => {if (reduced.matches) clean();});
    clean();
    activate(active);
    if (motion) {
      const preload = () => {
        const work = () => panels.forEach(warm);
        if ('requestIdleCallback' in window) requestIdleCallback(work,{timeout:2000});
        else setTimeout(work,0);
      };
      if (document.readyState === 'complete') preload();
      else PlazaRuntime.on(window,'load',preload,{once:true});
    }
  });
})();
