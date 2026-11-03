/* Icons belong to text links only. Maps, headings, cards and controls own their visuals. */
(() => {
 'use strict';
 const init = () => {
 const registry={"gallery":"<svg class=\"pn-menu-icon\" aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.35\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><circle cx=\"8.5\" cy=\"8.5\" r=\"1.5\"/><path d=\"m21 15-5-5L5 21\"/></svg>","medical":"<svg class=\"pn-menu-icon\" aria-hidden=\"true\" focusable=\"false\"\n  xmlns=\"http://www.w3.org/2000/svg\"\n  width=\"24\"\n  height=\"24\"\n  viewBox=\"0 0 24 24\"\n  fill=\"none\"\n  stroke=\"currentColor\"\n  stroke-width=\"1.35\"\n  stroke-linecap=\"round\"\n  stroke-linejoin=\"round\"\n>\n  <path d=\"M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5\" />\n  <path d=\"M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27\" />\n</svg>\n","rooms":"<svg class=\"pn-menu-icon\" aria-hidden=\"true\" focusable=\"false\"\n  xmlns=\"http://www.w3.org/2000/svg\"\n  width=\"24\"\n  height=\"24\"\n  viewBox=\"0 0 24 24\"\n  fill=\"none\"\n  stroke=\"currentColor\"\n  stroke-width=\"1.35\"\n  stroke-linecap=\"round\"\n  stroke-linejoin=\"round\"\n>\n  <path d=\"M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8\" />\n  <path d=\"M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4\" />\n  <path d=\"M12 4v6\" />\n  <path d=\"M2 18h20\" />\n</svg>\n","leisure":"<svg class=\"pn-menu-icon\" aria-hidden=\"true\" focusable=\"false\"\n  xmlns=\"http://www.w3.org/2000/svg\"\n  width=\"24\"\n  height=\"24\"\n  viewBox=\"0 0 24 24\"\n  fill=\"none\"\n  stroke=\"currentColor\"\n  stroke-width=\"1.35\"\n  stroke-linecap=\"round\"\n  stroke-linejoin=\"round\"\n>\n  <path d=\"M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z\" />\n  <path d=\"M7 16v6\" />\n  <path d=\"M13 19v3\" />\n  <path d=\"M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L13 3l-1.4 1.5\" />\n</svg>\n","contacts":"<svg class=\"pn-menu-icon\" aria-hidden=\"true\" focusable=\"false\"\n  xmlns=\"http://www.w3.org/2000/svg\"\n  width=\"24\"\n  height=\"24\"\n  viewBox=\"0 0 24 24\"\n  fill=\"none\"\n  stroke=\"currentColor\"\n  stroke-width=\"1.35\"\n  stroke-linecap=\"round\"\n  stroke-linejoin=\"round\"\n>\n  <path d=\"M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384\" />\n</svg>","booking":"<svg class=\"pn-menu-icon\" aria-hidden=\"true\" focusable=\"false\"\n  xmlns=\"http://www.w3.org/2000/svg\"\n  width=\"24\"\n  height=\"24\"\n  viewBox=\"0 0 24 24\"\n  fill=\"none\"\n  stroke=\"currentColor\"\n  stroke-width=\"1.35\"\n  stroke-linecap=\"round\"\n  stroke-linejoin=\"round\"\n>\n  <path d=\"M8 2v3\" />\n  <path d=\"M16 2v3\" />\n  <rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" />\n  <path d=\"M3 9h18\" />\n  <path d=\"m9 15 2 2 4-4\" />\n</svg>\n","about":"<svg class=\"pn-menu-icon\" aria-hidden=\"true\" focusable=\"false\"\n  xmlns=\"http://www.w3.org/2000/svg\"\n  width=\"24\"\n  height=\"24\"\n  viewBox=\"0 0 24 24\"\n  fill=\"none\"\n  stroke=\"currentColor\"\n  stroke-width=\"1.35\"\n  stroke-linecap=\"round\"\n  stroke-linejoin=\"round\"\n>\n  <path d=\"M10 22v-6.57\" />\n  <path d=\"M12 11h.01\" />\n  <path d=\"M12 7h.01\" />\n  <path d=\"M14 15.43V22\" />\n  <path d=\"M15 16a5 5 0 0 0-6 0\" />\n  <path d=\"M16 11h.01\" />\n  <path d=\"M16 7h.01\" />\n  <path d=\"M8 11h.01\" />\n  <path d=\"M8 7h.01\" />\n  <rect x=\"4\" y=\"2\" width=\"16\" height=\"20\" rx=\"2\" />\n</svg>","spa":"<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.35\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5S12 7 14.5 7 17 5 19.5 5c1.3 0 1.9.5 2.5 1M2 12c.6.5 1.2 1 2.5 1C7 13 7 11 9.5 11s2.5 2 5 2 2.5-2 5-2c1.3 0 1.9.5 2.5 1M2 18c.6.5 1.2 1 2.5 1C7 19 7 17 9.5 17s2.5 2 5 2 2.5-2 5-2c1.3 0 1.9.5 2.5 1\"/></svg>","restaurant":"<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.35\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M4 3v7a2 2 0 0 0 4 0V3M6 3v19M20 22V3c-4 0-4 7-4 10h4\"/></svg>","pin":"<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.35\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0Z\"/><circle cx=\"12\" cy=\"10\" r=\"2.5\"/></svg>","document":"<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.35\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\"><path d=\"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z\"/><path d=\"M14 2v6h6M8 13h8M8 17h8\"/></svg>","plan":"<svg aria-hidden=\"true\" focusable=\"false\" data-lucide=\"box\"\n  xmlns=\"http://www.w3.org/2000/svg\"\n  width=\"24\"\n  height=\"24\"\n  viewBox=\"0 0 24 24\"\n  fill=\"none\"\n  stroke=\"currentColor\"\n  stroke-width=\"1.35\"\n  stroke-linecap=\"round\"\n  stroke-linejoin=\"round\"\n>\n  <path d=\"M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z\" />\n  <path d=\"m3.3 7 8.7 5 8.7-5\" />\n  <path d=\"M12 22V12\" />\n</svg>\n","tour":"<svg aria-hidden=\"true\" focusable=\"false\" data-lucide=\"rotate-3d\"\n  xmlns=\"http://www.w3.org/2000/svg\"\n  width=\"24\"\n  height=\"24\"\n  viewBox=\"0 0 24 24\"\n  fill=\"none\"\n  stroke=\"currentColor\"\n  stroke-width=\"1.35\"\n  stroke-linecap=\"round\"\n  stroke-linejoin=\"round\"\n>\n  <path d=\"m15.194 13.707 3.814 1.86-1.86 3.814\" />\n  <path d=\"M16.47214 7.52786 A 5 10 0 1 0 13 21.79796\" />\n  <path d=\"M21.79796 11 A 10 5 0 1 0 19 15.57071\" />\n</svg>\n","transfer":"<svg aria-hidden=\"true\" focusable=\"false\"\n  class=\"pn-menu-icon lucide lucide-car-front\"\n  xmlns=\"http://www.w3.org/2000/svg\"\n  width=\"24\"\n  height=\"24\"\n  viewBox=\"0 0 24 24\"\n  fill=\"none\"\n  stroke=\"currentColor\"\n  stroke-width=\"1.35\"\n  stroke-linecap=\"round\"\n  stroke-linejoin=\"round\"\n>\n  <path d=\"m21 8-2 2-1.5-3.7A2 2 0 0 0 15.646 5H8.4a2 2 0 0 0-1.903 1.257L5 10 3 8\" />\n  <path d=\"M7 14h.01\" />\n  <path d=\"M17 14h.01\" />\n  <rect width=\"18\" height=\"8\" x=\"3\" y=\"10\" rx=\"2\" />\n  <path d=\"M5 18v2\" />\n  <path d=\"M19 18v2\" />\n</svg>","faq":"<svg aria-hidden=\"true\" focusable=\"false\"\n  class=\"pn-menu-icon lucide lucide-circle-help\"\n  xmlns=\"http://www.w3.org/2000/svg\"\n  width=\"24\"\n  height=\"24\"\n  viewBox=\"0 0 24 24\"\n  fill=\"none\"\n  stroke=\"currentColor\"\n  stroke-width=\"1.35\"\n  stroke-linecap=\"round\"\n  stroke-linejoin=\"round\"\n>\n  <circle cx=\"12\" cy=\"12\" r=\"10\" />\n  <path d=\"M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3\" />\n  <path d=\"M12 17h.01\" />\n</svg>","word":"<svg class=\"pn-menu-icon plaza-content-file-word\" fill=\"currentColor\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 384 512\"><!-- Font Awesome Free 5.15.4 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License) --><path d=\"M224 136V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm57.1 120H305c7.7 0 13.4 7.1 11.7 14.7l-38 168c-1.2 5.5-6.1 9.3-11.7 9.3h-38c-5.5 0-10.3-3.8-11.6-9.1-25.8-103.5-20.8-81.2-25.6-110.5h-.5c-1.1 14.3-2.4 17.4-25.6 110.5-1.3 5.3-6.1 9.1-11.6 9.1H117c-5.6 0-10.5-3.9-11.7-9.4l-37.8-168c-1.7-7.5 4-14.6 11.7-14.6h24.5c5.7 0 10.7 4 11.8 9.7 15.6 78 20.1 109.5 21 122.2 1.6-10.2 7.3-32.7 29.4-122.7 1.3-5.4 6.1-9.1 11.7-9.1h29.1c5.6 0 10.4 3.8 11.7 9.2 24 100.4 28.8 124 29.6 129.4-.2-11.2-2.6-17.8 21.6-129.2 1-5.6 5.9-9.5 11.5-9.5zM384 121.9v6.1H256V0h6.1c6.4 0 12.5 2.5 17 7l97.9 98c4.5 4.5 7 10.6 7 16.9z\"/></svg>","contactPage":"<svg xmlns=\"http://www.w3.org/2000/svg\" class=\"pn-menu-icon plaza-content-contact-page\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.35\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\" focusable=\"false\">\n  <path d=\"M16 2v2\"/>\n  <path d=\"M17.915 22a6 6 0 0 0-12 0\"/>\n  <path d=\"M8 2v2\"/>\n  <circle cx=\"12\" cy=\"12\" r=\"4\"/>\n  <rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"/>\n</svg>"};

 const breadcrumbSelector = '.wellness-breadcrumbs,.resort-breadcrumbs,.breadcrumbs,.breadcrumb,.camera-breadcrumb,[itemtype$="/BreadcrumbList"],[aria-label^="Хлебные крошки"]';
 const excludedContext = [
  'header','footer','dialog','nav','h1','h2','h3','h4','h5','h6','summary',
  '[role="button"]','[role="tab"]','[role="tablist"]','[role="toolbar"]','[role="img"]',
  '.pn-map','.pn-pin','.pn-airport','.pn-menu-compact','#pn-panel',
  '.footer-sitemap','.plaza-sitemap','.leaflet-container','.mapboxgl-map',
  '[data-plaza-content-icons="off"]',breadcrumbSelector
 ].join(',');
 const excludedLink = [
  '.wp-block-button__link','.button','.pa__button','.catalog-price','.comparison-book',
  '.room-photo-link','.consultant-portrait','.card','[data-plaza-card]',
  '.comparison-room-name','.room-price','.price',
  '[role="button"]','[role="tab"]','[aria-controls]','[aria-haspopup]',
  '.hero-camera-link','.hero-tour-link','.pn-quick-link','.tour-link'
 ].join(',');
 const textLink = '.plaza-underline,.plaza-text-link,.plaza-underline-link,.pn-link,.pg-link,.pg-room-label,.ct-download,.map-link,.medical-topic-link,[data-plaza-text-link]';
 const proseContext = 'p,li,dd,dt,td,th,blockquote,figcaption';
 const visualContent = 'img,picture,figure,video,canvas,iframe,h1,h2,h3,h4,h5,h6,div,article,section,ul,ol';
 const arrowSelector = 'svg.external-link-icon,svg.pn-external-arrow,svg.plaza-link-chevron';
 const chevronPath = 'm9 18 6-6-6-6';
 const parse = markup => {
  const template = document.createElement('template');
  template.innerHTML = markup;
  return template.content.firstElementChild;
 };
 function isActionList(list) {
  if (!list?.matches('ul,ol') || list.closest(excludedContext)) return false;
  if (list.className && !list.matches('.wp-block-list,.plaza-action-link-list')) return false;
  const items = [...list.children];
  return !!items.length && items.every(item => {
   if (!item.matches('li')) return false;
   const links = item.querySelectorAll('a[href]');
   if (links.length !== 1 || links[0].querySelector(visualContent) || links[0].matches(excludedLink)) return false;
   const copy = item.cloneNode(true);copy.querySelectorAll('a,svg').forEach(node=>node.remove());
   return !copy.textContent.trim();
  });
 }
 function isTextLink(a) {
  if (a.namespaceURI !== 'http://www.w3.org/1999/xhtml' || !a.closest('main')) return false;
  const item=a.closest('li');
  if (document.body.matches('.plaza-object-kislovodsk,.plaza-object-zheleznovodsk') && item?.parentElement.matches('ul,ol') && !isActionList(item.parentElement)) return false;
  if (a.closest(excludedContext) || a.matches(excludedLink) || a.querySelector(visualContent)) return false;
  const href = (a.getAttribute('href') || '').trim();
  const label = a.textContent.trim();
  if (!href || href === '#' || !label || /^(?:tel:|mailto:|javascript:)/i.test(href)) return false;
  if (/^(?:от\s*)?[\d\s.,]+\s*(?:₽|руб)/i.test(label)) return false;
  return a.matches(textLink) || !!a.closest(proseContext);
 }

 // Media actions share the selected A1 plan / A3 tour geometry, including existing service icons.
 function mediaKind(a){
  // These are seating drawings, not virtual tours of the Panorama restaurant.
  if(a.matches('.psk-ny [data-ny-plan]'))return null;
  let u;try{u=new URL(a.getAttribute('href'),location.href);}catch{return null;}
  const label=(a.getAttribute('aria-label')||'')+' '+a.textContent,path=u.pathname+u.search;
  if(/Room360\/|3Dplan\/|3d-plan/i.test(path)||/3d[\s-]*план/i.test(label))return 'plan';
  if(/3d-tour|panorama/i.test(path)||/(?:виртуальный|3d)[\s-]*тур/i.test(label))return 'tour';
  return null;
 }
 function normalizeMediaIcon(a){
  if(a.closest(breadcrumbSelector))return;
  const kind=mediaKind(a);if(!kind)return;
  const old=a.querySelector('svg:not(.external-link-icon):not(.pn-external-arrow):not(.plaza-link-chevron):not(.hero-tour-arrow):not([data-lucide="external-link"])');
  if(!old||old.dataset.plazaMediaIcon===kind)return;
  const selected=parse(registry[kind]);old.replaceChildren(...selected.childNodes);
  old.setAttribute('viewBox','0 0 24 24');old.setAttribute('fill','none');old.setAttribute('stroke','currentColor');old.setAttribute('data-lucide',kind==='plan'?'box':'rotate-3d');old.dataset.plazaMediaIcon=kind;
  if(old.parentElement===a)a.classList.add('plaza-icon-motion');
  old.parentElement.prepend(old);
 }
 function iconKind(a) {
  const media=mediaKind(a);if(media)return media;
  let url;
  try { url = new URL(a.getAttribute('href'), location.href); } catch { return null; }
  const path = url.pathname + url.hash;
  if (/yandex\.|google\./.test(url.hostname) && /maps/.test(url.pathname)) return 'pin';
  if (document.body.matches('.plaza-object-kislovodsk,.plaza-object-zheleznovodsk') && /\.docx?(?:$|[?#])/i.test(path)) return 'word';
  if (a.hasAttribute('download') || /\.(?:pdf|docx?|xlsx?)(?:$|[?#])/i.test(path)) return 'document';
  const local = url.origin === new URL(location.href).origin || /^(?:resort\.|kislovodsk\.|zheleznovodsk\.)?plaza\.spa$/.test(url.hostname);
  if (!local) return null;
  // Provisional Kislovodsk choices: car-front / circle-help; six-option sheet recorded 27.10.2026.
  if (document.body.classList.contains('plaza-object-kislovodsk')) {
   if (/\/services\/transfer\/?$/.test(url.pathname)) return 'transfer';
   if (/\/about\/faq\/?$/.test(url.pathname)) return 'faq';
  }
  if (!url.hash && /^\/(?:kislovodsk\/?|zheleznovodsk\/?)?$/.test(url.pathname)) return 'about';
  if (/photos|gallery/.test(path)) return 'gallery';
  if (/rooms|compare/.test(path)) return 'rooms';
  if (/medical|programs|medicine|treatment/.test(path)) return 'medical';
  if (/spa|pool|basse/.test(path)) return 'spa';
  if (/restaurant|dining|food/.test(path)) return 'restaurant';
  if (a.hasAttribute('download') || /documents|privacy|\.(?:pdf|docx?|xlsx?)(?:$|[?#])/i.test(path)) return 'document';
  if (document.body.classList.contains('plaza-object-kislovodsk') && /contacts/.test(path)) return 'contactPage';
  if (/about$|about\/|sanatorium/.test(path)) return 'about';
  if (/booking/.test(path)) return 'booking';
  if (/contacts/.test(path)) return 'contacts';
  if (/experience|leisure|services|events/.test(path)) return 'leisure';
  return null;
 }
 // Remove only icons this module creates. Original component SVGs are never adopted or moved.
 function clearGenerated(a) {
  a.querySelectorAll('svg[data-plaza-generated-icon="semantic"]').forEach(icon => icon.remove());
  a.removeAttribute('data-plaza-content-icon');
  if (a.hasAttribute('data-plaza-content-motion')) {
   a.classList.remove('plaza-icon-motion');
   a.removeAttribute('data-plaza-content-motion');
  }
 }
 function normalizeArrows(a) {
  a.querySelectorAll(arrowSelector).forEach(arrow => {
   if (arrow.classList.contains('plaza-link-chevron') && arrow.querySelector('path')?.getAttribute('d') === chevronPath) return;
   arrow.setAttribute('viewBox','0 0 24 24');
   arrow.innerHTML = '<path d="' + chevronPath + '"/>';
   arrow.classList.add('plaza-link-chevron');
  });
 }
 function decorate(a) {
  if(document.body.matches('.plaza-object-kislovodsk,.plaza-object-zheleznovodsk') && a.closest('main')){
   const item=a.closest('li');
   if(item?.parentElement.matches('ul,ol'))item.parentElement.classList.toggle('plaza-action-link-list',isActionList(item.parentElement));
  }
  // A link embedded in prose or labelled data is part of the text, not a separate action.
  if(document.body.classList.contains('plaza-object-kislovodsk')){
   const prose=a.closest(proseContext);
   if(prose){
    const surrounding=prose.cloneNode(true);
    surrounding.querySelectorAll('a,svg').forEach(node=>node.remove());
    if(surrounding.textContent.trim()){
     clearGenerated(a);a.classList.add('plaza-inline-prose-link');return;
    }
   }
  }
  // Bottom actions of swipe cards use their text and existing chevron only.
  if(document.body.classList.contains('plaza-object-kislovodsk') && a.closest('.swipe-rail,.pg-rail,.plaza-program-card') && a.closest('.card-body') && !a.matches('.button,.wp-block-button__link') && !a.querySelector('img,picture')){
   a.querySelectorAll('svg:not(.plaza-link-chevron):not(.external-link-icon):not(.pn-external-arrow)').forEach(icon=>icon.remove());
   clearGenerated(a);a.dataset.plazaContentIcons='off';return;
  }
  normalizeMediaIcon(a);
  if (!isTextLink(a)) { clearGenerated(a); return; }
  const kind = iconKind(a);
  // A contact page is a destination; telephone receivers stay on calling actions.
  if (kind === 'contactPage' && !a.querySelector('svg.plaza-content-contact-page')) {
   clearGenerated(a);
   a.querySelectorAll('svg').forEach(icon=>{if(!icon.matches(arrowSelector))icon.remove();});
  }

  // DOC/DOCX file actions use the requested Word symbol, including old generic file icons.
  if (kind === 'word' && !a.querySelector('svg.plaza-content-file-word')) {
   clearGenerated(a);
   a.querySelectorAll('svg').forEach(icon=>{if(!icon.matches(arrowSelector))icon.remove();});
  }
  if (a.dataset.plazaContentIcon) return;
  // Other existing service/component icons remain exactly where their component put them.
  if ([...a.querySelectorAll('svg')].some(svg => !svg.matches(arrowSelector))) return;
  if (!kind) return;
  normalizeArrows(a);
  const icon = parse(registry[kind]);
  icon.removeAttribute('id');
  icon.classList.add('plaza-content-link-icon');
  icon.setAttribute('data-plaza-generated-icon','semantic');
  icon.setAttribute('aria-hidden','true');
  icon.setAttribute('focusable','false');
  a.prepend(icon);
  if (!a.classList.contains('plaza-icon-motion')) {
   a.classList.add('plaza-icon-motion');
   a.setAttribute('data-plaza-content-motion','');
  }
  a.dataset.plazaContentIcon = 'semantic';
 }
 function mount(node) {
  const parent = node.closest?.('a[href]');
  if (parent) decorate(parent);
  node.querySelectorAll?.('a[href]').forEach(decorate);
 }
 mount(document);
 new MutationObserver(records => {
  for (const record of records) for (const node of record.addedNodes) {
   if (node.nodeType === 1) mount(node);
  }
 }).observe(document.body,{childList:true,subtree:true});
 };
 if (document.readyState === 'loading') PlazaRuntime.on(document,'DOMContentLoaded',init,{once:true});
 else init();
})();
