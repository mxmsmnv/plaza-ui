

const initPlazaHeader=()=>{

(function(){

const shell=window.PlazaShell; if(!shell)return; const networkMode=shell.property==='plaza';const currentIndex=shell.currentIndex;const hotels=shell.hotels;

// Geometry and content are rendered on the server. Bind behavior only.

const header=document.querySelector('.site-header[data-plaza-header="stable"]');if(!header||header.dataset.plazaHeaderBound)return;

header.dataset.plazaHeaderBound='true';

const brand=header.querySelector('.brand'),nav=header.querySelector('.site-nav'),trigger=header.querySelector('.pn-toggle'),burger=nav?.querySelector('.pn-burger');if(!brand||!trigger||(!networkMode&&(!nav||!burger)))return;

// Exact variant 07 from the approved lab: different opening and closing paths.
function plazaBurgerSetState(open){
 if(!burger)return;
 const bars=[...burger.children];
 const starts=bars.map(bar=>({transform:getComputedStyle(bar).transform,opacity:getComputedStyle(bar).opacity}));
 bars.forEach(bar=>bar.getAnimations().forEach(a=>a.cancel()));
 burger.setAttribute('aria-expanded',String(open));
 if(matchMedia('(prefers-reduced-motion:reduce)').matches||!bars[0].animate)return;
 const style=getComputedStyle(burger),duration=parseFloat(style.getPropertyValue('--plaza-burger-duration'))||700;
 bars.forEach((bar,n)=>{
  let end={transform:open?(n===0?'rotate(45deg)':n===2?'rotate(-45deg)':'translateY(0)'):'translateY('+((n-1)*8)+'px)',opacity:open&&n===1?0:1};
  if(n!==1)end={transform:open?'rotate('+(n===0?225:135)+'deg)':'rotate(360deg) translateY('+((n-1)*8)+'px)',opacity:1};
  PlazaMotion.animate(bar,[starts[n],end],{duration,easing:style.getPropertyValue('--plaza-burger-easing').trim()||'cubic-bezier(.16,1,.3,1)'});
 });
}

const logoMedia=matchMedia('(max-width:700px)');

const backdrop=document.createElement('div');backdrop.className='pn-backdrop';backdrop.dataset.plazaPanel='burger';backdrop.setAttribute('aria-hidden','true');document.body.append(backdrop);

const panel=document.createElement('section');panel.id='pn-panel';panel.className='pn-panel';panel.setAttribute('aria-labelledby','pn-heading');panel.setAttribute('aria-hidden','true');panel.inert=true;

const assets=networkMode?'https://plaza.spa/wp-content/plugins/plaza-network/assets/':'https://resort.plaza.spa/wp-content/plugins/plaza-network/assets/';

const pin='<svg viewBox="0 0 20 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true" focusable="false"><path d="M17 9c0 5-7 12-7 12S3 14 3 9a7 7 0 1 1 14 0Z"/><circle cx="10" cy="9" r="2.4"/></svg>';

const externalArrow='<svg class="pn-external-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 12 12 4M5 4h7v7"/></svg>';

panel.innerHTML='<div class="pn-heading"><h2 id="pn-heading">Выберите свой санаторий</h2><p><a class="pn-network-home plaza-underline" href="https://plaza.spa/" aria-label="Сеть санаториев Плаза Спа — главная сети">Сеть санаториев Плаза Спа</a></p></div><div class="pn-grid">'+hotels.map((h,i)=>{

const menuImage=(url,cls,alt)=>{const info=window.PlazaImages?.[url]||window.PlazaImages?.[decodeURI(url)];const src=info?.src||url;const wide=document.body.matches(".plaza-object-zheleznovodsk,.plaza-object-kislovodsk,.plaza-object-plaza");const attrs=info?.srcset?' srcset="'+info.srcset+'" sizes="(max-width:'+(shell.property==='kislovodsk'?'700':'499')+'px) '+(wide?'calc(100vw - 52px)':'28vw')+', (max-width:1050px) '+(shell.property==='kislovodsk'?'260':'220')+'px, 300px"':'';const image='<img class="'+cls+'" src="'+src+'"'+attrs+' alt="'+alt+'" decoding="async" width="'+(info?.width||768)+'" height="'+(info?.height||512)+'">';return !wide&&info?.thumb?'<picture style="display:contents"><source media="(max-width:499px)" srcset="'+info.thumb+'">'+image+'</picture>':image;};

const images=menuImage(h.day,'pn-day',h.name+' '+h.city+' — дневной фасад')+menuImage(h.night,'pn-night','');

const chosen=!networkMode&&i===currentIndex;

const photo=h.soon?'<div class="pn-photo">'+images+'</div>':'<a class="pn-photo pn-photo-select" href="'+h.url+'" aria-label="'+h.name+' '+h.city+' — перейти на сайт санатория"'+(chosen?' aria-current="page"':'')+'>'+images+'</a>';

return '<article class="pn-card'+(h.soon?' pn-soon-card':'')+'" data-hotel="'+i+'" data-selected="'+chosen+'" aria-label="'+h.name+' '+h.city+(h.soon?' — скоро':'')+'">'+photo+'<div class="pn-caption"><div class="pn-title-row"><h3 class="pn-card-title">'+(h.soon?h.name:'<a class="pn-card-home plaza-underline" href="'+h.url+'" aria-label="'+h.name+' '+h.city+' — перейти на сайт санатория">'+h.name+(shell.property==='kislovodsk'?'<span class="pn-card-city-compact">'+h.city+'</span>':'')+'</a>')+'</h3>'+(networkMode?'<span class="pn-city pn-city-static">'+h.city+'</span>':'')+'<button type="button" class="pn-select" '+(h.soon||chosen?'disabled aria-disabled="true"':'')+' aria-pressed="'+chosen+'" aria-label="'+(h.soon?'Скоро: ':chosen?'Выбрано: ':'Выбрать: ')+h.name+' '+h.city+'">'+(h.soon?'Скоро':chosen?'Выбрано':'Выбрать')+'</button></div>'+(networkMode?'':shell.property==='kislovodsk'?'<span class="pn-city pn-city-static"><span>'+h.city+'</span></span>':'<a class="pn-city" data-plaza-tooltip="Открыть Яндекс Карты в новой вкладке" title="Открыть Яндекс Карты в новой вкладке" href="'+h.map+'" target="_blank" rel="noopener noreferrer" aria-label="'+h.city+' — '+h.name+' на Яндекс Картах, в новой вкладке">'+pin+'<span>'+h.city+'</span>'+externalArrow+'</a>')+'</div></article>';

}).join('')+'</div>';document.body.append(panel);

if(networkMode){const home=panel.querySelector('.pn-network-home');home.textContent='Сеть санаториев Плаза Спа';home.setAttribute('aria-label','Плаза Спа — главная сети');}



panel.querySelectorAll('.pn-card').forEach(card=>{const h=hotels[Number(card.dataset.hotel)];if(!h||h.soon)return;const chosen=card.dataset.selected==='true';card.querySelectorAll('a.pn-photo-select,a.pn-card-home').forEach(link=>{if(chosen){link.removeAttribute('href');link.removeAttribute('target');link.removeAttribute('title');link.setAttribute('aria-disabled','true');link.setAttribute('tabindex','-1');link.setAttribute('aria-label',h.name+' '+h.city+' — текущий санаторий');}else{link.dataset.plazaTooltip=link.matches('.pn-city')?'Открыть «Плаза Спа, '+h.city+'» на Яндекс Картах в новой вкладке':'Перейти на сайт санатория «Плаза Спа», '+h.city;}});});



let fullMenu=null;
if(burger){
fullMenu=document.createElement('section');fullMenu.id='pn-full-menu';fullMenu.className='pn-panel pn-full-menu';fullMenu.setAttribute('aria-label','Навигация');fullMenu.setAttribute('aria-hidden','true');fullMenu.inert=true;fullMenu.innerHTML='';

const compact=document.createElement('nav');compact.className='pn-menu-compact';compact.setAttribute('aria-label','Основные разделы');const items=networkMode?[['Санатории','#sanatoriums'],['На карте','#map'],['Контакты','#contacts']]:[['Номера',shell.home.replace(/\/$/,'')+'/rooms/'],['Медицина',shell.home.replace(/\/$/,'')+'/medical/'],['Услуги',shell.home.replace(/\/$/,'')+'/services/'],['О санатории',shell.home.replace(/\/$/,'')+'/about/'],['Фотогалерея',shell.home.replace(/\/$/,'')+'/about/photos/'],['Контакты',shell.home.replace(/\/$/,'')+'/about/contacts/']];if(!networkMode&&document.body.classList.contains('plaza-object-kislovodsk'))items.push(['Забронировать',shell.home.replace(/\/$/,'')+'/booking/']);items.forEach(item=>{if(item[1].startsWith('#'))item[1]=shell.home+item[1];});const menuIcons={"Фотогалерея":"<svg class=\"pn-menu-icon\" aria-hidden=\"true\" focusable=\"false\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.35\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><circle cx=\"8.5\" cy=\"8.5\" r=\"1.5\"/><path d=\"m21 15-5-5L5 21\"/></svg>","Санатории":"<svg class=\"pn-menu-icon\" aria-hidden=\"true\" focusable=\"false\"\n  xmlns=\"http://www.w3.org/2000/svg\"\n  width=\"24\"\n  height=\"24\"\n  viewBox=\"0 0 24 24\"\n  fill=\"none\"\n  stroke=\"currentColor\"\n  stroke-width=\"1.35\"\n  stroke-linecap=\"round\"\n  stroke-linejoin=\"round\"\n>\n  <path d=\"M10 22v-6.57\" />\n  <path d=\"M12 11h.01\" />\n  <path d=\"M12 7h.01\" />\n  <path d=\"M14 15.43V22\" />\n  <path d=\"M15 16a5 5 0 0 0-6 0\" />\n  <path d=\"M16 11h.01\" />\n  <path d=\"M16 7h.01\" />\n  <path d=\"M8 11h.01\" />\n  <path d=\"M8 7h.01\" />\n  <rect x=\"4\" y=\"2\" width=\"16\" height=\"20\" rx=\"2\" />\n</svg>","На карте":"<svg class=\"pn-menu-icon\" aria-hidden=\"true\" focusable=\"false\"\n  xmlns=\"http://www.w3.org/2000/svg\"\n  width=\"24\"\n  height=\"24\"\n  viewBox=\"0 0 24 24\"\n  fill=\"none\"\n  stroke=\"currentColor\"\n  stroke-width=\"1.35\"\n  stroke-linecap=\"round\"\n  stroke-linejoin=\"round\"\n>\n  <path d=\"M18 8c0 3.613-3.869 7.429-5.393 8.795a1 1 0 01-1.214 0C9.87 15.429 6 11.613 6 8a6 6 0 0112 0\" />\n  <path d=\"M4.474 15h-.197a1 1 0 00-.969.753l-1.097 4.35a1.5 1.5 0 001.444 1.898L20.344 22a1.5 1.5 0 001.446-1.897l-1.098-4.35a1 1 0 00-.969-.753h-.197\" />\n  <circle cx=\"12\" cy=\"8\" r=\"2\" />\n</svg>","Контакты":"<svg class=\"pn-menu-icon\" aria-hidden=\"true\" focusable=\"false\"\n  xmlns=\"http://www.w3.org/2000/svg\"\n  width=\"24\"\n  height=\"24\"\n  viewBox=\"0 0 24 24\"\n  fill=\"none\"\n  stroke=\"currentColor\"\n  stroke-width=\"1.35\"\n  stroke-linecap=\"round\"\n  stroke-linejoin=\"round\"\n>\n  <path d=\"M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384\" />\n</svg>","Лечение":"<svg class=\"pn-menu-icon\" aria-hidden=\"true\" focusable=\"false\"\n  xmlns=\"http://www.w3.org/2000/svg\"\n  width=\"24\"\n  height=\"24\"\n  viewBox=\"0 0 24 24\"\n  fill=\"none\"\n  stroke=\"currentColor\"\n  stroke-width=\"1.35\"\n  stroke-linecap=\"round\"\n  stroke-linejoin=\"round\"\n>\n  <path d=\"M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5\" />\n  <path d=\"M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27\" />\n</svg>\n","Номера":"<svg class=\"pn-menu-icon\" aria-hidden=\"true\" focusable=\"false\"\n  xmlns=\"http://www.w3.org/2000/svg\"\n  width=\"24\"\n  height=\"24\"\n  viewBox=\"0 0 24 24\"\n  fill=\"none\"\n  stroke=\"currentColor\"\n  stroke-width=\"1.35\"\n  stroke-linecap=\"round\"\n  stroke-linejoin=\"round\"\n>\n  <path d=\"M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8\" />\n  <path d=\"M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4\" />\n  <path d=\"M12 4v6\" />\n  <path d=\"M2 18h20\" />\n</svg>\n","Отдых":"<svg class=\"pn-menu-icon\" aria-hidden=\"true\" focusable=\"false\"\n  xmlns=\"http://www.w3.org/2000/svg\"\n  width=\"24\"\n  height=\"24\"\n  viewBox=\"0 0 24 24\"\n  fill=\"none\"\n  stroke=\"currentColor\"\n  stroke-width=\"1.35\"\n  stroke-linecap=\"round\"\n  stroke-linejoin=\"round\"\n>\n  <path d=\"M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z\" />\n  <path d=\"M7 16v6\" />\n  <path d=\"M13 19v3\" />\n  <path d=\"M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L13 3l-1.4 1.5\" />\n</svg>\n","Забронировать":"<svg class=\"pn-menu-icon\" aria-hidden=\"true\" focusable=\"false\"\n  xmlns=\"http://www.w3.org/2000/svg\"\n  width=\"24\"\n  height=\"24\"\n  viewBox=\"0 0 24 24\"\n  fill=\"none\"\n  stroke=\"currentColor\"\n  stroke-width=\"1.35\"\n  stroke-linecap=\"round\"\n  stroke-linejoin=\"round\"\n>\n  <path d=\"M8 2v3\" />\n  <path d=\"M16 2v3\" />\n  <rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\" />\n  <path d=\"M3 9h18\" />\n  <path d=\"m9 15 2 2 4-4\" />\n</svg>\n"};menuIcons["Медицина"]=menuIcons["Лечение"];menuIcons["Услуги"]=menuIcons["Отдых"];menuIcons["О санатории"]=menuIcons["Санатории"];compact.innerHTML=items.map(([text,url])=>'<a href="'+url+'" class="plaza-icon-motion" data-plaza-navigation-row>'+(menuIcons[text]||'')+'<span>'+text+'</span></a>').join('');fullMenu.append(compact);if(networkMode)fullMenu.classList.add('pn-network-menu');document.body.append(fullMenu);
}

let active=null,selected=networkMode?-1:currentIndex,priorInert=[];
const pageMenu=burger&&fullMenu&&window.PlazaPageMenu?window.PlazaPageMenu.attach({header,panel:fullMenu,button:burger}):null;

function position(){const value=Math.max(0,header.getBoundingClientRect().bottom)+'px';if(document.body.style.getPropertyValue('--pn-top')!==value)document.body.style.setProperty('--pn-top',value);if(burger){const right=Math.max(16,document.documentElement.clientWidth-burger.getBoundingClientRect().right)+'px';if(document.body.style.getPropertyValue('--pn-menu-right')!==right)document.body.style.setProperty('--pn-menu-right',right);}}

function close(focus=true,plain=false){if(!active){if(!plain&&pageMenu?.active())pageMenu.close(()=>{});return;}if(!plain&&active.button===burger&&pageMenu?.close(()=>close(focus,true)))return;const old=active;active=null;document.body.classList.remove('pn-open','pn-menu-open');old.panel.setAttribute('aria-hidden','true');old.panel.inert=true;if(old.button===burger)plazaBurgerSetState(false);else old.button.setAttribute('aria-expanded','false');trigger.setAttribute('aria-label',selected<0?'Развернуть выбор санатория':'Развернуть выбор санатория: Плаза СПА '+hotels[selected].city);burger?.setAttribute('aria-label','Открыть полное меню');priorInert.forEach(([el,value])=>{const homeFooter=shell.property==='kislovodsk'&&el.matches('footer[data-plaza-footer="edges"]')&&document.documentElement.classList.contains('plaza-home-sequence-open');el.inert=homeFooter?false:value});priorInert=[];if(focus)old.button.focus({preventScroll:true});}

function show(which,plain=false){if(!plain&&!active&&pageMenu?.active()){pageMenu.close(()=>{if(which.button!==burger)show(which,true)});return;}if(active){const same=active.panel===which.panel;if(!plain&&active.button===burger&&pageMenu?.close(()=>{close(false,true);if(!same)show(which,true)}))return;close(false,true);if(same)return;}if(!plain&&which.button===burger&&pageMenu?.open(()=>show(which,true)))return;backdrop.dataset.plazaPanel=which.button===burger?'burger':'resort';position();active=which;document.body.classList.add('pn-open');document.body.classList.toggle('pn-menu-open',which.button===burger);if(which.button===burger)plazaBurgerSetState(true);else which.button.setAttribute('aria-expanded','true');which.button.setAttribute('aria-label',which.button===trigger?'Свернуть выбор санатория':'Закрыть полное меню');which.panel.setAttribute('aria-hidden','false');which.panel.inert=false;const targets=[...document.querySelectorAll('main,footer'),nav?.querySelector('.nav-links'),brand];priorInert=targets.filter(Boolean).map(el=>[el,el.inert]);priorInert.forEach(([el])=>el.inert=true);}

PlazaRuntime.on(trigger,'click',()=>show({button:trigger,panel}));PlazaRuntime.on(burger,'click',()=>show({button:burger,panel:fullMenu}));PlazaRuntime.on(backdrop,'click',()=>close());

PlazaRuntime.on(document,'click',e=>{if(active&&!active.panel.contains(e.target)&&!trigger.contains(e.target)&&!(burger?.contains(e.target)))close();});

PlazaRuntime.on(document,'keydown',e=>{if(!active)return;if(e.key==='Escape'){e.preventDefault();close();return;}if(e.key==='Tab'){const choices=[trigger,header.querySelector('.pn-header-sun'),burger,header.querySelector('.header-call'),...active.panel.querySelectorAll('button:not(:disabled),a[href]')].filter(el=>el&&el.getClientRects().length);const i=choices.indexOf(document.activeElement);if(e.shiftKey&&i<=0){e.preventDefault();choices.at(-1)?.focus();}else if(!e.shiftKey&&(i===choices.length-1||i<0)){e.preventDefault();choices[0]?.focus();}}});



if(!networkMode){

// Final reference arrangement from PLAZA.SPA privacy-camera.js.

panel.querySelectorAll('.pn-card').forEach(card=>{const row=card.querySelector('.pn-title-row'),city=card.querySelector('.pn-city'),button=card.querySelector('.pn-select');if(row&&city&&button)row.insertBefore(city,button)});

const reveal=document.createElement('a');reveal.href='https://plaza.spa/';reveal.className='pn-reveal-all';reveal.setAttribute('aria-label','Сеть санаториев Плаза Спа — главная сети');reveal.setAttribute('aria-expanded','false');reveal.setAttribute('aria-controls','pn-panel');const mark=header.querySelector('.brand svg')?.cloneNode(true);if(mark){mark.setAttribute('viewBox','0 0 104 104');mark.setAttribute('aria-hidden','true');mark.setAttribute('focusable','false');mark.querySelector('.pn-logo-wordmark')?.remove();const orbit=mark.querySelector('.pn-logo-orbit');if(orbit){orbit.removeAttribute('transform');orbit.removeAttribute('class')}mark.removeAttribute('class');reveal.append(mark)}panel.querySelector('.pn-heading p').append(reveal);

if(shell.property==='zheleznovodsk'){const home=panel.querySelector('.pn-network-home');if(home&&mark){const label=document.createElement('span');label.className='pb-network-full pn-network-label';label.textContent=home.textContent;home.replaceChildren(label);home.href='/';}}



let captionFrame;const fitCaptions=()=>{PlazaMotion.cancelFrame(captionFrame);captionFrame=PlazaMotion.frame(()=>{const cards=[...panel.querySelectorAll('.pn-card')].filter(c=>c.getClientRects().length);const compact=cards.some(c=>{const row=c.querySelector('.pn-title-row'),name=c.querySelector('.pn-card-title'),city=c.querySelector('.pn-city');const width=c.querySelector('.pn-caption').clientWidth;const titleWidth=(name.querySelector('a')||name).getBoundingClientRect().width;const cityWidth=[...city.children].reduce((sum,e)=>sum+e.getBoundingClientRect().width,0)+(city.children.length-1)*parseFloat(getComputedStyle(city).gap||0);return titleWidth+cityWidth+(shell.property==='kislovodsk'?120:85.28)+24>width});panel.classList.toggle('pn-compact-captions',compact)})};new ResizeObserver(fitCaptions).observe(panel);document.fonts?.ready.then(fitCaptions);PlazaRuntime.on(reveal,'click',fitCaptions);fitCaptions();

}

PlazaRuntime.on(panel,'click',e=>{const select=e.target.closest('button.pn-select');if(!select||select.disabled)return;const card=select.closest('.pn-card');if(card.dataset.selected==='true'||card.classList.contains('pn-soon-card'))return;const h=hotels[Number(card.dataset.hotel)];if(h?.url)window.PlazaSpecimenNavigate(h.url);});



const sitemap=document.querySelector('footer .footer-sitemap .footer-nav');

if(sitemap){const groups=[['О санатории','Фото и видео','Онлайн камера','Виртуальный тур'],['Все номера и цены','Стандарт','Люкс'],['Питание и рестораны','Бассейн и СПА-центр','Консьерж','Отдых для детей'],['Все программы','Санаторная программа','Оздоровление','Антистресс','Аюрведа'],['Профиль лечения','Методы лечения','Оборудование','Наши врачи'],['Онлайн-бронирование','Раннее бронирование','Контакты']];sitemap.querySelectorAll('section').forEach((group,index)=>{const keep=groups[index];if(!keep)return;group.querySelectorAll('li').forEach(li=>{const text=li.querySelector('a')?.textContent.trim();li.classList.toggle('pn-mobile-omit',!keep.includes(text));});});

const footerDetails=sitemap.closest('details'),footerSummary=footerDetails.querySelector('summary'),footerContent=footerDetails.querySelector('.footer-sitemap-content');let footerAnimation=null,footerExpanded=footerDetails.open;

PlazaRuntime.on(footerSummary,'click',event=>{if(!logoMedia.matches||!footerContent)return;event.preventDefault();event.stopImmediatePropagation();const from=footerDetails.open?footerContent.getBoundingClientRect().height:0;if(footerAnimation)footerAnimation.cancel();footerExpanded=!footerExpanded;footerDetails.open=true;footerSummary.setAttribute('aria-expanded',String(footerExpanded));footerContent.inert=!footerExpanded;const to=footerExpanded?footerContent.scrollHeight:0;const finish=()=>{footerDetails.open=footerExpanded;footerContent.style.overflow='';footerContent.style.height='';};if(matchMedia('(prefers-reduced-motion:reduce)').matches||!footerContent.animate){finish();return;}footerContent.style.overflow='hidden';const animation=PlazaMotion.animate(footerContent,[{height:from+'px'},{height:to+'px'}],{duration:360,easing:'cubic-bezier(.22,.61,.36,1)',fill:'forwards'});footerAnimation=animation;animation.finished.then(()=>{if(footerAnimation!==animation)return;finish();animation.cancel();footerAnimation=null;}).catch(()=>{});},true);

PlazaRuntime.on(logoMedia,'change',()=>{if(footerAnimation){footerAnimation.cancel();footerAnimation=null;}footerContent.style.overflow='';footerContent.style.height='';footerContent.inert=false;footerDetails.open=footerExpanded;});

}

PlazaRuntime.on(fullMenu,'click',e=>{if(!e.defaultPrevented&&e.target.closest('a[href]'))close(false);});

PlazaRuntime.on(header,'transitionend',event=>{if(event.target===header&&event.propertyName==='transform')position();});if(window.ResizeObserver)new ResizeObserver(position).observe(header);PlazaRuntime.on(window,'resize',position);PlazaRuntime.on(window,'scroll',()=>{if(active)position();},{passive:true});position();

header.querySelectorAll('a[href]').forEach(a=>{const url=new URL(a.href,location.href);if(url.origin===location.origin&&url.pathname===location.pathname&&url.search===location.search&&url.hash)a.setAttribute('href',url.hash);});

})();




};

if(document.readyState==='loading')PlazaRuntime.on(document,'DOMContentLoaded',initPlazaHeader,{once:true});else initPlazaHeader();

(()=>{const init=()=>{const a=document.querySelector('.pn-network-home');if(a&&!a.querySelector('.pb-network-full')){const full=document.createElement('span');full.className='pb-network-full';full.textContent=a.textContent;const emblem=document.querySelector('.site-header .brand svg')?.cloneNode(true);if(emblem&&!document.querySelector('#pn-panel .pn-reveal-all')){emblem.classList.add('pn-network-emblem');emblem.setAttribute('viewBox','0 0 104 104');emblem.setAttribute('aria-hidden','true');emblem.querySelector('.pn-logo-wordmark')?.remove();emblem.querySelector('.pn-logo-orbit')?.removeAttribute('transform');a.replaceChildren(full,emblem)}else a.replaceChildren(full)}};if(document.readyState==='loading')PlazaRuntime.on(document,'DOMContentLoaded',()=>PlazaMotion.frame(init),{once:true});else PlazaMotion.frame(init);if(document.body){new MutationObserver(init).observe(document.body,{childList:true,subtree:true});}else{PlazaRuntime.on(document,'DOMContentLoaded',()=>{new MutationObserver(init).observe(document.body,{childList:true,subtree:true});},{once:true});}})();

