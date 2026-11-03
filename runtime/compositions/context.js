/* Preview plumbing only. Public source context is injected by the catalog owner.
   No animation, component CSS, business content or production navigation is replaced here. */
(() => {
  'use strict';
  const context = window.PlazaSpecimenContext || {};
  if (context.shell) window.PlazaShell = context.shell;
  if (context.pageMenu) {
    const node = document.createElement('script');
    node.type = 'application/json'; node.id = 'plaza-page-menu-config';
    node.textContent = JSON.stringify({...context.pageMenu,
      baseUrl: context.source_url || context.pageMenu.baseUrl,
      currentURL: context.source_url || context.pageMenu.currentURL});
    document.getElementById(node.id)?.remove(); document.head.append(node);
  }
  if (context.search) {
    const node = document.createElement('script'); node.type = 'application/json'; node.id = 'pks-index';
    node.textContent = JSON.stringify(context.search); document.getElementById(node.id)?.remove(); document.head.append(node);
    const form=document.querySelector('.pks-form');
    if(form&&context.shell?.home)form.setAttribute('action',context.shell.home);
    // action is needed by the original local URL filter, not permission to submit.

  }
  if(context.fireworkLibraryURL){
    const finale=document.querySelector('.psk-ny .ny-finale');
    if(finale)finale.dataset.nyFireworksSrc=context.fireworkLibraryURL;
  }
  window.PlazaSpecimenNavigate = url => {
    let href;
    try { href = new URL(url, context.source_url || 'https://plaza.spa/').href; } catch { return; }
    window.dispatchEvent(new CustomEvent('plaza:previewnavigate', {detail: {url: href}}));
    parent.postMessage({plazaPreview: true, action: 'Открывается на сайте PLAZA', destination: href}, '*');
  };
  // Runtime-captured markup already contains these one-time binding markers.
  // Clear only our known composition markers before running original controllers.
  for (const [selector, attribute] of [
    ['.site-header[data-plaza-header="stable"]', 'data-plaza-header-bound'],
    ['.pg-page', 'data-guide-ready'], ['.al-page', 'data-about-ready'],
    ['.psk-medical', 'data-medical-ready'], ['#med-sheet', 'data-med-info-ready'],
    ['.psk-ny', 'data-ny-ready'], ['.ny-finale', 'data-ny-celebration']
  ]) document.querySelectorAll(selector).forEach(node => node.removeAttribute(attribute));
  // The original header script creates these nodes itself. Don't duplicate a captured open panel.
  if (context.regenerateHeader && document.querySelector('.site-header[data-plaza-header="stable"]')) {
    document.querySelectorAll('#pn-panel,#pn-full-menu,.pn-backdrop').forEach(node => node.remove());
    document.querySelectorAll('.site-header [inert]').forEach(node => node.inert = false);
    document.documentElement.classList.remove('pn-open'); document.body.classList.remove('pn-open');
  }
})();
