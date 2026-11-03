/* Addressed adapters; shared PlazaUI owns disclosure motion and swipe rails. */
(() => {
  'use strict';
  const boot = () => {
    const page = document.querySelector('.al-page');
    if (!page || page.dataset.aboutReady) return;
    page.dataset.aboutReady = 'true';
    const ui = window.PlazaUI;
    page.querySelectorAll('[data-about-rail]').forEach(rail => {
      ui.mountSwipeRail(rail, Array.from(rail.children), {label: 'Виртуальное знакомство с санаторием'});
    });
    // Printed QR links reuse the existing camera/tour modal and its focus/motion contract.
    const openPrintMedia = () => {
      const media = new URLSearchParams(location.search).get('media');
      const selector = media === 'camera' ? '#look .plaza-card-more[href="/kislovodsk/about/camera/"]'
        : media === 'tour' ? '#look .plaza-card-more[data-plaza-tour-dialog]' : null;
      if (selector) page.querySelector(selector)?.click();
    };
    if (document.readyState === 'complete') openPrintMedia();
    else PlazaRuntime.on(window,'load',openPrintMedia,{once:true});
    const documentHash = '#about-information-protection';
    const protection = page.querySelector(documentHash);
    const showProtection = async () => {
      const panel = protection.closest('[role="tabpanel"]');
      const tab = document.getElementById(panel.getAttribute('aria-labelledby'));
      const tabGroup = panel.closest('[data-plaza-tabs]');
      // Wait for the shared tab controller to finish warming images and sliding panels.
      await new Promise(resolve => {
        const ready = () => {
          if (panel.hidden || panel.inert || panel.style.position || tabGroup.hasAttribute('aria-busy')) return;
          observer.disconnect();
          resolve();
        };
        const observer = new MutationObserver(ready);
        observer.observe(tabGroup,{subtree:true,attributes:true,attributeFilter:['hidden','inert','style','aria-busy']});
        tab.click();
        ready();
      });
      const summary = protection.querySelector(':scope>summary');
      if (!protection.open) summary.click();
      await Promise.allSettled([...panel.querySelectorAll('details')].flatMap(item => item.getAnimations()).map(animation => animation.finished));
      // WAAPI finished promises resolve before the shared onfinish clears inline heights.
      await new Promise(resolve => PlazaMotion.frame(() => PlazaMotion.frame(resolve)));
      summary.focus({preventScroll:true});
      protection.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    };
    PlazaRuntime.on(page,'click',event => {
      const link = event.target.closest('[data-about-document-link]');
      if (!link) return;
      event.preventDefault();
      if (location.hash !== documentHash) history.pushState(null,'',documentHash);
      showProtection();
    });
    PlazaRuntime.on(window,'hashchange',() => {if(location.hash === documentHash) showProtection();});
    const restoreDocument = () => {if(location.hash === documentHash) showProtection();};
    if (document.readyState === 'complete') restoreDocument();
    else PlazaRuntime.on(window,'load',restoreDocument,{once:true});

  };
  if(document.readyState==='loading')PlazaRuntime.on(document,'DOMContentLoaded',boot,{once:true});else boot();
})();
